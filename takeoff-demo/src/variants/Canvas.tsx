import type {ReactNode} from 'react';
import {Frame, Media, Unknown, Action, settle, clamp, move} from './shared';
import type {SceneProps, Concept, Point} from './shared';
import './Canvas.css';

type Rect = {x: number; y: number; w: number; h: number};
type SceneOut = {path: Point[]; navIndex: number; question: string; action: string; result: string; active: boolean; target: string; surface: ReactNode};

const SURF = {x: 128, y: 78, w: 896, h: 784};
const BAR = {x: 128, y: 874, w: 896, h: 128};
const RAIL = {x: 56, y: 78, w: 56, h: 784};

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const rectAt = (from: Rect, to: Rect, p: number): Rect => ({x: lerp(from.x, to.x, p), y: lerp(from.y, to.y, p), w: lerp(from.w, to.w, p), h: lerp(from.h, to.h, p)});
const centerOf = (r: Rect) => ({x: r.x + r.w / 2, y: r.y + r.h / 2});
const toRoot = (p: {x: number; y: number}) => ({x: p.x + SURF.x, y: p.y + SURF.y});
const dragRect = (t: number, at: number, dur: number, from: Rect, to: Rect): Rect => rectAt(from, to, move(t, at, dur));
function dragPoints(at: number, dur: number, from: Rect, to: Rect, hold?: number): Point[] {
  const a = toRoot(centerOf(from)), b = toRoot(centerOf(to));
  return [{at, x: a.x, y: a.y, press: true, hold: hold ?? dur + 0.2}, {at: at + dur, x: b.x, y: b.y}];
}
function idlePoint(at: number, r: {x: number; y: number}): Point {
  const p = toRoot(r);
  return {at, x: p.x, y: p.y};
}
function clickPoint(at: number, r: {x: number; y: number}, hold = 0.3): Point {
  const p = toRoot(r);
  return {at, x: p.x, y: p.y, press: true, hold};
}
function rowVal(concept: Concept, label: string) {
  return concept.rows.find(r => r.label === label)?.value ?? '';
}
function isUnresolved(v: string) {
  return !v || v === 'Not confirmed';
}
function renderVal(v: string) {
  return isUnresolved(v) ? <Unknown label={v || 'Not confirmed'}/> : v;
}

function NodeCard({t, rect, enterAt = 0.15, tone, dashed, selected, title, tag, target, region, children}: {t: number; rect: Rect; enterAt?: number; tone?: 'spec' | 'muted' | 'warn'; dashed?: boolean; selected?: boolean; title?: string; tag?: string; target?: string; region?: string; children?: ReactNode}) {
  const p = settle(t, enterAt, 0.34);
  return (
    <div className={`canvas-node${tone ? ` tone-${tone}` : ''}${dashed ? ' is-dashed' : ''}${selected ? ' is-selected' : ''}`} data-target={target} data-review-region={region ?? target} style={{left: rect.x, top: rect.y, width: rect.w, height: rect.h, opacity: p, transform: `translateY(${(1 - p) * 14}px)`}}>
      {(title || tag) && <div className="canvas-node-head">{title && <div className="canvas-title">{title}</div>}{tag && <div className="canvas-tag v-mono">{tag}</div>}</div>}
      {children}
    </div>
  );
}
function Wire({a, b, p, open, dashed}: {a: {x: number; y: number}; b: {x: number; y: number}; p: number; open?: boolean; dashed?: boolean}) {
  if (p <= 0) return null;
  const q = Math.min(1, p);
  return <line x1={a.x} y1={a.y} x2={lerp(a.x, b.x, q)} y2={lerp(a.y, b.y, q)} stroke={open ? '#a4abd9' : '#465cce'} strokeWidth={2.5} strokeDasharray={dashed ? '7 7' : undefined} strokeLinecap="round"/>;
}
function Dot({x, y, p, open}: {x: number; y: number; p: number; open?: boolean}) {
  if (p <= 0) return null;
  return <circle cx={x} cy={y} r={6 * Math.min(1, p)} fill={open ? '#eef0fc' : '#465cce'} stroke={open ? '#a4abd9' : 'none'} strokeWidth={open ? 2.5 : 0}/>;
}
function EdgeLayer({children}: {children: ReactNode}) {
  return <svg width={SURF.w} height={SURF.h} style={{position: 'absolute', left: 0, top: 0}}>{children}</svg>;
}
function Toolbar({t, at, dur = 1.2, x, y}: {t: number; at: number; dur?: number; x: number; y: number}) {
  const inP = settle(t, at, 0.22);
  const outP = t < at + dur ? 1 : Math.max(0, 1 - settle(t, at + dur, 0.3));
  const p = Math.min(inP, outP);
  if (p <= 0.02) return null;
  return <div className="canvas-toolbar" style={{left: x, top: y, opacity: p, transform: `translate(-50%,-130%) scale(${0.85 + p * 0.15})`}}><span/><span/><span/></div>;
}
function NavRail({active}: {active: number}) {
  return (
    <div className="canvas-rail" data-review-region="canvas-rail" style={{left: RAIL.x, top: RAIL.y, width: RAIL.w, height: RAIL.h}}>
      {[0, 1, 2, 3].map(i => <div key={i} className={`canvas-rail-item${i === active ? ' is-active' : ''}`}/>)}
    </div>
  );
}
function Surface({children}: {children: ReactNode}) {
  return <div className="v-surface canvas-surface" data-review-region="canvas-workbench" style={{left: SURF.x, top: SURF.y, width: SURF.w, height: SURF.h}}>{children}</div>;
}
function AssistantBar({question, action, result, active, target}: {question: string; action: string; result: string; active: boolean; target: string}) {
  return (
    <div className="canvas-assistant" data-review-region="canvas-assistant" style={{left: BAR.x, top: BAR.y, width: BAR.w, height: BAR.h}}>
      <div className="canvas-assistant-q">
        <span className="canvas-tag v-mono">ASK</span>
        <p>{question}</p>
        {active && <div className="canvas-assistant-note">{result}</div>}
      </div>
      <Action target={target} active={active} style={{minWidth: 240, flexShrink: 0}}>{action}</Action>
    </div>
  );
}
function TileGrid({herringbone}: {herringbone: boolean}) {
  const tiles: ReactNode[] = [];
  const rows = 4, cols = 6, tw = 42, th = 20, gap = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offset = herringbone && r % 2 === 1 ? tw / 2 : 0;
      tiles.push(<div key={`${r}-${c}`} className="canvas-tile" style={{left: c * (tw + gap) + offset, top: r * (th + gap), width: tw, height: th, background: herringbone ? '#465cce55' : '#c7cdec'}}/>);
    }
  }
  return <div style={{position: 'relative', width: 300, height: 108, overflow: 'hidden'}}>{tiles}</div>;
}

function sceneCapture(concept: Concept, t: number): SceneOut {
  const photoFrom: Rect = {x: 40, y: 150, w: 330, h: 230};
  const photoTo: Rect = {x: 230, y: 80, w: 330, h: 230};
  const spec: Rect = {x: 610, y: 110, w: 250, h: 210};
  const at = 2.4, dur = 2.3, dropAt = at + dur;
  const rect = dragRect(t, at, dur, photoFrom, photoTo);
  const anchorA = {x: rect.x + rect.w, y: rect.y + rect.h / 2};
  const anchorB = {x: spec.x, y: spec.y + 64};
  const lineP = clamp(t, dropAt, dropAt + 0.35);
  const path = [idlePoint(0, centerOf(photoFrom)), ...dragPoints(at, dur, photoFrom, photoTo)];
  return {
    path, navIndex: 0, question: concept.question, action: concept.action, result: concept.result, active: t >= dropAt, target: 'capture-attach',
    surface: <>
      <NodeCard t={t} rect={rect} title="Site photograph" tag={concept.source} target="capture-photo">
        <div className="canvas-media-wrap"><Media asset={concept.asset} t={t} width="100%" height={rect.h - 64}/></div>
      </NodeCard>
      <NodeCard t={t} rect={spec} enterAt={0.35} tone="spec" title="Spec · Vanity" tag="TARGET" target="capture-spec">
        <div className="canvas-rows">
          <div className="canvas-row"><span>Room</span><strong>{rowVal(concept, 'Room')}</strong></div>
          <div className="canvas-row"><span>Reference</span><strong>{t >= dropAt ? rowVal(concept, 'Reference') : <Unknown label="Not attached"/>}</strong></div>
        </div>
      </NodeCard>
      <EdgeLayer>
        <Wire a={anchorA} b={anchorB} p={lineP}/>
        <Dot x={anchorB.x} y={anchorB.y} p={t >= dropAt ? settle(t, dropAt + 0.15, 0.3) : 0}/>
      </EdgeLayer>
      <Toolbar t={t} at={at - 0.15} dur={dur + 0.6} x={rect.x + rect.w / 2} y={rect.y}/>
    </>,
  };
}

function scenePrompt(concept: Concept, t: number): SceneOut {
  const task: Rect = {x: 60, y: 110, w: 300, h: 210};
  const photo: Rect = {x: 560, y: 90, w: 300, h: 230};
  const anchorA = {x: task.x + task.w, y: task.y + 105};
  const anchorB = {x: photo.x, y: photo.y + 80};
  const at = 2.5, dur = 2.0, dropAt = at + dur;
  const p = move(t, at, dur);
  const travel = {x: lerp(anchorA.x, anchorB.x, p), y: lerp(anchorA.y, anchorB.y, p)};
  const path = [idlePoint(0, anchorA), {at, x: toRoot(anchorA).x, y: toRoot(anchorA).y, press: true, hold: dur + 0.2}, {at: dropAt, x: toRoot(anchorB).x, y: toRoot(anchorB).y}];
  const noteRect: Rect = {x: 520, y: photo.y + photo.h + 20, w: 340, h: 140};
  return {
    path, navIndex: 1, question: concept.question, action: concept.action, result: concept.result, active: t >= dropAt, target: 'prompt-connect',
    surface: <>
      <NodeCard t={t} rect={task} title="Delivery task" tag="BLOCKED" target="prompt-task">
        <div className="canvas-row"><span>Next dependency</span><strong>{rowVal(concept, 'Next dependency')}</strong></div>
      </NodeCard>
      <NodeCard t={t} rect={photo} enterAt={0.3} title="Entry · access photo" tag={concept.source} target="prompt-evidence">
        <div className="canvas-media-wrap"><Media asset={concept.asset} t={t} width="100%" height={photo.h - 90}/></div>
        <div className="canvas-sub">{rowVal(concept, 'Entry')}</div>
      </NodeCard>
      <NodeCard t={t} rect={noteRect} enterAt={dropAt + 0.1} tone="muted" title="Packed dimensions" tag="EXPOSED" region="prompt-dependency-note">
        <div className="canvas-row"><span>Packed dimensions</span><strong>{renderVal(rowVal(concept, 'Packed dimensions'))}</strong></div>
      </NodeCard>
      <EdgeLayer>
        <Wire a={anchorA} b={anchorB} p={Math.min(p, 1)} dashed={t < dropAt}/>
        <Dot x={anchorB.x} y={anchorB.y} p={t >= dropAt ? settle(t, dropAt + 0.1, 0.3) : 0}/>
      </EdgeLayer>
      {t < dropAt && p > 0 && <div className="canvas-anchor" style={{left: travel.x, top: travel.y, width: 10, height: 10}}/>}
      <Toolbar t={t} at={at - 0.15} dur={dur + 0.6} x={anchorA.x} y={anchorA.y - 10}/>
    </>,
  };
}

function sceneRecall(concept: Concept, t: number): SceneOut {
  const tile: Rect = {x: 60, y: 170, w: 280, h: 280};
  const collapsed: Rect = {x: 750, y: 170, w: 130, h: 280};
  const expanded: Rect = {x: 500, y: 170, w: 300, h: 300};
  const clickAt = 2.6, clickHold = 0.3;
  const expandP = Math.min(1, settle(t, clickAt + 0.1, 0.4));
  const tab = rectAt(collapsed, expanded, expandP);
  const mid = {x: 545, y: tile.y + tile.h / 2};
  const path = [idlePoint(0, mid), clickPoint(clickAt, mid, clickHold)];
  return {
    path, navIndex: 1, question: concept.question, action: concept.action, result: concept.result, active: t >= clickAt, target: 'recall-follow',
    surface: <>
      <NodeCard t={t} rect={tile} title="Blue-green gloss tile" tag={concept.source} target="recall-tile">
        <div className="canvas-media-wrap"><Media asset={concept.asset} t={t} width="100%" height={tile.h - 114}/></div>
        <div className="canvas-row"><span>Finish</span><strong>{rowVal(concept, 'Finish')}</strong></div>
      </NodeCard>
      <EdgeLayer>
        <Wire a={{x: tile.x + tile.w, y: tile.y + tile.h / 2}} b={{x: tab.x, y: tab.y + tab.h / 2}} p={1} dashed={expandP < 0.5}/>
      </EdgeLayer>
      {expandP < 0.3 && <div className="canvas-anchor" data-target="recall-hotspot" style={{left: mid.x, top: mid.y}}/>}
      <NodeCard t={t} rect={tab} tone="spec" title={expandP > 0.5 ? 'Decision · approved' : 'Approval'} tag={expandP > 0.5 ? undefined : 'TAP TO OPEN'} target="recall-approval">
        {expandP > 0.4 && <div className="canvas-rows" style={{opacity: expandP}}>
          <div className="canvas-row"><span>Approved by</span><strong>{rowVal(concept, 'Approved by')}</strong></div>
          <div className="canvas-row"><span>Reason</span><strong>{rowVal(concept, 'Reason')}</strong></div>
        </div>}
      </NodeCard>
      <Toolbar t={t} at={clickAt - 0.4} dur={1.0} x={mid.x} y={mid.y - 20}/>
    </>,
  };
}

function sceneWalkthrough(concept: Concept, t: number): SceneOut {
  const vidFrom: Rect = {x: 50, y: 160, w: 320, h: 220};
  const vidTo: Rect = {x: 230, y: 90, w: 320, h: 220};
  const q: Rect = {x: 610, y: 120, w: 250, h: 210};
  const at = 2.3, dur = 2.3, dropAt = at + dur;
  const rect = dragRect(t, at, dur, vidFrom, vidTo);
  const anchorA = {x: rect.x + rect.w, y: rect.y + rect.h / 2};
  const anchorB = {x: q.x, y: q.y + 60};
  const lineP = clamp(t, dropAt, dropAt + 0.3);
  const pinP = t >= dropAt ? Math.min(1, settle(t, dropAt + 0.2, 0.3)) : 0;
  const path = [idlePoint(0, centerOf(vidFrom)), ...dragPoints(at, dur, vidFrom, vidTo)];
  return {
    path, navIndex: 0, question: concept.question, action: concept.action, result: concept.result, active: t >= dropAt, target: 'walkthrough-pin',
    surface: <>
      <NodeCard t={t} rect={rect} title="Site walkthrough" tag={concept.source} target="walkthrough-video">
        <div className="canvas-media-wrap"><Media asset={concept.asset} video={concept.video} t={t} width="100%" height={rect.h - 64}/></div>
      </NodeCard>
      {pinP > 0 && <div className="canvas-badge" style={{left: rect.x + rect.w - 78, top: rect.y + 10, opacity: pinP}}>PINNED</div>}
      <NodeCard t={t} rect={q} enterAt={0.3} tone="spec" title="Question for Dev" tag="INSTALLER" target="walkthrough-question">
        <div className="canvas-sub">{concept.question}</div>
        <div className="canvas-row"><span>Clearance</span><strong>{rowVal(concept, 'Clearance')}</strong></div>
      </NodeCard>
      <EdgeLayer>
        <Wire a={anchorA} b={anchorB} p={lineP}/>
        <Dot x={anchorB.x} y={anchorB.y} p={t >= dropAt ? settle(t, dropAt + 0.1, 0.3) : 0}/>
      </EdgeLayer>
      <Toolbar t={t} at={at - 0.15} dur={dur + 0.6} x={rect.x + rect.w / 2} y={rect.y}/>
    </>,
  };
}

function sceneQuantity(concept: Concept, t: number): SceneOut {
  const card: Rect = {x: 70, y: 130, w: 360, h: 290};
  const cost: Rect = {x: 470, y: 130, w: 360, h: 290};
  const swapAt = 3.0;
  const swapped = t >= swapAt;
  const swapAnchor = {x: card.x + card.w - 24, y: card.y + 26};
  const pulse = Math.min(1, settle(t, swapAt, 0.32));
  const path = [idlePoint(0, swapAnchor), {at: swapAt, x: toRoot(swapAnchor).x, y: toRoot(swapAnchor).y, press: true, hold: 0.3}];
  return {
    path, navIndex: 2, question: concept.question, action: concept.action, result: concept.result, active: swapped, target: 'quantity-swap',
    surface: <>
      <NodeCard t={t} rect={card} title={swapped ? 'Layout · Herringbone' : 'Layout · Straight'} tag="TAP TO SWAP" target="quantity-layout">
        <div style={{transform: `scale(${0.94 + pulse * 0.06})`}}><TileGrid herringbone={swapped}/></div>
        <div className="canvas-row"><span>Entered area</span><strong>{rowVal(concept, 'Entered area')}</strong></div>
      </NodeCard>
      <div className="canvas-anchor" data-target="quantity-swap-handle" style={{left: swapAnchor.x, top: swapAnchor.y}}/>
      <NodeCard t={t} rect={cost} enterAt={0.3} tone="spec" title="Order quantity" tag="RECEIPT" target="quantity-cost">
        <div className="canvas-rows">
          <div className={`canvas-row${!swapped ? ' is-active' : ''}`}><span>Straight +10%</span><strong>{rowVal(concept, 'Straight +10%')}</strong></div>
          <div className={`canvas-row${swapped ? ' is-active' : ''}`}><span>Herringbone +15%</span><strong>{rowVal(concept, 'Herringbone +15%')}</strong></div>
          <div className="canvas-row"><span>Coverage</span><strong>{rowVal(concept, 'Coverage')}</strong></div>
        </div>
        {swapped && <div className="canvas-sub" style={{opacity: settle(t, swapAt + 0.2, 0.3)}}>{concept.detail}</div>}
      </NodeCard>
      <Toolbar t={t} at={swapAt - 0.4} dur={1.0} x={swapAnchor.x} y={swapAnchor.y - 16}/>
    </>,
  };
}

function sceneSample(concept: Concept, t: number): SceneOut {
  const sampleFrom: Rect = {x: 180, y: 440, w: 300, h: 220};
  const sampleTo: Rect = {x: 210, y: 130, w: 300, h: 230};
  const room: Rect = {x: 520, y: 130, w: 300, h: 230};
  const decision: Rect = {x: 210, y: 400, w: 300, h: 220};
  const dragAt = 2.3, dragDur = 2.3, dropAt = dragAt + dragDur;
  const clickAt = 7.0;
  const rect = dragRect(t, dragAt, dragDur, sampleFrom, sampleTo);
  const approved = t >= clickAt;
  const path = [
    idlePoint(0, centerOf(sampleFrom)),
    ...dragPoints(dragAt, dragDur, sampleFrom, sampleTo),
    idlePoint(dropAt + 0.4, centerOf(sampleTo)),
    idlePoint(clickAt - 0.6, centerOf(decision)),
    clickPoint(clickAt, centerOf(decision), 0.3),
  ];
  return {
    path, navIndex: 0, question: concept.question, action: concept.action, result: concept.result, active: approved, target: 'sample-approve',
    surface: <>
      <NodeCard t={t} rect={rect} title="Sample · daylight" tag={concept.source} target="sample-video">
        <div className="canvas-media-wrap"><Media asset={concept.asset} video={concept.video} t={t} width="100%" height={rect.h - 64}/></div>
      </NodeCard>
      <NodeCard t={t} rect={room} enterAt={0.3} title="Bathroom · site photo" tag="ROOM" target="sample-room">
        <div className="canvas-media-wrap"><Media asset="room" t={t} width="100%" height={room.h - 64}/></div>
      </NodeCard>
      <EdgeLayer>
        <Wire a={{x: rect.x + rect.w, y: rect.y + rect.h / 2}} b={{x: room.x, y: room.y + room.h / 2}} p={t >= dropAt ? 1 : 0}/>
        <Wire a={{x: decision.x + decision.w / 2, y: decision.y}} b={{x: decision.x + decision.w / 2, y: room.y + room.h}} p={approved ? Math.min(1, settle(t, clickAt + 0.05, 0.3)) : 0}/>
      </EdgeLayer>
      <NodeCard t={t} rect={decision} enterAt={dropAt + 0.1} tone={approved ? 'spec' : 'muted'} dashed={!approved} title={approved ? 'Finish approved' : 'Approve finish'} tag="DECISION" target="sample-decision">
        <div className="canvas-row"><span>Material</span><strong>{rowVal(concept, 'Material')}</strong></div>
        <div className="canvas-row"><span>Light</span><strong>{rowVal(concept, 'Light')}</strong></div>
      </NodeCard>
      <Toolbar t={t} at={dragAt - 0.15} dur={dragDur + 0.6} x={rect.x + rect.w / 2} y={rect.y}/>
    </>,
  };
}

function sceneQuote(concept: Concept, t: number): SceneOut {
  const transcript: Rect = {x: 50, y: 110, w: 340, h: 300};
  const chipFrom: Rect = {x: 86, y: 330, w: 270, h: 84};
  const field: Rect = {x: 560, y: 150, w: 280, h: 230};
  const chipTo: Rect = {x: 582, y: 190, w: 236, h: 84};
  const at = 2.6, dur = 2.1, dropAt = at + dur;
  const rect = dragRect(t, at, dur, chipFrom, chipTo);
  const path = [idlePoint(0, centerOf(chipFrom)), ...dragPoints(at, dur, chipFrom, chipTo)];
  const lineP = clamp(t, dropAt, dropAt + 0.3);
  return {
    path, navIndex: 1, question: concept.question, action: concept.action, result: concept.result, active: t >= dropAt, target: 'quote-save',
    surface: <>
      <NodeCard t={t} rect={transcript} title="Call transcript" tag={concept.source} region="quote-transcript">
        <div className="canvas-transcript-line">Maya: What's realistic for the start date?</div>
        <div className="canvas-transcript-line">Dev: <strong>&ldquo;We can start the week of October 12,</strong></div>
        <div className="canvas-transcript-line" style={{opacity: t >= at ? 0.35 : 1}}><strong>once the vanity is on site.&rdquo;</strong></div>
      </NodeCard>
      {t < dropAt && <div className="canvas-chip" data-target="quote-chip" style={{position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h, display: 'flex', alignItems: 'center'}}>&ldquo;…week of Oct 12, once the vanity is on site.&rdquo;</div>}
      <NodeCard t={t} rect={field} enterAt={0.3} tone="spec" title="Start window" tag="FIELD" target="quote-field">
        <div className="canvas-row"><span>Start window</span><strong>{t >= dropAt ? rowVal(concept, 'Start window') : <Unknown/>}</strong></div>
        <div className="canvas-row"><span>Condition</span><strong>{t >= dropAt ? rowVal(concept, 'Condition') : <Unknown/>}</strong></div>
      </NodeCard>
      <EdgeLayer>
        <Wire a={{x: chipFrom.x + chipFrom.w / 2, y: chipFrom.y}} b={{x: field.x, y: field.y + 40}} p={lineP} dashed/>
      </EdgeLayer>
      {t >= dropAt && <div className="canvas-tag v-mono" style={{position: 'absolute', left: field.x, top: field.y + field.h + 10}}>SOURCE · {concept.source.toUpperCase()}</div>}
      <Toolbar t={t} at={at - 0.15} dur={dur + 0.6} x={rect.x + rect.w / 2} y={rect.y - 6}/>
    </>,
  };
}

function sceneClearance(concept: Concept, t: number): SceneOut {
  const entry: Rect = {x: 60, y: 110, w: 380, h: 300};
  const hotspot = {x: entry.x + 205, y: entry.y + 175};
  const note: Rect = {x: 470, y: 200, w: 330, h: 230};
  const clickAt = 2.6;
  const revealed = t >= clickAt;
  const path = [idlePoint(0, hotspot), clickPoint(clickAt, hotspot, 0.3)];
  const lineP = Math.min(1, clamp(t, clickAt + 0.05, clickAt + 0.35));
  return {
    path, navIndex: 0, question: concept.question, action: concept.action, result: concept.result, active: revealed, target: 'clearance-inspect',
    surface: <>
      <NodeCard t={t} rect={entry} title="Entry · door" tag={concept.source} target="clearance-photo">
        <div className="canvas-media-wrap"><Media asset={concept.asset} t={t} width="100%" height={entry.h - 64}/></div>
      </NodeCard>
      <div className="canvas-anchor" data-target="clearance-hotspot" style={{left: hotspot.x, top: hotspot.y, width: 20, height: 20, boxShadow: revealed ? '0 0 0 6px #465cce2a' : 'none'}}/>
      <EdgeLayer>
        <Wire a={hotspot} b={{x: note.x, y: note.y + 40}} p={lineP}/>
      </EdgeLayer>
      <NodeCard t={t} rect={note} enterAt={clickAt + 0.05} tone="spec" title="Measured note" tag="DEV · SITE" target="clearance-note">
        <div className="canvas-row"><span>Door opening</span><strong>{rowVal(concept, 'Door opening')}</strong></div>
        <div className="canvas-row"><span>Landing depth</span><strong>{renderVal(rowVal(concept, 'Landing depth'))}</strong></div>
      </NodeCard>
      <Toolbar t={t} at={clickAt - 0.5} dur={1.0} x={hotspot.x} y={hotspot.y - 24}/>
    </>,
  };
}

function sceneLeadtime(concept: Concept, t: number): SceneOut {
  const trackY = 420, orderX = 100, plumberX = 372, arrivalX = 644;
  const staging = {x: 300, y: 290};
  const target = {x: arrivalX, y: trackY};
  const at = 2.5, dur = 2.4, dropAt = at + dur;
  const p = move(t, at, dur);
  const arrival = {x: lerp(staging.x, target.x, p), y: lerp(staging.y, target.y, p)};
  const path = [idlePoint(0, staging), {at, x: toRoot(staging).x, y: toRoot(staging).y, press: true, hold: dur + 0.2}, {at: dropAt, x: toRoot(target).x, y: toRoot(target).y}];
  const bracketP = clamp(t, dropAt, dropAt + 0.4);
  return {
    path, navIndex: 2, question: concept.question, action: concept.action, result: concept.result, active: t >= dropAt, target: 'leadtime-compare',
    surface: <>
      <NodeCard t={t} rect={{x: 60, y: 80, w: 780, h: 230}} title="Pendant · schedule check" tag={concept.source} region="leadtime-summary">
        <div className="canvas-media-wrap" style={{maxWidth: 140}}><Media asset={concept.asset} t={t} width={140} height={70}/></div>
        <div className="canvas-rows">
          <div className="canvas-row"><span>If ordered</span><strong>{rowVal(concept, 'If ordered')}</strong></div>
          <div className="canvas-row"><span>Lead time</span><strong>{rowVal(concept, 'Lead time')}</strong></div>
        </div>
      </NodeCard>
      <div className="canvas-track" style={{left: 60, top: trackY, width:780}}/>
      <div className="canvas-flag" style={{left: orderX, top: trackY - 7}}><div className="canvas-flag-pin is-fixed"/><div className="canvas-flag-label">IF ORDERED · {rowVal(concept, 'If ordered')}</div></div>
      <div className="canvas-flag" data-target="leadtime-plumber" style={{left: plumberX, top: trackY - 7}}><div className="canvas-flag-pin is-fixed"/><div className="canvas-flag-label">PLUMBER · {rowVal(concept, 'Plumber booked')}</div></div>
      <div className="canvas-flag" data-target="leadtime-arrival" style={{left: arrival.x, top: arrival.y - 7}}>
        <div className="canvas-flag-pin"/>
        <div className="canvas-flag-label">{t >= dropAt ? `ARRIVAL · ${rowVal(concept, 'Estimated arrival')}` : 'ARRIVAL · ?'}</div>
      </div>
      <EdgeLayer>
        {bracketP > 0 && <line x1={plumberX} y1={trackY + 18} x2={plumberX + (arrival.x - plumberX) * bracketP} y2={trackY + 18} stroke="#9a522b" strokeWidth={3} strokeLinecap="round"/>}
      </EdgeLayer>
      {t >= dropAt && <div className="canvas-tag" style={{position: 'absolute', left: (plumberX + arrival.x) / 2 - 90, top: trackY + 32, width: 180, textAlign: 'center', color: '#9a522b', fontWeight: 700, opacity: settle(t, dropAt + 0.1, 0.3)}}>{concept.result}</div>}
      <Toolbar t={t} at={at - 0.15} dur={dur + 0.6} x={arrival.x} y={arrival.y - 70}/>
    </>,
  };
}

function sceneSubstitution(concept: Concept, t: number): SceneOut {
  const targetX = 70, altX = 580, colW = 260;
  const dropY = 140, finishY = 330, ctY = 520;
  const targetAnchor = {x: targetX + colW, y: ctY + 55};
  const dragStop = {x: altX - 100, y: ctY + 55};
  const at = 2.8, dur = 1.6, dropAt = at + dur;
  const p = move(t, at, dur);
  const tip = {x: lerp(targetAnchor.x, dragStop.x, p), y: lerp(targetAnchor.y, dragStop.y, p)};
  const path = [idlePoint(0, targetAnchor), {at, x: toRoot(targetAnchor).x, y: toRoot(targetAnchor).y, press: true, hold: dur + 0.2}, {at: dropAt, x: toRoot(dragStop).x, y: toRoot(dragStop).y}];
  return {
    path, navIndex: 2, question: concept.question, action: concept.action, result: concept.result, active: t >= dropAt, target: 'substitution-ask',
    surface: <>
      <NodeCard t={t} rect={{x: targetX, y: dropY, w: colW, h: 110}} enterAt={0.15} title="Drop" tag="SPEC" region="substitution-drop-target">
        <div className="canvas-sub">{rowVal(concept, 'Drop')}</div>
      </NodeCard>
      <NodeCard t={t} rect={{x: altX, y: dropY, w: colW, h: 110}} enterAt={0.25} title="Drop" tag="ALT MATCH" region="substitution-drop-alt">
        <div className="canvas-sub">{rowVal(concept, 'Drop')}</div>
      </NodeCard>
      <NodeCard t={t} rect={{x: targetX, y: finishY, w: colW, h: 110}} enterAt={0.15} title="Finish" tag="SPEC" region="substitution-finish-target">
        <div className="canvas-sub">{rowVal(concept, 'Finish')}</div>
      </NodeCard>
      <NodeCard t={t} rect={{x: altX, y: finishY, w: colW, h: 110}} enterAt={0.25} title="Finish" tag="ALT MATCH" region="substitution-finish-alt">
        <div className="canvas-sub">{rowVal(concept, 'Finish')}</div>
      </NodeCard>
      <NodeCard t={t} rect={{x: targetX, y: ctY, w: colW, h: 110}} enterAt={0.35} title="Target colour temp" tag="SPEC" target="substitution-target-ct">
        <div className="canvas-sub">{rowVal(concept, 'Target colour temp')}</div>
      </NodeCard>
      <NodeCard t={t} rect={{x: altX, y: ctY, w: colW, h: 110}} enterAt={0.35} tone="muted" dashed title="Alternative colour temp" tag="OPEN" target="substitution-alt-ct">
        <div className="canvas-sub"><Unknown label="No reply yet"/></div>
      </NodeCard>
      <EdgeLayer>
        <Wire a={{x: targetX + colW, y: dropY + 55}} b={{x: altX, y: dropY + 55}} p={clamp(t, 0.5, 0.8)}/>
        <Wire a={{x: targetX + colW, y: finishY + 55}} b={{x: altX, y: finishY + 55}} p={clamp(t, 0.85, 1.15)}/>
        <Wire a={targetAnchor} b={tip} p={t >= at ? 1 : 0} open/>
        <Dot x={tip.x} y={tip.y} p={t >= dropAt ? 1 : 0} open/>
        <Dot x={altX} y={ctY + 55} p={1} open/>
      </EdgeLayer>
      <Toolbar t={t} at={at - 0.15} dur={dur + 0.6} x={targetAnchor.x} y={targetAnchor.y - 20}/>
    </>,
  };
}

function sceneSignoff(concept: Concept, t: number): SceneOut {
  const change: Rect = {x: 330, y: 320, w: 260, h: 180};
  const dev: Rect = {x: 50, y: 110, w: 260, h: 160};
  const sam: Rect = {x: 610, y: 110, w: 260, h: 160};
  const devAnchor = {x: dev.x + dev.w - 40, y: dev.y + dev.h};
  const changeDevAnchor = {x: change.x + 50, y: change.y};
  const samAnchor = {x: sam.x + 40, y: sam.y + sam.h};
  const changeSamAnchor = {x: change.x + change.w - 50, y: change.y};
  const at = 2.6, dur = 1.8, dropAt = at + dur;
  const p = move(t, at, dur);
  const tip = {x: lerp(samAnchor.x, changeSamAnchor.x, p), y: lerp(samAnchor.y, changeSamAnchor.y, p)};
  const path = [idlePoint(0, samAnchor), {at, x: toRoot(samAnchor).x, y: toRoot(samAnchor).y, press: true, hold: dur + 0.2}, {at: dropAt, x: toRoot(changeSamAnchor).x, y: toRoot(changeSamAnchor).y}];
  return {
    path, navIndex: 3, question: concept.question, action: concept.action, result: concept.result, active: t >= dropAt, target: 'signoff-approve',
    surface: <>
      <NodeCard t={t} rect={dev} title="Installation fit" tag="DEV" region="signoff-dev">
        <div className="canvas-sub">Confirmed on site</div>
      </NodeCard>
      <NodeCard t={t} rect={sam} enterAt={0.2} tone={t >= dropAt ? 'spec' : 'muted'} dashed={t < dropAt} title="Budget approval" tag="SAM" target="signoff-sam">
        <div className="canvas-row"><span>Budget change</span><strong>{rowVal(concept, 'Budget change')}</strong></div>
      </NodeCard>
      <NodeCard t={t} rect={change} enterAt={0.35} tone="spec" title="Pendant · change" tag="+$412" target="signoff-change">
        <div className="canvas-media-wrap"><Media asset={concept.asset} t={t} width="100%" height={change.h - 70}/></div>
      </NodeCard>
      <EdgeLayer>
        <Wire a={devAnchor} b={changeDevAnchor} p={clamp(t, 0.6, 1.0)}/>
        <Dot x={changeDevAnchor.x} y={changeDevAnchor.y} p={clamp(t, 0.9, 1.2)}/>
        <Wire a={samAnchor} b={tip} p={t >= at ? 1 : 0}/>
        <Dot x={tip.x} y={tip.y} p={t >= dropAt ? Math.min(1, settle(t, dropAt + 0.1, 0.3)) : 0}/>
      </EdgeLayer>
      <Toolbar t={t} at={at - 0.15} dur={dur + 0.6} x={samAnchor.x} y={samAnchor.y + 16}/>
    </>,
  };
}

function sceneDelivery(concept: Concept, t: number): SceneOut {
  const entryFrom: Rect = {x: 50, y: 100, w: 300, h: 220};
  const noteFrom: Rect = {x: 80, y: 360, w: 260, h: 220};
  const task: Rect = {x: 560, y: 100, w: 290, h: 530};
  const photoSlot: Rect = {x: 580, y: 200, w: 250, h: 170};
  const noteSlot: Rect = {x: 580, y: 390, w: 250, h: 220};
  const d1At = 2.2, d1Dur = 1.8, d1Drop = d1At + d1Dur;
  const d2At = 4.5, d2Dur = 1.6, d2Drop = d2At + d2Dur;
  const photoRect = dragRect(t, d1At, d1Dur, entryFrom, photoSlot);
  const noteRect = dragRect(t, d2At, d2Dur, noteFrom, noteSlot);
  const path = [
    idlePoint(0, centerOf(entryFrom)),
    ...dragPoints(d1At, d1Dur, entryFrom, photoSlot),
    idlePoint(d1Drop + 0.15, centerOf(photoSlot)),
    idlePoint(d2At - 0.15, centerOf(noteFrom)),
    ...dragPoints(d2At, d2Dur, noteFrom, noteSlot),
  ];
  return {
    path, navIndex: 0, question: concept.question, action: concept.action, result: concept.result, active: t >= d2Drop, target: 'delivery-attach',
    surface: <>
      <NodeCard t={t} rect={task} tone={t >= d2Drop ? 'spec' : 'muted'} dashed={t < d2Drop} title="Delivery task" tag="TARGET" target="delivery-task"/>
      <NodeCard t={t} rect={photoRect} title="Entry · 4 steps" tag={concept.source} target="delivery-photo">
        <div className="canvas-media-wrap"><Media asset={concept.asset} t={t} width="100%" height={photoRect.h - 64}/></div>
      </NodeCard>
      <NodeCard t={t} rect={noteRect} enterAt={0.3} title="Access note" tag="MANUAL" target="delivery-note">
        <div className="canvas-row"><span>Steps</span><strong>{rowVal(concept, 'Steps')}</strong></div>
        <div className="canvas-row"><span>Landing</span><strong>{rowVal(concept, 'Landing')}</strong></div>
      </NodeCard>
      {t >= d2Drop && <div className="canvas-rows" data-review-region="delivery-packed" style={{position: 'absolute', left: task.x, top: task.y + task.h + 16, width: task.w, opacity: settle(t, d2Drop + 0.15, 0.3)}}>
        <div className="canvas-row"><span>Packed dimensions</span><strong>{renderVal(rowVal(concept, 'Packed dimensions'))}</strong></div>
      </div>}
      <Toolbar t={t} at={d1At - 0.15} dur={d1Dur + 0.6} x={photoRect.x + photoRect.w / 2} y={photoRect.y}/>
      <Toolbar t={t} at={d2At - 0.15} dur={d2Dur + 0.6} x={noteRect.x + noteRect.w / 2} y={noteRect.y}/>
    </>,
  };
}

function sceneInstallerpack(concept: Concept, t: number): SceneOut {
  const tile: Rect = {x: 80, y: 120, w: 220, h: 120};
  const vanity: Rect = {x: 340, y: 90, w: 220, h: 120};
  const mirror: Rect = {x: 140, y: 300, w: 240, h: 150};
  const pack: Rect = {x: 610, y: 110, w: 280, h: 440};
  const marqueeA = {x: 50, y: 70};
  const marqueeB = {x: 590, y: 250};
  const selAt = 2.2, selDur = 1.4, selDone = selAt + selDur;
  const groupFrom = {x: (tile.x + vanity.x) / 2 + 110, y: (tile.y + vanity.y) / 2 + 60};
  const groupTo = {x: pack.x + 140, y: pack.y + 250};
  const moveAt = 4.2, moveDur = 1.8, moveDone = moveAt + moveDur;
  const mp = move(t, moveAt, moveDur);
  const dxg = lerp(0, groupTo.x - groupFrom.x, mp);
  const dyg = lerp(0, groupTo.y - groupFrom.y, mp);
  const selected = t >= selDone;
  const marqueeP = move(t, selAt, selDur);
  const curMarquee = {x: lerp(marqueeA.x, marqueeB.x, marqueeP), y: lerp(marqueeA.y, marqueeB.y, marqueeP)};
  const mLeft = Math.min(marqueeA.x, curMarquee.x), mTop = Math.min(marqueeA.y, curMarquee.y);
  const mW = Math.abs(curMarquee.x - marqueeA.x), mH = Math.abs(curMarquee.y - marqueeA.y);
  const path = [
    idlePoint(0, marqueeA),
    {at: selAt, x: toRoot(marqueeA).x, y: toRoot(marqueeA).y, press: true, hold: selDur + 0.2},
    {at: selDone, x: toRoot(marqueeB).x, y: toRoot(marqueeB).y},
    idlePoint(moveAt - 0.5, groupFrom),
    {at: moveAt, x: toRoot(groupFrom).x, y: toRoot(groupFrom).y, press: true, hold: moveDur + 0.2},
    {at: moveDone, x: toRoot(groupTo).x, y: toRoot(groupTo).y},
  ];
  return {
    path, navIndex: 2, question: concept.question, action: concept.action, result: concept.result, active: t >= moveDone, target: 'installerpack-prepare',
    surface: <>
      <NodeCard t={t} rect={pack} tone={t >= moveDone ? 'spec' : 'muted'} dashed={t < moveDone} title="Installer pack" tag="DRAFT" target="installerpack-container">
        <div className="canvas-sub">Confirmed Specs only</div>
      </NodeCard>
      <div>
        <NodeCard t={t} rect={rectAt(tile,{x:pack.x+20,y:pack.y+120,w:240,h:120},mp)} selected={selected && t < moveDone} title="Tile" tag="CONFIRMED" target="installerpack-tile">
          <div className="canvas-sub">{rowVal(concept, 'Tile')}</div>
        </NodeCard>
        <NodeCard t={t} rect={rectAt(vanity,{x:pack.x+20,y:pack.y+260,w:240,h:120},mp)} enterAt={0.25} selected={selected && t < moveDone} title="Vanity" tag="CONFIRMED" target="installerpack-vanity">
          <div className="canvas-sub">{rowVal(concept, 'Vanity')}</div>
        </NodeCard>
      </div>
      <NodeCard t={t} rect={mirror} enterAt={0.35} tone="warn" dashed title="Mirror width" tag="UNRESOLVED" target="installerpack-mirror">
        <div className="canvas-sub">{renderVal(rowVal(concept, 'Mirror width'))} — not included</div>
      </NodeCard>
      {t >= selAt && t < selDone + 0.3 && mW > 4 && <div className="canvas-marquee" style={{left: mLeft, top: mTop, width: mW, height: mH}}/>}
      <Toolbar t={t} at={selAt - 0.15} dur={selDur + 0.6} x={curMarquee.x} y={curMarquee.y - 12}/>
      <Toolbar t={t} at={moveAt - 0.15} dur={moveDur + 0.6} x={groupFrom.x + dxg} y={groupFrom.y + dyg - 60}/>
    </>,
  };
}

function sceneReceipt(concept: Concept, t: number): SceneOut {
  const receipt: Rect = {x: 40, y: 140, w: 240, h: 260};
  const order: Rect = {x: 330, y: 140, w: 240, h: 260};
  const ret: Rect = {x: 620, y: 140, w: 240, h: 260};
  const anchorReceipt = {x: receipt.x + receipt.w, y: receipt.y + receipt.h / 2};
  const anchorOrderIn = {x: order.x, y: order.y + order.h / 2};
  const anchorOrderOut = {x: order.x + order.w, y: order.y + order.h / 2};
  const dragStop = {x: (order.x + order.w + ret.x) / 2, y: ret.y + ret.h / 2};
  const c1At = 2.4, c1Dur = 1.6, c1Done = c1At + c1Dur;
  const c2At = 4.6, c2Dur = 1.4, c2Done = c2At + c2Dur;
  const p2 = move(t, c2At, c2Dur);
  const tip = {x: lerp(anchorOrderOut.x, dragStop.x, p2), y: lerp(anchorOrderOut.y, dragStop.y, p2)};
  const path = [
    idlePoint(0, anchorReceipt),
    {at: c1At, x: toRoot(anchorReceipt).x, y: toRoot(anchorReceipt).y, press: true, hold: c1Dur + 0.2},
    {at: c1Done, x: toRoot(anchorOrderIn).x, y: toRoot(anchorOrderIn).y},
    idlePoint(c2At - 0.5, anchorOrderOut),
    {at: c2At, x: toRoot(anchorOrderOut).x, y: toRoot(anchorOrderOut).y, press: true, hold: c2Dur + 0.2},
    {at: c2Done, x: toRoot(dragStop).x, y: toRoot(dragStop).y},
  ];
  return {
    path, navIndex: 2, question: concept.question, action: concept.action, result: concept.result, active: t >= c2Done, target: 'receipt-check',
    surface: <>
      <NodeCard t={t} rect={receipt} title="Receipt" tag={concept.source} target="receipt-receipt">
        <div className="canvas-sub">{rowVal(concept, 'Receipt')}</div>
        <div className="canvas-row"><span>Evidence</span><strong>{rowVal(concept, 'Evidence')}</strong></div>
      </NodeCard>
      <NodeCard t={t} rect={order} enterAt={0.25} tone="spec" title="Order · pendant" tag="ORDER" target="receipt-order">
        <div className="canvas-media-wrap"><Media asset={concept.asset} t={t} width="100%" height={order.h - 90}/></div>
      </NodeCard>
      <NodeCard t={t} rect={ret} enterAt={0.35} tone="muted" dashed title="Return eligibility" tag="OPEN" target="receipt-return">
        <div className="canvas-sub">{renderVal(rowVal(concept, 'Return eligibility'))}</div>
      </NodeCard>
      <EdgeLayer>
        <Wire a={anchorReceipt} b={anchorOrderIn} p={t >= c1At ? Math.min(1, move(t, c1At, c1Dur)) : 0}/>
        <Dot x={anchorOrderIn.x} y={anchorOrderIn.y} p={t >= c1Done ? Math.min(1, settle(t, c1Done, 0.3)) : 0}/>
        <Wire a={anchorOrderOut} b={tip} p={t >= c2At ? 1 : 0} open/>
        <Dot x={tip.x} y={tip.y} p={t >= c2Done ? 1 : 0} open/>
      </EdgeLayer>
      <Toolbar t={t} at={c1At - 0.15} dur={c1Dur + 0.6} x={anchorReceipt.x} y={anchorReceipt.y - 20}/>
      <Toolbar t={t} at={c2At - 0.15} dur={c2Dur + 0.6} x={anchorOrderOut.x} y={anchorOrderOut.y - 20}/>
    </>,
  };
}

const SCENES: Record<string, (concept: Concept, t: number) => SceneOut> = {
  capture: sceneCapture,
  prompt: scenePrompt,
  recall: sceneRecall,
  walkthrough: sceneWalkthrough,
  quantity: sceneQuantity,
  sample: sceneSample,
  quote: sceneQuote,
  clearance: sceneClearance,
  leadtime: sceneLeadtime,
  substitution: sceneSubstitution,
  signoff: sceneSignoff,
  delivery: sceneDelivery,
  installerpack: sceneInstallerpack,
  receipt: sceneReceipt,
};

export function Canvas({concept, t}: SceneProps) {
  const build = SCENES[concept.id];
  const out = build(concept, t);
  return (
    <Frame direction="canvas" concept={concept} t={t} path={out.path}>
      <NavRail active={out.navIndex}/>
      <Surface>{out.surface}</Surface>
      <AssistantBar question={out.question} action={out.action} result={out.result} active={out.active} target={out.target}/>
    </Frame>
  );
}
