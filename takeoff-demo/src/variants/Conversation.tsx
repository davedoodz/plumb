import type {ReactNode} from 'react';
import {Frame, Media, Action, Facts, Reveal, settle, clamp, move} from './shared';
import type {SceneProps, Point, Concept} from './shared';
import './Conversation.css';

// Editorial conversation thread. A single white thread sits centered in a pale
// blue-gray field. Every concept answers with a short Georgia headline, a plain
// system-font reply, then either a citation strip or an inline control that
// expands a pale evidence receipt connected by a thin blue rail. Two gestures
// drive every clip: an evidence/control interaction near t=3s, then a single
// resolve action near t=7s, held calm from t=10s.

const SURFACE = {left: 240, top: 70, width: 600, bottom: 1010};
const CARD_H = SURFACE.bottom - SURFACE.top;
const ACTION_PT = {x: 540, y: 950};
const STRIP_PT = {x: 771, y: 349};
const START = {x: 660, y: 170};

// ---------- small marks (no emoji, vector only) ----------
function CheckMark({size = 14, color = '#206247'}: {size?: number; color?: string}) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{flex: '0 0 auto'}}>
      <path d="M3 8.3L6.4 11.7L13 4.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CollapseIcon({open}: {open: number}) {
  return (
    <svg width={14} height={14} viewBox="0 0 16 16" fill="none" style={{transform: `rotate(${open * 180}deg)`}}>
      <path d="M4 6L8 10L12 6" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------- shell: question / heading / reply, shared by all 14 ----------
function Shell({concept, t, heading, lede, children}: {concept: Concept; t: number; heading: string; lede: string; children: ReactNode}) {
  return (
    <div className="v-surface v-thread" data-review-region="thread" style={{left: SURFACE.left, top: SURFACE.top, width: SURFACE.width, height: CARD_H}}>
      <div className="v-inner">
        <Reveal t={t} at={0.08} className="v-question">
          <span className="v-role">You</span>
          <p>{concept.question}</p>
        </Reveal>
        <Reveal t={t} at={0.42} className="v-lede">
          <span className="v-role v-role-assist">Takeoff</span>
          <h2>{heading}</h2>
          <p className="v-lede-body">{lede}</p>
        </Reveal>
        <div className="v-main" data-review-region="main">{children}</div>
      </div>
    </div>
  );
}

// ---------- resolve action, fixed bottom of every card ----------
function Resolve({t, at = 7.05, label, confirmed}: {t: number; at?: number; label: string; confirmed: string}) {
  const active = t >= at;
  return (
    <div className="v-actionbar">
      <Action target="resolve" active={active}>
        {active ? (
          <span className="v-resolved"><CheckMark color="#206247" />{confirmed}</span>
        ) : label}
      </Action>
    </div>
  );
}

// ---------- citation rail + evidence receipt (signature element) ----------
function Evidence({t, at, title, source, children}: {t: number; at: number; title?: string; source: string; children?: ReactNode}) {
  const open = Math.max(0, Math.min(1, settle(t, at, 0.5)));
  const fade = clamp(t, at, at + 0.3);
  return (
    <div className="v-evidence" data-review-region="evidence" style={{opacity: fade}}>
      <div className="v-evidence-rail">
        <span className="v-evidence-dot" />
        <span className="v-evidence-line" style={{transform: `scaleY(${open})`}} />
      </div>
      <div className="v-evidence-panel" style={{transform: `translateY(${(1 - open) * 8}px)`}}>
        {title && <div className="v-evidence-title">{title}</div>}
        <div className="v-evidence-source">{source}</div>
        {children}
      </div>
    </div>
  );
}

// ---------- collapsed citation -> expand (used by 4 concepts) ----------
function SourceStrip({t, at = 0.6, expandAt = 3.35, thumb, label, meta, targetId = 'expand', children}: {
  t: number; at?: number; expandAt?: number; thumb: ReactNode; label: string; meta: string; targetId?: string; children: ReactNode;
}) {
  const open = Math.max(0, Math.min(1, settle(t, expandAt, 0.5)));
  return (
    <div className="v-strip" data-review-region="citation">
      <Reveal t={t} at={at}>
        <div className="v-strip-bar">
          <div className="v-strip-thumb">{thumb}</div>
          <div className="v-strip-text">
            <span className="v-strip-label">{label}</span>
            <span className="v-strip-meta">{meta}</span>
          </div>
          <div className="v-strip-chevron" data-target={targetId} style={{transform: `rotate(${open * 90}deg)`}}>&rsaquo;</div>
        </div>
      </Reveal>
      <div className="v-strip-expand" style={{maxHeight: open * 460, opacity: open}}>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// 1. capture — expand the site photo, then attach it to the Spec
// ============================================================
function Capture({concept, t}: SceneProps) {
  const linked = t >= 7.05;
  return (
    <Shell concept={concept} t={t} heading={concept.title} lede="The source photo stays attached to the Spec — no dimensions are inferred from it.">
      <SourceStrip t={t} thumb={<Media asset="room" width={60} height={52} />} label="Site photograph" meta={concept.source} targetId="expand-photo">
        <div className="v-photo" data-review-region="photo">
          <Media asset="room" width="100%" height={230} />
        </div>
        <div className="v-caption"><span>{concept.source}</span><span>Reference photo — no dimensions inferred</span></div>
        <div className={`v-spec-row${linked ? ' is-linked' : ''}`}>
          <div className="v-spec-clip">{linked ? <CheckMark /> : '+'}</div>
          <div>
            <div className="v-spec-name">{concept.rows[0].value}</div>
            <div className="v-spec-kind">{concept.rows[1].value} Spec{linked ? ' · photo attached' : ''}</div>
          </div>
        </div>
      </SourceStrip>
      <Resolve t={t} label={concept.action} confirmed={concept.result} />
    </Shell>
  );
}

// ============================================================
// 2. prompt — choose the next useful question among decoys
// ============================================================
function Prompt({concept, t}: SceneProps) {
  const picked = t >= 3.0;
  const options = [
    {label: 'Check delivery access', primary: true},
    {label: 'Confirm tile spacing', primary: false},
    {label: 'Review lighting plan', primary: false},
  ];
  return (
    <Shell concept={concept} t={t} heading={concept.title} lede="Booking delivery depends on packed dimensions. Checking access clears that dependency — no supplier answer is invented yet.">
      <Reveal t={t} at={0.6}>
        <div className="v-chip-list" data-review-region="options">
          {options.map((o) => (
            <div
              key={o.label}
              className={`v-chip-row${o.primary ? ' is-primary' : ''}${o.primary && picked ? ' is-selected' : ''}`}
              style={!o.primary && picked ? {opacity: 0.45} : undefined}
              data-target={o.primary ? 'choose-task' : undefined}
            >
              <span className="v-chip-dot" />{o.label}
            </div>
          ))}
        </div>
      </Reveal>
      <Evidence t={t} at={3.4} title="Why this is blocking" source={concept.source}>
        <Media asset="entry" width="100%" height={150} style={{borderRadius: 12, marginBottom: 12, objectPosition: '50% 66%'}} />
        <Facts rows={concept.rows} />
      </Evidence>
      <Resolve t={t} label={concept.action} confirmed={concept.result} />
    </Shell>
  );
}

// ============================================================
// 3. recall — open the cited material decision
// ============================================================
function Recall({concept, t}: SceneProps) {
  return (
    <Shell concept={concept} t={t} heading={concept.title} lede="Sam approved the blue-green gloss after seeing it in window light on Sep 12 — here's that decision, not a full replay.">
      <SourceStrip t={t} thumb={<Media asset="sample" width={60} height={52} />} label="Blue-green gloss" meta={concept.source} targetId="expand-decision">
        <div className="v-photo" data-review-region="photo">
          <Media asset="sample" width="100%" height={190} />
        </div>
        <Facts rows={concept.rows} style={{marginTop: 14}} />
      </SourceStrip>
      <Resolve t={t} label={concept.action} confirmed={concept.result} />
    </Shell>
  );
}

// ============================================================
// 4. walkthrough — collapse the playing video into a citation
// ============================================================
function Walkthrough({concept, t}: SceneProps) {
  const open = Math.max(0, Math.min(1, settle(t, 3.0, 0.5)));
  const h = 258 * (1 - open) + 74 * open;
  return (
    <Shell concept={concept} t={t} heading={concept.title} lede="This walkthrough locates the vanity wall for Dev. It doesn't replace a measurement — he'll still need to check on site.">
      <Reveal t={t} at={0.6}>
        <div style={{position: 'relative'}} data-review-region="video">
          <div className="v-photo" style={{height: h}}>
            <Media asset="room" video="room" t={t} width="100%" height={h} />
          </div>
          <div className="v-icon-btn" data-target="collapse-video" style={{width: 36, height: 36, right: 10, top: 10}}>
            <CollapseIcon open={open} />
          </div>
          <div className="v-caption" style={{opacity: 1 - open}}><span>{concept.source}</span><span>Playing · site reference</span></div>
        </div>
      </Reveal>
      <Evidence t={t} at={3.35} title="Question for Dev" source="Maya · site walkthrough · Sep 12">
        <Facts rows={concept.rows} />
      </Evidence>
      <Resolve t={t} label={concept.action} confirmed={concept.result} />
    </Shell>
  );
}

// ============================================================
// 5. quantity — toggle layout, watch the cost diff
// ============================================================
function Quantity({concept, t}: SceneProps) {
  const grow = Math.max(0, Math.min(1, settle(t, 3.0, 0.5)));
  const chosen = t >= 3.0;
  const boxes = 7 + Math.round(grow);
  const price = 1397 + 199 * Math.round(grow);
  return (
    <Shell concept={concept} t={t} heading={concept.title} lede="Herringbone adds a separate +1 box layout allowance on top of waste rounding — that's the extra box.">
      <Reveal t={t} at={0.6}>
        <div data-review-region="toggle">
          <div className="v-toggle-row">
            <div className={`v-toggle${!chosen ? ' is-chosen' : ''}`}>Straight</div>
            <div className={`v-toggle${chosen ? ' is-chosen' : ''}`} data-target="choose-herringbone">Herringbone</div>
          </div>
          <div className="v-sum">
            <div className="v-sum-value">{chosen && <del>7 · $1,397</del>}{boxes} boxes · ${price.toLocaleString()}</div>
          </div>
          {chosen && <div className="v-delta"><CheckMark size={12} />+1 box · +$199 layout allowance</div>}
        </div>
      </Reveal>
      <Evidence t={t} at={3.5} title="Order arithmetic" source={concept.source}>
        <Facts rows={concept.rows} />
      </Evidence>
      <Resolve t={t} label={concept.action} confirmed={concept.result} />
    </Shell>
  );
}

// ============================================================
// 6. sample — compare the playing sample against the room, then approve
// ============================================================
function Sample({concept, t}: SceneProps) {
  const open = Math.max(0, Math.min(1, settle(t, 3.0, 0.5)));
  return (
    <Shell concept={concept} t={t} heading={concept.title} lede="This approves the finish in daylight — not slip rating or installation. Compare it against the room before deciding.">
      <Reveal t={t} at={0.6}>
        <div className="v-compare" data-review-region="compare" style={{position: 'relative', height: 214}}>
          <div className="v-compare-col" style={{position: 'absolute', left: 0, top: 0, width: 536 - 280 * open, height: 214}}>
            <Media asset="sample" video="sample" t={t} width="100%" height={214} />
            <span className="v-compare-tag">Sample video</span>
          </div>
          <div className="v-compare-col" style={{position: 'absolute', right: 0, top: 0, width: 256 * open, height: 214, opacity: open}}>
            <Media asset="room" width="100%" height={214} />
            <span className="v-compare-tag">Room, window light</span>
          </div>
          {open < 1 && (
            <div className="v-icon-btn" data-target="compare-room" style={{width: 158, height: 34, left: 10, bottom: 56, borderRadius: 17, fontSize: 13, padding: '0 12px', opacity: 1 - open * 0.6}}>
              Compare in room
            </div>
          )}
        </div>
      </Reveal>
      <Evidence t={t} at={3.5} title="Daylight check" source={concept.source}>
        <Facts rows={concept.rows} />
      </Evidence>
      <Resolve t={t} label={concept.action} confirmed={concept.result} />
    </Shell>
  );
}

// ============================================================
// 7. quote — drag-select Dev's words into structured fields
// ============================================================
function Quote({concept, t}: SceneProps) {
  const drag = move(t, 2.5, 0.8);
  const saved = t >= 7.05;
  return (
    <Shell concept={concept} t={t} heading={concept.title} lede="Dev's condition matters as much as the date. Select the line to save both together.">
      <Reveal t={t} at={0.6}>
        <div className="v-quote" data-review-region="transcript">
          <p>
            &ldquo;We can start the<br />
            <span style={{position: 'relative', display: 'inline-block'}} data-target="select-phrase">
              <span style={{position: 'absolute', left: 0, top: 2, bottom: 2, width: `${drag * 100}%`, background: '#cfe0ee', borderRadius: 5, zIndex: 0}} />
              <span style={{position: 'relative', zIndex: 1}}>week of October 12,</span>
            </span><br />
            once the vanity is on site.&rdquo;
          </p>
          <div className="v-caption"><span>{concept.source}</span><span>Call transcript</span></div>
        </div>
      </Reveal>
      <Evidence t={t} at={3.5} title="Save as structured fields" source={concept.source}>
        <div className="v-fields">
          <div className={`v-field${saved ? ' is-set' : ''}`}>
            <span className="v-field-label">Start window</span>
            <span className="v-field-value">{concept.rows[0].value}</span>
          </div>
          <div className={`v-field${saved ? ' is-set' : ''}`}>
            <span className="v-field-label">Condition</span>
            <span className="v-field-value">{concept.rows[1].value}</span>
          </div>
        </div>
      </Evidence>
      <Resolve t={t} label={concept.action} confirmed={concept.result} />
    </Shell>
  );
}

// ============================================================
// 8. clearance — tap the measured hotspot, leave the unmeasured cell empty
// ============================================================
function Clearance({concept, t}: SceneProps) {
  const open = Math.max(0, Math.min(1, settle(t, 3.0, 0.5)));
  return (
    <Shell concept={concept} t={t} heading={concept.title} lede="The photo locates Dev's note — it doesn't generate a measurement. Only the door opening has actually been measured.">
      <Reveal t={t} at={0.6}>
        <div style={{position: 'relative'}} data-review-region="photo">
          <div className="v-photo" style={{height: 296}}>
            <Media asset="entry" width="100%" height={296} style={{objectPosition: '50% 68%'}} />
          </div>
          <div className="v-hotspot" data-target="inspect-door" style={{left: '55%', top: '40%'}}>
            <div className="v-hotspot-ring" style={{transform: `scale(${1 + open * 0.7})`, opacity: 1 - open}} />
            <div className="v-hotspot-dot" />
          </div>
          <div className="v-caption"><span>{concept.source}</span><span>Door opening annotated</span></div>
        </div>
      </Reveal>
      <Evidence t={t} at={3.4} title="Measured note" source={concept.source}>
        <Facts rows={concept.rows} />
      </Evidence>
      <Resolve t={t} label={concept.action} confirmed={concept.result} />
    </Shell>
  );
}

// ============================================================
// 9. leadtime — scrub the arrival date across the plumber's visit
// ============================================================
function Leadtime({concept, t}: SceneProps) {
  const p = move(t, 2.5, 0.8);
  const pct = p * 84;
  const late = pct >= 42;
  const compared = t >= 7.05;
  return (
    <Shell concept={concept} t={t} heading={concept.title} lede="At an 8-week lead time, ordering today lands after the plumber's Oct 12 visit — a comparison, not a supplier guarantee.">
      <Reveal t={t} at={0.6}>
        <div className="v-track" data-review-region="track">
          <div className="v-track-line" />
          <div className="v-track-range" style={{width: `${pct}%`}} />
          <div className="v-track-pin is-fixed" style={{left: '42%'}}>
            <span className="v-track-tag">Plumber · Oct 12</span>
            <div className="v-dot" />
          </div>
          <div className={`v-track-pin${late ? ' is-late' : ''}`} style={{left: `${pct}%`}} data-target="drag-arrival">
            <div className="v-dot" />
            <span className="v-track-tag below">{late ? 'Arrives Nov 9' : 'If ordered today'}</span>
          </div>
        </div>
      </Reveal>
      <Evidence t={t} at={3.5} title="Schedule comparison" source={concept.source}>
        <Facts rows={concept.rows} />
        {compared && <div className="v-banner is-warning">{concept.result}</div>}
      </Evidence>
      <Resolve t={t} label={concept.action} confirmed={concept.result} />
    </Shell>
  );
}

// ============================================================
// 10. substitution — match the knowns, keep the unknown blank, ask
// ============================================================
function Substitution({concept, t}: SceneProps) {
  const matches = concept.rows.slice(0, 2);
  const tempRows = concept.rows.slice(2);
  const asked = t >= 7.05;
  return (
    <Shell concept={concept} t={t} heading={concept.title} lede="Drop and finish match. Colour temperature isn't listed — we'll ask, not assume it matches 2700K.">
      <Reveal t={t} at={0.6}>
        <div className="v-chip-list" data-review-region="matches">
          {matches.map((r) => (
            <div className="v-chip-row is-selected" key={r.label}><CheckMark size={13} />{r.label} · {r.value}</div>
          ))}
          <div className="v-chip-row is-primary" data-target="focus-colour-temp">
            <span className="v-chip-dot" />Colour temperature<span className="v-chip-tag">Not listed</span>
          </div>
        </div>
      </Reveal>
      <Evidence t={t} at={3.4} title="Target vs alternative" source={concept.source}>
        <Facts rows={tempRows} />
        {asked && <div className="v-ask-chip"><CheckMark size={12} color="#9a522b" />{concept.result}</div>}
      </Evidence>
      <Resolve t={t} label={concept.action} confirmed={concept.result} />
    </Shell>
  );
}

// ============================================================
// 11. signoff — Dev's fit, then a separate Sam budget approval
// ============================================================
function Signoff({concept, t}: SceneProps) {
  const open = t >= 3.35;
  const approved = t >= 7.05;
  return (
    <Shell concept={concept} t={t} heading={concept.title} lede="Dev confirms it fits on site. Sam separately approves the +$412 budget change — two responsibilities, not a checkout.">
      <SourceStrip
        t={t}
        thumb={<div style={{width: 60, height: 52, borderRadius: 10, background: '#17263a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 600}}>D</div>}
        label="Installation fit"
        meta="Dev · installer"
        targetId="expand-fit"
      >
        <div className="v-evidence-note">Installation fit confirmed on site, Sep 13.</div>
      </SourceStrip>
      <div className={`v-approval${open ? ' is-open' : ' is-locked'}${approved ? ' is-done' : ''}`} style={{marginTop: 16}}>
        <div className="v-avatar" style={{background: '#315d8b'}}>S</div>
        <div className="v-approval-text">
          <div className="v-approval-name">Sam</div>
          <div className="v-approval-role">Budget approval</div>
        </div>
        <div className="v-approval-value">{approved ? 'Approved' : concept.rows[1].value}</div>
        {approved && <CheckMark />}
      </div>
      <Resolve t={t} label={concept.action} confirmed={concept.result} />
    </Shell>
  );
}

// ============================================================
// 12. delivery — write the manual access note, attach it with the photo
// ============================================================
function Delivery({concept, t}: SceneProps) {
  const focused = t >= 3.0;
  const typed = Math.max(0, Math.min(1, clamp(t, 3.15, 4.3)));
  return (
    <Shell concept={concept} t={t} heading={concept.title} lede="Four steps, counted manually, with a narrow landing. This note and photo travel with the delivery instructions.">
      <Reveal t={t} at={0.6}>
        <div data-review-region="photo">
          <div className="v-photo"><Media asset="entry" width="100%" height={234} style={{objectPosition: '50% 66%'}} /></div>
          <div className="v-caption"><span>{concept.source}</span><span>Counted manually</span></div>
          <div className={`v-note-field${focused ? ' is-focused' : ''}`} style={{marginTop: 14}} data-target="write-note">
            {typed > 0 ? (
              <span className="v-note-text" style={{clipPath: `inset(0 ${100 - typed * 100}% 0 0)`}}>Four steps, narrow landing.</span>
            ) : (
              <span className="v-note-placeholder">Add an access note for delivery&hellip;</span>
            )}
          </div>
        </div>
      </Reveal>
      <Evidence t={t} at={4.5} title="Access note" source={concept.source}>
        <Facts rows={concept.rows} />
      </Evidence>
      <Resolve t={t} label={concept.action} confirmed={concept.result} />
    </Shell>
  );
}

// ============================================================
// 13. installerpack — select confirmed Specs, preview the flagged gap
// ============================================================
function Installerpack({concept, t}: SceneProps) {
  const row1 = t >= 3.0;
  const row2 = t >= 3.3;
  const drafted = t >= 7.05;
  const items = [
    {label: 'Tile', value: concept.rows[0].value, checkable: true, checked: row1},
    {label: 'Vanity', value: concept.rows[1].value, checkable: true, checked: row2},
    {label: 'Mirror width', value: concept.rows[2].value, checkable: false, checked: false},
  ];
  return (
    <Shell concept={concept} t={t} heading={concept.title} lede="The pack includes only confirmed Specs. Mirror width is still unresolved, so it stays flagged, not hidden.">
      <Reveal t={t} at={0.6}>
        <div className="v-chip-list" data-review-region="items">
          {items.map((it, i) => (
            <div className="v-pack-row" key={it.label} data-target={i === 0 ? 'select-tile' : i === 1 ? 'select-vanity' : undefined}>
              <div className={`v-pack-check${it.checked ? ' is-checked' : ''}${!it.checkable ? ' is-disabled' : ''}`}>
                {it.checked && <CheckMark color="#fff" size={13} />}
              </div>
              <span className="v-pack-label">{it.label}</span>
              <span className={`v-pack-value${!it.checkable ? ' is-warning' : ''}`}>{it.value}</span>
            </div>
          ))}
        </div>
      </Reveal>
      <Evidence t={t} at={3.6} title="Installer pack preview" source={concept.source}>
        <div style={{fontSize: 15, lineHeight: 1.65, color: '#3a4552'}}>
          {row1 && <div>Tile — {concept.rows[0].value}</div>}
          {row2 && <div>Vanity — {concept.rows[1].value}</div>}
          <div style={{color: '#9a522b', fontWeight: 600, marginTop: 6}}>Mirror width — {concept.rows[2].value} (called out, not hidden)</div>
        </div>
        {drafted && <div className="v-banner is-pending">{concept.result}</div>}
      </Evidence>
      <Resolve t={t} label={concept.action} confirmed={concept.result} />
    </Shell>
  );
}

// ============================================================
// 14. receipt — open the order receipt, prepare (not submit) a return question
// ============================================================
function ReceiptScene({concept, t}: SceneProps) {
  const prepared = t >= 7.05;
  return (
    <Shell concept={concept} t={t} heading={concept.title} lede="The receipt is attached as evidence. It doesn't establish return eligibility or trigger a refund by itself.">
      <SourceStrip t={t} thumb={<Media asset="pendant" width={60} height={52} />} label="Pendant order" meta={concept.source} targetId="expand-receipt">
        <Facts rows={concept.rows} />
        {prepared && <div className="v-banner is-pending">{concept.result}</div>}
      </SourceStrip>
      <Resolve t={t} label={concept.action} confirmed={concept.result} />
    </Shell>
  );
}

// ---------- registry ----------
const SCENES: Record<string, (p: SceneProps) => ReactNode> = {
  capture: Capture,
  prompt: Prompt,
  recall: Recall,
  walkthrough: Walkthrough,
  quantity: Quantity,
  sample: Sample,
  quote: Quote,
  clearance: Clearance,
  leadtime: Leadtime,
  substitution: Substitution,
  signoff: Signoff,
  delivery: Delivery,
  installerpack: Installerpack,
  receipt: ReceiptScene,
};

function clickPath(target: {x: number; y: number}): Point[] {
  return [
    {at: 0, x: START.x, y: START.y},
    {at: 2.35, x: target.x, y: target.y},
    {at: 3.0, x: target.x, y: target.y, press: true, hold: 0.35},
    {at: 3.55, x: target.x, y: target.y},
    {at: 6.25, x: ACTION_PT.x, y: ACTION_PT.y},
    {at: 7.0, x: ACTION_PT.x, y: ACTION_PT.y, press: true, hold: 0.4},
    {at: 7.55, x: ACTION_PT.x, y: ACTION_PT.y},
    {at: 12, x: ACTION_PT.x, y: ACTION_PT.y},
  ];
}
function dragPath(sx: number, sy: number, ex: number, ey: number): Point[] {
  return [
    {at: 0, x: START.x, y: START.y},
    {at: 2.3, x: sx, y: sy},
    {at: 2.5, x: sx, y: sy, press: true, hold: 0.85},
    {at: 3.3, x: ex, y: ey},
    {at: 3.55, x: ex, y: ey},
    {at: 6.25, x: ACTION_PT.x, y: ACTION_PT.y},
    {at: 7.0, x: ACTION_PT.x, y: ACTION_PT.y, press: true, hold: 0.4},
    {at: 7.55, x: ACTION_PT.x, y: ACTION_PT.y},
    {at: 12, x: ACTION_PT.x, y: ACTION_PT.y},
  ];
}

const PATHS: Record<string, Point[]> = {
  capture: clickPath(STRIP_PT),
  prompt: clickPath({x: 540, y: 335}),
  recall: clickPath(STRIP_PT),
  walkthrough: clickPath({x: 780, y: 337}),
  quantity: clickPath({x: 678, y: 335}),
  sample: clickPath({x: 361, y: 450}),
  quote: dragPath(295, 372, 443, 372),
  clearance: clickPath({x: 567, y: 439}),
  leadtime: dragPath(272, 409, 722, 409),
  substitution: clickPath({x: 540, y: 459}),
  signoff: clickPath(STRIP_PT),
  delivery: clickPath({x: 540, y: 615}),
  installerpack: [
    {at:0,...START},{at:2.4,x:285,y:335},{at:3,x:285,y:335,press:true,hold:.2},
    {at:3.3,x:285,y:397,press:true,hold:.2},{at:6.25,...ACTION_PT},
    {at:7,...ACTION_PT,press:true,hold:.4},{at:12,...ACTION_PT}
  ],
  receipt: clickPath(STRIP_PT),
};

export function Conversation({concept, t}: SceneProps) {
  const Scene = SCENES[concept.id];
  const path = PATHS[concept.id];
  return (
    <Frame direction="conversation" concept={concept} t={t} path={path}>
      <Scene concept={concept} t={t} />
    </Frame>
  );
}
