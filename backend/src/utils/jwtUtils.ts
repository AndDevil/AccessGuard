import jwt from 'jsonwebtoken';
import { logger } from './logger';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-this-in-production-123456';
const JWT_EXPIRE_IN = process.env.JWT_EXPIRE_IN || '1h';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

/**
 * Generate a JWT token containing user id, email, and role.
 * JWTs contain claim information and are signed using HMAC SHA256.
 */
export const generateToken = (payload: TokenPayload): string => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRE_IN as any,
    });
  } catch (error) {
    logger.error('Failed to generate JWT token', error);
    throw new Error('Token generation failed');
  }
};

/**
 * Verify a JWT token and decode its payload.
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    logger.error('Failed to verify JWT token', error);
    throw error; // Let the auth middleware handle different verify failures
  }
};
