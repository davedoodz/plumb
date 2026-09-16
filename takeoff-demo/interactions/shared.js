export const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function createTools(onCommit) {
  const dialog = document.querySelector("#tool-dialog"),
    panel = document.querySelector("#tool-content");
  let cleanups = [],
    trigger = null,
    generation = 0;
  const cleanup = () => {
    const pending = cleanups;
    cleanups = [];
    for (const fn of pending) {
      try {
        fn();
      } catch (error) {
        console.error(error);
      }
    }
  };
  const position = () => {
    if (!dialog.open) return;
    const r = document.querySelector(".phone").getBoundingClientRect();
    const top = Math.max(12, r.top + 90),
      bottom = Math.min(innerHeight - 10, r.bottom - 7);
    Object.assign(dialog.style, {
      left: `${r.left + 7}px`,
      top: `${top}px`,
      width: `${r.width - 14}px`,
      height: `${Math.max(240, bottom - top)}px`,
    });
  };
  const close = () => {
    generation += 1;
    cleanup();
    if (dialog.open) dialog.close();
  };
  dialog.addEventListener("close", () => {
    if (!dialog.open) {
      generation += 1;
      cleanup();
      trigger?.focus({ preventScroll: true });
    }
  });
  dialog.addEventListener("cancel", close);
  document.querySelector("#close-tool").onclick = close;
  window.addEventListener("resize", position);
  return {
    close,
    get ctx() {
      const owner = ++generation;
      const active = () => owner === generation;
      return {
        get panel() {
          return panel;
        },
        escape,
        asset: (name) => `./media/${name}`,
        open(title, subtitle, html) {
          if (!active()) return panel;
          cleanup();
          trigger = document.activeElement;
          document.querySelector("#tool-title").textContent = title;
          document.querySelector("#tool-subtitle").textContent = subtitle;
          panel.innerHTML = html;
          document.querySelector("#tool-status").textContent = "";
          if (!dialog.open) dialog.showModal();
          position();
          return panel;
        },
        setContent(html) {
          if (!active()) return panel;
          panel.innerHTML = html;
          dialog.scrollTop = 0;
          return panel;
        },
        on(selector, event, handler) {
          if (!active()) return;
          panel
            .querySelectorAll(selector)
            .forEach((el) => el.addEventListener(event, handler));
        },
        cleanup(fn) {
          if (active()) cleanups.push(fn);
          else fn();
        },
        notice(text) {
          if (!active()) return;
          document.querySelector("#tool-status").textContent = text;
        },
        commit(summary, detail = "", attachments = []) {
          if (!active()) return;
          close();
          onCommit(summary, detail, attachments);
        },
        download(filename, content, mime = "text/plain") {
          if (!active()) return;
          const url = URL.createObjectURL(new Blob([content], { type: mime }));
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
      };
    },
  };
}
