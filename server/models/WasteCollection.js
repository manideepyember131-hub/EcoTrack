import pool from "../config/db.js";

// ==========================================
// GET ALL COLLECTION SCHEDULES
// GET /api/collection/schedules
// ==========================================

export const getAllSchedules = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        ward,
        waste_type,
        collection_date,
        start_time,
        end_time,
        status
      FROM collection_schedules
      ORDER BY collection_date ASC, start_time ASC
    `);

    res.status(200).json({
      success: true,
      schedules: rows,
    });
  } catch (error) {
    console.error(
      "Error fetching collection schedules:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch collection schedules",
      error: error.message,
    });
  }
};

// ==========================================
// GET USER COLLECTION PREFERENCE
// GET /api/collection/preferences/:userId
// ==========================================

export const getUserPreference = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        id,
        user_id,
        ward,
        reminder_enabled
      FROM collection_preferences
      WHERE user_id = ?
      `,
      [userId]
    );

    // No preference exists yet
    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        preference: null,
      });
    }

    res.status(200).json({
      success: true,
      preference: rows[0],
    });
  } catch (error) {
    console.error(
      "Error fetching collection preference:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch collection preference",
      error: error.message,
    });
  }
};

// ==========================================
// SAVE / UPDATE USER COLLECTION PREFERENCE
// ==========================================

export const saveUserPreference = async (req, res) => {
  try {
    const {
      user_id,
      ward,
      reminder_enabled,
    } = req.body;

    if (!user_id || !ward) {
      return res.status(400).json({
        success: false,
        message: "user_id and ward are required",
      });
    }

    const [existing] = await pool.query(
      `
      SELECT id
      FROM collection_preferences
      WHERE user_id = ?
      `,
      [user_id]
    );

    if (existing.length > 0) {
      await pool.query(
        `
        UPDATE collection_preferences
        SET
          ward = ?,
          reminder_enabled = ?
        WHERE user_id = ?
        `,
        [
          ward,
          reminder_enabled ?? true,
          user_id,
        ]
      );
    } else {
      await pool.query(
        `
        INSERT INTO collection_preferences
        (
          user_id,
          ward,
          reminder_enabled
        )
        VALUES (?, ?, ?)
        `,
        [
          user_id,
          ward,
          reminder_enabled ?? true,
        ]
      );
    }

    res.status(200).json({
      success: true,
      message:
        "Collection preference saved successfully",
    });
  } catch (error) {
    console.error(
      "Error saving collection preference:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to save collection preference",
      error: error.message,
    });
  }
};