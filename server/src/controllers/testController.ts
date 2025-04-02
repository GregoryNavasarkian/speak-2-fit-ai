import { Request, Response, NextFunction } from "express";

// @desc Test route
// @route GET /api/test
// @access Public
export const getTest = (_req: Request, res: Response) => {
  res.status(200).json({ message: "Test route" });
};

// @desc Test error route
// @route GET /api/test/error
// @access Public
export const getTestError = (_req: Request, _res: Response, next: NextFunction) => {
  next(new Error("Boom!"));
};

// @desc Test generic error
// @route GET /api/test/generic-error
// @access Public
export const getTestGenericError = (_req: Request, _res: Response, next: NextFunction) => {
  next({});
};
