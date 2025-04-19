import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

async function verifyRecaptcha(token: string) {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  })

  const data = await response.json()
  return data.success
}

async function subscribeToNewsletter(email: string, name: string) {
  // Here you would typically make an API call to your newsletter service
  // For now, we'll simulate a successful subscription
  console.log(`Subscribing ${email} (${name}) to newsletter`)
  return true
}

export async function POST(request: Request) {
  try {
    const { name, email, subject, message, recaptchaToken, subscribeToNewsletter: shouldSubscribe } = await request.json()

    // Verify reCAPTCHA token
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken)
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { error: 'Invalid reCAPTCHA token' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'editorial@globaltravelreport.com',
      subject: `Contact Form: ${subject}`,
      text: `
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Message: ${message}
        Newsletter Subscription: ${shouldSubscribe ? 'Yes' : 'No'}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <p><strong>Newsletter Subscription:</strong> ${shouldSubscribe ? 'Yes' : 'No'}</p>
      `,
    })

    // Handle newsletter subscription if opted in
    if (shouldSubscribe) {
      await subscribeToNewsletter(email, name)
    }

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
} 