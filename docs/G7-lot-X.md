# G7 — Verdict d'orchestrateur, Lot X (export public + gate de langue)

- **Verdict** : **CLOS**. Rattachement : ADR-M004 D7 / D7 bis, D10 (lot X), D11 (test 42). Gates G0–G7 passés ; deux revues G2 (initiale + delta) CLOSES.
- **Provenance** : orchestrateur `claude-fable-5-1`, 2026-09-06. Preuves détaillées : `docs/G1-lot-X.md` (génération tracée), `docs/G2-lot-X.md` (revue initiale), `docs/G2-lot-X-delta.md` (revue delta des réserves D7 bis). Aucune donnée de seconde main.

## Gates
- **G0** — cadrage : ADR-M004 D7 (script d'export), D7 bis (4 réserves R1–R4), D11 (test 42). Rattachement présent.
- **G1** — génération tracée : `docs/G1-lot-X.md` (empreintes sha256, budget R-25 en formule). Fichiers du lot : `scripts/export-public.mjs`, `scripts/lang-gate.mjs`, `scripts/lang-exempt.json`, `scripts/export-exclude-tests.json`, `test/export-public.test.ts`, `package.json` (scripts d'export).
- **G2** — revue 100 %, réviseur ≠ générateur (instances Opus 4.8 séparées, contexte frais) :
  - Revue initiale : CLOS-AVEC-RÉSERVES (R1–R4), vérification byte-exacte des exemptions.
  - Revue delta (D7 bis) : **CLOS**, R1–R4 fermées par le code présent (`35e9863`, `export-public.mjs` sha `06f01c7e…`). Restauration des mutants **par copie** (jamais `git checkout` sur arbre non commis).
- **G3/G4/G6** — vérification/architecture/compliance : dépôt public simulé **vert** (g1 vide / g3 73/73 / g4 lint 0 + cliquet 67/92 artefact d'exclusion / g6 0 vuln) ; workflow vitrine dérivé de façon déterministe (push+pull_request, job `r25` retiré, jobs g1/g3/g4/g6 byte-identiques, SHA épinglés).
- **G5** — dette : zéro dette nue ; pendants formés (Q4 licence bloque la publication, pas le code ; enforcement/ exemptions inertes documentées).
- **G7** — présent verdict.

## Tests et mutants (test 42 `export_public_no_governance_no_french`)
Assertions (a)–(g) vertes. Mutants tués, revue delta :
- **M5** (court-circuit de la dérivation du workflow) → test 42(f) rouge. Discriminant.
- **M6 / MINE-B** (`docs/JOURNAL-PROVENANCE.md` FR glissé en liste blanche) → export **fail-closed** « forbidden governance path (blacklist) » ; jamais de masquage FR silencieux. Discriminant.
- Fail-closed prouvé hors harnais : entrée de liste blanche absente ⇒ exit 1, **répertoire non créé** (pas de fail-open) ; `--check` exit 1.

## R-25
Diff PR vs `origin/main`, exclusions D9 quater (`docs/G1-lot-*.md`, `docs/G2-lot-*.md`, `packages/*/docs/S2-*`, `package-lock.json`) : **≈ 936 lignes countables** < 1 205. Le présent G7 (`docs/G7-lot-*` non exclu) reste borné pour tenir sous la limite.

## Honnêteté et invariants
- **English-only** (D0.5) : `lang-gate.mjs` + `lang-exempt.json` conformes. Le seul jeton FR résiduel de `export-public.mjs` (`orchestrateur` ×2, commentaires) **n'était PAS exempté** — il passait par un angle mort du détecteur (aucun diacritique, hors `FR_WORDS`) ; corrigé en `orchestrator` (correction C3, checkpoint 2). Le fichier exporté ne porte plus aucun jeton FR. O3 résolu.
- **Contrats gelés (ADR-M001) intacts** : `git diff origin/main -- schemas/ packages/contracts` **vide** ; le lot ne touche que `scripts/`, `test/export-public.test.ts`, `package.json`.
- **Workflow vitrine dérivé honnête** : suppression du commentaire « Delivery flow » = 2 lignes **fausses dans la vitrine** (push y déclenche un run ; `r25` absent) ; l'égalité byte-à-byte des jobs prouve que rien de vrai n'est retiré. `error_origin` = orchestrateur.

## error_origin (assignés au G7) — complété au checkpoint 2 (correction C2)
- **Règle héritée du Lot V** (journal 2026-09-06) : l'incident d'écrasement de `ci.yml` par `git checkout` sur arbre non commis appartient au **Lot V** (`error_origin` = orchestrateur, déjà journalisé) ; aucun artefact du Lot X ne rapporte de récidive. Le Lot X **applique** la règle établie : restauration de mutant **par copie de fichier uniquement**.
- **R1 — `on: pull_request` seul dans le workflow exporté** → dérivation déterministe du workflow vitrine ; `error_origin` = orchestrateur. La règle (4) de la dérivation retire le commentaire « Delivery flow » (seule autre occurrence de `r25`, faux dans la vitrine) ; jobs g1/g3/g4/g6 byte-identiques.
- **R2 — LICENSE hors liste blanche non détectée par la conception D7** → `error_origin` = générateur (lecture D7 étendue à LICENSE en D7 bis).
- **R3 — statut d'`enforcement/` « à établir »** → tranché par D7 bis (liste blanche, script requis par le job g1) ; `error_origin` = orchestrateur.
- **R4 — exclusion `.md` FR vs liste noire de gouvernance** → liste noire évaluée **en premier** (fail-closed) ; `error_origin` = orchestrateur.
- **D7 n'avait pas simulé la CI du dépôt exporté** (finding G1 §9.1, 2 tests rouges) → `error_origin` = orchestrateur ; corrigé (addendum D7 : liste blanche atelier + `export-exclude-tests.json`).

## Observations (non promues en défaut ; consignées)
- **O1 (pendant formé, correction C1)** : test 42(f) ne détecte ni la **perte** d'un job ni un corps de job corrompu du workflow dérivé (la splice `/^ {2}\S/` s'arrête sur tout non-blanc en colonne 2 ; un commentaire indenté inséré entre `r25` et `g3` laisserait un corps `r25` orphelin — YAML cassé — tout en gardant 42(f) vert). Non défaut (code commis correct, prouvé). **Durcissement dû = assertion 42(f′)** : les **4 corps de job g1/g3/g4/g6 du workflow exporté sont byte-identiques à ceux de la source** (l'invariant « ensemble de jobs == {…} » est trop faible). **Propriétaire** : le lot qui touche `.github/workflows/ci.yml`, au plus tard la première publication de `KraidleAI/monark` ; consigné en ADR-M004 D7 ter.
- **O2** : R2(a) sans oracle de test (LICENSE factice masquerait une régression `TOLERATED_ABSENT`).
- **O3 (résolu, correction C3)** : `orchestrateur` (FR) en commentaires de `export-public.mjs` → `orchestrator` ; le détecteur de langue avait un angle mort (aucun diacritique, hors `FR_WORDS`) qui l'aurait laissé passer.
- **O4** : vert distant réel = vérification orchestrateur à la première publication de `KraidleAI/monark` (R-20). Le dépôt public étant public, minutes CI gratuites.

## Interdits respectés
Aucun `packages/**`/`schemas/**` touché ; `package-lock.json` inchangé par le lot ; aucun commit/push par un worker (R-19/R-20) ; aucune poussée vers `KraidleAI/monark` (l'export reste simulé jusqu'au checkpoint 2 / Q4 licence).

## Suite
Acceptation validateur-humain (checkpoint 2) → PR sur `KraidleAI/monark-governance` → 5 jobs CI verts → merge sur `main`. La première publication réelle de `KraidleAI/monark` reste **pendante** (Q4 licence Apache-2.0 non tranchée).
