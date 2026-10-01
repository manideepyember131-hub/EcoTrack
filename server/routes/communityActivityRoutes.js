import express from "express";

import {
  getAllCommunityActivities,
  getUserJoinedActivities,
  joinCommunityActivity,
  leaveCommunityActivity,
} from "../models/CommunityActivity.js";

const router = express.Router();


/*
========================================
GET ALL ACTIVITIES
GET /api/community-activities
========================================
*/

router.get(
  "/",
  getAllCommunityActivities
);


/*
========================================
GET USER'S JOINED ACTIVITIES
GET /api/community-activities/joined/:userId
========================================
*/

router.get(
  "/joined/:userId",
  getUserJoinedActivities
);


/*
========================================
JOIN ACTIVITY
POST /api/community-activities/join
========================================
*/

router.post(
  "/join",
  joinCommunityActivity
);


/*
========================================
LEAVE ACTIVITY
DELETE /api/community-activities/leave
========================================
*/

router.delete(
  "/leave",
  leaveCommunityActivity
);


export default router;