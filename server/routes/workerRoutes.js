import express from "express";
import Worker from "../models/Worker.js";

const router = express.Router();

// ==================================================
// HELPER - VALIDATE WORKER
// ==================================================

const validateWorker = async (userId) => {
  if (!userId) {
    return null;
  }

  const profile = await Worker.getProfile(userId);

  return profile || null;
};

// ==================================================
// GET COMPLETE WORKER DASHBOARD
// ==================================================

router.get("/dashboard/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // Make sure this user is actually a worker
    const worker = await validateWorker(userId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found",
      });
    }

    const dashboard = await Worker.getDashboard(userId);

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: "Worker dashboard not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Error fetching worker dashboard:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch worker dashboard",
      error: error.message,
    });
  }
});

// ==================================================
// GET WORKER PROFILE
// ==================================================

router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const profile = await Worker.getProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Error fetching worker profile:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch worker profile",
      error: error.message,
    });
  }
});

// ==================================================
// UPDATE WORKER WORKING LOCATION
// ==================================================

router.put("/location/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { latitude, longitude } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    if (
      latitude === undefined ||
      longitude === undefined ||
      latitude === null ||
      longitude === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const latitudeNumber = Number(latitude);
    const longitudeNumber = Number(longitude);

    if (
      !Number.isFinite(latitudeNumber) ||
      !Number.isFinite(longitudeNumber)
    ) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude must be valid numbers",
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
        message: "Invalid latitude or longitude values",
      });
    }

    const worker = await validateWorker(userId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found",
      });
    }

    const updated = await Worker.updateLocation(
      userId,
      latitudeNumber,
      longitudeNumber
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Worker location updated successfully",
      data: {
        userId,
        latitude: latitudeNumber,
        longitude: longitudeNumber,
      },
    });
  } catch (error) {
    console.error("Error updating worker location:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update worker location",
      error: error.message,
    });
  }
});

// ==================================================
// GET ALL ASSIGNED TASKS FOR A WORKER
// ==================================================
//
// IMPORTANT:
// userId here means:
// users.id = worker_profiles.user_id
//
// This must match worker_tasks.assigned_to.
// ==================================================

router.get("/tasks/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const worker = await validateWorker(userId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found",
      });
    }

    const tasks = await Worker.getAssignedTasks(userId);

    return res.status(200).json({
      success: true,
      workerId: Number(userId),
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error(
      "Error fetching assigned worker tasks:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned tasks",
      error: error.message,
    });
  }
});

// ==================================================
// GET TASK BY ID FOR A SPECIFIC WORKER
// ==================================================
//
// This verifies BOTH:
// 1. task ID
// 2. worker/user ID
//
// So a worker cannot access another worker's task.
// ==================================================

router.get("/tasks/:taskId/:userId", async (req, res) => {
  try {
    const { taskId, userId } = req.params;

    if (!taskId || !userId) {
      return res.status(400).json({
        success: false,
        message: "taskId and userId are required",
      });
    }

    const worker = await validateWorker(userId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found",
      });
    }

    const task = await Worker.getTaskById(
      taskId,
      userId
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message:
          "Task not found or task is not assigned to this worker",
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error(
      "Error fetching worker task:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch task",
      error: error.message,
    });
  }
});

// ==================================================
// START TASK
// ==================================================

router.post(
  "/tasks/:taskId/:userId/start",
  async (req, res) => {
    try {
      const { taskId, userId } = req.params;

      if (!taskId || !userId) {
        return res.status(400).json({
          success: false,
          message: "taskId and userId are required",
        });
      }

      const worker = await validateWorker(userId);

      if (!worker) {
        return res.status(404).json({
          success: false,
          message: "Worker profile not found",
        });
      }

      const updated = await Worker.startTask(
        taskId,
        userId
      );

      if (!updated) {
        return res.status(400).json({
          success: false,
          message:
            "Task cannot be started. It may not be pending or may not belong to this worker.",
        });
      }

      // Return updated task so frontend has current data
      const updatedTask = await Worker.getTaskById(
        taskId,
        userId
      );

      return res.status(200).json({
        success: true,
        message: "Task started successfully",
        data: updatedTask,
      });
    } catch (error) {
      console.error("Error starting task:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to start task",
        error: error.message,
      });
    }
  }
);

// ==================================================
// COMPLETE TASK
// ==================================================

router.post(
  "/tasks/:taskId/:userId/complete",
  async (req, res) => {
    try {
      const { taskId, userId } = req.params;

      if (!taskId || !userId) {
        return res.status(400).json({
          success: false,
          message: "taskId and userId are required",
        });
      }

      const worker = await validateWorker(userId);

      if (!worker) {
        return res.status(404).json({
          success: false,
          message: "Worker profile not found",
        });
      }

      const updated = await Worker.completeTask(
        taskId,
        userId
      );

      if (!updated) {
        return res.status(400).json({
          success: false,
          message:
            "Task cannot be completed. It may not be in progress or may not belong to this worker.",
        });
      }

      // Return updated task
      const updatedTask = await Worker.getTaskById(
        taskId,
        userId
      );

      return res.status(200).json({
        success: true,
        message: "Task completed successfully",
        data: updatedTask,
      });
    } catch (error) {
      console.error(
        "Error completing task:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to complete task",
        error: error.message,
      });
    }
  }
);

export default router;