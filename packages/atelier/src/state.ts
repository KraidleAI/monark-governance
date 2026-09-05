/**
 * Atelier MONARK — module d'ÉTAT PUR (ADR-M002 D1 Lot D ; test 24 `atelier_state_oracle`).
 * Aucun DOM, aucun réseau, aucune horloge lue : tout vient d'une `GateDecision` gelée (contrat
 * `@monark/contracts`, jamais réimplémenté). Ce que l'écran montre est recalculable d'ici.
 */
import type { GateDecision, CoverageVerdict } from "@monark/contracts";
import { assertClosedGateDecision } from "@monark/contracts";

/** Fenêtre de label du beachhead `btc-dir-15m` (ADR-M002 D8) — paramètre DÉCLARÉ, minutes. */
export const LABEL_WINDOW_MIN = 15;

export type Decision = "COMMIT" | "DEFER" | "ABSTAIN";

export interface ClockView {
  /** « couverture avant décision » : horodatage du verdict (le verdict précède la décision). */
  readonly coverageAt: string;
  /** « label arrivé à t+w » : quand le label de la bougie [t, t+w) devient connu — sur fixture. */
  readonly labelAt: string;
}

export interface ShogenPanel {
  /** Hypothèses résiduelles d'attestation, telles que portées par le verdict (jamais inventées). */
  readonly residual: readonly string[];
  readonly taskClass: string;
}

export interface HikaePanel {
  readonly method: string;
  readonly alpha: number;
  readonly nCalib: number;
  readonly qhat: number | null;
  /** Région rendue textuellement : `{up}` / `{up,down}` / `[lo, hi]` / `—` si abstention sans région. */
  readonly region: string;
  readonly reason: string;
  readonly abstain: boolean;
}

export interface UkemiPanel {
  /** Phase 1 : la brique n'est PAS branchée à l'atelier (merge Lot U) — on l'écrit, on ne la simule pas. */
  readonly status: "non-branchee-phase1";
}

export interface AtelierState {
  readonly id: string;
  readonly decision: Decision;
  readonly allow: boolean;
  readonly reason: string;
  /** Intention telle que portée par la décision : label (set), nombre (interval) ou `null` (aucune). */
  readonly intent: string | number | null;
  readonly tool: string;
  /** B_t restant APRÈS cette décision (capacité d'autorisation, jamais un rendement). */
  readonly remainingBudget: number;
  readonly clocks: ClockView;
  readonly shogen: ShogenPanel;
  readonly hikae: HikaePanel;
  readonly ukemi: UkemiPanel;
}

function decisionOf(action: GateDecision["action"]): Decision {
  switch (action) {
    case "commit":
      return "COMMIT";
    case "defer":
      return "DEFER";
    case "abstain":
      return "ABSTAIN";
  }
}

function regionText(v: CoverageVerdict): string {
  const r = v.region;
  if (r === undefined || r === null) return "—";
  if (r.kind === "set") return `{${r.labels.join(", ")}}`;
  return `[${r.lo}, ${r.hi}]`;
}

/** Ajoute `minutes` à un ISO UTC ; pure, sans lire l'horloge. */
export function plusMinutes(iso: string, minutes: number): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) throw new Error(`horodatage invalide : ${iso}`);
  return new Date(t + minutes * 60_000).toISOString().replace(".000Z", "Z");
}

/** Construit l'état d'écran d'UNE décision gelée. Lève si la décision n'est pas fermée (contrat). */
export function buildState(id: string, d: GateDecision): AtelierState {
  assertClosedGateDecision(d);
  const v = d.verdict;
  return {
    id,
    decision: decisionOf(d.action),
    allow: d.allow,
    reason: d.reason,
    intent: d.intent,
    tool: d.tool,
    remainingBudget: d.remaining_budget,
    clocks: { coverageAt: v.produced_at, labelAt: plusMinutes(v.produced_at, LABEL_WINDOW_MIN) },
    shogen: { residual: v.residual, taskClass: v.task_class },
    hikae: {
      method: v.method,
      alpha: v.alpha,
      nCalib: v.n_calib,
      qhat: typeof v.qhat === "number" ? v.qhat : null,
      region: regionText(v),
      reason: v.reason,
      abstain: v.abstain,
    },
    ukemi: { status: "non-branchee-phase1" },
  };
}

/** Répartition des décisions (l'oracle du jeu racine est 3/2/3/1 avec `under_calib` compté à part). */
export function distribution(states: readonly AtelierState[]): {
  COMMIT: number;
  DEFER: number;
  ABSTAIN: number;
  under_calib: number;
} {
  const c = { COMMIT: 0, DEFER: 0, ABSTAIN: 0, under_calib: 0 };
  for (const s of states) {
    if (s.reason === "under_calib") c.under_calib += 1;
    else c[s.decision] += 1;
  }
  return c;
}
