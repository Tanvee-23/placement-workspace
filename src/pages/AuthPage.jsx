import React, { useState } from 'react';

const AVATARS = ['🎓', '💻', '🚀', '🦊', '🦉'];

export default function AuthPage({ session, setSession }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile customization step state
  const [setupSession, setSetupSession] = useState(null); // temp session: { email, type }
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('🎓');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('placement_mentor_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      if (user.name && user.avatar) {
        // Already customized profile, log in immediately
        const activeSession = { 
          email: user.email, 
          type: 'registered', 
          name: user.name, 
          avatar: user.avatar 
        };
        localStorage.setItem('placement_mentor_session', JSON.stringify(activeSession));
        setSession(activeSession);
        setSuccess('Logged in successfully!');
      } else {
        // Need profile customization first
        setSetupSession({ email: user.email, type: 'registered' });
      }
    } else {
      setError('Invalid email or password.');
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('placement_mentor_users') || '[]');
    const exists = users.some(u => u.email === email);

    if (exists) {
      setError('An account with this email already exists.');
      return;
    }

    // Register user record
    const newUser = { email, password };
    users.push(newUser);
    localStorage.setItem('placement_mentor_users', JSON.stringify(users));

    // Force setup profile step
    setSetupSession({ email: newUser.email, type: 'registered' });
    setEmail('');
    setPassword('');
  };

  const handleGuest = () => {
    setError('');
    setSuccess('');
    
    // Generate unique guest key, then prompt for customization
    const guestId = `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    setSetupSession({ email: guestId, type: 'guest' });
  };

  const handleCompleteSetup = (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setError('Please enter your name.');
      return;
    }

    const activeSession = {
      email: setupSession.email,
      type: setupSession.type,
      name: profileName.trim(),
      avatar: profileAvatar
    };

    // If registered, persist name and avatar in simulated database
    if (setupSession.type === 'registered') {
      const users = JSON.parse(localStorage.getItem('placement_mentor_users') || '[]');
      const idx = users.findIndex(u => u.email === setupSession.email);
      if (idx !== -1) {
        users[idx].name = activeSession.name;
        users[idx].avatar = activeSession.avatar;
        localStorage.setItem('placement_mentor_users', JSON.stringify(users));
      }
    }

    localStorage.setItem('placement_mentor_session', JSON.stringify(activeSession));
    setSession(activeSession);
    setSetupSession(null);
    setProfileName('');
    setSuccess('Profile customized and logged in successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('placement_mentor_session');
    setSession(null);
    setSuccess('Logged out successfully.');
  };

  return (
    <div className="wrap" style={{ padding: '80px 32px 120px', display: 'flex', justifyContent: 'center' }}>
      <div className="mock" style={{ width: '100%', maxWidth: '440px', padding: '40px 32px' }}>
        
        {setupSession ? (
          /* Profile Customization Step */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>🎨</span>
              <h3 style={{ fontSize: '22px', fontWeight: '700' }}>Setup Your Profile</h3>
              <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginTop: '6px' }}>
                Choose your name and select an avatar for your workspace.
              </p>
            </div>

            {error && (
              <div style={{ background: 'var(--coral-soft)', color: 'var(--coral)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleCompleteSetup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="mono" style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                  YOUR NAME *
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--line)',
                    outline: 'none',
                    fontSize: '13.5px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label className="mono" style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '10px', fontWeight: '700' }}>
                  SELECT AVATAR *
                </label>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setProfileAvatar(avatar)}
                      style={{
                        flex: 1,
                        fontSize: '28px',
                        padding: '10px 0',
                        borderRadius: '10px',
                        border: '2px solid',
                        borderColor: profileAvatar === avatar ? 'var(--violet)' : 'var(--line)',
                        background: profileAvatar === avatar ? 'var(--violet-soft)' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '13px' }}
              >
                Complete Setup &amp; Enter Workspace
              </button>
            </form>
          </div>
        ) : session ? (
          /* Logged In View */
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '14px' }}>{session.avatar || '🔒'}</span>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>{session.name}</h2>
            <div className="mono" style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '14px' }}>
              {session.email}
            </div>
            
            <span 
              className="mono" 
              style={{ 
                fontSize: '11px', 
                background: session.type === 'guest' ? 'var(--yellow-soft)' : 'var(--mint-soft)', 
                color: session.type === 'guest' ? '#855b00' : 'var(--mint)', 
                padding: '4px 10px', 
                borderRadius: '99px',
                fontWeight: '700',
                display: 'inline-block',
                marginBottom: '28px'
              }}
            >
              {session.type.toUpperCase()} SESSION
            </span>

            {success && <div style={{ fontSize: '13px', color: 'var(--mint)', marginBottom: '20px', fontWeight: '600' }}>{success}</div>}

            <button 
              onClick={handleLogout}
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', background: 'var(--coral)', color: '#fff' }}
            >
              Log Out
            </button>
          </div>
        ) : (
          /* Authentication Forms */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div className="logo" style={{ justifyContent: 'center', marginBottom: '12px' }}>
                <span className="logo-mark">AP</span>
                AI Placement Mentor
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>
                {isSignUp ? 'Create your workspace' : 'Welcome back'}
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginTop: '6px' }}>
                {isSignUp ? 'Sign up to keep track of your roadmap nodes' : 'Sign in to access your placement dashboard'}
              </p>
            </div>

            {error && (
              <div style={{ background: 'var(--coral-soft)', color: 'var(--coral)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div style={{ background: 'var(--mint-soft)', color: 'var(--mint)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>
                ✓ {success}
              </div>
            )}

            <form onSubmit={isSignUp ? handleSignUp : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="mono" style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '6px', fontWeight: '700' }}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--line)',
                    outline: 'none',
                    fontSize: '13.5px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label className="mono" style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginBottom: '6px', fontWeight: '700' }}>PASSWORD</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--line)',
                    outline: 'none',
                    fontSize: '13.5px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '13px' }}
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', margin: '18px 0 14px', fontSize: '13.5px', color: 'var(--muted)' }}>
              Or
            </div>

            <button
              onClick={handleGuest}
              className="btn-ghost"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', background: '#fff' }}
            >
              Continue as Guest
            </button>

            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
              {isSignUp ? (
                <span>
                  Already have an account?{' '}
                  <button 
                    onClick={() => { setIsSignUp(false); setError(''); }} 
                    style={{ background: 'none', border: 'none', color: 'var(--violet-deep)', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an account yet?{' '}
                  <button 
                    onClick={() => { setIsSignUp(true); setError(''); }} 
                    style={{ background: 'none', border: 'none', color: 'var(--violet-deep)', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                  >
                    Sign Up
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
