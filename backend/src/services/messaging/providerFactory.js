/**
 * Provider Factory
 *
 * Resolves and instantiates the correct messaging provider based on:
 * - Tenant's demo mode flag
 * - Channel (sms, whatsapp, email)
 * - Provider from database (twilio, aws_ses, etc.)
 *
 * Usage:
 *   const provider = await getProvider(tenantId, 'sms');
 *   const result = await provider.send(message);
 */

const db = require('../../db');
const crypto = require('crypto');

// Provider implementations
const TwilioSmsProvider = require('./providers/TwilioSmsProvider');
const TwilioWhatsAppProvider = require('./providers/TwilioWhatsAppProvider');
const SESEmailProvider = require('./providers/SESEmailProvider');
const DemoProvider = require('./providers/DemoProvider');

/**
 * Decrypt credentials stored in database
 *
 * @param {string} encryptedData - Hex-encoded encrypted JSON
 * @returns {object} Decrypted credentials object
 */
function decryptCredentials(encryptedData) {
  if (!encryptedData) return null;

  const encryptionKey = process.env.ENCRYPTION_KEY || 'default-dev-key-change-in-production';
  const key = crypto.createHash('sha256').update(encryptionKey).digest().subarray(0, 24);
  const iv = Buffer.alloc(16, 0);

  try {
    const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Failed to decrypt credentials:', error.message);
    throw new Error('Invalid credentials - decryption failed');
  }
}

/**
 * Get the appropriate messaging provider for a tenant and channel
 *
 * @param {string} tenantId - Tenant UUID
 * @param {string} channel - 'sms', 'whatsapp', or 'email'
 * @returns {Promise<MessagingProvider>} Provider instance
 *
 * @throws {Error} If tenant not found, channel not configured, or provider not available
 */
async function getProvider(tenantId, channel) {
  // 1. Fetch tenant info
  const tenant = db.prepare('SELECT id, is_demo FROM tenants WHERE id = ?').get(tenantId);

  if (!tenant) {
    throw new Error(`Tenant not found: ${tenantId}`);
  }

  // 2. If demo tenant, return demo provider
  if (tenant.is_demo) {
    return new DemoProvider(tenantId, channel);
  }

  // 3. Fetch channel credentials
  const creds = db.prepare(`
    SELECT provider, credentials_json_encrypted, provider_config_json
    FROM tenant_channel_credentials_v2
    WHERE tenant_id = ? AND channel = ?
  `).get(tenantId, channel);

  if (!creds) {
    throw new Error(`No provider configured for tenant ${tenantId}, channel ${channel}`);
  }

  // 4. Decrypt credentials
  const decrypted = decryptCredentials(creds.credentials_json_encrypted);
  const config = creds.provider_config_json ? JSON.parse(creds.provider_config_json) : {};

  // 5. Instantiate appropriate provider
  switch (creds.provider) {
    case 'twilio':
      if (channel === 'sms') {
        return new TwilioSmsProvider(tenantId, channel, decrypted, config);
      } else if (channel === 'whatsapp') {
        return new TwilioWhatsAppProvider(tenantId, channel, decrypted, config);
      }
      throw new Error(`Twilio does not support channel: ${channel}`);

    case 'aws_ses':
      if (channel === 'email') {
        return new SESEmailProvider(tenantId, channel, decrypted, config);
      }
      throw new Error(`AWS SES does not support channel: ${channel}`);

    default:
      throw new Error(`Unknown provider: ${creds.provider}`);
  }
}

/**
 * Get all providers for a tenant
 *
 * Useful for bulk operations or checking which channels are enabled
 *
 * @param {string} tenantId - Tenant UUID
 * @returns {Promise<object>} Map of { channel: provider }
 */
async function getAllProviders(tenantId) {
  const channels = ['sms', 'whatsapp', 'email'];
  const providers = {};

  for (const channel of channels) {
    try {
      providers[channel] = await getProvider(tenantId, channel);
    } catch (error) {
      // Channel not configured - that's okay, just skip it
    }
  }

  return providers;
}

/**
 * Test a provider's credentials
 *
 * Called during channel setup to validate credentials work
 *
 * @param {string} tenantId - Tenant UUID
 * @param {string} channel - 'sms', 'whatsapp', or 'email'
 * @returns {Promise<object>} { success: bool, error?: string }
 */
async function verifyProvider(tenantId, channel) {
  const provider = await getProvider(tenantId, channel);
  return await provider.verify();
}

module.exports = {
  getProvider,
  getAllProviders,
  verifyProvider,
  decryptCredentials
};
