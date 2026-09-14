import {
  Action,
  Bubble,
  Card,
  Chip,
  Enter,
  Label,
  C,
  clamp,
  settle,
} from "../ui";
const fields = [
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
export function Substitution({ t }: { t: number }) {
  return (
    <>
      <Label t={t}>Substitution</Label>
      <div style={{ transform: `translateY(${-88 * settle(t, 9.5, 0.45)}px)` }}>
        <Bubble>This pendant is delayed. Here's one that's in stock.</Bubble>
        <Enter t={t} style={{ marginTop: 14 }}>
          <Card title="Spec · Pendant">
            <div className="compare-head">
              <span>Specified</span>
              <b>Substitute</b>
            </div>
            {fields.map((r, i) => (
              <div
                key={r.name}
                className="compare-row"
                style={{
                  opacity: clamp(t, 0.7 + i * 0.75, 0.9 + i * 0.75),
                  transform: `translateY(${8 * (1 - settle(t, 0.7 + i * 0.75, 0.25))}px)`,
                }}
              >
                <div className="field-label">{r.name}</div>
                <div className="compare-values">
                  <span>{r.a}</span>
                  {r.b ? <b>{r.b}</b> : <span className="unknown" />}
                </div>
                {r.note ? <div className="field-note">{r.note}</div> : null}
              </div>
            ))}
            <div className="actions" style={{ marginTop: 20 }}>
              <Action secondary>Ask supplier</Action>
              <Action t={t} at={9}>
                Use substitute
              </Action>
            </div>
          </Card>
        </Enter>
        {t >= 9.5 ? (
          <Enter t={t} at={9.5}>
            <Bubble>Needs Dev to confirm the drop, Sam to approve $412.</Bubble>
          </Enter>
        ) : null}
      </div>
    </>
  );
}
export function SignOff({ t }: { t: number }) {
  const approved = t >= 8;
  return (
    <>
      <Label t={t}>Sign-off</Label>
      <Bubble>Needs Dev to confirm the drop, Sam to approve $412.</Bubble>
      <Enter t={t} style={{ marginTop: 14 }}>
        <Card title="Approval · Pendant substitute">
          {[
            {
              name: "Dev",
              role: "Installer",
              note: "Confirms drop and clearance",
              at: 4,
            },
            { name: "Sam", role: "Co-owner", note: "Approves $412", at: 8 },
          ].map((person) => (
            <div key={person.name} className="approval-row">
              <div className="person-avatar">{person.name[0]}</div>
              <div className="approval-copy">
                <b>
                  {person.name} <span>· {person.role}</span>
                </b>
                <small>{person.note}</small>
              </div>
              <div
                className={`approval-check ${t >= person.at ? "approved" : ""}`}
                style={{
                  transform: `scale(${t >= person.at ? 0.85 + 0.15 * settle(t, person.at) : 1})`,
                }}
              >
                {t >= person.at ? "✓" : ""}
              </div>
            </div>
          ))}
          <div
            className="approval-footer"
            style={{ color: approved ? C.green : C.muted }}
          >
            {approved
              ? "Approved · 2 of 2"
              : t >= 4
                ? "Waiting on 1"
                : "Waiting on 2"}
          </div>
          <div
            style={{ height: 44 * settle(t, 8.5, 0.32), overflow: "hidden" }}
          >
            <Enter t={t} at={8.5}>
              <Action t={t} at={11.4}>
                Order
              </Action>
            </Enter>
          </div>
        </Card>
      </Enter>
      {t >= 4 ? (
        <Enter t={t} at={4}>
          <div className="remote-meta">Dev’s device · 14 Sept, 9:41</div>
          <Bubble>dev: clearance is fine</Bubble>
        </Enter>
      ) : null}
      {t >= 8 ? (
        <Enter t={t} at={8}>
          <div className="remote-meta">Sam’s device · 14 Sept, 9:41</div>
          <Bubble>sam: brass is fine</Bubble>
        </Enter>
      ) : null}
    </>
  );
}
export function OrderThread({ t }: { t: number }) {
  return (
    <>
      <Label t={t}>Order thread</Label>
      <div
        style={{
          transform: `translateY(${-32 * settle(t, 0, 0.5)}px)`,
          paddingTop: 32,
        }}
      >
        <Chip>Pendant substitute · Approved · Dev, Sam</Chip>
        <Enter t={t} at={0.25} style={{ marginTop: 18 }}>
          <Card title="Bathroom · 4 of 11 ordered">
            <div className="progress-track">
              <div
                style={{ width: `${((100 * 4) / 11) * settle(t, 0.5, 0.5)}%` }}
              />
            </div>
            <div className="order-list">
              {[
                { name: "Tile", detail: "7 boxes · Maya" },
                { name: "Sample", detail: "Maya" },
                { name: "Pendant substitute", detail: "Dev, Sam" },
                { name: "Vanity", detail: "Maya" },
              ].map((r, i) => (
                <div
                  className="order-row"
                  key={r.name}
                  style={{ opacity: clamp(t, 0.7 + i * 0.75, 0.9 + i * 0.75) }}
                >
                  <span className="order-dot" />
                  <div>
                    <b>{r.name}</b>
                    <small>{r.detail}</small>
                  </div>
                </div>
              ))}
              <div className="dependencies">
                <div
                  className="order-row"
                  style={{ opacity: clamp(t, 3.7, 3.9) }}
                >
                  <span className="order-dot open" />
                  <div>
                    <b>Mirror</b>
                    <small>↥ waits on vanity width</small>
                    <small>36 in vanity · mirror ≤ 34 in</small>
                  </div>
                </div>
                <div
                  className="order-row"
                  style={{ opacity: clamp(t, 4.45, 4.65) }}
                >
                  <span className="order-dot open" />
                  <div>
                    <b>Faucet</b>
                    <small>↥ needed before 12 Oct</small>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Enter>
      </div>
    </>
  );
}
