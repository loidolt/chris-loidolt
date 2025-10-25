# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a portfolio website for Chris Loidolt showcasing design and engineering projects. Built with **Next.js 16** (App Router) using React 19, optimized for modern web deployment with optional Cloudflare Workers support. The site features a clean, monospace aesthetic inspired by developer tools and code editors, with a dark color palette and modern UI elements. It uses Airtable as a CMS for project data and includes 3D model viewing, client-side search, interactive maps, and a contact form.

## Common Commands

### Development
- `npm run dev` - Start Next.js development server (runs on http://localhost:3000)
- `npm run build` - Build production site (fetches Airtable data at build time)
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint

### Cloudflare Workers Deployment
- `npm run workers:build` - Build for Cloudflare Workers using OpenNext
- `npm run workers:dev` - Start Wrangler dev server
- `npm run workers:deploy` - Build and deploy to Cloudflare Workers

## Architecture

### Data Sources
- **Airtable**: Primary CMS for project data, locations, qualifications, services, and websites
  - Data is fetched **at build time** (using Next.js static generation) for optimal performance
  - Images are downloaded and cached locally during build
- **Environment Variables**: Airtable API keys and base IDs stored in `.env.local` files
- **Static Files**: 3D models (.glb files) stored in `/public/models/`

### Key Technologies
- **Next.js 16**: React framework with App Router for server components and static generation
- **React 19**: Modern React with Server Components support
- **Tailwind CSS v3**: Utility-first CSS with custom terminal theme
- **Three.js**: 3D model rendering via @react-three/fiber
- **Leaflet**: Interactive maps via react-leaflet
- **D3.js**: Data visualization for project node graphs
- **Fuse.js**: Client-side fuzzy search
- **Airtable**: Headless CMS
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
│   ├── airtable.ts             # Airtable data fetching utilities
│   ├── imageManifest.ts        # Image manifest for cached images
│   └── downloadImages.ts       # Image download/caching utilities
└── app/
    └── globals.css             # Global styles with Tailwind imports
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
# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_POSTS_BASEID=your_base_id
AIRTABLE_POSTS_TABLENAME=Projects
AIRTABLE_QUALIFICATIONS_TABLENAME=Qualifications
AIRTABLE_WEBSITES_TABLENAME=Websites
AIRTABLE_SERVICES_TABLENAME=Services
AIRTABLE_LOCATIONS_TABLENAME=Locations
```

**Important**: Airtable data is fetched at build time using Next.js static generation. To update content, rebuild the site.

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
   - Qualifications timeline from Airtable
   - Services grid from Airtable
   - Skills display organized by category

### Data Flow

1. **Build-Time Data Fetching**
   - Airtable data fetched during `npm run build` using Next.js App Router
   - Data is statically generated and baked into HTML
   - Images downloaded and cached locally in `/public/images/projects/`
   - No runtime API calls to Airtable
   - Optimal for performance and edge deployment

2. **Client-Side Interactivity**
   - Search/filter using Fuse.js
   - 3D model viewer (lazy loaded)
   - Interactive maps with Leaflet
   - Node graph visualization with D3
   - Contact form validation
   - Theme toggle

3. **Deployment Options**
   - **Static export**: Build and deploy to any static host
   - **Node.js server**: Run with `npm run start` after building
   - **Cloudflare Workers**: Deploy to edge with `npm run workers:deploy`
   - **Vercel/Netlify**: Native Next.js support

### Build Process
- **Next.js** handles build orchestration
- **App Router** for modern React Server Components
- **TypeScript** compilation
- **Tailwind CSS** processing
- Static file handling for 3D models
- Image optimization with Next.js Image component
- Client components bundled separately for optimal loading

### Development Notes

- Dev server runs on **port 3000** by default
- Hot module replacement enabled
- TypeScript strict mode enabled
- Client components marked with `"use client"` directive
- 3D models should be optimized .glb files
- Images cached from Airtable during build
- To update content: modify Airtable → rebuild site
- Map requires password for private locations (stored in Airtable)

### Component Patterns

**Server Components (default):**
- Pages that fetch data at build time
- Static layout components
- SEO-optimized content

**Client Components (`"use client"`):**
- Interactive components (search, filters, forms)
- Components using React hooks
- 3D viewers, maps, and visualizations
- Theme toggles and dynamic UI

### Performance Optimizations

- **Static Generation**: All pages pre-rendered at build time
- **Image Optimization**: Local caching of Airtable images
- **Code Splitting**: Automatic with Next.js App Router
- **Lazy Loading**: 3D models and heavy components load on demand
- **Edge Ready**: Optional Cloudflare Workers deployment for global CDN
