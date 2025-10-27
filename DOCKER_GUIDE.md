# Docker Compose Development Guide

## Overview

This project includes a Docker Compose setup that manages both **PocketBase** and **Next.js** development servers, so you don't have to start them separately.

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
- `.env.local` file configured (see `.env.example`)

### 1. Start All Services

```bash
npm run docker:up
```

This command starts both PocketBase and Next.js in detached mode (background).

**What it does:**
- ✅ Starts PocketBase on `http://localhost:8090`
- ✅ Starts Next.js dev server on `http://localhost:3000`
- ✅ Waits for PocketBase to be healthy before starting Next.js
- ✅ Enables hot reload for Next.js code changes
- ✅ Persists PocketBase data in `./pb_data/`

### 2. Access Your Application

- **Next.js App**: http://localhost:3000
- **PocketBase Admin**: http://localhost:8090/_/

### 3. View Logs

```bash
npm run docker:logs
```

To follow logs for a specific service:
```bash
docker compose logs -f nextjs
docker compose logs -f pocketbase
```

### 4. Stop All Services

```bash
npm run docker:down
```

## Available Commands

### Development

| Command | Description |
|---------|-------------|
| `npm run docker:up` | Start all services in background |
| `npm run docker:down` | Stop all services |
| `npm run docker:logs` | View logs from all services |
| `npm run docker:rebuild` | Rebuild and restart services |
| `npm run docker:clean` | Stop services and delete all data (⚠️ destructive) |
| `npm run docker:pocketbase` | Open shell in PocketBase container |

### Manual Docker Compose Commands

```bash
# Start services (with output in terminal)
docker compose up

# Rebuild containers
docker compose build

# Restart a specific service
docker compose restart nextjs
docker compose restart pocketbase

# Stop and remove containers + volumes
docker compose down -v
```

## First-Time Setup

### 1. Start Services

```bash
npm run docker:up
```

### 2. Create PocketBase Admin Account

Visit http://localhost:8090/_/ and create your admin account.

**Important:** Update `.env.local` with your credentials:
```bash
POCKETBASE_ADMIN_EMAIL=your-email@example.com
POCKETBASE_ADMIN_PASSWORD=your-secure-password
```

Then restart the Next.js service:
```bash
docker compose restart nextjs
```

### 3. Create Collections

Follow the collection schema in `MIGRATION_GUIDE.md` to create:
- projects
- qualifications
- services
- websites
- locations

### 4. Import Data (Optional)

If migrating from Airtable:

```bash
# Export from Airtable (run on host, not in Docker)
npm install airtable --legacy-peer-deps
npm run export:airtable

# Import to PocketBase
npm run import:pocketbase
```

**Note:** The import script connects to PocketBase at `http://127.0.0.1:8090` (from host machine), not the Docker internal network.

## Architecture

### Services

**pocketbase** (Backend CMS)
- Image: `ghcr.io/muchobien/pocketbase:latest`
- Port: `8090`
- Data: Persisted in `./pb_data/`
- Health check: Ensures ready before Next.js starts

**nextjs** (Development Server)
- Built from: `Dockerfile.dev`
- Port: `3000`
- Volumes: Source code mounted for hot reload
- Environment: Configured via docker-compose.yml

### Networking

Both services run on the `portfolio-network` Docker network:
- Next.js connects to PocketBase via `http://pocketbase:8090` (Docker DNS)
- Your browser connects to both via `localhost`

### Data Persistence

```
./pb_data/              # PocketBase database and files (persisted)
./pb_migrations/        # PocketBase migrations (optional)
./.airtable-export/     # Temporary export data (not committed)
```

## Development Workflow

### Making Code Changes

With Docker Compose running (`npm run docker:up`):

1. **Edit files** - Next.js hot reload works automatically
2. **Install new packages** - Restart container: `docker compose restart nextjs`
3. **Update environment variables** - Restart container: `docker compose restart nextjs`

### Rebuilding After Dependencies Change

```bash
npm run docker:rebuild
```

This rebuilds the Next.js Docker image and restarts services.

### Accessing PocketBase Shell

```bash
npm run docker:pocketbase
```

Useful for:
- Running PocketBase CLI commands
- Debugging
- Inspecting database

## Troubleshooting

### "Port 8090 already in use"

Another PocketBase instance is running. Stop it:
```bash
# Find the process
lsof -i :8090

# Kill it
kill -9 <PID>

# Or if running via Docker
docker ps
docker stop <container_id>
```

### "Port 3000 already in use"

Another Next.js server is running:
```bash
# Find and kill the process
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### "Cannot connect to PocketBase"

Check if PocketBase is healthy:
```bash
docker compose ps
docker compose logs pocketbase
```

Wait for the health check to pass (may take 30 seconds on first start).

### Hot Reload Not Working

1. Ensure source code is mounted:
   ```bash
   docker compose down
   npm run docker:up
   ```

2. Check logs:
   ```bash
   docker compose logs -f nextjs
   ```

3. Try rebuilding:
   ```bash
   npm run docker:rebuild
   ```

### PocketBase Data Corruption

If PocketBase fails to start or data is corrupted:

```bash
# ⚠️ WARNING: This deletes all data
npm run docker:clean

# Start fresh
npm run docker:up
```

### "Module not found" Errors

Dependencies changed but Docker image wasn't rebuilt:

```bash
npm run docker:rebuild
```

## Comparing: Docker vs Native

### Docker Compose (Recommended)

**Pros:**
- ✅ Single command to start everything
- ✅ Consistent environment across team
- ✅ Easy to reset/clean
- ✅ Services automatically connected
- ✅ Health checks ensure proper startup order

**Cons:**
- ❌ Slightly slower hot reload
- ❌ Requires Docker Desktop
- ❌ Uses more system resources

**Commands:**
```bash
npm run docker:up      # Start everything
npm run docker:logs    # View logs
npm run docker:down    # Stop everything
```

### Native (Alternative)

**Pros:**
- ✅ Faster hot reload
- ✅ Less resource usage
- ✅ Direct file access

**Cons:**
- ❌ Must start services separately
- ❌ Manual environment management
- ❌ Platform-specific setup

**Commands:**
```bash
# Terminal 1: Start PocketBase
./pocketbase serve

# Terminal 2: Start Next.js
npm run dev
```

## Environment Variables

Docker Compose automatically loads from `.env.local`, but some values are overridden in `docker-compose.yml`:

**Overridden for Docker:**
- `POCKETBASE_URL=http://pocketbase:8090` (internal Docker network)
- `NODE_ENV=development`
- `WATCHPACK_POLLING=true` (for hot reload)

**Used from .env.local:**
- `POCKETBASE_ADMIN_EMAIL`
- `POCKETBASE_ADMIN_PASSWORD`
- `RESEND_API_KEY`
- `CONTACT_EMAIL_TO`
- `CONTACT_EMAIL_FROM`
- `NEXT_PUBLIC_USE_MOCK_LOCATIONS`

## Production Deployment

This Docker Compose setup is for **development only**. For production:

1. Deploy PocketBase separately (see `MIGRATION_GUIDE.md`)
2. Deploy Next.js to Vercel/Netlify
3. Update `POCKETBASE_URL` to production URL

## Tips & Best Practices

### 1. Use Docker for Team Development

Ensures everyone has the same environment and dependencies.

### 2. Commit pb_data for Quick Onboarding (Optional)

If you want new team members to have sample data:
```bash
# Add to git (carefully!)
git add pb_data/
```

**⚠️ Warning:** Never commit production data or sensitive information!

### 3. Regular Backups

PocketBase data is only in `./pb_data/`. Back it up regularly:
```bash
tar -czf pb_data_backup_$(date +%Y%m%d).tar.gz pb_data/
```

### 4. Clean Up Periodically

Docker can use significant disk space:
```bash
# Remove unused images/volumes
docker system prune -a --volumes

# Or just this project's volumes
docker compose down -v
```

### 5. Use .dockerignore

Already configured to exclude:
- `node_modules/`
- `.next/`
- `.env*.local`
- `pb_data/`

## Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PocketBase Docker Image](https://github.com/muchobien/docker-pocketbase)
- [Next.js in Docker](https://nextjs.org/docs/app/building-your-application/deploying#docker-image)

---

**Quick Reference:**

```bash
# Start
npm run docker:up

# Logs
npm run docker:logs

# Stop
npm run docker:down

# Clean restart
npm run docker:clean && npm run docker:up
```

Happy developing! 🚀
