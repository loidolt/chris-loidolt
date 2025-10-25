import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

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

    // TODO: Implement email sending
    // Options:
    // 1. Resend (recommended for Cloudflare Workers): https://resend.com
    // 2. Cloudflare Email Workers: https://developers.cloudflare.com/email-routing/email-workers/
    // 3. Mailgun API: https://www.mailgun.com/
    // 4. SendGrid API: https://sendgrid.com/

    // For now, just log the message in development (replace with actual email sending)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Contact form submission:', { name, email, message });
    }

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 500));

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
