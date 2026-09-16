import { config } from "@remotion/eslint-config-flat";

const browserGlobals = Object.fromEntries(
  [
    "document",
    "window",
    "navigator",
    "location",
    "history",
    "innerHeight",
    "devicePixelRatio",
    "URL",
    "URLSearchParams",
    "Blob",
    "FileReader",
    "MediaRecorder",
    "ResizeObserver",
    "fetch",
    "console",
    "setTimeout",
    "clearInterval",
  ].map((name) => [name, "readonly"]),
);

export default [
  ...config,
  {
    files: ["interactions/**/*.js"],
    languageOptions: { globals: browserGlobals },
  },
  {
    files: ["interactions.mjs"],
    languageOptions: { globals: { URL: "readonly", console: "readonly" } },
  },
];
