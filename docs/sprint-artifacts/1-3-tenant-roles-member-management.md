# Story 1.3: Tenant Roles & Member Management

Status: ready-for-dev

## Story
As a tenant admin/owner,
I want to invite and manage members with roles,
So that access is controlled per tenant.

## Acceptance Criteria
1. Given I’m an owner or admin, when I invite a user and assign a tenant role, the invite is queued, the recipient sees a pending member badge, and acceptance tags that role for future requests.
2. Given a member already belongs to the tenant, when I change their role, the new capability set (owner/admin/marketer/agency_marketer/viewer) takes effect immediately for all protected routes and plan-aware rate limits.
3. Given a member is removed, when they try to access anything scoped to that tenant, the request is rejected with `ACTIVE_TENANT_REQUIRED` or a tenant-mismatch error and the UI shows the plain-language reason.

## Tasks / Subtasks
- [ ] Expand `api/src/modules/tenants` (or a new `members` submodule) with endpoints for invite, list, update-role, and revoke, reusing plan-gating helpers so Starter vs Growth/Agency caps stay enforced.
- [ ] Extend Prisma (`packages/prisma/schema.prisma`) with a `TenantMember` relation tracking invite tokens, role, status, invited_by, and audit metadata; generate a migration and seed references if needed.
- [ ] Create a tenant-members surface under `web/src/app/(tenant)/members` that reuses the tenant switcher guard, shows plan usage, renders role chips, and surfaces the UX spec’s human-readable guardrails for blocked invites (consent, file limits, API keys).
- [ ] Wire the UI to the API, ensure barriers (consent checks, template approval, plan quota messages) are surfaced before the invite button enables, and add toasts/logging for success+failure.
- [ ] Add targeted tests: Nest e2e coverage for role transitions and audit log writes, React Testing Library coverage for guardrail messaging, and update any Playwright suites that cover tenant management.

## Dev Notes
- Always resolve `active_tenant_id` via the guard that story 1.2 introduced so tenant isolation and `ACTIVE_TENANT_REQUIRED` remain authoritative.
- Role assignments must honor the capability flag matrix described in the architecture docs (owner/admin/marketer/agency_marketer/viewer) and tie into the `user_tenants` join table for fast lookups.
- Every invite/update/remove flows must emit `audit_logs` entries with `actor_user_id`, `tenant_id`, `action`, and `request_id`, and capture impersonation metadata when applicable.
- Guardrail copy (consent, plan, template states) should mirror the UX spec’s clarity goals—no terse error codes; surface remediation steps inline.
- Reuse existing tenant switcher/plan-summary components so we do not reinvent the UI and keep the hero loop smooth (Connect → Invite/Create → Send → Resend).

### Project Structure Notes
- Backend: `api/src/modules/tenants` (controller/service/guards) plus `packages/prisma` for schema/migration updates and `api/src/common` for shared guards/decorators.
- Frontend: `web/src/app/(tenant)/layout.tsx` to keep the guard, `web/src/app/(tenant)/members` for the feature, and reusable chips/buttons under `web/src/components`.
- Tests: `api/test/` for integration coverage and `web/src/app/(tenant)/members/__tests__` for RTL/playwright quality gates.

### References
- `docs/epics.md#Story-1.3-Tenant-Roles-&-Member-Management` (story definition and acceptance criteria)
- `docs/prd.md#Multi-Tenant- & Agency-Operations` (FR24-28, plan gating, agency controls)
- `docs/architecture.md#Authentication-&-Security` (roles, capability flags, audit, tenant isolation)
- `docs/ux-design-specification.md#Core-User-Experience` (guardrail messaging, hero loop, safety-first tone)

## Developer Context
- This is the first member-management story in Epic 1 and it must guard the tenant hero loop while keeping the roster hydrated with the right roles.
- The story inherits the sprint cadence: previous stories (1.1/1.2) handled tenant creation and context, so this story must only surface invites for tenants that already exist.
- Multi-tenant agencies expect the guardrails around plan quotas, impersonation auditability, and safe fail states; the UX spec calls for clear reasons whenever access is blocked.
- The backlog entry came from `sprint-status.yaml`, so treat `1-3-tenant-roles-member-management` as the next ready story and keep new files under `docs/sprint-artifacts`.

## Technical Requirements
- Provide tenant member REST surface (invite/list/role/revoke) secured by JWT + `ActiveTenantGuard`, reusing service helpers so we do not duplicate plan-quota logic from story 1.2.
- Validate incoming payloads with class-validator DTOs (role enum, email, send-invite flag) and perform tenancy checks via Prisma `TenantMember` relations so no cross-tenant writes slip through.
- Map role changes to capability flags in `user_tenants` so permission guards downstream (campaigns, contacts) immediately see the new role; ensure the ability to detect agency_marketer vs tenant owner per architecture rules.
- Emit structured log entries + audit log records for invites, role changes, revocations, and enforce the plan quotas documented in the PRD (Starter = single tenant, Growth/Agency = configurable pool).
- Surface guardrails in the UI ahead of the send flow (consent, plan quotas, template approval) and highlight pending invites with status chips and summary counts per UX design.

## Architecture Compliance
- Meet the architecture mandate that authZ depends on role/capability flags (owner/admin/marketer/agency_marketer/viewer) and enforces them at every endpoint (see architecture doc OCR around role/capabilities).
- Maintain tenant isolation and data residency by always anchoring on `active_tenant_id` from the JWT and honoring `tenant_id` in every Prisma query (no shortcuts, no cross-tenant reads).
- Follow audit and telemetry prescriptions: structured logging with tenant/user/request metadata, audit logs for create/update/delete actions, and retention aligned to architecture defaults.
- Push human-readable guardrails so we never leave the UX spec’s tone—explicit reasons, remediation steps, and consistent chips/banners.

## Library & Framework Requirements
- Frontend: Next.js 16.0.8 + React 19.2.1 + Tailwind 4 + shadcn/ui primitives for forms, chips, and banners.
- Backend: NestJS v11 + Passport/JWT + class-validator + Prisma 5.22.0 with Postgres; align with existing `api/package.json`.
- Shared: Borrow plan/capability helpers from `api/src/common/utils`, reuse `web/src/components` tokens for status pills, keep hooks in `web/src/lib`.
- Testing: Jest + RTL + Playwright commands already defined in the repo; align with existing `pnpm --filter api test` and `pnpm --filter web test` flows.

## File Structure Requirements
- `docs/sprint-artifacts/1-3-tenant-roles-member-management.md`: final story file and single source of truth for this story.
- `packages/prisma` for migrations (new table or columns for tenant members) and potential seed updates for plan limits.
- `api/src/modules/tenants` (or `members` submodule) plus `api/src/common/guards` for `ActiveTenantGuard` reuse.
- `web/src/app/(tenant)/members` for UI, `web/src/components` for shared chips/banners, `web/src/lib/tenant-api.ts` for fetchers.
- Testing scaffolds in `api/test` and `web/src/app/(tenant)/members/__tests__`.

## Testing Requirements
- API: add Jest/Nest e2e specs that cover invite acceptance, role change propagation (capability flags), revocation, plan quota enforcement, and audit log writes.
- UI: RTL/playwright coverage for the members view, ensuring guardrails (blocked invite states, info banners) render correctly and the tenant switcher stays in sync.
- Re-run existing suites after changes (`pnpm --filter api test`, `pnpm --filter web test`) to catch regressions introduced by the new endpoints/components.

## Previous Story Intelligence
- Story 1.2 introduced `ActiveTenantGuard` and documented `ACTIVE_TENANT_REQUIRED`; reuse the guard so we do not recreate the same tenant-context enforcement.
- The previous story documented plan gating (Starter = 1 tenant, Growth/Agency = configurable pools) and audit logging for creation/switch; these capabilities should be reused, not rewritten.
- There is no `project-context.md`, so rely on the PRD/architecture/UX artifacts referenced here (per story 1.2 Dev Notes) when defining guardrails or language.

## Git Intelligence Summary
- Latest commit `08d31f5 Polish auth experience` reinforces auth/session changes, so keep JWT handling, refresh logic, and guard health in sync with those updates.
- Previous commit `e16998e Add existing project docs` indicates the docs are current; continue to reference `docs/prd.md`, `docs/architecture.md`, and `docs/ux-design-specification.md`.
- Commit `9b3cc3a Add project gitignore` is the oldest entry, so repository setup is stable; focus on building new features without reworking foundation files.

## Latest Technical Information
- Web stack: Next.js 16.0.8 + React 19.2.1 + React Hook Form 7.68 + Tailwind 4 + shadcn primitives (per `web/package.json`).
- API stack: NestJS 11.x + Passport+JWT + Prisma 5.22.0 + class-validator/class-transformer (per `api/package.json`).
- Network access is restricted, so rely on these repo-pinned versions as the “latest known” releases; document any upgrade rationale if wider research becomes possible later.

## Project Context Reference
- There is no `project-context.md` anywhere in the repo; treat the PRD, Architecture, UX spec, and epics document as the authoritative context sources.

## Story Completion Status
**Story Details:**
- Story ID: 1.3
- Story Key: 1-3-tenant-roles-member-management
- File: docs/sprint-artifacts/1-3-tenant-roles-member-management.md
- Status: ready-for-dev

**Next Steps:**
1. Review the comprehensive story in this file.
2. Optional Quality Competition: run `*validate-create-story` to have a fresh LLM analyze and improve this story.
3. Run dev agents `dev-story` for an implementation-ready view.
4. Run `code-review` when development is complete.

Completion note: Ultimate context engine analysis completed - comprehensive developer guide created.

## Dev Agent Record

### Context Reference
- `docs/epics.md#Story-1.3-Tenant-Roles-&-Member-Management`
- `docs/prd.md#Multi-Tenant-&-Agency-Operations`
- `docs/architecture.md#Authentication-&-Security`
- `docs/ux-design-specification.md#Core-User-Experience`

### Agent Model Used
OpenAI GPT-5 (Codex CLI)

### Debug Log References
- `cat docs/sprint-artifacts/sprint-status.yaml`
- `cat docs/epics.md`
- `cat docs/architecture.md`
- `cat docs/prd.md`
- `cat docs/ux-design-specification.md`
- `cat docs/sprint-artifacts/1-2-tenant-creation-selection.md`
- `git log -5 --oneline`
- `cat web/package.json`
- `cat api/package.json`

### Completion Notes List
- Selected the next backlog item (1-3) from `sprint-status.yaml` and confirmed it is ready for drafting.
- Synthesized story requirements from epics/prd/architecture/UX, noting guardrails, plan gating, and multi-tenant expectations.
- Drafted the developer-ready story, updated sprint status, and prepared to run the checklist-driven validation workflow.

### File List
- `docs/sprint-artifacts/1-3-tenant-roles-member-management.md`
- `docs/sprint-artifacts/sprint-status.yaml`
- `docs/sprint-artifacts/validation-report-20251209T155157.md`
