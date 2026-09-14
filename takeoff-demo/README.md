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

Rendered media is ignored by Git and archived through DavidOS. Source and build assets stay here.

## Decisions

- The brief specifies 75 seconds but its scene timings total 78. All card scene boundaries stay intact; the closing hold is three seconds instead of six.
- At 15% waste, 61 ft² still rounds to seven 10.5 ft² boxes. The approved demo preserves eight boxes by showing a separate **+1 box layout allowance**, rather than attributing it to waste. The calculated herringbone area is 70.15 ft²; eight boxes cover 84 ft².
- A 3–5 week lead time from 14 September spans 5–19 October. The tile card therefore flags the 12 October plumber visit as at risk, rather than claiming a guaranteed arrival.
- Each substitution row settles over 250 ms, then holds for 500 ms before the next row. This resolves the brief's conflicting 250 ms stagger and 500 ms minimum hold.
- The unknown colour temperature stays empty. No supplier facts are invented.
- The tile close-up is a locally authored material visualization in `public/puget-sound.svg`, not a supplier photograph. The device frame is a front-view iPhone-style reconstruction, not an Apple marketing asset.

## Skills used

- [Official Remotion skills](https://skills.sh/remotion-dev/skills/remotion-best-practices): deterministic frame rendering and export.
- Interface Craft: consistent card hierarchy, spacing and state visibility.
- Web Animation Design: spring-based entry, rolling values and tap feedback.
- Vercel React Best Practices: derived frame state without animation effects or timers.

The source uses Remotion 4.0.524. Remotion licensing depends on team size; see [Remotion licensing](https://www.remotion.pro/license).
