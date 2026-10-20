const fs = require('fs');
const path = require('path');
const db = require('./db');

async function runMigrations() {
  console.log('Running database migrations...');
  const migrationPath = path.join(__dirname, '../../migrations/001_init.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split SQL statements by semicolon, filtering out empty statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  try {
    for (const statement of statements) {
      await db.query(statement + ';');
    }
    console.log('All database migrations completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
