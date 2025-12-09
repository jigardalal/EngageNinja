# Playwright E2E Tests for EngageNinja

Comprehensive end-to-end tests covering critical user flows for authentication, multi-tenancy, and tenant management.

## Quick Start

### Prerequisites

1. **Running Services** - Ensure both API and Web are running:
   ```bash
   # Terminal 1: Start API
   cd api && pnpm run start:dev

   # Terminal 2: Start Web
   cd web && pnpm run dev
   ```

2. **Database** - PostgreSQL must be running with the test database created:
   ```bash
   # The `.env.e2e` uses: postgresql://engageninja:engageninja@localhost:5433/engageninja
   ```

### Running Tests Locally

```bash
cd web

# Run all tests
pnpm run test:e2e

# Run with interactive UI (recommended for debugging)
pnpm run test:e2e:ui

# Run specific test file
pnpm exec playwright test tests/auth.spec.ts

# Debug mode (step through with inspector)
pnpm run test:e2e:debug

# View HTML report
pnpm run test:e2e:report
```

## Test Coverage

### Authentication Tests (`tests/auth.spec.ts`)
- ✅ Signup new user and redirect to dashboard
- ✅ Login existing user and redirect to dashboard
- ✅ Reject invalid credentials
- ✅ Redirect authenticated user away from login page
- ✅ Require authentication for protected routes

### Multi-Tenant Tests (`tests/tenant-switching.spec.ts`)
- ✅ Switch between multiple tenants
- ✅ Create new tenant and see in list
- ✅ Enforce plan limits for tenant creation
- ✅ Redirect to select-tenant if no tenant selected

### Campaign Tests (`tests/campaign-send.spec.ts`)
- ⏳ Send first campaign and view delivery status (stub)
- ⏳ Trigger resend to non-readers (stub)

## Architecture

### Directory Structure
```
e2e/
├── fixtures/              # Test fixtures and factories
│   ├── auth.fixture.ts   # Auth state management
│   └── test-data.factory.ts # User/tenant factories
├── page-objects/          # Page Object Model
│   ├── base.page.ts      # Base page class
│   ├── login.page.ts
│   ├── signup.page.ts
│   ├── select-tenant.page.ts
│   └── dashboard.page.ts
├── tests/                 # Test files
│   ├── auth.spec.ts
│   ├── tenant-switching.spec.ts
│   └── campaign-send.spec.ts
├── utils/                 # Test utilities
│   └── db.util.ts        # Database helpers
├── playwright.config.ts   # Playwright configuration
├── global-setup.ts       # Pre-suite database cleanup
├── global-teardown.ts    # Post-suite cleanup
└── .env.e2e              # E2E environment variables
```

### Key Components

#### Test Data Factory (`fixtures/test-data.factory.ts`)
Creates isolated test data with proper relationships:
- `createUser()` - Create user with hashed password
- `createTenant()` - Create tenant with settings
- `createUserWithTenant()` - User + tenant + relationship
- `createUserWithMultipleTenants()` - Multi-tenant scenarios

#### Database Utilities (`utils/db.util.ts`)
- `getPrismaClient()` - Singleton Prisma instance
- `cleanDatabase()` - Truncate tables between tests
- `hashPassword()` - bcrypt wrapper
- `disconnectPrisma()` - Cleanup hook

#### Page Objects
Encapsulate UI interactions with stable selectors:
- **BasePage** - Common methods (goto, waitForUrl, etc.)
- **LoginPage** - Email/password form interactions
- **SignupPage** - Signup form interactions
- **SelectTenantPage** - Tenant creation and listing
- **DashboardPage** - Dashboard navigation and verification

## Selector Strategy

Tests use semantic selectors prioritized as:
1. **`getByRole()`** - Accessible role-based queries
2. **`getByLabel()`** - Form labels
3. **`data-testid`** - Explicit test attributes for dynamic content
4. **Never:** CSS selectors, XPath, or nth-child

## Environment Configuration

**File:** `.env.e2e`
```bash
E2E_WEB_URL=http://localhost:3001
E2E_API_URL=http://localhost:3000
DATABASE_URL=postgresql://engageninja:engageninja@localhost:5433/engageninja
TEST_PASSWORD=Test123!Aa
```

## Troubleshooting

### Tests fail with database connection error
```bash
# Check database URL in .env.e2e
echo $DATABASE_URL

# Verify PostgreSQL is running
docker ps | grep postgres

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Auth fixture fails
```bash
# Verify API is running on port 3000
curl http://localhost:3000/health

# Check API logs for errors
# Ensure JWT_SECRET is set in API .env
```

### Tests timeout
```bash
# Increase action/navigation timeouts in playwright.config.ts
actionTimeout: 15000  # default 10000
navigationTimeout: 45000  # default 30000

# Check network inspector for slow API calls
# Run with --headed flag to see browser: pnpm run test:e2e:headed
```

### Flaky tests
```bash
# Run with trace recording to inspect failures
# Increase worker count in config (default 1 for DB safety)
# Use proper waits: waitForURL, waitForSelector (not sleep)
```

## Best Practices

### Writing Tests
- ✅ Test user behavior, not implementation details
- ✅ Use one assertion per test for clear failures
- ✅ Arrange-Act-Assert pattern
- ✅ Reuse fixtures and page objects
- ✅ Use proper waits (waitForURL, waitForSelector)

### Maintaining Tests
- ✅ Keep test count low (9 critical tests)
- ✅ Use semantic selectors first
- ✅ Update selectors only if UI changes significantly
- ✅ Add data-testid only for dynamic/list content
- ✅ Review test failures - don't ignore them

### Performance
- ✅ Tests run sequentially (single worker) for DB safety
- ✅ Database cleanup prevents cross-test pollution
- ✅ Auth fixture reuses login across tests
- ✅ Total runtime: <5 minutes locally

## CI/CD Integration

GitHub Actions workflow (`.github/workflows/e2e-tests.yml`):
- Runs on manual trigger
- Daily schedule (2am UTC)
- Starts PostgreSQL service
- Installs dependencies
- Seeds database
- Starts API and Web servers
- Runs all tests
- Uploads reports and artifacts

### Enabling CI/CD
Currently manual trigger. To enable on every PR:
```yaml
on:
  pull_request:
    branches: [main]
```

## Future Enhancements

1. **Campaign UI Tests** - Implement when campaign UI ready
2. **Visual Regression** - Screenshot comparison testing
3. **API Mocking** - Mock WhatsApp/Email providers
4. **Cross-browser** - Add Firefox, Safari
5. **Accessibility** - Axe-core integration
6. **Performance** - Lighthouse integration

## Adding New Tests

1. Create new test file in `tests/`
2. Import page objects and factory
3. Use `test.beforeEach()` to clean database and create test data
4. Follow Arrange-Act-Assert pattern
5. Use page objects for UI interactions

Example:
```typescript
import { test, expect } from '@playwright/test';
import { TestDataFactory } from '../fixtures/test-data.factory';
import { DashboardPage } from '../page-objects/dashboard.page';

test.describe('New Feature', () => {
  let factory: TestDataFactory;

  test.beforeEach(async () => {
    await cleanDatabase();
    factory = new TestDataFactory();
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const { user, tenant } = await factory.createUserWithTenant();

    // Act
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // Assert
    expect(await dashboard.isVisible()).toBeTruthy();
  });
});
```

## Debug Mode

Run tests with inspector:
```bash
pnpm run test:e2e:debug
```

This opens Playwright Inspector where you can:
- Step through test execution
- Inspect elements
- Evaluate JavaScript
- Modify DOM in real-time

## Reporting

HTML reports are generated automatically:
```bash
# View latest report
pnpm run test:e2e:report

# Reports saved to: web/playwright-report/
```

Reports include:
- Test summary (passed/failed/skipped)
- Detailed failure reasons
- Traces and videos on failure
- Screenshots on failure

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review test output and HTML report
3. Run with `--debug` flag to inspect
4. Check `playwright-report/` for artifacts
