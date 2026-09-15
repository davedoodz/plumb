import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
process.chdir(root);

const outDir = "case-study/assets/motion";
await mkdir(outDir, { recursive: true });

console.log("Bundling motion/research/index.ts …");
const serveUrl = await bundle({ entryPoint: root + "motion/research/index.ts" });
const compositions = await getCompositions(serveUrl);
const composition = compositions.find((c) => c.id === "ResearchSummary");
if (!composition) throw Error("ResearchSummary composition not found");

console.log(
  `Rendering ResearchSummary — ${composition.durationInFrames}f @ ${composition.fps}fps (${(
    composition.durationInFrames / composition.fps
  ).toFixed(2)}s), ${composition.width}x${composition.height}`,
);
await renderMedia({
  serveUrl,
  composition,
  outputLocation: `${outDir}/research-summary.mp4`,
  codec: "h264",
  crf: 16,
  pixelFormat: "yuv420p",
  colorSpace: "bt709",
  imageFormat: "jpeg",
  muted: true,
  everyNthFrame: 1,
  x264Preset: "slow",
  concurrency: 3,
});
console.log("Rendered", `${outDir}/research-summary.mp4`);
