import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';

export default function Card({ card, disabled, mover, verdict }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: card.id, disabled });

  const cls = ['card'];
  if (isDragging) cls.push('dragging');
  if (verdict === 'correct') cls.push('correct');
  if (verdict === 'incorrect') cls.push('incorrect');

  return (
    <motion.div
      layout
      layoutId={card.id}
      ref={setNodeRef}
      className={cls.join(' ')}
      transition={{ type: 'spring', stiffness: 520, damping: 38 }}
      {...listeners}
      {...attributes}
    >
      {verdict && <span className="verdict">{verdict === 'correct' ? '✓' : '✕'}</span>}
      {card.text}
      {mover && <span className="mover">moved by <b>{mover}</b></span>}
    </motion.div>
  );
}
