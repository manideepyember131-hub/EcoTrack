import express from "express";

import Notification from "../models/Notification.js";

const router = express.Router();

// --------------------------------------------------
// Get all notifications for a user
// GET /api/notifications/:userId
// --------------------------------------------------
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const notifications =
      await Notification.findByUser(userId);

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(
      "Error fetching notifications:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
});

// --------------------------------------------------
// Mark one notification as read
// PUT /api/notifications/:id/read
// --------------------------------------------------
router.put("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const updated =
      await Notification.markAsRead(
        id,
        user_id
      );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error(
      "Error marking notification as read:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
});

// --------------------------------------------------
// Mark all notifications as read
// PUT /api/notifications/user/:userId/read-all
// --------------------------------------------------
router.put(
  "/user/:userId/read-all",
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required",
        });
      }

      const updatedCount =
        await Notification.markAllAsRead(userId);

      return res.status(200).json({
        success: true,
        message:
          "All notifications marked as read",
        updatedCount,
      });
    } catch (error) {
      console.error(
        "Error marking all notifications as read:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to mark all notifications as read",
        error: error.message,
      });
    }
  }
);

// --------------------------------------------------
// Delete one notification
// DELETE /api/notifications/:id
// --------------------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const deleted =
      await Notification.deleteById(
        id,
        user_id
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error(
      "Error deleting notification:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
});

export default router;