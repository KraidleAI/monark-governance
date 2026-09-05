# CHECKPOINT 2 — Acceptation du livrable Phase 1 MONARK (ADR-M002)

Avis du `validateur-humain` (modèle résolu `claude-fable-5-1`, instance séparée, contexte frais, checklist fermée CA-1..CA-10 + CA-H/U/D/0), rendu le 2026-09-05 en texte final (Write indisponible dans sa session) et persisté ici **tel quel** par l'orchestrateur. Limites déclarées par le validateur : ni Bash ni Write — CI non relancée par lui, comparaison source/copie ADR par lecture intégrale (pas de hash).

## Décision : ACCEPTE-AVEC-CORRECTIONS (liste fermée, 6 items)

Aucun déclencheur de refus ni d'escalade investisseur.

**Bloque le commit Lot H** :
1. Relecture delta-2 Opus 4.8 (instance séparée) du diff post-delta Lot H : `run.ts` l.164-165, `report.ts` l.134/144-145, `test/s2.test.ts` l.19-25, rapport + TSV régénérés ; recalcul awk M2-clean/M2-flip (240 lignes) et sha256 `16003409…` ; consignée au journal.

**Bloquent le commit main** :
2. `docs/JOURNAL-PROVENANCE.md:140-141` — barrer « siège worker `claude-opus-4-8` », écrire `claude-fable-5-1` ; citer les Gate-0 des workers Opus survivants.
3. ADR-M002 D10 S2a (l.229-230), D10 C9 (l.239-242), D11 item 14 (l.263-264) — amendements datés barrés : jeu 3/2/3/1 produit par le vrai `gate()` sur verdicts à scores déclarés + mutants, pas par l'oracle ; S2a = tirage seedé n=300 accuracy 0,96 ; recopie Clawpumptech, md5 cité dans G7.
4. G7 §3.b — ajouter le pendant (e) (présentation S2b) avec chiffres synthétiques et échéance « lecture du S2b réel ».
5. G7 §2 G3 — réserve : tests racine CA-0 hors `tsconfig include` (`tsconfig.json:23`).

**Bloque toute monstration publique, pas le commit local** :
6. CA-D1 visuel — aucune capture ; former le pendant investisseur (ou amender CA-D1 en preuve machine).

## Tableau CA (résumé du validateur)
CA-1 correction (D10/D11-14 périmés face au code) · CA-2 conforme · CA-3 conforme · CA-4 conforme · CA-5 conforme · CA-6 correction (diff post-delta H sans revue) · CA-7 correction ((e), CA-D1, tests racine hors tsc) · CA-8 correction (journal l.140-141 faux non barré) · CA-9 conforme-avec-correction · CA-10 conforme. CA-H1..H5, CA-U1..U3, CA-D2..D5, CA-0 conformes ; CA-D1 oracle conforme, visuel non fait.

## Ligne AM-1
Attrapé : ADR D10/D11-14 périmé ; journal l.140-141 ; diff post-delta H hors revue ; (e) et CA-D1 visuel absents du G7 ; tests racine hors `tsc`. Non vérifiable par le validateur : passage effectif des tests à l'état final, md5.

## Traitement par l'orchestrateur (2026-09-05)
- (1) delta-2 lancée (`docs/G2-lot-H-delta2.md` attendu) — **bloquant jusqu'à retour**.
- (2) fait : cellules barrées + `claude-fable-5-1` ; Gate-0 D cité (`G2-lot-D.md:4,101`) ; Gate-0 des modules H : **non conservé** (session morte), consigné tel quel.
- (3) fait : D10 S2a, D10 C9, D11-14 amendés (barré + daté) ; copie ≡ source md5 `20df1e93…`.
- (4) fait : pendant (e) au G7 §3.b avec chiffres et échéance.
- (5) fait **par correction, pas par pendant** : `tsconfig.json include` étendu à `test/**/*.ts` ; `tsc --noEmit` exit 0 sur main et sur le worktree H.
- (6) fait : pendant investisseur CA-D1 visuel formé au G7 §3.b.
