# Development Dockerfile for Vite React frontend
FROM node:20-alpine

WORKDIR /app

# Run as the image's built-in unprivileged `node` user (dev port 5173 is unprivileged)
RUN chown node:node /app
USER node

# Install dependencies first (for better caching)
COPY --chown=node:node package*.json ./
RUN npm install

# Copy source files
COPY --chown=node:node . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server with host flag for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
