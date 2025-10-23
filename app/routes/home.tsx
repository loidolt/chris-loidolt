import { useState, useEffect } from "react";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Layout } from "../components/Layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chris Loidolt - Design & Engineering Portfolio" },
    { name: "description", content: "Portfolio of Chris Loidolt showcasing design and engineering projects" },
  ];
}

export default function Home() {
  return (
    <Layout>
      <div className="space-y-8">
        <TerminalWelcome />
        <TerminalPrompt />
        <QuickLinks />
      </div>
    </Layout>
  );
}

function TerminalWelcome() {
  const [displayedText, setDisplayedText] = useState("");
  const fullText = `Welcome to Chris Loidolt's Portfolio Terminal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

System initialized successfully.
Loading portfolio data...

$ whoami
> Design & Engineering Portfolio
> Showcasing projects in 3D printing, woodworking, and software

Type 'help' or navigate using the menu above.`;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 10);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-terminal-green p-6 bg-terminal-black">
      <pre className="text-terminal-green text-sm whitespace-pre-wrap">
        {displayedText}
        <span className="terminal-cursor text-terminal-green">_</span>
      </pre>
    </div>
  );
}

function TerminalPrompt() {
  const commands = [
    { cmd: "ls /projects", desc: "View all projects" },
    { cmd: "cat about.txt", desc: "Learn more about me" },
    { cmd: "mail contact", desc: "Get in touch" },
  ];

  return (
    <div className="border border-terminal-border p-6 bg-terminal-dark">
      <div className="text-terminal-amber mb-4">$ help</div>
      <div className="space-y-2">
        {commands.map((item) => (
          <div key={item.cmd} className="flex items-start gap-4">
            <code className="text-terminal-cyan min-w-[200px]">{item.cmd}</code>
            <span className="text-terminal-text">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickLinks() {
  const stats = [
    { label: "Projects", value: "50+", href: "/projects" },
    { label: "Categories", value: "8", href: "/projects" },
    { label: "3D Models", value: "30+", href: "/projects" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Link
          key={stat.label}
          to={stat.href}
          className="border border-terminal-border p-6 hover:border-terminal-cyan transition-colors bg-terminal-dark group"
        >
          <div className="text-terminal-amber text-sm mb-2">[{stat.label.toLowerCase()}]</div>
          <div className="text-3xl text-terminal-green group-hover:text-terminal-cyan transition-colors">
            {stat.value}
          </div>
        </Link>
      ))}
    </div>
  );
}
