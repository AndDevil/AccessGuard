import dotenv from 'dotenv';
// Load environment variables before importing other modules
dotenv.config();

import app from './app';
import { logger } from './utils/logger';
import { prisma } from './utils/prismaClient';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`AccessGuard Server successfully launched on port ${PORT}`);
  logger.info(`Swagger API Documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle graceful shutdown routines
const shutdown = async (signal: string) => {
  logger.warn(`Received ${signal}. Starting graceful shutdown procedure...`);
  
  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await prisma.$disconnect();
      logger.info('Prisma Database connection closed.');
      process.exit(0);
    } catch (err) {
      logger.error('Failed to close Prisma Client connection gracefully:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10s timeout
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout expiration.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception detected:', error);
  process.exit(1);
});

// Log unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection detected at:', promise, 'Reason:', reason);
});
