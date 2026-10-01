import pool from "../config/db.js";

export const getUserContributionSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    // --------------------------------------------------
    // Validate user ID
    // --------------------------------------------------
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const numericUserId = Number(userId);

    if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    // --------------------------------------------------
    // 1. Eco Points
    //
    // eco_points is the source of truth for points
    // earned by the user.
    // --------------------------------------------------
    const [pointsRows] = await pool.query(
      `
      SELECT
        COALESCE(SUM(points), 0) AS total_points
      FROM eco_points
      WHERE user_id = ?
      `,
      [numericUserId]
    );

    const totalPoints = Number(
      pointsRows[0]?.total_points || 0
    );

    // --------------------------------------------------
    // 2. Waste Reports
    //
    // Count all waste reports submitted by this user.
    // --------------------------------------------------
    const [reportRows] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_reports
      FROM waste_reports
      WHERE reported_by = ?
      `,
      [numericUserId]
    );

    const totalReports = Number(
      reportRows[0]?.total_reports || 0
    );

    // --------------------------------------------------
    // 3. Completed Collections
    // --------------------------------------------------
    const [collectionRows] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_collections
      FROM collection_completions
      WHERE user_id = ?
      `,
      [numericUserId]
    );

    const totalCollections = Number(
      collectionRows[0]?.total_collections || 0
    );

    // --------------------------------------------------
    // 4. Community Activities
    // --------------------------------------------------
    const [communityRows] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_activities
      FROM community_activity_participants
      WHERE user_id = ?
      `,
      [numericUserId]
    );

    const totalActivities = Number(
      communityRows[0]?.total_activities || 0
    );

    // --------------------------------------------------
    // 5. Tree Planting Participation
    // --------------------------------------------------
    const [treeRows] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_tree_events
      FROM tree_planting_registrations
      WHERE user_id = ?
      `,
      [numericUserId]
    );

    const totalTreeEvents = Number(
      treeRows[0]?.total_tree_events || 0
    );

    // --------------------------------------------------
    // 6. Recent Contributions
    // --------------------------------------------------
    const [recentRows] = await pool.query(
      `
      SELECT
        id,
        points,
        activity_type,
        description,
        created_at
      FROM eco_points
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
      `,
      [numericUserId]
    );

    const recentContributions = recentRows.map(
      (activity) => ({
        id: activity.id,
        points: Number(activity.points || 0),
        activityType:
          activity.activity_type || "Eco Activity",
        description:
          activity.description ||
          activity.activity_type ||
          "Eco contribution",
        createdAt: activity.created_at,
      })
    );

    // --------------------------------------------------
    // 7. Achievement Status
    // --------------------------------------------------
    const achievements = [
      {
        icon: "eco",
        title: "Eco Starter",
        description:
          "Earned your first 100 eco points",
        unlocked: totalPoints >= 100,
      },

      {
        icon: "report_problem",
        title: "Civic Reporter",
        description:
          "Submitted 10 waste reports",
        unlocked: totalReports >= 10,
      },

      {
        icon: "park",
        title: "Green Guardian",
        description:
          "Participated in 5 tree planting events",
        unlocked: totalTreeEvents >= 5,
      },

      {
        icon: "volunteer_activism",
        title: "Community Champion",
        description:
          "Join 10 community activities",
        unlocked: totalActivities >= 10,
      },
    ];

    // --------------------------------------------------
    // 8. Response
    // --------------------------------------------------
    return res.status(200).json({
      success: true,

      summary: {
        totalPoints,
        totalReports,
        totalCollections,
        totalActivities,
        totalTreeEvents,
      },

      recentContributions,

      achievements,
    });
  } catch (error) {
    console.error(
      "Error fetching user contribution summary:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch contribution summary",
      error: error.message,
    });
  }
};