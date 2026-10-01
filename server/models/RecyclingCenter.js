import pool from "../config/db.js";

// ==========================================
// GET ALL RECYCLING CENTERS
// GET /api/recycling-centers
// ==========================================

export const getAllRecyclingCenters = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        name,
        address,
        city,
        state,
        pincode,
        latitude,
        longitude,
        phone,
        website,
        waste_types,
        opening_hours,
        source_name,
        source_url,
        verification_status,
        is_active
      FROM recycling_centers
      WHERE is_active = TRUE
      ORDER BY name ASC
    `);

    res.status(200).json({
      success: true,
      centers: rows,
    });
  } catch (error) {
    console.error(
      "Error fetching recycling centers:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch recycling centers",
      error: error.message,
    });
  }
};