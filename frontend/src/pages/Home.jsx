import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import useScrollReveal from '../hooks/useScrollReveal.js';

const reviews = [
  { n: 'Ananya R.', loc: 'Pune, Maharashtra', t: 'Renewed my passport without a single office visit. Tracking was spot on and the delivery agent was very professional.' },
  { n: 'Mohammed I.', loc: 'Hyderabad, Telangana', t: 'PAN correction done in days, not weeks. The app kept me updated at every stage of the process.' },
  { n: 'Kavya S.', loc: 'Bengaluru, Karnataka', t: 'Got my Aadhaar address updated and a fresh PVC card delivered home. Genuinely felt premium and reliable.' },
  { n: 'Rohit V.', loc: 'Delhi NCR', t: 'Doorstep pickup for my documents saved me so much time. Highly recommend DocuFast India.' },
  { n: 'Priya M.', loc:'Mumbai, Maharashtra', t:'The tracking system is brilliant — I could see exactly where my application was at every step.' },
  { n: 'Arjun K.', loc:'Chennai, Tamil Nadu', t:'Professional service from start to finish. The team handled my voter ID correction seamlessly.' },
];

const faqs = [
  { q: 'How long does a passport application take?', a: 'Fresh passport applications typically take 25-30 days, while tatkal applications are processed in 3-7 days. We keep you updated at every stage via our tracking system.' },
  { q: 'Can I track my application online?', a: 'Yes! Every application gets a unique tracking ID. Enter it on our Track Order page to see real-time status updates from submission to delivery.' },
  { q: 'Do you offer doorstep document pickup?', a: 'Absolutely. Our courier partners pick up your documents from your doorstep and deliver the finished documents back to you across 28+ states.' },
  { q: 'What documents do I need for a PAN card?', a: 'You need an identity proof (Aadhaar/voter ID), address proof, and a passport-size photo. Our team guides you through the exact requirements during the application process.' },
  { q: 'Is my data safe with DocuFast India?', a: 'Yes. We use bank-grade encryption for all data. Your documents are handled securely and never shared with unauthorized parties.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI, credit/debit cards, net banking, and popular digital wallets. Payment is collected only after your application is reviewed.' },
];

export default function Home() {
  const [services, setServices] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useScrollReveal([services]);

  useEffect(() => {
    api.getServices().then(data => setServices(data.services)).catch(() => {});
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-badge"><span className="dot"></span>TRUSTED ACROSS INDIA</div>
            <h1>India's Trusted <span className="gold">Document</span> Platform</h1>
            <p>Making document services simple, secure and accessible across India with doorstep convenience — from application to delivery, fully tracked online.</p>
            <div className="hero-buttons">
              <Link to="/apply" className="btn btn-primary">Apply Now →</Link>
              <Link to="/services" className="btn btn-outline">Explore Services</Link>
            </div>
            <div className="hero-stats">
              <div><b>5000+</b><span>Customers Served</span></div>
              <div><b>99%</b><span>Happy Customers</span></div>
              <div><b>28+</b><span>States Covered</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-circle">
              <div className="float-card center">
                <div className="icon">🪪</div>
                <div>Voter ID<br /><span style={{ fontSize: '12px', color: 'var(--gray)' }}>Apply Online</span></div>
              </div>
            </div>
            <div className="float-card" style={{ top: '20px', left: '-10px' }}>
              <div className="icon">📘</div>
              <div>Passport<br /><span style={{ fontSize: '12px', color: 'var(--gray)' }}>Apply / Renew</span></div>
            </div>
            <div className="float-card" style={{ top: '20px', right: '-10px' }}>
              <div className="icon">💳</div>
              <div>PAN Card<br /><span style={{ fontSize: '12px', color: 'var(--gray)' }}>New / Update</span></div>
            </div>
            <div className="float-card" style={{ bottom: '20px', left: '-10px' }}>
              <div className="icon">🆔</div>
              <div>Aadhaar<br /><span style={{ fontSize: '12px', color: 'var(--gray)' }}>Update / Print</span></div>
            </div>
            <div className="float-card" style={{ bottom: '20px', right: '-10px' }}>
              <div className="icon">🚗</div>
              <div>Driving Licence<br /><span style={{ fontSize: '12px', color: 'var(--gray)' }}>Apply / Renew</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>One platform for every document need</h2>
            <p>From passports to printing, we handle it all — professionally, securely, and delivered to your door.</p>
          </div>
          <div className="svc-grid">
            {services.map((s, i) => (
              <div key={s.id} className="svc-card reveal" style={{ transitionDelay: `${(i % 4) * 0.1}s` }}>
                <div className="svc-icon">📄</div>
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
                <Link to={`/services/${s.slug}`} className="learn">Learn more →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="section why">
        <div className="container">
          <div className="section-head">
            <h2>Built for trust, designed for speed</h2>
            <p>Every document handled with care, every step tracked, every delivery on time.</p>
          </div>
          <div className="why-grid">
            <ul className="why-features">
              <li><span className="check">✓</span>Doorstep pickup and delivery across 28+ states</li>
              <li><span className="check">✓</span>Real-time tracking from submission to delivery</li>
              <li><span className="check">✓</span>Bank-grade data security and encryption</li>
              <li><span className="check">✓</span>Expert guidance at every step of the process</li>
              <li><span className="check">✓</span>99% customer satisfaction rate</li>
            </ul>
            <div className="why-stats">
              <div className="why-stat"><div className="num">5000<span className="gold">+</span></div><div className="lbl">Customers Served</div></div>
              <div className="why-stat"><div className="num">99<span className="gold">%</span></div><div className="lbl">Happy Customers</div></div>
              <div className="why-stat"><div className="num">28<span className="gold">+</span></div><div className="lbl">States Covered</div></div>
              <div className="why-stat"><div className="num">24<span className="gold">/7</span></div><div className="lbl">Order Tracking</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>How it works</h2>
            <p>Three simple steps to get your documents processed and delivered.</p>
          </div>
          <div className="how-grid">
            <div className="how-step">
              <div className="num">1</div>
              <h3>Apply Online</h3>
              <p>Choose your service, fill out the application form, and submit your details in minutes.</p>
            </div>
            <div className="how-step">
              <div className="num">2</div>
              <h3>We Process</h3>
              <p>Our team verifies your documents and processes your application with the relevant authority.</p>
            </div>
            <div className="how-step">
              <div className="num">3</div>
              <h3>Doorstep Delivery</h3>
              <p>Track your application in real-time and receive your documents at your doorstep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="banner">
        <div className="container">
          <h2>Your Documents.<br /><span className="gold">Our Responsibility.</span></h2>
          <p>Join 5000+ customers who trust DocuFast India for their document needs.</p>
          <Link to="/apply" className="btn btn-primary">Start Your Application →</Link>
        </div>
      </section>

      {/* Reviews */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Loved by customers across India</h2>
            <p>Real stories from real customers who got their documents sorted with DocuFast.</p>
          </div>
          <div className="review-grid">
            {reviews.slice(0, 6).map((r, i) => (
              <div key={i} className="review-card">
                <div className="stars">★★★★★</div>
                <p>"{r.t}"</p>
                <div className="reviewer">
                  <div className="avatar">{r.n[0]}</div>
                  <div>
                    <div className="name">{r.n}</div>
                    <div className="loc">{r.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div className="section-head">
            <h2>Frequently asked questions</h2>
            <p>Everything you need to know about our document services.</p>
          </div>
          <div className="faq-wrap">
            {faqs.map((f, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <span className="arrow">▼</span>
                </div>
                <div className="faq-a"><p>{f.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="section-head">
            <h2>Let's get your document moving</h2>
            <p>Have questions? We're here to help. Reach out and our team will get back to you.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-primary">Contact Us</Link>
            <Link to="/apply" className="btn btn-outline">Apply Now</Link>
          </div>
        </div>
      </section>
    </>
  );
}
