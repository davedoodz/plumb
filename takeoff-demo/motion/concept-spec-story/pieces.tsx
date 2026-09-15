import React from "react";
import {
  AbsoluteFill,
  Img,
  Loop,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { palette, fontFamily } from "../concept-shared/theme";
import { Grain } from "../concept-shared/Grain";

const HERO_BG_FRAMES = 180; // hero-bg.mp4 rendered at 6s / 30fps

// Shared ambient backdrop: the same flowing material clip used in hero.mp4,
// looped, blurred and dimmed under a cream scrim so foreground cards and
// type stay legible for the full spec-story runtime.
export function Backdrop() {
  return (
    <AbsoluteFill style={{ background: palette.cream }}>
      <AbsoluteFill style={{ filter: "blur(38px) saturate(0.92)", opacity: 0.55, transform: "scale(1.12)" }}>
        <Loop durationInFrames={HERO_BG_FRAMES}>
          <OffthreadVideo
            src={staticFile("motion/hero-bg.mp4")}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Loop>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${palette.cream}CC 0%, ${palette.cream}A8 45%, ${palette.cream}CC 100%)`,
        }}
      />
      <Grain opacity={0.035} />
    </AbsoluteFill>
  );
}

// Returns opacity + local-frame progress for a beat window, with a soft
// crossfade overlap into the neighbouring beats.
export function useBeat(
  start: number,
  end: number,
  overlapIn = 15,
  overlapOut = overlapIn,
) {
  const frame = useCurrentFrame();
  const inOp = interpolate(frame, [start - overlapIn, start], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outOp = interpolate(frame, [end, end + overlapOut], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(inOp, outOp);
  const rise = interpolate(frame, [start - overlapIn, start], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { opacity, local: frame - start, rise };
}

export function Eyebrow({ children, delay = 0 }: { children: string; delay?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 16 });
  return (
    <div
      style={{
        fontFamily,
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: palette.clayDeep,
        opacity: interpolate(s, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(s, [0, 1], [10, 0])}px)`,
        marginBottom: 18,
      }}
    >
      {children}
    </div>
  );
}

export function KineticHeading({
  text,
  delay = 0,
  accent = [],
  fontSize = 56,
}: {
  text: string;
  delay?: number;
  accent?: string[];
  fontSize?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        maxWidth: 920,
        textAlign: "center",
      }}
    >
      {words.map((w, i) => {
        const s = spring({
          frame: frame - delay - i * 3,
          fps,
          config: { damping: 200, mass: 0.7 },
          durationInFrames: 20,
        });
        const clean = w.replace(/[.,]/g, "");
        const isAccent = accent.includes(clean);
        return (
          <span
            key={`${w}-${i}`}
            style={{
              display: "inline-block",
              fontFamily,
              fontWeight: 600,
              fontSize,
              lineHeight: 1.08,
              marginRight: fontSize * 0.24,
              color: isAccent ? palette.clay : palette.ink,
              opacity: interpolate(s, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
}

export function PhotoCard({
  src,
  width,
  aspect,
  x,
  y,
  rotate = 0,
  delay = 0,
  float = true,
  label,
}: {
  src: string;
  width: number;
  aspect: number;
  x: number;
  y: number;
  rotate?: number;
  delay?: number;
  float?: boolean;
  label?: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.8 },
    durationInFrames: 26,
  });
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const scale = interpolate(s, [0, 1], [0.86, 1]);
  const enterY = interpolate(s, [0, 1], [30, 0]);
  const driftT = frame - delay;
  const drift = float && driftT > 0 ? Math.sin(driftT / 36) * 6 : 0;
  const height = width / aspect;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        opacity,
        transform: `translate(-50%, -50%) translateY(${enterY + drift}px) rotate(${rotate}deg) scale(${scale})`,
      }}
    >
      <div
        style={{
          width,
          height,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 18px 40px rgba(26,23,20,0.22), 0 2px 6px rgba(26,23,20,0.12)",
          border: `1px solid ${palette.line}`,
        }}
      >
        <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {label && (
        <div
          style={{
            marginTop: 10,
            fontFamily,
            fontWeight: 500,
            fontSize: 20,
            color: palette.ink,
            opacity: 0.82,
            textAlign: "center",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

export function Chip({
  children,
  delay = 0,
  x,
  y,
}: {
  children: React.ReactNode;
  delay?: number;
  x: number;
  y: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 18 });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${interpolate(s, [0, 1], [0.8, 1])})`,
        opacity: interpolate(s, [0, 1], [0, 1]),
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: palette.white,
        border: `1px solid ${palette.line}`,
        borderRadius: 999,
        padding: "12px 22px",
        boxShadow: "0 10px 26px rgba(26,23,20,0.14)",
        fontFamily,
        fontWeight: 500,
        fontSize: 22,
        color: palette.ink,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  );
}

export function CountUp({
  to,
  suffix,
  delay = 0,
  duration = 34,
  fontSize = 96,
}: {
  to: number;
  suffix: string;
  delay?: number;
  duration?: number;
  fontSize?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 16 });
  const t = interpolate(frame, [delay, delay + duration], [0, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        opacity: interpolate(s, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(s, [0, 1], [14, 0])}px)`,
        display: "flex",
        alignItems: "baseline",
        gap: 12,
        fontFamily,
        color: palette.ink,
      }}
    >
      <span style={{ fontWeight: 700, fontSize, fontVariantNumeric: "tabular-nums" }}>
        {Math.round(t)}
      </span>
      <span style={{ fontWeight: 500, fontSize: fontSize * 0.34, color: palette.sageDeep }}>
        {suffix}
      </span>
    </div>
  );
}
