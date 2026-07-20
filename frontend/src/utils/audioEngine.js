// Web Audio API based sound engine for DJ pads and playback
let ctx = null;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Synthesized drum sounds
export function playKick() {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.frequency.setValueAtTime(150, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(0.01, c.currentTime + 0.5);
  g.gain.setValueAtTime(1, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.5);
  o.connect(g); g.connect(c.destination);
  o.start(); o.stop(c.currentTime + 0.5);
}

export function playSnare() {
  const c = getCtx();
  const bufferSize = c.sampleRate * 0.2;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'highpass'; filter.frequency.value = 1000;
  const g = c.createGain();
  g.gain.setValueAtTime(0.7, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.2);
  noise.connect(filter); filter.connect(g); g.connect(c.destination);
  noise.start(); noise.stop(c.currentTime + 0.2);
}

export function playHat(open = false) {
  const c = getCtx();
  const bufferSize = c.sampleRate * (open ? 0.3 : 0.05);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'highpass'; filter.frequency.value = 7000;
  const g = c.createGain();
  g.gain.setValueAtTime(0.3, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + (open ? 0.3 : 0.05));
  noise.connect(filter); filter.connect(g); g.connect(c.destination);
  noise.start(); noise.stop(c.currentTime + (open ? 0.3 : 0.05));
}

export function playTone(freq = 440, duration = 0.3, type = 'sine') {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime);
  g.gain.setValueAtTime(0.3, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + duration);
  o.connect(g); g.connect(c.destination);
  o.start(); o.stop(c.currentTime + duration);
}

export function playClap() {
  const c = getCtx();
  [0, 0.02, 0.04].forEach(delay => {
    const bufferSize = c.sampleRate * 0.08;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = c.createBufferSource();
    noise.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = 1500;
    const g = c.createGain();
    g.gain.setValueAtTime(0, c.currentTime + delay);
    g.gain.linearRampToValueAtTime(0.6, c.currentTime + delay + 0.005);
    g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + delay + 0.1);
    noise.connect(filter); filter.connect(g); g.connect(c.destination);
    noise.start(c.currentTime + delay);
    noise.stop(c.currentTime + delay + 0.1);
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

export function playPad(index) {
  const p = padSounds[index % padSounds.length];
  p.fn();
}

export const PAD_META = padSounds;
