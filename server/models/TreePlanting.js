import pool from "../config/db.js";

// Get all tree planting events
export const getAllTreePlantingEvents = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.trees_planned,
        e.capacity,
        e.icon,
        e.status,
        COUNT(r.id) AS registered
      FROM tree_planting_events e
      LEFT JOIN tree_planting_registrations r
        ON e.id = r.event_id
      GROUP BY
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.start_time,
        e.end_time,
        e.location,
        e.trees_planned,
        e.capacity,
        e.icon,
        e.status
      ORDER BY e.event_date ASC, e.start_time ASC
    `);

    const events = rows.map((event) => ({
      ...event,
      registered: Number(event.registered),
      trees_planned: Number(event.trees_planned),
      capacity: Number(event.capacity),
    }));

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error(
      "Error fetching tree planting events:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch tree planting events",
      error: error.message,
    });
  }
};


// Get events registered by a specific user
export const getUserRegisteredEvents = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await pool.query(
      `
        SELECT
          event_id
        FROM tree_planting_registrations
        WHERE user_id = ?
        ORDER BY registered_at DESC
      `,
      [userId]
    );

    const eventIds = rows.map(
      (row) => Number(row.event_id)
    );

    res.status(200).json({
      success: true,
      eventIds,
    });
  } catch (error) {
    console.error(
      "Error fetching user tree planting registrations:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch registered events",
      error: error.message,
    });
  }
};


// Register a user for an event
export const registerForTreePlantingEvent = async (
  req,
  res
) => {
  try {
    const { user_id, event_id } = req.body;

    if (!user_id || !event_id) {
      return res.status(400).json({
        success: false,
        message: "user_id and event_id are required",
      });
    }

    // Check whether the event exists
    const [eventRows] = await pool.query(
      `
        SELECT
          id,
          capacity,
          status
        FROM tree_planting_events
        WHERE id = ?
      `,
      [event_id]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tree planting event not found",
      });
    }

    const event = eventRows[0];

    if (
      event.status === "Completed" ||
      event.status === "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: "This event is no longer available for registration",
      });
    }

    // Check if user is already registered
    const [existingRows] = await pool.query(
      `
        SELECT id
        FROM tree_planting_registrations
        WHERE event_id = ?
          AND user_id = ?
      `,
      [event_id, user_id]
    );

    if (existingRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    // Count current registrations
    const [countRows] = await pool.query(
      `
        SELECT COUNT(*) AS registered
        FROM tree_planting_registrations
        WHERE event_id = ?
      `,
      [event_id]
    );

    const registered = Number(
      countRows[0].registered
    );

    if (registered >= event.capacity) {
      return res.status(409).json({
        success: false,
        message: "This event is already full",
      });
    }

    // Create registration
    await pool.query(
      `
        INSERT INTO tree_planting_registrations
        (
          event_id,
          user_id
        )
        VALUES (?, ?)
      `,
      [event_id, user_id]
    );

    // Mark event as full when capacity is reached
    if (registered + 1 >= event.capacity) {
      await pool.query(
        `
          UPDATE tree_planting_events
          SET status = 'Full'
          WHERE id = ?
        `,
        [event_id]
      );
    }

    res.status(201).json({
      success: true,
      message: "Successfully registered for the tree planting event",
    });
  } catch (error) {
    console.error(
      "Error registering for tree planting event:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to register for the event",
      error: error.message,
    });
  }
};