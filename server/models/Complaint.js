import pool from "../config/db.js";

// ======================================================
// COMPLAINT MODEL - MYSQL VERSION
// ======================================================

class Complaint {
  constructor(data) {
    this._id = data.id;
    this.id = data.id;

    this.title = data.title;
    this.description = data.description;
    this.location = data.location;

    this.status = data.status || "Active";

    this.reportedBy = data.reported_by ?? null;
    this.assignedWorker = data.assigned_worker ?? null;

    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // ====================================================
  // CREATE COMPLAINT
  // ====================================================

  static async create(data) {
    console.log("Creating complaint with data:", data);

    const {
      title,
      description,
      location,
      status = "Active",
      reportedBy,
      assignedWorker = null,
    } = data;

    // Validate required fields
    if (!title || !description || !location) {
      throw new Error(
        "Complaint requires title, description and location."
      );
    }

    const [result] = await pool.query(
      `
      INSERT INTO complaints
      (
        title,
        description,
        location,
        status,
        reported_by,
        assigned_worker
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        title.trim(),
        description.trim(),
        location.trim(),
        status,
        reportedBy ?? null,
        assignedWorker ?? null,
      ]
    );

    console.log(
      "Complaint inserted successfully. ID:",
      result.insertId
    );

    return await Complaint.findById(result.insertId);
  }

  // ====================================================
  // FIND COMPLAINT BY ID
  // ====================================================

  static async findById(id) {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM complaints
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    return new Complaint(rows[0]);
  }

  // ====================================================
  // FIND ALL COMPLAINTS
  // ====================================================

  static async findAll() {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM complaints
      ORDER BY created_at DESC
      `
    );

    return rows.map((row) => new Complaint(row));
  }

  // ====================================================
  // FIND COMPLAINTS BY USER
  // ====================================================

  static async findByUser(userId) {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM complaints
      WHERE reported_by = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return rows.map((row) => new Complaint(row));
  }

  // ====================================================
  // FIND COMPLAINTS ASSIGNED TO WORKER
  // ====================================================

  static async findByWorker(workerId) {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM complaints
      WHERE assigned_worker = ?
      ORDER BY created_at DESC
      `,
      [workerId]
    );

    return rows.map((row) => new Complaint(row));
  }

  // ====================================================
  // UPDATE COMPLAINT
  // ====================================================

  async save() {
    await pool.query(
      `
      UPDATE complaints
      SET
        title = ?,
        description = ?,
        location = ?,
        status = ?,
        reported_by = ?,
        assigned_worker = ?
      WHERE id = ?
      `,
      [
        this.title,
        this.description,
        this.location,
        this.status,
        this.reportedBy,
        this.assignedWorker,
        this._id,
      ]
    );

    const updatedComplaint =
      await Complaint.findById(this._id);

    if (updatedComplaint) {
      this._id = updatedComplaint._id;
      this.id = updatedComplaint.id;

      this.title = updatedComplaint.title;
      this.description = updatedComplaint.description;
      this.location = updatedComplaint.location;
      this.status = updatedComplaint.status;
      this.reportedBy = updatedComplaint.reportedBy;
      this.assignedWorker = updatedComplaint.assignedWorker;
      this.createdAt = updatedComplaint.createdAt;
      this.updatedAt = updatedComplaint.updatedAt;
    }

    return this;
  }

  // ====================================================
  // UPDATE STATUS
  // ====================================================

  static async updateStatus(id, status) {
    await pool.query(
      `
      UPDATE complaints
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    return await Complaint.findById(id);
  }

  // ====================================================
  // ASSIGN WORKER
  // ====================================================

  static async assignWorker(complaintId, workerId) {
    await pool.query(
      `
      UPDATE complaints
      SET
        assigned_worker = ?,
        status = 'In Action'
      WHERE id = ?
      `,
      [workerId, complaintId]
    );

    return await Complaint.findById(complaintId);
  }

  // ====================================================
  // DELETE COMPLAINT
  // ====================================================

  static async deleteById(id) {
    const [result] = await pool.query(
      `
      DELETE FROM complaints
      WHERE id = ?
      `,
      [id]
    );

    return result.affectedRows > 0;
  }
}

export default Complaint;