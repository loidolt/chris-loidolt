# GitHub CMS Documentation

A comprehensive guide for building a portfolio site using GitHub repositories as a content management system.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Project Structure](#project-structure)
5. [Content Types](#content-types)
6. [Configuration](#configuration)
7. [Schema System](#schema-system)
8. [Plugin Architecture](#plugin-architecture)
9. [Data Fetching](#data-fetching)
10. [Static Generation](#static-generation)
11. [Extending the System](#extending-the-system)
12. [Migration Guide](#migration-guide)
13. [Best Practices](#best-practices)
14. [API Reference](#api-reference)

## Overview

This GitHub CMS system transforms GitHub repositories into a powerful content management system for portfolio sites. It eliminates external dependencies like Airtable while maintaining all features including 3D model viewing, search, and static site generation.

### Key Features

- **Git-based content management** - All content lives in version-controlled repositories
- **Static site generation** - Pre-rendered pages for optimal performance
- **Extensible architecture** - Plugin system for adding new features
- **Multiple content types** - Projects, blogs, tutorials, and more
- **Schema versioning** - Backward compatibility and migrations
- **Build-time optimization** - Image processing, search indexing, and caching

## Architecture

### System Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  GitHub Repos   │────▶│   Build System  │────▶│  Static Site    │
│  (Content)      │     │  (Next.js)      │     │  (HTML/JS/CSS)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         │                       │                        │
    ┌────▼────┐           ┌─────▼─────┐          ┌──────▼──────┐
    │ README  │           │ Transform │          │   Deploy    │
    │Metadata │           │  Plugins  │          │   (CDN)     │
    │ Assets  │           │   Cache   │          │             │
    └─────────┘           └───────────┘          └─────────────┘
```

### Directory Structure

```
portfolio-site/
├── app/                    # Next.js app directory
│   ├── layout.tsx
│   ├── page.tsx
│   └── projects/
│       └── [slug]/
│           └── page.tsx
├── lib/
│   ├── github/            # GitHub API integration
│   ├── content/           # Content processing
│   ├── plugins/           # Plugin system
│   └── schemas/           # Schema validation
├── config/
│   ├── projects.json      # Repository list
│   ├── content-types.json # Content type definitions
│   ├── site.json         # Site configuration
│   └── hooks.js          # Build hooks
├── schemas/
│   ├── project.schema.json
│   ├── blog.schema.json
│   └── custom/
├── plugins/
│   ├── analytics/
│   ├── search/
│   └── 3d-viewer/
└── content/              # Local content
    ├── pages/
    └── data/
```

## Getting Started

### Prerequisites

- Node.js 18+
- GitHub account
- Personal access token for GitHub API

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/portfolio-site
cd portfolio-site

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# GitHub API Access
GITHUB_TOKEN=your_personal_access_token
GITHUB_OWNER=your_github_username

# Build Configuration
BUILD_CACHE_DIR=.cache
CONTENT_CACHE_TTL=3600

# Optional Features
ENABLE_ANALYTICS=true
ENABLE_SEARCH=true
```

### Quick Start

1. Configure your content sources in `config/projects.json`:

```json
{
  "sources": [
    {
      "type": "github-topic",
      "topic": "portfolio-project",
      "owner": "yourusername"
    }
  ]
}
```

2. Run the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Project Structure

### Repository Format

Each project repository should follow this structure:

```
project-name/
├── README.md           # Project content (Markdown)
├── project.json        # Project metadata
└── assets/
    ├── cover.jpg      # Cover image
    ├── gallery/       # Additional images
    │   ├── image1.jpg
    │   └── image2.png
    └── models/        # 3D models
        └── model.glb
```

### README.md Format

```markdown
# Project Title

Brief description of the project.

## Overview

Detailed project information...

## Features

- Feature 1
- Feature 2
- Feature 3

## Technical Details

Implementation details...

## Gallery

Images are automatically pulled from the assets/gallery folder.

## Links

- [Live Demo](https://example.com)
- [Documentation](https://docs.example.com)
```

### project.json Metadata

```json
{
  "version": "1.0",
  "schema": "project",
  "title": "Project Name",
  "date": "2024-01-15",
  "tags": ["3D Printing", "Design", "Electronics"],
  "excerpt": "Brief description for previews",
  "featured": true,
  "status": "completed",
  "coverImage": "assets/cover.jpg",
  "gallery": "assets/gallery",
  "model": {
    "path": "assets/models/model.glb",
    "scale": 1.0,
    "position": [0, 0, 0],
    "rotation": [0, 0, 0]
  },
  "links": {
    "repository": "https://github.com/username/project",
    "demo": "https://demo.example.com",
    "video": "https://youtube.com/watch?v=..."
  },
  "attribution": {
    "author": "Your Name",
    "license": "MIT",
    "credits": ["Contributor 1", "Contributor 2"]
  },
  "extensions": {
    "analytics": {
      "views": 0,
      "likes": 0
    },
    "shop": {
      "available": true,
      "price": 29.99,
      "currency": "USD"
    }
  }
}
```

## Content Types

### Built-in Types

#### Project
Portfolio projects with galleries and 3D models.

```json
{
  "type": "project",
  "source": "github-repos",
  "schema": "schemas/project.schema.json",
  "features": ["gallery", "3d-viewer", "search"]
}
```

#### Blog
Blog posts with markdown content.

```json
{
  "type": "blog",
  "source": "content/blog",
  "schema": "schemas/blog.schema.json",
  "features": ["rss", "comments", "share"]
}
```

#### Service
Services or offerings.

```json
{
  "type": "service",
  "source": "content/data/services.json",
  "schema": "schemas/service.schema.json"
}
```

### Custom Content Types

Create new content types by adding to `config/content-types.json`:

```json
{
  "types": {
    "tutorial": {
      "source": "github-repos",
      "topic": "tutorial",
      "schema": "schemas/tutorial.schema.json",
      "transforms": ["markdown", "code-highlighting"],
      "features": ["toc", "copy-code", "video-embed"]
    }
  }
}
```

## Configuration

### Site Configuration (`config/site.json`)

```json
{
  "name": "Chris Loidolt",
  "title": "Portfolio",
  "description": "Designer & Engineer",
  "url": "https://chrisloidolt.com",
  "author": {
    "name": "Chris Loidolt",
    "email": "contact@chrisloidolt.com",
    "social": {
      "github": "chrisloidolt",
      "twitter": "chrisloidolt"
    }
  },
  "features": {
    "search": true,
    "analytics": true,
    "rss": true,
    "sitemap": true
  },
  "build": {
    "output": "out",
    "cache": ".cache"
  }
}
```

### Project Sources (`config/projects.json`)

```json
{
  "sources": [
    {
      "type": "github-topic",
      "topic": "portfolio-project",
      "owner": "chrisloidolt",
      "exclude": ["private-project"]
    },
    {
      "type": "github-repo",
      "repos": [
        "chrisloidolt/specific-project",
        "organization/shared-project"
      ]
    },
    {
      "type": "local",
      "path": "content/projects"
    }
  ],
  "defaults": {
    "status": "published",
    "features": ["gallery", "search"]
  }
}
```

### Build Hooks (`config/hooks.js`)

```javascript
module.exports = {
  // Before fetching content
  beforeFetch: [
    async (context) => {
      console.log('Checking GitHub rate limits...');
      await checkRateLimits(context.github);
    }
  ],
  
  // After fetching content
  afterFetch: [
    async (context) => {
      console.log('Processing images...');
      await optimizeImages(context.content);
    }
  ],
  
  // Before building site
  beforeBuild: [
    async (context) => {
      console.log('Validating content...');
      await validateSchemas(context.content);
    }
  ],
  
  // After building site
  afterBuild: [
    async (context) => {
      console.log('Deploying to CDN...');
      await deployToCDN(context.outputDir);
    }
  ]
};
```

## Schema System

### Schema Definition

Schemas use JSON Schema for validation:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "version": "1.0",
  "required": ["title", "date", "schema", "version"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+$"
    },
    "schema": {
      "type": "string",
      "const": "project"
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "date": {
      "type": "string",
      "format": "date"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "featured": {
      "type": "boolean",
      "default": false
    },
    "extensions": {
      "type": "object",
      "additionalProperties": true
    }
  }
}
```

### Schema Versioning

Handle schema migrations:

```javascript
// lib/schemas/migrations/project.js
module.exports = {
  '1.0': {
    up: (data) => data,
    down: (data) => data
  },
  '1.1': {
    up: (data) => ({
      ...data,
      status: data.published ? 'published' : 'draft',
      published: undefined
    }),
    down: (data) => ({
      ...data,
      published: data.status === 'published',
      status: undefined
    })
  }
};
```

## Plugin Architecture

### Plugin Structure

```
plugins/
└── my-plugin/
    ├── plugin.json     # Plugin metadata
    ├── index.js        # Main plugin file
    ├── schema.json     # Schema extensions
    └── components/     # React components
        └── Widget.jsx
```

### Plugin Definition (`plugin.json`)

```json
{
  "name": "analytics",
  "version": "1.0.0",
  "description": "Add analytics to projects",
  "hooks": {
    "afterFetch": "processAnalytics",
    "beforeRender": "injectAnalytics"
  },
  "schema": {
    "extends": ["project"],
    "properties": {
      "analytics": {
        "type": "object",
        "properties": {
          "views": { "type": "number" },
          "likes": { "type": "number" }
        }
      }
    }
  }
}
```

### Plugin Implementation

```javascript
// plugins/analytics/index.js
export default {
  // Process analytics data after fetching
  async processAnalytics(content) {
    for (const item of content) {
      if (item.type === 'project') {
        item.analytics = await fetchAnalytics(item.id);
      }
    }
    return content;
  },
  
  // Inject analytics script before rendering
  async injectAnalytics(page) {
    page.head.push({
      tag: 'script',
      attrs: { src: '/analytics.js', async: true }
    });
    return page;
  }
};
```

## Data Fetching

### GitHub API Integration

```javascript
// lib/github/fetcher.js
import { Octokit } from '@octokit/rest';

export class GitHubFetcher {
  constructor(token) {
    this.octokit = new Octokit({ auth: token });
    this.cache = new Map();
  }
  
  async fetchProjectRepos(owner, topic) {
    const cacheKey = `${owner}:${topic}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const repos = await this.octokit.paginate(
      this.octokit.repos.listForUser,
      {
        username: owner,
        per_page: 100
      }
    );
    
    const projectRepos = repos.filter(repo => 
      repo.topics.includes(topic)
    );
    
    const projects = await Promise.all(
      projectRepos.map(repo => this.fetchProjectData(repo))
    );
    
    this.cache.set(cacheKey, projects);
    return projects;
  }
  
  async fetchProjectData(repo) {
    const [readme, metadata, assets] = await Promise.all([
      this.fetchReadme(repo),
      this.fetchMetadata(repo),
      this.fetchAssets(repo)
    ]);
    
    return {
      id: repo.name,
      repo: repo.html_url,
      readme,
      metadata,
      assets
    };
  }
}
```

### Content Processing

```javascript
// lib/content/processor.js
export class ContentProcessor {
  constructor(plugins = []) {
    this.plugins = plugins;
  }
  
  async process(rawContent) {
    let content = rawContent;
    
    // Run plugin transforms
    for (const plugin of this.plugins) {
      if (plugin.transform) {
        content = await plugin.transform(content);
      }
    }
    
    // Process markdown
    content = await this.processMarkdown(content);
    
    // Optimize images
    content = await this.optimizeImages(content);
    
    // Generate search index
    content = await this.generateSearchIndex(content);
    
    return content;
  }
  
  async processMarkdown(content) {
    // Convert markdown to HTML
    // Extract metadata
    // Generate table of contents
    return content;
  }
}
```

## Static Generation

### Build Process

```javascript
// lib/build/generator.js
export class StaticGenerator {
  async build() {
    // 1. Fetch all content
    const content = await this.fetchContent();
    
    // 2. Process content
    const processed = await this.processContent(content);
    
    // 3. Generate pages
    await this.generatePages(processed);
    
    // 4. Generate indexes
    await this.generateIndexes(processed);
    
    // 5. Copy static assets
    await this.copyAssets();
    
    // 6. Generate sitemap
    await this.generateSitemap();
  }
  
  async generatePages(content) {
    for (const item of content) {
      const template = this.getTemplate(item.type);
      const html = await template.render(item);
      
      await this.writePage(item.slug, html);
    }
  }
}
```

### Next.js Integration

```typescript
// app/projects/[slug]/page.tsx
import { getProject, getAllProjects } from '@/lib/content';
import ProjectView from '@/components/ProjectView';

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const project = await getProject(params.slug);
  return <ProjectView project={project} />;
}
```

## Extending the System

### Adding New Content Types

1. Create schema:

```json
// schemas/tutorial.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "extends": "content-base",
  "properties": {
    "difficulty": {
      "type": "string",
      "enum": ["beginner", "intermediate", "advanced"]
    },
    "duration": {
      "type": "string",
      "pattern": "^\\d+\\s*(minutes?|hours?)$"
    },
    "prerequisites": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

2. Add to content types:

```json
// config/content-types.json
{
  "types": {
    "tutorial": {
      "source": "github-repos",
      "topic": "tutorial",
      "schema": "schemas/tutorial.schema.json",
      "features": ["toc", "copy-code", "progress"]
    }
  }
}
```

3. Create template:

```jsx
// components/TutorialView.jsx
export default function TutorialView({ tutorial }) {
  return (
    <article>
      <header>
        <h1>{tutorial.title}</h1>
        <div>Difficulty: {tutorial.difficulty}</div>
        <div>Duration: {tutorial.duration}</div>
      </header>
      <TableOfContents content={tutorial.content} />
      <Content markdown={tutorial.content} />
      <ProgressTracker />
    </article>
  );
}
```

### Creating Plugins

Example search plugin:

```javascript
// plugins/search/index.js
import { Index } from 'flexsearch';

export default {
  name: 'search',
  
  async afterFetch(content) {
    const index = new Index({
      tokenize: 'forward',
      cache: true
    });
    
    content.forEach((item, id) => {
      index.add(id, `${item.title} ${item.excerpt} ${item.tags.join(' ')}`);
    });
    
    await this.saveIndex(index);
    return content;
  },
  
  async saveIndex(index) {
    const data = index.export();
    await fs.writeFile('public/search-index.json', JSON.stringify(data));
  }
};
```

### Adding Features

Example comment system:

```javascript
// features/comments.js
export function addComments(contentType) {
  return {
    schema: {
      properties: {
        comments: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            provider: { 
              type: 'string',
              enum: ['github', 'disqus', 'custom']
            }
          }
        }
      }
    },
    
    components: {
      Comments: ({ project }) => {
        if (!project.comments?.enabled) return null;
        
        switch (project.comments.provider) {
          case 'github':
            return <GitHubDiscussions repo={project.repo} />;
          case 'disqus':
            return <DisqusComments id={project.id} />;
          default:
            return null;
        }
      }
    }
  };
}
```

## Migration Guide

### From Airtable

1. Export Airtable data:

```javascript
// scripts/export-airtable.js
const airtable = require('airtable');
const fs = require('fs-extra');

async function exportProjects() {
  const base = airtable.base(process.env.AIRTABLE_BASE_ID);
  const projects = [];
  
  await base('Projects').select().eachPage((records, next) => {
    records.forEach(record => {
      projects.push({
        id: record.id,
        ...record.fields
      });
    });
    next();
  });
  
  await fs.writeJson('airtable-export.json', projects);
}
```

2. Create GitHub repositories:

```javascript
// scripts/create-repos.js
const { Octokit } = require('@octokit/rest');
const projects = require('./airtable-export.json');

async function createRepos() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  
  for (const project of projects) {
    // Create repository
    await octokit.repos.createForAuthenticatedUser({
      name: slugify(project.Title),
      description: project.Excerpt,
      topics: project.Tags.map(tag => slugify(tag))
    });
    
    // Create README
    await createReadme(project);
    
    // Create metadata
    await createMetadata(project);
    
    // Upload assets
    await uploadAssets(project);
  }
}
```

### From WordPress

Use the WordPress export tool and convert:

```javascript
// scripts/wp-to-github.js
const xml2js = require('xml2js');
const TurndownService = require('turndown');

async function convertWordPress(xmlFile) {
  const xml = await fs.readFile(xmlFile, 'utf-8');
  const result = await xml2js.parseStringPromise(xml);
  const turndown = new TurndownService();
  
  const posts = result.rss.channel[0].item;
  
  for (const post of posts) {
    const content = turndown.turndown(post['content:encoded'][0]);
    const metadata = {
      title: post.title[0],
      date: post.pubDate[0],
      tags: post.category || []
    };
    
    await createGitHubRepo(metadata, content);
  }
}
```

## Best Practices

### Content Organization

1. **Use meaningful repository names**: `3d-printed-drone-parts` instead of `project-1`
2. **Consistent tagging**: Create a tag taxonomy and stick to it
3. **Image optimization**: Use appropriate formats (WebP for photos, PNG for diagrams)
4. **Model optimization**: Compress 3D models and use LOD (Level of Detail)

### Performance

1. **Implement caching**:
```javascript
const cache = new NodeCache({ stdTTL: 3600 });

async function fetchWithCache(key, fetcher) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetcher();
  cache.set(key, data);
  return data;
}
```

2. **Parallel processing**:
```javascript
// Process multiple repos concurrently
const projects = await Promise.all(
  repos.map(repo => processRepo(repo))
);
```

3. **Incremental builds**:
```javascript
// Only rebuild changed content
const changed = await getChangedRepos(lastBuildTime);
await rebuildProjects(changed);
```

### Security

1. **Validate all input**: Use schemas for validation
2. **Sanitize markdown**: Prevent XSS attacks
3. **Rate limiting**: Respect GitHub API limits
4. **Environment variables**: Never commit secrets

### SEO

1. **Structured data**:
```javascript
// Add JSON-LD for projects
const structuredData = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": project.title,
  "description": project.excerpt,
  "dateCreated": project.date,
  "creator": {
    "@type": "Person",
    "name": project.author
  }
};
```

2. **Meta tags**:
```jsx
<Head>
  <title>{project.title} | {site.name}</title>
  <meta name="description" content={project.excerpt} />
  <meta property="og:image" content={project.coverImage} />
</Head>
```

## API Reference

### Content API

```typescript
// Get all projects
async function getAllProjects(): Promise<Project[]>

// Get single project
async function getProject(slug: string): Promise<Project>

// Get projects by tag
async function getProjectsByTag(tag: string): Promise<Project[]>

// Search projects
async function searchProjects(query: string): Promise<Project[]>
```

### Plugin API

```typescript
interface Plugin {
  name: string;
  version: string;
  
  // Lifecycle hooks
  beforeFetch?: (context: Context) => Promise<void>;
  afterFetch?: (content: Content[]) => Promise<Content[]>;
  beforeBuild?: (context: Context) => Promise<void>;
  afterBuild?: (context: Context) => Promise<void>;
  
  // Content transformation
  transform?: (content: Content) => Promise<Content>;
  
  // Schema extension
  schema?: SchemaExtension;
  
  // React components
  components?: Record<string, React.Component>;
}
```

### Schema API

```typescript
interface Schema {
  $schema: string;
  version: string;
  extends?: string;
  required?: string[];
  properties: Record<string, Property>;
}

interface SchemaValidator {
  validate(data: any, schema: Schema): ValidationResult;
  migrate(data: any, fromVersion: string, toVersion: string): any;
}
```

---

This GitHub CMS provides a flexible, extensible foundation for building portfolio sites with all content managed through Git. The system grows with your needs while maintaining simplicity and performance.