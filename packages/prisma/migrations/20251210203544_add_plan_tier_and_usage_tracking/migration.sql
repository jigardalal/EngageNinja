-- CreateTable
CREATE TABLE "plan_tiers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "max_tenants" INTEGER NOT NULL,
    "max_team_members" INTEGER NOT NULL,
    "max_monthly_sends" INTEGER NOT NULL,
    "max_ai_tokens_monthly" INTEGER NOT NULL,
    "available_channels" TEXT[],
    "capability_flags" TEXT[],
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_counters" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "usage_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_counters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plan_tiers_name_key" ON "plan_tiers"("name");

-- CreateIndex
CREATE INDEX "plan_tiers_name_idx" ON "plan_tiers"("name");

-- CreateIndex
CREATE INDEX "usage_counters_tenant_id_idx" ON "usage_counters"("tenant_id");

-- CreateIndex
CREATE INDEX "usage_counters_period_idx" ON "usage_counters"("period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "usage_counters_tenant_type_period_idx" ON "usage_counters"("tenant_id", "usage_type", "period_start");

-- AddForeignKey
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
