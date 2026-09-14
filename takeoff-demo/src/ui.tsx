import React from "react";
import { interpolate, spring, Img, staticFile } from "remotion";

export const C = {
  ink: "#242728",
  muted: "#777d80",
  line: "#e2e4e5",
  orange: "#D9552B",
  green: "#428365",
  blue: "#367af1",
};
export const clamp = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
export const settle = (t: number, start = 0, duration = 0.32) =>
  spring({
    fps: 30,
    frame: Math.max(0, (t - start) * 30),
    durationInFrames: duration * 30,
    config: { damping: 24, stiffness: 240, mass: 1 },
  });
export function Enter({
  t,
  at = 0,
  children,
  style = {},
}: {
  t: number;
  at?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const p = settle(t, at);
  return (
    <div
      style={{
        opacity: clamp(t, at, at + 0.2),
        transform: `translateY(${(1 - p) * 10}px) scale(${0.96 + 0.04 * p})`,
        transformOrigin: "50% 20%",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
export function Bubble({
  children,
  user = false,
}: {
  children: React.ReactNode;
  user?: boolean;
}) {
  return <div className={`bubble ${user ? "user" : ""}`}>{children}</div>;
}
export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div className="chip">
      <span className="tiny-check">✓</span>
      {children}
    </div>
  );
}
export function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="card-heading">{title}</div>
      {children}
    </section>
  );
}
export function Action({
  children,
  secondary = false,
  t,
  at,
}: {
  children: React.ReactNode;
  secondary?: boolean;
  t?: number;
  at?: number;
}) {
  return (
    <div
      className={`action ${secondary ? "secondary" : ""}`}
      style={{
        transform:
          t !== undefined && at !== undefined
            ? `scale(${1 - 0.035 * Math.sin(clamp(t, at, at + 0.25) * Math.PI)})`
            : undefined,
      }}
    >
      {children}
      {t !== undefined && at !== undefined ? <Tap t={t} at={at} /> : null}
    </div>
  );
}
export function Tap({
  t,
  at,
  x = "50%",
  y = "50%",
}: {
  t: number;
  at: number;
  x?: string;
  y?: string;
}) {
  const p = clamp(t, at, at + 0.2);
  return t >= at && t < at + 0.2 ? (
    <span
      className="tap"
      style={{
        left: x,
        top: y,
        opacity: (1 - p) * 0.65,
        transform: `translate(-50%,-50%) scale(${0.8 + 0.5 * p})`,
      }}
    />
  ) : null;
}
export function TileImage({ height = 180 }: { height?: number }) {
  return (
    <Img
      src={staticFile("puget-sound.svg")}
      style={{
        width: "100%",
        height,
        objectFit: "cover",
        display: "block",
        borderRadius: 10,
      }}
    />
  );
}
export function Roll({
  t,
  events,
  initial,
}: {
  t: number;
  events: { at: number; value: string }[];
  initial: string;
}) {
  let before = initial,
    after = initial,
    at = -1;
  for (const event of events) {
    if (t >= event.at) {
      before = after;
      after = event.value;
      at = event.at;
    }
  }
  const p = at < 0 ? 1 : settle(t, at, 0.32);
  return (
    <span className="roll">
      <span
        style={{
          transform: `translateY(${-p * 100}%)`,
          visibility: p >= 1 ? "hidden" : "visible",
        }}
      >
        {before}
      </span>
      <span style={{ transform: `translateY(${(1 - p) * 100}%)` }}>
        {after}
      </span>
      <span className="roll-size">
        {p >= 1 || after.length >= before.length ? after : before}
      </span>
    </span>
  );
}
export function Label({ children, t }: { children: string; t: number }) {
  return t < 1.2 ? <div className="scene-label">{children}</div> : null;
}
