import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { palette, fontFamily } from "../concept-shared/theme";
import { useBeatrice } from "../concept-shared/useFonts";
import { Grain, Vignette } from "../concept-shared/Grain";

const WORDMARK = "Takeoff";
const SUBHEAD = "Renovation, with context.";

export function Hero() {
  const fontsReady = useBeatrice();
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgScale = interpolate(frame, [0, 40], [1.035, 1], {
    extrapolateRight: "clamp",
  });

  const titleStart = 22;
  const title = spring({
    frame: frame - titleStart,
    fps,
    config: { damping: 200, mass: 0.9 },
    durationInFrames: 34,
  });
  const titleOpacity = interpolate(title, [0, 1], [0, 1]);
  const titleTracking = interpolate(title, [0, 1], [0.34, 0.03]);
  const titleY = interpolate(title, [0, 1], [16, 0]);

  const ruleStart = 46;
  const ruleT = spring({
    frame: frame - ruleStart,
    fps,
    config: { damping: 200 },
    durationInFrames: 24,
  });

  const subStart = 58;
  const sub = spring({
    frame: frame - subStart,
    fps,
    config: { damping: 200, mass: 0.9 },
    durationInFrames: 30,
  });
  const subOpacity = interpolate(sub, [0, 1], [0, 1]);
  const subY = interpolate(sub, [0, 1], [10, 0]);

  const exitStart = durationInFrames - 20;
  const exit = interpolate(frame, [exitStart, durationInFrames - 2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: palette.cream, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${bgScale})` }}>
        <OffthreadVideo
          src={staticFile("motion/hero-bg.mp4")}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <Vignette strength={0.3} />
      <Grain opacity={0.045} />
      {fontsReady && (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            opacity: exit,
          }}
        >
          <div
            style={{
              fontFamily,
              fontWeight: 600,
              fontSize: 88,
              color: palette.white,
              letterSpacing: `${titleTracking}em`,
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              textShadow: "0 2px 28px rgba(26,23,20,0.35)",
              lineHeight: 1,
            }}
          >
            {WORDMARK}
          </div>
          <div
            style={{
              width: 46,
              height: 2,
              background: palette.white,
              opacity: 0.85 * ruleT,
              transform: `scaleX(${ruleT})`,
              margin: "26px 0 22px",
            }}
          />
          <div
            style={{
              fontFamily,
              fontWeight: 500,
              fontSize: 32,
              color: palette.white,
              opacity: subOpacity * 0.94,
              transform: `translateY(${subY}px)`,
              letterSpacing: "0.01em",
              textShadow: "0 1px 18px rgba(26,23,20,0.32)",
            }}
          >
            {SUBHEAD}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
}
