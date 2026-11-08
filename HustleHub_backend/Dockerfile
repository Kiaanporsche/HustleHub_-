
# HustleHub+ Backend Dockerfile
# Part 3 - Docker containerisation

# Use Node.js 22 LTS as the base image
FROM node:22-bookworm-slim

# Set the working directory inside the container
WORKDIR /app

# Copy dependency manifests first for Docker layer caching
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy the backend application files
COPY . .

# Configure the application environment
ENV NODE_ENV=production

# Document the backend's HTTPS port
EXPOSE 3000

# Start the Express backend
CMD ["npm", "start"]
