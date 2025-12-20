-- Migration 017: Create message_provider_mappings table
-- Maps messages to provider-specific IDs for webhook matching
-- When webhook arrives with provider_message_id, we look up the message here
-- One row per message per provider (usually just one provider per message)

CREATE TABLE message_provider_mappings (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,

  channel TEXT NOT NULL,              -- 'sms', 'whatsapp', 'email'
  provider TEXT NOT NULL,             -- 'twilio', 'aws_ses', 'demo'
  provider_message_id TEXT UNIQUE,    -- ID from Twilio/SES/Demo for webhook matching
  provider_status TEXT,               -- Last known status from provider

  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,

  UNIQUE(message_id, provider),
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

CREATE INDEX idx_message_provider_mappings_provider_message_id ON message_provider_mappings(provider_message_id);
CREATE INDEX idx_message_provider_mappings_message_id ON message_provider_mappings(message_id);
CREATE INDEX idx_message_provider_mappings_provider ON message_provider_mappings(provider);
