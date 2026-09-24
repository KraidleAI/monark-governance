# G2 — lot BELL-HOST-ROOT-1 (`bdd6c66`, relecteur Opus 5.5, contexte frais)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/g2-bellroot/G2.md` (sha256 cbfa9d0e…). Verdict : PASS-AVEC-CORRECTIONS C-1 (c07 : cas 301 avec bonne Location, mutants G4/G7), C-2 (modèle : double définition d'un matcher nommé acceptée à tort, G6/P13), C-3 (RUNBOOK étape 7 : mesurer le Caddyfile en place contre le blob G7-1 avant remplacement ; ne pas écraser G7-1.txt) — pli BELL-HOST-ROOT-1 bis lancé ; 14/14 + 11/11 mutants, suite 1 171/1 169/0/2, portes 0, R-25 104, fusion sur `cab9a29` sans conflit.

---

# G2 — lot BELL-HOST-ROOT-1 (décision investisseur 155), commit `bdd6c66` sur `lot/bell-host-root`

- Relecteur G2 : instance séparée, contexte frais, **modèle résolu `claude-opus-5-5[1m]`** (préfixe `claude-opus-5-5`, R-1), effort max.
- Date : 2026-09-23, de 22:22:10Z à l'heure de fin portée en §9 (horloge `date -u`). Aucun commit (R-20), aucun workflow, aucune écriture sous `F:\Monark*`
  (copies : `F:\tmp\g2-bellroot\repo` et `F:\tmp\g2-bellroot\repo-full`, clonées de `F:/Monark` avec `--no-hardlinks`, HEAD `bdd6c6629600e48d6d02a62f8f69c96cbdaf2030`),
  aucun réseau hors loopback, aucun accès à l'hôte Bell. Ceinture A-7 `env -u …` + `TEMP/TMP/TMPDIR=F:/tmp/g2-bellroot/tmp` sur chaque commande.
  Dépendances : `npm ci --offline` dans chaque copie (283 paquets, `npm_ci_exit=0` ; journaux `npm-ci.log`, `full/npm-ci.log`).
- Entrées : `F:\tmp\bellroot\RENDU.md` sha256 `6a5d025fec99e932783dc11c6083a6888993d283f9881790fd292fcdecab0cae` (= attendu) ;
  `DELIVERED.sha256` : **52/52 lignes OK** (`sha256sum -c`) ; `PLI.diff` `6221b957…43ee` = `git diff d7c60a2 bdd6c66 | sha256sum` (recalculé) ;
  les 7 blobs `git cat-file blob bdd6c66:<p>` = les 7 empreintes livrées.

## Verdict : **PASS-AVEC-CORRECTIONS** — liste fermée C-1, C-2, C-3 (§7)

Le comportement livré est correct et prouvé : `/` ⇒ 302 `Location: https://monarkgate.tech/bell` avec les en-têtes du site, le reste inchangé ;
ordre Caddy fidèle aux sources relues ; c07/c11 ne suivent jamais de redirection ; 14/14 mutants du rédacteur rejoués à l'identique ; R-25 = 104 ;
portes et suite complète : §4. Trois défauts fermés, chacun avec critère de mort mesurable, empêchent un PASS nu :
un prédicat introduit par le lot qu'aucun test ne tue (C-1), une forme acceptée à tort par le modèle « fermé » (C-2), un rejeu RUNBOOK
qui agit sur une prémisse non mesurée et n'est pas sûr au re-jeu (C-3).

**error_origin** (proposé pour le G7) : C-1 = `implementation` (jeu de mutants asymétrique : M13 tue « Location non vérifiée », rien ne tue « statut
non vérifié ») ; C-2 = `implementation` (défaut préexistant du parseur de matchers, rendu porteur par la revendication « n'admet que cette forme » du
lot et de l'amendement ADR `cab9a29`) ; C-3 = `plan` (le rejeu reprend la commande REPLACE sans la mesure « fichier en place » qui la conditionnait
à la première passe).

## 1. Périmètre du diff `d7c60a2..bdd6c66`
- `git diff --name-status` : **7 fichiers, tous `M`** : `deploy/Caddyfile.monark-bell`, `test/bell-caddy.ts`, `test/bell-deploy-config.test.ts`,
  `scripts/verify-bell.mjs`, `scripts/verify-bell.d.mts`, `test/verify-bell.test.ts`, `docs/RUNBOOK-bell.md` (114+/19−). `merge-base = d7c60a2`.
- **Deux fichiers hors liste fermée : nécessité CONFIRMÉE par mesure**
  - `scripts/verify-bell.d.mts` : mutant **G11** (ligne `BELL_ROOT_REDIRECT` retirée) ⇒ `npx tsc --noEmit` exit 2,
    `test/bell-deploy-config.test.ts(17,10): error TS2305: Module '"../scripts/verify-bell.mjs"' has no exported member 'BELL_ROOT_REDIRECT'`
    (`mutants-g2/G11-typecheck.log`).
  - `test/verify-bell.test.ts` (+2 cas c07) : mutant **G10** (les 2 cas retirés PUIS M12 appliqué) ⇒ **survit** (12/12 verts) : M12 n'est tué que par eux.
- **Gel U-4b (9 sha LF, ADR-U4b §7)** : `git show <rev>:<p> | tr -d '\r' | sha256sum` à `d7c60a2`, à `bdd6c66` et sur la copie : **SAME ×9**
  (`2f9a31f6…f51445c0` u4b-scores, `a5e66cd3…57a6fac0` u4b-reduce, `5733daeb…2a1fbc31a3` record-u4b-calib, `7bee76fc…e4de2322` wadray,
  `3376eb08…c1ab2d66` abi, `9206df91…8164ffa3` l1-split, `0e232519…c1c65ca0` rpc, `3603265d…94c42380` calib-digest,
  `cb020425…a205b41a1af` u3-realized) — concordants avec la table ADR-U4b §7. Aucun des 7 fichiers du lot n'est gelé.
- Base : `lot/etude-suite` a avancé à `cab9a29` (docs seules : CHANTIERS, JOURNAL, SPRINT-BACKLOG, ADR-B0/M004/T1b).
  `git merge-tree --write-tree origin/lot/etude-suite lot/bell-host-root` exit 0 (tree `93dbb5e6…`) : aucun conflit ; les fichiers du lot au merge
  simulé (`ddf450f8…`, objet de la copie seulement, jamais poussé) == `bdd6c66`. L'item formé n°1 du RENDU (amendement ADR) est porté par `cab9a29`.

## 2. Lecture adversariale
### 2.1 Le modèle fermé n'admet-il QUE `@home path /` + `redir @home https://… 302` ? — **NON : une forme acceptée à tort (→ C-2)**
Sondes directes de `parseCaddyfile` (`mutants-g2/p-forms.ts` sha `b3a71bbd…`, sortie `mutants-g2/P-forms.out` sha `bd204498…`), en plus de la boucle
fail-closed de S-8 :
- Refusées (correct) : `path_regexp` (P1), 307 (P2), 308 (P3), jeton `*` (P4), argument en trop (P5), cible entre backticks (P6), matcher en bloc (P7),
  `html` (P8), code placeholder (P9), hôte placeholder (P10), 401 (P15) ; et, dans S-8 : sans code, 301, `temporary`, matcher en ligne `/`, sans
  matcher, cible relative, `http://`, `{uri}`, deux `redir`, `/*`, `not path /`, `path / /index.html`, matcher indéfini.
- Acceptées et équivalentes chez Caddy (correct) : `path "/"` entre guillemets (P11) ; `@home` défini APRÈS le `redir` (P12).
- **Acceptée à tort : double définition du matcher nommé (P13 = mutant G6)** : `\t@home path /*` puis `\t@home path /` ⇒ le modèle garde la
  DERNIÈRE définition (`cur.matchers.set`, `test/bell-caddy.ts` l.124) et lit une redirection exacte sur `/` ; l'ordre inverse (P14) est refusé.
  La sémantique Caddy d'une double définition n'est PAS établie ici (absente des sources copiées ; pas de réseau) : refus au `caddy validate`, fusion
  OU (préfixe : tout redirigé) ou dernier-gagne. Dans les deux premiers cas le modèle diverge de Caddy, et S-8, c07 sur modèle et tout l'oracle hors
  ligne restent verts ; seuls `caddy validate` (étape 7) ou la CA sur l'hôte (c01–c05 rouges si tout est redirigé) l'attraperaient. Je ne devine pas
  le comportement de Caddy : C-2 est juste quelle que soit la sémantique (elle ne fait que refuser).
### 2.2 Ordre `header → redir → file_server` — **conforme aux sources relues** (copies du rédacteur, sha concordants avec le RENDU)
- `src/directives.md` (sha `8433ab60…7049`) [lu] : ordre codé en dur, `header` l.133, `redir` l.137, `file_server` l.168 ; tri par position dans cet
  ordre quelle que soit la place dans le fichier (l.116-120, 176-178). Le mutant **G3** (bloc `@home`+`redir` déplacé AVANT les `header`) **survit :
  c'est le résultat CORRECT** (mutant équivalent ; un rouge serait un faux positif), pas un trou de test.
- `src/directives_header.md` l.9 [lu] : opérations immédiates sauf `-`/`?` ; les 4 lignes `header` du fichier sont des SET simples (aucun préfixe
  `+ - ? >` : l.15, 16, 21, 23 vérifiées) ⇒ la 302 porte ACAO, nosniff, Cache-Control. `src/staticresp.go` `ServeHTTP` [lu] : `w.Header()[field] = …`
  pour SES seuls champs, Content-Type mis à nil sans corps. `src/builtins.go` `parseRedir` [lu] : code ≠ `html` ⇒ en-tête `Location: <to>`, corps vide.
- **Point à risque vérifié** : le lot introduit les PREMIERS backticks du Caddyfile (0 ligne à `d7c60a2` ; 3 à `bdd6c66` : l.10, 25, 26, toutes en
  commentaire). `src/lexer.go` `next()` [lu] : `if ch == '#' && len(val) == 0 { comment = true }` puis `if comment { continue }` PRÉCÈDENT la détection
  du backtick ⇒ backticks inertes en commentaire ; aucune barre oblique inverse dans le fichier (`grep -c -F '\'` = 0). L'oracle réel reste
  `caddy validate` AVANT `mv` (étape 7, fail-closed).
- Limite déclarée : sources non re-téléchargées (pas de réseau) ; niveau [lu] sur les COPIES du rédacteur (`F:\tmp\bellroot\src\`), sha vérifiés.
### 2.3 c07 : `/` ⇒ 302 + `location` exacte ; c07/c11 ne suivent jamais la redirection
- `scripts/verify-bell.mjs` l.173-175 : `rootOk = error undefined && status === 302 && location === BELL_ROOT_REDIRECT`, en conjonction avec
  « aucun listing » sur `/`, `/states/`, `/provenance/`, `/bell/`.
- **X1** (`mutants-g2/x1-nofollow.mjs`, loopback) : `httpGet` contre A (302 → B) ⇒ `{"status":302,"location":true,"body_len":0,"hitsB":0}` : la
  redirection n'est jamais suivie. c11 ne fait AUCUNE requête HTTP (captures + `git cat-file`) : « ne suit pas » y est vrai par construction.
  c05 : `apps/bell/scripts/bell-verify.mjs` l.55-56 `redirect: "manual"` et refus de tout 3xx ; il ne demande jamais `/` ⇒ non affecté.
- **Trou (→ C-1)** : les mutants **G4** (c07 accepte aussi 301) et **G7** (conjoint `status === 302` supprimé) **survivent** (12/12 verts).
  Le statut 302 exigé par la décision 155 et par l'amendement D11 n'est prouvé par aucun test : le modèle refuse de servir 301 au parse, et les deux
  cas ajoutés (404 sans Location ; 302 vers example.com) sont tous deux tués par la seule comparaison de Location.
### 2.4 Rétrécissement `//` — déclaré et exact
`test/bell-caddy.ts` l.157-159 le déclare ; `src/matchers.md` l.660 [lu] : chemins nettoyés des points et `//` fusionnés avant la correspondance
⇒ sur Caddy `//`, `/.`, `/..` redirigent ; le modèle compare le chemin décodé littéralement (`//` ⇒ 404, pas de listing). c07 ne sonde que `/`.

## 3. Mutants
- **Rejeu des 14 du rédacteur** (anchors verbatim, harnais copié et redirigé : `mutants-g2/run-g2.mjs` sha `122fb70f…`, les 3 fichiers de test pour
  TOUS) : **14/14 tués, ensembles rouges identiques** au `REPORT.jsonl` du rédacteur (M7 compris : A,B,C,E) ; **F (e2e) vert pour les 14**, ce qui
  comble le `F:n/a` déclaré pour M6–M14. Restauration octet par octet vérifiée (sha256) après chaque mutant ; `git status` propre ensuite.
- **Propres** (prédictions `mutants-g2/PREDICTIONS-G2.md` sha `956d03fb…`, écrites vers 22:33Z, AVANT toute exécution) : **11/11 conformes**.

  | id | mutation | prédit | obtenu |
  |---|---|---|---|
  | G1 | cible `http://` | A,B,C,D,E | A,B,C,D,E |
  | G2 | `@home path /index.html` | A,B,C,D,E | A,B,C,D,E |
  | G3 | `@home`+`redir` avant les `header` | survit (équivalent) | survit — correct |
  | G4 | c07 accepte 301 | survit | **survit → C-1** |
  | G5 | cible avec slash final `…/bell/` | B,C | B,C |
  | G6 | `@home path /*` avant `@home path /` | survit | **survit → C-2** |
  | G7 | c07 sans conjoint `status === 302` | survit | **survit → C-1** |
  | G8 | redirection après le contrôle de méthode | survit | survit → O-1 |
  | G9 | options globales `order redir after file_server` | A,B,C,D,E | A,B,C,D,E |
  | G10 | 2 cas c07 retirés + M12 | survit | survit (nécessité confirmée) |
  | G11 | ligne `BELL_ROOT_REDIRECT` du d.mts retirée | typecheck ≠ 0 | exit 2, TS2305 |

  (A = serves_public_dir, B = root_redirects, C = ca_checks_named, D = cli_http_target, E = check5_real_bell_verify, F = e2e.)
  Journaux : `mutants-g2/run.log`, `mutants-g2/REPORT-G2.jsonl`, un TAP par mutant.

## 4. Tests et portes
- Ciblés (`test/bell-deploy-config.test.ts`, `test/verify-bell.test.ts`, `apps/bell/test/bell-served-e2e.test.ts`) : **13/13 pass**, 0 fail, 0 skip
  (`targeted.tap` sha `88cdc3c9…`).
- Suite complète : 1171 tests / 1169 pass / 0 fail / 2 skips nommés, exit 0 ; portes 6/6 à 0 — détail en §9.

## 5. R-25 (forme CI)
Pathspec de `.github/workflows/ci.yml` l.65 à l'identique, `git diff --shortstat d7c60a2...bdd6c66` : `6 files changed, 89 insertions(+), 15 deletions(-)`
⇒ **104** (`R25.txt`). ≤ 1 150 (borne de la mission) ; la borne de `ci.yml` l.43 est `VIBEGATES_PR_LIMIT: "1205"`, tenue aussi.

## 6. RUNBOOK
### 6.1 Étape 7, rejeu REPLACE — exécutable ; fail-closed sur l'égalité arbre/unité ; PAS sur sa prémisse ni au re-jeu (→ C-3)
Faits vérifiés : `git diff --stat 496a5a8 d7c60a2 -- <2 fichiers d'arbre, unité, Caddyfile>` **vide** ; de 496a5a8 à `bdd6c66` seul le Caddyfile
change (9+/1−) ; de 496a5a8 à `cab9a29` : vide ; `docs/deploy-CA-bell.json` @`d7c60a2` : `g7 = 496a5a8dc8f6b9bdbf28f61bab8257c88d71642b`, c11
`caddy_replace=true`, c07 `status=404,404,404,404` ; `/f/tmp/bell-dn/G7.txt` (lu, non modifié) = ce même SHA.
Simulation (commande extraite VERBATIM du RUNBOOK, `sim/cmd-verbatim.txt` sha `0685927a…` ; seuls `/f/tmp/bell-dn` → `F:/tmp/g2-bellroot/sim/bell-dn`
et `git -C /f/Monark` → la copie sont substitués ; sortie `sim/SIM.out` sha `a6956405…`) :
- S1 (placeholder → merge simulé `ddf450f8…` du lot sur `cab9a29`) : `same_tree_and_unit=0`, nouveau SHA affiché, `G7-1.txt` = 496a5a8 : **exécutable tel quel**.
- S4 (nouveau G7 dont l'unité diffère) : `same_tree_and_unit=1` ⇒ STOP : **fail-closed**.
- S2 (placeholder laissé littéral) : `fatal: Needed a single revision`, `same_tree_and_unit=128` ⇒ STOP ; `G7.txt` **tronqué à 0 octet** par la
  redirection `>` (motif préexistant de l'étape 2) ; `G7-1.txt` intact.
- **S3 (même commande rejouée)** : `G7-1.txt` écrasé par le NOUVEAU SHA (pointeur de retour arrière perdu) et garde vraie par vacuité (0). Même motif
  pour `cp -p … Caddyfile.bak-bell-2` si le 2ᵉ bloc est rejoué après le `mv`.
- **Prémisse non mesurée** : « The file in place is the previous G7 blob » est affirmé ; aucune commande du rejeu ne compare `sha256sum
  /etc/caddy/Caddyfile` au blob de `G7-1` avant le REPLACE (la 1ʳᵉ passe enregistrait le fichier en place AVANT l'acte ; le rejeu non). Le
  `.bak-bell-2` rend l'acte réversible, mais un fichier inattendu (autre site) serait remplacé en silence, et c11 (mode replace) ne le verrait pas.
### 6.2 Étape 8 — cohérente avec c07
`302 0 https://monarkgate.tech/bell` : `src/curl-manpage.txt` l.3592-3593 [lu] (`redirect_url` sans `--location` = URL où la redirection irait ;
Location absolue ⇒ identique) et l.3618-3619 [lu] (`ssl_verify_result` 0 = succès). c07 exige le même couple (302, Location exacte) sur `/` ; une
Location relative serait rejetée par les deux. `/no-such-file.json` ⇒ `404` : cohérent avec S-8 (même chemin, 404 dans le modèle). Seule la chaîne
`302 0 https://monarkgate.tech/bell` est épinglée par S-8 (M14 tué) ; le `404` ne l'est pas (O-3).

## 7. Corrections — LISTE FERMÉE
- **C-1 (test, `test/verify-bell.test.ts`)** : ajouter UN cas isolé c07 où `/` répond un statut ≠ 302 (301) avec la Location EXACTE
  `https://monarkgate.tech/bell` ; rouge attendu = exactement `["c07_no_directory_listing"]`, exit 1. Mise en œuvre conseillée : un serveur loopback
  dédié (`createServer`) qui répond 301 + Location exacte sur `/` et délègue tout autre chemin au gestionnaire de `serveCaddy` — il ne touche ni le
  modèle ni son type `Redirect.code: 302` (forcer 301 dans le site parsé exigerait un transtypage, exposé à `lint:ratchet`).
  **Critère de mort** : G4 et G7 (anchors de `run-g2.mjs`) rouges.
- **C-2 (modèle, `test/bell-caddy.ts`)** : refuser toute DOUBLE définition d'un matcher nommé (`if (cur.matchers.has(head)) throw …`) et ajouter la
  forme au fail-closed de S-8. Juste quelle que soit la sémantique Caddy ; le fichier committé n'a que des noms uniques (`@immutable`, `@current`,
  `@home`). **Critère de mort** : G6/P13 rouges ; les 13 tests ciblés restent verts.
- **C-3 (docs, `docs/RUNBOOK-bell.md` étape 7, rejeu)** : (a) AVANT le REPLACE, mesurer `ssh … 'sha256sum /etc/caddy/Caddyfile'` ==
  `git -C /f/Monark cat-file blob "$(cat /f/tmp/bell-dn/G7-1.txt):deploy/Caddyfile.monark-bell" | sha256sum`, sinon **STOP** (lire l'hôte ; mode
  IMPORT le cas échéant). Cette mesure est la garde idempotente du 2ᵉ bloc : fichier en place == blob `G7-1` ⇒ procéder (recopier `.bak-bell-2`
  est alors sans perte, y compris après un `caddy validate` en échec sans `mv`) ; == blob du nouveau G7 ⇒ déjà fait, passer à l'étape 8 ; autre ⇒ STOP.
  (b) N'écrire `G7-1.txt` que s'il est absent (`[ -e /f/tmp/bell-dn/G7-1.txt ] || cp /f/tmp/bell-dn/G7.txt /f/tmp/bell-dn/G7-1.txt`) au lieu du `cp`
  inconditionnel : ferme S3 et sa variante S2 puis re-jeu (`rev-parse` en échec ⇒ `G7.txt` vide ⇒ un re-jeu copierait le fichier vide sur `G7-1.txt`).
  **Critère** : rejouer `sim/` ⇒ S1 et S4 inchangés ; S3 laisse `G7-1.txt` = 496a5a8 ; S2 puis re-jeu laisse `G7-1.txt` = 496a5a8. Hors R-25 (docs exclues).

**Jeu de critères exécutable pour le G2-delta** : `node F:/tmp/g2-bellroot/mutants-g2/run-g2.mjs G4 G6 G7` (depuis une copie) ⇒ les trois rouges ;
`p-forms.ts` ⇒ P13 REFUSED ; 13/13 ciblés verts ; `bell_runbook_*` verts (C-3 modifie une prose que `keyUses` et `lang:gate` lisent) ; 6 portes à 0 ;
simulation `sim/` rejouée selon le critère C-3. Pour C-2, si le rédacteur lit [lu] l'analyse des définitions de matchers de `caddyconfig/httpcaddyfile`
(Caddy v2.11.4), le commentaire la cite ; sinon il écrit « sémantique Caddy non établie ici ».

## 8. Observations (non bloquantes, sans dette)
- **O-1** (G8) : le modèle déclare « redir (any method) » ; aucun test n'émet autre chose que GET/HEAD sur `/`. Aucun consommateur (la CA ne fait que GET).
- **O-2** : S2 — la troncature de `G7.txt` sur échec de `rev-parse` est le motif préexistant de l'étape 2 ; le retour arrière (`cp G7-1.txt G7.txt`)
  la couvre ; la branche STOP du rejeu peut le rappeler (intégrable à C-3).
- **O-3** : l'attendu `404` de l'étape 8 n'est pas épinglé par un test (seul `302 0 <cible>` l'est).
- **O-4** : l'amendement ADR-T1b (`cab9a29`, hors lot) écrit « Le modèle fermé … n'admet que cette forme » : exact seulement après C-2.
- **O-5** : la borne R-25 de la mission (1 150) diffère de `ci.yml` (1 205) ; 104 tient les deux.
- Items du RENDU : n°1 porté par `cab9a29` ; n°2 (pas de Caddy local ; demande `docker pull caddy:2.11.4` formée par le rédacteur) maintenue — elle
  trancherait aussi G6 empiriquement, mais n'est pas nécessaire si C-2 est appliquée ; n°3 et n°4 : exacts (vérifiés).

## Déviations du relecteur
- Première exécution de `run-g2.mjs` en erreur de syntaxe (barre oblique inverse perdue par le heredoc du shell) : corrigée avant tout mutant, aucun
  fichier muté par cette exécution.
- Portes lancées par `&` shell (et non par le mode arrière-plan de l'outil) : vérifiées vivantes par leurs journaux.
- Suite complète exécutée dans une 2ᵉ copie en parallèle des mutants et des portes (contention CPU possible, cf. test 42).
- Budget 25 min : voir l'heure de fin en §9.
- Quatre objets git non référencés créés dans la copie `F:\tmp\g2-bellroot\repo\.git` seulement (un blob, un tree, deux commit-tree : le merge
  simulé `ddf450f8…` et le commit S4 `887ac18e…`), jamais poussés ni référencés ; `F:\Monark` et `F:\Monark-wt-bellroot` vérifiés propres
  (`git status --short` vide) à 22:45:41Z.

## 9. Suite complète, portes, heure de fin
- **Suite complète** `npm test` (copie `repo-full`, lancée 22:36:41Z, finie 22:45:11Z, en parallèle des mutants et des portes) : **tests 1171,
  pass 1169, fail 0, cancelled 0, skipped 2, exit 0** (`full/full-test.log` sha `0d49d56e…`, `full/FULL-EXIT.txt` `test_exit=0`). Les 2 skips sont
  les deux préexistants et nommés (SIGTERM sous win32 ; artefacts u4b réels absents). **Test 42 : vert, aucun ETIMEDOUT** (0 occurrence au journal).
- **Portes** (copie `repo` restaurée à `bdd6c66`, `git status` propre) : `vocab=0` (251 fichiers), `lang=0`, `typecheck=0`, `lint=0`,
  `ratchet=0` (69/69, plafond inchangé), `export=0` (`gates/EXITS.txt`). Les 6 journaux sont **octet pour octet identiques** à ceux du rédacteur
  (sha `5975623d…` vocab, `b22ac8f8…` lang, `03481a8f…` typecheck, `f845417c…` lint, `45ede4ce…` ratchet, `2f9645a9…` export).
- Fin des exécutions : 22:45:14Z (23 min depuis 22:22:10Z) ; rédaction finale et revue advisor ensuite.
