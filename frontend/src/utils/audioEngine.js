// Web Audio API based sound engine for DJ pads - routes through djEngine master
import { getEngine } from './djEngine';

function getCtx() {
  const eng = getEngine();
  eng.ensureRunning();
  return { ctx: eng.getContext(), dest: eng.getPadDestination() };
}

export function playKick() {
  const { ctx, dest } = getCtx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(150, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  g.gain.setValueAtTime(1, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  o.connect(g); g.connect(dest);
  o.start(); o.stop(ctx.currentTime + 0.5);
}

export function playSnare() {
  const { ctx, dest } = getCtx();
  const bufferSize = ctx.sampleRate * 0.2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass'; filter.frequency.value = 1000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.7, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  noise.connect(filter); filter.connect(g); g.connect(dest);
  noise.start(); noise.stop(ctx.currentTime + 0.2);
}

export function playHat(open = false) {
  const { ctx, dest } = getCtx();
  const dur = open ? 0.3 : 0.05;
  const bufferSize = ctx.sampleRate * dur;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass'; filter.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.3, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
  noise.connect(filter); filter.connect(g); g.connect(dest);
  noise.start(); noise.stop(ctx.currentTime + dur);
}

export function playTone(freq = 440, duration = 0.3, type = 'sine') {
  const { ctx, dest } = getCtx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime);
  g.gain.setValueAtTime(0.3, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  o.connect(g); g.connect(dest);
  o.start(); o.stop(ctx.currentTime + duration);
}

export function playClap() {
  const { ctx, dest } = getCtx();
  [0, 0.02, 0.04].forEach(delay => {
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = 1500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime + delay);
    g.gain.linearRampToValueAtTime(0.6, ctx.currentTime + delay + 0.005);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.1);
    noise.connect(filter); filter.connect(g); g.connect(dest);
    noise.start(ctx.currentTime + delay);
    noise.stop(ctx.currentTime + delay + 0.1);
  });
}

const padSounds = [
  { name: 'KICK', color: '#ff8a00', fn: playKick },
  { name: 'SNARE', color: '#ffd400', fn: playSnare },
  { name: 'HAT', color: '#00d4ff', fn: () => playHat(false) },
  { name: 'OPEN', color: '#ff2b6b', fn: () => playHat(true) },
  { name: 'CLAP', color: '#a855f7', fn: playClap },
  { name: 'PERC', color: '#22c55e', fn: () => playTone(600, 0.2, 'triangle') },
  { name: 'BASS', color: '#3b82f6', fn: () => playTone(80, 0.4, 'sawtooth') },
  { name: 'FX', color: '#ec4899', fn: () => playTone(1200, 0.3, 'square') },
];

export function playPad(index) { padSounds[index % padSounds.length].fn(); }
export const PAD_META = padSounds;
