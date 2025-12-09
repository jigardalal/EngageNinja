
# EngageNinja – Product Requirements, Architecture & Phase-1 API (v0.5)

---

## 1. Document Info

- Product: EngageNinja  
- Version: 0.5 (Phase-1 OpenAPI spec included)  
- Date: 2025-12-08  
- Owner: Product & Engineering  

This PRD is the **single source of truth** for:
- Product requirements  
- High-level architecture  
- Phase-1 external API (OpenAPI spec, draft)  

---

## 2. Product Positioning

EngageNinja is a **multi-tenant, AI-assisted Email + WhatsApp engagement platform** for:

- Agencies managing multiple client accounts  
- SMBs running self-serve marketing  
- Hybrid setups (agency + client teams)  

Initial focus:

- Email campaigns  
- WhatsApp template-based campaigns  
- Contacts, lists, segments  
- Basic automations  
- AI campaign & template generation  
- Agency-first access model  

Later phases add CRM adapters, Meta Ads, and an omnichannel inbox.

---

## 3. Key Differentiators

1. Agency-first multi-tenant access model  
2. AI-driven campaign & template generation  
3. WhatsApp-first marketing orientation  
4. Future-proof CRM & Ads integration via Adapter Pattern  
5. High-ROI features early (Resend to Non-Openers)  

---

## 4. User & Role Model (Summary)

### 4.1 Global Users

```
users
- id
- email
- password_hash
- global_role: null | platform_admin | agency_staff
- created_at
```

### 4.2 Tenant Membership

```
user_tenants
- user_id
- tenant_id
- tenant_role: owner | admin | marketer | agency_marketer | viewer
```

### 4.3 Behavior

- Client users → single tenant  
- Agency users → multiple tenants (through user_tenants)  
- Platform admin → global + impersonation  

Tenants have `allow_agency_access` boolean.

---

## 5. Phase-1 Scope (Functional)

Phase-1 (MVP) includes:

- Multi-tenant + Agency model  
- Contacts, lists, segments  
- Email campaigns  
- WhatsApp campaigns (template-based, outbound only)  
- Basic workflows (list join / event triggers, email/WA actions, waits)  
- AI campaign & content generation  
- Resend to non-openers / non-readers  
- Public REST API for:
  - Contacts  
  - Events  
  - Transactional email/WhatsApp  
- Basic analytics dashboards  

Meta Ads, CRM adapters, and Inbox are **post Phase-1**.

---

## 6. High-ROI Feature: Resend to Non-Openers / Non-Readers

- Works for Email + WhatsApp  
- Only targets contacts where:
  - Email: **no open event** for original campaign  
  - WhatsApp: **no read event** for original campaign  
- Excludes:
  - Bounced, failed, unsubscribed  
- Creates a child campaign referencing original campaign  
- Uses the same underlying send pipeline  

---

## 7. AI-Assisted Content Engine (Summary)

Internal-only APIs (consumed by frontend):

- `POST /api/ai/campaign/suggest` – generate Email + WhatsApp content  
- `POST /api/ai/content/improve` – improve/transform existing copy  

These are **not** part of the public external API in v1, but are documented for internal alignment.

---

## 8. CRM Integration & Meta Ads (Later Phases)

- CRM Adapters (Salesforce, HubSpot, Zoho) – Phase 2  
- Meta Ads (audience sync + conversion ingestion) – Phase 2.5  
- Omnichannel inbox – Phase 3  

They are **out of scope for Phase-1 OpenAPI** below.

---

## 9. Architecture Summary (Phase-1)

- Frontend: Next.js + React + shadcn/ui + Tailwind  
- Backend API: Node.js (NestJS/Express/Fastify)  
- Workers: Node.js + Redis queues (BullMQ or equivalent)  
- Database: Postgres  
- External services:  
  - Email provider (SES / Brevo / Mailgun / etc.)  
  - WhatsApp provider (Meta Cloud API or BSP)  
  - LLM provider (OpenAI / others)  
  - Stripe (billing)  

---

## 10. Data Model (Phase-1 Entities – Summary)

Core Phase-1 tables:

- `tenants`  
- `users`, `user_tenants`  
- `channels` (email, whatsapp)  
- `contacts`  
- `lists`, `list_members`  
- `segments`  
- `campaigns`, `campaign_audiences`  
- `templates`  
- `messages`  
- `events`  
- `workflows`, `workflow_runs`  
- `ai_usages` (optional but recommended)  

Field-level details are defined in earlier versions and in the API schemas below.

---

## 11. Phase-1 External API – OpenAPI Spec (Draft v1)

The following OpenAPI spec defines the **public, tenant-scoped API** for Phase-1:

- Authentication via **API key** (per tenant)  
- Base path: `/api/v1`  
- Tenants are identified via path param `{tenantId}`  

```yaml
openapi: 3.1.0
info:
  title: EngageNinja Public API
  version: 1.0.0
  description: |
    Phase-1 public API for EngageNinja.
    Tenant-scoped, API-key authenticated. Supports:
    - Contacts management
    - Lists and segments (read)
    - Events ingestion
    - Transactional Email & WhatsApp sends
servers:
  - url: https://api.engageninja.com/api/v1

security:
  - ApiKeyAuth: []

components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-Api-Key

  parameters:
    TenantId:
      name: tenantId
      in: path
      required: true
      description: Tenant identifier
      schema:
        type: string
    ContactId:
      name: contactId
      in: path
      required: true
      schema:
        type: string
    ListId:
      name: listId
      in: path
      required: true
      schema:
        type: string
    SegmentId:
      name: segmentId
      in: path
      required: true
      schema:
        type: string

  schemas:
    Contact:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
          format: email
          nullable: true
        phone:
          type: string
          nullable: true
        whatsappNumber:
          type: string
          nullable: true
        firstName:
          type: string
          nullable: true
        lastName:
          type: string
          nullable: true
        locale:
          type: string
          nullable: true
        timezone:
          type: string
          nullable: true
        consentEmailMarketing:
          type: boolean
        consentWhatsappMarketing:
          type: boolean
        consentSmsMarketing:
          type: boolean
        attributes:
          type: object
          additionalProperties: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id]

    ContactCreateRequest:
      type: object
      properties:
        email:
          type: string
          format: email
        phone:
          type: string
        whatsappNumber:
          type: string
        firstName:
          type: string
        lastName:
          type: string
        locale:
          type: string
        timezone:
          type: string
        consentEmailMarketing:
          type: boolean
        consentWhatsappMarketing:
          type: boolean
        consentSmsMarketing:
          type: boolean
        attributes:
          type: object
          additionalProperties: true
      anyOf:
        - required: [email]
        - required: [phone]
        - required: [whatsappNumber]

    ContactUpdateRequest:
      type: object
      properties:
        email:
          type: string
          format: email
        phone:
          type: string
        whatsappNumber:
          type: string
        firstName:
          type: string
        lastName:
          type: string
        locale:
          type: string
        timezone:
          type: string
        consentEmailMarketing:
          type: boolean
        consentWhatsappMarketing:
          type: boolean
        consentSmsMarketing:
          type: boolean
        attributes:
          type: object
          additionalProperties: true

    List:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
      required: [id, name]

    Segment:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
          nullable: true
        definition:
          type: object
          description: JSON rule expression
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    EventIngestRequest:
      type: object
      properties:
        contactId:
          type: string
          nullable: true
        externalId:
          type: string
          nullable: true
          description: External contact identifier
        email:
          type: string
          format: email
          nullable: true
        phone:
          type: string
          nullable: true
        whatsappNumber:
          type: string
          nullable: true
        eventType:
          type: string
          description: Custom event name
        properties:
          type: object
          additionalProperties: true
        occurredAt:
          type: string
          format: date-time
      required: [eventType]

    EmailTransactionalRequest:
      type: object
      properties:
        templateId:
          type: string
          description: EngageNinja template ID
        to:
          type: string
          format: email
        subjectOverride:
          type: string
          nullable: true
        variables:
          type: object
          additionalProperties: true
      required: [templateId, to]

    WhatsappTransactionalRequest:
      type: object
      properties:
        templateName:
          type: string
          description: Provider template name
        to:
          type: string
          description: E.164 WhatsApp number
        languageCode:
          type: string
          example: en_US
        variables:
          type: object
          additionalProperties: true
      required: [templateName, to, languageCode]

    ApiError:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
        code:
          type: string

paths:
  /tenants/{tenantId}/contacts:
    get:
      summary: List contacts
      parameters:
        - $ref: "#/components/parameters/TenantId"
        - in: query
          name: limit
          schema:
            type: integer
            default: 50
        - in: query
          name: offset
          schema:
            type: integer
            default: 0
      responses:
        "200":
          description: List of contacts
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: "#/components/schemas/Contact"
                  total:
                    type: integer
        "401":
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiError"
    post:
      summary: Create or upsert a contact
      description: |
        Creates a new contact or updates an existing one by email/phone/whatsappNumber.
      parameters:
        - $ref: "#/components/parameters/TenantId"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ContactCreateRequest"
      responses:
        "200":
          description: Upserted contact
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Contact"
        "401":
          description: Unauthorized

  /tenants/{tenantId}/contacts/{contactId}:
    get:
      summary: Get a single contact
      parameters:
        - $ref: "#/components/parameters/TenantId"
        - $ref: "#/components/parameters/ContactId"
      responses:
        "200":
          description: Contact
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Contact"
        "404":
          description: Not found
    patch:
      summary: Update a contact
      parameters:
        - $ref: "#/components/parameters/TenantId"
        - $ref: "#/components/parameters/ContactId"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ContactUpdateRequest"
      responses:
        "200":
          description: Updated contact
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Contact"
    delete:
      summary: Delete a contact
      parameters:
        - $ref: "#/components/parameters/TenantId"
        - $ref: "#/components/parameters/ContactId"
      responses:
        "204":
          description: Deleted

  /tenants/{tenantId}/lists:
    get:
      summary: List lists
      parameters:
        - $ref: "#/components/parameters/TenantId"
      responses:
        "200":
          description: Lists
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: "#/components/schemas/List"
    post:
      summary: Create a list
      parameters:
        - $ref: "#/components/parameters/TenantId"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                description:
                  type: string
              required: [name]
      responses:
        "200":
          description: List created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/List"

  /tenants/{tenantId}/lists/{listId}/members:
    post:
      summary: Add contacts to list
      parameters:
        - $ref: "#/components/parameters/TenantId"
        - $ref: "#/components/parameters/ListId"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                contactIds:
                  type: array
                  items:
                    type: string
              required: [contactIds]
      responses:
        "200":
          description: Members added

  /tenants/{tenantId}/segments:
    get:
      summary: List segments
      parameters:
        - $ref: "#/components/parameters/TenantId"
      responses:
        "200":
          description: Segments
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: "#/components/schemas/Segment"

  /tenants/{tenantId}/events:
    post:
      summary: Ingest a custom event
      parameters:
        - $ref: "#/components/parameters/TenantId"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/EventIngestRequest"
      responses:
        "202":
          description: Event accepted
        "401":
          description: Unauthorized

  /tenants/{tenantId}/email/transactional:
    post:
      summary: Send a transactional email
      parameters:
        - $ref: "#/components/parameters/TenantId"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/EmailTransactionalRequest"
      responses:
        "202":
          description: Email accepted for sending
        "400":
          description: Bad request
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiError"
        "401":
          description: Unauthorized

  /tenants/{tenantId}/whatsapp/transactional:
    post:
      summary: Send a transactional WhatsApp template message
      parameters:
        - $ref: "#/components/parameters/TenantId"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/WhatsappTransactionalRequest"
      responses:
        "202":
          description: WhatsApp message accepted
        "400":
          description: Bad request
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ApiError"
        "401":
          description: Unauthorized
```

---

## 12. Notes on API-First Implementation

- All Phase-1 UI flows (contacts import, forms, transactional send, basic integrations) should use these APIs internally as much as practical.  
- Internal admin endpoints (for AI, campaigns, workflows, Meta Ads, CRM adapters) can extend this spec later or live under `/internal/*`.  
- Versioning:
  - Public base: `/api/v1`  
  - Breaking changes → `/api/v2` in future.  

---

End of v0.5 PRD.
