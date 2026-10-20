const db = require('../../config/db');

async function getAllUsers(currentUserId) {
  const result = await db.query(
    `SELECT id, username, display_name, avatar_url, status_message, is_online, last_seen
     FROM users
     WHERE id != $1
     ORDER BY is_online DESC, username ASC`,
    [currentUserId]
  );
  return result.rows;
}

async function searchUsers(query, currentUserId) {
  const searchTerm = `%${query}%`;
  const result = await db.query(
    `SELECT id, username, display_name, avatar_url, status_message, is_online, last_seen
     FROM users
     WHERE id != $1 AND (username LIKE $2 OR display_name LIKE $2 OR email LIKE $2)
     ORDER BY username ASC`,
    [currentUserId, searchTerm]
  );
  return result.rows;
}

async function updateProfile(userId, { displayName, avatarUrl, statusMessage }) {
  const result = await db.query(
    `UPDATE users
     SET display_name = COALESCE($1, display_name),
         avatar_url = COALESCE($2, avatar_url),
         status_message = COALESCE($3, status_message),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING id, username, email, display_name, avatar_url, status_message, is_online`,
    [displayName, avatarUrl, statusMessage, userId]
  );
  return result.rows[0];
}

module.exports = {
  getAllUsers,
  searchUsers,
  updateProfile
};
