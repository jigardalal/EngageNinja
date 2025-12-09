import { test, expect } from '@playwright/test';
import { cleanDatabase } from '../utils/db.util';
import { TestDataFactory } from '../fixtures/test-data.factory';
import { LoginPage } from '../page-objects/login.page';
import { SignupPage } from '../page-objects/signup.page';
import { DashboardPage } from '../page-objects/dashboard.page';

test.describe('Authentication Flow', () => {
  let factory: TestDataFactory;

  test.beforeEach(async () => {
    await cleanDatabase();
    factory = new TestDataFactory();
  });

  test('should signup new user and redirect to dashboard', async ({ page }) => {
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    const email = `newuser-${Date.now()}@example.com`;
    const password = 'Test123!Aa';
    const tenantName = 'My New Workspace';

    await signupPage.signup(email, password, tenantName);

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    const dashboard = new DashboardPage(page);
    await dashboard.expectVisible();
  });

  test('should login existing user and redirect to dashboard', async ({ page }) => {
    // Arrange: Create user with tenant
    const { user, tenant } = await factory.createUserWithTenant('owner');

    // Act: Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Assert: Redirected to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    const dashboard = new DashboardPage(page);
    await dashboard.expectVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    // Arrange: Create user
    const { user } = await factory.createUserWithTenant('owner');

    // Act: Login with wrong password
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, 'WrongPassword123!');

    // Assert: Error message shown, stays on login page
    await expect(page).toHaveURL(/\/login/);
    const errorShown = await loginPage.expectError(/invalid|incorrect/i);
    expect(errorShown).toBeTruthy();
  });

  test('should redirect authenticated user away from login page', async ({ page }) => {
    // Arrange: Create and login user
    const { user, tenant } = await factory.createUserWithTenant('owner');
    const apiUrl = process.env.E2E_API_URL || 'http://localhost:3000';

    const response = await page.request.post(`${apiUrl}/auth/login`, {
      data: { email: user.email, password: user.password },
    });
    expect(response.ok()).toBeTruthy();

    // Set tenant cookie
    await page.context().addCookies([
      {
        name: 'tenant_id',
        value: tenant.id,
        domain: 'localhost',
        path: '/',
        sameSite: 'Lax',
      },
    ]);

    // Act: Try to visit login page
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Assert: Redirected to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should require authentication for protected routes', async ({ page }) => {
    // Act: Try to access dashboard without auth
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // Assert: Redirected to login
    await page.waitForURL(/\/login/, { timeout: 10000 });
  });
});
