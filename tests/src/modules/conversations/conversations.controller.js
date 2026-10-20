const conversationsService = require('./conversations.service');

async function createConversation(req, res, next) {
  try {
    const { targetUserId, title, isGroup, memberIds } = req.body;
    const conversation = await conversationsService.createConversation(req.user.id, {
      targetUserId,
      title,
      isGroup,
      memberIds
    });
    res.status(201).json({ conversation });
  } catch (err) {
    next(err);
  }
}

async function getConversations(req, res, next) {
  try {
    const conversations = await conversationsService.getUserConversations(req.user.id);
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
}

async function getConversation(req, res, next) {
  try {
    const { id } = req.params;
    const conversation = await conversationsService.getConversationDetails(parseInt(id), req.user.id);
    res.json({ conversation });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createConversation,
  getConversations,
  getConversation
};
