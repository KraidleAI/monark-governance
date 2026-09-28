claude-opus-5-5[1m]

# G1 — RPC-GUARD-RECONCILE-1a RECONCILE (lot rpc-guard, ADR-RPC-GUARD-RECONCILE-1, D-1 et D-5) : la fenêtre d'une course (`--course-end <sha256>`), l'issue `course_reconciled`, le sha rendu par `unlock`, le verrou de format v2 et la borne de réparation de course (D-FS-5)

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5`. Worker, effort max (mission), contexte frais. Générateur ≠ réviseur (G2 à venir, instance séparée).
- **Mission** : `F:/tmp/dojo/mission-g1-rg1a.md` (sha256 `b4a9e5a821ae088e29dccfd1318dbe63146a78d4f18c7851ef7db395f2b0baec`, préfixe égal à celui de la tâche), texte calculé par le script de l'orchestrateur, lu comme tel ; `date -u` à l'ouverture : 14:23:23Z.
- **Base / HEAD** : worktree `F:/Monark-wt-rg`, branche `lot/rpc-guard-reconcile-1`, HEAD `3cd3c0eb58d4b30c54444ef4b488875aba50ec24` (arbre `29153a53…`) ; **`git status --short` vide à l'ouverture** (14:23:23Z, puis 14:36:11Z : `F:/tmp/dojo/rg1a-work/open.txt`). Base de fusion avec le tronc : `d4c12e9` ; les deux commits G0 (`bbdfd1e`, `3cd3c0e`) ne portent que des `docs/**/*.md` (exclus de R-25). **Écart déclaré** : la décision 255 annonce trois worktrees depuis le tronc `1e179d2` ; `-rg1b` et `-rg1c` le portent (`e2e34aa`, `72214c9`, même arbre `2abba554…` = `1e179d2` + G0), `-rg` non (Q-1).
- **Processus `node` (C-V-4)** : 30 à 14:34:37Z, 31 à 14:36:11Z (ouverture) ; à la prise et au rendu du verrou de l'oracle : §12. Une seule suite complète à la fois ; aucun test lancé pendant la prise du verrou par l'oracle.

## 0. Journal (`date -u`)

| Heure | Fait |
|---|---|
| 14:23:23Z → 14:36:11Z | mission (sha256 vérifié) ; worktree, HEAD, arbre propre ; ADR de lot en entier (165 l.) ; code et tests du paquet ; rapport cp-1 ; journal G1 DRAND-1a (forme) ; diff DRAND-1a (lecture seule) ; `-d3` (lecture seule) ; `ci.yml:82` ; verrou d'hôte tenu par « G2 DRAND-1a » ; `node.exe` 30 puis 31 |
| 14:36:11Z | `mk-nm.ps1` sur le worktree (`entries: 220  monark: 10  fail: 0`) |
| 14:36:20Z → 14:36:27Z | suite `packages/rpc-guard/test` de la base : **99/99** (`rpcguard-baseline.log`) |
| 14:3xZ | advisor intégré, avant toute écriture (§17) |
| 14:3xZ → 14:4xZ | `client.ts`, `ledger.ts`, `reconcile.ts`, `cli.ts`, bin (éditions à ancre exacte) ; suite du paquet : **97/99**, rouges = les deux tests déclarés de `repair-tail.test.ts`, sur les lignes déclarées (l.84, l.292) |
| 14:4xZ → 14:49:28Z | amendements de `repair-tail.test.ts` (4 lignes) ; `course-window.test.ts` écrit ; `ledger-format-lock.test.ts` amendé (ligne dorée calculée hors paquet, §4 point 6) ; trois fichiers : 16/16 au premier passage |
| 14:49:43Z → 14:50:41Z | suite du paquet 104/104 ; `tsc --noEmit` exit 0 ; `eslint` des 7 fichiers exit 0 ; règles du cliquet sur les 3 fichiers de test du lot : 0 coup ; `lang-gate` OK ; `gate:vocab` OK ; R-25 = 354 |
| 14:52:00Z → 14:53:57Z | oracle différentiel (§8) : 2 000 scénarios, **6 000/6 000 identiques** |
| 14:54:35Z → 14:55:04Z | clones `--no-local` : mutants (`3cd3c0e`), oracle (`72214c9`, arbre `2abba554`) ; synchronisation ; `mk-nm.ps1` ×2 (`220 / 10 / 0`) |
| 14:56:09Z → 14:56:30Z | mutants, passe 1 : 19/19 |
| 14:56:51Z → 14:58:10Z | sensibilité de l'oracle différentiel : M-R5 et P-11 ⇒ DIFFERENT |
| 14:58:20Z → 14:59:39Z | `apps/sentinel/test/ukemi-guard-record.test.ts` : 31/31 |
| 15:00:20Z → 15:02:54Z | arbre de composition `-d3` ; `dojo_history_budget_stops_fail_closed` : témoin (garde de base) ✔, lot 1a ✔ ; sonde en mode course ✔ (§10) |
| 15:03Z | fusion à blanc `git merge-file -p` avec DRAND-1a : 0 conflit (§11) ; sonde « relevé non numérique » sur le code de base (Q-5) |
| 15:03:55Z | verrou d'hôte tenu par « G1 RG-RECONCILE-1c » depuis 14:58:03Z |
| 15:04Z → 15:06Z | RUNBOOK §6 et §3 étape 6 ; sonde TY-3 sur le code de base (§8) ; scripts de l'oracle ; docstring D-FS-5 corrigée (commentaire seul, §4 point 15) |
| 15:06:50Z → 15:07:10Z | arbres resynchronisés ; **mutants, passe 2 (fait foi) : 19/19** |
| 15:07:21Z → 15:07:59Z | trois fichiers du lot, deux passages : 16/16 ×2 ; suite du paquet 104/104 ; `tsc` 0 ; `eslint` 0 |
| 15:08:06Z | oracle lancé en attente du verrou |
| 15:08:17Z → 15:11:55Z | R-25 finale = 354 ; oracle différentiel sur le `reconcile.ts` final : 6 000/6 000 ; Ukemi 31/31 ; `-d3` (sonde) ✔ ; `-d3` non patché (version déplacée `2a7314e5…`) ✔ |
| 15:12:30Z | greps (§13) ; `lot.diff` |
| 15:14:06Z | verrou pris après 360 s ; 25 `node.exe` ; sept gates puis test 42 (§12) |
| 15:1xZ → 15:2xZ | pendant la prise (aucun test de ma part) : journal écrit ; seconde consultation de l'advisor (§17) ; jonctions des clones mutants et `-d3` retirées (15:23:13Z → 15:23:21Z) |
| 15:21:57Z → 15:25:34Z | **sept gates : 7/7 exit 0**, `lint:ratchet` **69/69**, suite 1 443/1 446 (0 échec, 3 sauts préexistants) ; test 42 seul 2/2 ; 23 `node.exe` au test 42 et au rendu ; **verrou rendu à 15:25:34Z**, répertoire absent à 15:25:47Z ; 0 processus de mes exécutions ensuite |
| 15:26:01Z → 15:26:55Z | jonctions du clone de l'oracle retirées ; `F:/Monark/node_modules` intact (218, `@monark` 10) ; cliquet mesuré sur le worktree (base + lot) : **76/69**, dont 7 coups à `test/lang-gate-routing.test.ts:65-66` (Q-1) |
| 15:2xZ | §12, §15 et §17 complétés ; livraison `F:/tmp/dojo/rg1a-deliver/` (§16) |

## 1. Sources (niveau) et entrées

- **[lu]** ADR `docs/adr/ADR-RPC-GUARD-RECONCILE-1.md` (165 l., sha256 `45ac97e226272c66d7b01d1986471d76b96aec4c3206e429287b580d4db9b4ab`), en entier ; le « Pli cp-1 » (C-V-1 à C-V-4, O-1, O-3, Q-O4 précisé, décision 255) et la ligne datée 14:08Z (Q-O1 à Q-O7) priment.
- **[lu]** rapport cp-1 `docs/dojo/rapports/CP1-rg-reconcile-1-2026-09-27.md` (`ea8c71df…b423`) ; journal G0 `docs/G0-lot-rpc-guard-reconcile-1.md` (`0d4237e4…f2`, recherches ciblées).
- **[lu]** précédent de forme : `docs/adr/ADR-RPC-GUARD-DRAND-1.md` (`3048c5f2…4bbb`), journal G1 DRAND-1a (`F:/Monark-wt-drand/docs/G1-lot-rpc-guard-drand-1a.md`, non committé) et diff DRAND-1a de `client.ts`/`ledger.ts` (lecture seule, **non copiés**, §11).
- **[lu]** code de base (sha256 au HEAD) : `reconcile.ts` `6e62cd6a…a5aa` (= le sha gelé, GARDE l.1210), `ledger.ts` `625c759f…46cb`, `client.ts` `6553556c…d50f`, `cli.ts` `dccbe95f…7d20`, `lock.ts` `6655a9c8…c244`, `guarded.ts` `a36fa005…fab6`, `repair.ts` `e997c6fd…6324`, `index.ts` `db2908e9…c5c8`, bin `aadd8983…e745` ; tests `harness.ts` `9188c606…c6b3`, `ledger-format-lock.test.ts` `699546fd…c9d4`, `repair-tail.test.ts` `de8880b8…e11e`, `reconcile.test.ts`, `lock.test.ts`, `exports.test.ts`, `durable.test.ts` (règles du scan, l.255-299) ; `docs/RUNBOOK-rpc-guard.md` `ae0c283a…c2e`.
- **[lu]** consommateurs de `runCli unlock` (recherche) : `apps/{dojo,bell,sentinel}/src/**`, `scripts/census/u4-guard.mjs`, tests `lock.test.ts:33`, `ukemi-guard-record.test.ts:545`, `guard-scripts-u4.test.ts:432` : tous ignorent le résultat ou n'assertent que `exitCode` ; seul `repair-tail.test.ts` (l.84, 292, 304, 320) l'asserte en entier (amendements déclarés par l'ADR).
- **[lu]** `.github/workflows/ci.yml:82` et `:90` (pathspec et métrique de R-25).

## 2. Interfaces

```ts
// packages/rpc-guard/src/client.ts
type Outcome = "attempted" | "refused" | "reconciled" | "unlocked" | "course_reconciled";
// packages/rpc-guard/src/ledger.ts
export const LEDGER_FORMAT = 2;                                             // PAS dans index.ts (précédent DURABLE_FS)
interface CycleLedgerEntry { …; network?; course?: { from: string; to: string }; reason?; entry_sha256 }   // course : après network, avant reason
interface CycleLedger { …; appendChained(outcome, byOpMethod, credits, reason?, course?): CycleLedgerEntry }
// packages/rpc-guard/src/reconcile.ts
export interface CourseRow { count: number; delta: number; verdict: Verdict }
export interface CourseTable { methods: Record<string, CourseRow>; total: CourseRow }
interface ReconcileResult { …; perMethod?: CourseTable }                   // mode course seulement
export function courseEndRefusal(cycleDir, op, to): string | undefined     // lecture pure, avant verrou ; PAS dans index.ts
export function runReconcile(ledger, before, after, cycle, mode = "per-method", courseEnd?: string): ReconcileResult
// packages/rpc-guard/src/cli.ts
interface CliResult { exitCode; verdict?; reason?; unlocked?: string; perMethod?: CourseTable }
//   reconcile … [--course-end <sha256>]  |  unlock … ⇒ { exitCode: 0, unlocked: <entry_sha256 de la ligne unlocked> }
// bin/rpc-guard.mjs : `unlocked <sha>\n` ; en mode course, 2e ligne = JSON.stringify(perMethod)
```

## 3. Fichiers (modifiés ou créés ; aucun autre)

| Fichier | État | Lignes | `git diff --numstat` | sha256 |
|---|---|---|---|---|
| `packages/rpc-guard/src/reconcile.ts` | modifié | 158 | 67 21 | `429c543810f6a2722562556dd8ee92a7817fa6ecacb756e7ee7c4c17d78d3523` |
| `packages/rpc-guard/src/cli.ts` | modifié | 52 | 13 8 | `94fc2a056fbee4e99a4bd6524ff16834b270676f0c01866a2eb8b0de588d0f2c` |
| `packages/rpc-guard/src/ledger.ts` | modifié | 217 | 10 3 | `e32bf1714b4c034a138d04b67eb8cc68ee7f84a118841d477beec39287eda48e` |
| `packages/rpc-guard/src/client.ts` | modifié | 139 | 1 1 | `5f96c62a71647a05986d95ea854f01d23fad1d2ac071cfd71ddcbc3720bc8cdc` |
| `packages/rpc-guard/bin/rpc-guard.mjs` | modifié | 36 | 2 0 | `44842f8457a9dfdd0c19bd05fa55b8f0af26479eda71d28d0c8d89afbfd76974` |
| `packages/rpc-guard/test/course-window.test.ts` | créé | 182 | (non suivi) | `6c680f38e273fead281ef9c153a039c8b5e9b6a5aa8eb66ee4b7b1bf99e6ba4b` |
| `packages/rpc-guard/test/ledger-format-lock.test.ts` | modifié | 103 | 36 2 | `8833401bf972d0f0493c67cb9eb26f7db1b85bf31b1141457ca0a4297f8e087f` |
| `packages/rpc-guard/test/repair-tail.test.ts` | modifié (4 lignes déclarées par l'ADR D-5) | 324 | 4 4 | `f086ac0c3cd959176d7b9c53316819172bce94ea1fe408006b6173929e1e7dca` |
| `docs/RUNBOOK-rpc-guard.md` | modifié (§6 neuve, §3 étape 6, renvois de lignes ; hors R-25) | 209 | 47 4 | `e7e618dacbf5a5e509b70d8f5ea9d12fdfa85d063de4a15fe35c180513ad8c20` |
| `docs/G1-lot-rpc-guard-reconcile-1a.md` | créé (ce journal, hors R-25) | — | — | rendu hors du fichier |

- Inchangés (`git diff --stat HEAD` vide) : `lock.ts` (`runUnlock` rend déjà l'entrée, `lock.ts:39-44`, ADR D-1), `index.ts`, `guarded.ts`, `transport.ts`, `tariff.ts`, `repair.ts`, `harness.ts`, `apps/**`, `package*.json`, `tsconfig.json`, `docs/adr/**`. Aucune dépendance, aucune fixture.
- 0 octet CR, 0 caractère hors ASCII dans les huit fichiers de code et de test (mesuré par `node`).
- `node_modules` du worktree : jonctions de `mk-nm.ps1` (ignoré par `.gitignore`), laissées pour le G2 ; à retirer par `rm-nm.ps1 -Tree F:\Monark-wt-rg` si l'orchestrateur le veut.

## 4. Choix déclarés (jamais silencieux)

1. **Refus avant tout verrou, par lecture pure.** `courseEndRefusal` lit `<op>.jsonl` (`readFileSync` + `parseEntries`) ; jamais `openOperatorLedger` avant le verrou, qui peut guérir la tête et supprimer un `<op>.head.tmp` orphelin (actes réservés au porteur du verrou : un écrivain vivant peut les posséder). Résidu déclaré : une ligne déchirée par un append concurrent lève (exit 2, fail-closed). Cette lecture **ne vérifie pas la chaîne** : une ligne `unlocked` forgée passe le contrôle d'argument, puis `openOperatorLedger` lève sous le verrou (chaîne ou tête, C-V-8) : fail-closed, aucune ligne. `ensureCycleDir` reste en tête (précédence de C-8) : un cycle inconnu crée un répertoire vide, sans ligne ni verrou. Q-3.
2. **`--course-end` sans valeur** : `rest.includes` puis `need` ⇒ erreur d'usage, jamais un repli silencieux sur le mode historique (piège de `arg()` ; sonde P-2). Le message ne cite jamais la valeur (une clé collée par erreur ne s'imprime pas).
3. **`runReconcile` exporté** : refus = exception (défensive, aucune ligne ; le chemin servi refuse avant). Sa docstring nomme O-1 (l'invariant « aucune ligne de rapprochement dans une course » ne vaut que sur le chemin servi) et le mode `since-last-reconciled`.
4. **Tableau Q-O5** : `perMethod = {methods: {<m>: {count, delta, verdict}}, total: {count, delta, verdict}}` ; verdict d'une ligne = sa borne dure ; `total.verdict` = verdict du rapprochement ; modes agrégés : `total` seul. Rendu en mode course seulement, une fois les bornes évaluées (absent pour un refus d'argument, `rollover`, `repaired_in_window` et les relevés de forme refusée). En mode historique, `CliResult` garde sa forme d'avant (`{exitCode, verdict, reason?}`, que `repair-tail.test.ts` asserte en entier). La boucle par méthode calcule toutes les lignes et nomme le **premier** violateur dans l'ordre du `Set`, comme le retour anticipé d'avant (§8 et sonde P-11). Q-4.
5. **Ensemble fermé v2 en 1a = cinq issues** (sans `settled`, qui n'a aucun producteur en 1a : règle Branchement). Verrou double : `tsc` (`V2` doit égaler l'union `Outcome` : `satisfies` puis `Exclude` vers `never`) et exécution (les chemins servis écrivent exactement ces cinq genres, clés du cœur dans l'ordre, `course` après `credits_derived` et avant `reason`). `settled` rejoint à la fusion avec 1b (union, §11). `LEDGER_FORMAT` exporté de `ledger.ts` pour le verrou, non exporté par `index.ts` (« non exportée » lu comme « non publique », précédent `DURABLE_FS`). Q-2, Q-7.
6. **Ligne dorée v1** : une ligne `unlocked` (le genre que désigne un `course_id`), littérale, `tariff_version` littéral (jamais la constante, que 1b déplace) ; son sha (`2691d784…3677`) est calculé **hors du paquet** (JSON écrit à la main, `node:crypto`) et égal à la sortie de la primitive de base (`ledger.ts` `625c759f…`, `F:/tmp/dojo/rg1a-work/golden/`).
7. **Fichier** : les tests (1)-(5) vivent dans `course-window.test.ts` (l'ADR ne nomme pas le fichier) ; pièges socket et DNS armés à l'import.
8. **Test (1)** : gTFA appelé avec `["addr", {limit: 100}]` : 10 crédits sous le tarif actuel **et** sous 1b (stub sans tableau `data` ⇒ aucune ligne `settled`) : le test ne bouge pas à la fusion de 1b. Les courses A et C dépassent chacune la bande souple (60 > 50) et portent gTFA : une fenêtre qui déborderait sur A (M-R1) ou C (M-R2) ne peut répondre comme B par chance de bande. Frontières produites par `openGuardedClient` → appels → `runCli unlock`, `--course-end` = sha rendu (C-V-3) ; assertions par le chemin servi seul (O-1).
9. **Test (2)** : la discrimination « avant verrou » = un verrou vivant tenu par le test : chaque refus rend NO-GO (jamais `LockHeldError`), un sha valide rend `LockHeldError` ; instantané de tous les fichiers du répertoire de cycle avant et après chaque refus (idiome `snapshot()` de `repair-tail.test.ts`). TY-2 : sha d'une ligne `unlocked` d'un autre cycle et d'un autre opérateur, `LEDGER_GENESIS`, une ligne `attempted`.
10. **Test (4)** : bornes par enregistrements écrits à la main (niveau unitaire, comme `reconcile_reads_the_repair_journal_per_window`), plus **une** composition réelle : un écrivain enfant meurt (queue NUL), `repair-tail` servi, `unlock` servi (ligne `to` écrite après la troncature, L = fin) ⇒ NO-GO `repaired_in_window`.
11. **Test (5)** : le bin imprime `unlocked <sha>` et rien d'autre (expression `^unlocked [0-9a-f]{64}\n$` : la seule surface nouvelle du bin, sous la discipline de fuite d'Ukemi) ; ce sha, repassé en `--course-end` au bin, rapproche **cette** course (2e ligne = le tableau) ; la genèse est refusée sans tableau.
12. **RUNBOOK** (docs, hors R-25) : §6 neuve (procédure de course : sha rendu par `unlock`, CSV exact, deux lectures égales, bin du tronc fusionné, lecture de la sortie, refus, ligne `course_reconciled`, journal) ; un paragraphe « mode course » en §3 étape 6 ; renvois `reconcile.ts:73`/`:74` devenus `:114`/`:115` (mes lignes ont déplacé ces deux contrôles). Q-8.
13. **Nom** : `ledgerRunSinceLastReconciled` devient `ledgerRunInWindow` (sa définition et son appel changeaient de toute façon : 0 ligne de plus) ; le mode historique est nommé `since-last-reconciled` dans l'en-tête et les docstrings, sans champ nouveau dans le résultat.
14. **Constante de frontières** : `COURSE_BOUNDARIES = {unlocked, reconciled, course_reconciled}` ; `windowStart` (mode historique) inchangé, à l'octet.
15. **Retouche de commentaire après la passe 1** (15:06Z) : la docstring de `repairedInWindow` disait « That NO-GO line closes the window » pour les deux modes ; une fenêtre de course ne se ferme jamais (une réexécution est signalée de nouveau). Réécrite à nombre de lignes égal (`5c33efda…` → `429c5438…`, commentaire seul) ; passe 2 des mutants, oracle différentiel, Ukemi et `-d3` rejoués sur le fichier final.
16. **Trou de couverture déclaré** : le mode `aggregate-calibration` en mode course n'a pas de cas unitaire (chemin de code partagé avec `aggregate`, que le test (1) couvre en mode course ; l'oracle différentiel ne l'exerce qu'en mode historique, 52 cas `calibration_soft:*`). Non ajouté à ce G1 (R-25) ; à trancher au G2.

## 5. R-25 (méthode `ci.yml:82` et `:90`, base `3cd3c0e`)

- Script `F:/tmp/dojo/pr2-1-r25-methodA.mjs` (sha256 `140be120c7db04b27d664e665e639973425e350fd0713a5256cf61660d78d3bf`, inchangé depuis PR-1b-2) : pathspec de `ci.yml:82` extrait du fichier (20 éléments), `git diff --numstat <base>` pour les suivis, `--no-index` pour les non suivis, métrique insertions + suppressions ; aucune écriture git.
- **354** (`r25-final.txt`, 15:08:17Z ; même valeur contre la base de fusion `d4c12e9`) = code **126** (`reconcile.ts` 67 + 21, `cli.ts` 13 + 8, `ledger.ts` 10 + 3, `client.ts` 1 + 1, bin 2) + tests **228** (`course-window.test.ts` 182, `ledger-format-lock.test.ts` 36 + 2, `repair-tail.test.ts` 4 + 4). Le RUNBOOK et ce journal sont exclus par le pathspec.
- Estimation ascendante 184 (ADR D-5) ; dérive **×1,92** ; **≤ 386** (×2,1) : la coupe 1a (i)/(ii) n'est pas posée ; STOP 1 150 à 796 lignes. Écarts : `reconcile.ts` 88 contre 48 (tableau Q-O5 à boucle complète et premier violateur ≈ 12, en-tête et docstrings D-1/O-1/D-FS-5 ≈ 25, refus avant verrou ≈ 5) ; tests (1)-(5) 182 contre 82 (en-tête, pièges et outillage ≈ 30 : producteur de course, lecteurs, instantané ; composition réelle de réparation ≈ 8 ; bin ≈ 15 ; tableau exact des deux modes) ; (6) 38 contre 14 (production servie des cinq genres de ligne, ligne dorée). Q-9.

## 6. Tests

| Test | Fichier | Couvre | Mutants visés |
|---|---|---|---|
| (1) `reconcile_course_window_isolates_one_course` (nouveau) | `course-window.test.ts` | trois courses A (60), B (23), C (60) sur un grand livre, produites par `openGuardedClient` → appels → `runCli unlock` ; `--course-end` B : GO à relevés égaux au compte de B, NO-GO `hard:getTransactionsForAddress` à +1, tableau exact des deux cas ; ligne `course_reconciled` `{from: A, to: B}`, `by_op_method {reconcile\|GO: 1}`, crédits 0 ; mode `aggregate` : GO / `hard:total`, tableau `total` seul ; A depuis la genèse, C depuis B ; mode historique sur le même grand livre : NO-GO `soft` (sonde 3), résultat sans tableau, ligne `reconciled` sans `course` ; chaîne vérifiée | M-R1, M-R2 ; P-4, P-7, P-9 |
| (2) `reconcile_course_end_must_be_an_unlocked_line` (nouveau) | idem | verrou vivant tenu : `course_end_unknown` (sha absent, genèse, `unlocked` d'un autre cycle, `unlocked` d'un autre opérateur) et `course_end_not_unlocked` (ligne `attempted`) ⇒ NO-GO exit 1, aucun octet ; sha mal formé (majuscules, 63, 65, vide, `--op`) et drapeau sans valeur ⇒ erreur d'usage, aucun octet ; sha valide ⇒ `LockHeldError` ; rollover en mode course ⇒ ligne `course_reconciled` NO-GO `rollover` `{from: genèse, to: A}` | M-R3, M-R4 ; P-1, P-2, P-3 |
| (3) `reconcile_course_line_is_not_a_legacy_boundary` (nouveau) | idem | grands livres jumeaux X et Y (mêmes courses, mêmes sha) ; X porte en plus le rapprochement de course de A ; mode historique : même résultat (`GO`) et ligne `reconciled` identique à l'octet hors maillons | M-R5 ; P-10 |
| (4) `reconcile_course_repair_bound_is_the_course` (nouveau) | idem | B = lignes [2, 5), `to` = 5 : L = 1 ⇒ GO, L = 2 ⇒ NO-GO, L = 5 ⇒ NO-GO, L = 6 ⇒ GO ; `lines_after` non numérique et ligne illisible ⇒ NO-GO ; rollover prioritaire ; composition réelle (écrivain mort, `repair-tail`, `unlock`, L = fin) ⇒ NO-GO `repaired_in_window` | M-R6, M-R7 ; P-5, P-6 |
| (5) `cli_unlock_returns_the_unlocked_sha` (nouveau) | idem | sha rendu = tête `<op>.head` = `entry_sha256` de la ligne `unlocked` ajoutée ; bin : `unlocked <sha>\n` seul ; ce sha en `--course-end` au bin ⇒ `GO` + tableau ; genèse ⇒ `NO-GO course_end_unknown`, sans tableau | M-R8 ; P-8 |
| (6) `ledger_format_locked_to_rebase_crosscheck` (amendé, v2, avant le `t.skip`) | `ledger-format-lock.test.ts` | `LEDGER_FORMAT` = 2 ; ensemble fermé (tsc + exécution) ; clés du cœur par genre sur les lignes écrites par les chemins servis (`attempted`, `refused`, `unlocked`, `course_reconciled`, `reconciled`) ; `course` = `{from, to}` ; ligne dorée v1 à l'octet | M-R9 |
| amendés (ADR D-5) | `repair-tail.test.ts` | `repair_tail_composition_power_cut_signature_to_unlock_and_reopen` (l.84 : `{exitCode: 0, unlocked: <tête>}`) ; `repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile` (l.292, 304, 320 : `unlocked <tête>\n`) | — |

- **Deux passages** des trois fichiers du lot (worktree, 15:07:21Z et 15:07:30Z) : 16/16 chacun (`lot-tests-pass1.log`, `lot-tests-pass2.log`) ; dans l'oracle : §12.
- **Suite `packages/rpc-guard/test`** (worktree) : base **99/99** (14:36:27Z) ; lot **104/104** (15:07Z), 0 échec.
- `tsc --noEmit` exit 0 ; `eslint` des 7 fichiers `.ts` exit 0 ; règles du cliquet réactivées sur les trois fichiers de test du lot : **0** coup ; `lang-gate` OK ; `gate:vocab` OK.

## 7. Mutants (copie hors dépôt `F:/tmp/dojo/rg1a-mutants/`)

- Arbre `F:/tmp/dojo/rg1a-mutants/tree` : clone `--no-local` de la branche (HEAD `3cd3c0e`), huit fichiers du lot copiés (`cmp` égal), `node_modules` par `mk-nm.ps1` (`@monark/*` pointe l'arbre lui-même). Harnais `mutants.mjs` (motif DRAND-1a) : témoin d'abord (les six tests visés `ok`), remplacement exact à compte contrôlé, test visé seul (`--test-name-pattern`, TAP), **tué seulement si le TAP porte `not ok N - <test visé>`**, fichier restauré puis contrôlé au sha256 après chaque mutant ; TAP par mutant (`<id>.tap.txt`).
- **Passe 2, qui fait foi** (15:06:51Z → 15:07:10Z, fichiers finaux) : témoin 6/6 `ok` ; **19/19 tués** (9 de la liste fermée, 10 sondes) ; huit fichiers dorés inchangés au sha256 après la passe (`RESULTS.txt`). Passe 1 (14:56:09Z → 14:56:30Z, `RESULTS-run1.txt`) : même verdict ligne pour ligne (seule la docstring de `reconcile.ts` différait, §4 point 15).

| Id | Mutation | Test visé | Verdict (assertion qui tue) |
|---|---|---|---|
| M-R1 | frontière `unlocked` ignorée | (1) | tué (GO attendu, NO-GO soft : la fenêtre de B déborde sur A) |
| M-R2 | fin de fenêtre au bout du grand livre | (1) | tué (la fenêtre de B déborde sur C) |
| M-R3 | `--course-end` accepté sur une autre issue | (2) | tué (le sha d'une ligne `attempted` passe le refus, puis `LockHeldError` au lieu de NO-GO `course_end_not_unlocked`) |
| M-R4 | ligne écrite sur refus d'argument | (2) | tué (« no line, no byte ») |
| M-R5 | `course_reconciled` pris pour borne historique | (3) | tué (X seul répond NO-GO hard) |
| M-R6 | borne de réparation sans fin | (4) | tué (L = fin + 1 signalé) |
| M-R7 | borne sans début | (4) | tué (L = début − 1 signalé) |
| M-R8 | `unlock` rend la tête d'avant | (5) | tué (sha rendu ≠ tête) |
| M-R9 | `course` après `reason` | (6) | tué (ordre des clés de la ligne `course_reconciled`) |
| P-1 | sha en majuscules admis (contrôle insensible à la casse) | (2) | tué (exception d'usage attendue) |
| P-2 | `--course-end` sans valeur replié sur le mode historique | (2) | tué |
| P-3 | refus décidé sous le verrou (lecture avant verrou retirée) | (2) | tué (`LockHeldError` au lieu de NO-GO) |
| P-4 | `from` toujours la genèse | (1) | tué |
| P-5 | fenêtre de course commençant SUR sa frontière (décalage d'une unité) | (4) | tué (L = début − 1 signalé) |
| P-6 | journal de réparation contrôlé avant le rollover | (4) | tué (« the rollover is checked before the repair journal ») |
| P-7 | tableau non rendu par `runCli` | (1) | tué |
| P-8 | tableau non imprimé par le bin | (5) | tué |
| P-9 | tableau présent dans le résultat historique | (1) | tué (forme d'avant exigée) |
| P-10 | forme rejetée É-3 : ligne de course écrite `reconciled` | (3) | tué (elle borne alors le mode historique) |

- M-T1 à M-T11 (1b) et M-H1 à M-H9 (1c) : hors de ce G1 (mission).

## 8. Oracle différentiel : mode historique inchangé à l'octet, et TY-3

- **Oracle non-LLM** (`F:/tmp/dojo/rg1a-work/diff/differential.mjs`, sha256 `321a5d61…c5a5`) : ANCIEN = `git show 3cd3c0e:packages/rpc-guard/src/{ledger,reconcile,tariff,client,errors}.ts` (`reconcile.ts` `6e62cd6a…`) ; NOUVEAU = le worktree. Par scénario semé : un grand livre source bâti par le NOUVEAU code (lignes `attempted`, `refused`, `unlocked`, rapprochements historiques **et rapprochements de course**, donc des lignes v2 `course_reconciled`), journal de réparation aléatoire (numérique, non numérique, illisible) ; copie ×2 ; le **même** rapprochement historique (mode, relevés, rollover et formes refusées aléatoires) joué trois fois de suite par l'ANCIEN code sur la copie 1 et le NOUVEAU sur la copie 2 ; comparés : l'objet résultat (entrée comprise) et **chaque fichier des deux répertoires, octet pour octet**. `fsync` neutralisé dans les deux instances (déclaré : il ordonne, il ne change aucun octet).
- **Fichier final** (15:08:30Z → 15:10:38Z, `differential-2000-final.out`) : 2 000 scénarios, **6 000/6 000 identiques** ; 1 359 scénarios portent des lignes `course_reconciled` (TY-3 : l'ancien code lit un grand livre v2 sans erreur ni changement de verdict), 602 un journal de réparation ; les quatorze motifs exercés (GO, `rollover`, `repaired_in_window`, `soft`, `hard:<trois méthodes>`, `hard:total`, `negative_delta`, `calibration_soft:*`, et les quatre refus de forme). Même résultat à 14:53:57Z sur le fichier de la passe 1.
- **Sensibilité** (`sensitivity.mjs`, copie des mutants, restaurée au sha256) : M-R5 ⇒ **DIFFERENT 267/1 800** ; P-11 (le **dernier** violateur nomme le NO-GO, qu'aucun test unitaire n'épingle) ⇒ **DIFFERENT 28/1 800** : l'oracle n'est pas vacant.
- **TY-3, binaire ancien et drapeau inconnu** (`ty3-probe.mjs`, code de base) : `runCli reconcile … --course-end <sha>` de la base ignore le drapeau, répond en mode historique (`NO-GO soft`, sur-compte) et ajoute une ligne `reconciled` sans `course` : jamais un faux GO, mais pas un verdict de course. D'où l'étape 3 du RUNBOOK §6 (vérifier que la ligne ajoutée est `course_reconciled` et que `course.to` vaut le sha).

## 9. Tuyaux (règle Branchement ; ADR D-4)

- **TU-rg — entrée** : la ligne `unlocked` de la course, écrite par l'`unlock` servi (collecteurs Dōjō, Bell, Ukemi, `history-collect.ts` de `-d3`) ; son sha est désormais **rendu** par `runCli unlock` (`unlocked`) et imprimé par le bin. **Sortie** : le code de sortie et le tableau du bin, lus par la procédure de l'acte (RUNBOOK §6, FAITS). **État** : `<ledger>/<cycle>/<op>.jsonl`, ligne `course_reconciled` (`course: {from, to}`). **Tests** : (1)-(5) par `runCli` et le bin, composés depuis `openGuardedClient` ; et, à blanc, sur le **vrai collecteur** de `-d3` (§10).
- **Consommateurs à 1a** : les tests du lot et la sonde à blanc ; **aucun chemin servi ne passe encore `--course-end`**. TU-rg est donc **composé, pas servi** : item formé (ADR D-4) — entrée : sha de `run.json` (`unlocked[op]`, déjà consigné par `history-collect.ts:283-289` de `-d3`) ; sortie : `runCli reconcile --course-end` du test `dojo_history_budget_stops_fail_closed` puis de l'acte ; déclencheur : corrections post-G2 de PR-2b-3 (O-3) et acte 1 de DOJO-HISTORY-ACTE-1 ; propriétaire : l'orchestrateur. **La pièce reste `upcoming`** (`@monark/rpc-guard` et son bin, GARDE l.1280) ; ce lot ne déclare rien « built ».

## 10. Contrôles par nom

- **`dojo_history_budget_stops_fail_closed`** (arbre `F:/Monark-wt-dojo-d3`, **lecture seule**) : arbre de composition `F:/tmp/dojo/rg1a-d3/tree` = clone de `lot/dojo-historique-3` (HEAD `d37f258`, dont le `packages/rpc-guard` est identique à la base `3cd3c0e`) + copie des cinq fichiers de travail de `-d3` (15:00:2xZ : `history-collect.ts` `6bfd79e7…`, test `b98714f7…`, `history-chain.ts` `75be4b01…`, `apps/dojo/package.json` `c0a7eb01…`, `package-lock.json` `d1d88099…`). Le collecteur porte déjà `--deadline` (C-V-1). Résultats : **témoin, garde de base** (`reconcile.ts` `6e62cd6a…`) ✔ ; **lot 1a** (`5c33efda…`) ✔ ; **lot 1a final** (`429c5438…`) ✔ sur la version du test déplacée entre-temps par `-d3` (`2a7314e5…`, 15:11Z ; le déplacement touche ses tests de fuite, pas le rapprochement) : GO/NO-GO historiques identiques.
- **Sonde à blanc en mode course** (jamais livrée ; `probe-patch.mjs`, copie de test `2494d4d5…`) : le même rapprochement servi, `--course-end` = le sha que `run.json` consigne : course B seule GO aux relevés de B (helius `10 × page`, chainstack `2k`) ; +1 ⇒ `hard:getTransactionsForAddress` / `hard:total` ; relevés A + B ⇒ `hard:getSignaturesForAddress` / `hard:total` (B ne contient pas la phase A) ; course A seule GO ✔ (sur le fichier final aussi).
- **Ukemi** (Q-O4) : `apps/sentinel/test/ukemi-guard-record.test.ts` en entier sur le worktree : **31/31** (sur `5c33efda…` puis sur le `reconcile.ts` final), contrôles de fuite compris. L'enregistreur appelle `runCli unlock` en processus et n'imprime pas son résultat : la seule surface nouvelle, `unlocked <sha>` du bin, est couverte par le test (5) (expression fermée : un sha et rien d'autre).
- **Liste de l'ADR D-5** (dans la suite complète de l'oracle, §12) : `public_api_never_reaches_fetch_without_a_ledger_line`, `budget_counts_http_attempts`, `method_cap_stops`, `error_preamble_carries_no_vocabulary_token`, `bell_publish_bare_label_guard_pins_operator_vocabulary`, `crosscheck_credits_derived_from_ledger`, `bell_shortpage_probe_transient_error_is_retried`, et les tests `u4_*` qui comptent les issues par `ledgerSummary`/`ledgerOutcomeCount` (`test/guard-scripts-u4.test.ts:147-166`).

## 11. Conflits prévisibles (TY-12), nommés, non résolus ici

- **DRAND-1a** (G1 non committé, `F:/Monark-wt-drand`, lecture seule) : **fusion à blanc** `git merge-file -p <1a> <base 3cd3c0e> <DRAND-1a>` : `client.ts` (DRAND `e326f9a4…`) et `ledger.ts` (DRAND `c721094e…`) **0 conflit** chacun (`F:/tmp/dojo/rg1a-work/merge/`). En lignes de la base : mes hunks de `ledger.ts` insèrent après l.26 et l.96 et modifient l.148, l.192 et l.196 ; les siens insèrent après l.146, l.190 et l.206 : au moins une ligne inchangée les sépare (l.147, l.191). Sémantique : ses tests appellent `runCli unlock` dans un `finally` sans en asserter le résultat ; `priorAttemptsAtOpen` ne compte que `attempted` (une ligne `course_reconciled` n'en est pas une).
- **1b TARIFF** (en parallèle, décision 255 ; `-rg1b` propre à 14:3xZ, aucun diff à fusionner à blanc) : `client.ts:17` (union `Outcome` : `settled` + `course_reconciled`) ; `reconcile.ts` : la somme de 1b (`attempted` + `settled`) tombe dans la boucle que 1a a renommée et bornée (`ledgerRunInWindow`) — conflit textuel probable, résolution par union (la somme de 1b dans la fenêtre de 1a) ; `ledger-format-lock.test.ts` : `settled` à ajouter à `V2` et une ligne d'ordre de clés pour une ligne `settled` écrite par le chemin servi (sinon `typecheck` rougit, par construction) ; `ledger.ts` (l.190 de 1b, prieur) disjoint de mes hunks. Q-2.
- **1c HOST** : fichiers disjoints (`transport.ts`, `guarded.ts`, `exports.test.ts`). Voir Q-6 (observation sur `-d3`).

## 12. Oracle (sept gates sur clone, sous verrou d'hôte « G1 RG-RECONCILE-1a ») et test 42

- **Scripts** `F:/tmp/dojo/rg1a-work/` (écrits à neuf sur le motif DRAND-1a) : `locked.sh` (`a2f92f84…9754` : `mkdir` atomique de `F:/tmp/oracle-lock`, `owner.txt`, attente par pas de 60 s jusqu'à 90 min, retrait dans le piège EXIT, `node.exe` comptés à la prise et au rendu), `run-oracle.sh` (`124a0d99…5d80` : `npm run` des sept gates, codes capturés, huit variables payantes retirées par `env -u`, TEMP sur F:), `oracle-all.sh` (`a69df6e6…0bf10` : les sept gates puis le test 42 seul, même prise), `t42.sh` (`f01978af…acd`), `sync.sh` (`40d5a99b…0544` : neuf fichiers du worktree vers un clone, `cmp`).
- **Arbre** : `F:/tmp/dojo/rg1a-clone` = `git clone --no-local --branch lot/rpc-guard-reconcile-rg1c F:/Monark` (HEAD `72214c9`, **arbre `2abba554…` = tronc `1e179d2` + G0**, le même que `-rg1b`) + les neuf fichiers du lot (huit de code et de test, le RUNBOOK) : c'est le commit de fusion que la CI extrait pour la PR. `node_modules` par `mk-nm.ps1`.
- **Verrou et C-V-4** (`oracle/out-1/node-count.txt`) : attente de 360 s derrière « G1 RG-RECONCILE-1c » (tenu depuis 14:58:03Z) ; **pris à 15:14:06Z, 25 `node.exe` à la prise** ; sept gates 15:14:06Z → 15:21:57Z ; **23 au lancement du test 42** (15:21:58Z) ; **23 au rendu** (15:25:34Z) ; verrou rendu à 15:25:34Z, absent ensuite (`ls F:/tmp/oracle-lock` : absent à 15:25:47Z). Une seule suite complète pendant la prise ; aucun de mes tests pendant la prise.
- **Sept gates : 7/7 exit 0** ; `lint:ratchet` **69/69** (TRUNK-RATCHET-76-1 présent dans l'arbre fusionné ; base pure : Q-1) ; `test` : **1 446 tests, 1 443 pass, 0 fail**, 0 annulé, 3 skipped, préexistants et déclarés (`sentinel_run_releases_chainstack_lock_on_sigterm` et `sentinel_instrument_out_win32_short_name` sous win32, `u4b_labels_replay_via_main_real_artifact` sans artefact), 424,5 s ; ✔ les six tests du lot, les deux amendés de `repair-tail.test.ts`, la liste de D-5 (`public_api_never_reaches_fetch_without_a_ledger_line`, `budget_counts_http_attempts`, `method_cap_stops`, `error_preamble_carries_no_vocabulary_token`, `bell_publish_bare_label_guard_pins_operator_vocabulary`, `crosscheck_credits_derived_from_ledger`, `bell_shortpage_probe_transient_error_is_retried`), les dix-neuf `u4_*`, `fetch_only_inside_client`, `no_secret_in_repo`, `export_public_no_governance_no_french` (test 42 dans la suite) ; `ledger_format_locked_to_rebase_crosscheck` **exécuté** (référence Bell présente), jamais sauté. sha256 : `test.log` `af8396f6…`, `typecheck.log` `03481a8f…`, `lint.log` `f845417c…`, `gate-vocab.log` `54da045d…`, `lang-gate.log` `b22ac8f8…` (OK, 0 coup), `export-check.log` `2f9645a9…`, `lint-ratchet.log` `45ede4ce…`.
- **Test 42 à part**, après la suite, même prise : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` ⇒ exit 0, `tests 2, pass 2, fail 0` : `export_public_no_governance_no_french` ✔ (212 s) et `export_public_derived_jobs_are_byte_identical` ✔, durée 212,3 s (`t42/test42.log` `6ea5b936f8f2e565957e3ed2f3d85cd7522df698bd76f7df12ca6e4bafc23e8a`). `packages/rpc-guard/**`, donc `course-window.test.ts`, est exporté : `lang-gate` du miroir vert.
- Jonctions des trois clones retirées par `rm-nm.ps1` (mutants et `-d3` : 15:23:13Z → 15:23:21Z ; oracle : 15:26:01Z → 15:26:04Z) ; `F:/Monark/node_modules` intact (218 entrées, `@monark` 10). Processus : pendant le test 42, le contrôle `procs.ps1` voit mes deux processus (pid 32784 et son fils 60908 : le contrôle n'est pas vacant) ; après le rendu, **0** `node.exe` ne porte une chaîne de mes exécutions (22 au total, ceux des autres sessions) et ces deux pid n'existent plus (`procs-during-t42.txt`, `procs-after-release.txt`). Limite du contrôle : ses chaînes sont génériques ; à 15:28:16Z il désigne deux processus d'une autre session (arbre de processus : un `npm run test` lancé à 15:26:20Z sous le verrou « corr PR-2b-3 » pris à 15:26:11Z ; `proctree.ps1`), aucun des miens (toutes mes tâches de fond terminées, exit 0).

## 13. Aucun réseau (greps sur les lignes ajoutées du lot, `greps.txt`)

- Sur les 315 lignes ajoutées (diff des suivis + le fichier neuf) : `fetch(` **0**, `node:http` 0, `node:https` 0, `undici` 0, `https://` 0, `http://` 0, `process.env` 0, `api-key` 0, `API_KEY` 0, `console.` 0. `child_process` : 1 (`spawnSync` du bin servi, test (5), comme `repair-tail.test.ts`). `globalThis.fetch` n'est que **remplacé** par le bouchon `okFetch` (et restauré) ; pièges socket et DNS armés dans `course-window.test.ts` (motif `collect-chain.ts:14-15`).
- Aucun hôte ni clé nouveaux : les courses passent par `FAKE_HELIUS_ENV` du harnais (hôte `.invalid`, clé factice), jamais imprimés ; l'erreur d'usage de `--course-end` ne cite pas la valeur. Aucun opérateur hors libellés du garde (`helius`, `chainstack`).
- Aucun appel réseau réel pendant la passe ; aucun navigateur ; aucune page lue.

## 14. Ce que je n'ai pas fait, et pourquoi

- Aucun `git add/commit/stash/checkout/branch` dans le worktree (R-20) ; git en lecture seule (`status`, `rev-parse`, `log`, `diff`, `show <rev>:<chemin>`, `merge-base --is-ancestor`, `worktree list`, `branch --list -v`, `ls-files` par le script R-25) ; `git merge-file -p` sur des copies (fichiers, sortie standard) ; trois `git clone --no-local` jetables sous `F:/tmp/dojo/` (mutants, oracle, composition `-d3`), dont l'extraction de branche est interne au clone.
- `-d3` : lecture seule (copies hachées) ; aucune édition. Aucune édition de l'ADR, des FAITS, de `apps/**`.
- 1b (tarif, `settled`, M-T*) et 1c (hôte, M-H*) : hors mission. `index.ts` inchangé (`CourseRow`/`CourseTable` non réexportés : un consommateur type par `CliResult["perMethod"]`). `lock.ts` inchangé (l'entrée est déjà rendue).
- Le fail-open « relevé non numérique » (Q-5) n'est pas corrigé : la correction changerait le mode historique, que D-1 fige à l'octet.
- Hors verrou : passes au niveau du fichier ou du paquet, mutants, oracle différentiel, contrôles `-d3` et Ukemi (précédent DRAND-1a) ; la suite complète et le test 42 n'ont tourné que sous le verrou (§12) ; aucun test pendant la prise.
- Rien sur C: : TEMP/TMP/TMPDIR sur `F:/tmp/dojo/rg1a-work/tmp` (et `F:/tmp/dojo/rg1a-mutants/tmp`), cache npm `F:\cache\npm` ; le binaire `node` de `C:\Program Files\nodejs` est exécuté, jamais écrit.

## 15. Questions formées (aucun « dû » nu)

- **Q-1 (orchestrateur ; décision 255)** : `-rg` est resté à `3cd3c0e` ; `3416807` (TRUNK-RATCHET-76-1) n'en est pas ancêtre. **Mesuré** : sur le worktree (base + lot) `npm run lint:ratchet` rend **76/69**, exit 1 (15:26:55Z, `ratchet-worktree.log`), dont 7 coups à `test/lang-gate-routing.test.ts:65-66` hérités de `4ef2b15` (`ratchet-base-lang-gate-routing.txt`) et 0 dans le lot (`ratchet-lot-files.log`) ; sur l'arbre fusionné (`2abba554` + lot, §12) : **69/69**, exit 0. Le « 69/69 attendu » de la mission n'est donc atteint que sur l'arbre fusionné. Proposition : fusionner le tronc dans `lot/rpc-guard-reconcile-1` avant la PR (acte de l'orchestrateur), ou s'en remettre au commit de fusion que la CI extrait.
- **Q-2 (orchestrateur ; D-1 « format v2 », fusion avec 1b)** : l'ensemble fermé de 1a compte cinq issues ; à la fusion (1b d'abord, décision 255), l'union ajoute `settled` à `Outcome` (`client.ts:17`), à `V2` et une ligne d'ordre de clés `settled` produite par un chemin servi dans `ledger-format-lock.test.ts`. À confirmer, ou à trancher autrement (par exemple `settled` réservé dès 1a sans producteur, que la règle Branchement déconseille).
- **Q-3 (orchestrateur ; D-1 « avant verrou »)** : refus décidés avant le verrou par lecture pure ; résidu : une ligne déchirée d'un append concurrent ⇒ exit 2 (fail-closed) ; un cycle inconnu crée un répertoire vide (`ensureCycleDir`, C-8). À confirmer.
- **Q-4 (orchestrateur ; Q-O5)** : forme du tableau (§4 point 4) et conditions d'impression (seconde ligne du bin, bornes évaluées, mode course seul). À confirmer ou amender par ligne datée.
- **Q-5 (orchestrateur ; item proposé RECONCILE-SNAPSHOT-FINITE-1, PAROXYSME)** : mesuré sur le code de base (`nan-probe.mjs`) : une valeur de relevé non numérique (`"abc"`, `total_ru` `"9e9x"`) donne un delta `NaN` qu'aucune comparaison ne retient ⇒ **GO** ; le mode course en hérite. Fail-open sur un CSV ou un JSON mal formé. Construction proposée : NO-GO `snapshot_not_finite` avant toute borne, dans les deux modes (≈ 4 lignes + un cas de test) ; elle change le mode historique sur entrée mal formée seulement, donc une ligne datée est due (D-1 le fige à l'octet). Déclencheur : avant le premier acte en `--course-end` (acte 1 de DOJO-HISTORY-ACTE-1) et avant le prochain rapprochement Bell. Propriétaire : l'orchestrateur.
- **Q-6 (orchestrateur ; 1c ↔ PR-2b-3, observation hors lot)** : la copie de travail de `-d3` (15:11Z, en mouvement) pose `BELL_SOLANA_RPC: https://${HOSTS.a}/?id=${K4}` dans un test de fuite (`dojo-history-collect.test.ts:266`) ; sous D-3 (1c), une URL helius avec requête est refusée avant tout verrou : rouge prévisible de ce test à la fusion de 1c (non exécuté ici). À router vers le G1/G2 de 1c et les corrections de PR-2b-3.
- **Q-7 (orchestrateur ; D-1 « `LEDGER_FORMAT` non exportée »)** : lue « non publique » (exportée de `ledger.ts` pour le verrou, absente d'`index.ts`, précédent `DURABLE_FS`). À confirmer.
- **Q-8 (orchestrateur ; RUNBOOK)** : §6 neuve, paragraphe « mode course » en §3 étape 6, renvois `:73`/`:74` → `:114`/`:115` (docs, hors R-25). À relire au G2. Nuance relevée après le gel des fichiers de l'oracle, non corrigée pour ne pas désaligner l'arbre testé : §6 étape 5 écrit « write NOTHING » ; exactement : aucune ligne, aucun verrou, mais un répertoire de cycle vide est créé pour un cycle jamais vu (`ensureCycleDir`, Q-3) ; correction d'un mot proposée au G2.
- **Q-9 (orchestrateur ; D-5 R-25)** : 354 mesurées pour 184 estimées (×1,92), sous 386 ; ventilation au §5 ; coupe non posée.
- **Q-10 (orchestrateur ; D-1 « sans `--course-end`, le nom est `since-last-reconciled` »)** : lu comme le nom du mode dans le code et la documentation (en-tête de `reconcile.ts`, docstrings, RUNBOOK), sans champ nouveau dans le résultat (§4 point 13). Si la phrase visait un champ nommant la fenêtre dans `ReconcileResult` ou `CliResult`, à trancher par ligne datée (≈ 2 lignes ; la forme historique de `CliResult` est assertée en entier par `repair-tail.test.ts`).

## 16. Livraison

`F:/tmp/dojo/rg1a-deliver/` : les neuf fichiers du lot et ce journal (arborescence du dépôt) ; `evidence/` (R-25, journaux de tests, mutants, oracle différentiel et sa sensibilité, sondes TY-3 et `NaN`, fusion à blanc, contrôles `-d3` et Ukemi, oracle, `lot.diff`, `greps.txt`) ; `DELIVERED.sha256` (sha256 de chaque fichier livré ; ceux du lot et du journal relus contre le worktree).

## 17. Advisor

- Outil intégré consulté après l'orientation, avant toute écriture : pas de `settled` en 1a ; `LEDGER_FORMAT` hors `index.ts` ; lecture pure avant verrou (jamais `openOperatorLedger`) ; `appendChained` historique à quatre arguments ; forme de la borne de réparation propre aux mutants M-R6/M-R7 ; premier violateur préservé ; tableau en mode course seul ; piège de `arg()` ; courses A et C au-delà de la bande et porteuses de gTFA ; gTFA en `{limit: 100}` ; verrou tenu pour discriminer « avant verrou » ; ligne dorée à `tariff_version` littéral ; oracle différentiel ; arbre de l'oracle = arbre fusionné ; composition `-d3`. Chaque point vérifié sur pièce ; conseil, jamais verdict.
- Seconde consultation, pendant la prise du verrou par l'oracle (code, tests et journal écrits) : aucun changement de code ; attendre la fin de la tâche de l'oracle elle-même (le rendu du verrou suit l'écriture de `t42/exits.txt`) ; geler les neuf fichiers synchronisés ; relever la suite par noms (sauts préexistants, `ledger_format_locked_to_rebase_crosscheck` exécuté) ; mesurer le 76/69 de la base au lieu de l'inférer (Q-1) ; preuve C-V-4 par ligne de commande, non vacante ; précisions §4 points 1 et 16, Q-10. Chaque point vérifié sur pièce ; conseil, jamais verdict.
- Troisième consultation, avant la remise : rendue hors du fichier.

## 18. `git status --short` final (worktree)

```
 M docs/RUNBOOK-rpc-guard.md
 M packages/rpc-guard/bin/rpc-guard.mjs
 M packages/rpc-guard/src/cli.ts
 M packages/rpc-guard/src/client.ts
 M packages/rpc-guard/src/ledger.ts
 M packages/rpc-guard/src/reconcile.ts
 M packages/rpc-guard/test/ledger-format-lock.test.ts
 M packages/rpc-guard/test/repair-tail.test.ts
?? docs/G1-lot-rpc-guard-reconcile-1a.md
?? packages/rpc-guard/test/course-window.test.ts
```

## 19. Corrections après G2 (2026-09-27 ; reprise 2026-09-28)

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5` ; worker correcteur, effort max, contexte frais (correcteur ≠ relecteur ≠ générateur). Deux instances successives du même modèle : le **correcteur 1** (ouverture 19:33:40Z, mort à la limite de session vers 21:3xZ-22:0xZ, avant sa remise) et le **correcteur 2** (reprise, ouverture 23:43:22Z), qui écrit ce paragraphe. Les chiffres ci-dessous sont ceux du correcteur 2, datés, sauf mention « [repris, non rejoué] ».
- **Textes** : mission `F:/tmp/dojo/mission-corr-rg1a.md` (14 l., sha256 `0208b51d22cda2d908a6bacd6323c12faadece925cba26cab984b39aafd03898`) et préambule de reprise `F:/tmp/REPRISE-2026-09-28.md` (`13bd476c…b2b7`), calculés par le script de l'orchestrateur, lus comme tels. Rapport G2 `F:/tmp/dojo/g2-rg1a/G2-report.md` : brouillon `f6112910…7861` (19:20:46Z), lu par l'orchestrateur pour la mission et par le correcteur 1 ; version finale `5982b5c1…a36a` (remise 21:01:49Z), lue en entier par le correcteur 2 (§§ 9 et 16 remplis, Q-G2-5 ajoutée, le reste inchangé selon son § 16). Aussi lus : mission G2, ce journal, l'ADR (D-1, D-5, Q-O4/Q-O5), RUNBOOK § 6, harnais et sondes du G2 (`g2-mutants.mjs` `f1ee930a…`, `probes.mjs` `daae784a…`, `diff-oracle.mjs` `5eaecdd5…`).
- **Base et discipline** : worktree `F:/Monark-wt-rg`, branche `lot/rpc-guard-reconcile-1`, HEAD `3cd3c0e` inchangé ; aucun git écrivant dans le worktree (`status`, `rev-parse`, `diff`, `show <rev>:<chemin>`, `ls-files`, tous `--no-optional-locks`) ; écritures git dans les seuls clones jetables `git clone --no-local` sous `F:/tmp/dojo/rg1a-corr/` (fusion du tronc imposée par Q-1, commit jetable du R-25) ; aucun réseau (pièges socket/DNS, `fetch` bouchonné) ; TEMP/TMP/TMPDIR sur `F:/tmp/dojo/rg1a-corr/tmp` ; huit variables payantes retirées à chaque exécution ; éditions du correcteur 1 par ancres exactes à compte contrôlé (`edits/apply.mjs`, `apply-pairs.mjs`, essai à sec puis application).

### 19.0 Reprise (correcteur 2)

- **Trouvé** (23:43:22Z → 23:51:52Z, `r2/open-r2.txt`) : `git status --short` à 11 entrées (les 10 du G1 et l'ADR, qui porte les deux lignes datées de la mission) ; dix fichiers égaux au gel du correcteur 1 (`frozen-at-queue.txt`, 20:17Z) : `reconcile.ts` `fa5d8194…`, `cli.ts` `28cb5fb3…`, `course-window.test.ts` `a02998f6…`, RUNBOOK `2cd6fc82…`, ADR `2f0a78a7…` (préfixe de 44 075 octets égal au sha committé `45ac97e2…` : ajout seul, remesuré), les cinq autres aux sha du G1 (§ 3) ; ce journal encore au sha du G1 (`08c2bdce…`) : le § 19 n'existait qu'en sept morceaux hors du worktree (`journal-s19-part1..7.md`, 20:09Z → 20:28Z) ; un brouillon de rapport à trois places vides (verdict, oracle, sha du journal) ; `F:/tmp/dojo/rg1a-corr-deliver/` vide ; aucun processus du correcteur 1 vivant (23:48:26Z) ; verrou d'hôte libre à 23:44:12Z.
- **Oracle du correcteur 1** : file 1 (19:53:54Z) arrêtée par lui (§ 19.10) ; file 2 (20:18:01Z) sortie en code 1 sans prise, cause non établie (même motif que la Q-G2-5 du G2) ; file 3 (20:26:15Z) : verrou pris à 21:49:22Z après 4 980 s, sept gates 7/7 exit 0 (21:49:29Z → 21:56:49Z ; suite 1 446 tests, 1 443 pass, 0 fail, 3 sautés ; `lint:ratchet` 69/69), test 42 2/2 (22:00:18Z), verrou rendu par le piège à 22:00:19Z : **terminé après la mort de l'agent**, sur un clone fusionné au tronc `a3dbf31` (`0ebe245`), ce journal au sha du G1. Gardé comme pièce historique **[repris, non rejoué]**, non comme preuve : le tronc a gagné depuis neuf fichiers hors `docs/` (fusion PR-3b-1 `b45e7e0` : `apps/dojo/scripts/*`, `deploy/monark-dojo-collect.*`, `scripts/dojo-deploy.*`, `test/dojo-collect-deploy.test.ts`, dont `dojo_collect_tree_is_the_import_closure` épingle la fermeture d'import du bin `rpc-guard.mjs`) ; oracle rejoué au § 19.8.
- **Réutilisé** (cohérent : sha égaux au gel, sorties datées, scripts relus) : les corrections elles-mêmes (aucun octet du code, des tests, du RUNBOOK ni de l'ADR n'a été réécrit par le correcteur 2 ; relus ligne à ligne contre la mission et le G2 § 13) ; les harnais du correcteur 1 (copies de ceux du G1 et du G2 à `TREE`/`OUT`/`TEMP` près, écart vérifié par `diff`) ; ses arbres de sondes (`trees/corr` = worktree 16/16, `trees/g1` = G1, `trees/old-src` = `3cd3c0e` 13/13, par `cmp`) ; son clone des mutants (11/11 égaux au worktree) ; son commit jetable du R-25 (`31fdcff`, 11 blobs égaux au worktree) ; le texte de ses morceaux du § 19, repris ici.
- **Refait** par le correcteur 2 : tous les passages de tests, `tsc`, `eslint`, cliquet, R-25 (deux méthodes), les quatre passes de mutants (sorties neuves), les sondes, les deux oracles différentiels et leurs sensibilités, plus un oracle différentiel à entrée VALIDE (nouveau), un clone neuf fusionné au tronc courant et l'oracle (§ 19.8). Pièces sous `F:/tmp/dojo/rg1a-corr/r2/`.
- **Écarts constatés** entre l'état partiel et la mission : (a) 11 fichiers et non 10 (l'ADR, par les lignes datées que la mission fait écrire) ; (b) le rapport G2 a changé de sha après la mission (brouillon → final) ; (c) le tronc a bougé (`a3dbf31` → `13fd0b4` → `ddd69b3`) ; (d) la passe « avant » des mutants K rend d'abord 3/27 au rejeu, dont deux rouges d'environnement (§ 19.5) ; (e) l'observation O-C1 du correcteur 1 (rapport G2 à places vides) est close : le rapport est final.

### 19.1 Décisions appliquées (liste fermée de la mission ; code du correcteur 1, relu par le correcteur 2)

| Point | Fait | Où |
|---|---|---|
| C-G2-1 (bloquante, PAROXYSME) | un relevé dont une valeur n'est pas un nombre JSON fini rend **NO-GO `snapshot_not_finite`**, deux modes, deux fenêtres, après le rollover et `repaired_in_window`, avec les refus de forme, avant toute borne, sans tableau, avec sa ligne ; `Number.isFinite` ne coerce pas (`"12"`, `null`, `NaN`, `1e999` refusés) | `reconcile.ts:124` (agrégé), `:146` (par méthode) |
| Q-G2-1 = (a) | per-method : un delta négatif rend **NO-GO `negative_delta:<m>`** (première méthode dans l'ordre du `Set`), **après** `hard:<m>`, avant la bande souple, tableau rendu en mode course (préséance déclarée, Q-C2) | `reconcile.ts:147`, `:154`, `:159` |
| C-G2-2 (bloquante) + Q-G2-4 | ensemble fermé des graphies de `reconcile`, contrôlé EN PREMIER (avant tout répertoire, verrou, ligne) : six drapeaux, une fois chacun et suivis de leur valeur, plus `--course-end=<sha256>` (graphie reconnue, lecture de la mission, Q-C1) ; toute autre graphie (casse, `_`, préfixe voisin, drapeau du bin répété ou `--floor=<n>`) ou un drapeau répété lève `rpc-guard: unknown option (...)`, sans écho d'aucun jeton ; la scission `=` ne vaut que pour `reconcile` | `cli.ts:4`, `:19`, `:22`, `:26-30` |
| Q-G2-4 (ligne datée unique) | une ligne datée pour C-G2-1, Q-G2-1 et C-G2-2 : « le mode historique ne change que sur entrée invalide », prouvée par trois oracles différentiels (§ 19.7) | ADR, fin de fichier (ajout seul) |
| C-G2-3 (doc) + Q-G2-2 = oui | RUNBOOK § 6 étape 3 : forme du G2 ; ligne datée ADR aux cellules TY-1 et TY-3 : « faux GO possible si les instantanés n'encadrent pas toutes les courses de la fenêtre ; levé par BELL-COURSE-END-1 et le mode course » | RUNBOOK § 6 ; ADR |
| C-G2-4 (doc, Q-8) | RUNBOOK § 6 étape 5 : « append no line, take no lock and change no byte of an existing ledger » (précision : un `--cycle` inédit garde son répertoire vide, C-8 ; `unknown option`, exit 2, contrôlé en premier) ; étapes 2 et 4 : nombres JSON, motifs `snapshot_not_finite` (sans tableau) et `negative_delta[:<m>]` (avec tableau) | RUNBOOK § 6 |
| C-G2-5 (tests) | les six survivants G-1, G-2, G-4, G-5, G-6, G-9 tués (§ 19.5) | `course-window.test.ts` (1), (3) |
| Q-G2-3 | hors de cette charge : `LEDGER_FORMAT` et la table d'ordre des clés **non touchés** (`ledger.ts` et `ledger-format-lock.test.ts` égaux aux livrables du G1) | — |

- Renvois `reconcile.ts:114` (rollover) et `:115` (drapeau de réparation) du RUNBOOK (l.83, 92, 162, 166) toujours exacts (relus à 00:23Z) : toute insertion est après l.115 et la docstring de `runReconcile` a été réécrite à nombre de lignes égal (l.100-103).
- Tests ajoutés (`course-window.test.ts`, 182 → 216 l.) : (1) G-4 (tableau d'un NO-GO soft de course), G-5 (deux méthodes en faute : la première), G-6 (tableau d'un `negative_delta` agrégé), Q-G2-1 (course et historique, préséance de `hard`), C-G2-1 (six valeurs `"1,234,567"`, `"abc"`, `null`, `"12"`, `NaN`, `Infinity` × avant/après × par méthode/agrégé × course/historique = 48 cas, puis la ligne écrite), G-9 (course `[attempted, refused, attempted]` par un plafond gTFA de 1 : paramètre `refuse` de l'aide `course`) ; (2) C-G2-2 sous verrou vivant (huit formes refusées sans octet ni écho : quatre graphies voisines, deux répétitions, `--floor 5`, un sha en position de drapeau ; un cycle inédit refusé sans répertoire ; `--course-end=<sha>` qui atteint le verrou ; une raison d'`unlock` en forme de drapeau consignée telle quelle) ; (3) G-1 et G-2 (`from` = la ligne `course_reconciled`, puis la ligne `reconciled`) ; (5) C-G2-1 par le bin (`1e999` lu `Infinity` par `JSON.parse` : `NO-GO snapshot_not_finite`, sans tableau).

### 19.2 Fichiers (état final du worktree ; aucun autre)

| Fichier | État | Lignes | sha256 |
|---|---|---|---|
| `packages/rpc-guard/src/reconcile.ts` | corrigé (C-G2-1, Q-G2-1) | 162 | `fa5d819433040d222e6c538799be3626d34ca0bbe44a7a95e0cee96d5ba84600` |
| `packages/rpc-guard/src/cli.ts` | corrigé (C-G2-2) | 58 | `28cb5fb38290b13c16e196a1ad5cf00f02b6d735ecfada966105ee7e379cc558` |
| `packages/rpc-guard/test/course-window.test.ts` | corrigé (C-G2-5 et cas nouveaux ; non suivi) | 216 | `a02998f630c265854adc4241f4302840a0243cf7c103b434ea1b47db7b071267` |
| `docs/RUNBOOK-rpc-guard.md` | § 6 étapes 2 à 5 (hors R-25) | 219 | `2cd6fc82a619a7364a2e8e5669893b2e57ad4fb95d1284ba78c751982d109cb5` |
| `docs/adr/ADR-RPC-GUARD-RECONCILE-1.md` | deux lignes datées (ajout seul ; préfixe de 44 075 octets égal au sha committé `45ac97e2…`) | 170 | `2f0a78a733799d892e037dbad26d50f675c54d722dca8f0a3dcce5ff42dbc631` |
| `ledger.ts`, `client.ts`, bin, `ledger-format-lock.test.ts`, `repair-tail.test.ts` | inchangés depuis le G1 | — | sha256 du § 3 |
| ce journal | § 19 ajouté (préfixe égal au G1 `08c2bdce…`, contrôlé) | — | rendu hors du fichier |

- 0 octet CR, 0 caractère hors ASCII, 0 tabulation, 0 blanc final, LF final dans les trois fichiers de code et de test corrigés (mesuré par `node`, 23:52Z). Diff de correction (livrables du G1 → état final, cinq fichiers, `r2/corr-r2.diff`) : +83 −24 (`reconcile.ts` +8 −4, `cli.ts` +8 −2, `course-window.test.ts` +42 −8, RUNBOOK +20 −10, ADR +5).

### 19.3 R-25 (base `3cd3c0e`, deux méthodes, rejouées par le correcteur 2)

- **Méthode A** (`F:/tmp/dojo/pr2-1-r25-methodA.mjs`, `140be120…`, lecture seule, worktree, 23:54:30Z) : **400** (`r2/r25-methodA-r2.txt`).
- **Méthode CI littérale** : ligne `ci.yml:82` extraite du fichier, `origin/<base>` remplacé par `3cd3c0e` (`r2/r25-ci-cmd-r2.txt`, même texte que celle du correcteur 1), exécutée sur le commit jetable `31fdcff` (parent `3cd3c0e`, ses 11 blobs égaux au worktree par `cmp`), 23:54:50Z : `8 files changed, 360 insertions(+), 40 deletions(-)` ⇒ **400**.
- 354 → 400 (+46) : code +12 (`reconcile.ts` 88 → 92, `cli.ts` 21 → 29), tests +34 (`course-window.test.ts` 182 → 216). **≤ 414** (354 + 60) ; STOP 1 150 à 750.

### 19.4 Tests (worktree, correcteur 2)

- Trois fichiers du lot, deux passages : **16/16** ×2 (23:52:25Z → 23:52:39Z) ; suite `packages/rpc-guard/test` : **104/104** ×2 (23:52:39Z → 23:53:11Z), 0 échec, 0 saut ; par nom, ✔ les six tests du lot (`cli_unlock_returns_the_unlocked_sha` exécuté jusqu'au bin) et les deux amendés de `repair-tail.test.ts`. Aucun nom de test nouveau : des cas dans (1), (2), (3) et (5).
- `tsc --noEmit` exit 0 (23:53:37Z) ; `eslint` des sept fichiers `.ts` exit 0 (23:54:00Z ; le bin `.mjs` est ignoré par la configuration) ; les six règles du cliquet sur les trois fichiers de test du lot, comptées dans le clone des mutants : **0** coup ; témoin positif (fichier sonde `any` créé puis retiré dans ce clone, jamais dans le worktree) : 3 coups (23:54:11Z → 23:54:22Z).

### 19.5 Mutants (clone `F:/tmp/dojo/rg1a-corr/clone-mut` : branche à `3cd3c0e` + 11 fichiers `cmp` égaux ; jamais le worktree ; sorties neuves `r2/mutants/`)

- **Les 19 du G1, à leurs textes** (`g1-mutants-r2.mjs` `83913e0d…` = `mutants.mjs` du G1 `1f72a9d5…` à `TREE`/`OUT` près) : témoin 6/6 `ok` ; **19/19 tués** par leur test visé ; fichiers dorés restaurés au sha256 (23:55:26Z → 23:55:57Z, `RESULTS-G1-r2.txt` `d1990ddb…`).
- **Les 33 du G2, à leurs textes** (`g2-mutants-r2.mjs` `581dffad…` = `g2-mutants.mjs` `f1ee930a…` à `TREE`/`OUT`/`TEMP` près) : témoin 104 ok, `tsc` 0 ; **33/33 tués** (23:56:04Z → 00:00:36Z, `RESULTS-G2-r2.txt` `fc58775b…`, égal octet pour octet à celui du correcteur 1), dont les six survivants du G2 § 7 : G-1 et G-2 par (3) ; G-4, G-5, G-6 et G-9 par (1).
- **Mutants des corrections** (`k-list.mjs` `93186ac8…`, harnais `k-mutants-r2.mjs` `e6ba4818…`, protocole du G2 : suite entière du paquet, tué ssi au moins un `not ok` sur au moins 100 tests, restauration contrôlée au sha256) : K-1/K-2 finitude retirée (agrégé, par méthode), K-3 `isFinite` global (coercition), K-4 à K-7 un seul côté contrôlé, K-8 delta négatif ignoré, K-9 `negative_delta` avant `hard`, K-10 dernière méthode négative, K-11 sans tableau, K-12 delta nul pris pour négatif, K-13 ensemble fermé retiré, K-14 répétition admise, K-15 `=` non scindé, K-16 casse ignorée, K-17 préfixe admis, K-18 contrôle après `ensureCycleDir`, K-19 jeton cité, K-20 `=` gardé dans la valeur, K-21 scission pour toute sous-commande ; plus G-1, G-2, G-4, G-5, G-6, G-9 aux textes du G2.
  - passe « après » (tests corrigés) : **27/27 tués** (00:00:44Z → 00:05:37Z, `RESULTS-K-after-r2.txt` `20b54495…`) ;
  - passe « avant » (le `course-window.test.ts` du G1, `6c680f38…`, mis en place pour la passe puis rendu, sha contrôlé) : **1/27** (K-12, par les tests du G1) ; les 26 autres survivent aux tests du G1 : ce sont les lignes de cette passe qui les tuent. La passe complète (00:05:44Z → 00:09:46Z, `RESULTS-K-before-r2.txt` `b85b8f31…`) a d'abord rendu 3/27 : K-4 et K-5 « tués » par des tests étrangers à leur mutation (`cli_unlock_returns_the_unlocked_sha`, `repair_tail_is_served_by_the_bin`, `repair_journal_of_a_real_repair_is_consumed_by_the_served_reconcile`, `multi_lock_acquire_is_atomic_with_rollback`, `repair_tail_composition_power_cut_signature_to_unlock_and_reopen`), dont les processus enfants sont morts (statuts `0xC0000409` et `0x80000003`, « VirtualAlloc failed » : mémoire de l'hôte épuisée, verrou tenu par une autre session) ; rejoués seuls (`k-mutants-r2-only.mjs` `953be3bc…`, filtre `ONLY`, 00:10:38Z → 00:10:59Z, témoin 104 ok, `RESULTS-K-before-rerun-K4-K5.txt` `a5d87ede…`) : **K-4 et K-5 survivent**. Aucune trace de ce type dans les trois autres passes (recherche des statuts et de `VirtualAlloc` dans tous les TAP).

### 19.6 Sondes du G2 rejouées (iv, vi, vii, ix, et `--floor=5` par le bin)

- `probes-replay.mjs` (`a2366612…`, correcteur 1) : les sondes du G2 (`daae784a…`) réécrites en lignes vérifiées sous la forme corrigée, sur des arbres autonomes (sources du paquet seules) : corrigé (= worktree), G1 (`reconcile.ts` `429c5438…`, `cli.ts` `94fc2a05…`), sources de `3cd3c0e` (`6e62cd6a…`, `dccbe95f…`) pour le binaire ancien ; pièges socket/DNS armés, `fetch` bouchonné (15 appels par exécution).
- **Arbre corrigé : 37/37 OK** (00:11:29Z, `r2/probes/probes-r2-corr.out` `be36b064…`) : (iv) 22 lignes `NO-GO snapshot_not_finite`, exit 1, sans tableau, avec leur ligne (`"abc"`, `"3.69M"`, `"1,234,567"`, `null`, `"1234567"` × deux familles × deux fenêtres ; bin avec `"1,234,567"` puis `1e999`) ; (vi) forme servie et `--course-end=<sha>` : `NO-GO hard:getTransactionsForAddress` et ligne `course_reconciled` ; `--course_end`, `--courseEnd`, `--Course-End`, `--course-en` : `unknown option`, 0 octet ; bin avec `--floor=5` après la sous-commande : exit 2, stderr `rpc-guard: unknown option`, 0 octet ; (vii) sans drapeau : GO et ligne `reconciled` (précondition du mode historique rompue : le faux GO que le RUNBOOK nomme désormais) ; binaire ancien avec `--course-end` : même faux GO (TY-3) ; (ix) instantanés inversés : `NO-GO negative_delta:getTransactionsForAddress` dans les deux fenêtres (tableau en mode course) ; bon ordre : `hard` ; agrégé inversé : `negative_delta` (inchangés).
- **Arbre du G1 : 30 DIFF, 7 OK** (00:11:32Z, `probes-r2-g1.out` `e75b23ad…`) : les 30 lignes corrigées sont rouges (iv : GO exit 0, chaîne coercée ou `hard` ; vi : GO et ligne `reconciled` pour les quatre graphies et `=`, `--floor=5` ignoré en silence ; ix : GO) ; les 7 lignes inchangées sont vertes (vi forme servie, vii ×2, ix ×4).

### 19.7 Oracles différentiels : preuve de la ligne datée (ADR, écrite à 19:51:16Z sous la décision)

- **Mode historique, entrée quelconque** (`diff-oracle-corr.mjs` `48526d2f…`, correcteur 1 : générateur et règle de graine du G2 `5eaecdd5…`, plus un classifieur) : 2 000 scénarios, graine 20260927, ANCIEN = sources de `3cd3c0e`, NOUVEAU = corrigé : **0 différence inexpliquée** ; 2 865 passes identiques (dont 1 287 sur entrée invalide répondue à l'identique : rollover, réparation, refus de forme ou `hard` d'abord) ; 727 scénarios arrêtés sur une différence expliquée par leur entrée (655 `snapshot_not_finite`, 72 `negative_delta:<m>`) (00:12:15Z → 00:13:34Z, `r2/diff/diff-2000-r2.out` `f49b0765…` ; lignes de synthèse égales à celles du correcteur 1). Sensibilité (600 scénarios, mutants recréés par `mk-sens.mjs` `945b00aa…`) : G-5 ⇒ 29 inexpliquées, M-R5 ⇒ 28.
- **Mode historique, entrée valide** (nouveau, correcteur 2 : `diff-valid-r2.mjs` `63123a40…` ; même générateur de grand livre ; relevés valides seulement : entiers finis ≥ 0, après ≥ avant par méthode ou au total, mêmes clés, le champ du mode, le bon cycle ; toute différence y est inexpliquée) : 2 000 scénarios, graine 20260928, **4 000/4 000 passes identiques** (résultat et chaque octet) : GO 394, `calibration_soft` 360, `hard:<méthode>` 977, `hard:total` 1 437, `repaired_in_window` 736, `soft` 96 (00:14:05Z → 00:15:44Z, `diff-valid-2000-r2.out` `c86f3e5a…`). Sensibilité : G-5 ⇒ 122/600 inexpliquées, M-R5 ⇒ 83/600. Il couvre le point faible du premier (19 GO et 4 `soft` seulement parmi ses passes identiques).
- **Niveau argv** (`argv-diff.mjs` `747a987c…`, correcteur 1, mode historique seul) : 400 cas, graine 20260927 : 210 argv valides ⇒ résultat et octets identiques ; 190 invalides (drapeau inconnu 42, graphies voisines 38, répétitions 37, formes `=` d'autres drapeaux 38, jeton isolé 35) ⇒ `unknown option`, répertoire intact, aucun jeton cité (00:18:50Z → 00:19:10Z, `argv-400-r2.out` `fe3de5ef…`, synthèse égale à celle du correcteur 1). Sensibilité : contrôle retiré (K-13) ⇒ 190/190 non refusés.
- Limite du classifieur : il vérifie qu'une différence est justifiée par l'entrée, non la préséance entre deux motifs justifiés ; cette préséance (`hard` > `negative_delta`) est épinglée par le test (1) (K-9 tué).
- Composition `-d3` (`dojo_history_budget_stops_fail_closed`) : **[repris, non rejoué]**, hors des Preuves de la mission ; constat du correcteur 1 : ses relevés sont des nombres finis ≥ 0 (`h0.byMethod = {}` : `every` sur un tableau vide) et ses appels n'utilisent que des drapeaux de l'ensemble fermé ; O-3 la confie au cp-2.

### 19.8 Oracle : sept gates sur un clone fusionné au tronc, sous verrou d'hôte « corr RG-1a (reprise) », test 42 à part

- **Arbre** (correcteur 2) : `F:/tmp/dojo/rg1a-corr/clone2` = `git clone --no-local --branch lot/rpc-guard-reconcile-1 F:/Monark` (00:19:50Z) + fusion du tronc `lot/etude-suite` à sa tête `ddd69b3` sur le clone seul (Q-1 : commit jetable `af4f2e5`, arbre `2fadb5dc…`, `3416807` ancêtre ; le tronc ne touche aucun des 11 fichiers ; depuis `13fd0b4`, `docs/` seul) ; jonctions `mk-nm.ps1` (220 / 10 / 0, 00:20:19Z, lancé par l'outil PowerShell) ; les 11 fichiers resynchronisés du worktree à la prise, ce journal compris (sans la ligne de résultat ci-dessous, ajoutée après le rendu du verrou).
- **Scripts nommés par session** (Q-G2-5 du G2) : `r2/scripts/corr-rg1a-r2-{lock,hold,gates,sync,host}.sh` ; attente par pas de 60 s jusqu'à 120 min (règle 5 de la reprise) ; retrait du verrou dans le piège EXIT ; `node.exe` comptés à la file, à la prise, au test 42 et au rendu ; aucun test du correcteur 2 entre la mise en file et le rendu.
- **Oracle 2 (fait foi)** : en file à 00:27:09Z (processus Windows 7628 ; `node.exe` 31) derrière « G1 K-1a reprise » puis « corr RG-1c » ; **verrou pris à 00:42:12Z après 900 s** ; les 11 fichiers synchronisés à la prise (`lot-sha-at-take.txt` : les dix du § 19.2, ce journal à `bbcba92d…`, sans la présente ligne) ; `node.exe` 25 à la prise, 24 au test 42, 25 au rendu ; **sept gates : 7/7 exit 0** (00:42:20Z → 00:51:16Z) — `gate:vocab` (322 fichiers, 0), `typecheck`, **`test` : 1 454 tests, 1 451 pass, 0 fail, 0 annulé, 3 sautés préexistants** (`sentinel_run_releases_chainstack_lock_on_sigterm`, `sentinel_instrument_out_win32_short_name`, `u4b_labels_replay_via_main_real_artifact`), 483,3 s ; `lint` ; **`lint:ratchet` 69/69** ; `lang:gate` (0 coup) ; `export:check` (0 chemin interdit, 0 coup). Par nom, ✔ : les six tests du lot, les deux amendés de `repair-tail.test.ts`, la liste de D-5, `fetch_only_inside_client`, `no_secret_in_repo`, 36 `u4_*`, `ukemi-guard-record.test.ts` 31/31 (Q-O4, à titre d’information), et les deux tests du tronc neuf qui composent le bin (`dojo_collect_tree_is_the_import_closure`, `dojo_collect_unit_runs_the_real_tick`) ; `ledger_format_locked_to_rebase_crosscheck` exécuté, jamais sauté. **Test 42 à part**, même prise : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` ⇒ exit 0, `tests 2, pass 2, fail 0` (`export_public_no_governance_no_french` ✔ 255,2 s), 00:55:33Z ; **verrou rendu à 00:55:34Z par le piège** (`command exit=0`), repris par « G1 K-1a reprise » à 00:55:40Z. sha256 : `test.log` `80560d42…`, `t42/test42.log` `449b8b2b…` ; les six autres journaux égaux à ceux que citent le G1 (§ 12) et le G2 (§ 9) : `03481a8f…`, `f845417c…`, `54da045d…`, `b22ac8f8…`, `2f9645a9…`, `45ede4ce…`.
- **Oracle du correcteur 1** : **[repris, non rejoué]**, voir § 19.0 (arbre `0ebe245`, tronc `a3dbf31`, 7/7 exit 0, test 42 2/2).

### 19.9 Aucun réseau, rien sur C:, git

- Greps sur les lignes ajoutées (correcteur 2, 00:19:40Z, `r2/greps-r2.txt`) : diff de correction (81 lignes non vides) : `fetch(`, `node:http(s)`, `undici`, `http(s)://`, `process.env`, `api-key`, `API_KEY`, `console.`, `child_process`, `node:net`, `node:dns`, `WebSocket` : **0** chacun ; lot entier contre `HEAD` (353 lignes non vides) : `fetch(` 0, `http(s)://` 0, `process.env` 0 ; `child_process` 1 (le bin du test (5), inchangé depuis le G1), `node:net` et `node:dns` 1 chacun (les pièges).
- Aucun appel réseau réel ; aucun navigateur ; aucune page lue. TEMP/TMP/TMPDIR sur F: pour chaque exécution ; le binaire `node` de C: exécuté, jamais écrit.
- Git : worktree en lecture seule (`--no-optional-locks`) ; écritures git dans les seuls clones jetables (`clone`, `clone2` : fusion du tronc, Q-1 ; `clone-r25` : commit jetable du R-25).

### 19.10 Écarts déclarés

1. (correcteur 1) **C-V-4** : pendant la prise de son PREMIER verrou (19:54:55Z → 19:58:10Z), des tests ont tourné (mutants du G1 19:55:24Z → 19:56:10Z ; un rejeu du G2 vers 19:56Z, arrêté ; `course-window.test.ts` à 19:56:54Z), contraire à « aucun test pendant la prise de son verrou ». Cause : verrou libre à la mise en file (pris en 60 s) et resynchronisation à la prise d'un fichier de test encore modifié. Parade : cet oracle arrêté et écarté, passages suivants séquentiels et hors verrou. `error_origin` : correcteur 1.
2. (correcteur 1) `mk-nm.ps1` appelé depuis bash avec des barres inverses (19:53:06Z) : chemin altéré, jonctions créées sous `F:/tmp/dojo/rg1a-corr/scripts/tmpdojorg1a-corrclone/node_modules`, retirées par `rm-nm.ps1` ; `F:/Monark/node_modules` intact ; appels suivants par l'outil PowerShell.
3. (correcteur 1) Fichier transitoire dans le worktree : `zz-ratchet-one.mjs` copié à sa racine pour compter les règles du cliquet (19:49Z), retiré dans la même commande ; `git status --short` identique avant et après.
4. (correcteur 1) Une commande de plus de 6 Ko (l'écriture par heredoc de `diff-oracle-corr.mjs`, 6 607 octets, contrôlé par `node --check`) ; une autre, de plus de 6 Ko aussi, a échoué à l'analyse du shell sans rien écrire.
5. (correcteur 1) Les sondes du G2 ne sont pas exécutées en place (le script écrit dans `g2-rg1a/`) : copie de rejeu écrite à neuf (§ 19.6).
6. (correcteur 1) Mort à la limite de session avant la remise : journal, livraison et rapport non écrits ; sa troisième file d'oracle a fini sans lui (§ 19.0). `error_origin` : hôte (limite de session), aucun défaut de code.
7. (correcteur 2) Passe « avant » des mutants K : deux rouges d'environnement (K-4, K-5 : enfants morts, mémoire de l'hôte), rejoués seuls et écartés (§ 19.5).
8. (correcteur 2) Ce § 19 est entré au worktree avant l'oracle 2 ; seule la ligne « Oracle 2 » est remplie après le rendu du verrou (docs seuls). Inerte pour les gates (lus dans leurs scripts : `lang-gate` saute `docs/`, `gate:vocab` ne lit dans `docs/` qu'une liste Narabi explicite, `export:check` exclut `docs/**`) ; dans les tests, le seul parcours qui lit ce fichier est celui de `no_secret_in_repo` (recherche des parcours de l'arbre : les autres sautent `docs/` ou lisent des listes nommées) : ces trois gates et ce test sont rejoués sur l'état final (§ 19.13).

### 19.11 Questions formées (aucun « dû » nu ; inchangées depuis le correcteur 1, sauf O-C1)

- **Q-C1 (orchestrateur ; C-G2-2)** : « `cli.ts` reconnaît l'ensemble fermé des graphies (`--course-end <sha>`, `--course-end=<sha>`, …) » est lu comme deux graphies **reconnues** ; la forme du G2 (§ 13) refusait `--course-end=<A>`. Alternative : la refuser aussi ; prix : −1 ligne (`flatMap` de `cli.ts:22`), au test (2) l'assertion `=` passe de `LockHeldError` à `unknown option` et l'épingle de la raison d'`unlock` (2 lignes) tombe ⇒ R-25 397. À confirmer, ou à renverser par ligne datée. Propriétaire : l'orchestrateur ; déclencheur : G7 de 1a.
- **Q-C2 (orchestrateur ; Q-G2-1 (a))** : préséance déclarée `hard:<m>` > `negative_delta:<m>` > `soft` (la consommation hors du garde prime sur une paire mal formée ; divergence avec `3cd3c0e` limitée aux entrées qu'il rendait GO ou `soft`). Alternative : `negative_delta` d'abord, 0 ligne, une assertion du test (1) change. À confirmer.
- **Q-C3 (orchestrateur ; PAROXYSME, limite de C-G2-1)** : une valeur finie mais **négative** (`-5`) ou **non entière** (`1.5`) passe `snapshot_not_finite` ; un delta négatif est pris (`negative_delta`), mais `before -10, after -5` (delta +5 ≤ compte) rend GO sur une donnée impossible. Les relevés « Copy CSV » lus sont des entiers ≥ 0 (`docs/course-bell/FAITS-floor-helius-n2-2026-09-22.md` l.8-13, [lu] par le correcteur 1). Construction : prédicat `(v) => Number.isInteger(v) && v >= 0` (même motif ou `snapshot_invalid`, ligne datée) ; prix : 0 ligne de code, deux valeurs de test ; déclencheur : avant le premier acte en `--course-end` (acte 1 de DOJO-HISTORY-ACTE-1) et avant le prochain rapprochement Bell ; propriétaire : l'orchestrateur.
- **O-C1** (correcteur 1 : rapport G2 à places vides) : **close** (rapport final `5982b5c1…`, § 19.0).

### 19.12 `error_origin` proposés (à assigner au G7)

| Point | `error_origin` proposé |
|---|---|
| C-G2-1 | code antérieur au lot (`reconcile.ts`, GARDE-HELIUS tâche 4 et GARDE-HELIUS-2), hérité par le mode course ; détecté et déclaré par le G1 (Q-5) |
| Q-G2-1 | code antérieur au lot (GARDE-HELIUS-2, C-V-5 : `negative_delta` posé sur le seul mode agrégé) ; détecté par le G2 (sonde ix) |
| C-G2-2 | générateur du G1 (lecture au jeton exact, `cli.ts:33` du G1) |
| C-G2-3 | G0 (libellé ADR TY-1/TY-3), repris par le G1 au RUNBOOK |
| C-G2-4 | générateur du G1 (déclaré par lui, Q-8) |
| C-G2-5 | générateur du G1 (tests) |
| écarts 1 à 5 du § 19.10 | correcteur 1 |
| écart 6 du § 19.10 | hôte (limite de session) |
| écarts 7 et 8 du § 19.10 | correcteur 2 (7 : environnement de l'hôte) |

### 19.13 Livraison et état final

- `F:/tmp/dojo/rg1a-corr-deliver/` : les 11 fichiers (arborescence du dépôt, relus contre le worktree par `cmp`), `evidence/` (reprise : état d'ouverture et gel ; R-25 des deux méthodes ; journaux de tests, `tsc`, `eslint`, cliquet et témoin ; `corr-r2.diff`, `lot-r2.diff`, `greps-r2.txt` ; `mutants/` : quatre RESULTS, le rejeu K-4/K-5, harnais et liste ; `probes/` ; `diff/` : trois oracles, sorties et sensibilités ; `oracle-2/` ; `oracle-1-repris/` : l'oracle du correcteur 1, pièce historique ; `final-state/` : passes A et B ci-dessous ; `scripts/`), `DELIVERED.sha256` (sha256 de chaque fichier livré, `sha256sum -c` : 0 écart). sha256 de ce journal : rendu hors du fichier. Le rapport du correcteur (< 6 Ko) est rendu dans la réponse structurée destinée à l’orchestrateur, jamais en fichier (consigne du harnais des sous-agents).
- Rejeu sur l'état final (hors verrou, après son rendu ; `r2/scripts/corr-rg1a-r2-final.sh`) : les 11 fichiers resynchronisés dans `clone2`, puis `gate:vocab` (322 fichiers, 0), `lang:gate` (0 coup), `export:check` (0 chemin interdit, 0 coup) et `test/no-secret-in-repo.test.ts` (1/1) : exit 0 chacun ; passe A (00:56:41Z → 00:56:53Z) sur ce journal avant la présente ligne (`07492d32…`) ; passe B sur le fichier final, cette ligne comprise : même résultat, heures dans `evidence/final-state/header.txt`.

### 19.14 Advisor

- Correcteur 1, outil intégré, après l'orientation et avant toute écriture : lecture face-value de C-G2-2 déclarée et réversible, discriminant `LockHeldError` contre `unknown option` sous verrou vivant, aucun répertoire créé, message sans jeton, répétitions refusées, cas `--floor=5` ; insertions après la l.115 de `reconcile.ts` ; préséance `hard` d'abord ; ancres des mutants intactes ; oracles différentiels à classifieur et argv ; sondes copiées ; passe « avant » ; logistique du verrou ; ADR en ajout seul. Seconde consultation, fichiers gelés et oracle en file : journal assemblé hors du worktree puis ajouté une fois, liste de contrôle après l'oracle, déclarations, livraison.
- Correcteur 2, outil intégré, après l'orientation de reprise : état cohérent, à réutiliser sans rien réécrire ; tous les rejeux hors verrou et avant la mise en file (le verrou libre est la condition de l'écart 1) ; sorties neuves ; contrôle des arbres par `cmp` ; clone neuf fusionné au tronc courant (la fusion PR-3b-1 épingle la fermeture d'import du bin) ; § 19 au worktree avant la file, une seule ligne remplie après ; scripts nommés par session, attente plafonnée à 120 min ; rejeu des gates de `docs/` et de `no_secret_in_repo` sur l'état final. Seconde consultation avant la remise : rendue hors du fichier.
- Chaque point vérifié sur pièce ; conseil, jamais verdict.
