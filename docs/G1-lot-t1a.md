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
| `apps/bell/src/sessions.ts` | `ae1742e924e7` | calendrier NYSE 2025-2026 sourcé + ET↔UTC DST + classification session/régime **(G2 pliée : ancre C-1)** |
| `apps/bell/src/reason-canon.ts` | `07eaa060e254` | carte fermée 18 graphies → 10 familles + `REASON_UNKNOWN` **(G2 pliée : note O-4)** |
| `apps/bell/src/halts.ts` | `c7fb2cb21ab2` | parse CSV RFC4180 + delta de halt (ii) + résidus nommés **(G2 pliée : borne C-7)** |
| `apps/bell/src/rpc.ts` | `3ef48308e94f` | JSON-RPC injecté ; VWAP par delta de vault ; dédup par signature |
| `apps/bell/src/gap.ts` | `cb19e307ba24` | `g_t = ln(VWAP/close)` ; close **jamais** écrit **(G2 pliée : abstention volume-nul C-4)** |
| `apps/bell/src/digest.ts` | `8cbd3ee4283c` | JSON canonique + `bell_sha` + garde de trou numérique (close) **(G2 pliée : CLOSE_KEY C-3)** |
| `apps/bell/test/bell.test.ts` | `54b32b9a1ee0` | oracle (**18** tests nommés) **(G2 pliée : +5 tueurs C-1/C-2/C-3/C-4/C-7)** |
| `apps/bell/test/fixtures/halts-reduced.csv` | `014dc9bbae89` | fixture réduite (lignes DST réelles + graphie cassée + quoting) |

**Modifiés (tracés)** : `tsconfig.json` (+`apps/bell/**`), `package.json` (glob de test `apps/bell/test`), `vocab-banned.json` (scope `bell`), `scripts/grep-forbidden.mjs` (branche walker `bell`). **Source CSV** (non committée, sha `7b3fa2593cf9` = `sources-T1/SOURCES-sha256.txt`) : entrée sourcée, lue, jamais recopiée (73 431 lignes ; borne R-25).

## §2 — Mutants nommés (oracle non-LLM, chacun rouge par construction)

| Test | Cible / ce qu'il tue |
|---|---|
| `bell_csv_parses_quoted_names_and_dst_rows` | parse RFC4180 (`FRGT` : nom avec virgule + guillemets échappés ; `ASND` News pending ; `INHD` 15:52:53 ; 5 lignes) **(O-7 : était omis de §2)** |
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
| `bell_anchor_skips_holidays_and_weekends` | **C-1** : ancre hors-bourse = dernier jour de bourse (sam 2026-07-04 → jeu 07-02 car ven 07-03 férié ; MLK lun 01-19 → ven 01-16 ; dim ordinaire → vendredi) + `regime = gapRegime(ancre)` ; mutant « marche sans saut des fériés » ⇒ ancre 07-03 ⇒ rouge |
| `bell_canonical_key_order_invariant` | **C-2** : clés permutées en profondeur ⇒ même `canonical`/`bell_sha` ; arrays **restent** ordonnés ; mutant « retirer `.sort()` » ⇒ rouge (tue le survivant `e`) |
| `bell_close_guard_catches_camelcase` | **C-3** : `CLOSE_KEY` élargi capte `refPrice`/`pRef`/`reference`/`prev` ; `prev_line_hash` (chaîne timeline) **non** rougi (`\bprev\b`) ; mutant « regex rétrécie » ⇒ rouge |
| `bell_zero_volume_abstains_never_zero_gap` | **C-4** : volume nul ⇒ `abstain: "no_fill_in_window"`, **aucun `gT`** (vs vrai écart nul qui porte `gT`) ; `closeRef ≤ 0` ⇒ throw ; digest accepte l'abstention ; mutant « `gT="0.0000000000"` réintroduit » ⇒ rouge |
| `bell_halt_last_before_resume_excludes_pre_halt` | **C-7** : fill antérieur au halt exclu de « dernier avant Resume » (borne `>= haltUtcMs`) ; fenêtre vide ⇒ `no_fill_in_window` seul ; mutant « borne retirée » ⇒ rouge |

## §3 — Grep / gate:vocab (scope `bell` ajouté)

_Les tokens cités ici et en §2 sont les **noms des motifs interdits** (guillemets/backticks), non des revendications de Bell._

- `vocab-banned.json` : bloc `scan.bell` (**source seule**, `apps/bell/src`) — motifs : `verified` (négation-aware, « signed is not verified » vert), `guarantee`, `partner(ship)`, `price band`, `±X`, `X % at/à Y %` (« à » encodé `\u00e0` pour ne pas rougir la garde de diacritique lang-gate — mesuré et corrigé). **Limite connue** (déclarée, comme le `gamma` de `$comment_platforms`) : le motif de bande rougirait un futur commentaire type « +/-1 slot » ; src propre aujourd'hui, revue manuelle par lot.
- `scripts/grep-forbidden.mjs` : branche walker `bell` (calque `sentinel`, dirs `apps/bell/src`). `gate:vocab` scanne désormais **149 fichiers** (142 + 7 src bell), **vert**. Preuve non inerte : `bell_vocab_scope_reddens`.
- **Non exporté** (T-1a) : `apps/bell` n'entre pas dans `APP_PACKAGE_DIRS` de `export-public.mjs` — je n'y touche pas ; liste blanche export + panneau = **T-1b** (déclaré).

## §4 — Oracle (tout vert, worktree `lot/t-1a`)

| Gate | Résultat |
|---|---|
| `npm run ci` (gate:vocab + typecheck + test) | **307/307 tests**, 0 échec (**18** bell + 289 existants, aucune régression ; +5 tueurs G2 pliée) |
| `npx tsc --noEmit` | 0 erreur (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| `npm run lint` (eslint) | propre |
| `npm run lint:ratchet` | **69/69** (plafond inchangé — tests bell typés, +0 violation différée) |
| `npm run lang:gate` | **0 hit** (pendant le pliage : **2 hits `fr-word` « Mon »** introduits par des commentaires C-1 — abréviation de jour anglaise prise pour le français « mon » — **corrigés** en retirant l'abréviation ; final vert) |
| `npm run export:check` | OK — 0 chemin interdit, `apps/bell` non exporté |
| R-25 `git diff` (**commande exacte de la gate**, arbre de travail après pliage G2, base `58fe309`) | **1 017 lignes** (+1 017/−3, 15 fichiers ; inclut la fixture bell `halts-reduced.csv` **non exclue** par le pathspec, cf. C-5) < 1 205 |

## §5 — Mesures (premier fill mesuré, première main)

**Reproduction des comptes de l'ADR par le parseur committé** (halts.ts + reason-canon.ts sur le CSV réel, 73 431 lignes) — **exacte** : 73 431 lignes · 4 539 resume vides · 18 graphies (LULD 61 747, News pending 10 210, News dissemination 106, Corporate Action 555, Merger Effective 320, Regulatory Concern 235, News Released 233, New Security Offering 11, Intraday-IIV 5, ETF-composant 9) · `REASON_UNKNOWN` = 0 · **recensé-15 depuis 2025-06-30 = 0** · tout l'historique = 8 (dernier 2025-06-05 CRCL, pré-lancement). Un écart = un bug de parseur, non l'ADR. **Delta de halt du recensé écrit tel quel : n = 0** (position, pas mesure ; jamais un booléen « conforme »).

**Fenêtre on-chain récente (symbole × session)** — RPC public, 2026-09-19 (samedi ⇒ toute fenêtre récente est en week-end ; digest → jamais le close). Halts recensé-15 (15 grandes caps) depuis 2025-06-30 = **0** pour tous, écrit tel quel.

| Symbole × session | n | `g_t` | >1/2/5 % | note |
|---|---|---|---|---|
| **TSLAx × week-end** | **52** | **+0,00071** | faux/faux/faux | mesuré, 2 passes (n=52 et n=55) ; VWAP 364,53 USDC/TSLAx ; **voir note C-6 sous la table** |
| SPYx / NVDAx / AAPLx × week-end | — | — | — | vaults **déclarés** (pools.ts) ; fenêtre non capturée (HTTP 429 RPC public — throttle, cf §0) |
| tous × {régulier, pre, after, overnight-sem, férié} | — | — | — | **non mesuré** (fenêtre récente = week-end) |
| tous × fenêtre fondatrice jul-oct 2025 (Cong Table 4, D7) | **0** | — | — | **0 ligne jusqu'à Helius** (§0) — item formé |

**Note C-6 (pliage G2) — n=52/55 et bornes de fenêtre** : les deux passes RPC public ont rendu **n=52** puis **n=55**, soit **3 fills d'écart** — **non « concordantes »** (qualificatif retiré). La cause de l'écart n'est **pas épinglée** : throttle 429 du pool public (§0) ou fenêtre temporelle glissante entre les deux exécutions sont l'un et l'autre plausibles, **aucun n'est mesuré** ; la table retient n=52 (la passe retenue n'est pas tranchée). Les **bornes UTC `[fromUtc, toUtc]`** de la fenêtre week-end **ne sont pas épinglées** dans le dépôt (mesure live du 2026-09-19, non committée) — **à épingler à la course fondatrice** (avec la clé Helius, §0/§7.1).

Méthode reproductible : `signaturesUntil` + `swapsForPool` (modules committés) + Polygon `{TSLA,SPY,NVDA,AAPL}/prev` (Bearer, en-tête, clé jamais écrite). Le pipeline est prouvé sur TSLAx ; l'extension aux 3 autres est purement bloquée par le throttle RPC public (Helius le lève). `g_t` = ln(VWAP/close), close lu jamais imprimé (déductible du couple public VWAP+`g_t`, accepté ESC-1 c).

**Calendrier sourcé première main** : fermetures 2025 dérivées de l'absence de barre journalière Polygon (dates seules ; a capté **2025-01-09** deuil Carter, qu'une liste mémorisée raterait) ; demi-séances 2025 (07-03/11-28/12-24) par signature de clôture anticipée (dernière barre minute 16:59 ET vs 19:59 ET) ; 2026 par page NYSE + Polygon `marketstatus/upcoming` (concordants).

## §6 — Invariants tenus / dettes

- **ESC-1 (c) tenu** : le close est lu (Polygon `prev` non ajusté) et **jamais** placé dans une sortie ; seuls `vwap` + `g_t` sont portés ; garde de trou numérique + mutant. `g_t` + `vwap` permettent de dériver le close — **accepté** par ESC-1 (c) (fait public ; la licence protège le flux Polygon reproduit verbatim).
- **Digest sans horodatage** (menace MAST « sha avec horodatage ») ; provenance (temps, fournisseurs) séparée, non hachée.
- **Signature/attestation ≠ vérité** : à T-1a le digest porte `bell_sha` (recompute), pas de signature Ed25519 (D8 place la clé privée sur le VPS, T-1b) — **aucune clé générée dans le dépôt** ; item T-1b déclaré.
- **Aucune dépendance nouvelle** (R-8) ; Node built-ins seuls. **`memstack` MCP : ConnectionRefused** (mesuré ; mémoire non consultée — noté, non contourné).

- **`n = 0` (volume nul) — PLIÉ (C-4, G2)** : `sessionGap` **abstient explicitement** (`abstain: "no_fill_in_window"`, **aucun `gT`**) au lieu de `g_t = "0.0000000000"` (qui était indistinguable d'un vrai écart nul) ; un vrai écart nul (VWAP == close) porte toujours son `gT` et reste **distinguable** ; `closeRef ≤ 0` **lève** désormais (jamais un 0/-Infinity fabriqué) ; le digest accepte l'entrée d'abstention. Branché en **T-1a-i** (test `bell_zero_volume_abstains_never_zero_gap`, mutant rejoué rouge).
- **Sérialisation** : `vwap`/`g_t`/`volumeBase` sont des **chaînes décimales** (arithmétique bigint exacte) ; `n` et les compteurs de dépassement sont des **entiers JSON** (déviation déclarée de « chaînes décimales » — les entiers se sérialisent de façon déterministe, rejeu bit-identique tenu, prouvé).
- **`signaturesUntil`** : l'arrêt sur `blockTime < untilBlockTime` peut ne pas déclencher si la dernière entrée d'une page porte `blockTime: null` (signatures très récentes) ⇒ au plus **une page de trop** (correct, borné par `maxPages`) — noté, durci en T-1a-ii.
## §7 — Points à trancher (déclarés, non décidés)

1. **Helius (Solana archival)** = prérequis de la mesure fondatrice jul-oct 2025 (§0). Déclencheur : `HELIUS_API_KEY`. Collecteur env-driven prêt. **Rappel dû à l'investisseur** (décision 12).
2. **Scission T-1a-ii** (borne R-25 + seam D2, avis advisor) : la couverture i-iv complète + CLI + mesure fondatrice estimée ~1 400 lignes > 1 205. **Livré T-1a-i** (i + ii + digest + dédup-cœur + oracle + spike + fenêtre récente + **pliage G2**) à **1 017 lignes** (R-25 mesuré après pliage, < 1 205). **T-1a-ii** = (iii) dénominateur ADV [2nd] Polygon + (iv) supply/PoR (staleness + taux wrapper) + jambe swap Ethereum/Ondo (events Uniswap) + entrypoint collecteur ; tests `bell_por_staleness_and_wrapper_rate` + `bell_volume_dedup_by_signature` (cœur dédup déjà livré en rpc.ts).
3. **Ondo GM API auth-gated** (`api.gm.ondo.finance/v1/assets/all/addresses` → 403) : **procurement PR-B-ONDO** (clé) pour l'univers complet (100+/430+ actifs) et les adresses autoritatives ; TSLAon résolu via GeckoTerminal + confirmation on-chain. **(O-2 plié : PR-B-ONDO enregistré à la table procurement de l'ADR-B0.)**
4. **Item (g) ADR** : census univers complet (839 xStocks + 395 Ondo) + source MWCB (cond. H) — hors portée T-1a livrée ; item formé. Le recensé-15 + reproduction parseur sont faits.
5. **Conflation de dimensionnement ADR** : le « Ondo 837,9 M$ » des Sources est le total Ondo (bons du Trésor USDY/OUSG), **≠** les actions tokenisées Ondo (lancées 2025-09-03, > 1 Md$ 2026-07). Le « ≈ 47 % du périmètre » à revoir — **niveau ADR**, pas code T-1a.
6. **Graphies ETF — RÉSOLU (O-4 plié)** : l'ADR D2 ii disait « ETF-composant ×6 graphies » ; **corrigé en ×5** (18 graphies au total) dans l'ADR + note `reason-canon.ts`. Carte fermée sur les 18 chaînes exactes mesurées (doc 03 : la mesure prime).
7. **Solana version-1** : `maxSupportedTransactionVersion` doit être ≥ 1 (mesuré : mainnet-beta ET publicnode rendent `version:1` et rejettent 0) — constante `MAX_TX_VERSION=2` committée ; bump = ligne ADR.

## §8 — G2 pliée (2026-09-19, `error_origin` assignés)

Revue `docs/G2-lot-t1a.md` (**APPROUVÉ-AVEC-CORRECTIONS**) pliée par le worker `claude-opus-4-8[1m]`, effort max ; **aucun commit** (R-20). Chaque correction fermée = un tueur nommé + son mutant **rejoué rouge** puis **restauré byte-identique** (sha256 §1). Oracle après pliage : `npm run ci` **307/307**, `tsc` 0, `lint` propre, `lint:ratchet` 69/69, `lang:gate`/`export:check` OK, `gate:vocab` 149 fichiers.

| # | Fichier | Correction | Tueur | Mutant rejoué (rouge) — message exact | `error_origin` |
|---|---|---|---|---|---|
| C-1 | `sessions.ts` | ancre hors-bourse = dernier jour de bourse (marche arrière fériés + week-ends) ; `regime = gapRegime(ancre)` | `bell_anchor_skips_holidays_and_weekends` | marche sans saut des fériés ⇒ sam 07-04 ancré 07-03 : `actual '2026-07-03', expected '2026-07-02'` | générateur |
| C-2 | `digest.ts` (l.20) | invariance d'ordre des clés gardée par un test | `bell_canonical_key_order_invariant` | `.sort()` retiré ⇒ `canonical` diverge (tue le survivant `e` de la G2) | générateur (oracle) |
| C-3 | `digest.ts` (`CLOSE_KEY`) | regex élargie `/close\|ref[_]?price\|p[_]?ref\|reference\|\bprev\b/i` (camelCase + `prev`, hors `prev_line_hash`) | `bell_close_guard_catches_camelcase` | regex rétrécie ⇒ `refPrice` ne lève plus : `Missing expected exception` | générateur |
| C-4 | `gap.ts` (`sessionGap`) | volume nul ⇒ abstention (`abstain`, aucun `gT`) ; `closeRef ≤ 0` lève ; digest accepte | `bell_zero_volume_abstains_never_zero_gap` | `gT="0.0000000000"` réintroduit ⇒ `"gT" in g` vrai : `actual false, expected true` | générateur |
| C-5 | G1 §4 | R-25 = valeur mesurée par la **commande exacte de la gate** (fixture bell comptée, non exclue) = **1 017** | (métrique) | n/a | générateur / planificateur |
| C-6 | G1 §5 | « concordantes » retiré ; n=52/55 expliqué ; bornes UTC non épinglées → course fondatrice | (mesure) | n/a | générateur |
| C-7 | `halts.ts` (l.83) | `before` borné par `>= haltUtcMs` ; fenêtre vide ⇒ `no_fill_in_window` seul | `bell_halt_last_before_resume_excludes_pre_halt` | borne retirée ⇒ fill pré-halt rendu « dernier avant Resume » : `actual 1785527572000, expected null` | générateur |

**Observations pliées côté worker (périmètre autorisé)** : **O-4** (ADR D2 ii « ×6 » → « ×5 graphies, 18 au total » + note `reason-canon.ts`) ; **O-2** (PR-B-ONDO à la table procurement ADR) ; **O-7** (test `bell_csv_parses_quoted_names_and_dst_rows` ajouté à §2). **Hors périmètre worker** (orchestrateur) : O-1, O-3, O-5, O-6, O-8 et les items de Décision 19 non couverts ici.
