import { test, expect } from '@playwright/test';
import { cleanDatabase } from '../utils/db.util';
import { TestDataFactory } from '../fixtures/test-data.factory';
import { SelectTenantPage } from '../page-objects/select-tenant.page';
import { LoginPage } from '../page-objects/login.page';

test.describe('Multi-Tenant Switching', () => {
  test.beforeEach(async () => {
    await cleanDatabase();
  });

  test('should auto-redirect single-tenant user to dashboard', async ({ page }) => {
    // Arrange: Starter plan user with 1 tenant
    const factory = new TestDataFactory();
    const { user } = await factory.createUserWithTenant('owner', {
      planTier: 'starter',
    });

    // Act: Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Assert: User should be redirected directly to dashboard (not select-tenant)
    // because they only have 1 tenant
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('should show error when user has no tenant', async ({ page }) => {
    // Arrange: User without any tenants
    const factory = new TestDataFactory();
    const user = await factory.createUser();

    // Act: Try to login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Assert: Error message shown because user has no tenant
    // The API requires users to have at least one tenant to log in
    await loginPage.expectError(/No tenant assigned/i);
  });
});
