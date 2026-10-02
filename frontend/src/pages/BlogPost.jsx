import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBlogPost(slug).then(data => { setPost(data.post); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="page-header"><div className="container"><p>Loading...</p></div></div>;
  if (!post) return <div className="page-header"><div className="container"><h1>Post not found</h1><Link to="/blog" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Blog</Link></div></div>;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <div style={{ marginBottom: '12px' }}>
            <Link to="/blog" style={{ fontSize: '14px', fontWeight: 600 }}>← Back to Blog</Link>
          </div>
          <span className="status-badge status-Submitted">{post.category}</span>
          <h1 style={{ marginTop: '16px' }}>{post.title}</h1>
          <p>{post.author} · {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '40px', boxShadow: 'var(--shadow)' }}>
            <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: 'var(--navy)' }}>{post.excerpt}</p>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: 'var(--gray)' }}>{post.content}</p>
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/apply" className="btn btn-primary">Need a document service? Apply now →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
