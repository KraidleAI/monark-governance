# Checkpoint-2 (livrable) — lot U-4b-1b-4 — validateur-humain (claude-fable-5-1), 2026-09-22

Modèle résolu : claude-fable-5-1

# CHECKPOINT-2 — lot U-4b-1b-4 (`lot/u4b-1b-4` @ `30a2eee`, base `030fe06`) — **ACCEPTE-AVEC-CORRECTIONS** (C-V-1..C-V-4), conditionné à un G2 rendu et concordant au G7

Rendu au fil de l'eau : `F:\tmp\cp2-u4b1b4\CP2.md` (sha256 `e0ff7c2041883490670a28dcb959c84e00f0df5e552d01d5972cdeff679adb41`) ; index A-12 de tous les journaux : `F:\tmp\cp2-u4b1b4\logs\A12-INDEX.txt`.

## 1. Checkpoint LIVRABLE — artefacts lus (contexte frais ; G2 non lu ; `F:\course-bell\*` non ouvert)
`F:\Monark\docs\CHECKPOINT1-lot-u4b-1b-4.md`, `F:\Monark\docs\G1-lot-u4b-1b-4.md`, `F:\tmp\u4b1b4\{G1.md, PREREG-DELTA.md, ADR-amendement.md, DELIVERED.sha256, mutants.mjs, mutants-run1..3.log, mutants-final.log, controls.{sh,log}, oracle.sh, oracle-final2\, ref-measure.mjs, ref-measure-final.json, R25.txt, INVARIANTS-{BEFORE,AFTER}.txt, backup\, nul-evidence\}`, `F:\Monark\docs\course-ukemi\{ADDENDUM-sonde-d-ancre-pre-b0-2026-09-22.md, FAITS-dualaggregator-cutoff-2026-09-22.md, SIDECAR-prereg-u4b-1b-2026-09-22.md, RUNBOOK…:527-531}`, `docs/PLAN-u4b-prereg.md` (sha), `docs/CHANTIERS.md:845,853-901`, `git diff 030fe06 30a2eee` (8 fichiers, intégral), blobs `u4b-reduce.mjs:55-80`, `u4b-scores.mjs:100-120`, `transport.ts:28-45`, `rpc2.ts`, `u4b-discover.mjs:44-50`, `export-public.mjs`, `ci.yml:55-75`.

## 2. Rejeux (CA-9, AM-2 ter — clones sous `F:\tmp\cp2-u4b1b4\`, `env -u` des 8 clés, TEMP sur F:)
- Oracle 7 gates sur `30a2eee` : tous exit 0, **949/947/0/2** (mêmes 2 skips nommés). Fusion à blanc sur `lot/etude-suite` @ **`674cf9a`** (HEAD du moment) → `4cfeb84`, 0 conflit, 8 blobs = 30a2eee, oracle fusionné **953/951/0/2**.
- **25/25 mutants** du worker tués par leur test nommé (harnais recopié, seules `TREE/TMPF` changent — diff consigné) ; **7/7 mutants propres** VX-* tués (VX-G1 égalité retirée, VX-G2 `<=`→`<`, VX-G3 libellé `RULE` dérivé — tué via C-12 enfant, VX-G4 `c_e2` lu à B_fresh ; VX-I1 lookback sans arrêt, VX-I2 borne `B0−1`, VX-I3 raw écrit malgré STOP). Goldens `4ed4c31e`/`deffbb6b` intacts.
- REF re-mesure (`ref-measure.mjs` non modifié) : B1 = B2 = `82544163…`/`e2c3ff88…` = constantes committées. Contrôles C-7-bis / C-9-bis / réducteur gelé / C-10-bis / sonde CLI + C-12 sur artefacts produits par les scripts réels : exit 0/0/0/0, GO→0, STOP→3.
- A-6 : **14/14** invariants LF identiques à `INVARIANTS-AFTER.txt` ; R-25 pathspec verbatim `ci.yml:65` = **795**.
- **Ruling R-1b4-2, instance exacte** `drpc.org,mevblocker.io,tenderly.co` (jamais rejouée par le worker) : GO exit 0/C-12 0, STOP exit 3/C-12 3, 3 ledgers d'opérateur. Précision : sous bouchon cela prouve que le code accepte/route les trois étiquettes et que verdict→exit→C-12 tient, pas que `tenderly.co` sert `eth_call` en réel (effet borné : NoQuorum ⇒ STOP).
- (c) export RÉEL `--out` à 030fe06 et 30a2eee : `diff -rq` hors manifeste = **0 fichier** (330/330) ; seul `excluded_tests[]` gagne l'entrée.
- ERRATUM O-6 : golden prober `4ed4c31e` identique dans les runs 1-3 (21:18-21:30 UTC, avant la coupure) et final ⇒ reconstruction du prober byte-exacte **confirmée par pièces** ; sonde : golden pré-coupure `1cec9b1d` ≠ final `deffbb6b` (retouche post-reconstruction) ⇒ « byte-exact » **invérifiable** pour la sonde, sans conséquence : ce sont les octets finaux (= blob 30a2eee) que mon rejeu prouve. `nul-evidence` : 100 % NUL, incident réel.

## 3. Checklist
CA-1 conforme (C-1..C-9 du cp-1 chacune localisable) · CA-2 conforme (R-1b4-1 prouvé : le scoreur gelé ne lit que `required`, observé par Proxy, digests A/B inchangés ; R-1b4-2 fail-closed, rejoué) · **CA-3 correction C-V-1** (amendement ADR hors diff, acte G7) · CA-4 conforme · CA-5 conforme (7 MAST, chacun avec mutant rouge) · CA-6 conforme sous condition G2 · **CA-7 corrections C-V-2/3/4** · **CA-8 correction C-V-1** (`error_origin` des 10 D-n absents ; R-1 conforme `claude-opus-5-5[1m]`) · CA-9 conforme · CA-10 conforme · CA-11 durci conforme (3 tuyaux exécutés depuis l'artefact réel : prober→raw→réducteur gelé **enfant**→scoreur ; `U3-realized` réel→helper→prober→scoreur ; sonde→fichier→C-12 **enfant** ; brut *book* du test 8 = enveloppe hors tuyaux du lot, déclaré ; état `upcoming`) · Anti-close n-a (identifiants neufs = constantes on-chain publiques des FAITS committés, reste synthétique).

## 4. Adjudications
(a) 10 D-n **fondées** (D-3/D-5 corrigent l'ADDENDUM, D-8 le prereg :262-263, D-1/D-4 la lettre mission/prereg ; D-2/6/7/9 non-incidents ; D-10 = ruling). (b) **ADDENDUM-2 daté séparé**, `eb7ad29b` intact (cité par 6 artefacts) ; les deux sha au SIDECAR (encore vide) avant 2c-bis. (c) prouvé, aucun octet exporté ne change. (d) branchement conforme. (e) grille `error_origin` : D-1 orchestrateur ; D-3, D-5, D-10 orchestrateur (ADDENDUM) ; D-4, D-8 planificateur (prereg) ; O-6 orchestrateur + infrastructure. (f) « GARDE-FSYNC-1 étendu aux worktrees » = **artefact de la coupure, hors domaine** (rpc-guard ledger ≠ sources non committées) ⇒ item procédural séparé.

## 5. Décision : ACCEPTE-AVEC-CORRECTIONS (liste fermée)
- **C-V-1** (bloquante au fold ; orchestrateur ; déclencheur G7) : insérer `F:\tmp\u4b1b4\ADR-amendement.md` dans ADR-U4b ; journal de provenance avec `error_origin` par D-n (grille §4(e)) et O-6.
- **C-V-2** (docs-only ; orchestrateur ; avant l'étape 2c-bis) : ADDENDUM-2 daté = PREREG-DELTA §1 (a)-(e) **+ (f) D-10 opérateurs** (≠ « opérateurs du fill-ts ») **+ (g)** `mevblocker.io` exclu du prober (`:183`, RUNBOOK:142) mais admis à la sonde, effet borné STOP ; deux sha au SIDECAR.
- **C-V-3** (docs-only ; orchestrateur ; fusion avant `<HEAD_E1>`) : deltas RUNBOOK de PREREG-DELTA §2 (sha 0.6 re-mesurés sur l'arbre fusionné, 2c-bis, C-12, C-9-bis/C-10-bis, `P_ancre ∈ {2,3,5,9,17,33}`, Sidecar 5, OBS-1) ; épingler l'égalité RUNBOOK/`C12` du test.
- **C-V-4** (item formé ; orchestrateur ; déclencheur : tout G1 > 1 h ou worktree non committé lors d'une coupure) : reclasser en **WORKTREE-DURABILITY-1** (commit WIP au rendu G1) ; GARDE-FSYNC-1 inchangé.
- Item non bloquant OBS-1 (`model: "claude-opus-4-8[1m]"` du raw = auteur historique) : ruling au fold.
Aucune ESCALADE-INVESTISSEUR (rulings = lectures fail-closed ; pas de décision de valeur nouvelle).

**AM-1** — attrapé : instance R-1b4-2 jamais rejouée ; « byte-exact » sonde invérifiable ; D-10 et mevblocker absents du complément d'ADDENDUM ; `error_origin` absents ; GARDE-FSYNC-1 hors domaine ; (c) prouvé par export réel ; VX-G4/VX-I3 hors des 25, tués. Incident propre : chemin `\\$t` réduit par le transport Bash (A-13) ⇒ dossier parasite sous `F:\tmp`, retiré par `rm-nm.ps1`, aucun effet dépôt. Manqué : à signaler a posteriori.

## 6. Innocuité
`F:\Monark` : status vide en fin, HEAD avancé `7cdfb7c`→`c4b9b1e` par l'orchestrateur seul ; sha LF identiques avant/après (`u4-oracle-path.mjs a2b39d0e`, prereg `1971d9b1`, ADDENDUM `eb7ad29b`, FAITS `4f23216d`) ; `node_modules` intact. `F:\Monark-wt-u4b1b4` : `30a2eee`, propre, `4ed4c31e`/`deffbb6b` inchangés. Aucun `git` mutateur ; `node_modules` des 4 clones retirés par `rm-nm.ps1`.

Modèle résolu : claude-fable-5-1
