import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimal .env loader (no dependency): lets `node scripts/migrate.js` pick up
// DATABASE_URL from the local .env without printing any values.
try {
  for (const line of fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8').split('\n')) {
    const m = line.match(/^\s*DATABASE_URL\s*=\s*(.+?)\s*$/);
    if (m && !process.env.DATABASE_URL) process.env.DATABASE_URL = m[1];
  }
} catch { /* no local .env: fall through to the process environment */ }

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL. Add it to .env (see .env.example).');
  process.exit(1);
}

async function migrate() {
  console.log('Connecting directly to Supabase Postgres...');
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected successfully to database!');

    const schemaPath = path.join(__dirname, '../supabase/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');
    
    console.log('Applying schema.sql...');
    await client.query(sql);
    console.log('Schema successfully applied!');

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\nVerified Public Tables:');
    res.rows.forEach(r => console.log('  - ' + r.table_name));

  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
