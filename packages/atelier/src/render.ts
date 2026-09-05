/**
 * Atelier MONARK — rendu HTML PUR (chaînes), sans DOM : testable en node, servi par `serve.js`.
 * Trois panneaux Shōgen → HIKAE → UKEMI, verdict, décision + raison, B_t, deux horloges nommées
 * pour ce qu'elles sont sur fixtures. Aucun mot du gate vocab ; aucune promesse ; aucun ordre.
 */
import type { AtelierState } from "./state.ts";
import { distribution } from "./state.ts";

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function badge(decision: AtelierState["decision"]): string {
  return `<span class="badge badge-${decision.toLowerCase()}">${decision}</span>`;
}

export function renderState(s: AtelierState, index: number): string {
  const residual = s.shogen.residual.map((r) => `<li>${esc(r)}</li>`).join("");
  const qhat = s.hikae.qhat === null ? "—" : String(s.hikae.qhat);
  return `<section class="state" data-state="${esc(s.id)}" data-index="${index}" ${index === 0 ? "" : "hidden"}>
  <header class="state-head">
    <h2>${esc(s.id)}</h2>
    ${badge(s.decision)}
    <span class="reason">raison : <code>${esc(s.reason)}</code></span>
  </header>
  <div class="chain">
    <article class="panel panel-shogen">
      <h3>Shōgen — perception attestée</h3>
      <p>classe : <code>${esc(s.shogen.taskClass)}</code></p>
      <p>hypothèses résiduelles portées par le verdict :</p>
      <ul class="residual">${residual}</ul>
    </article>
    <article class="panel panel-hikae">
      <h3>HIKAE — verdict de couverture</h3>
      <dl>
        <dt>méthode</dt><dd><code>${esc(s.hikae.method)}</code></dd>
        <dt>α</dt><dd>${s.hikae.alpha}</dd>
        <dt>n calibration</dt><dd>${s.hikae.nCalib}</dd>
        <dt>q̂</dt><dd>${qhat}</dd>
        <dt>région</dt><dd><code>${esc(s.hikae.region)}</code></dd>
        <dt>abstention</dt><dd>${s.hikae.abstain ? "oui" : "non"}</dd>
      </dl>
    </article>
    <article class="panel panel-ukemi">
      <h3>UKEMI — brique de cascade</h3>
      <p class="muted">non branchée en Phase 1 (se branche au merge du Lot U) — rien n'est simulé ici.</p>
    </article>
  </div>
  <div class="decision">
    <p>intention <code>${esc(s.intent === null ? "—" : String(s.intent))}</code> vers l'outil <code>${esc(s.tool)}</code> → ${badge(s.decision)}
      (${s.allow ? "autorisé" : "non autorisé"}) — MONARK ne passe aucun ordre : l'outil est nommé, jamais appelé.</p>
    <p class="budget">B<sub>t</sub> restant après cette décision : <strong>${s.remainingBudget}</strong>
      <span class="muted">(capacité d'autorisation qui se consomme — pas un rendement)</span></p>
  </div>
  <div class="clocks">
    <div class="clock"><span class="clock-name">couverture avant décision</span><time>${esc(s.clocks.coverageAt)}</time></div>
    <div class="clock"><span class="clock-name">label arrivé à t+w (w = 15 min, fixture)</span><time>${esc(s.clocks.labelAt)}</time></div>
  </div>
</section>`;
}

export function renderNav(states: readonly AtelierState[]): string {
  return `<nav class="nav">${states
    .map(
      (s, i) =>
        `<button type="button" class="nav-btn nav-${s.decision.toLowerCase()}" data-target="${i}" ${i === 0 ? 'aria-current="true"' : ""}>${i + 1}. ${esc(s.id)}</button>`,
    )
    .join("")}</nav>`;
}

export function renderSummary(states: readonly AtelierState[]): string {
  const d = distribution(states);
  return `<p class="summary">${states.length} états rejoués depuis <code>fixtures/</code> racine —
    ${d.COMMIT} COMMIT · ${d.DEFER} DEFER · ${d.ABSTAIN} ABSTAIN · ${d.under_calib} under_calib.
    Silence calibré = résultat, pas défaut.</p>`;
}

/** Corps complet de la page (sans <html>/<head> : `index.html` les porte, `serve.js` injecte ici). */
export function renderAll(states: readonly AtelierState[]): string {
  return `${renderSummary(states)}
${renderNav(states)}
<main class="states">
${states.map((s, i) => renderState(s, i)).join("\n")}
</main>`;
}
