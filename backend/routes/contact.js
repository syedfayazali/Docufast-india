import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

router.post('/', (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  db.prepare('INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)').run(name, email, phone, message);
  res.json({ success: true, message: 'Message received. We will contact you shortly.' });
});

export default router;
