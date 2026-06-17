(async ()=>{
  const fs = require('fs');
  const pool = require('./config/db');
  const sql = fs.readFileSync('./sql/create_statistics_uploads_table.sql','utf8');
  try {
    await pool.query(sql);
    console.log('SQL executed');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
