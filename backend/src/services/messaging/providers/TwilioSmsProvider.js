/**
 * Twilio SMS Provider
 *
 * Sends SMS messages via Twilio API
 * Handles webhook signature verification for delivery status updates
 */

const MessagingProvider = require('../MessagingProvider');
const twilio = require('twilio');
const crypto = require('crypto');

class TwilioSmsProvider extends MessagingProvider {
  constructor(tenantId, channel, credentials, config = {}) {
    super(tenantId, channel, credentials, config);

    // Validate required credentials
    if (!this.hasRequiredCredentials(['accountSid', 'authToken'])) {
      throw new Error('Twilio SMS: Missing required credentials (accountSid, authToken)');
    }

    // Initialize Twilio client
    this.client = twilio(this.credentials.accountSid, this.credentials.authToken);
  }

  /**
   * Send SMS message via Twilio
   *
   * @param {object} message - Message object
   *   - phone_number: Recipient phone number (E.164 format)
   *   - content: Message body (text)
   *   - id: Message ID (for tracking)
   *   - from_number: Optional sender number (falls back to tenant's 10DLC number)
   *
   * @returns {Promise<object>} { success: bool, provider_message_id: string, status: string, error?: string }
   */
  async send(message) {
    try {
      const { phone_number, content, id: messageId, from_number } = message;

      // Get sender phone number
      const fromNumber = from_number || this.config.phone_number;
      if (!fromNumber) {
        throw new Error('No phone number configured for tenant');
      }

      // Validate recipient
      if (!phone_number) {
        throw new Error('Recipient phone number missing');
      }

      // Send via Twilio
      const messagingServiceSid =
        this.config.messaging_service_sid || process.env.TWILIO_MESSAGING_SERVICE_SID || null;

      const payload = {
        to: phone_number,
        body: content
      };

      if (messagingServiceSid) {
        payload.messagingServiceSid = messagingServiceSid;
      } else if (fromNumber) {
        payload.from = fromNumber;
      } else {
        throw new Error('No messaging service sid or phone number configured for tenant');
      }

      console.log('[TwilioSmsProvider] sending message payload', payload);
      const result = await this.client.messages.create(payload);

      return {
        success: true,
        provider_message_id: result.sid,
        status: 'sent',
        provider: 'twilio'
      };
    } catch (error) {
      this.logError('SMS send', error, { phone_number: message.phone_number });
      return {
        success: false,
        error: error.message,
        provider: 'twilio'
      };
    }
  }

  /**
   * Verify Twilio credentials
   *
   * @returns {Promise<object>} { success: bool, error?: string }
   */
  async verify() {
    try {
      // Simple test: fetch account info
      const account = await this.client.api.accounts(this.credentials.accountSid).fetch();

      return {
        success: true,
        account_type: account.type,
        status: account.status
      };
    } catch (error) {
      this.logError('Credential verification', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Parse Twilio SMS webhook (status callback)
   *
   * Twilio sends status updates when messages are delivered, failed, etc.
   * Webhook signature must be verified for security.
   *
   * @param {object} body - Webhook body (form-urlencoded)
   * @param {string} signature - X-Twilio-Signature header
   * @returns {object} { provider_message_id: string, status: string, timestamp: Date, error?: string }
   */
  parseWebhook(body, signature) {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(body, signature)) {
        throw new Error('Invalid webhook signature');
      }

      // Extract message ID and status
      const messageId = body.MessageSid;
      const status = body.MessageStatus; // e.g., 'delivered', 'failed', 'undelivered'

      if (!messageId) {
        throw new Error('MessageSid missing from webhook');
      }

      return {
        provider_message_id: messageId,
        status: this.normalizeStatus(status),
        timestamp: new Date(),
        raw: body
      };
    } catch (error) {
      this.logError('Webhook parsing', error);
      return {
        error: error.message,
        status: 'unknown'
      };
    }
  }

  /**
   * Verify Twilio webhook signature
   *
   * Twilio includes a signature header for security. We verify it using
   * the auth token and webhook URL.
   *
   * @param {object} body - Webhook body (must be request body, not parsed JSON)
   * @param {string} signature - X-Twilio-Signature header value
   * @returns {boolean} True if signature is valid
   */
  verifyWebhookSignature(body, signature) {
    try {
      // Get webhook URL from config (should be stored when setting up)
      const webhookUrl = this.config.webhook_url || '';

      // Twilio constructs the signature by:
      // 1. Taking the full request URL
      // 2. Appending all POST parameters in alphabetical order
      // 3. Signing with auth token using SHA1

      // This is a simplified check - in production, use Twilio's library
      const twilio = require('twilio');
      return twilio.validateRequest(
        this.credentials.authToken,
        signature,
        webhookUrl,
        body
      );
    } catch (error) {
      console.error('Twilio signature verification failed:', error.message);
      return false;
    }
  }

  /**
   * Get Twilio account status
   *
   * @returns {Promise<object>} { status: string, balance?: number, rate_limit?: number }
   */
  async getStatus() {
    try {
      const account = await this.client.api.accounts(this.credentials.accountSid).fetch();

      return {
        status: account.status,
        account_type: account.type
      };
    } catch (error) {
      this.logError('Status check', error);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Get supported channels for Twilio
   *
   * @returns {array} Supported channels
   */
  static getSupportedChannels() {
    return ['sms', 'whatsapp'];
  }
}

module.exports = TwilioSmsProvider;
