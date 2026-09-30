# G1 — journal de provenance, lot ENTRY-MAIN-LINK-1 (garde réelle des cinq programmes hôtes du Dōjō ; G0 `docs/G0-lot-entry-main-link-1.md`)

- **Modèle résolu (R-1)** : `claude-sonnet-5-5` (Sonnet 5.5), effort `high`, palier de la mission. Mission `F:/tmp/dojo/mission-g1-entrylink.md`
  sha256 `3b45bb40dc84b1d64ee340bbc1b7367d0e42560f03729f8acda4e93383e4d0b7` recalculé et égal au reçu (2026-09-30 22:52 UTC).
- **Worktree** : `F:/Monark-wt-entrylink`, branche `lot/entry-main-link-1`, HEAD de départ `a75f7f5d` (base tronc `e984f49f`).
  Aucun git écrivant, aucun workflow (R-20).

## 1. Compte ascendant par fichier, établi AVANT tout code (insertions + suppressions, jamais une mesure)

Forme de chaque garde : 1 ligne de commentaire + la ligne `const isEntry` + la ligne `if (isEntry()) …` remplacent la ligne unique
actuelle (+3 / -1 = 4) ; les imports sont ajustés ligne par ligne (une ligne modifiée = +1 / -1 = 2 ; une ligne ajoutée = 1).

| Fichier | Modifications | Asc. |
|---|---|---|
| `apps/dojo/scripts/dojo-publish.mjs` | import `node:fs` + `realpathSync` (2) ; `pathToFileURL` -> `fileURLToPath` (2) ; garde (4) | 8 |
| `apps/dojo/scripts/dojo-eve.mjs` | import `node:fs` ajouté (1) ; `pathToFileURL` -> `fileURLToPath` (2) ; garde (4) | 7 |
| `apps/dojo/scripts/dojo-seed.mjs` | import `node:fs` + `realpathSync` (2) ; `fileURLToPath` seul (2) ; garde (4) | 8 |
| `apps/dojo/src/collect.ts` | import `node:fs` + `realpathSync` (2) ; `fileURLToPath` seul (2) ; garde (4) | 8 |
| `apps/dojo/src/history-collect.ts` | `realpathSync` déjà importé (0) ; `pathToFileURL` -> `fileURLToPath` (2) ; garde (4) | 6 |
| `test/dojo-entry-link.test.ts` (neuf) | en-tête, aides, 5 programmes x 2 tests, 10 lignes `// killer:` | ≈ 90 |
| `docs/G1-lot-entry-main-link-1.md` (neuf, ce journal) | journal | ≈ 120 |
| **Total** | code 37 ; test ≈ 90 ; journal ≈ 120 | **≈ 247** (plan du G0 : ≈ 110 hors journal ; borne R-25 1 150) |

## 2. Compte mesuré (insertions + suppressions ; `git diff --shortstat` du worktree, hors fichiers neufs)

Code : 24 insertions et 13 suppressions = 37, égal au compte ascendant du § 1 fichier par fichier (8, 7, 8, 8, 6). Test neuf : 62 lignes
(plan ≈ 90 : les aides sont plus courtes que prévu). Journal : ce fichier. Le calcul R-25 fait foi par l outil du tronc (REPONSE, § oracle).

## 3. Ce qui a été fait (et rien d autre)

- **Garde** des cinq programmes : commentaire d une ligne, `const isEntry = …` de `apps/dojo/scripts/dojo-verify.mjs` recopiée, puis
  `if (isEntry())` avec l appel existant inchangé. Imports : `realpathSync` de `node:fs` (publish, seed, collect ; ajouté pour eve ; déjà là
  pour history-collect), `fileURLToPath` de `node:url` ; `pathToFileURL` retiré des cinq fichiers (aucun autre usage : `grep` vide).
- **Écart de forme, typage seul** : `apps/dojo/src/collect.ts:275` et `apps/dojo/src/history-collect.ts:452` portent `process.argv[1] as string` au
  lieu de `process.argv[1]` : `npm run typecheck` refuse `realpathSync(string | undefined)` dans un fichier TypeScript (TS2769 aux deux lignes,
  mesuré sur le clone avant la correction). Le comportement est celui des `.mjs` (argv[1] absent : `realpathSync` lève, le `catch` rend faux).
- **Arguments d usage refusé** (mesurés, sans réseau, sans clé, rien d écrit) : aucun argument, pour les cinq. publish : sortie 1, stderr
  `dojo/publish: usage: --inbox …` ; eve : 2, `dojo/eve: usage: --empty --day <AAAA-MM-JJ>` ; seed : 2, `dojo/seed: usage: --init <new file>
  --horizon <n>` ; collect : 64, `dojo/collect: usage` ; history-collect : 64, `dojo/history-collect: usage`. Jamais `--help`. Aucune question Q-G1-n.
- **Test** `test/dojo-entry-link.test.ts` : 10 tests (5 par lien, 5 importés), chacun sous sa ligne `// killer:`. Lien de répertoire créé par
  le test (`symlinkSync(…, "junction")`) dans une racine temporaire neuve, retiré (`unlinkSync`, `rmdirSync`) après chaque lancement. Import :
  `node --input-type=module -e "await import(<url>)"`, argv[1] absent puis illisible (chemin inexistant) : sortie 0, stdout et stderr vides.
  Aucune barre oblique inverse dans les fichiers créés (le saut de ligne attendu sur stderr est testé par `String.fromCharCode(10)`).
- **Killers** : test du lien : `realpathSync(process.argv[1])` -> `process.argv[1]` (le chemin du lien non résolu : M-EL7) ; test d import :
  `catch { return false; }` -> `catch { return true; }` (l import déclenche le `main`).

## 4. Preuves (chemins hors dépôt sous `F:/tmp/dojo/entrylink/`)

- **Tests existants des cinq programmes + le neuf**, sur le clone `clone-suite` (HEAD `a75f7f5d` + fichiers du lot) : `apps/dojo/test/dojo-collect`,
  `dojo-history-collect`, `dojo-publish`, `dojo-verify`, `test/dojo-collect-deploy`, `dojo-history-e2e`, `dojo-publish-e2e`,
  `rpc-guard-fetch-only-inside-client`, `dojo-entry-link` : 109 verts, 0 rouge (`suite-targets.txt`).
- **Portes statiques** sur le même clone : `typecheck`, `lint`, `lint:ratchet`, `lang:gate`, `export:check` : toutes sorties 0 (`gate-*.txt`).
- **F2P** (`node F:/Monark/scripts/red-proof.mjs --base e984f49f --gel F:/Monark-wt-entrylink --repo clone-base --out f2p --draw 3 --seed 2026`) :
  les cinq tests du lien sont F2P (rouges au tronc par assertion, verts au gel) ; 3 killers tirés, 3 tués. Les cinq tests d import sont
  « green at base » : **par construction** (la garde du tronc ne lance déjà rien à l import) ; ce sont des gardes de non-régression, jamais F2P ;
  l outil sort donc 1 (« REFUSED ») sur la règle « tout test jugé est F2P ». `f2p/RED-PROOF.json` sha256
  `29587f7d2b104aab7f0bc7ef0b9e9c3d24ed6707a8f1e11730290f3e800abaaa`. Les dix tests sont tués par leur killer (campagne 1, ci-dessous).
- **Mutants** (outil du tronc, sha256 `2606e7dae37f4d13764f3a7c5eca3a947885c871d9dc680632a912ad7e083b19`, `--lock-root F:/tmp`, `node_modules` du dossier de
  sortie) : tables `mutants-table.mjs` (sha256 `4375c29a5c00c82cfb9a5094f0cbb92b82e17c01b59f850154e96fc9e542ea9b`) et `mutants-table2.mjs` (sha256
  `640949bc1946b53bf778f83810c0ec5d428716cc28373b3ed4b07809505141af`, les mêmes quinze lignes plus `own`). M-EL1 à M-EL5 (motif fautif
  par programme, `pathToFileURL` par `process.getBuiltinModule("node:url")`), M-EL6-n (sans `try`), M-EL7-n (sans `realpathSync`) : 15 lignes.
  - **Campagne 1** (`mutants/RESULTS.json`, sha256 `1e76e290d75d80468601f3aabb870e69c07f1bf5f70b49bce40b9da03edd61be`,
    `--killers` + table 1) : **K1 à K10 : 10 tués
    sur 10, stricts** ; M-EL2, M-EL6-2, M-EL7-2 tués ; les 12 autres lignes « survit » au premier passage : le test neuf n importe aucun programme
    (il les lance), donc il n est pas un importateur direct et l outil ne le joue qu au REJEU des survivants, où les 12 sont « tue » (strict) : lecture de
    l outil, non un défaut du test.
  - **Campagne 4** (`mutants4/RESULTS.json`, sha256
    `62ecd0a325a4ee745b458749db11faa00eddd02d84309c45a8c4ba70c1b04964`) : la table 2 donne `own` (champ que l outil
    propage aux lignes de table : le premier passage joue le fichier neuf) : **15 tués sur 15, stricts**, exit 0, baseline verte (69).
  - Les campagnes 2 et 3 sont non concluantes et jetées : la 2 par mon propre `timeout 115` (SIGTERM, exit 143 en baseline), la 3 par une baseline rouge
    sur `dojo_collect_unit_runs_the_real_tick` (`test/dojo-collect-deploy.test.ts:312`, 4 GET de balise au lieu de 2), test qui
    n importe que `runCollect`, jamais
    l entrée ; vert 3 fois de suite seul sur le clone, vert dans les campagnes 1 et 4 : instabilité sous charge du tronc, mesurée, non causée par le lot
    (item à former par l orchestrateur s il la juge utile : TU-C sous charge).

## 5. Menaces et tuyaux du G0

TB-EL1 (lancé par un lien : rien, sortie 0) : fermé par les cinq tests du lien (F2P).
TB-EL2 (un import déclenche un `main`) : cinq tests d import, killers tués.
Tuyaux : entrée l unité ou l opérateur par `/opt/monark-dojo…`, sortie le `main` inchangé, état aucun,
test `test/dojo-entry-link.test.ts` (processus réels, sans LLM).
Hors périmètre : ENTRY-MAIN-LINK-2 (autres programmes du dépôt), non touché.

## 6. Fichiers livrés + sha256 (octets)

| Fichier | sha256 |
|---|---|
| `apps/dojo/scripts/dojo-publish.mjs` | `13a125357aa537a3817ef82056e99cd440215327f5c5caeac8b5fb7d102ed8a9` |
| `apps/dojo/scripts/dojo-eve.mjs` | `e4545cc5125307c8e7d450d7c6c72791b787933e203e580156ecab4394176572` |
| `apps/dojo/scripts/dojo-seed.mjs` | `5a211317345e597fa7a6922968b716a3f7ef39f0ef8c27c6f05bafaf4497ca61` |
| `apps/dojo/src/collect.ts` | `519e951f1dd606ba618e3e1c5a4d20fca815562a3ab7e6faabc32fe855d10d8f` |
| `apps/dojo/src/history-collect.ts` | `53445d2d5558916ea25a30128e14580033a195da98d517e2b4e2a6407763c17f` |
| `test/dojo-entry-link.test.ts` | `3531a0576600c65d365f28eb8eca9d4858a267d468946bb7fd6acf06197adf55` |
| `docs/G1-lot-entry-main-link-1.md` | ce journal (sha256 dans `DELIVERED.sha256`) |
