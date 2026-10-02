import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <img src="/logos/docufast-full.png" alt="DocuFast India" style={{ height: '56px', width: 'auto', marginBottom: '16px' }} />
            <p style={{ fontSize: '14px', maxWidth: '300px' }}>
              India's trusted document platform — making document services simple, secure and accessible with doorstep convenience.
            </p>
          </div>
          <div>
            <h5>Services</h5>
            <ul>
              <li><Link to="/services/passport">Passport Services</Link></li>
              <li><Link to="/services/pan">PAN Services</Link></li>
              <li><Link to="/services/aadhaar">Aadhaar Services</Link></li>
              <li><Link to="/services/driving-licence">Driving Licence</Link></li>
              <li><Link to="/services/printing">Document Printing</Link></li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/track">Track Order</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h5>Policies</h5>
            <ul>
              <li><Link to="/">Privacy Policy</Link></li>
              <li><Link to="/">Terms of Service</Link></li>
              <li><Link to="/">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 DocuFast India. India's Trusted Document Platform.</span>
          <span>Made with care for every Indian, everywhere.</span>
        </div>
      </div>
    </footer>
  );
}
