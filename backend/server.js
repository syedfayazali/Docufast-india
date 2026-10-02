import express from 'express';
import cors from 'cors';
import { initDb } from './db/database.js';
import authRoutes from './routes/auth.js';
import applicationRoutes from './routes/applications.js';
import serviceRoutes from './routes/services.js';
import trackRoutes from './routes/track.js';
import blogRoutes from './routes/blog.js';
import contactRoutes from './routes/contact.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Initialize database
initDb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`DocuFast API running on port ${PORT}`);
});
