# G0 — Sprint backlog lot Bell T-1a-ii-b3d-f (condition de GO (f) : engagement chaîné du payload du ledger de contre-vérification)

Orchestrateur `claude-fable-5-1`, 2026-09-21 ~09:40 UTC. Après consultation ADVISOR (R-26, avis reçu ~09:35 UTC, ci-dessous en substance ; avis, pas verdict). Régime B (décision 116) ; **régime « petit lot » EXCLU** (le verdict engage de l'argent : tirage ~5,4 M cr). Checkpoint-1 requis AVANT tout code.

## Objectif (une phrase)
Rendre le verdict repris de `runMain` **non falsifiable par édition de `page_events`/`page_handoffs`** : le `headSha` rendu par `verifyLedgerChain` commet TRANSITIVEMENT le payload de chaque page, de sorte qu'une reprise sur un ledger au payload édité est **refusée fail-closed** (condition (f), `docs/G0-lot-t1a-ii-b3d-b.md:239` ; ITEM-A du G2 b1a, reproduit par le validateur).

## Faits [lu] (fichier:ligne à l'état `d8d25e3`)
1. `rebase-crosscheck.ts:143-151` `chainedLedgerEntry(prevSha, page, txs)` : core §6 à 9 champs, `entry_sha256 = sha(JSON.stringify(core))` ; `:161` commentaire « payload is NEVER hashed » ; `:173-178` `verifyLedgerChain(entries: LedgerEntry[])` recompose le core à 9 champs.
2. `:299` écriture de l'entrée ; `:285` `pageEvents.push(...evA)` (ordre d'ingestion) ; `:594` enregistrement atomique `{...core, page_events, page_handoffs}` ; `:503-510` `resumeFromLedger` → `priorEvents`/`priorHandoffs` → `compareToHybrid` ; `:506` refus fail-closed si la chaîne ne se re-dérive pas ; `:611` `authority_change_found = scan.handoffs.length > 0` (gate L-5).
3. **Le payload n'est PAS observationnel** (prémisse de L-b1a-6 tombée, advisor) : `MultiplierEvent` (`rebase-trajectory.ts:81-90`) et `SetAuthorityHandoff` (`rebase-crosscheck.ts:80-87`) = strings/numbers/null décodés du corps de tx ; aucun horodatage machine, aucun compteur ; les retries vivent dans `budget.json` (`:569`, `:588`). Aucun BigInt (`Number(getBigInt64)` `rebase-trajectory.ts:45` ; `String(f64)` `rebase-scan.ts:87`) — le record s'écrit déjà par `JSON.stringify` (`:597`).
4. **Les DEUX payloads portent un verdict** : `page_events` → `compareToHybrid` (equal/divergence) ; `page_handoffs` → `authority_change_found` (gate L-5). ⇒ toute scission (option B) laisse un vecteur.
5. Consommateurs de `verifyLedgerChain` : `:506` et les tests `rebase-crosscheck.test.ts:610-646, 918+` — aucun autre (grep dépôt, hors docs). Aucun tirage n'a écrit de ledger ⇒ **aucune migration**.
6. Format partagé ? Le ledger de CYCLE (`@monark/rpc-guard`, GARDE-HELIUS) et le ledger d'univers (-iii-a1-bis, CONV-1, `CHECKPOINT1-lot-t1a-iii-a1-bis.md:142` C-3) sont des formats **distincts** du §6 de la contre-vérification ; ce lot ne les touche pas — **à re-vérifier par grep au G1** (aucun test hors `rebase-crosscheck.test.ts` ne doit épingler le core à 9 champs).

## Options écartées (advisor, reprises par l'orchestrateur)
- **B** scission events (chaîné) / handoffs (libre) : fait 4 ⇒ ne satisfait pas (f).
- **C** re-décodage depuis `candidates/<MINT>/` + `candidate_shas` dans le core : deux formats touchés, re-décodage à chaque reprise, et la même main édite les candidats ; exclu par G0-b `:239`.
- **D** seconde chaîne hors core : deux heads à vérifier, sans gain sur un champ dans le core (déjà transitif).

## Décision de conception : **option A** — `payload_sha256` = 10ᵉ champ du core §6
- `chainedLedgerEntry(prevSha, page, txs, pageEvents, pageHandoffs)` calcule `payload_sha256 = sha(JSON.stringify({ page_events, page_handoffs }))` sur la **forme écrite, dans l'ordre d'ingestion** (`:285`, jamais `sortEvents` `:326`) et l'ajoute **en dernier** au core ⇒ `entry_sha256` le commet ; `prev_entry_sha256` commet transitivement toutes les pages ; `ledger_sha256` (`:154`, `:607`) inchangé de calcul, renforcé de sens.
- `verifyLedgerChain(records: readonly LedgerRecord[])` **RECALCULE** `payload_sha256` depuis `page_events`/`page_handoffs` relus, le place dans le core recomposé, compare à `entry_sha256` — **jamais** le champ stocké seul. Idempotence `stringify∘parse∘stringify` : clés non entières, ordre d'insertion préservé, nombres finis/strings/null (ECMA-262 [abs] ; `NaN` ⇒ `null` stable mais evB seul peut en porter et n'entre pas dans `page_events`, `:283-285`).
- `resumeFromLedger` (`:506`) inchangé : le refus existant devient le refus de (f). Sémantique **déclarée** : engagement d'**intégrité de la forme écrite** (writer unique), pas de canonicalisation sémantique (RFC 8785 JCS [abs] non retenue : aucun consommateur non-JS).
- `candidate_shas` (`:516-522`) reste hors chaîne (pins, pas un intrant du verdict) — **déclaré**.

## Livrable L-f-1 (périmètre FERMÉ)
| Champ | Contenu |
|---|---|
| **Fichiers** | `apps/bell/src/rebase-crosscheck.ts` (`LedgerEntry` + `payload_sha256`, `chainedLedgerEntry` 5 args, `verifyLedgerChain` sur `LedgerRecord`, commentaires `:63, :161, :170-171, :295, :594` réécrits) ; `apps/bell/test/rebase-crosscheck.test.ts` (tests `:284-285, :610-646` adaptés ; 1 test neuf) |
| **Tests** | `bell_crosscheck_resume_refuses_edited_payload` (motif `:637-646`) : run-1 stop budget après la page 1 → **(a)** `page_events` édité (Initialize retiré), `entry_sha256` intact ⇒ run-2 `assert.rejects(runMain, /chain does not re-derive/)` et **aucun** `crosscheck-<MINT>.json` écrit ; **(b)** variante `page_handoffs` (+1 handoff) ⇒ refus ; **(c) contrôle couplé dans le MÊME test** : reprise NON éditée ⇒ `equal` (sinon un mutant « refuse toujours » serait vert). `…rederives_ignoring_page_payload` **INVERSÉ** en `…rederives_committing_page_payload` : payloads différents ⇒ `entry_sha256` différents ; record à payload substitué sous `entry_sha256` conservé ⇒ `ok:false`. |
| **Mutants (chacun ROUGE, restauration byte-exacte)** | **M-f-1** vérificateur lit `e.payload_sha256` stocké au lieu de recalculer ⇒ (a) rouge ; **M-f-2** writer hache `page_events` seuls ⇒ (b) rouge ; **M-f-3** vérificateur strippe `payload_sha256` (core 9) ⇒ (c)/`:646` rouge ; **M-b1a-7 et M-b1a-9 sont INVERSÉS** (« core avec payload » est désormais la forme correcte) — dit tel quel, jamais un mutant ressuscité en silence. |
| **Tuyau** | entrée : `ledger-<MINT>.jsonl` (records 10 champs de core + payload) ; sortie : `verifyLedgerChain` `{ok, headSha}` consommé par `resumeFromLedger` (`:506`, chemin réel de `runMain`) et par l'audit §5 (orchestrateur/validateur, CA-9) ; état : disque, `--out` ; test : `bell_crosscheck_resume_refuses_edited_payload` via `runMain` réel. |
| **R-25** | projeté 150-250 lignes `ins+del` (pathspec `ci.yml:65`) ; plafond 1 205. |
| **Docs (orchestrateur, au pli)** | Amendement de FORMAT n°2 dans `docs/PLI-lot-t1a-ii-b3d.md` (§2 byte-intact `7071484f…` recomputé avant/après ; §6 amendé par texte daté) ; G0-b `:122-123, :153` (M-b1a-7/9 inversés), `:239` (f) → « tenue par lot -f » ; PLI-b1a `:343` ; note en tête de `docs/G2-lot-t1a-ii-b3d-b1a.md` NON éditée (supersession déjà notée au G7 b1a) ; ADR-T1aii D1-quater : contexte / décision / rejets B-C-D / conséquences. |

## Hors périmètre (déclaré)
- **Ancrage externe par page** du `headSha` pendant un tirage multi-jours (un éditeur qui re-hache toute la chaîne avant publication de `ledger_sha256` à la fin, `:607`, n'est pas défait par (f)) : **item formé**, porteur course/b2, déclencheur « avant le tirage » — décision d'accepter le risque résiduel (writer unique, disque de l'orchestrateur) ou d'ajouter un journal d'ancrage par page (hash publié dans la sonde) à trancher au G0 de la course.
- Aucun changement de `ledgerSha`, de `resumeFromLedger`, de la queue tronquée (C-B-5), des budgets.

## Séquencement et coordination
- G1 dans un worktree `lot/t-1a-ii-b3d-f` **après la fusion de b1b** (les deux touchent `rebase-crosscheck.ts` ; b1b n'écrit jamais de ledger, donc aucun conflit sémantique — conflit textuel évité par l'ordre). Chaîne : checkpoint-1 → G1 → G2 séparée ‖ checkpoint-2 (régime B) → pli → G7 → Amendement de format n°2 committé avec le pli docs.
- Aucun appel réseau ; fixtures 100 % synthétiques (anti-close : aucune constante on-chain réelle) ; aucune surface publique touchée.

## Risques (MAST)
Spécification ambiguë (forme hachée) — levée par « forme écrite, ordre d'ingestion » ; mutant ressuscité — déclaré ; format partagé épinglé ailleurs — vérification par grep imposée au G1 (fait 6) ; test « refuse toujours » — contrôle couplé (c).
