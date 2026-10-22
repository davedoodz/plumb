# Plumb

```
                 ┌───────────────────┐
                 │   ┌───────────┐   │
                 │   │ \   |   / │   │
                 │   │   \ | /   │   │
                 │   │────●────  │   │     a plumb line
                 │   │   / | \   │   │     finds true —
                 │   │ /   |   \ │   │     so does this app
                 │   └───────────┘   │
                 └─────────┬─────────┘
                            \
                             \   145 cm
                              \
                               ◆  ← true vertical, always
        ───────────────────────────────────────────
                        (the sofa line)
```

A native iOS prototype for artists selling original work, and for the people buying it. One painting, two sides of the same measurement problem.

## What it is

A painting is hard to sell from a flat photo because the one thing that actually matters — does it fit, at true size, in this specific spot on this specific wall — never makes it into the listing. Plumb tries to fix that from both ends of the sale.

**Capture**, for the artist: photograph the piece in the studio and get back the four numbers a listing actually needs — image size, framed size, boxed size, weight — plus a price suggestion from the area, plus a preview of how an AI shopping assistant would describe the work from those fields. If a number is missing, the assistant says so instead of making one up.

**On the wall**, for the buyer: see the same piece at true scale on your own wall through AR Quick Look, with a framer's two rules drawn over it — centred at eye height, sized against the furniture underneath. Fits, or size up. Swap the frame, buy, and the listing flips to sold while the artist is still in the studio.

Same `Artwork` model powers both ends, which is the actual argument of the project: a listing isn't metadata bolted onto a photo, it's the numbers the buying decision is built out of. Get the measurement wrong in the studio and the wall preview lies later.

## Highlights

- **One record, two flows.** The dimensions the artist enters in Capture are the exact numbers that place the piece correctly in On the wall — no separate buyer-side estimate to drift out of sync.
- **Empty fields are spoken, not guessed.** The agent-facing preview calls out what it doesn't know rather than inventing a plausible-sounding number.
- **Rules, not just scale.** AR placement alone tells you the object is the right size; Plumb also draws the hang-height and furniture-proportion rules a framer would actually use.
- **Stock = 1, and it stays visible.** A sold piece flips to a "Sold" badge rather than disappearing, so the listing still works as portfolio after the sale.

## Scope

Ten screens total, one `Artwork` model, one catalog of eight works.

**Capture** — camera with frame-edge detection → dimensions (image / framed / boxed) → listing preview with price suggestion → "how an agent reads this" → published (stock = 1).

**On the wall** — feed → AR Quick Look at true scale → rule overlay (centreline + furniture-width rule) → frame swap → buy → sold.

Deliberately out of scope for this prototype: login, payments, a backend, a real vision model, anchored AR annotations, sculpture, editions, commissions, crating.

## Stack

SwiftUI, VisionKit, AR Quick Look (USDZ assets), Blender for the 3D/print assets. No backend — the catalog is a static JSON file. Built and reviewed on the simulator plus one physical device.

## Try it

There's no app to build yet — this repo is the planning and prototyping layer that comes before the Xcode project. What you can look at right now:

```
open docs/skeletons/spec-sheet.html    # a related web-side skeleton, in any browser
open docs/skeletons/three-scales.html  # token/systems-tool skeleton
open docs/skeletons/place-it.html      # AR-placement research skeleton
```

Each is a self-contained static HTML file — no build step, just open it in a browser.

## Repo layout

```
docs/
  PLAN.md             30-day day-by-day prototyping plan
  catalog.json        the Artwork schema — eight works, shared across all surfaces
  skeletons/          static HTML mockups used to work out layout and tokens
    spec-sheet.html
    three-scales.html
    place-it.html
```

## Status

Pre-build: the plan, the shared data model, and the visual skeletons exist; the SwiftUI app itself hasn't been started. `docs/PLAN.md` has the full day-by-day build order if you want to see where it's headed.
