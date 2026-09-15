import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { palette, fontFamily } from "../concept-shared/theme";
import { useBeatrice } from "../concept-shared/useFonts";
import { CheckIcon, HomeIcon, SupplierIcon, TradeIcon } from "../concept-shared/icons";
import {
  Backdrop,
  Chip,
  CountUp,
  Eyebrow,
  KineticHeading,
  PhotoCard,
  useBeat,
} from "./pieces";

// Beat boundaries (frames @30fps). Four story beats bookended by a short
// intro and outro, each crossfading into the next via useBeat's overlap.
const INTRO_END = 45;
const BEAT1_END = 160;
const BEAT2_END = 270;
const BEAT3_END = 390;
const BEAT4_END = 497;
const OUTRO_START = 510;
const TOTAL = 540; // 18s

function Intro() {
  const { opacity } = useBeat(0, INTRO_END, 20);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 22 });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity }}>
      <div
        style={{
          fontFamily,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: palette.ink,
          opacity: interpolate(s, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px)`,
        }}
      >
        How a Spec works
      </div>
    </AbsoluteFill>
  );
}

function Beat1() {
  const { opacity } = useBeat(INTRO_END, BEAT1_END);
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center" }}>
      <div style={{ marginTop: 96, textAlign: "center" }}>
        <Eyebrow delay={10}>01 — The starting point</Eyebrow>
        <KineticHeading text="A room, a sample, a note." delay={16} />
      </div>
      <PhotoCard
        src={staticFile("motion/spec-room.png")}
        width={330}
        aspect={1168 / 880}
        x={430}
        y={480}
        rotate={-4}
        delay={46}
        label="The room"
      />
      <PhotoCard
        src={staticFile("motion/spec-material.png")}
        width={250}
        aspect={896 / 1120}
        x={860}
        y={500}
        rotate={4}
        delay={62}
        label="Sample + note"
      />
    </AbsoluteFill>
  );
}

function Beat2() {
  const { opacity } = useBeat(BEAT1_END, BEAT2_END);
  const local = useCurrentFrame() - BEAT1_END;
  const { fps } = useVideoConfig();
  const ring = spring({ frame: local - 14, fps, config: { damping: 200 }, durationInFrames: 30 });
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center" }}>
      <div style={{ marginTop: 96, textAlign: "center" }}>
        <Eyebrow delay={8}>02 — The decision</Eyebrow>
        <KineticHeading text="One product, chosen." delay={14} accent={["chosen"]} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 430,
          width: 420,
          height: 420,
          borderRadius: "50%",
          transform: `translate(-50%, -50%) scale(${interpolate(ring, [0, 1], [0.7, 1])})`,
          opacity: interpolate(ring, [0, 1], [0, 0.55]),
          background: `radial-gradient(circle, ${palette.clay}33 0%, transparent 70%)`,
        }}
      />
      <PhotoCard
        src={staticFile("motion/spec-product.png")}
        width={300}
        aspect={1}
        x={640}
        y={430}
        delay={20}
        float={false}
      />
      <Chip delay={46} x={640} y={630}>
        Clay ceramic tile · 8 × 8 in
      </Chip>
    </AbsoluteFill>
  );
}

function Beat3() {
  const { opacity } = useBeat(BEAT2_END, BEAT3_END);
  const local = useCurrentFrame() - BEAT2_END;
  const check = interpolate(local, [46, 66], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const { fps } = useVideoConfig();
  const approvedT = spring({ frame: local - 46, fps, config: { damping: 200 }, durationInFrames: 18 });
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center" }}>
      <div style={{ marginTop: 80, textAlign: "center" }}>
        <Eyebrow delay={6}>03 — Quantity, approval, evidence</Eyebrow>
        <KineticHeading text="Confirmed. Approved. Delivered." delay={12} fontSize={48} />
      </div>
      <div style={{ position: "absolute", left: 300, top: 430, transform: "translate(-50%,-50%)" }}>
        <CountUp to={58} suffix="sq ft" delay={20} duration={30} fontSize={92} />
        <div
          style={{
            fontFamily,
            fontWeight: 500,
            fontSize: 20,
            color: palette.sageDeep,
            textAlign: "center",
            marginTop: 6,
          }}
        >
          ordered
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 430,
          transform: "translate(-50%,-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: interpolate(approvedT, [0, 1], [0, 1]),
        }}
      >
        <CheckIcon size={64} progress={check} style={{ color: palette.sageDeep }} />
        <div style={{ fontFamily, fontWeight: 600, fontSize: 22, color: palette.ink, marginTop: 8 }}>
          Approved
        </div>
        <div style={{ fontFamily, fontWeight: 500, fontSize: 17, color: palette.ink, opacity: 0.65 }}>
          Signed off before ordering
        </div>
      </div>
      <PhotoCard
        src={staticFile("motion/spec-delivery.png")}
        width={220}
        aspect={896 / 1120}
        x={980}
        y={470}
        rotate={3}
        delay={78}
        label="Delivery evidence"
      />
    </AbsoluteFill>
  );
}

function Beat4() {
  const { opacity } = useBeat(BEAT3_END, BEAT4_END, 15, 9);
  const local = useCurrentFrame() - BEAT3_END;
  const { fps } = useVideoConfig();
  const nodeT = spring({ frame: local, fps, config: { damping: 200 }, durationInFrames: 16 });

  const people: Array<{
    label: string;
    Icon: typeof HomeIcon;
    x: number;
    delay: number;
  }> = [
    { label: "Homeowner", Icon: HomeIcon, x: 330, delay: 22 },
    { label: "Trade", Icon: TradeIcon, x: 640, delay: 32 },
    { label: "Supplier", Icon: SupplierIcon, x: 950, delay: 42 },
  ];

  const nodeX = 640;
  const nodeY = 380;
  const chipY = 560;

  return (
    <AbsoluteFill style={{ opacity, alignItems: "center" }}>
      <div style={{ marginTop: 84, textAlign: "center" }}>
        <Eyebrow delay={6}>04 — One shared record</Eyebrow>
        <KineticHeading text="Homeowner. Trade. Supplier." delay={12} fontSize={48} />
      </div>

      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        {people.map((p, i) => {
          const lineT = interpolate(local, [p.delay - 10, p.delay + 8], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const dx = p.x - nodeX;
          const midX = nodeX + dx * 0.5;
          const midY = (nodeY + chipY) / 2 - 30;
          const path = `M ${nodeX} ${nodeY} Q ${midX} ${midY} ${p.x} ${chipY - 34}`;
          return (
            <path
              key={p.label}
              d={path}
              fill="none"
              stroke={palette.clayDeep}
              strokeOpacity={0.45}
              strokeWidth={2.5}
              pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: 1 - lineT }}
            />
          );
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          left: nodeX,
          top: nodeY,
          transform: `translate(-50%,-50%) scale(${interpolate(nodeT, [0, 1], [0.7, 1])})`,
          opacity: interpolate(nodeT, [0, 1], [0, 1]),
          background: palette.ink,
          color: palette.cream,
          borderRadius: 999,
          padding: "14px 26px",
          fontFamily,
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: "0.02em",
          boxShadow: "0 14px 30px rgba(26,23,20,0.28)",
        }}
      >
        The Spec
      </div>

      {people.map((p) => (
        <Chip key={p.label} delay={p.delay} x={p.x} y={chipY}>
          <p.Icon size={22} style={{ color: palette.clayDeep }} />
          {p.label}
        </Chip>
      ))}
    </AbsoluteFill>
  );
}

function Outro() {
  const { opacity } = useBeat(OUTRO_START, TOTAL - 2, 10, 10);
  const local = useCurrentFrame() - OUTRO_START;
  const { fps } = useVideoConfig();
  const s = spring({ frame: local, fps, config: { damping: 200 }, durationInFrames: 20 });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity }}>
      <div
        style={{
          fontFamily,
          fontWeight: 600,
          fontSize: 44,
          color: palette.ink,
          opacity: interpolate(s, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(s, [0, 1], [12, 0])}px)`,
        }}
      >
        Takeoff
      </div>
      <div
        style={{
          fontFamily,
          fontWeight: 500,
          fontSize: 24,
          color: palette.ink,
          opacity: interpolate(s, [0, 1], [0, 0.75]),
          marginTop: 8,
        }}
      >
        Renovation, with context.
      </div>
    </AbsoluteFill>
  );
}

export function SpecStory() {
  const fontsReady = useBeatrice();
  return (
    <AbsoluteFill style={{ background: palette.cream }}>
      <Backdrop />
      {fontsReady && (
        <>
          <Intro />
          <Beat1 />
          <Beat2 />
          <Beat3 />
          <Beat4 />
          <Outro />
        </>
      )}
    </AbsoluteFill>
  );
}

export const SPEC_STORY_TOTAL_FRAMES = TOTAL;
