import type {ReactNode} from 'react';
import {Frame,Reveal,Media,Unknown} from './shared';
import type {SceneProps,Point,Concept} from './shared';
import './Workspace.css';

const PANEL_X=60,PANEL_Y=115,PANEL_W=960,PANEL_H=850;
const ROW_H=84;
const NAV_ITEMS=['Specs','Materials','Site media','Quantities','Schedule','Approvals','Delivery','Orders'];
const ACTIVE_NAV:Record<string,number>={capture:0,installerpack:0,recall:1,sample:1,walkthrough:2,clearance:2,quantity:3,quote:4,leadtime:4,signoff:5,prompt:6,delivery:6,substitution:7,receipt:7};
function P(x:number,y:number,at:number,press?:boolean,hold?:number):Point{return{x:PANEL_X+x,y:PANEL_Y+y,at,press,hold};}
const rowY=(i:number)=>182+ROW_H*i;
function facts(concept:Concept):Record<string,string>{return Object.fromEntries(concept.rows.map(r=>[r.label,r.value]));}

type Col={label:string;w:number};
type RowDef={key:string;cells:ReactNode[];selected?:boolean;blocked?:boolean;target?:string};

function Toolbar({label,children}:{label:string;children?:ReactNode}){return <div className="wk-toolbar"><span className="wk-toolbar-label">{label}</span>{children}</div>;}
function Chip({on,target,children}:{on?:boolean;target?:string;children:ReactNode}){return <span className={`wk-chip${on?' is-on':''}`} data-target={target}>{children}</span>;}
function StatusChip({tone,children}:{tone:'confirmed'|'pending'|'draft'|'blocked';children:ReactNode}){return <span className={`wk-status wk-status-${tone}`}>{children}</span>;}
function Owner({children}:{children:ReactNode}){return <span className="wk-owner">{children}</span>;}
function Wrap({children}:{children:ReactNode}){return <span style={{whiteSpace:'normal',display:'inline-block',lineHeight:1.3}}>{children}</span>;}
function TRow({cols,cells,selected,blocked,target}:{cols:Col[]}&Omit<RowDef,'key'>){return <div className={`wk-row${selected?' is-selected':''}${blocked?' is-blocked':''}`} data-target={target}>{cells.map((c,i)=><div key={i} className="wk-cell" style={{width:cols[i].w}}>{c}</div>)}</div>;}
function Table({cols,rows,addLabel}:{cols:Col[];rows:RowDef[];addLabel:string}){
  return <>
    <div className="wk-thead">{cols.map(c=><div key={c.label} className="wk-th" style={{width:c.w}}>{c.label}</div>)}</div>
    <div className="wk-tbody">{rows.map(({key,...row})=><TRow key={key} cols={cols} {...row}/>)}<div className="wk-row-add">{addLabel}</div></div>
  </>;
}

function Register({active,toolbar,cols,rows,addLabel,footer,inspectorTitle,inspectorBody}:{
  active:number;toolbar?:ReactNode;cols:Col[];rows:RowDef[];addLabel:string;footer:ReactNode;inspectorTitle:string;inspectorBody:ReactNode;
}){
  return <div className="v-surface v-workspace">
    <div className="wk-panel" style={{left:PANEL_X,top:PANEL_Y,width:PANEL_W,height:PANEL_H}}>
      <div className="wk-chrome"><span className="wk-title">Renovation Register</span><span className="wk-chrome-meta">{NAV_ITEMS[active]}</span></div>
      <div className="wk-body">
        <div className="wk-nav" data-review-region="nav">{NAV_ITEMS.map((n,i)=><div key={n} className={`wk-nav-item${i===active?' is-active':''}`}>{n}</div>)}</div>
        <div className="wk-main" data-review-region="table">
          {toolbar}
          <Table cols={cols} rows={rows} addLabel={addLabel}/>
          <div className="wk-footer">{footer}</div>
        </div>
        <div className="wk-inspector" data-review-region="inspector">
          <div className="wk-inspector-head">{inspectorTitle}</div>
          <div className="wk-inspector-body">{inspectorBody}</div>
        </div>
      </div>
    </div>
  </div>;
}

type Scene={active:number;toolbar?:ReactNode;cols:Col[];rows:RowDef[];addLabel:string;footer:ReactNode;inspectorTitle:string;inspectorBody:ReactNode;path:Point[]};

function buildScene(concept:Concept,t:number):Scene{
  const F=facts(concept);
  const active=ACTIVE_NAV[concept.id]??0;
  switch(concept.id){

    case 'capture':{
      const SELECT=1.5,APPLY=4.6;
      const selected=t>=SELECT,applied=t>=APPLY;
      const rows:RowDef[]=[
        {key:'vanity',selected,cells:[<span className="wk-cell-strong">{F['Spec']}</span>,F['Room'],applied?<span className="v-success">Attached</span>:<span className="wk-cell-muted">Not attached</span>,<Owner>Maya</Owner>,<StatusChip tone={applied?'confirmed':'draft'}>{applied?'Confirmed':'Draft'}</StatusChip>]},
        {key:'backsplash',cells:['Backsplash tile','Bathroom','—',<Owner>Maya</Owner>,<StatusChip tone="confirmed">Confirmed</StatusChip>]},
        {key:'faucet',cells:['Faucet','Bathroom','—',<Owner>Dev</Owner>,<StatusChip tone="draft">Draft</StatusChip>]},
        {key:'grout',cells:['Grout','Bathroom','—',<Owner>Sam</Owner>,<StatusChip tone="pending">Pending</StatusChip>]},
      ];
      return{active,toolbar:<Toolbar label="Specs · Bathroom"/>,cols:[{label:'Spec',w:140},{label:'Room',w:90},{label:'Reference',w:116},{label:'Owner',w:64},{label:'Status',w:86}],rows,addLabel:'+ Add spec',
        footer:<>Source: {concept.source}</>,
        inspectorTitle:`Source · ${F['Spec']}`,
        inspectorBody:<>
          <Reveal t={t} at={SELECT} className="wk-cap">Room: <strong>{F['Room']}</strong> · Reference: <strong>{F['Reference']}</strong></Reveal>
          <Reveal t={t} at={SELECT}>{applied?<div className="wk-photo"><Media asset="room" t={t} width={240} height={140}/></div>:<div className="wk-slot" data-target="attach-photo" style={{height:140}}>+ Attach room photo</div>}</Reveal>
          <Reveal t={t} at={APPLY} className="wk-cap">{applied?<>{concept.result}. <strong>{concept.detail}</strong></>:'Select a Spec, then attach the source photo above.'}</Reveal>
        </>,
        path:[P(940,150,0),P(220,rowY(0),SELECT,true,.32),P(820,300,2.9),P(820,270,APPLY,true,.35),P(820,270,8)]};
    }

    case 'prompt':{
      const FILTER=1.3,SELECT=3.0,APPLY=5.6;
      const filtered=t>=FILTER,selected=t>=SELECT,applied=t>=APPLY;
      const all:RowDef[]=[
        {key:'entry',selected,blocked:true,target:'delivery-access',cells:[<Wrap><span className="wk-cell-strong">{F['Entry']}</span></Wrap>,F['Packed dimensions'],<Wrap>{F['Next dependency']}</Wrap>]},
        {key:'tile',cells:['Tile order','8 boxes · confirmed','—']},
        {key:'vanity',cells:['Vanity','On site Sep 12','—']},
        {key:'pendant',cells:['Pendant','8 week lead time','—']},
      ];
      const rows=filtered?[all[0]]:all;
      return{active,toolbar:<Toolbar label="Register · All"><Chip on={filtered} target="filter-blockers">Blockers</Chip></Toolbar>,cols:[{label:'Item',w:170},{label:'Detail',w:190},{label:'Next dependency',w:136}],rows,addLabel:'+ Add task',
        footer:<>Source: {concept.source}</>,
        inspectorTitle:'Blocker · Delivery access',
        inspectorBody:<>
          <div className="wk-cap">{concept.question}</div>
          <Reveal t={t} at={SELECT} className="wk-cap">Next dependency: <strong>{F['Next dependency']}</strong></Reveal>
          <Reveal t={t} at={SELECT}><div className={`wk-btn${applied?' is-done':''}`} data-target="check-access">{applied?concept.result:concept.action}</div></Reveal>
          <Reveal t={t} at={APPLY} className="wk-cap">{applied?concept.detail:''}</Reveal>
        </>,
        path:[P(940,150,0),P(295,80,FILTER,true,.28),P(250,rowY(0),SELECT,true,.3),P(820,256,APPLY,true,.35),P(820,256,8)]};
    }

    case 'recall':{
      const FILTER=1.3,SELECT=3.4;
      const filtered=t>=FILTER,selected=t>=SELECT;
      const all:RowDef[]=[
        {key:'tile',selected,target:'tile-history',cells:[<span className="wk-cell-strong">Tile</span>,'Sam',<Wrap>{F['Reason']}</Wrap>]},
        {key:'vanityfinish',cells:['Vanity finish','Dev','Matches room daylight']},
        {key:'grout',cells:['Grout','—','Draft']},
        {key:'faucet',cells:['Faucet','—','Pending']},
      ];
      const rows=filtered?[all[0],all[1]]:all;
      return{active,toolbar:<Toolbar label="Materials · All"><Chip on={filtered} target="filter-approved">Approved</Chip></Toolbar>,cols:[{label:'Material',w:170},{label:'Approved by',w:120},{label:'Reason',w:206}],rows,addLabel:'+ Add material',
        footer:<>Source: {concept.source}</>,
        inspectorTitle:'Decision history · Tile',
        inspectorBody:<>
          <Reveal t={t} at={SELECT}><div className="wk-photo"><Media asset="sample" t={t} width={240} height={140}/></div></Reveal>
          <Reveal t={t} at={SELECT} className="wk-cap">Finish: <strong>{F['Finish']}</strong></Reveal>
          <Reveal t={t} at={SELECT} className="wk-cap">{F['Reason']}</Reveal>
          <Reveal t={t} at={SELECT} className="wk-cap">{concept.source}</Reveal>
        </>,
        path:[P(940,150,0),P(303,80,FILTER,true,.28),P(230,rowY(0),SELECT,true,.32),P(820,300,8)]};
    }

    case 'walkthrough':{
      const SELECT=1.8;
      const selected=t>=SELECT;
      const rows:RowDef[]=[
        {key:'vanity',selected,target:'open-walkthrough',cells:[<Wrap><span className="wk-cell-strong">{F['Reference']}</span></Wrap>,F['Question for'],<Wrap>{F['Clearance']}</Wrap>]},
        {key:'entry',cells:['Entry access','Maya','Not required']},
        {key:'pendant',cells:['Pendant fixture','Dev','Not required']},
      ];
      return{active,toolbar:<Toolbar label="Site media · Bathroom"/>,cols:[{label:'Reference',w:170},{label:'Question for',w:170},{label:'Clearance',w:156}],rows,addLabel:'+ Add reference',
        footer:<>Source: {concept.source}</>,
        inspectorTitle:'Evidence · Walkthrough',
        inspectorBody:selected?<>
          <div className="wk-photo"><Media asset="room" video="room" t={t} width={240} height={150}/></div>
          <div className="wk-cap">{concept.source}</div>
          <div className="wk-cap"><strong>{concept.question}</strong></div>
          <div className="wk-cap">{concept.detail}</div>
        </>:<div className="wk-empty">Select a reference to open its evidence.</div>,
        path:[P(940,150,0),P(230,rowY(0),SELECT,true,.35),P(820,280,4.5),P(820,280,8)]};
    }

    case 'quantity':{
      const APPLY=2.2;
      const applied=t>=APPLY;
      const [sVal,sPrice]=F['Straight +10%'].split('·').map(s=>s.trim());
      const [hVal,hPrice]=F['Herringbone +15%'].split('·').map(s=>s.trim());
      const rows:RowDef[]=[
        {key:'tile',selected:applied,target:'layout-cell',cells:[<span className="wk-cell-strong">{applied?'Herringbone':'Straight'}</span>,F['Coverage'],
          <span className="v-mono wk-diffrow">{applied?<><span className="wk-diff-old">7</span><span className="wk-diff-new">8</span></>:'7'}</span>,
          <span className="v-mono">{applied?hPrice:sPrice}</span>]},
        {key:'grout',cells:['Grout','Standard','—','—']},
        {key:'underlayment',cells:['Underlayment','Standard','—','—']},
      ];
      return{active,toolbar:<Toolbar label="Quantities · Tile"/>,cols:[{label:'Layout',w:150},{label:'Coverage',w:140},{label:'Boxes',w:70},{label:'Total',w:136}],rows,addLabel:'+ Add line item',
        footer:<>Entered area {F['Entered area']}</>,
        inspectorTitle:'Quantity · Tile',
        inspectorBody:<>
          <div className="wk-cap">Entered area: <strong className="v-mono">{F['Entered area']}</strong> · Coverage: <strong className="v-mono">{F['Coverage']}</strong></div>
          <div className="wk-cap">Straight +10%: <strong className="v-mono">{sVal} · {sPrice}</strong></div>
          <Reveal t={t} at={APPLY} className="wk-cap">Herringbone +15%: <strong className="v-mono">{hVal} · {hPrice}</strong></Reveal>
          <Reveal t={t} at={APPLY} className="wk-cap">{applied?concept.detail:''}</Reveal>
        </>,
        path:[P(940,150,0),P(210,rowY(0),APPLY,true,.35),P(210,rowY(0),8)]};
    }

    case 'sample':{
      const SELECT=1.6,APPLY=4.8;
      const selected=t>=SELECT,applied=t>=APPLY;
      const rows:RowDef[]=[
        {key:'tile',selected,cells:[<span className="wk-cell-strong">{F['Material']}</span>,F['Light'],<StatusChip tone={applied?'confirmed':'pending'}>{applied?F['Decision']:'Under review'}</StatusChip>]},
        {key:'grout',cells:['Grout','—',<StatusChip tone="draft">Not started</StatusChip>]},
        {key:'vanityfinish',cells:['Vanity finish','Window daylight',<StatusChip tone="confirmed">Confirmed</StatusChip>]},
      ];
      return{active,toolbar:<Toolbar label="Materials · Bathroom"/>,cols:[{label:'Material',w:180},{label:'Light',w:150},{label:'Decision',w:166}],rows,addLabel:'+ Add material',
        footer:<>Source: {concept.source}</>,
        inspectorTitle:'Sample · Daylight',
        inspectorBody:selected?<>
          <div style={{display:'flex',gap:8}}><Media video="sample" asset="sample" t={t} width={140} height={110}/><Media asset="room" t={t} width={92} height={110}/></div>
          <div className="wk-cap">{F['Material']} in {F['Light'].toLowerCase()}.</div>
          <div className={`wk-btn${applied?' is-done':''}`} data-target="approve-finish">{applied?concept.result:concept.action}</div>
          <Reveal t={t} at={APPLY} className="wk-cap">{applied?concept.detail:''}</Reveal>
        </>:<div className="wk-empty">Select the sample to compare it with room light.</div>,
        path:[P(940,150,0),P(220,rowY(0),SELECT,true,.3),P(820,329,APPLY,true,.35),P(820,329,8)]};
    }

    case 'quote':{
      const APPLY=3.1;
      const applied=t>=APPLY;
      const rows:RowDef[]=[
        {key:'start',selected:applied,target:'start-window-field',cells:[applied?<span className="wk-cell-strong">{F['Start window']}</span>:<Unknown/>,applied?F['Condition']:<Unknown/>,<span className="wk-cell-muted">{F['Attribution']}</span>]},
        {key:'vanity',cells:['Delivery Sep 12','—','Maya']},
        {key:'punch',cells:['Punch list','Not scheduled','—']},
      ];
      return{active,toolbar:<Toolbar label="Schedule · Bathroom"/>,cols:[{label:'Start window',w:160},{label:'Condition',w:196},{label:'Attribution',w:140}],rows,addLabel:'+ Add milestone',
        footer:<>Source: {concept.source}</>,
        inspectorTitle:'Call transcript · Dev',
        inspectorBody:<>
          <div className="wk-cap">"We can start <span className="wk-phrase" data-target="transcript-phrase">the week of October 12, once the vanity is on site</span>."</div>
          <Reveal t={t} at={APPLY} className="wk-cap">{applied?<>Saved to <strong>Start window</strong> with its condition kept.</>:''}</Reveal>
        </>,
        path:[P(940,150,0),P(820,230,1.8,true,1.3),P(200,rowY(0),APPLY),P(200,rowY(0),8)]};
    }

    case 'clearance':{
      const SELECT=2.0;
      const selected=t>=SELECT;
      const [doorVal,doorSrc]=F['Door opening'].split('·').map(s=>s.trim());
      const rows:RowDef[]=[
        {key:'door',selected,target:'door-hotspot',cells:[<span className="v-mono wk-cell-strong">{doorVal}</span>,<Unknown/>,<Wrap>{F['Evidence']}</Wrap>]},
        {key:'threshold',cells:['Threshold gap',<Unknown/>,'—']},
        {key:'rail',cells:['Stair rail',<Unknown/>,'—']},
      ];
      return{active,toolbar:<Toolbar label="Site media · Entry"/>,cols:[{label:'Door opening',w:190},{label:'Landing depth',w:166},{label:'Evidence',w:140}],rows,addLabel:'+ Add dimension',
        footer:<>Source: {concept.source}</>,
        inspectorTitle:'Measurement · Door opening',
        inspectorBody:selected?<>
          <div className="wk-photo"><Media asset="entry" t={t} width={240} height={150}/></div>
          <div className="wk-cap">{concept.source}</div>
          <div className="wk-cap">Confirmed: <strong className="v-mono">{doorVal}</strong> · {doorSrc}</div>
          <div className="wk-cap">{concept.detail}</div>
        </>:<div className="wk-empty">Select a dimension to inspect its source.</div>,
        path:[P(940,150,0),P(210,rowY(0),SELECT,true,.35),P(820,300,8)]};
    }

    case 'leadtime':{
      const TOGGLE=1.4,MARK=4.0;
      const timeline=t>=TOGGLE,marked=t>=MARK;
      const listRows:RowDef[]=[{key:'pendant',cells:[<span className="v-mono">{F['If ordered']}</span>,<span className="v-mono">{F['Lead time']}</span>,<span className="v-mono">{F['Estimated arrival']}</span>,<span className="v-mono">{F['Plumber booked']}</span>]}];
      const timelineRow:RowDef[]=[{key:'timeline',cells:[
        <div style={{width:'100%',padding:'22px 6px'}}>
          <div className="wk-timeline-track">
            <div className="wk-timeline-fill" style={{width:'50%'}}/>
            <div className="wk-timeline-marker" style={{left:'0%'}}/>
            <div className="wk-timeline-label" style={{left:'0%'}}>Ordered {F['If ordered']}</div>
            <div className="wk-timeline-marker" style={{left:'50%'}}/>
            <div className="wk-timeline-label" style={{left:'50%'}}>Plumber {F['Plumber booked']}</div>
            <div className="wk-timeline-marker is-late" data-target="arrival-marker" style={{left:'100%'}}/>
            <div className="wk-timeline-label" style={{left:'85%'}}>Arrival {F['Estimated arrival']}</div>
          </div>
          <Reveal t={t} at={MARK} style={{marginTop:36}} className="wk-timeline-delta">{marked?concept.result:''}</Reveal>
        </div>
      ]}];
      return{active,toolbar:<Toolbar label="Schedule · Pendant"><Chip on={timeline} target="timeline-toggle">Timeline</Chip></Toolbar>,
        cols:timeline?[{label:'Schedule',w:496}]:[{label:'If ordered',w:130},{label:'Lead time',w:120},{label:'Estimated arrival',w:130},{label:'Plumber booked',w:116}],
        rows:timeline?timelineRow:listRows,addLabel:'+ Add fixture',
        footer:<>Source: {concept.source}</>,
        inspectorTitle:'Schedule · Pendant',
        inspectorBody:<>
          <div className="wk-cap">If ordered <strong className="v-mono">{F['If ordered']}</strong> · lead time <strong className="v-mono">{F['Lead time']}</strong></div>
          <div className="wk-cap">Estimated arrival <strong className="v-mono">{F['Estimated arrival']}</strong></div>
          <div className="wk-cap">Plumber booked <strong className="v-mono">{F['Plumber booked']}</strong></div>
          <Reveal t={t} at={MARK} className="wk-cap">{marked?concept.detail:''}</Reveal>
        </>,
        path:[P(940,150,0),P(336,80,TOGGLE,true,.28),P(646,155,MARK,true,.32),P(646,155,8)]};
    }

    case 'substitution':{
      const APPLY=3.2;
      const applied=t>=APPLY;
      const [dropVal]=F['Drop'].split('·').map(s=>s.trim());
      const [finVal]=F['Finish'].split('·').map(s=>s.trim());
      const realRows:RowDef[]=[
        {key:'drop',cells:['Drop',dropVal,dropVal]},
        {key:'finish',cells:['Finish',finVal,finVal]},
        {key:'temperature',cells:['Colour temp',<span className="v-mono">{F['Target colour temp']}</span>,<span style={{display:'flex',alignItems:'center',gap:8}}><Unknown/><span className="wk-compare-q" data-target="ask-colour-temp">?</span></span>]},
      ];
      return{active,toolbar:<Toolbar label="Orders · Pendant"/>,cols:[{label:'Attribute',w:110},{label:'Spec',w:193},{label:'Alternative',w:193}],rows:realRows,addLabel:'+ Add attribute',
        footer:<>Source: {concept.source}</>,
        inspectorTitle:'Compare · Pendant',
        inspectorBody:<>
          <div className="wk-cap">Drop: <strong>{dropVal}</strong> · Finish: <strong>{finVal}</strong> both match the Spec.</div>
          <div className="wk-cap">Target colour temp: <strong className="v-mono">{F['Target colour temp']}</strong></div>
          <Reveal t={t} at={APPLY}><div className={`wk-btn${applied?' is-done':''}`} data-target="ask-colour-temp">{applied?concept.result:concept.action}</div></Reveal>
          <Reveal t={t} at={APPLY} className="wk-cap">{applied?concept.detail:''}</Reveal>
        </>,
        path:[P(940,150,0),P(230,rowY(0),1.2),P(596,rowY(2),APPLY,true,.32),P(596,rowY(2),8)]};
    }

    case 'signoff':{
      const DEV=1.6,SAM=4.4;
      const devDone=t>=DEV,samDone=t>=SAM;
      const rows:RowDef[]=[
        {key:'pendant',selected:devDone||samDone,cells:['Pendant swap',
          devDone?<StatusChip tone="confirmed">Dev confirmed</StatusChip>:<div className="wk-btn" data-target="dev-approve">Confirm fit</div>,
          samDone?<StatusChip tone="confirmed">Sam approved {F['Budget change']}</StatusChip>:devDone?<div className="wk-btn" data-target="sam-approve">Approve {F['Budget change']}</div>:<span className="wk-cell-muted">Awaiting Dev</span>]},
        {key:'tile',cells:['Tile order',<StatusChip tone="confirmed">Confirmed</StatusChip>,<StatusChip tone="confirmed">Confirmed</StatusChip>]},
        {key:'vanity',cells:['Vanity',<StatusChip tone="confirmed">Confirmed</StatusChip>,<StatusChip tone="pending">Pending</StatusChip>]},
      ];
      return{active,toolbar:<Toolbar label="Approvals · Bathroom"/>,cols:[{label:'Item',w:166},{label:'Dev · install',w:165},{label:'Sam · budget',w:165}],rows,addLabel:'+ Add change',
        footer:<>Source: {concept.source}</>,
        inspectorTitle:'Audit trail · Pendant swap',
        inspectorBody:<>
          <div className="wk-audit-item"><span className="wk-audit-dot is-done"/>Budget change proposed: {F['Budget change']}</div>
          <Reveal t={t} at={DEV}><div className="wk-audit-item"><span className={`wk-audit-dot${devDone?' is-done':''}`}/>Dev confirmed installation fit</div></Reveal>
          <Reveal t={t} at={SAM}><div className="wk-audit-item"><span className={`wk-audit-dot${samDone?' is-done':''}`}/>Sam approved {F['Budget change']} budget change</div></Reveal>
          <div className="wk-cap">{concept.detail}</div>
        </>,
        path:[P(940,150,0),P(410,rowY(0),DEV,true,.3),P(577,rowY(0),SAM,true,.32),P(577,rowY(0),8)]};
    }

    case 'delivery':{
      const SELECT=1.6,APPLY=4.6;
      const selected=t>=SELECT,applied=t>=APPLY;
      const [stepsVal]=F['Steps'].split('·').map(s=>s.trim());
      const rows:RowDef[]=[
        {key:'entry',selected,cells:[<span className="v-mono">{stepsVal}</span>,F['Landing'],<Wrap><span className="v-warning">{F['Packed dimensions']}</span></Wrap>]},
        {key:'threshold',cells:['—','—','—']},
        {key:'crate',cells:['Vanity crate','—',<StatusChip tone="draft">Not confirmed</StatusChip>]},
      ];
      return{active,toolbar:<Toolbar label="Delivery · Entry"/>,cols:[{label:'Steps',w:130},{label:'Landing',w:140},{label:'Packed dimensions',w:226}],rows,addLabel:'+ Add access note',
        footer:<>Source: {concept.source}</>,
        inspectorTitle:'Access note · Entry',
        inspectorBody:selected?<>
          <div className="wk-photo"><Media asset="entry" t={t} width={240} height={140} style={{objectFit:'contain'}}/></div>
          <Reveal t={t} at={SELECT} className="wk-cap">{F['Steps']}. Landing: {F['Landing']}. Packed dimensions: {F['Packed dimensions']}.</Reveal>
          <div className={`wk-btn${applied?' is-done':''}`} data-target="attach-note">{applied?concept.result:concept.action}</div>
          <Reveal t={t} at={APPLY} className="wk-cap">{applied?concept.detail:''}</Reveal>
        </>:<div className="wk-empty">Select the entry to attach its access note.</div>,
        path:[P(940,150,0),P(220,rowY(0),SELECT,true,.3),P(820,377,APPLY,true,.35),P(820,377,8)]};
    }

    case 'installerpack':{
      const CHECK1=1.3,CHECK2=3.0,APPLY=5.4;
      const c1=t>=CHECK1,c2=t>=CHECK2,applied=t>=APPLY;
      const rows:RowDef[]=[
        {key:'tile',target:'select-tile',cells:[<span className="wk-check-row"><span className={`wk-check${c1?' is-checked':''}`}>{c1?'✓':''}</span> Tile</span>,F['Tile'],<StatusChip tone="confirmed">Confirmed</StatusChip>]},
        {key:'vanity',target:'select-vanity',cells:[<span className="wk-check-row"><span className={`wk-check${c2?' is-checked':''}`}>{c2?'✓':''}</span> Vanity</span>,F['Vanity'],<StatusChip tone="confirmed">Confirmed</StatusChip>]},
        {key:'mirror',blocked:true,cells:[<span className="wk-cell-muted">Mirror width</span>,<span className="wk-cell-muted">{F['Mirror width']}</span>,<StatusChip tone="blocked">Unresolved</StatusChip>]},
        {key:'backsplash',cells:['Backsplash tile','—',<StatusChip tone="draft">Draft</StatusChip>]},
      ];
      return{active,toolbar:<Toolbar label="Specs · Confirmed"/>,cols:[{label:'Item',w:196},{label:'Quantity',w:150},{label:'Status',w:150}],rows,addLabel:'+ Add spec',
        footer:<>Source: {concept.source}</>,
        inspectorTitle:'Installer pack',
        inspectorBody:<>
          <div className="wk-cap">{c1&&c2?'2 confirmed Specs selected.':c1?'1 confirmed Spec selected.':'Select confirmed Specs to include.'}</div>
          <div className={`wk-btn${applied?' is-done':''}`} data-target="prepare-pack">{applied?concept.result:concept.action}</div>
          <Reveal t={t} at={APPLY}>{applied?<div className="wk-pack">
            <div className="wk-pack-line"><span>Tile</span><span className="v-mono">{F['Tile']}</span></div>
            <div className="wk-pack-line"><span>Vanity</span><span className="v-mono">{F['Vanity']}</span></div>
            <div className="wk-pack-flag">Mirror width — {F['Mirror width']}</div>
          </div>:null}</Reveal>
          <Reveal t={t} at={APPLY} className="wk-cap">{applied?concept.detail:''}</Reveal>
        </>,
        path:[P(940,150,0),P(170,rowY(0),CHECK1,true,.28),P(170,rowY(1),CHECK2,true,.28),P(820,187,APPLY,true,.35),P(820,187,8)]};
    }

    case 'receipt':{
      const ATTACH=1.6,APPLY=4.2;
      const attached=t>=ATTACH,applied=t>=APPLY;
      const rows:RowDef[]=[
        {key:'pendant',selected:attached,target:'attach-receipt',cells:[<span className="wk-cell-strong">{F['Receipt']}</span>,attached?<span className="v-success">Receipt attached</span>:<span className="wk-slot" style={{height:32,display:'inline-flex',padding:'4px 10px'}}>+ Attach receipt</span>,<Wrap>{F['Return eligibility']}</Wrap>]},
        {key:'tile',cells:['Tile order','—','—']},
        {key:'vanity',cells:['Vanity','—','—']},
      ];
      return{active,toolbar:<Toolbar label="Orders · Pendant"/>,cols:[{label:'Receipt',w:150},{label:'Evidence',w:176},{label:'Return eligibility',w:170}],rows,addLabel:'+ Add order',
        footer:<>Source: {concept.source}</>,
        inspectorTitle:'Return check · Pendant',
        inspectorBody:<>
          <div className="wk-cap">{concept.question}</div>
          <div className={`wk-btn${applied?' is-done':''}`} data-target="check-return">{applied?concept.result:concept.action}</div>
          <Reveal t={t} at={APPLY}>{applied?<>
            <div className="wk-checklist-item"><span className="wk-audit-dot is-done"/>Receipt attached to order</div>
            <div className="wk-checklist-item"><span className="wk-audit-dot"/>Supplier return policy: <Unknown/></div>
          </>:null}</Reveal>
          <Reveal t={t} at={APPLY} className="wk-cap">{applied?concept.detail:''}</Reveal>
        </>,
        path:[P(940,150,0),P(350,rowY(0),ATTACH,true,.3),P(820,205,APPLY,true,.35),P(820,205,8)]};
    }

    default:{
      throw new Error(`Unsupported workspace concept: ${concept.id}`);
    }
  }
}

export function Workspace({concept,t}:SceneProps){
  const scene=buildScene(concept,t);
  return <Frame direction="workspace" concept={concept} t={t} path={scene.path}>
    <Register active={scene.active} toolbar={scene.toolbar} cols={scene.cols} rows={scene.rows} addLabel={scene.addLabel} footer={scene.footer} inspectorTitle={scene.inspectorTitle} inspectorBody={scene.inspectorBody}/>
  </Frame>;
}
