import pool from "../config/db.js";

// ======================================================
// USER MODEL - MYSQL VERSION
// ======================================================

class User {
  constructor(data) {
    this._id = data.id;
    this.id = data.id;

    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;

    this.password = data.password;
    this.role = data.role;

    this.resetPasswordToken =
      data.reset_password_token || null;

    this.resetPasswordExpires =
      data.reset_password_expires || null;

    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // ====================================================
  // FIND ONE USER
  // ====================================================

  static async findOne(query) {
    let sql = "SELECT * FROM users WHERE ";

    const conditions = [];
    const values = [];

    // ------------------------------------------
    // Email
    // ------------------------------------------

    if (query.email !== undefined) {
      conditions.push("email = ?");
      values.push(query.email);
    }

    // ------------------------------------------
    // Phone
    // ------------------------------------------

    if (query.phone !== undefined) {
      conditions.push("phone = ?");
      values.push(query.phone);
    }

    // ------------------------------------------
    // ID
    // ------------------------------------------

    if (query._id !== undefined) {
      if (
        typeof query._id === "object" &&
        query._id.$ne !== undefined
      ) {
        conditions.push("id != ?");
        values.push(query._id.$ne);
      } else {
        conditions.push("id = ?");
        values.push(query._id);
      }
    }

    // ------------------------------------------
    // Reset password token
    // ------------------------------------------

    if (query.resetPasswordToken !== undefined) {
      conditions.push(
        "reset_password_token = ?"
      );

      values.push(
        query.resetPasswordToken
      );
    }

    // ------------------------------------------
    // Reset password expiry
    // ------------------------------------------

    if (
      query.resetPasswordExpires !== undefined
    ) {
      if (
        typeof query.resetPasswordExpires ===
          "object" &&
        query.resetPasswordExpires.$gt !==
          undefined
      ) {
        conditions.push(
          "reset_password_expires > ?"
        );

        values.push(
          query.resetPasswordExpires.$gt
        );
      } else {
        conditions.push(
          "reset_password_expires = ?"
        );

        values.push(
          query.resetPasswordExpires
        );
      }
    }

    // ------------------------------------------
    // No conditions
    // ------------------------------------------

    if (conditions.length === 0) {
      throw new Error(
        "User.findOne() requires at least one search condition"
      );
    }

    sql += conditions.join(" AND ");

    sql += " LIMIT 1";

    const [rows] = await pool.query(
      sql,
      values
    );

    if (rows.length === 0) {
      return null;
    }

    return new User(rows[0]);
  }

  // ====================================================
  // FIND USER BY ID
  // ====================================================

  static async findById(id) {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    return new User(rows[0]);
  }

  // ====================================================
  // CREATE USER
  // ====================================================

  static async create(data) {
    const {
      name,
      email,
      phone,
      address,
      password,
      role = "citizen",
    } = data;

    const [result] = await pool.query(
      `
      INSERT INTO users
      (
        name,
        email,
        phone,
        address,
        password,
        role
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        email,
        phone,
        address,
        password,
        role,
      ]
    );

    return await User.findById(
      result.insertId
    );
  }

  // ====================================================
  // SAVE / UPDATE USER
  // ====================================================

  async save() {
    await pool.query(
      `
      UPDATE users
      SET
        name = ?,
        email = ?,
        phone = ?,
        address = ?,
        password = ?,
        role = ?,
        reset_password_token = ?,
        reset_password_expires = ?
      WHERE id = ?
      `,
      [
        this.name,
        this.email,
        this.phone,
        this.address,
        this.password,
        this.role,

        // Reset token
        this.resetPasswordToken || null,

        // Reset token expiry
        this.resetPasswordExpires || null,

        this._id,
      ]
    );

    // ------------------------------------------
    // Reload user from MySQL
    // ------------------------------------------

    const updatedUser =
      await User.findById(this._id);

    if (updatedUser) {
      this._id = updatedUser._id;
      this.id = updatedUser.id;

      this.name = updatedUser.name;
      this.email = updatedUser.email;
      this.phone = updatedUser.phone;
      this.address = updatedUser.address;

      this.password =
        updatedUser.password;

      this.role = updatedUser.role;

      this.resetPasswordToken =
        updatedUser.resetPasswordToken;

      this.resetPasswordExpires =
        updatedUser.resetPasswordExpires;

      this.createdAt =
        updatedUser.createdAt;

      this.updatedAt =
        updatedUser.updatedAt;
    }

    return this;
  }
}

// ======================================================
// EXPORT
// ======================================================

export default User;