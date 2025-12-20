/**
 * AWS SES Email Provider
 *
 * Sends emails via AWS Simple Email Service (SES)
 * Receives delivery/bounce/complaint events via SNS (routed to SQS)
 */

const MessagingProvider = require('../MessagingProvider');
const AWS = require('aws-sdk');

class SESEmailProvider extends MessagingProvider {
  constructor(tenantId, channel, credentials, config = {}) {
    super(tenantId, channel, credentials, config);

    // Validate required credentials
    if (!this.hasRequiredCredentials(['accessKeyId', 'secretAccessKey', 'region'])) {
      throw new Error('AWS SES: Missing required credentials (accessKeyId, secretAccessKey, region)');
    }

    // Initialize SES client
    this.ses = new AWS.SES({
      region: this.credentials.region,
      accessKeyId: this.credentials.accessKeyId,
      secretAccessKey: this.credentials.secretAccessKey
    });
  }

  /**
   * Send email via AWS SES
   *
   * @param {object} message - Message object
   *   - to_email: Recipient email address
   *   - subject: Email subject
   *   - html_body: HTML email body
   *   - text_body: Plain text fallback (optional)
   *   - from_email: Sender email (must be verified in SES)
   *   - id: Message ID (for tracking)
   *
   * @returns {Promise<object>} { success: bool, provider_message_id: string, status: string, error?: string }
   */
  async send(message) {
    try {
      const {
        to_email,
        subject,
        html_body,
        text_body,
        from_email,
        id: messageId
      } = message;

      // Validate inputs
      if (!to_email || !subject || !html_body || !from_email) {
        throw new Error('Missing required email fields: to_email, subject, html_body, from_email');
      }

      // Send via SES
      const result = await this.ses.sendEmail({
        Source: from_email,
        Destination: {
          ToAddresses: [to_email]
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8'
          },
          Body: {
            Html: {
              Data: html_body,
              Charset: 'UTF-8'
            },
            Text: text_body ? {
              Data: text_body,
              Charset: 'UTF-8'
            } : undefined
          }
        },
        ConfigurationSetName: this.config.configuration_set || 'engageninja-email-events',
        Tags: [
          { Name: 'tenant_id', Value: this.tenantId },
          { Name: 'message_id', Value: messageId }
        ]
      }).promise();

      return {
        success: true,
        provider_message_id: result.MessageId,
        status: 'sent',
        provider: 'aws_ses'
      };
    } catch (error) {
      this.logError('Email send', error, { to_email: message.to_email });
      return {
        success: false,
        error: error.message,
        provider: 'aws_ses'
      };
    }
  }

  /**
   * Verify AWS SES credentials and sender email
   *
   * @returns {Promise<object>} { success: bool, verified_emails?: array, error?: string }
   */
  async verify() {
    try {
      // Check account's verified email addresses
      const result = await this.ses.listVerifiedEmailAddresses().promise();

      return {
        success: result.VerifiedEmailAddresses && result.VerifiedEmailAddresses.length > 0,
        verified_emails: result.VerifiedEmailAddresses || [],
        count: (result.VerifiedEmailAddresses || []).length
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
   * Parse AWS SNS webhook for SES email events
   *
   * SES publishes bounce, delivery, complaint, and send events to SNS.
   * SNS routes them to SQS queues.
   * This parser handles SNS-wrapped SES notifications.
   *
   * @param {object} body - SNS message body (JSON parsed)
   * @param {string} signature - SNS signature (for verification)
   * @returns {object} { provider_message_id: string, status: string, timestamp: Date, error?: string }
   *
   * @example
   * // SNS publishes SES event:
   * {
   *   Type: "Notification",
   *   Message: {
   *     eventType: "Delivery",
   *     mail: { messageId: "...", tags: { ... } },
   *     delivery: { timestamp: "...", processingTimeMillis: ... }
   *   }
   * }
   */
  parseWebhook(body, signature) {
    try {
      // Handle both direct SES notifications and SNS-wrapped ones
      let event = body;

      // If this came through SNS, unwrap it
      if (body.Type === 'Notification' && body.Message) {
        event = JSON.parse(body.Message);
      }

      // Validate structure
      if (!event.mail || !event.mail.messageId) {
        throw new Error('Invalid SES event structure');
      }

      const messageId = event.mail.messageId;
      const eventType = event.eventType; // Send, Bounce, Complaint, Delivery

      // Map SES event types to standard statuses
      let status = 'unknown';
      switch (eventType) {
        case 'Send':
          status = 'sent';
          break;
        case 'Delivery':
          status = 'delivered';
          break;
        case 'Bounce':
          status = 'failed';
          break;
        case 'Complaint':
          status = 'failed';
          break;
        case 'Open':
          status = 'read';
          break;
        case 'Click':
          status = 'read'; // Approximate - link was clicked
          break;
      }

      // Extract timestamp
      const timestamp = event.delivery?.timestamp ||
        event.bounce?.timestamp ||
        event.complaint?.timestamp ||
        new Date().toISOString();

      return {
        provider_message_id: messageId,
        status: this.normalizeStatus(status),
        timestamp: new Date(timestamp),
        event_type: eventType,
        raw: event
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
   * Get AWS SES account status
   *
   * @returns {Promise<object>} { status: string, send_quota?: object }
   */
  async getStatus() {
    try {
      const quota = await this.ses.getSendQuota().promise();

      return {
        status: 'active',
        daily_quota: quota.Max24HourSend,
        daily_sent: quota.SentLast24Hour,
        max_rate: quota.MaxSendRate
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
   * Get supported channels for AWS SES
   *
   * @returns {array} Supported channels
   */
  static getSupportedChannels() {
    return ['email'];
  }
}

module.exports = SESEmailProvider;
