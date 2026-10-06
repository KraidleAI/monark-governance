claude-opus-5-5[1m]

# G2 — PR-1b-1 MONARK Dōjō (`walkDojoTimeline`, fixture signée) : relecture adversariale, instance fraîche

- **Relecteur** : worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, décision 133), effort max, contexte frais, **différent du générateur**. Mission `F:\tmp\dojo\mission-g2-pr1b1.md` (sha256 `409d1c80315c03f46ee18461cdcac88752fce29af818e14104dd3b67d6622635`). Relecture et rejeux du 2026-09-26, 19:0x-19:3x UTC (`date -u`). Aucun commit, aucun workflow (R-20) ; aucune modification du worktree ; aucun réseau ; rien écrit sur C: ; commandes < 6 Ko.
- **Verdict** : **CORRECTIONS D'ABORD** — une correction bloquante (C-G2-1 : la lettre du mutant M-K2 de la mère, « ligne `history` acceptée après un `snapshot` », n'est falsifiée par aucun test) ; huit non bloquantes (C-G2-2 à C-G2-9). Le code du marcheur est fidèle ; les écarts sont des trous d'épinglage des tests et des lacunes de répartition de la mère.

## 1. État du worktree `F:\Monark-wt-dojo`

- **À l'ouverture** (avant 19:09:19 Z, première horloge relevée) et **après** (19:26 Z), identiques : branche `lot/dojo-snapshot-1`, HEAD `711b5c9897457322cd6b8dcb4bd6e56229f681f2` ; `git status --porcelain` = `?? apps/dojo/scripts/dojo-chain.d.mts`, `?? apps/dojo/scripts/dojo-chain.mjs`, `?? apps/dojo/test/dojo-chain.test.ts`, `?? apps/dojo/test/helpers/dojo-fixture.ts`, `?? docs/G1-lot-dojo-pr1b1.md` ; `git diff --stat HEAD` vide ; `sha256sum -c F:\tmp\dojo\pr1b1-deliver\DELIVERED.sha256` 4/4 OK ; journal `ec942bdd…` (238 l.). `git diff --stat HEAD -- apps/bell apps/dojo/scripts/dojo-core.mjs apps/dojo/scripts/dojo-core.d.mts package.json tsconfig.json package-lock.json apps/dojo/package.json` vide.
- **Git** : lecture seule dans le worktree et dans `F:\Monark` (`rev-parse`, `status`, `diff --stat`, `worktree list`) ; `git clone --no-local --branch lot/dojo-snapshot-1 F:/Monark F:/tmp/dojo/g2-pr1b1/clone` (HEAD `711b5c9`, `objects/info/` vide : pas d'`alternates`) ; `git add -N` **dans ce clone seul** (quatre fichiers + journal, pour R-25). **Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`**, aucun `add`/`commit`/`stash`/`checkout`/`branch` dans le dépôt.
- **Jonctions** : `node_modules` du clone posé par `F:\tmp\g2-garde2bi\mk-nm.ps1` (`entries: 220  monark: 10  fail: 0`, `@monark/rpc-guard` → `F:\tmp\dojo\g2-pr1b1\clone\packages\rpc-guard\src\index.ts`, `mknm.log`), retiré par `rm-nm.ps1` (`removed: F:\tmp\dojo\g2-pr1b1\clone\node_modules`, `rmnm.log`) ; `F:\Monark\node_modules` relu intact (220 entrées, 10 `@monark`). **Les deux clones du G1** (`F:\tmp\dojo\pr1b1-clone`, `F:\tmp\dojo\pr1b1-clone-base`) portent toujours leurs jonctions (journal §11) : non touchés ; retrait par `rm-nm.ps1 -Tree <arbre>` avant toute suppression de `F:\tmp\dojo`.

## 2. Méthode (chaque chiffre a son fichier sous `F:\tmp\dojo\g2-pr1b1\`)

- Lecture intégrale : journal G1 ; `dojo-chain.mjs` (156 l.), `.d.mts` (13), fixture (151), tests (248) ; `bell-chain.mjs` (175 l., sha256 `521270a3…6ce7`) ; ADR-mère (861 l., sha256 `2a12a854…4bda`) D-3, D-4, D-7 à D-10, D-16 à D-18, §6 PR-1b-1, §7, sixième et septième plis ; CHANTIERS du tronc l.1629 (18:2x, décisions Q-1..Q-8) ; harnais et résultats du G1.
- Rejeux sur **mon** clone, jamais sur ceux du G1 : tests Dōjō (`tests-clone.log`) ; R-25 par un extracteur neuf qui **exécute** la commande de `ci.yml:82` et le programme `awk` de `ci.yml:90` tels qu'extraits du fichier (`r25-g2.sh`) ; harnais du G1 redirigé (`mutants-replay.mjs`, seules `SRC`/`OUT`/`TEMP` changent, `diff` relu) ; **29 sondes à moi**, harnais écrit par moi (`probes-g2.mjs`, `probes.json`) ; entrées signées qui distinguent chaque survivante de l'original (`bp.mjs`, `bp.log`) ; correctifs de test proposés, prouvés sur copies (`corr/`) ; oracle à 7 gates, **journal G1 compris dans l'arbre** (`oracle/`).

## 3. Checklist fermée (une ligne de verdict par point)

| # | Point | Verdict | Preuve (reproductible) |
|---|---|---|---|
| 1 | R-1 | **CONFORME** | Journal l.1 `Modèle résolu : claude-opus-5-5[1m]`, provenance §13 ; ce rapport l.1 `claude-opus-5-5[1m]`. |
| 2 | R-25 | **CONFORME** (568) | `r25-g2.log` (sha256 `f13d576b…d1a9`) : commande de `ci.yml:82` exécutée verbatim (20 jetons, plage remplacée par `711b5c9`), `awk` de `ci.yml:90` verbatim : `4 files changed, 568 insertions(+)`, **CHANGED = 568** (13 + 156 + 248 + 151) ; journal ajouté en `-N` et exclu (4 fichiers comptés) ; contre-épreuve sans écriture `git ls-files --others --exclude-standard -- <pathspec>` : 568. Sous le STOP 1 150 et la borne CI 1 205 (`ci.yml:49`) ; +8 sur la cible ≤ 560, déclaré (Q-8). Avec tous les correctifs de test proposés : **589** (mesuré, §5) ; avec C-G2-1 seule : 569. |
| 3 | Tests rejoués et lus | **CONFORME**, sauf C-G2-1 | `tests-clone.log` : **27/27** (13 `dojo_walk_*` + 14 de PR-1a), exit 0, sans `node_modules`. Oracle : **1 358 / 1 356 / 0 / 2**, 13 `dojo_walk_*` ✔, 0 ✖ (`oracle/test.log` `78ce26a6…fe38`). Lus : attendus écrits en littéraux (`refused(n, code)`), jamais lus du marcheur ; H^j recodé dans la fixture (même algorithme, code séparé) ; corpus renommé : 25 scripts, verdict de Bell asserté égal à l'attendu puis Dōjō égal à Bell (`test.ts:76-77`), 8 raisons de Bell atteintes, adjacence des 9 paires de l'ordre de Bell, trousseau fourni révoqué ; un test par invariant (13, table §4 du journal). Mais le test nommé par la mère l.391 ne falsifie pas la lettre de M-K2 (C-G2-1). |
| 4 | Mutants | **CORRECTION bloquante (C-G2-1)** ; non bloquantes C-G2-2 à C-G2-6 | 42 du G1 rejoués : **42/42** tués par le test visé ; mon `RESULTS.txt` est **identique octet pour octet** à celui du G1 (sha256 `a8e6e42d…1ba` des deux côtés). Mes 29 sondes (§4) : 14 tuées, 2 équivalentes, **13 survivantes non équivalentes**, chacune distinguée par une chronologie signée (`bp.log`). Correctifs proposés : les 13 tuées, original vert, 42/42 du G1 toujours tués (§5). |
| 5 | Calque | **CONFORME** (+ C-G2-7 (c), texte) | `diff` régénéré (`bell-chain.mjs` l.125-157 contre `dojo-chain.mjs` l.118-156) **identique** au livré (sha256 `b85a3442…9515`, 30 l.). Ordre des contrôles, conditions, raisons, calendrier des clés : identiques. `isJwk` (l.18) = `bell-chain.mjs:103` octet pour octet. `KINDS` : 6 types de D-8 l.227. Imports ⊂ P-15 l.594. Mes sondes d'ordre G2-K1 à K3 tuées. Écart non déclaré, sans effet : commentaire de section ajouté (hunk `7c9,10`). |
| 6 | Codes de refus | **CONFORME** (+ C-G2-7 (b), C-G2-8) | 14 raisons = 13 codes de D-10 l.248 + `rotation_key_not_in_keyring` (Q-1 ; émis par Bell `bell-chain.mjs:134`, présent dans `VERIFY_REFUSALS` `bell-verify.mjs:17`, absent de D-10 entre `chain_broken` et `key_not_in_keyring` : relu). Liste d'exécution = union du `.d.mts`, même ordre ; chacune émise par le source. Aucun code inventé. L'extraction de D-10 par le test porte 45 jetons, dont `snapshot` (un type) : C-G2-7 (b). |
| 7 | Fidélité D-8/D-17/D-18/§3 ; fichiers gelés | **CONFORME** sur les règles du marcheur (D-8 l.228) ; lacunes de répartition → C-G2-9 | §6 ci-dessous. `apps/bell/**`, `dojo-core.*`, `package.json`, `tsconfig.json`, `package-lock.json` intouchés. |
| 8 | MAST | FM-1.2 : aucun ; FM-2.4 : mineur (C-G2-2) ; FM-3.1 : aucun ; FM-3.3 : partiel (C-G2-1) | §7. |
| 9 | Hygiène | **CONFORME** | Clés `generateKeyPairSync("ed25519")` à l'exécution ; trousseau servi = `x` seul (`keyringOf`), jamais `d` ; `servedTree` = `Map` en mémoire, aucun fichier écrit ; 0 URL, 0 matériel de clé, 0 chemin `F:`/`C:` dans les sources ; `grep-forbidden.mjs` avec les 4 fichiers en cible : 321 fichiers, 0 occurrence (`vocab-targets.log`) ; 0 CR, 0 octet non ASCII, LF final ; secrets des graines = sha256 d'un libellé, déclarés SYNTHÉTIQUES. |
| 10 | Questions Q-1..Q-8 | Choix fail-closed **justes** ; décisions appliquées, sauf trois points de texte | §8 ; C-G2-2 (Q-7), C-G2-7 (a) (Q-1, Q-3), C-G2-8 (Q-6). |

## 4. Mes sondes (29 ; au moins une par contrôle d'ordre demandé)

Harnais `probes-g2.mjs` (sha256 `c427326f…26f5f`), liste `probes.json` (`a58295e4…afceb`) ; copies sous `probes\<id>\` ; **tuée seulement si le TAP porte `not ok N - <test visé>`** ; témoin : 0 `not ok`, 13 `ok` ; résultats `probes\RESULTS.txt` (`84c8fb60…6f8e`). Survivantes distinguées par `bp.mjs` (`6cf333f4…0877`) → `bp.log` (`dfa93ebf…874d`) : même chronologie signée, verdict de l'original contre celui du mutant.

| Contrôle | Tuées (test rouge) | Survivantes : entrée signée, original → mutant |
|---|---|---|
| `anchor` en tête | G2-A2 (contrôle déplacé après ceux du type) | **G2-A1** une `key_rotation` bien formée en tête : `refused(1, anchor_missing)` → `ok` (Bell : `ok`) |
| `history` unique/placée | G2-H5 (borne inclusive) | **G2-H1** seconde `history` après le premier `snapshot` : `refused(4, timeline_malformed)` → `ok` ; **G2-H2** historique d'un jour (jour 1 seul) : `ok` → `refused(2, …)` ; **G2-H3** `history_root` non hex : `refused(2, …)` → `ok` ; **G2-H4** `history_lines_count` −1 : idem |
| versions croissantes | G2-V2 (même jour d'effet), G2-V4 (effet sur le dernier jour publié) | **G2-V1** comparée à la PREMIÈRE version (versions 1, 2, 2) : `refused(14, timeline_malformed)` → `ok` ; **G2-V3** version en vigueur = la première applicable (`find`) : `snapshot` nommant v2 après son effet `ok` → `refused(14, version_not_in_force)`, et dans l'autre sens un `snapshot` nommant la v1 périmée est **accepté** (échec ouvert) |
| `price_window_days ≠ 7` | G2-W1 (≥ 7), G2-W2 (`Number()`) | G2-W3 (longueur comparée au littéral 7) : **équivalente** — `anchorForm` impose `=== 7` à toute ancre acceptée et la ligne 1 est toujours une ancre |
| graines, chaîne H(g_d) | G2-S1 (horizon inclusif), G2-S2 (horizon depuis la dernière graine), G2-S3 (j depuis l'ancre) | G2-S4 (chaque graine chaînée à a_0) : **équivalente** sous résistance aux collisions de SHA-256 (H^(d−a)(g_d) = a_0 et H^(p−a)(g_p) = a_0 avec H^(d−p)(g_d) ≠ g_p exigent une collision de l'itéré) ; **G2-S5** graine juste écrite en MAJUSCULES : `refused(3, timeline_malformed)` → `ok` ; **G2-S6** `seed_anchor` « zz » : `refused(1, …)` → `ok` |
| révélation en retard | G2-R1 (dès midi), G2-R2 (1 ms en avance) | **G2-R3** règle appliquée au seul premier `snapshot` : second `snapshot` publié pendant son jour `refused(4, seed_revealed_early)` → `ok` |
| ordre du calque (M-K1) | G2-K1 (signature après clé active), G2-K2 (clé de rotation après clé), G2-K3 (révocation avant clé active) | — |
| formes | — | **G2-F1** jour sans aller-retour (`"2026-09-31"`, que `Date.parse` rend 2026-10-01, mesuré) : `refused(2, …)` → `ok` ; **G2-F2** `threshold_unit` « 0 » : `refused(10, …)` → `ok` ; **G2-F3** `mint` vide : `refused(1, …)` → `ok` |

Bilan : 14 tuées, 2 équivalentes, **13 survivantes non équivalentes**. Le §5 du journal écrit que ses sondes servent « à prouver que chaque règle est épinglée » : exact pour ses 42 et pour les conditions du calque, pas pour les formes ni pour trois règles d'ordre (M-K2 à la lettre, première version applicable, révélation hors premier `snapshot`).

Sondes de comportement sur l'**original** (`bp.log`), hors mutants : (i) `history_last_day` = veille du jour de l'ancre : **accepté** (le jour de l'ancre n'est ni historique ni lu) ; (ii) version 1 calculée sur une fenêtre de jours d'**historique** (2026-09-10 à 09-16), en vigueur dès le premier jour lu : **acceptée** ; (iii) nouvelle ancre datée d'un jour déjà couvert par un `snapshot` publié : **acceptée** ; (iv) `price_version` avant la ligne `history` : acceptée (aucune règle ne l'interdit). (i) à (iii) → C-G2-9.

## 5. Corrections

Preuve commune des correctifs de test : `corr\dojo-chain.test.proposed.ts` (sha256 `b8e96208…e4b5`) = fichier livré + insertions exactes (`corr\patch-test.mjs`, ancres comptées une fois ; `corr\proposed.diff` `d14c5277…9256`). Rejoué (`corr\corr-check.mjs` → `corr\RESULTS.txt` `5a2163ab…cff4`) : original **14/14 vert** ; les 13 survivantes **tuées par le test visé** ; G2-W3 et G2-S4 vertes (équivalentes). Les 42 mutants du G1 restent tués avec ce fichier (`mutants-proposed\RESULTS.txt`, `62a012e6…4b01` : 22/22, 42/42). `tsc --noEmit` exit 0 et `eslint --max-warnings 0` exit 0 sur le fichier proposé (dans mon clone, fichier livré restauré ensuite, `sha256sum -c` 4/4 OK). R-25 avec ce fichier : **589**.

- **C-G2-1 — BLOQUANTE (worker)** — `apps/dojo/test/dojo-chain.test.ts`, après la l.107 (test `dojo_walk_places_history_before_the_first_snapshot`). Motif : la mère l.391 nomme M-K2 « ligne `history` acceptée après un `snapshot` » ; le M-K2 du G1 (un `snapshot` sans `history` avant lui) est tué, mais la réalisation littérale (G2-H1 : unicité contrôlée avant le premier `snapshot` seulement, si bien qu'une seconde `history` après un `snapshot` passe) survit aux 13 tests ; le consommateur prévu ne la borne pas (D-10 l.247 : « la ligne `history` », au singulier). Texte attendu :
  ```ts
    assert.deepEqual(run(f, (s) => { s.splice(3, 0, { key: f.key, body: { ...body(s, 1) } }); }), refused(4, "timeline_malformed"), "a history line after the first snapshot (M-K2, l.391)");
  ```
  Et au journal : G2-H1 ajouté à la table du §5 (par ex. « M-K2b », test visé `…places_history_before_the_first_snapshot`) et au harnais, chiffres des §2, §4 à §6 mis à jour.
- **C-G2-2 — non bloquante (worker)** — (a) `dojo-chain.test.ts`, après la l.120 (test `dojo_walk_requires_the_anchor_first`), trois lignes (G2-A1 ; l'assertion est aussi le témoin de la divergence déclarée) :
  ```ts
    const [R1, R2] = [newKey(), newKey()], r12 = trustOfKeys([R1, R2]); // a well-formed key rotation first: Bell's walk accepts it (declared divergence, Q-7)
    const rp = renamedPair([{ t: "rotate", by: R1, to: R2 }, { t: "content", by: R2 }, { t: "content", by: R2 }, { t: "content", by: R2 }]);
    assert.deepEqual([verdict(walkTimeline(rp.bell, r12)), walk(rp.dojo, r12)], [OK, refused(1, "anchor_missing")], "a key rotation first");
  ```
  (b) journal l.210 (Q-7), « seul verdict divergent de Bell » est **inexact** : mesuré (`bp.log`), une chronologie dont la première ligne est une `key_rotation` bien formée rend `ok` chez Bell et `refused(1, anchor_missing)` chez Dōjō. Texte attendu : « deux verdicts divergents de Bell, hors du corpus renommé : la timeline vide, et une timeline ouverte par une ligne de clé bien formée ». (c) `dojo-chain.test.ts` l.113-114, « the one declared exclusion of the renamed corpus » → « the two declared exclusions of the renamed corpus (empty timeline; a key line first), G1 journal Q-7 ».
- **C-G2-3 — non bloquante, recommandée (worker)** — version en vigueur « jusqu'à la suivante » (D-3 l.175) et croissance sur la dernière version. G2-V3 échoue **ouvert** : un `snapshot` qui nomme la v1 périmée après l'effet de la v2 est accepté ; M-V6 couvre « la dernière publiée », pas « la première applicable ». Le vérificateur (PR-1b-2, D-10 l.247 « version en vigueur au jour de chaque snapshot ») la bornera s'il la recalcule sans le marcheur : d'où « non bloquante ». Après la l.223 (test `…names_the_version_in_force`) :
  ```ts
    const v2 = (named: number) => (s: Step[]): void => { s.push({ key: f.key, body: versionBody(2, FIRST + 2, at(FIRST + 9, 2)) }, { key: f.key, body: snapshotBody(FIRST + 9, f.seed(10), named) }); };
    assert.deepEqual(run(f, v2(2)), OK, "after version 2's effective day: version 2");
    assert.deepEqual(run(f, v2(1)), refused(14, "version_not_in_force"), "after version 2's effective day: the stale version 1");
  ```
  Après la l.196 (test `…price_versions_increase_with_seven_values`, G2-V1) :
  ```ts
    assert.deepEqual(run(f, (s) => { add(2, FIRST + 2)(s); add(2, FIRST + 3)(s); }), refused(14, "timeline_malformed"), "the number of the last version again");
  ```
- **C-G2-4 — non bloquante (worker)** — révélation en retard sur un `snapshot` autre que le premier (G2-R3). Après la l.166 (test `…never_reveals_a_seed_early`) :
  ```ts
    assert.deepEqual(run(f, (s) => { body(s, 3).published_at = at(FIRST + 1, 12); }), refused(4, "seed_revealed_early"), "a later snapshot, during its day");
  ```
- **C-G2-5 — non bloquante (worker)** — contrôles de forme non épinglés (G2-H3, H4, S5, S6, F1, F2, F3 ; le journal §3.3 affirme « `2026-02-30` est refusé … mesuré » sans assertion). Nouveau test, avant la l.226 (le test de liste fermée doit rester le dernier) :
  ```ts
  // ---- G1 journal Q-4, Q-6: a malformed field is refused at its line (timeline_malformed) ----
  test("dojo_walk_refuses_malformed_fields", () => {
    const f = dojoFixture();
    const cases: Array<[number, string, unknown]> = [[0, "seed_anchor", "zz"], [0, "mint", ""], [1, "history_root", "zz"], [1, "history_sha256", "zz"],
      [1, "history_lines_count", -1], [1, "history_last_day", "2026-09-31"], [2, "seed", "UPPER"], [9, "threshold_unit", "0"]];
    for (const [i, k, x] of cases) {
      assert.deepEqual(run(f, (s) => { const b = body(s, i); b[k] = x === "UPPER" ? String(b[k]).toUpperCase() : x; }), refused(i + 1, "timeline_malformed"), `${k} ${String(x)}`);
    }
  });
  ```
- **C-G2-6 — non bloquante (worker)** — historique d'un jour (borne `a = b`, G2-H2 ; le mutant refuse une chronologie valide). Import `historyBody` ajouté à la l.11 (`anchorBody, at, dateOf, historyBody,`) et, après la l.110 :
  ```ts
    const one = seedChain("dojo-one-day-history", 40); // SYNTHETIC: anchor on day 1, one history day, first read day 2
    assert.deepEqual(walk(seal(S, [{ key: f.key, body: anchorBody(one(0), 40, DAY1) }, { key: f.key, body: historyBody(DAY1) }, { key: f.key, body: snapshotBody(DAY1 + 1, one(1), null) }]), f.trust), OK, "a one-day history");
  ```
- **C-G2-7 — non bloquante (worker, textes)** — (a) décisions de 18:2x reportées dans les commentaires : `dojo-chain.mjs` l.7-8 « D-10 omits (proposed addition, G1 journal Q-1) » → « D-10 omits: admitted by the orchestrator on 2026-09-26 (G1 journal Q-1), D-10 line dated at the G7 of PR-1b-1 » ; même reprise `.d.mts` l.6 et `dojo-chain.test.ts` l.227 ; l'exception `|| r === "rotation_key_not_in_keyring"` (l.233) reste tant que la l.248 de la mère n'est pas pliée. `dojo-fixture.ts` l.38 « until the Dojo keyring schema is decided: G1 journal Q-3 » → « until item DOJO-KEYRING-SCHEMA-1 (a distinct Dojo keyring schema, G1 of PR-1b-2; G1 journal Q-3) ». (b) `dojo-chain.test.ts` l.231 : l'extraction garde le jeton `snapshot` (45 jetons pour 44 codes, mesuré) ; retirer les six noms de type de `d10` (par ex. `.filter((c) => !["anchor", "snapshot", "price_version", "history", "key_rotation", "key_revocation"].includes(c))`). (c) journal l.60 (§3.1, « Écarts, et eux seuls ») : ajouter « un commentaire de section avant les contrôles de Bell (hunk `7c9,10`) » ; l.166 (§5) : borner « pour prouver que chaque règle est épinglée » aux règles d'ordre et aux conditions du calque, les formes relevant de C-G2-5.
- **C-G2-8 — non bloquante (orchestrateur, pli du G7)** — la décision de 18:2x ne tranche de Q-6 que « `timeline_malformed` pour les formats » ; les sens étendus déclarés au journal l.209 (`day_not_increasing` pour les bornes d'historique et d'ancre ; `price_version_mismatch` pour la borne de fenêtre, que D-10 décrit pour la médiane et p ; `version_not_in_force` émis à la ligne de version ; `seed_chain_broken` au-delà de l'horizon) demandent une ligne datée dans le pli, pour que PR-1b-2 hérite de la table. Même pli : `rotation_key_not_in_keyring` dans D-10 l.248 à sa place de Bell (Q-1).
- **C-G2-9 — non bloquante (orchestrateur : items formés, hors mandat de D-8 l.228)** — trois contrôles qu'aucune PR prévue ne porte, mesurés sur l'original (`bp.log`) :
  - (a) **fenêtre de version dans les jours lus** : D-17 l.289 (« les jours de l'historique ne portent pas de prix : la première version vient des jours lus ») ; une v1 sur les jours 2026-09-10 à 09-16, en vigueur dès le premier jour lu, passe le marcheur, et D-10 l.247 ne fait recalculer que la médiane des sept valeurs **publiées**. Proposition : `window_first_day > max(jour de l'ancre, history_last_day)`, une condition dans `versionCheck`, code `price_version_mismatch` (sens étendu de Q-6) ; déclencheur : G0 ou G1 de PR-1b-2.
  - (b) **borne basse de `history_last_day`** : D-8 l.227 (« veille du premier jour lu ») et D-4 l.186 (ancre avant le premier jour lu) donnent, sous Q-2, `history_last_day ≥ jour de l'ancre` ; un historique qui s'arrête la veille du jour de l'ancre passe. Proposition : `b >= st.anchorDay` à la ligne `history`, code `timeline_malformed`. L'égalité « veille » n'est vérifiable que si le premier jour lu est fixé (jour de l'ancre + 1 sous la lecture (B) de Q-2) : à trancher avec (a).
  - (c) **ancre nouvelle antidatée** : son jour 0 peut tomber sur un jour déjà publié (résiduel `published_at` non monotone, déclaré au journal §8). Proposition : jour d'une nouvelle ancre > dernier jour publié, ajoutée à la liste Q-5 (d) routée vers PR-3a et PR-1b-2.

## 6. Fidélité (point 7), item par item

| Norme | Verdict | Où |
|---|---|---|
| D-8 l.227 types (6) et champs : ancre (14 champs), `price_version` (8), `history` (5) | contrôlés en entier ; `snapshot` : `day`, `seed`, `reads` (tableau), `price_version`, `published_at` ; clés fermées et autres champs laissés au vérificateur, déclaré (journal §8) | `dojo-chain.mjs` l.17, l.52-58, l.64-73, l.81-92, l.104-110 |
| D-8 l.228 marcheur : calque, `day` strictement croissant, graine chaînée, `anchor` en tête, aucun `snapshot` pour un jour ≤ ancre, `history` unique avant le premier `snapshot` et antérieure au premier jour lu, graine jamais en avance, versions croissantes, effet après la fenêtre | fidèle ; « premier jour lu » approché par le premier `snapshot` (les jours sans ligne sont admis) ; effet borné par en dessous (`first + 7 − 1`, Q-5 (a) routée) | l.85-89, l.97, l.106, l.69-71 |
| D-8 l.228 imports ; l.229 équivalence | sous-liste de P-15 ; équivalence prouvée hors deux exclusions (C-G2-2) | l.10 ; `test.ts:39-90` |
| D-4 l.186 (chaîne inverse, horizon, ancre avant le premier jour lu) ; Q-2 | fidèle ; jour 0 = jour UTC du `published_at` de l'ancre | l.87, l.100-101 ; fixture `seedChain` |
| D-17 l.287 (sept valeurs), l.290 (`dust_threshold`) | forme seule (recalcul : PR-1b-2) | l.66-68 |
| D-17 l.288 (effet = lendemain), l.289 (v1 depuis les jours lus) | borne inférieure seule (Q-5 (a)) ; l.289 non portée | C-G2-9 (a) |
| D-18 l.296 (jour 1), l.302 (`history` avant le premier `snapshot`, jamais modifiée) | fidèle ; « jamais modifiée » non épinglé après un `snapshot` | l.24, l.84, l.106 ; C-G2-1 |
| Mère l.858 (c) : `price_window_days ≠ 7` refusé, code nommé | `timeline_malformed` (∈ D-10) | l.58 |

## 7. MAST

- **FM-1.2** (rôle) : aucun écart. La signature suit la mère (`(lines, trust)`) contre la mission, déclarée Q-3 et retenue ; aucun fichier gelé touché ; aucun commit.
- **FM-2.4** (rétention d'information) : mineur. Q-7 annonce un seul verdict divergent de Bell ; il y en a deux (C-G2-2). Les lacunes de C-G2-9 sont hors de la liste de D-8 l.228, donc non retenues à tort, mais absentes du §8 du journal.
- **FM-3.1** (arrêt prématuré) : aucun. Livrables, R-25 par deux méthodes, oracle avant/après, 42 mutants, sept questions formées.
- **FM-3.3** (vérification incorrecte) : partiel. Aucun test n'emploie le marcheur comme oracle ; mais « chaque règle épinglée » dépasse la preuve : 13 survivantes, dont la lettre de M-K2 (C-G2-1).

## 8. Questions Q-1..Q-8 (point 10)

- **Q-1** : le choix est juste (calque, D-8 l.228-229 ; le repli sur `key_not_in_keyring` casserait « rotation key before key » et `bell-keys.test.ts:76`, `:123`, relus). Admis par l'orchestrateur ; ligne de D-10 à dater au G7 (C-G2-8) ; commentaires « proposed » à reprendre (C-G2-7 (a)).
- **Q-2** : (B) appliquée (`dojo-chain.mjs` l.100-101, fixture `seedChain`). Conséquence déclarée, vérifiée par lecture (l.85, l.87) et par le test `…chains_the_seeds` rejoué : une ancre nouvelle ferme l'ancienne chaîne (`snapshot` en retard ≤ jour de l'ancre → `day_not_increasing`, au-delà → `seed_chain_broken`). Borne basse à ajouter : C-G2-9 (b), (c).
- **Q-3** : `(lines, trust)` appliqué ; DOJO-KEYRING-SCHEMA-1 à nommer dans la fixture (C-G2-7 (a)), qui sert encore `bell-keyring-v1` à `dojo/pubkey.json`.
- **Q-4** : formats appliqués (`dayOf`, `instantOf`) ; mesure indépendante du besoin d'aller-retour (`Date.parse` : `2026-02-30` → 03-02, `2026-09-31` → 10-01) ; non épinglé (C-G2-5).
- **Q-5** : routée vers les missions de PR-2 et PR-3a ; rien à appliquer dans ce lot ; C-G2-9 allonge la liste.
- **Q-6** : tranchée pour les formats seulement (C-G2-8).
- **Q-7** : fail-closed juste (une chronologie sans ancre n'a rien de vérifiable) ; déclaration incomplète (C-G2-2).
- **Q-8** : information, exacte (568 = 13 + 156 + 248 + 151).

## 9. Ce que je n'ai pas pu rejouer

- La chronologie interne du G1 (horodatages du §0, harnais n°1 et n°2, mesure intermédiaire de 544 lignes) et ses deux consultations de l'advisor : non rejouables ; seul l'état final est rejoué.
- L'oracle « avant » (base `711b5c9` sans le lot) : non rejoué. Mon « après » (1 358 / 1 356 / 0 / 2, `exits.txt` identique à celui du G1, `3943c3b3…65d5`) moins les 13 `dojo_walk_*` comptés dans mon journal de test redonne les 1 345 du G1, sans mesure propre de la base.
- Le texte de RFC 8032 et le comportement de `verify` hors de Node 24.15.0 : hors objet (primitives de Bell importées sans modification, déjà acceptées).
- Aucun réseau ; aucune donnée réelle (fixture synthétique, conforme à la mission).

## 10. sha256 relus

| Objet | sha256 | Relu égal à |
|---|---|---|
| `dojo-chain.mjs` / `.d.mts` / `dojo-fixture.ts` / `dojo-chain.test.ts` | `3b080b0d…9c3f` / `752460d9…29db` / `45cd7d8f…279f` / `865a2648…a720` | `DELIVERED.sha256` (worktree et clone, 4/4) ; journal §2 |
| journal `docs/G1-lot-dojo-pr1b1.md` | `ec942bdded670f732f3994efb6d6e766f51a71baafe596c807ce167435ecec22` | mission (`ec942bdd…`) |
| diff de calque | `b85a3442da5f661c8d49fc4468a635628b60157df047f7df00646703b0259515` | livré = régénéré (`calque-g2.diff`) |
| `RESULTS.txt` mutants G1 / mon rejeu | `a8e6e42d7096b509375553d1fd0b6691ed335a90629acc645294e815632ff1ba` (les deux) | journal §5 |
| harnais G1 `mutants.mjs` | `920a2c747dfc174103f00373be8f5ab66c5fc3dc903406e30bc56eb8463346f7` | journal §5 |
| ADR-mère / `bell-chain.mjs` | `2a12a854…4bda` / `521270a3…6ce7` | journal §1 |
| ADR-DOJO-PR-2B / FAITS PR-1a (59 l.) / mission G1 | `20e4d5d5…65fd` / `ce85cc2e…e5eb` / `8c35da4e…3f9d` | journal §1 et en-tête |
| CHANTIERS du tronc (1 629 l., relevé 19:0x Z) | `90395b9440bdd8dace14acc311da6eb39fed3f7b55bb7764b91bf6dd36368553` | — (le journal cite `49e26b3a…` avant l'entrée 18:2x : attendu) |
| mes pièces | `r25-g2.sh` `65166862…983c`, `r25-g2.log` `f13d576b…d1a9`, `tests-clone.log` `1464d631…45fc3`, `probes\RESULTS.txt` `84c8fb60…6f8e`, `bp.log` `dfa93ebf…874d`, `corr\RESULTS.txt` `5a2163ab…cff4`, `mutants-proposed\RESULTS.txt` `62a012e6…4b01`, `oracle\test.log` `78ce26a6…fe38` | — |

## 11. Provenance

| Date | Objet | Modèle | Effort | Contexte fourni | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-26 | G2 de PR-1b-1 (`dojo-chain.*`, fixture, tests, journal G1 ; non committés, base `711b5c9`) | `claude-opus-5-5[1m]` | max | mission G2 ; journal G1 ; livrables ; ADR-mère ; `bell-chain.mjs` ; CHANTIERS 18:2x ; harnais du G1 | worker G1 `claude-opus-5-5[1m]` (instance distincte) | ce relecteur (contexte frais) ; puis checkpoint-2, G7 | **CORRECTIONS D'ABORD** |

- Advisor intégré : une consultation après l'orientation et avant la rédaction ; classement confirmé ; trois vérifications ajoutées sur son avis (appartenance au programme TS et ESLint explicite ; preuve des correctifs sur copies ; R-25 après correctifs), toutes faites. Conseil, jamais verdict.

## 12. Verdict

**CORRECTIONS D'ABORD.** Bloquante : **C-G2-1** (worker, une ligne de test, plus le journal et le harnais). Non bloquantes : C-G2-2 à C-G2-7 (worker ; C-G2-3 recommandée, échec ouvert), C-G2-8 et C-G2-9 (orchestrateur : pli du G7, items formés). Le reste est conforme et rejoué : calque, codes, R-25 568, 27/27, 42/42 identiques, oracle 7/7, hygiène. Après C-G2-1, l'orchestrateur choisit les correctifs non bloquants retenus : R-25 entre 569 et 589, sous le STOP de 1 150.
