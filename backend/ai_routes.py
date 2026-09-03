"""AI-powered Smart Track Selection using Claude Sonnet 4.6 via Emergent LLM Key."""
import os
import json
import uuid
from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter(prefix="/api/ai", tags=["ai"])

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")


class Track(BaseModel):
    id: int
    title: str
    user: str = ""
    genre: str = ""
    duration: int = 0


class SelectRequest(BaseModel):
    current_track: Track | None = None
    candidates: List[Track]
    vibe: str = "energetic"  # optional user hint: chill, energetic, peak-time, wind-down


class SelectResponse(BaseModel):
    next_track_id: int
    reason: str
    ranked_ids: List[int]


@router.post("/select-next", response_model=SelectResponse)
async def select_next(req: SelectRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(500, "EMERGENT_LLM_KEY not configured")
    if not req.candidates:
        raise HTTPException(400, "No candidates provided")

    current = req.current_track
    cand_lines = "\n".join([
        f"- ID {t.id}: \"{t.title}\" by {t.user} [{t.genre or 'unknown'}] ({t.duration//1000}s)"
        for t in req.candidates
    ])
    current_line = f"Now playing: \"{current.title}\" by {current.user} [{current.genre or 'unknown'}]" if current else "No track currently playing (this is the opener)."

    system = (
        "You are an expert DJ AI. Given the currently playing track and a list of candidate tracks, "
        "choose the BEST next track for a smooth DJ transition. Consider: genre match, energy flow, "
        "tempo compatibility, vibe progression, and avoiding jarring changes. "
        "Return ONLY valid JSON with keys: next_track_id (int), reason (short string, max 20 words), "
        "ranked_ids (list of ALL candidate IDs from best to worst match)."
    )
    prompt = (
        f"{current_line}\n\n"
        f"User vibe preference: {req.vibe}\n\n"
        f"Candidate tracks:\n{cand_lines}\n\n"
        f"Respond with JSON only, no markdown, no extra text."
    )

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"dj-select-{uuid.uuid4()}",
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-6")

    try:
        response = await chat.send_message(UserMessage(text=prompt))
        # Strip potential markdown fences
        text = response.strip()
        if text.startswith("```"):
            text = text.strip("`").split("\n", 1)[-1].rsplit("```", 1)[0].strip()
            if text.startswith("json"):
                text = text[4:].strip()
        data = json.loads(text)
        return SelectResponse(
            next_track_id=int(data["next_track_id"]),
            reason=str(data.get("reason", "AI selected")),
            ranked_ids=[int(x) for x in data.get("ranked_ids", [])],
        )
    except Exception as e:
        # Fallback: return first candidate
        return SelectResponse(
            next_track_id=req.candidates[0].id,
            reason=f"AI fallback ({str(e)[:40]})",
            ranked_ids=[t.id for t in req.candidates],
        )
