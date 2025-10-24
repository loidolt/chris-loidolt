import Airtable from 'airtable';

// Initialize Airtable with API key
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_POSTS_BASEID || ''
);

// Type definitions
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  markdown?: string;
  categories?: string[];
  tags?: string[];
  date?: string;
  featuredImage?: string;
  images?: string[];
  modelPath?: string;
  modelFile?: string;
  repository?: string;
  website?: string;
  attribution?: string;
  status?: string;
}

export interface Qualification {
  id: string;
  title: string;
  institution: string;
  year: string;
  description?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  password?: string;
  category?: string;
  images?: string[];
}

/**
 * Get all projects from Airtable
 */
export async function getAllProjects(): Promise<Project[]> {
  try {
    const tableName = process.env.AIRTABLE_POSTS_TABLENAME || 'Projects';
    const records = await base(tableName)
      .select({
        view: 'Grid view',
        filterByFormula: '{Status} = "Published"',
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      title: record.get('Title') as string,
      slug: record.get('Slug') as string,
      description: record.get('Description') as string,
      longDescription: record.get('Long Description') as string | undefined,
      markdown: record.get('Markdown') as string | undefined,
      categories: record.get('Categories') as string[] | undefined,
      tags: record.get('Tags') as string[] | undefined,
      date: record.get('Date') as string | undefined,
      featuredImage: record.get('Featured Image') as string | undefined,
      images: record.get('Images') as string[] | undefined,
      modelPath: record.get('Model Path') as string | undefined,
      modelFile: record.get('Model File') as string | undefined,
      repository:
        (record.get('Repository') as string) ||
        (record.get('GitHub') as string) ||
        (record.get('github') as string) ||
        undefined,
      website: record.get('Website') as string | undefined,
      attribution: record.get('Attribution') as string | undefined,
      status: record.get('Status') as string | undefined,
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

/**
 * Get all qualifications from Airtable
 */
export async function getQualifications(): Promise<Qualification[]> {
  try {
    const tableName = process.env.AIRTABLE_QUALIFICATIONS_TABLENAME || 'Qualifications';
    const records = await base(tableName)
      .select({
        view: 'Grid view',
        sort: [{ field: 'Year', direction: 'desc' }],
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      title: record.get('Title') as string,
      institution: record.get('Institution') as string,
      year: record.get('Year') as string,
      description: record.get('Description') as string | undefined,
    }));
  } catch (error) {
    console.error('Error fetching qualifications:', error);
    return [];
  }
}

/**
 * Get all services from Airtable
 */
export async function getServices(): Promise<Service[]> {
  try {
    const tableName = process.env.AIRTABLE_SERVICES_TABLENAME || 'Services';
    const records = await base(tableName)
      .select({
        view: 'Grid view',
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      title: record.get('Title') as string,
      description: record.get('Description') as string,
      icon: record.get('Icon') as string | undefined,
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

/**
 * Get all locations from Airtable for GIS map
 */
export async function getAllLocations(): Promise<Location[]> {
  try {
    const tableName = process.env.AIRTABLE_LOCATIONS_TABLENAME || 'Locations';
    const records = await base(tableName)
      .select({
        view: 'Grid view',
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      name: record.get('Name') as string,
      description: record.get('Description') as string | undefined,
      latitude: record.get('Latitude') as number,
      longitude: record.get('Longitude') as number,
      password: record.get('Password') as string | undefined,
      category: record.get('Category') as string | undefined,
      images: record.get('Images') as string[] | undefined,
    }));
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}
