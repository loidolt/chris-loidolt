# Multi-Tenant Architecture - Summary of Changes

## Overview

This refactoring enables your PocketBase instance to support **5 separate sites** from a single database:
- **loidolt.space** - Family hub with shared content
- **chris.loidolt.space** - Chris's personal site
- **julia.loidolt.space** - Julia's personal site
- **theo.loidolt.space** - Theo's personal site
- **jack.loidolt.space** - Jack's personal site

## What Changed

### 1. Database Schema (`pb_schema.json`)

#### New Collections
- **persons** - Represents each family member
  - name, slug, email, bio, avatar, user (optional relation)
  - Enables person-based data filtering
  - Decouples person identity from authentication

- **qualifications** - Person-specific education/certifications
  - title, institution, year, description, person (required)
  - Replaces the old approach of fetching qualifications without person relation

#### Updated Collections
All content collections now have these fields:
- **person** (relation, multi-select) - Owners/contributors
- **scope** (select: Family/Personal) - Data scope level
- **visibility** (select: Public/Family/Private) - Access control

Updated collections:
- `projects`
- `services`
- `locations`
- `skills`

#### Updated Access Rules
All collections now have sophisticated multi-tenant access rules:
- **Public** items: visible to everyone
- **Family** items: visible to authenticated family members
- **Private** items: visible only to owners
- **Backward compatible**: Legacy data without visibility falls back to original behavior

### 2. TypeScript Interfaces (`src/lib/pocketbase.ts`)

#### New Interfaces
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

interface Skill {
  id: string;
  name: string;
  summary?: string;
  type?: 'Skills' | 'Programming';
  // ... and new multi-tenant fields
}
```

#### Updated Interfaces
All existing interfaces now include:
```typescript
person?: string[]; // For multi-select person relations
scope?: 'Family' | 'Personal';
visibility?: 'Public' | 'Family' | 'Private';
```

Updated interfaces:
- `Project`
- `Service`
- `Location`
- `Qualification` (now requires person field)

#### New Data Fetching Functions
```typescript
// Person management
getAllPersons(): Promise<Person[]>
getPersonBySlug(slug: string): Promise<Person | null>

// Person-filtered data
getProjectsByPerson(personSlug: string): Promise<Project[]>
getSkillsByPerson(personSlug: string): Promise<Skill[]>
getQualificationsByPerson(personSlug: string): Promise<Qualification[]>
```

### 3. Migration Script (`scripts/migrate-multitenant.ts`)

New script to migrate existing data:
- Creates person records for Chris, Julia, Theo, Jack
- Links Chris to existing admin user
- Migrates all existing projects/skills to Chris
- Sets default scope/visibility values
- Idempotent - safe to run multiple times

Run with: `npm run migrate:multitenant`

### 4. Package.json

Added new npm script:
```json
"migrate:multitenant": "tsx scripts/migrate-multitenant.ts"
```

### 5. Documentation

#### New Files
- **MULTITENANT_ARCHITECTURE.md** - Comprehensive architecture guide
  - Schema details
  - Access rules explanation
  - Usage examples
  - Future enhancements (subdomain routing, themes)

- **MIGRATION_STEPS.md** - Step-by-step migration guide
  - Prerequisites
  - Migration process
  - Verification steps
  - Troubleshooting
  - Rollback instructions

- **MULTITENANT_SUMMARY.md** - This file
  - High-level overview of all changes

## Files Modified

### Schema & Configuration
- ✅ `pb_schema.json` - Updated with new collections and fields
- ✅ `package.json` - Added migration script

### TypeScript/Code
- ✅ `src/lib/pocketbase.ts` - Updated interfaces and added data fetching functions

### Scripts
- ✅ `scripts/migrate-multitenant.ts` - New migration script

### Documentation
- ✅ `MULTITENANT_ARCHITECTURE.md` - New architecture guide
- ✅ `MIGRATION_STEPS.md` - New migration guide
- ✅ `MULTITENANT_SUMMARY.md` - New summary document

## Migration Workflow

```
1. Backup current database
   ↓
2. Import updated schema (npm run import:schema)
   ↓
3. Run migration script (npm run migrate:multitenant)
   ↓
4. Verify in PocketBase admin
   ↓
5. Update frontend code to use person-filtered functions
   ↓
6. Deploy with subdomain routing (optional)
```

## Key Features

### ✅ Flexible Data Scoping
Items can be marked as:
- **Family**: Shared across all sites (locations, collaborative projects)
- **Personal**: Specific to individuals (personal projects, skills)

### ✅ Granular Privacy Controls
Content visibility:
- **Public**: Anyone can view
- **Family**: Only authenticated family members
- **Private**: Only the owner(s) and admins

### ✅ Collaborative Features
- Multi-person relations support collaborative projects
- Family members can work together on shared items

### ✅ Secure Data Isolation
- PocketBase API rules enforce proper access control
- Family members have read-only access to others' unpublished work
- Private items remain completely isolated

### ✅ Backward Compatible
- Legacy data without visibility/scope defaults to original behavior
- Existing functions continue to work
- New functions added for person-filtered queries

### ✅ Scalable
- Easy to add more family members
- Collections are flexible - not all persons need all types
- Single database for all sites

## Before & After

### Before
```typescript
// Only one way to fetch projects
const projects = await getAllProjects();

// Qualifications not person-specific
const qualifications = await getQualifications();
```

### After
```typescript
// Can fetch all projects OR person-specific
const allProjects = await getAllProjects();
const chrisProjects = await getProjectsByPerson('chris');

// Qualifications now person-specific
const chrisQuals = await getQualificationsByPerson('chris');

// Access to person data
const persons = await getAllPersons();
const chris = await getPersonBySlug('chris');
```

## Example Use Cases

### 1. Chris's Personal Site
```typescript
const chris = await getPersonBySlug('chris');
const projects = await getProjectsByPerson('chris');
const skills = await getSkillsByPerson('chris');
const qualifications = await getQualificationsByPerson('chris');

// Show only Chris's content
```

### 2. Family Hub Site
```typescript
const persons = await getAllPersons();
const allProjects = await getAllProjects();

// Filter for family-wide items
const familyProjects = allProjects.filter(p => p.scope === 'Family');
const publicProjects = allProjects.filter(p => p.visibility === 'Public');

// Show family members + shared content
```

### 3. Collaborative Project
```typescript
// Create project with Chris and Julia
const project = {
  title: 'Family Website',
  person: [chrisId, juliaId],
  scope: 'Family',
  visibility: 'Public',
  // ... other fields
};

// Shows up on both chris.loidolt.space and julia.loidolt.space
```

## Next Steps

### Immediate
1. ✅ Run migration: `npm run migrate:multitenant`
2. ✅ Verify data in PocketBase admin
3. Update frontend pages to use person-filtered functions

### Future Enhancements
1. Implement subdomain routing in Next.js middleware
2. Create person-specific themes/styling
3. Build family hub homepage
4. Add person avatars to UI
5. Create person profile pages
6. Deploy with DNS configured for subdomains

## Benefits Summary

| Feature | Before | After |
|---------|--------|-------|
| **Sites Supported** | 1 | 5 (1 hub + 4 personal) |
| **Data Ownership** | None | Person-specific |
| **Privacy Levels** | Basic | Public/Family/Private |
| **Collaboration** | No | Yes (multi-person relations) |
| **Authentication** | Single admin | Per-person (optional) |
| **Scalability** | Limited | Easy to add more |

## Questions?

- **Architecture details**: See `MULTITENANT_ARCHITECTURE.md`
- **Migration help**: See `MIGRATION_STEPS.md`
- **Troubleshooting**: Check PocketBase logs and admin panel
- **Schema reference**: Review `pb_schema.json`

---

**Status**: ✅ Implementation complete - Ready for migration
**Last Updated**: 2025-10-27
