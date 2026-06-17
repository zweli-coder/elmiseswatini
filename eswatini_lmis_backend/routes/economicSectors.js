const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET ALL ECONOMIC SECTORS
router.get('/', async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT *
            FROM economic_sectors
            ORDER BY sector_name ASC
        `);

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: 'Failed to fetch economic sectors',
            details: err.message
        });

    }

});

// GET SINGLE ECONOMIC SECTOR BY ID
router.get('/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(`
            SELECT *
            FROM economic_sectors
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Economic sector not found'
            });
        }

        res.json(result.rows[0]);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: 'Failed to fetch economic sector',
            details: err.message
        });

    }

});

module.exports = router;