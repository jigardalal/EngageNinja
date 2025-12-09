# E2E Tests Quick Start Guide

## 🚀 Run Tests in 3 Commands

### Step 1: Start API (Terminal 1)
```bash
cd /Users/jigs/Code/EngageNinja/api
pnpm run start:dev
```
Wait for: "Listening on port 3000"

### Step 2: Start Web (Terminal 2)
```bash
cd /Users/jigs/Code/EngageNinja/web
pnpm run dev
```
Wait for: "ready - started server on 0.0.0.0:3001"

### Step 3: Run Tests (Terminal 3)
```bash
cd /Users/jigs/Code/EngageNinja/web
pnpm run test:e2e:ui
```

This opens the interactive Playwright UI where you can:
- Watch tests execute in real-time
- Step through individual tests
- Inspect DOM elements
- See test logs

---

## Test Results

You should see:
- ✅ 5 authentication tests passing
- ✅ 4 multi-tenant tests passing
- ✅ 2 campaign stub tests (skipped)

**Total execution time:** <5 minutes

---

## View Results

After tests complete:
```bash
pnpm run test:e2e:report
```

This opens an HTML report with:
- Test summary
- Detailed failures (if any)
- Screenshots on failure
- Video recordings on failure
- Traces for debugging

---

## Debug Mode

To step through tests with inspector:
```bash
pnpm run test:e2e:debug
```

This opens Playwright Inspector where you can:
- Pause/resume execution
- Step through line by line
- Evaluate JavaScript in console
- Modify DOM live
- Inspect network requests

---

## Run Specific Tests

```bash
# Auth tests only
pnpm exec playwright test tests/auth.spec.ts

# Tenant tests only
pnpm exec playwright test tests/tenant-switching.spec.ts

# Single test
pnpm exec playwright test tests/auth.spec.ts -g "should login existing user"
```

---

## Test What's Ready

### Already Implemented ✅
- Signup flow
- Login flow
- Tenant switching
- Multi-tenant management
- Plan enforcement
- Authentication guards

### Ready When UI Ready ⏳
- Campaign creation
- Resend workflows
- Template selection
- Delivery tracking

---

## Architecture

```
Test Flow:
1. global-setup.ts → Clean database
2. beforeEach → Create test data (factories)
3. Test runs → User interactions (page objects)
4. afterEach → Database cleanup
5. global-teardown.ts → Final cleanup
```

### Page Objects
- `LoginPage` - Handle login
- `SignupPage` - Handle signup
- `SelectTenantPage` - Manage tenants
- `DashboardPage` - Verify dashboard
- `BasePage` - Common utilities

### Test Data Factories
- `TestDataFactory` - Create users, tenants, relationships
- Auto-generates unique emails
- Auto-hashes passwords
- Handles multi-tenant scenarios

---

## Prerequisites Check

Before running tests, verify:

```bash
# Database running?
psql postgresql://engageninja:engageninja@localhost:5433/engageninja -c "SELECT 1"

# API running?
curl http://localhost:3000/health

# Web running?
curl http://localhost:3001
```

All should return success.

---

## Troubleshooting

### "Connection refused" on tests
```bash
→ Make sure API is running: pnpm run start:dev (in api/)
→ Make sure Web is running: pnpm run dev (in web/)
```

### "Database connection error"
```bash
→ Check DATABASE_URL in web/e2e/.env.e2e
→ Verify PostgreSQL is running: docker ps | grep postgres
```

### "Tests timeout"
```bash
→ Check API health: curl http://localhost:3000/health
→ Check Web running: curl http://localhost:3001
→ Increase timeouts in playwright.config.ts if needed
```

---

## What Gets Tested

### Authentication (5 tests)
- User signup with redirect
- User login with redirect
- Invalid credentials rejection
- Authenticated user redirect from login
- Protected route access control

### Multi-Tenancy (4 tests)
- Switch between tenants
- Create new tenant
- Enforce plan limits
- Redirect when no tenant selected

### Total: 9 Tests + 2 Future Stubs

---

## Files You Can Review

```
web/e2e/
├── README.md              ← Full documentation
├── SETUP.md              ← Setup checklist
├── tests/auth.spec.ts    ← Auth test examples
├── tests/tenant-switching.spec.ts  ← Multi-tenant examples
├── page-objects/         ← UI interaction patterns
├── fixtures/             ← Test data patterns
└── utils/               ← Database utilities
```

---

## Common Commands Reference

```bash
cd web

# Run all tests
pnpm run test:e2e

# Interactive UI (recommended first time)
pnpm run test:e2e:ui

# Debug with inspector
pnpm run test:e2e:debug

# Run tests headless with browser visible
pnpm run test:e2e:headed

# View test report
pnpm run test:e2e:report

# Run specific test
pnpm exec playwright test tests/auth.spec.ts
```

---

## Next Steps After First Run

1. ✅ Review test output in UI
2. ✅ Check HTML report
3. ✅ Review test code in web/e2e/tests/
4. ✅ Understand page object patterns
5. ✅ Understand test data factory patterns
6. ✅ Plan to implement campaign tests when UI ready

---

## Architecture Pattern Examples

### How Tests Create Data
```typescript
const { user, tenant } = await factory.createUserWithTenant('owner');
// Auto-generates unique email
// Auto-hashes password
// Creates DB entries
// Sets lastUsedTenantId
```

### How Tests Login
```typescript
const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login(user.email, user.password);
```

### How Tests Verify
```typescript
const dashboard = new DashboardPage(page);
await dashboard.expectVisible();
```

---

## Success Indicators

You'll know tests are working when:
- ✅ 9 tests pass in <5 minutes
- ✅ Database is clean between tests
- ✅ Screenshots/videos captured on failure
- ✅ HTML report generated successfully
- ✅ No flaky failures

---

## Support

1. Check `web/e2e/README.md` for detailed docs
2. Review test files for code examples
3. Use `--debug` mode to step through
4. Check HTML report for failure details
5. Review playwright-report/ artifacts

---

**Ready to run? Execute the 3 commands above! 🚀**
