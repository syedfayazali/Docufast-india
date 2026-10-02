import { useState } from 'react';
import { api } from '../api/client.js';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.submitContact(form);
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p>Have a question? We're here to help. Reach out and our team will get back to you shortly.</p>
        </div>
      </div>
      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '900px', margin: '0 auto' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Get in touch</h3>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: 'var(--gray)', marginBottom: '4px' }}>Phone</div>
                <div style={{ fontWeight: 600, fontSize: '16px' }}>+91 83749 68022</div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: 'var(--gray)', marginBottom: '4px' }}>Email</div>
                <div style={{ fontWeight: 600, fontSize: '16px' }}>support@docufastindia.com</div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: 'var(--gray)', marginBottom: '4px' }}>Hours</div>
                <div style={{ fontWeight: 600, fontSize: '16px' }}>Mon - Sat, 9 AM - 7 PM IST</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--gray)', marginBottom: '4px' }}>Coverage</div>
                <div style={{ fontWeight: 600, fontSize: '16px' }}>28+ States across India</div>
              </div>
            </div>
            <div className="form-card" style={{ margin: 0, maxWidth: 'none' }}>
              {success && <div className="form-success">✅ Message sent! We'll contact you shortly.</div>}
              {error && <div className="form-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
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
                  <label>Message</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message →'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
