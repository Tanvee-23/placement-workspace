import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadUserData, saveUserData, recordStreakActivity, getStreak7Days } from '../utils/storage';

export default function ExecutePage({ session }) {
  const [userData, setUserData] = useState(null);
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedNote, setSelectedNote] = useState('system');

  // Load user data on mount
  useEffect(() => {
    if (!session) return;
    setUserData(loadUserData(session.email));
  }, [session]);

  if (!session) {
    return (
      <div className="wrap" style={{ padding: '80px 32px 120px', display: 'flex', justifyContent: 'center' }}>
        <div className="mock" style={{ width: '100%', maxWidth: '460px', padding: '40px 32px', textAlign: 'center' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '14px' }}>🔒</span>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Workspace Locked</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14.5px', marginBottom: '24px', lineHeight: '1.5' }}>
            Please sign in or continue as a guest to access your personalized placement mentor workspace.
          </p>
          <Link to="/auth" className="btn-primary" style={{ display: 'inline-flex', justifyContent: 'center', width: '100%' }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    const newTodo = {
      id: `todo_${Date.now()}`,
      text: newTodoText.trim(),
      checked: false
    };

    const updatedData = {
      ...userData,
      tasks: [...(userData.tasks || []), newTodo]
    };

    setUserData(updatedData);
    saveUserData(session.email, updatedData);
    setNewTodoText('');
  };

  const handleToggleTodo = (id) => {
    const updatedTasks = userData.tasks.map(t => 
      t.id === id ? { ...t, checked: !t.checked } : t
    );

    const updatedData = {
      ...userData,
      tasks: updatedTasks
    };

    setUserData(updatedData);
    saveUserData(session.email, updatedData);
  };

  const handleDeleteTodo = (id) => {
    const updatedTasks = userData.tasks.filter(t => t.id !== id);

    const updatedData = {
      ...userData,
      tasks: updatedTasks
    };

    setUserData(updatedData);
    saveUserData(session.email, updatedData);
  };

  const handleNoteChange = (text) => {
    const updatedData = {
      ...userData,
      notes: {
        ...(userData.notes || {}),
        [selectedNote]: text
      }
    };

    setUserData(updatedData);
    saveUserData(session.email, updatedData);
  };

  const handleCheckIn = () => {
    const todayStr = new Date().toDateString();
    const streaks = userData.streaks || { count: 0, lastCheckIn: null, badges: [] };
    if (streaks.lastCheckIn === todayStr) {
      alert('You have already checked in today!');
      return;
    }

    const updatedStreaks = recordStreakActivity(session.email);
    if (updatedStreaks) {
      setUserData(loadUserData(session.email));
    }
  };

  if (!userData) return null;

  const todos = userData.tasks || [];
  const notes = userData.notes || { system: '', graphs: '', learnings: '' };
  const streaks = userData.streaks || { count: 0, lastCheckIn: null, badges: [] };
  
  const todayStr = new Date().toDateString();
  const checkedInToday = streaks.lastCheckIn === todayStr;

  return (
    <div className="wrap" style={{ padding: '60px 32px 100px' }}>
      <div className="section-head">
        <span className="kicker">Stage 04 — Execute</span>
        <h2>Personal Workspace &amp; Consistency Hub</h2>
        <p>Maintain your daily habits, write notes, and track your interview achievements in one place.</p>
      </div>

      <div className="spotlight-row" style={{ alignItems: 'flex-start' }}>
        {/* Left: Notes & Streak */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Notes Workspace */}
          <div className="mock" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>Notion-Style Notes</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <button
                onClick={() => setSelectedNote('system')}
                style={{
                  border: '1.5px solid var(--line)',
                  background: selectedNote === 'system' ? 'var(--ink)' : '#fff',
                  color: selectedNote === 'system' ? '#fff' : 'var(--ink)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                System Design
              </button>
              <button
                onClick={() => setSelectedNote('graphs')}
                style={{
                  border: '1.5px solid var(--line)',
                  background: selectedNote === 'graphs' ? 'var(--ink)' : '#fff',
                  color: selectedNote === 'graphs' ? '#fff' : 'var(--ink)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                DSA Graphs
              </button>
              <button
                onClick={() => setSelectedNote('learnings')}
                style={{
                  border: '1.5px solid var(--line)',
                  background: selectedNote === 'learnings' ? 'var(--ink)' : '#fff',
                  color: selectedNote === 'learnings' ? '#fff' : 'var(--ink)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Mock Learnings
              </button>
            </div>
            
            <textarea
              value={notes[selectedNote] || ''}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Start drafting notes for this section (e.g. system structures, cycle detections, mock review feedback)..."
              style={{
                width: '100%',
                height: '180px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12.5px',
                color: 'var(--ink)',
                background: '#fcfbfe',
                resize: 'none',
                lineHeight: '1.5',
                outline: 'none'
              }}
            />
            <span style={{ fontSize: '11.5px', color: 'var(--muted)', display: 'block', marginTop: '6px' }}>
              📝 Notes are auto-saved dynamically under your profile.
            </span>
          </div>

          {/* Daily Streak & Achievement System */}
          <div className="mock" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Consistency Track</h3>
              <button
                onClick={handleCheckIn}
                disabled={checkedInToday}
                style={{
                  background: checkedInToday ? 'var(--mint-soft)' : 'var(--ink)',
                  color: checkedInToday ? 'var(--mint)' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: checkedInToday ? 'default' : 'pointer'
                }}
              >
                {checkedInToday ? '✓ Checked In' : '🔥 Check In'}
              </button>
            </div>

            <div className="flame-row">
              <span style={{ fontSize: '34px' }}>🔥</span>
              <span className="flame-num">{streaks.count}</span>
              <span className="flame-lbl">day streak</span>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginTop: '16px' }}>
              {getStreak7Days(streaks).map((cell, idx) => {
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

            <div style={{ marginTop: '22px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: '700', marginBottom: '10px' }}>Unlocked Badges</div>
              {streaks.badges && streaks.badges.length > 0 ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {streaks.badges.map((badge, idx) => (
                    <span 
                      key={idx} 
                      title={badge === '⚡' ? 'OA Expert Milestone' : 'DSA Master Milestone'} 
                      style={{ 
                        fontSize: '20px', 
                        background: badge === '⚡' ? 'var(--coral-soft)' : 'var(--violet-soft)', 
                        padding: '6px', 
                        borderRadius: '8px' 
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                  Complete check-in streaks to unlock milestone rewards (3-days ⚡, 7-days 🌳).
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Dynamic Todo Task Manager */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="mock" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>Task Manager</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14.5px', marginBottom: '20px', lineHeight: '1.45' }}>
              Quickly create, check off, or delete daily preparation to-dos.
            </p>

            <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Add a new task..."
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--line)',
                  fontSize: '13.5px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{
                  padding: '11px 20px',
                  borderRadius: '10px',
                  fontSize: '13.5px'
                }}
              >
                Add
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {todos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--muted)', fontSize: '13.5px' }}>
                  No tasks remaining. Add one above!
                </div>
              ) : (
                todos.map(todo => (
                  <div
                    key={todo.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--line)',
                      background: todo.checked ? 'var(--paper-2)' : '#fff',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div
                      onClick={() => handleToggleTodo(todo.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      <div
                        className={`task-check ${todo.checked ? 'done' : ''}`}
                        style={{
                          background: todo.checked ? 'var(--mint)' : 'transparent',
                          borderColor: todo.checked ? 'var(--mint)' : 'var(--line)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}
                      >
                        {todo.checked && '✓'}
                      </div>
                      <span
                        style={{
                          fontSize: '13.5px',
                          fontWeight: '500',
                          textDecoration: todo.checked ? 'line-through' : 'none',
                          color: todo.checked ? 'var(--muted)' : 'var(--ink)'
                        }}
                      >
                        {todo.text}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--coral)',
                        fontSize: '16px',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontWeight: '700'
                      }}
                      title="Delete task"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
