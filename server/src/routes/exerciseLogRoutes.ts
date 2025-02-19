import express from "express";
import { postTranslateLog } from "../controllers/translateLogController";

const router = express.Router();

router.post("/translate", postTranslateLog);

export default router;