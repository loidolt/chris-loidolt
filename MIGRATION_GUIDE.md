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

In the PocketBase admin dashboard, create these 5 collections:

#### **projects** Collection
| Field Name | Type | Options |
|------------|------|---------|
| title | text | required |
| slug | text | required, unique |
| description | text | |
| longDescription | editor | |
| markdown | editor | |
| tags | json | |
| categories | json | |
| date | date | |
| featuredImage | file | single, maxSelect: 1 |
| gallery | file | multiple, maxSelect: 20 |
| modelFile | text | |
| modelPath | text | |
| modelUrl | url | |
| repository | url | |
| website | url | |
| attribution | url | |
| status | select | options: Draft, Published |
| cleanRepo | bool | |
| featured | bool | |

#### **qualifications** Collection
| Field Name | Type | Options |
|------------|------|---------|
| title | text | required |
| institution | text | required |
| year | text | required |
| description | text | |

#### **services** Collection
| Field Name | Type | Options |
|------------|------|---------|
| title | text | required |
| description | text | required |
| icon | text | |

#### **websites** Collection
| Field Name | Type | Options |
|------------|------|---------|
| name | text | required |
| url | url | required |
| description | text | |

#### **locations** Collection
| Field Name | Type | Options |
|------------|------|---------|
| name | text | required |
| description | text | |
| latitude | number | required |
| longitude | number | required |
| category | text | |
| categories | json | |
| image | file | single, maxSelect: 1 |
| url | url | |
| status | select | options: Draft, Published |
| privacy | select | options: Public, Private |
| password | text | |
| shareToken | text | |

### Step 4: Migrate Your Data from Airtable

#### 4.1 Export Data from Airtable
```bash
# First, temporarily install Airtable SDK
npm install airtable --legacy-peer-deps

# Run the export script
npm run export:airtable

# This will create a .airtable-export/ directory with:
# - JSON files for each collection
# - files/ directory with all downloaded images
```

#### 4.2 Import Data into PocketBase
```bash
# Make sure PocketBase is running first!
# Update .env.local with your PocketBase admin credentials

# Run the import script
npm run import:pocketbase

# This will:
# - Create records in PocketBase
# - Upload all file attachments
# - Log progress and any errors
```

#### 4.3 Verify Data Import
Check the PocketBase admin dashboard to verify all data was imported correctly.

#### 4.4 Clean Up (Optional)
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
