import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string; // e.g., Prisma error codes
}

/**
 * Express centralized error handling middleware.
 * Intercepts errors thrown in routes, logs details, and structures JSON responses.
 */
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error details using our custom logger
  logger.error(`Error on request [${req.method}] ${req.path}:`, err);

  // If Zod validation error occurs, handle and format it nicely
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle Prisma unique constraint violations (e.g., duplicate email)
  if (err.code === 'P2002') {
    res.status(409).json({
      status: 'error',
      statusCode: 409,
      message: 'Resource already exists',
      details: 'A record with this unique field already exists.',
    });
    return;
  }

  // Handle other Prisma database errors
  if (err.code?.startsWith('P')) {
    res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Database operation failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
    return;
  }

  // Fallback generic response
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // Hide stack trace in production for safety
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
