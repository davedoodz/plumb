import { cp, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL(".", import.meta.url));
await mkdir(`${root}out/interactions`, { recursive: true });
await cp(`${root}interactions`, `${root}out/interactions`, { recursive: true });
await cp(`${root}public/pilot-assets`, `${root}out/interactions/media`, {
  recursive: true,
});
console.log("Published interactive studies: out/interactions/index.html");
