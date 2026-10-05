# G7 du lot UKEMI-PENDING-SNAPSHOT-1 : instantané en attente de l'état servi d'ukemi, avant C2

- **Base** : `origin/base/chantier-moteur-2026-10-03` = `87f6081c` au gel `5ccfd1bf` ; refetchée au pli du G2 (2026-10-05) : `7af2ad63` (amendement 9 de l'ADR-CM, docs seuls), fusionnée par `ecfac60a`. Branche `recherches/ukemi-pending-snapshot-1`, arbre `/home/user/monark-governance-ups`. Auteur : RECHERCHES. Branche poussée après le pli du G2 ; aucune PR ouverte.
- **Sources** : G0 `docs/G0-lot-ukemi-pending-snapshot-1.md` et sa section 11 (décisions) ; décision déléguée `recherches` `coordination/pieces/2026-10-05-ukemi-snapshot-avis/DECISION-UPS-C1-C6.md` et l'avis `AVIS-advisor-UPS-C1-C6.md` ; réponses de MONARK `coordination/messages/2026-10-05-MONARK-vers-RECHERCHES-UPS-M1-M4.md` (M1 à M4 : oui) et `2026-10-05-MONARK-vers-RECHERCHES-am9-UPS.md` (`6afb800` : garde de M3 dans ce lot ; `ukemi-pending.json` couvert par Q-F1 s'il ne porte que l'état liq servi en 1.1.0 ; `$comment` par la porte de vocabulaire).
- **Environnement** : Node 24.21.0, variables de proxy retirées, TMPDIR propre (effacé en fin de lot).

## Commits

| Commit | Objet |
|---|---|
| `ae56f0c9` | G0 |
| `295d9713` | G0 avec décisions (section 11) |
| `fea9838f` | tests rouges : 5 tests neufs ; l.623, l.1175, l.1480, l.1633 lisent la cible en processus |
| `34a06749` | code (premier gel) |
| `03c6cedf` | correctif trouvé au rejeu de la simulation 1 avec `--pending` (voir « Écarts ») |
| `5ccfd1bf` | **gel** : R-25 ramené sous sa borne, tueurs réancrés |
| `07d7620f` | G7 |
| `ecfac60a` | fusion de la base `7af2ad63` (docs seuls) |
| `f951aaa4` | pli du G2 : tests rouges (m-1, m-2, m-4) |
| `f428732c` | pli du G2 : **gel** (m-4, m-3) |
| (ce commit) | G7 complété : section « G2 », m-5, notes pour C2 |

## Ce que le lot écrit (quatre fichiers, zone de Q-UP-1)

- `apps/site/lib/ukemi-served-load.ts` :
  - `loadUkemiServed` admet `pending_since` (jour UTC, schéma v2 seulement) et ne le rend pas ;
  - `UKEMI_PENDING_REL`, `UKEMI_PENDING_SHARED` (liste fixe), `UkemiPending` ;
  - `loadUkemiPending(root)` : null sans fichier ; sinon fermeture sûre (« si et seulement si » avec `pending_since`, manifeste, clés closes, schéma `monark-site-ukemi-pending-v1`, `pending_since` pas postérieur au jour de `written_at`, mêmes contrôles de forme que le servi sur les champs partagés, verdict à huit clés) ;
  - `loadUkemiInProcess(root)` = `loadUkemiPending(root) ?? loadUkemiServed(root)`, la cible unique des épingles en processus. Seuls les tests du dépôt source la lisent ; les pages lisent `loadUkemiServed`.
- `scripts/sync-ukemi-served.mjs` :
  - `verdictFactsOf` : contrôles du verdict contre l'état et le registre de l'arbre, sans la CA ; `servedVerdictFacts` = `verdictFactsOf`, puis le contrôle de CA, octets inchangés ;
  - `inProcessUkemiPending`, `markPendingSince`, `ukemiPendingDiff`, `removeManifestEntry` (une ligne exactement, refus d'un manifeste non canonique et d'une entrée absente), `promotionBlocked` (garde de M3) ;
  - `--pending` (`pendingMain`) : tout calculé d'abord, puis écrit dans l'ordre en attente, servi, manifeste ;
  - promotion dans `main()` : refus tant que `harness-pending.json` existe (la garde porte sur **toute** synchro par défaut, pas sur la seule promotion : voir « G2 », m-3) ; refus sur écart ; écrit dans l'ordre servi, manifeste (entrée en attente retirée), retrait du fichier en attente.
- `scripts/sync-ukemi-served.d.mts` : déclarations des fonctions et constantes neuves.
- `test/site-ukemi.test.ts` :
  - cinq tests neufs ;
  - l.623 (la cible garde le nom `s`, le piège de l.1439 tenu), l.1175 partie (1) (assertion l.1204 sur la cible) et partie (2) (le verdict en attente égale celui de la synchro), l.1480 (figure sur le servi, épingle l.1488 distincte sur la cible), l.1633 (sur la cible) ;
  - `tmpRoot` copie l'instantané en attente quand l'arbre en porte un ; les `TRAPS` sont inchangés à l'octet.
- `$comment` de `ukemi-pending.json` : calqué sur celui de `harness-pending.json`. **Corrigé au pli du G2 (m-5)** : `gate:vocab` ne lit pas `apps/site/data` (`scripts/grep-forbidden.mjs:85`, `SITE_SKIP` contient `data`), son vert sur une copie ne prouvait donc rien. Contrôle direct : le fichier rendu par `inProcessUkemiPending` (et son `$comment` seul) passé à `scanText` avec les motifs GLOBAL et ceux du site, phrases exemptées comprises ou non : **0 hit** ; avec GLOBAL et ceux du harnais : 0 hit. **C2 rejoue ce contrôle** sur le fichier versé.
- **Aucun fichier de données versé** : `ukemi-pending.json`, `pending_since` et les entrées de manifeste entrent avec C2.

## Preuves

- **Tests rouges à la base** (`fea9838f` sur le code de `87f6081c`) : 9 rouges par assertion (`ERR_ASSERTION`), 23 verts.
- **red-proof** : `node scripts/red-proof.mjs --base 87f6081c --gel 5ccfd1bf --repo /home/user/monark-governance-ups --draw 9 --seed 37` : **OK**, 9 tests jugés, **9 F2P**, 23 inchangés, **9 tueurs tirés, 9 tués**. SHA-256 de `RED-PROOF.json` : `7d1e5283…8087ee`.
- **Campagne des tueurs** (`scripts/mutants/run.mjs --killers`) : **9/9 tués**, exit 0 ; enregistrement `a0558369…2bd12d`.
- **Ancres** (`verifie-ancres.mjs . --touched 87f6081c HEAD`) : tueurs 9 ; ANCRE 9 ; DÉRIVÉ 0 ; PERDU 0.
- **Tueurs en forme fermée** (ligne au-dessus de chaque test), et les tests de `site-ukemi` que chacun rougit (mesure au gel, mutant appliqué seul, fichier entier relancé) :

  | Tueur | Porté par | Rougit aussi |
  |---|---|---|
  | `ukemi-served-load.ts:196 SDL` (« si et seulement si » : en attente sans `pending_since`) | test 1 | (seul) |
  | `ukemi-served-load.ts:192 CONST "!existsSync(join(rootDir, UKEMI_PENDING_REL))" -> "true"` | test 2 | l.1480, l.1633, tests 1, 3, 4 |
  | `ukemi-served-load.ts:180 CONST "servedFile(rootDir).out" -> "{ ...servedFile(rootDir).out, ...loadUkemiPending(rootDir) }"` | test 3 | l.623, l.1633 |
  | `sync-ukemi-served.mjs:215 CONST "UKEMI_PENDING_SHARED.filter" -> "Object.keys(pending).filter"` | test 4 | (seul) |
  | `sync-ukemi-served.mjs:238 CONST "existsSync(join(root, HARNESS_PENDING_REL))" -> "false"` (garde de M3) | test 5 | (seul) |
  | `sync-ukemi-served.mjs:233 CONST "return marked;" -> réécriture de l'objet entier` | l.623 | (seul) |
  | `sync-ukemi-served.mjs:224 CONST` (verdict brut sans `verdictFactsOf`) | l.1175 | tests 2, 4 |
  | `ukemi-served-load.ts:211 CONST "loadUkemiPending(rootDir) ?? loadUkemiServed(rootDir)" -> "loadUkemiServed(rootDir)"` (tueur neuf de C6) | l.1480 | l.1633, tests 1, 2, 4 |
  | `ukemi-served-load.ts:203 ROR "pendingSince > o.written_at" -> "pendingSince < o.written_at"` | l.1633 | l.1480, tests 1, 2, 3, 4 |

  Correction de la section 11 du G0 : le test 4 ne rougit pas sur `markPendingSince` (`:233`, tenu par l.623 seul) ni sur la garde (`:238`, tenue par le test 5 seul).
- **Rien de servi ne bouge** :
  - `git diff 87f6081c HEAD` est vide sur `apps/site/data`, `apps/site/app`, `apps/site/components`, `fixtures` et `docs/deploy-CA-harness.json` ;
  - la projection rendue est la même à la base et au gel, mêmes octets : `loadUkemiServed`, `servedFiguresOf`, `buildCourseView` et `ukemiExpected` de `assert-fleet-html.mjs`, sérialisés ensemble, ont l'empreinte `6e76b3da…b8bee` (9 979 caractères) aux deux bouts ;
  - `servedVerdictFacts` rend `verdictFactsOf` suivi de `body_sha256`, mêmes clés, même ordre (test 4, partie 4).
- **Suite** :
  - `npm test` complet au gel : 2 312 tests, 2 290 verts, **0 rouge**, 22 sautés, exit 0 (test 42 compris) ;
  - `tsc --noEmit` : propre ; `npm run lint` : propre ; `lint:ratchet` : 69/69 ; `gate:vocab` : OK ; `lang:gate` : OK ; `export:check` : OK.
- **R-25** (`r25()` de `scripts/oracle/r25.mjs`, contre `87f6081c`) : **541 lignes** (+474/−67, 4 fichiers ; borne 547 ; ~460 estimé). `CONTENT_STAT` : 0.

## Simulations du G0, rejouées sur une copie jetable du gel `5ccfd1bf`

Copies effacées après usage ; l'arbre de travail est resté propre.

- **Simulation 1, l'empreinte seule** (`calibDigest` = `scoresSha256` ; épingles de `calibration.ts` et littéral de la CA ré-épinglés ; liq s0 → `a9277222…`, comme au G0) :
  - **sans `--pending`** : 6 rouges sur les cinq fichiers. Ce sont les trois du G0 (l.1175, l.1480, l.1633), plus le test 4 (voulu, C6 condition 4), plus le test 2 (sa relecture finale de l'arbre, `pinsHold(ROOT)`, voulue elle aussi), plus `narabi-live:539` (hors lot) ;
  - **avec `--pending`** : **zéro rouge de `site-ukemi`** ; seul `narabi-live:539` reste (hors lot, Q-M6 du bloc C).

  `--pending` ajoute une seule ligne au servi (`pending_since`), et deux lignes au manifeste (l'entrée du servi changée, celle de l'en attente posée).
- **Simulation 2, une phrase de la clause liq** (`LIQ_H3_SENTENCE` allongée) :
  - **sans `--pending`** : l.623, les tests 2 et 4, l.152 et l.1175 rougissent dans `site-ukemi` ; ailleurs, les rouges du G0 (harnais, CA, `narabi-live:539`) ;
  - **avec `--pending`** : **l.623 et les tests 2 et 4 sont verts**. Dans `site-ukemi` restent l.152 (Q-UPS-M4, voulu) et l.1175, rouge par la CA lancée en enfant (`committed_text=false` de `verify-harness.mjs`, zone de C', P-4 du bloc C), comme au G0. Hors `site-ukemi`, les mêmes rouges qu'au G0.
- Comptes vérifiés fichier par fichier (117 tests). Un passage groupé des cinq fichiers a parfois compté moins de tests ; l'ensemble des rouges n'a pas changé.

## Écarts au G0 et à la décision

1. **Neuf tests jugés et neuf tueurs, au lieu de « 4 F2P, 8 tueurs ».** `red-proof` juge tout test dont le corps change, et exige de chacun un rouge par assertion à la base et un tueur sur sa ligne. Les quatre tests existants changent ; la garde de M3 prend un test neuf. Section 11 du G0, commit `295d9713`.
2. **Cible dans le chargeur.** Un tueur ne mute pas un `*.test.ts`. La cible est donc `loadUkemiInProcess` dans `ukemi-served-load.ts`, et le tueur neuf de C6 porte sur cette ligne, au lieu de l'adresse du test 4. Le fichier est exporté : la fonction y entre sans page qui la lise.
3. **Correctif au premier gel (`03c6cedf`).** Le rejeu de la simulation 1 avec `--pending` a rougi l.1397, l.1600 et le test 3 :
   - les variantes v1 du servi étaient bâties sur `rawServed()`, qui porte alors `pending_since` ; or v1 refuse cette clé (C5 condition 1). `rawServed()` la retire désormais, et `tmpRoot` copie le servi tel quel ;
   - le test 3 comparait un servi égal à l'arbre au servi versé ; il pose maintenant le servi versé, marqué.

   red-proof et les tueurs ont été rejoués sur le gel final.
4. **R-25 sous sa borne sans la coupe nommée.** Le premier gel mesurait 606. Le gel final mesure 541, sans retirer aucun contrôle décidé :
   - la relecture du test 2 tient la clause, la classe et le drapeau cascade par `syncPin` (champs partagés), et l.623 garde ses assertions en place ;
   - un seul helper de mise en scène (`withStage`) ;
   - en-têtes plus courts.
5. **`removeManifestEntry` refuse de retirer la dernière entrée du manifeste** (la virgule de la ligne précédente changerait). L'entrée en attente se pose après la dernière clé `ukemi-`, suivie aujourd'hui de `harness-served.json` : sans effet tant que l'ordre du manifeste ne change pas.

## Pour C2 et T0

- **C2 (3c-3b), renommage B-17** (N-1 du G2) : `verdictFactsOf`, une fonction, lit `calib_digest` pour le servi et l'en attente. Le `runGate(...).verdict.calib_digest` de l.1633 vit désormais dans le helper `gatePin` du fichier de test, au niveau du module. Le littéral `"1.0.0"` y est aussi. Zone de M1 : `test/site-ukemi.test.ts` au-delà de ses littéraux. Lieux exacts : `verdictFactsOf` (`scripts/sync-ukemi-served.mjs:133`, `:142`, `:151`) ; `gatePin` (`test/site-ukemi.test.ts:431-439`, `.verdict.calib_digest` et `"1.0.0"` à `:436`) ; un second `runGate` avec `"1.0.0"` à `:1559` (autre test, un des trois littéraux de M1). Le contrôle (5) du test 4 reste valide : la clé du site reste `calibration_digest`.
- **C2 (3c-3c)** : `node scripts/sync-ukemi-served.mjs --pending`, puis verser `ukemi-pending.json`, `ukemi-served.json` (une ligne `pending_since`) et le manifeste dans le même commit. Le lancer **après** la bascule du registre et le renommage B-17 (N-2 du G2) : `inProcessUkemiPending` lit l'arbre en processus ; lancé avant, il écrirait l'ancien état. Chaque relance réécrit `written_at` et l'empreinte du manifeste, et garde `pending_since`. Le versement coûte environ 25 lignes de R-25 (Q-M4). Une fois versé, le fichier tue aussi o2 par l'arbre (`pending_since` = jour de `written_at`). Rejouer le contrôle `scanText` de m-5 sur le fichier versé.
- **Entre C2 et T0** (C3 condition 3) : la synchro par défaut contre le harnais déployé échoue fermé (`verdictFactsOf` lira `scores_sha256`, absent du fil 1.0.0). Aucune resynchro du servi d'ukemi n'est possible dans cette fenêtre.
- **T0** : CA, synchro du harnais (sa promotion retire `harness-pending.json`), puis synchro d'ukemi. Celle-ci refuse tant que `harness-pending.json` existe (garde de M3, testée), refuse sur écart, et retire elle-même l'instantané en attente et son entrée de manifeste.
- **T0, forme du manifeste** (N-3 du G2) : l'entrée en attente d'ukemi se pose avant `harness-served.json`, donc n'est pas la dernière. `removeManifestEntry` refuse la dernière entrée : la ligne `harness-pending.json` ajoutée ou retirée à la main par MONARK doit garder la forme canonique, sinon la promotion d'ukemi refuse (fermé).
- **T0, promotion interrompue** (m-4) : si le servi et le manifeste sont écrits mais que `ukemi-pending.json` est resté, la relance refuse ; le message dit désormais de retirer `apps/site/data/ukemi-pending.json` quand le servi ne porte plus `pending_since`.

## G2

- **Pièce** : `recherches/coordination/pieces/2026-10-04-G2-recherches/G2-ukemi-pending-snapshot-1.md`, sur la tête `07d7620f`. Verdict : **APPROUVE SOUS RÉSERVE** (réserve m-1), aucun bloquant ; ancres 9/9 ; 9 tueurs tués ; simulations du G7 reproduites.
- **Pli** (`f951aaa4` tests rouges, `f428732c` gel ; base refetchée et fusionnée avant, `ecfac60a`) :
  - **m-1 (réserve, levée)** : le test 5 vérifie dans le corps de `main()` que `const blocked = promotionBlocked(ROOT);` précède `if (blocked !== null) fail(blocked);`, que celle-ci précède le premier `readBody(`, et que `if (drift.length > 0) throw` précède le premier `writeFileSync(` (`scripts/sync-ukemi-served.mjs:264`, `:295`).
  - **m-2** : trois cas au test 1 : `pending_since` égal au jour de `written_at` (contrôle positif, tue `>` → `>=`) ; `pending_since` = `"2026-1-4"` (pas postérieur) avec `/must be a UTC day/` (remplace le cas « 4 October ») ; `written_at` non ISO avec `/written_at must be an ISO UTC instant/` (`ukemi-served-load.ts:160`, `:202`).
  - **m-3 (décision de cellule, RECHERCHES)** : rien ne change dans la logique. La garde de M3 bloque **toute** synchro par défaut, pas la seule promotion : elle échoue fermé, et entre C2 et T0 la synchro par défaut échoue de toute façon (C3.3). C'est écrit ici et en commentaire sur la ligne même (`:264`). `promote && blocked` est proposé à MONARK comme option seulement (Q-UPS-G2-1).
  - **m-4** : le refus d'une entrée absente (`:200`) dit maintenant à l'opérateur de retirer `ukemi-pending.json` quand le servi ne porte plus `pending_since` (promotion interrompue après le manifeste). Le test 4 tient le message (F2P du pli).
  - **m-5** : affirmation du G7 sur `gate:vocab` corrigée (section « Ce que le lot écrit ») ; contrôle direct `scanText` : 0 hit ; C2 le rejoue.
  - **Q-UPS-G7-1** : `loadUkemiInProcess` reste exporté par le chargeur (G2 : acceptable) ; l'autre place est notée aux « Questions ».
  - **N-1 à N-3** : reportées dans « Pour C2 et T0 ».
- **Tueurs à la main** (au gel `f428732c`, mutant appliqué seul, `site-ukemi` relancé, fichier restauré) : tous **tués**, chacun par le seul test qui le porte.

  | Mutant (forme fermée) | Tué par |
  |---|---|
  | `sync-ukemi-served.mjs:264 SDL "if (blocked !== null) fail(blocked);" -> ""` (o1) | test 5 |
  | `sync-ukemi-served.mjs:295 ROR "drift.length > 0" -> "drift.length < 0"` (o16) | test 5 |
  | `ukemi-served-load.ts:203 ROR "pendingSince > o.written_at" -> "pendingSince >= o.written_at"` (o2) | test 1 |
  | `ukemi-served-load.ts:160 SDL " \|\| !/^\d{4}-\d{2}-\d{2}$/.test(o.pending_since)" -> ""` (o8) | test 1 |
  | `ukemi-served-load.ts:202 SDL " \|\| !ISO_UTC.test(o.written_at)" -> ""` (o11) | test 1 |
  | `sync-ukemi-served.mjs:200` message de m-4 ramené à l'ancien | test 4 |

  Les tueurs déclarés au-dessus des tests 1 et 5 restent `:196` et `:238` (un seul par test) ; ceux-ci sont consignés ici.
- **red-proof du pli** (`--base 07d7620f --gel f428732c --draw 3 --seed 37`) : 3 tests jugés ; test 4 **F2P** ; tests 1 et 5 « green at base » (resserrements, attendu : tueurs à la main ci-dessus) ; 1 tueur tiré, tué. Verdict de l'outil REFUSED par construction ; `RED-PROOF.json` `2ffa579a…82241d`.
- **red-proof du lot** (`--base 7af2ad63 --gel f428732c --draw 9 --seed 37`) : **OK**, 9 jugés, **9 F2P**, 23 inchangés, 9 tueurs tirés, 9 tués ; `RED-PROOF.json` `f65be886…c665a`.
- **Ancres** (`verifie-ancres.mjs . --touched 7af2ad63 HEAD`) : tueurs 9 ; ANCRE 9 ; DÉRIVÉ 0 ; PERDU 0.
- **Suite au gel du pli** : `site-ukemi` + `harness-served` + `verify-harness-liq` : 53/53, deux passages ; `npm test` complet : 2 288 tests, 2 266 verts, **0 rouge**, 22 sautés, exit 0 (un premier passage, lancé en même temps que `lint`, avait rougi le test 42 par « implausibly small suite » ; relancé seul : vert ; puis passage complet seul : vert ; le nombre de tests d'un passage groupé varie, voir « Simulations ») ; `tsc --noEmit` propre ; `lint` propre ; `lint:ratchet` 69/69 ; `gate:vocab`, `lang:gate`, `export:check` : OK.
- **R-25** (`r25()` contre `7af2ad63`) : **545** (+478/−67), borne 547 ; `CONTENT_STAT` 0.

## Questions

- **Q-UPS-G7-1 (MONARK)** : accepter les écarts 1 et 2 (neuf tests jugés et neuf tueurs ; cible `loadUkemiInProcess` dans le chargeur exporté) ? Le G2 juge l'export **acceptable** (le fichier part déjà en entier dans l'export ; fonction pure ; commentaire exact) ; RECHERCHES le garde dans le chargeur. Autre place possible, non exigée : `scripts/sync-ukemi-served.mjs` (non exporté, importe déjà le chargeur, mutable par un tueur), coût d'environ ±0 ligne.
- **Q-UPS-G2-1 (MONARK, option seulement)** : restreindre la garde de M3 à la promotion (`if (promote && blocked !== null)`) ? RECHERCHES garde le blocage de toute synchro par défaut (m-3) ; l'option n'a de sens que si l'ordre de T0 l'accepte.
- **Q-UPS-G7-2 (MONARK)** : la garde de M3 est dans le code (`promotionBlocked`, 3 lignes plus son appel), avec son test et son tueur. Elle double la garde d'envoi du RUNBOOK-vitrine, qu'elle ne remplace pas.
- Rien d'autre d'ouvert dans ce lot.
