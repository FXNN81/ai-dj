import React, { useState, useEffect, useRef } from 'react';
import DeckControls from './dj/DeckControls';
import CenterDisplay from './dj/CenterDisplay';
import MixerSection from './dj/MixerSection';
import Knob from './dj/Knob';
import { Volume2, Headphones, Mic, Upload, Circle, Square, Download } from 'lucide-react';
import { getEngine } from '../utils/djEngine';
import SoundCloudSearch from './dj/SoundCloudSearch';

export default function DJVisualizer() {
  const [playA, setPlayA] = useState(false);
  const [playB, setPlayB] = useState(false);
  const [nameA, setNameA] = useState('No track loaded');
  const [nameB, setNameB] = useState('No track loaded');
  const [timeA, setTimeA] = useState(0);
  const [timeB, setTimeB] = useState(0);
  const [durA, setDurA] = useState(0);
  const [durB, setDurB] = useState(0);

  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [recResult, setRecResult] = useState(null); // {url, duration, size}

  const deckARef = useRef(null);
  const deckBRef = useRef(null);
  const fileARef = useRef(null);
  const fileBRef = useRef(null);
  const recTimerRef = useRef(null);

  // Init decks on mount
  useEffect(() => {
    const engine = getEngine();
    if (deckARef.current && !engine.decks.A) {
      engine.createDeck('A', deckARef.current, (ev) => {
        if (ev.type === 'ready') setDurA(ev.deck.duration);
        if (ev.type === 'play') setPlayA(true);
        if (ev.type === 'pause' || ev.type === 'finish') setPlayA(false);
        if (ev.type === 'time') setTimeA(ev.time);
      });
    }
    if (deckBRef.current && !engine.decks.B) {
      engine.createDeck('B', deckBRef.current, (ev) => {
        if (ev.type === 'ready') setDurB(ev.deck.duration);
        if (ev.type === 'play') setPlayB(true);
        if (ev.type === 'pause' || ev.type === 'finish') setPlayB(false);
        if (ev.type === 'time') setTimeB(ev.time);
      });
    }
  }, []);

  const handleFile = async (deck, file) => {
    if (!file) return;
    const engine = getEngine();
    engine.ensureRunning();
    const d = await engine.loadFile(deck, file);
    if (deck === 'A') setNameA(file.name);
    else setNameB(file.name);
  };

  const handleStreamUrl = async (deck, url, displayName) => {
    const engine = getEngine();
    engine.ensureRunning();
    await engine.loadUrl(deck, url, displayName);
    if (deck === 'A') setNameA(displayName);
    else setNameB(displayName);
  };

  const togglePlay = (deck) => {
    getEngine().toggle(deck);
  };
  const cue = (deck) => {
    getEngine().cue(deck);
  };

  const toggleRecord = async () => {
    const engine = getEngine();
    if (!recording) {
      const ok = engine.startRecording();
      if (ok) {
        setRecording(true);
        setRecResult(null);
        setRecTime(0);
        const start = Date.now();
        recTimerRef.current = setInterval(() => setRecTime((Date.now() - start) / 1000), 200);
      }
    } else {
      const res = await engine.stopRecording();
      clearInterval(recTimerRef.current);
      setRecording(false);
      if (res) setRecResult(res);
    }
  };

  const fmtRec = (s) => {
    const m = Math.floor(s / 60);
    const ss = String(Math.floor(s % 60)).padStart(2, '0');
    return `${String(m).padStart(2, '0')}:${ss}`;
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-6 px-4"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #050505 60%, #000 100%)'
      }}
    >
      {/* Title */}
      <div className="mb-3 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-widest">
          <span className="text-neutral-400">AlphaTheta</span> <span className="text-white">XDJ-AZ</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">Interactive DJ Visualizer</p>
      </div>

      {/* Toolbar: file loaders + recording */}
      <div className="w-full max-w-[1200px] flex flex-wrap items-center justify-between gap-2 mb-3 px-2">
        <div className="flex gap-2 items-center">
          <input ref={fileARef} type="file" accept="audio/*" className="hidden" onChange={(e) => handleFile('A', e.target.files?.[0])} />
          <button
            onClick={() => fileARef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-orange-300 hover:text-orange-200 transition-colors"
            style={{ background: 'linear-gradient(180deg, #1a0a05, #0a0a0a)', border: '1px solid #ff8a0066' }}
          >
            <Upload size={12} /> Load Deck A
          </button>
          <input ref={fileBRef} type="file" accept="audio/*" className="hidden" onChange={(e) => handleFile('B', e.target.files?.[0])} />
          <button
            onClick={() => fileBRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
            style={{ background: 'linear-gradient(180deg, #051520, #0a0a0a)', border: '1px solid #00d4ff66' }}
          >
            <Upload size={12} /> Load Deck B
          </button>
        </div>

        <div className="flex gap-2 items-center">
          {recResult && !recording && (
            <a
              href={recResult.url}
              download={`dj-mix-${Date.now()}.webm`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-green-300 hover:text-green-200 transition-colors"
              style={{ background: 'linear-gradient(180deg, #052010, #0a0a0a)', border: '1px solid #22c55e66' }}
            >
              <Download size={12} /> Download Mix ({fmtRec(recResult.duration)}, {(recResult.size / 1024).toFixed(0)}KB)
            </a>
          )}
          <button
            onClick={toggleRecord}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-all"
            style={{
              background: recording
                ? 'linear-gradient(180deg, #ef4444, #7f1d1d)'
                : 'linear-gradient(180deg, #262626, #0a0a0a)',
              border: `1px solid ${recording ? '#ef4444' : '#404040'}`,
              boxShadow: recording ? '0 0 12px #ef444488' : 'none'
            }}
          >
            {recording ? <Square size={12} fill="white" /> : <Circle size={12} fill="#ef4444" color="#ef4444" />}
            {recording ? `Recording ${fmtRec(recTime)}` : 'Record Mix'}
          </button>
        </div>
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
        {/* Top section */}
        <div className="grid grid-cols-3 gap-4 mb-3">
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

          <div>
            <CenterDisplay
              deckARef={deckARef}
              deckBRef={deckBRef}
              deckAName={nameA}
              deckBName={nameB}
              deckATime={timeA}
              deckBTime={timeB}
              deckADuration={durA}
              deckBDuration={durB}
              playingA={playA}
              playingB={playB}
            />
          </div>

          <div className="flex items-center justify-end gap-2 px-2">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-[8px] text-neutral-500 font-mono">MASTER <Volume2 size={9} /></div>
              <div className="flex gap-1 mt-1">
                <Knob size={22} label="MST" color="#22c55e" onChange={(v) => getEngine().setMasterVolume(v)} value={85} />
                <Knob size={22} label="BAL" color="#22c55e" />
                <Knob size={22} label="BOOTH" color="#22c55e" />
              </div>
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

        <div className="flex justify-between px-2 mb-2">
          <div className="text-[10px] font-bold text-neutral-400 italic tracking-wide">AlphaTheta</div>
          <div className="text-[10px] font-bold text-neutral-400 italic tracking-wide">rekordbox <span className="text-neutral-500">|</span> serato</div>
          <div className="text-[10px] font-bold text-neutral-400 italic tracking-wide">USB A · USB B</div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
          <DeckControls
            side="left"
            playing={playA}
            onPlay={() => togglePlay('A')}
            onCue={() => cue('A')}
            onTempo={(v) => getEngine().setPlaybackRate('A', 0.92 + (v / 100) * 0.16)}
            deck="A"
            color="#ff2b6b"
          />
          <MixerSection
            onCrossfaderChange={(v) => getEngine().setCrossfader(v)}
            onLevelChange={(idx, v) => {
              // Channel 1 → Deck A, Channel 2 → Deck B (simplified)
              if (idx === 1) getEngine().setDeckVolume('A', v);
              if (idx === 2) getEngine().setDeckVolume('B', v);
            }}
          />
          <DeckControls
            side="right"
            playing={playB}
            onPlay={() => togglePlay('B')}
            onCue={() => cue('B')}
            onTempo={(v) => getEngine().setPlaybackRate('B', 0.92 + (v / 100) * 0.16)}
            deck="B"
            color="#22c55e"
          />
        </div>

        <div className="flex justify-between mt-3 px-4">
          <div className="w-6 h-1.5 rounded-full bg-neutral-800" />
          <div className="w-6 h-1.5 rounded-full bg-neutral-800" />
          <div className="w-6 h-1.5 rounded-full bg-neutral-800" />
        </div>
      </div>

      <div className="mt-6 max-w-3xl text-center text-xs text-neutral-500 space-y-1">
        <p><span className="text-neutral-300">1.</span> Load audio files on Deck A & B · <span className="text-neutral-300">2.</span> Press PLAY · <span className="text-neutral-300">3.</span> Mix with crossfader & channel faders · <span className="text-neutral-300">4.</span> Trigger pads · <span className="text-neutral-300">5.</span> Hit Record to capture your mix</p>
        <p className="text-neutral-600">Drag jog wheels · Drag knobs vertically · Click on the waveform to seek · Adjust tempo faders (±8%)</p>
      </div>
    </div>
  );
}
