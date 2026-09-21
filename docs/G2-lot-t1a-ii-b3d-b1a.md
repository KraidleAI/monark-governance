# G2 (relecteur, instance séparée, contexte frais) — sous-lot Bell -b3d-b1a

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` vérifié, effort max, Opus 5 banni non utilisé).
**Provenance** : réviseur G2 fraîche, 2026-09-21 ; worktree `F:\Monark-wt-b3db1a` (branche `lot/t-1a-ii-b3d-b1a`), base `6d26117`, HEAD `f4ae59f` (G1 `93446f8` + option (d) `f4ae59f`). **R-20** : aucun commit, aucun workflow. **Aucune écriture dépôt** (mutants sur archive scratch `git archive HEAD`, restauration byte-exacte sha256 ; probes en `--out` temporaires). **AUCUN réseau** (stubs seuls ; course SUSPENDUE). Scratch `F:\tmp\g2-b3db1a\`.
**Intégrité post-campagne** : worktree `git status` propre ; les 4 fichiers == `git show HEAD:` (sha256 OK).

## VERDICT : PASS-AVEC-CORRECTIONS
Les 3 défauts racine (V-1/V-2/V-3) sont **corrigés et prouvés** (base-ROUGE→HEAD-VERT rejoué ; 10 mutants tués) ; suite complète **565/565**, CI verte, R-25 **760**. **MAIS** trois **tuyaux ANNONCÉS** manquent leur tueur d'intégration (PROBE1/PROBE2/healing) — la règle branchement + CA-11 durci exigent leur fermeture avant qu'un G7 ne clôture le lot. Aucun défaut de correction (le code est correct) ; ce sont des trous de couverture sur pièces annoncées + 4 items formés (dont le tamper `page_events`, verdict-flipping).

---

## 1. Revue 3 étapes (AgileCoder)
- **(a) Conformité au plan** : chaque C-B-1..7 / C-V-3 / C-V-9 / semis / retry / set_authority_scan mappé fichier:ligne (table §3), ouvert ce tour. L'amendement L-b1a-1 (option d) est fidèlement implémenté (§4).
- **(b) Correction/comportement** : régression du validateur RE-EXÉCUTÉE (base-ROUGE / HEAD-VERT, §2) ; option (d) tracée (§4) ; chemin page-fautée-committée : **inexistant** (trace + M-b1a-1).
- **(c) Adéquation des tests (adversarial)** : chasse aux voisins survivants → **3 tuyaux non tués** (§5) + 4 items (§6).

## 2. Régression V-1/V-2/V-3 (CA-9, RE-EXÉCUTÉE contre le harnais DU VALIDATEUR)
Harnais `F:\tmp\cp1-b3d-b\{h1.ts,replay.test.ts}` copié en scratch, ROOT d'import réécrit (base-archive vs worktree), dir de sortie redirigé (réf non touchée) :
- **BASE `6d26117`** (`git archive` ; `rebase-crosscheck.ts` sha `72cfedfc…`, `collect.ts` `41cba3ff…` — == pristine annoncé) : `ℹ tests 3 / pass 0 / fail 3` — **V-1/V-2/V-3 ROUGE**.
- **HEAD** (worktree) : `ℹ tests 3 / pass 3 / fail 0` — **VERT**. V-1 met **6,46 s** = le retry réel s'engage sur le 503 puis conclut body_quorum (fail-closed sous retry, cohérent rendu §3).
Reproductible : `node --test F:\tmp\g2-b3db1a\{base,head}-replay.test.ts`.

## 3. Table correction → fichier:ligne → test (VÉRIFIÉE) — tous partent d'artefacts RÉELS via runMain (CA-11 durci)
| Correction | fichier:ligne (HEAD) | Test (runMain/CLI ⇒ lit l'artefact écrit) | Statut |
|---|---|---|---|
| C-B-1 page fautée non committée + STOP (racine V-1) | `rebase-crosscheck.ts:287` | `…resume_after_decode_fault_is_not_equal` (2×runMain) ; `…terminal_inconclusive_never_promotes` | OK |
| C-B-1 option (d) `not_full_pages` sur `data.length` BRUT + `GTFA_PAGE_LIMIT` + garde de mode | `rebase-crosscheck.ts:64,296` ; `collect.ts:566,573` | `…full_boundary_page_deduped_does_not_false_stop` ; `…short_nonfinal_page_is_not_committed` ; `…require_full_pages_mode_guard` | OK (+ item C, §6) |
| C-B-2 écriture monotone (V-2) | `rebase-crosscheck.ts:615-616` | `…artifact_write_is_monotone` | OK |
| C-B-3 compteur DANS la couche budgétée (V-3) | `collect.ts:305,309` | `…calls_by_method_equals_calls_used` (normal + budget_exhausted) | OK |
| C-B-4 budget durable en `finally` + `retries_by_method` | `rebase-crosscheck.ts:618-619,569` | `…budget_persists_on_error_path` ; `…per_page_budget_survives_crash` | OK **valeur retries non testée** (C-G2-2) |
| C-B-5 queue tronquée (α) + verifyLedgerChain à la reprise | `rebase-crosscheck.ts:482-496` (readJsonl) ; **`:506` (verify au resume)** | `…torn_queue_dropped_and_chain_verified` | **readJsonl OK ; verify@resume NON TUÉ** (C-G2-1) |
| C-V-3 verifyLedgerChain re-dérive (core §6 seul) | `rebase-crosscheck.ts:173` | `…ledger_chain_rederives_from_disk` (in-memory) ; `…ignoring_page_payload` | Fonction OK ; **câblage resume non tué** (C-G2-1) |
| C-B-6 candidates/<MINT>/ par mint | `rebase-crosscheck.ts:516,599` | `…candidate_shas_per_mint` | OK (+ item B, §6) |
| C-B-7 format atomique (entry_sha256 sur core seul) | `rebase-crosscheck.ts:151,162,596` | `…ignoring_page_payload` ; `…runmain_resumes_budget_and_ledger` | OK (+ item A tamper, §6) |
| semis (fait 1) | `rebase-crosscheck.ts:248-249` | `…resume_after_exhaustion_is_equal` | OK |
| retry injecté (fait 9) | `quorum.ts:116` ; `rebase-crosscheck.ts:588` (wiring CLI) | `…retry_on_429…` (scanFullMint direct) ; `…withRetry_budget_and_nontransient_rethrow` | **wiring CLI non tué** (C-G2-2) |
| set_authority_scan (fait 8) | `rebase-crosscheck.ts:611` | — | **AUCUNE assertion** (item D) |
| C-V-9 replay via runMain | `test:293` | `…committed_artifacts_replay` (lit crosscheck-*.json réels) | OK |

## 4. Option (d) — les 4 questions de la mission
- **Garde de mode « les deux sens »** : sens strict-sur-lâche ⇒ throw (`collect.ts:566`, testé, M tué). Sens lâche-sur-strict ⇒ **sûr par conception** (un ledger strict n'a pas de page courte). Le throw strict-sur-lâche est **AVANT** la boucle mint et **avant** la définition de `writeBudget` ⇒ **ne réécrit PAS `budget.json`** (PROBE6 : byte-identique après le throw ⇒ un ledger lâche ne peut être « re-béni » `require_full_pages:true` pour un run-3). **Trou** : champ ABSENT ⇒ `undefined === false` faux ⇒ reprise stricte PROCÈDE sans throw (PROBE4, §6 item C).
- **Page courte + token TRANSITOIRE guérit à la reprise ?** : **OUI, PROUVÉ** (PROBE5 : run1 `not_full_pages` STOP → run2 même plage RAW-pleine ⇒ committée + `scan_complete:true`, verdict `equal`). Code correct ; **test manquant** (C-G2-3).
- **Chemin où une page fautée est committée ?** : **NON**. Trace boucle `scanFullMint` : les 4 fautes re-tirables `return` avant `events.push`/`chainedLedgerEntry` (`:287`), la page courte non-finale `return` avant commit (`:296`), budget catch `return` (`:307`) ; le commit (`:297-300`) n'est atteint que sans faute. M-b1a-1 (garde `:287` retirée) ⇒ ROUGE.

## 5. Campagne mutants (RE-EXÉCUTÉE ; archive scratch, restauration byte-exacte sha256, jamais git checkout)
**10 mutants TUÉS** (dont les 7 nommés par la mission), chacun `pass 0 / fail 1`, restore-OK :
| Mutant | Édition | Tueur | Verdict |
|---|---|---|---|
| M-b1a-1 | garde page-fautée `:287` neutralisée | resume_after_decode_fault_is_not_equal | KILLED |
| M-b1a-1b | garde short-non-final `:296` neutralisée | short_nonfinal_page_is_not_committed | KILLED |
| M-b1a-1c | `data.length`→`pageTxs.length` post-dédup `:296` | full_boundary_page_deduped_does_not_false_stop | KILLED |
| garde de mode | garde `:566` neutralisée | require_full_pages_mode_guard | KILLED |
| M-b1a-14 | écriture inconditionnelle `:616` | artifact_write_is_monotone | KILLED |
| M-b1a-9 | verifyLedgerChain hache `page_events` `:176` | ledger_chain_rederives_ignoring_page_payload | KILLED |
| M-b1a-4a | `writeBudget` du `finally` `:619` retiré | budget_persists_on_error_path | KILLED |
| M-b1a-8a | semis `:249` retiré | resume_after_exhaustion_is_equal | KILLED |
| M-b1a-8c | `withRetry` avale BudgetExceeded (`quorum.ts:122`) | withRetry_budget_and_nontransient_rethrow | KILLED |
| M-b1a-3 | compteur AVANT la garde (`collect.ts:300-309`) | calls_by_method_equals_calls_used | KILLED |
| (voisin) core réordonné dans verify `:176` | ledger_chain_rederives_from_disk | KILLED (ordre de champ épinglé) |

**VOISINS SURVIVANTS (3 tuyaux non tués — le verdict vit ici)** — chaque mutant laisse les 44 tests du fichier VERTS :
- **PROBE1 — `verifyLedgerChain` au resume (`rebase-crosscheck.ts:506`) DÉSACTIVABLE sans casser un test.** `torn_queue` ne tue que readJsonl (tail tronqué / ligne NON-JSON) ; aucun test ne pose sur disque un ledger **parsable mais à chaîne rompue** puis reprend dessus. PROUVÉ dans les deux sens : (a) mutant `if(false && …)` ⇒ 44/44 VERT ; (b) PROBE1 montre qu'AVEC le code, une reprise sur un core altéré à `entry_sha256` périmé **jette** `/chain does not re-derive/`. Le garde-ceinture C-B-5 / C-V-3-au-resume (tamper-evidence de l'audit §5, CA-9) est **non prouvé**.
- **PROBE2a/2b — le tuyau retry→`retries_by_method`→budget.json (wiring CLI `collect.ts:588`) non tué.** `budget_persists_on_error_path` n'asserte que `typeof …=== "number"` (valeur 0, HTTP 418, zéro retry) ; `retry_on_429` appelle `scanFullMint` en direct avec un `onRetry` LOCAL, jamais `runMain`. Mutants (a) `onRetry` no-op et (b) `retry = fn=>fn()` ⇒ 44/44 VERT. Le « propriétaire nommé » de L-b1a-4 est non prouvé à la composition.

## 6. Items formés (déclencheur + propriétaire)
- **ITEM-G2-A (aggrave rendu §7(7))** — `page_events` non haché est un **VERDICT-FLIPPING false equal**, pas un simple pin périmé. PROUVÉ hors ligne (ITEM5) : injecter un event de la série dans le `page_events` d'un enregistrement atomique sur disque fait passer un `divergence` vrai à **`equal`**, et `verifyLedgerChain` reste **ok** (entry_sha256 = core §6 seul). **Modèle de menace CORRIGÉ (l'équivalence « éditer ledger ≈ éditer crosscheck » est FAUSSE pour le chemin qui compte)** : sur le tirage résumable multi-jours (sonde→phase B→tirage, MÊME `--out`, ~45 h), le SEUL état durable inter-invocations est `ledger-*.jsonl`, et le verdict repris re-dérive `priorEvents` DEPUIS son payload. Une édition de `crosscheck-*.json` est écrasée dès la reprise suivante ; une édition de `page_events` est **CONSOMMÉE** par la reprise puis **SCELLÉE par C-B-2** (écriture monotone V-2 : une fois le faux `equal` écrit, aucune relance ne le dégrade). C-G2D-2 lie `budget.json` au **nombre** de pages du ledger, pas à leur payload. Autrement dit : **le payload est le seul intrant durable du verdict repris qui n'est ni haché, ni borné, ni re-tiré — et l'écriture monotone le scelle.** **Item, pas correction** (format atomique = spéc adjugée C-B-7). Propriétaire orchestrateur ; déclencheur b2/ADR-format ; options : signer le payload dans un champ chaîné hors-core, OU re-décoder `page_events` depuis `candidates/<MINT>/` au resume.
- **ITEM-G2-B (nouveau, mineur)** — `onCandidate` (`:277`) tire AVANT la décision de faute (`:278/282/287`) ⇒ une page DÉFAUSSÉE laisse son raw candidat sur disque (PROBE3 : après un stop body_quorum, `candidates/SPYx/updA.json` existe et le `candidate_shas` de l'artefact inconclusive contient `updA`, absent de son ledger 1-entrée). Contredit « page fautée jetée en entier » ; **aucun impact false-equal** (equal exige un scan complet). Propriétaire worker ; déclencheur prochaine passe Bell ; fix : conditionner onCandidate au commit, ou purger candidates/ des sigs de page défaussée.
- **ITEM-G2-C (nouveau, mineur/défensif)** — garde de mode (`collect.ts:566`) ne capte que `false` EXPLICITE ; budget.json SANS `require_full_pages` ⇒ `undefined` ⇒ reprise stricte PROCÈDE (PROBE4). Défensif seul (tout budget.json écrit par ce code porte le champ ; la course n'a jamais tourné). Caveat le « fail-closed » ou resserrer `=== false`→`!== true`. Propriétaire worker ; déclencheur prochaine passe.
- **ITEM-G2-D (nouveau, mineur)** — `set_authority_scan` écrit (`:611`) mais SANS assertion offline. Déclaré upcoming (consommateur L-5 en b2) ; une assertion de forme d'1 ligne le fermerait. Propriétaire worker b2 ; déclencheur b2.
- **Note nommage** : `…ledger_chain_rederives_from_disk` construit ses entrées EN MÉMOIRE (chainedLedgerEntry), ne lit jamais le disque — le nom surestime ; le vrai chemin disque/resume est le trou C-G2-1.

## 7. Corrections C-G2 (avec fichier:ligne + error_origin)
- **C-G2-1 (bloquante — adéquation/branchement)** : ajouter un test runMain de reprise sur un `ledger-<MINT>.jsonl` **parsable mais à chaîne rompue** (core altéré sous `entry_sha256` périmé, budget.json cohérent) assertant `throw /chain does not re-derive/`. Cible : `apps/bell/src/rebase-crosscheck.ts:506`. `error_origin` : **worker G1 (test)** + **validateur checkpoint-1** (le mutant C-B-5 prescrit visait readJsonl, pas la ceinture verifyLedgerChain-au-resume).
- **C-G2-2 (bloquante — adéquation/branchement)** : ajouter un test runMain avec **un** 429 transitoire sur op-B assertant `budget.json.retries_by_method.getTransaction === 1` (tuyau retry→budget via le wiring CLI). Cible : `apps/bell/src/collect.ts:588`. `error_origin` : **worker G1 (test)**.
- **C-G2-3 (non bloquante — adéquation)** : ajouter le test de GUÉRISON transitoire option (d) (run1 `not_full_pages` → run2 page RAW-pleine ⇒ committée + complète ; démontré vert PROBE5). Cible : `apps/bell/src/rebase-crosscheck.ts:296`. `error_origin` : **worker G1 (test)**.

## 8. Anti-close / secrets / export / R-25 / suites
- **gate:vocab** VERT (186 fichiers, aucune claim interdite). **Aucun secret/close** ajouté au diff code (scan api-key/URL/hash/32-hex ⇒ vide ; fixtures 100 % synthétiques b58 de 0xaa/0xbb).
- **Surface publique** : `apps/bell` **hors whitelist d'export** (`WHITELIST_DIRS = schemas,fixtures,enforcement,apps/site,skills`) ⇒ les noms de fournisseur de recoupement (Helius/Chainstack, en commentaires apps/bell) **ne touchent aucune surface publique** ; aucun dans README/skills.
- **Nouveaux fichiers** : **AUCUN** (4× M code/test + 1× M docs) ⇒ pas de déclaration vocab-banned.json / exclusion d'export dues.
- **R-25** : pathspec `STAT=` exact de `.github/workflows/ci.yml`, base `6d26117` ⇒ `4 files changed, 639 insertions(+), 121 deletions(-)` ⇒ **ins+del = 760 ≤ 1205**. (Le diff a 5 fichiers ; le 5ᵉ `docs/G0` +3 = amendement L-b1a-1, exclu par `docs/**/*.md` — non un écart.)
- **Suite complète** : `npm run test` ⇒ `ℹ tests 565 / pass 565 / fail 0`. `npm run ci` (gate:vocab && typecheck && test) ⇒ **CI_EXIT=0**. Suite Bell seule ⇒ **138/138**. Fichier crosscheck seul ⇒ **44/44**.

## 9. error_origin — synthèse
- V-1/V-2/V-3 (défauts SOURCE, code BASE) : déjà assignés au checkpoint-1 (`CHANTIERS.md:382-384`), **corrigés + régression + mutants** dans ce lot — confirmé par rejeu base-ROUGE.
- Défaut du plan `notFullPages` : résolu option (d) — vérifié (mutants 1b/1c/mode tués, healing prouvé).
- **C-G2-1/2/3** (nouveaux, trous de couverture de tuyaux annoncés) : `error_origin` = **worker G1 (tests)** [+ checkpoint-1 pour C-G2-1].
- Items A–D : A adjugé (format C-B-7, orchestrateur/b2) ; B/C/D worker, prochaine passe / b2.

**R-21** : chaque fichier:ligne ouvert ce tour ; chaque mutant/probe reproductible (`F:\tmp\g2-b3db1a\{run-mutant.sh,mut.mjs,probe-suite.test.ts,base-replay.test.ts,head-replay.test.ts}`) ; base-ROUGE/HEAD-VERT rejouables. **R-20** : le relecteur ne committe pas ; l'orchestrateur vérifie adversarialement et rend le G7.
