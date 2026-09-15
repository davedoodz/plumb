import React from "react";
import {
  Stage,
  In,
  Message,
  Card,
  Photo,
  Button,
  Chip,
  Row,
  Caption,
  Point,
} from "./kit";

function CompareRow({
  label,
  spec,
  sub,
  isUnknown = false,
}: {
  label: string;
  spec: string;
  sub?: string;
  isUnknown?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "11px 0",
        borderBottom: "1px solid #eff0ec",
        fontSize: 13,
      }}
    >
      <span style={{ flex: "0 0 34%", color: "#838b83" }}>{label}</span>
      <strong style={{ flex: "0 0 33%", fontWeight: 550 }}>{spec}</strong>
      {isUnknown ? (
        <span className="blank" style={{ flex: "0 0 29%" }} />
      ) : (
        <strong style={{ flex: "0 0 29%", fontWeight: 550 }}>{sub}</strong>
      )}
    </div>
  );
}

function ApprovalRow({
  name,
  task,
  status,
  approved,
}: {
  name: string;
  task: string;
  status: string;
  approved: boolean;
}) {
  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid #eff0ec" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <span>
          <span
            className="status-dot"
            style={{ background: approved ? "#2e7047" : "#818d81" }}
          />
          {name}
        </span>
        <span className={approved ? "approved-text" : ""}>{status}</span>
      </div>
      <div style={{ fontSize: 11, color: "#899187", marginTop: 4 }}>{task}</div>
    </div>
  );
}

function Detail({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "10px 0 0",
        fontSize: 12,
        color: "#57605a",
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}

export function Substitution({ t }: { t: number }) {
  const asking = t >= 5.2 && t < 6.0;
  const path: Point[] = [
    { at: 0, x: 340, y: 660 },
    { at: 4.4, x: 210, y: 404 },
    { at: 5.2, x: 210, y: 404, press: true },
    { at: 8, x: 210, y: 404 },
    { at: 12, x: 210, y: 404 },
  ];
  return (
    <Stage
      t={t}
      path={path}
      context="Pendant substitute"
      draft={asking ? "Ask supplier: confirm 2700K colour temperature" : ""}
    >
      <In t={t} at={0}>
        <Message>Compare it before you ask the supplier.</Message>
      </In>
      <Card eyebrow="Compare · Pendant" title="Specified vs. substitute">
        <In t={t} at={0.6}>
          <CompareRow label="Drop" spec="18 in" sub="18 in" />
        </In>
        <In t={t} at={1.3}>
          <CompareRow label="Finish" spec="Brass" sub="Brass" />
        </In>
        <In t={t} at={2.2}>
          <CompareRow label="Colour temp" spec="2700K" isUnknown />
        </In>
        <In t={t} at={2.2}>
          <Caption warning>
            Not listed by the supplier yet — needs confirmation.
          </Caption>
        </In>
        <In t={t} at={3.2}>
          <div className="row-actions">
            <Button secondary>Ask supplier</Button>
          </div>
        </In>
      </Card>
      <In t={t} at={6.0}>
        <Message user>Ask supplier to confirm the colour temp.</Message>
      </In>
      <In t={t} at={7.2}>
        <Chip>Pending — waiting on supplier reply</Chip>
      </In>
    </Stage>
  );
}

export function Signoff({ t }: { t: number }) {
  const devOpen = t >= 1.8 && t < 3.4;
  const devConfirmed = t >= 3.4;
  const samOpen = t >= 5.2 && t < 6.8;
  const samApproved = t >= 6.8;
  const waiting = (devConfirmed ? 0 : 1) + (samApproved ? 0 : 1);
  const path: Point[] = [
    { at: 0, x: 340, y: 660 },
    { at: 1.2, x: 210, y: 198 },
    { at: 1.8, x: 210, y: 198, press: true },
    { at: 2.8, x: 210, y: 313 },
    { at: 3.4, x: 210, y: 313, press: true },
    { at: 4.6, x: 210, y: 260 },
    { at: 5.2, x: 210, y: 260, press: true },
    { at: 6.2, x: 210, y: 357 },
    { at: 6.8, x: 210, y: 357, press: true },
    { at: 12, x: 210, y: 357 },
  ];
  return (
    <Stage t={t} path={path} context="Two approvals pending">
      <Card
        eyebrow="Approvals · Pendant substitute"
        title="Two sign-offs needed"
      >
        <In t={t} at={0}>
          <ApprovalRow
            name="Dev · Installer"
            task="Confirms clearance at the vanity"
            status={devConfirmed ? "Confirmed" : "Pending"}
            approved={devConfirmed}
          />
        </In>
        {devOpen && (
          <In t={t} at={1.8}>
            <Detail>
              <div>
                Dev checked the pendant position on site. Installation fit
                confirmed.
              </div>
              <div className="row-actions">
                <Button secondary>Confirm installation</Button>
              </div>
            </Detail>
          </In>
        )}
        <In t={t} at={0.2}>
          <ApprovalRow
            name="Sam · Co-owner"
            task="Approves the $412 budget change"
            status={samApproved ? "Approved" : "Pending"}
            approved={samApproved}
          />
        </In>
        {samOpen && (
          <In t={t} at={5.2}>
            <Detail>
              <div>Approve the $412 budget increase for this substitute.</div>
              <div className="row-actions">
                <Button secondary>Approve $412</Button>
              </div>
            </Detail>
          </In>
        )}
        <In t={t} at={0.4}>
          <Caption>
            {waiting === 0 ? "Approved — Dev, Sam" : `Waiting on ${waiting}`}
          </Caption>
        </In>
      </Card>
      <In t={t} at={9}>
        <Chip approved={waiting === 0}>
          {waiting === 0
            ? "Pendant substitute — approved by Dev, Sam"
            : "Pendant substitute — approval in progress"}
        </Chip>
      </In>
    </Stage>
  );
}

export function Delivery({ t }: { t: number }) {
  const noteTyped = t >= 2.4;
  const noteFull = t >= 3.6;
  const attached = t >= 6.0;
  const path: Point[] = [
    { at: 0, x: 340, y: 660 },
    { at: 1.8, x: 210, y: 428 },
    { at: 2.4, x: 210, y: 428, press: true },
    { at: 5.4, x: 210, y: 484 },
    { at: 6.0, x: 210, y: 484, press: true },
    { at: 10, x: 210, y: 484 },
  ];
  return (
    <Stage t={t} path={path} context="Delivery access">
      <Card eyebrow="Delivery access" title="Entry photo">
        <In t={t} at={0.1}>
          <Photo name="entry" height={200} style={{objectPosition:"center bottom"}} />
        </In>
        <In t={t} at={0.6}>
          <Caption>4 steps are visible — count them for the note.</Caption>
        </In>
        <In t={t} at={0.9}>
          <div
            style={{
              border: "1px dashed #c9cdc4",
              borderRadius: 9,
              padding: "12px 14px",
              fontSize: 13,
              color: noteTyped ? "#242827" : "#9aa19c",
              minHeight: 18,
            }}
          >
            {noteTyped
              ? noteFull
                ? "4 steps \u00b7 narrow landing"
                : "4 steps"
              : "Add a delivery note"}
          </div>
        </In>
        <In t={t} at={1.2}>
          <div className="row-actions">
            <Button secondary>Attach to delivery instructions</Button>
          </div>
        </In>
        <In t={t} at={6.0}>
          <div style={{ marginTop: 14 }}>
            <Chip approved={attached}>Attached to delivery instructions</Chip>
          </div>
        </In>
        <In t={t} at={6.0}>
          <div className="source-note">
            Source: entry photo — added manually by Maya.
          </div>
        </In>
      </Card>
    </Stage>
  );
}

export function InstallerPack({ t }: { t: number }) {
  const selected = t >= 2.1;
  const expanded = t >= 3.8;
  const shared = t >= 6.6;
  const expandAt = 3.8;
  const path: Point[] = [
    { at: 0, x: 340, y: 660 },
    { at: 1.5, x: 210, y: 398 },
    { at: 2.1, x: 210, y: 398, press: true },
    { at: 2.6, x: 250, y: 450 },
    { at: 3.2, x: 210, y: 398 },
    { at: 3.8, x: 210, y: 398, press: true },
    { at: 4.4, x: 340, y: 600 },
    { at: 5.6, x: 210, y: 347 },
    { at: 6.2, x: 210, y: 347, press: true },
    { at: 10, x: 210, y: 347 },
  ];
  return (
    <Stage t={t} path={path} context="Installer pack">
      {!expanded ? (
        <Card eyebrow="Installer pack" title="Confirmed specs">
          <In t={t} at={0}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className={`choice${selected ? " selected" : ""}`}>
                Tile — 8 boxes{selected ? " · confirmed" : ""}
              </div>
              <div className={`choice${selected ? " selected" : ""}`}>
                Vanity{selected ? " · confirmed" : ""}
              </div>
              <div className={`choice${selected ? " selected" : ""}`}>
                Pendant substitute{selected ? " · confirmed" : ""}
              </div>
              <div className="choice" style={{ opacity: 0.5 }}>
                Mirror — not confirmed yet
              </div>
            </div>
          </In>
          <In t={t} at={0.8}>
            <div className="row-actions">
              <Button secondary>
                {selected ? "Preview installer pack" : "Select confirmed specs"}
              </Button>
            </div>
          </In>
        </Card>
      ) : (
        <div className="document">
          <In t={t} at={expandAt + 0}>
            <h3>Installer pack.pdf</h3>
          </In>
          <In t={t} at={expandAt + 0.3}>
            <Row label="Tile" value="8 boxes" />
          </In>
          <In t={t} at={expandAt + 0.6}>
            <Row label="Vanity" value="1" />
          </In>
          <In t={t} at={expandAt + 0.9}>
            <Row label="Pendant substitute" value="1" />
          </In>
          <In t={t} at={expandAt + 1.3}>
            <Row
              label="Mirror width"
              value={<span style={{ color: "#c46840" }}>Unresolved</span>}
            />
          </In>
          <In t={t} at={expandAt + 1.8}>
            <div className="row-actions">
              <Button secondary>Share with installer</Button>
            </div>
          </In>
          <In t={t} at={6.6}>
            <Caption warning>
              {shared
                ? "Draft prepared — review before sending. Not sent yet."
                : ""}
            </Caption>
          </In>
        </div>
      )}
    </Stage>
  );
}

export function Receipt({ t }: { t: number }) {
  const attached = t >= 2.2;
  const checked = t >= 7.0;
  const path: Point[] = [
    { at: 0, x: 340, y: 660 },
    { at: 1.6, x: 210, y: 359 },
    { at: 2.2, x: 210, y: 359, press: true },
    { at: 6.4, x: 210, y: 512 },
    { at: 7.0, x: 210, y: 512, press: true },
    { at: 12, x: 210, y: 512 },
  ];
  return (
    <Stage t={t} path={path} context="Order receipt">
      <Card eyebrow="Receipt · Pendant substitute" title="Order evidence">
        <In t={t} at={0.1}>
          <Photo name="pendant" height={90} />
        </In>
        <In t={t} at={0.6}>
          <div style={{ marginTop: 10 }}>
            <div className="small-label">Amount</div>
            <div className="big-number">$412</div>
          </div>
        </In>
        <In t={t} at={1.0}>
          <div className="row-actions">
            <Button secondary approved={attached}>
              {attached ? "Receipt attached" : "Attach receipt"}
            </Button>
          </div>
        </In>
        <div className="divider" />
        <In t={t} at={1.4}>
          <div className="section-label">Return eligibility</div>
        </In>
        <In t={t} at={1.6}>
          <Row
            label="Status"
            value={
              <span>
                <span
                  className="status-dot"
                  style={{ background: checked ? "#c46840" : "#818d81" }}
                />
                {checked
                  ? "Pending — supplier confirmation needed"
                  : "Not checked"}
              </span>
            }
          />
        </In>
        <In t={t} at={1.8}>
          <div className="row-actions">
            <Button secondary>
              {checked ? "Waiting on supplier" : "Check eligibility"}
            </Button>
          </div>
        </In>
        <In t={t} at={7.3}>
          <Caption warning>
            No refund is issued automatically — waiting on the supplier to
            confirm.
          </Caption>
        </In>
      </Card>
    </Stage>
  );
}
