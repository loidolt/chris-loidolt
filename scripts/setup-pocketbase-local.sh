#!/bin/bash

# Script to download PocketBase binary for local development
# Automatically detects OS and architecture

set -e

POCKETBASE_VERSION="0.31.0"
POCKETBASE_DIR="./pocketbase_local"
POCKETBASE_BIN="$POCKETBASE_DIR/pocketbase"

# Detect OS and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Map architecture names
case "$ARCH" in
    x86_64)
        ARCH="amd64"
        ;;
    aarch64|arm64)
        ARCH="arm64"
        ;;
esac

# Map OS names
case "$OS" in
    darwin)
        OS="darwin"
        ;;
    linux)
        OS="linux"
        ;;
    *)
        echo "Unsupported OS: $OS"
        exit 1
        ;;
esac

echo "Detected platform: $OS $ARCH"

# Create directory if it doesn't exist
mkdir -p "$POCKETBASE_DIR"

# Check if PocketBase binary already exists
if [ -f "$POCKETBASE_BIN" ]; then
    CURRENT_VERSION=$($POCKETBASE_BIN --version 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
    echo "PocketBase already exists (version: $CURRENT_VERSION)"

    if [ "$CURRENT_VERSION" = "$POCKETBASE_VERSION" ]; then
        echo "Already at the correct version ($POCKETBASE_VERSION)"
        exit 0
    else
        echo "Updating from $CURRENT_VERSION to $POCKETBASE_VERSION..."
    fi
fi

# Download URL
DOWNLOAD_URL="https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_${OS}_${ARCH}.zip"

echo "Downloading PocketBase v${POCKETBASE_VERSION}..."
echo "URL: $DOWNLOAD_URL"

# Download and extract
curl -L "$DOWNLOAD_URL" -o "$POCKETBASE_DIR/pocketbase.zip"
unzip -o "$POCKETBASE_DIR/pocketbase.zip" -d "$POCKETBASE_DIR"
rm "$POCKETBASE_DIR/pocketbase.zip"

# Make executable
chmod +x "$POCKETBASE_BIN"

echo "PocketBase v${POCKETBASE_VERSION} installed successfully at $POCKETBASE_BIN"
echo ""
echo "To start PocketBase locally, run:"
echo "  npm run pocketbase:local"
