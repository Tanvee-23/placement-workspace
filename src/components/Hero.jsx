import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Hero({ session, score, streak }) {
  const navigate = useNavigate();

  const handleExplore = () => {
    const element = document.getElementById('journey');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <span className="eyebrow">
            <span className="dot"></span>
            Built for final-year placement season
          </span>
          <h1 className="hero-title">
            One workspace to go from <em>resume</em> to <em>offer letter</em>.
          </h1>
          <p className="hero-sub">
            Score your resume, study companies, plan every day, and rehearse interviews —
            all in the one place built for how placements actually happen.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleExplore}>
              Explore the workspace
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
            <button className="btn-ghost" onClick={() => navigate('/resume')}>
              See resume score
            </button>
          </div>
          <div className="hero-meta">
            <div>
              <div className="num mono">12</div>
              <div className="lbl">Tools in one workspace</div>
            </div>
            <div>
              <div className="num mono">4</div>
              <div className="lbl">Stages, start to offer</div>
            </div>
            <div>
              <div className="num mono">0₹</div>
              <div className="lbl">Cost to get started</div>
            </div>
          </div>
        </div>

        <div className="hero-art">
          <div className="float-chip chip-1">
            <span className="chip-dot" style={{ background: 'var(--mint)' }}></span>
            {score !== undefined && score !== null ? `Resume score: ${score}` : 'No resume analyzed yet'}
          </div>
          <div className="float-chip chip-2">
            <span className="chip-dot" style={{ background: 'var(--coral)' }}></span>
            {streak}-day streak 🔥
          </div>
          <svg viewBox="0 0 420 440" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="210" cy="410" rx="150" ry="18" fill="#e3dffb" />
            <path
              d="M60 90 C60 40 110 20 210 20 C310 20 360 60 355 140 C350 220 320 200 320 260 C320 330 260 360 190 360 C100 360 55 300 55 220 C55 170 60 130 60 90Z"
              fill="var(--mint-soft)"
            />
            {/* Background shapes behind character */}
            <g>
              <circle cx="345" cy="95" r="26" fill="var(--yellow)" stroke="#17171f" strokeWidth="3" />
              <path
                d="M336 95l6 6 12-13"
                stroke="#17171f"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <path
              d="M40 150l10-10M40 140l10 10"
              stroke="var(--violet)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="380" cy="200" r="6" fill="var(--coral)" />
            <circle cx="70" cy="70" r="5" fill="var(--violet)" />
            
            {/* Character Red Body/Shirt */}
            <path
              d="M150 175c10-18 34-28 65-28s55 10 65 28l10 95c0 20-34 34-75 34s-75-14-75-34z"
              fill="var(--coral)"
              stroke="#17171f"
              strokeWidth="3"
            />
            <rect
              x="197"
              y="168"
              width="36"
              height="46"
              fill="var(--coral)"
              stroke="#17171f"
              strokeWidth="3"
            />
            <path
              d="M197 176l18 14 18-14"
              stroke="#fff"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Character Face/Head clearly above red shirt */}
            <circle cx="215" cy="130" r="46" fill="#ffe0b0" stroke="#17171f" strokeWidth="3" />
            <path d="M175 118c0-26 18-40 40-40s40 14 40 40" fill="#17171f" />
            <circle cx="200" cy="130" r="4" fill="#17171f" />
            <circle cx="230" cy="130" r="4" fill="#17171f" />
            <path
              d="M200 146c6 6 22 6 28 0"
              stroke="#17171f"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* White Resume Document clearly in front of red body */}
            <rect
              x="120"
              y="230"
              width="200"
              height="130"
              rx="16"
              fill="#fff"
              stroke="#17171f"
              strokeWidth="3"
            />
            <rect x="140" y="252" width="90" height="10" rx="5" fill="var(--violet-soft)" />
            <rect x="140" y="272" width="140" height="8" rx="4" fill="#eee9fb" />
            <rect x="140" y="288" width="140" height="8" rx="4" fill="#eee9fb" />
            <rect x="140" y="304" width="100" height="8" rx="4" fill="#eee9fb" />
            <circle cx="270" cy="330" r="20" fill="var(--mint)" stroke="#17171f" strokeWidth="3" />
            <path
              d="M261 330l6 6 12-13"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Arms & Hands in front of document edges */}
            <path
              d="M150 200c-22 6-34 22-34 46"
              stroke="#17171f"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M280 200c22 6 34 22 34 46"
              stroke="#17171f"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="112" cy="252" r="15" fill="#fff" stroke="#17171f" strokeWidth="3" />
            <circle cx="320" cy="252" r="15" fill="#fff" stroke="#17171f" strokeWidth="3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
