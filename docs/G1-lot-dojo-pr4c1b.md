claude-opus-5-5

# G1 — lot Dōjō PR-4c-1b (piste C, site) : surface de la page vivante, composant client de relecture, extrait mandataire

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant exact déclaré par le harnais de la session), effort max, instance fraîche.
- **Mission** : `F:/tmp/dojo/mission-g1-pr4c1b.md` (56 l.), sha256 `8f79d3c780261b957e5d66b98f1c678153b6e02a7477533f749727ee7ef20ac6`,
  recalculé AVANT lecture (15:03:37Z), égal au reçu `F:/tmp/dojo/mission-g1-pr4c1b.recu.json` (verdict vert, 12 codes à 0, `repo` = ce
  worktree, `base` = `head` = `281376be`). Règles `docs/methode/REGLES-MISSION.md` sha256 `12d5f2df…0335` = tronc
  `F:/Monark/docs/methode/REGLES-MISSION.md` (15:27:11Z), lues en entier (insérées dans la mission).
- **Base** : worktree `F:/Monark-wt-dojo-pr4c1b`, branche `lot/dojo-pr4c1b`, HEAD `281376be5823faf219f3c27a5d6599d9d11a89a1` (tronc avec
  PR-4c-1a fusionné et son pli G7), `git status --porcelain` vide à l'ouverture (15:03Z) et à 15:27:11Z. Aucun git écrivant, aucun `GIT_DIR`,
  aucun `GIT_WORK_TREE`, aucun `--write-tree`, aucun réseau, rien sur C:.

## 0. Horaires (`date -u`)

- 15:03:37Z sha256 de la mission, puis lecture ; 15:14:55Z C-V-4 ; 15:26:20Z sha256 des entrées ; compte ascendant écrit ci-dessous AVANT
  toute ligne de code (section 3, écrite à 15:28:00Z).

## 1. C-V-4 au lancement (ADR D-5 : nombre de processus `node` consigné)

- 15:03:37Z : verrou d'hôte `F:/tmp/oracle-lock` TENU par un autre processus (`owner.txt` : rôle `corr`, pid 117272, pris 15:00:45Z) :
  lectures seules jusqu'à sa libération. 15:14:55Z : `owner.txt` absent (verrou libre) ; 8 processus `node` ; 17 711 Mo physiques et
  35 217 Mo virtuels libres (`Get-CimInstance Win32_OperatingSystem`).

## 2. Entrées lues en entier, dans l'ordre de la mission (sha256 et lignes à 15:26:20Z, worktree au `281376be`)

| Entrée | l. | sha256 |
|---|---|---|
| `docs/adr/ADR-DOJO-PR-4.md` (D-1, D-2, §3, §6, pli G0, plis de fin) | 388 | `796d03423ad279265951b40ba155ebeabe6255e427e38338fa949755671c1aa0` |
| `docs/G0-lot-dojo-pr4c1.md` | 89 | `727e20d356f12827c708d205bcc77cf3bd5eed7015907cd9c3e56be3ff1bd462` |
| `docs/G1-lot-dojo-pr4c1a.md` | 469 | `770f256434ebd4602ebbdf4dcf9b0effaf4f42c8633a9de52c761ad8bc3480af` |
| `F:/tmp/dojo/cp2-pr4c1a/CHECKPOINT2-lot-pr4c1a.md` (PAROXYSME (i)-(iv)) | 116 | `5cd8b240985a2db34ad09d2a518b50d24f6f29faa43b63b4efca31910945ac17` |
| `docs/dojo/FAITS-caddy-proxy-headers-2026-09-30.md` | 17 | `a1b4eefaa9d82aededa9a5630f8fcc285dcab4e17cc367f8f8c0202aecb61c7f` |
| `docs/dojo/FAITS-webcrypto-ed25519-edge-cache-2026-09-30.md` | 25 | `feaad9f534a21177eaf578982f9411ac796d3bf598c5aba1086e6f12b555086f` |
| `apps/site/lib/dojo-live.ts` | 297 | `d6f1570b30d97b0ec6e17c6daee1ab8df9c9208d72e4ef7bcc1f6058b48610ba` |
| `apps/site/lib/dojo-served.ts` | 41 | `0eeae2b3ceed980b4e8b78233ea5f863108a67406bca8727d2f07007658c8d00` |
| `apps/site/lib/dojo-served-load.ts` | 248 | `d63b532658c1a9ec2cd48e7c773099cf4f9f3220e50f768885df2137af3e0346` |
| `apps/site/lib/dojo-copy.ts` | 62 | `0699b27483650aadac0606529d3b90406a877ed7cb7e1cc76f331493ba0abe07` |
| `apps/site/components/dojo/dojo-figures.tsx` | 27 | `41ac0249c7b19029277d496d180617bdeed6aea33dea46ff4116bcbf83cf6def` |
| `apps/site/app/dojo/page.tsx` | 58 | `6731a41d0de8abf753deaf45879c721a29e46e0c89d9da244fb50481ec9dda36` |
| `apps/site/components/narabi/narabi-live.tsx` (précédent client, l.1-120) | 559 | `70d3dc64fc8de52949a2f073d34a1bf68f45789d875094f1b3004ef88ca8435e` |
| `apps/site/next.config.mjs` | 49 | `3bb4cf7dd1066ae77c00a49ecaca9d9c277e0d85c76062a5b8741365603caf5e` |
| `apps/site/COMPONENTS-PROVENANCE.md` | 170 | `4bff9fa96ac03d6d5e140aa40b6b997a679aa473fd506bf93c0eb60424a458be` |
| `scripts/assert-fleet-html.mjs` (l.570-764) | 764 | `31975dbdece2c548d74ab4f0111b3b6b74b299ffe6f8c4e3e591d66af46864e6` |
| `test/dojo-page.test.ts` | 167 | `7e0c61263227e9b14004163e26a62efd2a8d17bd56185c2e2d7b418f47f30569` |
| `test/dojo-live.test.ts` | 347 | `ce24bafa9c17cd468311359180d0469126a3df7ea30a9c11077052d93229eb70` |
| `test/ci-gates.test.ts` (registre, balayages d'`apps/site`) | 1 751 | `26235ed3869270311e2193ed28d77d814da0ce2e6e29aa32a06997b212bd71dd` |

- Lectures complémentaires (extraits cités où ils servent) : rapport G2 de 1a `F:/tmp/dojo/g2-pr4c1a/G2-report.md` (`f7dbc9cf…4133` :
  sonde (vi), C-G2-2, Q-G2-1 à Q-G2-7), `apps/dojo/test/helpers/dojo-fixture.ts` (`readsOf`, `render`, `Step`), outils du tronc
  `F:/Monark/scripts/red-proof.mjs` (`6579b550…ab36` : `verdictOf`, `classify`, `parseKiller`), `F:/Monark/scripts/mutants/run.mjs`
  (`2606e7da…3b19`), portes `scripts/lang-gate.mjs`, `scripts/public-text-deny.mjs` (`KITCHEN_FORMS`), `vocab-banned.json` (portée
  `site`), `test/public-surfaces-honesty.test.ts` (l.1-80), `test/site-build-fleet.test.ts` (l.1088-1160, `site_names_no_kitchen`),
  `apps/site/test/honesty-lint.ts` (l.1-60), `apps/site/tsconfig.json`, tsconfig des deux programmes de 1a (`F:/tmp/dojo/pr4c1a/tsc-dom*`).

## 3. Compte ascendant par fichier, écrit AVANT toute ligne de code (tâche 1)

Base : plan 360 (ADR PL-1, ligne `| PR-4c-1b |` l.288) + ≈ 40 pour les consignes du pli G7 de 1a = ≈ 400 (compte de la mission).
Unité : insertions + suppressions comptées par R-25 (pathspec du job CI ; `docs/**/*.md` exclus : ce journal est hors compte).
Arrêt de la mission : `r25()` mesuré au gel > 1 150, ou solde 1 150 − `r25()` < 10 : arrêt et signalement, jamais de compaction.

| Fichier | Ascendantes | Détail |
|---|---|---|
| `apps/site/components/dojo/dojo-live.tsx` (neuf, client) | 50 | en-tête 10, imports 6, adaptateurs Web Crypto et GET 7, composant 27 |
| `apps/site/lib/dojo-served.ts` | 85 | en-tête 6, imports de type 2, `sentenceParts` 12, `dojoBodyOf` 8, prédicat de tête restaté 10, vue relue 47 |
| `apps/site/components/dojo/dojo-figures.tsx` | 30 | `DojoSentence` rendue par `sentenceParts` (garde C-17 déplacée), en-tête |
| `apps/site/app/dojo/page.tsx` | 28 | section des chiffres remplacée par `<DojoLive committed={data} />` |
| `apps/site/lib/dojo-copy.ts` | 17 | TXT-14r, 14a, 14b-r, 14c, 14d dans `DOJO_TEXT` (clés `reread*`), en-tête |
| `apps/site/lib/dojo-live.ts` | 2 | la seule ligne du décodeur : `ignoreBOM: true` (l.35) |
| `scripts/assert-fleet-html.mjs` | 3 | `T.rereadFirst` dans `shown` (l.674-675 : la l.674 fait 154 caractères, l'ajout va en tête de la l.675) |
| `deploy/Caddyfile.monark-dojo-site.snippet` (neuf) | 25 | forme des FAITS Caddy (K-4, K-5), commentaire d'insertion |
| `apps/site/next.config.mjs` | 5 | réécriture de développement `/dojo-served/*` |
| `apps/site/COMPONENTS-PROVENANCE.md` | 5 | entrée du composant |
| `test/dojo-live-surface.test.ts` (neuf) | 225 | en-tête et imports 25, aides 30, huit tests 170 |
| `test/dojo-page.test.ts` | 20 | l.65 inversée, liste fermée (compte, sha256), `dojo_copy_is_digit_free`, trois `// killer:` |
| `test/dojo-live.test.ts` | 8 | un test neuf pour `ignoreBOM` |
| **Total** | **503** | |

- Écart au compte de la mission : 503 contre ≈ 400 (+ 103), porté par les tests (253 contre ≈ 160) ; le code est au plan (≈ 250 contre
  ≈ 240). La règle de coupe de PL-1 (« un compte ascendant de mission au-delà de 497 est coupé avant d'écrire ») lit le compte de la
  mission (≈ 400 ≤ 497) ; l'arrêt de CETTE mission porte sur la mesure. Prévision : 503 × 1,32 (dérive mesurée au G1 de 1a) ≈ 664,
  solde ≈ 486 sous 1 150 : le G1 continue ; question posée (Q-G1-1), aucun test retranché pour tenir un chiffre.
- Conception décidée avant le code (détail et preuves en section 4) : Node 24 ne charge pas un `.tsx` et le programme racine n'a pas de
  `jsx` ; la liste des fichiers du lot est fermée (PL-1) et un module `lib/` n'importe les autres que par `import type` (double
  compilation). Donc : toute logique exécutable par un test racine vit dans `apps/site/lib/dojo-served.ts`, dépendances injectées
  (vue relue, détection d'Ed25519 par réponse connue, prédicat de tête restaté, `sentenceParts`, `dojoBodyOf`, constantes du GET) ;
  le composant ne fait que câbler Web Crypto, le GET de même origine et `rereadDojoHead` (balayage de source).

## 4. Conception (décisions de ce G1, chacune vérifiable dans les fichiers)

- **Où vit la logique exécutable** : `apps/site/lib/dojo-served.ts` (pur, `import type` seuls, en-tête complété). Motifs mesurés : Node 24
  ne charge pas un `.tsx` et le programme racine n'a pas de `jsx` ; entre modules `lib/` à double compilation, seul un `import type` à
  suffixe `.ts` passe les deux programmes (le programme Next, `bundler`, n'a pas `allowImportingTsExtensions` : `apps/site/tsconfig.json`) ;
  la liste des fichiers du lot est fermée (PL-1). D'où, injectés : `sentenceParts` (extrait de `dojo-figures.tsx` l.14-18, garde C-17),
  `dojoBodyOf` (ordre de l'ancienne page l.34-50), `dojoHeadRefusal` (règles de tête du chargeur l.142-146 restatées, même ordre et mêmes
  mots), `DOJO_LIVE_PREFIX`, `DOJO_LIVE_FETCH_INIT` (gelé : `no-store`, `redirect: "error"`, `credentials: "omit"`), `dojoEd25519Usable`,
  `dojoFirstViewOf`, `dojoLiveViewOf`. Précédent : Narabi (logique dans `lib/`, composant qui câble ; tests par exécution et par balayage).
- **Vue relue** (`dojoLiveViewOf`) : Ed25519 non utilisable ⇒ chiffres committés et TXT-14b-r, AUCUN appel de relecture (donc aucun GET) ;
  `key_change` ⇒ TXT-14d ; repli ⇒ TXT-14c ; tête relue refusée par le prédicat du chargeur ⇒ TXT-14c ; une phrase qui ne se remplit pas ⇒
  TXT-14c (la suite entière est calculée par `sentenceParts` AVANT la bascule) ; sinon chiffres relus et TXT-14a. La vue n'a aucun champ
  `why` : le motif d'un repli ne quitte jamais la vue. Le jour montré est celui des chiffres montrés (un seul objet de chiffres par vue).
- **Réponse connue (D-P5)** : la signature de la ligne d'ancre committée (`timeline.anchor` entière, `signingBytes`) sous SA clé committée
  (`key_id` de l'ancre, trousseau committé) doit se vérifier, et les mêmes octets au premier octet changé ne pas se vérifier ; toute
  exception (import rejeté, `crypto.subtle` absent) ⇒ non utilisable. Le même vérificateur injecté sert ensuite à chaque ligne neuve.
- **Composant** (`apps/site/components/dojo/dojo-live.tsx`, `"use client"`) : Web Crypto (`digest`, `importKey` JWK puis `verify`), GET
  `fetch(prefix + rel, { ...DOJO_LIVE_FETCH_INIT, signal })`, `rereadDojoHead(committed, { sha256, verifyEd25519, get })` SANS `bounds`,
  premier rendu `useState(() => dojoFirstViewOf(committed, T))` (TXT-14r), relecture dans `useEffect`. Rendu : phrase de la tête
  (TXT-3/TXT-3A), puis la phrase de la vue, contiguë (QF-3), puis les autres phrases ; tout chiffre par `DojoSentence`.
- **`DojoSentence`** rend par `sentenceParts` : même tableau de parties qu'avant, donc même HTML ; partagée par la page et le composant
  (plus « serveur seul »). **Page** : la section des chiffres devient `<DojoLive committed={data} />` ; la ligne `notFound()` épinglée par
  `dojo_page_absent_before_data` est inchangée ; pastille, titre, chapeau et prose inchangés.
- **`dojoExpected`** : `T.rereadFirst` entre dans `shown` en tête de la l.675 (la l.674 fait 154 caractères) ; ses `absentSentences`
  portent alors TXT-14a, 14b-r, 14c et 14d (aucune dans le HTML construit).
- **`ignoreBOM: true`** (`dojo-live.ts` l.35, la seule ligne touchée) : le BOM reste dans le texte, la première ligne ne se parse pas,
  repli (parité avec la construction et le vérificateur, `timeline_malformed` au seq 1).
- **Extrait** `deploy/Caddyfile.monark-dojo-site.snippet` (forme des FAITS Caddy K-4, K-5) : `handle_path /dojo-served/*`, `@read`
  (`method GET`, `path` des trois chemins fermés), `reverse_proxy https://dojo.monarkgate.tech` avec `header_up Host {upstream_hostport}` et
  `header_down Cache-Control "no-store"`, `handle { respond 404 }` pour tout le reste ; aucune option `tls_insecure_*` ; espaces, aucune
  tabulation (garde d'octets ; l'extrait Narabi en porte). **Réécriture** de `next.config.mjs` : `/dojo-served/:path*` vers l'hôte Dōjō,
  sous la garde `NODE_ENV !== "development"` existante (inactive hors développement, M-L20).
- **Textes** (`DOJO_TEXT`, clés `rereadFirst`, `rereadDone`, `rereadNoCheck`, `rereadFallback`, `rereadKeyChange`) : TXT-14r et TXT-14b-r
  du pli l.304, TXT-14a, 14c, 14d des l.89, l.91, l.92, à l'octet (apostrophes ASCII, relevées par `od`) ; aucun chiffre hors « SHA-256 » et
  « Ed25519 » ; relus contre `DOJO_FORBIDDEN`, le vocabulaire du site et les opérateurs (`dojo_page_lexicon_is_closed`, vert). Nouvelle
  empreinte de la liste fermée (22 textes : nom, titre, vingt phrases) : **`b8ffb789f79b1203be8359c1f0038924d50dadde007383980cd26c7a608778ad`**,
  à re-citer au cp-2 (règle de l.98) ; TXT-14r et TXT-14b-r restent à approuver au cp-2 de 1b (P-10).

## 5. Exécutions locales (verrou d'hôte relu libre avant chacune ; TEMP, TMP, TMPDIR = `F:/tmp/dojo/pr4c1b/tmp`)

- 15:32:28Z : `node_modules` du worktree par `F:/tmp/dojo/drand-1a/mk-nm.ps1` (220 entrées, 10 `@monark`, 0 échec) ; retiré avant la remise
  par `rm-nm.ps1` (section 14). Sonde hors dépôt `F:/tmp/dojo/pr4c1b/tmp/probe1.mts` (15:32Z) : tête E2 de la fixture seq 12, jour
  2026-10-10, un détenteur compté ; tête E1 seq 9, jour 2026-10-08 ; `next.config.mjs` importé en 17 ms, `rewrites()` = `[]` en production,
  deux règles en développement (Narabi, puis `/dojo-served/:path*`).
- 15:39:58Z → 15:43:20Z, premier état (avant le renfort de T7, section 6) : `test/dojo-live-surface.test.ts` 8/8 ; `dojo-live`, `dojo-page`,
  `dojo-served` 29/29 ; après la pose des lignes `// killer:` : les quatre fichiers 37/37.
- 15:40:18Z `tsc --noEmit -p tsconfig.json` (programme racine) : sortie 0, aucune erreur. **Double compilation** (15:40:40Z, TypeScript
  6.0.3) : programme Next `F:/tmp/dojo/pr4c1b/tsc-dom/tsconfig.json` (hérite d'`apps/site/tsconfig.json` : DOM, `bundler`, `react-jsx`, types
  Node ; fichiers `dojo-live.tsx`, `dojo-figures.tsx`, `app/dojo/page.tsx`, `dojo-served.ts`, `dojo-live.ts`, `dojo-copy.ts`) : sortie 0,
  0 erreur ; programme DOM seul `tsc-domonly` (aucun type Node ; `dojo-live.tsx` et sa fermeture) : 6 erreurs, TOUTES dans
  `dojo-served-load.ts` (`node:fs`, `node:crypto`, `node:path`, trois `Buffer` : son `import type` seul), 0 dans `dojo-live.tsx`,
  `dojo-served.ts`, `dojo-live.ts`, `dojo-copy.ts`, `dojo-figures.tsx` ; les mêmes six qu'au G1, au G2 et au cp-2 de 1a.
- 15:40:52Z ESLint sur les onze fichiers de code et de test touchés : 0 erreur (`next.config.mjs` et `scripts/*.mjs` hors de sa
  configuration, avertissement « ignored ») ; `lint-ratchet` 69/69 (plafond inchangé).
- 15:41:25Z `gate:vocab` 0 (328 fichiers), `export:check` 0, `lang:gate` 0. 15:41:34Z portes qui balaient `apps/site` (`site-build-fleet`,
  `ci-gates`, `site-honesty`, `public-surfaces-honesty` ; test 42 exclu, il tourne une fois dans la suite de l'oracle) : 78/78, dont
  `site_names_no_kitchen`, `public_surfaces_make_no_probative_claim`, `fleet_register_built_set_is_frozen`, `dojo_register_is_frozen`.
- Aperçu R-25 (`F:/tmp/dojo/pr4c1b/edits/r25-worktree.mjs` : pathspecs du job lus par `R25_DIFF_RE` exporté du tronc, arbre de travail
  contre la base, fichiers non suivis comptés en insertions) : 565 + 48 = 613 au premier état ; compte officiel : porte `r25` de l'oracle.

## 6. Renfort de T7 après la première campagne (état final du code et des tests)

- Résidu vu en relisant `dojo_live_refuses_a_head_the_loader_refuses` : la parité règle par règle couvrait les cinq règles connues, mais
  une règle ajoutée au seul chargeur n'aurait rougi nulle part (deux sources). Construction retenue, sans toucher au chargeur (hors de la
  liste fermée ; factoriser exigerait un import relatif de valeur, qu'aucun des deux programmes n'admet dans les deux sens) : le test lit
  les règles `fail("head: …")` dans la SOURCE de `dojo-served-load.ts` (exactement cinq, relevées par `grep -o` à 15:48Z) et exige que
  l'ensemble des refus rencontrés par le prédicat restaté soit ces cinq, mots compris, plus une tête acceptée. Le résidu « prédicat
  restaté » est clos par ce test : ce n'est plus une limite. `+ 4 − 1` lignes de test ; aucune ligne de code touchée depuis le F2P 1.
- Rejoué sur l'état final (15:51:29Z → 15:51:58Z, verrou lu libre au lancement) : les quatre fichiers de test du lot 37/37, `tsc` racine
  0, ESLint 0. La table de mutants régénérée est identique à l'octet (`mutants.json` `8e913bf1…49db95`, `cmp`).

## 7. F2P (outil du tronc `F:/Monark/scripts/red-proof.mjs`, sha256 `6579b550…ab36`)

- Commande de la mission : `node F:/Monark/scripts/red-proof.mjs --base 281376be --gel F:/Monark-wt-dojo-pr4c1b --repo F:/tmp/dojo/pr4c1b/base
  --out <dossier neuf> --draw 3 --seed 2026` ; `--repo` = clone `--no-local` du worktree détaché à la base (`git status` vide), son
  `node_modules` = UNE jonction vers `F:/Monark/node_modules` (`LinkType` `Junction`).
- **Premier état** (15:44:36Z → 15:45:15Z, verrou libre) : `f2p/RED-PROOF.json` sha256 `15a4fbbb8c5747a27c4ef23a8a8daa8d2d497715edb34c8a7416127522ea15d2` :
  `ok`, 12 jugés, tous **F2P** (rouges à la base par `ERR_ASSERTION`, verts au gel), 18 inchangés ; population 12, trois tueurs tirés :
  `dojo-live.tsx:29`, `dojo-served.ts:141`, `dojo-live.ts:35`, tués par assertion, fichiers restaurés au même sha256. Trace.
- **Écart** : le rejeu sur l'état final (`f2p2`, 15:54:28Z → 15:55:07Z, même verdict : 12 F2P, trois tueurs tués) a été lancé alors que le
  verrou d'hôte était TENU par un oracle G2 d'un autre lot (`owner.txt` : rôle G2, pid 148256, pris 15:51:36Z) : ma commande enchaînait la
  lecture du verrou et le lancement sans condition. Sans effet sur l'oracle tenu (jamais touché, jamais interrompu) autre qu'une charge
  concurrente de 39 s ; `f2p2` reste une trace ; le F2P qui fait foi est rejoué verrou libre (section 8). Depuis, chaque lancement est
  conditionné par un test d'existence de `owner.txt` dans la même commande.

## 8. F2P final et mutants (tâches 4 et 5)

- **F2P qui fait foi** (`f2p3`, état final, 15:56:55Z → 15:57:28Z, lancement conditionné à l'absence d'`owner.txt` dans la même
  commande) : `F:/tmp/dojo/pr4c1b/f2p3/RED-PROOF.json` sha256 **`3436ef53633ed1e7eaf993dddc41613c5c4e8bd27c660915e196a802341f73e2`** :
  `ok`, mode worktree, `head` `281376be`, condensé des changements `d0186043c41deeff55523cd7aa77a6ef8e215424167b5570bcc2c29da40204ae`
  (égal à celui de `f2p2`, même état) ; **12 jugés, tous F2P** (rouges à la base par `ERR_ASSERTION`, verts au gel) : les huit tests de
  `test/dojo-live-surface.test.ts`, `dojo_live_refuses_a_timeline_behind_a_bom`, et les trois tests amendés de `test/dojo-page.test.ts` ;
  18 inchangés ; population 12, graine 2026, trois tueurs tirés : `dojo-live.tsx:29` (K6), `dojo-served.ts:141` (K5), `dojo-live.ts:35`
  (K25), **tués par assertion**, fichiers restaurés au même sha256 ; `base.tap` `5b2ca137…8894`, `gel.tap` `ea8b2f64…b5a3`.
- **Mutants** (outil du tronc `F:/Monark/scripts/mutants/run.mjs`, sha256 `2606e7da…3b19`, forme des REGLES) : `--repo` = clone
  `--no-local` du worktree détaché à la base, les treize fichiers du lot recopiés à sha256 égal ; `--out` neuf avec sa jonction
  `node_modules` ; `--table F:/tmp/dojo/pr4c1b/table/mutants.json` (27 lignes, `8e913bf1…49db95`, par `gen-table.mjs` `46ae13f5…d341a` qui
  situe chaque ligne par un texte unique et y vérifie `<before>` une seule fois) ; `--killers` ; `--file apps/site/lib/dojo-served.ts` ;
  `--targets test/dojo-live-surface.test.ts,test/dojo-page.test.ts,test/dojo-live.test.ts` ; `--lock-root F:/tmp` ; `--min-free-mb 4096`.
  Table : M-L7, M-L9, M-L11, M-L12, M-L13, M-L14, M-L14b, M-L15, M-L20, M-L21a, M-L21b, C-17 (pli l.335) ; G7-why, G7-bounds, G7-predicate,
  G7-bom, G7-key (consignes du pli G7 de 1a) ; P-1 à P-5 (chaque règle de tête) ; B-1 à B-5 (ordre, singulier, premier rendu, suite
  entière avant bascule, clé de la réponse connue). Tueurs : les 28 lignes `// killer:` des trois fichiers de test (K1 à K28).
- Première campagne (état d'avant le renfort de T7 ; garde externe `held` = `null` et C-V-4 à 15:47:16Z : 22 `node`, 15 945 Mo physiques,
  33 733 Mo virtuels) : `F:/tmp/dojo/pr4c1b/mutants/RESULTS.json` sha256 `d647affb583d51fb7dc5e1c3881453ce4e1597b2898f6280f13e71e40242c32f` :
  **55 tués sur 55** par assertion, 0 survivant, 0 non conclu, 0 ancre perdue, 15:47Z → 15:51:17Z. Trace.
- **Seconde campagne, qui fait foi** (état final ; clone `F:/tmp/dojo/pr4c1b/mclone2`, sortie neuve `F:/tmp/dojo/pr4c1b/mutants2` ; garde
  externe `held` = `null` et C-V-4 à 15:57:57Z : 11 `node`, 14 814 Mo physiques, 32 724 Mo virtuels ; lancement conditionné à l'absence
  d'`owner.txt`) : `F:/tmp/dojo/pr4c1b/mutants2/RESULTS.json` sha256 **`736afb1ed7ed34219517553344ad768253e8cef7a951a1c3f4688692f5a58856`**,
  `RESULTS.txt` `de44b716…b86c` (relu en entier) ; 15:58:04Z → 16:02:46Z ; référence verte (134 tests : les quatre fichiers de test du
  lot et leurs importeurs) ; **55 tués sur 55** (table 27 sur 27, tueurs 28 sur 28), tous par assertion (`status` « tue »), fichiers
  restaurés (`sha_before` = `sha_after` partout) ; 51 morts strictes (un seul test rouge) et 4 tuées par plusieurs tests à la fois
  (G7-why, G7-bom, B-1, B-5) ; 0 survivant, 0 non conclu, 0 ancre perdue ; sortie 0. Un oracle G2 d'un autre lot a pris le verrou à
  15:58:11Z, sept secondes après ce lancement (l'outil de mutants ne tient pas le verrou pendant sa campagne : MUTANTS-LOCK-MIDRUN-1) ;
  campagne non interrompue, aucune autre course de ma part pendant elle ; durées par mutant plus longues (≈ 7 à 12 s contre ≈ 7 s).
- Aperçu R-25 sur l'état final (16:02:10Z, même script) : **568 + 48 = 616** ≤ 1 150 (solde 534) ≤ 1 205 ; `CONTENT_STAT` 0. Par
  fichier : surface 315, `dojo-served.ts` 110, `dojo-live.tsx` 51, `page.tsx` 26, `dojo-figures.tsx` 27, snippet 26, `dojo-copy.ts` 20,
  `dojo-page.test.ts` 19, `dojo-live.test.ts` 9, `next.config.mjs` 5, provenance 4, `dojo-live.ts` 2, `assert-fleet-html.mjs` 2.
  Mesure contre compte ascendant : 616 / 503 = × 1,22 (tests de surface 315 contre 225, `dojo-served.ts` 110 contre 85).

## 9. Tâche → fichier → test → mutant (K = tueur ; fichiers triés puis lignes : K1-K8 surface, K9-K25 `dojo-live`, K26-K28 page)

Abréviations : S = `apps/site/lib/dojo-served.ts`, C = `apps/site/components/dojo/dojo-live.tsx`, P = `apps/site/app/dojo/page.tsx`.

| Tâche (mission) | Fichier | Test | Mutants tués |
|---|---|---|---|
| 1 compte ascendant | journal §3 | — | — |
| 2 même rendu, premier rendu, ordre | S (`dojoBodyOf`, `dojoFirstViewOf`, vue) | `dojo_live_renders_through_the_same_figures` | M-L12, B-1, B-2, B-3, K1 |
| 2 Ed25519 par réponse connue (D-P5) | S (`dojoEd25519Usable`, vue) | `dojo_live_needs_ed25519_to_show_a_reread` | M-L7, M-L13, M-L21a/b, B-5, K2 |
| 2 extrait mandataire, réécriture | snippet, `next.config.mjs` | `dojo_site_proxy_snippet_is_outside_the_page_route` | M-L9, M-L15, M-L20, K3 |
| 2 garde de `DojoSentence` (C-17) | S (`sentenceParts`), `dojo-figures.tsx` | `dojo_sentence_refuses_a_figure_the_state_lacks` | C-17, B-4, K4 |
| 2 `why` jamais rendu (G7) | S (vue), C | `dojo_live_never_renders_why` | G7-why, K5 |
| 2 appel sans `bounds`, câblage (G7) | C, P, S (`DOJO_LIVE_FETCH_INIT`) | `dojo_live_calls_the_reread_without_bounds` | G7-bounds, M-L11, M-L14, M-L14b, K6 |
| 2 prédicat de tête (G7, C-G2-2 (B)) | S (`dojoHeadRefusal`, vue) | `dojo_live_refuses_a_head_the_loader_refuses` | G7-predicate, P-1 à P-5, K7 |
| 2 `key_change` déclaré (G7) | S (vue) | `dojo_live_says_a_key_change` | G7-key, K8 |
| 2 `ignoreBOM` (G7) | `dojo-live.ts` l.35 | `dojo_live_refuses_a_timeline_behind_a_bom` | G7-bom, K25 |
| 2 `dojoExpected` : TXT-14r au HTML | `assert-fleet-html.mjs` l.675 | `dojo_page_renders_served_figures_only` (l.65 inversée) | K26 |
| 2 textes, liste fermée | `dojo-copy.ts` | `dojo_page_lexicon_is_closed` (22 textes) | K27 |
| 2 aucun littéral rendu | C, `dojo-copy.ts` | `dojo_copy_is_digit_free` (amendé) | K28 |

- Les seize tueurs préexistants de `test/dojo-live.test.ts` (K9 à K24, module de 1a) sont rejoués par la campagne et tués. Le cas BOM
  de `dojo_live_never_renders_why` tue aussi G7-bom (vue : TXT-14c).
- Tâches 3 à 6 : sections 5, 7, 8 et 13 ; tâche 7 : ce journal, `REPONSE.md`, `DELIVERED.sha256`.

## 10. MAST (C-V-5 ; modes de PL-6 et de la piste)

- FM-3.3 (vérification incorrecte) : chiffres relus = chiffres de la construction sur le même arbre servi (T1) ; prédicat restaté = règles
  du chargeur, mots compris, lues dans sa source (T7) ; primitives et module de 1a inchangés hors `ignoreBOM`.
- FM-2.4 (rétention d'information) : TXT-14b-r obligatoire sans Ed25519 (T2) ; chaque vue dit d'où viennent ses chiffres (TXT-14r, 14a,
  14b-r, 14c, 14d), jamais le motif brut (T5) : l'issue est dite, le message moteur non.
- FM-1.5 (condition de fin ignorée) : TU-8L composé en test jusqu'aux parties de phrase que rend l'élément React (section 12) ;
  registre `hold-snapshot` `upcoming` inchangé ; aucune revendication publique ; servi seulement après DOJO-SITE-PROXY-1 et 1c.
- FM-1.1 (spécification non suivie) : textes à l'octet de l'ADR ; extrait à la forme des FAITS ; empreinte de la liste fermée épinglée.
- FM-2.3 (dérive de tâche) : rien de 1c (sonde) ni de 4c-2 (recherche) ; `dojo-live.ts` touché d'une seule ligne.

## 11. `error_origin` proposés (assignés au G7 par l'orchestrateur)

- Compte ascendant sous-estimé (tests de surface 312 lignes contre 225 prévues ; `dojo-served.ts` 110 contre 85) : worker G1 ; le plan
  (PL-1 : « tests 120 » pour 1b) ne comptait pas les consignes du pli G7 de 1a : planificateur.
- Lieu de la logique (vue, détection, prédicat, constantes du GET dans `dojo-served.ts`) et troisième test amendé de `dojo-page`
  (`dojo_copy_is_digit_free`), non prévus par PL-1 : planificateur (contraintes de double compilation et de liste fermée non chiffrées).
- Lecture double de la mission (« BOM relu donc refus » dans la liste des tests de surface, « un seul test neuf pour `ignoreBOM` » dans
  `test/dojo-live.test.ts`) : génération de la mission (Q-G1-5).
- F2P `f2p2` lancé sous un verrou tenu par un autre lot (section 7) ; heredocs portant des barres inverses ou une tabulation dans des
  scripts de travail (section 14) : worker G1.

## 12. Tuyaux, items et limites (règle Branchement, PAROXYSME ; aucun « dû » nu)

- **Tuyaux** : TU-8L (fichiers servis par F3 → `dojo-live.ts` → vue → rendu) est **composé en test jusqu'aux parties de phrase** que rend
  l'élément React (`dojo_live_renders_through_the_same_figures` : arbre servi signé → `rereadDojoHead` → `dojoLiveViewOf` → `dojoBodyOf` et
  `sentenceParts`, comparés aux phrases que `dojoExpected` compose à part pour la construction du même arbre) ; l'élément React lui-même
  n'est jamais exécuté par un test (balayage de source). Servi après DOJO-SITE-PROXY-1 (acte) et DOJO-LIVE-HEALTH-1 (1c). Registre
  `hold-snapshot` `upcoming` inchangé (`dojo-register.ts` non touché) ; aucune pièce déclarée « built » ; aucune revendication publique.
- **DOJO-LIVE-RENDER-ORACLE-1 (neuf)** — limite : aucun oracle de ce lot n'exécute `DojoLive` en React : Node ne charge pas un `.tsx`, la
  construction du site est `CI_ONLY` dans l'oracle, et en E0 la page est `notFound()` : même le job CI `g3-site` ne rend rien avant le
  premier acte de synchro. La double compilation prouve les types, pas la sérialisation RSC des props ni l'hydratation. Construction : (a)
  le premier oracle réel est `g3-site` + `assertDojoBody` sur le HTML construit à l'acte TU-7 (le premier rendu y porte TXT-14r et les
  chiffres par `DojoLive`) ; (b) plus tôt, un test racine non-LLM qui transpile le composant (`typescript`, `jsx: react-jsx`), résout
  l'alias `@/` et le rend par `react-dom/server` sur une vue (≈ 60 lignes, sans dépendance neuve) ; (c) une construction locale du site sur
  une racine temporaire portant un `dojo-served.json` de fixture (exige une racine injectable dans `page.tsx`, ≈ 10 lignes). Prix : (b)
  ≈ 60 lignes ; (c) ≈ 10 lignes plus une construction. Déclencheur : avant (iii-a), au plus tard l'acte TU-7. Propriétaire : orchestrateur.
- **Ligne de clé refusée par le marcheur ⇒ TXT-14d** : DÉCIDÉ au pli G7 de 1a (Q-G2-1, « garder et déclarer ») ; chiffres committés dans
  les deux cas (aucun chiffre en jeu, seule la phrase diffère) ; déclaré dans l'en-tête de `dojoLiveViewOf` et épinglé par
  `dojo_live_says_a_key_change` ; prix d'un changement : ≈ 4 lignes du module de 1a (G2 de 1a, Q-G2-1). Pas une limite ouverte.
- **Prédicat restaté** : résidu CLOS par le renfort de T7 (section 6) ; DOJO-VERIFY-SLOT-ORDER-1 (vérificateur) reste ouvert à son
  déclencheur (avant le premier `snapshot` réel servi), inchangé : la partie site de C-G2-2 (B) est faite ici.
- Existants, inchangés : DOJO-SITE-PROXY-1 (acte, mesure `cf-cache-status` et `caddy version`), DOJO-EDGE-CACHE-1, DOJO-LOOKUP-PAYLOAD-1
  (le composant relit la chronologie et le fichier de lignes à chaque vue), DOJO-LIVE-HEALTH-1 (1c), PAROXYSME-DOJO-FILE-1 (porter ici
  DOJO-LIVE-RENDER-ORACLE-1). Textes TXT-14r et TXT-14b-r à approuver au cp-2 de 1b (P-10), puis validation visuelle (décision 291).

## 13. Questions à l'orchestrateur (Q-G1-n)

- **Q-G1-1** : compte ascendant 503 contre ≈ 400 à la mission (section 3) ; aperçu mesuré 616 (section 8 ; officiel : porte `r25` de
  l'oracle, dans `REPONSE.md`) : sous 1 150 et 1 205 (× 1,22 du compte). Confirmer.
- **Q-G1-2** : la logique exécutable vit dans `dojo-served.ts` au-delà de `dojoBodyOf` et `sentenceParts` (vue, réponse connue,
  prédicat, constantes du GET) : seule forme qui laisse les tests racines l'EXÉCUTER (section 4). Confirmer.
- **Q-G1-3** : prédicat restaté plutôt que factorisé (le chargeur est hors liste et un import relatif de valeur ne passe pas les deux
  programmes) ; parité et source du chargeur épinglées (T7). Confirmer.
- **Q-G1-4** : `dojo_copy_is_digit_free` amendé (les nouveaux textes portent « SHA-256 » et « Ed25519 » ; le composant entre dans le
  balayage des littéraux rendus) : troisième test amendé au-delà des deux de PL-1. Confirmer.
- **Q-G1-5** : « BOM relu donc refus » lu comme : le test unique de `test/dojo-live.test.ts` plus le cas BOM de
  `dojo_live_never_renders_why` (vue : TXT-14c). Confirmer.
- **Q-G1-6** : réécriture de développement `/dojo-served/:path*` (développement seul, non fermée aux trois chemins de l'extrait) :
  confirmer, ou la fermer par trois règles (≈ + 2 lignes).
- **Q-G1-7** : l'intitulé de `dojo_page_renders_served_figures_only` est réécrit (l'ancien disait « no rereading sentence », 277
  caractères ; le neuf en a 156). Confirmer.

## 14. Provenance, conduite, écarts, état final

- Rédacteur : worker `claude-opus-5-5` (R-1), effort max, instance fraîche ; mission `8f79d3c7…ac6` (reçu vert) ; aucun commit, aucun add,
  stash ni `GIT_DIR`/`GIT_WORK_TREE` ; git en lecture dans le worktree (`status`, `diff`, `log`, `rev-parse`, `branch --show-current`,
  `ls-files`) ; `clone --no-local` et `checkout --detach` dans mes seuls clones (`F:/tmp/dojo/pr4c1b/base`, `mclone`, `mclone2`) ;
  aucun réseau ; aucune clé réelle (clés Ed25519 générées à l'exécution par la fixture) ; rien sur C: (TEMP, TMP, TMPDIR sous F:).
- Écritures dans le worktree : les treize fichiers du lot et ce journal ; outils d'édition sans barre inverse sous
  `F:/tmp/dojo/pr4c1b/edits/` (`ed.mjs`, `lined.mjs`, `apply.mjs` et ses fichiers de spécification lus tels quels, `chk.mjs` pour la
  garde d'octets et les 160 caractères, `check-killers.mjs`, `r25-worktree.mjs`) ; table `F:/tmp/dojo/pr4c1b/table/gen-table.mjs`.
- **Écarts à la règle d'exploitation, consignés** :
  1. F2P `f2p2` lancé sous un verrou d'hôte tenu par un oracle G2 d'un autre lot (section 7) ; rejoué verrou libre (`f2p3`, qui fait
     foi). Les tests, `tsc` et ESLint de 15:51:29Z → 15:51:58Z ont été lancés verrou libre ; l'oracle G2 l'a pris à 15:51:36Z pendant
     leur course (chevauchement d'environ 22 s, lancement conforme à « relis-le avant chaque lancement »).
  2. **Entre 15:58:58Z et 15:59:46Z (heures lues avant et après), une commande de vérification portait par erreur
     `git --no-optional-locks write-tree --help`**. Aucun `write-tree`
     exécuté (`--help` affiche l'aide et n'exécute pas la sous-commande), aucun objet écrit ; mais Git for Windows
     (`git version 2.55.0.windows.5`, `help.format` non posé, donc HTML) a ouvert la page locale `git-write-tree(1)` dans Chrome
     (fenêtre titrée « git-write-tree(1) - Google Chrome », processus 118168 de la session de l'investisseur, relevé à 15:59:46Z).
     Contraire à la règle « aucune commande qui ouvre un navigateur » et à l'esprit de VALIDATEUR-NO-WRITE-TREE-1. L'onglet n'est pas
     fermé par moi (ce serait agir sur le navigateur de l'investisseur) : à fermer par lui. `error_origin` : worker G1.
  3. L'index du worktree porte la date 15:03:46Z, trois minutes après la création du worktree (15:00:58Z) : rafraîchissement des
     données de stat par mon premier `git status` lancé sans `--no-optional-locks` ; contenu indexé inchangé (`git diff --cached` vide,
     blob indexé de `dojo-served.ts` = `281376be:` du même chemin, `c587c06d`) ; toutes les commandes git suivantes dans le worktree en
     `--no-optional-locks` ou sans effet mesuré sur la date de l'index.
  4. Trois scripts de travail écrits par heredoc portaient des barres inverses (guillemets ou accents graves échappés : `e6-next.mjs`
     première version 2, `e12-t1-fix.mjs` première version 4, `e13-fix.mjs` 10) et un quatrième une tabulation littérale
     (`r25-worktree.mjs` première version) : AUCUN n'a été exécuté ; relus (`od` : aucun octet de contrôle dans le premier), réécrits sans
     barre inverse ni tabulation ou remplacés par la méthode des fichiers de spécification ; `e13-fix.mjs` retiré par `rm -f` à chemin
     fixe (mon propre fichier). Des commandes hors heredoc portaient des échappements (le dollar des lignes PowerShell `-Command`, des
     motifs `grep`) ; le brouillon de cette section en portait un aussi (réécrit avant d'entrer au journal).
  5. Une attente `sleep 45` refusée par le harnais (sans effet) ; une commande `sleep 1`.
  6. Retouches de forme après coup, chiffres inchangés : §0 (heure lue du compte, 15:28:00Z, au lieu de « 15:2xZ »), §2 (deux lignes
     de tableau raccourcies sous 160 caractères), §3 (renvoi de section 5 → 4) ; le compte ascendant du §3 est celui de 15:28:00Z.
- Advisor intégré consulté deux fois avant la clôture de ce journal : après l'orientation, avant le code (forme du lot sous `red-proof`,
  lieu de la logique, pièges des portes) ; avant les rejeux finaux (séquence de clôture, hygiène du journal, items à former). La
  consultation de fin, après l'oracle, est rapportée dans `REPONSE.md`. Conseil, jamais verdict ; chaque point vérifié sur pièce.
- Jonctions retirées à 16:03:36Z : worktree par `rm-nm.ps1` (« removed »), `base`, `mutants`, `mutants2` par
  `[System.IO.Directory]::Delete` ; balayage à 16:03:46Z : 0 point de réanalyse sous `F:/tmp/dojo/pr4c1b`, aucun au sommet du worktree ;
  `F:/Monark/node_modules` : 220 entrées, 10 `@monark`, `typescript` présent, avant (16:01:40Z) et après. Clones laissés en place comme
  preuves (aucun `rm`) : `base`, `mclone`, `mclone2`, `mutants/clone`, `mutants2/clone`.
- `git --no-optional-locks status --porcelain` à la clôture (16:03:46Z) : ` M` `COMPONENTS-PROVENANCE.md`, `app/dojo/page.tsx`,
  `dojo-figures.tsx`, `dojo-copy.ts`, `dojo-live.ts`, `dojo-served.ts`, `next.config.mjs`, `scripts/assert-fleet-html.mjs`,
  `test/dojo-live.test.ts`, `test/dojo-page.test.ts` ; `??` `dojo-live.tsx`, le snippet, ce journal, `test/dojo-live-surface.test.ts` ;
  aucun fichier ignoré (`--ignored` : rien).

## 15. Oracle (tâche 6) et clôture

- Ce journal est CLOS ici, avant le lancement de l'oracle, et n'est plus touché ensuite : l'objet d'arbre de l'enregistrement est celui
  de l'arbre à geler (pratique Q-C-5 de 1a). Commande : `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-dojo-pr4c1b
  --base 281376be --key PR-4c-1b`, verrou et C-V-4 relus au lancement, lancée en arrière-plan (borne du verrou 90 min plus la suite),
  jamais interrompue, aucune course de ma part pendant elle. Son enregistrement (chemin, sha256, portes, compte R-25 officiel par la porte
  `r25`) est cité dans `F:/tmp/dojo/pr4c1b-deliver/REPONSE.md` ; les empreintes des livrables dans `DELIVERED.sha256`.
