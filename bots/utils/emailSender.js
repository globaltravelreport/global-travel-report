const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create reusable transporter object only if not in test mode
const transporter = process.env.NODE_ENV !== 'test' ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
}) : null;

/**
 * Sends an email report
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body
 * @param {string} [to] - Recipient email (optional)
 * @param {boolean} [isTest] - If true, logs to console instead of sending
 * @param {Array} [attachments] - Array of attachments
 * @returns {Promise<void>}
 */
async function sendReport(subject, html, to, isTest = false, attachments = []) {
    try {
        // Always use test mode if NODE_ENV is test
        const testMode = isTest || process.env.NODE_ENV === 'test';

        // Validate required environment variables only if not in test mode
        if (!testMode && (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS)) {
            throw new Error('Email configuration is incomplete');
        }

        const recipient = to || process.env.EMAIL_TO;
        if (!recipient) {
            throw new Error('No recipient email address specified');
        }

        if (testMode) {
            logger.info('Test mode: Email would be sent', {
                to: recipient,
                subject,
                attachments: attachments.length
            });
            return;
        }

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: recipient,
            subject,
            html,
            text: html.replace(/<[^>]*>/g, ''), // Plain text fallback
            attachments
        });

        logger.info('Email sent successfully', {
            messageId: info.messageId,
            to: recipient
        });
    } catch (error) {
        logger.error('Failed to send email', {
            error: error.message,
            subject,
            to
        });
        throw error;
    }
}

module.exports = {
    sendReport
}; 