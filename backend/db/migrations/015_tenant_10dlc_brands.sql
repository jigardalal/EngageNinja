-- Migration 015: Create tenant_10dlc_brands table
-- Stores 10DLC brand registrations (immutable approved snapshots)
-- Once Twilio approves a registration, the business info becomes READ-ONLY
-- Tenant can have multiple registrations if business info changes post-approval

CREATE TABLE tenant_10dlc_brands (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,           -- NOT UNIQUE - tenant can have multiple if resubmitted

  -- Brand Info (snapshot at submission time - locked after approval)
  legal_business_name TEXT NOT NULL,
  dba_name TEXT,
  business_website TEXT,
  business_type TEXT,
  industry_vertical TEXT,
  business_registration_number TEXT,  -- EIN or equivalent
  country TEXT NOT NULL,
  business_address TEXT NOT NULL,     -- LOCKED after approval
  business_city TEXT NOT NULL,
  business_state TEXT NOT NULL,
  business_zip TEXT NOT NULL,

  -- Owner/Contact Info (LOCKED after approval)
  owner_name TEXT NOT NULL,
  owner_title TEXT,
  owner_email TEXT NOT NULL,
  owner_phone TEXT NOT NULL,

  -- Twilio 10DLC Registration Details
  twilio_brand_sid TEXT UNIQUE,       -- Twilio's brand identifier
  twilio_brand_status TEXT,           -- 'draft', 'pending', 'approved', 'rejected'
  twilio_brand_status_reason TEXT,    -- Why rejected (if applicable)

  -- Phone Number Provisioning
  twilio_phone_number TEXT UNIQUE,    -- E.g., '+1234567890'
  twilio_phone_number_sid TEXT UNIQUE,
  twilio_phone_status TEXT,           -- 'active', 'provisioning', 'failed'

  -- Campaign Type (for Twilio compliance)
  campaign_type TEXT,                 -- 'marketing', 'transactional', 'support', 'two_way'

  -- Versioning & Status
  is_active BOOLEAN DEFAULT 1,        -- Is this the currently active registration?
  deprecation_reason TEXT,            -- e.g., 'business_info_updated_new_registration'

  -- Dates
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  twilio_verified_at TIMESTAMP,       -- When Twilio verified the brand
  twilio_approved_at TIMESTAMP,       -- Once set, record becomes READ-ONLY

  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_tenant_10dlc_brands_tenant_id ON tenant_10dlc_brands(tenant_id);
CREATE INDEX idx_tenant_10dlc_brands_active ON tenant_10dlc_brands(tenant_id, is_active);
CREATE INDEX idx_tenant_10dlc_brands_twilio_brand_sid ON tenant_10dlc_brands(twilio_brand_sid);
CREATE INDEX idx_tenant_10dlc_brands_status ON tenant_10dlc_brands(twilio_brand_status);
