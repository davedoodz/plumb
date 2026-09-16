# Takeoff — silent prototype film

Frame-driven mobile purchase cards inside a neutral personal-agent thread. This is a rendered prototype video, not a purchasing service. The earlier Plumb project remains untouched.

## Reproduce

Requires Node.js, npm, ffmpeg and ffprobe. macOS supplies the system sans-serif font used in the delivered frames.

```sh
npm ci
npm run lint
npm run render
npm run render:social
npm run finalize
```

`finalize` decodes both videos, checks H.264 / 1080 × 1920 / 30 fps / exact frame counts / no audio, and extracts six PNG stills from the master. It writes `out/verification.json` with hashes and production decisions.

For the editable timeline, run `npm run dev`. It does not open a browser. The main composition is `/Takeoff`; the social composition is `/Substitution` on the URL printed by Remotion.

## Deliverables

- `out/takeoff-75s.mp4` — 75 seconds, 2,250 frames, no audio.
- `out/takeoff-substitution-12s.mp4` — 12 seconds, 360 frames, no audio.
- `out/stills/01-takeoff.png` through `06-order-thread.png` — 1080 × 1920.
- `out/verification.json` — measured file properties and checksums.
- `out/takeoff-75s-transparent.webm` — 75-second VP9 master with alpha; reproduce with `npm run render:transparent`.
- `out/takeoff-75s-white.mp4` — white-background H.264 fallback; reproduce with `npm run render:white`.

Rendered media is ignored by Git and archived through DavidOS. Source and build assets stay here.

## Fourteen short prototype studies

Run `node render-prototypes.mjs` to render the collection, then `node finalize-prototypes.mjs` to check every export and extract review stills. An optional composition ID renders one clip, for example `node render-prototypes.mjs Delivery`. Definitions and durations live in `src/prototypes/Collection.tsx`.

- `out/prototypes/index.html` — local review gallery with individual downloads.
- `out/prototypes/01-room-to-spec.mp4` through `14-after-the-order.mp4` — fourteen silent 1080 × 1080, 30 fps clips; 9–12 seconds each, 151 seconds total.
- `out/prototypes/verification.json` — codec, dimensions, frame counts, full-decode results, and SHA-256 hashes.
- `out/prototypes/review.json` — headless playback, layout sampling, and visual-review evidence.
- `public/prototype-assets/` — four original Higgsfield photographs, two five-second videos, and provenance. All are synthetic concept media, not supplier or site evidence.

The scenes use one persistent circular cursor per clip. Gesture coordinates are app-local; animation is derived from the Remotion frame. PNG render frames and BT.709 limited-range H.264 preserve the pale surfaces in browser playback.

The concepts extend `../docs/VISION.md`: deliberate capture, source-aware recall, confirmation boundaries, role-specific approvals, and evidence after purchase. They simulate interactions; they do not send supplier messages, measure photographs, place orders, or issue refunds. The Obsidian concept note is `projects/project-plumb-short-prototypes.md` in David’s vault.

Rachel Chen’s [TOMO project](https://www.rachelchen.tech/projects/openai) informed the short, single-idea format and contextual-media patterns. Reference footage was studied, not reused in these exports.

## Five directions for every concept

`node render-variants.mjs` renders 70 new clips without replacing the original fourteen. Pass a direction ID or composition ID to render a subset. Run `node finalize-variants.mjs` afterward for full decode, frame-count, colour, audio, and uniqueness checks.

- Directions: conversation, evidence canvas, decision guide, team workspace, and field notebook.
- Each clip is 12 seconds, 1080 × 1080, 30 fps, silent; the collection totals 14 minutes.
- `src/variants/catalog.json` defines the 14 × 5 interaction matrix. The same synthetic media and facts keep the comparison focused on interaction structure.
- `out/variants/index.html` provides concept/direction filters, synchronized playback of up to five clips, larger review, and downloads.
- `src/variants/market-validation.json` checks all 70 against Obsidian’s `projects/plumb-market-validation.md`, with supporting repository research. It separates demonstrated interactions from supporting ideas and absent workflows.

The market note prioritizes duplicate-order prevention, written approvals, delivery visibility, and supplier infrastructure over a new consumer app. These studies demonstrate approvals and evidence handling but **do not implement duplicate prevention or live tracking**. Daylight sample review is not a sample-request workflow; an archived receipt is not job/PO cost allocation. Research claims about readiness, conversion, or design-build savings are not measured Takeoff outcomes.

## ChatGPT-style conversation studies

`src/chatgpt-studies/` defines 70 conversation studies: fourteen concepts with five interaction patterns inside one shared interface.
The interface follows ChatGPT iOS references from authenticated Mobbin access. Procurement records and generated media are synthetic.

- Categories: tiles, framing, interior paint, and light fixtures. Framing is exploratory; the market note names flooring instead.
- Export contract: 16 seconds, 1080 × 1920, 30 fps, silent H.264 with BT.709 color.
- Render one concept with `node chatgpt-studies.mjs render capture`. The filter also accepts a study ID, pattern, or category.
- Render the complete collection with `node chatgpt-studies.mjs render`.
- Run `node chatgpt-studies.mjs verify` after all renders. This command checks all 70 films before it publishes the gallery.
- `interface-verification.json` records the exact scope of headless interface checks. It does not certify unrendered films.

Media production is complete: 24 images and eight five-second videos, with provenance for every asset.
Veo 3.1 Fast produced native 720p, eight-second sources. The pipeline crops them to 4:3, upscales to 1440 × 1080, trims to five seconds, and removes audio.
`remaining-media-plan.json` preserves the completed generation ledger, including uncharged failures and the reconciled 160-credit Flow cost.
`media-verification.json` records all 32 asset hashes and source-video decode checks.
`generation-incident.json` records duplicate paid submissions from an interrupted worker. Do not retry ambiguous jobs without reconciling provider history.

## Live interaction studies

`interactions/index.html` contains fourteen working browser tools in a shared ChatGPT-style conversation.
Run `node interactions.mjs` to copy the source and existing media into `out/interactions/`.
Serve `out` with the existing preview server. The gallery route is `/interactions/index.html?concept=capture`.

- Capture and photo tools keep images, annotations, and notes in the local conversation.
- Voice uses the browser microphone and MediaRecorder. The editable example note is not speech recognition.
- Quotes accept TXT or CSV files and preserve source lines beside the calculation.
- Takeoff, scheduling, approval, and receiving tools expose their assumptions and separate incomplete states.
- The pendant viewer uses procedural WebGL geometry. Room placement is a photo preview, not tracked augmented reality.
- Handoff and return tools download actual files. Return drafts embed their evidence photo.

Camera and microphone access require an explicit action. Media stays local, including after attachment.
Conversation results last until reset or reload. Use the download controls for durable copies.
`interactions/verification.json` records exercised paths, desktop/mobile coverage, and device-testing limits.
All records are synthetic. Framing remains exploratory, not engineering or installation approval.

The complete generated-video archive is in `public/videos/saved-exports/`.
Its manifest records 180 unchanged exports and their SHA-256 hashes. Third-party inspiration is separate.

## Decisions

- The brief specifies 75 seconds but its scene timings total 78. All card scene boundaries stay intact; the closing hold is three seconds instead of six.
- At 15% waste, 61 ft² still rounds to seven 10.5 ft² boxes. The approved demo preserves eight boxes by showing a separate **+1 box layout allowance**, rather than attributing it to waste. The calculated herringbone area is 70.15 ft²; eight boxes cover 84 ft².
- A 3–5 week lead time from 14 September spans 5–19 October. The tile card therefore flags the 12 October plumber visit as at risk, rather than claiming a guaranteed arrival.
- Each substitution row settles over 250 ms, then holds for 500 ms before the next row. This resolves the brief's conflicting 250 ms stagger and 500 ms minimum hold.
- The unknown colour temperature stays empty. No supplier facts are invented.
- The tile close-up is a locally authored material visualization in `public/puget-sound.svg`, not a supplier photograph. The device frame is a front-view iPhone-style reconstruction, not an Apple marketing asset.
- The revised masters insert the standalone `SubstitutionFilm` composition at frames 1140–1499 (0:38–0:50). It is re-rendered from the same source with the chosen background, avoiding a black rectangle from the original opaque MP4.
- Transparent exports use PNG frames and VP9 `yuva420p`; H.264 does not preserve alpha. The opening and closing background are transparent or white to match the selected export.

## Skills used

- [Official Remotion skills](https://skills.sh/remotion-dev/skills/remotion-best-practices): deterministic frame rendering and export.
- Interface Craft: consistent card hierarchy, spacing and state visibility.
- Web Animation Design: spring-based entry, rolling values and tap feedback.
- Vercel React Best Practices: derived frame state without animation effects or timers.

The source uses Remotion 4.0.524. Remotion licensing depends on team size; see [Remotion licensing](https://www.remotion.pro/license).
