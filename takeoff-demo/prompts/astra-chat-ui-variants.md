# Astra prompt — Takeoff demo in ChatGPT-style and Claude-style chat UIs

Generate **two** silent product-demo videos of the same 58-second story. Same script, same pacing, same six purchase cards. The only thing that changes between the two videos is the chat shell they live in.

Reference for style and pacing: `takeoff-demo/public/videos/demov1-plumb.mp4` (58 s, 1080×1920, 30 fps, silent). Match its rhythm: one card per scene, every state change held at least 500 ms, springs not eases, numbers roll, nothing bounces more than once.

Do not reproduce the iMessage look from the reference. Replace it entirely.

## Output

- `takeoff-chatgpt.mp4` and `takeoff-claude.mp4`
- 1080×1920, 30 fps, H.264, 58 s, no audio track, no captions, no voice-over, no music
- Full-bleed app screen. No phone bezel, no hands, no cursor. Taps are a 24 pt grey dot that pulses once and fades in 200 ms.
- Each scene opens with a monospace label in the top-left for 1.2 s: `Takeoff`, `Sample`, `Lead time`, `Substitution`, `Sign-off`, `Order thread`.

## The two shells

Recreate the layout idiom of each assistant from memory. No logos, no wordmarks, no app icons, no product names on screen. A viewer should recognise the shell from spacing, type, and composer shape alone.

**Video 1 — ChatGPT-style**
- Light mode. Pure white canvas, `#0D0D0D` text.
- User messages: right-aligned pill, `#F4F4F4` fill, 20 pt radius, no tail.
- Assistant messages: no bubble. Plain text, left-aligned, full width, small circular avatar at left with a neutral glyph (no logo).
- Composer: single rounded field pinned to the bottom, 24 pt radius, thin `#E5E5E5` border, `+` at left, black circular send button with an up arrow at right.
- Top bar: centred model name replaced by a neutral label `Assistant ▾`; hamburger left, new-chat icon right.
- Font: Inter or system sans, 17 pt body.
- Streaming: assistant text appears word by word with a small blinking block cursor, 40 ms per word, then the card slides up beneath the finished sentence.

**Video 2 — Claude-style**
- Light mode. Warm off-white canvas `#F5F4EE`, `#1F1E1B` text.
- User messages: right-aligned, muted `#E8E6DF` fill, 18 pt radius, no tail.
- Assistant messages: no bubble. Serif for the assistant's prose (Georgia or a similar transitional serif), 18 pt; sans for everything inside cards.
- Composer: tall rounded field at the bottom, 20 pt radius, hairline border, `+` at left, small square terracotta send button at right. Under the field, a small neutral `Model ▾` selector — no product names.
- Top bar: minimal; back chevron left, conversation title `Bathroom` centred in serif, `···` right.
- Streaming: assistant text appears in phrase-sized chunks, 120 ms per chunk, no cursor, then the card fades and rises beneath it.

## Purchase cards — identical in both videos

- White surface, 16 pt radius, 1 pt hairline `rgba(0,0,0,0.12)`, 20 pt inner padding.
- One accent: clay orange `#D9552B`. Use it only for the empty "not listed" field, the waste note, and the lead-time failure. Green `#2E7D4F` only for approvals.
- System sans inside cards regardless of shell. Numbers tabular.
- Cards render inline in the assistant's turn, directly under its sentence. After the user acts on a card, it collapses to a one-line chip with a check mark.

## Script and timing (58 s)

Maya types in lowercase. Assistant replies are under 12 words.

**0:00–0:04 — Ask**
- Thread already shows: `The bathroom plan is saved.`
- Maya: `how much tile do i need for the bathroom floor`
- Assistant streams: `I have the room from your plan. Which tile?`
- Maya sends a tile photo. Assistant: `3×9 Puget Sound gloss. Here's the takeoff.`

**0:04–0:13 — Takeoff** (label `Takeoff`)
- Card: `Takeoff · Bathroom floor`. Room 2.1 × 2.7 m. Area `61 ft²`. Layout `Straight`. Waste `10%`. Order `67 ft²`.
- Result rolls in: `7 boxes · 73.5 ft²` then `$1,397`. Small orange line: `Waste shown, not hidden.`
- Segmented control `Straight | Herringbone | Diagonal`. Tap `Herringbone` at 0:09. Waste rolls to `15%`, boxes roll to `8`, price rolls to `$1,596`. Grey note: `+1 box layout allowance · separate from waste`.
- Tap `Add to plan` at 0:12. Card collapses to chip `✓ Tile · 8 boxes · Added`.

**0:13–0:19 — Sample** (label `Sample`)
- Maya: `can i see it first`
- Assistant: `Yes. One sample, arrives Wednesday.`
- Card: `Sample · Puget Sound gloss`, one tile image, `Free`, `Arrives Wed 17 Sept`, button `Order sample`. Tap. Chip `✓ Sample · Arrives Wed`.

**0:19–0:28 — Lead time** (label `Lead time`)
- Maya: `plumber comes oct 12. will everything be here`
- Assistant: `Tile is close. Pendant is not.`
- Card: `Lead time · Bathroom`, horizontal timeline `14 Sept → 20 Oct`, dashed vertical line `Plumber · 12 Oct`.
- Bars draw left to right: `Tile · 3–5 wks` (5–19 Oct, crosses the plumber line — bar turns light orange, note `Plumber date at risk`), `Vanity · 2 wks`, `Mirror · in stock`.
- At 0:25 `Pendant · 8 wks` draws past the right edge, turns orange, text `Lands 9 Nov · after the plumber. Not OK.`

**0:28–0:38 — Substitution** (label `Substitution`)
- Assistant: `This pendant is delayed. Here's one that's in stock.`
- Card: `Spec · Pendant`, two columns `Specified | Substitute`. Rows land one per 750 ms: Drop `18 in | 18 in`; Clearance `Passes | Passes` (sub-note `30 in required · 34 in vanity top`); Finish `Brass | Brass`; Lead time `8 wks | In stock`; Colour temp `2700K | ` — the substitute cell is empty, dashed orange border, no text. Hold it 2 s.
- Buttons `Ask supplier` / `Use substitute`. Tap `Use substitute` at 0:36.

**0:38–0:47 — Sign-off** (label `Sign-off`)
- Assistant: `Needs Dev to confirm the drop, Sam to approve $412.`
- Card: `Approval · Pendant substitute`. Two rows with avatars: `Dev · Installer · Confirms drop and clearance` and `Sam · Co-owner · Approves $412`. Footer `Waiting on 2`.
- At 0:42 a small grey inset appears under the card labelled `Dev's device`: `dev: clearance is fine`. Dev's row checks green, footer rolls to `Waiting on 1`. At 0:45 Sam's row checks green. Card collapses to chip `✓ Pendant substitute · Approved · Dev, Sam`.

**0:47–0:55 — Order thread** (label `Order thread`)
- Assistant: `Four of eleven ordered. Mirror waits on the vanity.`
- Card: `Bathroom · 4 of 11 ordered`, thin progress bar animates to 36%. Rows: `Tile · 8 boxes · Maya`, `Sample · Maya`, `Pendant substitute · Dev, Sam`, `Vanity · Maya` — filled dots. Then `Mirror · waits on vanity width · 36 in vanity · mirror ≤ 34 in` — hollow dot, grey.

**0:55–0:58 — Hold**
- Freeze on the Order thread card. No fade to black, no end card, no logo.

## Data — use exactly

Room 2.1 × 2.7 m = 61 ft². Tile 3×9 Puget Sound gloss, $19/ft², 10.5 ft² per box. Straight + 10% waste = 67 ft² → 7 boxes, 73.5 ft², $1,397. Herringbone + 15% waste + 1 box allowance = 8 boxes, $1,596. Vanity 36 in, 2 weeks. Mirror ≤ 34 in. Pendant 8 weeks, lands 9 Nov. Substitute pendant: drop 18 in, 30 in clearance passes, colour temp not listed. Plumber 12 Oct. Today 14 Sept.

## Do not

- No supplier storefronts, brand logos, or assistant product names.
- No shadows heavier than `0 1px 2px rgba(0,0,0,0.06)`.
- No confetti, particles, glow, or gradient backgrounds.
- No text smaller than 11 pt at 1080 width.
- Do not let two things animate at once. One state change, hold, next.
