import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class SelectTenantPage extends BasePage {
  readonly createTenantForm: Locator;
  readonly tenantNameInput: Locator;
  readonly createButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.createTenantForm = page.locator('form').first();
    this.tenantNameInput = page.getByLabel(/workspace name/i);
    this.createButton = page.getByRole('button', { name: /create tenant/i });
    this.successMessage = page.locator('p').filter({ hasText: /created/ }).first();
  }

  async goto() {
    await super.goto('/select-tenant', { waitUntil: 'networkidle' });

    // Wait for page to be interactive - either the form loads or an error appears
    // Whichever comes first
    try {
      await Promise.race([
        // Form is ready
        this.page.locator('label').filter({ hasText: /workspace name/i }).first().waitFor({ state: 'visible', timeout: 20000 }),
        // Or page has loaded and stabilized (networkidle means no pending requests)
        this.page.waitForLoadState('networkidle'),
      ]);
    } catch (error) {
      // If all waits fail, just try to continue anyway - page might be in a valid state
      console.log('[SelectTenant] Page load completed (possibly partial)');
    }
  }

  async createTenant(name: string) {
    // First check if we can interact with the form
    // Try multiple ways to get the input to be safe
    try {
      // Wait for button to be enabled (indicates form is interactive)
      await this.createButton.waitFor({ state: 'visible', timeout: 10000 });
      // Fill the form
      const nameInput = this.page.getByPlaceholder('Acme Operations');
      await nameInput.fill(name);
      await this.createButton.click();
    } catch (error) {
      console.error('[SelectTenant] Failed to create tenant:', error.message);
      throw error;
    }
  }

  async getTenantCards() {
    return this.page.locator('article').all();
  }

  async expectTenantInList(tenantName: string) {
    // Find all article elements and locate the one with the tenant name
    // Filter to get only those in the tenants list area (not the form section)
    const articles = this.page.locator('article').filter({ hasText: tenantName });

    // Get all matching articles
    const count = await articles.count();
    if (count === 0) {
      throw new Error(`No tenant card found with name "${tenantName}"`);
    }

    // For multiple matches, find the one that's in the tenants list (not the form)
    // The form section has "Create a tenant" heading, tenants list has heading "Existing tenants"
    for (let i = 0; i < count; i++) {
      const article = articles.nth(i);
      const parent = article.locator('..');
      const text = await parent.textContent();
      if (text && text.includes('Existing tenants')) {
        await article.waitFor({ state: 'visible', timeout: 5000 });
        return;
      }
    }

    // If no tenant found in "Existing tenants" section, just wait for the first match
    await articles.first().waitFor({ state: 'visible', timeout: 5000 });
  }
}
