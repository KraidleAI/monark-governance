# ADR-B0 — Programme MONARK Bell : témoin public attesté des actions tokenisées + classe conforme d'écart hors séance

- **Statut** : **PROPOSÉ (G0)** — **checkpoint-1 orchestrateur `claude-fable-5-1` : APPROUVÉ-AVEC-CORRECTIONS C-1..C-16 + ESC-1 (tranchée, option c, 2026-09-19) / ESC-2 (tranchée, option a, 2026-09-19), pliées ci-dessous** ; rédaction worker `claude-opus-4-8[1m]` effort max ; G2 fraîche ≠ générateur ; vérif adversariale (R-21) ; **approbation du PLAN par le validateur-humain AVANT tout code** (AgileGates). Aucun code, aucun contrat gelé, aucun commit par cet ADR (diff 0 octet `schemas`/`packages/contracts`).
- **Dates** : décision 2026-09-19 · checkpoint-1 2026-09-19 · dernière modification 2026-09-19.
- **Propriétaire de la décision** : investisseur (cible D1 verbatim ; nom « **MONARK Bell** » D8 ; lettre SEC après T-1 D3 ; plan inchangé D7 ; « full fini, grade institutionnel, VPS propre, avec son GTM » ; **décision 11 : capteur `FLEET_AGENTS` upcoming en T-1/T-2 → produit `PRODUCTS` à la Définition de fini, par amendement M004 D14**). Exécution : orchestrateur `claude-fable-5-1`.
- **Gate concerné** : G0 → G1/G2/G7 + checkpoints 1/2 par lot ; déploiement **VPS dédié** (addendum ADR-M005 D12) ; surfaces publiques (ADR-M010).
- **Éléments affectés** : **nouveau** `apps/bell/` (hors outil, calque `apps/sentinel/`, scan K-8 intact ; `src/pools.ts`, `scripts/export-public.mjs`) ; **VPS dédié Bell** (`bell.monarkgate.tech`, clé Ed25519) ; `apps/site/lib/fleet.ts` (registre, W-1) ; page `/bell/` + `/bell/method` (designer) ; `docs/RUNBOOK-bell.md` ; à T-3 : `apps/harness/src/tools/gate.ts`, `attestation-binding.ts`, re-pin h5. **Rattache** : ADR-M004 D14 (invariant registre + exemption noms tiers), ADR-M012 (motif Narabi), ADR-M016 (nommage + addendum `-24h`), ADR-M017/M019 (`attested`), ADR-M018 (branchement), ADR-M020 (sérialisation harness). **error_origin** : n/a (programme).

## Contexte (mesuré, sourcé)

1. **Vague datée** : SEC 34-106402 (2026-09-17 → 2031-09-17), régime **auto-déclaratif** (aucun tiers exigé), conditions **F** (75 sym / 0,25 % ADV ; 250 / 2,5 %), **G** (données publiques, machine-readable, ≤ 10 min, 30 j), **H** (arrêt concurrent, « concurrently », sans tolérance), **E** (« verify » mêmes droits), **J** (pas de levier/emprunt) — L7 [lu]. TSV **pas encore en production** ; lancement « mid to late October » 2026 (R3 §2.4 [lu][P2]).
2. **Un seul empirique primaire** : Cong 2025 (L6 [lu], Table 4, Tesla vs dernier close) — >1 % : 71 % overnight-semaine / 15 % week-end ; >2 % : 57 / 8 ; >5 % : 12 / 0 ; token **mène** l'ouverture (Table 10 : 0,903, t 22,1, N 1 913, R² 0,839). Second : Scharnowski 2026 (L8 [lu], FTX défunt, non reproductible) — **27 % du volume marché fermé** ; écart absolu moyen 0,78 % / médiane 0,25 % / P95 3,63 % ; +0,391 pp (pre) / +0,451 pp (after). **Convention de prix de référence en fermeture non spécifiée** (L8) ⇒ Bell fixe la sienne (D2).
3. **Oracles avouent le trou** : Chainlink « report the last onchain value published before the market closed », « do not publish updates … while markets are closed » (R3 §1.1 [lu][P1]) ; Pyth 24/5 ; « ghost prices » week-end ; PoR = relais du custodian, pas audit (R3 §6 [lu][P2]).
4. **Marché** : ≈ **2,91 Md$** (RWA.xyz 2026-09-19, R1 §2.1 [lu]) ; **périmètre v1 = xStocks (Solana Raydium/Jupiter + Ethereum) + Ondo (Ethereum)** — part de marché **retirée** le 2026-09-19 (amendement O-3 : « 837,9 M$ » = USDY/OUSG, pas Ondo Global Markets ; ancienne formule « (837,9 + 541,2) / 2 910 ≈ 47 % » non fondée ; recomputée au census g1). Le « 95 % » est le chiffre **Cong oct. 2025** (cap. 420 M$, ≠ aujourd'hui). **bStocks (Binance) ≈ 26 %, HORS périmètre v1** (item formé). CEX dominent le volume (R1 §1.1). Aucun acheteur démontré.
5. **Fait dirimant [lu, first-hand]** — CSV NYSE (73 431 lignes, 2019-02-22 → 2026-09-18) : sur **15 grands caps recensés** (10 xStocks 24/7 [lu-WF] TSLA/QQQ/SPY/NVDA/CRCL/AAPL/HOOD/MSTR/GLD/GOOGL + 5 ajoutés GOOG/META/MSFT/AMZN/COIN), halts **depuis 2025-06-30 = 0** ; toute l'histoire = 8 (« LULD Pause », dernier 2025-06-05, **pré-lancement**). **Univers complet (839 xStocks [abs] + Ondo non établi première main, V-5) NON recensé** ⇒ census (`v3/reference/tickers` × listes émetteurs) = **item T-1a**. **MWCB** : le CSV **ne porte pas** les MWCB (message SIP distinct, `UtpBinaryOutputSpec` l.273 [lu] ; **0 ligne market-wide même en mars 2020**, 7 902 lignes toutes LULD/News) ⇒ **source MWCB (cond. H) = item T-1a**. Témoin de halt **vide sur le recensé** : valeur = position, pas mesure. Cohérent avec le signal *tue* PROPOSITIONS §6.
6. **Prérequis MONARK** : P1-b3 (M017/M019) → **W-1** (`wiring` dans `fleet.ts`) → M017(a) témoin vivant. Bell dépend de W-1 (M018) ; lots-harness sérialisés après U-4 (M020).

## Décision

### D1 — Objet et doctrine
**Bell = (A) témoin public attesté** (faits **recalculables, sans gate, sans score**) **et (B) classe conforme `tsv-offhours-gap-24h` en espace d'écart, jamais en prix** (contrat gelé : « The price number is NOT carried here »), verdict commit/defer/**abstain** par le bras `interval`. **Interdits opposables** (mutants `gate:vocab` sur `apps/bell`, D5) : bande de prix ; « ±X % à 90 % » ; score/probabilité par événement ; « verified » nu ; « guarantee » (→ « bound ») ; « partner »/« partnership » ; « live » (scope skills, M006) ; toute revendication de couverture sans écart de TV nul ; « signed » présenté comme « verified » (D8). Bell **mesure**, ne **trade** pas (produit 5 market making **écarté**, décision 2).

### D2 — Faits témoins v1 (lot T-1) : xStocks (Solana : fills Raydium/Jupiter) et Ondo (Ethereum)
Pools **déclarés dans un registre committé `apps/bell/src/pools.ts`** (par pool : adresse, chaîne, source [lu], sha ; item T-1a — C-7). Publiés `bell.monarkgate.tech/state.json` + `…/timeline.jsonl`, **JSONL append-only chaîné (`prev_line_hash`) et signé Ed25519** (motif Narabi M012 D4 ; réécriture **détectable, jamais certifiée** ; seul garant = recompute on-chain).

| # | Fait recalculable | Définition (numérateur recalculé de 1re main) | Résidus / honnêteté |
|---|---|---|---|
| i | **Écart de session** | `g_t = ln(P_token_VWAP_session / P_close_ref)` par session {régulier, pre, after, overnight-semaine, week-end, férié}. `P_token_VWAP` = VWAP des fills aux pools déclarés. `P_close_ref` = dernier close consolidé SIP via Polygon `v2/aggs/ticker/{T}/prev` + `…/range/1/day/…`, **forward-fill déclaré**. **Convention de Bell, déclarée** : la littérature ne la fixe pas (L8) ; LULD reconnaît le « prior day's official closing price » en référence *initiale* (l.748) et la Reference Price intraday = « arithmetic mean … over the immediately preceding five-minute period » (Section V, l.219-221 [lu]) — Bell **n'endosse ni l'une ni l'autre**, il déclare et rejoue. | Close Polygon = **redistribution** du close SIP ⇒ **[2nd]**, **entrée jamais publiée en clair** (ESC-1 c ; seul `g_t` est publié) ; `ex_date_effect` (token rebasant garde ≈ le prix à l'ex-date) ⇒ **abstention** ; bornes de session + **calendrier férié/demi-séance 13:00 ET** = **constante committée** à sourcer (Polygon market-status, item T-1a). |
| ii | **Delta de halt** | Pour chaque halt du CSV (toutes places ; à la **seconde** ; `Reason` via **carte fermée `REASON_CANON`** sur les **18 graphies mesurées** — LULD pause 61 747, News pending 10 210, Corporate Action 555, Merger Effective 320, Regulatory Concern 235, News Released 233, News dissemination 106, New Security Offering 11, Intraday-IIV ×2 graphies, ETF-component ×5 graphies (mesuré sur le CSV, 18 graphies au total) — normalisées en famille ; **toute graphie hors carte ⇒ `reason_unknown`**, jamais bucketée en silence) → **premier fill après `Halt Time`**, **dernier avant `Resume Time`**. Heures **ET sans fuseau** ⇒ **ET→UTC + DST**. Bloc ≠ soumission ⇒ résidu. | **n = 0 sur le recensé** (§5) : jamais un booléen « conforme » (« concurrently » sans tolérance, seuil côté lecteur). Résidus : `resume_unknown` (**4539** `NYSE Resume Time` vides, [lu]) ; `resume_date_gt_halt_date` ; `no_fill_in_window` ; `block_ts_vs_submission` ; `reason_unknown`. |
| iii | **Volume par pool vs plafond** | Numérateur = volume des pools déclarés recalculé des logs on-chain (**Jupiter = agrégateur ⇒ swaps au niveau des pools, dédupliqués par signature**). Dénominateur = **ADV consolidé mois précédent** (cond. F : « average daily **share** volume »). | Dénominateur Polygon = **[2nd]** ; jamais « le TSV est sous le plafond » ; **unité = actions**, token ≈ action **modulo multiplicateur** ⇒ résidu `multiplier_unit`. |
| iv | **Supply vs PoR relayé** | Supply on-chain (mints/burns), valeur PoR + **staleness** (âge `updatedAt`), écart, **taux des wrappers** (leçon Edel : ×78, oracle juste, ≈ 403 k$, R3 §4 [lu][P2]). | « S et Y diffèrent de X à t ; **Y n'est pas vérifiée contre le custodian** » ; votes = abstention déclarée. |

**Chemin servi T-1** : `state.json` + `timeline.jsonl` **lus par le panneau site `/bell/`** (motif Narabi). **Le triangle attest→gate n'existe PAS à T-1** : harnais pur (K-8), `attest` input-less (M017 D2 (iv)), BYO+`attested` **refusé (400)** sans ligne de `attestation-binding.ts` ⇒ le sujet-URL Bell **arrive à T-3** (+ re-pin h5), sous la sérialisation harness après U-4.

### D3 — T-2 (parité) et T-3 (classe d'écart)
- **T-2 — parité de droits** (D2 iv approfondi) : ex-dates/montants des corporate actions publiques ; **multiplicateur de rebase avant/après ex-date** (Token-2022 « scaled UI », rebase EVM) ; **surplus `balanceOf(pool)` vs réserves** (mécanisme décrit par Uniswap, R3 §2.3). Prérequis : lecture directe Uniswap « Token Integration Issues » + Token-2022 (procurement).
- **T-3 — classe `tsv-offhours-gap-24h`** : `g_t` (D2 i) ; curateur porte `yhat` (0 = « je tiens le dernier close ») ; scores `|g − ŷ|` ; bras `interval`. **`-24h` = cadence du close SIP quotidien, PAS la durée de session** (un week-end ≈ 63 h) ⇒ **addendum daté à ADR-M016** (déviation déclarée, C-14) ; **pas de suffixe « session »** ; le **régime** {overnight-semaine, week-end, férié} entre dans le **`predictor_id`** (`bell:session-gap-v1@<plateforme>/<symbole>/<régime>`), clé Mondrian, **jamais un suffixe d'horizon** (« copies d'horizon » interdites M016). Calibration = **statistique de la Table 4 de Cong appliquée aux données Bell** (digest committé, calque `STABLE_RUN_COMMITTED_CORE`). **Chiffres, α = 0,01** (`nMin = 1/α − 1 = 99`/cellule ; plus serré que Narabi α = 0,10, consommateur = curateur de liquidation) : xStocks ≈ **255 overnight ouvrées** (4 nuits × ≈ 63,7 sem − fériés) et ≈ **63 week-ends**/symbole → week-end **`under_calib`** jusqu'à +36 ≈ **mi-2027** ; fériés n ≈ 12 (`under_calib`). **Comptes sur date de lancement rapportée [abs-WS] (2025-06-30) ⇒ compte réel = premier fill mesuré T-1a.** Population **TSV** ≠ xStocks ⇒ cellule TSV `under_calib` au lancement. **Abstentions mécaniques** : halt en cours, volume nul, dislocation cross-plateforme > seuil, dépôt EDGAR horodaté (à vérifier), `ex_date_effect`. **Phrase Barber 2023 Thm 2** : « n sessions, k/n dépassements ; 1−α n'est la couverture que si l'écart de TV token est nul, non supposé ; aucune couverture n'est mesurée ». **α = 0,01 ratifiable au G0 de T-3.**

### D4 — Tuyaux (M018 D3), tests et registre
| Tuyau (lot) | Entrée | Sortie (consomme) | État | Test d'intégration non-LLM (nommé) |
|---|---|---|---|---|
| collecte→digest (T-1a) | `apps/bell` : Polygon + RPC (pools de `pools.ts`) | digest + `state.json` signé | JSONL chaîné+signé | **`bell_session_gap_identical_to_replay`** (rejeu bit-identique) ; **`bell_volume_dedup_by_signature`** (iii) ; **`bell_por_staleness_and_wrapper_rate`** (iv) |
| publication→panneau (T-1b) | `state.json`+`timeline.jsonl` (VPS dédié) | **panneau site `/bell/`** | fichiers statiques (Caddy propre) | **`bell_panel_reads_published_state`** |
| parité→timeline (T-2) | logs rebase/`balanceOf` + corporate actions | `timeline.jsonl`, panneau | JSONL | **`bell_parity_surplus_matches_recompute`** |
| Prediction→gate (T-3) | adaptateur `fromSessionGap` (curateur porte `yhat`) | `gate` classe committée | calibration / `under_calib` | **anti-vacuité** (ŷ varié ⇒ décision varie) ; « cellule non calibrée ⇒ `under_calib` » ; **h5 re-pin** |

**Registre `fleet.ts` (décision 11)** : le témoin est inscrit **agent-capteur `FLEET_AGENTS`** — nom budō **« Kane »** (鐘, distinct du nom produit public « MONARK Bell » ; à confirmer T-1b), statut **`upcoming`** en T-1/T-2. À la **Définition de fini (D8)**, « MONARK Bell » devient **produit `PRODUCTS` `built`** — ce qui **exige d'amender M004 D14** (invariant « aucun des 5 produits n'est bâti », ADR investisseur). **À T-1b** : ajout de « Kane » `upcoming` ⇒ re-pin `fleet_register_built_set_is_frozen` (built inchangé {Shōgen,Hikae,Ukemi,Narabi}) + **`upcomingCount` 12 → 13** + « seven → **eight** on the roadmap » ; **ADR-W1 « sans changer aucun compte » cesse d'être vrai** (dit tel quel). `fn` générique, sans chiffre (numeric-hole scan) ; `ProductWiring{sensor,gate,act}` exige un **act** (à T-3). `wiring{served_by, integration_test}` (W-1) ≠ `ProductWiring`.

### D5 — Oracles / mutants (gain de correction dominant = oracle non-LLM)
Rejeu **bit-identique** du digest. Mutants nommés, **rouge attendu** : **halt décalé d'une seconde** ⇒ `delta ≠` ; **close changé** ⇒ `écart ≠` ; **fuseau faux (DST)** ⇒ rouge — **fixture = deux lignes réelles datées du CSV** : `2026-02-27 16:26:29 ASND (Nasdaq, News pending) → 18:20:00` (**EST**) et `2026-07-31 15:52:53 INHD (Nasdaq, LULD Pause) → 16:00:00` (**EDT**) ; l'univers 24/7 étant vide de halts, la jambe on-chain du delta utilise une **fixture de fills épinglée** ; **casse de `Reason` non normalisée ou graphie hors carte** ⇒ compte faux ⇒ rouge ; **dédup Jupiter absente** ⇒ double compte ⇒ rouge ; **`updatedAt` décalé** ⇒ staleness ≠ ; **taux wrapper ≠** ⇒ rouge ; **signature retirée / « signed » = « verified »** ⇒ rouge ; `attested` discordant (T-3) ⇒ **400** (M017 D4) ; **champ `close` numérique dans `/bell/*.json`** ⇒ rouge (garde de trou numérique étendue, ESC-1 c). `gate:vocab` étendu à `apps/bell`.

### D6 — Données, coûts, dépendances (R-8)
- **Polygon.io Starter** : **abonnement à ouvrir** (compte + coût, vérification registre R-8 avant usage — item PR-B-3/C-19) ; clé env **`POLYGON_API_KEY`** (Bearer), **jamais écrite** (`no_secret_in_repo`) ; endpoints `…/prev`, `…/range/1/day/…`, `v3/reference/tickers`. Licence « **Individual Use** » ⇒ **ESC-1 tranchée (c), décision investisseur 2026-09-19 : le close n'apparaît verbatim dans AUCUN fichier publié ni digest en clair** (seul `g_t` est publié) ; avis écrit Polygon = item **non bloquant** (le prix de clôture est un **fait public**, distinct du **flux** licencié). `adjusted` (splits seuls vs +dividendes) à vérifier + **fixture réelle épinglée** (T-1a) ; convention : `prev` **non ajusté** + abstention `ex_date_effect`.
- **RPC Solana/Ethereum publics** : **spike de profondeur `getSignaturesForAddress` AVANT T-1a** (C-1) ; **si insuffisant pour l'historique jul-oct 2025, un fournisseur archive (Helius, clé env `HELIUS_API_KEY`) devient prérequis EXPLICITE de T-1a** (l'investisseur prend l'abonnement, ≈ 50 $/mois [abs] à confirmer). **Pas de contradiction : le fait fondateur (D2 i) est en T-1a, donc l'archive aussi si l'élagage l'impose.**
- **Pyth Hermes** (clé gratuite) = **comparaison**, jamais référence.

### D7 — Lots, séquencement, R-25, topologie
| Lot | Sortie (R-25, PR unitaire) | Topologie (C-15) | Dépendance |
|---|---|---|---|
| **T-1a** | `apps/bell` : `pools.ts` + collecte (i-iv) + digest signé + oracles + **mesure fondatrice** (statistique Table 4 sur données Bell : TSLAx Solana jul-oct 2025 ; **écart à Cong = constat publié, jamais vert/rouge**, C-3) | **mono-agent + oracle déterministe** (rejeu bit-identique) | W-1 clos ; spike RPC / Helius |
| **T-1b** | déploiement **VPS dédié** + publication `bell.monarkgate.tech` + panneau + registre (D4) | mono-agent + G2 fraîche | après T-1a ; lettre SEC 4-927 **sous go** (décision 3) |
| **T-2** | parité (rebase/surplus) + lecture Uniswap/Token-2022 | **fan-out justifié par isolation** (code recorder ∥ données corporate actions) | après T-1 |
| **T-3** | classe `tsv-offhours-gap-24h` : bras `gate` + calibration + `attestation-binding.ts` + re-pin h5 + anti-vacuité | mono-agent (harnais) | **sérialisé après U-4** (M020) |

**Option Stocklana** (hackathon Solana, dépôt 2026-09-25) : **plan inchangé** (décision 7) ; adaptation = décision investisseur ultérieure.

### D8 — VPS dédié, clé, Définition de fini (grade institutionnel)
**VPS dédié dès T-1**, hôte **séparé** — motif : **indépendance du témoin** devant un examinateur SEC/curateur. Spéc. min. ≈ **2 vCPU / 4 Go / ≥ 40 Go** (**ordre de grandeur ≈ 5-15 $/mois**, classe Hetzner/OVH/DO, **fournisseur au choix investisseur**, à confirmer) ; **NTP propre** ; **Caddy propre** servant **`bell.monarkgate.tech`** — choisi contre le reverse-proxy `/bell/` via le VPS site (qui **annulerait l'indépendance** ; record DNS = action sortante sous go). **Panneau `/bell/`** : le ban des noms tiers (`apps/site`, F-2c C-4) reçoit une **exemption scopée `/bell/`** sous cadrage rendu obligatoire **« facts witnessed — no endorsement, no partnership »** + **mutant** (retrait du cadrage ou élargissement ⇒ rouge, C-16).
**Clé Ed25519** : chaque ligne signée en plus du hash-chaînage. **Honnêteté load-bearing** : la signature atteste **l'origine** (« ce VPS a publié cette ligne »), **jamais la vérité des faits** (seul garant = recompute on-chain, M012 D4) ; « signed » ≠ « verified » (mutant D5). **Gestion de clé (C-11)** : clé **publique** publiée à `/bell/pubkey` + **committée** + citée sur `/bell/method` ; **détenteur de la privée = opérateur du VPS (ESC-2)** ; **rotation/compromission** et **sauvegarde de la timeline** documentées dans **`docs/RUNBOOK-bell.md`** (calque `RUNBOOK-sentinel.md`) ; test **`bell_no_secret_in_repo`**.

**Définition de fini** (critères **vérifiables non-LLM** ; `built` conditionné à leur atteinte, **atteignable au plus tôt après T-2** car E n'est testé qu'en T-2, C-9) :
| Critère | Test non-LLM |
|---|---|
| **Recalculable par un tiers disposant d'une licence de close** (ESC-1 c : Bell publie l'**écart seul** ; close jamais republié ; aucun engagement/hash du close — inutile, le close est dérivable de `g_t` + VWAP token public) | `bell_session_gap_identical_to_replay` (jambe token publique bit-identique) |
| Timelines **chaînées + signées Ed25519** | vérif chaîne + vérif signature hors-ligne (clé publique publiée) |
| Disponibilité | **sonde externe indépendante, intervalle nommé** ; **latence de publication ≤ 10 min** (cible, alignée cond. G) sur flux TSV ; **uptime = fait publié** (sans cible dure au départ, déclaré, C-10) |
| Couverture ordre : **G** transparence, **H** halt, **F** plafonds, **E** parité (**T-2**) | un test par exigence (D2 i-iv + delta + volume). **Cond. J (levier) : aucun fait on-chain mesurable par Bell ⇒ HORS couverture, dit tel quel** (C-9) ; « pas de synthétique » = partiel via (iv), Y non vérifiée |
| Abstentions **comptées et publiées** | compteur `state.json` ; non-régression |
| Provenance + **page de méthode publique** | `docs/PROVENANCE-bell.md` + `/bell/method` |
| **Zéro** « verified/guarantee/score » ; **export public gaté** | `gate:vocab` sur `apps/bell` + **liste blanche `apps/bell/scripts/export-public.mjs`** (calque test 42, C-12) |

### D9 — GTM (annonce de l'objet ; le GTM = lot séparé)
**Cibles nommées par l'étude** : curateurs **Gauntlet** (Ondo/Morpho), **Steakhouse**, **Kamino** (via `gate` depuis leur simulateur de liquidation) ; **TSV candidats** (Notice item i) ; **examinateurs SEC** ; **presse** ; **dossier File 4-927** (Q3/Q6/Q10). **Signaux de demande pré-enregistrés** (PROPOSITIONS §6) : lettre 4-927 réclamant une mesure indépendante ; curateur demandant un état hors séance avec abstention ; premier TSV publiant son flux G. **Renvoi** : `docs/GTM-BELL.md` **à produire par advisor-marché + chercheur** (lot séparé) — l'ADR **annonce l'objet**, ne rédige pas le GTM.

## Modes d'échec MAST (checklist de risque résiduel)
| Mode | Menace | Contre-mesure |
|---|---|---|
| Dérive de spécification | « bande de prix », « verified », « guarantee », « partner » | D1 + `gate:vocab` sur `apps/bell` (mutant) |
| Vérification incorrecte | sha avec horodatage ; casse/graphie `Reason` ; **signature = certification** | digest sans horodatage ; carte fermée + `reason_unknown` (D2 ii) ; D8 (origine ≠ vérité) + mutant D5 |
| Surclaim de couverture | « couverture = 1−α » sans TV nul ; halt présenté peuplé ; **J revendiqué** | Barber Thm 2 ; **n = 0 écrit** ; **J hors couverture** (C-9) |
| Terminaison prématurée | « Bell built » avant la Définition de fini (pas au seul test) | registre `upcoming` jusqu'à D8 ; **CA-11** au checkpoint-2 |
| Perte d'information inter-agents | [abs-WS]/[lu-WF] remonté en [lu] | niveaux figés (Sources) ; charge sur [lu] seul |
| Absence de clarification | α/horizon/registre/close non écrits | D3 (α, `-24h` addendum) ; décision 11 ; ESC-1 |

## Alternatives rejetées
- **Rebâtir un prix 24/5 / refaire le PoR / curation de risque (LTV)** : hors doctrine — rejeté (§6).
- **Market making (produit 5)** : dealer/« Covered Firm », changement d'identité — **écarté** (décision 2).
- **`attest` sujet de Bell à T-1** : harnais pur, `attest` input-less (M017 D2 iv) — **reporté à T-3**.
- **Reverse-proxy `/bell/` via le VPS site** : annule l'indépendance — **VPS dédié + sous-domaine** (D8).
- **Ancrage on-chain des timelines** : clé chaude + gaz (M012) — **signature Ed25519 hors-chaîne** (origine, pas certification).
- **Booléen « conforme au halt »** ; **régime en suffixe d'horizon** ; **score / « ±X % à 90 % » / bande de prix** — rejetés (fait ≠ verdict ; M016 ; doctrine).

## Conséquences
- **Positives** : premier témoin tiers **recalculable et signé** quand les TSV démarrent (valeur de position) ; **indépendance de l'hôte** ; classe d'écart distribution-free inédite ; faits opposables au dossier 4-927 ; aucun contrat gelé touché avant T-3.
- **Négatives (assumées)** : **témoin de halt vide (n = 0 sur le recensé)** ; week-end/férié `under_calib` ≈ jusqu'à mi-2027 ; **acheteur non démontré** ; **bStocks (≈ 26 %) hors v1** ; **cond. J non couverte** ; dépendance Polygon (Individual Use, ESC-1) + Helius (coût) ; T-3 sérialisé après U-4 ; **VPS + clé Ed25519** = surface opérationnelle (hôte, NTP, clé, ESC-2) et coût récurrent.
- **Items formés (déclencheurs)** : (a) avis licence Polygon (ESC-1 c, **non bloquant**) ; (b) spike RPC → Helius prereq T-1a si élagué ; (c) `attestation-binding.ts` + re-pin h5 à T-3 ; (d) re-pin `fleet_register_built_set_is_frozen` + `upcomingCount` 12→13 à T-1b ; (e) bornes de session + calendrier férié committés T-1a ; (f) **VPS + clé Ed25519 + DNS `bell.monarkgate.tech`** = actions sortantes sous go ; (g) census complet + source MWCB — **re-formé au G2 de T-1a (O-1)** : (g1) census complet xStocks + Ondo — univers Ondo non établi première main (« 395 » [abs] retiré) [déclencheur : PR-B-ONDO résolu + Polygon `v3/reference/tickers`, lot T-1a-ii] ; (g2) flux MWCB (condition H) [déclencheur : procurement **PR-B-8** (table ci-dessous) — le CSV NYSE porte 0 ligne market-wide, `UtpBinaryOutputSpec` l.273] ; les deux **bloquants avant la release Bell** (décision 19) ; (h) `docs/GTM-BELL.md` (advisor-marché + chercheur) ; (i) amendement **M004 D14** à la Définition de fini (décision 11) ; (j) addendum daté **M016** pour `-24h` ; (k) `apps/bell/src/pools.ts` committé (C-7) ; (l) `docs/RUNBOOK-bell.md` + test `bell_no_secret_in_repo` (C-11).

## Sources
- **[lu]** L6 Cong 2025 (Table 4/10) ; L7 SEC 34-106402 (E/F/G/H/J, p.22-32 ; IAC) ; L8 Scharnowski 2026 (Tab. 7/8 ; convention non spécifiée p.25). **[lu][P1]** R3 §1.1 oracles ; §2.3 Uniswap ; §2.4 SEC ; §6 PoR. **[lu]** R1 §2.1 RWA.xyz (Ondo 837,9 + xStocks 541,2 + bStocks 753,9 / 2 910) ; §2.3 ESMA. **[lu, first-hand]** CSV halts (73 431 lignes ; recensé depuis 2025-06-30 = 0 ; MWCB non porté, 0 en mars 2020 ; 4539 resume vides ; 18 graphies `Reason` ; fixtures DST ASND 2026-02-27 / INHD 2026-07-31) ; LULD 23e amendement (Section V l.219-221 ; tiers l.246-268 ; l.748) ; CTS Pillar (codes A/C/E/F/N/O/V ; MWCB 15 min) ; UTP Binary (MWCB message distinct l.273 ; fenêtre 21:00 ET dim → 20:00 ET ven). Hashes : `sources-T1/SOURCES-sha256.txt`.
- **[abs]/[abs-WS]** : lancement xStocks 2025-06-30 (R1 §1.1) ; Helius ≈ 50 $/mois ; VPS ≈ 5-15 $/mois ; ADV via Polygon = **[2nd]**.
- Code : ADR-M004 D14, ADR-M012 D4 (`apps/sentinel/src/timeline.ts`), ADR-M016, ADR-M017 D2/D4, ADR-M018 D1-D3, ADR-M020 D3/D4, `apps/site/lib/fleet.ts`.

## Procurement (format Dettes)
| Id | Document / ressource | Identité / tentatives | Usage |
|---|---|---|---|
| PR-B-1 | Scharnowski 2026 | JIFMIM 110:102355, DOI 10.1016/j.intfin.2026.102355 — **REÇU [lu]** (L8, sha `6497b7e0…`) | second empirique |
| PR-B-2 | Clé **Pyth Hermes** (gratuite) | à obtenir | comparaison D6 |
| PR-B-3 | **Abonnement Polygon Starter** + avis licence « Individual Use » | compte + coût à ouvrir (R-8) ; avis **non bloquant** (ESC-1 c, close jamais republié) | close SIP D2/D6 |
| PR-B-4 | Specs SIP CTS/UTP/UTDF + LULD 23e | **REÇUES [lu]** (`sources-T1/`, hashées) | fait (ii), sessions |
| PR-B-5 | **Helius/Triton** (archive Solana) + clé env `HELIUS_API_KEY` | grille à relever (≈ 50 $/mois [abs]) ; **prereq T-1a si RPC public élagué** | historique jul-oct 2025 |
| PR-B-6 | Uniswap « Token Integration Issues » + Token-2022 scaled UI | lecture directe due à **T-2** ([abs-WS] aujourd'hui) | parité D3 |
| PR-B-7 | **VPS dédié** (grille fournisseur) | ≈ 5-15 $/mois [abs] à confirmer | D8 |
| PR-B-ONDO | **Clé API Ondo Global Markets** (`api.gm.ondo.finance/v1/assets/all/addresses`) | **403 mesuré** (auth-gated, 2026-09-19) ; en attendant, TSLAon résolu via GeckoTerminal + confirmation on-chain (`pools.ts`) | univers Ondo (395) + supply (D2 iv) |
| PR-B-8 | **Flux MWCB (market-wide circuit breaker status)** — message SIP CTS/UTP « Market-Wide Circuit Breaker Decline Level / Status » (UtpBinaryOutputSpec l.273 ; CTS spec équivalente) ; le CSV NYSE `trade-halts` ne porte **0** ligne market-wide (mesuré) | tentatives : CSV NYSE (0), pages NYSE/Nasdaq MWCB (historique 2020-03 seulement, [abs]) ; à procurer : feed SIP ou archive tierce (Polygon `v2/…/status`, Nasdaq Data Link) | condition H (halts concurrents), item (g2), **bloquant release** |

---
**Reste à trancher (escalades investisseur)**
- **ESC-1 (publication du close) — TRANCHÉE : option (c), décision investisseur 2026-09-19** : « Bell publie l'écart seul ; le close de référence reste une entrée **non republiée** ; un tiers rejoue avec sa propre licence de données. » **Aucun engagement/hash salé du close n'est publié** — choix justifié : le prix de clôture est un **fait public recalculable** depuis `g_t` publié + le VWAP token on-chain (public), donc un commitment ne protège rien et un hash à sel public serait **énumérable** (faible entropie d'un prix) ; la tamper-evidence de `g_t` est déjà portée par la chaîne signée Ed25519. Ce que la licence protège = **le flux Polygon reproduit verbatim**, garanti par le mutant « champ `close` numérique ⇒ rouge » (D5). DoD = **recalculable par un tiers disposant d'une licence de close** (D8). Avis écrit Polygon = item formé **non bloquant**.
- **ESC-2 (indépendance opérateur du VPS) — TRANCHÉE par l'investisseur le 2026-09-19 (décision 14) : option (a)** — l'orchestrateur déploie en SSH (déploiement/rotation de clé automatisés, calque sentinelle) ; indépendance = hôte séparé + clé Ed25519 séparée, **dit tel quel sur `/bell/method`** (« operated and deployed by the MONARK orchestrator on a dedicated host; the signing key never leaves that host ») ; option (b) (investisseur seul détenteur) réexaminée à la Définition de fini.
- **Décidé (à entériner)** : décision 11 (registre capteur `Kane` upcoming → produit à la DoD, amende M004 D14) ; `-24h` = addendum daté M016 ; C-1 = spike RPC + Helius prereq T-1a.

## Amendement orchestrateur (2026-09-19, après revue advisor-marché du GTM)
- **Lettre de commentaire SEC File 4-927 (D9 / GTM (b))** : la sollicitation (L7, p.56-58) **ne pose aucune question sur les halts ni sur un audit indépendant** ; la lettre s'ancre sur **Q3** (impact du trading nocturne et du reporting ≤ 10 min sur l'ouverture/clôture — la statistique de Cong rejouée sur données Bell) et **Q6** (plafonds ADV — volume par pool mesuré), jamais sur les halts ; toute mention « Q3/Q6/Q10 demandent ces mesures » est ramenée à « Q3 et Q6 portent sur des grandeurs que Bell mesure ». `error_origin` : planificateur (sur-lecture).
- **Réplique incumbent la plus dangereuse** (advisor-marché) : un TSV auto-publie fills/halts/corporate actions en machine-readable (cond. G + remède Ross) et Chainlink/Pyth republient l'écart hors séance comme feed dérivé gratuit → la valeur résiduelle de Bell = indépendance + rejeu bit-identique + abstention ; signal « tue » de D9 élargi en conséquence.
- Nom budō du capteur : « Kane » **proposé**, collision à vérifier avant T-1b.

## Amendement orchestrateur (2026-09-19, après G2 du lot T-1a, gel `8e5752a` — O-1/O-3/O-5)
- **O-3 — dimensionnement Ondo (Contexte §4)** : le « 837,9 M$ » attribué à Ondo est le total **USDY/OUSG (bons du Trésor)**, pas les actions tokenisées Ondo Global Markets (lancées 2025-09-03, univers Ondo GM **non établi première main** — API 403, PR-B-ONDO ; les chiffres « 395 » et « 100+/430+ » vus dans les pièces sont de seconde main [abs] et ne sont pas retenus). Le « ≈ 47 % périmètre v1 » est donc **non fondé** et **retiré** ; il sera recomputé au census (g1) avec la part Ondo GM seule. Aucun chiffre de part de marché n'est publié d'ici là. `error_origin` planificateur.
- **O-5 — portée réelle de T-1a vs ligne D7** : T-1a livré (`8e5752a` + pliage G2) = spike RPC + registre `pools.ts` + faits (i) écart de session et (ii) delta de halt + digest canonique **non signé** (`bell_sha` = hash de recompute ; la clé Ed25519 vit sur le VPS à T-1b, D8) + dédup + oracle, **sans mesure fondatrice** (rejeu 15 mois impossible en RPC public : Helius prérequis, C-1). La ligne D7 « collecte (i-iv) + digest signé + mesure fondatrice » est **scindée** : **T-1a-i** (livré) ; **T-1a-ii** = (iii) volume/ADV [2nd → première main via Polygon] + (iv) supply/PoR + jambe swap Ethereum/Ondo + entrypoint collecteur + abstention volume-nul déjà branchée ; **mesure fondatrice** = course Helius (déclencheur `HELIUS_API_KEY`) avec bornes `[fromUtc, toUtc]` épinglées en provenance (G2 C-6). Tension D7 « signé » / D8 « clé sur VPS » tranchée : la signature est un fait de T-1b, le digest de T-1a est recalculable sans clé. À entériner au checkpoint-2 de T-1a.
- **O-6 — provenance du spike §0** : les sondes RPC (endpoints, codes HTTP, profondeurs, débit) sont rapportées par le worker sans réponses brutes committées ; item formé : committer le harnais de sonde ou les réponses brutes dans `apps/bell/test/fixtures/spike/` avant la course fondatrice (propriétaire orchestrateur).
- **R-25-séries (C-4 du lot R-25, re-formé au checkpoint-2 V-6)** : `halts-reduced.csv` est une fixture **écrite à la main** (ligne `ZZZZ` fabriquée pour le mutant de graphie) ⇒ matériau de test, **compté** par D9 sexies (b) — la racine `apps/bell/test/fixtures` n'est PAS à exclure. L'exclusion est réservée à un sous-dossier de séries épinglées réelles (ex. `apps/bell/test/fixtures/spike/` pour les réponses RPC brutes O-6, ou les séries Polygon de la course fondatrice) avec `PROVENANCE-*.md` same-dir, racine ajoutée à `SERIES_EXCLUDED_ROOTS` + 3 pathspecs `ci.yml` **au lot qui les committe** ; D7 `docs/PROVENANCE-bell.md` hors dossier est **remplacé** par la règle same-dir.
- **V-7 (checkpoint-2 T-1a)** — `sessionGap` lève sur `closeRef ≤ 0` (fonction pure, jamais un 0/−∞ fabriqué) ; D8 exige des abstentions **comptées et publiées** : l'entrypoint collecteur (T-1a-ii) mappe ce cas en résidu nommé **`no_close_ref`** (ajouté à la liste des résidus D2 i), jamais une chute du digest entier. Déclencheur T-1a-ii.
- **V-1 (checkpoint-2 T-1a)** — le workspace `apps/bell` était absent de `package-lock.json` : `npm ci` (job CI G3) échouait sur le gel, non vu par le worker ni la G2 (oracle joué sans `npm ci` propre). Lock régénéré (+8 lignes) ; règle : tout lot qui ajoute un workspace rejoue `npm ci` sur `git archive` propre avant gel.

## Amendement orchestrateur/worker (2026-09-20, lot T-1a-ii-b1 — O-6 livré, C-4 tranchée, découvertes pivot)
- **O-6 provenance LIVRÉE** : le spike -b1 committe ses **mesures** (profondeur, coûts, formes d'erreur, dates de
  premier tx par pool, état rebase, méthode de découverte des vaults) sous `apps/bell/test/fixtures/series/spike/`
  (`spike-measures.json`, `spike-findings.json`, `PROVENANCE-spike.md`), **pas** `fixtures/spike/` (C-3 : sous la racine
  séries exclue R-25, PROVENANCE same-dir). Les **réponses RPC brutes ne sont PAS committées** (C-4, décision
  orchestrateur 2026-09-19 sur lecture CGU Helius 2026-04-24 / Chainstack juin 2026) : hors dépôt sha-pinnées
  (`F:\PRODUITS\etude-2026-09-19\bell-b1-spike\`). Paragraphe CGU collé en PROVENANCE. **O-6 clos pour la jambe Solana.**
- **Découverte pivot 1** : les pools Solana du census v3 (source -b1) **datent de 2026** (premier tx 2026-01/02/09 ;
  NVDAx 2025-07-02 mais 8 tx in-window) ⇒ 0 donnée dans la fenêtre fondatrice 2025-07→10. Les **mints** xStocks étaient
  actifs in-window (8000+ tx/mint) ⇒ le trading fondateur 2025 a eu lieu sur d'autres pools (découvrables on-chain ;
  PoC réussi : vault TSLAx fondateur `CY9Xzc1z…`, 5000+ tx in-window). ⇒ la source de pools de la course fondatrice
  doit être les **pools 2025 découverts**, pas le `pairAddress` du census.
- **Découverte pivot 2 (rebase)** : les xStocks portent un multiplicateur scaledUiAmount **mutable** (SPYx 1.0039,
  NVDAx 1.0009, AAPLx 1.0027 ; TSLAx 1 ; autorité PARTAGÉE `S7vYFF…`, 3000+ sigs in-window) ⇒ l'état historique du
  multiplicateur à la borne 2025-07-01 est **illisible** par `getAccountInfo` ⇒ la g_t fondatrice -b1 = `rebase_unverified`
  (C-6) ; la reconstruction de la trajectoire (SetMultiplier + effTs) est **-b3**. La g_t fondatrice dépend donc de -b3.
- **Escalade formée** (R-26, `docs/PLI-lot-t1a-ii-b1.md` CONSULTATION FORMÉE) : trois options costées (registre
  fondateur découvert / -b1 tel quel ≈ 0 session / décalage fenêtre 2025-11→2026-09). Aucune course lancée (budget
  préservé, ~90 appels Helius). Propriétaire : orchestrateur → investisseur/validateur. `error_origin` : planificateur
  (hypothèse D7/ADR-T1aii D1 « pools existaient jul-oct 2025 » falsifiée par mesure first-hand -b1).

## Amendement (2026-09-20, décision investisseur 47 + pli G2 -b1-2, worker `claude-opus-4-8[1m]`)
- **Décision 47 (option (a), variante SPLIT)** : escalade tranchée. Le registre fondateur Solana = **pools 2025
  découverts on-chain** (`founding_pool` ≠ `pairAddress` census). La **g_t fondatrice est déplacée APRÈS -b3** en
  nouveau sous-lot **-b1-bis** (découverte → registre fondateur → course rebase-aware). **-b1 (ce lot)** = corrections
  + spike + découverte (PoC) + décomptes + **abstention nommée**, aucune g_t. Ordre : `-b1 → -b3 → -b1-bis → -b2a →
  -b2b`. Variante **FUSION écartée** (C-2). Détail des tuyaux -b1-bis + des 8 corrections G2 + procurement
  **PR-B-SPL-TOKEN2022** : `docs/adr/ADR-T1aii…` **D1-ter** (font foi).
- **Pli G2 -b1-2 (résumé)** : C-G2-1 fail-open C-6 corrigé dans `main()` (`rebaseForMint` fail-closed ; `collect()`
  intact — repro + test + mutant) ; C-G2-2 effTs échus (past-dated, pas « future ») ; C-G2-3 `readMintToken2022`
  fail-closed + procurement ScaledUiAmount ; C-G2-4 garde close rapport ; C-G2-5 `coverage.ts` (C-5) ; C-G2-6 PoC
  recordée non-sha-backée + item -b1-bis ; C-G2-7 budget ETH/Massive → -b2b ; C-G2-8 hypothèse immuable énoncée.
  Oracles ciblés verts (49 tests bell, typecheck, lint/ratchet/lang/export, series_pinned, no_secret). Aucune g_t
  fondatrice produite. `error_origin` des corrections : rédacteur -b1 (C-G2-1/2/5) ; les autres = items formés.

## Amendement 2026-09-23 — fait (iii) aligné sur l'ordre SEC 34-106402 II.F (lot BELL-ADV-1 ; items I-v3-1, I-G2-1, I-G2-3)

**Objet.** D2 (iii) l.30 annonçait un « ADV consolidé mois précédent ». Le code de T-1a-ii calculait autre chose : un seul ratio par
symbole ; au numérateur, le volume total de la fenêtre de collecte ; au dénominateur, la moyenne des barres journalières d'une fenêtre
glissante de 45 jours calendaires se terminant à la fin de la collecte (`collect.ts` @ `d0535cb`, l.189-201 et l.383-392). Il abstenait
sans nom ni compteur (`ratio_computed:false`) et convertissait sur un multiplicateur « 1 » par défaut si le mint était illisible.
Le présent amendement remplace la définition de (iii) par la suivante. Le reste de la ligne D2 (iii) est inchangé : dédoublonnage par
signature, jamais « le TSV est sous le plafond », dénominateur [2nd].

**Source de la définition** (ordre SEC 34-106402, texte `F:\PRODUITS\etude-2026-09-19\txt\sec-34-106402-innovation-exemption.txt`,
sha256 `adee69f6…b40d08d`, [lu]) :
- II.F, p.24 l.897-906 : limites de 0,25 % (Tier 1) et 2,5 % (Tier 2) de « the average daily share volume during the prior month in the
  relevant NMS stock as reported by an effective transaction reporting plan » ; le pourcentage se calcule avec, au numérateur, l'ADV du
  jeton négocié sur le TSV et, au dénominateur, l'ADV de l'action (quotient ADV/ADV).
- Note 67, p.24 : « as reported » = plans CTA/CQ et UTP (SIP).
- Note 69, p.25 l.959-963 : « the next trade date will start concurrently with when trades must be reported to the SIP ».

**Définition (code : `apps/bell/src/volume.ts`, `apps/bell/src/collect.ts`).**
- **Unité de publication.** Une entrée `digest.volume[]` par **groupe de session** de Bell (`session`, `regime`, `session_date_et`),
  c'est-à-dire les mêmes groupes que les écarts (i). `classifySession` rattache une heure hors séance au dernier jour de bourse. C'est la
  lecture Bell de la note 69 : la journée de négoce ne change qu'à la reprise des déclarations au SIP. Hypothèse déclarée : le début de
  cette journée est la pré-ouverture de 04:00 ET (item ADV-SIP-DAY-1).
- **Numérateur (1re main).** S = Σ, sur les fills de la session, de |baseDelta| / 10^baseDec × m(t).
  - m(t) = multiplicateur actions-par-jeton en vigueur au fill, établi par la MÊME preuve que g_t (la porte de rebase) :
    `trajectory_known` ⇒ m(t) rejoué par fill ; `constant` ⇒ m ; `unverified` ⇒ non établi.
  - Porte absente = jambe ETH TSLAon en course (sans porte ni mint, `collect.ts:827-828`) ou rejeu hors ligne (`buildSolanaSymbol` pose la porte pour les symboles Solana ; G2 C-2 (c)) ⇒ le multiplicateur lu sur le mint,
    s'il se lit comme un nombre fini > 0.
  - S est la même somme que le dénominateur en actions de `sessionGapRebase` (`gap.ts`).
- **Dénominateur.** A = Σv / n_bars.
  - Barres : Massive (ex-Polygon) `GET /v2/aggs/ticker/{U}/range/1/day/{AAAA-MM-01}/{AAAA-MM-dernier}?adjusted=false&sort=asc&limit=50`,
    une requête par période ADV distincte.
  - Période ADV : le **mois civil qui précède le mois de `session_date_et`** (janvier ⇒ décembre de l'année précédente).
  - Datation : chaque barre est datée par la date ET de `t`. La page Massive « Custom Bars (OHLC) » [lu, 2026-09-23] décrit `t` ainsi :
    « The Unix millisecond timestamp for the start of the aggregate window ». L'exemple de cette page vaut minuit ET.
  - Exigence : les barres de la période couvrent **exactement** les jours de bourse NYSE de ce mois selon le calendrier committé
    (`sessions.ts`) : une barre par jour, aucun jour en plus, aucun doublon, chaque `v` fini et > 0. En clair, `n_bars = n_trading_days`.
  - `adjusted=false` = « as reported » (note 67). Le code d'avant utilisait `adjusted=true`. Résidu : ADV-SPLIT-1.
- **Ratio.** `vol_ratio` = S / A, décimal à 10 chiffres. Forme retenue au titre d'I-G2-3 : « volume de session rapporté à l'ADV ».
  - Unité : fraction d'une journée moyenne de bourse du mois ADV.
  - Fidélité à II.F : c'est la composante **additive** du quotient ADV/ADV. La somme des `vol_ratio` des sessions d'un même
    `session_date_et` donne le volume du jour rapporté à l'ADV du mois précédent. La moyenne de ces sommes sur les jours de bourse d'un
    mois redonne la forme ADV/ADV. Le ratio par session n'est donc pas lui-même le quotient II.F. `formula` le dit, et le lecteur
    reconstruit le quotient par somme puis moyenne.
  - Forme écartée : le « volume journalier moyen de la session » (volume ÷ durée). Elle extrapole à 24 h le débit de quelques heures,
    n'est pas additive et dépend des bornes de session (week-end en deux morceaux disjoints). Mutant M9 rouge.
- **Abstentions (fail-closed, I-G2-1).** Chaque cause est nommée sur l'entrée (`abstain`, liste de TOUTES les causes) et comptée dans
  `residuals`, par entrée. Il n'y a alors aucun `vol_ratio`. Jamais « 1 » par défaut, jamais de moyenne partielle.
  - `no_adv` : barres absentes, incomplètes, en surnombre, dupliquées ou non positives, ou mois hors du calendrier committé.
  - `no_multiplier` : mint absent ou illisible, porte `unverified`, aucun multiplicateur au fill.
- **Garde ESC-1 c.** `CLOSE_KEY` exempte le COMPTEUR `no_adv` par `(?<!no_)adv`, sur le motif de `(?<!no_)close`, dans `digest.ts` ET
  dans son double déclaré `apps/bell/scripts/bell-report.mjs`. L'égalité octet pour octet des deux littéraux est épinglée par un test.
  Trou déclaré : une clé numérique `no_adv*` passerait ; l'ensemble des résidus est fermé. Une valeur `adv` numérique reste rouge.
  `adv_period` est un objet `{year, month}`, non numérique.
- **Objet publié** (l'ADV n'est jamais publié, C-6) :
  - calculé : `{symbol, session, regime, session_date_et, window{from_utc_ms, to_utc_ms}, adv_period{year, month}, n, n_bars,
    n_trading_days, formula, vol_ratio, multiplier_unit}` ;
  - abstenu : les mêmes champs, sans `vol_ratio` ni `multiplier_unit`, avec `abstain: [...]`.
  - `window` = premier et dernier fill de la session : un fait des fills, haché dans le digest. Les bornes de collecte restent dans
    `state.window`.
  - La provenance nomme la source : `sources.adv_source = "massive-aggs-range-1-day-unadjusted"` (calque `close_source`).
- **Inchangés.** Le compteur par symbole `multiplier_unit` (lecture du mint ≠ 1, règle (iii)/(iv)) ; la phrase « jamais sous le
  plafond » ; le caractère [2nd] du dénominateur. Que `v` soit le volume consolidé du SIP n'est PAS établi : la page Massive dit
  « Aggregates are constructed exclusively from qualifying trades that meet specific conditions ». I-G2-5 reste ouvert.

**Tuyaux (règle Branchement).**

| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| ADV (iii) | `runMain` → `buildSolanaSymbol` / jambe ETH → `advBarsFor` (`collect.ts`) : GET Massive d'une période ADV (`advPeriodsForFills` → `advRangePath`), sous le budget de la jambe cash ; fills Solana (garde) / ETH | `collect()` → `state.json` écrit par `runMain` (hors dépôt, CA-11) : `digest.volume[]`, `residuals.no_adv` / `no_multiplier` ; `provenance.json` : `sources.adv_source` ; consommateur en dépôt : `apps/bell/scripts/bell-report.mjs` (somme des résidus, garde synchronisée) | aucun état persistant ; le calendrier committé `sessions.ts` (2025-01-01 → 2026-12-31) borne `n_trading_days` | `bell_adv_leg_is_wired_runmain_guard_real_polygon_get` (`apps/bell/test/bell-adv-1.test.ts`) : `runMain` → `openGuardedClient` réel + `polygonGet`/`databentoGet` réels, seul `globalThis.fetch` bouchonné, corps Massive de forme documentée (A-8) ; `bell_report_accepts_named_adv_residuals_in_sync` (`report.test.ts`) : `collect()` réel → state → rapport |

Chemin servi : **aucun avant T-1b**. `state.json` n'est pas servi, et Bell reste `upcoming` dans tout registre public. Le tuyau est
branché jusqu'au fichier écrit par `runMain` et jusqu'au rapport ; le panneau `/bell/` le consommera à T-1b
(`bell_panel_reads_published_state`, D4).

**Précondition d'entrée (à tenir par toute course qui doit remplir Q6).** Sur le code livré, `buildSolanaSymbol` pose toujours une
porte. Sans `--rebase-trajectory`, cette porte est `rebaseForMint(mint)` = `unverified`. Une collecte sans fichier de trajectoire
publie donc **100 % de `no_multiplier` et aucun ratio**, comme elle abstient déjà tous ses g_t (`rebase_unverified`). Les tirages go-1
(`--rebase-crosscheck`) retournent AVANT la jambe volume (`collect.ts`, branches `--rebase-*` / `--discover`) et ne produisent aucun
ratio. La course de Q6 est une collecte par défaut, lancée avec `--rebase-trajectory <fichier>` (fichier écrit par `--rebase-produce`,
C-8, pour chaque mint de la fenêtre), avec une porte `constant` ou `trajectory_known` sur chaque mint. Sans elle, le remplissage de
Q6 est impossible, et c'est visible dans `residuals.no_multiplier`.

**Couverture exacte, conséquence à connaître.** Une seule journée de bourse sans barre Massive met TOUT le mois en `no_adv`, donc
toutes les sessions dont c'est la période ADV. C'est voulu (D-4, fail-closed) et visible sur chaque entrée (`n_bars` contre
`n_trading_days`).

**Preuves.** 8 tests nouveaux (`bell-adv-1.test.ts`) + 1 (`report.test.ts`) ; 4 corps de test adaptés plus la fixture et les épingles (`collect.test.ts`, annotés D-4 ; G2 C-2 (b), aucune
assertion affaiblie) ; 22 mutants tués par le test visé (A-11 ; G2 C-2 (a)) ; pli 1b `70bb716` (G2 C-1) : trois gardes fail-closed épinglées — G3 (barre d'un samedi substituée à un jour de bourse manquant ⇒ `no_adv`, test 2), G13/G14 (porte `trajectory_known` à m = 0 / m = +∞ ⇒ `no_multiplier`, test 3) — rejouées aux octets du G2 et tuées par le test visé ; G15 équivalent déclaré (masqué par la garde aval). Re-pin `PINNED_BELL_SHA` `0cfbed20…43d7` → `79a59086…7658f`, prouvé par
SUBSTITUTION : l'entrée volume d'avant le lot, remise en place, avec les deux clés de résidu retirées, redonne `0cfbed20…`. Le lot ne
change donc le digest qu'à ces deux endroits.

**D-1 ACCEPTÉE (ruling orchestrateur 11:55 UTC, CHANTIERS ; G2 C-2 (d)) — écart initialement déclaré (`error_origin` : orchestrateur).** Le ruling de la mission dit en gras : « ADV du
**mois civil précédent** la session ». Il ajoute entre parenthèses : « barres journalières consolidées du mois M−1 de la date du close de
référence de la session, `refCloseDateOf` ». Pour une session pre ou regular du premier jour de bourse d'un mois, les deux divergent.
Exemples : regular du 2025-10-01 ⇒ septembre par le texte en gras, août par la parenthèse (`refCloseDateOf` = 2025-09-30) ; regular du
2026-01-02 ⇒ décembre 2025 contre novembre 2025. Arbitrage du worker en faveur de `session_date_et` (texte en gras) :
- (i) le livrable 3 exige que « the prior month's … » redevienne vrai, ce que la parenthèse rendrait faux pour ces sessions ;
- (ii) la note 69 fonde la convention d'ancrage ;
- (iii) les sessions d'un même jour partagent alors un seul dénominateur (additivité) ;
- (iv) il n'y a rien à anticiper : M−1 est clos avant toute session de M.

L'alternative tient en une ligne (`collect.ts`, `const period = advPeriodOf(refCloseDateOf(g.session, g.anchor))`) ; le mutant M2 la
rend rouge. Consultation advisor (outil intégré) : avis n°3 initial (« appliquer à la lettre ») retiré à la conciliation.

**`error_origin`.**
- Écart code ≠ ADR (fenêtre glissante, total de fenêtre, un ratio par symbole) et chemin fail-open (« 1 » par défaut,
  `ratio_computed:false` sans résiduel) : **plan (lot T-1a-ii)**. Le fait (iii) n'avait ni spécification fail-closed ni test de période
  (ruling CHANTIERS 07:29 UTC (b)).
- Parenthèse contradictoire du ruling : **orchestrateur**.
- Double de garde `bell-report.mjs` : il aurait refusé tout `state.json` portant `no_adv`. Détecté et corrigé au G1 de ce lot ; aucun
  défaut livré (n-a).

**Items formés (propriétaire, déclencheur ; aucun dû nu).**

| Item | Objet | Propriétaire | Déclencheur |
|---|---|---|---|
| I-G2-5 (inchangé, ouvert) | Établir que `v` des agrégats Massive est le volume consolidé du SIP. Documents : méthodologie des agrégats Massive (conditions de vente retenues). Lu le 2026-09-23 : la page « Custom Bars (OHLC) » ne l'établit pas (« qualifying trades that meet specific conditions »). | orchestrateur (lecture sur place) ou chercheur | avant `/bell/method` et avant le remplissage de la lettre |
| ADV-SIP-DAY-1 | Lire sur place le texte des plans CTA/UTP : à quelle heure « trades must be reported to the SIP » (début de la journée de négoce, note 69), contre la pré-ouverture 04:00 ET de `sessions.ts`. Usage : confirmer que `session_date_et` est la journée de négoce de l'ordre. | orchestrateur (lecture sur place) ou chercheur | avant que `/bell/method` énonce la règle du jour (T-1b), et avant le remplissage de la lettre |
| ADV-SPLIT-1 | Un split entre le 1er jour de la période ADV et la session décale les unités : barres « as reported » non ajustées contre actions de la session au multiplicateur du fill. Non détecté. Recherche : ce que le multiplicateur SPL scaled-UI des xStocks absorbe (fiche `docs/biblio/bell/L-lecture-spl-token2022-scaled-ui-amount-2026-09-20.md`). | orchestrateur → worker T-2 | T-2 (corporate actions, ex-dates) ou premier split d'un sous-jacent couvert |
| ADV-CAL-2027 | Le calendrier committé s'arrête au 2026-12-31. Dès le 2027-02-01, toute session a une période ADV hors calendrier ⇒ `no_adv` (fail-closed, visible). `classifySession` n'a pas de fermetures 2027 (préexistant). | orchestrateur | extension du calendrier 2027 (ligne d'ADR + contrôle de 1re main, `sessions.ts` l.13) avant le 2027-01-01 |
| SUPPLY-READ-1 | `readMintToken2022` rend un multiplicateur « 1 » pour un compte sans info parsée (`supply.ts` l.67). Le ratio (iii) ne le consomme plus en course (la porte décide) ; la lecture (iv) et le compteur `multiplier_unit` le consomment encore. | orchestrateur | prochain lot touchant `supply.ts`, ou T-1b (supply rendue) |
| TSLAON-MULT-1 | TSLAon (Ethereum) n'a aucune source de multiplicateur dans Bell ⇒ chaque session TSLAon s'abstient `no_multiplier` (avant : « 1 » silencieux). | orchestrateur (lecture sur place du facteur jeton/action Ondo GM) | T-2, ou la prochaine course `--eth` |
| CASH-BUDGET-1 | La jambe cash (ADV et close) consigne un refus de budget comme une faute (`no_adv` / pas de close) au lieu d'arrêter la course. Préexistant. La dépense reste bornée : chaque tick suivant refuse. | orchestrateur | 1b-iii (jambe cash sous la garde) |
| ADV-SESSION-CUT-1 | Une session coupée par les bornes de collecte est rapportée sur sa partie observée. C'est visible par `window` et `state.window`, mais aucun drapeau ne le signale. | orchestrateur | `/bell/method` (T-1b) doit l'énoncer, avec l'option d'un drapeau `session_complete` |
| MASSIVE-HOST-1 | La page Massive donne `https://api.massive.com` ; le code garde `https://api.polygon.io` (jambes ADV et cross, inchangées par ce lot). Confirmer sur place que l'ancien hôte reste servi. | orchestrateur (lecture sur place) | G0 de la prochaine course cash payante |

---

> **Déviation datée (cp-2 C-V-2, 2026-09-23)** : lot conduit SANS checkpoint-1 (plan = mission orchestrateur sous les décisions 140/143 ; CA-1..CA-5 tenus ex post au checkpoint-2 ; modes MAST résiduels contrés par les 22 mutants et la D-1 écrite). Chaîne : G1 `290548c` → G2 (`docs/G2-lot-bell-adv-1.md`) ‖ cp-2 ACCEPTE-AVEC-CORRECTIONS (`docs/CHECKPOINT2-lot-bell-adv-1.md`) → pli 1b `70bb716` → re-G2-delta (`docs/G2-lot-bell-adv-1-pli1b.md`) → G7 fusion `adc3260`, oracle `7 × exit 0 — passe 1 (13:58→14:01Z) : 6 portes 0, porte test 1 (crash processus 0xC0000409 de apps/harness/test/http.test.ts, hors périmètre du lot, 1 080/1 078/1/1) ; http.test.ts seul 4/4 ; porte test rejouée 14:04:29Z : 1 083/1 082/0/1 = 1 074 + 9 ; item HTTP-TEST-CRASH-1` (attendu N + 9), R-25 795. C-V-3 (item, prochain lot touchant `digest.ts`) : le commentaire « a point for checkpoint-2 » de `digest.ts` renvoie désormais à l'amendement ADR-T1aii du 2026-09-19.
