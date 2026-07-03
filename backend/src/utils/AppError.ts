/**
 * Custom application operational error class.
 * Inherits from standard Error to support status codes and stack trace captures.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace excluding the constructor call itself
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
