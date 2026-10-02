import { Router } from 'express';
import db from '../db/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function generateTrackingId() {
  return 'DF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

router.post('/', authMiddleware, (req, res) => {
  const { service_type, full_name, email, phone, address, notes } = req.body;
  if (!service_type || !full_name || !email || !phone || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const tracking_id = generateTrackingId();
  const result = db.prepare(`
    INSERT INTO applications (user_id, service_type, full_name, email, phone, address, notes, tracking_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, service_type, full_name, email, phone, address, notes || '', tracking_id);
  res.json({ id: result.lastInsertRowid, tracking_id, status: 'Submitted' });
});

router.get('/', authMiddleware, (req, res) => {
  const apps = db.prepare('SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ applications: apps });
});

router.get('/:id', authMiddleware, (req, res) => {
  const app = db.prepare('SELECT * FROM applications WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  res.json({ application: app });
});

export default router;
