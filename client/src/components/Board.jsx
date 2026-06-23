import React, { useMemo, useState } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDroppable,
} from '@dnd-kit/core';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import Card from './Card.jsx';
import Zone from './Zone.jsx';

function Tray({ children, count }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'tray' });
  return (
    <div ref={setNodeRef} className="panel tray" style={isOver ? { boxShadow: '0 0 0 2px var(--after)' } : undefined}>
      <h3>Card deck <span className="tray-count">{count} left</span></h3>
      {children}
      {count === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>All cards placed 🎉</p>}
    </div>
  );
}

function Scenario({ scenario, value, locked, onChange }) {
  const [local, setLocal] = useState(value || '');
  const [focused, setFocused] = useState(false);
  // Sync remote edits when this field is not being typed in.
  React.useEffect(() => { if (!focused) setLocal(value || ''); }, [value, focused]);
  return (
    <div className="scenario" style={{ '--zc': scenario.color }}>
      <span className="tag" style={{ background: scenario.color }}>{scenario.tag} — During inspection</span>
      <p className="q">{scenario.prompt}</p>
      <textarea
        value={local}
        disabled={locked}
        placeholder="Draft your team's answer to the inspector…"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => { setLocal(e.target.value); onChange(e.target.value); }}
      />
    </div>
  );
}

export default function Board({ config, team, phase, answerKey, onMove, onScenario }) {
  const { cards, zones, scenarios } = config;
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const placements = team?.placements || {};
  const movers = team?.lastActorByCard || {};
  const locked = phase === 'revealed';

  const byZone = useMemo(() => {
    const map = { tray: [] };
    zones.forEach((z) => (map[z.id] = []));
    cards.forEach((c) => {
      const z = placements[c.id];
      if (z && map[z]) map[z].push(c);
      else map.tray.push(c);
    });
    return map;
  }, [cards, zones, placements]);

  const activeCard = cards.find((c) => c.id === activeId);

  function onDragEnd({ over }) {
    setActiveId(null);
    if (!over) return;
    const dest = over.id === 'tray' ? null : over.id;
    onMove(activeId, dest);
  }

  function verdictFor(card) {
    if (!locked || !answerKey) return null;
    const placed = placements[card.id];
    if (!placed) return null;
    return answerKey[card.id] === placed ? 'correct' : 'incorrect';
  }

  return (
    <DndContext sensors={sensors} onDragStart={(e) => setActiveId(e.active.id)} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
      <LayoutGroup>
        <div className="layout">
          <Tray count={byZone.tray.length}>
            <AnimatePresence>
              {byZone.tray.map((c) => (
                <Card key={c.id} card={c} disabled={locked} mover={movers[c.id]} />
              ))}
            </AnimatePresence>
          </Tray>

          <div>
            <div className="zones">
              {zones.map((z) => (
                <Zone key={z.id} zone={z} count={byZone[z.id].length}>
                  <AnimatePresence>
                    {byZone[z.id].map((c) => (
                      <Card key={c.id} card={c} disabled={locked} mover={movers[c.id]} verdict={verdictFor(c)} />
                    ))}
                  </AnimatePresence>
                </Zone>
              ))}
            </div>

            <div className="scenarios">
              {scenarios.map((s) => (
                <Scenario key={s.id} scenario={s} locked={locked}
                  value={team?.scenarios?.[s.id] || ''}
                  onChange={(text) => onScenario(s.id, text)} />
              ))}
            </div>
          </div>
        </div>
      </LayoutGroup>

      <DragOverlay dropAnimation={null}>
        {activeCard ? <div className="card overlay">{activeCard.text}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}
