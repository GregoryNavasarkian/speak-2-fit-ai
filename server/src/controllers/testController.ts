import { Request, Response, NextFunction } from "express";

// GET /api/test
// @desc Test route
// @access Public
export const getTest = (_req: Request, res: Response, next: NextFunction) => {
  const test = { message: "Test route" };
  try {
    if (!test) {
      // if not async function can define status
      return next({ status: 400, message: "Test not found" });
      // if async function above wont work so use below
      // throw new Error("Test not found");
    }
    res.status(200).json(test);
  } catch (error) {
    next(error);
  }
}
