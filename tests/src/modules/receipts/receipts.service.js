const db = require('../../config/db');

async function markMessageRead(messageId, userId) {
  const result = await db.query(
    `INSERT INTO receipts (message_id, user_id, status, read_at)
     VALUES ($1, $2, 'read', CURRENT_TIMESTAMP)
     ON CONFLICT (message_id, user_id)
     DO UPDATE SET status = 'read', read_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [messageId, userId]
  );
  return result.rows[0];
}

async function getMessageReceipts(messageId) {
  const result = await db.query(
    `SELECT r.*, u.display_name, u.username
     FROM receipts r
     JOIN users u ON r.user_id = u.id
     WHERE r.message_id = $1`,
    [messageId]
  );
  return result.rows;
}

module.exports = {
  markMessageRead,
  getMessageReceipts
};
