# ADR-UKEMI-DIGIT-1 — `/ukemi` : note « conformal » (décision 216) et chiffres de la strate committée sous liste fermée (décision 217) ; plan de sprint du lot vitrine T2 UKEMI-DIGIT-1, sans code

- **Statut** : G0 committé (`82d6bfb`) ; checkpoint-1 **ACCEPTE-AVEC-CORRECTIONS** (validateur-humain `claude-fable-5-1`, rapport `F:/tmp/udigit/cp1/CP1-report.md`, sha256 `31a863df4373e11f79f6d060ca08550b9348caf22843f93663c6f57f8aa0fd12`) ; corrections C-1..C-6 pliées aux endroits du plan qu'elles touchent et P-1..P-10 écrits comme tranchés (§0 ; amendement daté en fin de fichier) ; texte de worker à relire et committer par l'orchestrateur (R-20, R-21) ; aucun code avant la mission G1.
- **Dates** : décisions 216 et 217 le 2026-09-25 à 04:22 UTC (`docs/CHANTIERS.md:1516`) ; rédaction le 2026-09-25 à partir de 07:21:44 UTC (`date -u`) ; checkpoint-1 rendu le 2026-09-25 (rapport clos à 07:47:57 UTC) ; pli du checkpoint-1 le 2026-09-25 de 07:49:37 à 07:55:07 UTC (`date -u` ; amendement daté en fin de fichier).
- **Propriétaire de la décision** : l'investisseur pour les textes et les chiffres publics (216, 217) ; l'orchestrateur pour le plan et le verdict G7 ; le validateur-humain aux deux checkpoints (régime T2).
- **Gate** : G0 du lot. Régime ADR-M013 **T2** (`docs/adr/ADR-M013-vitrine-regimes.md`, tableau « Décision », ligne T2 : « une phrase publique nouvelle sur le moteur », « un chiffre nouveau ») ; chaîne G0 → checkpoint-1 → worker → G2 fraîche → checkpoint-2 → G7 → upload ; étiquette de commit `site[T2]` ; validation visuelle de l'investisseur après l'upload (décision 183).
- **Éléments affectés** : `apps/site/lib/ukemi-copy.ts` ; `apps/site/lib/ukemi-served-figures.ts` (nouveau) ; `apps/site/components/ukemi/ukemi-page.tsx` ; `scripts/assert-fleet-html.mjs` et `scripts/assert-fleet-html.d.mts` ; `test/site-ukemi.test.ts` ; `docs/adr/ADR-U4b-2b-classe-servie.md` (ligne datée). Mesurés sans ligne à changer (§1.5) : `apps/site/app/page.tsx`, `apps/site/app/fleet/page.tsx`, `test/site-build-fleet.test.ts`.
- **Base lue** : worktree `F:\Monark-wt-udigit`, branche `lot/ukemi-digit-1`, HEAD `5db28a0` (même commit que `lot/etude-suite` dans `git worktree list`), `git status` propre à 07:02:43 UTC. Mission `F:\tmp\udigit\mission-g0.md`, sha256 recalculé `5cc3a91659f764499379195c6c2878265ec18f9ee4bba20a50e4890681eee018`.
- **Provenance** : worker `claude-opus-5-5[1m]` (R-1 déclaré en tête de session), effort max. Lecture de l'arbre et du corpus ; mesures sur une copie `git archive 5db28a0` sous `F:\tmp\udigit\base\` par `F:\tmp\udigit\measure\tokens.mjs` (sha256 `ce9533f40d07c0cb46e0010b574b02a82cee6cc99f7d9258d196b4f2f496dae5`) et `F:\tmp\udigit\measure\letters.mjs` (sha256 `ab550f227302150dd4c6756b5a93678ec577fd1ad873b7f4241ec786a9638e66`), Node v24.15.0 sous le préfixe `env -u` de la mission (huit clés retirées, `TEMP=F:/tmp`). Aucun réseau, aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `git merge-tree --write-tree`, aucun commit, aucune consultation advisor (mission : sauf blocage ; les choix de conception sont soumis au checkpoint-1 en P-1..P-10 au lieu d'être tranchés ici). Réviseurs prévus : validateur-humain (checkpoint-1), relecteur G2 frais en instance séparée.
- **Numérotation** : D-n, T-n, M-n, P-n et I-n sont propres à cet ADR ; « U4b-2b D5 » désigne `docs/adr/ADR-U4b-2b-classe-servie.md` §2 D5 (`:199-220`).

## 0. Points tranchés au checkpoint-1 (décisions du validateur-humain, rapport cp-1 §4)

| P | Question | Décision (checkpoint-1) | Motif (une ligne) | Renvoi |
|---|---|---|---|---|
| P-1 | Précision de q̂₀ | **Tranché : telle quelle**, la chaîne à 8 décimales de `display.strata_qhat[k]`, contrôlée contre l'entier de base (`ukemi-course-load.ts:239-250,315`) | 217 dit « lus … jamais tapés » : un arrondi serait un nombre qu'aucun fichier ne porte, l'entier brut est illisible et son échelle (« 8 ») est hors liste | D-2, D-3 |
| P-2 | Digest C5 entier ou tronqué | **Tranché : entier** (64 hex), césure `break-all` | seule forme comparable octet pour octet au `calib_digest` d'une réponse servie, déjà rendue par `/ukemi/course` ; le rendu sur écran étroit est vu à la validation 183 (§8 point 7) | D-2, D-3 |
| P-3 | n = 0 sur les strates non committées | **Tranché : aucun nombre**, la clause de 216 seule ; **validation visuelle 183 après upload** | le fil sert `n_calib = 0` sur ces strates (`gate.ts:608-614`) et la formulation épinglée renvoie les comptes mesurés à `/ukemi/course` ; alternative nommée pour 183 : les comptes de `ukemi-course.json` par strate | D-6 |
| P-4 | Note 216 sur `/` et `/fleet` | **Tranché (mesuré) : oui, par import ; aucune ligne à changer, aucun chiffre sur ces pages** | `app/page.tsx:239` et `app/fleet/page.tsx:69,140` rendent la constante ; 217 nomme `/ukemi` seule ; confirmation par exécution au G1 | D-7 |
| P-5 | Désignation de la strate committée | **Tranché : « the committed stratum », sans indice** | « 0 » est hors de la liste de 217 ; l'indice serait un acte de l'investisseur | D-5 |
| P-6 | Unité de q̂₀ | **Tranché : `BOUND_UNIT` sans chiffre, lié par test au préfixe de `display.unit`** | « 8 » est hors liste ; la relation `unit.startsWith(BOUND_UNIT + " (")` garde le texte lié au fichier | D-5 |
| P-7 | Dater les chiffres | **Tranché : oui, le jour ISO de `read_at`, exactement une fois** | admis par la règle existante des dates (`assert-fleet-html.mjs:290`) ; sous C-2 (retrait par longueur décroissante), sa coïncidence avec n disparaît | D-2, D-3 |
| P-8 | Textes publics nouveaux | **Tranché : les sept libellés de D-5 acceptés comme artefact du plan, `SERVED_COMMITTED_LEAD` inchangé** ; **validation visuelle 183 après upload** | vocabulaire mesuré propre par le validateur ; le checkpoint-2 compare le texte servi à ces phrases ; à signaler à 183 : « without the figures of the served clause » peut surprendre à côté de trois chiffres | D-5 |
| P-9 | Note de registre `apps/site/lib/fleet.ts:193` | **Tranché : inchangée dans ce lot, item I-4 maintenu** ; **validation visuelle 183 après upload** | 216 vise la seule constante ; toucher le registre ajouterait un texte public nouveau et `registry_notes_track_served_descriptions` ; la question est portée à 183 (C-3) | §10 |
| P-10 | État committé avec fichiers en désaccord ou sans verdict | **Tranché : build rouge**, le module et le contrôle jettent | fail-closed sur la page qui fait l'affirmation : un repli sans chiffre serait une valeur choisie par le code ; asymétrie avec `servedStatusOf` de `/ukemi/course` (`ukemi-course-view.ts:122-127`) acceptée, cette page ne porte pas la liste fermée | D-2, D-3 |

## 1. Contexte mesuré (à `5db28a0`)

### 1.1 Ce qui est décidé (verbatim de la mission, sans reformulation)
- **216** : `LIQ_COMMITTED_STATE_NOTE` (`apps/site/lib/ukemi-copy.ts:123-125`) prend « conformal » : « where a stratum's calibration is committed, the gate serves a conformal upper bound on the liquidable amount; on every other stratum it abstains (under_calib) », sans réserve « enough points ».
- **217 (option d)** : `/ukemi` peut rendre **n par strate, q̂₀ (bound margin) et le digest C5 (`set_digest` / `calib_digest`)**, lus des fichiers committés et hachés (`apps/site/data/ukemi-served.json` champ `liq_verdict` via `apps/site/lib/ukemi-served-load.ts` ; `apps/site/data/ukemi-course.json` via `ukemi-course-load.ts`), **jamais tapés** ; le contrôle numérique de `scripts/assert-fleet-html.mjs` sur `/ukemi` (`assertUkemiBody`, scan « digit-free » `:285-305`, `:371-374`) est **amendé par ADR** : liste FERMÉE des nombres permis et de leur source.
- Régime : ADR-M013 **T2** (tests et registres touchés) : G0 → checkpoint-1 → worker → G2 fraîche → checkpoint-2 → G7 → upload ; label de commit `site[T2]`. Validation visuelle investisseur après upload (183).

Registre : `docs/CHANTIERS.md:1516` (même teneur, forme courte). Les options (a) à (c) de 217 ne sont pas consignées dans le dépôt (cherché dans `docs/CHANTIERS.md` et `docs/JOURNAL-PROVENANCE.md`, motif « option (d) ») : non confirmé, sans effet sur ce plan.

### 1.2 La page et ses données aujourd'hui
- `ukemi-page.tsx:68` lit l'état servi par son chargeur fail-closed ; `:120-130` : une seule conditionnelle sur `registry_state` ; branche committée = `SERVED_COMMITTED_LEAD` puis `{LIQ_COMMITTED_STATE_NOTE}` (`:127-128`), aucun chiffre. `LIQ_UPPER_BOUND_SENTENCE` et `LIQ_H3_SENTENCE` ne sont ni importées ni rendues (porteurs négatifs, `test/site-ukemi.test.ts:250-253`).
- `apps/site/data/ukemi-served.json` : schéma v2, `registry_state` committed, `read_at` 2026-09-25T03:26:01.410Z, `liq_verdict` : strate 0, `covered`, `calibration_points` 170, `calibration_digest` `e7e673664c03e3c5d15956d864f8379b6fe4660ed689be38a85add95d4eff334`, `interior_rank_min_n` 199. Sha256 LF recalculé égal à l'entrée du manifeste (`b2b08d15…20be`).
- `apps/site/data/ukemi-course.json` : sha256 LF recalculé égal à l'entrée du manifeste (`30848202…03ae`) ; n par strate 170, 21, 10, 4 ; `h3.served_strata` (exposé `committable`) = [0] ; `display.decimals` = 8 ; `display.unit` = « in the lending venue's oracle base currency (8 decimals) ». Ce fichier ne porte **aucun** digest C5 (seul `body_digest`, mesuré par `grep -o` sur les clés `*digest*`) : **le seul C5 que le site porte est `liq_verdict.calibration_digest`**, celui de la strate de la sonde de déploiement.
- Relations mesurées (`tokens.mjs`) : n servi = n du rapport pour la strate 0 ; q̂ de base servi = q̂ de base du rapport ; `decimal8Of(q̂ de base servi)` = `display.strata_qhat[0]` ; **q̂ affiché du poolé = q̂ affiché de la strate 0** (égalité de valeur déjà relevée comme coïncidence d'ordre, ADR-U4b-2b §1.3, `:81`) : un mutant qui lirait le poolé est invisible sur l'artefact réel (M-3b, §5). La valeur de q̂ n'est pas recopiée ici (anti-close, §6).
- Le C5 servi est le C5 committé de la strate : `UKEMI_LIQ_S0_CALIB_DIGEST_PINNED` (`apps/harness/src/calibration.ts:240`) ; liaison déjà testée (`test/site-ukemi.test.ts:1188`).

### 1.3 Le contrôle actuel de `/ukemi`
- `assertUkemiBody` (`scripts/assert-fleet-html.mjs:355-409`) : corps rendu (`renderedBody`), premier `<main>` (`extractMain`, `:328-334`), corpus = nœuds texte plus valeurs des attributs `alt`, `title`, `aria-label` (`mainCorpus`, `:339-347`) ; (1) `scanNumericTokens(corpus)` doit être vide (`:371-374`) ; (2) phrase de l'état présente, phrase de l'autre état absente, phrase et clause conditionnelles présentes ; (3) absences `interval`, `cascade`, `Bell`, `Aave` ; (5) pastille « Ukemi <status> ».
- Le scan (`:284-322`) : `NUMERIC_TOKEN = /\d+(?:[.,]\d+)*/g` (`:288`) ; plages couvertes : identifiants `ADR-M…`, `R-…`, `CA-…`, `D…`, `HIP-…` (`:289`) et dates ISO `\b\d{4}-\d{2}-\d{2}\b` (`:290`) ; aucune liste d'exemption (`:284-287`, plus strict que le lint du site) ; parité avec `apps/site/test/honesty-lint.ts` prouvée par `site_ukemi_body_scan_and_carrier` (c) (`test/site-ukemi.test.ts:229-237`).
- `ukemiExpected(dataRoot)` (`:414-425`) lit l'état par `loadUkemiServed`, les phrases dans `ukemi-copy.ts`, le statut dans `fleet.ts` ; `main()` l'applique à `apps/site/.next/server/app/ukemi.html` (`:502-516`). Le script est exporté (`scripts/export-public.mjs:71-75`) et lancé par le job `g3-site` après `npm run build -w @monark/site` (`.github/workflows/ci.yml:204-206`) ; ce job ne tourne que sur pull request et ne bloque pas tant qu'il n'est pas un contrôle requis (`ci.yml:187-191`) : la composition se rejoue donc localement aux G1, G2, checkpoint-2 et G7 (§8).

### 1.4 Ce que le scan voit des valeurs candidates (mesuré par `tokens.mjs` et `letters.mjs`)

| Valeur rendue (source) | Jetons de `scanNumericTokens` |
|---|---|
| n de la strate 0 (`calibration_points`) | 1 (`170`) |
| q̂₀ à 8 décimales (`display.strata_qhat[0]`) | 1 |
| C5 entier (64 hex) | 16, dont cinq d'un seul chiffre (`7`, `3`, `5`, `6`, `4`) |
| C5 tronqué à 8 hex | 2 |
| C5 en 8 + 6 | 3 |
| `display.unit` | 1 (`8`) |
| `read_at` entier (instant) | 6 (le jour n'est pas couvert : `T` le suit, pas de frontière de mot) |
| jour ISO de `read_at` | 0 (couvert par `ISO_DATE`) |
| « stratum 0 » | 1 (`0`) |

Deux conséquences structurantes pour D-3 :
1. **Un contrôle par ensemble de jetons ne suffit pas** : un chiffre tapé égal à un jeton que le digest produit déjà (par exemple `7`) ne change pas l'ensemble ; seule une comparaison par multiplicité, ou par chaîne entière, le voit.
2. **Un contrôle par jetons, même en multiensemble, ne voit pas les lettres d'un digest** : `letters.mjs` échange a↔b, c↔d, e↔f dans le C5 servi ; la chaîne change, les jetons sont identiques (`sameTokens true`, `sameString false`). D-3 porte donc des **chaînes entières** (la valeur exacte de chaque chiffre permis) et exige que le reste du corpus soit sans jeton.

### 1.5 Où la note est rendue, et qui l'épingle
- Rendue par import de la constante sur trois pages : `/ukemi` (`ukemi-page.tsx:128`), `/` (`app/page.tsx:239`, branche committée de `:236-240`), `/fleet` (`app/fleet/page.tsx:69`, rendue `:140`). Changer la constante suffit à changer les trois ; ni `app/page.tsx` ni `app/fleet/page.tsx` n'a de ligne à changer pour 216 (leurs commentaires, par exemple `fleet/page.tsx:64-65` « digit-free restatement », restent vrais : ces pages ne rendent aucun chiffre).
- `grep "upper bound on the liquidable"` sur les fichiers `.ts`, `.tsx`, `.mjs`, `.mts`, `.json` hors `node_modules` et `.next` : **aucun fichier de test**. Occurrences : `apps/harness/src/tools/gate.ts:141` et `apps/site/lib/ukemi-copy.ts:36` (phrase servie UPPER, autre texte) ; `apps/site/lib/ukemi-copy.ts:124` (la note) ; `apps/site/lib/fleet.ts:193` (note de registre, P-9) ; `apps/site/data/harness-served.json:115` et `apps/site/data/ukemi-served.json:9` (textes servis synchronisés) ; `scripts/verify-harness.mjs:77` (littéral UPPER de la CA).
- Épingles par identifiant (structure de rendu, pas texte ; inchangées par 216) : `test/site-build-fleet.test.ts:512-516` (`/`), `:889` et `:891` (`/fleet`), `:684-691` (`registry_notes_track_served_descriptions`) ; `test/site-ukemi.test.ts:27`, `:83`, `:97`, `:196`, `:614`, `:639`, `:1339`, `:1389`, `:1396`.
- Aucune épingle ne fixe le texte de la note : sans test nouveau, retirer « conformal » passerait, car le contrôle d'artefact compare le rendu à la constante elle-même. D'où T-1 (mutant M-5).

### 1.6 Tests qui figent « sans chiffre » sur `/ukemi` (mesuré par `grep -n -i digit` sur les deux fichiers)

| Emplacement | Ce qui est figé | Sort dans ce lot |
|---|---|---|
| `test/site-ukemi.test.ts:83` `EXPECTED` | attendu sans liste de chiffres | reçoit `figures: []` (T-6) |
| `:87-111` `greenMain` | branche committée sans chiffres | reçoit les valeurs de l'attendu (T-6) |
| `:147-157` | `LIQ_REQUIREMENTS_SENTENCE` (alpha, nMin) non exportée | inchangé : alpha et nMin restent hors de la liste de 217 |
| `:186-207` (a) | prose rendue sans chiffre, note comprise | inchangé ; les sept constantes nouvelles y entrent (T-1) |
| `:205-207` | UPPER porte « 0 », H-3 porte « 3 » : exclues | inchangé (jetons hors liste) |
| `:213` | « 185 of 189 » rougit par `/numeric token/` | inchangé à l'état vide ; doublé à l'état committé (T-4) |
| `:229-237` (c) | parité du scanner | inchangé (le scanner ne change pas) |
| `:250-253` (d)(e) | porteurs négatifs UPPER et H-3 | inchangé |
| `:255-262` (f), `:267-268` (g) | aucun littéral numérique rendu par le composant ni la route | inchangé : les chiffres passent par accès de propriété (T-3) |
| `:1387-1389` | la branche committée rend la reformulation « digit-free » | vrai de la note ; message ajusté (T-6) |
| `:1392-1397` | `committedExpected`, `greenMain("committed")` | reçoivent les chiffres (T-6) |
| `:1401-1406` | `ukemiExpected` sur un fichier **v1** committé | rougira : un état committé sans verdict jette désormais (P-10) ; re-cadré (T-6) |
| `test/site-build-fleet.test.ts:509` | commentaire « digit-free restatement while committed » (`/`) | reste vrai (aucun chiffre sur `/`) |

Hors `/ukemi`, non touchés : `test/site-ukemi.test.ts:540-558` et `:584-606` (`/ukemi/course`), `test/site-build-fleet.test.ts:426` (produits) et `:668` (note de registre). La liste des rouges de l'arbre d'après s'établit **par exécution** au G1 (règle de l'amendement 213 d'ADR-U4b-2b, `:431`), jamais par cette seule lecture.

### 1.7 Ce que dit le digest (lu dans le code)
- C5 = SHA-256 de la concaténation des scores triés par ordre croissant, chacun en flottant 64 bits gros-boutiste (`packages/contracts/src/calib-digest.ts:3-13`) ; champ obligatoire du verdict gelé (`packages/contracts/src/types.ts:225`).
- Classe liquidation : la strate k est dérivée du ŷ côté serveur ; pour une strate committée, chaque verdict est construit sur les scores committés de k (`apps/harness/src/tools/gate.ts:605-641`), et `buildVerdict` comme `underCalibVerdict` portent `calib_digest = calibDigest(scores)` (`packages/hikae/src/verdict.ts:40-56`, `:62-85`) ; sur une strate non committée les scores sont vides (`gate.ts:608-614`).
- Fait servi qui fonde le texte public : le gate rend le même digest avec chaque réponse sur la strate committée, et ce digest désigne l'ensemble exact de ses points de calibration. T-5 le rejoue en processus, pour que la phrase reste liée au comportement servi (motif de `site_ukemi_count_wording_says_what_the_wire_serves`, `test/site-ukemi.test.ts:1437-1448`). La composition complète de `runGate` au-delà de la branche liquidation n'a pas été relue ligne à ligne (§12).
- Les points de s0 sont publics dans `apps/harness/src/calibration.ts` (paquet exporté, `scripts/export-public.mjs:45`), mais le texte ne promet aucun recalcul par le lecteur : « anyone can recompute » est une promesse non tenue au sens de `test/site-ukemi.test.ts:649`.

### 1.8 Branchement existant (mesuré)
Entrée : `scripts/sync-ukemi-served.mjs` → `apps/site/data/ukemi-served.json` (écrit à W étape 5, `2c70d97` ; ADR-U4b-2b, amendement de 03:43 UTC, `:435-439`), sha256 au manifeste ; copie du rapport `apps/site/data/ukemi-course.json`. Consommateurs de l'état : `/ukemi`, `/`, `/fleet`, `/ukemi/course`. Contrôle d'artefact : `/ukemi` (état et texte) ; `/fleet` pour les notes de registre seulement ; la ligne d'état servi de `/` et de `/fleet` n'est épinglée que sur source (§1.5) : item I-3, préexistant au lot.

### 1.9 Contraintes de vocabulaire sur tout texte ou commentaire nouveau
- Surface Ukemi (`test/site-ukemi.test.ts:1077-1093`) : ni `verified`, ni `guarantee(d|s)`, ni `partner`, ni `autonomous`, ni `token(s)` ; `probability` seulement nié. Site (`vocab-banned.json`, portée `site`) : `guarante` sous toute forme, noms de lieux et d'opérateurs, `predicts`, `confidence`, `accuracy`. Mission : jamais « probability of being right » dans le texte du digest ; « conformal » admis (216) ; aucun nom de fournisseur.
- Cuisine (décision 168, `docs/CHANTIERS.md:1386` ; garde `site_names_no_kitchen`, `test/site-build-fleet.test.ts:1114-1125`, sur **tout** fichier exporté de `apps/site`, commentaires compris) : ni `worker`, ni `checkpoint`, ni `G0`…`G7`, ni « lot NOM-X », ni « decision N », ni `ADR-X`, ni « sub-agent ». Le module nouveau et les commentaires récrits de `ukemi-copy.ts` et `ukemi-page.tsx` n'en portent aucun. `scripts/assert-fleet-html.mjs` est exporté et en porte déjà (item existant KITCHEN-PUBLIC-SCRIPTS-1) : ce lot n'en ajoute aucun. Le code « C5 » n'apparaît jamais sur la page (jargon interne, et chiffre).
- `site_ukemi_prose_claims_conditional` (`:1117-1145`) : `calibrated` seulement conditionnel ou nié, aucun `residual` ; `site_ukemi_prose_abstains_under_calib` (`:638-653`) : `under_calib` jamais associé à une « deferral ».

## 2. Décisions

### D-1 · Note 216, verbatim
`LIQ_COMMITTED_STATE_NOTE` devient exactement « where a stratum's calibration is committed, the gate serves a conformal upper bound on the liquidable amount; on every other stratum it abstains (under_calib) » (seul changement : « an upper bound » devient « a conformal upper bound »), sans chiffre et sans réserve « enough points ». Rendue par import sur `/ukemi`, `/` et `/fleet` (§1.5). T-1 épingle le texte entier (M-5).

### D-2 · Chiffres rendus : la strate committée, lus, jamais tapés
- **État `empty`** : aucun nombre (règle actuelle conservée). **État `committed`** : sous la note 216, dans la même branche de la conditionnelle, les chiffres de la seule strate que porte le verdict servi daté : n (`liq_verdict.calibration_points`), q̂₀ (la chaîne à 8 décimales que le rapport porte pour cette strate, `display.strata_qhat[k]`, telle quelle, après contrôle de l'égalité de son entier de base avec `liq_verdict.bound_margin_base`, P-1), C5 (`liq_verdict.calibration_digest`, entier sous P-2) et le jour de lecture (`read_at`, P-7). Aucun autre nombre : ni alpha, ni nMin, ni le bord inférieur nul, ni H-3 (UPPER, REQ et H-3 restent non rendus), ni l'indice de strate (P-5), ni le « 8 » de l'unité (P-6), ni les comptes des autres strates (P-3).
- **Module pur nouveau** `apps/site/lib/ukemi-served-figures.ts` (motif de `ukemi-course-view.ts` : sans E/S et **imports de types seulement**, règle des modules partagés entre la page, construite par Next, et les tests, lancés par Node : « no alias and no value import », `ukemi-course-load.ts:17` ; `apps/site/tsconfig.json` ne porte pas `allowImportingTsExtensions`, mesuré ; aucune fonction de formatage n'y est donc importée ni recopiée) : `servedFiguresOf(served: UkemiServed, course: UkemiCourse): UkemiServedFigures | null`, `null` exactement à l'état `empty`. À l'état `committed`, il **jette** avec un message nommé si le verdict manque (fichier v1), si la strate du verdict est absente du rapport ou n'y atteint pas le plancher, si n servi ≠ n du rapport, ou si q̂ de base servi ≠ q̂ de base du rapport (P-10). Sinon il rend `{ points: String(v.calibration_points), boundMargin: x.bound_margin, digest: v.calibration_digest, readDate: served.read_at.slice(0, 10) }` (v = `liq_verdict`, x = la strate `v.stratum` du rapport ; formes finales selon P-1, P-2, P-7 ; `read_at` est déjà contraint à la forme ISO UTC par `ukemi-served-load.ts:73,136`).
- **Page** : `ukemi-page.tsx` garde sa ligne épinglée `:68` (`test/site-ukemi.test.ts:1390`), charge le rapport par `loadUkemiCourse` sur la même racine, appelle `servedFiguresOf`, et rend `{figures.points}`, `{figures.boundMargin}`, `{figures.digest}` et `{figures.readDate}` **seulement** dans la branche committée, par accès de propriété (jamais un littéral), chaque valeur dans son propre élément, jamais dans un attribut `title`, `alt` ou `aria-label` (la règle 2 de D-3 ne compte que le texte, et la règle 3 rougit sur les jetons d'une valeur laissée en attribut, C-1). Le digest est rendu en `c-mono break-all`. Aucun repli silencieux : si les chiffres manquaient à l'état committé, la page jette (branche inatteignable, fail-closed), et T-3u rougirait de toute façon (valeurs absentes).
- Chaque chiffre est **lu** (217) ; les mots qui l'entourent sont des constantes sans chiffre de `ukemi-copy.ts` (D-5).

### D-3 · Contrôle amendé : liste fermée de chaînes, chacune exactement une fois, reste sans jeton
`assertUkemiBody({ html, expected })` reçoit `expected.figures`, de type `ReadonlyArray<{ value: string; source: string }>`, et remplace l'étape (1) (`:371-374`) par quatre règles :
1. **Vacuité** : `figures` est un tableau ; à l'état `empty` il est vide (sinon il jette : « an empty served state carries no figure ») ; à l'état `committed` il est non vide et chaque `value` et chaque `source` est une chaîne non blanche (sinon il jette, message « vacuity guard »). Aucune `value` n'est tenue de porter un jeton (un digest tronqué peut n'avoir que des lettres).
2. **Présence exacte (pli C-1 et C-2)** : la règle porte sur la seule partie **nœuds texte** du `<main>` (texte débarrassé des balises, sans les valeurs d'attributs) ; les valeurs des attributs `alt`, `title` et `aria-label` n'entrent que dans la règle 3 (C-1). Mise en œuvre sans toucher `mainCorpus`, partagée (`:339-347`) : un assistant qui rend `{ text, attrs }`, ou un second calcul du texte seul dans `assertUkemiBody`. Les valeurs sont traitées par **longueur décroissante** (aujourd'hui : digest, q̂₀, jour, n ; à longueur égale, l'ordre de la liste), chacune cherchée dans le texte déjà réduit des précédentes (C-2 ii) ; pour chaque valeur, **toutes** ses occurrences sont parcourues (boucle `indexOf` reprise après chaque occurrence, jamais le seul premier `indexOf`) et seules comptent les occurrences **bornées**, dont le caractère qui précède et celui qui suit ne sont ni chiffre ni lettre ASCII, ou sont les bornes du texte (C-2 i) ; il en faut **exactement une** (C-2 iii). Aucune expression régulière construite depuis une donnée (aucune nouvelle alerte d'injection d'expression ; CodeQL est un contrôle requis, décision 170).
3. **Reste sans jeton (pli C-1)** : chaque occurrence retenue par la règle 2 est remplacée par une espace dans le texte ; `scanNumericTokens` appliqué au texte ainsi réduit **et** aux valeurs des attributs visibles (une valeur laissée dans un `title` y laisse ses jetons) doit rendre une liste vide, sinon il jette avec un message qui garde « numeric token(s) » (épingle `test/site-ukemi.test.ts:213`) et qui nomme les jetons hors liste.
4. **« Ni plus, ni moins »** : conséquence des règles 2 et 3, assertée par T-4 sur le cas vert : le multiensemble des jetons du corpus est l'union des jetons des valeurs de la liste.

Les plages couvertes (dates ISO, identifiants admis, `:289-290`) restent hors comptage, inchangées (parité avec le lint). **Ordre** : la règle 1 rejoint les gardes de vacuité du début ; les règles 2 et 3 s'appliquent après l'étape existante (2) de la fonction, présence des phrases d'état, et avant son étape (3), absences, pour que les messages d'état existants gardent la priorité (`test/site-ukemi.test.ts:1394-1396`, où un corps committé est testé sous l'attendu vide). Le retour garde `numericTokens` au sens actuel (jetons hors liste : 0 quand le contrôle passe ; aucun test ne lit ce champ, mesuré) et ajoute `figures` (nombre de valeurs de la liste) et `figureTokens` (jetons qu'elles portent). Le message de `main()` (`:512`) devient « N figure(s) of the closed list, 0 numeric token outside it ». Les étapes (2), (3) et (5) ne changent pas.

**Liste fermée à l'état committé** (formes selon P-1, P-2, P-7 ; k = `liq_verdict.stratum`, x = la strate k du rapport) :

| Chiffre | Chaîne attendue, calculée par `ukemiExpected` | Source de l'attendu | Chaîne rendue, calculée par le module de la page |
|---|---|---|---|
| n | `String(x.n)` | `ukemi-course.json`, `h3.strata[k].fresh.n` | `String(liq_verdict.calibration_points)` |
| q̂₀ | `decimal8Of(liq_verdict.bound_margin_base)` (fonction exacte du chargeur de course, importée par URL de fichier comme les autres modules du site dans ce script) | `ukemi-served.json` | `x.bound_margin`, la chaîne de `display.strata_qhat[k]` telle quelle |
| C5 | `liq_verdict.calibration_digest` | `ukemi-served.json` | idem |
| jour | dix premiers caractères de `read_at` | `ukemi-served.json` | idem |

Tout autre nombre rendu dans le `<main>` de `/ukemi` est une violation. Le jour, couvert par `ISO_DATE`, n'ajoute aucun jeton ; la règle 2 exige seulement sa présence unique.

### D-4 · Indépendance du contrôle (FM-3.3)
`ukemiExpected(dataRoot)` charge **les deux** fichiers par leurs chargeurs fail-closed (sha256 contre le manifeste), importés par URL de fichier comme aujourd'hui (`:415-418`), et calcule la liste **sans** importer `ukemi-served-figures.ts` : n vient du rapport, q̂₀ du fichier servi (rendu exact de l'entier de base par `decimal8Of`), le digest et le jour du fichier servi ; la page prend, à l'inverse, n dans le fichier servi et q̂₀ dans le rapport. Il jette, comme le module, sur verdict absent, strate absente ou sous le plancher, n ou q̂ de base en désaccord. Les deux chemins ne s'accordent que si les deux fichiers s'accordent : une page qui lirait un autre champ, une autre strate ou le poolé rougit sur l'artefact dès que la valeur diffère (M-2, M-3a) ; T-2 couvre le cas où elle ne diffère pas (M-3b) ; `site_ukemi_build_check_derives_figures_apart` épingle l'absence d'import (M-13). Pli C-4 : `decimal8Of` sert à la fois au chargeur, qui valide `display.strata_qhat[k]` (`ukemi-course-load.ts:239-250`), et au contrôle, qui calcule la q̂₀ attendue ; `site_ukemi_expected_figures_follow_the_committed_files` compare donc aussi la q̂₀ attendue à la routine BigInt indépendante du test (`dec8`, `test/site-ukemi.test.ts:327-330`), pour que l'indépendance de D-4 ne repose pas sur cette seule routine.

### D-5 · Textes publics proposés (anglais, sans chiffre ; à approuver, P-8)

| Constante nouvelle (`ukemi-copy.ts`) | Texte proposé |
|---|---|
| `FIGURES_LEAD` | On the committed stratum, as read from the served gate on |
| `FIGURE_POINTS_LABEL` | calibration points |
| `FIGURE_MARGIN_LABEL` | bound margin |
| `BOUND_UNIT` | in the lending venue's oracle base currency |
| `FIGURE_MARGIN_NOTE` | the upper bound for a prediction in this stratum is the prediction plus this margin |
| `FIGURE_DIGEST_LABEL` | calibration digest |
| `DIGEST_NOTE` | The calibration digest identifies the calibration points this bound is computed from; the gate returns it with every answer on this stratum, so an answer can be matched to its calibration. |

Mise en page proposée, dans la branche committée, après la note : « {FIGURES_LEAD} {jour}: » puis trois lignes, « {n} {FIGURE_POINTS_LABEL} », « {FIGURE_MARGIN_LABEL} {q̂₀} {BOUND_UNIT}; {FIGURE_MARGIN_NOTE} », « {FIGURE_DIGEST_LABEL} {C5} », puis `DIGEST_NOTE`. Contrôles de chaque texte : aucun chiffre ; aucun mot des listes de §1.9 ; « calibration » n'est pas « calibrated » ; aucune promesse de recalcul ; le texte du digest dit seulement ce que le gate sert (§1.7), et T-5 le rejoue. La phrase de marge reprend le sens déjà publié sur `/ukemi/course` (« the served upper bound for a prediction in this stratum is the prediction plus this margin », `ukemi-course-view.ts:155`). `SERVED_COMMITTED_LEAD` (« …without the figures of the served clause… ») reste vrai, puisque les chiffres de la clause servie (alpha, nMin, bord nul, H-3) restent non rendus : proposé inchangé, mais l'investisseur peut vouloir le reformuler maintenant que des chiffres le suivent (P-8).

### D-6 · Strates non committées
Aucun nombre : la clause « on every other stratum it abstains (under_calib) » de 216 suffit (P-3). Cohérent avec `site_ukemi_count_wording_says_what_the_wire_serves` (`test/site-ukemi.test.ts:1437-1448` : le fil sert `n_calib = 0` sur une strate non committée, les comptes mesurés sont sur `/ukemi/course`), qui reste inchangé.

### D-7 · `/` et `/fleet`
216 y arrive par import (P-4) ; aucune ligne de source, aucun chiffre. Les épingles de structure (§1.5) restent vertes par construction (à confirmer par exécution au G1). Le contrôle d'artefact de ces deux lignes est l'item I-3.

### D-8 · Ligne datée sur ADR-U4b-2b (D5 « Affichable après W »)
Ajout en fin de `docs/adr/ADR-U4b-2b-classe-servie.md` (après `:439`, jamais une réécriture en place), horodaté par `date -u`, du texte : « D5, « Affichable après W », partie `/ukemi` : amendée par les décisions 216 et 217 (option (d)) et par ADR-UKEMI-DIGIT-1 : à l'état committé, la note « conformal » et, pour la strate committée, n, q̂₀ et le digest C5, lus de `ukemi-served.json` (`liq_verdict`) et de `ukemi-course.json`, jamais tapés ; le contrôle numérique de `assertUkemiBody` devient une liste fermée de chaînes (ADR-UKEMI-DIGIT-1 D-3). L'item UKEMI-DIGIT-GATE-1 (§7, `:317`) est clos par ce lot à son G7. » Fichier sous `docs/**/*.md` : 0 ligne R-25.

### D-9 · Rejeu et hygiène (mission, point 9)
Toute exécution se fait sur une copie `git archive <gel> | tar -x` sous `F:\tmp\udigit\` (ou `git clone --shared` sous `F:\tmp\udigit\` pour un test qui a besoin de `.git`) ; jamais `GIT_DIR` ni `GIT_WORK_TREE` vers un dépôt réel ; jamais `git merge-tree --write-tree` ; `node` et `npm` sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY TEMP=F:/tmp TMP=F:/tmp TMPDIR=F:/tmp NEXT_TELEMETRY_DISABLED=1` ; `env` jamais affiché ; rien sur C: ; commandes Bash de moins de 6 Ko ; aucun réseau. Le worktree n'a pas de `node_modules` (mesuré) : `npm ci --offline` dans la copie (item existant WORKTREE-NPM-CI-1). `tmpRoot()` des tests écrit sous `tmpdir()`, donc sous `F:/tmp` avec ce préfixe.

## 3. Tâches (ordre d'exécution T-1 → T-7 ; un seul commit de gel pour l'orchestrateur)

#### T-1 · Note 216 et libellés (`apps/site/lib/ukemi-copy.ts`)
- `:123-125` : D-1. Sept constantes nouvelles : D-5. Commentaires d'en-tête `:18-24` et `:113-117` récrits (la page rend désormais, à l'état committé, les chiffres réglés de la strate committée, lus des deux fichiers ; UPPER et H-3 restent non rendues), sans vocabulaire de cuisine (§1.9).
- Tests : **`site_ukemi_committed_note_says_conformal_upper_bound`** (nouveau) : égalité exacte de `LIQ_COMMITTED_STATE_NOTE` avec le texte de 216 (épingle de texte sans nombre), absence de « enough », scan sans chiffre ; `site_ukemi_body_scan_and_carrier` (a) : liste étendue aux sept constantes ; `BOUND_UNIT` lié au fichier : `loadUkemiCourse(ROOT).unit.startsWith(BOUND_UNIT + " (")` (relation, P-6).
- Mutants : M-5, M-11. R-25 : environ 30 lignes.

#### T-2 · Module `apps/site/lib/ukemi-served-figures.ts` (nouveau)
- Contenu : D-2 (interface `UkemiServedFigures`, fonction `servedFiguresOf`, messages nommés). En-tête : pur, sans E/S, aucun chiffre dans ses littéraux, anglais.
- Test **`site_ukemi_served_figures_read_from_the_two_files`** (nouveau) : (1) fichiers réels : `points` = `String` du n servi = `String` du n du rapport pour k ; `boundMargin` = `display.strata_qhat[k]` = `dec8` du test (`test/site-ukemi.test.ts:327-330`, BigInt, indépendant du chargeur) appliqué au q̂ de base servi ; `digest` = C5 servi = `lookupCommittedCalibration(TASK_LIQ_ELIGIBLE, base + "/s" + k).digestPinned` ; `readDate` = jour de `read_at`. (2) Objets synthétiques construits en mémoire depuis les objets chargés, chaque perturbation **dérivée** (aucun montant tapé) : n servi + 1 → jette ; q̂ de base servi augmenté d'une unité (`BigInt` + 1) → jette ; strate du verdict déplacée vers une strate sous le plancher → jette ; `liq_verdict: null` à l'état committé → jette ; état `empty` → `null` ; rapport dont le poolé diffère de la strate k → `boundMargin` reste celui de k (M-3b) ; digest remplacé par un autre sha256 calculé dans le test → le module rend le nouveau (il lit, il ne recopie pas). (3) Les littéraux du module ne portent aucun chiffre (motif de `site_ukemi_course_view_types_no_digit`, `:584-606`) ; (4) le module n'a que des imports de types (AST).
- Mutants : M-2, M-3a, M-3b, M-4 (côté module), M-10. R-25 : module environ 40 lignes, test environ 55.

#### T-3 · Page `apps/site/components/ukemi/ukemi-page.tsx`
- D-2 ; en-tête `:1-22` récrit (l'état committé n'est plus « digit-free » : il rend les chiffres lus de la liste fermée ; sans cuisine) ; `:68` inchangée.
- Test **`site_ukemi_figures_render_only_in_the_committed_branch`** (nouveau, AST, commentaires effacés) : les quatre accès `figures.points`, `figures.boundMargin`, `figures.digest`, `figures.readDate` sont des enfants JSX sous la branche `whenFalse` de la conditionnelle `….registry_state === "empty"`, chacun une fois, aucun hors d'elle (motif de `jsxIdsUnder`, `:1325-1333`, étendu aux accès de propriété) ; la page importe `servedFiguresOf` et `loadUkemiCourse` ; aucune de ces expressions dans un attribut `title`, `alt` ou `aria-label` ; `servedCarrierOf` (`:1337-1352`) inchangé et vert ; (g) `scanSource` reste vide.
- Mutants : M-1, M-8, M-9. R-25 : environ 30 lignes, test environ 25.

#### T-4 · Contrôle `scripts/assert-fleet-html.mjs` et `scripts/assert-fleet-html.d.mts`
- D-3 et D-4. `.d.mts` : type `UkemiFigure`, champ `figures` de `UkemiExpected` (obligatoire : chaque appel doit le fournir), retour `figures: number` et `figureTokens: number` de `assertUkemiBody`. Fonctions partagées (`renderedBody`, `extractMain`, `mainCorpus`) et blocs `/fleet` et Bell inchangés (`test/bell-publication-state.test.ts` les importe).
- Test pilote **`site_ukemi_body_numbers_closed_list`** (nouveau, HTML synthétique ; attendu = `await ukemiExpected()` sur les fichiers réels, jamais tapé). Vert : un `<main>` committé composé des constantes réelles et des valeurs de l'attendu, plus l'égalité des multiensembles de D-3.4 ; vert aussi (pli C-2) : une liste synthétique dérivée de l'attendu où une valeur courte est sous-chaîne bornée d'une valeur plus longue (n posé égal à la partie entière d'une q̂₀ synthétique, elle-même dérivée de la vraie, ou à l'année du jour) : le retrait par longueur décroissante ne la compte qu'une fois. Rouges, chaque altération **dérivée** de l'attendu : un jeton en plus égal à un jeton que le digest porte déjà, le premier de sa liste (tue une comparaison par ensemble) ; « 185 of 189 » ; une valeur absente ; une valeur rendue deux fois ; une valeur présente **seulement** dans un `title` (pli C-1 : absente du texte, règle 2 ; ce cas passait le contrôle tel qu'écrit avant le pli, seule T-3 le voyait à la source) ; une valeur rendue dans le texte **et** dans un `title` (règle 3) ; une valeur courte présente deux fois comme occurrence bornée hors de la valeur longue (pli C-2) ; le digest tronqué autrement que sous P-2 ; le digest à lettres échangées (jetons égaux, chaîne autre : preuve de la limite de §1.4) ; n + 1 ; un chiffre à l'état `empty` ; vacuité : `figures: []` à l'état committé, une `value` blanche.
- Test **`site_ukemi_expected_figures_follow_the_committed_files`** (nouveau ; intégration non-LLM chargeurs → liste) : racine réelle : la liste vaut les relations de T-2, et sa q̂₀ égale `dec8` BigInt du test (`:327-330`) appliquée au q̂ de base servi (pli C-4) ; `tmpRoot()` (`:332-348`) : v2 avec n servi + 1 → jette ; v2 avec q̂ de base servi modifié → jette ; v1 committé → jette ; état `empty` (v1, clause vide de `LIQ_CLAUSE_OF`, `:1381-1384`) → `figures: []`.
- Test **`site_ukemi_build_check_derives_figures_apart`** (nouveau, source) : `scripts/assert-fleet-html.mjs` importe `ukemi-course-load.ts` et `ukemi-served-load.ts` et ne mentionne pas `ukemi-served-figures`.
- **Test d'intégration du chemin servi, T-3u** : le bloc `/ukemi` de `main()` (`:502-516`), lancé par `node scripts/assert-fleet-html.mjs` après `npm run build -w @monark/site` (job `g3-site`, `ci.yml:204-206`, et rejeu local §8) : le `ukemi.html` construit est lié, valeur pour valeur, à la liste calculée des fichiers committés par leurs chargeurs. Pli C-6 (i) : T-3u est un bloc de `main()`, pas un `test()` ; les rapports G1, G2 et checkpoint-2 consignent donc son **code de sortie** et la **ligne imprimée** (« N figure(s) of the closed list, 0 numeric token outside it »), preuve d'exécution (CA-6).
- Mutants : M-4 (côté artefact), M-4b, M-6, M-7, M-12, M-13. R-25 : `.mjs` environ 70 lignes, `.d.mts` environ 12, tests environ 95.

#### T-5 · La phrase du digest reste liée au servi
- Test **`site_ukemi_digest_note_says_what_the_gate_returns`** (nouveau) : `runGate` en processus (`LIQ_TEST_PARAMS`, `test/site-ukemi.test.ts:1105-1115`) sur deux ŷ de la strate committée obtenus sans montant tapé (ŷ = 1, déjà employé `:1121`, et la première coupe servie `STRATA_CUTS_SERVED[0]` moins un, constante de code) : les deux réponses portent le même `verdict.calib_digest`, égal au C5 servi ; si ce fait cesse, le test rougit avec la phrase. R-25 : environ 15 lignes.

#### T-6 · Re-cadrages dans `test/site-ukemi.test.ts`
- `EXPECTED` (`:83`) reçoit `figures: []` ; `greenMain` (`:87-111`) reçoit une liste de valeurs et la rend dans la branche committée comme la page ; `site_ukemi_served_state_carriers_follow_the_dated_served_state` : `committedExpected` devient l'attendu réel (`await ukemiExpected()`), la boucle `:1401-1406` écrit le v2 committé réel (`rawServed()`) et un v1 vide, et affirme le rejet d'un v1 committé ; message `:1389` ajusté ; `site_ukemi_prose_abstains_under_calib` (`:639`) : liste étendue aux libellés nouveaux. R-25 : environ 30 lignes.

#### T-7 · Ligne datée d'ADR-U4b-2b
- D-8. 0 ligne R-25. Les entrées CHANTIERS et JOURNAL (clôture d'UKEMI-DIGIT-GATE-1, `error_origin`) sont des actes de l'orchestrateur au G7 (R-20).

## 4. Tuyaux (ADR-M018 D3, `docs/adr/ADR-M018-regle-branchement.md:25-27`)

| Pièce touchée | Entrée (qui produit) | Sortie (qui consomme) | État (où il vit) | Test de composition |
|---|---|---|---|---|
| Note 216 (`LIQ_COMMITTED_STATE_NOTE`) | décision 216 ; constante de `ukemi-copy.ts` | `/ukemi` (branche committée), `/` (`page.tsx:239`), `/fleet` (`fleet/page.tsx:69,140`) | aucun ; choix de branche par `registry_state` de `ukemi-served.json` | T-1 (texte) ; T-3u (présence octet pour octet dans `ukemi.html`) ; `home_cards_read_the_register_and_the_served_text` et `fleet_page_reads_products_and_served_state` (structure) ; artefacts de `/` et `/fleet` : I-3 |
| Chiffres de la strate committée | `scripts/sync-ukemi-served.mjs` → `ukemi-served.json` (`liq_verdict`, branché à W) ; copie hachée du rapport `ukemi-course.json` | `servedFiguresOf` → `<main>` de `/ukemi` | les deux fichiers committés, sha256 au manifeste | **T-3u** (artefact ↔ fichiers) ; T-2 ; `site_ukemi_expected_figures_follow_the_committed_files` |
| Contrôle amendé | HTML construit ; fichiers par leurs chargeurs | code de sortie de `g3-site` et de l'oracle local | aucun | `site_ukemi_body_numbers_closed_list` ; mutants §5 rejoués au G1 et au checkpoint-2 |
| Phrase du digest | fait servi (`gate.ts:605-641`) | `/ukemi` | aucun | T-5 |

Aucun tuyau annoncé n'est absent. Le seul manque mesuré (contrôle d'artefact de la ligne d'état sur `/` et `/fleet`) préexiste au lot : item I-3 avec déclencheur.

## 5. Mutants attendus (au G1, chacun rouge sur le test nommé, puis restauré)

| M | Mutation | Qui rougit |
|---|---|---|
| M-1 | un nombre tapé en dur dans la page, à la place de `{figures.points}` | `scanSource` (g), `test/site-ukemi.test.ts:267` ; T-3 (accès absent). Sur l'artefact, invisible si la valeur tapée est égale : d'où ces deux gardes de source |
| M-1b | un nombre tapé en plus, dans la page ou dans une constante | T-3u et pilote (reste avec jeton) ; (a) pour une constante |
| M-2 | n rendu ≠ n du fichier (+1, ou le n d'une autre strate) | pilote et T-3u (valeur absente, jeton hors liste) ; T-2 |
| M-3a | q̂₀ lu d'une autre strate (nul sous le plancher) | T-2 (le module jette) ; T-3u (valeur absente) |
| M-3b | q̂₀ lu du poolé | **équivalent sur l'artefact réel** (valeur égale, §1.2) ; tué par T-2 sur un rapport synthétique où le poolé diffère |
| M-4 | digest tronqué autrement que sous P-2 | pilote (altération dérivée) ; T-3u ; T-2 |
| M-4b | digest aux lettres altérées | pilote (chaîne entière) ; un contrôle par jetons seul ne le voit pas (§1.4) |
| M-5 | note 216 sans « conformal » | T-1 seulement (le contrôle d'artefact compare à la constante) |
| M-6 | `assertUkemiBody` accepte un jeton en plus (reste non scanné, ou comparaison par ensemble) | pilote : jeton en plus égal à un jeton du digest ; « 185 of 189 » |
| M-7 | `assertUkemiBody` accepte un chiffre manquant ou compté deux fois, ou ne regarde que la première occurrence (pli C-2) | pilote : valeur rendue deux fois ; valeur courte présente deux fois comme occurrence bornée ; cas vert de C-2 pour l'ordre |
| M-8 | chiffres rendus aussi à l'état `empty`, ou hors de la branche committée | T-3 ; pilote (état vide avec chiffre) |
| M-9 | valeur dans un attribut visible, seule ou en plus du texte | T-3 ; pilote : seule dans un `title`, elle manque au texte (règle 2, pli C-1) ; en plus du texte, ses jetons restent dans les attributs (règle 3) |
| M-10 | le module rend `null` ou un repli sans chiffre à l'état committé | T-2 ; vacuité du pilote ; T-3u |
| M-11 | chiffre dans un libellé nouveau | (a) de `site_ukemi_body_scan_and_carrier` ; T-3u |
| M-12 | `ukemiExpected` rend une liste vide à l'état committé | `site_ukemi_expected_figures_follow_the_committed_files` ; vacuité de `assertUkemiBody` dans T-3u |
| M-13 | `ukemiExpected` calcule l'attendu avec le module de la page | `site_ukemi_build_check_derives_figures_apart` |

Les six mutants exigés par la mission sont M-1, M-2, M-3 (a et b), M-4, M-5 et M-6. Le banc de mutants du G1 vit sous `F:\tmp\udigit\g1\` (copie `git archive`) et n'entre pas dans le dépôt.

## 6. Anti-close (ADR-U4b-2b §5, `:290-294`)
- Aucun montant, prix ni q̂ tapé dans un test : q̂ est lu par les chargeurs et comparé comme chaîne ; n n'est jamais écrit en littéral (relation « n rendu = n du fichier ») ; les altérations des mutants sont dérivées des valeurs chargées. Épingles permises : sha256, relations, texte de 216 (sans nombre), constantes de code (coupes). Les deux ŷ de T-5 sont une valeur de sonde déjà employée par le fichier et une coupe du code, pas un montant de marché.
- Cet ADR ne recopie pas la valeur de q̂ ; il cite des champs et des sha256.
- Pli C-5 : la mission G0 rattachait ici la décision 69 ; sa ligne (`docs/CHANTIERS.md:213`) porte la règle des noms de fournisseur sur les surfaces publiques (tenue au §1.9), pas l'anti-close, qui se cite par ADR-U4b-2b §5 seul.

## 7. R-25 estimé (pathspecs de `.github/workflows/ci.yml:82` pour le CODE et `:86` pour le CONTENU)

| Fichier | CODE (insertions + suppressions) | CONTENU |
|---|---|---|
| `apps/site/lib/ukemi-copy.ts` | environ 30 | 0 |
| `apps/site/lib/ukemi-served-figures.ts` (nouveau) | environ 40 | 0 |
| `apps/site/components/ukemi/ukemi-page.tsx` | environ 30 | 0 |
| `scripts/assert-fleet-html.mjs` | environ 70 | 0 |
| `scripts/assert-fleet-html.d.mts` | environ 12 | 0 |
| `test/site-ukemi.test.ts` (T-1 12, T-2 55, T-3 25, T-4 95, T-5 15, T-6 30) | environ 232 | 0 |
| `apps/site/app/page.tsx`, `apps/site/app/fleet/page.tsx`, `test/site-build-fleet.test.ts` | 0 (§1.5, à confirmer par exécution) | 0 |
| `docs/adr/ADR-UKEMI-DIGIT-1.md`, `docs/adr/ADR-U4b-2b-classe-servie.md` | exclus (`:(exclude,glob)docs/**/*.md`, `ci.yml:82`) | 0 |
| **Total** | **environ 414** (fourchette 330 à 500) ≤ 1 205 | **0** ≤ 8 000 |

Aucun chemin du lot n'appartient à la liste de contenu (`apps/site/app/docs/**`, `apps/site/components/docs/**`, `apps/site/lib/docs-*.ts`, `apps/site/data/docs-*.json`, `apps/site/app/roadmap/**`, `ci.yml:86`). Mesure au gel : `git diff --shortstat 5db28a0...<gel>` avec chacun des deux pathspecs, somme insertions + suppressions (`ci.yml:90-91`).

## 8. Oracle attendu (G1, puis rejoué par le relecteur G2, le checkpoint-2 et le G7)
1. Copie `git archive <gel> | tar -x` sous `F:\tmp\udigit\g1\` ; `npm ci --offline` sous le préfixe de D-9.
2. Portes, chacune exit 0 : `npm run gate:vocab`, `npm run typecheck`, `npm run lint`, `npm run lint:ratchet`, `npm run lang:gate`, `npm run export:check`.
3. `npm run build -w @monark/site` exit 0, puis `node scripts/assert-fleet-html.mjs` exit 0 : pour `/ukemi`, état committé, note 216 présente, les valeurs de la liste fermée présentes exactement une fois chacune, 0 jeton hors liste (T-3u) ; code de sortie et ligne imprimée consignés dans les rapports G1, G2 et checkpoint-2 (pli C-6 i).
4. `npm test` complet : 0 échec ; total = base mesurée sur la même machine plus les sept tests nouveaux ; sauts = ceux de la base.
5. Mutants de §5 rejoués sur copies ; M-3b déclaré équivalent sur l'artefact réel et tué par T-2.
6. R-25 mesuré (§7).
7. Après l'upload (acte de l'orchestrateur) : sondes de `/ukemi` (note 216 et valeurs), de `/` et de `/fleet` (note 216) ; validation visuelle de l'investisseur (183), dont le digest entier sur écran étroit.

## 9. MAST : modes d'échec résiduels
Adoption des modes comme liste de risque résiduel : corpus doc 06 §6.4 (`06-framework-agents.md:267-271`) ; identifiants FM-x.y employés comme le font les ADR du dépôt (ADR-BELL-OTS-PRB §6, `:368-388`). L'article MAST n'est pas relu dans cette mission et aucune affirmation n'en est tirée.

| Mode | Menace résiduelle dans ce lot | Contre-mesure |
|---|---|---|
| FM-1.1 spécification non suivie | un nombre hors de la liste de 217 rendu (indice de strate, « 8 » de l'unité, alpha, nMin, bord nul, H-3) | règle 3 de D-3 ; porteurs négatifs existants ; P-5, P-6 |
| FM-1.2 rôle non suivi | le worker committe, touche CHANTIERS ou JOURNAL, ou ré-synchronise les données | R-20 ; T-7 ; aucune donnée servie modifiée par ce lot |
| FM-1.3 répétition d'étape | re-synchronisation de `ukemi-served.json` pendant le lot : la liste change sous le relecteur | le lot ne touche aucun fichier de données ; toute re-synchro est un commit séparé de l'orchestrateur, sha256 déclarés avant et après |
| FM-1.4 perte d'historique | réécriture en place de la ligne D5 d'ADR-U4b-2b | D-8 : ligne datée ajoutée en fin de fichier |
| FM-1.5 condition de fin ignorée | G7 prononcé sur la source, sans artefact construit | §8 point 3 : build et `assert-fleet-html` rejoués localement (`ci.yml:187-191`) |
| FM-2.2 clarification non demandée | précision, troncature, désignation, unité, date, textes tranchés en silence | P-1 à P-10 soumis au checkpoint-1 et tranchés par le validateur (§0) ; P-3, P-8 et P-9 portés à la validation visuelle 183 |
| FM-2.3 dérive de tâche | chiffres ajoutés à `/`, `/fleet` ou à la note de registre | D-7, P-4, P-9 ; items I-3 et I-4 |
| FM-2.4 rétention d'information | l'équivalence du poolé (M-3b) et la cécité d'un contrôle par jetons aux lettres du digest passées sous silence | §1.2, §1.4, §5 déclarent les deux ; T-2 et la règle 2 de D-3 les couvrent |
| FM-2.6 écart raisonnement / action | « conformal » retiré alors que le contrôle d'artefact reste vert | T-1 (M-5) |
| FM-3.1 terminaison prématurée | des rouges de l'arbre d'après non listés | liste établie par exécution au G1 (§1.6) |
| FM-3.2 vérification incomplète | comparaison par ensemble ; valeur présente seulement dans un attribut (C-1) ; occurrences multiples ou sous-chaînes (C-2) ; plages couvertes (dates ISO, identifiants admis) hors liste | règles 2 et 3 de D-3 (présence comptée dans le texte seul, attributs soumis au reste, longueur décroissante, toutes les occurrences bornées) ; M-6 avec un jeton déjà présent dans le digest. Résiduels déclarés : (i) les plages couvertes restent admises par la mission : un nombre écrit sous forme de date ISO ou d'identifiant admis échappe au contrôle, inchangé depuis la parité avec le lint (`assert-fleet-html.mjs:284-290`) ; (ii) frontière `.`/`-` (pli C-2) : la borne « ni chiffre ni lettre » traite `.` et `-` comme frontières, donc une valeur courte peut être sous-chaîne bornée d'un nombre pointé ou d'une date ; le retrait par longueur décroissante règle les coïncidences entre valeurs de la liste (n contre partie entière de q̂₀ ou année du jour) ; hors liste, les morceaux restants laissent des jetons que la règle 3 rougit ; reste un faux rouge possible, fail-closed, si une valeur coïncide avec un composant d'un nombre admis rendu ailleurs (par exemple l'année d'une autre date ISO) |
| FM-3.3 vérification incorrecte | l'attendu calculé par le module même de la page | D-4 ; `site_ukemi_build_check_derives_figures_apart` (M-13) |

## 10. Items formés (propriétaire : l'orchestrateur ; aucun « dû » nu)

| I | Objet | Déclencheur |
|---|---|---|
| I-1 | UKEMI-DIGIT-GATE-1 (ADR-U4b-2b §7, `:317`) : clos par ce lot | G7 du lot (D-8) |
| I-2 | **SERVED-PROBE-PER-STRATUM-1** : le fichier servi porte un seul verdict, celui de la strate de la sonde ; à une deuxième strate committée, `/ukemi` ne montrerait qu'une strate. Action : un verdict par strate committée dans la synchro (schéma v3), la page les liste, la liste fermée s'étend d'autant | commit d'une deuxième entrée dans `UKEMI_LIQ_COMMITTED` (`apps/harness/src/calibration.ts:247`) |
| I-3 | **SERVED-STATE-LINE-ARTEFACT-1** : la ligne d'état servi de `/` et de `/fleet` n'est épinglée que sur source ; étendre `main()` de `assert-fleet-html.mjs` à ces deux artefacts (phrase de l'état présente, celle de l'autre absente) | prochain lot qui touche `main()` ou ces deux lignes ; au plus tard, le prochain changement d'état servi |
| I-4 | **FLEET-NOTE-CONFORMAL-1** : aligner la note de registre `apps/site/lib/fleet.ts:193` sur 216 | question portée par l'orchestrateur à la validation visuelle 183 de ce lot ; sans objet s'il refuse (pli C-3 : P-9 est tranché au checkpoint-1) |

Items existants, inchangés : WORKTREE-NPM-CI-1 (installation hors ligne dans la copie) ; KITCHEN-PUBLIC-SCRIPTS-1 (ce lot n'ajoute aucun vocabulaire de cuisine au script exporté) ; *required status check `g3-site`* (pli C-6 ii ; `docs/CHANTIERS.md:227`, `:318`, `:691` : action sortante de l'orchestrateur sur la protection de branche, hors lot) : tant que `g3-site` n'est pas un contrôle requis, le blocage du tuyau des chiffres repose sur le rejeu local de §8, pas sur la CI.

## 11. Alternatives rejetées
- **Comparer des ensembles de jetons** : un chiffre tapé égal à un jeton que le digest produit déjà passe (§1.4, conséquence 1).
- **Comparer des multiensembles de jetons seulement** : aveugle aux lettres du digest (mesuré, `letters.mjs`).
- **Calculer l'attendu avec le module de la page** : une erreur commune aux deux resterait verte (FM-3.3) ; D-4.
- **Page qui ne lit que le fichier servi** : le rendu perdrait l'accord des deux fichiers (le contrôle le garderait seul) ; 217 nomme les deux fichiers comme sources ; rejeté.
- **Repli sans chiffre à l'état committé** : P-10.
- **Rendre la clause servie committée (UPPER, REQ, H-3)** : ses nombres (bord nul, alpha, nMin, H-3) sont hors de la liste de 217.
- **Exempter les valeurs par `apps/site/test/honesty-lint.exempt.json`** : chaque entrée y est une valeur tapée, contraire à « jamais tapés » (217), à re-taper à chaque synchronisation ; le fichier refuse en outre une valeur égale à un chiffre sourcé (son `$comment`) ; et le contrôle de `/ukemi` est volontairement sans exemption (`assert-fleet-html.mjs:284-287`).
- **Digest tronqué en texte et entier en `title`** : la règle 3 lit les attributs (pli C-1) ; les jetons du digest entier y resteraient hors liste, et le lecteur verrait dans l'infobulle une valeur que le texte ne porte pas.
- **Expression régulière construite depuis la valeur** : risque d'alerte d'injection d'expression, CodeQL requis (décision 170) ; `indexOf` et test des bornes suffisent.

## 12. Non confirmé, et où j'ai cherché
- **Rouges de l'arbre d'après** : listés par lecture (§1.6) ; à établir par exécution au G1 (règle de l'amendement 213).
- **Les « 8 portes » du journal** : la liste n'est écrite nulle part (cherché dans `docs/CHANTIERS.md` et `docs/JOURNAL-PROVENANCE.md`) ; §8 propose les portes de `package.json` et le couple build plus `assert-fleet-html`.
- **Valeurs servies en ligne aujourd'hui** : aucun réseau ; les chiffres sont ceux du fichier lu le 2026-09-25 à 03:26:01Z.
- **Composition complète de `runGate`** hors branche liquidation (`gate.ts` au-delà de `:641`) : non relue ligne à ligne ; T-5 rejoue deux réponses servies.
- **Rendu du digest entier sur écran étroit** : non mesuré (aucun build) ; validation visuelle (§8 point 7).
- **Estimations R-25** : estimations ; mesure au gel (§7).
- **Options (a) à (c) de 217** : non consignées (§1.1).

## 13. Sources (toutes lues dans cette mission ; aucun chiffre de seconde main)
- Corpus : doc 02, R-20 à R-25 (`02-referentiel-gates-et-regles.md:109-114`) [lu] ; doc 06 §6.4 (`06-framework-agents.md:267-271`) [lu] ; gabarits `templates/adr.md` et `templates/backlog-passe.md` [lu].
- Décisions : `docs/CHANTIERS.md:1516` (216 à 219), `:1386` (168) [lu] ; `:213` porte la décision 69, règle des noms de fournisseur (la ligne Massive), pas l'anti-close, qui se cite par ADR-U4b-2b §5 (`:290-294`) seul (pli C-5) [lu] ; `:227`, `:318`, `:691` : item *required status check `g3-site`* (pli C-6 ii) [lu] ; mission `F:\tmp\udigit\mission-g0.md` (sha256 ci-dessus) [lu].
- Checkpoint-1 : rapport `F:/tmp/udigit/cp1/CP1-report.md`, sha256 `31a863df4373e11f79f6d060ca08550b9348caf22843f93663c6f57f8aa0fd12` recalculé, lu en entier (verdict, §4 décisions P-1..P-10, §5 corrections C-1..C-6) [lu].
- ADR du dépôt : ADR-M013 (régimes, amendements du 2026-09-24) [lu] ; ADR-M018 D3 (`:25-27`) [lu] ; ADR-U4b-2b §1.3 (`:69-85`), §1.6 (`:101-111`), D5 (`:199-220`), §5 (`:290-294`), amendements (`:417-439`) [lu] ; ADR-BELL-OTS-PRB T-B9 (`:180-187`) et §6 (`:368-388`) [lu].
- Code et données à `5db28a0` [lu] : `apps/site/lib/ukemi-copy.ts`, `ukemi-served-load.ts`, `ukemi-course-load.ts`, `ukemi-course-view.ts` ; `apps/site/components/ukemi/ukemi-page.tsx` ; `apps/site/app/page.tsx`, `apps/site/app/fleet/page.tsx`, `apps/site/app/ukemi/page.tsx`, `apps/site/app/ukemi/course/page.tsx` ; `apps/site/data/ukemi-served.json`, `ukemi-course.json`, `manifest.sha256.json` ; `apps/site/test/honesty-lint.ts` et `honesty-lint.exempt.json` ; `scripts/assert-fleet-html.mjs` et `.d.mts` ; `scripts/export-public.mjs` et `export-exclude-data.json` ; `.github/workflows/ci.yml` ; `vocab-banned.json` ; `apps/harness/src/tools/gate.ts`, `apps/harness/src/calibration.ts` ; `packages/contracts/src/calib-digest.ts`, `types.ts` ; `packages/hikae/src/verdict.ts` ; `test/site-ukemi.test.ts`, `test/site-build-fleet.test.ts`.
- Mesures exécutées [lu, reproductibles] : sha256 LF des deux fichiers servis (égaux au manifeste) ; `tokens.mjs` et `letters.mjs` (sha256 en tête), sur la copie `F:\tmp\udigit\base\`.

## 14. Clôture zéro dette (état au G0, mis à jour au pli du checkpoint-1)
Chaque point ouvert est soit une décision P-1 à P-10 prise au checkpoint-1 (P-3, P-8 et P-9 revisitables à la validation visuelle 183), soit un item I-2 à I-4 avec déclencheur et propriétaire, soit une ligne de §12 avec le lieu cherché et la mesure prévue au G1. Aucun document à procurer : aucune source extérieure n'est requise.

Première rédaction close le 2026-09-25 à 07:30:54 UTC ; relecture par le rédacteur, puis corrections par remplacement exact (D-2 et D-4 : imports de types seulement, q̂₀ lu du rapport par la page et recalculé du fichier servi par le contrôle ; D-3 : ordre des règles, sens de `numericTokens` ; T-2, T-4, §5, §11), scripts `F:/tmp/udigit/measure/fix1.mjs` à `fix7.mjs` ; rédaction close le 2026-09-25 à 07:35:13 UTC (`date -u`) par le worker `claude-opus-5-5[1m]` ; aucun commit (R-20).

## Corrections checkpoint-1 (amendement daté 2026-09-25 à 07:55:07 UTC)

> **Provenance.** Pli rédigé par le worker `claude-opus-5-5[1m]` (R-1 déclaré en tête de session ; effort max), le 2026-09-25 à partir de 07:49:37 UTC (`date -u`), sur le gel `82d6bfb` (ADR committé à l'identique, sha256 `b9fea5b2…c7d5` vérifié avant le pli) ; édition de ce seul fichier par remplacements exacts (scripts `F:/tmp/udigit/fold/lib.mjs`, `a1.mjs`, `a2.mjs`, `b.mjs`, `c.mjs`, `d.mjs`, `e1.mjs`, `e2.mjs`) ; aucun commit (R-20), aucun réseau, aucun `GIT_DIR`, aucun `--write-tree`. Source : rapport du checkpoint-1 `F:/tmp/udigit/cp1/CP1-report.md` (sha256 `31a863df…fd12` recalculé), lu en entier ; citations `docs/CHANTIERS.md:227`, `:318`, `:691` vérifiées avant le pli.

| Correction (rapport cp-1 §5) | Emplacement plié dans ce fichier | `error_origin` proposé (à assigner au G7) | État |
|---|---|---|---|
| C-1 attributs : présence comptée dans les nœuds texte seuls, attributs soumis au seul reste | D-3 règles 2 et 3 ; D-2 (motif de l'interdiction en attribut) ; T-4 pilote (rouges « seulement dans un `title` » et « texte et `title` ») ; §5 M-9 ; §9 FM-3.2 ; §11 | rédacteur G0 : D-3 traitait le corpus comme un tout alors que `mainCorpus` (`:339-347`) mêle texte et attributs | pliée |
| C-2 ordre et multiplicité : toutes les occurrences bornées, longueur décroissante, exactement une | D-3 règle 2 ; T-4 pilote (vert : valeur courte sous-chaîne bornée d'une longue ; rouge : valeur courte deux fois) ; §5 M-7 ; §9 FM-3.2 (résiduel frontière `.`/`-`) | rédacteur G0 : « exactement une fois » écrit sans l'algorithme des occurrences ni l'ordre | pliée |
| C-3 déclencheur d'I-4 | §10 I-4 | rédacteur G0 : déclencheur pointant vers une réponse à un point destiné à être tranché au checkpoint | pliée |
| C-4 indépendance de q̂₀ côté contrôle | D-4 ; T-4 `site_ukemi_expected_figures_follow_the_committed_files` | rédacteur G0 : l'attendu de q̂₀ reposait sur `decimal8Of`, déjà employée par le chargeur pour valider la chaîne que la page rend | pliée |
| C-5 citation de la décision 69 | §13 (Décisions) ; §6 (titre et ligne « Pli C-5 ») | rédacteur G0 : association reprise du libellé de la mission (« Anti-close (ADR-U4b-2b §5, décision 69) ») alors que la ligne `:213`, lue au G0, porte la décision Massive | pliée |
| C-6 trace de T-3u et item `g3-site` | T-4 (T-3u) ; §8 point 3 ; §10 (items existants) ; §13 | rédacteur G0 : preuve d'exécution d'un bloc `main()` non exigée dans les rapports ; item existant non nommé | pliée |

- **Décisions P-1..P-10** : écrites comme tranchées au §0 (tableau remplacé), motif en une ligne repris du rapport cp-1 §4 ; P-3, P-8 et P-9 portent la mention « validation visuelle 183 après upload » (l'investisseur peut y retourner P-3 vers les comptes du rapport et P-9 vers l'alignement de la note de registre).
- Lignes mises en cohérence sans correction propre : en-tête (Statut, Dates), §9 FM-2.2, §14.
- Non plié ici, par attribution du rapport (§3, point 3) : l'exemple numérique littéral du commentaire de `decimal8Of` (`ukemi-course-load.ts:239`), constat hors lot que l'orchestrateur consigne.

## Corrections G2 (amendement proposé par le relecteur G2 frais ; à dater `date -u` et à committer par l'orchestrateur au pli)

> **Provenance.** Texte proposé par le relecteur G2 `claude-opus-5-5[1m]` (effort max, instance séparée, contexte frais) le 2026-09-25, revue de la plage `5db28a0..e625e3c` ; preuves et journaux sous `F:\tmp\udigit\g2\` (liste scellée `ARTIFACTS.sha256`) ; aucun commit (R-20).

- **C-G2-1, D-3 règle 3 complétée.** Avant le scan du reste, `assertUkemiBody` refuse, fail-closed, deux formes que le scan ne sait pas lire. (a) Un chevron écrit en entité (`&lt;`, `&gt;`, `&#60;`, `&#62;`, `&#x3c;`, `&#x3e;`) dans le `<main>` brut : `renderedBody` décode les entités avant que `mainCorpus` et `mainTextAndAttrs` ne retirent les balises, et le retrait avale alors le texte qui suit le chevron (mesuré au G2 : un nombre entre `&lt;` et `&gt;`, ou après `&lt;`, passait le contrôle). (b) Un nombre en chiffres non ASCII (`\p{N}` hors `0-9` : pleine chasse, exposants), invisible à `\d` (mesuré : passait). Le `<main>` de `/ukemi` n'en porte aucun (mesuré au G2 : 0 entité de chevron, 0 caractère non ASCII). Trois rouges ajoutés au pilote `site_ukemi_body_numbers_closed_list`.
- **C-G2-2, preuve de la borne (C-2 i).** Rouge pilote ajouté : le digest précédé d'une lettre hexadécimale n'est pas le chiffre (0 occurrence bornée). Sans lui, le mutant « toute occurrence compte, bornée ou non » survivait au fichier `test/site-ukemi.test.ts`, seul fichier de tests qui appelle `assertUkemiBody` (mesuré par grep), et à T-3u (G2, mutant N-5).
- **§9 FM-3.2, résiduels déclarés en plus de (i) et (ii).** (iii) Les attributs visibles autres que `alt`, `title` et `aria-label` (`placeholder`, `value`, `aria-description`, `aria-valuetext`) ne sont pas lus : la liste de `mainCorpus`, partagée, est inchangée (mesuré : un nombre dans un `placeholder` passait). (iv) Le contrôle est textuel : une valeur masquée par une règle CSS n'est pas distinguée d'une valeur visible ; la source est tenue par `site_ukemi_figures_render_only_in_the_committed_branch`. Item **UKEMI-CHECK-ATTR-SCOPE-1** (propriétaire : l'orchestrateur ; déclencheur : premier attribut de ce type dans le `<main>` de `/ukemi`, ou prochain lot qui touche `mainCorpus`).
- **C-G2-3, I-3.** Le déclencheur « prochain lot qui touche `main()` » est atteint par ce lot même (ligne imprimée du bloc `/ukemi` de `main()`, prescrite par D-3) : il était circulaire. Décision du G7 : soit absorption (extension de `main()` aux artefacts de `/` et de `/fleet`, hors D-1 à D-9, donc nouvel amendement et nouvelle revue), soit déclencheur re-daté : « prochain lot qui change la logique d'un bloc de `main()` autre que la ligne imprimée de `/ukemi`, ou la ligne d'état servi de `/` ou de `/fleet` ; au plus tard le prochain changement d'état servi ».
- **C-G2-4, TYPED-AMOUNT-UKEMI-SWEEP-1.** La portée de l'item comprend aussi l'exemple numérique du commentaire de `decimal8Of` (`apps/site/lib/ukemi-course-load.ts:238`, fichier exporté ; mesuré au G2 : il porte q̂₀ et son entier de base, présent à `5db28a0`, inchangé par ce lot), attribué à l'orchestrateur au checkpoint-1 et non consigné à `4ca71bf` ; même action (un exemple sans montant), même déclencheur.
- **E-2 consigné dans D-3.** La garde de recomposition (le texte et les valeurs d'attributs recomposent `mainCorpus`, sinon rejet) fait partie du contrôle ; tautologique tant que les deux calculs sont écrits à l'identique, elle n'est pas tuable par mutant (G2).
