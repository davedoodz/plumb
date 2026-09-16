import React from "react";
import {
  AbsoluteFill,
  Freeze,
  Img,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { move } from "../variants/shared";
import first from "./scenarios-a.json";
import second from "./scenarios-b.json";
import catalog from "./catalog.json";
import "./conversation.css";

export type Study = {
  id: string;
  concept: string;
  mode: string;
  category: string;
  title: string;
  user: string;
  assistant: string;
  sourceLabel: string;
  sourceNote: string;
  evidence: { label: string; value: string; state?: string }[];
  media: string;
  video?: string;
  compareMedia?: string;
  compareLabels?: string[];
  action: string;
  reply: string;
  result: string;
  status: string;
  marketPains: string[];
  boundary: string;
};
export const conversationStudies: Study[] = [...first, ...second];
const MODE_NAMES = Object.fromEntries(catalog.modes.map((m) => [m.id, m.name]));
const CATEGORY_NAMES: Record<string, string> = {
  tiles: "Tiles",
  framing: "Framing",
  paint: "Interior paint",
  lighting: "Light fixtures",
};
const TIME = {
  send: 1.2,
  posted: 1.4,
  answer: 2.1,
  evidence: 4.4,
  inspect: 6.2,
  close: 8.4,
  reply: 9.0,
  replySend: 10.2,
  replyPosted: 10.4,
  result: 11.2,
};
const PHONE = { left: 147, top: 64, scale: 2, width: 393, height: 852 };
const THREAD = { top: 108, height: 624 };

type IconName =
  | "menu"
  | "edit"
  | "more"
  | "plus"
  | "mic"
  | "send"
  | "voice"
  | "copy"
  | "like"
  | "dislike"
  | "share"
  | "close"
  | "chevron"
  | "file"
  | "check";
const PATHS: Record<IconName, React.ReactNode> = {
  menu: (
    <>
      <path d="M4 8h16M4 15h10" />
    </>
  ),
  edit: (
    <>
      <path d="M14 5l5 5M5 19l4-1L20 7a2 2 0 0 0-3-3L6 15l-1 4Z" />
      <path d="M12 4H5v16h15v-7" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  plus: <path d="M12 4v16M4 12h16" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M6 11v2a6 6 0 0 0 12 0v-2M12 19v3M8 22h8" />
    </>
  ),
  send: <path d="M12 19V5M6 11l6-6 6 6" />,
  voice: <path d="M4 10v4M8 6v12M12 3v18M16 7v10M20 9v6" />,
  copy: (
    <>
      <rect x="8" y="7" width="12" height="14" rx="2" />
      <path d="M15 7V3H4v14h4" />
    </>
  ),
  like: <path d="M8 10l4-7c2 0 3 1 2 5h5c2 0 2 2 1 5l-2 7H8V10ZM4 10v10" />,
  dislike: <path d="M8 14l4 7c2 0 3-1 2-5h5c2 0 2-2 1-5l-2-7H8v10ZM4 14V4" />,
  share: (
    <>
      <path d="M12 16V2M7 7l5-5 5 5M6 10H3v12h18V10h-3" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  file: (
    <>
      <path d="M5 2h9l5 5v15H5V2ZM14 2v6h5M8 12h8M8 16h8" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
};
function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
function reveal(t: number, at: number) {
  const p = move(t, at, 0.24);
  return { opacity: p, transform: `translateY(${(1 - p) * 8}px)` };
}
function stream(text: string, t: number, at: number, duration: number) {
  const n = Math.floor(move(t, at, duration) * text.length);
  return text.slice(0, n);
}
function Media({
  study,
  t,
  secondary = false,
}: {
  study: Study;
  t: number;
  secondary?: boolean;
}) {
  const filename = secondary ? study.compareMedia : study.media;
  if (!filename) throw new Error(`Missing comparison media: ${study.id}`);
  if (study.video && !secondary) {
    return (
      <Freeze
        frame={Math.min(144, Math.max(0, Math.floor((t - TIME.posted) * 30)))}
      >
        <OffthreadVideo
          src={staticFile(`pilot-assets/${study.video}`)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Freeze>
    );
  }
  return (
    <Img
      src={staticFile(`pilot-assets/${filename}`)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}
function Tools() {
  return (
    <div className="cg-response-tools" aria-hidden="true">
      {(["copy", "like", "dislike", "share", "more"] as IconName[]).map(
        (name) => (
          <Icon key={name} name={name} size={17} />
        ),
      )}
    </div>
  );
}
function Evidence({ study }: { study: Study }) {
  return (
    <div className="cg-facts" data-review-region="evidence-facts">
      {study.evidence.map((row) => (
        <div className={`cg-fact cg-state-${row.state ?? "default"}`} key={row.label}>
          <span>{row.label}</span>
          <strong>{row.value}</strong>
        </div>
      ))}
    </div>
  );
}
function Card({
  study,
  t,
  height,
}: {
  study: Study;
  t: number;
  height: number;
}) {
  const source = study.mode === "source";
  const compare = study.mode === "compare";
  const photo = study.mode === "photo";
  const active = t >= TIME.inspect && study.mode !== "source";
  return (
    <div
      className={`cg-card ${study.mode}`}
      style={{ height, ...reveal(t, TIME.evidence) }}
      data-review-region="procurement-card"
    >
      {compare ? (
        <div className="cg-comparison">
          {[false, true].map((secondary, i) => (
            <div key={i}>
              <div className="cg-comparison-media">
                <Media study={study} t={t} secondary={secondary} />
              </div>
              <span>{study.compareLabels?.[i]}</span>
            </div>
          ))}
        </div>
      ) : photo ? (
        <div className="cg-card-eyebrow">Takeoff · evidence check</div>
      ) : (
        <div className="cg-card-heading">
          <div className="cg-card-thumb">
            <Media study={study} t={t} />
          </div>
          <div>
            <span className="cg-card-eyebrow">
              {source ? "Source attachment" : "Takeoff · demo record"}
            </span>
            <strong>{study.sourceLabel}</strong>
          </div>
        </div>
      )}
      {source ? (
        <p className="cg-source-preview">{study.sourceNote}</p>
      ) : (
        <Evidence study={study} />
      )}
      <div
        className={`cg-card-action ${active ? "selected" : ""}`}
        data-target="card-action"
      >
        {source ? (
          <>
            <Icon name="file" size={17} />
            View source
            <Icon name="chevron" size={14} />
          </>
        ) : (
          <>
            {active && <Icon name="check" size={16} />}
            <span>{active ? "Added to reply" : study.action}</span>
          </>
        )}
      </div>
    </div>
  );
}
function SourceSheet({ study, t }: { study: Study; t: number }) {
  const p = move(t, TIME.inspect, 0.28) * (1 - move(t, TIME.close, 0.24));
  if (p === 0) return null;
  return (
    <>
      <div className="cg-dim" style={{ opacity: p * 0.2 }} />
      <div
        className="cg-sheet"
        style={{ transform: `translateY(${(1 - p) * 680}px)` }}
        data-review-region="source-sheet"
      >
        <div className="cg-grabber" />
        <div className="cg-sheet-nav">
          <strong>Source details</strong>
          <div data-target="close-source">
            <Icon name="close" size={20} />
          </div>
        </div>
        <div className="cg-sheet-media">
          <Media study={study} t={t} />
        </div>
        <p className="cg-source-label">{study.sourceLabel}</p>
        <Evidence study={study} />
        <p className="cg-source-note">{study.sourceNote}</p>
        <p className="cg-sheet-boundary">
          Synthetic pilot evidence · not a live supplier record
        </p>
      </div>
    </>
  );
}
function Touch({
  t,
  actionY,
  source,
}: {
  t: number;
  actionY: number;
  source: boolean;
}) {
  const points = [
    { at: 0, x: 354, y: 781 },
    { at: TIME.send, x: 354, y: 781 },
    { at: TIME.send + 0.22, x: 354, y: 781 },
    { at: TIME.inspect, x: 196, y: actionY },
    { at: TIME.inspect + 0.25, x: 196, y: actionY },
    ...(source
      ? [
          { at: TIME.close, x: 358, y: 244 },
          { at: TIME.close + 0.2, x: 358, y: 244 },
        ]
      : []),
    { at: TIME.replySend, x: 354, y: 781 },
    { at: TIME.replySend + 0.2, x: 354, y: 781 },
    { at: 15, x: 367, y: 717 },
  ];
  let x = points[0].x,
    y = points[0].y;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i],
      b = points[i + 1];
    if (t >= a.at) {
      const p = move(t, a.at, Math.max(0.01, b.at - a.at));
      x = a.x + (b.x - a.x) * p;
      y = a.y + (b.y - a.y) * p;
    }
  }
  const pressed = [
    TIME.send,
    TIME.inspect,
    ...(source ? [TIME.close] : []),
    TIME.replySend,
  ].some((at) => t >= at && t < at + 0.2);
  return (
    <div
      data-cursor="true"
      className={`cg-touch ${pressed ? "pressed" : ""}`}
      style={{ left: x - 10, top: y - 10 }}
    />
  );
}
export const ConversationStudy: React.FC<{ study: Study }> = ({ study }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const photo = study.mode === "photo";
  const userHeight = photo ? 276 : 112;
  const cardHeight =
    study.mode === "compare"
      ? 342
      : photo
        ? 228
        : study.mode === "source"
          ? 222
          : 280;
  const firstHeight = userHeight + 100 + cardHeight + 36 + 24;
  const baseScroll =
    Math.max(0, firstHeight - THREAD.height + 12) * move(t, 4.25, 0.45);
  const finalScroll = Math.max(0, firstHeight + 290 - THREAD.height + 12);
  const scroll =
    baseScroll + (finalScroll - baseScroll) * move(t, TIME.replyPosted, 0.55);
  const actionY =
    THREAD.top +
    userHeight +
    12 +
    100 +
    12 +
    cardHeight -
    30 -
    Math.max(0, firstHeight - THREAD.height + 12);
  const writing = t < TIME.posted || (t >= TIME.reply && t < TIME.replyPosted);
  const draft =
    t < TIME.posted
      ? stream(study.user, t, 0.1, 0.7)
      : t < TIME.replyPosted
        ? stream(study.reply, t, TIME.reply, 0.7)
        : "";
  const responseText = stream(study.assistant, t, TIME.answer, 1.6);
  const resultText = stream(study.result, t, TIME.result, 1.6);
  return (
    <AbsoluteFill
      className="cg-film"
      data-study={study.id}
      data-time={t.toFixed(2)}
    >
      <div
        className="cg-phone"
        style={{
          left: PHONE.left,
          top: PHONE.top,
          transform: `scale(${PHONE.scale})`,
        }}
      >
        <div className="cg-status">
          <strong>9:41</strong>
          <div>
            <svg width="18" height="12" viewBox="0 0 18 12">
              <path
                d="M1 11V8M5 11V6M9 11V3M13 11V0"
                stroke="currentColor"
                strokeWidth="2.7"
              />
            </svg>
            <svg width="16" height="12" viewBox="0 0 20 15">
              <path
                d="M1 4Q10-3 19 4M4 8Q10 3 16 8M8 12Q10 10 12 12"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <span className="cg-battery" />
          </div>
        </div>
        <div className="cg-nav">
          <div className="cg-nav-circle">
            <Icon name="menu" />
          </div>
          <div className="cg-nav-pill">
            <Icon name="edit" />
            <Icon name="more" />
          </div>
        </div>
        <div
          className="cg-thread"
          style={{ top: THREAD.top, height: THREAD.height }}
        >
          <div
            className="cg-thread-content"
            style={{ transform: `translateY(${-scroll}px)` }}
          >
            <div
              className="cg-user-group"
              data-review-region="opening-group"
              style={{ height: userHeight, ...reveal(t, TIME.posted) }}
            >
              {photo && (
                <div className="cg-user-photo">
                  <Media study={study} t={t} />
                  {study.video && (
                    <span className="cg-video-tag">0:05 · site clip</span>
                  )}
                </div>
              )}
              <div className="cg-user" data-review-region="opening-message">
                {study.user}
              </div>
            </div>
            <div
              className="cg-assistant"
              style={{ height: 100, ...reveal(t, TIME.answer) }}
              data-review-region="assistant-answer"
            >
              {responseText || <span className="cg-thinking" />}
            </div>
            <Card study={study} t={t} height={cardHeight} />
            <div style={{ height: 36, opacity: move(t, 4.3, 0.2) }}>
              <Tools />
            </div>
            <div className="cg-followup" style={reveal(t, TIME.replyPosted)}>
              <div className="cg-user" data-review-region="reply-message">
                {study.reply}
              </div>
            </div>
            <div
              className="cg-result"
              style={reveal(t, TIME.result)}
              data-review-region="result-message"
            >
              <div className={`cg-result-label ${study.status}`}>
                {study.status === "confirmed"
                  ? "Recorded in this demo"
                  : study.status === "blocked"
                    ? "Still blocked"
                    : "Needs confirmation"}
              </div>
              <p>{resultText}</p>
              <Tools />
            </div>
          </div>
        </div>
        <div className="cg-composer-fade" />
        <div
          className={`cg-composer ${writing ? "writing" : ""}`}
          data-review-region="composer"
        >
          <Icon name="plus" size={22} />
          <div className="cg-composer-text">
            {draft || <span>Ask ChatGPT</span>}
          </div>
          {!writing && <Icon name="mic" size={18} />}
          <div className="cg-send" data-target="send-message">
            <Icon name={writing ? "send" : "voice"} size={20} />
          </div>
        </div>
        <div className="cg-home-indicator" />
        {study.mode === "source" && <SourceSheet study={study} t={t} />}
        <Touch t={t} actionY={actionY} source={study.mode === "source"} />
      </div>
      <div className="cg-caption">
        <span>TAKEOFF / {CATEGORY_NAMES[study.category]}</span>
        <strong>{study.title}</strong>
        <small>{MODE_NAMES[study.mode]} · ChatGPT iOS interaction study</small>
        <small>
          Synthetic content · simulated integration · not affiliated with OpenAI
        </small>
      </div>
    </AbsoluteFill>
  );
};
