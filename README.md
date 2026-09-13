# Plumb

A native iOS prototype for artists selling original work, and for the people buying it.

One painting. Two sides of the same measurement problem.

**Capture** — the artist photographs a piece in the studio. Plumb returns the four numbers a listing actually needs (image size, framed size, boxed size, weight), suggests a price from the area, and shows how an AI shopping assistant would describe the work from those fields. If a field is empty, the assistant says so instead of guessing.

**On the wall** — the buyer sees the same piece at true scale on their own wall. Plumb draws the two rules a framer would apply: centre at eye height, and the work sized against the furniture below it. Fits, or go one size up. Swap the frame, buy, and the listing flips to sold while the artist is still in the studio.

The numbers captured in the studio are the numbers that make the wall preview correct. Get the measurement wrong at one end and the preview lies at the other. That link is the argument: a listing isn't metadata, it's what the buying decision is built out of.

---

## Why now

Online art listings still ask buyers to trust flat photos for a spatial decision. The missing facts are usually the basic ones: true image size, framed size, boxed size, weight, and how the piece sits against furniture.

AR placement can show scale, but scale alone is not the whole decision. Plumb puts the trade's rules on top of the preview: centre the work at eye height, size it against the furniture below it, and make the captured measurements drive the buyer view.

---

## Scope

Ten screens, one `Artwork` model, one catalog of eight works.

**Capture**
1. Camera with frame-edge detection
2. Dimensions — image / framed / boxed
3. Listing preview with price suggestion
4. How an agent reads this
5. Published (stock = 1)

**On the wall**
1. Feed
2. AR Quick Look at true scale
3. Rule overlay — centreline, scale against furniture
4. Frame swap
5. Buy → sold

**Not in scope:** login, payments, backend, real vision model, anchored AR annotations, sculpture, editions, commissions, crating.

---

## Stack

SwiftUI, VisionKit, AR Quick Look (USDZ), Blender for assets. No backend. Simulator plus one physical device.

---

## Status

Pre-build. See `docs/PLAN.md` for the 30-day schedule and `docs/CONTEXT.md` for the full research and decision history.

---

## Repo layout

```
Plumb/              Xcode project (to be created)
docs/
  CONTEXT.md        research, decisions, and why the project is shaped this way
  PLAN.md           30-day prototyping plan
  catalog.json      the eight works, shared across all surfaces
```
