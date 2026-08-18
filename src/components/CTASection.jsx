import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="cta" id="cta">
      <div className="wrap">
        <div className="cta-box reveal">
          <h2>Your placement prep, finally out of fourteen tabs.</h2>
          <p>
            Score your resume, plan your week, and walk into interviews having already done the
            rounds.
          </p>
          <button className="btn-primary" onClick={() => navigate('/workspace')}>
            Start your workspace
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
