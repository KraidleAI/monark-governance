# Revue G2 FRAÎCHE — lot U-1a-hard (durcissement `record.ts` + tueurs M4/M5/M5b/M6 + oracle `defaultCall` + retry/split + vérif live V-4), gel `e8bcfe4`

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (Opus 4.8, 1M contexte), effort `max`. Préfixe `claude-opus-4-8` conforme (roster 2026-08-14 ; Opus 5 banni). Contrôle de résolution rendu au premier tour.

Relecteur : **instance séparée, contexte frais — je n'ai PAS écrit ce lot** (AgileGates : relecteur ≠ générateur, CA-9). Rendu 2026-09-19. Lecture par SHA (`git show e8bcfe4:<chemin>`, `git diff a3f85f4 e8bcfe4`) ; vérification sur copie `git archive e8bcfe4` → `F:\tmp\g2-u1ahard\` + `npm ci` (**282 paquets, 0 vuln**, jamais de jonction `node_modules`) ; mutants rejoués sur copie séparée `F:\tmp\g2-mut-sentinel\` (arbre restauré + sha vérifié). `TEMP/TMP/TMPDIR=F:/tmp` (slashes avant, piège O7 évité) ; **rien sur C:**. Aucune écriture dans un dépôt **sauf ce seul fichier** (`F:\Monark\docs\G2-lot-u1a-hard.md`, branche `lot/etude-suite`) ; aucun `git add`/commit/workflow (**R-20** — l'orchestrateur relit R-21 et committe). Env : Windows 10, Node **v24.15.0**, npm 11.12.1. Base `a3f85f4` (= merge-base `lot/etude-suite`↔`e8bcfe4`, vérifié) ; delta = **5 fichiers, 465 ins/37 del** ; `rpc2.ts` **absent du diff** (inchangé).

## VERDICT : **APPROUVÉ** (avec observations O-1..O-3, non bloquantes, items formés avec déclencheur)

Le code est **fonctionnellement correct sur les 10 points**, mesuré et re-exécuté par mes soins. Tous les gates verts (336/336, tsc 0, lint 0, ratchet 69/69, gate:vocab 157, lang-gate 0, export:check 0) ; **les 6 mutants rejoués rougissent** (M4/M5/M5b/M6 sur `rpc2.ts` ; R1/R2 retry sur `record.ts`), restauration bit-exacte ; **PIN `034fbff9…` intact** (recompute par mon canonicaliseur indépendant) ; bug du garde `main()` reproduit + fix confirmé (Windows ET POSIX) ; journal secret-free ; artefacts live D9 sha/compteurs = G1, hors dépôt, sans clé ; `ukemi_sha 5b666ace…` recomputé ; R-25 = **372 < 1 205** ; fusions propres. **Aucune correction bloquante (C).** Les seuls constats sont des lacunes de couverture/robustesse (O-1 : garde `main()` sans test de non-régression — **inguardable dans une CI Linux-only**, mesuré ; O-2/O-3 mineurs) — classés **O** au précédent exact de cette lignée (la G2 delta a classé « test manquant pour un comportement correct » en O). Aucune escalade-investisseur (aucune décision de valeur, aucun verdict faux).

---

## Checklist (mesuré / preuve / verdict)

### 1 — Oracle d'exécution + gates + R-25 — RÉ-EXÉCUTÉ (copie `git archive e8bcfe4`)

| Gate | Sortie MESURÉE | Attendu | ✓ |
|---|---|---|---|
| `npm ci` | **282 paquets**, 0 vuln, exit 0 | — | ✓ |
| `npm run ci` (gate:vocab→tsc→test) | gate:vocab **OK 157 fichiers** · tsc **0 erreur** · **tests 336 / pass 336 / fail 0** | 336/336 | ✓ |
| `npm run lint` (`eslint .`) | exit 0, 0 sortie | 0 | ✓ |
| `npm run lint:ratchet` | **69/69** (plafond inchangé) | 69/69 | ✓ |
| `node scripts/lang-gate.mjs --scope root` | **OK, 0 hit français non-exempt** | 0 | ✓ |
| `npm run export:check` | **OK — 0 forbidden path, 0 français non-exempt** (scopes root/…/ukemi/…/skills) | OK | ✓ |
| `npm run gate:vocab` (scope sentinel) | **OK — 157 fichiers, 0 claim** (aucun motif banni dans le nouveau code/commentaires) | OK | ✓ |
| **R-25** pathspec **exact `ci.yml:52`** sur `a3f85f4...e8bcfe4` | 4 fichiers, **335 ins + 37 del = 372** | 372 | ✓ |
| **R-25** three-dot sur `lot/etude-suite` (`lot/etude-suite...e8bcfe4`) | **372** (merge-base = `a3f85f4`) | = | ✓ |

R-25 name-only = `book.ts, record.ts, ukemi-record.test.ts, ukemi.test.ts` ; **`docs/G1-lot-u1a-hard.md` correctement EXCLU** par `:(exclude)docs/G1-lot-*.md`. Marge 1 205 − 372 = **833**. (Le split G1 §8 « 271 tracked + 101 untracked » = 372 : au gel, `ukemi-record.test.ts` est committé ⇒ 335 ins = 234 + 101.)

### 2 — Bug du garde `main()` (no-op Windows) — REPRODUIT + fix confirmé + POSIX sans régression

Sonde `F:\tmp\g2-work\guard2.mjs` (rejeu des deux formes de garde avec le vrai `argv[1]`/`import.meta.url` de cette machine Windows) :
- **Ancien garde** `import.meta.url === \`file://${argv1.replace(/\\/g,"/")}\`` ⇒ `oldGuard = false` : `import.meta.url = file:///F:/… ` (**TROIS** slashes) ≠ `file://F:/…` (**DEUX** slashes). ⇒ `main()` ne s'exécutait jamais ⇒ **CLI = no-op silencieux sous Windows** (c'est pourquoi G1 §5b a eu besoin d'un wrapper hors dépôt). **Reproduit.**
- **Nouveau garde** `pathToFileURL(argv1).href === import.meta.url` ⇒ `newGuard = true` (`pathToFileURL` émet la forme `file:///` canonique). **Corrigé.**
- **POSIX (simulation par faits de chaînes)** : `file://` + `/home/…/record.ts` = `file:///home/…/record.ts` = `import.meta.url` POSIX ⇒ `oldGuard = true` **et** `newGuard = true` ⇒ **pas de régression POSIX** (l'ancien marchait sous POSIX, le nouveau marche sur les deux).
- **Test nommé qui le garde ? AUCUN** (grep `pathToFileURL|isMain|argv|guard` sur `ukemi.test.ts`/`ukemi-record.test.ts` = néant). Le fix n'est prouvé que par les runs live §6 (hors dépôt, hors CI) + ma sonde. ⇒ **O-1**.

### 3 — Tueurs V-4 (M4/M5/M5b/M6 sur `rpc2.ts`) — REJOUÉS moi-même (driver `F:\tmp\g2-work\mutant-driver.mjs`, restauration sha vérifiée)

Baseline pristine (sha `019786c8…` = PIN) : **tous verts**. Chaque mutant rougit exactement le(s) tueur(s) nommé(s) (compte `fail` faisant foi ; test isolé par `--test-name-pattern`) :

| # | Mutation `rpc2.ts` | Tueur nommé | MESURÉ (isolé) | Restauration |
|---|---|---|---|---|
| **M4** | un revert **benche** (`cooldownUntil.set` ajouté dans la branche revert) | `ukemi_revert_does_not_bench_provider` | `tests=1 fail=1` **ROUGE** | `019786c8…` ✓ |
| **M5** | `revertKey` **ignore `data`** (clé = message) | `ukemi_revert_key_uses_data` (**cas 1**) | `tests=1 fail=1` **ROUGE** | `019786c8…` ✓ |
| **M5b** | garde `&& e.data !== "0x"` **retiré** | `ukemi_revert_key_uses_data` (**cas 3**, GHO mixte réel) | `tests=1 fail=1` **ROUGE** | `019786c8…` ✓ |
| **M6** | clause message `/execution reverted\|revert/i` **retirée** | `ukemi_is_rpc_revert_rejects_archive_miss` **+** `ukemi_default_call_classifies_rpc_errors` | `tests=2 fail=2` **ROUGE** | `019786c8…` ✓ |

`rpc2.ts` sha final = `019786c8836cb3f382682d9067fea23a390ff7f000cce89cb6e3c2b53e7b74b2` == PIN (bit-exact). **Attribution confirmée par raisonnement** : M5b n'est tué **que** par le cas 3 (cas 1/2 restent verts : même-`data` reste concordant, `data`-différent reste discordant) ⇒ le garde `"0x"` est **réellement load-bearing** ; M5 est tué dès le cas 1. (G1 §9 rapporte 19/20 / 18/20 = harnais fichier-entier ; mes chiffres sont l'exécution **isolée** — les deux valides.)

### 4 — Oracle `defaultCall` `ukemi_default_call_classifies_rpc_errors` — 7 cas, stub restauré

Le **vrai** `defaultCall` (export = instance brute `makeDefaultCall()`, retries=0), `globalThis.fetch` stubbé (typé), à travers `makeUkemiPool`→`recordBook`. **7 cas** : baseline ⇒ **PIN `034fbff9…`** (vérifié : test vert + mon harnais §7) ; (a) `{code:3}` unanime ⇒ book `["","",""]` ; (a′) `{code:-32000,data:"0x"}` ⇒ book `["","",""]` ; (b) valeur/revert ⇒ `QuorumDisagreementError` ; (c) revert + HTTP 429 ⇒ `NoQuorumError` ; (f) `-32000 header not found` ⇒ `NoQuorumError` (archive miss = transport) ; **(i) erreur sans `code`** ⇒ `code ?? 0` ⇒ `isRpcRevert` faux ⇒ transport ⇒ `NoQuorumError`. **Stub restauré sans fuite** : `const original = globalThis.fetch` capturé **avant** le premier `installStub`, restauré dans un **`finally`** englobant toutes les assertions (une assertion qui jette n'empêche pas la restauration). ✓ M6 rougit ce test (cas (f)), confirmant qu'il exerce bien la classification.

### 5 — `makeDefaultCall` retry — borné, `RpcError` jamais retenté, corps surfacé ; mutants rejoués

- **Borné** : `for (attempt=0;;attempt++)`, total = `retries+1`, backoff `backoffMs·2^attempt`, `throw` après épuisement. `RpcError` typé ⇒ `throw` immédiat (**jamais retenté**). 429/5xx/réseau/timeout ⇒ retentés. Corps non-2xx (tronqué 160 c.) **surfacé** dans le message ⇒ `getLogsVia` splitte un HTTP 400 « range too large ».
- **Tests déterministes présents** : `ukemi_record_retries_transient_http` (429→503→200 récupère), `ukemi_record_retry_is_bounded` (503 persistant ⇒ `count===3`), `ukemi_record_does_not_retry_rpc_error` (code 3, `retries:5` ⇒ `count===1`), `ukemi_record_get_logs_splits_on_http400_range`.
- **Mutants rejoués** (driver `F:\tmp\g2-work\retry-driver.mjs`, sha `record.ts` restauré `58151dc1…`) : **R1** « retry ON RpcError » ⇒ `ukemi_record_does_not_retry_rpc_error` `fail=1` **ROUGE** (count devient 6) ; **R2** « retry INFINITE » (borne HTTP retirée) ⇒ `ukemi_record_retry_is_bounded` **ne peut plus atteindre `count===3`** ⇒ **suite pend ⇒ tué par timeout 12 s** (= timeout CI = rouge). ⇒ **O-2** (rouge par pendaison, pas par assertion rapide).
- **`--retries` pathologique** : `setTimeout(delay>2³¹−1)` ⇒ `TimeoutOverflowWarning`, délai ramené à 1 ms (mesuré : `500·2^60` ms « déclenché après 4 ms ») ⇒ **boucle serrée mais toujours bornée** par `retries+1` (jamais infini). Backoff non plafonné = **O-3** (cosmétique).
- **Retry dans l'instance CLI seulement** : `export const defaultCall = makeDefaultCall()` (retries=0) sert la **classification** que le pool de test pilote ; `main()` construit une instance **durcie** via `makeDefaultCall({retries,…})`. **Documenté** (commentaire `record.ts` « Tests drive THIS instance directly; the live recorder builds a HARDENED instance » + G1 §2). Le retry **est** testé (sur `makeDefaultCall` directement). Correct, pas une lacune.

### 6 — Journal structuré par fournisseur = `providerOf` seulement — aucune URL/secret

- **Grep exhaustif** : dans `record.ts`, l'identifiant `url` n'apparaît qu'aux L47 (param), L48 (`providerOf(url)`), L54 (`fetch(url,…)`). **Tous** les messages d'erreur et le puits `onErr` utilisent `prov` (= domaine enregistrable), **jamais** `url`.
- L'ancien leak `throw new Error(\`HTTP ${status} ${url}\`)` de `record.ts:22` (base `a3f85f4`) est **SUPPRIMÉ** ; grep `\${url}` / `HTTP ${…} ${url}` sur `ukemi/` = **NONE**.
- **Aucune clé** dans `ukemi/` (grep `?k=`/`apikey`/`secret`/hex32 ⇒ seulement des adresses on-chain publiques + un vecteur keccak). `bell_no_secret_in_repo` **vert** (scan dépôt). Portée du delta = fichiers `ukemi/` uniquement ⇒ ne peut introduire un secret ailleurs.
- **Confirmé sur les artefacts live** (§8) : `endpoints` sans `?` (aucune query/clé), aucune URL avec query dans tout le fichier, `rpc_errors[].provider` = domaine.

### 7 — `book.ts` plancher `fromBlock` — PIN intact, forme canonique cohérente ADR-U1 D2

Harnais indépendant `F:\tmp\g2-mut-sentinel\test\pin-harness.ts` (canonicaliseur maison, PAS `canonicalStringify`) :

| Cas | `book_digest` | `enumeration.from_block` | Verdict |
|---|---|---|---|
| `fromBlock` **omis** | `034fbff9…` (== PIN, via `canonicalStringify` **ET** mon canonicaliseur) | `16496792` (=`reserveInitBlock`) | **PIN intact** ✓ |
| `fromBlock=23000000` (> floor) | `81dffe3e…` (**≠ PIN**, attendu : run borné) | `23000000` | forme changée par un **champ pré-existant** ✓ |
| `fromBlock=10000000` (< floor) | `034fbff9…` (== PIN) | `16496792` | **plancher tient** (`max(reserveInitBlock,fromBlock)`) ✓ |

Un `fromBlock > reserveInitBlock` change la forme canonique via `enumeration.from_block`/`from_block` (timeline) = `String(minFrom)` — **champ déjà présent au gel U-1a**, **aucune clé nouvelle** (12 top-keys `accounts…schema` inchangés). Cohérent ADR-U1 D2 (entier en chaîne décimale, dans le périmètre du digest) : un run borné est un digest **honnêtement différent**, pas une dérive.

### 8 — Live V-4 + runs D9 — formes plausibles, sha/compteurs = G1, hors dépôt, sans clé

Artefacts du worker présents hors dépôt (`F:\tmp\u1a-hard\`, `git rev-parse` = *not a git repository*). Inspection `F:\tmp\g2-work\live-inspect.mjs` (champs structurés seuls, aucune URL loggée) :

| | weth-live.json | susde-live.json |
|---|---|---|
| **file sha256** | `63f8213436a3229d…` = **G1 §6** ✓ | `7864b6ccc7797d8a…` = **G1 §6** ✓ |
| **book_digest** | `2c225b523e8ef670…` = G1 ✓ | `8ea0d5324e514f2c…` = G1 ✓ |
| **ukemi_sha** | `5b666ace…` (== recette) | `5b666ace…` ✓ |
| params `from_block` | 26009721 (= B−2000) | 26009752 (= B−2000) |
| counts | holders 118 / at_risk 56 / elig 0 / excl 38·24·0 = G1 ✓ | 5 / 4 / 0 / 0·1·0 = G1 ✓ |
| calls / rpc_errors | 847 / 58 = G1 ✓ | 147 / 63 = G1 ✓ |
| endpoints avec `?` | **false** | **false** |

- **Formes live** cohérentes avec le critère : `eth_call code=3 "execution reverted"` (mevblocker/blastapi, `data` **absente**) ⇒ concordant ⇒ description() `""` ; drpc `eth_getLogs HTTP 400` « ranges over 10000 … free plan » (splitté) **et** « Can't route your request » (benché) ⇒ drpc benché ⇒ quorum {mevblocker, tenderly} (fail-safe D3). 31+25+1+1=58 / 31+32=63 = `rpc_error_count`. **Aucune clé, aucune URL avec query.**
- **Ondulation §5/§6 (dite telle quelle)** : la sonde §5 (`gho-probe.mjs`, cible GHO précise) trouve mevblocker `data:"0x"` ; le run §6 (fenêtre bornée) enregistre les reverts `eth_call` de mevblocker avec `data` **absente**. Cibles/blocs différents ⇒ formes plausiblement différentes — **pas** une contradiction ; le critère (code 3, `data` `"0x"`-ou-absente) tient, et le garde M5b couvre les deux.
- **`ukemi_sha` recompute** (recette `record.ts` : `.ts` de `ukemi/` triés, `nom+\0+octets` LF) = `5b666aceb66c149e41bb11c8dca402de63914aaba8a02e9d85d1aeb0160f4448` = **G1/CLI** ✓ (`F:\tmp\g2-work\ukemisha-recompute.mjs`).

### 9 — Docs — sha/lignes recomputés, items formés, couverture CHANTIERS §E

- **sha256(LF) + lignes @ e8bcfe4 = G1 §1, 5/5** : `record.ts 168/58151dc1`, `book.ts 207/a539eabb`, `rpc2.ts 198/019786c8`, `ukemi.test.ts 351/7633355c`, `ukemi-record.test.ts 101/6526b85b`. **Tous ✓.**
- **Items formés G1 §10 (6, tous avec déclencheur)** : retry 429/5xx non exercé live (couvert par oracle déterministe) ; drpc « free plan » 400 (raffinement débit non-correction — **déjà formé**) ; **book PLEIN deploy→B** (non fait ; déclencheur cadence U-6) ; ADR-U1 D3 forme inédite future ; digests live = sous-ensembles bornés ; non-chevauchement inter-chunks (déclencheur : book plein). **Aucun dû nu.**
- **CHANTIERS §E « durcissement `record.ts` »** : tout le périmètre de ce lot **livré** — M4/M5/M6 (+M5b), oracle `defaultCall` (7 cas), retry 429/5xx + split 400, **wrapper live committé = CLI officielle** (les 3 divergences G1 §5b comblées : `--from-block`, `--min-interval-ms`, `--retries`) + `ukemi_sha`, critère `isRpcRevert` **confirmé live** (§5, 4 fournisseurs), **run live sUSDe/USDe** (susde-live.json). Les items **différés** (book plein deploy→B, U-1c e-mode, exemption vocab `cascade`, test O7 « deux URL même providerOf », PR-U1-1 Perez) sont **explicitement déclenchés vers des lots futurs** par ADR-EC D3 / CHANTIERS §E ⇒ items formés, **pas des dettes**. Au gel `e8bcfe4` la **ligne §E et ses sous-items restent en état « lancés/ouverts »** (`CHANTIERS.md` non touché par le delta, vérifié §10) ; la mise à jour du registre (durcissement → livré) est l'**acte post-G2 de l'orchestrateur** (R-20 tient le worker hors des registres) — **pas** un défaut worker.

### 10 — Fusion (`git merge-tree --write-tree`)

- **`lot/etude-suite` × `e8bcfe4`** : exit 0, **aucun marqueur CONFLICT** — propre.
- **`lot/t-1a-ii-a` × `e8bcfe4`** : exit 0, **aucun CONFLICT** — propre. `t-1a-ii-a` (merge-base `a3f85f4`) ne touche **que des docs** (`AUDIT-ENTREE-CRA`, `CHANTIERS`, `CHECKPOINT1-ADR-T1aii`, `INVENTAIRE-OUTILS-TIERS`, `RESSOURCES-HELIUS`, `ADR-T1aii`) ⇒ **aucun fichier code commun** ; `rpc.ts` intouché des deux côtés (le collecteur bell réutilise `providerOf` **sans modifier** `rpc.ts`). `e8bcfe4` ne touche pas `CHANTIERS.md` (seul `docs/G1-lot-u1a-hard.md` ajouté côté docs) ⇒ aucune paire de fichiers co-modifiés.

---

## Corrections (C) : **AUCUNE bloquante**

## Observations / items formés avec déclencheur (O)

- **O-1 — Garde `main()` sans test de non-régression (couverture).** `apps/sentinel/src/ukemi/record.ts:166` (garde run-guard). **Preuve** : aucun test nommé ne couvre le garde (grep néant) ; **CI = `ubuntu-latest` uniquement** (`ci.yml`, 5 jobs, pas de matrice — mesuré) ⇒ le bug **spécifique à Windows** (deux-slash) est **inguardable par un test in-repo** sous CI Linux (un test round-trip passe sur Linux même avec l'ancien code ; `pathToFileURL("F:\\x")` sous Linux ≠ `file:///F:/x`). Le fix n'est prouvé que par les runs live Windows §6 (hors CI) + ma sonde. **Annotation de G1 §2** « la CLI tourne … runs §6 le prouvent » : *prouvé par des runs live Windows hors dépôt ; aucun garde de non-régression in-repo*. **Correction proposée** (assurance partielle, non bloquante) : extraire `export function isMainModule(argv1, metaUrl)` appelée par le garde + test round-trip `isMainModule(fileURLToPath(import.meta.url), import.meta.url)===true` (attrape une régression **même-plateforme** et documente l'intention). La forme deux-slash **spécifique à Windows** n'est guardable que par un **runner CI Windows** — un test conditionnel `process.platform==="win32"` serait **inerte sous Linux** (sauté) et redondant sous Windows (ma sonde `guard2.mjs` off-repo joue déjà ce rôle explicite), donc à **ne pas** ajouter. **Déclencheur** : runner CI Windows (infra orchestrateur) OU prochain run dev Windows. **`error_origin`** : orchestrateur (absence de runner Windows = cause racine de l'inguardabilité) ; l'extraction `isMainModule`+round-trip relève du générateur (à porter avec le déclencheur).
- **O-2 — Mutant « retry infini » attrapé par pendaison, pas par assertion rapide.** `apps/sentinel/test/ukemi-record.test.ts` (`ukemi_record_retry_is_bounded`). **Preuve** : R2 (borne HTTP retirée) ⇒ l'assertion `count===3` n'est atteinte qu'**après** rejet ; une boucle non bornée ne rejette jamais ⇒ suite pend ⇒ rouge par **timeout CI** (mesuré : tué à 12 s). **Correction** : `test("ukemi_record_retry_is_bounded", { timeout: 5000 }, …)` pour un échec **rapide et net**. **`error_origin`** : générateur (propriété de test). Mineur.
- **O-3 — Backoff non plafonné (cosmétique).** `record.ts` `makeDefaultCall` (`backoffMs·2^attempt`). **Preuve** : mesuré — un délai > 2³¹−1 déclenche `TimeoutOverflowWarning` et se ramène à ~immédiat ⇒ **toujours borné** par `retries+1`, jamais infini (donc **pas un défaut**). **Correction** (optionnelle) : `Math.min(backoffMs·2^attempt, 30_000)` pour éteindre l'avertissement. **`error_origin`** : générateur. Trivial.

---

## Provenance
Revue produite par un worker Opus 4.8 (`claude-opus-4-8[1m]`, effort `max`), instance séparée à contexte frais, 2026-09-19. Toute mesure est reproductible : copie `git archive e8bcfe4` (`F:\tmp\g2-u1ahard`), sondes/drivers hors dépôt (`F:\tmp\g2-work\{guard2,mutant-driver,retry-driver,ukemisha-recompute,live-inspect}.mjs`, `F:\tmp\g2-mut-sentinel\test\pin-harness.ts`), artefacts live du worker inspectés hors dépôt (`F:\tmp\u1a-hard\`). Aucun commit, aucun workflow (R-20) ; vérification adversariale R-21 et verdict G7 chez l'orchestrateur. `error_origin` des O ci-dessus, à confirmer au G7.

<!-- G2 fraîche, lot U-1a-hard, gel e8bcfe4 (base a3f85f4). Corpus doc 02/03. -->
