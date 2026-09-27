Modèle résolu : claude-opus-5-5[1m]

# G1 — mini-lot LANG-GATE-CLAUDE-1 (`lang:gate` ne balaye plus le dossier de session `.claude/`, 2026-09-27)

> **Provenance (CA-8).** Worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` conforme, R-1), contexte frais. Tronc `F:\Monark`,
> branche `lot/etude-suite`, HEAD de mission `bf3433c` (06:07:04Z). Mission `F:\tmp\narabi\mission-lang-gate-claude-1.md`. R-20 : aucun
> git écrivant (lecture seule : `status`, `diff`, `log`, `show`, `ls-files`). Aucun réseau. Rien sur C: (`TMP`=`TEMP`=`F:\tmp`,
> `os.tmpdir()` = `F:\tmp`). Heures lues à `date -u`. Advisor intégré consulté avant écriture ;
> la consultation de clôture a échoué (« temporarily overloaded », 06:1x Z) — indisponibilité consignée, non contournée.
>
> **État de départ annoncé, non touché** : `D .claude/agents/{architecte,stratege,visionnaire}.md` (indexés par l'orchestrateur) et
> ` M .gitignore` (+3 : `.claude/agents/` ignoré). **Mouvement concurrent observé** (06:12:59Z) : l'orchestrateur a committé pendant le
> lot — HEAD `f766b7f` ; `8e737ef` porte les trois suppressions `.claude/agents/*` ; `bf3433c..f766b7f` ne touche que
> `docs/CHANTIERS.md`, `docs/dojo/FAITS-probe-12-*.md` et ces trois suppressions — aucun fichier de ce lot. Les trois fichiers
> `.claude/agents/*.md` restent PRÉSENTS sur disque (non suivis, ignorés).

## 1. Fait (avant)
`node scripts/lang-gate.mjs` à 06:0x Z = **exit 1**, 495 hits (scope root, 6 fichiers) : 412 sous `.claude/agents/`, 83 sous
`.claude/worktrees/`, **0** ailleurs.

## 2. Changement
- `scripts/lang-gate.mjs` : `".claude"` ajouté à `SKIP_DIRS` (même liste que `node_modules`/`.git`) ; `skipDir` rend `false` pour un
  `.claude` dont `relDir !== ""` (forme de l'exception `docs` d'`apps/site`) ⇒ saut **racine seulement**, un `.claude` imbriqué reste
  gaté. Bloc d'en-tête daté « SESSION FOLDER (ADR-M004 D7, addendum 2026-09-27) ». `SKIP_DIRS` n'est partagé avec aucun autre
  scanner (vérifié : `no-secret-in-repo`, `bell-contact`, `honesty-lint` ont leur propre ensemble) ; `lang-gate.d.mts` inchangé
  (signature `skipDir` inchangée).
- `test/lang-gate-routing.test.ts` : test `lang_gate_skips_the_session_folder`. Choix du fichier : c'est le fichier dédié à
  `lang-gate.mjs` ; `test/ci-gates.test.ts` n'importe pas le module. Fixture française écrite en échappements `\u00XX` (le fichier de
  test est lui-même balayé, scope root). Oracle = CLI servie `lang-gate.mjs --dir <tmp> --json` sur un arbre temporaire portant le vrai
  `lang-exempt.json` : (1) `.claude/x/fr.md` ⇒ exit 0 et hors parcours ; (2) même texte en `notes/fr.md` ⇒ exit 1, seul fichier
  rapporté ; (3) en `apps/site/.claude/fr.md` ⇒ exit 1 ; plus l'arbre réel : aucun chemin `.claude/` parcouru.
- `docs/adr/ADR-M004-infrastructure-plateforme.md` : « Addendum D7 — 2026-09-27 » (fait, décision, mécanisme, tuyaux, test, mutants),
  inséré après l'Addendum LANG-GATE-CI, avant `### D8`.

## 3. Preuves (06:12Z)
| Contrôle | Résultat |
|---|---|
| `npm run lang:gate` (tronc, `.claude/agents/*.md` et `.claude/worktrees/` présents) | **exit 0**, 0 hit, 12 scopes GATED |
| `npm run gate:vocab` | exit 0 (320 fichiers) |
| `npm run export:check` | exit 0 (0 chemin interdit, 0 hit français) |
| `npx tsc --noEmit` | exit 0 (une erreur TS2345 de ma première écriture corrigée : `?? ""`) |
| `node --test` lang-gate-routing + ci-gates + site-docs | 57/57 verts |
| Mutant M1 : `.claude` retiré de `SKIP_DIRS` | test ROUGE (fail 1) ; `lang:gate` du tronc exit 1 |
| Mutant M2 : garde `relDir` retirée de `skipDir` | test ROUGE (fail 1) |
| Restauration | sha256 `lang-gate.mjs` = `45e4420f…abf1` avant et après mutants (byte-exact) |
| CR | 0 (diff et trois fichiers) ; `git diff --check` vert |

Non rejoué : `test/export-public.test.ts` (test 42 (e) lance `npm ci` = réseau, interdit par la mission) ; la suite complète
`npm test` non lancée (même motif pour les tests réseau).

## 4. Diff (`git diff --numstat HEAD`, 06:12Z)
```
3	0	.gitignore                                      (orchestrateur, pré-existant — pas ce lot)
22	0	docs/adr/ADR-M004-infrastructure-plateforme.md
13	3	scripts/lang-gate.mjs
53	1	test/lang-gate-routing.test.ts
```
R-25 (pathspec de `ci.yml:82`, base HEAD, arbre de travail) : CODE = 66+4 = **70** lignes pour ce lot (73 avec les 3 lignes
`.gitignore` de l'orchestrateur) ≤ 1205 ; CONTENT (`ci.yml:90`) = **0** ≤ 8000. ADR et ce journal exclus par `docs/**/*.md`.

## 5. `error_origin`
Lot `61e485a` (décision 239 : prompts d'agents projet français versés sous `.claude/agents/` sans rejouer `lang:gate`).
