-- Add plan_tier column and constraint to users
ALTER TABLE "users"
ADD COLUMN "plan_tier" TEXT NOT NULL DEFAULT 'starter';

ALTER TABLE "users"
ADD CONSTRAINT "users_plan_tier_check"
CHECK ("plan_tier" IN ('starter','growth','agency'));

-- Add metadata column to audit_logs
ALTER TABLE "audit_logs"
ADD COLUMN "metadata" JSONB;

-- Create tenant_settings table
CREATE TABLE "tenant_settings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "plan_tier" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "capability_flags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenant_settings_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "tenant_settings"
ADD CONSTRAINT "tenant_settings_tenant_id_key" UNIQUE ("tenant_id");

ALTER TABLE "tenant_settings"
ADD CONSTRAINT "tenant_settings_plan_tier_check"
CHECK ("plan_tier" IN ('starter','growth','agency'));

ALTER TABLE "tenant_settings"
ADD CONSTRAINT "tenant_settings_tenant_id_fkey"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "tenant_settings_tenant_id_idx" ON "tenant_settings"("tenant_id");
