import React, { useState } from 'react';
import { Search, Loader2, Music } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api/soundcloud`;

export default function SoundCloudSearch({ onLoadDeck }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState('');

  const search = async (e) => {
    e && e.preventDefault();
    if (!q.trim()) return;
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/search?q=${encodeURIComponent(q)}&limit=15`);
      if (!r.ok) throw new Error('Search failed');
      const data = await r.json();
      setResults(data.results || []);
    } catch (err) {
      setError('Search failed. Try again.');
    } finally { setLoading(false); }
  };

  const loadTrack = async (track, deck) => {
    setLoadingId(track.id + deck);
    try {
      const r = await fetch(`${API}/stream/${track.id}`);
      if (!r.ok) throw new Error();
      const { stream_url } = await r.json();
      onLoadDeck(deck, stream_url, `${track.title} — ${track.user}`);
    } catch {
      alert('Could not load track (may be a Go+ track).');
    } finally { setLoadingId(null); }
  };

  const fmt = (ms) => {
    const s = Math.floor((ms || 0) / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-[1200px] mb-3 px-2">
      <form onSubmit={search} className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search SoundCloud tracks…"
            className="w-full pl-9 pr-3 py-2 rounded-md text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none"
            style={{ background: 'linear-gradient(180deg, #0a0a0a, #050505)', border: '1px solid #262626' }}
          />
        </div>
        <button type="submit" disabled={loading}
          className="px-4 py-2 rounded-md text-xs font-bold text-white transition-all"
          style={{ background: 'linear-gradient(180deg, #f97316, #b25e00)', border: '1px solid #7a3f00' }}
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : 'SoundCloud'}
        </button>
      </form>

      {error && <div className="text-xs text-red-400 mt-2">{error}</div>}

      {results.length > 0 && (
        <div className="mt-2 rounded-md overflow-hidden max-h-[280px] overflow-y-auto"
          style={{ background: '#050505', border: '1px solid #1a1a1a' }}>
          {results.map(t => (
            <div key={t.id} className="flex items-center gap-2 px-2 py-1.5 border-b border-neutral-900 hover:bg-neutral-900/50">
              {t.artwork ? (
                <img src={t.artwork} alt="" className="w-9 h-9 rounded-sm object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-sm flex items-center justify-center bg-neutral-800"><Music size={14} className="text-neutral-500" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-neutral-100 truncate font-medium">{t.title}</div>
                <div className="text-[10px] text-neutral-500 truncate">
                  {t.user} · {fmt(t.duration)} {t.genre ? `· ${t.genre}` : ''}
                </div>
              </div>
              <button
                onClick={() => loadTrack(t, 'A')}
                disabled={loadingId === t.id + 'A'}
                className="px-2 py-1 rounded text-[10px] font-bold text-orange-300 transition-colors"
                style={{ background: '#1a0a05', border: '1px solid #ff8a0066' }}
              >{loadingId === t.id + 'A' ? '…' : '→ A'}</button>
              <button
                onClick={() => loadTrack(t, 'B')}
                disabled={loadingId === t.id + 'B'}
                className="px-2 py-1 rounded text-[10px] font-bold text-cyan-300 transition-colors"
                style={{ background: '#051520', border: '1px solid #00d4ff66' }}
              >{loadingId === t.id + 'B' ? '…' : '→ B'}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
