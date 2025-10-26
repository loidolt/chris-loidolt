'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { href: '/', label: 'home' },
  { href: '/projects', label: 'projects' },
  { href: '/gis', label: 'gis' },
  { href: '/about', label: 'about' },
  { href: '/contact', label: 'contact' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0" style={{ zIndex: 9999, backgroundColor: 'var(--bg-surface)' }}>
      {/* Desktop Navigation */}
      <nav
        className="hidden md:flex items-center"
        style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
      >
        {navItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-6 py-3 text-sm relative transition-all hover:opacity-70"
            style={{
              color: 'var(--text-primary)',
              borderRight:
                index < navItems.length - 1 ? '1px solid var(--border-color)' : 'none',
              backgroundColor: isActive(item.href)
                ? 'var(--bg-primary)'
                : 'var(--bg-surface)',
            }}
          >
            {item.label}
          </Link>
        ))}
        <div className="ml-auto px-4">
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav
        className="md:hidden flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
      >
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="px-4 py-4 text-sm transition-all hover:opacity-70"
          style={{
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-surface)',
            minWidth: '60px',
            minHeight: '52px',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Current Page Indicator */}
        <div className="flex-1 px-4 text-sm" style={{ color: 'var(--text-primary)' }}>
          {navItems.find(item => isActive(item.href))?.label || 'home'}
        </div>

        {/* Theme Toggle */}
        <div className="px-4">
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && isMobile && (
        <div
          className="md:hidden absolute top-full left-0 right-0"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-color)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: 9999,
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-6 py-4 text-sm transition-all hover:opacity-70"
              style={{
                color: 'var(--text-primary)',
                borderTop: '1px solid var(--border-color)',
                backgroundColor: isActive(item.href)
                  ? 'var(--bg-primary)'
                  : 'var(--bg-surface)',
                minHeight: '52px',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
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
