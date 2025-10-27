# PocketBase Schema Management

This project uses **declarative schema management** for PocketBase collections. The schema is defined in `pb_schema.json` and version controlled in git.

## Quick Start

### Fresh Setup
```bash
# Start services
npm run docker:up

# Create admin user
npm run pocketbase:init

# Import schema (creates all collections automatically!)
npm run import:schema

# Import data (if you have it)
npm run import:pocketbase
```

That's it! No manual collection creation needed.

## Making Schema Changes

### 1. Edit in PocketBase UI
- Go to http://localhost:8090/_/
- Make your changes (add fields, create collections, etc.)

### 2. Export Schema
```bash
npm run export:schema
```

This saves your changes to `pb_schema.json`

### 3. Commit to Git
```bash
git add pb_schema.json
git commit -m "Add new field to projects collection"
git push
```

### 4. Team Members Pull Changes
```bash
git pull
npm run import:schema  # Applies schema changes automatically
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run export:schema` | Export current schema from PocketBase to `pb_schema.json` |
| `npm run import:schema` | Import schema from `pb_schema.json` to PocketBase |

## Benefits

✅ **Version Control**: Schema changes tracked in git
✅ **Reproducible**: Same schema across dev, staging, production
✅ **Reviewable**: Schema changes visible in pull requests
✅ **Automated**: No manual UI clicking to set up collections
✅ **Team Collaboration**: Share schema changes easily

## Schema File

The `pb_schema.json` file contains:
- Collection definitions (name, type, rules)
- Field definitions (types, validations, constraints)
- Indexes
- API rules (create, read, update, delete)

**Important**: This file is tracked in git. Don't gitignore it!

## Workflow Examples

### Adding a New Field

1. Open PocketBase admin → Collections → Projects
2. Add new field "priority" (select: High/Medium/Low)
3. Run `npm run export:schema`
4. Commit: `git commit -m "Add priority field to projects"`
5. Push and teammates run `npm run import:schema`

### Creating a New Collection

1. Open PocketBase admin → Collections → New Collection
2. Create "blog_posts" collection with fields
3. Run `npm run export:schema`
4. Commit: `git commit -m "Add blog_posts collection"`

### Pulling Schema Updates

```bash
git pull
npm run import:schema
```

Done! Your local PocketBase now matches the updated schema.

## Troubleshooting

### "Failed to authenticate"
- Ensure PocketBase is running: `npm run docker:up`
- Check credentials in `.env.local`
- Run `npm run pocketbase:init` to create admin user

### "Schema file not found"
- Run `npm run export:schema` first to create the file
- Or ensure you've pulled it from git

### "Collection already exists"
- This is fine! Import is idempotent (safe to run multiple times)
- It updates existing collections to match the schema

## Technical Details

- **Schema format**: JSON export from PocketBase Collections API
- **Import method**: `PUT /api/collections/import`
- **Export method**: `GET /api/collections`
- **Safe updates**: Import doesn't delete existing data, only updates schema

## See Also

- `scripts/README.md` - Full documentation of all scripts
- `CLAUDE.md` - Project overview and architecture
- [PocketBase Docs](https://pocketbase.io/docs/) - Official documentation
