import React, { useState, useRef, useCallback, useEffect } from 'react';

export default function Knob({ size = 44, min = 0, max = 100, value = 50, onChange, color = '#00d4ff', label, showValue = false, indicator = true }) {
  const [val, setVal] = useState(value);
  const startY = useRef(0);
  const startVal = useRef(val);
  const dragging = useRef(false);

  const angle = ((val - min) / (max - min)) * 270 - 135;

  const onDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    startY.current = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    startVal.current = val;
  };

  const onMove = useCallback((e) => {
    if (!dragging.current) return;
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const delta = startY.current - y;
    const range = max - min;
    let next = startVal.current + (delta / 150) * range;
    next = Math.max(min, Math.min(max, next));
    setVal(next);
    onChange && onChange(next);
  }, [min, max, onChange]);

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

  return (
    <div className="flex flex-col items-center select-none" style={{ width: size + 4 }}>
      <div
        onMouseDown={onDown}
        onTouchStart={onDown}
        onDoubleClick={() => { setVal((min + max) / 2); onChange && onChange((min + max) / 2); }}
        className="relative rounded-full cursor-ns-resize"
        style={{
          width: size,
          height: size,
          background: 'radial-gradient(circle at 30% 25%, #4a4a4a 0%, #1a1a1a 60%, #0a0a0a 100%)',
          boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)',
          border: '1px solid #2a2a2a'
        }}
      >
        {indicator && (
          <div
            className="absolute"
            style={{
              top: '8%',
              left: '50%',
              width: 2,
              height: '30%',
              background: color,
              transformOrigin: '50% 140%',
              transform: `translateX(-50%) rotate(${angle}deg)`,
              boxShadow: `0 0 4px ${color}`,
              borderRadius: 1
            }}
          />
        )}
        <div
          className="absolute rounded-full"
          style={{
            top: '50%', left: '50%',
            width: size * 0.25, height: size * 0.25,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, #2a2a2a, #0a0a0a)'
          }}
        />
      </div>
      {label && <div className="text-[8px] text-neutral-400 mt-0.5 uppercase tracking-tight font-mono">{label}</div>}
      {showValue && <div className="text-[9px] text-neutral-300 font-mono">{Math.round(val)}</div>}
    </div>
  );
}
