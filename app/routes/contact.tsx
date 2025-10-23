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
    { name: "description", content: "Get in touch to discuss your project or collaboration opportunities." },
    { property: "og:title", content: "Contact - Chris Loidolt" },
    { property: "og:description", content: "Get in touch to discuss your project or collaboration opportunities." },
    { name: "twitter:title", content: "Contact - Chris Loidolt" },
    { name: "twitter:description", content: "Get in touch to discuss your project or collaboration opportunities." },
  ];
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Layout>
      <div className="max-w-2xl space-y-8">
        {/* Page Header */}
        <div>
          <div className="text-terminal-cyan text-sm mb-2">$ mail contact@chrisloidolt.com</div>
          <p className="text-terminal-gray text-sm">Compose your message below</p>
        </div>

        {/* Success Message */}
        {actionData?.success && (
          <div className="border-t border-terminal-green pt-6">
            <div className="text-terminal-green mb-2 text-sm">
              Message sent successfully
            </div>
            <p className="text-terminal-text text-sm">
              Thank you for reaching out. I'll get back to you soon.
            </p>
          </div>
        )}

        {/* Form */}
        <Form method="post" className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-terminal-cyan text-sm mb-2">
              name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              disabled={isSubmitting}
              className="w-full bg-terminal-darker border border-terminal-border p-3 text-terminal-text placeholder-terminal-gray focus:border-terminal-cyan focus:outline-none disabled:opacity-50 text-sm"
              placeholder="Your name"
            />
            {actionData?.errors?.name && (
              <div className="mt-2 text-terminal-red text-sm">
                {actionData.errors.name[0]}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-terminal-cyan text-sm mb-2">
              email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              disabled={isSubmitting}
              className="w-full bg-terminal-darker border border-terminal-border p-3 text-terminal-text placeholder-terminal-gray focus:border-terminal-cyan focus:outline-none disabled:opacity-50 text-sm"
              placeholder="your.email@example.com"
            />
            {actionData?.errors?.email && (
              <div className="mt-2 text-terminal-red text-sm">
                {actionData.errors.email[0]}
              </div>
            )}
          </div>

          {/* Subject Field */}
          <div>
            <label htmlFor="subject" className="block text-terminal-cyan text-sm mb-2">
              subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              disabled={isSubmitting}
              className="w-full bg-terminal-darker border border-terminal-border p-3 text-terminal-text placeholder-terminal-gray focus:border-terminal-cyan focus:outline-none disabled:opacity-50 text-sm"
              placeholder="What's this about?"
            />
            {actionData?.errors?.subject && (
              <div className="mt-2 text-terminal-red text-sm">
                {actionData.errors.subject[0]}
              </div>
            )}
          </div>

          {/* Message Field */}
          <div>
            <label htmlFor="message" className="block text-terminal-cyan text-sm mb-2">
              message
            </label>
            <textarea
              id="message"
              name="message"
              required
              disabled={isSubmitting}
              rows={8}
              className="w-full bg-terminal-darker border border-terminal-border p-3 text-terminal-text placeholder-terminal-gray focus:border-terminal-cyan focus:outline-none resize-none disabled:opacity-50 text-sm"
              placeholder="Type your message here..."
            />
            {actionData?.errors?.message && (
              <div className="mt-2 text-terminal-red text-sm">
                {actionData.errors.message[0]}
              </div>
            )}
          </div>

          {/* Form Error */}
          {actionData?.errors?._form && (
            <div className="text-terminal-red text-sm">
              {actionData.errors._form[0]}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="text-terminal-cyan hover:text-terminal-text-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="terminal-cursor">_</span>
                <span>Sending...</span>
              </span>
            ) : (
              <span>$ send</span>
            )}
          </button>
        </Form>

        {/* Additional Contact Info */}
        <div className="border-t border-terminal-border pt-8">
          <div className="text-terminal-cyan text-sm mb-6">$ cat contact-info.txt</div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-terminal-gray w-20">email</span>
              <a
                href="mailto:contact@chrisloidolt.com"
                className="text-terminal-text hover:text-terminal-cyan transition-colors"
              >
                contact@chrisloidolt.com
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-terminal-gray w-20">github</span>
              <a
                href="https://github.com/chris-loidolt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terminal-text hover:text-terminal-cyan transition-colors"
              >
                github.com/chris-loidolt
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
