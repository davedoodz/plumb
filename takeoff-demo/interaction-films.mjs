import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, renderStill } from "@remotion/renderer";
const root = fileURLToPath(new URL(".", import.meta.url));
const source = path.join(root, "src/interaction-films"),
  out = path.join(root, "out/interaction-films");
const catalog = JSON.parse(
  await fs.readFile(path.join(source, "catalog.json"), "utf8"),
);
const command = process.argv[2] || "render",
  filter = process.argv[3];
const items = catalog.map((s, i) => ({
  ...s,
  index: i + 1,
  file: `${String(i + 1).padStart(2, "0")}-${s.id}.mp4`,
  poster: `stills/${s.id}-middle.jpg`,
  seconds: 12,
}));
const selected = items.filter(
  (s) => !filter || filter.split(",").includes(s.id),
);
if (!selected.length) throw Error(`Unknown film: ${filter}`);
await fs.mkdir(path.join(out, "stills"), { recursive: true });
if (command === "render" || command === "stills") {
  const serveUrl = await bundle({ entryPoint: path.join(source, "index.tsx") });
  const comps = await getCompositions(serveUrl);
  for (const item of selected) {
    const composition = comps.find((c) => c.id === `Interaction-${item.id}`);
    if (!composition) throw Error(`Missing composition ${item.id}`);
    if (command === "render") {
      console.log(`Rendering ${item.index}/14: ${item.title}`);
      await renderMedia({
        serveUrl,
        composition,
        codec: "h264",
        outputLocation: path.join(out, item.file),
        crf: 17,
        pixelFormat: "yuv420p",
        colorSpace: "bt709",
        imageFormat: "png",
        muted: true,
        concurrency: 4,
      });
    } else
      for (const [label, frame] of [
        ["start", 45],
        ["middle", 165],
        ["end", 315],
      ]) {
        await renderStill({
          serveUrl,
          composition,
          frame,
          output: path.join(out, "stills", `${item.id}-${label}.jpg`),
          imageFormat: "jpeg",
        });
        console.log(`Storyboard ${item.id} ${label}`);
      }
  }
} else if (command === "verify") {
  const rows = [];
  for (const item of items) {
    const file = path.join(out, item.file);
    const probe = JSON.parse(
      execFileSync(
        "ffprobe",
        ["-v", "error", "-show_streams", "-show_format", "-of", "json", file],
        { encoding: "utf8" },
      ),
    );
    const v = probe.streams.find((s) => s.codec_type === "video");
    if (
      !v ||
      v.codec_name !== "h264" ||
      v.width !== 1080 ||
      v.height !== 1920 ||
      v.r_frame_rate !== "30/1" ||
      Number(v.nb_frames) !== 360 ||
      v.pix_fmt !== "yuv420p" ||
      v.color_space !== "bt709" ||
      probe.streams.some((s) => s.codec_type === "audio")
    )
      throw Error(`Invalid export: ${item.id}`);
    execFileSync("ffmpeg", ["-v", "error", "-i", file, "-f", "null", "-"]);
    for (const [label, time] of [
      ["start", 1.5],
      ["middle", 5.5],
      ["end", 10.5],
    ])
      execFileSync("ffmpeg", [
        "-v",
        "error",
        "-y",
        "-ss",
        String(time),
        "-i",
        file,
        "-frames:v",
        "1",
        "-q:v",
        "2",
        path.join(out, "stills", `${item.id}-${label}.jpg`),
      ]);
    const bytes = await fs.readFile(file);
    rows.push({
      id: item.id,
      file: item.file,
      seconds: Number(probe.format.duration),
      frames: Number(v.nb_frames),
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
    console.log(`Decoded and verified ${item.id}`);
  }
  if (new Set(rows.map((r) => r.sha256)).size !== 14)
    throw Error("Duplicate film exports");
  await fs.writeFile(
    path.join(out, "verification.json"),
    JSON.stringify(
      {
        count: 14,
        totalSeconds: 168,
        width: 1080,
        height: 1920,
        fps: 30,
        fullDecode: true,
        silent: true,
        rows,
      },
      null,
      2,
    ),
  );
} else if (command === "publish") {
  await fs.writeFile(
    path.join(out, "manifest.json"),
    JSON.stringify(
      {
        title: "One interaction. One clear idea.",
        count: 14,
        seconds: 12,
        items,
      },
      null,
      2,
    ),
  );
  await fs.copyFile(
    path.join(source, "gallery.html"),
    path.join(out, "index.html"),
  );
  console.log("Published out/interaction-films/index.html");
} else throw Error(`Unknown command ${command}`);
