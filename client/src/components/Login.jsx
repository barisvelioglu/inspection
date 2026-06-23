import React, { useState } from 'react';

export default function Login({ teams, onJoinTeam, onJoinFacilitator, authError }) {
  const [role, setRole] = useState('player');
  const [username, setUsername] = useState('');
  const [teamId, setTeamId] = useState(teams[0]?.id);
  const [password, setPassword] = useState('');

  const canJoin = role === 'facilitator'
    ? password.trim().length > 0
    : (username.trim() && teamId);

  function submit() {
    if (!canJoin) return;
    if (role === 'facilitator') return onJoinFacilitator(password.trim());
    onJoinTeam(username.trim(), teamId);
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand"><span className="dot" /> Inspection Readiness</div>
        <h1>Before &amp; After<br />the Inspection</h1>
        <p className="sub">A live team challenge — sort each action card into the right phase, spot the traps, and answer the inspector. Work together, beat the clock, top the leaderboard.</p>

        <div className="role-toggle">
          <button className={role === 'player' ? 'active' : ''} onClick={() => setRole('player')}>👥 Join a team</button>
          <button className={role === 'facilitator' ? 'active' : ''} onClick={() => setRole('facilitator')}>🖥️ Facilitator screen</button>
        </div>

        {role === 'player' && (
          <>
            <div className="field">
              <label>Your name</label>
              <input className="input" value={username} placeholder="e.g. Baris"
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()} autoFocus />
            </div>
            <div className="field">
              <label>Pick your team</label>
              <div className="team-grid">
                {teams.map((t) => (
                  <div key={t.id}
                    className={`team-chip${teamId === t.id ? ' active' : ''}`}
                    style={{ color: t.color }}
                    onClick={() => setTeamId(t.id)}>
                    <div className="av" style={{ background: t.color }} />
                    <span style={{ color: 'var(--text)' }}>{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {role === 'facilitator' && (
          <div className="field">
            <label>Facilitator password</label>
            <input className="input" type="password" value={password} placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()} autoFocus />
          </div>
        )}

        {authError && (
          <div style={{ color: '#fda4af', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>⚠ {authError}</div>
        )}

        <button className="btn" style={{ width: '100%', marginTop: 6 }} disabled={!canJoin} onClick={submit}>
          {role === 'facilitator' ? 'Open facilitator screen →' : 'Enter the room →'}
        </button>
      </div>
    </div>
  );
}
