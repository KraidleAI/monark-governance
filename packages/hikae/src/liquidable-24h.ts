/**
 * HIKAE — classe `ukemi-liquidable-24h` : générateur de paires SYNTHÉTIQUES seedées pour la
 * calibration du conformeur `interval` (ADR-M003 D6.2). n=300, α=0.01.
 *
 * PRNG : `mulberry32` RÉUTILISÉ depuis l'instrument S2 (`./s2/instrument.ts`) — aucun `Math.random`,
 * aucune horloge lue (déterminisme, stabilité des hashes). Le split calibration/test dérive du
 * MÊME flux seedé (échangeabilité : calibration et test tirés de la même loi).
 *
 * MODÈLE DÉCLARÉ, NON FONDÉ (ADR-M003 pré-vérif 3, D6.2) : `ŷ_i` = montant liquidable prédit de
 * référence bruité ; `y_i = ŷ_i + ε_i`, `ε_i` résidu SYMÉTRIQUE déclaré. AUCUNE source de label de
 * dette liquidée réalisée sur 24 h n'existe dans le corpus ⇒ la garantie de couverture ne vaut que
 * sur ces paires synthétiques ; « données réelles » n'est PAS revendiqué. Le label réel 24 h reste
 * un pendant formé (ADR-M003 §4 : « label réel 24h = aucune source »).
 *
 * IMPOSÉ (D6.2, item 6) : toute sortie (rapport/journal/panneau) de cette classe porte la ligne D10
 * avec `harness_version = fixtures-synth` et le mot « synthétique » à côté de l'identifiant —
 * voir `liquidable24hProvenanceLine`.
 */
import { mulberry32 } from "./s2/instrument.ts";
import type { CalibPair } from "./interval-conformer.ts";

/** Identifiant de classe (nomme le prédicteur amont UKEMI ; conformé par HIKAE). */
export const LIQUIDABLE_24H_CLASS = "ukemi-liquidable-24h";
/** Version de harnais imposée sur toute sortie de la classe (D6.2). */
export const LIQUIDABLE_24H_HARNESS = "fixtures-synth";
export const LIQUIDABLE_24H_ALPHA = 0.01;
export const LIQUIDABLE_24H_N = 300;
/**
 * n minimal pour produire un `q̂` à α=0.01 : `⌈(n+1)(1−α)⌉ ≤ n` ⟺ n ≥ 99
 * (à n=98 : `⌈99·0.99⌉ = 99 > 98` ⇒ sous-calibration ; à n=99 : `⌈100·0.99⌉ = 99 = n`).
 */
export const LIQUIDABLE_24H_NMIN = 99;

// Paramètres de fixture DÉCLARÉS, non fondés (aucun défaut produit n'en fixe une valeur).
const BASE = 1000; // montant liquidable prédit de référence (unités déclarées)
const SPREAD = 200; // dispersion de ŷ autour de BASE
const NOISE = 50; // amplitude du résidu symétrique ε ⇒ |y − ŷ| ∈ [0, NOISE], continu (pas d'ex æquo)

/**
 * `n` paires synthétiques `(ŷ_i, y_i)` déterministes pour `seed`. Le flux étant seedé, appeler avec
 * `n = nCalib + mTest` puis découper donne une calibration et un hold-out échangeables (test 34).
 */
export function generateLiquidable24hPairs(seed: number, n: number = LIQUIDABLE_24H_N): CalibPair[] {
  const rnd = mulberry32(seed);
  const out: CalibPair[] = [];
  for (let i = 0; i < n; i++) {
    const yhat = BASE + (rnd() - 0.5) * 2 * SPREAD; // prédiction (centre de la région)
    const noise = (rnd() - 0.5) * 2 * NOISE; // résidu symétrique déclaré
    out.push({ yhat, y: yhat + noise });
  }
  return out;
}

/**
 * Ligne D10 de provenance (D6.2) — `harness_version=fixtures-synth`, « synthétique » à côté de
 * l'identifiant. `generatedOn` est INJECTÉ (jamais une horloge lue), pour la stabilité des sorties.
 */
export function liquidable24hProvenanceLine(
  seed: number,
  n: number = LIQUIDABLE_24H_N,
  generatedOn: string,
): string {
  return (
    `D10 : classe = \`${LIQUIDABLE_24H_CLASS}\` (synthétique) · n = ${n} · α = ${LIQUIDABLE_24H_ALPHA} · ` +
    `seed = ${seed} · harness_version = \`${LIQUIDABLE_24H_HARNESS}\` · date (injectée) = ${generatedOn}`
  );
}
