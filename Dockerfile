# Multi-stage Dockerfile for SvelteKit with Node adapter
# Optimized for production deployment with Node.js server

# Stage 1: Build the SvelteKit app
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build the SvelteKit app (SSR with Node adapter)
RUN npm run build

# Stage 2: Serve with minimal Node server
FROM node:22-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json

# Expose port (SvelteKit default: 3000)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the server
CMD ["node", "build"]