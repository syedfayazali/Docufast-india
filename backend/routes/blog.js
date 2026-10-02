import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

router.get('/', (req, res) => {
  const posts = db.prepare('SELECT id, title, slug, excerpt, category, author, created_at FROM blog_posts ORDER BY created_at DESC').all();
  res.json({ posts });
});

router.get('/:slug', (req, res) => {
  const post = db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(req.params.slug);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ post });
});

export default router;
