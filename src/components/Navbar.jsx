import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ session, onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      color: isActive ? 'var(--ink)' : 'var(--muted)',
      fontWeight: isActive ? '700' : '600',
      borderBottom: isActive ? '2px solid var(--violet)' : 'none',
      paddingBottom: '4px'
    };
  };

  const navLinks = [
    { path: '/resume', label: 'Resume' },
    { path: '/workspace', label: 'Workspace' },
    { path: '/planning', label: 'Planning' },
    { path: '/execute', label: 'Execute' },
  ];

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="logo" style={{ cursor: 'pointer' }}>
            <span className="logo-mark">AP</span>
            AI Placement Mentor
          </Link>
          <div className="nav-links" style={{ gap: '28px', alignItems: 'center' }}>
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} style={getLinkStyle(link.path)}>{link.label}</Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {session ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--paper-2)',
                    border: '2px solid var(--violet)',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  title="View Profile Menu"
                >
                  {session.avatar || '👤'}
                </button>

                {menuOpen && (
                  <>
                    <div
                      onClick={() => setMenuOpen(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '48px',
                        right: 0,
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid var(--line)',
                        borderRadius: '16px',
                        boxShadow: '0 16px 40px rgba(23,23,31,0.14)',
                        padding: '16px',
                        minWidth: '210px',
                        zIndex: 100,
                        textAlign: 'left',
                        animation: 'fadeSlideUp 0.25s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', borderBottom: '1px solid var(--paper-2)', paddingBottom: '12px' }}>
                        <span style={{ fontSize: '26px' }}>{session.avatar || '👤'}</span>
                        <div style={{ overflow: 'hidden' }}>
                          <strong style={{ fontSize: '14px', color: 'var(--ink)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {session.name}
                          </strong>
                          <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {session.email}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onLogout();
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'var(--coral)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          display: 'block',
                          textAlign: 'center',
                          transition: 'background 0.2s, transform 0.2s'
                        }}
                      >
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="nav-cta"
                style={{
                  background: location.pathname === '/auth' ? 'var(--violet-deep)' : 'var(--ink)'
                }}
              >
                Get started{' '}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            )}

            {/* Hamburger Button */}
            <button
              className={`hamburger ${mobileOpen ? 'open' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Slide-in Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={location.pathname === link.path ? 'active' : ''}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        {session ? (
          <button
            onClick={() => {
              setMobileOpen(false);
              onLogout();
            }}
            className="mobile-cta"
            style={{ background: 'var(--coral)', marginTop: 'auto' }}
          >
            Log Out
          </button>
        ) : (
          <Link
            to="/auth"
            className="mobile-cta"
            onClick={() => setMobileOpen(false)}
          >
            Get started
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )}
      </div>
    </>
  );
}
