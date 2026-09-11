/**
 * MONARK atelier — PURE HTML render (strings), no DOM: testable in node, served by `serve.js`.
 * Three panels Shōgen → HIKAE → UKEMI, verdict, decision + reason, B_t, two clocks named
 * for what they are on fixtures. No gate-vocab word; no promise; no order.
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
    <span class="reason">reason: <code>${esc(s.reason)}</code></span>
  </header>
  <div class="chain">
    <article class="panel panel-shogen">
      <h3>Shōgen — attested perception</h3>
      <p>class: <code>${esc(s.shogen.taskClass)}</code></p>
      <p>residual hypotheses carried by the verdict:</p>
      <ul class="residual">${residual}</ul>
    </article>
    <article class="panel panel-hikae">
      <h3>HIKAE — coverage verdict</h3>
      <dl>
        <dt>method</dt><dd><code>${esc(s.hikae.method)}</code></dd>
        <dt>α</dt><dd>${s.hikae.alpha}</dd>
        <dt>calibration n</dt><dd>${s.hikae.nCalib}</dd>
        <dt>q̂</dt><dd>${qhat}</dd>
        <dt>region</dt><dd><code>${esc(s.hikae.region)}</code></dd>
        <dt>abstention</dt><dd>${s.hikae.abstain ? "yes" : "no"}</dd>
      </dl>
    </article>
    <article class="panel panel-ukemi">
      <h3>UKEMI — cascade block</h3>
      <p class="muted">not wired in Phase 1 (wires in at a later phase) — nothing is simulated here.</p>
    </article>
  </div>
  <div class="decision">
    <p>intent <code>${esc(s.intent === null ? "—" : String(s.intent))}</code> toward tool <code>${esc(s.tool)}</code> → ${badge(s.decision)}
      (${s.allow ? "authorized" : "not authorized"}) — MONARK places no order: the tool is named, never called.</p>
    <p class="budget">B<sub>t</sub> remaining after this decision: <strong>${s.remainingBudget}</strong>
      <span class="muted">(authorization capacity that depletes — not a yield)</span></p>
  </div>
  <div class="clocks">
    <div class="clock"><span class="clock-name">coverage before decision</span><time>${esc(s.clocks.coverageAt)}</time></div>
    <div class="clock"><span class="clock-name">label arrived at t+w (w = 15 min, fixture)</span><time>${esc(s.clocks.labelAt)}</time></div>
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
  return `<p class="summary">${states.length} states replayed from root <code>fixtures/</code> —
    ${d.COMMIT} COMMIT · ${d.DEFER} DEFER · ${d.ABSTAIN} ABSTAIN · ${d.under_calib} under_calib.
    Calibrated silence = result, not failure.</p>`;
}

/** Full page body (no <html>/<head>: `index.html` carries them, `serve.js` injects here). */
export function renderAll(states: readonly AtelierState[]): string {
  return `${renderSummary(states)}
${renderNav(states)}
<main class="states">
${states.map((s, i) => renderState(s, i)).join("\n")}
</main>`;
}
