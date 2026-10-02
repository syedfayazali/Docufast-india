import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';

export default function ServiceDetail() {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getService(slug).then(data => { setService(data.service); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="page-header"><div className="container"><p>Loading...</p></div></div>;
  if (!service) return <div className="page-header"><div className="container"><h1>Service not found</h1><Link to="/services" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Services</Link></div></div>;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>{service.name}</h1>
          <p>{service.desc}</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '36px', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--gray)', marginBottom: '4px' }}>Starting Price</div>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{service.price}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--gray)', marginBottom: '4px' }}>Estimated Duration</div>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{service.duration}</div>
              </div>
            </div>
            <h3 style={{ marginBottom: '16px' }}>What's included</h3>
            <ul style={{ marginBottom: '32px' }}>
              {[
                'Expert guidance throughout the application process',
                'Document verification and validation',
                'Submission to the relevant authority',
                'Real-time tracking from start to finish',
                'Doorstep delivery of your finished documents',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to={`/apply/${service.slug}`} className="btn btn-primary">Apply for this service →</Link>
              <Link to="/contact" className="btn btn-outline">Ask a question</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
