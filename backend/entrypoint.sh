#!/bin/sh

echo "Generating Prisma Client..."
npx prisma generate

echo "Waiting for database tables synchronization..."
npx prisma db push

# Execute the container command (npm start or npm run dev)
exec "$@"
