import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import LogoStrip from '../components/LogoStrip';
import JourneySection from '../components/JourneySection';
import SpotlightResume from '../components/SpotlightResume';
import SpotlightCompany from '../components/SpotlightCompany';
import SpotlightPlanner from '../components/SpotlightPlanner';
import SpotlightStreak from '../components/SpotlightStreak';
import CTASection from '../components/CTASection';
import { loadUserData } from '../utils/storage';

export default function LandingPage({ session }) {
  const [userData, setUserData] = useState(null);

  // Sync user stats from localStorage dynamically on path visit or session change
  useEffect(() => {
    if (session) {
      setUserData(loadUserData(session.email));
    } else {
      setUserData(null);
    }
  }, [session]);

  const score = userData?.resumeData?.score;
  const streak = userData?.streaks?.count || 0;

  return (
    <>
      <Hero session={session} score={score} streak={streak} />
      <LogoStrip />
      <JourneySection />
      <SpotlightResume score={score} />
      <SpotlightCompany />
      <SpotlightPlanner />
      <SpotlightStreak streaks={userData?.streaks || { count: 0, lastCheckIn: null }} />
      <CTASection />
    </>
  );
}
