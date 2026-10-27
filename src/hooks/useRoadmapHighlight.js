import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const ROADMAP_TARGET_MAP = {
  'analyze-resume': ['analyze-resume-card'],
  'analyze-resume-card': ['analyze-resume-card'],
  'resume-analyzer': ['analyze-resume-card'],
  'resume-upload-score': ['resume-score-card', 'resume-upload-card'],
  'resume-upload-card': ['resume-upload-card'],
  'resume-score-card': ['resume-score-card'],
  'skill-recommendation': ['skills-analysis-card', 'learning-path-card', 'role-skills-card'],
  'skills-analysis-card': ['skills-analysis-card'],
  'learning-path-card': ['learning-path-card'],
  'role-skills-card': ['role-skills-card'],
  'target-dashboard': ['target-dashboard-card'],
  'target-dashboard-card': ['target-dashboard-card'],
  'company-process': ['company-process-card'],
  'company-process-card': ['company-process-card'],
  'mock-interview': ['mock-interview-card'],
  'mock-interview-card': ['mock-interview-card'],
  'prep-roadmaps': ['prep-roadmaps-card'],
  'prep-roadmaps-card': ['prep-roadmaps-card'],
  'daily-planner': ['daily-planner-card'],
  'daily-planner-card': ['daily-planner-card'],
  'calendar-schedule': ['calendar-schedule-card'],
  'calendar-schedule-card': ['calendar-schedule-card'],
  'task-manager': ['task-manager-card'],
  'task-manager-card': ['task-manager-card'],
  'notes-workspace': ['notes-workspace-card'],
  'notes-workspace-card': ['notes-workspace-card'],
  'streak-system': ['streak-system-card'],
  'streak-system-card': ['streak-system-card']
};

let activeHighlightTimeout = null;
let activePollInterval = null;

export function clearActiveHighlights() {
  if (activeHighlightTimeout) {
    clearTimeout(activeHighlightTimeout);
    activeHighlightTimeout = null;
  }
  if (activePollInterval) {
    clearInterval(activePollInterval);
    activePollInterval = null;
  }
  document.querySelectorAll('.roadmap-highlight-glow').forEach((el) => {
    el.classList.remove('roadmap-highlight-glow');
  });
}

export function triggerRoadmapHighlight(targetKey) {
  if (!targetKey) return;
  clearActiveHighlights();

  sessionStorage.setItem('pending_roadmap_highlight', targetKey);
  const candidates = ROADMAP_TARGET_MAP[targetKey] || [targetKey];

  const findTargetElement = () => {
    for (const id of candidates) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    return null;
  };

  let attempts = 0;
  const maxAttempts = 40; // 40 * 50ms = 2 seconds max wait

  const executeHighlight = () => {
    const el = findTargetElement();
    if (el) {
      clearActiveHighlights();
      sessionStorage.removeItem('pending_roadmap_highlight');

      // Scroll target into view
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 40);

      // Apply temporary attractive glowing highlight
      el.classList.add('roadmap-highlight-glow');

      // Fade out and restore original appearance after ~2.6 seconds
      activeHighlightTimeout = setTimeout(() => {
        el.classList.remove('roadmap-highlight-glow');
        activeHighlightTimeout = null;
      }, 2600);
      return true;
    }
    return false;
  };

  // Immediate check
  if (executeHighlight()) return;

  // Poll in case component is mounting/rendering asynchronously
  activePollInterval = setInterval(() => {
    attempts++;
    if (executeHighlight() || attempts >= maxAttempts) {
      if (activePollInterval) {
        clearInterval(activePollInterval);
        activePollInterval = null;
      }
    }
  }, 50);
}

export default function useRoadmapHighlight() {
  const location = useLocation();
  const lastTriggerRef = useRef(null);

  useEffect(() => {
    // Extract target identifier from state, hash, query, or pending storage
    const stateTarget = location.state?.highlightTarget;
    const triggerTime = location.state?.triggerTime;
    const hashTarget = location.hash ? location.hash.replace(/^#/, '') : null;
    const searchParams = new URLSearchParams(location.search);
    const queryTarget = searchParams.get('highlight');
    const storedTarget = sessionStorage.getItem('pending_roadmap_highlight');

    const target = stateTarget || hashTarget || queryTarget || storedTarget;
    if (!target) return;

    const triggerKey = `${location.pathname}_${target}_${triggerTime || location.hash || queryTarget || storedTarget}`;
    if (lastTriggerRef.current === triggerKey) return;
    lastTriggerRef.current = triggerKey;

    triggerRoadmapHighlight(target);
  }, [location.pathname, location.hash, location.search, location.state]);
}
