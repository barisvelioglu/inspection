import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function Zone({ zone, count, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: zone.id });
  return (
    <div
      ref={setNodeRef}
      className={`zone${isOver ? ' over' : ''}`}
      style={{ '--zc': zone.color }}
    >
      <div className="zone-title">
        <span className="zone-dot" />
        {zone.title}
        <span className="badge">{count}</span>
      </div>
      <div className="zone-sub">{zone.subtitle}</div>
      {children}
    </div>
  );
}
