import React from 'react';
import { PAD_META, playPad } from '../../utils/audioEngine';

// Per-pad colors matching the original XDJ-AZ hot cue color palette (8 unique LEDs)
const PAD_COLORS = [
  '#ff8a00', // orange
  '#ffd400', // yellow
  '#22c55e', // green
  '#ef4444', // red
  '#00d4ff', // cyan
  '#a855f7', // purple
  '#ec4899', // magenta
  '#3b82f6', // blue
];

export default function PerformancePads({ deck = 'A' }) {
  const [active, setActive] = React.useState(-1);

  const trigger = (i) => {
    playPad(i);
    setActive(i);
    setTimeout(() => setActive(-1), 160);
  };

  return (
    <div className="rounded-md p-1.5 mx-auto" style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', width: 'fit-content' }}>
      {/* Mode selector row (HOT CUE / PAD FX / BEAT JUMP / SAMPLER) */}
      <div className="grid grid-cols-4 gap-1 mb-1.5">
        {[
          { label: 'HOT CUE', color: '#ff8a00' },
          { label: 'PAD FX', color: '#a855f7' },
          { label: 'BEAT JUMP', color: '#00d4ff' },
          { label: 'SAMPLER', color: '#ef4444' },
        ].map((m) => (
          <button
            key={m.label}
            className="text-[6.5px] font-bold py-1 rounded-sm tracking-tight"
            style={{
              background: `linear-gradient(180deg, ${m.color}22, ${m.color}08)`,
              color: m.color,
              border: `1px solid ${m.color}55`,
            }}
          >{m.label}</button>
        ))}
      </div>
      {/* Pad grid 4x2 */}
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 8 }).map((_, i) => {
          const meta = PAD_META[i];
          const color = PAD_COLORS[i];
          const isActive = active === i;
          return (
            <button
              key={i}
              onMouseDown={() => trigger(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') trigger(i); }}
              className="relative rounded-[4px] transition-all duration-75 group overflow-hidden"
              style={{
                width: 54, height: 42,
                background: isActive
                  ? `radial-gradient(circle at 50% 40%, ${color}ee, ${color}88)`
                  : `linear-gradient(180deg, ${color}55, ${color}18 60%, ${color}08)`,
                boxShadow: isActive
                  ? `0 0 18px ${color}, inset 0 0 10px ${color}bb, 0 0 40px ${color}55`
                  : `inset 0 2px 4px rgba(0,0,0,0.7), inset 0 -1px 2px ${color}22, 0 0 6px ${color}33`,
                border: `1px solid ${isActive ? color : color + '77'}`,
                transform: isActive ? 'translateY(1px) scale(0.98)' : 'none',
              }}
              title={`${meta.name} - Deck ${deck}`}
            >
              {/* Top gloss */}
              <span
                className="absolute top-0 left-0 right-0"
                style={{ height: '35%', background: 'linear-gradient(180deg, rgba(255,255,255,0.18), transparent)', pointerEvents: 'none' }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold tracking-tight font-mono"
                style={{ color: isActive ? '#fff' : '#ffffffcc', textShadow: `0 1px 2px rgba(0,0,0,0.9)` }}>
                {meta.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
