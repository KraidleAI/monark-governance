// MONARK atelier — minimal DOM glue: toggles the visible state. No data here, no network:
// all content is rendered server-side locally (serve.js) from root fixtures/.
document.addEventListener("click", (ev) => {
  const btn = ev.target.closest(".nav-btn");
  if (!btn) return;
  const target = btn.dataset.target;
  for (const s of document.querySelectorAll(".state")) s.hidden = s.dataset.index !== target;
  for (const b of document.querySelectorAll(".nav-btn")) {
    if (b === btn) b.setAttribute("aria-current", "true");
    else b.removeAttribute("aria-current");
  }
});
