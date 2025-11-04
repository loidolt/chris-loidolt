# AGENTS.md - Coding Agent Guidelines

## Commands
- **Dev**: `npm run dev:local` (PocketBase + SvelteKit), `npm run dev` (SvelteKit only on :3050)
- **Build/Check**: `npm run build`, `npm run check` (type checking), `npm run preview` (test production build)
- **PocketBase**: `npm run pocketbase:setup` (one-time), `npm run pocketbase:local` (run locally on :8090)
- **Docker**: `npm run docker:up`, `npm run docker:down`, `npm run docker:logs`
- **No test suite**: This project has no unit/integration tests

## Import Conventions
- **Aliases**: Use `$lib/` for src/lib imports, `$app/` for SvelteKit modules
- **Order**: External packages → SvelteKit modules → $lib imports → relative imports
- **Examples**: `import { page } from '$app/stores'`, `import { getAllProjects } from '$lib/pocketbase'`

## Code Style
- **TypeScript strict mode**: All code must be strongly typed, no `any` unless absolutely necessary
- **Svelte 5 syntax**: Use runes (`$state`, `$derived`, `$effect`) instead of legacy reactive statements where appropriate
- **Error handling**: Try-catch with console.error, return empty arrays/null for missing data (prevent crashes)
- **Async/await**: Preferred over promises for all async operations
- **Comments**: JSDoc for functions, inline comments for complex logic only

## Naming Conventions
- **Files**: kebab-case for all files (`project-detail.svelte`, `map-utils.ts`)
- **Components**: PascalCase (`.svelte` files) but kebab-case filenames
- **Functions**: camelCase (`getAllProjects`, `getPersonBySlug`)
- **Interfaces**: PascalCase (`Project`, `Person`, `Location`)
- **Constants**: SCREAMING_SNAKE_CASE for true constants (`CACHE_TTL`, `ENV`)

## Multi-Tenant Architecture
- **Person-specific data**: Use `getProjectsByPerson(slug)`, `getSkillsByPerson(slug)`, etc.
- **Family data**: Filter by `scope === 'Family'` or use dedicated family queries
- **Access control**: PocketBase enforces visibility (Public/Family/Private) via API rules automatically
- **Subdomain detection**: `event.locals.personSlug` set in `hooks.server.ts` (chris/julia/theo/jack/family)

## SvelteKit Patterns
- **Server loads**: Data fetching in `+page.server.ts` with `async load({ locals })` returning serializable data
- **Client reactivity**: Use `$derived` for computed values, `$state` for mutable state, `$effect` for side effects
- **Stores**: Import from `$lib/stores/`, access with `$store` syntax (e.g., `$theme`, `$page`)
- **No "use client"**: Svelte is reactive by default, no need for client directives like React

## Additional Notes
- **No linter/formatter**: Project has no ESLint or Prettier config, follow existing code patterns
- **PocketBase required**: All data fetched at runtime, ensure PocketBase is running for development
- **See CLAUDE.md**: Comprehensive project documentation for architecture, features, and deployment
