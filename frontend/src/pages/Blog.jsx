import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBlogPosts().then(data => { setPosts(data.posts); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Latest Updates</h1>
          <p>Guides, tips, and news about document services in India.</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--gray)' }}>Loading posts...</p>
          ) : (
            <div className="blog-grid">
              {posts.map(post => (
                <Link to={`/blog/${post.slug}`} key={post.id} className="blog-card">
                  <div className="blog-img"><span className="cat">{post.category}</span></div>
                  <div className="blog-body">
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div className="meta">{post.author} · {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
