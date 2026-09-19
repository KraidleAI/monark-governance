# PLI post-G2 — lot U-1a-hard-2 (pliage des corrections C-1 + O-1)

Worker Opus 4.8, instance séparée, contexte frais. **Modèle résolu tel quel (R-1)** : `claude-opus-4-8[1m]`
(préfixe `claude-opus-4-8` ; effort max). Je ne suis pas l'orchestrateur : aucun commit, aucun `git` d'écriture,
aucun workflow (R-20). Écritures de vérification sous `F:\tmp\u1ahard2-fold\` uniquement (TEMP/TMP=F:/tmp).
Date 2026-09-19. Worktree `F:\Monark-wt-u1ahard2`, branche `lot/u-1a-hard-2`, HEAD `e66324b` (inchangé — je ne
committe pas ; le pli vit dans l'arbre de travail).

## Portée
Liste fermée de la revue G2 (`docs/G2-lot-u1a-hard-2.md`, APPROUVÉ-AVEC-CORRECTIONS) : **C-1** (durcissement du
test de granularité de clé `dedupLogs`) et **O-1** (test comportemental du câblage du plafond de backoff aux
call-sites). Un SEUL fichier touché : `apps/sentinel/test/ukemi-record.test.ts` (+ ce rapport). Aucun code source
modifié — les deux sources restent octet-pour-octet à leur PIN.

## Non-régression des sources (aucun code changé)
| fichier | sha256 (== PIN G2) |
|---|---|
| apps/sentinel/src/ukemi/rpc2.ts | `720d399eccb2d9843646c591287a4ee647cefac84f83871b1e6fb9857637c570` |
| apps/sentinel/src/ukemi/record.ts | `71c542e7abbb2f2a8cc977b1534a0479ec89cb9cdc08673ffe3cc43771b53db9` |

`git status --porcelain` : `M apps/sentinel/test/ukemi-record.test.ts` (+ `?? docs/PLI-G2-lot-u1a-hard-2.md`).
PIN book_digest `034fbff9…b921` intact (assertion `apps/sentinel/test/ukemi.test.ts:29`, verte dans les 343 ;
`book.ts` et les fixtures non touchés).

## C-1 — clé de `dedupLogs` verrouillée (error_origin = worker, item (f))
Deux ajouts, au plus près du défaut (la clé `(blockNumber, logIndex, txHash)`, `rpc2.ts:88-98`) :
1. **Durcissement du test (f) existant** `ukemi_record_getlogsrange_dedups_chunk_boundary`
   (`ukemi-record.test.ts:185-209`) : le stub sert désormais **deux logs par bloc** (logIndex `0x0`/`0x1`, txHash
   partagé) au lieu d'un — helper `log(n, idx)` (ligne 188), double `push` (ligne 193) — et une assertion (ligne
   203) exige **exactement 2 logs par bloc in-range** après dedup (coverage ET non-collapse par clé grossière).
2. **Nouveau test unitaire direct** `ukemi_record_deduplogs_keys_on_full_log_tuple` (`ukemi-record.test.ts:211-221`,
   importe `dedupLogs` de `rpc2.ts`, ligne 12) : cas « même bloc, deux logIndex distincts, MÊME txHash » ⇒
   `length === 2` + les deux logIndex conservés (ordre first-seen) ; cas « (block, logIndex, txHash) identique
   répété » ⇒ `length === 1`.

**Mutant G2-1 rejoué** (clé = `blockNumber` seul) — `rpc2.ts:92` muté en `const k = String(parseInt(l.blockNumber, 16));` :
`node --test apps/sentinel/test/ukemi-record.test.ts` ⇒ **exit 1, fail 2** :
`ukemi_record_getlogsrange_dedups_chunk_boundary` **ROUGE** ET `ukemi_record_deduplogs_keys_on_full_log_tuple` **ROUGE**.
Le survivant nommé par le driver G2 (`…dedups_chunk_boundary`) rougit désormais — le trou C-1 est fermé.
**Restauration** : `rpc2.ts` sha256 `720d399e…c570` == PIN (backup `F:\tmp\u1ahard2-fold\rpc2.ts.orig`, restauré
inconditionnellement).

## O-1 — plafond de backoff câblé au call-site (error_origin = worker, item (c))
**Nouveau test** `ukemi_record_backoff_cap_is_wired_at_call_site` (`ukemi-record.test.ts:229-243`) — discriminant par
le TEMPS, sans faux-horloge (`performance.now()`) :
- **plafonné** `makeDefaultCall({retries:3, backoffMs:100, backoffCapMs:1})` sur stub 503 permanent ⇒ trois attentes
  inter-tentatives clampées 1+1+1 ms ⇒ assertion **`capped < 200 ms`** (ligne 241) ;
- **contrôle sans plafond** `{…, backoffCapMs:1_000_000}` ⇒ 100+200+400 = 700 ms réels ⇒ assertion
  **`uncapped ≥ 600 ms`** (ligne 242) — prouve que le discriminant temporel est vivant.

**Seuil 200 ms (et non le « ~50 ms » de l'esquisse O-1).** Mesuré sur CE poste (Windows, granularité timer 15,6 ms
× 3 sleeps) : plafonné **45–69 ms**, non-plafonné **715–725 ms** (proxy `F:\tmp\u1ahard2-fold\measure-backoff.mjs`,
réplique octet du call-site 5xx : Response 503 + `res.text()` + 3 sleeps). « < 50 ms » serait flaky ici ; 200 ms
tient ~2,9× au-dessus du max local plafonné et ~3,5× sous le plancher 600 ms, et rougit le mutant ~700 ms — conforme
à `G2-lot-u1a-hard-2.md:139` (« assert wall < 100 ms, marge robuste, sans flakiness ») et à la clause « marges
larges pour CI » de l'esquisse. Sur CI Linux `setTimeout(1)` ≈ 1 ms ⇒ plafonné ~3–6 ms **attendu (NON MESURÉ ici**
— inférence de granularité timer Windows→Linux ; le CI tourne `ubuntu-latest`, cf. `ci.yml`).

**Mutant G2-2 rejoué** (cap ignoré au call-site) — les DEUX call-sites (`record.ts:67` fault réseau, `record.ts:74`
5xx) mutés `sleep(backoffDelay(attempt, backoffMs, backoffCapMs))` → `sleep((backoffMs * 2 ** attempt))` ; la fonction
pure `backoffDelay` (`record.ts:39`) reste intacte : ⇒ **exit 1, fail 1** : SEUL
`ukemi_record_backoff_cap_is_wired_at_call_site` **ROUGE** (les 12 autres verts — les tests `backoffMs:0` donnent
`0 * 2**a = 0`, et `ukemi_record_backoff_delay_is_capped` teste la fonction pure, inchangée). Message d'assertion :
« capped … measured **721,7 ms** » (le call-site paie l'exponentielle non plafonnée). **Portée exacte** : le test
exerce le call-site 5xx (74) ; le call-site réseau (67) N'EST PAS couvert par le test (une mutation du SEUL 67
survivrait), mais c'est le même one-liner `backoffDelay(...)`, identique par inspection. **Restauration** :
`record.ts` sha256 `71c542e7…3db9` == PIN.

## Sorties de gates (worktree, node_modules présent, Node v24.15.0)
| Gate | Commande | Résultat |
|---|---|---|
| ci | `npm run ci` | **exit 0** — gate:vocab 157 fichiers, tsc 0, **test 343/343** (fail 0, cancelled 0) |
| lint | `npm run lint` | exit 0 |
| ratchet | `npm run lint:ratchet` | **69/69**, exit 0 |
| lang-gate | `node scripts/lang-gate.mjs --scope root,contracts` | exit 0 — 0 hit FR |
| export:check | `npm run export:check` | exit 0 — 0 chemin interdit, 0 hit FR |

Baseline avant pli : **341/341**. Après : **343/343** (+2 tests : l'unitaire dedup + le timing backoff ; le test (f)
durci reste 1 test). Durée verte du test O-1 : **772 ms** (plafonné ~45 ms + contrôle ~715 ms + overhead).

**Piège rencontré et corrigé pendant le pli** : ma première rédaction du commentaire O-1 citait G2 en **français**
(« marge robuste… », « marges larges… ») ; `export_public_no_governance_no_french` (test 42) a rougi (le lang-gate
scope `root` scanne `apps/sentinel/test/`). Réécrit en anglais (`ukemi-record.test.ts:227`) ⇒ suite reverte. Règle
« Anglais dans code/tests » respectée (grep FR sur mes ajouts au code/test : néant).

**Non-export de ce rapport** : `docs/` est absent de la whitelist d'export (`scripts/export-public.mjs:50-51`,
`WHITELIST_DIRS`/`WHITELIST_FILES`) et `docs/G1-|G2-|G7-|CHECKPOINT` sont en blacklist structurelle (`:92-96`) ; ce
`docs/PLI-*.md` n'est donc JAMAIS candidat à la surface publique, même une fois committé. `export-public.test.ts`
vert avec le rapport présent le confirme (mécanisme = whitelist, non un hasard de fichier non suivi).

## R-25 (three-dot, pathspec de `F:\Monark\.github\workflows\ci.yml:52` — docs `.md` exclus)
| base…tête | commande | lignes |
|---|---|---|
| `e8bcfe4...HEAD` (committé, reproduction G2) | `git diff --shortstat e8bcfe4...HEAD -- <pathspec>` | 6 fichiers, 198+29 = **227** |
| `e8bcfe4` vs arbre de travail (projeté, avec mon pli) | `git diff --shortstat e8bcfe4 -- <pathspec>` | 6 fichiers, 239+30 = **269** |

Deux-points valide (e8bcfe4 est ancêtre de HEAD, vérifié `git merge-base --is-ancestor`). **269 ≤ 280** (objectif
brief) ≪ 1205 (borne ADR). Mon pli ajoute **42 lignes nettes** (+41 ins, +1 del) au seul `ukemi-record.test.ts` ;
`docs/**/*.md` (ce rapport) exclu du décompte.

## Reste
**Vide.** Aucune dette. Les deux items de la liste fermée (C-1, O-1) sont pliés et prouvés par mutant ROUGE +
restauration au PIN ; tous les gates verts ; sources octet-pour-octet inchangées. Aucun papier à procurer, aucun
choix en suspens. Décision finale (G7) et vérification adversariale (R-21) restent chez l'orchestrateur.

## Provenance
Modèle `claude-opus-4-8[1m]`, effort max, 2026-09-19. Aucune écriture hors `F:\tmp\u1ahard2-fold\` (backups
`rpc2.ts.orig`/`record.ts.orig`, logs de run, proxy `measure-backoff.mjs`) et des deux deliverables
`apps/sentinel/test/ukemi-record.test.ts` + `docs/PLI-G2-lot-u1a-hard-2.md`. Mutants rejoués en place puis restaurés
(sha256 == PIN, vérifié) ; worktree propre en dehors des deux deliverables.
