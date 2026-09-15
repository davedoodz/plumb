import type {ReactNode} from 'react';
import {Frame,Reveal,Media,Unknown,Facts,move,concepts,type SceneProps,type Point,type Concept} from './shared';
import './Guide.css';

// ---- fixed card geometry (1080x1080 root coordinates) ----
const CARD_LEFT=250,CARD_TOP=90,CARD_W=580,CARD_H=900;
const CONTENT_W=528;
const CTA_POS={x:540,y:936};
const START:Point={at:0,x:540,y:70};

// ---- timing constants shared by every concept (state changes always trail the cursor) ----
const T_A0_MOVE=1.1,T_A0_PRESS=1.3;
const T_C0_MOVE=2.6,T_C0_PRESS=2.9;
const T_A1_MOVE=4.5,T_A1_PRESS=4.8;
const T_C1_MOVE=6.5,T_C1_PRESS=6.9;
const T_A2_MOVE=8.5,T_A2_PRESS=8.9;
const HOLD=.3;

function guidePoints(a0:{x:number;y:number},a1:{x:number;y:number}):Point[]{
  return [
    START,
    {at:T_A0_MOVE,x:a0.x,y:a0.y},
    {at:T_A0_PRESS,x:a0.x,y:a0.y,press:true,hold:HOLD},
    {at:T_C0_MOVE,x:CTA_POS.x,y:CTA_POS.y},
    {at:T_C0_PRESS,x:CTA_POS.x,y:CTA_POS.y,press:true,hold:HOLD},
    {at:T_A1_MOVE,x:a1.x,y:a1.y},
    {at:T_A1_PRESS,x:a1.x,y:a1.y,press:true,hold:HOLD},
    {at:T_C1_MOVE,x:CTA_POS.x,y:CTA_POS.y},
    {at:T_C1_PRESS,x:CTA_POS.x,y:CTA_POS.y,press:true,hold:HOLD},
    {at:T_A2_MOVE,x:CTA_POS.x,y:CTA_POS.y},
    {at:T_A2_PRESS,x:CTA_POS.x,y:CTA_POS.y,press:true,hold:HOLD},
  ];
}

function useTrack(t:number){
  const p1=move(t,3.15,.5);
  const p2=move(t,7.15,.5);
  const offset=(p1+p2)*CONTENT_W;
  const stage=p1<.5?0:p2<.5?1:2;
  return {offset,stage};
}

// ---- reusable step chrome ----
function StepHead({eyebrow,children}:{eyebrow:string;children:ReactNode}){
  return <div className="v-guide-stephead"><span className="v-guide-stephead-eyebrow">{eyebrow}</span><h2>{children}</h2></div>;
}
function CTA({t,at,label,target,kind}:{t:number;at:number;label:string;target:string;kind:'next'|'confirm'}){
  const pressed=t>=at&&t<at+HOLD;
  const completedChoice=kind==='next'&&t>=(at<=T_C0_PRESS?T_A0_PRESS:T_A1_PRESS)+0.35;
  return <div className={`v-guide-cta v-guide-cta--${kind}${pressed?' is-pressed':''}`} data-target={target}><span>{completedChoice?'Continue':label}</span>{kind==='next'&&<i>&rarr;</i>}</div>;
}
function Choice({label,detail,state,warn,target}:{label:string;detail?:string;state:'idle'|'active'|'muted';warn?:boolean;target:string}){
  return <div className={`v-guide-choice v-guide-choice--${state}${warn?' is-warn':''}`} data-target={target}>
    <span className="v-guide-choice-label">{label}</span>
    {detail&&<span className="v-guide-choice-detail">{detail}</span>}
  </div>;
}
function Consequence({label='IF CONFIRMED',children}:{label?:string;children:ReactNode}){
  return <div className="v-guide-consequence" data-review-region="consequence"><span className="v-guide-consequence-label">{label}</span><p>{children}</p></div>;
}
function Resolution({t,chipKind,chipLabel,ctaLabel,ctaTarget,result,detail}:{t:number;chipKind:'success'|'draft'|'pending';chipLabel:string;ctaLabel:string;ctaTarget:string;result:string;detail:string}){
  const done=t>=T_A2_PRESS+HOLD;
  return <>
    <div className="v-guide-resolution" data-review-region="resolution">
      <div className={`v-guide-chip v-guide-chip--${done?chipKind:'wait'}`}>{done?chipLabel:'Ready to confirm'}</div>
      <Reveal t={t} at={T_A2_PRESS+HOLD} className="v-guide-result"><p>{result}</p><small>{detail}</small></Reveal>
    </div>
    <CTA t={t} at={T_A2_PRESS} label={ctaLabel} target={ctaTarget} kind="confirm"/>
  </>;
}
function Caption({children}:{children:ReactNode}){return <div className="v-guide-caption">{children}</div>;}

// ---- chip label + status mapping, grounded in concept.status ----
const CHIP:Record<string,{kind:'success'|'draft'|'pending';label:string}>={
  capture:{kind:'success',label:'Confirmed'},
  prompt:{kind:'draft',label:'Question prepared'},
  recall:{kind:'success',label:'Confirmed'},
  walkthrough:{kind:'draft',label:'Question prepared'},
  quantity:{kind:'success',label:'Confirmed'},
  sample:{kind:'success',label:'Confirmed'},
  quote:{kind:'success',label:'Confirmed'},
  clearance:{kind:'pending',label:'Still needs confirmation'},
  leadtime:{kind:'pending',label:'Still needs confirmation'},
  substitution:{kind:'draft',label:'Question prepared'},
  signoff:{kind:'success',label:'Confirmed'},
  delivery:{kind:'success',label:'Confirmed'},
  installerpack:{kind:'draft',label:'Still needs confirmation'},
  receipt:{kind:'pending',label:'Question prepared'},
};

type GuideDef={labels:[string,string,string];trail:[string,string];a0:{x:number;y:number};a1:{x:number;y:number};
  stage0:(t:number)=>ReactNode;stage1:(t:number)=>ReactNode;stage2:(t:number)=>ReactNode};

function byId(id:string){return concepts.find(c=>c.id===id) as Concept;}

const DEFS:Record<string,GuideDef>={
  // 01 · capture -------------------------------------------------------
  capture:(()=>{
    const c=byId('capture');
    return {
      labels:['Review photo','Choose Spec','Attach'],
      trail:['Photo reviewed','Destination: Vanity'],
      a0:{x:540,y:491},a1:{x:361,y:432} ,
      stage0:(t)=><>
        <StepHead eyebrow={c.source}>Review the site photo</StepHead>
        <div className="v-guide-media-wrap" data-target="capture-photo"><Media asset="room" t={t} width={CONTENT_W} height={196} style={{objectFit:'contain'}}/></div>
        <Caption>This is the wall carrying the vanity decision.</Caption>
        <CTA t={t} at={T_C0_PRESS} label="Continue" target="capture-continue-1" kind="next"/>
      </>,
      stage1:(t)=>{const chosen=t>=T_A1_PRESS;return <>
        <StepHead eyebrow="Choose a destination">Where does it belong?</StepHead>
        <div className="v-guide-chiprow">
          <Choice label="Vanity" state={chosen?'active':'idle'} target="capture-chip-vanity"/>
          <Choice label="Plumbing rough-in" state="muted" target="capture-chip-plumbing"/>
          <Choice label="Tile order" state="muted" target="capture-chip-tile"/>
        </div>
        {chosen&&<Consequence>Attaches to the Vanity Spec. A link back to this photo stays with it.</Consequence>}
        <CTA t={t} at={T_C1_PRESS} label="Continue" target="capture-continue-2" kind="next"/>
      </>;},
      stage2:(t)=><>
        <StepHead eyebrow="Confirm the attachment">Room photo &rarr; Vanity</StepHead>
        <div className="v-guide-fieldrow"><span>Spec</span><strong>Vanity</strong></div>
        <div className="v-guide-fieldrow"><span>Reference</span><strong>Site photograph</strong></div>
        <Resolution t={t} chipKind={CHIP.capture.kind} chipLabel={CHIP.capture.label} ctaLabel="Attach to Vanity" ctaTarget="capture-confirm" result={c.result} detail={c.detail}/>
      </>,
    } as GuideDef;
  })(),
  // 02 · prompt ----------------------------------------------------------
  prompt:(()=>{
    const c=byId('prompt');
    return {
      labels:['Candidates','Narrow to one','Prepare question'],
      trail:['Blockers isolated','Delivery access selected'],
      a0:{x:540,y:936},a1:{x:540,y:936} ,
      stage0:(t)=>{const narrowed=t>=T_A0_PRESS;return <>
        <StepHead eyebrow="What's still open">Three open questions</StepHead>
        <div className="v-guide-rowstack">
          <Choice label="Packed dimensions" detail="Blocks delivery booking" state="active" warn target="prompt-row-dimensions"/>
          <Choice label="Paint colour" state={narrowed?'muted':'idle'} target="prompt-row-paint"/>
          <Choice label="Grout sealant" state={narrowed?'muted':'idle'} target="prompt-row-grout"/>
        </div>
        <CTA t={t} at={T_A0_PRESS} label="Show blockers only" target="prompt-filter-blockers" kind="next"/>
      </>;},
      stage1:(t)=>{const chosen=t>=T_A1_PRESS;return <>
        <StepHead eyebrow={c.source}>Check delivery access</StepHead>
        <div className="v-guide-media-wrap"><Media asset="entry" t={t} width={CONTENT_W} height={196} style={{objectFit:'contain'}}/></div>
        <Caption>Four visible steps · Maya's site photo</Caption>
        <CTA t={t} at={T_A1_PRESS} label="Select this question" target="prompt-select-question" kind="next"/>
        {chosen&&<Consequence label="NEXT DEPENDENCY">Resolving this clears the delivery booking blocker.</Consequence>}
      </>;},
      stage2:(t)=><>
        <StepHead eyebrow="Prepare the question">Packed dimensions</StepHead>
        <div className="v-guide-fieldrow"><span>Next dependency</span><strong>Check crate access</strong></div>
        <div className="v-guide-fieldrow"><span>Packed dimensions</span><strong><Unknown/></strong></div>
        <Resolution t={t} chipKind={CHIP.prompt.kind} chipLabel={CHIP.prompt.label} ctaLabel="Prepare the question" ctaTarget="prompt-confirm" result={c.result} detail={c.detail}/>
      </>,
    } as GuideDef;
  })(),
  // 03 · recall ------------------------------------------------------------
  recall:(()=>{
    const c=byId('recall');
    return {
      labels:['Filter room','Filter material','Recall decision'],
      trail:['Room: Bathroom','Material: Tile'],
      a0:{x:361,y:420},a1:{x:361,y:420} ,
      stage0:(t)=><>
        <StepHead eyebrow="Narrow by room">Which room?</StepHead>
        <div className="v-guide-chiprow">
          <Choice label="Bathroom" state={t>=T_A0_PRESS?'active':'idle'} target="recall-room-bathroom"/>
          <Choice label="Kitchen" state="muted" target="recall-room-kitchen"/>
          <Choice label="Entry" state="muted" target="recall-room-entry"/>
        </div>
        <CTA t={t} at={T_C0_PRESS} label="Continue" target="recall-continue-1" kind="next"/>
      </>,
      stage1:(t)=><>
        <StepHead eyebrow="Narrow by material">Which material?</StepHead>
        <div className="v-guide-chiprow">
          <Choice label="Tile" state={t>=T_A1_PRESS?'active':'idle'} target="recall-material-tile"/>
          <Choice label="Vanity" state="muted" target="recall-material-vanity"/>
          <Choice label="Pendant" state="muted" target="recall-material-pendant"/>
        </div>
        <CTA t={t} at={T_C1_PRESS} label="Continue" target="recall-continue-2" kind="next"/>
      </>,
      stage2:(t)=><>
        <StepHead eyebrow={c.source}>Blue-green tile, recalled</StepHead>
        <div className="v-guide-media-wrap"><Media asset="sample" t={t} width={CONTENT_W} height={190} style={{objectFit:'contain'}}/></div>
        <Facts rows={c.rows} style={{marginTop:12}}/>
        <Resolution t={t} chipKind={CHIP.recall.kind} chipLabel={CHIP.recall.label} ctaLabel="Confirm recall" ctaTarget="recall-confirm" result={c.result} detail={c.detail}/>
      </>,
    } as GuideDef;
  })(),
  // 04 · walkthrough ---------------------------------------------------------
  walkthrough:(()=>{
    const c=byId('walkthrough');
    return {
      labels:['Watch clip','Choose question','Pin as context'],
      trail:['Clip reviewed','Question: vanity clearance'],
      a0:{x:540,y:936},a1:{x:540,y:420} ,
      stage0:(t)=><>
        <StepHead eyebrow={c.source}>Review the walkthrough</StepHead>
        <div className="v-guide-media-wrap"><Media asset="room" video="room" t={t} width={CONTENT_W} height={196}/></div>
        <CTA t={t} at={T_A0_PRESS} label="Mark reviewed" target="walkthrough-mark-reviewed" kind="next"/>
      </>,
      stage1:(t)=>{const chosen=t>=T_A1_PRESS;return <>
        <StepHead eyebrow="Question for Dev · installer">What needs checking?</StepHead>
        <div className="v-guide-rowstack">
          <Choice label="Vanity clearance around the base" state={chosen?'active':'idle'} warn={chosen} target="walkthrough-q-clearance"/>
          <Choice label="Tile grout line spacing" state="muted" target="walkthrough-q-grout"/>
        </div>
        {chosen&&<Consequence label="STILL REQUIRED">Dev still needs to measure on site — the clip only locates the question.</Consequence>}
        <CTA t={t} at={T_C1_PRESS} label="Continue" target="walkthrough-continue" kind="next"/>
      </>;},
      stage2:(t)=><>
        <StepHead eyebrow="Pin the clip beside it">Kept in context</StepHead>
        <div className="v-guide-media-wrap"><Media asset="room" video="room" t={t} width={CONTENT_W} height={140}/></div>
        <div className="v-guide-fieldrow" style={{marginTop:12}}><span>Clearance</span><strong>Measurement required</strong></div>
        <Resolution t={t} chipKind={CHIP.walkthrough.kind} chipLabel={CHIP.walkthrough.label} ctaLabel="Pin as context" ctaTarget="walkthrough-confirm" result={c.result} detail={c.detail}/>
      </>,
    } as GuideDef;
  })(),
  // 05 · quantity ---------------------------------------------------------
  quantity:(()=>{
    const c=byId('quantity');
    return {
      labels:['Choose layout','Check the math','Confirm quantity'],
      trail:['Layout: Herringbone','Allowance checked'],
      a0:{x:674,y:433},a1:{x:540,y:936} ,
      stage0:(t)=><>
        <StepHead eyebrow="Choose a layout">Straight or herringbone?</StepHead>
        <div className="v-guide-chiprow">
          <Choice label="Straight" detail="7 boxes · $1,397" state="muted" target="quantity-layout-straight"/>
          <Choice label="Herringbone" detail="8 boxes · $1,596" state={t>=T_A0_PRESS?'active':'idle'} target="quantity-layout-herringbone"/>
        </div>
        <CTA t={t} at={T_C0_PRESS} label="Continue" target="quantity-continue-1" kind="next"/>
      </>,
      stage1:(t)=>{const shown=t>=T_A1_PRESS;return <>
        <StepHead eyebrow="Check the arithmetic">Waste and allowance</StepHead>
        <Facts rows={c.rows}/>
        <CTA t={t} at={T_A1_PRESS} label="Show allowance" target="quantity-show-allowance" kind="next"/>
        {shown&&<Consequence>{c.detail}</Consequence>}
      </>;},
      stage2:(t)=><>
        <StepHead eyebrow="Confirm the quantity">Herringbone, 8 boxes</StepHead>
        <div className="v-guide-fieldrow"><span>Layout</span><strong>Herringbone +15%</strong></div>
        <div className="v-guide-fieldrow"><span>Total</span><strong>8 boxes · $1,596</strong></div>
        <Resolution t={t} chipKind={CHIP.quantity.kind} chipLabel={CHIP.quantity.label} ctaLabel="Confirm quantity" ctaTarget="quantity-confirm" result={c.result} detail={c.detail}/>
      </>,
    } as GuideDef;
  })(),
  // 06 · sample -------------------------------------------------------------
  sample:(()=>{
    const c=byId('sample');
    return {
      labels:['Watch in daylight','Compare room','Approve finish'],
      trail:['Daylight reviewed','Room compared'],
      a0:{x:540,y:936},a1:{x:540,y:936} ,
      stage0:(t)=><>
        <StepHead eyebrow={c.source}>Play the sample</StepHead>
        <div className="v-guide-media-wrap"><Media asset="sample" video="sample" t={t} width={CONTENT_W} height={196}/></div>
        <CTA t={t} at={T_A0_PRESS} label="Note the light" target="sample-note-light" kind="next"/>
      </>,
      stage1:(t)=>{const compared=t>=T_A1_PRESS;return <>
        <StepHead eyebrow="Compare with the room">Same light, same wall</StepHead>
        <div className="v-guide-media-wrap"><Media asset="room" t={t} width={CONTENT_W} height={168} style={{objectFit:'contain'}}/></div>
        <CTA t={t} at={T_A1_PRESS} label="Compare" target="sample-compare" kind="next"/>
        {compared&&<Consequence label="SCOPE">This approves the finish only — not a slip-rating or installation.</Consequence>}
      </>;},
      stage2:(t)=><>
        <StepHead eyebrow="Approve the finish">Blue-green glazed tile</StepHead>
        <Facts rows={c.rows}/>
        <Resolution t={t} chipKind={CHIP.sample.kind} chipLabel={CHIP.sample.label} ctaLabel="Approve finish" ctaTarget="sample-confirm" result={c.result} detail={c.detail}/>
      </>,
    } as GuideDef;
  })(),
  // 07 · quote -----------------------------------------------------------
  quote:(()=>{
    const c=byId('quote');
    return {
      labels:['Read transcript','Keep condition','Save both'],
      trail:['Date highlighted','Condition kept'],
      a0:{x:508,y:425},a1:{x:540,y:936} ,
      stage0:(t)=>{const marked=t>=T_A0_PRESS;return <>
        <StepHead eyebrow={c.source}>Read Dev's words</StepHead>
        <div className="v-guide-transcript" data-target="quote-transcript">"We can start the <span className={marked?'v-guide-highlight':undefined} data-target="quote-highlight-date">week of October 12</span>, once the vanity is on site."</div>
        <CTA t={t} at={T_C0_PRESS} label="Continue" target="quote-continue-1" kind="next"/>
      </>;},
      stage1:(t)=>{const kept=t>=T_A1_PRESS;return <>
        <StepHead eyebrow="Keep the condition">Don't drop the dependency</StepHead>
        <div className="v-guide-transcript">"…the week of October 12, once the <span className="v-guide-highlight">vanity is on site</span>."</div>
        {kept&&<div className="v-guide-fieldpreview">
          <div className="v-guide-fieldrow"><span>Start window</span><strong>Week of Oct 12</strong></div>
          <div className="v-guide-fieldrow"><span>Condition</span><strong>Vanity on site</strong></div>
        </div>}
        <CTA t={t} at={T_A1_PRESS} label="Attach condition" target="quote-attach-condition" kind="next"/>
      </>;},
      stage2:(t)=><>
        <StepHead eyebrow="Save the field">Start window + condition</StepHead>
        <Facts rows={c.rows}/>
        <Resolution t={t} chipKind={CHIP.quote.kind} chipLabel={CHIP.quote.label} ctaLabel="Save start window" ctaTarget="quote-confirm" result={c.result} detail={c.detail}/>
      </>,
    } as GuideDef;
  })(),
  // 08 · clearance --------------------------------------------------------
  clearance:(()=>{
    const c=byId('clearance');
    return {
      labels:['Find the door','Read the note','Leave landing open'],
      trail:['Door identified','760 mm read'],
      a0:{x:550,y:487},a1:{x:540,y:936} ,
      stage0:(t)=><>
        <StepHead eyebrow={c.source}>Locate the opening</StepHead>
        <div className="v-guide-media-wrap" data-target="clearance-photo"><Media asset="entry" t={t} width={CONTENT_W} height={196} style={{objectFit:'contain'}}/>
          {t>=T_A0_PRESS&&<div className="v-guide-hotspot" data-target="clearance-hotspot" style={{left:257,top:77}}/>}
        </div>
        <CTA t={t} at={T_C0_PRESS} label="Continue" target="clearance-continue-1" kind="next"/>
      </>,
      stage1:(t)=>{const shown=t>=T_A1_PRESS;return <>
        <StepHead eyebrow="Which dimension is measured?">Dev's site note</StepHead>
        <div className="v-guide-fieldrow"><span>Door opening</span><strong>760 mm · Dev measured</strong></div>
        <CTA t={t} at={T_A1_PRESS} label="Open measured note" target="clearance-open-note" kind="next"/>
        {shown&&<Consequence label="EVIDENCE">Photo annotation + site note — no dimension is inferred.</Consequence>}
      </>;},
      stage2:(t)=><>
        <StepHead eyebrow="Landing depth">Stays unconfirmed</StepHead>
        <div className="v-guide-fieldrow"><span>Landing depth</span><strong><Unknown/></strong></div>
        <Resolution t={t} chipKind={CHIP.clearance.kind} chipLabel={CHIP.clearance.label} ctaLabel="Leave unresolved" ctaTarget="clearance-confirm" result={c.result} detail={c.detail}/>
      </>,
    } as GuideDef;
  })(),
  // 09 · leadtime -----------------------------------------------------------
  leadtime:(()=>{
    const c=byId('leadtime');
    return {
      labels:['Set order date','Compare dates','Review conflict'],
      trail:['Order date: Sep 14','Dates compared'],
      a0:{x:540,y:420},a1:{x:540,y:936} ,
      stage0:(t)=><>
        <StepHead eyebrow="Demo lead time · confirm with supplier">Set the order date</StepHead>
        <div className="v-guide-chiprow"><Choice label="Order today · Sep 14" state={t>=T_A0_PRESS?'active':'idle'} target="leadtime-set-date"/></div>
        <CTA t={t} at={T_C0_PRESS} label="Continue" target="leadtime-continue-1" kind="next"/>
      </>,
      stage1:(t)=>{const shown=t>=T_A1_PRESS;return <>
        <StepHead eyebrow="8 week lead time">Compare with the visit</StepHead>
        <div className="v-guide-fieldrow"><span>Estimated arrival</span><strong>Nov 9</strong></div>
        <div className="v-guide-fieldrow"><span>Plumber booked</span><strong>Oct 12</strong></div>
        <CTA t={t} at={T_A1_PRESS} label="Compare" target="leadtime-compare" kind="next"/>
        {shown&&<Consequence label="RISK">Estimated arrival lands 28 days after the plumber's visit.</Consequence>}
      </>;},
      stage2:(t)=><>
        <StepHead eyebrow="Review the schedule risk">28 days late</StepHead>
        <Facts rows={c.rows}/>
        <Resolution t={t} chipKind={CHIP.leadtime.kind} chipLabel={CHIP.leadtime.label} ctaLabel="Flag the conflict" ctaTarget="leadtime-confirm" result={c.result} detail={c.detail}/>
      </>,
    } as GuideDef;
  })(),
  // 10 · substitution -------------------------------------------------------
  substitution:(()=>{
    const c=byId('substitution');
    return {
      labels:['Check matches','Flag the gap','Prepare question'],
      trail:['Matches checked','Gap flagged'],
      a0:{x:540,y:936},a1:{x:540,y:936} ,
      stage0:(t)=>{const revealed=t>=T_A0_PRESS;return <>
        <StepHead eyebrow={c.source}>Check what matches</StepHead>
        <div className="v-guide-rowstack">
          <div className="v-guide-fieldrow"><span>Drop</span><strong>18 in · matches</strong></div>
          <div className="v-guide-fieldrow"><span>Finish</span><strong>Brass · matches</strong></div>
        </div>
        <CTA t={t} at={T_A0_PRESS} label="Review remaining spec" target="substitution-review" kind="next"/>
        {revealed&&<Consequence label="NOT YET APPROVED">Matching attributes aren't a Spec match on their own.</Consequence>}
      </>;},
      stage1:(t)=><>
        <StepHead eyebrow="Colour temperature">The gap is open</StepHead>
        <div className="v-guide-fieldrow"><span>Target</span><strong>2700 K</strong></div>
        <div className="v-guide-fieldrow"><span>Alternative</span><strong><Unknown/></strong></div>
        <CTA t={t} at={T_A1_PRESS} label="Ask about colour temp" target="substitution-ask" kind="next"/>
      </>,
      stage2:(t)=><>
        <StepHead eyebrow="Prepare the question">Supplier · colour temp</StepHead>
        <div className="v-guide-fieldrow"><span>Alternative colour temp</span><strong><Unknown/></strong></div>
        <Resolution t={t} chipKind={CHIP.substitution.kind} chipLabel={CHIP.substitution.label} ctaLabel="Prepare supplier question" ctaTarget="substitution-confirm" result={c.result} detail={c.detail}/>
      </>,
    } as GuideDef;
  })(),
  // 11 · signoff -----------------------------------------------------------
  signoff:(()=>{
    const c=byId('signoff');
    return {
      labels:["Dev confirms fit","Sam approves budget",'Both signed'],
      trail:['Dev: fit confirmed','Sam: budget approved'],
      a0:{x:540,y:420},a1:{x:540,y:478} ,
      stage0:(t)=>{const confirmed=t>=T_A0_PRESS;return <>
        <StepHead eyebrow="Dev · installer">Installation fit</StepHead>
        <div className="v-guide-chiprow"><Choice label="Confirm fit" state={confirmed?'active':'idle'} target="signoff-confirm-fit"/></div>
        {confirmed&&<Consequence label="RESPONSIBILITY">Installation fit is Dev's call — budget is separate.</Consequence>}
        <CTA t={t} at={T_C0_PRESS} label="Continue" target="signoff-continue-1" kind="next"/>
      </>;},
      stage1:(t)=>{const requested=t>=T_A1_PRESS;return <>
        <StepHead eyebrow="Sam · budget owner">Budget change</StepHead>
        <div className="v-guide-fieldrow"><span>Budget change</span><strong>+$412</strong></div>
        <div className="v-guide-chiprow" style={{marginTop:10}}><Choice label="Sam: approve +$412" state={requested?'active':'idle'} target="signoff-request-sam"/></div>
        <CTA t={t} at={T_C1_PRESS} label="Continue" target="signoff-continue-2" kind="next"/>
      </>;},
      stage2:(t)=><>
        <StepHead eyebrow="Two separate approvals">Not a checkout</StepHead>
        <Facts rows={c.rows}/>
        <Resolution t={t} chipKind={CHIP.signoff.kind} chipLabel={CHIP.signoff.label} ctaLabel="Save both approvals" ctaTarget="signoff-confirm" result={c.result} detail={c.detail}/>
      </>,
    } as GuideDef;
  })(),
  // 12 · delivery -----------------------------------------------------------
  delivery:(()=>{
    const c=byId('delivery');
    return {
      labels:['Inspect entry','Add note','Attach to delivery'],
      trail:['Entry inspected','Note drafted'],
      a0:{x:540,y:936},a1:{x:540,y:936} ,
      stage0:(t)=><>
        <StepHead eyebrow={c.source}>Inspect the entry</StepHead>
        <div className="v-guide-media-wrap" data-target="delivery-photo"><Media asset="entry" t={t} width={CONTENT_W} height={196} style={{objectFit:'contain'}}/></div>
        <CTA t={t} at={T_A0_PRESS} label="Count the steps" target="delivery-count-steps" kind="next"/>
      </>,
      stage1:(t)=>{const noted=t>=T_A1_PRESS;return <>
        <StepHead eyebrow="Manual access note">Write what delivery needs</StepHead>
        <div className="v-guide-fieldrow"><span>Steps</span><strong>4 · counted manually</strong></div>
        {noted&&<div className="v-guide-fieldrow"><span>Landing</span><strong>Narrow</strong></div>}
        <CTA t={t} at={T_A1_PRESS} label="Add note" target="delivery-add-note" kind="next"/>
      </>;},
      stage2:(t)=><>
        <StepHead eyebrow="Attach to delivery">Photo + manual note</StepHead>
        <div className="v-guide-fieldrow"><span>Packed dimensions</span><strong>Supplier confirmation needed</strong></div>
        <Resolution t={t} chipKind={CHIP.delivery.kind} chipLabel={CHIP.delivery.label} ctaLabel="Attach access note" ctaTarget="delivery-confirm" result={c.result} detail={c.detail}/>
      </>,
    } as GuideDef;
  })(),
  // 13 · installerpack -------------------------------------------------------
  installerpack:(()=>{
    const c=byId('installerpack');
    return {
      labels:['Select Specs','Flag unresolved','Prepare draft'],
      trail:['Specs selected','Mirror flagged'],
      a0:{x:540,y:936},a1:{x:540,y:936} ,
      stage0:(t)=>{const selected=t>=T_A0_PRESS;return <>
        <StepHead eyebrow="Confirmed Specs only">Select what's confirmed</StepHead>
        <div className="v-guide-rowstack">
          <div className="v-guide-fieldrow"><span>Tile</span><strong>8 boxes</strong></div>
          <div className="v-guide-fieldrow"><span>Vanity</span><strong>1</strong></div>
        </div>
        <CTA t={t} at={T_A0_PRESS} label="Select confirmed" target="installerpack-select" kind="next"/>
        {selected&&<Consequence label="SCOPE">Only confirmed Specs go into the pack.</Consequence>}
      </>;},
      stage1:(t)=><>
        <StepHead eyebrow="What's unresolved">Mirror width</StepHead>
        <div className="v-guide-fieldrow"><span>Mirror width</span><strong><Unknown/></strong></div>
        <CTA t={t} at={T_A1_PRESS} label="Flag as unresolved" target="installerpack-flag" kind="next"/>
      </>,
      stage2:(t)=><>
        <StepHead eyebrow="Prepare — not send">Installer pack draft</StepHead>
        <div className="v-guide-fieldrow"><span>Mirror width</span><strong><Unknown/></strong></div>
        <Resolution t={t} chipKind={CHIP.installerpack.kind} chipLabel={CHIP.installerpack.label} ctaLabel="Prepare draft pack" ctaTarget="installerpack-confirm" result={c.result} detail={c.detail}/>
      </>,
    } as GuideDef;
  })(),
  // 14 · receipt --------------------------------------------------------------
  receipt:(()=>{
    const c=byId('receipt');
    return {
      labels:['Attach receipt','Check policy','Prepare question'],
      trail:['Receipt attached','Policy checked'],
      a0:{x:540,y:420},a1:{x:540,y:936} ,
      stage0:(t)=><>
        <StepHead eyebrow={c.source}>Attach the receipt</StepHead>
        <div className="v-guide-chiprow"><Choice label="Attach as proof" state={t>=T_A0_PRESS?'active':'idle'} target="receipt-attach"/></div>
        <CTA t={t} at={T_C0_PRESS} label="Continue" target="receipt-continue-1" kind="next"/>
      </>,
      stage1:(t)=>{const checked=t>=T_A1_PRESS;return <>
        <StepHead eyebrow="Before asking for a return">Check the policy</StepHead>
        <div className="v-guide-fieldrow"><span>Return eligibility</span><strong><Unknown/></strong></div>
        <CTA t={t} at={T_A1_PRESS} label="Check requirements" target="receipt-check-requirements" kind="next"/>
        {checked&&<Consequence label="NOT A REFUND">This prepares a question — it does not submit or issue anything.</Consequence>}
      </>;},
      stage2:(t)=><>
        <StepHead eyebrow="Prepare — don't submit">Return question</StepHead>
        <div className="v-guide-fieldrow"><span>Evidence</span><strong>Receipt attached</strong></div>
        <Resolution t={t} chipKind={CHIP.receipt.kind} chipLabel={CHIP.receipt.label} ctaLabel="Prepare return question" ctaTarget="receipt-confirm" result={c.result} detail={c.detail}/>
      </>,
    } as GuideDef;
  })(),
};

export function Guide({concept,t}:SceneProps){
  const def=DEFS[concept.id];
  const {offset,stage}=useTrack(t);
  const path=guidePoints(def.a0,def.a1);
  const trail=def.trail.slice(0,stage);
  return <Frame direction="guide" concept={concept} t={t} path={path}>
    <div className="v-guide-surface v-surface" data-review-region="guide-card" style={{left:CARD_LEFT,top:CARD_TOP,width:CARD_W,height:CARD_H}}>
      <div className="v-guide-head">
        <span className="v-guide-eyebrow">{concept.source}</span>
        <h1 className="v-guide-title">{concept.question}</h1>
      </div>
      <div className="v-guide-progress" data-review-region="progress-strip">
        {def.labels.map((label,i)=>(
          <div key={label} className={`v-guide-dot${i<stage?' is-done':i===stage?' is-active':''}`}>
            <span className="v-guide-dot-num">{i+1}</span>
            <small>{label}</small>
          </div>
        ))}
      </div>
      <div className="v-guide-backtrail" data-review-region="backtrail">
        {trail.length?trail.map((entry)=><span className="v-guide-crumb" key={entry}>{entry}</span>):<span className="v-guide-crumb v-guide-crumb--empty">Step 1 of {def.labels.length}</span>}
      </div>
      <div className="v-guide-trackwrap" data-review-region="step-content">
        <div className="v-guide-track" style={{transform:`translateX(${-offset}px)`}}>
          <div className="v-guide-panel">{def.stage0(t)}</div>
          <div className="v-guide-panel">{def.stage1(t)}</div>
          <div className="v-guide-panel">{def.stage2(t)}</div>
        </div>
      </div>
    </div>
  </Frame>;
}
