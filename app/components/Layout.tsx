import { Link } from "react-router";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-terminal-darker">
      <TerminalHeader />
      <main className="flex-1 container mx-auto px-6 py-12 max-w-6xl">
        {children}
      </main>
      <TerminalFooter />
    </div>
  );
}

function TerminalHeader() {
  return (
    <header className="border-b border-terminal-border">
      <div className="container mx-auto px-6 py-6 max-w-6xl">
        <TerminalNav />
      </div>
    </header>
  );
}

function TerminalNav() {
  const navItems = [
    { href: "/", label: "home" },
    { href: "/projects", label: "projects" },
    { href: "/about", label: "about" },
    { href: "/contact", label: "contact" },
  ];

  return (
    <nav className="flex gap-6 text-sm">
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className="text-terminal-cyan hover:text-terminal-text-bright transition-colors"
        >
          [{item.label}]
        </Link>
      ))}
    </nav>
  );
}

function TerminalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-terminal-border">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex items-center justify-between text-sm text-terminal-text">
          <div>© {currentYear} Chris Loidolt</div>
          <a
            href="https://github.com/chris-loidolt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-terminal-cyan hover:text-terminal-text-bright transition-colors"
          >
            [github]
          </a>
        </div>
      </div>
    </footer>
  );
}
