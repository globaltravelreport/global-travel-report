import { NextResponse } from "next/server";
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message, recaptchaToken } = body;

    // Verify reCAPTCHA
    const isValid = await verifyRecaptcha(recaptchaToken);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid reCAPTCHA" },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Send an email using a service like SendGrid or AWS SES
    // 2. Store the message in a database
    // 3. Forward to a CRM system

    // For now, we'll just log it
    console.log("Contact form submission:", { name, email, message });

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
} 