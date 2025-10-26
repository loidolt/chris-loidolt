import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Initialize Resend client (only in production if API key is set)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, message } = result.data;

    // Log in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Contact form submission:', { name, email, message });
    }

    // Send email using Resend (if configured)
    if (resend && process.env.CONTACT_EMAIL_TO) {
      try {
        await resend.emails.send({
          from: process.env.CONTACT_EMAIL_FROM || 'noreply@chrisloidolt.com',
          to: process.env.CONTACT_EMAIL_TO,
          replyTo: email,
          subject: `Portfolio Contact: ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><small>Sent from chrisloidolt.com contact form</small></p>
          `,
          text: `
New Contact Form Submission

From: ${name} (${email})

Message:
${message}

---
Sent from chrisloidolt.com contact form
          `,
        });

        console.log('Email sent successfully via Resend');
      } catch (emailError) {
        console.error('Failed to send email via Resend:', emailError);
        // Don't fail the request if email fails - log it but return success
        // This allows the form to work even if email service is down
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.warn('Email not configured: RESEND_API_KEY or CONTACT_EMAIL_TO missing');
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully!',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}
