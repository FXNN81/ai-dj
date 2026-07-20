import React, { useState } from 'react';
import DeckControls from './dj/DeckControls';
import CenterDisplay from './dj/CenterDisplay';
import MixerSection from './dj/MixerSection';
import Knob from './dj/Knob';
import { Volume2, Headphones, Mic } from 'lucide-react';

export default function DJVisualizer() {
  const [playA, setPlayA] = useState(false);
  const [playB, setPlayB] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-8 px-4"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #050505 60%, #000 100%)'
      }}
    >
      {/* Title */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="text-neutral-400">AlphaTheta</span> <span className="text-white">XDJ-AZ</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">Interactive DJ Visualizer</p>
      </div>

      {/* Controller body */}
      <div
        className="relative rounded-2xl p-4"
        style={{
          width: 'min(1200px, 100%)',
          background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 50%, #050505 100%)',
          border: '2px solid #0a0a0a',
          boxShadow: '0 20px 60px rgba(0,0,0,0.9), inset 0 2px 4px rgba(255,255,255,0.04), inset 0 -4px 20px rgba(0,0,0,0.9)'
        }}
      >
        {/* Top section - Mic + FX headers */}
        <div className="grid grid-cols-3 gap-4 mb-3">
          {/* Left mic section */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[8px] text-neutral-500 font-mono"><Mic size={9} /> MIC 1</div>
              <div className="flex gap-1 mt-1">
                <Knob size={22} label="LVL" color="#ff8a00" />
                <Knob size={22} label="HI" color="#ff8a00" />
                <Knob size={22} label="LOW" color="#ff8a00" />
                <Knob size={22} label="ECHO" color="#ff8a00" />
              </div>
            </div>
            <div className="flex flex-col items-center ml-2">
              <div className="flex items-center gap-1 text-[8px] text-neutral-500 font-mono"><Mic size={9} /> MIC 2</div>
              <div className="flex gap-1 mt-1">
                <Knob size={22} label="LVL" color="#ffd400" />
                <Knob size={22} label="HI" color="#ffd400" />
                <Knob size={22} label="LOW" color="#ffd400" />
                <Knob size={22} label="ECHO" color="#ffd400" />
              </div>
            </div>
          </div>

          {/* Center display */}
          <div>
            <CenterDisplay playingA={playA} playingB={playB} bpm={125} />
          </div>

          {/* Right master section */}
          <div className="flex items-center justify-end gap-2 px-2">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-[8px] text-neutral-500 font-mono">MASTER <Volume2 size={9} /></div>
              <div className="flex gap-1 mt-1">
                <Knob size={22} label="MST" color="#22c55e" />
                <Knob size={22} label="BAL" color="#22c55e" />
                <Knob size={22} label="BOOTH" color="#22c55e" />
              </div>
              {/* Master meter */}
              <div className="flex gap-0.5 mt-1">
                {['L', 'R'].map(ch => (
                  <div key={ch} className="flex flex-col-reverse gap-[1px] p-[2px] rounded-sm" style={{ width: 6, height: 26, background: '#050505', border: '1px solid #1a1a1a' }}>
                    {Array.from({ length: 8 }).map((_, i) => {
                      const on = playA || playB ? Math.random() > (i / 10) : i < 3;
                      const c = i > 5 ? '#ef4444' : i > 3 ? '#ffd400' : '#22c55e';
                      return <div key={i} className="flex-1 rounded-sm" style={{ background: on ? c : '#111', boxShadow: on ? `0 0 2px ${c}` : 'none' }} />;
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center ml-1">
              <div className="flex items-center gap-1 text-[8px] text-neutral-500 font-mono"><Headphones size={9} /> HP</div>
              <div className="flex gap-1 mt-1">
                <Knob size={22} label="MIX" color="#0ea5e9" />
                <Knob size={22} label="LVL" color="#0ea5e9" />
              </div>
            </div>
          </div>
        </div>

        {/* Brand labels row */}
        <div className="flex justify-between px-2 mb-2">
          <div className="text-[10px] font-bold text-neutral-400 italic tracking-wide">AlphaTheta</div>
          <div className="text-[10px] font-bold text-neutral-400 italic tracking-wide">rekordbox <span className="text-neutral-500">|</span> serato</div>
          <div className="text-[10px] font-bold text-neutral-400 italic tracking-wide">USB A · USB B</div>
        </div>

        {/* Main deck row */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
          <DeckControls side="left" playing={playA} onPlay={() => setPlayA(p => !p)} onCue={() => setPlayA(false)} deck="A" color="#ff2b6b" />
          <MixerSection />
          <DeckControls side="right" playing={playB} onPlay={() => setPlayB(p => !p)} onCue={() => setPlayB(false)} deck="B" color="#22c55e" />
        </div>

        {/* Bottom feet indicators */}
        <div className="flex justify-between mt-3 px-4">
          <div className="w-6 h-1.5 rounded-full bg-neutral-800" />
          <div className="w-6 h-1.5 rounded-full bg-neutral-800" />
          <div className="w-6 h-1.5 rounded-full bg-neutral-800" />
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 max-w-3xl text-center text-xs text-neutral-500 space-y-1">
        <p><span className="text-neutral-300">Interact:</span> Drag jog wheels to scratch · Drag knobs vertically · Drag faders · Click pads to trigger sounds</p>
        <p className="text-neutral-600">Press PLAY to start decks — waveforms scroll & jog wheels spin</p>
      </div>
    </div>
  );
}
