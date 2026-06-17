const pool = require('./config/db');

pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'employers'`)
  .then(r => {
    console.log('Employers table columns:');
    r.rows.forEach(row => console.log(' -', row.column_name));
  })
  .catch(e => console.log('Error:', e.message));
