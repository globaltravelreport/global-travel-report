import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Create a transporter using Hostinger SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Default score threshold if not set in environment
const RECAPTCHA_SCORE_THRESHOLD = Number(process.env.RECAPTCHA_SCORE_THRESHOLD) || 0.5;

// Check if reCAPTCHA secret key is available
const recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
if (!recaptchaSecretKey) {
  console.error('Warning: RECAPTCHA_SECRET_KEY is not set in environment variables');
}

// Check if SMTP configuration is available
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('Warning: SMTP credentials are not set in environment variables');
}

async function verifyRecaptcha(token: string) {
  if (!recaptchaSecretKey) {
    console.error('Cannot verify reCAPTCHA: Secret key is missing');
    return { success: false, score: 0 };
  }

  console.log('Verifying reCAPTCHA token...');
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${recaptchaSecretKey}&response=${token}`,
  })

  const data = await response.json()
  console.log('reCAPTCHA verification response:', {
    success: data.success,
    score: data.score,
    action: data.action,
    hostname: data.hostname
  });

  return {
    success: data.success,
    score: data.score,
  }
}

function createEmailTemplate(name: string, email: string, message: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .logo-container {
            text-align: center;
            padding: 20px 0;
            margin-bottom: 24px;
            background-color: #0A192F;
          }
          .logo {
            max-width: 200px;
            height: auto;
            display: block;
            margin: 0 auto;
          }
          .header {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .content {
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            border: 1px solid #e9ecef;
          }
          .field {
            margin-bottom: 15px;
          }
          .label {
            font-weight: bold;
            color: #495057;
          }
          .message {
            white-space: pre-wrap;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
          }
          .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 0.9em;
            color: #6c757d;
          }
        </style>
      </head>
      <body>
        <!-- Logo Container -->
        <div class="logo-container">
          <img 
            src="https://www.globaltravelreport.com/logo.png" 
            alt="Global Travel Report Logo" 
            class="logo" 
            style="max-width: 200px; height: auto; display: block; margin: 0 auto;"
            width="200"
          />
        </div>
        
        <div class="header">
          <h1 style="margin: 0; color: #2c3e50;">📬 New Contact Form Submission</h1>
        </div>
        
        <div class="content">
          <div class="field">
            <span class="label">Name:</span>
            <div>${name}</div>
          </div>
          
          <div class="field">
            <span class="label">Email:</span>
            <div>${email}</div>
          </div>
          
          <div class="field">
            <span class="label">Message:</span>
            <div class="message">${message}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>This message was sent from the contact form at Global Travel Report.</p>
        </div>
      </body>
    </html>
  `;
}

function createPlainTextTemplate(name: string, email: string, message: string) {
  return `
New Contact Form Submission
==========================

Name: ${name}
Email: ${email}

Message:
${message}

---
Sent from Global Travel Report
  `;
}

async function sendEmail(name: string, email: string, message: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials are not configured');
  }

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: 'editorial@globaltravelreport.com',
    subject: `New Contact Form Submission from ${name}`,
    text: createPlainTextTemplate(name, email, message),
    html: createEmailTemplate(name, email, message),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    // Try sending plain text only if HTML fails
    try {
      const plainTextOptions = {
        ...mailOptions,
        html: undefined, // Remove HTML content
      };
      const info = await transporter.sendMail(plainTextOptions);
      console.log('Plain text email sent:', info.messageId);
      return true;
    } catch (plainTextError) {
      console.error('Error sending plain text email:', plainTextError);
      throw new Error('Failed to send email in both HTML and plain text formats');
    }
  }
}

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  recaptchaToken: string;
}

export async function POST(request: Request) {
  try {
    const body: ContactFormData = await request.json();
    const { name, email, message, recaptchaToken } = body;

    console.log('Received contact form submission:', { name, email, message });

    // Validate required fields
    if (!name || !email || !message || !recaptchaToken) {
      console.log('Missing required fields:', { name, email, message, recaptchaToken });
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA token
    const { success, score } = await verifyRecaptcha(recaptchaToken);

    if (!success || score < RECAPTCHA_SCORE_THRESHOLD) {
      console.log('reCAPTCHA verification failed:', { success, score, threshold: RECAPTCHA_SCORE_THRESHOLD });
      return NextResponse.json(
        { message: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    console.log('reCAPTCHA verification passed:', { success, score });

    // Send email
    await sendEmail(name, email, message);

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 