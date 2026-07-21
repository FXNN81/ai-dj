import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function JogWheel({ size = 260, playing = false, color = '#ff2b6b', logo = 'A' }) {
  const [rotation, setRotation] = useState(0);
  const dragging = useRef(false);
  const lastAngle = useRef(0);
  const wheelRef = useRef(null);
  const rafRef = useRef(null);

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
  }, []);

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

  const ridges = Array.from({ length: 72 });

  return (
    <div
      ref={wheelRef}
      onMouseDown={onDown}
      onTouchStart={onDown}
      className="relative rounded-full cursor-grab active:cursor-grabbing select-none"
      style={{
        width: size, height: size,
        background: 'radial-gradient(circle at 30% 25%, #383838 0%, #1a1a1a 45%, #050505 100%)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.8), inset 0 4px 12px rgba(255,255,255,0.06), inset 0 -8px 24px rgba(0,0,0,0.95), 0 0 0 2px #0a0a0a',
      }}
    >
      {/* Outer ridged metallic ring */}
      <div
        className="absolute rounded-full overflow-hidden"
        style={{
          inset: '3%',
          background: 'conic-gradient(#2a2a2a, #454545, #2a2a2a, #454545, #2a2a2a, #454545, #2a2a2a, #454545, #2a2a2a)',
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {ridges.map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-0"
            style={{
              width: 1.5, height: 12,
              background: 'linear-gradient(180deg, #4a4a4a, #0a0a0a)',
              transformOrigin: `50% ${size * 0.47}px`,
              transform: `translateX(-50%) rotate(${(i * 360) / 72}deg)`,
            }}
          />
        ))}
      </div>

      {/* Inner dark disc (touch plate) */}
      <div
        className="absolute rounded-full"
        style={{
          top: '11%', left: '11%', width: '78%', height: '78%',
          background: 'radial-gradient(circle at 40% 30%, #1a1a1a 0%, #050505 65%, #000 100%)',
          boxShadow: 'inset 0 6px 16px rgba(0,0,0,0.9), inset 0 -3px 8px rgba(255,255,255,0.03), 0 0 0 1px #262626',
        }}
      />

      {/* Thin bright color ring */}
      <div
        className="absolute rounded-full"
        style={{
          top: '13.5%', left: '13.5%', width: '73%', height: '73%',
          background: `conic-gradient(from 0deg, ${color}, ${color}44 15%, ${color} 30%, ${color}22 50%, ${color} 70%, ${color}44 85%, ${color})`,
          filter: `blur(0.5px) drop-shadow(0 0 8px ${color}88)`,
          opacity: playing ? 0.95 : 0.5,
          transform: `rotate(${rotation * 0.5}deg)`,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          top: '15%', left: '15%', width: '70%', height: '70%',
          background: 'radial-gradient(circle at 40% 30%, #1a1a1a 0%, #050505 65%, #000 100%)',
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.9)',
        }}
      />

      {/* Center display */}
      <div
        className="absolute rounded-full flex items-center justify-center overflow-hidden"
        style={{
          top: '28%', left: '28%', width: '44%', height: '44%',
          background: '#000',
          border: '2px solid #1a1a1a',
          boxShadow: `0 0 24px ${color}55, inset 0 0 16px rgba(0,0,0,0.95)`,
        }}
      >
        {/* Rotating spectrum ring */}
        <div
          className="absolute inset-1 rounded-full"
          style={{
            background: `conic-gradient(from ${rotation}deg, ${color}, #ffd400, #22c55e, #00d4ff, #a855f7, ${color})`,
            filter: 'blur(1.5px)',
            opacity: playing ? 0.9 : 0.65,
          }}
        />
        <div className="absolute rounded-full" style={{ top: '15%', left: '15%', width: '70%', height: '70%', background: '#000', border: '1px solid #1a1a1a' }} />
        <div
          className="relative z-10 font-black italic"
          style={{ fontSize: size * 0.14, color: '#fff', textShadow: `0 0 10px ${color}, 0 0 4px #fff` }}
        >
          {logo}
        </div>
        {/* Position marker (rotates) */}
        <div
          className="absolute z-20"
          style={{
            top: '2%', left: '50%',
            width: 4, height: '20%',
            background: color,
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transformOrigin: `50% ${size * 0.22}px`,
            boxShadow: `0 0 10px ${color}, 0 0 4px #fff`,
            borderRadius: 2,
          }}
        />
      </div>

      {/* Fixed 12 o'clock LED marker */}
      <div
        className="absolute"
        style={{
          top: '4.5%', left: '50%',
          width: 3, height: 7,
          transform: 'translateX(-50%)',
          background: playing ? '#fff' : '#666',
          borderRadius: 1,
          boxShadow: playing ? `0 0 8px #fff, 0 0 14px ${color}` : 'none',
        }}
      />
    </div>
  );
}
