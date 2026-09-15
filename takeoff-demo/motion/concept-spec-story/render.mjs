#!/usr/bin/env node
// Standalone render for the Spec Story film. Does not touch src/Root.tsx or
// package.json — bundles this directory's own entry point directly with
// the project's installed Remotion CLI.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..", "..");
const remotionBin = path.join(projectRoot, "node_modules", ".bin", "remotion");
const entry = path.join(here, "index.tsx");
const publicDir = path.join(projectRoot, "case-study", "assets");
const out = path.join(
  projectRoot,
  "case-study",
  "assets",
  "motion",
  "spec-story.mp4",
);

execFileSync(
  remotionBin,
  [
    "render",
    entry,
    "SpecStory",
    out,
    "--public-dir",
    publicDir,
    "--codec=h264",
    "--pixel-format=yuv420p",
    "--crf=16",
    "--image-format=png",
    "--x264-preset=slow",
    "--muted",
    "--overwrite",
  ],
  { stdio: "inherit", cwd: projectRoot },
);

// Ensure a faststart moov atom regardless of the Remotion build's default.
const tmp = out + ".tmp.mp4";
execFileSync(
  "ffmpeg",
  ["-y", "-i", out, "-c", "copy", "-movflags", "+faststart", tmp],
  { stdio: "inherit" },
);
execFileSync("mv", [tmp, out]);

console.log(`Rendered ${out}`);
