import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [];

export function meta() {
  return [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { title: "Chris Loidolt - Design & Engineering Portfolio" },
    { name: "description", content: "Portfolio of Chris Loidolt showcasing design and engineering projects in 3D printing, woodworking, and software development." },
    { name: "theme-color", content: "#0d1117" },

    // Open Graph
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Chris Loidolt - Design & Engineering Portfolio" },
    { property: "og:description", content: "Portfolio showcasing design and engineering projects in 3D printing, woodworking, and software development." },
    { property: "og:site_name", content: "Chris Loidolt Portfolio" },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "Chris Loidolt - Design & Engineering Portfolio" },
    { name: "twitter:description", content: "Portfolio showcasing design and engineering projects in 3D printing, woodworking, and software development." },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-terminal-darker text-terminal-text">
      <div className="max-w-2xl w-full">
        <div className="text-terminal-red mb-2 text-sm">
          {message}
        </div>
        <p className="text-terminal-gray mb-8 text-sm">$ {details}</p>
        {stack && (
          <pre className="text-xs text-terminal-gray bg-terminal-black p-4 overflow-x-auto mb-8 border-l border-terminal-border">
            <code>{stack}</code>
          </pre>
        )}
        <a href="/" className="text-terminal-cyan hover:text-terminal-text-bright transition-colors text-sm">
          [← back to home]
        </a>
      </div>
    </main>
  );
}
