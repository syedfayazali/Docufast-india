import jwt from 'jsonwebtoken';
import db from '../db/database.js';

const JWT_SECRET = 'docufast-dev-secret-change-in-production';

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });
  const token = header.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, name, email, phone FROM users WHERE id = ?').get(decoded.userId);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export { JWT_SECRET };
