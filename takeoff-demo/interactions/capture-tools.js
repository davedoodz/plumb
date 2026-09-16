// capture-tools.js
// Three interaction studies for the "capture" family: capture (camera or
// reference photo, pinned spot, note), prompt (guided multi-photo coverage
// checklist), walkthrough (optional local audio note, typed note, tags).
// Vanilla DOM only, no frameworks.
//
// mount(ctx) calls ctx.open(title, subtitle, html) and returns the content
// root (ctx.panel). ctx.asset(name) resolves media, ctx.escape() html-
// escapes, ctx.cleanup(fn) runs on close/reset/change, ctx.notice(text)
// updates accessible status. ctx.commit(summary, plainTextDetail,
// attachments=[]) closes the sheet and posts the result into the chat —
// detail is plain text (escaped by the host, never HTML); attachments is
// [{ url, kind: 'image'|'audio', alt }] and renders as real media in the
// thread. Data URLs are retained after close, so it's safe to hand them
// over here. ctx.download(filename, content, mime) triggers a real local
// download; content may be a Blob.
//
// No pretend backend, OCR, speech recognition, or measurement-from-photo
// claims. Every camera/microphone call is a real getUserMedia() request;
// every "reference" / "demo" / "editable, not transcribed" affordance is
// labelled as such in the UI copy.

const REFERENCE_PHOTOS = [
  { src: "tiles-room.png", label: "Floor & tile area" },
  { src: "framing-room.png", label: "Framing / stud bay" },
  { src: "paint-room.png", label: "Painted wall" },
  { src: "lighting-room.png", label: "Light fixture" },
];

const CHECKLIST_ITEMS = [
  {
    id: "context",
    label: "Full room or area",
    hint: "A wide shot showing the whole space.",
    library: [
      { src: "tiles-room.png", label: "Bathroom floor" },
      { src: "framing-room.png", label: "Framed wall" },
      { src: "paint-room.png", label: "Living room wall" },
      { src: "lighting-room.png", label: "Kitchen ceiling" },
    ],
  },
  {
    id: "fixture",
    label: "Existing fixture or material",
    hint: "A close-up of what needs to change.",
    library: [
      { src: "tiles-sample.png", label: "Tile sample" },
      { src: "framing-stack.png", label: "Stud stack" },
      { src: "paint-swatches.png", label: "Paint swatches" },
      { src: "lighting-pendant.png", label: "Pendant fixture" },
    ],
  },
  {
    id: "clearance",
    label: "Access & clearance",
    hint: "Anything around the work area that could get in the way.",
    library: [
      { src: "tiles-layout.png", label: "Layout plan" },
      { src: "framing-plan.png", label: "Framing plan" },
      { src: "paint-sheen.png", label: "Sheen reference" },
      { src: "lighting-comparison.png", label: "Fixture comparison" },
    ],
  },
  {
    id: "label",
    label: "Model or spec label",
    hint: "Any visible tag, panel, or marking.",
    library: [
      { src: "tiles-batch.png", label: "Batch label" },
      { src: "framing-connector.png", label: "Connector spec" },
      { src: "paint-batch.png", label: "Batch code" },
      { src: "lighting-label.png", label: "Fixture label" },
    ],
  },
];

const ROOM_TAGS = [
  "Kitchen",
  "Bathroom",
  "Living room",
  "Bedroom",
  "Attic",
  "Exterior",
];
const MATERIAL_TAGS = [
  "Tile",
  "Grout",
  "Framing lumber",
  "Drywall",
  "Paint",
  "Light fixture",
];
const ACTION_TAGS = [
  "Inspect",
  "Replace",
  "Repair",
  "Install",
  "Remove",
  "Flag issue",
];

const ICONS = {
  camera:
    '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  shutter:
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/></svg>',
  retake:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 2.6 6.3"/><path d="M3 17v-5h5"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9 17l11-11"/></svg>',
  upload:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>',
  mic: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  download:
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 11l5 5 5-5"/><path d="M4 19h16"/></svg>',
};

function el(html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}

function stopStream(stream) {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    try {
      track.stop();
    } catch {
      /* already stopped */
    }
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function saveDataUrlToDevice(ctx, dataUrl, filename, mime) {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    ctx.download(filename, blob, mime);
    return true;
  } catch {
    ctx.notice("Couldn't prepare that file for download.");
    return false;
  }
}

function formatSeconds(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

// ---------------------------------------------------------------------------
// Tool 1: capture — camera or reference photo, pin a spot, note, attach.
// ---------------------------------------------------------------------------

function mountCapture(ctx) {
  const panel = ctx.open(
    "Attach a photo with the spec",
    "Camera or reference photo, pinned and noted",
    `
    <div class="tool-stack cap-tool">
      <p class="tool-copy">Point your camera at the spot, or start from a labelled reference photo to see how this works without one.</p>

      <div class="tool-row cap-mode-row" role="group" aria-label="Photo source">
        <button type="button" class="tool-button tool-secondary cap-mode-btn" data-mode-btn="reference" aria-pressed="true">Use reference photo</button>
        <button type="button" class="tool-button tool-secondary cap-mode-btn" data-mode-btn="camera" aria-pressed="false">Use camera</button>
      </div>

      <div class="cap-stage" data-stage>
        <div class="cap-view" data-view="reference">
          <div class="tool-grid cap-ref-grid" data-ref-grid></div>
        </div>

        <div class="cap-view" data-view="camera-idle" hidden>
          <div class="cap-camera-placeholder">
            <span class="cap-icon" aria-hidden="true">${ICONS.camera}</span>
            <p class="tool-copy">Your camera stays on this device. Attaching adds the photo to this local conversation only.</p>
            <button type="button" class="tool-button tool-primary" data-enable-camera>Enable camera</button>
          </div>
        </div>

        <div class="cap-view" data-view="camera-live" hidden>
          <video class="cap-video" data-video autoplay playsinline muted></video>
          <button type="button" class="tool-button tool-primary cap-shutter" data-shutter>${ICONS.shutter}<span>Capture frame</span></button>
        </div>

        <div class="cap-view" data-view="frame" hidden>
          <div class="cap-frame-wrap" data-frame-wrap>
            <img class="tool-image cap-frame-img" data-frame-img alt="Captured photo" />
            <span class="cap-pin-dot" data-pin-dot hidden aria-hidden="true"></span>
          </div>
          <span class="tool-chip cap-source-chip" data-source-chip></span>
        </div>
      </div>

      <p class="tool-status" data-status role="status" aria-live="polite"></p>

      <div class="cap-pin-panel" data-pin-panel hidden>
        <p class="tool-copy cap-hint" data-pin-hint>Tap the photo to drop a pin at the exact spot (optional).</p>
        <label class="tool-label" for="cap-note">Note for this spot</label>
        <textarea id="cap-note" class="tool-input" data-note rows="2" placeholder="e.g. Confirm the mounting point before ordering the pendant"></textarea>
      </div>

      <div class="tool-actions">
        <button type="button" class="tool-button tool-secondary" data-retake hidden>${ICONS.retake}<span>Retake</span></button>
        <button type="button" class="tool-button tool-secondary" data-save-photo hidden>${ICONS.download}<span>Save to device</span></button>
        <button type="button" class="tool-button tool-primary" data-attach disabled>Attach to thread</button>
      </div>
    </div>
  `,
  );

  const state = {
    mode: "reference",
    stream: null,
    frame: null, // { url, source: 'camera' | 'reference', label }
    pin: null, // { x, y } percentages
    closed: false,
  };

  const stage = panel.querySelector("[data-stage]");
  const modeButtons = Array.from(panel.querySelectorAll("[data-mode-btn]"));
  const refGrid = panel.querySelector("[data-ref-grid]");
  const video = panel.querySelector("[data-video]");
  const frameWrap = panel.querySelector("[data-frame-wrap]");
  const frameImg = panel.querySelector("[data-frame-img]");
  const pinDot = panel.querySelector("[data-pin-dot]");
  const sourceChip = panel.querySelector("[data-source-chip]");
  const statusEl = panel.querySelector("[data-status]");
  const pinPanel = panel.querySelector("[data-pin-panel]");
  const pinHint = panel.querySelector("[data-pin-hint]");
  const noteInput = panel.querySelector("[data-note]");
  const retakeBtn = panel.querySelector("[data-retake]");
  const saveBtn = panel.querySelector("[data-save-photo]");
  const attachBtn = panel.querySelector("[data-attach]");
  const canvas = document.createElement("canvas");

  refGrid.append(
    ...REFERENCE_PHOTOS.map((photo) =>
      el(`
        <button type="button" class="cap-ref-item" data-ref-item data-src="${ctx.asset(photo.src)}" data-label="${ctx.escape(photo.label)}">
          <img src="${ctx.asset(photo.src)}" alt="${ctx.escape(photo.label)}" loading="lazy" />
          <span class="cap-ref-item-caption">${ctx.escape(photo.label)}</span>
        </button>
      `),
    ),
  );

  function setStatus(text) {
    statusEl.textContent = text || "";
    if (text) ctx.notice(text);
  }

  function showView(name) {
    stage.querySelectorAll("[data-view]").forEach((view) => {
      view.hidden = view.getAttribute("data-view") !== name;
    });
  }

  function updateModeButtons() {
    modeButtons.forEach((btn) => {
      btn.setAttribute(
        "aria-pressed",
        btn.dataset.modeBtn === state.mode ? "true" : "false",
      );
    });
  }

  function enterCaptureStage() {
    state.frame = null;
    state.pin = null;
    pinPanel.hidden = true;
    pinDot.hidden = true;
    noteInput.value = "";
    retakeBtn.hidden = true;
    saveBtn.hidden = true;
    attachBtn.disabled = true;
    modeButtons.forEach((btn) => (btn.hidden = false));
    if (state.mode === "camera") {
      showView(state.stream ? "camera-live" : "camera-idle");
      setStatus(
        state.stream ? "Camera live — nothing leaves this device." : "",
      );
    } else {
      showView("reference");
      setStatus("");
    }
  }

  function setFrame(url, source, label) {
    state.frame = { url, source, label };
    state.pin = null;
    frameImg.src = url;
    pinDot.hidden = true;
    sourceChip.textContent =
      source === "camera" ? "Captured just now" : `Reference photo — ${label}`;
    sourceChip.classList.toggle("cap-chip-live", source === "camera");
    modeButtons.forEach((btn) => (btn.hidden = true));
    pinPanel.hidden = false;
    pinHint.textContent =
      "Tap the photo to drop a pin at the exact spot (optional).";
    retakeBtn.hidden = false;
    saveBtn.hidden = source !== "camera"; // only offer a real download for a real capture
    attachBtn.disabled = false;
    showView("frame");
    setStatus(
      source === "camera"
        ? "Frame captured locally."
        : `Using reference photo: ${label}.`,
    );
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state.frame) return; // mode row is hidden once a frame exists
      state.mode = btn.dataset.modeBtn;
      if (state.mode === "reference") {
        stopStream(state.stream);
        state.stream = null;
        video.srcObject = null;
      }
      updateModeButtons();
      enterCaptureStage();
    });
  });

  refGrid.addEventListener("click", (event) => {
    const item = event.target.closest("[data-ref-item]");
    if (!item) return;
    setFrame(item.dataset.src, "reference", item.dataset.label);
  });

  const enableCamera = panel.querySelector("[data-enable-camera]");
  const shutter = panel.querySelector("[data-shutter]");
  shutter.disabled = true;
  video.addEventListener("loadeddata", () => {
    shutter.disabled = !video.videoWidth;
  });
  enableCamera.addEventListener("click", async () => {
    if (enableCamera.disabled) return;
    enableCamera.disabled = true;
    shutter.disabled = true;
    setStatus("Requesting camera access…");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (state.closed || state.mode !== "camera") {
        stopStream(stream);
        return;
      }
      state.stream = stream;
      video.srcObject = stream;
      showView("camera-live");
      setStatus("Camera live — nothing leaves this device.");
    } catch (err) {
      if (state.closed) return;
      const reason = err && err.name ? err.name : "denied";
      setStatus(
        `Camera access wasn't granted (${reason}). Try again, or use a reference photo instead.`,
      );
    } finally {
      enableCamera.disabled = false;
    }
  });

  panel.querySelector("[data-shutter]").addEventListener("click", () => {
    if (!state.stream || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const g = canvas.getContext("2d");
    g.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setFrame(dataUrl, "camera", "Live capture");
  });

  frameWrap.addEventListener("click", (event) => {
    const rect = frameWrap.getBoundingClientRect();
    const point = event.touches && event.touches[0] ? event.touches[0] : event;
    const x = ((point.clientX - rect.left) / rect.width) * 100;
    const y = ((point.clientY - rect.top) / rect.height) * 100;
    state.pin = {
      x: Math.min(96, Math.max(4, x)),
      y: Math.min(96, Math.max(4, y)),
    };
    pinDot.hidden = false;
    pinDot.style.left = `${state.pin.x}%`;
    pinDot.style.top = `${state.pin.y}%`;
    pinHint.textContent = "Pin placed. Tap again to move it.";
  });

  retakeBtn.addEventListener("click", () => {
    if (state.frame && state.frame.source === "camera") {
      state.mode = "camera";
    } else {
      state.mode = "reference";
    }
    updateModeButtons();
    enterCaptureStage();
  });

  saveBtn.addEventListener("click", () => {
    if (!state.frame || state.frame.source !== "camera") return;
    saveDataUrlToDevice(
      ctx,
      state.frame.url,
      `capture-photo-${timestampSlug()}.jpg`,
      "image/jpeg",
    );
  });

  attachBtn.addEventListener("click", () => {
    if (!state.frame) return;
    const note = noteInput.value.trim();
    const pinText = state.pin
      ? `Pinned at ${Math.round(state.pin.x)}%, ${Math.round(state.pin.y)}% on the photo.`
      : "No pin placed.";
    const sourceText =
      state.frame.source === "camera"
        ? "Live camera capture."
        : `Reference photo (demo) — ${state.frame.label}.`;
    const summary =
      state.frame.source === "camera"
        ? "Photo captured and attached to the thread"
        : `Reference photo attached — ${state.frame.label}`;
    const detail = [note || "No note added.", pinText, sourceText].join("\n");
    const attachments = [
      {
        url: state.frame.url,
        kind: "image",
        alt:
          state.frame.source === "camera"
            ? "Captured photo"
            : `Reference photo — ${state.frame.label}`,
      },
    ];
    ctx.commit(summary, detail, attachments);
  });

  updateModeButtons();
  showView("reference");

  ctx.cleanup(() => {
    state.closed = true;
    stopStream(state.stream);
    state.stream = null;
  });

  return panel;
}

// ---------------------------------------------------------------------------
// Tool 2: prompt — guided multi-photo checklist, library or real upload,
// review/deselect, attach.
// ---------------------------------------------------------------------------

function mountPrompt(ctx) {
  const panel = ctx.open(
    "Cover the shot list before ordering",
    "Pick library photos or upload real ones for each item",
    `
    <div class="tool-stack cap-tool">
      <p class="tool-copy">To lock in the estimate, cover these angles. Choose a library photo or upload a real one from this device for each.</p>

      <div class="cap-progress-track tool-progress" data-progress-track>
        <div class="cap-progress-fill" data-progress-fill style="width:0%"></div>
      </div>
      <p class="tool-status" data-progress-label role="status" aria-live="polite">0 of ${CHECKLIST_ITEMS.length} covered</p>

      <ul class="tool-list cap-checklist" data-checklist></ul>

      <div class="cap-picker" data-picker hidden>
        <div class="tool-row cap-picker-head">
          <p class="tool-label" data-picker-title></p>
          <button type="button" class="tool-button tool-secondary cap-icon-btn" data-picker-close aria-label="Close picker">${ICONS.close}</button>
        </div>
        <div class="tool-grid cap-picker-grid" data-picker-grid></div>
        <label class="tool-button tool-secondary cap-upload-btn">
          ${ICONS.upload}<span>Upload a real photo from this device</span>
          <input type="file" accept="image/*" data-upload hidden />
        </label>
      </div>

      <div class="tool-actions">
        <button type="button" class="tool-button tool-primary" data-review disabled>Review selections</button>
      </div>

      <div class="cap-review" data-review-panel hidden>
        <p class="tool-label">Review before sending</p>
        <div class="tool-grid cap-review-grid" data-review-grid></div>
        <label class="tool-label" for="cap-prompt-note">Add a note (optional)</label>
        <textarea id="cap-prompt-note" class="tool-input" data-review-note rows="2" placeholder="Anything else worth flagging?"></textarea>
        <div class="tool-actions">
          <button type="button" class="tool-button tool-secondary" data-review-back>Back to checklist</button>
          <button type="button" class="tool-button tool-primary" data-attach-all disabled>Attach photos to thread</button>
        </div>
      </div>
    </div>
  `,
  );

  const state = {
    photos: {}, // itemId -> { url, label, source: 'library' | 'upload' }
    activeItem: null,
    closed: false,
  };

  const checklistEl = panel.querySelector("[data-checklist]");
  const progressFill = panel.querySelector("[data-progress-fill]");
  const progressLabel = panel.querySelector("[data-progress-label]");
  const picker = panel.querySelector("[data-picker]");
  const pickerTitle = panel.querySelector("[data-picker-title]");
  const pickerGrid = panel.querySelector("[data-picker-grid]");
  const uploadInput = panel.querySelector("[data-upload]");
  const reviewBtn = panel.querySelector("[data-review]");
  const reviewPanel = panel.querySelector("[data-review-panel]");
  const reviewGrid = panel.querySelector("[data-review-grid]");
  const attachAllBtn = panel.querySelector("[data-attach-all]");

  function itemById(id) {
    return CHECKLIST_ITEMS.find((item) => item.id === id);
  }

  function renderChecklist() {
    checklistEl.innerHTML = "";
    CHECKLIST_ITEMS.forEach((item) => {
      const chosen = state.photos[item.id];
      const row = el(`
        <li class="cap-item" data-item data-item-id="${item.id}">
          <div class="cap-item-main">
            <div class="cap-thumb${chosen ? "" : " cap-thumb-empty"}" data-thumb>
              ${chosen ? `<img src="${chosen.url}" alt="" />` : ""}
            </div>
            <div class="cap-item-copy">
              <p class="tool-label">${ctx.escape(item.label)}</p>
              <p class="tool-copy cap-item-hint">${ctx.escape(item.hint)}</p>
            </div>
            <span class="tool-chip${chosen ? " cap-chip-done" : ""}">${chosen ? ICONS.check + " Added" : "Needed"}</span>
          </div>
          <div class="tool-row">
            <button type="button" class="tool-button tool-secondary" data-choose="${item.id}">${chosen ? "Change photo" : "Choose photo"}</button>
            ${chosen ? `<button type="button" class="tool-button tool-secondary" data-remove="${item.id}">Remove</button>` : ""}
          </div>
        </li>
      `);
      checklistEl.append(row);
    });
    const count = Object.keys(state.photos).length;
    progressFill.style.width = `${(count / CHECKLIST_ITEMS.length) * 100}%`;
    progressLabel.textContent = `${count} of ${CHECKLIST_ITEMS.length} covered`;
    reviewBtn.disabled = count === 0;
  }

  function openPicker(itemId) {
    state.activeItem = itemId;
    const item = itemById(itemId);
    pickerTitle.textContent = `Choose a photo — ${item.label}`;
    pickerGrid.innerHTML = "";
    pickerGrid.append(
      ...item.library.map((photo) =>
        el(`
          <button type="button" class="cap-lib-item" data-lib-src="${ctx.asset(photo.src)}" data-lib-label="${ctx.escape(photo.label)}">
            <img src="${ctx.asset(photo.src)}" alt="${ctx.escape(photo.label)}" loading="lazy" />
            <span>${ctx.escape(photo.label)}</span>
          </button>
        `),
      ),
    );
    uploadInput.value = "";
    picker.hidden = false;
    picker.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function closePicker() {
    picker.hidden = true;
    state.activeItem = null;
  }

  checklistEl.addEventListener("click", (event) => {
    const chooseId = event.target.closest("[data-choose]")?.dataset.choose;
    const removeId = event.target.closest("[data-remove]")?.dataset.remove;
    if (chooseId) {
      openPicker(chooseId);
      return;
    }
    if (removeId) {
      delete state.photos[removeId];
      renderChecklist();
      renderReview();
    }
  });

  pickerGrid.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-lib-src]");
    if (!btn || !state.activeItem) return;
    state.photos[state.activeItem] = {
      url: btn.dataset.libSrc,
      label: btn.dataset.libLabel,
      source: "library",
    };
    closePicker();
    renderChecklist();
  });

  uploadInput.addEventListener("change", async () => {
    const file = uploadInput.files && uploadInput.files[0];
    const targetItem = state.activeItem; // captured now — picker may move on before the read finishes
    uploadInput.value = "";
    if (!file || !targetItem) return;
    if (!file.type || !file.type.startsWith("image/")) {
      ctx.notice(
        "That file doesn't look like a photo — try a JPG, PNG, or WebP.",
      );
      return;
    }
    const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
    if (file.size > MAX_UPLOAD_BYTES) {
      ctx.notice("That photo is larger than 20MB — try a smaller one.");
      return;
    }
    try {
      const dataUrl = await blobToDataUrl(file);
      if (state.closed) return;
      const preview = document.createElement("img");
      preview.src = dataUrl;
      await preview.decode();
      if (state.closed) return;
      state.photos[targetItem] = {
        url: dataUrl,
        label: file.name || "Uploaded photo",
        source: "upload",
      };
      if (state.activeItem === targetItem) closePicker();
      renderChecklist();
      renderReview();
      ctx.notice(`${file.name || "Photo"} added from this device.`);
    } catch {
      if (!state.closed)
        ctx.notice("Couldn't read that file — try a different photo.");
    }
  });

  panel
    .querySelector("[data-picker-close]")
    .addEventListener("click", closePicker);

  function renderReview() {
    reviewGrid.innerHTML = "";
    const entries = Object.entries(state.photos);
    entries.forEach(([id, photo]) => {
      const item = itemById(id);
      reviewGrid.append(
        el(`
          <div class="cap-review-item" data-review-item="${id}">
            <img src="${photo.url}" alt="" class="tool-image" />
            <button type="button" class="cap-review-remove" data-review-remove="${id}" aria-label="Remove ${ctx.escape(item.label)}">${ICONS.close}</button>
            <span class="cap-review-caption">${ctx.escape(item.label)}${photo.source === "upload" ? " · from device" : ""}</span>
          </div>
        `),
      );
    });
    attachAllBtn.disabled = entries.length === 0;
  }

  reviewGrid.addEventListener("click", (event) => {
    const id = event.target.closest("[data-review-remove]")?.dataset
      .reviewRemove;
    if (!id) return;
    delete state.photos[id];
    renderChecklist();
    renderReview();
  });

  reviewBtn.addEventListener("click", () => {
    renderReview();
    checklistEl.hidden = true;
    panel.querySelector("[data-progress-track]").hidden = true;
    progressLabel.hidden = true;
    reviewBtn.hidden = true;
    closePicker();
    reviewPanel.hidden = false;
  });

  panel.querySelector("[data-review-back]").addEventListener("click", () => {
    reviewPanel.hidden = true;
    checklistEl.hidden = false;
    panel.querySelector("[data-progress-track]").hidden = false;
    progressLabel.hidden = false;
    reviewBtn.hidden = false;
  });

  attachAllBtn.addEventListener("click", () => {
    const entries = Object.entries(state.photos);
    if (entries.length === 0) return;
    const note = panel.querySelector("[data-review-note]").value.trim();
    const labels = entries.map(([id]) => itemById(id).label);
    const summary = `${entries.length} photo${entries.length === 1 ? "" : "s"} attached for the estimate`;
    const detail = [
      `Covers: ${labels.join(", ")}.`,
      note || "No additional note.",
    ].join("\n");
    const attachments = entries.map(([id, photo]) => ({
      url: photo.url,
      kind: "image",
      alt: `${itemById(id).label}${photo.source === "upload" ? " (from device)" : ""}`,
    }));
    ctx.commit(summary, detail, attachments);
  });

  renderChecklist();

  ctx.cleanup(() => {
    state.closed = true;
    closePicker();
  });

  return panel;
}

// ---------------------------------------------------------------------------
// Tool 3: walkthrough — optional real audio recording + playback, typed
// (not transcribed) note, room/material/action tags, attach.
// ---------------------------------------------------------------------------

function mountWalkthrough(ctx) {
  const panel = ctx.open(
    "Leave a walkthrough note",
    "Optional local recording, your own typed note, tagged",
    `
    <div class="tool-stack cap-tool">
      <p class="tool-copy">A short voice note helps, or just type it. Recording is optional and stays on this device, including after attachment.</p>

      <div class="tool-card cap-record-card">
        <div class="tool-row cap-record-row">
          <button type="button" class="tool-button tool-primary cap-record-btn" data-record-btn>${ICONS.mic}<span>Start recording</span></button>
          <span class="cap-timer" data-timer hidden>0:00</span>
        </div>
        <p class="tool-status" data-record-status role="status" aria-live="polite"></p>
        <div class="cap-playback" data-playback hidden>
          <audio class="cap-audio" data-audio controls></audio>
          <div class="tool-row">
            <button type="button" class="tool-button tool-secondary" data-rerecord>${ICONS.retake}<span>Re-record</span></button>
            <button type="button" class="tool-button tool-secondary" data-save-audio>${ICONS.download}<span>Save to device</span></button>
          </div>
        </div>
      </div>

      <div class="tool-card">
        <label class="tool-label" for="cap-transcript">Your notes</label>
        <p class="tool-copy cap-transcript-caveat">Editable example note below — replace it with your own words. It is <strong>not</strong> a transcript or speech-to-text of the recording.</p>
        <textarea id="cap-transcript" class="tool-input" data-transcript rows="3" placeholder="e.g. Framing behind the tub surround is square, no blocking yet for the grab bar.">Framing behind the tub surround looks square and ready for tile backer. No blocking added yet for the grab bar.</textarea>
      </div>

      <div class="cap-tag-group" data-tag-group="room">
        <p class="tool-label">Room</p>
        <div class="tool-row cap-chip-row" data-tag-row="room"></div>
      </div>
      <div class="cap-tag-group" data-tag-group="material">
        <p class="tool-label">Material</p>
        <div class="tool-row cap-chip-row" data-tag-row="material"></div>
      </div>
      <div class="cap-tag-group" data-tag-group="action">
        <p class="tool-label">Action</p>
        <div class="tool-row cap-chip-row" data-tag-row="action"></div>
      </div>

      <div class="tool-actions">
        <button type="button" class="tool-button tool-primary" data-attach-note disabled>Attach note to thread</button>
      </div>
    </div>
  `,
  );

  const state = {
    stream: null,
    recorder: null,
    chunks: [],
    phase: "idle", // 'idle' | 'requesting' | 'recording' | 'finalizing'
    previewUrl: null,
    audioDataUrl: null,
    audioMime: "audio/webm",
    timerHandle: null,
    startedAt: 0,
    closed: false,
    tags: { room: null, material: null, action: null },
  };

  const recordBtn = panel.querySelector("[data-record-btn]");
  const timerEl = panel.querySelector("[data-timer]");
  const recordStatus = panel.querySelector("[data-record-status]");
  const playback = panel.querySelector("[data-playback]");
  const audioEl = panel.querySelector("[data-audio]");
  const saveAudioBtn = panel.querySelector("[data-save-audio]");
  const transcriptEl = panel.querySelector("[data-transcript]");
  const attachBtn = panel.querySelector("[data-attach-note]");

  function buildTagRow(name, options) {
    const row = panel.querySelector(`[data-tag-row="${name}"]`);
    row.append(
      ...options.map((label) =>
        el(
          `<button type="button" class="tool-chip" data-tag="${name}" data-value="${ctx.escape(label)}" aria-pressed="false">${ctx.escape(label)}</button>`,
        ),
      ),
    );
    row.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-tag]");
      if (!btn) return;
      const value = btn.dataset.value;
      const already = state.tags[name] === value;
      state.tags[name] = already ? null : value;
      row.querySelectorAll("[data-tag]").forEach((el2) => {
        el2.setAttribute(
          "aria-pressed",
          !already && el2.dataset.value === value ? "true" : "false",
        );
      });
      updateAttachEnabled();
    });
  }

  buildTagRow("room", ROOM_TAGS);
  buildTagRow("material", MATERIAL_TAGS);
  buildTagRow("action", ACTION_TAGS);

  function updateAttachEnabled() {
    const busy =
      state.phase === "requesting" ||
      state.phase === "recording" ||
      state.phase === "finalizing";
    attachBtn.disabled = busy || transcriptEl.value.trim().length === 0;
  }
  transcriptEl.addEventListener("input", updateAttachEnabled);

  function setPhase(phase) {
    state.phase = phase;
    recordBtn.disabled = phase === "requesting" || phase === "finalizing";
    saveAudioBtn.disabled = phase !== "idle" || !state.audioDataUrl;
    updateAttachEnabled();
  }

  function clearTimer() {
    if (state.timerHandle) {
      clearInterval(state.timerHandle);
      state.timerHandle = null;
    }
  }

  function stopRecordingTracks() {
    stopStream(state.stream);
    state.stream = null;
  }

  async function startRecording() {
    if (state.phase !== "idle") return; // guard against double-click creating a second stream
    if (typeof MediaRecorder === "undefined") {
      recordStatus.textContent =
        "This browser doesn't support local audio recording. You can still type your note.";
      return;
    }
    setPhase("requesting");
    recordStatus.textContent = "Requesting microphone access…";
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      if (state.closed) return;
      setPhase("idle");
      const reason = err && err.name ? err.name : "denied";
      recordStatus.textContent = `Microphone access wasn't granted (${reason}). You can still write a note without audio.`;
      return;
    }
    if (state.closed) {
      stopStream(stream);
      return;
    }
    state.stream = stream;
    state.chunks = [];
    let recorder;
    try {
      recorder = new MediaRecorder(stream);
    } catch {
      stopStream(stream);
      state.stream = null;
      setPhase("idle");
      recordStatus.textContent =
        "Couldn't start the recorder on this device. You can still write a note without audio.";
      return;
    }
    state.recorder = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) state.chunks.push(event.data);
    };
    recorder.onstop = async () => {
      stopRecordingTracks();
      clearTimer();
      if (state.closed) return; // don't create a leaked object/data URL after the sheet has closed
      state.audioMime = recorder.mimeType || "audio/webm";
      const blob = new Blob(state.chunks, { type: state.audioMime });
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
      state.previewUrl = URL.createObjectURL(blob);
      audioEl.src = state.previewUrl;
      playback.hidden = false;
      recordStatus.textContent =
        "Recording stopped. Played back locally — listen before attaching.";
      recordBtn.querySelector("span").textContent = "Start recording";
      recordBtn.classList.remove("cap-record-active");
      timerEl.hidden = true;
      try {
        const dataUrl = await blobToDataUrl(blob);
        if (!state.closed) state.audioDataUrl = dataUrl;
      } catch {
        if (!state.closed) state.audioDataUrl = null;
      }
      if (!state.closed) setPhase("idle");
    };
    try {
      recorder.start();
    } catch {
      stopRecordingTracks();
      setPhase("idle");
      recordStatus.textContent =
        "Couldn't start recording on this device. You can still write a note without audio.";
      return;
    }
    setPhase("recording");
    state.startedAt = Date.now();
    recordBtn.querySelector("span").textContent = "Stop recording";
    recordBtn.classList.add("cap-record-active");
    timerEl.hidden = false;
    timerEl.textContent = "0:00";
    state.timerHandle = window.setInterval(() => {
      timerEl.textContent = formatSeconds(
        (Date.now() - state.startedAt) / 1000,
      );
    }, 250);
    recordStatus.textContent =
      "Recording — local only, nothing is sent anywhere.";
  }

  function stopRecording() {
    if (!state.recorder || state.phase !== "recording") return;
    setPhase("finalizing");
    try {
      state.recorder.stop();
    } catch {
      setPhase("idle"); // already inactive — don't leave the UI stuck mid-stop
    }
  }

  recordBtn.addEventListener("click", () => {
    if (state.phase === "recording") {
      stopRecording();
    } else if (state.phase === "idle") {
      startRecording();
    }
  });

  panel.querySelector("[data-rerecord]").addEventListener("click", () => {
    if (state.phase !== "idle") return;
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
      state.previewUrl = null;
    }
    state.audioDataUrl = null;
    audioEl.removeAttribute("src");
    playback.hidden = true;
    recordStatus.textContent = "";
    setPhase("idle");
  });

  saveAudioBtn.addEventListener("click", () => {
    if (state.phase !== "idle" || !state.audioDataUrl) return;
    const ext = state.audioMime.includes("mp4")
      ? "m4a"
      : state.audioMime.includes("ogg")
        ? "ogg"
        : "webm";
    saveDataUrlToDevice(
      ctx,
      state.audioDataUrl,
      `walkthrough-note-${timestampSlug()}.${ext}`,
      state.audioMime,
    );
  });

  attachBtn.addEventListener("click", () => {
    if (attachBtn.disabled) return;
    const note = transcriptEl.value.trim();
    if (!note) return;
    const tagLine =
      [state.tags.room, state.tags.material, state.tags.action]
        .filter(Boolean)
        .join(" · ") || "No tags selected";
    const summary = `Walkthrough note attached — ${tagLine}`;
    const detail = [
      note,
      "Editable note — not a transcript or speech-to-text of any recording.",
      state.audioDataUrl ? "Recorded locally." : "No recording attached.",
    ].join("\n");
    const attachments = state.audioDataUrl
      ? [
          {
            url: state.audioDataUrl,
            kind: "audio",
            alt: "Walkthrough recording",
          },
        ]
      : [];
    ctx.commit(summary, detail, attachments);
  });

  ctx.cleanup(() => {
    state.closed = true;
    clearTimer();
    if (state.recorder && state.phase === "recording") {
      try {
        state.recorder.stop();
      } catch {
        /* ignore */
      }
    }
    stopRecordingTracks();
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
      state.previewUrl = null;
    }
  });

  setPhase("idle");

  return panel;
}

export const captureTools = [
  {
    id: "capture",
    title: "Attach a photo with the spec",
    modality: "photo",
    prompt:
      "Before we order the pendant, can you show me what's currently installed?",
    response:
      "Attach a photo of the existing light fixture — your camera or a reference shot both work here. I'll keep it with the spec, not use it to measure anything.",
    entryLabel: "Capture photo",
    description:
      "Use your camera or a labelled reference photo, pin the exact spot, add a note, and attach it. The photo stays in this local conversation.",
    steps: [
      "Pick a camera or a reference photo to start from.",
      "Capture or select the frame, then retake if it's not right.",
      "Pin the spot, add a note, and attach it to the thread.",
    ],
    boundary:
      "Photo only — this doesn't measure, analyze, or certify anything from the image. Camera access is requested explicitly on tap and stops the moment you leave this tool.",
    mount: mountCapture,
  },
  {
    id: "prompt",
    title: "Cover the shot list before ordering",
    modality: "photo",
    prompt:
      "Can you send a few photos so we don't have to guess before ordering?",
    response:
      "Here's exactly what would help close this out — pick from your library or add real photos from this device for each one. I'll only ask for what this decision actually needs.",
    entryLabel: "Send photos",
    description:
      "Work through a short coverage checklist, choosing library or real device photos for each angle, then review before attaching.",
    steps: [
      "Choose a library photo or upload a real one for each checklist item.",
      "Review what you picked and drop anything that's not right.",
      "Attach the finished set to the thread with an optional note.",
    ],
    boundary:
      "No OCR, no measurement, no auto-matching to a product. You choose every photo yourself; nothing is inferred from pixels.",
    mount: mountPrompt,
  },
  {
    id: "walkthrough",
    title: "Leave a walkthrough note",
    modality: "photo",
    prompt:
      "Can you give me quick site context before the tile crew starts tomorrow?",
    response:
      "A short voice note works well, or just type it. I'll tag it to the room, material, and next action so it stays attached to this job.",
    entryLabel: "Add walkthrough",
    description:
      "Record an optional local voice note, write your own note by hand, tag the room/material/action, and attach it to the thread.",
    steps: [
      "Optionally record a short note — it stays local after attachment.",
      "Edit the example note into your own words; it's not a transcription.",
      "Tag the room, material, and action, then attach to the thread.",
    ],
    boundary:
      "No speech-to-text — the note is only what you type. Recording is optional, stays on this device, and the microphone stops the instant you close this tool.",
    mount: mountWalkthrough,
  },
];
