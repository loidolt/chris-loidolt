import Airtable from "airtable";

// TypeScript interfaces for Airtable records
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  tags?: string[];
  category?: string;
  date?: string;
  featuredImage?: string;
  images?: string[];
  modelFile?: string; // Path to 3D model file (.glb)
  github?: string;
  website?: string;
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

  return {
    id: record.id,
    title: fields.Title || fields.Name || "Untitled",
    slug: fields.Slug || fields.slug || fields.Title?.toLowerCase().replace(/\s+/g, "-") || record.id,
    description: fields.Description || fields.Excerpt || "",
    longDescription: fields.LongDescription || fields.Content || fields.Body,
    tags: fields.Tags || fields.tags || [],
    category: fields.Category || fields.category,
    date: fields.Date || fields.date || fields.createdTime,
    featuredImage: fields.FeaturedImage?.[0]?.url || fields.Image?.[0]?.url,
    images: fields.Images?.map((img: any) => img.url) || [],
    modelFile: fields.ModelFile || fields.Model3D || fields.GLBFile,
    github: fields.GitHub || fields.github,
    website: fields.Website || fields.website || fields.URL,
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
    })
    .all();

  return records.map(recordToProject);
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
    title: record.fields.Title || "",
    institution: record.fields.Institution || "",
    year: record.fields.Year || "",
    description: record.fields.Description,
  }));
}

// Fetch services
export async function getServices(): Promise<Service[]> {
  const base = getAirtableBase();
  const tableName = getEnvVar("AIRTABLE_SERVICES_TABLENAME");

  const records = await base(tableName).select().all();

  return records.map((record) => ({
    id: record.id,
    title: record.fields.Title || record.fields.Name || "",
    description: record.fields.Description || "",
    icon: record.fields.Icon,
  }));
}

// Fetch websites
export async function getWebsites(): Promise<Website[]> {
  const base = getAirtableBase();
  const tableName = getEnvVar("AIRTABLE_WEBSITES_TABLENAME");

  const records = await base(tableName).select().all();

  return records.map((record) => ({
    id: record.id,
    name: record.fields.Name || record.fields.Title || "",
    url: record.fields.URL || record.fields.Link || "",
    description: record.fields.Description,
  }));
}
