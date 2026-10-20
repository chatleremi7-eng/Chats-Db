const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database', err.message);
  } else {
    console.log('Connected to local SQLite database:', dbPath);
  }
});

// Helper wrapper to make sqlite3 query interface compatible with PostgreSQL pg pool style
module.exports = {
  query: (text, params = []) => {
    return new Promise((resolve, reject) => {
      // Convert PostgreSQL $1, $2 placeholders to SQLite ? placeholders
      let sqliteText = text;
      params.forEach((_, i) => {
        sqliteText = sqliteText.replace(new RegExp(`\\\$${i + 1}`, 'g'), '?');
      });

      const trimmed = text.trim().toUpperCase();

      if (trimmed.startsWith('SELECT')) {
        db.all(sqliteText, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows: rows || [] });
        });
      } else if (trimmed.includes('RETURNING')) {
        // Handle queries with RETURNING by executing run then fetching last inserted row
        // e.g. INSERT INTO users (...) VALUES (...) RETURNING id, username
        const cleanText = sqliteText.replace(/RETURNING\s+[\w\s,]+$/i, '');
        db.run(cleanText, params, function(err) {
          if (err) {
            reject(err);
          } else {
            const lastId = this.lastID;
            // Fetch the inserted/updated row
            const tableMatch = text.match(/INTO\s+(\w+)/i) || text.match(/UPDATE\s+(\w+)/i);
            if (tableMatch && lastId) {
              db.get(`SELECT * FROM ${tableMatch[1]} WHERE id = ?`, [lastId], (rowErr, row) => {
                if (rowErr) reject(rowErr);
                else resolve({ rows: [row] });
              });
            } else {
              resolve({ rows: [], insertId: lastId });
            }
          }
        });
      } else {
        db.run(sqliteText, params, function(err) {
          if (err) reject(err);
          else resolve({ rows: [], insertId: this.lastID, changes: this.changes });
        });
      }
    });
  },
  db
};
