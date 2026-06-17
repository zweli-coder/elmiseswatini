const express = require('express');
const router = express.Router();
const authController = require('../authController');
const { verifyToken } = require('../authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Returns the logged-in user's profile (id, full_name, email, role_id)
// Used by the frontend to validate the token and determine the user's role on page load
router.get('/me', verifyToken, async (req, res) => {
  try {
    const pool = require('../config/db');
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.role_id, r.role_name AS role_name, u.created_at
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;