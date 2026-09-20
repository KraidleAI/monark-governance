# PLI — lot T-1a-ii-b1 (course fondatrice Bell, jambe Solana)

Worker Opus 4.8, worktree `F:\Monark-wt-bellb1`, branche `lot/t-1a-ii-b1`, base HEAD `96ca634`.
Ce PLI est la sortie du worker (données brutes pour l'orchestrateur, R-21). Il ne committe rien (R-20).

## Modèle résolu (R-1)
`claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`, effort max, Opus 4.8 1M contexte — non banni).
Source : identité fournie par l'environnement d'exécution de la session (2026-09-19/20).

## Contexte C-4 (tranché par l'orchestrateur en cours de mission, 2026-09-19)
Lecture CGU Helius (MàJ 2026-04-24) + Chainstack (juin 2026) transmise : silencieuses sur les fixtures ;
clauses anti-redistribution visant le Service (Helius §7(v),(viii) ; Chainstack §4.2(i)). Décision prudente :
**réponses RPC brutes NON committées** (restent hors dépôt sous `F:\tmp\bell-b1\spike\` puis archivées
`F:\PRODUITS\etude-2026-09-19\bell-b1-spike\`, sha256 consignés ici et en PROVENANCE) ; le dépôt ne reçoit
que **séries réduites + mesures dérivées** (données on-chain publiques recalculées). Paragraphe CGU collé
dans chaque `PROVENANCE-*.md`.

## Phase 1 — corrections de code (déterministes, testées, mutants) — FAIT
Toutes vérifiées `tsc --noEmit` OK, `eslint` OK (aucun `any`/unsafe neuf), 40 tests bell verts.

- **C-10** (`test/no-secret-in-repo.test.ts`) : 5 motifs ajoutés — `(core\.)?chainstack\.com/[0-9a-f]{32}`,
  `p2pify\.com/[0-9a-f]+`, `wss://…/<hex≥16>`, `Bearer …≥16`, `*_API_KEY=` ; non-vacuité + preuves de
  non-faux-positif (template `Bearer ${apiKey}`, `process.env.*_API_KEY`, hôte nu, mention prose). Mutant
  planté (fichier `apps/bell/test/fixtures/_c10_mutant_probe.txt`, sha256 `2fd4cf06…`, jamais committé) ⇒ 3
  motifs rouges (Chainstack, Bearer, API_KEY) ⇒ retiré ⇒ vert. [mutant 1-3]
- **C-9** (`apps/bell/src/operators.ts` neuf + `quorum.ts` + `collect.ts`) : `operatorOf(url)=MAP[providerOf]??providerOf`
  ; distinctness du quorum et `providers_distinct` par OPÉRATEUR (Chainstack `chainstack.com`+`p2pify.com`=1).
  Test `bell_quorum_pair_two_operators` : paire Chainstack ⇒ `no_quorum` ; Helius+Chainstack ⇒ valeur ;
  `providers_distinct`=2 pour 2 hôtes Chainstack + Helius. `providerOf` reste la forme de LOG (sans clé).
- **C-7** (`sessions.ts` `refCloseDateOf` + `collect.ts` `closeAndAdv`/`refCloseDatesForFills`) : close **par
  jour de référence** via Massive `range/1/day/{jour}/{jour}?adjusted=false` (jamais un `/prev` sur toutes les
  ancres ; jamais un look-ahead : pre/regular ⇒ close du jour de bourse précédent). `close_source:
  "massive-starter-internal"` en provenance (valeur non numérique ⇒ garde close ne rougit pas ; mutant close
  numérique rougit). Injectable ⇒ testé hors ligne. Tests `bell_close_per_reference_day_no_lookahead`,
  `bell_close_source_named_in_provenance`. Re-pin `PINNED_BELL_SHA` (résidu `rebase_unverified` ajouté au
  digest ; octet de fixture rougit toujours). [mutant 4 : single-close/look-ahead]
- **C-11 + O-12** (`collect.ts` `parseArgs`/`makeBudgetedCall`, `quorum.ts` `BudgetExceededError`) : `--max-calls`
  OBLIGATOIRE (>0), exit 1 fail-closed ; `Infinity`/`NaN`/`0`/négatif rejetés (O-12) ; budget jamais avalé
  comme fault (re-throw dans `quorum2`, `withRetry`, `liveSolanaFills`). Tests `bell_max_calls_budget_fail_closed`,
  `bell_parseargs_fail_closed_and_wired` (ordre : erreurs pool/num/eth avant l'exigence `--max-calls`). [mutant 5]
- **C-6** (`residuals.ts` `rebase_unverified` + `supply.ts` `rebaseGate` + `collect.ts` + `digest.ts`) : gate
  pur (multiplicateur lu aux DEUX bornes, sinon abstention) ; live `liveRebaseGate` (scan des signatures de
  l'AUTORITÉ scaledUiAmount dans la fenêtre — méthode à valider au spike). Sessions abstenues portent vwap sans
  gT. Tests `bell_rebase_gate_constant_or_abstains`, `bell_rebase_unverified_abstains_sessions`. [mutant 6]
- **O-9** : `bell_is_sol_revert_transport_vs_deterministic` (−32005/−32004/−32603 = transport ⇒ false ;
  déterministes ⇒ true ; Error nu ⇒ false). [mutant 7]
- **O-10** : `bell_solana_endpoints_env_override` (BELL_SOLANA_RPC trim/vides ; défaut = 1 endpoint ⇒ no_quorum). [mutant 8]
- **O-6** : sondes RPC en provenance (spike) + divergence corps-niveau — voir Phase 2/3.
- **C-13/C-15** : schéma `PoolRef` étendu + registre — voir Phase 3.

## Phase 2 — spike (mesures seules committées ; bruts hors dépôt) — EN COURS
Secrets chargés depuis le scope User dans le process PowerShell (jamais échoués/fichier) ; `BELL_SOLANA_RPC`
composé en mémoire. Bruts sous `F:\tmp\bell-b1\spike\` (sha en PROVENANCE, hors dépôt, C-4).

**Mesures confirmées (first-hand, 2026-09-20)** :
- **Chainstack archive** : `getFirstAvailableBlock` = 0 (archive complète). `getSignaturesForAddress` 1000 sigs/page ~1 s.
- **Massive** : TSLA `range/1/day/2025-07-01` HTTP 200, close présent (valeur NON enregistrée, ESC-1 c). Profondeur 2025 OK.
- **C-15 découverte de vaults (méthode générique validée)** : `getTokenAccountsByOwner(poolId, {programId: SPL|Token-2022})`
  retourne les vaults ; `hasVaultBase && hasVaultQuote` = true pour les 4 pools intégrés. Méthode retenue (pas de décodeur par DEX).
- **Helius `getTransactionsForAddress`** (Helius-exclusif) : forme params = `[address, {transactionDetails, sortOrder,
  limit, paginationToken, filters:{blockTime:{gte,lte}}}]` (doc Helius [lu] api-reference/…/gettransactionsforaddress) ;
  réponse `{data, paginationToken}`. Filtre blockTime serveur-side ⇒ énumération de fenêtre directe (clé d'affordabilité).

**DÉCOUVERTE PIVOT (mesurée, reproductible) — les pools du census v3 ne sont PAS les pools de la fenêtre fondatrice** :
- Premier tx par pool census-v3 : **TSLAx `8aDaBQ…` 2026-02-11**, **SPYx `6truu3…` 2026-01-15**, **AAPLx `ApniVW…` 2026-09-11**,
  **NVDAx `49iMat…` 2025-07-02** (mais seulement **8 tx** sur toute la fenêtre 2025-07→10). ⇒ 3/4 pools POSTÉRIEURS à la
  fenêtre ; le 4ᵉ quasi dormant. Décompte gTfA fenêtre : TSLAx/SPYx/AAPLx = 0, NVDAx = 8.
- MAIS les **mints** xStocks étaient actifs en fenêtre : premier tx **2025-06-10/11**, **8000+ tx/mint** dans la fenêtre
  (capé à 8 pages). ⇒ le trading fondateur 2025 des xStocks a eu lieu sur **d'autres pools** (à découvrir on-chain), pas
  sur les pairAddress du census v3 (qui datent de 2026).
- Conséquence : la course fondatrice Cong Table 4 sur « les pools du census v3, fenêtre 2025 » donne ~0 session. La
  réplication est possible SEULEMENT en découvrant les pools 2025 par mint (scan de l'activité in-window du mint → pools/vaults).
- Témoins (quorum-grade) : (1) Raydium `api-v3/pools/info/ids` openTime = 0 pour les 4 (non concluant : 0 = pas
  d'open programmé, pas la date de création) ; (2) Chainstack `getSignaturesForAddress(AAPLx poolId)` : 6000 sigs
  en 6 pages toutes du 2026-09-19 (pool ultra-actif récent, 0 in-window) — corrobore « pool récent ». Le socle
  reste : premier-tx par pool (Helius, first-hand) + mints actifs in-window (probe3). Second témoin de création
  de pool impraticable (pools trop actifs pour paginer jusqu'au genesis à coût raisonnable).

**DÉCOUVERTE PIVOT 2 (rebase) — les xStocks rebasent en continu** : scaledUiAmountConfig lu (spike) :
TSLAx `multiplier=1, newMultiplier=1, effTs=0` (jamais scalé) ; **SPYx 1.0039, NVDAx 1.0009, AAPLx 1.0027**, chacun
avec un `newMultiplier` en attente (effTs futur) ; **autorité PARTAGÉE `S7vYFF…`** pour les 4, **3000+ sigs in-window**
(capé). ⇒ (a) la méthode « scan des sigs de l'autorité » (mon `liveRebaseGate` initial) est **mauvaise** (partagée +
massive) → remplacée par une règle PURE d'état de mint (immutable ssi pas d'autorité scaled) ; (b) l'état multiplicateur
HISTORIQUE (borne 2025-07-01) est **illisible** par `getAccountInfo` (courant seul) ⇒ au sens strict de C-6, le
multiplicateur ne peut être « lu à la borne de début » ⇒ **rebase_unverified** pour tout mint à multiplicateur mutable.
La reconstruction de la trajectoire (instructions SetMultiplier + effTs, first-hand) est le travail de **-b3**.
⇒ **la g_t fondatrice -b1 est doublement bloquée** : pools census hors fenêtre ET multiplicateur non vérifiable ⇒
même sur les pools 2025 découverts, la g_t fondatrice -b1 = **abstention rebase_unverified** (sauf mint réellement immutable).

**PoC de découverte (TSLAx, ~7 appels Helius) — RÉUSSI** : gTfA `full` sur le mint (fenêtre) → tally des comptes
détenant TSLAx → vault fondateur `CY9Xzc1z…` avec **5000+ tx in-window** (capé). La découverte des vaults 2025 est
donc **faisable** (~10-20 appels/mint) ; le coût de course C-5 = Σ tx in-window des vaults découverts (mode signatures),
estimé à partir de n=1 (TSLAx ≥ 5000 tx in-window pour un seul vault), **non projeté** sur les pools census (0 donnée).

### CONSULTATION FORMÉE (R-26, orchestrateur → investisseur/validateur) — décision AVANT toute course
**Problème (une phrase)** : les pools Solana du census v3 (source -b1) datent de 2026 (0 donnée dans la fenêtre
fondatrice 2025-07→10), et les xStocks rebasent via un multiplicateur mutable dont l'état historique est illisible ⇒
la course fondatrice -b1 telle que cadrée ne peut produire aucune g_t.
**Tentatives** : spike (profondeur, coûts, méthode) ; probe2 (premier-tx par pool) ; probe3 (mints actifs in-window) ;
probe4 (témoins + PoC découverte TSLAx réussi). Toutes first-hand, reproductibles, bruts hors dépôt sha-pinnés.
**Options (costées)** :
- **(a) RECOMMANDÉE — registre fondateur = pools 2025 découverts on-chain** (champ `founding_pool` distinct du
  `pairAddress` census). Faisable (PoC OK), ~10-20 appels/mint de découverte. Permet la réplication Cong sur les
  vrais pools 2025. MAIS la g_t reste `rebase_unverified` pour les mints à multiplicateur mutable (tous les xStocks
  mesurés) tant que -b3 ne reconstruit pas la trajectoire ⇒ **la g_t fondatrice dépend de -b3** ; -b1 livre alors la
  découverte + les vaults + les décomptes in-window + l'abstention nommée, pas la g_t. Sort du périmètre fermé -b1
  (touche décisions 40/44/45) ⇒ décision requise.
- **(b) -b1 tel qu'écrit** (pools census, fenêtre 2025) → constat ≈ 0 session (NVDAx 8 tx ; autres 0), bornes
  déclarées par pool (ADR C-11) ; découverte des pools 2025 = **lot -b1-bis**. Honnête mais la valeur fondatrice = nulle.
- **(c) décaler la fenêtre Solana à l'extension 2025-11 → 2026-09** (décision 45) : les pools census ont des données
  là ; **perd la comparabilité Cong Table 4** (fenêtre ≠ celle de Cong) ; le rebase reste à traiter (-b3).
**Reco worker** : (a) pour la découverte + registre fondateur (livrable -b1 réel), MAIS la g_t fondatrice n'est
atteignable qu'après -b3 (rebase) ⇒ soit fusionner -b1+-b3 sur la jambe Solana, soit -b1 = découverte+décomptes+abstention
et -b3 = g_t rebase-aware. Décision investisseur/validateur.

## Phase 2 bis — spike committé (C-3/C-14) — FAIT
Mesures committées `apps/bell/test/fixtures/series/spike/{spike-measures,spike-findings}.json` +
`PROVENANCE-spike.md` (ToS collé, LF-sha des données, sha des bruts hors dépôt). Bruts + scripts archivés
`F:\PRODUITS\etude-2026-09-19\bell-b1-spike\{raws,scripts}\` (sha des 5 scripts en PROVENANCE). `series_pinned`
vert. Budget spike total ~90 appels Helius (0,001 % du quota mensuel 10 M) — course jamais lancée.

## Phase 3 — course — BLOQUÉE sur la CONSULTATION ci-dessus (aucune course lancée ; budget préservé)

## Phase 4 — docs — FAIT
- **ADR-B0** : amendement 2026-09-20 — O-6 LIVRÉ (spike sous `series/spike/`, bruts hors dépôt, CGU) + 2 découvertes
  pivot + escalade formée + `error_origin` planificateur.
- **ADR-T1aii** : ligne **Tuyaux -b1** (entrée Helius+Chainstack/census/Massive ; sortie mesures→escalade,
  course→BLOQUÉE ; état bruts hors dépôt / `upcoming` CA-11 ; test 44 bell + racine + smoke).

## Smoke live (seul oracle d'exécution du câblage live ; hors dépôt `F:\tmp\bell-out*`)
- **Budget fail-closed (C-11)** : `--max-calls 5` ⇒ exit 1, message verbatim « bell/collect: --max-calls budget of 5 exceeded (C-11 fail-closed) ».
- **Pipeline complet (NVDAx, fenêtre récente 30 min, 759/4000 appels, exit 0)** : gate rebase **`rebase_unverified` déclenché en direct**
  (multiplicateur mutable) ; résidus `quorum_sampled` + `multiplier_unit` ; `provenance.sources.close_source = "massive-starter-internal"` ;
  quorum `providers_distinct = 2` (operatorOf) ; **aucune url/clé/uuid en sortie**, aucun nombre close-like. Valide C-6/C-7/C-9/C-10/C-11 bout-en-bout.

## Mutants (≥ 8 ; rouges par construction, restauration prouvée)
1-3. **C-10** motifs Chainstack-url / Bearer / `*_API_KEY=` : fichier planté (sha `2fd4cf06…`) ⇒ 3 rouges ⇒ retiré ⇒ vert.
4. **C-9** `bell_quorum_pair_two_operators` : 2 hôtes Chainstack = 1 opérateur ⇒ `no_quorum` (providerOf aurait passé).
5. **C-11** `bell_max_calls_budget_fail_closed` : appel hors budget ⇒ `BudgetExceededError`, jamais un fault ; + smoke exit 1.
6. **C-7** `bell_close_per_reference_day_no_lookahead` : pre/regular ⇒ close du jour précédent (mutant : ancre = look-ahead) ; jours de référence distincts (mutant : un seul close).
7. **C-6** `bell_rebase_unverified_abstains_sessions` + `bell_rebase_gate_from_mint_immutable_vs_mutable` : mutable ⇒ abstention (mutant : pas de gate ⇒ g_t) ; + rebase_unverified live.
8. **C-7** `bell_close_source_named_in_provenance` : close NUMÉRIQUE ⇒ garde rouge (close_source string ⇒ vert).
9. **C-13** `bell_pool_registry_c13_fields` : quoteDec 6→9 ⇒ VWAP diffère.
10. **C-14** `bell_report_aggregates_by_regime_constat` : exceed5 1→0 ⇒ agrégat diffère ; constat sans vert/rouge.
11. **replay** `bell_collector_replays_fixture_bit_identical` : re-pin `PINNED_BELL_SHA` (ajout `rebase_unverified` au digest).
    **Mutant PROUVÉ en direct** : flip 1 chiffre (baseDelta `-60427747`→`-60427748`) ⇒ « series/mint fixture drifted from
    the pinned digest » (rouge) ⇒ restauré ⇒ LF-sha `7f81f670…` = pin PROVENANCE-tslax-series.md ⇒ vert.
12. **O-9** `bell_is_sol_revert_transport_vs_deterministic` : −32005/−32004/−32603 = transport (false) vs déterministe (true).

**12 tests neufs (base 390 → 402), à cocher au G2** : `bell_quorum_pair_two_operators`, `bell_max_calls_budget_fail_closed`,
`bell_is_sol_revert_transport_vs_deterministic`, `bell_solana_endpoints_env_override`, `bell_close_per_reference_day_no_lookahead`,
`bell_rebase_gate_constant_or_abstains`, `bell_rebase_gate_from_mint_immutable_vs_mutable`, `bell_rebase_unverified_abstains_sessions`,
`bell_close_source_named_in_provenance` (collect.test) ; `bell_pool_registry_c13_fields` (bell.test) ;
`bell_report_aggregates_by_regime_constat`, `bell_report_finds_per_pool_state_files` (report.test).
**Réserve honnête** : la branche IMMUTABLE de `rebaseGateFromMint` (autorité null ⇒ constant) n'est exercée que par un
literal SYNTHÉTIQUE — aucun mint xStock mesuré n'y tombe (tous portent l'autorité partagée `S7vYFF…`). `bell_pool_registry_c13_fields`
inclut une assertion NON-tautologique : `baseDec` du registre == décimales du mint lues sur la fixture réelle (getAccountInfo capté).

## R-25 (pathspec UNION ci.yml, vs 96ca634) — 762 < 1 205 (pas de seam)
Tracked 459 (406 ins + 53 del) + untracked comptés 303 = **762** (`bell-report.mjs` 109, `bell-report.d.mts` 35,
`operators.ts` 33, `report.test.ts` 53, `PROVENANCE-spike.md` 73). Exclus : `spike-*.json` (213+125, racine séries),
`PLI` 127 (docs). Sous plafond 1205 ; > cible 650 (surcoût = script rapport C-14 + PROVENANCE) — pas de seam requis.

## Oracle (exécuté UNE fois en fin, worker CRA-B en //) — TOUT VERT
- `npm run ci` : gate:vocab OK (168 fichiers), typecheck OK, **402 tests pass / 0 fail** (base 390 + 12 bell).
- `npm run lint` : rc=0. `npm run lint:ratchet` : **69/69** (aucun unsafe/any neuf). `lang-gate`/`export:check` : 0 hit.

## Reste (honnête — zéro dette nue ; chaque point = item formé avec déclencheur)
- **Course fondatrice Solana** : BLOQUÉE sur la CONSULTATION FORMÉE (options a/b/c). Déclencheur : décision
  investisseur/validateur. Aucune g_t fondatrice committée (aucune donnée census in-window ; multiplicateur historique illisible).
- **Découverte des pools 2025 + registre fondateur** (option a) : méthode prouvée (PoC TSLAx) ; déclencheur : go option a.
- **g_t fondatrice rebase-aware** : dépend de **-b3** (reconstruction SetMultiplier) ; déclencheur : lot -b3.
- **`getTransactionsForAddress` crédit/appel exact** : non trouvé dans la doc Helius ; forme + latence mesurées ;
  déclencheur : lecture du dashboard Usage (procurement orchestrateur) si la projection C-5 devient décisive.
- **Rapport `docs/MESURE-FONDATRICE-bell-2026-09.md`** : script `bell-report.mjs` livré + testé ; le doc n'est
  généré qu'une fois un D9 réel produit (après go course). Déclencheur : course lancée.
- **Second témoin de création de pool sur Chainstack** : impraticable (pools trop actifs) ; corroboré par
  l'activité in-window des mints (probe3). Non bloquant.
- **Parallélisme borné par fournisseur (item census v1)** : NON implémenté — le collecteur reste **sériel**
  (`--min-interval`, sûr, respecte les rate-limits Helius 50 rps / Chainstack 250 rps). Décision documentée :
  la concurrence bornée par fournisseur est une optimisation de DÉBIT pour la course (pas de correction) ; l'ajouter
  sans course pour l'exercer (R-21) est risqué. Conception notée (pool de concurrence borné pour les corps, énumération
  restant sérielle via `before`). Déclencheur : go course. Le sériel est le défaut sûr d'ici là.
- **`signaturesUntil` pagine depuis maintenant** (exposé par le pivot) : pour une fenêtre historique sur un pool
  actif, il traverse toute la queue 2026. Correction connue (amorcer `before` avec la plus récente signature
  in-window issue de gTfA Helius, pour que Chainstack n'énumère que la fenêtre). Déclencheur : go course + budget.
- **O-6 « sampling testable »** : l'échantillonnage de corps (`i % bodySample`) est déterministe ; la divergence
  corps-niveau passe par `quorum2` (testée : `QuorumDisagreementError`, `bell_quorum_pair_two_operators`) ; le résidu
  `quorum_sampled` a été **déclenché en direct** au smoke NVDAx. Un test hors-ligne dédié de `liveSolanaFills`
  (export + injection lourde) est optionnel — la preuve live + les tests quorum couvrent la sémantique.
