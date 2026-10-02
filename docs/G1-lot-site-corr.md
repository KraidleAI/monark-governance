claude-opus-5-5

# G1 : lot SITE-CORR (corrections de la relecture G2 du lot SITE-PREP, partie 3 de la page snapshot du Dōjō : le site), 2026-10-01

## 0. Identité, mission, conduite

- Modèle résolu (R-1) : `claude-opus-5-5`, effort max, rôle corr (correcteur), instance fraîche. Heures par `date -u`.
- Mission `F:/tmp/dojo/mission-site-corr.md`, sha256 recalculé AVANT lecture (19:01:39Z) :
  `ff253e2ac72b9ca1c87c58f7eb543f955a6b109fed111f7ff8237650589bbffe`, égal au sceau donné. Règles insérées : `REGLES-MISSION.md`
  sha256 `6470002592fe9c18851c8f7c645d1a1ee963d83e8068cd6fbeb8ee94eabdd2ba` (recalculé, égal au champ de la mission).
- Worktree `F:/Monark-wt-site`, branche `lot/site-prep`, HEAD `494eaffde9282a9fb141c145b07f64bd971e095d`, `status --porcelain` vide à 19:17:57Z.
- Git : lectures seules sur le worktree et sur `F:/Monark`, avec `--no-optional-locks` ; git écrivant seulement dans mes clones
  `--no-local` sous `F:/tmp/dojo/sitecorr/` et dans les clones des outils du tronc. Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun
  `--write-tree` ; aucun commit, aucun workflow (R-20). TEMP, TMP, TMPDIR = `F:/tmp/dojo/sitecorr/tmp`. Aucun réseau ; rien sur C:.
- Verrou d'hôte relevé à 19:13:05Z : tenu par un oracle G1 d'un autre lot (pid 217024, vivant à 19:15:06Z, depuis 19:10:45Z) : aucune
  course pendant ce temps. C-V-4 à 19:15:06Z (`Get-CimInstance Win32_OperatingSystem`) : 15 527 Mo physiques, 32 300 Mo virtuels
  libres, 14 `node.exe`.

## 1. Entrées lues (en entier, dans l'ordre de la mission)

| Entrée | sha256 |
|---|---|
| `F:/tmp/dojo/g2-site3/RAPPORT.md` (relecture G2 de SITE-PREP, 300 l., sections 0 à 10) | `eb6871c4ed953173680e11d04daef272de012f7588ab7081b7555bf1ef93befc` |
| `docs/G1-lot-site-prep.md` (295 l.) | `1cf21d874c916d9ce8328ff5d97c6141a42fc019aa849665e7f0f9278c825f28` |
| `apps/site/lib/dojo-served.ts` (223 l.) | `955dda56699878ca07c078676769c98718663da5f6b15daec00cd536c5372347` |
| `apps/site/lib/dojo-copy.ts` (112 l.) | `32d95972d15b5cff9dfd8fe7c80483488269cd60d1b0673e8cd62776965ec411` |
| `apps/site/components/dojo/dojo-table.tsx` (126 l.) | `6941323625bd2693a6243dd70d41c955ee1afad3bc4f949ad7bef1f480907abf` |
| `apps/dojo/scripts/dojo-core.mjs` (492 l.) | `34075c6f28cad10cd10a58178cf34871fe74ca49e9c5f5b8c4f0094c305632f5` |
| `apps/dojo/scripts/dojo-verify.mjs` (375 l.) | `e52271facf7a1be754dfdd5cdb0a644a6644a14113d70f77e461ccbf5f5eaa23` |
| `apps/dojo/scripts/dojo-verify-cli.mjs` (105 l.) | `be9f71056b5b952240698e875fe5fd7278dc8bd67d358f3c1485fe6468ca3dcb` |
| `scripts/assert-fleet-html.mjs` (770 l.) | `32fc6f3b766f5d2e2efa672a15784b48e85ff9fa86f6a7b3a39ea191053075e1` |
| `apps/site/COMPONENTS-PROVENANCE.md` (180 l.) | `c13901709c4d4b4a8c033a0a3e9e8886b1f08c48e158bce0761e622231519423` |
| `test/dojo-table.test.ts` (325 l.) | `97fbac3d08c4501a94d92efd9765ad40758bb0236d69c88a78a5012c41f6ab34` |
| `test/dojo-render.test.ts` (234 l.) | `a93aac4c84c672c94ee9a65c569f0cce46d6887a53802033b0a9e741c75ba2a5` |
| `test/dojo-served.test.ts` (419 l.) | `24662ec14b9c238999f1f47390ee85953af1ad4057abd8248313c6870e8fade1` |
| `F:/Monark/scripts/red-proof.mjs` (268 l.) | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` |

Lus pour juger : `apps/site/lib/dojo-lookup.ts` (`f5b41ce6…916d`), `apps/site/lib/dojo-served-load.ts` (`89aa8ecc…9c98` ; l.32-46,
l.134-146, l.223, l.241-242 : `dust_threshold` de la tête = celui de la version en vigueur), `apps/site/lib/dojo-live.ts` (`294af057…7a28` ;
l.120-131, l.176-188 : `positive(l.dust_threshold)` à la relecture ; l.290-305), `apps/dojo/test/helpers/dojo-fixture.ts` (`2e9e04b7…7e1d`,
en entier), `test/dojo-page.test.ts` (`36afe461…1f2b`, en entier), `apps/site/app/dojo/page.tsx` l.15-22 (`03688ffe…71dc`),
`.github/workflows/ci.yml` l.40-100 (`0f401ae2…949a`), en-têtes de `F:/Monark/scripts/oracle/run.mjs` (`f22b9045…a41b`),
`r25.mjs` (`4d0544df…cf0`), `mutants/run.mjs` (`41cdf83f…1ac8`), et la liste des lignes `// killer:` qui visent les fichiers du lot.

## 2. Corrections, constat d'origine, traitement (décidé AVANT le code)

Faits lus sur pièce qui portent les décisions :
- La fixture E2 (tête seq 12, version 1) a trois lignes : A détenteur (valeur du jour 5 000 000), B détenteur (1 500 000) et P `program`
  (7 000 000), seuil de poussière 3 589 744 (sonde du G2). L'ancienne règle et la nouvelle masquent toutes deux {B} : tout test qui ne lit
  que la fixture brute est vert à la base. Les cas qui séparent les deux règles se font par des lignes éditées, liées par la relecture
  (`render(f.steps, new Map([[11, …]]))`, chemin `run(c9, tree)`), jamais par la construction du record (le vérificateur les refuserait).
- `red-proof` juge tout test dont une ligne du corps change : chacun doit être rouge à la base PAR ASSERTION. Une épingle de source seule
  (C-2) est verte à la base, donc refusée (« self-confirming ») : d'où le choix de C-2 ci-dessous.
- Lignes visées par des tueurs, à ne pas déplacer : `dojo-served.ts` :68 à :143, :187, :196, :198, :200, :201, :202, :211 ;
  `dojo-table.tsx` :66, :67, :71, :80, :90 ; `dojo-copy.ts` :75 ; `dojo-verify-cli.mjs` :32, :33, :37, :80, :89, :94, :103 ;
  `assert-fleet-html.mjs` :679 (réancré en :680, la ligne de N-1 la déplace d'une ligne).

1. **C-1, voie (a), étendue par N-3** (`dojo-served.ts`) : sous une version, une ligne (`holder` ou `program`) est masquée si et seulement si
   son `day_value` est un décimal connu strictement inférieur au seuil de la tête (`BigInt`) ; `day_value` contrôlé en forme (décimal ou
   `null`, comme `decOrNull` du vérificateur, `dojo-verify.mjs:100` et `:287`) dans tous les états, sinon « a line out of form » ; une ligne
   à `day_value` `null` reste listée ; sans version, rien n'est masqué. Le seuil est `h.dust_threshold` (celui de la version en vigueur :
   chargeur l.242, relecture l.287), contrôlé décimal par une fonction `dustOf` déclarée en fin de fichier (refus sinon). Éditions en place :
   l.189 (`dust`), l.194-195 (forme), l.198 (`listed`) ; la forme de `holder_counted` (l.196) est gardée telle quelle.
2. **Textes** (`dojo-copy.ts`) : `tableDust` et `tableNoVersion` disent « lines » au lieu de « holder lines », le reste inchangé ;
   `lookupDust` et la phrase `holders` intouchés (N-4 hors lot). Épingle de l'empreinte de la liste fermée (`dojo_page_lexicon_is_closed`)
   recalculée.
3. **C-2** : la recherche est sortie en fonction pure testée, `dojoTableLookupOf(typed, table)` de `lib/dojo-lookup.ts` (toutes les lignes
   liées, jamais `table.shown` ; `null` avant liaison) ; le composant l'appelle (l.43, et l'import l.16) ; tests : un test neuf de son
   comportement (une ligne masquée est trouvée) et l'épingle de source du composant comptée à 1 sur l'appel exact. Conséquence : l'import de
   type de `dojo-lookup.ts` gagne `DojoTable` (épingle de `dojo_lookup_sends_no_address` amendée : « types alone »).
4. **C-3** (`dojo-verify-cli.mjs` l.19-23, commentaire seul, cinq lignes gardées) : une GET par fichier, renvoyée une seule fois par
   `replayOf` ; le minuteur couvre les essais d'un fichier (même imprécision : « one timer per GET »).
5. **N-1** (`assert-fleet-html.mjs`) : `assertDojoBody` refuse `/[{][a-z_]+[}]/` dans le corpus de `<main>` (une ligne), cas rouge dans
   `dojo_page_renders_served_figures_only` ; tueur de la ligne, et tueur empilé du mutant G2-M6 (`page.tsx:19`) au-dessus de
   `dojo_render_page_passes_the_build_check`, pour mesurer que le survivant du G2 meurt.
6. **N-6** (`COMPONENTS-PROVENANCE.md` l.175 et l.178-180) : « the table of the lines », la règle corrigée et la recherche.
7. **Tests qui suivent** : `dojo_table_hides_dust_lines_under_a_version` (oracle de la nouvelle règle lu sur les octets servis, seuil lu
   sur la ligne de version de la chronologie ; cas RF-1, N-3 et seuil exact ; recherche par `dojoTableLookupOf`) ;
   `dojo_table_rows_are_the_verifier_lines` (aide `listedLine` à la nouvelle règle ; lignes données sans valeur du jour, rouge à la base) ;
   `dojo_table_refuses_a_file_it_cannot_bind` (valeurs hors forme acceptées par `BigInt` : nombre, « 05 », chaîne vide, booléen ; et sans
   version) ; `dojo_render_table_says_the_dust_rule` (oracle de la règle, une table où une ligne `program` est sous le seuil et un détenteur
   sans valeur du jour : rouge à la base).

## 3. Compte ascendant (estimé AVANT le code ; mesuré au gel ci-dessous ; porte `r25` de l'oracle au §7)

| Fichier | estimé (insertions + suppressions) |
|---|---|
| `apps/site/lib/dojo-served.ts` | 25 |
| `apps/site/lib/dojo-copy.ts` | 4 |
| `apps/site/lib/dojo-lookup.ts` | 8 |
| `apps/site/components/dojo/dojo-table.tsx` | 10 |
| `apps/dojo/scripts/dojo-verify-cli.mjs` | 10 |
| `scripts/assert-fleet-html.mjs` | 5 |
| `apps/site/COMPONENTS-PROVENANCE.md` | 9 |
| `test/dojo-table.test.ts` | 110 |
| `test/dojo-render.test.ts` | 25 |
| `test/dojo-page.test.ts` | 8 |
| total estimé | 214 (borne de la mission 1 150 ; le journal est hors compte, `:(exclude,glob)docs/**/*.md`) |

Mesuré au gel (`git diff --numstat 494eaffd`, arbre de travail, 19:34:00Z), insertions + suppressions : `dojo-served.ts` 15 + 10,
`dojo-copy.ts` 2 + 2, `dojo-lookup.ts` 7 + 1, `dojo-table.tsx` 5 + 5, `dojo-verify-cli.mjs` 5 + 5, `assert-fleet-html.mjs` 3 + 2,
`COMPONENTS-PROVENANCE.md` 5 + 4, `test/dojo-table.test.ts` 76 + 31, `test/dojo-render.test.ts` 26 + 12, `test/dojo-page.test.ts` 5 + 2 :
**149 + 74 = 223** au périmètre CI (aucun fichier neuf hors journal). Écart à l'estimé : `dojo-table.test.ts` 107 contre 110.

## 4. Correction, fichier, test, tueur (tous mesurés : `red-proof` §6, campagne de mutants §6)

- **C-1 et N-3** : `dojo-served.ts` l.189 (`dust = dustOf(h)`), l.194-195 (forme de `day_value`, nommé `m` comme dans le cœur et le
  vérificateur, pour tenir l.198 sous 160 caractères), l.198 (`listed: dust === null || m === null || BigInt(m) >= dust`), `dustOf`
  l.224-228 ; commentaires l.154-155 et l.179-182 (quatre lignes gardées). Tests :
  - `dojo_table_hides_dust_lines_under_a_version` : sept cas, les trois qui séparent les deux règles en tête (détenteur sans valeur du jour,
    listé ; `program` sous le seuil, masqué ; deux lignes au seuil exact, listées), oracle lu sur les octets servis et la ligne de version ;
    rouge à la base par « a holder line without a day value, listed: the lines listed » ; tueurs `:198` CONST `m === null || …` (K26, tiré
    par `red-proof`), `:198` CONST `program` (K25), `:198` ROR `>=` en `>` (K24), `:202` (K23) : tués ;
  - `dojo_table_rows_are_the_verifier_lines` : aide `listedLine` à la règle neuve ; lignes données à la table sans valeur du jour (rouge à la
    base : « ten first, then the two nines by address ») ; tueurs existants `:198` (K13, K14) tués ;
  - `dojo_table_refuses_a_file_it_cannot_bind` : `day_value` 5, « 05 », chaîne vide, `true` sous une version, « 05 » sans version (rouge à
    la base : « a day value out of form (5) ») ; tueur `:195` CONST (K18) tué ;
  - `dojo_render_table_says_the_dust_rule` : oracle de la règle ; table où la ligne `program` est sous le seuil et le détenteur sous le seuil
    lu sans valeur du jour (rouge à la base : « every line listed but the one under the threshold ») ; tueur `dojo-table.tsx:71` (K10) tué.
- **Textes** : `dojo-copy.ts` l.90 et l.93 ; `dojo_page_lexicon_is_closed`, empreinte `e08160ae004dc345f57cb628f4503bd634235e1c47381e4f8aca252b567f133b`
  (script `F:/tmp/dojo/sitecorr/tmp/texts-sha.mjs`, qui rend `5c11eb6a…63f5`, l'empreinte épinglée, sur les fichiers de la base) ; rouge à la
  base ; tueur `dojo-copy.ts:75` (K3) tué.
- **C-2** : `dojo-lookup.ts` l.6 (import de type) et l.44-48 (`dojoTableLookupOf`) ; `dojo-table.tsx` l.16 et l.43. Tests :
  `dojo_table_look_up_searches_every_line_bound` (neuf : chaque ligne liée trouvée, masquée ou non ; rouge à la base par « the module exports
  dojoTableLookupOf » ; tueur `dojo-lookup.ts:47` `table.bound` en `table.shown`, K27, tué) ; `dojo_lookup_never_echoes_the_input`
  (épingle de source : l'appel exact compté à 1, aucun `dojoLookupOf(` dans le composant ; rouge à la base ; tueur `dojo-table.tsx:43`, K21,
  tué) ; `dojo_lookup_sends_no_address` (import de types ; rouge à la base ; tueur `:80`, K22, tué). Les deux tests de la poussière cherchent
  aussi par `dojoTableLookupOf`.
- **C-3** : `dojo-verify-cli.mjs` l.19-23, commentaire seul, cinq lignes de 153 à 159 caractères ; lignes visées par des tueurs inchangées
  (relevé l.32, 33, 37, 80, 89, 94, 103 après l'édition).
- **N-1** : `assert-fleet-html.mjs` l.640 (le refus), l.596 et l.637 (commentaires) ; cas rouge dans `dojo_page_renders_served_figures_only`
  (rouge à la base : « Missing expected exception: E1: a sentence of the closed list with its {name} unfilled ») ; tueur `:640` SDL (K2)
  tué ; tueur réancré `:679` en `:680` (K1) tué ; mutant G2-M6 du G2 posé en tueur empilé (`page.tsx:19`, K5) : **tué** par
  `dojo_render_page_passes_the_build_check`, qui le laissait survivre.
- **N-6** : `COMPONENTS-PROVENANCE.md` l.175-181.

Review Focus : (1) ligne sans valeur du jour masquée : K26 et les tests rouges à la base ci-dessus ; (2) ligne `program` sous le seuil
listée : K25 ; ligne au seuil exact masquée : K24 ; (3) `day_value` hors forme accepté : K18 ; (4) recherche limitée aux lignes listées :
K27 et K21 ; (5) gabarit `{nom}` brut accepté : K2 et K5.

## 5. Courses ciblées et portes statiques (clone `F:/tmp/dojo/sitecorr/c1`, `--no-local`, HEAD `494eaffd` + les 11 fichiers copiés,
sha256 vérifiés : `expected-v2.sha256` 10 « OK » ; jonctions de `mk-nm.ps1` : 220 entrées, 11 `@monark`, 0 échec)

- `tsc --noEmit -p apps/site/tsconfig.json` : 0 (19:27:23Z) ; `tsc --noEmit` racine : 0 (19:28:30Z, après correction) ; `eslint` des
  fichiers `.ts` et `.tsx` du lot : 0 (19:28:19Z) après un rouge (`no-base-to-string`, deux oracles de test, §9) ; les deux `.mjs` sont hors
  du périmètre d'`eslint` par configuration. `gate:vocab`, `lang:gate`, `export:check`, `lint:ratchet` : 0 (19:32:42Z-19:32:47Z).
- `node --test` sur 20 fichiers (les 15 qui importent un module du lot, plus `dojo-entry-link`, `site-honesty`, `dojo-publish-e2e`,
  `dojo-history-e2e`, `dojo-chain`), test 42 écarté : **301 tests, 301 verts, 0 rouge** (19:28:48Z-19:29:08Z), `F:/tmp/dojo/sitecorr/logs/run1.tap`
  `a15985d6e3499650677318d122e834c05e70bbfe71a6f4f235f4d416e03085c7` ; `test/public-surfaces-honesty.test.ts` (lit la provenance) : 2 sur 2,
  `logs/run2.tap` `35cc4b1ab338c3c58cd29884b3a457faa5199b4510aaa4bcefb283ca2eb08243`.
- Garde d'octets (`tmp/guard.mjs`, lignes ajoutées et journal) : 248 lignes, 0 constat (aucune ligne de plus de 160 caractères, aucun octet
  de contrôle, aucune barre oblique inverse).

## 6. Preuve F2P et tueurs

- **`red-proof`** du tronc (`6579b550…ab36`), `--base 494eaffd --gel F:/Monark-wt-site --repo F:/Monark --draw 9 --seed 4280630826`
  (graine : 32 premiers bits du sha256 de la mission, `0xff253e2a`), 19:29:36Z-19:30:15Z, sortie 0 :
  `F:/tmp/dojo/sitecorr/rp1/RED-PROOF.json` `d536fc2860aa668d155001873722feb85fabe70f6df502a40c54b1c7a5431907` : `ok: true`, **9 jugés, 9 F2P**,
  11 inchangés, **9 tueurs tirés, 9 tués** ; `base.tap` `f2cb7bc5…b056` (chaque jugé rouge par l'assertion de sa correction, messages
  au §4), `gel.tap` `bc8ab880…71b5`.
- **Mutants** du tronc (`41cdf83f…1ac8`), `--repo F:/tmp/dojo/sitecorr/c1 --base 494eaffd --out F:/tmp/dojo/sitecorr/mut1 --killers
  --targets` (les 3 fichiers de test du lot) `--lock-root F:/tmp --min-free-mb 4096`, verrou relevé non tenu (`held` : null) et C-V-4
  (15 054 Mo physiques, 33 085 Mo virtuels) avant le lancement, 19:31:03Z-19:32:19Z, sortie 0 : base verte (123 tests), **27 tueurs sur 27
  tués**, 0 survivant, 0 non conclu, 0 ancre perdue ; `mut1/RESULTS.json` `c4ee10379bcb1e6dfe8fbd6289ede69d8bfac816dac9bf87aa95d5d028d30b4e`,
  `RESULTS.txt` `4f9891c81b95ab219997a8f4eeddd7241680080a0f5e6e7804c2e66aeb63f4b4`.

## 7. Oracle du tronc (rôle corr)

`node F:/Monark/scripts/oracle/run.mjs --role corr --tree F:/Monark-wt-site --base 494eaffd --key SITE-CORR` (outil `f22b9045…a41b`,
`r25.mjs` `4d0544df…cf0`), lancé à 19:33:43Z (verrou relevé libre ; C-V-4 à 19:33:39Z : 14 638 Mo physiques, 32 210 Mo virtuels libres,
6 `node.exe`), en arrière-plan ; pendant son verrou (19:34:49Z-19:42:14Z), ni course ni harnais de ma part (lectures, mesures git, journal).
Sortie **0**.
- Enregistrement : `F:/tmp/oracle-results/494eaffde9282a9fb141c145b07f64bd971e095d-06a8164ac78a7ac5-corr-20261001T193344Z-176384.json`, sha256
  `fea8bb7aa740bf213e9c8fb1479a0ca7aa038f0c5c84b57672571c6dc787a945` (copie octet à octet : `F:/tmp/dojo/sitecorr/oracle-corr-record.json`) ;
  arbre : tête `494eaffd`, `dirty` `06a8164ac78a7ac5b23a2594293bcdbf09d90d30841efb01b7aba7093165725c` (le même que celui que l'outil de mutants
  a relevé sur `c1` : la campagne et l'oracle jugent le même arbre), objet `d4cb4d7df2daec2d652e113df54c90bad86fafcf`, `static_only` false,
  `served_from` null (rejoué).
- Portes, toutes à 0 : épinglage des modèles, `r25`, `lang:gate`, `export:check`, `gate:vocab`, `typecheck`, `lint`, `lint:ratchet`,
  `test` (444 s).
- **R-25** (porte `r25`, `02-r25.log` `6a1332951ee1c88f83ebd65937d19125ef5813fe2bfec50a28dc4f5fc4c53ae7`) : 149 insertions, 74 suppressions,
  **223** (porte CI 1 205 ; borne de la mission 1 150), contenu 0 ; égal au compte du §3. Lot entier, SITE-PREP et ce tour (`c0c60617` à
  l'arbre), par les chemins et l'expression de `r25.mjs` (`F:/tmp/dojo/sitecorr/tmp/r25-wt.mjs`, `291298be…77cd1`, lecture de l'arbre de
  travail, 19:34:05Z) : 658 + 118 = **776**.
- **Tests** : **1 863, 1 859 verts, 0 rouge, 4 ignorés** (sauts connus, hors lot : deux SIGTERM réels sous win32, noms 8.3, artefacts
  absents) ; test 42 (`export_public_no_governance_no_french`) vert une seule fois, dans la suite (412 s) ; aucun fichier de test mort (aucun
  `0xC0000409`) ; `09-test.log` `349e49773843ea51a2787344be3d37c6a059f0a3bfa19322d874b2b882e739e6`. Un test de plus qu'à l'oracle du G2
  (1 862) : `dojo_table_look_up_searches_every_line_bound`. Résidus de TEMP relevés par l'oracle : 383, comme à l'oracle du G2.

## 8. Questions et choix (Q-n), chacun avec sa preuve

- **Q-1 (C-2, voie)** : (b) la recherche sortie en fonction pure testée, plutôt que (a) l'épingle de source seule. Preuve : `red-proof`
  refuse un test jugé vert à la base (« green at base: a self-confirming test », `red-proof.mjs` l.173) ; or le composant cherche déjà dans
  `table.bound` à la base (`dojo-table.tsx:43` à `494eaffd`) : une épingle seule y serait verte. La voie (b) donne un test de comportement
  (K27) et garde une épingle du câblage (K21). Coût : l'import de type de `dojo-lookup.ts` et deux épingles amendées. Avis : (a) garder.
- **Q-2 (forme de `day_value` dans tous les états)** : comme `decOrNull` du vérificateur sur toute ligne (`dojo-verify.mjs:287`), avec ou
  sans version ; les valeurs que `BigInt` lirait (nombre, « 05 », chaîne vide, booléen) sont refusées, et sans le contrôle elles seraient
  lues (K18 tué par ces cas). Avis : (a) garder.
- **Q-3 (`holder_counted`)** : sa forme reste contrôlée (l.196) ; la liste ne le lit plus. La table ne vérifie pas la cohérence
  `holder_counted` et `day_value` (rôle du vérificateur et de la liaison, `bindDojoLines` l.304 pour le compte) : une ligne signée incohérente
  est listée selon sa valeur du jour. Hors mission ; avis : (a) garder, sinon un item à former par l'orchestrateur.
- **Q-4 (source du seuil)** : `h.dust_threshold`, celui de la version en vigueur (chargeur l.242 ; relecture l.287, `positive()` l.183),
  contrôlé décimal par `dustOf` (sinon aucune ligne) ; l'oracle des tests le lit sur la ligne `price_version` de la chronologie servie,
  jamais par le module. Avis : (a).
- **Q-5 (C-3, libellé)** : cinq lignes de 153 à 159 caractères ; trois resserrements sans fait perdu (« so that » en « so », « (for the
  CLI) » en « (the CLI's detail) », la phrase F-7 en « which T-6 bounds ») ; « one timer per GET » devenu « one timer per file over its
  tries », même classe d'imprécision depuis `replayOf`. Avis : (a) ; l'autre voie est une sixième ligne et sept tueurs réancrés.
- **Q-6 (lignes éditées des tests)** : la fixture ne sépare pas les deux règles ; les cas séparants sont des lignes signées que la relecture
  lie (motif de `dojo_table_refuses_a_file_it_cannot_bind`), que le vérificateur refuserait (lots et lectures non recalculés) : c'est la
  table qui est jugée. Le test de rendu donne ses lignes à `dojoTableOf` sans liaison (épinglée par ailleurs). Avis : (a).
- **Q-7 (textes à valider)** : `tableDust`, `tableNoVersion` et la règle étendue aux lignes `program` (N-3) vont à la validation visuelle de
  l'investisseur ; `lookupDust` est inchangé et exact sous la règle neuve (une ligne trouvée et non listée a une valeur du jour sous le
  seuil) ; la phrase `holders` reste intouchée (N-4, item DOJO-COPY-HOLDERS-MISSING-DAY-1 du G2). Avis : (a).
- **Q-8 (R-25 du lot entier)** : 776 mesurés de `c0c60617` à l'arbre (§3, §7), sous la borne de 1 150 : une seule fusion. Avis : (a).
- **Q-9 (tueurs réancrés et empilés)** : `:679` en `:680` (K1) ; empilés : `:198` (trois) et `:202` au-dessus du test de la poussière,
  `:195` au-dessus de celui des refus, `dojo-table.tsx:43` au-dessus de l'épingle, `page.tsx:19` (G2-M6) au-dessus du test de rendu de la
  page (une ligne `// killer:` changée ne rend pas un test jugé, `red-proof.mjs` l.124) ; tous tués par l'outil de mutants, qui lit chaque
  ligne `// killer:` ; `red-proof` ne tire que la plus proche de chaque test. Avis : (a).

## 9. Écarts de conduite (`error_origin` : ce correcteur) ; dettes

- La première réécriture du commentaire de `dojoTableOf` remplaçait quatre lignes par cinq : vue à la relecture, avant toute course,
  ramenée à quatre ; les lignes visées relevées à leur place (l.187 à l.211) avant toute course.
- `dojo-served.ts:198` à 161 caractères avec le nom `dv` : renommé `m`. C-3 : premières versions à six lignes ou à 162 caractères,
  enroulées par `F:/tmp/dojo/sitecorr/tmp/wrap.mjs` (non livré).
- `eslint` rouge une fois (deux `no-base-to-string` dans mes oracles de test) : rétréci par `typeof … === "string"`, avant `red-proof`.
- Une commande Bash portait des échappements `$` précédés d'une barre inverse sur la ligne de commande de `powershell.exe` (ni fichier, ni
  heredoc) ; les suivantes en guillemets simples. Une recherche des barres inverses par `grep` a échoué au transport : remplacée par
  `F:/tmp/dojo/sitecorr/tmp/guard.mjs`, écrit sans barre inverse.
- Verrou d'un autre oracle (pid 217024) tenu de 19:10:45Z jusqu'avant 19:25:38Z : pendant ce temps, lectures et éditions seulement ; la
  première exécution (`node tmp/texts-sha.mjs`) à 19:25:38Z, verrou relevé libre.
- Le journal est complété après le départ de l'oracle (19:33:43Z) : l'empreinte `dirty` de son enregistrement couvre le journal tel qu'il
  était alors ; aucun fichier de code ni de test n'a changé depuis (sha256 au §10).
- Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` ; aucun commit, aucun workflow (R-20) ; git écrivant seulement dans
  `F:/tmp/dojo/sitecorr/c1` (`clone --no-local`, `checkout --detach`) et dans les clones des outils du tronc.
- Dettes : aucune ouverte par ce tour. Restent chez l'orchestrateur, inchangés, les items du G2 (N-2, N-4, N-5, N-7, N-8, §8 de son rapport) ;
  Q-3 est une question, pas un dû.

## 10. État à la remise du premier gel (19:47Z ; dépassé par l'ajout du §12, dont l'état final et les empreintes finales font foi)

- Worktree `F:/Monark-wt-site` : HEAD `494eaffd`, 10 fichiers modifiés et 1 neuf (ce journal), rien d'autre (`status --porcelain`,
  19:47:54Z) ; rien commis, aucun workflow (R-20). Les 10 fichiers de code et de test ont, à 19:47:54Z, les sha256 relevés au départ de
  l'oracle (`F:/tmp/dojo/sitecorr/frozen-at-oracle.sha256`, 10 « OK ») : ce sont ceux que `red-proof`, les mutants et l'oracle ont jugés.
- `F:/Monark` : lu seulement ; HEAD `3b0f3109` à 19:48:04Z (`27e0b63e` au début de la session : trois commits d'un autre acteur entre
  19:10:40Z et 19:36:37Z, aucun sous `scripts/`), `status` vide ; outils du tronc aux sha256 de la mission à 19:48:04Z.
- Jonctions retirées par `rm-nm.ps1` (`b51b5d22…8749`) de `c1` et de `mut1/clone` (« removed », 19:47:47Z) ; ensuite aucun `node_modules`
  sous `F:/tmp/dojo/sitecorr/` ; `F:/Monark/node_modules` : 220 entrées et 11 `@monark` avant (19:26:39Z) et après (19:47:47Z). Les clones
  restent, sans `node_modules` ; les dossiers de travail de `red-proof` et de l'oracle ont été retirés par les outils.
- Empreintes des fichiers livrés :
  - `apps/dojo/scripts/dojo-verify-cli.mjs` `73195ecdb8691b61ed047cad6dc45cdbac68868b3d541d01b1d2dd15029c038a`
  - `apps/site/COMPONENTS-PROVENANCE.md` `263fd82326b7c4112f3dc9b42b72b5dd08555090c3fe424b3aca324efdaff640`
  - `apps/site/components/dojo/dojo-table.tsx` `3a030e39cfd881a710f4c20b776cef97919d719d88594796ee4608506e2fbf3c`
  - `apps/site/lib/dojo-copy.ts` `6909bcf4a10795197d596578dd002eeb67a81bb03cbbd2a52d20f92436392d35`
  - `apps/site/lib/dojo-lookup.ts` `fbefa5e3ebfcc05d21ca4ba4affdb1ba6d0b399c287e3469a5b184351fa2af47`
  - `apps/site/lib/dojo-served.ts` `f89691d4f598c3f201b0eaee3b1c05384356d619c013ed55a82ba894bbc21a5c`
  - `scripts/assert-fleet-html.mjs` `59a72bc9e66005a0e3a58b047e965e6ab6b484c9de7dea9b3f4356e21c30f1d9`
  - `test/dojo-page.test.ts` `ee53ff49d670d29c65d0141eb24ce05d8734196f93dcc5b0252864efe0b68b7d`
  - `test/dojo-render.test.ts` `acdbee0e5ca26aa7042480f4fbacb122a4aa203525632dd23ee5fee88e587da2`
  - `test/dojo-table.test.ts` `a26296d84d6d1461732b547a9b0bbaf3cbc2bee3a8e012b43feb170fe7ef33df`
- Livrables hors dépôt : `F:/tmp/dojo/sitecorr-deliver/REPONSE.md` et `DELIVERED.sha256` (écrit en dernier) ; preuves sous
  `F:/tmp/dojo/sitecorr/` (`logs/`, `rp1/`, `mut1/`, `tmp/`, `oracle-corr-record.json`, `expected-v1.sha256`, `expected-v2.sha256`,
  `frozen-at-oracle.sha256`).

## 11. Synthèse du premier gel (correction, fichier, test, R-25, portes, Q-n ; numéros de tueurs de la campagne `mut1` ; finale au §12)

Correction : fichier ; tests rouges à la base par assertion et verts au gel ; tueurs tués.
- C-1 et N-3 : `dojo-served.ts` l.189, l.194-195, l.198, l.224-228 ; `dojo_table_hides_dust_lines_under_a_version`,
  `dojo_table_rows_are_the_verifier_lines`, `dojo_table_refuses_a_file_it_cannot_bind`, `dojo_render_table_says_the_dust_rule` ;
  K26, K25, K24, K23, K18, K13, K14, K10.
- Textes : `dojo-copy.ts` l.90, l.93 ; `dojo_page_lexicon_is_closed` ; K3.
- C-2 : `dojo-lookup.ts` l.6, l.44-48, `dojo-table.tsx` l.16, l.43 ; `dojo_table_look_up_searches_every_line_bound`,
  `dojo_lookup_never_echoes_the_input`, `dojo_lookup_sends_no_address` ; K27, K21, K22.
- C-3 : `dojo-verify-cli.mjs` l.19-23 ; commentaire seul, aucune ligne exécutable, aucun test ; aucun tueur.
- N-1 : `assert-fleet-html.mjs` l.640 (et l.596, l.637) ; `dojo_page_renders_served_figures_only`, et le mutant G2-M6 tué par
  `dojo_render_page_passes_the_build_check` ; K2, K5, K1.
- N-6 : `COMPONENTS-PROVENANCE.md` l.175-181 ; document, aucun test ; aucun tueur.

- R-25 : **223** pour ce tour (porte `r25` de l'oracle) ; **776** pour le lot entier (`c0c60617` à l'arbre) ; borne 1 150.
- Portes : oracle corr sortie 0, neuf portes à 0 (`typecheck`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`, `gate:vocab`, `r25`,
  épinglage des modèles, `test`) ; 1 863 tests, 0 rouge. `red-proof` : 9 jugés, 9 F2P, 9 tueurs tirés et tués. Mutants : 27 sur 27 tués.
- Q-1 à Q-9 (§8) : avis (a) partout ; à l'orchestrateur, Q-3 (cohérence `holder_counted` et `day_value`, hors mission) et Q-7 (textes et
  extension aux lignes `program`, à la validation visuelle de l'investisseur).
- Verdict de ce correcteur : **LIVRE**. Conduite attendue en aval, hors de ce tour : C-1 touche des lignes exécutables, donc relecture G2
  ciblée (REGLES-MISSION, ligne datée du 2026-09-30 03:1x) ; validation visuelle des textes par l'investisseur (Q-7).

## 12. Ajout daté (orchestrateur, message reçu vers 20:00Z, lu à 20:02:04Z) : DOJO-COPY-DURATIONS-DERIVED-1, déclencheur atteint

Fait nouveau de l'investisseur, mot pour mot : « corrige. la migration c est aprés 90 jours. pas 180 » ; la chronologie réelle porte une
seconde ligne d'ancre (`tier_windows` 30, 30, 30, 30, 90). Décision de l'orchestrateur : la durée de Migration devient une figure `{…}`
rendue depuis `tier_windows[4]` de l'ancre en vigueur, par le même chemin que TXT-5 ; trois tests rouges à la base ; empreintes suivies.

Faits lus sur pièce avant le code (20:02Z-20:10Z) :
- Construction : `buildDojoServed` prend la dernière ancre avant la tête (`dojo-served-load.ts:205`) : vérifié.
- Relecture : le marcheur de `dojo-live.ts` tient l'ancre en vigueur (`st.anchor`, l.208, l.262) mais ne s'en sert que pour `k_reads`
  (l.287) ; les figures d'ancre de la vue relue viennent de l'ancre committée (`dojoLiveViewOf`, `shownOf({ ...committed, head: o.head })`,
  `dojo-served.ts:143`). Une ligne d'ancre publiée APRÈS la tête committée ferait donc montrer, après relecture, les fenêtres de l'ancre
  committée ; c'est déjà le cas de `validation_days`. Hors de la décision : item formé au §12, Q-10.
- La phrase `tier` n'est montrée qu'en E2 (`dojoBodyOf`) : la figure est portée par E2 seulement ; `dojoLiveViewOf` remplit toute phrase du
  corps (l.144), la page la rend par `DojoSentence` (`dojo-live.tsx:47`).
- Le marcheur accepte une ancre neuve en toute position (`dojo-chain.mjs:107-111`) ; le vérificateur ne refuse une ancre que sur un jour
  déjà publié : une chronologie à seconde ancre en ligne 2 (même graine, même jour) se construit sans toucher la fixture (vérifié par test).
- Épingles qui suivent : `dojo-live-surface.test.ts:113` (figures E2 écrites à la main, typées), `dojo-page.test.ts:55` (`valuesOf`),
  `dojo-served.test.ts:79` (oracle `expected`).

Plan (avant le code) :
- `dojo-copy.ts` l.41 : « at least {migration_days} days » (aucun chiffre).
- `dojo-served.ts` : E2 porte `migration_days` (l.49, en place) lu par `migrationOf(data)` (fin de fichier, comme `windowOf`) ; les champs
  propres à E2 passent dans une interface déclarée en fin de fichier (l.23 tenait 157 caractères) ; commentaires l.7 et l.38 en place.
- `assert-fleet-html.mjs` (`dojoExpected`) : figure `migration_days` composée à part depuis `data.timeline.anchor.tier_windows[4]`, en E2,
  source « timeline.anchor » ; une ligne de plus (tueur `:680` réancré en `:681`).
- Tests : `dojo_render_page_passes_the_build_check` (la page E2 nomme `tier_windows[4]` de l'ancre de la fixture ; aucun corpus servi ne porte
  « one hundred and eighty » ; une chronologie à seconde ancre en ligne 2, Migration à 90, donne un record dont l'ancre est la ligne 2, une
  page à 90 qui passe, et la page à 180 refusée contre elle) ; `dojo_live_renders_through_the_same_figures` (la vue relue E2 porte la fenêtre
  de l'ancre committée) ; `dojo_page_lexicon_is_closed` (empreinte ; aucun texte de la liste fermée ne porte le littéral) ; aides `valuesOf`
  et `expected` (ancre en vigueur). Fixture inchangée.
- Compte estimé : `dojo-copy.ts` 2, `dojo-served.ts` 16, `assert-fleet-html.mjs` 5, `test/dojo-render.test.ts` 20, `test/dojo-page.test.ts`
  8, `test/dojo-served.test.ts` 4, `test/dojo-live-surface.test.ts` 5 : environ 60 de plus (tour environ 283, lot environ 836).

Fait au code (20:07Z-20:09Z), lignes visées par des tueurs relevées à leur place ensuite (`grep -F` : chaque texte une fois sur sa ligne) :
- `dojo-copy.ts` l.41 : « held for at least {migration_days} days » ; `dojo-served.ts` l.7 et l.38 (commentaires), l.23 (E2 =
  `DojoVersionedFigures`, interface l.235-236), l.49 (`migration_days: migrationOf(data)`), `migrationOf` l.229-234 (fin de fichier) ;
  `assert-fleet-html.mjs` l.677-679 (`dojoExpected` : `migration_days` lu sur `data.timeline.anchor.tier_windows[4]`, en E2, source
  « timeline.anchor ») ; le tueur `:680` réancré en `:681`.
- Tests (fixture inchangée : la chronologie à seconde ancre est composée dans le test à partir de ses aides exportées) :
  - `dojo_render_page_passes_the_build_check` : la page E2 nomme `tier_windows[4]` de l'ancre de la fixture (180) ; aucune page E1, E2, EA ne
    porte « one hundred and eighty » ; chronologie à seconde ligne d'ancre (ligne 2, Migration à 90) : le record prend l'ancre de la ligne 2,
    la page dit 90 et passe le contrôle, la page à 180 est refusée contre elle. Rouge à la base : « E2: the anchor's Migration window, 180
    days, in E2 alone; no duration typed in words ». Tueurs : `dojo-copy.ts:41` (le littéral remis, K19, tiré par `red-proof`),
    `dojo-served.ts:49` (K18), `assert-fleet-html.mjs:678` (K17) : tués ;
  - `dojo_live_renders_through_the_same_figures` : la vue relue E2 porte la fenêtre de Migration de l'ancre committée (rouge à la base :
    « the anchor's Migration window, after the reread under a version ») ; figures E2 écrites à la main complétées ; tueur `dojo-served.ts:232`
    (K2, tiré, tué) ;
  - `dojo_page_lexicon_is_closed` : aucun texte de la liste fermée ne porte le littéral (rouge à la base : « no duration of the closed list is
    typed in words ») ; empreinte `e52373eef751a9b84ed4bb0eb9e9b7724dc28f0eaf43c7c3b284c628bb978a29` (le script rend toujours `5c11eb6a…63f5`
    sur la base) ;
  - aides : `valuesOf` (`dojo-page.test.ts`, E2 porte `migration_days`) ; `expected` (`dojo-served.test.ts` : l'ancre en vigueur, dernière
    ligne d'ancre avant la tête, et `migration_days` en E2 ; ce test n'est pas jugé, son corps est inchangé ; il est rouge à la base).
- Courses sur `c1` (13 fichiers copiés, `expected-v3.sha256` 13 « OK », jonctions refaites : 220 entrées, 11 `@monark`, 0 échec) :
  `tsc` du site 0, `tsc` racine 0, `eslint` 0 (20:10:01Z-20:10:16Z) ; 21 fichiers de test, **303 tests, 303 verts** (20:10:30Z-20:10:51Z),
  `logs/run3.tap` `28cdc751ba160d5cbe45fc936493826a22ae1ae6ad4ccee44e2f80129319f54b`.
- **`red-proof`**, même forme et même graine, `--out F:/tmp/dojo/sitecorr/rp2 --draw 11`, 20:11:01Z-20:11:52Z, sortie 0 :
  `F:/tmp/dojo/sitecorr/rp2/RED-PROOF.json` `e9fdedaac08e5112a1eb52a708b865565c7a9463bce5f25267fade8763a3bccf` : `ok: true`, **11 jugés, 11 F2P**,
  25 inchangés, **11 tueurs tirés, 11 tués** ; `base.tap` `9d344151…b0da`, `gel.tap` `9b7a5ade…e4ef`.
- **Mutants**, `--out F:/tmp/dojo/sitecorr/mut2 --killers --targets` (les 5 fichiers de test changés), verrou non tenu (`held` : null),
  C-V-4 (14 252 Mo physiques, 31 773 Mo virtuels), 20:12:24Z-20:13:53Z, sortie 0 : base verte (156), **45 tueurs sur 45 tués**, 0 survivant,
  0 non conclu, 0 ancre perdue ; `mut2/RESULTS.json` `abde5b20bfb19240df3f99611dc1ab2728ae409d3177546634ddccc1fd1cf585`, `RESULTS.txt`
  `d550f915…45d8`, `dirty` `d2b564729fcbd47e39dd2c1d52e271e729bc5555c5913fde52e3dfe23f23406c`.
- **R-25** (chemins et expression de `r25.mjs`, arbre de travail, 20:14:45Z) : tour **194 + 86 = 280** (12 fichiers), lot entier
  (`c0c60617` à l'arbre) **696 + 123 = 819** ; contenu 0. Par fichier (numstat contre `494eaffd`) : `dojo-served.ts` 27 + 14, `dojo-copy.ts`
  3 + 3, `assert-fleet-html.mjs` 6 + 4, `test/dojo-render.test.ts` 44 + 13, `test/dojo-page.test.ts` 8 + 3, `test/dojo-served.test.ts` 3 + 2,
  `test/dojo-live-surface.test.ts` 5 + 1 ; les autres comme au §3.
- **Q-10 (item formé, DOJO-LIVE-ANCHOR-FIGURES-1)** : après une relecture qui traverse une ligne d'ancre publiée après la tête committée, la
  vue montre les figures de la tête relue avec les fenêtres (`validation_days`, `migration_days`) de l'ancre committée (`dojo-served.ts:143`),
  quand la construction et le marcheur de la relecture prennent l'ancre en vigueur. Déjà vrai de `validation_days` avant ce tour ;
  inatteignable aujourd'hui (la seconde ancre de la chronologie réelle, ligne 2, précède la tête committée). Construction : (a)
  `rereadDojoHead` rend un repli quand une ligne d'ancre suit la tête committée (une ligne, les figures committées, TXT-14c ; test : une
  chronologie servie à ancre neuve après la tête committée) ; ou (b) l'issue porte l'ancre en vigueur et la vue compose ses figures avec
  elle. Propriétaire : orchestrateur ; déclencheur : avant toute ligne d'ancre publiée après la tête du record committé, et au plus tard à la
  relecture G2 ciblée de ce lot.
- **Oracle du tronc** : `node F:/Monark/scripts/oracle/run.mjs --role corr --tree F:/Monark-wt-site --base 494eaffd --key SITE-CORR-2`,
  lancé à 20:14:40Z (verrou libre ; C-V-4 à 20:14:33Z : 15 537 Mo physiques, 33 487 Mo virtuels, 4 `node.exe`), en arrière-plan ; ni course
  ni harnais de ma part pendant son verrou (mesures git et journal seulement) ; sortie **0** à 20:23:08Z. Enregistrement
  `F:/tmp/oracle-results/494eaffde9282a9fb141c145b07f64bd971e095d-d2b564729fcbd47e-corr-20261001T201440Z-107144.json`, sha256
  `ab83170280dc156705831c9341f497d2ce6bcf08969fd76feb1ef0fd39f1bc4c` (copie : `F:/tmp/dojo/sitecorr/oracle-corr2-record.json`) ; `label`
  `SITE-CORR-2` (le champ `key` est l'empreinte des parts déclarées, égale à celle du premier oracle) ; arbre `dirty` `d2b56472…406c` (celui
  de `mut2`), objet `9f27bc70ceb468b24d7e6a187b4ebba4ae6ce3ef`, `served_from` null. Portes à 0 : épinglage des modèles, `r25`, `lang:gate`,
  `export:check`, `gate:vocab`, `typecheck`, `lint`, `lint:ratchet`, `test` (433 s). **R-25** (`02-r25.log` `79f1c4a3…87e0`) : 194 + 86 =
  **280** (porte 1 205), contenu 0, égal à la mesure ci-dessus. **Tests** : **1 863, 1 859 verts, 0 rouge, 4 ignorés** (les mêmes sauts
  connus) ; test 42 vert une seule fois, dans la suite (402 s) ; aucun fichier mort ; `09-test.log` `10180e17…d432`.
- **État final** (20:24:15Z) : worktree HEAD `494eaffd`, 12 fichiers modifiés et ce journal, rien d'autre ; les 12 fichiers de code et de
  test ont les sha256 relevés au départ de l'oracle 2 (`frozen-at-oracle2.sha256`, 12 « OK ») : ceux que `red-proof` (rp2), les mutants
  (mut2) et l'oracle 2 ont jugés. Jonctions de `c1` et de `mut2/clone` retirées (« removed », 20:24:06Z), aucun `node_modules` sous
  `F:/tmp/dojo/sitecorr/` ; `F:/Monark/node_modules` : 220 entrées, 11 `@monark`. `F:/Monark` lu seulement : HEAD `2b09aef3` (commit de
  l'orchestrateur à 20:01:24Z, ETAT « Migration à 90 jours »), `status` vide, outils du tronc aux sha256 de la mission. Aucun `GIT_DIR`,
  aucun `GIT_WORK_TREE`, aucun `--write-tree`, aucun commit, aucun workflow.
- **Empreintes finales** des fichiers livrés (celles du §10 sont celles du premier gel) :
  - `apps/dojo/scripts/dojo-verify-cli.mjs` `73195ecdb8691b61ed047cad6dc45cdbac68868b3d541d01b1d2dd15029c038a`
  - `apps/site/COMPONENTS-PROVENANCE.md` `263fd82326b7c4112f3dc9b42b72b5dd08555090c3fe424b3aca324efdaff640`
  - `apps/site/components/dojo/dojo-table.tsx` `3a030e39cfd881a710f4c20b776cef97919d719d88594796ee4608506e2fbf3c`
  - `apps/site/lib/dojo-copy.ts` `a4c9302ac29f77ea6972e09cede86c27334ee1764d5269cb455b19815fe2da76`
  - `apps/site/lib/dojo-lookup.ts` `fbefa5e3ebfcc05d21ca4ba4affdb1ba6d0b399c287e3469a5b184351fa2af47`
  - `apps/site/lib/dojo-served.ts` `2a266c65b16c184ebf0dc61870a786fd07ed49af82ec2f05bb7909d4ad1914f8`
  - `scripts/assert-fleet-html.mjs` `d2ec0e3eaefa42786173f05565a7180711007c893a764ad13d6cc963099d13fb`
  - `test/dojo-live-surface.test.ts` `f5c3f3c75c5b808b188f81459eb30fdab9abd18acc776d748fc6fef5e378bdd0`
  - `test/dojo-page.test.ts` `a98a60b582b963c6989ed9b78d6cf342b91e91f892232b27a1dfcdc51d08c7e3`
  - `test/dojo-render.test.ts` `115590f2e653898fc7aef06da112506873eb4f1057315dcc2a1692c4a60dd0b7`
  - `test/dojo-served.test.ts` `e9d672fa29e32c16eac26f31f1e5ed1f2eaf7e9837a04d290c86e94914e0f9bd`
  - `test/dojo-table.test.ts` `a26296d84d6d1461732b547a9b0bbaf3cbc2bee3a8e012b43feb170fe7ef33df`
- **Synthèse finale** (correction : fichier ; tests rouges à la base par assertion et verts au gel ; tueurs tués, numéros de `mut2`) :
  - C-1, N-3, textes, C-2, C-3, N-1, N-6 : comme au §11 (fichiers et tests inchangés par l'ajout, sauf les textes : empreinte nouvelle) ;
  - DOJO-COPY-DURATIONS-DERIVED-1 : `dojo-copy.ts` l.41, `dojo-served.ts` l.23, l.49, l.229-236, `assert-fleet-html.mjs` l.677-679 ;
    `dojo_render_page_passes_the_build_check`, `dojo_live_renders_through_the_same_figures`, `dojo_page_lexicon_is_closed` ; K19, K18, K17,
    K2 ; tueur réancré `:681` (K11) tué.
  - R-25 : tour **280** (porte `r25` de l'oracle 2) ; lot entier **819** ; borne 1 150. `red-proof` (rp2) : 11 jugés, 11 F2P, 11 tueurs
    tirés et tués. Mutants (mut2) : 45 sur 45. Oracle 2 : sortie 0, 1 863 tests, 0 rouge.
  - Q-1 à Q-10 : avis (a) ; à l'orchestrateur : Q-3, Q-7 (y compris la phrase `tier` désormais chiffrée) et Q-10 (item formé
    DOJO-LIVE-ANCHOR-FIGURES-1).
  - Verdict de ce correcteur : **LIVRE** ; en aval : relecture G2 ciblée sur l'ensemble (annoncée par l'orchestrateur) ; validation visuelle
    des textes par l'investisseur.
- Écarts de l'ajout (`error_origin` : ce correcteur) : le commentaire de `dojoExpected` écrit d'abord sur deux lignes (deux lignes de plus
  au lieu d'une), ramené à une avant toute course ; une ligne de test à 162 caractères, raccourcie avant toute course ; mon premier
  décompte des textes visés par les tueurs passait par `awk split`, qui lit le séparateur comme une expression (zéro trouvé à tort),
  refait par `grep -F` (une fois chacun) ; le journal est complété après le départ de l'oracle 2 (20:14:40Z), aucun fichier de code ni de
  test n'ayant changé depuis (12 « OK » à 20:24:15Z).

## 13. Second ajout daté (orchestrateur, message daté « vers 21:10 UTC », lu à 21:06:50Z à mon horloge) : C-1 de la G2 ciblée, voie (b)

Source : relecture G2 ciblée de `39a8d8ee`, APPROUVE-AVEC-CORRECTIONS, `F:/tmp/dojo/g2-sitecorr/RAPPORT.md` (sha256 recalculé à 21:06:50Z,
`8d5e82e4a63bfcbdd27e9bc8b2f6fecce2c2e51b53859b4617e4705c37888c36`, égal au sceau), lu en entier ; sonde P2
(`probe/p2-anchor-after-head.ts` `2dbc73be…712f`, sortie `7b2ff400…e122`) lue : record committé à la tête seq 12 (ancre seq 1, Migration
180), ancre seq 13 (sa propre chaîne de graines, le jour qui suit le dernier jour lu, Migration 90), instantané seq 14 ; construction :
ancre en vigueur seq 13, `migration_days` 90 ; relecture : issue `reread`, TXT-14a, `migration_days` 180 ; invariant rompu.
Décision (voie (b)) : l'issue de relecture porte l'ancre en vigueur (la dernière avant la tête relue) ; la vue compose `validation_days` et
`migration_days` avec elle ; aucun texte neuf ; éditions en place ; aucune ligne visée par un tueur ne bouge ; un test rouge à la base.
Worktree : HEAD `39a8d8ee` (commit de l'orchestrateur), `status` vide à 21:06:50Z ; travail par-dessus, aucun git écrivant.

Faits lus avant le code : l'issue est typée `dojo-live.ts:25` ; `project` la rend l.284-289, l'ancre en vigueur de la tête relue y est déjà
(`head.anchor`, l.262, l.287) ; des tueurs nomment 17 lignes de `dojo-live.ts` (35, 73, 91, 102, 222, 223, 231, 240, 249, 261, 276, 283,
288, 300, 301, 303, 324) : ni l.23-25 ni l.289 ; la vue compose à `dojo-served.ts:143` (tueur `CONST "head: o.head"`, chaîne gardée).

Plan : `dojo-live.ts` l.23 (commentaire), l.25 (`anchor: Line` dans l'issue `reread`), l.289 (`anchor: head.anchor`) ; `dojo-served.ts`
l.143 (`timeline: { ...committed.timeline, anchor: o.anchor }`) et l.134 (commentaire) ; test neuf `dojo_live_reread_takes_the_anchor_in_force`
dans `test/dojo-live-surface.test.ts` (chronologie de P2 : figures relues 90 et égales à celles de la construction du même arbre ; rouge à
`39a8d8ee`), tueur sur `dojo-served.ts:143`. Compte estimé : `dojo-live.ts` 6, `dojo-served.ts` 4, `test/dojo-live-surface.test.ts` 16 :
environ 26 de plus.

Fait (21:08Z-21:09Z), éditions en place, nombre de lignes inchangé (`dojo-live.ts` 325, `dojo-served.ts` 236), hunks d'une ligne :
- `dojo-live.ts` l.23 (commentaire), l.25 (l'issue `reread` porte `anchor: Line`), l.289 (`project` rend `anchor: head.anchor`, l'ancre en
  vigueur à la tête relue) ; aucune des 17 lignes visées par des tueurs n'a bougé ;
- `dojo-served.ts` l.143 : `shownOf({ ...committed, head: o.head, timeline: { ...committed.timeline, anchor: o.anchor } })` (la chaîne du
  tueur `CONST "head: o.head"` y est une fois) ; l.134 (commentaire). Aucun texte neuf.
- Test neuf `dojo_live_reread_takes_the_anchor_in_force` (`test/dojo-live-surface.test.ts`, après l'invariant ; import de la fixture complété
  de `ANCHOR_DAY`, `anchorBody`, `seedChain`, `snapshotBody`, exportés à la base ; fixture inchangée) : chronologie de P2 (ancre seq 13,
  Migration 90, sa propre chaîne de graines `seedChain("dojo-live-anchor-in-force", 40)`, le jour `ANCHOR_DAY + 10` ; instantané seq 14) ;
  record committé seq 12 (ancre seq 1, 180) ; la relecture rend TXT-14a et la tête seq 14 ; la construction du même arbre prend l'ancre
  seq 13 ; figures relues : Migration 90, validation 30, et `deepStrictEqual` à celles de la construction (l'invariant). Tueur
  `dojo-served.ts:143 CONST "anchor: o.anchor" -> "anchor: committed.timeline.anchor"`.
- Courses sur un clone neuf `F:/tmp/dojo/sitecorr/c2` (`--no-local`, `checkout --detach 39a8d8ee`, les 4 fichiers copiés,
  `expected-v4.sha256` 4 « OK », jonctions 220 entrées, 11 `@monark`, 0 échec) : `tsc` du site 0, `tsc` racine 0, `eslint` 0
  (21:10:11Z-21:10:28Z) ; 21 fichiers de test : **304 tests, 304 verts** (21:10:39Z-21:10:57Z), `logs/run4.tap`
  `b99366fa2dbd2d2b3338915ff54c3cf0c75d9cbcd92f27140a2e28bbd4764c8e`.
- **`red-proof`, base `39a8d8ee`** (le commit qui porte le défaut), `--out F:/tmp/dojo/sitecorr/rp3 --draw 1 --seed 4280630826`,
  21:11:07Z-21:11:27Z, sortie 0 : `rp3/RED-PROOF.json` `9c7ec3919b906225766512fbc2c0be9cf079a2ad8e49ad32d100fcc98a9c76c9` : `ok: true`,
  **1 jugé, 1 F2P**, 8 inchangés, **1 tueur tiré, tué** ; à la base, rouge par « the committed anchor's Migration window, then, after the
  reread, that of the anchor in force » : réel `["180", "180", "30"]` contre attendu `["180", "90", "30"]`, le défaut mesuré par P2.
- **`red-proof`, base `494eaffd`** (tout le tour), `--out F:/tmp/dojo/sitecorr/rp4 --draw 12`, 21:11:47Z-21:12:34Z, sortie 0 :
  `rp4/RED-PROOF.json` `e484e4492fa7c71d7e0e8dd8de134ebcdd52552ac32b972b18b010104a7fc1b4` : `ok: true`, **12 jugés, 12 F2P**, 25 inchangés,
  **12 tueurs tirés, 12 tués**.
- **Mutants** (`--repo F:/tmp/dojo/sitecorr/c2 --base 494eaffd --out F:/tmp/dojo/sitecorr/mut3 --killers`, les 5 fichiers de test du tour),
  `held` null et C-V-4 (14 778 Mo physiques, 30 991 Mo virtuels) avant, 21:12:50Z-21:14:18Z, sortie 0 : base verte (157), **46 tueurs sur
  46 tués** (K3, le tueur neuf, par le test neuf), 0 survivant, 0 non conclu, 0 ancre perdue ; `mut3/RESULTS.json`
  `c093c8199b2c509c9ef332f62226a3844768b6ff730dbe17913e81afb4744f76`, `RESULTS.txt` `cd096f10…5c21`, `dirty`
  `7acb6cfd4bf8d0987955157bc3c1409b5d43928f8dd3a2b99e4d59c4b20177fe`.
- **R-25** (chemins et expression de `r25.mjs`, arbre de travail, 21:14:40Z) : ce second ajout (`39a8d8ee` à l'arbre) **23 + 6 = 29**
  (3 fichiers) ; le tour SITE-CORR (`494eaffd` à l'arbre) **217 + 92 = 309** ; le lot entier (`c0c60617` à l'arbre) **719 + 129 = 848** ;
  contenu 0 ; borne 1 150.
- Q-10 : traité (voie (b)) ; DOJO-LIVE-ANCHOR-FIGURES-1 n'est plus un item. N-2 de la G2 ciblée (DOJO-COPY-TIER-WINDOWS-EQUAL-1) reste un
  item formé par la G2, hors de ce tour (décision de l'orchestrateur).
- **Oracle du tronc** : `node F:/Monark/scripts/oracle/run.mjs --role corr --tree F:/Monark-wt-site --base 494eaffd --key SITE-CORR-3`,
  lancé à 21:14:30Z (verrou libre ; C-V-4 : 14 473 Mo physiques, 30 729 Mo virtuels), en arrière-plan ; ni course ni harnais de ma part
  pendant son verrou ; sortie **0** à 21:22:48Z. Enregistrement
  `F:/tmp/oracle-results/39a8d8ee65c44ee4d46ee7201662fdb2534daa38-7acb6cfd4bf8d098-corr-20261001T211434Z-329476.json`, sha256
  `16ac95bff60207aa5bbf2c18f0baf8e797539475f1adaa233cc0200373568be4` (copie : `F:/tmp/dojo/sitecorr/oracle-corr3-record.json`) ; `label`
  `SITE-CORR-3` ; arbre : tête `39a8d8ee`, `dirty` `7acb6cfd…77fe` (celui de `mut3`), objet `9f3925d3d04ca5d5d775290361cab56447f5bc3b`,
  `served_from` null. Portes à 0 : épinglage des modèles, `r25`, `lang:gate`, `export:check`, `gate:vocab`, `typecheck`, `lint`,
  `lint:ratchet`, `test` (431 s). **R-25** (`02-r25.log` `7c1d895a…546d`) : 217 + 92 = **309** pour le tour SITE-CORR (porte 1 205),
  contenu 0, égal à la mesure ci-dessus. **Tests** : **1 864, 1 860 verts, 0 rouge, 4 ignorés** (les sauts connus ; un test de plus,
  `dojo_live_reread_takes_the_anchor_in_force`, vert) ; test 42 vert une seule fois, dans la suite (399 s) ; aucun fichier mort ;
  `09-test.log` `2aa95c12…fc9c`.
- **État final** (21:23:46Z) : worktree HEAD `39a8d8ee`, 3 fichiers de code et de test modifiés et ce journal, rien d'autre ; les 3 fichiers
  ont les sha256 relevés au départ de l'oracle 3 (`frozen-at-oracle3-code.sha256`, 3 « OK ») : ceux que `red-proof` (rp3, rp4), les mutants
  (mut3) et l'oracle 3 ont jugés. Jonctions de `c2` et de `mut3/clone` retirées (« removed », 21:23:39Z), aucun `node_modules` sous
  `F:/tmp/dojo/sitecorr/` ; `F:/Monark/node_modules` : 220 entrées, 11 `@monark`. `F:/Monark` lu seulement : HEAD `5ef6fd5c` (commit ETAT
  de 21:04:36Z, rien sous `scripts/`), `status` vide, outils du tronc aux sha256 de la mission. Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`,
  aucun `--write-tree`, aucun commit, aucun workflow.
- **Empreintes finales** des 13 fichiers du tour (`F:/tmp/dojo/sitecorr/final-files-v3.sha256` ; les 10 autres égaux au §12) :
  `apps/site/lib/dojo-live.ts` `6d3dbcfbdf2eb39721493afb8bacdaa123eb52f34f1fcbbcd30c0ca2a1ad6a33`, `apps/site/lib/dojo-served.ts`
  `b8921860d303da205cf19c33adb23a8689b632e32e5214316f483e188ceb5aeb`, `test/dojo-live-surface.test.ts`
  `459fc00d6bb1d559f6a4c312a7597efaa056496a4e55f0e7a3be1927178747a8`.
- **Synthèse finale** : C-1 de la G2 ciblée (voie (b)) : `dojo-live.ts` l.23, l.25, l.289, `dojo-served.ts` l.134, l.143 ;
  `dojo_live_reread_takes_the_anchor_in_force` ; tueur `dojo-served.ts:143` (`anchor: o.anchor`, K3 de `mut3`) tué. R-25 : ajout 29,
  tour 309, lot 848 ; borne 1 150. `red-proof` : rp3 1 sur 1 (base `39a8d8ee`), rp4 12 sur 12 (base `494eaffd`). Mutants : 46 sur 46.
  Oracle 3 : sortie 0, 1 864 tests, 0 rouge. Verdict de ce correcteur : **LIVRE** ; en aval : la relecture G2 ciblée de ce second ajout,
  la validation visuelle des textes par l'investisseur ; N-2 de la G2 (DOJO-COPY-TIER-WINDOWS-EQUAL-1) reste un item hors de ce tour.
- Écarts : aucun ; le journal est complété après le départ de l'oracle 3 (21:14:30Z), aucun fichier de code ni de test n'ayant changé
  depuis (3 « OK » à 21:23Z).

## 14. Troisième ajout daté (orchestrateur, message daté « vers 22:30 UTC », lu à 22:24:41Z à mon horloge) : C-1 de la G2 ciblée de `9abe3f0d`, tests seulement

Source : `F:/tmp/dojo/g2-sitecorr3/RAPPORT.md` (sha256 recalculé à 22:24:41Z, `45de99c8d65e6de569c4f196d85a457717d6b312edec92d7048e18fec230241f`,
égal au sceau), lu en entier : APPROUVE-AVEC-CORRECTIONS ; C-1 : mon test `dojo_live_reread_takes_the_anchor_in_force` ne change que
`tier_windows[4]`, trois mutants survivent (G2-M1 `dojo-served.ts:143`, validation de l'ancre committée ; G2-M2 `dojo-live.ts:287`, `k_reads`
de la tête committée ; G2-M4 `dojo-live.ts:264`, dernière ancre servie). Proposition lue : `proposal/stronger-test.txt`
(`6c220ba5649b01ae13bb98dd552802c489659fa06bf4de9b1608836a81a17c92`), son script d'insertion `tmp/insert.mjs` (`46faf8ea…1aff` : deux
imports complétés, puis le fragment ajouté en fin de fichier) et la table `g2-mutants.mjs` (`79ef04cf…1cd7`, G2-M1 à G2-M4).
Décision : intégrer ce test (cas S9 : ancre à `k_reads` 3, validation 25, Migration 90 ; cas S5 : la même ancre après le dernier
instantané), ses trois lignes `// killer:` ; aucune ligne de code produit ne change. Worktree : HEAD `9abe3f0d`, `status` vide à 22:24:41Z.

Plan : dans `test/dojo-live-surface.test.ts` seulement, les deux mêmes éditions d'import que `insert.mjs` (fixture : `betaOf`, `linesOf`,
`readsOf` ; cœur : `readInstants`), puis le fragment à la lettre en fin de fichier ; contrôle : le fichier obtenu égal octet pour octet à
celui que la G2 a mesuré dans son clone (`F:/tmp/dojo/g2-sitecorr3/c2/test/dojo-live-surface.test.ts`). Mon test de l'ajout précédent est
gardé (rien n'est retranché). Compte estimé : 25 + 2 = 27 (la mesure de la G2) ; lot 848 + 27 = 875.

Fait (22:25Z) : les deux éditions d'import de `insert.mjs` (Edit, chaîne exacte), puis le fragment ajouté par `cat` ; le fichier obtenu,
`test/dojo-live-surface.test.ts` `ddfa77f19eced52435bc07acb61f886aa32b66b1e2d8a00efa0086d024852274`, est **égal octet pour octet** (`cmp`) à
celui que la G2 a mesuré dans son clone `c2`. Diff contre `9abe3f0d` : 25 + 2 ; aucune ligne de code produit (diff vide sous `apps/` et
`scripts/`) ; textes des trois tueurs neufs une fois sur leur ligne (`dojo-served.ts:143`, `dojo-live.ts:264`, `dojo-live.ts:287`).
- Clone neuf `F:/tmp/dojo/sitecorr/c3` (`9abe3f0d`, les 2 fichiers copiés, `expected-v5.sha256` 2 « OK », jonctions 220, 11, 0 échec) :
  `tsc` racine 0, `eslint` du fichier 0 (22:26:11Z-22:26:24Z) ; 21 fichiers de test : **305 tests, 305 verts** (22:26:35Z-22:27:00Z),
  `logs/run5.tap` `57fde1ad50bf845283047520b88a07111cb7118f5e059883bf9e9d490dfbfe73`.
- **`red-proof`, base `39a8d8ee`** (à `9abe3f0d` le test plus fort est déjà vert), `--out F:/tmp/dojo/sitecorr/rp5 --draw 2 --seed 4280630826`,
  22:27:09Z-22:27:32Z, sortie 0 : `rp5/RED-PROOF.json` `e8072657cab61a5b6c93d199dfa2bf997264e543c769451cad4282a89658ae03` : `ok: true`,
  **2 jugés, 2 F2P**, 8 inchangés, **2 tueurs tirés (`dojo-served.ts:143`, `dojo-live.ts:287`), 2 tués** ; à la base, le test plus fort rougit
  sur « the three figures move » (réel `["3", "30", …]`, attendu `["3", "25", …]`).
- **Mutants**, `--repo F:/tmp/dojo/sitecorr/c3 --base 494eaffd --out F:/tmp/dojo/sitecorr/mut4 --table F:/tmp/dojo/g2-sitecorr3/g2-mutants.mjs
  --killers --file apps/site/lib/dojo-served.ts --targets` (les 5 fichiers de test du tour), `held` null et C-V-4 (14 002 Mo, 28 101 Mo
  virtuels) avant, 22:27:57Z-22:30:14Z, sortie 0 : base verte (158), **53 tués sur 53** : les 49 lignes `// killer:` (dont les trois neuves,
  K12 `:143`, K13 `:264`, K14 `:287`) et la table de la G2 : **G2-M1, G2-M2, G2-M4 tués** par `dojo_live_reread_takes_every_figure_of_the_anchor_in_force`,
  le témoin G2-M3 par les deux tests de l'ancre ; 0 survivant, 0 non conclu, 0 ancre perdue ; `mut4/RESULTS.json`
  `c74d88b62eb83eba331255afaba18353ed54490c3a3501460b444498b94fa054`, `RESULTS.txt` `eccf676a…2578`, `dirty`
  `ada144e16135d651d0ffeed49a921cfd8a40819f652b50921cf12a4ac3bbc140`.
- **R-25** (chemins et expression de `r25.mjs`, arbre de travail, 22:30:38Z) : ce troisième ajout (`9abe3f0d` à l'arbre) **25 + 2 = 27** ;
  le tour SITE-CORR (`494eaffd` à l'arbre) **241 + 93 = 334** ; le lot entier (`c0c60617` à l'arbre) **743 + 130 = 873** ; contenu 0 ;
  borne 1 150.
- **Oracle du tronc** : `node F:/Monark/scripts/oracle/run.mjs --role corr --tree F:/Monark-wt-site --base 494eaffd --key SITE-CORR-4`,
  lancé à 22:30:29Z (verrou libre ; C-V-4 : 14 102 Mo physiques, 28 813 Mo virtuels), en arrière-plan ; ni course ni harnais de ma part
  pendant son verrou ; sortie **0** à 22:39:05Z. Enregistrement
  `F:/tmp/oracle-results/9abe3f0dfaba14b1b9fbeb82f5f1e4a1b83340fa-ada144e16135d651-corr-20261001T223034Z-15148.json`, sha256
  `01904610cc53b4e613d63a13b3e189d7b830338bb1c6461b75a397df2e261ec4` (copie : `F:/tmp/dojo/sitecorr/oracle-corr4-record.json`) ; `label`
  `SITE-CORR-4` ; arbre : tête `9abe3f0d`, `dirty` `ada144e1…c140` (celui de `mut4`), objet `0a9e7696fc6770942b810ed7d2b92bc826c67aea`,
  `served_from` null. Portes à 0 : épinglage des modèles, `r25`, `lang:gate`, `export:check`, `gate:vocab`, `typecheck`, `lint`,
  `lint:ratchet`, `test` (443 s). **R-25** (`02-r25.log` `d69c833c…d8ef`) : 241 + 93 = **334** pour le tour SITE-CORR (porte 1 205), contenu
  0, égal à la mesure ci-dessus. **Tests** : **1 865, 1 861 verts, 0 rouge, 4 ignorés** (les sauts connus ; un test de plus,
  `dojo_live_reread_takes_every_figure_of_the_anchor_in_force`, vert) ; test 42 vert une seule fois, dans la suite (412 s) ; aucun fichier
  mort ; `09-test.log` `cb4ccdc0…e963`.
- **État final** (22:39:55Z) : worktree HEAD `9abe3f0d`, `test/dojo-live-surface.test.ts` et ce journal modifiés, rien d'autre ; le test a
  le sha256 relevé au départ de l'oracle 4 (`ddfa77f1…2274`, 1 « OK ») : celui que `red-proof` (rp5), les mutants (mut4) et l'oracle 4 ont
  jugé, et celui que la G2 a mesuré. Jonctions de `c3` et de `mut4/clone` retirées (« removed »), aucun `node_modules` sous
  `F:/tmp/dojo/sitecorr/` ; `F:/Monark/node_modules` : 220 entrées, 11 `@monark`. `F:/Monark` lu seulement : HEAD `657a7409` (commit ETAT de
  21:43:13Z, rien sous `scripts/`), `status` vide, outils du tronc aux sha256 de la mission. `F:/Monark-wt-page-v1` et `F:/PRODUITS/` jamais
  touchés. Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`, aucun commit, aucun workflow.
- **Empreintes finales** des 13 fichiers du tour : `F:/tmp/dojo/sitecorr/final-files-v4.sha256` ; seul `test/dojo-live-surface.test.ts`
  change depuis le §13 : `ddfa77f19eced52435bc07acb61f886aa32b66b1e2d8a00efa0086d024852274`.
- **Synthèse** : C-1 de la G2 ciblée de `9abe3f0d` (tests seulement) : `test/dojo-live-surface.test.ts` ;
  `dojo_live_reread_takes_every_figure_of_the_anchor_in_force` (S9 et S5) ; tueurs `dojo-served.ts:143`, `dojo-live.ts:264`, `dojo-live.ts:287`
  tués, G2-M1, G2-M2, G2-M4 tués. R-25 : ajout 27, tour 334, lot 873 ; borne 1 150. `red-proof` (rp5, base `39a8d8ee`) : 2 sur 2. Mutants
  (mut4) : 53 sur 53. Oracle 4 : sortie 0, 1 865 tests, 0 rouge. Verdict de ce correcteur : **LIVRE**. Aucune ligne exécutable touchée :
  selon la G2 (§6) et REGLES-MISSION (ligne datée 2026-09-30 03:1x), pas de nouvelle relecture G2 ciblée si le checkpoint-2 rejoue le delta.
- Écarts : aucun ; le journal est complété après le départ de l'oracle 4 (22:30:29Z), le test n'ayant pas changé depuis (1 « OK »).
