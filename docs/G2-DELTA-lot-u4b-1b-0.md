Modèle résolu : claude-opus-4-8[1m]

# G2-DELTA — Lot U-4b-1b-0 « outillage de course », REPRISE (décision 116, pli `0578514`) — relecteur, contexte frais

> Relecteur `claude-opus-4-8[1m]`, effort max (préfixe `claude-opus-4-8` conforme ; Opus 5 banni ; R-20 : aucun commit ;
> R-21 : sortie vérifiable). Clone réutilisé `F:\tmp\g2-u4b1b0\tree` : `git fetch origin`, `git checkout 0578514`
> (HEAD `05785144d341cbdb3db65881053fae9a4fdc8365`, fourche `3afde03`), node_modules par `mk-nm.ps1`. Toute exécution sous
> `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u
> CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY`. Écriture uniquement sous `F:\tmp\g2-u4b1b0\`.
> Aucune variable d'environnement affichée. Sondes et mutants à moi. Delta mesuré vs mon G2 précédent (`57ac8ae`).

## VERDICT G2-DELTA : PASS

Le pli `0578514` (8 fichiers : `record.ts`, 4 tests, `liquidation-logs.mjs`+`u4b-discover.mjs` wording, ADR-U4b) répond
au ruling d'escalade (flags obligatoires par code une fois le prereg présent + `--no-prereg-binding` explicite), aux
contrôles positifs C-1, à mon O-1, et insère l'amendement ADR D4. Toutes les vérifications (1)-(7) REFAITES sont vertes.
Corrections résiduelles : AUCUNE de code. Deux actions de PLI (propriété orchestrateur, R-20), toutes deux **vérifiées
vertes** par G2 et inhérentes à un pli dans un `etude-suite` qui avance :
- **F-1 (pli)** : union `scripts/export-exclude-tests.json` (lot +3 tests ; -2a +2 tests) — attendue par la mission.
- **F-2 (pli)** : union `docs/adr/ADR-U4b…md` — le pli AJOUTE l'amendement D4 en fin ; `etude-suite` a AJOUTÉ l'amendement
  2a-8 (U-4b-2a) en fin ⇒ conflit de contenu au merge (non nommé dans la mission, mais réel). Résolu en UNION : D4
  **après** 2a-8 ⇒ ordre 126 → 2a-8 → D4 (mission 7 satisfaite).

Note de cible mouvante (non bloquant) : la mission cite `lot/etude-suite` HEAD `ecc49ac` ; au moment de la fusion à
blanc, le HEAD réel (fetch frais depuis F:\Monark) était `894d06be` (`ecc49ac` en est ANCÊTRE — etude-suite a avancé).
J'ai fusionné avec le plus frais (`894d06be`) ; la composition est verte quelle que soit la révision.

---

## (1) Contrôles positifs C-1 (les gardes ACCEPTENT le bon sha ; erreur suivante = quorum ; 0 fetch)

Sonde P1 (`g2-probes-delta.mjs`, VRAI `record.ts`, `globalThis.fetch` compté) : `--prereg-file docs/PLAN-u4-prereg.md
--prereg-sha <LF sha réel> --labeler-sha <LF sha réel de u3-realized.mjs>` (sha recomputés par recette INDÉPENDANTE
createHash, PAS `record.ts.lfSha256`) ⇒ **les deux gardes sont franchies**, l'erreur suivante est le **quorum**
(`/quorum-2 needs >= 2 distinct operators/`, opérateur unique), **fetch = 0**. PASS.
Mutants « garde refuse toujours » ROUGES : `prereg-guard-always-refuses` (`if (actual !== args.preregSha)` → `if (true)`)
et `labeler-guard-always-refuses` — tués par `ukemi_record_a_correct_prereg_and_labeler_sha_cross_both_guards`.

## (2) O-1 (whitelist, PAS un blacklist {chainstack,helius})

Sonde P2 (pure) : `assertKeylessOperators(["drpc.org", v])` lève pour **chaque** `v ∈ {Chainstack, CHAINSTACK,
" chainstack", Helius, alchemy, infura, "chainstack "}` (variantes de casse/espace + labels payants inconnus) ; la liste
keyless valide est acceptée. PASS. Mutant `whitelist-to-blacklist` (`if (["chainstack","helius"].includes(op))`) ROUGE —
tué par `u4b_discover_refuses_a_paid_operator_keyless_only` (boucle de variantes ajoutée au pli).

## (3) Ruling flags obligatoires (`record.ts`)

Code lu (`preregBound = existsSync(preregPath) && !args.noPreregBinding` ; deux throws pré-vol ; `prereg_binding` en
provenance filter-only ET book). Sondes :
- **P3a — refus pré-vol** : `--prereg-file docs/PLAN-u4-prereg.md` (existe) + flags absents ⇒ refus **nommé**
  (`/--prereg-sha is required because docs\/PLAN-u4-prereg\.md exists on disk/`), **fetch = 0**, **0 ledger** (dir `cyc`
  non créé), **pas de diag** (`<out>.diag.json` absent — le throw précède le `try`). PASS.
- **P3b-i — `--no-prereg-binding` lève l'exigence** : mêmes conditions + `--no-prereg-binding` ⇒ atteint le quorum guard
  (pas le refus de mandat), fetch = 0. PASS.
- **P3b-ii — provenance enregistrée** : run book complet (fixture `weth-book`, keyless+chainstack) + `--no-prereg-binding`
  ⇒ code 0, livre écrit, **`provenance.params.prereg_binding == "none"`**. PASS.
Mutants ROUGES : `flags-absent-accepted` (`preregBound = false`), `no-prereg-binding-parse-ignored`
(`noPreregBinding: false` au parse), `prereg-binding-not-recorded` (champ retiré de la provenance book).

## (4) Simulation du commit du prereg (survie des usages génériques)

Créé `docs/PLAN-u4b-prereg.md` (contenu neutre, DANS le clone seulement) ⇒ suite complète **791 / 790 / 0 / 1 (0 fail)**
— les usages génériques (helper `argv()` portant `--no-prereg-binding`, tests de binding sur `docs/PLAN-u4-prereg.md` ou
`--no-prereg-binding`) survivent au commit. Fichier supprimé, arbre PROPRE. PASS.

## (5) Harnais de mutants — 11/11 (rejoués sur mon clone) + mes 3

`g2-mutants-delta.mjs` (WT = mon clone, critère de kill « fail>=1 rapporté par le runner », restauration byte-exacte) —
**14/14 TUÉS** :
- **11 du pli** (`F:\tmp\u4b1b0\mutants.mjs`, find/replace verbatim) : prereg-guard-removed, labeler-guard-removed,
  diag-not-written, paid-operator-accepted, sort-removed, prereg-guard-always-refuses, labeler-guard-always-refuses,
  flags-absent-accepted, no-prereg-binding-parse-ignored, prereg-binding-not-recorded, whitelist-to-blacklist.
- **mes 3** : `M6:diag-only-on-budget` (tué par `ukemi_record_failed_paid_rpcerror_leaks_no_key_on_any_surface` — la
  clôture C-R-b7 couvre le chemin NON-budget) ; `M7:prereg-file-ignored` (recodée en dur sur `PLAN-u4-prereg.md`, tué par
  `ukemi_record_prereg_sha_binds_the_course_to_the_prereg_file`) ; `M9:no-prereg-binding-inverted` (sens inversé au site
  d'usage, tué par `ukemi_record_prereg_and_labeler_sha_are_mandatory_once_the_prereg_file_exists`).
`all_killed_and_restored: true`.

## (6) Oracle `env -u` + fusion à blanc

**Clone propre `0578514`** : gate:vocab 0 (209 f.) · typecheck 0 · **test 791 / pass 790 / fail 0 / skipped 1 / todo 0** ·
lint 0 · lint:ratchet 69/69 · lang:gate 0 · export:check 0. Skip unique = `fetch_only_inside_client` (« until 1b »,
préexistant). **= 791/790/0/1 attendu.**

**Fusion à blanc avec `lot/etude-suite` HEAD frais `894d06be`** (`git merge --no-commit --no-ff`) : conflits
`scripts/export-exclude-tests.json` (F-1) ET `docs/adr/ADR-U4b…md` (F-2), résolus en UNION en arbre de travail (sans
commit) ; aucun package.json workspace neuf ; node_modules reconstruits. Merged : typecheck 0 · **test 820 / pass 819 /
fail 0 / skipped 1** (même skip) · vocab 0 (212 f.) · lint 0 · ratchet 69/69 · lang 0 · export:check 0. Puis
`git merge --abort` (rc 0) : arbre PROPRE, HEAD `05785144…`, unions révertées. **0 fail, skipped==1 — conforme.**
Réconciliation du compte (auto-cohérente, mes propres runs) : **820 = 791 (lot propre) + 29 (tests d'etude-suite
au-delà du lot) = 818 (fusion du 1ᵉ G2 avec `37af534`) + 2 (les deux tests neufs du pli)** ; le delta etude-suite = 29
aux DEUX tours (818−789 et 820−791). Le « 830/830/0/0 » du message de `894d06be` est l'oracle du lot **GARDE-HELIUS-1b**
(autre revue « merged tree »), PAS la suite complète sous mon invocation ; `fetch_only_inside_client` reste **skippé**
sur `894d06be` (`test/rpc-guard-fetch-only-inside-client.test.ts:136`, vérifié) ⇒ mon `skipped==1` est correct.

## (7) 9 sha gelés intacts + placement de l'amendement D4

**9 sha gelés** recomputés LF à `0578514` : identiques aux valeurs ADR §3 (voir mon G2 précédent) ; `git diff
--name-only 57ac8ae 0578514` sur ces 9 = VIDE (le pli ne les touche pas). Fermeture transitive intacte.
**Amendement D4** (`## Amendement daté — 2026-09-22 (D4, liaison de course par CODE)`) : sur la branche du lot il est en
fin de fichier, APRÈS l'amendement 126 (l.156). Dans la fusion à blanc résolue, l'ordre est **126 (l.156) → 2a-8 (l.268,
U-4b-2a) → D4 (l.296)** ⇒ D4 **après 126 ET 2a-8**. **Libellé = ruling** : « REQUIS par code dès que
`docs/PLAN-u4b-prereg.md` existe » ; `--no-prereg-binding` explicite écrit `prereg_binding:"none"`, interdit pour la
course weth ; refus de garde = pré-vol (0 appel, 0 ledger, pas de diag) ; flags optionnels quand le fichier n'existe pas
(un `--prereg-sha` avec fichier absent = refus nommé « does not exist ») ; 9 sha LF byte-identiques. Conforme au code lu.
R-25 (pathspec `ci.yml:65`, three-dot ⇒ merge-base `3afde03`) = `12 files changed, 699 ins, 23 del` ⇒ **722** (= message
de commit ; ADR exclu car docs/*.md) ; > 300 checkpoint-2, < 1150/1205 pas de STOP.

**`DELIVERED.sha256` rejoué contre le pli** : le manifeste `F:\tmp\u4b1b0\DELIVERED.sha256` a été MIS À JOUR au pli — ses
12 entrées matchent les blobs `0578514` **12/12, 0 mismatch** (`record.ts` = `bcf6efa1cfd1f567aebace52be7fbb0088d549ebb42f87ca87769b158e362098`
= blob `0578514`) ⇒ manifeste concordant avec le commit du pli (pas un manifeste périmé de `57ac8ae`).

## Provenance

Relecteur `claude-opus-4-8[1m]` effort max, 2026-09-22 ; clone `F:\tmp\g2-u4b1b0\tree` @ `0578514` (fourche `3afde03`) ;
réviseur en amont = orchestrateur (R-21). Reproductible : `F:\tmp\g2-u4b1b0\{g2-probes-delta.mjs, g2-mutants-delta.mjs,
d-*.log (clone), d-test-preregpresent.log (check 4), dm-*.log (fusion), G2-DELTA-lot-u4b-1b-0.md}`. node v24.15.0, git
2.55.0. Aucun commit. Aucune écriture DE G2 hors `F:\tmp\g2-u4b1b0\` (sondes sous `probe-work` ; simulation prereg créée
puis supprimée dans le clone ; fusion à blanc abandonnée) ; les tests LIVRÉS utilisent os-tmpdir transitoirement (nettoyé
en `finally`). Aucune variable d'environnement affichée.
