# syntax=docker/dockerfile:1

# =========================================
# Stage 1: Build React Frontend
# =========================================
FROM node:22-alpine AS frontend-build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy source code
COPY src ./src
COPY index.html ./
COPY vite.config.ts ./

# Build React frontend
RUN npm run build

# =========================================
# Stage 2: Build Backend & Final Image
# =========================================
FROM node:22-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install production dependencies only
RUN --mount=type=cache,target=/root/.npm npm ci --only=production

# Copy TypeScript build configuration
COPY tsconfig.json ./

# Copy backend server code
COPY server ./server

# Copy compiled frontend from build stage
COPY --from=frontend-build /app/dist ./dist

# Expose API port
EXPOSE 3001

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Default command: run backend server
CMD ["node", "server/index.js"]
