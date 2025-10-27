import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import RootLayoutClient from './RootLayoutClient';
import { isValidPersonSlug, type PersonSlug } from '@/themes';

// Dynamic metadata generation based on person
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const personSlug = (headersList.get('x-person-slug') || 'chris') as PersonSlug;

  const personNames: Record<PersonSlug, string> = {
    chris: 'Chris Loidolt',
    julia: 'Julia Loidolt',
    theo: 'Theo Loidolt',
    jack: 'Jack Loidolt',
    family: 'Loidolt Family',
  };

  const personDescriptions: Record<PersonSlug, string> = {
    chris: 'Portfolio of Chris Loidolt showcasing design and engineering projects in 3D printing, woodworking, and software development.',
    julia: 'Julia Loidolt\'s portfolio featuring creative projects, art, and design work.',
    theo: 'Theo Loidolt\'s portfolio showcasing technical projects and innovations.',
    jack: 'Jack Loidolt\'s portfolio featuring creative and playful projects.',
    family: 'The Loidolt Family hub showcasing collaborative projects and family adventures.',
  };

  const name = personNames[personSlug];
  const description = personDescriptions[personSlug];

  return {
    title: `${name} - Portfolio`,
    description,
    openGraph: {
      type: 'website',
      title: `${name} - Portfolio`,
      description,
      siteName: `${name} Portfolio`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} - Portfolio`,
      description,
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#1c1a16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get person slug from middleware header
  const headersList = await headers();
  const personSlugFromHeader = headersList.get('x-person-slug') || 'chris';
  const personSlug: PersonSlug = isValidPersonSlug(personSlugFromHeader)
    ? (personSlugFromHeader as PersonSlug)
    : 'chris';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme detection script - runs before body renders to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') ||
                  (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
                document.documentElement.classList.toggle('light', theme === 'light');
              })();
            `,
          }}
        />
      </head>
      <body>
        <RootLayoutClient personSlug={personSlug}>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
