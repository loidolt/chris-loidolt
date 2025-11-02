# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **multi-tenant family portfolio system** powered by a single PocketBase instance, supporting **5 separate sites**:
- **loidolt.space** - Family hub with shared content and collaborative projects
- **chris.loidolt.space** - Chris's personal portfolio site (Terminal Green theme)
- **julia.loidolt.space** - Julia's personal site (Warm Coral theme)
- **theo.loidolt.space** - Theo's personal site (Electric Blue theme)
- **jack.loidolt.space** - Jack's personal site (Sunset Orange theme)

Built with **SvelteKit 2.0** using Svelte 5, optimized for modern web deployment with Node.js server. The site features **person-specific theming** with unique color palettes for each family member, a clean monospace aesthetic, and modern UI elements. It uses **PocketBase** as a self-hosted CMS with **multi-tenant architecture** supporting person-specific data, flexible scoping (Family/Personal), and granular privacy controls (Public/Family/Private). Features include 3D model viewing, client-side search, interactive maps, PWA support, contact forms, and **dynamic per-person theming**.

## Common Commands

### Development

**Docker Compose (Recommended):**
- `npm run docker:up` - Start PocketBase + SvelteKit together
- `npm run docker:down` - Stop all services
- `npm run docker:logs` - View logs from all services
- `npm run docker:rebuild` - Rebuild and restart services

**PocketBase Setup:**
- `npm run pocketbase:init` - Create admin user from .env.local
- `npm run import:schema` - Import schema from pb_schema.json (creates all collections)
- `npm run export:schema` - Export current schema to pb_schema.json

**SvelteKit Development:**
- `npm run dev` - Start SvelteKit development server (runs on http://localhost:3050)
- `npm run build` - Build production site
- `npm run preview` - Preview production build
- `npm start` - Start production server (node build)
- `npm run check` - Run Svelte type checking
- `npm run check:watch` - Watch mode for type checking

**Data Migration:**
- `npm run export:airtable` - Export data from Airtable (requires temporary airtable package)
- `npm run import:pocketbase` - Import data into PocketBase
- `npm run migrate:multitenant` - Migrate existing data to multi-tenant architecture

**PWA:**
- `npm run pwa:icons` - Generate PWA icons

## Architecture

> **Multi-Tenant Documentation**: See `MULTITENANT_ARCHITECTURE.md` for comprehensive architecture details, `MIGRATION_STEPS.md` for setup instructions, and `MULTITENANT_SUMMARY.md` for a summary of changes.

### Data Sources
- **PocketBase**: Self-hosted CMS with **multi-tenant architecture**
  - **Collections**: persons, projects, locations, qualifications, services, skills
  - **Multi-tenant features**: Person-specific data, flexible scoping (Family/Personal), granular privacy (Public/Family/Private)
  - Data is fetched **at runtime** for real-time updates without rebuilds
  - Images served directly from PocketBase file API
  - Can be run via Docker Compose or standalone binary
  - **Schema managed declaratively** via `pb_schema.json` (version controlled)
  - **Access rules**: Sophisticated multi-tenant permissions enforce data isolation
- **Environment Variables**: PocketBase URL and credentials stored in `.env.local` files
- **Static Files**: 3D models (.glb files) stored in `/static/models/`

### Key Technologies
- **SvelteKit 2.0**: Modern framework with excellent server-side rendering and routing
- **Svelte 5**: Latest version with improved reactivity and runes
- **PocketBase**: Self-hosted SQLite-based CMS with REST API and multi-tenant support
- **Docker Compose**: Development environment orchestration
- **Tailwind CSS v3**: Utility-first CSS with shadcn-svelte design system
- **Three.js**: 3D model rendering
- **Leaflet**: Interactive maps
- **D3.js**: Data visualization for project node graphs
- **Fuse.js**: Client-side fuzzy search
- **TypeScript**: Type safety throughout
- **Vite 7**: Fast build tool and dev server
- **@vite-pwa/sveltekit**: Progressive Web App support

### Multi-Tenant Architecture

The project uses a **flexible multi-tenant architecture** powered by a single PocketBase instance to support multiple family member sites.

**Core Concepts:**

1. **Persons Collection**
   - Represents each family member (Chris, Julia, Theo, Jack)
   - Fields: name, slug, email, bio, avatar, user (optional auth relation)
   - Decouples person identity from authentication

2. **Data Scoping**
   - **Family**: Shared across all sites (locations, collaborative projects, family services)
   - **Personal**: Specific to individuals (personal projects, skills, qualifications)

3. **Privacy Levels**
   - **Public**: Visible to everyone (authenticated or not)
   - **Family**: Visible only to authenticated family members
   - **Private**: Visible only to owner(s) and admins

4. **Multi-Person Relations**
   - Projects, services, locations, and skills support multiple person owners
   - Enables collaborative projects and shared content
   - Family members have read-only access to each other's unpublished work

5. **Data Fetching Functions**
   - `getAllPersons()` / `getPersonBySlug(slug)`
   - `getProjectsByPerson(slug)` / `getSkillsByPerson(slug)`
   - `getQualificationsByPerson(slug)`
   - Legacy functions (e.g., `getAllProjects()`) continue to work

**Documentation:**
- `MULTITENANT_ARCHITECTURE.md` - Comprehensive architecture guide
- `MIGRATION_STEPS.md` - Step-by-step migration instructions
- `MULTITENANT_SUMMARY.md` - High-level overview of changes

### Theming System

**Person-Specific Visual Identities**: Each family member has a unique theme with custom color palettes, typography, and styling.

```
src/lib/themes/
├── types.ts           # TypeScript interfaces for themes
├── index.ts           # Theme registry and utilities
├── chris.theme.ts     # Terminal Green theme (e-paper aesthetic)
├── julia.theme.ts     # Warm Coral theme (artistic, inviting)
├── theo.theme.ts      # Electric Blue theme (cool, tech-focused)
├── jack.theme.ts      # Sunset Orange theme (playful, energetic)
└── family.theme.ts    # Unified Family Hub theme (balanced, welcoming)
```

**Testing Themes**: Use query parameters in development:
- `http://localhost:3050?person=julia` - Julia's Warm Coral theme
- `http://localhost:3050?person=theo` - Theo's Electric Blue theme
- `http://localhost:3050?person=jack` - Jack's Sunset Orange theme
- `http://localhost:3050?person=family` - Family Hub theme

**Documentation**: See `THEMING_TESTING.md` for complete testing guide and theme details.

### Directory Structure
```
src/
├── routes/
│   ├── +layout.svelte           # Root layout with Navigation
│   ├── +layout.server.ts        # Server load for personSlug
│   ├── +page.svelte             # Homepage
│   ├── +page.server.ts          # Homepage data loading
│   ├── about/
│   │   ├── +page.svelte        # About page with qualifications
│   │   └── +page.server.ts     # Load qualifications/services
│   ├── contact/
│   │   ├── +page.svelte        # Contact form page
│   │   └── +server.ts          # Contact form API endpoint
│   ├── projects/
│   │   ├── +page.svelte        # Project grid with search/filter
│   │   ├── +page.server.ts     # Load projects
│   │   └── [slug]/
│   │       ├── +page.svelte    # Project detail page
│   │       └── +page.server.ts # Load single project
│   └── gis/
│       ├── +page.svelte        # GIS map page
│       └── +page.server.ts     # Load locations
├── lib/
│   ├── components/
│   │   ├── Navigation.svelte       # Main navigation
│   │   ├── TerminalWelcome.svelte  # Welcome text animation
│   │   ├── ProjectsGrid.svelte     # Project search/filter grid
│   │   ├── ModelViewer.svelte      # Three.js 3D viewer
│   │   ├── MapViewer.svelte        # Leaflet map with markers
│   │   ├── ImageGallery.svelte     # Image gallery
│   │   ├── PWAInstaller.svelte     # PWA install prompt
│   │   └── ...                     # Other components
│   ├── layouts/
│   │   ├── Card.svelte             # Card layout
│   │   ├── Container.svelte        # Container layout
│   │   ├── Flex.svelte             # Flex layout
│   │   ├── Modal.svelte            # Modal layout
│   │   ├── PageHeader.svelte       # Page header
│   │   ├── Section.svelte          # Section layout
│   │   ├── Sidebar.svelte          # Sidebar layout
│   │   ├── Stack.svelte            # Stack layout
│   │   ├── Tabs.svelte             # Tabs layout
│   │   └── index.ts                # Layout exports
│   ├── stores/
│   │   ├── theme.ts                # Theme store
│   │   ├── locationFilters.ts      # Location filter store
│   │   └── drawings.ts             # Map drawing store
│   ├── utils/
│   │   └── breakpoints.ts          # Responsive breakpoint utils
│   ├── pocketbase.ts               # PocketBase data fetching
│   └── mapUtils.ts                 # Map utility functions
├── hooks.server.ts                 # Multi-tenant subdomain detection
├── app.d.ts                        # TypeScript definitions
├── app.css                         # Global styles with Tailwind
└── app.html                        # HTML template
static/                             # Static assets (models, images, etc.)
scripts/                            # Migration and utility scripts
├── export-airtable.ts              # Export data from Airtable
├── import-pocketbase.ts            # Import data into PocketBase
├── migrate-multitenant.ts          # Migrate to multi-tenant architecture
├── import-schema.ts                # Import schema from pb_schema.json
└── export-schema.ts                # Export schema to pb_schema.json
```

### Design System

**shadcn-svelte**
This project uses [shadcn-svelte](https://shadcn-svelte.com/) as its design system, providing:
- Accessible, customizable UI components
- Built on Radix UI primitives via bits-ui
- Full TypeScript support
- Dark/light mode support via theme system
- Tailwind CSS for styling

**Color System:**
- Uses CSS custom properties via `app.css`
- Light and dark themes defined with HSL values
- Semantic color tokens (primary, secondary, muted, accent, destructive, etc.)
- Colors automatically adapt to theme changes

**Typography:**
- Font: System font stack (system-ui, -apple-system, Segoe UI, Roboto, etc.)
- Clean, readable sans-serif throughout
- Responsive font sizing with Tailwind utilities

**UI Components:**
- Import from `$lib/components/ui/*` (e.g., Button, Card, Input, Label)
- Layout primitives from `$lib/layouts` (Container, Stack, Grid, Flex, Section)
- Consistent spacing and styling patterns
- Built-in hover states and transitions

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

1. **Homepage** (`routes/+page.svelte`)
   - Clean page header with title and subtitle
   - Quick links cards with descriptions
   - Project statistics overview

2. **Projects Index** (`routes/projects/+page.svelte`)
   - Grid layout with project cards
   - Fuse.js client-side search
   - Category filtering
   - 3D model indicators
   - Node graph visualization toggle

3. **Project Detail** (`routes/projects/[slug]/+page.svelte`)
   - Dynamic routes loaded via `+page.server.ts`
   - Interactive 3D model viewer (Three.js)
   - Image gallery with pixelation effect
   - Markdown content rendering
   - Tabbed interface for different content types
   - Links to GitHub/website

4. **GIS Map** (`routes/gis/+page.svelte`)
   - Interactive Leaflet map
   - Location markers with categories
   - Password-protected private locations
   - Modal for location details

5. **Contact Form** (`routes/contact/+page.svelte`)
   - Form inputs with validation
   - Zod validation (client-side and server-side)
   - API endpoint for form submission

6. **About Page** (`routes/about/+page.svelte`)
   - Person-specific qualifications timeline from PocketBase
   - Services grid from PocketBase (can be Family or Personal)
   - Skills display organized by category (person-filtered)

### Data Flow

1. **Runtime Data Fetching**
   - PocketBase data fetched at request time via REST API in `+page.server.ts` files
   - **Multi-tenant filtering**: Data filtered by person, scope, and visibility
   - Enables real-time content updates without rebuilds
   - Images served directly from PocketBase file endpoints
   - Can be cached using SvelteKit's built-in caching
   - Requires PocketBase to be running and accessible
   - Access rules enforce data isolation at the API level

2. **Client-Side Interactivity**
   - Search/filter using Fuse.js
   - 3D model viewer (lazy loaded)
   - Interactive maps with Leaflet
   - Node graph visualization with D3
   - Contact form validation
   - Theme toggle using Svelte stores

3. **Deployment Options**
   - **Node.js server**: Build with `npm run build`, run with `npm start`
   - **Docker**: Deploy with `docker compose up -d --build`
   - **Any Node.js platform**: Deploy `build/` directory

### Build Process
- **SvelteKit** handles build orchestration
- **Vite** for fast development and optimized builds
- **TypeScript** compilation
- **Tailwind CSS** processing
- Static file handling for 3D models
- Component pre-rendering where possible
- Automatic code splitting

### Development Notes

- Dev server runs on **port 3050** by default (SvelteKit/Vite)
- PocketBase runs on **port 8090** by default
- **Docker Compose** recommended for easy setup: `npm run docker:up`
- Hot module replacement enabled
- TypeScript strict mode enabled
- 3D models should be optimized .glb files
- Images served directly from PocketBase
- To update content: modify in PocketBase admin → changes appear immediately
- Map requires password for private locations (stored in PocketBase)

**Multi-Tenant Setup:**
1. Import schema: `npm run import:schema`
2. Run migration: `npm run migrate:multitenant`
3. Verify in PocketBase admin: Check persons collection has 4 records
4. Use person-filtered data fetching: `getProjectsByPerson('chris')`

**Data Access Patterns:**
- Use `getProjectsByPerson(slug)` for person-specific sites
- Use `getAllProjects()` and filter by `scope === 'Family'` for family hub
- Content visibility respects authentication state and person ownership
- All data fetching functions handle multi-tenant permissions automatically

### SvelteKit Patterns

**Load Functions (+page.server.ts):**
```typescript
import { getProjectsByPerson } from '$lib/pocketbase';

export async function load({ locals }) {
  const projects = await getProjectsByPerson(locals.personSlug);
  return { projects };
}
```

**Reactive Stores:**
```typescript
import { writable } from 'svelte/store';

export const theme = writable<'light' | 'dark'>('dark');
```

**Reactive Declarations:**
```svelte
<script lang="ts">
  let count = 0;
  $: doubled = count * 2; // Automatically recomputes when count changes
</script>
```

**Event Handlers:**
```svelte
<button on:click={() => count++}>
  Clicked {count} times
</button>
```

### Performance Optimizations

- **Runtime Data Fetching**: Data fetched on demand with optional caching
- **Image Serving**: Images served directly from PocketBase with caching headers
- **Code Splitting**: Automatic with SvelteKit
- **Lazy Loading**: 3D models and heavy components load on demand
- **SSR**: Server-side rendering for fast initial load
- **PWA**: Progressive Web App with offline support
- **Docker Compose**: Optimized development environment with health checks
- **Multi-Tenant Efficiency**: Single database serves all sites with smart filtering

### Migration from Next.js

This project was migrated from Next.js to SvelteKit for:
- **~40% less boilerplate code**: No "use client", useState, useEffect needed
- **Simpler multi-tenancy**: `event.locals.personSlug` vs header manipulation
- **Better PWA support**: @vite-pwa/sveltekit is actively maintained
- **Improved DX**: Reactive by default, scoped styles, built-in stores

The previous Next.js implementation is archived in `nextjs-archive/` for reference.

### Future Enhancements

**Subdomain Routing:**
Configure hooks.server.ts to route subdomains to person-specific content:
```typescript
// hooks.server.ts
const subdomain = hostname.split('.')[0];
if (['chris', 'julia', 'theo', 'jack'].includes(subdomain)) {
  event.locals.personSlug = subdomain;
}
```

**Person-Specific Themes:**
Each family member can have custom color schemes and styling preferences.

**Family Hub Features:**
- Collaborative project showcase
- Family timeline with all members' highlights
- Shared photo galleries and locations
- Family member directory with avatars

See `MULTITENANT_ARCHITECTURE.md` for detailed implementation guidance.
