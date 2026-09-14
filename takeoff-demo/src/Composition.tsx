import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Ask, Composer, Keyboard } from "./scenes/Ask";
import { Takeoff } from "./scenes/Takeoff";
import { Sample, LeadTime } from "./scenes/Supply";
import { Substitution, SignOff, OrderThread } from "./scenes/Decisions";
import { clamp, settle } from "./ui";

export const SCENES = [
  { at: 4, name: "Ask" },
  { at: 10, name: "Takeoff" },
  { at: 22, name: "Sample" },
  { at: 28, name: "Lead time" },
  { at: 38, name: "Substitution" },
  { at: 50, name: "Sign-off" },
  { at: 62, name: "Order thread" },
];
export function TakeoffFilm({ social = false }: { social?: boolean }) {
  const frame = useCurrentFrame();
  const time = frame / 30 + (social ? 38 : 0);
  if (time < 4) return <AbsoluteFill style={{ background: "#000" }} />;
  let index = SCENES.length - 1;
  while (index > 0 && time < SCENES[index].at) index--;
  const s = SCENES[index];
  const t = time - s.at;
  const status =
    index === 0
      ? t >= 1.7 && t < 2.5
        ? "Reading"
        : ""
      : index === 3 && t < 0.6
        ? "Checking stock"
        : index === 5
          ? t < 4
            ? "Waiting on 2"
            : t < 8
              ? "Waiting on 1"
              : "Approved"
          : "";
  const closing = social ? 0 : settle(time, 72, 2.8);
  const fade = social ? 0 : clamp(time, 73, 74.97);
  const tilt = Math.sin(Math.PI * clamp(t, 0, 0.7)) * 0.65;
  return (
    <AbsoluteFill
      style={{
        background: "#000",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div className="stage" style={{ opacity: 1 - fade }}>
        <div
          className="phone"
          style={{
            transform: `scale(${1.8 - 0.12 * closing}) perspective(1600px) rotateY(${tilt}deg) rotateX(${-tilt * 0.3}deg)`,
          }}
        >
          <div className="side-button left-one" />
          <div className="side-button left-two" />
          <div className="side-button right-one" />
          <div className="screen">
            <div className="status-bar">
              <span>9:41</span>
              <div className="status-icons">
                <svg width="17" height="13" viewBox="0 0 17 13">
                  <path
                    d="M1 12V9M5 12V6M9 12V3M13 12V0"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                </svg>
                <svg width="17" height="13" viewBox="0 0 17 13">
                  <path
                    d="M1 4Q8.5-2 16 4M4 7Q8.5 3 13 7M7 10Q8.5 8.5 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <div className="battery" />
              </div>
            </div>
            <div className="island" />
            <header className="thread-header">
              <span className="back-chevron">‹</span>
              <div className="agent-presence">
                <div className="agent-avatar">
                  <span />
                  <span />
                </div>
                <div className="agent-status">{status || " "}</div>
              </div>
              <span className="more">···</span>
            </header>
            <main className="thread">
              {index === 0 ? (
                <Ask t={t} />
              ) : index === 1 ? (
                <Takeoff t={t} />
              ) : index === 2 ? (
                <Sample t={t} />
              ) : index === 3 ? (
                <LeadTime t={t} />
              ) : index === 4 ? (
                <Substitution t={t} />
              ) : index === 5 ? (
                <SignOff t={t} />
              ) : (
                <OrderThread t={t} />
              )}
            </main>
            <Composer t={t} ask={index === 0} />
            {index === 0 ? <Keyboard t={t} /> : null}
            <div className="home-indicator" />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
export const SubstitutionFilm = () => <TakeoffFilm social />;
