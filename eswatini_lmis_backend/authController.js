const pool = require('./config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, role_id } = req.body;
    const roleId = Number(role_id);

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email and password are required' });
    }

    if (![2, 3].includes(roleId)) {
      return res.status(400).json({ error: 'Role must be employer or job seeker' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [full_name.trim(), normalizedEmail, hashedPassword, roleId]
    );

    const newUser = result.rows[0];

    // Auto-create employer profile if registering as employer (role_id = 2)
    if (roleId === 2) {
      try {
        await pool.query(
          `INSERT INTO employers (user_id, company_name, industry, location)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id) DO NOTHING`,
          [newUser.id, full_name + " Company", "General", "Mbabane"]
        );
        console.log(`✅ Auto-created employer profile for user ${newUser.id}`);
      } catch (err) {
        console.log(`⚠️  Could not auto-create employer profile: ${err.message}`);
      }
    }

    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT u.*, r.role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE LOWER(u.email) = LOWER($1)`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(400).json({
        error: 'Invalid password'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role_id: user.role_id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
};
