import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Apply() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(slug || '');
  const [form, setForm] = useState({
    full_name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    address: '', notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getServices().then(data => {
      setServices(data.services);
      if (slug) setSelectedService(slug);
    }).catch(() => {});
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setError(''); setSubmitting(true);
    try {
      const result = await api.submitApplication({ service_type: selectedService, ...form });
      setSuccess(result.tracking_id);
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2>Application Submitted!</h2>
          <p style={{ marginBottom: '24px' }}>Your application has been received. Save your tracking ID to check status anytime.</p>
          <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', color: 'var(--gray)', marginBottom: '4px' }}>Your Tracking ID</div>
            <div style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 700 }}>{success}</div>
          </div>
          <Link to="/track" className="btn btn-primary btn-full" style={{ marginBottom: '12px' }}>Track Your Order</Link>
          <Link to="/dashboard" className="btn btn-outline btn-full">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Apply for a Service</h1>
          <p>Fill out the form below and our team will get your application started right away.</p>
        </div>
      </div>
      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="container">
          <div className="form-card">
            {!user && (
              <div style={{ background: '#fef3c7', borderRadius: 'var(--radius-sm)', padding: '14px', marginBottom: '20px', fontSize: '14px' }}>
                Please <Link to="/login" style={{ fontWeight: 700 }}>login</Link> or <Link to="/register" style={{ fontWeight: 700 }}>register</Link> to submit an application.
              </div>
            )}
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Service</label>
                <select value={selectedService} onChange={e => setSelectedService(e.target.value)} required>
                  <option value="">Choose a service...</option>
                  {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required placeholder="Your full address for document delivery" />
              </div>
              <div className="form-group">
                <label>Additional Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any specific requirements or details" />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={submitting || !user}>
                {submitting ? 'Submitting...' : 'Submit Application →'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
