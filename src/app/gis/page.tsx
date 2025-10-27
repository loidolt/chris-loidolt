import { Metadata } from 'next';
import { getPublicLocations, type LocationPublic } from '@/lib/pocketbase';
import { mockLocations } from '@/lib/mockLocations';
import GISMapClient from '@/components/GISMapClient';

export const metadata: Metadata = {
  title: 'GIS Map - Chris Loidolt',
  description: 'Interactive topographic map showing points of interest and locations.',
};

// Use mock data in development when NEXT_PUBLIC_USE_MOCK_LOCATIONS is set
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_LOCATIONS === 'true';

export default async function GISPage() {
  let locations: LocationPublic[] = [];

  if (USE_MOCK_DATA) {
    // Use mock data for testing/development
    console.log('[GIS Page] Using mock location data');
    locations = mockLocations;
  } else {
    // Fetch real locations from PocketBase (passwords excluded for security)
    try {
      locations = await getPublicLocations();
    } catch (error) {
      console.error('Error loading locations:', error);
      // Fall back to mock data if PocketBase fails in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[GIS Page] Falling back to mock data due to PocketBase error');
        locations = mockLocations;
      }
    }
  }

  return <GISMapClient locations={locations} />;
}
