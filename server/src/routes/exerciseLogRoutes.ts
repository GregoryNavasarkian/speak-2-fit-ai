import express from "express";
import { postTranslateLog } from "../controllers/translateLogController";
import { 
    postExerciseLog, 
    getExerciseLogs, 
    getExerciseLog, 
    updateExerciseLog, 
    deleteExerciseLog 
} from "../controllers/exerciseLogController";

const router = express.Router();

router.post("/translate", postTranslateLog);
router.post("/", postExerciseLog);
router.get("/", getExerciseLogs);
router.get("/:id", getExerciseLog);
router.patch("/:id", updateExerciseLog);
router.delete("/:id", deleteExerciseLog);

export default router;
