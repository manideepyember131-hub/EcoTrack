import express from "express";
import WasteReport from "../models/WasteReport.js";
import Complaint from "../models/Complaint.js";
import pool from "../config/db.js";

const router = express.Router();

// ======================================================
// CREATE WASTE REPORT
// POST /api/waste-reports
// ======================================================

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      wasteType,
      location,
      image,
      reportedBy,

      // GPS coordinates
      latitude,
      longitude,
    } = req.body;

    // ------------------------------------------
    // Validate required fields
    // ------------------------------------------

    if (
      !title ||
      !description ||
      !wasteType ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide title, description, waste type and location.",
      });
    }

    // ------------------------------------------
    // Validate GPS coordinates
    // ------------------------------------------

    let latitudeNumber = null;
    let longitudeNumber = null;

    if (
      latitude !== undefined &&
      latitude !== null &&
      longitude !== undefined &&
      longitude !== null
    ) {
      latitudeNumber = Number(latitude);
      longitudeNumber = Number(longitude);

      if (
        !Number.isFinite(latitudeNumber) ||
        !Number.isFinite(longitudeNumber)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid latitude or longitude.",
        });
      }

      if (
        latitudeNumber < -90 ||
        latitudeNumber > 90 ||
        longitudeNumber < -180 ||
        longitudeNumber > 180
      ) {
        return res.status(400).json({
          success: false,
          message: "Latitude or longitude is out of range.",
        });
      }
    }

    console.log("======================================");
    console.log("CREATING WASTE REPORT");
    console.log("Latitude:", latitudeNumber);
    console.log("Longitude:", longitudeNumber);
    console.log("======================================");

    // ------------------------------------------
    // Create Waste Report in MySQL
    // ------------------------------------------

    const savedReport = await WasteReport.create({
      title: title.trim(),
      description: description.trim(),
      wasteType,
      location: location.trim(),
      image: image || "",
      reportedBy: reportedBy || null,

      // IMPORTANT:
      // Pass GPS coordinates to WasteReport.create()
      latitude: latitudeNumber,
      longitude: longitudeNumber,
    });

    console.log(
      "WASTE REPORT CREATED:",
      savedReport
    );

    // ------------------------------------------
    // Automatically create Complaint
    // ------------------------------------------

    let complaint = null;

    if (reportedBy) {
      console.log(
        "CREATING COMPLAINT FOR USER:",
        reportedBy
      );

      complaint = await Complaint.create({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        reportedBy,
      });

      console.log(
        "COMPLAINT CREATED:",
        complaint
      );
    }

    // ------------------------------------------
    // Response
    // ------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Waste report submitted successfully",
      report: savedReport,
      complaint,
    });

  } catch (error) {
    console.error(
      "Waste report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to submit waste report",
      error: error.message,
    });
  }
});

// ======================================================
// GET ALL WASTE REPORTS
// GET /api/waste-reports
// ======================================================

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        wr.id, 
        wr.title, 
        wr.description, 
        wr.waste_type, 
        wr.location, 
        wr.image, 
        wr.status, 
        wr.reported_by,
        wr.latitude,
        wr.longitude,
        wr.created_at, 
        wr.updated_at,

        u.name AS reported_by_name, 
        u.email AS reported_by_email 

      FROM waste_reports wr 

      LEFT JOIN users u 
        ON wr.reported_by = u.id 

      ORDER BY wr.created_at DESC
    `);

    // ------------------------------------------
    // Convert MySQL format to frontend format
    // ------------------------------------------

    const reports = rows.map((row) => ({
      id: row.id,
      _id: row.id,

      title: row.title,
      description: row.description,

      wasteType: row.waste_type,
      location: row.location,

      image: row.image,
      status: row.status,

      // GPS coordinates
      latitude:
        row.latitude !== null
          ? Number(row.latitude)
          : null,

      longitude:
        row.longitude !== null
          ? Number(row.longitude)
          : null,

      reportedBy: row.reported_by
        ? {
            id: row.reported_by,
            name: row.reported_by_name,
            email: row.reported_by_email,
          }
        : null,

      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return res.status(200).json({
      success: true,
      reports,
    });

  } catch (error) {
    console.error(
      "Fetch reports error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch waste reports",
      error: error.message,
    });
  }
});

// ======================================================
// GET WASTE REPORT BY ID
// GET /api/waste-reports/:id
// ======================================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const report =
      await WasteReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Waste report not found",
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });

  } catch (error) {
    console.error(
      "Fetch report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch waste report",
      error: error.message,
    });
  }
});

// ======================================================
// GET REPORTS BY USER
// GET /api/waste-reports/user/:userId
// ======================================================

router.get(
  "/user/:userId",
  async (req, res) => {
    try {
      const { userId } = req.params;

      const reports =
        await WasteReport.findByUser(userId);

      return res.status(200).json({
        success: true,
        reports,
      });

    } catch (error) {
      console.error(
        "Fetch user reports error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch user's waste reports",
        error: error.message,
      });
    }
  }
);

// ======================================================
// UPDATE WASTE REPORT STATUS
// PUT /api/waste-reports/:id/status
// ======================================================

router.put(
  "/:id/status",
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "Pending",
        "Assigned",
        "In Progress",
        "Resolved",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid waste report status",
        });
      }

      const updatedReport =
        await WasteReport.updateStatus(
          id,
          status
        );

      if (!updatedReport) {
        return res.status(404).json({
          success: false,
          message:
            "Waste report not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Waste report status updated successfully",
        report: updatedReport,
      });

    } catch (error) {
      console.error(
        "Update status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update waste report status",
        error: error.message,
      });
    }
  }
);

// ======================================================
// DELETE WASTE REPORT
// DELETE /api/waste-reports/:id
// ======================================================

router.delete(
  "/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      const deleted =
        await WasteReport.deleteById(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message:
            "Waste report not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Waste report deleted successfully",
      });

    } catch (error) {
      console.error(
        "Delete report error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete waste report",
        error: error.message,
      });
    }
  }
);

// ======================================================
// EXPORT ROUTER
// ======================================================

export default router;