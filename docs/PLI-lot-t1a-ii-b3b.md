# PLI — lot T-1a-ii-b3b (Bell) : clôture cash Databento EQUS.SUMMARY, croisement Massive, séance, halts, MWCB

Worker `claude-opus-4-8[1m]` effort max, 2026-09-20. **Modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8`
vérifié). R-20 : le worker ne committe pas (l'orchestrateur le fait). R-21 : sortie écrite pour être vérifiée
adversarialement — chaque chiffre porte sa preuve reproductible. Worktree `F:\Monark-wt-bellb3b`, branche `lot/t-1a-ii-b3b`,
base `2da0bf5` (R-25) ; HEAD ff `e9c17b5` (biblio PR-B-DBN, `docs/**/*.md` exclu du R-25). G0 `docs/G0-lot-t1a-ii-b3b.md` +
checkpoint-1 `docs/CHECKPOINT1-lot-t1a-ii-b3b.md` (C-1..C-11 pliées ; C-1/C-2/C-3 bloquantes traitées avant tout code).

## 1. Livrables (liste fermée du G0) — état
| # | Livrable | État | Preuve |
|---|---|---|---|
| L-1 | `close.ts` + `runMain(argv, deps)` injectable (C-2), seam `readReferenceCloses`, `earliestPublishUtc` (C-6), `cash_request_digest` (C-7) | **fait** | `bell_close_databento_replays_synthetic_fixture` (pilote `runMain` hors ligne, asserte sur `state.json`/`provenance.json` produits) |
| L-2 | croisement Massive, égalité entier scalé 1e-9 (C-5), résidus `cash_cross_*` (C-1), invariant `close_guard`, re-pin | **fait** | `close.test.ts`, `bell_cash_cross_mismatch_is_a_named_residual`, `bell_residual_counter_passes_close_guard`, `bell_pinned_sha_reduces_to_b3a_by_subtraction` |
| L-3 | delta de halt rebranché sur la jambe on-chain (jointure `underlying`, un bracket/token/chaîne) + `underlying:"TSLA"` pool TSLAon | **fait** | `bell_halt_delta_brackets_real_fills_integration` (fills réels `tslax-weekend-fills.jsonl` + halt synthétique hors `series/`) |
| L-4 | croisement séance 2026 [lu] vs calendrier NYSE primaire (C-8) | **fait** | `bell_sessions_match_primary_nyse_calendar` (2026 seul ; 2025 = PR-B-CAL) |
| L-5 | état de procurement MWCB | **procurement PR-B-8** (bloquant release) | aucune constante committée (§7) |
| L-6 | `no_secret_in_repo` motif `db-` + ADR D1-quinquies + ce PLI | **fait** | `no_secret_in_repo` (mutant db- rouge), ADR-T1aii D1-quinquies |

## 2. Sha pins (preuve reproductible)
- **`PINNED_BELL_SHA`** (`collect.test.ts:59`) : `126abfae…` (-b3a) → **`0cfbed20fc7ab4391b687d870452211cdce02c3cc19ab1cc8f0425a3c24743d7`** (-b3b).
  **Preuve par soustraction** (`bell_pinned_sha_reduces_to_b3a_by_subtraction`) : le digest -b3b MOINS `earliest_publish_utc`
  (retiré de chaque gap rempli) MOINS les 2 clés `cash_cross_mismatch`/`cash_cross_unavailable` (du compteur `residuals`)
  recompute **exactement** `126abfaed17630808942a0dafc0ff6f1f9acf375d8f7adc6487d8c1e9e2c06d3`. Ce sont les SEULES additions au digest ;
  octets des fixtures inchangés. `earliest_publish_utc` mesuré sur la fixture = `1789848000000` (= 2026-09-19T20:00:00Z = 16 h 00 ET du 2026-09-18 + 24 h).
- **Bruts Databento réels — HORS dépôt** `F:\PRODUITS\etude-2026-09-20\bell-b3b-raws\` (ESC-1 c ; `assertNoClose` inchangée ; `git status` ne montre aucun brut/close) :
  - `get_cost-4underlyings-2026-09-14_19.json` `1b9dceaff7a9675c169a3c72e90d06caf24ca90ea1c729e6c5498e46c07d1bfe`
  - `get_range-TSLA-ohlcv1d-2026-09-14_19.json` `47dace0b947a0d7be9734f9ef1cc3be9b68945ded487d53357bcd56e971cfdda`
  - `get_range-SPY-…` `0c3ce3a607a5dadb92c059ad9e0c62af4a340693b9d497d359d1043bfb2c135b`
  - `get_range-NVDA-…` `ed0e98c3cf7afb2675c52c647bd4a9e6e7c37d19977fa79f5902133d3b35f9ec`
  - `get_range-AAPL-…` `55761ddd4c09653783a0dd768bb5c841e3b69e4a588da2557d99f7f1689ba9ae`
  - `PROVENANCE.md` (ToS 24 h verbatim + sha) same-dir.
- **Fixture synthétique committée (hors `series/`, comptée R-25)** : `apps/bell/test/fixtures/halts-tsla-synth.csv` — 1 ligne halt `Symbol=TSLA`,
  `Name="SYNTHETIC halt row - test fixture, not an NYSE event"` (erratum C-3), fenêtre ET samedi 09:31:00→09:32:00 (13:31:00Z→13:32:00Z)
  encadrant les 8 fills réels (13:31:04→13:31:50Z). Aucun close fabriqué ; aucune donnée sous `series/`.

## 3. Chiffres (mesurés, reproductibles)
- **Coût Databento** (`metadata.get_cost`, GRATUIT — PR-B-DBN Q7) : **$0.000031292439** pour 4 sous-jacents × 5 jours `ohlcv-1d`.
  Gate mission : projeté < 0,05 $ ✔ (loin du STOP 0,50 $). **$/GB** : le coût absolu tranche la contradiction décision 53 (30 $/GB)
  vs page pricing ($0.40/GB) — en supposant l'enregistrement DBN `ohlcv-1d` standard de 56 octets (20 enreg. ≈ 1120 o), le taux implicite
  ≈ **28 $/GB**, cohérent avec la **décision 53 (~30 $/GB)**, PAS avec le $0.40/GB (niveau service, pas ce jeu). Fait porteur = le coût
  ABSOLU (négligeable) ; le $/GB est une estimation dérivée (56 o = [abs], non le seul chiffre porteur). Crédits d'inscription 125 $ couvrent des années.
- **Endpoint/encodage confirmés first-hand** (PR-B-DBN [2nd] → [lu]) : `hist.databento.com/v0/{metadata.get_cost,timeseries.get_range}` HTTP 200
  (basic auth, clé=username) ; réponse **NDJSON** (5 enreg. Lun-Ven) ; `close` = **chaîne** entier scalé 1e-9 (12 chiffres observés) ; en-tête sous `hd`
  (`rtype/publisher_id/instrument_id/ts_event`) ; `ts_event` = minuit UTC du bar (dates 2026-09-14..18 correctes) ; **aucun champ `symbol`** sur l'enregistrement
  (⇒ une requête par symbole). `parseDatabentoJson`/`dbnBarDateUtc`/`scaledFromDatabento` décodent CHAQUE close réel en bigint — parseur GROUNDÉ, non inventé.
- **Tests** : 172 verts (bell + racine), dont **12 nouveaux bell** (≥ 8 requis) : L-1 (1 composition `runMain`), L-2 (3 : mismatch nommé, invariant close-guard, soustraction),
  L-3 (1), L-4 (1), C-6 joignabilité sur sortie collect (1), close.ts pur (5 : scaled-int C-5, earliestPublishUtc C-6, cash_request_digest, JSON parse, seam croisement). Oracles : `gate:vocab` 0,
  `typecheck` 0, `lint` 0, `lint:ratchet` 69/69, `lang:gate` 0, `export:check` 0, `no_secret_in_repo`/`series_pinned_are_declared_and_hashed` verts.
- **R-25** : `git diff --shortstat 2da0bf5 -- .` sous la pathspec exacte `STAT=` (`.github/workflows/ci.yml` l.65 ; `docs/**/*.md` + `series/**` exclus ;
  `halts-tsla-synth.csv` hors `series/` **compté**), `CHANGED = ins+del` = **710** (636 ins, 74 del) ≤ 1 205 (sous la projection G0 ~1 085,
  marge ~495). **Seam L-4+L-5 → -b3b-2 NON déclenché** (mesuré < 1 205). Les 3 nouveaux fichiers de code/fixture sont comptés comme insertions
  via `git add -N` (intent-to-add le temps de la mesure, jamais un commit — R-20) ; l'arbre est ensuite `git reset` ⇒ ils réapparaissent `??` (untracked).
  CI mesurera `origin/base…HEAD` après commit orchestrateur et comptera ces fichiers à l'identique (710) ; une mesure sur l'arbre untracked SANS `-N` donnerait 217 (tracked seuls) — non représentatif.

## 4. Mutants nommés (≥ 8 rouges ; copie froide, restauration sha-exacte, jamais `git checkout`)
Harnais : `cp f f.orig` → mutation (`sed`/append) → `node --test --test-name-pattern="^<killer>$"` (rouge attendu = exit≠0) → `cp f.orig f` → sha256 identique vérifié.
| # | Fichier | Mutation | Killer | Résultat |
|---|---|---|---|---|
| M1 | close.ts | `frac9` sans padding (comparaison de chaînes brutes) | `bell_cash_cross_scaled_integer_equality` | RED, restauré sha-exact |
| M2 | close.ts | `===` → `!==` (croisement inversé) | `bell_read_reference_closes_cross_matched_mismatch_unavailable` | RED, restauré |
| M3 | collect.ts | `bump("cash_cross_mismatch")` supprimé | `bell_cash_cross_mismatch_is_a_named_residual` | RED, restauré |
| M5 | collect.ts | `closeSource` non passé (seam non consommé) | `bell_close_databento_replays_synthetic_fixture` | RED, restauré |
| M6 | collect.ts | `earliest_publish_utc` retiré du gap rempli | `bell_close_databento_replays_synthetic_fixture` | RED, restauré |
| M7 | collect.ts | jointure absente (`haltDelta(row, [])`) | `bell_halt_delta_brackets_real_fills_integration` | RED, restauré |
| M8 | collect.ts | deux tokens fusionnés (`toks.slice(0,1)`) | `bell_halt_delta_brackets_real_fills_integration` | RED, restauré |
| M9 | close.ts | clé `db-…` plantée | `no_secret_in_repo` | RED, restauré |
| M10 | residuals.ts | `cash_cross_mismatch` → `close_cross_mismatch` (heurte `CLOSE_KEY`) | `bell_residual_counter_passes_close_guard` | RED, restauré |

9/9 tués. Couverture L-1 (M5,M6), L-2 (M1,M2,M3), L-3 (M7,M8), L-6 (M9), C-1 (M10). « nouveau `PINNED_BELL_SHA` bit-identique vert » = baseline (`bell_collector_replays_fixture_bit_identical` vert).

## 5. Décisions/placements déclarés (D-n)
- **D-b3b-1** : `earliest_publish_utc` **dans le digest haché**, par entrée `gT` (C-6 option (a)) — joignable à sa g_t, tamper-evident ; l'enveloppe date-map serait injoignable
  (`GapEntryBase` ne porte pas la date d'ancrage). Re-pin par soustraction (§2).
- **D-b3b-2** : `halt_deltas` (bracket premier-après/dernier-avant) dans **`state.json`** (non haché), inclus seulement si non vide ⇒ le rejeu épinglé (`haltRows:[]`) ne dérive que des 2 clés résiduelles.
- **D-b3b-3** : `cash_request_digest` + `cash_cross_{mismatch,unavailable}_days` dans **la provenance** (enveloppe) ; les COMPTES `cash_cross_*` restent dans `residuals` (source unique du compteur, `bell_residual_map_is_single_source`). Compte par SÉANCE (marqueur `cash_cross` par entrée, C-9) ; les listes de jours en provenance = détail de traçabilité. **Bord déclaré** : le marqueur `cash_cross` n'est porté que par les entrées ayant consulté un close présent (remplie `matched`/`unavailable`, ou abstenue `mismatch`) ; les abstentions `no_close_ref`/`rebase_unverified` n'en portent pas (elles n'ont pas atteint le croisement) — un consommateur T-1b filtre « croisé / source unique » sur les entrées marquées, les autres relèvent de leur propre résiduel.
- **D-b3b-4** : `closeAndAdv` scindé en `advVolumes` (ADV seul) ; tout le close+croisement vit dans `close.ts` `readReferenceCloses` (pas de double lecture Polygon des closes).
- **D-b3b-5** : Databento + Massive passent par le budget `--max-calls` (C-G2-7 plié) via `makeBudgetedCall().tick()` ; `BudgetExceededError` re-levée (jamais avalée en fault).
- **Hypothèse déclarée (C-8)** : NYSE et Nasdaq partagent le calendrier de fériés (sous-jacents TSLA/NVDA/AAPL Nasdaq). `ts_event` (date UTC du bar) = jour de séance ET (la séance tient dans un jour UTC).

## 6. Escalade Q3(ii) — intérim (a)
Sans croisement Massive (clé absente / 5xx), Bell **publie** la g_t Databento + résiduel `cash_cross_unavailable` + marqueur `cash_cross:"unavailable"` par séance (intérim
**option (a)** sous délégation décision 50). `error_origin: orchestrateur` si renversée. **Ratification investisseur due** : s'abstenir promouvrait Massive en co-source et coupla le
témoin à l'abonnement 29 $/mois (décision de coût/dépendance, hors worker). Non bloquant pour le G1 (fait).

## 7. Zéro dette — items formés (déclencheurs + propriétaires ; aucun dû nu)
- **PR-B-8 (MWCB)** — BLOQUANT release, repris ADR-B0/G0 : doc NYSE FAQ MWCB PDF + rapport groupe de travail 2020-03-31 (historique) + niveaux du jour ; nasdaqtrader.com
  Trading Halts (LULD/T1/T12 par titre) ; option intra-séance = jeu/schéma Databento **`status`** (différent d'EQUS.SUMMARY, **coût NON LU** — ne rien projeter). Les 5 dates
  (1997-10-27 ; 2020-03-09/12/16/18) restent **[2nd]** jusqu'au sha-pin ⇒ **aucune constante committée** (dates ni niveaux). Propriétaire investisseur/orchestrateur.
- **PR-B-CAL** — NON bloquant : calendrier NYSE/Nasdaq **primaire 2025** publié (snapshot/communiqué) ; d'ici là le test L-4 ne compare que 2026 [lu]. Snapshot procuré ⇒ `series/calendar/` + PROVENANCE. Propriétaire orchestrateur.
- **PR-B-DBN** — **RÉSOLU** (`docs/biblio/bell/L-lecture-databento-api-2026-09-20.md` [lu] + validation first-hand §3). Reste NON TROUVÉ (procurement rendu-JS, propriétaire orchestrateur, non bloquant) :
  demi-séances EQUS.SUMMARY ; rendu exact `pretty_px` (non utilisé — défaut = chaîne entier scalé, décodée exactement) ; comportement « tous symboles invalides ». Contradiction $/GB **tranchée** par `get_cost` (§3).
- **-b3c (corporate actions non-rebase)** — déclencheurs nommés (C-11) : (a) Ondo NAV/Ankura [PR-B-ONDO résolu OU fixture Ankura procurée] ; (b) multiplicateur Coinbase B20 [fusion -b2a] ; (c) rebases EVM Robinhood/Base/BSC [-b2a/-b2b]. Propriétaires investisseur/aval.
- **Bord déclaré — token non mappé** (non dette) : `runMain` clé `datesByUnderlying` par `UNDERLYING[symbol] ?? symbol` ; un token futur non mappé interrogerait Databento avec le ticker du TOKEN — réponse 200 + `warnings` (PR-B-DBN Q10) ⇒ `closeStringsByDate` = `{}` ⇒ `no_close_ref`, fail-closed (jamais un close inventé). Les 5 sous-jacents actuels (TSLA/SPY/NVDA/AAPL, TSLAon→TSLA) sont mappés.
- **Cost pre-flight committé dans `runMain`** : NON retenu (item, non dette) — le gate coût opérationnel est la validation `metadata.get_cost` (§3) + le budget `--max-calls` (compte d'appels) ; `databentoCostPath` est exposé pour un pré-vol T-1b futur.

Provenance : modèle épinglé `claude-opus-4-8[1m]`, 2026-09-20, contexte G1 -b3b, réviseur = orchestrateur (R-21) puis G2 fraîche → checkpoint-2 (re-exécution imposée CA-9) → G7.
