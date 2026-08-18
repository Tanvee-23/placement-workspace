import React from 'react';

export default function SpotlightCompany() {
  return (
    <section className="spotlight" id="company">
      <div className="wrap spotlight-row rev">
        <div className="spot-text reveal">
          <span className="spot-badge">Stage 02 — Research</span>
          <h3>Every target company, one dashboard.</h3>
          <p>
            Stop juggling browser tabs and old PDFs. Each company gets a profile with its
            interview process, past questions, and where you currently stand in prep.
          </p>
          <ul className="spot-list">
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="var(--coral-soft)" />
                <path
                  d="M8 12l3 3 5-6"
                  stroke="var(--coral)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Round-by-round interview breakdowns
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="var(--coral-soft)" />
                <path
                  d="M8 12l3 3 5-6"
                  stroke="var(--coral)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Prep progress tracked per company
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="var(--coral-soft)" />
                <path
                  d="M8 12l3 3 5-6"
                  stroke="var(--coral)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Mock interview sets matched to each company
            </li>
          </ul>
        </div>
        <div className="spot-art reveal">
          <div className="mock">
            <div className="mock-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="co-row">
              <div className="co-name">
                <span className="co-tag" style={{ background: 'var(--violet)' }}>TC</span>
                TechCorp
              </div>
              <span className="co-stage">Round 3 / 4</span>
            </div>
            <div className="co-row">
              <div className="co-name">
                <span className="co-tag" style={{ background: 'var(--coral)' }}>DS</span>
                Datasys
              </div>
              <span className="co-stage">Round 1 / 3</span>
            </div>
            <div className="co-row">
              <div className="co-name">
                <span className="co-tag" style={{ background: 'var(--mint)' }}>NX</span>
                Nexora
              </div>
              <span className="co-stage">OA scheduled</span>
            </div>
            <div className="co-row">
              <div className="co-name">
                <span className="co-tag" style={{ background: 'var(--yellow)', color: '#5a4200' }}>
                  FL
                </span>
                Fintlab
              </div>
              <span className="co-stage">Not started</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
