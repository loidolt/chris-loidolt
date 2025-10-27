'use client';

/**
 * Theo's Layout
 *
 * Sidebar navigation on the left with modern tech aesthetic.
 * Clean and functional with focus on content.
 */

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { useSiteConfig } from '@/lib/theme-provider';

interface TheoLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/', label: 'home', icon: '~' },
  { href: '/projects', label: 'projects', icon: '{}' },
  { href: '/gis', label: 'gis', icon: '📍' },
  { href: '/about', label: 'about', icon: 'ℹ' },
  { href: '/contact', label: 'contact', icon: '@' },
];

export default function TheoLayout({ children }: TheoLayoutProps) {
  const { siteConfig } = useSiteConfig();
  const { content } = siteConfig.layout;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      className="min-h-screen flex theo-layout"
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Sidebar Navigation */}
      <TheoSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: sidebarOpen ? '0' : '0' }}>
        {/* Top Bar (mobile) */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            ☰
          </button>
          <span style={{ color: 'var(--color-accent-primary)', fontWeight: 600 }}>TL</span>
          <ThemeToggle />
        </div>

        {/* Content */}
        <main
          className="flex-1"
          style={{
            maxWidth: content.maxWidth,
            width: '100%',
            padding: content.padding,
          }}
        >
          {children}
        </main>

        {/* Footer */}
        <footer
          style={{
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-surface)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="px-6 py-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            © {new Date().getFullYear()} Theo Loidolt
          </div>
        </footer>
      </div>
    </div>
  );
}

interface TheoSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

function TheoSidebar({ isOpen, onToggle }: TheoSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col sticky top-0 h-screen"
        style={{
          width: '240px',
          backgroundColor: 'var(--color-bg-surface)',
          borderRight: '1px solid var(--color-border)',
          zIndex: 9999,
        }}
      >
        {/* Logo */}
        <div
          className="px-6 py-6"
          style={{
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <Link
            href="/"
            className="text-xl font-bold hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            TL
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-6 py-3 transition-opacity hover:opacity-70"
              style={{
                color: isActive(item.href) ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                backgroundColor: isActive(item.href) ? 'var(--color-bg-primary)' : 'transparent',
                fontWeight: isActive(item.href) ? 600 : 400,
              }}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div
          className="px-6 py-4"
          style={{
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[9998]"
          onClick={onToggle}
        >
          <aside
            className="fixed top-0 left-0 h-full flex flex-col"
            style={{
              width: '240px',
              backgroundColor: 'var(--color-bg-surface)',
              borderRight: '1px solid var(--color-border)',
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo */}
            <div
              className="px-6 py-6 flex items-center justify-between"
              style={{
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <Link
                href="/"
                className="text-xl font-bold"
                style={{ color: 'var(--color-accent-primary)' }}
                onClick={onToggle}
              >
                TL
              </Link>
              <button onClick={onToggle} style={{ color: 'var(--color-text-primary)' }}>
                ✕
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-6 py-3"
                  style={{
                    color: isActive(item.href) ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                    backgroundColor: isActive(item.href) ? 'var(--color-bg-primary)' : 'transparent',
                  }}
                  onClick={onToggle}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
