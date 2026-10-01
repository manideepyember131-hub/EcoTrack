import pool from "../config/db.js";

class Worker {
  // ==================================================
  // GET WORKER PROFILE
  // ==================================================

  static async getProfile(userId) {
    const [rows] = await pool.query(
      `
      SELECT
        wp.id,
        wp.user_id,
        wp.worker_code,
        wp.zone,
        wp.vehicle,
        wp.status,
        wp.latitude,
        wp.longitude,
        u.name,
        u.email,
        u.phone,
        u.role
      FROM worker_profiles wp
      INNER JOIN users u
        ON u.id = wp.user_id
      WHERE wp.user_id = ?
        AND u.role = 'worker'
      LIMIT 1
      `,
      [userId]
    );

    return rows[0] || null;
  }

  // ==================================================
  // UPDATE WORKER WORKING LOCATION
  // ==================================================

  static async updateLocation(userId, latitude, longitude) {
    const [result] = await pool.query(
      `
      UPDATE worker_profiles
      SET
        latitude = ?,
        longitude = ?,
        updated_at = NOW()
      WHERE user_id = ?
      `,
      [latitude, longitude, userId]
    );

    return result.affectedRows > 0;
  }

  // ==================================================
  // FORMAT TASK
  // ==================================================
  // Keep the response format identical everywhere.
  // Frontend uses camelCase fields.
  // ==================================================

  static formatTask(row) {
    return {
      id: row.id,

      taskCode: row.task_code,
      wasteReportId: row.waste_report_id,

      title: row.title,
      description: row.description,

      taskType: row.task_type,
      priority: row.priority,

      location: row.location,

      scheduledDate: row.scheduled_date,
      scheduledTime: row.scheduled_time,

      status: row.status,

      startedAt: row.started_at,
      completedAt: row.completed_at,

      createdAt: row.created_at,
      updatedAt: row.updated_at,

      latitude: row.latitude,
      longitude: row.longitude,
    };
  }

  // ==================================================
  // GET ALL ASSIGNED TASKS
  // ==================================================

  static async getAssignedTasks(userId) {
    try {
      const [rows] = await pool.query(
        `
        SELECT
          wt.id,
          wt.task_code,
          wt.waste_report_id,
          wt.title,
          wt.description,
          wt.task_type,
          wt.priority,
          wt.location,

          DATE_FORMAT(
            wt.scheduled_date,
            '%Y-%m-%d'
          ) AS scheduled_date,

          TIME_FORMAT(
            wt.scheduled_time,
            '%H:%i:%s'
          ) AS scheduled_time,

          wt.status,
          wt.started_at,
          wt.completed_at,
          wt.created_at,
          wt.updated_at,

          wr.latitude,
          wr.longitude

        FROM worker_tasks wt

        LEFT JOIN waste_reports wr
          ON wt.waste_report_id = wr.id

        WHERE wt.assigned_to = ?

        ORDER BY
          wt.scheduled_date ASC,
          wt.scheduled_time ASC,
          wt.created_at DESC
        `,
        [userId]
      );

      return rows.map((row) => Worker.formatTask(row));
    } catch (error) {
      console.error("Error fetching assigned tasks:", error);
      throw error;
    }
  }

  // ==================================================
  // GET TASK STATISTICS
  // ==================================================

  static async getTaskStats(userId) {
    const [rows] = await pool.query(
      `
      SELECT
        COUNT(*) AS assigned_tasks,

        SUM(
          CASE
            WHEN status = 'Pending'
            THEN 1
            ELSE 0
          END
        ) AS pending_tasks,

        SUM(
          CASE
            WHEN status = 'In Progress'
            THEN 1
            ELSE 0
          END
        ) AS in_progress_tasks,

        SUM(
          CASE
            WHEN status = 'Completed'
            THEN 1
            ELSE 0
          END
        ) AS completed_tasks

      FROM worker_tasks

      WHERE assigned_to = ?
      `,
      [userId]
    );

    const stats = rows[0] || {};

    return {
      assignedTasks: Number(stats.assigned_tasks || 0),
      pending: Number(stats.pending_tasks || 0),
      inProgress: Number(stats.in_progress_tasks || 0),
      completed: Number(stats.completed_tasks || 0),
    };
  }

  // ==================================================
  // GET TODAY'S TASKS
  // ==================================================

  static async getTodayTasks(userId) {
    const [rows] = await pool.query(
      `
      SELECT
        wt.id,
        wt.task_code,
        wt.waste_report_id,
        wt.title,
        wt.description,
        wt.task_type,
        wt.priority,
        wt.location,

        DATE_FORMAT(
          wt.scheduled_date,
          '%Y-%m-%d'
        ) AS scheduled_date,

        TIME_FORMAT(
          wt.scheduled_time,
          '%H:%i:%s'
        ) AS scheduled_time,

        wt.status,
        wt.started_at,
        wt.completed_at,
        wt.created_at,
        wt.updated_at,

        wr.latitude,
        wr.longitude

      FROM worker_tasks wt

      LEFT JOIN waste_reports wr
        ON wt.waste_report_id = wr.id

      WHERE wt.assigned_to = ?
        AND wt.scheduled_date = CURDATE()
        AND wt.status != 'Cancelled'

      ORDER BY
        wt.scheduled_time ASC,
        wt.created_at DESC
      `,
      [userId]
    );

    return rows.map((row) => Worker.formatTask(row));
  }

  // ==================================================
  // GET TASK BY ID
  // ==================================================

  static async getTaskById(taskId, userId) {
    try {
      const [rows] = await pool.query(
        `
        SELECT
          wt.id,
          wt.task_code,
          wt.waste_report_id,
          wt.title,
          wt.description,
          wt.task_type,
          wt.priority,
          wt.location,

          DATE_FORMAT(
            wt.scheduled_date,
            '%Y-%m-%d'
          ) AS scheduled_date,

          TIME_FORMAT(
            wt.scheduled_time,
            '%H:%i:%s'
          ) AS scheduled_time,

          wt.status,
          wt.started_at,
          wt.completed_at,
          wt.created_at,
          wt.updated_at,

          wr.latitude,
          wr.longitude

        FROM worker_tasks wt

        LEFT JOIN waste_reports wr
          ON wt.waste_report_id = wr.id

        WHERE wt.id = ?
          AND wt.assigned_to = ?

        LIMIT 1
        `,
        [taskId, userId]
      );

      if (rows.length === 0) {
        return null;
      }

      return Worker.formatTask(rows[0]);
    } catch (error) {
      console.error("Error fetching task details:", error);
      throw error;
    }
  }

  // ==================================================
  // START TASK
  // ==================================================

  static async startTask(taskId, userId) {
    const [tasks] = await pool.query(
      `
      SELECT
        id,
        waste_report_id

      FROM worker_tasks

      WHERE id = ?
        AND assigned_to = ?
        AND status = 'Pending'

      LIMIT 1
      `,
      [taskId, userId]
    );

    if (tasks.length === 0) {
      return false;
    }

    const wasteReportId = tasks[0].waste_report_id;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Update worker task
      const [taskResult] = await connection.query(
        `
        UPDATE worker_tasks

        SET
          status = 'In Progress',
          started_at = NOW(),
          updated_at = NOW()

        WHERE id = ?
          AND assigned_to = ?
          AND status = 'Pending'
        `,
        [taskId, userId]
      );

      if (taskResult.affectedRows === 0) {
        await connection.rollback();
        connection.release();

        return false;
      }

      // Update citizen waste report
      if (wasteReportId) {
        await connection.query(
          `
          UPDATE waste_reports

          SET
            status = 'In Progress',
            updated_at = NOW()

          WHERE id = ?
          `,
          [wasteReportId]
        );
      }

      await connection.commit();

      connection.release();

      return true;
    } catch (error) {
      await connection.rollback();
      connection.release();

      console.error(
        "Error starting worker task:",
        error
      );

      throw error;
    }
  }

  // ==================================================
  // COMPLETE TASK
  // ==================================================

  static async completeTask(taskId, userId) {
    const [tasks] = await pool.query(
      `
      SELECT
        id,
        waste_report_id

      FROM worker_tasks

      WHERE id = ?
        AND assigned_to = ?
        AND status = 'In Progress'

      LIMIT 1
      `,
      [taskId, userId]
    );

    if (tasks.length === 0) {
      return false;
    }

    const wasteReportId = tasks[0].waste_report_id;

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Worker task becomes COMPLETED
      const [taskResult] = await connection.query(
        `
        UPDATE worker_tasks

        SET
          status = 'Completed',
          completed_at = NOW(),
          updated_at = NOW()

        WHERE id = ?
          AND assigned_to = ?
          AND status = 'In Progress'
        `,
        [taskId, userId]
      );

      if (taskResult.affectedRows === 0) {
        await connection.rollback();
        connection.release();

        return false;
      }

      // Citizen report becomes RESOLVED
      if (wasteReportId) {
        await connection.query(
          `
          UPDATE waste_reports

          SET
            status = 'Resolved',
            updated_at = NOW()

          WHERE id = ?
          `,
          [wasteReportId]
        );
      }

      await connection.commit();

      connection.release();

      return true;
    } catch (error) {
      await connection.rollback();
      connection.release();

      console.error(
        "Error completing worker task:",
        error
      );

      throw error;
    }
  }

  // ==================================================
  // GET RECENT WORKER ACTIVITY
  // ==================================================

  static async getRecentActivity(userId) {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        task_code,
        title,
        status,
        completed_at,
        updated_at

      FROM worker_tasks

      WHERE assigned_to = ?

      ORDER BY updated_at DESC

      LIMIT 10
      `,
      [userId]
    );

    return rows.map((task) => ({
      id: task.id,
      taskCode: task.task_code,
      title: task.title,
      status: task.status,
      completedAt: task.completed_at,
      updatedAt: task.updated_at,
    }));
  }

  // ==================================================
  // GET COMPLETE WORKER DASHBOARD
  // ==================================================

  static async getDashboard(userId) {
    const profile = await Worker.getProfile(userId);

    if (!profile) {
      return null;
    }

    // Statistics for ALL tasks assigned to this worker
    const stats = await Worker.getTaskStats(userId);

    // Only tasks scheduled for TODAY
    const todayTasks = await Worker.getTodayTasks(userId);

    // Latest worker activity
    const recentActivity =
      await Worker.getRecentActivity(userId);

    return {
      profile: {
        userId: profile.user_id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,

        workerCode: profile.worker_code,
        zone: profile.zone,
        vehicle: profile.vehicle,
        status: profile.status,

        latitude: profile.latitude,
        longitude: profile.longitude,
      },

      stats,

      todayTasks,

      recentActivity,
    };
  }
}

export default Worker;