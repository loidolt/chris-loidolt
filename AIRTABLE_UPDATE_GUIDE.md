# Airtable Update Guide

This guide provides step-by-step instructions to prepare your Airtable base for migration to PocketBase.

## Overview

Before running the migration scripts, you need to add `Order` fields to certain tables in Airtable. These fields enable manual sorting control in your application.

---

## Required Updates

### Tables Requiring Order Fields

The following tables need an `Order` field added:

1. **Qualifications** (will become `skills` in PocketBase)
2. **Services**
3. **Websites**

> **Note**: The `Posts` table does not need an Order field as projects are sorted by date.

---

## Step-by-Step Instructions

### 1. Add Order Field to Qualifications Table

1. Open your Airtable base
2. Navigate to the **Qualifications** table
3. Click the **+** button to add a new field
4. Configure the field:
   - **Field name**: `Order`
   - **Field type**: Number
   - **Format**: Integer
   - **Allow negative numbers**: No (unchecked)
5. Click **Create field**

### 2. Add Order Field to Services Table

1. Navigate to the **Services** table
2. Click the **+** button to add a new field
3. Configure the field:
   - **Field name**: `Order`
   - **Field type**: Number
   - **Format**: Integer
   - **Allow negative numbers**: No (unchecked)
4. Click **Create field**

### 3. Add Order Field to Websites Table

1. Navigate to the **Websites** table
2. Click the **+** button to add a new field
3. Configure the field:
   - **Field name**: `Order`
   - **Field type**: Number
   - **Format**: Integer
   - **Allow negative numbers**: No (unchecked)
4. Click **Create field**

---

## Populating Order Values

After adding the Order fields, you need to assign order values to existing records:

### Method 1: Manual Assignment (Recommended for Small Datasets)

1. Open each table
2. Sort records in your desired display order
3. Starting from 1, manually enter sequential numbers in the Order field
   - First record: 1
   - Second record: 2
   - Third record: 3
   - etc.

**Example for Qualifications:**
```
Expert Skills -> Order: 1
Advanced Skills -> Order: 2
Intermediate Skills -> Order: 3
```

### Method 2: Bulk Update Using Formula (Temporary)

If you have many records, you can use a temporary formula field:

1. Create a new formula field called `TempOrder`
2. Use formula: `RECORD_ID()`
3. Copy values from TempOrder to Order field
4. Delete the TempOrder field
5. Manually adjust the order numbers as desired

### Method 3: Use Airtable Automations

For very large datasets:

1. Create an Airtable automation
2. Trigger: Record matches conditions
3. Action: Update record
4. Set Order to incremental values

---

## Optional: Add Additional Fields

While not required for migration, these optional fields can enhance your data:

### For Projects (Posts Table)

Consider adding these fields before migration:

| Field Name | Type | Description |
|------------|------|-------------|
| `Featured` | Checkbox | Mark projects to feature on homepage |
| `Meta Description` | Single line text (max 160 chars) | SEO meta description |

### For Services Table

| Field Name | Type | Description |
|------------|------|-------------|
| `Order` | Number | ✅ **Required** - Display order |

### For Websites Table

| Field Name | Type | Description |
|------------|------|-------------|
| `Order` | Number | ✅ **Required** - Display order |

---

## Verification Checklist

Before running the export script, verify:

- [ ] Order field exists in Qualifications table
- [ ] Order field exists in Services table
- [ ] Order field exists in Websites table
- [ ] All records have Order values assigned
- [ ] Order values are positive integers
- [ ] No duplicate order values within each table (optional, but recommended)

---

## Data Quality Tips

### 1. Order Value Spacing

Consider using increments of 10 instead of 1:
- First record: 10
- Second record: 20
- Third record: 30

**Benefits:**
- Easy to insert items later without renumbering everything
- Example: Want to insert between items 10 and 20? Use order 15

### 2. Grouping with Order

You can use order ranges for grouping:
- Group 1: 100-199
- Group 2: 200-299
- Group 3: 300-399

### 3. Reserve Order 0

Don't use 0 for regular items. Reserve it for special cases like:
- "Default" or "Other" categories
- Items that should always appear first

---

## Common Issues and Solutions

### Issue: "Order field not found during export"

**Solution**: Make sure the field is named exactly `Order` (capital O)

### Issue: "Some records have empty Order values"

**Solution**: Fill in all Order values before export. The migration script may fail on null/empty values.

### Issue: "Order values are not sequential"

**Solution**: This is OK! Order values don't need to be sequential (1,2,3...). They just need to be numbers that define the sort order.

---

## After Adding Order Fields

Once you've completed these updates:

1. Double-check all tables have Order fields
2. Verify all records have order values
3. Run the export script:
   ```bash
   npm run export:airtable
   ```

---

## Example: Complete Migration Workflow

Here's the full workflow from Airtable to PocketBase:

```bash
# 1. Update Airtable (follow this guide)
#    - Add Order fields
#    - Populate order values

# 2. Export from Airtable
npm run export:airtable

# 3. Start PocketBase (if using Docker)
npm run docker:up

# 4. Create collections in PocketBase
#    - Follow POCKETBASE_SCHEMA.md
#    - Create: projects, skills, services, websites, locations

# 5. Import to PocketBase
npm run import:pocketbase

# 6. (Optional) Seed sample locations
npm run seed:locations

# 7. Verify in PocketBase admin panel
#    - Open http://localhost:8090/_/
#    - Check all collections
#    - Verify data and images
```

---

## Need Help?

### Airtable Documentation
- [Field types reference](https://support.airtable.com/docs/field-types-overview)
- [Sorting and filtering](https://support.airtable.com/docs/sorting-records)
- [Formula field guide](https://support.airtable.com/docs/formula-field-reference)

### Migration Issues
- Check `.airtable-export/` directory for exported JSON files
- Review migration script logs for specific error messages
- Ensure environment variables are set in `.env.local`

---

## Summary

✅ **Required Actions:**
1. Add `Order` field (Number) to Qualifications, Services, and Websites tables
2. Populate order values for all existing records
3. Verify all fields are correctly named

⏭️ **Next Steps:**
1. Run `npm run export:airtable`
2. Create collections in PocketBase
3. Run `npm run import:pocketbase`

---

*Last Updated: 2025-10-26*
