Modèle résolu : claude-opus-5-5[1m]

# G1 — lot NARABI-TXT-1 (pose de la phrase publique de l'instrument, go 4 investisseur 2026-09-27 05:3x UTC)

> **Provenance (CA-8).** Worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` conforme, R-1), contexte frais. Tronc `F:\Monark`,
> branche `lot/etude-suite`, HEAD `4045a12`, `git status --short` vide au départ (05:44:40Z). Mission `F:\tmp\narabi\mission-txt-1.md`.
> R-20 : aucun `git add/commit/push` dans le tronc ; git en lecture (`status`, `diff`, `show`, `log`, `rev-parse`) + un clone
> `--no-local` `F:\tmp\narabi\txt1-clone` (`checkout --detach 4045a12`, aucun `git add`). Aucun réseau. Rien sur C: (tests lancés avec
> `TMP`/`TEMP`/`TMPDIR` = `F:\tmp\narabi\txt1-tmp`). Heures lues à `date -u`. Advisor intégré consulté deux fois (avant écriture, avant clôture). Cache npm = `F:\cache\npm` (`npm config get cache`) : les journaux de débogage des `lang:gate` rouges restent sur F:.
pm` (`npm config get cache`) : les journaux de débogage des `lang:gate` rouges restent sur F:.

## 1. Texte posé (recopié par commande, jamais de mémoire)

`F:\tmp\narabi\txt1-edit.mjs` lit la ligne `export const INSTRUMENT_NOTE = "…";` d'`apps/sentinel/src/instrument-replay.ts:34`
(sha `8fdaf7de…6a7e`, inchangé), `JSON.parse` du littéral, écrit `txt1-logs/note.txt` puis insère la note sur **une ligne non repliée**
dans chaque README (`includes(note)` vrai dans les deux ; 60 mots). Identité avec le servi : la `note` de la copie locale publiée
`F:\tmp\narabi-l\instrument.json` (sha `34555940e8981cfa…e14e44` = sha servi journalisé au JOURNAL-PROVENANCE, 4045a12) est **égale
octet pour octet** à la constante (contrôle `d.note === note.txt` : vrai). Aucun appel réseau : le servi n'est pas relu ici.

## 2. Diff (`git diff --numstat`, base 4045a12)

```
1	0	README.md
5	0	apps/sentinel/README.md
```
Sha après : `README.md` `7018afc8…15f1` ; `apps/sentinel/README.md` `4dea6a1b…2664` (avant : `cdd2a13b…c425`, `796ba2b3…3b`).
0 CR (`grep -c $'\r'` = 0 sur le diff et les deux fichiers), `git diff --check` vert.

- `README.md` l.119 : sous-puce de la puce Narabi, après la phrase D8 (`state.json`, `timeline.jsonl`) :
  « `instrument.json` — <note> One snapshot, taken once, never refreshed by the daily job. »
- `apps/sentinel/README.md` « Served surface » : paragraphe « `instrument.json`, served at the same path, is not written by the job but
  by the separate `instrument-replay.ts` entry below: » / <note> / « One snapshot, taken once (ADR-M014 D4), never refreshed by the daily
  job. » — attribué à la CLI séparée pour que la phrase existante « It publishes a timeline and a running statistic only » (le job) reste
  vraie.
- `apps/sentinel/README.md` « Run it » : une ligne, forme du RUNBOOK §7 l.543 :
  `node apps/sentinel/src/instrument-replay.ts --gap <gap.jsonl> --timeline <timeline.jsonl> --out <file>  # --out outside public/`.

Mots ajoutés hors note : aucun de la liste fermée (ARL, guarantee, optimal, detection delay, proven), ni « detect/alarm/early/built »,
ni « I » ; les seuls motifs trouvés (`i` de « i.i.d. », `detect` de « e-detectors ») sont dans la note elle-même. Aucun chiffre, aucune
promesse.

### Déviations déclarées (datées 2026-09-27 05:4xZ)
- **DV-1** : dans `README.md` racine, « (ADR-M014 D4) » **non posé**. Motif mesuré : le README racine ne contient aucun identifiant `ADR-`
  (grep : 0) et `docs/**` n'est pas exporté ⇒ renvoi pendant dans le miroir public. La référence est posée dans `apps/sentinel/README.md`
  (qui cite déjà ADR-M012 D8 et ADR-M009). À valider par l'orchestrateur (Q-1).
- **DV-2** : la mission nomme `npm run gate:lang` ; le script du tronc est `npm run lang:gate` (package.json l.23) — c'est lui qui a tourné.
- **DV-3** : `--publish` n'est pas annoncé dans « Run it » (le chemin du RUNBOOK §7 est fichier temporaire hors `public/` puis `mv`).

## 3. Gates

| Gate | Où | Résultat |
|---|---|---|
| `npm run gate:vocab` | tronc | exit 0 — 320 fichiers, « no forbidden claim » (`txt1-logs/vocab.log`) |
| `npm run export:check` | tronc | exit 0 — 0 chemin interdit, 0 français non exempté, toutes portées (`export.log`) |
| `npm run lang:gate` | clone base 4045a12 / clone base + lot | **exit 1 / exit 1, 412 = 412 hits, delta 0** ; hits hors `.claude/` : 0 (`lang-clone-base.log`, `lang-clone-lot.log`) |
| Mutant vocab | clone | « guaranteed coverage » ajouté aux deux nouvelles lignes ⇒ exit 1, rouge sur `README.md:119` et `apps/sentinel/README.md:33` ; restauré (sha égaux), exit 0 (`mutant-vocab.log`) |

**lang:gate rouge préexistant, hors lot** : les 412 hits sont tous dans trois fichiers **suivis** `.claude/agents/{architecte,stratege,visionnaire}.md`
(132 + 134 + 146), introduits par `61e485a` (décision 239, KAIZEN). Dans le tronc, 83 hits de plus viennent du répertoire local non suivi
`.claude/worktrees/magical-proskuriakova-8790c9/` (495). Le lot n'ajoute aucun hit. Voir Q-2.

Tests (TAP conservés) :
- `tests-a.tap` (05:52:13 → 05:52:15Z) : `public-surfaces-honesty`, `cra-b`, `token-ca-pinned`, `no-cash-provider-name`,
  `site-build-fleet`, `public-text-deny`, `apps/sentinel/test/sentinel-instrument-replay` : **57 tests, 56 pass, 0 fail, 1 skip** (skip
  déclaré préexistant : `sentinel_instrument_out_win32_short_name`, pas de nom 8.3 sur ce volume).
- `tests-b.tap` (05:52:26 → 05:58:59Z) : `ci-gates` (dont `sentinel_readme_is_a_kept_export` et la portée `narabi_docs` sur README)
  et `export-public` : **35 tests, 35 pass, 0 fail**.
- Aucun `apps/sentinel/test/*readme*` dans le tronc. Aucune suite complète ; verrou `F:\tmp\oracle-lock` non pris (tenu par
  « G1 PR-2-1 2026-09-27T05:47:15Z », non touché).

## 4. R-25

Méthode `ci.yml:82` (pathspec, 20 éléments) / `:90` (ins+del), script `F:\tmp\narabi\l-corr-r25-g2.mjs` inchangé (sha
`16a8644337ab…41a0`), clone `F:\tmp\narabi\txt1-clone` (`--no-local`, base 4045a12, fichiers copiés sha égaux, aucun `git add`) :
`tracked 1 0 README.md` · `tracked 5 0 apps/sentinel/README.md` ⇒ **R-25 CODE = 6** ; `package-lock.json` absent du diff. Ce journal
(`docs/G1-lot-*.md`) est exclu du pathspec.

## 5. Questions à l'orchestrateur

- **Q-1 (DV-1)** : valider l'absence de « ADR-M014 D4 » dans le README racine (renvoi pendant dans le miroir), ou dicter la forme.
- **Q-2 (préexistant, hors lot)** : `lang:gate` est rouge à 4045a12 (412 hits dans `.claude/agents/*.md` suivis, `61e485a`). `ci.yml:122`
  lance `npm run lang:gate` : toute PR de `lot/etude-suite` vers `main` sera rouge tant que ces fichiers restent suivis en français.
  Options : exemption de chemin `.claude/**` dans `scripts/lang-exempt.json` par ADR (K-2 / ADR-M005 D3), ou retrait des trois
  fichiers de l'index — jamais une suppression du gate. Propriétaire : orchestrateur ; déclencheur : prochaine PR vers `main`.
- **Q-3 (Branchement)** : la sous-puce est posée **dans** la puce Narabi de la liste « **Built:** » ; Q-7 du G1 NARABI-L dit
  qu'`instrument.json` n'a aucun consommateur interne et ne doit jamais être déclaré `built`. Le texte ne dit pas « built », mais
  l'emplacement peut se lire ainsi. Garder, ou déplacer hors de la liste (p. ex. sous « Replay them yourself »).
- **Q-4 (registre)** : la table des surfaces servies du README racine (l.66 : `state.json` · `timeline.jsonl`, consommateurs) ne liste pas
  `instrument.json` — hors mission (« rien d'autre »). À trancher avec NARABI-SITE-INSTRUMENT-1 (cartographie de branchement).
- **Q-5 (procurement, demande de l'investisseur « pourquoi tu ne m'as pas demandé plus de procurement »)** : ce worker est hors ligne et ne
  peut former une demande conforme (identité bibliographique complète, DOI, pages vérifiés). Pistes **non vérifiées** pour la lecture sur
  place de l'orchestrateur, visant précisément le trou que la note déclare (CUSUM calibré par permutation sous échangeabilité, hors
  i.i.d. de Lorden et hors e-détecteurs de Shin, Ramdas et Rinaldo 2022) : (a) les martingales de test conformes pour la détection de
  changement (Vovk et coauteurs, COPA 2021, « conformal test martingales ») ; (b) la littérature du CUSUM non paramétrique à seuil
  calibré par permutation / rééchantillonnage ; (c) les suites de Shin, Ramdas et Rinaldo sur les e-détecteurs non paramétriques. Aucune
  n'entre dans un README avant lecture [lu] et décision : la phrase publique reste la note, rien de plus.
- **Q-6** : optionnels `--series`, `--perms`, `--seed` (défauts pré-enregistrés) non listés dans « Run it » (une ligne demandée).

## 6. Livrables

`F:\tmp\narabi\txt1-deliver\` : les deux README, `txt1.patch` (`git diff`), `note.txt`, `txt1-edit.mjs`, ce journal, logs et TAP,
`r25.txt`, `DELIVERED.sha256`.

- **Complément de l'orchestrateur (2026-09-27, `date -u` 06:03Z)** : ligne `instrument.json` ajoutée à la table des surfaces servies (`README.md` l.67, réponse à Q-4 : cohérence avec la puce l.120) ; portes rejouées sur le tronc : `gate:vocab` OK 320 fichiers, `export:check` OK, tests `site-build-fleet`, `public-surfaces-honesty`, `no-cash-provider-name`, `public-text-deny`, `ci-gates` verts (voir `F:	mp
arabi	xt1-*.log`). Q-1 (DV-1) approuvé ; Q-3 : placement gardé (la puce décrit une surface servie de Narabi, jamais le mot « built » ; le registre `fleet.ts` reste seul juge du statut) ; Q-6 : ligne d'exécution gardée telle quelle ; Q-2 (lang:gate rouge sur `.claude/agents/*` depuis `61e485a`) → item LANG-GATE-CLAUDE-AGENTS-1 ; Q-5 → NARABI-THEORY-1 (en cours).
