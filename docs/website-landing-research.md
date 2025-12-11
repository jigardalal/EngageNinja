---
title: "Website Research & UX-informed Page Blueprint"
sourceDocuments:
  - docs/prd.md
  - docs/ux-design-directions.html
  - docs/ux-design-specification.md
author: "Codex"
date: "2025-12-08"
---

# Website Research & UX-informed Page Blueprint

This document gathers the marketing/UX research the team requested and turns it into a practical brief for the missing landing, pricing, platform, resources, and solutions pages. The PRD (`docs/prd.md`) and UX artifacts (`docs/ux-design-directions.html`, `docs/ux-design-specification.md`) remain the source of truth for positioning, success metrics, and interaction principles; the sections below simply translate those requirements into a competitive, Brevo-inspired website structure.

## Competitive Research (brevo.com, December 2025 snapshot)

- **Hero promise:** The meta title/description read “Email & SMS Marketing, CRM & Automation | Brevo” + “most intuitive all-in-one customer engagement platform…” which signals breadth and ease at once. We can countersignal by emphasising “WhatsApp-first, resend-ready, AI-assisted campaigns in minutes.”
- **Navigation architecture:** Primary buckets are Products, Compare, Resources, Partners, Company. Each bucket offers deep content (campaigns, transactional, integrations, blog, community, legal, support). We should mirror the structure with tailored pages: Landing (hero + loop), Platform (core WA/AI product), Solutions (audiences), Resources (docs/guides), Pricing (tiers), and a focused Compare/Support section inside Resources.
- **Header cues:** Brevo keeps a sticky region with logo, “Sign Up Free / Log in” CTAs, and a large “Get a demo” secondary CTA. A similar header for EngageNinja should keep the logo, primary nav, a “Talk to sales” or “Book a WA setup call” CTA, and a visible login button.
- **Footer:** Large footer includes legal links (Privacy, Terms, Responsible Disclosure), help center, platform status, and CTA buttons (“Sign Up Free,” “Login,” “Talk to sales”). We should echo that density while layering EngageNinja-specific links (WhatsApp connect, resend docs, multi-tenant admin help).
- **Messaging tone:** Brevo mixes energetic verbs (“Send better campaigns,” “Automation that grows with you”) with trust badges (awards, B Corp). EngageNinja can match the aspirational tone by highlighting “WA-first certainty,” “resend uplift proof,” “agency-grade auditability,” and “AI-powered campaign companion.”
- **CTA density:** Frequent CTAs (Sign Up, Book Demo, Resources). For EngageNinja we will have layered CTAs: “Start sending WA today” for SMBs, “Schedule an agency onboarding call,” “See resend uplift proof,” etc.

## Goals for EngageNinja’s Public Facing Site

- Signal *WhatsApp-first trust* (fast setup, consent, template guardrails) + *AI-assisted resend loops* (original send, non-reader resend, uplift proof).
- Align marketing copy with PRD targets: fast activation (<30 min), resend uplift (+10–20%), WA read/open metrics, multi-tenant agency oversight, impersonation + support controls.
- Let UX principles from the specification guide layout: hero loop first, guardrails and proof, safety messaging, exportable ROI, and admin/emergency cues.
- Provide the navigation scaffolding needed for pricing, platform detail, solutions targeting agencies vs SMBs, and resource links that aid onboarding.

## Proposed Structure

### Header / Global Nav

- **Elements:** EngageNinja logo (already available), nav links to Landing (intro), Platform, Solutions, Resources, Pricing, and “Talk to sales” / “Book a WA onboarding call.”
- **Buttons:** Primary CTA → “Start WhatsApp send” (links to onboarding form), Secondary CTA → “Log in” (app URL). Add a tertiary “Schedule a demo” for agencies.
- **Microcopy hints:** “WhatsApp + email from one workspace,” “Resend uplift proof,” “Agency-safe impersonation” as small pill text near nav or hero.
- **Sticky behavior:** On scroll, keep nav and primary CTA visible so we can always route people back to the hero loop.

### Landing Page (Hero + Flow)

Sections (order driven by UX spec):
1. **Hero loop focus:** Headline like “WhatsApp-first campaigns that resend themselves,” subhead referencing AI assist + multi-tenant readiness. Include quick stats from PRD (e.g., “Send in <30m,” “Resend uplift +10%,” “AI assist used by 70% of campaigns”). CTA buttons: “Start sending” + “See a demo/resend proof.”
2. **Guardrail proof strip:** Show WA connect progress, template approvals, consent coverage, and resend readiness (counts/timers). Align with UX direction “Clarity & Uplift.”
3. **Core loop explainer:** Three cards (“Connect WhatsApp,” “Send AI-assisted campaign,” “Resend non-readers, prove uplift”) with brief copy referencing success metrics.
4. **Live proof / data:** Mini-dashboard or mock showing live sends/delivered/read and resend uplift numbers (visual nod to Brevo’s “send/delivered/read ticks”).
5. **Why agencies + SMBs choose us:** Dual columns comparing agency features (multi-tenant switcher, impersonation, ROI dashboards) vs SMB features (guided wizard, AI copy, simple dashboard).
6. **Trust & proof:** Logos (if available), awards, G2 glimpsed on Brevo; replicate with partner names or metrics from PRD (resend adoption).
7. **Resend story:** Highlight difference vs typical email-first tool; include quote/story referencing training/resend uplift.
8. **Footer CTA band:** “Ready for WA-first certainty?” leading to Pricing/Signup.

### Pricing Page

- Breakdown of tiered structure (Starter → Growth → Agency/Pro → Enterprise) mirroring PRD. Each tier lists:
  - Channels (WA/email), WA number limits, AI tokens, tenant/user caps, resend analytics, API/webhook access.
  - Activation promises (TTF <30m for Starter, multi-tenant orchestration for Agency).
  - CTA per tier (“Start free trial,” “Talk to agency success,” “Book a WA onboarding call”).
- Include a comparison table showing features (WA connect, AI assist, Resend automation, Multi-tenant, Impersonation, SLAs) to make upgrade paths clear.
- Add a FAQ/resend guardrail section dealing with WA consent, template approvals, and resend timing (guards from UX spec).

### Platform Page

- Hero: “The WA-first engagement platform built for resend uplift and agency ops.” Emphasize single data model + AI-assisted copy/resend/resend proof.
- Sections:
  1. **Core modules:** WA channel, AI campaign companion, Resend automation, Unified analytics, Multi-tenant access/impersonation, Admin controls (webhooks, API keys, support/resend recovery).
  2. **Live loop simulation:** Show a timeline of connect → send → resend → uplift, referencing PRD success metrics.
  3. **Agency-first workspace:** Tenant switcher, impersonation banner, access controls, ROI dashboards.
  4. **SMB quick launch:** Guided wizard, dedup/consent checks, preflight cards, manual contact add.
  5. **Security & reliability:** PII encryption, consent logs, WA template guardrails, webhook health, platform status (align with Brevo’s status link).
  6. **Integrations:** Mention adapters planned (CRM, Ads, Inbox) from PRD vision.

### Solutions Page

- Split into vertical stories referencing user journeys from the PRD:
  - **Agency marketers & owners:** Multi-tenant oversight, ROI dashboards, impersonation, exportable proofs, autop-run resend loops.
  - **SMB owners:** Guided WA connect, AI copy, simple dashboards, ensures first send in <30m.
  - **Platform admins:** Support tools, impersonation, audit trails, channel recovery, webhook health, compliance guardrails.
  - **Resend & AI automation for WA-heavy markets:** Case study/bullet callouts referencing +10–20% uplift, +70% AI usage.
- Each story accompanied by relevant CTA (demo, onboarding call, technical docs).

### Resources Page

- Structure similar to Brevo’s resources bucket: quick links to Help Center, Platform Status, Community, Glossary, Blog/Updates, API docs, Security/compliance summary.
- Include a spotlight section for “WhatsApp + Resend playbooks” (downloadable guide, webinar, case study), referencing PRD success criteria.
- Use cards to differentiate resource types (Docs, Webinars, Community, Product updates).
- Add CTA to “Talk to an expert” / “Contact support” near bottom to keep momentum.

### Footer

- Mirror Brevo’s dense footer: group links under headings like Product (Platform, Pricing, Solutions), Resources (Docs, Webinars, Status), Company (About, Careers, Legal), Support (Contact, Help Center, Compliance).
- Provide quick CTAs (“Start messaging,” “Talk to sales,” “Log in”) plus legal links (Privacy, Terms, Acceptable Use, Responsible Disclosure).
- Include WA-specific guardrail reminders (“Consent-first sends,” “Template approvals tracked”) near the footer to reinforce safety.

## Design & UX Alignment Notes

- Follow the directional cues from `docs/ux-design-directions.html`: clarity/upfront guardrails, agency ops focus, guided launch flows.
- Every page should echo the “Send → Resend → Prove uplift” hero loop, with live status chips, inline uplift deltas, and CTA for the next action.
- Use the typography, color, spacing, and accessibility tokens called out in `docs/ux-design-specification.md`.
- Embed data proof everywhere: stats, live counters, before/after uplift numbers, exportable ROI snapshots, impersonation banners, and timeline guardrails.

## Next Steps

1. **Validate messaging:** Turn this blueprint into content cards/copy drafts that the marketing/product team can iterate on.
2. **Design system handoff:** Build Tailwind/shadcn UI components for hero loop, resend guardrails, multi-tenant dashboard, CTA bands.
3. **Implementation plan:** Identify routes/data needs (landing, pricing, platform, solutions, resources) and draft Next.js layouts.
4. **Supporting assets:** Collate logos/testimonials/proof for trust section, and confirm brand colors/typography (logo already present in `/web` assets).
5. **Review & iterate:** Share this research doc with stakeholders, gather feedback, and refine before coding.
