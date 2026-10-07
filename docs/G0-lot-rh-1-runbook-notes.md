# G0 du lot RH-1, partie 1 : six notes de relecture pliées dans la section « Retire a kata row » du RUNBOOK (N-1 à N-6)

RECHERCHES, 2026-10-07. Base `177b5755` (lot/etude-suite). Plan : `docs/G0-lot-retire-latency-rehearsal-1.md` §5, §8 et §11 ;
relecture RECHERCHES `d55006f` (notes N-1 à N-6).

red-proof: test-only

## Changement

- `docs/RUNBOOK-harness.md`, section « Retire a kata row » (texte seul) :
  - N-1, étape 7 : les deux contrôles des 300 s dans le bon sens, `produced_at_stale` (passé, `kata-path.ts` l.47) et
    `produced_at_future` (futur, le test de `tools/gate.ts` l.885 ; l.886 n'est que le `throw`) ;
  - N-2, étape 7 : le `yhat` de la sonde dans `calib_support`, `out_of_support` (l.93) étant testé avant `calib_retired` (l.94) ;
  - N-3, étape 4 (réécrite au repli de la G2, constat M) : seul le clone de `--verify` est exposé à `core.autocrlf`, lu comme
    fichiers par `compareTrees` (l.222-226 ; `DIFFERENT`, exit 1, l.275-276), le dépôt de spec n'ayant pas de `.gitattributes` ;
    l'arbre de gouvernance est lu par `readFileSync` (l.185), mais son `.gitattributes` (l.2, `* text=auto eol=lf`, depuis
    `357ef25f`) garde LF quel que soit `core.autocrlf` ; le clone `previous` est lu dans les objets git (l.179, `git cat-file
    blob` l.163), et c'est lui que T0 a refusé, `input_digest` (`docs/ETAT.md` l.603 ; `docs/G7-lot-t0-followup-1.md` l.8) ;
  - N-4, étapes 5 et 6 : déployer un commit fusionné vert avec `spec-policy-tables.mjs --check` à 0 ; la conduite si la fusion
    échoue après T_d ;
  - N-5, étape 9 : le cas « indexé, non commité » (`git clean` muet, `git rm -r` refuse, mesuré) et `git restore --staged` ;
  - la valeur `publication` et le refus `instant_out_of_cycle`, en une phrase marquée « AFTER #218 » : #218 n'est pas dans la base.
- `test/runbook-retire.test.ts` (N-6) : T_d avant T_e (« merges it after T_d, never before ») ; les refus et codes de sortie de
  `retire-latency.mjs` lus dans le script et rejoués ; `--out` de la publication et du déploiement ; la portée des commandes de
  refonte (`git rm -r -- spec/contract-1.1.0-tables-<YYYY-MM-DD>`, une seule) ; les refus cités de `spec-publish.mjs` et la sortie
  2 de `--check --date`. Chaque épingle porte sur un texte présent à la base : les cinq tests y sont verts.

## Repli de la G2 (2026-10-07)

Ligne datée 2026-10-07T06:09:47Z (`date -u`), RECHERCHES, modèle `claude-opus-5-5`. Actes git : `git fetch` à refspecs explicites
de `recherches/rh-1-runbook-notes` (`386ee07f`), `recherches/rh-1-probe-instants` (`8cf2482e`), `lot/etude-suite` (`acbaeb52`) et
`recherches/rh-3-publication-cycle` (`998c2e30`), vérifiés par `git ls-remote` ; un commit neuf sur `recherches/rh-1-runbook-notes`,
sans amend ni force ; `git merge-tree` contre `998c2e30` (#218), sans écriture de ref. Constats vérifiés à la source avant repli :
- M (N-3) : réécrit comme ci-dessus, phrase exacte du relecteur. Rejoué : un clone `--shared -c core.autocrlf=true` de cet arbre
  donne 0 fichier `w/crlf` (`git ls-files --eol`) ; `gh api repos/KraidleAI/monark-kata-spec/contents/.gitattributes` répond 404.
- m-1 (épingles du texte neuf) : quatre tests neufs, plus le test 4 étendu. Ils lisent la valeur attendue dans le code
  (`kata-path.ts` l.47 et `tools/gate.ts` l.885 pour le sens des deux refus d'horloge ; l'ordre `out_of_support` puis
  `calib_retired` de la branche d'échelle de `kata-path.ts` ; `.gitattributes`) et tiennent sur chaque phrase de la section qui
  porte l'affirmation. Le texte de base n'en porte aucune : ils y sont verts, et le lot reste test-only (`red-proof`, verdict
  « pinned »). Limite déclarée : la suppression pure d'une de ces phrases n'est pas rouge (rien ne l'exige à la base) ; voir
  les gardes plus bas.
- m-2 : le test 2 exige que la liste « Exit 1 » égale l'ensemble des codes `no("…")` du script, et refuse « AFTER #218 » dès que
  le script lève `instant_out_of_cycle`. La phrase « AFTER #218 » reste telle quelle (ordre de fusion : #218 avant #223).
- m-3 (N-5) : la raison devient « `git rm -r -f` would remove it with no dry run first » (`git rm` imprime chaque chemin) ; le cas
  indexé cite `git clean -n -d -- <dir>/` et `git rm -r -- <dir>` portés, puis `git clean -n -d`, puis `-f -d`, portés et avec
  `-d`. Le test 4 capture toute commande `git clean|rm|restore` entre backticks et exige la portée `-- <dir>` (seul `git rm -r -f`,
  le contre-exemple, est excepté par son nom) et `-d` à chaque `git clean`. Rejoué dans un dépôt jetable : `git rm -r` refuse
  (« changes staged in the index »), `git rm -r -f -n` imprime `rm '…'`, `git clean -n` sans portée liste un autre fichier.
- m-4 (N-4) : « Merge the trunk into the lot branch, never rebase it (T_b and T_c are read on its commits) » ; `--check` prouve
  le fichier du dossier sous `spec/`, la publication est prouvée par le `--verify` de l'étape 4.

## Tueurs (après #218, 445 devient 447 ; au pli de l'encodage, 447 devient 450)

Au repli de la G2 : 370 devient 372, 411 devient 414, 364 devient 366 ; 300 reste. Le tueur :423 est neuf (encodage).

- docs/RUNBOOK-harness.md:372 CONST "(T_e)" -> "(T_f)"
- docs/RUNBOOK-harness.md:414 CONST "\"format\": \"retire-latency-v1\"" -> "\"format\": \"retire-latency-v2\""
- docs/RUNBOOK-harness.md:423 CONST "(New-Object System.Text.UTF8Encoding $false)" -> "(New-Object System.Text.UTF8Encoding $true)"
- docs/RUNBOOK-harness.md:300 CONST "apps/harness/data/kata/retire/" -> "apps/harness/data/retire/"
- docs/RUNBOOK-harness.md:450 CONST "`git clean -f -d -- spec/contract-1.1.0-tables-<YYYY-MM-DD>/`" -> "`git clean -f -d`"
- docs/RUNBOOK-harness.md:366 CONST "`short_digest`" -> "`short_digests`"
- docs/RUNBOOK-harness.md:400 CONST "in the past is `produced_at_stale`" -> "in the past is `produced_at_future`"
- docs/RUNBOOK-harness.md:404 CONST "`out_of_support` (`kata-path.ts` l.93)" -> "`calib_retired` (`kata-path.ts` l.93)"
- docs/RUNBOOK-harness.md:358 CONST "`git -c core.autocrlf=false clone`" -> "`git -c core.autocrlf=true clone`"
- docs/RUNBOOK-harness.md:380 CONST "never rebase it" -> "rebase it"

## Après la fusion de #218 et #219 (2026-10-07)

Ligne datée 2026-10-07T07:21:27Z (`date -u`), RECHERCHES, modèle `claude-opus-5-5`. Actes git : `git fetch` à refspecs explicites
de `lot/etude-suite` (`022c82d1`, #218 et #219 fusionnées) et des trois branches empilées, vérifiés par `git ls-remote` ; fusion
de `lot/etude-suite` dans `recherches/rh-1-runbook-notes` (`47002407`), sans rebase, amend ni force. La phrase « AFTER #218 » passe
au présent : `cycle` vaut `rehearsal`, `real` ou `publication` ; un cycle `publication` tient T_c à T_g, sans plafond et `mention`
`null` (`scripts/retire-latency.mjs` l.10, l.44, l.56) ; T_a ou T_b y lève `instant_out_of_cycle`, une mention
`mention_out_of_cycle`. La liste des refus de l'exit 1 gagne ces deux codes. Le tueur du test 4 suit le texte (+2 lignes) : 445
devient 447, remesuré sur l'arbre fusionné ; les huit autres ne bougent pas.

Preuve en deux parties (acceptée par MONARK, G2 courte du 2026-10-07) : aucun `red-proof --test-only` ne passe après #218, par
construction. À la base `022c82d1`, le test 2 est rouge (le RUNBOOK du tronc ne cite pas les deux codes neufs : un F2P légitime) ;
à la base `177b5755`, la production a changé (`retire-latency.mjs` de #218, fichiers dojo).
- Corps du lot : `red-proof --test-only --base 177b5755` sur `47002407` : OK, 9 tests épinglés, 9 tueurs tués.
- Commit d'après #218 : la fusion telle quelle (`c25005e0`) rougit `runbook_retire_shows_the_closed_latency_input` (l.58,
  `mention_out_of_cycle` non cité, ERR_ASSERTION) ; avec la mise à jour (`21ad597e`) les 9 tests sont verts, et les tueurs :414
  et :447, tirés sur l'arbre mis à jour, sont tués.

## Gardes des épingles neuves (2026-10-07)

Ligne datée 2026-10-07T07:29:06Z (`date -u`), RECHERCHES, modèle `claude-opus-5-5`. G2 courte de MONARK, constat m 2 : quatre
mutations de lignes neuves survivaient (MY-1 à MY-4), les épingles étant plus étroites que leurs en-têtes. Trois gardes et une
exigence, test seul, vertes à la tête :
- test 7 : la phrase d'ordre se lit « is tested before » ou « is tested after », dans les deux sens ; une section qui nomme
  `out_of_support` doit porter une phrase d'ordre lue (MY-1, « before `calib_retired` » → « after », tué) ;
- test 8 : une section qui dit qu'un clone « holds CRLF » cite au moins un clone, et chaque clone cité porte
  `core.autocrlf=false` (MY-2, `git -c core.autocrlf=false clone` → `git clone`, tué) ;
- test 4 : chaque `git clean -f -d -- p` suit immédiatement un `git clean -n -d -- p` (MY-3, l.446 `-n` → `-f`, tué) ; chaque
  `git restore` cité porte `--staged` (MY-4, l.445 `git restore --staged --` → `git restore --`, tué).
Chaque tir est fait à la main sur l'arbre de la tête (une substitution, sha256 du fichier rendu vérifié) : tué en ERR_ASSERTION
par le test visé, 8 verts sur 9. Les mêmes quatre tirs survivent au test d'avant (9 sur 9). Un cinquième, « is tested » →
« is checked » à l.404, est tué lui aussi par la garde du test 7. Limite restante : MY-5 (l.357, un fait externe sur le dépôt de
spec) n'est pas épinglable hors réseau.

## Encodage de l'entrée du rapport (2026-10-07)

Ligne datée 2026-10-07T07:30:14Z (`date -u`), RECHERCHES, modèle `claude-opus-5-5`. G2 courte de MONARK, constat m 3 : sous
Windows PowerShell 5.1, `>` écrit de l'UTF-16 et `Out-File -Encoding utf8` un BOM ; `retire-latency.mjs` lit le fichier en UTF-8
et le passe à `JSON.parse` (l.65), donc refuse les deux, `format_invalid`, exit 1 (l'échec est fermé). Rejoué ici sur un même
JSON de cycle `publication` : sans BOM, exit 0 ; avec BOM (`ef bb bf`), exit 1 ; en UTF-16 (`ff fe 7b 00`), exit 1. Le lot reste
sans code : l'étape 8 dit que l'entrée est en UTF-8 sans BOM et donne la forme PowerShell qui l'écrit,
`[System.IO.File]::WriteAllText("<instants.json>", $text, (New-Object System.Text.UTF8Encoding $false))`. Un test neuf,
`runbook_retire_input_is_written_in_utf8_without_a_bom`, lit dans le script la lecture en UTF-8, constate qu'un BOM fait échouer
`JSON.parse`, et exige la phrase et le `$false` de chaque forme `WriteAllText` citée ; tueur :423 (`$false` → `$true`). Les trois
lignes ajoutées font passer le tueur du test 4 de :447 à :450. Preuve : ce commit n'est pas test-only au sens de `red-proof`
(son test est rouge sur le texte d'avant, F2P) ; `red-proof` en mode F2P contre le commit des gardes le juge.

## Suite

La partie 2 (`recherches/rh-1-probe-instants`, empilée sur celle-ci) livre RETIRE-PROBE-1 et RETIRE-INSTANTS-1 et cite leurs
commandes aux étapes 7 et 8.
