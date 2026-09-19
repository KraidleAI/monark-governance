# G1 — Lot T-1a (MONARK Bell, ADR-B0) : collecte + digest + tests

- **Modèle** : worker `claude-opus-4-8[1m]`, effort max. **Provenance** : généré 2026-09-19, worktree `F:\Monark-wt-bell`, branche `lot/t-1a` (HEAD `58fe309`), réviseur = orchestrateur `claude-fable-5-1` (R-21). Aucun commit par le worker (R-20).
- **Portée livrée** : **T-1a-i** = spike RPC + registre + faits (i) écart de session et (ii) delta de halt + digest canonique + oracle. Faits (iii) volume/ADV et (iv) supply/PoR : **scindés en T-1a-ii** (§7), seam sur les lignes D2 (avis advisor + borne R-25). La brique reste **`upcoming`** : pas de chemin servi à T-1a (publication = T-1b), conforme à la règle de branchement et à l'ADR (capteur `upcoming` jusqu'à la Définition de fini).

## §0 — Spike de profondeur RPC (C-1, mesuré 2026-09-19, RPC publics, aucune clé)

Question : « rejeu 15 mois (fills jul-oct 2025) possible en RPC public ? ». Distinction mesurée : **signatures listées ≠ corps de transaction récupérable** (un nœud élagué liste les signatures mais rend `null` sur `getTransaction` ancien).

**Solana** (mints xStocks confirmés on-chain : `getAccountInfo.owner == Token-2022`, decimals 8 pour TSLAx/SPYx/NVDAx/AAPLx ; pool primaire TSLAx/USDC Raydium CLMM `8aDaBQ…`, ~3 244 tx/jour mesurés) :

| Fournisseur | Corps anciens (`getTransaction`) | Énumération `getSignaturesForAddress` | Débit | Verdict |
|---|---|---|---|---|
| `api.mainnet-beta.solana.com` | **profonds** (corps à ~85-90 j OK ; `getBlockTime` OK à ~437 j) | 429 après ~8 appels rapides ; ~1 447 pages sérielles pour atteindre 2025-06-30 sur **un** pool | ~5 req/s puis 429 | énumération **impraticable** |
| `solana-rpc.publicnode.com` | **élagués** (`getTransaction` à 90 j = `null`, « cleaned up ») | rapide (12 pages sans 429) | ~11 req/s | corps historiques **absents** |
| `solana.drpc.org` | — | HTTP 400 | — | clé/format requis |
| `rpc.ankr.com/solana` | — | HTTP 403 | — | clé requise |

**Ethereum** (Ondo TSLAon `0xf6b1…103f` confirmé on-chain : `symbol()`=TSLAon, `decimals()`=18, supply ≈ 18 382 ; Ondo Stocks lancé 2025-09-03 [lu]) :

| Fournisseur | `eth_getLogs` fenêtre ancienne (~1 an) | Plage max | Verdict |
|---|---|---|---|
| `rpc.mevblocker.io` | **OK** (41 Transfer, fenêtre ~1 an ; 226 sur 5 000 blocs récents) | 10 000 blocs | **archival** ; ~274 tranches pour tout l'historique |
| `1rpc.io/eth` | limité 50 blocs | 50 | servi mais lent |
| drpc / blastapi / publicnode / llama | 400 / 400 / 403 / échec réseau | — | indisponibles ici |

**Conclusion** : **rejeu 15 mois en public = NON pour Solana** (corps élagués sur les endpoints rapides ; énumération sérielle limitée par le débit sur le seul endpoint archival, ~1 447 pages × plusieurs pools × 4 symboles). **OUI partiel pour Ethereum/Ondo** (mevblocker archival + tranchage 10k). ⇒ **Helius = prérequis DÉCLARÉ** de la mesure fondatrice Solana jul-oct 2025 (l'investisseur prend l'abonnement, décision 12 ; `HELIUS_API_KEY` vide aujourd'hui, mesuré). Le collecteur est **piloté par env** (`BELL_SOLANA_RPC`, même chemin de code) : `HELIUS_API_KEY` fourni ⇒ rejeu fondateur en **une commande**, même digest.

## §1 — Fichiers livrés + sha256 (12 hex)

| Fichier | sha256 | Rôle |
|---|---|---|
| `apps/bell/package.json` | `e24eca3902d3` | paquet standalone, **zéro dépendance** (R-8) |
| `apps/bell/src/pools.ts` | `40fce80ca427` | registre sourcé (4 mints xStocks + 4 pools/vaults Raydium ; TSLAon + pools ; API + confirmation on-chain) |
| `apps/bell/src/sessions.ts` | `af837f1769dc` | calendrier NYSE 2025-2026 sourcé + ET↔UTC DST + classification session/régime |
| `apps/bell/src/reason-canon.ts` | `b1dba15c30ba` | carte fermée 18 graphies → 10 familles + `REASON_UNKNOWN` |
| `apps/bell/src/halts.ts` | `d3a3285d460f` | parse CSV RFC4180 + delta de halt (ii) + résidus nommés |
| `apps/bell/src/rpc.ts` | `3ef48308e94f` | JSON-RPC injecté ; VWAP par delta de vault ; dédup par signature |
| `apps/bell/src/gap.ts` | `1820dca1a3f1` | `g_t = ln(VWAP/close)` ; close **jamais** écrit |
| `apps/bell/src/digest.ts` | `7fd221bfa14a` | JSON canonique + `bell_sha` + garde de trou numérique (close) |
| `apps/bell/test/bell.test.ts` | `a3e39c63d95a` | oracle (13 tests nommés) |
| `apps/bell/test/fixtures/halts-reduced.csv` | `014dc9bbae89` | fixture réduite (lignes DST réelles + graphie cassée + quoting) |

**Modifiés (tracés)** : `tsconfig.json` (+`apps/bell/**`), `package.json` (glob de test `apps/bell/test`), `vocab-banned.json` (scope `bell`), `scripts/grep-forbidden.mjs` (branche walker `bell`). **Source CSV** (non committée, sha `7b3fa2593cf9` = `sources-T1/SOURCES-sha256.txt`) : entrée sourcée, lue, jamais recopiée (73 431 lignes ; borne R-25).

## §2 — Mutants nommés (oracle non-LLM, chacun rouge par construction)

| Test | Cible / ce qu'il tue |
|---|---|
| `bell_session_gap_identical_to_replay` | rejeu **bit-identique** du digest (même `bell_sha`) ; **aucun champ close** dans le digest (tuyau D4 collecte→digest) |
| `bell_close_changed_gap_differs` | close changé ⇒ `g_t` ⇒ `bell_sha` diffèrent |
| `bell_close_field_reddens` | champ `close`/`ref_price` numérique (ou chaîne numérique) dans une sortie ⇒ **rouge** (garde de trou numérique, ESC-1 c) |
| `bell_volume_dedup_by_signature` | double-listing d'une signature (route Jupiter) ⇒ **dédup** ⇒ 1 fill, pas 2 |
| `bell_vwap_matches_recorded_swap` | delta de vault d'un swap réel ⇒ VWAP 364,11 ; **hop Jupiter exclu** |
| `bell_halt_shift_one_second_changes_delta` | halt décalé d'1 s ⇒ premier fill après halt bascule (delta ≠) |
| `bell_dst_wrong_zone_reddens` | ASND 2026-02-27 (hiver, UTC−5) vs INHD 2026-07-31 (été, UTC−4) ; un offset fixe −5 h place INHD faux (DST) |
| `bell_reason_graphie_break` | graphie hors carte (« LULD PAUSE » majuscules) ⇒ `REASON_UNKNOWN`, jamais bucketée en silence |
| `bell_halt_residues_named_never_silent` | `resume_time_missing` / `reason_unknown` / `no_fill_in_window` nommés |
| `bell_no_secret_in_repo` | scan **par contexte** (`Authorization`/`api-key=`/`*_API_KEY=`) ⇒ 0 dans src ; un vrai contexte de clé rougit ; un mint base58 reste vert |
| `bell_vocab_scope_reddens` | motifs `bell` (« verified »/« guarantee »/« partner »/bande de prix) rougissent ; négations honnêtes vertes ; `collectTargets` couvre bien `apps/bell/src` (preuve de branchement) |
| `bell_session_classification` | régulier / week-end / férié (dont Carter 2025-01-09) / overnight-semaine / demi-séance |

## §3 — Grep / gate:vocab (scope `bell` ajouté)

_Les tokens cités ici et en §2 sont les **noms des motifs interdits** (guillemets/backticks), non des revendications de Bell._

- `vocab-banned.json` : bloc `scan.bell` (**source seule**, `apps/bell/src`) — motifs : `verified` (négation-aware, « signed is not verified » vert), `guarantee`, `partner(ship)`, `price band`, `±X`, `X % at/à Y %` (« à » encodé `\u00e0` pour ne pas rougir la garde de diacritique lang-gate — mesuré et corrigé). **Limite connue** (déclarée, comme le `gamma` de `$comment_platforms`) : le motif de bande rougirait un futur commentaire type « +/-1 slot » ; src propre aujourd'hui, revue manuelle par lot.
- `scripts/grep-forbidden.mjs` : branche walker `bell` (calque `sentinel`, dirs `apps/bell/src`). `gate:vocab` scanne désormais **149 fichiers** (142 + 7 src bell), **vert**. Preuve non inerte : `bell_vocab_scope_reddens`.
- **Non exporté** (T-1a) : `apps/bell` n'entre pas dans `APP_PACKAGE_DIRS` de `export-public.mjs` — je n'y touche pas ; liste blanche export + panneau = **T-1b** (déclaré).

## §4 — Oracle (tout vert, worktree `lot/t-1a`)

| Gate | Résultat |
|---|---|
| `npm run ci` (gate:vocab + typecheck + test) | **302/302 tests**, 0 échec (13 bell + 289 existants, aucune régression) |
| `npx tsc --noEmit` | 0 erreur (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| `npm run lint` (eslint) | propre |
| `npm run lint:ratchet` | **69/69** (plafond inchangé — tests bell typés, +0 violation différée) |
| `npm run lang:gate` | 0 hit français non exempt (src bell anglaise) |
| `npm run export:check` | OK — 0 chemin interdit, `apps/bell` non exporté |
| R-25 `git diff` (fixture incluse, hors doc) | **880 lignes** (846 nouvelles + 34 tracées) < 1 205 |

## §5 — Mesures (premier fill mesuré, première main)

**Reproduction des comptes de l'ADR par le parseur committé** (halts.ts + reason-canon.ts sur le CSV réel, 73 431 lignes) — **exacte** : 73 431 lignes · 4 539 resume vides · 18 graphies (LULD 61 747, News pending 10 210, News dissemination 106, Corporate Action 555, Merger Effective 320, Regulatory Concern 235, News Released 233, New Security Offering 11, Intraday-IIV 5, ETF-composant 9) · `REASON_UNKNOWN` = 0 · **recensé-15 depuis 2025-06-30 = 0** · tout l'historique = 8 (dernier 2025-06-05 CRCL, pré-lancement). Un écart = un bug de parseur, non l'ADR. **Delta de halt du recensé écrit tel quel : n = 0** (position, pas mesure ; jamais un booléen « conforme »).

**Fenêtre on-chain récente (symbole × session)** — RPC public, 2026-09-19 (samedi ⇒ toute fenêtre récente est en week-end ; digest → jamais le close). Halts recensé-15 (15 grandes caps) depuis 2025-06-30 = **0** pour tous, écrit tel quel.

| Symbole × session | n | `g_t` | >1/2/5 % | note |
|---|---|---|---|---|
| **TSLAx × week-end** | **52** | **+0,00071** | faux/faux/faux | mesuré (2 passes concordantes n=52/55) ; VWAP 364,53 USDC/TSLAx |
| SPYx / NVDAx / AAPLx × week-end | — | — | — | vaults **déclarés** (pools.ts) ; fenêtre non capturée (HTTP 429 RPC public — throttle, cf §0) |
| tous × {régulier, pre, after, overnight-sem, férié} | — | — | — | **non mesuré** (fenêtre récente = week-end) |
| tous × fenêtre fondatrice jul-oct 2025 (Cong Table 4, D7) | **0** | — | — | **0 ligne jusqu'à Helius** (§0) — item formé |

Méthode reproductible : `signaturesUntil` + `swapsForPool` (modules committés) + Polygon `{TSLA,SPY,NVDA,AAPL}/prev` (Bearer, en-tête, clé jamais écrite). Le pipeline est prouvé sur TSLAx ; l'extension aux 3 autres est purement bloquée par le throttle RPC public (Helius le lève). `g_t` = ln(VWAP/close), close lu jamais imprimé (déductible du couple public VWAP+`g_t`, accepté ESC-1 c).

**Calendrier sourcé première main** : fermetures 2025 dérivées de l'absence de barre journalière Polygon (dates seules ; a capté **2025-01-09** deuil Carter, qu'une liste mémorisée raterait) ; demi-séances 2025 (07-03/11-28/12-24) par signature de clôture anticipée (dernière barre minute 16:59 ET vs 19:59 ET) ; 2026 par page NYSE + Polygon `marketstatus/upcoming` (concordants).

## §6 — Invariants tenus / dettes

- **ESC-1 (c) tenu** : le close est lu (Polygon `prev` non ajusté) et **jamais** placé dans une sortie ; seuls `vwap` + `g_t` sont portés ; garde de trou numérique + mutant. `g_t` + `vwap` permettent de dériver le close — **accepté** par ESC-1 (c) (fait public ; la licence protège le flux Polygon reproduit verbatim).
- **Digest sans horodatage** (menace MAST « sha avec horodatage ») ; provenance (temps, fournisseurs) séparée, non hachée.
- **Signature/attestation ≠ vérité** : à T-1a le digest porte `bell_sha` (recompute), pas de signature Ed25519 (D8 place la clé privée sur le VPS, T-1b) — **aucune clé générée dans le dépôt** ; item T-1b déclaré.
- **Aucune dépendance nouvelle** (R-8) ; Node built-ins seuls. **`memstack` MCP : ConnectionRefused** (mesuré ; mémoire non consultée — noté, non contourné).

- **`n = 0` (volume nul)** : `sessionGap` renvoie `g_t = "0.0000000000"`, indistinguable d'un vrai écart nul ; à traiter comme **abstention** en amont (liste D3 « volume nul »), jamais comme `g_t = 0` — abstention branchée = T-1a-ii.
- **Sérialisation** : `vwap`/`g_t`/`volumeBase` sont des **chaînes décimales** (arithmétique bigint exacte) ; `n` et les compteurs de dépassement sont des **entiers JSON** (déviation déclarée de « chaînes décimales » — les entiers se sérialisent de façon déterministe, rejeu bit-identique tenu, prouvé).
- **`signaturesUntil`** : l'arrêt sur `blockTime < untilBlockTime` peut ne pas déclencher si la dernière entrée d'une page porte `blockTime: null` (signatures très récentes) ⇒ au plus **une page de trop** (correct, borné par `maxPages`) — noté, durci en T-1a-ii.
## §7 — Points à trancher (déclarés, non décidés)

1. **Helius (Solana archival)** = prérequis de la mesure fondatrice jul-oct 2025 (§0). Déclencheur : `HELIUS_API_KEY`. Collecteur env-driven prêt. **Rappel dû à l'investisseur** (décision 12).
2. **Scission T-1a-ii** (borne R-25 + seam D2, avis advisor) : la couverture i-iv complète + CLI + mesure fondatrice estimée ~1 400 lignes > 1 205. **Livré T-1a-i** (i + ii + digest + dédup-cœur + oracle + spike + fenêtre récente) à 880 lignes. **T-1a-ii** = (iii) dénominateur ADV [2nd] Polygon + (iv) supply/PoR (staleness + taux wrapper) + jambe swap Ethereum/Ondo (events Uniswap) + entrypoint collecteur ; tests `bell_por_staleness_and_wrapper_rate` + `bell_volume_dedup_by_signature` (cœur dédup déjà livré en rpc.ts).
3. **Ondo GM API auth-gated** (`api.gm.ondo.finance/v1/assets/all/addresses` → 403) : **procurement PR-B-ONDO** (clé) pour l'univers complet (100+/430+ actifs) et les adresses autoritatives ; TSLAon résolu via GeckoTerminal + confirmation on-chain.
4. **Item (g) ADR** : census univers complet (839 xStocks + 395 Ondo) + source MWCB (cond. H) — hors portée T-1a livrée ; item formé. Le recensé-15 + reproduction parseur sont faits.
5. **Conflation de dimensionnement ADR** : le « Ondo 837,9 M$ » des Sources est le total Ondo (bons du Trésor USDY/OUSG), **≠** les actions tokenisées Ondo (lancées 2025-09-03, > 1 Md$ 2026-07). Le « ≈ 47 % du périmètre » à revoir — **niveau ADR**, pas code T-1a.
6. **Graphies ETF** : l'ADR dit « ETF-composant ×6 graphies » ; mesuré = **×5** (18 graphies au total). Carte fermée sur les 18 chaînes exactes mesurées (doc 03 : la mesure prime).
7. **Solana version-1** : `maxSupportedTransactionVersion` doit être ≥ 1 (mesuré : mainnet-beta ET publicnode rendent `version:1` et rejettent 0) — constante `MAX_TX_VERSION=2` committée ; bump = ligne ADR.
