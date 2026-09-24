# G2 — lot U-1a-hard-2 (delta e8bcfe4→e66324b, branche lot/u-1a-hard-2)

Relecteur G2, instance séparée, contexte frais. **Modèle résolu tel quel (R-1)** : `claude-opus-4-8[1m]`
(préfixe `claude-opus-4-8` ; effort max). Je ne suis pas le générateur. Aucun commit, aucun `git` d'écriture,
aucun workflow (R-20). Écritures de vérification sous `F:\tmp\g2-u1ahard2\` uniquement (copie `git archive e66324b`,
`npm ci --cache F:/tmp/npm-cache`, `vocab-banned.json` à la racine — présent). Date 2026-09-19.

## VERDICT : APPROUVÉ-AVEC-CORRECTIONS
La liste fermée V-1 (a)-(f) + V-5 est satisfaite au niveau littéral ; tous les gates verts (341/341, lint 0,
ratchet 69/69, export:check 0, lang-gate 0, no_secret ✔, gate:vocab 157, tsc 0) ; PIN `034fbff9…` intact ;
11 mutants du worker rejoués ROUGES (aucun hang, restauration == PIN) ; R-25 227 (< 400/1205) ; fusion PROPRE.
**Le point bloquant (b) — R2 : la paire ukemi rougit ET termine en < 15 s — est vérifié par mesure (10,4 s).**
UNE correction : **C-1** (trou de force de test sur la granularité de clé de `dedupLogs`, mutant G2 survivant).
Observations non bloquantes O-1..O-4. Rien ne réouvre la liste fermée ; C-1 est un durcissement de test
(le code est correct), à adjuger par l'orchestrateur au G7.

---

## Reproduction (indépendante)
- `git archive e66324b | tar -x` → `F:/tmp/g2-u1ahard2/tree`. PINs sources recomputés `git show e66324b:…` :
  rpc2.ts `720d399e…` == worker ; record.ts `71c542e7…` == worker.
- `npm ci` : 282 paquets, 0 vuln, Node v24.15.0.

## Gates (copie isolée)
| Gate | Commande | Résultat |
|---|---|---|
| gate:vocab | `npm run gate:vocab` | OK — 157 fichiers |
| typecheck | `npm run typecheck` | exit 0 |
| test (oracle) | `npm test` | **341/341**, fail 0, cancelled 0, duration_ms 32430, wall 34,3 s |
| lint | `npm run lint` | exit 0 |
| ratchet | `npm run lint:ratchet` | **69/69**, exit 0 |
| export:check | `npm run export:check` | exit 0 — 0 chemin interdit, 0 hit FR |
| lang-gate | `node scripts/lang-gate.mjs --scope root,contracts` | exit 0 — 0 hit FR |
| no_secret | tests `no_secret_in_repo` + `bell_no_secret_in_repo` | ✔ / ✔ (dans les 341) |

## (b) — R2, la vérification bloquante (mesurée par moi)
Copie mutée `record.ts` (retire `&& attempt < maxRetries` du branchement 429/5xx), puis paire complète :
`node --test --test-timeout=120000 --test-force-exit apps/sentinel/test/ukemi.test.ts apps/sentinel/test/ukemi-record.test.ts`
enveloppé d'un garde dur `timeout --signal=KILL`.
- **Flags production** : **exit 1, signal null, wall 10 388 ms (< 15 s)** ; tests 31, pass 29, **fail 1**
  (`ukemi_record_retry_is_bounded`, 30,9 ms), **cancelled 1** (`ukemi_default_call_classifies_rpc_errors`,
  annulé à son cap `{timeout:10_000}` = 10 014 ms). La paire ROUGIT ET SORT seule (pas tuée par mon garde). ✓
- **Sans `--test-force-exit`** (contrôle) : **tué par mon garde 30 s (exit 137, wall 30 080 ms)** ⇒ PEND.
  Confirme que `--test-force-exit` est PORTEUR (mesuré), pas gratuit : `--test-timeout`/`{timeout}` marquent le
  rouge mais l'event-loop reste vivant (le `setTimeout` de la boucle infinie) — exactement l'AM-1 du validateur.
- record.ts restauré : sha256 `71c542e7…` == PIN.
- Durée VERTE de `ukemi_default_call_classifies_rpc_errors` (relevée du run vert) : **1040 ms** ⇒ marge ~10× sous
  le cap 10 s (sizing sain, cf. O-4).
- `timeout-minutes` : 5 clés réelles dans ci.yml (g1 5, r25 5, g3 10, g4 5, g6 5) = nb de jobs (la 6ᵉ occurrence
  du grep est le commentaire explicatif). Bornes ≤ 20, ≥ 3× mesure.

## Table des mutants — 11 worker (rejoués) + 2 G2 (adversariaux)
Driver G2 indépendant `F:/tmp/g2-u1ahard2/mut/driver-g2.mjs`, PRIST = snapshot `git show` séparé (jamais la copie
worker), PIN recomputés (== worker). node SANS `--test-timeout` (le wall-time = preuve de sortie), garde spawnSync 45 s.
Exécuté depuis `F:/tmp/g2-u1ahard2/tree` — **jamais dans `F:\Monark-wt-u1ahard2`**.

| Mutant | fichier | baseline | mutant | temps mut | restauré==PIN | verdict |
|---|---|---|---|---|---|---|
| M4 revert benches | rpc2 | pass 2/0 | fail 1 exit 1 | 255 ms | oui | ROUGE ✓ |
| M5 revertKey ignore data | rpc2 | pass 2/0 | fail 1 exit 1 | 246 ms | oui | ROUGE ✓ |
| M5b garde 0x retirée | rpc2 | pass 2/0 | fail 1 exit 1 | 251 ms | oui | ROUGE ✓ |
| M6 clause message retirée | rpc2 | pass 3/0 | fail 2 exit 1 | 788 ms | oui | ROUGE ✓ |
| R1 retry sur RpcError | record | pass 2/0 | fail 1 exit 1 | 310 ms | oui | ROUGE ✓ |
| **R2 retry infini** | record | pass 2/0 | **fail 1 exit 1 (signal null)** | 251 ms | oui | ROUGE ✓ |
| (a) garde forme string | record | pass 2/0 | fail 1 exit 1 | 253 ms | oui | ROUGE ✓ |
| (c) plafond backoff retiré | record | pass 2/0 | fail 1 exit 1 | 225 ms | oui | ROUGE ✓ |
| (d) journal non-JSON retiré | record | pass 2/0 | fail 1 exit 1 | 268 ms | oui | ROUGE ✓ |
| (e) clause plan-limit retirée | rpc2 | pass 2/0 | fail 1 exit 1 | 276 ms | oui | ROUGE ✓ |
| (f) dédup retirée | rpc2 | pass 2/0 | fail 1 exit 1 | 261 ms | oui | ROUGE ✓ |
| **G2-1 dédup par (blockNumber) seul** | rpc2 | pass 3/0 | **pass 3/0 (VERT)** | 689 ms | oui | **SURVIVANT → C-1** |
| **G2-2 cap backoff ignoré au call-site** | record | pass 4/0 | **pass 4/0 (VERT)** | 281 ms | oui | **SURVIVANT → O-1** |

`final rpc2 sha 720d399e… ==PIN`, `final record sha 71c542e7… ==PIN`. Aucun mutant en signal (aucun hang).
Les 11 mutants du worker : reproduits ROUGES à l'identique. Table worker HONNÊTE.

## Vérification item par item (V-1)
- **(a)** `isMainModule(argv1, metaUrl)` exportée (record.ts:153), utilisée par le run-guard (record.ts:195). Tueur
  cross-plateforme « chemin avec espace » : test `ukemi_record_is_main_module_cross_platform` vert dans les 341 ;
  mutant (a) (ancienne forme string) ROUGE ; sonde validateur `o1-crossplatform.mjs` confirme NEW=true/OLD=false
  sous POSIX. CLI **`--cluster bogus` ⇒ `FATAL … unknown cluster 'bogus'`, exit 1** (hors ligne, `clusterById`
  jette avant tout pool) ; **`--retries -1` ⇒ exit 1** (fail-closed, `parseUkemiArgs`). ✓
- **(b)** stub sert 503 aux tentatives 0..retries et 200 à la 4ᵉ (record test:49) ⇒ boucle bornée rejette au 3ᵉ
  (count===3), boucle non bornée RÉSOUT et rougit vite. R2 sur paire complète : ROUGE + SORT < 15 s (10,4 s, cf.
  supra). `timeout-minutes` par job présent. ✓
- **(c)** `backoffDelay = Math.min(backoffMs*2**attempt, capMs)` pure/exportée (record.ts:39), `backoffCapMs`
  défaut 8000, câblée aux deux sleeps + CLI `--backoff-cap-ms` ; test `…_backoff_delay_is_capped` (0/3/4/20 + ∀a≤30)
  + `--backoff-cap-ms -5` fail-closed ; mutant (c) ROUGE. ✓ (réserve O-1 sur le câblage, cf. infra)
- **(d)** 200 non-JSON : `res.text()`+`JSON.parse` sous try/catch ⇒ 1 entrée de journal `{provider(domaine),
  http:200, message:"non-JSON body:…"}` + throw non-retryable ; test `…_guards_non_json_200` (count===1, 1 entrée,
  domaine, http 200) ; mutant (d) ROUGE. Classification non-retryable documentée (record.ts:86). ✓
- **(e)** `isPlanLimited(/free plan/i)` (rpc2.ts:53) jette AVANT `isResultLimit` (rpc2.ts:174) ⇒ bench sans split.
  **Formes exactes D9 recomputées** : `weth-live.json` 31× `ranges over 10000 blocks are not supported on free
  plan` (+25 « Can't route ») ; `susde-live.json` 31× (+32 « Can't route ») — == worker. Test `…_free_plan_benches
  _without_split` (drpcCalls===1) ; mutant (e) ROUGE. ✓
- **(f)** `dedupLogs` sur `(blockNumber,logIndex,txHash)` normalisés (rpc2.ts:88), appliqué à `getLogsRange`
  (rpc2.ts:195) ; test `…_getlogsrange_dedups_chunk_boundary` (bord de chunk, [0,19] sans trou) ; mutant (f)
  (dédup retirée) ROUGE. **Exigence littérale V-1(f) satisfaite.** MAIS granularité de clé non verrouillée → C-1.
- **PIN** : `book_digest 034fbff9…` intact — les 341 (dont `sentinel2_book_identical_to_pull` et le baseline de
  `ukemi_default_call_classifies_rpc_errors`) l'assertent. Aucune clé de book nouvelle : `book.ts` non touché
  (diff --stat) ; `backoff_cap_ms` vit dans `provenance.params`, hors `res.book` (record.ts:179). Recorder
  **upcoming** : aucun import de `ukemi/record` hors `src/ukemi` + tests. ✓
- **V-5** : `F:\tmp\u1a-hard-2\gho-probe-raw.json` (616 o) sha256 **`38b9a609d1429e1ea4d10d630ce131bfa3b96990e37222027a2b5ebbb1c44431`** — recomputé == worker. ✓

## R-25 (three-dot, D9 septies)
| # | base…tête, pathspec | lignes | note |
|---|---|---|---|
| 1 | `e8bcfe4...e66324b`, pathspec **main ci.yml:52 (D9 septies, docs exclus)** | 6 fichiers, 198+29 = **227** | == worker « 227 code », < 400 objectif, ≪ 1205 |
| 2 | `e8bcfe4...e66324b`, pathspec de la BRANCHE (docs comptés) | 7 fichiers, 438+29 = **467** | rapport (240) compté |
| 3 | `lot/etude-suite...e66324b`, pathspec main | 7 fichiers, 507+40 = **547** | inclut le lot u-1a-hard (pas dans etude-suite) — cf. O-2 |
Tous < 1205 (borne ADR). Le chiffre du brief (227) est reproduit.

## Fusion avec lot/etude-suite (HEAD de F:\Monark)
- etude-suite a AVANCÉ pendant la session e756490 → **187ed86** (G7 e-honnetete, sans rapport). merge-base(etude-suite,
  e66324b) = a3f85f4. **e8bcfe4 (u-1a-hard) N'EST PAS dans etude-suite** ⇒ O-2.
- `git merge-tree --write-tree --name-only lot/etude-suite e66324b` : **exit 0 = AUCUN CONFLIT** (arbre e488751…),
  identique contre e756490 ET 187ed86 (robuste au mouvement du ref).
- Arbre fusionné vérifié : ci.yml = **5 timeout-minutes (branche) + 1 exclusion `docs/**/*.md` (etude-suite, D9
  septies)** union propre ; package.json `scripts.test` conserve `--test-timeout=120000 --test-force-exit`.
  etude-suite n'ajoutait PAS `timeout-minutes` (0) ⇒ pas de double-ajout.

---

## Corrections
- **C-1 (force de test, `error_origin` = worker, item (f))** — La clé de `dedupLogs` n'est verrouillée par aucun
  oracle. Mutant G2-1 (clé = `blockNumber` seul) **survit** à `ukemi_record_getlogsrange_dedups_chunk_boundary`
  (un log par bloc, `logIndex:"0x0"`), au baseline de `ukemi_default_call_classifies_rpc_errors` ET à
  `sentinel2_book_identical_to_pull` (la fixture = 4 logs, tous en blocs DISTINCTS). Le code livré est CORRECT
  (`block|logIndex|txHash`), mais une régression vers une clé plus grossière passerait le CI en VERT tout en
  supprimant silencieusement des logs distincts d'un même bloc (l'énumération réelle WETH/aWETH a régulièrement
  ≥ 2 Transfer/bloc) — perte de données non détectée. **Fix bon marché** : ajouter au test (f) un cas « même
  bloc, deux `logIndex` » (assert : les deux survivent). Durcissement de test, pas un défaut de code.

## Observations (non bloquantes)
- **O-1 (`error_origin` = worker, item (c)) — bornée** : le câblage du plafond aux call-sites de retry n'est pas
  testé comportementalement. Mutant G2-2 (cap ignoré au call-site) **survit** car tous les tests passent
  `backoffMs:0` (⇒ `backoffDelay`=0 quel que soit le cap). La fonction pure `backoffDelay` est pleinement testée
  (plafonnée) et la CLI est parse-testée ; seul le câblage 2-lignes est par inspection. **Fix bon marché SANS faux-horloge** : test discriminant par
  le TEMPS — `makeDefaultCall({retries:3, backoffMs:100, backoffCapMs:1})` sur stub 503,503,503,200 ; plafonné =
  1+1+1 ms vs non-plafonné = 100+200+400 = 700 ms ; assert wall < 100 ms (marge robuste, sans flakiness). Risque résiduel faible. **Exigence littérale V-1(c) satisfaite** ;
  observation à accepter ou à durcir au choix de l'orchestrateur.
- **O-2 (`error_origin` = orchestrateur, séquençage)** : u-1a-hard (e8bcfe4) n'est pas dans etude-suite ; une PR
  u-1a-hard-2 → etude-suite calculerait R-25 = 547 (< 1205, passe). Séquencer u-1a-hard avant/avec u-1a-hard-2.
  Pas un défaut.
- **O-3 (note)** : la ci.yml PROPRE de la branche est pré-D9-septies (pas d'exclusion `docs/**/*.md`). Résolu à la
  fusion (etude-suite apporte D9 septies, union propre) ; pour un événement `pull_request` c'est le workflow fusionné
  qui s'exécute. Non bloquant.
- **O-4 (sizing)** : durée verte de `ukemi_default_call_classifies_rpc_errors` = 1040 ms (non reportée par le worker,
  mesurée ici) ; cap 10 s ⇒ marge ~10× locale, confortable même sur runner chargé.

## Contrôles résiduels (R-21) — tous PROPRES, aucun ne renverse le verdict
- **Suite VERTE sans `--test-force-exit`** : paire pristine `node --test --test-timeout=120000 …` ⇒ **exit 0, 31/31,
  903 ms** (pas 137) ⇒ `--test-force-exit` ne masque AUCUNE fuite de handle dans le vert ; il est purement additif.
- **Suppressions (29) — aucune assertion perdue** : les 3 lignes `assert.*` supprimées sont des REMPLACEMENTS
  renforçants (le `retry_is_bounded` refondu garde `/HTTP 503/` et ajoute `count===3` ; les 2 `deepEqual` de parse
  gagnent `backoffCapMs`). Le reste des suppressions = ancien code/commentaires/stub 503-sans-fin. 336→341 (+5), aucun test retiré.
- **Diff `ukemi.test.ts`** : exactement 3 lignes de commentaire + `{ timeout: 10_000 }` sur la signature ; le
  littéral PIN `034fbff9…` (ligne 29) hors diff, intact.

## Provenance / preuve d'innocuité
- `git status --porcelain` : `F:/Monark` (187ed86) CLEAN, `F:/Monark-wt-u1ahard2` (e66324b) CLEAN,
  `F:/Monark-wt-u1ahard` (e8bcfe4) CLEAN. Aucune écriture hors `F:/tmp/g2-u1ahard2` (492 Mo) ; rien sur C:.
- Le driver mutant a tourné dans ma copie `F:/tmp/g2-u1ahard2/tree`, jamais dans le worktree.
- Modèle `claude-opus-4-8[1m]`, effort max, 2026-09-19.
