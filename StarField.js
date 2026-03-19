import React, { useMemo } from 'react';

export default function StarField({ count = 80 }) {
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    dur: (Math.random() * 4 + 2).toFixed(1) + 's',
    delay: (Math.random() * 4).toFixed(1) + 's',
    opacity: Math.random() * 0.6 + 0.1,
  })), [count]);

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map(s => (
        <div key={s.id} className="star" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          opacity: s.opacity,
          '--dur': s.dur, '--delay': s.delay,
        }} />
      ))}
      {/* Nebula blobs */}
      <div style={{
        position: 'absolute', width: 600, height: 600,
        borderRadius: '50%', top: '-10%', left: '-15%',
        background: 'radial-gradient(circle, rgba(13,27,75,0.4) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500,
        borderRadius: '50%', bottom: '5%', right: '-10%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
    </div>
  );
}
