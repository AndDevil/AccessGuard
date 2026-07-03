import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClient = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prismaClient;
}

// Log connection status
prismaClient.$connect()
  .then(() => {
    logger.info('Database connected successfully via Prisma Client');
  })
  .catch((err) => {
    logger.error('Database connection failure via Prisma Client', err);
  });

export { prismaClient as prisma };
