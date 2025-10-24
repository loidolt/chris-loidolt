'use client';

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

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="relative" style={{ zIndex: 10 }}>
      <nav
        className="flex items-center"
        style={{ borderBottom: '1px solid var(--border-color)' }}
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
    </header>
  );
}
