const db = require('../../config/db');

async function createAttachment({ messageId, fileName, fileUrl, fileType, fileSize }) {
  const result = await db.query(
    `INSERT INTO attachments (message_id, file_name, file_url, file_type, file_size)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [messageId, fileName, fileUrl, fileType, fileSize]
  );
  return result.rows[0];
}

async function getAttachmentsByMessage(messageId) {
  const result = await db.query(
    'SELECT * FROM attachments WHERE message_id = $1',
    [messageId]
  );
  return result.rows;
}

module.exports = {
  createAttachment,
  getAttachmentsByMessage
};
