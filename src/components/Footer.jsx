import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="wrap foot-inner">
        <Link to="/" className="logo" style={{ cursor: 'pointer' }}>
          <span className="logo-mark" style={{ width: '28px', height: '28px', fontSize: '13px' }}>
            AP
          </span>
          AI Placement Mentor
        </Link>
        <div className="foot-links">
          <Link to="/">Workspace</Link>
          <Link to="/resume">Resume</Link>
          <Link to="/planning">Planning</Link>
          <Link to="/execute">Execute</Link>
        </div>
        <div className="foot-copy mono">Built for the placement season.</div>
      </div>
    </footer>
  );
}
