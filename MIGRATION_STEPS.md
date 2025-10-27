# Multi-Tenant Migration Steps

Quick guide to migrate your PocketBase instance to support the multi-tenant architecture.

## Prerequisites

- ✅ Docker and Docker Compose installed
- ✅ `.env.local` file with PocketBase credentials
- ✅ No uncommitted changes (recommended - commit current state first)

## Migration Process

### Step 1: Backup Current Database (Recommended)

```bash
# Stop PocketBase if running
npm run docker:down

# Create backup of pb_data directory
cp -r pb_data pb_data.backup

# Restart services
npm run docker:up
```

### Step 2: Export Current Schema (Optional)

```bash
# Export current schema for reference
npm run export:schema
```

This creates/updates `pb_schema.json` with current database schema.

### Step 3: Import Updated Schema

The updated schema includes:
- New `persons` collection
- New `qualifications` collection
- Updated `projects`, `services`, `locations`, `skills` collections

```bash
# Import the multi-tenant schema
npm run import:schema
```

**What this does:**
- Creates `persons` collection with fields: name, slug, email, bio, avatar, user
- Creates `qualifications` collection with person relation
- Adds `person`, `scope`, `visibility` fields to existing collections
- Updates API access rules for multi-tenant permissions

### Step 4: Run Migration Script

```bash
# Migrate existing data to multi-tenant structure
npm run migrate:multitenant
```

**What this does:**
1. Creates 4 person records:
   - Chris Loidolt (slug: `chris`)
   - Julia Loidolt (slug: `julia`)
   - Theo Loidolt (slug: `theo`)
   - Jack Loidolt (slug: `jack`)

2. Links Chris to existing admin user account

3. Migrates existing data:
   - All projects → assigned to Chris
   - All skills → assigned to Chris
   - Services → marked as Family/Public
   - Locations → marked as Family with appropriate visibility

**Expected Output:**
```
🚀 Starting multi-tenant migration...

✓ Authenticated as admin

👥 Creating person records...
  ✓ Created Chris Loidolt
  ✓ Created Julia Loidolt
  ✓ Created Theo Loidolt
  ✓ Created Jack Loidolt

🔗 Linking Chris to admin user...
  ✓ Linked Chris to user admin@example.com

📦 Migrating projects to Chris...
  Found 15 projects
  ✓ Migrated 15 projects

🎯 Migrating skills to Chris...
  Found 20 skills
  ✓ Migrated 20 skills

🛠️  Migrating services...
  Found 5 services
  ✓ Migrated 5 services

📍 Migrating locations...
  Found 10 locations
  ✓ Migrated 10 locations

✅ Migration complete!
```

### Step 5: Verify in PocketBase Admin

1. Open PocketBase admin: `http://localhost:8090/_/`

2. Check the **persons** collection:
   - Should have 4 records (chris, julia, theo, jack)
   - Chris should have a `user` relation set

3. Check **projects** collection:
   - Each project should have:
     - `person` field populated with Chris's ID
     - `scope` set to "Personal"
     - `visibility` set based on `status` (Published → Public, Draft → Private)

4. Check **skills** collection:
   - Each skill should have:
     - `person` field populated with Chris's ID
     - `scope` set to "Personal"
     - `visibility` set to "Public"

5. Check **services** collection:
   - Each service should have:
     - `scope` set to "Family"
     - `visibility` based on `active` field

6. Check **locations** collection:
   - Each location should have:
     - `scope` set to "Family"
     - `visibility` based on `privacy` field

### Step 6: Test Data Access

Test that the new data fetching functions work:

```typescript
// In a Next.js page or component
import {
  getAllPersons,
  getPersonBySlug,
  getProjectsByPerson,
  getSkillsByPerson,
  getQualificationsByPerson
} from '@/lib/pocketbase';

// Test fetching persons
const persons = await getAllPersons();
console.log('Persons:', persons);

// Test fetching Chris's data
const chris = await getPersonBySlug('chris');
const chrisProjects = await getProjectsByPerson('chris');
const chrisSkills = await getSkillsByPerson('chris');

console.log('Chris:', chris);
console.log('Chris Projects:', chrisProjects);
console.log('Chris Skills:', chrisSkills);
```

## Rollback (If Needed)

If something goes wrong:

```bash
# Stop services
npm run docker:down

# Remove current pb_data
rm -rf pb_data

# Restore backup
mv pb_data.backup pb_data

# Restart services
npm run docker:up
```

## Common Issues

### Issue: Migration script fails with "Collection not found"

**Solution:** Ensure schema was imported first:
```bash
npm run import:schema
npm run migrate:multitenant
```

### Issue: "Failed to authenticate with PocketBase"

**Solution:** Check `.env.local` credentials:
```bash
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=your-admin-email
POCKETBASE_ADMIN_PASSWORD=your-admin-password
```

### Issue: "Person with slug 'chris' not found"

**Solution:** Run migration script again - it's idempotent:
```bash
npm run migrate:multitenant
```

### Issue: Docker container not running

**Solution:** Check Docker services:
```bash
# Check status
docker ps

# View logs
npm run docker:logs

# Restart services
npm run docker:down
npm run docker:up
```

## Post-Migration Tasks

### 1. Update Frontend Code

Start using person-filtered data fetching in your pages:

```typescript
// Before
const projects = await getAllProjects();

// After (for person-specific site)
const projects = await getProjectsByPerson('chris');
```

### 2. Configure Subdomains (Optional)

See `MULTITENANT_ARCHITECTURE.md` for subdomain routing setup.

### 3. Add Person-Specific Pages

Create routes for each family member's site.

### 4. Test Privacy Controls

Verify that:
- Public items are visible to everyone
- Family items require authentication
- Private items are only visible to owners

## Need Help?

- Review `MULTITENANT_ARCHITECTURE.md` for architecture details
- Check PocketBase logs: `npm run docker:logs`
- Open PocketBase admin panel: `http://localhost:8090/_/`
- Examine schema file: `pb_schema.json`

## Success Checklist

- [ ] Schema imported successfully
- [ ] Migration script completed without errors
- [ ] 4 person records created in `persons` collection
- [ ] Chris linked to admin user
- [ ] All existing projects assigned to Chris
- [ ] All existing skills assigned to Chris
- [ ] Services and locations have scope/visibility set
- [ ] Data fetching functions work correctly
- [ ] PocketBase admin panel shows correct data

Once all items are checked, you're ready to build the multi-tenant frontend!
