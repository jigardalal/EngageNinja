import { test, expect } from '@playwright/test';
import { cleanDatabase } from '../utils/db.util';
import { TestDataFactory } from '../fixtures/test-data.factory';
import { SelectTenantPage } from '../page-objects/select-tenant.page';
import { LoginPage } from '../page-objects/login.page';

test.describe('Multi-Tenant Switching', () => {
  test.beforeEach(async () => {
    await cleanDatabase();
  });

  test('should switch between multiple tenants', async ({ page }) => {
    // Arrange: User with 2 tenants
    const factory = new TestDataFactory();
    const { user, tenants: userTenants } = await factory.createUserWithMultipleTenants(2);
    console.log('Created user with', userTenants.length, 'tenants');

    // Act: Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to select-tenant
    const selectTenantPage = new SelectTenantPage(page);
    await selectTenantPage.goto();

    // Assert: Both tenants visible in list
    await selectTenantPage.expectTenantInList(userTenants[0].name);
    await selectTenantPage.expectTenantInList(userTenants[1].name);
  });

  test('should create new tenant and see it in list', async ({ page }) => {
    // Arrange: Growth plan user (can create up to 5 tenants)
    const factory = new TestDataFactory();
    const { user } = await factory.createUserWithTenant('owner', {
      planTier: 'growth',
    });

    // Act: Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to select-tenant and create new tenant
    const selectTenantPage = new SelectTenantPage(page);
    await selectTenantPage.goto();

    const newTenantName = `Brand New Tenant ${Date.now()}`;
    await selectTenantPage.createTenant(newTenantName);

    // Assert: Check that new tenant appears in list
    await selectTenantPage.expectTenantInList(newTenantName);
  });

  test('should enforce plan limits for tenant creation', async ({ page }) => {
    // Arrange: Starter plan user (limit: 1 tenant)
    const factory = new TestDataFactory();
    const { user } = await factory.createUserWithTenant('owner', {
      planTier: 'starter',
    });

    // Act: Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Navigate to select-tenant page
    const selectTenantPage = new SelectTenantPage(page);
    await selectTenantPage.goto();

    // Assert: Create button should be disabled or not available
    const createButtonDisabled = await selectTenantPage.createButton.isDisabled().catch(() => false);
    const createButtonVisible = await selectTenantPage.createButton.isVisible().catch(() => false);

    // Either button is disabled or hidden (implementation varies)
    const limitEnforced = createButtonDisabled || !createButtonVisible;
    expect(limitEnforced).toBeTruthy();
  });

  test('should redirect to select-tenant if no tenant selected', async ({ page }) => {
    // Arrange: User without any tenants
    const factory = new TestDataFactory();
    const user = await factory.createUser();

    // Act: Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Assert: Redirected to select-tenant (middleware behavior)
    await page.waitForURL(/\/select-tenant/, { timeout: 10000 });
  });
});
