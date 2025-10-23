import { useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/contact";
import { Layout } from "../components/Layout";
import { z } from "zod";

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };

  // Validate form data
  const validation = contactSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    // TODO: Implement Cloudflare Email Worker
    // For now, we'll just log it (you'll need to set up Cloudflare Email Routing)
    console.log("Contact form submission:", validation.data);

    // In production, you would send email via Cloudflare Email Worker:
    // await sendEmail({
    //   to: process.env.CONTACT_EMAIL_TO,
    //   subject: `Portfolio Contact: ${validation.data.subject}`,
    //   body: `Name: ${validation.data.name}\nEmail: ${validation.data.email}\n\n${validation.data.message}`,
    // });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: { _form: ["Failed to send message. Please try again."] },
    };
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact - Chris Loidolt" },
    { name: "description", content: "Get in touch with Chris Loidolt" },
  ];
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Terminal Header */}
        <div className="border border-terminal-green p-4 bg-terminal-black">
          <pre className="text-terminal-green">
{`$ mail contact@chrisloidolt.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Compose your message below...`}
          </pre>
        </div>

        {/* Success Message */}
        {actionData?.success && (
          <div className="border border-terminal-green p-6 bg-terminal-black">
            <div className="text-terminal-green mb-2">
              <span className="text-terminal-text-bright">SUCCESS</span> Message sent!
            </div>
            <p className="text-terminal-text">
              $ Thank you for reaching out. I'll get back to you soon.
            </p>
          </div>
        )}

        {/* Form */}
        <Form method="post" className="space-y-4">
          {/* Name Field */}
          <div className="border border-terminal-border bg-terminal-dark p-4">
            <label htmlFor="name" className="block text-terminal-amber mb-2">
              $ name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              disabled={isSubmitting}
              className="w-full bg-terminal-black border border-terminal-border p-3 text-terminal-text placeholder-terminal-gray focus:border-terminal-cyan focus:outline-none disabled:opacity-50"
              placeholder="Your name"
            />
            {actionData?.errors?.name && (
              <div className="mt-2 text-terminal-red text-sm">
                → {actionData.errors.name[0]}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="border border-terminal-border bg-terminal-dark p-4">
            <label htmlFor="email" className="block text-terminal-amber mb-2">
              $ email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              disabled={isSubmitting}
              className="w-full bg-terminal-black border border-terminal-border p-3 text-terminal-text placeholder-terminal-gray focus:border-terminal-cyan focus:outline-none disabled:opacity-50"
              placeholder="your.email@example.com"
            />
            {actionData?.errors?.email && (
              <div className="mt-2 text-terminal-red text-sm">
                → {actionData.errors.email[0]}
              </div>
            )}
          </div>

          {/* Subject Field */}
          <div className="border border-terminal-border bg-terminal-dark p-4">
            <label htmlFor="subject" className="block text-terminal-amber mb-2">
              $ subject:
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              disabled={isSubmitting}
              className="w-full bg-terminal-black border border-terminal-border p-3 text-terminal-text placeholder-terminal-gray focus:border-terminal-cyan focus:outline-none disabled:opacity-50"
              placeholder="What's this about?"
            />
            {actionData?.errors?.subject && (
              <div className="mt-2 text-terminal-red text-sm">
                → {actionData.errors.subject[0]}
              </div>
            )}
          </div>

          {/* Message Field */}
          <div className="border border-terminal-border bg-terminal-dark p-4">
            <label htmlFor="message" className="block text-terminal-amber mb-2">
              $ message:
            </label>
            <textarea
              id="message"
              name="message"
              required
              disabled={isSubmitting}
              rows={8}
              className="w-full bg-terminal-black border border-terminal-border p-3 text-terminal-text placeholder-terminal-gray focus:border-terminal-cyan focus:outline-none resize-none disabled:opacity-50"
              placeholder="Type your message here..."
            />
            {actionData?.errors?.message && (
              <div className="mt-2 text-terminal-red text-sm">
                → {actionData.errors.message[0]}
              </div>
            )}
          </div>

          {/* Form Error */}
          {actionData?.errors?._form && (
            <div className="border border-terminal-red p-4 bg-terminal-black">
              <div className="text-terminal-red">
                ERROR: {actionData.errors._form[0]}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full border border-terminal-green bg-terminal-black p-4 text-terminal-green hover:bg-terminal-dark hover:text-terminal-text-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="terminal-cursor">_</span>
                <span>Sending...</span>
              </span>
            ) : (
              <span>$ send-message --to=chris [ENTER]</span>
            )}
          </button>
        </Form>

        {/* Additional Contact Info */}
        <div className="border border-terminal-border bg-terminal-dark p-6">
          <div className="text-terminal-amber mb-4">$ cat contact-info.txt</div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-terminal-cyan">email:</span>
              <a
                href="mailto:contact@chrisloidolt.com"
                className="text-terminal-text hover:text-terminal-text-bright"
              >
                contact@chrisloidolt.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-terminal-cyan">github:</span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-text hover:text-terminal-text-bright"
              >
                github.com/chrisloidolt
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-terminal-cyan">linkedin:</span>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-text hover:text-terminal-text-bright"
              >
                linkedin.com/in/chrisloidolt
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
