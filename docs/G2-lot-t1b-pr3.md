# G2 — PR-3 T-1b-backend (`a31c8f3`, relecteur Opus 5.5, contexte frais)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/g2-t1b-pr3/G2.md` (sha256 89fb4a7c…). Verdict : PASS-AVEC-CORRECTIONS (C-1 RUNBOOK étapes 1/12/13 ; C-2 5 cas P1..P5 tuant g09/g10/g15/g16 ; C-3 modèle Caddy fail-closed sur doublons) — corrections confiées au pli PR-3 en cours avec C-V-6/C-V-7 du cp-2 PR-2 ; oracle PR seule 7 portes 0 (1118/1115/0/3) ; fusion à blanc 6 portes 0 + test 42 EPERM (charge, ESC-G2-1 → rejeu seul avant G7) ; 51/51 mutants G1 tués ; R-25 939.

---

Modèle résolu : claude-opus-5-5[1m]

# G2 — PR-3 lot T-1b-backend (S-7..S-11) — relecteur en contexte frais (instance séparée)

Périmètre : `lot/t1b-pr3` @ `a31c8f323239595c03f0b6c9626d14c80492373d` (worktree `F:\Monark-wt-t1b-pr3`, lecture seule), base PR-1
`64dbbd65e92ad4c991895c76f2fd4e2390912383`. Rendu G1 `F:\tmp\t1b-pr3\RENDU-G1-PR3.md` sha256 `78ac7530c1250c3873319373af89a1a61beaec94fa1ec5b934b2d7d1d3714141`
(conforme à la mission, relu en entier). Rattachement relu dans `F:\Monark` @ `99c25cc` : ADR-T1b-backend v2 (`77f02d0d…`), backlog
(`0b791998…`), rulings (`8448e494…`), CP1 (`a9b1caf7…`), consigne (`543c23c5…`), FAITS précontrôle (`d3525bb8…`) et sauvegardes
(`a4b5a7fd…`) — sha égaux à ceux du G1. Ruling orchestrateur D-1 : chemin **(A)** `/etc/monark/bell/signing-key.pem`.
Écritures du G2 : `F:\tmp\g2-t1b-pr3\` seulement. Aucun commit, aucun workflow, aucun réseau hors loopback (`npm ci --offline`), aucune
clé réelle (clés de test générées en mémoire par les tests), aucun VPS, aucune variable d'environnement affichée.

## VERDICT : PASS-AVEC-CORRECTIONS (liste fermée C-1, C-2, C-3 ; aucune n'invalide le code livré)

L'unité, le Caddyfile, la CA, les gardes S-10 et le RUNBOOK tiennent leurs critères nommés S-7..S-11 (rejoués ci-dessous). Les
corrections portent sur la **force de la preuve** (tests qui ne tuent pas 6 mutants plausibles de sous-prédicats revendiqués) et sur
deux étapes du RUNBOOK incomplètes au sens littéral de S-11. Toutes sont test-only ou docs-only ; R-25 estimé après pli ≈ 975-985
(≤ 1 150). La faisabilité de C-2 est PROUVÉE (sonde 5/5 verte sur le lot, et tuant g09/g10/g15/g16, §4).

**Réserve d'oracle, en clair** : oracle du LOT = 7 × exit 0 (1 118 / 1 115 / 0 / 3). Oracle de la FUSION à blanc dans `99c25cc` = 0 conflit, 6 portes
exit 0, **porte test ROUGE** (1 fail : test 42 `EPERM` dans le `finally`, sous charge ET au rejeu seul) — non imputable aux fichiers de la PR mais
**bloquant pour le G7** tant qu'un rejeu vert n'existe pas : **ESC-G2-1** (§6-bis).

- **C-1 (docs, `docs/RUNBOOK-bell.md`)** — (a) **étape 12** : aucune commande en bloc, aucun « Expected », aucun « Rollback » ; **étape 13** :
  aucun « Rollback » (compte par section, `logs/` ci-dessous) ⇒ critère S-11 « chaque étape nomme sa commande, sa sortie attendue et
  son retour arrière » et convention du RUNBOOK l.29 non tenus sur 2/13 étapes. Ajouter : étape 12 = bloc d'une ligne (ceinture
  `env -u` × 8 + `npm run ci && npm run lint && npm run lint:ratchet && npm run lang:gate && npm run export:check`), Expected (5 × exit 0,
  comptes TAP), Rollback (avant push : retrait du commit local ; après push : aucun effaçant, commit correctif) ; étape 13 =
  « Rollback: none (read-only; the mirror file is kept) ». (b) **Provenance de l'étape 1** : « Expected (measured … FAITS-vps-bell-precheck) »
  couvre aussi `yes` (NTP), `/usr/bin/node` (`command -v node`) et `/usr/bin/sudo`, ABSENTS de ce FAITS (grep : 0 occurrence de
  `NTP`/`timedatectl`/`sudo`/`/usr/bin/node` dans les deux FAITS) ; NTP est « synchronisé » dans `CHANTIERS.md:123` (2026-09-20).
  Citer la bonne pièce ou marquer « attendu, non mesuré ». `error_origin` : **rédacteur G1**.
- **C-2 (test-only, `test/verify-bell.test.ts`, `verify_bell_ca_checks_named_and_fail_closed`)** — 4 mutants propres SURVIVENT : g09
  (`jwkPublic` forcé vrai), g10 (`shapes` forcé faux) — les sous-prédicats (a) « aucun motif privé dans les corps servis » et (b) « JWK
  publics seulement » du contrôle 10 (définition G1 D-4) ne sont jamais mis seuls en échec (le seul défaut c10 est un `signing-key.pem`
  planté, attrapé par les sondes de chemins) ; g15 (test de taille retiré) — l'« ensemble exact » de l'arbre (contrôle 11 (a), G1 §3 S-9)
  n'est pas prouvé ; g16 (compte d'`import` relâché) — le **mode import** du contrôle 11 (b), exigé par S-9 (b) et ADR §D11 (b), n'est
  jamais exercé (ni accepté, ni refusé). Ajouter 5 cas, chacun rouge EXACTEMENT sur le contrôle visé (constructions prouvées, §4) :
  P1 `provenance.json` servi portant un membre `"d"` base64url de 43 caractères ⇒ {c10} ; P2 trousseau committé ET `/bell/pubkey.json`
  servi portant un membre JWK non public (`"use":"sig"`) ⇒ {c10} (c03 reste vert : égalité canonique) ; P3 `tree.sha256` avec une
  3ᵉ ligne ⇒ {c11} ; P4 mode import (`caddyfile-main` = autre site + UNE ligne `import /etc/caddy/monark-bell.caddyfile`,
  `caddyfile-dedicated` == blob) ⇒ 12/12 vert ; P5 deux lignes `import` ⇒ {c11}. Sans ces cas, la revendication du G1 (D-4, « ensemble
  exact », mode import) est déclarative. `error_origin` : **rédacteur G1**.
- **C-3 (test-only, `test/bell-caddy.ts`)** — le modèle « à sous-ensemble fermé » se déclare fail-closed (« Anything else … makes
  `serveCaddy` throw ») mais lit un `root` ou un `file_server` **dupliqué** en « le dernier gagne » (l.124-125), sémantique qui n'est pas
  celle de Caddy (instances à matchers). Deux mutants propres survivent au test S-8 : g04 `file_server /states/* browse` + `file_server`
  (listing de `/states/` sous Caddy ; le modèle voit `browse=false`) et g14 `root /bell/* /etc/monark` + `root * …/public` (racine
  élargie pour `/bell/*` ; le modèle voit la seconde). Ce sont les mutants nommés du backlog S-8 (« `browse` ajouté », « `root` élargi »)
  sous une autre forme valide. Correction : `parseCaddyfile` lève sur un second `root` ou `file_server`, et sur tout jeton autre que
  `*`+chemin pour `root` et autre que `browse` pour `file_server` (≈ 4 lignes). Au D-n, la CA vivante couvrirait les deux formes (g04 : listing
  de `/states/` ⇒ contrôle 7 rouge ; g14 : `/bell/pubkey.json` servi depuis `/etc/monark/bell/pubkey.json`, absent ⇒ non-200 ⇒ contrôles 3, 6 et 8
  rouges) : C-3 porte sur la propriété fail-closed DÉCLARÉE du modèle (« le dernier gagne » ≠ Caddy), non sur un trou au D-n. `error_origin` : **rédacteur G1**.

## 1. Diff et périmètre (rejoué sur objets committés, `a6-r25.sh`, `logs/a6-r25.log` sha `785cc911…f484`)

- `git diff --name-status 64dbbd6..a31c8f3` : **11 fichiers** (8 A, 3 M), exactement les 11 autorisés (comparaison triée, `diff` exit 0).
- Invariant backlog (12 chemins verbatim, dont `apps/site`, `apps/bell/src`, `packages/contracts`, unités sonde/harness/sentinelle) : 0 ligne ;
  `apps/bell/src`, `apps/site`, `packages` entiers : 0 ligne.
- 12 voisins gelés, blob(base) == blob(tête) : `bell-chain.mjs` `42d36b02…`, `bell-chain.d.mts`, `bell-publish.mjs` `14175454…`,
  `bell-publish.d.mts`, `bell-report.mjs`, `digest.ts` `e7ee1a25…`, `collect.ts` `130168aa…`, `monark-probe.service`, `monark-harness.service`,
  `no-cash-provider-name.test.ts`, `ci.yml` `468e17b6…`, **gel U-4b** `ADR-U4b-calibration-episode-frais.md` `59e03d74…` (A-6 ; la mission dit
  « 9 gelés » : liste non retrouvée à l'identique, surensemble de 12 contrôlé, tous inchangés).
- `DELIVERED.sha256` du G1 : `sha256sum -c` 11 × OK ; blob `a31c8f3` == fichier du worktree, 11/11.

## 2. Lecture adversariale (critère par critère ; preuve = fichier:ligne à `a31c8f3`)

**S-7 unité** (`deploy/monark-bell-publish.service`) : sections `[Unit]`+`[Service]` seules ; `User=bell` (l.37), `Group=bell`, `PrivateNetwork=yes`
(l.46), `LoadCredential=bell-signing-key:/etc/monark/bell/signing-key.pem` (l.28, chemin (A)), `ProtectSystem=strict`, `ReadWritePaths=/var/lib/monark-bell`
(seule valeur), `UMask=0022`, `CPUQuota=25%`, `MemoryMax=512M`, `--max-old-space-size=448` dans `ExecStart` (l.27), `TasksMax=32`, `TimeoutStartSec=120`,
`NoNewPrivileges=true`, `ProtectHome=true`, `PrivateTmp=true` ; ni `EnvironmentFile`/`Environment` ni `[Install]` — **conforme** §D10 + C-7. L'ID de
credential == nom lu par `runCli` (`bell-publish.mjs:309`, `join(credDir, "bell-signing-key")`) ; la clé est lue AVANT l'inbox (l.306-311 puis
`publishToDir` l.256) : l'attendu `inbox_not_exactly_one_bundle` du démarrage à blanc (RUNBOOK étape 6) prouve donc bien la lecture du credential ;
`inspect` est en lecture seule (l.161) : « rien écrit » tient. Ensemble fermé : un doublon de directive (accumulation systemd) rougit (g02 tué).

**S-8 Caddyfile** : un bloc `bell.monarkgate.tech` ; `root * /var/lib/monark-bell/public` == `<--state>/public` ; `file_server` sans `browse` ; ACAO `*`
et `nosniff` sans matcher (toutes routes) ; `@immutable path /states/* /provenance/*` ⇒ `public, max-age=31536000, immutable` ; `@current not path …`
⇒ `no-cache` (complémentaires, indépendants de l'ordre) ; ni `reverse_proxy` ni `log` (C-2) ; `/bell/pubkey.json` par le même `root` (C-10) — **conforme**.
Limite du modèle : C-3.

**S-9 CA** (`scripts/verify-bell.mjs`) : 12 noms fermés (l.32-34) ; `code` 0 ssi les 12 `ok` (l.217) ; `VERIFY OK` imprimé ssi `failed.length === 0`
(l.226-227), même prédicat ; usage invalide ⇒ 2. c03 = égalité canonique servi/trousseau (l.150) ; c05 = `node <bell-verify> <url> --keyring <trousseau>`
(l.85-91 ; argv asserté par le test) ; c09 : la CLI ne passe jamais `deps` ⇒ cible http = `skipped` ⇒ rouge (l.172-175) ; c11 (a) `git cat-file blob <G7>:<p>`
(l.83), ensemble exact par la taille (l.187, non prouvé : C-2) ; (b) remplacement ou dédié + une ligne `import` (l.190-194, mode import non prouvé : C-2) ;
(c) un seul en-tête, ligne 0, `/etc/systemd/system/monark-bell-publish.service`, **fragment** == blob, `NeedDaemonReload` == `no` (l.195-200) ; c12 avant == après,
non vides, portant `probe.env` et `probe-narabi.mjs` (l.206-209). Aucune lecture d'environnement (`process.env` : 0 occurrence dans les 4 sources neuves).
Le vérificateur du contrôle 5 est exécuté depuis l'arbre de travail de l'opérateur (non le blob G7) ; le JSON épingle `bell_verify_sha256` : auditable (O-7).

**S-10 gardes** : JWK `"d"` (≥ 40 base64url) et DER PKCS#8 (préfixe construit depuis l'hex) dans `no_secret_in_repo` et `PRIVATE_SHAPES` ; non-vacuité sur
clé générée ; KAT vert sans exception (le parcours de tout l'arbre est vert dans les deux oracles) ; scope `bell` : `dirs` += `apps/bell/scripts`,
`extensions` += `.mjs` — **conforme** (s01-s06, g11, g11b tués).

**S-11 RUNBOOK** : 13 étapes ; §0 portes G-a..G-e toutes avant l'étape 9 (G-a avant 2, G-c avant 4, G-d avant 7, G-b/G-e avant 9), chacune avec sa
pièce ; clé après G-c ; mode REMPLACEMENT avec `caddy validate --config /etc/caddy/Caddyfile.new --adapter caddyfile` AVANT `mv` puis `systemctl reload`
(étape 7), branche IMPORT décrite ; traversée `sudo -u caddy test -x` (étape 3) ; phrase « détectable par qui » (en-tête, étape 13) ; 0 `cat`/`sha256sum`
du fichier de clé (le chemin n'apparaît que sous `--generate-key`, `stat`, `shred -u`) ; `set -x`/`printenv` seulement en prose (l.32, l.297) ; 0 `\`
dans les blocs (compte Node, 1 seul `\` en prose l.29) ; valeurs attendues de l'étape 1 présentes dans les FAITS (v24.21.0, 259.5-0ubuntu3.4, v2.11.4,
11.19.0, 21 lignes, 94 G, ufw 22/80/443, `run-p19072-i21642`, 26.04 dans FAITS-hostinger) sauf 3 (C-1 (b)). Étapes 12/13 : C-1 (a).

## 3. Mutants

**Rejeu G1** (`mutants-g1-replay.mjs` sha `cc6af29e…94bc` = harnais G1 `33b17fb3…c630` avec SEULEMENT 4 chemins substitués — WT, OUT, TEMP, nom du
harnais ; `diff` relu : 6 lignes, toutes des chemins) dans l'arbre dédié `mut` (clone `a31c8f3`) : bases vertes 4/4, **51/51 KILLED byIntended**
(`not ok <n> - <visé>` exigé, A-11), restauration 51/51, arbre propre après (`logs/mutants-g1-replay.log`, `mutants-g1\REPORT.jsonl` sha `d1c80a4a…22d8`,
un TAP par mutant avec en-tête A-12).

**Mutants propres** (`mutants-g2.mjs` sha `97a1a020…8095`, écrit par Write, verdict PRÉDIT avant exécution ; `logs/mutants-g2.log`,
`mutants-g2\REPORT.jsonl` sha `55e1534b…2787`) : **10 KILLED / 17, 7 SURVIVED, 0 écart à la prédiction**, restauration 17/17, arbre propre après.

| id | mutation | test visé | verdict |
|---|---|---|---|
| g01 | `PrivateNetwork=no` | S-7 | KILLED |
| g02 | seconde ligne `ReadWritePaths=/etc/monark` | S-7 | KILLED |
| g03 | `ReadWritePaths=/var/lib` | S-7 | KILLED |
| g04 | `file_server /states/* browse` + `file_server` | S-8 | **SURVIVED** (C-3) |
| g05 | `file_server { browse }` (forme bloc) | S-8 | KILLED |
| g06 | ACAO sous `@immutable` seulement | S-8 | KILLED |
| g14 | `root /bell/* /etc/monark` + `root * …/public` | S-8 | **SURVIVED** (C-3) |
| g07 | contrôle 11 : `headers.length >= 1` (aveugle au drop-in) | S-9 | KILLED |
| g08 | contrôle 9 : objet `skipped` marqué `authorized: true` | CLI http | KILLED |
| g09 | contrôle 10 : `jwkPublic = true` | S-9 | **SURVIVED** (C-2) |
| g10 | contrôle 10 : `shapes = false` | S-9 | **SURVIVED** (C-2) |
| g15 | contrôle 11 : taille de l'arbre non comparée | S-9 | **SURVIVED** (C-2) |
| g16 | contrôle 11 : `imports.includes(…)` | S-9 | **SURVIVED** (C-2) |
| g11 | garde racine : JWK `{44,}` (un `d` Ed25519 fait 43) | `no_secret_in_repo` | KILLED |
| g11b | CA `PRIVATE_SHAPES` JWK `{44,}` | `bell_no_secret_in_repo` | KILLED |
| g12 | RUNBOOK `base64 -w0 <clé>` | S-11 hygiène | KILLED |
| g13 | RUNBOOK `cat /etc/monark/bell/*.pem` | S-11 hygiène | **SURVIVED** (O-1) |

## 4. Preuve de faisabilité de C-2 (hors dépôt)

`probe\probe-isolations.test.mjs` (sha `718da91c…1d55`) importe le modèle, la CA et le trousseau de l'arbre `mut` et rejoue les coutures du test :
**5/5 ok** sur le lot (`probe\probe.tap` sha `8f790df6…cab7`) — base 12/12 vert ; P1 ⇒ {c10} ; P2 ⇒ {c10} (c03 vert) ; P3 ⇒ {c11} ; P4 vert 12/12 ;
P5 ⇒ {c11}. `probe\kill-survivors.mjs` (sha `99f9ca5a…e9a5`) : sous chaque mutant, le cas proposé rougit — **g09 KILLED par P2, g10 par P1, g15 par P3,
g16 par P4/P5**, restauration 4/4 (`probe\kill-survivors.log`, `probe\kill-g*.tap`). (Note de méthode : l'avis intégré estimait g09 non isolable sans
casser c03 ; P2 le fait en portant le même membre non secret dans le trousseau committé ET dans la clé servie — mesuré, pas supposé.)

## 5. D-16 (TLA / `--test-force-exit`)

- TAP de l'oracle du lot (commande exacte du script npm `test`) : les 9 tests neufs + 2 étendus présents — `ok 896-899`, `ok 1106-1109` (dont 1109
  `# SKIP PR-2 not merged…`), `ok 49`, `ok 51`, `ok 984` ; mêmes numéros que le G1 ; arbre fusionné : `ok 916-919`, `ok 1127-1130`, `ok 49`, `ok 51`, `ok 1005`.
- Statique (`tla-scan.mjs` sha `7c3e83e4…8842`, 138 fichiers de test du lot) : 3 fichiers à `await` de premier niveau, tous AVANT le premier `test()`
  (`bell-deploy-config.test.ts:25`<52, `verify-bell.test.ts:34`<88, `bell-publish-validate.test.ts:72`<96) ; 0 tardif. Arbre fusionné : 1 signal,
  `packages/rpc-guard/test/durable.test.ts:198`, **faux positif** (texte d'un gabarit passé à `node -e`, inspecté l.193-205).

## 6. Oracles 7 portes (`run-oracle.sh` sha `971c4573…c8e`, forme `F:\tmp\g2-ukemirevert\oracle\run-oracle.sh`, ceinture `env -u` × 8, codes capturés sans pipe)

- **Lot, clone @ `a31c8f3`** (18:06:58Z → 18:16:44Z) : **7 × exit 0** ; TAP `oracle\lot\test.tap` sha `eb11595e…ffe9` : **tests 1 118 / pass 1 115 /
  fail 0 / cancelled 0 / skipped 3 / todo 0** = attendu ; 0 `not ok` à tout niveau ; 3 skips = 2 préexistants + skip nommé PR-2.
- **Fusion à blanc** dans la pointe `lot/etude-suite` `99c25cc` (≥ `89771ff`), worktree de MON clone, `git merge --no-commit --no-ff a31c8f3` : « Automatic
  merge went well », **0 conflit** ; index `59b82a6ecc7698288b304a51941102ec8bbd2ecc` (PR-1 + PR-3 entrent ensemble : `64dbbd6` n'est pas dans la pointe).
  Oracle (18:07:01Z → 18:25:14Z) : gate:vocab, typecheck, lint, lint:ratchet, lang:gate, export:check exit 0 ; **test exit 1** : `# tests 1 139 / pass
  1 135 / fail 1 / skipped 3`, l'unique `not ok` = `export_public_no_governance_no_french` (test 42), `EPERM` sur `rmSync` du répertoire temporaire
  (`export-public.test.ts:334`), durée 838 s sous charge (2 oracles + mutants en parallèle) — le cas prévu par la mission (EXPORT-TEST42-EPERM-1).
  Rejeu SEUL du fichier : voir §6-bis. Autres contrôles : les 11 tests de la PR présents ; skipped == 3 ; les 2 noms du lot absents du TAP fusionné
  sont des renommages de la pointe (`fleet_register_built_set_is_frozen`, `visage_register_is_frozen` : comptes amendés par SITE-CHARTE-C `0b0249d`),
  présents sous leur nouvelle description (`ok 938`, `ok 1134`). Arithmétique pointe+PR non reconstituée (compte de la pointe non mesuré ici).

### 6-bis. Test 42 rejoué seul (arbre fusionné) — ROUGE AU REJEU SEUL (même EPERM) ⇒ oracle fusionné NON VERT

- `node --test --test-timeout=120000 --test-force-exit --test-reporter=tap test/export-public.test.ts` (ceinture × 8), 18:26Z → 18:38:09Z :
  **exit=1**, `tests 2 / pass 1 / fail 1`, `not ok 1 - export_public_no_governance_no_french` : **`EPERM` sur `rmSync` du répertoire d'export temporaire,
  dans le `finally`** (`export-public.test.ts:334`, `maxRetries: 60` de `99c25cc`), durée 741 s (`oracle\merged\test42-alone.tap`).
- **Ambiguïté mesurée, non levée** : l'`EPERM` est levé dans le `finally` ; en JS une exception du `finally` REMPLACE celle du `try` ⇒ ce TAP ne permet
  PAS de savoir si les assertions du test (export sans gouvernance ni français, `npm run ci` de l'export ≥ 70 tests) ont passé. Dans l'arbre du LOT
  (`a31c8f3` = PR-1 + PR-3 sur `c0f905c`) le même test est **vert** (oracle du lot, 0 fail) : les fichiers de la PR ne font pas rougir l'export ; ce qui
  reste non prouvé est la combinaison pointe `99c25cc` + PR-1 + PR-3.
- **Conséquence (blocage du G7, pas de la PR-3)** : ESC-G2-1 ci-dessous. Le fichier n'est pas touché par la PR ; le verdict PR-3 reste
  PASS-AVEC-CORRECTIONS.
- Répertoires d'export laissés par les deux échecs (`F:\tmp\g2-t1b-pr3\tmp\monark-export-*`) : tentative de suppression lancée à 18:39Z (preuve du verrou
  transitoire si elle réussit), journal de la tâche de fond ; sans incidence sur le verdict.

**ESC-G2-1 (à l'orchestrateur, bloquant pour le G7 de l'arbre fusionné)** : rejouer le test 42 de l'arbre fusionné sur machine NON chargée et/ou avec un
`finally` qui n'écrase pas l'erreur du `try` (p. ex. `try { rmSync(...) } catch (e) { process.stderr.write(...) }` — rattaché à EXPORT-TEST42-EPERM-1,
propriétaire orchestrateur, déclencheur : avant l'oracle G7 PR-3) ; tant que ce rejeu n'est pas vert, « 7 portes × exit 0 » n'est PAS acquis pour la fusion.

## 7. R-25 (forme CI exacte)

`git diff --shortstat 64dbbd6...a31c8f3 -- <pathspec ci.yml:65 verbatim>` = « 10 files changed, 935 insertions(+), 4 deletions(-) » ; awk de la CI
verbatim ⇒ **939** (borne 1 205, cible 1 150). Avec les docs : 11 fichiers, 1 235 + 4 (le RUNBOOK, 300 l., exclu par `:(exclude,glob)docs/**/*.md`).

## 8. A-7

Chaque test, mutant, sonde et porte d'oracle lancé sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL
-u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY` (et les harnais retirent aussi les 8 clés de leur `env`
enfant) ; TEMP/TMP/TMPDIR = `F:\tmp\g2-t1b-pr3\tmp` ; aucune variable ni environnement affiché ; la CA et les tests neufs ne lisent aucune variable.

## 9. Observations (non bloquantes) et items formés (aucun « dû » nu)

- **O-1 (g13)** : le garde `bell_runbook_never_prints_private_key` est textuel sur le chemin EXACT ; `cat /etc/monark/bell/*.pem` (ou une archive du
  répertoire) passe. Déclaré « hygiène » par le G1. Proposition : refuser tout jeton `/etc/monark/bell/` hors {`install -d`, `ls -d`, `stat`, `rm -rf`
  de retour arrière} et hors des 4 usages permis du chemin. Item **RUNBOOK-KEY-GLOB-1** (propriétaire orchestrateur ; déclencheur : le pli C-1, ou
  toute édition suivante du RUNBOOK).
- **O-2** : libellé `caddy_import=false` quand un Caddyfile REMPLACÉ a dérivé (G1 §12) — verdict juste, détail trompeur ; à fondre dans le pli C-2
  (détail `caddy_mode=replace|import`).
- **O-3** : l'étape 4 du RUNBOOK dépend de `--generate-key` (PR-2 S-6), absent à `a31c8f3` (`runCli` ne lit que `--inbox`/`--state`) ; les comptes
  `grep -c` attendus dépendent du format de sortie de PR-2 ⇒ à rejouer dans **BELL-VERIFY-CLI-MERGE-1** (le RUNBOOK le dit : « re-read its G7 »).
- **O-4** : ruling D-1 (A) appliqué uniformément dans la PR (0 occurrence de `credstore` dans les 11 fichiers ; épinglé par l'assertion `KEY_PATH` et r06) ;
  `FAITS-hostinger-backups-vps-bell-2026-09-23.md:26` porte encore (B) `/etc/credstore/bell-ed25519.key` : l'amendement §D13.3 inséré au G7 doit porter (A)
  seul (ligne d'erratum du FAITS ou renvoi au ruling), sinon l'ADR aura deux chemins.
- **O-5** : le scope vocab `bell` balaie désormais `apps/bell/scripts/*.mjs` : à la fusion de PR-2, `bell-verify.mjs` sera scanné par la règle « verified nu »
  (cohérent avec C-9) ; la preuve est l'oracle de l'arbre fusionné PR-2 (même item BELL-VERIFY-CLI-MERGE-1).
- **O-6** : test 42 `EPERM` dans le `finally` (EXPORT-TEST42-EPERM-1) : sous charge (838 s) ET au rejeu seul (741 s) dans l'arbre fusionné ; les
  retries 60 s de `99c25cc` ne suffisent pas ici ; défaut de conception du test à signaler : l'exception du `finally` MASQUE le résultat des assertions
  (§6-bis, ESC-G2-1). Aucun lien avec les fichiers de la PR (non touché ; vert dans l'arbre du lot).
- **O-7** : la CA lit `--keyring` comme un fichier sans vérifier qu'il est committé (le RUNBOOK commite à l'étape 5 avant la CA de l'étape 11 ; le JSON épingle
  `keyring_sha256`) ; durcissement possible : comparer à `git cat-file blob HEAD:apps/bell/keys/bell-keyring.json`. Même item que O-3.
- Items du G1 confirmés sans objection : BELL-JSONL-CTYPE-1, BELL-VERIFY-CLI-MERGE-1, BELL-CADDY-MODEL-SHARE-1, BELL-CADDY-ADMIN-CONFIG-1, TEST-TLA-FORCE-EXIT-1.

## 10. `error_origin` (proposés ; assignés au G7)

C-1, C-2, C-3 : **rédacteur G1** (livrable et tests de la PR). O-4 : **planificateur** (deux textes de l'orchestrateur, déjà tranché par D-1). O-6 : **environnement**
(verrou win32 transitoire sous charge).

## 11. Provenance

- Relecteur `claude-opus-5-5[1m]` (effort max), instance séparée, contexte frais, 2026-09-23, horloge `date -u` : début 17:50:11Z.
- Arbres (laissés en place, à retirer par l'orchestrateur s'il le souhaite) : `F:\tmp\g2-t1b-pr3\clone` (`a31c8f3`), worktrees détachés de MON clone
  `mut` (`a31c8f3`, propre) et `merged` (`99c25cc` + merge `--no-commit` jamais conclu) ; aucune écriture sous `F:\Monark*`.
- Scripts et preuves (sha256) : `setup.sh` `ff643593…980d`, `run-oracle.sh` `971c4573…fc8e`, `a6-r25.sh` `4da9c83e…cb54`, `mutants-g1-replay.mjs`
  `cc6af29e…94bc`, `mutants-g2.mjs` `97a1a020…8095`, `tla-scan.mjs` `7c3e83e4…8842`, `probe\probe-isolations.test.mjs` `718da91c…1d55`,
  `probe\kill-survivors.mjs` `99f9ca5a…e9a5` ; rapports `mutants-g1\REPORT.jsonl` `d1c80a4a…22d8`, `mutants-g2\REPORT.jsonl` `55e1534b…2787` ;
  TAP `oracle\lot\test.tap` `eb11595e…ffe9`, `oracle\merged\test.tap` `7a38132d…d3d219` ; journaux `logs\`.
- Advisor intégré : appel 1 après l'orientation et les premiers rejeux (avis suivi : oracle fusionné avant verdict, grep FAITS, forme des corrections ;
  divergence sur g09 tranchée par mesure, §4) ; appel 2 de clôture après écriture de ce fichier.

## Journal

- 17:50Z — HEAD worktree = a31c8f3 ; `git status` propre ; `sha256sum -c DELIVERED.sha256` 11 × OK ; blobs == worktree 11/11.
- 17:58-18:06Z — arbres isolés (`setup.sh`, `logs/setup.log`), merge à blanc 0 conflit, `npm ci --offline` × 3 exit 0, `require.resolve` dans chaque arbre.
- 18:06Z — oracles lancés (lot, fusion) ; 18:08-18:13Z rejeu 51/51 ; 18:15Z A-6 + R-25 939 ; 18:15Z oracle du lot 1 118/1 115/0/3 ; 18:16-18:19Z
  mutants propres 10/17 tués, 7 survivants prédits ; 18:20Z RUNBOOK étapes 12/13 ; 18:21Z avis intégré ; 18:22-18:25Z sonde 5/5 et kill 4/4 ;
  18:25Z oracle fusionné 6 × 0 + test 42 EPERM ; 18:26Z rejeu seul du test 42 lancé ; 18:27Z FAITS relus (C-1 (b)) ; 18:29Z G2.md écrit, avis de
  clôture (phrase g14 de C-3 corrigée : la CA vivante couvrirait g14 par c03/c06/c08) ; 18:38Z rejeu seul du test 42 : EPERM dans le `finally` ⇒ ESC-G2-1.
