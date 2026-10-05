# G0 - lot R25-INTEGRATION-RULE-1 (R-25 ne compte que le neuf d une PR d intégration)

- **Mission** : `coordination/messages/2026-10-05-MONARK-vers-RECHERCHES-R25-integration.md` (branche `claude/monark-repository-access-brln3a` du dépôt de coordination), décision de l investisseur du 2026-10-05, exigences E-1 à E-7.
- **Branche** : `recherches/r25-integration-rule-1`, depuis le tronc `lot/etude-suite` @ `ab8084fb203026460ff1d4839e4d35cd85f10abb`.
- **Statut** : G0 seul. Aucun code, aucun test dans ce commit. Le G1 suit les réponses de MONARK aux questions de la section 10.
- **Intention (une)** : sur une PR d intégration **prouvée**, la gate R-25 (job `r25-taille-de-lot` de `ci.yml` et porte r25 de l oracle) mesure seulement le neuf : (a) les résolutions des commits de fusion qu aucune PR fusionnée ne porte, mesurées par `git show --remerge-diff`, et (b) les commits qu aucune PR fusionnée ne porte. La borne reste 1 205 (CODE) et 8 000 (CONTENT). Toute autre PR, et toute PR d intégration sans preuve complète, est mesurée exactement comme aujourd hui.

## 1. Existant mesuré (tronc `ab8084fb`)

- **Job CI** (`.github/workflows/ci.yml` l.40-101) : déclenché par `pull_request` seul (l.18-19), jeton `permissions: contents: read` (l.24-25), checkout `fetch-depth: 0`, donc `HEAD` = la ref synthétique `refs/pull/N/merge` (parents : pointe de la cible, tête de la PR). La base est `origin/${{ github.base_ref }}` (l.82, l.86) ; plage `origin/<cible>...HEAD`. Deux comptes `git diff --shortstat` sur une ligne chacun (STAT l.82, CONTENT_STAT l.86), métrique ins+del (l.90-91), impression avant les bornes (l.92-93), comparaison `-gt` (l.94, l.98). Aucun appel réseau, aucune lecture de l événement.
- **Oracle** (`scripts/oracle/r25.mjs`, 28 lignes) : `r25(clone, ciText, base)` retrouve les lignes STAT et CONTENT_STAT par `R25_DIFF_RE` (même expression que `test/ci-gates.test.ts:97`, égalité épinglée par `test/oracle-run.test.ts:290-291`), en tire les pathspecs, lit les bornes dans les clés `env:`, compte `<base>...HEAD` dans le clone figé (commit de gel pour un arbre sale). `scripts/oracle/run.mjs` remplace tout le bloc `run:` qui contient une ligne `R25_DIFF_RE` par cette relecture (l.127), supprime de l environnement toute variable `*TOKEN*`, `GH_*`, `GITHUB_*` (DENY l.36) et force npm hors ligne : l oracle ne lit pas le réseau.
- **Épingles du test 38** (`test/ci-gates.test.ts`) : (3) `VIBEGATES_PR_LIMIT` = 1205 ; (4)-(4ter) pathspecs ; (4quater) l.210-299 : exactement deux lignes `git diff`, dans l ordre STAT puis CONTENT_STAT, garde numérique avant tout diff, même programme awk, impression avant le premier `if [`, `::error::` + `exit 1` au dépassement ; `ci_runs_export_check` et `ci_runs_lang_gate` bornent le bloc du job ; `ci_workflow_declares_least_privilege_permissions` (l.1813-1833) impose **un seul** bloc `permissions`, au niveau racine, de corps exactement `contents: read`.
- **ADR-M003 D9** : borne 1 205 (l.88-96) ; addenda quater, sexies, septies (exclusions) ; deux exceptions ponctuelles keyées par numéro de PR, quinquies (#56) et octies du 2026-09-24 (#89), toutes deux retirées. Le prochain addendum libre est **D9 nonies**.
- **Faits GitHub mesurés le 2026-10-05** (lecture `gh api`) : dépôt public ; fusion par commit, squash et rebase toutes trois permises ; `lot/etude-suite` et `base/c2-integration` **non protégées**, `main` protégée ; aucune revue GitHub sur les PR (ex. #149 : 0 review) : la relecture du dépôt est la G2 et le contrôle MONARK, pas l approbation GitHub ; chaque tête de PR fusionnée porte un check-run `r25-taille-de-lot` de l app `github-actions` (24 PR vérifiées sur les deux intégrations ci-dessous : toutes `success`).
- **Historique réécrit** : 2 PR fusionnées dans le tronc (#88, #92, le 2026-09-25) ont un `merge_commit_sha` absent de toute branche actuelle ; le tronc a des commits poussés en direct (docs de HANDOFF, journal, ETAT) et des fusions locales anciennes (« Fusion ... »), qu aucune PR ne porte.

### 1.1 Mesure du prototype (jetable, hors dépôt) sur les trois intégrations en attente

Prototype : preuve = PR fusionnées (API) de base dans la liste close, ensemble prouvé = `M` et `rev-list M^2 ^M^1` ; reste compté par commit (diff au parent, `--remerge-diff` pour une fusion), pathspecs STAT et CONTENT_STAT lus dans `ci.yml`.

| Intégration (source -> cible) | Commits | Non prouvés | Gate actuelle (CODE / CONTENT) | Règle nouvelle (CODE / CONTENT) |
|---|---|---|---|---|
| tronc `ab8084fb` -> `base/c2-integration` `418a421f` | 160 | 19 (docs poussés en direct) | 3 246 / 0 | **0 / 0** |
| `base/c2-integration` `418a421f` -> tronc `ab8084fb` | 91 | 2 (docs) | 4 172 / 0 | **0 / 0** |
| tronc `ab8084fb` -> `main` `207f021f` | 1 599 | 1 276 | 46 183 / 6 137 | **44 818 / 6 233** (rouge) |

Lecture : la règle débloque la synchro et l intégration de C2. Elle **ne débloque pas** l avance de `main` : 1 276 commits du tronc datent d avant la livraison par PR, ou ont été fusionnés en local, ou réécrits ; aucune PR ne les prouve et la règle les compte, comme le veut E-3. Voir Q-8.

La synchro tronc -> `base/c2-integration` **conflicte** (`git merge-tree` : `docs/adr/ADR-M004-infrastructure-plateforme.md`). Elle passera donc par une branche de synchro portant un commit de fusion résolu. La résolution, dans un `.md` sous `docs/`, est hors pathspec et compte 0. La branche de synchro doit être dans la liste close (section 2.1).

## 2. Définitions fermées (E-3)

### 2.1 Liste close des branches d intégration `L`

`L` = { `lot/etude-suite` (tronc), `main` } ∪ { `base/<nom>` où `<nom>` matche `^[a-z0-9][a-z0-9.-]*$` }. `base/c2-integration` y est par la seconde partie. Liste tenue par une constante du module partagé, épinglée par test ; l élargir est une ligne datée d ADR. La forme `base/*` est celle de l investisseur ; elle permet une branche de synchro `base/sync-...` pour une synchro qui conflicte (Q-1 propose l énumération à la place).

### 2.2 PR d intégration candidate

Une PR est **candidate** si et seulement si, lu dans l objet PR de l API GitHub (jamais dans un nom passé en argument) :

1. `head.repo.full_name` == `base.repo.full_name` == le dépôt du run (une PR de fork nommée `main` n est jamais candidate) ;
2. `head.ref` ∈ `L` et `base.ref` ∈ `L` ;
3. `head.ref` ≠ `base.ref`.

Être candidate ne retire rien au compte. C est seulement la condition pour chercher une preuve.

### 2.3 PR prouvante

Une PR `P` de la liste de preuve **prouve** ses commits si et seulement si :

1. `P.merged_at` ≠ null ;
2. `P.base.ref` ∈ `L` (une PR fusionnée ailleurs ne prouve rien) ;
3. `P.number` ∉ `EXCEPTED_PRS` = {56, 89} (leur R-25 « vert » vient d une garde d exception, pas d une mesure, D9 quinquies et octies ; Q-5) ;
4. tous les check-runs nommés `r25-taille-de-lot` de l app `github-actions` sur `P.head.sha` concluent `success`, et il y en a au moins un. C est la preuve machine que la PR a été mesurée sur cette tête exacte ; la G2 reste la preuve humaine, contrôlée par MONARK (Q-3) ;
5. `M = P.merge_commit_sha` existe dans le clone, et :
   - `M` a deux parents et `M^2 == P.head.sha` (fusion par commit). Ensemble prouvé : {`M`} ∪ `rev-list M^2 ^M^1`, c est-à-dire exactement les commits que la PR a apportés à sa cible au moment de la fusion ;
   - ou `M` a un parent (squash). Ensemble prouvé : {`M`} ;
   - sinon (octopus, tête différente, objet absent), rien n est prouvé.

L ensemble prouvé est dérivé du **graphe** à partir de `M`, jamais de `pulls/{n}/commits` (plafonné à 250, et étranger à la question « qu est-ce qui a été fusionné »), jamais d une branche (qui bouge après la fusion), jamais d un message ni d un patch-id.

### 2.4 Preuve complète

La preuve est un JSON (`monark.r25-proof.v1`) : `{ schema, repo, pr: {number, head_ref, head_repo, base_ref, base_repo, head_sha}, base_sha, head_sha, complete: true, merged: [{number, base_ref, merged_at, merge_commit_sha, head_sha, r25}] }`. `merged` couvre les PR fusionnées dont le `merge_commit_sha` est dans `R` (section 3). Elle est **complète** si chaque page de l API a répondu 200, que la pagination est allée jusqu au bout (page plus courte que `per_page`) et que le schéma est exact. Sinon il n y a **pas** de preuve. Une preuve partielle n existe pas.

## 3. Algorithme de compte (une fonction, `effective()`)

Entrées : `base` (CI `origin/<base_ref>`, oracle `--base`), `HEAD` du clone, le texte de `ci.yml` de l arbre mesuré, la preuve (fichier ou rien), `W = (CHANGED, CONTENT_CHANGED)` le compte d aujourd hui.

1. Pathspecs CODE et CONTENT : lus par le module dans les lignes STAT et CONTENT_STAT du `ci.yml` de l arbre, par la même `R25_DIFF_RE` (trois copies épinglées égales : test 38, `r25.mjs`, module).
2. Sans preuve lisible, complète, du même dépôt et dont `pr.head_sha` ∈ {`HEAD`, `HEAD^2` quand `HEAD` est la ref synthétique de fusion avec `HEAD^1` == base} : mode `unproven`, résultat `W`.
3. PR non candidate (2.2) : mode `written`, résultat `W` (E-1 : rien ne change).
4. `S` = union des ensembles prouvés (2.3). `R` = `git rev-list --parents HEAD ^base`. `U` = `R \ S`.
5. Garde des fichiers de la gate : si un commit de `U` touche `.github/workflows/**`, `scripts/r25-integration.mjs`, `scripts/oracle/r25.mjs` ou `scripts/oracle/run.mjs`, mode `gate-files`, résultat `W`. Une modification non relue du juge ne se juge pas elle-même au rabais.
6. Pour chaque `c` de `U`, compte ins+del sous chaque pathspec :
   - un parent : `git diff --shortstat c^ c -- <pathspecs>` (règle b) ;
   - deux parents : `git show --remerge-diff --format= --shortstat c -- <pathspecs>` (règle a) ;
   - zéro ou plus de deux parents : diff complet contre l arbre vide ou le premier parent (fail-closed).
7. `NEW` = somme par pathspec. Résultat mode `integration`, `(min(W.code, NEW.code), min(W.content, NEW.content))` (Q-4).
8. Toute exception (git < 2.36 sans `--remerge-diff`, objet manquant, sortie non numérique) : résultat `W`. Le module n est jamais une source de vert. Dans le pire cas il rend le compte d aujourd hui.

La comparaison à la borne ne bouge pas : `-gt` en bash pour la CI, `c.changed > c.limit` dans `r25()` pour l oracle. Le module ne décide pas, il fournit deux entiers. Le journal imprime le mode, `|R|`, `|U|`, et la liste des commits de `U` avec leur compte, avant les bornes.

**Pourquoi `--remerge-diff`** (E-2 a, mesuré sur git 2.43 dans un dépôt jetable) : il compare le résultat enregistré à la refusion automatique. Il montre donc la résolution d un conflit **et** tout changement ajouté à une fusion propre (fusion malicieuse : 1 ligne glissée dans un fichier sans conflit = `1 insertion(+)`). `--cc` masque une ligne identique à l un des parents ; le diff au premier parent recompte tout le côté fusionné. Les marqueurs de conflit comptent en suppressions (une résolution d une ligne sur un conflit d une ligne mesure 1 + 5 = 6). C est un sur-compte borné, conservateur, et c est la métrique ins+del de D9 telle quelle (Q-6). `--remerge-diff` existe depuis git 2.36 : il faut une version au moins égale sur le runner Ubuntu et sur la machine Windows de l oracle, sinon le résultat est `W` (étape 8).

**Somme par commit et diff net** : un commit annulé plus loin compte deux fois. C est un sur-compte, donc fail-closed. Le `min` avec `W` empêche qu une PR d intégration soit plus mal traitée qu une PR écrite.

## 4. Mécanisme de preuve, CI et oracle (E-4)

### 4.1 Une seule implémentation

`scripts/r25-integration.mjs` (nouveau, zéro dépendance, `node:` seulement) exporte `L`, `EXCEPTED_PRS`, `GATE_FILES`, `R25_DIFF_RE`, `isCandidate`, `provenSet`, `countNew`, `effective`, `buildProof`, et deux sous-commandes CLI :

- `proof --event <payload> --out <fichier>` (CI) ou `proof --repo <o/r> --pr <n> --base <ref> --out <fichier>` (local). Elle lit l objet PR (`GET /repos/{o}/{r}/pulls/{n}`). Si la PR n est pas candidate, elle écrit une preuve sans `merged` et s arrête. Sinon elle calcule `R` dans le clone, liste les PR fermées (`GET /pulls?state=closed&per_page=100`, paginé), garde celles dont `merge_commit_sha` ∈ `R`, puis lit pour chacune `GET /commits/{head_sha}/check-runs?check_name=r25-taille-de-lot`. `buildProof` (pure) transforme les pages brutes en JSON. En cas d échec, aucun fichier n est écrit (et un fichier ancien est supprimé d abord).
- `count --ci <ci.yml> --base <ref> --proof <fichier> --written <code> <content>` : imprime `<mode> <code> <content>` puis le détail.

### 4.2 CI

Dans le bloc `run:` du job, après les deux lignes de métrique et avant les impressions :

```
node scripts/r25-integration.mjs proof --event "$GITHUB_EVENT_PATH" --out "$RUNNER_TEMP/r25-proof.json" || echo '::warning::R-25 integration proof not obtained: every line counts (fail-closed).'
R25I=$(node scripts/r25-integration.mjs count --ci .github/workflows/ci.yml --base "origin/${{ github.base_ref }}" --proof "$RUNNER_TEMP/r25-proof.json" --written "$CHANGED" "$CONTENT_CHANGED") || R25I="written $CHANGED $CONTENT_CHANGED"
```

suivi d une lecture `read -r R25_MODE NEW_CHANGED NEW_CONTENT` et d une garde `case ... ''|*[!0-9]*)` qui rétablit `W` sur une sortie non numérique. Sans cette garde, `[ "abc" -gt 1205 ]` sort en erreur, le `if` est faux et la gate passerait. Ensuite `CHANGED`/`CONTENT_CHANGED` sont réassignés et les lignes existantes (impressions, `if [ ... -gt ... ]`) ne bougent pas. Le jeton : `R25_READ_TOKEN: ${{ github.token }}` dans le `env:` de l étape. Le module lit `GITHUB_API_URL` (posée par Actions) et aucun nom de branche n est interpolé par `${{ }}` dans le script (injection par nom de branche, section 6). Le dépôt est lu dans le payload. Permissions requises : `pull-requests: read` et `checks: read`, en plus de `contents: read` (Q-2).

### 4.3 Oracle local, sans réseau

L oracle ne lit pas le réseau et supprime les jetons (DENY). Il ne prouve donc pas l appartenance lui-même. Il **lit une preuve déclarée** :

- l opérateur lance, **avant** l oracle et hors de lui, `node scripts/r25-integration.mjs proof --repo KraidleAI/monark-governance --pr <n> --base <ref> --out <fichier>`. C est la même sous-commande et le même `buildProof` que la CI. Seul le transport change : `gh api` (lecture déclarée, authentifiée par `gh`, aucun jeton dans l environnement) au lieu de `fetch` + `R25_READ_TOKEN` ;
- `run.mjs` gagne `--r25-proof <fichier>`. `r25()` importe `scripts/r25-integration.mjs` **depuis le clone figé** (import dynamique : ce sont les octets de l arbre mesuré, comme la CI, qui exécute le module de son checkout) et appelle `effective()`. Un clone sans module (arbre antérieur) donne `W` ;
- le record gagne `r25_mode` et `r25_proof: {file, sha256}`. La clé D4 gagne la part `r25_proof` (sha256 ou null), pour qu un record servi sans preuve ne soit jamais servi pour un run avec preuve. Conséquence unique : les records G1/corr déjà en magasin ne sont plus servis (clé changée), ils sont rejoués une fois ;
- sans `--r25-proof` : `W`. C est le compte d aujourd hui et la porte locale ne change pas pour une PR écrite.

### 4.4 Pourquoi elles ne peuvent pas diverger

- **Même code** : les deux voies exécutent le fichier `scripts/r25-integration.mjs` de l arbre mesuré ; ni la CI ni l oracle n ont de copie de l algorithme.
- **Mêmes pathspecs** : le module les lit dans le même `ci.yml` (trois copies de `R25_DIFF_RE` épinglées égales).
- **Même preuve** : même schéma, même `buildProof`. Les faits prouvés (PR fusionnée, `merge_commit_sha`, check-run sur une tête figée) sont immuables. Deux lectures à des instants différents ne diffèrent donc que par des PR fusionnées entre-temps, absentes de `R`. La CI imprime le sha256 de sa preuve ; MONARK peut le comparer à celui du record de l oracle.
- **Seule différence structurelle** : en CI, `HEAD` est la fusion synthétique `refs/pull/N/merge`. Elle est dans `U` (non prouvée) et sa `--remerge-diff` vaut 0, car GitHub ne crée cette ref, et ne lance le workflow, que si la fusion est propre. Le test de parité T-10 l épingle.
- **Variantes écartées** : (i) un manifeste versé : porté par `HEAD`, l auteur de la PR l écrit lui-même ; porté par la cible, il faut un écrivain hors PR sur un tronc non protégé, et il vieillit à chaque fusion. (ii) La signature `web-flow` de GitHub, vérifiable hors ligne : GitHub signe aussi les éditions web et les fusions par API, avec un message libre, donc « Merge pull request #N » se forge. (iii) L oracle qui lit le réseau : contraire à sa conception hors ligne (DENY, npm hors ligne).

## 5. Fichiers touchés (zone de la mission)

1. `scripts/r25-integration.mjs` (nouveau) : module partagé.
2. `scripts/oracle/r25.mjs` : import dynamique depuis le clone, `effective()`, champs `mode` et `proof`.
3. `scripts/oracle/run.mjs` : drapeau `--r25-proof`, part de clé, champs du record, ligne d aide.
4. `.github/workflows/ci.yml` : job `r25-taille-de-lot` seul (env `R25_READ_TOKEN`, deux lignes `node`, garde numérique, réassignation, commentaire). Bloc `permissions` racine si Q-2 est accepté (hors zone aujourd hui).
5. `test/r25-integration.test.ts` (nouveau) : T-1 à T-10.
6. `test/ci-gates.test.ts` : (4quinquies) dans le test 38 ; corps du test de permissions si Q-2 est accepté (hors zone aujourd hui).
7. `test/oracle-run.test.ts` : T-11 ; égalité de `R25_DIFF_RE` étendue au module (l.290-291).
8. `docs/adr/ADR-M003-phase2-integration.md` : ligne D9 nonies (section 8). Docs, hors pathspec.
9. `docs/G0-lot-r25-integration-rule-1.md` (ce fichier), puis G1/G2 du lot. Docs, hors pathspec.

## 6. Menaces et réponses

| # | Attaque | Réponse | Test |
|---|---|---|---|
| A-1 | Commit non relu caché dans une intégration (poussé en direct sur un tronc non protégé) | Hors de tout `S` : compté en entier (règle b). | T-1 |
| A-2 | Commits d une PR relue réutilisés plus un commit amendé (même message, autre sha) | `S` se prouve par sha via le graphe de `M`, jamais par message ni patch-id : le commit amendé est compté. | T-1 |
| A-3 | Fusion malicieuse : une résolution cache du code neuf, ou une fusion propre reçoit des lignes en plus | Fusion hors `S` : `--remerge-diff` montre les deux cas (mesuré). La fusion faite par GitHub (`M` prouvé) ne peut pas en porter : GitHub l a calculée. Une fusion interne à une PR prouvée a été comptée dans le diff net de cette PR. | T-4 |
| A-4 | PR fusionnée par squash (sha différents) | `M` à un parent = `merge_commit_sha`. Il est prouvé seul ; son contenu est le diff net mesuré sur la PR. Les commits d origine ne sont pas dans la cible et ne comptent pas. | T-9 |
| A-5 | PR fusionnée par rebase | Seul le dernier commit rebasé égale `merge_commit_sha`. Les autres, nouveaux sha, ne sont pas prouvables et sont comptés (fail-closed). Q-7 : désactiver la fusion par rebase. | T-9 |
| A-6 | PR fusionnée dans une branche hors liste close | Condition 2.3-2 : elle ne prouve rien. | T-8 |
| A-7 | Tête de PR poussée en force après revue | `M^2` doit égaler `P.head.sha`, et un `r25-taille-de-lot` vert doit exister sur cette tête exacte. Une G2 qui citerait une tête antérieure n est pas machine-vérifiable : contrôle MONARK (Q-3). | T-2 |
| A-8 | Commits atteignables depuis une PR fusionnée mais ajoutés après sa fusion | `S` = ancêtres de `M^2` non ancêtres de `M^1`, figé par `M`. Un commit poussé ensuite sur la branche n en est pas. | T-2 |
| A-9 | Faux nom de branche (`base/...` créée pour l occasion, fork nommé `main`, `lot/etude-suite-x`) | Le nom ne fait que rendre la PR candidate (et `head.repo` doit être le dépôt). Ses commits non prouvés sont comptés en entier. | T-3 |
| A-10 | API indisponible, 403/429, pagination interrompue, délai | Pas de fichier de preuve, mode `unproven`, résultat `W` (aujourd hui). `::warning::` imprimé. | T-5 |
| A-11 | Preuve d une autre PR, d une autre tête ou d un autre dépôt donnée à l oracle | `repo`, `pr.head_sha` (∈ {`HEAD`, `HEAD^2`}) et `complete` sont vérifiés, sinon `W`. Un opérateur qui forge son propre fichier ne trompe que son oracle local : la CI régénère sa preuve et imprime son sha256. | T-5 |
| A-12 | La PR d intégration modifie la gate (`ci.yml`, module, `r25.mjs`, `run.mjs`) hors PR relue | Garde `gate-files` : `W`. Résidu R-1 : une modification de `ci.yml` qui retire la garde elle-même s exécute (vrai de toute gate sous `pull_request`, aujourd hui déjà). La garde est alors elle-même du neuf, compté, et visible au contrôle MONARK par diff. | T-7 |
| A-13 | Jeton CI | Lecture seule (`contents`, `pull-requests`, `checks` en `read`). Il est passé par `env:` à une seule étape et jamais imprimé. Sous `pull_request`, une PR de fork n a pas de secret et reçoit un jeton en lecture. | T-10, (4quinquies) |
| A-14 | `pull_request_target` | Non utilisé. Il exécute le workflow de la cible (fermerait R-1), mais avec un jeton en écriture et le contexte des secrets, le motif « pwn request » dès qu on touche au code de la PR. Il faudrait un second workflow hors zone. Q-9. | - |
| A-15 | Injection par nom de branche (`${{ github.head_ref }}` dans `run:`) | Aucun nom n est interpolé. Le module lit le payload et l API. (4quinquies) l épingle. | (4quinquies) |
| A-16 | Sortie du module non numérique ou module en erreur | Garde `case` en bash, `|| R25I="written ..."` ; `catch` dans `r25()`. Résultat `W`, jamais un vert. | T-6 |
| A-17 | PR prouvante passée sous une exception R-25 keyée (#56, #89) | `EXCEPTED_PRS` : ne prouve rien. | T-8 |
| A-18 | Historique réécrit (#88, #92) | `M` absent : rien de prouvé ; commits réécrits comptés (mesuré : avance de `main`). | 1.1 |

## 7. Tests rouges d abord, puis tueurs (E-5)

Fixtures : dépôts git jetables (`git init`, PR simulées par des commits de fusion réels), preuves JSON écrites par le test, serveur HTTP local sur `GITHUB_API_URL` pour T-10. Aucun réseau. Les numéros de ligne des tueurs sont ceux du plan et seront re-mesurés au gel G1. Le format est fermé : `// killer: fichier:ligne OP "avant" -> "après"`. Les mutants de `ci.yml` sont des mutants nommés : l outil `scripts/mutants` ne mute pas le `.yml`.

| # | Test | Ce qu il épingle | Tueur(s) |
|---|---|---|---|
| T-1 | `r25i_hidden_unreviewed_commit_is_counted` (E-5, 1) | Tronc = PR #1 prouvée (40 lignes) + commit direct U (7) + copie amendée A' d un commit de #1 (5) ; synchro tronc -> `base/c2-integration` : mode `integration`, CODE = 12. | `// killer: scripts/r25-integration.mjs:88 CONST "if (proven.has(sha)) continue;" -> "if (proven.has(sha) \|\| ps.length === 1) continue;"` |
| T-2 | `r25i_merged_head_must_be_the_reviewed_head` | Preuve dont `head_sha` ≠ `M^2`, puis commit poussé sur la branche après la fusion et fusionné en local : tout compté. | `// killer: scripts/r25-integration.mjs:66 CONST "ps.length === 2 && ps[1] === p.head_sha" -> "ps.length === 2"` |
| T-3 | `r25i_fake_branch_name_bypasses_nothing` (E-5, 2) | (i) fork de tête `lot/etude-suite` : `written` ; (ii) tête `lot/etude-suite-x` : `written` ; (iii) tête `base/fake` sans PR prouvante : `integration`, CODE = `W`. | `// killer: scripts/r25-integration.mjs:41 CONST "id.head_repo === id.repo && " -> ""` ; `// killer: scripts/r25-integration.mjs:88 CONST "if (proven.has(sha)) continue;" -> "continue;"` |
| T-4 | `r25i_conflict_resolution_above_bound_is_red` (E-5, 3) | Via `r25()` sur une fixture `ci.yml` de borne 20 : fusion non prouvée qui résout un conflit en 21+ lignes : rouge ; résolution sous la borne : verte ; fusion propre avec 3 lignes glissées : 3 comptées. | `// killer: scripts/r25-integration.mjs:93 CONST "[\"show\", \"--remerge-diff\"" -> "[\"show\", \"--no-diff-merges\""` ; `// killer: scripts/oracle/r25.mjs:30 CONST "changed: eff.code" -> "changed: 0"` |
| T-5 | `r25i_missing_proof_counts_all` (E-5, 4) | Candidate et (fichier absent, illisible, `complete: false`, autre dépôt, `pr.head_sha` étranger) : mode `unproven`, résultat = `git diff --shortstat base...HEAD`. | `// killer: scripts/r25-integration.mjs:112 CONST "proof.pr.head_sha === head \|\| " -> "true \|\| "` ; `// killer: scripts/r25-integration.mjs:111 CONST "proof.complete === true && " -> ""` |
| T-6 | `r25i_written_pr_is_unchanged` (E-1) | PR `recherches/x` -> tronc : mode `written`, comptes octet pour octet ceux de la relecture d aujourd hui ; module qui lève : `W`. | `// killer: scripts/r25-integration.mjs:114 CONST "if (!isCandidate(proof.pr)) return { mode: \"written\", ...written };" -> ""` |
| T-7 | `r25i_unproven_change_to_gate_files_counts_all` | Intégration prouvée à 90 % plus une ligne non prouvée dans `scripts/r25-integration.mjs` : mode `gate-files`, `W`. | `// killer: scripts/r25-integration.mjs:120 CONST "if (touchesGate) return" -> "if (false) return"` |
| T-8 | `r25i_only_closed_list_measured_merged_prs_prove` | PR de base `lot/np-2-scripts`, PR #89, check-run `failure`, check-run absent, `merged_at` null : chacune ne prouve rien. | `// killer: scripts/r25-integration.mjs:60 CONST "!inL(p.base_ref) \|\| " -> ""` ; `// killer: scripts/r25-integration.mjs:61 CONST "p.r25 !== \"success\"" -> "false"` ; `// killer: scripts/r25-integration.mjs:60 CONST "EXCEPTED_PRS.includes(p.number) \|\| " -> ""` |
| T-9 | `r25i_squash_proves_its_commit_rebase_proves_the_last` | Squash : 0 ; rebase de 3 commits : les 2 premiers comptés. | `// killer: scripts/r25-integration.mjs:68 CONST "else if (ps.length === 1) s.add(m);" -> ""` |
| T-10 | `r25i_ci_block_and_oracle_agree` (E-4) | Le bloc `run:` réel du job, extrait de `.github/workflows/ci.yml`, exécuté sous bash avec un payload de fixture et un serveur d API local, imprime les mêmes `CHANGED`/`CONTENT_CHANGED` et le même mode que `r25()` de l oracle sur la preuve écrite par la même sous-commande ; sha256 de preuve identique. | `// killer: scripts/oracle/r25.mjs:27 CONST "proof: readProof(proofFile)" -> "proof: null"` |
| T-11 | `oracle_r25_integration_reads_the_declared_proof` (`test/oracle-run.test.ts`) | `--r25-proof` : record avec `r25_mode` et `r25_proof.sha256` ; la clé change avec la preuve ; sans drapeau, `W` et `r25_proof: null`. | `// killer: scripts/oracle/run.mjs:61 CONST "r25_proof: proofSha" -> "r25_proof: null"` |
| (4quinquies) | Test 38 étendu | Une ligne `proof` et une ligne `count` dans le job, après les deux métriques et avant la première impression ; repli `\|\| R25I="written $CHANGED $CONTENT_CHANGED"` ; garde numérique de la sortie ; `R25_READ_TOKEN: ${{ github.token }}` dans ce seul job ; aucun `${{ github.head_ref }}` ni `${{ github.event.pull_request.head.ref }}` dans un `run:`. | mutants nommés : retrait du repli ; retrait de la garde `case` ; ligne `count` déplacée après le premier `if [` ; `--base "origin/${{ github.head_ref }}"` |

Compte attendu : 11 tests, dont 10 rouges avant le code (F2P) ; (4quinquies) rougit avant le câblage CI. Les tests existants restent verts sans modification, sauf la ligne d égalité de `R25_DIFF_RE` (oracle-run l.290-291), étendue au module.

## 8. Ligne datée d ADR-M003 D9 (projet, E-6, à contrôler par MONARK)

> **Addendum D9 nonies - 2026-10-05 (règle GÉNÉRALE : R-25 ne compte que le neuf d une PR d intégration ; décision de l investisseur du 2026-10-05, verbatim « applique ta reco et informe recherches » ; lot R25-INTEGRATION-RULE-1)** : la borne `VIBEGATES_PR_LIMIT = 1205` (et `VIBEGATES_CONTENT_LIMIT = 8000`, ADR-M013) reste. Les pathspecs restent ceux de D9, quater, sexies, septies et d ADR-M013. Pour une PR écrite, rien ne change. Une PR est **candidate** à la règle d intégration si, lus dans l objet PR de l API GitHub, sa tête et sa cible sont dans la liste close `L` = {`lot/etude-suite`, `main`} ∪ {`base/<nom>`} et appartiennent au dépôt. Un nom ne suffit jamais. Une PR fusionnée **prouve** ses commits si elle est fusionnée dans `L`, n est pas une PR d exception keyée (#56, #89), porte un `r25-taille-de-lot` vert de `github-actions` sur sa tête exacte, et si sa tête est le second parent de son `merge_commit_sha` (ensemble prouvé : ce commit et `rev-list M^2 ^M^1`), ou si ce commit est un squash (lui seul). Une candidate dont la preuve est complète compte, contre les mêmes bornes, (a) la `git show --remerge-diff` de chaque commit de fusion non prouvé et (b) le diff au parent de chaque commit non prouvé, au plus le compte d aujourd hui. Sans preuve complète, ou si un commit non prouvé touche la gate (`.github/workflows/**`, `scripts/r25-integration.mjs`, `scripts/oracle/r25.mjs`, `scripts/oracle/run.mjs`), on compte tout comme avant (fail-closed). Une seule implémentation, `scripts/r25-integration.mjs`, est exécutée par le job `r25-taille-de-lot` et par la porte r25 de l oracle depuis l arbre mesuré. La CI lit la preuve par l API avec un jeton en lecture (`pull-requests: read`, `checks: read`, en plus de `contents: read`). L oracle, hors ligne, lit une preuve déclarée (`--r25-proof`) produite par la même sous-commande via `gh api`, citée par sha256 dans son record. Mesures à `ab8084fb` : synchro tronc -> `base/c2-integration` 3 246 -> 0, intégration de C2 4 172 -> 0, avance de `main` 46 183 -> 44 818 (reste rouge : 1 276 commits sans PR). Test 38 (4quinquies) et `test/r25-integration.test.ts` l épinglent. La ligne (9) d ADR-CM (borne 1 400) reste le repli tant que la règle n est pas sur la base. `error_origin` : sans objet (décision de règle). **Livré par** : lot R25-INTEGRATION-RULE-1 (G0 `docs/G0-lot-r25-integration-rule-1.md`).

## 9. R-25 du lot (E-7)

| Fichier | Lignes prévues (ins+del) |
|---|---|
| `scripts/r25-integration.mjs` | 165 |
| `scripts/oracle/r25.mjs` | 15 |
| `scripts/oracle/run.mjs` | 8 |
| `.github/workflows/ci.yml` | 16 (+2 si Q-2) |
| `test/r25-integration.test.ts` | 230 |
| `test/ci-gates.test.ts` | 35 (+1 si Q-2) |
| `test/oracle-run.test.ts` | 22 |
| **Total** | **≈ 491 (≈ 494 avec Q-2)**, borne du lot 547, CI 1 205 |

Les docs (`docs/**/*.md`, ADR comprise) sont hors pathspec. Mesure au gel par `r25()` de l oracle sur le pathspec de `ci.yml`. Si le gel dépasse 547 : découpe en 1a (module et ses tests, sans câblage, 395 environ) et 1b (câblage CI et oracle, T-10, T-11, 4quinquies). La règle ne vit qu après 1b. Le lot est une PR écrite vers le tronc, avec G2 neuve, red-proof, contrôle MONARK par diff et oracle Windows (vérifier `git --version` ≥ 2.36 sur cette machine).

## 10. Questions pour MONARK (avec mes défauts)

- **Q-1 (liste close)** : garder `base/*` (forme de l investisseur, nécessaire à une branche de synchro qui conflicte) ou énumérer (`base/c2-integration`, `base/chantier-moteur-2026-10-03`, plus une ligne datée par nouvelle base) ? **Défaut : `base/<nom>` avec la grammaire fermée de 2.1.** Le nom ne suffit jamais et une PR fusionnée dans une base doit avoir un R-25 vert mesuré sur sa tête.
- **Q-2 (jeton, hors zone)** : la preuve exige `pull-requests: read` et `checks: read`. `ci_workflow_declares_least_privilege_permissions` impose un bloc unique `contents: read`, sous ADR-CODEQL-ALERTS-1 D1. **Défaut : élargir le bloc racine à trois lignes `read`** (toujours sans écriture ; le miroir public le garde), avec une ligne datée d ADR-CODEQL-ALERTS-1 et la ligne du test. Il faut que MONARK ouvre ces deux points à la zone. Repli sans `checks: read` : la condition 2.3-4 tombe, la preuve devient « fusionnée dans `L` » seule (plus faible).
- **Q-3 (« relue »)** : la relecture du dépôt est la G2, non machine-vérifiable (0 revue GitHub). **Défaut : la preuve machine est « fusionnée dans `L` + `r25-taille-de-lot` vert sur la tête exacte ».** La G2 reste au contrôle MONARK de la PR d intégration.
- **Q-4 (`min(W, NEW)`)** : **défaut oui.** Une intégration n est jamais plus mal traitée qu une PR écrite.
- **Q-5 (`EXCEPTED_PRS` = {56, 89})** : **défaut : elles ne prouvent rien.** Sans effet sur les trois intégrations mesurées.
- **Q-6 (marqueurs de conflit)** : compter la `--remerge-diff` brute (marqueurs inclus, sur-compte d environ 3 lignes par conflit) ou retirer les lignes de marqueur ? **Défaut : brute**, même métrique ins+del que D9, sans analyseur de patch.
- **Q-7 (fusion par rebase)** : **défaut : la désactiver dans les réglages du dépôt** (acte de l investisseur, hors code). Sinon ses commits sont comptés.
- **Q-8 (avance de `main`)** : la règle laisse 44 818 lignes (1 276 commits du tronc sans PR : ère avant PR, fusions locales, réécriture du 2026-09-25). Options : (i) une exception keyée de plus (motif D9 octies) ; (ii) un manifeste daté, figé, des sha relus de l ère avant PR (G2 citées), versé par une PR écrite et relu par MONARK ; (iii) laisser `main` rouge. **Défaut : hors de ce lot, à trancher par l investisseur. Je recommande (i)** : (ii) est un gros travail d archive pour un passage unique.
- **Q-9 (`pull_request_target` ou juge pris sur le tronc)** : fermerait le résidu R-1 (une PR modifie sa propre gate). **Défaut : non dans ce lot.** Le juge pris sur la cible casserait l ordre prévu (la synchro vers une base sans module compterait tout), et `pull_request_target` demande un second workflow hors zone.
- **Q-10 (clé D4 de l oracle)** : ajouter la part `r25_proof` invalide une fois les records G1/corr en magasin. **Défaut : accepté.**

## 11. Risques

- R-1 : une PR peut toujours modifier sa propre gate sous `pull_request`. La garde `gate-files` et le contrôle MONARK par diff le couvrent, pas une preuve (Q-9).
- R-2 : quota de l API pour `GITHUB_TOKEN` (1 000 requêtes par heure et par dépôt). Une intégration coûte environ 2 + (pages de PR fermées) + (PR dans `R`) requêtes (≈ 140 pour `main`, ≈ 20 pour C2). Au-delà, `W`.
- R-3 : le temps du job (`timeout-minutes: 5`) pour ≈ 1 600 commits avec `--remerge-diff`. Le prototype a mesuré l avance de `main` (1 599 commits, deux pathspecs) en 17 s en local ; à re-mesurer au G1 sur le runner.
- R-4 : git < 2.36 sur la machine Windows de l oracle : `W` partout (porte plus stricte que la CI, jamais plus laxiste).
