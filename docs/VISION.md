# Takeoff — product vision

The current direction for this project's hero piece, replacing the Plumb/artist framing in `README.md` and `docs/CONTEXT.md`. Those files still describe the prior scope; this document is the source of truth for direction until they're rewritten (see §8).

Last updated: 14 September 2026.

---

## 1. Overview

**What does a renovation look like when your agent does the buying?**

A solo SwiftUI prototype, built as the hero piece of a design portfolio, showing the purchase moments a home renovation depends on, rendered inside the AI agents people already use, rather than as a standalone shopping app.

- **Product strategy** — reading how personal agents (Meta's Muse, ChatGPT, Gemini) now discover products, negotiate, and check out on a person's behalf, and where a renovation breaks that flow.
- **Prototyping embedded surfaces** — designing the cards an agent renders mid-conversation, tested inside faithful recreations of real chat threads, on device.
- **Daily checkpoints** — one card per checkpoint, visual review before anything advances, one written line each time the agent got a screen wrong and a human overrode it.

## 2. Problem

**A renovation is forty purchases that all depend on each other. An agent treats them as forty separate orders.**

A property owner renovating a bathroom buys tile, grout, a vanity, a faucet, a mirror, a light, a fan, and a door handle from six or seven different suppliers. Each purchase depends on a measurement, a quantity, a lead time, a trade's opinion, and the purchase before it. Today that dependency lives in a contractor's head, a designer's spreadsheet, and a stack of supplier PDFs.

Personal agents can already find each product, compare it, and pay for it — every supplier with a structured catalog is visible to them with no extra work. What the agent cannot see is the renovation itself: that the tile quantity depends on the layout, that the vanity width decides the mirror, that the faucet must arrive before the plumber's second visit, and that the owner's partner has to approve the colour before anyone pays.

A text reply is the wrong shape for every one of these moments:
- "You need about 42 square feet" is not an order.
- "It ships in 3 to 5 weeks" is not a schedule check.
- "Here's a similar one" is not a substitution the trade has agreed to.

## 3. Opportunity

**The card is the new product page.**

Renovation purchases are the hardest category to buy from a chat window: dimensional, quantity-driven, lead-time-sensitive, sequenced, and approved by someone other than the person paying. That makes them the best category to design for. A family of purchase cards that any agent can render gives:

- **Quantity you can defend** — a takeoff card turns room dimensions and a layout into an order with cuts and waste shown, not hidden. Wrong quantity is the return; the card is the fix.
- **Approval as an object** — samples, trade sign-off, and partner sign-off as structured cards with accept/reject, so the agent never guesses on a purchase that's hard to undo.
- **A schedule the purchases obey** — lead time read against the site schedule before checkout, dependencies between purchases made visible, and a substitution card when the specified product won't arrive in time.

## 4. Solution

**Takeoff: the purchase cards a renovation needs, rendered inside whatever agent you already use.**

Not an app. A set of cards an agent can render when a renovation conversation turns into buying tile, flooring, fixtures, lighting, or furniture, from any supplier.

**Powering Specs**, a data unit any agent can read, price, sequence, and order. A Spec is one product record with three readers: the owner, the trade, and the agent. It carries what a chat reply can't hold — dimensions, coverage, waste factor, lead time, installation rules, dependencies on other Specs, and approval state. If a field is empty, the agent says so instead of guessing. The same Spec renders as a takeoff card in one agent, a comparison in another, and a sign-off sheet the trade and the partner both see.

## 5. The card family (ten screens/checkpoints)

1. **Takeoff** — room dimensions and layout in, quantity with waste factor out.
2. **Sample** — order the sample before the pallet, one tap.
3. **Lead time vs. schedule** — traffic-light check against the site date.
4. **Substitution** — out of stock; here's the equivalent; rules re-checked field by field.
5. **Trade sign-off** — the contractor or installer approves the spec.
6. **Partner sign-off** — the co-owner approves the colour or the spend.
7. **Dependency** — this purchase waits on that one (vanity before mirror).
8. **Delivery to site** — access, floor level, who receives it.
9. **Spec comparison** — two products, same fields, empties spoken.
10. **Order thread** — every card in one attributed timeline, across suppliers.

## 6. System rules (carried from Plumb, still true)

- **Empty fields are spoken, not guessed.** The trade-off to defend in the case study: it costs a sale today and buys the return rate back.
- **True numbers before persuasion.** A wrong quantity or a missed lead time is the return; every card shows its arithmetic rather than a rounded claim.
- **Native must be visible on video:** camera or scan input where relevant, haptics on confirm actions, spring-animated cards, Dynamic Type at XL, at least one Live Activity or comparable native surface.
- **No standalone store app in the demo.** The absence of a product page is the point — the full silent screen-recording script that proves this lives in the Obsidian vault at `projects/plumb-takeoff-demo-video-brief.md` (not duplicated into this repo).

## 7. Precedents and research

- **Fireclay Tile** (an ecommerce-run tile retailer) hand-runs a Trade Program — preferred pricing, unlimited free samples, a project-management portal — for architects, designers, and contractors. This is the missing layer built by hand, with no structure an agent can read. Named directly in the case study; the closest thing to an incumbent.
- **Meta Muse** (launched 8 September 2026) — personal agent with deterministic approval cards for hard-to-undo actions, transparency (activity log, editable memory), and a stated design goal of avoiding banner blindness. Takeoff's sign-off card is this pattern applied specifically to commerce with more than one approver.
- No named AEC-specific commerce platform or Autodesk/Procore-style integration exists in this space as of this research pass (checked 13 September 2026) — checked several commerce-platform sites and blogs directly. That's the gap this project argues into.
- Full precedent-search keyword list and the two prior reframes (Clerk — merchant's view of the buying agent; the building-products-only version of Takeoff) live in the Obsidian vault (`projects/plumb-precedent-research.md`, `projects/plumb-clerk-reframe.md`, `projects/plumb-takeoff-reframe.md`) for continuity, not duplicated here.

## 8. Status and what still needs to change in this repo

This document supersedes the artist/Plumb framing wherever the two disagree. Not yet done, pending confirmation this direction sticks:

- `README.md` — still describes Plumb, the artist protagonist, and the Capture/On the wall flows. Needs a full rewrite to Takeoff's overview, the ten-card list in §5 above, and the renovation buyer/supplier framing.
- `docs/CONTEXT.md` §5 and §7 — the three-project portfolio description and the "decisions locked" section reference Plumb's artist scope. §1–4, §6, §8–9 (the Swift/Kotlin news, case-study format, working method) still apply unchanged and should be kept.
- `docs/catalog.json` and `docs/skeletons/*.html` — built for the artist catalog; need a Spec-shaped replacement (room, tile, fixture, lead time, dependency fields) once the ten cards above are scoped into screens.
- Naming — **Takeoff** and **Spec** are placeholders, not finalised. Runners-up not yet explored for this direction.

## 9. One-line brief for a new chat

> I'm building Takeoff, a SwiftUI prototype of the purchase cards a home renovation needs — a property owner buys tile, fixtures, and furniture from many suppliers by talking to an AI agent (Muse, ChatGPT, Gemini), and the agent renders structured cards (takeoff quantity with waste factor, sample, lead-time-vs-schedule, substitution, trade and partner sign-off, dependency, order thread) instead of text. One Spec record serves the owner, the trade, and the agent; empty fields are spoken, not guessed. It's the hero project in a design portfolio. This supersedes an earlier version of the same project about an artist selling original work (Plumb) — see `docs/VISION.md` for the full pivot and `docs/CONTEXT.md` for research that still applies.
