#!/bin/sh

echo "Generating Prisma Client..."
npx prisma generate

echo "Waiting for database tables synchronization..."
npx prisma db push

echo "Seeding default database records..."
npx prisma db seed

# Execute the container command (npm start or npm run dev)
exec "$@"
