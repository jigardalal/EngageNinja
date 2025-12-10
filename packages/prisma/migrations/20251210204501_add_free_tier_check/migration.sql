-- Update CHECK constraints to include 'free' tier
ALTER TABLE "users"
DROP CONSTRAINT IF EXISTS "users_plan_tier_check";

ALTER TABLE "users"
ADD CONSTRAINT "users_plan_tier_check"
CHECK ("plan_tier" IN ('free','starter','growth','agency','enterprise'));

ALTER TABLE "tenant_settings"
DROP CONSTRAINT IF EXISTS "tenant_settings_plan_tier_check";

ALTER TABLE "tenant_settings"
ADD CONSTRAINT "tenant_settings_plan_tier_check"
CHECK ("plan_tier" IN ('free','starter','growth','agency','enterprise'));
