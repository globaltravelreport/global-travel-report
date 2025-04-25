import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { logger } from '@/app/utils/logger'

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Check if SMTP configuration is available
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  logger.error('Warning: SMTP credentials are not set in environment variables')
}

async function sendEmail(name: string, email: string, message: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.CONTACT_EMAIL,
    subject: `Contact Form: Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  })
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as ContactFormData;
    logger.info('Contact form submission received', { data });

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      logger.warn('Missing required fields in contact form submission');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email
    await sendEmail(data.name, data.email, data.message);
    logger.info('Email sent successfully', { name: data.name, email: data.email });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error processing contact form submission:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form submission' },
      { status: 500 }
    );
  }
} 