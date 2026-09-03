import React, { useState } from 'react';
import { Sparkles, Loader2, Music, TrendingUp } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AISmartSelect({ candidates, currentTrack, onLoadDeck }) {
  const [vibe, setVibe] = useState('energetic');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const askAI = async () => {
    if (!candidates || candidates.length === 0) {
      alert('Please search for tracks first — AI needs candidates!');
      return;
    }
    setLoading(true);
    setSuggestion(null);
    try {
      const payload = {
        current_track: currentTrack || null,
        candidates: candidates.map(t => ({
          id: t.id,
          title: t.title || '',
          user: t.user || '',
          genre: t.genre || '',
          duration: t.duration || 0,
        })),
        vibe,
      };
      const r = await fetch(`${API}/ai/select-next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error('AI request failed');
      const data = await r.json();
      const pick = candidates.find(t => t.id === data.next_track_id);
      setSuggestion({ track: pick, reason: data.reason, ranked: data.ranked_ids });
    } catch (e) {
      alert('AI selection failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPick = async (deck) => {
    if (!suggestion?.track) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/soundcloud/stream/${suggestion.track.id}`);
      const { stream_url } = await r.json();
      onLoadDeck(deck, stream_url, `${suggestion.track.title} — ${suggestion.track.user}`);
    } catch { alert('Load failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-[1200px] mb-3 px-2">
      <div className="rounded-md p-2.5"
        style={{ background: 'linear-gradient(90deg, #0f0520, #051a1a)', border: '1px solid #a855f766' }}>
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles size={16} className="text-purple-400" />
          <span className="text-sm font-bold text-purple-300">Claude Smart Select</span>
          <span className="text-[10px] text-neutral-500">— AI picks best next track from your search results</span>
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[10px] text-neutral-400">Vibe:</span>
            <select value={vibe} onChange={e => setVibe(e.target.value)}
              className="px-2 py-1 rounded text-[10px] bg-black text-white border border-purple-800">
              <option>chill</option>
              <option>energetic</option>
              <option>peak-time</option>
              <option>wind-down</option>
              <option>afro-groove</option>
              <option>uplifting</option>
            </select>
            <button onClick={askAI} disabled={loading || !candidates?.length}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold text-white disabled:opacity-40"
              style={{ background: 'linear-gradient(180deg, #a855f7, #6b21a8)' }}>
              {loading ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
              Ask Claude
            </button>
          </div>
        </div>

        {suggestion && suggestion.track && (
          <div className="mt-2 p-2 rounded" style={{ background: 'linear-gradient(90deg, #1a0530, #050510)', border: '1px solid #a855f733' }}>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">AI Pick</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              {suggestion.track.artwork ? (
                <img src={suggestion.track.artwork} alt="" className="w-10 h-10 rounded-sm object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-sm bg-neutral-800 flex items-center justify-center"><Music size={16} className="text-neutral-500" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate font-medium">{suggestion.track.title}</div>
                <div className="text-[10px] text-neutral-400 truncate">{suggestion.track.user} · {suggestion.track.genre || 'unknown'}</div>
              </div>
              <button onClick={() => loadPick('A')}
                className="px-2 py-1 rounded text-[10px] font-bold text-orange-300"
                style={{ background: '#1a0a05', border: '1px solid #ff8a0066' }}>→ A</button>
              <button onClick={() => loadPick('B')}
                className="px-2 py-1 rounded text-[10px] font-bold text-cyan-300"
                style={{ background: '#051520', border: '1px solid #00d4ff66' }}>→ B</button>
            </div>
            <div className="mt-1.5 text-[10px] text-purple-200 italic">💭 "{suggestion.reason}"</div>
          </div>
        )}
      </div>
    </div>
  );
}
