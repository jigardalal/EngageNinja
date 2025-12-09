# Story 1.4: Tenant API Keys

Status: ready-for-dev

## Story
As a tenant admin/owner, I want to create, rotate, and revoke tenant-scoped API keys so that integrations can authenticate safely, respect tenant isolation, and stay within the plan/feature gates the PRD and architecture require.

## Acceptance Criteria
1. **Secret handling & plan gating** – Given an owner/admin on a tier that allows API/webhook access (Starter exception or Growth/Agency), when they create a new API key, the system generates a strong secret, displays it once with a copy affordance, stores only a hashed value with metadata (tenant_id, plan_tier, created_by, allowed_scopes, created_at), enforces the tier-based gates from the PRD (FR3/FR33/FR34) and Architecture (NFR7/NFR15/NFR16), and writes an audit log entry with request_id/actor_id.
2. **Listing & transparency** – Given keys exist, when they view the API keys canvas, the UI shows clear status chips (active/revoked), plan tier, last used, last rotated, and human-readable guardrails for any block, leveraging the UX spec’s “safety-by-default” guidance so there are no hidden errors or jargon-heavy codes.
3. **Revocations & safety** – Given a key is revoked, when revocation is confirmed, the key flips to `revoked`, future requests fail with a consistent `API_KEY_REVOKED` (or equivalent) response, metrics and audit logs record the action, and no cross-tenant reads/writes happen because ActiveTenantGuard (story 1.3) is still in effect.
4. **Runtime enforcement** – Given a request arrives with an API key, the API verifies the hashed secret, confirms the key is active, the tenant is still entitled to the requested scope/quotas, and that consent/audit rules from Architecture/PRD (audit logs, tenant isolation, quotas, rate limits) are satisfied before forwarding to downstream handlers.

## Tasks / Subtasks
- [ ] **Schema & migration** – Add a `TenantApiKey` Prisma model (uuid id, tenant_id, name/description, hashed_secret, plan_tier, scope_flags, revoked_at/by, last_used_at, created_by, created_at, updated_at), enforce tenant_id → tenant relation, add indexes on tenant_id+status, and ship a Prisma migration aligned with Prisma 7.1.0 (per current dependency list).
- [ ] **Backend module** – Create `api/src/modules/tenants/tenant-api-keys` with controller/service/guards that expose `POST /tenants/:tenantId/api-keys`, `GET /tenants/:tenantId/api-keys`, and `DELETE /tenants/:tenantId/api-keys/:keyId`. Reuse `JwtAuthGuard`, `ActiveTenantGuard`, and plan-gate helpers from story 1.3. On creation, generate the secret via `crypto.randomBytes`, hash it securely (argon2/bcrypt), persist metadata, emit an `audit_logs` entry, and return only the copy-once secret. On revoke, mark the key revoked, flush any caches, emit audit logs, and answer with a friendly status for the UI.
- [ ] **Plan gating & capability checks** – Leverage subscription tier data (Starter vs Growth/Agency), capability flags (owner/admin vs agency_marketer/viewer), and quota helpers (FR33/FR34) so only entitled roles can create/manage keys. Document and emit HTTP 403 with plain-language reasons when gating blocks the action (per the UX emphasis on clear guardrails).
- [ ] **Frontend surface** – Build `web/src/app/(tenant)/settings/api-keys/page.tsx` (or an equivalent section under settings) that lists all keys with lives statuses, last-used timestamps, plan tier badges, and guardrails derived from the PRD’s hero loop and UX “safety-by-default” rules. Include a CTA to generate a key, show the copy-once secret with security warnings, allow revocation, and surface upgrade hints when the tenant’s tier blocks the action.
- [ ] **Tenant API client** – Extend `web/src/lib/tenant-api.ts` with typed helpers for create/list/revoke to keep data fetching consistent with existing story flows.
- [ ] **Tests & QA** – Add API e2e coverage (`api/test/tenants-api-keys.e2e-spec.ts`) and UI tests (`web/src/app/(tenant)/settings/api-keys/__tests__/page.test.tsx`) that cover happy paths, plan gating, human-readable error copy, and audit log expectations. Re-run the existing Playwright suite (per the repo’s focus on automated UI assurance).
- [ ] **Observability & docs** – Log creation/revocation/usage metrics, update `docs/implementation-readiness-report-2025-12-08.md` or the README to mention the new endpoints, and describe the hero loop impact so the DevOps/QA teams know the story is done.

## Dev Notes
- Reuse `ActiveTenantGuard` from story 1.3 to keep tenant isolation non-negotiable; never surface another tenant’s keys because the guard plus Prisma `tenant_id` filters do the heavy lifting.
- API secrets must be hashed (argon2 or bcrypt) and rotated/expired per Architecture (NFR7 & NFR10) while the UI says “copy once” (UX direction). Keep `allowed_scopes` and `plan_tier` metadata so the runtime can enforce quotas.
- Convey human-readable guardrails in the UI. The UX spec demands guardrails that explain “why blocking” and “next step” (consent missing, tier upgrade) rather than codes.
- Audit logs must capture every create/revoke/use action with `actor_user_id`, `tenant_id`, `request_id`, `action`, and `target_id` (Architecture “Audit & Compliance” section). Instrument metrics for key usage to flag spikes or abuse.
- Startup commits have been doc/test heavy (README rewrites, new Playwright suite) and Prisma already sits at 7.1.0, so keep migrations simple and rerun the e2e/test tooling after schema changes.
- No `project-context.md` exists; rely on PRD/Architecture/UX/Implementation Readiness plus the epics doc as the single source of truth for this story’s scope.
- YOLO mode engaged for the rest of this workflow, so optional confirmations were skipped but context (Architecture/PRD/Epics) was fully analyzed before writing.

## Project Structure Notes
- **Backend:** `api/src/modules/tenants/tenant-api-keys` (controllers/services/dto/guards) plus shared helpers in `api/src/common` for plan gating and audit logging; `packages/prisma` gets the new schema/migration.
- **Frontend:** `web/src/app/(tenant)/settings/api-keys/page.tsx` for the settings surface, `web/src/components` for status chips/copy callouts, and `web/src/lib/tenant-api.ts` for typed API calls.
- **Docs & Tests:** `docs/sprint-artifacts/` gains this story file; `api/test` and `web/src/app/(tenant)/settings/api-keys/__tests__` hold coverage; update README/implementation readiness docs to mention the new ability.
- **Observability:** Add metrics/logging in `api/src/common/telemetry` (or similar) so usage/revocation events emit to the dashboard referenced in Architecture.

## References
- `docs/epics.md#Story-1.4-Tenant-API-Keys` (story definition, acceptance criteria, BDD guidance)
- `docs/prd.md#Multi-Tenant-&-Agency-Operations` and the Subscription Gating section (FR3–FR35, API keys gating, agency roles)
- `docs/architecture.md#Authentication-&-Security` plus the Audit & Compliance and Integration Robustness sections (hashed secrets, audit logs, tenant isolation, quotas)
- `docs/ux-design-specification.md#Core-User-Experience` and the “Experience Principles”/“Critical Success Moments” sections (guardrails, hero loop, proof over promise)
- `docs/implementation-readiness-report-2025-12-08.md` (tech spec confirming coverage and alignment)

## Developer Context
- This story closes the gap between the tenant hero loop and the upcoming transactional APIs, building on tenant membership (story 1.3) and the Verified plan gating logic already documented. The developer now must deliver both backend + frontend in lockstep so that every tenant can safely provision API keys without breaking partner integrations.
- Align with the hero loop: Connect → API key → send/resend → uplift while keeping the UX safe, audible, and proof-driven.

## Git Intelligence Summary
- `49d8194` “Rewrite root README for developer clarity and onboarding” signals the team is focused on documentation; add API key docs to the README so onboarding stays consistent.
- `eb19b68` and `c34f292` show fresh attention to E2E/Playwright suites; add UI coverage for the API keys surface to the same suite.
- `92a5d34` & `aeb93c5` mark a Prisma 7.1.0 upgrade plus follow-up test fixes; model your new schema/migrations for Prisma 7.1.0 and rerun `pnpm --filter api test` and Playwright after changes.

## Latest Technical Information
- **Frontend:** Next.js 16.0.8 + React 19.2.1 (per `web/package.json`), Tailwind 4 + shadcn/ui components, React Hook Form 7.68 + Zod 4.1.13 for forms/validation; stay within these versions when scaffolding the new settings page.
- **Backend:** NestJS 11 (controllers/services/guards), Passport/JWT auth, Prisma 7.1.0, class-validator + class-transformer, bcrypt for hashing (per `api/package.json`); use these stacks for new APIs.
- **Testing:** Playwright ^1.57.0 for UI suites and Jest 30 for unit/e2e across web/api; keep tests in sync with the repo’s existing focus on documentation and coverage.

## Project Context Reference
- Source documents: `docs/prd.md`, `docs/architecture.md`, `docs/ux-design-specification.md`, `docs/implementation-readiness-report-2025-12-08.md`, `docs/epics.md`.
- No `project-context.md` exists anywhere in the repo; treat the above artifacts as the authoritative context.

## Story Completion Status
**Story Details:**
- Story ID: 1.4
- Story Key: 1-4-tenant-api-keys
- File: docs/sprint-artifacts/1-4-tenant-api-keys.md
- Status: ready-for-dev

**Next Steps:**
1. Review the comprehensive story in `docs/sprint-artifacts/1-4-tenant-api-keys.md`.
2. Optional Quality Competition: run `*validate-create-story` with a fresh context to spot any omissions.
3. Trigger the dev agents via `dev-story` so implementation-ready guidance is available.
4. Run `code-review` when the implementation lands so the story can be marked done.

## Dev Agent Record

### Context Reference
- `docs/epics.md#Story-1.4-Tenant-API-Keys`
- `docs/prd.md#Multi-Tenant-&-Agency-Operations`
- `docs/architecture.md#Authentication-&-Security`
- `docs/ux-design-specification.md#Core-User-Experience`
- `docs/implementation-readiness-report-2025-12-08.md`

### Agent Model Used
OpenAI GPT-5 (Codex CLI)

### Debug Log References
- `cat docs/sprint-artifacts/sprint-status.yaml`
- `cat docs/epics.md`
- `cat docs/architecture.md`
- `cat docs/prd.md`
- `cat docs/ux-design-specification.md`
- `cat docs/implementation-readiness-report-2025-12-08.md`
- `cat docs/sprint-artifacts/1-3-tenant-roles-member-management.md`
- `cat web/package.json`
- `cat api/package.json`
- `git log -5 --oneline`
- `cat .bmad/bmm/workflows/4-implementation/create-story/workflow.yaml`
- `cat .bmad/bmm/workflows/4-implementation/create-story/instructions.xml`
- `cat .bmad/bmm/workflows/4-implementation/create-story/template.md`
- `cat .bmad/core/tasks/workflow.xml`
- `cat .bmad/core/config.yaml`

### Completion Notes List
- ✅ **Context Engine Done:** The story now captures Tenant API Key requirements, guardrails, and tasks via PRD/Architecture/UX without additional elicitation.
- ✅ **Sprint Status Synced:** `docs/sprint-artifacts/sprint-status.yaml` now marks `1-4-tenant-api-keys` as `ready-for-dev`.
- ✅ **Git & Stack Signals Captured:** Noted the repo’s recent focus on docs/tests and the Prisma 7.1.0 upgrade so schema changes stay compatible.
- ✅ **Ultimate Context Engine:** Ultimate context engine analysis completed – comprehensive developer guide created (per workflow instruction).
- ✅ **YOLO Mode Used:** Entered YOLO mode after the first template-output prompt so no optional confirmations interrupted the flow.

### File List
- `docs/sprint-artifacts/1-4-tenant-api-keys.md`
- `docs/sprint-artifacts/sprint-status.yaml`
