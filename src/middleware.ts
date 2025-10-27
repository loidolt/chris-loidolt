/**
 * Next.js Middleware
 *
 * Detects person slug from subdomain or route and sets a header
 * for use in layouts and pages. This enables per-person theming
 * and layout customization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isValidPersonSlug } from './themes';

export function middleware(request: NextRequest) {
  const { hostname, pathname } = new URL(request.url);

  // Extract subdomain from hostname
  // Example: chris.loidolt.space -> 'chris'
  const parts = hostname.split('.');
  let personSlug = 'chris'; // Default

  // Check if subdomain matches a person slug
  if (parts.length > 2) {
    const subdomain = parts[0];
    if (isValidPersonSlug(subdomain)) {
      personSlug = subdomain;
    }
  }

  // Alternative: Check for person-specific routes
  // Example: /julia/projects -> 'julia'
  const pathMatch = pathname.match(/^\/?(chris|julia|theo|jack|family)\//);
  if (pathMatch && isValidPersonSlug(pathMatch[1])) {
    personSlug = pathMatch[1];
  }

  // Special case: Check if root domain should be family hub
  if (parts.length === 2 && parts[0] === 'loidolt') {
    personSlug = 'family';
  }

  // For local development, allow query parameter override
  const queryPersonSlug = request.nextUrl.searchParams.get('person');
  if (queryPersonSlug && isValidPersonSlug(queryPersonSlug)) {
    personSlug = queryPersonSlug;
  }

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);

  // Set custom header with person slug
  requestHeaders.set('x-person-slug', personSlug);

  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which routes the middleware should run on
export const config = {
  // Match all routes except static files and api routes
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt (metadata files)
     * - /api/ routes (handled separately)
     * - Static assets in /public
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|api/|models/|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|glb|gltf)).*)',
  ],
};
