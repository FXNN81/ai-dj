import React, { useState, useRef, useCallback, useEffect } from 'react';

export default function Fader({ height = 100, width = 32, value = 50, min = 0, max = 100, onChange, color = '#e5e7eb', label, orientation = 'vertical' }) {
  const [val, setVal] = useState(value);
  const dragging = useRef(false);
  const startPos = useRef(0);
  const startVal = useRef(val);
  const isH = orientation === 'horizontal';

  const pct = (val - min) / (max - min);

  const onDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    startPos.current = isH ? (e.clientX ?? e.touches?.[0]?.clientX ?? 0) : (e.clientY ?? e.touches?.[0]?.clientY ?? 0);
    startVal.current = val;
  };

  const onMove = useCallback((e) => {
    if (!dragging.current) return;
    const pos = isH ? (e.clientX ?? e.touches?.[0]?.clientX ?? 0) : (e.clientY ?? e.touches?.[0]?.clientY ?? 0);
    const delta = isH ? (pos - startPos.current) : (startPos.current - pos);
    const track = isH ? width : height;
    const range = max - min;
    let next = startVal.current + (delta / track) * range;
    next = Math.max(min, Math.min(max, next));
    setVal(next);
    onChange && onChange(next);
  }, [min, max, isH, width, height, onChange]);

  const onUp = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [onMove, onUp]);

  if (isH) {
    return (
      <div className="flex flex-col items-center select-none">
        <div
          className="relative rounded-sm"
          style={{
            width: width, height: 14,
            background: 'linear-gradient(180deg, #050505, #1a1a1a, #050505)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9)',
            border: '1px solid #2a2a2a'
          }}
        >
          <div
            onMouseDown={onDown}
            onTouchStart={onDown}
            className="absolute top-1/2 rounded-sm cursor-ew-resize"
            style={{
              left: `${pct * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: 18, height: 22,
              background: 'linear-gradient(180deg, #d4d4d4, #737373 50%, #262626)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.3)',
              border: '1px solid #0a0a0a'
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 12, height: 1, background: '#0a0a0a' }} />
          </div>
        </div>
        {label && <div className="text-[8px] text-neutral-400 mt-1 font-mono uppercase">{label}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center select-none">
      <div
        className="relative rounded-sm"
        style={{
          width: 10, height,
          background: 'linear-gradient(90deg, #050505, #1a1a1a, #050505)',
          boxShadow: 'inset 1px 0 3px rgba(0,0,0,0.9), inset -1px 0 3px rgba(0,0,0,0.9)',
          border: '1px solid #2a2a2a'
        }}
      >
        <div
          onMouseDown={onDown}
          onTouchStart={onDown}
          className="absolute left-1/2 rounded-sm cursor-ns-resize"
          style={{
            top: `${(1 - pct) * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: width, height: 20,
            background: `linear-gradient(180deg, #e5e5e5, ${color} 40%, #404040 70%, #171717)`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.4)',
            border: '1px solid #0a0a0a'
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: width - 8, height: 1, background: '#0a0a0a' }} />
        </div>
      </div>
      {label && <div className="text-[8px] text-neutral-400 mt-1 font-mono uppercase">{label}</div>}
    </div>
  );
}
