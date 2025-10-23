import { useState, useEffect } from "react";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Layout } from "../components/Layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chris Loidolt - Design & Engineering Portfolio" },
    { name: "description", content: "Portfolio of Chris Loidolt showcasing design and engineering projects in 3D printing, woodworking, and software development." },
    { property: "og:title", content: "Chris Loidolt - Design & Engineering Portfolio" },
    { property: "og:description", content: "Portfolio showcasing design and engineering projects in 3D printing, woodworking, and software development." },
    { name: "twitter:title", content: "Chris Loidolt - Design & Engineering Portfolio" },
    { name: "twitter:description", content: "Portfolio showcasing design and engineering projects in 3D printing, woodworking, and software development." },
  ];
}

export default function Home() {
  return (
    <Layout>
      <div>
        <TerminalWelcome />
        <TerminalPrompt />
        <QuickLinks />
      </div>
    </Layout>
  );
}

function TerminalWelcome() {
  const [displayedText, setDisplayedText] = useState("");
  const fullText = `$ cat welcome.txt

Design & Engineering Portfolio
Showcasing projects in 3D printing, woodworking, and software

Navigate using the menu above or explore [projects]`;

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
    <div className="py-8">
      <pre className="text-terminal-text text-sm whitespace-pre-wrap leading-relaxed">
        {displayedText}
        <span className="terminal-cursor text-terminal-green">_</span>
      </pre>
    </div>
  );
}

function TerminalPrompt() {
  const commands = [
    { cmd: "ls /projects", desc: "View all projects", link: "/projects" },
    { cmd: "cat about.txt", desc: "Learn more", link: "/about" },
    { cmd: "mail", desc: "Get in touch", link: "/contact" },
  ];

  return (
    <div className="py-8 border-t border-terminal-border">
      <div className="text-terminal-cyan mb-6 text-sm">$ help</div>
      <div className="space-y-3">
        {commands.map((item) => (
          <Link
            key={item.cmd}
            to={item.link}
            className="flex items-start gap-6 text-sm hover:text-terminal-cyan transition-colors group"
          >
            <code className="text-terminal-text group-hover:text-terminal-cyan min-w-[140px]">
              {item.cmd}
            </code>
            <span className="text-terminal-gray group-hover:text-terminal-text">{item.desc}</span>
          </Link>
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
    <div className="py-8 border-t border-terminal-border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.href}
            className="group"
          >
            <div className="text-terminal-cyan text-xs mb-2 group-hover:text-terminal-text-bright transition-colors">
              [{stat.label.toLowerCase()}]
            </div>
            <div className="text-4xl text-terminal-text group-hover:text-terminal-cyan transition-colors font-medium">
              {stat.value}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
