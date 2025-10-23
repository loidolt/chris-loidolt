import { useState } from 'react';
import { z } from 'zod';

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitSuccess(false);

    // Validate form data
    const validation = contactSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement server endpoint for email sending
      // For now, just log the data
      console.log('Contact form submission:', validation.data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setErrors({ _form: 'Failed to send message. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Page Header */}
      <div>
        <div className="text-terminal-cyan text-sm mb-2">$ mail contact@chrisloidolt.com</div>
        <p className="text-terminal-gray text-sm">Compose your message below</p>
      </div>

      {/* Success Message */}
      {submitSuccess && (
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-terminal-cyan text-sm mb-2">
            name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full bg-terminal-darker border border-terminal-border p-3 text-terminal-text placeholder-terminal-gray focus:border-terminal-cyan focus:outline-none disabled:opacity-50 text-sm"
            placeholder="Your name"
          />
          {errors.name && (
            <div className="mt-2 text-terminal-red text-sm">
              {errors.name}
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
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full bg-terminal-darker border border-terminal-border p-3 text-terminal-text placeholder-terminal-gray focus:border-terminal-cyan focus:outline-none disabled:opacity-50 text-sm"
            placeholder="your.email@example.com"
          />
          {errors.email && (
            <div className="mt-2 text-terminal-red text-sm">
              {errors.email}
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
            value={formData.subject}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full bg-terminal-darker border border-terminal-border p-3 text-terminal-text placeholder-terminal-gray focus:border-terminal-cyan focus:outline-none disabled:opacity-50 text-sm"
            placeholder="What's this about?"
          />
          {errors.subject && (
            <div className="mt-2 text-terminal-red text-sm">
              {errors.subject}
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
            value={formData.message}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            rows={8}
            className="w-full bg-terminal-darker border border-terminal-border p-3 text-terminal-text placeholder-terminal-gray focus:border-terminal-cyan focus:outline-none resize-none disabled:opacity-50 text-sm"
            placeholder="Type your message here..."
          />
          {errors.message && (
            <div className="mt-2 text-terminal-red text-sm">
              {errors.message}
            </div>
          )}
        </div>

        {/* Form Error */}
        {errors._form && (
          <div className="text-terminal-red text-sm">
            {errors._form}
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
      </form>

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
  );
}
