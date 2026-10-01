import express from "express";
import cors from "cors";
import "dotenv/config";
import complaintRoutes from "./routes/complaintRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import wasteReportRoutes from "./routes/wasteReportRoutes.js";
import pool from "./config/db.js";
import wasteCollectionRoutes from "./routes/wasteCollectionRoutes.js";
import recyclingCenterRoutes from "./routes/recyclingCenterRoutes.js";
import communityActivityRoutes from "./routes/communityActivityRoutes.js";
import treePlantingRoutes from "./routes/treePlantingRoutes.js";
import myContributionsRoutes from "./routes/myContributionsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json());

// ======================================================
// MYSQL CONNECTION TEST
// ======================================================

try {
  const connection = await pool.getConnection();

  console.log("MySQL connected successfully");

  connection.release();
} catch (error) {
  console.error("MySQL connection failed:", error);
}

// ======================================================
// ROUTES
// ======================================================

// Authentication
app.use("/api/auth", authRoutes);

// Waste Reports
app.use("/api/waste-reports", wasteReportRoutes);
// Complaint routes
app.use("/api/complaints", complaintRoutes);
app.use("/api/collection", wasteCollectionRoutes);
// ======================================================
// TEST ROUTE
// ======================================================
app.use(
  "/api/recycling-centers",
  recyclingCenterRoutes
);
app.use(
  "/api/community-activities",
  communityActivityRoutes
);
app.use(
  "/api/tree-planting",
  treePlantingRoutes
);
app.use(
  "/api/my-contributions",
  myContributionsRoutes
);
app.use(
  "/api/notifications",
  notificationRoutes
);
app.use(
  "/api/worker",
  workerRoutes
);
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "EcoTrack backend is working!",
  });
});

// ======================================================
// START SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `EcoTrack server running on port ${PORT}`
  );
});