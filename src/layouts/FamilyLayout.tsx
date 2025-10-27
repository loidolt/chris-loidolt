'use client';

/**
 * Family Hub Layout
 *
 * Rich layout for the family hub with prominent branding
 * and links to all family member sites.
 */

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { useSiteConfig } from '@/lib/theme-provider';

interface FamilyLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/', label: 'home' },
  { href: '/projects', label: 'projects' },
  { href: '/gis', label: 'gis' },
  { href: '/about', label: 'about' },
  { href: '/contact', label: 'contact' },
];

const familyMembers = [
  { slug: 'chris', name: 'Chris' },
  { slug: 'julia', name: 'Julia' },
  { slug: 'theo', name: 'Theo' },
  { slug: 'jack', name: 'Jack' },
];

export default function FamilyLayout({ children }: FamilyLayoutProps) {
  const { siteConfig } = useSiteConfig();
  const { content } = siteConfig.layout;

  return (
    <div
      className="min-h-screen flex flex-col family-layout"
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <FamilyNavigation />

      <main
        className="flex-1"
        style={{
          maxWidth: content.maxWidth,
          margin: content.centerContent ? '0 auto' : '0',
          width: '100%',
          padding: content.padding,
        }}
      >
        {children}
      </main>

      <FamilyFooter />
    </div>
  );
}

function FamilyNavigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0" style={{ zIndex: 9999, backgroundColor: 'var(--color-bg-surface)' }}>
      {/* Desktop Navigation */}
      <nav
        className="hidden md:flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
      >
        {/* Logo */}
        <div className="px-6 py-3">
          <Link
            href="/"
            className="text-base font-bold hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            Loidolt Family
          </Link>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-6 py-3 text-sm relative transition-opacity hover:opacity-70"
              style={{
                color: 'var(--color-text-primary)',
                borderRight: index < navItems.length - 1 ? '1px solid var(--color-border)' : 'none',
                backgroundColor: isActive(item.href) ? 'var(--color-bg-primary)' : 'var(--color-bg-surface)',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Theme Toggle */}
        <div className="px-6">
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav
        className="md:hidden flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
      >
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="px-4 py-4 text-sm"
          style={{
            color: 'var(--color-text-primary)',
            minWidth: '60px',
            minHeight: '52px',
          }}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        <div className="flex-1 px-4 text-sm font-bold" style={{ color: 'var(--color-accent-primary)' }}>
          Loidolt Family
        </div>

        <div className="px-4">
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && isMobile && (
        <div
          className="md:hidden absolute top-full left-0 right-0"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderBottom: '1px solid var(--color-border)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 9999,
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-6 py-4 text-sm transition-opacity hover:opacity-70"
              style={{
                color: 'var(--color-text-primary)',
                borderTop: '1px solid var(--color-border)',
                backgroundColor: isActive(item.href) ? 'var(--color-bg-primary)' : 'var(--color-bg-surface)',
                minHeight: '52px',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

function FamilyFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative"
      style={{
        zIndex: 9998,
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-surface)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Multi-column footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Family Info */}
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-accent-primary)' }}>
              Loidolt Family
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              A multi-talented family sharing our projects, adventures, and creative work.
            </p>
          </div>

          {/* Family Members */}
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-accent-secondary)' }}>
              Family Members
            </h3>
            <div className="space-y-2">
              {familyMembers.map((member) => (
                <a
                  key={member.slug}
                  href={`/${member.slug}`}
                  className="block text-xs hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--color-link)' }}
                >
                  {member.name} →
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--color-accent-tertiary)' }}>
              Connect
            </h3>
            <div className="space-y-2">
              <a
                href="https://github.com/chris-loidolt"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-link)' }}
              >
                github
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          className="pt-6 text-xs text-center"
          style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
        >
          © {currentYear} The Loidolt Family
        </div>
      </div>
    </footer>
  );
}
