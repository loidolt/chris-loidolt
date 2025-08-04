# GitHub-Based Digital Garden Documentation

A comprehensive guide for building a digital garden using GitHub repositories as a content management system with automatic content discovery.

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

This GitHub-based digital garden system automatically discovers and organizes content from your GitHub repositories based on topics, tags, and metadata. It creates a living, evolving knowledge base that grows with your work, eliminating manual curation while maintaining flexibility for portfolio use.

### Key Features

- **Automatic content discovery** - No manual project lists; discovers repos via GitHub API
- **Tag-based organization** - Content organized by GitHub topics and custom tags
- **Digital garden philosophy** - Interconnected notes, projects, and ideas that evolve
- **Portfolio-ready** - Can surface featured/polished work when needed
- **Zero maintenance** - Add/remove content by updating repos, not code
- **Static site generation** - Fast, secure, and deployable anywhere
- **Flexible content types** - Projects, notes, experiments, writings, and more

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
digital-garden/
├── app/                    # Next.js app directory
│   ├── layout.tsx
│   ├── page.tsx
│   ├── garden/           # Browse all content
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── projects/         # Portfolio view
│   │   └── [slug]/
│   │       └── page.tsx
│   └── tags/             # Tag-based views
│       └── [tag]/
│           └── page.tsx
├── lib/
│   ├── github/           # GitHub API integration
│   ├── discovery/        # Content discovery rules
│   ├── content/          # Content processing
│   ├── graph/            # Content relationships
│   └── schemas/          # Schema validation
├── config/
│   ├── discovery.json    # Discovery rules & filters
│   ├── site.json        # Site configuration
│   └── hooks.js         # Build hooks
├── schemas/
│   ├── base.schema.json
│   ├── project.schema.json
│   ├── note.schema.json
│   └── custom/
└── content/             # Local content only
    └── pages/           # Static pages
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

1. Configure content discovery in `config/discovery.json`:

```json
{
  "rules": {
    "include": {
      "topics": ["garden", "project", "note", "writing"],
      "owner": "yourusername",
      "visibility": "public"
    },
    "exclude": {
      "topics": ["archived", "private"],
      "repos": ["dotfiles", "configs"]
    },
    "special": {
      "featured": { "topic": "featured" },
      "portfolio": { "topic": "portfolio" },
      "drafts": { "topic": "draft" }
    }
  },
  "refresh": {
    "interval": "1h",
    "webhook": true
  }
}
```

2. Tag your repositories on GitHub:

```bash
# Add topics to your repos
gh repo edit owner/repo --add-topic garden
gh repo edit owner/repo --add-topic project
gh repo edit owner/repo --add-topic featured
```

3. Run the development server:

```bash
npm run dev
```

4. Build for production:

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

### metadata.json (Optional)

Optional metadata file for additional control. If not present, system derives metadata from README and repo info:

```json
{
  "version": "1.0",
  "type": "project",
  "status": "growing",
  "planted": "2024-01-15",
  "tended": "2024-03-20",
  "stage": "seedling",
  "connections": ["related-project", "inspiration-source"],
  "coverImage": "assets/cover.jpg",
  "gallery": "assets/gallery",
  "model": {
    "path": "assets/models/model.glb",
    "scale": 1.0,
    "position": [0, 0, 0],
    "rotation": [0, 0, 0]
  },
  "showcase": {
    "portfolio": true,
    "featured": true,
    "order": 1
  },
  "extensions": {
    "custom": {}
  }
}
```

### Content Types via Topics

Content type is automatically determined by GitHub topics:

- `garden` - General digital garden content
- `project` - Completed or ongoing projects
- `note` - Quick thoughts, TILs, snippets
- `writing` - Long-form articles or essays
- `experiment` - Work in progress, trials
- `resource` - Curated links, tools, references
- `portfolio` - Polished work for professional display
- `featured` - Highlight on homepage

### Growth Stages

Digital garden content can be tagged with growth stages:

- `seedling` - New ideas, just planted
- `budding` - Starting to develop
- `evergreen` - Mature, maintained content
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
  "title": "Digital Garden",
  "tagline": "Growing ideas in public",
  "description": "A digital garden of projects, notes, and experiments",
  "url": "https://chrisloidolt.com",
  "author": {
    "name": "Chris Loidolt",
    "email": "contact@chrisloidolt.com",
    "social": {
      "github": "chrisloidolt",
      "twitter": "chrisloidolt"
    }
  },
  "garden": {
    "showGrowthStage": true,
    "showLastTended": true,
    "enableGraph": true,
    "enableBacklinks": true
  },
  "features": {
    "search": true,
    "rss": true,
    "sitemap": true,
    "portfolio": true
  },
  "build": {
    "output": "out",
    "cache": ".cache"
  }
}
```

### Discovery Configuration (`config/discovery.json`)

```json
{
  "sources": {
    "github": {
      "owner": "chrisloidolt",
      "type": "user",
      "includeOrgs": ["myorg"],
      "auth": "env:GITHUB_TOKEN"
    }
  },
  "rules": {
    "include": {
      "topics": {
        "any": ["garden", "project", "note", "writing", "experiment"],
        "all": []
      },
      "visibility": ["public"],
      "language": null,
      "minStars": 0
    },
    "exclude": {
      "topics": ["archived", "deprecated", "private"],
      "repos": ["dotfiles", ".github", "configs"],
      "namePattern": "^\\."
    },
    "categorize": {
      "featured": { 
        "topics": ["featured"],
        "minStars": 10 
      },
      "portfolio": { 
        "topics": ["portfolio", "showcase"] 
      },
      "experiments": { 
        "topics": ["wip", "experiment", "draft"] 
      }
    }
  },
  "processing": {
    "cache": "1h",
    "parallel": 5,
    "retries": 3
  },
  "webhooks": {
    "enabled": true,
    "secret": "env:WEBHOOK_SECRET"
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

### Automatic Content Discovery

```javascript
// lib/discovery/discoverer.js
import { Octokit } from '@octokit/rest';
import { DiscoveryRules } from './rules';

export class ContentDiscoverer {
  constructor(config) {
    this.octokit = new Octokit({ auth: config.github.token });
    this.rules = new DiscoveryRules(config.rules);
    this.cache = new Map();
  }
  
  async discoverContent() {
    const repos = await this.fetchAllRepos();
    const filtered = this.rules.filter(repos);
    const categorized = this.rules.categorize(filtered);
    
    return {
      all: filtered,
      categories: categorized,
      graph: this.buildGraph(filtered)
    };
  }
  
  async fetchAllRepos() {
    const { owner, type, includeOrgs } = this.config.sources.github;
    
    let repos = [];
    
    // Fetch user repos
    if (type === 'user') {
      repos = await this.octokit.paginate(
        this.octokit.repos.listForUser,
        { username: owner, per_page: 100 }
      );
    }
    
    // Fetch org repos
    for (const org of includeOrgs || []) {
      const orgRepos = await this.octokit.paginate(
        this.octokit.repos.listForOrg,
        { org, per_page: 100 }
      );
      repos.push(...orgRepos);
    }
    
    return repos;
  }
  
  buildGraph(repos) {
    // Build connection graph based on topics, mentions, etc
    const nodes = repos.map(repo => ({
      id: repo.name,
      label: repo.name,
      topics: repo.topics,
      connections: []
    }));
    
    // Find connections
    nodes.forEach(node => {
      node.connections = this.findConnections(node, nodes);
    });
    
    return { nodes, edges: this.buildEdges(nodes) };
  }
}
```

### Discovery Rules Engine

```javascript
// lib/discovery/rules.js
export class DiscoveryRules {
  constructor(config) {
    this.config = config;
  }
  
  filter(repos) {
    return repos.filter(repo => {
      // Include rules
      if (!this.matchesInclude(repo)) return false;
      
      // Exclude rules
      if (this.matchesExclude(repo)) return false;
      
      return true;
    });
  }
  
  matchesInclude(repo) {
    const { topics, visibility, language, minStars } = this.config.include;
    
    // Check topics (any or all)
    if (topics.any?.length) {
      const hasAny = topics.any.some(t => repo.topics.includes(t));
      if (!hasAny) return false;
    }
    
    if (topics.all?.length) {
      const hasAll = topics.all.every(t => repo.topics.includes(t));
      if (!hasAll) return false;
    }
    
    // Check visibility
    if (visibility && !visibility.includes(repo.visibility)) {
      return false;
    }
    
    // Check stars
    if (minStars && repo.stargazers_count < minStars) {
      return false;
    }
    
    return true;
  }
  
  categorize(repos) {
    const categories = {};
    
    Object.entries(this.config.categorize).forEach(([name, rules]) => {
      categories[name] = repos.filter(repo => 
        this.matchesCategory(repo, rules)
      );
    });
    
    return categories;
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

### Digital Garden Philosophy

1. **Learn in Public**: Share works in progress, not just finished pieces
2. **Bi-directional Links**: Connect related ideas across repositories
3. **Iterative Growth**: Update and tend to content over time
4. **Topic Taxonomy**: Use consistent GitHub topics for organization

### Repository Organization

1. **Topic Strategy**:
   - Primary type: `garden`, `project`, `note`, `writing`
   - Growth stage: `seedling`, `budding`, `evergreen`
   - Special flags: `featured`, `portfolio`, `draft`
   - Subject tags: `3d-printing`, `electronics`, `web-dev`

2. **Naming Conventions**:
   - Projects: `descriptive-project-name`
   - Notes: `YYYY-MM-DD-topic-name`
   - Resources: `resource-category-name`

3. **README Structure**:
   ```markdown
   # Title
   
   > Brief description or key insight
   
   **Planted**: 2024-01-15  
   **Stage**: 🌱 Seedling
   
   ## Overview
   Main content...
   
   ## Connections
   - [[Related Project]]
   - [[Inspiration Source]]
   ```

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
await rebuildContent(changed);
```

4. **Smart discovery**:
```javascript
// Use webhooks for real-time updates
app.post('/webhook/github', async (req, res) => {
  const { repository, action } = req.body;
  
  if (action === 'updated' || action === 'topics_changed') {
    await updateContent(repository);
  }
});
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

## Digital Garden Features

### Knowledge Graph Visualization

```typescript
// components/GardenGraph.tsx
import { ForceGraph } from 'react-force-graph';

export function GardenGraph({ content }) {
  const graphData = useMemo(() => {
    const nodes = content.map(item => ({
      id: item.slug,
      name: item.title,
      val: item.connections.length,
      group: item.type,
      stage: item.stage
    }));
    
    const links = content.flatMap(item =>
      item.connections.map(target => ({
        source: item.slug,
        target
      }))
    );
    
    return { nodes, links };
  }, [content]);
  
  return (
    <ForceGraph
      graphData={graphData}
      nodeLabel="name"
      nodeColor={node => stageColors[node.stage]}
      linkDirectionalParticles={2}
    />
  );
}
```

### Backlinks & References

```javascript
// lib/content/backlinks.js
export function buildBacklinks(content) {
  const backlinks = new Map();
  
  content.forEach(item => {
    // Find [[wiki-style]] links
    const links = item.content.match(/\[\[([^\]]+)\]\]/g) || [];
    
    links.forEach(link => {
      const target = link.slice(2, -2);
      if (!backlinks.has(target)) {
        backlinks.set(target, []);
      }
      backlinks.get(target).push(item.slug);
    });
  });
  
  return backlinks;
}
```

### Portfolio Mode

```typescript
// app/portfolio/page.tsx
export default async function PortfolioPage() {
  const content = await getContent();
  const portfolio = content.categories.portfolio || [];
  
  return (
    <div className="portfolio-grid">
      <h1>Selected Work</h1>
      <p>Polished projects ready for professional presentation</p>
      
      {portfolio.map(project => (
        <ProjectCard 
          key={project.slug}
          project={project}
          showStats={false}
          minimal={true}
        />
      ))}
      
      <Link href="/garden">
        Explore the full garden →
      </Link>
    </div>
  );
}
```

---

This GitHub-based digital garden system provides automatic content discovery, flexible organization, and grows naturally with your work. It eliminates manual curation while supporting both digital garden exploration and professional portfolio presentation.