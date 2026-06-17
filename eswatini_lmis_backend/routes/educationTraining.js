const express = require('express');
const router = express.Router();
const pool = require('../config/db');


// GET ALL with optional filtering
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = 'SELECT * FROM education_training WHERE 1=1';
        const params = [];

        // Filter by category
        if (category) {
            query += ' AND category = $' + (params.length + 1);
            params.push(category);
        }

        // Search in title and description
        if (search) {
            query += ' AND (title ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 1) + ')';
            params.push('%' + search + '%');
        }

        query += ' ORDER BY id ASC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch education and training data', details: err.message });
    }
});

// GET CATEGORIES (grouped data)
router.get('/categories/list', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT DISTINCT category FROM education_training ORDER BY category ASC'
        );
        res.json(result.rows.map(row => row.category));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
    }
});

// GET BY CATEGORY
router.get('/by-category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const result = await pool.query(
            'SELECT * FROM education_training WHERE category = $1 ORDER BY title ASC',
            [decodeURIComponent(category)]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch programs by category', details: err.message });
    }
});

// GET STATISTICS (count by category)
router.get('/stats/summary', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT category, COUNT(*) as count FROM education_training GROUP BY category ORDER BY category ASC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
    }
});

// GET SINGLE PROGRAM
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM education_training WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Program not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch program', details: err.message });
    }
});


// CREATE
router.post('/', async (req, res) => {
    try {
        const { title, category, description } = req.body;

        const result = await pool.query(
            `INSERT INTO education_training (title, category, description)
             VALUES ($1, $2, $3) RETURNING *`,
            [title, category, description]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create education and training entry', details: err.message });
    }
});


// UPDATE (THIS IS YOUR MISSING PART OR NOT LOADED)
router.put('/:id', async (req, res) => {
    try {

        const { id } = req.params;
        const { title, category, description } = req.body;

        const result = await pool.query(
            `UPDATE education_training
             SET title=$1, category=$2, description=$3
             WHERE id=$4
             RETURNING *`,
            [title, category, description, id]
        );

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update education and training entry', details: err.message });
    }
});


// DELETE
router.delete('/:id', async (req, res) => {
    try {

        const { id } = req.params;

        await pool.query(
            `DELETE FROM education_training WHERE id=$1`,
            [id]
        );

        res.json({ message: 'Deleted successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete education and training entry', details: err.message });
    }
});


module.exports = router;