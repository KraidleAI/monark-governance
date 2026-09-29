claude-opus-5-5[1m]

# G1 — RPC-GUARD-RECONCILE-1b TARIFF (ADR-RPC-GUARD-RECONCILE-1, GARDE-GTFA-FULL-TARIFF-1) : tarif gTFA à deux nombres, réservation du pire cas avant l'appel, règlement sur le compte rendu après la réponse

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5`. Worker, effort max (mission), contexte frais. Générateur ≠ réviseur (G2 à venir).
- **Mission** : `F:/tmp/dojo/mission-g1-rg1b.md` (sha256 `7889cc160b5095a87c31b2bf375321154fe655d17a4ddca3cb6f0422decea8d2`, préfixe égal à celui de la tâche), texte calculé par le script de l'orchestrateur, lu comme tel ; `date -u` à l'ouverture : 14:23:19Z. Priorité 1 (décision 255).
- **Base / HEAD (annonce)** : worktree `F:/Monark-wt-rg1b`, branche `lot/rpc-guard-reconcile-rg1b`, HEAD `e2e34aadf14d1a7c80354dccbe0aa16f7dceb7b8` ; `git status --short` **vide** à 14:23:19Z et à 14:31:40Z (`F:/tmp/dojo/rg1b-work/open.txt`). Aucun autre worktree écrit (DRAND-1a, 1a, 1c lus seulement).
- **Processus `node` (C-V-4)** : **58** à l'ouverture (14:31:40Z ; verrou d'hôte tenu par « G2 DRAND-1a » depuis 14:31:25Z) ; **41** au lancement de l'oracle (14:59:20Z) ; à la prise, au test 42 et au rendu du verrou : §10. Une seule suite complète à la fois (verrou `F:/tmp/oracle-lock`, propriétaire « G1 RG-RECONCILE-1b »).

## 0. Journal (`date -u`)

| Heure | Fait |
|---|---|
| 14:23:19Z → 14:31:40Z | mission (sha256 vérifié) ; worktree, HEAD, arbre propre ; `open.txt` : sha256 des 13 fichiers de base, `node` 58, verrou « G2 DRAND-1a » |
| 14:2xZ → 14:3xZ | ADR de lot en entier (165 l., sha256 égal au blob de HEAD) ; FAITS cp1d (L-1, L-2) ; `tariff.ts`, `client.ts`, `ledger.ts`, `reconcile.ts`, `transport.ts`, `guarded.ts`, `index.ts`, `errors.ts`, `cli.ts`, `lock.ts`, bin ; tests `harness.ts`, `tariff`, `caps`, `exports`, `ledger-format-lock`, `multi-operator`, `reconcile`, `ledger.test.ts:70-90`, `transport-hardening.test.ts:160-185` ; Bell : `rebase-crosscheck.test.ts` l.587-603, 1300-1470, 1520-1600, `collect.ts:670-780`, paramètres gTFA de `rebase-crosscheck.ts` ; `guard-collect-1bii.test.ts:40-135` ; `test/guard-scripts-u4.test.ts:140-170` ; missions sœurs 1a et 1c ; `ci.yml:70-100` ; gates `lint-ratchet`, `lang-gate`, `grep-forbidden` ; journal G1 et diff en vol de DRAND-1a (lecture seule) ; scripts d'oracle, de R-25 et de mutants du précédent |
| 14:3xZ | advisor intégré, avant toute écriture (§15) |
| 14:41:53Z → 14:42:49Z | cinq fichiers source, 20 éditions à ancre exacte (`spec-src.mjs` par `patch.mjs`, comptes contrôlés, CR refusé) ; `mk-nm.ps1` sur le worktree (`entries: 220  monark: 10  fail: 0`) ; `tsc --noEmit` exit 0 |
| 14:43:16Z → 14:43:33Z | suite `packages/rpc-guard/test` **avant** amendement : 92/99, **exactement les sept tests déclarés** par l'ADR rougissent (`pkg-red-before-amend.log`) |
| 14:43:42Z → 14:44:52Z | suite `apps/bell/test` **avant** amendement : 294/297, **exactement les trois tests des trois points de D-2** rougissent ; clause STOP non déclenchée (`bell-red-before-amend.log`) |
| 14:4xZ | ligne v1 dorée : sha256 calculé par `sha256sum` sur le littéral (`716c1b1f…7ba9`, `golden-v1-sha.txt`) |
| 14:4xZ → 14:47:30Z | `gtfa-tariff.test.ts` écrit (outil Write) ; 5/5 |
| 14:48:59Z | amendements : 20 éditions par ligne (`patch-lines.mjs`, contenu de ligne contrôlé) puis 4 insertions à ancre |
| 14:49:05Z | R-25 = **341** (worktree) |
| 14:49:22Z → 14:50:15Z | `tsc` exit 0 ; paquet **104/104** ; Bell **297/297** |
| 14:50:25Z → 14:51:10Z | `eslint` des 13 fichiers exit 0 ; `lint:ratchet` **69/69** (worktree) ; `lang:gate` OK ; `gate:vocab` OK |
| 14:51:26Z → 14:52:37Z | `test/guard-scripts-u4.test.ts` + `apps/sentinel/test/ukemi-guard-record.test.ts` : **51/51** |
| 14:53:40Z | retouche de forme : `SettleOutcome` placé avant la JSDoc d'`OperatorClass` (la JSDoc s'attache à la déclaration suivante) ; `tsc` et `eslint` exit 0 |
| 14:54:07Z → 14:55:05Z | deux clones `--no-local` (mutants, oracle), HEAD `e2e34aa` ; `mk-nm.ps1` ×2 ; `lint:ratchet` sur le clone **vierge** : **69/69** ; synchronisation, sha256 agrégé des 13 fichiers égal dans les trois arbres (`de93b24b…`) ; R-25 sur le clone = 341 |
| 14:57:12Z → 14:57:47Z | mutants, passe 1 : 22/22 |
| 14:58:24Z → 14:58:59Z | mutants, passe 2 (fait foi) : **23/23** (M-T4 joué aussi contre la sonde P6) |
| 14:59:20Z | oracle lancé sous `locked.sh` (verrou tenu par « G1 RG-RECONCILE-1c » depuis 14:58:03Z) |
| 14:59:41Z → 15:01:26Z | TY-12 : fusion à blanc (`git merge-file -p`, sortie standard, copies) : **un** conflit (`ledger.ts`) ; arbre fusionné jetable : `tsc` exit 0, **195/195** ; mutant de mauvaise fusion tué |
| 15:0xZ | greps, `lot.diff`, ce journal ; jonctions de l'arbre fusionné retirées (`F:/Monark/node_modules` intact : 220 entrées, `@monark` 10) |
| 15:07:47Z → 15:07:53Z | fichiers de test du lot côté paquet (six fichiers), deux passages : 39/39 chacun (`lot-tests-pass1.log`, `lot-tests-pass2.log`) |
| 14:59:20Z → 16:29:34Z | première attente bornée du verrou : **non obtenu** en 90 min (exit 75, `out-1/node-count.txt`) ; détenteurs successifs : « G1 RG-RECONCILE-1c » (14:58:03Z), « G1 RG-RECONCILE-1a » (15:14:06Z), « corr PR-2b-3 » (15:26:11Z), « G1 PR-4b » (15:37:14Z), « corr PR-3b-1 » (15:55:58Z), « corr DRAND-1a » (16:10:20Z), « cp-2 PR-2b-3 » (16:24:17Z) |
| 15:08:55Z → 15:09:33Z | suite `apps/bell/test`, second passage : 297/297 (`bell-suite-2.log`) |
| 16:26:31Z → 16:28:58Z | une recherche en lecture seule des scripts de verrou concurrents, trop large (elle parcourait les arbres clonés), arrêtée par `TaskStop` ; ses deux processus orphelins (`grep` 54808, `xargs` 144820) tués ; un `grep` étranger (101428, lancé à 12:54:49Z, avant cette passe) laissé ; recherche refaite à profondeur 2 : tous les verrouilleurs ont les mêmes paramètres (`until mkdir`, `sleep 60`, 5 400 s) |
| 16:29:48Z → 17:06:57Z | seconde attente bornée (`out-2`) : « corr PR-3b-1 » (16:36:41Z), « G2 PR-4b » (16:48:22Z), puis **verrou pris** à 17:06:57Z après 2 220 s |
| 17:06:57Z → 17:19:34Z | sept gates **7/7 exit 0** ; `test` 1 446 tests, 1 443 pass, **0 fail**, 3 skipped ; test 42 seul **2/2** ; verrou rendu à 17:19:34Z (§10) |
| 17:20:32Z | jonctions des clones de l'oracle et des mutants retirées ; `F:/Monark/node_modules` intact (220 entrées, `@monark` 10) |
| 17:2xZ | §10 complété ; livraison `F:/tmp/dojo/rg1b-deliver/` ; advisor intégré (seconde consultation) |

## 1. Sources (niveau) et entrées

- **[lu]** ADR `docs/adr/ADR-RPC-GUARD-RECONCILE-1.md` (165 l., sha256 `45ac97e226272c66d7b01d1986471d76b96aec4c3206e429287b580d4db9b4ab` = `git show HEAD:…`), en entier. Priment : « Pli cp-1 » et lignes datées (14:08Z : Q-O1 = (a), Q-O2 = oui, Q-O4 = gel levé sous condition, Q-O7 ; 14:21Z : C-V-1..C-V-4, O-1, O-3, **décision 255** : 1b part en premier, en parallèle de 1a et 1c, conflits résolus au G7 du second fusionné).
- **[lu]** `docs/dojo/FAITS-cp1d-lectures-2026-09-26.md` (43 l., sha256 `598a43e59ed616e64f140acbb6794513fe3c873d2ed1a00aff957ac0840b856a`) : **L-2** « Full transactions cost 10 credits per 100 returned; signatures-only responses cost 10 credits flat » ; table 1-100 → 10, 250 → 30, 1,000 → 100 ; « Failed API responses Free ». **L-1** : `limit` « default: "1000" », « Use 1–1000 ». Les tables des tests (7)-(10) sont recopiées de L-1/L-2, jamais tirées du code (FM-3.3).
- **[lu]** code de base, sha256 avant : `tariff.ts` `77d5876c…3b48`, `client.ts` `6553556c…d50f`, `ledger.ts` `625c759f…46cb`, `reconcile.ts` **`6e62cd6a…a5aa`** (le sha « FIGÉ » de GARDE l.1210, §13 Q-3), `transport.ts` `64a84454…385e`, `index.ts` `db2908e9…c5c8` ; tests `caps` `83f94f73…7271`, `exports` `8e69ccd5…37a8`, `multi-operator` `34ca56d6…f103`, `tariff` `a79671f9…b13d`, `ledger-format-lock` `699546fd…c9d4`, `harness` `9188c606…` ; Bell `rebase-crosscheck.test.ts` `bed50110…a091` (`open.txt`).
- **[lu]** consommateur Bell du nombre net : `apps/bell/src/collect.ts:733` `ledgerCredits = (): number => c.spent().byOperator.helius ?? 0` ; pages Bell à `limit: GTFA_PAGE_LIMIT` (1 000, `rebase-crosscheck.ts:293`), ancre `desc` à `limit: 1` (l.299) ; la souche `b1aStub` rend un corps pour l'ancre (`rebase-crosscheck.test.ts:593`).
- **[lu] en lecture seule, non copié** : diff en vol de DRAND-1a (`F:/Monark-wt-drand`, blobs de base identiques à ceux de `e2e34aa` ; sha256 `client.ts` `e326f9a4…`, `ledger.ts` `c721094e…`, `transport.ts` `84f2783c…`, `index.ts` `3e1ae124…`, égaux à son journal) et son journal G1 (201 l.) ; missions sœurs `mission-g1-rg1a.md` (1a fait aussi « `ledger.ts` (verrou v2) ») et `mission-g1-rg1c.md` (bloc helius de `transport.ts`).
- **Écarts relevés (É-n de ce journal)** : **É-1** l'ADR (D-5) conditionne le test (11) à la fusion de DRAND-1a, qui n'a pas eu lieu (décision 255) : forme tenue ici, forme fusionnée prouvée à blanc (§8). **É-2** l'ADR range le verrou v2 et `LEDGER_FORMAT` dans 1a (É-6 : +14, +3) ; la mission et la décision 255 le donnent aussi à 1b, qui part en premier : v2 ici = v1 + `settled` seule (§4 point 9). **É-3** test (10) « dans les deux modes » : sur cette base, le mode course n'existe pas (1a) ; lu per-method + aggregate (§4 point 10). **É-4** la mission dit « `transport.ts` (rend le compte de corps rendus) » ; l'ADR (qui prime) dit `OperatorClass.settle?(method, params, result)` présent pour helius seul : réalisé ainsi (§4 point 8).

## 2. Interfaces

```ts
// packages/rpc-guard/src/tariff.ts
export const HELIUS_TARIFF_VERSION = "helius-2026-09-26";                                   // date de L-2
export function heliusCredits(method: string, params?: readonly unknown[]): number;         // RÉSERVATION (export public inchangé)
export function heliusSettle(method: string, params: readonly unknown[], outcome: SettleOutcome)
  : { credits: number; note: string } | undefined;                                           // RÈGLEMENT ; interne (absent d'index.ts)
// packages/rpc-guard/src/client.ts
export type Outcome = "attempted" | "refused" | "reconciled" | "unlocked" | "settled";
export type SettleOutcome = { readonly result: unknown } | { readonly failed: string };     // valeur rendue, ou nom d'un échec REÇU
interface OperatorClass { …; credits?: (method, params?) => number; settle?: (method, params, outcome) => { credits; note } | undefined; … }
// packages/rpc-guard/src/ledger.ts
export const LEDGER_FORMAT = 2;                                                              // absent d'index.ts (public_export_set_is_closed inchangé)
// packages/rpc-guard/src/transport.ts (resolveOperators)
classes["helius"] = { unit: "credits", credits: heliusCredits, settle: heliusSettle, cycleCap: HELIUS_CYCLE_CAP_CREDITS };
```

- **Ligne `settled`** (écrite par `call`, ssi réglé ≠ réservé) : `{prev_entry_sha256, cycle_id, tariff_version: "helius-2026-09-26", by_op_method: {"helius|getTransactionsForAddress": 0}, outcome: "settled", credits_derived: <réglé − réservé, signé>, reason: "settles:<entry_sha256 de SA ligne attempted>;rendered:<n>" | "settles:<sha>;failed:<HttpError|RpcError>", entry_sha256}` ; `runByOp` corrigé du même delta.
- **Lecteurs** : `priorAtOpen` = max(plancher, Σ `attempted` + Σ `settled`) ; fenêtre de `runReconcile` = `attempted` + `settled`. Ensemble des valeurs exportées de `@monark/rpc-guard` : **inchangé**.

## 3. Fichiers (modifiés ou créés ; aucun autre)

| Fichier | État | Lignes | `numstat` vs `e2e34aa` | sha256 |
|---|---|---|---|---|
| `packages/rpc-guard/src/tariff.ts` | modifié | 133 | 39 6 | `06d2b664b64a6877e0d635dd564d37dd9581fb6c4c8846ca7678698e700295e4` |
| `packages/rpc-guard/src/client.ts` | modifié | 161 | 34 12 | `484ad0111aa3f1cde1a391f7901b9b3e0a37772104f36001e5a4f990cebf3928` |
| `packages/rpc-guard/src/ledger.ts` | modifié | 213 | 5 2 | `87171c3051e59e9609cdaefee27aceb09f9da9250c83399df89d860ad24860fe` |
| `packages/rpc-guard/src/reconcile.ts` | modifié | 113 | 4 3 | `f428033fe29d24b0d669a4e97908ff764cda7c5fb34dfec7e45d1c124fef102a` |
| `packages/rpc-guard/src/transport.ts` | modifié | 263 | 4 2 | `0b4f1d6833e793341d5dd70e127f0d9929e1e0f2688d1f21538633b585c9d31d` |
| `packages/rpc-guard/test/gtfa-tariff.test.ts` | créé | 168 | (non suivi) | `60dd1aa4fd72dce5ad6aa150acf398b34d958d49fc0c65851f859b8953c634a9` |
| `packages/rpc-guard/test/caps.test.ts` | modifié | 114 | 7 7 | `9a3f17ba61dc9de1c3c4af4d9d579864540e002b8f18cea1863686feaea181f5` |
| `packages/rpc-guard/test/exports.test.ts` | modifié | 87 | 3 3 | `f5211b38ed26b2b49eb82dbebb40e0ec2f65f432df97058a9574a8df16091c07` |
| `packages/rpc-guard/test/harness.ts` | modifié | 68 | 3 0 | `7053b42ca341fa8e1b2f10d770d896a9e76b23b34a8899de4f28791fde66a08f` |
| `packages/rpc-guard/test/ledger-format-lock.test.ts` | modifié | 81 | 13 1 | `efe82607fa4e7600a50c8aa23317f6ced1e9ddb4b81f42ae21d2ed59a342a8ed` |
| `packages/rpc-guard/test/multi-operator.test.ts` | modifié | 314 | 4 4 | `5b828f3b79036d8b849023554c45e1ebe30c8a184bc22b53a486a2ac364ba223` |
| `packages/rpc-guard/test/tariff.test.ts` | modifié | 67 | 1 1 | `8788e369f3680fb601a43775043ea7ec85d20127eb247ea40872abf06bcfc9cf` |
| `apps/bell/test/rebase-crosscheck.test.ts` | modifié (Q-O2 : les trois points de D-2 seuls) | 1 855 | 10 5 | `31362bf2fceb8e32c98d66db7bba536251a609259f8b238ab6622799abee9e52` |
| `docs/G1-lot-rpc-guard-reconcile-1b.md` | créé (ce journal, hors R-25 par le pathspec) | — | — | rendu hors du fichier |

- Gelés, inchangés : `apps/bell/src/**` et tout `apps/bell/**` hors les lignes citées par D-2 ; `guarded.ts`, `lock.ts`, `cli.ts`, `errors.ts`, `index.ts`, bin, `package*.json`, `tsconfig.json`, ADR, FAITS, `CHANTIERS.md`. Aucune dépendance, aucune fixture.
- 0 octet CR dans les 13 fichiers ; 0 caractère hors ASCII ajouté (le test Bell en porte 426 octets avant comme après, tous préexistants : `Σ`, `×`, `—`).
- `node_modules` du worktree : jonctions de `mk-nm.ps1` (ignoré par `.gitignore`), à retirer par `rm-nm.ps1 -Tree F:\Monark-wt-rg1b` si l'orchestrateur le veut.

## 4. Choix déclarés (jamais silencieux)

1. **Réservation** (`heliusCredits(method, params?)`, lue par `meter` avant tout appel) : gTFA lit `params[1]` ; `transactionDetails === "signatures"` ⇒ 10 ; sinon (`full`, absent, inconnu) 10 × ⌈L/100⌉, L = `limit` s'il est un **entier** de 1 à 1 000, sinon 1 000 (L-1). Un non-entier (150,5) lit 1 000 : cas ajouté à la table de l'ADR, dérivé de sa règle « entier » (sonde P-T6). Autres méthodes inchangées, y compris avec un `limit` dans leurs paramètres.
2. **gTFA sorti de `TEN_CREDIT`** et tarifé avant la table : la table fermée reste fermée (méthode inconnue ⇒ refus) ; si la branche gTFA disparaissait, gTFA serait refusé, jamais compté 10 par défaut (sous-compte).
3. **Règlement** (`heliusSettle`, helius seul) : gTFA hors `signatures`, `result.data` tableau de n ⇒ 10 × max(1, ⌈n/100⌉), **jamais plafonné** (TY-7) ; résultat sans tableau `data` (primitif, `null`, objet sans `data`) ⇒ `undefined`, la réservation reste. Fonction totale sur toute forme de résultat.
4. **Échec reçu (Q-O1 (a))** : le classement vit dans `call` : `e instanceof TransportError && (e.name === "HttpError" || e.name === "RpcError")` ⇒ règlement à 0 (`failed:<nom>`), ligne `settled` écrite **avant** le `throw`. Tout le reste garde la réservation : faute réseau (`TypeError`, `AbortError`), `NonJsonBody`, `RedirectBlocked`, et une `Error` nue d'un transport factice.
5. **Échec en mode `signatures`** : réglé à 0 aussi (delta −10) — l'ADR ne découpe aucun mode pour les échecs et L-2 dit « Failed API responses Free » ; épinglé par un cas du test (9) ; à confirmer (Q-2).
6. **Sha de la ligne `attempted`** : `commit` le rend en lisant la dernière entrée du grand livre juste après `append` ; l'interface `CycleLedger.append` reste intacte (un conflit de moins avec les insertions adjacentes de DRAND-1a, §8).
7. **`tick(op, kind)`** : sans paramètres ⇒ pire cas pour gTFA, sans règlement ; aucun appelant hors du paquet (recherche `.tick(` : les seuls appels de Bell, `collect.ts:683-684`, visent son `makeBudgetedCall` hors ligne, pas le client du garde).
8. **« `transport.ts` rend le compte de corps rendus » (É-4)** : la classe helius **servie** par `resolveOperators` porte `settle`, qui lit `result.data.length` de la valeur que ce transport rend, inchangée (Bell la lit telle quelle). Aucun changement du type `Transport`.
9. **Verrou v2 (É-2)** : `ledger_format_locked_to_rebase_crosscheck` amendé, assertions placées **avant** le `t.skip` : `LEDGER_FORMAT === 2` ; ensemble fermé des issues en `Record<Outcome, true>` (une issue nouvelle fait rougir le gate `typecheck` tant que le verrou n'est pas porté en v3) plus un `deepEqual` de ses clés à l'exécution ; une ligne v1 **dorée** (`tariff_version` `helius-2026-09-21`) recalculée à l'octet par `chainCycleEntry` et vérifiée par `verifyCycleLedger`, son `entry_sha256` calculé par `sha256sum` sur le littéral, jamais par ce code. v2 ici = v1 + `settled` ; `course_reconciled` et le champ `course` viennent de 1a : union au second merge (item I-3).
10. **Test (10) « dans les deux modes » (É-3)** : per-method et `--mode aggregate` (helius n'est pas dans `AGGREGATE_ONLY_OPERATORS`), fenêtre historique ; chaque verdict a sa course, car chaque rapprochement écrit sa borne `reconciled` ; le témoin « sans `settled` » est la même course dont les résultats n'ont pas de tableau `data` (300 réservés, aucune ligne `settled`) ⇒ NO-GO soft au vrai 140. Le mode course (1a) est l'item I-2.
11. **Test (11) (É-1)** : `rpc_guard_gtfa_settled_lines_are_not_attempts` sur les surfaces présentes (`spent().attempts`, `run_calls` à `maxCalls`, `method_cap`, compte `by_op_method` 0) ; sa forme fusionnée (`priorAttemptsAtOpen() === 2`) est prouvée sur un arbre fusionné jetable (§8) et devient l'item I-1.
12. **Constante du harnais** `GTFA_P100 = ["m", { limit: 100 }]` (réservation 10, le prix plat d'avant) : les sept tests amendés gardent leurs valeurs attendues ; `method_cap_stops` et `budget_counts_http_attempts` restent intacts (verts sans amendement).
13. **Bell, lecture STOP-sûre** : seules les lignes citées par D-2 (l.1364, l.1385, l.1562, l.1567, l.1569) et l'aide `creditsOf` (issues `attempted` + `settled`) ; `attemptedOf` reste le **compte** (`gtfa`, `run1HeliusAtt`). Le titre du test l.1557 (« credits_recomputed 40 », « 30 cr ») et le commentaire l.1383-1384 (arithmétique à 15) restent périmés : **Q-1**.
14. **Outils** (commandes < 6 Ko) : fichiers longs par l'outil Write ; éditions par `patch.mjs` (ancres exactes, comptes) et `patch-lines.mjs` (ligne et contenu contrôlés), CR refusé. **Mesuré** : le transport Bash a réduit `\\n` en saut de ligne brut dans une spec du harnais de mutants (hors dépôt) ; vu par `node --check`, réparé par une spec écrite avec Write ; aucun fichier du lot n'a transité par une commande avec antislash.

## 5. R-25 (méthode `ci.yml:82` et `:90`, base `e2e34aa`)

- Script `F:/tmp/dojo/pr2-1-r25-methodA.mjs` (sha256 `140be120c7db04b27d664e665e639973425e350fd0713a5256cf61660d78d3bf`, inchangé depuis PR-1b-2) : pathspec de `ci.yml:82` (20 éléments), `git diff --numstat e2e34aa`, `--no-index` pour le fichier neuf, insertions + suppressions ; aucune écriture git.
- **341**, identique sur le worktree (`r25-worktree-1.txt`) et sur le clone de l'oracle (`r25-clone.txt`) : code **111** (`tariff.ts` 45, `client.ts` 46, `ledger.ts` 7, `reconcile.ts` 7, `transport.ts` 6) + tests **230** (`gtfa-tariff.test.ts` 168, `ledger-format-lock` 14, `caps` 14, `multi-operator` 8, `exports` 6, `harness` 3, `tariff` 2, Bell 15). Ce journal est exclu par le pathspec.
- Estimation ascendante de l'ADR : 190 ; **plus 17** que l'ADR rangeait dans 1a et que la décision 255 fait porter par 1b (verrou v2 +14, `LEDGER_FORMAT` +3) = 207. Dérive **×1,79** sur 190 (×1,65 sur 207) ; **≤ 399** (×2,1) : **coupe de repli 1b (i)/(ii) non posée** ; STOP 1 150 à 809 lignes. Écart : code 111 contre 56 (commentaires de provenance L-1/L-2/Q-O1, aide `settleLine`, branche d'échec) ; tests (7)-(11) 168 contre 88 (en-tête, pièges, aide `course` ≈ 30 l. ; table de 13 cas ; trois familles d'échec ; cinq courses au (10)).

## 6. Tests

| Test | Fichier | Couvre | Mutants visés |
|---|---|---|---|
| (7) `rpc_guard_gtfa_reserves_the_worst_case_before_the_call` (nouveau) | `packages/rpc-guard/test/gtfa-tariff.test.ts` | table (sans paramètres 100 ; 1 → 10 ; 100 → 10 ; 101 → 20 ; 250 → 30 ; 1 000 → 100 ; 0, 5 000, `"x"`, 150,5 → 100 ; `transactionDetails` absent ou inconnu à 250 → 30 ; `signatures` → 10) ; `getTransaction` et `getProgramAccounts` inchangés ; par `openGuardedClient` : plafond de course 99 ⇒ refus `run_credits` d'une page `limit: 1000`, **0 fetch** ; plancher 7 999 950 ⇒ refus `cycle_cap` de la page 1 000, page 500 admise (8 000 000 inclus), **1 fetch** ; au moment du fetch, la dernière ligne sur disque est `attempted` à **100** | M-T1, M-T2, M-T3 ; P-T6 |
| (8) `rpc_guard_gtfa_settles_on_the_rendered_count` (nouveau) | idem | n = 0, 1, 100, 101, 1 000, 1 500 à `limit: 1000`, puis `signatures` rendant 250 : suite exacte `[attempted 100, settled −90]`×3, `[attempted 100, settled −80]`, `attempted 100` **sans ligne** (n = 1 000), `[attempted 100, settled +50]` (non plafonné), `attempted 10` sans ligne, `unlocked` ; clés de la ligne `settled` dans l'ordre, `by_op_method` à 0, `reason` nommant le sha de **sa** ligne `attempted`, version `helius-2026-09-26` ; `spent()` = `{attempts: 7, byOperator: {helius: 310}}` ; `priorAtOpen()` à la réouverture = **310** (brut 610) | M-T5, M-T6a, M-T6b, M-T7, M-T8a, M-T10 ; P-T1, P-T3, P-T5, P-T7 |
| (9) `rpc_guard_gtfa_failure_settlement` (nouveau) | idem | HTTP 429, HTTP 500, `RpcError` ⇒ `settled` −100 (`failed:HttpError`, `failed:RpcError`), erreur relancée ; `TypeError` (faute réseau), `NonJsonBody`, `RedirectBlocked` (302) ⇒ réservation gardée, aucune ligne ; `getTransaction` 500 ⇒ 1 gardé, aucune ligne ; `signatures` 429 ⇒ `settled` −10 ; `spent()` = `{attempts: 8, byOperator: {helius: 301}}` | M-T9 ; P-T2 |
| (10) `reconcile_counts_settled_lines` (nouveau) | idem | pages partielles (250, 40, 1 000 rendus : 300 réservés, 140 facturés), `runCli unlock` puis `runCli reconcile` servi, cinq courses dans un cycle : per-method GO à 140 ; +1 ⇒ NO-GO `hard:getTransactionsForAddress` ; aggregate GO ; +1 ⇒ NO-GO `hard:total` ; témoin sans `data` ⇒ NO-GO `soft` ; chaîne vérifiée | M-T8b, M-T11 |
| (11) `rpc_guard_gtfa_settled_lines_are_not_attempts` (nouveau, TY-12) | idem | `maxCalls` 2 et plafond de méthode 2 : deux appels suivis chacun d'une ligne `settled` passent, le troisième est refusé `run_calls` ; `spent().attempts` = 2 ; issues et comptes `[attempted 1, settled 0, attempted 1, settled 0, refused 1, unlocked 1]` | P-T4a, P-T4b ; mauvaise fusion M-TY12 (§8) |
| (6) `ledger_format_locked_to_rebase_crosscheck` (amendé, v2) | `ledger-format-lock.test.ts` | §4 point 9 | P-T8 |
| amendés (D-2, `["m"]` → `GTFA_P100`) | `caps.test.ts`, `exports.test.ts`, `multi-operator.test.ts`, `tariff.test.ts:8` | `run_credits_cap_stops`, `cycle_cap_stops`, `cycle_cap_floor_probe`, `public_api_freezes_the_prior_p3_floor`, `two_paid_operators_keep_separate_priors_and_units` (l.32-33), `run_caps_are_per_operator_at_the_meter` (l.65), `unknown_method_fail_closed` (gTFA sans paramètres = 100) : **rouges avant**, verts après, valeurs attendues inchangées | — |
| amendés Bell (Q-O2) | `apps/bell/test/rebase-crosscheck.test.ts` | `crosscheck_credits_derived_from_ledger` (somme par `creditsOf` = 40 = gTFA × 10 net = `credits_recomputed`) ; `bell_crosscheck_guarded_resume_without_loss_after_budget_stop` (`--max-credits` 105 : page 1 réservée 100 puis réglée 10, page 2 : 10 + 100 > 105 ⇒ refus, une page) ; `bell_shortpage_probe_metered_on_the_guarded_cycle_ledger` (140 = `NF_P1` 100 + SP2 20 + sonde vide 10 + ancre 10 ; témoin 130) : **rouges avant**, verts après | — |

- **À contrôler par nom**, tous ✔ sans amendement : `public_api_never_reaches_fetch_without_a_ledger_line`, `budget_counts_http_attempts`, `method_cap_stops` (paquet, `rpcguard-suite-1.log`) ; `bell_shortpage_probe_transient_error_is_retried` (chemin hors ligne, aucun crédit asserté) (`bell-suite-1.log`) ; comptes d'issues de `test/guard-scripts-u4.test.ts:153-164` (20 tests `u4_*`, aucune ligne `settled` sur chainstack ni sur les sans-clé) et contrôles de fuite de `apps/sentinel/test/ukemi-guard-record.test.ts` (31 tests, dont `ukemi_record_failed_paid_rpcerror_leaks_no_key_on_any_surface`, `ukemi_record_budget_stop_writes_durable_diag_journal`, `ukemi_record_retry2_persistent_408_is_bounded_then_surfaces_and_leaks_nothing`, et les rapprochements servis `ukemi_record_then_unlock_then_reconcile_end_to_end`, `ukemi_record_e2e_paid_ledger_is_reconciled_go_and_hard_no_go` sur le nouveau `reconcile.ts`) : **51/51** (`u4-ukemi-1.log`).
- `npx tsc --noEmit` exit 0 ; `npx eslint` des 13 fichiers exit 0 ; `npm run lint:ratchet` **69/69** (worktree 14:51:02Z ; clone vierge 69/69, 14:54:55Z) ; `lang:gate` OK ; `gate:vocab` OK (322 fichiers).

## 7. Mutants (copie hors dépôt `F:/tmp/dojo/rg1b-mutants/`)

- Arbre `F:/tmp/dojo/rg1b-mutants/tree` : clone `--no-local` de la branche (HEAD `e2e34aa`), 13 fichiers du lot copiés (`cmp` égal, sha256 agrégé `de93b24b…` égal au worktree), `node_modules` par `mk-nm.ps1` (`@monark/*` pointe l'arbre lui-même). Harnais `mutants.mjs` (sha256 `21d51b55d8b6b5375dfd6d28206d78abc1b4ecd08646c5bbfd8fbab2e0406aac`) : témoin d'abord (huit tests visés `ok`), remplacement exact à compte contrôlé, test visé seul (`--test-name-pattern`, TAP), **tué seulement si le TAP porte `not ok N - <test visé>`**, fichier restauré puis contrôlé au sha256 après chaque mutant ; TAP par mutant (`<id>.tap.txt`).
- Passe qui fait foi (14:58:24Z → 14:58:59Z) : témoin 8/8 `ok` ; **23/23 tués** (liste fermée : 14 jeux ; sondes : 9) ; cinq fichiers dorés inchangés au sha256 après la passe (`RESULTS.txt`). Passe 1 (14:57:12Z → 14:57:47Z, `RESULTS-run1.txt`) : 22/22, même verdict ligne pour ligne (seul M-T4-P6 a été ajouté).

| Id | Mutation (fichier) | Test visé | Verdict (assertion qui tue) |
|---|---|---|---|
| M-T1 | réservation plate 10 (`tariff.ts`) | (7) | tué (table : sans paramètres attendu 100) |
| M-T2 | réservation lue après l'appel : transport lancé avant `meter` (`client.ts`) | (7) | tué (« 0 fetch: refused on the reservation ») |
| M-T3 | `transactionDetails` absent traité en `signatures` (`tariff.ts`) | (7) | tué (table) |
| M-T4 | `attempted` écrite après le lancement du fetch (`client.ts`) | `budget_counts_http_attempts` | tué (le transport espion lit un grand livre encore absent : ENOENT) |
| M-T4-P6 | même mutation | `public_api_never_reaches_fetch_without_a_ledger_line` | tué (`linesAtFetch` ≠ [1]) |
| M-T5 | règlement omis : `settle` non câblé sur la classe helius servie (`transport.ts`) | (8) | tué (suite des lignes) |
| M-T6a | arrondi inférieur (`tariff.ts`) | (8) | tué (n = 101 : −90 au lieu de −80) |
| M-T6b | minimum de 10 retiré (`tariff.ts`) | (8) | tué (n = 0 : −100 au lieu de −90) |
| M-T7 | règlement plafonné à la réservation (`tariff.ts`) | (8) | tué (n = 1 500 : aucune ligne au lieu de +50) |
| M-T8a | valeur absolue au lieu du delta (`client.ts`) | (8) | tué (suite des lignes) |
| M-T8b | même mutation | (10) | tué (per-method : NO-GO au lieu de GO) |
| M-T9 | toute faute de transport réglée à 0 (`client.ts`) | (9) | tué (suite des lignes) |
| M-T10 | prieur sans `settled` (`ledger.ts`) | (8) | tué (réouverture 610 au lieu de 310) |
| M-T11 | rapprochement sans `settled` (`reconcile.ts`) | (10) | tué (per-method : NO-GO soft au lieu de GO) |
| P-T1 | ligne `settled` même quand réglé = réservé | (8) | tué |
| P-T2 | échec reçu réglé sur toute méthode helius | (9) | tué (`getTransaction` 500) |
| P-T3 | page `signatures` réglée sur son compte | (8) | tué |
| P-T4a | ligne `settled` comptée comme tentative (`run_calls`) | (11) | tué (refus `run_calls` au deuxième appel) |
| P-T4b | ligne `settled` comptée au plafond de méthode | (11) | tué (refus `method_cap`) |
| P-T5 | `runByOp` non corrigé (`spent()` brut) | (8) | tué (`spent()`) |
| P-T6 | `limit` non entier admis | (7) | tué (150,5) |
| P-T7 | `reason` nommant la tête d'avant sa ligne `attempted` | (8) | tué |
| P-T8 | `LEDGER_FORMAT` laissé à 1 | (6) | tué |

## 8. TY-12 et conflits prévisibles (décision 255 : conflits résolus au G7 du second fusionné, déclarés ici)

- **Fusion à blanc avec DRAND-1a** (`git merge-file -p`, sortie standard, sur copies sous `F:/tmp/dojo/rg1b-work/merge/` ; base = blobs de `e2e34aa`, identiques à la base de DRAND-1a) : `client.ts` **propre** (le `cycleAttempted.set(…)` de DRAND s'insère dans `commit` ; `settleLine` ne touche aucun compteur de tentatives) ; `transport.ts`, `index.ts`, `exports.test.ts` propres ; **`ledger.ts` : un conflit**, l.190 `frozenPrior` (1b : `attempted` + `settled`) contre l.190-191 (DRAND : `frozenPrior` + `frozenAttempts`) ; résolution par **union** (la ligne nette de 1b, puis `frozenAttempts` de DRAND, qui ne compte que les `attempted`).
- **Arbre fusionné jetable** `F:/tmp/dojo/rg1b-merge` (clone `--no-local` + les 13 fichiers + quatre sources fusionnées + `drand-labels.test.ts` et `bell-keys.test.ts` de DRAND + l'assertion (11) de forme fusionnée `priorAttemptsAtOpen() === 2`) : `tsc` exit 0 ; paquet + `bell-keys` + `rebase-crosscheck` : **195/195** (`merge-tests.log`), dont `rpc_guard_drand_labels_are_host_bound`, `rpc_guard_keyless_cycle_attempts_hold_across_courses`, `rpc_guard_gtfa_settled_lines_are_not_attempts`, `bell_publish_bare_label_guard_pins_operator_vocabulary`. Mutant de **mauvaise fusion** M-TY12 (`frozenAttempts` compte aussi les `settled`) : **tué** par (11) (`merge-mutant-TY12.tap.txt`), fichier restauré au sha256.
- **Avec 1a** (en parallèle, `F:/Monark-wt-rg`, non lu en cours) : `client.ts` (`Outcome` : `"settled"` ici, `"course_reconciled"` là), `ledger.ts` (`LEDGER_FORMAT` ajouté des deux côtés), `ledger-format-lock.test.ts` (même test amendé des deux côtés), `reconcile.ts` (1a généralise la fenêtre ; la ligne l.62 de 1b doit y survivre : M-T11 en mode course, item I-2). **Avec 1c** : bloc helius de `transport.ts` (l.95-98 : la ligne `classes["helius"]` de 1b et son commentaire jouxtent le contrôle d'hôte de 1c avant `urls.set`) : conflit probable, union.

## 9. Tuyaux (règle Branchement ; ADR D-4)

- **TU-gt** : entrée = réponse gTFA du transport servi (`resolveOperators` : `settle` sur la classe helius) ; sortie = ligne `settled` ; consommateurs : `priorAtOpen` (ouverture suivante, `openGuardedClient`), `spent()` (Bell : `ledgerCredits` ⇒ `credits_recomputed`, `collect.ts:733`), fenêtre de `runCli reconcile` (bin servi). État : `<ledger>/<cycle>/helius.jsonl`. Tests non-LLM : (8) et (10) par `openGuardedClient`, `fetch` remplacé et `runCli` ; `crosscheck_credits_derived_from_ledger` par `runMain` ⇒ `openGuardedClient`.
- **Ce qui reste `upcoming`** : `@monark/rpc-guard` et `bin/rpc-guard.mjs` (GARDE l.1280, décision 129). Aucune course Bell gTFA avant le G7 de 1b et BELL-GTFA-CREDITS-1 (Q-I1 = (a)). Ce lot ne déclare rien « built ».

## 10. Oracle (sept gates sur clone, sous verrou d'hôte « G1 RG-RECONCILE-1b ») et test 42

- **Scripts** `F:/tmp/dojo/rg1b-work/`, dérivés de ceux de DRAND-1a par substitution des seuls noms et chemins (`sed`) : `run-oracle.sh` (sha256 `a6843ce79572b37a2f333260f63b36097fe6f43e36b4280577a30ee0d0ab8176` : `npm run` des sept gates `gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`, codes capturés directement, huit variables payantes retirées par `env -u`, TEMP sur F:), `locked.sh` (`ea86e6b97535389efc96c0bce682e066c703e9b8917e07cc9283e85c8406b852` : verrou `F:/tmp/oracle-lock` par `mkdir` atomique, `owner.txt` « G1 RG-RECONCILE-1b », attente par pas de 60 s jusqu'à 90 min, retrait dans le piège EXIT ; `node.exe` comptés à la prise et au rendu), `oracle-all.sh` (`e7b117b11be51630f71e23de43ce7b4f80b99a5032a3af4a26331c1a271f57ab` : les sept gates puis le test 42 seul, sous la même prise ; compte au lancement du test 42), `t42.sh` (`587ae6f72dd82cf506e601232d8eb8eb0d5d9838bd8e30b3eb695cf8d274e1e9`), `sync.sh`.
- **Arbre** : `F:/tmp/dojo/rg1b-clone` (`git clone --no-local --branch lot/rpc-guard-reconcile-rg1b F:/Monark`, 14:54:07Z, HEAD `e2e34aa`) ; `lint:ratchet` sur le clone vierge 69/69 (14:54:55Z) ; 13 fichiers du lot copiés à 14:55:05Z (`cmp` égal ; sha256 agrégé `de93b24b…` égal au worktree et à l'arbre des mutants) ; `node_modules` par `mk-nm.ps1` (`entries: 220  monark: 10  fail: 0`) ; Node v24.15.0 (`header.txt`).
- **Verrou et C-V-4** (`out-2/node-count.txt` ; première attente : `out-1/node-count.txt`, `oracle-run-1.log`) : première attente bornée 14:59:20Z → 16:29:34Z, **non obtenu** (exit 75 au plafond de 90 min ; détenteurs au §0) ; seconde attente lancée à 16:29:48Z ; **pris à 17:06:57Z après 2 220 s**, **22 `node.exe` à la prise** ; sept gates 17:06:57Z → 17:15:15Z ; **50 au lancement du test 42** (17:15:16Z ; le gate `test` était déjà sorti à 0 : ce compte inclut des processus extérieurs à cet oracle, non attribuables ici) ; **26 au rendu** (17:19:34Z) ; verrou rendu à 17:19:34Z (repris à la même seconde par « cp-2 PR-2b-3 »). Une seule suite complète pendant la prise.
- **Sept gates : 7/7 exit 0** (`exits.txt` `3943c3b38a627da59f92bdcfe22ee3a7f55960d7b50b5f3040dcb80b138f65d5`) : `gate:vocab` OK, 322 fichiers (`54da045d…b245`) ; `typecheck` (`03481a8f…2051`) ; `test` : **1 446 tests, 1 443 pass, 0 fail**, 0 annulé, 3 skipped préexistants et déclarés (`sentinel_run_releases_chainstack_lock_on_sigterm` et `sentinel_instrument_out_win32_short_name` sous win32, `u4b_labels_replay_via_main_real_artifact` sans artefact), **aucun ✖** ; ✔ les tests (7)-(11) et (6), les sept tests amendés du paquet, les trois tests amendés de Bell, les contrôles par nom (`public_api_never_reaches_fetch_without_a_ledger_line`, `budget_counts_http_attempts`, `method_cap_stops`, `crosscheck_credits_derived_from_ledger`, `bell_shortpage_probe_transient_error_is_retried`, `ukemi_record_*`, `u4_*`), `public_export_set_is_closed`, `transport_error_never_carries_url_or_key`, `fetch_only_inside_client`, `no_secret_in_repo`, `error_preamble_carries_no_vocabulary_token`, et le test 42 dans la suite (417 s) (`test.log` `0983b55b7cc321cd4ef9e90e9a042ddd0d4db839d8d47e250985cf9cd0efcac0`) ; `lint` (`f845417c…4a4f`) ; **`lint:ratchet` 69/69** (`45ede4ce…6b42`) ; `lang:gate` OK, 0 coup (`b22ac8f8…0dd7`) ; `export:check` OK (`2f9645a9…8f16`).
- **Test 42 à part**, après la suite, même prise : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` ⇒ exit 0, `tests 2, pass 2, fail 0`, `export_public_no_governance_no_french` ✔ en 257 s (`t42/test42.log` `7d1e35332cd213dc82675096a50fbcc6bba47bdb2b9580543b12ac12ebd19499`). `packages/rpc-guard/**` (dont `gtfa-tariff.test.ts`) et `apps/bell/test/**` sont exportés : `lang-gate` du miroir vert.
- Jonctions des trois clones jetables (arbre fusionné, oracle, mutants) retirées par `rm-nm.ps1` (`removed`, 15:0xZ et 17:20:32Z) ; `F:/Monark/node_modules` intact (220 entrées, `@monark` 10).
- **Processus de fond (C-V-4)** : les deux attentes sous verrou (terminées, exit 75 puis 0), le moniteur d'étapes (expiré, 30 min), la recherche trop large (arrêtée) et ses deux orphelins (tués) ; aucun processus de cette passe ne tourne à la remise (contrôlé avant la remise).

## 11. Aucun réseau (greps sur les 295 lignes ajoutées, `greps.txt`, `lot.diff` sha256 `35b0c28f21f9883c7a92fec476de7c803a642a710fba41ab175378c4306923bc`)

- `fetch(` : **0** ; `globalThis.fetch` : 4 (le bouchon de `course` et son commentaire) ; `node:http`, `node:https`, `undici`, `child_process` : 0 ; `https://`, `http://`, `api-key`, `HELIUS_API_KEY` : 0 ; `node:net` et `node:dns` : 1 chacun, pour **armer les pièges** (une socket ou une résolution lève), motif `collect-chain.ts:14-15`. L'hôte des tests est celui du harnais, `example.invalid` ; aucune URL ni clé exportée ou imprimée.
- Aucun appel réseau réel pendant la passe ; aucun navigateur ; aucune lecture de page.

## 12. Ce que je n'ai pas fait, et pourquoi

- Ni mode course, ni `--course-end`, ni `course_reconciled` (1a) ; ni contrôle d'hôte (1c) ; aucun code de DRAND-1a copié dans le worktree (l'union n'existe que sur l'arbre jetable, §8). Aucune édition de l'ADR, des FAITS, de `CHANTIERS.md`, de `apps/bell/src/**`.
- Aucun `git add/commit/stash/checkout/branch` dans le worktree (R-20) ; git en lecture seule (`status`, `rev-parse`, `log`, `diff`, `show`, `worktree list`, `merge-base --is-ancestor`, `ls-files` par le script R-25, `merge-file -p` en sortie standard sur copies) ; trois `git clone --no-local` jetables sous `F:/tmp/dojo/`.
- **Hors verrou** : les passes au niveau du fichier ou du paquet (paquet ×2, Bell ×2, u4 + Ukemi, tests neufs, deux passes de mutants, arbre fusionné) ont tourné hors du verrou d'hôte, pendant les prises de « G2 DRAND-1a », « G2 PR-3b-1 » et « G1 RG-RECONCILE-1c » (précédent DRAND-1a et PR-2b-2) ; la suite complète `npm test` et le test 42 n'ont tourné que sous le verrou (§10).
- Rien sur C: : TEMP, TMP, TMPDIR sur `F:/tmp/dojo/rg1b-work/tmp` et `F:/tmp/dojo/rg1b-mutants/tmp`, cache npm `F:\cache\npm` ; le binaire `node` de `C:\Program Files\nodejs` est exécuté, jamais écrit.

## 13. Items formés et questions (aucun « dû » nu)

- **I-1 (TY-12, ADR D-5 (11) ; propriétaire orchestrateur ; déclencheur : G7 du second fusionné de {1b, DRAND-1a})** : résoudre `ledger.ts` par union (§8) et ajouter à `rpc_guard_gtfa_settled_lines_are_not_attempts` l'assertion `openOperatorLedger(join(dir, "a11"), "helius", 0).priorAttemptsAtOpen() === 2` (forme prouvée : 195/195, M-TY12 tué).
- **I-2 (test (10) en mode course ; propriétaire orchestrateur ; déclencheur : G7 du second fusionné de {1a, 1b})** : `reconcile_counts_settled_lines` reçoit la variante `--course-end` (GO à 140, NO-GO `hard:getTransactionsForAddress` à +1) ; la fenêtre généralisée de 1a doit sommer les `settled` (M-T11 rejoué en mode course).
- **I-3 (verrou v2 ; même déclencheur)** : union des deux verrous v2 : `V2_ISSUES` reçoit `course_reconciled`, un seul `LEDGER_FORMAT = 2`, l'ordre des clés de la ligne de course (champ `course`) de 1a.
- **Q-1 (orchestrateur ; Bell, Q-O2)** : titre du test l.1557 (« credits_recomputed 40 », « 30 cr ») et commentaire l.1383-1384 (« --max-credits 15 … (10+10=20>15) ») gardent l'ancien tarif. Dans les points 2 et 3 (quatre lignes aux corrections post-G2) ou quatrième point (alors porté par BELL-GTFA-CREDITS-1) ? Non touchés ici (clause STOP).
- **Q-2 (orchestrateur, D-2 Q-O1)** : un échec reçu en mode `signatures` est réglé à 0 (§4 point 5) ; à confirmer par ligne datée.
- **Q-3 (orchestrateur, Q-O4)** : `reconcile.ts` de base est le sha « FIGÉ » `6e62cd6a…` ; la décision 255 fait passer 1b **avant** 1a, donc 1b le modifie le premier (→ `f428033f…`). La condition de levée (rejeu de l'enregistreur Ukemi au cp-2 de 1a) doit valoir aussi pour le cp-2 de 1b. Pièce : `ukemi-guard-record.test.ts` 31/31 sur cet arbre et dans l'oracle ; la modification est sans effet sur un grand livre sans ligne `settled` (chainstack et sans-clé n'en écrivent jamais).
- **Q-4 (orchestrateur, D-5 (10))** : « deux modes » lus per-method + aggregate sur cette base (§4 point 10) ; à confirmer.
- **Q-5 (orchestrateur, É-2)** : verrou v2 porté par 1b et par 1a en parallèle, union au second merge (I-3) ; à confirmer.
- **Q-6 (orchestrateur, É-4)** : lecture de « `transport.ts` rend le compte de corps rendus » (§4 point 8) ; à confirmer.
- **Q-7 (orchestrateur, D-5)** : formes concrètes de M-T2 (transport lancé avant `meter`) et de M-T4 (fetch lancé avant `commit`), §7 ; à confirmer.
- **Q-8 (orchestrateur, D-5 R-25)** : 341 mesurées pour 190 estimées (207 avec le verrou v2 transféré), ×1,79 ≤ ×2,1 ; ventilation au §5.
- **Consigne existante touchée par ce lot (ADR D-4, PR-2b-3, arbre `-d3`, hors mission, non joué ici)** : sous Q-O1 (a), une page gTFA en échec reçu écrit `settled` −10 à `limit: 100` ; le relevé simulé de `dojo_history_budget_stops_fail_closed` ne compte donc que les pages en 2xx, ou l'assertion de rapprochement reste avant les scénarios de faute (au cp-2 de PR-2b-3, après les G7 de 1a et 1b).
- Items préexistants dont dépend ce lot, non modifiés : GTFA-FAILED-CALL-BILLING-1 (TY-6 : sous (a), la borne dure ne vaut que si L-2 est exacte ; mesure avant l'acte 1) ; BELL-GTFA-CREDITS-1 ; GTFA-RESIDUAL-1033-1 (C-V-2).

## 14. Livraison

`F:/tmp/dojo/rg1b-deliver/` (script `F:/tmp/dojo/rg1b-work/deliver.sh`) : les 13 fichiers du lot et ce journal (arborescence du dépôt) ; `evidence/` : `open.txt`, `r25-worktree-1.txt`, `r25-clone.txt`, `ratchet-base-pristine.log`, `ratchet-worktree-1.log`, `pkg-red-before-amend.log`, `bell-red-before-amend.log`, `rpcguard-suite-1.log`, `bell-suite-1.log`, `u4-ukemi-1.log`, `lot-tests-pass1.log`, `lot-tests-pass2.log`, `golden-v1-sha.txt`, `greps.txt`, `lot.diff`, `merge/` (sources fusionnées, `merge-tests.log`, `merge-mutant-TY12.tap.txt`), `mutants/` (`RESULTS.txt`, `RESULTS-run1.txt`, `mutants.mjs`), `oracle/` (`header.txt`, `exits.txt`, `node-count.txt`, `t42/exits.txt` de la prise ; `wait-1-node-count.txt`, `oracle-run-1.log`, `oracle-run-2.log` des deux attentes), `node-log.txt`, `bell-suite-2.log`, journaux `mk-nm` et `rm-nm`, scripts (`patch.mjs`, `patch-lines.mjs`, specs, `sync.sh`, `locked.sh`, `run-oracle.sh`, `t42.sh`, `oracle-all.sh`) ; `DELIVERED.sha256` (sha256 de chaque fichier livré ; ceux du lot et du journal relus contre le worktree).

## 15. Advisor

- Outil intégré consulté après l'orientation, avant toute écriture : classement des échecs reçus dans `call`, portée gTFA seule (tous modes), `settle` total ; `commit` rendant le sha sans toucher `append` ; `LEDGER_FORMAT` exporté du module seulement ; harnais `makeClient` sans `settle` (à ne pas déboguer) ; (7) discriminant réservation et règlement ; (10) une course par verdict, témoin sans `data` ; (11) sur les surfaces présentes, forme fusionnée en item ; Bell réduit aux lignes citées, titre et commentaire en question ; R-25 tôt ; cliquet sur clone ; mutants à chaînes concrètes. Chaque point vérifié sur pièce ; conseil, jamais verdict.
- Seconde consultation avant la remise : rendue hors du fichier.

## 16. `git status --short` final (worktree)

```
 M apps/bell/test/rebase-crosscheck.test.ts
 M packages/rpc-guard/src/client.ts
 M packages/rpc-guard/src/ledger.ts
 M packages/rpc-guard/src/reconcile.ts
 M packages/rpc-guard/src/tariff.ts
 M packages/rpc-guard/src/transport.ts
 M packages/rpc-guard/test/caps.test.ts
 M packages/rpc-guard/test/exports.test.ts
 M packages/rpc-guard/test/harness.ts
 M packages/rpc-guard/test/ledger-format-lock.test.ts
 M packages/rpc-guard/test/multi-operator.test.ts
 M packages/rpc-guard/test/tariff.test.ts
?? docs/G1-lot-rpc-guard-reconcile-1b.md
?? packages/rpc-guard/test/gtfa-tariff.test.ts
```

## 17. Corrections après G2 (2026-09-27)

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5` ; worker correcteur, effort max, contexte frais (correcteur ≠ relecteur du G2 ≠ générateur du G1). Mission `F:/tmp/dojo/mission-corr-rg1b.md` (16 l., sha256 `1008d8d0bb12afe06400011c7436d868a0ae563705a02f3e40ce265fa8a6a429`), texte calculé par le script de l'orchestrateur, lu comme tel. Lus en entier : rapport G2 `F:/tmp/dojo/g2-rg1b/G2-report.md` (sha256 `6498eeeb28d36a74805d6e05dc0db28da8128a0c63534149755f2d88ee2712dd`, égal à `G2-report.md.sha256` ; §12 formes, §13 `error_origin`, §14 O-1 à O-5, §15 Q-G2-1 à Q-G2-6), ce journal (§0-§16), l'ADR (165 l., `45ac97e2…b4ab`), le RUNBOOK (§3 étape 6). Formes éprouvées du G2 : `scripts/apply-corrforms.mjs` (sha256 `7751d7f6…06dd`) et `evidence/corrforms.diff` (`d2698cfe…966e`), recalculés égaux à la mission.
- **Base** : worktree `F:/Monark-wt-rg1b`, branche `lot/rpc-guard-reconcile-rg1b`, HEAD `e2e34aa` inchangé. À l'ouverture (19:58:57Z, `F:/tmp/dojo/rg1b-corr/open.txt`) : les 14 fichiers égaux aux livrables du G1 (`sha256sum -c` 14/14 contre `F:/tmp/dojo/rg1b-deliver/DELIVERED.sha256`, `f53ca333…1d43`) ; ADR, RUNBOOK et `bell-methods.ts` égaux à leurs blobs de HEAD ; tronc `lot/etude-suite` à `cc3e11a`, base de fusion `1e179d2` inchangée.
- **Horloge** (`date -u`) : 19:55:15Z ouverture ; 19:58:57Z état d'ouverture (verrou tenu par « corr RG-1a », puis par « corr cp2 PR-2b-3 » depuis 19:58:35Z) ; advisor intégré avant toute écriture ; 20:05:21Z applicateur ; 20:05:37Z essai à sec sur copie ; 20:05:46Z éditions du worktree ; 20:05:55Z → 20:06:35Z `eslint`, `tsc`, `lint:ratchet` ; 20:06:40Z → 20:07:04Z tests, passage 1 ; 20:07:18Z R-25 ; 20:09:21Z pli daté de l'ADR ; 20:09:34Z → 20:10:07Z clone de l'oracle, synchronisation, jonctions, oracle mis en file ; 20:10:31Z → 20:12:08Z clone des mutants, mutants (après, puis avant) ; 20:12:19Z → 20:12:36Z passage 2 et suite du paquet ; 20:12:50Z fusions à blanc ; 20:13:08Z verrou pris ; suite au §17.6.
- **Discipline** : aucun `git` écrivant dans le worktree ni dans `F:/Monark` (lectures `--no-optional-locks` : `status`, `rev-parse`, `branch --show-current`, `show`, `diff`, `grep`, `merge-base`, `log`, `worktree list`, `hash-object` sans `-w`, `ls-files` du script R-25 ; `diff --no-index` et `merge-file -p` sur copies ; worktrees de 1a, 1c, DRAND-1a et `-d3` lus seulement) ; deux `git clone --no-local` jetables sous `F:/tmp/dojo/rg1b-corr/` ; aucun réseau réel ; rien sur C: (TEMP, TMP, TMPDIR sur `F:/tmp/dojo/rg1b-corr/tmp` ou `…/mutants/tmp`) ; huit variables payantes retirées à chaque exécution de test (`nt.sh`, `mutants.mjs`, `oracle-all.sh`) ; suite complète et test 42 sous le seul verrou d'hôte « corr RG-1b ».

### 17.1 Décisions appliquées (liste fermée de la mission)

| Point | Fait | Où | Preuve |
|---|---|---|---|
| C-G2-1 (bloquante, Q-1) | commentaire de RUN 1 au tarif plein (`--max-credits 105`, p1 réserve 100 puis règle 10, p2 : 10 + 100 = 110 > 105 refusée) ; titre : `credits_recomputed 140`, `130 cr` ; formes exactes du G2 §12 | `apps/bell/test/rebase-crosscheck.test.ts` l.1388, l.1562 | test au titre nouveau ✔ (86/86) ; `eslint` 0 |
| C-G2-3 (bloquante, Q-G2-6 = (a)) | la borne à la main d'une fenêtre réparée somme les lignes `attempted` **et** `settled` (réservation + delta signé, ADR D-2) ; forme exacte du §12 | `docs/RUNBOOK-rpc-guard.md:88` | fusion à blanc avec le RUNBOOK de 1a : propre (§17.8) ; aucun test ne lit ce texte |
| C-G2-2 | test (9) : « a timeout » au commentaire ; cas `AbortError` (`DOMException`) et `NetworkError` (rejet non-`Error`, `Object.create(null) as Error`) ; deux lignes `attempted` 100 de plus ; `spent()` = `{attempts: 10, byOperator: {helius: 501}}` ; formes du §12 | `packages/rpc-guard/test/gtfa-tariff.test.ts` l.100, l.106-107, l.120, l.122 | N-1 et N-4 tués par (9) (§17.5) |
| C-G2-4 | « 10 credits per 100 returned on Helius » | `packages/rpc-guard/src/bell-methods.ts:5` | `eslint` 0 ; test 42 (fichier exporté) |
| Q-G2-1 = (a) | ligne datée : TY-3 « réduit (procédure : bin du tronc, RUNBOOK §6 de 1a) ; consigne jusqu'à la fusion de 1a … » ; item RG-OLD-READER-1 formé (contenu, prix, déclencheur, porteur du G2 §14) | ADR l.169 | sonde vi du G2 citée |
| Q-G2-2 = (a) | ligne datée D-2 Q-O1 : classement par nom gardé ; GTFA-FAILED-CALL-BILLING-1 étendu (tout 5xx observé en course relevé au CSV) ; Q-2 du G1 dans la même ligne (§17.9) | ADR l.170 | `transport.ts:231-237` relu |
| Q-G2-3 = oui | I-4 (troisième fusion, déclencheur G7 de 1c, porteur orchestrateur) | ADR l.171 | G2 §11.3 : 193/193 ; mauvaise union rouge |
| Q-G2-4 = oui | DOJO-HISTORY-SETTLED-PAGES-1 formé (porteur, déclencheur, contenu, preuve) | ADR l.172 | G2 §4 : 80/80 |
| Q-G2-5 = oui | BELL-GTFA-CREDITS-1 étendu à `q6-controls.mjs:258` ; `Q6_SHA_G7` postérieur au G7 de 1b exigé ; aucun code Bell | ADR l.173 | `q6-controls.mjs:255-260` relu |
| Q-G2-6 = (a) | C-G2-3 portée par 1b | ADR l.174 | — |

- Les six lignes datées forment une section neuve en fin d'ADR, « Pli des corrections post-G2 de 1b » (l.167-174), ajout seul, sur le modèle du pli de 1a (même forme, même place) ; le tableau des menaces (TY-3) n'est pas réécrit : la ligne datée fait foi.

### 17.2 Fichiers (état final du worktree ; aucun autre)

| Fichier | État | Lignes | sha256 |
|---|---|---|---|
| `apps/bell/test/rebase-crosscheck.test.ts` | corrigé (C-G2-1, +2 −2) | 1 855 | `ad53d9a9f755380887a36ae4df7beb4eeb747aed409d44d493afc5b81d323a53` |
| `packages/rpc-guard/test/gtfa-tariff.test.ts` | corrigé (C-G2-2, +5 −4 ; non suivi) | 169 | `605a3a3c2edf1ce4ffa37ecb71500d5d90fa31fcbab1d2e29a0cc4c6b8ba4523` |
| `packages/rpc-guard/src/bell-methods.ts` | corrigé (C-G2-4, +1 −1 ; entre dans le lot) | 19 | `60a0b2f256bc3e70929996687f3ce840fc53f2bad06af75415720fd3ab1c3975` |
| `docs/RUNBOOK-rpc-guard.md` | corrigé (C-G2-3, +1 −1 ; entre dans le lot ; hors R-25) | 166 | `00b654f5c7c43a918550455bf3abcb739e99a415ad61a1cc995dbfac86206db2` |
| `docs/adr/ADR-RPC-GUARD-RECONCILE-1.md` | + pli daté (ajout seul, +9 ; préfixe octet pour octet égal à `45ac97e2…b4ab`) | 174 | `8ee0e1bcba7580bc9502a4959f5394e8d48757349b814de9b3e9fb6cc1329a12` |
| les onze autres fichiers du lot | inchangés depuis le G1 | — | sha256 du §3 |
| `docs/G1-lot-rpc-guard-reconcile-1b.md` | ce §17 ajouté (préfixe égal au G1) | — | rendu hors du fichier |

- **17 fichiers** changés contre HEAD (14 du G1 + `bell-methods.ts`, RUNBOOK, ADR). 0 octet CR, 0 tabulation, 0 blanc final, LF final dans les cinq fichiers ; aucun caractère hors ASCII ajouté hors de l'ADR (Bell 426 octets avant et après, RUNBOOK 107 et 107). Diff de correction (livrables du G1 et blobs de HEAD → état final) : `evidence/corr.diff` (sha256 `529468fcbdfda0e74fa419ec4341f668ec32d949cd25e131684953b5f2f9b9c1`), +18 −8.
- **Formes exactes** : applicateur `F:/tmp/dojo/rg1b-corr/apply.mjs` (sha256 `f6b2e490269f0211f419d44a1112bba163c1eece3f1f41f4c2820356d138bd0a`), dérivé du `apply-corrforms.mjs` du G2 par `mkapply.mjs` (`diff` : trois ajouts) : les six paires du G2 **verbatim**, plus la paire du RUNBOOK (texte du §12 du G2, comparé à l'octet au rapport), un garde de cible (le worktree ou une copie d'essai) et un refus de CR ; chaque ancre comptée à 1. Essai à sec sur copie : le multiensemble des lignes `+`/`-` des trois fichiers de code et de test est **identique** à `evidence/corrforms.diff` du G2 (15 lignes), la paire du RUNBOOK s'y ajoute seule ; worktree égal à la copie d'essai (`cmp`, quatre fichiers).

### 17.3 R-25 (méthode `ci.yml:82` et `:90`)

- Script `F:/tmp/dojo/pr2-1-r25-methodA.mjs` (sha256 `140be120…d3bf`, inchangé), lecture seule : **348** contre `e2e34aa` et contre la base de fusion `1e179d2` (sorties égales ; `r25-worktree-e2e34aa.txt` sha256 `bf55c5015e2ba83712e0343ce9324d1ca2d318e9d14c3529fa14a57acef148e1`, **égal octet pour octet** au `r25-with-corrforms.txt` du G2). Code **113** (`tariff.ts` 45, `client.ts` 46, `ledger.ts` 7, `reconcile.ts` 7, `transport.ts` 6, `bell-methods.ts` 2) + tests **235** (`gtfa-tariff.test.ts` 169, Bell 19, `ledger-format-lock` 14, `caps` 14, `multi-operator` 8, `exports` 6, `harness` 3, `tariff` 2). ADR, RUNBOOK et journal exclus (`docs/**/*.md`).
- Attendu ≈ 348 (mission) : **348** ; borne des corrections 400 ; STOP 1 150 à 802. Aucune coupe.

### 17.4 Tests

- `gtfa-tariff.test.ts` + `rebase-crosscheck.test.ts` (worktree) : **86/86, deux passages** (20:06:40Z et 20:12:19Z ; `lot-tests-pass1.log` sha256 `149543a8…3fb1`, `lot-tests-pass2.log` `09a07563…a71d`) ; `rpc_guard_gtfa_failure_settlement` ✔ avec ses dix appels (huit issues, `getTransaction` 500, `signatures` 429) ; le titre nouveau (`… credits_recomputed 140 … 130 cr …`) ✔ ; `bell_crosscheck_guarded_resume_without_loss_after_budget_stop` ✔. Le compte reste 86 : les deux cas vivent dans le test (9).
- Suite `packages/rpc-guard/test/*.test.ts` (worktree) : **104/104** (20:12:36Z, `rpcguard-suite-1.log` `894cf550…5cfb`), 0 échec, 0 annulé, 0 sauté.
- `npx eslint` des trois fichiers TS touchés : exit 0 ; `npx tsc --noEmit` : exit 0 ; `npm run lint:ratchet` (worktree) : **69/69** (journal `45ede4ce…6b42`, égal à ceux des oracles du G1 et du G2).
- C-G2-1 change le titre, donc le nom complet du test Bell : `git grep` (worktree) ne trouve que l'identifiant de tête, inchangé (`docs/G0-lot-rpc-guard-reconcile-1.md:81`, `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md:522`) ; aucune référence au nom complet ; mes motifs utilisent des préfixes.

### 17.5 Mutants (copie hors dépôt `F:/tmp/dojo/rg1b-corr/mtree`)

- Arbre : `git clone --no-local --branch lot/rpc-guard-reconcile-rg1b F:/Monark` (HEAD `e2e34aa`), 17 fichiers copiés (`sync.sh`, `cmp` égal), jonctions par `mk-nm.ps1` (sha256 `d70d8aea…fbe4` ; `entries: 220  monark: 10  fail: 0`, `@monark/rpc-guard` résolu dans l'arbre). Jamais le worktree.
- Harnais `mutants.mjs` (sha256 `456cae1ee1d3e2c5bf80dd9ddcc60a98c664f9a85d54735116177b2e954deaa2`) : N-1 et N-4 **aux textes du G2** (`FREE` et `freeAlso` copiés du `g2-mutants.mjs`, `75dd67a9…`, égalité contrôlée par `diff`), plus R-T9, N-2 et N-3 (même famille (9), mêmes textes) en témoins ; ancre comptée à 1 ; témoin d'abord ; un passage `node --test` (TAP) sur les huit fichiers du paquet du G2 (`gtfa-tariff`, `caps`, `exports`, `ledger-format-lock`, `multi-operator`, `tariff`, `ledger`, `reconcile` : 50 résultats) ; **tué ssi un test est `not ok`** ; `client.ts` restauré puis contrôlé au sha256 doré `484ad011…3928` après chaque mutant.

| Id | Mutation (`client.ts`) | Après (test (9) corrigé) | Avant (test (9) du G1, `60dd1aa4…`) |
|---|---|---|---|
| N-1 | délai (`AbortError`) réglé à 0 | **tué** par `rpc_guard_gtfa_failure_settlement` | survit |
| N-4 | rejet non-`Error` (`NetworkError`) réglé à 0 | **tué** par `rpc_guard_gtfa_failure_settlement` | survit |
| R-T9 (témoin) | faute réseau (`TypeError`) réglée à 0 | tué, même test | tué |
| N-2 (témoin) | `NonJsonBody` réglé à 0 | tué, même test | tué |
| N-3 (témoin) | `RedirectBlocked` réglé à 0 | tué, même test | tué |

- Passe « après » 20:11:27Z → 20:11:43Z (`mutants/RESULTS-after.txt` sha256 `1634f9cbf50838001c1a6f84a5af36a06473dda55d24278233edf922eeb5b0ab`) : témoin 50/50, **5/5 tués** ; passe « avant » 20:11:50Z → 20:12:08Z, test du G1 mis en place puis rendu (sha256 revérifié `605a3a3c…4523`, `cmp` égal au worktree) (`mutants/RESULTS-before.txt` `b1c1a8a68a3de64c0c095e867656498e0d99d585b4bb22fbb4c192347b787a40`) : témoin 50/50, 3/5, **N-1 et N-4 survivent** : ce sont les deux cas de C-G2-2 qui les tuent. `client.ts` égal au doré après chaque mutant et en fin de passe.

### 17.6 Oracle : sept gates sur clone, sous verrou d'hôte « corr RG-1b », test 42 à part

- **Arbre** : `F:/tmp/dojo/rg1b-corr/clone` = `git clone --no-local --branch lot/rpc-guard-reconcile-rg1b F:/Monark` (20:09:34Z), HEAD `e2e34aadf14d1a7c80354dccbe0aa16f7dceb7b8`, les **17** fichiers copiés (`sync.sh`, liste tirée du `git status` du worktree, `cmp` égal ; `sync-clone.txt`) ; `git status` de l'arbre : ces 17 seuls (`header.txt`) ; jonctions par `mk-nm.ps1` (`entries: 220  monark: 10  fail: 0`) ; Node v24.15.0 ; aucune sonde ni mutant dans cet arbre ; ce journal y est à l'état du G1 (§17.9).
- **Scripts** (`F:/tmp/dojo/rg1b-corr/`, dérivés de ceux du G2 par substitution des seuls nom et chemin, `diff` à deux lignes chacun) : `locked.sh` (sha256 `629a5904…be38` : `mkdir` atomique de `F:/tmp/oracle-lock`, `owner.txt` « corr RG-1b », attente par pas de 60 s jusqu'à 5 400 s, rendu dans le piège `EXIT`, `node.exe` comptés à la prise et au rendu), `oracle-all.sh` (`b798c5e8…796c` : les sept gates par `npm run`, huit variables payantes retirées par `env -u`, TEMP sur F:, codes capturés directement, sha256 du lot avant et après, puis le test 42 seul, `node.exe` compté à son lancement), `sync.sh` (`5c4168c2…6ba1`), `nt.sh` (`5a1d72c0…cf44`).
- **Processus de fond** : un seul, l'oracle (`bash locked.sh … oracle-all.sh`, PID MSYS 295023, lancé 20:10:07Z, `oracle/pid.txt`), terminé exit 0 à 20:24:53Z ; un moniteur de ses fichiers d'état, terminé avec lui.
- **Verrou et C-V-4** (`oracle/out-1/node-count.txt`, `wait.txt`) : mis en file 20:10:07Z derrière « corr cp2 PR-2b-3 » (pris 19:58:35Z) ; **pris à 20:13:08Z** après 180 s, **23 `node.exe` à la prise** ; sept gates 20:13:08Z → 20:21:00Z ; **22 `node.exe` au lancement du test 42** ; **22 `node.exe` au rendu** ; verrou rendu à 20:24:53Z. Une seule suite complète pendant la prise ; aucune autre passe de ma part pendant la prise.

| Gate | Exit | Fin (`date -u`) | Journal (sha256) | Constat |
|---|---|---|---|---|
| `gate:vocab` | 0 | 20:13:10Z | `54da045d…b245` | « scanned 322 file(s), no forbidden claim » ; égal au G1 et au G2 à l'octet |
| `typecheck` | 0 | 20:13:17Z | `03481a8f…2051` | égal au G1 et au G2 |
| `test` | 0 | 20:20:21Z | `bfbdc65c…381d` | **1 446 tests, 1 443 pass, 0 fail**, 0 annulé, 3 skipped préexistants (`sentinel_run_releases_chainstack_lock_on_sigterm`, `sentinel_instrument_out_win32_short_name`, `u4b_labels_replay_via_main_real_artifact`) : mêmes comptes qu'au G1 et au G2 ; ✔ les tests (6)-(11), `rpc_guard_gtfa_failure_settlement` à dix appels, le titre Bell nouveau, `bell_crosscheck_guarded_resume_without_loss_after_budget_stop`, `crosscheck_credits_derived_from_ledger`, `public_api_never_reaches_fetch_without_a_ledger_line`, `budget_counts_http_attempts`, `method_cap_stops`, `public_export_set_is_closed`, `fetch_only_inside_client`, `no_secret_in_repo`, `ukemi_record_then_unlock_then_reconcile_end_to_end`, et le test 42 dans la suite (407,7 s) ; aucun ✖ ; `dojo_history_budget_stops_fail_closed` vit sur `-d3`, absent de cette branche |
| `lint` | 0 | 20:20:38Z | `f845417c…4a4f` | égal au G1 |
| **`lint:ratchet`** | **0** | 20:20:57Z | `45ede4ce…6b42` | **« lint-ratchet: 69/69 »** ; égal au G1 et au G2 à l'octet |
| `lang:gate` | 0 | 20:20:59Z | `b22ac8f8…0dd7` | 0 coup ; égal au G1 |
| `export:check` | 0 | 20:21:00Z | `2f9645a9…8f16` | « 0 forbidden path, 0 non-exempt French hit » ; égal au G1 |

- **Test 42 à part**, même prise : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` ⇒ **exit 0** (20:24:53Z), `tests 2, pass 2, fail 0` ; `export_public_no_governance_no_french` ✔ en 231,6 s ; `export_public_derived_jobs_are_byte_identical` ✔ (`t42/test42.log` sha256 `75ad689f56d68725058b65d40d607f421dc51762b16410ecfbc1326588c208ac`). `bell-methods.ts` (commentaire C-G2-4) et les tests du lot sont exportés : miroir vert.
- sha256 des 17 fichiers de l'arbre : `lot-sha-before.txt` = `lot-sha-after.txt` = worktree à 20:25Z, avant l'ajout de ce §17 (égalité contrôlée par `diff` ; `lot-sha-before.txt` sha256 `41493dc220120676…`) ; ensuite, seul ce journal diffère (§17.9).
- **Remise (C-V-4)** : verrou repris par « G2 RG-1a » à 20:24:54Z ; jonctions des deux clones jetables retirées par `rm-nm.ps1` (sha256 `b51b5d22…8749` ; `removed` ×2, `rmnm.log`) ; `F:/Monark/node_modules` intact : 220 entrées, `@monark` 10 (20:25:29Z, `monark-nm.txt`) ; aucun processus dont la ligne de commande nomme `rg1b-corr` (24 `node.exe` sur l'hôte, d'autres sessions) ; aucune tâche de fond de cette passe ne tourne.

### 17.7 Aucun réseau (greps sur les lignes ajoutées de `evidence/corr.diff`, `evidence/greps.txt`)

- `fetch(`, `https://`, `http://`, `node:`, `process.env`, `api-key`, `HELIUS_API_KEY`, `undici`, `child_process`, `XMLHttpRequest`, `WebSocket` : **0** ; `globalThis.fetch` : 1, texte préexistant du titre Bell réécrit par C-G2-1 ; noms d'opérateurs : `helius` 5 (libellés du garde et textes préexistants), les seize autres de la liste du G2 : 0.
- Les deux cas neufs du test (9) rejettent dans le bouchon `fetch` de `course()` ; pièges socket et DNS armés à l'import du fichier. Aucun appel réseau réel pendant la passe ; aucun navigateur ; aucune lecture de page.

### 17.8 Fusions à blanc (copies sous `F:/tmp/dojo/rg1b-corr/merge-1a/`, `git merge-file -p`, sortie standard)

- **Instantané** des fichiers de 1a en vol (`F:/Monark-wt-rg`, HEAD `3cd3c0e`, lus seulement) à 20:12:50Z, pendant la passe « corr RG-1a » : ils peuvent encore bouger. **Base** = `3cd3c0e`, base de fusion de `e2e34aa` et `3cd3c0e` (la tête de 1a est un ancêtre de celle de 1b) ; blobs ADR `4655e2f`, RUNBOOK `5b984c2`. `SHA256SUMS.txt` joint.
- **RUNBOOK** : **propre**, 0 marqueur ; l.88 de C-G2-3 présente dans le résultat (les éditions de 1a aux l.83, 92, après 100, 155, 159 et après 166 sont disjointes).
- **ADR** : **un conflit**, ajout contre ajout en fin de fichier : le pli de 1b (l.167-174) contre le « Pli des corrections post-G2 de 1a » (5 lignes, 19:51:16Z). Union mécanique : les deux sections, 1b puis 1a (ordre des fusions), avec une ligne vide entre elles (`merge-file --union` : 178 lignes, 0 marqueur, ligne vide à rétablir). Git le marque, à la différence du doublon silencieux de `LEDGER_FORMAT` (G2 §11.2) : question Q-C2.
- **TY-3 amendé deux fois** : la ligne de 1a (19:51:16Z) amende TY-1 et TY-3 (fenêtre historique sur grand livre partagé ⇒ faux GO possible ; levé par BELL-COURSE-END-1 et le mode course) ; celle de 1b amende TY-3 (arbre antérieur à 1b lisant des `settled`). Deux causes distinctes, chacune avec son item ; après l'union, la ligne porte deux statuts datés : question Q-C3.
- **Autres lots** : DRAND-1a (`1252140`), 1c (`72214c9`) et PR-2b-3 (`0746156`) ne touchent aucun des cinq fichiers corrigés (`git diff --name-only` depuis leur base de fusion avec `e2e34aa`, et `git status`). Cette passe ne change aucune ligne exécutable du paquet (un commentaire de `bell-methods.ts`) ; les deux cas neufs de (9) suivent le chemin du cas `TypeError` déjà présent dans les arbres fusionnés du G2 (`fetch` rejeté ⇒ `raise` ⇒ réservation gardée). Les preuves de fusion du G2 (DRAND 195/195, 1c 193/193, `-d3` 80/80) ne sont pas rejouées ici : elles restent à rejouer aux actes I-1 et I-4 (§17.10).
- **O-1 du G2** (phrase « an over-count, never a false GO, TY-3 » du RUNBOOK de 1a) : absente de l'instantané de 20:12:50Z ; ses l.196-199 disent qu'un arbre épinglé ancien ignore `--course-end` (« a GO there is NOT a course GO ») et font contrôler que la ligne écrite est `course_reconciled` : c'est la procédure que cite le nouveau statut de TY-3 (bin du tronc, RUNBOOK §6 de 1a).

### 17.9 Écarts déclarés, et ce que je n'ai pas fait

- **Q-2 du G1 consignée hors de la liste fermée** : dans la ligne datée D-2 Q-O1 (ADR l.170), une proposition « échec reçu en mode `signatures` réglé à 0 (−10) ». Source : la décision de l'orchestrateur dans la mission G2 (`1126c2d8…0104` : « Q-2 : échec en mode signatures réglé −10, ligne datée D-2 ») et le G2 §10 (« la ligne datée n'est pas encore dans l'ADR »). La mission de correction n'en parle pas ; l'orchestrateur peut rayer la proposition.
- **Une commande de plus de 6 Ko** : l'écriture par heredoc de la deuxième partie de ce §17 (6 561 octets écrits) ; fichier contrôlé ensuite (UTF-8 aller-retour, 0 CR, 0 antislash, 42 lignes, fin intacte). Toutes les autres commandes : < 6 Ko.
- **Arbre de l'oracle** : il porte ce journal à l'état du G1 (ce §17 est écrit pendant la prise) ; `docs/**` n'est lu par aucun gate (`gate:vocab` lit `packages/*/src` et `apps/site` ; `lang:gate` et `export:check` les seuls fichiers exportés, `docs/**` exclu). L'ADR de l'arbre est l'état final (pli écrit avant le clone).
- Non fait, par mandat : aucune ligne hors de la liste fermée (`client.ts`, `transport.ts`, `ledger.ts`, `reconcile.ts`, `tariff.ts` inchangés) ; O-3 et le doublon silencieux de `LEDGER_FORMAT` non portés à I-3 (Q-C1) ; aucune fusion ni résolution avec 1a, 1c ou DRAND-1a (actes de l'orchestrateur) ; aucune édition de `CHANTIERS.md`, des FAITS, de `apps/bell/src/**` ni de `apps/bell/ops/**` ; jonctions `node_modules` du worktree gardées (§3) ; aucun `git add/commit/stash/checkout`.
- **Hors verrou** (précédent du G1 §12 et du G2 §16) : passes par fichier (tests du lot ×2, suite du paquet, `eslint`, `tsc`, cliquet, mutants ×2) avant la prise, pendant celle de « corr cp2 PR-2b-3 » ; la suite complète et le test 42 n'ont tourné que sous « corr RG-1b » ; aucune passe de ma part pendant la prise.

### 17.10 Questions formées (aucun « dû » nu)

- **Q-C1 (orchestrateur ; I-3, O-3 et §11.2 du G2)** : I-3 (§13) ne dit pas que le doublon `export const LEDGER_FORMAT = 2;` de la fusion 1a × 1b est **silencieux pour git** (aucun marqueur ; `tsc` et tout test qui importe `ledger.ts` le rougissent), ni que l'ordre des clés par genre de ligne est tenu hors de (6) (N-18 et N-27 survivent à (6)). Amender I-3 par ligne datée : « un seul `LEDGER_FORMAT = 2` (doublon silencieux pour git) ; ordre des clés de `course_reconciled` (champ `course`) épinglé dans (6) » ? Déclencheur : G7 du second fusionné de {1a, 1b} ; porteur : orchestrateur. Oui / non.
- **Q-C2 (orchestrateur ; ADR, fusion de 1a)** : joindre aux actes I-2/I-3 le conflit mesuré de l'ADR (§17.8 : union = les deux plis, 1b puis 1a, une ligne vide entre eux) ? Oui / non.
- **Q-C3 (orchestrateur ; TY-3)** : après l'union, composer les deux statuts datés de TY-3 en un seul, par exemple « réduit : (i) arbre antérieur à 1b ⇒ RUNBOOK §6 de 1a et RG-OLD-READER-1 ; (ii) fenêtre historique sur grand livre partagé ⇒ BELL-COURSE-END-1 et le mode course » ? Déclencheur : G7 du second fusionné de {1a, 1b}. Oui / non.
- **Rappel PAROXYSME** : TY-3 « réduit » ⇒ RG-OLD-READER-1 (formé : prix, déclencheur, porteur) ; TY-6 « réduit jusqu'à la mesure » ⇒ GTFA-FAILED-CALL-BILLING-1 (étendu aux 5xx). Aucune limite nouvelle sans item dans cette passe. Preuves de fusion à rejouer : nommées par I-1 (195/195) et I-4 (193/193).

### 17.11 `error_origin` (repris du §13 du G2 ; à assigner au G7)

| Point | `error_origin` proposé |
|---|---|
| C-G2-1 | G0 (planificateur, ADR D-2 : la liste fermée des amendements Bell omet le titre et le commentaire) ; le G1 s'est arrêté et a demandé (Q-1) |
| C-G2-2 | G0 (D-5 (9) omet le « délai » de D-2), G1 en second |
| C-G2-3 | G0 (D-2 « Lecteurs » et D-4 n'inventorient que des lecteurs de code), G1 en second |
| C-G2-4 | G1 (mentions du prix de gTFA non recherchées dans le paquet) |
| Q-G2-1 (TY-3) | G0 (« sur-compte ⇒ jamais un faux GO », faux sous une bande souple, mesuré) |
| Q-G2-3 (conflit `exports.test.ts` avec 1c non déclaré) | G1 (inventaire du §8 incomplet) |
| Q-G2-4 (item nommé, non formé) | orchestrateur |
| Q-2 sans ligne datée jusqu'ici (§17.9) | orchestrateur (proposé par cette passe) |
| commande > 6 Ko (§17.9) | correcteur (cette passe) ; sans effet sur le lot |

### 17.12 Livraison

`F:/tmp/dojo/rg1b-corr-deliver/` (script `F:/tmp/dojo/rg1b-corr/deliver.sh`) : les 17 fichiers changés (arborescence du dépôt, relus contre le worktree par `cmp`), dont l'ADR et ce journal ; `evidence/` : état d'ouverture, applicateur et essai à sec, journaux (`eslint`, `tsc`, cliquet, tests du lot ×2, suite du paquet), R-25 (deux bases), `corr.diff`, `greps.txt`, le pli de l'ADR, synchronisations, jonctions ; `evidence/merge-1a/` (instantané, bases, résultats, `SHA256SUMS.txt`) ; `evidence/mutants/` (`RESULTS-after.txt`, `RESULTS-before.txt`, un TAP par mutant et par passe) ; `evidence/oracle/` (`header.txt`, `exits.txt`, `node-count.txt`, `wait.txt`, `lot-sha-before.txt`, `lot-sha-after.txt`, journaux des sept gates, `t42/`) ; `scripts/` ; `DELIVERED.sha256` (sha256 de chaque fichier livré ; celui de ce journal y est rendu, hors du fichier).

### 17.13 Advisor

- Outil intégré consulté après l'orientation, avant toute écriture : pli de l'ADR en fin de fichier, ajout seul, sur le modèle du précédent (le conflit avec le pli de 1a est à mesurer et à déclarer, pas à esquiver par une insertion au milieu) ; Q-2 du G1 consignée dans la ligne D-2 Q-O1 et déclarée hors liste ; applicateur propre au worktree, paires du G2 verbatim, preuve d'exactitude par le multiensemble contre `corrforms.diff` ; 17 fichiers (`bell-methods.ts`, ADR et RUNBOOK entrent dans le lot) dans les synchronisations et les livrables ; oracle mis en file tôt ; mutants N-1 et N-4 aux textes du G2, passes « après » et « avant » ; questions formées pour O-3 et le conflit de l'ADR ; motifs de test par préfixe après le renommage. Chaque point vérifié sur pièce ; conseil, jamais verdict.
- Seconde consultation avant la remise : rendue hors du fichier.

### 17.14 `git status --short` final (worktree, `--no-optional-locks`)

```
 M apps/bell/test/rebase-crosscheck.test.ts
 M docs/RUNBOOK-rpc-guard.md
 M docs/adr/ADR-RPC-GUARD-RECONCILE-1.md
 M packages/rpc-guard/src/bell-methods.ts
 M packages/rpc-guard/src/client.ts
 M packages/rpc-guard/src/ledger.ts
 M packages/rpc-guard/src/reconcile.ts
 M packages/rpc-guard/src/tariff.ts
 M packages/rpc-guard/src/transport.ts
 M packages/rpc-guard/test/caps.test.ts
 M packages/rpc-guard/test/exports.test.ts
 M packages/rpc-guard/test/harness.ts
 M packages/rpc-guard/test/ledger-format-lock.test.ts
 M packages/rpc-guard/test/multi-operator.test.ts
 M packages/rpc-guard/test/tariff.test.ts
?? docs/G1-lot-rpc-guard-reconcile-1b.md
?? packages/rpc-guard/test/gtfa-tariff.test.ts
```
