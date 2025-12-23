# Twilio + AWS Queue Migration Plan

## Context
- We currently send SMS/WhatsApp/Email directly from `backend/src/services/messageQueue.js` and rely on the in-process webhook handler.
- The migration doc (`ARCHITECTURE_TWILIO_MIGRATION.md`) calls for SQS + Lambda for every channel plus a shared webhook handler and stronger provider metadata.
- We now want to consolidate `tenant_channel_settings`, keep only SQLite, and seed the new metadata via `seed-twilio-sms.js` before pushing to AWS.

## Goals
1. Merge `tenant_channel_settings` and `tenant_channel_credentials_v2` into a single schema that carries encrypted credentials, webhook URL, messaging-service SID, and enable/verify flags.
2. Update the Twilio seed script, settings routes, campaign handlers, and provider factory to read/write the unified schema.
3. Transition sends for SMS/WhatsApp/Email onto AWS SQS → `SendCampaignMessage` Lambda → provider (Twilio/SES) → status updates (EventBridge/Lambda or webhooks) while keeping SSE updates.
4. Build an AWS webhook endpoint (API Gateway + Lambda) that verifies Twilio signatures and writes status updates back to SQLite via the same schema.
5. Keep local dev flow (existing queue and webhook) as a flag until AWS path is production-ready.

## Task Breakdown

### Phase 0 – Schema consolidation
1. Extend `backend/db/migrations/XXXX_tenant_channel_settings.sql` (or current schema file) with the new columns: `provider_config_json`, `messaging_service_sid`, `webhook_url`, `is_enabled`, `is_verified`, `verification_error`, `webhook_secret_encrypted`, credential blobs, etc.
2. Remove `tenant_channel_credentials_v2` (drop references in code/tests/migrations); add migration that transfers any existing rows if needed.
3. Update `backend/scripts/seed-twilio-sms.js` to write into the consolidated table and include webhook/messaging service SID.
4. Adjust `backend/src/routes/settings.js`, `routes/campaigns.js`, `services/messaging/providerFactory.js`, and any other consumer to read the merged schema.
5. Add tests or scripts verifying the unified table works (e.g., seeding followed by campaign send using new columns).

### Phase 1 – AWS Queue & Lambdas
1. Define Terraform resources:
   - SQS queue `engageninja-messages-{env}` and DLQ.
   - IAM roles/policies for Lambda ↔ SQS and EventBridge.
   - Lambda functions:
     * `SendCampaignMessage` (Node 18) triggered by SQS.
     * `UpdateMessageStatus` scheduled by EventBridge (for mock statuses + webhook updates).
   - API Gateway endpoint `/webhooks/twilio` ➔ Lambda for status callbacks.
2. Implement `lambda/functions/send-campaign-message`: decrypt tenant creds, call the correct provider, update `messages`, schedule EventBridge status updates.
3. Implement `lambda/functions/update-message-status`: update `message_status_events` with `status_reason`, broadcast via SSE (or notify backend).
4. Ensure Lambda has access to SQLite (or move data to RDS/CloudWatch?). If SQLite must stay local, consider invoking backend HTTP endpoint to persist updates (or share via API).
5. Configure Terraform outputs for new env vars (`SQS_QUEUE_URL`, `TWILIO_MESSAGING_SERVICE_SID`, `WEBHOOK_BASE_URL`), update `backend/.env` to match for local dev (mock queue or local SQS emulator).

### Phase 2 – Webhook handling
1. In AWS Lambda webhook handler, use decrypted credentials to verify signature, look up `message` by `provider_message_id` in unified schema, and write status updates.
2. Emit SSE/event notifications through established channel (API that backend consumes).
3. Clean up old backend webhook routes once AWS endpoint is stable.

### Phase 3 – Cutover & Validation
1. Provide feature flag (e.g., `USE_AWS_QUEUE`) toggling between local queue vs. SQS+Lambda for sends and webhook updates.
2. Run campaigns through AWS flow, monitor metrics via SSE in UI, confirm `delivery`/`read`.
3. Document Terraform redeploy steps, seeding instructions, and webhook URLs.

## Decisions
1. Use a network-hosted AWS database (RDS/Aurora) so Lambdas and the backend share a single datastore; SQLite stays just for local development.
2. Add the new SQS/Lambda/webhook infrastructure inside the existing `Terraform/dev` workspace (later we can copy the stack for other environments).
3. Lambda status updates call the backend via an authenticated webhook, letting the existing `metricsEmitter` broadcast over SSE instead of inventing a new pub/sub.
4. Keep using the shared `ENCRYPTION_KEY` env var for now; both the backend and Lambdas will read it. We can migrate to Secrets Manager/KMS later once the architecture is stable.

## Open Questions
1. Lambda access to the new network database will need connection pooling/caching; what pool size is acceptable for our workload?
2. Do we need to version the seed data or Twilio credentials when migrating to the new table, or can we drop/reset and reseed in dev/prod?
3. Once the AWS flow is live, how do we will disable the local processor gracefully (feature flag or environment variable)?

-## Next steps
1. Merge schema, update seed script, and ensure local queue still runs (Phase 0).
2. Draft Terraform + Lambda code, wire the SQS queue, and verify send flow (Phase 1).
3. Build the AWS webhook handler, schedule updates, and retire the old webhook route (Phase 2).
4. Switch production to AWS queue with rollback plan (Phase 3).

Let me know if any of the open questions need clarification before we start executing. Also confirm whether the plan should be split into more than one issue/pr.
