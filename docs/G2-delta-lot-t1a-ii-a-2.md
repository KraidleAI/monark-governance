# G2 — revue de delta `a52f67c → f5d86dd` (pli T-1a-ii-a-2 = V-1/V-2/V-3), lot `lot/t-1a-ii-a`, MONARK Bell

Relecteur G2, instance séparée, contexte frais. **R-1 — modèle résolu : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8`
vérifiable, effort max). Ni générateur ni relecteur précédent. Aucun commit, aucun `git` d'écriture (R-20).
Écritures uniquement sous `F:\tmp\g2-t1aiia2\` (+ clone bare `F:\tmp\g2-t1aiia2\clone.git`) ; `TEMP/TMP=F:\tmp`,
`npm ci --cache F:/tmp/npm-cache` ; rien sur `C:`. Un seul oracle à la fois (§F, port fixe `server.test.ts`).
Date 2026-09-19. Sortie brute pour vérification adversariale (R-21).

## VERDICT : **CONFORME**
Les 8 points de mission sont vérifiés indépendamment (oracle rejoué, mutants rejoués + 2 de mon cru, R-25 recompté,
merge-tree en clone). Deux observations non bloquantes formées (OBS-1 couverture Infinity, OBS-2 dépendance de
fusion ci.yml→UNION) — items formés avec déclencheur, aucune dette nue. Aucun C-n bloquant.

## Provenance / build indépendant
- Cible : worktree `F:\Monark-wt-bell2a`, branche `lot/t-1a-ii-a`, HEAD `f5d86dd` (propre) ; base R-25 `88c3324`
  (ancêtre de `f5d86dd` ; `merge-base(88c3324,f5d86dd)=88c3324` ⇒ diff 2-points ≡ 3-points).
- Extraction hermétique : `git -C F:\Monark-wt-bell2a archive --format=tar f5d86dd | tar -x -C F:\tmp\g2-t1aiia2\tree`,
  puis `npm ci --cache F:/tmp/npm-cache` (exit 0, 282 pkg). Node v24.15.0, npm 11.12.1, git 2.55.0.
- **sha256 LF (référence indépendante du worker, blob committé re-hashé) :**
  - `apps/bell/src/collect.ts` = `75b3b0606a8c2260bd2f966ebb83ebdde699bc6505c8ecb976478ca7801f75dc` (400 lignes, 0 CR) — **= PLI2**
  - `apps/bell/test/collect.test.ts` = `ff1273dd3ffdc37ab0d92dd6bef98941daa81ee784e0c660b67e56e143ebf269` (309 lignes, 0 CR) — **= PLI2**
  - `.gitattributes` : `* text=auto eol=lf` ⇒ dépôt normalisé LF (comparaison LF licite).
- **Réseau** : 0 appel Helius, 0 appel RPC public, aucune clé lue (`BELL_SOLANA_RPC`/`*_API_KEY` non définis ; les 5
  CLI échouent avant tout `fetch`, harnais `nofetch` à l'appui). Seul trafic : le **registre npm pour `npm ci`**
  (infrastructure de build, hors « appel public au sens Helius » de la mission).

## (1) Périmètre du delta = exactement 3 fichiers — CONFORME
`git diff --name-status a52f67c f5d86dd` :
```
M apps/bell/src/collect.ts
M apps/bell/test/collect.test.ts
A docs/PLI2-lot-t1a-ii-a.md
```
Aucun autre fichier. Delta (numstat a52f67c→f5d86dd) : collect.ts 35/13, collect.test.ts 32/1, PLI2 123/0.

## (2) V-1 — `parseArgs` pure, câblée, fail-closed — CONFORME
- Signature `collect.ts:306` : `export function parseArgs(argv, knownSymbols, nowMs = Date.now())` — **pure** pour un
  `nowMs` fixé (seul intrant d'horloge, paramétré ⇒ parse rejouable ; test pin `nowMs=1000` ⇒ `toUtcMs=1000`).
- Câblage `collect.ts:340` : `… = parseArgs(argv, POOLS.map((p) => p.baseSymbol));` — `knownSymbols` dérivé du
  registre `POOLS` (= TSLAx, SPYx, NVDAx, AAPLx, TSLAon). Remplace le parse inline (DRY, une source de défauts).
- Throws préfixés `bell/collect:` : (a) symbole inconnu ; (b) numérique via helper `num` = `!Number.isFinite(n) || n<0`
  (NaN, négatif, **et Infinity** rejetés) ; (c) `--eth`+TSLAon sans bornes valides (`!(ethFrom>0 && ethTo>=ethFrom)`).
- **CLI officielle hors ligne** (`node --import <nofetch> apps/bell/src/collect.ts …`, `globalThis.fetch` remplacé
  par `exit 99` si un fetch est tenté ; `--out` sous la racine de l'ARCHIVE) — les 5 cas, chacun **exit 1, stdout vide,
  jamais `NETWORK_ATTEMPTED` (0 appel réseau), stderr lisible préfixé `bell/collect:`** :
```
a) --pools ZZZ                      EXIT=1  bell/collect: unknown pool symbol 'ZZZ' (known: TSLAx, SPYx, NVDAx, AAPLx, TSLAon)
b) --window-days abc                EXIT=1  bell/collect: invalid numeric --window-days='abc' (need a finite value >= 0)
c) --out <sous le dépôt> --pools TSLAx  EXIT=1  bell/collect: --out is under the repo root (CA-11: outputs must be OUTSIDE the tree)
d) --pools TSLAon --eth            EXIT=1  bell/collect: --eth with TSLAon needs --eth-from-block > 0 and --eth-to-block >= --eth-from-block
e) --body-sample -1                EXIT=1  bell/collect: invalid numeric --body-sample='-1' (need a finite value >= 0)
```
  Cas (c) : raison CA-11 **lisible**, plus jamais `FATAL transport` (bug d'origine du checkpoint corrigé bout-en-bout).
  Aucun dossier `--out` créé sous le dépôt (CA-11 tenu).

## (3) V-2 — `quorum_required` + `providers_distinct` (dérivé via `providerOf`), clé `quorum` absente — CONFORME
- `collect.ts:173` : `const providersDistinct = new Set(providers.map(providerOf)).size;` ; provenance `:176` et journal
  `:181` portent `quorum_required: 2, providers_distinct: providersDistinct`. La clé `quorum` a disparu des deux.
- `providerOf` (`apps/sentinel/src/rpc.ts:28`) = 2 derniers labels du hostname : `mainnet.helius-rpc.com` et
  `b.helius-rpc.com` ⇒ `helius-rpc.com` (fusionnés) ; `api.mainnet-beta.solana.com` ⇒ `solana.com`. 3 URLs ⇒ **2 distincts**.
  Test `bell_journal_quorum_required_and_providers_distinct` (vert) : `quorum_required=2`, `providers_distinct=2`,
  `"quorum" in journal === false`, provenance idem — **fusion d'alias prouvée**.
- `bell_sha` **inchangé** : `PINNED_BELL_SHA = 4375042c518253e2232f0390dfcd792db4d65ca55e9832900bc19862fab6fa46`
  (`collect.test.ts:51`, non touché par le delta) ; `journal`/`provenance` ne sont pas hachés (digest via `buildDigest`,
  non modifié) ; le test `bell_collector_replays_fixture_bit_identical` passe dans l'oracle 340/340.

## (4) V-3 — `fatalMessage` : local verbatim, transport scrubbé — CONFORME
- `collect.ts:394` : `fatalMessage(e)` renvoie `e.message` **verbatim** si préfixé `bell/collect:`, sinon
  `FATAL ${statusOf(e)}`. Câblé `:399` `main().catch((e) => { …fatalMessage(e)… process.exit(1); })`.
- `statusOf` (`quorum.ts:45`) ne renvoie que `rpc <code>` / `HTTP <ddd>` / `timeout` / `transport` — **jamais d'URL ni de clé**.
  Test (vert) : `assertOutsideRepo` réel ⇒ `^bell/collect: --out is under the repo root` ; `HTTP 429 https://x.example/rpc`
  ⇒ `FATAL HTTP 429` (URL retirée, scrub C-10 conservé).

## (5) Mutants — 5 du worker rejoués RED + 2 de mon cru ; restauration sha-exacte (LF) — CONFORME
Pilote Python I/O binaire (`F:\tmp\g2-t1aiia2\run_mutants.py`) : sha pré = `75b3b060…` + `0 CR` asserté ; mutation
octet à occurrence unique ; `node --test --test-reporter=tap apps/bell/test/collect.test.ts` (fichier Bell seul, évite
le port harness) ; restauration depuis l'original + **contrôle sha == baseline à chaque itération** (sha final == baseline).

| Mutant | Modification | Résultat | Test rougi |
|---|---|---|---|
| M1 (V-1a) | `!knownSymbols.includes(w)` → `false` | **RED** | `bell_parseargs_fail_closed_and_wired` |
| M2 (V-1 câblage) | appel `parseArgs` retiré de `main` (parse inline réel, compile) | **RED** | `bell_parseargs_fail_closed_and_wired` |
| M3 (V-2) | ligne journal → `quorum: 2` | **RED** | `bell_journal_quorum_required_and_providers_distinct` |
| M4 (V-3) | catch `fatalMessage(e)` → `statusOf(e as Error)` | **RED** | `bell_fatal_message_verbatim_local_and_scrubbed_transport` |
| M5 (V-3) | préfixe `bell/collect:` non reconnu (`…ZZZ:`) | **RED** | `bell_fatal_message_verbatim_local_and_scrubbed_transport` |
| **MG2 (mien)** | `new Set(providers.map(providerOf)).size` → `providers.length` | **RED** (3≠2) | `bell_journal_quorum_required_and_providers_distinct` |
| **MG1 (mien)** | `num` accepte Infinity : `!Number.isFinite(n)` → `Number.isNaN(n)` | **GREEN — survivant déclaré (OBS-1)** | — |

Transparence M4 : mon premier pattern M4 n'a pas apparié (échappement `\n` du template literal dans le pilote) —
détecté par « pattern occurs 0 times » (jamais exécuté sur une variante fausse) ; rejoué avec un pattern sans `\n`
(`fatalMessage(e)` → `statusOf(e as Error)` dans le catch) = **catch → statusOf**, fidèle au M4 du worker (câblage).
`run_mutants.py` conserve l'ancien littéral M4 (aborté) ; le M4 RED ci-dessus est le pattern corrigé, rejoué séparément.

## (6) Oracle complet (arbre extrait `f5d86dd`, npm ci frais) — CONFORME
- `npm run ci` : gate:vocab OK (162 fichiers) · `tsc --noEmit` OK · **tests pass 340 / fail 0 = 340/340** (= 337+3 attendu).
- `npm run lint` (eslint) exit 0 (0). `npm run lint:ratchet` **69/69** exit 0. `npm run export:check` exit 0 (0 chemin interdit).
- `node scripts/lang-gate.mjs --scope root,contracts,schemas,site` : **0 hit** exit 0.

## (7) R-25 sous l'UNION des pathspecs — CONFORME (1192 ≤ 1205)
`git diff --shortstat 88c3324 f5d86dd -- <pathspec>` (identique en `88c3324...f5d86dd`), CHANGED = ins+del (awk du ci.yml).
UNION = pathspec `F:\Monark\.github\workflows\ci.yml` (ligne STAT = **ligne 55** ; la ligne 52 de la mission est un
commentaire) **avec** `:(exclude,glob)docs/**/*.md` **+** les 3 excludes série Bell du `ci.yml` du lot
(`:(exclude,glob)apps/bell/test/fixtures/series/**/*.{json,jsonl,csv}`). **Pathspec vérifié au blob épinglé** :
`git show 02e80e2:.github/workflows/ci.yml` (le HEAD etude-suite du merge-tree, point 8) — ligne 55, excludes
**identiques** à ceux passés (aucune dérive malgré 3 avances de HEAD dans la session).

| Pathspec | fichiers | insertions | suppressions | CHANGED |
|---|---|---|---|---|
| (A) etude-suite seul | 16 | 1272 | 17 | 1289 |
| (B) lot seul | 16 | 1349 | 17 | 1366 |
| **(C) UNION** | **14** | **1175** | **17** | **1192 ≤ 1205 (marge 13)** — **= worker** |

`docs/PLI2-lot-t1a-ii-a.md` **absent** du numstat UNION (exclu par `docs/**/*.md`, 0 coût R-25). Baseline
**recomputée** (non [2nd]) : UNION sur `88c3324 a52f67c` = 14 fichiers, 1122+17 = **1139** ⇒ increment mesuré du pli
= **+53** (1139→1192), cohérent avec le checkpoint (« +53, reste 13 de marge »).

## (8) merge-tree (clone bare `F:\tmp\g2-t1aiia2\clone.git`) × `lot/etude-suite` HEAD — CONFORME
`lot/etude-suite` épinglé au moment du test = `02e80e2` (bouge : snapshot initial 47ac040, worktree-list 774fa3f).
`git merge-tree --write-tree --name-only 02e80e2 f5d86dd` : exit 1 ; **fichier en conflit = `.github/workflows/ci.yml` SEUL**
(`test/ci-gates.test.ts` = « Auto-merging », aucune ligne CONFLICT). L'objet tree `ca8abd32…` écrit reste **dans le
clone** (F:\tmp), jamais dans le dépôt réel (AM-2 respecté).

## Observations formées (non bloquantes, avec déclencheur — jamais une dette nue)
- **OBS-1 (couverture, `error_origin` = co-origine planificateur (spec) / générateur (durcissement non épinglé))** :
  mutant MG1 « `num` accepte Infinity » **survit** — le test V-1 n'a que `abc` (NaN) et `-3` (négatif). **Non bloquant** :
  (a) la liste fermée V-1 du checkpoint est « NaN/négatif » (le test couvre exactement le spec) ; (b) le code **livré
  rejette bien Infinity** (`Number.isFinite` ⇒ `need a finite value`) — le trou est un durcissement au-delà du spec, non
  épinglé, cohérent avec la CA-8 du checkpoint. Item formé : ajouter
  `assert.throws(() => parseArgs(["--window-days","Infinity"], K), /invalid numeric/)`. Déclencheur : prochaine passe Bell / avant -b.
- **OBS-2 (fusion, `error_origin` = orchestrateur)** : (A) 1289 et (B) 1366 dépassent 1205 **individuellement** ; seule
  l'(C) UNION passe (1192). C'est exactement l'item de fusion **déjà formé** au checkpoint (« Fusion (orchestrateur) :
  `ci.yml` en UNION ») : le conflit `ci.yml` (point 8) doit se résoudre en UNION, et l'état FUSIONNÉ dans etude-suite
  applique alors la ligne R-25 UNION (1192 ≤ 1205). Non introduit par ce delta ; à consommer au G7/fusion.
- **OBS-3 (borne « pli ≤ 60 lignes », informatif, non tranché)** : increment R-25 UNION **mesuré** = **+53 ≤ 60** (lecture R-25,
  celle appariée au checkpoint) ; ins+del bruts des 2 `.ts` = **81** (lecture diff brut). Le validateur/orchestrateur
  arbitre la métrique ; par la lecture R-25 la borne est tenue.

## Preuve « rien touché » (R-20, git status inchangé sur `F:\Monark*`)
- Baseline (`baseline-status.txt`) vs final (`final-status.txt`) sur les 35 dépôts/worktrees : **unique différence** =
  `F:/Monark` HEAD `81e4fd0 → 02e80e2` (avances de commit de l'orchestrateur externe, working tree propre les 2 fois ;
  jamais mon fait — je n'ai lancé aucun `git` d'écriture ni écrit un octet sous `F:\Monark*`). **Aucun** fichier sale
  apparu nulle part.
- Cible de revue `F:\Monark-wt-bell2a` : HEAD `f5d86dd`, `git status --porcelain` **vide** (propre).
- Toutes mes écritures : `F:\tmp\g2-t1aiia2\` (tree, logs, .tap, run_mutants.py, nofetch.mjs, clone.git). `C:` : rien.

## Fichiers d'appui (F:\tmp\g2-t1aiia2\)
`oracle-ci.log` (340/340), `lint.log`, `ratchet.log` (69/69), `lang.log`, `export.log`, `bell-baseline.tap` (14/14),
`run_mutants.py`, `nofetch.mjs`, `mt.out` (merge-tree), `baseline-status.txt`, `final-status.txt`, `tree/` (archive f5d86dd).
