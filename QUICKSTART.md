# Quick Start Guide

## 🚀 Get Started in 3 Commands

### Option A: Docker Compose (Recommended)

```bash
# 1. Start everything
npm run docker:up

# 2. Create PocketBase admin account
# Visit http://localhost:8090/_/ and create your admin
# Then update .env.local with your credentials

# 3. Access your app
# Next.js: http://localhost:3000
# PocketBase Admin: http://localhost:8090/_/
```

That's it! Both PocketBase and Next.js are running.

### Option B: Native Development

```bash
# Terminal 1: Start PocketBase
./pocketbase serve

# Terminal 2: Start Next.js
npm run dev

# Access at http://localhost:3000
```

## 📚 Full Documentation

- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Complete Docker Compose documentation
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Airtable to PocketBase migration
- **[CLAUDE.md](./CLAUDE.md)** - Project architecture and development guide

## 🛠 Common Commands

### Docker Compose
```bash
npm run docker:up          # Start all services
npm run docker:down        # Stop all services
npm run docker:logs        # View logs
npm run docker:rebuild     # Rebuild after changes
npm run docker:clean       # Reset everything (⚠️ deletes data)
```

### Native Development
```bash
npm run dev                # Start Next.js dev server
npm run typecheck          # TypeScript type checking
npm run lint               # ESLint
```

### Data Migration (from Airtable)
```bash
npm run export:airtable    # Export from Airtable
npm run import:pocketbase  # Import to PocketBase
```

## 📦 What's Included

- **PocketBase** (port 8090) - Self-hosted CMS
- **Next.js** (port 3000) - React application
- **Docker Compose** - Orchestration with health checks
- **Hot Reload** - Automatic code reloading
- **Data Persistence** - Local storage in `./pb_data/`

## 🔧 First-Time Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo>
   cd chris-loidolt
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start with Docker Compose**
   ```bash
   npm run docker:up
   ```

5. **Create PocketBase admin**
   - Visit http://localhost:8090/_/
   - Create your admin account
   - Update `.env.local` with credentials
   - Restart: `docker compose restart nextjs`

6. **Create collections**
   - Follow schema in `MIGRATION_GUIDE.md`
   - Create: projects, qualifications, services, websites, locations

7. **Import data (optional)**
   ```bash
   npm run export:airtable    # If migrating from Airtable
   npm run import:pocketbase
   ```

8. **Access your app**
   - App: http://localhost:3000
   - PocketBase: http://localhost:8090/_/

## ❓ Troubleshooting

**"Port already in use"**
```bash
# Kill conflicting processes
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
lsof -i :8090 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**"Cannot connect to PocketBase"**
```bash
# Check if services are running
docker compose ps

# View logs
npm run docker:logs
```

**"Hot reload not working"**
```bash
# Rebuild containers
npm run docker:rebuild
```

**Need a fresh start?**
```bash
# ⚠️ This deletes all data
npm run docker:clean
npm run docker:up
```

## 🎯 Next Steps

1. ✅ Get the app running (you're here!)
2. 📚 Read [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) for details
3. 🚀 Set up PocketBase collections
4. 📊 Import your data
5. 🎨 Start building!

---

**Need help?** Check the full guides:
- Docker questions → [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
- Migration help → [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- Architecture → [CLAUDE.md](./CLAUDE.md)
