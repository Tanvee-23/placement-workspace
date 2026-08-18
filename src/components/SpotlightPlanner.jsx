import React from 'react';

export default function SpotlightPlanner() {
  return (
    <section className="spotlight" id="planning">
      <div className="wrap spotlight-row">
        <div className="spot-text reveal">
          <span className="spot-badge">Stage 03 — Plan</span>
          <h3>A schedule that actually reflects your week.</h3>
          <p>
            Roadmaps break down into daily tasks, tasks land on your calendar, and the
            planner adjusts when a day slips — so the plan stays honest instead of
            aspirational.
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
              Roadmap topics auto-scheduled into your week
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
              One calendar for OAs, interviews, and revision
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
              Daily to-dos that close the loop automatically
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
            <div className="day-grid">
              <div className="day-cell on">M</div>
              <div className="day-cell on">T</div>
              <div className="day-cell today">W</div>
              <div className="day-cell">T</div>
              <div className="day-cell">F</div>
              <div className="day-cell">S</div>
              <div className="day-cell">S</div>
            </div>
            <div className="task-row done">
              <div className="task-check done"></div>
              <span>Revise Graphs — DSA roadmap</span>
            </div>
            <div className="task-row done">
              <div className="task-check done"></div>
              <span>Fintlab OA — practice set 2</span>
            </div>
            <div className="task-row">
              <div className="task-check"></div>
              <span>Mock interview — Nexora, HR round</span>
            </div>
            <div className="task-row">
              <div className="task-check"></div>
              <span>Notes: system design basics</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
