import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Freeze,
  Img,
  OffthreadVideo,
  staticFile,
} from "remotion";
import { palette, fonts, easeOutCubic, progress } from "./theme";

// -- Fonts ----------------------------------------------------------------
// The case study's Beatrice family lives outside `public/`, so it is
// symlinked into public/motion-research/fonts and loaded here via the
// FontFace API before the film ever paints a frame.
const BEATRICE_FILES: [string, number][] = [
  ["beatrice-regular", 400],
  ["beatrice-medium", 500],
  ["beatrice-semibold", 600],
  ["beatrice-bold", 700],
];

export function FontLoader({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("Loading Beatrice"));

  useEffect(() => {
    Promise.all(
      BEATRICE_FILES.map(([file, weight]) => {
        const face = new FontFace(
          fonts.regular,
          `url(${staticFile(`motion-research/fonts/${file}.ttf`)})`,
          { weight: String(weight) },
        );
        return face.load().then((loaded) => {
          document.fonts.add(loaded);
        });
      }),
    )
      .then(() => {
        setReady(true);
        continueRender(handle);
      })
      .catch((err) => {
        console.error("Beatrice font load failed", err);
        setReady(true);
        continueRender(handle);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}

// -- Layout primitives ------------------------------------------------------

export function Backdrop({ tint = palette.cream }: { tint?: string }) {
  return (
    <AbsoluteFill
      style={{
        background: tint,
        backgroundImage: `radial-gradient(1100px 640px at 18% -10%, ${palette.sageWash} 0%, transparent 60%), radial-gradient(900px 560px at 108% 112%, ${palette.clayWash} 0%, transparent 55%)`,
      }}
    />
  );
}

export function Eyebrow({
  children,
  accent = palette.sageDeep,
}: {
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: fonts.regular,
        fontWeight: fonts.weight.semibold,
        fontSize: 18,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: accent,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: accent,
          flex: "none",
        }}
      />
      {children}
    </div>
  );
}

export function Heading({
  children,
  size = 52,
  maxWidth = 900,
}: {
  children: React.ReactNode;
  size?: number;
  maxWidth?: number;
}) {
  return (
    <h2
      style={{
        margin: "18px 0 0",
        fontFamily: fonts.regular,
        fontWeight: fonts.weight.semibold,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: "-0.01em",
        color: palette.ink,
        maxWidth,
      }}
    >
      {children}
    </h2>
  );
}

/** Generic enter/hold/exit wrapper shared by every beat layer. */
export function BeatLayer({
  frame,
  start,
  end,
  overlap,
  rise = 26,
  children,
}: {
  frame: number;
  start: number;
  end: number;
  overlap: number;
  rise?: number;
  children: React.ReactNode;
}) {
  const inT = progress(frame, start, overlap);
  const outT = progress(frame, end - overlap, overlap);
  const opacity = Math.min(inT, 1 - outT);
  if (opacity <= 0) return null;
  const translateY = (1 - inT) * rise + outT * -rise * 0.6;
  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

// -- Media card ---------------------------------------------------------
// The takeoff-studies-v1 prototype clips share one app-shell composition
// centered in a 1080x1080 frame; a 0.54 aspect crop, centered, isolates
// just that phone card across every clip without per-source tuning.
const CARD_ASPECT = 0.54;

export function PhoneCard({
  media,
  width = 300,
  frame,
}: {
  media:
    | { kind: "video"; src: string; freezeAt: number }
    | { kind: "image"; src: string };
  width?: number;
  frame?: number;
}) {
  const height = width / CARD_ASPECT;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 28,
        overflow: "hidden",
        background: palette.paper,
        border: `1px solid ${palette.line}`,
        boxShadow: "0 28px 60px -28px rgba(26,23,20,0.35)",
        flex: "none",
      }}
    >
      {media.kind === "video" ? (
        <Freeze frame={Math.round(media.freezeAt * 30)}>
          <OffthreadVideo
            muted
            src={staticFile(media.src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </Freeze>
      ) : (
        <Img
          src={staticFile(`motion-research/images/${media.src}.webp`)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </div>
  );
}

export function PortraitCard({
  image,
  width = 220,
}: {
  image: string;
  width?: number;
}) {
  return (
    <div
      style={{
        width,
        height: width * 1.12,
        borderRadius: 20,
        overflow: "hidden",
        border: `1px solid ${palette.line}`,
        boxShadow: "0 22px 46px -26px rgba(26,23,20,0.32)",
        flex: "none",
      }}
    >
      <Img
        src={staticFile(`motion-research/images/${image}.webp`)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

// -- Stage beat -----------------------------------------------------------
// The two-column "list of findings + crossfading media" layout shared by
// the Five Needs and Four Risks beats: a numbered row list on the left
// whose active row is synced to a single phone card crossfading through
// each item's evidence on the right.
export interface StageItem {
  label: string;
  detail: string;
  media:
    | { kind: "video"; src: string; freezeAt: number }
    | { kind: "image"; src: string };
}

export function StageBeat({
  frame,
  contentStart,
  contentEnd,
  items,
  accent,
}: {
  frame: number;
  contentStart: number;
  contentEnd: number;
  items: StageItem[];
  accent: string;
}) {
  const perItem = (contentEnd - contentStart) / items.length;
  const activeIndex = Math.min(
    items.length - 1,
    Math.max(0, Math.floor((frame - contentStart) / perItem)),
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 72, marginTop: 40 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, flex: "none", width: 620 }}>
        {items.map((item, i) => {
          const itemStart = contentStart + i * perItem;
          const rowIn = progress(frame, itemStart - 12, 14);
          const active = i === activeIndex;
          return (
            <div
              key={item.label}
              style={{
                opacity: 0.35 + rowIn * (active ? 0.65 : 0.3),
                display: "flex",
                alignItems: "baseline",
                gap: 20,
                borderLeft: `3px solid ${active ? accent : palette.line}`,
                paddingLeft: 22,
                transition: "none",
              }}
            >
              <span
                style={{
                  fontFamily: fonts.regular,
                  fontWeight: fonts.weight.semibold,
                  fontSize: 20,
                  color: active ? accent : palette.inkSoft,
                  width: 34,
                  flex: "none",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div
                  style={{
                    fontFamily: fonts.regular,
                    fontWeight: fonts.weight.semibold,
                    fontSize: 28,
                    color: palette.ink,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    marginTop: 5,
                    fontFamily: fonts.regular,
                    fontWeight: fonts.weight.regular,
                    fontSize: 20,
                    color: palette.inkSoft,
                    maxWidth: 480,
                  }}
                >
                  {item.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "relative", width: 260, height: 260 / CARD_ASPECT, flex: "none" }}>
        {items.map((item, i) => {
          const itemStart = contentStart + i * perItem;
          const itemEnd = itemStart + perItem;
          const opacity = Math.min(
            progress(frame, itemStart, 10),
            1 - progress(frame, itemEnd - 10, 10),
          );
          if (opacity <= 0) return null;
          return (
            <div key={item.label} style={{ position: "absolute", inset: 0, opacity }}>
              <PhoneCard media={item.media} width={260} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { palette, fonts, easeOutCubic, progress };
