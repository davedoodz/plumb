import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const probe = (path) =>
  JSON.parse(
    execFileSync(
      "ffprobe",
      ["-v", "error", "-show_streams", "-show_format", "-of", "json", path],
      { encoding: "utf8" },
    ),
  );
const sampleTimes = [
  2.9, 4.5, 8, 11.6, 12.8, 13.5, 16.5, 18.7, 19.5, 26.5, 28.5, 34.5, 37.5, 38.5,
  44, 46.8, 47.5, 54, 55.2, 57, 57.9,
];
const videos = ["chatgpt", "claude"].map((variant) => {
  const path = `out/takeoff-${variant}.mp4`;
  const metadata = probe(path);
  const [stream] = metadata.streams;
  if (
    metadata.streams.length !== 1 ||
    stream.codec_type !== "video" ||
    stream.codec_name !== "h264" ||
    stream.pix_fmt !== "yuv420p" ||
    stream.color_space !== "bt709" ||
    stream.color_range !== "tv" ||
    stream.width !== 1080 ||
    stream.height !== 1920 ||
    stream.r_frame_rate !== "30/1" ||
    Number(stream.nb_frames) !== 1740 ||
    Number(metadata.format.duration) !== 58
  )
    throw new Error(`Invalid delivery format: ${path}`);
  execFileSync(
    "ffmpeg",
    ["-v", "error", "-xerror", "-i", path, "-f", "null", "-"],
    { stdio: "pipe" },
  );
  const directory = `out/chat-review/${variant}`;
  mkdirSync(directory, { recursive: true });
  const stills = sampleTimes.map((time) => {
    const imagePath = `${directory}/${String(time).replace(".", "-")}.png`;
    execFileSync(
      "ffmpeg",
      [
        "-v",
        "error",
        "-y",
        "-ss",
        String(time),
        "-i",
        path,
        "-frames:v",
        "1",
        imagePath,
      ],
      { stdio: "pipe" },
    );
    return { path: imagePath, time };
  });
  // Lossy H.264 may change decoded pixels even when the source holds still.
  // Measure luminance drift rather than requiring identical PNG hashes.
  const holdFrames = [55.2, 56, 57, 57.9].map((time) =>
    execFileSync("ffmpeg", [
      "-v",
      "error",
      "-ss",
      String(time),
      "-i",
      path,
      "-frames:v",
      "1",
      "-vf",
      "scale=270:480,format=gray",
      "-f",
      "rawvideo",
      "-",
    ]),
  );
  const holdDrift = holdFrames.slice(1).map((frame) => {
    let difference = 0;
    for (let i = 0; i < frame.length; i++)
      difference += Math.abs(frame[i] - holdFrames[0][i]);
    return difference / frame.length;
  });
  if (Math.max(...holdDrift) > 0.25)
    throw new Error(`Final hold changed visibly: ${path}`);
  return {
    path,
    duration: 58,
    frames: 1740,
    width: 1080,
    height: 1920,
    fps: 30,
    codec: "h264",
    audioStreams: 0,
    decoded: true,
    pixelFormat: stream.pix_fmt,
    colorSpace: stream.color_space,
    colorRange: stream.color_range,
    finalHoldMeanLuminanceDrift: holdDrift,
    bytes: statSync(path).size,
    sha256: createHash("sha256").update(readFileSync(path)).digest("hex"),
    stills,
  };
});
writeFileSync(
  "out/chat-verification.json",
  JSON.stringify(
    {
      verifiedAt: new Date().toISOString(),
      prompt: "prompts/astra-chat-ui-variants.md",
      videos,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    videos.map(({ stills, ...video }) => ({
      ...video,
      reviewFrames: stills.length,
    })),
    null,
    2,
  ),
);
