# G2 — Revue adversariale lot Bell T-1a-ii-b3d, sous-lot **-b3d-a** (contre-vérification full-mint)

Relecteur G2, **instance séparée à contexte frais** (je n'ai PAS écrit ce code). 2026-09-20 20:30 UTC (`date -u`).
Worktree jugé `F:\Monark-wt-bellb3d`, branche `lot/t-1a-ii-b3d`, base `f654151`, HEAD `87cc4d5`
(`cb25d60` = pré-enregistrement PLI committé SEUL ; `87cc4d5` = code G1 hors ligne). **Aucun appel réseau, aucun secret,
worktree jamais édité (`git status` propre en fin de passe), rien sur C:. R-20 : je ne committe pas.**

**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** — préfixe `claude-opus-4-8` conforme, Opus 4.8 1M non banni, effort max
(source = identité d'exécution de la session).

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le cœur -b3d-a (décodeur SetAuthority, scanner full-mint fail-closed/résumable, comparateur 3-verdicts ancré sur
l'oracle committé) est **correct, branché (CA-11 durci) et sourcé [lu]**. Tous les oracles passent, R-25=811,
`PINNED_BELL_SHA` inchangé, fixtures 100 % synthétiques. **Aucun défaut FAIL-grade** : zéro appel réseau dans ce lot,
aucun chemin de retrait de `pending` ne s'ouvre à tort, aucun faux `equal`. **Une correction est bloquante AVANT la passe
réseau** (sonde/tirage), pas avant la fusion offline : **C-G2-1** (unité crédits/appels de la sonde).

---

## Défauts numérotés

### C-G2-1 — **BLOQUANT avant tout tirage réseau** — la sonde n'est PAS bornée à ≤1500 crédits (confusion appels vs crédits)
`docs/PLI-lot-t1a-ii-b3d.md` §3/§4/§7 + `apps/bell/src/collect.ts:296-299`.
La sonde est déclarée « **≤ 1 500 crédits** » (§3) et réservée comme **exactement 1 500 cr** dans l'arithmétique du budget
principal (§4 : `--max-calls = ⌊(6 500 000 − 1 500 − 1 000)/10⌋ = 649 750` — **recalculé conforme**). Mais
`makeBudgetedCall` compte des **APPELS** (`n += 1` par appel, `collect.ts:296`, quel que soit le tarif) ; la commande de
sonde écrite `--max-pages 1 --max-calls 1500` (§7) autorise donc jusqu'à **1 500 appels × 10 cr/gTfA = 15 000 crédits** —
**10× la réservation**. La seule chose qui borne la commande de forme (a) à ~10-20 cr est `--max-pages 1` ; la **sonde de
densité C-7(c)** (K=8 points/mint) lancée sous `--max-calls 1500` **n'est PAS tenue à 1 500 cr**. De plus, la sonde
utilise un `--out` **distinct** (`F:/tmp/bell-b3d-sonde`) de celui du tirage (`F:/tmp/bell-b3d-run`) ⇒ le compteur
cumulatif C-1 (`budget.json` par `--out`) **ne les relie pas** : le plafond 6,5 M à cheval sur sonde+tirage+audit repose
**entièrement** sur l'hypothèse (violée) que le garde de sonde borne ≤1 500 cr. C'est exactement le piège « unités/signes »
du mainteneur.
- **Correction minimale** : sonde `--max-calls 150` (150 × 10 = 1 500 cr pire cas ; laisse `649 750` intact), **et**
  déclarer que **toutes** les invocations de sonde partagent **UN seul `--out`** pour que le compteur cumulatif borne les
  1 500 cr côté machine (ou des sous-plafonds par invocation dont la somme ≤ 150). La correction doit atterrir en
  **amendement du pré-enregistrement laissant §2 H1..H6 byte-identiques** (non-ajustabilité des hypothèses prouvable par diff).
- **Portée** : n'autorise **AUCUNE** surconsommation dans -b3d-a (zéro appel réseau ici). Bloquant avant la sonde/tirage,
  pas avant la fusion offline.
- **`error_origin` proposé** : **worker -b3d (PLI §3/§7)** ET **orchestrateur (adjudication A-4)** — A-4 a vérifié la
  *division* mais a laissé passer l'*unité* du garde de sonde.

### C-G2-2 — **CORRECTION** — le verdict `c3_mismatch` perd le détail de divergence ET une marche de routage (déviation 3 du worker)
`apps/bell/src/rebase-crosscheck.ts:293-319`.
`compareToHybrid` évalue H5 (`c3_mismatch`) **AVANT** le diff d'ensembles et retourne `inconclusive:c3_mismatch` **sans**
calculer `missingFromFullmint/missingFromSeries/fieldDiffs`.
**JUGEMENT — garder H5 en premier est CORRECT et porteur** : `eventKey` (`:283`) **exclut `blockTimeSec`**, or `tripletUpTo`
plie sur `e.blockTimeSec >= effTs` (`rebase-trajectory.ts`) ⇒ deux ensembles clé-égaux peuvent rejouer vers des triplets
différents ; un ordre « diff d'ensembles d'abord » rendrait alors un **FAUX `equal`** sur un écart de seul `blockTime`.
H5-en-premier est le seul contrôle qui exerce le timing de pliage ⇒ **ne pas inverser l'ordre**.
**MAIS** : j'ai vérifié `oracle_triplet == replayTriplet(series.events, MAX)` sur **les 4 séries committées** ⇒ tout
`c3_mismatch` sur un scan **complet** dont les ensembles diffèrent au niveau clé **EST aussi une vraie divergence** — pourtant
il est publié en `inconclusive` (a) **sans** la différence symétrique / `fieldDiffs` que le §Comparateur du G0 impose pour une
`divergence`, et (b) **routé comme `inconclusive`** (STOP qui n'auto-escalade pas) au lieu de `divergence` (**ESCALADE-INVESTISSEUR
inconditionnelle**, Amend. C-4). Cela **masque l'alarme** d'un désaccord hybride/full-mint et dégrade l'attribution
`error_origin` au G7. **SÛR** pour la propriété critique : `pending` est **conservé** dans les deux branches, **aucun faux
`equal`** (vérifié : aucun chemin ne retire `pending` ici). Ne « cache » **pas** de handoff : les handoffs sont publiés
séparément (`scan.handoffs` → artefact/report), hors du verdict.
- **Correction** : garder H5 en premier ; sur `c3_mismatch`, calculer ET publier aussi les missing-sets + un diff de triplet
  (`replayTriplet(full)` vs `oracle_triplet`). **Deux sous-cas, motifs distincts, escalade investisseur dans les DEUX** :
  **(A)** missing-sets **non vides** ⇒ vraie divergence ⇒ **route comme `divergence` (C-4)** ; **(B)** missing-sets **vides**
  (ensembles clé-égaux mais rejeu différent — écart de `blockTimeSec`, **non couvert par `eventKey`** : c'est précisément le
  cas qui justifie H5-en-premier ; ce n'est **pas** une divergence d'ensembles) ⇒ publier le diff de triplet et **déclarer
  explicitement l'écart de `blockTime`**, jamais un `inconclusive` muet. NE PAS router (B) comme une divergence d'ensembles.
- **`error_origin` proposé** : **worker -b3d-a** (déviation 3 déclarée) + spéc §Comparateur du G0/PLI.

### C-G2-3 — **NON BLOQUANT (défaut d'oracle : mutant survivant)** — `credits_recomputed`/`calls_by_method` du crosscheck non testés
`apps/bell/src/rebase-crosscheck.ts:395` (mutant **N1** : `* 10` → `* 1` **SURVIT 18/18**).
C'est **le seul endroit du code où vit l'unité 10 cr/gTfA**, et c'est la **vérité-terrain que l'audit C-5/CA-9 compare au
dashboard Helius**. Aucun test du crosscheck n'assert `credits_recomputed` ni `calls_by_method`. **Renforce C-G2-1** :
l'unité crédit n'est pinée ni dans le garde de sonde ni dans le recompute.
- **Correction** : ajouter une assertion `credits_recomputed == gTfA*10 + getTransaction*1` (+ `calls_by_method`) dans
  `bell_crosscheck_runmain_resumes_budget_and_ledger` (l'artefact est déjà écrit). `error_origin` : worker -b3d-a (test).

### C-G2-4 — **NON BLOQUANT (mutant survivant)** — filtre `programId == Token-2022` non testé négativement
`apps/bell/src/rebase-crosscheck.ts:87` (mutant **N2** : `pid === TOKEN_2022_PROGRAM` → `true` **SURVIT 18/18**).
Le cas limite « **programme ≠ Token-2022** » (explicitement demandé) n'a **aucune fixture** (toutes utilisent
`programIdIndex: 2`). Impact réel borné par le filtre `meta.err` (`:213`) qui **précède** le décodage handoff.
- **Correction** : fixture avec un programme non-Token-2022 portant des octets tag-6/type-15 ⇒ **pas** de handoff.
  `error_origin` : worker -b3d-a (test).

### C-G2-5 — **NON BLOQUANT (mutant survivant)** — `decodeSetAuthority` octet de présence ∉{0,1} non testé
`apps/bell/src/rebase-crosscheck.ts:55` (mutant **N3** : `presence === 1` → `presence >= 1` **SURVIT 18/18**).
La lecture [lu] impose `Err` pour toute présence ≠ 0/1 (`pod_instruction.rs:130`) ; le code est correct mais la branche
négative n'est pas pinée. **Correction** : cas `presence=2 ⇒ null`. Impact réel borné (tx malformée ⇒ échouée ⇒ `meta.err`).

### C-G2-6 — **NON BLOQUANT (mutant survivant)** — `decodeSetAuthority` Some sur-longueur (len ≠ 35) non testé
`apps/bell/src/rebase-crosscheck.ts:55` (mutant **N4** : `data.length === 35` → `data.length >= 35` **SURVIT 18/18**).
Le code exige exactement 35 octets (COption Some = présence + 32) ; la branche « 36 octets ⇒ null » n'est pas pinée.
**Correction** : cas 36 octets ⇒ null. Impact réel borné (idem C-G2-5).

### C-G2-7 — **RISQUE PORTÉ (pas un défaut du code -b3d-a) — à trancher AVANT le tirage ~5,4 M**
`apps/bell/src/rebase-crosscheck.ts:283` (clé de comparaison inclut `instructionIndex`).
Le full-mint dérive `instructionIndex` comme l'index **aplati en ordre d'exécution** (`eventsFromTx`, `flattenInstructions`).
Les séries committées ont été produites par le **runner hors dépôt `course-hybrid`, NON archivé** (C-G2-1/2 de -b3a).
**Aucun test in-repo n'établit que le runner a utilisé la même convention d'index.** S'ils diffèrent, le tirage réel donne
**les deux missing-sets non vides avec zéro `fieldDiffs`** — une **FAUSSE `divergence`** (SÛRE : garde `pending`) mais qui
**brûle les ~5,4 M crédits** et déclenche une escalade investisseur spurieuse.
- **Recommandation** : l'orchestrateur vérifie la convention d'index du runner (ou qu'un artefact -b3a la pine) **avant** le
  tirage, **ou** relâche la clé de comparaison vers `{slot, signature, kind, bits, effTs}` (`instructionIndex` diagnostic seul).
  `error_origin` (si ça mord) : orchestrateur / runner course-hybrid, **pas** worker -b3d-a.

---

## Tableau des mutants (restauration **byte-exacte** `cp` depuis pristine, **jamais `git checkout`** ; sha ré-vérifié après chaque)
Sandbox `F:\tmp\bellb3d\g2\wt` (tar du worktree − node_modules/.git + jonction node_modules). Baseline **18/18**.

| # | Cible | fichier:ligne | Attendu | **Résultat** | Test tueur |
|---|---|---|---|---|---|
| **M3** | budget avalé (`catch` rend `complete:true`) | rebase-crosscheck.ts:238 | RED | **RED 17/1** | `bell_fullmint_budget_fail_closed` |
| **M9** | H5 sur événements **non bornés** (fuite état live) | rebase-crosscheck.ts:297 | RED | **RED 17/1** | `bell_crosscheck_ignores_events_after_oracle_slot` |
| **M14** | comparateur `hybride ⊆ full-mint` accepté | rebase-crosscheck.ts:318 | RED | **RED 17/1** | `bell_crosscheck_divergence_keeps_pending` |
| **M1** | comparateur `full-mint ⊆ hybride` (autre sens, symétrie C-10) | rebase-crosscheck.ts:318 | RED | **RED 16/2** | `bell_crosscheck_series_event_absent_is_divergence` (+ `committed_artifacts_replay`) |
| **M15** | reprise re-chaîne depuis genesis (ignore `priorLedger`) | rebase-crosscheck.ts:189 | RED | **RED 17/1** | `bell_crosscheck_runmain_resumes_budget_and_ledger` |
| **M17** | budget non offset par `priorCalls` | collect.ts:298 | RED | **RED 16/2** | `bell_fullmint_budget_survives_resume` (+ `runmain_resumes`) |
| **N1** (neuf) | `credits_recomputed` : drop `* 10` | rebase-crosscheck.ts:395 | SURVIT | **SURVIT 18/0 → C-G2-3** | — (gap unité crédit) |
| **N2** (neuf) | filtre `pid == Token-2022` → `true` | rebase-crosscheck.ts:87 | SURVIT | **SURVIT 18/0 → C-G2-4** | — (gap programme≠Token-2022) |
| **N3** (neuf) | décodeur présence `>= 1` acceptée | rebase-crosscheck.ts:55 | SURVIT | **SURVIT 18/0 → C-G2-5** | — (gap présence invalide) |
| **N4** (neuf) | décodeur Some longueur `>= 35` acceptée | rebase-crosscheck.ts:55 | SURVIT | **SURVIT 18/0 → C-G2-6** | — (gap sur-longueur) |

**Bilan** : 6/6 mutants worker (M3,M9,M14,M1,M15,M17) **rouges** ; 4/4 mutants neufs **survivants** (= défauts d'oracle
non bloquants C-G2-3..6). Worktree confirmé **propre** (aucune édition).

## Oracles (un à un ; PAS `npm run ci`) — tous VERTS
| Oracle | Résultat |
|---|---|
| `apps/bell/test/rebase-crosscheck.test.ts` | **18/18** |
| `apps/bell/test/collect.test.ts` (porte `PINNED_BELL_SHA`) | **34/34** |
| `apps/bell/test/rebase-course.test.ts` (L-5 différé ⇒ inchangé) | **2/2** |
| `apps/bell/test/rebase-produce.test.ts` | **3/3** |
| `apps/bell/test/rebase-scan.test.ts` | **8/8** |
| `test/ci-gates.test.ts` | **27/27** |
| `test/no-secret-in-repo.test.ts` | **1/1** |
| `typecheck` (`tsc --noEmit`) | **propre** |
| `eslint` (5 fichiers touchés) | **exit 0** |
| `lint:ratchet` | **69/69** (plafond inchangé) |
| `gate:vocab` | **OK** (177 fichiers, 0 claim interdit) |
| `lang:gate` | **0 hit** (bell gated) |
| `export:check` | **0 chemin interdit, 0 hit FR** |

## R-25, PINNED, anti-close, CA-11
- **R-25 = 811 insertions** sous le pathspec `STAT=` de `.github/workflows/ci.yml` vs `f654151` (recalculé littéral :
  `5 files changed, 811 insertions(+), 17 deletions(-)`). **Conforme à l'annonce 811** ; < 1 205 ; < 1 100 ⇒ le seam
  **-b3d-b** (L-1 prod + L-5) **correctement NON déclenché** en -a.
- **`PINNED_BELL_SHA` inchangé** : `collect.test.ts` (où il vit, `:79`) **n'est pas dans le diff** ⇒ inchangé par définition ;
  `supply.ts`/`residuals.ts`/séries non touchés (L-4/L-5 différés).
- **Anti-close / synthétique** : fixtures 100 % synthétiques (`MintZZ…`, `OtherMint…`, `0xaa`/`0xbb`, signatures/slots
  inventés). Seule valeur « réelle » = `SPYx.address` (`XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W`) = **constante publique
  pré-existante de `pools.ts:93`** (pubkey de mint, **pas** un close/secret), utilisée pour que `runMain` résolve le mint.
  Opérateurs = **domaines seuls** (`mainnet.helius-rpc.com`, `sol.core.chainstack.com`). **Aucune clé/URL/close** dans le
  code/test. `no_secret_in_repo` vert.
- **CA-11 durci** : `bell_crosscheck_runmain_resumes_budget_and_ledger` **EXÉCUTE `runMain --rebase-crosscheck` depuis des
  fichiers** (seriesDir + outDir sur disque) — vraie composition, pas une regex. Bell **absent** de `README`/`fleet.ts` ;
  **rien déclaré « built »** (upcoming).

## Vérifications positives clés (pour la confiance de l'orchestrateur)
- **Décodeur byte-exact à la lecture [lu]** : tag `6`, type `15`, COption None len 3 / Some len 35, présence≠0/1 ⇒ null ;
  marche CPI via `flattenInstructions` **partagée avec `eventsFromTx`** (une source, pas de dérive) ; filtre `mint ∈ 4` +
  type-15 ; multisig ⇒ `currentAuthority` = compte index 1 (correct). Cas limites tronqués/type≠15/top-level vs inner **couverts**.
- **H5 sain (C-2)** : ancré sur l'`oracle_triplet` **committé** (jamais l'état live — `compareToHybrid` est **PUR**, aucun
  `getAccountInfo` ; M9 par construction). **Vérifié offline** : `replayTriplet(events, MAX) == oracle_triplet` sur **les 4
  séries** ⇒ le chemin `equal` est **atteignable** (le cas d'update *pending* SPYx — `effTs 1781755200 > blockTime 1781754664`
  — plie correctement : `multiplier` reste l'ancien, `newMultiplier` porte le pending).
- **Scanner fail-closed** : budget cumulatif inter-process (`readPriorCalls` offset ; `budget.json` malformé ⇒ throw) ;
  complétude = épuisement + ancre début (`Initialize`) + ancre fin (page desc `slot.lte=oracle_slot`, sig la plus récente ==
  dernière sig asc) + monotonie + pages pleines + pas de `blockTime` nul + pas d'échec quorum-corps + pas d'ambiguïté même-slot.
  **Un scan interrompu ne peut se présenter complet** (l'ancre de fin attrape la troncature ; `maxPages`/budget ne posent pas
  `exhausted`). `meta.err != null` ignoré (C-9) ; `blockTime` nul ⇒ `inconclusive` jamais un skip (C-8).
- **Comparateur** : 3 verdicts ; divergence **symétrique** dans les deux sens (M1 **et** M14 rouges) ; **re-borne les DEUX
  côtés** à `oracle_slot` (M4, ceinture+bretelles avec le `slot.lte` serveur).

---
### Provenance
Revue par relecteur G2 `claude-opus-4-8[1m]` effort max, contexte frais, 2026-09-20, worktree `F:\Monark-wt-bellb3d`
@ `87cc4d5`. Sandbox mutants `F:\tmp\bellb3d\g2\wt` (pristine + sha dans `F:\tmp\bellb3d\g2\pristine`). Aucun réseau, aucun
secret, aucune écriture dans le worktree, aucun commit (R-20). Sortie vérifiable adversarialement (R-21).
