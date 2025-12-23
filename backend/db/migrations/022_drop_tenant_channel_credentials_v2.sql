-- Migration 022: Drop tenant_channel_credentials_v2 now that schema consolidated
DROP TABLE IF EXISTS tenant_channel_credentials_v2;
