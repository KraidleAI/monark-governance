# G2 — Revue du lot EXPORT-CLEAN (MONARK)

- **Relecteur** : worker G2, instance séparée, contexte frais. **Modèle résolu** : `claude-opus-4-8[1m]`
  (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 non utilisé). Contrôle de résolution R-1 déclaré.
- **Date** : 2026-09-21. **Worktree** : `F:\Monark-wt-xclean`, branche `lot/export-clean`.
- **Base** : `671b8f298d1d7c86317545a12640fc8e59addfe0` ; **HEAD** : `74a00589faa454620ebd9ae7c3f9c7d68911a243`
  (commit unique du lot). Working tree **propre** (`git status --porcelain` vide avant/après).
- **Méthode** : re-exécution. Mutants par sauvegarde `cp` + sha256, restauration byte-exacte (jamais
  `git checkout`/`stash`). Aucune écriture dans le dépôt, aucun commit, aucun réseau. `npm ci`/`install`
  jamais lancé sur la jonction. Scratch `F:\tmp\g2-xclean\`.

## VERDICT : PASS-AVEC-CORRECTIONS
Les 3 livrables sont présents, fonctionnels, fail-closed, et **jamais** via `STRUCTURAL_BLACKLIST`. Export
final propre (0 chemin Windows, 0 `PRODUITS`, 4,25 Mo). Tous les mutants nommés (M-a, M-b, M-2, M-3a, M-3b)
se comportent correctement. Suite 553/553, CI verte, R-25 = 359. **Deux angles morts démontrés dans la garde
(livrable #3)** + deux points mineurs → corrections, pas FAIL (aucune fuite courante, comportement de fond
correct, suite verte).

---

## 1. Livrables (les 3) — corrects, fail-closed, hors blacklist

### Livrable #1 — exclusion déclarative des données orphelines : CORRECT
- `scripts/export-exclude-data.json` (liste fermée `{reason, data:[4]}`) + `loadExcludedData` (fail-closed) +
  canal `excludedData` dans `collectFiles` (ordre mesuré : blacklist → excludedTests → **excludedData** →
  dormant → French-.md ; l'exclusion précède la règle French-.md, donc `PROVENANCE-u4.md` est retirée comme
  DONNÉE, pas par langue) + `manifest.excluded_data`. **JAMAIS `STRUCTURAL_BLACKLIST`** (vérifié : le canal
  est un `continue` non-fatal ; la blacklist reste un exit-1 dur en (1)).
- Mesuré : `collectFiles(ROOT)` → kept=284, excludedData=4, excludedTests=3, frenchMd=0, structViol=0.
- Fail-closed re-exécuté : fichier absent → exit 1 ; JSON cassé → exit 1 ; `data` non-tableau → exit 1
  (messages « fail-closed, D7 septies ») ; `data:[]` → exit 0 (vide licite).
- Guards `test/export-hygiene.test.ts` (a)+(b) verts ; mutants M-a/M-b rouges (§3).

### Livrable #2 — chemin local retiré de `PROVENANCE-u3.md:42` : CORRECT (cosmétique)
- `F:\PRODUITS\…\u3-reads.jsonl` → `<U3_RAWS_DIR>/u3-reads.jsonl` ; sha sibling `0afaf605…` inchangé.
- `series_pinned_are_declared_and_hashed` **vert** (re-exécuté 1/1) : `SERIES_DATA_EXTS={.json,.jsonl,.csv}`,
  `continue` sur autre extension → n'hache jamais un `.md` ; aucun sha déclaré modifié. Aucun pin test-gardé
  cassé. Export final : **0 `PRODUITS`**.

### Livrable #3 — garde chemins Windows dans `export` ET `export:check` : FONCTIONNELLE, 2 angles morts
- Présente dans `doExport` (exit 1 avant écriture) ET `doCheck` (bad=true, hors scope). Regex
  `(?<![A-Za-z])[A-Za-z]:[\\/][\w.$~-]` épargne `http://`, `C:` de prose, source de regex (batterie testée).
- **Les DEUX chemins re-exécutés mordants** (livrable = « export ET export:check ») : `export` sous M-2/M-3a →
  exit 1 (§3) ; **`export:check --scope root` sous M-3a re-semé → exit 1** (« check FAILED … reader-local …
  record.ts:11:23 F:/tmp/seed-check/book.json ») ; baseline arbre propre `--check --scope root` → exit 0 ;
  `npm run export:check` nu (tous scopes) sur arbre propre → exit 0 (« check OK — 0 forbidden path »). `--scope
  root` utilisé pour isoler la garde des scopes non traduits (hikae/ukemi/atelier/monark, test 42 L269).
- Export courant : `node scripts/export-public.mjs --out …` → exit 0 ; scan adversarial (TOUTES extensions,
  y compris `.mts`/`.svg`/sans-extension non balayées) → **0 hit**. CA-5 satisfait sur le contenu actuel.
- **MAIS deux angles morts** → C-G2-1 et C-G2-2 (§4).

---

## 2. Tailles avant/après (re-mesurées)
| | fichiers kept | octets | Mo (déc.) | méthode |
|---|---|---|---|---|
| AVANT | 288 | 10 373 809 | 10,37 | build avec `data:[]` (mutant, restauré) |
| APRÈS | 284 | 4 249 625 | 4,25 | build réel HEAD |
- Delta = 10 373 809 − 4 249 625 = **6 124 184** ≈ Σ(4 fichiers u4) = **6 123 672** (U4-book 5 957 519 +
  U4-oracle-path-e2 17 058 + U4-scores-e2 142 250 + PROVENANCE-u4 6 845) + ~512 (delta manifest). Réconcilié.
- Concorde avec G0 (« 288 fichiers, 10 367 633 o » ; écart 6 176 o = édits cosmétiques PROVENANCE-u3/record).
  Attendu ~10,37 → ~4,25 Mo : **confirmé**.
- Convention : la colonne « fichiers kept » **exclut** `EXPORT-MANIFEST.json` (288/284) ; la colonne octets
  **inclut** le manifest (mesure `find` sur 289/285 fichiers de sortie).

## 3. Mutants nommés (tous conformes ; restauration sha256 = YES)
| Mutant | Attendu | Mesuré |
|---|---|---|
| M-a (add weth-book.fixture.json) | guard (a) ROUGE | ROUGE : consommateur exporté `PROVENANCE-weth-book.md` cite le basename (garde plus large que l'ADR qui prédisait `ukemi.test.ts`) |
| M-b (retire U4-book-23545087.json) | guard (b) ROUGE | ROUGE : orphelin `U4-book-23545087.json` (seul consommateur `ukemi-u4-scores.test.ts` exclu) |
| M-2 (restaure F:\PRODUITS dans PROVENANCE-u3) | garde Windows ROUGE | `export` exit 1 : `PROVENANCE-u3.md:42:31 F:\PRODUITS\…` |
| M-3a (seed F:/tmp dans record.ts KEPT) | `export` exit 1 | exit 1 : `record.ts:11:23 F:/tmp/seed-m3a/book.json` |
| M-3b (windowsPathViolations → []) | chemin PART, exit 0 | exit 0 ; chemin semé **shipped** (1 occ.) — garde porteuse |

Fail-closed loader (3) + `data:[]` (1) re-exécutés (§1). **`export:check` mordant re-exécuté** : M-3a re-semé →
`--check --scope root` exit 1 (§1, livrable #3). Test 42 rougit aussi sous M-3a (couverture incidente, C-G2-2).
Recherche de voisins survivants : §4 (`.mts`/`.svg`/sans-ext, `D:/` fin de ligne, UNC, nom calculé).

## 4. Constats (C-G2)

### C-G2-1 — garde #3 AVEUGLE aux fichiers texte exportés `.mts` (et `.svg`) — error_origin : worker — MINEUR
- **Preuve bout-en-bout** : chemin `F:/tmp/blind-mts/book.json` semé dans l'EXPORTÉ
  `scripts/grep-forbidden.d.mts` → `node export-public.mjs --out …` **exit 0** ET `--check --scope root`
  **exit 0** ET le chemin **atterrit dans le miroir** (1 occ. dans la sortie). Fail-OPEN dans une garde
  fail-closed.
- **Cause** : `scripts/export-public.mjs` `PATH_SCAN_TEXT_EXTS` est une **allowlist d'extensions** qui **omet
  `.mts`, `.svg`, et l'extension vide**. Or `kept` (284) contient des fichiers TEXTE exportés dans ces classes :
  `scripts/grep-forbidden.d.mts` (whitelisté, `extname(".d.mts")==".mts"`) ; `apps/site/app/{apple-icon,icon}.svg`
  (XML) ; **sans extension** `LICENSE`, `skills/monark/LICENSE`, `apps/site/content/.gitkeep`. Tous
  `continue`-és par `windowsPathViolations`. Guard (a) (`export-hygiene.test.ts:112`) hérite du même filtre →
  même angle mort en (a).
- **Aggravant** : le commentaire du code se dit « superset de `scannable`, car un chemin peut se cacher
  partout » et ajoute délibérément `.jsonl` — mais laisse un `.d.mts` exporté hors périmètre, alors que le lui
  même whiteliste `grep-forbidden.d.mts`. (Classe pré-existante non gatée par lang-gate, mais la NOUVELLE garde
  avait l'occasion et la doctrine de la couvrir.)
- **Non-bloquant** : scan actuel = 0 fuite ; probabilité faible ; correction (balayer par « texte non-binaire »
  plutôt que par allowlist d'extensions ; a minima ajouter `.mts`,`.cts`,`.svg` + sans-extension).

### C-G2-2 — garde #3 : branche POSITIVE exercée seulement si l'arbre porte déjà un chemin (pas de test qui SÈME) — error_origin : worker — MINEUR
- **Nuance mesurée** (correction du sur-énoncé) : le contenu-porteur EST couvert. Test 42 exécute le VRAI
  script sur une copie d'arbre entier : sous M-3a re-semé dans l'arbre, **test 42 ROUGIT** (mesuré : 1 pass /
  1 fail, « export FAILED … reader-local ») car l'export exit 1 → `execFileSync` throw. Donc M-2/M-3a ONT un
  tueur commis (42).
- **Le trou exact** : **aucun test commis ne SÈME** un chemin ; la branche positive n'est exercée que si
  l'arbre en porte déjà un. Une garde **neutralisée sur arbre propre** est invisible : `windowsPathViolations`
  → `return []` laisse `export-hygiene.test.ts` **VERT** et 42 vert (arbre propre = 0 chemin à attraper).
  `grep -rn windowsPathViolations test/` = un seul **commentaire** (`export-hygiene.test.ts:20`) ; seul
  `windowsAbsPathHits` (fonction pure) est testé unitairement.
- **Règle Branchement (investisseur)** : le tableau G0 §2 ligne 3 annonce « Test d'intégration non-LLM …
  + mutant » — le mutant de mécanisme (M-3b) n'est pas commis. Couverture incidente sur le CONTENU, jamais sur
  le MÉCANISME.
- **Correction** : test commis qui SÈME un chemin dans un fichier kept d'un arbre temporaire minimal →
  `--check`/`--out` exit 1 ; y inclure un cas `.mts`/`.svg`/sans-extension (fermerait aussi C-G2-1 en couverture).

### C-G2-3 — résidus de la regex — MINEUR (note de risque)
- `D:/` / `C:\` en **fin de ligne** (racine de lecteur sans segment) : **non attrapés** (regex exige
  `[\w.$~-]` après le séparateur). Fuite = lettre + racine seule, peu signifiante. `\\?\C:\Users` (préfixe
  long) : **attrapé** (OK). UNC `\\host\share` : **non attrapé** — **hors périmètre déclaré** (`[A-Z]:\`
  lettre de lecteur), à noter, pas un défaut.

### C-G2-4 — le correctif ré-injecte le chemin privé réel dans un test (non exporté) — MINEUR
- **Deux choses distinctes** dans `test/export-hygiene.test.ts` (test racine, NON exporté) :
  (a) **contradiction interne** : la ligne 155 affirme « THIS file carries no literal drive path », mais les
  commentaires L159/L160/L161 portent TOUS un chemin de lecteur littéral (`// F:\PRODUITS\...\u3-reads.jsonl`,
  `// C:\work\book.json`, `// F:/tmp/u1a-hard/book.json`) — la promesse ne vaut que pour le CODE (assemblé au
  runtime), pas pour les commentaires ;
  (b) **fuite du chemin privé RÉEL** : uniquement L159, dont les segments `etude-2026-09-20` / `u3-raws-clean`
  sont les vrais noms de dossiers (L160/L161 sont fictifs). Un chemin fictif aurait suffi. Pas de fuite publique
  (root test non whitelisté), mais réintroduit dans le privé le chemin exact que le lot retire de PROVENANCE-u3.
  Correction : anonymiser L159.

### Voisin « fixture exclue lue via `readFileSync(join(...))` sans quote littérale » — MOOT
- Guard (a) matche le basename littéral (`referencesToken`), guard (b) le nom entre quotes (`readsFixture`) ;
  un nom calculé (`` `U4-book-${b}.json` ``) échapperait aux deux (filet = ENOENT en CI exportée, 42 e).
- **Mais aucun consommateur** : `grep -rln "fixtures/ukemi/u4/" apps/sentinel/test` = **vide** ; les seuls
  lecteurs (`ukemi-u4-scores/-governance.test.ts`) sont exclus. `ukemi-u4a.test.ts:157` lit
  `weth-book.fixture.json` (fixture NON exclue, différente). Donc rien à échapper, littéral ou calculé.

### Note (PAS un défaut) — mentions U4-*/PROVENANCE-u4 dans l'export
- Scan borné : les seules mentions `[EXCLUDED-REF]` sont (a) `EXPORT-MANIFEST.json` `excluded_data[]` (registre
  d'exclusion **voulu**, assuré par test 42 (d bis)) et (b) `export-public.mjs:156` (commentaire décrivant le
  glob de répertoire, pas un basename). Faux positifs écartés : `U4-H1` (label d'hypothèse, record.ts:287),
  `U4-inputs.jsonl` (cache resume hors-repo, resume.ts/ukemi-record.test.ts — fichier NON exclu). Donc
  « 0 mention » vaut pour toute référence **vivante/pendante** ; aucune donnée exclue ne ship, aucun renvoi cassé.

## 5. Modifications cosmétiques (Q4) — vérifiées purement cosmétiques
- `record.ts:10` : commentaire d'usage `F:/tmp/…` → `/tmp/…`. Aucune sémantique.
- `ukemi-record.test.ts:108-109` : args CLI `F:/tmp/…` → `/tmp/…` **et** `deepEqual` attendu ajusté
  symétriquement. `parseUkemiArgs` stocke `--out`/`--resume` en **chaînes opaques** (aucun `resolve`) →
  édition sémantiquement nulle. Aucun sha test-gardé cassé.
- `PROVENANCE-weth-book-lattice.md:38` : prose `F:/tmp` → `/tmp`. Fixture sha `89085f7c…` inchangé ;
  `lattice_weth_fixture_replays_bit_identical` vert (dans 553/553). N/A `series_pinned` (racine hors série).

## 6. Fix `test/skills.test.ts` (Q5) — LÉGITIME, ne masque aucun défaut
- La copie de `export-exclude-data.json` dans l'arbre temporaire est **nécessaire** : `collectFiles` appelle
  `loadExcludedData` (fail-closed, `process.exit(1)`) **en tête**, avant le calcul `missingRequired`. Sans le
  fichier, le process meurt AVANT l'assertion. La copie **reflète le motif existant** (export-exclude-tests.json
  + lang-exempt.json déjà copiés). C'est la conséquence correcte d'un nouvel input fail-closed, pas un « input
  obligatoire » symptôme de mauvaise conception (design pré-existant, cohérent).

## 7. Suites + R-25 (re-exécutées, offline forcé pour honorer « aucun réseau »)
- `npm run test` : **tests 553 / pass 553 / fail 0 / skipped 0** (exit 0).
- `npm run ci` (`gate:vocab && typecheck && test`) : exit 0 — gate:vocab OK (186 fichiers) ; `tsc --noEmit`
  clean ; test **553/553**.
- **Tension consignée (non contournée)** : test 42 (e) `export_public_no_governance_no_french` lance un
  **vrai `npm ci` puis `npm run ci`** dans une copie temporaire (pas la jonction). Exécuté avec
  `npm_config_offline=true` (cache chaud `F:\cache\npm`) → aucun egress réseau ; test 42 vert offline (34 s).
  Le test n'expose ni skip ni flag offline : si le cache était froid, il exigerait le réseau — à connaître.
- `export_public_no_governance_no_french` et `export_public_derived_jobs_are_byte_identical` : **verts**.
- **R-25** : `git diff --shortstat 671b8f2...HEAD -- . <pathspec verbatim ci.yml:65>` = 347 ins + 12 del =
  **359** (total 482 − 123 `docs/**/*.md` [G0 76 + ADR 47]). **Conforme à l'attendu 359.**

## 8. Sécurité / secrets
- `git diff | grep '^+'` : **aucun secret** (seul `file:///etc/passwd`, chaîne de test négative de la garde).
- `F:\PRODUITS` sur lignes `+` : 4 hits, **tous non exportés** — G0:65/108, ADR:158 (docs/ blacklisté+FR),
  `export-hygiene.test.ts:159` (root test, cf. C-G2-4). Export final : **0 `PRODUITS`, 0 chemin Windows**.
- Aucun `claude-opus-5`, aucun token/clé du contexte dans le diff.

## 9. Provenance / clôture
- Toutes les mutations restaurées byte-exact (sha256 : export-exclude-data, PROVENANCE-u3, record.ts,
  export-public.mjs, grep-forbidden.d.mts = tous YES). `git status --porcelain` vide, HEAD = 74a0058.
- Vérifié par worker G2 `claude-opus-4-8[1m]`, effort max, 2026-09-21. Sortie destinée à la vérification
  adversariale de l'orchestrateur (R-21). Verdict à prononcer par l'orchestrateur (R-20 : le G2 ne clôt pas).
