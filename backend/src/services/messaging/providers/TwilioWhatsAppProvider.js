/**
 * Twilio WhatsApp Provider
 *
 * Sends WhatsApp messages via Twilio API
 * Shares same infrastructure as SMS (same account, auth, etc.)
 */

const TwilioSmsProvider = require('./TwilioSmsProvider');

class TwilioWhatsAppProvider extends TwilioSmsProvider {
  /**
   * Send WhatsApp message via Twilio
   *
   * @param {object} message - Message object
   *   - phone_number: Recipient phone number with WhatsApp account (E.164 format)
   *   - content: Message body (text)
   *   - id: Message ID (for tracking)
   *   - from_number: Optional sender number (WhatsApp Business Account number)
   *
   * @returns {Promise<object>} { success: bool, provider_message_id: string, status: string, error?: string }
   */
  async send(message) {
    try {
      const { phone_number, content, id: messageId, from_number } = message;

      // Get sender WhatsApp Business Account number
      const fromNumber = from_number || this.config.whatsapp_number;
      if (!fromNumber) {
        throw new Error('No WhatsApp Business Account number configured for tenant');
      }

      // Validate recipient has WhatsApp
      if (!phone_number) {
        throw new Error('Recipient phone number missing');
      }

      // Send via Twilio (WhatsApp uses same API as SMS, just with different number format)
      // WhatsApp numbers are prefixed with "whatsapp:"
      const result = await this.client.messages.create({
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${phone_number}`,
        body: content
      });

      return {
        success: true,
        provider_message_id: result.sid,
        status: 'sent',
        provider: 'twilio'
      };
    } catch (error) {
      this.logError('WhatsApp send', error, { phone_number: message.phone_number });
      return {
        success: false,
        error: error.message,
        provider: 'twilio'
      };
    }
  }

  /**
   * Parse Twilio WhatsApp webhook
   *
   * Same as SMS webhook but handles WhatsApp-specific statuses
   *
   * @param {object} body - Webhook body
   * @param {string} signature - X-Twilio-Signature header
   * @returns {object} { provider_message_id: string, status: string, timestamp: Date }
   */
  parseWebhook(body, signature) {
    // Reuse parent's signature verification
    const parent = super.parseWebhook(body, signature);

    if (parent.error) {
      return parent;
    }

    // WhatsApp status names are the same as SMS
    // (delivered, failed, read, sent, etc.)

    return parent;
  }

  /**
   * Get supported channels for Twilio WhatsApp
   *
   * @returns {array} Supported channels
   */
  static getSupportedChannels() {
    return ['whatsapp'];
  }
}

module.exports = TwilioWhatsAppProvider;
