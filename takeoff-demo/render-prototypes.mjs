import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL(".", import.meta.url));
process.chdir(root);
const source = await readFile("src/prototypes/Collection.tsx", "utf8");
const items = [
  ...source.matchAll(
    /id:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*seconds:\s*(\d+)/g,
  ),
].map(([, id, slug, title, seconds]) => ({
  id,
  slug,
  title,
  seconds: Number(seconds),
}));
if (items.length !== 14) throw Error("Expected fourteen prototype definitions");
await mkdir("out/prototypes", { recursive: true });
const serveUrl = await bundle({ entryPoint: root + "src/index.ts" });
const compositions = await getCompositions(serveUrl);
for (const item of items) {
  if (process.argv[2] && item.id !== process.argv[2]) continue;
  const composition = compositions.find((c) => c.id === item.id);
  console.log("Rendering", item.id);
  await renderMedia({
    serveUrl,
    composition,
    outputLocation: `out/prototypes/${item.slug}.mp4`,
    codec: "h264",
    crf: 16,
    pixelFormat: "yuv420p",
    colorSpace: "bt709",
    imageFormat: "png",
    muted: true,
    concurrency: 3,
  });
  console.log("Rendered", item.slug);
}
await writeFile("out/prototypes/manifest.json", JSON.stringify(items, null, 2));
const escape = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
await writeFile(
  "out/prototypes/index.html",
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Takeoff — short prototypes</title><style>body{margin:0;background:#eeefec;color:#242827;font:16px/1.5 system-ui,sans-serif}main{max-width:1280px;margin:auto;padding:64px 32px}h1{font-size:44px;letter-spacing:-.04em;margin:0 0 12px}header p{max-width:680px;color:#606663}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:40px 24px;margin-top:44px}video{display:block;width:100%;aspect-ratio:1;background:#eeefec;border-radius:16px}h2{font-size:17px;margin:14px 0 3px}article p{margin:0;font-size:13px;color:#606663}a{color:inherit}small{font-size:12px}</style><main><header><small>TAKEOFF / INTERACTION STUDIES</small><h1>Fourteen small decisions.</h1><p>Short, original studies of renovation purchasing inside an assistant conversation. Synthetic project imagery and footage generated through Higgsfield. Concept simulations—not working purchasing, messaging, or measurement services.</p><p>Persistent circular cursors show the intended gestures. Silent · 1080 × 1080 · 30 fps · needs David’s eye.</p></header><section>${items.map((p, i) => `<article><video controls muted playsinline preload="none" poster="stills/${p.slug}-end.png" aria-label="${escape(p.title)}" src="${p.slug}.mp4"></video><h2>${String(i + 1).padStart(2, "0")} / ${escape(p.title)}</h2><p>${p.seconds} seconds · <a href="${p.slug}.mp4" download>Download MP4</a></p></article>`).join("")}</section></main></html>`,
);
