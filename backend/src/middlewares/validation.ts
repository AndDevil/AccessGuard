import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

/**
 * Higher-order middleware function to validate incoming request bodies against a Zod schema.
 */
export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error); // Pass ZodError to the global errorHandler middleware
    }
  };
};

/**
 * Higher-order middleware function to validate request params (route params) against a Zod schema.
 */
export const validateParams = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      next(error);
    }
  };
};
