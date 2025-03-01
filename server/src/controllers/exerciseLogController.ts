import { Request, Response, NextFunction } from "express";
import ExerciseLog from "../models/exerciseLogModel";

// POST /api/exercise-log
// @desc This endpoint takes the verified and submitted data from the pending logs and creates an entry in the database and sends back the success or error message to the frontend.
// @access Public
export const postExerciseLog = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        await ExerciseLog.create({ log: _req.body });
        res.status(200).json({ message: "Exercise log created successfully" });
    } catch (error) {
        next(error);
        res.status(500).json({ message: "Error creating exercise log" });
    }
}

// GET /api/exercise-log
// @desc Get all exercise logs from the database
// @access Public
export const getExerciseLogs = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const logs = await ExerciseLog.find();
        res.status(200).json(logs);
    } catch (error) {
        next(error);
        res.status(500).json({ message: "Error fetching exercise logs" });
    }
}

// GET /api/exercise-log/:id
// @desc Get a single exercise log from the database by id
// @access Public
export const getExerciseLog = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const log = await ExerciseLog.findById(_req.params.id);
        res.status(200).json(log);
    } catch (error) {
        next(error);
        res.status(500).json({ message: "Error fetching exercise log " + _req.params.id });
    }
}

// PATCH /api/exercise-log/:id
// @desc Update a single exercise log from the database by id
// @access Public
export const updateExerciseLog = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        await ExerciseLog.findByIdAndUpdate(_req.params.id, {log: _req.body});
        res.status(200).json({ message: "Exercise log updated successfully" });
    } catch (error) {
        next(error);
        res.status(500).json({ message: "Error updating exercise log " + _req.params.id });
    }
}

// DELETE /api/exercise-log/:id
// @desc Delete a single exercise log from the database by id
// @access Public
export const deleteExerciseLog = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        await ExerciseLog.findByIdAndDelete(_req.params.id);
        res.status(200).json({ message: "Exercise log deleted successfully" });
    } catch (error) {
        next(error);
        res.status(500).json({ message: "Error deleting exercise log " + _req.params.id });
    }
}