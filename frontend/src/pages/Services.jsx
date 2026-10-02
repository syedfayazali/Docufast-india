import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getServices().then(data => { setServices(data.services); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Our Services</h1>
          <p>Comprehensive document services designed to save you time and effort. Choose from our wide range of services below.</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--gray)' }}>Loading services...</p>
          ) : (
            <div className="svc-grid">
              {services.map(s => (
                <div key={s.id} className="svc-card">
                  <div className="svc-icon">📄</div>
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--gray)' }}>{s.duration}</span>
                    <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{s.price}</span>
                  </div>
                  <Link to={`/services/${s.slug}`} className="learn" style={{ marginTop: '12px', display: 'inline-flex' }}>Learn more →</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
