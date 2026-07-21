import React from 'react';
import Fader from './Fader';
import JogWheel from './JogWheel';
import PerformancePads from './PerformancePads';
import Knob from './Knob';

export default function DeckControls({ side = 'left', playing, onPlay, onCue, onTempo, deck = 'A', color = '#ff2b6b' }) {
  const isLeft = side === 'left';
  const accent = isLeft ? '#ff2b6b' : '#22c55e';

  const TempoStack = () => (
    <div className="flex flex-col items-center gap-1 pt-1">
      <div className="text-[7px] text-neutral-500 font-mono tracking-wider">TEMPO</div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[7px] text-neutral-600 font-mono">+</span>
        <Fader height={150} width={16} value={50} color="#404040" onChange={onTempo} />
        <span className="text-[7px] text-neutral-600 font-mono">−</span>
      </div>
      <div className="text-[7px] text-neutral-500 font-mono">±8%</div>
    </div>
  );

  const SideButtons = () => (
    <div className="flex flex-col gap-1 pt-2">
      <button className="text-[6.5px] font-bold py-1 px-1.5 rounded-sm text-red-400" style={{ background: '#0a0a0a', border: '1px solid #ef444455' }}>SLIP<br />REV</button>
      <button className="text-[6.5px] font-bold py-1 px-1.5 rounded-sm text-neutral-300" style={{ background: '#0a0a0a', border: '1px solid #33333388' }}>VINYL</button>
      <button className="text-[6.5px] font-bold py-1 px-1.5 rounded-sm text-cyan-400" style={{ background: '#0a0a0a', border: '1px solid #0ea5e955' }}>QUANT</button>
      <button className="text-[6.5px] font-bold py-1 px-1.5 rounded-sm text-orange-400" style={{ background: '#0a0a0a', border: '1px solid #ff8a0055' }}>KEY<br />SYNC</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Top row: track select + browse + FX assign */}
      <div className="flex flex-col gap-1.5 px-1">
        <div className="flex items-center justify-between">
          <div className="text-[8px] font-mono text-cyan-400 tracking-widest">{isLeft ? 'DECK 1 / 3' : 'DECK 2 / 4'}</div>
          <div className="text-[7px] font-mono text-neutral-500">HOT CUE · LOOP</div>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {['LOOP IN', 'LOOP OUT', 'RELOOP', 'AUTO'].map((l) => (
            <button key={l} className="text-[6.5px] font-bold py-1 rounded-sm text-cyan-300" style={{ background: 'linear-gradient(180deg, #0a1a20, #050a10)', border: '1px solid #0ea5e955' }}>{l}</button>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-1">
          <Knob size={22} label="BROWSE" color="#0ea5e9" />
          <Knob size={22} label="LOAD" color="#0ea5e9" />
          <Knob size={22} label="TAG" color="#ffd400" />
          <Knob size={22} label="RATE" color="#22c55e" />
          <Knob size={22} label="TRAX" color="#a855f7" />
        </div>
      </div>

      {/* Jog Wheel row with tempo fader outside */}
      <div className="flex gap-1.5 items-center justify-center">
        {isLeft && <TempoStack />}
        {isLeft && <SideButtons />}

        <div className="relative">
          <JogWheel size={230} playing={playing} color={color} logo={isLeft ? 'A' : 'T'} />
          {/* Small brand text near wheel */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[7px] font-mono text-neutral-500 tracking-widest">DECK {deck}</div>
        </div>

        {!isLeft && <SideButtons />}
        {!isLeft && <TempoStack />}
      </div>

      {/* Big Play + Cue transport row */}
      <div className="grid grid-cols-2 gap-2 px-4 mt-1">
        <button
          onClick={onCue}
          className="relative py-2.5 rounded-md text-[11px] font-black tracking-widest text-white transition-all active:scale-95"
          style={{
            background: 'linear-gradient(180deg, #ff9a1a, #b25e00 60%, #7a3f00)',
            boxShadow: '0 3px 8px rgba(255,138,0,0.35), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.4)',
            border: '1px solid #7a3f00',
          }}
        >
          <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">CUE</span>
        </button>
        <button
          onClick={onPlay}
          className="relative py-2.5 rounded-md text-[11px] font-black tracking-widest text-white transition-all active:scale-95"
          style={{
            background: playing
              ? 'linear-gradient(180deg, #34d399, #16a34a 55%, #14532d)'
              : 'linear-gradient(180deg, #4a4a4a, #262626 55%, #0f0f0f)',
            boxShadow: playing
              ? '0 0 20px #22c55e88, inset 0 1px 0 rgba(255,255,255,0.35)'
              : 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 3px rgba(0,0,0,0.6)',
            border: `1px solid ${playing ? '#14532d' : '#0a0a0a'}`,
          }}
        >
          <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{playing ? 'PAUSE ❚❚' : 'PLAY ▶'}</span>
        </button>
      </div>

      {/* Sync/Loop small buttons */}
      <div className="grid grid-cols-4 gap-1 px-4">
        <button className="py-1 rounded-sm text-[8px] font-bold text-cyan-100" style={{ background: 'linear-gradient(180deg, #0ea5e9, #075985)', boxShadow: '0 1px 4px rgba(14,165,233,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' }}>SYNC</button>
        <button className="py-1 rounded-sm text-[8px] font-bold text-pink-100" style={{ background: 'linear-gradient(180deg, #ec4899, #831843)', boxShadow: '0 1px 4px rgba(236,72,153,0.35), inset 0 1px 0 rgba(255,255,255,0.2)' }}>MEMORY</button>
        <button className="py-1 rounded-sm text-[8px] font-bold text-white" style={{ background: 'linear-gradient(180deg, #a855f7, #4c1d95)', boxShadow: '0 1px 4px rgba(168,85,247,0.35), inset 0 1px 0 rgba(255,255,255,0.2)' }}>CALL</button>
        <button className="py-1 rounded-sm text-[8px] font-bold text-white" style={{ background: 'linear-gradient(180deg, #ef4444, #7f1d1d)', boxShadow: '0 1px 4px rgba(239,68,68,0.35), inset 0 1px 0 rgba(255,255,255,0.2)' }}>DELETE</button>
      </div>

      {/* Performance Pads */}
      <div className="mt-1">
        <PerformancePads deck={deck} />
      </div>
    </div>
  );
}
