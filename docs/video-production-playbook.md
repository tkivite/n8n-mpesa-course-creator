# Video Production Playbook : n8n M-Pesa Mastery

This is the single-file operational guide for producing the course videos from script to upload.

Use it together with:

- `docs/scripts/README.md`
- `docs/scripts/`
- `docs/course-owner-checklist.md`

---

## 1. Production goal

The goal is to produce lessons that feel:

- clear
- practical
- calm
- premium
- credible to Kenyan developers, founders, and agencies

This course should feel like a **real implementation course**, not a motivational info product.

---

## 2. Final product positioning

### Course name

`n8n M-Pesa Mastery`

### Subtitle

`Build Production-Ready STK Push Payment Workflows - No Backend code`

### Tiers

`Starter · Pro · Agency`

Keep this naming consistent in:

- intro cards
- lesson title cards
- PDF covers
- thumbnails
- captions
- sales page copy

---

## 3. Recommended production stack

### Recording

- OBS Studio or Screen Studio
- Chrome browser
- clean desktop with minimal notifications
- 1080p resolution minimum
- large browser zoom for legibility

### Audio / voiceover

Choose one path:

#### Option A : AI voiceover

- ElevenLabs
- Murf
- PlayHT

Use the extracted files in:

- `docs/scripts/voiceover/`

#### Option B : Your own voice

- decent USB mic
- quiet room
- pop filter if available
- light compression / noise cleanup in post

### Editing

- CapCut
- DaVinci Resolve
- Screen Studio output + simple NLE

### Graphics / diagrams

- Canva
- Figma
- Mermaid exports from `docs/diagrams/`

---

## 4. Pre-recording checklist

### Workspace

- [ ] Quiet environment
- [ ] Phone on silent
- [ ] Slack / email notifications disabled
- [ ] Browser tabs pre-opened
- [ ] Terminal font readable
- [ ] n8n instance already running if needed
- [ ] Postman already installed and logged in if needed

### Visual consistency

- [ ] Use one browser theme consistently
- [ ] Use one terminal theme consistently
- [ ] Use the same zoom level across lessons
- [ ] Keep your cursor visible and easy to follow
- [ ] Keep brand wording consistent with the final title and subtitle

### Demo readiness

- [ ] All needed workflows imported
- [ ] `.env` already prepared
- [ ] Daraja sandbox credentials available
- [ ] Postman collection imported
- [ ] test phone available for live STK prompt demos
- [ ] ngrok or public callback URL prepared for callback lessons

---

## 5. Source-of-truth files during production

### Lesson direction

Use the markdown lesson files in:

- `docs/scripts/`

These contain:

- `[VO]`
- `[SCREEN]`
- `[ON-SCREEN TEXT]`
- `[B-ROLL]`
- recording checklist per module

### Voiceover source

Use:

- `docs/scripts/voiceover/`

These are already prepared for TTS paste-in and include pauses.

### Course-owner readiness

Use:

- `docs/course-owner-checklist.md`

### Shared visuals

Use:

- `docs/diagrams/`

---

## 6. Production workflow per lesson

### Step 1 : Review the lesson script

Before recording anything:

- read the lesson markdown once end-to-end
- confirm the on-screen flow makes sense
- identify where you need:
  - n8n open
  - terminal open
  - Postman open
  - browser open
  - diagrams or callouts

### Step 2 : Generate or record voiceover

If using TTS:

- open the matching `.txt` in `docs/scripts/voiceover/`
- paste into ElevenLabs
- generate MP3
- listen once for pronunciation errors
- regenerate if needed

If recording your own voice:

- record from the `[VO]` sections only
- keep pace steady
- aim for calm technical instruction, not hype

### Step 3 : Record screen

Record only what the student needs to see.

Rules:

- one clear action at a time
- slow cursor movement
- zoom browser where needed
- pause slightly before each important click
- avoid unnecessary tab switching

### Step 4 : Edit

In the edit:

- sync screen to voiceover
- trim dead air
- add title card
- add lower-third or section marker if helpful
- add diagrams where explanation would otherwise be too abstract
- add on-screen text from the script where needed

### Step 5 : Captions

- auto-generate captions
- review technical words manually
- correct terms like:
  - M-Pesa
  - Daraja
  - shortcode
  - passkey
  - webhook
  - Postman
  - STK Push

### Step 6 : Export

Target:

- 1920×1080
- H.264
- clear spoken audio
- filenames that match lesson order

---

## 7. File naming convention

Keep exported files predictable.

### Suggested lesson filenames

```text
M00-L01-welcome.mp4
M01-L01-what-is-n8n.mp4
M01-L02-self-hosted-vs-cloud.mp4
M01-L03-installing-n8n-locally.mp4
...
M10-L03-white-label-and-scale.mp4
```

### Suggested audio filenames

```text
M01-L03-installing-n8n-locally-voiceover.mp3
```

### Suggested thumbnail filenames

```text
thumbnail-main-course.png
thumbnail-module-04.png
```

---

## 8. Pronunciation guide

Use these to keep AI or human narration consistent.

- **n8n** → “n-eight-n”
- **M-Pesa** → “em-pesa”
- **Daraja** → “da-ra-ja”
- **STK** → say each letter or “STK prompt” naturally
- **OAuth** → “oh-auth” or “o-auth”, but stay consistent
- **JSON** → “jay-son”
- **Postgres** → “post-gres” or “postgres”, but stay consistent
- **Webhook** → “web-hook”

---

## 9. Visual style rules

### Keep the screen clean

- do not leave password values visible
- blur or mask real credentials
- use sandbox credentials in demos whenever possible
- avoid cluttered desktops

### Keep pacing beginner-safe

- narrate why, not just how
- pause after important steps
- show file paths clearly
- do not jump over setup assumptions

### Keep the product premium

- use consistent title-card style
- use consistent accent color
- use consistent lesson naming
- keep audio level balanced across all exports

---

## 10. Lesson-level checklist

For every lesson:

- [ ] Script reviewed
- [ ] Voiceover generated or recorded
- [ ] Screen footage recorded
- [ ] Captions corrected
- [ ] Export complete
- [ ] Filename matches naming convention
- [ ] Uploaded to course platform
- [ ] Lesson title matches script title

---

## 11. Module-level checklist

For every module:

- [ ] All lessons exported
- [ ] Lesson order verified
- [ ] Intro / outro naming consistent
- [ ] Downloads referenced in video actually exist
- [ ] Any mentioned files are present in the consumer repo
- [ ] Any creator-only references are removed from student videos

---

## 12. Course-level QA before publish

- [ ] Watch lesson 1 with fresh eyes
- [ ] Watch one lesson from the middle
- [ ] Watch one lesson from the end
- [ ] Confirm audio quality is consistent
- [ ] Confirm title/subtitle branding is consistent
- [ ] Confirm tier names are consistent
- [ ] Confirm references to repo names are correct
- [ ] Confirm students on macOS, Windows, and Linux are covered

---

## 13. Common production mistakes to avoid

- recording at tiny browser zoom
- moving too fast through terminal commands
- reading code without explaining intent
- leaving private repo internals in consumer-facing lessons
- saying “no code” in a way that over-promises zero technical setup
- changing naming conventions mid-course
- referencing files that only exist in the creator repo when talking to students

---

## 14. Recommended production order

To reduce confusion and rework:

1. Module 0
2. Module 1
3. Module 2
4. Module 3
5. Module 4
6. Module 5
7. Module 6
8. Module 7
9. Module 8
10. Module 9
11. Module 10

This keeps the examples in the same order students experience them.

---

## 15. Fast-start production routine

If you just want to move fast:

### Daily routine

- pick one module
- generate all voiceovers for that module
- record all screen footage for that module
- edit all lessons for that module
- export all lessons for that module
- mark the module complete in `docs/course-owner-checklist.md`

This reduces context switching and makes the course feel more consistent.

