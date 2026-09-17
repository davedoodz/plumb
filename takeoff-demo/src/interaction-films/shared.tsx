import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "../chatgpt-studies/conversation.css";
import "./films.css";
export const useTime = () => useCurrentFrame() / useVideoConfig().fps;
export const ease = (t: number, start: number, duration = 0.4) =>
  interpolate(t, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
export const appear = (
  t: number,
  at: number,
  duration = 0.35,
  y = 12,
): CSSProperties => ({
  opacity: ease(t, at, duration),
  transform: `translateY(${(1 - ease(t, at, duration)) * y}px)`,
});
export function Check({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="m5 12 4 4 10-10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function Film({
  t,
  title,
  category,
  children,
}: {
  t: number;
  title: string;
  category: string;
  children: ReactNode;
}) {
  return (
    <AbsoluteFill className="cg-film mf-film">
      <div
        className="cg-phone"
        style={{ left: 147, top: 58, transform: "scale(2)" }}
      >
        <div className="cg-status">
          <strong>9:41</strong>
          <div>
            <svg width="17" height="12" viewBox="0 0 17 12">
              <path
                d="M1 11V8M5 11V5M9 11V3M13 11V0"
                stroke="currentColor"
                strokeWidth="2.5"
              />
            </svg>
            <span className="cg-battery" />
          </div>
        </div>
        <div className="cg-nav">
          <div className="cg-nav-circle">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 8h14M5 15h9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <strong className="mf-chat-title">
            ChatGPT <span>⌄</span>
          </strong>
          <div className="cg-nav-circle">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
              <path
                d="m14 5 5 5-9 9H5v-5zM14 5l2-2 5 5-2 2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div className="mf-stage">{children}</div>
        <div className="mf-composer">
          <span style={{ fontSize: 27 }}>+</span>
          <span style={{ flex: 1, color: "#999" }}>Ask anything</span>
          <svg width="18" height="22" viewBox="0 0 24 24" fill="none">
            <rect
              x="9"
              y="2"
              width="6"
              height="13"
              rx="3"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <path
              d="M5 11v1a7 7 0 0 0 14 0v-1M12 19v3"
              stroke="currentColor"
              strokeWidth="1.7"
            />
          </svg>
          <span className="mf-voice">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="cg-home-indicator" />
      </div>
      <div className="mf-caption">
        <div>
          <span>{category.toUpperCase()} / INTERACTION CONCEPT</span>
          <span>
            {t < 2
              ? "01 · THE NEED"
              : t < 8.5
                ? "02 · THE INTERACTION"
                : "03 · THE PAYOFF"}
          </span>
        </div>
        <strong>{title}</strong>
        <small>
          Concept animation · synthetic project · not affiliated with OpenAI
        </small>
      </div>
    </AbsoluteFill>
  );
}
export function Scene({
  t,
  from,
  to = 12,
  children,
  style,
}: {
  t: number;
  from: number;
  to?: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  if (t < from - 0.18 || t >= to + 0.18) return null;
  const a =
    (from === 0 ? 1 : ease(t, from - 0.18, 0.36)) *
    (to === 12 ? 1 : 1 - ease(t, to - 0.18, 0.36));
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: a,
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
  style,
}: {
  children: ReactNode;
  user?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: user ? "flex-end" : "flex-start",
        marginBottom: 20,
        ...style,
      }}
    >
      <div
        className={user ? "cg-user" : "cg-assistant"}
        style={
          user
            ? { minWidth: 0 }
            : { margin: 0, maxWidth: "100%", minWidth: 0, flexShrink: 1 }
        }
      >
        {children}
      </div>
    </div>
  );
}
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className="mf-card" style={style}>
      {children}
    </div>
  );
}
export function Label({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className="mf-label" style={style}>
      {children}
    </div>
  );
}
export function Chip({
  children,
  active = false,
  style,
}: {
  children: ReactNode;
  active?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span className={`mf-chip ${active ? "active" : ""}`} style={style}>
      {children}
    </span>
  );
}
export function Action({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className="mf-action" style={style}>
      {children}
    </div>
  );
}
export function Photo({
  name,
  height = 220,
  style,
}: {
  name: string;
  height?: number;
  style?: CSSProperties;
}) {
  return (
    <Img
      src={staticFile(`pilot-assets/${name}`)}
      style={{
        width: "100%",
        height,
        objectFit: "cover",
        borderRadius: 17,
        display: "block",
        ...style,
      }}
    />
  );
}
export function Touch({
  t,
  at,
  x,
  y,
  to,
  duration = 0.65,
}: {
  t: number;
  at: number;
  x: number;
  y: number;
  to?: { x: number; y: number };
  duration?: number;
}) {
  const p = ease(t, at, duration);
  const opacity = ease(t, at, 0.1) * (1 - ease(t, at + duration, 0.22));
  if (t < at || t > at + duration + 0.25) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x + (to ? (to.x - x) * p : 0) - 14,
        top: y + (to ? (to.y - y) * p : 0) - 14,
        width: 28,
        height: 28,
        borderRadius: 30,
        border: "1.2px solid #1115",
        background: "#ffffffb8",
        boxShadow: "0 1px 7px #0003",
        transform: `scale(${to ? 1 : 1 - 0.15 * Math.sin(p * Math.PI)})`,
        opacity,
        zIndex: 100,
        pointerEvents: "none",
      }}
    />
  );
}
export function Outcome({
  t,
  at = 8.5,
  title,
  detail,
  photo,
}: {
  t: number;
  at?: number;
  title: string;
  detail: string;
  photo?: string;
}) {
  return (
    <div style={{ ...appear(t, at), marginTop: 22 }}>
      {photo && (
        <Photo name={photo} height={225} style={{ marginBottom: 20 }} />
      )}
      <Label
        style={{ display: "flex", alignItems: "center", gap: 6, color: "#333" }}
      >
        <Check /> Attached to the conversation
      </Label>
      <div
        style={{
          fontSize: 23,
          lineHeight: 1.2,
          fontWeight: 550,
          letterSpacing: "-.035em",
          margin: "13px 0",
        }}
      >
        {title}
      </div>
      <Message>{detail}</Message>
    </div>
  );
}
