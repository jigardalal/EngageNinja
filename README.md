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
