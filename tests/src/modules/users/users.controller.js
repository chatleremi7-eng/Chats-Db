const usersService = require('./users.service');

async function getUsers(req, res, next) {
  try {
    const { q } = req.query;
    if (q) {
      const users = await usersService.searchUsers(q, req.user.id);
      return res.json({ users });
    }
    const users = await usersService.getAllUsers(req.user.id);
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { displayName, avatarUrl, statusMessage } = req.body;
    const user = await usersService.updateProfile(req.user.id, { displayName, avatarUrl, statusMessage });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUsers,
  updateProfile
};
