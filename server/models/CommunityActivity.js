import pool from "../config/db.js";

/*
========================================
GET ALL COMMUNITY ACTIVITIES
========================================
*/

export const getAllCommunityActivities = async (
  req,
  res
) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        title,
        description,
        activity_date,
        start_time,
        end_time,
        location,
        participants,
        capacity,
        category,
        icon,
        status
      FROM community_activities
      ORDER BY activity_date ASC, start_time ASC
    `);

    res.status(200).json({
      success: true,
      activities: rows,
    });
  } catch (error) {
    console.error(
      "Error fetching community activities:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch community activities",
      error: error.message,
    });
  }
};


/*
========================================
GET USER'S JOINED ACTIVITIES
========================================
*/

export const getUserJoinedActivities = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    const [rows] = await pool.query(
      `
      SELECT activity_id
      FROM community_activity_participants
      WHERE user_id = ?
      `,
      [userId]
    );

    res.status(200).json({
      success: true,
      joinedActivities: rows.map(
        (row) => row.activity_id
      ),
    });
  } catch (error) {
    console.error(
      "Error fetching joined activities:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch joined activities",
      error: error.message,
    });
  }
};


/*
========================================
JOIN ACTIVITY
========================================
*/

export const joinCommunityActivity = async (
  req,
  res
) => {
  const connection =
    await pool.getConnection();

  try {
    const {
      activity_id,
      user_id,
    } = req.body;

    if (!activity_id || !user_id) {
      return res.status(400).json({
        success: false,
        message:
          "activity_id and user_id are required",
      });
    }

    await connection.beginTransaction();

    /*
    Lock the activity row while checking
    available capacity.
    */

    const [activities] =
      await connection.query(
        `
        SELECT
          id,
          participants,
          capacity,
          status
        FROM community_activities
        WHERE id = ?
        FOR UPDATE
        `,
        [activity_id]
      );

    if (activities.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const activity = activities[0];

    /*
    Check whether the user already joined.
    */

    const [existing] =
      await connection.query(
        `
        SELECT id
        FROM community_activity_participants
        WHERE activity_id = ?
        AND user_id = ?
        `,
        [
          activity_id,
          user_id,
        ]
      );

    if (existing.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "You have already joined this activity",
      });
    }

    /*
    Check capacity.
    */

    if (
      activity.participants >=
        activity.capacity ||
      activity.status === "Full"
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "This activity is already full",
      });
    }

    /*
    Insert participation record.
    */

    await connection.query(
      `
      INSERT INTO community_activity_participants
      (
        activity_id,
        user_id
      )
      VALUES (?, ?)
      `,
      [
        activity_id,
        user_id,
      ]
    );

    /*
    Increase participant count.
    */

    const newParticipantCount =
      activity.participants + 1;

    const newStatus =
      newParticipantCount >=
      activity.capacity
        ? "Full"
        : "Open";

    await connection.query(
      `
      UPDATE community_activities
      SET
        participants = ?,
        status = ?
      WHERE id = ?
      `,
      [
        newParticipantCount,
        newStatus,
        activity_id,
      ]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message:
        "Successfully joined the activity",
      participants:
        newParticipantCount,
      status: newStatus,
    });
  } catch (error) {
    await connection.rollback();

    console.error(
      "Error joining community activity:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to join community activity",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};


/*
========================================
LEAVE ACTIVITY
========================================
*/

export const leaveCommunityActivity = async (
  req,
  res
) => {
  const connection =
    await pool.getConnection();

  try {
    const {
      activity_id,
      user_id,
    } = req.body;

    if (!activity_id || !user_id) {
      return res.status(400).json({
        success: false,
        message:
          "activity_id and user_id are required",
      });
    }

    await connection.beginTransaction();

    /*
    Lock activity row.
    */

    const [activities] =
      await connection.query(
        `
        SELECT
          id,
          participants,
          capacity
        FROM community_activities
        WHERE id = ?
        FOR UPDATE
        `,
        [activity_id]
      );

    if (activities.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const activity = activities[0];

    /*
    Check whether user actually joined.
    */

    const [existing] =
      await connection.query(
        `
        SELECT id
        FROM community_activity_participants
        WHERE activity_id = ?
        AND user_id = ?
        `,
        [
          activity_id,
          user_id,
        ]
      );

    if (existing.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "You have not joined this activity",
      });
    }

    /*
    Remove participation.
    */

    await connection.query(
      `
      DELETE FROM community_activity_participants
      WHERE activity_id = ?
      AND user_id = ?
      `,
      [
        activity_id,
        user_id,
      ]
    );

    /*
    Decrease participant count.
    */

    const newParticipantCount =
      Math.max(
        activity.participants - 1,
        0
      );

    await connection.query(
      `
      UPDATE community_activities
      SET
        participants = ?,
        status = 'Open'
      WHERE id = ?
      `,
      [
        newParticipantCount,
        activity_id,
      ]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message:
        "You have left the activity",
      participants:
        newParticipantCount,
      status: "Open",
    });
  } catch (error) {
    await connection.rollback();

    console.error(
      "Error leaving community activity:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to leave community activity",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};