const pool = require('./config/db');

const ensureEconomicSectorsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS economic_sectors (
        id SERIAL PRIMARY KEY,
        sector_name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const existing = await pool.query(`
      SELECT count(*) AS count
      FROM economic_sectors
    `);

    if (parseInt(existing.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO economic_sectors (sector_name, description)
        VALUES
          ('Agriculture', 'Farming, livestock, and forestry'),
          ('Manufacturing', 'Factory production and processing'),
          ('Retail & Trade', 'Wholesale and retail commerce'),
          ('Tourism & Hospitality', 'Hotels, restaurants, and tourism services'),
          ('Healthcare', 'Medical services and pharmaceuticals'),
          ('Education', 'Schools, universities, and training institutions'),
          ('Finance & Banking', 'Financial services and banking'),
          ('Technology & IT', 'Information technology and software'),
          ('Construction', 'Building and infrastructure development'),
          ('Energy & Utilities', 'Power, water, and utilities'),
          ('Transportation & Logistics', 'Transport and supply chain'),
          ('Public Administration', 'Government and public sector')
      `);
      console.log('✅ Economic sectors table initialized');
    }
  } catch (err) {
    console.log('❌ Failed to initialize economic sectors table:', err.message);
  }
};

module.exports = { ensureEconomicSectorsTable };
