---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
inputDocuments:
  - docs/prd.md
  - docs/ux-design-specification.md
  - docs/engageninja-master-prd-v0.6.md
  - docs/engageninja-prd-v0.5-with-openapi.md
workflowType: 'architecture'
lastStep: 8
project_name: 'EngageNinja'
user_name: 'Jigs'
date: '2025-12-08'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (highlights):**
- Onboarding & Access: tenant creation/login; WA connect via Meta Cloud; plan/tier selection; tenant roles; per-tenant API keys.
- Contacts & Consent: CSV/manual import with dedup/validation; consent flags and source/timestamp; list management.
- Templates & Channels: WA templates with approval status; variable mapping; optional email channel.
- Campaigns & Resend: WA send to list; delivery/read visibility; resend to non-readers with timing guard; uplift comparison; consent/timing blocks.
- Dashboards & Reporting: per-campaign metrics; resend usage/uplift; exportable reports; simple SMB dashboard.
- Multi-Tenant & Agency: tenant switcher; tenant summaries; drill-down; duplicate patterns; revoke agency access.
- Admin & Support: search tenants; impersonation; inspect channels/API keys/last sends; disable channel; re-trigger webhooks; system health.
- Quotas/Plans: enforce sends/users/tenants/AI/api/webhook limits; per-tenant pools; gated features.
- Integrations/Webhooks: ingest WA sent/delivered/read/failed; email delivered/bounced/complaint/open/click; tenant webhook config (per tier).
- API Access: transactional WA/email via tenant API key (tier-gated).
- Audit/Compliance: audit logs for logins, channel changes, API keys, impersonation, sends; consent enforced; retention defaults; tenant isolation.
- AI Assist: generate campaign copy; proceed without AI if unavailable/quota exceeded.

**Non-Functional Requirements (key drivers):**
- Performance: UI actions ~2s P50/4s P95; webhook processing within ~5s P95; resend scheduling adheres to wait windows.
- Reliability/Availability: durable event handling with retries/backoff; idempotent delivery/read; 99.5%+ control plane target; incidents visible to admins.
- Security/Compliance: encrypt PII at rest; TLS; no secrets in logs; tokenized API keys; tenant isolation; consent gate; audit logging; retention defaults (messages 12–18 mo, events 24 mo, audit 24–36 mo); soft-delete contacts.
- Scalability: path to 15–30M WA and 20–50M email/month; horizontal scale for workers/webhook ingest; quotas to prevent noisy neighbors.
- Observability: metrics/logs for sends, delivery/read, webhook success/fail, resend jobs, quota checks; alerting on failure/backlog; impersonation/admin actions traceable.
- Accessibility: WCAG 2.1 AA basics on core flows.
- Integration robustness: authenticated, retried, idempotent webhooks; API key auth; rate limits by tier.

**UX Implications (architecture-relevant):**
- Live delivery/read ticking; resend countdown; uplift snapshots (implies real-time-ish updates, event-driven UI).
- Preflight checklists and explicit block reasons (requires validation surfaces and clear state APIs).
- One-click inline resend; inline variable mapping; checklist-driven home; impersonation banners.
- Status chips, countdowns, and exportable uplift reports.

### Scale & Complexity
- Domain: SaaS B2B web app + API backend, multi-tenant with agency overlay.
- Complexity: Moderate — multi-tenant, resend loop, webhook/event processing, quotas; not regulated but consent/audit required.
- Expected volumes: up to tens of millions of messages/month (WA/email) at 12-month targets; implies worker + queue + webhook ingestion scale.
- Real-time needs: streaming-ish delivery/read updates to UI; countdowns for resend; admin health views.

### Technical Constraints & Dependencies
- Providers: Meta WhatsApp Cloud API primary; SES primary email with optional fallback (Brevo/Resend) later; webhooks from providers.
- Tier gating: features and quotas vary by plan (channels, sends, AI tokens, API/webhooks, users, tenants).
- Data residency: single-region MVP with data_region flag for future enforcement; no multi-region data residency at launch.
- No offline mode; web-first desktop with responsive support.

### Cross-Cutting Concerns Identified
- Multi-tenancy/agency: strict tenant isolation; user_tenants; impersonation with audit; revoke agency access flag.
- Consent & compliance: consent gate before send; template approval gate; resend timing guard; audit logging and retention.
- Event handling: reliable ingest of WA/email events; idempotency; retries/backoff; backlog/alerting.
- Quotas & rate limits: per-tenant limits on sends/API/AI; protect shared infra; surface reasons to UI.
- Observability & support: health dashboards, impersonation banner/state, admin recovery actions.

## Starter Template Evaluation

### Primary Technology Domain
Full-stack SaaS: Next.js web app + Node/Nest API + worker (BullMQ/Redis) + Postgres.

### Starter Options Considered
- Next.js (App Router) with TypeScript, Tailwind, shadcn/ui scaffolded via create-next-app + shadcn init. Stable, matches UX foundation.
- NestJS CLI starter for API (REST) with TypeScript, class-validator, Swagger-ready; aligns with PRD signals.
- Worker service using NestJS (or lightweight Node) with BullMQ + Redis for queues and webhook processing.

### Selected Starter
- Frontend: create-next-app (TS, App Router, Tailwind, ESLint) + shadcn/ui.
- API: nest new (REST) with validation and OpenAPI support.
- Worker: NestJS project or shared Nest monorepo service using BullMQ.

**Rationale for Selection:**
- Matches PRD/UX stack assumptions (Next.js, Tailwind, shadcn; Node/Nest; Redis/BullMQ; Postgres).
- Strong ecosystem, predictable patterns, good TypeScript DX.
- Clear separation of concerns: web UI, API, workers.

**Initialization Commands (assumes pnpm; adjust if you prefer npm/yarn):**

Frontend:
```bash
npx create-next-app@latest web \
  --ts --tailwind --eslint --app --import-alias "@/*" --src-dir
# initialize shadcn/ui after install: npx shadcn-ui@latest init
```

API:
```bash
npx @nestjs/cli new api --package-manager pnpm
```

Worker (option A: Nest-based worker):
```bash
npx @nestjs/cli new worker --package-manager pnpm
```

**Note:** Network access is restricted here, so version verification via web search was not performed. Commands reflect current common practice; adjust to the latest stable tags in your environment.

### Architectural Decisions Provided by Starter

**Language & Runtime:** TypeScript-first across web/API/worker; Node 18+ (align with LTS in your environment).

**Styling Solution:** Tailwind + shadcn/ui on web; consistent tokens with UX spec.

**Build Tooling:** Next.js (SWC/Vite under the hood per current Next version); NestJS build via ts-node/webpack (default CLI setup).

**Testing Framework:** Jest preset from Nest CLI; Next.js supports Jest/Playwright—add Playwright for E2E later.

**Code Organization:** App Router with `/app` structure on web; modular Nest modules/controllers/services; worker with queues/processors.

**Development Experience:** Hot reload (Next/Nest); ESLint/Prettier via scaffolds; environment configs via `.env` and typed config modules.

### Implementation Roadmap (Starters)
- Initialize web, API, worker projects with the commands above.
- Add shared linting/prettier and TS config alignment (paths, baseUrl).
- Add shadcn/ui setup and seed base components per UX component strategy.
- Add BullMQ/Redis packages to API/worker; establish queue config.
- Add Prisma/TypeORM (choose one) for Postgres in API + migrations.

## Core Architectural Decisions

### Decision Priority Analysis
**Critical (block implementation):** DB/ORM/migrations; AuthN/AuthZ model; API style and idempotency; queue/event handling; hosting targets; monitoring/logging; rate limits/quotas.  
**Important:** Real-time update mechanism; state management on web; webhook HMAC; error model; deployment pipeline.  
**Deferred/Post-MVP:** Push/SSE provider (if needed later), multi-region residency, advanced analytics.

### Data Architecture
- Database: PostgreSQL (primary). ORM: Prisma. Migrations: Prisma migrate.  
- Modeling: Tenant-scoped tables; audit_logs; messages/events with idempotency keys; consent records; quotas/subscriptions/feature flags; user_tenants; impersonation log fields.  
- Caching: Redis for queues and light caching (rate limits, resend timing). No heavy cache layer initially.

### Authentication & Security
- AuthN: JWT-based (per tenant) with refresh tokens; (NextAuth optional later if needed).  
- AuthZ: Role + capability flags (platform_admin, agency_staff, client_user; tenant roles owner/admin/marketer/agency_marketer/viewer with capability JSON flags).  
- API security: API keys per tenant for transactional endpoints; rate limits per key/tenant; HMAC verification for webhooks.  
- PII/Security: Encrypt sensitive fields at rest; TLS; no secrets in logs; consent gate enforced before send; tenant isolation on all queries; audit logging per FRs.

### API & Communication
- API style: REST (tenant-scoped) with OpenAPI/Swagger from Nest.  
- Idempotency: Keys on send/resend/webhooks; retry/backoff with idempotent handlers.  
- Error model: Human-readable messages + machine codes; consistent 4xx/5xx.  
- Async: BullMQ/Redis for jobs (webhook ingest, resend scheduling, retries). Inter-service comms via HTTP + queues.

### Frontend Architecture
- Stack: Next.js (App Router), TS, Tailwind, shadcn.  
- State/data: React Query/SWR for data fetching; minimal global state.  
- Forms: React Hook Form + Zod; shadcn components.  
- Routing: Protected routes; tenant context; impersonation banner; checklist home.  
- Real-time-ish: Start with short polling for delivery/read ticks and resend timers; consider SSE or a push provider later if complexity stays manageable.

### Infrastructure & Deployment
- Hosting: Vercel for web; AWS ECS Fargate with ALB for API/worker; managed Redis (ElastiCache); managed Postgres (RDS).  
- CI/CD: GitHub Actions (lint/test/build), deploy to Vercel + API/worker pipeline.  
- Config: `.env` with typed config; secrets in secret manager.  
- Monitoring/Logs: Structured logging (pino/winston); ship to Datadog (or CloudWatch + Grafana if Datadog not available); metrics for sends, webhooks, queues, quotas; alerts on failure rates/backlog growth; tracing deferred unless needed.  
- Rate limits/quotas: Enforced per tenant/API key aligned to subscriptions; surface reasons to UI.

### Decision Impact Analysis
- Implementation sequence: scaffold projects → add Prisma/Postgres → auth/authz middleware + API keys → queues/BullMQ wiring → webhook handlers with idempotency → resend scheduling/timing guards → UI polling for status (SSE later if needed) → uplift/export views → observability/alerts.  
- Cross-dependencies: AuthZ depends on roles/capabilities; queues depend on Redis; resend timing depends on event ingest accuracy; UI status/polling depends on delivery/read events; quotas depend on subscription data.

## Implementation Patterns & Consistency Rules

### Naming Patterns
- Database: snake_case tables and columns (tenants, user_tenants, api_keys, messages, events, audit_logs); primary keys as id (uuid); foreign keys as {table}_id; indexes as idx_{table}_{columns}.
- API: REST, plural resources (/tenants, /campaigns); path params lower-cased (/:tenantId); query params camelCase; headers standard (X-Request-Id, X-Api-Key).
- Code: Files kebab-case (send-card.tsx); components PascalCase (SendCard); functions/vars camelCase (resendReadyAt); DTOs/interfaces PascalCase.

### Structure Patterns
- Repos: web, api, worker. Web: app/routes by feature; components by feature; lib/utils shared; tests co-located *.test.ts(x). API/worker: Nest modules per feature; services/controllers/entities/dto; tests co-located.
- Config: .env.* with typed config module; secrets not committed. Assets/docs: /public for static; docs/ for PRD/UX/architecture outputs.

### Format Patterns
- API responses: { data, error? } with error = { code, message }. 4xx for client; 5xx for server. Dates as ISO 8601 UTC strings.
- JSON fields camelCase externally; DB snake_case with ORM mapping.
- Errors: human-readable plus machine code (e.g., TEMPLATE_PENDING, CONSENT_MISSING, RESEND_TOO_SOON).

### Communication Patterns
- Events/webhooks: dotted lower-kebab (whatsapp.sent, whatsapp.delivered, whatsapp.read, email.delivered, email.bounced). Payloads include ids, tenantId, campaignId, messageId, timestamp ISO, idempotencyKey.
- State updates: immutable on client; prefer React Query/SWR for fetch/cache; avoid ad hoc global stores.
- Logging: structured JSON; fields: level, ts, msg, requestId, tenantId, userId/impersonatedUserId, route, errorCode.

### Process Patterns
- Validation: Zod/RHF on web; class-validator on Nest DTOs; validate before enqueue/send; block with explicit reason.
- Loading states: inline status on buttons/cards; toasts for ephemeral success; banners for blocking issues.
- Idempotency/retries: webhook handlers and send/resend operations use idempotency keys; retries with backoff; idempotent writes.
- Auth/impersonation: tenant required for tenant-scoped routes; impersonation banner/state; audit all impersonated actions.

### Enforcement Guidelines
- AI agents must follow: snake_case in DB; camelCase in APIs; ISO dates; {data,error} wrapper; structured logs with tenant/user/request IDs; idempotency for webhooks/send/resend; human-readable error codes/messages.
- Validate new patterns against this document; document exceptions explicitly in code comments/ADRs.

## Project Structure & Boundaries

### Complete Project Directory Structure (pnpm workspaces monorepo)

```
engageninja/
├── package.json                # pnpm workspaces
├── pnpm-workspace.yaml
├── .gitignore
├── .env.example
├── docs/                       # PRD, UX, architecture, status
│   ├── prd.md
│   ├── ux-design-specification.md
│   ├── architecture.md
│   └── bmm-workflow-status.yaml
├── .github/
│   └── workflows/
│       └── ci.yml              # lint/test/build per package
├── packages/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── package.json        # generated client consumed by api/worker
│   ├── config/                 # shared config helpers (typed env)
│   └── ui/                     # optional shared UI primitives (tokens/components)
├── web/                        # Next.js App Router
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── .env.example
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx        # checklist/home
│       │   ├── (auth)/...
│       │   ├── (tenant)/...
│       │   └── api/            # route handlers if needed
│       ├── components/
│       │   ├── ui/             # shadcn generated components
│       │   ├── features/       # feature-specific UI
│       │   └── layout/
│       ├── lib/                # fetchers, formatters, auth client, query hooks
│       ├── types/
│       ├── styles/             # globals.css, tokens
│       ├── middleware.ts
│       └── tests/              # co-located *.test.tsx also allowed
├── api/                        # NestJS REST API
│   ├── package.json
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/             # typed env, logger config
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── tenants/
│   │   │   ├── users/
│   │   │   ├── campaigns/
│   │   │   ├── templates/
│   │   │   ├── contacts/
│   │   │   ├── webhooks/       # WA/email ingest
│   │   │   ├── resend/
│   │   │   ├── reports/
│   │   │   └── admin/
│   │   ├── common/             # guards, interceptors, filters, decorators, dto
│   │   ├── jobs/               # queue producers
│   │   ├── infra/              # prisma client wrapper, redis, bullmq config
│   │   └── docs/               # Swagger/OpenAPI setup
│   ├── test/                   # unit/integration
│   └── prisma/                 # symlink or import from packages/prisma
├── worker/                     # NestJS (or lightweight Node) worker
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── main.ts
│       ├── queues/             # BullMQ processors for send, webhook ingest, retries
│       ├── services/           # resend scheduler, rate limiting checks
│       ├── infra/              # prisma client import, redis/bullmq config
│       └── common/             # logging, config
└── infra/                      # optional IaC (Terraform/CDK) if added later
```

### Architectural Boundaries
- API boundaries: Web calls API REST endpoints (tenant-scoped). Worker consumes queues; API produces jobs. Webhook endpoints in API ingest provider events and enqueue processing.
- Component boundaries: Web uses feature-based components; shared UI in components/ui; data access via lib/fetchers/hooks. API modules are bounded contexts; worker handles async.
- Data boundaries: Postgres via Prisma in packages/prisma; Redis for queues/rate limits; no cross-tenant data access; idempotency keys on messages/events/webhooks.

### Requirements to Structure Mapping (examples)
- Contacts & Consent: api/modules/contacts, templates; DB tables contacts, consent records; web components/features/contacts; tests in api/test/contacts and web tests co-located.
- Campaigns & Resend: api/modules/campaigns, resend; worker/queues for send/resend; web components/features/campaigns; status chips and resend card in web; idempotency in worker/api.
- Webhooks & Delivery/Read: api/modules/webhooks; worker queues/processors; DB events/messages; web uses polling/SSE later from app routes/fetchers.
- Multi-Tenant & Impersonation: api/modules/auth/tenants/users; middleware/guards; web middleware for tenant context + impersonation banner; audit logs tables.
- Quotas/Plans: api/modules/admin or billing/quota enforcement middleware; DB quotas/subscriptions; web surfaces limits in UI; Redis for counters.

### Integration Points
- External: Meta WhatsApp webhook -> api/modules/webhooks -> queue -> worker -> DB updates; SES/Brevo (fallback) webhooks similarly. API keys for transactional endpoints.
- Internal: Web -> API REST; API -> Redis queues; Worker -> DB/Redis; Admin tools via API.

### File Organization Patterns
- Config: .env.example per package; typed config module in api/worker; shared config helpers in packages/config.
- Source: feature-based in web/components/features and api/modules; shared utils in web/lib and api/common.
- Tests: co-located unit/integration in api/test and web/tests or *.test.ts(x); e2e can live in web/tests/e2e or root tests/e2e later.
- Assets: web/public for static; docs/ for product docs; migrations in packages/prisma/migrations.

### Development Workflow Integration
- Dev servers: web (next dev); api (nest start --watch); worker (nest start --watch or node). Env via .env.*.
- Build: per package; CI runs lint/test/build via pnpm workspaces and GH Actions.
- Deployment: web to Vercel; api/worker to AWS (e.g., ECS/Fargate); shared Postgres/Redis managed services. Secrets via cloud secret manager; env files for local only.

## Architecture Validation Results

### Coherence Validation ✅
- Decisions align: Next.js + NestJS + BullMQ/Redis + Postgres/RDS + ElastiCache + Vercel/ECS stack is coherent; Prisma fits Postgres; REST + OpenAPI matches PRD.
- Patterns support decisions: naming, response format, idempotency, and logging rules align with chosen tech; structure matches monorepo/workspaces.
- Structure alignment: web/api/worker + shared prisma client + feature modules supports boundaries and async/event flows.

### Requirements Coverage Validation ✅
- Functional: All PRD FR categories mapped to modules/components (contacts/consent, campaigns/resend, webhooks, multi-tenant, admin/impersonation, quotas, API keys, AI assist).
- Non-Functional: Performance, reliability, security/consent/audit, scalability (queues, Redis, RDS), observability, accessibility, integration robustness addressed.
- UX: Live ticks/resend timers via polling (SSE later), uplift snapshots, preflight/guardrails, impersonation/admin support covered by API + UI patterns.

### Implementation Readiness Validation ✅
- Decisions documented: stack, hosting (Vercel + ECS Fargate with ALB), Redis (ElastiCache), Postgres (RDS), SES primary / Brevo fallback, polling now (SSE later), JWT auth, Prisma ORM.
- Patterns complete: naming/format/communication/process rules defined; idempotency, error codes, consent/template/timing guards.
- Structure complete: pnpm monorepo with web/api/worker, shared prisma client, config/ui packages; integration points defined; requirement-to-structure mapping included.

### Gap Analysis Results
- Critical gaps: None.
- Important: Real-time beyond polling deferred; tracing deferred unless needed; choose Datadog vs CloudWatch+Grafana at deploy time (Datadog preferred).
- Nice-to-have: Add tracing if latency debugging needed; document exact polling intervals and SSE rollout criteria during implementation.

### Validation Issues Addressed
- Hosting/infra specifics locked (Vercel, ECS Fargate+ALB, ElastiCache, RDS).
- Email fallback chosen (Brevo).
- Real-time stance clarified (poll now, SSE later if needed).

### Architecture Completeness Checklist
**✅ Requirements Analysis**: context, scale, constraints, cross-cutting concerns  
**✅ Architectural Decisions**: stack, async, auth, quotas, observability, hosting  
**✅ Implementation Patterns**: naming, structure, communication, process rules  
**✅ Project Structure**: complete tree, boundaries, mappings, integration points  

### Architecture Readiness Assessment
**Overall Status:** READY FOR IMPLEMENTATION  
**Confidence Level:** High  
**Key Strengths:** Clear hero loop support (send→resend→uplift), strong safety rails (consent/template/timing), multi-tenant/agency with impersonation, idempotent event handling, consistent patterns.  
**Areas for Future Enhancement:** Add SSE/push if polling is insufficient; add tracing if needed; refine dashboards as scale grows.

### Implementation Handoff
- Document: docs/architecture.md (source of truth).
- First priority: Initialize projects (web/api/worker) via documented commands; set up RDS/ElastiCache config; apply Prisma schema; wire auth/authz + API keys; set up BullMQ queues; implement webhook ingest with idempotency; enforce preflight/consent/template/timing guards; enable polling for status/resend timers; surface uplift/export; add logging/metrics + alerts.
