'use client';

/**
 * Base Layout Component
 *
 * Shared layout wrapper that all person-specific layouts inherit from.
 * Provides common structure, footer, and theme integration.
 */

import { ReactNode } from 'react';
import { useSiteConfig } from '@/lib/theme-provider';

export interface BaseLayoutProps {
  children: ReactNode;
  navigation?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function BaseLayout({
  children,
  navigation,
  footer,
  className = '',
}: BaseLayoutProps) {
  const { siteConfig } = useSiteConfig();
  const { content } = siteConfig.layout;

  return (
    <div
      className={`min-h-screen flex flex-col ${className}`}
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Navigation (provided by specific layout) */}
      {navigation}

      {/* Main Content */}
      <main
        className="flex-1"
        style={{
          maxWidth: content.maxWidth,
          margin: content.centerContent ? '0 auto' : '0',
          width: '100%',
          padding: content.padding,
          paddingLeft: `max(${content.padding}, env(safe-area-inset-left))`,
          paddingRight: `max(${content.padding}, env(safe-area-inset-right))`,
        }}
      >
        {children}
      </main>

      {/* Footer (provided by specific layout or default) */}
      {footer || <DefaultFooter />}
    </div>
  );
}

/**
 * Default Footer Component
 */
function DefaultFooter() {
  const { siteConfig, personSlug } = useSiteConfig();
  const { footer } = siteConfig.layout;
  const currentYear = new Date().getFullYear();

  const footerStyles = {
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-surface)',
    paddingBottom: 'env(safe-area-inset-bottom)',
  };

  // Minimal footer style
  if (footer.style === 'minimal') {
    return (
      <footer className="relative" style={{ ...footerStyles, zIndex: 9998 }}>
        <div
          className="container mx-auto px-6 py-4 max-w-6xl"
          style={{
            paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
            paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
          }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>© {currentYear}</span>
            {footer.customText && <span className="opacity-50">{footer.customText}</span>}
          </div>
        </div>
      </footer>
    );
  }

  // Centered footer style
  if (footer.style === 'centered') {
    return (
      <footer className="relative" style={{ ...footerStyles, zIndex: 9998 }}>
        <div
          className="container mx-auto px-6 py-6 max-w-6xl text-center"
          style={{
            paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
            paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
          }}
        >
          <div className="text-xs space-y-2" style={{ color: 'var(--color-text-muted)' }}>
            <div>© {currentYear} {footer.customText || ''}</div>
            {footer.showSocial && (
              <div className="flex items-center justify-center gap-4">
                <a
                  href={`https://github.com/${personSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-link)' }}
                  className="hover:opacity-70 transition-opacity"
                >
                  github
                </a>
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }

  // Split footer style (default from current design)
  return (
    <footer className="relative" style={{ ...footerStyles, zIndex: 9998 }}>
      <div
        className="container mx-auto px-6 py-6 max-w-6xl"
        style={{
          paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
          paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
        }}
      >
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <div className="flex items-center gap-6">
            <span>© {currentYear}</span>
            {footer.showSocial && (
              <a
                href={`https://github.com/${personSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-link)' }}
                className="hover:opacity-70 transition-opacity"
              >
                github
              </a>
            )}
          </div>
          {footer.customText && (
            <div style={{ color: 'var(--color-text-muted)' }}>
              <span className="opacity-50">{footer.customText}</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
