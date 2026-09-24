# PLI — sous-lot Bell -b3d-b1a (reprise / ledger / budget)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` vérifié, effort max ; Opus 5 banni, non utilisé).
**Provenance** : worker PLI G2, 2026-09-21 ; worktree `F:\Monark-wt-b3db1a` (branche `lot/t-1a-ii-b3d-b1a`), base `6d26117`, HEAD `eeeeaef`. **R-20** : aucun commit, aucun workflow (l'orchestrateur seul). **AUCUN réseau** (stubs seuls). **Aucune écriture dépôt hors livrable** : mutants appliqués sur le fichier worktree puis **restaurés byte-exact par sha256 depuis un instantané pristine** (jamais `git checkout`). Scratch `F:\tmp\g2pli-b3db1a\`.

---

## Section PLI G2 — fermeture des corrections du G2 `docs/G2-lot-t1a-ii-b3d-b1a.md`

Le G2 (relecteur, instance séparée) a rendu **PASS-AVEC-CORRECTIONS** : les 3 défauts racine V-1/V-2/V-3 étaient corrigés + prouvés, MAIS **trois tuyaux ANNONCÉS** manquaient leur tueur d'intégration (verifyLedgerChain-au-resume, retries_by_method via le câblage CLI réel, la guérison d'une page courte transitoire), plus **un item défensif** (garde de mode ne captant que `false` explicite). Cette passe les ferme, **tous via le CLI réel (`runMain`)** depuis des artefacts que le CODE écrit (CA-11 durci), jamais une regex sur la source.

### Table : correction → fichier:ligne (HEAD) → test → mutant (VÉRIFIÉE)

| Correction | fichier:ligne | Test (nouveau) | Mutant tueur | Verdict |
|---|---|---|---|---|
| **C-G2-1** (bloquante) verifyLedgerChain re-dérive à CHAQUE reprise ; un ledger **parsable mais à chaîne rompue** est refusé | `apps/bell/src/rebase-crosscheck.ts:506` | `bell_crosscheck_resume_onto_broken_chain_is_refused` (runMain 2×, tamper `tx_count` sous `entry_sha256` périmé, throw `/chain does not re-derive/`) | **M-G2-1** : `if (!verifyLedgerChain(records).ok)` → `if (false && …)` (verify@resume désactivé) | KILLED (base-ROUGE→HEAD-VERT) |
| **C-G2-2** (bloquante) tuyau retry → `retries_by_method` → `budget.json` via le câblage CLI réel | `apps/bell/src/rebase-crosscheck.ts:588` (câblé par `collect.ts:610`/`runMain`) | `bell_crosscheck_retries_by_method_wired_through_runmain` (runMain, un 429 transitoire sur op-B ⇒ `retries_by_method.getTransaction===1`, `getTransactionsForAddress===0` par méthode) | **M-G2-2a** : `onRetry` no-op ; **M-G2-2b** : `retry = (fn) => fn()` | KILLED (les deux) |
| **C-G2-3** (non bloquante — adéquation) page courte + token TRANSITOIRE **guérit** à la reprise ⇒ `equal` | `apps/bell/src/rebase-crosscheck.ts:296` | `bell_crosscheck_short_page_transient_token_heals_on_resume` (run1 `not_full_pages` STOP → run2 même plage RAW-pleine ⇒ committée + complète + `equal`) | **M-b1a-1c** : `data.length` → `pageTxs.length` (post-dédup) — **corroboration mesurée** (déjà tué par `full_boundary`/`short_nonfinal` ; la page P2 guérie dédupe 1000→997) | KILLED (corroboration) |
| **ITEM-C** (défensif, ≤ 2 lignes) garde de mode fail-closed sur `require_full_pages` **ABSENT**, pas seulement `false` explicite | `apps/bell/src/rebase-crosscheck.ts:566` | `bell_crosscheck_require_full_pages_absent_strict_resume_refused` (run1 loose → strip du champ → run2 strict ⇒ throw `/built loosely/`) | **M-G2-C** : `prior.requireFullPages !== true` → `=== false` (retour base) | KILLED ; `require_full_pages_mode_guard` reste **VERT** sous le mutant (tueur spécifique) |

Périmètre respecté : **NON TOUCHÉS** — `page_events` (ITEM-A — **re-déclenché AVANT LA COURSE, « déclencheur b2 » RETIRÉ**, cf. §Pli checkpoint-2 -b3d-b1a C-V-3 ci-dessous), `onCandidate` (ITEM-B), `set_authority_scan` (ITEM-D). Seuls changements : +4 tests (`rebase-crosscheck.test.ts`) et la garde de mode `:566` (2 lignes, `rebase-crosscheck.ts`).

### ITEM-C — écart assumé vs la prescription littérale (déclaré, non deviné)

La mission prescrit `=== false` → `!== true`. Livré : `!== true` **plus une garde de présence de reprise** `existsSync(resolve(out, "budget.json"))`, parce que `readPriorBudget` renvoie `undefined` à la fois pour « pas de budget.json » (**run frais**) ET « budget.json sans le champ » (**reprise legacy/tamper**) — un `!== true` nu **jetterait sur CHAQUE premier run strict**. Table des 4 cas (garde `&& requireFullPages`) :

| `prior.requireFullPages` | contexte | base `=== false` | `!== true` nu | **livré** `existsSync(budget.json) && !== true` |
|---|---|---|---|---|
| `true` | ledger strict, reprise | pas de throw ✓ | pas de throw ✓ | pas de throw ✓ (strict→strict) |
| `false` | ledger lâche, reprise | **THROW** ✓ | THROW ✓ | THROW ✓ (strict-sur-lâche refusé) |
| `undefined` + **pas** de budget.json | **run frais strict** | pas de throw ✓ | **THROW ✗ (casse tout run frais)** | pas de throw ✓ (`existsSync`=false) |
| `undefined` + budget.json présent | reprise legacy/tamper (**PROBE4**) | **pas de throw ✗ (le trou)** | THROW ✓ | THROW ✓ (`existsSync`=true) |

La base rate la 4ᵉ ligne (le trou PROBE4) ; le `!== true` nu casse la 3ᵉ (runs frais) ; **la forme livrée est correcte sur les 4**. Sûreté confirmée par deux greps (mesurés 2026-09-21) : (a) `budget.json` n'est **écrit** que par le CLI crosscheck (`rebase-crosscheck.ts:572`, qui porte toujours `require_full_pages`) — aucune autre branche (rebase-scan/produce/discover) n'en écrit ; (b) aucun autre fichier de test ne lance `runMain --rebase-crosscheck`. Un `budget.json` sans le champ est donc **uniquement** un artefact legacy/tamper — exactement le cas défensif. Le message conserve « built loosely » ⇒ le test `require_full_pages_mode_guard` existant reste vert.

### Campagne mutants (RE-EXÉCUTÉE ; instantané pristine, restauration byte-exacte sha256, jamais `git checkout`)

Instantané pristine (fichier **corrigé** = cible de restauration) : `apps/bell/src/rebase-crosscheck.ts` sha256 `482b93774bb475240e570a7bd51b734f5e8e1979f9702ccdfb3001844411beb2`.

| Mutant | Édition (cible) | sha après mutation (préfixe) | Test tué | Restauration |
|---|---|---|---|---|
| M-G2-1 | `:506` verify@resume neutralisé (`false && …`) | `a664f5cc7345c658` | C-G2-1 ⇒ ROUGE (`pass 0/fail 1`) | sha256 == pristine ✓ |
| M-G2-2a | `:588` `onRetry` no-op | `cb554640da1045f7` | C-G2-2 ⇒ ROUGE | sha256 == pristine ✓ |
| M-G2-2b | `:588` `retry = (fn) => fn()` | `50c88a83cc6458a2` | C-G2-2 ⇒ ROUGE | sha256 == pristine ✓ |
| M-G2-C | `:566` `!== true` → `=== false` | `212e29e7bee30be1` | ITEM-C ⇒ ROUGE ; `mode_guard` reste VERT | sha256 == pristine ✓ |
| M-b1a-1c | `:296` `data.length` → `pageTxs.length` | `04cea1de26f8cdc2` | C-G2-3 ⇒ ROUGE (corroboration) | sha256 == pristine ✓ |

Le harnais de mutation (`F:\tmp\g2pli-b3db1a\campaign.mjs`) **assert une occurrence unique** de la cible avant d'écrire (M-b1a-1c a d'abord abordé à 2× — la sous-chaîne `data.length < GTFA_PAGE_LIMIT` apparaît aussi dans le commentaire `:290` — puis fermé sur `!finalPage && data.length < …`, code-unique).

### Décomptes + R-25

- **base-ROUGE / HEAD-VERT rejoué** : ITEM-C ROUGE sur la garde non corrigée (PROBE4 reproduit : `pass 3/fail 1` sur les 4 nouveaux), VERT après la correction (`pass 5/5` avec `mode_guard`).
- **Fichier crosscheck seul** : `tests 48 / pass 48 / fail 0` (44 + 4 nouveaux).
- **Suite complète** `npm run test` : `tests 569 / pass 569 / fail 0`.
- **`npm run ci`** (`gate:vocab && typecheck && test`) : **CI_EXIT=0** — gate:vocab OK (186 fichiers, aucune claim interdite), `tsc --noEmit` OK, test 569/569.
- **R-25** : pathspec `STAT=` exact de `.github/workflows/ci.yml:65`, base `6d26117`, forme working-tree (aucun commit) ⇒ `4 files changed, 737 insertions(+), 121 deletions(-)` ⇒ **ins+del = 858 ≤ 1205** (contribution de cette passe : +100/-2 sur les 2 fichiers). Le G2/PLI docs sont exclus par `docs/**/*.md`.

**Livrables** (sha256 finaux) :
- `apps/bell/src/rebase-crosscheck.ts` : `482b93774bb475240e570a7bd51b734f5e8e1979f9702ccdfb3001844411beb2`
- `apps/bell/test/rebase-crosscheck.test.ts` : `4248d3cf28b70502b631eedbaa48ca29de519b2264f43435a08f7a2fa09724f2`

**R-21** : chaque test part d'artefacts RÉELS via `runMain` ; chaque mutant reproductible (`F:\tmp\g2pli-b3db1a\{campaign.mjs,mut1c.mjs,pristine-rcc.ts}`) avec restauration sha256 vérifiée. **R-20** : le worker ne committe pas ; l'orchestrateur vérifie adversarialement et rend le G7.

---
## Pli checkpoint-2 — sous-lot Bell -b3d-b1a (DOCS SEULS) — fold C-V-3 / C-V-4 (worker rédacteur `claude-opus-4-8[1m]` effort max, 2026-09-21T06:34:53Z ; heure lue `date -u`)

**DOCS SEULS** : aucun fichier code/test touché (le code b1a est jugé au G2 + pli `f2f8808`). **R-20** : le worker ne committe pas ; l'orchestrateur vérifie adversarialement (R-21) et rend le G7. Aucun appel réseau. Base worktree `F:\Monark-wt-b3db1a`, HEAD `f2f8808`. **Avis du validateur** : fichier de sortie **0 octet** (non persisté par l'outillage) ⇒ ce pli est plié depuis le **brief de l'orchestrateur** ; la **R-1 du validateur** (préfixe `claude-fable-5-1`) **n'est pas vérifiable par ce worker** (item formé au §C-V-4).

### C-V-3 — ITEM-A (=ITEM-G2-A) re-déclenché AVANT LA COURSE ; « déclencheur b2 » RETIRÉ

**ITEM-A** — le PAYLOAD atomique `page_events`/`page_handoffs` **non haché** est un **verdict-flipping false-equal** [lu `docs/G2-lot-t1a-ii-b3d-b1a.md` l.66, ITEM-G2-A] — était étiqueté **« déclencheur b2 »** (l.21). Ce checkpoint-2 le **re-déclenche AVANT LA COURSE** ; **« déclencheur b2 » est RETIRÉ** (l.21 mise à jour). **Porteur : b1b OU b1a-bis, avec G0 + checkpoint-1 propres.** `error_origin` = **worker G1** (format atomique livré sans commettre le payload) + **relecteur G2** (item relevé mais laissé « b2 ») + **validateur** (checkpoint-2 : porté avant la course, non déféré).

**Condition de GO (f)** — ajoutée à la §course de `docs/G0-lot-t1a-ii-b3d-b.md` (après (e)), **verbatim** : « **(f) verdict à la reprise NON FALSIFIABLE par édition de `page_events`/`page_handoffs`** : un test `runMain` refusant une reprise sur payload édité est **VERT**. » Sans (f) verte, la course NE REPREND PAS.

**Contrainte de conception (à TRANCHER au G0 du porteur, PAS ici).** Le remède doit faire **commettre TRANSITIVEMENT le payload par le `headSha`** (`verifyLedgerChain().headSha`), car **un remède qui reste sur disque est défait par la même édition** — cela **EXCLUT** tout remède purement sur-disque (p. ex. re-décoder `page_events` depuis `candidates/<MINT>/` au resume **sans** engagement chaîné : les candidats sur disque sont éditables par la même main). **TENSION à trancher** : §6 + L-b1a-6 imposent `entry_sha256` **sur le SEUL core §6** (chaîne re-dérivable) [lu G0-b l.121] ⇒ le payload ne peut PAS entrer dans le core ; l'engagement du payload doit être un **second engagement CHAÎNÉ hors-core** commis par `headSha` [option [lu] G2-b1a l.66], OU une autre construction — **le G0 du porteur (b1b/b1a-bis) tranche** ; ce worker checkpoint-2 ne choisit PAS le mécanisme.

**Menace (rappel [lu G2-b1a l.66]).** Sur le tirage résumable multi-jours (sonde→phase B→tirage, MÊME `--out`, ~45 h), le **SEUL** état durable inter-invocations est `ledger-*.jsonl` ; le verdict repris re-dérive `priorEvents` DEPUIS son payload ; une édition de `page_events` est **CONSOMMÉE** à la reprise puis **SCELLÉE par C-B-2** (écriture monotone V-2). Le payload est le seul intrant durable du verdict repris **ni haché, ni borné, ni re-tiré**.

### C-V-4 — Journal de provenance PAR ÉTAPE (un modèle résolu par étape ; heures UTC RÉELLES)

Chaîne mesurée `git log` du sous-lot b1a ; **heures UTC RÉELLES** recomputées de première main via `TZ=UTC git log -1 --date=format-local:'%Y-%m-%dT%H:%M:%SZ' <sha>` — **PAS `%aI` nu**, qui affiche le fuseau **+01:00** (même piège documenté au §JOURNAL de `docs/PLI-lot-t1a-ii-b3d.md` l.252). **R-20** : chaque commit est de l'ORCHESTRATEUR ; le modèle listé = **producteur** de l'artefact (le message de commit porte `(worker claude-opus-4-8)`).

| Étape | Modèle résolu (producteur) | Commit (orchestrateur) | Heure UTC RÉELLE |
|---|---|---|---|
| **G1** (page fautée non committée V-1, écriture monotone V-2, `calls_by_method` couche budgétée V-3, budget en `finally` + retries, queue tronquée, `verifyLedgerChain` core-seul, `candidates/` par mint, enregistrement atomique ; 12/12 mutants) | worker Opus `claude-opus-4-8[1m]` | `93446f8` | 2026-09-21T04:45:39Z |
| **option (d)** (page courte non-finale = faute re-tirable sur `data.length` BRUT, `GTFA_PAGE_LIMIT` nommé, `require_full_pages` persisté + garde de mode fail-closed ; 3 tests + 3 mutants ; amendement de plan L-b1a-1) | worker Opus `claude-opus-4-8[1m]` (amendement de plan L-b1a-1 : **orchestrateur**) | `f4ae59f` | 2026-09-21T05:10:35Z |
| **G2 fraîche** (relecteur **SÉPARÉ**, contexte frais ; PASS-AVEC-CORRECTIONS : V-1/V-2/V-3 rouge-base→vert-HEAD, 10 mutants ; 2 trous de couverture relevés) | relecteur Opus `claude-opus-4-8[1m]` | `eeeeaef` | 2026-09-21T05:38:18Z |
| **pli G2** (broken-chain resume refusé, `retries_by_method` câblé via `runMain`, page courte transitoire guérit, garde de mode durcie `!== true` + `existsSync` ; 48/48, suite 569/569) | worker Opus `claude-opus-4-8[1m]` | `f2f8808` | 2026-09-21T06:02:52Z |
| **checkpoint-2 (acceptation)** | validateur-humain Fable `claude-fable-5-1` (R-1 **déclarée** par le validateur à la ré-acceptation, persistée) | `docs/CHECKPOINT2-lot-t1a-ii-b3d-b1a.md` (verbatim récupéré du transcript par l'orchestrateur au G7 ; `.output` vide) | 2026-09-21 ~06:10 UTC (avis) ; ré-acceptation ACCEPTE sur `a01cb4e` ~08:20 UTC |
| **CE pli checkpoint-2** (DOCS SEULS : fold C-V-1 / C-V-3 / C-V-4 / C-V-5) | worker rédacteur Opus `claude-opus-4-8[1m]` | **NON committé** (R-20 ; l'orchestrateur committera le pli docs) | 2026-09-21T06:34:53Z (`date -u`) |

**Caveat de résolution (R-1).** Les modèles ci-dessus sont ceux **déclarés/attendus** par le roster (CLAUDE.md mainteneur + amendements Fable 5.1) ; la résolution EFFECTIVE d'un commit passé n'est **pas re-vérifiable** par ce worker. L'orchestrateur déclare sa propre résolution au G7.

**Item formé — re-persistance de l'avis du validateur — FERMÉ au G7 (2026-09-21) : avis + ré-acceptation persistés dans `docs/CHECKPOINT2-lot-t1a-ii-b3d-b1a.md`, R-1 `claude-fable-5-1` déclarée par le validateur.** (Texte d'origine :) L'avis intégral du validateur checkpoint-2 **n'a pas été persisté** (fichier de sortie 0 octet) — **précédent d'outillage connu** : commit `514ee1a` « validator verbatim not persisted by the tooling ». **Propriétaire : orchestrateur** ; **déclencheur : ce checkpoint-2 / G7** — reconstituer/persister l'avis (verbatim ou reconstruit tracé) **et vérifier la R-1 du validateur** (préfixe `claude-fable-5-1`) avant consommation comme preuve. Jamais un dû nu.
