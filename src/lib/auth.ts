/**
 * Authentication utilities for SvelteKit + PocketBase
 *
 * Handles:
 * - Cookie-based session management
 * - Token validation
 * - User extraction from auth state
 */

import type { Cookies } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

const COOKIE_NAME = 'pb_auth';
const COOKIE_OPTIONS = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const, // Changed from 'lax' to 'strict' for better CSRF protection
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  token: string;
  personId?: string;
}

/**
 * Get authenticated user from cookies
 * Returns null if not authenticated or token is invalid
 */
export async function getAuthUser(cookies: Cookies, pbUrl: string): Promise<AuthUser | null> {
  try {
    const authCookie = cookies.get(COOKIE_NAME);

    if (!authCookie) {
      return null;
    }

    // Parse the auth cookie (PocketBase format)
    const authData = JSON.parse(authCookie);

    if (!authData?.token || !authData?.model) {
      return null;
    }

    // Validate token by creating PocketBase instance
    const pb = new PocketBase(pbUrl);
    pb.authStore.save(authData.token, authData.model);

    // Check if token is still valid
    if (!pb.authStore.isValid) {
      // Token expired, clear cookie
      cookies.delete(COOKIE_NAME, { path: '/' });
      return null;
    }

    // Try to refresh the auth state (validates token with server)
    try {
      await pb.collection('users').authRefresh();
    } catch (error) {
      // Token invalid, clear cookie
      console.error('Auth refresh failed:', error);
      cookies.delete(COOKIE_NAME, { path: '/' });
      return null;
    }

    const model = pb.authStore.model;

    // Ensure model exists (should always be present after successful auth)
    if (!model) {
      console.error('Auth model is null after successful refresh');
      cookies.delete(COOKIE_NAME, { path: '/' });
      return null;
    }

    // Find associated person record if it exists
    let personId: string | undefined;
    try {
      const persons = await pb.collection('persons').getFullList({
        filter: `user = "${model.id}"`,
      });
      if (persons.length > 0) {
        personId = persons[0].id;
      }
    } catch (error) {
      console.error('Failed to fetch person for user:', error);
    }

    return {
      id: model.id,
      email: model.email,
      name: model.name,
      avatar: model.avatar ? pb.files.getUrl(model as any, model.avatar) : undefined,
      token: authData.token,
      personId,
    };
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

/**
 * Set authentication cookie
 */
export function setAuthCookie(
  cookies: Cookies,
  token: string,
  model: any
): void {
  const authData = {
    token,
    model: {
      id: model.id,
      email: model.email,
      name: model.name,
      avatar: model.avatar,
    },
  };

  cookies.set(COOKIE_NAME, JSON.stringify(authData), COOKIE_OPTIONS);
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(cookies: Cookies): void {
  cookies.delete(COOKIE_NAME, { path: '/' });
}

/**
 * Check if user is authenticated (simpler version, doesn't validate)
 */
export function hasAuthCookie(cookies: Cookies): boolean {
  return !!cookies.get(COOKIE_NAME);
}
