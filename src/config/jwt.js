require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'super_secret_jwt_key_sobriva_2026',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
};
