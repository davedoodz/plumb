import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import {
  BEATS,
  NEEDS,
  NEXT,
  PILOT,
  READINESS,
  RISKS,
  ROLES,
  TITLE,
} from "./content";
import { OVERLAP } from "./content";
import {
  Backdrop,
  BeatLayer,
  Eyebrow,
  FontLoader,
  Heading,
  PhoneCard,
  PortraitCard,
  StageBeat,
  fonts,
  palette,
  progress,
} from "./kit";
import { MARGIN_TOP, MARGIN_X } from "./theme";

const PANEL: React.CSSProperties = {
  position: "absolute",
  left: MARGIN_X,
  right: MARGIN_X,
  top: MARGIN_TOP,
};

function TitleBeat({ frame, beat }: { frame: number; beat: (typeof BEATS)[number] }) {
  const local = frame - beat.start;
  const eyebrowIn = progress(local, 6, 18);
  const headIn = progress(local, 22, 26);
  const subIn = progress(local, 48, 26);
  return (
    <div style={PANEL}>
      <div style={{ opacity: eyebrowIn, transform: `translateY(${(1 - eyebrowIn) * 12}px)` }}>
        <Eyebrow>{TITLE.eyebrow}</Eyebrow>
      </div>
      <h1
        style={{
          margin: "26px 0 0",
          fontFamily: fonts.regular,
          fontWeight: fonts.weight.semibold,
          fontSize: 62,
          lineHeight: 1.08,
          letterSpacing: "-0.01em",
          color: palette.ink,
          maxWidth: 980,
          opacity: headIn,
          transform: `translateY(${(1 - headIn) * 20}px)`,
        }}
      >
        {TITLE.heading}
      </h1>
      <p
        style={{
          margin: "28px 0 0",
          fontFamily: fonts.regular,
          fontWeight: fonts.weight.regular,
          fontSize: 25,
          lineHeight: 1.4,
          color: palette.inkSoft,
          maxWidth: 780,
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 14}px)`,
        }}
      >
        {TITLE.sub}
      </p>
    </div>
  );
}

function RolesBeat({ frame, beat }: { frame: number; beat: (typeof BEATS)[number] }) {
  const contentStart = beat.start + OVERLAP;
  return (
    <div style={PANEL}>
      <Eyebrow>{ROLES.eyebrow}</Eyebrow>
      <Heading>{ROLES.heading}</Heading>
      <div style={{ display: "flex", gap: 36, marginTop: 56 }}>
        {ROLES.cards.map((card, i) => {
          const t = progress(frame, contentStart + 8 + i * 12, 22);
          return (
            <div
              key={card.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 18,
                opacity: t,
                transform: `translateY(${(1 - t) * 30}px) scale(${0.96 + t * 0.04})`,
              }}
            >
              <PortraitCard image={card.image} width={236} />
              <div>
                <div
                  style={{
                    fontFamily: fonts.regular,
                    fontWeight: fonts.weight.semibold,
                    fontSize: 26,
                    color: palette.ink,
                  }}
                >
                  {card.name}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: fonts.regular,
                    fontWeight: fonts.weight.regular,
                    fontSize: 19,
                    lineHeight: 1.35,
                    color: palette.inkSoft,
                    maxWidth: 236,
                  }}
                >
                  {card.duty}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NeedsBeat({ frame, beat }: { frame: number; beat: (typeof BEATS)[number] }) {
  const contentStart = beat.start + OVERLAP;
  const contentEnd = beat.end - OVERLAP;
  return (
    <div style={PANEL}>
      <Eyebrow accent={palette.sageDeep}>{NEEDS.eyebrow}</Eyebrow>
      <Heading>{NEEDS.heading}</Heading>
      <StageBeat
        frame={frame}
        contentStart={contentStart}
        contentEnd={contentEnd}
        items={NEEDS.items}
        accent={palette.sageDeep}
      />
    </div>
  );
}

function RisksBeat({ frame, beat }: { frame: number; beat: (typeof BEATS)[number] }) {
  const contentStart = beat.start + OVERLAP;
  const contentEnd = beat.end - OVERLAP;
  return (
    <div style={PANEL}>
      <Eyebrow accent={palette.clayDeep}>{RISKS.eyebrow}</Eyebrow>
      <Heading>{RISKS.heading}</Heading>
      <StageBeat
        frame={frame}
        contentStart={contentStart}
        contentEnd={contentEnd}
        items={RISKS.items}
        accent={palette.clayDeep}
      />
    </div>
  );
}

function ReadinessBeat({ frame, beat }: { frame: number; beat: (typeof BEATS)[number] }) {
  const contentStart = beat.start + OVERLAP;
  return (
    <div style={PANEL}>
      <Eyebrow>{READINESS.eyebrow}</Eyebrow>
      <Heading maxWidth={760}>{READINESS.heading}</Heading>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 40 }}>
        {READINESS.rows.map((row, i) => {
          const t = progress(frame, contentStart + 6 + i * 14, 20);
          return (
            <div
              key={row.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity: t,
                transform: `translateX(${(1 - t) * -26}px)`,
                borderTop: `1px solid ${palette.line}`,
                paddingTop: 16,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  overflow: "hidden",
                  flex: "none",
                  border: `1px solid ${palette.line}`,
                }}
              >
                <Img
                  src={staticFile(`motion-research/images/${row.image}.webp`)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  fontFamily: fonts.regular,
                  fontWeight: fonts.weight.semibold,
                  fontSize: 23,
                  color: palette.ink,
                  width: 190,
                  flex: "none",
                }}
              >
                {row.name}
              </div>
              <div
                style={{
                  fontFamily: fonts.regular,
                  fontWeight: fonts.weight.regular,
                  fontSize: 22,
                  color: palette.inkSoft,
                }}
              >
                {row.question}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PilotBeat({ frame, beat }: { frame: number; beat: (typeof BEATS)[number] }) {
  const contentStart = beat.start + OVERLAP;
  const captionT = progress(frame, contentStart + 70, 20);
  return (
    <div style={PANEL}>
      <Eyebrow>{PILOT.eyebrow}</Eyebrow>
      <Heading>{PILOT.heading}</Heading>
      <div style={{ display: "flex", gap: 28, marginTop: 40 }}>
        {PILOT.tiles.map((tile, i) => {
          const t = progress(frame, contentStart + 6 + i * 10, 20);
          return (
            <div
              key={tile.name}
              style={{
                opacity: t,
                transform: `scale(${0.9 + t * 0.1})`,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                flex: "none",
              }}
            >
              <div
                style={{
                  width: 190,
                  height: 190,
                  borderRadius: 18,
                  overflow: "hidden",
                  background: palette.paper,
                  border: `1px solid ${palette.line}`,
                  boxShadow: "0 20px 40px -24px rgba(26,23,20,0.3)",
                }}
              >
                <Img
                  src={staticFile(`motion-research/images/${tile.image}.webp`)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  fontFamily: fonts.regular,
                  fontWeight: fonts.weight.semibold,
                  fontSize: 20,
                  color: palette.ink,
                }}
              >
                {tile.name}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 30,
          fontFamily: fonts.regular,
          fontWeight: fonts.weight.regular,
          fontSize: 17,
          color: palette.inkSoft,
          opacity: captionT,
        }}
      >
        {PILOT.caption}
      </div>
    </div>
  );
}

function NextBeat({ frame, beat }: { frame: number; beat: (typeof BEATS)[number] }) {
  const contentStart = beat.start + OVERLAP;
  const headingT = progress(frame, contentStart + 4, 22);
  const bodyT = progress(frame, contentStart + 20, 22);
  const mediaT = progress(frame, contentStart + 14, 24);
  const closeT = progress(frame, contentStart + 78, 24);
  return (
    <div style={PANEL}>
      <Eyebrow accent={palette.clayDeep}>{NEXT.eyebrow}</Eyebrow>
      <div style={{ display: "flex", alignItems: "center", gap: 72, marginTop: 32 }}>
        <div style={{ maxWidth: 560 }}>
          <h2
            style={{
              margin: 0,
              fontFamily: fonts.regular,
              fontWeight: fonts.weight.semibold,
              fontSize: 46,
              lineHeight: 1.12,
              color: palette.ink,
              opacity: headingT,
              transform: `translateY(${(1 - headingT) * 20}px)`,
            }}
          >
            {NEXT.heading}
          </h2>
          <p
            style={{
              marginTop: 22,
              fontFamily: fonts.regular,
              fontWeight: fonts.weight.regular,
              fontSize: 22,
              lineHeight: 1.42,
              color: palette.inkSoft,
              opacity: bodyT,
              transform: `translateY(${(1 - bodyT) * 16}px)`,
            }}
          >
            {NEXT.body}
          </p>
          <div
            style={{
              marginTop: 48,
              paddingTop: 22,
              borderTop: `1px solid ${palette.line}`,
              opacity: closeT,
              transform: `translateY(${(1 - closeT) * 14}px)`,
            }}
          >
            <div
              style={{
                fontFamily: fonts.regular,
                fontWeight: fonts.weight.semibold,
                fontSize: 20,
                color: palette.ink,
              }}
            >
              {NEXT.closeTitle}
            </div>
            <div
              style={{
                marginTop: 6,
                fontFamily: fonts.regular,
                fontWeight: fonts.weight.regular,
                fontSize: 16,
                color: palette.inkSoft,
              }}
            >
              {NEXT.closeCaveat}
            </div>
          </div>
        </div>
        <div
          style={{
            opacity: mediaT,
            transform: `translateY(${(1 - mediaT) * 22}px)`,
          }}
        >
          <PhoneCard media={NEXT.media} width={280} />
        </div>
      </div>
    </div>
  );
}

const BEAT_RENDERERS: Record<
  (typeof BEATS)[number]["id"],
  (props: { frame: number; beat: (typeof BEATS)[number] }) => React.ReactElement
> = {
  title: TitleBeat,
  roles: RolesBeat,
  needs: NeedsBeat,
  risks: RisksBeat,
  readiness: ReadinessBeat,
  pilot: PilotBeat,
  next: NextBeat,
};

const BEAT_TINT: Partial<Record<(typeof BEATS)[number]["id"], string>> = {
  risks: palette.clayWash,
  next: palette.clayWash,
};

export function ResearchSummaryFilm() {
  const frame = useCurrentFrame();
  return (
    <FontLoader>
      <AbsoluteFill>
        <Backdrop />
        {BEATS.map((beat) => {
          const Renderer = BEAT_RENDERERS[beat.id];
          const tint = BEAT_TINT[beat.id];
          return (
            <BeatLayer
              key={beat.id}
              frame={frame}
              start={beat.start}
              end={beat.end}
              overlap={OVERLAP}
            >
              {tint ? (
                <AbsoluteFill style={{ background: tint, opacity: 0.35 }} />
              ) : null}
              <Renderer frame={frame} beat={beat} />
            </BeatLayer>
          );
        })}
      </AbsoluteFill>
    </FontLoader>
  );
}
