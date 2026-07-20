import React, { useState } from 'react';

export default function CenterDisplay({
  deckARef, deckBRef,
  deckAName = 'No track loaded', deckBName = 'No track loaded',
  deckATime = 0, deckBTime = 0,
  deckADuration = 0, deckBDuration = 0,
  playingA = false, playingB = false,
  source = 'rekordbox',
}) {
  const [tab, setTab] = useState('WAVEFORM');

  const fmt = (s) => {
    if (!s || !isFinite(s)) return '00:00';
    const m = Math.floor(s / 60);
    const ss = String(Math.floor(s % 60)).padStart(2, '0');
    return `${String(m).padStart(2, '0')}:${ss}`;
  };

  return (
    <div className="rounded-md overflow-hidden" style={{
      background: '#000',
      border: '2px solid #0a0a0a',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.9), 0 0 15px rgba(0, 100, 200, 0.15)'
    }}>
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

      <div className="px-2 py-2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="text-[8px] text-orange-400 font-mono w-8">DECK A</div>
          <div className="flex-1 rounded-sm overflow-hidden min-h-[46px]" style={{ background: '#050505' }}>
            <div ref={deckARef} className="w-full" style={{ minHeight: 46 }} />
          </div>
          <div className={`text-[9px] font-mono font-bold ${playingA ? 'text-green-400' : 'text-neutral-400'}`}>
            {playingA ? '▶' : '■'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[8px] text-cyan-400 font-mono w-8">DECK B</div>
          <div className="flex-1 rounded-sm overflow-hidden min-h-[46px]" style={{ background: '#050505' }}>
            <div ref={deckBRef} className="w-full" style={{ minHeight: 46 }} />
          </div>
          <div className={`text-[9px] font-mono font-bold ${playingB ? 'text-green-400' : 'text-neutral-400'}`}>
            {playingB ? '▶' : '■'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 px-2 pb-2">
        <div className="rounded-sm p-1" style={{ background: 'linear-gradient(180deg, #1a0a05, #050505)', border: '1px solid #ff8a0044' }}>
          <div className="flex justify-between items-center gap-1">
            <div className="text-[8px] text-orange-300 font-mono truncate flex-1" title={deckAName}>{deckAName}</div>
            <div className="text-[9px] text-white font-mono font-bold">{fmt(deckATime)}</div>
          </div>
          <div className="flex justify-between text-[7px] text-neutral-500 font-mono mt-0.5">
            <span>REMAIN {fmt(Math.max(0, deckADuration - deckATime))}</span>
            <span>{fmt(deckADuration)}</span>
          </div>
        </div>
        <div className="rounded-sm p-1" style={{ background: 'linear-gradient(180deg, #051520, #050505)', border: '1px solid #00d4ff44' }}>
          <div className="flex justify-between items-center gap-1">
            <div className="text-[8px] text-cyan-300 font-mono truncate flex-1" title={deckBName}>{deckBName}</div>
            <div className="text-[9px] text-white font-mono font-bold">{fmt(deckBTime)}</div>
          </div>
          <div className="flex justify-between text-[7px] text-neutral-500 font-mono mt-0.5">
            <span>REMAIN {fmt(Math.max(0, deckBDuration - deckBTime))}</span>
            <span>{fmt(deckBDuration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
