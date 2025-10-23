# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a terminal-inspired portfolio website for Chris Loidolt showcasing design and engineering projects. Built with React Router (Remix) and deployed to Cloudflare Workers, the site features a balanced terminal aesthetic with modern UI elements where needed. It uses Airtable as a CMS for project data and includes 3D model viewing, client-side search, and a contact form.

## Common Commands

### Development
- `npm run dev` - Start development server (runs on http://localhost:5173)
- `npm run build` - Build production site
- `npm run typecheck` - Run TypeScript type checking

### Deployment
- `npm run deploy` - Build and deploy to Cloudflare Pages
- `npm run dev:wrangler` - Test with Wrangler locally
- `npm run start` - Serve production build locally with Wrangler

## Architecture

### Data Sources
- **Airtable**: Primary CMS for project data, websites, services, and qualifications
- **Environment Variables**: Airtable API keys and base IDs stored in `.env` files
- **Static Files**: 3D models (.glb files) stored in `/static/models/`

### Key Technologies
- **React Router 7** (formerly Remix): Full-stack React framework
- **Cloudflare Workers/Pages**: Edge deployment platform
- **React**: Component framework
- **Tailwind CSS v4**: Utility-first CSS with custom terminal theme
- **Three.js**: 3D model rendering via @react-three/fiber
- **Fuse.js**: Client-side fuzzy search
- **Airtable**: Headless CMS
- **TypeScript**: Type safety throughout

### Directory Structure
```
app/
├── app.css                       # Tailwind + terminal theme
├── root.tsx                      # Root layout with error boundary
├── components/
│   ├── Layout.tsx               # Main layout with terminal header/footer
│   └── ModelViewer.tsx          # Three.js 3D model viewer
├── routes/
│   ├── home.tsx                 # Homepage with animated terminal
│   ├── projects.tsx             # Project grid with search/filter
│   ├── projects.$slug.tsx       # Individual project detail page
│   ├── about.tsx                # About page with qualifications
│   └── contact.tsx              # Contact form
├── services/
│   └── airtable.server.ts       # Airtable data fetching utilities
static/models/                    # 3D model files (.glb format)
public/                           # Static assets
```

### Terminal Design System

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
- `terminal-amber`: #d29922 (labels, prompts)
- `terminal-red`: #f85149 (errors)
- `terminal-blue`: #58a6ff

**Typography:**
- Font: JetBrains Mono (monospace throughout)
- No ligatures for authentic terminal feel

**UI Patterns:**
- Bracketed links: `[like this]`
- Command prompts: `$ command`
- ASCII box-drawing characters for borders
- Terminal window chrome (colored dots)
- Blinking cursor animation

### Environment Configuration

Required environment variables:
```bash
# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_POSTS_BASEID=your_base_id
AIRTABLE_POSTS_TABLENAME=Projects
AIRTABLE_QUALIFICATIONS_TABLENAME=Qualifications
AIRTABLE_WEBSITES_TABLENAME=Websites
AIRTABLE_SERVICES_TABLENAME=Services

# Contact Form Email (Cloudflare Email Routing)
CONTACT_EMAIL_TO=your-email@example.com
```

### Key Features

1. **Homepage**
   - Animated terminal typing effect
   - Command-style help section
   - Quick stats cards

2. **Projects Index**
   - Grid layout with terminal-styled cards
   - Fuse.js client-side search
   - Category filtering
   - 3D model indicators

3. **Project Detail**
   - Interactive 3D model viewer (Three.js)
   - Image gallery
   - Metadata display
   - Links to GitHub/website

4. **Contact Form**
   - Terminal-styled form inputs
   - Zod validation
   - Form submission handling (ready for Cloudflare Email Workers)

5. **About Page**
   - Qualifications timeline from Airtable
   - Services grid from Airtable
   - Skills display in JSON format

### Data Flow

1. **Server-Side Data Loading (Loaders)**
   - Routes use React Router loaders to fetch data server-side
   - Airtable data fetched via `app/services/airtable.server.ts`
   - Data available immediately on page load (SSR)

2. **Client-Side Features**
   - Search/filter using Fuse.js (no external service needed)
   - 3D model viewer runs client-side only
   - Form validation with Zod

3. **Deployment**
   - Builds to `./build/client` and `./build/server`
   - Deployed to Cloudflare Pages
   - Edge-rendered for global performance

### Build Process
- Vite-based build system
- TypeScript compilation
- Tailwind CSS processing with custom theme
- Static file handling for 3D models
- SSR builds for Cloudflare Workers

### Development Notes

- Dev server runs on port 5173 by default
- Hot module replacement enabled
- TypeScript strict mode enabled
- All routes are SSR by default
- 3D models should be optimized .glb files
- Images served from Airtable or static directory
