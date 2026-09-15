import {bundle} from '@remotion/bundler';
import {getCompositions,renderMedia} from '@remotion/renderer';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
process.chdir(root);
const catalog=JSON.parse(await readFile('src/variants/catalog.json','utf8'));
const items=catalog.directions.flatMap((d,directionIndex)=>catalog.concepts.map(c=>({id:`${d.id}-${c.id}`,direction:d.id,directionName:d.name,concept:c.id,title:c.title,seconds:c.seconds,filename:`${c.slug}-${d.id}.mp4`,poster:`stills/${c.slug}-${d.id}-end.png`,interaction:c.ux[directionIndex]})));
if(items.length!==70||new Set(items.map(i=>i.id)).size!==70)throw Error('Expected 70 unique variants');
const market=JSON.parse(await readFile('src/variants/market-validation.json','utf8'));
if(items.some(item=>!market.entries.some(entry=>entry.id===item.id)))throw Error('Missing market counter-check');
const selector=process.argv[2];
const selected=selector?items.filter(i=>i.direction===selector||i.id===selector):items;
if(selected.length===0)throw Error(`Unknown direction or composition: ${selector}`);
await mkdir('out/variants',{recursive:true});
const serveUrl=await bundle({entryPoint:root+'src/index.ts'});
const comps=await getCompositions(serveUrl);
for(const [index,item]of selected.entries()){
 const composition=comps.find(c=>c.id===item.id);
 if(!composition)throw Error('Missing composition '+item.id);
 console.log(`[${index+1}/${selected.length}] Rendering ${item.id}`);
 await renderMedia({serveUrl,composition,outputLocation:`out/variants/${item.filename}`,codec:'h264',crf:16,pixelFormat:'yuv420p',colorSpace:'bt709',imageFormat:'png',muted:true,concurrency:3});
}
await writeFile('out/variants/manifest.json',JSON.stringify({...catalog,items},null,2));
await copyFile('src/variants/gallery.html','out/variants/index.html');
await copyFile('src/variants/market-validation.json','out/variants/market-validation.json');
console.log(`Rendered ${selected.length} variants. Run node finalize-variants.mjs for media verification and posters.`);
