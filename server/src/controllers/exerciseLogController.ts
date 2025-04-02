import { Request, Response, NextFunction } from "express";
import ExerciseLog from "../models/exerciseLogModel";

// @desc Create a new exercise log in the database
// @route POST /api/exercise-log
// @access Public
export const postExerciseLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.body.exercises || !Array.isArray(req.body.exercises)) {
      res.status(400).json({ message: "Invalid exercise data" });
      return;
    }
    const newLog = await ExerciseLog.create({ log: req.body.exercises });
    res.status(201).json({ message: "Exercise log created successfully", log: newLog });
  } catch (error) {
    next(error);
  }
};

// GET /api/exercise-log
// @desc Get all exercise logs from the database
// @access Public
export const getExerciseLogs = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await ExerciseLog.find();
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

// GET /api/exercise-log/:id
// @desc Get a single exercise log from the database by id
// @access Public
export const getExerciseLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const log = await ExerciseLog.findById(req.params.id);
    if (!log) {
      res.status(404).json({ message: "Exercise log not found" });
      return;
    }
    res.status(200).json(log);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/exercise-log/:id
// @desc Update a single exercise log from the database by id
// @access Public
export const updateExerciseLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ExerciseLog.findByIdAndUpdate(req.params.id, { log: req.body });
    res.status(200).json({ message: "Exercise log updated successfully" });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/exercise-log/:id
// @desc Delete a single exercise log from the database by id
// @access Public
export const deleteExerciseLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ExerciseLog.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Exercise log deleted successfully" });
  } catch (error) {
    next(error);
  }
};
