import express from "express";

import {
  getAllTreePlantingEvents,
  getUserRegisteredEvents,
  registerForTreePlantingEvent,
} from "../models/TreePlanting.js";

const router = express.Router();

router.get(
  "/",
  getAllTreePlantingEvents
);

router.get(
  "/registered/:userId",
  getUserRegisteredEvents
);

router.post(
  "/register",
  registerForTreePlantingEvent
);

export default router;