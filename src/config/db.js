const path = require('path');
require('dotenv').config();

// If DATABASE_URL exists (on Render), use Postgres. Else use SQLite local
if (process.env.DATABASE_URL) {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  pool.on('connect', () => console.log('Connected to Postgres database'));
  pool.on('error', (err) => console.error('Postgres error', err));

  module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
  };

} else {
  // Local development - SQLite
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.resolve(__dirname, '../../database.sqlite');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening SQLite database', err.message);
    } else {
      console.log('Connected to local SQLite database:', dbPath);
    }
  });

  module.exports = {
    query: (text, params = []) => {
      return new Promise((resolve, reject) => {
        // Handle $1, $2 postgres style -> ? for sqlite
        const sqliteText = text.replace(/\$[0-9]+/g, '?');
        if (text.trim().toUpperCase().startsWith('SELECT')) {
          db.all(sqliteText, params, (err, rows) => {
            if (err) reject(err);
            else resolve({ rows });
          });
        } else {
          db.run(sqliteText, params, function(err) {
            if (err) reject(err);
            else resolve({ rows: [], rowCount: this.changes });
          });
        }
      });
    }
  };
}
      // Convert PostgreSQL $1, $2 placeholders to SQLite ? placeholders
     
      
