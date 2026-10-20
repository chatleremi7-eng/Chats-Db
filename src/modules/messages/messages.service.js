const db = require('../../config/db');

async function sendMessage(senderId, { conversationId, content, type, replyToMessageId }) {
  // Check membership
  const memberCheck = await db.query(
    'SELECT user_id FROM conversation_members WHERE conversation_id = $1 AND user_id = $2',
    [conversationId, senderId]
  );
  if (memberCheck.rows.length === 0) {
    throw { statusCode: 403, message: 'You are not a member of this conversation' };
  }

  const result = await db.query(
    `INSERT INTO messages (conversation_id, sender_id, content, type, reply_to_message_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [conversationId, senderId, content, type || 'text', replyToMessageId || null]
  );
  const message = result.rows[0];

  // Update conversation timestamp
  await db.query(
    'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [conversationId]
  );

  // Get sender details
  const senderResult = await db.query(
    'SELECT id, username, display_name, avatar_url FROM users WHERE id = $1',
    [senderId]
  );
  message.sender = senderResult.rows[0];

  // Get reply-to details if present
  if (message.reply_to_message_id) {
    const replyResult = await db.query(
      `SELECT m.id, m.content, u.display_name as sender_name
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.id = $1`,
      [message.reply_to_message_id]
    );
    if (replyResult.rows.length > 0) {
      message.reply_to = replyResult.rows[0];
    }
  }

  return message;
}

async function getConversationMessages(conversationId, userId, { limit = 50, offset = 0 }) {
  // Check membership
  const memberCheck = await db.query(
    'SELECT user_id FROM conversation_members WHERE conversation_id = $1 AND user_id = $2',
    [conversationId, userId]
  );
  if (memberCheck.rows.length === 0) {
    throw { statusCode: 403, message: 'Access denied to this conversation' };
  }

  const query = `
    SELECT
      m.id,
      m.conversation_id,
      m.sender_id,
      m.content,
      m.type,
      m.reply_to_message_id,
      m.is_deleted,
      m.created_at,
      u.display_name as sender_name,
      u.avatar_url as sender_avatar,
      rm.content as reply_content,
      ru.display_name as reply_sender_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    LEFT JOIN messages rm ON m.reply_to_message_id = rm.id
    LEFT JOIN users ru ON rm.sender_id = ru.id
    WHERE m.conversation_id = $1
    ORDER BY m.created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const result = await db.query(query, [conversationId, limit, offset]);

  // Reverse so chronological order is returned
  return result.rows.reverse();
}

module.exports = {
  sendMessage,
  getConversationMessages
};
