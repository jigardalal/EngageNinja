import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly heading: Locator;
  readonly tenantSwitcher: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    this.tenantSwitcher = page.locator('[data-testid="tenant-switcher"]');
  }

  async goto(tenantId?: string) {
    const path = tenantId ? `/dashboard?tenantId=${tenantId}` : '/dashboard';
    await super.goto(path);
  }

  async expectVisible() {
    await this.heading.waitFor({ state: 'visible' });
  }

  async isVisible(): Promise<boolean> {
    return this.heading.isVisible().catch(() => false);
  }
}
