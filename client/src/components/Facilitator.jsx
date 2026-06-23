import React from 'react';
import { motion } from 'framer-motion';

export default function Facilitator({ data, onControl }) {
  if (!data) return <div className="fac"><div className="empty">Connecting to the room…</div></div>;
  const { phase, leaderboard = [] } = data;
  const revealed = phase === 'revealed';

  return (
    <div className="fac">
      <h2 style={{ fontSize: 26, margin: '6px 0' }}>Facilitator big screen</h2>
      <div className="fac-controls">
        <button className="btn good" disabled={phase !== 'lobby'} onClick={() => onControl('start')}>▶ Start challenge</button>
        <button className="btn" disabled={phase !== 'playing'} onClick={() => onControl('reveal')}>🎉 Reveal answers</button>
        <button className="btn ghost" onClick={() => onControl('reset')}>↺ Reset round</button>
        <span className="spacer" />
        <span className={`pill ${phase === 'playing' ? 'live' : ''}`}>
          {phase === 'lobby' ? 'Waiting in lobby' : phase === 'playing' ? 'Challenge live' : 'Answers revealed'}
        </span>
      </div>

      <div className="lb">
        {leaderboard.length === 0 && <div className="empty">No teams have joined yet — share the link and pick a team.</div>}
        {leaderboard.map((t, i) => {
          const pct = Math.round((t.progress / t.totalCards) * 100);
          return (
            <motion.div layout key={t.id} className="lb-row"
              transition={{ type: 'spring', stiffness: 400, damping: 34 }}>
              <div className="lb-rank">{revealed ? `#${i + 1}` : '•'}</div>
              <div>
                <div className="lb-name"><span className="av" style={{ background: t.color, color: t.color }} />{t.name}</div>
                <div className="lb-members">{t.members.length ? t.members.join(' · ') : 'no players yet'}</div>
                <div className="lb-bar"><span style={{ width: `${pct}%`, background: t.color }} /></div>
              </div>
              <div className="lb-score">
                {revealed
                  ? (<><div className="num" style={{ color: t.color }}>{t.score}</div><div className="lbl">{t.correct}/{t.totalCards} correct</div></>)
                  : (<><div className="num">{pct}%</div><div className="lbl">{t.progress}/{t.totalCards} placed</div></>)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
