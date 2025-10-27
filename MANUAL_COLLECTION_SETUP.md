# Manual PocketBase Collection Setup Guide

Since automated scripts are having issues, this guide provides quick manual setup instructions.

**Estimated time: 10-15 minutes**

---

## Delete Existing Collections First

1. Open http://localhost:8090/_/
2. Go to "Collections"
3. Delete any existing broken collections (projects, skills, services, websites, locations)

---

## 1. Create `projects` Collection

### Basic Settings
- Name: `projects`
- Type: Base collection

### Fields (23 total):

Click "New field" for each:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| title | Text | ✅ | Max: 200 |
| slug | Text | ✅ | Max: 200, Pattern: `^[a-z0-9-]+$` |
| description | Text | ❌ | Max: 500 |
| longDescription | Editor | ❌ | - |
| markdown | Editor | ❌ | - |
| tags | JSON | ❌ | - |
| categories | JSON | ❌ | - |
| date | Date | ❌ | - |
| featuredImage | File | ❌ | Max: 1, Size: 5MB, Types: image/* |
| gallery | File | ❌ | Max: 20, Size: 5MB, Types: image/* |
| modelFile | Text | ❌ | - |
| modelPath | Text | ❌ | - |
| modelUrl | URL | ❌ | - |
| repository | URL | ❌ | - |
| website | URL | ❌ | - |
| attribution | URL | ❌ | - |
| status | Select | ❌ | Values: Draft, Published |
| cleanRepo | Bool | ❌ | - |
| featured | Bool | ❌ | - |
| metaDescription | Text | ❌ | Max: 160 |
| ogImage | File | ❌ | Max: 1, Size: 5MB, Types: image/* |
| publishedAt | Date | ❌ | - |
| updatedAt | Date | ❌ | - |

### API Rules:
- **List/Search rule**: `@request.auth.id != "" || status = "Published"`
- **View rule**: `@request.auth.id != "" || status = "Published"`
- **Create rule**: `@request.auth.id != ""`
- **Update rule**: `@request.auth.id != ""`
- **Delete rule**: `@request.auth.id != ""`

---

## 2. Create `skills` Collection

### Basic Settings
- Name: `skills`
- Type: Base collection

### Fields (8 total):

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| name | Text | ✅ | Max: 200 |
| summary | Editor | ❌ | - |
| type | Select | ❌ | Values: Skills, Programming, Ratings |
| category | Select | ❌ | Values: Workshop, Software, Media, Frontend, Backend, Aviation, Radio, SCUBA, Skydiving |
| categories | JSON | ❌ | - |
| level | Select | ❌ | Values: Expert, Advanced, Intermediate, Elementary |
| moreInfo | Text | ❌ | Max: 500 |
| order | Number | ❌ | - |

### API Rules:
- **List/Search rule**: `` (empty - public)
- **View rule**: `` (empty - public)
- **Create rule**: `@request.auth.id != ""`
- **Update rule**: `@request.auth.id != ""`
- **Delete rule**: `@request.auth.id != ""`

---

## 3. Create `services` Collection

### Basic Settings
- Name: `services`
- Type: Base collection

### Fields (9 total):

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| title | Text | ✅ | Max: 200 |
| subtitle | Text | ❌ | Max: 200 |
| description | Text | ✅ | Max: 500 |
| url | URL | ❌ | - |
| moreInfo | URL | ❌ | - |
| icon | Text | ❌ | Max: 50 |
| image | File | ❌ | Max: 1, Size: 5MB, Types: image/* |
| order | Number | ❌ | - |
| active | Bool | ❌ | Default: true |

### API Rules:
- **List/Search rule**: `active = true || @request.auth.id != ""`
- **View rule**: `active = true || @request.auth.id != ""`
- **Create rule**: `@request.auth.id != ""`
- **Update rule**: `@request.auth.id != ""`
- **Delete rule**: `@request.auth.id != ""`

---

## 4. Create `websites` Collection

### Basic Settings
- Name: `websites`
- Type: Base collection

### Fields (7 total):

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| name | Text | ✅ | Max: 200 |
| url | URL | ✅ | - |
| statusUrl | URL | ❌ | - |
| description | Text | ❌ | Max: 500 |
| image | File | ❌ | Max: 1, Size: 5MB, Types: image/* |
| order | Number | ❌ | - |
| active | Bool | ❌ | Default: true |

### API Rules:
- **List/Search rule**: `active = true || @request.auth.id != ""`
- **View rule**: `active = true || @request.auth.id != ""`
- **Create rule**: `@request.auth.id != ""`
- **Update rule**: `@request.auth.id != ""`
- **Delete rule**: `@request.auth.id != ""`

---

## 5. Create `locations` Collection

### Basic Settings
- Name: `locations`
- Type: Base collection

### Fields (11 total):

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| name | Text | ✅ | Max: 200 |
| description | Editor | ❌ | - |
| latitude | Number | ✅ | Min: -90, Max: 90 |
| longitude | Number | ✅ | Min: -180, Max: 180 |
| categories | JSON | ❌ | - |
| image | File | ❌ | Max: 1, Size: 5MB, Types: image/* |
| url | URL | ❌ | - |
| status | Select | ❌ | Values: Draft, Published |
| privacy | Select | ✅ | Values: Public, Private |
| password | Text | ❌ | Max: 100 |
| shareToken | Text | ❌ | Max: 100 |

### API Rules:
- **List/Search rule**: `(status = "Published" && privacy = "Public") || @request.auth.id != ""`
- **View rule**: `(status = "Published" && privacy = "Public") || @request.auth.id != ""`
- **Create rule**: `@request.auth.id != ""`
- **Update rule**: `@request.auth.id != ""`
- **Delete rule**: `@request.auth.id != ""`

---

## Quick Tips

### For Select Fields:
- Click "Add value" to add each option
- Add all values before saving the field

### For File Fields:
- Set "Max select" to control how many files
- Set "Max size" to 5242880 (5MB)
- Add mime types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

### For API Rules:
- Click on "API rules" tab after creating all fields
- Copy/paste the rules exactly as shown
- Empty string `""` means public access

---

## Verification

After creating all collections, verify:

- [ ] All 5 collections exist
- [ ] projects has 22 fields (+ id, created, updated)
- [ ] skills has 8 fields (+ id, created, updated)
- [ ] services has 9 fields (+ id, created, updated)
- [ ] websites has 7 fields (+ id, created, updated)
- [ ] locations has 11 fields (+ id, created, updated)
- [ ] All API rules are set

---

## Next Step

Once all collections are created:

```bash
npm run import:pocketbase
```

This will import your data from Airtable!

---

**Pro Tip**: You can copy/paste field names and settings from this guide to speed up the process. PocketBase's UI is quite fast once you get the rhythm down!
