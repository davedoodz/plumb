import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL(".", import.meta.url));
for (const [composition, variant] of [
  ["TakeoffChatGPT", "chatgpt"],
  ["TakeoffClaude", "claude"],
]) {
  execFileSync(
    "npx",
    [
      "--no-install",
      "remotion",
      "render",
      "src/index.ts",
      composition,
      `out/takeoff-${variant}.mp4`,
      "--codec=h264",
      "--crf=16",
      "--pixel-format=yuv420p",
      "--color-space=bt709",
      "--image-format=png",
      "--muted",
      "--concurrency=3",
    ],
    { cwd, stdio: "inherit" },
  );
}
execFileSync(process.execPath, ["finalize-chat.mjs"], {
  cwd,
  stdio: "inherit",
});
