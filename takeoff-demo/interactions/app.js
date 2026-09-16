import { captureTools } from "./capture-tools.js";
import { decisionTools } from "./decision-tools.js";
import { handoffTools } from "./handoff-tools.js";
import { spatialTools } from "./spatial-tools.js";
import { createTools, escape } from "./shared.js";
const order = [
  "capture",
  "prompt",
  "recall",
  "walkthrough",
  "quantity",
  "sample",
  "quote",
  "clearance",
  "leadtime",
  "substitution",
  "signoff",
  "delivery",
  "installerpack",
  "receipt",
];
const all = [
  ...captureTools,
  ...decisionTools,
  ...handoffTools,
  ...spatialTools,
];
const studies = order.map((id) => all.find((item) => item.id === id));
let current = 0;
const results = new Map();
const tools = createTools((summary, detail, attachments) => {
  results.set(studies[current].id, { summary, detail, attachments });
  renderThread();
  const resultCard = document.querySelector(".result-card");
  resultCard.tabIndex = -1;
  resultCard.focus({ preventScroll: true });
  resultCard.scrollIntoView({ block: "nearest" });
  document.querySelector("#completion").textContent =
    "Attached to conversation";
});
const launch = () => studies[current].mount(tools.ctx);
function renderThread() {
  const study = studies[current],
    result = results.get(study.id);
  const media = (result?.attachments || [])
    .filter((a) => /^(data:(image|audio|video)\/|\.\/media\/)/.test(a.url))
    .map((a) =>
      a.kind === "audio"
        ? `<audio controls src="${escape(a.url)}" aria-label="${escape(a.alt || "Recorded field note")}"></audio>`
        : `<img class="tool-image" src="${escape(a.url)}" alt="${escape(a.alt || "Attached evidence")}">`,
    )
    .join("");
  document.querySelector("#thread").innerHTML =
    `<div class="user-bubble">${escape(study.prompt)}</div><p class="assistant-copy">${escape(study.response)}</p><button class="entry-card" id="entry"><small>${escape(study.modality)}</small><strong>${escape(study.entryLabel)} <span aria-hidden="true">↗</span></strong><span>Open interactive tool</span></button>${result ? `<section class="result-card"><strong>${escape(result.summary)}</strong><p>${escape(result.detail)}</p><div class="tool-stack">${media}</div><small>Saved in this local study until reset or reload</small></section>` : `<p class="chat-caption">A working interaction study. You stay in control of what gets attached.</p>`}`;
  document.querySelector("#entry").onclick = launch;
}
function show(index) {
  tools.close();
  current = (index + studies.length) % studies.length;
  const s = studies[current];
  const url = new URL(location.href);
  url.searchParams.set("concept", s.id);
  history.replaceState(null, "", url);
  document
    .querySelectorAll(".concept-link")
    .forEach((el, i) => el.setAttribute("aria-current", String(i === current)));
  document.querySelector("#study-number").textContent =
    `STUDY ${String(current + 1).padStart(2, "0")} / 14`;
  for (const [id, value] of Object.entries({
    modality: s.modality,
    "detail-title": s.title,
    description: s.description,
    boundary: s.boundary,
  })) {
    document.getElementById(id).textContent = value;
  }
  document.querySelector("#steps").innerHTML = s.steps
    .map((t) => `<li>${escape(t)}</li>`)
    .join("");
  document.querySelector("#completion").textContent = results.has(s.id)
    ? "Attached to conversation"
    : "Ready to try";
  renderThread();
}
document.querySelector("#concepts").innerHTML = studies
  .map(
    (s, i) =>
      `<button class="concept-link" data-index="${i}"><span>${String(i + 1).padStart(2, "0")}</span>${escape(s.title)}</button>`,
  )
  .join("");
document
  .querySelectorAll(".concept-link")
  .forEach((el) => (el.onclick = () => show(Number(el.dataset.index))));
document.querySelector("#previous").onclick = () => show(current - 1);
document.querySelector("#next").onclick = () => show(current + 1);
document.querySelector("#reset").onclick = () => {
  results.delete(studies[current].id);
  show(current);
};
document.querySelector("#menu").onclick = () => {
  document
    .querySelector("[aria-current=true]")
    .scrollIntoView({ block: "center", inline: "center" });
  document.querySelector("[aria-current=true]").focus();
};
document.querySelector("#plus").onclick = launch;
document.querySelector("#launch").onclick = launch;
show(
  Math.max(
    0,
    order.indexOf(new URLSearchParams(location.search).get("concept")),
  ),
);
