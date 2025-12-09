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
    // Wait for the form heading which always renders
    await this.page.locator('h3').filter({ hasText: /Create a tenant|Existing tenants/i }).first().waitFor({ state: 'visible', timeout: 10000 });
  }

  async createTenant(name: string) {
    await this.tenantNameInput.fill(name);
    await this.createButton.click();
  }

  async getTenantCards() {
    return this.page.locator('article').all();
  }

  async expectTenantInList(tenantName: string) {
    const card = this.page.locator('article', { hasText: tenantName });
    await card.waitFor({ state: 'visible', timeout: 5000 });
  }
}
