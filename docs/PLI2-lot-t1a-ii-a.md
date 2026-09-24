# PLI T-1a-ii-a-2 (worker) — corrections V-1 / V-2 / V-3 du checkpoint-2 (MONARK Bell)

Worker **Opus 4.8**, contexte frais, 2026-09-19. Suite donnée par l'orchestrateur au CHECKPOINT2-lot-t1a-ii-a
(« V-1/V-2/V-3 = pli T-1a-ii-a-2 (worker) → G2 delta → checkpoint-2 bis borné »). Rien n'est committé (R-20) ;
sortie brute pour vérification adversariale (R-21). Scratch : `F:\tmp\t1aiia-2\`.

## Provenance / R-1
- **Modèle résolu (contrôle R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` vérifiable ; effort max).
- **Worktree** : `F:\Monark-wt-bell2a`, branche `lot/t-1a-ii-a`, HEAD `a52f67c` (base R-25 `88c3324`).
- **Fichiers touchés (2)** :
  - `apps/bell/src/collect.ts` — 378 → **400** lignes — sha256 (LF) `75b3b0606a8c2260bd2f966ebb83ebdde699bc6505c8ecb976478ca7801f75dc`
  - `apps/bell/test/collect.test.ts` — 278 → **309** lignes — sha256 (LF) `ff1273dd3ffdc37ab0d92dd6bef98941daa81ee784e0c660b67e56e143ebf269`
- **Aucune clé, aucun appel Helius/Polygon** ; les 4 rejeux CLI sont **hors ligne** (échec avant tout `fetch`,
  0 appel réseau, `BELL_SOLANA_RPC`/`*_API_KEY` non définis). Aucun crédit consommé.

## Périmètre & tuyaux (branchement — règle investisseur 2026-09-19)
- **Entrée** : `process.argv` (opérateur). **Sortie consommée par** : `main()` (chemin servi = CLI off-tool
  ADR-B0 D7 O-5). **État** : néant en propre (les 3 fonctions sont pures ; `main` écrit hors dépôt, CA-11).
- **Tests d'intégration non-LLM** qui rejouent la composition de bout en bout : (a) 3 tests unitaires
  `collect.test.ts` (dont 2 preuves de câblage sur la source) ; (b) **4 exécutions CLI réelles hors ligne**
  (`node apps/bell/src/collect.ts …`) prouvant `parseArgs → main().catch → fatalMessage → exit 1`.
- Bell reste `upcoming` (jambe live non branchée à une surface servie ; inchangé par ce pli).

## V-1 — CLI fail-closed (fonction pure `parseArgs`, câblée dans `main`)
- **Code** : `apps/bell/src/collect.ts:306` `export function parseArgs(argv, knownSymbols, nowMs = Date.now())`
  (pure : `nowMs` est le seul intrant d'horloge, paramétré ⇒ parse rejouable). Lève `bell/collect: …` sur
  (a) symbole `--pools` inconnu, (b) numérique NaN/négatif (helper `num`), (c) `--eth` avec `TSLAon` sans
  bornes valides (`--eth-from-block > 0 && --eth-to-block >= --eth-from-block`).
- **Câblage** : `collect.ts:340` — `const { out, toUtcMs, fromUtcMs, wanted, maxPages, bodySample, minInterval,
  eth, ethFrom, ethTo } = parseArgs(argv, POOLS.map((p) => p.baseSymbol));` (DRY : remplace le parse inline ;
  une seule source de vérité pour les défauts — supprime la classe de dérive diagnostiquée au checkpoint).
  `knownSymbols` dérivé du **registre** `POOLS` = `TSLAx, SPYx, NVDAx, AAPLx, TSLAon`. La jambe Ethereum
  utilise `eth/ethFrom/ethTo` issus de `parseArgs`.
- **Test** : `collect.test.ts:282` `bell_parseargs_fail_closed_and_wired` — 3 cas (inconnu / NaN+négatif /
  `--eth`+TSLAon sans bornes) lèvent le message attendu ; un parse valide porte `wanted/eth/ethFrom/ethTo/
  toUtcMs` (nowMs épinglé 1000 ⇒ déterministe). **Preuve de câblage** : `assert.match(SRC, /parseArgs\(argv,
  POOLS\.map/)`.
- **Écart assumé (déclaré)** : le littéral de mission `/parseArgs\(/` matcherait aussi la **définition** ⇒ le
  mutant « appel retiré de main » resterait vert. Regex durcie sur le **site d'appel** `/parseArgs\(argv,
  POOLS\.map/` (même précédent que le test CA-11 `/assertOutsideRepo\(out, repoRoot\)/`). Rougissement prouvé
  par le mutant M2 (rouge).
- **Mutants** : **M1** « inconnu accepté » (`!knownSymbols.includes(w)` → `false`) ⇒ rouge ; **M2** « appel
  retiré de main » (destructuring `parseArgs(...)` remplacé par le parse inline) ⇒ rouge (assertion de câblage).

## V-2 — journal & provenance : `quorum_required` + `providers_distinct` (dérivé)
- **Code** : `collect.ts:173` `const providersDistinct = new Set(providers.map(providerOf)).size;` (dérivation
  par `providerOf`, idempotente sur les domaines nus : deux alias d'un même opérateur comptent pour 1).
  Provenance `collect.ts:176` et journal `collect.ts:181` portent désormais `quorum_required: 2,
  providers_distinct: providersDistinct` au lieu de la constante ambiguë `quorum: 2`.
- **Test** : `collect.test.ts:294` `bell_journal_quorum_required_and_providers_distinct` — 3 URLs (dont 2 alias
  Helius) ⇒ `quorum_required=2`, `providers_distinct=2` (alias fusionnés = dérivation prouvée), clé `quorum`
  **absente** ; provenance vérifiée de même.
- **`bell_sha` inchangé** : le digest est séparé et non touché ; `bell_collector_replays_fixture_bit_identical`
  reste **vert** sur `PINNED_BELL_SHA = 4375042c518253e2232f0390dfcd792db4d65ca55e9832900bc19862fab6fa46`
  (journal/provenance non hachés — vérifié par ce test qui passe dans l'oracle 340/340).
- **Journal honnête (chemin par défaut)** : en prod `PUBLIC_SOLANA` = `["solana.com"]` ⇒ journal
  `quorum_required: 2, providers_distinct: 1` — expose la **raison visible** du `no_quorum` fail-closed (C-1a),
  sans run live.
- **Mutant** : **M3** (journal revenu à `quorum: 2`) ⇒ rouge.

## V-3 — `main().catch` : erreur locale verbatim, faute réseau scrubée
- **Code** : `collect.ts:394` `export function fatalMessage(e)` — si `e.message` préfixé `bell/collect:` ⇒
  message **verbatim** ; sinon `FATAL ${statusOf(e)}` (scrub C-10 conservé : ni URL ni clé ne fuit). Câblé
  `collect.ts:399` `main().catch((e) => { process.stderr.write(fatalMessage(e) + "\n"); process.exit(1); });`.
- **Test** : `collect.test.ts:303` `bell_fatal_message_verbatim_local_and_scrubbed_transport` — le **vrai**
  throw `assertOutsideRepo` passe par `fatalMessage` ⇒ commence par `bell/collect: --out is under the repo
  root` (lisible, pas `FATAL transport`) ; `HTTP 429 https://x.example/rpc` ⇒ `FATAL HTTP 429` (URL retirée) ;
  **câblage** `assert.match(SRC, /main\(\)\.catch.*fatalMessage\(e\)/s)`.
- **Mutants** : **M4** (`.catch` revenu à `statusOf`) ⇒ rouge (câblage) ; **M5** (préfixe `bell/collect:` non
  reconnu — **reproduit le bug d'origine** : l'erreur locale re-masquée en `FATAL transport`) ⇒ rouge.

## Mutants (5/5 rouges, restauration exacte) — `F:\tmp\t1aiia-2\run_mutants.py`
Protocole sans `git` (R-20) : `cp` binaire de sauvegarde → mutation octet (Python `bytes`, LF préservé) →
`node --test --test-reporter=tap apps/bell/test/collect.test.ts` → `cp`/restauration → contrôle sha.

| Mutant | Modif | Test rougi |
|---|---|---|
| M1 (V-1a) | `!knownSymbols.includes(w)` → `false` | `bell_parseargs_fail_closed_and_wired` |
| M2 (V-1b) | appel `parseArgs` retiré de `main` (parse inline) | `bell_parseargs_fail_closed_and_wired` |
| M3 (V-2) | journal → `quorum: 2` | `bell_journal_quorum_required_and_providers_distinct` |
| M4 (V-3) | `.catch` → `statusOf` | `bell_fatal_message_verbatim_local_and_scrubbed_transport` |
| M5 (V-3) | préfixe `bell/collect:` non reconnu | `bell_fatal_message_verbatim_local_and_scrubbed_transport` |

Baseline restaurée verte ; **RESTORED_SHA == pre-mutant `75b3b0606a8c…7801f75dc`** (restauration exacte, LF).
**Divulgation (transparence, jamais un octet dans le dépôt)** : un premier essai du driver écrivait en mode
texte Python et a réécrit `collect.ts` en CRLF (sha `d1b10541…`, **scratch uniquement**) ; détecté par
mismatch de sha, restauré depuis la sauvegarde `cp` (LF), driver ré-écrit en I/O binaire. **Aucun gate n'a
tourné sur la variante CRLF** : `ci/lint/ratchet/lang/export` et les 4 CLI ont tous été exécutés APRÈS retour
au LF `75b3b060`. `git status` reste 2 `M` + 1 `??` (aucun artefact scratch dans le dépôt).

## Sorties CLI (hors ligne, chacune exit 1, aucun stdout ⇒ 0 appel réseau)
```
a) --pools ZZZ
   EXIT=1  STDERR: bell/collect: unknown pool symbol 'ZZZ' (known: TSLAx, SPYx, NVDAx, AAPLx, TSLAon)
b) --window-days abc
   EXIT=1  STDERR: bell/collect: invalid numeric --window-days='abc' (need a finite value >= 0)
c) --out F:/Monark-wt-bell2a/x --pools TSLAx
   EXIT=1  STDERR: bell/collect: --out is under the repo root (CA-11: outputs must be OUTSIDE the tree)
d) --pools TSLAon --eth
   EXIT=1  STDERR: bell/collect: --eth with TSLAon needs --eth-from-block > 0 and --eth-to-block >= --eth-from-block
e) --body-sample -1   (autre appelant du helper num() — confirme le fail-closed partagé)
   EXIT=1  STDERR: bell/collect: invalid numeric --body-sample='-1' (need a finite value >= 0)
```
Cas (c) : message **lisible** (raison CA-11), plus jamais `FATAL transport` — correction V-3 confirmée bout-en-bout.

## Oracle (séquentiel, §F : jamais deux oracles en parallèle avec port fixe)
- `npm run ci` (gate:vocab + typecheck + test) ⇒ **340/340 pass, 0 fail** (337 + 3 ; ≥ 337 attendu).
- `npm run lint` ⇒ **0** (exit 0). `npm run lint:ratchet` ⇒ **69/69** (casts vers types concrets ⇒ 0 hit
  unsafe ajouté). `npm run export:check` ⇒ **0** (exit 0).
- `node scripts/lang-gate.mjs --scope root,contracts,schemas,site` ⇒ **0 hit** (exit 0). `apps/bell` est
  scopé « bell » (vocab) et anglais ; `docs/` est un `SKIP_DIR` lang-gate (ce rapport n'est pas scanné).
- `npx tsc --noEmit` ⇒ exit 0 (inclus dans ci).

## R-25 (UNION des pathspecs : `F:\Monark\.github\workflows\ci.yml` + 3 excludes série Bell du lot)
`git diff --shortstat 88c3324 -> arbre de travail` sous l'UNION (dont `:(exclude,glob)docs/**/*.md` de D9
septies et les 3 `:(exclude,glob)apps/bell/test/fixtures/series/**/*.{json,jsonl,csv}`) :
**14 fichiers, 1175 insertions, 17 suppressions ⇒ 1192 ≤ 1205** (baseline 1139 ; +53, reste 13 de marge).
`collect.ts`/`collect.test.ts` étant nouveaux depuis `88c3324`, ils comptent en insertions (+22 / +31).
Le rapport `docs/**/*.md` est exclu (0 coût R-25).

## Reste
Vide. Aucun point non résolu, aucune dette, aucune demande de procurement, aucun contournement. Items O-8..O-11
(hors périmètre de ce pli borné) restent portés dans CHANTIERS par l'orchestrateur.
