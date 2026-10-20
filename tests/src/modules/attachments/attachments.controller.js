const attachmentsService = require('./attachments.service');

async function uploadAttachment(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { messageId } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    let attachment = null;
    if (messageId) {
      attachment = await attachmentsService.createAttachment({
        messageId: parseInt(messageId),
        fileName: req.file.originalname,
        fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      });
    }

    res.status(201).json({
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      attachment
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadAttachment
};
