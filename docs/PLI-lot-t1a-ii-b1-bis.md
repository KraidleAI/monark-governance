# PLI — lot T-1a-ii-b1-bis-i (Bell : plumbing de la course fondatrice + budget de découverte pré-enregistré)

Rédaction worker `claude-opus-4-8[1m]` effort max, 2026-09-20, à la demande de l'orchestrateur (R-20 : ne committe pas ;
R-21 : sortie vérifiée adversarialement). Worktree `F:\Monark-wt-bellb1bis`, branche `lot/t-1a-ii-b1-bis`, base `5c29871`
(G0 + « Amendement checkpoint-1 » C-1..C-11 + « Adjudications » A-1..A-5). **Aucune clé/URL d'endpoint imprimée** (opérateurs
nommés `helius`/`chainstack` seulement). **Aucun close en clair.** Bruts réseau (au run réel) hors dépôt sous
`F:\PRODUITS\etude-2026-09-20\bell-b1bis-raws\` (nom unique + sha256).

**Ce document est PRÉ-ENREGISTRÉ AVANT tout appel réseau (C-3).** Aucun appel réseau payant n'a été effectué dans le tour de
rédaction. L'orchestrateur committe ce PLI **seul** ; le run réel (scanner L-3(a) + découverte L-1/L-2) attend son go.

## 1. Livré (L-1..L-6 ; plumbing + découverte HORS LIGNE, tests verts ; la seule MESURE réseau reste gelée §4)
| L-n | Fichier(s) src | Test(s) non-LLM (composition EXÉCUTÉE depuis l'artefact, CA-11 durci) |
|---|---|---|
| L-1 | `apps/bell/src/discover.ts` (nouveau : `tallyFoundingVault` tally + appariement quote par owner ; `dexForProgram` ; `quoteClass` ; `sampleFoundingBodies` gTfA 3 points) | `bell_discover_founding_vault_from_tally` (C-2/C-3) ; `bell_discover_dex_and_quote_class_from_committed_maps` (C-5/C-6) |
| L-2 | `pools.ts` (`FOUNDING_POOLS` measure-gated ; `DEX_BY_PROGRAM_ID` ; `USD_STABLE_MINTS` ; `FOUNDING_DISCOVERY_THRESHOLD`) + `series/founding/discovery-*.json` (null) + PROVENANCE same-dir | `bell_founding_registry_equals_discovery_measure` (C-4) ; `bell_founding_registry_shape_and_distinct` |
| L-3 | `apps/bell/src/rebase-produce.ts` (nouveau) ; `collect.ts` (`TrajectoryInput`/`loadTrajectories` +`scanMethod` requis ; `--rebase-produce`/`--authority`) | `bell_trajectory_producer_composition_from_file` (runMain CLI) ; `bell_trajectory_producer_scanmethod_map_and_loader` ; `bell_trajectory_producer_pager_counts_pages` |
| L-4 | `collect.ts` (`buildSolanaSymbol` ancrage C-3 `stateAnchorMatches`) ; `rebase-scan.ts` (`pinOracleState`/`firstTwoDistinctOps`/`bodyEventKey` exportés + `auth`) | `bell_c3_anchor_stale_trajectory_is_unverified` |
| L-5 | `collect.ts` (`collect()` compte + liste) ; `digest.ts` (`GapEntryFilled.rebase_residuals?`) | `bell_gate_residuals_counted_in_state` ; `bell_residual_counter_passes_close_guard` (rejoué) |
| L-6 | `docs/adr/ADR-T1aii…` D1-sexies ; ce PLI ; `test/no-secret-in-repo.test.ts` (vérifié, non modifié) | `no_secret_in_repo` (rejoué vert) |

**L-1/L-2 sont livrés HORS LIGNE** : l'ALGORITHME (`discover.ts`) est prouvé sur des corps gTfA synthétiques en mémoire ; le
registre `FOUNDING_POOLS` est **measure-gated** (`founding_pool: null` déclaré pour les 4 mints, `bell_founding_registry_equals_discovery_measure`
prouve `registre == mesure`). La **MESURE RÉELLE** (découverte réseau) reste la seule dépense gelée derrière ce PLI (§4b) ; elle écrit
les vaults mesurés dans `discovery-*.json` **et** `FOUNDING_POOLS`, puis le test C-4 prouve l'égalité. **Aucun seam** (R-25 = 854 ≤ 1 205).

`PINNED_BELL_SHA 0cfbed20…` inchangé **prouvé** (`bell_pinned_sha_reduces_to_b3a_by_subtraction` vert). Bell reste **`upcoming`**
(absent de `fleet.ts`/README/site/skills), consommateur servi nommé = course -b1-bis-ii puis T-1b.

## 2. R-25 mesuré au gel (pathspec `STAT=` de `.github/workflows/ci.yml` l.65 ; `docs/**/*.md` exclus, `series/**/*.{json,jsonl,csv}` exclus)
Commande (worktree ; `git add -N` des deux fichiers neufs AVANT la mesure — un fichier non suivi n'entre pas dans `git diff`) :
`git diff --shortstat HEAD -- . ':(exclude,glob)docs/**/*.md' ':(exclude)package-lock.json' ':(exclude,glob)fixtures/**/*.{json,jsonl,csv}' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.{json,jsonl,csv}' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.{json,jsonl,csv}'` (…pathspec complète ci.yml:65).
**Résultat : 10 fichiers, 1 004 insertions + 27 suppressions = `CHANGED = 1 031` (borne 1 205).** Marge 174 lignes.
Gel intermédiaire L-3..L-6 seul = **517** (mesuré + rapporté au gel, avant L-1/L-2) ; L-1/L-2 offline (algorithme `discover.ts`
COMPLET : tally + owner-pairing + `confirmVault` quorum-2 exécutable/System-owned + `--discover` CLI + registre + tests) a ajouté **+514**.

**Le seam interne `-b1-bis-i-b` ne fire PAS.** Le calque G0 ×1,5 **ne s'est pas matérialisé** — le rapport mesuré `actuel/brut`
est ≈ 1,0 (L-3..L-6 : brut projeté ~490–520, mesuré 517). Total **1 031 ≤ 1 205** ⇒ L-1/L-2 **livrés hors ligne dans -b1-bis-i**
(critère de seam : mesuré > 1 205 — non atteint). La seule **mesure réelle** (réseau) reste gelée derrière ce PLI (§4b) :
`founding_pool` ne devient non-null qu'au run. Décision de coupe = orchestrateur, jamais le worker.

## 3. Table crédits/appel Helius par méthode ([lu], sources citées) — A-2
| Méthode | Crédits/appel | Source [lu] |
|---|---|---|
| RPC standard (`getTransaction`, `getSignaturesForAddress`, `getAccountInfo`) | **1** | `helius.dev/pricing` (WebFetch first-hand 2026-09-20 : « RPC calls are 1 credit ») + dashboard Usage (`docs/RESSOURCES-HELIUS-2026-09-19.md` l.12 : `getTransaction` 894→894, `getSignaturesForAddress` 345→345) |
| Appel archival / `getProgramAccounts` / DAS | **10** | `helius.dev/pricing` (WebFetch first-hand 2026-09-20) |
| `getTransactionsForAddress` (`full`, ≤ 1 000 tx/appel) | **10** | **dashboard Usage MESURÉ** (`RESSOURCES-HELIUS` l.12 : 132 appels → 1 320 crédits = 10 cr/appel exactement) — **NON publié** sur `helius.dev/pricing` (confirmé first-hand WebFetch 2026-09-20 : « getTransactionsForAddress … Not stated » ; NON TROUVÉ, `RESSOURCES-HELIUS` l.30) |

Chainstack Growth : ~1 RU/appel, 20 M RU/mois (`RESSOURCES-HELIUS` l.20). gTfA **n'a aucun équivalent Chainstack** (énumération
mono-opérateur Helius ⇒ résiduel `authority_scan_mono_operator`, décision 60) ; le quorum-2 porte sur les **corps** relus
(`getTransaction` sur op B) et sur l'**état** C-3 (`getAccountInfo` base64 sur deux opérateurs), jamais sur l'énumération.

## 4. Budget PRÉ-ENREGISTRÉ (seules dépenses réseau du lot ; gelées derrière ce PLI)
**Plafond du lot : ≤ 20 000 crédits Helius** couvrant (a) le run scanner unique L-3(a) **+** (b) la découverte L-1/L-2. 0 $ nouveau
(Developer 49 $/mois déjà payé, 10 M cr/mois ; Chainstack Growth 20 M RU/mois). `--max-calls` **fail-closed** (obligatoire, `> 0`).

**A-2 (garde machine en APPELS ; plafond en crédits ; conversion PIRE CAS)** : toute méthode comptée au tarif de la plus chère
utilisée = **gTfA 10 cr/appel** ⇒ **`--max-calls ≤ 2 000` appels** garantit ≤ 20 000 crédits pire cas. Chaque run publie
`calls_by_method` + le **coût crédits recalculé** ; si la conversion pire cas ne suffit pas à couvrir découverte + L-3(a) ⇒ **arrêt +
consultation** (jamais un dépassement silencieux, jamais un budget pondéré ajouté — R-25).

### 4a. Run scanner L-3(a) — commande exacte (exécutable telle quelle, « une commande sous le budget »)
`node apps/bell/src/collect.ts --rebase-produce --authority <S7vYFF base58, lu on-chain> --pools TSLAx,SPYx,NVDAx,AAPLx --max-calls 300 --max-pages 200 --min-interval 250 --out F:\PRODUITS\etude-2026-09-20\bell-b1bis-raws\scan` (`BELL_SOLANA_RPC`, `HELIUS_API_KEY`, `CHAINSTACK_SOLANA_URL` en env, jamais imprimés).
- **`--max-pages 200` PRÉ-ENREGISTRÉ** (≥ 166 pages + marge) : le défaut `parseArgs` est **3** ⇒ sans ce drapeau le pager s'arrête à 3 pages, ~30 cr, `enumeration_capped` (fail-closed). Le pager avance d'**exactement 1 page/appel** (`bell_trajectory_producer_pager_counts_pages` à `maxPages=3` tue le mutant double-incrément).
- Méthode : gTfA `full` sur l'autorité partagée S7vYFF (énumération complète, ~166 pages / ~164 239 signatures [lu] `PROVENANCE-rebase-course.md` l.14) ; ~166 appels gTfA × 10 cr = **~1 660 cr** + quorum-2 corps (`getTransaction` op B, ~5 candidats × 4 mints ≈ 20 × 1 cr) + oracle C-3 (`getAccountInfo` base64, 2 op × 4 mints = 8 × 1 cr). **Coût projeté ~1 825 cr** [lu] (décision 60, `PROVENANCE-rebase-course.md` l.21).
- `--max-calls` de ce run : **300** (pire cas 3 000 cr ; réel ~194 appels ≈ 1 825 cr — le pire cas 300×10=3 000 couvre les ~194 appels réels, A-2).
- **Preuve de clôture C-G2-2 (erratum C-8)** : les événements de `slot ≤ oracle_slot` épinglé **de chaque série** (A-1 : 4 valeurs distinctes) == les événements épinglés (égalité de préfixe bits/slot/index/signature) **ET** `replayTriplet(tous les événements) == triplet live quorum-2 sur les bits`. Bruts hors dépôt sous nom unique + sha.
- **Item de vérification au run réel (déclaré, non deviné)** : la **shape du corps gTfA `full`** vs un corps `getTransaction` `encoding:"json"` (data base58, F-4) **n'est pas documentée** (`RESSOURCES-HELIUS` l.30 NON TROUVÉ). `eventsFromTx` parse la shape json ; un corps non parsé ⇒ 0 événement ⇒ oracle C-3 ferme (`scanComplete:false`), **jamais un partiel muet**. Le run réel confirme la shape (ou fail-close proprement) ⇒ `PR-B-GTFA-SHAPE` si divergence.

### 4b. Découverte L-1/L-2 — ALGORITHME LIVRÉ (`discover.ts`) ; MESURE réseau gelée (paramètres pré-enregistrés C-3)
- **Code livré** : `tallyFoundingVault` (tally + appariement quote par owner, C-2), `dexForProgram` (C-5), `quoteClass` (C-6), `sampleFoundingBodies` (gTfA `full` 3 points). Prouvé sur corps synthétiques (`bell_discover_founding_vault_from_tally`). La MESURE réelle passe `sampleFoundingBodies` puis `tallyFoundingVault`, écrit `discovery-*.json` + `FOUNDING_POOLS`.
- **3 points d'échantillonnage** (C-3, A du pli) : `fromSec` (asc), **médian** `(fromSec+toSec)/2`, `toSec` (desc) de la fenêtre Cong `[1751328000, 1761955199]`. Limitation résiduelle **déclarée** : « un pool actif seulement hors des points échantillonnés n'est pas vu ».
- **N = 5 pages/point** (`sampleFoundingBodies(..., pagesPerPoint=5)` au run ; gTfA `full`, 1 000 tx/page ⇒ 5 000 tx échantillonnées/point ; le PoC `spike-poc-discovery.json` a trouvé le vault fondateur TSLAx en ~5–7 appels/mint).
- **Seuil de rétention = `FOUNDING_DISCOVERY_THRESHOLD` = 0,05** (constante committée `pools.ts` ; `bell_founding_registry_equals_discovery_measure` **épingle** `=== 0.05` — anti-dérive PLI↔code) de `vault_share_of_sample` : un vault ≥ seuil est retenu `founding_pool` (jamais top-1 : AMM v4 + CLMM + Orca possibles) ; présent mais < seuil ⇒ `candidate_below_threshold` (**publié**, jamais tu). Le seuil sépare un vault d'un compte utilisateur/ATA (présent dans peu de tx).
- Métriques publiées : `sampled_tx` (compte) + `vault_share_of_sample` par vault + `window_total_tx:"unknown (>= floor)"` — **jamais** une « couverture de fenêtre ».
- **Confirmation quorum-2 LIVRÉE** (`confirmVault`, C-5 erratum) : `getAccountInfo` jsonParsed de l'autorité de vault (`owner_of_owner`) puis du programme (`executable`) sur deux opérateurs ⇒ ~2 lectures × 2 op × 4 mints ≈ **~16–48 cr**. Owner-of-owner exécutable ∈ carte ⇒ `dex` ; System-owned ⇒ `authority_kind:"system-owned-pda-or-wallet"` **déclaré**, vault retenu sur le tally, **jamais rejeté sur l'owner seul**.
- **Commande exacte** : `node apps/bell/src/collect.ts --discover --pools TSLAx,SPYx,NVDAx,AAPLx --max-calls 300 --max-pages 5 --min-interval 250 --from-utc 1751328000000 --to-utc 1761955199000 --out F:\PRODUITS\etude-2026-09-20\bell-b1bis-raws\discover` (`--max-pages 5` = N pages/point ; fenêtre Cong en ms).
- Coût projeté : `N × 3 points × 10 cr × 4 mints = 5 × 3 × 10 × 4 = 600 cr` + confirmations ~48 cr ≈ **~650 cr**.
- `--max-calls` de ce run : **300** (pire cas 3 000 cr ; réel ~84 appels / ~650 cr — marge fail-closed).

**Contrainte de plafond (vérifiée)** : `N × 3 × 10 × 4 + ~1 825 = 600 + 1 825 = 2 425 cr ≤ 20 000`. Somme `--max-calls` des deux runs
= 600 appels ⇒ pire cas 6 000 cr ≤ 20 000. Re-mesure PoC **C-G2-6** incluse (raw hors dépôt, nom unique + sha, compte in-window
**exact non capé**, `founding_vault` **complet**).

## 5. sha256 (LF) des fichiers touchés (traçabilité R-21) — R-25 = 1 031
| fichier | sha256 (LF) |
|---|---|
| `apps/bell/src/collect.ts` | `0ffa5cb11367c5eda003f7011d5e76c23b81bc77de8849a8058928359a1f23ae` |
| `apps/bell/src/digest.ts` | `c1e48f39bb265c818ac9a2c2f814de0f41408eb63189a9b965fd0d2619ca1eac` |
| `apps/bell/src/discover.ts` | `f549578487ec4868ef72cc5482c83a75a81a876832ab92c08d5ba367d1f2f895` |
| `apps/bell/src/pools.ts` | `3caf397ad63e8d5f34005591e56ae971655cdbf1a11632268921dcc8b26a1a29` |
| `apps/bell/src/rebase-produce.ts` | `9a4d234498b4b033d238d4703e4b1aa3ad7c729a9f0be9321f024d1c2378a230` |
| `apps/bell/src/rebase-scan.ts` | `0e1cc26ba62046acbf71338a0b51f0e5cc7362d7ce68a2e473ea5e9faf32810f` |
| `apps/bell/test/collect.test.ts` | `0d8438212e364ff89e2df37c961f6f59ce1d6237848afa761d348268cc5c2a18` |
| `apps/bell/test/discover.test.ts` | `912323359ff53efe28c0f0451b298dd374f0bded45b6ae83da0d194097c48719` |
| `apps/bell/test/rebase-produce.test.ts` | `bff30c4aa8e6676bf93a50a734e03d313bebfd997d83411ce8629ff94b160139` |
| `apps/bell/test/fixtures/series/founding/PROVENANCE-founding-discovery.md` | `12d13d80da3129c00ec94e3ccfcb40c634844ba9bb01e85465d161cfe6a2f114` |
| `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md` | `b9bf18903e7ccccc4b7f26ee3eb3eb313633ca7db8e439ad6853de10758c0c6a` |
(discovery-*.json exclus R-25, sha dans PROVENANCE-founding-discovery.md ; le sha de ce PLI est calculé par l'orchestrateur au commit.)

## 6. Procurements / items formés (zéro dette nue)
- **`PR-B-GTFA-SHAPE`** (déclencheur : run réel L-3(a)) — confirmer la shape du corps gTfA `full` (getTransaction-json-compatible ?) ; sinon adapter le décodeur ; propriétaire orchestrateur → worker. Intérim : fail-closed par construction (§4a).
- **C-G2-6** (re-mesure découverte) — déclencheur : run réel L-1 ; raw hors dépôt nom unique + sha, compte in-window exact, `founding_vault` complet ; propriétaire orchestrateur → worker.
- **C-G2-2** (runner hors dépôt) — **fermé par L-3 (a)** dès le run réel (le scanner in-repo reproduit les 4 séries, erratum C-8) ; propriétaire orchestrateur.
- **Décision 60 (méthode hybride)** — **ratification investisseur due** ; si renversée, `error_origin: orchestrateur` (le plan `scanMethod="authority"` en dépend) ; séries `pending R-26 ratification`.
- **`set_authority_unscanned` (clôture)** — **PR-B-SETAUTH** (discriminant `SetAuthority` + enum `AuthorityType` [lu], `solana-program-library`) ; en attendant, résiduel déclaré porté ; hors périmètre -i (A-5, lot Bell dédié après -i, avec le scan full-mint croisé décision 67).
- **L-1/L-2 MESURE réelle** (le CODE est livré hors ligne : `discover.ts`, `FOUNDING_POOLS` measure-gated, tests C-2/C-4/C-5/C-6 verts) — déclencheur : **commit de ce PLI + go réseau de l'orchestrateur** ; puis exécuter §4b (`sampleFoundingBodies` → `tallyFoundingVault`), écrire `discovery-*.json` + `FOUNDING_POOLS` mesurés (raw hors dépôt sha-pinné, C-G2-6), re-pinner PROVENANCE, `bell_founding_registry_equals_discovery_measure` (C-4) reste vert sur la mesure ; propriétaire orchestrateur → worker.

## 7. Hors périmètre -i (rappel A-5 / invariants)
Aucune g_t fondatrice (course = -b1-bis-ii) ; aucun close ; scan `SetAuthority` + full-mint croisé (décisions 60 ratifiée / 67) =
lot Bell dédié après -i ; course -ii soumise à son propre G0 + checkpoint-1 (plafond Q5 **ratifié** A-4 : ≤ 1 M cr Helius + ≤ 200 k
appels Chainstack, fail-closed).
