import pool from "../config/db.js";

class Notification {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.type = data.type;
    this.icon = data.icon;
    this.title = data.title;
    this.message = data.message;
    this.unread = !Boolean(data.is_read);
    this.createdAt = data.created_at;
  }

  // Get all notifications for a user
  static async findByUser(userId) {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        user_id,
        type,
        icon,
        title,
        message,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return rows.map(
      (row) => new Notification(row)
    );
  }

  // Mark one notification as read
  static async markAsRead(id, userId) {
    const [result] = await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ?
        AND user_id = ?
      `,
      [id, userId]
    );

    return result.affectedRows > 0;
  }

  // Mark all notifications as read
  static async markAllAsRead(userId) {
    const [result] = await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = ?
        AND is_read = FALSE
      `,
      [userId]
    );

    return result.affectedRows;
  }

  // Delete one notification
  static async deleteById(id, userId) {
    const [result] = await pool.query(
      `
      DELETE FROM notifications
      WHERE id = ?
        AND user_id = ?
      `,
      [id, userId]
    );

    return result.affectedRows > 0;
  }
}

export default Notification;