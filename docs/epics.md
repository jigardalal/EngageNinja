---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - docs/prd.md
  - docs/architecture.md
  - docs/ux-design-specification.md
  - docs/ux-design-directions.html
---

# EngageNinja - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for EngageNinja, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: Users can sign up, create a tenant, and sign in with tenant-scoped access.
- FR2: Users can connect a WhatsApp number via Meta Cloud and view connection status.
- FR3: Users can select a plan/tier that gates features and quotas.
- FR4: Users can invite/manage tenant members with assigned tenant roles.
- FR5: Users can generate and revoke per-tenant API keys.
- FR6: Users can import contacts via CSV with deduplication and validation.
- FR7: Users can add/edit contacts manually, including email/WA number/first name.
- FR8: Users can capture and update consent flags (email/WhatsApp) with source and timestamp.
- FR9: Users can create and manage contact lists for targeting.
- FR10: Users can view synced WhatsApp templates and their approval status.
- FR11: Users can map template variables to contact fields before sending.
- FR12: Users can connect an email channel (when enabled) and view its status.
- FR13: Users can select a template for a campaign and validate required variables.
- FR14: Users can create and send a WhatsApp campaign to a selected list.
- FR15: Users can view delivery states (sent/delivered/read) for a campaign.
- FR16: Users can trigger a resend to non-readers/non-openers after a configurable wait.
- FR17: Users can compare resend uplift versus the original send.
- FR18: Users are blocked from sending to contacts without required consent.
- FR19: Users are prevented from resending before the minimum wait interval.
- FR20: Users can view per-campaign metrics (sent/delivered/read/open where applicable).
- FR21: Users can view resend usage and uplift metrics.
- FR22: Users can export or share a basic performance report.
- FR23: SMB users can view a simple “Sent/Read/Failed” dashboard.
- FR24: Agency staff can access multiple tenants from a tenant switcher.
- FR25: Agency owners can view tenant-level summary (send volume, read rates, resend usage).
- FR26: Agency owners can drill into a tenant’s campaign performance.
- FR27: Agency owners can duplicate a campaign pattern across tenants.
- FR28: Tenants can revoke agency access, immediately removing agency_marketer permissions.
- FR29: Platform admins can search tenants and impersonate a tenant user.
- FR30: Platform admins can inspect channels, API keys, and recent sends for a tenant.
- FR31: Platform admins can disable a channel and re-trigger failed webhooks.
- FR32: Platform admins can view system health signals relevant to delivery/webhooks.
- FR33: The system enforces tier-based limits (sends, users, tenants, AI tokens, API/webhooks).
- FR34: Users see errors or guidance when limits are exceeded or features are gated by tier.
- FR35: Agency tenants can be assigned per-tenant message pools aligned to tier.
- FR36: The system ingests WhatsApp webhooks (sent/delivered/read/failed).
- FR37: The system ingests email webhooks (delivered/bounced/complaint/open/click) when email is enabled.
- FR38: Users can configure webhook endpoints for their tenant (where enabled by tier).
- FR39: Authorized clients can send transactional WhatsApp messages via tenant API key (when enabled by tier).
- FR40: Authorized clients can send transactional email via tenant API key (when enabled by tier).
- FR41: The system records audit logs for logins, channel changes, API key usage, impersonation, and sends.
- FR42: The system stores consent events and prevents sending without consent.
- FR43: The system retains messages/events/audit logs per default retention policies with soft-delete for contacts.
- FR44: The system enforces tenant isolation on data access (no cross-tenant reads/writes).
- FR45: Users can request AI-generated campaign copy (WA/email) when enabled by tier/quota.
- FR46: Users can proceed without AI if AI is unavailable or quota is exceeded.

### NonFunctional Requirements

- NFR1: UI actions respond within ~2s P50 and ~4s P95 under normal load.
- NFR2: Webhook processing enqueues/updates events within ~5s P95 to keep resend filters accurate.
- NFR3: Resend scheduling respects minimum wait windows and executes within the scheduled window.
- NFR4: Target steady-state availability ~99.5%+ for control plane, with incidents logged and visible to admins.
- NFR5: Event handling is durable with retries/backoff; delivery/read handling is idempotent to avoid duplicates.
- NFR6: Encrypt PII at rest, TLS in transit, no secrets in logs, tokenized API keys, and tenant isolation on all access.
- NFR7: Enforce consent gates and audit logging; retain messages 12–18 months, events 24 months, audit logs 24–36 months; soft-delete contacts.
- NFR8: Scale to 15–30M WhatsApp and 20–50M email sends/month via horizontal scale for workers/webhook ingest and quota enforcement to prevent noisy neighbors.
- NFR9: Observability with metrics/logs for sends, delivery/read, webhook success/failure, resend jobs, and quota checks; alerts on sustained failure rates or backlog growth.
- NFR10: Adhere to WCAG 2.1 AA basics on critical flows (forms, buttons, focus, contrast).
- NFR11: Webhooks authenticated, retried with backoff, idempotent; API rate limits aligned to tier to protect stability.

### Additional Requirements

- Stack/template: Next.js (App Router, TS, Tailwind, shadcn/ui) for web; NestJS REST API with validation/OpenAPI; worker service with BullMQ/Redis; Prisma ORM with Postgres; pnpm monorepo structure (web/api/worker/shared prisma).
- Hosting/deploy: Web on Vercel; API/worker on AWS ECS Fargate behind ALB; managed Postgres (RDS) and Redis (ElastiCache); secrets via env/secret manager; GitHub Actions CI for lint/test/build/deploy.
- Auth/security: JWT-based auth; API keys per tenant; HMAC verification for provider webhooks; role + capability flags (platform_admin, agency_staff, client_user; tenant roles owner/admin/marketer/agency_marketer/viewer); strict tenant isolation and audit logging including impersonation actions.
- Messaging/async: Idempotency keys on send/resend/webhooks; retries/backoff for jobs; queue-driven resend scheduling; rate limits/quotas enforced per subscription tier; consent/template approval/timing guards before send/resend.
- Data/residency: Single-region MVP with data_region flag for future enforcement; per-tenant isolation; retention defaults as noted; avoid cross-region data storage until needed.
- Channels/providers: WhatsApp via Meta Cloud API (primary); SES primary email with Brevo fallback later; webhook ingestion for WA/email events.
- Observability/ops: Structured logging with tenant/user/request context; metrics/dashboards for sends, webhooks, queues, quotas; alerts on backlog/failures; admin health views and recovery actions (retry webhooks, disable channels).
- UX-critical behaviors: Preflight checklist with explicit Allowed/Blocked/Waiting reasons; inline error messaging with human-language fixes; live sent/delivered/read ticks; resend card with countdown and one-click CTA; uplift snapshot with export/share; tenant switcher and impersonation banner; onboarding checklist; responsive web-first design; mobile-friendly monitoring; polite live regions for status updates.
- Accessibility/guardrails: Human-readable block reasons (consent, template approval, timing, quotas); evidence-first UI (uplift proof, delivery/read visibility); safety rails without blocking progress; autosave/undo cues; clear status chips/banners.

### FR Coverage Map

{{requirements_coverage_map}}

## Epic List

### Epic 1: Tenant Access & Identity
Users can sign up, create a tenant, sign in, manage tenant roles, API keys, and keep tenants isolated.  
**FRs covered:** FR1, FR4, FR5, FR44

### Story 1.1: User Signup & Login

As a user,
I want to register and sign in,
So that I can access my tenant workspace.

**Acceptance Criteria:**

**Given** I’m on signup with a valid email/password  
**When** I submit the form  
**Then** an account is created and I’m signed in

**Given** I’m on login with valid credentials  
**When** I submit  
**Then** I’m signed in to my last-used tenant

**Given** I enter invalid credentials  
**When** I submit  
**Then** I see a clear error and remain signed out

### Story 1.2: Tenant Creation & Selection

As a signed-in user,
I want to create/select a tenant,
So that my actions are scoped to that tenant.

**Acceptance Criteria:**

**Given** I’m signed in  
**When** I create a tenant  
**Then** the tenant is created and set as the active context

**Given** I have multiple tenants  
**When** I open the tenant switcher and pick one  
**Then** the active tenant changes and persists for my session

**Given** I try to act without an active tenant  
**When** I call a protected route  
**Then** I’m prompted to select a tenant

**Platform note:** Tenant creation UI is reserved for platform admins; regular signups receive a platform-assigned tenant automatically, and the switcher UI only surfaces once a user owns more than two tenants (single-tenant users land straight on the dashboard, zero-tenant users see an informative “No tenant assigned” prompt to contact support).

### Story 1.3: Tenant Roles & Member Management

As a tenant admin/owner,
I want to invite and manage members with roles,
So that access is controlled per tenant.

**Acceptance Criteria:**

**Given** I’m an owner/admin in a tenant  
**When** I invite a user with a role  
**Then** they receive an invite and appear pending until acceptance

**Given** a member exists  
**When** I change their role  
**Then** the new role takes effect immediately for subsequent actions

**Given** a member is removed  
**When** they attempt access  
**Then** access is denied for that tenant

### Story 1.4: Tenant API Keys

As a tenant admin/owner,
I want to create and revoke tenant API keys,
So that integrations can authenticate per tenant.

**Acceptance Criteria:**

**Given** I’m an owner/admin  
**When** I create an API key  
**Then** a token is generated, shown once, and stored hashed

**Given** an active key  
**When** I revoke it  
**Then** subsequent requests with that key are rejected

**Given** I view keys  
**When** I load the list  
**Then** I see active/revoked status without revealing secrets

### Story 1.5: Tenant Isolation Enforcement

As a platform user,
I want strict tenant scoping enforced,
So that data and actions never cross tenants.

**Acceptance Criteria:**

**Given** a request includes tenant context  
**When** it queries data  
**Then** only that tenant’s data is returned

**Given** a user lacks membership in a tenant  
**When** they request that tenant’s data  
**Then** the request is rejected with a clear error

**Given** impersonation is off  
**When** I switch tenants  
**Then** audit/logging records the active tenant change

### Epic 2: Plans & Quotas Governance
Users select a plan; the system enforces tier limits and shows guidance/errors; tenant message pools by tier.  
**FRs covered:** FR3, FR33, FR34, FR35

Implementation note: The five-tier PlanTier/UsageCounter schema (Free/Starter/Growth/Agency/Enterprise) drives `PlanTierService`, and runtime gating uses `FeatureGuard` + `@RequireFeature` to check capability flags before `QuotaService` validates resource pools. Tenant guards (`ActiveTenantGuard`) still ensure every check runs inside the active tenant context so resource quotas follow tenant isolation.

### Story 2.1: Plan Selection & Change

As a tenant admin,
I want to choose or change a plan,
So that features and quotas align to my needs.

**Acceptance Criteria:**

**Given** I’m a tenant admin  
**When** I pick a plan  
**Then** the plan is saved and shown as active for the tenant

**Given** I have an active plan  
**When** I change plans  
**Then** the new plan is stored and reflected in allowed features and limits

**Given** a plan change affects limits  
**When** it’s applied  
**Then** I see a confirmation of the new quotas and features

### Story 2.2: Enforce Tier Limits at Runtime

As a tenant user,
I want limits enforced per plan,
So that usage stays within allowed quotas.

**Acceptance Criteria:**

**Given** my tenant has specific send/user/tenant/AI/webhook limits  
**When** I operate within limits  
**Then** actions succeed

**Given** I exceed a limit  
**When** I attempt the action  
**Then** it is blocked and an error code and reason are returned

**Given** limits change with plan upgrades or downgrades  
**When** limits update  
**Then** subsequent checks use the new limits

### Story 2.3: User Guidance on Gated Features

As a tenant user,
I want clear guidance when a feature is gated,
So that I know how to unlock it.

**Acceptance Criteria:**

**Given** a feature is not in my plan  
**When** I try to access it  
**Then** I see a human-readable message with the plan requirement

**Given** I’m gated  
**When** I view the message  
**Then** I see the current plan and which plan(s) unlock the feature

**Given** I’m gated  
**When** I close the message  
**Then** the UI returns me safely without partial actions

### Story 2.4: Tenant Message Pools by Tier

As a tenant admin,
I want send pools allocated per plan,
So that message capacity matches my tier.

**Acceptance Criteria:**

**Given** my plan has a monthly send pool  
**When** I send messages  
**Then** the pool decrements accordingly

**Given** the pool is exhausted  
**When** I try to send  
**Then** the send is blocked with a clear limit-exceeded reason

**Given** the period resets  
**When** a new period starts  
**Then** the pool resets and sends are allowed again

### Epic 3: Contacts & Consent Management
Import/manual contacts, consent capture/update, lists, consent blocks, retention.  
**FRs covered:** FR6, FR7, FR8, FR9, FR18, FR42, FR43

### Story 3.1: CSV Contact Import with Dedup/Validation

As a tenant user,
I want to import contacts via CSV with deduplication and validation,
So that my list is clean and usable.

**Acceptance Criteria:**

**Given** I upload a CSV with valid rows  
**When** I import  
**Then** contacts are created with email, WA number, and first name populated

**Given** duplicates by email or WA exist  
**When** I import  
**Then** duplicates are skipped or merged per rule and surfaced in the result

**Given** invalid rows exist  
**When** I import  
**Then** they are rejected with clear reasons and counts

### Story 3.2: Manual Contact Add/Edit

As a tenant user,
I want to add and edit contacts manually,
So that I can manage individuals without a CSV.

**Acceptance Criteria:**

**Given** I enter a valid contact  
**When** I save  
**Then** the contact is stored with email, WA number, and first name

**Given** I edit a contact  
**When** I save  
**Then** changes persist and are visible on reload

**Given** required fields are missing or invalid  
**When** I save  
**Then** I see a clear validation error

### Story 3.3: Consent Capture & Update

As a tenant user,
I want to capture and update consent flags with source and timestamp,
So that sends respect permissions.

**Acceptance Criteria:**

**Given** a contact  
**When** I set consent_email_marketing or consent_whatsapp_marketing with source and timestamp  
**Then** the consent state saves

**Given** consent changes  
**When** I update it  
**Then** the change is logged with the new timestamp and source

**Given** consent is missing or revoked  
**When** I attempt to send to that contact  
**Then** the send is blocked per consent rules

### Story 3.4: Contact Lists Management

As a tenant user,
I want to create and manage lists,
So that I can target campaigns.

**Acceptance Criteria:**

**Given** I name a list  
**When** I create it  
**Then** it is saved and visible for selection

**Given** contacts  
**When** I add or remove them from a list  
**Then** membership updates and is reflected in counts

**Given** a list is deleted  
**When** I view lists  
**Then** it no longer appears and memberships are removed

### Story 3.5: Consent-Based Send Blocking

As a tenant user,
I want sends blocked when consent is missing,
So that I stay compliant.

**Acceptance Criteria:**

**Given** contacts lacking required consent  
**When** I attempt to send  
**Then** those contacts are excluded and the send proceeds only to consented recipients

**Given** all targeted contacts lack consent  
**When** I attempt to send  
**Then** the send is blocked with a clear reason

**Given** some contacts are excluded  
**When** the send completes  
**Then** I see counts of included and excluded contacts with reasons

### Story 3.6: Contact Retention & Soft-Delete

As a tenant admin,
I want retention and soft-delete for contacts,
So that data lifecycle respects policy.

**Acceptance Criteria:**

**Given** a contact is soft-deleted  
**When** I query contacts  
**Then** it no longer appears in active lists or sends

**Given** retention policies  
**When** a contact hits retention thresholds  
**Then** it is marked per policy and excluded from sends

**Given** a soft-deleted contact  
**When** I view audit or metadata  
**Then** the deletion status is evident (not hard-deleted)

### Epic 4: Channels & Template Readiness
Connect WA/email channels, sync template approvals, map variables, validate readiness before send.  
**FRs covered:** FR2, FR10, FR11, FR12, FR13

### Story 4.1: WhatsApp Channel Connect & Status

As a tenant user,
I want to connect a WhatsApp number via Meta Cloud and see status,
So that I can send WhatsApp campaigns.

**Acceptance Criteria:**

**Given** I provide valid WhatsApp credentials or token  
**When** I connect  
**Then** the channel status shows connected and usable

**Given** credentials are invalid or expired  
**When** I connect  
**Then** I see a clear error and the channel remains disconnected

**Given** the channel is connected  
**When** I view status  
**Then** I see current connection state and last sync time

### Story 4.2: Email Channel Connect & Status (Tier-Gated)

As a tenant user (where email is enabled),
I want to connect an email channel and see status,
So that I can send email campaigns when allowed.

**Acceptance Criteria:**

**Given** my plan includes email  
**When** I connect with valid credentials  
**Then** the channel shows connected

**Given** my plan excludes email  
**When** I attempt connect  
**Then** I’m blocked with a gating message (no partial configuration)

**Given** the channel is connected  
**When** I view status  
**Then** I see current connection state and last sync or verification result

### Story 4.3: Template Sync & Approval State

As a tenant user,
I want to view synced WhatsApp templates and their approval state,
So that I select allowed templates.

**Acceptance Criteria:**

**Given** WhatsApp templates exist  
**When** I sync  
**Then** approved, pending, and rejected states are stored and displayed

**Given** a template is pending or rejected  
**When** I attempt to select it  
**Then** I see the state and guidance to choose an approved template

**Given** templates update at the provider  
**When** I sync again  
**Then** states refresh accordingly

### Story 4.4: Template Variable Mapping

As a tenant user,
I want to map template variables to contact fields,
So that sends have required substitutions.

**Acceptance Criteria:**

**Given** a template with variables  
**When** I open mapping  
**Then** required variables are listed with type hints or placeholders

**Given** I map variables to contact fields or constants  
**When** I save  
**Then** the mappings persist for the campaign

**Given** required variables are unmapped  
**When** I try to proceed  
**Then** I’m blocked with a clear instruction

### Story 4.5: Template Validation Before Send

As a tenant user,
I want validation on template readiness,
So that sends only use approved, fully mapped templates.

**Acceptance Criteria:**

**Given** a template is approved and fully mapped  
**When** I proceed to send  
**Then** template validation passes

**Given** a template is pending or rejected  
**When** I attempt send  
**Then** I’m blocked with a clear reason

**Given** mappings are incomplete  
**When** I attempt send  
**Then** I’m blocked until all required variables are mapped

### Epic 5: Campaign Send & Delivery Tracking
Send WA campaigns to lists; see sent/delivered/read states.  
**FRs covered:** FR14, FR15

### Story 5.1: Campaign Creation & Send (WhatsApp)

As a tenant user,
I want to create and send a WhatsApp campaign to a selected list,
So that recipients get the message.

**Acceptance Criteria:**

**Given** I select a tenant, audience list, channel = WhatsApp, and an approved and mapped template  
**When** I send  
**Then** the campaign is created and queued for delivery

**Given** required fields are missing (audience, template, channel)  
**When** I attempt send  
**Then** I’m blocked with a clear reason

**Given** send is initiated  
**When** it starts  
**Then** I see a confirmation that the campaign is in progress

### Story 5.2: Delivery & Read State Tracking

As a tenant user,
I want to see sent, delivered, and read states for a campaign,
So that I know delivery outcomes.

**Acceptance Criteria:**

**Given** a campaign is sending  
**When** delivery or read events arrive  
**Then** sent, delivered, and read counts update for that campaign

**Given** no events have arrived yet  
**When** I view the campaign  
**Then** I see a pending or sending state (not stuck)

**Given** events arrive late or out of order  
**When** they are processed  
**Then** counts remain accurate via idempotent handling

### Epic 6: Resend & Uplift Optimization
Resend to non-readers with timing guards; compare uplift.  
**FRs covered:** FR16, FR17, FR19

### Story 6.1: Resend Readiness & Timing Guard

As a tenant user,
I want resend readiness with timing guards,
So that I only resend when allowed.

**Acceptance Criteria:**

**Given** a campaign has been sent  
**When** the minimum wait window has not passed  
**Then** resend is unavailable with a clear timer or reason

**Given** the wait window passes  
**When** I view the campaign  
**Then** a resend option shows with eligible audience (non-readers)

**Given** resend is not applicable  
**When** I view it  
**Then** I see why it’s unavailable

### Story 6.2: Resend to Non-Readers

As a tenant user,
I want to resend to non-readers,
So that I can improve reach without spamming readers.

**Acceptance Criteria:**

**Given** eligible non-readers exist  
**When** I trigger resend  
**Then** a new send is queued to those non-readers only

**Given** some contacts are ineligible (consent, template, or state)  
**When** I resend  
**Then** they are excluded with clear counts and reasons

**Given** resend is queued  
**When** it runs  
**Then** I see confirmation and status separate from the original send

### Story 6.3: Resend Uplift Comparison

As a tenant user,
I want to compare resend uplift versus the original,
So that I can see performance gain.

**Acceptance Criteria:**

**Given** an original send and a resend  
**When** delivery or read events arrive  
**Then** uplift stats compute for the resend audience

**Given** uplift is computed  
**When** I view the campaign  
**Then** I see original versus resend metrics side by side with a net uplift

**Given** no resend occurred  
**When** I view uplift  
**Then** the UI shows that no resend exists (no misleading metrics)

### Epic 7: Dashboards & Reporting
Campaign metrics, resend usage, exports, SMB simple dashboard.  
**FRs covered:** FR20, FR21, FR22, FR23

### Story 7.1: Campaign Metrics Dashboard

As a tenant user,
I want to view campaign metrics,
So that I can monitor performance.

**Acceptance Criteria:**

**Given** campaigns exist  
**When** I open the dashboard  
**Then** I see per-campaign sent, delivered, and read metrics

**Given** a campaign has no events yet  
**When** I view it  
**Then** I see a pending or sending state without errors

**Given** events update  
**When** I refresh or data auto-refreshes  
**Then** counts reflect the latest delivery and read events

### Story 7.2: Resend Usage & Uplift View

As a tenant user,
I want to see resend usage and uplift,
So that I can gauge resend impact.

**Acceptance Criteria:**

**Given** campaigns with resends exist  
**When** I view resend usage  
**Then** I see resend count and uplift stats per campaign

**Given** no resend exists for a campaign  
**When** I view uplift  
**Then** it clearly shows no resend data available

### Story 7.3: Export or Share Performance Report

As a tenant user,
I want to export or share a performance report,
So that I can share results.

**Acceptance Criteria:**

**Given** campaigns exist  
**When** I export  
**Then** a report with campaign metrics (sent, delivered, read, resend, uplift) is generated

**Given** export is requested  
**When** generation starts  
**Then** I see progress or completion feedback

**Given** an error occurs during export  
**When** I attempt it  
**Then** I see a clear error and the action is safely canceled

### Story 7.4: SMB Simple Dashboard

As an SMB user,
I want a simple sent/read/failed dashboard,
So that I can quickly understand campaign health.

**Acceptance Criteria:**

**Given** I open the SMB dashboard  
**When** campaigns exist  
**Then** I see sent, delivered or read, and failed at a glance

**Given** there are no campaigns  
**When** I view the dashboard  
**Then** I see an empty state with guidance to send

**Given** data updates  
**When** I revisit or refresh  
**Then** the simple metrics reflect the latest state

### Epic 8: Multi-Tenant Agency Oversight
Tenant switcher, cross-tenant summaries, drill-downs, duplicate patterns, revoke agency access.  
**FRs covered:** FR24, FR25, FR26, FR27, FR28

### Story 8.1: Tenant Switcher

As an agency staff user,
I want to switch between tenants,
So that I can work across clients.

**Acceptance Criteria:**

**Given** I belong to multiple tenants  
**When** I open the switcher and select a tenant  
**Then** the active tenant changes and context persists

**Given** I select a tenant  
**When** the switch completes  
**Then** the UI reflects the new tenant context without mixing data

### Story 8.2: Cross-Tenant Summary View

As an agency owner or director,
I want a summary across tenants,
So that I can see send volume, read rates, and resend usage.

**Acceptance Criteria:**

**Given** multiple tenants exist  
**When** I view the summary  
**Then** I see key metrics per tenant (sends, read rates, resend usage)

**Given** data refreshes  
**When** I revisit  
**Then** metrics show the latest values

### Story 8.3: Tenant Drill-Down

As an agency user,
I want to drill into a tenant,
So that I can inspect campaign performance.

**Acceptance Criteria:**

**Given** I select a tenant from the summary  
**When** I drill down  
**Then** I see that tenant’s campaign metrics and resend usage

**Given** I navigate back  
**When** I return to the summary  
**Then** I remain in the agency context

### Story 8.4: Duplicate Campaign Pattern Across Tenants

As an agency user,
I want to duplicate a campaign pattern across tenants,
So that I can reuse successful campaigns.

**Acceptance Criteria:**

**Given** a source campaign exists  
**When** I choose “duplicate across tenants” and select target tenants  
**Then** drafts are created for those tenants with the same template and mapping settings

**Given** any target tenant is missing required channel or template readiness  
**When** I duplicate  
**Then** I see which tenants failed and why; successful ones still get drafts

### Story 8.5: Revoke Agency Access

As a tenant owner,
I want to revoke agency access,
So that agency users lose access immediately.

**Acceptance Criteria:**

**Given** agency access exists  
**When** I revoke it  
**Then** agency users lose access immediately for that tenant

**Given** a revoked agency user attempts access  
**When** they try to view or act in the tenant  
**Then** access is denied with a clear reason

### Epic 9: Admin Operations & Recovery
Search tenants, impersonate, inspect channels/API keys/last sends, disable channel/retrigger webhooks, system health, audit logs.  
**FRs covered:** FR29, FR30, FR31, FR32, FR41

### Story 9.1: Search Tenants and Impersonate

As a platform admin,
I want to search tenants and impersonate a tenant user,
So that I can investigate issues.

**Acceptance Criteria:**

**Given** I search tenants by name, email, or domain  
**When** I select one  
**Then** I can view tenant details

**Given** I start impersonation  
**When** I enter tenant context  
**Then** an impersonation banner shows and all actions are audited

**Given** I stop impersonation  
**When** I exit  
**Then** the banner is removed and audit logs capture start and stop

### Story 9.2: Inspect Channels, API Keys, and Recent Sends

As a platform admin,
I want to inspect channels, API keys, and recent sends for a tenant,
So that I can diagnose issues.

This persona also owns tenant creation and is responsible for the tenant-picker gating: only platform-admin-provisioned tenants exist for users, and the picker appears only when a user has more than two tenant associations.

**Acceptance Criteria:**

**Given** I view a tenant  
**When** I open channels and keys  
**Then** I see status (connected or failed) and active or revoked keys (hashed display)

**Given** recent sends exist  
**When** I view them  
**Then** I see recent campaign and transactional activity with status

### Story 9.3: Disable Channel or Retrigger Webhooks

As a platform admin,
I want to disable a channel and retrigger failed webhooks,
So that I can recover from outages.

**Acceptance Criteria:**

**Given** a channel is problematic  
**When** I disable it  
**Then** sends over that channel are blocked until re-enabled, with an audit entry

**Given** failed webhooks exist  
**When** I retrigger them  
**Then** retried events are processed idempotently and results are logged

### Story 9.4: System Health View

As a platform admin,
I want a system health view,
So that I can see delivery, webhook, and queue health.

**Acceptance Criteria:**

**Given** I open system health  
**When** metrics load  
**Then** I see status for delivery/read ingestion, queues, and error rates

**Given** degradation occurs  
**When** thresholds are exceeded  
**Then** the view highlights the issue and suggests recovery actions

### Story 9.5: Audit Logs for Admin and Impersonation

As a platform admin,
I want audit logs for admin and impersonation actions,
So that actions are traceable.

**Acceptance Criteria:**

**Given** admin or impersonation actions occur  
**When** they are performed  
**Then** logs record actor, tenant, action, target, time, and result

**Given** I review logs  
**When** I filter by actor or tenant  
**Then** I can see relevant entries with timestamps

### Epic 10: Webhooks & Integrations Platform
Ingest WA/email webhooks and let tenants configure endpoints.  
**FRs covered:** FR36, FR37, FR38

### Story 10.1: Ingest WhatsApp Webhooks

As the platform,
I want to ingest WhatsApp webhooks for sent, delivered, read, and failed,
So that campaign status is accurate.

**Acceptance Criteria:**

**Given** WhatsApp sends webhooks  
**When** they arrive  
**Then** events are authenticated, parsed, and stored idempotently

**Given** duplicate or out-of-order events  
**When** they are processed  
**Then** counts remain accurate without duplication

**Given** an invalid webhook  
**When** it arrives  
**Then** it is rejected and logged with a reason

### Story 10.2: Ingest Email Webhooks (Tier-Gated)

As the platform,
I want to ingest email webhooks (delivered, bounced, complaint, open, click),
So that email campaign status is accurate when email is enabled.

**Acceptance Criteria:**

**Given** my plan includes email  
**When** email webhooks arrive  
**Then** events are authenticated, parsed, and stored idempotently

**Given** the plan excludes email  
**When** email webhooks are received  
**Then** they are ignored or rejected with a clear log reason

**Given** duplicate events  
**When** processed  
**Then** counts remain accurate without duplication

### Story 10.3: Tenant Webhook Endpoint Configuration

As a tenant user,
I want to configure my webhook endpoint,
So that I can receive campaign events.

**Acceptance Criteria:**

**Given** I provide a valid HTTPS endpoint  
**When** I save it  
**Then** the endpoint is stored and used for outbound tenant webhooks where enabled

**Given** the endpoint is unreachable or invalid  
**When** I test it  
**Then** I see a failure with a reason

**Given** webhooks are sent to my endpoint  
**When** delivery fails  
**Then** retries with backoff occur up to a limit and failures are logged

### Epic 11: Transactional Messaging APIs
Tenant-scoped API key send for WA/email.  
**FRs covered:** FR39, FR40

### Story 11.1: Transactional WhatsApp via API Key

As an authorized client,
I want to send transactional WhatsApp messages via a tenant API key,
So that I can integrate programmatically.

**Acceptance Criteria:**

**Given** I present a valid tenant API key and payload  
**When** I call the transactional WhatsApp endpoint  
**Then** the message is accepted, queued, and associated with the tenant

**Given** the API key is invalid or revoked  
**When** I call the endpoint  
**Then** the request is rejected with a clear error

**Given** required fields are missing or invalid  
**When** I call the endpoint  
**Then** validation fails with explicit reasons

### Story 11.2: Transactional Email via API Key (Tier-Gated)

As an authorized client (email-enabled),
I want to send transactional email via a tenant API key,
So that I can integrate programmatically.

**Acceptance Criteria:**

**Given** email is enabled for the tenant and a valid API key is provided  
**When** I call the transactional email endpoint with required fields  
**Then** the message is accepted, queued, and associated with the tenant

**Given** the tenant plan excludes email  
**When** I call the endpoint  
**Then** the request is rejected with a clear gating reason

**Given** the API key is invalid or revoked  
**When** I call the endpoint  
**Then** the request is rejected with a clear error

### Epic 12: AI-Assisted Campaign Creation
AI copy generation with fallback when unavailable or over quota.  
**FRs covered:** FR45, FR46

### Story 12.1: AI Campaign Copy Generation

As a tenant user,
I want AI-generated campaign copy,
So that I can draft messages faster.

**Acceptance Criteria:**

**Given** I request AI copy with prompts or context  
**When** the request is valid and within quota  
**Then** AI returns suggested WhatsApp or email copy with variables or placeholders highlighted

**Given** AI returns suggestions  
**When** I view them  
**Then** I can accept or edit before sending

### Story 12.2: AI Unavailable or Over Quota Fallback

As a tenant user,
I want a fallback when AI is unavailable or over quota,
So that I can proceed without AI.

**Acceptance Criteria:**

**Given** AI is unavailable or quota is exceeded  
**When** I request AI copy  
**Then** I see a clear message and am allowed to proceed manually

**Given** I proceed without AI  
**When** I finalize the campaign  
**Then** the flow completes without AI content

## FR Coverage Map

FR1: Epic 1 - Tenant creation/login & identity  
FR2: Epic 4 - WA connect/status  
FR3: Epic 2 - Plan selection/tier gating  
FR4: Epic 1 - Tenant member roles  
FR5: Epic 1 - Per-tenant API keys  
FR6: Epic 3 - CSV import with dedup/validation  
FR7: Epic 3 - Manual contact add/edit  
FR8: Epic 3 - Consent capture/update  
FR9: Epic 3 - Lists  
FR10: Epic 4 - Template sync/approval status  
FR11: Epic 4 - Variable mapping  
FR12: Epic 4 - Email channel connect/status  
FR13: Epic 4 - Template selection/validation  
FR14: Epic 5 - WA campaign send  
FR15: Epic 5 - Delivery/read states  
FR16: Epic 6 - Resend to non-readers  
FR17: Epic 6 - Uplift comparison  
FR18: Epic 3 - Consent block  
FR19: Epic 6 - Resend timing guard  
FR20: Epic 7 - Campaign metrics  
FR21: Epic 7 - Resend usage/uplift  
FR22: Epic 7 - Export/share report  
FR23: Epic 7 - SMB simple dashboard  
FR24: Epic 8 - Tenant switcher  
FR25: Epic 8 - Cross-tenant summary  
FR26: Epic 8 - Drill-down  
FR27: Epic 8 - Duplicate pattern across tenants  
FR28: Epic 8 - Revoke agency access  
FR29: Epic 9 - Search tenants & impersonate  
FR30: Epic 9 - Inspect channels/API keys/sends  
FR31: Epic 9 - Disable channel/retrigger webhooks  
FR32: Epic 9 - System health  
FR33: Epic 2 - Enforce tier limits  
FR34: Epic 2 - Guidance/errors on limits  
FR35: Epic 2 - Message pools by tier  
FR36: Epic 10 - WA webhooks ingest  
FR37: Epic 10 - Email webhooks ingest  
FR38: Epic 10 - Tenant webhook endpoints  
FR39: Epic 11 - Transactional WA via API key  
FR40: Epic 11 - Transactional email via API key  
FR41: Epic 9 - Audit logs  
FR42: Epic 3 - Consent enforcement  
FR43: Epic 3 - Retention/soft-delete  
FR44: Epic 1 - Tenant isolation  
FR45: Epic 12 - AI-generated campaign copy  
FR46: Epic 12 - AI fallback
