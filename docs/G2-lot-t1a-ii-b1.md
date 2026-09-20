# G2 — lot T-1a-ii-b1 (course fondatrice Bell, jambe Solana)

Relecteur G2 **FRAÎCHE** (instance séparée ≠ générateur), `claude-opus-4-8[1m]` effort max.
Worktree `F:\Monark-wt-bellb1`, branche `lot/t-1a-ii-b1`, gel **`2ac2e25`** (base `96ca634`).
Aucun commit, aucun workflow (R-20) ; sortie brute pour l'orchestrateur, vérifiable (R-21) ; scratch `F:\tmp\g2-bellb1\`.
Offline : aucun RPC live, aucune clé/URL lue en sortie. Cadre : `docs/G0-lot-t1a-ii-b.md` (+ amendement C-1..C-15),
`docs/PLI-lot-t1a-ii-b1.md`, ADR-B0, ADR-T1aii (D1-bis), décisions 40/44/45/46 (`docs/CHANTIERS.md`).

## Modèle résolu (R-1)
`claude-opus-4-8[1m]` — préfixe `claude-opus-4-8` vérifié, Opus 4.8 1M contexte (non banni), effort max.
Source : identité de l'environnement d'exécution de la session (2026-09-20).

## VERDICT : **APPROUVÉ-AVEC-CORRECTIONS**

Le lot est solide : `npm run ci` **402/402** rejoué (0 fail), typecheck/eslint/ratchet 69/69/lang-gate/export-check verts,
**8 mutants rouges par construction** avec restauration sha-exacte, LF-sha du spike = pins annoncés, CA-11 tenu,
R-25 sous plafond, escalade honnêtement formée (aucune course lancée, budget préservé). MAIS **une régression C-6 en
câblage LIVE (fail-open, prouvée)** et **une affirmation de provenance à signe inversé (effTs)** interdisent l'APPROUVÉ nu,
sans justifier un REFUS (aucun g_t fondateur produit ni committé ; correctifs localisés). Corrections C-G2-1..C-G2-8 ci-dessous.

`error_origin` global du lot : **planificateur** (hypothèse ADR-T1aii D1 « pools existaient jul-oct 2025 » falsifiée
first-hand par le spike -b1) — déjà consigné par le worker. Les corrections C-G2 ci-dessous portent leur propre origine.

---

## 1. Revue 3 étapes (AgileCoder) + checklist G2

**Étape 1 — la sortie répond-elle au périmètre ?** Oui pour le périmètre RÉEL (corrections de code + spike + escalade) ;
le périmètre NOMINAL (course fondatrice) est légitimement bloqué par deux découvertes first-hand (pools census = 2026,
multiplicateur mutable illisible à la borne 2025) — escalade formée conforme R-26. Pas de sur-livraison, pas de course
prématurée. **Étape 2 — cohérence interne** : la carte de résidus est mono-source (`residuals.ts`, test d'égalité vert) ;
le gate C-6, la clôture par ancre C-7, l'opérateur C-9, le budget C-11, le registre C-13 sont câblés dans `collect()` et
testés. Deux incohérences trouvées (C-G2-1 câblage LIVE ; C-G2-2 signe effTs). **Étape 3 — lisibilité/maintenabilité** :
commentaires denses et sourcés, invariants nommés, motifs de MAST cités ; RAS bloquant.

**Checklist G2 (corpus doc 02) :** sources [lu]/[abs] déclarées ; aucun chiffre de seconde main non tracé (une exception
C-G2-6) ; provenance présente (modèle épinglé, dates, réviseur) ; oracles non-LLM par sous-lot présents et rejoués ;
zéro secret dans l'arbre (rejeu du scan + mutant planté) ; R-25 mesuré ; CA-11 vérifié ; MAST couvert (fuite clé, quorum,
close republié, surclaim). Dette : **aucune dette nue admise** — chaque point non résolu ci-dessous est un item C-G2 formé
avec déclencheur, ou une note [abs] justifiée.

---

## 2. Corrections C-6/7/9/10/11/13/15 — chacune rejouée (test présent, mutant rouge, restauration sha-exacte)

Toutes les corrections revendiquées SONT présentes et testées. Les tests testent bien ce qu'ils prétendent (non-tautologiques
vérifiés : C-13 épingle `baseDec` à la fixture mint réelle ; C-10 porte non-vacuité + non-faux-positif ; C-9 compte par
opérateur, pas par host). Détail par correction :

- **C-6** — `residuals.ts` `rebase_unverified` (enum étendu, lié au type `HaltResidue`), `supply.ts` `rebaseGate`/`rebaseGateFromMint`
  (gate PUR : multiplicateur lu aux DEUX bornes sinon abstention ; mutable ⇒ `rebase_unverified` ; immuable ⇒ constant),
  câblé dans `collect()` (abstention par session, vwap porté, pas de gT). Tests `bell_rebase_gate_constant_or_abstains`,
  `bell_rebase_gate_from_mint_immutable_vs_mutable`, `bell_rebase_unverified_abstains_sessions`. **Réserve honnête confirmée** :
  la branche IMMUTABLE (`scaledAuthority === null`) n'est exercée que par un literal synthétique (aucun mint xStock mesuré
  n'y tombe). **DÉFAUT CÂBLAGE LIVE → C-G2-1** (fail-open sur échec de lecture mint).
- **C-7** — `sessions.ts` `refCloseDateOf` (pre/regular ⇒ jour de bourse précédent = anti-look-ahead ; hors-séance/after ⇒
  ancre), `collect.ts` `closeAndAdv`/`refCloseDatesForFills` (close PAR jour de référence via Massive `range/1/day/{jour}/{jour}?adjusted=false`,
  jamais un `/prev` sur toutes les ancres), `close_source: "massive-starter-internal"` en provenance (valeur string non
  numérique ⇒ la garde close ne rougit pas ; un close numérique rougit). Tests `bell_close_per_reference_day_no_lookahead`,
  `bell_close_source_named_in_provenance`. **Sous-livraison → C-G2-4** (« garde sur le rapport » non livrée, mitigée en amont).
- **C-9** — `operators.ts` `operatorOf(url)=OPERATOR_OF_DOMAIN[providerOf(url)] ?? providerOf(url)` (carte committée :
  `chainstack.com` + `p2pify.com` = `chainstack` ; `binance.org` + `bnbchain.org` = `binance` ; domaine inconnu ⇒ lui-même,
  défaut sûr). `quorum2` distinctness par OPÉRATEUR ; `providers_distinct` par opérateur dans journal + provenance. Test
  `bell_quorum_pair_two_operators` (paire de 2 hosts Chainstack ⇒ `no_quorum` ; Helius+Chainstack ⇒ valeur ; 2 hosts CS + Helius ⇒ distinct=2).
- **C-10** — `test/no-secret-in-repo.test.ts` : **5 motifs neufs** (`(?:core\.)?chainstack\.com/[0-9a-f]{32}`,
  `p2pify\.com/[0-9a-f]+`, `wss://…/[0-9a-f]{16,}`, `Bearer …{16,}`, `[A-Z][A-Z0-9_]*_API_KEY=…`) + non-vacuité + 4 preuves
  de non-faux-positif (template `Bearer ${apiKey}`, `process.env.*_API_KEY`, host nu, mention prose). Scan de l'arbre entier vert.
- **C-11 + O-12** — `collect.ts` `parseArgs` (`--max-calls` OBLIGATOIRE, `> 0`, checked LAST après pool/num/eth ; `num()`
  rejette `!isFinite || <0` ⇒ Infinity/NaN/négatif) + `makeBudgetedCall` (rejette au-delà de maxCalls sans atteindre l'inner)
  + `quorum.ts` `BudgetExceededError` re-throw dans `quorum2`/`withRetry`/`liveSolanaFills` (jamais avalé comme fault). Tests
  `bell_parseargs_fail_closed_and_wired`, `bell_max_calls_budget_fail_closed`. **Périmètre budget → C-G2-7** (jambe ETH/Massive hors compteur).
- **C-13 / C-15** — `pools.ts` `PoolRef` étendu (`baseIndex`, `baseDec`, `quoteDec`, `underlying`, `chainId`, `censusSha`,
  `foundingPool`) ; vérif on-chain par pool consignée (`getTokenAccountsByOwner`, C-15) ; `foundingPool: false` (mesuré,
  pools 2026). Test `bell_pool_registry_c13_fields` (non-tautologique : `baseDec` == décimales du mint lues sur fixture réelle
  captée). O-9/O-10 aussi présents et testés (`bell_is_sol_revert_transport_vs_deterministic`, `bell_solana_endpoints_env_override`).

### Tableau des mutants (choix G2, rejoués sur `2ac2e25`, TMP/TEMP/TMPDIR=F:/tmp)

| # | Corr. | Fichier:ligne | Mutation | Test unique | Résultat | Restauration |
|---|---|---|---|---|---|---|
| 1 | C-6 | `supply.ts:147` | gate toujours `constant` (branche autorité retirée) | `bell_rebase_gate_from_mint_immutable_vs_mutable` | **ROUGE** (fail 1) | sha `b160fca7…` identique, arbre propre |
| 2 | C-7 | `sessions.ts:145` | `regular` retiré de la clause look-ahead | `bell_close_per_reference_day_no_lookahead` | **ROUGE** (fail 1) | sha `2e8ccdd4…` identique, propre |
| 3 | C-9 | `operators.ts:17` | `p2pify.com → "p2pify"` (opérateur distinct) | `bell_quorum_pair_two_operators` | **ROUGE** (fail 1) | sha `8e76a6c9…` identique, propre |
| 4 | C-10 | fichier planté `apps/bell/test/fixtures/_g2probe_c10.txt` | url Chainstack + 32 hex | `no_secret_in_repo` | **ROUGE** (pattern « Chainstack RPC url (hex key in path) ») | fichier supprimé, propre |
| 5 | C-11/O-12 | `collect.ts:365` | `!Number.isFinite(n)` retiré (Infinity accepté) | `bell_parseargs_fail_closed_and_wired` | **ROUGE** (fail 1) | sha `ab7e01ed…` identique, propre |
| 6 | C-13 | `pools.ts:101` | TSLAx `quoteDec 6→9` | `bell_pool_registry_c13_fields` | **ROUGE** (« TSLAx quoteDec ») | sha `9ca22e34…` identique, propre |
| 7 | pin série | `spike/spike-measures.json:207` | `wallSeconds 15.402→15.403` | `series_pinned_are_declared_and_hashed` | **ROUGE** (LF-sha dérive `db42ecab…` ≠ pin `1e733a…`) | sha `1e733a69…` identique, propre |
| 8 | rejeu | `series/tslax-weekend-fills.jsonl:1` | `baseDelta` `-60427747`→`-60427748` (édit unique déterministe, JSON valide) | `bell_collector_replays_fixture_bit_identical` | **ROUGE** (« series/mint fixture drifted from the pinned digest ») | sha `7f81f670…` (= pin) identique, propre |

Chaque mutant : sha pré-mutation capturé → mutation → test unique rouge → `git checkout 2ac2e25 -- <fichier>` (ou `rm`) →
sha post-restauration identique → `git status --porcelain` vide. **HEAD final = `2ac2e25`, arbre propre.**

---

## 3. Spike committé (item 2) — cohérence interne + provenance ([abs] on-chain, offline)

`apps/bell/test/fixtures/series/spike/{spike-measures.json, spike-findings.json, PROVENANCE-spike.md}`.

- **Aucune clé / URL / uuid** : scan first-hand du répertoire — seules apparaissent des **adresses tronquées publiques**
  (`CYfaMv…`, `S7vYFF…`), des **hosts nus** (`helius-rpc.com`, `chainstack.com`), des **sha256** (pins de scripts/données/raws)
  et des **URL de CGU/doc** en prose (`helius.dev/terms`, `chainstack.com/tos`, `api-reference/rpc`) — aucune ne matche un motif
  secret (le motif Chainstack exige `chainstack.com/<32 hex>` ; `chainstack.com/tos` n'y tombe pas). Conforme.
- **LF-sha annoncés = mesurés** (recalcul par la méthode exacte du test `seriesLfSha256` = sha256(utf8 avec `\r\n`→`\n`)) :
  `spike-measures.json` = `1e733a6996ffdb0ed2b9a5a9b971a420850b4c5e1c61cb293565997792ef78d0` (pin ✓) ;
  `spike-findings.json` = `c016418747de3a10166997fe52aae375fc1b4a754827906b573f2d4a4fe45224` (pin ✓) ;
  `tslax-weekend-fills.jsonl` = `7f81f670…` (pin ✓), `tslax-mint-token2022.json` = `230972b98e…` (pin ✓).
- **`series_pinned` vert** rejoué ; mutant #7 prouve la détection de dérive.
- **Cohérence avec le PLI** (offline ⇒ [abs] pour la re-mesure on-chain ; cohérence INTERNE vérifiée first-hand) :
  premiers tx census 2026 (TSLAx 2026-02-11, SPYx 2026-01-15, AAPLx 2026-09-11, NVDAx 2025-07-02) ✓ ;
  **NVDAx 8 tx in-window** (`spike-measures` gtfa_window sigs=8, firstBlockTime 1751420555 = 2025-07-02) ✓ ;
  mints actifs in-window (8000 capés, premier tx 2025-06-10/11) ✓ ; **multiplicateurs mutables** (TSLAx 1 ; SPYx 1.0039…,
  NVDAx 1.0009…, AAPLx 1.0026…) ✓ ; **autorité PARTAGÉE `S7vYFF…`** pour les 4 ✓ ; vaults présents (getTokenAccountsByOwner) ✓.
- **Budget spike réconcilié** : `spike-measures` helius=38 + `spike-findings` helius=52 = **90** ⇒ le « ~90 appels Helius »
  du PLI est corroboré par les deux artefacts committés (≈ 0,0009 % du quota 10 M). Cohérent.
- **effTs — INCOHÉRENCE first-hand → C-G2-2 / C-G2-3** (voir §4). Les valeurs brutes (multiplier, newMultiplier, effTs)
  sont correctement enregistrées ; c'est leur INTERPRÉTATION (« future effTs ») et le champ retenu par `readMintToken2022` qui posent problème.
- **PoC de découverte non mesuré en dépôt → C-G2-6** : le résultat PoC (vault `CY9Xzc1z…`, 5000+ tx in-window ; AAPLx 6000 sigs/6 pages)
  n'existe qu'en **prose** de `PROVENANCE-spike.md` (finding 4), sans entrée JSON ni sha de raw épinglé — or c'est la base de faisabilité de la reco (a).

---

## 4. Rapport non-LLM (item 3) + constats de correctness

`apps/bell/scripts/bell-report.mjs` + `report.test.ts` : **déterministe, sans LLM, sans réseau** ; agrège la Table 4 de Cong
PAR RÉGIME (overnight-weekday/weekend/holiday ; intraday `regime:null` non bucketé) ; **CONSTAT jamais vert/rouge** (assertion
`!/✅|❌|PASS|FAIL/`) ; colonne Cong = item de procurement, jamais fabriquée ; cite le script + son sha256 (C-14). `--out`
**documenté** (défaut `docs/MESURE-FONDATRICE-bell-2026-09.md` IN-repo BY DESIGN, note explicite ; les D9 restent hors arbre CA-11).
Tests `bell_report_aggregates_by_regime_constat` (+ mutant exceed5 1→0), `bell_report_finds_per_pool_state_files`. Conforme.

---

## 5. Corrections C-G2 (formées, avec déclencheur — zéro dette nue)

- **C-G2-1 — BLOQUANT AVANT COURSE (C-6 fail-open LIVE, `error_origin` rédacteur -b1).** `collect.ts:427`
  `const rebase = mint ? rebaseGateFromMint(mint) : undefined;` : sur **échec de lecture du mint** (quorum manqué ⇒
  `mint` undefined), `rebase` est absent, donc dans `collect()` le test `s.rebase?.status === "unverified"` est FAUX ⇒
  la session **calcule g_t** avec `multiplier` par défaut `"1"` au lieu d'abstenir. **Prouvé first-hand** (repro offline,
  `F:\tmp\g2-bellb1\repro-A.mts`) : un symbole fills+close sans mint (no_quorum) produit `gT=-0.5753641449`,
  `exceed1/2/5=1`, `rebase_unverified=0`, `no_quorum=1` — exactement le « g_t silencieusement non vérifié » que C-6 interdit.
  Ironie mesurée : pour TOUS les xStocks mesurés une lecture mint **réussie** donne `rebase_unverified` (mutable) ⇒ le SEUL
  chemin live qui émet un g_t est l'**échec** de lecture mint. Le smoke NVDAx n'a pas attrapé le défaut (sa lecture mint a réussi).
  **Fix** : `: { status: "unverified", residue: "rebase_unverified" }` sur mint absent, + test offline (SymbolInput mint
  undefined ⇒ abstention) + preuve de câblage (regex `SRC` comme les autres). **Le correctif vit dans `main()` (câblage
  live), PAS dans `collect()`** : les fixtures lot -a passent `rebase: undefined` par conception (mode rejeu) et calculent
  g_t ; abstenir sur `rebase` absent DANS `collect()` casserait l'oracle `bell_collector_replays_fixture_bit_identical`.
  **Déclencheur** : avant toute course Solana.
- **C-G2-2 — DÉFAUT doc 03 (affirmation à signe inversé, `error_origin` rédacteur -b1).** Les effTs committés décodent en
  **dates PASSÉES** vs la date du spike 2026-09-19/20 : `1781755200`=2026-06-18 (SPYx), `1789000200`=2026-09-10 (NVDAx),
  `1786149000`=2026-08-08 (AAPLx). Or `PLI:81` (« newMultiplier en attente (effTs futur) »), `PROVENANCE-spike.md:66`
  (« pending newMultiplier (future effTs) ») et `supply.ts:28` (« pending newMultiplier ») affirment le contraire.
  **Fix** : corriger le libellé (effTs échu ⇒ `newMultiplier` déjà en vigueur). Contradiction interne first-hand — correction due quel que soit le point suivant.
- **C-G2-3 — CORRECTNESS latente + PROCUREMENT (spec SPL Token-2022 hors dépôt).** Si la sémantique ScaledUiAmount est
  « multiplicateur effectif = `newMultiplier` dès que now ≥ effTs », alors pour SPYx/NVDAx/AAPLx (effTs échu) `readMintToken2022`
  renvoie le `multiplier` **périmé** ⇒ le readout `supply`/`multiplier` porte la mauvaise valeur. **Le gate n'est PAS affecté**
  (mutable ⇒ `rebase_unverified` quelle que soit la valeur), et `supply` est « read-and-logged, non rendu » (T-1b/T-2) ⇒ non
  bloquant -b1. **Statut de source** : `@solana/spl-token` **absent de `node_modules`** (vérifié first-hand) ⇒ la règle
  `amountToUiAmount` n'est **pas lisible offline** ⇒ je ne l'asserte PAS [lu] ; item de **procurement formé** (récupérer
  `spl-token`/`extensions/scaledUiAmount` ou la doc `spl.solana.com`, usage : figer la règle de multiplicateur effectif).
  **Fix** : une fois la spec [lu], appliquer la règle dans `readMintToken2022` (ou documenter pourquoi le champ brut est
  conservé) **avant tout supply×multiplier rendu**. Déclencheur : -b3 (rebase-aware) au plus tard. (La contradiction interne
  C-G2-2, elle, tient sans la spec : « futur » vs dates passées est first-hand.)
- **C-G2-4 — SOUS-LIVRAISON C-7 (garde rapport).** C-7 demande « garde sur le rapport (aucun nombre en contexte close/ADV,
  mutant) » : `bell-report.mjs` n'a pas d'`assertNoClose`, `report.test.ts` ne teste que l'absence de verdict. **Mitigé en amont**
  (le digest est déjà `assertNoClose`-gardé ⇒ le rapport ne peut structurellement pas recevoir de close). **Fix** : soit ajouter
  une garde+mutant au niveau rapport, soit consigner en ADR la justification structurelle (garde amont). Déclencheur : avant génération du rapport réel.
- **C-G2-5 — DETTE NUE (C-5, `error_origin` rédacteur -b1).** La formule C-5 EST présente en prose (ADR-T1aii:61) mais le
  **test « projection > seuil ⇒ top 20 + couverture publiée » est absent** ET non listé dans « Reste » du PLI ⇒ dette nue
  (règle Dettes). De plus « projection non computable (0 data) » **sous-coûte** : un plafond est computable depuis les tx
  in-window des MINTS (8000 capés × lignes census). **Fix** : former le test C-5 comme item -b2 AVEC déclencheur (ou le livrer
  en test de fonction pure maintenant, la formule existant), et énoncer le plafond computable dans la consultation.
- **C-G2-6 — PROVENANCE PoC (doc 03, reproductibilité).** Le résultat PoC de découverte de vault (base de la reco (a)) n'est
  qu'en prose. **Fix** : ajouter une entrée `spike-findings.json` (ou épingler le sha du raw PoC same-dir) pour que la faisabilité soit
  measure-backed. Déclencheur : avant décision go option (a).
- **C-G2-7 — PÉRIMÈTRE BUDGET (C-11, item -b2).** `--max-calls` enveloppe intégralement la jambe Solana (liveSolanaFills +
  quorum mint via `budgeted.call`) mais **pas** la jambe ETH (`liveEthSwaps` → `makeUkemiPool`/`bellEthCall`) ni Massive
  (`closeAndAdv` → `get`). Acceptable pour -b1 (Solana). Le smoke « 759/4000 appels » était **Solana-seul** ⇒ il n'a pas
  exercé les chemins hors budget (raison pour laquelle le trou n'a pas été détecté). **Fix -b2** : la course EVM `getLogs`
  doit passer par le budget fail-closed (RU Chainstack = quota mesuré). Déclencheur : lot -b2b.
- **C-G2-8 — MINEUR (hypothèse immuable).** `rebaseGateFromMint` traite « autorité null MAINTENANT » comme « constant aux
  deux bornes historiques ». Si l'autorité ScaledUiAmount est révocable après un rebase, null-maintenant ≠ null-en-2025.
  Non exercé par des données réelles. **Fix** : énoncer l'hypothèse dans le docstring (ou déférer à la reconstruction first-hand -b3). Non bloquant.

---

## 6. Consultation formée (item 4) — AVIS (pas verdict)

- **Honnêteté du coût des 3 options** : honnête sur la **faisabilité** ; **sous-coûtée sur C-5** (cf. C-G2-5 : « non computable »
  ignore le plafond computable côté mints). Les options (a)/(b)/(c) décrivent correctement leurs pertes (a : g_t dépend de -b3 ;
  b : valeur fondatrice ≈ nulle ; c : perte de comparabilité Cong).
- **4ᵉ option omise** : **(d) inverser l'ordre — reconstruction SetMultiplier (-b3) AVANT toute course Solana**. Elle est
  **fermée par la décision 46** (ordre `-b1 → CRA-B → -b3 → -b2a → -b2b`), donc l'omission est défendable, mais elle méritait
  d'être nommée pour montrer qu'elle a été écartée par décision, pas oubliée.
- **Cohérence de la reco (a) avec l'ordre de décision 46 (`-b1 → -b3 → -b2a → -b2b`)** : la reco (a) propose DEUX variantes.
  La variante **FUSION (-b1+-b3)** **viole C-2** (séquence stricte, un worker/un worktree par sous-lot) ET l'ordre committé 46.
  La variante **SPLIT (-b1 = découverte + vaults + décomptes + abstention nommée ; -b3 = g_t rebase-aware)** est **cohérente**
  avec la décision 46. **Avis** : retenir explicitement la variante SPLIT ; écarter la fusion (C-2). C'est aussi l'ordre que
  46 a effectivement retenu (-b1 puis -b3).

---

## 7. R-25, CA-11, notes de mesure

- **R-25 (item 6)** — pathspec UNION `STAT=` de `ci.yml`, `96ca634..2ac2e25` (96ca634 = parent direct ⇒ 2-points = 3-points) :
  `git diff --shortstat` = **721 ins + 53 del** ⇒ formule CI (`ins+del`) = **774**. **< 1 205 (plafond) ✓** ; **> 700 (cible G0)**
  de 74 (surcoût script rapport C-14 + PROVENANCE, déclaré). **Écart avec le PLI** : le PLI annonce 762 (estimation pré-commit
  tracked 459 + untracked 303) ; le diff committé réel = 774. Note, pas correction (plafond tenu) ; le chiffre auditable est **774**.
- **CA-11 (item 7)** — Bell **ABSENT** de `apps/site/lib/fleet.ts` (aucune occurrence « bell ») et de `README.md` (aucune
  occurrence Bell ; ligne 33 = titre générique) ; **aucun** fichier fleet/README/site modifié par ce lot. C'est **plus fort**
  qu'`upcoming` (non déclaré du tout). Aucun composant déclaré built. Conforme.
- **Oracles (item 5)** — rejoués UNE fois : `npm run ci` (gate:vocab + typecheck + test) = **402/402 pass, 0 fail**, durée ~31 s ;
  `npm run typecheck` OK ; `npm run lint` rc=0 ; `npm run lint:ratchet` **69/69** ; `npm run lang:gate` OK (bell 0 hit FR) ;
  `npm run export:check` OK ; ciblé `npx tsx --test apps/bell/test/*.test.ts test/no-secret-in-repo.test.ts` = **45/45**
  = **44 tests bell mesurés** (`grep -c "^test("` : bell.test 19 + collect.test 23 + report.test 2) + `no_secret_in_repo`.
  Aucun autre oracle Bell touché (checkpoint-2 CRA-B sur autre worktree non touché).
- **[abs] justifiés** (offline) : re-mesure on-chain des profondeurs/dates/multiplicateurs (spike) — cohérence interne + provenance
  vérifiées, valeurs on-chain non re-mesurables sans RPC live ; `census-v3.csv` **hors dépôt** ⇒ `CENSUS_V3_SHA256` (`25db700e…`)
  non recalculable ici (pin d'audit, pas de dérive vérifiable).

---

## Synthèse

**APPROUVÉ-AVEC-CORRECTIONS.** Livrables forts, oracles verts (402/402), 8 mutants rouges à restauration sha-exacte, spike
propre et pins exacts, escalade honnête, CA-11 tenu, R-25 sous plafond. **Corrections bloquantes/formées** : C-G2-1 (fail-open
C-6 en câblage live, BLOQUANT avant course, prouvé) ; C-G2-2 (effTs signe inversé, défaut doc 03) ; C-G2-3..C-G2-8 (correctness
latente, garde rapport, dette C-5, provenance PoC, périmètre budget, hypothèse immuable) — toutes avec déclencheur. Aucune dette
nue. Le verdict G7 et la vérification adversariale restent à l'orchestrateur (R-21).

Réviseur : G2 fraîche `claude-opus-4-8[1m]` effort max · gel `2ac2e25` · 2026-09-20.
