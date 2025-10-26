import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import LayoutContent from '@/components/LayoutContent';

export const metadata: Metadata = {
  title: 'Chris Loidolt - Design & Engineering Portfolio',
  description: 'Portfolio of Chris Loidolt showcasing design and engineering projects in 3D printing, woodworking, and software development.',
  openGraph: {
    type: 'website',
    title: 'Chris Loidolt - Design & Engineering Portfolio',
    description: 'Portfolio of Chris Loidolt showcasing design and engineering projects in 3D printing, woodworking, and software development.',
    siteName: 'Chris Loidolt Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chris Loidolt - Design & Engineering Portfolio',
    description: 'Portfolio of Chris Loidolt showcasing design and engineering projects in 3D printing, woodworking, and software development.',
  },
};

export const viewport: Viewport = {
  themeColor: '#1c1a16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en">
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
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {/* Navigation Header */}
          <Navigation />

          {/* Main Content - conditionally styled based on route */}
          <LayoutContent>{children}</LayoutContent>

          {/* Terminal Footer */}
          <footer
            className="relative"
            style={{
              zIndex: 9998,
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            <div className="container mx-auto px-6 py-6 max-w-6xl" style={{ paddingLeft: 'max(1.5rem, env(safe-area-inset-left))', paddingRight: 'max(1.5rem, env(safe-area-inset-right))' }}>
              <div
                className="flex items-center justify-between text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                <div className="flex items-center gap-6">
                  <span>© {currentYear} Chris Loidolt</span>
                  <a
                    href="https://github.com/chris-loidolt"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--link-color)' }}
                    className="hover:opacity-70 transition-opacity"
                  >
                    github
                  </a>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                  <span className="opacity-50">~/portfolio</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
