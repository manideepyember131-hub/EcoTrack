import express from "express";

import {
  getUserContributionSummary,
} from "../models/MyContributions.js";

const router = express.Router();

router.get(
  "/:userId",
  getUserContributionSummary
);

export default router;