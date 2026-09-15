import {execFileSync} from 'node:child_process';
import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('.',import.meta.url)));
const {items,concepts,directions}=JSON.parse(await readFile('out/variants/manifest.json','utf8'));
if(items.length!==70||concepts.length!==14||directions.length!==5)throw Error('Incomplete variant matrix');
await mkdir('out/variants/stills',{recursive:true});
const results=[];
for(const item of items){
 const path=`out/variants/${item.filename}`;
 const metadata=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',path],{encoding:'utf8'}));
 const v=metadata.streams.find(s=>s.codec_type==='video');
 if(!v||v.codec_name!=='h264'||v.width!==1080||v.height!==1080||v.avg_frame_rate!=='30/1'||Number(v.nb_frames)!==item.seconds*30||v.pix_fmt!=='yuv420p'||v.color_space!=='bt709'||v.color_range!=='tv'||metadata.streams.some(s=>s.codec_type==='audio'))throw Error('Media contract failed: '+item.id);
 execFileSync('ffmpeg',['-v','error','-i',path,'-f','null','-'],{stdio:'pipe'});
 const stem=item.filename.replace('.mp4','');
 for(const [label,time]of [['start',1.5],['middle',6],['end',10.5]])execFileSync('ffmpeg',['-v','error','-y','-ss',String(time),'-i',path,'-frames:v','1',`out/variants/stills/${stem}-${label}.png`]);
 results.push({id:item.id,file:item.filename,frames:Number(v.nb_frames),seconds:item.seconds,width:v.width,height:v.height,codec:v.codec_name,colour:'BT.709 limited',audio:false,fullDecode:true,sha256:createHash('sha256').update(await readFile(path)).digest('hex')});
 console.log('Verified',item.id);
}
if(new Set(results.map(r=>r.sha256)).size!==70)throw Error('Duplicate exports found');
await writeFile('out/variants/verification.json',JSON.stringify({count:results.length,totalSeconds:results.reduce((s,r)=>s+r.seconds,0),results},null,2));
await copyFile('src/variants/gallery.html','out/variants/index.html');
