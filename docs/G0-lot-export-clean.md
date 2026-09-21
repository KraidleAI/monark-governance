# G0 — Lot EXPORT-CLEAN (hygiène du miroir public)

- **Modèle worker** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`, effort max ; Opus 5 banni). Contrôle
  de résolution R-1 déclaré au lancement.
- **Date** : 2026-09-21. **Worktree** : `F:\Monark-wt-xclean`, branche `lot/export-clean`, base `671b8f2`.
- **Origine** : item formé au G7 de U-4a (CHANTIERS §G7 U-4a, 2026-09-21 02:52 UTC ; ADR-M004 **D7 sexies**,
  trois volets (i)/(ii)/(iii)). Résolu ici par l'amendement **D7 septies** (daté du jour).
- **Gate** : G0 (cadrage). Aucun commit, aucun push, aucun appel réseau (R-20). Sortie vérifiée
  adversarialement (R-21). `node_modules` = JONCTION → jamais `npm ci`/`npm install`.

## 1. Problème (mesuré)
1. **Données orphelines `upcoming`** : l'export public embarque `apps/sentinel/test/fixtures/ukemi/u4/*`
   (mesuré **6 123 672 o**, dont `U4-book-23545087.json` = 5 957 519 o) alors que leur SEUL consommateur de
   test, `apps/sentinel/test/ukemi-u4-scores.test.ts`, est **exclu** de l'export
   (`scripts/export-exclude-tests.json`) et que les scripts qui les lisent (`scripts/census/u4-*.mjs`) ne sont
   pas dans la liste blanche. Export courant mesuré : **288 fichiers, 10 367 633 o**.
2. **Chemin local exporté** : `apps/sentinel/test/fixtures/ukemi/u3/PROVENANCE-u3.md:42` porte
   `F:\PRODUITS\…\u3-reads.jsonl` (chemin de poste). u3 RESTE exporté (sa série est aussi consommée par le test
   racine `test/u3-realized.test.ts`, non exporté), donc le chemin doit être neutralisé **à la source** (même
   traitement que `PROVENANCE-u4.md` déjà nettoyé en `88d28a5` : jeton `<U3_RAWS_DIR>`).
3. **`export:check` aveugle** : le gate rend « 0 forbidden path » sur un export qui contient des chemins Windows
   absolus. Balayage mesuré (regex JS `(?<![A-Za-z])[A-Za-z]:[\\/][\w.$~-]`) = **5 hits** :
   `apps/sentinel/src/ukemi/record.ts:10` (`F:/tmp/…`, commentaire), `…/u3/PROVENANCE-u3.md:42` (volet 2),
   `apps/sentinel/test/ukemi-record.test.ts:108-109` (`F:/tmp/…`, args de test),
   `packages/ukemi/test/PROVENANCE-weth-book-lattice.md:38` (`F:/tmp`, prose). Les 4 hors-u3 sont des chemins
   jetables triviaux → corrigés en POSIX `/tmp/…`.

## 2. Livrables et tuyaux (branchement)
| # | Livrable | Entrée (produit par) | Sortie (consommée par) | État | Test d'intégration non-LLM |
|---|---|---|---|---|---|
| 1 | `scripts/export-exclude-data.json` + exclusion dans `collectFiles` (JAMAIS `STRUCTURAL_BLACKLIST`) + `manifest.excluded_data` | liste fermée commise | `export-public.mjs` `doExport`/`doCheck` (miroir) ; `EXPORT-MANIFEST.json` | branché | `test/export-hygiene.test.ts` guards (a)+(b) sur `collectFiles(ROOT)` ; test 42 : `manifest.excluded_data == cfg.data` |
| 2 | `PROVENANCE-u3.md:42` → `<U3_RAWS_DIR>/u3-reads.jsonl` | worker | fichier exporté (miroir) | branché | volet 3 (garde Windows) + `series_pinned` reste vert (n'hache pas les `.md`) |
| 3 | garde chemins Windows dans `export:check` **et** `export` (fail-closed), fn exportée `windowsAbsPathHits` | `collectFiles(ROOT).kept` | exit 1 avant publication du miroir | branché | `test/export-hygiene.test.ts` : matcher positifs/négatifs + mutant |

- **Chemin SERVI** : le miroir public est produit par `scripts/export-public.mjs` (ADR-M004 D7). La garde (3)
  est exécutée à `export:check`, lancé **avant la publication du miroir** (`export:check` absent de la CI = item
  déjà formé, CHANTIERS 2026-09-20 19:35, propriétaire orchestrateur — **cité, non re-formé**). La garde (1) et
  la garde (3) sont **servies en test** par le test racine (non exporté) qui rejoue `collectFiles(ROOT)`.

## 3. Critères d'acceptation
- **CA-1** : après exclusion, `apps/sentinel/test/fixtures/ukemi/u4/*` **absent** de l'export ; taille de
  l'export baissée de ~6,12 Mo (mesure avant/après).
- **CA-2** (guard a) : aucune donnée de `export-exclude-data.json` n'a un consommateur EXPORTÉ (aucun fichier
  `kept` ne cite son basename). Mesuré vide sur l'arbre courant.
- **CA-3** (guard b) : aucun test exclu (`export-exclude-tests.json`) ne laisse une fixture dont **tous** les
  consommateurs de test (globs `package.json`, `test/` racine inclus) sont exclus, encore exportée. u3 NON
  flaggé (consommé par `test/u3-realized.test.ts`, vivant).
- **CA-4** (volet 2) : plus aucun `F:\`/`F:/` dans `PROVENANCE-u3.md` ; sha LF re-consigné (voir §5).
- **CA-5** (volet 3) : `export:check` **et** `export` échouent (exit 1) si un fichier exporté porte un chemin
  Windows absolu ; matcher : ne PAS attraper `http://`, un `C:` de prose sans séparateur, ni une source de
  regex ; **0 hit** sur l'export après corrections.
- **CA-6** : `npm run test` + `npm run ci` verts (décomptes exacts) ; export dérivé (test 42 (e)) vert.
- **CA-7** : R-25 mesuré < 1 205 ; docs français admis sous `docs/` (SKIP_DIRS de `lang-gate`), tout fichier
  **exporté** en anglais.

## 4. Mutants (un par garde ; sauvegarde + sha256, restauration byte-exacte ; jamais `git checkout`)
- **M-a** (guard a) : ajouter `…/weth-book.fixture.json` (consommé par le test EXPORTÉ `ukemi.test.ts`) à
  `export-exclude-data.json` ⇒ guard (a) ROUGE (consommateur exporté).
- **M-b** (guard b) : retirer `U4-book-23545087.json` de `export-exclude-data.json` ⇒ il redevient `kept`,
  consommé par le seul test exclu ⇒ guard (b) ROUGE.
- **M-2** (volet 2) : restaurer `F:\PRODUITS\…` dans `PROVENANCE-u3.md` ⇒ garde Windows ROUGE.
- **M-3** (volet 3) : (a) semer un chemin de lecteur dans un fichier KEPT (`record.ts`, sauvegarde + sha,
  restauration byte-exacte) ⇒ `export` échoue (exit 1) — la garde MORD ; (b) neutraliser
  `windowsPathViolations` (`return []`) ⇒ le chemin semé PART dans l'export (exit 0) — garde porteuse.

## 5. Re-épinglage sha (volet 2) — PREUVE
- `series_pinned_are_declared_and_hashed` n'hache QUE `.json/.jsonl/.csv` (`ci-gates.test.ts` `SERIES_DATA_EXTS`
  + `continue` sur extension non-data) → **jamais** un `.md`. Aucun test n'exige le sha de `PROVENANCE-u3.md`.
- Les seules occurrences des sha modifiés sont des valeurs « après » de PLI de lots **clos** (`PLI-lot-u3.md`,
  `PLI-lot-u4a.md`, sous `docs/`, non exportés, non test-gardés). **Zéro pin test-gardé** ; les PLI historiques
  ne sont PAS réécrits (ce serait falsifier l'état de clôture de U-3/U-4a). Transitions old→new consignées dans
  le rendu + l'ADR.

## 6. Provenance
Généré par worker `claude-opus-4-8[1m]`, effort max, 2026-09-21, sur `671b8f2`. Réviseur : orchestrateur
(`claude-fable-5-1`), vérification adversariale R-21. Zéro dette à la clôture (P5).

## 7. PLI G2 — fold des constats C-G2-1..C-G2-4 (2026-09-21)
Revue `docs/G2-lot-export-clean.md` (PASS-AVEC-CORRECTIONS). Worker `claude-opus-4-8[1m]`, effort max, aucun
commit (R-20). Code touché (hors R-25 `docs/**/*.md`) : `scripts/export-public.mjs`,
`scripts/export-public.d.mts`, `test/export-hygiene.test.ts`.
- **C-G2-1** (renforce CA-5) : `windowsPathViolations` balaie tout fichier KEPT **texte par CONTENU**
  (`readTextOrNull` : octet NUL OU UTF-8 invalide ⇒ binaire, ignoré), plus par allowlist d'extensions
  (`PATH_SCAN_TEXT_EXTS` retirée). Ferme l'angle mort `.mts`/`.svg`/sans-extension (`grep-forbidden.d.mts`,
  `icon.svg`/`apple-icon.svg`, `LICENSE`, `skills/monark/LICENSE`, `.gitkeep`) ; binaires ignorés `png`/`jpg`/`cbor`.
  Guard (a) aligné. Preuve garde-ON : chemin semé dans `.d.mts` puis `LICENSE` ⇒ `export --out` ET
  `export:check --scope root` exit 1 (restaurés byte-exact).
- **C-G2-2** : test committé `export_windows_path_guard_bites_seeded_text_file` — SÈME un chemin dans une
  copie d'arbre (`.mts` + `LICENSE`) et exige exit 1 de `--check` ET de `--out` (branche POSITIVE du
  mécanisme, pas seulement du contenu). Isolation `--scope root` (vert sur arbre propre).
- **C-G2-3 (+ checkpoint-2 C-4)** : regex `(?<![A-Za-z])[A-Za-z]:(?:\\\\|[\\/])(?:[\w.$~-]|\s|$)` — attrape la
  RACINE de lecteur nue (`D:/`, `C:\`) en fin de ligne / avant un blanc, ET la forme ÉCHAPPÉE `"F:\\tmp\\x"`
  (backslash doublé d'un littéral JSON/JS — angle mort mesuré au checkpoint-2, 0 hit avant). **HORS PÉRIMÈTRE,
  déclaré** : UNC `\\host\share` (pas de lettre de lecteur) ; segment non-ASCII (`[\w.$~-]` sans flag `u`) ;
  texte **UTF-16** (NUL entrelacés ⇒ classé binaire) — aucun exporté n'est dans ces classes.
- **C-G2-4** : `test/export-hygiene.test.ts` — commentaire cohérent (positifs assemblés au runtime ⇒ code
  sans chemin littéral) ; vrai nom de dossier privé ANONYMISÉ (segments fictifs) — plus aucun `F:\PRODUITS\…` réel.
- **Mutants PLI G2 + checkpoint-2** (sauvegarde + sha256, restauration byte-exacte, jamais `git checkout`) :
  **M-3b** (`windowsPathViolations`→`[]`) ⇒ C-G2-2 ROUGE + chemin semé shipped (1 occ.) ; **allowlist
  restaurée** ⇒ C-G2-2 ROUGE (`.mts`/`LICENSE` manqués) ; **fin de ligne** (regex revertie) ⇒
  `windows_abs_path_matcher` ROUGE (positifs EOL), C-G2-2 vert ; **C-4 séparateur simple** (regex revertie à
  `…:[\\/]…`) ⇒ `windows_abs_path_matcher` ROUGE (positif échappé `F:\\…`), semis backslash-simple vert.
