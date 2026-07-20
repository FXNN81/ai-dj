import React from 'react';
import Knob from './Knob';
import Fader from './Fader';
import JogWheel from './JogWheel';
import PerformancePads from './PerformancePads';

export default function DeckControls({ side = 'left', playing, onPlay, onCue, onTempo, deck = 'A', color = '#ff2b6b' }) {
  const isLeft = side === 'left';
  return (
    <div className={`flex flex-col gap-2 ${isLeft ? '' : ''}`}>
      {/* Top row: FX section */}
      <div className="flex gap-2 items-start">
        {/* Small controls row */}
        <div className="flex flex-col gap-1 flex-1">
          <div className="text-[8px] font-mono text-neutral-500 tracking-widest">{isLeft ? 'HEADPHONES' : 'MASTER'}</div>
          <div className="grid grid-cols-4 gap-1">
            <Knob size={24} label="KEY" color="#22c55e" />
            <Knob size={24} label="VELO" color="#22c55e" />
            <Knob size={24} label="SHIFT" color="#ffd400" />
            <Knob size={24} label="HP MIX" color="#0ea5e9" />
          </div>
          <div className="grid grid-cols-4 gap-1">
            <button className="text-[7px] font-bold py-1 rounded-sm text-cyan-400" style={{ background: '#0a0a0a', border: '1px solid #0ea5e955' }}>{isLeft ? '3' : '2'}</button>
            <button className="text-[7px] font-bold py-1 rounded-sm text-cyan-400" style={{ background: '#0a0a0a', border: '1px solid #0ea5e955' }}>{isLeft ? '1' : '4'}</button>
            <button className="text-[7px] font-bold py-1 rounded-sm text-orange-400" style={{ background: '#0a0a0a', border: '1px solid #ff8a0055' }}>DECK</button>
            <button className="text-[7px] font-bold py-1 rounded-sm text-orange-400" style={{ background: '#0a0a0a', border: '1px solid #ff8a0055' }}>SEL</button>
          </div>
        </div>
      </div>

      {/* Jog Wheel row */}
      <div className="flex gap-2 items-center">
        {isLeft && (
          <div className="flex flex-col gap-1">
            <button className="text-[7px] font-bold py-1 px-1 rounded-sm text-red-400" style={{ background: '#0a0a0a', border: '1px solid #ef444455' }}>SLIP<br />REV</button>
            <button className="text-[7px] font-bold py-1 px-1 rounded-sm text-neutral-300" style={{ background: '#0a0a0a', border: '1px solid #33333388' }}>VINYL</button>
            <div className="flex flex-col gap-2 items-center mt-1">
              <div className="text-[7px] text-neutral-500">TEMPO</div>
              <Fader height={130} width={16} value={50} color="#404040" onChange={onTempo} />
              <div className="text-[7px] text-neutral-500">±8%</div>
            </div>
          </div>
        )}

        <JogWheel size={220} playing={playing} color={color} logo={isLeft ? 'A' : 'T'} />

        {!isLeft && (
          <div className="flex flex-col gap-1">
            <button className="text-[7px] font-bold py-1 px-1 rounded-sm text-red-400" style={{ background: '#0a0a0a', border: '1px solid #ef444455' }}>SLIP<br />REV</button>
            <button className="text-[7px] font-bold py-1 px-1 rounded-sm text-neutral-300" style={{ background: '#0a0a0a', border: '1px solid #33333388' }}>VINYL</button>
            <div className="flex flex-col gap-2 items-center mt-1">
              <div className="text-[7px] text-neutral-500">TEMPO</div>
              <Fader height={130} width={16} value={50} color="#404040" onChange={onTempo} />
              <div className="text-[7px] text-neutral-500">±8%</div>
            </div>
          </div>
        )}
      </div>

      {/* Play / Cue / transport */}
      <div className="grid grid-cols-4 gap-2 px-2">
        <button
          onClick={onCue}
          className="col-span-1 py-2 rounded-md text-[9px] font-bold text-white"
          style={{
            background: 'linear-gradient(180deg, #ff8a00, #b25e00)',
            boxShadow: '0 2px 6px rgba(255,138,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
          }}
        >CUE</button>
        <button
          onClick={onPlay}
          className="col-span-1 py-2 rounded-md text-[9px] font-bold text-white"
          style={{
            background: playing ? 'linear-gradient(180deg, #22c55e, #14532d)' : 'linear-gradient(180deg, #404040, #171717)',
            boxShadow: playing ? '0 0 12px #22c55e88, inset 0 1px 0 rgba(255,255,255,0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.15)'
          }}
        >{playing ? 'PAUSE' : 'PLAY'}</button>
        <button className="col-span-1 py-2 rounded-md text-[9px] font-bold text-white" style={{ background: 'linear-gradient(180deg, #0ea5e9, #075985)', boxShadow: '0 2px 6px rgba(14,165,233,0.3)' }}>SYNC</button>
        <button className="col-span-1 py-2 rounded-md text-[9px] font-bold text-white" style={{ background: 'linear-gradient(180deg, #ec4899, #831843)', boxShadow: '0 2px 6px rgba(236,72,153,0.3)' }}>LOOP</button>
      </div>

      {/* Performance Pads */}
      <PerformancePads deck={deck} />
    </div>
  );
}
