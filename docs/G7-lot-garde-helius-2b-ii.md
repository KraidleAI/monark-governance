# G7 — GARDE-HELIUS-2b-ii (migration du recorder Ukemi sous `@monark/rpc-guard`) — ACCEPTED, fusions `ce41619` (-a) et `5394dfe` (-b + -c)

Orchestrateur Fable 5.1 (`claude-fable-5-1`), 2026-09-22 00:12 UTC (`date -u`). Lot livré en deux sous-lots (seam pré-déclaré C-3 du checkpoint-1) plus un pli de tests, fusionnés `--no-ff` dans l'ordre exigé par les deux validateurs : **-a → -b + -c** ; **2b-iii** suit, rebasé sur cet arbre.

## 1. Oracle complet sur l'arbre FUSIONNÉ `5394dfe` (clés payantes retirées du process, codes capturés directement)
`npm run ci` → 0 : `gate:vocab` OK, typecheck 0, tests **763 / 761 pass / 0 fail / 2 skip** (`fetch_only_inside_client` until 1b ; `u4_redraw_selects_by_book_digest_seed` until 2b-iii — se dé-skippe à la fusion de 2b-iii, attendu final : 1 skip) ; `lint` 0 ; `lint:ratchet` 0 (69/69) ; `lang:gate` 0 ; `export:check` 0. Logs `F:\tmp\garde2bii-pli\g7-*.log`.

## 2. Lignée
| Étape | Référence | Résultat |
|---|---|---|
| Plan | `docs/G0-lot-garde-helius-2b-ii.md` (plié) ; `docs/CHECKPOINT1-lot-garde-helius-2b-ii.md` (C-1..C-9 ; C-9 ⇒ 2b-iii) ; rulings R-A..R-G, D-label `chainstack`, décision 121 | APPROUVE-AVEC-CORRECTIONS |
| G1 | R-25 total 1 322 > 1 150 ⇒ seam C-3 : **-a `b0f35e6`** (R-25 207), **-b `53ab0fb`** (R-25 1 125) ; vérifs orchestrateur sha 14/14, lint 0, vocab 0, invariants du gel = 0 | — |
| G2 -a | `docs/G2-lot-garde-helius-2b-ii-a.md` (identité SAME-REF, R-A exact, R-D = 1 ligne Bell, 6/6 mutants) | PASS-AVEC-CORRECTIONS (0 bloquante) |
| G2 -b | `docs/G2-lot-garde-helius-2b-ii-b.md` (C-G-1..5) | PASS-AVEC-CORRECTIONS (0 bloquante) |
| Checkpoint-2 (deux verdicts) | `docs/CHECKPOINT2-lot-garde-helius-2b-ii.md` : -a ACCEPTE ; -b C-R-b1 (journal `rpc_errors` sans test) + C-R-b2 (e2e sur ledger payant VIDE ; chaîne de concordance sans test) BLOQUANTS, tests seulement (code jugé juste : 735 tirages payants, reconcile GO / NO-GO à +1 RU, zéro caractère de clé sur toutes formes) | ACCEPTE-AVEC-CORRECTIONS |
| Pli -c | `4f3755f` tip (`593c0c3` code) : tests + docs, `apps/sentinel/src` et `packages/rpc-guard/src` byte-identiques à `53ab0fb` ; 16 mutants + 9 du G1 rouges ; R-25 367 | — |
| Clôture mécanique (orchestrateur, clone `F:\tmp\close-2biic`, clés retirées) | harnais du validateur `mutants2.mjs` + `mutants3.mjs` : 9/9 KILLED, restaurés | C-R-b1, C-R-b2 CLOS |
| G2-delta | `docs/G2-DELTA-lot-garde-helius-2b-ii-c.md` (reprise, ×2 passes, sous `env -u`) | PASS |

## 3. Livré
`rpc2.ts` : classes canoniques du paquet ré-exportées (0 classe / 0 regex locale), classifieurs de `classify.ts`, `revertKey` conservé ; **R-A** : jambe payante benchée sur `data === "0x"`/absent (plus de faux désaccord, cooldown 25 s déclaré). `record.ts` : `openGuardedClient(deps.env, …)`, `--operators` explicite, un `--cycle`, N `unlock` dans le `finally`, 6 arguments requis sans condition, aucune sonde d'env ; journal `rpc_errors` par `e.name` (`http:` payant, `code:` keyless), zéro caractère de clé. Grep CI in-suite fail-closed `apps/sentinel/src/ukemi/**` ∪ `apps/sentinel/src/rpc.ts` (motif KEY : 4 formes + 6 évasions, allowlist `Map<path,trigger>` à non-vacuité PAR ENTRÉE). E2e non-LLM transport → classify → record reproduisant `book_digest 034fbff9…` À TRAVERS le garde, puis `unlock` → `reconcile` sur un ledger payant NON vide. Adaptation minimale `apps/bell/src/ethereum.ts` (R-D). ADR : amendement 2b-ii (R-B vs A-6, R-D, clause 121 `network` spécifiée une fois — implémentation 1b-0), SHA en lieu de patchs.

## 4. Branchement (règle investisseur 2026-09-19 ; ruling R-C)
Le recorder Ukemi est **consommateur du paquet par un chemin réel + test d'intégration non-LLM** ⇒ `@monark/rpc-guard` passe **`branché`** côté Ukemi ; il passe **`built`** à la première course RAPPROCHÉE (U-4b-1b). Registres publics inchangés (mesuré par les deux G2). Oracle de cartographie : arête `record.ts → packages/rpc-guard/src/index.ts` créée, lecture `env.CHAINSTACK` disparue de `ukemi/**` (à confirmer par le diff de `carto.mjs` à la clôture).

## 5. Items formés (propriétaire orchestrateur, déclencheur nommé)
- **1b-0** : durcir l'ordre append → head-sidecar de `ledger.ts` (verrou non récupérable après crash ; test de caractérisation `…_KNOWN_DEFECT` à INVERSER par 1b-0 — couplage cross-lot à lister dans son G0) ; `finally` déverrouillant avec la variable CLI `cycle` (se désynchronise sous clause 121) ; test de compatibilité du ledger clause 121 à partir d'un ledger produit par le code 2b-ii réel.
- **Prereg U-4b-1b** : journal de diagnostic durable sur course en échec (C-R-b7) ; le risque d'abstention « jambe payante benchée + un seul keyless » varie à l'inverse du nombre de keyless dans `--operators` — paramètre à figer ; ligne de commande figée du recorder.
- **2b-iii** : dé-skip `u4_redraw_selects_by_book_digest_seed` ; retrait du pont d'identité ; unification des deux tests de grep.
- Non bloquant : assertion temporelle `< 4000 ms` du test 429 (fragilité sous charge) ; typo « 354 » dans le rendu hors dépôt.

## 6. `error_origin`
DEV-1 (`ukemi-u4-scores.test.ts` importait `selectIndices` de `u4-redraw.mjs`, chaîne transitive manquée) : plan + validateur (auto-déclaré). C-R-b1/b2, C-G-1..3 : worker (couverture retirée sans substitut). C-G-5 : mécanisme 2a (C-V-8) + sur-promesse worker. Sécurité : incident de transcript (relecteur 2b-iii, hors de ce lot) ⇒ règle A-7 appliquée à tous les oracles de ce G7.

## 7. MAST résiduel
FM-3.2 (couverture) soldé par le pli ; FM-3.3 (mesure sous clé ambiante) soldé par `env -u` ; FM-1.x n/a. Résiduel nommé : abstention fail-closed sur course payante à un seul keyless (paramètre de prereg).
