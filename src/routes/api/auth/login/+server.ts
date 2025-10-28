import { json } from '@sveltejs/kit';
import { setAuthCookie } from '$lib/auth';
import PocketBase from 'pocketbase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const pbUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
    const pb = new PocketBase(pbUrl);

    // Authenticate with PocketBase
    const authData = await pb.collection('users').authWithPassword(email, password);

    // Set secure HTTP-only cookie
    setAuthCookie(cookies, authData.token, authData.record);

    console.log(`[Auth] User logged in: ${authData.record.email}`);

    return json({
      success: true,
      user: {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Failed to authenticate')) {
      return json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
};
