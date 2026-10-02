import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>About DocuFast India</h1>
          <p>Making document services accessible to every Indian, everywhere.</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '40px', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Our Mission</h2>
            <p style={{ color: 'var(--gray)', marginBottom: '32px', fontSize: '16px', lineHeight: 1.8 }}>
              DocuFast India was founded with a simple goal: to make document services simple, secure, and accessible for every Indian. We believe that getting a passport, PAN card, or any government document shouldn't require multiple office visits and endless waiting. Our platform brings the entire process online — from application to doorstep delivery — with real-time tracking at every step.
            </p>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Why Choose Us</h2>
            <ul style={{ marginBottom: '32px' }}>
              {[
                'Doorstep pickup and delivery across 28+ states',
                'Real-time tracking from submission to delivery',
                'Expert guidance at every step of the process',
                'Bank-grade security for your personal data',
                '99% customer satisfaction rate',
                'Affordable pricing with transparent costs',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '18px' }}>✓</span>
                  <span style={{ fontSize: '16px' }}>{item}</span>
                </li>
              ))}
            </ul>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px' }}>Our Numbers</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800 }}>5000+</div>
                <div style={{ fontSize: '14px', color: 'var(--gray)' }}>Customers</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800 }}>28+</div>
                <div style={{ fontSize: '14px', color: 'var(--gray)' }}>States</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800 }}>12+</div>
                <div style={{ fontSize: '14px', color: 'var(--gray)' }}>Services</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800 }}>99%</div>
                <div style={{ fontSize: '14px', color: 'var(--gray)' }}>Satisfaction</div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link to="/apply" className="btn btn-primary">Get Started Today →</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
