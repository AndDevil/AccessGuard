import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService';
import { logger } from '../utils/logger';

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
   * Handle user login. Sets HttpOnly cookie for security and returns profile + token backup.
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info(`Processing login request for: ${req.body.email}`);
      const { token, user } = await AuthService.login(req.body);

      // Security measure: Store JWT in HttpOnly cookie to mitigate XSS attacks
      const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRE_DAYS || '1', 10);
      res.cookie('token', token, {
        httpOnly: true, // Prevents JavaScript from reading the cookie
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
        sameSite: 'strict', // Mitigates CSRF requests
        maxAge: cookieExpireDays * 24 * 60 * 60 * 1000, // Expiration
      });

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Login successful',
        token, // Included for non-browser testing tools like Swagger/Postman
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle user logout by clearing the authentication token cookie.
   */
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Processing logout request');
      res.clearCookie('token', {
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
        res.status(401).json({
          status: 'error',
          statusCode: 401,
          message: 'Unauthorized profile request.',
        });
        return;
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
