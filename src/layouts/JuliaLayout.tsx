'use client';

/**
 * Julia's Layout
 *
 * Top bar style with logo and centered navigation.
 * Warm, artistic aesthetic.
 */

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BaseLayout from './BaseLayout';
import ThemeToggle from '@/components/ThemeToggle';

interface JuliaLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/', label: 'home' },
  { href: '/projects', label: 'projects' },
  { href: '/gis', label: 'gis' },
  { href: '/about', label: 'about' },
  { href: '/contact', label: 'contact' },
];

export default function JuliaLayout({ children }: JuliaLayoutProps) {
  return (
    <BaseLayout
      navigation={<JuliaNavigation />}
      className="julia-layout"
    >
      {children}
    </BaseLayout>
  );
}

function JuliaNavigation() {
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
      {/* Desktop Top Bar */}
      <nav
        className="hidden md:flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-surface)' }}
      >
        {/* Logo */}
        <div className="px-6 py-3">
          <Link
            href="/"
            className="text-base font-medium hover:opacity-70 transition-opacity"
            style={{ color: 'var(--color-accent-primary)' }}
          >
            Julia Loidolt
          </Link>
        </div>

        {/* Center Navigation */}
        <div className="flex items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-3 text-sm transition-opacity hover:opacity-70"
              style={{
                color: isActive(item.href) ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                fontWeight: isActive(item.href) ? 500 : 400,
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
          className="px-4 py-4 text-sm transition-opacity hover:opacity-70"
          style={{
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-bg-surface)',
            minWidth: '60px',
            minHeight: '52px',
          }}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        <div className="flex-1 px-4 text-sm font-medium" style={{ color: 'var(--color-accent-primary)' }}>
          Julia
        </div>

        <div className="px-4">
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
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
