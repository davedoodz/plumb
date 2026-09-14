import {
  Action,
  Bubble,
  Card,
  Chip,
  Enter,
  Label,
  TileImage,
  C,
  settle,
  clamp,
} from "../ui";
export function Sample({ t }: { t: number }) {
  const p = settle(t, 4.05, 0.45);
  return (
    <>
      <Label t={t}>Sample</Label>
      <Chip>Tile · 7 boxes · Added</Chip>
      <Bubble>Want the sample before the pallet?</Bubble>
      <div style={{ position: "relative", marginTop: 14 }}>
        <div style={{ height: 400 * (1 - p) + 46 * p, overflow: "hidden" }}>
          <Enter t={t}>
            <div style={{ opacity: 1 - clamp(t, 4.05, 4.3) }}>
              <Card title="Sample · Puget Sound 3×9">
                <TileImage height={195} />
                <div className="sample-meta">
                  <b>Free</b>
                  <span>Ships today</span>
                </div>
                <Action t={t} at={3.8}>
                  Send sample
                </Action>
              </Card>
            </div>
          </Enter>
        </div>
        <div
          style={{
            position: "absolute",
            inset: "0 0 auto",
            opacity: clamp(t, 4.3, 4.55),
          }}
        >
          <Chip>Sample · Arrives Wed</Chip>
        </div>
      </div>
    </>
  );
}
export function LeadTime({ t }: { t: number }) {
  const failure = t >= 5.95;
  return (
    <>
      <Label t={t}>Lead time</Label>
      <Chip>Tile · 7 boxes · Added</Chip>
      <Chip>Sample · Arrives Wed</Chip>
      <Enter t={t} at={0.6} style={{ marginTop: 18 }}>
        <Card title="Lead time · Bathroom">
          <div className="timeline-title">
            14 Sept <span>20 Oct</span>
          </div>
          <div className="supply-chart">
            <div className="today-line" />
            <div className="plumber-line">
              <span>
                Plumber
                <br />
                <b>12 Oct</b>
              </span>
            </div>
            <div className="supply-lane">
              <div
                className="supply-bar"
                style={{ width: `${(35 / 36) * 100 * settle(t, 1.1, 0.45)}%` }}
              >
                Tile · 3–5 wks
              </div>
              <span
                className="range-caption"
                style={{ opacity: clamp(t, 1.7, 1.9) }}
              >
                5–19 Oct
              </span>
            </div>
            <div className="supply-lane">
              <div
                className="supply-bar"
                style={{ width: `${39 * settle(t, 2.1, 0.45)}%` }}
              >
                Vanity · 2 wks
              </div>
            </div>
            <div
              className="supply-lane pendant-lane"
              style={{ opacity: clamp(t, 5, 5.2) }}
            >
              <div
                className="supply-bar late"
                style={{ width: `${100 * settle(t, 5, 0.45)}%` }}
              >
                Pendant · 8 wks <span>→</span>
              </div>
              <span className="range-caption" style={{ color: C.orange }}>
                lands 9 Nov · beyond timeline
              </span>
            </div>
          </div>
          <div
            className="lead-verdict"
            style={{
              opacity: clamp(t, 3, 3.2),
              color: failure ? C.orange : C.ink,
            }}
          >
            {failure
              ? "Pendant lands after the plumber. Not OK."
              : "Tile: 3–5 weeks. Plumber date at risk."}
          </div>
          <div className="small-note">
            {failure
              ? "Tile arrival also needs confirmation."
              : "Confirm delivery before booking the second visit."}
          </div>
        </Card>
      </Enter>
    </>
  );
}
