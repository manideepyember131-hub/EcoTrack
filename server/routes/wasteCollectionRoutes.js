import express from "express";

import {
  getAllSchedules,
  getUserPreference,
  saveUserPreference,
} from "../models/WasteCollection.js";

const router = express.Router();

// ==========================================
// GET ALL COLLECTION SCHEDULES
// GET /api/collection/schedules
// ==========================================

router.get("/schedules", getAllSchedules);

// ==========================================
// GET COLLECTION PREFERENCE FOR A USER
// GET /api/collection/preferences/:userId
// ==========================================

router.get("/preferences/:userId", getUserPreference);

// ==========================================
// SAVE / UPDATE COLLECTION PREFERENCE
// POST /api/collection/preferences
// ==========================================

router.post("/preferences", saveUserPreference);

export default router;