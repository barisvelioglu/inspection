import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { socket } from './socket.js';
import Login from './components/Login.jsx';
import Board from './components/Board.jsx';
import Facilitator from './components/Facilitator.jsx';

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h} 70% 62%)`;
}

function fireConfetti() {
  const end = Date.now() + 1200;
  const colors = ['#22c55e', '#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899'];
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0 }, colors });
    confetti({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export default function App() {
  const [config, setConfig] = useState(null);
  const [screen, setScreen] = useState('login');
  const [team, setTeam] = useState(null);
  const [phase, setPhase] = useState('lobby');
  const [answerKey, setAnswerKey] = useState(null);
  const [facData, setFacData] = useState(null);
  const prevPhase = useRef('lobby');

  useEffect(() => {
    socket.on('config', setConfig);
    socket.on('team', setTeam);
    socket.on('phase', ({ phase }) => setPhase(phase));
    socket.on('answerKey', setAnswerKey);
    socket.on('facilitator', setFacData);
    return () => socket.off();
  }, []);

  // Celebrate when answers are revealed.
  useEffect(() => {
    if (prevPhase.current !== 'revealed' && phase === 'revealed') fireConfetti();
    if (phase !== 'revealed') setAnswerKey((k) => (phase === 'lobby' ? null : k));
    prevPhase.current = phase;
  }, [phase]);

  function joinTeam(username, teamId) {
    socket.emit('joinTeam', { username, teamId });
    setScreen('play');
  }
  function joinFacilitator() {
    socket.emit('joinFacilitator');
    setScreen('facilitator');
  }

  const move = (cardId, zone) => socket.emit('move', { cardId, zone });
  const scenario = (which, text) => socket.emit('scenario', { which, text });
  const control = (action) => socket.emit('control', { action });

  // Own score banner on reveal.
  let banner = null;
  if (screen === 'play' && phase === 'revealed' && answerKey && team && config) {
    let correct = 0, score = 0;
    for (const [cid, z] of Object.entries(team.placements || {})) {
      if (answerKey[cid] === z) { correct++; score += 10; } else { score -= 3; }
    }
    banner = { correct, total: config.cards.length, score };
  }

  return (
    <div className="app">
      <div className="aurora" /><div className="grain" />

      {screen !== 'login' && (
        <div className="topbar">
          <div className="brand"><span className="dot" /> Inspection Readiness</div>
          {screen === 'play' && team && (
            <>
              <span className="pill" style={{ color: team.color, borderColor: team.color }}>Team {team.name}</span>
              <div className="members">
                {team.members.map((m, i) => (
                  <div key={i} className="avatar" title={m} style={{ background: avatarColor(m) }}>
                    {m.slice(0, 2).toUpperCase()}
                  </div>
                ))}
              </div>
            </>
          )}
          <span className="spacer" />
          <span className={`pill ${phase === 'playing' ? 'live' : ''}`}>
            {phase === 'lobby' ? 'Waiting to start' : phase === 'playing' ? 'Live' : 'Revealed'}
          </span>
        </div>
      )}

      {screen === 'login' && config && (
        <Login teams={config.teams} onJoinTeam={joinTeam} onJoinFacilitator={joinFacilitator} />
      )}
      {screen === 'login' && !config && <div className="login-wrap"><div className="empty">Connecting…</div></div>}

      {screen === 'play' && config && (
        <div className="board">
          {banner && (
            <div className="result-banner">
              {team?.name} scored <span className="big">{banner.score} pts</span>
              {banner.correct} of {banner.total} cards placed correctly
            </div>
          )}
          {phase === 'lobby' && (
            <div className="result-banner" style={{ background: 'var(--glass)', borderColor: 'var(--stroke)', fontSize: 16 }}>
              ⏳ Waiting for the facilitator to start — feel free to read the cards. You can already sort them!
            </div>
          )}
          <div className="board-head"><h2>{team?.name} — sort the cards</h2></div>
          <Board config={config} team={team} phase={phase} answerKey={answerKey} onMove={move} onScenario={scenario} />
        </div>
      )}

      {screen === 'facilitator' && <Facilitator data={facData} onControl={control} />}
    </div>
  );
}
