import { execFileSync } from "node:child_process";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
process.chdir(fileURLToPath(new URL(".", import.meta.url)));
const items = JSON.parse(
  await readFile("out/prototypes/manifest.json", "utf8"),
);
await mkdir("out/prototypes/stills", { recursive: true });
const result = [];
for (const item of items) {
  const file = `out/prototypes/${item.slug}.mp4`;
  const info = JSON.parse(
    execFileSync(
      "ffprobe",
      ["-v", "error", "-show_streams", "-show_format", "-of", "json", file],
      { encoding: "utf8" },
    ),
  );
  const v = info.streams.find((s) => s.codec_type === "video");
  if (
    v.codec_name !== "h264" ||
    v.width !== 1080 ||
    v.height !== 1080 ||
    v.avg_frame_rate !== "30/1" ||
    Number(v.nb_frames) !== item.seconds * 30 ||
    v.pix_fmt !== "yuv420p" ||
    v.color_space !== "bt709" ||
    v.color_range !== "tv" ||
    info.streams.some((s) => s.codec_type === "audio")
  )
    throw Error(`Invalid media contract: ${item.slug}`);
  execFileSync("ffmpeg", ["-v", "error", "-i", file, "-f", "null", "-"], {
    stdio: "pipe",
  });
  for (const [label, seconds] of [
    ["start", 0.8],
    ["gesture", item.seconds * 0.48],
    ["end", item.seconds - 1],
  ])
    execFileSync("ffmpeg", [
      "-v",
      "error",
      "-y",
      "-ss",
      String(seconds),
      "-i",
      file,
      "-frames:v",
      "1",
      `out/prototypes/stills/${item.slug}-${label}.png`,
    ]);
  result.push({
    ...item,
    frames: Number(v.nb_frames),
    width: v.width,
    height: v.height,
    audio: false,
    colour: "BT.709 limited",
    fullDecode: "passed",
    sha256: createHash("sha256")
      .update(await readFile(file))
      .digest("hex"),
  });
  console.log("Verified", item.slug);
}
await writeFile(
  "out/prototypes/verification.json",
  JSON.stringify(
    {
      clips: result,
      totalSeconds: items.reduce((s, i) => s + i.seconds, 0),
      visualReview:
        "See review.json for headless playback and layout inspection.",
    },
    null,
    2,
  ),
);
