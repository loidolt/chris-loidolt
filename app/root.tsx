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
    <main className="min-h-screen p-8 bg-terminal-darker text-terminal-text">
      <div className="border border-terminal-border p-6 max-w-4xl">
        <div className="text-terminal-red mb-4">
          <span className="text-terminal-text-bright">ERROR</span> [{message}]
        </div>
        <p className="text-terminal-amber mb-4">$ {details}</p>
        {stack && (
          <pre className="text-xs text-terminal-text bg-terminal-black border border-terminal-gray p-4 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}
        <div className="mt-6 text-terminal-cyan">
          <a href="/" className="hover:text-terminal-text-bright">
            [← back to home]
          </a>
        </div>
      </div>
    </main>
  );
}
