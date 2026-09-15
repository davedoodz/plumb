// Single source of truth for the research-summary film: timing + copy.
// The same array also backs the accessible transcript handed to the parent
// agent for the HTML <track>/caption fallback.

export const OVERLAP = 14; // frames of fade-in/fade-out within each beat's own span

export type BeatId =
  | "title"
  | "roles"
  | "needs"
  | "risks"
  | "readiness"
  | "pilot"
  | "next";

interface BeatDef {
  id: BeatId;
  duration: number; // frames, including its own fade in/out ramps
}

const BEAT_DURATIONS: BeatDef[] = [
  { id: "title", duration: 108 },
  { id: "roles", duration: 170 },
  { id: "needs", duration: 210 },
  { id: "risks", duration: 195 },
  { id: "readiness", duration: 135 },
  { id: "pilot", duration: 135 },
  { id: "next", duration: 140 },
];

export interface Beat extends BeatDef {
  start: number;
  end: number;
}

export const BEATS: Beat[] = (() => {
  let cursor = 0;
  return BEAT_DURATIONS.map((def) => {
    const start = cursor;
    const end = start + def.duration;
    cursor = end;
    return { ...def, start, end };
  });
})();

export const FILM_DURATION = BEATS[BEATS.length - 1].end;

export function beatByIndex(index: number): Beat {
  return BEATS[index];
}

// --- Copy -------------------------------------------------------------

export const TITLE = {
  eyebrow: "Research Summary",
  heading: "The problems Takeoff needs to solve.",
  sub: "Findings support the concept. They don't prove people will adopt it.",
};

export const ROLES = {
  eyebrow: "Three Roles",
  heading: "One purchase. Three people who must agree.",
  cards: [
    {
      name: "Homeowner",
      duty: "Chooses materials, approves the cost.",
      image: "persona-homeowner",
    },
    {
      name: "Contractor",
      duty: "Checks requirements, coordinates the work.",
      image: "persona-contractor",
    },
    {
      name: "Supplier",
      duty: "Confirms stock, fills the order.",
      image: "persona-supplier",
    },
  ],
};

interface StageItem {
  label: string;
  detail: string;
  media:
    | { kind: "video"; src: string; freezeAt: number }
    | { kind: "image"; src: string };
}

export const NEEDS: { eyebrow: string; heading: string; items: StageItem[] } = {
  eyebrow: "Five Needs",
  heading: "What each role is still missing.",
  items: [
    {
      label: "Early choices",
      detail: "Before work starts, not after it stalls.",
      media: {
        kind: "video",
        src: "videos/takeoff-studies-v1/01-room-to-spec.mp4",
        freezeAt: 9.5,
      },
    },
    {
      label: "Checked quantities",
      detail: "A calculation, not a guess.",
      media: {
        kind: "video",
        src: "videos/takeoff-studies-v1/05-layout-changes-the-order.mp4",
        freezeAt: 9.5,
      },
    },
    {
      label: "Delivery timing",
      detail: "Compared against the site schedule.",
      media: {
        kind: "video",
        src: "videos/takeoff-studies-v1/09-see-the-schedule-risk.mp4",
        freezeAt: 5,
      },
    },
    {
      label: "Scoped approvals",
      detail: "A written record of who signed off.",
      media: {
        kind: "video",
        src: "videos/takeoff-studies-v1/11-two-kinds-of-approval.mp4",
        freezeAt: 11,
      },
    },
    {
      label: "Samples with specs",
      detail: "Kept together, not scattered across threads.",
      media: {
        kind: "video",
        src: "videos/takeoff-studies-v1/06-sample-in-daylight.mp4",
        freezeAt: 9,
      },
    },
  ],
};

export const RISKS: { eyebrow: string; heading: string; items: StageItem[] } = {
  eyebrow: "Four Risks",
  heading: "What could stop it from working.",
  items: [
    {
      label: "Homeowner trust",
      detail: "Still untested for placing an order.",
      media: { kind: "image", src: "persona-homeowner" },
    },
    {
      label: "Supplier workflow",
      detail: "A new channel may add work, not remove it.",
      media: {
        kind: "video",
        src: "videos/takeoff-studies-v1/10-compare-with-an-unknown.mp4",
        freezeAt: 11,
      },
    },
    {
      label: "Live delivery data",
      detail: "An estimate can start to look like a promise.",
      media: {
        kind: "video",
        src: "videos/takeoff-studies-v1/09-see-the-schedule-risk.mp4",
        freezeAt: 11,
      },
    },
    {
      label: "Shared order history",
      detail: "Needed to catch an order placed twice.",
      media: {
        kind: "video",
        src: "videos/takeoff-studies-v1/14-after-the-order.mp4",
        freezeAt: 11,
      },
    },
  ],
};

export const READINESS = {
  eyebrow: "Adoption Readiness",
  heading: "Still untested — what each role must prove.",
  rows: [
    {
      name: "Homeowners",
      image: "persona-homeowner",
      question: "Would they approve a purchase inside a chat?",
    },
    {
      name: "Contractors",
      image: "persona-contractor",
      question: "Does it replace a spreadsheet, or add one more record?",
    },
    {
      name: "Suppliers",
      image: "persona-supplier",
      question: "Can staff use the request as-is, with fewer calls?",
    },
  ],
};

export const PILOT = {
  eyebrow: "Pilot Categories",
  heading: "Start narrow, not the whole renovation.",
  caption: "Generated category images, not supplier listings.",
  tiles: [
    { name: "Tiles", image: "pilot-tiles" },
    { name: "Flooring", image: "pilot-flooring" },
    { name: "Interior Paint", image: "pilot-paint" },
    { name: "Light Fixtures", image: "pilot-lighting" },
  ],
};

export const NEXT = {
  eyebrow: "Next Step",
  heading: "One category. One supplier. A real handoff.",
  body: "Lead with practical savings, not the agent. Test the benefit before promising it.",
  media: {
    kind: "video" as const,
    src: "videos/takeoff-studies-v1/13-handoff-with-evidence.mp4",
    freezeAt: 9,
  },
  closeTitle: "Research Summary — Takeoff",
  closeCaveat: "Supports the concept. Does not prove adoption.",
};

// --- Accessible transcript ---------------------------------------------
// Plain-language beat-by-beat transcript for the HTML caption/track fallback.
export const TRANSCRIPT: { time: string; text: string }[] = [
  {
    time: "0:00",
    text: "Research Summary. The problems Takeoff needs to solve. Findings support the concept. They don't prove people will adopt it.",
  },
  {
    time: "0:04",
    text: "Three roles. One purchase, three people who must agree: the homeowner chooses materials and approves cost; the contractor checks requirements and coordinates work; the supplier confirms stock and fills the order.",
  },
  {
    time: "0:09",
    text: "Five needs research surfaced: early choices before work starts, checked quantities instead of guesses, delivery timing compared to the site schedule, scoped approvals with a written record, and samples kept together with their specs.",
  },
  {
    time: "0:16",
    text: "Four risks: homeowner trust is still untested for placing an order; a new supplier channel may add work instead of removing it; live delivery data is needed so an estimate doesn't look like a promise; and a shared order history is needed to catch a duplicate order.",
  },
  {
    time: "0:23",
    text: "Adoption readiness remains untested. Homeowners must prove they'd approve a purchase inside a chat. Contractors must prove it replaces a spreadsheet rather than adding one more record. Suppliers must prove staff can use the request as-is, with fewer calls.",
  },
  {
    time: "0:27",
    text: "Pilot categories: start narrow with tiles, flooring, interior paint, or light fixtures — not the whole renovation. Generated category images, not supplier listings.",
  },
  {
    time: "0:32",
    text: "Next step: one category, one supplier, a real handoff. Lead with practical savings, not the agent — test the benefit before promising it.",
  },
];
