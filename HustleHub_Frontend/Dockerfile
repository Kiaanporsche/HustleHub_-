
# HustleHub+ Frontend Dockerfile
# Part 3 - React frontend containerisation

# Stage 1: Build the React application
FROM node:22-bookworm-slim AS build

# Set the working directory
WORKDIR /app

# Copy dependency files first
COPY package.json package-lock.json ./

# Install dependencies required to build React
RUN npm ci

# Copy frontend source code
COPY . .

# Build the production application
RUN npm run build

# Stage 2: Serve the built application using Nginx
FROM nginx:stable-alpine


# Copy the React production build into Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Use the custom Nginx configuration for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the frontend HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
