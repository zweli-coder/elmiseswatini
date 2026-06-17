const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, slug, title, summary, category, icon, created_at
      FROM career_advice
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('GET career advice error:', err);
    res.status(500).json({ error: 'Failed to fetch career advice', details: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      `SELECT id, slug, title, summary, body, category, icon, created_at
       FROM career_advice WHERE slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Career advice not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET single career advice error:', err);
    res.status(500).json({ error: 'Failed to fetch career advice entry', details: err.message });
  }
});

module.exports = router;
