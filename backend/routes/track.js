import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

const statusFlow = ['Submitted', 'Under Review', 'Documents Verified', 'Processing', 'Out for Delivery', 'Completed'];

router.get('/:trackingId', (req, res) => {
  const app = db.prepare('SELECT * FROM applications WHERE tracking_id = ?').get(req.params.trackingId);
  if (!app) return res.status(404).json({ error: 'Tracking ID not found' });
  const statusIndex = statusFlow.indexOf(app.status);
  res.json({
    tracking_id: app.tracking_id,
    service_type: app.service_type,
    full_name: app.full_name,
    status: app.status,
    created_at: app.created_at,
    stages: statusFlow.map((s, i) => ({ name: s, completed: i <= statusIndex })),
  });
});

export default router;
