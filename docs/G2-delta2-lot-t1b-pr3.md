# G2-delta-2 — PR-3 bis + ter T-1b (`1353a79`, `5da8962`, relecteur Opus 5.5, contexte frais)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/g2d-t1b-pr3/bis/G2.md` (sha256 391dee28…). Verdict : **PASS** — C-D-1 corrigée (o05 tué, exemption unique épinglée), RUNBOOK-KEY-GLOB-1 CLOS (g13/o04/o07 tués), T4-KEYRING-DASH-1 CLOS (test 4 12/12, sonde `x` en `-` exit 0 à l'étape 5 et R2, R2 produit un trousseau accepté par PR-2 `55bcdac`) ; 64/64 + 19 propres ; portes 0 ; R-25 1 018 ; arbre fusionné = merge-tree `b0217114`. Items : RUNBOOK-KEY-DIR-1 (d01-d03, non bloquant G-e), R2-KEYRING-PIN-1 (d05 : `--` de R2 non épinglé par un test), HTTP-TEST-CRASH-1 3e occurrence (0xC0000409 sous mutant v06).

---

# G2-delta bis — lot T-1b-backend PR-3 : `1353a79` (pli bis du worker) + `5da8962` (ter, orchestrateur), branche `lot/t1b-pr3`

Relecteur G2 en contexte frais, instance séparée du rédacteur. Modèle résolu **`claude-opus-5-5[1m]`** (préfixe R-1 conforme), effort max,
2026-09-23, 21:00:47Z → 21:1xZ (horloges lues en §9). Lecture seule sur les dépôts : `git fetch` de `F:\Monark` dans MON clone
(`F:\tmp\g2d-t1b-pr3\clone`) ; arbres de travail sous `F:\tmp\g2d-t1b-pr3\bis\` seulement ; aucun commit, aucun workflow, aucun réseau
hors loopback (`npm ci --offline`) ; ceinture A-7 `env -u` × 8 sur chaque commande et dans chaque harnais ; TEMP/TMP/TMPDIR =
`F:/tmp/g2d-t1b-pr3/bis/tmp` ; aucune clé réelle (clés Ed25519 de test en mémoire, seule la partie publique `x` sert).

Entrées : rendu `F:\tmp\t1b-pr3-bis\RENDU.md`, `PLI.diff` (`91b8a25d…`), `mutants-own.mjs`, `flake-x-dash.mjs` ; mon G2-delta
`F:\tmp\g2d-t1b-pr3\G2.md` (`656e7066…`, C-D-1, O-D1..O-D5) ; cp-2 PR-3 `F:\tmp\cp2-t1b-pr3\CP2.md` (C-V-5, l.79).

## VERDICT : PASS

C-D-1 est corrigée et prouvée. RUNBOOK-KEY-GLOB-1 remplit son critère de clôture. La preuve de clôture de T4-KEYRING-DASH-1 est obtenue.
Le rejeu donne 64/64 et 19/19 prédictions tenues sur mes mutants propres. Les 5 portes demandées sont à 0 et R-25 vaut 1 018.
Aucune correction n'est demandée. Les résiduels RUNBOOK-KEY-DIR-1 sont **réels** (3 mutants survivent, comme prédit), mais ce sont
des **items et non des bloqueurs G-e** (§8). Une observation nouvelle (O-B1, `--` de R2 non épinglé par un test) est formée en item.

## 1. Périmètre (`logs/s1-scope.log` `c49e9a75…`)

- `git diff --name-status bca7f5d 5da8962` : **2 × M**, `docs/RUNBOOK-bell.md` et `test/bell-deploy-config.test.ts`, rien d'autre.
  - Parents : `1353a79^` = `bca7f5d` ; `5da8962^` = `1353a79`.
  - `64dbbd6..5da8962` : toujours les 11 chemins autorisés de la PR-3.
- `git diff bca7f5d 1353a79` est identique octet pour octet à `PLI.diff` (`cmp` 0).
- **9 gelés U-4b**, sha LF à `5da8962` : SAME × 9 contre `bca7f5d`, donc les mêmes valeurs que le prereg §2.

## 2. C-D-1 (masque D-P2)

- **Correction** : `PROSE_KEY_MENTIONS` est une liste fermée à **une seule entrée**, ``root:root 0600, at `${KEY_PATH}` (ruling D-1 (A)``.
  Seul le chemin **dans cette phrase** est masqué. Toute autre mention devient un usage, analysée par segment complet.
- **Exemption présente exactement une fois** : décompte indépendant (`exemption-count.mjs` `15420ab2…`, `logs/c-d-1-exemption.log`
  `84da26f6…`) :
  - 1 entrée dans le littéral ;
  - 1 occurrence de la phrase dans le RUNBOOK livré, tolérante au retour à la ligne (commence l.59, chemin l.60) ;
  - c'est aussi la seule mention nue du chemin en code en ligne.
  - L'unicité est **imposée par le test** (`assert.equal(text.match(phrase(p))?.length, 1, …)`) : mon mutant **d06** (phrase dupliquée
    ailleurs) est **KILLED**.
- **Mutants** (arbre `bis/pr3` = `5da8962`) :
  - **o05** (``Record sha256sum `<clé>` in the JOURNAL.``) : **KILLED**, « found: '/etc/monark/bell/signing-key.pem' ». Il SURVIVAIT à
    `bca7f5d` ;
  - **o06** : **KILLED** ;
  - **r01** et **r03** : **KILLED** (rejeu des 64).
- **RUNBOOK livré vert** : `ok 3 - bell_runbook_never_prints_private_key`, 4/4 dans la base du harnais
  (`mutants-replay/baseline-bell-deploy-config.test.ts.tap`).

## 3. RUNBOOK-KEY-GLOB-1 : glob et formes en ligne

- **o04** (R1 `cat <nouvelle clé>`) : **KILLED**, « found: 'cat /etc/monark/bell/signing-key-new.pem' ».
- **o07** (R3 `set -x;` en ligne) : **KILLED**, par l'hygiène désormais appliquée à tout le RUNBOOK hors des deux passages
  d'interdiction.
- **g13** (glob `cat /etc/monark/bell/*.pem`, copié mot pour mot de `mutants-g2.mjs:48`, `97a1a020…`) : **KILLED**,
  « found: 'cat /etc/monark/bell/*.pem' ».
- Critère écrit de l'item (G2 PR-3 O-1, cp-2 §4 : « g13 tué + un `set -x` planté dans R3 tué ») **tenu**, ainsi que l'O-D2 de mon
  G2-delta (o04). **Clôture de RUNBOOK-KEY-GLOB-1 proposée** ; les résiduels passent à RUNBOOK-KEY-DIR-1 (§8).
- **Décompte des chemins sous `/etc/monark/bell/` dans le RUNBOOK livré** (`KEY_DIR_PATH`) : 12 occurrences, l.60, 128 × 2, 136, 305, 311
  × 2, 314 × 4, 319. Toutes rentrent dans les six usages ou dans l'exemption, ce que confirme le test vert.
- Le garde reste une **hygiène textuelle**, conformément à son commentaire (« not a branching proof »). Il n'est pas fait pour résister à
  un auteur qui cacherait le chemin exprès :
  - une instruction sans chemin placée après la phrase exemptée ;
  - une variable ;
  - un chemin écrit autrement (`//`, `'/etc/monark/bell'/…`).
  Limite déclarée par le worker (RENDU §9) ; ce n'est pas une dette.

## 4. T4-KEYRING-DASH-1

**Test 4 : 12 passages sur 12 verts** (`t4-loop.sh`, `logs/t4-loop.log` `4677756b…`, TAP `logs/t4/pass-{1..12}.tap`). Chaque passage
utilise une clé aléatoire neuve.

**Sonde déterministe** (`t4-probe.mjs` `60d20e42…`, `logs/t4-probe.log` `5dca48a6…`, exit 0, « T4 PROBE: ALL OK ») :
- **(a) Commande de l'étape 5, extraite exactement comme le fait le test 4** : même regex, avec `--` ; `js` sha `12b26115…`, identique
  au `js` du worker.
  - Lancée **exactement comme le test 4** (`[--input-type=module, -e, js, --, x, id]`), avec un `x` commençant par `-` :
    **exit 0**, stdout == trousseau canonique. Vérifié avec le cwd de l'arbre PR-3 ET avec celui de l'arbre fusionné.
  - Témoin sans `--` : **exit 9**, « bad option: -70OQ… ». La sonde exerce donc bien le mode de panne.
- **(b) Lignes complètes exécutées TELLES QU'ÉCRITES par `bash`**, dans une copie jetable. Seules substitutions : `cd /f/Monark` → la
  copie, `/f/tmp/bell-dn/` → la copie, et les jetons `<…>`. L'absence de `/f/Monark` est assertée avant l'exécution.
  - **Étape 5** (RUNBOOK l.146), `x` commençant par `-` : shell exit 0, `exit=0` affiché, trousseau == `canonical(keyringOf(clé, 1))`.
  - **R2** (RUNBOOK l.308), nouvelle clé dont le `x` commence par `-` : **shell exit 0**.
    - 2 clés, l'ancienne d'abord puis la nouvelle ;
    - **`trustOf` de la PR-2 @ `55bcdac`** donne une taille de 2 ;
    - ligne canonique ;
    - aucun `keyring-r2.json` résiduel (le `mv` a eu lieu).
  - R2 avec un `key_id` faux : exit 1, « STOP: key_id mismatch », trousseau committé **inchangé** (le `&&` protège).
- **Arbre fusionné, reconstruit avec `55bcdac`** : `git archive 55bcdac` + `git archive 5da8962 -- <11 chemins PR-3>` → `bis/merged`.
  - **Égal à `git merge-tree --write-tree 55bcdac 5da8962`** = `b0217114…` (exit 0) : 1 350 fichiers, 0 modifié, 0 non suivi
    (`logs/merged-eq.log`).
  - PR-2 (12 chemins) ∩ PR-3 (11) = ∅.
- **Critère de clôture de T4-KEYRING-DASH-1 atteint** (RENDU §9 : « exit 0 pour un x commençant par - ») ; **clôture proposée**.
- Mutant propre **d04** (`--` retiré de l'étape 5) : **KILLED** par le test 4 (« the keyring command is in the RUNBOOK »). Le `--` de
  l'étape 5 est donc épinglé. Celui de R2 ne l'est pas : voir O-B1.

## 5. Mutants

**64 du rédacteur** (`mutants-replay-bis.mjs` `76db28df…` : copie de `mutants.mjs` `e40f4347…` dont seules 3 lignes diffèrent, par les
chemins) :
- Premier passage complet : bases 4/4, **63/64 KILLED**, restaurés 64/64 (`mutants-replay/REPORT-full-run1.jsonl` `3531a9d5…`).
- **v06** n'a pas été « survivant » d'une assertion. Le processus de test `test\verify-bell.test.ts` a **planté** avec
  `exitCode 3221226505` (0xC0000409) avant de rapporter le test visé ; la règle byIntended le compte donc non tué.
- Rejeu seul (règle de HTTP-TEST-CRASH-1 : « rejeu = règle, jamais un skip ») : **KILLED** (`mutants-replay/REPORT-v06.jsonl`
  `a15b7a8b…`).
- **Bilan : 64/64 tués.**
- Comparaison au rapport du rédacteur (`logs/cmp-replay.log`) : mêmes 64 identifiants dans le même ordre.
  - 6 sha golden diffèrent (r01..r06), tous sur `docs/RUNBOOK-bell.md`, fichier modifié par le pli : attendu.
  - Les 58 autres sont identiques.

**Propres, 19, verdicts PRÉDITS avant exécution** (`mutants-own-bis.mjs` `b5100317…`, sha consigné avant tout run dans
`logs/mutants-own-bis-sha.txt`, `mutants-own/REPORT-own.jsonl` `47f8356c…`) : **19/19 prédictions tenues**, restaurés 19/19.

| Groupe | Mutants | Verdict (= prédit) |
|---|---|---|
| mes 12 du G2-delta, définitions identiques | o02, o03, o04, o05, o06, o07, o10, o11, o12, o13 | KILLED × 10 (o04, o05, o07 : SURVIVED à `bca7f5d`, tués maintenant) |
| | o01 (liste de refus c05), o08 (garde d'ordre C-V-7) | SURVIVED × 2 (inchangés : O-D1, O-D3 du G2-delta) |
| g13 du G2 PR-3, copié mot pour mot | g13 | KILLED |
| résiduels RUNBOOK-KEY-DIR-1 | d01 (`tar czf - /etc/monark/bell \| base64`, étape 3), d02 (`cd /etc/monark/bell && cat *`, R4), d03 (prose ``…`mv <nouvelle>` to /tmp/k…``) | SURVIVED × 3 (résiduels réels) |
| épinglage du ter | d04 (`--` retiré à l'étape 5) | KILLED |
| | d05 (`--` retiré de R2) | SURVIVED (O-B1) |
| unicité de l'exemption | d06 (phrase exemptée dupliquée) | KILLED |

`git status --porcelain` de `bis/pr3` : 0 ligne après les harnais.

## 6. Portes (`gates.sh`, `logs/gates.log` `cc9b6af7…`, 21:05:40Z → 21:06:42Z, HEAD `5da8962`)

- `gate:vocab` **0**, `lang:gate` **0**, `typecheck` **0**, `lint` **0**, `lint:ratchet` **0**.
- Non lancées : la porte `test` complète et `export:check`. Elles sont hors de la liste demandée ; l'oracle 7 portes est un acte du G7.

## 7. R-25, forme CI exacte (`r25.sh`, `logs/r25.log` `b3506e1f…`)

`git diff --shortstat 64dbbd6...5da8962` avec la pathspec de `ci.yml` et l'awk de la CI : « 10 files changed, 1014 insertions(+), 4
deletions(-) » ⇒ **1 018 ≤ 1 150** (borne CI 1 205).
- Contrôles : `…1353a79` donne 1 018 ; `…bca7f5d` donne 998.
- Le ter ne change que le RUNBOOK (exclu) et 2 lignes de test, remplacées une pour une.

## 8. Résiduels RUNBOOK-KEY-DIR-1 : items, pas des bloqueurs G-e

**Réalité des résiduels** : d01, d02 et d03 survivent (§5). L'item est donc bien formé, et ces trois mutants peuvent servir de preuve de
clôture.

**Pourquoi ce ne sont pas des bloqueurs G-e** (G-e = premier bundle, requis avant l'étape 9, RUNBOOK §0) :
- **(a) Aucun défaut dans le RUNBOOK livré.** Relevé exhaustif :
  - Répertoire sans barre finale, 5 occurrences (l.72, 117 × 2, 120, 123) : `ls -d` (étape 1, avant création),
    `install -d -o root -g root -m 0700` et `stat -c "%a %U:%G %n"` (étape 3), sortie attendue `700 root:root` (l.120), retour arrière
    `rm -rf … /etc/monark/bell` limité à « before step 4 only » (l.123, clé pas encore créée). Aucune ne lit d'octets.
  - Prose de la l.319 (`mv` de la nouvelle clé « onto the unit's path ») : instruction correcte.
  - Les 12 usages de chemins sous `/etc/monark/bell/` sont tous licites (§3).
- **(b) Ces résiduels ne protègent que des éditions futures du RUNBOOK.** Le garde est une hygiène, pas une preuve de branchement.
  Les étapes 1-13 du D-n n'exercent aucune des formes concernées. La rotation (où vivent la nouvelle clé et R1-R5) vient après la
  première publication.
- **(c) L'item est complet** (RENDU §9) :
  - propriétaire : orchestrateur ;
  - déclencheur : première rotation ou prochaine édition du RUNBOOK touchant ce répertoire ;
  - preuve de clôture : mutants `tar` et `cd … && cat *` tués, plus la forme ``…`mv <nouvelle>` to /tmp/k…`` tuée, RUNBOOK vert.
    Ce sont exactement mes d01, d02 et d03.

## 9. Observations, items, déviations

- **O-B1 (item formé R2-KEYRING-PIN-1)**
  - Constat : le `--` de R2 (l.308) n'est épinglé par aucun test du dépôt (**d05 SURVIVED**). R2 n'est prouvée que hors dépôt : mon
    `t4-probe.mjs` (b) à `5da8962`, et le `check-r2` du pli C-V.
  - Remède : un test du dépôt qui extrait R2 et l'exécute avec un `x` commençant par `-`, sur le modèle du test 4. À défaut, rejeu de
    `t4-probe.mjs` (b) avant la première rotation.
  - Propriétaire : orchestrateur. Déclencheur : première rotation (même porte que BELL-SYSTEMD-RUN-ROTATION-1) ou prochaine édition
    de R2. Preuve : d05 KILLED.
  - `error_origin` : **rédacteur du pli C-V**. La commande R2 naît à `bca7f5d` : `keyring-r2.json` apparaît 0 fois dans le RUNBOOK à
    `a31c8f3` et 1 fois à `bca7f5d`. Elle a été livrée sans test du dépôt.
  - Ce n'est pas un défaut du ter : la commande est correcte, R2 étant exécutée telle qu'écrite (§4 b).
- **Inchangés** : O-D1 (o01, BELL-CA-C5-STATUS-ALLOWLIST-1), O-D3 (o08, ordre C-V-7 non épinglé), O-D4 (FAITS de précontrôle absent des
  branches PR).
- **O-D5 / HTTP-TEST-CRASH-1 : nouvelle occurrence** (environnement). Le crash 0xC0000409 de `test\verify-bell.test.ts` sous le mutant
  v06, à 21:07:26Z, est survenu **sans autre charge de ma part** : portes et boucle T4 étaient finies.
  - C'est la troisième occurrence de cette signature relevée aujourd'hui (G7 BELL-ADV-1 `http.test.ts` ; mon G2-delta
    `verify-harness-liq.test.ts` ; ici).
  - Le déclencheur « seconde occurrence → instruire » était déjà déclaré tiré ; cette occurrence s'ajoute à l'instruction.
  - `error_origin` : environnement. Sans effet sur le verdict (rejeu seul KILLED).
- **C-V-5 (cp-2, point 3 du pli)** :
  - l.33-34 énumèrent les six usages, en 2 lignes (≤ 2 exigé), alignés sur les 6 regex de `ALLOWED_KEY_USES` ;
  - l.45 donne la base `9a5bddb`, qui existe dans mon clone : `commit`, 2026-09-23 19:03:02 +0100, « G-b closed: Databento portal
    sheet… » ;
  - test vert. **Conforme.**
- **Déviations du relecteur**
  - **D-B1** : le TAP du crash v06 a été **écrasé** par le rejeu seul (le harnais écrit un TAP par identifiant).
    - Traces conservées : `REPORT-full-run1.jsonl` (v06 `status 1`, `failures ["test\\verify-bell.test.ts"]`) et l'extrait relevé avant
      le rejeu (`not ok 1 - test\\verify-bell.test.ts`, `exitCode: 3221226505`).
    - Le TAP du rejeu est copié en `mutants-replay/v06-exit-0-on-failure.rejeu.tap`.
    - `error_origin` : relecteur.
  - **D-B2** : l'en-tête des TAP du rejeu hérite encore des libellés « mutants-replay.mjs … » et « TEMP/TMP F:/tmp/t1b-pr3/os-tmp ».
    C'est cosmétique : l'environnement effectif est `bis/tmp`, comme le montrent les TAP (`out=F:\\tmp\\g2d-t1b-pr3\\bis\\tmp\\…`).
  - **D-B3** : `git fetch` de `F:\Monark` vers mon clone : lecture de la source, écriture dans mon clone seulement. `npm ci --offline`
    lit le cache `F:/tmp/npm-cache`, avec `--logs-dir` sous `bis/logs` et `--no-update-notifier`.
  - **D-B4 (R-26)** : aucun appel advisor à l'orientation de cette mission. Un appel de clôture, vers 21:11Z, après l'écriture de ce
    fichier. Avis appliqués :
    - `error_origin` d'O-B1 corrigé (pli C-V et non G1, vérifié par `grep` sur les deux blobs) ;
    - horloges lues au lieu d'une estimation ;
    - mention de ce second passage ;
    - sha recalculé seul, en dernière commande.
    Aucune remise en cause du verdict. `error_origin` : relecteur.
- **Budget** : 20 min visées ; début 21:00:47Z ; mesures closes à 21:09:16Z ; première écriture de ce fichier à 21:10:41Z ; corrections
  de clôture après 21:12:41Z (horloges lues). Environ 12 min jusqu'à la première écriture, soit dans le budget.

## 10. Provenance

- Relecteur `claude-opus-5-5[1m]` (effort max), 2026-09-23. `error_origin` : O-B1 → rédacteur du pli C-V ; crash v06 → environnement ;
  D-B1 et D-B4 → relecteur.
- **Écritures** : uniquement `F:\tmp\g2d-t1b-pr3\bis\` (arbres `pr3` et `merged`, harnais, journaux, TAP, ce fichier) et le fetch dans
  mon clone. Aucun commit.
- **Scripts** (sha256) : `t4-probe.mjs` `60d20e42…`, `exemption-count.mjs` `15420ab2…`, `mutants-own-bis.mjs` `b5100317…`,
  `mutants-replay-bis.mjs` `76db28df…`.
- Le sha de ce fichier est donné par la dernière commande de la session (`sha256sum G2.md`).
