# Digital Garden Setup Guide

A simplified approach to configuring repositories for the digital garden system using a `.garden` directory.

## Quick Start

### For Projects and Experiments (Repositories)

1. Add at least one content type topic: `garden`, `project`, or `experiment`
2. Create a `.garden` directory in your repository
3. Add `.garden/meta.yml` with basic metadata (supports comments!)
4. Add `.garden/README.md` with your content

### For Notes and Writing (Gists)

1. Create a GitHub Gist with your content
2. Add `#garden` and `#note` (or `#writing`) to the description
3. That's it! See [GIST_GARDEN_GUIDE.md](GIST_GARDEN_GUIDE.md) for details

## Directory Structure

```
your-repository/
├── .garden/
│   ├── meta.yml      (required - metadata configuration with comments)
│   ├── README.md     (required - main content)
│   └── assets/       (optional - images, files)
└── ... (rest of your project files)
```

## Growth Stages

The digital garden uses a plant metaphor for content maturity:

- 🌱 **seedling** - New ideas, rough drafts, work in progress
- 🌿 **budding** - Developing content, partially complete
- 🌳 **evergreen** - Mature content, regularly maintained and updated
- 🌲 **perennial** - Completed projects, stable but not actively maintained

## Configuration Files

### `.garden/meta.yml`

Core metadata for your garden content (YAML format supports comments!):

```yaml
# Required fields
title: Your Content Title
type: project  # or experiment
stage: budding  # seedling, budding, evergreen, or perennial

# Recommended fields
description: A brief description of your content
tags:
  - additional
  - tags
planted: 2024-01-15
tended: 2024-03-20

# Optional fields
featured: false
draft: false
```

### `.garden/README.md`

Your main content file. Can include frontmatter to override meta.yml:

```markdown
---
title: Override Title (optional)
stage: evergreen
connections:
  - related-concept
  - another-project
---

# Your Content

Main content goes here. Use [[wiki-links]] to connect to other content.
```

## Examples

### 1. Active Project (Evergreen)

**Repository Topics:** `project`, `portfolio`, `garden`

**`.garden/meta.json`:**
```json
{
  "title": "Task Management App",
  "description": "A modern task management application with real-time sync",
  "type": "project",
  "stage": "evergreen",
  "tags": ["react", "typescript", "productivity"],
  "planted": "2023-06-15",
  "tended": "2024-03-20",
  "featured": true,
  "technologies": ["React", "TypeScript", "Supabase"],
  "demoUrl": "https://tasks.example.com",
  "status": "active"
}
```

**`.garden/README.md`:**
```markdown
# Task Management App

A modern, real-time task management application built with React and TypeScript.

## Features

- Real-time synchronization across devices
- Intuitive drag-and-drop interface
- Smart notifications and reminders
- Integration with [[calendar-sync-system]]

## Technical Architecture

The app uses a [[event-driven-architecture]] with Supabase for real-time data sync...
```

### 2. Completed Project (Perennial)

**Repository Topics:** `project`, `perennial`, `garden`

**`.garden/meta.json`:**
```json
{
  "title": "Arduino Weather Station",
  "description": "A DIY weather station with web dashboard",
  "type": "project",
  "stage": "perennial",
  "tags": ["arduino", "iot", "hardware"],
  "planted": "2022-03-10",
  "tended": "2023-11-15",
  "completedDate": "2023-11-15",
  "status": "complete",
  "lessonsLearned": [
    "Importance of weatherproofing",
    "Power consumption optimization"
  ]
}
```

### 3. Evolving Note (Budding)

**Repository Topics:** `note`, `garden`

**`.garden/meta.json`:**
```json
{
  "title": "Thoughts on Software Architecture",
  "type": "note",
  "stage": "budding",
  "tags": ["architecture", "design-patterns", "best-practices"],
  "planted": "2024-02-01",
  "tended": "2024-03-18",
  "connections": [
    "microservices-patterns",
    "domain-driven-design"
  ]
}
```

### 4. Blog Post (Evergreen)

**Repository Topics:** `writing`, `garden`

**`.garden/meta.json`:**
```json
{
  "title": "A Complete Guide to React Server Components",
  "description": "Understanding and implementing React Server Components",
  "type": "writing",
  "stage": "evergreen",
  "tags": ["react", "tutorial", "web-development"],
  "planted": "2024-01-10",
  "tended": "2024-03-15",
  "featured": true,
  "readingTime": "15 min",
  "publishedAt": "2024-01-15"
}
```

## Meta.json Schema

### Required Fields

- `title` (string) - The display title for your content
- `type` (string) - One of: `project`, `note`, `writing`, `experiment`
- `stage` (string) - One of: `seedling`, `budding`, `evergreen`, `perennial`

### Optional Fields

- `description` (string) - Brief description of the content
- `tags` (array) - Additional tags beyond GitHub topics
- `planted` (string) - ISO date when created
- `tended` (string) - ISO date of last significant update
- `connections` (array) - Related content slugs
- `featured` (boolean) - Show in featured section
- `draft` (boolean) - Mark as draft
- `author` (string) - Content author
- `technologies` (array) - Technologies used (for projects)
- `demoUrl` (string) - Live demo URL
- `status` (string) - Current status
- `completedDate` (string) - When project was completed (for perennial)

### Type-Specific Fields

**Projects:**
- `technologies` - Tech stack used
- `demoUrl` - Live demo link
- `repository` - Main code repository
- `status` - active, complete, maintenance

**Writing:**
- `publishedAt` - Publication date
- `canonicalUrl` - Original publication URL
- `series` - Part of a series

**Notes:**
- `lastReviewed` - Last review date
- `confidence` - high, medium, low
- `sources` - Reference materials

## Content File Formats

The `.garden/` directory supports multiple content formats:

- `README.md` - Standard markdown
- `README.mdx` - MDX for interactive content
- `index.md` / `index.mdx` - Alternative naming
- `content.md` / `content.mdx` - Alternative naming

## Wiki-Style Links

Create connections between your content using wiki-style links:

- `[[project-name]]` - Link to another piece of content
- `[[concept|Display Text]]` - Link with custom display text

## Migration Steps

To migrate an existing repository:

1. **Add GitHub Topics**
   ```bash
   gh repo edit --add-topic garden --add-topic project
   ```

2. **Create .garden Directory**
   ```bash
   mkdir .garden
   ```

3. **Create meta.json**
   ```bash
   cat > .garden/meta.json << 'EOF'
   {
     "title": "Your Project Name",
     "type": "project",
     "stage": "budding",
     "description": "Brief description"
   }
   EOF
   ```

4. **Move/Create Content**
   ```bash
   # If you have an existing README
   cp README.md .garden/README.md
   
   # Or create new content
   echo "# Your Content" > .garden/README.md
   ```

5. **Add Connections**
   - Edit your content to include `[[wiki-links]]` to related content

6. **Test Locally**
   - The garden system will now discover and process your repository

## Best Practices

1. **Consistent Naming** - Use kebab-case for repository names
2. **Clear Titles** - Make titles descriptive and searchable
3. **Regular Updates** - Keep the `tended` date current
4. **Meaningful Connections** - Link to genuinely related content
5. **Appropriate Stages** - Be honest about content maturity
6. **Rich Metadata** - Include relevant metadata for better organization

## Validation Checklist

- [ ] Repository has at least one required topic
- [ ] `.garden/meta.json` exists and is valid JSON
- [ ] `.garden/README.md` (or variant) exists
- [ ] `type` and `stage` fields are set correctly
- [ ] Title is descriptive and unique
- [ ] Connections use correct wiki-link syntax

## Troubleshooting

**Repository not appearing?**
- Check GitHub topics include at least one required type
- Verify `.garden/meta.json` exists and is valid
- Ensure repository is public

**Content not processing?**
- Validate JSON syntax in meta.json
- Check for required fields (title, type, stage)
- Verify content file exists in `.garden/`

**Connections not working?**
- Use exact repository names in wiki-links
- Ensure linked repositories also have `.garden/` setup
- Check for typos in connection names