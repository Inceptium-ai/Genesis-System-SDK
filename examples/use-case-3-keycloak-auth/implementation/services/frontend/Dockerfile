# Development Dockerfile for Vite React frontend
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server with host flag for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
