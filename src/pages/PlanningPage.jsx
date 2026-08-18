import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadUserData, saveUserData, recordStreakActivity } from '../utils/storage';

const ROADMAP_TEMPLATES = {
  DSA: [
    { id: 'dsa_1', topic: 'Arrays & Hashing', level: 'Easy' },
    { id: 'dsa_2', topic: 'Two Pointers & Sliders', level: 'Medium' },
    { id: 'dsa_3', topic: 'Trees & Heap Structure', level: 'Medium' },
    { id: 'dsa_4', topic: 'Graph Theory & BFS/DFS', level: 'Hard' },
    { id: 'dsa_5', topic: 'Dynamic Programming (DP)', level: 'Hard' }
  ],
  CS: [
    { id: 'cs_1', topic: 'Database Normalization & SQL', level: 'Medium' },
    { id: 'cs_2', topic: 'OS Process Concurrency & Semaphores', level: 'Hard' },
    { id: 'cs_3', topic: 'Networking TCP/IP & HTTP multiplexing', level: 'Medium' },
    { id: 'cs_4', topic: 'Object Oriented System Design (LLD)', level: 'Medium' }
  ],
  APT: [
    { id: 'apt_1', topic: 'Quantitative Ratios & Percentages', level: 'Easy' },
    { id: 'apt_2', topic: 'Permutations, Combinations & Probability', level: 'Medium' },
    { id: 'apt_3', topic: 'Logical Syllogisms & Seating Arranger', level: 'Medium' }
  ]
};

export default function PlanningPage({ session }) {
  const [userData, setUserData] = useState(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState('DSA');
  const [newTaskText, setNewTaskText] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

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

  const handleToggleRoadmapNode = (nodeId) => {
    const currentCompleted = userData.roadmaps[selectedRoadmap] || [];
    let updatedCompleted;
    const isCompleting = !currentCompleted.includes(nodeId);
    
    if (currentCompleted.includes(nodeId)) {
      updatedCompleted = currentCompleted.filter(id => id !== nodeId);
    } else {
      updatedCompleted = [...currentCompleted, nodeId];
    }

    if (isCompleting) {
      recordStreakActivity(session.email);
    }

    const finalData = loadUserData(session.email);

    const updatedData = {
      ...finalData,
      roadmaps: {
        ...finalData.roadmaps,
        [selectedRoadmap]: updatedCompleted
      }
    };

    setUserData(updatedData);
    saveUserData(session.email, updatedData);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask = {
      id: `task_${Date.now()}`,
      text: newTaskText.trim(),
      checked: false
    };

    const updatedData = {
      ...userData,
      tasks: [...(userData.tasks || []), newTask]
    };

    setUserData(updatedData);
    saveUserData(session.email, updatedData);
    setNewTaskText('');
  };

  const handleToggleTask = (taskId) => {
    const updatedTasks = userData.tasks.map(t => 
      t.id === taskId ? { ...t, checked: !t.checked } : t
    );

    const updatedData = {
      ...userData,
      tasks: updatedTasks
    };

    setUserData(updatedData);
    saveUserData(session.email, updatedData);
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = userData.tasks.filter(t => t.id !== taskId);

    const updatedData = {
      ...userData,
      tasks: updatedTasks
    };

    setUserData(updatedData);
    saveUserData(session.email, updatedData);
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate) return;

    const newEvent = {
      id: `evt_${Date.now()}`,
      title: newEventTitle.trim(),
      date: newEventDate
    };

    const updatedData = {
      ...userData,
      calendarEvents: [...(userData.calendarEvents || []), newEvent]
    };

    setUserData(updatedData);
    saveUserData(session.email, updatedData);
    setNewEventTitle('');
    setNewEventDate('');
  };

  const handleDeleteEvent = (eventId) => {
    const updatedEvents = userData.calendarEvents.filter(evt => evt.id !== eventId);

    const updatedData = {
      ...userData,
      calendarEvents: updatedEvents
    };

    setUserData(updatedData);
    saveUserData(session.email, updatedData);
  };

  if (!userData) return null;

  const tasksList = userData.tasks || [];
  const eventsList = userData.calendarEvents || [];
  const completedNodes = userData.roadmaps[selectedRoadmap] || [];

  return (
    <div className="wrap" style={{ padding: '60px 32px 100px' }}>
      <div className="section-head">
        <span className="kicker">Stage 03 — Plan</span>
        <h2>Daily Planner &amp; Roadmaps</h2>
        <p>Break placement prep down into structured roadmaps, schedule interview events, and organize your daily tasks.</p>
      </div>

      <div className="spotlight-row" style={{ alignItems: 'flex-start' }}>
        {/* Left: Roadmaps and Calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Roadmaps selector */}
          <div className="mock" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Preparation Roadmaps</h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                {Object.keys(ROADMAP_TEMPLATES).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedRoadmap(key)}
                    style={{
                      border: '1.5px solid var(--line)',
                      background: selectedRoadmap === key ? 'var(--ink)' : 'transparent',
                      color: selectedRoadmap === key ? '#fff' : 'var(--ink)',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ROADMAP_TEMPLATES[selectedRoadmap].map((node) => {
                const isCompleted = completedNodes.includes(node.id);
                return (
                  <div
                    key={node.id}
                    onClick={() => handleToggleRoadmapNode(node.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: isCompleted ? 'var(--mint-soft)' : 'var(--paper)',
                      borderRadius: '10px',
                      border: '1px solid var(--line)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: isCompleted ? 'var(--mint)' : 'transparent',
                          border: '2px solid',
                          borderColor: isCompleted ? 'var(--mint)' : 'var(--muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '9px',
                          fontWeight: '700'
                        }}
                      >
                        {isCompleted ? '✓' : ''}
                      </span>
                      <span style={{ fontSize: '13.5px', fontWeight: '600' }}>{node.topic}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span
                        className="mono"
                        style={{
                          fontSize: '9px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background:
                            node.level === 'Hard'
                              ? 'var(--coral-soft)'
                              : node.level === 'Medium'
                              ? 'var(--violet-soft)'
                              : 'var(--mint-soft)',
                          color:
                            node.level === 'Hard'
                              ? 'var(--coral)'
                              : node.level === 'Medium'
                              ? 'var(--violet-deep)'
                              : 'var(--mint)'
                        }}
                      >
                        {node.level}
                      </span>
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {isCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar visual */}
          <div className="mock" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>Calendar &amp; Events</h3>
            
            {/* Add Event Form */}
            <form onSubmit={handleAddEvent} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Interview / OA event title..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--line)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
              />
              <input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '8px', border: '1.5px solid var(--line)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', background: '#fff' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '8px' }}>
                Add
              </button>
            </form>

            {eventsList.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '13.5px', textAlign: 'center', padding: '10px 0' }}>
                No scheduled calendar events.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {eventsList.map((evt) => (
                  <div 
                    key={evt.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '10px 14px', 
                      background: 'var(--paper)', 
                      borderRadius: '8px', 
                      borderLeft: '4px solid var(--violet)', 
                      fontSize: '12.5px' 
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block' }}>{evt.title}</strong>
                      <span className="mono" style={{ fontSize: '11px', color: 'var(--violet-deep)', fontWeight: '700' }}>{evt.date}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteEvent(evt.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Daily Planner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="mock" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '14px' }}>Daily Study Planner</h3>
            
            {/* Add Task Form */}
            <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add dynamic study task..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--line)',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '10px 18px', borderRadius: '8px', fontSize: '13px' }}
              >
                Add
              </button>
            </form>

            {tasksList.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '13.5px', textAlign: 'center', padding: '20px 0' }}>
                No planner tasks added. Add a checklist item above!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {tasksList.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--line)',
                      background: task.checked ? 'var(--paper-2)' : '#fff',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div
                      onClick={() => handleToggleTask(task.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      <div
                        className={`task-check ${task.checked ? 'done' : ''}`}
                        style={{
                          background: task.checked ? 'var(--mint)' : 'transparent',
                          borderColor: task.checked ? 'var(--mint)' : 'var(--line)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}
                      >
                        {task.checked && '✓'}
                      </div>
                      <span style={{ fontSize: '13.5px', fontWeight: '500', textDecoration: task.checked ? 'line-through' : 'none', color: task.checked ? 'var(--muted)' : 'var(--ink)' }}>
                        {task.text}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', fontSize: '15px', fontWeight: '700', padding: '0 4px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tasksList.length > 0 && (
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                  Progress: {tasksList.filter(t => t.checked).length} of {tasksList.length} done
                </span>
                
                <div style={{ width: '80px', height: '6px', background: 'var(--paper-2)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: 'var(--mint)',
                      width: `${(tasksList.filter(t => t.checked).length / tasksList.length) * 100}%`,
                      transition: 'width 0.3s'
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
