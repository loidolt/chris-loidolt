import Airtable from "airtable";
import { downloadProjectImages } from "./downloadImages";

// TypeScript interfaces for Airtable records
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  markdown?: string; // Rich markdown content from Airtable
  tags?: string[];
  categories?: string[]; // Multiple categories from Airtable
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

// Environment variable validation
function getEnvVar(key: string): string {
  // Use process.env for server-side code (dotenv loads .env file in astro.config.mjs)
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

// Initialize Airtable
function getAirtableBase() {
  const apiKey = getEnvVar("AIRTABLE_API_KEY");
  const baseId = getEnvVar("AIRTABLE_POSTS_BASEID");

  Airtable.configure({ apiKey });
  return Airtable.base(baseId);
}

// Helper function to transform Airtable record to Project
function recordToProject(record: any): Project {
  const fields = record.fields;

  // Handle categories - use Categories field (plural) from Airtable
  const categories = fields.Categories || fields.Category || [];
  const categoryArray = Array.isArray(categories) ? categories : [categories].filter(Boolean);

  // Handle repository URL - map Repository field to both repository and github for compatibility
  const repositoryUrl = fields.Repository || fields.GitHub || fields.github;

  return {
    id: record.id,
    title: fields.Title || fields.Name || "Untitled",
    slug: fields.Slug || fields.slug || fields.Title?.toLowerCase().replace(/\s+/g, "-") || record.id,
    description: fields.Description || fields.Excerpt || "",
    longDescription: fields.LongDescription || fields.Content || fields.Body,
    markdown: fields.Markdown || fields.markdown,
    tags: fields.Tags || fields.tags || [],
    categories: categoryArray,
    category: categoryArray[0] || fields.Category || fields.category, // First category for backward compatibility
    date: fields.Date || fields.date || fields.createdTime,
    featuredImage: fields['Cover Image']?.[0]?.url || fields.FeaturedImage?.[0]?.url || fields.Image?.[0]?.url,
    images: fields.Gallery?.map((img: any) => img.url) || fields.Images?.map((img: any) => img.url) || [],
    modelFile: fields.ModelFile || fields.Model3D || fields.GLBFile,
    modelPath: fields.ModelPath,
    modelUrl: fields['Model URL'],
    repository: repositoryUrl,
    github: repositoryUrl, // Keep for backward compatibility
    website: fields.Website || fields.website || fields.URL,
    attribution: fields.Attribution,
    status: fields.Status,
    cleanRepo: fields['Clean Repo'] || false,
    lastModified: fields['Last Modified'],
    featured: fields.Featured || fields.featured || false,
  };
}

// Fetch all projects
export async function getAllProjects(): Promise<Project[]> {
  const base = getAirtableBase();
  const tableName = getEnvVar("AIRTABLE_POSTS_TABLENAME");

  const records = await base(tableName)
    .select({
      sort: [{ field: "Date", direction: "desc" }],
      // Filter to only show Published projects
      filterByFormula: "{Status} = 'Published'",
    })
    .all();

  const projects = records.map(recordToProject);

  // Download and cache images locally during build
  console.log('\n📸 Processing project images...');
  let totalDownloaded = 0;
  let totalCached = 0;

  for (const project of projects) {
    if (project.featuredImage || (project.images && project.images.length > 0)) {
      console.log(`\nProcessing: ${project.title}`);

      const { featuredImage, images, stats } = await downloadProjectImages(
        project.slug,
        project.featuredImage,
        project.images || []
      );

      totalDownloaded += stats.downloaded;
      totalCached += stats.cached;

      // Update project with local image paths
      project.featuredImage = featuredImage;
      project.images = images;
    }
  }

  console.log('\n✓ Image processing complete!');
  console.log(`  - Downloaded: ${totalDownloaded} images`);
  console.log(`  - Cached: ${totalCached} images`);
  console.log(`  - Total: ${totalDownloaded + totalCached} images\n`);

  return projects;
}

// Fetch a single project by slug
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getAllProjects();
  return projects.find((p) => p.slug === slug) || null;
}

// Fetch featured projects
export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await getAllProjects();
  return projects.filter((p) => p.featured);
}

// Fetch qualifications
export async function getQualifications(): Promise<Qualification[]> {
  const base = getAirtableBase();
  const tableName = getEnvVar("AIRTABLE_QUALIFICATIONS_TABLENAME");

  const records = await base(tableName)
    .select({
      sort: [{ field: "Year", direction: "desc" }],
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    title: String(record.fields.Title || ""),
    institution: String(record.fields.Institution || ""),
    year: String(record.fields.Year || ""),
    description: record.fields.Description ? String(record.fields.Description) : undefined,
  }));
}

// Fetch services
export async function getServices(): Promise<Service[]> {
  const base = getAirtableBase();
  const tableName = getEnvVar("AIRTABLE_SERVICES_TABLENAME");

  const records = await base(tableName).select().all();

  return records.map((record) => ({
    id: record.id,
    title: String(record.fields.Title || record.fields.Name || ""),
    description: String(record.fields.Description || ""),
    icon: record.fields.Icon ? String(record.fields.Icon) : undefined,
  }));
}

// Fetch websites
export async function getWebsites(): Promise<Website[]> {
  const base = getAirtableBase();
  const tableName = getEnvVar("AIRTABLE_WEBSITES_TABLENAME");

  const records = await base(tableName).select().all();

  return records.map((record) => ({
    id: record.id,
    name: String(record.fields.Name || record.fields.Title || ""),
    url: String(record.fields.URL || record.fields.Link || ""),
    description: record.fields.Description ? String(record.fields.Description) : undefined,
  }));
}
