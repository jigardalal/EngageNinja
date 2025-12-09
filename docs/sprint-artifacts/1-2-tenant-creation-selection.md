# Story 1.2: Tenant Creation & Selection

Status: completed

## Story

As a signed-in user,
I want to create or select the tenant that scopes my work,
so that every action stays inside the correct tenant boundary, honors subscription limits, and surfaces the active tenant context on every protected surface.

## Acceptance Criteria

1. Given the user is entitled to another tenant (Starter allows one, Growth/Agency levels support the configured tenant pool), when they submit the creation form the backend persists the tenant, seeds defaults, sets the requester as owner/admin, and immediately marks it as the active tenant for the session while emitting a `tenant.created` audit event.
2. When the user belongs to >1 tenant, the global tenant switcher lists each tenant (plan badge, last activity, status) and selecting one updates the persisted active tenant, refreshes the JWT/session claims, writes a `tenant.switch` audit entry, and reloads tenant-scoped dashboards/lists without requiring re-login.
3. When any tenant-scoped page or API is hit without an active tenant, the backend returns `ACTIVE_TENANT_REQUIRED` and the frontend overlays the select/create tenant experience, locking the protected surface until a tenant is chosen or created and explaining the guardrail in plain-language copy.

## Tasks / Subtasks

- [x] Implement tenant lifecycle APIs in the Nest backend
  - [x] Extend DTOs and services to create tenants with plan, region, and capability flags; enforce plan quotas (Starter = 1 tenant, Growth/Agency = configurable pools) before committing.
  - [x] Persist the creator in `user_tenants`, mark them as owner/admin, emit `audit_logs` entries (`actor_user_id`, `tenant_id`, `action`, metadata) and seed a default `tenant_settings` row.
  - [x] Expose list/describe/delete endpoints so the UI can render all available tenants and show quota usage.

- [x] Strengthen auth/session context and guards
  - [x] Add `active_tenant_id` (plus plan/quota metadata) to the JWT/refresh token payload and session cache; default to the user's last active tenant.
  - [x] Extend tenant-scoped guards/middleware to require `active_tenant_id` and throw `ACTIVE_TENANT_REQUIRED` before hitting campaign/contact controllers.
  - [x] Implement the `switch-tenant` handler (reusing `switch-tenant.dto.ts`), update `user.last_active_tenant`, log the switch, and allow alias keys (`1-2-user-auth`) alongside IDs.

- [x] Build tenant selection and creation UX in Next.js
  - [x] Upgrade `web/src/app/select-tenant/page.tsx` into a tenant dashboard that lists existing tenants, exposes plan caps, and includes a form (React Hook Form + Zod) for creation with plain-language guardrail copy.
  - [x] Add a tenant switcher component in the global layout that shows the current tenant, plan badge, impersonation status, and a dropdown for switching/creating tenants.
  - [x] Wrap tenant-scoped pages (dashboard, lists, templates) with a context guard that redirects to the select/create flow when `activeTenant` is empty and surfaces the prohibition copy defined in the UX spec.

- [x] Deliver telemetry, docs, and tests
  - [x] Add Nest integration tests (supertest/Jest) for plan-limit enforcement, creation success/failure, and the switch endpoint.
  - [x] Add React Testing Library/Playwright coverage for the select screen and switcher dropdown (plan copy, guardrail states, CTA flows).
  - [x] Document the flow inside `docs/sprint-artifacts`, update `sprint-status.yaml` to mark 1-2 as ready-for-dev, and capture where `tenant_id`/active context lives (cookies, middleware, localStorage).

## Dev Notes

- Every query must continue to carry `tenant_id` from the active context; rely on `user_tenants` for membership, respect RLS, and never fall back to defaults that could leak cross-tenant data (per `docs/architecture.md`).
- Plan gating (Starter 1 tenant, Growth/Agency variable) is documented in the PRD; guard the creation endpoint and show the same quota copy in the UI so users know why the limit exists.
- Emit audit logs for creation/switch along with impersonation metadata; include requestId, actor_user_id, tenant_id, and action so admins can trace writes (architecture + PRD compliance).
- Because `project-context.md` is absent, rely on PRD, architecture, UX spec, UX directions, and implementation readiness report for every requirement; these remain the single source of truth.

### Project Structure Notes

- Align with the pnpm monorepo: UI lives under `web/`, backend under `api/`, shared Prisma under `packages/prisma`, and story artifacts in `docs/sprint-artifacts/`.
- Tenant UI surfaces should be in `web/src/app/select-tenant`, global layout in `web/src/app/layout.tsx`, and reusable components in `web/src/components/` (e.g., a new `tenant-switcher.tsx`).
- Backend changes belong inside `api/src/auth` (switch DTO/endpoint) or a new `api/src/modules/tenants` module, with Prisma schema updates in `packages/prisma/schema.prisma` and migrations under `packages/prisma/migrations`.
- Tests live next to their features: `api/test` for Nest endpoints and `web/src/app/(tenant)` for RTL/Playwright stories.

### References

- `docs/epics.md#Story-1.2-Tenant-Creation-&-Selection` – Story definition plus cross-story context (1.1 login).  
- `docs/prd.md#Onboarding-&-Access` – FR1, FR3, FR24/FR25 require tenant creation, plan gating, and switcher guardrails.  
- `docs/architecture.md#Multi-Tenancy-&-Agency` – Tenant isolation, audit requirements, impersonation, and naming conventions.  
- `docs/ux-design-specification.md#Core-User-Experience` – Hero loop, guardrail copy, resend/upfront guidance for tenant onboarding.  
- `docs/ux-design-directions.html#Direction-A-Clarity-&-Uplift` – Visual style for switcher cards, checklist emphasis, and CTA tone.  
- `docs/implementation-readiness-report-2025-12-08.md#Summary-and-Recommendations` – Confirms the artifacts are aligned and ready for implementation.

## Latest Technical Intelligence

- `web/package.json` already pins Next.js 16.0.8, React 19.2.1, React Hook Form 7, and Tailwind 4; keep these precise versions for the UX work and follow Next's App Router conventions (server/client components, error boundaries).  
- `api/package.json` uses Nest v11.x, Prisma 5.22.0, bcrypt 6, and Nest Throttler 6.5; align new endpoints with these major versions and keep JWT rotation + class-validator schemas in sync.  
- Network restrictions prevented external browsing, so rely on the repo versions above as the “latest known” state and revisit release notes once outbound access is possible before upgrading.

## Story Completion Status

- Status: completed
- Completion note: All acceptance criteria met. Backend APIs (create, list, switch tenant) fully implemented with audit logging. Frontend tenant selection/switcher UI complete. 15 e2e tests passing. Code audit completed with 0 linting errors.

## Dev Agent Record

### Context Reference

- `docs/epics.md#Story-1.2-Tenant-Creation-&-Selection`  
- `docs/prd.md#Onboarding-&-Access`  
- `docs/architecture.md#Multi-Tenancy-&-Agency`  
- `docs/ux-design-specification.md#Core-User-Experience`  
- `docs/ux-design-directions.html#Direction-A-Clarity-&-Uplift`

### Agent Model Used

Claude Haiku 4.5

### Debug Log References

- `pnpm --filter api test`  
- `pnpm --filter api test:e2e`  
- `pnpm --filter web test`

### Completion Notes List

- Delivered tenant lifecycle APIs with plan-aware DTOs, quota enforcement, audit logs, and the Prisma migration so backend data stays isolated per tenant.
- Built the select-tenant dashboard, tenant switcher, guard layout, and synchronous RTL tests to surface plan copy, guardrails, and plan-limited form flows for the UI.
- **Initial Code Review Fixes Applied:**
  - ✅ [H1] Implemented `ActiveTenantGuard` to enforce `ACTIVE_TENANT_REQUIRED` on backend endpoints; registers globally in `AppModule`
  - ✅ [H2] Updated client `TenantGuard` to validate `activeTenantId` from JWT claim via `/auth/me` endpoint instead of cookie-only approach
  - ✅ [H3] Added 5 new comprehensive tests: audit log creation, non-owner deletion blocking, successful tenant switch with JWT validation, and active tenant list endpoint
  - ✅ [M1] Hardened `tenant_id` cookie by setting `httpOnly: true` for defense-in-depth; clients now rely on JWT claim
  - ✅ [M2] Integrated `ActiveTenantGuard` globally in `AppModule` with decorator for endpoint-level exemptions (`@SkipActiveTenantCheck`)
  - ✅ [M3] Verified `activeTenantId` is always populated in JWT payload after login/signup via `issueTokens` method
  - ✅ [L1] Added audit log assertions in tenant creation test to validate proper logging with action, userId, tenantId, and metadata

- **Post-Completion Code Quality Audit (2025-12-09):**
  - ✅ Resolved 146 → 0 linting errors across API codebase (100% resolution)
  - ✅ Upgraded `@types/passport-jwt` and `@types/bcrypt` for improved type safety
  - ✅ Fixed unsafe type assertions in JWT strategy, auth service, and decorators
  - ✅ Properly typed Express Request/Response objects in all guards and middleware
  - ✅ All 15 e2e tests pass with clean TypeScript strict mode compliance
  - ✅ Only 1 justified `eslint-disable` remaining (framework constraint with explanation comment)

### File List

- `.env.example`
- `docs/sprint-artifacts/1-2-tenant-creation-selection.md`
- `docs/sprint-artifacts/sprint-status.yaml`
- `packages/prisma/schema.prisma`
- `packages/prisma/migrations/20251209020000_tenant_lifecycle/migration.sql`
- `api/src/common/enums/plan-tier.enum.ts`
- `api/src/common/utils/tenant-plan.util.ts`
- `api/src/modules/tenants/dto/create-tenant.dto.ts`
- `api/src/modules/tenants/tenants.controller.ts`
- `api/src/modules/tenants/tenants.service.ts`
- `api/src/auth/auth.service.ts`
- `api/src/auth/auth.types.ts`
- `api/src/auth/auth.cookie.ts`
- `api/src/auth/dto/signup.dto.ts`
- `api/src/auth/dto/switch-tenant.dto.ts`
- `api/src/auth/jwt.strategy.ts`
- `api/src/auth/guards/active-tenant.guard.ts` (NEW)
- `api/src/auth/decorators/skip-active-tenant.decorator.ts` (NEW)
- `api/src/auth/auth.controller.ts`
- `api/src/app.module.ts`
- `api/test/auth.e2e-spec.ts`
- `api/test/tenants.e2e-spec.ts`
- `web/src/app/layout.tsx`
- `web/src/app/(tenant)/layout.tsx`
- `web/src/app/select-tenant/page.tsx`
- `web/src/app/select-tenant/__tests__/page.test.tsx`
- `web/src/components/tenant-switcher.tsx`
- `web/src/components/tenant-guard.tsx`
- `web/src/components/__tests__/tenant-switcher.test.tsx`
- `web/src/lib/tenant-api.ts`
- `web/src/lib/tenant-plan.ts`
- `web/src/lib/cookies.ts`
