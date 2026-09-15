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

function tapScale(t: number, at: number) {
  return 1 - 0.07 * Math.max(0, 1 - Math.abs(t - at) / 0.18);
}

// Capture (12s): a room photo is deliberately attached to the first spec,
// the tap-to-attach and tap-to-save gestures are visible, and the photo's
// source is retained after saving.
export function Capture({ t }: { t: number }) {
  const attachAt = 4.6;
  const saveAt = 7.8;
  const attached = t >= attachAt + 0.15;
  const saved = t >= saveAt + 0.15;
  const attachFade = progress(t, attachAt + 0.05, attachAt + 0.45);
  const saveFade = progress(t, saveAt + 0.05, saveAt + 0.3);
  const path: Point[] = [
    { at: 0, x: 300, y: 560 },
    { at: 3.6, x: 300, y: 560 },
    { at: 4.3, x: 243, y: 337 },
    { at: attachAt, x: 243, y: 337, press: true },
    { at: 5.1, x: 243, y: 337 },
    { at: 6.9, x: 210, y: 458 },
    { at: saveAt, x: 210, y: 458, press: true },
    { at: 12, x: 210, y: 458 },
  ];
  return (
    <Stage t={t} path={path}>
      <In t={t} at={0.15}>
        <Message>Match the vanity to this wall?</Message>
      </In>
      <In t={t} at={0.45}>
        <Card eyebrow="Spec 01" title="Vanity Faucet">
          <Row
            label="Reference photo"
            value={attached ? "Attached" : "Not attached"}
          />
          <div style={{ position: "relative", height: 172, marginTop: 2 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 1 - attachFade,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Photo
                name="room"
                height={54}
                style={{ width: 54, flexShrink: 0, borderRadius: 9 }}
              />
              <Button
                secondary
                style={{
                  flex: 1,
                  transform: `scale(${tapScale(t, attachAt)})`,
                }}
              >
                Attach photo
              </Button>
            </div>
            <div
              style={{ position: "absolute", inset: 0, opacity: attachFade }}
            >
              <Photo name="room" height={104} />
              <div className="source-note">
                Source: your photo, captured on the walkthrough.
              </div>
            </div>
          </div>
          <Button
            approved={saved}
            style={{
              marginTop: 14,
              transform: `scale(${tapScale(t, saveAt)})`,
            }}
          >
            {saved ? "Saved to Spec 01" : "Save to spec"}
          </Button>
          <div
            style={{
              opacity: saveFade,
              marginTop: 10,
              height: saveFade > 0 ? undefined : 0,
              overflow: "hidden",
            }}
          >
            <Chip approved>Source retained</Chip>
          </div>
        </Card>
      </In>
    </Stage>
  );
}

// NextPrompt (9s): the assistant offers a horizontal row of contextual
// prompts. A swipe reveals the one that actually blocks progress, and
// choosing it returns an answer tied to this bathroom, not a generic tip.
export function NextPrompt({ t }: { t: number }) {
  const dragStart = 3.0;
  const dragEnd = 4.0;
  const tapAt = 5.0;
  const dragP = settle(t, dragStart, dragEnd - dragStart);
  const shiftX = -160 * dragP;
  const chosen = t >= tapAt + 0.15;
  const selectFade = progress(t, tapAt, tapAt + 0.4);
  const path: Point[] = [
    { at: 0, x: 210, y: 400 },
    { at: 2.5, x: 210, y: 400 },
    { at: 2.7, x: 370, y: 154 },
    { at: dragStart, x: 370, y: 154, press: true },
    { at: 3.2, x: 332, y: 154, press: true },
    { at: 3.4, x: 294, y: 154, press: true },
    { at: 3.6, x: 256, y: 154, press: true },
    { at: 3.8, x: 218, y: 154, press: true },
    { at: dragEnd, x: 180, y: 154, press: true },
    { at: 4.3, x: 180, y: 154 },
    { at: 4.6, x: 207, y: 154 },
    { at: tapAt, x: 207, y: 154, press: true },
    { at: 6.2, x: 210, y: 300 },
    { at: 9, x: 210, y: 300 },
  ];
  const labels = [
    "See tile options",
    "Compare finishes",
    "Confirm delivery access",
    "View install timeline",
  ];
  return (
    <Stage t={t} path={path} draft={chosen ? "Confirm delivery access" : ""}>
      <In t={t} at={0.15}>
        <Message>A few things could shape this install.</Message>
      </In>
      <In t={t} at={0.5} style={{ overflow: "hidden", width: "100%" }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            width: "max-content",
            transform: `translateX(${shiftX}px)`,
          }}
        >
          {labels.map((label, i) => {
            const isChosen = i === 2;
            const dim = !isChosen ? 0.65 * selectFade : 0;
            return (
              <div
                key={label}
                style={{
                  opacity: 1 - dim,
                  flexShrink: 0,
                  transform: isChosen
                    ? `scale(${tapScale(t, tapAt)})`
                    : undefined,
                }}
              >
                <Chip approved={isChosen && chosen}>{label}</Chip>
              </div>
            );
          })}
        </div>
      </In>
      <In t={t} at={tapAt + 0.5} style={{ marginTop: 16 }}>
        <Card eyebrow="Delivery access" title="Confirm before scheduling">
          <Row label="Entry photo" value="Four steps visible" />
          <Row label="Crate dimensions" value="Supplier confirmation needed" />
          <Caption warning>
            Ask for packed dimensions before choosing a delivery slot.
          </Caption>
        </Card>
      </In>
    </Stage>
  );
}

// Recall (10s): filter the saved library down to tile, select the chosen
// blue-green swatch, and expand it into a reference showing who approved
// it, why, and the daylight photo the color was checked against.
export function Recall({ t }: { t: number }) {
  const filterAt = 2.6;
  const selectAt = 4.0;
  const detailAt = 4.5;
  const filtered = t >= filterAt + 0.15;
  const filterFade = progress(t, filterAt + 0.1, filterAt + 0.6);
  const selected = t >= selectAt + 0.15;
  const items: {
    name: "room" | "sample" | "pendant" | "entry";
    label: string;
    tile: boolean;
  }[] = [
    { name: "room", label: "Room", tile: false },
    { name: "sample", label: "Tile, blue-green", tile: true },
    { name: "pendant", label: "Pendant", tile: false },
    { name: "entry", label: "Entry", tile: false },
  ];
  const path: Point[] = [
    { at: 0, x: 150, y: 420 },
    { at: 2.0, x: 150, y: 420 },
    { at: 2.3, x: 89, y: 148 },
    { at: filterAt, x: 89, y: 148, press: true },
    { at: 3.1, x: 89, y: 148 },
    { at: 3.6, x: 152, y: 272 },
    { at: selectAt, x: 152, y: 272, press: true },
    { at: 4.4, x: 152, y: 230 },
    { at: 10, x: 152, y: 230 },
  ];
  return (
    <Stage t={t} path={path}>
      <In t={t} at={0.15}>
        <Message>Here is what is already chosen for this room.</Message>
      </In>
      <In t={t} at={0.45}>
        <div className="tab-strip">
          {["All", "Tile", "Fixtures"].map((label) => {
            const isTileTab = label === "Tile";
            const active = filtered ? isTileTab : label === "All";
            return (
              <span
                key={label}
                className={active ? "active" : undefined}
                style={{
                  transform: isTileTab
                    ? `scale(${tapScale(t, filterAt)})`
                    : undefined,
                }}
              >
                {label}
              </span>
            );
          })}
        </div>
      </In>
      <In t={t} at={0.6}>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          {items.map((item) => {
            const isTile = item.tile;
            const dim = !isTile ? 0.85 * filterFade : 0;
            const isSelected = isTile && selected;
            return (
              <div
                key={item.name}
                className={`choice${isSelected ? " selected" : ""}`}
                style={{
                  width: 80,
                  opacity: 1 - dim,
                  textAlign: "center",
                  transform: isTile
                    ? `scale(${tapScale(t, selectAt)})`
                    : undefined,
                }}
              >
                <Photo
                  name={item.name}
                  height={54}
                  style={{ width: 54, borderRadius: 9, margin: "0 auto" }}
                />
                <div className="small-label" style={{ marginTop: 6 }}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </In>
      <In t={t} at={detailAt} style={{ marginTop: 16 }}>
        <Card eyebrow="Tile, blue-green" title="Bathroom Wall Tile">
          <Photo name="sample" height={80} />
          <Row label="Approved by" value="Sam" />
          <Row label="Reason" value="Matches the shower glass tone" />
          <Row label="Daylight source" value="Kitchen window photo, 2:15pm" />
          <Caption>Confirmed under natural light, not screen color.</Caption>
        </Card>
      </In>
    </Stage>
  );
}

// SiteWalk (10s): the room footage plays, then a tap collapses it smoothly
// into a small pinned reference while the chat asks about the installer's
// clearances, keeping the walkthrough as visible context, not discarding it.
export function SiteWalk({ t }: { t: number }) {
  const collapseAt = 4.4;
  const collapseP = settle(t, collapseAt, 1.0);
  const vidWidth = 376 - 272 * collapseP;
  const vidHeight = 300 - 230 * collapseP;
  const pinOpacity = 1 - progress(t, collapseAt, collapseAt + 0.3);
  const labelOpacity = progress(t, collapseAt + 0.3, collapseAt + 0.75);
  const captionOpacity = 1 - collapseP;
  const path: Point[] = [
    { at: 0, x: 200, y: 200 },
    { at: 3.4, x: 200, y: 200 },
    { at: 3.9, x: 356, y: 115 },
    { at: collapseAt, x: 356, y: 115, press: true },
    { at: 4.8, x: 356, y: 115 },
    { at: 6.0, x: 210, y: 420 },
    { at: 10, x: 210, y: 420 },
  ];
  return (
    <Stage t={t} path={path} context="Maya + Sam · site walk">
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            position: "relative",
            width: vidWidth,
            height: vidHeight,
            flexShrink: 0,
            borderRadius: 11,
            overflow: "hidden",
            transform: `scale(${tapScale(t, collapseAt)})`,
          }}
        >
          <Footage name="room" t={t} height={vidHeight} />
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: "6px 12px",
              borderRadius: 20,
              background: "rgba(36,40,39,.72)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              opacity: pinOpacity,
            }}
          >
            Pin to context
          </div>
        </div>
        <div style={{ opacity: labelOpacity, paddingTop: 4 }}>
          <span className="status-dot" />
          <span className="small-label">
            Site walk, pinned
            <br />
            Sept 12
          </span>
        </div>
      </div>
      <div
        style={{
          opacity: captionOpacity,
          height: 30 * (1 - collapseP) + 12,
          overflow: "hidden",
        }}
      >
        <Caption>Recorded during the site walk, Sept 12.</Caption>
      </div>
      <In t={t} at={5.0}>
        <Message user>
          What clearance does the installer need around the vanity?
        </Message>
      </In>
      <In t={t} at={6.4}>
        <Message>
          I’ll keep this view with the question for Dev. Clearances still need
          an installer measurement.
        </Message>
      </In>
    </Stage>
  );
}
