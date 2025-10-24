import express from "express";

import { getTest, postTest } from "../controllers/test.controller.js";

const router = express.Router();

// GET /api/test
router.get("/", getTest);

// POST /api/test
router.post("/", postTest);

export default router;
