import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions } from './$types';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';
import { ENV, debugLog } from '$lib/env';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '$lib/rateLimit';

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

/**
 * Send contact form email via Mailgun
 */
async function sendContactEmail(data: z.infer<typeof contactSchema>): Promise<void> {
  // Check if Mailgun is configured
  if (!ENV.MAILGUN_API_KEY || !ENV.MAILGUN_DOMAIN || !ENV.CONTACT_EMAIL_TO || !ENV.CONTACT_EMAIL_FROM) {
    console.warn('[Contact Form] Mailgun not configured. Email not sent.');
    console.log('[Contact Form] Submission:', data);
    return;
  }

  try {
    // Initialize Mailgun client
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: 'api',
      key: ENV.MAILGUN_API_KEY,
      url: ENV.MAILGUN_REGION === 'eu' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net',
    });

    // Send email
    const result = await mg.messages.create(ENV.MAILGUN_DOMAIN, {
      from: `${data.name} <${ENV.CONTACT_EMAIL_FROM}>`,
      to: [ENV.CONTACT_EMAIL_TO],
      'h:Reply-To': data.email,
      subject: `Contact Form: ${data.subject}`,
      text: `
Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

---
This message was sent via the contact form on your website.
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f4f4f4; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #666; }
    .value { margin-top: 5px; }
    .message-box { background: #f9f9f9; padding: 15px; border-left: 3px solid #0066cc; border-radius: 3px; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">New Contact Form Submission</h2>
    </div>

    <div class="field">
      <div class="label">From:</div>
      <div class="value">${data.name} &lt;${data.email}&gt;</div>
    </div>

    <div class="field">
      <div class="label">Subject:</div>
      <div class="value">${data.subject}</div>
    </div>

    <div class="field">
      <div class="label">Message:</div>
      <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
    </div>

    <div class="footer">
      This message was sent via the contact form on your website.
    </div>
  </div>
</body>
</html>
      `.trim(),
    });

    debugLog(`[Contact Form] Email sent successfully. ID: ${result.id}`);
  } catch (error) {
    console.error('[Contact Form] Failed to send email:', error);
    throw new Error('Failed to send email via Mailgun');
  }
}

export const actions = {
  default: async ({ request }) => {
    // Check rate limit first
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, RATE_LIMITS.CONTACT);

    if (!rateLimit.success) {
      return fail(429, {
        error: RATE_LIMITS.CONTACT.message,
        retryAfter: rateLimit.retryAfter,
      });
    }

    const data = await request.formData();
    const formData = {
      name: data.get('name'),
      email: data.get('email'),
      subject: data.get('subject'),
      message: data.get('message'),
    };

    // Validate form data
    const validation = contactSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return fail(400, { errors, data: formData });
    }

    try {
      // Send email via Mailgun
      await sendContactEmail(validation.data);

      return { success: true };
    } catch (error) {
      console.error('[Contact Form] Error processing form:', error);
      return fail(500, { error: 'Failed to send message. Please try again.', data: formData });
    }
  },
} satisfies Actions;
