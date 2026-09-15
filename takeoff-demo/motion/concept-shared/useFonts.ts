import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { fontFamily } from "./theme";

const FACES: Array<{ weight: number; file: string }> = [
  { weight: 400, file: "beatrice-regular.ttf" },
  { weight: 500, file: "beatrice-medium.ttf" },
  { weight: 600, file: "beatrice-semibold.ttf" },
  { weight: 700, file: "beatrice-bold.ttf" },
];

let installed = false;

// Loads the Beatrice family (reused from case-study/assets/fonts via
// --public-dir) as real @font-face rules and blocks the Remotion frame
// capture until every weight has finished loading, so no frame renders
// with a fallback font.
export function useBeatrice() {
  const [ready, setReady] = useState(installed);

  useEffect(() => {
    if (installed) return;
    const handle = delayRender("loading Beatrice font family");
    const style = document.createElement("style");
    style.textContent = FACES.map(
      ({ weight, file }) => `
      @font-face {
        font-family: "${fontFamily}";
        src: url("${staticFile(`fonts/${file}`)}") format("truetype");
        font-weight: ${weight};
        font-style: normal;
        font-display: block;
      }`,
    ).join("\n");
    document.head.appendChild(style);

    Promise.all(
      FACES.map(({ weight }) =>
        document.fonts.load(`${weight} 48px "${fontFamily}"`),
      ),
    )
      .then(() => document.fonts.ready)
      .then(() => {
        installed = true;
        setReady(true);
        continueRender(handle);
      })
      .catch(() => {
        installed = true;
        setReady(true);
        continueRender(handle);
      });
  }, []);

  return ready;
}
