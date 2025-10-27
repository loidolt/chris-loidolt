#!/bin/sh
# Initialize PocketBase with admin user
# Run this script after starting docker-compose to create the admin user

set -e

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
  export $(cat .env.local | grep -E '^POCKETBASE_ADMIN' | xargs)
fi

# Use defaults if not set
POCKETBASE_ADMIN_EMAIL=${POCKETBASE_ADMIN_EMAIL:-"loidolt@gmail.com"}
POCKETBASE_ADMIN_PASSWORD=${POCKETBASE_ADMIN_PASSWORD:-"Sykbif-dikhip-hicfu5"}

echo "🔧 Initializing PocketBase admin user..."
echo "📧 Email: ${POCKETBASE_ADMIN_EMAIL}"

# Create admin user (upsert = create if not exists, update if exists)
# IMPORTANT: Use --dir=/pb_data to match the server's data directory
docker exec pocketbase /usr/local/bin/pocketbase superuser upsert \
  --dir=/pb_data \
  "${POCKETBASE_ADMIN_EMAIL}" \
  "${POCKETBASE_ADMIN_PASSWORD}"

echo "✅ PocketBase admin user created successfully!"
echo "🔗 Login at: http://localhost:8090/_/"
