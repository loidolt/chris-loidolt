# Local Development Guide

This project supports **two development modes**: Docker and Local (native).

## Local Mode (Recommended for Development)

**Advantages:**
- ✅ Fast HMR (Hot Module Replacement) - no Docker overhead
- ✅ Native performance
- ✅ Same `pb_data` directory as Docker (shared database)
- ✅ Easier debugging

**Disadvantages:**
- ⚠️ Requires manual setup (one-time)
- ⚠️ Must run on compatible OS (macOS/Linux/Windows)

### Quick Start

```bash
# One-time setup: Download PocketBase binary
npm run pocketbase:setup

# Start both PocketBase + SvelteKit locally
npm run dev:local
```

This will:
1. Start PocketBase on http://localhost:8090
2. Start SvelteKit on http://localhost:3050
3. Use the same `pb_data/` directory (data persists!)

Press `Ctrl+C` to stop both services.

### Individual Commands

```bash
# Run just PocketBase
npm run pocketbase:local

# Run just SvelteKit (in another terminal)
npm run dev
```

### Environment Configuration

Local mode uses `.env.local`:
```bash
POCKETBASE_URL=http://127.0.0.1:8090
```

The `dev:local` script automatically sets this for SvelteKit.

---

## Docker Mode (Recommended for Consistency)

**Advantages:**
- ✅ Consistent environment across all machines
- ✅ No manual setup needed
- ✅ Isolated from host system

**Disadvantages:**
- ⚠️ Slower HMR due to file mounting overhead
- ⚠️ Vite timeout issues in some environments

### Quick Start

```bash
# Start both services in Docker
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Environment Configuration

Docker mode uses docker-compose.yml overrides:
```yaml
environment:
  - POCKETBASE_URL=http://pocketbase:8090  # Docker service name
```

---

## Shared Database

Both modes use the **same `pb_data/` directory**, so you can switch between them without losing data:

```
pb_data/
├── data.db          # Main database (shared)
├── auxiliary.db     # Auxiliary data
└── ...
```

⚠️ **Important:** Only run one mode at a time to avoid port conflicts!

---

## Common Tasks

### Initialize PocketBase (first time)

```bash
# Create admin user and import schema
npm run pocketbase:init
npm run import:schema
npm run migrate:multitenant
```

### Switch Modes

```bash
# Stop Docker
npm run docker:down

# Start local
npm run dev:local
```

Or vice versa:

```bash
# Stop local (Ctrl+C)

# Start Docker
npm run docker:up
```

### Backup Your Data

```bash
# Create backup
tar -czf pb_data_backup_$(date +%Y%m%d).tar.gz pb_data/

# Restore backup
tar -xzf pb_data_backup_YYYYMMDD.tar.gz
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 8090
lsof -ti:8090 | xargs kill -9

# Find and kill process on port 3050
lsof -ti:3050 | xargs kill -9
```

### PocketBase Binary Not Found

```bash
# Re-run setup
npm run pocketbase:setup
```

### HMR Not Working in Docker

Switch to local mode:

```bash
npm run docker:down
npm run dev:local
```

### Data Not Persisting

Check that Docker bind mounts are correct in `docker-compose.yml`:

```yaml
volumes:
  - ./pb_data:/pb_data  # Must match --dir flag
```

---

## Recommended Workflow

1. **Use Local Mode for Active Development** - Fast HMR, better DX
2. **Use Docker Mode for Testing** - Verify deployment environment
3. **Keep Docker Running for Production-like Testing** - Database migrations, etc.

---

## Summary Commands

| Task | Docker Mode | Local Mode |
|------|-------------|------------|
| Start Dev | `npm run docker:up` | `npm run dev:local` |
| Stop Dev | `npm run docker:down` | `Ctrl+C` |
| View Logs | `npm run docker:logs` | Terminal output |
| PocketBase Admin | http://localhost:8090/_ | http://localhost:8090/_ |
| SvelteKit Site | http://localhost:3050 | http://localhost:3050 |
| Setup | Automatic | `npm run pocketbase:setup` |
