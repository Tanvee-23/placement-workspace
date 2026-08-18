import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import ResumePage from './pages/ResumePage';
import WorkspacePage from './pages/WorkspacePage';
import PlanningPage from './pages/PlanningPage';
import ExecutePage from './pages/ExecutePage';
import AuthPage from './pages/AuthPage';
import ScrollToTop from './components/ScrollToTop';
import useScrollReveal from './hooks/useScrollReveal';

function AppContent() {
  const [session, setSession] = useState(null);

  // Initialize session from localStorage on mount
  useEffect(() => {
    const currentSession = localStorage.getItem('placement_mentor_session');
    if (currentSession) {
      try {
        setSession(JSON.parse(currentSession));
      } catch (e) {
        console.error('Error loading session:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('placement_mentor_session');
    setSession(null);
  };

  // Activate scroll-reveal animations on route changes
  useScrollReveal();

  return (
    <>
      <Navbar session={session} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<LandingPage session={session} />} />
        <Route path="/resume" element={<ResumePage session={session} />} />
        <Route path="/workspace" element={<WorkspacePage session={session} />} />
        <Route path="/planning" element={<PlanningPage session={session} />} />
        <Route path="/execute" element={<ExecutePage session={session} />} />
        <Route path="/auth" element={<AuthPage session={session} setSession={setSession} />} />
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}
