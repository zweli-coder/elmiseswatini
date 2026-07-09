require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});
(async () => {
  try {
    const r = await p.query("SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() ORDER BY table_name");
    console.log('Tables:', r.rows.map(t => t.table_name).join(', '));
  } catch(e) {
    console.log('Error:', e.message);
  }
  await p.end();
})();
