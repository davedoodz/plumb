import React from "react";
import {
  AbsoluteFill,
  Freeze,
  Img,
  OffthreadVideo,
  staticFile,
} from "remotion";
import { settle } from "../ui";
import "./prototype.css";
export { settle, Roll } from "../ui";
export const progress = (t: number, a: number, b: number) =>
  Math.max(0, Math.min(1, (t - a) / (b - a)));
export type Point = { at: number; x: number; y: number; press?: boolean };
export function Cursor({ t, path }: { t: number; path: Point[] }) {
  let i = 0;
  while (i < path.length - 1 && t >= path[i + 1].at) i++;
  const a = path[i],
    b = path[Math.min(i + 1, path.length - 1)];
  const p = a === b ? 1 : settle(t, a.at, b.at - a.at);
  const x = a.x + (b.x - a.x) * p,
    y =
      a.y +
      (b.y - a.y) * p -
      Math.sin(Math.PI * p) * Math.min(14, Math.abs(b.x - a.x) * 0.07);
  const down = path.some((k) => k.press && t >= k.at && t < k.at + 0.2);
  return (
    <div
      className="proto-cursor"
      data-cursor="true"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%,-50%) scale(${down ? 0.78 : 1})`,
        background: down ? "rgba(50,54,53,.45)" : "rgba(255,255,255,.55)",
      }}
    />
  );
}
export function Stage({
  t,
  path,
  children,
  title = "Bathroom",
  draft = "",
  context = "Maya + Sam · 11 specs",
}: {
  t: number;
  path: Point[];
  children: React.ReactNode;
  title?: string;
  draft?: string;
  context?: string;
}) {
  return (
    <AbsoluteFill className="proto-stage">
      <div className="proto-app">
        <header className="proto-header">
          <span>☰</span>
          <div>
            <strong>
              Assistant <span>⌄</span>
            </strong>
            <small>
              {title} · {context}
            </small>
          </div>
          <span>＋</span>
        </header>
        <main className="proto-content">{children}</main>
        <footer className="proto-composer">
          <span>＋</span>
          <span className={draft ? "has-draft" : ""}>
            {draft || "Ask about this renovation"}
          </span>
          <b>↑</b>
        </footer>
        <Cursor t={t} path={path} />
      </div>
    </AbsoluteFill>
  );
}
export function In({
  t,
  at = 0,
  children,
  style,
}: {
  t: number;
  at?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const p = settle(t, at, 0.32);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${12 * (1 - p)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
export function Message({
  children,
  user = false,
}: {
  children: React.ReactNode;
  user?: boolean;
}) {
  return (
    <div className={user ? "proto-message user" : "proto-message"}>
      {children}
    </div>
  );
}
export function Card({
  title,
  eyebrow,
  children,
  style,
}: {
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section className="proto-card" style={style}>
      {eyebrow ? <small className="proto-eyebrow">{eyebrow}</small> : null}
      {title ? <h2>{title}</h2> : null}
      {children}
    </section>
  );
}
export function Photo({
  name,
  height = 190,
  style,
}: {
  name: "room" | "sample" | "pendant" | "entry";
  height?: number;
  style?: React.CSSProperties;
}) {
  return (
    <Img
      className="proto-photo"
      src={staticFile(`prototype-assets/${name}.png`)}
      style={{ height, ...style }}
    />
  );
}
export function Footage({
  name,
  t,
  height = 210,
}: {
  name: "room" | "sample";
  t: number;
  height?: number;
}) {
  return (
    <div className="proto-photo" style={{ height }}>
      <Freeze frame={Math.min(145, Math.max(0, Math.round(t * 30)))}>
        <OffthreadVideo
          muted
          src={staticFile(`prototype-assets/${name}.mp4`)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Freeze>
    </div>
  );
}
export function Button({
  children,
  secondary = false,
  approved = false,
  style,
}: {
  children: React.ReactNode;
  secondary?: boolean;
  approved?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`proto-button${secondary ? " secondary" : ""}${approved ? " approved" : ""}`}
      style={style}
    >
      {children}
    </div>
  );
}
export function Chip({
  children,
  approved = false,
}: {
  children: React.ReactNode;
  approved?: boolean;
}) {
  return (
    <div className={`proto-chip${approved ? " approved" : ""}`}>{children}</div>
  );
}
export function Row({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="proto-row" style={{ opacity: muted ? 0.55 : 1 }}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
export function Caption({
  children,
  warning = false,
}: {
  children: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <p className={`proto-caption${warning ? " warning" : ""}`}>{children}</p>
  );
}
