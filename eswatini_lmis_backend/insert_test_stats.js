const pool = require('./config/db');

(async () => {
  try {
    await pool.query(
      `INSERT INTO statistical_data (year,category,industry,region,value)
       VALUES ($1,$2,$3,$4,$5), ($6,$7,$8,$9,$10)`,
      [
        '2024','Employment income','Manufacturing','Manzini',123.45,
        '2023','Employment income','Agriculture','Hhohho',67.89
      ]
    );
    console.log('INSERT OK');
    const r = await pool.query("SELECT id,year,category,industry,region,value,created_at FROM statistical_data ORDER BY created_at DESC LIMIT 5");
    console.log(JSON.stringify(r.rows, null, 2));
  } catch (e) {
    console.error('ERR', e.message);
  } finally {
    process.exit();
  }
})();
