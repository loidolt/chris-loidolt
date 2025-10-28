# Chris Loidolt - Multi-Tenant Family Portfolio

A modern, multi-tenant family portfolio system built with **SvelteKit** and **PocketBase**. This application supports 5 separate sites under one codebase:

- **loidolt.space** - Family hub with shared content
- **chris.loidolt.space** - Chris's personal portfolio
- **julia.loidolt.space** - Julia's personal site
- **theo.loidolt.space** - Theo's personal site
- **jack.loidolt.space** - Jack's personal site

## Features

- 🎯 **Multi-Tenant Architecture** - Single codebase, multiple sites with subdomain routing
- 🚀 **SvelteKit** - Modern framework with excellent DX and performance
- 📦 **PocketBase** - Self-hosted CMS with real-time updates
- 🎨 **Terminal Theme** - Clean monospace aesthetic inspired by developer tools
- 📱 **PWA Support** - Progressive Web App with offline capabilities
- 🗺️ **Interactive Maps** - Leaflet-based GIS with location markers
- 🎨 **3D Viewer** - Three.js integration for 3D models
- 🔍 **Client-Side Search** - Fast fuzzy search with Fuse.js
- 🎯 **Type-Safe** - Full TypeScript support
- 🐳 **Docker Ready** - Easy deployment with Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Docker & Docker Compose (optional, recommended)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your PocketBase credentials
```

### Development

**Option 1: Docker Compose (Recommended)**
```bash
# Start PocketBase + SvelteKit together
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

**Option 2: Manual Setup**
```bash
# Start PocketBase separately (on port 8090)
# Then start SvelteKit dev server
npm run dev
```

Your application will be available at `http://localhost:3050`.

### Initial Setup

```bash
# Initialize PocketBase admin user
npm run pocketbase:init

# Import database schema
npm run import:schema

# (Optional) Migrate existing data to multi-tenant structure
npm run migrate:multitenant
```

## Building for Production

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Start the production server:

```bash
npm start
```

## Multi-Tenant Architecture

This project uses a sophisticated multi-tenant system:

- **Person-Specific Data**: Each family member has their own projects, skills, and qualifications
- **Flexible Scoping**: Content can be Family-wide or Personal
- **Granular Privacy**: Public, Family, or Private visibility levels
- **Subdomain Routing**: Automatic person detection via `hooks.server.ts`

See `MULTITENANT_ARCHITECTURE.md` for detailed documentation.

## Project Structure

```
├── src/
│   ├── routes/              # SvelteKit pages and layouts
│   ├── lib/
│   │   ├── components/      # Svelte components
│   │   ├── layouts/         # Reusable layout components
│   │   ├── stores/          # Svelte stores (theme, filters, etc.)
│   │   └── pocketbase.ts    # PocketBase data fetching
│   ├── hooks.server.ts      # Multi-tenant subdomain detection
│   └── app.css              # Global styles
├── static/                  # Static assets
├── pb_schema.json           # PocketBase schema (version controlled)
├── docker-compose.yml       # Docker services configuration
└── nextjs-archive/          # Archived Next.js implementation
```

## Available Scripts

### Development
- `npm run dev` - Start development server (port 3050)
- `npm run check` - Run Svelte type checking
- `npm run check:watch` - Watch mode for type checking

### Production
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm start` - Start production server

### Docker
- `npm run docker:up` - Start all services
- `npm run docker:down` - Stop all services
- `npm run docker:logs` - View logs
- `npm run docker:rebuild` - Rebuild and restart
- `npm run docker:clean` - Clean all data

### PocketBase
- `npm run pocketbase:init` - Create admin user
- `npm run import:schema` - Import schema from JSON
- `npm run export:schema` - Export schema to JSON

### Data Migration
- `npm run export:airtable` - Export from Airtable
- `npm run import:pocketbase` - Import to PocketBase
- `npm run migrate:multitenant` - Migrate to multi-tenant

### PWA
- `npm run pwa:icons` - Generate PWA icons

## Deployment

### Docker Deployment

```bash
# Build for production
docker compose up -d --build

# Deploy to any Docker-compatible platform:
# - AWS ECS
# - Google Cloud Run
# - Azure Container Apps
# - Digital Ocean
# - Fly.io
# - Railway
```

### Traditional Node.js

```bash
npm run build
npm start
```

Deploy the `build/` directory and `package.json` to your Node.js hosting platform.

## Technology Stack

- **Frontend**: SvelteKit 2.0, Svelte 5, TypeScript
- **Backend**: PocketBase (self-hosted SQLite CMS)
- **Styling**: Tailwind CSS 3
- **3D**: Three.js
- **Maps**: Leaflet
- **Search**: Fuse.js
- **PWA**: @vite-pwa/sveltekit
- **Build**: Vite 7

## Migration from Next.js

This project was migrated from Next.js to SvelteKit for:
- ~40% less boilerplate code
- Simpler multi-tenant implementation
- Better PWA support
- Improved developer experience

The previous Next.js implementation is archived in `nextjs-archive/` for reference.

## Documentation

- `CLAUDE.md` - Instructions for AI assistant (Claude Code)
- `MULTITENANT_ARCHITECTURE.md` - Multi-tenant system documentation
- `MIGRATION_STEPS.md` - Setup and migration guide
- `SVELTEKIT_MIGRATION_SUMMARY.md` - Migration comparison and benefits
- `PWA_SETUP.md` - Progressive Web App configuration
- `TESTING_GUIDE.md` - Testing instructions

## Contributing

This is a personal portfolio project, but feel free to fork and adapt for your own use!

## License

MIT License - see LICENSE file for details

---

Built with ❤️ using SvelteKit and PocketBase
