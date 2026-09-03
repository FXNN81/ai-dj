import WaveSurfer from 'wavesurfer.js';

class DJEngine {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;
    this.masterGain.connect(this.ctx.destination);

    // Recording routing (parallel to speakers)
    this.streamDest = this.ctx.createMediaStreamDestination();
    this.masterGain.connect(this.streamDest);
    this.recorder = null;
    this.recChunks = [];
    this.recStart = 0;

    // Pad bus (so pads also route through master)
    this.padBus = this.ctx.createGain();
    this.padBus.gain.value = 0.9;
    this.padBus.connect(this.masterGain);

    this.decks = { A: null, B: null };
    this.xfaderValue = 0.5;
  }

  ensureRunning() {
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  createDeck(id, container, onEvent) {
    if (this.decks[id]) return this.decks[id];
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    const source = this.ctx.createMediaElementSource(audio);
    const gain = this.ctx.createGain();
    gain.gain.value = 0.85;
    const xfaderGain = this.ctx.createGain();
    const norm = this.xfaderValue;
    xfaderGain.gain.value = id === 'A' ? Math.cos(norm * Math.PI / 2) : Math.sin(norm * Math.PI / 2);
    source.connect(gain);
    gain.connect(xfaderGain);
    xfaderGain.connect(this.masterGain);

    const ws = WaveSurfer.create({
      container,
      waveColor: id === 'A' ? '#ff8a00' : '#00d4ff',
      progressColor: id === 'A' ? '#ffd400' : '#3b82f6',
      height: 46,
      barWidth: 2,
      barGap: 1,
      barRadius: 1,
      cursorColor: '#ff2b6b',
      cursorWidth: 2,
      media: audio,
      normalize: true,
      interact: true,
    });

    const deck = { id, audio, source, gain, xfaderGain, ws, playing: false, loaded: false, filename: '', duration: 0 };
    ws.on('ready', () => {
      deck.loaded = true;
      deck.duration = ws.getDuration();
      onEvent && onEvent({ type: 'ready', deck });
    });
    ws.on('play', () => { deck.playing = true; onEvent && onEvent({ type: 'play', deck }); });
    ws.on('pause', () => { deck.playing = false; onEvent && onEvent({ type: 'pause', deck }); });
    ws.on('finish', () => { deck.playing = false; onEvent && onEvent({ type: 'finish', deck }); });
    ws.on('timeupdate', (t) => { onEvent && onEvent({ type: 'time', deck, time: t }); });

    this.decks[id] = deck;
    return deck;
  }

  async loadFile(id, file) {
    const deck = this.decks[id];
    if (!deck) return null;
    const url = URL.createObjectURL(file);
    deck.filename = file.name;
    deck.loaded = false;
    await deck.ws.load(url);
    return deck;
  }

  async loadUrl(id, streamUrl, displayName = 'Streamed track') {
    const deck = this.decks[id];
    if (!deck) return null;
    deck.filename = displayName;
    deck.loaded = false;
    await deck.ws.load(streamUrl);
    return deck;
  }

  toggle(id) {
    this.ensureRunning();
    const deck = this.decks[id];
    if (!deck || !deck.loaded) return false;
    if (deck.playing) deck.ws.pause();
    else deck.ws.play();
    return !deck.playing;
  }

  cue(id) {
    const deck = this.decks[id];
    if (!deck || !deck.loaded) return;
    deck.ws.pause();
    deck.ws.seekTo(0);
  }

  setDeckVolume(id, v) {
    const deck = this.decks[id];
    if (!deck) return;
    deck.gain.gain.value = v / 100;
  }

  setPlaybackRate(id, rate) {
    const deck = this.decks[id];
    if (!deck) return;
    try { deck.ws.setPlaybackRate(rate, true); } catch { deck.audio.playbackRate = rate; }
  }

  setCrossfader(v) {
    const norm = v / 100;
    this.xfaderValue = norm;
    if (this.decks.A) this.decks.A.xfaderGain.gain.value = Math.cos(norm * Math.PI / 2);
    if (this.decks.B) this.decks.B.xfaderGain.gain.value = Math.sin(norm * Math.PI / 2);
  }

  setMasterVolume(v) { this.masterGain.gain.value = v / 100; }

  startRecording() {
    this.ensureRunning();
    if (this.recorder && this.recorder.state === 'recording') return false;
    this.recChunks = [];
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');
    this.recorder = new MediaRecorder(this.streamDest.stream, mime ? { mimeType: mime } : undefined);
    this.recorder.ondataavailable = e => { if (e.data.size > 0) this.recChunks.push(e.data); };
    this.recorder.start(500);
    this.recStart = Date.now();
    return true;
  }

  stopRecording() {
    return new Promise(resolve => {
      if (!this.recorder || this.recorder.state === 'inactive') return resolve(null);
      this.recorder.onstop = () => {
        const blob = new Blob(this.recChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        resolve({ url, blob, duration: (Date.now() - this.recStart) / 1000, size: blob.size });
      };
      this.recorder.stop();
    });
  }

  isRecording() { return this.recorder && this.recorder.state === 'recording'; }

  getPadDestination() { return this.padBus; }
  getContext() { return this.ctx; }
}

let instance = null;
export function getEngine() {
  if (!instance) instance = new DJEngine();
  return instance;
}
