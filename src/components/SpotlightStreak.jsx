import React from 'react';
import { getStreak7Days } from '../utils/storage';

export default function SpotlightStreak({ streaks = { count: 0, lastCheckIn: null } }) {
  const streakCount = streaks?.count || 0;
  const cells = getStreak7Days(streaks);

  let milestoneText = '';
  if (streakCount < 3) {
    milestoneText = '3-day streak — ⚡ OA Expert Milestone badge';
  } else if (streakCount < 7) {
    milestoneText = '7-day streak — 🌳 DSA Master Milestone badge';
  } else {
    const nextVal = streakCount + (7 - (streakCount % 7));
    milestoneText = `${nextVal}-day streak — Consistent Prep badge`;
  }

  return (
    <section className="spotlight" id="practice" style={{ paddingBottom: '20px' }}>
      <div className="wrap spotlight-row rev">
        <div className="spot-text reveal">
          <span className="spot-badge">Stage 04 — Execute</span>
          <h3>Consistency you can actually see.</h3>
          <p>
            Placement prep is won in the daily grind. A visible streak and milestone
            system keeps that grind honest — and a little more satisfying.
          </p>
          <ul className="spot-list">
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="var(--yellow-soft)" />
                <path
                  d="M8 12l3 3 5-6"
                  stroke="#c98f00"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Streak counts real prep activity, not logins
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="var(--yellow-soft)" />
                <path
                  d="M8 12l3 3 5-6"
                  stroke="#c98f00"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Milestones for roadmap chapters completed
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="var(--yellow-soft)" />
                <path
                  d="M8 12l3 3 5-6"
                  stroke="#c98f00"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              All notes, tasks and mocks in one Notion-style hub
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
            <div className="flame-row">
              <span style={{ fontSize: '34px' }}>🔥</span>
              <span className="flame-num">{streakCount}</span>
              <span className="flame-lbl">day streak</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
              {cells.map((cell, idx) => {
                let cellClass = "day-cell";
                let cellText = "·";
                
                if (cell.isToday) {
                  if (cell.active) {
                    cellClass = "day-cell today";
                    cellText = "✓";
                  } else {
                    cellClass = "day-cell";
                    cellText = "·";
                  }
                } else {
                  if (cell.active) {
                    cellClass = "day-cell on";
                    cellText = "✓";
                  } else {
                    cellClass = "day-cell";
                    cellText = "·";
                  }
                }
                
                return (
                  <div 
                    key={idx} 
                    className={cellClass} 
                    style={{ aspectRatio: 'auto', height: '34px', flex: 1 }}
                    title={cell.dateStr + (cell.active ? " (Completed)" : " (No activity)")}
                  >
                    {cellText}
                  </div>
                );
              })}
            </div>
            <p style={{ marginTop: '14px', fontSize: '12.5px', color: 'var(--muted)' }}>
              Next milestone:{' '}
              <strong style={{ color: 'var(--ink)' }}>{milestoneText}</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

