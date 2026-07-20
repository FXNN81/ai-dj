import React, { useEffect, useRef, useState } from 'react';

function Waveform({ color1 = '#ff8a00', color2 = '#00d4ff', playing = false, height = 46 }) {
  const canvasRef = useRef(null);
  const offsetRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.scale(1, 1);

    // Pre-generate wave data (2000 samples)
    const samples = 2000;
    const data = [];
    for (let i = 0; i < samples; i++) {
      const bass = Math.abs(Math.sin(i * 0.05) * Math.cos(i * 0.013));
      const mid = Math.abs(Math.sin(i * 0.11 + 1) * 0.7);
      const hi = Math.abs(Math.sin(i * 0.27) * 0.4) + Math.random() * 0.15;
      data.push({ bass, mid, hi });
    }

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const barW = 3;
      const bars = Math.floor(w / barW);
      const offset = Math.floor(offsetRef.current);
      for (let i = 0; i < bars; i++) {
        const d = data[(i + offset) % samples];
        const total = (d.bass * 0.55 + d.mid * 0.3 + d.hi * 0.15);
        const barH = total * h * 0.9;
        const centerY = h / 2;
        // Mix color
        const grad = ctx.createLinearGradient(0, centerY - barH / 2, 0, centerY + barH / 2);
        grad.addColorStop(0, color1);
        grad.addColorStop(0.5, '#ffffff');
        grad.addColorStop(1, color2);
        ctx.fillStyle = grad;
        ctx.fillRect(i * barW, centerY - barH / 2, barW - 1, barH);
      }
      // Playhead
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(w / 2 - 1, 0, 2, h);
      ctx.fillStyle = '#ff2b6b';
      ctx.fillRect(w / 2 - 1, 0, 2, 8);
      if (playing) offsetRef.current += 0.6;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [color1, color2, playing]);

  return <canvas ref={canvasRef} style={{ width: '100%', height, display: 'block' }} />;
}

function MiniWave({ color = '#ff8a00' }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    const w = c.width = c.offsetWidth * 2;
    const h = c.height = c.offsetHeight * 2;
    ctx.fillStyle = color;
    const bars = 120;
    for (let i = 0; i < bars; i++) {
      const v = Math.abs(Math.sin(i * 0.2) * Math.cos(i * 0.07) + Math.sin(i * 0.5) * 0.3);
      const bh = v * h * 0.9;
      ctx.globalAlpha = 0.4 + v * 0.6;
      ctx.fillRect(i * (w / bars), h / 2 - bh / 2, (w / bars) - 1, bh);
    }
  }, [color]);
  return <canvas ref={canvasRef} style={{ width: '100%', height: 34, display: 'block' }} />;
}

export default function CenterDisplay({ playingA, playingB, bpm = 125, source = 'rekordbox' }) {
  const [tab, setTab] = useState('WAVEFORM');
  const [timeA, setTimeA] = useState(65);
  const [timeB, setTimeB] = useState(160);

  useEffect(() => {
    const t = setInterval(() => {
      if (playingA) setTimeA(v => v + 1);
      if (playingB) setTimeB(v => v + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [playingA, playingB]);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, '0');
    return `${String(m).padStart(2, '0')}:${ss}`;
  };

  return (
    <div className="rounded-md overflow-hidden" style={{
      background: '#000',
      border: '2px solid #0a0a0a',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.9), 0 0 15px rgba(0, 100, 200, 0.15)'
    }}>
      {/* Top tabs */}
      <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-b from-neutral-900 to-black" style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div className="flex gap-1">
          {['SOURCE', 'BROWSE', 'MENU'].map(t => (
            <button key={t} onClick={() => setTab(t)} className="px-2 py-0.5 text-[8px] font-bold rounded-sm" style={{
              background: tab === t ? '#0ea5e9' : '#1a1a1a',
              color: tab === t ? '#000' : '#0ea5e9',
              border: '1px solid #0ea5e9'
            }}>{t}</button>
          ))}
        </div>
        <div className="text-[8px] text-neutral-500 font-mono uppercase">{source}</div>
      </div>

      {/* Waveforms */}
      <div className="px-2 py-2 space-y-1">
        <div className="flex items-center gap-2">
          <div className="text-[8px] text-orange-400 font-mono w-8">DECK A</div>
          <div className="flex-1 rounded-sm overflow-hidden" style={{ background: '#050505' }}>
            <Waveform color1="#ff8a00" color2="#ffd400" playing={playingA} />
          </div>
          <div className="text-[9px] text-white font-mono font-bold">{bpm}<span className="text-[7px] text-neutral-500">BPM</span></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[8px] text-cyan-400 font-mono w-8">DECK B</div>
          <div className="flex-1 rounded-sm overflow-hidden" style={{ background: '#050505' }}>
            <Waveform color1="#00d4ff" color2="#3b82f6" playing={playingB} />
          </div>
          <div className="text-[9px] text-white font-mono font-bold">{bpm + 2}<span className="text-[7px] text-neutral-500">BPM</span></div>
        </div>
      </div>

      {/* Track info + mini waveforms */}
      <div className="grid grid-cols-2 gap-1 px-2 pb-2">
        <div className="rounded-sm p-1" style={{ background: 'linear-gradient(180deg, #1a0a05, #050505)', border: '1px solid #ff8a0044' }}>
          <div className="flex justify-between items-center">
            <div className="text-[8px] text-orange-300 font-mono truncate">Nightfall - Trance Mix</div>
            <div className="text-[9px] text-white font-mono font-bold">{fmt(timeA)}</div>
          </div>
          <MiniWave color="#ff8a00" />
          <div className="flex justify-between text-[7px] text-neutral-500 font-mono">
            <span>REMAIN 03:42</span>
            <span>4A · {bpm}.0</span>
          </div>
        </div>
        <div className="rounded-sm p-1" style={{ background: 'linear-gradient(180deg, #051520, #050505)', border: '1px solid #00d4ff44' }}>
          <div className="flex justify-between items-center">
            <div className="text-[8px] text-cyan-300 font-mono truncate">Neon Dreams - House</div>
            <div className="text-[9px] text-white font-mono font-bold">{fmt(timeB)}</div>
          </div>
          <MiniWave color="#00d4ff" />
          <div className="flex justify-between text-[7px] text-neutral-500 font-mono">
            <span>REMAIN 02:15</span>
            <span>8B · {bpm + 2}.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
