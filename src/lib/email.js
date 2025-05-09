import nodemailer from 'nodemailer';
import { logger } from '@/app/utils/logger';

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'reports@globaltravelreport.com',
        pass: process.env.EMAIL_PASSWORD // Password will be set in environment variables
    }
});

/**
 * Sends an email report using the configured SMTP settings
 * @param {string} subject - The email subject
 * @param {string} body - The email body (HTML supported)
 * @returns {Promise<Object>} - Returns info about the sent message
 */
export async function sendReport(subject, body) {
    try {
        // Send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"Global Travel Report" <reports@globaltravelreport.com>',
            to: 'editorial@globaltravelreport.com',
            subject: subject,
            html: body
        });

        logger.info('Message sent:', { messageId: info.messageId });
        return info;
    } catch (error) {
        logger.error('Error sending email:', error);
        throw error;
    }
} 