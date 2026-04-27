const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sartthi_secret';

/**
 * Attach decoded user to req.user if valid token is present.
 * Returns 401 if missing/invalid.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'No token provided.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Allow only admin role.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

/**
 * Allow admin or manager roles.
 */
function requireManager(req, res, next) {
  if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Manager access required.' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin, requireManager };
