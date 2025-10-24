# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a portfolio website for Chris Loidolt showcasing design and engineering projects. Built with **Astro** for static site generation with React islands, optimized for low-power deployment (battery-powered server or Docker). The site features a clean, monospace aesthetic inspired by developer tools and code editors, with a dark color palette and modern UI elements. It uses Airtable as a CMS for project data and includes 3D model viewing, client-side search, and a contact form.

## Common Commands

### Development
- `npm run dev` - Start Astro development server (runs on http://localhost:4321)
- `npm run build` - Build static site (fetches Airtable data at build time)
- `npm run preview` - Preview production build locally
- `npm run typecheck` - Run TypeScript type checking

### Deployment
- `docker-compose up` - Run in Docker with resource limits
- `docker build -t portfolio .` - Build Docker image
- `npm run start` - Start Node.js server (from built files)

## Architecture

### Data Sources
- **Airtable**: Primary CMS for project data, websites, services, and qualifications
  - Data is fetched **at build time** (not runtime) for optimal performance
- **Environment Variables**: Airtable API keys and base IDs stored in `.env` files
- **Static Files**: 3D models (.glb files) stored in `/public/models/` (or `/static/models/`)

### Key Technologies
- **Astro 5**: Static site generator with React islands for interactivity
- **React 19**: Used for interactive components (islands)
- **Node.js**: Optional server for dynamic hosting (can also serve purely static files)
- **Tailwind CSS v4**: Utility-first CSS with custom terminal theme (via Vite plugin)
- **Three.js**: 3D model rendering via @react-three/fiber
- **Fuse.js**: Client-side fuzzy search
- **Airtable**: Headless CMS
- **TypeScript**: Type safety throughout
- **Docker**: Containerized deployment with resource limits

### Directory Structure
```
src/
├── styles/
│   └── global.css               # Tailwind + terminal theme
├── layouts/
│   └── BaseLayout.astro         # Base HTML layout with terminal header/footer
├── components/
│   ├── TerminalWelcome.tsx      # React: Welcome text typing animation (client:load)
│   ├── ProjectsGrid.tsx         # React: Project search/filter (client:load)
│   ├── ContactForm.tsx          # React: Contact form with validation (client:load)
│   └── ModelViewer.tsx          # React: Three.js 3D viewer (client:load)
├── pages/
│   ├── index.astro              # Homepage with welcome animation
│   ├── projects/
│   │   ├── index.astro          # Project grid with search/filter
│   │   └── [slug].astro         # Dynamic project detail pages
│   ├── about.astro              # About page with qualifications
│   └── contact.astro            # Contact form page
├── lib/
│   └── airtable.ts              # Airtable data fetching utilities (build time)
public/                           # Static assets (models, images, etc.)
```

### Design System

**Color Palette:**
- `terminal-black`: #0a0e14 (darkest)
- `terminal-darker`: #0d1117 (background)
- `terminal-dark`: #161b22 (cards)
- `terminal-gray`: #21262d
- `terminal-border`: #30363d
- `terminal-text`: #c9d1d9
- `terminal-text-bright`: #e6edf3
- `terminal-green`: #3fb950 (primary accent)
- `terminal-cyan`: #39c5cf (links, interactive)
- `terminal-amber`: #d29922 (labels, section headers)
- `terminal-red`: #f85149 (errors)
- `terminal-blue`: #58a6ff

**Typography:**
- Font: JetBrains Mono (monospace throughout)
- No ligatures for clean readability

**UI Patterns:**
- Bracketed links: `[like this →]`
- Simple section headers with accent colors
- Clean borders and dividers
- Tab-style navigation
- Blinking cursor animation on loading states

### Environment Configuration

Required environment variables (needed during **build time**):
```bash
# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_POSTS_BASEID=your_base_id
AIRTABLE_POSTS_TABLENAME=Projects
AIRTABLE_QUALIFICATIONS_TABLENAME=Qualifications
AIRTABLE_WEBSITES_TABLENAME=Websites
AIRTABLE_SERVICES_TABLENAME=Services
```

**Important**: Airtable data is fetched at build time and baked into the static HTML. To update content, rebuild the site.

### Key Features

1. **Homepage** (index.astro)
   - Animated welcome text with typing effect (React island)
   - Quick links to main sections (static)
   - Project statistics overview (static)

2. **Projects Index** (projects/index.astro)
   - Grid layout with project cards
   - Fuse.js client-side search (React island)
   - Category filtering (React island)
   - 3D model indicators

3. **Project Detail** (projects/[slug].astro)
   - Dynamic routes generated at build time via `getStaticPaths()`
   - Interactive 3D model viewer (React island with Three.js)
   - Image gallery (static)
   - Metadata display (static)
   - Links to GitHub/website (static)

4. **Contact Form** (contact.astro)
   - Clean form inputs (React island)
   - Zod validation (client-side)
   - Form submission (currently logs to console, ready for server endpoint)

5. **About Page** (about.astro)
   - Qualifications timeline from Airtable (static, fetched at build)
   - Services grid from Airtable (static, fetched at build)
   - Skills display organized by category (static)

### Data Flow

1. **Build-Time Data Fetching**
   - Airtable data fetched during `npm run build`
   - All data is baked into static HTML files
   - No runtime API calls to Airtable
   - Optimal for low-power deployment

2. **Client-Side Interactivity (React Islands)**
   - Search/filter using Fuse.js (client:load)
   - 3D model viewer (client:load, only loads when needed)
   - Welcome text typing animation (client:load)
   - Contact form validation (client:load)

3. **Deployment Options**
   - **Static hosting**: Build and serve `dist/` folder with any static host
   - **Docker**: Multi-stage build with Node.js server
   - **Battery-powered server**: Low resource usage with resource limits
   - **Traditional server**: Run with `npm run start` after building

### Build Process
- **Astro** handles build orchestration
- **Vite** for bundling and optimization
- **TypeScript** compilation
- **Tailwind CSS v4** processing via Vite plugin
- Static file handling for 3D models
- React islands bundled separately for optimal loading

### Development Notes

- Dev server runs on **port 4321** by default
- Hot module replacement enabled
- TypeScript strict mode enabled
- React components marked with `client:load` become interactive islands
- 3D models should be optimized .glb files
- Images served from Airtable (fetched at build) or static directory
- To update content: modify Airtable → rebuild site

### Low-Power Deployment Features

- **Static-first**: Minimal server overhead
- **Resource limits**: Docker compose includes CPU/memory limits
- **Build-time data**: No runtime database queries
- **Optimized bundles**: Islands architecture loads JS only where needed
- **Health checks**: Docker health monitoring included
