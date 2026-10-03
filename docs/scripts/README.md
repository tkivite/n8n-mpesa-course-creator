# Voiceover Scripts : Modules 0–2

Scripts here are **recording-ready**: paste the `[VO]` blocks straight into ElevenLabs / Murf / your voice tool. The `[SCREEN]` blocks are director notes — what should be visible on screen while the voiceover plays.

## Format legend

| Tag | Meaning |
|---|---|
| `[VO]` | Spoken narration. Copy only this text to your TTS tool. |
| `[SCREEN]` | What to record / show. Director note only — do NOT voice. |
| `[PAUSE 1s]` | Silence. Do not speak. In ElevenLabs, use `<break time="1s" />`. |
| `[B-ROLL]` | Overlay footage / animation / zoom suggestion. |
| `[ON-SCREEN TEXT]` | Caption / lower-third / callout text burned into the video. |

## Pacing targets

- **~150 words per minute** for narration (ElevenLabs default)
- Each lesson = **5–10 minutes** of final video
- One concept per lesson — if it feels crammed, split it

## Pre-recording checklist

- [ ] n8n running locally at `http://localhost:5678`
- [ ] Browser zoomed to 110% so UI is readable at 1080p
- [ ] Dark/light theme chosen and consistent across all lessons
- [ ] OBS set to 1920×1080 @ 60fps, 15 Mbps bitrate
- [ ] Cursor highlighting enabled (ScreenStudio or Mousepose)
- [ ] Macro recorder loaded (Keyboard Maestro) for repeated clicks
- [ ] Phone silenced, Slack/Mail quit

## Rendering workflow (per lesson)

1. **Paste `[VO]` blocks into ElevenLabs** → generate MP3
2. **Record screen** following `[SCREEN]` cues → MP4 silent
3. **Combine in CapCut / DaVinci Resolve** — align voice to screen, add `[ON-SCREEN TEXT]` callouts and `[B-ROLL]` overlays
4. **Auto-caption** with CapCut (burn-in white text with black outline)
5. **Export** 1920×1080, H.264, CRF 20

## Scripts in this folder

- `module-0-welcome.md` — ~4 min, course overview + what you'll build
- `module-1-intro-to-n8n.md` — split into 6 lessons (~45 min total)
- `module-2-daraja-api.md` — split into 7 lessons (~40 min total)
- `module-3-oauth.md` — split into 3 lessons (~25 min total)
- `module-4-stk-push.md` — split into 7 lessons (~60 min total)
- `module-5-callback.md` — split into 5 lessons (~45 min total)
- `module-6-reconciliation.md` — split into 4 lessons (~30 min total)
- `module-7-production.md` — split into 5 lessons (~40 min total)
- `module-8-use-cases.md` — split into 5 lessons (~45 min total)
- `module-9-beyond-stk.md` — split into 4 lessons (~30 min total)
- `module-10-selling.md` — split into 3 lessons (~20 min total)

**Total: ~6.5 hours of narration.**

