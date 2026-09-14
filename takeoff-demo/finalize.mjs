import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const probe = (path) =>
  JSON.parse(
    execFileSync(
      "ffprobe",
      ["-v", "error", "-show_streams", "-show_format", "-of", "json", path],
      { encoding: "utf8" },
    ),
  );
const outputs = [
  ["out/takeoff-75s.mp4", 75, 2250],
  ["out/takeoff-substitution-12s.mp4", 12, 360],
];
const videos = outputs.map(([path, duration, frames]) => {
  const metadata = probe(path);
  const [stream] = metadata.streams;
  if (
    metadata.streams.length !== 1 ||
    stream.codec_type !== "video" ||
    stream.codec_name !== "h264" ||
    stream.width !== 1080 ||
    stream.height !== 1920 ||
    stream.r_frame_rate !== "30/1" ||
    Number(stream.nb_frames) !== frames ||
    Number(metadata.format.duration) !== duration
  )
    throw new Error(`Invalid delivery format: ${path}`);
  execFileSync("ffmpeg", ["-v", "error", "-i", path, "-f", "null", "-"], {
    stdio: "pipe",
  });
  return {
    path,
    duration,
    frames,
    width: 1080,
    height: 1920,
    fps: 30,
    codec: "h264",
    audioStreams: 0,
    bytes: statSync(path).size,
    sha256: createHash("sha256").update(readFileSync(path)).digest("hex"),
  };
});
mkdirSync("out/stills", { recursive: true });
const stills = [
  ["01-takeoff", 11.6],
  ["02-sample", 24.5],
  ["03-lead-time", 35],
  ["04-substitution", 45],
  ["05-sign-off", 60],
  ["06-order-thread", 68],
].map(([name, time]) => {
  const path = `out/stills/${name}.png`;
  execFileSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-y",
      "-ss",
      String(time),
      "-i",
      outputs[0][0],
      "-frames:v",
      "1",
      path,
    ],
    { stdio: "pipe" },
  );
  const {
    streams: [image],
  } = probe(path);
  if (image.width !== 1080 || image.height !== 1920)
    throw new Error(`Invalid still dimensions: ${path}`);
  return { path, time, width: image.width, height: image.height };
});
const report = {
  verifiedAt: new Date().toISOString(),
  videos,
  stills,
  decisions: {
    duration: "75 seconds; closing hold shortened to three seconds",
    herringbone:
      "15% waste rounds to 7 boxes; a separately labelled extra layout box gives 8 boxes / 84 ft² / $1,596",
    tileDelivery:
      "5–19 October range crosses 12 October plumber visit; shown as risk",
    missingColourTemperature: "Blank dashed orange field; no invented value",
    rowTiming: "250ms row settle plus 500ms hold before next row",
    tileImage:
      "Locally authored SVG material visualization, not a supplier photograph",
  },
  skills: [
    "https://skills.sh/remotion-dev/skills/remotion-best-practices",
    "interface-craft",
    "web-animation-design",
    "vercel-react-best-practices",
  ],
};
writeFileSync("out/verification.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
