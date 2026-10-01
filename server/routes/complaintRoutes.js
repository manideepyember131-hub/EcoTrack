import express from "express";
import Complaint from "../models/Complaint.js";

const router = express.Router();

// ======================================================
// CREATE COMPLAINT
// POST /api/complaints
// ======================================================

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      reportedBy,
    } = req.body;

    console.log("Create complaint request:", req.body);

    if (!title || !description || !location || !reportedBy) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, location and user are required.",
      });
    }

    const complaint = await Complaint.create({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      reportedBy,
    });

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit complaint",
      error: error.message,
    });
  }
});

// ======================================================
// GET ALL COMPLAINTS
// GET /api/complaints
// ======================================================

router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.findAll();

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Fetch complaints error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
});

// ======================================================
// GET COMPLAINTS OF A PARTICULAR USER
// GET /api/complaints/user/:userId
// ======================================================

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("Fetching complaints for user:", userId);

    const complaints = await Complaint.findByUser(userId);

    console.log("Complaints found:", complaints);

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Fetch user complaints error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user complaints",
      error: error.message,
    });
  }
});

// ======================================================
// GET WORKER'S COMPLAINTS
// GET /api/complaints/worker/:workerId
// ======================================================

router.get("/worker/:workerId", async (req, res) => {
  try {
    const { workerId } = req.params;

    const complaints = await Complaint.findByWorker(workerId);

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Fetch worker complaints error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch worker complaints",
      error: error.message,
    });
  }
});

// ======================================================
// GET COMPLAINT BY ID
// GET /api/complaints/:id
// ======================================================

router.get("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error("Fetch complaint error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaint",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE COMPLAINT STATUS
// PUT /api/complaints/:id/status
// ======================================================

router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Active",
      "Under Review",
      "In Action",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint status",
      });
    }

    const complaint = await Complaint.updateStatus(
      req.params.id,
      status
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      complaint,
    });
  } catch (error) {
    console.error("Update complaint status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update complaint status",
      error: error.message,
    });
  }
});

// ======================================================
// ASSIGN WORKER
// PUT /api/complaints/:id/assign
// ======================================================

router.put("/:id/assign", async (req, res) => {
  try {
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({
        success: false,
        message: "Worker ID is required",
      });
    }

    const complaint = await Complaint.assignWorker(
      req.params.id,
      workerId
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Worker assigned successfully",
      complaint,
    });
  } catch (error) {
    console.error("Assign worker error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign worker",
      error: error.message,
    });
  }
});

// ======================================================
// DELETE COMPLAINT
// DELETE /api/complaints/:id
// ======================================================

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Complaint.deleteById(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    console.error("Delete complaint error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete complaint",
      error: error.message,
    });
  }
});

export default router;