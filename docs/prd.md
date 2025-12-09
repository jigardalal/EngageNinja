---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
inputDocuments:
  - docs/analysis/product-brief-EngageNinja-2025-12-08.md
  - docs/engageninja-master-prd-v0.6.md
  - docs/engageninja-prd-v0.5-with-openapi.md
documentCounts:
  briefs: 3
  research: 0
  brainstorming: 0
  projectDocs: 0
workflowType: 'prd'
lastStep: 11
project_name: 'EngageNinja'
user_name: 'Jigs'
date: '2025-12-08'
---

# Product Requirements Document - EngageNinja

**Author:** Jigs
**Date:** 2025-12-08

## Executive Summary
EngageNinja is an AI-first, WhatsApp-first engagement platform for agencies and WhatsApp-heavy SMBs. It replaces the fragmented 5–7 tool stack (WA, email, automation, CRM, analytics) with one data model and AI-assisted campaigns. Agencies run multi-client ops from one login with resend-driven uplift and unified reporting; SMBs ship pro-grade WA/email campaigns without specialist teams, seeing faster time-to-send and measurable uplift.

### What Makes This Special
- WhatsApp-first (not an email retrofit) for India/SEA/LATAM/Middle East markets.
- AI as a built-in campaign drafter (ideas → WA/email copy → resend).
- Agency-native multi-tenant model with impersonation and shared ops.
- Adapter-friendly core to layer CRM/Ads/Inbox later without rebuild.

## Project Classification
**Technical Type:** saas_b2b (web app + API backend)  
**Domain:** general (marketing/engagement)  
**Complexity:** low  
**Project Context:** Greenfield - new project

Stack/context signals: Next.js UI; Node/Nest API + workers (Redis/BullMQ); Postgres; WA/email providers; resend loop; adapter pattern for future CRM/Ads; API-first with public tenant-scoped endpoints.

## Success Criteria

### User Success
- Activation speed: First WA campaign sent < 30 minutes from tenant creation; first resend uplift within 7 days.
- Engagement quality: WA delivery > 95%; WA read 65–85%; Email open 22–35%; resend uplift +8–20% opens/reads.
- Usage behavior: Weekly Active Tenants (WAT) > 60%; ≥50% tenants send ≥1 campaign/week; >70% campaigns AI-assisted; >40% tenants use Resend monthly; 3–7 dashboards viewed/tenant/week.
- Channel enablement: ≥45% tenants with both WA + Email enabled (post-MVP target).

### Business Success
- Near-term (first 3 months post-beta): 30–60 tenants; 40–50% agency / 50–60% SMB; 70% connect WA; 45% connect both WA+Email; median TTF campaign < 45 min; 30% use Resend once; 50% use AI in first 3 days; MRR $6k–$12k; ARPA $150–$300; trial→paid 20–30%.
- 12-month: 600–1,000 tenants (40% agency / 60% SMB); agency tenants manage 6–25 clients each; 80–120 new tenants/month; MRR $180k–$300k; gross margin 75–85%; NRR 110–130%; WA sends/mo 15–30M; email sends/mo 20–50M; AI assist > 80% campaigns.
- Economics: CAC SMB $40–$120; CAC agency $150–$400; payback SMB < 3 months; payback agency < 4–6 months; LTV SMB $900–$2,400; LTV agency $3,600–$12,000+; gross margin target 80%+; tool savings: agencies $80–$200/client/month; SMBs $50–$150/month.

### Technical Success
- Reliability/Delivery: WA delivery > 95%; WA read 65–85%; Email delivery/open within targets above; incident-free days trending up; MTTR low (track/resolved rapidly).
- Performance/Throughput: Supports WA/email volumes to hit 15–30M WA and 20–50M email/month at 12-month scale; resend jobs execute within scheduled windows.
- Data/Integrity: Accurate event ingestion (sent/delivered/read/open) powering resend filters and dashboards; tenant-scoped isolation (multi-tenant/agency).
- Security/Access: API-key auth for public tenant APIs; impersonation controlled; least-privilege roles for agency/client contexts.

### Measurable Outcomes
- Activation: Median TTF first WA campaign < 30 min; median time to first Resend < 7 days; ≥65% new tenants send in 48h; ≥40% send second campaign in 7 days.
- Engagement/Value: Resend uplift ≥ +10% read; ≥25% Week-1 users trigger Resend; ≥3 campaigns/tenant/month (WA) by Week-4; Week-4 tenant retention ≥ 45–55%.
- Revenue Readiness: Trial→Paid ≥ 20%; ARPA ≥ $120; GM ≥ 70%; support tickets/tenant/month ≤ 2.

## Product Scope

### MVP - Minimum Viable Product
- Day-0 Aha: Tenant creation/login; WA connect (single provider, one number/template sync); CSV contacts (email, WA number, first name); list broadcast; live WA sent/delivered/read; basic dashboard.
- Week-1 Aha: Event storage for WA read; filter “not read in X hours/days”; one-click resend reusing template; uplift visibility.
- Agency essentials: Multi-tenant; agency staff access; impersonation; basic per-tenant reporting; API keys for transactional send.

### Growth Features (Post-MVP)
- Email channel; AI campaign generation; segments; basic automation (2–3 triggers); richer dashboards; transactional API polish; Meta Pixel ingestion.

### Vision (Future)
- Visual automation; adapters (CRM/Ads); AI replies/inbox; omnichannel; A/B testing; advanced analytics; broader permissions/SSO once core loops are proven.

## User Journeys

**Journey 1: Agency Marketer – Day-0 Send + Week-1 Resend (Core Value Loop)**  
Day 0: Logs in, selects the right tenant, connects WA (or confirms it’s already connected), imports CSV (emails, WA numbers, first names), handles duplicate warnings, creates a list, picks an approved WA template, maps 1–3 variables, and sends. Watches live sent/delivered/read.  
Day 7: Filters “not read in X hours/days,” triggers resend with same template, sees uplift (+10–20%).  
Edge cases handled: WA template not approved → prompts to select approved or resubmit; partial delivery failures → surfaced with retry guidance; duplicate contacts in CSV → dedup prompt; resend attempted too soon → wait guidance; contacts without WA consent → blocked with reason.

**Journey 2: SMB Owner – Guided Quick Launch (Self-Serve)**  
Signs up → auto-tenant + plan selection (even if mocked). Guided WA connect wizard (step-by-step token/number). Syncs a starter template. Uploads CSV or adds 3–5 contacts manually. Optionally uses AI to draft copy. Sends first broadcast. Sees simple “Sent / Read / Failed” dashboard.  
Edge cases handled: WA token invalid → inline fix; DNS/provider verification delay (if email present) → clear status; send without template → blocked with guidance; micro list behavior surfaced; manual contact add path covered.

**Journey 3: Agency Owner / Director – Multi-Tenant Oversight & ROI**  
Logs in → global tenant switcher. Sees all tenants with send volume, read rates, resend usage. Drills into a tenant to view campaign-level performance. Exports/shares report. Manages access (add/remove agency marketer). Can duplicate a campaign pattern across tenants.  
Edge cases handled: misconfigured tenant flagged; tenant over quota; client revokes agency access → access removed and logged; tenant disputes results vs spend → report export with evidence.

**Journey 4: Platform Admin / Super Admin – Support, Impersonation & Recovery**  
Searches tenants by name/email/domain. Impersonates tenant user to inspect channels, API keys, last 50 sends. Can disable a channel, re-trigger failed webhooks, and view system health dashboard.  
Edge cases handled: WA provider outage → surfaced with mitigation; failed webhook flood → throttle/retry; spammy content/abuse → block + log; number blocked → alert and guidance; billing delinquency → controlled shutdown of sending.

### Journey Requirements Summary
- Onboarding & Setup: Tenant creation, login, plan selection, WA connect wizard, template sync, CSV/manual contacts, dedup and consent checks.
- Campaign & Resend: Template selection/variable mapping, list broadcast, live sent/delivered/read, resend to non-readers with timing guards, uplift comparison.
- Dashboards & Reporting: Per-tenant campaign stats, read/delivered views, resend usage, export/share reports; simple SMB dashboard; agency multi-tenant overview.
- Access & Control: Multi-tenant switcher; agency staff access; impersonation; channel enable/disable; API keys; quota and misuse controls.
- Error Handling & Recovery: Template approval state, delivery failures surfaced, WA token invalid, verification delays, webhook retry/flood controls, abuse/spam handling, billing delinquency controls.

## Innovation & Novel Patterns

### Detected Innovation Areas
- WhatsApp-first engagement platform (not an email retrofit) focused on WA-heavy markets.
- AI as a built-in campaign drafter (ideas → WA/email copy → resend).
- Agency-native multi-tenant with impersonation and cross-tenant oversight.
- Resend loop as a first-class ROI mechanism, not an add-on.
- Adapter-friendly core for CRM/Ads/Inbox later without rebuild.

### Market Context & Competitive Landscape
- Most incumbents are email-first with WA as an add-on; agency ops are secondary.
- Gap: Fast WA activation, resend uplift, and agency-grade multi-tenant with impersonation in one platform.

### Validation Approach
- Time-to-first WA send < 30 min; resend uplift +8–20% within 7 days; WA delivery >95%, read 65–85%.
- AI assist usage >70% campaigns; Resend usage >40% tenants monthly; uplift ≥ +10% read.
- Agency owner view: tenant-level ROI reporting and cross-tenant oversight adopted.

### Risk Mitigation
- Template/approval and consent guardrails to avoid send blocks.
- Delivery/read accuracy and resend timing guards to prevent spammy behavior.
- Clear fallbacks: send without AI; handle WA provider issues; quota/abuse/billing controls.

## SaaS B2B Specific Requirements

### Project-Type Overview
- Multi-tenant SaaS with agency-native access (single user across many tenants) and impersonation for support.
- WhatsApp-first with email optional; resend as core loop; AI assist integrated.
- Logical tenant isolation on shared infra; per-tenant API keys and channels.

### Technical Architecture Considerations
- Data isolation: tenant_id on all rows; RLS or equivalent enforcement; per-tenant API keys; per-tenant channels; no shared credentials.
- Agency cross-tenant access via user_tenants; actions audited with actor_user_id, actor_role, tenant_id; agency access revocable via tenants.allow_agency_access = false.
- Impersonation: platform_admin with read/write; audit fields performed_by_admin=true and impersonated_user_id; mandatory audit trail.
- Data residency: Phase-1 single region (US/EU) with tenants.data_region for future enforcement; multi-region only for enterprise later.

### Tenant Model & Permissions
- Global roles: platform_admin, agency_staff, client_user. Tenant roles: owner, admin, marketer, agency_marketer, viewer.
- Capability flags on tenant roles (JSONB): can_send_campaigns, can_manage_channels, can_view_costs, can_export_data, can_manage_users, can_use_ai (quota-based).
- No full IAM/policy engine in MVP; keep scopes simple and enforce at service boundaries.

### Subscription Tiers & Gating
- Starter (SMB): 1 tenant; 1 WA number; WA only; <=10k sends/mo; 1–3 users; resend; basic dashboards; no email/API/advanced automation; limited AI quota.
- Growth (SMB/small agency): 1 tenant; WA + Email; 50k–100k sends/mo; 5–10 users; resend; AI campaign gen (quota); basic automation (Phase-2); transactional APIs; webhooks; CSV imports.
- Agency/Pro: Multi-tenant access; WA + Email; per-tenant pools; 25–100 users; higher AI quotas; API + webhooks; advanced reports; priority support; future Meta Ads, CRM adapters, Inbox.
- Enterprise (later): SSO/SAML, dedicated IP, regional residency, custom compliance, SLAs.
- Gate by: channels (WA vs WA+Email), monthly sends, AI tokens, users, tenants (agency), API/webhooks, data export; enforced via subscriptions + runtime feature flags.

### Integrations (Phase-1 / Near-Term)
- WhatsApp: Meta WhatsApp Cloud API (primary). Optionally Gupshup/360dialog only if onboarding blockers arise.
- Email: Primary SES; optional fallback Brevo or Resend (pick one, not all).
- Webhooks required at launch: WA sent/delivered/read/failed; Email delivered/bounced/complaint/open/click.
- Optional product analytics: Posthog/Segment/RudderStack for internal product usage; not required for customers.

### Compliance, Audit, Retention
- PII: encrypt at rest (email/phone/WA number); TLS in transit; no plaintext secrets in logs; tokenized API keys.
- Consent logging: consent_email_marketing, consent_whatsapp_marketing, consent_source, consent_timestamp; events: consent_updated; proof before send.
- Audit trails: campaign sends, logins, channel changes, API key usage, impersonation. audit_logs: actor_user_id, actor_role, tenant_id, action, target_id, ip_address, created_at.
- Data retention defaults: messages 12–18 mo; events 24 mo; audit logs 24–36 mo; soft-delete contacts; make configurable later.
- Regional restrictions: allow global; data_region flag present; enforce regional residency only when enterprise requires.

### Implementation Considerations
- Enforce consent and template approval gates before send; block non-consenting contacts and unapproved templates.
- Quota checks (sends, AI tokens, users, tenants) tied to subscription; graceful errors and UI surfacing.
- Impersonation and agency revocation must take effect immediately; audit everything.
- Start single-region; design for future region pinning by tenant; avoid cross-region message payload storage until needed.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy
**MVP Approach:** Revenue/Problem-Solving hybrid — ship the WA-first send + resend loop fast to prove uplift and paid conversion.  
**Resource Requirements:** Lean squad (PM/Design shared, FE for Next.js, BE for API/workers, infra for WA/SES + observability).

### MVP Feature Set (Phase 1)
**Core User Journeys Supported:**  
- Agency Marketer Day-0 send → Week-1 resend.  
- SMB Owner guided quick launch.  
- Agency Owner oversight/reporting.  
- Platform Admin support/impersonation/recovery.

**Must-Have Capabilities:**  
- Tenant creation/login; WA connect (Meta Cloud), template sync/approval checks; CSV/manual contacts with dedup + consent checks.  
- Lists; template selection/variable mapping; WA send; sent/delivered/read tracking; basic dashboard.  
- Resend to non-readers with timing guards; uplift view.  
- Agency multi-tenant access; impersonation with full audit; revoke agency access; per-tenant API keys.  
- Quotas/feature flags per tier (sends, users, tenants, AI tokens, API/webhooks).  
- Compliance basics: encrypted PII, consent logging, audit logs, retention defaults.  
- Required webhooks: WA sent/delivered/read/failed; Email delivered/bounced/complaint/open/click (email enabled in Growth/Agency tiers).

### Post-MVP Features
**Phase 2 (Growth):** Email channel live; AI campaign gen at quota; segments; basic automation (2–3 triggers); richer dashboards; transactional API polish; Meta Pixel ingestion.  
**Phase 3 (Expansion):** Visual automation; adapters (CRM/Ads); AI replies/inbox; omnichannel; A/B testing; advanced analytics; SSO/enterprise residency and SLAs.

### Risk Mitigation Strategy
- **Technical Risks:** WA provider dependence, template approval lag, delivery/read accuracy, resend timing, quota/abuse controls → Mitigate with template status checks, consent gates, webhook reliability + retries, timing guards, rate limits, observability.  
- **Market Risks:** WA onboarding friction, agency proof-of-ROI, SMB micro-lists → Mitigate with guided WA setup, fast first send, resend uplift visibility, simple dashboards, starter templates.  
- **Resource Risks:** If team is smaller/slower, trim to WA-only Starter/Growth, defer email/segments/automation, keep single-region infra, minimize provider surface (Meta + SES only).

## Non-Functional Requirements

### Performance
- User-facing actions (dashboard views, campaign setup, list selection) respond within ~2s P50 / ~4s P95 under normal load.
- Webhook processing (WA/email) enqueues/updates events within 5s P95 to keep resend filters accurate.
- Resend job scheduling respects minimum wait windows and executes within the scheduled window.

### Reliability & Availability
- Delivery event handling is durable with retries/backoff for provider/webhook failures; duplicate delivery/read events handled idempotently.
- System continues core send/track functions during provider blips via retry/backoff; clear status surfaced to users.
- Target steady-state availability suitable for B2B SaaS (e.g., 99.5%+ for control plane); incidents logged and visible to admins.

### Security & Compliance
- Encrypt PII at rest; TLS in transit; no secrets in logs; tokenized API keys.
- Enforce tenant isolation; role/capability checks on every privileged action; consent gate before send.
- Audit log for logins, channel changes, API key usage, impersonation, sends; available to admins.
- Data retention: messages 12–18 mo; events 24 mo; audit 24–36 mo; soft-delete contacts; configurable later.

### Scalability
- Path to 12-month targets (15–30M WA sends/mo; 20–50M email/mo) without major re-architecture; horizontal scale for workers and webhook ingest.
- Quota enforcement tied to subscription tier to prevent noisy-neighbor impact.

### Observability
- Metrics and logs for sends, deliveries/reads, webhook success/failure, resend jobs, quota checks; alerts on sustained failure rates or backlog growth.
- Impersonation and admin actions always traceable with actor and tenant context.

### Accessibility & UX Quality
- Web app adheres to sensible WCAG 2.1 AA basics for forms, buttons, focus, and contrast on critical flows (login, onboarding, send, resend).

### Integration Robustness
- Webhooks are authenticated, retried with backoff, and idempotent on receiver misfires; failure surfaced in dashboards/admin views.
- API access uses API keys per tenant; rate limits aligned to tier to protect stability.
## Functional Requirements

### Onboarding & Access
- FR1: Users can sign up, create a tenant, and sign in with tenant-scoped access.
- FR2: Users can connect a WhatsApp number via Meta Cloud and view connection status.
- FR3: Users can select a plan/tier that gates features and quotas.
- FR4: Users can invite/manage tenant members with assigned tenant roles.
- FR5: Users can generate and revoke per-tenant API keys.

### Contacts & Consent
- FR6: Users can import contacts via CSV with deduplication and validation.
- FR7: Users can add/edit contacts manually, including email/WA number/first name.
- FR8: Users can capture and update consent flags (email/WhatsApp) with source and timestamp.
- FR9: Users can create and manage contact lists for targeting.

### Templates & Channels
- FR10: Users can view synced WhatsApp templates and their approval status.
- FR11: Users can map template variables to contact fields before sending.
- FR12: Users can connect an email channel (when enabled) and view its status.
- FR13: Users can select a template for a campaign and validate required variables.

### Campaigns & Resend
- FR14: Users can create and send a WhatsApp campaign to a selected list.
- FR15: Users can view delivery states (sent/delivered/read) for a campaign.
- FR16: Users can trigger a resend to non-readers/non-openers after a configurable wait.
- FR17: Users can compare resend uplift versus the original send.
- FR18: Users are blocked from sending to contacts without required consent.
- FR19: Users are prevented from resending before the minimum wait interval.

### Dashboards & Reporting
- FR20: Users can view per-campaign metrics (sent/delivered/read/open where applicable).
- FR21: Users can view resend usage and uplift metrics.
- FR22: Users can export or share a basic performance report.
- FR23: SMB users can view a simple “Sent/Read/Failed” dashboard.

### Multi-Tenant & Agency Operations
- FR24: Agency staff can access multiple tenants from a tenant switcher.
- FR25: Agency owners can view tenant-level summary (send volume, read rates, resend usage).
- FR26: Agency owners can drill into a tenant’s campaign performance.
- FR27: Agency owners can duplicate a campaign pattern across tenants.
- FR28: Tenants can revoke agency access, immediately removing agency_marketer permissions.

### Admin & Support
- FR29: Platform admins can search tenants and impersonate a tenant user.
- FR30: Platform admins can inspect channels, API keys, and recent sends for a tenant.
- FR31: Platform admins can disable a channel and re-trigger failed webhooks.
- FR32: Platform admins can view system health signals relevant to delivery/webhooks.

### Quotas, Plans & Controls
- FR33: The system enforces tier-based limits (sends, users, tenants, AI tokens, API/webhooks).
- FR34: Users see errors or guidance when limits are exceeded or features are gated by tier.
- FR35: Agency tenants can be assigned per-tenant message pools aligned to tier.

### Integrations & Webhooks
- FR36: The system ingests WhatsApp webhooks (sent/delivered/read/failed).
- FR37: The system ingests email webhooks (delivered/bounced/complaint/open/click) when email is enabled.
- FR38: Users can configure webhook endpoints for their tenant (where enabled by tier).

### API Access
- FR39: Authorized clients can send transactional WhatsApp messages via tenant API key (when enabled by tier).
- FR40: Authorized clients can send transactional email via tenant API key (when enabled by tier).

### Audit & Compliance
- FR41: The system records audit logs for logins, channel changes, API key usage, impersonation, and sends.
- FR42: The system stores consent events and prevents sending without consent.
- FR43: The system retains messages/events/audit logs per default retention policies with soft-delete for contacts.
- FR44: The system enforces tenant isolation on data access (no cross-tenant reads/writes).

### AI Assist
- FR45: Users can request AI-generated campaign copy (WA/email) when enabled by tier/quota.
- FR46: Users can proceed without AI if AI is unavailable or quota is exceeded.
