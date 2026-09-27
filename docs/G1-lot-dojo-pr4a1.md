claude-opus-5-5[1m]

# G1 — lot Dōjō PR-4a-1 (piste C, site) : chargeur fail-closed et composition des chiffres de la page depuis l'arbre servi

- **Modèle résolu** : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, R-1), worker, contexte frais ; effort de la mission : high.
- **Mission** : `F:/tmp/dojo/mission-g1-pr4a1.md` (19 l., sha256 `0489a940dad91f126d03d0fd056924468d52dcbe1f16bfcdf73d835d72a0e7a3`) ; horodatage de mission 2026-09-27T09:40Z.
- **Base** : worktree `F:/Monark-wt-dojo-c`, branche `lot/dojo-site`, HEAD `ceeb8cd6882f4b3471c883b2528825ba3b15f5bc` ; `git status --short` à l'ouverture : **vide (arbre propre)**.
- **Pièces lues** : ADR de lot `docs/adr/ADR-DOJO-PR-4.md` (232 l., sha256 `5e511a11dc1f61f9f132dabdeae6674561f0f449a3c3bacdcadfb26e89add9b4`, en entier) ; mère : dans ce worktree au **dixième pli** (1 103 l., `fc93f66c…5078`) ; le **treizième pli** cité par la mission n'est pas sur `lot/dojo-site` : lu par `git show lot/dojo-snapshot-1:docs/adr/ADR-DOJO-SNAPSHOT-1.md` (commit `b64691b`, 1 361 l., sha256 `45500ca0a45b397cd385a6984d397c30f3e8ec99a6c95f7468003e278f401986`) : D-2, D-3, D-7 à D-11, D-16, D-17, §6 PR-4a/PR-4b, §7 (condition de G7), §8 (TXT-1 à TXT-12, lexique) ; ADR-DOJO-PR-3 D-2 (DOJO-CA-FORMAT-1, par `git show lot/dojo-editeur-hote:…`, l.84 seule). Code relu (jamais modifié) : `apps/site/lib/bell-served-load.ts` (`15ddace2…fc67`), `narabi-served-load.ts`, `load-committed.ts`, `ukemi-served-figures.ts`, `data/manifest.sha256.json`, `apps/dojo/scripts/dojo-chain.mjs` (`04411fa7…7123`), `dojo-verify.mjs` (`d768df16…49cb`), `dojo-core.mjs` (`34075c6f…32f5`), `apps/dojo/test/helpers/dojo-fixture.ts` (`aa4151bc…7d51`), `scripts/export-public.mjs`, `.github/workflows/ci.yml:82`/`:90`, `test/bell-served.test.ts` (motif).

## 0. Horaires (`date -u`)

| Heure | Acte |
|---|---|
| 09:44:06Z | lecture de la mission |
| 09:44Z → 09:53:39Z | orientation (ADR de lot, mère, précédents, fixture, export) ; `git status` vide ; 23 `node.exe` relevés à 09:53:39Z (C-V-4) ; advisor intégré consulté (§12) |
| 09:53Z → 09:56:38Z | `dojo-served-load.ts`, `dojo-served.ts`, `test/dojo-served.test.ts` écrits |
| 09:56:38Z → 09:58:25Z | `mk-nm.ps1 -Tree` sur le worktree (`entries: 220  monark: 10  fail: 0`) ; test 3/3 ; `tsc` 0 ; `eslint` 0 (après deux corrections : import inutilisé, rétrécissement de type d'une assertion) ; `gate:vocab`, `lang:gate`, `lint:ratchet` 69/69, `export:check` : OK ; R-25 = 418 |
| 09:58:55Z | deux clones `--no-local` à `ceeb8cd` : `F:/tmp/dojo/pr4a1-clone` (oracle) et `F:/tmp/dojo/pr4a1-mutants/tree` (mutants), arbres propres ; fichiers du lot copiés (`cmp` égal) ; `mk-nm.ps1` sur chacun (`entries: 220  monark: 10  fail: 0`) |
| 09:59:54Z → 10:00:28Z | mutants : 19/20 puis, après l'ajout du cas « compte signé » au test, **20/20** (§6) ; R-25 = 422 |
| 10:01:14Z → 10:02:26Z | premier export-run (trace, §9) |
| 10:0xZ → 10:09:11Z | passage 1 en attente du verrou (tenu par « G1 PR-2b-2 ») ; journal écrit |
| 10:09:11Z → 10:15:54Z | passage 1 sous verrou : 6/7, `test` rouge sur `site_names_no_kitchen` (§8) |
| 10:15:54Z → 10:17:00Z | correctif de commentaires (identifiants internes retirés des deux modules du site) ; `site_names_no_kitchen` ✔, test 3/3, `tsc` 0, `eslint` 0, R-25 = 422 |
| 10:17:26Z | mutants rejoués sur les fichiers livrés : 20/20 |
| 10:17:33Z → 10:18:11Z | export-run qui fait foi (`pr4a1-export2`, §9) |
| 10:27:12Z → 10:37:18Z | verrou pris après 600 s d'attente (tenu par « G1 PR-2-2 ») ; passage 2 (10:27:13Z → 10:33:52Z) 7/7 ; test 42 à part (10:33:52Z → 10:37:18Z) ✔ |

## 1. Livrables

| Fichier | État | Lignes | sha256 |
|---|---|---|---|
| `apps/site/lib/dojo-served-load.ts` | créé | 238 | `d7228c76e429ce5988ff7025abd511924de50d10d8904b6477610dc1d8aade1f` |
| `apps/site/lib/dojo-served.ts` | créé | 41 | `75fd518039f4bf340f1244d16c3de6fda49cc3cf64b3b5b2e82fcb576b412b0c` |
| `test/dojo-served.test.ts` | créé | 143 | `0cef4a9ff13dd2e26a75e4e003b8be1e01ae305c90fa5485fe88c9669a81234c` |
| `docs/G1-lot-dojo-pr4a1.md` | créé (ce journal, hors R-25) | — | rendu hors du fichier |

Inchangés (`git diff --stat HEAD` vide sur eux) : `apps/site/lib/fleet.ts`, `package.json`, `package-lock.json`, `apps/dojo/**`, `apps/bell/**`, `apps/site/data/**` (aucun `dojo-served.json`, aucune entrée de manifeste), `apps/site/app/**` (aucune page, aucun lien), `tsconfig.json`, `scripts/**`. `node_modules` du worktree : jonctions de `mk-nm.ps1` (ignoré par `.gitignore`), à retirer par `rm-nm.ps1 -Tree` si l'orchestrateur le veut.

## 2. Interfaces

```ts
// apps/site/lib/dojo-served-load.ts
export const DOJO_SERVED_REL = "apps/site/data/dojo-served.json";  export const DOJO_SERVED_SCHEMA = "monark-site-dojo-served-v1";
export const DOJO_HOST, DOJO_TIMELINE_PATH, DOJO_PUBKEY_PATH;  export const dojoLinesPathOf, dojoHistoryPathOf;
export const DOJO_HEAD_KEYS /* 19 clés, mère D-11 */, DOJO_HISTORY_KEYS /* 5 */, DOJO_ANCHOR_KEYS /* 22, dojo-verify FIELDS.anchor + communes */, DOJO_READ_RULE_KEYS /* 8 */;
export interface DojoServedData { host; read_at; timeline: { schema; lines; snapshots; anchor }; head: DojoServedHead; history; keyring: dojo-keyring-v1; bodies_sha256: { timeline; pubkey } }
export function loadDojoServed(rootDir: string): DojoServedData | null;         // null = E0 (ni fichier ni entrée)
export interface DojoChainDeps<T> { trustOf /* dojoTrustOf */; walk /* walkDojoTimeline */; lineHash; rootOf }
export interface DojoServedBuildInput { readAt: string; tree: ReadonlyMap<string, Uint8Array>; committedKeyring: Uint8Array }
export function buildDojoServed<T>(input: DojoServedBuildInput, deps: DojoChainDeps<T>): Record<string, unknown>;
// apps/site/lib/dojo-served.ts
export type DojoPageFigures = { state: "E0" } | { state: "EA"; day } | { state: "E1"; …8 chiffres } | { state: "E2"; …8 + threshold_unit_token_days, holders_count, dust_threshold_tokens };
export function dojoPageFiguresOf(data: DojoServedData | null): DojoPageFigures;
export function shiftUnits(raw: string, decimals: number): string;              // = shiftDecimal de bell-served-load.ts, épinglé par test
```

## 3. Décisions de ce G1 (forme fermée fixée ici, ADR D-2) et écarts

1. **Placement (écart mission ↔ ADR, l'ADR fait foi)** : la mission place `buildDojoServed(tree)` dans `apps/site/lib/dojo-served.ts` ; l'ADR D-2 (l.101) et la mère D-11 (l.267) placent `buildDojoServed(input, deps)` **et** `loadDojoServed` dans `dojo-served-load.ts`. Tenu : les deux dans `dojo-served-load.ts` (motif `bell-served-load.ts:478`) ; `dojo-served.ts` porte la composition par état (`dojoPageFiguresOf`), import de type seul (motif `ukemi-served-figures.ts` : aucun import de valeur relatif dans `apps/site/lib`, mesuré : 0 occurrence ; `apps/site/tsconfig.json` sans `allowImportingTsExtensions`). D'où `shiftUnits`, recopie de `shiftDecimal` épinglée égale par le test (sept cas).
2. **Comment le chargeur exige la preuve de vérification, sans ré-implémenter le vérificateur** : `buildDojoServed` (projection appliquée par la synchro de PR-4a-2) reçoit l'arbre servi et les fonctions de chaîne **injectées** (`dojoTrustOf`, `walkDojoTimeline`, `lineHash`, `rootOf` ; le module n'importe rien d'`apps/dojo` ni d'`apps/bell`) : (a) racine de confiance = **trousseau committé** (octets passés par l'appelant, jamais `dojo/pubkey.json`), chaque clé servie doit y figurer avec le même `x`, le `keyring` écrit est le committé (M-P15) ; (b) marche de toute la chronologie sous ce trousseau, refus si `ok` faux, ligne annulée, rotation à continuité rompue (motif Bell) ; (c) tête = `walk.head`, dernière ligne `snapshot` (M-P13) ; (d) fichier de lignes de la tête et fichier d'historique **liés à leur ligne signée** : compte, **sha256 des octets**, puis **racine de Merkle recomputée par `rootOf`** égale à la racine signée (M-P9) ; (e) chiffres de la page **composés depuis les lignes servies** (somme des `score`, des `validated`, compte des `holder_counted`) et exigés égaux aux totaux signés ; (f) créneaux = min des `slot_min` et max des `slot_max` sur toutes les lectures faites (M-P14). Ce qu'il ne recalcule pas (lots, points, unités, paliers, lectures, versions de prix, fenêtres du trousseau) est l'objet de `dojo-verify`, exécuté sur les mêmes corps par la CA (`c03_dojo_verify_keyring_root`, DOJO-CA-FORMAT-1) que PR-4a-2 lie à ce fichier ; le test d'intégration exécute en plus `verifyDojoServed` sur chaque arbre de la fixture (E1, E2) et exige la même racine recomputée.
3. **E0** (ADR D-2, plus strict que la mission) : `null` **seulement** si le fichier **et** son entrée de manifeste sont absents ; fichier sans entrée, entrée sans fichier, manifeste absent ou d'un autre algorithme ⇒ refus nommé (M-P12).
4. **Forme fermée** : racine `{$comment, schema, host, read_at, timeline, head, history, keyring, bodies_sha256}` ; `timeline` = `{schema, lines, snapshots, anchor}` avec **la ligne `anchor` en vigueur entière, signée** (22 clés, `read_rule` à 8 clés fermées ; source unique committée de `k_reads`, `validation_days`, `tier_units`, `tier_windows`) ; `head` = les 19 clés de la mère D-11 ; `history` = 5 clés ; `keyring` = `dojo-keyring-v1` committé ; `bodies_sha256` = `{timeline, pubkey}` (les deux autres corps sont nommés par leur sha256 dans `head` et `history`). Couplages vérifiés au chargement : `holders_count`, `threshold_unit`, `dust_threshold` non nuls **exactement** avec une `price_version` (source de TXT-4/TXT-4N/TXT-11, D-1) ; créneaux présents ⇔ `counted` ; `head.k_reads` = celui de l'ancre ; clés signataires dans le trousseau ; historique fini avant le jour de la tête.
5. **`deploy_check` hors de cette forme** (écart avec la liste de la mère D-11) : rien dans PR-4a-1 ne peut le renseigner sans la liaison à la CA, objet de PR-4a-2 (M-P7, M-P9 côté CA, M-P20, `dojo_served_data_matches_deploy_ca`). Item formé DOJO-SERVED-DEPLOY-CHECK-1 (§10) ; aucun fichier n'est committé avant l'acte de synchro de PR-4a-2, donc aucune migration de données.
6. **Chiffres par état** (ADR D-1, liste fermée de la mère D-11 l.272) : E1 = `day`, `k_reads`, `slot_min`, `slot_max`, `lines_count`, `root`, `score_total`, `validated_total` ; E2 = E1 + `threshold_unit_token_days`, `holders_count`, `dust_threshold_tokens` (décalés par `decimals`) ; EA = `day` ; E0 = aucun. **Aucun compte par palier** : ni D-1 ni la mère l.272 n'en listent (la mission dit « unités et paliers si `price_version` » : question Q-3). `k_reads` = K de l'ancre (nom de la clé), non le nombre de lectures faites (question Q-2).
7. Aucune page, aucun lien, aucun texte rendu ; les états et les chiffres sont des chaînes rendues par accès de propriété (PR-4b).

## 4. Tuyaux (règle Branchement)

| # | Entrée | Sortie | État | Test non-LLM | Statut |
|---|---|---|---|---|---|
| TC-0 | fixture signée amendée par PR-1b-3 (`render`, clés générées à l'exécution) → `buildDojoServed` | enregistrement écrit en racine temporaire avec son manifeste → `loadDojoServed` → `dojoPageFiguresOf` | aucun (exécution ; racine supprimée) | `dojo_snapshot_composes_served_lines_to_page_figures` (E1, E2, EA, E0) | **composé en test** |
| TU-8 | `dojo-served.json` committé → `loadDojoServed` | chiffres de `/dojo` au build | build | idem (jambe chargeur) ; `assertDojoBody` (PR-4b) | absent : aucune page (PR-4b), aucun fichier (acte de PR-4a-2) |
| TU-7 | arbre servi + CA → synchro | `dojo-served.json` + manifeste | dépôt | `dojo_served_data_matches_deploy_ca` (PR-4a-2) | absent |

- **Consommateurs déclarés** : PR-4a-2 (`scripts/sync-dojo-served.mjs` appelle `buildDojoServed`), PR-4b (page, `dojoExpected()` d'`assertDojoBody` dérivé de `dojoPageFiguresOf(loadDojoServed(…))`), PR-4c-1 (`keyring`, `head.line_hash` committés). Aucun n'existe encore : **la pièce reste `upcoming`** ; tuyaux formés avec déclencheur (G1 de PR-4a-2, G1 de PR-4b), jamais un oubli. `fleet.ts` inchangé.

## 5. Tests (`test/dojo-served.test.ts`, racine de câblage `test`, `WIRING_TEST_ROOTS` inchangé)

- **`dojo_snapshot_composes_served_lines_to_page_figures`** : trois arbres signés de la fixture (E1 = sept jours comptés sans version, tête `seq` 9 ; E2 = fixture entière, version 1 en vigueur, tête `seq` 12 ; EA = E2 dont la tête est `abstained`, `beacon` nul, `reads` vides) → `buildDojoServed` → fichier et manifeste en racine temporaire → `loadDojoServed` (égal à l'enregistrement construit, trousseau = le committé à **deux** clés) → `dojoPageFiguresOf` égal aux chiffres **recodés dans le test** : racine RFC 9162 recodée (`node:crypto`, feuille `0x00`, nœud `0x01`, coupe à la plus grande puissance de deux), sommes BigInt des lignes, min/max des créneaux, décalage décimal recodé en BigInt, `k_reads` de l'ancre, version de la tête ; `verifyDojoServed` (sous le trousseau committé) accepte E1 et E2 et recompute la même racine ; E2 porte des points validés non nuls (somme exercée) ; E0 : `dojoPageFiguresOf(null)` ; `shiftUnits` = `shiftDecimal` sur sept cas. Valeurs relevées (clés de la fixture générées à chaque exécution, donc racines variables) : E1 `score_total` 152000000, `validated_total` 0, créneaux 400000000 à 400000004, 3 lignes ; E2 `score_total` 165000000, `validated_total` 150000000, `holders_count` 1, `threshold_unit` 17948718 → 17.948718 jetons-jours, `dust_threshold` 3589744 → 3.589744 jetons.
- **`dojo_served_head_is_the_latest_snapshot`** : tête E2 = dernière ligne (`seq` 12, jour ANCHOR_DAY + 9, version 1) ; tête E1 = `seq` 9, version nulle (M-P13).
- **`dojo_served_loader_is_fail_closed`** : ni fichier ni entrée ⇒ `null` ; fichier sans entrée ⇒ refus ; entrée sans fichier ⇒ refus (M-P12) ; sha256 faux ⇒ refus (M-P5) ; clé en trop (racine, `head`, `timeline.anchor`), `holders_count` sans version, `k_reads` ≠ ancre ⇒ refus (chaque mutant re-haché au manifeste : seul le chargeur refuse) ; racine signée par le détenteur de la clé mais non recomputable ⇒ refus (M-P9) ; `lines_count`, `score_total`, `holders_count` signés faux ⇒ refus ; fichier de lignes modifié après signature ⇒ refus par sha256 ; arbre signé et servi sous une autre clé ⇒ refus (M-P15).
- Aucune donnée synthétique committée (DOJO-SITE-BUILD-BEFORE-DATA-1) ; aucun réseau ; racines temporaires sous `TEMP` = `F:/tmp/dojo/pr4a1-tmp`, supprimées en `finally`.
- Résultats : worktree 3/3 (`node --test test/dojo-served.test.ts`) ; `tsc --noEmit` 0 ; `eslint` des trois fichiers 0 ; suite complète : §8.

## 6. Mutants (copie hors dépôt `F:/tmp/dojo/pr4a1-mutants/tree`, clone `--no-local` à `ceeb8cd` + fichiers du lot ; restauration par copie, sha256 contrôlé après chaque mutant)

Script `F:/tmp/dojo/pr4a1-mutants/mutants.mjs` (sha256 `161c6720dea5543e26495d8973c944ccf1279aa696bfa887adc7eb0a164651ca`) ; résultats `RESULTS.txt` (`44dadc0252b39e20aa618d22efb821bd3c5d3effce8b3a547b0b6b35c3f3f149`), passe de 10:17:26Z sur les fichiers livrés (après le correctif de commentaires du §8) : **20/20 tués** (même résultat qu'à 10:00:28Z). Cette passe a tourné sur un seul fichier de test, pendant l'attente du verrou par le passage 2 (aucune suite complète en parallèle). Première passe (09:59:54Z) : 19/20, **M-X2 survivant** (aucun cas ne signait un compte faux avec sha et racine justes) ⇒ cas `lines_count` ajouté au test, puis 20/20.

| Id | Mutant | Tué par |
|---|---|---|
| M-P5 | chargeur sans contrôle de sha256 | `…loader_is_fail_closed` |
| M-P9 | racine non recomputée | `…loader_is_fail_closed` |
| M-P12a | fichier sans entrée lu comme E0 | `…composes…`, `…loader_is_fail_closed` |
| M-P12b | entrée sans fichier lue comme E0 | `…composes…`, `…loader_is_fail_closed` |
| M-P13 | tête = premier `snapshot` | les trois tests |
| M-P14 | créneaux d'une seule lecture | `…composes…` |
| M-P15a | racine de confiance et trousseau pris de `dojo/pubkey.json` servi | `…composes…`, `…loader_is_fail_closed` |
| M-P15b | trousseau de l'enregistrement copié du servi | `…composes…` |
| M-X1 | sha256 des lignes non comparé | `…loader_is_fail_closed` |
| M-X2 | compte des lignes non comparé | `…loader_is_fail_closed` (après ajout du cas) |
| M-X3 | sommes non comparées aux totaux signés | `…loader_is_fail_closed` |
| M-X4 | `holders_count` non comparé | `…loader_is_fail_closed` |
| M-X5 | couplage version ↔ unité/poussière/détenteurs retiré au chargeur | `…loader_is_fail_closed` |
| M-X6 | `head.k_reads` non lié à l'ancre | `…loader_is_fail_closed` |
| M-X7 | clés fermées de `head` non contrôlées | `…loader_is_fail_closed` |
| M-X8 | clés servies non liées au trousseau committé | `…loader_is_fail_closed` |
| M-X9 | `k_reads` = lectures faites au lieu de K | `…composes…` |
| M-F1 | E2 sans décalage décimal | `…composes…` |
| M-F2 | E2 rendu comme E1 | `…composes…` |
| M-F3 | `shiftUnits` garde les zéros de tête | `…composes…` |

- M-P9 « côté CA » (CA sans racine recomputée acceptée) et M-P6, M-P7, M-P20 : PR-4a-2 (mère §6 T-11, ADR §4) ; ici M-P9 porte sur la racine recomputée par `buildDojoServed` (lecture de la mission).

## 7. R-25 (`ci.yml:82` pathspec, métrique `ci.yml:90`, base `ceeb8cd`)

- Script `F:/tmp/dojo/pr2-1-r25-methodA.mjs` (sha256 `140be120c7db04b27d664e665e639973425e350fd0713a5256cf61660d78d3bf`, inchangé depuis PR-1b-2) : pathspec extrait de `ci.yml:82` (20 éléments), `git diff --numstat ceeb8cd` pour les suivis (aucun), `git diff --no-index --numstat /dev/null <f>` pour les non suivis ; aucune écriture git.
- **422** lignes CODE (238 + 41 + 143) ; estimation 315 (×1,34) ; sous 661,5 (×2,1), sous le seuil de repli de 600, loin du STOP 1 150. Journal hors compte (`docs/G1-lot-*.md` exclu).
- Même script sur le clone `F:/tmp/dojo/pr4a1-clone` (10:06:11Z) : **422**, égal.

## 8. Oracle (7 gates sous verrou d'hôte + test 42 à part ; C-V-4)

- Scripts `F:/tmp/dojo/` dérivés de ceux de PR-2b-1 (diffs : dossier temporaire, propriétaire du verrou « G1 PR-4a-1 », chemins du clone) : `pr4a1-run-oracle.sh` (`92182c32…c33d`, sept gates `npm run`, huit variables payantes retirées par `env -u`, TEMP/TMP/TMPDIR sur F:), `pr4a1-locked.sh` (`823ad2ad…2399`, `mkdir F:/tmp/oracle-lock` atomique, attente 60 s jusqu'à 90 min, `rmdir` dans le piège EXIT), `pr4a1-oracle-pass.sh` (`e763fe67…741a`, compte des `node.exe` au lancement), `pr4a1-t42.sh` (`cf3d97fd…e43d`), `pr4a1-sync.sh` (`328b6809…2689`, copie worktree → clone, `cmp`), `pr4a1-pass2.sh` (`23f84aba…04e1`, passage 2 puis test 42 dans la même prise de verrou). Clone `F:/tmp/dojo/pr4a1-clone` (`--no-local`, HEAD `ceeb8cd`, Node v24.15.0).
- **Passage 1** (`out-1`, 10:09:12Z → 10:15:54Z ; 22 `node.exe` au lancement) : `gate:vocab`, `typecheck`, `lint`, `lint:ratchet` (69/69), `lang:gate`, `export:check` exit 0 ; **`test` exit 1** : 1 394 tests, 1 391 pass, **1 fail**, 2 skipped : `site_names_no_kitchen` (`test/site-build-fleet.test.ts:1161`, KITCHEN-PUBLIC-1) : « ADR identifier » dans les commentaires d'en-tête des deux modules (`ADR-DOJO-SNAPSHOT-1`, `ADR-DOJO-PR-4`) ; les trois tests du lot ✔ (`test.log` `c008eab2307e7d76e55fd5de2031854f6b5fe3194c0beaca7afe599a6fc2608f`). Gardé ; jamais cité comme vert. `error_origin` : worker (moi : la porte de cuisine des fichiers exportés de `apps/site` n'avait pas été lue avant l'écriture).
- **Correctif** (commentaires seuls ; aucun code touché) : identifiants d'ADR, « mere », « pli » et renvois « D-n » retirés des commentaires de `dojo-served-load.ts` (quatre lignes) et de `dojo-served.ts` (une ligne) ; `grep` des formes de cuisine sur les deux fichiers : 0.
- **Passage 2, fait foi** (`out-2`, 10:27:13Z → 10:33:52Z, fichiers livrés, `cmp` égaux au worktree avant et après ; 22 `node.exe` au lancement) : **7/7 exit 0**. `test` : 1 394 tests, **1 392 pass, 0 fail**, 0 annulé, 2 skipped (préexistants) ; les trois tests `dojo_*` ✔, `site_names_no_kitchen` ✔, test 42 ✔ dans la suite (343,9 s) (`test.log` `00ae6e96cfed2ac5174c1d778190afd4fbf21d5e2127dcab19662a769f1f1df6`) ; `lint:ratchet` 69/69 (`45ede4ce…6b42`) ; `lang:gate` 0 (`b22ac8f8…0dd7`) ; `typecheck` (`03481a8f…2051`) ; `lint` (`f845417c…4a4f`) ; `gate:vocab` (`454e9545…64b5a`) ; `export:check` (`2f9645a9…8f16`).
- **Test 42 à part, après la suite, même prise de verrou** (10:33:52Z → 10:37:18Z ; 22 `node.exe` au lancement) : `node --test --test-timeout=1200000 --test-name-pattern="test 42" test/export-public.test.ts` ⇒ exit 0, 2/2 ✔ (`export_public_no_governance_no_french` en 205 s ; `test42.log` `8c4f4cb3e21cc967b2505ae3930320f9106a014ddf147e0f87b4db1cdc245d06`).
- C-V-4 : aucune suite complète hors verrou ; le verrou était tenu par « G1 PR-2b-2 » (09:58:31Z puis 10:05:37Z) et « G1 PR-2-2 » (10:16:18Z) pendant les attentes ; mes seules exécutions hors verrou sont des fichiers de test isolés (`dojo-served`, `site_names_no_kitchen`, mutants), `tsc`, `eslint` et les gates de l'export.

## 9. Export-run (CONSIGNE-G1-EXPORT-RUN-1)

- **Prémisse de la mission mesurée fausse** : `collectFiles` de `scripts/export-public.mjs` sur le worktree (lecture seule, 10:0xZ) : 486 fichiers gardés, **0 sous `test/`**, 38 sous `apps/site/lib/`, 0 sous `apps/dojo/` ; `WHITELIST_DIRS` = `schemas`, `fixtures`, `enforcement`, `apps/site`, `skills` ; la racine `test/` n'est ni une liste blanche ni un paquet (`export-public.mjs:41` : « lives at the repo root and is never exported »). Donc `test/dojo-served.test.ts` n'est **pas** exporté et ne peut pas s'exécuter dans l'export ; il ne peut donc pas y dépendre d'`apps/dojo/**`. Les deux modules neufs **sont** exportés, et ne dépendent d'`apps/dojo` ni d'`apps/bell` (fonctions de chaîne injectées ; `grep` dans l'export : seul import relatif = l'import de type de `dojo-served.ts` vers `./dojo-served-load.ts`).
- Premier export (10:01:14Z → 10:02:26Z, `F:/tmp/dojo/pr4a1-export`, fichiers d'avant le correctif du §8, journaux `F:/tmp/dojo/pr4a1-exportrun/`) : trace, ne vaut pas pour les fichiers livrés ; ses `node_modules` retirés par `rm-nm.ps1`. **Export qui fait foi** (10:17:33Z → 10:18:11Z) : `node scripts/export-public.mjs --out F:/tmp/dojo/pr4a1-export2` (exit 0) ; les deux modules présents, `cmp` égaux au worktree ; aucun `test/` ; `mk-nm.ps1 -Tree F:\tmp\dojo\pr4a1-export2` (`entries: 220  monark: 10  fail: 0`) ; journaux `F:/tmp/dojo/pr4a1-exportrun2/`.
- **Exécution dans l'export** : `F:/tmp/dojo/pr4a1-exportrun2/smoke.mjs` (sha256 `30f34d9153afca11c24d140ec49b599bd5d5720586e0bb1e097fc60b804933ef`) importe les deux modules **exportés** et les exécute sur la racine de l'export (qui ne porte ni `dojo-served.json` ni entrée) : `loadDojoServed` ⇒ `null` (E0), `dojoPageFiguresOf(null)` ⇒ `{state: "E0"}`, `shiftUnits("17948718", 6)` ⇒ `17.948718` ; exit 0 (`smoke.log` `556aa0a5a815b351b889ade1b8774a1cfdf30b3d33e23e432c81c07e22174594`).
- **Typage dans l'export** : le `tsconfig.json` exporté n'inclut pas `apps/site/**` ; `tsc -p F:/tmp/dojo/pr4a1-exportrun2/tsconfig.lib.json` (étend celui de l'export, `include` = les deux modules, `typeRoots` de l'export ; `52e57678…8857`) ⇒ exit 0 (au premier export, premier essai exit 2 : `@types/node` introuvable depuis un tsconfig hors de l'arbre ; `typeRoots` ajouté).
- Gates dans l'export : `gate:vocab` 0 (270 fichiers), `lang:gate` 0, `typecheck` 0, `lint` 0, `eslint` des deux modules 0 ; `export:check` **1** : `scripts/export-exclude-tests.json` absent de l'export ; mesuré : ce fichier n'est pas dans `WHITELIST_FILES` (`export-public.mjs:55-110`) et `loadExcludedTests` (`:150-165`) ferme l'export s'il manque, donc `--check` échoue dans **tout** arbre exporté, quel qu'en soit le contenu : indépendant de ce lot (la porte passe dans le worktree et le clone, §8). La suite `npm test` de l'export n'est pas lancée : elle ne porte aucun test de ce lot (aucun `test/`) et une suite complète hors verrou violerait C-V-4.
- Journaux : `F:/tmp/dojo/pr4a1-exportrun2/` (`exits.txt` `2501b678…a1e3`, `*.log`) ; `gate:vocab` `c1be42a2…9fd4`, `lang:gate` `b22ac8f8…0dd7`, `typecheck` `03481a8f…2051`, `lint` `f845417c…4a4f`.

## 10. Items formés (aucun « dû » nu)

| Id | Nature | Objet | Déclencheur | Propriétaire |
|---|---|---|---|---|
| DOJO-SERVED-DEPLOY-CHECK-1 | forme | `deploy_check` entre dans la forme fermée de `dojo-served.json` (lié à `dojo-deploy-ca-v1`, gelé par ADR-DOJO-PR-3 D-2), avec `buildDojoServed` et `loadDojoServed` amendés, `dojo_served_data_matches_deploy_ca` et M-P7/M-P9 (CA)/M-P20 | G1 de PR-4a-2 | orchestrateur, worker de PR-4a-2 |
| DOJO-SERVED-WINDOWS-1 | vérification | les fenêtres `valid_from_seq`/`valid_to_seq` du trousseau ne sont pas relues par `buildDojoServed` (la marche ne les lit pas ; `dojo-verify` les lit) : couvertes par `c03` de la CA liée en PR-4a-2 ; à relire si la synchro doit valoir sans la CA | G1 de PR-4a-2 | orchestrateur |
| DOJO-PAGE-ABSTAINED-1 (existant) | décision de format | contenu d'une ligne `snapshot` abstenue ; ici EA n'est composé que du jour, le fichier de lignes restant lié (compte, sha256, racine, sommes) | inchangé (ADR PR-4 §7) | orchestrateur |

## 11. Questions formées (choix fail-closed explicites)

- **Q-1 (orchestrateur, export)** : la mission écrit « `apps/site/**` et `test/**` SONT exportés » ; mesuré : `test/**` ne l'est pas (§9). Export-run tenu par les modules exportés exécutés et typés dans l'export ; confirmer que cela satisfait CONSIGNE-G1-EXPORT-RUN-1 pour ce lot, ou nommer un autre acte. `error_origin` proposé : mission.
- **Q-2 (orchestrateur, puis cp-1 bref de PR-4b)** : TXT-3 rend « {k_reads} readings » ; la fixture porte une lecture manquée (`read_at` nul) sur quatre : `k_reads` = K de l'ancre (retenu, nom de la clé de la mère D-11) dit « 4 readings » quand trois ont été faites. Garder K, ou composer le nombre de lectures faites (clé nouvelle, amendement de D-11) ?
- **Q-3 (orchestrateur)** : la mission cite « unités et paliers si `price_version` » et « paliers » parmi les chiffres recodés ; ni l'ADR D-1 ni la mère l.272 ne listent de chiffre par palier (TXT-4 et TXT-12 n'en rendent pas) : rien composé ; confirmer.
- **Q-4 (orchestrateur)** : `deploy_check` hors de la forme de PR-4a-1 (§3 point 5, DOJO-SERVED-DEPLOY-CHECK-1) : confirmer, ou l'imposer dès ce lot sous la forme des comptes Bell.
- **Q-5 (orchestrateur, écart de base)** : la mission cite la mère au treizième pli ; `lot/dojo-site` porte le dixième (`fc93f66c…`) ; le treizième est lu sur `lot/dojo-snapshot-1` (`b64691b`), sans effet sur ce lot. À aligner à la fusion.
- **Q-6 (orchestrateur)** : placement de `buildDojoServed` (ADR ↔ mission, §3 point 1) : ADR tenue.

## 12. Advisor

- Consulté par l'outil intégré après l'orientation, avant toute écriture : placement ADR contre mission ; « preuve de vérification » = trousseau committé, marche, sha256, compte et racine recomputée, sommes, aucun rapport de vérificateur pris en entrée ; `timeline.anchor` entière ; couplage version ↔ unité ; `deploy_check` hors forme avec item ; E0 strict ; chiffres de D-1 sans compte par palier ; `render` plutôt que `servedTree` (trousseau `dojo-keyring-v1`) ; isolement de M-P9 (racine signée fausse avant signature), M-P15 en deux faces ; prémisse d'export fausse à dire avec la mesure ; portes de vocabulaire à lire avant d'écrire (`usd` non banni sur `apps/site`, mesuré) ; `TEMP` sur F:. Chaque point vérifié sur pièce ; conseil, jamais verdict.
- Seconde consultation, fichiers écrits et mutants faits, passage 1 en attente du verrou : aucun blocage ; discipline de clôture : lire `exits.txt` et `test.log` du passage, test 42 sous verrou, passage 2 obligatoire si un fichier change après le passage 1 (appliqué : le passage 1 a rougi, correctif, passage 2), mesurer au lieu d'affirmer l'échec de `export:check` dans l'export (fait : lignes de `export-public.mjs` citées), `DELIVERED.sha256` avec auto-contrôle, état git final sans résidu. Conseil, jamais verdict ; chaque point vérifié sur pièce.

## 13. `git status --short` final (worktree)

Relevé à 10:3xZ (`git diff --stat HEAD` : vide ; `git status --short --ignored` : en plus, `!! node_modules/` seul, jonctions de `mk-nm.ps1`) :

```
?? apps/site/lib/dojo-served-load.ts
?? apps/site/lib/dojo-served.ts
?? docs/G1-lot-dojo-pr4a1.md
?? test/dojo-served.test.ts
```

Aucun `git add/commit/stash/checkout/branch` dans le worktree (R-20) ; `git` en lecture seule (`status`, `rev-parse`, `log`, `diff`, `show <ref>:<chemin>`, `worktree list`) ; deux `git clone --no-local` hors dépôt (`F:/tmp/dojo/pr4a1-clone`, `F:/tmp/dojo/pr4a1-mutants/tree`), jetables. Aucun réseau ; rien sur C: (TEMP/TMP/TMPDIR sur `F:/tmp/dojo/pr4a1-tmp` pour toute exécution).

## 14. Corrections après G2 (2026-09-27)

- **Modèle résolu** (R-1) : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5` ; correcteur, instance fraîche, distincte du générateur du G1 et du relecteur G2 ; effort high (mission).
- **Mission** : `F:/tmp/dojo/mission-corr-pr4a1.md` (16 l., sha256 `1b659a4216c427653f23b7e4a51baeb2e1413f245c1de525ca88ef16ffe5751c`, texte calculé par le script de l'orchestrateur, lu comme tel), horodatage 2026-09-27T11:15Z ; `date -u` à la lecture : 11:06:23Z. Entrées : rapport G2 `F:/tmp/dojo/g2-pr4a1/G2-report.md` (sha256 `17b61686b861fd3c0075cb604d96adc5ea51493407a7c36cc2f86615e65b286c`, relu égal à la mission), ce journal (§0 à §13), l'ADR de lot, `dojo-verify.mjs` (`verifyDojoServed`, l.314 ; forme du rapport l.304-311 ; `.d.mts` : `Source.get` rend un `Buffer`), la fixture, la mission G1.
- **État à l'ouverture** : les quatre mêmes `??` qu'à la clôture du G1 ; sha256 relus égaux au §1 (copies d'avant correction : `F:/tmp/dojo/pr4a1-corr/before/`, dont l'ADR `5e511a11…d9b4`).

### 14.1 Horaires (`date -u`)

| Heure | Acte |
|---|---|
| 11:06:23Z | lecture de la mission ; puis rapport G2, modules, test, ADR, journal, `dojo-verify.mjs`, fixture, scripts du G2 |
| 11:0xZ → 11:11Z | mesure : `verifyDojoServed` accepte l'arbre EA (tête abstenue) et E1 (`ea-probe.test.ts`, hors dépôt) ; advisor intégré consulté (§14.8) |
| 11:11:13Z | copies d'avant correction ; puis modules et test écrits, ADR amendé |
| 11:13:54Z | test du lot 4/4 dans le worktree ; `tsc --noEmit` 0 ; `eslint` des trois fichiers 0 ; R-25 = 487 |
| 11:14:36Z | deux clones `--no-local` à `ceeb8cd` : `F:/tmp/dojo/pr4a1-corr/clone` (oracle) et `…/probe` (mutants, sondes, export) ; `mk-nm.ps1 -Tree` sur chacun (`entries: 220  monark: 10  fail: 0`) |
| 11:15:22Z → 11:16:3xZ | mutants : G1 20/20, G2 18/20 (G-M8, G-M19 équivalents déclarés), V 6/6 ; sondes adaptées (P1 à P12) |
| 11:18:20Z → 11:38:44Z | verrou d'hôte pris sans attente ; passage 1, passage 2, test 42 à part (§14.6) |
| 11:18:34Z → 11:19Z (export, smoke, tsc) ; 11:39:16Z → 11:52:31Z (portes de l'export sous verrou, attente 600 s : « corr PR-2b-2 ») ; 11:52:42Z → 11:59:54Z passage 3 sous verrou ; 12:00Z journal, livrables | export-run (§14.7) |

### 14.2 Décisions appliquées (décisions de l'orchestrateur, mission)

1. **C-G2-1 (bloquante), forme minimale du rapport, module inchangé sur ce point** : `dojo_served_loader_is_fail_closed` porte (a) le marcheur injecté rendant `voided` puis `breaks` non vides ⇒ refus nommés ; (b) le fichier d'historique altéré (même chemin, même compte, un chiffre changé) ⇒ refus par son sha256 au message du module (`history/<sha>.jsonl: the sha256 differs from the signed line`), puis absent ⇒ refus ; (c) la table des formes étendue, chaque mutant re-haché au manifeste : `algorithm` = `sha1`, `host` en `http://`, `schema` autre, `head.key_id` hors trousseau, `history_last_day` = `head.day`, tête `abstained` avec créneaux, `validated_total` > `score_total`, clé en trop dans `read_rule` ; (d) une ligne servie de la tête avec une clé en trop (re-rendue par `render(steps, files)`) ⇒ refus. `dojo_snapshot_composes_served_lines_to_page_figures` recode et compare, pour E1, E2 et EA, `head.line_hash` (SHA-256 des octets servis de la dernière ligne `snapshot`, qui sont sa forme canonique), `head.key_id` et `head.published_at` de cette ligne, `timeline.lines`/`snapshots` et `bodies_sha256` (SHA-256 des octets de `timeline.jsonl` et de `dojo/pubkey.json`). Les refus du module sont vérifiés à **leur** message : un contrôle retiré laisse passer l'arbre jusqu'à l'outil du lecteur, dont le message diffère, donc le mutant meurt (ordre : contrôles propres d'abord, outil du lecteur en dernier).
2. **C-G2-2, forme (B), appliquée** (règle P-10) : `DojoChainDeps` reçoit `verify` (`verifyDojoServed`) ; `buildDojoServed` devient **asynchrone** (`Promise<Record<string, unknown>>`) ; après tous ses contrôles, il exécute l'outil sur une source dont `get` rend des **vues sans copie** (`Buffer.from(b.buffer, b.byteOffset, b.byteLength)`) des octets mêmes de l'arbre qu'il projette, sous le **trousseau committé** (objet déjà analysé, celui que l'enregistrement porte), et refuse sauf `ok === true`, `head.recomputed_root` = `head.root` signé et `history.recomputed_root` = `history_root` signé ; message de refus : `the reader's tool refuses the served tree under the committed keyring (<code> at seq <n>: <détail>)`. Un fichier que seul l'outil lit (lignes d'un `snapshot` antérieur) manquant ⇒ refus (`the served tree lacks lines/…`, rejet propre, mesuré par le test). `$comment` de l'enregistrement complété d'une phrase (l'outil accepte les mêmes octets sous le trousseau committé). Test **`dojo_served_refuses_a_tree_the_verifier_refuses`** : P6 (`threshold_conversion_mismatch`), P8 (`score_mismatch`), P9 (`key_not_active`), puis deux rapports de l'outil réel dont la racine recomputée de la tête, puis de l'historique, est remplacée ⇒ refus. **DOJO-SERVED-WINDOWS-1 fermé** (P9). Forme (A) : PR-4a-2 (DOJO-SERVED-VERIFIED-FIGURES-1). Lignes datées : ADR D-3 et §3 (TU-7). R-25 ≤ 661 tenu (§14.4) : aucune coupe.
3. **C-G2-3** : item **DOJO-SERVED-ALL-MISSED-1** formé (ligne datée de l'ADR §7, 2026-09-27) : tête `counted` à K lectures toutes manquées, acceptée par `dojo-verify`, refusée par `buildDojoServed` (P11, rejoué : toujours refusée, message du module) ; déclencheur G0 de PR-3a ; aucun code.
4. **C-G2-4** (ligne datée, 2026-09-27) : renvoi à **EXPORT-CHECK-IN-EXPORT-1**, déjà formé par l'orchestrateur (CHANTIERS, 10:4xZ) ; mesuré de nouveau dans l'export de ces corrections : `export:check` exit 1 (`scripts/export-exclude-tests.json` absent, ENOENT) (§14.7), cause inchangée ; jamais cité vert.
5. **C-G2-5** (ligne datée de l'ADR D-1, 2026-09-27) : TXT-3 et `k_reads` tranchés au cp-1 bref de PR-4b ; `k_reads` reste le K de l'ancre.
6. **C-G2-6** : les 56 octets hors ASCII des commentaires remplacés (`—` et `──` par `--`, `§4` par `section 4`) : 0 octet hors ASCII dans les trois fichiers (`tr -d '\000-\177' | wc -c`), 0 octet CR ; **M-P9** : tenu à PR-4a-1 dans sa lecture chargeur (racine recomputée), confirmé ; ligne datée de l'ADR §4 (renvoi aux l.149 et l.152 de l'état `5e511a11…`) ; M-P9 côté CA reste à PR-4a-2.
7. **Équivalents déclarés** : G-M8 (`key_id` de la tête = celui de l'ancre) et G-M19 (version = première `price_version`) : une seule clé, une seule version dans la fixture ; item **DOJO-SERVED-FIXTURE-SPREAD-1** formé (ADR §7, 2026-09-27), déclencheur G1 de PR-4a-2.

### 14.3 Livrables après corrections

| Fichier | État | Lignes | sha256 |
|---|---|---|---|
| `apps/site/lib/dojo-served-load.ts` | créé (non suivi) | 247 | `89b54b157b18971f36eeaf6bc0f32e71684faba98eda4072da5c803ee689eed0` |
| `apps/site/lib/dojo-served.ts` | créé (non suivi) | 41 | `0ed8c63131d70c0d39f749064c6de9d57ddaecd2da9a131fbfb24fd3ae074722` |
| `test/dojo-served.test.ts` | créé (non suivi) | 199 | `335b123af0f0d662dec0239005d69d9d468f3a9b31fd526be03cd30fa79edf3b` |
| `docs/adr/ADR-DOJO-PR-4.md` | modifié (5 lignes datées ajoutées, après les l.96, 117, 145, 152, 208 de l'état `5e511a11…` ; aucune ligne retirée) | 236 | `155f8919a24695f8ac30d53d2e8e3799135d4bb29d37976408f8ed68d78a32f2` |
| `docs/G1-lot-dojo-pr4a1.md` | ce journal, §14 ajouté | — | rendu hors du fichier (`DELIVERED.sha256`) |

- Interface changée : `DojoChainDeps.verify: (opts: { source: { get: (rel: string) => Promise<Buffer> }; keyring: unknown }) => Promise<unknown>` ; `buildDojoServed(...)` : `Promise<Record<string, unknown>>`. `loadDojoServed` et `dojo-served.ts` inchangés hors commentaires.

### 14.4 Tests, R-25

- Worktree : `node --test test/dojo-served.test.ts` : **4/4** (les trois tests du G1 et `dojo_served_refuses_a_tree_the_verifier_refuses`) ; `tsc --noEmit` 0 ; `eslint` des trois fichiers 0.
- **R-25 = 487** (247 + 41 + 199), `pr2-1-r25-methodA.mjs` (`140be120…d3bf`, inchangé), pathspec de `ci.yml:82` (20 jetons), base `ceeb8cd` ; l'ADR (`docs/adr/**`) et ce journal hors pathspec. ×1,55 sur 315 ; ≤ 661,5 ; sous le seuil de repli de 600 ; STOP 1 150 loin.

### 14.5 Mutants et sondes (clone `F:/tmp/dojo/pr4a1-corr/probe`, fichiers du lot égaux au worktree, restauration par copie et sha256 contrôlé)

- **Mutants du G1** : `g1-mutants-corr.mjs` (`ded89387…6d13`) = `F:/tmp/dojo/pr4a1-mutants/mutants.mjs` à trois chemins près (arbre, sortie, TEMP ; `diff` relu) ; `RESULTS-g1-mutants.txt` (`f18e1428…2e67`) : **20/20 tués**, 0 `NOT APPLIED`.
- **Sondes de code du G2** : `g2-mutants-corr.mjs` (`1c584c58…81d1`) = `F:/tmp/dojo/g2-pr4a1/g2-mutants.mjs` (`93fbb83a…219f`) à trois chemins près ; `RESULTS-g2-mutants.txt` (`7a94cddf…dc60`) : **18/20 tués** ; G-M1 à G-M7, G-M9 à G-M18, G-M20 tués ; **G-M8 et G-M19 survivent, équivalents sous la fixture, déclarés** (§14.2 point 7) ; 0 `NOT APPLIED`.
- **Mutants de la forme (B)** : `v-mutants.mjs` (`f837aed1…fac39`), `RESULTS-v-mutants.txt` (`9906c5d4…8dd6`) : **6/6 tués** : V-1 outil non exécuté (rapport forgé `ok` aux racines signées), V-2 `ok` non lu, V-3 racine de tête non comparée, V-4 racine d'historique non comparée, V-5 outil sous le jeu de clés servi, V-6 outil sans trousseau (auto-cohérent).
- **Sondes comportementales** : `corr-probes.test.ts` (`d61d38a4…0491`) = `g2-probes.test.ts` du G2 (`4cffd3aa…6626`) **adaptée** (le rapport G2 la disait rejouable « telle quelle » : faux après la forme (B)) : `verify` ajouté à `DEPS`, `build` et `tryBuild` asynchrones, `await` sur chaque appel (16 lignes du `diff`, relues) ; copiée dans `probe/test/`, exécutée, retirée ; `probes.log` (`5113d326…0e76`), exit 0 : P1, P2, P3a, P3b, P4, P5, P10 refusés (messages du module) ; **P6, P7, P8, P9 refusés** par l'outil du lecteur (`threshold_conversion_mismatch`, `units_mismatch`, `score_mismatch`, `key_not_active`) ; P11 refusé (C-G2-3, inchangé) ; P12 (E2 intact) accepté, mêmes chiffres qu'au G1 (165000000, 150000000, 17.948718, 1, 3.589744).

### 14.6 Oracle (sous verrou d'hôte, une prise ; C-V-4)

- Scripts `F:/tmp/dojo/pr4a1-corr/` : `locked.sh` (`243e3c11…2f03` : `mkdir F:/tmp/oracle-lock` atomique, propriétaire « corr PR-4a-1 », attente 60 s jusqu'à 120 min, `rmdir` dans le piège EXIT), `oracle-pass.sh` (`4a90e14d…0388` : sha256 des trois fichiers du lot **et de l'ADR** avant et après, compte des `node.exe`, sept portes `npm run` sans les huit variables payantes), `t42.sh` (`665ba206…5219`), `run-all.sh` (`9b27f639…60e6` : passage 1, passage 2, test 42 dans une prise), `sync.sh` (`6ee6570c…b013`). Clone `F:/tmp/dojo/pr4a1-corr/clone` (HEAD `ceeb8cd`, Node v24.15.0), fichiers du lot et ADR copiés (`cmp` égaux) ; `lot-sha-before.txt` = `lot-sha-after.txt` à chaque passage (`4035a2a4…e990`, égaux au §14.3).
- **Prise 1** (`locked-run.log`) : verrou pris 11:18:20Z sans attente, rendu 11:38:44Z.
  - **Passage 1** (`out-1`, 11:18:21Z → 11:26:32Z ; 24 `node.exe` au lancement) : **7/7 exit 0** (`exits.txt` `9cec1b71…7a89`) ; `test` : 1 395 tests, **1 393 pass, 0 fail**, 0 annulé, 2 skipped (préexistants) ; les quatre tests du lot ✔, `site_names_no_kitchen` ✔, **test 42 ✔ dans la suite** (429,1 s) (`test.log` `b8b1784c…b806`).
  - **Passage 2** (`out-2`, 11:26:33Z → 11:35:06Z ; 26 `node.exe`) : 6/7 ; **`test` exit 1** : 1 395 tests, 1 392 pass, **1 fail** : `export_public_no_governance_no_french` (test 42) dans la suite, 450,5 s : « exported CI (npm run ci) failed (status=1, error=none): tests 510 / pass 503 / fail 1 » (`test/export-public.test.ts:366`), **même signature qu'au G2**, test interne non nommé par l'assertion ; les quatre tests du lot ✔, `site_names_no_kitchen` ✔ (`exits.txt` `0a028005…4b6f`, `test.log` `d86dbedb…4cec`). **Gardé ; jamais cité comme vert.**
  - **Test 42 à part, même prise** (`t42`, 11:35:06Z → 11:38:44Z ; 28 `node.exe`) : exit 0, **2/2 ✔** (217,3 s ; `test42.log` `d9a0020b…ad99`), sur les mêmes fichiers.
- **Nommer le test interne (T42-INNER-NAME-1, consigne du G2 §6)** : CI de l'export rejouée seule sous verrou (prise 2, §14.7) : `npm run ci` **exit 0**, 509 tests, 503 pass, **0 fail**, 6 skipped : l'échec **n'est pas reproduit** hors charge ; le test interne reste non nommé ; item T42-INNER-NAME-1 **inchangé** (l'assertion de 42(e) ne rend que les comptes ; forme du G2 : ajouter les lignes `/^✖ /m` de la sortie au message), désormais **second rouge non attribué** : son déclencheur est atteint, à trancher par l'orchestrateur (Q-C3). Le test interne n'est pas un test du lot par construction (`test/` non exporté ; les deux modules exportés n'ont aucun test dans l'export).
- **Prise 3** (`locked-run3.log`, verrou pris 11:52:42Z sans attente, rendu 11:59:54Z) : **passage 3** (`out-3`, 23 `node.exe`) : **7/7 exit 0** (`exits.txt` `407c6706…68a0`) ; `test` : 1 395 tests, **1 393 pass, 0 fail**, 2 skipped ; les quatre tests du lot ✔, `site_names_no_kitchen` ✔, **test 42 ✔ dans la suite** (376,1 s) (`test.log` `fffa436f…b075`).
- **Lecture** : deux passages verts (1 et 3) sur l'arbre corrigé, test 42 à part vert ; le passage 2 rouge par le seul test 42, rouge à contenu égal entre deux verts, sans la signature de T42-LOAD-1 ; aucune suite complète hors verrou (C-V-4) ; hors verrou : fichiers de test isolés (mutants, sondes), `tsc`, `eslint` des trois fichiers, export, `smoke`, `tsc` de l'export.

### 14.7 Export-run

- Export depuis le clone `probe` (fichiers du lot et ADR égaux au worktree) : `node scripts/export-public.mjs --out F:/tmp/dojo/pr4a1-corr/export` exit 0 (11:18:34Z) ; les deux modules présents, `cmp` égaux au worktree ; aucun `test/` (Q-1 du G1, inchangé) ; `mk-nm.ps1 -Tree` (`entries: 220  monark: 10  fail: 0`).
- **Exécution dans l'export** : `exportrun/smoke.mjs` (`88070686…8ab4`) importe les deux modules **exportés** : `loadDojoServed` ⇒ `null` (E0), `dojoPageFiguresOf(null)` ⇒ E0, `shiftUnits("17948718", 6)` ⇒ `17.948718`, et `buildDojoServed` (chaîne injectée factice) rend une `Promise` rejetée « the committed keyring is not JSON » **avant** tout appel de l'outil (`called: 0`) ; exit 0 (`smoke.log` `ace43f27…d914`).
- **Typage dans l'export** : `tsc -p exportrun/tsconfig.lib.json` (`bb7310f7…5966`, `include` = les deux modules, `typeRoots` de l'export) ⇒ exit 0 (`Buffer` résolu par `@types/node` de l'export ; précédent `narabi-calib-load.ts`).
- **Portes dans l'export, sous verrou** (prise 2, `locked-export.log` : attente 600 s, « corr PR-2b-2 », pris 11:49:20Z, rendu 11:52:31Z ; 24 `node.exe`) : `npm run ci` (`gate:vocab` 270 fichiers, `typecheck`, `test`) **0** (509 tests, 503 pass, 0 fail, 6 skipped ; `ci.log` `735f1073…5457`) ; `lang:gate` 0 ; `lint` 0 ; `eslint` des deux modules 0 ; `export:check` **1** (`export-check.log` `4575e47f…94c8` : `scripts/export-exclude-tests.json` absent, ENOENT : C-G2-4, EXPORT-CHECK-IN-EXPORT-1, cause inchangée, **jamais cité vert**) ; `exits.txt` `200d358f…615e`.

### 14.8 Advisor

- Consulté par l'outil intégré après l'orientation, avant toute écriture : ordre des contrôles (propres d'abord, outil en dernier, refus vérifiés à leur message), vues `Buffer` sans copie, `verify` obligatoire, cas à rapport forgé pour les racines, sondes du G2 non rejouables telles quelles, lignes cibles des mutants à garder intactes, porte de cuisine sur `apps/site/**` (aucun « G2 » dans les commentaires), cas de la table des formes, R-25 mesuré avant l'oracle, deux passages et le test 42 dans une prise, lignes datées de l'ADR. Conseil, jamais verdict ; chaque point vérifié sur pièce.
- Seconde consultation (12:0xZ), livrables écrits, oracle et export-run rendus : aucun changement de verdict ni de code ; retenus : consigner cette consultation, corriger trois renvois de section et le compte de lignes de la mission (16), régénérer `DELIVERED.sha256` après la dernière retouche du journal, rendre les tests sans les compresser en « verts » (passage 2 gardé rouge). Conseil, jamais verdict.

### 14.9 Items et questions

- Items formés ou touchés : DOJO-SERVED-ALL-MISSED-1 (formé), DOJO-SERVED-FIXTURE-SPREAD-1 (formé), DOJO-SERVED-VERIFIED-FIGURES-1 ((B) appliquée, (A) à PR-4a-2), DOJO-SERVED-WINDOWS-1 (**fermé**), EXPORT-CHECK-IN-EXPORT-1 (renvoi), T42-INNER-NAME-1 (déclencheur « second rouge non attribué » atteint, Q-C3), DOJO-SERVED-DEPLOY-CHECK-1 (inchangé).
- **Q-C1 (orchestrateur)** : le G2 écrivait ses sondes rejouables « telles quelles » ; la forme (B) (asynchrone, `verify` requis) les rend inexécutables sans adaptation ; adaptation faite et déclarée (§14.5) ; confirmer qu'elle vaut rejeu pour le G7.
- **Q-C3 (orchestrateur)** : T42-INNER-NAME-1 : second rouge non attribué du test 42 dans une suite (G2, puis passage 2 ici), non reproduit dans la CI de l'export rejouée seule ; ouvrir maintenant le lot qui nomme le test interne (message de 42(e) portant les lignes `✖`), ou attendre un troisième rouge ?
- **Q-C2 (orchestrateur)** : le test de composition n'appelle plus `verifyDojoServed` à part (l'outil tourne désormais dans `buildDojoServed` pour E1, E2 **et EA**, mesuré) ; le constat TC-0 « `verifyDojoServed` sur E1 et E2 » du G1 devient « dans le chemin de `buildDojoServed`, trois états » ; confirmer.

### 14.10 `git status --short` final (worktree)

Relevé à 12:00:13Z (`git diff --stat HEAD` : `docs/adr/ADR-DOJO-PR-4.md | 5 +++++`) :

```
 M docs/adr/ADR-DOJO-PR-4.md
?? apps/site/lib/dojo-served-load.ts
?? apps/site/lib/dojo-served.ts
?? docs/G1-lot-dojo-pr4a1.md
?? test/dojo-served.test.ts
```

Aucun `git add/commit/stash/checkout/branch` dans le worktree (R-20) ; `git` en lecture seule (`status`, `log`, `diff`, `rev-parse`) ; deux `git clone --no-local` hors dépôt (`F:/tmp/dojo/pr4a1-corr/clone`, `…/probe`) et l'export `…/export`, jetables : leurs `node_modules` sont des jonctions de `mk-nm.ps1`, à retirer par `rm-nm.ps1 -Tree <arbre>` **avant** toute suppression. Aucun réseau ; rien sur C: (TEMP/TMP/TMPDIR sur `F:/tmp/dojo/pr4a1-corr/tmp`). Livrables : `F:/tmp/dojo/pr4a1-corr-deliver/` + `DELIVERED.sha256`.
