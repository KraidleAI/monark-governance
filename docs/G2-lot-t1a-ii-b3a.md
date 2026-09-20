# G2 — lot T-1a-ii-b3a (Bell : trajectoire du multiplicateur Token-2022, gate rebase 3 états, g_t rebase-aware, course par scan d'autorité)

Relecteur G2 **FRAÎCHE** (instance séparée ≠ générateur), `claude-opus-4-8[1m]` effort max.
Worktree `F:\Monark-wt-bellb3a`, branche `lot/t-1a-ii-b3a`, gel **`1925736`** (livraison `c94e8f0`, plis `f0f8e61` + `1925736` ; base `3315ea7`).
Aucun commit, aucun workflow (R-20) ; sortie brute pour l'orchestrateur, vérifiable (R-21) ; scratch `F:\tmp\g2-b3a\`.
**Offline : aucun RPC live.** Cadre : `docs/G0-lot-t1a-ii-b3.md` (+ amendement C-1..C-12), `docs/PLI-lot-t1a-ii-b3a.md`
(+ annexes -b3a-2, -b3a-3), lecture `docs/biblio/bell/L-lecture-spl-token2022-scaled-ui-amount-2026-09-20.md`,
ADR-T1aii D1-quater, décisions 55/56/60 (`F:\Monark\docs\CHANTIERS.md`).

## Modèle résolu (R-1)
`claude-opus-4-8[1m]` — préfixe `claude-opus-4-8` vérifié, Opus 4.8 (1M contexte, non banni), effort max.
Source : identité de l'environnement d'exécution de la session (2026-09-20). Ce n'est ni le tier nu ni `claude-opus-5`.

## VERDICT : **APPROUVÉ-AVEC-CORRECTIONS**

Le lot est solide et fidèle à la lecture. `npm run ci` **432/432** rejoué (0 fail) ; re-pin du digest `126abfae…` **prouvé
par soustraction** ; **9 mutants tués** (M1/M5/M6/M8/M9/M11/M12 + M-r1/M-r2) avec restauration byte-exacte ; R-25 =
**1 159 ≤ 1 205** ; 4 séries quadruple-vérifiées (working tree = HEAD = PROVENANCE = source hors dépôt) ; secrets = 0 ;
CA-11 tenu ; décision 47 tenue. **Deux corrections formées** (C-G2-1 ordre CPI de `eventsFromTx` ; C-G2-2 sha du runner
hors dépôt) portent sur le chemin de scan LIVE **`upcoming`** (consommateur -b1-bis), **non déclenché par les artefacts
livrés** — elles n'interdisent **pas** le G7 de -b3a, mais doivent être portées (zéro dette : items formés, déclencheurs +
propriétaires nommés). L'orchestrateur tranche « pli -b3a-4 » vs « item -b1-bis » (C-G2-1 chiffré ci-dessous).

## Corrections formées (C-G2-n)

**C-G2-1 — ordre (slot, index) faux pour un tx mêlant top-level et CPI même-mint (fidélité C-2 partielle).**
`eventsFromTx` (`apps/bell/src/rebase-scan.ts` l.58-69) construit `all = [...msg.instructions, ...inner]` et **jette le
champ `index`** de chaque groupe `innerInstructions`, puis numérote `instructionIndex = pos` sur cette concaténation.
L'ordre d'EXÉCUTION réel intercale chaque CPI DANS son instruction top-level parente ; le code met tous les top-level
puis tous les inner. ⇒ pour un tx portant à la fois un 43/1 top-level ET un 43/1 en CPI **pour le même mint**, l'ordre
est faux — violation de C-2 « ordre (slot, index d'instruction) ».
- **Non déclenché par les artefacts livrés** : les 4 séries ont été produites par le runner hors dépôt (`course-hybrid`),
  pas par `eventsFromTx` ; recompute structurel (F:\tmp\g2-b3a\series-structural.mjs) : **toutes** les paires
  commit+schedule sont même-slot / **même-signature**, `instructionIndex` [2,3] (top-level ; Initialize idx 4) ⇒ Backed
  émet des lots top-level, jamais de mélange top-level/CPI même-mint. `eventsFromTx` reproduirait donc le bon ordre sur
  ces 4 mints.
- **Non couvert par un test** : le seul cas CPI (`bell_rebase_scan_replays_fixture_bit_identical`) a le top-level pour un
  AUTRE mint et la CPI pour le mint — jamais deux même-mint à niveaux distincts.
- **Backstop partiel** : l'oracle d'état final C-3 (`finalStateOk`) rejette tout mauvais-ordre qui change le triplet
  FINAL (⇒ `rebase_unverified`, fail-closed) ; il ne rattrape PAS un mauvais-ordre d'une paire même-slot qui laisse le
  triplet final inchangé mais corrompt un `multiplier_at(t)` intermédiaire (pertinent pour la g_t par fill de -b1-bis).
- **Correctif** : conserver `index` de chaque groupe et insérer les CPI après leur parent (≈ 8-12 l dans `eventsFromTx`) +
  un vecteur hand-built même-mint mixte dans `rebase-scan.test.ts` (≈ 10-15 l). **R-25 = 1 159, marge 46 l ⇒ pliable en
  -b3a-4 sous plafond** ; sinon **item formé, déclencheur = câblage du scan live à -b1-bis, propriétaire orchestrateur**.
- `error_origin` proposé (assigné au G7) : **rédacteur -b3a L-2**.

**C-G2-2 — provenance : le CODE du runner hors dépôt n'est pas épinglé.** `PROVENANCE-rebase-course.md` épingle les
SORTIES des séries et les bruts hors dépôt (`course/series-*.json`, `authority-probe.json`) mais pas le script
`course-hybrid`/`authority-probe` qui les a produits. Sévérité faible : les séries s'auto-vérifient (`replayTriplet` ==
oracle C-3 sur les BITS) et chaque événement porte une `signature` re-vérifiable live. **Item formé** : épingler le sha du
runner (ou une chaîne entrée→sortie) ; déclencheur = reprise/relance du runner à -b1-bis ; propriétaire orchestrateur.

**Observations (aucune n'est un défaut) :**
- Le test `bell_rebase_scan_tx_version_1` asserte `>= 1` **et** `=== MAX_TX_VERSION` (=2, `rpc.ts:56`). M8 tue `0`, mais
  une régression de la CONSTANTE à `1` passerait vert (le test ne fige pas la valeur 2). C-5 (« ne pas régresser à 1 »)
  est tenu aujourd'hui (constante = 2) ; renforcement de test optionnel.
- `constantMultiplierOver` rend `null` pour deux causes (non-constant / indéfini à une borne) toutes deux traitées
  correctement par le gate ; genesis 2025-06-10 < `fromSec` 2025-07-01 pour les 4 mints ⇒ le cas « indéfini à une borne »
  ne peut survenir en fenêtre fondatrice ici. Borne, pas défaut.
- La CI calcule R-25 sur `origin/main...HEAD` (base de fusion) ; j'ai mesuré le mandaté `3315ea7..1925736` = 1 159.
  L'orchestrateur confirmera que la base de fusion = `3315ea7` à l'ouverture de la PR. Pas un défaut du lot.

## Chiffres re-mesurés (tous reproduits)

| Oracle / mesure | Attendu (PLI) | Re-mesuré | Verdict |
|---|---|---|---|
| `npm run ci` (gate:vocab+typecheck+test) | 432 | **432 tests / 432 pass / 0 fail** (32,1 s) | OK |
| `gate:vocab` | 171 fichiers | **171 fichiers, no forbidden claim** (docs/ hors périmètre) | OK |
| `typecheck` | 0 | **0** | OK |
| `eslint` | 0 | **0** | OK |
| `lint:ratchet` | 69/69 | **69/69** | OK |
| `lang:gate` | 0 | **0** (bell + tous scopes) | OK |
| `export:check` | 0 | **0 chemin interdit, 0 hit** | OK |
| R-25 (`STAT=` ci.yml, `3315ea7..1925736`) | 1 159 | **1 159** (1 105 ins + 54 del, 15 fichiers) ≤ 1 205 | OK |
| `PINNED_BELL_SHA` | `126abfae…` | **`126abfae…` confirmé** ; retrait des 2 clés résiduelles ⇒ `eaed7ea4…` (cause unique prouvée ; 15 codes = 13+2) | OK |
| séries LF sha ×4 | PROVENANCE | **= PROVENANCE = git HEAD = byte-identique aux sources hors dépôt** | OK |
| shas pristine (traj/scan/supply/gap/spyx) | PLI | `b831c087` / `7f7cd4c7` / `b7352581` / `9dd168af` / `43243b87` — **tous conformes** | OK |

R-25 : `PROVENANCE-rebase-course.md` (+78 l) **compte** (`series/**/*.md` non exclu par le `STAT=`) — honnêtement déclaré
par le PLI. Les 4 `rebase-*.json` sont correctement exclus.

## Tableau des mutants (9 rejoués ; restauration `cp` depuis pristine, sha avant/après identique — PAS de `git checkout`)

| # | mutation | fichier | test tueur | fails | résultat |
|---|---|---|---|---|---|
| M1 | `>=`→`>` (règle de lecture/repli) | rebase-trajectory | `bell_rebase_replay_rule_ge` | 3 | KILLED |
| M5 | `overwrittenPending` neutralisé (`return 0`) | rebase-trajectory | `bell_rebase_replay_overwrite_counts` | 1 | KILLED |
| M6 | breakpoint `effTs` supprimé (C-1) | rebase-trajectory | `bell_rebase_constant_needs_trajectory` | 1 | KILLED |
| M8 | `MAX_TX_VERSION`→0 (C-5) | rebase-scan | `bell_rebase_scan_tx_version_1` | 1 | KILLED |
| M9 | `finalStateOk` toujours vrai (C-3) | rebase-scan | `bell_rebase_scan_state_divergence_is_unverified` | 1 | KILLED |
| M11 | `trajectory_known` accordé si `overwritten>0` | supply | `bell_rebase_gate_three_states` | 1 | KILLED |
| M12 | g_t `×m` ↔ `÷m` (C-7) | gap | `bell_gt_rebase_direction_m2` | 4 | KILLED |
| M-r1 | résiduels d'autorité neutralisés | supply | `bell_rebase_authority_residuals_named_and_gated` + `bell_rebase_course_replays_bit_identical` | 2 | KILLED |
| M-r2 | octet de série altéré (SPYx oracle `…f03f`→`…f03e`) | rebase-SPYx.json | `bell_rebase_course_replays_bit_identical` + `series_pinned_are_declared_and_hashed` | 1+1 | KILLED |

Restauration finale vérifiée byte-identique aux 5 shas pristine (= pins PLI/PROVENANCE). Aucun résidu de mutation.

## Vérification par point de mission

1. **Fidélité à la lecture** — OK. `>=` en lecture ET repli (traj l.108/119 ; `bell_rebase_replay_rule_ge` : t==effTs⇒
   new) ; **écrasement inconditionnel** de `new_multiplier`/`effTs` (traj l.107 ; test « future effTs » l.90-101 :
   overwrite malgré effTs futur) ; `overwritten_pending` (traj + M5) ; **deux décodeurs** instruction 18 o (`decodeUpdate`)
   / Initialize 42 o / état 56 o (`decodeStateConfig`, ordre distinct) ; **f64 LE conservé en hex**, égalité sur les BITS
   jamais le décimal ; **vecteurs binaires construits à la main** (`updBytes`/`initBytes`/`stateBytes` via DataView — casse
   la circularité MAST, commentaire test l.2).
2. **C-1/C-2/C-3/C-5/C-6/C-7** — C-1 (`constant` ⇔ m(t) identique, rejeu depuis Initialize, breakpoints effTs, spike-and-
   revert) OK (M6) ; C-2 (encodage `json`/base58 brut, `innerInstructions`, `blockTime` null⇒fail-closed) OK **sauf**
   l'ordre CPI mixte ⇒ **C-G2-1** ; C-3 (oracle d'état final quorum-2 sur les BITS, `replayTriplet` rejoué sur les 4
   séries) OK (M9) ; C-5 (`MAX_TX_VERSION`=2 réutilisé, mutant 0⇒rouge) OK (M8) ; C-6 (`SymbolInput`/`buildSolanaSymbol`
   injectable ; `bell_symbol_build_mint_quorum_fail_unverified` : quorum mint échoué ⇒ `rebase_unverified`, aucun gT ;
   smoke `main()` hors dépôt déclaré, non rejouable offline) OK ; C-7 (**prix/action = VWAP_raw / m** ; `m=2` ⇒ g_t=0 ;
   `×↔÷` rouge M12 ; défaut « constant m≠1 = brut » corrigé, g_t = g_t_raw − ln(m), `error_origin` -b1 ; m par fill au
   dénominateur ≠ VWAP brute × mean(m)) OK.
3. **Décision 60** — invariance d'autorité comme précondition **testée** (`Initialize.authority == oracle.authority`,
   recomputée OK sur les 4 séries) ; résiduels `authority_scan_mono_operator` + `set_authority_unscanned` **requis** sur
   `trajectory_known` sous `scanMethod="authority"` (M-r1 : omission ⇒ rouge) ; **TSLAx `constant` sans résiduel**
   (déclaré, honnête) ; complétude **honnêtement bornée** (énumération d'autorité mono-opérateur Helius + `SetAuthority`
   non scanné = deux résiduels nommés + items formés, backstop C-3). **Réserve** : `main()` (collect.ts l.442-444) ne
   passe PAS `scanMethod` ⇒ résiduels **test-only, non servis** — déjà déclaré item formé (tuyau `gate.residuals →
   state.json` ABSENT, ADR D1-quater l.204, déclencheur -b1-bis). Cohérent avec `upcoming`.
4. **CGU/secrets** — OK. Aucune clé/URL/uuid dans séries, PROVENANCE, tests, logs (seuls artefacts : le `FAKE_UUID`
   `deadbeef-…` et l'URL synthétique des tests négatifs de scrubbing) ; ToS Helius/Chainstack collé (PROVENANCE) ; bruts
   hors dépôt sha-pinnés ; log smoke = domaines nus (`helius-rpc.com`, `chainstack.com`) ; `bell_no_secret_in_repo` vert.
5. **Mutants** — 9 rejoués (≥ 6/14 + M-r1/M-r2), tous KILLED, restauration sha-exacte (tableau ci-dessus).
6. **Re-pin digest** — **prouvé** : `bellSha` courant = `126abfae…` ; en supprimant UNIQUEMENT les 2 clés
   `authority_scan_mono_operator` + `set_authority_unscanned` du digest reconstruit ⇒ `eaed7ea4…` (le sha pré-b3a-3) ⇒
   les 2 codes sont la seule cause du glissement, octets de fixture inchangés.
7. **Oracles** — tous verts (voir tableau) ; `npm run ci` complet lancé **une fois** après vérification qu'aucun `node`
   d'un autre worktree ne tourne (4 processus node = serveurs MCP openalex/claude-mem, aucun `node --test`/RPC de worktree).
8. **R-25** — 1 159 ≤ 1 205 (voir tableau + note base de fusion).
9. **CA-11** — Bell **absent** de `apps/site/lib/fleet.ts`, README, `apps/site`, skills (vérifié ; ADR D1-quater l.209) ;
   tuyau `gate.residuals → state.json` **ABSENT = item formé déclaré** (déclencheur -b1-bis) ; **aucun composant déclaré
   built** (tout `upcoming`).
10. **Décision 47** — **aucune g_t fondatrice calculée** : les séries ne portent que la trajectoire (clés `oracle_triplet`,
    `events`, `multiplier_at`, `founding_window_gate`, `gate_detail`, `quorum_reads`) — aucune clé `g_t`/`gap`/`vwap` ; la
    g_t rebase-aware n'existe que sur fixtures synthétiques (`bell_gt_*`).

## Provenance de cette revue
Instance G2 fraîche `claude-opus-4-8[1m]` effort max, 2026-09-20, offline. Scripts de vérification durables sous
`F:\tmp\g2-b3a\` (`repin-proof.ts`, `sweep.sh`, `series-structural.mjs`, `ci-full.log`). Sortie destinée à la
vérification adversariale de l'orchestrateur (R-21) ; le worker ne committe ni ne déclenche de workflow (R-20).
