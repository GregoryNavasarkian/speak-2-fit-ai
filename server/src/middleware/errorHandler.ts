import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
}

// Custom Error Handler
export const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction): void => {
  void _next;
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
  });
};

