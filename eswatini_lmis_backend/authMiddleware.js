const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  if (typeof token === 'string' && token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Fallback for tokens signed with older hard-coded secret
      decoded = jwt.verify(token, 'lmis_secret_key_2026');
    }
    req.user = decoded?.user || decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const verifyEmployer = (req, res, next) => {
  verifyToken(req, res, () => {
    const role = req.user.role_id ?? req.user.role;
    if (role === 2) { // role_id 2 = employer
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Employers only.' });
    }
  });
};

const verifyJobSeeker = (req, res, next) => {
  verifyToken(req, res, () => {
    const role = req.user.role_id ?? req.user.role;
    if (role === 3) { // role_id 3 = job seeker
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Job seekers only.' });
    }
  });
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    const role = req.user.role_id ?? req.user.role;
    if (role === 1) { // role_id 1 = admin
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Admins only.' });
    }
  });
};

module.exports = { verifyToken, verifyEmployer, verifyJobSeeker, verifyAdmin };
