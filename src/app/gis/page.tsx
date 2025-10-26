import { Metadata } from 'next';
import { getPublicLocations, type LocationPublic } from '@/lib/airtable';
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
    // Fetch real locations from Airtable (passwords excluded for security)
    try {
      locations = await getPublicLocations();
    } catch (error) {
      console.error('Error loading locations:', error);
      // Fall back to mock data if Airtable fails in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[GIS Page] Falling back to mock data due to Airtable error');
        locations = mockLocations;
      }
    }
  }

  return <GISMapClient locations={locations} />;
}
