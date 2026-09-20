# PLI — lot U-3 (étiquettes réelles Y_{i,e}) — post-G1 worker

Worker `claude-opus-4-8[1m]` (résolu tel quel, R-1), effort max · 2026-09-20 · worktree `F:\Monark-wt-u3`, branche
`lot/u-3`, base `13b8391` · **aucun commit, aucun workflow (R-20)** — l'orchestrateur committe (prereg seul d'abord, C-10).

## 1. Touched set (11 fichiers, tous nouveaux)
| Fichier | lignes | R-25 |
|---|---|---|
| `scripts/census/u3-realized.mjs` | 601 | **compté** |
| `scripts/census/u3-realized.d.mts` | 64 | **compté** |
| `test/u3-realized.test.ts` | 98 | **compté** |
| `apps/sentinel/test/fixtures/ukemi/u3/PROVENANCE-u3.md` | 62 | **compté** |
| `apps/sentinel/test/fixtures/ukemi/u3/U3-inputs.jsonl` | 5165 | exclu (jsonl fixtures) |
| `apps/sentinel/test/fixtures/ukemi/u3/U3-realized.jsonl` | 198 | exclu |
| `apps/sentinel/test/fixtures/ukemi/u3/U3-sources.jsonl` | 36 | exclu |
| `apps/sentinel/test/fixtures/ukemi/u3/U3-deficit.jsonl` | 28 | exclu |
| `docs/PLAN-u3-prereg.md` | 181 | exclu (docs/**/*.md) |
| `docs/census-2026-09-20/U3-realized.md` | 106 | exclu |
| `docs/adr/ADR-U3-realized-labels.md` | 84 | exclu |

**Non touchés** : `apps/sentinel/src/**` (rpc.ts, rpc2.ts, abi.ts, windows.ts, clusters.ts **réutilisés sans modification**),
`fleet.ts`, `schemas/**`, `packages/hikae/src/liquidable-24h.ts`, tout code Narabi/Bell. `ukemi_sha` **intact** (aucun
`.ts` ajouté sous `apps/sentinel/src/ukemi/`). Ordre C-10 respecté : le prereg est écrit et haché **avant** tout appel réseau ;
il est le premier fichier committé par l'orchestrateur (le script refuse de démarrer sans `--prereg-sha` = son sha LF).

## 2. R-25
**825 insertions comptées** (`git diff --shortstat 13b8391 --` avec les exclusions pathspec de `.github/workflows/ci.yml`) —
gate réelle **1 205** (`VIBEGATES_PR_LIMIT`, ADR-M003 D9). **825 < 1205 ⇒ PASS.** Écart à l'estimation honnête C-4 (600-750) :
le script `.mjs` fait 601 lignes (couche RPC quorum-2 + budget/resume + rédaction d'URL + reducer pur + main), au-dessus des
« ~400-450 » estimés — **`error_origin` = worker** (sous-estimation de la couche RPC ; l'estimation C-4 « 400 » venait déjà
d'une récurrence ADR-U1 D9, `error_origin` planificateur). Aucune racine R-25 nouvelle, aucun `ci.yml` touché (pas de
déclencheur 42(f-prime)).

## 3. sha (provenance)
- **prereg (LF, figé avant réseau, C-10)** : `docs/PLAN-u3-prereg.md` = `835805ccc9941a101e760f4ca570f8bdb5ab30d5280e1897c473df7c788877d3`.
- **séries (LF)** : `U3-realized.jsonl` `b4d93590f07b21017abe8ec2d980dee1f258a968395eb32497e6f9543b6f3923` ·
  `U3-sources.jsonl` `bb6e3207b3e9d4f6b7649beeafd2de6122e44fe9d44e75a01917205413c35fe7` ·
  `U3-deficit.jsonl` `748c7a81da31acf28f79786e10311e6bd23d42ca8e9eb4794cc7c6f31c976af5` ·
  `U3-inputs.jsonl` `c88f31eb3c3271eaf770a9351d334cb88ec77d9acae6ba37a49f79f258aafd97`.
- **bruts hors dépôt (sha-pinnés)** : `F:\PRODUITS\etude-2026-09-20\u3-raws-clean\u3-reads.jsonl` =
  `0afaf605679c05b1efb476bf78fe4b614619589f5dd045a8b45d73b26344e154` (run à froid). Entrée immuable vérifiée au démarrage :
  `A-rawlogs.jsonl` `d0f4aa1e23a3eaed6375dca4e6564b7123dfc9ed9b303c1cb7de84dbdae1a996`.

## 4. Coût RPC mesuré
- Run complet (cache tiède) : **1 961 appels, ~210 s**. Run **à froid** (reproduction) : **2 152 appels, ~253 s** → **séries
  byte-identiques** (les 4 shas ci-dessus) : reproductibilité bout-en-bout prouvée par deux runs indépendants. Budget
  `--max-calls 6000` (obligatoire, fail-closed, resumable). Quorum-2 par méthode (2 opérateurs distincts) : `archive-env`
  (Chainstack, jamais imprimé) + keyless `rpc.ts` (drpc/mevblocker/blastapi) — **198/198 lignes servies, 0 `no_quorum`**.
  Aucune URL/clé dans le dépôt ni les logs (rédigées en `providerOf` ; leg archive = booléen ; `no_secret_in_repo` vert).

## 5. Oracles (tous verts)
`npm run ci` = **400 pass / 0 fail** (gate:vocab + typecheck + suite complète, dont les 4 tests U-3). `lint` **0 erreur** ·
`lint:ratchet` **69/69** · `lang:gate` **0 hit** (scopes gatés) · `export:check` **OK** · `series_pinned_are_declared_and_hashed`
**vert** (4 jsonl déclarés+hachés same-dir) · `no_secret_in_repo` **vert**. Vérifié : aucun oracle complet concurrent (les 4
`node.exe` sont des serveurs MCP, pas de `node --test`/`npm ci` d'un autre worktree).

## 6. Mutants (≥ 4 rouges avec restauration sha-exacte) — 5/5 rouges
| # | Mutation | Test rougi | Restauration sha-exacte |
|---|---|---|---|
| M1 | une ligne retirée de `U3-realized.jsonl` | `u3_series_replay_bit_identical` | oui |
| M2 | un chiffre de prix altéré dans `U3-inputs.jsonl` | `u3_series_replay_bit_identical` | oui |
| M3 | `U3-deficit.jsonl` vidé | `u3_deficit_topic_selftest` + replay | oui |
| M4 | topic déficit attendu altéré (test) | `u3_deficit_topic_selftest` | oui |
| M5 | montant d'un `Transfer` **apparié** altéré (cross-check C-7) | `u3_series_replay_bit_identical` (via `xfer_mismatch`) | oui |
Le cross-check C-7 est **non-vacide** (vérifié : corrompre le repayment matché `liquidateur → aToken(debt)` fait apparaître
`xfer_mismatch` et change la row ; corrompre un `Transfer` non-apparié n'a aucun effet — attendu).

## 7. Résultats mesurés (détail dans `docs/census-2026-09-20/U3-realized.md`)
- e1 2025-02-21 sUSDe : 5 appels / **3 positions**, ~21,38 M$ (MATCH census A), pré-v3.3 ⇒ `deficit_topic_absent`.
- e2 2025-10-10/11 WETH : 268 cluster / **239 in-window / 194 positions**, 29 `outside_window`, ~24,08 M$ repay / ~25,16 M$
  seized / ~180 k$ déficit (4 positions), **28 `DeficitCreated`** dans la fenêtre (4 `in_event`, 24 `window_other`).
- e3 2026-01-19 sUSDe : 1 / **1**, ~3,32 M$ (MATCH census A).
- **U3-H1** tenue (déficit dans e2) · **U3-H2** tenue (sources constantes aux deux bornes) · **U3-H3** tenue à l'unité
  (e1/e3 pré-chiffrés MATCH ; e2 identité + cross-check).
- Dunn (Thm 11, aucune conclusion sur α — U-4) : e1=3, e2=194 (> 99), e3=1 positions.

## 8. Items formés (zéro dette nue)
- **PR-U1-1** (procurement, investisseur) : Perez et al. *Liquidations: DeFi on a Knife-edge*, FC 2021 pp. 457-476,
  arXiv:2009.13235 — **Eq. 3 non paginée ([abs])** ; PDF paginé à procurer pour la citation de l'éligible statique en U-7.
  ŷ éligible = HF on-chain [lu] suffit pour U-4.
- **`deficit_base_no_price`** (1 ligne, item de commodité non bloquant) : un déficit `bad_debt_other_reserve` porte sur une
  réserve dont le prix n'a pas été tiré au bloc du déficit (seuls les prix debt/collateral des blocs de `LiquidationCall`
  sont tirés) ⇒ `deficit_native` conservé, conversion base **omise et signalée** (jamais une tolérance muette). Déclencheur :
  si U-4 a besoin du `deficit_base` des réserves croisées, tirer `getAssetPrice(réserve)@bloc` du déficit (≈ +qq appels).
- **Tuyau U-4** : le test d'intégration du chemin consommé est **`u4_calibrates_from_u3_realized_labels`** (nom réservé dans
  ADR-U3, **écrit au lot U-4**). Sortie U-3 déclarée **`annex`** jusqu'à U-4 (CA-11) ; `fleet.ts` inchangé.
- **Registre (hors U-3)** : `apps/site/lib/fleet.ts:155` porte encore le mot interdit (→ lot U-2) ; ADR-M020 D1 (b)
  « 5 liquidations » = 5 appels / 3 positions (déjà remonté au checkpoint-1 §4).
