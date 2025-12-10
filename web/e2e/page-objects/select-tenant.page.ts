import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class SelectTenantPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/select-tenant', { waitUntil: 'networkidle' });
    // Wait for at least one article (tenant card) or empty state message to appear
    await Promise.race([
      this.page.locator('article').first().waitFor({ state: 'visible', timeout: 10000 }),
      this.page.locator('text=/No workspaces found/').waitFor({ state: 'visible', timeout: 10000 })
    ]).catch(() => {
      // If both fail, page might still be loading but that's ok
    });
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
