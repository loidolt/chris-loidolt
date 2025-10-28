import { json } from '@sveltejs/kit';
import { clearAuthCookie } from '$lib/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
  clearAuthCookie(cookies);

  console.log('[Auth] User logged out');

  return json({ success: true });
};
