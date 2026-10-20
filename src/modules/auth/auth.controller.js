const authService = require('./auth.service');

async function register(req, res, next) {
  try {
    const { username, email, password, displayName, avatarUrl } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    const data = await authService.register({ username, email, password, displayName, avatarUrl });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required' });
    }
    const data = await authService.login({ usernameOrEmail, password });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe
};
