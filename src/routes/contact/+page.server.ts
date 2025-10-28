import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions } from './$types';

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const actions = {
  default: async ({ request }) => {
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
      // TODO: Implement server endpoint for email sending
      // For now, just log the data in development
      console.log('Contact form submission:', validation.data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      return { success: true };
    } catch (error) {
      return fail(500, { error: 'Failed to send message. Please try again.', data: formData });
    }
  },
} satisfies Actions;
