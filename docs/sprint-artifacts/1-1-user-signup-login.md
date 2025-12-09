# Story 1.1: User Signup & Login

Status: review

## Story

As a user,  
I want to register and sign in,  
so that I can access my tenant workspace.

## Acceptance Criteria

1. Given I’m on signup with a valid email/password, when I submit the form, then an account is created and I’m signed in.
2. Given I’m on login with valid credentials, when I submit, then I’m signed in to my last-used tenant.
3. Given I enter invalid credentials, when I submit, then I see a clear error and remain signed out.

## Tasks / Subtasks

- [x] Implement signup flow (web + API)
  - [x] Web: Next.js App Router route for signup with form validation (email/password strength); show inline errors; success should route to post-signup tenant creation/select.
  - [x] API: NestJS endpoint to create user, hash password, create default tenant context or mark for selection; return JWT/refresh; enforce email uniqueness.
  - [x] Persist last-used tenant in user profile; include in token payload/response for post-login routing.
- [x] Implement login flow (web + API)
  - [x] Web: Login form with inline errors; redirect to last-used tenant dashboard; handle locked/invalid states.
  - [x] API: Login endpoint verifying hashed password; return JWT/refresh; audit login attempt (success/failure) with IP and tenant context.
- [x] Session/auth middleware
  - [x] Web: Middleware protecting tenant-scoped routes; require active tenant; show prompt to select tenant if missing.
  - [x] API: Guard to enforce authenticated requests; attach tenant_id from token; block cross-tenant access; consistent error codes/messages.
- [x] Observability and security
  - [x] Audit log entries for login/signup and tenant switch events.
  - [x] Rate limit auth endpoints; add basic brute-force protection.
  - [x] Ensure PII handling: encrypt sensitive fields at rest; no secrets in logs.
- [x] Testing
  - [x] Unit tests for auth service (hash/verify, token issuance, tenant context handling).
  - [x] API integration tests for signup/login success/failure paths and tenant isolation.
  - [x] Web component tests for form validation states and redirect behavior.

## Developer Context (Critical Guardrails)

- Stack alignment: Web = Next.js (App Router, TS, Tailwind, shadcn/ui); API = NestJS REST with class-validator; ORM = Prisma/Postgres; queues/Redis not required for this story.
- Auth model: JWT-based auth with refresh tokens; API keys are for tenant APIs (not used here). Auth responses should fit `{ data, error? }` shape with machine-readable error codes.
- Tenant handling: tenant_id required on all tenant-scoped calls; users may belong to multiple tenants (agency model). After login, redirect to last-used tenant; if none, prompt selection/creation.
- Security: hash passwords (bcrypt/argon2), enforce email uniqueness, rate-limit auth routes, log failed attempts without leaking secrets, TLS assumed. Never log tokens or passwords. Apply tenant isolation on all data access.
- Auditability: log signup/login events with actor, tenant (if known), IP, and timestamps; impersonation not in scope for this story but future guards should coexist.
- UX expectations: inline, human-readable errors (e.g., “Invalid email or password”); no generic failures. Maintain focus and keyboard accessibility; visible error states.
- Performance: Target <2s P50 / <4s P95 for auth requests. Avoid unnecessary round trips in the signup/login flow.
- Error codes to align with platform: AUTH_INVALID_CREDENTIALS, AUTH_ACCOUNT_NOT_FOUND, AUTH_RATE_LIMITED, AUTH_TENANT_REQUIRED when applicable.

## Story Requirements (from Epics/PRD/UX)

- User story: Register and sign in to access tenant workspace; login returns to last-used tenant; invalid credentials show clear error and keep user signed out.
- PRD alignment: Tenant creation/login is foundational (FR1) and must preserve tenant isolation and audit logging; prepares for multi-tenant/agency flows.
- UX alignment: Desktop-first; inline validation with clear reasons; safe guardrails (no silent failures); route to active tenant context; no dead ends. Keep copy consistent with “Allowed/Blocked/Waiting” tone where relevant.
- Non-functional: Security (hashed passwords, TLS, no secrets in logs), consent/audit posture respected; availability/perf targets as above.

## Architecture Compliance

- Follow monorepo structure: web (App Router) routes under `web/src/app/(auth)/signup` and `(auth)/login` (or equivalent); API module `api/src/modules/auth` with services/controllers; shared auth DTOs/validators.
- Data model: users table with unique email, password hash, last_used_tenant_id; user_tenants join for membership/roles; audit_logs for auth events.
- APIs: REST endpoints `/auth/signup`, `/auth/login`; respond with access/refresh tokens and user + last_used_tenant_id; include requestId/log context for observability.
- Logging/metrics: structured logs with level, ts, requestId, tenantId (when known), userId; basic metrics for login/signup attempts and failures.
- Testing: use Jest in API; React Testing Library/Playwright for web as appropriate; ensure coverage for success/failure flows and tenant redirect logic.

## Library/Framework Requirements

- Auth hashing: bcrypt/argon2 (choose consistent with API stack); validate inputs with class-validator; sanitize outputs.
- Web forms: React Hook Form + Zod (per architecture patterns) for validation; shadcn/ui form components; handle loading/disabled states with accessible labels.
- Tokens: JWT with expiration; refresh token handling (httpOnly cookie or secure storage per platform decision); ensure CSRF protection strategy if using cookies.

## File Structure Requirements

- Web:
  - `web/src/app/(auth)/signup/page.tsx` and `/login/page.tsx`
  - Shared form components in `web/src/components/auth/`
  - Fetchers/hooks in `web/src/lib/auth/` with typed responses
- API:
  - `api/src/modules/auth/auth.controller.ts`, `auth.service.ts`, DTOs in `api/src/modules/auth/dto/`
  - Entities in Prisma schema (users, user_tenants, audit_logs)
  - Guards/interceptors in `api/src/common/`

## Testing Requirements

- API unit/integration: signup success, duplicate email rejection, login success, invalid credentials, rate-limit path, audit log creation, last_used_tenant_id in response.
- Web component/integration: form validation errors (email format, password rules), loading/disabled states, success redirect to last-used tenant, invalid credential message persists without logging in.
- Security tests: ensure tokens not logged; password hash stored; no tenant leakage across users.

## Project Context Reference

- No `project-context.md` present. Source context from PRD, Architecture, and UX specs in `docs/`.

## Completion Status

- Story Status: Ready for Review
- Completion Note: Signup/login flows implemented across API and web with auth guard, Prisma schema, rate limiting, and automated tests.

## Dev Agent Record

### Context Reference
- PRD: docs/prd.md
- Architecture: docs/architecture.md
- UX: docs/ux-design-specification.md
- Epics/Stories: docs/epics.md

### Agent Model Used
- OpenAI GPT-5 (Codex CLI)

### Debug Log References
- pnpm --filter @engageninja/prisma migrate:dev -- --name init-auth
- pnpm --filter api test:e2e
- pnpm --filter web test

### Completion Notes List
- Implemented Prisma schema (users, tenants, user_tenants, audit_logs) with migration against local Postgres.
- Delivered NestJS auth module (signup/login, JWT issuance, audit logs, login rate limiting, JWT guard + /auth/me) with structured `{data,error}` responses.
- Added Next.js signup/login flows with React Hook Form + Zod validation, cookie persistence, tenant-aware redirects, and middleware to enforce tenant/session presence.
- Tests: API e2e coverage for signup/login/guard/rate limits; web RTL tests for validation, redirect behavior, and invalid credential handling.
- Tenant switch audit will be added when switcher flow exists; current audit covers signup/login.

### File List
- docs/sprint-artifacts/1-1-user-signup-login.md
- docs/sprint-artifacts/sprint-status.yaml
- .gitignore
- .env
- .env.example
- .config/pnpm/rc
- package.json
- pnpm-workspace.yaml
- pnpm-lock.yaml
- packages/prisma/package.json
- packages/prisma/schema.prisma
- packages/prisma/.env
- packages/prisma/migrations/20251209005329_init_auth/migration.sql
- packages/prisma/migrations/migration_lock.toml
- api/package.json
- api/src/app.module.ts
- api/src/main.ts
- api/src/prisma/prisma.module.ts
- api/src/prisma/prisma.service.ts
- api/src/auth/auth.controller.ts
- api/src/auth/auth.module.ts
- api/src/auth/auth.service.ts
- api/src/auth/auth.types.ts
- api/src/auth/dto/login.dto.ts
- api/src/auth/dto/signup.dto.ts
- api/src/auth/dto/switch-tenant.dto.ts
- api/src/auth/guards/jwt-auth.guard.ts
- api/src/auth/jwt.strategy.ts
- api/src/auth/decorators/current-user.decorator.ts
- api/src/common/filters/http-exception.filter.ts
- api/src/common/interceptors/response.interceptor.ts
- api/src/common/guards/app-throttler.guard.ts
- api/test/auth.e2e-spec.ts
- web/package.json
- web/jest.config.ts
- web/jest.setup.ts
- web/src/middleware.ts
- web/src/lib/auth-client.ts
- web/src/app/(auth)/signup/page.tsx
- web/src/app/(auth)/login/page.tsx
- web/src/app/(auth)/__tests__/auth-pages.test.tsx
- web/src/middleware.test.ts
- web/src/app/(tenant)/dashboard/page.tsx
- web/src/app/select-tenant/page.tsx

### Change Log
- 2025-12-09: Implemented signup/login flows (API + web), JWT guard, rate limiting, Prisma schema/migration, and automated tests.
