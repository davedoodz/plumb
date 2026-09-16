import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {bundle} from '@remotion/bundler';
import {getCompositions,renderMedia} from '@remotion/renderer';
const root=process.cwd(),source=path.join(root,'src/chatgpt-studies'),out=path.join(root,'out/chatgpt-studies');
const json=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const catalog=await json(path.join(source,'catalog.json'));
const studies=[...await json(path.join(source,'scenarios-a.json')),...await json(path.join(source,'scenarios-b.json'))];
const ids=new Set(studies.map(s=>s.id));
if(studies.length!==70||ids.size!==70)throw Error('Expected 70 unique conversation studies');
for(const [ci,c] of catalog.concepts.entries())for(const [mi,m] of catalog.modes.entries()){
 const s=studies.find(s=>s.id===`gpt-${c.id}-${m.id}`);
 if(!s||s.concept!==c.id||s.mode!==m.id||s.category!==catalog.categories[(ci+mi)%4])throw Error(`Invalid concept-mode mapping: ${c.id}/${m.id}`);
 if(s.evidence.length!==3||!s.boundary||!s.marketPains.length)throw Error(`Missing evidence or market boundary: ${s.id}`);
 if(s.mode==='compare'&&(!s.compareMedia||s.compareLabels?.length!==2))throw Error(`Missing comparison: ${s.id}`);
}
await fs.mkdir(out,{recursive:true});
const items=studies.map(s=>({...s,filename:`${s.id}.mp4`,poster:`stills/${s.id}-end.png`,seconds:catalog.seconds}));
const market=await json(path.join(source,'market-validation.json'));
if(market.entries.length!==70||!market.exactSourceReviewed)throw Error('Exact-source 70-pair market gate is incomplete');
const command=process.argv[2]||'render',filter=process.argv[3];
if(command==='render'){
 const selected=items.filter(s=>!filter||s.id===filter||s.concept===filter||s.mode===filter||s.category===filter);
 if(!selected.length)throw Error(`No matching study: ${filter}`);
 for(const s of selected)for(const file of [s.media,s.video,s.compareMedia].filter(Boolean))await fs.access(path.join(root,'public/pilot-assets',file));
 const serveUrl=await bundle({entryPoint:path.join(root,'src/index.ts')});
 const comps=await getCompositions(serveUrl);
 for(const [i,s] of selected.entries()){
  const composition=comps.find(c=>c.id===s.id);if(!composition)throw Error(`Missing composition: ${s.id}`);
  console.log(`[${i+1}/${selected.length}] ${s.id}`);
  await renderMedia({serveUrl,composition,codec:'h264',outputLocation:path.join(out,s.filename),crf:17,pixelFormat:'yuv420p',colorSpace:'bt709',imageFormat:'png',muted:true,concurrency:3});
 }
 console.log(`Rendered ${selected.length} conversation studies`);
}else if(command==='verify'){
 for(const s of items)for(const file of [s.media,s.video,s.compareMedia].filter(Boolean))await fs.access(path.join(root,'public/pilot-assets',file));
 await fs.mkdir(path.join(out,'stills'),{recursive:true});const rows=[];
 for(const s of items){
  const file=path.join(out,s.filename);const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',file],{encoding:'utf8'}));
  const v=probe.streams.find(x=>x.codec_type==='video');
  if(!v||v.codec_name!=='h264'||v.width!==1080||v.height!==1920||v.r_frame_rate!=='30/1'||Number(v.nb_frames)!==480||v.pix_fmt!=='yuv420p'||v.color_space!=='bt709'||probe.streams.some(x=>x.codec_type==='audio'))throw Error(`Invalid export contract: ${s.id}`);
  execFileSync('ffmpeg',['-v','error','-i',file,'-f','null','-']);
  for(const [label,t] of [['start',2],['middle',7],['end',14]])execFileSync('ffmpeg',['-v','error','-y','-ss',String(t),'-i',file,'-frames:v','1',path.join(out,'stills',`${s.id}-${label}.png`)]);
  const sha256=createHash('sha256').update(await fs.readFile(file)).digest('hex');rows.push({id:s.id,duration:Number(probe.format.duration),frames:Number(v.nb_frames),sha256});console.log(`Verified ${s.id}`);
 }
 if(new Set(rows.map(r=>r.sha256)).size!==70)throw Error('Duplicate export bytes');
 await fs.writeFile(path.join(out,'verification.json'),JSON.stringify({count:rows.length,totalSeconds:rows.reduce((n,r)=>n+r.duration,0),fullDecode:true,width:1080,height:1920,fps:30,silent:true,rows},null,2));
 await fs.cp(path.join(root,'public/pilot-assets'),path.join(out,'assets'),{recursive:true});
 await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify({...catalog,items},null,2));
 await fs.copyFile(path.join(source,'gallery.html'),path.join(out,'index.html'));
 for(const file of ['market-validation.json','design-reference.json','interface-verification.json','media-verification.json'])await fs.copyFile(path.join(source,file),path.join(out,file));
 console.log('Verified 70 distinct exports and copied generated media library');
}else throw Error(`Unknown command: ${command}`);
