# EngageNinja – Auth flows quick start

Manual verification steps for Story 1.1 (signup/login, tenant switching).

## Prerequisites
- Postgres running at `postgresql://engageninja:engageninja@localhost:5433/engageninja`.
- Node 18+ and pnpm installed.

## API
1) Set `DATABASE_URL=postgresql://engageninja:engageninja@localhost:5433/engageninja`.
2) From `api/`: `pnpm install` (first time), then `pnpm start:dev`.
3) Endpoints to try:
   - `POST /auth/signup` with `{ email, password, tenantName? }` → 201, sets `access_token`, `refresh_token`, `tenant_id` cookies.
   - `POST /auth/login` with `{ email, password }` → 200, sets cookies; invalid creds return `AUTH_INVALID_CREDENTIALS`.
   - `POST /auth/switch-tenant` (Bearer access token + `{ tenantId }`) → 200, new tokens, audit log `auth.tenant.switch`.

## Web
1) Set `NEXT_PUBLIC_API_URL` to API origin if not same-origin; otherwise leave blank for same-origin.
2) From `web/`: `pnpm install` (first time), then `pnpm dev`.
3) Flows to exercise:
   - `/signup`: create account → redirects to `/dashboard?tenantId=...`, `tenant_id` cookie set.
   - `/login`: valid creds redirect to dashboard; invalid creds show inline error and stay on page.
   - `/dashboard`: without cookies → redirects to `/login?redirect=/dashboard`; with `access_token` but no `tenant_id` → redirects to `/select-tenant`; with both → allowed.

## Tests
- Web: `pnpm test -- --testPathPattern auth-pages.test.tsx --runInBand`
- Web middleware: `pnpm test -- --runTestsByPath src/middleware.test.ts --runInBand`
- API e2e: from `api/` run `DATABASE_URL=postgresql://engageninja:engageninja@localhost:5433/engageninja pnpm test:e2e`

## Seed data
- Run `pnpm prepare-db` (or `pnpm --filter @engageninja/prisma prepare-db`) after applying migrations to push the schema
  and hydrate the sample tenants/users/members for manual verification or faster local sanity checks.
- Credentials seeded by the script: `owner@example.com` and `member@example.com` both use `Test123!Aa`.
  `owner@example.com` belongs to the Growth-tier tenant `Alpha Workspace` and is also a viewer on `Beta Collective`,
  which is the Starter-tier tenant for `member@example.com`.
- The API e2e suite now runs `pnpm --filter @engageninja/prisma prepare-db` before Jest so those tests always see seeded data.
