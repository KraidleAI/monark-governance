# CHECKPOINT-2 — Bell T-1a-iii-a1 (validateur-humain `claude-fable-5-1`, 2026-09-21, HEAD `29ca01d`)

**Décision : REFUSE (clause anti-close déclenchée, appliquée à la lettre) — ré-acceptation par liste fermée, sans nouveau checkpoint-2 complet.**

## Re-exécuté (AM-2, copie `F:\tmp\cp2-univers\`, aucune écriture dépôt)
`npm run test` 500/500 exit 0 (sous `--test-force-exit`, 0 marqueur UV) ; `npm run ci` exit 0 ; `universe.test.ts` 23/23 ; 5 mutants rejoués (N-1, N-2a, C-G2-3a GET, C-G2-3a POST, N-4) — chacun rougit sa cible, témoin vert, restauration sha vérifiée ; pré-enregistrement §1-10 byte-identique à `cf07ee2` (68 lignes, sha `3d7a5194…`), 0 suppression ; R-25 `bfcc7cd...HEAD` = 1 195 ins / 0 del ≤ 1 205 ; 0 motif de secret ; commande §6 valide (flags connus, plancher 286).

## Checklist
CA-1/4/5/6/8/9/10 conformes ; **CA-3 correction C-2** (amendement d'ADR B-9 — sources R-8 + table des tuyaux — jamais porté dans un ADR) ; **CA-7 corrections C-2, C-4** ; CA-11 conforme au titre d'`upcoming` (aucun import hors tests, rien de servi) ; **clause anti-close DÉCLENCHÉE (C-1)** : les champs `multiplier`, `newMultiplier`, `newMultiplierEffectiveTimestamp` des blocs SPYx/NVDAx/AAPLx de `apps/bell/test/fixtures/universe/rpc-getaccountinfo.json:21,32,42` coïncident avec 6-8 bruts sha-pinnés hors dépôt (constantes d'état on-chain public de rebase, PAS un close, déjà présentes sur la ligne acceptée `supply.ts:33-34` — mais la clause est de forme). Les deux passes G2 avaient accepté l'étiquette « synthétiques » sans vérifier.

## Corrections (liste fermée)
1. **C-1 (bloquant G7)** : remplacer ces trois champs par des littéraux synthétiques (0 coïncidence avec `F:\PRODUITS\`), re-mesurer R-25 (~1 201), rejouer la suite, consigner au PLI (pur ajout daté) avec `error_origin` = worker + relecteurs G2/G2-delta. Aucun test ne lit ces champs ⇒ fixture attendue et test 13 intacts.
2. **C-2 (bloquant fusion)** : porter l'amendement daté rédigé en `docs/G0-lot-t1a-iii-univers-solana.md:213-219` dans `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md` (ou `ADR-B0-programme-bell.md` D6) ; `error_origin` orchestrateur.
3. **C-3 (avant le go de course)** : amendement daté du PLI §6 ré-enregistrant `--date`/`--out` + levée explicite de (i) a1-bis/C-G2-7, (ii) B-IV-2 conditions Chainstack, (iii) GARDE-HELIUS (cette course EST une course Bell ; toute exemption = escalade investisseur).
4. **C-4 (avant le go)** : item formé « rejeu checkpoint-2 post-course depuis le brut émetteur sha-pinné » (stub `httpGet` alimenté par le brut) ; C-G2D-3 avant la prochaine campagne de mutants.

**Escalade non bloquante (investisseur)** : amender ou non la clause anti-close pour exempter les constantes d'état on-chain public déjà committées sur la ligne acceptée.

Ré-acceptation : sur pièces (diff des littéraux corrigés vs bruts = 0 ; sha fixture ; 500/500 ; ADR porté). Cible de fusion : `lot/etude-suite` (merge-base `bfcc7cd`). AM-1 : littéraux réels sous étiquette « synthétique » manqués par deux G2 ; amendement d'ADR non porté ; GARDE-HELIUS non traité dans l'ordre de course ; §6 périmé par construction.
