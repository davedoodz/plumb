// decision-tools.js
// Four decision-integrity studies: recall, quote, leadtime, signoff.
// Contract: mount(ctx) uses ctx.open/setContent/on/escape/commit/cleanup/notice/download/asset.
// All records are synthetic demo data and are labelled as such in the UI.

// Parses a dollar amount out of a source string. `strict` requires an explicit
// `$` prefix (used on free-text lines where a bare number could mean anything —
// a percentage, a quantity, a unit count). Non-strict also accepts a value that
// is the *entire* trimmed string with nothing else around it (a CSV amount cell).
// Percent values, and anything that parses negative, are never treated as money.

function money(raw, { strict = false } = {}) {
  if (raw == null) return null;
  const str = String(raw).trim();
  if (!str || /-\s*\$|\(\s*\$/.test(str)) return null;
  const dollarMatch = str.match(
    /\$\s*(-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?)(?![\d.,]|\s*%)/,
  );
  if (dollarMatch) {
    const n = parseFloat(dollarMatch[1].replace(/,/g, ""));
    return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
  }
  if (strict) return null;
  if (/^-?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?$|^-?\d+(?:\.\d{1,2})?$/.test(str)) {
    const n = parseFloat(str.replace(/,/g, ""));
    return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
  }
  return null;
}
function quoteReadyToSave(fields, exclusions) {
  return (
    Number.isFinite(fields.subtotal?.amount) &&
    (!fields.freight || exclusions.freight != null) &&
    (!fields.tax || exclusions.tax != null) &&
    (!fields.deposit || exclusions.deposit != null)
  );
}

function fmtUsd(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return "$" + n.toFixed(2);
}

// ---------------------------------------------------------------------------
// RECALL — source-linked timeline, before/after inspection, pin an attributed answer
// ---------------------------------------------------------------------------

const RECALL_TIMELINE = [
  {
    id: "draft",
    date: "Aug 28",
    who: "Priya · designer",
    channel: "Paint Spec v1 · draft",
    kind: "draft",
    before: null,
    after: { Sheen: "—", Color: "Coastal Fog (proposed)" },
    note: "Initial proposal drafted for client review. Not yet shown to Sam.",
  },
  {
    id: "hold",
    date: "Sep 2",
    who: "Sam · homeowner",
    channel: "Text thread",
    kind: "request",
    before: { Sheen: "—", Color: "Coastal Fog (proposed)" },
    after: {
      Sheen: "Satin (sample requested)",
      Color: "Coastal Fog (proposed)",
    },
    note: "Sam asked to see a satin sample against eggshell before deciding.",
  },
  {
    id: "approval",
    date: "Sep 10",
    who: "Sam · homeowner",
    channel: "Paint Spec v3 · approval",
    kind: "approval",
    before: {
      Sheen: "Satin (sample requested)",
      Color: "Coastal Fog (proposed)",
    },
    after: { Sheen: "Eggshell", Color: "Coastal Fog" },
    note: "Sam compared both sheens in the hallway light and approved eggshell.",
  },
  {
    id: "reconfirm",
    date: "Sep 24",
    who: "Dev · painter",
    channel: "Text thread",
    kind: "approval",
    before: { Sheen: "Eggshell", Color: "Coastal Fog" },
    after: { Sheen: "Eggshell (label matched)", Color: "Coastal Fog" },
    note: "Dev checked the new gallon's label against the spec before opening it.",
  },
];

function recallDiffGrid(ctx, before, after) {
  const keys = Object.keys(after);
  const cell = (obj, key) =>
    obj && obj[key] != null ? ctx.escape(obj[key]) : "—";
  return `<div class="dec-diff-grid">
    <div class="dec-diff-col"><p class="tool-label">Before</p>${keys
      .map(
        (k) =>
          `<p class="dec-diff-row"><span>${ctx.escape(k)}</span><strong>${cell(before, k)}</strong></p>`,
      )
      .join("")}</div>
    <div class="dec-diff-col"><p class="tool-label">After</p>${keys
      .map(
        (k) =>
          `<p class="dec-diff-row"><span>${ctx.escape(k)}</span><strong>${cell(after, k)}</strong></p>`,
      )
      .join("")}</div>
  </div>`;
}

function recallRender(ctx, state) {
  const items = RECALL_TIMELINE.map((entry) => {
    const selected = entry.id === state.selectedId;
    const kindLabel =
      entry.kind === "approval"
        ? "Attributed decision"
        : entry.kind === "draft"
          ? "Draft"
          : "Request";
    return `<button type="button" class="dec-timeline-item${selected ? " is-selected" : ""}" data-id="${entry.id}">
      <span class="dec-timeline-dot" data-kind="${entry.kind}"></span>
      <span class="dec-timeline-body">
        <span class="dec-timeline-top"><strong>${ctx.escape(entry.date)}</strong><span class="tool-chip dec-chip--${entry.kind === "approval" ? "ok" : entry.kind === "draft" ? "muted" : "warn"}">${ctx.escape(kindLabel)}</span></span>
        <span class="dec-timeline-meta">${ctx.escape(entry.who)} · ${ctx.escape(entry.channel)}</span>
      </span>
    </button>`;
  }).join("");

  const entry = RECALL_TIMELINE.find((e) => e.id === state.selectedId) || null;
  let detail;
  if (!entry) {
    detail = `<div class="tool-card dec-empty"><p class="tool-copy">Select a dated entry above to inspect what changed and who is attributed to it.</p></div>`;
  } else {
    const pinnable = entry.kind === "approval";
    detail = `<div class="tool-card">
      <p class="tool-label">${ctx.escape(entry.channel)}</p>
      <p class="tool-copy">${ctx.escape(entry.note)}</p>
      ${recallDiffGrid(ctx, entry.before, entry.after)}
      <div class="dec-pin-bar">
        ${
          pinnable
            ? `<button type="button" class="tool-button tool-primary dec-pin-btn" data-id="${entry.id}">Pin this answer</button>`
            : `<button type="button" class="tool-button tool-secondary" disabled aria-disabled="true">Pin this answer</button>`
        }
        <p class="tool-note">${pinnable ? `Attributed to ${ctx.escape(entry.who)}, ${ctx.escape(entry.date)}. Pinning retrieves it — it does not ask ${ctx.escape(entry.who.split(" · ")[0])} to approve again.` : "This is a draft or open request, not an attributed decision. Pick an approval entry to pin."}</p>
      </div>
    </div>`;
  }

  return `<div class="tool-stack dec-recall">
    <span class="tool-chip dec-chip--muted">Sample project record · hallway paint</span>
    <div class="dec-timeline">${items}</div>
    ${detail}
  </div>`;
}

function mountRecall(ctx) {
  const state = { selectedId: null };

  const bind = () => {
    ctx.on(".dec-timeline-item", "click", (e) => {
      state.selectedId = e.currentTarget.getAttribute("data-id");
      draw();
    });
    ctx.on(".dec-pin-btn", "click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      const entry = RECALL_TIMELINE.find((x) => x.id === id);
      if (!entry || entry.kind !== "approval") {
        ctx.notice("Select an attributed approval entry before pinning.");
        return;
      }
      const summary = `Pinned: ${entry.after.Sheen}${entry.after.Color ? ", " + entry.after.Color : ""} — approved by ${entry.who}, ${entry.date} (${entry.channel}).`;
      ctx.commit(summary, entry.note);
    });
  };

  const draw = () => {
    ctx.setContent(recallRender(ctx, state));
    bind();
  };

  ctx.open(
    "Recall the decision",
    "Hallway paint sheen · source-linked timeline",
    recallRender(ctx, state),
  );
  bind();
  return ctx.panel;
}

// ---------------------------------------------------------------------------
// QUOTE — parse an actual TXT/CSV quote, verify exclusions, compute a delivered total
// ---------------------------------------------------------------------------

const SAMPLE_QUOTE_TXT = `Riverside Tile Supply — Quote #4471
Job: Kitchen backsplash retile
Prepared for: Takeoff Job #2291
Date: Sep 8

Line items:
  Ceramic subway tile, 3x6, 44 sq ft   $396.00
  Tile trim pieces (12)                 $84.00
  Thinset mortar, 2 bags                $58.00

Subtotal: $538.00
Freight: NOT INCLUDED — arranged by buyer
Sales tax: not calculated, buyer's local rate applies
Deposit required: $150.00 due at order, non-refundable after cut
Estimated total (excludes freight and tax): $538.00`;

const SAMPLE_QUOTE_CSV = `item,amount
Ceramic subway tile 3x6 44 sq ft,396.00
Tile trim pieces (12),84.00
Thinset mortar 2 bags,58.00
Subtotal,538.00
Freight,NOT INCLUDED - arranged by buyer
Sales tax,not calculated - buyer's local rate applies
Deposit,150.00
Estimated total,538.00`;

// Label lines are anchored to the *start* of the line so a total line that
// happens to mention "freight" or "tax" in passing (e.g. "excludes freight
// and tax") can never be mistaken for the freight/tax line itself.
function parseQuoteTxt(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const startsWith = (re) => lines.find((l) => re.test(l));
  const subtotalLine = startsWith(/^subtotal\b[^:]*:/i);
  const freightLine = startsWith(/^(freight|shipping)\b[^:]*:/i);
  const taxLine = startsWith(/^(sales\s*)?tax\b[^:]*:/i);
  const depositLine = startsWith(/^deposit\b[^:]*:/i);
  const totalLine = lines
    .slice()
    .reverse()
    .find(
      (l) =>
        /^(estimated\s+|grand\s+)?total\b[^:]*:/i.test(l) && l !== subtotalLine,
    );
  return {
    subtotal: subtotalLine
      ? { amount: money(subtotalLine, { strict: true }), line: subtotalLine }
      : null,
    freight: freightLine
      ? {
          amount: money(freightLine, { strict: true }),
          line: freightLine,
          looksExcluded: /not included|excluded|arranged by buyer|n\/a/i.test(
            freightLine,
          ),
        }
      : null,
    tax: taxLine
      ? {
          amount: money(taxLine, { strict: true }),
          line: taxLine,
          looksExcluded:
            /not calculated|excluded|not included|buyer's local/i.test(taxLine),
        }
      : null,
    deposit: depositLine
      ? { amount: money(depositLine, { strict: true }), line: depositLine }
      : null,
    statedTotal: totalLine
      ? { amount: money(totalLine, { strict: true }), line: totalLine }
      : null,
  };
}

// RFC-4180-ish single-line CSV cell splitter: handles quoted fields, embedded
// commas inside quotes, and doubled "" as an escaped quote. Returns null for
// an unterminated quote so the caller can surface a real parse error instead
// of silently mis-splitting the row.
function splitCsvRow(line) {
  const cells = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (inQuotes) return null;
  cells.push(cur.trim());
  return cells;
}

function parseQuoteCsv(text) {
  const rawLines = text
    .split(/\r?\n/)
    .map((r) => r.trim())
    .filter(Boolean);
  const rows = [];
  for (let i = 0; i < rawLines.length; i++) {
    const cells = splitCsvRow(rawLines[i]);
    if (!cells)
      return {
        csvError: `Row ${i + 1} has an unterminated quote — fix the CSV or use the sample.`,
      };
    rows.push(cells);
  }
  const dataRows =
    rows.length && /^(item|field|line)$/i.test(rows[0][0] || "")
      ? rows.slice(1)
      : rows;
  const get = (re) => dataRows.find((r) => re.test(r[0] || ""));
  const subtotalRow = get(/^subtotal\b/i);
  const freightRow = get(/^(freight|shipping)\b/i);
  const taxRow = get(/^(sales\s*)?tax\b/i);
  const depositRow = get(/^deposit\b/i);
  const totalRow = dataRows
    .slice()
    .reverse()
    .find(
      (r) =>
        /^(estimated\s+|grand\s+)?total\b/i.test(r[0] || "") &&
        r !== subtotalRow,
    );
  const lineOf = (row) => (row ? row.join(", ") : null);
  const val = (row) => (row ? row.slice(1).join(", ") : "");
  return {
    subtotal: subtotalRow
      ? { amount: money(val(subtotalRow)), line: lineOf(subtotalRow) }
      : null,
    freight: freightRow
      ? {
          amount: money(val(freightRow)),
          line: lineOf(freightRow),
          looksExcluded: /not included|excluded|n\/a/i.test(val(freightRow)),
        }
      : null,
    tax: taxRow
      ? {
          amount: money(val(taxRow)),
          line: lineOf(taxRow),
          looksExcluded: /not calculated|excluded|n\/a/i.test(val(taxRow)),
        }
      : null,
    deposit: depositRow
      ? { amount: money(val(depositRow)), line: lineOf(depositRow) }
      : null,
    statedTotal: totalRow
      ? { amount: money(val(totalRow)), line: lineOf(totalRow) }
      : null,
  };
}

const QUOTE_FIELD_LABEL = {
  freight: "Freight",
  tax: "Tax",
  deposit: "Deposit",
};

function computeDelivered(fields, exclusions) {
  if (!fields.subtotal || fields.subtotal.amount == null) return null;
  const caveats = [];
  let total = fields.subtotal.amount;
  ["freight", "tax"].forEach((key) => {
    const f = fields[key];
    const label = QUOTE_FIELD_LABEL[key];
    if (!f) {
      caveats.push(
        `${label} was not found in this file — confirm directly with the supplier.`,
      );
      return;
    }
    const choice = exclusions[key];
    if (choice === "shown-amount" && f.amount != null) {
      total += f.amount;
    } else if (choice === "excluded-unknown") {
      caveats.push(
        `${label} is excluded and the amount is unknown — this total is a minimum, not final.`,
      );
    } else if (choice == null) {
      caveats.push(`${label} treatment has not been confirmed yet.`);
    }
  });
  let dueAtDelivery = total;
  let depositApplied = null;
  if (fields.deposit && fields.deposit.amount != null) {
    if (exclusions.deposit === "applies") {
      depositApplied = fields.deposit.amount;
      dueAtDelivery = total - depositApplied;
      if (dueAtDelivery < 0) {
        caveats.push(
          `The deposit (${fmtUsd(depositApplied)}) is larger than the computed total (${fmtUsd(total)}) — check for a data-entry error before relying on this number.`,
        );
        dueAtDelivery = null;
      }
    } else if (exclusions.deposit == null) {
      caveats.push("Deposit treatment has not been confirmed yet.");
    }
  } else if (fields.deposit) {
    if (exclusions.deposit !== "not-required") {
      dueAtDelivery = null;
      caveats.push(
        "A deposit line was found, but its dollar amount is unreadable or unresolved — confirm it with the supplier.",
      );
    }
  } else {
    dueAtDelivery = null;
    caveats.push(
      "No deposit line was found — deposit status is unknown, not confirmed as none required.",
    );
  }
  if (
    fields.statedTotal &&
    fields.statedTotal.amount != null &&
    Math.abs(fields.statedTotal.amount - total) > 0.01
  ) {
    caveats.push(
      `The quote's own stated total (${fmtUsd(fields.statedTotal.amount)}) doesn't match this computed total (${fmtUsd(total)}) — worth a second look.`,
    );
  }
  return {
    subtotal: fields.subtotal.amount,
    total,
    dueAtDelivery,
    depositApplied,
    caveats,
  };
}

function quoteExclusionGroup(ctx, key, field, current) {
  if (!field) {
    return `<div class="tool-card dec-exclusion-group"><p class="tool-label">${QUOTE_FIELD_LABEL[key]}</p><p class="tool-note">Not found in this file. Ask the supplier directly before assuming it is $0.</p></div>`;
  }
  const options = [
    ["included", "Included in the subtotal shown"],
    ...(field.amount != null
      ? [
          [
            "shown-amount",
            `Additional charge shown: ${fmtUsd(field.amount)} — add to the total`,
          ],
        ]
      : []),
    ["excluded-unknown", "Excluded — amount not yet known"],
    ["excluded-zero", "Excluded — confirmed $0 for this job"],
  ];
  return `<div class="tool-card dec-exclusion-group">
    <p class="tool-label">${QUOTE_FIELD_LABEL[key]}</p>
    <p class="dec-parsed-source">“${ctx.escape(field.line)}”</p>
    ${field.looksExcluded ? '<p class="tool-note">Wording in the quote suggests this is excluded — confirm below, it is not assumed.</p>' : ""}
    <div class="dec-exclusion-options">
      ${options
        .map(
          ([val, text]) =>
            `<label class="dec-exclusion-option${current === val ? " is-checked" : ""}"><input type="radio" name="dec-quote-${key}" value="${val}" data-key="${key}"${current === val ? " checked" : ""}><span>${text}</span></label>`,
        )
        .join("")}
    </div>
  </div>`;
}

function quoteDepositGroup(ctx, field, current) {
  if (!field)
    return `<div class="tool-card dec-exclusion-group"><p class="tool-label">Deposit</p><p class="tool-note">No deposit line found — deposit status is unknown, not confirmed as none required.</p></div>`;
  const options =
    field.amount == null
      ? [
          ["unknown", "Amount unresolved — ask the supplier"],
          ["not-required", "Confirmed not required for this order"],
        ]
      : [
          [
            "applies",
            `Applies — subtract ${fmtUsd(field.amount)} from the amount due at delivery`,
          ],
          ["not-required", "Not required for this order"],
        ];
  return `<div class="tool-card dec-exclusion-group">
    <p class="tool-label">Deposit</p>
    <p class="dec-parsed-source">“${ctx.escape(field.line)}”</p>
    <div class="dec-exclusion-options">
      ${options
        .map(
          ([val, text]) =>
            `<label class="dec-exclusion-option${current === val ? " is-checked" : ""}"><input type="radio" name="dec-quote-deposit" value="${val}" data-key="deposit"${current === val ? " checked" : ""}><span>${text}</span></label>`,
        )
        .join("")}
    </div>
  </div>`;
}

function quoteRender(ctx, state) {
  const upload = `<div class="tool-card dec-upload">
    <p class="tool-label">Load a quote</p>
    <div class="dec-upload-actions">
      <label class="tool-button tool-secondary dec-file-label">Upload .txt or .csv<input type="file" accept=".txt,.csv,text/plain,text/csv" class="dec-file-input"></label>
      <button type="button" class="tool-button tool-secondary" data-sample="txt">Load sample text quote</button>
      <button type="button" class="tool-button tool-secondary" data-sample="csv">Load sample CSV quote</button>
    </div>
    <p class="tool-note">Or paste quote text directly:</p>
    <textarea class="tool-input dec-paste" rows="3" placeholder="Paste quote text here…">${state.pasteDraft ? ctx.escape(state.pasteDraft) : ""}</textarea>
    <div class="dec-upload-actions">
      <button type="button" class="tool-button tool-secondary" data-action="parse-paste">Parse pasted text</button>
    </div>
  </div>`;

  const errorBlock = state.error
    ? `<p class="tool-status dec-status-error">${ctx.escape(state.error)}</p>`
    : "";

  if (!state.fields) {
    return `<div class="tool-stack dec-quote"><span class="tool-chip dec-chip--muted">Sample project record · tile order</span>${upload}${errorBlock}</div>`;
  }

  const f = state.fields;
  const delivered = computeDelivered(f, state.exclusions);
  const readyToSave = quoteReadyToSave(f, state.exclusions);

  const parsedList = `<div class="tool-card">
    <p class="tool-label">Parsed from ${ctx.escape(state.sourceName)}</p>
    <div class="dec-parsed-row"><span>Subtotal</span><strong>${f.subtotal ? fmtUsd(f.subtotal.amount) : "Not found"}</strong></div>
    ${f.subtotal ? `<p class="dec-parsed-source">“${ctx.escape(f.subtotal.line)}”</p>` : ""}
    ${f.statedTotal ? `<div class="dec-parsed-row"><span>Total shown on quote</span><strong>${fmtUsd(f.statedTotal.amount)}</strong></div><p class="dec-parsed-source">“${ctx.escape(f.statedTotal.line)}”</p>` : ""}
  </div>`;

  const totalCard = delivered
    ? `<div class="tool-card dec-total-card">
        <p class="tool-label">Computed total</p>
        <p class="dec-parsed-row"><span>Subtotal + confirmed freight/tax</span><strong>${fmtUsd(delivered.total)}</strong></p>
        <p class="tool-label">Amount likely due at delivery</p>
        <p class="dec-total-line"><strong>${fmtUsd(delivered.dueAtDelivery)}</strong></p>
        ${delivered.caveats.length ? `<ul class="tool-list">${delivered.caveats.map((c) => `<li>${ctx.escape(c)}</li>`).join("")}</ul>` : '<p class="tool-note">Freight, tax and deposit are all confirmed above — nothing outstanding.</p>'}
      </div>`
    : `<div class="tool-card dec-total-card"><p class="tool-note">${f.subtotal ? "The subtotal line was found, but its amount could not be read." : "No subtotal line was found."} A total cannot be computed.</p></div>`;

  const actions = `<div class="tool-actions">
    <button type="button" class="tool-button tool-primary" data-action="save"${readyToSave ? "" : ' disabled aria-disabled="true"'}>Save verified quote</button>
    <button type="button" class="tool-button tool-secondary" data-action="download"${f.subtotal ? "" : ' disabled aria-disabled="true"'}>Download breakdown (.txt)</button>
  </div>`;

  return `<div class="tool-stack dec-quote">
    <span class="tool-chip dec-chip--muted">Sample project record · tile order</span>
    ${upload}
    ${errorBlock}
    ${parsedList}
    <div class="dec-exclusion-grid">
      ${quoteExclusionGroup(ctx, "freight", f.freight, state.exclusions.freight)}
      ${quoteExclusionGroup(ctx, "tax", f.tax, state.exclusions.tax)}
      ${quoteDepositGroup(ctx, f.deposit, state.exclusions.deposit)}
    </div>
    ${totalCard}
    ${actions}
  </div>`;
}

function applyQuoteParse(state, text, sourceName, kind) {
  if (!text || !text.trim()) {
    state.error = "That file or paste was empty.";
    state.fields = null;
    return;
  }
  const fields = kind === "csv" ? parseQuoteCsv(text) : parseQuoteTxt(text);
  if (fields.csvError) {
    state.error = fields.csvError;
    state.fields = null;
    return;
  }
  if (
    !fields.subtotal &&
    !fields.statedTotal &&
    !fields.freight &&
    !fields.tax &&
    !fields.deposit
  ) {
    state.error =
      "Couldn't find subtotal, freight, tax or deposit lines in this text. Try the sample quote or a file with itemized fields.";
    state.fields = null;
    return;
  }
  state.error = null;
  state.fields = fields;
  state.sourceName = sourceName;
  state.exclusions = { freight: null, tax: null, deposit: null };
}

const MAX_QUOTE_FILE_BYTES = 262144; // 256KB — generous for a text quote, small enough to read safely

function mountQuote(ctx) {
  const state = {
    fields: null,
    sourceName: null,
    exclusions: { freight: null, tax: null, deposit: null },
    error: null,
    pasteDraft: "",
  };
  let active = true;
  let requestSeq = 0;

  const bind = () => {
    ctx.on(".dec-file-input", "change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const seq = ++requestSeq;
      const isCsv = /\.csv$/i.test(file.name);
      const isTxt = /\.txt$/i.test(file.name);
      if (!isCsv && !isTxt) {
        state.error = "Only .txt or .csv quote files are supported here.";
        state.fields = null;
        draw();
        return;
      }
      if (file.size > MAX_QUOTE_FILE_BYTES) {
        state.error = `That file is too large (${Math.round(file.size / 1024)}KB) — quote text files here are capped at 256KB.`;
        state.fields = null;
        draw();
        return;
      }
      let text;
      try {
        text = await file.text();
      } catch {
        if (!active || seq !== requestSeq) return;
        state.error = "Could not read that file — try again or use the sample.";
        state.fields = null;
        draw();
        return;
      }
      if (!active || seq !== requestSeq) return;
      applyQuoteParse(state, text, file.name, isCsv ? "csv" : "txt");
      draw();
    });
    ctx.on("[data-sample]", "click", (e) => {
      requestSeq++;
      const kind = e.currentTarget.getAttribute("data-sample");
      applyQuoteParse(
        state,
        kind === "csv" ? SAMPLE_QUOTE_CSV : SAMPLE_QUOTE_TXT,
        kind === "csv" ? "sample-quote.csv" : "sample-quote.txt",
        kind,
      );
      draw();
    });
    ctx.on(".dec-paste", "input", (e) => {
      state.pasteDraft = e.currentTarget.value;
    });
    ctx.on('[data-action="parse-paste"]', "click", () => {
      requestSeq++;
      const text = state.pasteDraft || "";
      if (!text.trim()) {
        ctx.notice("Paste some quote text first.");
        return;
      }
      applyQuoteParse(state, text, "pasted text", "txt");
      draw();
    });
    ctx.on(".dec-exclusion-option input", "change", (e) => {
      const key = e.currentTarget.getAttribute("data-key");
      state.exclusions[key] = e.currentTarget.value;
      draw();
    });
    ctx.on('[data-action="save"]', "click", () => {
      const f = state.fields;
      if (!f) return;
      const readyToSave = quoteReadyToSave(f, state.exclusions);
      if (!readyToSave) {
        ctx.notice("Confirm freight, tax and deposit treatment before saving.");
        return;
      }
      const delivered = computeDelivered(f, state.exclusions);
      const hasCaveats = !!(delivered && delivered.caveats.length);
      const totalText = delivered
        ? `computed total ${fmtUsd(delivered.total)}, amount likely due at delivery ${fmtUsd(delivered.dueAtDelivery)}`
        : "total unavailable";
      const summary = `Quote ${hasCaveats ? "reviewed" : "verified"} from ${state.sourceName}: ${totalText}${hasCaveats ? `, ${delivered.caveats.length} item(s) flagged` : ""}.`;
      const detail = hasCaveats
        ? delivered.caveats.join(" ")
        : "No outstanding exclusions — freight, tax and deposit were all confirmed.";
      ctx.commit(summary, detail);
    });
    ctx.on('[data-action="download"]', "click", () => {
      const f = state.fields;
      if (!f || !f.subtotal) return;
      const delivered = computeDelivered(f, state.exclusions);
      const body = [
        `Quote breakdown — ${state.sourceName}`,
        `Subtotal: ${fmtUsd(f.subtotal.amount)}`,
        f.freight
          ? `Freight: ${f.freight.line} (treatment: ${state.exclusions.freight || "unconfirmed"})`
          : "Freight: not found in source",
        f.tax
          ? `Tax: ${f.tax.line} (treatment: ${state.exclusions.tax || "unconfirmed"})`
          : "Tax: not found in source",
        f.deposit
          ? `Deposit: ${f.deposit.line} (treatment: ${state.exclusions.deposit || "unconfirmed"})`
          : "Deposit: none found — status unknown",
        `Computed total: ${delivered ? fmtUsd(delivered.total) : "unknown"}`,
        `Amount likely due at delivery: ${delivered ? fmtUsd(delivered.dueAtDelivery) : "unknown"}`,
        delivered && delivered.caveats.length
          ? `Flags:\n- ${delivered.caveats.join("\n- ")}`
          : "Flags: none",
      ].join("\n");
      ctx.download("quote-breakdown.txt", body, "text/plain");
    });
  };

  const draw = () => {
    if (!active) return;
    ctx.setContent(quoteRender(ctx, state));
    bind();
  };

  ctx.open(
    "Verify the quote",
    "Tile order · parsed from source text",
    quoteRender(ctx, state),
  );
  ctx.cleanup(() => {
    active = false;
  });
  bind();
  return ctx.panel;
}

// ---------------------------------------------------------------------------
// LEADTIME — promised vs confirmed date, buffer controls recompute a safe start; draft only
// ---------------------------------------------------------------------------

// Days are stored as plain "day of September" integers for readability, but
// formatted through a real UTC Date so a buffer that pushes past month end
// (e.g. day 23 + 14 = day 37) rolls over correctly into October instead of
// printing a nonsense "Sep 37".
const LEADTIME_YEAR = 2026;
const LEADTIME_MONTH_INDEX = 8; // September, 0-based

const LEADTIME_RECORD = {
  job: "Kitchen tile order — Riverside Tile Supply",
  dependencyLabel: "Jordan's (tile setter) start date",
  bookedDay: 20,
  promisedDay: 18,
  windowEarliestDay: 18,
  windowLatestDay: 23,
  confirmed: false,
  lastRefreshedDay: 4,
  anchorTodayDay: 16,
};

function fmtLeadDate(day) {
  const d = new Date(Date.UTC(LEADTIME_YEAR, LEADTIME_MONTH_INDEX, day));
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function leadtimeRender(ctx, state) {
  const rec = LEADTIME_RECORD;
  const staleDays = rec.anchorTodayDay - rec.lastRefreshedDay;
  const isStale = staleDays > 7;

  const basisCard = `<div class="tool-card">
    <p class="tool-label">Basis for the safe start</p>
    <div class="dec-exclusion-options">
      <label class="dec-exclusion-option${state.basis === "promised" ? " is-checked" : ""}"><input type="radio" name="dec-basis" value="promised"${state.basis === "promised" ? " checked" : ""}><span>Promised ETA — ${fmtLeadDate(rec.promisedDay)}</span></label>
      <label class="dec-exclusion-option${state.basis === "window" ? " is-checked" : ""}"><input type="radio" name="dec-basis" value="window"${state.basis === "window" ? " checked" : ""}><span>Worst-case window — ${fmtLeadDate(rec.windowEarliestDay)}–${fmtLeadDate(rec.windowLatestDay)}</span></label>
    </div>
  </div>`;

  const bufferCard = `<div class="tool-card">
    <p class="tool-label">Prep buffer (days)</p>
    <div class="dec-buffer-control">
      <button type="button" class="tool-button tool-secondary dec-stepper" data-step="-1" aria-label="Decrease buffer">−</button>
      <input type="number" class="tool-input dec-buffer-input" min="0" max="14" step="1" value="${state.buffer}">
      <button type="button" class="tool-button tool-secondary dec-stepper" data-step="1" aria-label="Increase buffer">+</button>
    </div>
    ${state.bufferNotice ? `<p class="tool-status dec-status-error">${ctx.escape(state.bufferNotice)}</p>` : ""}
  </div>`;

  let resultBlock;
  if (!state.basis) {
    resultBlock = `<div class="tool-card dec-empty"><p class="tool-copy">Choose a basis above to compute a safe start date for ${ctx.escape(rec.dependencyLabel)}.</p></div>`;
  } else {
    const baseDay =
      state.basis === "promised" ? rec.promisedDay : rec.windowLatestDay;
    const safeDay = baseDay + state.buffer;
    const risk = safeDay > rec.bookedDay;
    const diff = Math.abs(safeDay - rec.bookedDay);
    resultBlock = `<div class="tool-card">
      <p class="tool-label">Recomputed safe start</p>
      <p class="dec-total-line"><strong>${fmtLeadDate(safeDay)}</strong></p>
      <div class="dec-risk-banner dec-risk-banner--${risk ? "bad" : "ok"}">
        ${
          risk
            ? `Booked start (${fmtLeadDate(rec.bookedDay)}) is ${diff} day(s) before this safe start. Consider moving the booking or confirming the ETA.`
            : `Booked start (${fmtLeadDate(rec.bookedDay)}) has a ${diff}-day cushion after this safe start.`
        }
      </div>
    </div>`;
  }

  const staleBlock = isStale
    ? `<div class="tool-card">
        <p class="tool-status dec-status-error">Stale — supplier hasn't reconfirmed the ETA in ${staleDays} days (last refreshed ${fmtLeadDate(rec.lastRefreshedDay)}).</p>
        <label class="dec-exclusion-option${state.ackStale ? " is-checked" : ""}"><input type="checkbox" class="dec-ack-stale"${state.ackStale ? " checked" : ""}><span>I understand this ETA hasn't been reconfirmed by the supplier.</span></label>
      </div>`
    : "";

  const canSave = !!state.basis && (!isStale || state.ackStale);

  return `<div class="tool-stack dec-leadtime">
    <span class="tool-chip dec-chip--muted">Sample project record · ${ctx.escape(rec.job)}</span>
    <div class="tool-card">
      <p class="tool-label">Dependency</p>
      <p class="dec-parsed-row"><span>${ctx.escape(rec.dependencyLabel)}</span><strong>booked ${fmtLeadDate(rec.bookedDay)}</strong></p>
      <p class="dec-parsed-row"><span>Supplier confirmation</span><strong>${rec.confirmed ? "Confirmed" : "Promised only, not confirmed"}</strong></p>
    </div>
    ${staleBlock}
    ${basisCard}
    ${bufferCard}
    ${resultBlock}
    <div class="tool-actions">
      <button type="button" class="tool-button tool-primary" data-action="save"${canSave ? "" : ' disabled aria-disabled="true"'}>Save draft schedule note</button>
    </div>
    <p class="tool-note">This only drafts a schedule-risk note for a human to act on — nothing here books, rebooks, or notifies anyone.</p>
  </div>`;
}

function mountLeadtime(ctx) {
  const state = { basis: null, buffer: 2, bufferNotice: null, ackStale: false };
  const rec = LEADTIME_RECORD;

  const bind = () => {
    ctx.on('input[name="dec-basis"]', "change", (e) => {
      state.basis = e.currentTarget.value;
      draw();
    });
    ctx.on(".dec-stepper", "click", (e) => {
      const step = parseInt(e.currentTarget.getAttribute("data-step"), 10);
      const next = Math.min(14, Math.max(0, state.buffer + step));
      state.buffer = next;
      state.bufferNotice = null;
      draw();
    });
    ctx.on(".dec-buffer-input", "change", (e) => {
      const raw = e.currentTarget.value.trim();
      if (!/^-?\d+$/.test(raw)) {
        state.bufferNotice =
          "Enter a whole number of days (no decimals or text).";
        draw();
        return;
      }
      const n = parseInt(raw, 10);
      if (n < 0 || n > 14) {
        state.buffer = Math.min(14, Math.max(0, n));
        state.bufferNotice = "Buffer must be between 0 and 14 days — adjusted.";
        draw();
        return;
      }
      state.buffer = n;
      state.bufferNotice = null;
      draw();
    });
    ctx.on(".dec-ack-stale", "change", (e) => {
      state.ackStale = e.currentTarget.checked;
      draw();
    });
    ctx.on('[data-action="save"]', "click", () => {
      const staleDays = rec.anchorTodayDay - rec.lastRefreshedDay;
      const isStale = staleDays > 7;
      if (!state.basis) {
        ctx.notice(
          "Choose a basis (promised ETA or worst-case window) before saving.",
        );
        return;
      }
      if (isStale && !state.ackStale) {
        ctx.notice("Acknowledge the stale ETA before saving.");
        return;
      }
      const baseDay =
        state.basis === "promised" ? rec.promisedDay : rec.windowLatestDay;
      const safeDay = baseDay + state.buffer;
      const risk = safeDay > rec.bookedDay;
      const summary = `Draft note saved: safe start recomputed to ${fmtLeadDate(safeDay)} (${state.basis === "promised" ? "promised ETA" : "worst-case window"} + ${state.buffer}-day buffer) — ${risk ? `risk flagged against the ${fmtLeadDate(rec.bookedDay)} booking.` : `on track against the ${fmtLeadDate(rec.bookedDay)} booking.`}`;
      const detail = isStale
        ? `ETA last refreshed ${fmtLeadDate(rec.lastRefreshedDay)}, ${staleDays} days ago. Not booked — flagged for the scheduler to confirm.`
        : "Not booked — flagged for the scheduler to confirm.";
      ctx.commit(summary, detail);
    });
  };

  const draw = () => {
    ctx.setContent(leadtimeRender(ctx, state));
    bind();
  };

  ctx.open(
    "Expose the schedule risk",
    "Tile ETA vs. booked trade start",
    leadtimeRender(ctx, state),
  );
  bind();
  return ctx.panel;
}

// ---------------------------------------------------------------------------
// SIGNOFF — separate trade-suitability and homeowner-budget lanes; one authority never approves both
// ---------------------------------------------------------------------------

const SIGNOFF_RECORD = {
  job: "Kitchen backsplash retile",
  trade: {
    name: "Marcus",
    roleLabel: "tile setter",
    evidence:
      "Tile Spec v3 — 3×6 subway ceramic, thinset mortar. Substrate: cement board, dry-fit checked Sep 12.",
    checklist: [
      "Substrate confirmed suitable",
      "Layout matches the approved plan",
      "No visible damage in staged material",
    ],
  },
  budget: {
    name: "Dana",
    roleLabel: "homeowner",
    evidence:
      "Quote #4471 — Riverside Tile Supply. Subtotal $538.00. Freight and tax unresolved. $150.00 deposit noted.",
    checklist: [
      "Reviewed the subtotal and line items",
      "Understand freight/tax are not yet final",
      "Confirmed the deposit amount is acceptable",
    ],
  },
};

function newLaneState() {
  return {
    status: "none",
    checked: {},
    declineReason: "",
    revokeReason: "",
    revokeConfirming: false,
    declineOpen: false,
  };
}

function laneStatusChip(status) {
  const map = {
    none: ["muted", "Not requested"],
    requested: ["warn", "Requested"],
    approved: ["ok", "Approved"],
    declined: ["bad", "Declined"],
    revoked: ["bad", "Revoked"],
  };
  const [tone, text] = map[status];
  return `<span class="tool-chip dec-chip--${tone}">${text}</span>`;
}

function signoffLaneHtml(ctx, laneKey, lane, laneState, actingRole, dayLabel) {
  const active = actingRole === laneKey;
  const checklist = lane.checklist;
  const allChecked = checklist.every((_, i) => laneState.checked[i]);

  let body = "";
  if (laneState.status === "none") {
    body = `<button type="button" class="tool-button tool-primary dec-lane-btn" data-lane="${laneKey}" data-action="request"${active ? "" : ' disabled aria-disabled="true"'}>Request ${ctx.escape(lane.name)}'s review</button>
      ${active ? "" : `<p class="tool-note">Switch to ${ctx.escape(lane.name)} above to request this review.</p>`}`;
  } else if (laneState.status === "requested") {
    body = `<div class="dec-checklist">
      ${checklist
        .map(
          (item, i) =>
            `<label class="dec-exclusion-option${laneState.checked[i] ? " is-checked" : ""}"><input type="checkbox" data-lane="${laneKey}" data-check="${i}"${laneState.checked[i] ? " checked" : ""}${active ? "" : " disabled"}><span>${ctx.escape(item)}</span></label>`,
        )
        .join("")}
    </div>
    <div class="tool-actions">
      <button type="button" class="tool-button tool-primary" data-lane="${laneKey}" data-action="approve"${active && allChecked ? "" : ' disabled aria-disabled="true"'}>Approve ${laneKey === "trade" ? "suitability" : "budget"}</button>
      <button type="button" class="tool-button tool-secondary" data-lane="${laneKey}" data-action="decline-open"${active ? "" : ' disabled aria-disabled="true"'}>Decline</button>
    </div>
    ${active && !allChecked ? '<p class="tool-note">Check every item before approving.</p>' : ""}
    ${
      laneState.declineOpen
        ? `<textarea class="tool-input dec-decline-reason" data-lane="${laneKey}" rows="2" placeholder="Reason for declining…">${ctx.escape(laneState.declineReason)}</textarea>
           <div class="tool-actions">
             <button type="button" class="tool-button tool-secondary" data-lane="${laneKey}" data-action="decline-confirm">Confirm decline</button>
           </div>`
        : ""
    }`;
  } else if (
    laneState.status === "approved" ||
    laneState.status === "declined"
  ) {
    body = `<p class="tool-note">${laneState.status === "approved" ? "Approved" : "Declined"} by ${ctx.escape(lane.name)} (${ctx.escape(lane.roleLabel)}), ${dayLabel}.</p>
      ${laneState.status === "declined" && laneState.declineReason ? `<p class="dec-parsed-source">“${ctx.escape(laneState.declineReason)}”</p>` : ""}
      <div class="tool-actions">
        ${
          laneState.status === "approved"
            ? `<button type="button" class="tool-button tool-secondary" data-lane="${laneKey}" data-action="revoke-open"${active ? "" : ' disabled aria-disabled="true"'}>Revoke approval</button>`
            : `<button type="button" class="tool-button tool-secondary" data-lane="${laneKey}" data-action="restart"${active ? "" : ' disabled aria-disabled="true"'}>Start a new review</button>`
        }
      </div>
      ${
        laneState.revokeConfirming
          ? `<textarea class="tool-input dec-revoke-reason" data-lane="${laneKey}" rows="2" placeholder="Reason for revoking…">${ctx.escape(laneState.revokeReason)}</textarea>
             <div class="tool-actions">
               <button type="button" class="tool-button tool-secondary" data-lane="${laneKey}" data-action="revoke-confirm">Confirm revoke</button>
               <button type="button" class="tool-button tool-secondary" data-lane="${laneKey}" data-action="revoke-cancel">Cancel</button>
             </div>`
          : ""
      }`;
  } else if (laneState.status === "revoked") {
    body = `<p class="tool-note">Revoked by ${ctx.escape(lane.name)}, ${dayLabel}${laneState.revokeReason ? ` — “${ctx.escape(laneState.revokeReason)}”` : ""}.</p>
      <div class="tool-actions">
        <button type="button" class="tool-button tool-secondary" data-lane="${laneKey}" data-action="restart"${active ? "" : ' disabled aria-disabled="true"'}>Start a new review</button>
      </div>`;
  }

  return `<div class="tool-card dec-lane">
    <div class="dec-lane-header">
      <p class="tool-label">${laneKey === "trade" ? "Trade suitability" : "Homeowner budget"} — ${ctx.escape(lane.name)}, ${ctx.escape(lane.roleLabel)}</p>
      ${laneStatusChip(laneState.status)}
    </div>
    <p class="tool-copy">${ctx.escape(lane.evidence)}</p>
    ${body}
  </div>`;
}

function signoffRender(ctx, state) {
  const rec = SIGNOFF_RECORD;
  const bothApproved =
    state.trade.status === "approved" && state.budget.status === "approved";
  const clearedCount = [state.trade.status, state.budget.status].filter(
    (s) => s === "approved",
  ).length;

  const roleCard = `<div class="tool-card">
    <p class="tool-label">Acting as</p>
    <div class="dec-exclusion-options">
      <label class="dec-exclusion-option${state.actingRole === "trade" ? " is-checked" : ""}"><input type="radio" name="dec-acting" value="trade"${state.actingRole === "trade" ? " checked" : ""}><span>${ctx.escape(rec.trade.name)} — ${ctx.escape(rec.trade.roleLabel)} (trade)</span></label>
      <label class="dec-exclusion-option${state.actingRole === "budget" ? " is-checked" : ""}"><input type="radio" name="dec-acting" value="budget"${state.actingRole === "budget" ? " checked" : ""}><span>${ctx.escape(rec.budget.name)} — ${ctx.escape(rec.budget.roleLabel)} (budget)</span></label>
    </div>
    ${!state.actingRole ? '<p class="tool-note">Select who is acting to enable review actions below.</p>' : ""}
  </div>`;

  const banner = bothApproved
    ? `<div class="dec-risk-banner dec-risk-banner--ok">Trade and budget both cleared — by two separate authorities, ${ctx.escape(rec.trade.name)} and ${ctx.escape(rec.budget.name)}.</div>`
    : `<div class="dec-risk-banner dec-risk-banner--warn">${clearedCount} of 2 lanes cleared. Trade fit and budget cost stay separate approvals.</div>`;

  return `<div class="tool-stack dec-signoff">
    <span class="tool-chip dec-chip--muted">Sample project record · ${ctx.escape(rec.job)}</span>
    ${banner}
    ${roleCard}
    <div class="dec-lane-grid">
      ${signoffLaneHtml(ctx, "trade", rec.trade, state.trade, state.actingRole, "Sep 14")}
      ${signoffLaneHtml(ctx, "budget", rec.budget, state.budget, state.actingRole, "Sep 15")}
    </div>
    <div class="tool-actions">
      <button type="button" class="tool-button tool-primary" data-action="save">Save signoff record</button>
    </div>
  </div>`;
}

function signoffLaneText(key, lane, laneState) {
  if (laneState.status === "none")
    return `${key === "trade" ? "Trade" : "Budget"} — not yet requested.`;
  if (laneState.status === "requested")
    return `${key === "trade" ? "Trade" : "Budget"} — requested, awaiting ${lane.name}.`;
  if (laneState.status === "approved")
    return `${key === "trade" ? "Trade" : "Budget"} — approved by ${lane.name} (${lane.roleLabel}).`;
  if (laneState.status === "declined")
    return `${key === "trade" ? "Trade" : "Budget"} — declined by ${lane.name}${laneState.declineReason ? `: ${laneState.declineReason}` : "."}`;
  return `${key === "trade" ? "Trade" : "Budget"} — revoked by ${lane.name}${laneState.revokeReason ? `: ${laneState.revokeReason}` : "."}`;
}

function mountSignoff(ctx) {
  const rec = SIGNOFF_RECORD;
  const state = {
    actingRole: null,
    trade: newLaneState(),
    budget: newLaneState(),
  };

  const bind = () => {
    ctx.on('input[name="dec-acting"]', "change", (e) => {
      state.actingRole = e.currentTarget.value;
      draw();
    });
    ctx.on("[data-action]", "click", (e) => {
      const laneKey = e.currentTarget.getAttribute("data-lane");
      const action = e.currentTarget.getAttribute("data-action");
      if (!action) return;
      if (action === "save") {
        const summary = `Signoff record: ${signoffLaneText("trade", rec.trade, state.trade)} ${signoffLaneText("budget", rec.budget, state.budget)}`;
        const detail = `${rec.trade.evidence} / ${rec.budget.evidence}`;
        ctx.commit(summary, detail);
        return;
      }
      if (!laneKey) return;
      const lane = rec[laneKey];
      const laneState = state[laneKey];
      if (state.actingRole !== laneKey) {
        ctx.notice(
          `Only ${lane.name} (${lane.roleLabel}) can act on this lane. Switch "Acting as" above.`,
        );
        return;
      }
      if (action === "request") {
        laneState.status = "requested";
        laneState.checked = {};
      } else if (action === "approve") {
        const allChecked = lane.checklist.every((_, i) => laneState.checked[i]);
        if (!allChecked) {
          ctx.notice("Confirm every checklist item before approving.");
          return;
        }
        laneState.status = "approved";
        laneState.declineOpen = false;
      } else if (action === "decline-open") {
        laneState.declineOpen = true;
      } else if (action === "decline-confirm") {
        if (!laneState.declineReason || !laneState.declineReason.trim()) {
          ctx.notice("Add a short reason before declining.");
          return;
        }
        laneState.status = "declined";
        laneState.declineOpen = false;
      } else if (action === "revoke-open") {
        laneState.revokeConfirming = true;
      } else if (action === "revoke-cancel") {
        laneState.revokeConfirming = false;
        laneState.revokeReason = "";
      } else if (action === "revoke-confirm") {
        if (!laneState.revokeReason || !laneState.revokeReason.trim()) {
          ctx.notice("Add a short reason before revoking.");
          return;
        }
        laneState.status = "revoked";
        laneState.revokeConfirming = false;
      } else if (action === "restart") {
        state[laneKey] = newLaneState();
      }
      draw();
    });
    ctx.on('.dec-checklist input[type="checkbox"]', "change", (e) => {
      const laneKey = e.currentTarget.getAttribute("data-lane");
      const idx = e.currentTarget.getAttribute("data-check");
      state[laneKey].checked[idx] = e.currentTarget.checked;
      draw();
    });
    ctx.on(".dec-decline-reason", "input", (e) => {
      state[e.currentTarget.getAttribute("data-lane")].declineReason =
        e.currentTarget.value;
    });
    ctx.on(".dec-revoke-reason", "input", (e) => {
      state[e.currentTarget.getAttribute("data-lane")].revokeReason =
        e.currentTarget.value;
    });
  };

  const draw = () => {
    ctx.setContent(signoffRender(ctx, state));
    bind();
  };

  ctx.open(
    "Keep approvals separate",
    "Trade suitability vs. homeowner budget",
    signoffRender(ctx, state),
  );
  bind();
  return ctx.panel;
}

// ---------------------------------------------------------------------------

export const decisionTools = [
  {
    id: "recall",
    title: "Recall the decision and its owner",
    modality: "source",
    prompt: "Remind me — did Sam approve eggshell or satin for the hallway?",
    response:
      "Sam approved eggshell, Coastal Fog, on Sep 10. That's the decision on file — I can show you the timeline and where it's sourced from.",
    entryLabel: "Open decision timeline",
    description:
      "A source-linked timeline of every draft, request and approval behind the hallway paint sheen, with a before/after view of what each entry actually changed.",
    steps: [
      "Step through the timeline from first draft to the attributed approval.",
      "Open any entry to see exactly what changed, before and after.",
      "Pin the attributed answer — only real approvals can be pinned, not drafts or requests.",
    ],
    boundary:
      "Retrieves the recorded decision only. It does not re-confirm the choice with Sam or check current stock.",
    mount: mountRecall,
  },
  {
    id: "quote",
    title: "Turn the supplier's quote into a verified number",
    modality: "source",
    prompt:
      "Can you check this tile quote — I don't want surprises on delivery.",
    response:
      "Send the quote as text or CSV and I'll pull out the subtotal, freight, tax and deposit lines so you can confirm what's actually excluded.",
    entryLabel: "Open quote verifier",
    description:
      "Upload a real .txt or .csv quote (or use the sample), see exactly which lines were parsed, and confirm freight/tax/deposit treatment before trusting any delivered total.",
    steps: [
      "Upload the supplier quote as .txt or .csv, paste it, or load the sample.",
      "Confirm how freight, tax and deposit are actually treated — nothing is assumed from wording.",
      "Save the verified breakdown; the delivered total stays flagged until freight and tax are confirmed.",
    ],
    boundary:
      "Reads only the text you provide — no PDF, image or OCR extraction. The delivered total is an estimate until freight and tax are confirmed.",
    mount: mountQuote,
  },
  {
    id: "leadtime",
    title: "Expose the schedule risk",
    modality: "compare",
    prompt: "Is the tile going to be here before Jordan starts setting it?",
    response:
      "The supplier promised Sep 18 but hasn't reconfirmed since Sep 4. Let's compute a safe start against the worst case, not just the promise.",
    entryLabel: "Open schedule risk",
    description:
      "Compares the supplier's promised date against an unconfirmed, stale-flagged delivery window, and recomputes a safe dependent task start as you adjust the prep buffer.",
    steps: [
      "Choose whether the safe start is based on the promised ETA or the worst-case window.",
      "Adjust the prep buffer and watch the safe start and risk banner recompute live.",
      "Save a draft schedule-risk note — booking stays disabled, this only flags risk for a human to act on.",
    ],
    boundary:
      "Recomputes a draft safe-start date only. Nothing is booked, rebooked, or sent to the supplier or trade.",
    mount: mountLeadtime,
  },
  {
    id: "signoff",
    title: "Keep trade and budget approvals separate",
    modality: "followup",
    prompt: "Has the backsplash actually been signed off?",
    response:
      "Trade fit and homeowner budget are tracked as two separate approvals here — Marcus covers suitability, Dana covers cost. Neither can approve the other's lane.",
    entryLabel: "Open signoff record",
    description:
      "Two independent lanes — trade suitability and homeowner budget — each with its own evidence, checklist, and locally simulated request/approve/revoke flow.",
    steps: [
      "Pick who is acting: only that person's lane becomes actionable.",
      "Work a lane through its evidence checklist to approve or decline it.",
      "Revoke requires a typed reason and a second confirming click; save the record at any point.",
    ],
    boundary:
      "Simulated locally in this browser only. No request is sent to Marcus or Dana, and no charge is implied by a budget approval.",
    mount: mountSignoff,
  },
];
