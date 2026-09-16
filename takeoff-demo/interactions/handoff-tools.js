// Handoff tools: sample check, delivery check-in, installer pack, return draft.
// Owns: interactions/handoff-tools.js, interactions/handoff-tools.css
// Contract: mount(ctx) opens the shared sheet via ctx.open/ctx.setContent and returns the panel root.

const iconDrag = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M4 2v10M10 2v10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;

const iconCheck = `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.4"/><path d="M5 8.2l1.9 1.9L11.2 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const iconAlert = `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.6l7 12.4H1L8 1.6z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M8 6.4v3.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="8" cy="11.6" r="0.7" fill="currentColor"/></svg>`;

function sampleMount(ctx) {
  const before = ctx.asset("tiles-sample.png");
  const after = ctx.asset("tiles-batch.png");

  const root = ctx.open(
    "Sample check",
    "Delivered sample vs. approved reference — visual only",
    `
    <div class="tool-stack hand-sample">
      <p class="tool-copy">Drag the handle to compare the sample dropped off on site against the batch photo the crew already approved.</p>
      <div class="hand-wipe" style="--hand-pos:50%">
        <img class="hand-wipe-img hand-wipe-base" src="${before}" alt="Delivered tile sample, held up to the light">
        <img class="hand-wipe-img hand-wipe-overlay" src="${after}" alt="Approved reference batch, two stacks compared">
        <span class="hand-wipe-tag hand-wipe-tag-left">Delivered</span>
        <span class="hand-wipe-tag hand-wipe-tag-right">Reference</span>
        <div class="hand-wipe-handle">${iconDrag}</div>
        <input type="range" class="hand-wipe-range" min="0" max="100" value="50" aria-label="Reveal approved reference photo">
      </div>
      <div class="hand-context-toggle" role="group" aria-label="Comparison context">
        <button type="button" class="hand-context-btn hand-context-active" data-context="site">Viewing in site light</button>
        <button type="button" class="hand-context-btn" data-context="reference">Viewing as reference photo</button>
      </div>
      <p class="tool-note hand-context-note">Visual study only — this reflects how the photos look on screen right now, not a measured color or shade match.</p>
      <label class="hand-consent">
        <input type="checkbox" id="hand-sample-consent">
        <span>This is a visual side-by-side on screen, not a measured color or shade match.</span>
      </label>
      <div class="tool-card">
        <p class="tool-label">Identity checklist</p>
        <ul class="hand-checklist">
          <li><label><input type="checkbox" class="hand-id-check"><span>Material matches the order line — ribbed ceramic tile</span></label></li>
          <li><label><input type="checkbox" class="hand-id-check"><span>Finish and texture consistent with the last approved batch</span></label></li>
          <li><label><input type="checkbox" class="hand-id-check"><span>No visible chips, cracks, or shade blotching on this piece</span></label></li>
        </ul>
      </div>
      <label class="tool-label" for="hand-sample-note">Finish note</label>
      <textarea id="hand-sample-note" class="tool-input hand-textarea" rows="2" placeholder="e.g. Slightly warmer under this light than the batch photo"></textarea>
      <div class="tool-actions">
        <button type="button" class="tool-button tool-secondary" id="hand-sample-hold">Hold for site light</button>
        <button type="button" class="tool-button tool-primary" id="hand-sample-confirm" disabled>Confirm match</button>
      </div>
    </div>
  `,
  );

  const wipe = root.querySelector(".hand-wipe");
  const consentBox = root.querySelector("#hand-sample-consent");
  const confirmBtn = root.querySelector("#hand-sample-confirm");
  const noteField = root.querySelector("#hand-sample-note");
  const contextNote = root.querySelector(".hand-context-note");
  const idChecks = () => Array.from(root.querySelectorAll(".hand-id-check"));
  const contextCopy = {
    site: `Visual study only — comparing as it will look on site; daylight and screen glare can shift these colors.`,
    reference: `Visual study only — comparing against the studio reference photo; still not a measured color match.`,
  };
  const sampleAttachments = [
    { url: before, kind: "image", alt: "Delivered tile sample" },
    { url: after, kind: "image", alt: "Approved reference batch" },
  ];

  const updateGate = () => {
    confirmBtn.disabled = !(
      consentBox.checked && idChecks().every((c) => c.checked)
    );
  };

  ctx.on(".hand-wipe-range", "input", (e) => {
    wipe.style.setProperty("--hand-pos", `${e.target.value}%`);
  });
  ctx.on("#hand-sample-consent", "change", updateGate);
  ctx.on(".hand-id-check", "change", updateGate);
  ctx.on(".hand-context-btn", "click", (e) => {
    const btn = e.currentTarget;
    root
      .querySelectorAll(".hand-context-btn")
      .forEach((b) => b.classList.toggle("hand-context-active", b === btn));
    contextNote.textContent =
      contextCopy[btn.dataset.context] || contextCopy.site;
  });

  ctx.on("#hand-sample-hold", "click", () => {
    const note = noteField.value.trim();
    ctx.commit(
      "Sample held for on-site light",
      note || "No note added — held before approving.",
      sampleAttachments,
    );
    ctx.notice("Sample held for on-site light. No approval recorded yet.");
  });

  ctx.on("#hand-sample-confirm", "click", () => {
    const note = noteField.value.trim();
    ctx.commit(
      "Sample confirmed against approved reference",
      `Identity checklist cleared (material, finish, condition). ${note || "No additional note."}`,
      sampleAttachments,
    );
    ctx.notice("Sample match confirmed and logged.");
  });

  return root;
}

function deliveryMount(ctx) {
  const photo = ctx.asset("framing-delivery.png");
  const expectedCode = "PO-4471-B";
  const items = [
    { id: "stud26", label: "2x6x10 kiln-dried stud", expected: 24 },
    { id: "stud24", label: "2x4x8 kiln-dried stud", expected: 40 },
    { id: "hanger", label: "Galvanized joist hanger", expected: 16 },
  ];

  const rows = items
    .map(
      (item) => `
      <div class="hand-recon-row" data-item="${item.id}" data-expected="${item.expected}">
        <div class="hand-recon-name">
          <p>${item.label}</p>
          <p class="tool-label">Expected ${item.expected}</p>
        </div>
        <input type="number" min="0" step="1" class="tool-input hand-recon-count" placeholder="Count" aria-label="Counted quantity for ${item.label}">
        <select class="tool-input hand-recon-condition" aria-label="Condition for ${item.label}">
          <option value="">Condition…</option>
          <option value="good">Good condition</option>
          <option value="partial">Some damage</option>
          <option value="unusable">Not usable</option>
        </select>
        <span class="hand-recon-delta tool-chip" hidden></span>
      </div>`,
    )
    .join("");

  const root = ctx.open(
    "Delivery check-in",
    "Match the load, then count it by hand",
    `
    <div class="tool-stack hand-delivery">
      <img class="tool-image" src="${photo}" alt="Framing delivery stacked near the driveway">
      <p class="tool-note">The photo is for context only. Counts and condition below are entered by hand, never read from the image.</p>
      <div class="hand-scan">
        <input type="text" class="tool-input hand-scan-input" placeholder="Delivery code, e.g. PO-4471-B" aria-label="Delivery code">
        <button type="button" class="tool-button tool-secondary hand-scan-demo">Use demo scan</button>
      </div>
      <div class="tool-actions">
        <button type="button" class="tool-button tool-secondary hand-scan-match">Match to order</button>
      </div>
      <p class="tool-status hand-scan-status" role="status"></p>
      <div class="hand-recon-table">${rows}</div>
      <div class="tool-actions">
        <button type="button" class="tool-button tool-secondary" id="hand-delivery-partial" disabled>Save partial</button>
        <button type="button" class="tool-button tool-primary" id="hand-delivery-confirm" disabled>Confirm delivery</button>
      </div>
    </div>
  `,
  );

  const scanInput = root.querySelector(".hand-scan-input");
  const scanStatus = root.querySelector(".hand-scan-status");
  const partialBtn = root.querySelector("#hand-delivery-partial");
  const confirmBtn = root.querySelector("#hand-delivery-confirm");
  const rowEls = () => Array.from(root.querySelectorAll(".hand-recon-row"));
  const deliveryAttachments = () => [
    { url: photo, kind: "image", alt: "Framing delivery photo" },
  ];
  let matched = false;

  const runMatch = () => {
    const typed = scanInput.value.trim();
    matched = typed.toUpperCase() === expectedCode;
    scanStatus.textContent = matched
      ? `Matched — Framing package, ${expectedCode}`
      : typed
        ? `No purchase order found for "${typed}". Check the label and try again.`
        : "Enter or scan a delivery code to match this load to an order.";
    updateGate();
  };

  const isValidCount = (raw) => {
    if (raw === "") return true;
    const n = Number(raw);
    return Number.isInteger(n) && n >= 0;
  };

  const rowState = (row) => {
    const expected = Number(row.dataset.expected);
    const count = row.querySelector(".hand-recon-count");
    const condition = row.querySelector(".hand-recon-condition");
    const chip = row.querySelector(".hand-recon-delta");
    const raw = count.value;
    const hasCount = raw !== "";
    const validCount = isValidCount(raw);
    if (hasCount && validCount) {
      const counted = Number(raw);
      const diff = counted - expected;
      chip.hidden = false;
      chip.classList.remove("hand-recon-delta-invalid");
      chip.textContent =
        diff === 0
          ? "Matches expected"
          : diff > 0
            ? `Over by ${diff}`
            : `Short by ${Math.abs(diff)}`;
    } else if (hasCount && !validCount) {
      chip.hidden = false;
      chip.classList.add("hand-recon-delta-invalid");
      chip.textContent = "Enter a whole number, 0 or more";
    } else {
      chip.hidden = true;
      chip.classList.remove("hand-recon-delta-invalid");
    }
    return {
      hasCount,
      validCount,
      hasCondition: condition.value !== "",
      condition: condition.value,
    };
  };

  const updateGate = () => {
    const states = rowEls().map(rowState);
    const anyInvalid = states.some((s) => s.hasCount && !s.validCount);
    partialBtn.disabled = !matched || anyInvalid;
    confirmBtn.disabled = !(
      matched &&
      !anyInvalid &&
      states.every((s) => s.hasCount && s.validCount && s.hasCondition)
    );
  };

  ctx.on(".hand-scan-demo", "click", () => {
    scanInput.value = expectedCode;
    runMatch();
  });
  ctx.on(".hand-scan-match", "click", runMatch);
  ctx.on(".hand-scan-input", "input", () => {
    if (!matched) return;
    matched = false;
    scanStatus.textContent =
      "Delivery code changed — match it again before checking in.";
    updateGate();
  });
  ctx.on(".hand-recon-count", "input", updateGate);
  ctx.on(".hand-recon-condition", "change", updateGate);

  ctx.on("#hand-delivery-partial", "click", () => {
    const filled = rowEls().filter(
      (row) => row.querySelector(".hand-recon-count").value !== "",
    );
    const detail =
      filled
        .map((row) => {
          const label = row.querySelector(".hand-recon-name p").textContent;
          const count = row.querySelector(".hand-recon-count").value;
          return `${label}: counted ${count}`;
        })
        .join("; ") || "No lines counted yet.";
    ctx.commit(
      `Delivery partially checked in — ${expectedCode}`,
      `${filled.length} of ${items.length} lines counted so far. ${detail}`,
      deliveryAttachments(),
    );
    ctx.notice("Partial count saved. Finish the rest before confirming.");
  });

  ctx.on("#hand-delivery-confirm", "click", () => {
    let short = 0;
    let over = 0;
    let damaged = 0;
    const lines = rowEls().map((row) => {
      const label = row.querySelector(".hand-recon-name p").textContent;
      const expected = Number(row.dataset.expected);
      const counted = Number(row.querySelector(".hand-recon-count").value);
      const condition = row.querySelector(".hand-recon-condition").value;
      if (counted < expected) short += 1;
      if (counted > expected) over += 1;
      if (condition !== "good") damaged += 1;
      return `${label}: ${counted}/${expected} (${condition})`;
    });
    const bits = [];
    if (short) bits.push(`${short} short`);
    if (over) bits.push(`${over} over`);
    if (damaged) bits.push(`${damaged} flagged for condition`);
    const summary = `Delivery ${expectedCode} checked in — ${bits.length ? bits.join(", ") : "all lines matched expected"}`;
    ctx.commit(summary, lines.join("; "), deliveryAttachments());
    ctx.notice("Delivery reconciled and logged.");
  });

  return root;
}

function installerpackMount(ctx) {
  const plan = ctx.asset("framing-plan.png");
  const trades = [
    {
      id: "framing",
      label: "Framing",
      top: "26%",
      left: "20%",
      revisions: [
        { id: "", label: "— Select revision —", approved: false },
        { id: "framing-rev-a", label: "Rev A — approved 3/02", approved: true },
        {
          id: "framing-rev-b",
          label: "Rev B — pending review",
          approved: false,
        },
      ],
    },
    {
      id: "tile",
      label: "Tile",
      top: "58%",
      left: "64%",
      revisions: [
        { id: "", label: "— Select revision —", approved: false },
        { id: "tile-rev-c", label: "Rev C — approved 3/05", approved: true },
        { id: "tile-rev-b", label: "Rev B — superseded", approved: false },
      ],
    },
    {
      id: "paint",
      label: "Paint",
      top: "72%",
      left: "28%",
      revisions: [
        { id: "", label: "— Select revision —", approved: false },
        { id: "paint-rev-a", label: "Rev A — approved 3/01", approved: true },
        { id: "paint-rev-b", label: "Rev B — color hold", approved: false },
      ],
    },
    {
      id: "lighting",
      label: "Lighting",
      top: "18%",
      left: "66%",
      revisions: [
        { id: "", label: "— Select revision —", approved: false },
        {
          id: "lighting-rev-b",
          label: "Rev B — pending fixture swap",
          approved: false,
        },
        {
          id: "lighting-rev-a",
          label: "Rev A — approved 2/26",
          approved: true,
        },
      ],
    },
  ];

  const chips = trades
    .map(
      (t) =>
        `<span class="hand-plan-chip" data-trade="${t.id}" style="top:${t.top};left:${t.left}">${t.label}</span>`,
    )
    .join("");

  const tabs = trades
    .map(
      (t, i) =>
        `<button type="button" class="hand-tab${i === 0 ? " hand-tab-active" : ""}" data-trade="${t.id}" role="tab" aria-selected="${i === 0}">${t.label}</button>`,
    )
    .join("");

  const panels = trades
    .map(
      (t, i) => `
      <div class="hand-trade-panel${i === 0 ? " hand-trade-panel-active" : ""}" data-trade="${t.id}">
        <label class="hand-consent">
          <input type="checkbox" class="hand-layer-toggle" data-trade="${t.id}" checked>
          <span>Show ${t.label.toLowerCase()} annotations on the plan</span>
        </label>
        <label class="tool-label" for="hand-rev-${t.id}">Source revision</label>
        <select id="hand-rev-${t.id}" class="tool-input hand-revision-select" data-trade="${t.id}">
          ${t.revisions.map((r) => `<option value="${r.id}" data-approved="${r.approved}">${r.label}</option>`).join("")}
        </select>
      </div>`,
    )
    .join("");

  const gateItems = trades
    .map(
      (t) => `
      <li class="hand-gate-item" data-trade="${t.id}">
        <span class="hand-gate-icon">${iconAlert}</span>
        <span>${t.label} — <em class="hand-gate-state">not selected</em></span>
      </li>`,
    )
    .join("");

  const root = ctx.open(
    "Installer pack",
    "Trade layers, revisions, and a readiness gate",
    `
    <div class="tool-stack hand-installerpack">
      <p class="tool-copy">Pick the approved revision each trade is building from, then generate the pack the installers open on site.</p>
      <p class="tool-note hand-pack-synthetic">Synthetic interaction study — not a construction-ready approval record.</p>
      <div class="hand-plan-wrap">
        <img class="hand-plan-img" src="${plan}" alt="Site plan marked up with trade layers">
        ${chips}
      </div>
      <div class="hand-tabs" role="tablist">${tabs}</div>
      <div class="hand-trade-panels">${panels}</div>
      <div class="tool-card hand-gate">
        <p class="tool-label">Readiness gate</p>
        <ul class="hand-gate-list">${gateItems}</ul>
      </div>
      <div class="tool-actions">
        <button type="button" class="tool-button tool-primary" id="hand-pack-generate" disabled>Generate installer pack</button>
      </div>
      <p class="tool-status" id="hand-pack-status" role="status"></p>
    </div>
  `,
  );

  const generateBtn = root.querySelector("#hand-pack-generate");
  const statusEl = root.querySelector("#hand-pack-status");

  const setActiveTab = (tradeId) => {
    root.querySelectorAll(".hand-tab").forEach((tab) => {
      const active = tab.dataset.trade === tradeId;
      tab.classList.toggle("hand-tab-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    root.querySelectorAll(".hand-trade-panel").forEach((panel) => {
      panel.classList.toggle(
        "hand-trade-panel-active",
        panel.dataset.trade === tradeId,
      );
    });
    root.querySelectorAll(".hand-plan-chip").forEach((chip) => {
      chip.classList.toggle(
        "hand-plan-chip-active",
        chip.dataset.trade === tradeId,
      );
    });
  };

  const updateGate = () => {
    let allApproved = true;
    trades.forEach((t) => {
      const select = root.querySelector(`#hand-rev-${t.id}`);
      const option = select.options[select.selectedIndex];
      const approved = option.dataset.approved === "true";
      const item = root.querySelector(`.hand-gate-item[data-trade="${t.id}"]`);
      const icon = item.querySelector(".hand-gate-icon");
      const state = item.querySelector(".hand-gate-state");
      if (approved) {
        icon.innerHTML = iconCheck;
        state.textContent = option.textContent;
        item.classList.add("hand-gate-ready");
      } else {
        icon.innerHTML = iconAlert;
        state.textContent =
          select.value === "" ? "not selected" : "not yet approved";
        item.classList.remove("hand-gate-ready");
        allApproved = false;
      }
    });
    generateBtn.disabled = !allApproved;
  };

  const updateLayer = (tradeId, visible) => {
    const chip = root.querySelector(`.hand-plan-chip[data-trade="${tradeId}"]`);
    chip.classList.toggle("hand-plan-chip-hidden", !visible);
  };

  ctx.on(".hand-tab", "click", (e) =>
    setActiveTab(e.currentTarget.dataset.trade),
  );
  ctx.on(".hand-layer-toggle", "change", (e) =>
    updateLayer(e.target.dataset.trade, e.target.checked),
  );
  ctx.on(".hand-revision-select", "change", updateGate);

  ctx.on("#hand-pack-generate", "click", () => {
    const pack = {
      generatedAt: new Date().toISOString(),
      notice:
        "Synthetic interaction study data — not a construction-ready approval record.",
      planSourceUrl: new URL(plan, location.href).href,
      trades: trades.map((t) => {
        const select = root.querySelector(`#hand-rev-${t.id}`);
        const toggle = root.querySelector(
          `.hand-layer-toggle[data-trade="${t.id}"]`,
        );
        const option = select.options[select.selectedIndex];
        return {
          trade: t.label,
          sourceUrl: new URL(plan, location.href).href,
          revisionId: select.value,
          revisionLabel: option.textContent,
          approved: option.dataset.approved === "true",
          planAnnotationsVisible: toggle.checked,
          annotationPosition: { top: t.top, left: t.left },
        };
      }),
    };
    ctx.download(
      "installer-pack.json",
      JSON.stringify(pack, null, 2),
      "application/json",
    );
    const summary = `Installer pack generated — ${pack.trades.length} of ${pack.trades.length} trades approved`;
    const detail = pack.trades
      .map((t) => `${t.trade}: ${t.revisionLabel}`)
      .join("; ");
    ctx.commit(summary, detail, [
      { url: plan, kind: "image", alt: "Site plan with trade layers" },
    ]);
    statusEl.textContent = "installer-pack.json downloaded.";
    ctx.notice("Installer pack downloaded.");
  });

  updateGate();
  setActiveTab(trades[0].id);

  return root;
}

function receiptMount(ctx) {
  const damage = ctx.asset("paint-damage.png");
  const delivery = ctx.asset("paint-delivery.png");
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const root = ctx.open(
    "Return draft",
    "Evidence, reason, and the supplier policy checklist",
    `
    <div class="tool-stack hand-receipt">
      <div class="hand-evidence">
        <img class="tool-image hand-evidence-main" id="hand-evidence-preview" src="${damage}" alt="Dented paint tin with a leaking seam">
        <div class="hand-evidence-thumbs">
          <button type="button" class="hand-evidence-thumb hand-evidence-thumb-active" data-src="${damage}" data-alt="Dented paint tin with a leaking seam" aria-pressed="true">
            <img src="${damage}" alt="">
            <span>Damage close-up</span>
          </button>
          <button type="button" class="hand-evidence-thumb" data-src="${delivery}" data-alt="Original delivery photo for context" aria-pressed="false">
            <img src="${delivery}" alt="">
            <span>Delivery context</span>
          </button>
        </div>
      </div>
      <div class="tool-grid hand-receipt-fields">
        <div>
          <label class="tool-label" for="hand-reason">Reason</label>
          <select id="hand-reason" class="tool-input">
            <option value="">Select a reason…</option>
            <option value="Damaged in transit">Damaged in transit</option>
            <option value="Manufacturing defect">Manufacturing defect</option>
            <option value="Wrong item received">Wrong item received</option>
            <option value="Short shipped">Short shipped</option>
          </select>
        </div>
        <div>
          <label class="tool-label" for="hand-qty">Quantity affected</label>
          <input id="hand-qty" type="number" min="1" step="1" class="tool-input" placeholder="e.g. 2">
        </div>
        <div>
          <label class="tool-label" for="hand-date">Date noticed</label>
          <input id="hand-date" type="date" class="tool-input" max="${todayStr}">
        </div>
      </div>
      <label class="tool-label" for="hand-receipt-note">Notes</label>
      <textarea id="hand-receipt-note" class="tool-input hand-textarea" rows="2" placeholder="What you saw when you opened it"></textarea>
      <div class="tool-card">
        <p class="tool-label">Supplier sample-return policy</p>
        <ul class="hand-checklist">
          <li><label><input type="checkbox" class="hand-policy-check"><span>Reported within the 30-day return window</span></label></li>
          <li><label><input type="checkbox" class="hand-policy-check"><span>Original packaging and labels kept</span></label></li>
          <li><label><input type="checkbox" class="hand-policy-check"><span>Item unopened, unused, or unaltered beyond inspection</span></label></li>
        </ul>
      </div>
      <p class="tool-note">Downloads a draft for your records. This does not submit anything to the supplier.</p>
      <div class="tool-actions">
        <button type="button" class="tool-button tool-secondary" id="hand-receipt-save">Save evidence only</button>
        <button type="button" class="tool-button tool-primary" id="hand-receipt-draft" disabled>Prepare return draft</button>
      </div>
      <p class="tool-status" id="hand-receipt-status" role="status"></p>
    </div>
  `,
  );

  const preview = root.querySelector("#hand-evidence-preview");
  const reasonSelect = root.querySelector("#hand-reason");
  const qtyInput = root.querySelector("#hand-qty");
  const dateInput = root.querySelector("#hand-date");
  const noteField = root.querySelector("#hand-receipt-note");
  const draftBtn = root.querySelector("#hand-receipt-draft");
  const statusEl = root.querySelector("#hand-receipt-status");
  const policyChecks = () =>
    Array.from(root.querySelectorAll(".hand-policy-check"));
  let activeThumbAlt = "Dented paint tin with a leaking seam";
  let activeThumbUrl = damage;

  const updateGate = () => {
    const qtyNum = Number(qtyInput.value);
    const qtyValid =
      qtyInput.value !== "" && Number.isInteger(qtyNum) && qtyNum >= 1;
    const dateValid = dateInput.value !== "" && dateInput.value <= todayStr;
    draftBtn.disabled = !(
      reasonSelect.value !== "" &&
      qtyValid &&
      dateValid &&
      policyChecks().every((c) => c.checked)
    );
  };

  ctx.on(".hand-evidence-thumb", "click", (e) => {
    const btn = e.currentTarget;
    root.querySelectorAll(".hand-evidence-thumb").forEach((t) => {
      t.classList.toggle("hand-evidence-thumb-active", t === btn);
      t.setAttribute("aria-pressed", String(t === btn));
    });
    preview.src = btn.dataset.src;
    preview.alt = btn.dataset.alt;
    activeThumbAlt = btn.dataset.alt;
    activeThumbUrl = btn.dataset.src;
  });

  ctx.on("#hand-reason", "change", updateGate);
  ctx.on("#hand-qty", "input", updateGate);
  ctx.on("#hand-date", "change", updateGate);
  ctx.on(".hand-policy-check", "change", updateGate);

  ctx.on("#hand-receipt-save", "click", () => {
    const note = noteField.value.trim();
    ctx.commit(
      "Evidence saved for a return draft",
      `Evidence: ${activeThumbAlt}. ${note || "No note yet."} Finish the reason and checklist to prepare a draft.`,
      [{ url: activeThumbUrl, kind: "image", alt: activeThumbAlt }],
    );
    ctx.notice(
      "Evidence saved. Draft is not ready until the checklist is cleared.",
    );
  });

  const imageToDataUrl = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  };

  ctx.on("#hand-receipt-draft", "click", async () => {
    const reason = reasonSelect.value;
    const qty = qtyInput.value;
    const date = dateInput.value;
    const note = noteField.value.trim();
    const policyLabels = policyChecks().map(
      (c) => c.parentElement.querySelector("span").textContent,
    );
    const absoluteEvidenceUrl = new URL(activeThumbUrl, window.location.href)
      .href;
    let evidenceMarkup;
    try {
      const dataUrl = await imageToDataUrl(absoluteEvidenceUrl);
      evidenceMarkup = `<img src="${dataUrl}" alt="${ctx.escape(activeThumbAlt)}" style="max-width:100%;border-radius:8px;">`;
    } catch {
      evidenceMarkup = `<img src="${ctx.escape(absoluteEvidenceUrl)}" alt="${ctx.escape(activeThumbAlt)}" style="max-width:100%;border-radius:8px;"><p><em>Image linked by URL — could not embed the file directly.</em></p>`;
    }
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Return draft</title></head>
<body style="font-family:system-ui,sans-serif;max-width:560px;margin:40px auto;color:#111;">
<h1>Return draft — ${ctx.escape(reason)}</h1>
<p><strong>Quantity affected:</strong> ${ctx.escape(qty)}</p>
<p><strong>Date noticed:</strong> ${ctx.escape(date)}</p>
<p><strong>Evidence photo (${ctx.escape(activeThumbAlt)}):</strong></p>
${evidenceMarkup}
<p><strong>Notes:</strong> ${note ? ctx.escape(note) : "None"}</p>
<h2>Policy checklist confirmed</h2>
<ul>${policyLabels.map((l) => `<li>${ctx.escape(l)}</li>`).join("")}</ul>
<p><em>Draft only — not submitted to the supplier. Send it yourself when ready.</em></p>
</body></html>`;
    ctx.download("return-draft.html", html, "text/html");
    ctx.commit(
      `Return draft prepared — ${reason}, qty ${qty}`,
      `Evidence: ${activeThumbAlt}. Policy checklist fully confirmed. Draft downloaded, not sent.`,
      [{ url: activeThumbUrl, kind: "image", alt: activeThumbAlt }],
    );
    statusEl.textContent = "return-draft.html downloaded.";
    ctx.notice("Return draft downloaded. Remember to send it yourself.");
  });

  return root;
}

export const handoffTools = [
  {
    id: "sample",
    title: "Sample check",
    modality: "Visual sample comparison",
    prompt:
      "The tile sample got dropped off on site — can you check it against what we approved?",
    response:
      "Let's line up the delivered sample against the reference photo from approval. Drag to compare, then confirm identity and finish before it goes on the wall.",
    entryLabel: "Compare sample",
    description:
      "A draggable wipe compares the delivered sample to the approved reference photo, gated by an identity checklist and a finish note.",
    steps: [
      "Drag to compare the delivered sample against the approved reference photo.",
      "Check identity: material, finish, and condition against the order line.",
      "Record a finish note, then confirm the match or hold for on-site light.",
    ],
    boundary:
      "Screen colors vary by device and photo lighting — this view supports a judgment call, not a certified shade match. Use the physical sample for finish approval.",
    mount: sampleMount,
  },
  {
    id: "delivery",
    title: "Delivery check-in",
    modality: "Manual delivery reconciliation",
    prompt:
      "The framing package just showed up — can you help me check it in against the order?",
    response:
      "Match the code on the label to the order first, then count each line by hand as it comes off the truck. I won't guess quantities from the photo.",
    entryLabel: "Check in delivery",
    description:
      "Match a scanned or typed delivery code to its order, then reconcile hand-counted quantities and condition line by line.",
    steps: [
      "Match the delivery to its purchase order — scan the demo label or type the code.",
      "Count each line by hand and log condition; the photo is context, not a counter.",
      "Confirm to reconcile against the expected order, or save a partial count.",
    ],
    boundary:
      "Counts come from what's physically checked at the door. Nothing here is inferred from the photo — recount before confirming a partial pallet.",
    mount: deliveryMount,
  },
  {
    id: "installerpack",
    title: "Installer pack",
    modality: "Trade-layered plan pack",
    prompt:
      "Can you put together the pack the installers need before they start?",
    response:
      "I'll pull the plan with each trade's layer, but I need the approved revision per trade first — anything still pending gets flagged before you download.",
    entryLabel: "Build installer pack",
    description:
      "Trade tabs toggle plan annotation layers and pick a source revision; a readiness gate flags missing approvals before the pack downloads.",
    steps: [
      "Switch between trade tabs and toggle plan annotation layers.",
      "Pick the approved revision each trade is building from.",
      "Clear the readiness gate, then generate and download the pack.",
    ],
    boundary:
      "This bundles the drawings your team already approved — it doesn't check code compliance or verify the install itself.",
    mount: installerpackMount,
  },
  {
    id: "receipt",
    title: "Return draft",
    modality: "Damage evidence and return draft",
    prompt:
      "One of the paint tins arrived dented and leaking — can you help me draft a return?",
    response:
      "Let's attach the evidence, log the reason and quantity, and confirm the return-window checklist before I draft anything — I won't send this to the supplier for you.",
    entryLabel: "Draft a return",
    description:
      "Collect damage evidence, reason, quantity, and date, confirm the supplied return-policy checklist, then download a return draft.",
    steps: [
      "Attach evidence photos and pick the one that best shows the damage.",
      "Log the reason, affected quantity, and date — then confirm the return policy checklist.",
      "Download the return draft. Nothing is submitted until you send it.",
    ],
    boundary:
      "This drafts your paperwork from what you documented — it doesn't file a claim or notify the supplier. You still send it yourself.",
    mount: receiptMount,
  },
];
