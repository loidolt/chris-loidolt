# Migration Quick Start Guide

**5-Minute Setup** | Fast track to migrate from Airtable to PocketBase

---

## Prerequisites

- ✅ Node.js installed
- ✅ Airtable account with data
- ✅ Docker installed (recommended) OR PocketBase binary

---

## Quick Steps

### 1️⃣ Update Airtable (5 minutes)

Add `Order` field to these tables:
- **Qualifications** → Add Number field named "Order"
- **Services** → Add Number field named "Order"
- **Websites** → Add Number field named "Order"

Populate with values: 1, 2, 3... (or 10, 20, 30...)

### 2️⃣ Configure Environment (2 minutes)

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```bash
# Airtable
AIRTABLE_API_KEY=your_key
AIRTABLE_POSTS_BASEID=your_base_id
AIRTABLE_POSTS_TABLENAME=Posts
AIRTABLE_QUALIFICATIONS_TABLENAME=Qualifications
AIRTABLE_SERVICES_TABLENAME=Services
AIRTABLE_WEBSITES_TABLENAME=Websites

# PocketBase
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=your_secure_password
```

### 3️⃣ Export from Airtable (2 minutes)

```bash
npm install airtable --legacy-peer-deps
npm run export:airtable
```

Verify files created in `.airtable-export/`

### 4️⃣ Start PocketBase (1 minute)

```bash
npm run docker:up
```

Open http://localhost:8090/_ and create admin account.

### 5️⃣ Create Collections (10-15 minutes)

**Follow the manual setup guide:**

See **`MANUAL_COLLECTION_SETUP.md`** for step-by-step instructions.

This guide provides exact field names, types, and settings for all 5 collections.

**Quick reference:**

#### `projects` Collection
- title (Text, required)
- slug (Text, required, unique)
- description (Text)
- markdown (Editor)
- tags (JSON)
- categories (JSON)
- date (Date)
- featuredImage (File, single)
- gallery (File, multiple)
- status (Select: Draft, Published)
- featured (Bool)

#### `skills` Collection ⚠️ Important: Name it "skills", NOT "qualifications"
- name (Text, required)
- summary (Editor)
- type (Select: Skills, Programming, Ratings)
- category (Select: Workshop, Software, Media, etc.)
- level (Select: Expert, Advanced, Intermediate, Elementary)
- order (Number)

#### `services` Collection
- title (Text, required)
- description (Text, required)
- subtitle (Text)
- url (URL)
- icon (Text)
- image (File, single)
- active (Bool, default: true)
- order (Number)

#### `websites` Collection
- name (Text, required)
- url (URL, required)
- description (Text)
- statusUrl (URL)
- image (File, single)
- active (Bool, default: true)
- order (Number)

#### `locations` Collection (optional)
- name (Text, required)
- description (Editor)
- latitude (Number, required)
- longitude (Number, required)
- categories (JSON)
- image (File, single)
- status (Select: Draft, Published)
- privacy (Select: Public, Private)

> 💡 **Important**: Follow `MANUAL_COLLECTION_SETUP.md` for complete step-by-step instructions with all field settings and API rules.

### 6️⃣ Import to PocketBase (2 minutes)

```bash
npm run import:pocketbase
```

Watch for success messages!

### 7️⃣ Seed Locations (optional, 1 minute)

```bash
npm run seed:locations
```

Creates sample location data for GIS map testing.

### 8️⃣ Verify (2 minutes)

1. Open http://localhost:8090/_/
2. Check each collection has data
3. Verify images uploaded correctly
4. Test a few records

---

## Common Issues

### "Failed to authenticate"
→ Create admin account in PocketBase first: http://localhost:8090/_/

### "Collection not found"
→ Create all collections in PocketBase before importing

### "qualifications collection not found"
→ Create collection named **`skills`** (not "qualifications")

### "Order field is empty"
→ Add Order field to Airtable tables and populate values

### "Status validation failed"
→ In PocketBase, make `active` field a **Boolean**, not Select

---

## What Gets Migrated?

| Airtable | → | PocketBase | Records |
|----------|---|------------|---------|
| Posts | → | projects | All posts with images |
| Qualifications | → | skills | All skills/certifications |
| Services | → | services | All services |
| Websites | → | websites | All website links |
| (none) | → | locations | Seed data only |

---

## After Migration

Update your Next.js code:

```typescript
// OLD
const data = await pb.collection('qualifications').getFullList();

// NEW
const data = await pb.collection('skills').getFullList();
```

Files to update:
- `src/app/about/page.tsx`
- `src/lib/pocketbase.ts`
- Any components using qualifications

---

## Development Workflow

```bash
# Start development
npm run docker:up          # Start PocketBase
npm run dev                # Start Next.js

# Stop services
npm run docker:down        # Stop PocketBase

# View logs
npm run docker:logs        # See PocketBase logs

# Rebuild
npm run docker:rebuild     # Rebuild containers
```

---

## Production Deployment

1. **Deploy PocketBase** (Railway, Fly.io, VPS, etc.)
2. **Update `.env.local`** with production PocketBase URL
3. **Run migration** on production PocketBase
4. **Deploy Next.js** (Vercel, Netlify, etc.)
5. **Update environment variables** in hosting platform

---

## Need More Help?

📖 **Full Documentation**:
- `MIGRATION_SUMMARY.md` - Complete overview
- `POCKETBASE_SCHEMA.md` - Detailed schema
- `AIRTABLE_UPDATE_GUIDE.md` - Airtable preparation

🐛 **Troubleshooting**:
- Check logs: `npm run docker:logs`
- Verify collections in PocketBase admin
- Review `.airtable-export/` files

---

## Success Checklist

- [ ] Airtable Order fields added and populated
- [ ] Environment variables configured in `.env.local`
- [ ] Data exported: `npm run export:airtable` ✅
- [ ] PocketBase running: http://localhost:8090/_ accessible
- [ ] Collections created in PocketBase (especially `skills`!)
- [ ] Data imported: `npm run import:pocketbase` ✅
- [ ] Data verified in PocketBase admin panel
- [ ] Next.js code updated to use `skills` collection
- [ ] Application tested locally

---

**Total Time**: ~20 minutes

**Status**: Ready to migrate! 🚀

*Last Updated: 2025-10-26*
