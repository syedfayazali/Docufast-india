import { useState } from 'react';
import { api } from '../api/client.js';

export default function Track() {
  const [trackingId, setTrackingId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const data = await api.trackOrder(trackingId.trim());
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Track Your Order</h1>
          <p>Enter your tracking ID to see the real-time status of your application.</p>
        </div>
      </div>
      <section className="section track-page" style={{ paddingTop: '40px' }}>
        <div className="container">
          <div className="form-card" style={{ maxWidth: '500px' }}>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleTrack}>
              <div className="form-group">
                <label>Tracking ID</label>
                <input type="text" value={trackingId} onChange={e => setTrackingId(e.target.value)} placeholder="e.g. DF1A2B3C4D" required style={{ fontFamily: 'monospace' }} />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Tracking...' : 'Track Order →'}
              </button>
            </form>
          </div>

          {result && (
            <div className="track-result">
              <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '32px', boxShadow: 'var(--shadow)' }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--gray)' }}>Service</div>
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>{result.service_type}</div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--gray)' }}>Applicant</div>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{result.full_name}</div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--gray)', marginBottom: '4px' }}>Current Status</div>
                  <span className={`status-badge status-${result.status}`}>{result.status}</span>
                </div>
                <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Tracking Progress</h3>
                {result.stages.map((stage, i) => (
                  <div key={i} className={`track-stage ${stage.completed ? 'completed' : ''}`}>
                    <div className="dot">{stage.completed ? '✓' : ''}</div>
                    <div className="name">{stage.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
