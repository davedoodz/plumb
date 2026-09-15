import {
  Stage,
  In,
  Message,
  Card,
  Photo,
  Footage,
  Button,
  Chip,
  Row,
  Caption,
  settle,
  progress,
  Point,
} from "./kit";

// ---------------------------------------------------------------------------
// Quantity — switching a flooring layout from straight-lay to herringbone
// changes the box count and cost. User-entered area and the separate
// layout allowance stay visible throughout.
// ---------------------------------------------------------------------------
export function Quantity({ t }: { t: number }) {
  const switchAt = 3.3;
  const herringbone = t >= switchAt;
  const path: Point[] = [
    { at: 0, x: 210, y: 520 },
    { at: 1.6, x: 210, y: 420 },
    { at: 2.6, x: 198, y: 250 },
    { at: switchAt, x: 198, y: 234, press: true },
    { at: 4.4, x: 210, y: 400 },
  ];
  return (
    <Stage t={t} path={path} title="Flooring" context="Maya + Sam · Quantity">
      <In t={t} at={0}>
        <Message>Switching this to herringbone changes the order.</Message>
      </In>
      <In t={t} at={0.4}>
        <Card eyebrow="FLOORING · QUANTITY" title="Switch to herringbone?">
          <div className="tab-strip">
            <span className={herringbone ? "" : "active"}>Straight-lay</span>
            <span className={herringbone ? "active" : ""}>Herringbone</span>
          </div>
          <Row label="User-entered area" value="61 sqft" />
          <Row label="Coverage per box" value="10.5 sqft" />
          <Row
            label="Boxes needed"
            value={herringbone ? "8 boxes" : "7 boxes"}
          />
          {herringbone ? (
            <In t={t} at={switchAt + 0.15}>
              <Row label="Includes" value="7 base + 1 separate cut allowance" />
            </In>
          ) : null}
          <Row
            label="Estimated cost"
            value={
              <span style={{ fontSize: 18, fontWeight: 700 }}>
                {herringbone ? "$1,596" : "$1,397"}
              </span>
            }
          />
          <Caption warning>
            Straight: +10% waste. Herringbone: +15% waste, then +1 box. Confirm
            the entered area on site before ordering.
          </Caption>
        </Card>
      </In>
    </Stage>
  );
}

// ---------------------------------------------------------------------------
// Sample — review the finish sample under daylight footage, swipe to the
// contextual room photo and its source, then approve the finish.
// ---------------------------------------------------------------------------
export function Sample({ t }: { t: number }) {
  const swipe = settle(t, 3.2, 1.8);
  const itemW = 200;
  const gap = 12;
  const approved = t > 7.4;
  const path: Point[] = [
    { at: 0, x: 210, y: 660 },
    { at: 2.6, x: 300, y: 436 },
    { at: 3.2, x: 300, y: 436, press: true },
    { at: 5.0, x: 88, y: 436 },
    { at: 6.2, x: 210, y: 627 },
    { at: 7.2, x: 210, y: 627, press: true },
  ];
  return (
    <Stage
      t={t}
      path={path}
      title="Materials"
      context="Maya + Sam · Sample review"
    >
      <In t={t} at={0}>
        <Message>Check the tile sample in daylight before approving.</Message>
      </In>
      <In t={t} at={0.5}>
        <div style={{ marginBottom: 14 }}>
          <Footage name="sample" t={Math.min(t * 1.6, 5)} height={210} />
        </div>
      </In>
      <In t={t} at={2.6}>
        <div
          style={{
            width: 230,
            margin: "0 auto 14px",
            overflow: "hidden",
          }}
        >
          <div
            className="horizontal-list"
            style={{ transform: `translateX(${-swipe * (itemW + gap)}px)` }}
          >
            <div style={{ width: itemW, flexShrink: 0 }}>
              <Photo name="sample" height={140} />
              <div className="small-label" style={{ marginTop: 6 }}>
                Sample, window light
              </div>
            </div>
            <div style={{ width: itemW, flexShrink: 0 }}>
              <Photo name="room" height={140} />
              <div className="small-label" style={{ marginTop: 6 }}>
                Primary bath, daylight
              </div>
            </div>
          </div>
        </div>
        <div className="source-note">
          {swipe > 0.5
            ? "Source: placed in the primary bath · Sept 12, 3:40pm daylight"
            : "Source: Maya’s sample photo · Sept 12"}
        </div>
        <Button secondary={!approved} approved={approved}>
          {approved ? "Approved · 3:42pm daylight" : "Approve this finish"}
        </Button>
      </In>
    </Stage>
  );
}

// ---------------------------------------------------------------------------
// Quote — drag-select the installer's spoken start date out of a call
// transcript, then save it as a structured field attributed to Dev.
// ---------------------------------------------------------------------------
const PHRASE_WORDS = [
  "we",
  "can",
  "start",
  "the",
  "week",
  "of",
  "October",
  "12th",
];

export function Quote({ t }: { t: number }) {
  const dragStart = 1.2;
  const dragEnd = 3.6;
  const highlighted = Math.floor(
    progress(t, dragStart, dragEnd) * PHRASE_WORDS.length,
  );
  const saved = t > 6.8;
  const path: Point[] = [
    { at: 0, x: 210, y: 600 },
    { at: dragStart, x: 42, y: 248, press: true },
    { at: dragEnd, x: 300, y: 248 },
    { at: 4.4, x: 210, y: 360 },
    { at: 6.0, x: 210, y: 499 },
    { at: 6.6, x: 210, y: 499, press: true },
  ];
  return (
    <Stage
      t={t}
      path={path}
      title="Installer quote"
      context="Maya + Sam · Quote capture"
    >
      <In t={t} at={0}>
        <Message>Pull the start date from the installer's call.</Message>
      </In>
      <In t={t} at={0.4}>
        <div className="document" style={{ marginBottom: 14 }}>
          <h3>Call transcript</h3>
          <div className="small-label" style={{ marginBottom: 10 }}>
            Recorded call · Sept 13, 4:02pm
          </div>
          <p style={{ margin: "0 0 6px" }}>"Sounds good — for scheduling,"</p>
          <p style={{ margin: "0 0 6px" }}>
            {PHRASE_WORDS.map((w, i) => (
              <span
                key={w + i}
                style={{
                  background: i < highlighted ? "#dce8df" : "transparent",
                  borderRadius: 3,
                }}
              >
                {w}{" "}
              </span>
            ))}
          </p>
          <p className="small-label" style={{ margin: 0 }}>
            "...once the vanity's on site." — Dev
          </p>
        </div>
      </In>
      <In t={t} at={dragEnd + 0.2}>
        <Card eyebrow="EXTRACTED FIELD" title="Start date">
          <Row label="Value" value="Oct 12 week · vanity on site" />
          <Row
            label="Source"
            value={
              saved ? (
                <span className="approved-text">
                  <span
                    className="status-dot"
                    style={{ background: "#2e7047" }}
                  />
                  Dev · call transcript
                </span>
              ) : (
                "Unsaved"
              )
            }
            muted={!saved}
          />
          <div className="row-actions" style={{ marginTop: 14 }}>
            <Button approved={saved}>
              {saved ? "Saved to quote" : "Save to quote"}
            </Button>
          </div>
        </Card>
      </In>
    </Stage>
  );
}

// ---------------------------------------------------------------------------
// Clearance — a photo hotspot expands into a Dev-measured confirmation.
// Manually confirmed dimensions read differently from unconfirmed ones;
// nothing is ever guessed from the image.
// ---------------------------------------------------------------------------
export function Clearance({ t }: { t: number }) {
  const tapAt = 2.4;
  const confirmed = t >= tapAt + 0.2;
  const tagFade = settle(t, tapAt + 0.2, 0.25);
  const pulse = 1 + Math.sin(t * 5) * 0.12;
  const path: Point[] = [
    { at: 0, x: 210, y: 600 },
    { at: 1.4, x: 220, y: 283 },
    { at: tapAt, x: 220, y: 283, press: true },
    { at: 3.4, x: 210, y: 522 },
  ];
  return (
    <Stage
      t={t}
      path={path}
      title="Vanity install"
      context="Maya + Sam · Clearance check"
    >
      <In t={t} at={0}>
        <Message>Confirm the door opening before the vanity ships.</Message>
      </In>
      <In t={t} at={0.4}>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Photo name="entry" height={260} />
          <div
            style={{
              position: "absolute",
              left: 198,
              top: 125,
              width: 14,
              height: 14,
              borderRadius: "50%",
              transform: `translate(-50%,-50%) scale(${confirmed ? 1 : pulse})`,
              background: confirmed ? "#2e7047" : "#fff",
              border: confirmed ? "2px solid #fff" : "2px solid #2e7047",
              boxShadow: "0 1px 4px rgba(0,0,0,.35)",
            }}
          />
          {confirmed ? (
            <div
              style={{
                position: "absolute",
                left: 198,
                top: 97,
                transform: "translate(-50%,-100%)",
                background: "#242827",
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 8px",
                borderRadius: 6,
                whiteSpace: "nowrap",
                opacity: tagFade,
              }}
            >
              760mm confirmed
            </div>
          ) : null}
          <div
            style={{
              position: "absolute",
              left: 200,
              top: 210,
              width: 12,
              height: 12,
              borderRadius: "50%",
              transform: `translate(-50%,-50%) scale(${1 + Math.sin(t * 5 + 1) * 0.1})`,
              background: "transparent",
              border: "2px dashed #c46840",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 200,
              top: 182,
              transform: "translate(-50%,-100%)",
              background: "#fff",
              color: "#c46840",
              fontSize: 10,
              fontWeight: 600,
              padding: "3px 7px",
              borderRadius: 6,
              border: "1px solid #f0d4c4",
              whiteSpace: "nowrap",
            }}
          >
            not confirmed
          </div>
        </div>
      </In>
      <In t={t} at={tapAt + 0.2}>
        <Card eyebrow="CLEARANCE" title="Door opening">
          <Row
            label="Door opening"
            value={
              <span className="approved-text">
                <span
                  className="status-dot"
                  style={{ background: "#2e7047" }}
                />
                760mm · confirmed
              </span>
            }
          />
          <Row label="Landing depth" value="Not confirmed" muted />
          <Caption warning>
            Measured by Dev on site · Sept 13. The photo locates this note; it
            does not supply the measurement.
          </Caption>
        </Card>
      </In>
    </Stage>
  );
}

// ---------------------------------------------------------------------------
// LeadTime — the pendant's 8-week lead time lands after the plumber is
// ready. Scrubbing the timeline surfaces the 28-day gap and the fix.
// ---------------------------------------------------------------------------
const TRACK_PAD = 12;
const TRACK_WIDTH = 352;
const TRACK_DAYS = 70;
const PLUMBER_DAY = 28;
const PENDANT_DAY = 56;
const ALT_OPTIONS = [
  { lead: "1 week", note: "In stock" },
  { lead: "2 weeks", note: "Warehouse" },
  { lead: "3 weeks", note: "Special order" },
];

function trackX(day: number) {
  return TRACK_PAD + (day / TRACK_DAYS) * TRACK_WIDTH;
}

function fmtDate(days: number) {
  const d = new Date(2026, 8, 14 + days);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function LeadTime({ t }: { t: number }) {
  const scrubStart = 2.6;
  const scrubEnd = 6.5;
  const scrubP = settle(t, scrubStart, scrubEnd - scrubStart);
  const handleDay = scrubP * PENDANT_DAY;
  const compareAt = 8.8;
  const compared = t > compareAt + 0.2;
  const path: Point[] = [
    { at: 0, x: 210, y: 650 },
    { at: 1.6, x: 210, y: 400 },
    { at: scrubStart - 0.2, x: 22 + trackX(0), y: 457 },
    { at: scrubStart, x: 22 + trackX(0), y: 457, press: true },
    { at: scrubEnd, x: 22 + trackX(PENDANT_DAY), y: 457 },
    { at: 7.4, x: 210, y: 581 },
    { at: compareAt, x: 210, y: 581, press: true },
    { at: 10, x: 210, y: 641 },
  ];
  return (
    <Stage t={t} path={path} title="Lighting" context="Maya + Sam · Lead time">
      <In t={t} at={0}>
        <Message>
          Check the pendant's lead time against the plumber date.
        </Message>
      </In>
      <In t={t} at={0.4}>
        <Card eyebrow="LIGHTING · LEAD TIME" title="Brass pendant">
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <Photo
              name="pendant"
              height={48}
              style={{ width: 48, height: 48 }}
            />
            <div className="small-label">
              Selected in the lighting picks · Sept 8
            </div>
          </div>
          <Row label="Lead time" value="8 weeks" />
          <Row label="If ordered" value="Today · Sep 14" />
        </Card>
      </In>
      <In t={t} at={2.2}>
        <div className="section-label">Timeline</div>
        <div style={{ position: "relative", height: 40 }}>
          <div
            style={{
              position: "absolute",
              left: TRACK_PAD,
              right: TRACK_PAD,
              top: 18,
              height: 4,
              background: "#e7eae3",
              borderRadius: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: trackX(PLUMBER_DAY),
              top: 8,
              width: 2,
              height: 22,
              background: "#698172",
              transform: "translateX(-1px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: trackX(PENDANT_DAY),
              top: 8,
              width: 2,
              height: 22,
              background: "#c46840",
              transform: "translateX(-1px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: trackX(handleDay),
              top: 6,
              width: 10,
              height: 26,
              borderRadius: 3,
              background: "#242827",
              transform: "translateX(-5px)",
            }}
          />
        </div>
        <div style={{ position: "relative", height: 20, marginBottom: 12 }}>
          <span
            className="small-label"
            style={{ position: "absolute", left: 0 }}
          >
            {fmtDate(0)}
          </span>
          <span
            className="small-label"
            style={{
              position: "absolute",
              left: trackX(PLUMBER_DAY),
              transform: "translateX(-50%)",
              color: "#698172",
            }}
          >
            Plumber {fmtDate(PLUMBER_DAY)}
          </span>
          <span
            className="small-label"
            style={{
              position: "absolute",
              left: trackX(PENDANT_DAY),
              transform: "translateX(-50%)",
              color: "#c46840",
            }}
          >
            Pendant {fmtDate(PENDANT_DAY)}
          </span>
        </div>
        <In t={t} at={scrubEnd + 0.2}>
          <div
            className="source-note"
            style={{ background: "#fdf1ea", color: "#a1522f" }}
          >
            28 days late — plumber ready {fmtDate(PLUMBER_DAY)}, pendant lands{" "}
            {fmtDate(PENDANT_DAY)}.
          </div>
        </In>
        <div style={{ marginBottom: 14 }}>
          <Button secondary={!compared} approved={compared}>
            {compared
              ? "Compare earlier-arrival options"
              : "Compare alternatives"}
          </Button>
        </div>
        {compared ? (
          <In t={t} at={compareAt + 0.2}>
            <div style={{ display: "flex", gap: 8 }}>
              {ALT_OPTIONS.map((o) => (
                <div key={o.lead} style={{ flex: 1 }}>
                  <Chip>
                    <strong style={{ display: "block" }}>{o.lead}</strong>
                    <span style={{ fontSize: 10, color: "#8a9187" }}>
                      {o.note}
                    </span>
                  </Chip>
                </div>
              ))}
            </div>
          </In>
        ) : null}
      </In>
    </Stage>
  );
}
