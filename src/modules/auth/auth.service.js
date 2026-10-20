const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const jwtConfig = require('../../config/jwt');

async function register({ username, email, password, displayName, avatarUrl }) {
  const existing = await db.query(
    'SELECT id FROM users WHERE username = $1 OR email = $2',
    [username, email]
  );
  if (existing.rows.length > 0) {
    throw { statusCode: 400, message: 'Username or email already in use' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO users (username, email, password_hash, display_name, avatar_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, username, email, display_name, avatar_url, created_at`,
    [username, email, passwordHash, displayName || username, avatarUrl || '']
  );

  const user = result.rows[0];
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

  return { user, token };
}

async function login({ usernameOrEmail, password }) {
  const result = await db.query(
    'SELECT * FROM users WHERE username = $1 OR email = $1',
    [usernameOrEmail]
  );
  if (result.rows.length === 0) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  const user = result.rows[0];
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

  delete user.password_hash;
  return { user, token };
}

async function getProfile(userId) {
  const result = await db.query(
    'SELECT id, username, email, display_name, avatar_url, status_message, is_online, last_seen, created_at FROM users WHERE id = $1',
    [userId]
  );
  if (result.rows.length === 0) {
    throw { statusCode: 404, message: 'User not found' };
  }
  return result.rows[0];
}

module.exports = {
  register,
  login,
  getProfile
};
