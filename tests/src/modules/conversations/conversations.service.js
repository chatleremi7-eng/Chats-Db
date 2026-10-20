const db = require('../../config/db');

async function createConversation(currentUserId, { targetUserId, title, isGroup, memberIds }) {
  const groupInt = isGroup ? 1 : 0;
  if (!isGroup && targetUserId) {
    // Check if 1-on-1 conversation already exists
    const existing = await db.query(
      `SELECT c.id
       FROM conversations c
       JOIN conversation_members cm1 ON c.id = cm1.conversation_id AND cm1.user_id = $1
       JOIN conversation_members cm2 ON c.id = cm2.conversation_id AND cm2.user_id = $2
       WHERE c.is_group = 0`,
      [currentUserId, targetUserId]
    );
    if (existing.rows.length > 0) {
      return getConversationDetails(existing.rows[0].id, currentUserId);
    }
  }

  // Create new conversation
  const convResult = await db.query(
    `INSERT INTO conversations (title, is_group, created_by)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [title || null, groupInt, currentUserId]
  );
  const conversation = convResult.rows[0];

  // Add members
  const membersToAdd = new Set([currentUserId]);
  if (targetUserId) membersToAdd.add(targetUserId);
  if (Array.isArray(memberIds)) {
    memberIds.forEach(id => membersToAdd.add(id));
  }

  for (const userId of membersToAdd) {
    const role = userId === currentUserId ? 'admin' : 'member';
    await db.query(
      `INSERT INTO conversation_members (conversation_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [conversation.id, userId, role]
    );
  }

  return getConversationDetails(conversation.id, currentUserId);
}

async function getUserConversations(userId) {
  const query = `
    SELECT
      c.id,
      c.title,
      c.is_group,
      c.updated_at,
      m.content as last_message_content,
      m.created_at as last_message_time,
      m.sender_id as last_message_sender_id,
      u.display_name as last_message_sender_name,
      (
        SELECT COUNT(*)
        FROM messages msg
        LEFT JOIN receipts r ON msg.id = r.message_id AND r.user_id = $1
        WHERE msg.conversation_id = c.id
          AND msg.sender_id != $1
          AND (r.status IS NULL OR r.status != 'read')
      ) as unread_count
    FROM conversations c
    JOIN conversation_members cm ON c.id = cm.conversation_id AND cm.user_id = $1
    LEFT JOIN (
      SELECT m1.* FROM messages m1
      JOIN (
        SELECT conversation_id, MAX(created_at) as max_time
        FROM messages
        GROUP BY conversation_id
      ) m2 ON m1.conversation_id = m2.conversation_id AND m1.created_at = m2.max_time
    ) m ON c.id = m.conversation_id
    LEFT JOIN users u ON m.sender_id = u.id
    ORDER BY COALESCE(m.created_at, c.updated_at) DESC;
  `;
  const result = await db.query(query, [userId]);

  // For 1-on-1 conversations without a title, dynamically set title as partner's name
  for (const row of result.rows) {
    if (!row.is_group || row.is_group === 0) {
      const partnerResult = await db.query(
        `SELECT u.id, u.display_name, u.username, u.avatar_url, u.is_online
         FROM conversation_members cm
         JOIN users u ON cm.user_id = u.id
         WHERE cm.conversation_id = $1 AND cm.user_id != $2`,
        [row.id, userId]
      );
      if (partnerResult.rows.length > 0) {
        const partner = partnerResult.rows[0];
        row.partner = partner;
        row.title = partner.display_name || partner.username;
      }
    }
  }

  return result.rows;
}

async function getConversationDetails(conversationId, userId) {
  const convResult = await db.query('SELECT * FROM conversations WHERE id = $1', [conversationId]);
  if (convResult.rows.length === 0) {
    throw { statusCode: 404, message: 'Conversation not found' };
  }
  const conversation = convResult.rows[0];

  const membersResult = await db.query(
    `SELECT u.id, u.username, u.display_name, u.avatar_url, u.is_online, cm.role
     FROM conversation_members cm
     JOIN users u ON cm.user_id = u.id
     WHERE cm.conversation_id = $1`,
    [conversationId]
  );
  conversation.members = membersResult.rows;

  if (!conversation.is_group || conversation.is_group === 0) {
    const partner = conversation.members.find(m => m.id !== userId);
    if (partner) {
      conversation.partner = partner;
      conversation.title = partner.display_name || partner.username;
    }
  }

  return conversation;
}

module.exports = {
  createConversation,
  getUserConversations,
  getConversationDetails
};
