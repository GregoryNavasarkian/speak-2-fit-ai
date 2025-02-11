import express from "express";
import { getTest } from "../controllers/testController";

const router = express.Router();

router.get("/", getTest);

export default router;
