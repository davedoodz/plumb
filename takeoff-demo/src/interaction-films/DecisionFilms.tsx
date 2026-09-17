import {
  useTime,
  ease,
  appear,
  Film,
  Scene,
  Message,
  Card,
  Label,
  Chip,
  Action,
  Photo,
  Touch,
  Check,
  Outcome,
} from "./shared";

const AMBER_BG = "#fdf1e2";
const AMBER_FG = "#92650f";
const INK = "#17140f";
const MUTE = "#9c988f";
const HAIRLINE = "#e7e5e2";

function lerp(a: number, b: number, p: number) {
  return a + (b - a) * p;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

// ---------------------------------------------------------------------------
// Recall — a compact source timeline scrubs from the sample pull to the
// signed approval; the finger lands on the exact owner, date and photo the
// answer is sourced from.
// ---------------------------------------------------------------------------
export function RecallFilm() {
  const t = useTime();

  const trackX0 = 56;
  const trackX1 = 297;
  const trackYAbs = 136;
  const cardTop = 76;
  const cardH = 240;
  const trackYLocal = trackYAbs - cardTop;

  const scrubStart = 3.2;
  const scrubDur = 2.6;
  const progress = ease(t, scrubStart, scrubDur);
  const headX = lerp(trackX0, trackX1, progress);

  const dotOn = [t >= scrubStart, progress >= 0.5, t >= scrubStart + scrubDur];
  const dots = [
    { f: 0, label: "Sample pulled", date: "Mar 8" },
    { f: 0.5, label: "Comparison approved", date: "Mar 12" },
    { f: 1, label: "Approved & specified", date: "Mar 14" },
  ];

  const swatchOpacity = 1 - clamp01((progress - 0.35) / 0.3);
  const sheenOpacity = clamp01((progress - 0.35) / 0.3);

  return (
    <Film t={t} title="Bring back the reason" category="Paint">
      <Scene t={t} from={0} to={12}>
        <div style={{ position: "relative", width: 353, height: 622 }}>
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 0,
              right: 0,
              ...appear(t, 0.3),
            }}
          >
            <Message user>Why did we go with the warm-white finish?</Message>
          </div>

          <div
            style={{
              position: "absolute",
              top: cardTop,
              left: 0,
              width: 353,
              height: cardH,
              borderRadius: 16,
              border: `1px solid ${HAIRLINE}`,
              background: "#fff",
              boxSizing: "border-box",
              ...appear(t, 1.6, 0.4, 14),
            }}
          >
            <div style={{ position: "absolute", left: 20, top: 16 }}>
              <Label>Decision timeline · warm-white finish</Label>
            </div>

            <div
              style={{
                position: "absolute",
                left: trackX0,
                top: trackYLocal,
                width: trackX1 - trackX0,
                height: 2,
                background: HAIRLINE,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: trackX0,
                top: trackYLocal,
                width: (headX - trackX0) * (t >= scrubStart ? 1 : 0),
                height: 2,
                background: INK,
              }}
            />

            {dots.map((d, i) => {
              const x = lerp(trackX0, trackX1, d.f);
              const on = dotOn[i];
              return (
                <div
                  key={d.label}
                  style={{
                    position: "absolute",
                    left: x,
                    top: trackYLocal - 5,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      margin: "0 auto",
                      borderRadius: 6,
                      background: on ? INK : "#d9d6d0",
                    }}
                  />
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 11,
                      lineHeight: 1.2,
                      textAlign: "center",
                      width: 92,
                      color: on ? INK : MUTE,
                      fontWeight: on ? 600 : 400,
                    }}
                  >
                    {d.label}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      textAlign: "center",
                      marginTop: 2,
                      color: MUTE,
                    }}
                  >
                    {d.date}
                  </div>
                </div>
              );
            })}

            {t >= scrubStart && (
              <div
                style={{
                  position: "absolute",
                  left: headX,
                  top: trackYLocal,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  border: `2px solid ${INK}`,
                  background: "#fff",
                  transform: "translate(-50%,-50%)",
                }}
              />
            )}

            <Photo
              name="paint-swatches.png"
              height={110}
              style={{
                position: "absolute",
                left: 20,
                top: 114,
                width: 150,
                height: 110,
                opacity: swatchOpacity,
              }}
            />
            <Photo
              name="paint-sheen.png"
              height={110}
              style={{
                position: "absolute",
                left: 183,
                top: 114,
                width: 150,
                height: 110,
                opacity: sheenOpacity,
              }}
            />
          </div>

          <div style={{ position: "absolute", top: 332, left: 0, width: 353 }}>
            <Outcome
              t={t}
              title="Warm-white sheen, confirmed"
              detail="Approved by Dana R. on Mar 14, from the in-room comparison above — sourced from the Mar 8 sample pull."
            />
          </div>

          <Touch
            t={t}
            at={scrubStart}
            x={trackX0}
            y={trackYAbs}
            to={{ x: trackX1, y: trackYAbs }}
            duration={scrubDur}
          />
        </div>
      </Scene>
    </Film>
  );
}

// ---------------------------------------------------------------------------
// Quote — a supplier quote attaches, then freight and tax physically lift
// out of their own lines and land in the running total, math shown in place.
// ---------------------------------------------------------------------------
export function QuoteFilm() {
  const t = useTime();

  const rowValueX = 300;
  const row0Y = 172;
  const row1Y = 214;
  const row2Y = 256;
  const totalTop = 306;
  const totalH = 124;
  const badgeTargetX = 176;
  const badgeTargetY = 344;

  const freightAt = 4.2;
  const freightDur = 0.8;
  const freightArrive = freightAt + freightDur;
  const taxAt = 5.4;
  const taxDur = 0.8;
  const taxArrive = taxAt + taxDur;

  const freightP = ease(t, freightAt, freightDur);
  const taxP = ease(t, taxAt, taxDur);

  const freightBadgeOn = t >= freightAt && t < freightArrive + 0.35;
  const taxBadgeOn = t >= taxAt && t < taxArrive + 0.35;
  const freightBadgeOpacity =
    freightP < 0.8 ? 1 : 1 - clamp01((freightP - 0.8) / 0.2);
  const taxBadgeOpacity = taxP < 0.8 ? 1 : 1 - clamp01((taxP - 0.8) / 0.2);
  const freightX = lerp(rowValueX, badgeTargetX, freightP);
  const freightY = lerp(row1Y + 8, badgeTargetY, freightP);
  const taxX = lerp(rowValueX, badgeTargetX, taxP);
  const taxY = lerp(row2Y + 8, badgeTargetY, taxP);

  let equation = "$1,000";
  let total = "$1,000.00";
  if (t >= freightArrive) {
    equation = "$1,000 + $45";
    total = "$1,045.00";
  }
  if (t >= taxArrive) {
    equation = "$1,000 + $45 + $80 = $1,125";
    total = "$1,125.00";
  }

  return (
    <Film t={t} title="Expose the cost outside the headline" category="Tiles">
      <Scene t={t} from={0} to={12}>
        <div style={{ position: "relative", width: 353, height: 622 }}>
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 0,
              right: 0,
              ...appear(t, 0.3),
            }}
          >
            <Message user>
              What's the tile order actually going to cost, all-in?
            </Message>
          </div>

          <div
            style={{
              position: "absolute",
              top: 76,
              left: 0,
              width: 353,
              ...appear(t, 1.4, 0.4, 14),
            }}
          >
            <Card
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
              }}
            >
              <Photo
                name="tiles-batch.png"
                height={56}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div>
                <Label>Attached</Label>
                <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>
                  tile_supplier_quote.pdf
                </div>
                <div style={{ fontSize: 11, color: MUTE, marginTop: 2 }}>
                  3 line items · received today
                </div>
              </div>
            </Card>
          </div>

          <div
            style={{
              position: "absolute",
              top: row0Y,
              left: 20,
              width: 313,
              ...appear(t, 2.0, 0.35, 10),
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 15,
                color: INK,
              }}
            >
              <span>Tile order</span>
              <strong>$1,000.00</strong>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: row1Y,
              left: 20,
              width: 313,
              ...appear(t, 2.3, 0.35, 10),
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
                color: INK,
              }}
            >
              <span>Freight</span>
              <strong>$45.00</strong>
            </div>
            <Label style={{ display: "block", textAlign: "right" }}>
              quote · line 2
            </Label>
          </div>

          <div
            style={{
              position: "absolute",
              top: row2Y,
              left: 20,
              width: 313,
              ...appear(t, 2.6, 0.35, 10),
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 14,
                color: INK,
              }}
            >
              <span>Tax</span>
              <strong>$80.00</strong>
            </div>
            <Label style={{ display: "block", textAlign: "right" }}>
              quote · line 3
            </Label>
          </div>

          <div
            style={{
              position: "absolute",
              top: totalTop,
              left: 0,
              width: 353,
              height: totalH,
              borderRadius: 16,
              border: `1px solid ${HAIRLINE}`,
              background: "#fff",
              boxSizing: "border-box",
              ...appear(t, 2.9, 0.4, 14),
            }}
          >
            <div style={{ position: "absolute", left: 20, top: 16 }}>
              <Label>Delivered total</Label>
            </div>
            <div
              style={{
                position: "absolute",
                left: 20,
                top: 38,
                fontSize: 13,
                color: MUTE,
              }}
            >
              {equation}
            </div>
            <div
              style={{
                position: "absolute",
                left: 20,
                top: 62,
                fontSize: 26,
                fontWeight: 700,
                color: INK,
              }}
            >
              {total}
            </div>
            <div
              style={{
                position: "absolute",
                left: 20,
                top: 98,
                fontSize: 11,
                color: MUTE,
              }}
            >
              Freight and tax pulled from the attached quote
            </div>
          </div>

          {freightBadgeOn && (
            <div
              style={{
                position: "absolute",
                left: freightX,
                top: freightY,
                transform: "translate(-50%,-50%)",
                padding: "4px 10px",
                borderRadius: 999,
                background: INK,
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                opacity: freightBadgeOpacity,
              }}
            >
              + $45
            </div>
          )}
          {taxBadgeOn && (
            <div
              style={{
                position: "absolute",
                left: taxX,
                top: taxY,
                transform: "translate(-50%,-50%)",
                padding: "4px 10px",
                borderRadius: 999,
                background: INK,
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                opacity: taxBadgeOpacity,
              }}
            >
              + $80
            </div>
          )}

          <div style={{ position: "absolute", top: 432, left: 0, width: 353 }}>
            <Outcome
              t={t}
              title="Delivered total: $1,125.00"
              detail="Freight $45 + tax $80, preserved with their source lines. Headline price: $1,000."
            />
          </div>

          <Touch
            t={t}
            at={freightAt}
            x={rowValueX}
            y={row1Y + 8}
            to={{ x: badgeTargetX, y: badgeTargetY }}
            duration={freightDur}
          />
          <Touch
            t={t}
            at={taxAt}
            x={rowValueX}
            y={row2Y + 8}
            to={{ x: badgeTargetX, y: badgeTargetY }}
            duration={taxDur}
          />
        </div>
      </Scene>
    </Film>
  );
}

// ---------------------------------------------------------------------------
// Leadtime — dragging the delivery block three days later pulls the
// dependency line taut; the installer marker follows it and lands flagged
// unconfirmed instead of silently staying booked.
// ---------------------------------------------------------------------------
export function LeadtimeFilm() {
  const t = useTime();

  const calTop = 76;
  const calH = 240;
  const trackX0 = 20;
  const trackX1 = 333;
  const dayWidth = (trackX1 - trackX0) / 20;
  const dayX = (day: number) => trackX0 + day * dayWidth;

  const laneDY = calTop + 70;
  const laneIY = calTop + 170;

  const deliveryAt = 3.0;
  const deliveryDur = 1.0;
  const deliveryP = ease(t, deliveryAt, deliveryDur);
  const deliveryX = lerp(dayX(10), dayX(13), deliveryP);

  const installerAt = 4.3;
  const installerDur = 1.0;
  const installerP = ease(t, installerAt, installerDur);
  const installerX = lerp(dayX(13), dayX(16), installerP);

  const deliverySettled = t >= deliveryAt + deliveryDur;
  const installerSettled = t >= installerAt + installerDur;

  const deliveryDate = deliverySettled ? "Sun 22" : "Thu 19";
  const installerDate = installerSettled ? "Wed 25" : "Sun 22";

  return (
    <Film t={t} title="Move the date, reveal the consequence" category="Tiles">
      <Scene t={t} from={0} to={12}>
        <div style={{ position: "relative", width: 353, height: 622 }}>
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 0,
              right: 0,
              ...appear(t, 0.3),
            }}
          >
            <Message user>
              Delivery just slipped — what does that do to the installer?
            </Message>
          </div>

          <div
            style={{
              position: "absolute",
              top: calTop,
              left: 0,
              width: 353,
              height: calH,
              borderRadius: 16,
              border: `1px solid ${HAIRLINE}`,
              background: "#fff",
              boxSizing: "border-box",
              ...appear(t, 1.6, 0.4, 14),
            }}
          >
            <div style={{ position: "absolute", left: 20, top: 16 }}>
              <Label>Delivery → installer start</Label>
            </div>

            <svg
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 353,
                height: calH,
              }}
            >
              <line
                x1={deliveryX}
                y1={laneDY - calTop + 14}
                x2={installerX}
                y2={laneIY - calTop - 14}
                stroke={installerSettled ? AMBER_FG : "#c9c6bf"}
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            </svg>

            <div
              style={{
                position: "absolute",
                left: trackX0,
                top: laneDY - calTop,
                width: trackX1 - trackX0,
                height: 2,
                background: HAIRLINE,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: trackX0,
                top: laneIY - calTop,
                width: trackX1 - trackX0,
                height: 2,
                background: HAIRLINE,
              }}
            />

            <div
              style={{
                position: "absolute",
                left: deliveryX,
                top: laneDY - calTop,
                transform: "translate(-50%,-50%)",
                width: 78,
                height: 30,
                borderRadius: 8,
                background: INK,
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Delivery
            </div>
            <div
              style={{
                position: "absolute",
                left: deliveryX,
                top: laneDY - calTop + 22,
                transform: "translate(-50%,0)",
                fontSize: 11,
                color: MUTE,
              }}
            >
              {deliveryDate}
            </div>

            <div
              style={{
                position: "absolute",
                left: installerX,
                top: laneIY - calTop,
                transform: "translate(-50%,-50%)",
                width: 92,
                height: 30,
                borderRadius: 8,
                background: "#fff",
                border: `2px solid ${installerSettled ? AMBER_FG : INK}`,
                color: installerSettled ? AMBER_FG : INK,
                fontSize: 11,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Installer start
            </div>
            <div
              style={{
                position: "absolute",
                left: installerX,
                top: laneIY - calTop + 22,
                transform: "translate(-50%,0)",
                fontSize: 11,
                color: MUTE,
              }}
            >
              {installerDate}
            </div>

            <div style={{ position: "absolute", left: 20, top: calH - 34 }}>
              {installerSettled ? (
                <Chip style={{ background: AMBER_BG, color: AMBER_FG }}>
                  Unconfirmed booking
                </Chip>
              ) : (
                <Chip>Confirmed</Chip>
              )}
            </div>
          </div>

          <div style={{ position: "absolute", top: 332, left: 0, width: 353 }}>
            <Outcome
              t={t}
              title="Installer start pushed to Wed 25"
              detail="Delivery moved +3 days (Thu 19 → Sun 22). Installer follows to hold the 3-day gap and needs reconfirmation — not yet booked."
            />
          </div>

          <Touch
            t={t}
            at={deliveryAt}
            x={dayX(10)}
            y={laneDY}
            to={{ x: dayX(13), y: laneDY }}
            duration={deliveryDur}
          />
        </div>
      </Scene>
    </Film>
  );
}

// ---------------------------------------------------------------------------
// Signoff — one proceed action splits into two approval lanes; the budget
// lane completes with a check while the trade lane holds pending, keeping
// the purchase on hold on its own.
// ---------------------------------------------------------------------------
export function SignoffFilm() {
  const t = useTime();

  const tapAt = 2.4;
  const splitAt = 2.8;
  const buttonOpacity = t < splitAt ? 1 : 1 - clamp01((t - splitAt) / 0.4);

  const approveAt = 5.0;
  const approveP = ease(t, approveAt, 0.3);
  const checkScale = lerp(0.5, 1, approveP);
  const budgetApproved = t >= approveAt;

  return (
    <Film t={t} title="One approval cannot stand in for two" category="Tiles">
      <Scene t={t} from={0} to={12}>
        <div style={{ position: "relative", width: 353, height: 622 }}>
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 0,
              right: 0,
              ...appear(t, 0.3),
            }}
          >
            <Message>Tile order ready — $640 total, 3-week lead time.</Message>
          </div>

          {buttonOpacity > 0.01 && (
            <div
              style={{
                position: "absolute",
                top: 64,
                left: 0,
                width: 353,
                opacity: buttonOpacity,
                ...appear(t, 1.6, 0.35, 10),
              }}
            >
              <Action>Approve &amp; proceed</Action>
            </div>
          )}

          <div
            style={{
              position: "absolute",
              top: 64,
              left: 0,
              width: 353,
              ...appear(t, splitAt, 0.45, -10),
            }}
          >
            <Card style={{ padding: 14 }}>
              <Label>Budget approval</Label>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: INK,
                  marginTop: 2,
                }}
              >
                Dana R. · Homeowner
              </div>
              <div style={{ marginTop: 10 }}>
                {budgetApproved ? (
                  <Chip
                    active
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        transform: `scale(${checkScale})`,
                      }}
                    >
                      <Check size={12} />
                    </span>
                    Approved
                  </Chip>
                ) : (
                  <Chip>Reviewing</Chip>
                )}
              </div>
            </Card>
          </div>

          <div
            style={{
              position: "absolute",
              top: 190,
              left: 0,
              width: 353,
              ...appear(t, splitAt + 0.2, 0.45, 14),
            }}
          >
            <Card style={{ padding: 14 }}>
              <Label>Trade suitability</Label>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: INK,
                  marginTop: 2,
                }}
              >
                Alex M. · Tile setter
              </div>
              <div style={{ marginTop: 10 }}>
                <Chip style={{ background: AMBER_BG, color: AMBER_FG }}>
                  Pending
                </Chip>
              </div>
            </Card>
          </div>

          <div
            style={{
              position: "absolute",
              top: 316,
              left: 0,
              width: 353,
              boxSizing: "border-box",
              padding: "12px 16px",
              borderRadius: 12,
              border: `1px solid ${AMBER_FG}33`,
              background: AMBER_BG,
              color: AMBER_FG,
              fontSize: 13,
              fontWeight: 600,
              ...appear(t, splitAt + 0.4, 0.4, 10),
            }}
          >
            Purchase on hold — needs both approvals
          </div>

          <div style={{ position: "absolute", top: 380, left: 0, width: 353 }}>
            <Outcome
              t={t}
              title="Purchase still on hold"
              detail="Budget approved by Dana R. on Mar 14. Alex M. still needs to confirm trade suitability. Both approvals are required."
            />
          </div>

          <Touch t={t} at={tapAt} x={176} y={90} duration={0.5} />
        </div>
      </Scene>
    </Film>
  );
}
