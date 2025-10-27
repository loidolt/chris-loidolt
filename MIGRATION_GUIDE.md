# Airtable to PocketBase Migration Guide

## ✅ Refactor Complete!

Your codebase has been successfully refactored to use PocketBase instead of Airtable. All type checks pass and the application is ready for runtime data fetching.

## What Was Changed

### 1. Dependencies
- ✅ Installed `pocketbase` SDK (v0.26.3)
- ✅ Removed `airtable` SDK
- ✅ Added `tsx` for running TypeScript scripts

### 2. Data Layer
**Created:**
- `src/lib/pocketbase.ts` - New PocketBase data layer with identical interface to the old Airtable implementation

**Deleted:**
- `src/lib/airtable.ts` - Old Airtable data layer
- `src/lib/downloadImages.ts` - No longer needed (images served directly from PocketBase)
- `src/lib/imageManifest.ts` - No longer needed (no build-time image caching)

### 3. Pages Updated (Runtime Fetching)
- ✅ `src/app/page.tsx` - Homepage
- ✅ `src/app/projects/page.tsx` - Projects grid
- ✅ `src/app/projects/[slug]/page.tsx` - Project detail (removed `generateStaticParams`)
- ✅ `src/app/about/page.tsx` - About page
- ✅ `src/app/gis/page.tsx` - GIS map page
- ✅ `src/app/api/unlock-location/route.ts` - Location unlock API

### 4. Components Updated
All components now import from `@/lib/pocketbase` instead of `@/lib/airtable`:
- ProjectsGrid, ProjectDetailClient
- MapViewer, GISMapClient, LocationDetailPanel, LocationShareButton
- MarkerClusterGroup
- Map panels: LocationInfoPanel, LocationsListPanel, SearchPanel
- Hook: useLocationFilters

### 5. Migration Scripts Created
- `scripts/export-airtable.ts` - Exports all Airtable data to JSON
- `scripts/import-pocketbase.ts` - Imports JSON data into PocketBase

### 6. Environment Variables
Updated `.env.local` and `.env.example` with PocketBase configuration:
```bash
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=changeme123
```

## 🚀 Next Steps: Setting Up PocketBase

### Step 1: Download and Install PocketBase

**Option A: Download Binary (Recommended for local development)**
```bash
# Download from https://pocketbase.io/docs/
# Or use curl (macOS/Linux):
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.31.0/pocketbase_0.31.0_darwin_amd64.zip -o pocketbase.zip
unzip pocketbase.zip
chmod +x pocketbase

# Start PocketBase
./pocketbase serve
```

**Option B: Use Docker**
```bash
docker pull ghcr.io/muchobien/pocketbase:latest
docker run -p 8090:8090 -v $(pwd)/pb_data:/pb/pb_data ghcr.io/muchobien/pocketbase:latest
```

Access the admin dashboard at: `http://127.0.0.1:8090/_/`

### Step 2: Create Admin Account

On first launch, PocketBase will prompt you to create an admin account at `http://127.0.0.1:8090/_/`

**Important:** Update `.env.local` with your actual admin credentials:
```bash
POCKETBASE_ADMIN_EMAIL=your-email@example.com
POCKETBASE_ADMIN_PASSWORD=your-secure-password
```

### Step 3: Create Collections

**For up-to-date collection schemas, see:**
- `MANUAL_COLLECTION_SETUP.md` - Step-by-step manual collection setup guide
- `POCKETBASE_SCHEMA.md` - Complete schema reference

**Quick Summary:**

Create these 5 collections in the PocketBase admin dashboard:

1. **projects** - Portfolio projects with images, 3D models, and metadata
2. **skills** - Professional skills, programming languages, and certifications (NOTE: named "skills", not "qualifications")
3. **services** - Services offered with descriptions and icons
4. **websites** - Website links and status pages
5. **locations** - Geographic locations for GIS map features

**Important Notes:**
- The "qualifications" collection should be named **"skills"** to match the actual data structure
- Follow `MANUAL_COLLECTION_SETUP.md` for complete field definitions, types, and API rules
- Estimated setup time: 10-15 minutes

### Step 4: Migrate Your Data from Airtable

**For detailed migration instructions, see:**
- `MIGRATION_QUICKSTART.md` - Fast-track 20-minute migration guide
- `MIGRATION_SUMMARY.md` - Comprehensive migration documentation
- `AIRTABLE_UPDATE_GUIDE.md` - Airtable preparation steps

#### Quick Migration Steps:

**1. Prepare Airtable** (Follow `AIRTABLE_UPDATE_GUIDE.md`)
- Add Order fields to Qualifications, Services, Websites tables
- Populate order values (1, 2, 3...)

**2. Export Data from Airtable**
```bash
# Install Airtable SDK temporarily
npm install airtable --legacy-peer-deps

# Run export script
npm run export:airtable
```

**3. Import Data into PocketBase**
```bash
# Ensure PocketBase is running and collections are created
# Update .env.local with admin credentials

# Run import script
npm run import:pocketbase
```

**4. Seed Sample Locations** (Optional)
```bash
npm run seed:locations
```

**5. Verify Import**
- Check PocketBase admin dashboard
- Verify all data and images imported correctly

**6. Clean Up** (Optional)
```bash
# Remove temporary Airtable SDK
npm uninstall airtable --legacy-peer-deps

# Remove export directory if no longer needed
rm -rf .airtable-export/
```

### Step 5: Test the Application

Start your Next.js development server:
```bash
npm run dev
```

Visit `http://localhost:3000` and test:
- ✅ Homepage loads and displays project stats
- ✅ Projects page shows all projects with search/filter
- ✅ Individual project pages load with images and 3D models
- ✅ About page displays qualifications and services
- ✅ GIS map page shows locations
- ✅ Location password unlock works (if applicable)
- ✅ Contact form still works

### Step 6: Deploy to Production

#### Deploy PocketBase

**Option 1: Fly.io (Recommended)**
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Create a fly.toml in your project root:
cat > fly.toml << 'EOF'
app = "your-app-name"

[build]
  image = "ghcr.io/muchobien/pocketbase:latest"

[env]
  PORT = "8090"

[[services]]
  internal_port = 8090
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[mounts]
  source = "pb_data"
  destination = "/pb/pb_data"
EOF

# Deploy
fly launch
fly volumes create pb_data --size 1
fly deploy
```

**Option 2: Railway**
- Go to https://railway.app
- Create new project → Deploy PocketBase
- Add volume for persistent storage
- Set environment variables

**Option 3: Self-Hosted VPS**
```bash
# SSH into your server
ssh user@your-server.com

# Download PocketBase
wget https://github.com/pocketbase/pocketbase/releases/download/v0.31.0/pocketbase_0.31.0_linux_amd64.zip
unzip pocketbase_0.31.0_linux_amd64.zip
chmod +x pocketbase

# Create systemd service
sudo nano /etc/systemd/system/pocketbase.service

# Add:
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/pocketbase
ExecStart=/opt/pocketbase/pocketbase serve --http=127.0.0.1:8090
Restart=on-failure

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable pocketbase
sudo systemctl start pocketbase

# Set up nginx reverse proxy
# Add SSL with Let's Encrypt
```

#### Deploy Next.js App

Update `.env.local` for production:
```bash
POCKETBASE_URL=https://your-pocketbase.fly.dev
# Or your production PocketBase URL
```

Deploy to Vercel/Netlify:
```bash
# Vercel
vercel --prod

# Or Netlify
netlify deploy --prod
```

## 🎯 Key Benefits Achieved

✅ **Cost Savings** - No more Airtable subscription fees
✅ **Data Ownership** - Full control over your data and infrastructure
✅ **Real-Time Updates** - Content changes reflect immediately without rebuilds
✅ **Better DX** - Simpler SDK, built-in admin dashboard, easier content management
✅ **Self-Hosting** - Deploy anywhere (Fly.io, Railway, VPS, Docker)

## 📋 Architecture Changes

### Before (Airtable + Build-Time Fetching)
```
Build Time:
Airtable API → Download Images → Cache Locally → Static HTML

Runtime:
Serve Pre-rendered HTML + Local Images
```

### After (PocketBase + Runtime Fetching)
```
Build Time:
Next.js compilation (no data fetching)

Runtime:
Request → PocketBase API → Dynamic HTML
Images served directly from PocketBase
```

## 🔧 Troubleshooting

### "Cannot connect to PocketBase"
- Ensure PocketBase is running: `./pocketbase serve`
- Check `POCKETBASE_URL` in `.env.local`
- Verify port 8090 is not blocked

### "Authentication failed"
- Verify admin credentials in `.env.local`
- Check that admin account exists in PocketBase dashboard

### "Collection not found"
- Ensure all 5 collections are created in PocketBase
- Verify field names match exactly (case-sensitive)

### "Images not displaying"
- Check that files were uploaded during import
- Verify PocketBase URL is accessible from browser
- Check browser console for CORS errors

### Import Script Fails
- Ensure `.airtable-export/` directory exists
- Verify PocketBase is running and accessible
- Check that collections exist before importing

## 📚 Additional Resources

- [PocketBase Documentation](https://pocketbase.io/docs/)
- [PocketBase JavaScript SDK](https://github.com/pocketbase/js-sdk)
- [PocketBase Collections Guide](https://pocketbase.io/docs/collections/)
- [PocketBase File Handling](https://pocketbase.io/docs/files-handling/)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

## 🆘 Need Help?

If you encounter issues:
1. Check PocketBase logs: `./pocketbase serve` output
2. Check Next.js console for errors
3. Verify environment variables are set correctly
4. Review the PocketBase admin dashboard for data integrity

---

**Migration completed successfully! 🎉**

Next step: Set up PocketBase, run the migration scripts, and test your application.
