import PocketBase from "pocketbase";

// TypeScript interfaces for PocketBase records

export interface HomepageConfig {
  layout?: 'grid' | 'timeline' | 'minimal';
  showProjects?: boolean;
  showStats?: boolean;
  welcomeMessage?: string;
}

export interface Person {
  id: string;
  name: string;
  slug: string;
  email?: string;
  bio?: string;
  avatar?: string;
  user?: string; // Relation to users collection
  enabledRoutes?: string[]; // Array of enabled route slugs: ['projects', 'gis', 'about', 'contact']
  homepageConfig?: HomepageConfig; // Homepage layout and display configuration
}

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
  person?: string[]; // Relation to persons collection (multi-select)
  scope?: 'Family' | 'Personal';
  visibility?: 'Public' | 'Family' | 'Private';
}

export interface Qualification {
  id: string;
  title: string;
  institution: string;
  year: string;
  description?: string;
  person: string; // Relation to persons collection (required)
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  person?: string[]; // Relation to persons collection (multi-select)
  scope?: 'Family' | 'Personal';
  visibility?: 'Public' | 'Family' | 'Private';
}

export interface Skill {
  id: string;
  name: string;
  summary?: string;
  type?: 'Skills' | 'Programming';
  category?: string;
  categories?: string[];
  level?: 'Expert' | 'Advanced' | 'Intermediate' | 'Elementary';
  moreInfo?: string;
  order?: number;
  person?: string[]; // Relation to persons collection (multi-select)
  scope?: 'Family' | 'Personal';
  visibility?: 'Public' | 'Family' | 'Private';
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
  person?: string[]; // Relation to persons collection (multi-select)
  scope?: 'Family' | 'Personal';
  visibility?: 'Public' | 'Family' | 'Private';
}

// Client-safe location type (excludes password)
export type LocationPublic = Omit<Location, 'password'>;

// Import centralized environment configuration
import { ENV, debugLog } from './env';

// Initialize PocketBase client
let pbInstance: PocketBase | null = null;

/**
 * Get PocketBase instance with optional authentication
 *
 * @param authToken - Optional user auth token for authenticated requests
 * @returns PocketBase instance
 *
 * IMPORTANT: When authToken is provided, PocketBase access rules are enforced
 * automatically based on the user's authentication state. This means:
 * - Public content: Visible to all
 * - Family content: Visible only to authenticated family members
 * - Private content: Visible only to the content owner
 */
function getPocketBase(authToken?: string): PocketBase {
  if (!pbInstance) {
    pbInstance = new PocketBase(ENV.POCKETBASE_URL);

    // Disable auto cancellation for server-side requests
    pbInstance.autoCancellation(false);
  }

  // Set auth token if provided (this automatically enforces visibility rules!)
  if (authToken) {
    pbInstance.authStore.save(authToken, null);
  } else {
    // Clear auth for public requests
    pbInstance.authStore.clear();
  }

  return pbInstance;
}

// ============================================================================
// CACHING AND REQUEST DEDUPLICATION
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-memory cache with TTL (Time To Live)
const cache = new Map<string, CacheEntry<any>>();
// Use centralized cache TTL configuration
const CACHE_TTL = ENV.CACHE_TTL_MS;

// Track pending requests to prevent duplicate calls
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Get data from cache if valid, otherwise return null
 */
function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Store data in cache with current timestamp
 */
function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Deduplicate concurrent requests for the same data
 */
async function withRequestDeduplication<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Check if there's already a pending request for this key
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)! as Promise<T>;
  }

  // Create new request
  const promise = fetcher().finally(() => {
    // Clean up after request completes
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * Wrapper function that combines caching and request deduplication
 */
async function cachedFetch<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: { skipCache?: boolean } = {}
): Promise<T> {
  // Check cache first (unless explicitly skipped)
  if (!options.skipCache) {
    const cached = getFromCache<T>(cacheKey);
    if (cached !== null) {
      debugLog(`[Cache HIT] ${cacheKey}`);
      return cached;
    }
  }

  debugLog(`[Cache MISS] ${cacheKey}`);

  // Use request deduplication for the fetch
  const data = await withRequestDeduplication(cacheKey, fetcher);

  // Store in cache
  setCache(cacheKey, data);

  return data;
}

/**
 * Clear all cache entries (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cache.clear();
  debugLog('[Cache] Cleared all entries');
}

/**
 * Clear cache for a specific key or pattern
 */
export function clearCacheKey(keyOrPattern: string): void {
  if (keyOrPattern.includes('*')) {
    // Pattern matching: clear all keys that match
    const pattern = keyOrPattern.replace('*', '');
    const keysToDelete: string[] = [];
    cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => cache.delete(key));
    debugLog(`[Cache] Cleared ${keysToDelete.length} entries matching "${keyOrPattern}"`);
  } else {
    // Exact key match
    cache.delete(keyOrPattern);
    debugLog(`[Cache] Cleared "${keyOrPattern}"`);
  }
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

// Fetch all projects (with caching and auth-aware visibility)
export async function getAllProjects(options: { skipCache?: boolean; authToken?: string } = {}): Promise<Project[]> {
  // Include auth state in cache key to prevent leaking private data
  const cacheKey = options.authToken ? `projects:all:authed` : 'projects:all:public';

  return cachedFetch(cacheKey, async () => {
    try {
      const pb = getPocketBase(options.authToken);

      debugLog('Fetching projects from PocketBase...');

      const records = await pb.collection('projects').getFullList({
        sort: '-date',
        // PocketBase access rules automatically filter based on visibility!
        // No manual filtering needed - it's handled at the database level
      });

      debugLog(`Found ${records.length} projects in PocketBase`);

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
  }, options);
}

// Fetch a single project by slug (with caching and auth-aware visibility)
export async function getProjectBySlug(slug: string, options: { skipCache?: boolean; authToken?: string } = {}): Promise<Project | null> {
  const cacheKey = options.authToken ? `project:${slug}:authed` : `project:${slug}:public`;

  return cachedFetch(cacheKey, async () => {
    try {
      const pb = getPocketBase(options.authToken);

      const record = await pb.collection('projects').getFirstListItem(`slug="${slug}"`);

      return recordToProject(record, pb);
    } catch (error) {
      console.error(`Error fetching project with slug "${slug}":`, error);
      return null;
    }
  }, options);
}

// Fetch related projects based on shared tags/categories (optimized)
export async function getRelatedProjects(projectId: string, limit: number = 3): Promise<Project[]> {
  const cacheKey = `projects:related:${projectId}:${limit}`;

  return cachedFetch(cacheKey, async () => {
    try {
      const pb = getPocketBase();

      // First get the current project
      const currentProject = await pb.collection('projects').getOne(projectId);

      if (!currentProject) return [];

      // Build filter for related projects based on shared categories or tags
      const categories = currentProject.categories || [];
      const tags = currentProject.tags || [];

      const filters: string[] = [`id != "${projectId}"`]; // Exclude current project

      if (categories.length > 0 || tags.length > 0) {
        const categoryFilters = categories.map((cat: string) => `categories ~ "${cat}"`);
        const tagFilters = tags.map((tag: string) => `tags ~ "${tag}"`);
        const combinedFilters = [...categoryFilters, ...tagFilters];

        if (combinedFilters.length > 0) {
          filters.push(`(${combinedFilters.join(' || ')})`);
        }
      }

      const filterString = filters.join(' && ');

      const records = await pb.collection('projects').getList(1, limit, {
        filter: filterString,
        sort: '-date',
      });

      return records.items.map((record: any) => recordToProject(record, pb));
    } catch (error) {
      console.error(`Error fetching related projects for "${projectId}":`, error);
      return [];
    }
  });
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
      person: String(record.person || ""),
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

// Fetch all persons
export async function getAllPersons(): Promise<Person[]> {
  try {
    const pb = getPocketBase();

    const records = await pb.collection('persons').getFullList({
      sort: 'name',
    });

    return records.map((record) => {
      const avatar = record.avatar
        ? pb.files.getUrl(record, record.avatar)
        : undefined;

      // Parse JSON fields
      const enabledRoutes = record.enabledRoutes || ['projects', 'about', 'contact'];
      const homepageConfig = record.homepageConfig || {
        layout: 'grid',
        showProjects: true,
        showStats: true
      };

      return {
        id: record.id,
        name: String(record.name || ""),
        slug: String(record.slug || ""),
        email: record.email ? String(record.email) : undefined,
        bio: record.bio ? String(record.bio) : undefined,
        avatar,
        user: record.user ? String(record.user) : undefined,
        enabledRoutes: Array.isArray(enabledRoutes) ? enabledRoutes : ['projects', 'about', 'contact'],
        homepageConfig: typeof homepageConfig === 'object' ? homepageConfig : {
          layout: 'grid',
          showProjects: true,
          showStats: true
        },
      };
    });
  } catch (error) {
    console.error('Error fetching persons:', error);
    return [];
  }
}

// Fetch a single person by slug
export async function getPersonBySlug(slug: string, options: { authToken?: string } = {}): Promise<Person | null> {
  try {
    const pb = getPocketBase(options.authToken);

    const record = await pb.collection('persons').getFirstListItem(`slug="${slug}"`);

    const avatar = record.avatar
      ? pb.files.getUrl(record, record.avatar)
      : undefined;

    // Parse JSON fields with defaults
    const enabledRoutes = record.enabledRoutes || ['projects', 'about', 'contact'];
    const homepageConfig = record.homepageConfig || {
      layout: 'grid',
      showProjects: true,
      showStats: true
    };

    return {
      id: record.id,
      name: String(record.name || ""),
      slug: String(record.slug || ""),
      email: record.email ? String(record.email) : undefined,
      bio: record.bio ? String(record.bio) : undefined,
      avatar,
      user: record.user ? String(record.user) : undefined,
      enabledRoutes: Array.isArray(enabledRoutes) ? enabledRoutes : ['projects', 'about', 'contact'],
      homepageConfig: typeof homepageConfig === 'object' ? homepageConfig : {
        layout: 'grid',
        showProjects: true,
        showStats: true
      },
    };
  } catch (error) {
    console.error(`Error fetching person with slug "${slug}":`, error);
    return null;
  }
}

// Fetch projects for a specific person (with caching and auth-aware visibility)
export async function getProjectsByPerson(personSlug: string, options: { skipCache?: boolean; authToken?: string } = {}): Promise<Project[]> {
  const cacheKey = options.authToken
    ? `projects:person:${personSlug}:authed`
    : `projects:person:${personSlug}:public`;

  return cachedFetch(cacheKey, async () => {
    try {
      const pb = getPocketBase(options.authToken);

      // First get the person by slug
      const person = await getPersonBySlug(personSlug, options);
      if (!person) {
        console.error(`Person with slug "${personSlug}" not found`);
        return [];
      }

      const records = await pb.collection('projects').getFullList({
        filter: `person.id ?= "${person.id}"`,
        sort: '-date',
        // PocketBase will automatically filter based on visibility rules
      });

      return records.map((record) => recordToProject(record, pb));
    } catch (error) {
      console.error(`Error fetching projects for person "${personSlug}":`, error);
      return [];
    }
  }, options);
}

// Fetch skills for a specific person
export async function getSkillsByPerson(personSlug: string): Promise<Skill[]> {
  try {
    const pb = getPocketBase();

    // First get the person by slug
    const person = await getPersonBySlug(personSlug);
    if (!person) {
      console.error(`Person with slug "${personSlug}" not found`);
      return [];
    }

    const records = await pb.collection('skills').getFullList({
      filter: `person.id ?= "${person.id}"`,
      sort: 'order',
    });

    return records.map((record) => ({
      id: record.id,
      name: String(record.name || ""),
      summary: record.summary ? String(record.summary) : undefined,
      type: record.type as 'Skills' | 'Programming',
      category: record.category ? String(record.category) : undefined,
      categories: record.categories || [],
      level: record.level as 'Expert' | 'Advanced' | 'Intermediate' | 'Elementary',
      moreInfo: record.moreInfo ? String(record.moreInfo) : undefined,
      order: record.order ? Number(record.order) : undefined,
      person: record.person || [],
      scope: record.scope as 'Family' | 'Personal',
      visibility: record.visibility as 'Public' | 'Family' | 'Private',
    }));
  } catch (error) {
    console.error(`Error fetching skills for person "${personSlug}":`, error);
    return [];
  }
}

// Fetch qualifications for a specific person
export async function getQualificationsByPerson(personSlug: string): Promise<Qualification[]> {
  try {
    const pb = getPocketBase();

    // First get the person by slug
    const person = await getPersonBySlug(personSlug);
    if (!person) {
      console.error(`Person with slug "${personSlug}" not found`);
      return [];
    }

    const records = await pb.collection('qualifications').getFullList({
      filter: `person = "${person.id}"`,
      sort: '-year',
    });

    return records.map((record) => ({
      id: record.id,
      title: String(record.title || ""),
      institution: String(record.institution || ""),
      year: String(record.year || ""),
      description: record.description ? String(record.description) : undefined,
      person: String(record.person || ""),
    }));
  } catch (error) {
    console.error(`Error fetching qualifications for person "${personSlug}":`, error);
    return [];
  }
}

// Fetch services for a specific person
export async function getServicesByPerson(personSlug: string): Promise<Service[]> {
  try {
    const pb = getPocketBase();

    // First get the person by slug
    const person = await getPersonBySlug(personSlug);
    if (!person) {
      console.error(`Person with slug "${personSlug}" not found`);
      return [];
    }

    const records = await pb.collection('services').getFullList({
      filter: `person.id ?= "${person.id}"`,
      sort: 'title',
    });

    return records.map((record) => ({
      id: record.id,
      title: String(record.title || ""),
      description: String(record.description || ""),
      icon: record.icon ? String(record.icon) : undefined,
      person: record.person || [],
      scope: record.scope as 'Family' | 'Personal',
      visibility: record.visibility as 'Public' | 'Family' | 'Private',
    }));
  } catch (error) {
    console.error(`Error fetching services for person "${personSlug}":`, error);
    return [];
  }
}

// Export PocketBase instance for direct use in API routes
export { getPocketBase };
