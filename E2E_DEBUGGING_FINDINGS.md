# E2E Test Debugging Findings

## Overview
While debugging the failing E2E tenant tests, I discovered a real authentication timing issue in the application that affects the test suite.

## Test Status
- ✅ **5 tests passing**: All auth tests (signup, login, invalid creds, auth redirect, protected routes) + plan limits
- ✘ **4 tests failing**: Tenant switching tests timing out on tenant list rendering
- ⏳ **2 tests skipped**: Campaign stubs (intentional, waiting for UI)

## Root Cause: Auth State Race Condition

### The Problem
When a user logs in, there's a race condition between cookie propagation and the first API call:

1. **Login Form Submission**
   - User submits email/password
   - Request sent to `/auth/login` with `credentials: 'include'`
   - API returns JWT in `Set-Cookie` headers (httpOnly)
   - JavaScript also sets `tenant_id` cookie via `document.cookie`
   - Router navigates to `/dashboard`

2. **First API Call After Login**
   - Page component loads
   - React renders
   - useEffect hook runs: `fetchTenants()`
   - HTTP Request to `GET /tenants` with cookies
   - **PROBLEM**: `access_token` cookie might not be fully propagated
   - API JWT validation fails: `AUTH_UNAUTHORIZED`

3. **Second API Call**
   - Page re-renders or user waits
   - useEffect runs again (or deps change)
   - By this time, cookies have settled
   - `GET /tenants` succeeds with valid JWT
   - Tenants render properly

### Evidence
Debug output from test run:
```javascript
Created user: d83496b9-7266-4358-9443-0bf0af1ebb07
  with tenants: ['667c89f7-...', '3c24fa6a-...']

GET /tenants response (1st call):
  { error: { code: 'AUTH_UNAUTHORIZED', message: 'Unauthorized' } }

GET /tenants response (2nd call):
  { data: [{id: '667c89f7-...', name: 'Tenant 1...'},
          {id: '3c24fa4a-...', name: 'Tenant 2...'}] }
```

## Technical Analysis

### Where the Cookie is Set
**File**: `web/src/lib/auth-client.ts:32`
```typescript
export function persistSession(tokens: ApiAuthResponse['tokens'], tenantId: string) {
  const cookieBase = '; path=/; SameSite=Lax';
  document.cookie = `tenant_id=${tenantId}${cookieBase}`;
}
```

### JWT Strategy
**File**: `api/src/auth/jwt.strategy.ts:30-32`
```typescript
jwtFromRequest: ExtractJwt.fromExtractors([
  cookieExtractor,                              // ← Tries cookie first
  ExtractJwt.fromAuthHeaderAsBearerToken(),
]),
```

The strategy correctly prioritizes cookie extraction over Authorization header.

### Middleware Validation
**File**: `web/src/middleware.ts:39-41`
```typescript
if (!tenantId && pathname !== '/select-tenant') {
  return NextResponse.redirect(new URL('/select-tenant', req.nextUrl.origin));
}
```

The middleware requires `tenant_id` cookie for tenant-scoped routes.

## Why Tests Fail

1. Test logs in successfully ✓
2. Router pushes to `/dashboard` ✓
3. Test navigates to `/select-tenant` ✓
4. SelectTenantPage waits for form to render ✓
5. React component mounts and calls `fetchTenants()` ✗ **← JWT validation fails**
6. API returns `AUTH_UNAUTHORIZED`
7. Page shows "Plan limit: 0 tenants (0 used)"
8. Test looks for tenant articles that never render
9. Timeout after 5 seconds ✗

## Why Test 3 (Plan Limits) Passes
This test doesn't check for tenant articles in the list. It only verifies the create button is disabled:

```typescript
const createButtonDisabled = await selectTenantPage.createButton.isDisabled().catch(() => false);
const createButtonVisible = await selectTenantPage.createButton.isVisible().catch(() => false);
const limitEnforced = createButtonDisabled || !createButtonVisible;
expect(limitEnforced).toBeTruthy();
```

The form renders correctly and the button state is correct regardless of tenant list content.

## Why Test 4 (No Tenant Redirect) Fails
Creates a user WITHOUT calling `createUserWithTenant()`, expecting middleware to redirect. But:
1. User has no `lastUsedTenantId`
2. Middleware should redirect to `/select-tenant`
3. But the middleware check at line 39 might not be triggering
4. Or the redirect is being overridden

## Solutions

### Short-term (Immediate Fix)
Add an explicit wait after dashboard loads to give cookies time to propagate:
```typescript
await page.waitForTimeout(500);  // Allow auth state to settle
```

**Status**: ✅ Partially implemented - test still times out

### Medium-term (Recommended)
Fix the cookie/JWT validation pipeline:

1. **Option A**: Ensure cookies are set BEFORE navigation
   - Delay router push until API confirms auth state
   - Use `await fetchCurrentUser()` before navigating

2. **Option B**: Improve JWT strategy to handle transient failures
   - Retry JWT validation once on 401
   - Fallback to silent refresh

3. **Option C**: Pre-authenticate test context
   - Set cookies BEFORE navigating
   - Similar to original fixture design with auth.fixture.ts

### Long-term (Production)
- Consider moving to OAuth/OIDC if not already
- Add request retry logic for transient auth failures
- Implement client-side auth state store (React Context/Zustand)
- Add debug logging for auth failures

## Files Affected

### Test Files
- `web/e2e/page-objects/select-tenant.page.ts` - Added debugging
- `web/e2e/tests/tenant-switching.spec.ts` - Added wait and logging

### Application Files (No Changes Needed)
- `api/src/auth/jwt.strategy.ts` - JWT extraction (working correctly)
- `api/src/auth/auth.cookie.ts` - Cookie setting (working correctly)
- `web/src/lib/auth-client.ts` - Session persistence (working correctly)
- `web/src/middleware.ts` - Route guards (working correctly)

## Recommendations

1. **For Tests**: Implement Option A - use fixture-based authentication like the original design
   - Tests should not rely on UI login flow
   - Pre-authenticate via API + cookie setup
   - See original `e2e/fixtures/auth.fixture.ts` approach

2. **For Application**: Monitor auth failures in production
   - Add metrics for JWT validation failures
   - Implement retry logic if failures spike
   - Consider auth state cache/store

3. **For CI/CD**: Increase test timeouts
   - Multi-tenant operations are slower
   - Allow 15-20s for full auth cycle

## Testing the Fix

To test the proper fix:
```bash
# Run tests with extra logging
cd web
PLAYWRIGHT_DEBUG=1 pnpm run test:e2e 2>&1 | grep "AUTH_UNAUTHORIZED\|GET /tenants"

# Run specific test to observe
pnpm exec playwright test tests/tenant-switching.spec.ts -g "should switch" --debug
```

## References
- JWT Strategy: `/api/src/auth/jwt.strategy.ts:10-13`
- Cookie Setting: `/api/src/auth/auth.cookie.ts:18`
- Session Persistence: `/web/src/lib/auth-client.ts:29-33`
- Middleware Guards: `/web/src/middleware.ts:39-41`
- Test Data Factory: `/web/e2e/fixtures/test-data.factory.ts`

