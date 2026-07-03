import { Request, Response, NextFunction } from 'express';

/**
 * Authorization middleware to check if user has ADMIN privileges.
 * Must be executed after the authenticate middleware.
 */
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Authentication required before authorization.',
    });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({
      status: 'error',
      statusCode: 403,
      message: 'Forbidden. You do not have permissions to access this resource.',
    });
    return;
  }

  next();
};
