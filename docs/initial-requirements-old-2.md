
# EngageNinja – Master Product Requirements Document (v0.6)

---

## 1. Document Info
- Product: EngageNinja  
- Version: 0.6 (Master PRD – Strategy + Architecture + OSS + Workflows + APIs)  
- Date: 2025-12-08  
- Owner: Product & Engineering  

This document is the **single source of truth** for:
- Business positioning
- Competitive context
- Open‑source acceleration
- User workflows
- System architecture
- Data architecture
- Phase‑wise roadmap
- Phase‑1 OpenAPI

---

## 2. Product Positioning (Short Competitive Summary)

EngageNinja is positioned as an:
**AI‑first, Agency‑ready, WhatsApp‑first Engagement Platform**

Compared to Brevo:
- Brevo = Email‑first, SMB‑first, CRM‑heavy
- EngageNinja = WhatsApp‑first, AI‑first, Agency‑first

Key differentiators:
- Built-in **agency multi‑tenant operations**
- **AI‑generated campaigns** as first‑class capability
- **WhatsApp marketing at core**, not add‑on
- Clean **adapter-based future CRM + Ads integration**
- High ROI features prioritized early (Resend, WA automation)

Strategic exclusions (intentionally not built early):
- Full CRM
- Full call‑center / telephony suite
- In‑platform ad budget & billing engine

---

## 3. Open‑Source Acceleration Strategy

### Evaluated & Their Role

| Tool | Use | Decision |
|------|-----|----------|
| Payload CMS | Content & auth | ❌ Too CMS‑centric |
| Strapi | APIs + Admin | ❌ Conflicts with custom domain |
| Directus | Data UI | ⚠️ Possible admin helper |
| n8n | Workflow engine | ✅ Optional background automation |
| Chatwoot | Omnichannel Inbox | ✅ Phase‑3 accelerator |
| BullMQ | Queues | ✅ Core worker queue |
| Posthog | Analytics | ⚠️ Optional |

Final decision:
- **Core platform is custom‑built**
- OSS tools are **plugged only where they provide pure acceleration**
- Inbox (Chatwoot) + Automation (n8n) may be attached later via adapters

---

## 4. User & Tenant Model

### Multi‑Tenant Design

- Platform → Multiple Tenants
- Tenant → Multiple Users
- User → Can belong to multiple tenants (Agency model)

Tables:
- users
- tenants
- user_tenants

Global roles:
- platform_admin
- agency_staff
- client_user

Tenant roles:
- owner
- admin
- marketer
- agency_marketer
- viewer

Tenants control agency access via:
```
allow_agency_access (boolean)
```

Super Admin abilities:
- View all tenants
- Impersonate any tenant user (for support/debug)

---

## 5. Core User Workflows

### 5.1 Tenant Onboarding
1. Admin creates tenant
2. Selects subscription plan
3. Invites team members
4. Chooses channels (Email / WhatsApp)

### 5.2 Agency Onboarding
1. Agency staff created as global users
2. Attached to multiple tenants via user_tenants
3. Access scoped by tenant_role

### 5.3 Email Channel Setup
1. Enter provider credentials
2. Verify DNS
3. Activate channel
4. Test send

### 5.4 WhatsApp Channel Setup
1. Connect Meta Cloud/BSP
2. Sync templates
3. Map variables
4. Activate number

### 5.5 Campaign Creation
1. Choose channel
2. Select audience or segment
3. Use AI generator or manual editor
4. Schedule or send

### 5.6 AI Campaign Generation
1. User selects campaign goal
2. Inputs audience + tone
3. AI generates email + WA copy
4. User edits and finalizes

### 5.7 Resend to Non‑Openers
1. Select completed campaign
2. Filter unopened/unread
3. Modify subject or template
4. Resend child campaign

### 5.8 Transactional Messaging
External app → EngageNinja APIs → Email/WhatsApp send

### 5.9 Admin Impersonation
Platform admin selects tenant → login as tenant user → debug or assist

---

## 6. System Architecture

### Frontend
- Next.js
- React
- shadcn/ui
- Tailwind CSS

### Backend
- Node.js (NestJS/Express)
- REST API
- Internal AI services

### Workers
- Node.js workers
- Redis + BullMQ queues

### Data Layer
- PostgreSQL
- JSONB for dynamic attributes

### External Services
- Email ESP (SES/Brevo/Resend)
- WhatsApp API (Meta Cloud / BSP)
- AI Provider
- Stripe Billing

### Event Types
- campaign_sent
- email_opened
- whatsapp_read
- link_clicked
- conversion_event

---

## 7. Data Architecture (Logical)

Core entities:
- tenants
- users
- user_tenants
- channels
- contacts
- lists
- segments
- campaigns
- campaign_audiences
- templates
- messages
- events
- workflows
- workflow_runs
- api_keys
- ai_usages

Key relationships:
- tenant → many users
- tenant → many contacts
- contact → many messages → many events

---

## 8. Phase‑Wise Delivery Roadmap

### Phase 1 – Revenue MVP
- Multi‑tenant + Agency model
- Email + WhatsApp campaigns
- Contacts, lists, segments
- Basic workflows
- AI generation
- Resend to non‑openers
- Public APIs (contacts, events, transactional)

### Phase 2 – Activation
- Transactional expansion
- Forms
- Advanced workflows
- CRM adapters

### Phase 2.5 – Meta Ads
- Audience sync
- Conversions ingestion
- Ad performance dashboards

### Phase 3 – Omnichannel Inbox
- WhatsApp inbound
- Instagram/Facebook DMs
- Chat assignment & SLAs

---

## 9. Phase‑1 External API (OpenAPI – Locked)

✅ This OpenAPI section is **embedded from v0.5 without modification**  
(kept separate in repository for Swagger tooling)

Refer to:
/docs/engageninja-prd-v0.5-with-openapi.md

---

End of EngageNinja Master PRD v0.6
