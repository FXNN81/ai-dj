import React from 'react';
import { PAD_META, playPad } from '../../utils/audioEngine';

export default function PerformancePads({ deck = 'A' }) {
  const [active, setActive] = React.useState(-1);

  const trigger = (i) => {
    playPad(i);
    setActive(i);
    setTimeout(() => setActive(-1), 150);
  };

  return (
    <div className="grid grid-cols-4 gap-1 p-1.5 rounded-md w-fit mx-auto" style={{ background: '#0a0a0a', border: '1px solid #1f1f1f' }}>
      {Array.from({ length: 8 }).map((_, i) => {
        const meta = PAD_META[i];
        const isActive = active === i;
        return (
          <button
            key={i}
            onMouseDown={() => trigger(i)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') trigger(i); }}
            className="relative rounded-[3px] transition-all duration-75"
            style={{
              width: 52, height: 34,
              background: isActive
                ? `linear-gradient(180deg, ${meta.color}, ${meta.color}dd)`
                : `linear-gradient(180deg, ${meta.color}55, ${meta.color}22)`,
              boxShadow: isActive
                ? `0 0 14px ${meta.color}, inset 0 0 8px ${meta.color}88`
                : `inset 0 2px 4px rgba(0,0,0,0.6), 0 0 6px ${meta.color}33`,
              border: `1px solid ${meta.color}66`,
              transform: isActive ? 'translateY(1px)' : 'none'
            }}
            title={`${meta.name} - Deck ${deck}`}
          >
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white/80 font-mono">
              {meta.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
