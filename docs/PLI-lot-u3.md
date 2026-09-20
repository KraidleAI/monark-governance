# PLI — lot U-3 (étiquettes réelles Y_{i,e}) — post-G1 worker

Worker `claude-opus-4-8[1m]` (résolu tel quel, R-1), effort max · 2026-09-20 · worktree `F:\Monark-wt-u3`, branche
`lot/u-3`, base `13b8391` · **aucun commit, aucun workflow (R-20)** — l'orchestrateur committe (prereg seul d'abord, C-10).

## 1. Touched set (12 fichiers, tous nouveaux)
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
| `docs/census-2026-09-20/U3-realized.md` | 129 | exclu |
| `docs/adr/ADR-U3-realized-labels.md` | 84 | exclu |
| `docs/PLI-lot-u3.md` | 88 | exclu (docs/**/*.md, ce fichier) |

> Comptes du tableau = état gelé au commit lot `6cd991c` (ses **11 fichiers**, dont ce PLI à 88 lignes) + `docs/PLAN-u3-prereg.md` (committé seul en `e87549a`, C-10) = **12**. Le **pli documentaire 2** (C-G2-1..6) modifie **4 fichiers docs seulement** (census, PLI, PROVENANCE, ADR) sans toucher séries/script/test ; touched set, sha LF avant/après et preuves = **Annexe pli 2** ci-dessous. Parmi ces 4, **seul `PROVENANCE-u3.md` est compté en R-25** : modifié (C-G2-4/5) mais **62 lignes inchangées** ⇒ R-25 = 825 inchangé (census/PLI/ADR sont `docs/**/*.md`, exclus).

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
- **Mapping impl → release taguée `aave-v3-origin`** (item formé ; prereg §5 C-6 : « le mapping vers la release taguée =
  item formé (web/[2nd]) si non tiré » — **non tiré**) : associer chaque impl résolue (e1 `0xef434e45…`, e2 `0x97287a4f…`,
  e3 `0x8147b99d…`, census §2) à sa release taguée du dépôt `aave-v3-origin` (source **web/[2nd]** ou comparaison bytecode
  [lu]). **Non porteur du statut v3.3** — celui-ci vient de la **date de déploiement 2025-02-24 [lu]**, pas du tag ⇒
  item **non bloquant**. **Déclencheur** : lecture du papier U-7 ou prochaine lecture de `LiquidationLogic`. **Propriétaire** :
  orchestrateur.
- **Trace Blockscout par événement** (item formé ; prereg §5 : un receipt/événement vérifié Blockscout avant
  généralisation) : **non faite** comme étape distincte tracée (le mot n'apparaît que dans le prereg). **Substance
  couverte** par le re-tirage receipt quorum-2 de la G2 (§3, cross-check C-7 à l'unité) : e1 `0x6290d4…333c`, e3
  `0xeb20d0…4aff` ; e2 par une **autre** tx du même événement (`00d48aed`@23549385, pas @23545088 nommée au prereg).
  **Non bloquant**. **Déclencheur** : contrôle hors-RPC exigé par U-7 ou un relecteur externe. **Propriétaire** : orchestrateur.

## Annexe — pli 2 (corrections documentaires C-G2-1..6, worker)

Worker `claude-opus-4-8[1m]` (résolu tel quel, R-1), effort max · 2026-09-20 · worktree `F:\Monark-wt-u3`, branche `lot/u-3`,
HEAD `f0eefb2` (lot `6cd991c`, prereg `e87549a`, base R-25 `13b8391`) · scratch `F:\tmp\u3-2\` · **aucun commit, aucun
workflow (R-20)** · offline. Les six corrections du verdict G2 (`docs/G2-lot-u3.md` §5) sont **documentaires** ; aucune ne
touche une série `.jsonl`, le script (`.mjs`/`.d.mts`) ou le test.

**Corrections → fichiers :**
- **C-G2-1** → census §7 « Déviations » : ajout de **D-4** (impl résolue par `eth_getStorageAt` slot EIP-1967 @B_first, pas
  le dernier `Upgraded ≤ B_first`), `error_origin` worker ; les 3 déviations pré-existantes relabellisées **D-1/D-2/D-3**.
- **C-G2-2** → PLI §8 : item formé « mapping impl → release taguée `aave-v3-origin` » (déclencheur U-7 / prochaine lecture
  `LiquidationLogic` ; propriétaire orchestrateur). `docs/PLAN-u3-prereg.md` **non touché** (sha `835805cc…` reste pinné).
- **C-G2-3** → census §7 + PLI §8 : trace Blockscout par événement **non faite** comme étape distincte ; substance couverte
  par le re-tirage receipt quorum-2 de la G2 (e1 `0x6290d4…333c`, e3 `0xeb20d0…4aff` ; e2 par `00d48aed`@23549385, pas la
  tx @23545088 nommée au prereg). Item formé non bloquant.
- **C-G2-4** → PROVENANCE §2 : « re-derives U3-inputs from the raws » surdit corrigé — sans l'archive-env, seul
  `meta.providers` de `U3-inputs` diffère ; les 3 séries de sortie sont env-indépendantes.
- **C-G2-5** → ADR « Éléments produits » + PROVENANCE §4 : `apps/sentinel/test/u3-realized.test.ts` → `test/u3-realized.test.ts`.
- **C-G2-6** → PLI §1 : census 106 → **129** ; PLI ajouté (**12ᵉ** fichier) ; en-tête 11 → **12** ; note d'ancrage `6cd991c`/`e87549a`.

**Touched set du pli 2 (docs seulement, 4 fichiers) — sha256 LF (fichiers PURE-LF : `sha256sum` == `tr -d '\r' | sha256sum`) :**

| Fichier | lignes (avant→après) | sha256 LF avant (au commit `6cd991c`) | sha256 LF après |
|---|---|---|---|
| `docs/census-2026-09-20/U3-realized.md` | 129 → 145 | `3e322d4a951b5fa81a778239db415088863885dceb79280bd4b792d56409ae18` | `b5bdc1467159d39c19e805578b813edfc3b1d0a26dc5b17749b2279e7a443858` |
| `apps/sentinel/test/fixtures/ukemi/u3/PROVENANCE-u3.md` | 62 → 62 | `8418e9840a7a84653f6b3cb6e906ff37a75d637e6fe8d8d1891559f2f3fbd7e5` | `4602831fc0fb39f3b85bacca0561aa993d15feb2c450b651c6461570d68b9505` |
| `docs/adr/ADR-U3-realized-labels.md` | 84 → 84 | `7c629176d3227a450732d31bee837de21697a04ed318aec44c45f097cac732e5` | `9f511315101af86e4e1a64be83860404971bd3ad2f905c4587eb20bb7bb18cb5` |
| `docs/PLI-lot-u3.md` | 88 → (voir ci-dessous) | `2a4c77c76c646b2aa8e1072ffc7b142933cf668ccbcd957bcc932c39cc589c55` | **auto-référentiel** |

Le sha256 LF **après** de ce PLI ne peut figurer dans le PLI lui-même (un fichier ne contient pas son propre hash).
Recalcul par l'orchestrateur (R-21) : `tr -d '\r' < docs/PLI-lot-u3.md | sha256sum` ; la valeur est portée dans la sortie
brute du worker. `avant` = sha256 LF au commit `6cd991c` (recalcul : `git show 6cd991c:<chemin> | tr -d '\r' | sha256sum`).

**Séries `.jsonl` + script + test — sha INCHANGÉ** (aucun des 7 fichiers touché ; `git hash-object` du worktree = blob `6cd991c` (= `f0eefb2`, stable après le commit de l'orchestrateur)) :

| Fichier | `git hash-object` (worktree) = blob `6cd991c` (= `f0eefb2`) |
|---|---|
| `apps/sentinel/test/fixtures/ukemi/u3/U3-realized.jsonl` | `075d401e15934173737edea523bbd692a7265dd0` |
| `apps/sentinel/test/fixtures/ukemi/u3/U3-sources.jsonl` | `acb300d92260f007fb5b35791c9fb97748e9c8cd` |
| `apps/sentinel/test/fixtures/ukemi/u3/U3-deficit.jsonl` | `73379d0ea8d4951597d3a0b6f220b4bc647b0372` |
| `apps/sentinel/test/fixtures/ukemi/u3/U3-inputs.jsonl` | `201e38208f1a91543aefffa13f5b76fe2b25fbc5` |
| `scripts/census/u3-realized.mjs` | `0ba3ae4964ddfe3916927ac201e56da808180c76` |
| `scripts/census/u3-realized.d.mts` | `b4f0c353248c448124e74a22fe8e416839af0225` |
| `test/u3-realized.test.ts` | `c151b7130690ac2461ca2dc252e93ec6fc1811fd` |

**R-25 = 825 (inchangé).** Parmi les 4 fichiers touchés, seul `PROVENANCE-u3.md` est **compté** (les 3 autres sont
`docs/**/*.md`, exclus) et il reste à **62 lignes** ⇒ contribution R-25 inchangée. Recompute (exclusions du job R-25 de
`.github/workflows/ci.yml`, base `13b8391`) : `git diff --shortstat 13b8391 -- . ':(exclude,glob)docs/**/*.md'
':(exclude,glob)apps/sentinel/test/fixtures/**/*.jsonl' ':(exclude)docs/G2-lot-*.md' …` ⇒ `4 files changed, 825
insertions(+)` (PROVENANCE 62 + `.d.mts` 64 + `.mjs` 601 + test 98 = 825 ≤ 1205). **Delta R-25 du pli 2 = 0** (base-indépendant) : identique avant/après pli 2 depuis la base déclarée `13b8391` (825 = 825) **et** depuis la merge-base locale `main`↔`HEAD` `0c47b31` (13272 = 13272). NB orchestrateur : `13b8391` n'est **pas** sur `main` ; `lot/u-3` a divergé de `main` à `0c47b31`, donc un `origin/main...HEAD` compterait toute la branche depuis la divergence (165 fichiers, ~13272 insertions) — question de **base de PR/branche** antérieure au pli 2 (ressort de l'orchestrateur, R-20), pas un écart introduit ici. La cible 825 ≤ 1205 est celle du lot (PLI §2, G2 V9), base `13b8391`.

**Oracles (re-exécutés après pli 2, tous verts) :** `gate:vocab` OK (167 fichiers, aucune revendication interdite) ·
`lang:gate` 0 hit (scope `sentinel` inclus — PROVENANCE reste anglais) · `export:check` 0 chemin interdit / 0 hit FR ·
`npx tsx --test test/u3-realized.test.ts` **4 pass / 0 fail** ; bonus `series_pinned_are_declared_and_hashed` **pass**
(table sha PROVENANCE intacte).

*Donnée brute pour l'orchestrateur (R-21) : vérifier adversarialement avant consommation. Le worker plie ; l'orchestrateur
committe (R-20).*
