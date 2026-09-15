import "./shell.css";
import React from "react";
import { settle, clamp } from "../ui";

export type ChatVariant = "chatgpt" | "claude";

/** ChatGPT-style streaming: ms revealed per word. */
const WORD_MS = 40;
/** Claude-style streaming: ms revealed per phrase chunk. */
const PHRASE_MS = 120;
/** Words grouped into one Claude phrase chunk. */
const PHRASE_SIZE = 3;
/** User pill entrance spring duration, seconds. */
const USER_SPRING_S = 0.25;

function svgProps(size: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

// Minimal neutral line icons — no brand marks, no wordmarks.
const HamburgerIcon = () => (
  <svg {...svgProps(18)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
const NewChatIcon = () => (
  <svg {...svgProps(18)}>
    <rect x="4" y="4" width="16" height="16" rx="4" />
    <path d="M12 9v6M9 12h6" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg {...svgProps(13)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg {...svgProps(18)}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);
const DotsIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="19" cy="12" r="1.7" />
  </svg>
);
const PlusIcon = () => (
  <svg {...svgProps(17)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const ArrowUpIcon = () => (
  <svg {...svgProps(16)} strokeWidth={2}>
    <path d="M12 19V6M6 11l6-5 6 5" />
  </svg>
);
const AssistantGlyph = () => (
  <svg {...svgProps(12)}>
    <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
    <circle cx="12" cy="12" r="2.1" />
  </svg>
);

function splitPhrases(text: string, size: number): string[] {
  const words = text.split(" ");
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += size) {
    chunks.push(words.slice(i, i + size).join(" "));
  }
  return chunks;
}

export function ChatShell({
  variant,
  label,
  labelTime = 0,
  children,
}: {
  variant: ChatVariant;
  label?: string;
  labelTime?: number;
  children: React.ReactNode;
}) {
  const isGpt = variant === "chatgpt";
  return (
    <div className={`chat-film chat-film--${variant}`}>
      <div className="chat-canvas">
        <div className="chat-topbar">
          {isGpt ? (
            <>
              <span className="chat-icon-btn">
                <HamburgerIcon />
              </span>
              <div className="chat-topbar-title">
                <span>Assistant</span>
                <ChevronDownIcon />
              </div>
              <span className="chat-icon-btn">
                <NewChatIcon />
              </span>
            </>
          ) : (
            <>
              <span className="chat-icon-btn">
                <ChevronLeftIcon />
              </span>
              <div className="chat-topbar-title chat-topbar-title--serif">
                Bathroom
              </div>
              <span className="chat-icon-btn">
                <DotsIcon />
              </span>
            </>
          )}
        </div>
        {label && labelTime < 1.2 ? (
          <div className="chat-scene-label">{label}</div>
        ) : null}
        <div className="chat-content">{children}</div>
        <div className="chat-composer-wrap">
          <div
            className={`chat-composer-field${isGpt ? "" : " chat-composer-field--tall"}`}
          >
            <span className="chat-composer-plus">
              <PlusIcon />
            </span>
            <span className="chat-composer-placeholder">Message</span>
            <span
              className={`chat-composer-send${isGpt ? " chat-composer-send--circle" : " chat-composer-send--square"}`}
            >
              <ArrowUpIcon />
            </span>
          </div>
          {isGpt ? null : (
            <div className="chat-model-selector">
              <span>Model</span>
              <ChevronDownIcon />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatMessage({
  variant,
  t,
  at = 0,
  children,
  user = false,
  staticText = false,
}: {
  variant: ChatVariant;
  t: number;
  at?: number;
  children: string;
  user?: boolean;
  staticText?: boolean;
}) {
  const units = React.useMemo(
    () =>
      variant === "chatgpt"
        ? children.split(" ")
        : splitPhrases(children, PHRASE_SIZE),
    [children, variant],
  );
  const lt = t - at;
  if (lt < 0) return null;
  const isGpt = variant === "chatgpt";

  if (user) {
    const p = staticText ? 1 : settle(t, at, USER_SPRING_S);
    const style: React.CSSProperties = staticText
      ? {}
      : {
          opacity: clamp(t, at, at + 0.16),
          transform: `translateY(${(1 - p) * 8}px) scale(${0.94 + 0.06 * p})`,
        };
    return (
      <div className="chat-msg chat-msg--user">
        <div className="chat-user-pill" style={style}>
          {children}
        </div>
      </div>
    );
  }

  let revealed = children;
  let done = true;
  if (!staticText) {
    const interval = isGpt ? WORD_MS : PHRASE_MS;
    const count = Math.max(1, Math.floor((lt * 1000) / interval) + 1);
    done = count >= units.length;
    revealed = units.slice(0, count).join(" ");
  }
  const showCursor = isGpt && !staticText && !done;

  return (
    <div className="chat-msg chat-msg--assistant">
      {isGpt ? (
        <span className="chat-avatar">
          <AssistantGlyph />
        </span>
      ) : null}
      <div
        className={`chat-assistant-text ${isGpt ? "chat-assistant-text--sans" : "chat-assistant-text--serif"}`}
      >
        {/* Hidden full-text sizer reserves final layout height so the
            visible streamed layer never reflows the messages beneath it. */}
        <div className="chat-text-sizer" aria-hidden="true">
          {children}
        </div>
        <div className="chat-text-stream">
          {revealed}
          {showCursor ? (
            <span
              className="chat-cursor"
              style={{ opacity: Math.floor(lt * 6) % 2 === 0 ? 1 : 0 }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
