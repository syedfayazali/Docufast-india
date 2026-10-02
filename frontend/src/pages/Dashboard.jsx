import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getApplications().then(data => { setApplications(data.applications); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-grid">
          <div className="dashboard-sidebar">
            <h3>Menu</h3>
            <Link to="/dashboard" className="active">My Applications</Link>
            <Link to="/apply">New Application</Link>
            <Link to="/track">Track Order</Link>
            <Link to="/services">Browse Services</Link>
            <Link to="/contact">Support</Link>
          </div>
          <div className="dashboard-content">
            <h2>Welcome, {user?.name}!</h2>
            <p style={{ color: 'var(--gray)', marginBottom: '32px' }}>Here are your document applications and their current status.</p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '160px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: 'var(--gray)' }}>Total Applications</div>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>{applications.length}</div>
              </div>
              <div style={{ flex: '1', minWidth: '160px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: 'var(--gray)' }}>In Progress</div>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>{applications.filter(a => a.status !== 'Completed').length}</div>
              </div>
              <div style={{ flex: '1', minWidth: '160px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', padding: '20px' }}>
                <div style={{ fontSize: '13px', color: 'var(--gray)' }}>Completed</div>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>{applications.filter(a => a.status === 'Completed').length}</div>
              </div>
            </div>

            {loading ? (
              <p style={{ color: 'var(--gray)' }}>Loading your applications...</p>
            ) : applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--gray)', marginBottom: '20px' }}>You haven't submitted any applications yet.</p>
                <Link to="/apply" className="btn btn-primary">Submit Your First Application →</Link>
              </div>
            ) : (
              applications.map(app => (
                <div key={app.id} className="app-item">
                  <div className="top">
                    <div>
                      <div className="svc">{app.service_type}</div>
                      <div className="tid">Tracking ID: {app.tracking_id}</div>
                    </div>
                    <span className={`status-badge status-${app.status}`}>{app.status}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--gray)', marginTop: '8px' }}>
                    Submitted on {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
