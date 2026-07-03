# Stage 1: Development target (supports hot-reload via tsx watch)
FROM node:20-alpine AS development

WORKDIR /app

# Install OpenSSL library required by Prisma engines in Alpine
RUN apk add --no-cache openssl

# Copy dependency definitions
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies like tsx)
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code and entrypoint
COPY . .
RUN chmod +x entrypoint.sh

# Expose internal Express port
EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]
# Default development command runs the tsx watcher
CMD ["npm", "run", "dev"]


# Stage 2: Production builder
FROM development AS builder
RUN npm run build


# Stage 3: Production runner (minimal runtime environment)
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
# Install only production dependencies
RUN npm install --only=production

# Copy client binary and schema
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built distribution from builder
COPY --from=builder /app/dist ./dist
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "start"]
