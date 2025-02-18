import express from "express";
import { getTranslateLog } from "../controllers/translateLogController";

const router = express.Router();

router.post("/translate", getTranslateLog);

export default router;