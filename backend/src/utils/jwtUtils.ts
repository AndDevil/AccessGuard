import jwt from 'jsonwebtoken';
import { logger } from './logger';

const JWT_ACCESS_SECRET = process.env.JWT_SECRET || 'super-secret-access-key-replace-this-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-replace-this-in-production';

const ACCESS_TOKEN_EXPIRE = '15m'; // 15 minutes access window
const REFRESH_TOKEN_EXPIRE = '7d'; // 7 days refresh validation

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

/**
 * Generate a short-lived access token (15 mins)
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  try {
    return jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRE,
    });
  } catch (error) {
    logger.error('Failed to generate access token', error);
    throw new Error('Access token generation failed');
  }
};

/**
 * Generate a long-lived refresh token (7 days)
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  try {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRE,
    });
  } catch (error) {
    logger.error('Failed to generate refresh token', error);
    throw new Error('Refresh token generation failed');
  }
};

/**
 * Verify access token payload
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
};

/**
 * Verify refresh token payload
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};

// Backwards compatibility fallbacks
export const generateToken = generateAccessToken;
export const verifyToken = verifyAccessToken;
