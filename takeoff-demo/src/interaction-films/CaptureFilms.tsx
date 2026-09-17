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

const AMBER = {
  background: "#f6e6c8",
  border: "1px solid #c1902f",
  color: "#7a4f12",
} as const;

// ---------------------------------------------------------------------------
// CAPTURE — camera framing → shutter flash → pin the exact ceiling point →
// the annotated photo collapses into the conversation with its note.
// ---------------------------------------------------------------------------
export function CaptureFilm() {
  const t = useTime();

  const CARD_TOP = 82;
  const CARD_LEFT = 16;
  const CARD_H = 300;
  const PIN_X = 172; // relative to card
  const PIN_Y = 118; // relative to card

  const flash = Math.max(0, ease(t, 3.5, 0.1) - ease(t, 3.62, 0.45));
  const pinAt = 4.6;
  const compress = ease(t, 6.3, 1.3);

  return (
    <Film
      t={t}
      title="Attach the detail, not just the photo"
      category="Lighting"
    >
      <Scene t={t} from={0} to={2.9}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "20px 16px 96px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Message user style={appear(t, 0.1, 0.3)}>
            Where exactly does the pendant mount above the island?
          </Message>
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <Label>Camera</Label>
            <Action style={appear(t, 0.7, 0.3)}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    display: "inline-block",
                  }}
                />
                Open camera
              </span>
            </Action>
          </div>
        </div>
        <Touch t={t} at={1.3} x={176} y={506} duration={0.5} />
      </Scene>

      <Scene t={t} from={2.9} to={8.5} style={{ background: "#fff" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "20px 16px 96px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <Label style={appear(t, 2.9, 0.3)}>Framing the ceiling point</Label>
          <div
            style={{
              transform: `translate(${compress * -42}px, ${compress * 152}px) scale(${1 - compress * 0.6})`,
              transformOrigin: "left top",
              opacity: 1 - compress * 0.12,
            }}
          >
            <Card
              style={{ padding: 0, overflow: "hidden", position: "relative" }}
            >
              <Photo name="lighting-room.png" height={CARD_H} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#ffffff",
                  opacity: flash,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: PIN_X - 9,
                  top: PIN_Y - 9,
                  width: 18,
                  height: 18,
                  ...appear(t, pinAt + 0.45, 0.3, 6),
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    boxShadow: "0 0 0 2px #15181b",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 6,
                    top: 6,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#15181b",
                  }}
                />
              </div>
            </Card>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              ...appear(t, 5.3, 0.3),
            }}
          >
            <Check />
            <Label>Ceiling point pinned · note attached</Label>
          </div>
        </div>
        <Touch
          t={t}
          at={3.5}
          x={CARD_LEFT + 160}
          y={CARD_TOP + 30}
          duration={0.2}
        />
        <Touch
          t={t}
          at={pinAt}
          x={CARD_LEFT + PIN_X}
          y={CARD_TOP + PIN_Y}
          duration={0.45}
        />
      </Scene>

      <Scene t={t} from={8.5} to={12} style={{ background: "#fff" }}>
        <div style={{ position: "relative", marginTop: 22, ...appear(t, 8.5) }}>
          <Photo name="lighting-room.png" height={225} />
          <div
            style={{
              position: "absolute",
              left: 178,
              top: 76,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#171717",
              border: "3px solid white",
              boxShadow: "0 0 0 1px #171717",
            }}
          />
        </div>
        <Outcome
          t={t}
          at={8.5}
          title="Ceiling point pinned"
          detail="Mounting point marked on the ceiling photo — note attached to the thread."
        />
      </Scene>
    </Film>
  );
}

// ---------------------------------------------------------------------------
// PROMPT — two evidence photos are in, the threshold slot is missing → the
// guided photo library slides up, one angle is selected → the gap fills and
// the next question becomes precise.
// ---------------------------------------------------------------------------
export function PromptFilm() {
  const t = useTime();

  const SLOT_TOP = 176;
  const SLOT_W = 101;
  const SLOT_H = 110;
  const SLOT_LEFT = [16, 126, 236];
  const slot3Center = {
    x: SLOT_LEFT[2] + SLOT_W / 2,
    y: SLOT_TOP + SLOT_H / 2,
  };

  const PANEL_LEFT = 16;
  const PANEL_TOP = 282;
  const THUMB = { w: 152, h: 96 };
  const thumb1 = {
    x: PANEL_LEFT + 14 + THUMB.w / 2,
    y: PANEL_TOP + 14 + THUMB.h / 2,
  };

  const openLibrary = ease(t, 3.0, 0.35);
  const selected = ease(t, 4.6, 0.25);
  const fillDrag = ease(t, 5.4, 1.0);
  const filled = ease(t, 6.2, 0.4);
  const closeLibrary = ease(t, 6.6, 0.7);

  const dragX = thumb1.x + (slot3Center.x - thumb1.x) * fillDrag;
  const dragY = thumb1.y + (slot3Center.y - thumb1.y) * fillDrag;
  const flyOpacity = Math.max(0, ease(t, 5.4, 0.15) - ease(t, 6.3, 0.3));

  function Slot({
    index,
    name,
    label,
    missing,
  }: {
    index: number;
    name: string;
    label: string;
    missing?: boolean;
  }) {
    return (
      <div
        style={{
          position: "absolute",
          left: SLOT_LEFT[index],
          top: SLOT_TOP,
          width: SLOT_W,
          height: SLOT_H,
        }}
      >
        {missing ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 10,
              border: "1.5px dashed #c1902f",
              background: "rgba(246,230,200,0.35)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              opacity: 1 - filled,
            }}
          >
            <Chip style={AMBER}>Missing</Chip>
            <Label>{label}</Label>
          </div>
        ) : (
          <Card style={{ padding: 0, overflow: "hidden", height: "100%" }}>
            <Photo name={name} height={SLOT_H} />
          </Card>
        )}
        {index === 2 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: filled,
              pointerEvents: "none",
            }}
          >
            <Card style={{ padding: 0, overflow: "hidden", height: "100%" }}>
              <Photo name="tiles-layout.png" height={SLOT_H} />
            </Card>
            <div
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                ...appear(t, 6.5, 0.3, 4),
              }}
            >
              <Check size={14} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Film t={t} title="Ask for the missing angle" category="Tiles">
      <Scene t={t} from={0} to={8.5}>
        <div
          style={{ position: "absolute", inset: 0, padding: "20px 16px 96px" }}
        >
          <Message style={appear(t, 0.1, 0.3)}>
            Two photos are in — the threshold shot is still missing.
          </Message>
        </div>
        <Slot index={0} name="tiles-room.png" label="Entry" />
        <Slot index={1} name="tiles-sample.png" label="Finish" />
        <Slot index={2} name="tiles-layout.png" label="Threshold" missing />
      </Scene>

      <Scene t={t} from={2.4} to={8.5}>
        <div
          style={{
            position: "absolute",
            left: PANEL_LEFT,
            top: PANEL_TOP,
            width: 353 - PANEL_LEFT * 2,
            height: 250,
            opacity: (1 - closeLibrary) * openLibrary,
            transform: `translateY(${(1 - openLibrary) * 40 + closeLibrary * 60}px)`,
          }}
        >
          <Card
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <Label>Photo library</Label>
            <div style={{ position: "relative", flex: 1 }}>
              {[
                { name: "tiles-layout.png", x: 0, y: 0 },
                { name: "tiles-batch.png", x: 1, y: 0 },
                { name: "tiles-damage.png", x: 0, y: 1 },
                { name: "tiles-delivery.png", x: 1, y: 1 },
              ].map((it) => (
                <div
                  key={it.name}
                  style={{
                    position: "absolute",
                    left: it.x * (THUMB.w + 9),
                    top: it.y * (THUMB.h + 9),
                    width: THUMB.w,
                    height: THUMB.h,
                    borderRadius: 10,
                    overflow: "hidden",
                    border:
                      it.name === "tiles-layout.png"
                        ? `2px solid rgba(21,24,27,${selected})`
                        : "2px solid transparent",
                  }}
                >
                  <Photo name={it.name} height={THUMB.h} />
                  {it.name === "tiles-layout.png" && (
                    <div
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        opacity: selected,
                      }}
                    >
                      <Check size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {fillDrag > 0 && fillDrag < 1 && (
          <div
            style={{
              position: "absolute",
              left: dragX - (THUMB.w * (1 - fillDrag * 0.4)) / 2,
              top: dragY - (THUMB.h * (1 - fillDrag * 0.4)) / 2,
              width: THUMB.w * (1 - fillDrag * 0.4),
              height: THUMB.h * (1 - fillDrag * 0.4),
              borderRadius: 10,
              overflow: "hidden",
              opacity: flyOpacity,
              boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
            }}
          >
            <Photo name="tiles-layout.png" height={THUMB.h} />
          </div>
        )}

        <Touch
          t={t}
          at={4.0}
          x={thumb1.x - 36}
          y={thumb1.y - 24}
          to={{ x: thumb1.x, y: thumb1.y }}
          duration={0.6}
        />
        <Touch
          t={t}
          at={5.4}
          x={thumb1.x}
          y={thumb1.y}
          to={{ x: slot3Center.x, y: slot3Center.y }}
          duration={1.0}
        />
      </Scene>

      <Scene t={t} from={8.5} to={12} style={{ background: "#fff" }}>
        <Outcome
          t={t}
          at={8.5}
          title="Evidence set complete"
          detail="Entry, finish and threshold confirmed — is the transition flush or a reducer strip?"
          photo="tiles-layout.png"
        />
      </Scene>
    </Film>
  );
}

// ---------------------------------------------------------------------------
// WALKTHROUGH — a framing photo plus an active voice waveform → the example
// transcript phrase highlights → room, issue and action resolve into one
// explicit missing-blocking hold (voice transcription is a motion concept,
// not a claim of implemented recognition).
// ---------------------------------------------------------------------------
export function WalkthroughFilm() {
  const t = useTime();

  const words = ["Missing", "blocking", "behind", "the", "vanity", "wall."];
  const wordStart = (i: number) => 3.0 + i * 0.35;

  const micX = 42;
  const micY = 506;
  const press = Math.max(0, ease(t, 0.9, 0.15) - ease(t, 1.75, 0.15));
  const envelope = Math.max(
    0,
    Math.min(ease(t, 1.9, 0.3), 1 - ease(t, 4.6, 0.4)),
  );

  return (
    <Film t={t} title="Turn a spoken concern into a hold" category="Framing">
      <Scene t={t} from={0} to={1.7}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "20px 16px 96px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <Photo name="framing-room.png" height={230} />
          </Card>
          <Label style={appear(t, 0.5, 0.3)}>Voice note</Label>
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#15181b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scale(${1 - press * 0.14})`,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#fff",
                }}
              />
            </div>
            <Label>Hold to record</Label>
          </div>
        </div>
        <Touch t={t} at={0.9} x={micX} y={micY} duration={1.0} />
      </Scene>

      <Scene t={t} from={1.7} to={8.5} style={{ background: "#fff" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: "20px 16px 96px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <Photo name="framing-room.png" height={140} />
          </Card>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 3,
              height: 36,
            }}
          >
            {Array.from({ length: 22 }, (_, i) => {
              const h =
                6 +
                envelope * (10 + 14 * Math.abs(Math.sin(i * 0.9 + t * 2.6)));
              return (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: h,
                    borderRadius: 2,
                    background: "#15181b",
                    opacity: 0.25 + envelope * 0.6,
                  }}
                />
              );
            })}
          </div>

          <Label style={appear(t, 1.9, 0.25)}>Recording — vanity wall</Label>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0 6px",
              fontSize: 16,
              lineHeight: 1.4,
            }}
          >
            {words.map((w, i) => (
              <span
                key={i}
                style={{
                  color: "#15181b",
                  opacity: 0.3 + 0.7 * ease(t, wordStart(i), 0.25),
                }}
              >
                {w}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={appear(t, 5.2, 0.3, 10)}>
              <Chip>Room · Vanity wall</Chip>
            </div>
            <div style={appear(t, 5.7, 0.3, 10)}>
              <Chip style={AMBER}>Issue · Missing blocking</Chip>
            </div>
            <div style={appear(t, 6.2, 0.3, 10)}>
              <Chip style={AMBER}>Action · Hold install</Chip>
            </div>
          </div>
        </div>
      </Scene>

      <Scene t={t} from={8.5} to={12} style={{ background: "#fff" }}>
        <Outcome
          t={t}
          at={8.5}
          title="Missing-blocking hold"
          detail="Vanity wall — install paused pending blocking. Logged as an open hold, not an approval."
          photo="framing-room.png"
        />
      </Scene>
    </Film>
  );
}
