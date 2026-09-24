# G1 — Lot T-1a-ii-a (MONARK Bell, ADR-T1aii D1 lot -a) : collecteur, faits (iii)/(iv), jambe Ethereum

- **Modèle** : worker `claude-opus-4-8[1m]`, effort max. **R-1** : modèle résolu déclaré au premier message (préfixe `claude-opus-4-8` conforme ; `claude-opus-5` banni, non utilisé).
- **Provenance** : généré 2026-09-19, worktree `F:\Monark-wt-bell2a`, branche `lot/t-1a-ii-a` (base `lot/etude-suite` `88c3324` = merge-base), réviseur = orchestrateur `claude-fable-5-1` (R-21). **Aucun commit ni workflow par le worker (R-20).**
- **Portée** : entrypoint collecteur (`collect.ts`), quorum Solana (`quorum.ts`), fait (iii) volume/ADV (`volume.ts`), fait (iv) supply/PoR (`supply.ts`), jambe Ethereum Uniswap v3 (`ethereum.ts`), carte de résidus source unique (`residuals.ts`), fixture réduite d'une session réelle + exclusion R-25, motif UUID Helius dans `no_secret_in_repo`. **Jambe Ethereum CONSERVÉE dans -a** (R-25 = 1094 < 1205, seam -a2 non déclenché). Bell reste `upcoming` (CA-11) ; aucun registre site touché.

## §1 — Fichiers livrés (sha256 LF 12-hex, lignes)

| Fichier | sha256 (LF) | lignes | rôle |
|---|---|---|---|
| `apps/bell/src/residuals.ts` | `f31d10a840db` | 52 | carte fermée des résidus = **source unique** (union HaltResidue + collecteur), liée à halts.ts au niveau type (C-9) |
| `apps/bell/src/quorum.ts` | `a90633c57b3a` | 102 | quorum-2 Solana, calque déclaré de `quorum2`, importe **seulement** `providerOf` (C-2 b) ; ok/revert/transport ; `statusOf` scrub (C-10) |
| `apps/bell/src/volume.ts` | `d521dd87cda3` | 49 | fait (iii) volume dédup + ratio volume/ADV (**ratio seul**, ADV jamais verbatim, C-6) ; unité → `multiplier_unit` |
| `apps/bell/src/supply.ts` | `ab77b9af4af6` | 110 | fait (iv) lecture Token-2022 RPC plain ; registre PoR par token ; wrappers ; phrase honnête |
| `apps/bell/src/ethereum.ts` | `6795a3ca99da` | 91 | jambe Ethereum : `Swap` v3 via `makeUkemiPool.getLogsRange` **tel quel** ; décodage int256 signé ; VWAP |
| `apps/bell/src/collect.ts` | `3f0126d8c339` | 365 | entrypoint CLI env-driven (hors CI) ; cœur pur `collect()` ; `state.json`/`timeline.jsonl` chaîné ; compteurs par résidu (D8) ; sorties hors arbre |
| `apps/bell/src/digest.ts` | `839c982dc153` | 87 | **modifié** : `CLOSE_KEY` étendu `adv\|share_volume\|volume_ref` + exemption `(?<!no_)close` ; `GapEntryAbstained` accepte `no_close_ref` (V-7) |
| `apps/bell/test/collect.test.ts` | `085a1ced13b9` | 252 | oracle T-1a-ii (10 tests nommés) |
| `apps/bell/test/bell.test.ts` | `fec9c8b5877e` | 265 | **modifié** : liste `bell_no_secret_in_repo` étendue aux **5 → 6** src au pli G2 (ethereum.ts ajouté, O-3 ; ligne 153, aucune ligne ajoutée) ; sha post-pli `ebd61c7905e5` en PLI-G2 §2 |
| `apps/bell/test/fixtures/series/tslax-weekend-fills.jsonl` | `7f81f670ffd2` | 8 | **fixture réelle réduite** (8 fills TSLAx/USDC, 2026-09-19, `providerOf`=solana.com) — exclue R-25 |
| `apps/bell/test/fixtures/series/tslax-mint-token2022.json` | `230972b98ef4` | 89 | mint TSLAx réel (getAccountInfo jsonParsed) — exclue R-25 |
| `apps/bell/test/fixtures/series/PROVENANCE-tslax-series.md` | `c5a1338caab2` | 30 | provenance same-dir (nom + sha LF sur la même ligne) |
| `test/no-secret-in-repo.test.ts` | `beae57df4480` | 85 | **modifié** : motif UUID Helius en contexte `api-key=` + non-vacuité + garde base58 |
| `test/ci-gates.test.ts` | `1764c620dec8` | 1111 | **modifié** : `SERIES_EXCLUDED_ROOTS` += `apps/bell/test/fixtures/series` (1 ligne) |
| `.github/workflows/ci.yml` | `1f21eb56bb46` | 98 | **modifié** : 3 pathspecs `:(exclude,glob)apps/bell/test/fixtures/series/**/*.{json,jsonl,csv}` (ligne 52) |

**Note pli post-G2 (2026-09-19)** : le pli des corrections G2 §8 modifie `collect.ts` (`3f0126d8c339`→`cfec4363d596`, O-2/O-7), `collect.test.ts` (`085a1ced13b9`→`93a4df59bfe8`, O-1/O-2), `bell.test.ts` (`fec9c8b5877e`→`ebd61c7905e5`, O-3) et `rpc.ts` (hors table de gel — inchangé 88c3324→gel G1 ; `→3e372df0955e`, O-1). Les shas de **gel G1** ci-dessus sont conservés tels quels ; les shas **post-pli** font foi dans `docs/PLI-G2-lot-t1a-ii-a.md` §2. `bell_sha` de la fixture **inchangé** (`4375042c…fab6fa46`) ; aucune fixture touchée.

## §2 — Politique de quorum MESURÉE (C-1, run réel 2026-09-19)

Liste archivale = **Helius + `api.mainnet-beta.solana.com`** (publicnode retiré, C-1). Politique : (1) **concordance de l'ensemble des signatures** de la fenêtre (sha du jeu trié, `signaturesSetKey`, motif `logsKey`) — filtré à la fenêtre AVANT hachage pour concorder sur du **réglé** (pas la queue temps-réel racy) ; (2) **corps** échantillonnés par quorum tous les N (déterministe, pas de `Math.random`), le reste en fournisseur unique (le plus rapide), résidu `quorum_sampled` + **taux de couverture publié** ; une lecture Helius seule sans ce résidu = `no_quorum`.

**Run réel borné** (clé Helius **absente du scope Process** de mon shell, **présente en scope User** len 36 — tirée dans un enfant PowerShell `[Environment]::GetEnvironmentVariable('HELIUS_API_KEY','User')`, jamais en argv/stdout ; POLYGON en scope Process len 32) :
- **run 1 → correctif → run 2 (`error_origin` : générateur)** : le run 1 a levé `FATAL HTTP 429` — message **scrubé** (sans url ni clé, C-10) — car un corps en fournisseur unique sur mainnet-beta (rate-limité) épuisait le retry et propageait. Correctif : primaire = fournisseur le plus rapide (`providers[0]`, Helius) ; un corps illisible ⇒ **skip + fault**, jamais fatal. Run 2 (ci-dessous) vert.
- fenêtre réglée ~60 min (samedi ⇒ régime week-end), `--pools TSLAx --max-pages 2 --body-sample 4 --min-interval 250`.
- **débit** : 202 appels au total, `faults=[]` (mainnet-beta a tenu les ~39 corps quorum à 250 ms d'intervalle **sans 429 fatal** ; Helius, 50 req/s, a servi le reste) ; ~202 crédits Helius (négligeable sur 10 M).
- **signature set concordé** : `no_quorum=0` (Helius et mainnet-beta d'accord sur le jeu de la fenêtre).
- **taux de couverture** : `quorum_coverage=0.2531` (bodySample=4 ⇒ 1/4 des 155 corps concordés en quorum, reste single-provider) ⇒ résidu **`quorum_sampled=1`** publié.
- résultat : `bell_sha=e30ed838…300b`, TSLAx × week-end n=155, `vwap=363.4164012211`, `gT=-0.0023460633` (≈ −0,23 %), `exceed 1/2/5 %=0/0/0`, `vol_ratio=0.0000011612` (60 min de volume token / ADV mensuel TSLA ; **ADV jamais écrit**).
- **fuite** : scan `https?://` / `api-key` / UUID sur `state.json`+`timeline.jsonl`+`journal.json`+stderr+stdout = **0 (grep exit 1)**. Provenance/journal ne portent que `providerOf` (`helius-rpc.com`,`solana.com`).
- **dérivabilité ADV (point pour le validateur)** : `vol_ratio` + `volumeBase` recomposent l'ADV, **même forme** que `g_t` + `vwap` ⇒ close (ESC-1 c) ; seul `vol_ratio` est publié, l'ADV jamais. L'extension de ESC-1 (c) à l'ADV est un **point de checkpoint-2** (C-6 « application conservatrice »), non une décision de ce lot.

**E-1 (escalade conditionnelle) NON déclenchée aujourd'hui** : le quorum plein des signatures a tenu sur mainnet-beta pour une fenêtre ; l'échantillonnage des corps est la politique déclarée (résidu + couverture), non un pis-aller. La tenue d'un quorum **plein des corps** sur la fenêtre fondatrice jul-oct 2025 (≈ 1,6 M corps) reste à mesurer au spike -b (item déclencheur ci-dessous).

## §3 — Sources PoR nommées par token (C-3, première main [lu] 2026-09-19)

| Token | Source/méthode nommée | Feed on-chain | Résidu |
|---|---|---|---|
| TSLAx, SPYx, NVDAx, AAPLx | The Network Firm (attestation, accès lecture seule aux comptes bancaires de custody ; `por.backed.fi`) ; flux Chainlink DataLink `<SYM>/POR-Datalink-ProofOfReserves-mainnet-production` | **`proxyAddress: null`** (aucun agrégateur on-chain public — mesuré) | **`por_unavailable`** (jamais fabriquer une adresse) |
| TSLAon | API réserve Ondo Global Markets (`api.gm.ondo.finance`) | auth-gated (**403** mesuré, PR-B-ONDO) | **`por_unavailable`** — abstention déclarée |

Sources : `backed.fi/news-updates/chainlink-proof-of-reserve-is-now-active` [lu] (The Network Firm nommé ; PoR bTokens Polygon uniquement, pas les xStocks Solana) ; inspection tierce des flux DataLink xStocks (`proxyAddress: null`) [lu]. Phrase honnête (aucune surclaim, vocab `bell`) : « on-chain supply S and relayed proof-of-reserves Y differ from the underlying float X at time t; Y is **not verified** against the custodian ».

## §4 — Lecture Token-2022 RPC plain (C-4, run réel)

`getAccountInfo(jsonParsed)` du mint TSLAx `XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB` (owner Token-2022, RPC plain 1 crédit, quorum-able ; pas de DAS) :
- `supply` = `22963687855608` (dérive dans le temps ⇒ le sha de la fixture épingle « ce que j'ai lu ») ; `decimals` = 8.
- `scaledUiAmountConfig.multiplier` = **"1"** ⇒ `multiplier_unit=false` (unité token = unité action aujourd'hui).
- `pausableConfig.paused` = **false** — lu et consigné, **pas encore rendu** (témoin type halt, cond. H → T-1b).
- `permanentDelegate` = `5aMNNLQJwAEeoemTEMkv5NVjqKwvvefRYCQ5Z67HFvEq` — lu et consigné, **pas encore rendu** (fait de parité → T-2).

## §5 — Tests (liste fixe, tous verts)

| Test | ce qu'il tient |
|---|---|
| `bell_collector_replays_fixture_bit_identical` | rejeu bit-identique du digest de la fixture réelle ; **sha épinglé** `4375042c…fab6fa46` ; `assertNoClose` sur la série (aucun close/ADV, D5) |
| `bell_no_quorum_on_single_provider` | 1 fournisseur ⇒ NoQuorum ; 2 alias même `providerOf` ⇒ NoQuorum ; 2 distincts concordants ⇒ valeur ; désaccord ⇒ QuorumDisagreement ; revert concordant ⇒ ConcordantRevert ; `signaturesSetKey` set-sensible ordre-indépendant ; résidu `no_quorum` compté |
| `bell_por_staleness_and_wrapper_rate` | Token-2022 (multiplier/paused/delegate) ; PoR stale/fresh/unavailable + méthode nommée ; wrapper ⇒ `no_wrapper` ; phrase honnête sans surclaim |
| `bell_no_close_ref_is_a_named_residual` | volume sans close ⇒ abstention `no_close_ref` (vwap porté, **aucun gT**) ; `closeRef ≤ 0` idem (V-7) |
| `bell_abstentions_counted` | compteurs par résidu distincts et non nuls (D8) |
| `bell_journal_and_provenance_carry_no_key` | `statusOf` scrub (HTTP code oui, url/uuid non) ; quorum fault {provider,status} sans message ; sortie complète sans url/uuid/`api-key=` |
| `bell_residual_map_is_single_source` | `newResidualCounts()` = `RESIDUAL_CODES` ; state+digest portent exactement ce jeu (câblé) |
| `bell_ratio_killer_adv_and_unit` | ADV changé ⇒ ratio ≠ ; multiplier ≠ 1 ⇒ `multiplier_unit` ; garde `adv\|share_volume\|volume_ref` rougit, `vol_ratio` non |
| `bell_eth_v3_swap_decode_and_vwap` | topic0 v3 (première main) ; décodage int256 signé (vecteur TSLAon réel) ; VWAP ~405,34 |
| `bell_timeline_is_hash_chained` | chaîne `prev_line_hash` (genesis + lien) |
| `series_pinned_are_declared_and_hashed` | **vert** sur la racine Bell (fixtures déclarées+hachées same-dir) |
| `no_secret_in_repo` (racine) | motif UUID `api-key=` détecté (non-vacuité) ; mint base58 vert |

## §6 — Mutants rejoués (attendu = rouge ; restauration byte-identique vérifiée)

| # | Mutant | Test | Message rouge mesuré | Restauration sha |
|---|---|---|---|---|
| 1 | `statusOf` renvoie le message brut (url fuit) | `bell_journal_and_provenance_carry_no_key` | `AssertionError` (status carries no url/key) | `quorum.ts` `a90633c57b3a` ✓ |
| 2 | compteur figé (`counts[r]=1`) | `bell_abstentions_counted` | `AssertionError: A + B` (2 attendu) | `collect.ts` `3f0126d8c339` ✓ |
| 3 | retrait de `adv` de `CLOSE_KEY` | `bell_ratio_killer_adv_and_unit` | `Missing expected exception` | `digest.ts` `839c982dc153` ✓ |
| 4 | UUID planté en contexte `api-key=` | `no_secret_in_repo` | `committed secret(s) found: …volume.ts:50 [api-key UUID (Helius-shaped)]` | `volume.ts` `d521dd87cda3` ✓ |
| 5 | un octet de la série modifié | `bell_collector_replays…` + `series_pinned…` | `drifted from the pinned digest` ; `series file not declared+hashed (sha … d6b57d…)` | `…fills.jsonl` `7f81f670ffd2` ✓ |
| 6 | collecteur bâtit une carte partielle | `bell_residual_map_is_single_source` | `Expected values to be strictly deep-equal` | `collect.ts` `3f0126d8c339` ✓ |

Autres mutants par construction (assertions du §5, non rejoués séparément) : quorum désaccord/revert, no_close_ref, timeline chain. Restaurations : shas identiques au §1.

## §7 — Gates (chiffrées, worktree `lot/t-1a-ii-a`)

| Gate | Résultat |
|---|---|
| `npm run ci` (gate:vocab + typecheck + test) | **336/336 tests**, 0 échec ; gate:vocab OK (162 fichiers, `apps/bell/src` inclut quorum/collect/supply/volume/residuals/ethereum) |
| `npx tsc --noEmit` | 0 erreur (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| `npm run lint` | propre |
| `npm run lint:ratchet` | **69/69** (plafond inchangé) |
| `lang-gate --scope root,contracts,schemas,site` | **0 hit** (scope `bell` inexistant ⇒ `root` ; `apps/bell` classé `root` ; « un » (article FR) évité) |
| `npm run export:check` | OK — `apps/bell` non exporté |
| **R-25** (`ci.yml:52` exact, working tree vs merge-base `88c3324`, `git add -N`) | **1080 +/14− = 1094 < 1205** — jambe Ethereum incluse, seam -a2 non déclenché |

## §8 — CA-11, items formés (zéro dette), observations

- **CA-11** : sorties du collecteur **réellement hors arbre git** (`--out` défaut `F:/tmp/bell-out` ; `main()` refuse un `--out` sous la racine du dépôt) ; run réel écrit `state.json`+`timeline.jsonl`+`journal.json` dans `F:\tmp\bell-out` ; `no_secret_in_repo` marche l'arbre seul. Bell reste **`upcoming`** (`fleet.ts` intact, 0 occurrence). Publication = T-1b.
- **Items formés avec déclencheur** (jamais un dû nu) :
  - **PoR on-chain xStocks** : recherche de solutions faite (première main [lu]) — aucun proxy Chainlink SmartData public aujourd'hui ⇒ résidu `por_unavailable` honnête. *Déclencheur* : un `proxyAddress` non-null publié par Chainlink, OU ingestion de l'API d'attestation The Network Firm (ajouter `onchainFeed`/`porRelayed` dans `supply.ts`).
  - **PR-B-ONDO** (clé API Ondo GM, 403 mesuré) : TSLAon PoR reste abstention. *Déclencheur* : clé procurée par le mainteneur.
  - **Wrappers** : aucun contrat wrapper/bridge nommé première main ⇒ `no_wrapper`. *Déclencheur* : identification d'un contrat wrapper (renseigner `WRAPPERS` dans `supply.ts`) — le taux se calcule alors.
  - **Jambe Ethereum : résolution temps→bloc** : `--eth` exige `--eth-from-block/--eth-to-block` (eth_getLogs est borné en blocs ; pas d'index temps→bloc ici). *Déclencheur* : ajouter un résolveur (binaire sur `eth_getBlockByNumber`) à -b/T-1b ; la fenêtre fondatrice pour TSLAon en dépend.
  - **Course fondatrice Solana jul-oct 2025** : hors -a (lot -b, course Helius, bornes UTC épinglées, spike de profondeur/coût `getTransactionsForAddress`). *Déclencheur* : lot -b après G7 de -a.
- **C-13 (CGU Helius) non déclenché en -a** : les fixtures committées sont capturées de `api.mainnet-beta.solana.com` (public, curl) **avant** le run Helius ; **aucun artefact dérivé de Helius n'est dans l'arbre** (sorties Helius seulement dans `F:\tmp\bell-out`). *Déclencheur* : lire `helius.dev/terms` avant que -b committe des fixtures dérivées (C-13/E-2).
  - **jambe Ethereum LIVE non exécutée** : `liveEthSwaps` + le câblage `--eth` n'ont **pas tourné sur réseau** (TSLAon sans swaps très récents + pas d'index temps→bloc ici) ; seuls le **décodage int256 signé + VWAP** sont testés (vecteur TSLAon réel, `bell_eth_v3_swap_decode_and_vwap`). *Déclencheur* : résolveur temps→bloc à -b/T-1b.
- **Observation pour l'orchestrateur (hors mon périmètre ligne-52-only)** : le bloc de commentaire `ci.yml:46-51` (note D9 sexies) énumère `fixtures/**` et `apps/sentinel/test/fixtures/**` mais pas encore la racine série Bell ; le lot **E-registre** touche aussi `ci.yml` (fusion attendue) — la mise à jour du commentaire est à consigner à la fusion, pas ici.
- **Observation** : `series_pinned_are_declared_and_hashed` a des ancres concrètes pour `fixtures/` et `apps/sentinel/` mais **pas pour la racine Bell** ; le walk `continue` sur un dossier absent ⇒ une racine série Bell vide/absente serait un **faux-vert**. Ajouter une ancre = 2ᵉ ligne dans `ci-gates.test.ts` (mission : « seulement `SERIES_EXCLUDED_ROOTS` ») ⇒ item avec déclencheur : prochain lot touchant ce test.
- **Observation** : le journal ne porte de compteurs que pour les *faults* (providerOf) ; pas d'appels par fournisseur (`calls=202` est global, stdout). Non bloquant.

- **Pli post-G2 (2026-09-19) — items formés / différés nommés (déclencheur, jamais un dû nu)** :
  - **O-5 différés à `-b` (course fondatrice), nommés ici pour traçabilité** : **C-4** — hypothèse « multiplicateur d'unité constant sur jul-oct 2025 » : lu `"1"` au 2026-09-19, **non vérifié** sur la fenêtre fondatrice (pas de VWAP fondatrice en -a) ; **C-11** — bornes par pool (`state.json` porte une `window` globale ; bornes par pool = profondeur Helius par pool) ; **C-12** — items (g) census / MWCB / Ondo. *Déclencheur* : run fondateur `-b` (spike Helius) après G7 de -a.
  - **O-6 (C-1b) — formé, AVANT le run fondateur `-b`** (NON implémenté ici, R-25) : rendre la **divergence corps-niveau visible** au lieu de l'avaler en `quorum_sampled` (bump `no_quorum` du pool si ≥1 corps échantillonné diverge, ou champ journal `body_disagreements`), **et extraire la boucle de sampling `liveSolanaFills` (collect.ts) en fonction pure testable** (rejeu offline de coverage / quorum_sampled / divergence). *Déclencheur* : avant `-b` (là où la divergence Helius/mainnet-beta mord).
  - **O-4 — formé** : ancre « racine série Bell non vide » dans `series_pinned_are_declared_and_hashed` (faux-vert 10a sur racine absente/vide). *Déclencheur* : prochain lot touchant `test/ci-gates.test.ts` (lot ci-gates).

## §9 — Discipline

Aucun chiffre de seconde main non déclaré ; PoR/topic v3/token order/décodage int256 **grondés première main** (RPC publics + pages Backed [lu]). Aucun commit/workflow (R-20). Sortie écrite pour être vérifiée adversarialement (R-21) : chaque affirmation porte son sha, son message rouge, ou sa commande. Consultations **advisor intégré (Fable)** : **2** — (1) avant tout travail substantiel (plan, seam R-25, garde `adv`, décision run User-scope) ; (2) à la clôture (revue avant message final). Avis, jamais verdict (R-26) ; G7 et vérification adversariale chez l'orchestrateur. Aucun blocage ni double échec.
