# Capture + On the wall — 30-day prototyping plan

One artist. One catalog of 8 works. Two flows on one iPhone app:

- **Capture** (merchant): photograph an original → four numbers (image, framed, boxed, weight) → listing preview → how an AI agent reads it → published.
- **On the wall** (buyer): the piece on your wall at true scale → hang height + sofa rule drawn → frame swap → buy → sold state.

Same `Artwork` model feeds both. This is the hero project. The web page and the systems tool run on scraps until day 21.

---

## 0. Before day 1 (one evening)

- [ ] Install Xcode from the App Store. Open it once so it finishes setup. Create a free Apple developer account in Xcode → Settings → Accounts (needed to run on your phone).
- [ ] Make a folder `~/dev/capture` and open it in Cursor or Claude Code. You will type almost no Swift by hand; you will describe screens, review, and run.
- [ ] Pick 8 works. If you don't have 8 of your own, make them — flat colour studies are fine. Each needs: title, medium, year, image size (cm), framed size, weight, price, one photo, one hex colour for the placeholder.
- [ ] Write `catalog.json` by hand with those 8. This file is also used by the web page and the systems tool later.
- [ ] Write the 24 case-study headings (see §7). If a heading isn't a decision, it doesn't get built.

---

## 1. Scope freeze (do not add to this list)

**Capture — 5 screens**
1. Camera with frame edges detected (VisionKit document camera is enough)
2. Dimensions: image / framed / boxed, cm, with "measure again" — manual entry is allowed, tape-measure AR is not required
3. Listing preview: title, medium, the four numbers, price suggestion from `w × h × $/cm²`
4. "How an agent reads this" — one paragraph generated from the fields, with any empty field called out
5. Published: stock = 1, sold badge logic ready

**On the wall — 5 screens**
1. Feed: 3 works, one tap to "see it on your wall"
2. AR Quick Look of the framed piece (usdz) — Apple's viewer, not yours
3. Snapshot + overlay: hang height (centre at 145 cm), two-thirds-of-sofa rule, pass/fix — drawn on the captured frame, not anchored
4. Frame swap: 3 finishes, price updates
5. Buy sheet → sold state → the listing flips to "Sold" in the feed

**Native things that must appear on video**
- Camera, haptics on capture and on "published", spring sheet, Dynamic Type at XL, one Live Activity ("Publishing…" → "Live") — the live activity is optional until day 21.

**Kill list**
Login, payments, backend, real vision model, anchored AR annotations, sculpture, editions, commissions, crate. Not this month.

---

## 2. Daily protocol (75 min, 6 days a week, no exceptions until day 21)

1. **5 min** — read yesterday's note, pick one screen.
2. **10 min** — write the screen as a checkpoint: what it shows, what the user does, what changes. One paragraph. This becomes the prompt.
3. **40 min** — agent drafts the view. You run it on the simulator, then on your phone. You change: spacing, type, animation timing, copy. You do not accept a screen you couldn't redraw on paper.
4. **10 min** — Dynamic Type XL + dark mode check. Screenshot both.
5. **10 min** — write three lines: what shipped, what broke, what tomorrow is. Post the screenshot as the daily experiment.

Agent rule: one screen per checkpoint, tests optional, visual review mandatory. Never let it build two screens in one go.

---

## 3. Week by week

### Week 1 — a piece on a wall on your phone (days 1–7)
- d1: Xcode runs, empty SwiftUI app on your phone. `Artwork` model + `catalog.json` loaded into a `List`.
- d2: Feed screen. Real type and spacing. This is the craft screen; spend the whole session on it.
- d3: Export one framed print as `.usdz` from Blender (plane + frame, 4 materials). Test it in Files app AR first.
- d4: AR Quick Look button on a work. It opens, places, you photograph. **Milestone.**
- d5: Buy sheet with three details and one button. Spring animation, haptic.
- d6: Sold state. Feed shows "Sold" without removing the work.
- d7 (3h block): Capture camera screen using VisionKit. It only has to detect a rectangle and hand back a photo.

### Week 2 — the merchant flow works (days 8–14)
- d8: Dimensions screen. Three rows, cm, keyboard that doesn't fight you.
- d9: Price suggestion from `w × h × rate + framing`. Editable.
- d10: Listing preview. Same components as the buyer feed — prove the shared model.
- d11: "How an agent reads this." Static template from fields; empty field → warning line.
- d12: Published state + haptic. Feed updates.
- d13: Frame swap on the buyer side. 3 finishes, price changes.
- d14: **Decision day.** Record the whole loop on device. If you can't, the swift project becomes the daily-experiment stream and the web page becomes the hero. Write this down today so it's not a negotiation later.

### Week 3 — the decision layer (days 15–21)
- d15–16: Snapshot from Quick Look (or a photo of the wall) + SwiftUI overlay: centreline at 145 cm, sofa-width rule. Pass / fix in one line each.
- d17: Dynamic Type XL pass on every screen. Fix what breaks. This is a video moment.
- d18: Dense state: 40 works in the feed. Empty state: no works yet.
- d19: Live Activity "Publishing… → Live" (skip if behind).
- d20: Copy pass. Every label is a verb or a number. No "Submit."
- d21 (3h block): Full loop, twice, on device. Keep the second take.

### Week 4 — make it reviewable (days 22–30)
- d22–23: Exploration forks. Same base, record 5 variants of 5–8s each: dimensions in a modal, price hidden, full dimension set, no rule overlay, agent view as chat. These are the "tried and cut" grid.
- d24: Hero loop, 25s. First frame is the camera, not a title.
- d25: 60–90s Loom: who, the decision, what's weak.
- d26–27: Case page. Drop videos into the skeleton. Write the constraint section (what Quick Look can and can't anchor) and the trade-off.
- d28: Two working designers, one question: would you keep scrolling? Cut what they skip.
- d29: Web page + systems tool get whatever is left. Minimum: spec sheet deployed, three-scales as tokens + 6 static components + export.
- d30: Site live. Stop.

---

## 4. Assets to make (Blender / Figma, one weekend)

- 8 artwork images, colour-accurate, square-cropped and full.
- 1 framed-print `.usdz` with 4 frame materials (natural oak, black, white, brass).
- 1 "wall" photo with a sofa for the overlay demo.
- App icon, 1 typeface decision, spacing scale (use the three-scales tokens if they exist; otherwise 4/8/12/16/24/32).

---

## 5. Recording spec

- Device capture via QuickTime (iPhone plugged in) or the built-in screen recorder. 60 fps.
- Portrait, no cursor, no title cards. Hand visible in camera shots.
- Every clip starts on the moving thing. Muted, looping, under 30s.
- Same corner radius on every video frame on the site.

---

## 6. What "done" means

- Live loop on a real device: capture → published → on the wall → bought → sold. Under 90 seconds.
- Repo with README screenshots.
- Case page with hero loop, 4 core-flow clips, 5 exploration clips, 1 diagram, 1 constraint, 1 trade-off, 2 weaknesses.
- One written line on where the agent was wrong and you overrode it.

---

## 7. The 24 headings (write on day 0)

Header: role · timeline · stack · surface
Problem: 1 declarative sentence
Research: 3 findings (returns are size; measurement is the listing; AR placement is solved, the rule isn't)
Core flows: 4 headings, each a decision
Explorations: 5 one-line rejections
Constraint: what the phone anchors vs overlays
Trade-off: 1 sentence you'd defend
Still weak: 2 lines
Learned: 2 lines

If you can't write one of these today, that section isn't a section.

---

## 8. If it slips

Ship in this order: buyer feed + Quick Look + buy → capture camera + dimensions + published → overlay rules → frame swap → live activity. Everything after the first arrow is optional for the video.
