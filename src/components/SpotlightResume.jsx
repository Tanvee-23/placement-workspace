import React from 'react';

export default function SpotlightResume({ score }) {
  const hasScore = score !== undefined && score !== null;
  const scoreVal = hasScore ? score : 0;
  
  // Dynamic calculation for display bars based on actual score
  const keywordsVal = hasScore ? Math.min(100, Math.floor(score * 0.95)) : 0;
  const structureVal = hasScore ? Math.min(100, Math.floor(score * 1.03)) : 0;
  const clarityVal = hasScore ? Math.min(100, Math.floor(score * 0.89)) : 0;

  return (
    <section className="spotlight" id="resume">
      <div className="wrap spotlight-row">
        <div className="spot-text reveal">
          <span className="spot-badge">Stage 01 — Assess</span>
          <h3>Know your resume's real score before a recruiter does.</h3>
          <p>
            The analyzer runs the same rule-based checks an ATS uses — keyword match,
            section structure, formatting — and turns them into one score with a clear list
            of fixes.
          </p>
          <ul className="spot-list">
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="var(--mint-soft)" />
                <path
                  d="M8 12l3 3 5-6"
                  stroke="var(--mint)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Keyword match against the target job description
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="var(--mint-soft)" />
                <path
                  d="M8 12l3 3 5-6"
                  stroke="var(--mint)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Section-by-section formatting checks
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="var(--mint-soft)" />
                <path
                  d="M8 12l3 3 5-6"
                  stroke="var(--mint)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Version history so you can track score over time
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
            <div 
              className="score-ring"
              style={{
                background: `conic-gradient(var(--mint) 0deg ${scoreVal * 3.6}deg, var(--paper-2) ${scoreVal * 3.6}deg 360deg)`
              }}
            >
              <span>{hasScore ? score : 'N/A'}</span>
            </div>
            <p
              style={{
                textAlign: 'center',
                fontSize: '12.5px',
                color: 'var(--muted)',
                marginBottom: '14px',
              }}
            >
              {hasScore ? 'ATS Score · Software Engineer profile' : 'No resume analyzed yet'}
            </p>
            <div className="bar-row">
              <span style={{ width: '78px' }}>Keywords</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${keywordsVal}%`, background: 'var(--mint)' }}></div>
              </div>
              <span className="mono">{keywordsVal}%</span>
            </div>
            <div className="bar-row">
              <span style={{ width: '78px' }}>Structure</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${structureVal}%`, background: 'var(--violet)' }}></div>
              </div>
              <span className="mono">{structureVal}%</span>
            </div>
            <div className="bar-row">
              <span style={{ width: '78px' }}>Clarity</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${clarityVal}%`, background: 'var(--coral)' }}></div>
              </div>
              <span className="mono">{clarityVal}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
