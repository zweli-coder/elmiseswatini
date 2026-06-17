const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Added for consistency with other routes
 
// ===============================
// GET ALL JOBS
// ===============================
router.get('/', async (req, res) => {
    console.log('💼 GET /api/jobs');

    try {
        const result = await pool.query(`
            SELECT 
                id,
                employer_id,
                title,
                description,
                location,
                job_type,
                sector,
                organisation_name,
                created_at
            FROM jobs
            ORDER BY created_at DESC
        `);

        res.json(result.rows);

    } catch (err) {
        console.error('GET jobs error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ===============================
// GET SINGLE JOB
// ===============================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT * FROM jobs WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Job not found" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error('GET single job error:', err);
        res.status(500).json({ error: err.message });
    }
});


// ===============================
// DELETE JOB
// ===============================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            `DELETE FROM jobs WHERE id = $1`,
            [id]
        );

        res.json({ message: "Job deleted successfully" });

    } catch (err) {
        console.error('DELETE job error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;