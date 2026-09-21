# G2-DELTA — lot Bell T-1a-ii-b3d-f (reprise régime B, fold checkpoint-2 C-V-1 @ `85d4db6`)

**Modèle résolu (R-1) : `claude-opus-4-8[1m]`.** R-20. Arbre ISOLÉ `git archive` HEAD (`8a3c7af`) ; src `2c852f0c…` **INCHANGÉ**, test `8091ac06…` ; jonction `node_modules` ; aucun réseau ; restauration byte-exacte OK (src re-vérifié `2c852f0c…`).

## Verdict : **PASS-AVEC-CORRECTIONS** (une correction exacte, bloquante au pli)

Le fold (+39 test, source intacte) ferme **2 des 3** mutants « deux côtés » — MESURÉ sur la suite pliée (58 tests) :
- **(1)** MINE-1 cardinalité → **RED** (2 fail : t31 littéral + t33 sous-cas (d) édition longueur-égale de `multiplierBitsHex` via `runMain`). MINE-2 permutation-clés → **RED** (t31 littéral). ⇒ les deux mutants que j'avais laissés verts au G2 sont tués. Bon.
- **(3)** J'ai recalculé les DEUX hex livrés **INDÉPENDAMMENT du helper** (raw `sha256` sur la forme écrite) : payload `a3b346f0…40fd8e` **MATCH**, entry `1e47da9e…cfbf4` **MATCH** (event = `ev("initialize",1,0,10,0,"a")`, `multiplierBitsHex 000000000000f03f`, `list_sha256=sha("a|10")`, core `payload_sha256` en dernier). Conforme, reproductible (`F:\tmp\g2-b3df\recompute.mjs`).

**MAIS (2)** le vecteur littéral n'a **qu'UN event et ZÉRO handoff** ⇒ l'ordre d'ingestion n'est PAS épinglé :
- **MINE-3 « les deux côtés TRIENT `page_events` » (sortEvents) → SURVIT, 58/58 VERT** (mesuré, `dmut-MINE-3_sort_events.log`). Trier un tableau à 1 élément = no-op ⇒ littéral `a3b346f0…` inchangé ; toutes les fixtures sont déjà slot-ordonnées ⇒ aucun test ne mord. MINE-4 « tri `page_handoffs` » → **SURVIT** aussi (0-1 handoff).
- Preuve que MON vecteur le tue (recalcul indépendant) : `[evB,evA]` (ordre ingestion) + `[ho1]` ⇒ `payload_sha256 = f2243f755f…a581ab1ff` ; **trié** `[evA,evB]` ⇒ `194133c8…` (DIFFÉRENT) ⇒ un littéral sur ce vecteur ROUGIT le mutant sortEvents.

### Risque RÉEL (pas seulement littéral) — scénario
`sortEvents` est **vivant dans le MÊME fichier** (4 sites d'appel `:308/:317/:328/:337`) et le plan/commentaires interdisent EXPLICITEMENT de l'appliquer au payload (`:123`, `:147` « WRITTEN FORM and INGESTION ORDER, **never sortEvents** »). Un mainteneur qui enveloppe `page_events` dans `sortEvents` « pour canonicaliser » (fonction tentante, déjà importée) change le sens de `ledger_sha256` (verdict qui engage ~5,4 M cr) **sans aucun test rouge**. L'audit §5 compare par ENSEMBLE (`eventKey`) ⇒ ne rattrape PAS l'ordre. Résidu réel ; blast-radius = reproductibilité de `ledger_sha256` / ancrage externe (lié C-F-4).

### C-G2-DELTA-1 (bloquante au pli) — épingler l'ordre d'ingestion
Dans `bell_crosscheck_ledger_chain_rederives_committing_page_payload`, **remplacer/augmenter** le littéral 1-event par un vecteur à **≥2 events NON triés + ≥1 handoff**. Prêt à l'emploi (auto-contenu, hex triple-vérifié, indépendant des constantes `MINT`/`A_ADDR`) :
`evA={kind:"initialize",multiplier:"1",multiplierBitsHex:"aa",effectiveTimestampSec:0,blockTimeSec:1000,slot:10,instructionIndex:0,signature:"a"}`, `evB={kind:"update",multiplier:"1.5",multiplierBitsHex:"bb",effectiveTimestampSec:1500,blockTimeSec:2000,slot:20,instructionIndex:0,signature:"b"}`, `ho1={mint:"M",newAuthorityHex:"cc",currentAuthority:"A",slot:20,instructionIndex:1,signature:"b"}` ; ordre `[evB,evA]`,`[ho1]`, `txs=[{sig:"a",slot:10},{sig:"b",slot:20}]` ⇒ `chainedLedgerEntry("0".repeat(64),1,txs,[evB,evA],[ho1]).payload_sha256 === "f2243f755fa55d8c564017c55b92debda4a5307cc6e5e6d1b5b5607a581ab1ff"`. (Alternative : construire depuis `ev()` + un handoff de fichier en ordre NON-trié et geler le hex ; le relecteur G2-delta re-dérive.) **Tue MINE-3.** `error_origin` : **worker du fold** (a implémenté un vecteur à 1 event/0 handoff là où C-G2-1 spécifiait littéralement « ≥2 events NON triés + 1 handoff » — la partie qui pinne l'ordre a été perdue à la reprise).

## (4) C-G2-2 (`mkdirSync` avant le refus) — **CONCUR** avec le validateur/orchestrateur
Vérifié par TRACE de code : avant le refus (`:657` → throw `:583`), les seules écritures sont `mkdirSync(out)` (`:636`) ET `mkdirSync(candidateDir)` (`:656`) — créations de répertoire **idempotentes** ; le reste est lecture (`readPriorBudget`, `loadHybridSeries`) ou un throw fail-closed du garde mixte (`:643`). **Aucun octet porteur de verdict.** Aucun scénario de risque réel : un `candidates/<MINT>/` vide n'alimente `deriveCandidateShas` que sur le chemin SUCCÈS (`:686`), jamais au refus ; il n'empoisonne ni `resumeFromLedger` ni le budget ni l'artefact. ⇒ pas de réordonnancement ; **texte déclaratif dans l'Amendement de format n°2**, avec UNE précision : ce sont **DEUX** `mkdirSync` idempotents (`out` ET `candidates/<MINT>/`) qui précèdent le refus, pas seulement `candidateDir`.

**Modèle résolu (R-1) : `claude-opus-4-8[1m]`.** R-20 : je ne committe pas ; l'orchestrateur plie/G7.
