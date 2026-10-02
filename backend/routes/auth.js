import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)').run(name, email, phone, hashed);
  const token = generateToken(result.lastInsertRowid);
  res.json({ token, user: { id: result.lastInsertRowid, name, email, phone } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = generateToken(user.id);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;
