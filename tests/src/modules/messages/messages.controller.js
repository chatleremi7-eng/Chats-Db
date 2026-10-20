const messagesService = require('./messages.service');

async function sendMessage(req, res, next) {
  try {
    const { conversationId, content, type, replyToMessageId } = req.body;
    if (!conversationId || !content) {
      return res.status(400).json({ error: 'conversationId and content are required' });
    }
    const message = await messagesService.sendMessage(req.user.id, {
      conversationId: parseInt(conversationId),
      content,
      type,
      replyToMessageId: replyToMessageId ? parseInt(replyToMessageId) : null
    });
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
}

async function getMessages(req, res, next) {
  try {
    const { conversationId } = req.params;
    const { limit, offset } = req.query;
    const messages = await messagesService.getConversationMessages(
      parseInt(conversationId),
      req.user.id,
      { limit: parseInt(limit) || 50, offset: parseInt(offset) || 0 }
    );
    res.json({ messages });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  sendMessage,
  getMessages
};
