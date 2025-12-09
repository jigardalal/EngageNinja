import { test as base, Page } from '@playwright/test';
import { TestDataFactory, TestUserWithTenant } from './test-data.factory';

export interface AuthFixtures {
  authenticatedPage: Page;
  testData: TestUserWithTenant;
}

export const test = base.extend<AuthFixtures>({
  testData: async ({}, use) => {
    const factory = new TestDataFactory();
    const data = await factory.createUserWithTenant('owner');
    await use(data);
  },

  authenticatedPage: async ({ page, testData }, use) => {
    const apiUrl = process.env.E2E_API_URL || 'http://localhost:3000';

    // Login via API to get cookies
    const response = await page.request.post(`${apiUrl}/auth/login`, {
      data: {
        email: testData.user.email,
        password: testData.user.password,
      },
    });

    if (!response.ok()) {
      throw new Error(`Auth failed: ${response.status()}`);
    }

    // Playwright automatically sets httpOnly cookies from API response
    // Add tenant_id cookie explicitly (API should set it, but ensure it's present)
    await page.context().addCookies([
      {
        name: 'tenant_id',
        value: testData.tenant.id,
        domain: 'localhost',
        path: '/',
        sameSite: 'Lax',
      },
    ]);

    await use(page);
  },
});

export { expect } from '@playwright/test';
