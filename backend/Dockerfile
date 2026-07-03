# Base node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install OpenSSL library required by Prisma engines in Alpine
RUN apk add --no-cache openssl

# Copy dependency definitions
COPY package*.json ./
COPY tsconfig.json ./

# Install packages
RUN npm install

# Copy Prisma schema and generate client before copying source code
# (This leverages Docker layer caching if schema doesn't change)
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY src ./src/
COPY entrypoint.sh ./

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# Compile TypeScript
RUN npm run build

# Expose internal port
EXPOSE 5000

# Set default startup entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "start"]
