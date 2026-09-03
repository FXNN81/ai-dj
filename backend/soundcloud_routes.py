"""SoundCloud grey-zone integration: extracts public Web Client-ID and proxies API v2."""
import re
import time
import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api/soundcloud", tags=["soundcloud"])

_CID_CACHE = {"cid": None, "ts": 0}
_CID_TTL = 3600  # refresh hourly

async def _extract_client_id() -> str:
    now = time.time()
    if _CID_CACHE["cid"] and (now - _CID_CACHE["ts"]) < _CID_TTL:
        return _CID_CACHE["cid"]

    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
        r = await client.get("https://soundcloud.com/", headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0"
        })
        r.raise_for_status()
        html = r.text
        # find all script srcs
        scripts = re.findall(r'<script[^>]+src="(https://[^"]+\.js)"', html)
        # Reverse: often the last few scripts hold client_id
        for src in reversed(scripts):
            try:
                sr = await client.get(src)
                m = re.search(r'client_id[:=]"([A-Za-z0-9]{32})"', sr.text)
                if m:
                    _CID_CACHE["cid"] = m.group(1)
                    _CID_CACHE["ts"] = now
                    return m.group(1)
            except Exception:
                continue
    raise HTTPException(500, "Could not extract SoundCloud client_id")


@router.get("/search")
async def search(q: str = Query(..., min_length=1), limit: int = 20):
    cid = await _extract_client_id()
    url = "https://api-v2.soundcloud.com/search/tracks"
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(url, params={"q": q, "client_id": cid, "limit": limit})
        if r.status_code != 200:
            raise HTTPException(r.status_code, "SoundCloud search failed")
        data = r.json()
    items = []
    for t in data.get("collection", []):
        if t.get("kind") != "track":
            continue
        artwork = (t.get("artwork_url") or (t.get("user") or {}).get("avatar_url") or "").replace("large", "t300x300")
        items.append({
            "id": t.get("id"),
            "title": t.get("title"),
            "user": (t.get("user") or {}).get("username"),
            "duration": t.get("duration"),
            "artwork": artwork,
            "permalink": t.get("permalink_url"),
            "genre": t.get("genre"),
            "playback_count": t.get("playback_count"),
        })
    return {"results": items}


@router.get("/stream/{track_id}")
async def stream(track_id: int):
    """Returns a direct progressive MP3 URL for a given track_id."""
    cid = await _extract_client_id()
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(f"https://api-v2.soundcloud.com/tracks/{track_id}",
                             params={"client_id": cid})
        if r.status_code != 200:
            raise HTTPException(r.status_code, "Track not found")
        track = r.json()
        transcodings = ((track.get("media") or {}).get("transcodings")) or []
        # Prefer progressive MP3
        prog = next((t for t in transcodings if (t.get("format") or {}).get("protocol") == "progressive"), None)
        if not prog:
            prog = transcodings[0] if transcodings else None
        if not prog:
            raise HTTPException(404, "No stream available")
        r2 = await client.get(prog["url"], params={"client_id": cid})
        if r2.status_code != 200:
            raise HTTPException(r2.status_code, "Stream URL fetch failed")
        return {"stream_url": r2.json().get("url"), "protocol": (prog.get("format") or {}).get("protocol")}
