// Atelier MONARK — glue DOM minimale : bascule l'état visible. Aucune donnée ici, aucun réseau :
// tout le contenu est rendu côté serveur local (serve.js) depuis fixtures/ racine.
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
