claude-opus-5-5
# G1 — lot M-5c « archive des faits du journal hors arbre (`refs/journal/facts`), J-LINT figé, schéma `monark.journal.v2` non migrant, red-proof au journal » (ADR-METHODE-2 D8a, D10, D11 ; ligne M-5c l.60 et ses quatre plis datés) — journal

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant exact donné par le harnais ; palier de la mission, effort max ; instance fraîche, distincte de tout agent de M-5, M-5b, M-6, M-7).
- **Mission** : `F:/tmp/methode/mission-g1-m5c.md`, générée par `F:/Monark/scripts/mission/gen.mjs` (marque `cb0e268a`, sha `9eecb371…`) ; sha256 recalculé `983f70eeb357f1b3743c5cf23af9fd8e3e3257b51f73ecfcc9e0bbcd5283f02e` = reçu `F:/tmp/methode/mission-g1-m5c.recu.json` (vert, 12 codes à 0, head `cb0e268a`, 09:29:58Z) ; outils de l en-tête recalculés égaux : `lint.mjs` `4d1383c8…`, `launch.mjs` `fb6c277f…`, `run.mjs` `baad946c…`, `r25.mjs` `4d0544df…`, `red-proof.mjs` `6869fa3d…`, `REGLES-MISSION.md` `410dd919…` (base).
- **Base** `cb0e268a55914232612f11c275973cb7ed6d34dc` ; branche `lot/methode-m5c` ; worktree `F:/Monark-wt-m5c` modifié en place ; aucun git écrivant dans le worktree ni dans `F:/Monark` (lectures sous `GIT_OPTIONAL_LOCKS=0` ; `F:/Monark` : `status` vide et 0 ref `refs/journal/*`) ; tronc lu en cours de lot : `a44ca123` (commits de registre seuls : `git diff --stat cb0e268a a44ca123 -- docs/journal scripts test .github` vide).
- **Cadre tenu** : TEMP `F:/tmp/methode/m5c/g1/tmp` (= `os.tmpdir()` des tests) ; clones `--no-local` sous `F:/tmp/methode/m5c/g1/clones/` (`rp` red-proof, `mut` et `mut2` mutants, `trunk`, `c2`, `trunk2`, `c3` rejeu réel) ; la ref `refs/journal/facts` n a été écrite que dans des dépôts jetables des tests et dans `clones/trunk`, `clones/trunk2` (puis fetchée dans `c2`, `c3`) ; aucun réseau ; rien sur C: ; jonctions `node_modules` du worktree posées par `F:/tmp/dojo/drand-1a/mk-nm.ps1` (10:10Z, 10:44Z), retirées par `F:/tmp/dojo/drand-1a/rm-nm.ps1` (10:32Z, 10:46:39Z ; `F:/Monark/node_modules` intact).
- **Horloge** (`date -u`) : début 09:32:03Z ; lecture 09:32-09:44Z ; sondes git 09:44:07Z-09:56:30Z ; avis advisor (canal 1) avant tout code ; `index.mjs` 09:56-10:00Z ; tests 10:00-10:08Z ; tueurs 10:09:50Z ; portes statiques 10:10-10:12Z ; textes `.md` 10:12-10:13Z ; compléments de tests 10:16-10:22Z ; premiers mutants, red-proof et rejeu 10:13-10:31Z (état intermédiaire, remplacés : § 14 E2) ; oracle 1 10:34:53Z-10:42:59Z (rouge : `lang:gate` et un scan d import, § 14 E4) ; libellés anglais et correction du scan 10:40-10:44Z ; portes statiques rejouées 10:45:53Z-10:46:30Z ; rejeu réel final 10:47:33Z-10:48:23Z ; mutants et red-proof finaux 10:47Z-10:53:54Z ; oracle 2 au § 8.
- **Verdict** : **LIVRE-AVEC-RESERVES** — réserve unique sur le livré : les libellés que la mission prescrit en français pour la sortie du code sont rendus en anglais un pour un, sous la porte de langue ADR-M004 D7 (Q-M5C-12, à ratifier) ; tout le reste de la liste fermée (A) + (B) est livré ; écarts de procédure E1-E4 déclarés (§ 14), sans effet sur le livré (identique à `F:/tmp/methode/m5c-deliver/REPONSE.md`).

## 0. Entrées lues (dans l ordre de la mission)
`docs/adr/ADR-METHODE-2.md` (l.60 M-5c : G0 et ses quatre plis datés 04:0x, 07:4x, 08:1x, 08:5x UTC, plus le pli 09:0x M-4b ; l.61 M-5d ; l.59 M-5b ; l.50 M-5 ; D8, D10, D11, D12 (d)(e) ; « Ce qui ne change pas ») ; `F:/tmp/methode/m5c/cp1/CHECKPOINT1-lot-methode-m5c.md` (sha `d9ab3242…` recalculé, § 4.1-4.10, § 11) ; `F:/Monark/docs/methode/RECHERCHE-M5c-archive-2026-09-29.md` (`c67080ef…`, entier) ; `scripts/journal/index.mjs` (`5cf7431d…`, 301 l.) et `test/journal-index.test.ts` (`c6d33c6d…`, 354 l.) en entier ; `docs/journal/` (7 fichiers, 21 lignes v1, `INDEX.md` `e8ad7ec1…`) ; `scripts/red-proof.mjs` (l.1-36, l.165-174, l.220-254) et `F:/tmp/methode/m5b/cp2/f2p/RED-PROOF.json` (`e19ccef5…` : 11 jugés, 9 F2P, 2 `refused` « green at base: a self-confirming test », `draw` {seed, requested 3, population 9, drawn[3] tous `killed`}, `ok` faux) ; `scripts/mission/launch.mjs` (reçu, `recuPath`), `scripts/mission/lint.mjs` (`lintMission`, `CODES`, `TIERS`) ; `scripts/mission/gen.mjs` l.81 (`Base tronc`) ; `docs/methode/CHECKLIST-G7.md` (cases 5 et 7) ; `docs/methode/REGLES-MISSION.md` ; `package.json` ; `docs/CHANTIERS.md` l.2074 (08:09 UTC, recherche) et l.2078 (08:47 UTC, cp-1 complet) ; `test/byte-guard.test.ts` ; `eslint.config.mjs`, `lint-ratchet.json` ; après l oracle 1 : `scripts/lang-gate.mjs` (portée root = `scripts/`, `test/`) et `packages/rpc-guard/test/durable.test.ts` l.188-300 (scan lexical des spécificateurs d import sous `scripts/`).

## 1. Mesures d entrée (sondes, `F:/tmp/methode/m5c/g1/probe/p1`, dépôt jetable)
- `core.autocrlf=true` : `hash-object --stdin` SEUL rend déjà les octets exacts (`8561d5d6…` = blob recalculé à la main) ; `--no-filters --stdin` idem ; `--path=x.md --stdin` convertit (`c0d0fb45…`). Conséquence : le mutant « écrite avec filtres » est `--no-filters` → `--path=m.md` (retirer `--no-filters` seul serait un mutant équivalent) ; le test (v) pose `core.autocrlf true` dans son dépôt jetable.
- `update-ref <ref> <new> ""` : exige l absence de la ref (exit 128 « reference already exists » si présente) ; `<old>` faux : exit 128 ; `<old>` juste : 0. `cat-file -p <ref>:<nom>` rend les octets CRLF intacts ; `git branch --list` ignore `refs/journal/facts`.
- `git commit-tree` N HONORE PAS `commit.gpgsign` (git 2.55.0.windows.5 : `commit.gpgsign=true` + clé absente ⇒ `commit-tree` exit 0, `git commit` exit 128) : les commits d archive ne sont pas signés, sans aucune option de contournement (Q-M5C-3). `F:/Monark` porte `commit.gpgsign=true` (`.git/config`).
- Date ISO `2026-09-29T09:32:03Z` acceptée par `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE` (1790674323) ; `node -e … <arg>` : `process.argv[1]` = `<arg>` (garde d entrée de `index.mjs` muette à l import).
- Base : `test/journal-index.test.ts` = **27 tests, 37 lignes `// killer:`** visant `scripts/journal/index.mjs` (27 de tête, 10 de corps), non 24 et 26 (Q-M5C-1).

## 2. Livré dans `scripts/journal/index.mjs` (424 l., sha256 `8c73a4259fc183db3062e37b9106a18b6bf6b7fc9acafb31c537eab36f1be4e3`)
- **Schéma** : `FIELDS_V1` (les 19 champs, figés), `FIELDS_V2` = 19 + `facts` + `redproof` ; `DOMAIN.schema` accepte `monark.journal.v1` et `monark.journal.v2` ; J-SCHEMA strict PAR VERSION (champ inconnu et manquant refusés ; `problems()` lit la liste de la version de la ligne) ; `DOMAIN.facts` = `{commit, origin, recu, lint}` (`commit` sha, `origin` ∈ {`add`, `freeze`}, `recu`/`lint` nul ou 64 hex) ; `DOMAIN.redproof` = les 11 champs (`record`, `sha256`, `base`, `head`, `digest`, `judged`, `f2p`, `pins`, `drawn`, `killed`, `ok`) ; NEED : `facts` nul avec `mission`, `oracle` ou `redproof` cité ⇒ J-SCHEMA. Aucune ligne v1 réécrite ; `add` n écrit que du v2.
- **(A) `archiveFacts(repo, facts, {message, date, tip})`** (exportée) : `hash-object -w --no-filters --stdin` par fait ; arbre plat par `mktree` = entrées du tip (`ls-tree`) + `100644 blob <sha1><TAB><sha256>` par nom neuf (nom présent réutilisé, jamais réécrit) ; `commit-tree <tree> -p <tip>` (message `<LOT> <gate> <date>`, identité d outil fixe `monark-journal <journal@monark.invalid>`, datée par la `date` de l entrée : commit reproductible) ; `update-ref refs/journal/facts <new> <tip>` (compare-and-swap ; `""` au premier `add`). **`readFact(repo, sha256)`** (exportée) : nom non-64-hex, ref ou objet absents ⇒ `archive absent` ; `cat-file -p refs/journal/facts:<sha256>` dont le sha256 des octets ≠ nom ⇒ `archive corrupt` ; jamais un chemin d hôte.
- **`add`** : collecte les octets des faits (mission ENTIÈRE, reçu, enregistrement d oracle ET l enregistrement servi à côté quand `served_from` le nomme, RED-PROOF) ; `facts` provisoire (domaine valide) ⇒ J-SCHEMA complet AVANT toute écriture (exit 2, rien d écrit, aucune archive) ; **J-LINT FIGÉ** : `lintMission({text, missionPath, repo, rev: commit ?? recu_head})` + post-filtre LINT-UNTRACKED, calculé une fois, archivé en `{schema:"monark.lint.v1", mission_sha, rev, verdict, hits, tool}` (`tool` = sha256 de `scripts/mission/lint.mjs` importé) ; un rouge est ENREGISTRÉ (FM-1.2 : `build` rougit) ; révision non commit de `--repo` ⇒ enregistrement rouge à un hit `J-LINT` (Q-M5C-9) ; puis `archiveFacts` (CAS perdu ou erreur git ⇒ exit 2, rien d ajouté) ; `facts.recu` = sha256 des octets du reçu ; sans fait : `facts` nul, aucun commit.
- **(B) `--from-redproof <RED-PROOF.json>`** : refus (exit 2) d un fichier qui n est pas `red-proof-v1` ; `redproof` = `record`, `sha256` + `deriveRedproof(record)` : `base`, `head` = `gel.head`, `digest` = `gel.digest` copiés ; `judged` = `tests.length` ; `f2p` = verdicts `F2P` ou `new-module` ; `pins` = lignes `pin` si l enregistrement parle le vocabulaire PIN-1 (un compte `pins`, un champ `pinned` ou une ligne `pin` : `strict`), sinon (TRANSITION datée) lignes `refused` dont la raison commence par « green at base: a self-confirming test » ; `drawn` = `draw.drawn.length`, `killed` = issues `killed`, `requested` = `draw.requested` ; `draw` nul ou non objet ⇒ 0, 0, 0, jamais une exception (`deriveRedproof`, exportée).
- **`build` (v2)** : une ligne v2 lit ses faits dans l archive SEULE (mission, reçu, lint, enregistrement d oracle et servi, RED-PROOF), jamais un chemin d hôte (FM-3.2 ; trois sites de lecture : `mx` l.309, `x` l.241, `sx` l.254) ; codes neufs **J-FACTS** (ref absente ⇒ `archive absent` + ligne d aide sur stderr, une fois ; `facts.commit` ni le tip ni un ancêtre ⇒ `archive rewritten`) et **J-REDPROOF** (liste fermée de l.60 et de la mission : fichier absent ou non JSON, `schema`, champ copié ≠ dérivation, `a proof of another tree`, base non ancêtre, ≠ `Base tronc`, `f2p + pins ≠ judged`, `killed ≠ drawn`, `ok` faux sans épingle ou sous vocabulaire PIN-1, `CA-13 draw absent`, `redproof` nul à G2/cp-2 d origine `add`) ; J-RECU v2 (mission et reçu archivés : verdict, sha, date, head du reçu = champs `mission`, Q-M5C-10), J-LINT v2 (enregistrement relu : `mission_sha`, `rev`, `verdict` ; jamais recalculé), J-ORACLE v2 (enregistrement et servi par sha). `build` (v1) inchangé (relecture hôte, recalcul). `INDEX.md` : rendu inchangé.
- **Libellés (Q-M5C-12)** : la porte de langue ADR-M004 D7 (`lang:gate`, portée root = `scripts/`, `test/`) refuse les mots français dans le code : les libellés français de la mission sont rendus en anglais, un pour un : « archive absente » → `archive absent` ; « archive corrompue » → `archive corrupt` ; « archive réécrite » → `archive rewritten` ; « preuve d un autre arbre » → `a proof of another tree` ; « tirage CA-13 absent » → `CA-13 draw absent` ; ligne d aide « archive : ref absente dans --repo, fetch attendu : git fetch origin '+refs/journal/*:refs/journal/*' » → `archive: ref absent from --repo, fetch expected: git fetch origin '+refs/journal/*:refs/journal/*'` (la commande de `fetch` inchangée à l octet). Les textes `.md` (hors portée de la porte) gardent le français.
- **En-tête** : convention r25 (l.15) inchangée ; ligne `fetch` ; coexistence v1/v2 (FM-1.3) ; J-FACTS, J-REDPROOF ; FM-2.6 (`pins` DÉRIVÉ). La raison du contrôle du servi n est PAS écrite (item (G), M-5d).

## 3. Tueurs réadressés (RED-PROOF-KILLER-ADDRESSING-1 appliqué) — outil `F:/tmp/methode/m5c/g1/tools/killers.mjs` (`parseKiller` du tronc ; nouvelle ligne = la seule où `<before>` figure exactement une fois, sinon la ligne égale à celle de la base, sinon à la main)
37/37 réadressés, avant → après : 269→359 (golden), 256→346, 142→171, 160→201, 146→176, 296→419, 72→95, 127→155, 133→161 (×3 : un corps, deux têtes), 215→302, 218→305, 219→306, 232→321, 199→250, 200→251 (×3 : une tête, deux corps), 195→246 (corps), 70→93 (corps), 220→307, 191→241 (corps), 204→255, 206→258 (corps), 223→310, **224→311 (à la main : deux lignes candidates, l.203 de `add` et l.311 de `build` ; la ligne visée est le rejeu v1 de `build`)**, 228→317, 229→318, 237→326, 234→323 (corps), 233→322 (corps), 241→330, 120→147, 115→142 (corps), 149→179, 184→234. 20 tueurs neufs (15 de tête, 5 de corps). Contrôle final (`F:/tmp/methode/m5c/g1/killers-check3.out`) : **57/57 valides** (42 de tête, une par test, au-dessus de sa déclaration ; 15 de corps), `<before>` exactement une fois sur la ligne citée du script final, opérateur, portée, `SDL` ; les 57 rejoués en mutants au § 6.

## 4. R-25 par étape (méthode A : `F:/tmp/methode/m5c/g1/tools/r25-wt.mjs`, pathspec `ci.yml:82` lue par le `R25_DIFF_RE` de `F:/Monark/scripts/oracle/r25.mjs`, suivis insertions + suppressions + non suivis)
Étape 0 : 0. Code + tests + tueurs (10:10:24Z) : **405**. Compléments de tests (10:22:05Z) : **414**. Libellés anglais et correction du scan (10:46:46Z, lignes modifiées sur place) : **414** (`index.mjs` +141/−18 = 159, test +215/−40 = 255) ≤ 547 : **aucune scission** (M-5c-2 non déclenchée ; aucun patch scellé). R-25 STAT de l oracle 1 (freeze du même compte) : 414 ; oracle 2 au § 8. Hors compte (`docs/**/*.md`) : `CHECKLIST-G7.md` +2/−2, `REGLES-MISSION.md` +1, ce journal. Aucune fixture ajoutée (RED-PROOF synthétisé dans le test).

## 5. Tests (`test/journal-index.test.ts`, 529 l., sha256 `6c8245342fe0110d66f7edc362b6843f699cd6a4ae6f15e6d7c5ebc628eae2f9`) — 42 tests, 42/42 verts (10:44:13Z)
- **27 existants verts** ; trois modifiés : l.138 `build: red exits 1…` (ligne `counts` avec J-FACTS et J-REDPROOF), l.148 `add: a launch receipt…` (la ligne G2 d origine `add` porte `--from-redproof` synthétisé) : F2P tous deux ; l.378 `J-HEADER…` : l entrée de `add` lue en v1 (ses variantes forgent des missions SUR DISQUE) : **épingle déclarée** (ci-dessous).
- **15 neufs**, dépôts jetables sous `os.tmpdir()`, aucune lecture de `F:/tmp` par le test, aucune fixture : (i) `facts_roundtrip_green_on_clone` (ligne cp-2 à 5 faits ; `commit` du journal, `clone --no-local`, `fetch refs/journal/*`, mission, reçu, RED-PROOF et enregistrement d oracle SUPPRIMÉS de l hôte ⇒ `build` exit 0) ; (ii) `facts_sha_mismatch_red` (autre blob sous le nom de la mission, fichier d hôte sain présent ⇒ `mission archive corrupt`) ; (iii) `facts_absent_red` (ref supprimée ⇒ J-ORACLE, J-FACTS, J-RECU, J-LINT, J-REDPROOF `archive absent`, l enregistrement d oracle et le RED-PROOF présents sur l hôte jamais lus, ligne d aide sur stderr, la ligne v1 voisine verte) ; (iv) `facts_branch_deleted_stays_green` (v2 vert, sa lecture v1 rouge R-BRANCH) ; (v) `facts_crlf_bytes` (CRLF + octets non ASCII sous `core.autocrlf=true` : sha = nom) ; (vi) `facts_ref_rewound_red` (même arbre, ref ramenée au parent ⇒ `archive rewritten`) ; (vii) `facts_r25_unchanged` (HEAD, deux `diff --shortstat`, branches, `status` hors journal identiques ; une seule ref neuve `refs/journal/facts`) ; (viii) `redproof_roundtrip` (forme cp-2 M-5b : 11 jugés, 8 F2P + 1 `new-module`, 2 épingles, `ok` faux, 3/3 : vert ; rouges : champ copié forgé, `schema` `red-proof-v0` greffé, `f2p + pins ≠ judged`, `killed ≠ drawn`, `ok` faux sans épingle, `a proof of another tree`, base non ancêtre, base ≠ `Base tronc` ; refus d `add` d un fichier non `red-proof-v1`) ; (ix) `redproof_draw_required` (`draw: null` et tirage de 2 à cp-2 ⇒ `CA-13 draw absent` ; `redproof` nul à cp-2 ⇒ rouge ; `draw: null` à G1 ⇒ vert) ; `redproof_pin_transition` (avant M-4b : 2 `refused` « green at base » = 2 épingles, `ok` faux admis ; après : lignes `pin`, `ok` faux rouge ; chaque marqueur du vocabulaire PIN-1 — compte `pins`, champ `pinned`, ligne `pin` — seul suffit) ; `v1_real_lines_read_as_v1` (les 21 lignes réelles v1 dans un dépôt jetable : 0 J-SCHEMA, 0 J-FACTS, 0 J-REDPROOF, 21 entrées ; Q-M5C-8, Q-M5C-13) ; `schema_v2_strict` (manquant, inconnu, NEED, domaines, v1 portant `facts` ; `add` sans fait ⇒ `facts` nul, 0 ref) ; `facts_cas_moved_tip` (`archiveFacts` importée dans un enfant `node --input-type=module` : tip périmé ⇒ exception, ref inchangée) ; `lint_frozen_and_recu_archived` (lint rouge figé ; `rev`, `mission_sha`, sha de mission nommant un autre fait, date du reçu, reçu non archivé) ; `served_record_archived` (G1 à enregistrement servi : archive des deux, fichiers d hôte supprimés ⇒ vert ; sha servi non archivé ⇒ `archive absent`).
- **Portes statiques (état final, 10:45:53Z-10:46:30Z, jonctions posées)** : `node scripts/lang-gate.mjs` exit 0 (0 hit, toutes portées) ; `node scripts/grep-forbidden.mjs` exit 0 ; `tsc --noEmit` exit 0 ; `eslint test/journal-index.test.ts` exit 0 ; `node scripts/lint-ratchet.mjs` **69/69** (plafond non dépassé) ; `node --test test/byte-guard.test.ts packages/rpc-guard/test/durable.test.ts` 23/23 (le scan d import de `durable.test.ts` à 0 hit) ; 0 TAB et 0 octet de contrôle dans les fichiers livrés ; `index.mjs` et le test en ASCII.
- **F2P (état final)** : `node F:/Monark/scripts/red-proof.mjs --base cb0e268a --gel F:/Monark-wt-m5c --repo F:/tmp/methode/m5c/g1/clones/rp --out F:/tmp/methode/m5c/g1/f2p3 --draw 3 --seed 2026` (10:47Z-10:49:43Z, sortie 1) : `F:/tmp/methode/m5c/g1/f2p3/RED-PROOF.json` sha256 **`dec1d2acd9baa0bdfcc0fdba913c19a1f5d4b1f04df132e8956296e79cfc2b13`** (`base.tap` `376c89bc…`, `gel.tap` `47e52bb5…`, `killer-1/2/3.tap` `fa1f5cd9…`, `63fc354e…`, `10c97acf…`, journal `F:/tmp/methode/m5c/g1/f2p3.log`) ; **18 jugés, 24 inchangés : 17 F2P (base `assert-fail` tous), 1 `refused` « green at base: a self-confirming test »** = l épingle déclarée ; tirage 3 sur une population de 17 (graine 2026) : **3/3 tués** (l.265 `facts_ref_rewound_red`, l.277 `facts_branch_deleted_stays_green`, l.411 `redproof_pin_transition`) ; `ok` faux (attendu sous la TRANSITION : aucun outil ne porte encore le verdict `pin`) ; `gel.head` = `cb0e268a` (mode worktree, rien de commis), `digest` `9dc8d16c54380cefe33b9f0064e97236b7d2a58400521c65718cb96e929199b9`. Dérivation par l outil livré (`deriveRedproof` du gel) : `judged` 18, `f2p` 17, `pins` 1, `drawn` 3, `killed` 3, `ok` faux, `strict` faux ; démontrée VERTE sur une ligne G1 (§ 7).
- **Épingle déclarée (CA-13 bis, comptée À PART)** : `J-HEADER: the real form…` (l.378) : (1) `<before>` `` `${g[1]}^{commit}:scripts/mission/gen.mjs` `` présent à la base (l.184 de `cb0e268a`, `git show`) ; (2) tueur l.234 tué (mutant K377, § 6) ; (3) `base: pass`, `gel: pass`. Elle épingle le contrat v1 de J-HEADER, fusionné en M-5b.

## 6. Mutants — table `F:/tmp/methode/m5c/g1/mutants/mutants.mjs` (`99d32e3f…`, 39 nommés) + les 57 tueurs du test ; harnais `F:/tmp/methode/m5c/g1/mutants/harness.mjs` (47 l., `01f54f5b…`) : un lancement par clone, un mutant à la fois, `<before>` exactement une fois sinon « anchor-lost », tests ciblés en TAP puis fichier entier sur survivant, issue par `classify`/`parseTap` de `F:/Monark/scripts/red-proof.mjs` (jamais le statut du lanceur), octets restaurés et sha vérifiés à chaque pas
Sortie `F:/tmp/methode/m5c/g1/mutants/run2/` (clone `clones/mut2` : le worktree cloné `--no-local`, `index.mjs` et test copiés, sha égaux `8c73a425…` / `6c824534…` ; 10:47Z-10:53:54Z) : `RESULTS.txt` `3e216be1170638cb2290a520b223faf54f1b599b3b0f5f4b67abb0b17741e298`, `RESULTS.json` `10d5ab98e882f934689d0be95290ffa57dcdfc0f978c342e92edc67d70e727e0` ; BASELINE vert 42/42 ; **96/96 tués** (39 nommés + 57 tueurs), 0 survivant, 0 non conclu, 0 anchor-lost, tous `assert-fail`, restauration vérifiée à chaque pas ; le tueur de l épingle (l.234, K377) tué. Chaque mutant a sa ligne dans `RESULTS.txt` (issue, statuts `classify`, durée, restauration).

| id | l. | mutation | classe de la mission | tué par |
|---|---|---|---|---|
| N01 | 393 | `--no-filters` → `--path=m.md` | archive écrite avec filtres | (v) |
| N02 | 309 | archive en défaut ⇒ fichier d hôte (mission) | repli hôte sur v2 | (ii) |
| N03 | 241 | archive en défaut ⇒ fichier d hôte (enregistrement) | repli hôte sur v2 | (iii) |
| N04 | 403 | `hash(b) === sha256` → `true` | sha ≠ nom accepté | (ii) |
| N05 | 265 | ancêtre non vérifié | ref réécrite acceptée | (vi) |
| N06 | 293 | `f2p + pins !== judged` → `false` | `f2p + pins ≠ judged` accepté | (viii) |
| N07 | 294 | `killed !== drawn` → `false` | `killed ≠ drawn` accepté | (viii) |
| N08 | 290 | `head !== want` → `false` | `head` ≠ `commit` accepté | (viii) |
| N09 | 410 | `dr.drawn` sans garde | `draw` nul ⇒ exception | (ix) |
| N10 | 296 | tirage → `false` | tirage < 3 à cp-2 accepté | (ix) |
| N11 | 277 | verdict RECALCULÉ par `lintMission` | J-LINT recalculé au lieu de relu | (iv) |
| N12 | 309 | `const v2 = true` | v1 traitée en v2 | `v1_real_lines_read_as_v1`, (iii) |
| N13 | 156 | boucle sur `FIELDS_V1` | champ v2 manquant accepté | `schema_v2_strict` |
| N14 | 395 | `update-ref` sans `<old>` | `update-ref` sans `<old>` | `facts_cas_moved_tip` |
| N15 | 344 | ligne d aide supprimée | message d aide absent | (iii) |
| N16 | 191 | enregistrement servi non archivé | extra | `served_record_archived` |
| N17 | 162 | règle NEED de `facts` supprimée | extra | `schema_v2_strict` |
| N18 | 292 | `Base tronc` non comparée | extra | (viii) |
| N19 | 291 | base non ancêtre acceptée | extra | (viii) |
| N20 | 295 | `ok` faux accepté | extra | (viii), `redproof_pin_transition` |
| N21 | 284 | `redproof` nul à cp-2 accepté | extra | (ix) |
| N22 | 287 | champs copiés jamais comparés | extra | (viii) |
| N23 | 279 | lint d une autre mission accepté | extra | `lint_frozen_and_recu_archived` |
| N24 | 271 | J-RECU v2 aveugle à l archive de la mission | extra | (ii), (iii) |
| N25 | 285 | J-REDPROOF aveugle à l archive | extra | (iii) |
| N26 | 257 | état d archive du servi ignoré | extra | `served_record_archived` |
| N27 | 242 | état d archive de l enregistrement ignoré | extra | (iii) |
| N28 | 182 | reçu non archivé | extra | (i) |
| N29 | 206 | enregistrement de lint non archivé | extra | (i) |
| N30 | 266 | drapeau d aide jamais posé | extra | (iii) |
| N31 | 272 | sha de mission nommant un autre fait accepté | extra | `lint_frozen_and_recu_archived` |
| N32 | 273 | état d archive du reçu ignoré | extra | `lint_frozen_and_recu_archived` |
| N33 | 278 | état d archive du lint ignoré | extra | (iii) |
| N34 | 286 | `schema` du RED-PROOF non contrôlé par `build` | extra | (viii) |
| N35 | 195 | `add` accepte un fichier non `red-proof-v1` | extra | (viii) |
| N36 | 413 | tout refus compté épingle | extra | (viii) |
| N37 | 412 | `new-module` non compté F2P | extra | (viii) |
| N38 | 414 | tout tueur tiré compté tué | extra | (viii) |
| N39 | 414 | `requested` lu 3 | extra | (ix) |
| K1-K57 | | les 57 tueurs `// killer:` du test (42 de tête, 15 de corps), chacun sur son test | | chaque ligne dans `RESULTS.txt` |

## 7. Rejeu réel (CA-11) — `F:/tmp/methode/m5c/g1/rejeu2/rejeu.sh` (outil final), clones seulement (jamais le worktree ni `F:/Monark`) ; sorties dans `F:/tmp/methode/m5c/g1/rejeu2/` (`steps.log`, 10:47:33Z-10:48:23Z)
- `clones/trunk2` = `git clone --no-local F:/Monark` (HEAD `a44ca123`, `docs/journal` et `scripts/` identiques à `cb0e268a`) + 101 branches locales `lot/*` créées depuis `origin/` (mesure 8 du cp-1 : sans elles, rouge R-BRANCH). `node F:/Monark-wt-m5c/scripts/journal/index.mjs build --repo <clone>` (NOUVEL outil) : **vert, 0 hit, 7 lots, 21 entrées** ; **`INDEX.md` régénéré IDENTIQUE à l octet** au tronc (`e8ad7ec17c8cefcc4b541fb83f6d946d5c5889e6e3b09107bafdf95a6e83e374`, `cmp` égal).
- Ligne v2 de démonstration : mission manuscrite `mission-cp2-demo.md` (`a926167d…`, Palier `claude-fable-5-1`, rôle validateur, `Base tronc 80880eb7`), lancée par `launch.mjs` sur le clone (reçu vert) ; `add --repo <clone> --lot M-5c-demo --gate cp-2 --commit fb6bbc0b… --from-recu … --from-oracle F:/tmp/oracle-results/fb6bbc0b…-cp-2-20260929T070905Z-126300.json (8fad97e3…) --from-redproof F:/tmp/methode/m5b/cp2/f2p/RED-PROOF.json (e19ccef5…)` : exit 0, `redproof` = 11 / 9 / 2 épingles / 3 / 3 / `ok` faux (dérivé du RÉEL), 5 faits dans `refs/journal/facts` du clone, enregistrement de lint figé vert à `fb6bbc0b` (`e4303595…`, `tool` `4d1383c8…`) ; `build` complet du clone : **vert, 0 hit, 22 entrées**. Le même RED-PROOF à `draw: null` (`RED-PROOF-nodraw.json` `b8a375ee…`) cité à cp-2 : **rouge `CA-13 draw absent`**.
- Clone du clone `clones/c3` (après commit de `M-5c-demo.jsonl` dans `trunk2`, sans aucune option de signature) : **sans `fetch`** : `build --only M-5c-demo` rouge, 5 hits `archive absent` (J-ORACLE, J-FACTS, J-RECU, J-LINT, J-REDPROOF) et la ligne d aide sur stderr ; **après `git fetch origin '+refs/journal/*:refs/journal/*'`** : vert ; `build` complet de `c3` avec ses branches `lot/*` : vert, 22 entrées ; puis `git branch -D lot/methode-m5` : **7 hits J-LINT R-BRANCH, tous v1** (M-5 l.1, 2, 3, 5, 6, 8 et M-5b:1 : la mesure 8 du cp-1 reproduite), **la ligne v2 reste verte**.
- Ligne G1 de ce lot (démonstration, `trunk2`, lot `M-5c-g1-demo`, 10:51:38Z) : `add --gate G1 --from-recu F:/tmp/methode/mission-g1-m5c.recu.json --from-redproof F:/tmp/methode/m5c/g1/f2p3/RED-PROOF.json --model claude-opus-5-5` : `redproof` 18 / 17 / 1 / 3 / 3 / `ok` faux, `head` = `recu_head` = `cb0e268a` ; `build --only` **vert** (J-HEADER de la mission générée, J-LINT figé à `cb0e268a`, J-REDPROOF) (`add-g1-demo.out`, `build-g1-demo.out`) ; la même preuve citée à une ligne cp-2 d un gel ≠ `cb0e268a` serait `a proof of another tree` (Q-M5C-2).

## 8. Oracle
C-V-4 avant chaque passage (`Get-CimInstance Win32_OperatingSystem`) : 10:34:50Z 21 974 Mo libres / 14 node.exe ; 10:54:14Z 20 256 Mo / 20 node.exe. Aucune course ciblée ni harnais de ma part pendant la suite sous verrou (mutants et red-proof finis à 10:53:54Z ; l oracle 2 a attendu le verrou d un autre agent jusqu à sa prise).
- **Oracle 2 (retenu)** : `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-m5c --base cb0e268a --key M-5c` (10:54:18Z-11:03:57Z) : enregistrement **`F:/tmp/oracle-results/cb0e268a55914232612f11c275973cb7ed6d34dc-a3b014dfdb5828b9-G1-20260929T105418Z-82816.json`**, sha256 **`39e6c22ed429e8c75dedf3f5fdefe836b2cb0a00303d9946704d7fe3c99872de`** ; `role` G1, `tree.head` `cb0e268a55914232612f11c275973cb7ed6d34dc`, `tree.dirty` `a3b014dfdb5828b9849439d9d7e0789b3d6c0599d5ac9a4eb7c3444717abd0c4`, `tree.object` `c76751f9…`, `key` `8c8e1887…`, pid 82816 ; **`exit` 0, `static_only` false, `served_from` null** (premier passage vert sous la clé M-5c : l oracle 1 sous la même clé était rouge, jamais servi) ; neuf portes vertes (8 statiques hors verrou, dont `lang:gate` et `r25` ; `test` sous verrou, 384 981 ms) ; **tests 1 640 = 1 625 (référence, G7 M-5b) + 15 neufs** : 1 637 pass, 0 fail, 3 skip ; test 42 une fois, dans la suite, vert ; **r25 STAT 414** (+356/−58, borne CI 1 205) = la méthode A ; CONTENT_STAT 0 ; `residues.tmp_entries` 379 (égal aux enregistrements M-5b G7, M-6 G1, M-6 G2 : ligne de base de l hôte) ; `cv4` 22 152 Mo / 11 node.exe.
- `tree.dirty` a été haché AVANT l écriture des § 8 et § 15 de ce journal (textes `docs/**/*.md` seuls ; aucun octet de code ni de test changé après 10:44Z : `index.mjs` `8c73a425…`, test `6c824534…` ; le `digest` du RED-PROOF exclut `docs/**/*.md`).
- Oracle 1 (remplacé, § 14 E4) : `F:/tmp/oracle-results/cb0e268a55914232612f11c275973cb7ed6d34dc-3cd52381f19c7a93-G1-20260929T103453Z-88292.json` sha `8b1257b1…`, exit 1 (`lang:gate` 1 ; 1 640 tests, 1 fail : `durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch`).

## 9. CA-11 — tuyaux (1)-(5) de l.60
(1) `add` → `refs/journal/facts` → `build` : code + test (i) + rejeu réel (clone, clone du clone) ; consommateur réel = case 5 du G7 de M-5c (lignes cp-2 et G7 en v2) : **built au G7**. (2) `--from-redproof` → ligne cp-2 de M-5c à son G7 (exigée par J-REDPROOF) : test (viii) + démonstration sur le RED-PROOF réel de M-5b : **built au G7**. (3) clone → `fetch refs/journal` : ligne datée de `docs/methode/REGLES-MISSION.md`, case 5 de `CHECKLIST-G7.md`, en-tête d `index.mjs`, ligne d aide de `build`, tests (i) et (iii) : **branché par le texte et le test**. (4) CI : **à brancher**, JOURNAL-CI-BUILD-1 (upcoming, non touché). (5) durabilité hors hôte : **à brancher**, JOURNAL-FACTS-PUSH-1 = ligne MANUELLE de la case 7 (`git push origin '+refs/journal/*:refs/journal/*'` sous go, jamais vers le miroir public, aucun `remote.origin.push`), déclencheur : premier push du tronc après le G7 de M-5c.

## 10. MAST
- **FM-3.2** : une archive corrompue ne masque jamais un fichier sain : aucune lecture d hôte pour une ligne v2 (trois sites ; tests (ii), (iii), `served_record_archived` ; mutants N02, N03, N04, N24-N27 tués) ; ref absente ⇒ rouge nommé + ligne d aide, jamais une exception.
- **FM-1.2** : `add` n accepte rien : il ENREGISTRE (lint rouge figé, test `lint_frozen_and_recu_archived`, exit 0) ; J-SCHEMA complet avant toute écriture ; CAS perdu ⇒ exit 2, rien d ajouté ; `build` juge.
- **FM-2.6** : un `build` vert atteste la cohérence des faits archivés avec l entrée et la dérivation des comptes, jamais la justesse d un verdict ni qu une épingle en est une : `pins` est DÉRIVÉ (en-tête) jusqu à RED-PROOF-PIN-1.
- **FM-1.3** : coexistence v1/v2 : une ligne v1 relit l hôte, une v2 l archive, rien d autre (test (iii) : v1 voisine verte ; `v1_real_lines_read_as_v1` ; rejeu réel 21/21 ; N12 tué) ; fin de la coexistence : gel de M-5d.

## 11. `error_origin` proposés (D11)
Q-M5C-1 (comptes 24 / 26) : **VAL** (cp-1 § 1 et § 4.9), repris par la mission (**ORCH**) ; Q-M5C-2 (phrase de la mission sur la ligne cp-2) : **ORCH** ; Q-M5C-12 (libellés français prescrits pour le code) : **ORCH** (texte de la mission) et **G1** (porte `lang:gate` non jouée avant l oracle 1) ; E4 (scan d import) : **G1** ; E1 : **G1** ; E3 (transport d outil) : **OUT** ; aucun défaut G0 ni G2 connu à cette heure.

## 12. Review Focus (couverture)
1. Fichier d hôte sain présent mais archive corrompue : test (ii) (`mission archive corrupt`, le fichier sain jamais lu), mutants N02, N04, N24 tués.
2. Ref absente du clone : test (iii) (`archive absent` par fait, ligne d aide, aucune exception, v1 voisine verte) ; rejeu réel `c3` sans `fetch` ; N15, N30, N12 tués.
3. Mission à CRLF ou octets non ASCII : test (v) (sha = nom sous `core.autocrlf=true`) ; N01 tué.
4. RED-PROOF réel de M-5b (11 / 9 / 2, `ok` faux, 3/3) cité à cp-2 : VERT (rejeu réel, 22 entrées) ; le même à `draw: null` : rouge `CA-13 draw absent` ; synthétisés en (viii) et (ix).
5. Les 21 lignes v1 réelles : lues en v1, jamais exigées en v2, `INDEX.md` inchangé à l octet (rejeu réel `e8ad7ec1…`) ; `v1_real_lines_read_as_v1`.

## 13. Questions (Q-M5C-n)
- **Q-M5C-1** (mesure rectifiée) : à la base, 27 tests et 37 lignes `// killer:` visent `index.mjs` (27 de tête, 10 de corps), non « 24 tests » et « 26 tueurs » (cp-1 § 1 et § 4.9, repris par la mission) ; les 37 sont réadressés.
- **Q-M5C-2** : la preuve F2P d un G1 en mode worktree porte `gel.head` = la base (`cb0e268a` : rien de commis) : elle adosse la ligne G1 (head = `recu_head`, démontrée verte au § 7), JAMAIS une ligne cp-2 (J-REDPROOF : head = `commit` = le gel, sinon `a proof of another tree`). La ligne cp-2 du G7 de M-5c citera donc le RED-PROOF que le validateur rejoue sur le gel (comme au cp-2 de M-5b), non celui-ci ; la phrase de la mission « c est cet enregistrement que ta propre ligne cp-2 citera » est à trancher par l orchestrateur.
- **Q-M5C-3** : commits d archive par une identité d outil fixe (`monark-journal <journal@monark.invalid>`), datés par l entrée (reproductibles) ; `commit-tree` ne signe pas, même avec `commit.gpgsign=true` (mesuré § 1) : signer par `-S` quand le dépôt le demande ? (politique de signature : orchestrateur / investisseur ; item proposé JOURNAL-FACTS-SIGN-1, limite déclarée).
- **Q-M5C-4** : `redproof` cité à G0, cp-1, G7 ou fusion : la liste fermée ne lie la tête qu à G1/corr et G2/cp-2 ; rien d ajouté ; proposition : J-SCHEMA refuse un `redproof` à ces portes comme l oracle à G0/cp-1/fusion (item proposé JOURNAL-REDPROOF-GATES-1, M-5d).
- **Q-M5C-5** : discriminant de la TRANSITION = le vocabulaire PIN-1 dans l enregistrement (compte `pins`, champ `pinned` ou ligne `pin`) ; limite déclarée : un enregistrement d ancienne forme produit APRÈS la fusion de M-4b par un outil périmé serait lu sous la transition ; proposition : date butoir posée par la ligne datée du G7 M-4b, ou sha de l outil dans `RED-PROOF.json` (item proposé JOURNAL-REDPROOF-CUTOFF-1, PAROXYSME) ; la comparaison du compte `pins` DÉCLARÉ reste hors lot (RED-PROOF-PIN-1, Q-V-3).
- **Q-M5C-6** : la clause « `drawn` < `draw.requested` alors que `population` ≥ `requested` » du cp-1 § 4.5 n est ni dans le pli 08:5x de l.60 ni dans la liste fermée de la mission : non implémentée (le tirage ≥ 3 à G2/cp-2 couvre ces portes).
- **Q-M5C-7** : case 5 de `CHECKLIST-G7.md` « réécrite » par une ligne datée qui REMPLACE les étapes (3)-(4) pour les lignes postérieures à la fusion (style de la maison : rien n est effacé) ; à confirmer.
- **Q-M5C-8** : « 21 lignes réelles copiées dans le dépôt jetable ⇒ `build` vert sans archive » n est pas atteignable dans un dépôt jetable (les lignes v1 citent des chemins d hôte `F:/tmp` et des commits du dépôt réel) : le test affirme la lecture v1 (0 J-SCHEMA/J-FACTS/J-REDPROOF, 21 entrées), le vert réel est le rejeu du § 7 ; pendant ce test l outil lit les chemins d hôte que citent ces lignes v1 (sémantique v1), l assertion n en dépend pas.
- **Q-M5C-9** : enregistrement de lint quand `commit ?? recu_head` n est pas un commit de `--repo` : `verdict` rouge et un hit `{code:"J-LINT", line:0, …}` (code hors `CODES` de `lint.mjs`) ; forme à confirmer.
- **Q-M5C-10** : au-delà des cinq faits nommés, l enregistrement SERVI (PRE-GEL-BIND, G1/corr) est archivé aussi (sinon une ligne v2 G1 à enregistrement servi relirait un chemin d hôte) et J-RECU v2 CONSOMME le reçu archivé (verdict, sha, date, head = champs `mission` ; règle Branchement : un fait archivé jamais lu serait terminal) ; périmètre à confirmer.
- **Q-M5C-11** : le test J-HEADER (l.378) reste une épingle v1 ; un jumeau v2 (missions greffées dans l archive) au lot M-5d ?
- **Q-M5C-12** : libellés : la mission prescrit des libellés français pour la sortie du code (« archive absente », « archive corrompue », « archive réécrite », « preuve d un autre arbre », « tirage CA-13 absent », ligne d aide) ; la porte de langue ADR-M004 D7 (`lang:gate`, gate de l oracle, non discrétionnaire, R-22) les refuse dans `scripts/` et `test/` (mesuré à l oracle 1 : 11 hits, « preuve », « un », « autre », « dans ») ; rendus en anglais un pour un (§ 2) ; les textes `.md` gardent le français. À ratifier (ou exemption datée de `scripts/lang-exempt.json`, acte hors lot).
- **Q-M5C-13** : `v1_real_lines_read_as_v1` exige ≥ 21 lignes v1 dans le journal réel : le `freeze` de M-5d les réécrit toutes en v2, ce test rougira alors par construction ; item proposé JOURNAL-TEST-V1-REAL-1, déclencheur G0 de M-5d (le réécrire sur les lignes gelées : lues en v2, archive `freeze`).

## 14. Écarts déclarés
- **E1** : un `-c commit.gpgsign=false` passé à UN commit dans le clone jetable `clones/trunk` (premier rejeu, 10:27:05Z) : contraire à la règle globale (jamais sans demande) ; sans effet (le clone ne portait aucune configuration de signature) ; le rejeu final (`rejeu2`, `trunk2`) commit sans aucune option de signature.
- **E2** : red-proof 1 (`f2p/`, 10:15Z), red-proof 2 (`f2p2/`, 10:31Z), mutants `run1/` (96/96 tués, 10:30Z) et premier rejeu (`rejeu/`) portent des états intermédiaires (libellés français, scan d import) : remplacés par `f2p3/`, `run2/`, `rejeu2/` ; conservés, non cités comme preuves.
- **E3** : l outil d édition a décodé `\u00e9` en « é » dans deux lignes d `index.mjs` ; réécrit en échappement ASCII par un script node (`String.fromCharCode`) ; fichier ASCII, 0 octet de contrôle (ces libellés sont ensuite devenus anglais).
- **E4** : oracle 1 (`F:/tmp/oracle-results/cb0e268a55914232612f11c275973cb7ed6d34dc-3cd52381f19c7a93-G1-20260929T103453Z-88292.json`, sha `8b1257b1…`, 10:34:53Z-10:42:59Z) ROUGE, exit 1, `static_only` faux, 1 640 tests (1 636 pass, 1 fail, 3 skip), r25 STAT 414 : `lang:gate` exit 1 (libellés français, Q-M5C-12) et `packages/rpc-guard/test/durable.test.ts` `durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch` (scan lexical : `Buffer.from(` suivi d un gabarit lu comme un spécificateur d import, deux hits) ; corrigés (libellés anglais ; sérialisation de l enregistrement de lint sans gabarit en argument) ; remplacé par l oracle 2 (§ 8). Le test 42 était vert.

## 15. Livrables
- `F:/tmp/methode/m5c-deliver/REPONSE.md` et `F:/tmp/methode/m5c-deliver/DELIVERED.sha256` (sha256 de chaque livrable ci-dessous, écrit par `F:/tmp/methode/m5c/g1/tools/deliver.sh`).
- Worktree (non commis, gel = acte de l orchestrateur) : `scripts/journal/index.mjs` `8c73a4259fc183db3062e37b9106a18b6bf6b7fc9acafb31c537eab36f1be4e3`, `test/journal-index.test.ts` `6c8245342fe0110d66f7edc362b6843f699cd6a4ae6f15e6d7c5ebc628eae2f9`, `docs/methode/REGLES-MISSION.md` (ligne datée `fetch`), `docs/methode/CHECKLIST-G7.md` (cases 5 et 7), ce journal.
- Preuves : `F:/tmp/methode/m5c/g1/f2p3/RED-PROOF.json` `dec1d2ac…` (+ TAP) ; `F:/tmp/methode/m5c/g1/mutants/{mutants.mjs, harness.mjs, run2/RESULTS.json, run2/RESULTS.txt}` ; enregistrement d oracle `…-G1-20260929T105418Z-82816.json` `39e6c22e…` et `F:/tmp/methode/m5c/g1/oracle2.log` ; rejeu réel `F:/tmp/methode/m5c/g1/rejeu2/` (`rejeu.sh`, `steps.log`, sorties) ; outils `F:/tmp/methode/m5c/g1/tools/{killers.mjs, r25-wt.mjs, english-labels.mjs, deliver.sh}` ; contrôles `killers-check3.out`, `r25-step3.out`.

## 16. Tour 1 (correcteur `corr`, D12 (d), POST-G2) — journal du 2026-09-29, 12:06-13:05:43Z

claude-opus-5-5

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant exact donné par le harnais), palier de la mission, effort max ; instance
  fraîche, distincte du G1 et du G2 de M-5c et de tout agent de M-6, M-7.
- **Mission** : `F:/tmp/methode/mission-corr1-m5c.md` sha256 `dec00efc7f49215c87cbf80fc4d651d495794f3272b9ec1a46df488f2c06b21e` = reçu
  `F:/tmp/methode/mission-corr1-m5c.recu.json` (vert, 12 codes à 0, head `65170ad4`, 12:04:21Z) ; outils de l en-tête recalculés égaux
  (`lint.mjs` `4d1383c8…`, `launch.mjs` `fb6c277f…`, `run.mjs` `baad946c…`, `r25.mjs` `4d0544df…`, `red-proof.mjs` `6869fa3d…`,
  `gen.mjs` `9eecb371…`, REGLES du tronc `410dd919…`) ; `git diff --stat cb0e268a <tronc> -- scripts test` vide.
- **Gel 1 relu puis copié** avant toute écriture (12:22:42Z) dans `F:/tmp/methode/m5c/corr1/gel1/` : les 5 sha de l en-tête de la mission
  (`8c73a425…`, `6c824534…`, `1843e254…`, `b4265563…`, `44e7a379…`).
- **Horloge** (`date -u`) : début 12:06:15Z ; lecture (rapport G2 entier, l.60 et ses plis dont 11:5x, l.61, D12, missions G1 et G2,
  tables `new.mjs`/`new2.mjs`, code, test, textes, RED-PROOF réel, `red-proof.mjs`) 12:06-12:21Z ; avis advisor (canal 1) avant tout
  code ; code 12:23-12:30Z ; tests 12:30-12:34Z ; tueurs réadressés 12:31Z ; suite du fichier 12:34:53-12:35:52Z (44/44) ; portes
  statiques 12:36-12:38Z ; F2P 12:44:20-12:46:16Z ; mutants 12:46:33-12:56:44Z ; rejeu réel 12:48:10-12:49:24Z ; contrôle d ordre
  12:49:49-12:49:59Z ; oracle 12:57:00-13:04:40Z.
- **Verdict** : **CORRIGÉ-AVEC-RESERVES** : les 7 corrections de la liste fermée sont tenues, chacune prouvée par un test qui tue son mutant ;
  réserve unique : la règle « ligne ≤ 160 » appliquée au code et aux tests seuls ; deux lignes `.md` longues au style de la maison
  (case 7 corrigée, puce REGLES neuve : Q-C1-9).

### 16.1 Corrections (liste fermée 275-d de la mission, décisions citées, jamais rediscutées)
| C-G2-n | lignes (`index.mjs` corrigé, 437 l.) | test | mutants tués |
|---|---|---|---|
| C-G2-1 | l.167 `problems()` ; en-tête l.32 | `schema_v2_strict` (4 portes) ; `add_guards_before_effects` (fusion) | C01-C03 ; tueurs l.533, l.548 |
| C-G2-2 | l.86, l.121, l.303-305, l.427 ; en-tête l.71-74 | `redproof_roundtrip` : 5/3 de 9, 11 ≠ 9, 4 tirés sur 3 | C05-C11 ; tueur l.468 |
| C-G2-3 | l.214-219 `add()` ; en-tête l.19-20 | `add_guards_before_effects` (sans LF : créée, déplacée) | tueur l.538, C04, ordre gel 1 |
| C-G2-4 | code inchangé (l.294, l.290, l.306) | `redproof_bound_gates` (neuf) | G05 (tueur l.487), G06 (l.493), G07 |
| C-G2-5 | code inchangé (l.210, l.281) | `lint_frozen_and_recu_archived` (4 lignes neuves) | G17, G21 (tueur l.581), G22, G23 |
| C-G2-6 | domaine l.120-121 (`population` ajouté) | `schema_v2_strict` : `ok: "yes"`, `population: -1` | G10, C12 |
| C-G2-7 | `CHECKLIST-G7.md` case 7 ; REGLES ligne datée ; en-tête l.18-19 | texte ; sonde P4 refaite (§ 16.6) | — |

- **C-G2-1** : `if (["G0", "cp-1", "G7", "fusion"].includes(e.gate) && (e.redproof ?? null) !== null)` pousse « redproof cited at a
  gate without a head binding » ; `add` l appelle avant toute écriture (exit 2, rien d écrit, aucune ref). Le cas M-X:7 existant (`{}` à
  G0) porte désormais les deux motifs (« redproof out of domain; redproof cited at a gate without a head binding »).
- **C-G2-2** : `deriveRedproof` COPIE `population` = `draw.population` (entier, sinon 0 : même règle fail-closed que `requested`) et rend
  `drew` (tirage présent) ; `population` rejoint `COPIED` (12 champs de `redproof`) et les comptes naturels du domaine ; J-REDPROOF, APRÈS
  la règle `ok` faux (les premiers motifs des rouges existants inchangés) : tirage présent et `population` ≠ `f2p` ⇒ « draw population P
  != f2p F: a draw of another population » ; `drawn` ≠ min(`requested`, `population`) ⇒ « draw of R requested, D drawn of P: a truncated
  draw » (moins) ou « …: more drawn than min(requested, population) » (plus) ; puis le plancher CA-13 inchangé (Q-C1-1, Q-C1-2).
- **C-G2-3** : `dir`/`file` et la garde de fin de ligne passent AVANT `archiveFacts` ; la ligne est sérialisée après `facts.commit` ;
  `mkdirSync` après l archive (un CAS perdu ne crée pas non plus de répertoire). En-tête l.9 « exit 2, nothing written » désormais vrai.
- **C-G2-4, C-G2-5, C-G2-6** : tests seuls (le code tenait les clauses) ; la G1 citant une preuve de tête C1 ≠ `recu_head` C2 ; deux
  lignes G2 (`--commit C1`, `oracle-G2.json`) sans `redproof` et à `draw: null` ; un tirage de 3 demandés, 2 tirés sur une population de
  2 (cohérent : il atteint le plancher CA-13 et tue G07) ; reçu archivé : sha (`sha` = `recu_sha` = l enregistrement de lint), tête
  (`recu_head` C1), verdict (`rouge` greffé) ; un reçu dont la tête `0…0` n est pas un commit ⇒ « frozen at 0…0: J-LINT ».
- **C-G2-7** : case 7 : `git push origin 'refs/journal/*:refs/journal/*'` SANS `+` (refus non-fast-forward = arrêt à instruire) + tout
  clone écrivain `git fetch origin '+refs/journal/*:refs/journal/*'` AVANT tout `add` (le `fetch` garde son `+`) ; la ligne datée du G1
  est corrigée EN PLACE (titre « refspec corrigée le 2026-09-29 12:3x UTC, corr1 M-5c, C-G2-7 ») : la forme forcée n y est plus lisible ;
  même contenu dans une ligne datée neuve de REGLES-MISSION et dans l en-tête d `index.mjs` (l.18-19, anglais).
- **Q-G2-5** : préfixe gardé (rien à changer) ; la doc de `deriveRedproof` dit désormais « a reason starting … (a prefix: Q-G2-5) ».
- **Hors tour, non touchés** : G08 (M-5d (J)), G14 et G15, JOURNAL-FACTS-SIGN-1, JOURNAL-REDPROOF-CUTOFF-1, ORACLE-CORPUS-CLONE-1 ;
  `scripts/red-proof.mjs` et l oracle intouchés.

### 16.2 Tests (`test/journal-index.test.ts`, 594 l., sha256 `71e55c6d21779a455884fd980756f711b767ff490d841e4ddbcf26e5171eabdf`)
- **44 tests = 42 du gel 1 (verts) + 2 neufs** (`redproof_bound_gates` l.488, `add_guards_before_effects` l.539), chacun avec son
  `// killer:` de tête ; lignes ajoutées dans (viii) l.452, `schema_v2_strict` l.521, `lint_frozen_and_recu_archived` l.563.
- **Réparation des fixtures (Q-C1-4)** : le RED-PROOF synthétisé tirait 3 tueurs parmi 1 ligne admise avec `population` = `rows.length`
  (incohérent avec `drawKillers`) : `population` = lignes F2P ∪ new-module (l.116), `dp` sur le tirage (l.111), `F3` (3 lignes F2P, l.107)
  pour les cas VERTS (l.155, l.396, `one` de (ix) l.481, `before`/`after` de la transition l.505).
- **Tueurs** : 64 lignes `// killer:` (44 de tête, 20 de corps) = 57 du gel 1 réadressés + 7 neufs ; outil
  `F:/tmp/methode/m5c/corr1/tools/killers.mjs` (`parseKiller` du tronc ; ligne unique où `<before>` figure une fois, sinon celle égale à la
  ligne du gel 1) : 63 déplacés, 0 problème. Le tueur de `facts_branch_deleted_stays_green` change de TEXTE (Q-C1-5).
- **Suite du fichier** (verrou libre vérifié) : 12:34:53Z 44/44 (`run/t1.tap`) ; 12:37:16Z fichier + `byte-guard` + `durable` 67/67
  (`run/t2.tap` ; scan d import de `durable.test.ts` à 0 hit).
- **Portes statiques** (jonction posée 12:35Z) : `lang-gate` exit 0 (0 hit, toutes portées) ; `grep-forbidden` 0 ; `tsc --noEmit` 0 ;
  `eslint` 0 (un `no-base-to-string` corrigé) ; `lint-ratchet` 69/69 ; garde d octets sur les 4 fichiers : 0 TAB, 0 contrôle, 0 C1, 0 CR ;
  `index.mjs` et test en ASCII ; toute ligne de code ou de test touchée ou créée ≤ 160 (contrôlé sur le diff au gel 1).
- **REGLES-MISSION relue par le linter** (`lint.mjs` sur le texte seul, gel 1 contre corr1) : mêmes 2 hits d en-tête (R-BASE, R-MODEL :
  un texte de règles n a ni base ni palier), 0 R-PATH, 0 R-LINE : la ligne neuve n ajoute rien.

### 16.3 R-25
Méthode A (`F:/tmp/methode/m5c/g1/tools/r25-wt.mjs`, pathspec `ci.yml:82`) : **496** = `index.mjs` +156/−20, test +280/−40 (gel 1 : 414) ;
≤ 547, **aucune scission** (M-5c-2 non déclenchée). Écart à l estimation ≈ 430 (Q-C1-6) : la règle ≤ 160 scinde chaque ligne longue
touchée, la réparation des fixtures, deux tests neufs, l en-tête. Oracle : STAT 496 (+436/−60).

### 16.4 F2P (outil du tronc)
`node F:/Monark/scripts/red-proof.mjs --base cb0e268a --gel F:/Monark-wt-m5c --repo F:/tmp/methode/m5c/corr1/base --out
F:/tmp/methode/m5c/corr1/f2p --draw 3 --seed 2026` (base clonée du worktree puis détachée à `cb0e268a`, jonction posée ;
12:44:20-12:46:16Z, sortie 1 attendue sous la transition) : `RED-PROOF.json` sha256
**`fd621dec7d09e447f15a102d50ebb3517f7eff8ef787b3be7587b84ee7c96f90`** (`base.tap` `59e9aa2c…`, `gel.tap` `1257f96e…`, `killer-1..3.tap`
`fd3effce…`, `586063a5…`, `8dcd9bb6…`) : **20 jugés, 24 inchangés : 19 F2P = 17 + 2** + **1 épingle déclarée** `J-HEADER` (l.382,
`refused` « green at base: a self-confirming test », base `pass`, gel `pass`) ; tirage graine 2026, population 19, **3/3 tués** (l.405
`facts_r25_unchanged`, l.403 `facts_crlf_bytes`, l.319 `v1_real_lines_read_as_v1`) ; `gel.head` `65170ad4` (mode worktree),
`digest` `971bba6f…`. `deriveRedproof` du tour sur cet enregistrement : 20 / 19 / 1, `population` 19 = `f2p`, `drawn` 3 = min(3, 19),
`killed` 3, `ok` faux (transition) : citable par une ligne corr (tête = `recu_head` `65170ad4`).

### 16.5 Mutants
Harnais propre au tour, à la discipline commune (`F:/tmp/methode/m5c/corr1/mutants/harness.mjs`, 49 l., sha256 `899c6697…`) : UN
lancement, sur son clone `mutants/clone` (`git clone --no-local` du worktree à `65170ad4`, les 4 fichiers modifiés copiés, sha `262225fe…`
et `71e55c6d…` vérifiés) ; `<before>` exactement une fois sur sa ligne sinon « anchor-lost » ; tests ciblés en TAP puis fichier entier
sur survivant ; issue par `classify`/`parseTap` de `F:/Monark/scripts/red-proof.mjs` (mort, `inconclusive`, `missing`, `skip` ⇒ « non
conclu », jamais « tué ») ; octets restaurés et sha revérifié à chaque pas ; attente du verrou d hôte AVANT chaque course (12 ms en
tout). Tables RÉADRESSÉES par `tools/tables.mjs` (`table.json` `921cf122…` : G1 N01-N39, G2 G01-G16 + G17, G21-G23, tour C01-C12 dans
`mutants/c1.mjs` `8a5b3c89…` ; aux tests ciblés de G05-G07 s ajoute `redproof_bound_gates`) : 0 anchor-lost ; tueurs lus dans le test du
clone (64). Sortie `mutants/run/` (12:46:33-12:56:44Z) : `RESULTS.txt` `b4a044334f36787d899d138887c7f60886166cb7fa97fe80a0c03933cfe586c0`,
`RESULTS.json` `87a3a1ab8cafd16ba4b6de608ce51ee17d9073f439e17385e1426c51e991e6bd` ; BASELINE vert 44/44.

| ensemble | mutants | tués | survivants |
|---|---|---|---|
| G1, table N01-N39 | 39 | 39 | — |
| G2, tables `new.mjs` + `new2.mjs` (G01-G23) | 20 | 17 | G08, G14, G15 |
| tour, table C01-C12 | 12 | 12 | — |
| tueurs du test (57 du gel 1 réadressés + 7 neufs) | 64 | 64 | — |
| **total** | **135** | **132** | **3** |

- Tous les tués le sont par `assert-fail` sur leurs tests ciblés (0 « fichier entier »), 0 non conclu, 0 anchor-lost, 135 restaurations.
- Les 9 survivants neufs du G2 qui étaient des clauses non épinglées sont **tués** : G05, G06, G07 par `redproof_bound_gates` ; G10 par
  `schema_v2_strict` ; G17, G21, G22, G23 par `lint_frozen_and_recu_archived`.
- Survivants restants, attendus et nommés : **G08** (origine `freeze` traitée comme `add` : aucune ligne `freeze` avant M-5d ; le test
  du `freeze` le tuera, l.61 (J)) ; **G14** (équivalent : `--stdin` sans `--path` implique `--no-filters`) ; **G15** (équivalent sous
  l outil actuel, qui écrit la raison GAB exacte ; préfixe gardé, Q-G2-5).
- Tour : C01-C03 (portes sans tête), C04 (garde qui ne stoppe pas), C05-C11 (population, étiquettes, min, copie, `drew`), C12 (domaine) :
  12/12 ; tueurs neufs K468, K487, K493, K533, K538, K548, K581 tués ; le tueur de texte modifié K421 (Q-C1-5) tué.
- **Contrôle d ordre** (C-G2-3 ; mutant multi-ligne hors harnais, `tools/order-check.mjs` `1ff3acd8…`, clone `mutants/clone-order`,
  12:49:49-12:49:59Z) : la garde de fin de ligne replacée APRÈS `archiveFacts` (l ordre du gel 1) rougit `add_guards_before_effects` par
  `assert-fail` : `created` voit la ref créée (`3c0e13d3…` au lieu de rien), `moved` voit le tip déplacé (`1389f8fc…` au lieu de
  `d5c126c5…`) ; `order.tap` `7c77049b…` ; octets restaurés.

### 16.6 Rejeu réel (clones seulement ; outil = `index.mjs` corrigé du worktree, lu ; `F:/tmp/methode/m5c/corr1/replay/`)
- **Base** (`replay.sh`, `steps.log`, 12:48:10-12:48:44Z) : `git clone --no-local F:/Monark`, branche à `cb0e268a`, 101 branches
  `lot/*` locales, 0 ref `refs/journal` ; `build` **vert, 0 hit, 7 lots, 21 entrées** ; `INDEX.md` **identique à l octet** à
  `cb0e268a:docs/journal/INDEX.md` (`e8ad7ec1…` ×2) ; `status` 0 ligne.
- **Ligne v2 de démonstration** (mission `mission-cp2-demo.md` du G1, `a926167d…`, relancée par `launch.mjs` ; enregistrement d oracle
  `fb6bbc0b…-cp-2-20260929T070905Z-126300.json` `8fad97e3…` ; RED-PROOF réel du cp-2 M-5b `e19ccef5…`) : `add` exit 0, `redproof` = 11 /
  9 / 2 / **`population` 9** / 3 / 3 / `ok` faux, `facts.commit` `da782da1…`, 5 entrées ; `build` complet **vert, 8 lots, 22 entrées**
  (3 demandés, 3 tirés sur 9 : vert).
- **Variantes du réel** (`variants.mjs`) : `requested` 5 ⇒ **`J-REDPROOF … draw of 5 requested, 3 drawn of 9: a truncated draw`** ;
  `population` 11 ⇒ `… draw population 11 != f2p 9: a draw of another population`.
- **C-G2-1 sur le réel** : `add --gate fusion --commit cb0e268a --from-redproof` (tête `fb6bbc0b`) ⇒ exit 2 `J-SCHEMA: redproof cited at a
  gate without a head binding`, aucun fichier de lot, tip inchangé (`c4208863…` avant et après).
- **C-G2-3 sur le réel (P1)** : fichier de lot `x` sans LF, `add` à 5 faits ⇒ exit 2 « does not end with a newline: nothing appended »,
  tip inchangé (`c4208863…`), octets `x`.
- **Clone du clone** : sans `fetch` : rouge et stderr `archive: ref absent from --repo, fetch expected: git fetch origin
  '+refs/journal/*:refs/journal/*'` ; après `fetch` : vert (1 lot, 1 entrée).
- **Sonde P4 refaite (C-G2-7)** (origine nue locale, aucun réseau) : w1 archive A1 `c6054521…` et pousse SANS `+` (création acceptée) ;
  w2 = clone de reprise sans `fetch` (0 ref), `add` ⇒ A2 `9b5c90c5…` RACINE ; push SANS `+` : **`! [rejected] refs/journal/facts ->
  refs/journal/facts (non-fast-forward)`**, exit 1, l origine garde A1 ; w3 = clone de reprise qui fait `fetch` AVANT `add` : A3 `f926bf24…`
  de parent A1 ; push SANS `+` **accepté** (tip A3) ; A1 ancêtre du tip (exit 0), atteignable (1), le fait de A1 relu au tip (sha256 =
  nom `5fd6d2f9…`) : **faits antérieurs atteignables**.
- **Tronc courant** (`replay-head.sh`, `steps-head.log`, 12:49:08-12:49:24Z ; le tronc a bougé : `29897794` ajoute 4 lignes v1 de M-7) :
  clone de `F:/Monark` à `d115be5e`, 101 branches `lot/*` : `build` **vert, 0 hit, 8 lots, 25 entrées** ; `INDEX.md` **identique à l
  octet** à `F:/Monark/docs/journal/INDEX.md` (`cf4e1433…` ×2).

### 16.7 Oracle
`node F:/Monark/scripts/oracle/run.mjs --role corr --tree F:/Monark-wt-m5c --base cb0e268a --key M-5c` (jonction posée, C-V-4 et verrou
vérifiés avant : 21 421 Mo, 8 `node.exe`, verrou libre, 12:56:50Z ; aucune course de ma part pendant la suite) : exit 0 ; enregistrement
**`F:/tmp/oracle-results/65170ad4e4a82c7c61cdc27fe791ec78d00ac4f5-2f09c9424dff1433-corr-20260929T125700Z-113076.json`**
sha256 **`d9b1995de864815787dd4b31b08fbaac05c056d8201de326fde343dc1e74e909`** : `role` corr, `tree.head` `65170ad4e4a82c7c61cdc27fe791ec78d00ac4f5`,
`tree.dirty` `2f09c9424dff1433d27b1e41e8b26379a3ba3908c4a39fcebd3df215aa21ec63`, `tree.object` `5dbf0167f646…`, `key` `f45a0dd008c2…`,
**`static_only` false, `served_from` null, `exit` 0**, `lock_wait_s` 0, `cv4` 22418 Mo / 9 `node.exe`,
2026-09-29T12:57:00Z-2026-09-29T13:04:40Z ; portes : `bash enforcement/lint-model-pinning.sh .` 0, `r25` 0, `lang:gate` 0, `export:check` 0, `gate:vocab` 0,
`typecheck` 0, `lint` 0, `lint:ratchet` 0, `test` 0 ;
**tests 1642 = 1 640 + 2** (1639 pass, 0 fail, 3 skip) ; test 42 une fois, dans la suite ;
**r25 STAT 496** (+436/−60, borne CI 1205) ; `residues.tmp_entries` 379.

### 16.8 MAST
- **FM-1.2** : `add` enregistre, `build` juge ; toute garde (usage, J-SCHEMA dont C-G2-1, fin de ligne) précède `archiveFacts` : exit 2
  ⇒ 0 octet, aucune ref créée ni déplacée (test `add_guards_before_effects` ; l ordre du gel 1 le rougit : `created` et `moved` rouges ;
  P1 et fusion sur le réel : tip inchangé).
- **FM-3.2** : inchangé ; N02-N04, G02-G04 re-tués ; clone du clone sans `fetch` rouge nommé ; aucune lecture d hôte pour une ligne v2.
- **FM-2.6** : la cohérence du tirage s élargit (`population` = `f2p`, `drawn` = min(`requested`, `population`)) ; `pins` reste DÉRIVÉ,
  `ok` reste COPIÉ (le « `ok` recalculé » de Q-G2-3 n est pas dans la liste fermée : non fait).
- **FM-1.3** : coexistence v1/v2 : 21 v1 vertes à la base, 25 au tronc courant, `INDEX.md` à l octet ; G08 survit jusqu au `freeze`.

### 16.9 `error_origin` proposés (D11)
C-G2-1 **G0** ; C-G2-2 **ORCH** ; C-G2-3 à C-G2-6 **G1** ; C-G2-7 **VAL** (repris du G2, § 8) ; fixture `proof()` incohérente avec
`drawKillers` (`population` = `rows.length`, 3 tirés sur 1) : **G1** ; écart R-25 à l estimation : **ORCH** (estimation sans la règle
≤ 160 ni la réparation des fixtures).

### 16.10 Review Focus (couverture)
1. Fichier de lot sans LF : exit 2, 0 octet, ni créée ni déplacée : `add_guards_before_effects` (créée, déplacée), P1 réel.
2. `redproof` à fusion, preuve d une autre tête : refusé par `add` (test, réel) et par `build` (`schema_v2_strict`, ligne `x(8)`).
3. 5 demandés / 3 tirés sur 9 : rouge « a truncated draw » (test M-Z:10, réel) ; 3 / 3 : vert (ligne `m5b` du test, ligne réelle).
4. Reçu archivé forgé (sha, tête, verdict) : rouges nommés `J-RECU` (M-Z:1-3 de `lint_frozen_and_recu_archived`).
5. Push de reprise sans `fetch` : rejeté sans `+` ; faits antérieurs atteignables (P4, § 16.6).

### 16.11 Questions (Q-C1-n)
- **Q-C1-1 (C-G2-2, lecture de « `population` (= `f2p`) »)** : `population` est COPIÉ de `draw.population` et J-REDPROOF exige
  `population` = `f2p` quand un tirage existe (« draw population P != f2p F: a draw of another population », libellé hors liste) : sans
  cette égalité, un `draw.population` édité à la baisse masquerait un tirage tronqué (`drawn` = min(`requested`, `population`) tiendrait).
  Autre lecture possible : `population` := `f2p` dérivé, `draw.population` ignoré ; mêmes verdicts sur tout enregistrement honnête et sur
  la variante 5 / 3 ; seul un `draw.population` édité diffère. À confirmer (ou repli : 1 ligne de code, 1 cas de test).
- **Q-C1-2 (C-G2-2, surtirage ; couplage M-4b)** : `drawn` > min(`requested`, `population`) est rouge « more drawn than min(requested,
  population) » (« `drawn` = min exigé » l implique ; libellé hors liste). l.62 (M-4b) : « les tueurs d épingles sont TOUS tirés, hors
  tirage » : si l outil de M-4b les écrit dans `draw.drawn`, `drawn` = min + `pins` rougira toute preuve à épingle (`killed` = `drawn`
  tiendrait) ; la ligne datée due au G7 de M-4b (l.60 et l.62) doit dire où vivent ces tueurs, ou ajuster J-REDPROOF ; proposé : le
  rattacher à RED-PROOF-PIN-1 (déclencheur : fusion de M-4b).
- **Q-C1-3 (C-G2-6, domaine de `head`/`base`)** : `sha()` gardé = 40 hex (64 sous un format d objets SHA-256, comme `commit`,
  `tree_head`, `facts.commit`) ; « sha (40 hex) » lu comme la forme SHA-1 de ce domaine : réduire à 40 seuls rendrait la tête d un dépôt
  SHA-256 inégale à son `commit` pour toujours (J-REDPROOF). Les deux cas du test (`ok: "yes"`, `population: -1`) sont refusés par
  toute lecture. À confirmer.
- **Q-C1-4 (fixtures, `error_origin` G1)** : le RED-PROOF synthétisé du test écrivait `population` = `rows.length` et tirait 3 tueurs
  parmi une ligne admise : incohérent avec `drawKillers` (min(n, population)), rouge sous la clause neuve ; réparé (population = lignes
  F2P ∪ new-module ; `F3` pour les cas verts) ; les cas rouges gardent leur premier motif (règles neuves placées après `ok` faux).
- **Q-C1-5 (tueur modifié en texte)** : réadresser le tueur de tête de `facts_branch_deleted_stays_green` (texte du gel 1 : 214 caractères)
  touchait une ligne > 160 ; nouveau texte `CONST "r?.verdict" -> "lintMission({ text: String(fact(m.sha).bytes), missionPath: repo,
  repo, rev }).verdict"` (J-LINT recalculé sans le post-filtre LINT-UNTRACKED : même classe que N11) ; N11 (recalcul complet) reste dans
  la table du G1, tué. À confirmer.
- **Q-C1-6 (R-25)** : 496 ≤ 547 (marge 51), non ≈ 430 : la règle ≤ 160 scinde chaque ligne longue touchée (l.114 : 202 car., l.152 :
  280, l.458 : 507, l.460 : 259 du gel 1), la réparation des fixtures, deux tests neufs et les cas ajoutés, l en-tête ; aucune scission.
- **Q-C1-7 (titres)** : les titres de (viii) `redproof_roundtrip`, `schema_v2_strict` et `lint_frozen_and_recu_archived` dépassent 160 caractères et ne
  peuvent être touchés (la ligne de déclaration est lue entière par `judgedOf` et les harnais) : leurs cas neufs sont nommés par des
  tueurs de corps et par ce journal ; item proposé JOURNAL-TEST-TITLES-1 (M-5d, ou un lot de lisibilité comme M-7b) : scinder ces tests,
  titres ≤ 145.
- **Q-C1-8 (arithmétique des mutants)** : « 96 + 20 − 2 tués » compte G08 tué ; mesuré 96/96 + 17/20 = 113, plus 7 tueurs neufs et
  12 mutants du tour = **132/135**, survivants G08 (M-5d (J)), G14 (équivalent), G15 (équivalent sous l outil actuel).
- **Q-C1-9 (≤ 160 dans les `.md`)** : appliquée au code et aux tests (`scripts/`, `test/`) : toute ligne touchée ou créée ≤ 160,
  contrôlé sur le diff. Dans les `.md` (style de la maison : une ligne par case, par règle, par paragraphe ; REGLES-MISSION insérée
  verbatim dans les missions), la case 7 corrigée de CHECKLIST-G7 (touchée) et la puce neuve de REGLES-MISSION (créée) sont des lignes
  longues ; ce § est coupé à ≤ 160. Si la règle couvre aussi les `.md` : reformatage de forme seule (R-25 0).
- **Q-C1-10 (case 7 corrigée en place)** : la ligne datée du G1 (non fusionnée) porte désormais le `push` SANS `+` et un titre daté
  « refspec corrigée … corr1, C-G2-7 », au lieu d une ligne datée neuve qui laisserait la commande forcée lisible dans la liste de contrôle
  (une commande lisible est une invitation à l exécuter). Exception au « rien n est effacé » à confirmer.

### 16.12 Écarts et traces
- **Écritures** : le worktree (4 fichiers de la liste « À créer » et ce journal) et `F:/tmp/methode/m5c/corr1/`, `F:/tmp/methode/m5c-corr1-deliver/`
  (plus l enregistrement d oracle écrit par l outil sous `F:/tmp/oracle-results/`). **Aucun git écrivant** dans le worktree ni dans
  `F:/Monark` (des `git clone` en lecture seulement) ; `refs/journal/facts` écrite seulement dans les dépôts jetables du test (sous
  `os.tmpdir()` = `F:/tmp/methode/m5c/corr1/tmp`), dans les clones `replay/trunk`, `replay/c3`, `replay/p4/w1..w3` et l origine nue locale
  `replay/p4/origin.git` ; un commit dans le clone `replay/trunk` (ligne v2 de démonstration), sans option de signature ; aucun réseau ;
  rien sur C: ; TEMP `F:/tmp/methode/m5c/corr1/tmp` partout.
- **Verrou d hôte** : lu avant chaque course : suite du fichier 12:34:53Z (après la libération d un oracle `corr` tenu depuis 12:26:45Z),
  12:37:16Z ; F2P après 90 s d attente (cp-2 de M-7, 12:37:47-12:44:20Z) ; harnais mutants avec attente AVANT chaque course (12 ms en
  tout) ; contrôle d ordre 12:49:49Z ; les portes statiques (`tsc`, `eslint`, `lang-gate`, 12:36:06-12:36:21Z) sans relecture à cet
  instant (pas des tests ; verrou libre à 12:34:53Z et 12:37:16Z, pris à 12:37:47Z) ; aucune course ni harnais de ma part pendant la
  suite de mon oracle (rédaction seule).
- **Jonctions `node_modules`** : worktree (12:35Z) et clone `base` (12:42Z) par `mk-nm.ps1` ; retirées par `rm-nm.ps1` avant le rendu
  (`removed` ×2 à 13:05:15Z ; `F:/Monark/node_modules` intact, 220 entrées).
- **Transport** : l outil d écriture décode `\uXXXX` (mesuré sur un fichier de brouillon) : aucune telle séquence écrite ; `\"` et `\\`
  préservés, contrôlés par `parseKiller` (64 tueurs, 0 problème).
- **Rejeu** : la comparaison d `INDEX.md` de la base au `F:/Monark` courant diffère (attendu : le tronc a bougé, `29897794`) ; comparé
  au tronc courant par `replay-head.sh` : identique.
- **Oracle** : `tree.dirty` haché au lancement (12:56:5xZ), AVANT l écriture de ce § 16 (texte `.md` seul ; aucun octet de code ni de
  test changé après 12:37Z : `index.mjs` `262225fe…`, test `71e55c6d…`).

## 17. Reprise sur le tronc du 2026-10-08 (branche `paroxysme/m5c-resume`, une PR) — journal du 2026-10-08, 19:23Z-20:10Z

claude-opus-5-5

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant exact donné par le harnais), effort max ; worker de la session PAROXYSME,
  étapes (5) et (6) du plan de la reprise ; il ne committe ni ne pousse (R-20) : la session relit, committe et pousse.
- **Décisions** : plan de la reprise v3 (sha256 `c1f1de46…0a0cc005`), accepté par MONARK : Q-RM5C-1 (a), la branche naît du tronc et
  fusionne `lot/methode-m5c` en `--no-ff` sous un titre anglais ; Q-RM5C-2 (a), une seule PR (la borne 547 de l ADR-METHODE-2 l.60 se
  lit comme la borne ascendante du G0, close par la correction de la case 4 de la CHECKLIST-G7 : `r25()` ≤ 1 150, porte CI 1 205).
- **Base** `c94c57dfc4873a7a0dd04b89148eec01de5a061b` (tronc du jour). Commits de la branche : `2fa5172f` (partie linter de l item),
  `3fe2b6f1` (fusion `--no-ff` de `93e9abce`, 2026-10-08 19:20:03Z), `70fef918` (partie journal de l item), `a03dba6a` (retouche
  red-proof v2) ; puis l étape (5) (lignes longues, en-têtes, relevé) et l étape (6) (ce § et la ligne datée de la case 5).
- **Horloge** (`date -u`) : début 19:23Z ; lignes longues et en-têtes 19:27-19:34Z ; fichiers touchés 19:34Z ; `test:main` 19:35-19:40Z ;
  relevé 19:40Z ; base `c94c57df` (copie `git archive`) 19:41Z ; red-proof 19:42-19:43Z ; portes statiques 19:42-19:48Z ; deux
  `no-base-to-string` corrigés 19:47Z ; mutants 19:44-20:01Z ; red-proof sur l arbre final 19:51-19:52Z ; ce § 20:01Z ;
  `test:main` sur l arbre final (ce § compris) 20:03-20:08Z, mêmes comptes, relevé réécrit identique à l octet (`cmp`) ; portes
  statiques sur l arbre final 20:08-20:10Z, toutes à 0.

### 17.1 La fusion sur le tronc du jour : trois conflits et leurs résolutions
- De `b44c3890` (tronc de l essai du plan) à `c94c57df`, aucun des neuf fichiers de la liste ne change (`git diff --name-only`, vide) :
  la fusion `3fe2b6f1` reprend les résolutions de l essai.
- **Conflit 1, `docs/methode/CHECKLIST-G7.md`** (un bloc) : le tronc ajoute la ligne datée de la case 4 (`ed8edfe9`, 2026-09-30), la
  branche celle de la case 5 (archive des faits, (3a) puis (3b)) : les deux sont gardées (l.8, l.9) ; les cases 7 (branche) et 11
  (tronc, `75dff4d6`) sans conflit.
- **Conflit 2, `docs/methode/REGLES-MISSION.md`** (un bloc après la l.7) : la ligne du tronc du 2026-10-08 reste en l.8, rattachée à
  la l.7 ; les deux lignes de la branche (2026-09-29 10:1x et 12:3x UTC) suivent en l.9-10. 32 lignes ; aucune perdue (`grep -vxFf`
  contre `93e9abce` et contre `c94c57df` : 0 et 0). Ce fichier ne change pas dans les étapes (5) et (6).
- **Conflit 3, `test/journal-index.test.ts`** (deux blocs) : les imports `once` (tronc, `0792314e`) et `pathToFileURL` (branche) sont
  gardés ; le test du tronc `LINT-UNTRACKED-TMP-1` est gardé, son tueur réadressé de `index.mjs:120` à `:152` (même `<avant>`, dans
  `unlisted` ; l.372 du test) ; le tueur de TIER-FROM-HEADER passe de `:149` à `:185` (l.389).

### 17.2 Les deux conflits que `merge-tree` ne voit pas
- **`seq`** : le tronc l a retiré (`copy()`, `0792314e`), la branche l employait (`93e9abce`) ; l essai du plan y a mesuré 14 tests
  rouges sur 45 (mesure de l essai, non refaite ici). Résolution : le nom de la mission vient du dossier unique de `repo()` (l.126,
  `basename`), le clone va dans un `mkdtempSync` (l.416).
- **`red-proof-v2`** : le `scripts/red-proof.mjs` du tronc écrit `red-proof-v2` depuis `b6f33efe` (l.286) ; le gel 2 n acceptait que
  `red-proof-v1` : la case 5 du G7 aurait rougi. Retouche `a03dba6a` : `add --from-redproof` (`index.mjs:201`) et J-REDPROOF (`:293`)
  acceptent v1, ou v2 de mode `f2p` ; test `red-proof v2: …` (l.631) ; tueurs `:201` (l.630, de tête) et `:293` (l.634, de corps).

### 17.3 L item JOURNAL-LINT-FREEZE-HOST-1
- **Avant** : à `93e9abce`, l `add` lintait la mission une fois, sa partie dépôt figée à la révision, sa partie hôte lue vivante
  (branches, chemins absolus, dossiers d outils) : une branche ou un outil présents au lancement, absents à l `add`, rougissaient
  J-LINT (R-BRANCH, R-TOOL).
- **Construction** : `lintMission` prend `host` (défaut `true` : `launch.mjs`, `gen.mjs` et la lecture v1 de `build` inchangés) ;
  `host: false` ne lit rien de l hôte : branches (`lint.mjs:105`, jugées l.156), chemins absolus (l.142 existence, l.150 longueur),
  dossiers d outils (l.140, l.146, l.168). L `add` passe `host: false` (`index.mjs:209`) ; la partie hôte est celle du lancement,
  attestée par le reçu, que `launch.mjs` n écrit que vert, un compte par code (l.30-35) ; l `add` refuse un reçu dont un compte n est
  pas 0 (`index.mjs:182`, sortie 2, rien d écrit). `build` relit l enregistrement `monark.lint.v1` figé, jamais l hôte (en-tête l.50-51).
- **Tests** : `add reads no host: …` (`test/journal-index.test.ts:618` : vrai `launch.mjs`, `add`, `build`) ; `host false: …`
  (`test/mission-lint.test.ts:304`, `:312`, `:324` ; le dernier épie `existsSync` et `statSync` de `node:fs`). Tueurs : `index.mjs:209`
  (tête, l.617), `:182` (corps, l.625) ; `lint.mjs:142` (tête, l.303), `:105` et `:168` (corps, l.307-308), `:150` (tête, l.311),
  `:140` (tête, l.323), `:146` (corps, l.331).

### 17.4 Étape (5) : lignes longues, en-têtes, titres
- **Lignes longues** (convention ≤ 160 points de code dans `scripts/` et `test/`, Q-RR1-1) : la liste se recalcule à `a03dba6a` contre
  `c94c57df` (ligne ajoutée ou modifiée de plus de 160 points de code, absente telle quelle de la base) : 96 lignes. 80 sont présentes
  telles quelles au gel 2 `93e9abce` (le lot M-5c accepté au cp-2 du 2026-09-29 : 23 dans `index.mjs`, 57 dans le test) : hors de la
  liste du plan (P5), non réécrites, proposées en item (17.6). 16 viennent des commits de cette branche ; 12 sont réécrites sur place,
  sans ligne ajoutée en production (numéros de `a03dba6a`, avant → après en points de code) : `index.mjs` l.50 (254 → 137, la l.51
  reprend la fin : 140), l.182 (193 → 152, `typeof r.mission` passe en l.181), l.201 (208 → 155, `v1` en l.200), l.293 (205 → 158, la
  garde « not JSON » en l.292) ; `lint.mjs` l.140 (164 → 132, `rel` en l.139) ; `test/journal-index.test.ts` l.126 (169 → 151),
  l.485 (179 → 130 et 66), l.617 (titre, 204 → 158), l.630 (titre, 166 → 147), l.631 (174 → 158), l.634 (178 → 75 et 133) ;
  `test/mission-lint.test.ts` l.305 (232 → 89 et 150). Production : 437 → 437 lignes (`index.mjs`), 210 → 210 (`lint.mjs`).
- **Restent**, longues avant cette branche (les replier décalerait des tueurs) : `index.mjs` l.98 (215, déjà 215 à `c94c57df`), l.209
  (181, 168 à `93e9abce`) ; `lint.mjs` l.156 (182, 161 à `c94c57df`), l.168 (233, 225 à `c94c57df`).
- **En-têtes** (« red-proof-v1 » seul) réécrits sur place : `index.mjs` l.13, l.68, l.415 ; le refus de `build` dit
  `RED-PROOF <schéma>: not v1, nor v2 of mode f2p` (l.293) et l attendu du test suit (l.491) ; celui d `add` dit
  `--from-redproof: not a red-proof-v1 record, nor a v2 one of mode f2p` (l.201, attendu l.485).
- **Titres** : aucun code interne de méthode dans un nom de test : `add reads no host: …` (l.618), `red-proof v2: …` (l.631),
  `host false: …` (`test/mission-lint.test.ts` l.304, l.312, l.324).
- **eslint** : deux `no-base-to-string` déjà présents à `a03dba6a` (ses l.626 et l.634), corrigés sur place : `assert.match(at("G1")
  as string, …)` (l.627 ; `assert.match` sur un objet lève une `AssertionError`, le tueur `:182` reste une mise à mort par assertion)
  et `String(cp2(…) as string)` (l.636).
- **Ancrage** (`parseKiller` du tronc, avant et après) : chaque ligne `// killer:` du dépôt garde son `<avant>` exactement une fois sur
  la ligne qu elle nomme : 1 789 tueurs, 1 789 ancrés, 0 perdu ; `killerProblem` du tronc : 69 valides (`journal-index`), 41
  (`mission-lint`), 0 invalide.

### 17.5 Comptes et preuves de cette passe (Node 24.21.0, git 2.43.0)
- **Fichiers** (sha256) : `scripts/journal/index.mjs` `440455d5…3591e8cb`, `scripts/mission/lint.mjs` `afa40231…ec50e11c`,
  `test/journal-index.test.ts` `2e3d01e6…0d3eaaf4`, `test/mission-lint.test.ts` `33f07e88…55b90f45`, `test/test-counts.json`
  `9cdfbd4b…01fcddf7` ; `scripts/mission/lint.d.mts` et `docs/methode/REGLES-MISSION.md` inchangés depuis `a03dba6a`.
- **`npm run test:main`** : 2 986 tests, 2 961 verts, 3 rouges, 22 sautés, sortie 1. Les 3 rouges sont dans `apps/sentinel/test/`
  (`sentinel-chainstack-guard.test.ts` l.440 et l.445, `ukemi-guard-record.test.ts` l.929), hors des fichiers de la branche, et rouges
  de même à la base `c94c57df` (copie `git archive`, mêmes modules : 48 tests, 45 verts, ces 3 rouges) : un fait de l environnement de
  cette passe, pas de la branche ; la CI de la PR et le rejeu Windows en jugent. Les deux fichiers touchés seuls, sur l arbre final :
  86 tests, 83 verts, 3 sautés (corpus de l hôte absent), sortie 0.
- **Relevé** (`node scripts/test-count-floor.mjs write`, jamais à la main) : 289 fichiers, 2 986 tests ; `test/journal-index.test.ts`
  28 → 47 et `test/mission-lint.test.ts` 36 → 39 (attendus du plan) ; trois écarts du tronc, que son relevé (dernière écriture
  `e0c808cd`, 2026-10-08 11:39Z) ne portait pas : `apps/sentinel/test/sentinel-chainstack-guard.test.ts` 15 → 17 (`659d869b`),
  `test/kata-recalc.test.ts` 6 → 7 (`b9ec78b5`), `test/workspace-bin-mode.test.ts` 1, neuf (`11af7539`) ; aucun de ces commits n est
  un ancêtre de `e0c808cd` ; à `c94c57df` ces fichiers déclarent 17, 7 et 1 tests.
- **Portes statiques** : `tsc --noEmit -p tsconfig.json` 0 ; `eslint` sur les deux fichiers de test 0 (les `scripts/**/*.mjs` sont
  ignorés par la configuration) ; `lint:ratchet` 69/69, 0 ; `lang-gate` 0 (0 hit) ; `grep-forbidden` et `gate:vocab` 0 (351
  fichiers) ; `git diff --check c94c57df` 0.
- **Red-proof** (outil du tronc ; `--base c94c57df --gel <arbre> --repo <arbre> --draw 3 --seed 3640954495`, la graine : les huit
  premiers chiffres hexadécimaux du sha256 de la mission de cette passe, `d9048e7f`, en décimal) : `red-proof-v2`, mode `f2p` ; 25
  jugés, 24 F2P, 1 refusé : `J-HEADER: the real form…` (l.402), « green at base: a self-confirming test », l épingle déclarée au § 5
  (l.41) : (1) son `<avant>` est à la base (`index.mjs:184` de `c94c57df`), (2) son tueur `index.mjs:241` est tué (K38 ci-dessous),
  (3) `base: pass`, `gel: pass`. Tirage : 3 tueurs sur 24, 3 tués (`index.mjs:319`, `:423`, `lint.mjs:142`) ; sortie 1 pour cette
  épingle seule : la catégorie « épingle » n est pas au tronc en mode `f2p` (RED-PROOF-PIN-1 ouvert). `RED-PROOF.json` de l arbre
  final : sha256 `729644d7…182dc1b0`. Le plan comptait 23 jugés : les deux tests `host false` ajoutés après sa mesure font 25.
- **Mutants** (outil du tronc `scripts/mutants/run.mjs`, sha256 `13b2b11f…ed249b9d`, `--killers --base c94c57df`, `--out` et `--lock-root`
  neufs, hors du dépôt) : `index.mjs`, `--only K1..K69 --targets test/journal-index.test.ts` : **69/69 tués**, 0 survivant, 0 non
  conclu, sortie 0 (`RESULTS.json` `4ada6587…b2a23488`) ; `lint.mjs`, `--only` ses 39 tueurs (K70..K83, K86..K110) `--targets
  test/mission-lint.test.ts,test/journal-index.test.ts,test/mission-gen.test.ts` : 38/39 tués, K107 (`lint.mjs:168`, tueur de corps
  l.308) non conclu (premier passage : 31 tests rapportés sur 39 et un échec du fichier sans assertion ; son rejeu sur les trois
  cibles : tué, 2 rouges par assertion), sortie 1 (`1306c89b…f278de27`) ; K107 relancé seul : tué (1 rouge par assertion, sur son
  test), sortie 0 (`9e8524ca…a8c5ee28`). Les quatre tueurs des deux tests retouchés après le lancement de la première passe (K66..K69)
  rejoués sur l arbre final : 4/4 tués, sortie 0 (`37d29f6b…6d4849ac`). K84 et K85 visent `launch.mjs`, hors des deux passes.
- **R-25** : `r25()` de `scripts/oracle/r25.mjs`, avec le `ci.yml` de la branche, sur un clone où l arbre final est commis, contre
  `c94c57df` : 518 insertions, 80 suppressions, **598**, GREEN (≤ 1 150 par `r25()`, case 4 ; porte CI 1 205). À `a03dba6a` : 580
  (507 + 73, la mesure de l essai à `7f55cda9`) ; l étape (5) ajoute 18 : le relevé 11 (6 + 5 ; le plan en attendait 4), deux lignes de
  la base modifiées sur place (`lint.mjs` l.139, l.17 du test) 4, trois lignes de test coupées en deux 3.

### 17.6 Limites en items
- **LINT-HOST-SNAPSHOT-1** : la partie hôte de J-LINT repose sur la parole du reçu ; R-BASE lit le dépôt vivant (`git rev-parse` de la
  base, `lint.mjs:173`), stable si la base est un ancêtre de la révision rejouée, sinon elle peut basculer entre le lancement et
  l `add`. Construction : `launch.mjs` fige les faits d hôte lus (chemins absolus et longueurs, branches, dossiers d outils, base
  résolue) dans un enregistrement que l `add` archive ; J-LINT rejoue `lintMission` sur cet hôte figé. ≈ 0,5 j-h, R-25 ≈ 80 (estimés) ;
  déclencheur : la fusion de M-5c ; formé à ETAT par MONARK.
- **JOURNAL-REDPROOF-TEST-ONLY-1** : un RED-PROOF `red-proof-v2` de mode `test-only` reste refusé par `add` et par J-REDPROOF (test
  l.631). ≈ 0,25 j-h (estimé) ; déclencheur : la première ligne G2 d un lot de tests seuls.
- **Proposés par cette passe** (à former par MONARK) : JOURNAL-LINE-LENGTH-1, les 80 lignes longues de M-5c (23 de `index.mjs` et 57 du test ;
  7 dans des blocs où `c94c57df` avait déjà des lignes longues) réécrites sous 160, tueurs réadressés par l outil du tronc, les titres
  avec l item proposé JOURNAL-TEST-TITLES-1 (§ 16.11, Q-C1-7) : ≈ 0,5 j-h, R-25 ≈ 60 à 100 (estimés), déclencheur la prochaine ouverture de `scripts/journal/index.mjs` (M-5d) ;
  MUTANTS-TAP-LOST-TESTS-1, un passage de mutant dont le TAP rapporte moins de tests que le fichier n en déclare, avec un échec du fichier
  sans assertion (K107, une fois) : le classer « non conclu » avec ce motif, et lancer les enfants comme `test:main` (préchargement
  `test/helpers/blocking-stdout.cjs`, sortie bloquante ; cause non établie) : ≈ 0,25 j-h (estimé), déclencheur la prochaine ouverture
  de `scripts/mutants/run.mjs` (M-6b).

### 17.7 Écarts et traces
- **Écritures** : les neuf fichiers de la liste seulement (sept changés depuis `a03dba6a` : `index.mjs`, `lint.mjs`, les deux tests,
  `test/test-counts.json`, CHECKLIST-G7, ce journal) ; `test-counts.out.json`, sortie de `test:main`, ignoré par git. Aucune commande git
  qui écrit dans le dépôt ; aucun `GIT_DIR`, aucun `--write-tree` ; copies et clones de mesure hors du dépôt ; aucun réseau.
- **Windows** : les tests `host false: …` l.312 et l.324 de `test/mission-lint.test.ts` lisent un chemin de lecteur présent : sous
  Windows le dossier temporaire du test, hors de Windows un dossier relatif `Z:` sous ce dossier avec `process.chdir` (rendu dans un
  `finally`) ; le l.324 remplace `existsSync` et `statSync` de `node:fs` (`syncBuiltinESMExports`, rendus dans un `finally`). Le l.304
  cite `Z:/fh-absent/x.md:3`, absent partout. Rejeu Windows : acte de MONARK à la fusion.

### 17.8 Relecture de la session, 2026-10-08 20:24 UTC (après les commits `f7406327` et `e611e582`)
- **Constat** : l étape (5) avait retiré le chemin du fichier des deux refus d `add` (`index.mjs` l.182 et l.201), que le gel 2
  `93e9abce` et le tronc `c94c57df` (l.146) nomment ; un refus perdait ainsi le nom du fichier refusé.
- **Correction** : `const src` reprend l option en l.181 et l.200 ; les refus disent `--from-recu <chemin>: not a green launch
  receipt` et `--from-redproof <chemin>: not red-proof-v1, nor v2 of mode f2p` ; aucune ligne de production ajoutée (437 lignes),
  la plus longue des quatre à 159 points de code. Les deux tests comparent la sortie entière, chemin compris (test l.486, l.630), et
  portent chacun un tueur de corps neuf (l.485 vers `index.mjs:201`, l.629 vers `:182`). Les numéros de ligne du test cités aux § 17.2 à
  17.4 à partir de la l.485 se lisent désormais +1 (de la l.485 à la l.626) ou +2 (au-delà).
- **Preuves** (Node 24.21.0) : `test/journal-index.test.ts` seul, 47 tests, 47 verts, sortie 0 ; ancrage, 1 791 tueurs, 1 791
  ancrés ; `killerProblem` 71 valides (`journal-index`), 41 (`mission-lint`), 0 invalide ; `eslint` sur les deux tests et
  `tsc --noEmit` 0 ; mutants (`--killers --base c94c57df --only K5,K47,K68,K69,K70`, les cinq tueurs des l.181-182 et l.200-201) :
  5/5 tués, sortie 0 (`RESULTS.json` `531bc66a…1962c9fb`).
