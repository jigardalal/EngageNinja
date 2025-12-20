-- Migration 018: Create sms_phone_pool table
-- Tracks SMS phone numbers allocated from Twilio
-- For now, one phone number per tenant (per 10DLC registration)
-- Future: can scale to manage pool of numbers across tenants

CREATE TABLE sms_phone_pool (
  id TEXT PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,  -- E.g., '+1234567890'
  twilio_phone_number_sid TEXT UNIQUE,

  tenant_id TEXT,                     -- NULL if unallocated
  allocated_at TIMESTAMP,

  status TEXT DEFAULT 'active',       -- 'active', 'retired', 'failed'
  failure_reason TEXT,

  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,

  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

CREATE INDEX idx_sms_phone_pool_tenant_id ON sms_phone_pool(tenant_id);
CREATE INDEX idx_sms_phone_pool_status ON sms_phone_pool(status);
CREATE INDEX idx_sms_phone_pool_phone_number ON sms_phone_pool(phone_number);
