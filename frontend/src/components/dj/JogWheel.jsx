import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function JogWheel({ size = 260, playing = false, color = '#ff2b6b', logo = 'A', onNudge }) {
  const [rotation, setRotation] = useState(0);
  const dragging = useRef(false);
  const lastAngle = useRef(0);
  const wheelRef = useRef(null);
  const rafRef = useRef(null);

  // Auto-rotate when playing
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (t) => {
      const dt = t - last; last = t;
      setRotation(r => (r + dt * 0.12) % 360);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  const getAngle = (e) => {
    const rect = wheelRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - cx;
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - cy;
    return Math.atan2(y, x) * 180 / Math.PI;
  };

  const onDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    lastAngle.current = getAngle(e);
  };

  const onMove = useCallback((e) => {
    if (!dragging.current) return;
    const a = getAngle(e);
    let delta = a - lastAngle.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    lastAngle.current = a;
    setRotation(r => (r + delta + 360) % 360);
    onNudge && onNudge(delta);
  }, [onNudge]);

  const onUp = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [onMove, onUp]);

  // Ridged edge
  const ridges = Array.from({ length: 60 });

  return (
    <div
      ref={wheelRef}
      onMouseDown={onDown}
      onTouchStart={onDown}
      className="relative rounded-full cursor-grab active:cursor-grabbing select-none"
      style={{
        width: size, height: size,
        background: 'radial-gradient(circle at 30% 25%, #2a2a2a 0%, #0f0f0f 55%, #050505 100%)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.7), inset 0 4px 10px rgba(255,255,255,0.05), inset 0 -6px 20px rgba(0,0,0,0.9)',
        border: '2px solid #1a1a1a'
      }}
    >
      {/* Outer ridged ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: dragging.current ? 'none' : undefined,
        }}
      >
        {ridges.map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-0"
            style={{
              width: 2, height: 10,
              background: 'linear-gradient(180deg, #2a2a2a, #050505)',
              transformOrigin: `50% ${size / 2}px`,
              transform: `translateX(-50%) rotate(${(i * 360) / 60}deg)`,
            }}
          />
        ))}
      </div>

      {/* Inner disc */}
      <div
        className="absolute rounded-full"
        style={{
          top: '10%', left: '10%', width: '80%', height: '80%',
          background: 'radial-gradient(circle at 40% 35%, #1a1a1a 0%, #050505 70%)',
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.9), inset 0 -2px 6px rgba(255,255,255,0.03)',
          border: '1px solid #262626'
        }}
      />

      {/* Center display */}
      <div
        className="absolute rounded-full flex items-center justify-center overflow-hidden"
        style={{
          top: '25%', left: '25%', width: '50%', height: '50%',
          background: '#000',
          border: '2px solid #1a1a1a',
          boxShadow: `0 0 20px ${color}55, inset 0 0 15px rgba(0,0,0,0.9)`
        }}
      >
        {/* Rotating spectrum ring */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: `conic-gradient(from ${rotation}deg, ${color}, #ffd400, #22c55e, #00d4ff, #a855f7, ${color})`,
            filter: 'blur(1px)',
            opacity: 0.85
          }}
        />
        <div className="absolute rounded-full" style={{ top: '18%', left: '18%', width: '64%', height: '64%', background: '#000', border: '1px solid #1a1a1a' }} />
        <div
          className="relative z-10 font-black text-white"
          style={{ fontSize: size * 0.14, textShadow: `0 0 8px ${color}` }}
        >
          {logo}
        </div>
        {/* Position marker */}
        <div
          className="absolute"
          style={{
            top: '4%', left: '50%',
            width: 3, height: '18%',
            background: color,
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transformOrigin: `50% ${size * 0.23}px`,
            boxShadow: `0 0 8px ${color}`,
            borderRadius: 2
          }}
        />
      </div>
    </div>
  );
}
