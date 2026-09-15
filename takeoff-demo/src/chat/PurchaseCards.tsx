import React from "react";
import { Card, Roll, Tap, TileImage, settle, clamp } from "../ui";
import "./cards.css";

export type CardScene =
  | "takeoff"
  | "sample"
  | "lead"
  | "substitution"
  | "signoff"
  | "orders";

// Shared frame-driven entrance and card-to-chip transitions.

function Reveal({
  t,
  at = 0,
  dur = 0.25,
  style = {},
  children,
}: {
  t: number;
  at?: number;
  dur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const p = settle(t, at, dur);
  return (
    <div
      style={{
        opacity: clamp(t, at, at + 0.2),
        transform: `translateY(${(1 - p) * 12}px) scale(${0.97 + 0.03 * p})`,
        transformOrigin: "50% 10%",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Collapse intrinsic content height without a guessed expanded-card height.
function Collapse({
  t,
  enterAt = 0,
  collapseAt,
  dur = 0.2,
  chip,
  chipTone = "neutral",
  children,
}: {
  t: number;
  enterAt?: number;
  collapseAt?: number;
  dur?: number;
  chip?: React.ReactNode;
  chipTone?: "neutral" | "approve";
  children: React.ReactNode;
}) {
  const collapse = collapseAt !== undefined ? settle(t, collapseAt, dur) : 0;
  const chipStart = collapseAt !== undefined ? collapseAt + dur * 0.5 : 0;
  return (
    <div className="pc-wrap">
      <Reveal
        t={t}
        at={enterAt}
        style={{
          display: "grid",
          gridTemplateRows: `${1 - collapse}fr`,
          minHeight: 46,
        }}
      >
        <div style={{ minHeight: 0, overflow: "hidden" }}>
          <div
            style={{
              opacity:
                collapseAt !== undefined
                  ? 1 - clamp(t, collapseAt, collapseAt + dur * 0.7)
                  : 1,
              transform: `scale(${1 - 0.045 * collapse})`,
              transformOrigin: "50% 0%",
            }}
          >
            {children}
          </div>
        </div>
      </Reveal>
      {collapseAt !== undefined && chip ? (
        <div
          className="pc-chip"
          style={{
            position: "absolute",
            inset: "0 0 auto",
            opacity: clamp(t, chipStart, chipStart + 0.1),
          }}
        >
          <span className={`pc-chip-check ${chipTone}`}>✓</span>
          <span>{chip}</span>
        </div>
      ) : null}
    </div>
  );
}

function press(t: number, at: number) {
  return `scale(${1 - 0.035 * Math.sin(clamp(t, at, at + 0.25) * Math.PI)})`;
}

// ---------------------------------------------------------------------------
// Takeoff — herringbone selection is permanent (never reverts).
// ---------------------------------------------------------------------------

function TakeoffCard({ t }: { t: number }) {
  const herring = t >= 5;
  return (
    <Collapse
      t={t}
      enterAt={0.3}
      collapseAt={8.25}
      chip="Tile · 8 boxes · Added"
    >
      <Card title="Takeoff · Bathroom floor">
        <svg
          width="100%"
          height="100"
          viewBox="0 0 360 100"
          className="pc-diagram"
        >
          <defs>
            <pattern
              id="pc-straight"
              width="30"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 0H30V12H0Z"
                fill="#f5f6f6"
                stroke="#c3cacd"
                strokeWidth="0.7"
              />
            </pattern>
            <pattern
              id="pc-herring"
              width="22"
              height="22"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <path
                d="M0 0H22V11H0Z M11 11H22V22H11Z"
                fill="#f5f6f6"
                stroke="#c3cacd"
                strokeWidth="0.7"
              />
            </pattern>
          </defs>
          <rect
            x="135"
            y="6"
            width="90"
            height="70"
            fill={`url(#${herring ? "pc-herring" : "pc-straight"})`}
            stroke="#8d9599"
          />
          <text x="180" y="94" textAnchor="middle" fill="#767d81" fontSize="11">
            2.7 m
          </text>
          <text
            x="115"
            y="41"
            textAnchor="middle"
            transform="rotate(-90 115 41)"
            fill="#767d81"
            fontSize="11"
          >
            2.1 m
          </text>
        </svg>
        <div className="pc-facts">
          <div>
            <span>Area</span>
            <b>61 ft²</b>
          </div>
          <div>
            <span>Layout</span>
            <b>{herring ? "Herringbone" : "Straight"}</b>
          </div>
          <div>
            <span>Waste</span>
            <b>
              <Roll t={t} initial="10%" events={[{ at: 5, value: "15%" }]} />
            </b>
          </div>
          <div>
            <span>Order</span>
            <b>
              <Roll
                t={t}
                initial="67 ft²"
                events={[{ at: 5, value: "70.15 ft²" }]}
              />
            </b>
          </div>
        </div>
        <div className="pc-result">
          <Roll
            t={t}
            initial=""
            events={[
              { at: 1.2, value: "7 boxes" },
              { at: 5.85, value: "8 boxes" },
            ]}
          />
          <span className="pc-result-area">
            {t >= 1.2 ? " · " : ""}
            <Roll
              t={t}
              initial=""
              events={[
                { at: 1.2, value: "73.5 ft²" },
                { at: 5.85, value: "84 ft²" },
              ]}
            />
          </span>
        </div>
        <div className="pc-price">
          <Roll
            t={t}
            initial=""
            events={[
              { at: 2.1, value: "$1,397" },
              { at: 6.7, value: "$1,596" },
            ]}
          />
        </div>
        <div className="pc-note pc-note-orange">Waste shown, not hidden.</div>
        <div
          className="pc-note pc-note-grey"
          style={{ opacity: clamp(t, 5, 5.3) }}
        >
          +1 box layout allowance · separate from waste
        </div>
        <div className="pc-segments">
          {["Straight", "Herringbone", "Diagonal"].map((s, i) => (
            <div
              key={s}
              className={i === (herring ? 1 : 0) ? "pc-seg-selected" : ""}
            >
              {s}
              {i === 1 ? <Tap t={t} at={5} /> : null}
            </div>
          ))}
        </div>
        <div className="pc-actions">
          <div className="pc-action" style={{ transform: press(t, 8) }}>
            Add to plan
            <Tap t={t} at={8} />
          </div>
        </div>
      </Card>
    </Collapse>
  );
}

// ---------------------------------------------------------------------------
// Sample
// ---------------------------------------------------------------------------

function SampleCard({ t }: { t: number }) {
  return (
    <Collapse t={t} enterAt={1.3} collapseAt={4.75} chip="Sample · Arrives Wed">
      <Card title="Sample · Puget Sound gloss">
        <TileImage height={132} />
        <div className="pc-sample-meta">
          <b>Free</b>
          <span>Arrives Wed 17 Sept</span>
        </div>
        <div className="pc-actions">
          <div className="pc-action" style={{ transform: press(t, 4.5) }}>
            Order sample
            <Tap t={t} at={4.5} />
          </div>
        </div>
      </Card>
    </Collapse>
  );
}

// ---------------------------------------------------------------------------
// Lead time — four neutral lanes; only the plumber-crossing and overflow
// states use the orange failure accent (green stays reserved for approvals).
// ---------------------------------------------------------------------------

function LeadCard({ t }: { t: number }) {
  return (
    <Reveal t={t} at={1.3}>
      <Card title="Lead time · Bathroom">
        <div className="pc-timeline-title">
          14 Sept<span>20 Oct</span>
        </div>
        <div className="pc-chart">
          <div className="pc-today-line" />
          <div className="pc-plumber-line">
            <span>
              Plumber
              <br />
              <b>12 Oct</b>
            </span>
          </div>
          <div className="pc-lane">
            <div
              className={`pc-bar ${t >= 2.85 ? "pc-bar-late" : ""}`}
              style={{ width: `${(35 / 36) * 100 * settle(t, 2.05, 0.3)}%` }}
            >
              Tile · 3–5 wks
            </div>
            <span
              className="pc-caption pc-caption-orange"
              style={{ opacity: clamp(t, 2.85, 3.1) }}
            >
              5–19 Oct · Plumber date at risk
            </span>
          </div>
          <div className="pc-lane">
            <div
              className="pc-bar"
              style={{ width: `${39 * settle(t, 3.6, 0.3)}%` }}
            >
              Vanity · 2 wks
            </div>
          </div>
          <div className="pc-lane">
            <div
              className="pc-bar"
              style={{ width: `${40 * settle(t, 4.4, 0.3)}%` }}
            >
              Mirror · in stock
            </div>
          </div>
          <div
            className="pc-lane pc-lane-pendant"
            style={{ opacity: clamp(t, 6, 6.2) }}
          >
            <div
              className="pc-bar pc-bar-late"
              style={{ width: `${115 * settle(t, 6, 0.4)}%` }}
            >
              Pendant · 8 wks
            </div>
            <span className="pc-arrow" style={{ opacity: clamp(t, 6.2, 6.4) }}>
              →
            </span>
          </div>
        </div>
        <div
          className="pc-note pc-note-orange"
          style={{ opacity: clamp(t, 6.9, 7.15) }}
        >
          Lands 9 Nov · after the plumber. Not OK.
        </div>
      </Card>
    </Reveal>
  );
}

// ---------------------------------------------------------------------------
// Substitution — last row stays a blank dashed-orange field, never text.
// ---------------------------------------------------------------------------

const specRows = [
  { name: "Drop", a: "18 in", b: "18 in" },
  {
    name: "Clearance",
    a: "Passes",
    b: "Passes",
    note: "30 in required · 34 in vanity top",
  },
  { name: "Finish", a: "Brass", b: "Brass" },
  { name: "Lead time", a: "8 wks", b: "In stock" },
  { name: "Colour temp", a: "2700K", b: "" },
];

function SubstitutionCard({ t }: { t: number }) {
  return (
    <Collapse
      t={t}
      enterAt={0.9}
      collapseAt={8.25}
      chip="Pendant substitute · Selected · Pending sign-off"
    >
      <Card title="Spec · Pendant">
        <div className="pc-compare-head">
          <span>Specified</span>
          <b>Substitute</b>
        </div>
        {specRows.map((r, i) => {
          const at = 1.65 + i * 0.75;
          const p = settle(t, at, 0.25);
          return (
            <div
              key={r.name}
              className="pc-compare-row"
              style={{
                opacity: clamp(t, at, at + 0.25),
                transform: `translateY(${8 * (1 - p)}px)`,
              }}
            >
              <div className="pc-field-label">{r.name}</div>
              <div className="pc-compare-values">
                <span>{r.a}</span>
                {r.b ? <b>{r.b}</b> : <span className="pc-unknown" />}
              </div>
              {r.note ? <div className="pc-field-note">{r.note}</div> : null}
            </div>
          );
        })}
        <div className="pc-actions">
          <div className="pc-action pc-action-secondary">Ask supplier</div>
          <div className="pc-action" style={{ transform: press(t, 8) }}>
            Use substitute
            <Tap t={t} at={8} />
          </div>
        </div>
      </Card>
    </Collapse>
  );
}

// ---------------------------------------------------------------------------
// Sign-off — green is used only here, for the two approval checks + chip.
// Dev's and Sam's checkmark + footer text update as one coordinated state
// change per person (paired motion, no separate later footer beat) to avoid
// two unrelated animations firing back to back. collapseAt(8.2) leaves a
// ~0.55s chip hold before the 9s scene boundary.
// ---------------------------------------------------------------------------

const signers = [
  {
    name: "Dev",
    role: "Installer",
    note: "Confirms drop and clearance",
    at: 4,
  },
  { name: "Sam", role: "Co-owner", note: "Approves $412", at: 7 },
];

function SignoffCard({ t }: { t: number }) {
  const samApproved = t >= 7;
  return (
    <Collapse
      t={t}
      enterAt={1.1}
      collapseAt={8.2}
      dur={0.25}
      chip="Pendant substitute · Approved · Dev, Sam"
      chipTone="approve"
    >
      <Card title="Approval · Pendant substitute">
        {signers.map((p) => {
          const approved = t >= p.at;
          const pop = settle(t, p.at, 0.25);
          return (
            <div key={p.name} className="pc-approval-row">
              <div className="pc-avatar">{p.name[0]}</div>
              <div className="pc-approval-copy">
                <b>
                  {p.name} <span>· {p.role}</span>
                </b>
                <small>{p.note}</small>
              </div>
              <div
                className={`pc-approval-check ${approved ? "approve" : ""}`}
                style={{
                  transform: `scale(${approved ? 0.85 + 0.15 * pop : 1})`,
                }}
              >
                {approved ? "✓" : ""}
              </div>
            </div>
          );
        })}
        <div className={`pc-approval-footer ${samApproved ? "approve" : ""}`}>
          <Roll
            t={t}
            initial="Waiting on 2"
            events={[
              { at: 4, value: "Waiting on 1" },
              { at: 7, value: "Approved · 2 of 2" },
            ]}
          />
        </div>
      </Card>
      {t >= 4 ? (
        <Reveal t={t} at={4} dur={0.25}>
          <div className="pc-device-note">
            <span>Dev's device</span>
            <div>dev: clearance is fine</div>
          </div>
        </Reveal>
      ) : null}
    </Collapse>
  );
}

// ---------------------------------------------------------------------------
// Order thread — final scene; everything settles by t=8 and freezes.
// ---------------------------------------------------------------------------

const orderRows = [
  { name: "Tile", detail: "8 boxes · Maya", at: 2.8 },
  { name: "Sample", detail: "Maya", at: 3.6 },
  { name: "Pendant substitute", detail: "Dev, Sam", at: 4.4 },
  { name: "Vanity", detail: "Maya", at: 5.2 },
];

function OrdersCard({ t }: { t: number }) {
  return (
    <Reveal t={t} at={1.2}>
      <Card title="Bathroom · 4 of 11 ordered">
        <div className="pc-progress-track">
          <div style={{ width: `${((100 * 4) / 11) * settle(t, 2, 0.25)}%` }} />
        </div>
        <div className="pc-order-list">
          {orderRows.map((r) => (
            <div
              key={r.name}
              className="pc-order-row"
              style={{ opacity: clamp(t, r.at, r.at + 0.25) }}
            >
              <span className="pc-order-dot" />
              <div>
                <b>{r.name}</b>
                <small>{r.detail}</small>
              </div>
            </div>
          ))}
          <div className="pc-dependencies">
            <div
              className="pc-order-row"
              style={{ opacity: clamp(t, 6, 6.25) }}
            >
              <span className="pc-order-dot pc-order-dot-open" />
              <div>
                <b>Mirror</b>
                <small>waits on vanity width</small>
                <small>36 in vanity · mirror ≤ 34 in</small>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Reveal>
  );
}

// ---------------------------------------------------------------------------

export function PurchaseCard({ scene, t }: { scene: CardScene; t: number }) {
  switch (scene) {
    case "takeoff":
      return <TakeoffCard t={t} />;
    case "sample":
      return <SampleCard t={t} />;
    case "lead":
      return <LeadCard t={t} />;
    case "substitution":
      return <SubstitutionCard t={t} />;
    case "signoff":
      return <SignoffCard t={t} />;
    case "orders":
      return <OrdersCard t={t} />;
    default:
      return null;
  }
}
