import { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact - Chris Loidolt',
  description: 'Get in touch to discuss your project or collaboration opportunities.',
};

export default function ContactPage() {
  return <ContactForm />;
}
