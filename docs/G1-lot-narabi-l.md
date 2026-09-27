claude-opus-5-5[1m]

# G1 — lot NARABI-L-1 : item (l) de l'ADR-M012 (rejeu post-J0 de l'instrument, `instrument.json` à digest séparé)

- **Modèle résolu (R-1, verbatim)** : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` ; effort `max`). Worker, contexte frais, 2026-09-26/27 UTC.
- **Mission** : `F:\tmp\narabi\mission-g1-narabi-l.md` (sha256 `304c07a3858935414f6b3b8e345beaa72ec3aa78020ab6b018ef755291aae32a`, lue intégralement).
- **Worktree** `F:\Monark-wt-narabi`, branche `lot/narabi-l`, **base = HEAD = `d974e819532e91da3bcd9443d1a85c76084e5c84`** (= `lot/etude-suite` au lancement, `git rev-parse` des deux) ; **`git status --short` initial VIDE** (annoncé, mesuré 22:59Z).
- Aucun commit, aucun `git add` dans le worktree (R-20) ; aucun réseau ; rien sur C: (`TEMP/TMP/TMPDIR=F:/tmp/narabi/tmp` pour tout node) ; **aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`** (§15).

## 0. Ce qui bloque la publication — à lire d'abord (action formée, pas un « dû »)

**`instrument.json` ne peut PAS être produit dans ce lot.** Les onze mois 2025-10-16 → J0−1 n'existent dans aucun fichier :
la série committée `fixtures/usde-calib-series.json` (sha `7c33027a…`, 701 fenêtres) s'arrête au **2025-10-15** (mesuré : dernière
fenêtre `2025-10-15`, 0 rupture de jour/bloc/supply sur 701) ; la timeline live commence à **J0 = 2026-09-17** (fixture
`narabi-timeline-2026-09-19.jsonl`, capture `apps/site/data/narabi-capture.json`) ; `grep -rl 2025-10-16` (md/ts/mjs/json) ne
trouve aucune donnée : 9 fichiers, tous des mentions (ADR-M012, ADR-M014, PLAN-m012, G2-lot-m012e, deux notes d'étude, PROVENANCE-usde,
`sentinel.test.ts:116` borne de fenêtrage, `usde-full-pull.mjs` borne exclue du tirage figé). Les tirer exige le réseau (interdit au worker). Livré : l'entrée CLI qui les consomme (`--gap`),
ses tests, et l'étape runbook §7 qui dit exactement comment les tirer. **Action formée Q-1 (§12), propriétaire orchestrateur, sous
go** : tirage des 11 mois par le moteur de la sentinelle sur un état SCRATCH (`MONARK_SENTINEL_J0=2025-10-15`, pool public sans
clé, `env -u` de toutes les clés Chainstack, dossier jamais sous `public/`, boucle jusqu'au rattrapage) ; seule durée mesurée : un
jour publié en 25,481 s (RUNBOOK « Sonde externe ») — le total (heures, ~337 jours par tranches de 180 s) est une **extrapolation**.
Précondition d'antériorité vérifiée en lecture seule : M014-a `9d67302` et M014-b `3846be5` sont sur `origin` (`git branch -r
--contains` : `origin/main`, `origin/lot/etude-suite`…).

## 1. Chronologie (UTC, horloge `date -u`)

- 22:59:36 instantané des invariants (38 fichiers, `F:\tmp\narabi\logs\invariants-before.sha256`) ; 23:00 clones `--no-local`
  `l-clone-base` et `l-clone` (HEAD `d974e81`, sans `alternates`) ; `mk-nm.ps1` : `entries: 220  monark: 10  fail: 0` sur chacun,
  `require.resolve('@monark/rpc-guard')` = `F:\tmp\narabi\l-clone-base\packages\rpc-guard\src\index.ts` / `…\l-clone\…`.
- 23:00:19 → 23:14:49 oracle AVANT (base) ; code + tests écrits entre-temps ; 23:19:25 → 23:20:04 harnais de mutants final (51) ;
  R-25 (méthodes B et A) ; 23:20:57 → oracle APRÈS (§9).
- Advisor intégré consulté deux fois (avant l'écriture ; avant la clôture) — §14.

## 2. Fichiers du lot (sha256 à l'état livré ; lignes `wc -l`)

| Fichier | État | sha256 | lignes |
|---|---|---|---|
| `apps/sentinel/src/instrument-replay.ts` | **nouveau** (entrée CLI) | `7d28db6ff155aa2f88cb4d8c1a52900ae17aa4f63044d1e3a11655deb63dd30f` | 250 |
| `apps/sentinel/test/sentinel-instrument-replay.test.ts` | **nouveau** (4 tests) | `08cae08f2045a75557f9b7d13c9ac3b8875a10c9ba244456fb8f6d4bab4c23f8` | 268 |
| `apps/sentinel/src/instrument.ts` | modifié (+12/−10 : 5 `export`, drapeau `publish`) | `dc0e9df819109f653bf7e219284aa2ba8aaa08efcedc6c75eb9c547431325a0b` | 312 |
| `docs/RUNBOOK-sentinel.md` | modifié (+56/−0 : §7) | `26da05c87ef8b8af0ca31767b8ebfe00c335c5aaf9322c21d4b6fbf382f2023d` | 604 |
| `docs/G1-lot-narabi-l.md` | nouveau (ce journal) | voir `DELIVERED.sha256` | — |

`instrument.ts` : `replayEntry`, `cusumDiagnostic`, `SeriesWindow`, `Series`, `factsOf` exportés (réutilisés, zéro duplication de la
statistique) ; `assertOutPathAllowed(out, publish = false)` : la garde « aucun segment `public` » est levée par `publish = true` seul
(item (h) clos le 2026-09-18) ; l'appel à un argument (`instrument.ts --out`, test `sentinel_edetector_out_guard`) est inchangé.
Aucun autre fichier : `run.ts`, `timeline.ts`, `flow.ts`, `windows.ts`, `rpc.ts`, `edetector.ts`, `deploy/*`, `package*.json`,
`apps/site/**`, `state.json`, la vitrine et les ADR sont byte-identiques (§10).

## 3. L'entrée CLI (contrat, tel que codé et testé)

`node apps/sentinel/src/instrument-replay.ts --gap <timeline.jsonl des 11 mois> --timeline <timeline.jsonl live> --out <fichier>
[--publish] [--series <json>] [--perms N] [--seed S]` — calquée sur `instrument.ts` (garde d'exécution `pathToFileURL`, FATAL ⇒
code 1), jamais importée par `run.ts`. Les gardes d'arguments (1-2) passent avant toute lecture ; les contrôles d'entrée (3-5)
avant l'unique écriture (`writeFileSync(a.out, …)`, unique par test statique) — un refus n'écrit rien (mutant M46) :
1. `--out`, `--timeline`, `--gap` obligatoires ; argument inconnu refusé ; `--perms` entier ≥ 1, `--seed` entier.
2. `--out` sous un dossier nommé exactement `public` (dont `apps/site/public/…` et `/var/lib/monark-sentinel/public/…`) refusé
   **sauf `--publish` explicite** ; `--out` de nom `state.json` ou `timeline.jsonl` refusé **même avec `--publish`** ; `--out` égal à
   une entrée refusé.
3. Chaque timeline : ligne non JSON ou fichier vide refusés ; `lineHashOf(ligne) === line_hash` ; C1 ; **le moteur (`attest`+`step`)
   replié depuis `GENESIS` reproduit chaque `line_hash` publié** (épingle du moteur, plus forte que la seule chaîne).
4. La timeline live s'ouvre sur l'**ancre J0 pré-enregistrée** (`prev_line_hash = GENESIS`, `line_hash = EDET_ANCHOR_LINE_HASH`
   `09beb656…`, ADR-M014).
5. Bloc = graine (dernière fenêtre de `--series`, par défaut la série committée ⇒ 2025-10-15) → gap (< J0) → jours live. Un jour du
   gap égal au jour de la graine, ou ≥ J0, doit porter les **mêmes faits** (deux lectures à la finalité concordent) puis est retiré.
   Puis contiguïté stricte : jour J+1, `from_block = to_block précédent + 1`, `supply_open = supply_close précédent` (invariants
   mesurés vrais sur les 701 fenêtres committées et sur la fixture live). C1 de chaque fenêtre du bloc (graine comprise).
6. Repli du bloc par le moteur officiel ; rejeux `c = q̂` et `ε = 0,01` (`replayEntry`, digests propres) ; CUSUM de Page
   (p₀ 0,125 / p₁ 0,25) courant sur les paires calmes et sur toutes les paires évaluables ; contrôle par permutation
   (`cusumDiagnostic`, mulberry32, graine 20260917, N = 1000 par défaut, p = (1 + dépassements)/(N + 1)).

**`instrument.json` — jeu de clés FERMÉ (testé dans l'ordre)** : `label` (= « instrument, not the official tracker », D6), `note`
(la phrase, §5), `params` (`alpha`, `B`, `q1`, `eps_instrument`, `cusum_p0`, `cusum_p1`, `perm_seed`, `perms`, `seed_day`,
`seed_series_sha256`, `j0`, `last_day`), `series` (par fenêtre : `day`, `pair_status`, `calm_pair`, `v`, `s`, `E_static`, `q_c`,
`q_eps`, `cusum_calm`, `cusum_all`), `replays`, `permutation` (`calm`, `all_evaluable`), `timeline_sha256`, `gap_sha256`,
`state_digest` (digest du `state.json` live recalculé du repli de la seule timeline live = son dernier `digest_T`), `digest`
(sha256 de `JSON.stringify` de toutes les clés précédentes, donc hors `digest` et `generated_at` : reproductible par tiers),
`generated_at`. `state.json` n'est jamais lu, jamais écrit.

**Déviations déclarées (D-n)** — D-1 : `--gap` obligatoire en plus de `--timeline` (la mission ne nomme que `--timeline` ; les 11
mois n'y sont pas ; optionnel, l'instrument couvrirait en silence les seuls jours live) ; D-2 : trois clés hors liste de la mission
— `note` (exigée par la mission elle-même, « portée par instrument.json (`note`) »), `replays` (digest propre de chaque rejeu, la
forme M012-c), `gap_sha256` (provenance des 11 mois) ; D-3 : la garde `public` couvre tout segment `public`, sur-ensemble de
« `apps/site/public/` » ; D-4 : la graine est la dernière fenêtre de `--series` (2025-10-15 en production), si bien que la première
paire du rejeu clôt le 2025-10-16 (convention « jour de la fenêtre de clôture », ADR-M014 D1/D6) ; J0 y est une **paire évaluable**
(son prédécesseur est le gap), contrairement à la ligne live — le rejeu recalcule, il ne recopie pas ; D-5 : un jour du gap
postérieur au dernier jour live n'a pas de jumeau et est retiré sans comparaison (la timeline live fixe la fin du bloc,
`params.last_day`).

## 4. Tuyaux (règle Branchement, F-1) — ligne proposée pour l'ADR-M012 (l), édition orchestrateur

Entrée : timeline du gap (tirage Q-1, format ligne de la sentinelle) + `timeline.jsonl` live servie + série committée (graine).
Sortie : `/narabi/instrument.json`, fichier statique servi par le `handle_path /narabi/*` existant. État : aucun (instantané jusqu'à
`params.last_day`, jamais rafraîchi par le job quotidien). Test de composition non-LLM : `sentinel-instrument-replay.test.ts`
(CLI en processus sur une entrée de forme réelle — les lignes live sont les octets servis capturés — plus une exécution
sous-processus). **Consommateur interne : aucun** (la page `/narabi` ne lit pas ce fichier) ⇒ rien à déclarer `built` ; la
lecture par le site = lot site distinct (Q-7).

## 5. Phrase publique proposée (note de `instrument.json` et proposition pour le README de `/narabi/`)

**Remplacée au pli (Q-G2-1) : voir « Corrections après G2 (pli) » en fin de journal ; le texte ci-dessous est celui du G1.**

> Instrument, not the official tracker: tracker replays at alternative parameters, and a one-sided CUSUM in Page's form, as
> analysed by Lorden (1971), on the static misses, assessed by a permutation test of exchangeability as Vovk (2012) defines it.
> A third way, outside Lorden's i.i.d. theory and the e-detectors of Shin, Ramdas and Rinaldo (2022); no bound is claimed.

- **58 mots** (`wc -w` et le test) ; anglais ; aucune citation verbatim (donc ≤ 25 mots trivialement). Constante
  `INSTRUMENT_NOTE`, texte extrait `F:\tmp\narabi\logs\note.txt` sha256 `6dd99c9c…a51c`.
- **Sources, fiches M012-h seules** : forme de Page présentée par Lorden → `fiche-lorden-1971.md` §« Procédure de Page »
  (p. 1897–1898) ; « Lorden's i.i.d. theory » → même fiche, Thm 1–3, preuve du Thm 2 invoquant l'i.i.d. (p. 1900) ; échangeabilité
  → `fiche-vovk-2012.md` Prop. 1 (p. 477, invariance par permutation) ; « outside … the e-detectors » → `fiche-shin-ramdas-rinaldo-2022.md`
  (0 occurrence de « permutation » ; README M012-h : « troisième voie »). Niveau : les trois papiers sont [lu] intégral dans les
  fiches (chercheur, 2026-09-18) ; ce worker a lu les fiches et le README M012-h, pas les PDF (non committés, droits) — la mission
  admet ces fiches comme seule source ; aucun chiffre tiré des papiers n'entre dans la phrase. **Hors fiches, déclaré** :
  « not the official tracker » et « no bound is claimed » décrivent notre système (ADR-M012 D6 ; aucune borne publiée dans le
  fichier), pas la littérature.
- **Aucun mot de la liste fermée** (ARL, guarantee, optimal, detection delay, proven), ni même leur négation ; `ARL` testé en mot
  (`/\bARL\b/i`, « early » ne rougit pas). **Propre sous TOUTES les portées de `vocab-banned.json`** (globale + packages_src,
  atelier, monark, site, harness, skills, narabi_docs, sentinel, bell — test 4, et `gate:vocab` 319 fichiers OK).
- **Non éditée dans le README** (texte public = action sortante go 4) : Q-4.

## 6. Étape runbook

`docs/RUNBOOK-sentinel.md` **§7 « After T >= 7 — publish the labelled instrument at `/narabi/instrument.json` »** : préconditions
(T ≥ 7 servi ; M014-a/b sur origin avant tout tirage ; go) ; (1) tirage du gap (commande exacte, boucle bornée à 150 passes ;
risque d'état d'archive non mesuré, arrêt persistant ⇒ STOP et décision) ;
(2) lecture des deux fichiers live dans la même minute ; (3) commande exacte du rejeu (défauts pré-enregistrés, sans `--publish`) ;
(4) contrôle du digest (recalcul, `state_digest` = `digest` du `state.json` servi et ≠ de lui) + sha256 local ; (5) dépôt atomique
(fichier temporaire hors `public/` sur le même système de fichiers, `chown sentinel`, `0644`, `mv`) ; (6) contrôle servi (200, sha
servi = local) ; journalisation ; rollback (`rm -f`) ; rafraîchissement sans nouveau tirage ; variante VPS déconseillée (nouveau
`sentinel_sha`). **Rien d'autre ne change** : ni code déployé, ni unité, ni Caddy, ni `state.json`/`timeline.jsonl`.
Conséquence **reportée, pas évitée** : la voie locale n'évite un changement de `sentinel_sha` que pour CETTE publication ; tout
redéploiement futur de l'arbre de la sentinelle depuis un SHA portant `instrument-replay.ts` changera `sentinel_sha` sur chaque
ligne quotidienne suivante (`sentinelSha` hache tous les `src/*.ts`, `run.ts:156-161` ; anticipé par ADR-M014, Conséquences).

## 7. Tests (nouveau fichier ; aucun test existant modifié — D-4 de la consigne)

| Test | Ce qu'il prouve |
|---|---|
| `sentinel_instrument_replay_matches_fixture` | Timeline courte : graine + 7 jours synthétiques (construits À REBOURS depuis l'ouverture réelle de J0 : blocs et supply contigus, C1 par fenêtre) + les 3 lignes live réelles. **Oracle recodé dans le test** (vitesse `burns·10¹²/S_open/10¹²/24`, score écrêté, `E_static`, récursion du tracker, CUSUM, mulberry32 + Fisher-Yates, digest du tracker, digest du document) : chaque ligne de `series`, les 2 rejeux (params, q final, T, digest), les 2 contrôles par permutation (statistique, n, ratés, dépassements, p), `state_digest` = dernier `digest_T` publié, digest recalculé, clés fermées, `params` exacts, sha des entrées, même digest au 2ᵉ passage, même série si le gap commence au lendemain de la graine ou déborde sur les jours live à faits égaux. La vitesse recodée égale le `v` **publié** des 3 lignes réelles. Non vacuité : ratés et succès, paires calmes et de stress (8 calmes / 10 évaluables ; p calme 15/201 = 0,0746… et toutes 3/201 = 0,0149… à N = 200 — valeurs du repli scratch, pas épinglées). |
| `sentinel_instrument_cli_is_fail_closed` | Sans `--out`/`--timeline`/`--gap`, argument inconnu, `--perms 0`, `--seed x`, `--out` sous `public/` et sous `apps/site/public/` sans `--publish` ⇒ refus nommé et **rien d'écrit** ; `--publish` lève la garde. 12 entrées cassées, chacune refusée avec son message et sans écriture : ligne tronquée, gap vide, champ modifié sans rehachage, champ modifié rehaché (moteur), C1 d'une ligne, live hors ancre J0, jour manquant, trou de bloc, rupture de supply, graine relue différente, recouvrement live différent, graine C1. Sous-processus réel : code 1, `instrument-replay FATAL` sur stderr. |
| `sentinel_instrument_never_touches_state_json` | Un `state.json` voisin et les trois entrées gardent octets ET `mtimeMs` après un passage réussi et après les refus ; `--out` = `state.json` / `public/state.json` / `public/timeline.jsonl` refusé même avec `--publish` ; `--out` = une entrée refusé ; une seule écriture dans le module (statique) ; `run.ts` n'importe pas l'instrument ; `digest ≠ state_digest`. |
| `sentinel_instrument_note_has_no_guarantee_words` | Liste fermée sur la note et le label ; la liste attrape chaque mot injecté ; « early » ne rougit pas ; ≤ 60 mots ; mentions obligatoires ; label D6 ; **A-10** : `note`/`label` ÉCRITS = constantes ; **A-9** : TOUTES les chaînes servies du fichier écrit (note, label, libellés de section, jours, hachages) passent la liste fermée et chaque portée de `vocab-banned.json`. |

Contrôles scratch (hors dépôt, données SYNTHÉTIQUES, jamais publiées) : (a) `scratch/show.ts` — repli en processus de 340 fenêtres
synthétiques, N = 1000 : 128 ms, 117 kB ; (b) `scratch/fullgap.ts` (sha `a9039841…b517`) — gap synthétique pleine longueur tendu
entre la VRAIE graine committée (2025-10-15) et la VRAIE ouverture de J0 (blocs et supply contigus, C1 par fenêtre), CLI en
**sous-processus sans `--series`** (défaut = série committée : `seed_series_sha256` `7c33027a…`), N = 1000 par défaut : code 0,
340 fenêtres 2025-10-15 → 2026-09-19, première paire (2025-10-16) et J0 évaluables, 108 kB. Premier essai de (b) : mes `mints`
synthétiques négatifs rendaient les paires `non_evaluable` (l'adaptateur les refuse ; le moteur les reproduit et la CLI les accepte
comme non évaluables) — défaut du générateur scratch, corrigé ; aucune donnée réelle n'a de `mints` négatifs.

## 8. Mutants (copie `F:\tmp\narabi\l-mutants\tree`, harnais `mutants.mjs` sha256 `40d94f1a44c5647055df3d4849854b461ec9ee29afd32b7da7816a816d897cc4`)

A-11 : `node --test --test-reporter=tap`, CRLF normalisé, tué SEULEMENT si le TAP porte `not ok N - <test visé>` ; D-1-bis :
mutation et restauration par fichier temporaire + `fsync` + `rename`, sha du golden RELU après fermeture (arrêt sinon) ; chaque
motif compté exactement 1 fois dans node (A-13). En-tête : 2026-09-26T23:19:25Z → 23:20:04Z, node v24.15.0, arbre `d974e81` +
fichiers du lot (sha §2). **51/51 tués par le test visé** ; restaurations = golden (`7d28db6f…`, `dc0e9df8…`) ; rouges collatéraux :
M05, M32, M46 (+ `never_touches`), M51 (+ `replay_matches`). Journal `run.log` sha256 `76348f7d…9d01`, `out/results.json`
`f660e0fa…2b31`, table `table.txt` `8536eccf…e720`, un TAP par mutant dans `out/` (51 empreintes : `tap.sha256`, sha
`85f0ed38…42f8`).

| # | Contrôle | Mutation | Tueur (premier message) |
|---|---|---|---|
| M01-M03 | `--out` / `--timeline` / `--gap` obligatoires | garde supprimée | fail_closed (regex du message requis) |
| M04 | garde `public` appliquée | `assertOutPathAllowed(a.out, true)` | fail_closed |
| M05 | `--publish` seule levée | `!publish &&` retiré (instrument.ts) | fail_closed |
| M06-M08 | argument inconnu, `--perms`, `--seed` | garde neutralisée | fail_closed (« Missing expected exception ») |
| M09 | `--out` jamais `state.json`/`timeline.jsonl` | garde neutralisée | never_touches |
| M10 | `--out` jamais une entrée | garde neutralisée | never_touches |
| M11 | ancre J0 | `if (false)` | fail_closed (« live not on the J0 anchor ») |
| M12 / M13 | `line_hash` recalculé / moteur reproduit | vérification supprimée | fail_closed (« field edited, hash kept » / « … recomputed ») |
| M14 / M15 | C1 d'une ligne publiée / d'une fenêtre du bloc | vérification supprimée | fail_closed |
| M16 / M17 | graine relue / recouvrement live concordants | comparaison supprimée | fail_closed |
| M18-M20 | contiguïté jour / bloc / supply | test neutralisé | fail_closed |
| M21 / M22 | fichier vide / ligne non JSON | garde supprimée | fail_closed |
| M23 / M24 | rejeu `c = q̂` / `ε = 0,01` | paramètre retiré | replay_matches (série `q_c` / `q_eps`) |
| M25 / M26 | incrément log(p₁/p₀) / filtre calme du CUSUM | inversé / retiré | replay_matches |
| M27 / M28 | p = (1+dépassements)/(N+1) / Fisher-Yates | `exceed/perms` / `rnd()*i` (instrument.ts) | replay_matches (« calm: permutation p ») |
| M29 | permutation calme sur les ratés calmes | `state.eStatic` | replay_matches (« calm: CUSUM ») |
| M30 | `state_digest` du repli live | repli du gap | replay_matches |
| M31 / M32 | digest hors `generated_at` / séparé | horodatage inclus / `= state_digest` | replay_matches |
| M33 / M34 / M35 | `timeline_sha256`, `seed_day`, `v` | mauvaise source | replay_matches |
| M36-M40 | liste fermée : ARL, guarantee, optimal, detection delay, proven | mot injecté dans la note | note (regex nommée) |
| M41 | ≤ 60 mots | 66 mots | note |
| M42 / M48 | portées vocab (sentinel/harness/site ; site seule) | « the gate adapts » / « compound » (57 mots) | note (« vocab scope site ») |
| M43 / M44 | note écrite = constante (A-10) / label D6 | `replace` à l'écriture / label tronqué | note |
| M45 | `state.json` jamais écrit | 2ᵉ écriture du digest dans `state.json` | never_touches (« unchanged by a successful run ») |
| M46 | rien d'écrit sur refus | fichier vide écrit en tête | fail_closed (« nothing written at … ») |
| M47 | code de sortie 1 | `exitCode = 0` | fail_closed (« the CLI exits 1 ») |
| M49-M51 | A-9 : libellés de section et de rejeu scannés | mot interdit injecté | note (M51 : aussi replay_matches) |

Premier passage (47 mutants) : M42 avait été tué par le compte de mots (61 mots) et non par le scan vocab visé — corrigé (M42 à
57 mots, M48 ajouté), le passage final ci-dessus fait foi.

## 9. R-25 et oracle

**R-25 = 540** lignes (cible ≤ 600, STOP 1 150, borne CI 1 205) — `package-lock.json` inchangé (non touché, hors pathspec).
- Méthode B (mission) : clone `F:\tmp\narabi\l-clone` (`git clone --no-local`, sans `alternates`), fichiers copiés (sha égaux, `sync.sh`),
  `node r25.mjs F:/tmp/narabi/l-clone d974e81… --intent-to-add <2 nouveaux>` (script sha256 `ad945944…8c26`, lit `ci.yml:82`,
  20 éléments de pathspec, métrique `ci.yml:90`) : `3 files changed, 530 insertions(+), 10 deletions(-)` ⇒ **540** (instrument-replay
  250, test 268, instrument.ts 12+/10−). `git add -N` dans ce clone seul.
- Méthode A (sans écriture, worktree) : `r25-methodA.mjs` (sha `23f86bf1…f7ac`) : suivis 22 + non suivis 250 + 268 = **540**, égal.
- Couture pré-déclarée si une correction G2 faisait passer au-delà de 600 : PR-a = `instrument.ts` + `instrument-replay.ts` + tests 1-2 ;
  PR-b = tests 3-4 + RUNBOOK. Non déclenchée.

**Oracle AVANT** (clone `l-clone-base`, 23:00:19 → 23:14:49Z, script `run-oracle.sh` sha `7cce6109…71be3`, `env -u` des 8 variables
payantes) : `gate:vocab` 0 (317 fichiers) · `typecheck` 0 · `test` **1 = 1 359 / 1 355 pass / 2 fail / 2 skip** · `lint` 0 ·
`lint:ratchet` 0 (69/69) · `lang:gate` 0 · `export:check` 0. Les 2 échecs sont sur la BASE, avant tout fichier du lot :
`export_public_no_governance_no_french` (sous-processus `npm run ci` de l'export tué à 600 s, `ETIMEDOUT`, après 764,9 s) et
`verify_harness_ca_liq_checks_red_on_overclaiming_surfaces` (vecteur `lambda-2b-cond` : `origin_403_mcp` + `mcp_tools_list` rouges en
plus du contrôle attendu). Fait : d'autres processus du worker tournaient pendant ce passage (tests du lot, clones, jonctions). La
cause n'est PAS qualifiée ici : elle l'est par les re-passages isolés du §9-bis (TAP conservés), jamais par supposition.

**Oracle APRÈS** : §9-bis.

## 9-bis. Oracle APRÈS, re-passages isolés, invariants finaux

**Oracle APRÈS** (clone `l-clone`, fichiers du lot copiés par `sync.sh`, sha égaux à §2 pour le code et les tests ; 23:20:57 →
23:33:51Z ; même script ; `env -u` des 8 variables payantes) : `gate:vocab` 0 (**319** fichiers = 317 + les 2 nouveaux) ·
`typecheck` 0 · `test` **1 = 1 363 / 1 360 pass / 1 fail / 2 skip** (= base 1 359 + les 4 du lot) · `lint` 0 · `lint:ratchet` 0
(**69/69**, inchangé) · `lang:gate` 0 · `export:check` 0. Verts dans la suite complète : les 4 tests du lot,
`sentinel_instrument_separate_digest`, `sentinel_edetector_out_guard` (appel à un argument inchangé), `fetch_only_inside_client`
(le nouveau fichier est dans sa portée), `narabi_first_reading_label_reads_committed_t` et `…_single_source_of_seven`, et
`verify_harness_ca_liq_checks_red_on_overclaiming_surfaces` (**vert ici, rouge sur la base**). Seul rouge :
`export_public_no_governance_no_french`, même mode que sur la base (`npm run ci` de l'export tué à 600 s, `ETIMEDOUT`, 713,5 s).
Journaux : `F:\tmp\narabi\oracle-base\test.log` sha256 `e4b85064…f1ed0`, `F:\tmp\narabi\oracle-after\test.log` `fa133c0a…2154`.
Fait déclaré : le test 42 lance `npm ci` dans l'export (comportement existant de la suite, non modifié ; pas de `--offline`) — accès
au registre npm possible, non mesuré ; ni RPC ni VPS.

**Re-passages isolés** (`iso-rerun.sh` sha `66a67be3…db50` : les deux tests rouges, SEULS, l'un après l'autre, aucun autre processus
du worker, `--test-reporter=tap`, `env -u`, TAP conservés) :
- **Arbre du lot** (`l-clone`, 23:34:15 → 23:42:30Z) : `verify-harness-liq.test.ts` **3/3 ok** (TAP sha `a0d115c1…10cc`) ;
  `export-public.test.ts` **3/3 ok**, dont `export_public_no_governance_no_french` (491,5 s pour le fichier ; TAP `e9b8adb3…a124`) —
  **le CI exporté, qui contient le nouveau fichier de test, est vert** quand il ne partage pas la machine avec la suite racine.
- **Arbre de base** (`l-clone-base`, 23:42:41 → 23:48:57Z) : `verify-harness-liq.test.ts` **3/3 ok** (TAP `c9a82985…d663`) ;
  `export-public.test.ts` **3/3 ok** (372,7 s ; TAP `1942471a…24e8`).
- **Conclusion mesurée** : les deux rouges apparaissent dans la suite racine complète (base : les deux ; lot : le seul test 42) et
  disparaissent seuls sur les DEUX arbres ⇒ ils ne sont pas causés par le lot. Le test 42 dépasse sa borne interne de 600 s
  (`export-public.test.ts`, `timeout: 600_000`) quand il tourne dans la suite racine sur ce poste (764,9 s base, 713,5 s lot) et passe
  seul (372,7 s / 491,5 s) ; `verify_harness_ca_liq…` a rougi une fois (base, suite complète) et passé trois fois (lot suite complète,
  lot seul, base seul). Point formé Q-11 (§12).

**RUNBOOK édité après le lancement de l'oracle APRÈS** (le clone porte la version `6f01da86…`, la livrée est `26da05c8…` : lignes
« ARCHIVE state » et `cd <tree>` ajoutées au §7). Sans effet sur l'oracle, mesuré : aucun test ni script ne lit
`RUNBOOK-sentinel.md` (`grep -rn RUNBOOK-sentinel test/*.ts apps/*/test/*.ts scripts/*.mjs` : 0 ; les autres occurrences de « RUNBOOK »
dans les tests sont des commentaires), il n'est dans aucune portée de `vocab-banned.json` (`narabi_docs` = `README.md`,
`fixtures/PROVENANCE-usde.md`, `docs/CLOTURE-lot-f2b-usde.md`), il n'est pas exporté (`docs/**`) et il est exclu de R-25
(`docs/**/*.md`). Code et tests livrés = ceux de l'oracle APRÈS et du harnais de mutants (sha §2).

## 10. Invariants byte-identiques (A-6)

Instantané avant (38 fichiers : `apps/sentinel/src/*.ts` et `src/ukemi/*.ts`, `package*.json`, `deploy/*`,
`apps/site/data/narabi-capture.json`, `apps/site/lib/narabi-live.ts`, ADR-M012, ADR-M014, RUNBOOK, `vocab-banned.json`, `ci.yml`,
la série committée, la fixture live) : `F:\tmp\narabi\logs\invariants-before.sha256` (sha `867e86ed…0cbd3`). Après, re-pris en
DERNIER (après toutes les éditions) : `invariants-after.sha256` (sha `6b6a67f2…d179`, 39 lignes = 38 + le nouveau
`instrument-replay.ts` que le motif `src/*.ts` attrape). `diff` : **exactement deux fichiers diffèrent**, `apps/sentinel/src/instrument.ts`
(`5418b0fb…3452` → `dc0e9df8…a0b`) et `docs/RUNBOOK-sentinel.md` (`68932f06…9064` → `26da05c8…023d`) ; les 36 autres sont
byte-identiques (`run.ts`, `timeline.ts`, `flow.ts`, `windows.ts`, `rpc.ts`, `keyless-transport.ts`, `edetector.ts`, `src/ukemi/*`,
`package-lock.json`, `package.json`, `deploy/*`, la capture et la lib du site, ADR-M012, ADR-M014, `vocab-banned.json`, `ci.yml`, la
série committée, la fixture live).

## 11. Pilule du site (CHANTIERS:702, C-3) — état, sans modification de `apps/site`

- Code : `apps/site/lib/narabi-live.ts:522-528` `firstReadingLabel` — `t < SERIES_MIN_STEPS` ⇒ « built · step t of 7 before first
  reading », sinon « built · N windows published », N = `lines.length`.
- Tests aux bornes : **présents** dans `test/narabi-live.test.ts` — `narabi_first_reading_label_reads_committed_t` (t = 1, t = 6,
  t = 7, t = 7 avec 9 lignes, t = 8) et `narabi_first_reading_label_single_source_of_seven` ; **verts** sur la base (lignes 1789-1790
  du journal de l'oracle AVANT) et après (§9-bis).
- État servi : la capture committée (`narabi-capture.json`, 2026-09-24) porte **t = 6** et 7 lignes ⇒ le premier rendu serveur dit
  « built · step 6 of 7 before first reading » ; le navigateur relit ensuite les fichiers live (`narabi-live.tsx:160-177`) ⇒ avec
  t = 8 servi, « built · N windows published », N = lignes servies (non mesuré ici : aucun réseau). Rafraîchir la capture = lot
  site (Q-10).

## 12. Questions formées (propriétaire, déclencheur, options)

- **Q-1 (bloquante pour la publication — action formée)** : tirage des 11 mois 2025-10-15 → 2026-09-16 (§0, RUNBOOK §7 (1)).
  Décider : go ; lieu (poste de l'orchestrateur, recommandé ; ou VPS en `sentinel` dans un dossier scratch hors `public/`) ; charge
  du pool public : le seul compte par jour mesuré est celui de `run.ts:222-225` (22 tentatives pour un jour, jambe payante forcée,
  G1 NARABI-OPS-1d) — le total pour ~337 jours sans clé n'est pas mesuré (ordre 10⁴ appels, extrapolation). **Risque non mesuré** :
  des jours vieux de onze mois exigent un état d'ARCHIVE (`totalSupply` à d'anciens blocs) ; aucune pièce du dépôt n'établit que
  `PUBLIC_ENDPOINTS` (`rpc.ts:19-23`) le sert pour deux fournisseurs distincts ; le tirage figé de 2025 disait son pool « archive-capable »
  (`scripts/usde-full-pull.mjs:33`, pool différent, publicnode et drpc communs) et note que 1rpc plafonne vers 200 requêtes/jour
  (`usde-full-pull.mjs:5`, commentaire du dépôt). Un fournisseur sans archive fait échouer le quorum ⇒ arrêt fail-closed, relancé
  par la boucle ; arrêt persistant sur le même jour ⇒ STOP et décision (jamais un élargissement du pool ni une jambe payante sans
  décision). Consigner l'heure du tirage au JOURNAL (antériorité ADR-M014 C-7).
- **Q-2** : ADR-M014 (D1 `startAfterDay`, D3 phrase à borne d'ARL, D5) et RAPPORT M014 §3.b rattachent aussi à (l) : le segment
  e-détecteur depuis la première paire calme après le 2025-10-15, la phrase D3, `preregistration_commit` en 40 hex, `crossed_sr`, les
  nits `edetector.ts` (garde λ > 0 de `bridgeMonoLambda`, `makeGrid` K = 1, séquence vide ; « au plus tard (l) ») et l'item (c) taux de
  `non_evaluable` par régime. **Non faits** : la mission borne l'instrument à D6 (rejeux + CUSUM + permutation) et sa liste fermée
  interdit « ARL » dans la `note` ; CHANTIERS:90 planifie « D3 lecture J+30 (2026-10-18) » à part. Options : lot (l-bis) avec une
  section `edetector_segment` et sa propre phrase D3 sous go ; ou amendement d'ADR retirant ces points de (l).
- **Q-3** : ADR-M014 D4 dit que le CUSUM pré-J0 (9,54 ; p = 1/1001) et son contrôle « restent publiés comme section pré-J0 » ; il n'est pas dans la
  liste de clés de la mission ⇒ absent d'`instrument.json`. Options : fichier séparé (`instrument.ts --out`, mais sa section
  e-détecteur contient « average run length »/« delay ») ; ou clé ajoutée par décision.
- **Q-4** : phrase §5 proposée pour le README (où : `README.md` section Narabi après la phrase D8, l.120-122 ; `apps/sentinel/README.md`
  « Run it » pour la nouvelle entrée) — texte public, go 4.
- **Q-5** : l'item formé du RUNBOOK « Re-pointage en place des l. 187-313 … déclencheur : prochaine édition du RUNBOOK » (l. 468)
  **se déclenche** avec ce lot (§7 ajouté) ; propriétaire orchestrateur ; non fait ici (hors mission). Plier au G2/pli ou re-dater.
- **Q-6** : ADR-M012 (l) : ligne Tuyaux (§4) et déviations D-1..D-5 à porter par l'orchestrateur (F-1).
- **Q-7** : aucun consommateur interne d'`instrument.json` ⇒ ne jamais le déclarer `built` ; lecture par `/narabi` = item du lot site
  (déclencheur : première publication du fichier).
- **Q-8** : ADR-M014 D4 retire le CUSUM de « toute lecture séquentielle » ; `series` publie la valeur courante par fenêtre (demandée
  par la mission) sous le libellé « retrospective permutation diagnostic over the closed block, not a sequential reading ». Valider,
  ou ne publier que la statistique du bloc et son p.
- **Q-9** : garde `public` = tout segment `public` (D-3) ; valider.
- **Q-10** : capture committée à t = 6 (rendu serveur « step 6 of 7 ») — rafraîchissement au lot site.
- **Q-11 (préexistant, hors lot)** : sur ce poste, le test 42 (`export_public_no_governance_no_french`) dépasse sa borne interne de
  600 s dans la suite racine complète (base et lot) et passe seul (§9-bis, TAP) ; tout oracle G1/G2 local y verra ce rouge.
  Propriétaire orchestrateur ; déclencheur : prochain oracle local ; options : borne ajustée par décision (test sous ADR), ou
  exécution du test 42 à part dans le harnais d'oracle local, résultat consigné — jamais une suppression du test.

## 13. Ce que je n'ai pas fait, et pourquoi

- Produit / déployé `instrument.json` : impossible sans les 11 mois (réseau, Q-1) ; le dépôt est un acte orchestrateur sous go.
- Aucun appel réseau, aucune clé, aucune action sur le VPS, aucun `curl` ; aucune lecture du `state.json` servi (les chiffres t = 8,
  `9f3223e3…` viennent de la mission).
- Pas touché : ADR (M012/M014), README, `apps/sentinel/README.md`, vitrine (`apps/site/**`), `state.json`, contrats gelés, `edetector.ts`,
  `package-lock.json`, `vocab-banned.json`.
- Pas de segment e-détecteur ni de section pré-J0 (Q-2, Q-3) ; pas de re-pointage des l. 187-313 du RUNBOOK (Q-5).
- Pas de fixture committée : la timeline courte est construite dans le test (aucune série à déclarer/hacher sous `apps/sentinel/test/fixtures`).

## 14. Advisor et sources

- Advisor intégré, 2 consultations (conseil, jamais verdict) : (1) avant l'écriture — contrat CLI, jeu de clés fermé, périmètre
  (Q-2/Q-3 à former, pas à absorber), piège `\bARL\b`, A-9/A-10/A-11/D-1-bis, runbook à dépôt atomique ; (2) avant la clôture — valeurs
  périmées à recalculer (§2, §10), preuve par re-passage isolé avant de qualifier les deux rouges de la base, conséquence
  `sentinel_sha` reportée (§6), aucune retouche du code après le passage final des mutants.
- Sources lues pour ce lot (dépôt) : ADR-M012 (intégral, 214 l.), ADR-M014 (intégral, 125 l.), `docs/biblio/M012-h/` (README + 3 fiches,
  intégral), RUNBOOK-sentinel, CONSIGNE-STANDARD-G1, G1/G2 M012-c, G1 M014-b, RAPPORT M014, CHANTIERS (l.80-95, l.695-712), code
  `instrument.ts`, `run.ts`, `timeline.ts`, `flow.ts`, `edetector.ts`, `tracker.ts`, `adapter-narabi.ts:170-215`, tests existants.

## 15. Discipline git et harnais

- Worktree, lecture seule : `rev-parse`, `status --short`, `log`, `diff`, `diff --stat`, `ls-files --eol`, `ls-files --others`,
  `branch -r --contains`, `worktree list`, `diff --no-index` (méthode A). `git clone --no-local` vers `F:\tmp\narabi\` (3 clones) ;
  `git add -N` dans `F:\tmp\narabi\l-clone` seul (R-25). **Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`.**
- `node_modules` : jonctions `mk-nm.ps1` (sha `d70d8aea…`) sur les 3 clones seulement (jamais dans le worktree) ; retrait par
  `rm-nm.ps1` (sha `b51b5d22…`) après tous les passages : `removed: F:\tmp\narabi\l-clone-base\node_modules`,
  `removed: F:\tmp\narabi\l-clone\node_modules`, `removed: F:\tmp\narabi\l-mutants\tree\node_modules` ; `F:\Monark\node_modules`
  intact (218 entrées, `@monark` 10). Un premier appel groupé a reçu un chemin mal cité (`…narabi$t…`) : `rm-nm.ps1` a répondu
  « absent » et n'a rien retiré — sans effet, consigné. Pour re-vérifier : re-créer par `mk-nm.ps1 -Tree <clone>`.
- Commandes Bash < 6 Ko ; fichiers portant des barres obliques inverses écrits par Write/Edit (A-13).
- Rien sur C: : tout `node` du worker avec `TEMP/TMP/TMPDIR=F:/tmp/narabi/tmp` ; sans cette variable, `os.tmpdir()` de la session
  vaut déjà `F:\tmp` ; cache npm (utilisé par le `npm ci` du test 42) = `F:\cache\npm` (`npm config get cache`, lecture seule).

## 16. Consigne standard G1 — point par point

A-1 fait (l. 1) · A-2 fait (§1) · A-3 fait (§9) · A-4 fait (§17) · A-5 fait : 540 (la consigne cite `ci.yml:65`, le fichier courant
porte le pathspec à la l. 82 — lu par le script, jamais retapé) · A-6 fait (§10, §9-bis) · A-7 fait (`env -u` des 8 variables, jamais
affichées) · A-8 fait (lignes live = octets servis capturés) · A-9 fait (test 4, M49-M51) · A-10 fait (M43) · A-11 fait · A-12 fait
(en-têtes : sha d'arbre, node, commande, sha des mutés/restaurés) · A-13 fait · B-1..B-6 n-a (aucun opérateur payant, aucune clé,
aucun `fetch` : le nouveau fichier entre dans la portée `fetch_only_inside_client` de `apps/sentinel/src/**`, vert §9-bis) · C-1..C-4
n-a · D-1 fait (51 mutants) · D-1-bis fait · D-2 fait · D-3 fait (CLI en processus + sous-processus) · D-4 fait (aucun test existant
touché) · E-1..E-3 n-a · F-1 proposé (Q-6, fichier orchestrateur) · F-2 fait (0 octet non-ASCII dans les deux nouveaux fichiers ;
lignes ajoutées à `instrument.ts` en ASCII) · F-3 fait (D-1..D-5) · G-1 fait (CHANTIERS : l.90 « Replay (l) 11 mois à T ≥ 7
(2026-09-26) ; D3 lecture J+30 (2026-10-18) »).

## 17. Empreintes, livrables, état final

- **Livrables** : `F:\tmp\narabi\l-deliver\` (même arborescence que le worktree) + `DELIVERED.sha256` (chemins relatifs au worktree ;
  vérifié `sha256sum -c` des deux côtés par `deliver.sh`, lancé APRÈS la dernière édition de ce journal — l'empreinte de ce journal
  n'est donc que dans `DELIVERED.sha256`).
- **Outils (hors dépôt, `F:\tmp\narabi\`)** : `r25.mjs` `ad945944…8c26` · `r25-methodA.mjs` `23f86bf1…f7ac` · `run-oracle.sh`
  `7cce6109…71be3` · `sync.sh` `ddc9efc2…30cf` · `deliver.sh` `dec12e08…950a3e` · `iso-rerun.sh` `66a67be3…db50` ·
  `l-mutants/mutants.mjs` `40d94f1a…97cc4` · `l-mutants/tap.sha256` `85f0ed38…42f8` · `mk-nm.ps1` `d70d8aea…fbe4` · `rm-nm.ps1`
  `b51b5d22…8749` · `logs/invariants-before.sha256` `867e86ed…0cbd3` · `logs/invariants-after.sha256` `6b6a67f2…d179` ·
  `logs/oracle-logs.sha256` (14 journaux d'oracle). **Brouillons, pas des livrables** : `scratch/show.ts` `9465a30d…bafb`,
  `scratch/fullgap.ts` `a9039841…b517` (§7).
- **`git status --short` final du worktree** (HEAD `d974e819532e91da3bcd9443d1a85c76084e5c84`, branche `lot/narabi-l`, 0 stash),
  exactement cinq entrées :

```
 M apps/sentinel/src/instrument.ts
 M docs/RUNBOOK-sentinel.md
?? apps/sentinel/src/instrument-replay.ts
?? apps/sentinel/test/sentinel-instrument-replay.test.ts
?? docs/G1-lot-narabi-l.md
```

## Corrections après G2 (pli)
claude-opus-5-5[1m]

- **Modèle résolu (R-1, verbatim)** : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`). Worker de corrections, instance fraîche,
  2026-09-27 (horodatage de passe 01:00Z ; travail 01:00:03Z → 01:33:21Z (livraison), mutants 01:28:37Z → 01:29:34Z, horloge `date -u`).
- **Mission** `F:\tmp\narabi\mission-corr-narabi-l.md` (sha256 `6524fd08…43f06f2`) lue en entier ; rapport G2
  `F:\tmp\narabi\g2\G2-report.md` (sha256 `2d4b57c1…398408`, = mission) lu en entier ; fiches M012-h relues pour la phrase.
- **État initial annoncé** (worktree `F:\Monark-wt-narabi`, branche `lot/narabi-l`, HEAD `d974e81`) : exactement les cinq entrées
  attendues (` M instrument.ts`, ` M RUNBOOK-sentinel.md`, `?? instrument-replay.ts`, `?? sentinel-instrument-replay.test.ts`,
  `?? G1-lot-narabi-l.md`).
- Aucun `git add/commit/push` dans le worktree ; git en lecture seule ; aucun `GIT_DIR`/`GIT_WORK_TREE`/`--write-tree` ; aucun réseau ;
  tout `node` avec `TEMP/TMP/TMPDIR=F:/tmp/narabi/tmp` ; rien sur C:. Pas de suite complète (sentinelle seule, `apps/sentinel/test/*.test.ts`).
  Clones `git clone --no-local F:/Monark` + `checkout --detach d974e81` (sans `alternates`) : `F:\tmp\narabi\l-corr-clone` (tests),
  `F:\tmp\narabi\l-corr-mutants\tree` (mutants), `F:\tmp\narabi\l-corr-r25` (R-25, aucun `git add`), et le seul clone sous un segment
  `public` prévu par C-G2-6 : `F:\tmp\public-check\public\m` (NB : `F:\tmp\public-check\` seul n'a AUCUN segment égal à `public` —
  la garde teste `s === "public"` — d'où le sous-dossier `public`). Fichiers copiés par `sync-corr.sh` (sha des deux côtés).
- Advisor intégré : deux consultations (conseil, jamais verdict) : (1) avant l'écriture (ordre de travail, motifs de mutants à
  préserver, piège du segment `public`, C-G2-7 sous Linux, EISDIR sur un arbre neuf) ; (2) avant la clôture (fidélité du journal).

### Corrections appliquées

| # | Où | Ce qui est fait |
|---|---|---|
| C-G2-1 | `sentinel-instrument-replay.test.ts` (`cli_is_fail_closed`) | 6 cas ajoutés à `cases` : ligne J0 éditée (`burns`, `s_open` +1, C1 tenu) et rehachée ⇒ ancre ; tête du gap `prev_line_hash` = 64 zéros, rehachée ⇒ `--gap line 1: the engine does not reproduce it` ; chevauchement de bloc (`synth({ blockOverlap: 4 })`) ; supply ouvert > clôture précédente (`supplyDrop`) ; jour répété (`repeatDay`, ⇒ `day 2026-09-14 does not follow 2026-09-14`) ; fenêtre graine complète portant `error` ⇒ `no usable last window`. Hors tableau : `--out` = entrée `--timeline` nommée `live.jsonl` ⇒ refus + octets de l'entrée inchangés ; **sous-processus AVEC `--out`** sur un gap tronqué ⇒ code 1, `FATAL … --gap line 1 is not JSON`, `!existsSync(out)`. `edit()` prend un index (défaut : dernière ligne). |
| C-G2-2 | `instrument-replay.ts` `parseReplayArgs` | Lecture BRUTE : `rawInt(v, re)` ⇒ `--perms` `/^[1-9]\d*$/`, `--seed` `/^-?\d+$/` ; valeur absente (`null`) ou vide ⇒ `NaN`, refusée par les gardes existantes (lignes et motifs M07/M08 conservés ; message sans « got » puisque la valeur refusée est toujours `NaN`). Tests : `--seed` final, `--seed ""`, `--perms 1e1` refusés sans écriture ; passage `--seed 7` (sortie distincte) : `params.perm_seed === 7` et, pour `calm` et `all_evaluable`, `permutation` = `{ seed: 7, perms: 200, exceed, p_value }` de l'oracle recodé `permP(seq, 200, 7)`. `instrument.ts:288-289` **non touché** (item ci-dessous). |
| C-G2-3 | `never_touches_state_json` | Arbre neuf dont `state.json` voisin est un **dossier** : un passage réussit (toute lecture ⇒ `EISDIR`) ⇒ absence de LECTURE prouvée, en plus de l'absence d'écriture. |
| C-G2-4 / Q-G2-2 | RUNBOOK §7 « Refresh » | Réécrit selon la décision : **aucun rafraîchissement — UN instantané à T ≥ 7** ; tout rafraîchissement = décision d'ADR (ligne datée sous ADR-M012 (l)), **sans nouveau p de permutation** (ADR-M014 D4, bloc clos lu une fois) ; la CLI livrée calcule toujours cette section ⇒ la décision dit comment un fichier rafraîchi serait émis (même gap, sha consigné, sans tirage). |
| C-G2-5 | RUNBOOK §7 (1), (2), (6) | Préconditions NARABI-L-GAP-1 (a)-(d) : conditions d'usage lues sur place (FAITS datés) avant le tirage ; sonde d'archive d'UN jour (2025-10-16) ; poste de l'orchestrateur, jamais le VPS ; **quorum d'archive : deux fournisseurs distincts, sinon STOP et décision** + le constat de l'orchestrateur (27/09 00:4x-00:50 UTC, `F:\tmp\narabi-gap-logs\` : le pool sans clé seul ne donne pas le quorum au 2025-10-15) ; commentaire « archive NOT measured » remplacé en conséquence ; `-u MONARK_SENTINEL_BUDGET_S` ajouté à `env -u` (et la phrase 180 s dit pourquoi) ; `run.ts` crée aussi `$G/public/` et `--gap` lit `$G/timeline.jsonl`, jamais `$G/public/…` ; `curl -sf` en (2) et (6). IP du VPS : 16 occurrences, inchangé (aucune ligne `ssh` ajoutée). |
| C-G2-6 / Q-G2-3 | `sentinel.test.ts:717` (+ `parse` importé) ; test neuf l. 33-35 | Chemin autorisé `join(parse(process.cwd()).root, "publicfoo", "x.json")` (les deux autres étaient déjà absolus) ; test neuf : assertion d'entrée sur `tmpdir()` AVANT `mkdtempSync` (« the temp root must not contain a 'public' segment »). **D-4 du G1 (« aucun test existant touché ») levée pour ce seul fichier par Q-G2-3** ⇒ `git status` gagne ` M apps/sentinel/test/sentinel.test.ts`. |
| C-G2-7 | `instrument-replay.ts` `pathKey` | `pathKey(p, platform)` : `realpathSync` si le chemin existe (repli `resolve` pour un `--out` pas encore créé), puis minuscules sous `win32` ; utilisé pour le nom de `--out` et la comparaison aux entrées (motif M09 et S14 conservés). Tests (sous `win32`) : `--out <dir>/STATE.JSON` ⇒ `--out is never state.json`, entrée en majuscules ⇒ `must not be an input file` ; partout : `pathKey(…, "win32")` replié, `pathKey(…, "linux")` intact ; **lien symbolique `link.json` → `state.json` refusé** (le `realpath` : `writeFileSync` suivrait le lien). |
| Q-G2-1 | `INSTRUMENT_NOTE` + docstring | « in Page's form, as analysed by Lorden (1971) » → « in the form Page (1954) introduced and Lorden (1971) presents » ; source : `fiche-lorden-1971.md` §« Procédure de Page (1954), reprise par Lorden (p. 1897–1898) » et réf. [6] (Page 1954, Biometrika 41) ; README M012-h « classical Page (1954)/Lorden (1971) recursion ». |

**Phrase publique finale** (`note` d'`instrument.json` et proposition pour le README ; README non édité, Q-4 inchangée ; remplace la
citation du §5) — **60 mots** (découpe du test, limite atteinte), texte `F:\tmp\narabi\tmp\note-corr.txt` sha256 `38a5f159…d391aed2` :

> Instrument, not the official tracker: tracker replays at alternative parameters, and a one-sided CUSUM in the form Page (1954)
> introduced and Lorden (1971) presents, on the static misses, assessed by a permutation test of exchangeability as Vovk (2012)
> defines it. A third way, outside Lorden's i.i.d. theory and the e-detectors of Shin, Ramdas and Rinaldo (2022); no bound is claimed.

`gate:vocab` 319 fichiers OK ; test des mots interdits vert (liste fermée, ≤ 60, mentions obligatoires, toutes les portées).

### Item formé

- **SENTINEL-INSTRUMENT-ARGS-1** — `apps/sentinel/src/instrument.ts:288-289` (ancienne CLI pré-J0) garde la lecture laxiste
  `Number(argv[i + 1])` : `--seed` ou `--perms` en dernier argument ou vide ⇒ `0` accepté comme graine (`--perms` 0 refusé par `< 1`).
  Non touché par mission (préexistant ; hors chemin RUNBOOK). Propriétaire : orchestrateur. Déclencheur : prochaine édition
  d'`instrument.ts` ou tout usage de cette CLI hors défauts. Solution : le même `rawInt` (regex sur la valeur brute) + deux tests
  (`--seed` final, `--seed ""`) dans `sentinel.test.ts`.

### Déviations déclarées (D-C-n)

- **D-C-1** : S14 (G2 : tueur visé `never_touches`) est tué par `cli_is_fail_closed`, où la mission place le cas ; champ `killer` de la
  sonde re-ciblé `FC` dans `probes-corr.json`, dit dans son libellé.
- **D-C-2** : harnais G1 copié (`l-corr-mutants\mutants.mjs` sha `ef42e920…94932ab`, original `40d94f1a…` intact) ; **un seul motif
  changé**, M10 : `if (resolve(p) === resolve(a.out)) throw` → `if (pathKey(p) === pathKey(a.out)) throw` (C-G2-7 réécrit cette ligne) ;
  les 50 autres motifs inchangés, chacun trouvé 1 fois.
- **D-C-3** : ajouts hors liste, pour épingler les lignes neuves : test `--perms 1e1`, test du lien symbolique, sondes N1-N7.
- **D-C-5** : le test du lien symbolique (`symlinkSync(state, link)`, `never_touches`) exige le droit de créer un lien sous Windows
  (mode développeur ou administrateur) : mesuré présent sur ce poste, sans objet sous Linux (CI) ; sur un poste Windows sans ce droit,
  le test rougirait par `EPERM`, pas par une garde. Non modifié après gel (N5 en dépend). Voir Q-C-3.
- **D-C-4** : les messages de refus `--perms`/`--seed` n'affichent plus « got … » (toujours `NaN`) ; les regex de test inchangées matchent.

### Mesures

- **Tests du lot** : 4 tests (cas ajoutés dans les tests existants), verts. **Sentinelle** (`apps/sentinel/test/*.test.ts`, 27 fichiers,
  `run-sentinel.sh` sha `c61879c4…90095`, `env -u` des clés payantes et de `MONARK_SENTINEL_BUDGET_S`) sur l'état final :
  `F:\tmp\narabi\l-corr-clone` **passage 1** 01:14:17Z → 01:23:01Z et **passage 2** 01:23:01Z → 01:28:19Z : **304 / 303 pass / 0 fail /
  1 skip** chacun (skip déclaré préexistant `sentinel_run_releases_chainstack_lock_on_sigterm`, win32) ; TAP `final-pass1.tap`
  `ecffe9c7…`, `final-pass2.tap` `fbf0f1ed…`. Deux passages antérieurs identiques (304/303/0/1, `sentinel-pass{1,2}.tap`) portaient la
  version du test d'avant l'ajout du lien symbolique : remplacés, non comptés.
- **C-G2-6 vérifié** : depuis `F:\tmp\public-check\public\m` (segment `public`), en parallèle du passage 1 : **304 / 303 / 0 / 1**
  (`final-public-check.tap` `ec99f3c4…`) ; `sentinel_edetector_out_guard` seul dans ce clone : **rouge avant** (« Got unwanted exception:
  allows publicfoo/x.json », `outguard-public-BEFORE.tap` `82343b91…`) → **vert après** (`outguard-public-AFTER.tap` `9b065651…`).
  Depuis `F:\tmp\narabi\` : passages 1 et 2 ci-dessus. `TEMP` sous un dossier `public` : le fichier du lot échoue sur l'assertion d'entrée,
  message explicite, aucun dossier temporaire orphelin (`replay-temp-under-public.tap` `c8caa2b6…`). Un premier passage public-check
  lancé avant l'ajout du lien symbolique a été ARRÊTÉ (`sentinel-public-check.tap`, incomplet, non compté).
- **`typecheck`** (`tsc --noEmit`, clone) : 0. **`eslint`** sur les 4 fichiers de code/test touchés : 0.
- **Mutants** (`F:\tmp\narabi\l-corr-mutants\`, arbre `d974e81` + fichiers du lot, `golden.sha256` relu OK après la campagne, node
  v24.15.0, règle A-11) : **G1 51/51 tués par le test visé** ; **sondes G2 S05, S02, S08, S09b, S10, S14, S15, S31 : 8/8 tuées** (ex-8
  survivantes) ; **N1-N7 : 7/7** (N1 `--seed` lu par `Number`, N2 `--perms` par `Number`, N3 `null` accepté, N4 repli de casse retiré,
  N5 `realpath` retiré, N6 nom pris sur `resolve`, N7 lecture de `state.json` ajoutée — tué par `EISDIR`). Table `RESULTS.txt`
  `2cd3e052…`, `g1.log` `72f2d655…`, `probes.log` `2fb15346…`, `probes-corr.json` `f1b7113f…`, `probes.mjs` `ce9cee3b…` (= G2),
  `artefacts.sha256`.
- **R-25 = 607** (`r25-g2.mjs` du G2 copié, sha `16a86443…` inchangé, lit `ci.yml:82`/`:90`, clone `l-corr-r25`, aucune écriture git) :
  suivis `instrument.ts` 12/10, `sentinel.test.ts` 4/2 ; non suivis `instrument-replay.ts` 265, test 314 ⇒ 595 + 12. Attendu 600 ± 15 :
  dans la fourchette ; cible 600 dépassée de 7, sous 700 ⇒ **aucune coupe** ; STOP 1 150 loin. `package-lock.json` : absent du diff.
  `r25.txt` `1b77ff51…`.
- **Jonctions** : `mk-nm.ps1` (220 / 10 / fail 0) sur les trois clones de test ; retrait `rm-nm.ps1 -Tree` : `removed:` ×3 ;
  `F:\Monark\node_modules` intact (220 entrées, `@monark` 10).

### Questions (propriétaire orchestrateur)

- **Q-C-1 (preuve du quorum)** — le constat « le pool sans clé ne donne pas le quorum au 2025-10-15 » vient de la mission ; le seul
  résultat CLASSÉ dans `F:\tmp\narabi-gap-logs\` (`probe-archive-20260927T0050Z.json`) montre au contraire, sur UN bloc (23586600) et
  100 blocs de `eth_getLogs`, deux fournisseurs distincts servant l'archive (`eth_getLogs` et `eth_call`) ; les lectures du jour entier
  (`probe-day.mjs`, `probe-sub.mjs`, `diag-day.mjs`) n'ont de sortie qu'en console. Le RUNBOOK dit les deux. Demande : classer la sortie
  des lectures jour entier (fichier daté) dans ce dossier avant la décision NARABI-L-GAP-1.
- **Q-C-2 (alias de nom Windows au-delà de la casse)** — `pathKey` replie la casse et suit les liens (`realpathSync`, version JS) ; il
  ne couvre pas les autres alias Win32 d'un fichier EXISTANT : point ou espace final (`state.json.`) et nom court 8.3 (`STATE~1.JSO`,
  si la génération 8.3 est active sur le volume). Solution proposée : `realpathSync.native` sous `win32` (chemin final canonique du
  système) + deux tests conditionnels. Déclencheur : avant la première exécution du RUNBOOK (3) sur le poste Windows. Rien d'autre
  que la casse n'était demandé par C-G2-7 ; code gelé après les mutants, donc non fait ici.
- **Q-C-3 (droit de lien symbolique)** — D-C-5 : décider si le test du lien reste inconditionnel (poste d'oracle et CI mesurés
  capables) ou devient conditionnel (`EPERM` ⇒ cas déclaré sauté, jamais silencieux) au prochain pli du fichier de test.

### Empreintes finales (sha256) et état

- `apps/sentinel/src/instrument.ts` `dc0e9df819109f653bf7e219284aa2ba8aaa08efcedc6c75eb9c547431325a0b` (inchangé depuis le G1)
- `apps/sentinel/src/instrument-replay.ts` `c52cb1b7021606c067b9df1a2ec6cf88d9f9a94c097a96ad837002b70591a4fb` (265 l.)
- `apps/sentinel/test/sentinel-instrument-replay.test.ts` `e1a44a0313b8eadccee50ad3fd38deac5ebf69885884c465fa3b428fae8a6d03` (314 l.)
- `apps/sentinel/test/sentinel.test.ts` `676bb034387d0d591865e72213dae823bd05b84571eadc7991754b7aa094d165` (HEAD `1d726b61…`)
- `docs/RUNBOOK-sentinel.md` `b970fe5b3a11af59bded477f8181d37ba2bff188d35867d32bc7908c69ed731e` (619 l.)
- Ce journal : dans `F:\tmp\narabi\l-corr-deliver\DELIVERED.sha256` seulement. Outils : `sync-corr.sh` `0fc6e923…`.
- **`git status --short` final** (HEAD `d974e819532e91da3bcd9443d1a85c76084e5c84`, branche `lot/narabi-l`), six entrées :

```
 M apps/sentinel/src/instrument.ts
 M apps/sentinel/test/sentinel.test.ts
 M docs/RUNBOOK-sentinel.md
?? apps/sentinel/src/instrument-replay.ts
?? apps/sentinel/test/sentinel-instrument-replay.test.ts
?? docs/G1-lot-narabi-l.md
```

## Pli 2 (NARABI-L-GAP-1 : exclusion d'hôte pour le tirage d'archive ; Q-C-2, Q-C-3)
claude-opus-5-5[1m]

- **Modèle résolu (R-1, verbatim)** : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`). Worker, instance fraîche, horodatage de
  passe 2026-09-27T01:36Z (horloge `date -u` : travail ≈ 01:36Z → 01:51Z (livraison)).
- **Mission** `F:\tmp\narabi\mission-corr2-narabi-l.md` (sha256 `9fb848ba…6e0e9d`) lue en entier ; section « Corrections après G2 »
  de ce journal relue ; FAITS `docs/narabi/FAITS-gap-archive-probe-2026-09-27.md` (commit `2381525`, hors de cette branche),
  `F:\tmp\narabi-gap-logs\` (`draw.sh`, `draw.log`, `diag-day2.mjs`, `diag-day2-1020-20260927T0134Z.txt`) et CHANTIERS
  (décisions 246, 247, entrée 01:2x UTC) lus.
- **État initial annoncé** : worktree `F:\Monark-wt-narabi`, branche `lot/narabi-l`, `git rev-parse HEAD` =
  `a3e6f8f3221c3bff69abf5e5842ef759c7fc182e` (gel 1), `git status --short` **vide** (arbre propre, attendu).
- Aucun `git add/commit/push` ; git en lecture seule ; aucun réseau ; `TEMP/TMP/TMPDIR=F:/tmp/narabi/tmp` ; rien sur C:. Tests
  sentinelle seuls. Clones `git clone --no-local F:/Monark` + `checkout --detach a3e6f8f` (sans `alternates`), sous `F:\tmp\narabi\`
  (aucun segment `public`) : `l-corr2-clone` (tests, typecheck, lint, vocab), `l-corr2-mutants\tree` (mutants), `l-corr2-r25`
  (R-25, aucun `git add`) ; fichiers copiés par `sync-corr2.sh` (sha `a00d2d9b…0c10`, sha comparé des deux côtés) ; jonctions
  `node_modules` par `mk-nm.ps1` (220 / 10 / fail 0, deux arbres).
- Advisor intégré : consultations (conseil, jamais verdict) : (1) avant l'écriture (cohérence du RUNBOOK (1) avec la décision 247,
  test d'env existant, fidélité du fichier Q-C-1, mutant « pool mais pas published » tuable seulement en sous-processus, 8.3 et
  symlink en skip déclaré, R-25 > 700 en question) ; (2) avant la clôture.

### Livré

| # | Où | Ce qui est fait |
|---|---|---|
| 1 | `apps/sentinel/src/run.ts` | `excludeHosts(raw, endpoints, published)` (exportée, pure) : liste d'hôtes séparés par des virgules, chaque élément `trim()` + minuscules, comparé au `hostname` de l'URL (déjà en minuscules) de `published` ; `endpoints` et `published` sont parallèles (la jambe payante est le LIBELLÉ `chainstack` dans l'un, son ORIGINE dans l'autre) ⇒ filtrage par index des deux listes ; longueurs différentes ⇒ throw. Absent ou `""` ⇒ copies inchangées. Élément inconnu (faute de frappe, élément vide, espace seul, virgule finale, domaine enregistrable nu `pocket.network`) ⇒ throw (« … is not a host of the pool (…) »). **Lecture UNIQUE** dans `main`, à l'endroit où le pool est construit : `kept = excludeHosts(process.env.MONARK_SENTINEL_EXCLUDE_HOSTS, endpoints, published)` ; `prov.endpoints = kept.published`, `makeRpcPool({ endpoints: kept.endpoints })`. Le throw a lieu AVANT `makeRpcPool` et avant tout RPC ; il tombe dans le `try` ouvert après `openChainstackLeg`, donc le `finally` libère le verrou de cycle (exit 1, `sentinel FATAL`). |
| 2 | `apps/sentinel/test/sentinel-exclude-hosts.test.ts` (neuf, 116 l.) | `sentinel_exclude_hosts_removes_pool_and_published` : **unité** sur la forme réelle du tirage (`[...PUBLIC, "chainstack"]` / `[...PUBLIC, origine]`) : Pocket sort des deux listes, libellé et origine Chainstack restent ; la paire libellé/origine sort ensemble (casse mêlée) ; `undefined` et `""` = inchangé ; 4 valeurs fautives refusées. **Sous-processus** (le VRAI `run.ts`, stub `fetch` dérivé de la capture committée, motif `sentinel-retry.test.ts` ; env enfant sans `CHAINSTACK_*` ni `MONARK_SENTINEL_*`) : seuls mevblocker, 1rpc et Pocket répondent. Absent ⇒ jour écrit, mevblocker **appelé** (non-vacuité), 7 endpoints publiés ; `""` ⇒ **mêmes octets** de `timeline.jsonl` ; `" RPC.MEVBLOCKER.IO , eth.drpc.org"` ⇒ jour écrit sur 1rpc + Pocket, les deux hôtes **jamais appelés** (journal des hôtes du stub), `endpoints` de la ligne = les 5 restants, `line_hash` identique ; `rpc.mevblocker.oi` ⇒ exit 1, `sentinel FATAL … is not a host of the pool`, **zéro appel RPC**, rien écrit ; `deploy/monark-sentinel.service` ne contient pas `EXCLUDE_HOSTS`. C'est le test d'intégration non-LLM du tuyau (règle Branchement). |
| 3 | `docs/RUNBOOK-sentinel.md` §7 (1) | Précondition (d) complétée : fichiers déposés (sonde bloc `probe-archive-20260927T0050Z.json` ET lecture jour `diag-day2-1020-20260927T0134Z.txt`, Q-C-1), **décision 247** (jambe Chainstack + exclusion de Pocket), motif mesuré (réponse bien formée VIDE sans erreur : 2 434 / 0 / 2 434 à 00:54Z ; jour 2025-10-20 lu à 0 log, console, 01:2x UTC ; `quorumTwo` prend les deux premiers succès dans l'ordre, Chainstack dernier jamais consulté), **caractère intermittent dit** (la lecture déposée de 01:34Z montre Pocket CONCORDANT : 4 276 + 3 499 = 7 775 logs), renvoi NARABI-QUORUM-TIEBREAK-1. Commande du tirage : `MONARK_SENTINEL_EXCLUDE_HOSTS=eth.api.pocket.network` + jambe Chainstack (`CHAINSTACK_CYCLE_ID`, `CHAINSTACK_ETH_ORIGIN`, `CHAINSTACK_CYCLE_FLOOR` en gabarit ; `CHAINSTACK_ETH_URL` porteuse de clé laissée dans l'environnement de l'orchestrateur, lue par le transport du garde, jamais en ligne de commande ; `mkdir -p "$G/ledger"` ; les quatre autres `CHAINSTACK_*_URL` et `MONARK_SENTINEL_BUDGET_S` retirés — calque de `draw.sh`) ; note « l'exclusion ne vaut que pour le tirage d'archive ; la production garde le pool complet ; l'unité servie ne pose jamais la clé, jamais écrite dans `/etc/monark/sentinel.env` » ; contrôle de fin (`chainstack: true`, `chainstack_guard: "ok"`, pas de Pocket dans `endpoints`, RU lus au grand livre). Aucune ligne `ssh` ajoutée. |
| 4 | `apps/sentinel/src/instrument-replay.ts` `pathKey` (Q-C-2) | Sous `win32` : `realpathSync.native` (chemin final du système : un nom court 8.3 se résout en nom long), puis minuscules ; ailleurs `realpathSync` inchangé. Docstring : un point/espace final n'est PAS un alias sous Node (mesure ci-dessous). |
| 5 | `apps/sentinel/test/sentinel-instrument-replay.test.ts` (Q-C-2, Q-C-3) | Cas du lien symbolique SORTI de `never_touches` vers `sentinel_instrument_out_symlink_is_state_json` : `EPERM` à la création ⇒ `t.skip("symlink right absent (EPERM): …")` DÉCLARÉ, toute autre erreur ⇒ échec. Deux tests `{ skip: "win32 only (NTFS name aliases)" }` hors win32 : `sentinel_instrument_out_win32_trailing_dot` (épingle la mesure : `--out state.json.` écrit un fichier distinct nommé `state.json.`, `state.json` intact) et `sentinel_instrument_out_win32_short_name` (si `STATE~1.JSO` existe : refusé comme `state.json` ; sinon `t.skip("no 8.3 short name on this volume (8dot3name creation off): …")` DÉCLARÉ). |
| 6 | `apps/sentinel/test/sentinel-catchup-budget.test.ts` | `sentinel_no_clock_env_is_read` : mise à jour ANNOTÉE (motif D-4 de NARABI-OPS-1d) — septième clé `MONARK_SENTINEL_EXCLUDE_HOSTS` dans la liste fermée ; « six » → « seven » dans le titre et le message. |

**Mesure Q-C-2 (2026-09-27 ≈ 01:41Z, `F:\tmp\narabi\c2probe\`, node v24.15.0)** : `state.json` créé ; `existsSync`, `readFileSync`,
`realpathSync` et `realpathSync.native` sur `state.json.`, `state.json ` et `STATE~1.JSO` ⇒ tous `ENOENT` ; `writeFileSync("new.json.")`
crée un fichier nommé littéralement `new.json.` (Node ouvre les chemins dans l'espace `\\?\`, sans la normalisation Win32).
`fsutil 8dot3name query F:` : création de noms 8.3 désactivée sur F: ; `fsutil file setshortname` refusé (privilège absent, non
contourné). Conséquences : le point/espace final n'est pas un alias à couvrir sous Node (D-P2-3) ; le nom 8.3 en est un sur un volume
qui en crée, et `realpathSync.native` le couvre, mais ce n'est **pas prouvé sur ce poste** (skip déclaré ; mutant X8 non tuable ici).

### Item formé

- **NARABI-QUORUM-TIEBREAK-1** — `quorumTwo` (`apps/sentinel/src/rpc.ts:175-197`) s'arrête aux DEUX premiers succès dans l'ordre de
  la liste (`PUBLIC_ENDPOINTS` puis la jambe Chainstack en dernier) ; un fournisseur qui ment (réponse bien formée fausse, ex. `[]`
  d'archive) face à un fournisseur honnête lève `QuorumDisagreementError` sans qu'un troisième soit jamais consulté, et chaque passe
  repart de `rr = 0` ⇒ blocage **déterministe** du même jour (mesuré passes 2-3 du tirage du 27/09). Forme attendue : sur désaccord,
  consulter un troisième fournisseur distinct (`providerOf`) avant de conclure — **2 sur 3** (deux réponses identiques l'emportent ;
  trois distinctes ou pas de troisième ⇒ fail-closed inchangé) ; ligne d'ADR-M012 (quorum). Propriétaire : orchestrateur.
  Déclencheur : prochain lot sentinelle. `MONARK_SENTINEL_EXCLUDE_HOSTS` est le palliatif du tirage, pas cette correction ; `rpc.ts`
  non touché ici.

### Déviations déclarées (D-P2-n)

- **D-P2-1 (RUNBOOK (1) au-delà d'« une ligne »)** : la commande retirait TOUTES les clés Chainstack (pool public seul) ; exclure
  Pocket d'un pool public seul laisse mevblocker comme unique fournisseur d'archive (FAITS §2) ⇒ quorum impossible dès le premier jour.
  La commande est donc alignée sur la décision 247 et sur `draw.sh` (jambe Chainstack), en plus de la ligne demandée.
- **D-P2-2 (test existant modifié)** : `sentinel_no_clock_env_is_read` rougit dès qu'une clé d'env est lue dans `run.ts` ; mis à jour
  honnêtement (septième clé annotée), jamais contourné (pas de `process.env["…"]`).
- **D-P2-3 (Q-C-2, point/espace final)** : mesuré non-alias sous Node ⇒ aucun repli de `.`/espace dans la clé (une première écriture
  qui les retirait a été abandonnée avant tout test) ; le test win32 épingle le comportement mesuré (fichier distinct, `state.json`
  intact) au lieu d'un refus ; un Node futur qui les aliaserait rougirait ce test.
- **D-P2-4 (carte des tueurs du pli 1)** : le cas symlink quitte `never_touches` ⇒ la sonde N5 du pli 1 (« `realpath` retiré »)
  aurait pour tueur `sentinel_instrument_out_symlink_is_state_json` ; la ligne `pathKey` est réécrite ⇒ les motifs N4/N5/N6 du harnais
  du pli 1 ne se trouvent plus tels quels (à reprendre si ce harnais est rejoué). Le fichier de test du lot passe de 4 à 7 tests.
- **D-P2-5 (ordre de lecture)** : la variable est lue après `openChainstackLeg` (la liste `published` dépend de l'origine de la jambe) ;
  le throw précède tout RPC, et le verrou est libéré par le `finally` existant.
- **D-P2-6 (artefact du crochet `after`)** : quand le test échoue dans sa partie unitaire (avant tout sous-processus), l'assertion de
  non-vacuité du crochet `after` échoue aussi (aucun dossier alloué) ⇒ une ligne `not ok` au niveau du fichier ; visible pour X2, X3,
  X5, X6. Même motif que les autres fichiers de la sentinelle.

### Mutants (`F:\tmp\narabi\l-corr2-mutants\`, arbre `a3e6f8f` + fichiers du pli, node v24.15.0, 01:45:47Z → 01:45:55Z)

Harnais `mutants2.mjs` (sha `b42b669d…15c9`) : règles du pli 1 (A-11 : tué SEULEMENT si le TAP porte `not ok N - <test visé>` ;
D-1-bis : fichier temporaire + `fsync` + `rename`, sha du golden relu ; A-13 : chaque motif trouvé exactement 1 fois) ; env enfant sans
`CHAINSTACK_*` ni `MONARK_SENTINEL_*`. `golden.sha256` relu OK après la campagne. `run.log` `c69cd7c6…2674`, `out/results.json`
`534d1b1b…21cb`, un TAP par mutant dans `out/`.

| # | Contrôle | Mutation | Résultat |
|---|---|---|---|
| X1 | **provenance filtrée dans `main`** (mission : « pool mais pas `published` ») | `prov.endpoints = published` | tué (sous-processus : `endpoints` de la ligne) |
| X2 | **hôte inconnu = throw** (mission) | `continue` au lieu du throw | tué |
| X3 | **comparaison insensible à la casse** (mission) | `.toLowerCase()` retiré du jeton | tué |
| X4 | pool filtré dans `main` | `makeRpcPool({ endpoints })` non filtré | tué (journal des hôtes du stub) |
| X5 | `published` filtré dans l'aide | `published: [...published]` | tué |
| X6 | `""` = inchangé | garde `raw === ""` retirée | tué |
| X7 | la clé est lue | `excludeHosts(undefined, …)` | tué |
| X8 | Q-C-2 `realpathSync.native` | `realpathSync(r)` | **survit sur ce poste** : le test 8.3 est sauté (déclaré, F: sans noms 8.3) — dépend de l'hôte |
| X9 | Q-C-2 point final non replié (mesure) | repli `[. ]+$` ajouté | tué (`trailing_dot`) |
| X10 | Q-C-3 skip sur `EPERM` seul | `if (code !== "EPERM") throw e` retiré | **survit sur ce poste** (le droit de lien existe, la branche n'est pas atteinte) — équivalent sur cet hôte, déclaré |

**8/10 tués par le test visé ; les 7 mutants de l'exclusion (dont les 3 de la mission) : 7/7** ; X8 et X10 survivants déclarés,
dépendants de l'hôte.

### Mesures

- **Tests du pli** (clone, deux fichiers) : 8 tests, 7 pass, 0 fail, 1 skip déclaré (`win32_short_name`).
- **Sentinelle** (`apps/sentinel/test/*.test.ts`, `run-sentinel.sh` sha `c61879c4…90095`, `env -u` des clés payantes et du budget,
  clone `l-corr2-clone`) : **passage 1** 01:44:54Z → 01:48:11Z et **passage 2** 01:48:11Z → 01:51:32Z : **308 / 306 pass / 0 fail / 2 skip**
  chacun (304 du pli 1 + 1 test d'exclusion + 3 tests Q-C-2/Q-C-3) ; les deux skips DÉCLARÉS : `sentinel_run_releases_chainstack_lock_on_sigterm`
  (préexistant, win32) et `sentinel_instrument_out_win32_short_name` (F: sans noms 8.3) ; le test symlink a TOURNÉ (droit présent).
  TAP `l-corr2-logs\pass1.tap` `c9c3327a…7fac1`, `pass2.tap` `147f942d…b835`, `passes.log`. Mutants lancés en parallèle du passage 1,
  sur un arbre distinct.
- **`typecheck`** (`tsc --noEmit`, clone ; `--listFilesOnly` confirme `run.ts`, `instrument-replay.ts` et les deux fichiers de test) : 0.
  **`eslint`** sur les 5 fichiers de code/test touchés : 0. **`gate:vocab`** : 320 fichiers, OK.
- **R-25 = 788** (`l-corr-r25-g2.mjs` du pli 1, sha `16a86443…41a0` inchangé, lit `ci.yml:82`/`:90`, clone `l-corr2-r25` au gel 1 +
  fichiers du pli, base `d974e81`, aucune écriture git) : suivis `instrument-replay.ts` 267/0, `instrument.ts` 12/10, `run.ts` 25/2,
  `sentinel-catchup-budget.test.ts` 4/2, `sentinel-instrument-replay.test.ts` 344/0, `sentinel.test.ts` 4/2 ; non suivi
  `sentinel-exclude-hosts.test.ts` 116 ⇒ 772 + 16. **+181 sur 607** (run.ts +27, test neuf +116, test du lot +30, `pathKey` +2,
  test d'env +6). Borne ADR 1 205, STOP 1 150 loin ; **au-dessus du seuil 700 évoqué au pli 1 ⇒ Q-P2-1**. `package-lock.json` absent
  du diff. `r25.txt` `740e78df…a9f9`.
- **Jonctions** : `rm-nm.ps1 -Tree` : `removed:` ×2 (`l-corr2-clone`, `l-corr2-mutants\tree` ; `l-corr2-r25` n'en a jamais eu) ;
  `F:\Monark\node_modules` intact (220 entrées, `@monark` 10). Dossier de mesure `F:\tmp\narabi\c2probe\` laissé (un `state.json` de 3 octets).

### Questions (propriétaire orchestrateur)

- **Q-P2-1 (R-25 788 > 700)** : accepter (borne 1 205) ou couper ; seule coupe sensée = la moitié sous-processus du test neuf (≈ 60 l.),
  mais c'est elle qui tue X1/X4/X7 (le câblage de `main`) — coupe déconseillée.
- **Q-P2-2 (Q-C-2)** : prémisse « point/espace final » mesurée fausse sous Node (D-P2-3) ; le cas 8.3 n'est prouvé sur aucun hôte
  mesuré (F: sans 8.3, `setshortname` sans privilège ; C: exclu par règle ; CI Linux = sauté). Décider : skip déclaré accepté, ou une
  exécution unique du test sur un volume à noms 8.3 (acte orchestrateur).
- **Q-P2-3 (RUNBOOK (1) aligné sur la décision 247)** : confirmer la forme (jambe Chainstack + exclusion, gabarits `<current cycle id>`
  et `<dashboard total at the rollover, RU>`, `mkdir -p "$G/ledger"`). Avec Pocket exclu, l'archive tient sur **mevblocker + Chainstack
  seuls** (FAITS §2) : un jour où mevblocker échoue franchement arrête la passe (quorum à deux fournisseurs) ; la boucle réessaie ; la
  correction durable est NARABI-QUORUM-TIEBREAK-1.
- **Q-P2-4 (Q-C-1, fidélité)** : le seul fichier déposé de lecture jour (`diag-day2-1020-20260927T0134Z.txt`, sha `576cb227…9047`)
  montre Pocket CONCORDANT (7 775 logs) ; la lecture « 0 log sans erreur » du 2025-10-20 reste en console. Le RUNBOOK dit les deux ;
  déposer une sortie datée de la lecture à 0 log si elle doit servir de preuve.

### Empreintes finales (sha256) et état

- `apps/sentinel/src/run.ts` `a02a9542f340eaf44a2d634bff52830e879973e67576f5c949305defe750aaf8` (399 l.)
- `apps/sentinel/src/instrument-replay.ts` `c34f1757445be20e6e5c85617fb95252bc8a7377ec6c1011a9779bc1b33f9a06` (267 l.)
- `apps/sentinel/test/sentinel-exclude-hosts.test.ts` `b23b73e2b9c2144888a018c65c69eb7e8fb349b2150df84120da028084c927e3` (116 l.)
- `apps/sentinel/test/sentinel-instrument-replay.test.ts` `9898b91c85e7b19926cca13a3fcdf3cac136db211d8fe701f4e8da17520f8aa0` (344 l.)
- `apps/sentinel/test/sentinel-catchup-budget.test.ts` `e56dff02e288bf2c6dec1eac4c364c7446f160b2662580555da0700a315a6eba` (404 l.)
- `docs/RUNBOOK-sentinel.md` `dcafd8e3ccd9569f9dc6b306c74d593dcb2f7b8ba42ceb2a1a1d9ce67914f9b5` (637 l.)
- Inchangés depuis le gel 1 : `apps/sentinel/src/instrument.ts` `dc0e9df8…325a0b`, `apps/sentinel/test/sentinel.test.ts` `676bb034…d094d165`.
- Ce journal : dans `F:\tmp\narabi\l-corr2-deliver\DELIVERED.sha256` seulement. Outils : `sync-corr2.sh` `a00d2d9b…0c10`, `deliver-corr2.sh`.
- **`git status --short` final** (HEAD `a3e6f8f3221c3bff69abf5e5842ef759c7fc182e`, branche `lot/narabi-l`), sept entrées (ce journal, committé au gel 1, est modifié) :

```
 M apps/sentinel/src/instrument-replay.ts
 M apps/sentinel/src/run.ts
 M apps/sentinel/test/sentinel-catchup-budget.test.ts
 M apps/sentinel/test/sentinel-instrument-replay.test.ts
 M docs/G1-lot-narabi-l.md
 M docs/RUNBOOK-sentinel.md
?? apps/sentinel/test/sentinel-exclude-hosts.test.ts
```

## Pli 3 (checkpoint-2 : C-V-0 bloquante, C-V-1, C-V-2, C-V-3)
claude-opus-5-5[1m]

- **Modèle résolu (R-1, verbatim)** : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`). Worker, instance fraîche, horodatage de
  passe 2026-09-27T02:45Z (horloge `date -u` : travail 02:41:35Z → 03:09:34Z, livraison ensuite).
- **Mission** `F:\tmp\narabi\mission-corr3-narabi-l.md` (sha256 `c4e54bba…b4e2cd`) lue en entier ; rapport cp-2
  `F:\tmp\cp2-narabi-l\CP2-report.md` (sha256 relu `318685a4bbfdbce0…cbb17e` = celui de la mission) lu en entier, dont
  `logs/export-repro-exclude.tap` ; FAITS `docs/narabi/FAITS-gap-archive-probe-2026-09-27.md` (lu dans `F:\Monark`, commit
  `2381525`, sha `c9348b25…71d0`) §2-§4 ; `F:\tmp\narabi-gap-logs\` (`draw.sh`, `draw2.sh`, `draw.log`, `run-N.log`,
  `probe-sub-0log-20260927T0154Z.txt`) en lecture partagée seulement.
- **État initial annoncé** : worktree `F:\Monark-wt-narabi`, branche `lot/narabi-l`, `git rev-parse HEAD` =
  `33ece9f0499346c87a5aa35ad325ac98dd9feede` (gel 2) ; `git status --short` = **une entrée non suivie qui n'est pas du lot** :
  `?? docs/CHECKPOINT2-lot-narabi-l.md` (dépôt de l'orchestrateur ; ni lu comme source, ni touché, ni livré). Arbre du lot propre.
- Aucun `git add/commit/push` ; git en lecture seule (`status`, `diff`, `show`, `rev-parse`) + `clone --no-local` / `checkout
  --detach 33ece9f` dans MES clones sous `F:\tmp\narabi\` (aucun segment `public`) : `l-corr3-clone` (tests, typecheck, lint,
  vocab, export, oracle), `l-corr3-mutants\tree` (mutants), `l-corr3-r25` (R-25). Fichiers copiés par `sync-corr3.sh` (sha des deux
  côtés comparé). Jonctions `node_modules` par `F:\tmp\g2-garde2bi\mk-nm.ps1` (220 / 10 / fail 0 sur le clone, l'export et l'arbre
  des mutants), retirées à la fin par `rm-nm.ps1` (`removed:` ×3) ; `F:\Monark\node_modules` intact (220, `@monark` 10). Aucun réseau
  de ma part ; seul chemin réseau possible = le `npm ci` interne du test 42 (comportement existant, cache `npm config get cache` =
  `F:\cache\npm`), déclaré comme au cp-2. `TEMP/TMP/TMPDIR` = `F:\tmp\narabi\tmp` pour tout node ; 0 entrée neuve sous
  `C:\Users\KACIMI\AppData\Local\Temp` depuis 02:44Z (mesuré à 03:07Z).
- Advisor intégré (conseil, jamais verdict) : (1) après l'orientation, avant toute écriture (forme exacte de C-V-0, `(t) =>`,
  C-V-2 en deux endroits, périmètre des 10 passes, verrou sans charge propre) ; (2) avant la clôture.
- Incident d'outillage (à moi, sans effet sur le livré) : le harnais Bash a réduit les doubles barres obliques inverses d'un
  heredoc ⇒ le chemin `F:\tmp\narabi-gap-logs\run-N.log` du RUNBOOK s'est écrit avec une tabulation et deux sauts de ligne ;
  réparé par `fix-bs.mjs` (octets construits par `String.fromCharCode(92)`, motif compté 1 fois) avant toute copie vers un clone ;
  `git diff --check` = 0. Les fichiers portant des barres obliques inverses (`mutants3.mjs`, `oracle-corr3.sh`,
  `deliver-corr3.sh`, cette section) ont ensuite été écrits par l'outil d'écriture de fichier ; les deux heredocs postérieurs
  (`edit-corr3-runbook2.mjs`, `sync-corr3.sh`) n'en portaient aucune.

### Livré

| # | Où | Ce qui est fait |
|---|---|---|
| C-V-0 | `apps/sentinel/test/sentinel-exclude-hosts.test.ts` (l. 114-121) | La SEULE assertion sur l'unité est conditionnée par `existsSync(join(REPO, "deploy"))` (convention de `sentinel-catchup-budget.test.ts:318-321`) : `deploy/` présent ⇒ lecture de `deploy/monark-sentinel.service` et assertion « the unit does not set the key » (un `.service` absent avec `deploy/` présent rougit par `ENOENT`, jamais un skip) ; `deploy/` absent (export public, ADR-NARABI-OPS-1c C3) ⇒ `t.diagnostic("deploy/ absent (public export, C3): unit check not run")`, déclaré dans le TAP. Le rappel du test devient `(t) => {` ; **aucun `{ skip }`** : l'unité pure et les quatre sous-processus du vrai `run.ts` (preuve de X1/X4/X7) tournent dans l'export. |
| C-V-3 | même fichier, l. 1 et l. 80 | Les deux tirets cadratins → `-` ASCII (en-tête et titre du test ; le premier jeton du titre, lu par les harnais `not ok N - (\S+)`, est inchangé). `grep -nP '[^\x00-\x7F]'` sur le fichier : 0 ligne. |
| C-V-1 | `apps/sentinel/src/instrument-replay.ts:32-33` (docstring) | « No run-length, delay or optimality claim is made (ADR-M012 amendment (h)) » → « No sequential claim is made (ADR-M012 amendment (h)) » (forme proposée par la mission). `grep -n 'delay\|optimal\|run-length'` sur le fichier : 0. Aucun octet servi ne change (`INSTRUMENT_NOTE`, libellés et clés intacts). `gate:vocab` : 320 fichiers, OK (non-régression ; il était déjà vert avant — la preuve de C-V-1 est le grep). **Lacune G2 consignée** : le G2 a écrit « 0 occurrence … dans les commentaires » ; c'était inexact (présent depuis le G1, FM-3.3) ; corrigé ici. |
| C-V-2 | `docs/RUNBOOK-sentinel.md` §7, précondition (b) et paragraphe « Motive, measured » | (b) : « ONE day (2025-10-16) » remplacé par la sonde bornée telle que mesurée le 2026-09-27 : **bloc 23 586 600** et **jours 2025-10-15 et 2025-10-20** (FAITS §2-§3 et fichiers déposés). Paragraphe : « 01:2x UTC: day 2025-10-20 read as 0 logs, console » remplacé par la preuve datée déposée **`F:\tmp\narabi-gap-logs\run-N.log`** du tirage 1 (jambe Chainstack, Pocket NON exclu) : `"stopped": "quorum_disagreement:<day>"` sur **10 passes**, toutes finies avant la ligne d'arrêt 01:56:18Z de `draw.log` : runs 1, 2, 4, 6, 7, 8, 10, 20, 21, 22 (01:00Z-01:54Z ; jours 2025-10-20 ×2, 2025-10-25, 2025-10-31, 2025-11-08, 2025-11-15, 2025-11-28, 2026-01-07, 2026-01-14 ×2 ; `"chainstack": true` dans les 10, mesuré). Dit honnêtement : ces journaux enregistrent le DÉSACCORD, pas le côté qui a répondu vide ; la réponse vide elle-même = la mesure 00:54Z (FAITS §3) ; la lecture console de 01:2x UTC n'est pas déposée. Intermittence gardée et renforcée : la lecture déposée de 01:34Z (7 775 logs concordants) ET `probe-sub-0log-20260927T0154Z.txt` (Pocket 2 434 logs six fois de suite sur la plage de 00:54Z). |

Autres occurrences de `2025-10-16` : RUNBOOK l. 252 (« ONE day at a time », sans rapport) ; journal l. 12, 15, 85, 149, 408 =
historique du G1/pli 1 (la ligne 408 décrit le libellé d'alors, remplacé ici) — non réécrits.

### Déviations déclarées (D-P3-n)

- **D-P3-1 (RUNBOOK, une phrase de plus que demandé)** : la phrase d'intermittence cite aussi `probe-sub-0log-20260927T0154Z.txt`
  (fichier déposé, lu : six réponses Pocket de 2 434 logs), comme le demande le cp-2 (« en gardant l'énoncé de l'intermittence (les
  deux fichiers déposés montrent la concordance) »).
- **D-P3-2 (outil de tests sentinelle)** : `run-sentinel.sh` du pli 2 réutilisé tel quel (sha `c61879c4…90095`) : il retire
  `CHAINSTACK_ETH_URL`, les trois clés de cycle et le budget, pas les quatre autres `CHAINSTACK_*_URL` présentes dans mon shell (noms
  seulement relevés, jamais les valeurs) ; mêmes conditions qu'aux plis 1-2 ; le test d'exclusion retire lui-même `CHAINSTACK_*` et
  `MONARK_SENTINEL_*` de l'enfant. L'export et l'oracle utilisent la liste `env -u` complète du cp-2.

### Preuves (ordre du checkpoint-2)

- **(i) Tests sentinelle** (`apps/sentinel/test/*.test.ts`, clone `l-corr3-clone` = `33ece9f` + fichiers du pli) : **passage 1**
  02:46:27Z → 02:52:25Z et **passage 2** 02:52:25Z → 02:55:51Z : **308 / 306 pass / 0 fail / 2 skip** chacun ; skips DÉCLARÉS :
  `sentinel_run_releases_chainstack_lock_on_sigterm` (win32) et `sentinel_instrument_out_win32_short_name` (F: sans noms 8.3) ;
  `ok 36 - sentinel_exclude_hosts_removes_pool_and_published` ; **aucune** ligne `# deploy/ absent` côté dépôt (`deploy/` présent :
  l'assertion sur l'unité a tourné). `typecheck` (`tsc --noEmit`) 0 ; `eslint` sur les deux fichiers de code/test 0 ; `gate:vocab`
  320 fichiers OK.
- **(ii) Export local** : `node scripts/export-public.mjs --out F:/tmp/narabi/l-corr3-export` depuis le clone ⇒ `export OK — 489
  file(s)`, exit 0 ; `deploy/` ABSENT de l'export (mesuré) ; le fichier de test exporté a le sha du livré (`07b8a8bf…`). Jonctions
  `mk-nm.ps1` sur l'export, puis `node --test --test-reporter=tap apps/sentinel/test/sentinel-exclude-hosts.test.ts`, cwd = export,
  `env -u` complet : **`ok 1`, `# pass 1 / # fail 0`, exit 0 (02:47:27Z)**, avec la ligne **`# deploy/ absent (public export, C3):
  unit check not run`** dans le TAP (`export-run.tap`). **Contrôle** : la version du gel 2 (`git show 33ece9f:…`) posée
  temporairement sous un autre nom dans le MÊME export ⇒ `not ok 1`, `ENOENT … l-corr3-export\deploy\monark-sentinel.service`
  (reproduction du cp-2 ; fichier temporaire retiré, absence vérifiée).
- **(iii) Verrou d'hôte** `F:\tmp\oracle-lock` (`oracle-corr3.sh`, sha `d79906eb…c217`) : `mkdir` atomique réussi du premier coup
  à **02:56:07Z** (0 s d'attente), `owner.txt` « pli 3 NARABI-L-1 2026-09-27T02:56:07Z » ; `node` actifs avant : 23 (tirages Narabi,
  autres sessions) ; rien d'autre de moi pendant la tenue. **Test 42 à part** (`node --test --test-timeout=900000
  test/export-public.test.ts`) : **exit 0, 3/3 pass**, dont `ok 2 - export_public_no_governance_no_french` (02:56:08Z → 02:59:48Z,
  fichier 219 s). **Gate `test` complète** (`npm run test`, même tenue) : **exit 0 — 1 367 tests / 1 364 pass / 0 fail / 3 skip**
  (02:59:48Z → 03:06:04Z, 375 s ; test 42 dans la suite `✔` en 360,9 s < 600) ; skips = les trois déclarés (`sigterm` win32,
  `win32_short_name`, `u4b_labels_replay_via_main_real_artifact`) ; = le cp-2 (1 363 pass + 1 fail) avec le rouge passé au vert.
  **Libéré** (`trap` : `rm owner.txt` + `rmdir`) à **03:06:04Z** ; absence de `F:\tmp\oracle-lock` vérifiée après.
- **(iv) Mutants** (`F:\tmp\narabi\l-corr3-mutants\`, arbre `33ece9f` + fichiers du pli, node v24.15.0, 02:48:47Z → 02:49:13Z,
  avant la tenue du verrou) : harnais `mutants3.mjs` (sha `c89cb9fc…0306`), mêmes règles que les plis 1-2 (A-11 tué SEULEMENT si
  `not ok N - <test visé>` ; D-1-bis ; A-13 motif compté 1 fois ; env enfant sans `CHAINSTACK_*`/`MONARK_SENTINEL_*`) ;
  `golden.sha256` relu OK après la campagne.

| # | Contrôle | Mutation | Résultat |
|---|---|---|---|
| Y1 | **C-V-0 (mission)** : `deploy/` présent + l'unité porte la clé | ligne `Environment=MONARK_SENTINEL_EXCLUDE_HOSTS=eth.api.pocket.network` ajoutée après `Environment=MONARK_SENTINEL_DIR=…` | **tué** (`the unit does not set the key`) |
| Y2 | `deploy/` présent + `.service` absent ⇒ rouge, jamais un skip | `.service` renommé, `deploy/` gardé | **tué** (`ENOENT … deploy\monark-sentinel.service`) |

  **2/2**. Non-régression : harnais du pli 2 `mutants2.mjs` (sha `b42b669d…15c9`) rejoué sur le même arbre : **8/10**, X1-X7 tués
  par `sentinel_exclude_hosts_removes_pool_and_published` (le conditionnement n'affaiblit pas la preuve du câblage), X9 tué, X8/X10
  survivants déclarés dépendants de l'hôte (inchangé).
- **R-25 = 794** (`l-corr-r25-g2.mjs`, sha `16a86443…41a0` inchangé, lit `ci.yml:82`/`:90`, clone `l-corr3-r25` au gel 2 +
  fichiers du pli, base `d974e81`, aucune écriture git) : `instrument-replay.ts` 267/0, `instrument.ts` 12/10, `run.ts` 25/2,
  `sentinel-catchup-budget.test.ts` 4/2, `sentinel-exclude-hosts.test.ts` **122/0** (était 116), `sentinel-instrument-replay.test.ts`
  344/0, `sentinel.test.ts` 4/2 ⇒ 778 + 16. **+6 sur 788** (le test : +7/−1 ; la docstring : 2 lignes remplacées à compte égal).
  RUNBOOK et journal hors pathspec (`docs/**/*.md`). Borne ADR 1 205, STOP 1 150 : loin. `package-lock.json` absent du diff.

### Questions (propriétaire orchestrateur)

- **Q-P3-1 (tirage 1 toujours vivant ?)** : `F:\tmp\narabi-gap-logs\draw.log` porte « STOP-1 2026-09-27T01:56:18Z tirage 1 arrete
  par TaskStop (lignes=91) », mais des passes 24 → 49 y sont encore ajoutées après (01:58:05Z → 02:41:20Z, `lastday` avançant jusqu'à
  2026-03-12) et `run-24.log` … `run-48.log` s'écrivent (dernier vu 02:40Z) : la boucle `draw.sh` du tirage 1 (Pocket NON exclu, jambe
  Chainstack) semble toujours tourner, en parallèle du tirage 2 (`draw2`), sur `F:\tmp\narabi-gap\` — deux tirages sur la jambe
  payante à la fois. Hors de mon périmètre (rien touché) ; à vérifier (processus, RU au grand livre). C'est aussi pourquoi le RUNBOOK
  ne cite que les 10 passes finies avant 01:56:18Z. (La première ligne `STOP 01:04:45Z` était déjà suivie de passes.)
- **Q-P3-2 (dossiers temporaires)** : `F:\tmp\narabi\tmp` accumule des dossiers `t1b-*`, `bell-*` d'autres suites (préexistant, hors
  lot) ; aucun `narabi-exclude-*` orphelin (0). Nettoyage éventuel = acte orchestrateur.

### Empreintes finales (sha256) et état

- `apps/sentinel/test/sentinel-exclude-hosts.test.ts` `07b8a8bff3179890d6a1351386b2eca7c63e4c5066b22842d513058b8768a2b9` (122 l.)
- `apps/sentinel/src/instrument-replay.ts` `8fdaf7def2d75a5d8ebe4831a955fa5b232b6c40abd92256562c97dfb1216a7e` (267 l.)
- `docs/RUNBOOK-sentinel.md` `f12a04767ac3dd3de2f570e99fafc8891026558f16a04f6891075ed79a4d0853` (644 l.)
- Inchangés depuis le gel 2 : `run.ts` `a02a9542…`, `instrument.ts` `dc0e9df8…`, `sentinel-instrument-replay.test.ts` `9898b91c…`,
  `sentinel-catchup-budget.test.ts` `e56dff02…`, `sentinel.test.ts` `676bb034…`.
- Ce journal : dans `F:\tmp\narabi\l-corr3-deliver\DELIVERED.sha256` seulement.
- Traces : `F:\tmp\narabi\l-corr3-logs\` (`pass1.tap` `36d47450…`, `pass2.tap` `06161907…`, `passes.log`, `typecheck.log`,
  `eslint.log`, `vocab.log`, `export.log`, `export-run.tap` `e376eea0…`, `export-run.txt`, `export-control-gel2.tap` `37cbff6b…`,
  `r25.txt` `2ae457cd…`, `oracle\{lock.log,header.txt,exits.txt,t42-alone.tap 9e3961de…,test.log 86566053…}`) ; mutants
  `l-corr3-mutants\{mutants3.mjs,golden.sha256,run.log fe99a612…,out\results.json 0774dbcb…,out2\results.json f18ee7b7…}` ; outils
  `sync-corr3.sh` `acb71f2d…`, `edit-corr3.mjs` `898f47a0…`, `edit-corr3-runbook.mjs` `846e4ce1…`, `edit-corr3-runbook2.mjs`
  `97c814df…`, `fix-bs.mjs` `a54b68ad…`, `oracle-corr3.sh` `d79906eb…`, `deliver-corr3.sh`.
- **`git status --short` final** (HEAD `33ece9f0499346c87a5aa35ad325ac98dd9feede`, branche `lot/narabi-l`) : les quatre fichiers du
  pli modifiés + l'entrée non suivie préexistante de l'orchestrateur :

```
 M apps/sentinel/src/instrument-replay.ts
 M apps/sentinel/test/sentinel-exclude-hosts.test.ts
 M docs/G1-lot-narabi-l.md
 M docs/RUNBOOK-sentinel.md
?? docs/CHECKPOINT2-lot-narabi-l.md
```
