import React from "react";
import { useCurrentFrame } from "remotion";

// Very light static-film grain + vignette, composed locally (no AI asset).
// Kept subtle so it reads as material texture, not a filter.
export function Grain({ opacity = 0.05 }: { opacity?: number }) {
  const frame = useCurrentFrame();
  const seed = (frame * 7) % 97;
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        mixBlendMode: "overlay",
        opacity,
      }}
    >
      <filter id="grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves={2}
          seed={seed}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

export function Vignette({
  strength = 0.28,
  color = "#1A1714",
}: {
  strength?: number;
  color?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at 50% 45%, transparent 45%, ${color}${Math.round(
          strength * 255,
        )
          .toString(16)
          .padStart(2, "0")} 100%)`,
        pointerEvents: "none",
      }}
    />
  );
}
