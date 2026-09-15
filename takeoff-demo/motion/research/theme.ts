// Shared visual language for the research-summary film.
// Palette agreed with the sibling concept-motion film (hero / spec-story):
// cream / ink / sage / clay / hairline. Keep these in sync if it ever changes.
export const palette = {
  cream: "#F4EEE4",
  creamDeep: "#ECE2D0",
  paper: "#FFFFFF",
  ink: "#1A1714",
  inkSoft: "#5B554C",
  sage: "#8A9A82",
  sageDeep: "#4F5C48",
  sageWash: "#E7EBE1",
  clay: "#B8724F",
  clayDeep: "#7A4A31",
  clayWash: "#F1E2D6",
  line: "#DED5C6",
} as const;

export const fonts = {
  regular: "Beatrice",
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const W = 1280;
export const H = 720;
export const FPS = 30;

// Horizontal/vertical safe margins so every frame reads clearly even when the
// embedded player is scaled down to a 768px-wide page column.
export const MARGIN_X = 96;
export const MARGIN_TOP = 84;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Linear progress of `frame` across [start, start+duration], eased. */
export function progress(
  frame: number,
  start: number,
  duration: number,
  ease: (t: number) => number = easeOutCubic,
): number {
  if (duration <= 0) return frame >= start ? 1 : 0;
  return ease(clamp01((frame - start) / duration));
}
