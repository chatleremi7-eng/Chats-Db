const receiptsService = require('./receipts.service');

async function markRead(req, res, next) {
  try {
    const { messageId } = req.params;
    const receipt = await receiptsService.markMessageRead(parseInt(messageId), req.user.id);
    res.json({ receipt });
  } catch (err) {
    next(err);
  }
}

async function getReceipts(req, res, next) {
  try {
    const { messageId } = req.params;
    const receipts = await receiptsService.getMessageReceipts(parseInt(messageId));
    res.json({ receipts });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  markRead,
  getReceipts
};
