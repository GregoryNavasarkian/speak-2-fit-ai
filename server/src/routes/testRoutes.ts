import express from "express";
import { getTest, getTestError, getTestGenericError } from "../controllers/testController";

const router = express.Router();

router.get("/", getTest);
router.get("/error", getTestError);
router.get("/generic-error", getTestGenericError);

export default router;
