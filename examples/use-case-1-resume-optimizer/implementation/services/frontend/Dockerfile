# =============================================================================
# Frontend Dockerfile - Production Build
# =============================================================================
# Multi-stage build:
# 1. Build React app with Vite
# 2. Serve with nginx

# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Stage 2: Serve (unprivileged nginx: runs as uid 101, listens on 8080,
# pid/temp files live in /tmp — no root needed anywhere at runtime)
FROM nginxinc/nginx-unprivileged:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

USER nginx

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
