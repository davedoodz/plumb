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

const AMBER = "#b45309";
const INK = "#111111";
const MUTE = "#6b7280";
const LINE = "#e5e7eb";

/* ----------------------------------------------------------------------- */
/* Sample — "Compare the same detail"                                      */
/* Aligned wipe-compare: two photos share one frame, a wipe drags across   */
/* the matching detail, both halves zoom together, then the mismatch gets  */
/* pinned for a site-light review — never claimed as a measured match.     */
/* ----------------------------------------------------------------------- */
export function SampleFilm() {
  const t = useTime();

  // Gesture timing
  const wipe = ease(t, 2.6, 2.6); // 0 -> 1, drag reveals delivered sample left→right
  const zoom = ease(t, 5.5, 1.3); // 0 -> 1, synchronized zoom on the detail
  const scale = 1 + zoom * 0.32;
  const pin = ease(t, 6.9, 0.5);

  const frameW = 321;
  const frameH = 300;
  const originX = 68; // % — detail point both halves zoom toward
  const originY = 46;

  return (
    <Film t={t} title="Compare the same detail" category="Tiles">
      <Scene t={t} from={0} to={2}>
        <div style={{ padding: "18px 16px 0" }}>
          <Message style={appear(t, 0.2)}>
            Does the delivered sample match the approved tile?
          </Message>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 14,
              ...appear(t, 0.9),
            }}
          >
            <Card style={{ flex: 1, padding: 8 }}>
              <Label>Approved reference</Label>
              <Photo name="tiles-sample.png" height={96} />
            </Card>
            <Card style={{ flex: 1, padding: 8 }}>
              <Label>Delivered sample</Label>
              <Photo
                name="tiles-sample.png"
                height={96}
                style={{ filter: "sepia(.18) saturate(.9)" }}
              />
            </Card>
          </div>
        </div>
      </Scene>

      <Scene t={t} from={2} to={8.5}>
        <div style={{ padding: "16px 16px 0" }}>
          <Label style={appear(t, 2.1)}>
            Aligned detail · illustrative lighting comparison
          </Label>
          <Card
            style={{
              marginTop: 8,
              padding: 0,
              overflow: "hidden",
              position: "relative",
              width: frameW,
              height: frameH,
              ...appear(t, 2.2),
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `scale(${scale})`,
                transformOrigin: `${originX}% ${originY}%`,
              }}
            >
              <Photo
                name="tiles-sample.png"
                height={frameH}
                style={{ position: "absolute", inset: 0, borderRadius: 0 }}
              />
              <Photo
                name="tiles-sample.png"
                height={frameH}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 0,
                  filter: "sepia(.18) saturate(.9)",
                  clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`,
                }}
              />
            </div>
            {/* wipe divider */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${wipe * 100}%`,
                width: 2,
                background: "#ffffff",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 8,
                top: 8,
                ...appear(t, 2.4, 0.3),
              }}
            >
              <Chip>Reference</Chip>
            </div>
            <div
              style={{
                position: "absolute",
                right: 8,
                top: 8,
                opacity: wipe,
              }}
            >
              <Chip active>Delivered</Chip>
            </div>
            {/* difference pin at the detail point */}
            <div
              style={{
                position: "absolute",
                left: `${originX}%`,
                top: `${originY}%`,
                transform: "translate(-50%,-50%)",
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: `2px solid ${AMBER}`,
                background: "rgba(180,83,9,0.15)",
                opacity: pin,
              }}
            />
          </Card>
          <Touch
            t={t}
            at={2.6}
            x={16}
            y={16 + frameH / 2}
            to={{ x: 16 + frameW * 0.68, y: 16 + frameH / 2 }}
            duration={2.6}
          />
          <Touch
            t={t}
            at={5.6}
            x={16 + frameW * 0.5}
            y={16 + frameH * 0.46}
            duration={0.5}
          />
          <div style={{ marginTop: 10, ...appear(t, 7.1) }}>
            <Chip>Shade reads warmer along this edge</Chip>
          </div>
        </div>
      </Scene>

      <Scene t={t} from={8.5} to={12}>
        <Outcome
          t={t}
          at={8.5}
          title="Flagged for site-light review"
          detail="Warm edge shows under this light — not claimed as a measured color match. Held for review on site."
          photo="tiles-sample.png"
        />
      </Scene>
    </Film>
  );
}

/* ----------------------------------------------------------------------- */
/* Delivery — "Receive the exception, not just the boxes"                  */
/* A scan maps the label to the expected order, the count lands one short, */
/* a damaged item gets pinned, and only the exceptions carry forward.      */
/* ----------------------------------------------------------------------- */
export function DeliveryFilm() {
  const t = useTime();

  const scanIn = ease(t, 2.4, 0.5);
  const countProgress = ease(t, 3.2, 1.6); // ticks the tally down
  const expected = 42;
  const counted = Math.round(expected - countProgress); // 42 -> 41, one short
  const damagePin = ease(t, 5.6, 0.5);
  const collapse = ease(t, 6.6, 1.4); // rows collapse to exceptions only

  return (
    <Film
      t={t}
      title="Receive the exception, not just the boxes"
      category="Framing"
    >
      <Scene t={t} from={0} to={2}>
        <div style={{ padding: "18px 16px 0" }}>
          <Message style={appear(t, 0.2)}>
            Delivery arrived for PO-2214.
          </Message>
          <div style={{ marginTop: 12, ...appear(t, 0.9) }}>
            <Photo name="framing-delivery.png" height={190} />
            <Label style={{ marginTop: 6 }}>
              Label maps to 42 expected pieces
            </Label>
          </div>
        </div>
      </Scene>

      <Scene t={t} from={2} to={8.5}>
        <div style={{ padding: "16px 16px 0" }}>
          <Card
            style={{ padding: 12, position: "relative", ...appear(t, 2.1) }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: `2px solid ${INK}`,
                borderRadius: 12,
                opacity: 1 - scanIn,
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <Label>PO-2214</Label>
              <Label>Expected {expected}</Label>
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 34,
                fontWeight: 650,
                letterSpacing: "-0.01em",
                color: counted < expected ? AMBER : INK,
              }}
            >
              {counted}
              <span style={{ fontSize: 15, color: MUTE, fontWeight: 500 }}>
                {" "}
                counted
              </span>
            </div>
            {counted < expected ? (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: AMBER,
                  ...appear(t, 4.9, 0.3),
                }}
              >
                1 short of expected count
              </div>
            ) : null}
          </Card>

          <Touch t={t} at={3.2} x={280} y={90} duration={1.6} />

          <div
            style={{
              marginTop: 10,
              display: "flex",
              gap: 10,
              opacity: appear(t, 5.2).opacity,
            }}
          >
            <div style={{ flex: 1 }}>
              <Photo name="framing-damage.png" height={120} />
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <Label>Damaged piece</Label>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  color: AMBER,
                  opacity: damagePin,
                }}
              >
                Pinned as damaged
              </div>
            </div>
          </div>
          <Touch t={t} at={5.6} x={100} y={340} duration={0.5} />

          <div style={{ marginTop: 12 }}>
            <div style={{ opacity: 1 - collapse, fontSize: 12, color: MUTE }}>
              Reconciling 42 pieces against the label…
            </div>
            <div style={{ marginTop: 8, opacity: collapse, ...appear(t, 6.7) }}>
              <Label>Exceptions only</Label>
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: `1px solid ${LINE}`,
                  fontSize: 14,
                }}
              >
                <span>Cedar post</span>
                <span style={{ color: AMBER }}>1 short</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  fontSize: 14,
                }}
              >
                <span>Damaged piece</span>
                <span style={{ color: AMBER }}>Damaged</span>
              </div>
            </div>
          </div>
        </div>
      </Scene>

      <Scene t={t} from={8.5} to={12}>
        <Outcome
          t={t}
          at={8.5}
          title="Exceptions filed, not the full count"
          detail="1 short, 1 damaged — the receiving record carries only what needs a follow-up."
          photo="framing-damage.png"
        />
      </Scene>
    </Film>
  );
}

/* ----------------------------------------------------------------------- */
/* Installerpack — "Give each trade the right layer"                       */
/* A crowded plan holds every trade at once; picking framing fades the     */
/* rest, and the revision plus an unresolved item travel into the pack.    */
/* No certification language — this is a handoff, not a sign-off.          */
/* ----------------------------------------------------------------------- */
export function InstallerpackFilm() {
  const t = useTime();

  const fade = ease(t, 3.0, 1.6); // 0 -> 1, unrelated layers dim
  const framingCrisp = ease(t, 3.0, 0.8);
  const packIn = ease(t, 5.6, 1.2);

  const layers = [
    { label: "Tiles", color: "#8b9ca2", top: 40, left: 30, w: 110, h: 46 },
    { label: "Lighting", color: "#a69c82", top: 120, left: 170, w: 120, h: 40 },
    { label: "Paint", color: "#9ca697", top: 190, left: 60, w: 150, h: 44 },
  ];

  return (
    <Film t={t} title="Give each trade the right layer" category="Framing">
      <Scene t={t} from={0} to={2}>
        <div style={{ padding: "18px 16px 0" }}>
          <Message style={appear(t, 0.2)}>
            Send the framing crew their layer.
          </Message>
          <div style={{ marginTop: 12, ...appear(t, 0.9) }}>
            <Photo name="framing-plan.png" height={180} />
            <Label style={{ marginTop: 6 }}>One plan, four trade layers</Label>
          </div>
        </div>
      </Scene>

      <Scene t={t} from={2} to={8.5}>
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ display: "flex", gap: 8, ...appear(t, 2.1) }}>
            <Chip active={framingCrisp > 0.5}>Framing</Chip>
            <Chip style={{ opacity: 1 - fade * 0.85 }}>Tiles</Chip>
            <Chip style={{ opacity: 1 - fade * 0.85 }}>Lighting</Chip>
            <Chip style={{ opacity: 1 - fade * 0.85 }}>Paint</Chip>
          </div>

          <Card
            style={{
              marginTop: 10,
              padding: 0,
              overflow: "hidden",
              position: "relative",
              height: 270,
              ...appear(t, 2.3),
            }}
          >
            <Photo
              name="framing-plan.png"
              height={270}
              style={{ borderRadius: 0 }}
            />
            {layers.map((l) => (
              <div
                key={l.label}
                style={{
                  position: "absolute",
                  top: l.top,
                  left: l.left,
                  width: l.w,
                  height: l.h,
                  background: l.color,
                  opacity: 0.32 * (1 - fade * 0.85),
                  borderRadius: 6,
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                inset: 8,
                border: `2px solid ${INK}`,
                borderRadius: 8,
                opacity: framingCrisp,
                pointerEvents: "none",
              }}
            />
          </Card>
          <Touch t={t} at={2.9} x={40} y={18} duration={0.5} />

          <div
            style={{
              marginTop: 10,
              ...appear(t, 5.6, 0.4),
              transform: `translateY(${(1 - packIn) * 10}px)`,
            }}
          >
            <Card style={{ padding: 12 }}>
              <Label>Handoff pack · Framing</Label>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: MUTE }}>Source</span>
                  <span>Framing plan, sheet A-04</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: MUTE }}>Revision</span>
                  <span>Rev C · Sept 12</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: MUTE }}>Unresolved</span>
                  <span style={{ color: AMBER }}>
                    Missing blocking, beam B4
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Scene>

      <Scene t={t} from={8.5} to={12}>
        <Outcome
          t={t}
          at={8.5}
          title="Framing pack ready to send"
          detail="Rev C attached with 1 unresolved item — a handoff pack, not a certification."
          photo="framing-plan.png"
        />
      </Scene>
    </Film>
  );
}

/* ----------------------------------------------------------------------- */
/* Receipt — "Let the evidence build the return"                           */
/* The damaged can pairs with its delivery record, the damage detail and   */
/* affected quantity get confirmed, and it all folds into a draft return — */
/* built from evidence, but never sent on its own.                        */
/* ----------------------------------------------------------------------- */
export function ReceiptFilm() {
  const t = useTime();

  const pair = ease(t, 2.4, 1.2); // can slides toward the delivery record
  const cropZoom = ease(t, 4.2, 1.3); // damage detail crop
  const qtyProgress = ease(t, 6.0, 1.2);
  const qty = Math.round(qtyProgress * 3); // 0 -> 3 affected cans
  const fold = ease(t, 7.4, 1.0); // evidence folds into the draft

  return (
    <Film t={t} title="Let the evidence build the return" category="Paint">
      <Scene t={t} from={0} to={2}>
        <div style={{ padding: "18px 16px 0" }}>
          <Message style={appear(t, 0.2)}>
            Pair the damaged can with its delivery.
          </Message>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 12,
              ...appear(t, 0.9),
            }}
          >
            <Card style={{ flex: 1, padding: 8 }}>
              <Label>Damaged can</Label>
              <Photo name="paint-damage.png" height={100} />
            </Card>
            <Card style={{ flex: 1, padding: 8 }}>
              <Label>Delivery record</Label>
              <Photo name="paint-delivery.png" height={100} />
            </Card>
          </div>
        </div>
      </Scene>

      <Scene t={t} from={2} to={8.5}>
        <div style={{ padding: "16px 16px 0", position: "relative" }}>
          <div style={{ position: "relative", height: 150, ...appear(t, 2.1) }}>
            <div
              style={{
                position: "absolute",
                width: 130,
                left: 0 + pair * 90,
                top: 0,
                zIndex: 2,
              }}
            >
              <Photo name="paint-damage.png" height={110} />
            </div>
            <div style={{ position: "absolute", width: 130, right: 0, top: 0 }}>
              <Photo name="paint-delivery.png" height={110} />
            </div>
            <div
              style={{
                position: "absolute",
                left: 100,
                right: 120,
                top: 55,
                height: 2,
                background: INK,
                opacity: pair,
              }}
            />
          </div>
          <Touch
            t={t}
            at={2.4}
            x={30}
            y={55}
            to={{ x: 120, y: 55 }}
            duration={1.2}
          />
          <div
            style={{ marginTop: 4, opacity: pair, fontSize: 12, color: MUTE }}
          >
            Paired with PO-1180
          </div>

          <Card
            style={{
              marginTop: 12,
              padding: 0,
              overflow: "hidden",
              position: "relative",
              height: 150,
              ...appear(t, 3.9),
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `scale(${1 + cropZoom * 0.55})`,
                transformOrigin: "62% 40%",
              }}
            >
              <Photo
                name="paint-damage.png"
                height={150}
                style={{ borderRadius: 0 }}
              />
            </div>
            <div style={{ position: "absolute", left: 8, top: 8 }}>
              <Chip active>Damage detail</Chip>
            </div>
          </Card>
          <Touch t={t} at={4.2} x={220} y={100} duration={0.5} />

          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              ...appear(t, 5.8),
            }}
          >
            <Label>Affected quantity</Label>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 650 }}>{qty} of 12</span>
              {qtyProgress > 0.92 ? <Check size={16} /> : null}
            </div>
          </div>
          <Touch t={t} at={6.6} x={300} y={340} duration={0.4} />

          <div
            style={{
              marginTop: 12,
              opacity: fold,
              transform: `translateY(${(1 - fold) * 14}px) scale(${0.96 + fold * 0.04})`,
            }}
          >
            <Card style={{ padding: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Label>Return · PO-1180</Label>
                <Chip>Draft</Chip>
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: MUTE }}>
                3 damaged cans · evidence attached
              </div>
              <div style={{ marginTop: 10 }}>
                <Action>Save return draft</Action>
              </div>
            </Card>
          </div>
        </div>
      </Scene>

      <Scene t={t} from={8.5} to={12}>
        <Outcome
          t={t}
          at={8.5}
          title="Return draft assembled — not sent"
          detail="3 damaged cans linked to PO-1180. Ready to review before it goes out."
          photo="paint-damage.png"
        />
      </Scene>
    </Film>
  );
}
