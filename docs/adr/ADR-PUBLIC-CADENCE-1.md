claude-opus-5-5[1m]

# ADR-PUBLIC-CADENCE-1 — Activité régulière du miroir public : un commit et une release par lot, dépôt de relevés signés, CI exportée, feuille de route publique (G0)

- **Statut** : proposé (G0, plan de sprint sans code). Ce G0 n'écrit que ce fichier, le journal `docs/G0-lot-public-cadence-1.md` et les deux textes d'issue du §6.4, rien de committé (R-20). Les amendements qu'il propose à ADR-M010, à ADR-M004 D7 et à `CONTRIBUTING.md` sont rédigés au §9 et appliqués par l'orchestrateur avec la PR qui les porte. Soumis à la vérification adversariale (R-21), puis au checkpoint-1 du validateur-humain.
- **Dates** : décision proposée 2026-09-26 · approbation : — · dernière modification 2026-09-26.
- **Propriétaires** : l'investisseur (décision 237 ; visibilité, secrets, jetons, création de dépôt, fonctions GitHub) ; l'orchestrateur `claude-fable-5-1` (planification, G7, push, tag, Release et issues sous go). Le worker ne tranche rien : tout choix ouvert est une question du §11.
- **Rédaction** : worker `claude-opus-5-5[1m]` (R-1), effort max, contexte frais. Mission `F:\tmp\public\mission-g0-public-cadence-1.md`, sha256 `e268ec2d055f1d23b25ff8c831e94a478c1d0651aa4b334e782031ad24356f89`. Horloge `date -u` : 20:24:34Z (ouverture), 20:47:12Z à 20:49:52Z (sources), 21:03:47Z (dernière mesure des textes), 21:04:15Z (début d'écriture). Base : worktree `F:\Monark-wt-public`, branche `lot/public-cadence-1`, HEAD `cfbbde9`, arbre propre à l'ouverture. Aucun `GIT_DIR`, aucun `--write-tree` ; copie de travail par `git archive cfbbde9 | tar -x` sous `F:\tmp\public-cadence-g0\`.
- **Mesures** : `M-n` renvoie au journal `docs/G0-lot-public-cadence-1.md` §3 (commande, extrait de sortie, heure) ; `[lu]` = lu de première main par ce worker (fichier du dépôt à `cfbbde9`, ou GET d'une page primaire, journal §4).
- **Gate** : G0 (doc 02). **Éléments affectés** : `scripts/release-public.mjs` (+ `.d.mts`), `test/release-public.test.ts`, nouveau `test/release-public-flow.test.ts`, nouveau module non exporté `scripts/public-text-deny.mjs`, `test/site-build-fleet.test.ts` (extraction de listes), `test/export-public.test.ts` (42 f), `CONTRIBUTING.md`, `docs/public-notes/**`, `.github/ISSUE_TEMPLATE/**` (sous Q-11), ADR-M010, ADR-M004 D7 (sous Q-11), dépôt `KraidleAI/monark-record` (à créer, sous Q-7 à Q-9).
- **Rattachement** : décision 237 (`docs/CHANTIERS.md:1641`) ; protocole dépôt du 2026-09-18 (ADR-M010, amendement et rectification du même jour) ; décision 232 (`CHANTIERS.md:1621`) ; décision 202 (`CHANTIERS.md:1449`) ; ADR-M004 D7 et addenda ; ADR-M010 ; ADR-M018 D3 (tuyaux) ; ADR-BELL-OTS-ANCHOR-1 D1 à D3 ; ADR-DOJO-SNAPSHOT-1 D-8 ; décision 49 (deux chantiers).

## 0. Décisions proposées, une ligne chacune

- **D1 (commit par lot)** : `scripts/release-public.mjs` reste l'outil unique ; il exige `--message <fichier>` (anglais, écrit par l'orchestrateur), le passe à la porte des textes publics (D1.3), exécute `export:check` puis `export`, écrit le commit dans le clone local du miroir et **s'arrête avant le push**. Le message fixe « Public sync <ISO> » et la clause B-3 d'ADR-M010 sont retirés.
- **D2 (releases)** : un tag `v0.MINOR.PATCH` par lot qui change l'export ; MINOR si le lot ajoute ou change une fonction publique, PATCH sinon ; notes `docs/public-notes/<tag>.md` passées à la même porte ; tag annoté créé **en local** ; `git push` et `gh release create` restent des actes de l'orchestrateur avec go ; `--confirm <tag>` pose le tag de gouvernance après lecture du tag et de la Release distants.
- **D3 (monark-record, cadre)** : dépôt public `KraidleAI/monark-record` au contenu fermé (lignes signées de la timeline Bell, manifestes et preuves OpenTimestamps, trousseau public, `SHA256SUMS`, README court), un commit par session Bell ; ni states ni provenance ; pousseur et jeton = Q-7 à Q-9 ; PR-B conditionnelle aux réponses ; Dōjō ensuite.
- **D4 (CI du miroir)** : **déjà servie** (workflow dérivé « gates » vert à chaque push, badge) ; le lot ajoute une assertion (aucune référence `secrets.` dans le workflow dérivé) et fige la liste des commandes de rejeu.
- **D5 (issues et Discussions)** : textes anglais `docs/public-notes/issues/*.md` passés à la porte (deux livrés) ; gabarit `.github/ISSUE_TEMPLATE/` (liste blanche : Q-11) ; règle de modération dans `CONTRIBUTING.md` ; Discussions **déjà activées** (mesuré) : confirmation et curation = acte investisseur.
- **DI, DA, DO** : invariants et leurs tests (§7) ; actes investisseur (§8) ; ordre PR-A1, PR-A2, PR-C, puis PR-B après réponses (§10).

## 1. Contexte mesuré commun (à `cfbbde9` et sur l'API GitHub, 2026-09-26 entre 20:24Z et 21:04Z)

- **Miroir** : `KraidleAI/Monark` (`full_name` rendu par l'API à la requête `repos/KraidleAI/monark`), public, Apache-2.0, 1 étoile, 0 issue ouverte, dernier push 2026-09-24T05:36:16Z (M-3). 25 commits : 15 commencent par « Public sync » (11 horodatés par l'outil, avec la ligne `Co-Authored-By: Claude Opus 4.8` ; 4 « Public sync: README… » sans cette ligne, donc faits hors de l'outil), 10 sont antérieurs au 2026-09-16 (M-4). Le constat de la décision 237 (« 25 commits Public sync ») se lit « 25 commits, dont 15 Public sync ».
- **Releases déjà en place** (ADR-M010) : 5 tags annotés (`v0.1.0`, `v0.3.0` à `v0.6.0`) et 5 Releases, `v0.5.0` en pré-version, `v0.2.0` sauté par exception datée (M-5).
- **CI du miroir déjà servie** : workflow « gates » (`.github/workflows/ci.yml`, dérivé par `derivePublicWorkflow`, ADR-M004 D7 bis R1) et CodeQL par défaut, exécutions récentes toutes `success` ; `main` protégée par 4 contrôles requis (g1, g3-verification, g4, g6), application `non_admins` (M-6, M-7) ; badges CI, licence et dernière Release au README (`README.md:5-9`).
- **Communauté** : Discussions **activées** (6 catégories par défaut, 0 discussion), Issues activées sans gabarit, aucun code de conduite, aucune limite d'interaction ; wiki activé, dépôt wiki introuvable par `git ls-remote`, donc vraisemblablement aucune page (M-8, M-11).
- **Sécurité** : miroir : secret scanning, push protection, motifs non-fournisseur et contrôle de validité **activés** ; gouvernance (privée) : tout désactivé ; organisation : plan `enterprise`, 2FA non exigée, secret scanning non activé par défaut pour un nouveau dépôt (M-9, M-10).
- **Topologie** : `main` = `4777c6e` (2026-09-24T05:36:10Z, la minute du dernier push public) ; `lot/etude-suite` a 291 commits d'avance et `main` en est ancêtre (M-12). Un export frais de `cfbbde9` (486 fichiers + manifeste) diffère du miroir de +73 / −3 / ~91 fichiers (M-15, M-16) : la première publication sera un rattrapage.
- **Rejeu local de la CI publique** sur une copie de l'export, `node_modules` fait de jonctions seulement (tiers : installation de gouvernance ; `@monark/*` : liens vers l'export) : g1, `gate:vocab` (268 fichiers), `typecheck`, `npm test` (509 tests, 503 passés, 0 échec, 6 sautés : 5 par absence voulue d'un fichier de gouvernance, 1 propre à win32), `lint` et `lint:ratchet` verts ; SBOM 185 composants. Non rejoués : `npm ci`, `npm audit`, g3-site (M-17).
- **Ce que l'export publie déjà** : des noms d'opérateurs dans le code (par exemple `helius` dans 38 fichiers, dont 29 sous `packages/rpc-guard`) et 85 jetons en forme d'identifiant d'item dans 78 fichiers ; les textes de prose publics (README, CONTRIBUTING, SKILL) n'en portent aucun, `SECURITY.md` cite une fois `ADR-M010` (M-21). L'invariant « aucun fournisseur, aucun identifiant d'item » de la décision 237 n'est donc tenable **que pour les textes libres** de ce lot ; le contenu du code exporté relève d'ADR-M004 D7, que ce lot ne change pas (Q-13).
- **Outil actuel** (`scripts/release-public.mjs`) : portes locales `npm run ci`, `lang:gate`, `lint-ratchet`, `eslint`, **sans `export:check`** (l.222-225) ; message fixe et ligne `Co-Authored-By` codés en dur (l.300-302) ; push, tag, Release et restauration intégrés (l.306, l.318-356) ; miroir par défaut sous le dossier personnel si `MONARK_PUBLIC_MIRROR` manque (l.35 ; la variable vaut ici un chemin sur F:, M-22).

## 2. Point 1 — Un commit public par lot, au G7

### 2.1 Contexte mesuré
- Sur les 25 messages publics, 16 seraient refusés par la porte D1.3 (15 « Public sync », 1 « live ») ; 15 vecteurs de test sur 15 donnent le verdict attendu (M-23).
- La regex de la mission `[A-Z]+-[A-Z0-9-]+-\d` attrape `ADR-BELL-OTS-ANCHOR-1`, `C-G2-3`, `GITHUB-SECRET-SCAN-1`, mais laisse passer `PR-1b-1`, `U-4b-2a`, `ADR-M004`, `R-25`, « decision 237 », `G7`, et refuse à tort `CVE-2026-12345` (M-23).
- Les noms de fournisseurs de données et d'opérateurs vivent dans un test racine non exporté (`test/site-build-fleet.test.ts:267-275`, `:1403-1408`) parce que `vocab-banned.json` est exporté et publierait ce qu'il interdit (`$comment_providers` de ce fichier) [lu].
- `main` n'avance qu'aux publications (M-12) et la garde de branche exige `main` propre (`release-public.mjs:178`, ADR-M010 B-2).

### 2.2 Décision
1. **Un seul outil** : `release-public.mjs` est amendé ; aucun second script (deux chemins de publication, c'est un contournement possible et une duplication, R-3).
2. **Message** : `--message <fichier>` obligatoire ; le fichier est committé en gouvernance, `docs/public-notes/<tag>.commit.md`, écrit par l'orchestrateur au G7 (extension `.md` : hors du décompte R-25, qui exclut `docs/**/*.md`) ; titre de 50 caractères au plus, puis ligne vide et corps facultatif (`git-commit`, DISCUSSION : « a single short (no more than 50 characters) line summarizing the change », conseil adopté ici comme borne, [lu]) ; l'outil n'ajoute rien, pas même une ligne `Co-Authored-By` (Q-2).
3. **Porte des textes publics** `checkPublicText(text, kind)`, pure, fail-closed, raisons imprimées, appliquée au message, au message de tag, au titre de Release, aux notes, aux textes d'issue et au README de `monark-record` :
   - (a) `checkReleaseText` actuel (langue, GLOBAL, portées `site` et `skills`) **plus** la portée `bell` ;
   - (b) la regex de la mission, avec l'exception déclarée `CVE-AAAA-N` ;
   - (c) un jeu interne fermé : `ADR-…`, « decision/décision N », `G0` à `G7`, `R-N`, `CA-N`, `checkpoint-N`, identifiants de lot à minuscule (`U-4b-2a`, `PR-1b-1`), `monark-governance` ;
   - (d) « public sync », insensible à la casse ;
   - (e) chemin de lecteur Windows (`WINDOWS_ABS_PATH_RE` d'`export-public.mjs`) ;
   - (f) noms de fournisseurs : module **non exporté** `scripts/public-text-deny.mjs`, source unique des listes aujourd'hui locales à `test/site-build-fleet.test.ts`, qui l'importe (R-3) ; les noms d'opérateurs de la portée `site` s'appliquent déjà par (a) ;
   - (g) formes de secret : `KEY_SHAPES` (`apps/bell/scripts/bell-publish.mjs:89`) sans son motif `://`, remplacé par une liste blanche d'URL (`https://…monarkgate.tech`, `https://github.com/KraidleAI/Monark`), toute autre URL refusée ;
   - (h) pour `kind = issue` seulement : ni date ni échéance (date ISO, année, mois, `Q1` à `Q4`, « soon », « next week/month/quarter/year »).
4. **Portes locales** : `npm run export:check` (portée globale) **avant** `export --out` ; ordre et échec fermé testés (CA-1.3).
5. **Chemins** : `MONARK_PUBLIC_MIRROR` obligatoire (le repli sur le dossier personnel disparaît) ; répertoire d'étape voisin du clone du miroir (même lecteur), et non plus `os.tmpdir()`.
6. **Arrêt avant le push** : l'outil synchronise le clone (fetch, reset, overlay, comme aujourd'hui l.249-267), garde la vérification d'identité noreply (l.273), committe par `git commit -F`, imprime le plan (SHA, commande `git -C <miroir> push origin HEAD:main`) et sort en code 0. Aucun `git push`, aucun appel `gh` qui écrive.
7. **Fenêtre de publication** (précondition, Q-1) : au G7 d'un lot qui change l'export, l'orchestrateur avance `main` en avance rapide seulement ; tout ce qui a fusionné depuis le dernier commit public doit être publiable (textes du site validés par l'investisseur et téléversés), sinon la publication attend.

### 2.3 Tuyaux (ADR-M018 D3)
| Entrée (producteur) | Sortie (consommateur) | État | Test d'intégration non-LLM | Verdict aujourd'hui |
|---|---|---|---|---|
| `docs/public-notes/<tag>.commit.md` (orchestrateur) et arbre `export-public.mjs --out` | commit local du clone, poussé par l'orchestrateur vers `KraidleAI/Monark` `main` (servi) | clone `MONARK_PUBLIC_MIRROR` | `test/release-public-flow.test.ts` : dépôt nu jetable et son clone sous `F:\tmp`, `gh` factice en tête de `PATH` qui journalise ses appels | chemin câblé, mais message fixe et push intégré ; porte et arrêt absents |

### 2.4 Critères d'acceptation (falsifiables)
- **CA-1.1** : chaque vecteur refusé (au moins un par règle (a) à (h)) donne un code non nul, HEAD du clone inchangé, aucun commit ; chaque vecteur accepté donne exactement un commit dont le message est octet pour octet le fichier.
- **CA-1.2** : après une exécution complète, `git ls-remote` du dépôt nu est identique avant et après ; le journal du `gh` factice ne contient que `auth status` et des lectures.
- **CA-1.3** : `export:check` s'exécute et réussit avant `export` ; un `export:check` rouge arrête l'outil avant toute écriture dans le clone.
- **CA-1.4** : `MONARK_PUBLIC_MIRROR` absent, ou identité git non noreply : refus.
- **CA-1.5** : `scripts/public-text-deny.mjs` est absent de `collectFiles(ROOT).kept` ; `test/site-build-fleet.test.ts` l'importe et ne garde plus de liste locale.
- **CA-1.6** : tout fichier de `docs/public-notes/**` passe la porte à chaque `npm test` (test racine).

### 2.5 Mutants (un par garde)
M1-a à M1-h : retirer la règle (a) à (h), le vecteur refusé correspondant passe, CA-1.1 rougit. M1-i : retirer l'exception CVE, le vecteur accepté « Fix CVE-… » est refusé, rouge. M1-j : retirer `export:check` des portes, CA-1.3 rouge. M1-k : rétablir `git push`, CA-1.2 rouge. M1-l : accepter un message vide, rouge. M1-m : neutraliser la garde d'identité, rouge. M1-n : ajouter le module de refus à `WHITELIST_FILES`, CA-1.5 rouge.

### 2.6 MAST (Cemri et al., arXiv:2503.13657, taxonomie [lu])
- FM-1.1 (disobey task specification : l'outil pousse encore) : CA-1.2, oracle comportemental sur dépôt nu.
- FM-1.2 (disobey role specification : l'outil agit comme l'orchestrateur) : `gh` factice, tout appel qui écrit rougit.
- FM-3.2 (no or incomplete verification : une seule sortie textuelle gardée) : une même porte pour tous les textes libres.
- FM-3.3 (incorrect verification : essai à blanc vert, exécution réelle rouge) : mêmes fonctions pures dans les deux chemins (ADR-M010 §5, conservé).
- FM-2.4 (information withholding : refus silencieux ou message tronqué) : refus fermé avec la règle et le mot en cause.

## 3. Point 2 — Releases taguées

### 3.1 Contexte mesuré
- 5 tags et 5 Releases (M-5) ; la règle en vigueur : « one tag per lot that changes the public surface […], never per sync » (ADR-M010 §2.3) ; l'outil pousse lui-même tag et Release et porte la restauration N-1/N-2 (`release-public.mjs:318-356`).
- `gh release create` : `--verify-tag` « Abort in case the git tag doesn't already exist in the remote repository » ; `--notes-file`, `--prerelease`, `--latest` (aide locale de gh 2.96.0 [lu] ; manuel en ligne, journal §4).
- SemVer 2.0.0 §4 : « Major version zero (0.y.z) is for initial development. Anything MAY change at any time. » ; §6 et §7 : PATCH pour des corrections compatibles, MINOR pour une fonction nouvelle et compatible de l'API publique [lu].

### 3.2 Décision
1. **Cadence** : un tag par lot dont le G7 change l'export ; un lot qui ne change pas l'export ne publie rien (N-2 conservé : « "nothing to publish" is not a release », `release-public.mjs:283`).
2. **Numérotation** : `v0.MINOR.PATCH` (série 0.x maintenue ; `1.0.0` reste une décision humaine). **MINOR** si le lot ajoute ou change une fonction observable par un appelant ou un lecteur (pièce servie, outil, contrat, format d'un fichier servi, famille de pages) ; **PATCH** sinon (correction, durcissement, texte, documentation, tests, CI). Justification : SemVer ne contraint pas la série 0.y.z (§4) ; transposer §6 et §7 donne au lecteur un signal ; « un MINOR par lot » ferait monter MINOR sans information. Premier rattrapage = `v0.7.0` (pages et classes servies depuis `v0.6.0`). La classe est écrite par l'orchestrateur dans le verdict G7 (Q-6).
3. **Successeur strict** : l'outil lit les tags distants (`git ls-remote --tags`, lecture) et n'accepte que le successeur immédiat, MINOR (PATCH à 0) ou PATCH, du plus haut tag ; tout saut exige une ligne datée d'ADR (précédent `v0.2.0`).
4. **Préparation seulement** : `--tag vX.Y.Z` exige `docs/public-notes/vX.Y.Z.md` (anglais, porte D1.3 avec `kind = notes`) ; l'outil crée le tag annoté **dans le clone local** sur le commit préparé, copie les notes validées dans le répertoire d'étape et imprime `git -C <miroir> push origin refs/tags/vX.Y.Z` puis `gh release create vX.Y.Z --repo KraidleAI/Monark --title vX.Y.Z --notes-file <copie> --verify-tag`. Pas de `--prerelease` par défaut : avec un commit par lot, une pré-version mise à jour en place n'a plus d'objet.
5. **Confirmation** : `--confirm vX.Y.Z` lit le tag distant (il doit pointer sur le commit préparé) et la Release (`gh api repos/KraidleAI/Monark/releases/tags/vX.Y.Z`), puis pose le tag de gouvernance local (ADR-M010 §2.1 c) ; sinon refus.
6. La restauration N-1 disparaît avec le push automatique : l'outil ne fait plus rien à distance. N-2 reste.

### 3.3 Tuyaux
| Entrée | Sortie | État | Test | Verdict aujourd'hui |
|---|---|---|---|---|
| `docs/public-notes/<tag>.md` (orchestrateur) | tag annoté local, puis push et `gh release create` par l'orchestrateur, objet Release (servi, badge du README) | tags du clone, tag de gouvernance local | test de flux du §2.3 : tag local présent, aucun tag distant, notes gardées ; `--confirm` contre le `gh` factice | câblé (l'outil pousse) ; à modifier |

### 3.4 Critères d'acceptation, mutants, MAST
- **CA-2.1** : `--tag` sans notes, notes rouges, tag non successeur, tag déjà présent en local ou à distance : refus avant toute écriture.
- **CA-2.2** : succès = un tag annoté local sur le commit préparé, zéro tag distant, commandes imprimées exactes.
- **CA-2.3** : `--confirm` sans Release distante : refus, aucun tag de gouvernance.
- Mutants : M2-a successeur non vérifié (`v0.9.0` accepté après `v0.6.0`) ; M2-b notes non gardées ; M2-c push du tag rétabli (CA-2.2 rouge) ; M2-d `--confirm` qui pose le tag sans lire la Release ; M2-e `isSemverTag` qui accepte `v1.0.0` (garde existante, `test/release-public.test.ts:38`).
- MAST : FM-3.1 (premature termination : tag posé, Release absente) couvert par `--confirm` ; FM-1.5 (unaware of termination conditions : publier sans changement) couvert par N-2 ; FM-3.3 : mêmes fonctions en préparation et en confirmation.

## 4. Point 3 — `monark-record` (cadre seulement ; code en PR-B, sous réponses)

### 4.1 Contexte mesuré
- `KraidleAI/monark-record` n'existe pas (404, M-11).
- Bell sert `timeline.jsonl`, `state.json`, `provenance.json`, `states/<sha>.json`, `provenance/<sha>.json`, `bell/pubkey.json` (`bell-publish.mjs:4-6`, `serve` l.225) ; une ligne de publication porte `seq`, `prev_line_hash`, `key_id`, `state_sha256`, `provenance_sha256`, `runs[{bell_sha, window, records}]` et `sig` (l.307-309) : aucun nom de fournisseur [lu].
- La provenance servie porte des étiquettes de fournisseurs : `providers.providers` (`bell-publish.mjs:58`, étiquettes nues l.95, contrôle l.138-139) ; mesuré : 2 étiquettes par run sur la copie de l'opérateur, noms non reproduits (M-26).
- Les manifestes `timeline-seq<n>-manifest.txt` et leurs preuves `.ots` naissent sur la machine opérateur (RUNBOOK étape 13 bis), sont committés sous `docs/bell-publications/` et servis sous `/bell/anchors/` ; la preuve est d'abord pendante, puis mise à niveau (ADR-BELL-OTS-ANCHOR-1 D2, D3, D6 ; registre `docs/bell-publications/ANCHORS.md`) [lu].
- L'éditeur Bell est hors réseau par construction (`deploy/monark-bell-publish.service:43`, `PrivateNetwork=yes`), lancé à la main (l.2-4), sa clé arrive par `LoadCredential` (l.27) (M-25).
- Sources primaires [lu] : le `GITHUB_TOKEN` a des permissions « limited to the repository that contains your workflow » et « expires when the job finishes » ; un jeton fin « can be further limited to only access specific repositories » avec expiration choisie ; une clé de déploiement en écriture « can perform the same actions as an organization member with admin access » ; dans un dépôt public, « scheduled workflows are automatically disabled when no repository activity has occurred in 60 days », et la planification peut être retardée en période de charge.

### 4.2 Décision (cadre)
1. **Dépôt** : `KraidleAI/monark-record`, public, créé par l'investisseur (Q-9) ; secret scanning et push protection activés à la création, le défaut de l'organisation étant désactivé (M-10).
2. **Contenu, liste fermée** : `bell/timeline.jsonl` (octets servis, ajout seul) ; `bell/anchors/timeline-seq<n>-manifest.txt` et `.ots` ; `bell/keyring.json` (copie du trousseau committé au miroir, tag source nommé au README) ; `SHA256SUMS` (tous les fichiers, triés) ; `README.md`. **Jamais** : `states/`, `provenance/` (étiquettes de fournisseurs), données brutes, grand livre, clé privée, URL d'opérateur, chemin de poste. Un fichier hors liste fait refuser tout le commit.
3. **Un commit par session Bell** : une publication de Bell ajoute une ligne à la timeline, et « session » se lit ainsi ; un commit par nouvelle ligne (publication ou ligne de clé) ; il porte la ligne, son manifeste et sa preuve pendante, plus la mise à niveau éventuelle de la preuve précédente ; message à gabarit fixe (`Record: Bell line <n>`), passé à la porte D1.3 (mesuré vert, M-24).
4. **Contrôles avant commit** : marche de la chaîne et des signatures par `bell-verify.mjs` contre le trousseau committé ; préfixe identique au contenu du dépôt (ajout seul) ; entrée `timeline.jsonl#L<n>` du manifeste égale au `line_hash` ; balayage `KEY_SHAPES` et chemins Windows sur chaque fichier texte.
5. **Pousseur (Q-7)**. (A) flux GitHub Actions planifié dans `monark-record`, `GITHUB_TOKEN` avec `permissions: contents: write` : aucun secret à garder ; limites : planification retardable, désactivée après 60 jours sans activité, preuves visibles seulement après téléversement du site. (B) tâche planifiée sur la machine opérateur, jeton fin limité au dépôt, `Contents` en écriture, expiration choisie : pas de retard sur les preuves, mais un secret de longue durée sur le poste. (C) hôte Bell : rejeté (éditeur hors réseau, garde de la clé de signature). Clé de déploiement en écriture : rejetée (pouvoirs d'administrateur du dépôt). Recommandation du worker : (A), faute de secret à garder ; l'investisseur tranche.
6. **Go permanent borné** : l'écriture automatique vers `monark-record`, et vers lui seul, exige un go permanent de l'investisseur (A-7) ; toute autre écriture GitHub reste un acte ponctuel sous go.
7. **README** (brouillon anglais, 12 lignes, passe la porte, M-24) : « Signed, hash-chained records published by MONARK Bell, one commit per session, with their OpenTimestamps proofs », puis quatre gestes de vérification (vérificateur du miroir à un tag, trousseau, client OpenTimestamps, `sha256sum -c SHA256SUMS`) et « A signature attests origin, not truth. »
8. **Dōjō ensuite** : répertoire `dojo/`, lignes `dojo-timeline-v1` vérifiées par le marcheur propre du Dōjō (ADR-DOJO-SNAPSHOT-1 D-8 ; `walkTimeline` de Bell ne les marche pas, M1 de cet ADR) ; déclencheur : première ligne Dōjō servie et vérificateur Dōjō exporté.

### 4.3 Tuyaux
| Entrée | Sortie | État | Test d'intégration non-LLM | Verdict aujourd'hui |
|---|---|---|---|---|
| lignes servies par Bell ; manifestes et preuves (machine opérateur, `/bell/anchors/`) | commits de `monark-record` (dépôt public, servi) | clone ou dépôt `monark-record` | fixture de deux lignes signées d'une clé de test, un manifeste et une preuve `fixture-*`, vers un commit dans un dépôt jetable sous `F:\tmp` | absent |

### 4.4 Critères d'acceptation, mutants, MAST (pour PR-B)
- **CA-3.1** : la fixture donne exactement un commit ; ses fichiers = la liste fermée ; `sha256sum -c SHA256SUMS` et `bell-verify` verts sur le contenu committé.
- **CA-3.2** : une seconde exécution sans ligne nouvelle ne committe rien.
- **CA-3.3** : aucun commit sur signature fausse, préfixe réécrit, fichier hors liste (`states/…`), chaîne en forme de clé, URL d'opérateur ; deux lignes nouvelles donnent deux commits.
- Mutants : M3-a signature non vérifiée ; M3-b liste fermée ouverte ; M3-c ajout seul non vérifié ; M3-d commit sur exécution vide ; M3-e balayage `KEY_SHAPES` retiré ; M3-f deux lignes dans un seul commit.
- MAST : FM-1.2 (un automate qui committe) : go permanent borné et liste fermée ; FM-3.2 : vérification avant commit ; FM-2.3 (task derailment : le dépôt de relevés devient un miroir de données) : exclusion de `states/` et `provenance/`.

## 5. Point 4 — CI du miroir

### 5.1 Contexte mesuré
- Le workflow public existe, tourne à chaque push et porte un badge (M-6, `README.md:6`). Il est dérivé du workflow interne ; ses jobs restent octet pour octet ceux de la source (`export_public_derived_jobs_are_byte_identical`) ; `permissions: contents: read` est épinglé pour la source et pour le dérivé (`test/ci-gates.test.ts:1682-1702`). `ci.yml` ne contient aucune occurrence de `secrets` (M-29), mais **aucune assertion** ne l'impose.
- Tests exportés seulement : la commande `npm test` exportée ne trouve que les tests gardés ; au rejeu, 0 échec et 5 sauts par absence voulue d'un fichier de gouvernance (M-17). Le test 42 (e) exécute déjà `npm ci` puis `npm run ci` dans l'export à chaque `npm test` de gouvernance (`test/export-public.test.ts:333-372`).
- Verrou : à `cfbbde9`, le lockfile déclare l'espace de travail `apps/dojo` (entrée nue, sans dépendance, ajoutée par `666fcfa`), absent de l'export. Précédent mesuré : à `ea29fbd`, le lockfile public déclarait `apps/bell`, absent de l'arbre public, et `npm ci` a réussi dans les 4 jobs (M-18). npm documente l'échec de `npm ci` quand lockfile et `package.json` divergent [lu] ; le cas « espace de travail absent » n'y est pas décrit, d'où l'oracle ci-dessous.
- Prochaine publication : `apps/dojo` apparaîtra dans `package.json` (glob de test), `tsconfig.json`, le lockfile et l'artefact SBOM de la CI (M-19) ; le workflow public gagnera le bloc `permissions` et `fetch-depth: 0` (M-20).

### 5.2 Décision
1. Rien à créer. Le lot ajoute à 42 (f) : « le workflow dérivé ne contient aucune référence `secrets.` » (PR-A1).
2. Commandes de rejeu (copie `git archive`, puis export ; jamais sur un worktree) : `bash enforcement/lint-model-pinning.sh .` ; `npm ci` ; `npm run gate:vocab && npm run typecheck && npm test` ; `npm run lint && npm run lint:ratchet` ; `npm sbom --sbom-format cyclonedx --omit dev --package-lock-only` ; `npm audit --audit-level=high` ; `npm run build -w @monark/site` puis `node scripts/assert-fleet-html.mjs`. `npm ci`, `npm audit` et la construction du site demandent le réseau et un `node_modules` propre à l'export : ils se rejouent en G2 de PR-A1 ou par 42 (e), jamais par jonction.
3. L'oracle concluant du verrou `apps/dojo` est 42 (e) au prochain `npm test` complet, puis la CI publique de la première publication (item PUBLIC-CI-DOJO-LOCK-1, déclencheur : cette publication).

### 5.3 Tuyaux, critères, mutants, MAST
| Entrée | Sortie | État | Test | Verdict aujourd'hui |
|---|---|---|---|---|
| `.github/workflows/ci.yml` interne, `derivePublicWorkflow` | workflow du miroir, exécutions Actions et badge (servi) | fichier du miroir | 42 (e), 42 (f), 42 (f′), `ci_workflow_declares_least_privilege_permissions` | câblé (mesuré) |
- **CA-4.1** : 42 (e) vert au gel de PR-A1 ; **CA-4.2** : l'assertion `secrets.` est verte. Mutants : M4-a une étape `${{ secrets.X }}` ajoutée au workflow interne, rouge ; M4-b (existant) bloc `permissions` retiré, rouge. MAST FM-3.2 : 42 (e) est la seule preuve que l'export tourne seul ; il ne se saute pas.

## 6. Point 5 — Issues et Discussions

### 6.1 Contexte mesuré
- Discussions activées (6 catégories par défaut), 0 issue, aucun gabarit (M-8) ; `CONTRIBUTING.md` renvoie déjà vers Issues et Discussions (l.7-12) et `SECURITY.md` interdit l'issue publique pour une vulnérabilité (l.15-16) [lu].
- Le registre public compte 12 pièces `upcoming` (`apps/site/lib/fleet.ts` : 7 côté moteur, 5 applications) ; le Dōjō n'y figure pas ; « Bell collector » n'est pas une pièce du registre mais une ligne de la feuille de route (`apps/site/app/roadmap/page.tsx:198`) et du tableau de `/bell` (« the collector core, so that a third party recomputes digests offline, is not exported yet », `apps/site/app/bell/page.tsx:645-646`) [lu].
- Un gabarit d'issue vit dans `.github/ISSUE_TEMPLATE/` du dépôt ; un `config.yml` avec `blank_issues_enabled: false` réserve l'issue vierge aux rôles en écriture ; les formulaires d'issue sont « in public preview and subject to change » [lu]. La publication remplace tout l'arbre du miroir (`release-public.mjs:258-266`) : un fichier absent de la liste blanche disparaît, donc un gabarit exige une ligne de liste blanche, en conflit avec l'invariant « liste blanche inchangée » (Q-11).
- Limites d'interaction temporaires de 24 heures à 6 mois ; wiki d'un dépôt public modifiable par les seuls collaborateurs par défaut [lu].

### 6.2 Décision
1. **Textes** : un fichier anglais par pièce sous `docs/public-notes/issues/`, première ligne `# <titre>`, porte D1.3 avec `kind = issue` : ce que la pièce apporte, sans date ni échéance, sans ordre interne, sans fournisseur, sans budget, sans bloc « ce que la pièce ne fait pas » (décision 232) ; « piece », jamais « agent » pour une pièce (décision 202). Livrés : `bell-collector-core.md`, `dojo.md` (§6.4). Les 12 pièces du registre : Q-10.
2. **Gabarit** : Markdown (stable), pas de formulaire YAML (préversion) : `config.yml` (`blank_issues_enabled: false`, liens vers l'avis de sécurité privé et vers Discussions) et `report.md` (ce que vous avez lancé, attendu, obtenu). Brouillons mesurés verts à la porte (M-24).
3. **Modération** (paragraphe anglais ajouté aux « Ground rules » de `CONTRIBUTING.md`, mesuré vert, M-24) : le mainteneur modère Issues et Discussions ; promotion hors sujet, spam, discussion de prix et demande de conseil en investissement sont masqués ou retirés ; l'abus répété entraîne une limite d'interaction temporaire ; une vulnérabilité signalée en public est déplacée vers un avis de sécurité privé. Modérateur et catégories : Q-12.
4. **Actes** : création des issues et des étiquettes = orchestrateur sous go (`gh issue create --title … --body-file …`) ; Discussions : confirmation et curation = investisseur (A-3).

### 6.3 Tuyaux, critères, mutants, MAST
| Entrée | Sortie | État | Test | Verdict aujourd'hui |
|---|---|---|---|---|
| `docs/public-notes/issues/*.md` (orchestrateur) | issues du miroir créées sous go (servi) | GitHub | test racine : chaque fichier passe la porte `kind = issue` ; 42 : gabarit exporté (si Q-11 = A) | absent |
- **CA-5.1** : chaque fichier de `docs/public-notes/issues/` passe la porte ; **CA-5.2** : gabarit exporté, en anglais, `blank_issues_enabled: false` ; **CA-5.3** : le paragraphe de modération passe les portes langue et vocabulaire.
- Mutants : M5-a une date, un nom de fournisseur ou un mot français dans un texte, rouge ; M5-b gabarit retiré de la liste blanche, 42 rouge ; M5-c `blank_issues_enabled: true`, rouge.
- MAST : FM-2.3 (l'issue devient un calendrier promis) couvert par la règle (h) ; FM-1.1 (règle 232 ignorée) couvert par la porte.

### 6.4 Textes livrés (non committés)
- `docs/public-notes/issues/bell-collector-core.md` (9 lignes, sha256 `387681a19e32d04d4b3b4f59de02cba0fbea4549094212281b508c49414138ec`) et `docs/public-notes/issues/dojo.md` (7 lignes, sha256 `1db3f8539b104f3c95b5a37b0fdf967713155b9577e0c5d7e1c1e761e28da8c7`) passent la porte D1.3 telle que mesurée (M-24). Lecture retenue de « Livre les textes » : fichiers écrits dès ce G0 ; s'ils doivent naître en PR-C, ils y migrent tels quels (Q-17).

## 7. Invariants (chacun avec le test qui le prouve)

| Invariant | Test ou contrôle qui le prouve |
|---|---|
| Liste blanche et exclusions inchangées | à la G2 de chaque PR : `git diff --exit-code <base> <gel> -- scripts/export-exclude-tests.json scripts/export-exclude-data.json` rend 0 ; la différence des ensembles `collectFiles(ROOT).kept` entre base et gel est vide (PR-A1, PR-A2, PR-B) ou égale exactement aux fichiers de gabarit nommés (PR-C, si Q-11 = A) ; `STRUCTURAL_BLACKLIST` inchangée. |
| `export:check` avant toute publication | CA-1.3 (ordre journalisé par le test de flux) ; mutant M1-j. |
| Aucun secret | `no_secret_in_repo` (arbre entier, qui contient l'export) ; porte D1.3 (g) sur tous les textes libres ; push protection du miroir (mesurée active, M-9) ; balayage `KEY_SHAPES` du collecteur (CA-3.3). |
| Visibilité jamais touchée | ni l'outil ni le collecteur n'appellent `gh repo edit` ou une API de réglages : le `gh` factice du test de flux rougit sur tout appel autre que `auth status` ou une lecture ; l'orchestrateur relit `gh repo view --json visibility` avant chaque push (protocole du 2026-09-18). |
| Aucune écriture GitHub par un script sans go | CA-1.2 (refs du dépôt nu inchangées, aucun appel `gh` qui écrive) ; seule exception, le go permanent borné à `monark-record` (A-7). |
| Aucun nom de fournisseur ni identifiant interne dans les textes libres ; aucune date dans une issue | porte D1.3, test racine sur `docs/public-notes/**` (CA-1.6, CA-5.1). Portée déclarée : les textes libres de ce lot ; les mots de « cuisine » (budget, crédit, verrou) suivent Q-3 ; le code exporté relève de Q-13. |

## 8. Actes investisseur

- **A-1 (GITHUB-SECRET-SCAN-1)** : miroir déjà couvert (secret scanning et push protection actifs, M-9) : confirmer. Gouvernance privée : l'activation demande GitHub Secret Protection pour un dépôt privé d'organisation [lu] ; son coût n'est pas mesuré ici. `monark-record` : activer à la création.
- **A-2** : créer `KraidleAI/monark-record` (public) et choisir le pousseur (Q-7) ; en (B), créer le jeton fin (ce dépôt seul, `Contents` en écriture, expiration datée).
- **A-3** : Discussions déjà activées : confirmer, choisir les catégories, nommer le modérateur (Q-12), ou désactiver jusqu'à la publication de la règle de modération.
- **A-4** : wiki activé, vraisemblablement sans page (M-11) : confirmer l'édition réservée aux collaborateurs, ou désactiver (réglage non lisible par l'API).
- **A-5** : exiger la double authentification dans l'organisation (mesuré : non exigée, M-10) ; durcissement, pas un prérequis du lot.
- **A-6** : historique public : 3 commits du 2026-09-13 portent une adresse d'auteur non noreply (M-27, adresse non reproduite) ; réécrire l'historique public changerait les SHA de tous les tags : décision de l'investisseur (Q-15).
- **A-7** : go permanent pour les commits automatiques vers `monark-record`, et vers lui seul.

## 9. Amendements proposés (texte à dater et appliquer par l'orchestrateur)

- **ADR-M010, amendement (ADR-PUBLIC-CADENCE-1, avec PR-A2)** : « B-3 est remplacé : le message du commit public est un fichier anglais écrit par l'orchestrateur et passé à `checkPublicText`. §2.1 (a) et (b) : l'outil prépare le commit et le tag annoté en local, puis s'arrête ; push, tag distant et `gh release create` sont des actes de l'orchestrateur sous go ; §2.1 (c) : le tag de gouvernance est posé par `--confirm` après lecture du tag et de la Release distants. N-1 est retiré (l'outil ne fait plus rien à distance) ; N-2 reste. §2.3 : un tag par lot dont le G7 change l'export, MINOR ou PATCH selon ADR-PUBLIC-CADENCE-1 D2. §4 : `export:check` rejoint les portes locales. »
- **ADR-M004 D7, ligne (avec PR-C, si Q-11 = A)** : « `.github/ISSUE_TEMPLATE/config.yml` et `.github/ISSUE_TEMPLATE/report.md` entrent dans `WHITELIST_FILES` par leur nom ; aucun répertoire entier. »
- **`CONTRIBUTING.md`** (public, anglais) : §Releases, « the internal tool prepares the commit and the annotated tag; the maintainer pushes them and publishes the Release » ; §Ground rules, paragraphe de modération du §6.2 (3).

## 10. Ordre de mise en œuvre et R-25 par PR

Bornes : CI 1 205 lignes (`VIBEGATES_PR_LIMIT`, `.github/workflows/ci.yml`), interne 1 150 (`docs/CHANTIERS.md:1593`, « chaque PR < 1 150 à ×1,98 » ; `docs/G0-lot-site-release-1.md` §9) ; `docs/**/*.md` hors décompte ; dérive mesurée ×1,98 sur le Dōjō (`docs/CHANTIERS.md:1557`, `:1593`). Estimations de ce worker, à mesurer au G1.

| PR | Contenu | Estimation | ×1,98 | Couture pré-déclarée |
|---|---|---:|---:|---|
| PR-A1 | porte `checkPublicText`, module `public-text-deny.mjs`, extraction des listes, porte `export:check`, assertion 42 (f), test des notes, tests unitaires et mutants | ≈ 390 | ≈ 770 | — |
| PR-A2 | arrêt avant push, tag local, `--confirm`, chemins explicites, successeur strict, test de flux, `CONTRIBUTING.md` | ≈ 420 | ≈ 830 | au-delà de 1 150 : le test de flux seul passe en A2b |
| PR-C | gabarits, ligne de liste blanche, assertions, paragraphe de modération (textes sous `docs/` hors décompte) | ≈ 65 | ≈ 130 | — |
| PR-B1 | collecteur `monark-record` : noyau, `.d.mts`, tests et mutants (après Q-7 à Q-9) | ≈ 475 | ≈ 940 | noyau / exécuteur |
| PR-B2 | exécuteur (workflow Actions ou tâche planifiée) et README | ≈ 150 | ≈ 300 | — |

Ordre : A1, puis A2, puis C ; B après les réponses de l'investisseur. L'implémentation suit le G7 de PR-1b-1 du Dōjō, en second chantier (décisions 237 et 49). La première publication, `v0.7.0` (rattrapage), suit le G7 de PR-A2 et la fenêtre de publication (§2.2, 7).

## 11. Questions formées (nommer, pas deviner ; recommandation du worker entre crochets)

- **Q-1 (fenêtre de publication)** : `main` n'avance qu'aux publications et `lot/etude-suite` mêle plusieurs lots. Options : (a) au G7 d'un lot qui change l'export, avance rapide de `main` si tout ce qui a fusionné depuis le dernier commit public est publiable ; (b) lots publics fusionnés directement dans `main` ; (c) branche de publication par cherry-pick. [(a)]
- **Q-2 (ligne de provenance)** : garder une ligne `Co-Authored-By` (l'actuelle nomme `Claude Opus 4.8`, que la décision 133 du 2026-09-22 a remplacé pour les workers) dans les messages publics, écrite par l'orchestrateur dans le fichier du message, ou aucune ? [à trancher par l'investisseur]
- **Q-3 (décision 232 et « cuisine »)** : bannir aussi `budget`, `credit`, `lock`, `test` des messages et notes ? [bannir `budget`, `credit`, `lock` ; garder `test`, mot ordinaire d'un dépôt de code et du badge CI]
- **Q-4 (liste des fournisseurs)** : ajouter à la liste non exportée les fournisseurs d'hébergement, de registre, de CDN et de serveur web nommés en gouvernance (ADR-M004 D2 à D16) ? `Caddy` figure dans 15 fichiers exportés et dans `SECURITY.md` (M-21). [oui pour hébergement, registre et CDN ; non pour les protocoles et outils ouverts]
- **Q-5 (jeu interne)** : adopter le jeu (c) du §2.2 (3) avec l'exception CVE ; `G7` (sommet) serait refusé dans un texte public. [adopter]
- **Q-6 (numérotation)** : règle MINOR/PATCH du §3.2 (2), premier rattrapage `v0.7.0`, classe écrite au verdict G7. [adopter]
- **Q-7 (pousseur de `monark-record`)** : (A) GitHub Actions avec `GITHUB_TOKEN` ; (B) machine opérateur avec jeton fin ; (C) hôte Bell, rejeté. [(A)]
- **Q-8 (contenu de `monark-record`)** : exclure `states/` et `provenance/` (étiquettes de fournisseurs, M-26) ; ajouter les immuables plus tard si la disponibilité de l'hôte l'exige. [exclure]
- **Q-9 (création)** : nom `monark-record`, description, README du §4.2 (7), secret scanning à la création. [adopter]
- **Q-10 (portée des issues)** : (a) les deux pièces nommées par la mission (livrées) ; (b) aussi les 12 pièces `upcoming` du registre, textes tirés de `fleet.ts`. Le Dōjō est absent du registre : l'y inscrire `upcoming` avant son issue, ou publier l'issue seule ? [(a) maintenant ; Dōjō au registre d'abord]
- **Q-11 (liste blanche des gabarits)** : (A) deux fichiers nommés par une ligne d'ADR-M004 D7 ; (B) dépôt public d'organisation `.github` portant des gabarits par défaut [lu], sans toucher la liste blanche, mais valant pour tous les dépôts de l'organisation. [(A)]
- **Q-12 (Discussions)** : catégories à garder (Announcements, Q&A, Ideas, General ?) et à retirer (Polls, Show and tell ?), modérateur nommé, ou désactivation jusqu'à la règle de modération. [investisseur]
- **Q-13 (code exporté)** : l'export publie déjà des noms d'opérateurs dans le code et 85 identifiants d'item en commentaire (M-21) ; hors de ce lot ; ouvrir un lot de purge, ou accepter et le dire ? [investisseur]
- **Q-14 (Dōjō dans la prochaine publication)** : `apps/dojo` y apparaîtra dans `package.json`, `tsconfig.json`, le lockfile et le SBOM (M-19) avant toute mention publique : accepter, en publiant l'issue Dōjō au même moment, ou neutraliser ces mentions à l'export (transformation nouvelle, code) ? [accepter, si Q-10 retient le Dōjō]
- **Q-15 (historique public)** : laisser les 3 commits à adresse non noreply (adresse déjà publique ; réécrire change les SHA de tous les tags et casse les permaliens) ou réécrire ? [laisser]
- **Q-16 (organisation)** : double authentification exigée (A-5) et wiki (A-4). [exiger ; wiki désactivé s'il reste vide]
- **Q-17 (lecture de « Livre les textes »)** : textes d'issue écrits dès ce G0 (fait) ou nés en PR-C ? [G0, migration telle quelle possible]

## 12. Sources

- **Primaires en ligne, [lu] par GET de ce worker** (URL effective, heure et sha256 du HTML au journal §4 ; un GET de worker n'est pas une lecture sur place : item FAITS-PUBLIC-CADENCE-REREAD-1) : GitHub Docs, secret scanning (disponibilité : « Public repositories : Secret scanning runs automatically for free ») et push protection (« Requires GitHub Secret Protection to be enabled » pour la protection par dépôt) ; jetons d'accès personnels fins ; clés de déploiement ; `GITHUB_TOKEN` ; événements `schedule` ; gabarits d'issue et `config.yml` ; activation des Discussions ; limites d'interaction ; droits du wiki ; fichiers de santé communautaire par défaut. Manuel `gh release create`. SemVer 2.0.0. npm `npm ci` (v11). MAST, arXiv:2503.13657, annexe A (FM-1.1 à FM-3.3).
- **Primaires locales, [lu]** : aide `gh release create --help` (gh 2.96.0) ; documentation installée de git 2.55.0, `git-commit` section DISCUSSION.
- **Dépôt à `cfbbde9`, [lu]** : `scripts/export-public.mjs`, `scripts/export-public.d.mts`, `scripts/release-public.mjs`, `scripts/export-exclude-{tests,data}.json`, `scripts/grep-forbidden.mjs`, `scripts/lang-gate.mjs` (extraits), `vocab-banned.json`, `test/export-hygiene.test.ts`, `test/export-public.test.ts` (en-tête, 42 (e)), `test/release-public.test.ts` (en-tête), `test/ci-gates.test.ts:1676-1702`, `test/site-build-fleet.test.ts:263-310` et `:1399-1419`, `test/no-secret-in-repo.test.ts:1-60`, `.github/workflows/ci.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `CONTRIBUTING.md`, `SECURITY.md`, `README.md:5-9`, `package.json`, `package-lock.json` (entrées d'espaces de travail), `docs/G0-lot-export-clean.md`, `docs/G0-lot-site-release-1.md` (§0 à §9), ADR-M004 (D7 à D7 ter, index des addenda), ADR-M010 (entier), ADR-BELL-OTS-ANCHOR-1 (§0 à §1.5), ADR-DOJO-SNAPSHOT-1 (en-tête, D-1 à D-8), `apps/bell/scripts/bell-publish.mjs` (l.1-142, 200-330), `deploy/monark-bell-publish.service:1-60`, `docs/bell-publications/ANCHORS.md`, `apps/site/lib/fleet.ts` (statuts), `apps/site/app/roadmap/page.tsx:180-212`, `apps/site/app/bell/page.tsx:526-650`, `docs/CHANTIERS.md` (entrées 1426, 1449, 1557-1593, 1621, 1626-1627, 1641).
- **Gabarit** : `templates/adr.md` du corpus (Nygard 2011 étendu selon ISO/IEC/IEEE 42010:2022 §6.10) ; aucune affirmation de ce document ne repose sur un [2nd].

## 13. Alternatives rejetées

- Un second script `publish-lot.mjs` à côté de `release-public.mjs` : deux chemins de publication, dont un qui pousse encore (contournement, R-3).
- Garder le push dans l'outil derrière une confirmation interactive : l'outil tiendrait le go, contraire au protocole du 2026-09-18 (push = acte de l'orchestrateur).
- Message « = tag de gouvernance » (texte initial d'ADR-M004 D7) : publie un identifiant interne.
- Appliquer à la prose publique toutes les portées de `vocab-banned.json` : +1 refus mesuré (`cascade`, `Hermes`, règles propres à une surface de code, M-23).
- Formulaires d'issue YAML : fonction en préversion [lu].
- Hôte Bell comme pousseur ; clé de déploiement en écriture (§4.2, 5).
- Faire du miroir un dépôt de travail (PR fusionnées sur le miroir) : option 1 d'ADR-M010 maintenue.
- Pré-versions mises à jour en place (précédent `v0.5.0`) : un tag doit rester un permalien.

## 14. Conséquences et items formés

- **Positives** : un commit et une Release par lot, au message lisible et gardé ; la CI publique inchangée et prouvée ; un dépôt de relevés datés, vérifiable par un tiers avec le vérificateur publié et un client OpenTimestamps ; une feuille de route publique en mots publics.
- **Négatives** : plus d'actes de l'orchestrateur par lot (push, tag, Release, confirmation) ; un premier commit de rattrapage de +73 / −3 / ~91 fichiers ; la porte refusera des mots légitimes (réécrire autrement) ; la prochaine publication révèle `apps/dojo` (Q-14).
- **Items formés** (déclencheur entre parenthèses) : FAITS-PUBLIC-CADENCE-REREAD-1, relecture sur place par l'orchestrateur des pages du §12 (avant le checkpoint-1) ; PUBLIC-CI-DOJO-LOCK-1, oracle concluant du verrou `apps/dojo` (première publication) ; RELEASE-MIRROR-PATH-1, repli du miroir sur le dossier personnel supprimé (PR-A2) ; PUBLIC-WORKFLOW-NO-SECRETS-1, assertion 42 (f) (PR-A1) ; PUBLIC-RECORD-PIPE-1, tuyau absent du §4.3 (réponses Q-7 à Q-9, puis PR-B) ; PUBLIC-ISSUES-PIPE-1, tuyau absent du §6.3 (G7 de PR-A2 et réponses Q-10, Q-11, puis PR-C). Aucune dette nue : tout autre point ouvert est une question du §11 ou un acte du §8.
