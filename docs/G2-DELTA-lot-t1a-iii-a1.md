# G2-DELTA (relecture adversariale, 2ᵉ instance) — lot Bell T-1a-iii-a1

- **Relecteur** : RELECTEUR G2-DELTA, instance séparée à contexte frais (je n'ai écrit ni le code, ni le G2, ni le PLI).
- **Modèle résolu (R-1)** : `claude-opus-4-8[1m]` — préfixe `claude-opus-4-8` conforme, non banni, effort max.
- **Date** : 2026-09-21 (UTC). Worktree `F:\Monark-wt-univers`, branche `lot/t-1a-iii-a1`, HEAD `97c4e46` (inchangé à la clôture).
- **Commits** : `cf07ee2` (pré-enregistrement SEUL, 68 l.), `c1418bf` (code G1, 7 ADD), `97c4e46` (pli G2, 6 fichiers, +379/−16). Delta relu : `git diff c1418bf..97c4e46`.
- **Discipline tenue** : rien committé (R-20) ; rien écrit dans le worktree (mutants restaurés byte-exact par sha256, JAMAIS `git checkout`/`stash` ; tree propre + sha == pristine à la clôture) ; scratch `F:\tmp\g2d-univers\`. **UNE déviation réseau consignée** (§ Déviation) — auto-infligée, sans secret. Sinon : loopback 127.0.0.1 seul, `env -u CHAINSTACK_SOLANA_URL/HELIUS_API_KEY/BELL_SOLANA_RPC`.

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le **code livré est correct et robuste** : les cinq plis C-G2-1..5 sont pliés comme prescrit (fichier:ligne exacts, tests rougissants), les six mutants demandés rougissent la bonne cible (témoin vert, restauration byte-exacte vérifiée), **aucun mutant voisin ne survit**, **aucune fuite de secret**, R-25 = **1195 ≤ 1205**, suite **500/500**, pré-enregistrement **byte-identique** avec un Amendement 1 daté en pur ajout. **Le module n'exige AUCUNE modification.**

Trois **corrections de provenance/PLI/test** — **aucune ne touche le module livré** : **C-G2D-1** (l'item de flake déclaré au PLI est sous-dimensionné, et le flag `--test-force-exit` est verrouillé : élargir l'item, ne pas le retirer — mesuré), **C-G2D-2** (la dérogation C-G2-7 « budget gratuit » est conditionnelle au plafonnement dur Chainstack, non lu ; à trancher avant la course via B-IV-2), et **C-G2D-3** (test 22 sortirait sur le réseau en CI si la garde https régressait — durcissement du test, non bloquant ce tour). Le **delta `c1418bf..97c4e46` est relu ligne à ligne** (15 suppressions, toutes des plis, aucun affaiblissement) et les **3 sha de provenance du journal PLI matchent**. Détails ci-dessous.

---

## 1. Plis C-G2-1..5 — vérifiés (table → fichier:ligne → test)

| Pli | Fichier:ligne (HEAD, vérifié) | Garde | Mutant rejoué → test ROUGE | État |
|---|---|---|---|---|
| C-G2-1 | `universe.ts:327` | tri par unité de code (`x<y?-1:x>y?1:0`) + fixture régénérée | **N-1** `localeCompare` → test 13 **ET** test 16 ROUGE | vérifié |
| C-G2-2 | `universe-cli.ts:117` (writeOut), `:186` (operators const de `provenanceMd`), `:252` (.catch stderr) | ceinture `scrubSecret` à chaque écriture + stderr + assertion réelle | **N-2a** interpole `providers[1]` → test 17 ROUGE ; test 12 reste VERT (ceinture) | vérifié |
| C-G2-3 | `universe-cli.ts:207,211,221,223` ; classe `universe.ts:101` | `redirect:"manual"` + arrêt dur 3xx (GET **et** POST) | **C-G2-3a-GET** et **C-G2-3a-POST** (`manual`→`follow`) → test 18 ROUGE (chacun) | vérifié |
| C-G2-4 | `universe.ts:45-59` | https + analysable + hôte + no-userinfo | **C-G2-4a** (check https retiré) → test 19 ROUGE | vérifié |
| C-G2-5 | `universe-cli.ts:48,54-74` | flag inconnu fail-closed + plancher 286 ms | **N-4** (pacing retiré ×2) → test 20 ROUGE | vérifié |

- **Tri « unité de code » == `canonical()` et locale-indépendant** : vérifié empiriquement (`locale-probe.mjs`) sous `LANG=C`, `en_US.UTF-8`, `de_DE.UTF-8`, `tr_TR.UTF-8` — l'ordre de l'artefact est **identique dans les 4 locales**, égal au tri par défaut `Array#sort` **et** au comparateur explicite, et **diverge** de `localeCompare`. `canonical()` (`digest.ts:29`) trie les clés par `Object.keys().sort()` (défaut = unité de code UTF-16) : même discipline. Note : les deux comparent par **unité de code** (pas point de code) — identique pour du base58 ASCII ; divergence théorique seulement sur surrogates non-BMP (hors sujet).
- **Fixture régénérée = ORDRE seul** : `fixture-old` vs `fixture-new` — mêmes 7 records (égalité ordre-indépendante), mêmes `counts`, même `schema` ; seul l'ordre du tableau change (`Xsb,Xsc,XsDo,Xso` → `XsDo,Xsb,Xsc,Xso` = tri par point de code). Aucun changement de valeur.
- **Delta `c1418bf..97c4e46` relu ligne à ligne (15 suppressions src+test, TOUTES mappées à un pli — aucun affaiblissement clandestin)** : le diff **corrobore** que les 4 défauts G2 pré-fold étaient réels et sont **renforcés** — `…sort(str(a.mint).localeCompare(...))` supprimé → comparateur unité de code (**C-G2-1**) ; les deux `fetch(…, signal)` **sans** `redirect` → `redirect:"manual"` + arrêt 3xx (**C-G2-3** GET+POST) ; `const h = hostOf(url)` seul → bloc parse+https+userinfo+host (**C-G2-4**) ; l'assertion **vacue** `assert.equal(prov.includes("deadbeef"), false)` + son commentaire supprimés → scan réel placeholder/hôte (**C-G2-2**). Aussi : `deps.writeFile(...)` → `writeOut(...)` (ceinture scrub, C-G2-2) ; `num("--min-interval", 286)` → `MIN_INTERVAL_FLOOR_MS` + plancher (C-G2-5). Aucune suppression n'affaiblit une garde.

## 2. Pré-enregistrement — intègre

- `cf07ee2:PLI` = **68 lignes**. Les **§1-10** (têtes 68 lignes du fichier courant) sont **byte-identiques** à `cf07ee2` (`diff` vide). Le PLI de `c1418bf` est identique à celui de `cf07ee2` (le commit de code n'a pas touché le pré-enregistrement « SEUL »).
- Le fold sur le PLI est un **pur ajout** (`@@ -66,3 +66,57 @@`, **0 suppression** de contenu). **Amendement 1 daté** `2026-09-21 03:14 UTC` à la ligne 70 ; §1 (H1-H4) et §4 (critères d'arrêt) non réécrits.
- **Commande §6 valide** sous les flags fail-closed + plancher (`parse-probe.mjs`, hors réseau) : PARSE OK, `minInterval=286 ≥ floor 286` ; contrôles négatifs — flag inconnu → throw, `--min-interval 285`/`0` → throw. Tous les flags §6 ∈ `KNOWN_FLAGS`.
- **Sha de provenance du journal PLI re-calculés — 3/3 MATCHENT** : G2 report blob `c67986e6…` (étape 1) ✓ ; fixture blob `39cf6d3d…` (étape 3) ✓ ; `universeSha256(body)` = `bb16286b…` (étape 3, fixture moins le NL final) ✓. Aucune revendication de sha fausse.

## 3. Campagne de mutants — 6 demandés + chasse aux voisins

Ancres pristine (re-vérifiées après CHAQUE mutant, restauration `cp` depuis sauvegarde, jamais `git checkout`) :
`universe.ts` = `d6026584257f747c06d9ee238cd0f1d1aeb75a4e8a7b57343bf530c530bd5e01` ;
`universe-cli.ts` = `560cd5d010939329fba40dff137167d603882c6001b47f5553d74270d9708ac6`.

| Mutant | Injection (ligne pristine) | Test attendu | Résultat | Témoin `method_allowlist` |
|---|---|---|---|---|
| **N-1** | sort → `localeCompare` (u.ts:327) | 13, 16 | **ROUGE** (13+16) | VERT |
| **N-2a** | `provenanceMd` interpole `providers[1]` (cli:186) | 17 | **ROUGE** (17) ; 12 VERT (ceinture) | VERT |
| **C-G2-3a-GET** | GET `manual`→`follow` (cli:207) | 18 | **ROUGE** | VERT |
| **C-G2-3a-POST** | POST `manual`→`follow` (cli:221) | 18 | **ROUGE** | VERT |
| **C-G2-4a** | check `https` désactivé (u.ts:53) | 19 | **ROUGE** (19 + 22) | VERT |
| **N-4** | `await deps.sleep(a.minInterval)` ×2 retiré (cli:121,125) | 20 | **ROUGE** | VERT |

Restauration finale : **sha256 des deux fichiers == pristine** (byte-exact). Bilan : **6/6 mutants ROUGE sur la cible**, aucun faux-RED (témoin vert = fichier chargé).

**Chasse aux mutants voisins survivants** (`neighbor-probe.mjs`) — TOUS fail-closed, **aucun survivant** :
- `assertHostAllowed` refuse (THROW) : userinfo encodé (`user%40x:pw@`), userinfo nu, point final (issuer **et** chainstack), IPv6 (`[::1]`, `[dead::beef]`), `mainnet-beta` casse mixte, look-alike `chainstack.com.evil.tld`, `evil-chainstack.com`, `http:` issuer, `data:`, chaîne vide. Admet (PASS, correct) : issuer et chainstack en **MAJUSCULES** (`providerOf` minusculise → casse gérée, pas de faux-stop).
- **3xx à `Location` relatif** (loopback) : `RedirectBlockedError` (bloqué par le **statut**, indépendant de la forme du `Location`).
- **flag en double** : `argOf` = premier gagnant — `--min-interval 286` puis `0` garde 286 (pacing **non** désactivé) ; `0` puis `286` → throw plancher. **Aucune** combinaison ne désactive le pacing. Ambiguïté bénigne, pas un contournement.
- `http://` via env (`CHAINSTACK_SOLANA_URL`) : STOP au préflight (test 22, pristine, VERT hors ligne).

## 4. Fuite de secret — 0 fuite

`secret-leak.mjs` : chemin d'écriture COMPLET hors ligne (deps injectées), `CHAINSTACK_SOLANA_URL` = fausse URL à clé hex `…/deadbeefcafe0123…`. Surfaces scannées = **ledger, brut, artefact, provenance, 2 lignes stdout, RunResult** → **LEAKS: 0** (ni la clé hex, ni l'hôte `core.chainstack.com`, ni l'URL complète). Le mot-opérateur « chainstack » figure dans la provenance **par conception** (redaction = hôte/URL, pas le mot). Le stderr est couvert par test 22 (pristine, VERT) : le `.catch` top-level scrub, et **aucun message pré-réseau n'interpole l'URL** (C-10) — c'est une propriété positive, pas une lacune.

## 5. Suite complète + `npm run ci` + flake

- **`env -u … npm run test`** : **500 pass / 0 fail / 0 skip, exit 0** (~33 s).
- **`npm run ci`** (`gate:vocab && typecheck && test`) : **exit 1 — 499 pass / 1 fail** ; le test en échec est **`test/byo-demo-probe.test.ts`** (harness BYO, **HORS lot** bell/universe), échec **file-level** « test failed » sans assertion nommée, à sa durée normale ~1085 ms, **0 marqueur UV**.
- Gates annexes : `lint` exit 0 ; `lint:ratchet` **69/69** ; `export:check` OK ; `lang:gate` OK.

**Flake — matrice discriminante (re-exécutée) :**
| Cible | Sous `--test-force-exit` | Résultat |
|---|---|---|
| `apps/bell/test/universe.test.ts` SEUL | ×15 | **0 anomalie**, 23/23 |
| `apps/harness/test/server.test.ts` SEUL | ×15 | **0 anomalie** |
| `test/byo-demo-probe.test.ts` SEUL | ×15 | **0 anomalie**, 1/1 |
| Suite complète | **×30** | **1 échec** (byo-demo, run `npm run ci`) ; **0 assertion UV** sur les 30 |
| Suite complète **SANS** `--test-force-exit` | ×6 | **0 anomalie**, 500/500 |

**Attribution.** L'assertion Windows `UV_HANDLE_CLOSING` (déclarée PLI étape 4bis) **ne s'est PAS reproduite** (0 sur **75** runs force-exit : 30 suite + 15+15+15 isolés). Un flake **différent** a surgi : `byo-demo-probe.test.ts` échoue file-level dans la suite complète (**1 sur 30**), **jamais isolé** (0/15). Preuves que ce n'est **PAS attribuable aux tests 18/22 du lot** → **item, pas correction du lot** (au sens de la mission) :
1. `universe.test.ts` seul = 0/15 ; ses serveurs (test 18) sont drainés (`closeAllConnections` + `close` en `finally`) et test 22 est `spawnSync` (synchrone, drainé). Probe déterministe `getActiveResourcesInfo` : **aucune** ressource socket rémanente après le throw 3xx (GET/POST), et `res.body?.cancel()` **ne change rien** de mesurable → l'hypothèse « corps undici non drainé visible » n'est **pas** confirmée.
2. Le flake disparaît **entièrement** sans `--test-force-exit` (6/6 + repro déclarée 500/500). Le déclencheur est **le flag**, sur des tests **à serveur** (harness), sous parallélisme — **CI Linux immune** (`src\win\async.c` n'existe pas ; et sans le flag, exit 0).

## 6. R-25 — 1195

`git diff --shortstat "bfcc7cd...HEAD"` avec la pathspec `STAT=` exacte de `.github/workflows/ci.yml:65` : **`6 files changed, 1195 insertions(+)`** → **CHANGED (ins+del) = 1195 ≤ 1205**. Décompte par fichier (numstat) : universe-cli 255 + universe 358 + expected-universe-candidates 1 + issuer-assets 30 + rpc-getaccountinfo 64 + universe.test 487 = **1195**. Docs `.md` exclus ; fixtures `universe/**` **comptées** (hors `series/`). Conforme au journal PLI étape 6.

## 7. C-G2-6 / C-G2-7 — report AVANT la course

- **C-G2-6** (prix en valeur libre `name`/`symbol`, `universe.ts:311`) : **report ACCEPTABLE pour la course.** La course écrit `name`/`symbol` **uniquement** dans l'artefact + le brut **HORS dépôt** (`F:/PRODUITS/…`), **jamais committés, jamais publiés** (PLI §7 ; tout `upcoming`). Vérifié : `assertNoClose`/`CLOSE_KEY` portent sur les **clés** (isNumericLike faux sur chaîne mixte) ⇒ un prix dans `name` passe, mais rien n'est servi ce tour. **Bloquant seulement avant la première PUBLICATION.** Item `-iii-a1-bis` correctement formé (déclencheur + propriétaire).
- **C-G2-7** (ledger éditable à la baisse, `universe.ts:147`) : **report CONDITIONNEL.** La dérogation PLI repose sur « budget en appels gratuits/abonnement ». Or les **RU Chainstack sont consommés** (PLI §9) : le report n'est sûr que si le plan Chainstack Growth est **plafonné dur** (pas de facturation d'overage à la RU). La portée ToS Chainstack est **non lue** (déjà l'item **B-IV-2**). ⇒ voir **C-G2D-2**.

---

## Corrections C-G2D-n (provenance/PLI — le module ne change pas)

### C-G2D-1 — L'item de flake déclaré (PLI étape 4bis) est sous-dimensionné — **à corriger avant clôture**
- **Constat mesuré** : le PLI étape 4bis restreint le flake `--test-force-exit` à `apps/harness/test/server.test.ts` + l'assertion **Windows** `UV_HANDLE_CLOSING`. Or **`test/byo-demo-probe.test.ts` échoue AUSSI** (1 sur 30, sous `npm run ci`), **SANS** l'assertion UV (donc pas nécessairement Windows-only), et **jamais isolé** (0/15). La surface réelle = **tout test à serveur** sous `--test-force-exit` en charge parallèle. La suite est **500/500 sans le flag** (6/6 mesuré) ⇒ le flag est le déclencheur.
- **Pré-existence (mesurée, sans checkout)** : `byo-demo-probe.test.ts`, `server.test.ts` ET le flag `--test-force-exit` existent déjà à `bfcc7cd` (`git ls-tree bfcc7cd`, `git show bfcc7cd:package.json`). Le lot n'introduit ni le flake ni le flag ; il n'ajoute que de la charge (tests 18/22).
- **Le flag est VERROUILLÉ et porteur — ne PAS le retirer** : `test/ci-gates.test.ts:1269` (checkpoint-2 V-1(b)/V-3) **exige** `--test-force-exit` dans `scripts.test` (backstop anti-hang, mesuré porteur — `docs/G2-lot-u1a-hard-2.md:44,151-152`). Le retirer **rougirait le gate** et supprimerait un garde-fou. **Correction** : élargir l'item de stabilisation à **tous** les tests à serveur (drain explicite des handles en `finally`, calque test 18) — PAS seulement `server.test.ts` ; un changement de politique du flag passerait par un **amendement ADR** de V-1(b)/V-3.
- **Non bloquant pour la CI (nuance mesurée)** : la variante `UV_HANDLE_CLOSING` est **prouvée** CI-immune (assertion `src\win\async.c` **Windows-only**) → run LOCAL Windows seulement. La variante **byo-demo** n'a **aucun** marqueur Windows (stderr vide, pas d'assertion UV) : sa CI-immunité est **inférée** (« non observée sur ubuntu-latest »), **non prouvée** — le déclencheur (`--test-force-exit`) tourne AUSSI sur Linux CI. Reste non bloquant (pré-existant, hors lot, 1/30, jamais isolé), mais l'orchestrateur doit savoir que la byo-demo pourrait théoriquement flaker en CI.
- **error_origin** : **worker** (la revendication PLI sous-dimensionne le périmètre — un fichier + l'assertion Windows). Cause-racine = infra **pré-existante** ; correctif hors module, propriétaire **orchestrateur**.

### C-G2D-2 — La dérogation C-G2-7 « budget gratuit » est non établie (Chainstack non lu) — **à trancher avant la course**
- **Constat** : le PLI (item formé 2 + §9) déclare le déclencheur de C-G2-7 « souple ce tour » car budget « gratuit/abonnement », **sans avoir lu** la ToS Chainstack (item B-IV-2 ouvert, PLI §9). Or les RU Chainstack sont **consommés** : si le plan **facture l'overage à la RU**, un ledger édité à la baisse fait re-dépenser au-delà du plafond ⇒ **coût réel** ⇒ C-G2-7 **redevient bloquant** (« budget PAYANT à l'appel », son propre déclencheur dur).
- **Correction** : confirmer via **B-IV-2** que Chainstack Growth est **plafonné dur** (pas d'overage facturé) **AVANT** la course ; sinon plier C-G2-7 (chaînage monotone) avant la course. Ne pas accepter la dérogation **sans** cette confirmation.
- **error_origin** : **worker** (sur-affirmation d'une certitude de facturation sans source ; à router vers B-IV-2, pas un nouvel item).

### C-G2D-3 — Test 22 sortirait sur le réseau si la garde https régressait — **item non bloquant à former**
- **Constat (empirique)** : test 22 `spawnSync` le **vrai CLI** avec le **réseau réel accessible** ; il ne tient qu'à **la seule** garde https du préflight pour ne pas émettre. Mesuré : sous le mutant C-G2-4a (garde retirée), le sous-processus a franchi le préflight et **est entré dans le chemin réseau** (cf. § Déviation). En CI **ubuntu-latest** (réseau actif), une régression de cette garde produirait un **GET live vers l'émetteur depuis un runner GitHub**, hors pré-enregistrement — « à une garde de l'egress », pas un simple détail.
- **Forme** : stub `fetch` dans le sous-processus (shim en `--import`/`execArgv` du `spawnSync`), ou piquet réseau assertant « 0 hit cible » — la STOP serait prouvée **sans** dépendre du réseau réel. **Déclencheur** : avant que test 22 tourne en CI réseau-actif. **Propriétaire** : orchestrateur. **error_origin** : worker (conception du test).
- Sous code **pristine**, test 22 s'arrête au préflight (VERT hors ligne, vérifié) ⇒ **non bloquant** ce tour.

## Déviation consignée (ma méthode — transparence R-21 / « non contourné »)
En rejouant **C-G2-4a contre le fichier de test COMPLET**, test 22 (qui `spawn` le vrai CLI) a — la garde https désactivée par le mutant — **franchi le préflight** et **est entré dans le chemin réseau** (tentative GET `api.xstocks.fi` / RPC `api.mainnet.solana.com`). Durée 1844 ms, exit≠0, **stderr VIDE** — cohérent avec un blocage/kill sandbox de la tentative sortante (aucun egress complété évidencé ; un egress vers ces endpoints **publics keyless** ne peut être totalement exclu du seul log). **Aucun secret** : test 22 surcharge `CHAINSTACK_SOLANA_URL` par le placeholder http ; la vraie URL Chainstack n'a jamais été utilisée. **La preuve de C-G2-4a tient sur test 19 SEUL** (rougi). Correctif de méthode appliqué : un mutant désactivant une garde réseau se rejoue contre le test **unitaire** (19), jamais contre le test à sous-processus (22) ; **non répété**.

## Clôture — intégrité
- `git status --porcelain` **vide** ; sha256 des 3 fichiers (`universe.ts`/`universe-cli.ts`/`universe.test.ts`) **== pristine** ; HEAD `97c4e46` inchangé. Aucune écriture dans le dépôt, aucun commit (R-20), aucun appel réseau hors la déviation consignée (loopback sinon).
- **Zéro dette** : C-G2D-1/2/3 formés (déclencheur + propriétaire + error_origin) ; C-G2-6/7 confirmés reportables (C-G2-7 sous condition Chainstack) ; flake statué (item hors lot, pré-existant, non attribuable aux tests 18/22) ; delta relu + 3 sha de provenance vérifiés ; déviation réseau consignée.

---
## Amendement daté 2026-09-21T16:20Z (orchestrateur `claude-fable-5-1`, G7 du lot -iii-a1-bis) — critère D4 / C-G2D-1 RE-DIAGNOSTIQUÉ (l.71-82 laissées byte-stables, lecteur renvoyé ici)
Le diagnostic « handles non drainés des tests à serveur » de cette G2-delta est **infirmé** (`error_origin` : plan). Signature réelle du flake local : `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), src/win/async.c:76` — un `uv_async_t`, pas un socket. Source [lu] de première main (lecture sur place, FAITS `F:/PRODUITS/etude-2026-09-21/bell-a1bis/FAITS-flake-libuv-windows-2026-09-21.md`) : `nodejs/node#56645` (Closed ; Windows seulement ; repro `fetch()` puis `process.exit()`), correctif `nodejs/node#61999` (Merged ; backports 22.x / 24.x **NON LUS**). Node local v24.15.0 ; CI `ubuntu-latest` non exposée. Mesures du lot : 4 échecs sur la matrice ×100, dont **2 signés** (run-008, run-057) et **2 inférés** (run-044, run-097) ; la G2 du lot -bis l'a reproduit (1/30 sur `server.test.ts` drainé) ; le validateur a LU la signature dans les journaux, il ne l'a pas reproduite.
**Critère D4 amendé (ruling (a), quatre conditions du validateur)** : (1) attribution telle que ci-dessus, jamais « 4 signés » ; (2) **relance LOCALE Windows seulement**, licite uniquement si le journal porte la signature exacte ; tout rouge non signé reste un rouge ; **AUCUN retry en CI** (un rouge sur ubuntu ne peut pas porter cette signature et reste rouge — R-22) ; (3) item formé sourcé : **déclencheur = bump du Node local vers une version portant #61999, OU lecture [lu] du backport 24.x, OU premier rouge de cette forme sur ubuntu** ; propriétaire orchestrateur ; (4) **C-G2D-1 re-formé** : le drain `closeAllConnections` livré par -a1-bis est conservé (hygiène, inoffensif) mais n'est PAS le remède du flake ; le critère « matrice ×100 à 0 échec » du G0 D4 est remplacé par « 0 échec NON signé ».
