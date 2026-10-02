import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-page">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '72px', fontWeight: 800, color: 'var(--navy)' }}>404</div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Page not found</h2>
        <p style={{ color: 'var(--gray)', marginBottom: '24px' }}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">Back to Home →</Link>
      </div>
    </div>
  );
}
