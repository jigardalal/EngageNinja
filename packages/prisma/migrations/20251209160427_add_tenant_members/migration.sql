-- DropForeignKey
ALTER TABLE "tenant_settings" DROP CONSTRAINT "tenant_settings_tenant_id_fkey";

-- DropIndex
DROP INDEX "tenant_settings_tenant_id_idx";

-- AlterTable
ALTER TABLE "tenant_settings" ALTER COLUMN "capability_flags" DROP DEFAULT;

-- CreateTable
CREATE TABLE "tenant_members" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invite_token" TEXT,
    "invited_by" TEXT NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_members_invite_token_key" ON "tenant_members"("invite_token");

-- CreateIndex
CREATE INDEX "tenant_members_tenant_id_idx" ON "tenant_members"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_members_email_idx" ON "tenant_members"("email");

-- CreateIndex
CREATE INDEX "tenant_members_invite_token_idx" ON "tenant_members"("invite_token");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_members_tenant_email_unique" ON "tenant_members"("tenant_id", "email");

-- AddForeignKey
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_members" ADD CONSTRAINT "tenant_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
