import { Metadata } from 'next';
import { getAllLocations } from '@/lib/airtable';
import GISMapClient from '@/components/GISMapClient';

export const metadata: Metadata = {
  title: 'GIS Map - Chris Loidolt',
  description: 'Interactive topographic map showing points of interest and locations.',
};

export default async function GISPage() {
  // Fetch locations at build/request time
  let locations: any[] = [];
  try {
    locations = await getAllLocations();
  } catch (error) {
    console.error('Error loading locations:', error);
  }

  return <GISMapClient locations={locations} />;
}
