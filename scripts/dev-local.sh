#!/bin/bash

# Local development script - runs PocketBase and SvelteKit together
# This avoids Docker's HMR issues while keeping data persistence

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

POCKETBASE_BIN="./pocketbase_local/pocketbase"

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"

    # Kill PocketBase if running
    if [ -n "$POCKETBASE_PID" ] && kill -0 "$POCKETBASE_PID" 2>/dev/null; then
        echo -e "${BLUE}Stopping PocketBase (PID: $POCKETBASE_PID)${NC}"
        kill $POCKETBASE_PID 2>/dev/null || true
    fi

    # Kill Vite if running
    if [ -n "$VITE_PID" ] && kill -0 "$VITE_PID" 2>/dev/null; then
        echo -e "${BLUE}Stopping Vite (PID: $VITE_PID)${NC}"
        kill $VITE_PID 2>/dev/null || true
    fi

    echo -e "${GREEN}All services stopped${NC}"
    exit 0
}

# Register cleanup function
trap cleanup SIGINT SIGTERM EXIT

# Check if PocketBase binary exists
if [ ! -f "$POCKETBASE_BIN" ]; then
    echo -e "${YELLOW}PocketBase binary not found. Running setup...${NC}"
    bash scripts/setup-pocketbase-local.sh
fi

# Start PocketBase
echo -e "${GREEN}Starting PocketBase on http://localhost:8090${NC}"
$POCKETBASE_BIN serve --http=127.0.0.1:8090 --dir=pb_data &
POCKETBASE_PID=$!

# Wait for PocketBase to be ready
echo -e "${BLUE}Waiting for PocketBase to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:8090/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}PocketBase is ready!${NC}"
        break
    fi

    if [ $i -eq 30 ]; then
        echo -e "${RED}PocketBase failed to start${NC}"
        cleanup
        exit 1
    fi

    sleep 1
done

# Start SvelteKit
echo -e "${GREEN}Starting SvelteKit on http://localhost:3050${NC}"
POCKETBASE_URL=http://127.0.0.1:8090 npm run dev &
VITE_PID=$!

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Local Development Environment Running${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}PocketBase Admin:${NC} http://localhost:8090/_/"
echo -e "${BLUE}SvelteKit Site:${NC}   http://localhost:3050"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Wait for both processes
wait
