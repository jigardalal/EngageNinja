import { expect } from '@playwright/test';
import { cleanDatabase } from '../utils/db.util';
import { test } from '../fixtures/auth.fixture';
import { TestDataFactory } from '../fixtures/test-data.factory';
import { SelectTenantPage } from '../page-objects/select-tenant.page';
import { LoginPage } from '../page-objects/login.page';

test.describe('Multi-Tenant Switching', () => {
  test.beforeEach(async () => {
    await cleanDatabase();
  });

  test('should switch between multiple tenants', async ({ authenticatedPage, testData }) => {
    // Arrange: Create second tenant for the authenticated user
    const factory = new TestDataFactory();
    const secondTenant = await factory.createTenantForUser(testData.user.id, 'owner');

    // Act: Use authenticated page (pre-authenticated with fixture)
    // Give the page a moment to settle after login before navigating
    await authenticatedPage.waitForTimeout(500);
    const selectTenantPage = new SelectTenantPage(authenticatedPage);
    await selectTenantPage.goto();

    // Assert: Both tenants visible in list
    await selectTenantPage.expectTenantInList(testData.tenant.name);
    await selectTenantPage.expectTenantInList(secondTenant.name);
  });

  test('should create new tenant and see it in list', async ({ growthPlanPage }) => {
    // Arrange: Using growth plan user (limit: 5 tenants, 1 already exists)

    // Act: Go to select tenant and create new tenant
    // Give the page a moment to settle after login before navigating
    await growthPlanPage.waitForTimeout(500);
    const selectTenantPage = new SelectTenantPage(growthPlanPage);
    await selectTenantPage.goto();

    const newTenantName = `Brand New Tenant ${Date.now()}`;
    await selectTenantPage.createTenant(newTenantName);

    // Assert: Check that new tenant appears in list
    await selectTenantPage.expectTenantInList(newTenantName);
  });

  test('should enforce plan limits for tenant creation', async ({ starterPlanPage }) => {
    // Arrange: Using starter plan user fixture (limit: 1 tenant)

    // Act: Navigate to select tenant page (already authenticated)
    // Give the page a moment to settle after login before navigating
    await starterPlanPage.waitForTimeout(500);
    const selectTenantPage = new SelectTenantPage(starterPlanPage);
    await selectTenantPage.goto();

    // Assert: Create button should be disabled or not available
    const createButtonDisabled = await selectTenantPage.createButton.isDisabled().catch(() => false);
    const createButtonVisible = await selectTenantPage.createButton.isVisible().catch(() => false);

    // Either button is disabled or hidden (implementation varies)
    const limitEnforced = createButtonDisabled || !createButtonVisible;
    expect(limitEnforced).toBeTruthy();
  });

  test('should redirect to select-tenant if no tenant selected', async ({ page, userWithoutTenant }) => {
    // Arrange: User without any tenants

    // Act: Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(userWithoutTenant.email, userWithoutTenant.password);

    // Assert: Redirected to select-tenant (middleware behavior)
    await page.waitForURL(/\/select-tenant/, { timeout: 10000 });
  });
});
