import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwtUtils';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authentication middleware that authenticates requests containing a valid JWT.
 * It checks the 'token' HttpOnly cookie first, then falls back to checking the 'Authorization: Bearer <JWT>' header.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;

    // 1. Try to read token from cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Try to read token from Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Authentication required. No credentials provided.',
      });
      return;
    }

    // Verify token
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (err: any) {
      logger.warn(`Failed token verification: ${err.message}`);
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Invalid or expired authentication token.',
      });
    }
  } catch (error) {
    next(error);
  }
};
