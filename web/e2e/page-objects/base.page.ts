import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string = '') {
    const baseUrl = process.env.E2E_WEB_URL || 'http://localhost:3001';
    await this.page.goto(`${baseUrl}${path}`);
  }

  async waitForUrl(urlPattern: string | RegExp) {
    await this.page.waitForURL(urlPattern);
  }

  async getErrorMessage(): Promise<string | null> {
    const error = this.page.locator('text=/error|invalid|failed/i').first();
    const isVisible = await error.isVisible().catch(() => false);
    return isVisible ? error.textContent() : null;
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}
