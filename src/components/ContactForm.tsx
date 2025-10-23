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

  // Common input styles
  const inputStyle = {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
  };

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
        <div className="text-sm mb-2" style={{ color: 'var(--accent-secondary)' }}>$ mail contact@chrisloidolt.com</div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Compose your message below</p>
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="pt-6" style={{ borderTop: '1px solid var(--accent-primary)' }}>
          <div className="mb-2 text-sm" style={{ color: 'var(--accent-primary)' }}>
            Message sent successfully
          </div>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
            Thank you for reaching out. I'll get back to you soon.
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm mb-2" style={{ color: 'var(--accent-secondary)' }}>
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
            className="w-full p-3 focus:outline-none disabled:opacity-50 text-sm"
            style={inputStyle}
            placeholder="Your name"
          />
          {errors.name && (
            <div className="mt-2 text-sm" style={{ color: 'var(--color-terminal-red)' }}>
              {errors.name}
            </div>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm mb-2" style={{ color: 'var(--accent-secondary)' }}>
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
            className="w-full p-3 focus:outline-none disabled:opacity-50 text-sm"
            style={inputStyle}
            placeholder="your.email@example.com"
          />
          {errors.email && (
            <div className="mt-2 text-sm" style={{ color: 'var(--color-terminal-red)' }}>
              {errors.email}
            </div>
          )}
        </div>

        {/* Subject Field */}
        <div>
          <label htmlFor="subject" className="block text-sm mb-2" style={{ color: 'var(--accent-secondary)' }}>
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
            className="w-full p-3 focus:outline-none disabled:opacity-50 text-sm"
            style={inputStyle}
            placeholder="What's this about?"
          />
          {errors.subject && (
            <div className="mt-2 text-sm" style={{ color: 'var(--color-terminal-red)' }}>
              {errors.subject}
            </div>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm mb-2" style={{ color: 'var(--accent-secondary)' }}>
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
            className="w-full p-3 focus:outline-none resize-none disabled:opacity-50 text-sm"
            style={inputStyle}
            placeholder="Type your message here..."
          />
          {errors.message && (
            <div className="mt-2 text-sm" style={{ color: 'var(--color-terminal-red)' }}>
              {errors.message}
            </div>
          )}
        </div>

        {/* Form Error */}
        {errors._form && (
          <div className="text-sm" style={{ color: 'var(--color-terminal-red)' }}>
            {errors._form}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:opacity-70"
          style={{ color: 'var(--link-color)' }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="terminal-cursor" style={{ color: 'var(--accent-primary)' }}>_</span>
              <span>Sending...</span>
            </span>
          ) : (
            <span>$ send</span>
          )}
        </button>
      </form>

      {/* Additional Contact Info */}
      <div className="pt-8" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="text-sm mb-6" style={{ color: 'var(--accent-secondary)' }}>$ cat contact-info.txt</div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-4">
            <span className="w-20" style={{ color: 'var(--text-muted)' }}>email</span>
            <a
              href="mailto:contact@chrisloidolt.com"
              className="transition-opacity hover:opacity-70"
              style={{ color: 'var(--link-color)' }}
            >
              contact@chrisloidolt.com
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-20" style={{ color: 'var(--text-muted)' }}>github</span>
            <a
              href="https://github.com/chris-loidolt"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-70"
              style={{ color: 'var(--link-color)' }}
            >
              github.com/chris-loidolt
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
