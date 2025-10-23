import { Link } from "react-router";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-terminal-darker">
      <TerminalHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
      <TerminalFooter />
    </div>
  );
}

function TerminalHeader() {
  return (
    <header className="border-b border-terminal-border bg-terminal-dark">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="text-terminal-green hover:text-terminal-cyan transition-colors">
            <pre className="text-sm">
{`┌─────────────────────┐
│ chris@loidolt:~$ █  │
└─────────────────────┘`}
            </pre>
          </Link>
          <div className="text-terminal-text text-sm">
            <span className="text-terminal-amber">status:</span> <span className="text-terminal-green">online</span>
          </div>
        </div>

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
    <nav className="flex gap-4 text-sm">
      <span className="text-terminal-amber">$</span>
      {navItems.map((item, index) => (
        <span key={item.href}>
          <Link
            to={item.href}
            className="text-terminal-cyan hover:text-terminal-text-bright hover:underline transition-colors"
          >
            [{item.label}]
          </Link>
          {index < navItems.length - 1 && (
            <span className="text-terminal-border ml-4">│</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function TerminalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-terminal-border bg-terminal-dark">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between text-sm">
          <div className="text-terminal-text">
            <span className="text-terminal-amber">$</span> © {currentYear} Chris Loidolt
          </div>
          <div className="flex gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-cyan hover:text-terminal-text-bright transition-colors"
            >
              [github]
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-terminal-cyan hover:text-terminal-text-bright transition-colors"
            >
              [linkedin]
            </a>
          </div>
        </div>
        <div className="mt-4 text-xs text-terminal-gray">
          <span className="text-terminal-green">→</span> Built with React Router + Cloudflare Workers
        </div>
      </div>
    </footer>
  );
}
