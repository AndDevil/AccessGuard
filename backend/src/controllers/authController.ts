import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService';
import { logger } from '../utils/logger';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '../utils/jwtUtils';
import { AppError } from '../utils/AppError';

// Input Validation Schemas
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

export class AuthController {
  /**
   * Handle user registration.
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info(`Processing registration request for: ${req.body.email}`);
      const user = await AuthService.register(req.body);
      res.status(201).json({
        status: 'success',
        statusCode: 201,
        message: 'User registered successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle user login. Sets HttpOnly cookies for security and returns profile + token.
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info(`Processing login request for: ${req.body.email}`);
      const user = await AuthService.login(req.body);

      // Construct JWT claim payload
      const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      // Issue dual tokens: short-lived access and long-lived refresh
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Access Token cookie (expires in 15 mins)
      res.cookie('token', accessToken, {
        httpOnly: true, // Prevents client JavaScript read access (mitigates XSS)
        secure: process.env.NODE_ENV === 'production', // Encrypts transit over HTTPS only
        sameSite: 'strict', // Mitigates Cross-Site Request Forgery (CSRF)
        maxAge: 15 * 60 * 1000,
      });

      // Refresh Token cookie (expires in 7 days)
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Login successful',
        token: accessToken, // Provided for headless testing tools (Swagger/Postman)
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rotate access tokens when the client's current session expires.
   * Reads from a separate HttpOnly refreshToken cookie.
   */
  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Processing token refresh rotation');
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new AppError('Session expired. Please log in again.', 401);
      }

      try {
        const decoded = verifyRefreshToken(refreshToken);

        // Sign new short-lived access token
        const newPayload: TokenPayload = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };
        const newAccessToken = generateAccessToken(newPayload);

        // Update token cookie
        res.cookie('token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({
          status: 'success',
          statusCode: 200,
          message: 'Token successfully rotated',
          token: newAccessToken,
        });
      } catch (err) {
        logger.warn('Failed validation check on refresh token cookie');
        throw new AppError('Session expired. Please sign in again.', 401);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle user logout by clearing the authentication token cookies.
   */
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Processing logout request');
      
      // Clear token cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      // Clear refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch authenticated user's profile details.
   */
  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized profile request.', 401);
      }

      logger.info(`Fetching profile for user: ${req.user.email}`);
      const user = await AuthService.getUserProfile(req.user.userId);
      res.status(200).json({
        status: 'success',
        statusCode: 200,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}
