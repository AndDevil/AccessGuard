# Stage 1: Development target (contains Node, packages, and supports hot-reload)
FROM node:20-alpine AS development

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install packages
RUN npm install

# Copy source code
COPY . .

# Expose Vite internal port
EXPOSE 80

# Default development command
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "80"]


# Stage 2: Compilation builder
FROM development AS builder
RUN npm run build


# Stage 3: Production Nginx target
FROM nginx:alpine AS production

# Copy built files from builder stage to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to support API proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
