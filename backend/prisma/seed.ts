import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@accessguard.com';
  const userEmail = 'user@accessguard.com';

  // Secure default password hashing using bcrypt
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed or update the default ADMIN account
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: passwordHash,
      role: 'ADMIN',
    },
    create: {
      email: adminEmail,
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  // 2. Seed or update the default USER account
  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      password: passwordHash,
      role: 'USER',
    },
    create: {
      email: userEmail,
      password: passwordHash,
      role: 'USER',
    },
  });

  console.log('AccessGuard Database seeded successfully:');
  console.log(`- [ADMIN]: ${admin.email} (password: password123)`);
  console.log(`- [USER ]: ${user.email} (password: password123)`);
}

main()
  .catch((error) => {
    console.error('Error encountered during database seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
