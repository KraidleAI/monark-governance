// ============================================================================
// UKEMI — Stress test à GRAINE FIXE : Tarski / Picard / Prop. 4 (unicité)
// Worker Opus 4.8 (claude-opus-4-8[1m]), 2026-09-19. Lecture seule ; jetable.
// Rejouable a l'identique : `node stress-monotonie-picard.mjs` (mulberry32, seed=20260919).
//
// Vérifie, sur N_CONF configurations aléatoires reproductibles :
//  (H1) T monotone non-decroissante ;
//  (H2) Picard depuis 0 atteint EXACTEMENT le plus petit point fixe Q_* ;
//  (H3) Picard depuis sumB atteint EXACTEMENT le plus grand point fixe Q^* ;
//  (H4) chaque Picard converge en <= N+1 pas ;
//  (P4) condition suffisante d'unicité "pas d'activation dormante"
//       (pour tout j hors S(Q_*), Pcrit_j <= Pmin)  =>  Q_*=Q^*  (JAMAIS violée) ;
//       + montre qu'elle n'est PAS nécessaire (cas cond-fausse mais unique).
// Toute violation de H1..H4 ou P4 est imprimée et fait échouer le run (exit 1).
// ============================================================================

const EPS = 1e-9;
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260919); // GRAINE FIXE
const U = (lo, hi) => lo + (hi - lo) * rand();
const Ui = (lo, hi) => Math.floor(U(lo, hi + 1));

// --- Coeur T (identique à treillis-fixedpoints.mjs) -------------------------
const priceAt = (cfg, Q) => cfg.P0 * (1 - cfg.D) * (1 - cfg.Lambda * Q);
const sumB = (cfg) => cfg.pos.reduce((a, p) => a + p.B, 0);
function liqSet(cfg, Q) {
  const P = priceAt(cfg, Q), S = [];
  for (let i = 0; i < cfg.pos.length; i++) if (P < cfg.pos[i].Pcrit - EPS) S.push(i);
  return S;
}
const T = (cfg, Q) => liqSet(cfg, Q).reduce((a, i) => a + cfg.pos[i].B, 0);

function tipPoints(cfg) {
  const SB = sumB(cfg), c = cfg.P0 * (1 - cfg.D), pts = [];
  if (cfg.Lambda === 0) return [];
  for (const p of cfg.pos) {
    const q = (1 / cfg.Lambda) * (1 - p.Pcrit / c);
    if (q > EPS && q < SB - EPS) pts.push(q);
  }
  return [...new Set(pts.map((x) => Math.round(x * 1e6) / 1e6))].sort((a, b) => a - b);
}
function allFixedPoints(cfg) {
  const SB = sumB(cfg), breaks = [0, ...tipPoints(cfg), SB], vals = new Set();
  vals.add(T(cfg, 0)); vals.add(T(cfg, SB));
  for (let k = 0; k < breaks.length - 1; k++) vals.add(T(cfg, (breaks[k] + breaks[k + 1]) / 2));
  for (const t of tipPoints(cfg)) vals.add(T(cfg, t + 1e-6));
  const fps = [];
  for (const v of vals) if (Math.abs(T(cfg, v) - v) < 1e-6 && v >= -EPS && v <= SB + EPS) fps.push(v);
  return [...new Set(fps.map((x) => Math.round(x * 1e6) / 1e6))].sort((a, b) => a - b);
}
function picard(cfg, start, maxIter) {
  let Q = start;
  for (let k = 0; k < maxIter; k++) {
    const nxt = T(cfg, Q);
    if (Math.abs(nxt - Q) < 1e-9) return { fp: nxt, steps: k + 1 };
    Q = nxt;
  }
  return { fp: Q, steps: maxIter, warn: true };
}
function monotone(cfg, grid = 800) {
  const SB = sumB(cfg); let prev = -Infinity;
  for (let g = 0; g <= grid; g++) { const v = T(cfg, (SB * g) / grid); if (v < prev - 1e-9) return false; prev = v; }
  return true;
}

// --- Boucle de stress -------------------------------------------------------
const N_CONF = 300000;
let viol = { H1: 0, H2: 0, H3: 0, H4: 0, P4: 0 };
let multiplicity = 0, unique = 0;
let condHolds = 0, condHoldsUnique = 0, condFailsUnique = 0;
let firstViol = null;

for (let t = 0; t < N_CONF; t++) {
  const N = Ui(2, 7);
  const P0 = U(50, 150);
  const D = U(0, 0.4);
  const Lambda = rand() < 0.15 ? 0 : U(0, 0.02); // parfois 0 (cas dégénéré A)
  const pos = [];
  for (let i = 0; i < N; i++) pos.push({ Pcrit: U(30, 170), B: Ui(1, 100) });
  const cfg = { P0, D, Lambda, pos };
  const SB = sumB(cfg);

  const fps = allFixedPoints(cfg);
  const qmin = fps[0], qmax = fps[fps.length - 1];
  const p0 = picard(cfg, 0, N + 3);
  const pTop = picard(cfg, SB, N + 3);

  if (!monotone(cfg)) { viol.H1++; firstViol ??= { t, why: "H1", cfg }; }
  if (Math.abs(p0.fp - qmin) > 1e-5) { viol.H2++; firstViol ??= { t, why: "H2", cfg, p0, qmin }; }
  if (Math.abs(pTop.fp - qmax) > 1e-5) { viol.H3++; firstViol ??= { t, why: "H3", cfg, pTop, qmax }; }
  if (p0.steps > N + 1 || pTop.steps > N + 1) { viol.H4++; firstViol ??= { t, why: "H4", cfg, p0, pTop, N }; }

  const isUnique = fps.length === 1;
  if (isUnique) unique++; else multiplicity++;

  // Prop 4 : "pas d'activation dormante" -> unicité
  const Sstar = new Set(liqSet(cfg, qmin));
  const Pmin = priceAt(cfg, SB);
  let cond = true;
  for (let j = 0; j < N; j++) if (!Sstar.has(j) && pos[j].Pcrit > Pmin + EPS) { cond = false; break; }
  if (cond) {
    condHolds++;
    if (isUnique) condHoldsUnique++;
    else { viol.P4++; firstViol ??= { t, why: "P4", cfg, fps }; } // cond vraie mais MULTIPLE => Prop 4 fausse
  } else if (isUnique) {
    condFailsUnique++; // cond fausse mais unique => Prop 4 pas nécessaire
  }
}

console.log(`GRAINE FIXE mulberry32(20260919) — ${N_CONF} configurations (N in [2,7])`);
console.log(`unique=${unique}  multiplicite=${multiplicity}`);
console.log(`VIOLATIONS  H1(mono)=${viol.H1}  H2(Picard0=Q_*)=${viol.H2}  H3(PicardSumB=Q^*)=${viol.H3}  H4(<=N+1 pas)=${viol.H4}`);
console.log(`Prop 4 : cond suffisante VRAIE dans ${condHolds} cas ; parmi eux UNIQUES=${condHoldsUnique} ; VIOLATIONS P4 (cond vraie mais multiple)=${viol.P4}`);
console.log(`Prop 4 non nécessaire : cond FAUSSE mais unique = ${condFailsUnique} cas (>0 => sufficiente, pas nécessaire)`);
if (firstViol) {
  console.log(`\nPREMIÈRE VIOLATION (${firstViol.why}) :`, JSON.stringify(firstViol, null, 0));
  process.exit(1);
}
console.log(`\nOK — aucune violation de H1..H4 ni de la Prop. 4 sur ${N_CONF} configs.`);
