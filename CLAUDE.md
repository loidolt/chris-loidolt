# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a portfolio website for Chris Loidolt showcasing design and engineering projects. Built with **Next.js 16** (App Router) using React 19, optimized for modern web deployment with optional Cloudflare Workers support. The site features a clean, monospace aesthetic inspired by developer tools and code editors, with a dark color palette and modern UI elements. It uses **PocketBase** as a self-hosted CMS for project data and includes 3D model viewing, client-side search, interactive maps, and a contact form.

## Common Commands

### Development

**Docker Compose (Recommended):**
- `npm run docker:up` - Start PocketBase + Next.js together
- `npm run docker:down` - Stop all services
- `npm run docker:logs` - View logs from all services
- `npm run docker:rebuild` - Rebuild and restart services

**Native Development:**
- `npm run dev` - Start Next.js development server (runs on http://localhost:3000)
- `npm run build` - Build production site
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint

**Data Migration:**
- `npm run export:airtable` - Export data from Airtable (requires temporary airtable package)
- `npm run import:pocketbase` - Import data into PocketBase

### Cloudflare Workers Deployment
- `npm run workers:build` - Build for Cloudflare Workers using OpenNext
- `npm run workers:dev` - Start Wrangler dev server
- `npm run workers:deploy` - Build and deploy to Cloudflare Workers

## Architecture

### Data Sources
- **PocketBase**: Self-hosted CMS for project data, locations, qualifications, services, and websites
  - Data is fetched **at runtime** for real-time updates without rebuilds
  - Images served directly from PocketBase file API
  - Can be run via Docker Compose or standalone binary
- **Environment Variables**: PocketBase URL and credentials stored in `.env.local` files
- **Static Files**: 3D models (.glb files) stored in `/public/models/`

### Key Technologies
- **Next.js 16**: React framework with App Router for server components and runtime data fetching
- **React 19**: Modern React with Server Components support
- **PocketBase**: Self-hosted SQLite-based CMS with REST API
- **Docker Compose**: Development environment orchestration
- **Tailwind CSS v3**: Utility-first CSS with custom terminal theme
- **Three.js**: 3D model rendering via @react-three/fiber
- **Leaflet**: Interactive maps via react-leaflet
- **D3.js**: Data visualization for project node graphs
- **Fuse.js**: Client-side fuzzy search
- **TypeScript**: Type safety throughout
- **Cloudflare Workers**: Optional edge deployment via OpenNext

### Directory Structure
```
src/
├── app/
│   ├── layout.tsx               # Root layout with terminal theme
│   ├── page.tsx                 # Homepage
│   ├── about/
│   │   └── page.tsx            # About page with qualifications
│   ├── contact/
│   │   └── page.tsx            # Contact form page
│   ├── projects/
│   │   ├── page.tsx            # Project grid with search/filter
│   │   └── [slug]/
│   │       └── page.tsx        # Dynamic project detail pages
│   ├── gis/
│   │   └── page.tsx            # GIS map page
│   └── api/
│       └── contact/
│           └── route.ts        # Contact form API endpoint
├── components/
│   ├── Navigation.tsx          # Main navigation component
│   ├── LayoutContent.tsx       # Client wrapper for layout content
│   ├── TerminalWelcome.tsx     # Welcome text typing animation
│   ├── ProjectsGrid.tsx        # Project search/filter grid
│   ├── ContactForm.tsx         # Contact form with validation
│   ├── ModelViewer.tsx         # Three.js 3D viewer
│   ├── MapViewer.tsx           # Leaflet map with location markers
│   ├── ProjectNodeGraph.tsx    # D3 node graph visualization
│   ├── ImageGallery.tsx        # Image gallery component
│   ├── ThemeToggle.tsx         # Dark/light theme toggle
│   └── ...                     # Other components
├── lib/
│   ├── pocketbase.ts           # PocketBase data fetching utilities
│   └── mockLocations.ts        # Mock data for development/testing
└── app/
    └── globals.css             # Global styles with Tailwind imports
scripts/                         # Migration and utility scripts
├── export-airtable.ts          # Export data from Airtable
└── import-pocketbase.ts        # Import data into PocketBase
public/                          # Static assets (models, images, etc.)
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

Required environment variables (stored in `.env.local`):
```bash
# PocketBase Configuration
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=your_secure_password

# For Docker Compose: URLs are automatically configured
# For production: Use your deployed PocketBase URL
```

**Important**: PocketBase data is fetched at runtime. Content updates appear immediately without rebuilding the site.

### Key Features

1. **Homepage** (`app/page.tsx`)
   - Animated welcome text with typing effect
   - Quick links to main sections
   - Project statistics overview

2. **Projects Index** (`app/projects/page.tsx`)
   - Grid layout with project cards
   - Fuse.js client-side search
   - Category filtering
   - 3D model indicators
   - Node graph visualization toggle

3. **Project Detail** (`app/projects/[slug]/page.tsx`)
   - Dynamic routes generated at build time via `generateStaticParams()`
   - Interactive 3D model viewer (Three.js)
   - Image gallery with pixelation effect
   - Markdown content rendering
   - Tabbed interface for different content types
   - Links to GitHub/website

4. **GIS Map** (`app/gis/page.tsx`)
   - Interactive Leaflet map
   - Location markers with categories
   - Password-protected private locations
   - Modal for location details

5. **Contact Form** (`app/contact/page.tsx`)
   - Form inputs with validation
   - Zod validation (client-side)
   - API endpoint for form submission

6. **About Page** (`app/about/page.tsx`)
   - Qualifications timeline from PocketBase
   - Services grid from PocketBase
   - Skills display organized by category

### Data Flow

1. **Runtime Data Fetching**
   - PocketBase data fetched at request time via REST API
   - Enables real-time content updates without rebuilds
   - Images served directly from PocketBase file endpoints
   - Can be cached using Next.js caching strategies
   - Requires PocketBase to be running and accessible

2. **Client-Side Interactivity**
   - Search/filter using Fuse.js
   - 3D model viewer (lazy loaded)
   - Interactive maps with Leaflet
   - Node graph visualization with D3
   - Contact form validation
   - Theme toggle

3. **Deployment Options**
   - **Next.js on Vercel/Netlify**: With PocketBase hosted separately
   - **Node.js server**: Run with `npm run start` after building
   - **Cloudflare Workers**: Deploy to edge with `npm run workers:deploy`
   - **Docker Compose**: For development or self-hosted production

### Build Process
- **Next.js** handles build orchestration
- **App Router** for modern React Server Components
- **TypeScript** compilation
- **Tailwind CSS** processing
- Static file handling for 3D models
- Image optimization with Next.js Image component
- Client components bundled separately for optimal loading

### Development Notes

- Dev server runs on **port 3000** by default (Next.js)
- PocketBase runs on **port 8090** by default
- **Docker Compose** recommended for easy setup: `npm run docker:up`
- Hot module replacement enabled
- TypeScript strict mode enabled
- Client components marked with `"use client"` directive
- 3D models should be optimized .glb files
- Images served directly from PocketBase
- To update content: modify in PocketBase admin → changes appear immediately
- Map requires password for private locations (stored in PocketBase)

### Component Patterns

**Server Components (default):**
- Pages that fetch data at runtime
- Can use async/await for data fetching
- SEO-optimized content

**Client Components (`"use client"`):**
- Interactive components (search, filters, forms)
- Components using React hooks
- 3D viewers, maps, and visualizations
- Theme toggles and dynamic UI

### Performance Optimizations

- **Runtime Data Fetching**: Data fetched on demand with optional caching
- **Image Serving**: Images served directly from PocketBase with caching headers
- **Code Splitting**: Automatic with Next.js App Router
- **Lazy Loading**: 3D models and heavy components load on demand
- **Edge Ready**: Optional Cloudflare Workers deployment for global CDN
- **Docker Compose**: Optimized development environment with health checks
