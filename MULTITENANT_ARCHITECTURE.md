# Multi-Tenant Architecture

This document describes the multi-tenant architecture that supports multiple family member sites from a single PocketBase instance.

## Overview

The architecture supports:
- **1 family hub site**: `loidolt.space` with shared family data
- **4 person-specific sites**: `chris.loidolt.space`, `julia.loidolt.space`, `theo.loidolt.space`, `jack.loidolt.space`

Each site can display its own content while also showing shared family content. Data can be scoped as **Family** or **Personal**, and visibility can be set to **Public**, **Family**, or **Private**.

## Schema Changes

### New Collections

#### `persons`
Represents each family member:
- `name` (text, required): Full name (e.g., "Chris Loidolt")
- `slug` (text, required, unique): URL-safe identifier (e.g., "chris")
- `email` (email, optional): Contact email
- `bio` (editor, optional): Biography/description
- `avatar` (file, optional): Profile picture
- `user` (relation to users, optional): Link to user account for authentication

#### `qualifications`
Person-specific education/certifications:
- `title` (text, required): Qualification title
- `institution` (text): Educational institution
- `year` (text): Year obtained
- `description` (editor): Details
- `person` (relation to persons, **required**): Owner of this qualification

### Updated Collections

The following collections now support multi-tenancy with these new fields:

#### `projects`
- `person` (relation to persons, **multi-select**): Owners/contributors (supports collaborative projects)
- `scope` (select): "Family" or "Personal"
- `visibility` (select): "Public", "Family", or "Private"

#### `services`
- `person` (relation to persons, **multi-select**): Service providers
- `scope` (select): "Family" or "Personal"
- `visibility` (select): "Public", "Family", or "Private"

#### `locations`
- `person` (relation to persons, **multi-select**): Associated persons
- `scope` (select): "Family" or "Personal"
- `visibility` (select): "Public", "Family", or "Private"

#### `skills`
- `person` (relation to persons, **multi-select**): Skill owners
- `scope` (select): "Family" or "Personal"
- `visibility` (select): "Public", "Family", or "Private"

## Data Access Rules

### Visibility Levels

1. **Public** (`visibility = "Public"`)
   - Viewable by anyone (authenticated or not)
   - Displayed on public-facing pages
   - Examples: Published projects, public services

2. **Family** (`visibility = "Family"`)
   - Viewable only by authenticated family members
   - Hidden from public view
   - Examples: Family-only locations, internal projects

3. **Private** (`visibility = "Private"`)
   - Viewable only by the owner(s) and admins
   - Completely restricted
   - Examples: Draft projects, personal notes

### Scope Types

1. **Family** (`scope = "Family"`)
   - Shared across all family member sites
   - Displayed on `loidolt.space` and relevant person sites
   - Examples: Family trips (locations), collaborative projects, family services

2. **Personal** (`scope = "Personal"`)
   - Specific to individual(s)
   - Displayed on person-specific sites only
   - Examples: Personal projects, individual skills

### Access Rules (PocketBase API Rules)

**List/View Rules:**
```javascript
visibility = "Public" ||
(visibility = "Family" && @request.auth.id != "") ||
(visibility = "Private" && person.user.id ?= @request.auth.id) ||
(visibility = "" && <legacy_rule>)
```

**Update/Delete Rules:**
```javascript
@request.auth.id != "" &&
(person.user.id ?= @request.auth.id || person.user.id = "")
```

This ensures:
- Public items are accessible to everyone
- Family items require authentication
- Private items require ownership
- Owners can modify/delete their own content
- Legacy data (without visibility set) falls back to original behavior

## Migration Steps

### 1. Import Updated Schema

```bash
npm run import:schema
```

This creates the `persons` and `qualifications` collections and adds new fields to existing collections.

### 2. Run Migration Script

```bash
npm run migrate:multitenant
```

This script:
1. Creates person records for Chris, Julia, Theo, and Jack
2. Links Chris to the existing admin user account
3. Migrates all existing projects/skills to Chris's person record
4. Sets default scope/visibility values on existing data

### 3. Verify in PocketBase Admin

1. Open PocketBase admin panel: `http://localhost:8090/_/`
2. Check the `persons` collection has 4 records
3. Verify existing projects/skills have `person` relations set
4. Confirm scope/visibility fields are populated

## Usage in Code

### TypeScript Interfaces

New interfaces available in `src/lib/pocketbase.ts`:

```typescript
interface Person {
  id: string;
  name: string;
  slug: string;
  email?: string;
  bio?: string;
  avatar?: string;
  user?: string;
}

interface Project {
  // ... existing fields
  person?: string[]; // Array of person IDs
  scope?: 'Family' | 'Personal';
  visibility?: 'Public' | 'Family' | 'Private';
}

// Similar updates for Service, Location, Skill, Qualification
```

### Data Fetching Functions

#### Fetch All Persons
```typescript
import { getAllPersons } from '@/lib/pocketbase';

const persons = await getAllPersons();
```

#### Fetch Person by Slug
```typescript
import { getPersonBySlug } from '@/lib/pocketbase';

const chris = await getPersonBySlug('chris');
```

#### Fetch Person-Specific Data
```typescript
import {
  getProjectsByPerson,
  getSkillsByPerson,
  getQualificationsByPerson
} from '@/lib/pocketbase';

// Get all projects for Chris
const chrisProjects = await getProjectsByPerson('chris');

// Get all skills for Julia
const juliaSkills = await getSkillsByPerson('julia');

// Get qualifications for Theo
const theoQuals = await getQualificationsByPerson('theo');
```

#### Filter by Scope/Visibility (Client-Side)
```typescript
import { getAllProjects } from '@/lib/pocketbase';

const projects = await getAllProjects();

// Filter for family-wide projects
const familyProjects = projects.filter(p => p.scope === 'Family');

// Filter for public projects
const publicProjects = projects.filter(p => p.visibility === 'Public');

// Filter for Chris's personal projects
const chrisPersonal = projects.filter(p =>
  p.person?.includes(chrisId) && p.scope === 'Personal'
);
```

## Example Use Cases

### 1. Chris's Personal Portfolio Site (`chris.loidolt.space`)

```typescript
// app/projects/page.tsx (Chris's site)
export default async function ProjectsPage() {
  // Fetch only Chris's projects
  const projects = await getProjectsByPerson('chris');

  return <ProjectsGrid projects={projects} />;
}
```

### 2. Family Hub Site (`loidolt.space`)

```typescript
// app/page.tsx (Family hub)
export default async function HomePage() {
  const persons = await getAllPersons();
  const allProjects = await getAllProjects();

  // Filter for family-wide projects
  const familyProjects = allProjects.filter(p => p.scope === 'Family');

  return (
    <>
      <FamilyMembers persons={persons} />
      <CollaborativeProjects projects={familyProjects} />
    </>
  );
}
```

### 3. Collaborative Projects

```typescript
// Create a project with multiple contributors
const project = {
  title: 'Family Website',
  person: [chrisId, juliaId], // Chris and Julia collaborate
  scope: 'Family',
  visibility: 'Public',
  // ... other fields
};

await pb.collection('projects').create(project);
```

### 4. Private vs Public Content

```typescript
// Public project - visible to everyone
const publicProject = {
  title: 'Open Source Tool',
  person: [chrisId],
  scope: 'Personal',
  visibility: 'Public', // ← Anyone can see
  status: 'Published',
};

// Private project - only Chris can see
const privateProject = {
  title: 'Work in Progress',
  person: [chrisId],
  scope: 'Personal',
  visibility: 'Private', // ← Only Chris can see
  status: 'Draft',
};
```

## Future Enhancements

### Subdomain Routing
Configure your Next.js app to route subdomains to person-specific content:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Extract subdomain
  const subdomain = hostname.split('.')[0];

  // Map subdomain to person slug
  if (['chris', 'julia', 'theo', 'jack'].includes(subdomain)) {
    request.headers.set('x-person-slug', subdomain);
  }

  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}
```

Then use in pages:

```typescript
import { headers } from 'next/headers';
import { getProjectsByPerson } from '@/lib/pocketbase';

export default async function ProjectsPage() {
  const headersList = await headers();
  const personSlug = headersList.get('x-person-slug') || 'chris';

  const projects = await getProjectsByPerson(personSlug);

  return <ProjectsGrid projects={projects} person={personSlug} />;
}
```

### Person-Specific Themes
Each person can have custom styling:

```typescript
// lib/themes.ts
export const personThemes = {
  chris: { primary: '#3fb950', accent: '#39c5cf' },
  julia: { primary: '#ff6b9d', accent: '#c44569' },
  theo: { primary: '#4834d4', accent: '#686de0' },
  jack: { primary: '#f39c12', accent: '#e67e22' },
};
```

## Benefits

✅ **Flexible Data Scoping**: Items can be family-wide or person-specific
✅ **Granular Privacy Controls**: Public, family-only, or private visibility
✅ **Collaborative Features**: Multi-person projects supported
✅ **Scalable**: Easy to add more family members
✅ **Secure**: Proper data isolation with family read-only access
✅ **Future-Proof**: Not all persons need all collection types
✅ **Single Database**: All data in one PocketBase instance

## Troubleshooting

### Person Not Found
Ensure person records exist in the `persons` collection with correct slugs.

### Access Denied
Check:
1. User is authenticated (for Family/Private content)
2. `person.user` relation is set correctly
3. Visibility/scope values are set appropriately

### Migration Failed
1. Ensure PocketBase is running: `npm run docker:up`
2. Check schema is imported: `npm run import:schema`
3. Verify .env.local has correct credentials
4. Check PocketBase logs: `npm run docker:logs`

## Next Steps

1. ✅ Update schema and run migration
2. Update frontend pages to use person-filtered data
3. Implement subdomain routing (optional)
4. Create person-specific themes (optional)
5. Build family hub homepage at `loidolt.space`
6. Deploy with separate subdomains configured
