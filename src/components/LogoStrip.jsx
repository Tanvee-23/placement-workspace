import React from 'react';

export default function LogoStrip() {
  const items = [
    'Resume · ATS scoring',
    'Company research hub',
    'Daily planner',
    'Notes workspace',
    'Mock interviews',
    'Streak tracking',
  ];

  return (
    <div className="strip">
      <div className="strip-inner">
        {/* Duplicate items for seamless infinite scroll marquee */}
        {[...items, ...items].map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}
