# Playwright E2E Tests

Tests critical user flows: signup, login, tenant switching, plan limits.

## Just Run The Tests (3 Commands)

**Terminal 1:**
```bash
cd api && pnpm run start:dev
```

**Terminal 2:**
```bash
cd web && pnpm run dev
```

**Terminal 3:**
```bash
cd web && pnpm run test:e2e:ui
```

That's it. Tests execute in the UI. You'll see them pass/fail in real-time.

## Common Commands

```bash
cd web

# Run tests (headless)
pnpm run test:e2e

# Run tests with UI (can see browser)
pnpm run test:e2e:ui

# Debug - step through code
pnpm run test:e2e:debug

# View test results report
pnpm run test:e2e:report

# Run one test file
pnpm exec playwright test tests/auth.spec.ts

# Run tests matching a pattern
pnpm exec playwright test -g "should login"
```

## What Tests Cover

**9 tests total** - all critical paths users actually take:

| Flow | Tests | File |
|------|-------|------|
| **Signup & Login** | 5 tests | `auth.spec.ts` |
| **Tenant Switching** | 4 tests | `tenant-switching.spec.ts` |
| **Campaigns** (stubs) | 2 tests | `campaign-send.spec.ts` |

**Expected to pass:** All 9 in <5 minutes

## Writing Your Own Test

Copy the pattern:

```typescript
import { test, expect } from '@playwright/test';
import { cleanDatabase } from '../utils/db.util';
import { TestDataFactory } from '../fixtures/test-data.factory';
import { LoginPage } from '../page-objects/login.page';

test.describe('My Feature', () => {
  let factory: TestDataFactory;

  test.beforeEach(async () => {
    await cleanDatabase();
    factory = new TestDataFactory();
  });

  test('should do something', async ({ page }) => {
    // Setup: Create test user
    const { user, tenant } = await factory.createUserWithTenant();

    // Act: Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Assert
    await page.waitForURL(/\/dashboard/);
    expect(page.url()).toContain(tenant.id);
  });
});
```

**Key points:**
- `beforeEach` cleans database and creates fresh test data
- Use factory methods: `createUser()`, `createTenant()`, `createUserWithTenant()`
- Use page objects for UI: `LoginPage`, `SignupPage`, `SelectTenantPage`, `DashboardPage`
- One test = one user behavior
- No CSS selectors (use `getByRole()`, `getByLabel()`, `locator()`)

## Debugging a Failing Test

**Option 1: Run with UI (easiest)**
```bash
pnpm run test:e2e:ui
```
Click the test name and watch it execute. You can pause, inspect elements, see what failed.

**Option 2: Debug mode**
```bash
pnpm run test:e2e:debug
```
Opens Playwright Inspector. Step through line-by-line, inspect DOM, evaluate JavaScript.

**Option 3: Check the report**
```bash
pnpm run test:e2e:report
```
Opens HTML report showing failures, screenshots, videos, traces.

## If Something Breaks

| Problem | Fix |
|---------|-----|
| **"Connection refused"** | Make sure API is running (`cd api && pnpm run start:dev`) |
| **"Cannot find element"** | Check if element exists in UI. Run with `--ui` to see what's happening. |
| **"Test timeout"** | API might be slow. Check if API is responding (`curl http://localhost:3000/health`). |
| **"Database error"** | Restart everything. Database gets locked sometimes. Stop all terminals and run the 3 commands again. |
| **"Tests pass locally but fail in CI"** | Check that you're not using `test.only()` or `test.skip()`. These prevent other tests from running. |

**Still stuck?** Run with `--ui` and watch the test execute. You'll see exactly what's failing.

## When to Add Tests

Add a test when:
- ✅ You fix a bug (add test so it doesn't come back)
- ✅ You build a new user flow (test it end-to-end)
- ✅ You refactor something critical (test protects your refactor)

Don't add tests for:
- ❌ Every form validation (unit tests handle this)
- ❌ Visual styling (that's what manual QA is for)
- ❌ Edge cases that can't happen (trust your types)

## File Reference

**Run tests from here:**
```
web/
├── e2e/
│   ├── tests/          ← Your test files go here
│   ├── page-objects/   ← Use these for UI interactions
│   ├── fixtures/       ← Use for test data (don't edit)
│   └── utils/          ← Use for database helpers (don't edit)
```

**To write a test:** Copy pattern from `tests/auth.spec.ts`

**To add UI interaction:** Add method to page object (e.g., `LoginPage`)

**To create test data:** Use factory methods (e.g., `factory.createUserWithTenant()`)

## Common Patterns

**Create a user and login:**
```typescript
const { user, tenant } = await factory.createUserWithTenant();
const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login(user.email, user.password);
```

**Create multiple tenants for one user:**
```typescript
const { user, tenants } = await factory.createUserWithMultipleTenants(2);
```

**Verify page content:**
```typescript
const dashboard = new DashboardPage(page);
await dashboard.expectVisible();
expect(page.url()).toContain(tenantId);
```

**Find elements (in order of preference):**
```typescript
// Best - accessible, semantic
page.getByRole('button', { name: /send/i })
page.getByLabel(/email/i)

// Good - explicit
page.locator('article', { hasText: 'Tenant Name' })

// Fallback - only if necessary
page.locator('[data-testid="save-button"]')

// Bad - brittle, never use
page.locator('button:nth-child(3)')
page.locator('.css-abc123')
```
