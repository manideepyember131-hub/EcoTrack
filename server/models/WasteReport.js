import pool from "../config/db.js";

// ======================================================
// WASTE REPORT MODEL - MYSQL VERSION
// ======================================================

class WasteReport {
  constructor(data) {
    this._id = data.id;
    this.id = data.id;

    this.title = data.title;
    this.description = data.description;
    this.wasteType = data.waste_type;
    this.location = data.location;
    this.image = data.image || "";
    this.status = data.status || "Pending";

    this.reportedBy = data.reported_by || null;

    // GPS coordinates
    this.latitude =
      data.latitude !== null && data.latitude !== undefined
        ? Number(data.latitude)
        : null;

    this.longitude =
      data.longitude !== null && data.longitude !== undefined
        ? Number(data.longitude)
        : null;

    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // ====================================================
  // CREATE WASTE REPORT
  // ====================================================

  static async create(data) {
    const {
      title,
      description,
      wasteType,
      location,
      image = "",
      status = "Pending",
      reportedBy = null,

      // GPS coordinates sent by citizen
      latitude = null,
      longitude = null,
    } = data;

    // --------------------------------------------------
    // Validate GPS coordinates
    // --------------------------------------------------

    let latitudeNumber = null;
    let longitudeNumber = null;

    if (
      latitude !== null &&
      latitude !== undefined &&
      longitude !== null &&
      longitude !== undefined
    ) {
      latitudeNumber = Number(latitude);
      longitudeNumber = Number(longitude);

      if (
        !Number.isFinite(latitudeNumber) ||
        !Number.isFinite(longitudeNumber)
      ) {
        throw new Error("Invalid latitude or longitude");
      }

      if (
        latitudeNumber < -90 ||
        latitudeNumber > 90 ||
        longitudeNumber < -180 ||
        longitudeNumber > 180
      ) {
        throw new Error("Latitude or longitude is out of range");
      }
    }

    // --------------------------------------------------
    // Create waste report
    // --------------------------------------------------

    const [result] = await pool.query(
      `
      INSERT INTO waste_reports
      (
        title,
        description,
        waste_type,
        location,
        image,
        status,
        reported_by,
        latitude,
        longitude
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description,
        wasteType,
        location,
        image,
        status,
        reportedBy,
        latitudeNumber,
        longitudeNumber,
      ]
    );

    const reportId = result.insertId;

    // --------------------------------------------------
    // AUTOMATIC WORKER ASSIGNMENT
    // --------------------------------------------------

    let assignment = null;

    if (
      latitudeNumber !== null &&
      longitudeNumber !== null
    ) {
      assignment = await WasteReport.assignNearestWorker(
        reportId,
        {
          title,
          description,
          wasteType,
          location,
          latitude: latitudeNumber,
          longitude: longitudeNumber,
        }
      );
    }

    // --------------------------------------------------
    // Return created report
    // --------------------------------------------------

    const report = await WasteReport.findById(reportId);

    // Add assignment information to returned object
    if (assignment) {
      report.assignedWorker = assignment;
    } else {
      report.assignedWorker = null;
    }

    return report;
  }

  // ====================================================
  // FIND NEAREST AVAILABLE WORKER AND CREATE TASK
  // ====================================================

  static async assignNearestWorker(reportId, reportData) {
    const {
      title,
      description,
      wasteType,
      location,
      latitude,
      longitude,
    } = reportData;

    // --------------------------------------------------
    // Find nearest AVAILABLE worker
    //
    // Distance is calculated using the Haversine formula.
    // Result is in kilometers.
    // --------------------------------------------------

    const [workers] = await pool.query(
      `
      SELECT
        wp.user_id,
        wp.worker_code,
        wp.zone,
        wp.latitude,
        wp.longitude,

        (
          6371 * ACOS(
            LEAST(
              1,
              GREATEST(
                -1,

                COS(RADIANS(?))
                *
                COS(RADIANS(wp.latitude))
                *
                COS(
                  RADIANS(wp.longitude)
                  - RADIANS(?)
                )
                +
                SIN(RADIANS(?))
                *
                SIN(RADIANS(wp.latitude))
              )
            )
          )
        ) AS distance_km

      FROM worker_profiles wp

      WHERE wp.status = 'Available'
        AND wp.latitude IS NOT NULL
        AND wp.longitude IS NOT NULL

      ORDER BY distance_km ASC

      LIMIT 1
      `,
      [
        latitude,
        longitude,
        latitude,
      ]
    );

    // --------------------------------------------------
    // No available worker found
    // --------------------------------------------------

    if (workers.length === 0) {
      console.log(
        `No available worker found for waste report ${reportId}`
      );

      return null;
    }

    const worker = workers[0];

    // --------------------------------------------------
    // Prevent duplicate task creation
    // --------------------------------------------------

    const [existingTasks] = await pool.query(
      `
      SELECT id
      FROM worker_tasks
      WHERE waste_report_id = ?
      LIMIT 1
      `,
      [reportId]
    );

    if (existingTasks.length > 0) {
      console.log(
        `Worker task already exists for waste report ${reportId}`
      );

      return {
        userId: worker.user_id,
        workerCode: worker.worker_code,
        zone: worker.zone,
        distanceKm: Number(worker.distance_km),
        taskId: existingTasks[0].id,
      };
    }

    // --------------------------------------------------
    // Generate task code
    // --------------------------------------------------

    const taskCode = `WT-${reportId}-${Date.now()}`;

    // --------------------------------------------------
    // Create worker task
    // --------------------------------------------------

    const [taskResult] = await pool.query(
      `
      INSERT INTO worker_tasks
      (
        task_code,
        waste_report_id,
        title,
        description,
        task_type,
        priority,
        location,
        scheduled_date,
        scheduled_time,
        status,
        assigned_to
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), CURTIME(), ?, ?)
      `,
      [
        taskCode,
        reportId,
        title || "Waste Collection",
        description || "",
        wasteType || "Waste Collection",
        "Normal",
        location || "Reported Location",
        "Pending",
        worker.user_id,
      ]
    );

    // --------------------------------------------------
    // Log assignment
    // --------------------------------------------------

    console.log(
      `Waste report ${reportId} automatically assigned to worker ${worker.worker_code} (${worker.user_id})`
    );

    console.log(
      `Distance from worker to report: ${Number(
        worker.distance_km
      ).toFixed(2)} km`
    );

    // --------------------------------------------------
    // Return assignment information
    // --------------------------------------------------

    return {
      taskId: taskResult.insertId,
      taskCode,
      userId: worker.user_id,
      workerCode: worker.worker_code,
      zone: worker.zone,
      workerLatitude: Number(worker.latitude),
      workerLongitude: Number(worker.longitude),
      distanceKm: Number(worker.distance_km),
    };
  }

  // ====================================================
  // FIND WASTE REPORT BY ID
  // ====================================================

  static async findById(id) {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM waste_reports
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    return new WasteReport(rows[0]);
  }

  // ====================================================
  // FIND ALL WASTE REPORTS
  // ====================================================

  static async findAll() {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM waste_reports
      ORDER BY created_at DESC
      `
    );

    return rows.map(
      (row) => new WasteReport(row)
    );
  }

  // ====================================================
  // FIND REPORTS BY USER
  // ====================================================

  static async findByUser(userId) {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM waste_reports
      WHERE reported_by = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return rows.map(
      (row) => new WasteReport(row)
    );
  }

  // ====================================================
  // UPDATE WASTE REPORT
  // ====================================================

  async save() {
    await pool.query(
      `
      UPDATE waste_reports
      SET
        title = ?,
        description = ?,
        waste_type = ?,
        location = ?,
        image = ?,
        status = ?,
        reported_by = ?,
        latitude = ?,
        longitude = ?
      WHERE id = ?
      `,
      [
        this.title,
        this.description,
        this.wasteType,
        this.location,
        this.image,
        this.status,
        this.reportedBy,
        this.latitude,
        this.longitude,
        this._id,
      ]
    );

    const updatedReport =
      await WasteReport.findById(this._id);

    if (updatedReport) {
      this._id = updatedReport._id;
      this.id = updatedReport.id;

      this.title = updatedReport.title;
      this.description =
        updatedReport.description;

      this.wasteType =
        updatedReport.wasteType;

      this.location =
        updatedReport.location;

      this.image = updatedReport.image;
      this.status = updatedReport.status;

      this.reportedBy =
        updatedReport.reportedBy;

      this.latitude =
        updatedReport.latitude;

      this.longitude =
        updatedReport.longitude;

      this.createdAt =
        updatedReport.createdAt;

      this.updatedAt =
        updatedReport.updatedAt;
    }

    return this;
  }

  // ====================================================
  // UPDATE STATUS
  // ====================================================

  static async updateStatus(id, status) {
    await pool.query(
      `
      UPDATE waste_reports
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    return await WasteReport.findById(id);
  }

  // ====================================================
  // DELETE WASTE REPORT
  // ====================================================

  static async deleteById(id) {
    const [result] = await pool.query(
      `
      DELETE FROM waste_reports
      WHERE id = ?
      `,
      [id]
    );

    return result.affectedRows > 0;
  }
}

// ======================================================
// EXPORT
// ======================================================

export default WasteReport;