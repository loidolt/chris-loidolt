import PocketBase from "pocketbase";

// TypeScript interfaces for PocketBase records
// These remain the same as before for backward compatibility
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  markdown?: string; // Rich markdown content
  tags?: string[];
  categories?: string[]; // Multiple categories
  category?: string; // Legacy single category for backward compatibility
  date?: string;
  featuredImage?: string;
  images?: string[];
  modelFile?: string; // Path to local 3D model file (.glb)
  modelPath?: string; // Path from ModelPath field
  modelUrl?: string; // Source URL for 3D model
  repository?: string; // GitHub repository URL
  github?: string; // Legacy field for backward compatibility
  website?: string;
  attribution?: string; // Attribution/credit URL
  status?: string; // Draft, Published, Unpublished
  cleanRepo?: boolean; // Clean Repo checkbox
  lastModified?: string; // Last modified timestamp
  featured?: boolean;
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

export interface Website {
  id: string;
  name: string;
  url: string;
  description?: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  category?: string;
  categories?: string[];
  image?: string;
  url?: string;
  status?: string;
  privacy?: 'Public' | 'Private';
  password?: string; // Server-side only
  shareToken?: string; // Token for sharing private locations without password
}

// Client-safe location type (excludes password)
export type LocationPublic = Omit<Location, 'password'>;

// Environment variable validation
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

// Initialize PocketBase client
let pbInstance: PocketBase | null = null;

function getPocketBase(): PocketBase {
  if (!pbInstance) {
    const url = getEnvVar("POCKETBASE_URL");
    pbInstance = new PocketBase(url);

    // Disable auto cancellation for server-side requests
    pbInstance.autoCancellation(false);
  }
  return pbInstance;
}

// Helper function to transform PocketBase record to Project
function recordToProject(record: any, pb: PocketBase): Project {
  // Handle categories - parse JSON array if needed
  const categories = record.categories || [];
  const categoryArray = Array.isArray(categories) ? categories : [];

  // Handle repository URL - map to both repository and github for compatibility
  const repositoryUrl = record.repository || record.github;

  // Get file URLs for images using PocketBase helper
  const featuredImage = record.featuredImage
    ? pb.files.getUrl(record, record.featuredImage)
    : undefined;

  // Handle gallery images (multiple files)
  const images = record.gallery && Array.isArray(record.gallery)
    ? record.gallery.map((filename: string) => pb.files.getUrl(record, filename))
    : [];

  return {
    id: record.id,
    title: record.title || "Untitled",
    slug: record.slug || record.title?.toLowerCase().replace(/\s+/g, "-") || record.id,
    description: record.description || "",
    longDescription: record.longDescription,
    markdown: record.markdown,
    tags: record.tags || [],
    categories: categoryArray,
    category: categoryArray[0] || record.category, // First category for backward compatibility
    date: record.date || record.created,
    featuredImage,
    images,
    modelFile: record.modelFile,
    modelPath: record.modelPath,
    modelUrl: record.modelUrl,
    repository: repositoryUrl,
    github: repositoryUrl, // Keep for backward compatibility
    website: record.website,
    attribution: record.attribution,
    status: record.status,
    cleanRepo: record.cleanRepo || false,
    lastModified: record.updated,
    featured: record.featured || false,
  };
}

// Fetch all projects
export async function getAllProjects(): Promise<Project[]> {
  try {
    const pb = getPocketBase();

    console.log('Fetching projects from PocketBase...');

    const records = await pb.collection('projects').getFullList({
      sort: '-date',
      // Uncomment to filter only published projects:
      // filter: 'status = "Published"',
    });

    console.log(`Found ${records.length} projects in PocketBase`);

    const projects = records.map((record) => recordToProject(record, pb));

    return projects;
  } catch (error) {
    console.error('Error fetching projects from PocketBase:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    // Return empty array instead of throwing to prevent page crash
    return [];
  }
}

// Fetch a single project by slug
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const pb = getPocketBase();

    const record = await pb.collection('projects').getFirstListItem(`slug="${slug}"`);

    return recordToProject(record, pb);
  } catch (error) {
    console.error(`Error fetching project with slug "${slug}":`, error);
    return null;
  }
}

// Fetch featured projects
export async function getFeaturedProjects(): Promise<Project[]> {
  try {
    const pb = getPocketBase();

    const records = await pb.collection('projects').getFullList({
      filter: 'featured = true',
      sort: '-date',
    });

    return records.map((record) => recordToProject(record, pb));
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return [];
  }
}

// Fetch qualifications
export async function getQualifications(): Promise<Qualification[]> {
  try {
    const pb = getPocketBase();

    const records = await pb.collection('qualifications').getFullList({
      sort: '-year',
    });

    return records.map((record) => ({
      id: record.id,
      title: String(record.title || ""),
      institution: String(record.institution || ""),
      year: String(record.year || ""),
      description: record.description ? String(record.description) : undefined,
    }));
  } catch (error) {
    console.error('Error fetching qualifications:', error);
    return [];
  }
}

// Fetch services
export async function getServices(): Promise<Service[]> {
  try {
    const pb = getPocketBase();

    const records = await pb.collection('services').getFullList();

    return records.map((record) => ({
      id: record.id,
      title: String(record.title || ""),
      description: String(record.description || ""),
      icon: record.icon ? String(record.icon) : undefined,
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

// Fetch websites
export async function getWebsites(): Promise<Website[]> {
  try {
    const pb = getPocketBase();

    const records = await pb.collection('websites').getFullList();

    return records.map((record) => ({
      id: record.id,
      name: String(record.name || ""),
      url: String(record.url || ""),
      description: record.description ? String(record.description) : undefined,
    }));
  } catch (error) {
    console.error('Error fetching websites:', error);
    return [];
  }
}

// Fetch locations/POIs (includes passwords - server-side only)
export async function getAllLocations(): Promise<Location[]> {
  try {
    const pb = getPocketBase();

    const records = await pb.collection('locations').getFullList({
      // Filter to only show Published locations
      filter: 'status = "Published"',
    });

    return records.map((record) => {
      // Handle categories - support both single and multiple
      const categories = record.categories || [];
      const categoryArray = Array.isArray(categories) ? categories : [];

      // Get image URL if exists
      const image = record.image
        ? pb.files.getUrl(record, record.image)
        : undefined;

      return {
        id: record.id,
        name: String(record.name || "Untitled Location"),
        description: record.description ? String(record.description) : undefined,
        latitude: Number(record.latitude || 0),
        longitude: Number(record.longitude || 0),
        category: categoryArray[0] || record.category,
        categories: categoryArray,
        image,
        url: record.url ? String(record.url) : undefined,
        status: record.status ? String(record.status) : undefined,
        privacy: (record.privacy === 'Private' ? 'Private' : 'Public') as 'Public' | 'Private',
        password: record.password ? String(record.password) : undefined,
        shareToken: record.shareToken ? String(record.shareToken) : undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
}

// Fetch locations for client-side use (passwords excluded for security)
export async function getPublicLocations(): Promise<LocationPublic[]> {
  const locations = await getAllLocations();

  // Strip passwords from locations before sending to client
  return locations.map(({ password, ...location }) => location);
}

// Export PocketBase instance for direct use in API routes
export { getPocketBase };
