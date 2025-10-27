# Migration Scripts

This directory contains scripts to migrate data from Airtable to PocketBase and set up your database.

## Quick Reference

```bash
# Docker setup
npm run docker:up             # Start PocketBase + Next.js
npm run pocketbase:init       # Create admin user (run after docker:up)
npm run import:schema         # Import schema from pb_schema.json

# Schema management (declarative)
npm run export:schema         # Export current schema to pb_schema.json
npm run import:schema         # Import schema from pb_schema.json

# Full migration workflow (legacy - Airtable to PocketBase)
npm run export:airtable       # Step 1: Export from Airtable
npm run import:schema         # Step 2: Import schema (instead of manual setup)
npm run import:pocketbase     # Step 3: Import data to PocketBase
npm run seed:locations        # Step 4: (Optional) Add sample locations
```

---

## Declarative Schema Management

**New approach (recommended)**: Manage your PocketBase schema as code!

### How it works
1. **Schema file**: `pb_schema.json` in project root defines all collections
2. **Version controlled**: Schema is tracked in git, changes are reviewable
3. **Automatic import**: Run `npm run import:schema` to apply schema changes
4. **Easy export**: Run `npm run export:schema` after UI changes to update the file

### Commands

```bash
# Import schema (create/update collections)
npm run import:schema

# Export schema (save current state)
npm run export:schema
```

### Workflow

1. **Making schema changes**:
   - Edit collections in PocketBase admin UI
   - Run `npm run export:schema`
   - Commit `pb_schema.json` to git

2. **Setting up fresh instance**:
   ```bash
   npm run docker:up
   npm run pocketbase:init
   npm run import:schema    # ← Creates all collections automatically!
   npm run import:pocketbase # Import data
   ```

3. **Pulling changes from git**:
   - If someone updated the schema, just run:
   ```bash
   npm run import:schema
   ```

### Benefits
✅ No manual collection setup
✅ Schema changes are version controlled
✅ Easy team collaboration
✅ Reproducible across environments
✅ Infrastructure as code

---

## Scripts Overview

### 1. `export-schema.ts` & `import-schema.ts`

**Purpose**: Declarative schema management for PocketBase collections

**Export command**: `npm run export:schema`

**What it does**:
- Connects to running PocketBase instance
- Fetches all collection definitions (schema)
- Saves to `pb_schema.json` in project root
- Should be run after making schema changes in PocketBase UI

**Import command**: `npm run import:schema`

**What it does**:
- Reads `pb_schema.json` from project root
- Connects to PocketBase
- Creates or updates all collections to match the schema
- Safe to run multiple times (upserts collections)

**When to use**:
- **Export**: After making changes in PocketBase admin UI
- **Import**: Setting up new environment, or pulling schema updates from git

**Benefits**:
- Infrastructure as code for your database schema
- Version control your schema changes
- Easy collaboration - commit schema, teammates import it
- No more manual "Step 2: Create collections" guides!

---

### 2. `export-airtable.ts`

**Purpose**: Export all data from Airtable to local JSON files

**Command**: `npm run export:airtable`

**What it does**:
- Fetches all records from Airtable tables
- Downloads all file attachments (images, etc.)
- Saves data as JSON files in `.airtable-export/`
- Handles pagination and rate limits automatically

**Prerequisites**:
- Airtable API key and base ID in `.env.local`
- Install airtable package: `npm install airtable --legacy-peer-deps`
- Order fields added to Qualifications, Services, Websites tables

**Output**:
```
.airtable-export/
├── projects.json
├── skills.json
├── services.json
├── websites.json
└── files/
    ├── [downloaded images...]
```

**When to use**: Run this BEFORE migrating to PocketBase, after preparing Airtable

---

### 3. `import-pocketbase.ts`

**Purpose**: Import exported Airtable data into PocketBase

**Command**: `npm run import:pocketbase`

**What it does**:
- Reads JSON files from `.airtable-export/`
- Transforms Airtable fields to PocketBase schema
- Converts types (e.g., Status Select → Boolean)
- Uploads file attachments
- Creates records in PocketBase

**Prerequisites**:
- PocketBase running with collections created
- Airtable data exported (`.airtable-export/` exists)
- Environment variables set

**Output**:
```
✓ Authenticated as admin

📦 Importing projects...
  Found 45 records
  Progress: 10/45
  Progress: 20/45
  ...
  ✓ Imported 45 records (0 failed)

✅ Import complete!
```

**When to use**: Run this AFTER creating PocketBase collections

---

### 4. `seed-locations.ts`

**Purpose**: Create sample location data for testing GIS features

**Command**: `npm run seed:locations`

**What it does**:
- Creates 11 sample locations in Colorado Springs area
- Includes public and private (password-protected) locations
- Adds various categories for testing
- Generates share tokens for private locations

**Sample data**:
- 8 public locations (Garden of the Gods, Pikes Peak, etc.)
- 2 private locations (with passwords)
- 1 draft location

**When to use**: Run this AFTER importing data, only if you want to test the GIS map feature

**Output**:
```
📍 Creating sample locations...
  🌍 ✓ Garden of the Gods
  🌍 ✓ Pikes Peak Summit
  🔒 ✓ Private Workshop Location
     Password: workshop2024
     Share Token: abc123def456...

✅ Seed complete!
   Created: 11 locations
```

---

## Environment Variables

Required in `.env.local`:

```bash
# PocketBase (required for all scripts except export)
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=your_secure_password

# Airtable (only for export script)
AIRTABLE_API_KEY=your_api_key
AIRTABLE_POSTS_BASEID=your_base_id
AIRTABLE_POSTS_TABLENAME=Posts
AIRTABLE_QUALIFICATIONS_TABLENAME=Qualifications
AIRTABLE_SERVICES_TABLENAME=Services
AIRTABLE_WEBSITES_TABLENAME=Websites
```

---

## Complete Migration Workflow

### Step 0: Prepare Airtable

Follow `AIRTABLE_UPDATE_GUIDE.md`:
1. Add Order field to Qualifications, Services, Websites
2. Populate order values (1, 2, 3...)

### Step 1: Export from Airtable

```bash
# Install Airtable package (temporary)
npm install airtable --legacy-peer-deps

# Export data
npm run export:airtable

# Verify export
ls -la .airtable-export/
```

### Step 2: Start PocketBase and Create Admin

```bash
# Using Docker (recommended)
npm run docker:up

# Create admin user automatically
npm run pocketbase:init

# Admin credentials are loaded from .env.local:
# - POCKETBASE_ADMIN_EMAIL=loidolt@gmail.com
# - POCKETBASE_ADMIN_PASSWORD=Sykbif-dikhip-hicfu5
```

The `pocketbase:init` command will:
- ✅ Read credentials from `.env.local`
- ✅ Create admin user if not exists
- ✅ Update admin user if already exists (safe to run multiple times)
- ✅ Open http://localhost:8090/_/ to verify

### Step 3: Create Collections

Follow the step-by-step instructions in `MANUAL_COLLECTION_SETUP.md` to create all 5 collections through the PocketBase admin UI.

**Estimated time**: 10-15 minutes

**Important**: Create collection named `skills` (not "qualifications"!)

### Step 4: Import Data

```bash
npm run import:pocketbase
```

Watch for success messages!

### Step 5: Seed Locations (Optional)

```bash
npm run seed:locations
```

### Step 6: Verify

1. Open PocketBase admin: http://localhost:8090/_/
2. Check each collection has data
3. Verify images uploaded
4. Test a few records

---

## Troubleshooting

### "Failed to authenticate with PocketBase"

**Solution**:
- Ensure PocketBase is running: http://localhost:8090/_/
- Check credentials in `.env.local`
- Create admin account if not exists

### "Collection not found"

**Solution**:
- Create collections manually in PocketBase admin following `MANUAL_COLLECTION_SETUP.md`

### "Airtable export failed"

**Solution**:
- Check API key and base ID in `.env.local`
- Ensure you have read access to the base
- Install airtable package: `npm install airtable --legacy-peer-deps`

### "Order field is empty during import"

**Solution**:
- Add Order field to Airtable tables
- Populate with values: 1, 2, 3...
- Re-run export

### "Status field validation failed"

**Solution**:
- Ensure `active` field is Boolean type, not Select
- Follow `MANUAL_COLLECTION_SETUP.md` for correct field types

### "Collection 'skills' not found"

**Solution**:
- Collection must be named `skills` (not "qualifications")
- Follow `MANUAL_COLLECTION_SETUP.md` to create correctly

---

## Script Details

### Field Mappings

Complete mappings in `import-pocketbase.ts`:

**Projects**:
- Excerpt → description
- Cover Image → featuredImage
- Last Modified → updatedAt
- Model URL → modelUrl

**Skills** (was Qualifications):
- Name → name
- Summary → summary
- Type → type
- Category → category
- Level → level
- More Info → moreInfo

**Services & Websites**:
- Status (Select) → active (Boolean)
- Name → title (services only)

### Type Conversions

Automatic conversions applied:

```typescript
// Status field: "Published" → true, others → false
services.Status → services.active (Boolean)
websites.Status → websites.active (Boolean)

// Date normalization
projects.Date → YYYY-MM-DD format

// Slug generation (if missing)
projects.slug → auto-generated from title
```

### Error Handling

All scripts include:
- ✅ Graceful error handling
- ✅ Detailed error messages
- ✅ Progress indicators
- ✅ Summary statistics
- ✅ Skipping existing records (setup script)

---

## Performance Tips

### Large Datasets

For large Airtable bases:
- Export script processes in batches
- Import shows progress every 10 records
- File downloads include retry logic

### Speed Up Import

- Reduce image sizes before migration
- Use local PocketBase (not remote)
- Run on SSD for faster file I/O

### Debugging

Add more logging:
```typescript
// In import-pocketbase.ts
console.log('Record data:', JSON.stringify(pbRecord, null, 2));
```

---

## Maintenance

### Re-running Scripts

**Export**: Safe to run multiple times (overwrites `.airtable-export/`)

**Import**: Creates duplicate records (no de-duplication)
- Clear PocketBase data first if re-running
- Or delete collections in admin panel

**Seed**: Safe to run multiple times (creates new records)

### Cleaning Up

```bash
# Remove export data
rm -rf .airtable-export/

# Reset PocketBase database
npm run docker:clean

# Restart with fresh database
npm run docker:up
```

---

## Advanced Usage

### Custom Field Mappings

Edit `FIELD_MAPPINGS` in `import-pocketbase.ts`:

```typescript
const FIELD_MAPPINGS = {
  projects: {
    'Your Airtable Field': 'pocketbaseField',
    // Add custom mappings here
  }
}
```

### Custom Type Converters

Edit `TYPE_CONVERTERS` in `import-pocketbase.ts`:

```typescript
const TYPE_CONVERTERS = {
  projects: {
    'CustomField': (value) => {
      // Transform value here
      return transformedValue;
    }
  }
}
```

---

## Support Resources

**Documentation**:
- `POCKETBASE_SCHEMA.md` - Full schema reference
- `AIRTABLE_UPDATE_GUIDE.md` - Airtable preparation
- `MIGRATION_SUMMARY.md` - Complete migration guide
- `MIGRATION_QUICKSTART.md` - Fast-track setup

**External Links**:
- [PocketBase Docs](https://pocketbase.io/docs/)
- [Airtable API](https://airtable.com/developers/web/api/introduction)
- [PocketBase SDKs](https://pocketbase.io/docs/client-side-sdks/)

---

**Last Updated**: 2025-10-26
