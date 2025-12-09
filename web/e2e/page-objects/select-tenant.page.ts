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
    await super.goto('/select-tenant');
    // Wait for page to hydrate and API to load
    // Wait for form to be visible (this means hydration is done)
    await this.page.locator('label').filter({ hasText: /workspace name/i }).first().waitFor({ state: 'visible', timeout: 10000 });
    // Wait for either tenants to load or "Loading" text to disappear
    await this.page.locator('text=Loading tenant list').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => null);
  }

  async createTenant(name: string) {
    await this.tenantNameInput.fill(name);
    await this.createButton.click();
  }

  async getTenantCards() {
    return this.page.locator('article').all();
  }

  async expectTenantInList(tenantName: string) {
    // Debug: log current page content
    const articles = await this.page.locator('article').all();
    if (articles.length === 0) {
      const pageText = await this.page.textContent('body');
      console.log('❌ No tenant articles found. Page text:', pageText?.substring(0, 500));
    } else {
      console.log('✓ Found', articles.length, 'tenant cards');
      for (const article of articles) {
        const text = await article.textContent();
        console.log('  - Card:', text?.substring(0, 100));
      }
    }

    const card = this.page.locator('article', { hasText: tenantName });
    await card.waitFor({ state: 'visible', timeout: 5000 });
  }
}
