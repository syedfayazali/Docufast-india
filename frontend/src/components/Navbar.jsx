import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ scrolled }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/track', label: 'Track Order' },
    { to: '/about', label: 'About' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src="/logos/docufast-logo.png" alt="DocuFast India" style={{ height: '40px', width: 'auto' }} />
        </Link>
        <nav className={`navbar-links ${open ? 'open' : ''}`} onClick={() => setOpen(false)}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={location.pathname === l.to ? { opacity: 1 } : {}}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '14px' }}>Dashboard</Link>
              <button onClick={logout} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontWeight: 600, fontSize: '15px' }}>Login</Link>
              <Link to="/apply" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>Apply Now</Link>
            </>
          )}
          <button className="navbar-toggle" onClick={() => setOpen(!open)}>☰</button>
        </div>
      </div>
    </header>
  );
}
