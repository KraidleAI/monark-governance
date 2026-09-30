claude-opus-5-5

# G1 — lot Dōjō PR-4c-1a (piste C, site) : module pur de la tête relue, chaînage du préfixe, oracles

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant exact déclaré par le harnais de la session), effort max, instance fraîche
  (le premier implémenteur est mort sur une limite d'utilisation avant toute écriture : arbre propre vérifié à 04:52:43Z).
- **Mission** : `F:/tmp/dojo/mission-g1-pr4c1a.md` (56 l., 16 985 o.), sha256 `d8c98efeb6f965b046923165f9f5cb0427d7f38c4327968f16680267ca6d09db`,
  recalculé AVANT lecture, égal au reçu `F:/tmp/dojo/mission-g1-pr4c1a.recu.json` (verdict vert, 12 codes à 0, `base` = `head` = `1775c1ed`).
  Règles `docs/methode/REGLES-MISSION.md` sha256 `12d5f2df…0335` (égal au tronc `F:/Monark/docs/methode/REGLES-MISSION.md`), lues en entier.
- **Base** : worktree `F:/Monark-wt-dojo-pr4c1`, branche `lot/dojo-pr4c1`, HEAD `1775c1ed8e2efdba9f072a51de52408d5fbbfa3d`, `git status` vide
  à l'ouverture (04:52:43Z). Aucun git écrivant, aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`, aucun réseau, rien sur C:.

## 0. Horaires (`date -u`)

- 04:52:43Z sha256 de la mission, puis lecture ; 05:04:05Z C-V-4 ; 05:16:05Z sha256 des entrées ; compte ascendant écrit ci-dessous
  AVANT toute ligne de code (heure en section 3).

## 1. C-V-4 au lancement (ADR D-5 : nombre de processus `node` consigné au journal G1)

- 05:04:05Z : 9 processus `node` ; 20 884 Mo physiques et 42 519 Mo virtuels libres (`Get-CimInstance Win32_OperatingSystem`) ;
  `F:/tmp/oracle-lock` absent (verrou d'hôte libre).

## 2. Entrées lues en entier, dans l'ordre de la mission (sha256 et lignes à 05:16:05Z, worktree au `1775c1ed`)

| Entrée | l. | sha256 |
|---|---|---|
| `docs/adr/ADR-DOJO-PR-4.md` (D-1, D-2, §3, §6, pli G0, plis de fin) | 379 | `25bbc9a82034b91df1dd195a10cdfa25ead4105dc257d9c23de2d1b26431cc6c` |
| `docs/G0-lot-dojo-pr4c1.md` | 89 | `727e20d356f12827c708d205bcc77cf3bd5eed7015907cd9c3e56be3ff1bd462` |
| `F:/tmp/dojo/cp1-pr4c1/CP1-report.md` | 81 | `c3e1a0789330be4e360262851181263fbeb03ad1c046c81446caebf83d763e51` |
| `docs/dojo/FAITS-webcrypto-ed25519-edge-cache-2026-09-30.md` | 25 | `feaad9f534a21177eaf578982f9411ac796d3bf598c5aba1086e6f12b555086f` |
| `apps/site/lib/dojo-served-load.ts` | 248 | `a83faaed956f54225481373dbcbec1ca06e70c4e3ee152ac5d792f728fda5a88` |
| `apps/site/lib/dojo-served.ts` | 41 | `0eeae2b3ceed980b4e8b78233ea5f863108a67406bca8727d2f07007658c8d00` |
| `apps/site/lib/narabi-live.ts` | 970 | `e794a94736367b159a1c0548d84575f3eabe03f575a88b272ec310adceef6cfd` |
| `apps/dojo/scripts/dojo-verify.mjs` (`VERIFY_BOUNDS` à cinq clés l.44-45) | 422 | `596a349dbf64afcf3c408ceaee27c40c4287b56d01f09b4c92542e45e48aef59` |
| `apps/dojo/scripts/dojo-chain.mjs` | 168 | `04411fa71b2cfd365ef7023161d82e0fa65f9f4904b27964caf78b4b39ca7123` |
| `apps/bell/scripts/bell-chain.mjs` | 175 | `521270a3793716c53b61ba1ee7ccec5aa4faa0f24406cba04e6a254398816ce7` |
| `apps/dojo/test/helpers/dojo-fixture.ts` | 324 | `aa4151bcf4fd967b19c15b52d2e981d2992daf5e40eb0c4af1b540dbec1d7d51` |
| `test/dojo-served.test.ts` | 388 | `8d6e3ace24e9a9ee62c5e1eead208a01289e0dd4031410169555bf75444d07ae` |
| `test/ci-gates.test.ts` (l.934, balayages d'`apps/site`) | 1 751 | `26235ed3869270311e2193ed28d77d814da0ce2e6e29aa32a06997b212bd71dd` |

- Lectures complémentaires (extraits cités où ils servent) : `apps/dojo/scripts/dojo-core.mjs` (`leafHash`, `nodeHash`, `rootOf`, sha256
  `34075c6f…32f5`), `apps/dojo/src/bundle.ts` (l.53-135, sha256 `03b9a910…f06e`), `apps/dojo/test/dojo-collect-pure.test.ts` (l.60-100,
  l.152-172), outils du tronc `F:/Monark/scripts/red-proof.mjs` (`6579b550…ab36`), `mutants/run.mjs` (`2606e7da…3b19`), `oracle/run.mjs`
  (`8ab26615…5a90`), `oracle/r25.mjs` (`4d0544df…cf0`), `.github/workflows/ci.yml` (job R-25), `eslint.config.mjs`, `lint-ratchet.json`
  (plafond 69), `tsconfig.json`, `scripts/public-text-deny.mjs` (`KITCHEN_FORMS`), `vocab-banned.json` (portée `site`),
  `test/site-build-fleet.test.ts` (l.1133-1170), `docs/dojo/rapports/G2-pr4a1-2026-09-27.md` (G-M8, G-M19).

## 3. Compte ascendant par fichier, écrit AVANT toute ligne de code (05:16:56Z ; tâche 1)

Base : plan 409 (ADR PL-1, ligne `| PR-4c-1a |`) + ≈ 30 pour le chaînage du préfixe (pli cp-1 C-V-2, option (A)) ;
borne 497 (R25-FACTOR-DRIFT-1, ×2,31 ≤ 1 150) ; au-delà : arrêt et signalement, aucune coupe pré-déclarée pour 1a.
Unité : insertions + suppressions comptées par R-25 (`docs/**/*.md` exclus : ce journal est hors compte).

| Fichier | Ascendantes |
|---|---|
| `apps/site/lib/dojo-live.ts` (neuf) | 215 |
| `test/dojo-live.test.ts` (neuf) | 205 |
| `apps/dojo/test/helpers/dojo-fixture.ts` (FIXTURE-SPREAD, fonction ajoutée) | 14 |
| `apps/site/lib/dojo-served-load.ts` (Q-P2 (a) : l.143, l.145, l.224, l.228 remplacées, 4 × 2) | 8 |
| `test/dojo-served.test.ts` (lignes de formes l.140, l.142 ; `// killer:` du test devenu jugé) | 8 |
| **Total** | **450** |

- `dojo-live.ts` : en-tête, types injectés et issue 22 ; bornes et source bornée 30 ; primitives (`canonical`, `signingBytes`,
  hachage de ligne, feuille, nœud, racine, signature base64url canonique) 34 ; recodage du marcheur (formes de l'ancre et de
  `read_rule`, `versionCheck`, `snapshotCheck`, `dojoCheck`, clés fermées) 70 ; passe avant (préfixe chaîné depuis la
  genèse, état plié, extension vérifiée) 30 ; projection, liaison du fichier de lignes, garde M-L22 29.
- `dojo-live.test.ts` : aides 35 ; primitives 22 ; extension 20 ; refus du marcheur 40 ; repli 22 ; bornes 20 ;
  rotation et version 12 ; préfixe (M-L22) 18 ; tête abstenue portant des lectures 16.
- `dojoFixture()` reste inchangée (épinglée par `test/dojo-page.test.ts` et `test/dojo-served.test.ts` : `slice(0, 9)` = E1).
- 450 ≤ 497 : le G1 continue (marge 47). ×2,31 = 1 039,5 ≤ 1 150 (arrêt mesuré) et ≤ 1 205 (borne CI `VIBEGATES_PR_LIMIT`).
- Mise en forme de cette section reprise à 05:17:41Z (lignes de plus de 160 caractères coupées ; chiffres inchangés), toujours avant
  toute ligne de code : aucun fichier hors de ce journal n'existe encore dans le worktree.

## 4. É-P5 mesuré avant la règle (Q-P2 (a) ; Q-V-1 du cp-1 : code du tronc)

Clone `--no-local` de la base `F:/tmp/dojo/pr4c1a/base` (HEAD `1775c1ed`, `git status` vide, 05:18:04Z) ; deux scripts hors dépôt,
lancés sur les fichiers de ce clone (lecture seule) ; sorties citées par sha256.

- **Jambe collecteur** (`F:/tmp/dojo/pr4c1a/measure/ep5.ts` `7753fb0e…e6ae`, sortie `ep5.out` `e94e610c…4cc4`, 05:18:23Z) :
  `writeDayBundle` (`apps/dojo/src/bundle.ts`) sur les entrées verbatim de `apps/dojo/test/fixtures/collect/` (aides recopiées de
  `dojo-collect-pure.test.ts` l.21-80) : un jour `mint_changed` et un jour `mint_unchecked` sont `abstained` avec `beacon` non nul et
  quatre lectures, les quatre portant leurs créneaux (`slot_min` 450 862 695, `slot_max` 450 862 712), comme le jour compté témoin.
- **Jambes vérificateur et site** (`ep5b.ts` `f8b19667…cbb6`, sortie `ep5b.out` `f44bc6b8…0c`, 05:18:39Z) : la ligne de tête de la
  fixture passée `abstained` en gardant balise et lectures (trois faites, une manquée), sous E1 puis sous la version 1 : marcheur
  `ok`, `verifyDojoServed` `ok` sous le trousseau committé ; `buildDojoServed` REFUSE (« a counted snapshot carries a reading made,
  an abstained one none », l.228). Constat É-P5 établi : la synchro refuserait ce jour (indisponibilité, jamais un chiffre faux).
- Jambe éditeur (`dojo-publish.mjs` l.224-227, gel de PR-3a-1b) : hors tronc, à rejouer à la fusion de 3a-1b (Q-V-1), non mesurée ici.
- Règle fixée ensuite (section 5) : créneaux présents ⇔ au moins une lecture faite ; tête comptée ⇒ au moins une lecture faite ;
  `reads_done` ≤ `k_reads` ; une tête abstenue peut porter ses lectures faites ; EA rend le jour seul (inchangé).

## 5. Règle Q-P2 (a) fixée (`apps/site/lib/dojo-served-load.ts`, quatre lignes remplacées en place, aucune ajoutée)

- l.143 (chargeur) : créneaux présents ⇔ `reads_done` ≥ 1 (« head: slots exactly with a reading ») ; avant : ⇔ `counted`.
- l.145 (chargeur) : tête comptée ⇒ `reads_done` ≥ 1, et `reads_done` ≤ `k_reads` (« head: reads_done is at least 1 when counted,
  at most k_reads ») ; avant : `reads_done` = 0 ⇔ abstenue.
- l.224 (commentaire) et l.228 (construction) : une tête comptée porte au moins une lecture faite (message « a counted snapshot carries
  a reading made », préfixe inchangé : la ligne de `dojo_served_loader_is_fail_closed` qui refuse les K lectures manquées reste verte) ;
  une tête abstenue peut porter ses lectures faites ; `reads_done`, `slot_min`, `slot_max` = ceux des lectures faites, quel que soit
  le statut. EA rend toujours le jour seul (`dojoPageFiguresOf` inchangée).
- `test/dojo-served.test.ts` : les lignes de formes qui épinglaient l'ancienne règle (l.140 et l.142 de la base) épinglent la nouvelle
  (trois lignes) ; `dojo_served_loader_is_fail_closed` devient jugé par `red-proof` : ligne `// killer:` ajoutée au-dessus
  (l.121 du test ; elle mute la l.145 du chargeur).

## 6. Conception de `apps/site/lib/dojo-live.ts` (décisions de ce G1, chacune vérifiable dans le fichier)

- **Double compilation** : un seul `import type` (`./dojo-served-load.ts`, précédent `dojo-served.ts`) ; ni `node:`, ni `fetch`,
  `window`, `document`, `crypto` ; SHA-256, vérificateur Ed25519 et transport injectés ; `TextEncoder`, `TextDecoder`, `AbortController`,
  `setTimeout`, `atob` sont déclarés par `@types/node` (programme racine) et par la bibliothèque DOM (Next).
- **Passe avant unique (option (A) du pli cp-1)** : chaîne depuis `GENESIS` = 64 zéros (`bell-chain.mjs` l.11) ; état du marcheur plié
  sur toutes les lignes (ancre, graine et jour de graine, fin d'historique, dernier jour, versions et `eff`, clé active, révocations) ;
  terminal : `lineHash(ligne[head.seq])` = `head.line_hash` committé. Le préfixe n'est pas vérifié en signature : il est authentifié par
  le hachage committé seul (seconde préimage SHA-256, [abs] au pli cp-1). Une rotation continue du préfixe est pliée (clé active).
- **Ligne neuve, dans l'ordre** : forme (schéma, seq, genre) → chaîne → clé du trousseau committé → signature (base64url canonique de
  64 octets, puis Ed25519 injecté) → ligne de clé ⇒ `key_change` (relecture arrêtée, jamais suivie) → clé active → clés fermées de son
  genre → fenêtre et révocation de la clé → contrôles du marcheur recodés → champs du `snapshot`. Les contrôles du marcheur gardent son
  ordre et ses codes ; ceux de `dojo-verify` viennent après eux, pour qu'une mutation d'un seul champ donne le même code.
- **Version** : celle que nomme la nouvelle tête, cherchée dans les versions pliées (préfixe authentifié ∪ extension vérifiée) ; si
  elle est la `price_version` committée, `threshold_unit` et `dust_threshold` doivent égaler les committés (garde M-L22).
- **Fichier de lignes de la tête** : compte, sha256, racine sur les octets servis, clés fermées, sommes, `holders_count`, lectures
  faites (comme `buildDojoServed` l.210-228) ; `why` = code de `dojo-verify` quand il en existe un.
- **Source bornée** : fichiers comptés avant chaque GET ; un minuteur par GET, couru contre la réponse ET chaque lecture du corps (tient
  même si le transport ignore le signal) ; octets par corps et totaux comptés au fil du flux ; corps annulé à tout refus ;
  `MAX_LINE_BYTES` sur chaque ligne de chronologie (longueur UTF-8 + 1, comme `dojo-verify`) ; statut 200 seul.
- **Issue fermée** : `reread` (tête projetée, 20 clés de `DOJO_HEAD_KEYS`) | `key_change` (seq) | `fallback` (seq, `why`) ; jamais
  d'exception (toute exception interne ⇒ `fallback`).

## 7. Oracle de l'extension : liste (i) reproduite, liste (ii) déléguée (pli cp-1 C-V-2 (a))

- **(i) Refus de `walkDojoTimeline` reproduits sur une ligne neuve**, chacun par une mutation re-signée de
  `dojo_live_refuses_what_the_walker_refuses` (le test exige : marcheur ⇒ code C au seq S ; navigateur ⇒ repli, `why` = C, seq = S) :
  1. `timeline_malformed` : schéma `dojo-timeline-v2` ; seq faux ; genre `publication` ; `reads` non tableau ; version à six valeurs
     quotidiennes ; seconde ligne `history` ; ancre à `k_reads` 0 ; ancre à `read_rule.read_offset_s` 901 ;
  2. `chain_broken` : `prev_line_hash` changé puis re-signé ; 3. `key_not_in_keyring` : clé hors trousseau committé ;
  4. `signature_invalid` : ligne changée après signature ; 5. `key_not_active` : ligne signée par une clé committée non active ;
  6. `day_not_increasing` ; 7. `seed_revealed_early` ; 8. `seed_chain_broken` ; 9. `version_not_in_force` (snapshot qui nomme `null`
     sous la version 1 ; version à effet ≤ dernier jour publié) ; 10. `price_version_mismatch` (version publiée avant la fin de sa fenêtre).
  - Sans objet sur une ligne neuve : `anchor_missing` (ligne 1, dans le préfixe authentifié par le hachage committé).
  - Refus propres aux lignes de clé (`rotation_key_not_in_keyring`, `rotation_malformed`, `revocation_malformed`, `sig_new`) : sans
    objet ; toute ligne de clé neuve authentifiée arrête la relecture (`key_change`, chiffres committés) ; testé sur une rotation que le
    marcheur accepte et sur une révocation qu'il refuse.
- **(i bis) Refus de `dojo-verify` reproduits au-delà du marcheur** (marcheur `ok`, construction refusée, navigateur en repli, même
  test) : clés fermées (`timeline_malformed`), fenêtre du trousseau (`key_not_active`), clé révoquée depuis un seq (ligne annulée,
  `key_not_active`), champs d'un `snapshot` (`timeline_malformed`) ; sur le fichier
  de lignes de la tête (`dojo_live_falls_back_to_the_committed_figures`) :
  `lines_count_mismatch`, `lines_sha_mismatch`, `root_mismatch`, `line_malformed`, totaux, `holders_count_mismatch`.
- **(ii) Délégués à la construction TY-9** (ADR PL-2 : vrai `dojo-verify` quotidien de la sonde de PR-4c-1c sur l'hôte, éditeur
  DOJO-PUBLISH-VERIFY-BEFORE-COMMIT-1, synchro en forme (B)) : `readsCheck` (balise, instants et formes des lectures :
  `read_instant_mismatch`, `timeline_malformed` des lectures) ; forme canonique et ordre des lignes d'un fichier de lignes
  (`line_malformed` par `canonical`, `lines_not_sorted`) ; classe (`class_mismatch`, `program_address_scored`) ; lots, points, validés,
  provisoires, unités, paliers et `holder_counted` de chaque ligne (`lots_transition_mismatch`, `score_mismatch`, `validation_mismatch`,
  `units_mismatch`, `tier_mismatch`, `threshold_mismatch`) ; lignes manquantes (`line_missing`) ; séries quotidiennes et conversions
  d'une version (`price_version_mismatch` des séries, `threshold_conversion_mismatch`) ; fichier d'historique (`history_*`) ; fichiers
  de lignes des jours antérieurs ; nouvelle ancre un jour publié et fenêtre d'une version sur des jours d'historique (DOJO-WALK-GAPS-1).

## 8. Exécutions locales (verrou d'hôte relu libre avant chacune ; TEMP `F:/tmp/dojo/pr4c1a/tmp`)

- 05:36:30Z : `node_modules` du worktree par `F:/tmp/dojo/drand-1a/mk-nm.ps1` (220 entrées, 10 `@monark`, 0 échec) ; retiré avant la
  remise par `rm-nm.ps1` (section 18). Verrou TENU de 05:34:40Z à ≈ 05:42Z par un oracle G2 d'un autre lot (`owner.txt` : rôle G2,
  pid 61084 vivant) : aucun test ni contrôle lourd pendant ce temps (relecture statique du module et du test seulement).
- 05:42:48Z, C-V-4 : 9 processus `node`, 14 990 Mo physiques et 35 143 Mo virtuels libres. `node --test test/dojo-live.test.ts` :
  8/8 verts (4,9 s) ; `test/dojo-served.test.ts` + `test/dojo-page.test.ts` : 12/12 verts.
- 05:43:09Z `tsc --noEmit -p tsconfig.json` (programme racine) : sortie 0, aucune erreur. Double compilation (programme Next absent de
  l'oracle, `CI_ONLY`) prouvée par deux programmes ciblés sur le seul `dojo-live.ts` : `F:/tmp/dojo/pr4c1a/tsc-dom/tsconfig.json`
  (hérite d'`apps/site/tsconfig.json` : DOM, `bundler`, `@types/node`) : sortie 0 ; `tsc-domonly` (DOM seul, aucun type Node) :
  six erreurs, toutes dans `dojo-served-load.ts` (ses `node:` et `Buffer`), ZÉRO dans `dojo-live.ts`.
- 05:43:43Z ESLint sur les cinq fichiers touchés : 0 ; 05:44:11Z `lint-ratchet` : 69/69 (plafond inchangé, aucune violation ajoutée).
- 05:44:25Z portes qui balaient `apps/site` (`site-build-fleet`, `ci-gates`, `site-honesty`, `public-surfaces-honesty`, test 42 exclu :
  il tourne une fois, dans la suite de l'oracle) : 78/78. `gate:vocab` 0, `export:check` 0 ; `lang:gate` ROUGE une fois (deux `é`
  d'un objet de test de `canonical`, l.70), corrigé par `String.fromCharCode(0xe9)` (fichier de test entièrement ASCII) : vert, 8/8
  rejoués (05:45:10Z), ESLint 0.
- Écart corrigé avant tout F2P : sur un statut refusé (404 porteur d'un corps), le corps n'était pas annulé (leçon F-6 de PR-1b-4) ;
  le lecteur est pris avant le jugement du statut ; assertion ajoutée au test des bornes (corps refusé à 200 par sa borne, à 404
  par son statut : annulé les deux fois).

## 9. F2P (outil du tronc `F:/Monark/scripts/red-proof.mjs`, sha256 `6579b550…ab36`)

- Commande : `node F:/Monark/scripts/red-proof.mjs --base 1775c1ed --gel F:/Monark-wt-dojo-pr4c1 --repo F:/tmp/dojo/pr4c1a/base
  --out F:/tmp/dojo/pr4c1a/f2p --draw 3 --seed 2026` ; `node_modules` du clone de base = une seule jonction vers
  `F:/Monark/node_modules` (`LinkType` = `Junction`) ; 05:45:31Z → 05:46:01Z ; sortie 0, « red-proof OK: 9 judged, 6 unchanged,
  3 killer(s) drawn ».
- `F:/tmp/dojo/pr4c1a/f2p/RED-PROOF.json` sha256 **`c56b8f4fa2c2e1a067c2beefe92dfbe0727155b0e02644f12866b15ef0be7d17`** ; `base.tap`
  `f9e34f9e…3faf`, `gel.tap` `a7aabe53…bd8e` ; condensé du gel `b53b5319c1bb8ba6909ff1a777ddb007265256b2944354070094bd293b94f378`.
- Jugés : les huit tests de `test/dojo-live.test.ts` en `new-module` (la base ne peut charger `apps/site/lib/dojo-live.ts`, que le
  diff ajoute) ; `dojo_served_loader_is_fail_closed` en **F2P** (rouge à la base par `ERR_ASSERTION` : message de l'ancienne règle).
- Tueurs tirés (graine 2026, population 9) : `dojo-live.ts:91` (`MAX_FILES`), `:231` (tête plus ancienne, M-L5), `:261` (hachage
  terminal, M-L1) : les trois **tués** par assertion (`assert-fail`).
- **Rejeu sur l'état final** (06:05:13Z → 06:05:42Z, même commande, `--out F:/tmp/dojo/pr4c1a/f2p2`, jonction du clone de base
  reposée puis retirée) : sortie 0, 9 jugés (8 `new-module`, 1 F2P), mêmes trois tueurs tirés et tués par assertion ;
  `RED-PROOF.json` sha256 **`35639948d7ac6d347860c4139c46529b3cb8aacbe4d9f0a18212d83ae4087a66`**, `base.tap` `b8926523…9bee`,
  `gel.tap` `4d9cfdde…c6d7`, condensé du gel `40d88a548114a2c298aef1553b0d4729fc8876183b471f560a2aa1fba45f16f9`. Ce rejeu fait foi.

## 10. Mutants (outil du tronc `F:/Monark/scripts/mutants/run.mjs`, sha256 `2606e7da…3b19`)

- `--repo` = clone `--no-local` du worktree `F:/tmp/dojo/pr4c1a/mclone` (HEAD `1775c1ed` détaché, les cinq fichiers du lot copiés,
  sha256 égaux à ceux du worktree) ; `--out F:/tmp/dojo/pr4c1a/mutants` (neuf, hors `--repo`, `node_modules` = jonction vers
  `F:/Monark/node_modules`) ; `--table F:/tmp/dojo/pr4c1a/table/mutants.json` (32 lignes, générées par `gen-table.mjs`
  `bc9efe95…95d7` qui situe chaque ligne par un texte présent sur une seule ligne) ; `--killers` ; `--targets test/dojo-live.test.ts,
  test/dojo-served.test.ts` ; `--lock-root F:/tmp` ; `--min-free-mb 4096`. Garde externe à 05:46:45Z : `held("F:/tmp")` = `null`,
  `owner.txt` absent ; C-V-4 : 9 `node`, 14 615 Mo physiques, 34 657 Mo virtuels (≥ 8 192) ; aucun oracle ni course pendant la campagne.
- `RESULTS.json` sha256 **`1b3f7ffba38ad04b3f1909228a5274daede95f0a941c3bb190682f32a39010d6`** ; `RESULTS.txt` `5f2ba059…a7e` (relu en
  entier) ; 05:46:4xZ → 05:50:08Z ; référence verte (53 tests) ; **44 tués sur 44** (tous par assertion : verdict de l'outil),
  0 survivant, 0 non conclu, 0 ancre perdue ; sortie 0.
- Mutants de l'ADR (§4, §6, PL-5) applicables à 1a : M-L1 (K7), M-L2, M-L3, M-L4, M-L5 (K4), M-L6, M-L8a, M-L8b, M-L8c, M-L8d (K5),
  M-L8e, M-L10 (K1), M-L16, M-L17, M-L18a, M-L18b, M-L19a, M-L19b, M-L22a, M-L22b ; G-M8 (K6), G-M19 (FIXTURE-SPREAD). Non
  applicables à 1a (PR-4c-1b) : M-L7, M-L9, M-L11 à M-L15, M-L20, M-L21, C-17.
- Neufs de ce G1 (au-delà des « quatre neufs » de PL-5, M-L16 à M-L19, tous présents) : M-L23 clé active non contrôlée (K3) ;
  M-L24 chaîne de graine ; M-L25 corps refusé non annulé ; M-L26 tête comptée sans lecture faite relue ; M-L27 `slot_max` de la
  projection (K2) ; M-L28 à M-L31 contrôles du marcheur (ordre des jours, graine révélée tôt, version nommée par un `snapshot`,
  version publiée avant la fin de sa fenêtre) ; M-L32 clés fermées ; M-L33 Ed25519 non vérifié (lignes forgées par un relais) ;
  M-L34 champs d'un `snapshot` ; M-L35 `read_rule` d'une ancre ; M-L36 rotation du préfixe non pliée ; M-L37 LF final non exigé ;
  M-Q1 (K8) et M-Q4 : chargeur, créneaux sans lecture faite ; M-Q2 (K9) : tête comptée sans lecture faite chargée ; M-Q3 :
  construction, ancienne règle d'abstention. K10 à K12 : tueurs préexistants de la synchro (`scripts/sync-dojo-served.mjs`), tués.
- « M-L22 tué deux fois » (pli cp-1 C-V-2) : M-L22a (préfixe non chaîné, lignes neuves seules) tué par la ligne altérée d'un
  `snapshot` du préfixe que la garde ne voit pas ; M-L22b (seuils committés non comparés) tué par un enregistrement committé dont les
  seuils diffèrent de la ligne de version authentique ; l'attaque M-L22 elle-même (seuils de la ligne de version du préfixe altérés
  par un relais) reste en repli sous chacun des deux mutants : chaque défense l'arrête seule.
- Preuve sur pièce de ce « deux fois » : `tap/M-L22a.tap` (`db353f71…`) rougit sur l'assertion « a prefix snapshot no figure reads »
  (deuxième cas) : le premier cas, l'attaque M-L22, est passé en repli par la garde seule ; `tap/M-L22b.tap` (`d2d13090…`) rougit sur
  la défense en profondeur (« no fallback: {"kind":"reread"… ») après les quatre cas : l'attaque est passée en repli par la chaîne seule.
- **Rejeu sur l'état final** (après l'ajout, à 06:04Z, du cas « a prev_line_hash of the prefix » au test du préfixe, classe du Review
  Focus « préfixe servi altéré : un prev_line_hash ») : clone neuf `F:/tmp/dojo/pr4c1a/mclone2`, sortie neuve `mutants2` (jonction
  retirée après), table inchangée (`mutants.json` `309eafb9…5eb2`, régénérée égale) ; garde externe `held` = `null` à 06:06:05Z ;
  `RESULTS.json` sha256 **`15a68a3d4c9fe250e0ceda9b69d0639dedd9dbbf2c4b54492441181abd8443fc`**, `RESULTS.txt` `8bc3da91…8448` ;
  **44 tués sur 44**, par assertion ; 06:06Z → 06:09:15Z ; M-L22a rougit encore sur « a prefix snapshot no figure reads »
  (`tap/M-L22a.tap` `52e90c8d…`), M-L22b sur la défense en profondeur (`tap/M-L22b.tap` `3ba70307…`). Cette campagne fait foi.

## 11. Tâche → fichier → test → mutant (K = tueur, numérotation de l'outil de mutants)

Fichier des lignes citées : `apps/site/lib/dojo-live.ts` (297 l.) sauf mention ; tests de `test/dojo-live.test.ts` sauf mention.

| Tâche (mission) | Lignes | Test | Mutants tués |
|---|---|---|---|
| 1 compte ascendant | journal §3 | — | — |
| 2 primitives, forme de signature | l.34-83 | `dojo_live_primitives_equal_the_node_ones` | M-L10 (K1) |
| 2 chaînage du préfixe (A) | l.236-263 | `dojo_live_prefix_chains_to_the_committed_head` | M-L1 (K7), M-L22a |
| 2 garde des seuils committés | l.274-278 | idem | M-L22b |
| 2 extension, marcheur recodé | l.118-224, l.241-259 | `dojo_live_refuses_what_the_walker_refuses` | voir (a) |
| 2 projection | l.270-297 | `dojo_live_head_extends_the_committed_record` | M-L17, M-L27 (K2), M-L36 |
| 2 repli, fichier de lignes | l.229-232, l.279-290 | `dojo_live_falls_back_to_the_committed_figures` | voir (b) |
| 2 bornes, source bornée | l.26-32, l.85-116 | `dojo_live_bounds_equal_the_verifier` | voir (c) |
| 2 FIXTURE-SPREAD | fixture l.155-164 | `dojo_served_head_follows_rotation_and_version` | G-M8 (K6), G-M19 |
| 2 règle Q-P2 (a) | chargeur l.143, 145, 224, 228 | `dojo_served_accepts_an_abstained_head_with_readings` | M-Q1 (K8), M-Q3 |
| 2 règle Q-P2 (a), formes | chargeur l.143, 145 | `dojo_served_loader_is_fail_closed` (`test/dojo-served.test.ts`) | M-Q2 (K9), M-Q4 |

- (a) M-L2, M-L16, M-L19a, M-L19b, M-L23 (K3), M-L24, M-L28, M-L29, M-L30, M-L31, M-L32, M-L33, M-L34, M-L35 ; M-L6 aussi.
- (b) M-L3, M-L4, M-L5 (K4), M-L6, M-L18a, M-L18b, M-L26, M-L37.
- (c) M-L8a, M-L8b, M-L8c, M-L8d (K5), M-L8e, M-L25.
- Tâches 3 à 5 : 9 tests jugés par `red-proof` (section 9), 44 mutants sur 44 tués (section 10). Tâche 6 : section 17.

## 12. MAST (C-V-5 ; modes de PL-6 et de la piste)

- FM-3.3 (vérification incorrecte ; recodage navigateur divergent du noyau) : primitives égales à `bell-chain.mjs` et `dojo-core.mjs`
  (canonique, octets signés, hachage de ligne, feuille, nœud, racines de 0 à 4 lignes, forme de signature) ; tête relue égale à
  `buildDojoServed(…).head` sur cinq arbres ; code et seq du marcheur égaux sur 18 mutations.
- FM-2.4 (rétention d'information ; un repli qui tait sa cause) : issue fermée, `key_change` distinct du repli, `why` porte le code
  (du marcheur ou de `dojo-verify`) et le seq.
- FM-1.5 (condition de fin ignorée ; module déclaré servi) : TU-8L reste absent (aucun consommateur servi en 1a), registre `upcoming`
  inchangé, aucune revendication publique.
- FM-1.1 (spécification non suivie ; bornes, fixture ou format dérivés d'un autre worktree) : `VERIFY_BOUNDS` à cinq clés du tronc
  épinglé par égalité profonde ; fixture étendue par ajout (`dojoFixture()` inchangée).
- FM-2.3 (dérive de tâche ; pièces de 1b faites en 1a) : init de `fetch` et détection d'Ed25519 laissées à 1b (Q-G1-2, Q-G1-3) ;
  aucun texte, aucun composant.

## 13. `error_origin` proposés (assignés au G7 par l'orchestrateur)

- Porte de langue rouge une fois (deux `é` d'un objet de test) : worker G1, corrigé avant le F2P.
- Corps d'un statut refusé non annulé : worker G1, relevé en relecture avant le F2P, corrigé et testé.
- Séquence `\u2028` décodée en caractère par l'outil d'écriture du harnais : outil (harnais), contourné sans perte (caractère construit
  par `String.fromCharCode`), consigné.
- Dérive R-25 (mesure contre compte ascendant, section 17) : worker G1 (module et tests sous-estimés au §3).
- Placement de FIXTURE-SPREAD (parenthèse de la mission contre la règle de `red-proof`) : planificateur (Q-G1-1).
- Barres inverses dans des heredocs (18 scripts hors dépôt, deux heredocs du journal) et une commande Bash d'environ 7,1 Ko :
  worker G1 ; relevés à la seconde consultation de l'advisor, effet nul mesuré (section 18).

## 14. Items (aucun « dû » nu)

- DOJO-SERVED-FIXTURE-SPREAD-1 : **traité** (G-M8, G-M19 tués ; C-8 déjà constaté équivalent au journal G1 de PR-4a-2 l.103).
- DOJO-LIVE-BOUNDS-KEYS-1 : **traité** (égalité profonde des cinq clés, chaque clé appliquée, M-L8a à M-L8e tués) ; clos au G7 de 1a
  (ADR PL-4).
- DOJO-PAGE-ABSTAINED-1, partie site : **traitée** sous Q-P2 (a) (É-P5 mesuré, règle fixée, testée) ; le format de l'éditeur reste
  à son déclencheur (avant le premier `snapshot` abstenu servi) ; la jambe éditeur d'É-P5 (`dojo-publish.mjs` l.224-227) se rejoue
  à la fusion de PR-3a-1b (Q-V-1 du cp-1 ; propriétaire orchestrateur).
- Limites déclarées de la liste (ii) (section 7) : portées par la construction TY-9 déjà formée (DOJO-PUBLISH-VERIFY-BEFORE-COMMIT-1,
  bloquant avant A-8 ; DOJO-LIVE-HEALTH-1 : vrai `dojo-verify` quotidien, PR-4c-1c ; synchro en forme (B)) ; à porter au registre
  PAROXYSME-Dojo (item PAROXYSME-DOJO-FILE-1, Q-V-4 du cp-1).
- Coût de la relecture (condensés SHA-256 un par un, feuilles d'un fichier de lignes entier) : DOJO-LOOKUP-PAYLOAD-1 étendu (ADR
  PL-4, É-P6), mesure au premier `snapshot` réel.

## 15. Questions à l'orchestrateur (Q-G1-n)

- **Q-G1-1** : `dojo_served_head_follows_rotation_and_version` (FIXTURE-SPREAD) vit dans `test/dojo-live.test.ts`, non dans
  `test/dojo-served.test.ts` : un test qui ne pilote que la construction de la base (correcte) y serait vert à la base, ce que
  `red-proof` refuse ; `test/dojo-served.test.ts` ne porte que les lignes de la règle Q-P2 (a). Confirmer cette lecture de la
  parenthèse « (FIXTURE-SPREAD) » de la tâche 3.
- **Q-G1-2** : `DOJO_LIVE_FETCH_INIT` (D-P6) n'est pas dans 1a : le transport est injecté comme `(rel, signal)` ; l'init de `fetch`
  (`no-store`, `redirect: "error"`, `credentials: "omit"`) sera posé par le composant de 1b (M-L14). Confirmer.
- **Q-G1-3** : la détection d'Ed25519 utilisable (D-P5 : import JWK, réponse connue sur l'ancre committée, octet changé refusé) est à
  1b (M-L13, M-L21) ; 1a reçoit le vérificateur injecté. Confirmer.
- **Q-G1-4** : une ligne de clé neuve donne `key_change` (TXT-14d) seulement si son signataire est au trousseau committé et que sa
  signature se vérifie ; sinon repli (TXT-14c). Une rotation rompue signée par une clé absente du trousseau committé lit donc
  TXT-14c. Confirmer cette lecture de D-P4.
- **Q-G1-5** : `why` porte le code de `dojo-verify` quand il en existe un (lignes neuves, fichier de lignes), une phrase anglaise
  sinon ; aucun rendu n'en dépend (1b rend TXT-14c pour tout repli). Confirmer, ou fixer une liste fermée au G0 de 1b.

## 16. Advisor

- Outil advisor intégré consulté une fois après l'orientation, avant toute écriture : placement des tests dicté par `red-proof`
  (tout test jugé vert à la base est refusé ; la fixture, sous `test/`, est copiée dans le clone de base), `// killer:` requis au-dessus
  du test devenu jugé, FIXTURE-SPREAD additive, `GENESIS` à 64 zéros, `import type` admis, preuve de double compilation par `tsc`
  ciblé, portes d'`apps/site` (cuisine, vocabulaire, champ figé `"reason"` d'où `why`), oracle exact de l'extension (codes du marcheur
  dans son ordre, ajouts de `dojo-verify` après), trois cas d'authentification du préfixe et « M-L22 tué deux fois » en deux mutants,
  mesure É-P5 par script hors dépôt. Conseil, jamais verdict ; chaque point vérifié sur pièce (sections 4 à 10). Seconde consultation
  avant la remise : section 18.

## 17. Oracle et R-25 (tâche 6 ; `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-dojo-pr4c1 --base 1775c1ed --key PR-4c-1a`)

- **Enregistrement qui fait foi** (arbre final, après le cas « prev_line_hash ») : lancé à 06:10:1xZ, verrou relu libre, C-V-4 :
  9 `node`, 16 062 Mo physiques, 36 148 Mo virtuels ; aucune course ni test de ma part pendant sa suite ; jamais interrompu.
  `F:/tmp/oracle-results/1775c1ed8e2efdba9f072a51de52408d5fbbfa3d-8b6e2532eaceee65-G1-20260930T061014Z-98736.json`, sha256
  **`1261b0eb34e874f00600d8b138f7068d89db960db1119510f88ecf8e9d71b83c`** : `exit` 0, `served_from` null (rejoué), 06:10:14Z →
  06:18:35Z ; arbre `head` `1775c1ed`, `dirty` `8b6e2532…2f91`, objet `54a3bdf02f0957d41406db247ada5ba6cd7d5e2b` ; C-V-4 de l'outil :
  16 343 Mo, 10 `node.exe`.
- Portes : modèles épinglés 0, r25 0, `lang:gate` 0, `export:check` 0, `gate:vocab` 0, `typecheck` 0, `lint` 0, `lint:ratchet` 0,
  `test` 0 (443,1 s) : **1 744 tests, 1 740 verts, 0 rouge, 4 ignorés** (test 42 dans la suite, une seule fois). Ignorés, tous hors
  lot et déclarés par leur test : `sentinel_run_releases_chainstack_lock_on_sigterm`, `sentinel_instrument_out_win32_short_name`,
  `u4b_labels_replay_via_main_real_artifact`, et `lot_retire_file_identity_keeps_every_bit_of_a_64_bit_ino` (« no ino beyond the
  precision of a double here » : condition d'environnement, absente de la passe précédente). `CI_ONLY` : `npm ci`, `npm sbom`,
  `npm audit`, construction du site et `assert-fleet-html` (double compilation Next prouvée à part, section 8).
- **R-25** (calcul exporté `r25()` de `F:/Monark/scripts/oracle/r25.mjs`, bornes lues de `ci.yml`) : `STAT` 586 insertions +
  6 suppressions = **592** ≤ 1 205 ; `CONTENT_STAT` 0 ≤ 8 000. Par fichier : `dojo-live.ts` 297, `test/dojo-live.test.ts` 271,
  `dojo-fixture.ts` 10, `dojo-served-load.ts` 4 + 4, `test/dojo-served.test.ts` 4 + 2 ; le journal (`docs/**/*.md`) est exclu.
- Mesure contre compte ascendant : 592 / 450 = ×1,32 (module 297 contre 215, tests 271 contre 205 ; le reste conforme) ; sous
  l'arrêt mesuré de 1 150 et la borne CI de 1 205 ; ×1,32 < ×2,31 (R25-FACTOR-DRIFT-1).
- Passe précédente, remplacée (arbre sans le cas « prev_line_hash ») : `…-4afc34a2d9cec9a4-G1-20260930T055325Z-121064.json`,
  sha256 `51fcbe39…9e77`, `exit` 0, 1 741 verts sur 1 744, R-25 591.
- L'arbre de l'oracle final diffère du gel à venir par ce journal seul (sections 17 et 18 réécrites après son lancement ;
  `docs/**/*.md`, hors R-25 et hors portes de code) ; les cinq fichiers de code et de test sont identiques octet pour octet à ceux
  du F2P final (`f2p2`), de la campagne finale (`cmp` contre `mclone2`) et de l'oracle final.

## 18. Provenance et état final

- Rédacteur : worker `claude-opus-5-5` (R-1), effort max, instance fraîche ; mission `d8c98efe…09db` (reçu vert) ; aucun commit, aucun
  git écrivant dans le worktree ni dans `F:/Monark` (git en lecture : `status --porcelain`, `rev-parse`, `diff --stat`, `diff
  --numstat`, `check-ignore`, `log` ; clones `--no-local` sous `F:/tmp/dojo/pr4c1a/` : `base`, `mclone`, `mclone2`) ; **aucun
  `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`** ; aucun réseau ; aucune clé réelle (clés Ed25519 générées à l'exécution par
  les tests) ; rien sur C:. **Deux écarts à la règle d'exploitation, consignés (section 13)** : (1) des séquences barre inverse
  ont traversé des heredocs : 18 scripts de travail hors dépôt (`F:/tmp/dojo/pr4c1a/tmp/` : `cancel`, `fix1`, `fixj1`, `fixj2`,
  `killers`, `mast`, `maxlen`, `rejeu`, `relocate`, `rule`, `rule2`, `served-test`, `served-test2`, `spread` ; `measure/` : `ep5b`,
  `live1`, `spread` ; `table/gen-table`) et deux heredocs non cités du journal (sections 3 et 10 à 11 : accents graves échappés) ;
  (2) une commande Bash d'environ 7,1 Ko (le heredoc des sections 5 à 7), au-delà des 6 Ko. Effet mesuré : nul. Aucun fichier
  livré ne porte d'octet de contrôle (garde d'octets par un script sans barre inverse, `String.fromCharCode`) ; le contenu des
  fichiers de code et de test est vérifié par `git diff`, les tests, `tsc`, ESLint et la chaîne F2P, mutants, oracle ; celui du
  journal par relecture et `maxlen`. Ce correctif est écrit par un script sans barre inverse.
- Jonctions `node_modules` retirées : worktree à 06:03:06Z (`rm-nm.ps1`), `base` (reposée pour le F2P final puis retirée),
  `mutants`, `mutants2` ; `F:/Monark/node_modules` intact, contrôlé.
- Fichiers livrés (sha256 finals ; garde d'octets : aucun caractère de contrôle, aucun CR, LF final) :

| Fichier | l. | sha256 |
|---|---|---|
| `apps/site/lib/dojo-live.ts` (neuf) | 297 | `d6f1570b30d97b0ec6e17c6daee1ab8df9c9208d72e4ef7bcc1f6058b48610ba` |
| `test/dojo-live.test.ts` (neuf) | 271 | `af2ea8ca6e3d5f4d3d1a6a1ff75e62ed81f924166cc99f0ecdaa9e9e2c6036c7` |
| `apps/dojo/test/helpers/dojo-fixture.ts` (modifié) | 334 | `2e9e04b79dc4e6755f81b2e390248d56bbeb1885a19e2a7e46c06e23ab9b7e1d` |
| `apps/site/lib/dojo-served-load.ts` (modifié) | 248 | `d63b532658c1a9ec2cd48e7c773099cf4f9f3220e50f768885df2137af3e0346` |
| `test/dojo-served.test.ts` (modifié) | 390 | `4706c27276822ad2641610d9df0776c07f96a6f108411c72023bc119cf05f8a2` |

- Tuyaux (règle Branchement) : TU-8L reste **absent** au G7 de 1a (module sans consommateur servi ;
  `dojo_live_head_extends_the_committed_record` compose fichiers servis → module → tête en test) ; composé jusqu'au rendu au G7 de
  1b ; registre `upcoming` inchangé ; aucune pièce déclarée « built ».
- Advisor, seconde consultation (après l'écriture des livrables, avant la réponse finale) : deux défauts de déclaration relevés,
  corrigés dans ce journal et dans `REPONSE.md` seuls : la déclaration « aucune barre inverse dans un heredoc » était fausse
  (écart recensé en entier ci-dessus et en section 13, au-delà des trois scripts que l'advisor citait) ; l'attribution des
  mutants de la table dans `REPONSE.md`. Aucun fichier de code ni de test touché ; oracle non rejoué (seul `docs/**/*.md` diffère
  de son arbre, section 17).
- `git status --porcelain` à la remise : ` M apps/dojo/test/helpers/dojo-fixture.ts`, ` M apps/site/lib/dojo-served-load.ts`,
  ` M test/dojo-served.test.ts`, `?? apps/site/lib/dojo-live.ts`, `?? docs/G1-lot-dojo-pr4c1a.md`, `?? test/dojo-live.test.ts`.
