import type {CSSProperties, ReactNode} from 'react';
import {Frame, Reveal, Media, Unknown, Action, Facts, move, settle, clamp} from './shared';
import type {SceneProps, Point, Concept, Asset} from './shared';
import './Notebook.css';

const PAGE_X = 204, PAGE_Y = 96, PAGE_W = 672, PAGE_H = 824;
const PAGE_RIGHT = PAGE_X + PAGE_W, PAGE_BOTTOM = PAGE_Y + PAGE_H;
const PAD = 22, HEAD_H = 78;
const MEDIA_X = PAGE_X + PAD, MEDIA_Y = PAGE_Y + HEAD_H;
const MEDIA_W = PAGE_W - PAD * 2, MEDIA_H = PAGE_H - HEAD_H - PAD;
const MEDIA_BOTTOM = MEDIA_Y + MEDIA_H, MEDIA_CX = MEDIA_X + MEDIA_W / 2;

const TAB_ORDER: Asset[] = ['room', 'sample', 'entry', 'pendant'];
const TAB_LABEL: Record<Asset, string> = {room: 'ROOM', sample: 'SMPL', entry: 'ENTR', pendant: 'FIX'};
const TAB_LEFT = PAGE_RIGHT + 8, TAB_W = 44, TAB_H = 64;
const TAB_TOP = [359, 437, 515, 593];
const TAB_CY = TAB_TOP.map((y) => y + TAB_H / 2);

const SHEET_PEEK = 34;
const SHEET_CLOSED_TOP = PAGE_BOTTOM - SHEET_PEEK;
const sheetOpenTop = (frac: number) => MEDIA_Y + MEDIA_H * frac;
const sheetHandleY = (frac: number) => sheetOpenTop(frac) + 20;
const sheetButtonY = (frac: number, rows = 3) => sheetOpenTop(frac) + 99 + rows * 49;

function abs(x: number, y: number, w?: number, h?: number, extra?: CSSProperties): CSSProperties {
  return {position: 'absolute', left: x, top: y, ...(w !== undefined ? {width: w} : {}), ...(h !== undefined ? {height: h} : {}), ...extra};
}

function rowVal(concept: Concept, label: string) {
  return concept.rows.find((r) => r.label === label)?.value ?? '';
}

function pt(at: number, x: number, y: number, opts?: {press?: boolean; hold?: number}): Point {
  return {at, x, y, ...opts};
}

function Page() {
  return (
    <>
      <div className="nb-page-shadow nb-page-shadow--far" style={abs(PAGE_X + 14, PAGE_Y + 18, PAGE_W, PAGE_H)} />
      <div className="nb-page-shadow nb-page-shadow--near" style={abs(PAGE_X + 7, PAGE_Y + 9, PAGE_W, PAGE_H)} />
      <div className="nb-page v-surface" data-review-region="page" style={abs(PAGE_X, PAGE_Y, PAGE_W, PAGE_H)} />
    </>
  );
}

function Header({title, meta}: {title: string; meta: string}) {
  return (
    <>
      <div className="nb-title" style={abs(MEDIA_X, PAGE_Y + 16, MEDIA_W)}>{title}</div>
      <div className="nb-meta" style={abs(MEDIA_X, PAGE_Y + 50, MEDIA_W)}>{meta}</div>
      <div className="nb-rule" style={abs(MEDIA_X, PAGE_Y + HEAD_H - 8, MEDIA_W)} />
    </>
  );
}

function TabRail({lit, target, glideY}: {lit?: Asset; target?: string; glideY?: number}) {
  return (
    <div data-review-region="tabs">
      {TAB_ORDER.map((a, i) => {
        const active = lit === a;
        return (
          <div
            key={a}
            className={`nb-tab${active ? ' is-active' : ''}`}
            data-target={active ? target : undefined}
            style={abs(active ? TAB_LEFT - 10 : TAB_LEFT, TAB_TOP[i], active ? TAB_W + 14 : TAB_W, TAB_H)}
          >
            <span>{TAB_LABEL[a]}</span>
          </div>
        );
      })}
      {glideY !== undefined && <div className="nb-tab-glide" style={abs(TAB_LEFT - 17, glideY - 7)} />}
    </div>
  );
}

function Sheet({t, at, dur = 1.7, openFrac = 0.4, label, target, children}: {t: number; at: number; dur?: number; openFrac?: number; label?: string; target?: string; children: ReactNode}) {
  const p = move(t, at, dur);
  const top = SHEET_CLOSED_TOP + (sheetOpenTop(openFrac) - SHEET_CLOSED_TOP) * p;
  const height = PAGE_BOTTOM - top;
  return (
    <div className="nb-sheet" data-review-region="sheet" data-target={target} style={abs(PAGE_X, top, PAGE_W, height)}>
      <div className="nb-handle" />
      {label && <div className="nb-sheet-label">{label}</div>}
      <div className="nb-sheet-body">{children}</div>
    </div>
  );
}

function Tag({x, y, t, at, rot = -2, children}: {x: number; y: number; t: number; at: number; rot?: number; children: ReactNode}) {
  const p = settle(t, at, 0.3);
  return (
    <div className="nb-tag" style={abs(x, y, undefined, undefined, {opacity: p, transform: `translate(-10px,-100%) rotate(${rot}deg) translateY(${(1 - p) * 12}px)`})}>
      {children}
    </div>
  );
}

function FlipCard({x, y, w, h, t, at, dur = 2, front, back}: {x: number; y: number; w: number; h: number; t: number; at: number; dur?: number; front: ReactNode; back: ReactNode}) {
  const p = move(t, at, dur);
  const angle = p * 180;
  const face: CSSProperties = {position: 'absolute', left: x, top: y, width: w, height: h, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden'};
  return (
    <div style={abs(0, 0, 0, 0, {transformStyle: 'preserve-3d'})}>
      <div className="nb-flip-face" data-review-region="card" style={{...face, transform: `rotateY(${angle}deg)`}}>{front}</div>
      <div className="nb-flip-face" style={{...face, transform: `rotateY(${angle - 180}deg)`}}>{back}</div>
    </div>
  );
}

function Result({concept, t, at}: {concept: Concept; t: number; at: number}) {
  const p = settle(t, at, 0.32);
  return (
    <div style={abs(MEDIA_X, MEDIA_BOTTOM - 4, MEDIA_W, undefined, {transform: `translateY(${-4 - (1 - p) * 10}px)`, opacity: p})}>
      <div className="nb-result">{concept.result}</div>
    </div>
  );
}

function Ledger({rows, pickedLabel}: {rows: Concept['rows']; pickedLabel?: string}) {
  return (
    <div className="nb-ledger">
      {rows.map((r) => (
        <div key={r.label} className={`variant-fact${r.label === pickedLabel ? ' is-picked' : ''}`}>
          <span>{r.label}</span>
          <strong>{r.value || <Unknown />}</strong>
        </div>
      ))}
    </div>
  );
}

// ---- 0 capture: lift the site-photo page to reveal a Spec tab, then pin the photo to it ----
function sceneCapture(concept: Concept, t: number) {
  const liftAt = 2.2, liftDur = 1.4;
  const lift = move(t, liftAt, liftDur);
  const pinAt = 4.4;
  const pinned = settle(t, pinAt, 0.3);
  const path: Point[] = [
    pt(0, 620, 460),
    pt(1.0, 800, 150),
    pt(liftAt, 856, 118, {press: true, hold: liftDur + 0.6}),
    pt(liftAt + liftDur, 792, 232),
    pt(pinAt, 800, 236, {press: true, hold: 0.4}),
  ];
  const body = (
    <>
      <div className="nb-tag" data-review-region="card" style={abs(796, 176, 168, undefined, {opacity: 0.55 + lift * 0.45, transform: `translateY(${(1 - lift) * 10}px)`, borderStyle: 'dashed'})}>
        <strong>SPEC · VANITY</strong>
        Pin the site photo here
      </div>
      <Header title={concept.title} meta={concept.source} />
      <div
        style={abs(MEDIA_X, MEDIA_Y, MEDIA_W, MEDIA_H, {
          transformOrigin: '86% 4%',
          transform: `rotate(${-lift * 3.4}deg) translate(${lift * 30}px, ${-lift * 14 + pinned * 6}px) scale(${1 - pinned * 0.03})`,
          boxShadow: lift > 0.05 ? '0 26px 40px rgba(40,28,16,.3)' : 'none',
          borderRadius: 8,
        })}
      >
        <Media asset={concept.asset} t={t} width={MEDIA_W} height={MEDIA_H} style={{borderRadius: 8}} />
      </div>
      <TabRail lit={concept.asset} />
      {pinned > 0.05 && (
        <div className="nb-flag" style={abs(796, 236, 176, undefined, {opacity: pinned, transform: `translateY(${(1 - pinned) * 8}px)`})}>
          pinned ✓ {rowVal(concept, 'Spec')}
        </div>
      )}
      <Reveal t={t} at={pinAt + 0.4} style={abs(MEDIA_X, MEDIA_BOTTOM + 4, MEDIA_W)}>
        <div className="nb-result">{concept.result}</div>
        <div className="nb-detail" style={{marginTop: 4}}>{concept.detail}</div>
      </Reveal>
    </>
  );
  return {path, body};
}

// ---- 1 prompt: swipe to the entry page and pull up its unresolved delivery question ----
function scenePrompt(concept: Concept, t: number) {
  const dragAt = 2.0, dragDur = 2.0;
  const p = move(t, dragAt, dragDur);
  const sheetAt = 4.6;
  const tapAt = 7.0;
  const path: Point[] = [
    pt(0, 540, 470),
    pt(1.2, TAB_LEFT + 20, TAB_CY[0]),
    pt(dragAt, TAB_LEFT + 20, TAB_CY[0], {press: true, hold: dragDur + 0.2}),
    pt(dragAt + dragDur, TAB_LEFT + 20, TAB_CY[2]),
    pt(4.15, MEDIA_CX, SHEET_CLOSED_TOP + 10),
    pt(sheetAt, MEDIA_CX, SHEET_CLOSED_TOP + 10, {press: true, hold: 2.0}),
    pt(sheetAt + 1.8, MEDIA_CX, sheetHandleY(0.4)),
    pt(tapAt, MEDIA_CX, sheetButtonY(0.4), {press: true, hold: 0.4}),
  ];
  const glideY = p > 0 && p < 1 ? TAB_CY[0] + (TAB_CY[2] - TAB_CY[0]) * p : undefined;
  const body = (
    <>
      <Header title={concept.title} meta={concept.source} />
      <Media
        asset={concept.asset}
        t={t}
        width={MEDIA_W}
        height={MEDIA_H}
        style={{left: MEDIA_X, top: MEDIA_Y, position: 'absolute', borderRadius: 8, filter: `saturate(${0.35 + p * 0.65}) brightness(${0.82 + p * 0.18})`}}
      />
      <TabRail lit={p >= 1 ? 'entry' : p <= 0 ? 'room' : undefined} target="tab-entry" glideY={glideY} />
      <Sheet t={t} at={sheetAt} dur={1.8} label={concept.question} target="check-delivery-access">
        <Facts rows={concept.rows} />
        <Action target="check-delivery-access" active={t >= tapAt + 0.15} style={{marginTop: 10}}>{concept.action}</Action>
        {t >= tapAt + 0.5 && <div className="nb-result" style={{marginTop: 8}}>{concept.result}</div>}
      </Sheet>
    </>
  );
  return {path, body};
}

// ---- 2 recall: swipe the material index to the sample page, then turn up the approval note ----
function sceneRecall(concept: Concept, t: number) {
  const dragAt = 2.0, dragDur = 1.6;
  const p = move(t, dragAt, dragDur);
  const sheetAt = 4.2;
  const tapAt = 6.6;
  const path: Point[] = [
    pt(0, 540, 470),
    pt(1.1, TAB_LEFT + 20, TAB_CY[0]),
    pt(dragAt, TAB_LEFT + 20, TAB_CY[0], {press: true, hold: dragDur + 0.2}),
    pt(dragAt + dragDur, TAB_LEFT + 20, TAB_CY[1]),
    pt(3.85, MEDIA_CX, SHEET_CLOSED_TOP + 10),
    pt(sheetAt, MEDIA_CX, SHEET_CLOSED_TOP + 10, {press: true, hold: 2.0}),
    pt(sheetAt + 1.8, MEDIA_CX, sheetHandleY(0.4)),
    pt(tapAt, MEDIA_CX, sheetButtonY(0.4), {press: true, hold: 0.4}),
  ];
  const glideY = p > 0 && p < 1 ? TAB_CY[0] + (TAB_CY[1] - TAB_CY[0]) * p : undefined;
  const body = (
    <>
      <Header title={concept.title} meta={concept.source} />
      <Media
        asset={concept.asset}
        t={t}
        width={MEDIA_W}
        height={MEDIA_H}
        style={{left: MEDIA_X, top: MEDIA_Y, position: 'absolute', borderRadius: 8, filter: `saturate(${0.4 + p * 0.6}) brightness(${0.85 + p * 0.15})`}}
      />
      <TabRail lit={p >= 1 ? 'sample' : p <= 0 ? 'room' : undefined} target="tab-sample" glideY={glideY} />
      <Sheet t={t} at={sheetAt} dur={1.8} label={concept.question} target="open-decision-source">
        <Facts rows={concept.rows} />
        <Action target="open-decision-source" active={t >= tapAt + 0.15} style={{marginTop: 10}}>{concept.action}</Action>
      </Sheet>
    </>
  );
  return {path, body};
}

// ---- 3 walkthrough: scrub the site video, then pull a question sheet up over the preserved media ----
function sceneWalkthrough(concept: Concept, t: number) {
  const trackX = MEDIA_X + 16, trackW = MEDIA_W - 32, trackY = MEDIA_BOTTOM - 30;
  const fwdAt = 1.8, fwdDur = 1.4, backAt = 3.4, backDur = 0.8;
  const overshoot = 3.6, settled = 3.0;
  const videoT = t < backAt ? move(t, fwdAt, fwdDur) * overshoot : overshoot - move(t, backAt, backDur) * (overshoot - settled);
  const frac = videoT / 4.8;
  const overshootX = trackX + trackW * (overshoot / 4.8);
  const settledX = trackX + trackW * (settled / 4.8);
  const sheetAt = 5.4, tapAt = 8.0;
  const path: Point[] = [
    pt(0, MEDIA_CX, MEDIA_Y + 260),
    pt(fwdAt, trackX, trackY, {press: true, hold: backAt + backDur - fwdAt}),
    pt(fwdAt + fwdDur, overshootX, trackY),
    pt(backAt, overshootX, trackY),
    pt(backAt + backDur, settledX, trackY),
    pt(4.8, MEDIA_CX, SHEET_CLOSED_TOP + 10),
    pt(sheetAt, MEDIA_CX, SHEET_CLOSED_TOP + 10, {press: true, hold: 2.0}),
    pt(sheetAt + 1.8, MEDIA_CX, sheetHandleY(0.32)),
    pt(tapAt, MEDIA_CX, sheetButtonY(0.32), {press: true, hold: 0.4}),
  ];
  const body = (
    <>
      <Header title={concept.title} meta={concept.source} />
      <div style={abs(MEDIA_X, MEDIA_Y, MEDIA_W, MEDIA_H, {borderRadius: 8, overflow: 'hidden'})}>
        <Media asset={concept.asset} video={concept.video} t={videoT} width={MEDIA_W} height={MEDIA_H} style={{borderRadius: 0}} />
      </div>
      <div className="nb-track" style={abs(trackX, trackY, trackW, 6)} />
      <div className="nb-track-fill" style={abs(trackX, trackY, trackW * frac, 6)} />
      <div className="nb-track-dot" style={abs(trackX + trackW * frac, trackY + 3, 15, 15, {marginLeft: -7, marginTop: -7})} />
      <div className="nb-chip" style={abs(trackX, trackY - 24)}>{(videoT).toFixed(1)}s · site walkthrough</div>
      <TabRail lit={concept.asset} />
      <Sheet t={t} at={sheetAt} dur={1.8} openFrac={0.32} label={concept.question} target="keep-as-context">
        <Facts rows={concept.rows} />
        <Action target="keep-as-context" active={t >= tapAt + 0.15} style={{marginTop: 10}}>{concept.action}</Action>
      </Sheet>
    </>
  );
  return {path, body};
}

// ---- 4 quantity: swipe between layout sketches and pull up the order calculation ----
function LayoutSketch({opacity, herringbone}: {opacity: number; herringbone?: boolean}) {
  const lines: ReactNode[] = [];
  if (herringbone) {
    for (let i = -6; i < 14; i++) {
      lines.push(<line key={`a${i}`} x1={i * 40} y1={0} x2={i * 40 + 260} y2={260} stroke="var(--nb-clay)" strokeWidth={2} />);
      lines.push(<line key={`b${i}`} x1={i * 40 + 260} y1={0} x2={i * 40} y2={260} stroke="var(--nb-clay)" strokeWidth={2} />);
    }
  } else {
    for (let i = 0; i < 8; i++) lines.push(<line key={`h${i}`} x1={0} y1={i * 35} x2={260} y2={i * 35} stroke="var(--nb-clay)" strokeWidth={2} />);
    for (let i = 0; i < 8; i++) lines.push(<line key={`v${i}`} x1={i * 35} y1={0} x2={i * 35} y2={260} stroke="var(--nb-clay)" strokeWidth={2} />);
  }
  return (
    <svg width={260} height={260} style={abs(MEDIA_X + 30, MEDIA_Y + 30, 260, 260, {opacity, mixBlendMode: 'multiply', overflow: 'hidden'})} viewBox="0 0 260 260">
      <clipPath id={herringbone ? 'nb-clip-herringbone' : 'nb-clip-straight'}>
        <rect x={0} y={0} width={260} height={260} />
      </clipPath>
      <g clipPath={`url(#${herringbone ? 'nb-clip-herringbone' : 'nb-clip-straight'})`}>{lines}</g>
    </svg>
  );
}
function sceneQuantity(concept: Concept, t: number) {
  const swipeAt = 2.0, swipeDur = 1.6;
  const p = move(t, swipeAt, swipeDur);
  const sheetAt = 4.6, tapAt = 7.2;
  const path: Point[] = [
    pt(0, MEDIA_X + 460, MEDIA_Y + 400),
    pt(1.2, MEDIA_X + 140, MEDIA_Y + 160),
    pt(swipeAt, MEDIA_X + 140, MEDIA_Y + 160, {press: true, hold: swipeDur + 0.1}),
    pt(swipeAt + swipeDur, MEDIA_X + 460, MEDIA_Y + 160),
    pt(3.7, MEDIA_CX, SHEET_CLOSED_TOP + 10),
    pt(sheetAt, MEDIA_CX, SHEET_CLOSED_TOP + 10, {press: true, hold: 1.9}),
    pt(sheetAt + 1.7, MEDIA_CX, sheetHandleY(0.32)),
    pt(tapAt, MEDIA_CX, sheetButtonY(0.32, 4), {press: true, hold: 0.4}),
  ];
  const picked = t >= tapAt + 0.15;
  const body = (
    <>
      <Header title={concept.title} meta={concept.source} />
      <Media asset={concept.asset} t={t} width={MEDIA_W} height={MEDIA_H} style={{left: MEDIA_X, top: MEDIA_Y, position: 'absolute', borderRadius: 8}} />
      <LayoutSketch opacity={1 - p} />
      <LayoutSketch opacity={p} herringbone />
      <div className="nb-chip" style={abs(MEDIA_X + 30, MEDIA_Y + 300)}>{p < 0.5 ? 'straight' : 'herringbone'} layout sketch</div>
      <TabRail lit={concept.asset} />
      <Sheet t={t} at={sheetAt} label={concept.question} target="choose-herringbone" openFrac={0.32}>
        <Ledger rows={concept.rows} pickedLabel={picked ? 'Herringbone +15%' : undefined} />
        <Action target="choose-herringbone" active={picked} style={{marginTop: 10}}>{concept.action}</Action>
        {picked && <div className="nb-result" style={{marginTop: 8}}>{concept.result} · {concept.detail}</div>}
      </Sheet>
    </>
  );
  return {path, body};
}

// ---- 5 sample: swipe between sample video and room photo, then mark the daylight note approved ----
function sceneSample(concept: Concept, t: number) {
  const scrubT = move(t, 1.4, 1.2) * 3.4;
  const toRoomAt = 3.0, toRoomDur = 1.3;
  const backAt = 4.8, backDur = 1.3;
  const tapAt = 6.8;
  const toRoom = move(t, toRoomAt, toRoomDur);
  const back = move(t, backAt, backDur);
  const showRoom = clamp(toRoom - back, 0, 1);
  const approved = settle(t, tapAt, 0.3);
  const path: Point[] = [
    pt(0, MEDIA_CX, MEDIA_Y + 400),
    pt(1.4, MEDIA_X + 40, MEDIA_Y + 400, {press: true, hold: 1.2}),
    pt(2.6, MEDIA_X + 400, MEDIA_Y + 400),
    pt(toRoomAt, MEDIA_X + 500, MEDIA_Y + 300, {press: true, hold: toRoomDur}),
    pt(toRoomAt + toRoomDur, MEDIA_X + 120, MEDIA_Y + 300),
    pt(backAt, MEDIA_X + 120, MEDIA_Y + 300, {press: true, hold: backDur}),
    pt(backAt + backDur, MEDIA_CX, 809),
    pt(tapAt, MEDIA_CX, 809, {press: true, hold: 0.4}),
  ];
  const body = (
    <>
      <Header title={concept.title} meta={concept.source} />
      <div style={abs(MEDIA_X, MEDIA_Y, MEDIA_W, 430, {borderRadius: 8, overflow: 'hidden'})}>
        <Media asset={concept.asset} video={concept.video} t={scrubT} width={MEDIA_W} height={430} style={{borderRadius: 0}} />
      </div>
      <div style={abs(MEDIA_X, MEDIA_Y, MEDIA_W, 430, {borderRadius: 8, overflow: 'hidden', opacity: showRoom, transform: `translateX(${(1 - showRoom) * 40}px)`})}>
        <Media asset="room" t={t} width={MEDIA_W} height={430} style={{borderRadius: 0}} />
      </div>
      <div className="nb-chip" style={abs(MEDIA_X + 16, MEDIA_Y + 16)}>{showRoom > 0.5 ? 'room context' : 'sample · window light'}</div>
      <TabRail lit={concept.asset} />
      <div className="nb-card" data-review-region="sample-decision" style={abs(MEDIA_X, MEDIA_Y + 440, MEDIA_W, undefined, {padding: '14px 18px'})}>
        <Facts rows={concept.rows} />
        <Action target="approve-finish" active={approved > 0.5} style={{marginTop: 10}}>{concept.action}</Action>
        {approved > 0.5 && <div className="nb-result" style={{marginTop: 8}}>{concept.result}</div>}
      </div>
    </>
  );
  return {path, body};
}

// ---- 6 quote: highlight Dev's words on a notebook page and pin a dated field beneath them ----
function sceneQuote(concept: Concept, t: number) {
  const stripH = 220;
  const lineY = MEDIA_Y + stripH + 96;
  const lineX = MEDIA_X + 6, lineW = MEDIA_W - 12;
  const highlightAt = 2.4, highlightDur = 1.9;
  const p = move(t, highlightAt, highlightDur);
  const pinAt = 5.0;
  const path: Point[] = [
    pt(0, MEDIA_CX, lineY + 60),
    pt(1.3, lineX, lineY + 8),
    pt(highlightAt, lineX, lineY + 8, {press: true, hold: highlightDur + 0.2}),
    pt(highlightAt + highlightDur, lineX + lineW, lineY + 8),
    pt(4.6, lineX + 40, lineY + 40),
    pt(pinAt, lineX + 40, lineY + 40, {press: true, hold: 0.4}),
  ];
  const body = (
    <>
      <Header title={concept.title} meta={concept.source} />
      <Media asset={concept.asset} t={t} width={MEDIA_W} height={stripH} style={{left: MEDIA_X, top: MEDIA_Y, position: 'absolute', borderRadius: 8}} />
      <div className="nb-caption" style={abs(MEDIA_X, MEDIA_Y + stripH + 12, MEDIA_W)}>Call transcript · Dev · Sep 13 (excerpt)</div>
      <div className="nb-rule" style={abs(MEDIA_X, MEDIA_Y + stripH + 40, MEDIA_W)} />
      <div className="nb-body" style={abs(MEDIA_X, lineY - 34, MEDIA_W)}>&hellip;</div>
      <div className="nb-highlight" style={abs(lineX, lineY - 2, lineW * p, 30)} />
      <div className="nb-body" style={abs(lineX, lineY, lineW)}>{concept.detail}</div>
      <div className="nb-body" style={abs(MEDIA_X, lineY + 60, MEDIA_W)}>&hellip;</div>
      <TabRail lit={concept.asset} />
      {t >= pinAt && (
        <Tag x={lineX + 40} y={lineY + 96} t={t} at={pinAt}>
          <strong>{rowVal(concept, 'Start window')}</strong>
          {rowVal(concept, 'Condition')}
        </Tag>
      )}
      <Result concept={concept} t={t} at={pinAt + 0.6} />
    </>
  );
  return {path, body};
}

// ---- 7 clearance: tap the doorway annotation and pull up Dev's measured note over the photo ----
function sceneClearance(concept: Concept, t: number) {
  const hotX = MEDIA_X + MEDIA_W * 0.56, hotY = MEDIA_Y + MEDIA_H * 0.4;
  const tapAt = 2.6, sheetAt = 3.4;
  const path: Point[] = [
    pt(0, MEDIA_CX, MEDIA_Y + 120),
    pt(1.5, hotX, hotY),
    pt(tapAt, hotX, hotY, {press: true, hold: 0.4}),
    pt(3.0, MEDIA_CX, SHEET_CLOSED_TOP + 10),
    pt(sheetAt, MEDIA_CX, SHEET_CLOSED_TOP + 10, {press: true, hold: 2.0}),
    pt(sheetAt + 1.8, MEDIA_CX, sheetHandleY(0.4)),
  ];
  const tapped = t >= tapAt;
  const body = (
    <>
      <Header title={concept.title} meta={concept.source} />
      <Media asset={concept.asset} t={t} width={MEDIA_W} height={MEDIA_H} style={{left: MEDIA_X, top: MEDIA_Y, position: 'absolute', borderRadius: 8}} />
      <div className="nb-hotspot" style={abs(hotX - 15, hotY - 15, 30, 30, {opacity: tapped ? 0.9 : 0.55, boxShadow: tapped ? '0 0 0 9px rgba(188,84,47,.18)' : 'none'})} />
      <TabRail lit={concept.asset} />
      <Sheet t={t} at={sheetAt} dur={1.8} label="Dev · measured on site" target="inspect-measured-note">
        <Facts rows={concept.rows} />
        <div className="nb-detail" style={{marginTop: 8}}>{concept.detail}</div>
      </Sheet>
    </>
  );
  return {path, body};
}

// ---- 8 leadtime: scrub a dated project strip to place the arrival after the plumber visit ----
function sceneLeadtime(concept: Concept, t: number) {
  const trackX = MEDIA_X + 16, trackW = MEDIA_W - 32, trackY = MEDIA_Y + 420;
  const dayX = (d: number) => trackX + (d / 63) * trackW;
  const plumberDay = 28, orderDay = 0, arriveDay = 56;
  const dragAt = 2.2, dragDur = 3.8;
  const p = move(t, dragAt, dragDur);
  const curDay = orderDay + 8 + p * (arriveDay - 8);
  const flagAt = 4.6;
  const path: Point[] = [
    pt(0, dayX(8), trackY),
    pt(dragAt, dayX(8), trackY, {press: true, hold: dragDur + 0.2}),
    pt(dragAt + dragDur, dayX(arriveDay), trackY),
  ];
  const flagged = t >= flagAt;
  const body = (
    <>
      <Header title={concept.title} meta={concept.source} />
      <Media asset={concept.asset} t={t} width={MEDIA_W} height={280} style={{left: MEDIA_X, top: MEDIA_Y, position: 'absolute', borderRadius: 8}} />
      <div className="nb-track" style={abs(trackX, trackY, trackW, 6)} />
      {flagged && (
        <div className="nb-track-fill" style={abs(dayX(plumberDay), trackY, Math.max(0, dayX(curDay) - dayX(plumberDay)), 6, {background: 'var(--nb-clay)'})} />
      )}
      <div className="nb-track-dot" style={abs(dayX(orderDay), trackY + 3, 12, 12, {marginLeft: -6, marginTop: -6, background: 'var(--nb-ink-soft)'})} />
      <div className="nb-track-dot" style={abs(dayX(plumberDay), trackY + 3, 16, 16, {marginLeft: -8, marginTop: -8, background: 'var(--nb-ink)'})} />
      <div className="nb-track-dot" style={abs(dayX(curDay), trackY + 3, 17, 17, {marginLeft: -8.5, marginTop: -8.5})} />
      <div className="nb-caption" style={abs(dayX(orderDay) - 4, trackY - 22)}>if ordered</div>
      <div className="nb-caption" style={abs(dayX(plumberDay) - 18, trackY - 22)}>plumber</div>
      <div className="nb-caption" style={abs(dayX(curDay) - 14, trackY + 22)}>arrival</div>
      <TabRail lit={concept.asset} />
      <Reveal t={t} at={2.0} style={abs(MEDIA_X, trackY + 56, MEDIA_W)}>
        <Facts rows={concept.rows} />
      </Reveal>
      {flagged && (
        <div className="nb-flag" style={abs(MEDIA_X, trackY - 62, undefined, undefined, {opacity: settle(t, flagAt, 0.3)})}>{concept.result}</div>
      )}
    </>
  );
  return {path, body};
}

// ---- 9 substitution: flip the pendant reference to its comparison note and flag the empty temperature field ----
function sceneSubstitution(concept: Concept, t: number) {
  const flipAt = 2.6, flipDur = 2.2;
  const tapAt = 5.6;
  const flagged = t >= tapAt;
  const path: Point[] = [
    pt(0, MEDIA_X + 80, MEDIA_Y + 200),
    pt(1.3, MEDIA_X + MEDIA_W - 40, MEDIA_Y + 40),
    pt(flipAt, MEDIA_X + MEDIA_W - 40, MEDIA_Y + 40, {press: true, hold: flipDur + 0.2}),
    pt(flipAt + flipDur, MEDIA_X + 60, MEDIA_Y + 40),
    pt(5.1, MEDIA_X + MEDIA_W - 90, MEDIA_Y + MEDIA_H - 60),
    pt(tapAt, MEDIA_X + MEDIA_W - 90, MEDIA_Y + MEDIA_H - 60, {press: true, hold: 0.4}),
  ];
  const front = (
    <>
      <Media asset={concept.asset} t={t} width={MEDIA_W} height={MEDIA_H} style={{borderRadius: 8}} />
      <div className="nb-chip" style={abs(16, 16)}>reference photo</div>
    </>
  );
  const back = (
    <div className="nb-card" style={{width: '100%', height: '100%', padding: 20, position: 'relative'}}>
      <div className="nb-title" style={{position: 'static', fontSize: 21}}>Comparison note</div>
      <div className="nb-meta" style={{position: 'static', marginTop: 6}}>{concept.source}</div>
      <div style={{marginTop: 14}}>
        <Facts rows={concept.rows} />
      </div>
      <Action target="prepare-colour-question" active={false} style={{position:'absolute',right:20,bottom:20,width:270}}>{flagged?'Question prepared':concept.action}</Action>
    </div>
  );
  const body = (
    <>
      <Header title={concept.title} meta={concept.question} />
      <FlipCard x={MEDIA_X} y={MEDIA_Y} w={MEDIA_W} h={MEDIA_H} t={t} at={flipAt} dur={flipDur} front={front} back={back} />
      <TabRail lit={concept.asset} />
      {flagged && <Result concept={concept} t={t} at={tapAt + 0.4} />}
    </>
  );
  return {path, body};
}

// ---- 10 signoff: turn between Dev's site check and Sam's budget note; keep both signatures ----
function sceneSignoff(concept: Concept, t: number) {
  const cardW = (MEDIA_W - 20) / 2, cardH = 300, cardY = MEDIA_Y + MEDIA_H - cardH;
  const devX = MEDIA_X, samX = MEDIA_X + cardW + 20;
  const devAt = 2.4, samAt = 4.6;
  const path: Point[] = [
    pt(0, MEDIA_CX, MEDIA_Y + 140),
    pt(1.3, devX + cardW / 2, cardY + cardH / 2),
    pt(devAt, devX + cardW / 2, cardY + cardH / 2, {press: true, hold: 0.4}),
    pt(3.4, samX + cardW / 2, cardY + cardH / 2),
    pt(samAt, samX + cardW / 2, cardY + cardH / 2, {press: true, hold: 0.4}),
  ];
  const devOn = t >= devAt;
  const samOn = t >= samAt;
  const devFront = <div className="nb-card" style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div className="nb-chip">tap for Dev's check</div></div>;
  const devBack = (
    <div className="nb-card" style={{width: '100%', height: '100%', padding: 16}}>
      <div className="nb-title" style={{position: 'static', fontSize: 19}}>Dev · installation</div>
      <div className="nb-body" style={{marginTop: 10, fontSize: 17}}>Installation fit: <strong>{rowVal(concept, 'Installation fit')}</strong></div>
      <div className="nb-result" style={{marginTop: 10}}>fit confirmed ✓</div>
    </div>
  );
  const samFront = <div className="nb-card" style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div className="nb-chip">tap for Sam's approval</div></div>;
  const samBack = (
    <div className="nb-card" style={{width: '100%', height: '100%', padding: 16}}>
      <div className="nb-title" style={{position: 'static', fontSize: 19}}>Sam · budget</div>
      <div className="nb-body" style={{marginTop: 10, fontSize: 17}}>Budget change: <strong>{rowVal(concept, 'Budget change')}</strong></div>
      <div className="nb-result" style={{marginTop: 10}}>approved ✓</div>
    </div>
  );
  const body = (
    <>
      <Header title={concept.title} meta={concept.source} />
      <Media asset={concept.asset} t={t} width={MEDIA_W} height={MEDIA_H - cardH - 16} style={{left: MEDIA_X, top: MEDIA_Y, position: 'absolute', borderRadius: 8}} />
      <FlipCard x={devX} y={cardY} w={cardW} h={cardH} t={t} at={devAt} dur={0.9} front={devFront} back={devBack} />
      <FlipCard x={samX} y={cardY} w={cardW} h={cardH} t={t} at={samAt} dur={0.9} front={samFront} back={samBack} />
      <TabRail lit={concept.asset} />
      {devOn && samOn && <Result concept={concept} t={t} at={samAt + 1.0} />}
    </>
  );
  return {path, body};
}

// ---- 11 delivery: annotate the visible steps on the entry page and fold the note into delivery ----
function sceneDelivery(concept: Concept, t: number) {
  const stepPts = [
    {x: MEDIA_X + 280, y: MEDIA_Y + 680},
    {x: MEDIA_X + 300, y: MEDIA_Y + 630},
    {x: MEDIA_X + 320, y: MEDIA_Y + 580},
    {x: MEDIA_X + 340, y: MEDIA_Y + 530},
  ];
  const tapTimes = [2.0, 2.8, 3.6, 4.4];
  const foldAt = 5.2;
  const count = tapTimes.filter((a) => t >= a).length;
  const path: Point[] = [
    pt(0, MEDIA_CX, MEDIA_Y + 200),
    ...stepPts.map((s, i) => pt(tapTimes[i], s.x, s.y, {press: true, hold: 0.4})),
    pt(4.9, MEDIA_CX, SHEET_CLOSED_TOP + 10),
    pt(foldAt, MEDIA_CX, SHEET_CLOSED_TOP + 10, {press: true, hold: 1.8}),
    pt(foldAt + 1.6, MEDIA_CX, sheetHandleY(0.4)),
  ];
  const body = (
    <>
      <Header title={concept.title} meta={concept.source} />
      <Media asset={concept.asset} t={t} width={MEDIA_W} height={MEDIA_H} style={{left: MEDIA_X, top: MEDIA_Y, position: 'absolute', borderRadius: 8}} />
      {stepPts.map((s, i) =>
        t >= tapTimes[i] ? (
          <div key={i} className="nb-track-dot" style={abs(s.x - 14, s.y - 14, 28, 28, {display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff4ec', fontFamily: 'Menlo,monospace', fontSize: 14, opacity: settle(t, tapTimes[i], 0.25)})}>
            {i + 1}
          </div>
        ) : null,
      )}
      <div className="nb-chip" style={abs(MEDIA_X + 16, MEDIA_Y + 16)}>{count}/4 steps counted manually</div>
      <TabRail lit={concept.asset} />
      <Sheet t={t} at={foldAt} dur={1.6} label="Fold into delivery" target="attach-access-note">
        <Facts rows={concept.rows} />
        {t >= foldAt + 1.4 && <div className="nb-result" style={{marginTop: 8}}>{concept.result}</div>}
      </Sheet>
    </>
  );
  return {path, body};
}

// ---- 12 installerpack: bookmark confirmed pages into a pack and turn to the draft cover ----
function sceneInstallerpack(concept: Concept, t: number) {
  const ribbonLocalX = [40, 110, 180];
  const ribbonX = ribbonLocalX.map((x) => MEDIA_X + x);
  const ribbonLabels = ['Tile', 'Vanity', 'Mirror width'];
  const tapTimes = [2.2, 3.0];
  const flipAt = 3.8, flipDur = 2.0;
  const path: Point[] = [
    pt(0, MEDIA_CX, MEDIA_Y + 320),
    pt(tapTimes[0], ribbonX[0], MEDIA_Y + 20, {press: true, hold: 0.4}),
    pt(tapTimes[1], ribbonX[1], MEDIA_Y + 20, {press: true, hold: 0.4}),
    pt(3.4, MEDIA_X + MEDIA_W - 40, MEDIA_Y + 40),
    pt(flipAt, MEDIA_X + MEDIA_W - 40, MEDIA_Y + 40, {press: true, hold: flipDur + 0.2}),
    pt(flipAt + flipDur, MEDIA_X + 60, MEDIA_Y + 40),
  ];
  const marked = tapTimes.map((a) => t >= a);
  const front = (
    <>
      <Media asset={concept.asset} t={t} width={MEDIA_W} height={MEDIA_H} style={{borderRadius: 8}} />
      {ribbonLabels.map((label, i) =>
        i < 2 ? (
          <div key={label} className="nb-tab" style={{...abs(ribbonLocalX[i], 0, 26, 40, {borderRadius: '0 0 6px 6px', borderLeft: '1px solid #ddd0b5'}), background: marked[i] ? 'var(--nb-clay)' : '#efe7d6'}} data-target={`bookmark-${label.toLowerCase()}`} />
        ) : null,
      )}
    </>
  );
  const back = (
    <div className="nb-card" style={{width: '100%', height: '100%', padding: 20}}>
      <div className="nb-title" style={{position: 'static', fontSize: 22}}>Installer pack · draft</div>
      <div className="nb-meta" style={{position: 'static', marginTop: 6}}>{concept.source}</div>
      <div style={{marginTop: 14}}>
        <Facts rows={concept.rows} />
      </div>
      <div className="nb-detail" style={{marginTop: 10}}>{concept.detail}</div>
    </div>
  );
  const body = (
    <>
      <Header title={concept.title} meta={concept.question} />
      <FlipCard x={MEDIA_X} y={MEDIA_Y} w={MEDIA_W} h={MEDIA_H} t={t} at={flipAt} dur={flipDur} front={front} back={back} />
      <TabRail lit={concept.asset} />
      {t >= flipAt + flipDur + 0.2 && <Result concept={concept} t={t} at={flipAt + flipDur + 0.2} />}
    </>
  );
  return {path, body};
}

// ---- 13 receipt: file the receipt behind the pendant page and flag the return-policy question ----
function sceneReceipt(concept: Concept, t: number) {
  const slipAt = 2.4, slipDur = 2.0;
  const p = move(t, slipAt, slipDur);
  const tapAt = 5.0, sheetAt = 5.4;
  const slipX = MEDIA_X + MEDIA_W * 0.28, slipY0 = MEDIA_Y + MEDIA_H * 0.62, slipY1 = MEDIA_Y + MEDIA_H * 0.9;
  const path: Point[] = [
    pt(0, slipX, slipY0 - 40),
    pt(1.3, slipX, slipY0),
    pt(slipAt, slipX, slipY0, {press: true, hold: slipDur + 0.2}),
    pt(slipAt + slipDur, slipX, slipY1),
    pt(4.7, MEDIA_X + MEDIA_W - 60, MEDIA_Y + 50),
    pt(tapAt, MEDIA_X + MEDIA_W - 60, MEDIA_Y + 50, {press: true, hold: 0.4}),
    pt(8.0, MEDIA_CX, sheetButtonY(0.4), {press: true, hold: 0.3}),
  ];
  const flagged = t >= tapAt;
  const body = (
    <>
      <Header title={concept.title} meta={concept.source} />
      <Media asset={concept.asset} t={t} width={MEDIA_W} height={MEDIA_H} style={{left: MEDIA_X, top: MEDIA_Y, position: 'absolute', borderRadius: 8}} />
      <div
        className="nb-card"
        style={abs(slipX - 90, slipY0 - 60 + (slipY1 - slipY0) * p, 180, 110, {
          padding: 12,
          opacity: 1 - p * 0.35,
          transform: `scale(${1 - p * 0.16})`,
          zIndex: 5,
        })}
      >
        <div className="nb-meta" style={{position: 'static'}}>Receipt</div>
        <div className="nb-body" style={{fontSize: 16, marginTop: 4}}>{rowVal(concept, 'Receipt')}</div>
      </div>
      {flagged && (
        <div className="nb-flag" style={abs(MEDIA_X + MEDIA_W - 210, MEDIA_Y + 20, 190, undefined, {opacity: settle(t, tapAt, 0.3)})}>policy not confirmed</div>
      )}
      <TabRail lit={concept.asset} />
      <Sheet t={t} at={sheetAt} label={concept.question} target="check-return-requirements">
        <Facts rows={concept.rows} />
        <Action target="check-return-requirements" active={t >= 8.3} style={{marginTop: 10}}>{t >= 8.3 ? concept.result : concept.action}</Action>
      </Sheet>
    </>
  );
  return {path, body};
}

const SCENES: Record<string, (concept: Concept, t: number) => {path: Point[]; body: ReactNode}> = {
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

export function Notebook({concept, t}: SceneProps) {
  const build = SCENES[concept.id];
  const {path, body} = build(concept, t);
  return (
    <Frame direction="notebook" concept={concept} t={t} path={path}>
      <div className="v-notebook-scene">
        <Page />
        {body}
      </div>
    </Frame>
  );
}
