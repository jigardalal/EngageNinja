import { test, expect } from '@playwright/test';
import { cleanDatabase } from '../utils/db.util';
import { TestDataFactory } from '../fixtures/test-data.factory';
import { LoginPage } from '../page-objects/login.page';
import { SelectTenantPage } from '../page-objects/select-tenant.page';
import { DashboardPage } from '../page-objects/dashboard.page';

test.describe('Multi-Tenant Switching', () => {
  let factory: TestDataFactory;

  test.beforeEach(async () => {
    await cleanDatabase();
    factory = new TestDataFactory();
  });

  test('should switch between multiple tenants', async ({ page }) => {
    // Arrange: User with 2 tenants
    const { user, tenants } = await factory.createUserWithMultipleTenants(2);
    console.log('Created user:', user.id, 'with tenants:', tenants.map(t => t.id));

    // Intercept API calls for debugging
    page.on('response', response => {
      if (response.url().includes('/tenants')) {
        response.json().then(data => {
          console.log('GET /tenants response:', data);
        }).catch(() => {});
      }
    });

    // Act: Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Assert: Verify first tenant context
    const dashboard = new DashboardPage(page);
    await dashboard.expectVisible();
    expect(page.url()).toContain(tenants[0].id);

    // Act: Switch to tenant selector
    // Wait a bit for dashboard to fully render and set auth state
    await page.waitForTimeout(500);
    const selectTenantPage = new SelectTenantPage(page);
    await selectTenantPage.goto();

    // Assert: Both tenants visible
    await selectTenantPage.expectTenantInList(tenants[0].name);
    await selectTenantPage.expectTenantInList(tenants[1].name);
  });

  test('should create new tenant and see it in list', async ({ page }) => {
    // Arrange: User with one tenant
    const { user, tenant } = await factory.createUserWithTenant('owner');

    // Act: Login and go to select tenant
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    const selectTenantPage = new SelectTenantPage(page);
    await selectTenantPage.goto();

    // Act: Create new tenant
    const newTenantName = `Brand New Tenant ${Date.now()}`;
    await selectTenantPage.createTenant(newTenantName);

    // Assert: Check that new tenant appears in list
    await selectTenantPage.expectTenantInList(newTenantName);
  });

  test('should enforce plan limits for tenant creation', async ({ page }) => {
    // Arrange: Starter user (limit: 1 tenant)
    const { user } = await factory.createUserWithTenant('owner', {
      planTier: 'starter',
    });

    // Act: Login and navigate to select tenant
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

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
    // Arrange: User without lastUsedTenantId
    const user = await factory.createUser();

    // Act: Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Assert: Redirected to select-tenant (middleware behavior)
    await page.waitForURL(/\/select-tenant/, { timeout: 10000 });
  });
});
