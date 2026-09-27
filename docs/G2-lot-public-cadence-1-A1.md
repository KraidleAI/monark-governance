claude-opus-5-5[1m]

# G2 — PR-A1 du lot PUBLIC-CADENCE-1 (porte des textes publics, `export:check`, arrêt avant le push, visibilité) — relecture adversariale, instance fraîche

- **Relecteur** : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` ; R-1), contexte frais, différent du générateur ; effort high (décision 238). Horodatage de passe : 2026-09-27T00:30Z (ouverture effective 00:21:10Z, horloge `date -u`).
- **Mission** : `F:\tmp\public\mission-g2-pr-a1.md` (lue en entier, fait foi). **Aucune correction appliquée** : relecture, rejeux, mesures.
- **R-1 du G1** : première ligne du journal `docs/G1-lot-public-cadence-1-A1.md` = `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` conforme au roster du 2026-09-22).
- **Git** : lecture seule dans le worktree et dans `F:\Monark` (`status`, `log`, `diff`, `rev-parse`, `archive`) ; un clone `git clone --no-local` (sans `alternates`, vérifié) sous `F:\tmp\pca1\g2\clone`, **sans aucune écriture git** (ni `add -N`, ni commit ; R-25 mesuré sans index, §2) ; aucun `GIT_DIR`, `GIT_WORK_TREE`, `--write-tree`. Lecture seule du clone local du miroir `F:\monark-public-mirror` (`log`, `for-each-ref`) pour le corpus de Q-A1-3. **Aucun réseau** (aucun `gh` réel : tous les `gh` rejoués sont le factice, journal vérifié ; `npm` hors réseau). **Rien sur C:**. Rien sous un chemin portant un segment `public` (clones, copies, temporaires sous `F:\tmp\pca1\g2\`).

## 0. État du worktree

- **Avant** (00:21Z) : `F:\Monark-wt-public`, branche `lot/public-cadence-1`, HEAD `ae9e6ad` ; `git status --short` = exactement l'état annoncé par la mission (5 ` M` : `scripts/release-public.d.mts`, `scripts/release-public.mjs`, `test/export-public.test.ts`, `test/release-public.test.ts`, `test/site-build-fleet.test.ts` ; 5 `??` : `docs/G1-lot-public-cadence-1-A1.md`, `scripts/public-text-deny.d.mts`, `scripts/public-text-deny.mjs`, `test/public-text-deny.test.ts`, `test/release-public-flow.test.ts`).
- Empreintes relues : les neuf fichiers = `F:\tmp\public\pr-a1-work\FINAL.sha256` (9/9 OK, worktree, mon clone et ma copie de mutants) ; `DELIVERED.sha256` 10/10 OK ; journal G1 `5a42381c…17f3`, 214 l. ; ADR `b6e49f4e…84b6`, 345 l. ; harnais G1 `mutants-final.mjs` `57cff007…e171` ; `run-oracle.sh` `a391cf8c…6671` ; `mk-nm.ps1` `d70d8aea…fbe4` ; `rm-nm.ps1` `b51b5d22…8749` — tous conformes au journal.
- **Après** : (00:57:54Z) `git status --short` identique à l'état d'avant ; neuf fichiers 9/9 = `FINAL.sha256` ; journal G1 `5a42381c…17f3` inchangé. Rien écrit dans le worktree ni dans `F:\Monark`.

## 1. Table des 11 points

| # | Point | Verdict | Preuve |
|---|---|---|---|
| 1 | R-1 | **conforme** | ce rapport l.1 ; journal G1 l.1 `claude-opus-5-5[1m]` |
| 2 | R-25 | **conforme : 835** (cible 800 dépassée de 35, sous la coupe 900) | §2 |
| 3 | Tests rejoués et lus | **conforme avec lacunes** : 47/47 ciblés ; suite complète **1 352 / 1 350 / 0 / 2 sautés** sous verrou (attendu exact) ; vecteurs : (a) noms, (b), (c), budgets (Q-3), borne de titre, genres fermés couverts ; **« ordre interne » et « ce que Bell ne fait pas » (décision 232 (b), (c)) sans règle ni vecteur** (Q-G2-1) ; le test de flux prouve l'arrêt avant le push sur dépôt nu jetable (`ls-remote` identique, `gh` factice en lectures seules) mais **ne prouve pas** la vérification `git remote get-url origin` (G-1 survit, C-G2-1) | §3, §4 |
| 4 | Mutants | **46/46 du G1 rejoués tués** (mêmes tests rouges, `diff` vide sur les 44 hors T5 ; M1-n et M4-a sous verrou : 2/2 tués) ; **13 sondes G2 : 6 tuées, 7 survivantes** (G-1, G-5, G-7, G-9, G-10, G-11, et G-12 quasi équivalente, voir §4) | §4 |
| 5 | Fidélité ADR / décision 232 ; module hors export | **conforme sur l'ADR §2.2 (a)-(h), CA-1.1..1.7, §5.2 (1)** ; module absent de `collectFiles(ROOT).kept` (486 fichiers ; intersection changés ∩ exportés = ∅) et prouvé par deux tests (`site_names_no_data_source`, 42 (f)) ; aucun nom, budget ni chemin `C:` dans un fichier exporté ; **écarts** : trou de casse `POLYGON`/`polygon` en texte libre (C-G2-7), décision 232 (b)/(c) non mécanisées (Q-G2-1) | §3, §5 |
| 6 | Ordre et refus sans écriture | **conforme** : préflight (message → miroir → branche → identité → `gh` → visibilité) → portes (`export:check` en dernier) → export → synchro → commit local → arrêt ; visibilité lue avant toute préparation (CA-1.7 pli cp-1 : l'ordre de la mission « … → visibilité » se lit comme une énumération, l'ADR place la visibilité **avant**) ; refus du préflight et porte rouge : rien dans le miroir (testé) ; **refus « unexpected remote » : rien dans le miroir mais l'export d'étape reste à côté du clone** (mesuré, C-G2-2) | §5 |
| 7 | Hors périmètre intouché | **conforme** : `git diff --exit-code ae9e6ad -- apps deploy docs/public-notes package.json package-lock.json scripts/export-public.mjs scripts/export-exclude-*.json README.md CONTRIBUTING.md SECURITY.md .github` = 0 (worktree et clone) | §2 |
| 8 | Oracle | **7/7 exit 0 sous verrou d'hôte** ; `test` 1 352 / 1 350 / 0 / 2 ; **42 à part : `ok 1`, 224 s** ; M1-n, M4-a tués sous le même verrou | §6 |
| 9 | Hygiène | **conforme avec une réserve de journal** : aucun secret, URL, chemin local ni nom de fournisseur dans les lignes ajoutées hors la liste du module (mesuré) ; aucun fichier modifié n'est exporté ; `F:\Monark\node_modules` intact (220 entrées, 10 `@monark`, `typescript`) ; aucun `C:\Users\KACIMI\.python_history` (E-1 sans effet) ; **résidu non déclaré du G1** : `F:\tmp\pca1\mutant-default-mirror-stage-76548` (export complet, 23:47Z, mutant X-3 de l'exécution finale) alors que le §10 du journal ne nomme que `-168856` comme effacé (C-G2-11) | §7 |
| 10 | MAST, branchement | **branché** : `checkPublicText` consommé par `release-public.mjs` (message, avant toute porte) et par le test racine CA-1.6 ; test d'intégration non-LLM de bout en bout (`release_public_flow`, dépôt nu, vrai outil en processus) ; genres `notes`/`issue` : consommateurs d'outil en PR-A2/PR-C (déclarés) ; FM-1.2 et FM-1.1 couverts (CA-1.2) ; **FM-3.3 non prouvé** (G-5 : un essai à blanc qui saute la porte survit, C-G2-3) ; FM-2.4 respecté, mais la règle (g) imprime le secret trouvé en clair (C-G2-10) ; FM-3.1 : sans objet en A1 (pas de tag) | §4, §5 |
| 11 | Q-A1-1..11 | Q-A1-1, -6, -7, -8, -9, -10 appliquées ; Q-A1-2 et Q-A1-5 : actes hors code (G7 / NARABI-L-1), non vérifiables ici ; **Q-A1-3 mesurée : 0 faux positif ⇒ ajout au pli (C-G2-4)** ; **Q-A1-4 : pli dû, avec une contrainte mesurée (C-G2-6)** ; **Q-A1-11 mesurée : 9 phrases de cuisine sur 16 passent ⇒ pli (C-G2-5)** | §8 |

## 2. R-25 (point 2)

Script `F:\tmp\pca1\g2\r25.sh` (sha256 `87cc7ba3…e6e0`) : pathspec de `ci.yml:82` (20 jetons) et programme `awk` de `ci.yml:90` **extraits du fichier** du clone ; diff suivi contre `ae9e6ad` ; fichiers non suivis **filtrés par le même pathspec** (`git ls-files --others --exclude-standard -- <pathspec>`, lecture) et comptés en insertions pures (`wc -l`, dernier octet `\n` vérifié sur les quatre). Aucune écriture d'index. Sortie (`r25.log`, `48cdcc87…ce47`) :

```
tracked shortstat:  5 files changed, 129 insertions(+), 261 deletions(-)   -> awk ci.yml:90 = 390
untracked (pathspec) : public-text-deny.d.mts 29, public-text-deny.mjs 165, public-text-deny.test.ts 107, release-public-flow.test.ts 144 = 445
R-25 = 835
```

Égal au G1 (méthodes A et B). Cible 800 dépassée (+35), coupe 900 et STOP 1 150 non atteints ; dérive ×2,14 consignée (Q-A1-7). **Attention au pli** : les corrections dues par décision (C-G2-4, C-G2-5, C-G2-6) et les vecteurs demandés ci-dessous sont estimés à **+60 à +80 lignes** (déplacement de `KITCHEN_FORMS` ≈ 30, sous-liste Q-A1-4 ≈ 13, vecteur « remote » et nettoyage de l'étape ≈ 12, formes Q-3 ≈ 6, vecteurs G-5/G-7/G-9 ≈ 6) : **≈ 895 à 915, à la coupe de 900** (Q-G2-2).

## 3. Tests (point 3)

- **Ciblés** (clone, `node_modules` par `mk-nm.ps1` : `entries: 220 monark: 10 fail: 0`, `@monark/rpc-guard` résolu dans le clone ; `TEMP` = `F:\tmp\pca1\g2\tmp` ; `MONARK_PUBLIC_MIRROR` et clés payantes retirées ; 00:23:39Z → 00:23:59Z) : `node --test test/public-text-deny.test.ts test/release-public.test.ts test/release-public-flow.test.ts test/site-build-fleet.test.ts` → **tests 47, pass 47, fail 0** (`targeted.log`, `2b25da09…d209`) ; T1 4/4 (dont `public_notes_pass_the_gate`), T2 7/7, T3 1/1 (19,4 s), T4 35/35. Témoin du harnais de mutants (copie `git archive`) : 47/47.
- **Lecture des vecteurs** (`test/public-text-deny.test.ts`) : (a) français et portée `bell` ; (b) deux ; (c) neuf formes du jeu fermé ; (d) ; (e) ; (f) **toutes** les formes des trois listes par leur `sample` (garde anti-faux-vert ≥ 20) ; (g) forme de clé, URL hors liste, URL de l'organisation hors miroir ; (h) cinq formes, `issue` seulement ; Q-3 ; titre 51 et titre sans ligne vide ; genre `commit` refusé ; vide. Acceptés : CVE, 50 points de code (octets et unités UTF-16 au-delà), `lockfile`, URL permises, (h) hors `issue`, titre long hors `message`. `kindForPath` : 8 cas. CA-1.6 : parcours de `docs/public-notes/**` (2 textes d'issue, garde ≥ 2).
- **Décision 232 contre les vecteurs** : « budgets, crédits, verrous » = Q-3 (vecteurs présents) ; « tests », « garde » : **permis** par décision de l'orchestrateur (Q-3, `CHANTIERS.md` l.1647) ; **« ordre interne » (Dōjō d'abord) et « ce que Bell ne fait pas » : aucune règle, aucun vecteur** — sondes : « Dojo comes first, then the next piece. », « What Bell does not do: it does not trade. » passent (`probe-gate.out`) ; l'ADR §2.2 ne les liste pas non plus (portée sémantique) : Q-G2-1.
- **Genres** : liste fermée `message | notes | issue` (L-2) ; `readme` (README de `monark-record`, ADR §2.2 (3)) et message de tag / titre de Release arrivent avec PR-B / PR-A2, conformément à la découpe §10 ; sondes `Message`, `""`, `undefined`, `"notes "` : refusées (`kind`).
- **Test de flux** (`test/release-public-flow.test.ts`, lu en entier) : vrai outil en processus, dépôt nu jetable, `gh` factice en tête de `PATH` qui journalise, portes de substitution journalisées ; 16 refus, chacun avant toute porte et HEAD inchangé ; porte `export:check` rouge : arrêt, aucun export mis en étape, clone intact ; essai à blanc puis exécution réelle : un commit, message octet pour octet (`cat-file`), identité noreply, export présent, module absent, **`ls-remote` du nu identique (aucun push)**, commande de push imprimée ; `gh` n'a vu que `--version`, `auth status` et la lecture de visibilité. **Non couverts** (mutants survivants §4) : miroir pointant sur un autre dépôt (G-1), porte du message en essai à blanc (G-5), garde de branche à l'appel (G-7), résidus à côté du clone après succès (G-10, G-11).
- **Répertoire temporaire** : le test de flux et 42 écrivent sous `os.tmpdir()` ; sur cet hôte `TEMP` utilisateur = `F:\tmp` (mesuré), donc « sous `F:\tmp` » (ADR §2.3) tenu de fait ; portable en CI. Observation, pas un écart.
- **Suite complète sous verrou** : `test` de l'oracle (§6) : `tests 1352, pass 1350, fail 0, skipped 2`, 366 s ; `release_public_flow` ✔ (52 s dans la suite), 42 ✔ (355 s dans la suite), les quatre tests de T1 ✔, T2 7/7.

## 4. Mutants (point 4)

Copie `F:\tmp\pca1\g2\tree` (`git archive ae9e6ad` depuis `F:\Monark`, neuf fichiers copiés, 9/9 OK), `node_modules` par `mk-nm.ps1` (`220 / 10 / 0`). Harnais `mutants-g2.mjs` (`ba289d6d…98de`) = copie du harnais G1 (`57cff007…e171`) dont seuls `TREE`, `OUT`, `TMP` et le chemin de repli de X-3 sont reciblés sous `F:\tmp\pca1\g2\`, plus 13 sondes `G-*` (même discipline : ancre unique, fichier restauré, sha256 revérifié). Exécution 00:26:23Z → 00:41:37Z (`mut-run.log`, `5f23b4ca…51e8`) ; M1-n et M4-a (qui lancent 42) sous le verrou d'hôte, §6.

- **Témoin** : 47/47. **44 mutants du G1 hors T5 : 44 tués**, et la liste « verdict + tests rouges » est **identique** à `out-final\table.txt` du G1 (`diff` vide). Motifs lus dans les journaux par mutant (ex. M1-k : « nothing was pushed (CA-1.2, M1-k) » ; M1-j : « export:check is the last gate »). M1-n, M4-a : rejoués **sous le verrou** (00:56:27Z → 00:57:13Z, `mut-t5.log` `a88f0e8e…f2fc`) : M1-n **tué** (3 rouges : 42 « scripts/public-text-deny.* must not be exported », `site_names_no_data_source` « … is never exported (CA-1.5) », flux « the vendor lists stay out of the mirror ») ; M4-a **tué** (42 « exported workflow must reference no secrets.<name> », en (f) avant (e)) ; total **46/46**.
- **Sondes G2** :

| Sonde | Altération | Tests | Verdict | Lecture |
|---|---|---|---|---|
| G-1 | vérification `git remote get-url origin` neutralisée (`if (false)`) | T3 | **SURVIT** | aucun vecteur de flux n'utilise un miroir à mauvaise origine ; la mission demande précisément cette preuve (C-G2-1). Garde mesurée **fonctionnelle** hors test (scénario `scen/remote.mjs`) : refus « points at an unexpected remote », HEAD et arbre du miroir inchangés, mais `mirror-stage-<pid>` laissé (C-G2-2) |
| G-2 | refus de la porte qui n'arrête pas le flux (`process.exit(1)` retiré de `gateOrAbort`) | T3 | tué | « empty message (M1-l): no gate may run before the refusal » |
| G-3 | genre inconnu accepté par le module | T1, T3 | tué | vecteur `commit` |
| G-4 | l'outil passe `notes` au lieu de `message` | T3 | tué | « title bound: must refuse » |
| G-5 | `--dry-run` saute la porte du message | T3 | **SURVIT** | aucun refus n'est rejoué avec `--dry-run` ; FM-3.3 (ADR §2.6) et le commentaire de `preflight` (« INCLUDING a --dry-run ») sans preuve (C-G2-3) |
| G-6 | `export:check` déplacé en tête | T2, T3 | tué | épinglage |
| G-7 | garde de branche neutralisée à l'appel | T3 | **SURVIT** | `branchGuard` pur testé (T2), l'appel non ; le préflight a été réécrit par cette PR (C-G2-8) |
| G-8 | l'outil n'appelle plus la porte | T3 | tué | refus (a).. du flux |
| G-9 | titre vide accepté (`title.trim() === ""` retiré) | T1, T3 | **SURVIT** | aucun vecteur « ligne vide puis corps » ; sonde : `"\n\nBody only"` est aujourd'hui refusé (`title`) (C-G2-8) |
| G-10 | étape non retirée après la copie | T3 | **SURVIT** | hygiène (C-G2-2) |
| G-11 | copie du message non retirée | T3 | **SURVIT** | hygiène (C-G2-2) |
| G-12 | ponctuation finale d'URL gardée | T1, T3 | survit | quasi équivalent : ne change que `…/Monark.` (refus en plus, côté fermé) ; noté, sans correction |
| G-13 | identité vérifiée après l'overlay | T3 | tué | « non-noreply identity: no gate may run before the refusal » |

- **Sondes de la mission** : genre inconnu (G-3, vecteur) : couvert ; refus qui n'arrête pas (G-2) : couvert ; `export:check` absent (M1-j) / déplacé (G-6) : couvert ; visibilité non vérifiée (M1-q1/q2) : couvert ; message vide (M1-l) : couvert ; **casse/accents/ponctuation** (`probe-gate.out`) : `POLYGON` et `polygon` **passent** (forme `\bPolygon\b` sensible à la casse, héritée du balayage du site où elle protège `<polygon>`) ; `Data-bento`, `Data bento`, `Cloud-flare`, `Cloud flare`, `Quick Node`, `alchemy_rpc` (pas de `\b` avant `_`), `Cloud` + U+200B + `flare`, `Ｃloudflare` (pleine chasse) **passent** ; `Clóudflare` refusé par (a) (diacritique) ; `CLOUDFLARE`, `alchemy-rpc`, `Alchemy's`, `hostinger.com`, `ghcr.io/…` refusés (C-G2-7, C-G2-9) ; **texte hors `WHITELIST_FILES`** (dépôts de fichiers dans `docs/public-notes/**` du clone, retirés après) : issue avec un nom de fournisseur, chemin sans genre (`README.md`), `v0.7.0.commit.md` à titre de 51 points de code, issue datée : **tous rouges** à `public_notes_pass_the_gate` ; notes `v0.7.0.md` « The Dojo comes first… » : **vert** (Q-G2-1).
- Autres sondes (`probe-gate-2.out`) : U+202E (contrôle bidirectionnel) et BOM en tête de titre **passent** (committés octet pour octet par `--cleanup=verbatim`) ; adresse électronique et adresse IP passent (hors règles de l'ADR, observation) ; `decisions 237`, `decision #237`, `decision n° 237`, `adr-m010`, `ADR M010`, `g7`, `checkpoint two`, `PR-A1`, `Lot Narabi-core closed` passent (Q-A1-3 / Q-A1-11).

## 5. Fidélité, ordre, refus (points 5, 6, 10)

- **Module** : règles (a) = `checkReleaseText` + portée `bell`, échec fermé sur portée vide (conforme §2.2 (3)(a)) ; (b) regex de la mission + exception CVE avec garde arrière ; (c) jeu fermé Q-5 ; (d) ; (e) `WINDOWS_ABS_PATH_RE` importé (conforme ; UNC et chemins POSIX hors règle, conforme à la lettre) ; (f) listes déplacées **à l'identique** (comparaison ligne à ligne des formes retirées de `site-build-fleet.test.ts` : mêmes regex, mêmes drapeaux) + `HOSTING_FORMS` (Q-4, Q-A1-9) ; (g) `KEY_SHAPES` sans `://` (épinglé : `SECRET_SHAPES.length = KEY_SHAPES.length − 1`) + liste blanche de deux origines (hôte `monarkgate.tech.evil.org` et `Monark.evil` refusés, `http://` refusé) ; (h) `issue` seulement ; titre ≤ 50 points de code pour `message` seulement (pli cp-1 C-V-9) ; `kindForPath` conforme à CA-1.6 pli cp-1.
- **Outil** : `--message` obligatoire, lu une fois, gardé **avant** toute autre étape ; `MONARK_PUBLIC_MIRROR` obligatoire sans repli ; étape et copie du message à côté du clone ; commit `--cleanup=verbatim` ; push, tag, Release et restauration retirés (L-4) ; `--tag`/`--notes` refusés ; injection `{gates, remote}` inatteignable depuis la ligne de commande (M1-p1/p2). Conforme à D1, §2.2 (4)-(6), CA-1.1..1.4, CA-1.7.
- **Refus sans écriture** : préflight et porte rouge : rien dans le miroir ni à côté (testé) ; échec d'export ou « unexpected remote » : rien **dans** le miroir, mais l'étape `…-stage-<pid>` (export complet) reste à côté du clone (mesuré sur scénario, et résidu réel du G1 §7) : C-G2-2. L'essai à blanc, lui, réinitialise et recouvre l'arbre du miroir (comportement préexistant d'ADR-M010, hors refus).
- **Branchement** : conforme (table du point 10). 

## 6. Oracle (point 8)

- **Verrou d'hôte** (`F:/tmp/oracle-lock`, `mkdir` atomique) : occupé à 00:41:49Z par « G2 NARABI-L-1 2026-09-27T00:30:06Z » ; attente consignée minute par minute (`oracle/lock.log`, `6b71fd21…a900`) ; **pris à 00:45:50Z**, `owner.txt` = « G2 PR-A1 <heure UTC> » ; **libéré à 00:57:13Z** (`rmdir`, absent relu). Charge avant : **15** processus `node` (14 à 00:21Z : serveurs `next` de deux autres worktrees et serveurs MCP, aucun `node --test`) ; 15 avant 42.
- **Écart consigné** : mes 57 mutants hors T5 (00:26:23Z → 00:41:37Z) ont tourné **sans verrou** (ni `npm test` complet ni `npm run ci` : fichiers ciblés, conformément à la règle), mais **pendant** la suite du G2 NARABI-L-1 (verrou pris par lui à 00:30:06Z) : charge ajoutée à sa suite, à signaler à ce G2 si son oracle a rougi par délai.
- Script `run-oracle-g2.sh` (`955a93a7…c8cc`) = `run-oracle.sh` du G1 reciblé (clone et temporaires sous `F:/tmp/pca1/g2/`), mêmes variables retirées (`MONARK_PUBLIC_MIRROR`, clés payantes), `npm` hors réseau sans audit.
- **Clone** `F:/tmp/pca1/g2/clone` (HEAD `ae9e6ad` + neuf fichiers, 9/9) ; 00:45:50Z → 00:52:43Z : `gate:vocab` 0 (317 fichiers) ; `typecheck` 0 ; `test` 0 (**1352 / 1350 / 0 / 2**, 366 s ; `test.log` `93c78a7c…46f0`) ; `lint` 0 ; `lint:ratchet` 0 (**69/69**) ; `lang:gate` 0 ; `export:check` 0 (`exits.txt` `9272fe29…7f72`).
- **Test 42 à part, après la suite, sous le même verrou** (00:52:43Z → 00:56:27Z) : `node --test --test-reporter=tap --test-name-pattern=export_public_no_governance_no_french test/export-public.test.ts` → `ok 1 - export_public_no_governance_no_french`, `duration_ms: 224181`, `# tests 1 # pass 1 # fail 0` (`t42.tap` `6efa874f…c2a2`) ; borne 600 s de (e) inchangée, marge ×2,7 hors charge.

## 7. Hygiène (point 9)

- Lignes ajoutées et nouveaux fichiers balayés : 0 nom de fournisseur hors la liste du module (les tests construisent leurs vecteurs depuis `sample`), 0 chemin de lecteur, 0 forme de clé littérale (le vecteur `ghp_` est construit à l'exécution), aucune adresse électronique réelle (seules `flow@users.noreply.github.com` et `flow@example.org`, adresses d'essai du test de flux, non exporté) ; `lang:gate` couvre `scripts/` et `test/` (oracle).
- Aucun des dix fichiers n'appartient à `collectFiles(ROOT).kept` (486 fichiers) : ni français, ni nom, ni budget exportés par cette PR.
- E-1..E-4 du G1 : `F:\Monark\node_modules` 220 / 10 / `typescript` présent (00:3xZ et à la clôture) ; aucun `.python_history` ; aucun `monark-*` sous `C:\Users\KACIMI\AppData\Local\Temp` ; clones G1 (`F:\tmp\pca1\clone`, `clone-base`, `F:\tmp\public\pr-a1-mutants`) non touchés. **Résidu G1 non déclaré** : `F:\tmp\pca1\mutant-default-mirror-stage-76548` (C-G2-11 ; laissé en place, non mien).

## 8. Questions du G1 (point 11) et mesures Q-A1-3 / Q-A1-11

- **Q-A1-1** `message` : appliqué (module, `.d.mts`, outil, tests). **Q-A1-2** amendement ADR-M010 au G7 : acte de l'orchestrateur, non encore dû (ADR-M010 inchangé à ce stade, attendu). **Q-A1-5** : porté à NARABI-L-1 ; respecté ici (aucun chemin `public`). **Q-A1-6** : aucun rejeu en ligne (conforme). **Q-A1-7** : 835 confirmé. **Q-A1-8** `inject.remote` : présent, mutants M1-p tués. **Q-A1-9** GHCR : présent (`HOSTING_FORMS`, vecteur par `sample`). **Q-A1-10** : verrou pris par ce G2 (§6).
- **Q-A1-4** (pli si R-25 < 900) : **non encore appliqué** (le test garde `PROVIDER_FORMS` local, l.30-34). Contrainte mesurée : ce test impose un **contrôle négatif** « the token is also deployed on Polygon » doit rester vert (décision 69) ; importer `DATA_SOURCE_FORMS` tel quel le rougirait (`\bPolygon\b`). Le pli doit donc exporter du module une **sous-liste dédiée** (les trois formes de décision 69) et l'importer (C-G2-6).
- **Mesure Q-A1-3** (`measures/q3.mjs` `d77adda2…345c`, sortie `q3.out` `577910a6…264c`, détail `q3-hits.json`) — corpus : `collectFiles(ROOT).kept` du clone (486 fichiers, 462 textes : 439 code, 23 `.md`), `docs/public-notes/**` (2), les **25 messages de commit et 5 messages de tag** du miroir (`F:\monark-public-mirror`, lecture seule, HEAD `8ca8a23`) :

| Forme proposée | textes libres (2 notes + 30 messages) | `.md` exportés | code exporté | lecture des occurrences exportées |
|---|---:|---:|---:|---|
| `\bPR-[A-Z]\d` | 0 | 0 | 0 | — |
| `\bQ-(?:P-)?\d+\b` | 0 | 0 | 1 | `Q-4` (identifiant interne) |
| `\bM\d-[a-z]\b` | 0 | 0 | 0 | — |
| `\bD\d+\.\d+\b` | 0 | 11 | 25 | `D0.5`, `D6.1`, `D6.3` (décisions d'ADR) |
| `\bA-\d+\b` | 0 | 1 | 71 | `A-8` (identifiant interne) |
| `\bCP\d\b` | 0 | 0 | 5 | `CP1`, `CP2` (points de contrôle internes) |
| `\b[A-Z]\d-[A-Z]\b` (candidate G2 pour `F2-B`) | 0 | 2 | 13 | `F2-B`, `F2-A`… **et `L1-L`** (`timeline.jsonl#L1-L<n>`, forme que le README de `monark-record` doit publier, ADR §4.2 (7), Q-P-2) : **faux positif** |

  **Verdict de mesure** : les six formes du G1 font **0 faux positif** sur le corpus des textes libres réels ; toutes leurs occurrences dans l'export sont de **vrais** identifiants internes (aucun faux positif non plus là ; si l'orchestrateur lit la condition sur l'export entier, 114 occurrences, toutes des identifiants internes réels) ⇒ par la décision de l'orchestrateur, **ajout au pli** (C-G2-4). La forme générique de `F2-B` **n'est pas** à ajouter (faux positif `L1-L` sur un texte public prévu) ; `F2-B` reste à la relecture de l'orchestrateur ou reçoit une forme étroite à mesurer (Q-G2-3). Limite déclarée : le corpus de textes libres est petit (32 textes) ; les `.md` et le code exportés, qui ne passent pas par la porte, servent de corpus de contrôle.
- **Mesure Q-A1-11** (même script) — 16 phrases, une par forme de `KITCHEN_FORMS` (plus variantes), `kind = notes` : **9 passent** : « Two sub-agents reviewed it », « The orchestrator merged the change », « The orchestration closed it », « A worker fixed the gate », « Passed the checkpoint », « Done per decisions 237 », « Done per decision n° 12 », « A vibecoded fix », « No vibe-coding here » ; refusées : `checkpoint-2`, `G7`, `ADR-M010`, « G2 review » (c), « Lot SITE-LEGAL-1 » (b), « Lot Narabi-live » (a, par le mot `live` seulement : « Lot Narabi-core closed » **passe**). Faux positifs des dix formes sur les textes libres réels (2 notes + 30 messages) : **0** ; dans l'export (hors porte) : `worker` 2 `.md` + 9 code, `orchestrator` 1 + 22, `checkpoint` 1 + 63, etc. (vrais usages internes pour la plupart ; `\bworkers?\b` rougira aussi « service worker », limite déjà déclarée par le fichier du site). **Vecteur proposé** : `KITCHEN_FORMS` déménage dans le module avec un champ `sample` par forme (source unique, R-3 ; `site-build-fleet.test.ts` l'importe, comme les noms) ; `checkPublicText` l'applique comme règle `k` à tout genre ; T1 : `for (const f of KITCHEN_FORMS) assert.ok(rules(\`Per the ${f.sample} note\`).includes("k"))` avec garde `KITCHEN_FORMS.length >= 10` ; un mutant `/(?!)/` par forme (10, comme X-c1..c9) ; les formes déjà dans (c) (`G0-G7`, `ADR-`, `G2 review`) restent une seule fois (une seule source) ; la forme `decision` du module s'aligne sur `decisions? (?:n°\s*|#)?\d+` (C-G2-5).

## 9. Corrections C-G2-n

| # | Bloquante | Fichier:ligne | Texte attendu |
|---|---|---|---|
| C-G2-1 | **oui** | `test/release-public-flow.test.ts:100` (table `refusals`) et `:42` | un miroir cloné d'un **autre** dépôt nu (origine ≠ `inject.remote`) ⇒ code non nul, « unexpected remote », HEAD et `status --porcelain` du miroir inchangés, aucun `-stage-` restant ; tue G-1 (la mission demande cette preuve) |
| C-G2-2 | non | `scripts/release-public.mjs:172-186` | vérifier l'origine d'un clone existant **avant** l'export (ou retirer l'étape sur tout abandon après l'export) ; vecteur de C-G2-1 + assertion « aucun `-stage-`/`-message-` à côté du clone » après l'exécution réelle (tue G-10, G-11) |
| C-G2-3 | **oui** | `test/release-public-flow.test.ts:83-100` | un refus rejoué **avec `--dry-run`** (ex. règle (d)) ⇒ refus avant toute porte ; prouve FM-3.3 (ADR §2.6) et le commentaire `preflight` ; tue G-5 |
| C-G2-4 | **oui** (décision Q-A1-3 : 0 faux positif mesuré) | `scripts/public-text-deny.mjs:99-100` ; `test/public-text-deny.test.ts:29` | ajouter à `INTERNAL_FORMS` : `/\bPR-[A-Z]\d/`, `/\bQ-(?:P-)?\d+\b/`, `/\bM\d-[a-z]\b/`, `/\bD\d+\.\d+\b/`, `/\bA-\d+\b/`, `/\bCP\d\b/` ; un vecteur par forme (`PR-A1`, `Q-3`, `M1-a`, `D1.3`, `A-7`, `CP1`) ; un mutant `/(?!)/` par forme ; **pas** de forme générique `[A-Z]\d-[A-Z]` (faux positif `L1-L`) |
| C-G2-5 | **oui** (décision Q-A1-11 : pli de ce lot) | `scripts/public-text-deny.mjs` (nouvelle liste exportée + règle `k`) ; `test/site-build-fleet.test.ts:1098-1109` (liste locale retirée, import) ; `test/public-text-deny.test.ts` (boucle `sample`) ; `.d.mts` | voir §8 « Vecteur proposé » ; `site_names_no_kitchen` reste vert (même liste, importée) |
| C-G2-6 | oui **sous condition R-25 < 900** (décision Q-A1-4) | `scripts/public-text-deny.mjs` (sous-liste des trois formes de décision 69, exportée) ; `test/no-cash-provider-name.test.ts:30-34` (import) | le contrôle négatif « deployed on Polygon » reste vert ; ne pas importer `DATA_SOURCE_FORMS` tel quel |
| C-G2-7 | non | `scripts/public-text-deny.mjs:35` / `:62` | en texte libre, ajouter une forme `POLYGON`/`polygon` (la raison `<polygon>`/`polygon()` vaut pour le code du site, pas pour un message) **ou** déclarer la limite dans l'en-tête du module ; choix de l'orchestrateur (faux positif possible : « polygon clip path » dans un message de site) |
| C-G2-8 | non | `test/release-public-flow.test.ts` ; `test/public-text-deny.test.ts:39-40` | vecteur « arbre source sale » ⇒ refus (tue G-7) ; vecteur `"\n\nBody"` refusé `title` (tue G-9) |
| C-G2-9 | non | `scripts/public-text-deny.mjs:126-131` | normaliser NFKC et refuser tout caractère de format `\p{Cf}` (U+200B, U+FEFF, U+202E…) avant les règles ; vecteurs U+200B dans un nom, U+202E, BOM |
| C-G2-10 | non | `scripts/release-public.mjs:87` | pour la règle (g) forme de clé, ne pas imprimer le mot trouvé en clair (préfixe et longueur), FM-2.4 gardé par la règle et la ligne |
| C-G2-11 | non (journal) | `docs/G1-lot-public-cadence-1-A1.md` §10 (l.152) et §12 | déclarer `F:\tmp\pca1\mutant-default-mirror-stage-76548` (résidu de X-3, 23:47Z) et son retrait (`fs.rmSync`, sans jonction), ou le retirer et le consigner |

## 10. Questions formées (à l'orchestrateur)

- **Q-G2-1 (décision 232 (b) et (c))** : « ordre de chantier interne » et « bloc ce que Bell ne fait pas » ne sont ni dans l'ADR §2.2 ni dans la porte (sondes vertes, §3). Options : (a) déclarer dans l'ADR §7 (« Portée déclarée ») qu'ils restent à la relecture de l'orchestrateur avant chaque texte libre (sémantique, non mécanisable sans faux positifs) ; (b) une règle étroite (ex. `\bdoes not\b|\bdoesn't\b` à proximité de `Bell`) à mesurer. [(a)]
- **Q-G2-2 (R-25 du pli)** : estimation +60 à +80 ⇒ ≈ 895-915, à la coupe de 900. Options : (a) pli complet et mesure au G1 correctif, coupe si > 900 (C-G2-6 et C-G2-9 sortent en premier) ; (b) C-G2-5 (déplacement de `KITCHEN_FORMS`) en PR-A2. [(a)]
- **Q-G2-3 (`F2-B`)** : pas de forme générique (faux positif `L1-L` mesuré) ; laisser à la relecture ou forme étroite à mesurer au G1 correctif. [laisser]
- **Q-G2-4 (adresses électroniques, IP en texte libre)** : hors ADR ; une adresse personnelle dans un message public passe. [ligne datée d'ADR si l'orchestrateur le juge utile ; non bloquant]

## 11. Non rejoué

- Rejeu en ligne de 42 (e) (`npm audit`, construction du site) : **non**, réseau interdit (Q-A1-6) ; l'oracle en ligne est la CI publique après fusion.
- Un vrai `gh` : jamais (factice seulement, journal vérifié).
- **E-G2-1 (écart du relecteur, sans effet sur les rejeux)** : une commande (écriture par heredoc de `F:\tmp\pca1\g2\fill.mjs`, 7 114 octets, remplissage de ce rapport) a dépassé la borne de 6 Ko de la mission ; à ne pas refaire (contenu long par l'outil d'écriture de fichier). **Piège d'outillage mesuré** (trois fois : ancre de G-13, `scen/remote.mjs`, chemins de ce rapport) : sur cet hôte, un heredoc passé par l'outil Bash réduit `\\` à `\`, ce qui change regex et chemins dans un script JS ; corrigé à chaque fois (reconstruction par `String.fromCharCode(92)`, contrôle des ancres à 1, recherche de tabulations) ; à signaler au worker du G1 correctif.
- Les oracles « base » du G1 (`clone-base`) : non rejoués (la base 1 345 / 1 343 / 0 / 2 est lue du journal ; le delta +7 = 4 + 2 + 1 tests nouveaux se relit dans `test.log`).

## 12. Empreintes (sha256 relus)

```
G1 livrés (worktree = clone = copie mutants) : FINAL.sha256 9/9 OK ; DELIVERED.sha256 10/10 OK
5a42381cc40f58dc8c9eed353e739342d0c9b2297d31d2ad02a7f7acf7cd17f3  docs/G1-lot-public-cadence-1-A1.md
b6e49f4ed826bd0c34c904000f5c8ffc188599292930fc75c4bed838288684b6  docs/adr/ADR-PUBLIC-CADENCE-1.md
57cff007054fc5ea62735be63019969d49d22300e014fe372be8a39e9930e171  F:/tmp/public/pr-a1-mutants/mutants-final.mjs (G1)
a391cf8ca214dcc0c7ac18ba754a0e636b427a3fd48c47e0813440631a786671  F:/tmp/pca1/run-oracle.sh (G1)
G2 (sous F:/tmp/pca1/g2/) :
87cc7ba3833f454c342cae2ce9212446f69cd562405510e5d8723420fbb8e6e0  r25.sh
48cdcc873443dde7f7cae7ffde741c635a560c8dbd23f7a4b8dfe713f8d9ce47  r25.log
2b25da09fbff048bfc590f2a7ad6c1585aa9a0a9c5cb8161ebb47c6d1e47d209  targeted/targeted.log
ba289d6d9c47c88a862ae23c434af2787eed10465c57f1d87d87ad762f6298de  mutants-g2.mjs
5f23b4ca7803ac2609181c160ac7f1f9ea8db586b8765bec816dbec5f6e351e8  mut-run.log
fdfd44acf9aaf402ccee10c5c42668d1cc5af7c8a192a809ca022bdb08fc5a27  probes/probe-gate.mjs
95e21f9cb5ddc2045466461d7780f9a9edc31ecc6b62812e55309ee921ded93b  probes/probe-gate.out
299d832c92112d16973bf8675d3a67be93c0505a1775c239302075f7655eedc4  probes/probe-gate-2.out
d77adda2c2102f532e5c844715121a96dec581eea416fabe01c16af4fb62345c  measures/q3.mjs
577910a66da2bb468e6ac3cc75e42c919c2b67839edf500d7f214711fafd264c  measures/q3.out
9447388077e3536bde2c5a9dc3227a6901cfa297b05a27147f126de767be5a73  measures/q3-hits.json
19a920e200f40169239d38976b90869c535a12eb40ad01c5d1d1c67447cf6254  scen/remote.mjs
955a93a7dc9481e19e06c83a197b0fd75a0cb364e36d73b5608c28a41cd1acc8  run-oracle-g2.sh
9272fe29d649e7fdab23a72eca03704caa1722ef3fb3758ce995d383a5597f72  oracle/exits.txt
93c78a7c2482bf6682616610d74f9f692257203c4573390c52891b1cac6946f0  oracle/test.log
6efa874fbfd51ca33eda25bd00a6ef546eebd12832a2076f70a4d3c4e014c2a2  oracle/t42.tap
6b71fd21c5b7a5f6859e189685db57d76383a51163c8cc0d656b6bcf40a36900  oracle/lock.log
a88f0e8e3f9c8f79cee5f38489ba889ed5f368c0468c6d61c51bd9510ef2fcf2  oracle/mut-t5.log
```
Clôture : jonctions retirées par `rm-nm.ps1` seulement (`removed: F:\tmp\pca1\g2\clone\node_modules`, `removed: F:\tmp\pca1\g2\tree\node_modules`) ; `F:\Monark\node_modules` relu 220 / 10 / `typescript` ; temporaires `F:\tmp\pca1\g2\tmp`, `F:\tmp\pca1\g2\tmp-mut`, `F:\tmp\pca1\g2\scen\w` et `F:\tmp\pca1\g2\mutant-default-mirror` (mon X-3) effacés par `fs.rmSync` après contrôle « 0 lien » ; clone et copie gardés, sans `node_modules`, pour un rejeu.

## 13. Verdict

**CORRECTIONS D'ABORD.** Le livrable est sain sur ce qu'il prouve (R-25 835 rejoué, 47/47, 1 352 / 1 350 / 0 / 2 et 7/7 sous verrou, 42 vert à part, 46/46 mutants rejoués avec les mêmes tests rouges, module hors export prouvé, aucun push, aucun `gh` qui écrive, hygiène propre). Bloquent le passage au checkpoint-2 : **C-G2-1** (la vérification `git remote get-url origin`, preuve demandée par la mission, survit à sa neutralisation), **C-G2-3** (FM-3.3 : un essai à blanc qui saute la porte survit), **C-G2-4** et **C-G2-5** (plis décidés par l'orchestrateur sur Q-A1-3 et Q-A1-11, mesurés ici : 0 faux positif pour les six formes ; 9 phrases de cuisine sur 16 passent), **C-G2-6** sous la condition R-25 < 900 (Q-A1-4, avec la sous-liste imposée par le contrôle négatif de décision 69). Estimation du pli ≈ 895-915 lignes : la coupe de 900 est à mesurer au G1 correctif (Q-G2-2). Non bloquantes : C-G2-2, C-G2-7..C-G2-11.
