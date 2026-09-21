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

Périmètre respecté : **NON TOUCHÉS** — `page_events` (ITEM-A = b2), `onCandidate` (ITEM-B), `set_authority_scan` (ITEM-D). Seuls changements : +4 tests (`rebase-crosscheck.test.ts`) et la garde de mode `:566` (2 lignes, `rebase-crosscheck.ts`).

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
