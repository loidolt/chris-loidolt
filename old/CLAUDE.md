# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Gatsby-based portfolio website for Chris Loidolt showcasing design and engineering projects. The site uses Airtable as a CMS for project data and includes 3D model viewing capabilities, search functionality, and a contact form.

## Common Commands

### Development
- `npm run develop` or `npm start` - Start development server
- `gatsby develop` - Alternative development server command
- `gatsby clean` - Clean Gatsby cache and build artifacts

### Building & Deployment
- `npm run build` - Build production site
- `gatsby build` - Alternative build command
- `npm run serve` - Serve built site locally
- `gatsby serve` - Alternative serve command

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm test` - Run Jest tests

### Maintenance
- `npm run clean` - Clean cache and node_modules

## Architecture

### Data Sources
- **Airtable**: Primary CMS for project data, websites, services, and qualifications
- **Environment Variables**: Airtable API keys and base IDs stored in `.env` files
- **Static Files**: 3D models (.glb files) stored in `/static/models/`

### Key Technologies
- **Gatsby**: Static site generator with GraphQL data layer
- **React**: Component framework
- **Material-UI**: Component library and theming
- **Three.js**: 3D model rendering via @react-three/fiber
- **Algolia**: Search functionality
- **Airtable**: Headless CMS

### Directory Structure
- `/src/components/` - React components organized by feature
  - `/algolia/` - Search components
  - `/graph/` - 3D visualization and force graph
  - `/layout/` - Layout components (header, footer, navigation)
  - `/posts/` - Project display components including 3D model viewer
- `/src/pages/` - Gatsby page components
- `/src/templates/` - Dynamic page templates
- `/functions/` - Cloudflare Functions for API endpoints
- `/static/models/` - 3D model files (.glb format)

### Environment Configuration
Required environment variables:
- `AIRTABLE_API_KEY` - Airtable API access
- `AIRTABLE_POSTS_BASEID` - Airtable base ID
- `AIRTABLE_POSTS_TABLENAME` - Projects table name
- `AIRTABLE_WEBSITES_TABLENAME` - Websites table name
- `AIRTABLE_SERVICES_TABLENAME` - Services table name
- `AIRTABLE_QUALIFICATIONS_TABLENAME` - Qualifications table name
- `GATSBY_ALGOLIA_APP_ID` - Algolia search app ID
- `GATSBY_ALGOLIA_ADMIN_KEY` - Algolia admin key

### Key Features
- **3D Model Viewing**: Projects include interactive 3D models using Three.js
- **Search**: Algolia-powered search across projects
- **Force Graph**: Interactive visualization of project relationships
- **Contact Form**: Handled by Cloudflare Functions
- **Responsive Design**: Material-UI theming system

### Testing
- Jest configuration with Gatsby-specific setup
- Test environment configured for jsdom
- Component testing with @testing-library/react

### Build Process
- Gatsby's standard build process
- Sharp for image optimization
- Sitemap and robots.txt generation
- Static file handling for 3D models