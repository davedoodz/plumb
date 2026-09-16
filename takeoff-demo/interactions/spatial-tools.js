import { pendantViewer } from "./viewer.js";
export const spatialTools = [
  {
    id: "quantity",
    title: "Measure the plan",
    modality: "Spatial takeoff",
    prompt: "How many boxes do I need for this room?",
    response:
      "Let’s make the assumptions visible. Adjust the room, subtract the opening, then choose an allowance.",
    entryLabel: "Open editable takeoff",
    description:
      "A quantity is a small model, not just an answer. Change the dimensions and watch the purchase quantity follow.",
    steps: [
      "Set measured dimensions.",
      "Subtract what will not be tiled.",
      "Attach the calculation and assumptions.",
    ],
    boundary:
      "Dimensions are entered by you. The reference plan is not measured from a photo; this does not certify installation suitability.",
    mount(ctx) {
      ctx.open(
        "Room takeoff",
        "Sample tile · 1.44 m² per box",
        `<div class="tool-stack"><div class="spatial-plan"><svg viewBox="0 0 320 210" role="img" aria-label="Editable rectangular room plan"><defs><pattern id="tiles" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#eae8e1" stroke="#fff"/></pattern></defs><rect id="room-plan" x="45" y="25" width="230" height="145" fill="url(#tiles)" stroke="#444"/><rect id="exclusion" x="45" y="25" width="60" height="48" fill="#fff" stroke="#888" stroke-dasharray="4 3"/><text id="plan-label" x="160" y="195" text-anchor="middle"></text></svg></div><div class="tool-grid"><label class="tool-label">Length (m)<input id="length" type="number" min="0.1" max="100" step="0.1" value="4.8"></label><label class="tool-label">Width (m)<input id="width" type="number" min="0.1" max="100" step="0.1" value="3.6"></label></div><label class="tool-copy"><input type="checkbox" id="subtract" checked> Exclude fixed cabinet footprint · 1.2 m²</label><label class="tool-label">Cutting allowance <output id="waste-label">10%</output><input id="waste" type="range" min="0" max="25" value="10"></label><div class="spatial-total"><span id="boxes"></span><p id="formula"></p></div><p class="tool-note">Enter verified site dimensions. Allowance is a planning choice, not an installer recommendation.</p><button id="quantity-attach" class="tool-primary">Attach takeoff</button></div>`,
      );
      let result = "";
      const update = () => {
        const l = Number(ctx.panel.querySelector("#length").value),
          w = Number(ctx.panel.querySelector("#width").value),
          cut = ctx.panel.querySelector("#subtract").checked ? 1.2 : 0,
          waste = Number(ctx.panel.querySelector("#waste").value),
          net = l * w - cut,
          valid = l > 0 && w > 0 && l <= 100 && w <= 100 && net > 0;
        ctx.panel.querySelector("#quantity-attach").disabled = !valid;
        ctx.panel.querySelector("#waste-label").textContent = `${waste}%`;
        ctx.panel.querySelector("#exclusion").style.display = cut ? "" : "none";
        ctx.panel.querySelector("#plan-label").textContent = `${l} × ${w} m`;
        const ratio = l / w;
        ctx.panel
          .querySelector("#room-plan")
          .setAttribute("width", Math.min(230, 145 * ratio));
        const count = Math.ceil((net * (1 + waste / 100)) / 1.44);
        result = `${l} × ${w} m − ${cut.toFixed(2)} m² = ${net.toFixed(2)} m². +${waste}% allowance = ${(net * (1 + waste / 100)).toFixed(2)} m². ${count} boxes × 1.44 m² = ${(count * 1.44).toFixed(2)} m² supplied.`;
        ctx.panel.querySelector("#boxes").textContent = valid
          ? `${count} boxes`
          : "Check dimensions";
        ctx.panel.querySelector("#formula").textContent = valid
          ? result
          : "Room dimensions must be positive and larger than the excluded area.";
      };
      ctx.on("input", "input", update);
      ctx.on("#quantity-attach", "click", () =>
        ctx.commit("Takeoff attached", result),
      );
      update();
    },
  },
  {
    id: "clearance",
    title: "Place it in the room",
    modality: "Room placement / AR study",
    prompt: "Could this pendant work above the table?",
    response:
      "Try the placement in the room first. Then keep the measured clearance separate from the visual impression.",
    entryLabel: "Try room placement",
    description:
      "Bring an object into the conversation’s photo. Move it, change the drop, and keep the dimensions beside the preview.",
    steps: [
      "Drag the pendant over the room photo.",
      "Set the measured ceiling and drop.",
      "Pin a candidate for qualified review.",
    ],
    boundary:
      "Room-photo preview, not live AR or depth tracking. The procedural object is illustrative; photograph scale does not prove clearance.",
    mount(ctx) {
      ctx.open(
        "Place in your room",
        "Photo preview · not tracked AR",
        `<div class="tool-stack"><div class="spatial-room" id="placement"><img src="${ctx.asset("lighting-room.png")}" alt="Generated dining-room reference"><div class="spatial-object" id="placed-object"><canvas id="room-model" width="180" height="220" aria-label="Illustrative pendant placement"></canvas></div><span class="spatial-preview-label">REFERENCE PHOTO / 3D OVERLAY</span></div><p class="tool-note">Drag the object to place it. Use position controls for precise or keyboard placement.</p><div class="tool-grid"><label class="tool-label">Across room<input id="pos-x" type="range" min="10" max="90" value="50"></label><label class="tool-label">Down photo<input id="pos-y" type="range" min="10" max="80" value="30"></label></div><div class="tool-grid"><label class="tool-label">Ceiling height (mm)<input id="ceiling" type="number" min="1000" max="6000" value="2700"></label><label class="tool-label">Total pendant drop (mm)<input id="drop" type="number" min="100" max="3000" value="900"></label></div><div class="tool-card"><strong id="clearance-output"></strong><p class="tool-note">Floor-to-lowest-point calculation only. Walkway, table and electrical requirements need site review.</p></div><button id="placement-attach" class="tool-primary">Pin placement for review</button></div>`,
      );
      const viewer = pendantViewer(ctx.panel.querySelector("#room-model"), {
        transparent: true,
      });
      if (viewer) ctx.cleanup(() => viewer.destroy());
      const object = ctx.panel.querySelector("#placed-object"),
        room = ctx.panel.querySelector("#placement");
      let position = { x: 50, y: 30 },
        clearance = 1800;
      const update = () => {
        position = {
          x: Number(ctx.panel.querySelector("#pos-x").value),
          y: Number(ctx.panel.querySelector("#pos-y").value),
        };
        object.style.left = `${position.x}%`;
        object.style.top = `${position.y}%`;
        const c = Number(ctx.panel.querySelector("#ceiling").value),
          d = Number(ctx.panel.querySelector("#drop").value);
        clearance = c - d;
        const valid =
          c >= 1000 && c <= 6000 && d >= 100 && d <= 3000 && clearance > 0;
        ctx.panel.querySelector("#clearance-output").textContent = valid
          ? `${clearance.toLocaleString()} mm above floor`
          : "Check ceiling and drop";
        ctx.panel.querySelector("#placement-attach").disabled = !valid;
      };
      let dragging = false;
      object.addEventListener("pointerdown", (e) => {
        dragging = true;
        object.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      object.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const r = room.getBoundingClientRect();
        ctx.panel.querySelector("#pos-x").value = Math.max(
          10,
          Math.min(90, ((e.clientX - r.left) / r.width) * 100),
        );
        ctx.panel.querySelector("#pos-y").value = Math.max(
          10,
          Math.min(80, ((e.clientY - r.top) / r.height) * 100),
        );
        update();
      });
      object.addEventListener("pointerup", () => (dragging = false));
      object.addEventListener("pointercancel", () => (dragging = false));
      ctx.on("input", "input", update);
      ctx.on("#placement-attach", "click", () =>
        ctx.commit(
          "Placement pinned — review required",
          `Photo position ${position.x}% / ${position.y}%. Entered dimensions give ${clearance} mm above floor. Not a depth-tracked placement or installation approval.`,
        ),
      );
      update();
    },
  },
  {
    id: "substitution",
    title: "Turn the alternative",
    modality: "Interactive 3D viewer",
    prompt: "What changes if I choose the other pendant?",
    response:
      "Compare the form from more than one angle. Finish and shape are visual choices; the product specification still needs its own check.",
    entryLabel: "Compare in 3D",
    description:
      "A real, touchable object viewer inside a tool sheet. Switch the silhouette, orbit the mesh, then record the trade-off.",
    steps: [
      "Orbit the procedural 3D model.",
      "Switch shape, finish and viewing distance.",
      "Attach a candidate, not an approval.",
    ],
    boundary:
      "Actual WebGL geometry, illustrative models. Neither shape is a manufacturer model; dimensions, output, ratings and lead time remain unverified.",
    mount(ctx) {
      ctx.open(
        "Compare the form",
        "Illustrative geometry · drag to orbit",
        `<div class="tool-stack"><canvas id="model" class="spatial-viewer" tabindex="0" aria-label="3D pendant. Drag or use arrow keys to orbit."></canvas><div class="tool-grid"><button class="tool-chip" data-shape="dome" aria-pressed="true">01 · Soft dome</button><button class="tool-chip" data-shape="cone" aria-pressed="false">02 · Wide cone</button></div><label class="tool-label">Finish<select id="finish"><option value="brass">Brushed brass</option><option value="chalk">Chalk white</option><option value="ink">Ink black</option></select></label><label class="tool-label">View distance<input id="zoom" type="range" min="2" max="5" step="0.1" value="3.5"></label><button id="reset-view" class="tool-secondary">Reset view</button><div class="tool-card"><strong id="shape-title">Soft dome</strong><p id="shape-copy" class="tool-copy">A rounder profile with a smaller opening. Visual comparison only; beam spread is not modeled.</p></div><label class="tool-label">Reason for the alternative<textarea id="tradeoff">Compare silhouette with the table before checking the supplier specification.</textarea></label><button id="model-attach" class="tool-primary">Attach visual candidate</button></div>`,
      );
      const viewer = pendantViewer(ctx.panel.querySelector("#model"));
      let shape = "dome";
      if (viewer) ctx.cleanup(() => viewer.destroy());
      else ctx.panel.querySelector("#model-attach").disabled = true;
      ctx.on("[data-shape]", "click", (e) => {
        shape = e.currentTarget.dataset.shape;
        ctx.panel
          .querySelectorAll("[data-shape]")
          .forEach((b) =>
            b.setAttribute("aria-pressed", String(b.dataset.shape === shape)),
          );
        viewer?.update({ shape });
        ctx.panel.querySelector("#shape-title").textContent =
          shape === "dome" ? "Soft dome" : "Wide cone";
        ctx.panel.querySelector("#shape-copy").textContent =
          shape === "dome"
            ? "A rounder profile with a smaller opening. Visual comparison only; beam spread is not modeled."
            : "A broader, more angular silhouette. Confirm actual diameter and light distribution with the supplier.";
      });
      ctx.on("#finish", "change", (e) =>
        viewer?.update({
          color: {
            brass: [0.77, 0.67, 0.5],
            chalk: [0.94, 0.93, 0.89],
            ink: [0.19, 0.2, 0.21],
          }[e.target.value],
        }),
      );
      ctx.on("#zoom", "input", (e) =>
        viewer?.update({ zoom: Number(e.target.value) }),
      );
      ctx.on("#reset-view", "click", () => {
        viewer?.update({ reset: true });
        ctx.panel.querySelector("#zoom").value = "3.5";
      });
      ctx.on("#model-attach", "click", () =>
        ctx.commit(
          "Visual alternative attached",
          `${shape === "dome" ? "Soft dome" : "Wide cone"} / ${ctx.panel.querySelector("#finish").value}. ${ctx.panel.querySelector("#tradeoff").value.trim()} Manufacturer dimensions and performance remain unverified.`,
        ),
      );
    },
  },
];
