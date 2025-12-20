/**
 * Demo Provider
 *
 * Simulates message sending for demo/test tenants.
 *
 * - No actual API calls (Twilio, AWS, etc.)
 * - Generates realistic message IDs
 * - Simulates webhook events via EventBridge
 * - Supports realistic delivery delays
 *
 * Demo mode allows sales & platform testing without incurring costs
 * or affecting real customers.
 */

const MessagingProvider = require('../MessagingProvider');

class DemoProvider extends MessagingProvider {
  constructor(tenantId, channel, credentials = {}, config = {}) {
    // Demo doesn't need real credentials
    super(tenantId, channel, {}, config);
  }

  /**
   * Simulate message send
   *
   * In demo mode:
   * 1. Return immediately with "sent" status
   * 2. Schedule delivery update in 3-5 seconds
   * 3. Schedule read update in 5-10 seconds
   * 4. All via EventBridge (automated, not manual)
   *
   * @param {object} message - Message object
   * @returns {Promise<object>} { success: bool, provider_message_id: string, status: string }
   */
  async send(message) {
    try {
      // Generate realistic demo message ID
      const demoMessageId = this.generateDemoMessageId(message.id);

      // In real implementation, would schedule EventBridge events here
      // For now, just return success
      console.log(`[Demo] Message sent (simulated): ${message.id} -> ${demoMessageId}`);

      return {
        success: true,
        provider_message_id: demoMessageId,
        status: 'sent',
        provider: 'demo',
        demo: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        provider: 'demo',
        demo: true
      };
    }
  }

  /**
   * Verify demo provider
   *
   * Demo provider always works - no real credentials to verify
   *
   * @returns {Promise<object>} { success: bool }
   */
  async verify() {
    return {
      success: true,
      message: 'Demo provider - no credentials needed'
    };
  }

  /**
   * Parse demo webhook
   *
   * In demo mode, we simulate webhooks via EventBridge scheduled events.
   * This parser handles the simulated webhook structure.
   *
   * @param {object} body - Simulated webhook body
   * @param {string} signature - Not used in demo
   * @returns {object} { provider_message_id: string, status: string, timestamp: Date }
   */
  parseWebhook(body, signature) {
    try {
      // Demo webhooks have simple structure
      if (!body.provider_message_id) {
        throw new Error('provider_message_id missing from demo webhook');
      }

      return {
        provider_message_id: body.provider_message_id,
        status: this.normalizeStatus(body.status),
        timestamp: new Date(body.timestamp || new Date()),
        demo: true
      };
    } catch (error) {
      console.error('[Demo] Webhook parsing failed:', error.message);
      return {
        error: error.message,
        status: 'unknown',
        demo: true
      };
    }
  }

  /**
   * Get demo provider status
   *
   * @returns {Promise<object>} { status: string }
   */
  async getStatus() {
    return {
      status: 'active',
      message: 'Demo provider - ready to simulate messages',
      demo: true
    };
  }

  /**
   * Generate a realistic demo message ID
   *
   * Mimics provider IDs so development/testing feels real
   *
   * @param {string} messageId - Internal message ID
   * @returns {string} Demo provider message ID
   *
   * @example
   * generateDemoMessageId('msg-123') => 'demo-msg-123-1703081234567'
   */
  generateDemoMessageId(messageId) {
    const timestamp = Date.now();
    return `demo-${messageId}-${timestamp}`;
  }

  /**
   * Get demo delays for realistic simulation
   *
   * Returns realistic delays for demo message status progression
   *
   * @returns {object} { sent_delay, delivered_delay, read_delay }
   */
  static getDemoDelays() {
    return {
      sent_delay: 0, // Immediate
      delivered_delay: 3000 + Math.random() * 2000, // 3-5 seconds
      read_delay: 5000 + Math.random() * 5000 // 5-10 seconds
    };
  }

  /**
   * Get supported channels for demo
   *
   * Demo provider works with all channels
   *
   * @returns {array} All channels
   */
  static getSupportedChannels() {
    return ['sms', 'whatsapp', 'email'];
  }
}

module.exports = DemoProvider;
