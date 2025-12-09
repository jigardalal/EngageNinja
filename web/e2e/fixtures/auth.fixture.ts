import { test as base, Page } from '@playwright/test';
import { TestDataFactory, TestUserWithTenant } from './test-data.factory';
import { LoginPage } from '../page-objects/login.page';

export interface AuthFixtures {
  authenticatedPage: Page;
  testData: TestUserWithTenant;
  starterPlanPage: Page;
  starterPlanData: TestUserWithTenant;
  growthPlanPage: Page;
  growthPlanData: TestUserWithTenant;
  userWithoutTenant: { email: string; password: string };
}

async function createAuthenticatedPage(
  page: Page,
  testData: TestUserWithTenant,
) {
  // Use the LoginPage object to properly authenticate
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(testData.user.email, testData.user.password);

  // Wait for navigation to dashboard (indicates successful login)
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  console.log('[Auth] Login succeeded, navigated to', page.url());

  // Make sure at least one API call succeeds to settle auth state
  // This ensures cookies are properly propagated before test starts
  try {
    await page.waitForResponse(
      (response) =>
        response.url().includes('/current-user') && response.status() === 200,
      { timeout: 5000 }
    );
    console.log('[Auth] Current user API call succeeded');
  } catch {
    console.log('[Auth] No current user API call detected, but login was successful');
  }

  // Wait an extra moment for cookies to fully settle
  await page.waitForTimeout(1000);

  // Page now has all necessary cookies from the successful login
  return page;
}

export const test = base.extend<AuthFixtures>({
  testData: async ({}, use) => {
    const factory = new TestDataFactory();
    const data = await factory.createUserWithTenant('owner');
    await use(data);
  },

  authenticatedPage: async ({ page, testData }, use) => {
    await createAuthenticatedPage(page, testData);
    await use(page);
  },

  starterPlanData: async ({}, use) => {
    const factory = new TestDataFactory();
    const data = await factory.createUserWithTenant('owner', {
      planTier: 'starter',
    });
    await use(data);
  },

  starterPlanPage: async ({ page, starterPlanData }, use) => {
    await createAuthenticatedPage(page, starterPlanData);
    await use(page);
  },

  growthPlanData: async ({}, use) => {
    const factory = new TestDataFactory();
    const data = await factory.createUserWithTenant('owner', {
      planTier: 'growth',
    });
    await use(data);
  },

  growthPlanPage: async ({ page, growthPlanData }, use) => {
    await createAuthenticatedPage(page, growthPlanData);
    await use(page);
  },

  userWithoutTenant: async ({}, use) => {
    const factory = new TestDataFactory();
    const user = await factory.createUser();
    await use(user);
  },
});

export { expect } from '@playwright/test';
