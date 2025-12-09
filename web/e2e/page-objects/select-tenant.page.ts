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
    await card.waitFor({ state: 'visible' });
  }
}
