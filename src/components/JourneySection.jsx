import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function JourneySection() {
  const progPathRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const progPath = progPathRef.current;
    const wrap = wrapRef.current;
    if (!progPath || !wrap) return;

    let len = 0;
    try {
      len = progPath.getTotalLength();
    } catch (e) {
      len = 1600; // fallback length
    }

    progPath.style.strokeDasharray = `${len}`;
    progPath.style.strokeDashoffset = `${len}`;

    const updatePath = () => {
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const total = rect.height + vh * 0.3;
      let progress = (start - rect.top) / total;
      progress = Math.max(0, Math.min(1, progress));
      progPath.style.strokeDashoffset = `${len * (1 - progress)}`;
    };

    window.addEventListener('scroll', updatePath, { passive: true });
    window.addEventListener('resize', updatePath);
    updatePath();

    return () => {
      window.removeEventListener('scroll', updatePath);
      window.removeEventListener('resize', updatePath);
    };
  }, []);

  return (
    <section className="journey" id="journey">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="kicker">The workspace, mapped</span>
          <h2>Four stages. Twelve tools. One placement journey.</h2>
          <p>
            Every feature sits inside the same path a student actually walks — from finding
            out where you stand, to walking into the interview room ready.
          </p>
        </div>

        <div className="journey-path-wrap" id="pathWrap" ref={wrapRef}>
          <svg className="journey-svg" id="journeySvg" viewBox="0 0 100 1600" preserveAspectRatio="none">
            <defs>
              <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6c5ce0" />
                <stop offset="35%" stopColor="#ff6f5e" />
                <stop offset="68%" stopColor="#2fbf8f" />
                <stop offset="100%" stopColor="#ffc64b" />
              </linearGradient>
            </defs>
            <path
              id="basePath"
              d="M50 0 C10 130 90 220 50 340 C10 460 90 550 50 680 C10 800 90 900 50 1030 C10 1150 90 1260 50 1380 C20 1460 70 1520 50 1600"
              strokeLinecap="round"
            />
            <path
              id="progPath"
              ref={progPathRef}
              className="progress"
              d="M50 0 C10 130 90 220 50 340 C10 460 90 550 50 680 C10 800 90 900 50 1030 C10 1150 90 1260 50 1380 C20 1460 70 1520 50 1600"
              strokeLinecap="round"
            />
          </svg>

          {/* STAGE 01 */}
          <div className="stage">
            <Link to="/resume" className="stage-label reveal" style={{ display: 'block', cursor: 'pointer' }}>
              <div className="stage-num" style={{ background: 'var(--violet)' }}>01</div>
              <h3>Assess</h3>
              <p>Find out exactly where your resume and skills stand</p>
            </Link>
            
            <div className="node-row reveal">
              <div className="node-card">
                <div className="node-icon" style={{ background: 'var(--violet-soft)' }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 3h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z"
                      stroke="var(--violet-deep)"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M9 13l2 2 4-5"
                      stroke="var(--violet-deep)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h4>Resume Analyzer</h4>
                  <p>
                    Rule-based ATS scoring that flags missing keywords, weak bullet points,
                    and formatting issues before recruiters see them.
                  </p>
                </div>
              </div>
            </div>

            <div className="node-row reveal">
              <div className="node-card">
                <div className="node-icon" style={{ background: 'var(--violet-soft)' }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3v12M12 15l-4-4M12 15l4-4"
                      stroke="var(--violet-deep)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                      stroke="var(--violet-deep)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <h4>Resume Upload &amp; Score</h4>
                  <p>
                    Upload any version and get an instant score with a clear breakdown of
                    what to fix next.
                  </p>
                </div>
              </div>
            </div>

            <div className="node-row reveal">
              <div className="node-card">
                <div className="node-icon" style={{ background: 'var(--violet-soft)' }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="3" stroke="var(--violet-deep)" strokeWidth="1.8" />
                    <path
                      d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
                      stroke="var(--violet-deep)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M17 4l1.5 1.5L21 3"
                      stroke="var(--violet-deep)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h4>Skill Recommendation</h4>
                  <p>
                    A rule-based match between your profile and target roles surfaces the
                    exact skills worth learning next.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* STAGE 02 */}
          <div className="stage">
            <Link to="/workspace" className="stage-label reveal" style={{ display: 'block', cursor: 'pointer' }}>
              <div className="stage-num" style={{ background: 'var(--coral)' }}>02</div>
              <h3>Research</h3>
              <p>Know every company before it interviews you</p>
            </Link>

            <div className="node-row reveal">
              <div className="node-card">
                <div className="node-icon" style={{ background: 'var(--coral-soft)' }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 21V7l8-4 8 4v14"
                      stroke="var(--coral)"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path d="M9 21v-6h6v6" stroke="var(--coral)" strokeWidth="1.8" />
                  </svg>
                </div>
                <div>
                  <h4>Company-wise Preparation Dashboard</h4>
                  <p>
                    Track every company you're targeting with prep status, rounds cleared,
                    and what's left to revise.
                  </p>
                </div>
              </div>
            </div>

            <div className="node-row reveal">
              <div className="node-card">
                <div className="node-icon" style={{ background: 'var(--coral-soft)' }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2l9 4.5v9L12 20l-9-4.5v-9z"
                      stroke="var(--coral)"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 11v6M8 8.5l4 2.5 4-2.5"
                      stroke="var(--coral)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h4>Company Information &amp; Interview Process</h4>
                  <p>
                    Round-by-round breakdowns — from OA pattern to HR — sourced into one
                    clean profile per company.
                  </p>
                </div>
              </div>
            </div>

            <div className="node-row reveal">
              <div className="node-card">
                <div className="node-icon" style={{ background: 'var(--coral-soft)' }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="9"
                      width="6"
                      height="12"
                      rx="1"
                      stroke="var(--coral)"
                      strokeWidth="1.8"
                    />
                    <rect
                      x="15"
                      y="5"
                      width="6"
                      height="16"
                      rx="1"
                      stroke="var(--coral)"
                      strokeWidth="1.8"
                    />
                    <circle cx="6" cy="6" r="2" stroke="var(--coral)" strokeWidth="1.8" />
                  </svg>
                </div>
                <div>
                  <h4>Mock Interview</h4>
                  <p>
                    Predefined question sets by company and role so you rehearse the
                    questions you'll actually be asked.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* STAGE 03 */}
          <div className="stage">
            <Link to="/planning" className="stage-label reveal" style={{ display: 'block', cursor: 'pointer' }}>
              <div className="stage-num" style={{ background: 'var(--mint)' }}>03</div>
              <h3>Plan</h3>
              <p>Turn preparation into a schedule you can follow</p>
            </Link>

            <div className="node-row reveal">
              <div className="node-card">
                <div className="node-icon" style={{ background: 'var(--mint-soft)' }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 6h16M4 12h10M4 18h13"
                      stroke="var(--mint)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle cx="20" cy="12" r="1.4" fill="var(--mint)" />
                    <circle cx="19" cy="18" r="1.4" fill="var(--mint)" />
                  </svg>
                </div>
                <div>
                  <h4>Topic-wise Preparation Roadmaps</h4>
                  <p>
                    DSA, CS fundamentals, aptitude — laid out as ordered roadmaps so you
                    always know the next topic.
                  </p>
                </div>
              </div>
            </div>

            <div className="node-row reveal">
              <div className="node-card">
                <div className="node-icon" style={{ background: 'var(--mint-soft)' }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="var(--mint)" strokeWidth="1.8" />
                    <path
                      d="M12 7v5l3.5 2"
                      stroke="var(--mint)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h4>Daily Study Planner</h4>
                  <p>
                    Break weekly goals into daily blocks that adapt to how much you
                    actually finish.
                  </p>
                </div>
              </div>
            </div>

            <div className="node-row reveal">
              <div className="node-card">
                <div className="node-icon" style={{ background: 'var(--mint-soft)' }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="16"
                      rx="2"
                      stroke="var(--mint)"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M3 9h18M8 3v4M16 3v4"
                      stroke="var(--mint)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <h4>Calendar &amp; Schedule Management</h4>
                  <p>
                    Every OA, interview date, and revision block lives on one calendar — no
                    more missed deadlines.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* STAGE 04 */}
          <div className="stage" style={{ marginBottom: 0 }}>
            <Link to="/execute" className="stage-label reveal" style={{ display: 'block', cursor: 'pointer' }}>
              <div className="stage-num" style={{ background: 'var(--yellow)', color: 'var(--ink)' }}>
                04
              </div>
              <h3>Execute</h3>
              <p>Show up daily and keep everything in one place</p>
            </Link>

            <div className="node-row reveal">
              <div className="node-card">
                <div className="node-icon" style={{ background: 'var(--yellow-soft)' }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="17"
                      rx="2"
                      stroke="#c98f00"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M7 9h10M7 13h10M7 17h6"
                      stroke="#c98f00"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <h4>Task Manager (To-Do)</h4>
                  <p>
                    Quick daily to-dos that link straight back to your roadmap and calendar
                    — nothing tracked twice.
                  </p>
                </div>
              </div>
            </div>

            <div className="node-row reveal">
              <div className="node-card">
                <div className="node-icon" style={{ background: 'var(--yellow-soft)' }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 4h14v16l-7-4-7 4z"
                      stroke="#c98f00"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h4>Notes Workspace</h4>
                  <p>
                    A Notion-style space for company notes, DSA patterns, and interview
                    learnings, organised your way.
                  </p>
                </div>
              </div>
            </div>

            <div className="node-row reveal">
              <div className="node-card">
                <div className="node-icon" style={{ background: 'var(--yellow-soft)' }}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3c3 3 5 6 5 9a5 5 0 01-10 0c0-1.2.5-2.2 1.3-3.2C9 10 9.5 11 9.5 11S9 6.5 12 3z"
                      stroke="#c98f00"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h4>Daily Streak &amp; Achievement System</h4>
                  <p>
                    A visible streak keeps consistency honest, with milestones that mark
                    real progress, not just logins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
