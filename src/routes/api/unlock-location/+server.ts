import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PocketBase from 'pocketbase';

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { locationId, password } = await request.json();

    if (!locationId || !password) {
      return json({ success: false, error: 'Missing locationId or password' }, { status: 400 });
    }

    // Initialize PocketBase
    const pb = new PocketBase(getEnvVar('POCKETBASE_URL'));
    pb.autoCancellation(false);

    // Fetch the location from PocketBase (including password field)
    const location = await pb.collection('locations').getOne(locationId);

    if (!location) {
      return json({ success: false, error: 'Location not found' }, { status: 404 });
    }

    // Check if location is private
    if (location.privacy !== 'Private') {
      return json({ success: true }); // Not private, no need to check password
    }

    // Verify password
    if (location.password === password) {
      return json({ success: true });
    } else {
      return json({ success: false, error: 'Incorrect password' }, { status: 401 });
    }
  } catch (error) {
    console.error('[unlock-location] Error:', error);
    return json({ success: false, error: 'Server error' }, { status: 500 });
  }
};
