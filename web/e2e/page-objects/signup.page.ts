import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class SignupPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly tenantNameInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.tenantNameInput = page.getByLabel(/workspace name/i);
    this.submitButton = page.getByRole('button', { name: /create account/i });
  }

  async goto() {
    await super.goto('/signup');
  }

  async signup(email: string, password: string, tenantName: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.tenantNameInput.fill(tenantName);
    await this.submitButton.click();
  }
}
