# PocketBase Collection Schema Guide

## Best Practices & Design Principles

### 1. **Field Naming Conventions**
- Use **camelCase** for field names (e.g., `featuredImage`, `longDescription`)
- Keep names consistent with your TypeScript interfaces
- Avoid spaces or special characters

### 2. **Use Appropriate Field Types**
PocketBase offers these field types:
- **Text** - Short strings (titles, slugs)
- **Editor** - Rich text with markdown/HTML support
- **Number** - Integers or decimals
- **Bool** - Checkboxes
- **Email** - Validated email addresses
- **URL** - Validated URLs
- **Date** - Date picker
- **Select** - Dropdown (single or multiple)
- **JSON** - Arrays, objects, complex data
- **File** - Single or multiple file uploads
- **Relation** - Link to another collection

### 3. **Indexing Strategy**
Add indexes to fields you'll:
- Search on frequently
- Filter by
- Sort by
- Use in API queries

**Rule of thumb**: If a field appears in `filter` or `sort` queries, index it!

### 4. **API Rules** (Access Control)
Set these for each collection:
- **List/Search** - Who can view records
- **View** - Who can see individual records
- **Create** - Who can add records
- **Update** - Who can edit records
- **Delete** - Who can remove records

For a portfolio site:
- **Public read** (anyone can view)
- **Admin-only write** (only you can edit)

### 5. **Validation Rules**
Use PocketBase's built-in validators:
- **Required** fields
- **Unique** fields (slugs, emails)
- **Min/Max** length
- **Regex patterns**
- **Custom rules** (JavaScript expressions)

---

## Collection Schemas

### 🎨 **projects** Collection

**Purpose**: Portfolio projects with images, 3D models, and rich content

**Fields:**

| Field | Type | Options | Index | Required | Notes |
|-------|------|---------|-------|----------|-------|
| `title` | Text | max: 200 | ✅ | ✅ | Project name |
| `slug` | Text | unique, max: 200, regex: `^[a-z0-9-]+$` | ✅ | ✅ | URL-friendly identifier |
| `description` | Text | max: 500 | | | Short description for cards |
| `longDescription` | Editor | | | | Detailed description (markdown) |
| `markdown` | Editor | | | | Additional markdown content |
| `tags` | JSON | | ✅ | | Array of strings: `["3d-printing", "woodworking"]` |
| `categories` | JSON | | ✅ | | Array of strings: `["hardware", "software"]` |
| `date` | Date | | ✅ | | Project date (for sorting) |
| `featuredImage` | File | single, maxSize: 5MB, types: image/* | | | Main project image |
| `gallery` | File | multiple, maxSelect: 20, maxSize: 5MB, types: image/* | | | Additional images |
| `modelFile` | Text | | | | Filename of 3D model in /public/models/ |
| `modelPath` | Text | | | | Path to 3D model file |
| `modelUrl` | URL | | | | External URL for 3D model |
| `repository` | URL | | | | GitHub repo URL |
| `website` | URL | | | | Project website URL |
| `attribution` | URL | | | | Attribution/credit URL |
| `status` | Select | options: Draft, Published | ✅ | | Visibility status |
| `cleanRepo` | Bool | | | | Clean repository checkbox |
| `featured` | Bool | | ✅ | | Featured on homepage |
| `metaDescription` | Text | max: 160 | | | SEO meta description |
| `ogImage` | File | single, maxSize: 5MB, types: image/* | | | Open Graph image for social sharing |
| `publishedAt` | Date | | | | First publication date |
| `updatedAt` | Date | | | | Last update timestamp |

**Indexes to Create:**
- `slug` (unique)
- `date` (for sorting)
- `status` (for filtering)
- `featured` (for homepage queries)
- `tags` (for search/filter)
- `categories` (for search/filter)
- `publishedAt` (for sorting by publish date)

**API Rules:**
```javascript
// List/Search Rule (public read, only published)
@request.auth.id != "" || status = "Published"

// View Rule (public read, only published)
@request.auth.id != "" || status = "Published"

// Create/Update/Delete Rules (admin only)
@request.auth.id != ""
```

**Validation:**
- `slug`: Required, Unique, Regex: `^[a-z0-9-]+$`
- `title`: Required, Min: 1, Max: 200
- `description`: Max: 500
- `metaDescription`: Max: 160 (optimal for SEO)

---

### 🎯 **skills** Collection

**Purpose**: Professional skills, programming languages, certifications, and ratings

**Note**: This collection was originally named "qualifications" but has been renamed to better reflect the skills-based data structure from Airtable.

**Fields:**

| Field | Type | Options | Index | Required | Notes |
|-------|------|---------|-------|----------|-------|
| `name` | Text | max: 200 | ✅ | ✅ | Skill name |
| `summary` | Editor | | | | Detailed description |
| `type` | Select | options: Skills, Programming, Ratings | ✅ | | Classification type |
| `category` | Select | options: Workshop, Software, Media, Frontend, Backend, Aviation, Radio, SCUBA, Skydiving | ✅ | | Primary category |
| `categories` | JSON | | ✅ | | Array of category strings for multi-category skills |
| `level` | Select | options: Expert, Advanced, Intermediate, Elementary | ✅ | | Proficiency level |
| `moreInfo` | Text | max: 500 | | | Additional information or notes |
| `order` | Number | | ✅ | | Display order (manual sorting) |

**Indexes to Create:**
- `name` (for searching)
- `type` (for filtering)
- `category` (for filtering)
- `categories` (for filtering)
- `level` (for filtering)
- `order` (for manual ordering)

**API Rules:**
```javascript
// Public read
""

// Admin write
@request.auth.id != ""
```

**Validation:**
- `name`: Required, Min: 1, Max: 200
- `moreInfo`: Max: 500

---

### 💼 **services** Collection

**Purpose**: Services offered and public resources

**Fields:**

| Field | Type | Options | Index | Required | Notes |
|-------|------|---------|-------|----------|-------|
| `title` | Text | max: 200 | | ✅ | Service name |
| `subtitle` | Text | max: 200 | | | Short tagline or subtitle |
| `description` | Text | max: 500 | | ✅ | Service description |
| `url` | URL | | | | Primary service URL |
| `moreInfo` | URL | | | | Additional information or documentation URL |
| `icon` | Text | max: 50 | | | Emoji or icon identifier |
| `image` | File | single, maxSize: 5MB, types: image/* | | | Service image or screenshot |
| `order` | Number | | ✅ | | Display order |
| `active` | Bool | default: true | ✅ | | Show/hide service |

**Indexes to Create:**
- `order` (for sorting)
- `active` (for filtering)

**API Rules:**
```javascript
// Public read (only active)
active = true || @request.auth.id != ""

// Admin write
@request.auth.id != ""
```

**Validation:**
- `title`: Required, Min: 1, Max: 200
- `subtitle`: Max: 200
- `description`: Required, Min: 1, Max: 500

---

### 🌐 **websites** Collection

**Purpose**: External portfolio links and website showcases

**Fields:**

| Field | Type | Options | Index | Required | Notes |
|-------|------|---------|-------|----------|-------|
| `name` | Text | max: 200 | | ✅ | Website name |
| `url` | URL | | | ✅ | Website URL |
| `statusUrl` | URL | | | | Optional status page URL (e.g., uptime monitor) |
| `description` | Text | max: 500 | | | Optional description |
| `image` | File | single, maxSize: 5MB, types: image/* | | | Website screenshot or logo |
| `order` | Number | | ✅ | | Display order |
| `active` | Bool | default: true | ✅ | | Show/hide website |

**Indexes to Create:**
- `order` (for sorting)
- `active` (for filtering)

**API Rules:**
```javascript
// Public read (only active)
active = true || @request.auth.id != ""

// Admin write
@request.auth.id != ""
```

**Validation:**
- `name`: Required, Min: 1, Max: 200
- `url`: Required, Valid URL
- `description`: Max: 500

---

### 📍 **locations** Collection

**Purpose**: GIS map points of interest with privacy controls

**Fields:**

| Field | Type | Options | Index | Required | Notes |
|-------|------|---------|-------|----------|-------|
| `name` | Text | max: 200 | ✅ | ✅ | Location name |
| `description` | Editor | | | | Location details |
| `latitude` | Number | | ✅ | ✅ | Latitude coordinate |
| `longitude` | Number | | ✅ | ✅ | Longitude coordinate |
| `categories` | JSON | | ✅ | | Array of category strings |
| `image` | File | single, maxSize: 5MB, types: image/* | | | Location photo |
| `url` | URL | | | | Related URL |
| `status` | Select | options: Draft, Published | ✅ | | Visibility status |
| `privacy` | Select | options: Public, Private | ✅ | ✅ | Privacy level |
| `password` | Text | max: 100 | | | Password for private locations |
| `shareToken` | Text | unique, max: 100 | ✅ | | Shareable token |

**Indexes to Create:**
- `status` (for filtering)
- `privacy` (for filtering)
- `shareToken` (for lookups)
- `categories` (for filtering)
- `latitude`, `longitude` (for geo queries)

**API Rules:**
```javascript
// List/Search Rule (public published locations only)
(status = "Published" && privacy = "Public") || @request.auth.id != ""

// View Rule (same as list)
(status = "Published" && privacy = "Public") || @request.auth.id != ""

// Create/Update/Delete Rules (admin only)
@request.auth.id != ""
```

**Validation:**
- `name`: Required
- `latitude`: Required, Min: -90, Max: 90
- `longitude`: Required, Min: -180, Max: 180
- `privacy`: Required, Default: "Public"

---

## Advanced Features

### 1. **Slug Auto-Generation** (Optional)

You can add a JavaScript hook to auto-generate slugs from titles:

In PocketBase > Settings > Hooks, add this for the `projects` collection:

```javascript
// On Before Create/Update
if (!$record.slug || $record.slug === "") {
    $record.slug = $record.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
```

### 2. **Search Optimization**

Create a **view collection** for full-text search across multiple fields:

```sql
-- In PocketBase, you can create computed fields or use the search API
-- The JS SDK automatically searches across text fields when you use:
pb.collection('projects').getList(1, 50, {
    search: 'woodworking'
})
```

### 3. **Category/Tag Management**

Instead of JSON arrays, you could create separate collections for better management:

**categories** Collection:
- `name` (Text, unique)
- `slug` (Text, unique)
- `color` (Text) - hex color for UI

**tags** Collection:
- `name` (Text, unique)
- `slug` (Text, unique)

Then use **Relation** fields in `projects`:
- `categories` → Relation (multiple) to `categories` collection
- `tags` → Relation (multiple) to `tags` collection

**Pros:**
- Centralized category management
- Enforce consistency
- Autocomplete in admin UI
- Can add metadata (colors, icons)

**Cons:**
- More complex queries
- Need to expand relations in API calls

**Recommendation**: Start with JSON arrays (simpler), migrate to relations later if needed.

### 4. **Project Relationships** (Future)

Add a **Relation** field to link related projects:

| Field | Type | Options |
|-------|------|---------|
| `relatedProjects` | Relation | collection: projects, multiple |

### 5. **Versioning** (Future)

Add fields for change tracking:

| Field | Type | Options |
|-------|------|---------|
| `version` | Number | default: 1 |
| `publishedAt` | Date | |
| `lastEditedBy` | Relation | collection: _superusers, single |

---

## Performance Tips

### 1. **Batch Operations**
When importing data, use batch requests:
```javascript
const batch = projects.map(p => pb.collection('projects').create(p));
await Promise.all(batch);
```

### 2. **Pagination**
Always use pagination for large datasets:
```javascript
const result = await pb.collection('projects').getList(1, 50);
```

### 3. **Field Selection**
Only fetch fields you need:
```javascript
const result = await pb.collection('projects').getList(1, 50, {
    fields: 'id,title,slug,featuredImage'
});
```

### 4. **Expand Relations**
Use `expand` to load related data in one query:
```javascript
const result = await pb.collection('projects').getList(1, 50, {
    expand: 'categories,tags'
});
```

### 5. **Caching**
Implement caching in Next.js:
```typescript
export const revalidate = 300; // Revalidate every 5 minutes

export async function getAllProjects() {
    const result = await pb.collection('projects').getFullList();
    return result;
}
```

---

## Migration Checklist

When creating collections in PocketBase:

- [ ] Create collection
- [ ] Add all fields with correct types
- [ ] Set required/unique constraints
- [ ] Add validation rules
- [ ] Create indexes (slug, date, status, etc.)
- [ ] Configure API rules (public read, admin write)
- [ ] Test with sample data
- [ ] Verify queries work from Next.js
- [ ] Import production data

---

## Quick Setup Commands

After creating each collection, test it:

```bash
# Test from command line
curl http://localhost:8090/api/collections/projects/records

# Test from Next.js
npm run dev
# Visit http://localhost:3000/projects
```

---

## Next Steps

1. **Create Collections**: Start with `projects` (most complex)
2. **Add Sample Data**: Create 1-2 test records via admin UI
3. **Test Queries**: Verify data appears in Next.js app
4. **Import Data**: Run `npm run import:pocketbase` if migrating from Airtable
5. **Refine**: Adjust indexes and rules based on usage patterns

**Pro Tip**: Start simple and add complexity later. You can always add fields and relations without breaking existing data!
