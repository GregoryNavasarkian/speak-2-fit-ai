import { Request, Response, NextFunction } from "express";

// GET /api/test
// @desc Test route
// @access Public
export const getTest = (_req: Request, res: Response, next: NextFunction) => {
  const test = { message: "Test route" };
  try {
    res.status(200).json(test);
  } catch (error) {
    next(error);
  }
}
