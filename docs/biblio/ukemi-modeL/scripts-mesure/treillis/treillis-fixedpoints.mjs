// ============================================================================
// UKEMI — Treillis des points fixes de la cascade-cluster T (oracle non-LLM)
// Worker Opus 4.8 (claude-opus-4-8[1m]), 2026-09-19. Lecture seule ; jetable.
// Déterministe, SANS RNG (scénarios fixes). Rejouable : `node treillis-fixedpoints.mjs`.
//
// Modèle (défini dans la NOTE, §1) — faithful à liquidable.ts (HF = C*P*K/B) :
//   Position i = (Pcrit_i, B_i)  avec  Pcrit_i := B_i / (C_i * K_i)  (prix critique).
//   HF_i(P) = P / Pcrit_i ;  i liquidable  <=>  HF_i(P) < 1  <=>  P < Pcrit_i (STRICT).
//   Prix endogène : P(Q) = P0*(1-D)*(1 - Lambda*Q),  Q in [0, sum B].
//   Cascade-cluster : T(Q) = sum_i B_i * 1{ HF_i(P(Q)) < 1 }.
// Sortie : staircase, TOUS les points fixes (énumération exacte), Q_* (min) et
//          Q^* (max), Picard depuis 0 et depuis sumB, prix & pénalité aux FP.
// ============================================================================

const EPS = 1e-9;

// --- Coeur T ---------------------------------------------------------------
function priceAt(cfg, Q) {
  return cfg.P0 * (1 - cfg.D) * (1 - cfg.Lambda * Q);
}
// Ensemble liquidé S(Q) et T(Q). Inegalite STRICTE (HF<1) => a Q=Qtip, HF=1, NON liquide.
function liqSet(cfg, Q) {
  const P = priceAt(cfg, Q);
  const S = [];
  for (let i = 0; i < cfg.pos.length; i++) {
    if (P < cfg.pos[i].Pcrit - EPS) S.push(i);
  }
  return S;
}
function T(cfg, Q) {
  return liqSet(cfg, Q).reduce((a, i) => a + cfg.pos[i].B, 0);
}
function sumB(cfg) {
  return cfg.pos.reduce((a, p) => a + p.B, 0);
}

// --- Points de rupture (tip) en Q : Qtip_i tel que P(Qtip_i) = Pcrit_i -------
// i liquide pour Q > Qtip_i.  Qtip_i = (1/Lambda)*(1 - Pcrit_i/(P0(1-D))).
function tipPoints(cfg) {
  const SB = sumB(cfg);
  const c = cfg.P0 * (1 - cfg.D);
  const pts = [];
  for (let i = 0; i < cfg.pos.length; i++) {
    if (cfg.Lambda === 0) continue; // pas de rupture : S constant
    const q = (1 / cfg.Lambda) * (1 - cfg.pos[i].Pcrit / c);
    if (q > EPS && q < SB - EPS) pts.push(q);
  }
  return [...new Set(pts.map((x) => Math.round(x * 1e6) / 1e6))].sort((a, b) => a - b);
}

// --- Énumération EXACTE de tous les points fixes ---------------------------
// T ne prend que des valeurs dans V = { T(Q) } (fini). Un FP est un v in V avec T(v)=v.
// On collecte V en évaluant T sur chaque sous-intervalle ouvert du staircase.
function allFixedPoints(cfg) {
  const SB = sumB(cfg);
  const breaks = [0, ...tipPoints(cfg), SB];
  const values = new Set();
  values.add(T(cfg, 0));
  values.add(T(cfg, SB));
  for (let k = 0; k < breaks.length - 1; k++) {
    const mid = (breaks[k] + breaks[k + 1]) / 2;
    values.add(T(cfg, mid));
  }
  // aussi juste a droite de chaque tip (le staircase y saute)
  for (const t of tipPoints(cfg)) values.add(T(cfg, t + 1e-6));
  const fps = [];
  for (const v of values) {
    if (Math.abs(T(cfg, v) - v) < 1e-6 && v >= -EPS && v <= SB + EPS) fps.push(v);
  }
  return [...new Set(fps.map((x) => Math.round(x * 1e6) / 1e6))].sort((a, b) => a - b);
}

// --- Picard depuis une borne (enregistre la trajectoire) --------------------
function picard(cfg, start, maxIter) {
  const path = [start];
  let Q = start;
  for (let k = 0; k < maxIter; k++) {
    const nxt = T(cfg, Q);
    path.push(nxt);
    if (Math.abs(nxt - Q) < 1e-9) return { fp: nxt, steps: k + 1, path };
    Q = nxt;
  }
  return { fp: Q, steps: maxIter, path, warn: "non convergé" };
}

// --- Monotonie de T sur grille fine ----------------------------------------
function checkMonotone(cfg, grid = 4000) {
  const SB = sumB(cfg);
  let prev = -Infinity;
  let ok = true;
  for (let g = 0; g <= grid; g++) {
    const Q = (SB * g) / grid;
    const v = T(cfg, Q);
    if (v < prev - 1e-9) ok = false;
    prev = v;
  }
  return ok;
}

// --- Rapport d'un scénario --------------------------------------------------
function report(name, cfg, bonus = 0.05) {
  const SB = sumB(cfg);
  const N = cfg.pos.length;
  const fps = allFixedPoints(cfg);
  const qmin = fps[0];
  const qmax = fps[fps.length - 1];
  const p0 = picard(cfg, 0, N + 5);
  const pTop = picard(cfg, SB, N + 5);
  const mono = checkMonotone(cfg);

  console.log(`\n================ ${name} ================`);
  console.log(`params: P0=${cfg.P0} D=${cfg.D} Lambda=${cfg.Lambda} sumB=${SB} N=${N}`);
  console.log(
    `positions (Pcrit,B): ${cfg.pos.map((p) => `(${p.Pcrit},${p.B})`).join(" ")}`,
  );
  console.log(`c=P0(1-D)=${cfg.P0 * (1 - cfg.D)}  Pmin=P(sumB)=${priceAt(cfg, SB)}`);
  console.log(`Lambda*sumB = ${cfg.Lambda * SB}   2*Lambda*sumB = ${2 * cfg.Lambda * SB}`);
  // staircase
  const brks = [0, ...tipPoints(cfg), SB];
  const rows = [];
  for (let k = 0; k < brks.length - 1; k++) {
    const mid = (brks[k] + brks[k + 1]) / 2;
    rows.push(`  Q in (${brks[k]}, ${brks[k + 1]}]: S={${liqSet(cfg, mid).map((i) => i + 1).join(",")}} T=${T(cfg, mid)}`);
  }
  console.log(`staircase:\n${rows.join("\n")}`);
  console.log(`T monotone non-decroissante (grille 4000): ${mono}`);
  console.log(`TOUS les points fixes: [${fps.join(", ")}]`);
  console.log(`Q_* (plus petit) = ${qmin}   Q^* (plus grand) = ${qmax}   unique=${fps.length === 1}`);
  console.log(`Picard depuis 0     -> fp=${p0.fp} en ${p0.steps} pas (<= N=${N}? ${p0.steps <= N + 1}) path=[${p0.path.join("->")}]`);
  console.log(`Picard depuis sumB  -> fp=${pTop.fp} en ${pTop.steps} pas (<= N=${N}? ${pTop.steps <= N + 1}) path=[${pTop.path.join("->")}]`);
  console.log(`ASSERT Picard(0)==Q_* : ${Math.abs(p0.fp - qmin) < 1e-6}   Picard(sumB)==Q^* : ${Math.abs(pTop.fp - qmax) < 1e-6}`);
  // Q5 : "plus grand Q = pire". Prix + penalite de liquidation (bonus*debt liquidee)
  const penalty = (Q) => liqSet(cfg, Q).reduce((a, i) => a + bonus * cfg.pos[i].B, 0);
  console.log(
    `Q5  prix  P(Q_*)=${priceAt(cfg, qmin).toFixed(4)}  >=?  P(Q^*)=${priceAt(cfg, qmax).toFixed(4)}  (prix plus BAS au plus grand Q: ${priceAt(cfg, qmax) <= priceAt(cfg, qmin) + EPS})`,
  );
  console.log(
    `Q5  pertes(bonus=${bonus})  L(Q_*)=${penalty(qmin).toFixed(4)}  <=?  L(Q^*)=${penalty(qmax).toFixed(4)}  (pertes plus HAUTES au plus grand Q: ${penalty(qmax) >= penalty(qmin) - EPS})`,
  );
  return { fps, qmin, qmax, p0, pTop, mono };
}

// ============================================================================
// SCÉNARIOS
// ============================================================================

// A — MULTIPLICITÉ : cascade mécanique cale à Q_*=20, run auto-réalisateur Q^*=90
const A = {
  P0: 100, D: 0, Lambda: 0.004,
  pos: [{ Pcrit: 105, B: 20 }, { Pcrit: 91, B: 30 }, { Pcrit: 85, B: 40 }],
};
report("A  multiplicite (Q_* < Q^*)", A);

// B — COINCIDENCE via choc (Lambda=0) : T constant = liquidableAmount
const B = {
  P0: 100, D: 0.15, Lambda: 0,
  pos: [{ Pcrit: 105, B: 20 }, { Pcrit: 91, B: 30 }, { Pcrit: 85, B: 40 }],
};
report("B  Lambda=0 => T constant, Q_*=Q^* (= liquidable)", B);

// B' — COINCIDENCE via Lambda=0 sans choc (P=100) : seul pos1 (Pcrit=105) liquide
const Bp = {
  P0: 100, D: 0, Lambda: 0,
  pos: [{ Pcrit: 105, B: 20 }, { Pcrit: 91, B: 30 }, { Pcrit: 85, B: 40 }],
};
report("B' Lambda=0, D=0 => Q_*=Q^*=20 (=liquidable statique)", Bp);

// C — CONTRE-EXEMPLE : 2*Lambda*sumB = 0.4 < 1 (Amini (iii) vraie pour f), mais 3 FP
const C = {
  P0: 100, D: 0, Lambda: 0.001,
  pos: [{ Pcrit: 99, B: 100 }, { Pcrit: 85, B: 100 }],
};
report("C  contre-exemple: 2*Lambda*sumB<1 mais MULTIPLICITE", C);

// Vérif faithfulness liquidable.ts : HF=C*P*K/B avec C=1,K=B/Pcrit reproduit HF=P/Pcrit
console.log("\n================ faithfulness liquidable.ts ================");
{
  const P = 92, pos = A.pos[1]; // Pcrit=91,B=30
  const K = pos.B / pos.Pcrit, C = 1; // => C*K = B/Pcrit => HF = C*P*K/B = P/Pcrit
  const hf_liquidable = (C * P * K) / pos.B; // forme liquidable.ts
  const hf_note = P / pos.Pcrit; // forme note
  console.log(`HF liquidable.ts (C=1,K=${K.toFixed(6)}) = ${hf_liquidable} ; HF note = ${hf_note} ; egal=${Math.abs(hf_liquidable - hf_note) < 1e-12}`);
}
