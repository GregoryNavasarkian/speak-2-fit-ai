import express from "express";
import { postTranslateLog } from "../controllers/translateLogController";
import { postExerciseLog, getExerciseLogs } from "../controllers/exerciseLogController";

const router = express.Router();

router.post("/translate", postTranslateLog);
router.post("/", postExerciseLog)
router.get("/", getExerciseLogs)

export default router;