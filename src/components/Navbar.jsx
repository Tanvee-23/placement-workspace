import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ session, onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      color: isActive ? 'var(--ink)' : 'var(--muted)',
      fontWeight: isActive ? '700' : '600',
      borderBottom: isActive ? '2px solid var(--violet)' : 'none',
      paddingBottom: '4px'
    };
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="logo" style={{ cursor: 'pointer' }}>
          <span className="logo-mark">AP</span>
          AI Placement Mentor
        </Link>
        <div className="nav-links" style={{ gap: '28px', alignItems: 'center' }}>
          <Link to="/resume" style={getLinkStyle('/resume')}>Resume</Link>
          <Link to="/workspace" style={getLinkStyle('/workspace')}>Workspace</Link>
          <Link to="/planning" style={getLinkStyle('/planning')}>Planning</Link>
          <Link to="/execute" style={getLinkStyle('/execute')}>Execute</Link>
        </div>
        
        {session ? (
          /* Logged In State: Show Avatar bubble with Dropdown Profile menu */
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
                transition: 'transform 0.2s'
              }}
              title="View Profile Menu"
            >
              {session.avatar || '👤'}
            </button>

            {menuOpen && (
              <>
                {/* Backdrop overlay to close the menu when clicking outside */}
                <div 
                  onClick={() => setMenuOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                />
                
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '48px', 
                    right: 0, 
                    background: '#fff', 
                    border: '1px solid var(--line)', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 24px rgba(23,23,31,0.12)', 
                    padding: '16px', 
                    minWidth: '200px', 
                    zIndex: 100, 
                    textAlign: 'left' 
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
                      padding: '8px 12px',
                      background: 'var(--coral)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'block',
                      textAlign: 'center'
                    }}
                  >
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Logged Out State: Show "Get started" button */
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
      </div>
    </nav>
  );
}
