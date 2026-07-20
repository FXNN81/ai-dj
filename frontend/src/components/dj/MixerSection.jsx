import React, { useState } from 'react';
import Knob from './Knob';
import Fader from './Fader';

function ChannelStrip({ index, color, onLevelChange }) {
  const [level, setLevel] = useState(75);
  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Trim */}
      <Knob size={26} label="TRIM" color={color} />
      {/* EQ HI */}
      <Knob size={30} label="HI" color={color} />
      {/* EQ MID */}
      <Knob size={30} label="MID" color={color} />
      {/* EQ LOW */}
      <Knob size={30} label="LOW" color={color} />
      {/* Color FX */}
      <Knob size={28} label="COLOR" color={color} />
      {/* CH number */}
      <div className="text-[10px] font-bold text-white font-mono" style={{ color }}>{index}</div>
      {/* Cue button */}
      <button className="w-8 h-3 rounded-sm text-[7px] font-bold" style={{
        background: 'linear-gradient(180deg, #1a1a1a, #050505)',
        color: '#0ea5e9', border: '1px solid #0ea5e988'
      }}>CUE</button>
      {/* Level meter */}
      <div className="w-3 h-24 rounded-sm flex flex-col-reverse gap-[1px] p-[2px]" style={{ background: '#050505', border: '1px solid #1a1a1a' }}>
        {Array.from({ length: 14 }).map((_, i) => {
          const on = i < Math.floor(level / 100 * 14);
          const c = i > 11 ? '#ef4444' : i > 8 ? '#ffd400' : '#22c55e';
          return <div key={i} className="w-full flex-1 rounded-sm" style={{ background: on ? c : '#111', boxShadow: on ? `0 0 3px ${c}` : 'none' }} />;
        })}
      </div>
      {/* Channel fader */}
      <Fader height={90} width={20} value={level} onChange={(v) => { setLevel(v); onLevelChange && onLevelChange(v); }} color="#404040" />
    </div>
  );
}

export default function MixerSection({ children }) {
  const [xf, setXf] = useState(50);
  const channelColors = ['#ff8a00', '#ffd400', '#22c55e', '#00d4ff'];

  return (
    <div className="flex flex-col items-center gap-2 px-2 py-2 rounded-md" style={{
      background: 'linear-gradient(180deg, #0a0a0a, #050505)',
      border: '1px solid #1a1a1a',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)'
    }}>
      {children}

      {/* SOUND COLOR FX label */}
      <div className="text-[7px] text-cyan-400 font-mono tracking-wider">SOUND COLOR FX</div>

      {/* Color FX row */}
      <div className="grid grid-cols-4 gap-1 w-full">
        {['DUB', 'NOISE', 'PITCH', 'FILT'].map((n, i) => (
          <button key={n} className="text-[7px] font-bold py-1 rounded-sm" style={{
            background: '#1a1a1a', color: channelColors[i], border: `1px solid ${channelColors[i]}55`
          }}>{n}</button>
        ))}
      </div>

      {/* Channel strips 3, 1, 2, 4 (as per image ordering) */}
      <div className="grid grid-cols-4 gap-3 mt-1">
        <ChannelStrip index={3} color={channelColors[2]} />
        <ChannelStrip index={1} color={channelColors[0]} />
        <ChannelStrip index={2} color={channelColors[1]} />
        <ChannelStrip index={4} color={channelColors[3]} />
      </div>

      {/* Crossfader */}
      <div className="flex flex-col items-center gap-1 mt-2 w-full">
        <div className="flex justify-between w-full text-[8px] text-neutral-500 font-mono px-1">
          <span>A</span><span>CROSSFADER</span><span>B</span>
        </div>
        <Fader orientation="horizontal" width={180} value={xf} onChange={setXf} />
      </div>

      {/* XDJ-AZ label */}
      <div className="text-[10px] text-neutral-400 font-mono tracking-widest mt-1">XDJ-AZ</div>
    </div>
  );
}
