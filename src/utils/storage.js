/**
 * Utility helper to handle user-isolated storage.
 * All data is saved under a user-specific key in localStorage.
 * Every user starts with a completely empty state.
 */

export function getUserStorageKey(email) {
  return `placement_mentor_userdata_${email}`;
}

export function getEmptyUserData() {
  return {
    tasks: [],
    notes: {
      system: '',
      graphs: '',
      learnings: ''
    },
    companies: [], // Empty list of target companies
    roadmaps: {
      DSA: [],
      CS: [],
      APT: []
    },
    calendarEvents: [],
    streaks: {
      count: 0,
      lastCheckIn: null,
      badges: []
    },
    resumeData: {
      score: null,
      targetRole: '',
      fileName: '',
      parsedText: '',
      analysisReport: null
    }
  };
}

export function loadUserData(email) {
  if (!email) return getEmptyUserData();
  const raw = localStorage.getItem(getUserStorageKey(email));
  let data = getEmptyUserData();
  
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      // Merge with empty template to ensure all fields exist
      data = {
        ...getEmptyUserData(),
        ...parsed,
        notes: {
          ...getEmptyUserData().notes,
          ...(parsed.notes || {})
        },
        roadmaps: {
          ...getEmptyUserData().roadmaps,
          ...(parsed.roadmaps || {})
        },
        streaks: {
          ...getEmptyUserData().streaks,
          ...(parsed.streaks || {})
        },
        resumeData: {
          ...getEmptyUserData().resumeData,
          ...(parsed.resumeData || {})
        }
      };
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }

  // Auto-reset streak on page load if they missed consecutive days
  const streaks = data.streaks;
  if (streaks && streaks.lastCheckIn) {
    const todayStr = new Date().toDateString();
    const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
    if (streaks.lastCheckIn !== todayStr && streaks.lastCheckIn !== yesterdayStr) {
      streaks.count = 0;
      saveUserData(email, data);
    }
  }

  return data;
}

export function saveUserData(email, data) {
  if (!email) return;
  localStorage.setItem(getUserStorageKey(email), JSON.stringify(data));
}

/**
 * Log a qualifying activity for the streak.
 * If the user's last activity was yesterday, the streak is incremented.
 * If the user's last activity was today, the streak remains the same (already logged for today).
 * If the user's last activity was older, the streak is reset to 1.
 */
export function recordStreakActivity(email) {
  if (!email) return null;
  const data = loadUserData(email);
  const streaks = data.streaks || { count: 0, lastCheckIn: null, badges: [] };

  const todayStr = new Date().toDateString();
  const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

  if (streaks.lastCheckIn === todayStr) {
    // Already logged activity today, do not increase further today
    return streaks;
  } else if (streaks.lastCheckIn === yesterdayStr) {
    // Consecutive activity! Increment streak
    streaks.count += 1;
  } else {
    // Streak broken or first activity: start at 1
    streaks.count = 1;
  }

  // Award milestones dynamically
  if (streaks.count === 3 && !streaks.badges.includes('⚡')) {
    streaks.badges.push('⚡');
  }
  if (streaks.count === 7 && !streaks.badges.includes('🌳')) {
    streaks.badges.push('🌳');
  }

  streaks.lastCheckIn = todayStr;

  const updatedData = {
    ...data,
    streaks
  };

  saveUserData(email, updatedData);
  return streaks;
}

/**
 * Calculates checking status for the trailing 7 days ending with today.
 */
export function getStreak7Days(streaks) {
  const count = streaks?.count || 0;
  const lastCheckIn = streaks?.lastCheckIn;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const cells = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const dateStr = d.toDateString();
    
    let active = false;
    if (lastCheckIn && count > 0) {
      const checkInDate = new Date(lastCheckIn);
      checkInDate.setHours(0, 0, 0, 0);
      const diffTime = checkInDate.getTime() - d.getTime();
      const diffDays = Math.round(diffTime / 86400000);
      if (diffDays >= 0 && diffDays < count) {
        active = true;
      }
    }
    
    cells.push({
      dateStr,
      isToday: i === 0,
      active
    });
  }
  return cells;
}

