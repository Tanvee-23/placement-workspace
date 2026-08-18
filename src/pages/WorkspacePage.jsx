import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadUserData, saveUserData } from '../utils/storage';

export default function WorkspacePage({ session }) {
  const [userData, setUserData] = useState(null);
  const [selectedKey, setSelectedKey] = useState('');

  // Add Company Form State
  const [newCoName, setNewCoName] = useState('');
  const [newCoStage, setNewCoStage] = useState('');
  const [newCoColor, setNewCoColor] = useState('var(--violet)');

  // Selected Company Sub-elements Modification State
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundDetails, setNewRoundDetails] = useState('');
  const [newMockQ, setNewMockQ] = useState('');

  // Load user data on mount
  useEffect(() => {
    if (!session) return;
    const data = loadUserData(session.email);
    setUserData(data);
    if (data.companies && data.companies.length > 0) {
      setSelectedKey(data.companies[0].id);
    }
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

  const handleAddCompany = (e) => {
    e.preventDefault();
    if (!newCoName.trim()) return;

    const id = `co_${Date.now()}`;
    const newCompany = {
      id,
      name: newCoName.trim(),
      stage: newCoStage.trim() || 'Not started',
      color: newCoColor,
      rounds: [
        { name: 'Online Assessment (OA)', status: 'Pending', details: 'Initial coding test and MCQs.' }
      ],
      mocks: [
        'Describe standard algorithms used in candidate projects.'
      ]
    };

    const updatedCompanies = [...(userData.companies || []), newCompany];
    const updatedData = {
      ...userData,
      companies: updatedCompanies
    };

    setUserData(updatedData);
    saveUserData(session.email, updatedData);
    setSelectedKey(id);

    // Reset fields
    setNewCoName('');
    setNewCoStage('');
    setNewCoColor('var(--violet)');
  };

  const handleDeleteCompany = (id) => {
    const updatedCompanies = userData.companies.filter(co => co.id !== id);
    const updatedData = {
      ...userData,
      companies: updatedCompanies
    };

    setUserData(updatedData);
    saveUserData(session.email, updatedData);

    if (selectedKey === id) {
      setSelectedKey(updatedCompanies.length > 0 ? updatedCompanies[0].id : '');
    }
  };

  const handleAddRound = (e) => {
    e.preventDefault();
    if (!newRoundName.trim()) return;

    const updatedCompanies = userData.companies.map(co => {
      if (co.id === selectedKey) {
        return {
          ...co,
          rounds: [
            ...co.rounds,
            { name: newRoundName.trim(), status: 'Pending', details: newRoundDetails.trim() || 'Details to be added.' }
          ]
        };
      }
      return co;
    });

    const updatedData = {
      ...userData,
      companies: updatedCompanies
    };

    setUserData(updatedData);
    saveUserData(session.email, updatedData);

    setNewRoundName('');
    setNewRoundDetails('');
  };

  const handleToggleRoundStatus = (idx) => {
    const updatedCompanies = userData.companies.map(co => {
      if (co.id === selectedKey) {
        const nextRounds = [...co.rounds];
        const curStatus = nextRounds[idx].status;
        nextRounds[idx].status = curStatus === 'Pending' ? 'Cleared' : curStatus === 'Cleared' ? 'Upcoming' : 'Pending';
        return {
          ...co,
          rounds: nextRounds
        };
      }
      return co;
    });

    const updatedData = {
      ...userData,
      companies: updatedCompanies
    };

    setUserData(updatedData);
    saveUserData(session.email, updatedData);
  };

  const handleAddMockQ = (e) => {
    e.preventDefault();
    if (!newMockQ.trim()) return;

    const updatedCompanies = userData.companies.map(co => {
      if (co.id === selectedKey) {
        return {
          ...co,
          mocks: [...co.mocks, newMockQ.trim()]
        };
      }
      return co;
    });

    const updatedData = {
      ...userData,
      companies: updatedCompanies
    };

    setUserData(updatedData);
    saveUserData(session.email, updatedData);

    setNewMockQ('');
  };

  if (!userData) return null;

  const companiesList = userData.companies || [];
  const activeCo = companiesList.find(co => co.id === selectedKey);

  return (
    <div className="wrap" style={{ padding: '60px 32px 100px' }}>
      <div className="section-head">
        <span className="kicker">Stage 02 — Research</span>
        <h2>Company Research Hub</h2>
        <p>Manage your company target list, explore specific round processes, and practice custom mock sets.</p>
      </div>

      <div className="spotlight-row" style={{ alignItems: 'flex-start', gridTemplateColumns: '0.85fr 1.15fr' }}>
        {/* Left Panel: Company preparation list & Add Company Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Target List */}
          <div className="mock" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Target Dashboard</h3>
            {companiesList.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '13.5px', padding: '10px 0', textAlign: 'center' }}>
                No target companies added yet. Start by creating one below!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {companiesList.map((co) => (
                  <div
                    key={co.id}
                    onClick={() => setSelectedKey(co.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      border: '1.5px solid',
                      borderColor: selectedKey === co.id ? co.color : 'var(--line)',
                      background: selectedKey === co.id ? 'var(--paper)' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: selectedKey === co.id ? '0 4px 12px rgba(23,23,31,0.04)' : 'none'
                    }}
                  >
                    <div className="co-name" style={{ gap: '12px', width: '70%', overflow: 'hidden' }}>
                      <span
                        className="co-tag"
                        style={{
                          background: co.color,
                          color: '#fff',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          flexShrink: 0
                        }}
                      >
                        {co.name.substring(0, 2).toUpperCase()}
                      </span>
                      <strong style={{ fontSize: '14.5px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{co.name}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="co-stage" style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '500' }}>
                        {co.stage}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteCompany(co.id); }}
                        style={{ background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', fontSize: '15px', fontWeight: '700' }}
                        title="Delete Company"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Company Form */}
          <div className="mock" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>Add Target Company</h3>
            <form onSubmit={handleAddCompany} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="mono" style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', marginBottom: '4px', fontWeight: '700' }}>COMPANY NAME *</label>
                <input
                  type="text"
                  value={newCoName}
                  onChange={(e) => setNewCoName(e.target.value)}
                  placeholder="e.g. Google, TechCorp"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--line)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label className="mono" style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', marginBottom: '4px', fontWeight: '700' }}>CURRENT ROUND STAGE</label>
                <input
                  type="text"
                  value={newCoStage}
                  onChange={(e) => setNewCoStage(e.target.value)}
                  placeholder="e.g. Round 2 / 5, OA scheduled"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--line)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label className="mono" style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', marginBottom: '4px', fontWeight: '700' }}>COLOR ASSIGNMENT</label>
                <select
                  value={newCoColor}
                  onChange={(e) => setNewCoColor(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--line)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', background: '#fff' }}
                >
                  <option value="var(--violet)">Violet</option>
                  <option value="var(--coral)">Coral</option>
                  <option value="var(--mint)">Mint</option>
                  <option value="var(--yellow)">Yellow</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '10px', borderRadius: '8px', fontSize: '13px', justifyContent: 'center' }}>
                Add Company
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: Selected Company details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {activeCo ? (
            <>
              {/* Company Round Breakdown */}
              <div className="mock" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                  <span
                    className="co-tag"
                    style={{
                      background: activeCo.color,
                      color: activeCo.color === 'var(--yellow)' ? '#5a4200' : '#fff',
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      fontSize: '16px'
                    }}
                  >
                    {activeCo.name.substring(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '22px', fontWeight: '700' }}>{activeCo.name} Process</h3>
                    <span className="mono" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      Status: {activeCo.stage}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
                  {activeCo.rounds.map((round, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                          onClick={() => handleToggleRoundStatus(idx)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background:
                              round.status === 'Cleared'
                                ? 'var(--mint-soft)'
                                : round.status === 'Pending'
                                ? 'var(--violet-soft)'
                                : 'var(--paper-2)',
                            border: '2px solid',
                            borderColor:
                              round.status === 'Cleared'
                                ? 'var(--mint)'
                                : round.status === 'Pending'
                                ? 'var(--violet)'
                                : 'var(--line)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: '700',
                            color:
                              round.status === 'Cleared'
                                ? 'var(--mint)'
                                : round.status === 'Pending'
                                ? 'var(--violet-deep)'
                                : 'var(--muted)',
                            zIndex: 2,
                            cursor: 'pointer'
                          }}
                          title="Click to toggle status (Pending -> Cleared -> Upcoming)"
                        >
                          {round.status === 'Cleared' ? '✓' : idx + 1}
                        </div>
                        {idx < activeCo.rounds.length - 1 && (
                          <div
                            style={{
                              width: '2px',
                              flex: 1,
                              background: 'var(--line)',
                              marginTop: '4px',
                              marginBottom: '4px',
                              zIndex: 1
                            }}
                          ></div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{round.name}</h4>
                          <span
                            className="mono"
                            style={{
                              fontSize: '9.5px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background:
                                round.status === 'Cleared'
                                  ? 'var(--mint-soft)'
                                  : round.status === 'Pending'
                                  ? 'var(--violet-soft)'
                                  : 'var(--paper-2)',
                              color:
                                round.status === 'Cleared'
                                  ? 'var(--mint)'
                                  : round.status === 'Pending'
                                  ? 'var(--violet-deep)'
                                  : 'var(--muted)'
                            }}
                          >
                            {round.status.toUpperCase()}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px', lineHeight: '1.45' }}>
                          {round.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Round Form */}
                <form onSubmit={handleAddRound} style={{ borderTop: '1px solid var(--line)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ fontSize: '14.5px', fontWeight: '700' }}>Add Interview Round</h4>
                  <input
                    type="text"
                    value={newRoundName}
                    onChange={(e) => setNewRoundName(e.target.value)}
                    placeholder="e.g. Technical Round 2, HR Round"
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--line)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                  />
                  <input
                    type="text"
                    value={newRoundDetails}
                    onChange={(e) => setNewRoundDetails(e.target.value)}
                    placeholder="Topic details / duration..."
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--line)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '8px', fontSize: '12.5px', justifyContent: 'center' }}>
                    Add Round
                  </button>
                </form>
              </div>

              {/* Company Mock Interview Questions */}
              <div className="mock" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '14px' }}>
                  Practice Mock Questions ({activeCo.name})
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {activeCo.mocks.map((q, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '14px',
                        background: 'var(--paper)',
                        borderRadius: '12px',
                        border: '1px solid var(--line)'
                      }}
                    >
                      <span className="mono" style={{ fontSize: '12.5px', color: 'var(--violet-deep)', fontWeight: '700' }}>
                        Q{idx + 1}
                      </span>
                      <div style={{ fontSize: '13.5px', fontWeight: '500', lineHeight: '1.45' }}>
                        {q}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Mock Question Form */}
                <form onSubmit={handleAddMockQ} style={{ borderTop: '1px solid var(--line)', paddingTop: '18px', display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={newMockQ}
                    onChange={(e) => setNewMockQ(e.target.value)}
                    placeholder="Add practice question..."
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--line)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '8px 14px', fontSize: '12.5px' }}>
                    Add
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="mock" style={{ padding: '40px 32px', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' }}>
              Select a company from the dashboard list or create a new target company to research.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
