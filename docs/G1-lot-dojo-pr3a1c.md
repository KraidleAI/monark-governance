claude-opus-5-5

# G1 — journal du lot Dōjō PR-3a-1c « éditeur : vérification avant engagement, tests manquants, version de prix atomique » (ADR-DOJO-PR-3)

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant déclaré par le système), effort max (mission), contexte frais. Implémenteur G1 ;
  ne committe pas, ne lance aucun workflow (R-20).
- **Mission** : `F:/tmp/dojo/mission-g1-pr3a1c.md` (64 l., 18 689 octets), sha256 recalculé AVANT lecture (18:45:37Z) =
  `5e7662129d6bde7c83517ec38be178bfc48d61fca4931c25da30df07851f187b`, égal au reçu `F:/tmp/dojo/mission-g1-pr3a1c.recu.json`
  (`238b5483…66cc` ; verdict `vert`, 12 codes à 0, base `ea70a43b`, head `a86d9522`).
- **Worktree** : `F:/Monark-wt-dojo-pr3a1c`, branche `lot/dojo-pr3a1c`, HEAD `a86d952263ea6566983e35cec21e8d414775ac1b` ; `git status`
  (`--no-optional-locks`) propre à l'ouverture ; base..HEAD = 2 fichiers (`docs/G0-lot-dojo-pr3a1c.md` A, `docs/adr/ADR-DOJO-PR-3.md` M),
  empreintes égales à celles de la mission. Tronc `F:/Monark` relu à 18:52:15Z : HEAD `5b298ad2` = `ea70a43b` plus un commit de registres
  (`docs/CHANTIERS.md`, `docs/PASSATION.md`) ; outils de la mission inchangés (empreintes égales).
- **Verdict de la tâche 1 : STOP par le repli pré-déclaré.** Compte ascendant honnête = **249 > 236** : la coupe 3a-1c-1 / 3a-1c-2 est à
  prendre AVANT tout code (mission, « Décisions » : « arrête-toi et dis-le » ; ADR PC-1, repli). Aucune ligne de code ni de test écrite.

## Horloge (`date -u`)

18:45:37Z (sha256 de la mission, avant lecture) ; 18:52:15Z (tronc relu) ; 19:06:19Z (empreintes des entrées) ; 19:07:57Z (début de
l'écriture de ce journal) ; heure de fin et empreinte finale : hors du fichier (réponse `F:/tmp/dojo/pr3a1c-deliver/REPONSE.md`).

## Lu (sha256 recalculés entre 18:45Z et 19:07Z)

| Entrée | sha256 | Lecture |
|---|---|---|
| mission (64 l.) | `5e7662129d6bde7c83517ec38be178bfc48d61fca4931c25da30df07851f187b` | en entier |
| `docs/methode/REGLES-MISSION.md` | `12d5f2df4b5dd9b3cb633727f9e5af8d960fdfdfe22f66e4023b8e88bba40335` | verbatim dans la mission |
| `docs/adr/ADR-DOJO-PR-3.md` (402 l.) | `8fe7d444bbdf62ef0cee4fea6ad76e64ba6892bd235ed08bd9868185ce7d5e5f` | en entier |
| `docs/G0-lot-dojo-pr3a1c.md` (79 l.) | `ff106bfd8282dad4468083c3d63df48fc5bb005a62cf6ebd15bc7cd754e31090` | en entier |
| `F:/tmp/dojo/cp1-pr3a1c/CP1-report.md` (57 l.) | `35f805791a235bddaddc11ec3f89ee71176f753f9ec345e1993451f683b76eee` | en entier (= `.sha256`) |
| `docs/adr/ADR-DOJO-PR-1B-5.md` (270 l.) | `c822f03905ee6369aff632188c68a46b7eac508aa5655098647aa75c07dca0e7` | PLI-1 à PLI-9, plis G7 5a, 5b |
| `apps/dojo/scripts/dojo-publish.mjs` (343 l.) | `4dc033254d2381ee535b2461246a9ddee490205963ea1554e121790a2142612f` | en entier |
| `apps/dojo/scripts/dojo-publish.d.mts` (34 l.) | `f63295d7c124842cf9950042c75c9f537fdbaca4e46956d0c6e673c957fbd652` | en entier |
| `apps/dojo/test/dojo-publish.test.ts` (486 l.) | `a5d1fa1f7f122094477475f2080cebec0589f14e26b2c0a590c881ed5e36260f` | en entier |
| `test/dojo-publish-e2e.test.ts` (129 l.) | `afef7b9d6fe95344087e8e9921c8bacc875ab1694ba1657cb20d5073cdb46544` | en entier |
| `apps/dojo/scripts/dojo-verify.mjs` (372 l.) | `ef6d15b21239e3a78ebb874c654b6e7a5ba2ecb5952ba1fd5b794d3d42f6c49f` | en entier |
| `apps/dojo/src/dojo-methods.ts` (29 l.) | `495368211802acb172d2a9e69b0483c9872658fc847cedf6850e4cf099cef861` | en entier |
| `F:/tmp/dojo/g2-pr3a1b/mutants/table-g2.json` | `bb9f42722a24ad20a2bfc63b5bf7f001243fd7643a29db37d948e50eca447b51` | 37 rangs listés |
| `F:/tmp/dojo/g2-pr3a1b/mutants/g2-rows.json` | `fc07ec8bbf019ed5048d5c63bd37c6670f6dce6d0c23b41c12b70afc6e1c333c` | 16 rangs, 6 survivants |
| `F:/Monark/scripts/red-proof.mjs` (268 l.) | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` | en entier (`parseKiller` l.46-49) |

**Hors liste, lus pour trancher sur pièce** :

| Fichier | sha256 | Objet |
|---|---|---|
| `apps/dojo/scripts/dojo-chain.mjs` (168 l.) | `04411fa71b2cfd365ef7023161d82e0fa65f9f4904b27964caf78b4b39ca7123` | en entier ; `anchorForm` l.52-59 |
| `apps/dojo/scripts/dojo-verify-cli.mjs` (95 l.) | `2478c68575c996b7f80c57201d8f6be1f566f05f64f250393a503e9aabb2b99a` | `fetch(` l.37 |
| `F:/tmp/dojo/g2-pr3a1b/logs/proto-vbc.diff` (364 l.) | `d7cf2bc8e6128efd8702e4513dc19b6ad58d126e95dd94ea61eb4b5fde32dd1f` | en entier (prototype de la VAE) |
| `apps/dojo/src/bundle.ts` | `03b9a9103f61ceb9a6569887ae9904e4f32fda998dfe50a1b2176dee7d1cf06e` | l.100-125 (`writeDayBundle`) |
| `apps/dojo/test/dojo-verify.test.ts` | `90378c26373548bcc27a78db3569c1c0716c5579aedd6a090bd1a67edc837668` | l.685-730 (fermeture du cœur) |
| `apps/dojo/test/helpers/dojo-fixture.ts` | `2e9e04b79dc4e6755f81b2e390248d56bbeb1885a19e2a7e46c06e23ab9b7e1d` | l.1-60 |
| `apps/bell/scripts/bell-chain.mjs` | `521270a3793716c53b61ba1ee7ccec5aa4faa0f24406cba04e6a254398816ce7` | `signingBytes`, `signLine` (l.66-74) |
| `.github/workflows/ci.yml` | `0f401ae2da253b76b7306322c85a5ddbd887ca675b0bedbbb4e43504dc8c949a` | l.82 (pathspec R-25) |
| `F:/Monark/scripts/mutants/run.mjs` (238 l.) | `2606e7dae37f4d13764f3a7c5eca3a947885c871d9dc680632a912ad7e083b19` | en entier |
| `F:/Monark/scripts/oracle/run.mjs` (173 l.) | `f22b90459b54cf0fd2eff1e9d556b4676b57a2e82d766cd9342aa3619cb2a41b` | en entier |
| `F:/Monark/scripts/oracle/r25.mjs` (28 l.) | `4d0544dfe6c3cb316f014265aee51771547841cbbe99a23713c4365154827cf0` | en entier |
| `F:/Monark/scripts/oracle/lock.mjs` (47 l.) | `501a76b58e15f45ae8317b1d8a8385f13ff2a9b4740a3fa03f224472822e33bb` | en entier |
| `docs/G1-lot-dojo-pr1b5b.md`, `docs/G1-lot-dojo-pr1b5a.md` | `a82fac13…6e41`, `d027c0db…e8d8` | procédures F2P, mutants, jonctions |
| `F:/tmp/dojo/drand-1a/mk-nm.ps1`, `rm-nm.ps1` | `d70d8aea…31fbe4`, `b51b5d22…368749` | en entier (non lancés) |

## Constats mesurés (avant le compte)

- **É-G1-1 — C-V-1 (a) : le cas prescrit de T-2 n'est pas constructible.** `dojo-chain.mjs:58` (`anchorForm`) exige
  `l.price_window_days === 7` ; l'éditeur marche toute ligne avant son engagement (`dojo-publish.mjs:139-141`) ; le test de base
  `dojo-publish.test.ts:102` attend `line_refused` pour `price_window_days: 6`. Une « ancre neuve licite à `price_window_days` plus
  court » est refusée à `--anchor`, et un état qui la porterait est refusé à l'ouverture (`openState` l.114-115). La prémisse du cp-1
  (« rien ne l'épingle entre deux ancres », rapport l.42) est contredite par la l.58. P vaut 7 partout : sur un état que le vérificateur
  accepte, aucune version n'est due avant la dernière ancre (son calendrier N1-N3, `dojo-verify.mjs:232-250`, refuse l'ancre qui clôt un
  segment avec une version due, l.237 ; la garde `price_version_pending` fait de même côté éditeur). La garde de segment ne joue que sur
  un état forgé ou hérité : une ancre posée au-dessus d'une version due (ce que l'éditeur de 3a-1b, sans garde, pouvait laisser).
  **Forme constructible** (pour M-E20, au lot qui la portera) : ancre signée ajoutée à la main au-dessus d'une version due ; avec la garde,
  `--inbox` rend `nothing_to_publish` sans rien écrire ; sans elle, la complétion est tentée et la VAE la refuse à sa propre seq
  (`price_version_mismatch`, vérificateur l.200-201, après un marcheur qui l'admet, `versionCheck` l.79) ; l'arbre servi est refusé à la seq
  de l'ancre (`version_not_in_force`, l.237). Le cas « publie le jour suivant sous l'ancre 2, arbre relu vert » : impossible (Q-G1-1).
- **É-G1-2 — T-8, non-vacuité** : `dojo-methods.ts` ne porte aucun `import` ni `from` (0 occurrence, `grep -c`) ; l'assertion
  `specs.length >= 1` (test l.197) rougirait sur ce fichier. Amendement prévu, sans exception nommée : non-vacuité exigée de tout fichier
  qui porte le mot `import`. Fermeture attendue : 9 fichiers (les 7 de la base, `dojo-verify.mjs`, `dojo-methods.ts`) ; le cœur n'importe
  que `node:fs`, `node:path`, `node:url`, `node:crypto` et trois modules du dépôt (l.10-17), aucun jeton de la liste l.191 (grep : 0).
  `dojo-verify-cli.mjs` n'y entre pas (aucun importeur dans la fermeture) ; il porte `fetch(` (l.37) : la liste l.191 le refuserait.
- **É-G1-3 — fermeture servie** : l'éditeur importera `dojo-verify.mjs` et `dojo-methods.ts` ; l'arbre `/opt/monark-dojo` de PR-3b-2
  (item DOJO-PUBLISH-TREE-PATHS-1, `git archive` au G7, A-3) doit les porter. Aucune liste n'existe encore (`scripts/dojo-deploy.mjs:3`,
  `grep` de `DOJO_PUBLISH_TREE_PATHS` : ce seul commentaire) : aucun rouge aujourd'hui, un tuyau à déclarer (Q-G1-4).
- **É-G1-4 — red-proof, épingles par construction** : `judgedOf` (l.122) juge tout test dont une ligne du corps change ; `publishDay`
  devient asynchrone (la VAE attend `verifyDojoServed`, asynchrone) : quatre tests existants changent pour la seule attente (malformé,
  `check`, même paquet deux fois, instantané), plus T-9 ; avec T-3 à T-6 (comportement déjà juste au gel : les six survivants du
  G2 le prouvent), ils seront verts à la base, donc « refused: green at base » ; sortie 1 par construction (précédent : pli G7 de
  PR-1b-5a, « cinq épingles déclarées »). F2P attendus : T-1, T-2, T-7, T-8 (population du tirage `--draw 3`).
- **É-G1-5 — renvoi numéroté hors périmètre** : `apps/dojo/test/dojo-verify.test.ts:691` cite « dojo-publish.test.ts:189-205 » ;
  T-8 déplacera ces lignes ; fichier hors du périmètre fermé (PC-1), non touché (Q-G1-6).

## Compte ascendant par fichier (tâche 1, AVANT tout code)

Unité : insertions + suppressions prévues, celle du plan (PC-1 : prototype `+68/−52 = 120`) et de `r25()` (`git diff --shortstat`, sans
`-M`, `-C`, `-B`) ; une ligne modifiée compte 2. Lignes citées = base `a86d9522` (égales au gel `48556d80` sauf la l.34 du module,
commentaire de C-G2-7 de PR-1b-4, même compte de lignes : `git diff 48556d80 HEAD`).

**`apps/dojo/scripts/dojo-publish.mjs`** (343 l.) : **51**

| Composant | Lignes de base | + / − | Compte |
|---|---|---|---|
| en-tête « parts 1a to 1c » | l.1 | +1 / −1 | 2 |
| imports : `dirSource`, `verifyDojoServed` (cœur) ; `READ_RULE` (`dojo-methods.ts`) | après l.17, l.21 | +2 | 2 |
| `price_version_pending` dans la liste fermée (l.28 à 160 caractères : repli) | l.28 | +2 / −1 | 3 |
| D-C2 : `read_rule` égal à `READ_RULE` en JSON canonique, `anchor_malformed` (M-E18) | après l.163 | +1 | 1 |
| garde `price_version_pending` à `--anchor` (M-E17) | après l.166 | +1 | 1 |
| `publishDay` asynchrone ; bloc de doc (VAE, reprise) | l.186-187 | +2 / −1 | 3 |
| reprise qui complète au démarrage, seule action du lancement (M-E15) | après l.189 | +2 | 2 |
| VAE du jour : version en mémoire, `snapshot` et version vérifiés ensemble, puis engagés (M-E13) | l.229 | +3 / −1 | 4 |
| `complete()` : VAE, engagement, `dojo/publish: completed_price_version`, résultat `completed` (M-E16) | neuf | +8 | 8 |
| `checked()` : vrai `verifyDojoServed`, source mémoire sur `dirSource(public/)`, `line_refused` (M-E14) | neuf | +9 | 9 |
| `pendingVersion()` : aucun `snapshot` (M-E19), dernier `snapshot` avant la dernière ancre (M-E20), `versionAfter` | neuf | +10 | 10 |
| `runCli` asynchrone, `await publishDay`, entrée `await runCli` | l.308, l.331, l.343 | +3 / −3 | 6 |

**`apps/dojo/scripts/dojo-publish.d.mts`** (34 l.) : **7** — doc et variante `completed` de `DayResult` (l.25-27 : +2 / −1 = 3) ;
`publishDay` rend `Promise<DayResult>` (l.28 : 2) ; `runCli` rend `Promise<number>` (l.34 : 2).

**`apps/dojo/test/dojo-publish.test.ts`** (486 l.) : **186**

| Composant | Lignes de base | + / − | Compte |
|---|---|---|---|
| aides `okA`, `refusesA` (prototype) | après l.58 | +3 | 3 |
| 12 lignes `// killer:` renumérotées (ancres du module décalées) | l.83, 120, 138, 207, 253, 264, 354, 371, 384, 412, 457, 477 | +12 / −12 | 24 |
| asynchrone mécanique : 19 appels, `versionOf`, 3 assertions de `run`, 4 déclarations | 27 lignes (sous le tableau) | +27 / −27 | 54 |
| T-1 neuf (M-E13, M-E14) et option `offset` de `writeDay` (l.323, 331, 334 et un repli) | neuf ; l.323-334 | +17 / −3 | 20 |
| T-2 neuf : arrêt au second ajout, `--anchor` refusé, `completed` (A+1, A+8), jour 8, forges C-V-1 (b) et É-G1-1 | neuf | +38 | 38 |
| T-3 neuf (G2-M1, G2-M2, G2-M4) | neuf | +15 | 15 |
| T-4 étendu : 18 jours, seconde fenêtre à la première + 7 (G2-M3) | l.376-379 | +5 / −4 | 9 |
| T-5 étendu : immuable de `staging/` altéré avant la réparation (G2-M10) | après l.406 | +5 | 5 |
| T-6 étendu : ancre neuve au dernier jour d'historique (G2-M12) | après l.464 | +2 | 2 |
| T-7 étendu : l.100-101 vers `anchor_malformed`, `beacon_period` 30 (M-E18) | l.100-101 | +3 / −2 | 5 |
| T-8 : fermeture de 9 fichiers, non-vacuité amendée (É-G1-2), CLI mesurée hors fermeture | l.197, l.202-204 | +7 / −4 | 11 |

- Lignes de l'asynchrone mécanique : l.344-345, 358-359, 375, 393, 396, 403, 407-408, 413, 424, 428, 430, 434, 445, 452, 458, 464, 468,
  471-472, 478-479, 481-482, 484. Mutants de T-2 : M-E15, M-E16, M-E17, M-E19, M-E20.
- **T-2 = 38**, ligne à ligne : tueur, déclaration, fermeture 3 ; arrêt synthétique au second ajout (seam) 2 ; `eve` et deux boucles
  (sept paquets, six publications) 3 ; arrêt au jour 7 1 ; noms (`kept`, horloge, forks) 1 ; `--anchor` refusé et `files` intacts 2 ;
  copie des deux forks 1 ; reprise `completed`, ligne lue, fenêtre A+1 et effet A+8 4 ; jour 8, version nommée, arbre vert 3 ; forge
  interne de C-V-1 (b) 9 (commentaire 2, construction 3, deux chronologies 1, empreinte 1, deux refus 1, `files` 1) ; ancre forgée
  de É-G1-1 8 (commentaire 1, ligne d'ancre 2, ajout 1, empreinte 1, `nothing_to_publish` 1, vérificateur 1, assertion 1) ; séparateur 1.
- **Robustesse** : sans l'en-tête l.1 (2) ni les blocs de doc (9), 238 > 236 ; avec T-2 à 30, 241 > 236 ; les deux ensemble, 230 : le
  verdict tient donc au décompte de T-2 ci-dessus et aux blocs de doc que porte chaque fonction de ce module (convention du fichier).

**`test/dojo-publish-e2e.test.ts`** (129 l.) : **5** — `okA` (+1) ; l.106 `await okA` (+1 / −1) ; tueur l.100 renuméroté (+1 / −1).

**Total : 51 + 7 + 186 + 5 = 249** (plan : ≈ 175) ; × 2,31 = 575,2 > 547 ; **249 > 236 : repli.**

- **Calibrage** : part « prototype » (VAE, asynchrone, tueurs, fermeture, TU-1c) 123 contre 111 recomptées au plan (+12 : T-8
  étendu, `checked` en fonction) ; D-C3 et C-V-1 : 62 (code 24, T-2 38) contre 23 (+39) ; T-1 : 20 contre 12 (+8, option `offset`) ;
  T-3 à T-6 : 31 contre 20 (+11) ; D-C2 : 7 contre 9 (−2) ; en-tête et docs hors plan : 6 ; total +74 (175 contre 249).

## Décision : repli pré-déclaré (mission, « Décisions » ; ADR PC-1)

- **249 > 236** : STOP avant tout code ; la coupe est un acte de l'orchestrateur (ligne `| PR-3a-1c-1 |` datée avant toute génération,
  ligne datée de l'ADR du 2026-09-30 02:4x UTC). Tâches 2 à 6 non exécutées : aucun code, aucun test, aucun F2P, aucun mutant, aucun oracle ;
  R-25 mesuré sans objet (aucune ligne comptée par `r25()` : ce journal est sous `docs/**/*.md`, exclu, `ci.yml:82`).
- **Coupe proposée, au compte de ce journal** (périmètre de PC-1 inchangé) :

| Lot | Contenu | Tests | Compte | × 2,31 | Solde à 547 |
|---|---|---|---|---|---|
| PR-3a-1c-1 | module 51, `.d.mts` 7, test unitaire 155 (tout sauf les extensions T-3 à T-6), TU-1c 5 | T-1, T-2, T-7, T-8, T-9 | 218 | 503,6 | 43,4 |
| PR-3a-1c-2 | `apps/dojo/test/dojo-publish.test.ts` seul : T-3 15, T-4 9, T-5 5, T-6 2 | T-3 à T-6 | 31 | 71,6 | 475,4 |

- 3a-1c-1 porte aussi l'asynchrone des tests de T-4, T-5 et T-6 (l.375, 393-408, 458-472 : l'API change avec la VAE) ; ses mutants :
  M-E13 à M-E20, la table du G2 réancrée (37 rangs) et les 15 tueurs ; les six survivants du G2 le restent jusqu'à 3a-1c-2 (T-3 à T-6).

## Questions à l'orchestrateur (fermées, recommandation jointe)

- **Q-G1-1 (C-V-1 (a), É-G1-1)** : (a) garder la garde de segment (une ligne ; défensive contre un P rendu libre et contre un état hérité
  ou forgé) et tuer M-E20 par l'ancre forgée au-dessus d'une version due, le cas « fenêtre plus courte, arbre relu vert » étant remplacé
  par la forme constructible ; ou (b) la retirer avec M-E20 (code mort sur tout état légitime). **Recommandation : (a).** TB-16 (PC-6)
  est à réécrire par l'orchestrateur (hors périmètre) : « neutralisé : P fixé à 7 par le marcheur, `price_version_pending`, garde de
  segment ». `error_origin` proposé : validateur du cp-1 (l.58 non relue), orchestrateur (ratification).
- **Q-G1-2 (coupe)** : prendre 3a-1c-1 (218) puis 3a-1c-2 (31) ? **Recommandation : oui**, l'ordre de PC-1. Constat, sans demande de
  dérogation : ce compte est déjà en unités de `r25()` ; mesuré, il ne dépasserait pas ≈ 249 contre la borne 1 150 ; le facteur × 2,31
  calibre des estimations grossières, pas un décompte ligne à ligne (même lecture que R25-FACTOR-DRIFT-1) : à trancher par l'orchestrateur.
  Marge de 3a-1c-1 à 236 : 18 ; la même règle s'appliquera à son G1.
- **Q-G1-3 (F2P de 3a-1c-2)** : 3a-1c-2 ne porte que des épingles vertes à la base par construction (É-G1-4) : `red-proof.mjs` y rendra
  « refused: green at base » pour chacun des quatre tests et sortira 1 sans aucun F2P. **Recommandation** : décider avant sa mission que
  sa preuve est la mort des six survivants (G2-M1 à G2-M4, G2-M10, G2-M12, morts strictes) et consigner la sortie 1 de `red-proof`
  comme attendue (précédent : pli G7 de PR-1b-5a).
- **Q-G1-4 (DOJO-PUBLISH-TREE-PATHS-1, É-G1-3)** : la fermeture servie de l'éditeur gagne `dojo-verify.mjs` et `dojo-methods.ts` ;
  **Recommandation** : l'écrire dans l'objet de l'item (G1 de PR-3b-2), liste testée égale à la fermeture.
- **Q-G1-5 (T-8, É-G1-2)** : non-vacuité exigée des seuls fichiers qui portent le mot `import` ? **Recommandation : oui** (pas
  d'exception nommée ; « aucune exception » de la mission vise la liste interdite).
- **Q-G1-6 (É-G1-5)** : rattacher le renvoi `dojo-verify.test.ts:691` à DOJO-VERIFY-MERE-REFS-1 (renvois numérotés périmés, pli G7 de
  PR-1b-5b) ? **Recommandation : oui.**

## MAST et `error_origin` (proposés, assignés au G7)

- FM-1.1 (spécification non suivie) évité : le cas de T-2 contredit le marcheur ; aucun test contre la l.58 n'a été écrit ; Q-G1-1 formée.
  FM-3.2 et FM-3.3 : sans objet (aucun code). FM-2.2 : aucune valeur par défaut posée.
- É-G1-1 : validateur du cp-1 et orchestrateur ; écart 175 contre 249 : planificateur du G0 (T-2 non décomposé dans PC-1) ; É-G1-2 :
  planificateur du G0 (fermeture de T-8 écrite sans la non-vacuité) ; É-G1-3 à É-G1-5 : aucun (conséquences de D-C1 et des outils) ;
  J-1 (ci-dessous) : ce worker.

## Conduite

- Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `git write-tree` ni `merge-tree --write-tree` ; `git` en lecture seule, avec
  `--no-optional-locks`, `GIT_TERMINAL_PROMPT=0`, `< /dev/null` (`rev-parse`, `status`, `log`, `diff`) sur le worktree et sur `F:/Monark` ;
  aucun clone ; aucun test, harnais, oracle ni mutant lancé (C-V-4 sans objet) ; aucun réseau, aucun outil de recherche distant ; rien
  sur C: ; `F:/Monark` et son `node_modules` intouchés ; aucune jonction créée.
- Écritures : ce journal (seul fichier du worktree, par heredoc) ; hors dépôt :
  `F:/tmp/dojo/pr3a1c/sondes/` : `fix-journal-1.mjs` à `-8.mjs`, `byte-guard.mjs`, `rewrap.mjs`, `rewrap-2.mjs`
  (corrections de ce journal, sans barre inverse) ; `F:/tmp/dojo/pr3a1c-deliver/REPONSE.md` et `DELIVERED.sha256`.
- **J-1** : trois lignes de ce journal au-delà de 160 caractères à la première écriture, et trois renvois (`parseKiller`, `judgedOf`,
  compte des tests seulement asynchrones) écrits faux ; mesurés, corrigés par les sondes avant la remise.
  Sondes : `fix-journal-1.mjs` et `byte-guard.mjs` écrits avec des lignes de 163 à 182 caractères, repliés par `rewrap.mjs`,
  `rewrap-2.mjs` ; la première version de `rewrap.mjs` portait 12 barres inverses (guillemets échappés), vues par la garde d'octets
  après son exécution, réécrite en guillemets simples, mêmes remplacements, non relancée (en-tête) ; une première version de
  `fix-journal-4.mjs` portait une barre inverse, vue par la garde AVANT exécution, réécrite ; garde finale : 0 partout.
- **Advisor intégré, consultation 1** (après l'orientation, avant l'écriture) : É-G1-1 et sa forme constructible confirmées (le refus du
  vérificateur à l'ancre forgée prouve N3, jamais une complétion) ; garde de segment écrite pour EXIGER un `snapshot` (M-E19 et M-E20
  indépendants) ; mutants d'une ligne ; `TEMP` de `red-proof` sous `F:` ; non-vacuité de T-8 ; items Q-G1-4 et Q-G1-6 ; « la règle 236
  est mécanique : si le compte honnête dépasse, arrête et dis-le ». Conseil, jamais verdict ; chaque point vérifié sur pièce.
  **Consultation 2** (19:14Z, livrables écrits) : arrêt confirmé ; T-2 à décomposer (fait : 38, non 39, erreur d'addition de ma
  première écriture : 37 lignes plus le séparateur ; totaux 249 et 218) ; phrase de robustesse ; première ligne `# <modèle>` de
  `REPONSE.md` à déclarer (forme de la mission, tâche 7) ; marge de 3a-1c-1 à signaler. Suivis, vérifiés sur pièce.

## Reprise (G1 relancé, 2026-09-30) : section écrite AVANT tout code ; les sections du premier G1 ci-dessus restent intactes

- **Modèle résolu (R-1)** : `claude-opus-5-5`, effort max (mission), instance et contexte frais. Implémenteur G1 ; ne committe pas, ne
  lance aucun workflow (R-20).
- **Mission** : `F:/tmp/dojo/mission-g1r-pr3a1c.md` (19 738 octets), sha256 recalculé AVANT lecture (premier appel ; `date -u` suivant :
  19:21:51Z) = `8f75e02d5442f0524dcf409a90304ee3f9a74fee62d45885def3187b7ef9c544`, égal au reçu `F:/tmp/dojo/mission-g1r-pr3a1c.recu.json`
  (verdict `vert`, 12 codes à 0, base `ea70a43b`, head `3e341ac9`). Règles `docs/methode/REGLES-MISSION.md` (`12d5f2df…0335`), verbatim.
- **Worktree à l'ouverture** : HEAD `3e341ac91a71109f8ae89d3b56527d42f60caa1c`, branche `lot/dojo-pr3a1c` ; `status --porcelain`
  (`--no-optional-locks`) : `?? docs/G1-lot-dojo-pr3a1c.md` seul ; base..HEAD : `docs/G0-lot-dojo-pr3a1c.md` (A) et
  `docs/adr/ADR-DOJO-PR-3.md` (M), empreintes égales à la mission. Tronc `F:/Monark` : HEAD `fdfd74bc` = `5b298ad2` plus un commit de
  registres (`docs/CHANTIERS.md`, `docs/PASSATION.md`) ; outils de la mission inchangés (sha256 égaux). Fusions citées par la mission,
  ancêtres de `ea70a43b` (`merge-base --is-ancestor`) : `948d74c2` (PR-3a-1b), `5431b1f1` (PR-1b-4), `251b8802` (PR-1b-5a), `b5286fbc` (PR-1b-5b).
- **Livrables du premier G1 préservés** avant leur écrasement par cette reprise (cités par sha256 dans l'ADR l.404 et dans la mission) :
  copies à 19:43:16Z sous `F:/tmp/dojo/pr3a1c/premier-g1/` : ce journal à 217 lignes `84cc1554…d484`, `REPONSE.md` `56dc3565…6b4f`,
  `DELIVERED.sha256` `769cec95…174d`, égales aux originaux ; les 217 premières lignes de ce journal restent identiques à l'octet (`cmp` à la
  remise).
- **Horloge** (`date -u`) : 19:21:51Z (ouverture) ; 19:43:16Z (copies) ; 19:43:41Z (précontrôle testé) ; 19:46:17Z et 19:47:35Z (empreintes) ;
  19:49Z (début de cette section).

### Lu (reprise ; sha256 recalculés à 19:46:17Z et 19:47:35Z)

Mêmes entrées et mêmes empreintes que la table « Lu » du premier G1 ci-dessus (mission exceptée), sauf l'ADR, qui a reçu depuis les
réponses Q-G1-1 à Q-G1-6 ; en plus :

| Entrée | sha256 | Lecture |
|---|---|---|
| `docs/adr/ADR-DOJO-PR-3.md` (410 l.) | `266439fbd14d74834caf4935f0f5fc7a670e40329e7d5916d93573f747d6d813` | en entier ; réponses l.404-410 |
| `docs/G1-lot-dojo-pr3a1c.md` (premier G1, 217 l.) | `84cc15546b73c422a02d5660d64345c77b4950bb13ad6c5b579b60729d315484` | en entier |
| `F:/tmp/dojo/pr3a1c-deliver/REPONSE.md` (premier G1) | `56dc356542cc62e045fc15465c399d749bff9e85c787f03879ab542daf6e4b6f` | en entier |
| `F:/tmp/dojo/g2-pr3a1b/logs/proto-vbc.diff` (364 l.) | `d7cf2bc8e6128efd8702e4513dc19b6ad58d126e95dd94ea61eb4b5fde32dd1f` | en entier |
| `F:/tmp/dojo/g2-pr3a1b/mutants/run-1/RESULTS.json` | `348fcded12967fec5d44ef4ccdfa92d696985cdfad63f42a63a5642ab6b719e5` | 37 rangs, K1 à K15 |
| `F:/Monark/docs/G1-lot-dojo-pr1b5b.md` | `a82fac130e888cb2b6aaee75a57f5ac01b5d0dedcb73b78972a0d1b912fe6e41` | l.100-245, l.300-340 |
| `apps/dojo/scripts/dojo-verify-cli.mjs` | `2478c68575c996b7f80c57201d8f6be1f566f05f64f250393a503e9aabb2b99a` | l.1-40, imports |
| `apps/dojo/test/helpers/dojo-fixture.ts` | `2e9e04b79dc4e6755f81b2e390248d56bbeb1885a19e2a7e46c06e23ab9b7e1d` | l.1-80, aides |
| `eslint.config.mjs`, `lint-ratchet.json` | `c1c9ac9d…a74b`, `c2d5cab0…9769` | en entier (plafond 69) |
| `F:/tmp/dojo/drand-1a/mk-nm.ps1`, `rm-nm.ps1` | `d70d8aea…fbe4`, `b51b5d22…8749` | en entier |
| `F:/tmp/dojo/pr1b5b-corr/sondes/precheck.mjs`, `precheck-test.mjs` | `a4ee29bf…314a`, `55a3f947…81b2` | en entier (calques) |
| `F:/tmp/dojo/pr1b5b-corr/sondes/killers-check.mjs`, `mk-out-nm.mjs` | `b01e81c5…7e7c`, `7314a7e2…2f64` | en entier (calques) |

### Mesures avant code (sondes sous `F:/tmp/dojo/pr3a1c/reprise/`, lecture seule du dépôt)

- Précontrôle d'hôte `precheck.mjs` (`9c7d4389…9f04`, calque de celui du correcteur de PR-1b-5b) testé AVANT tout usage sur sept racines
  synthétiques : 7/7 PASS (`precheck-test.mjs` `38079244…1d69`, `precheck-test.log` `4e7618ed…9bc3`). Son propre code de sortie (0, 1, 2)
  est la garde, jamais un pipeline (leçon É-R-1 du précédent).
- Garde d'octets `byte-guard.mjs` (`60b9b253…7e32`, points de code) sur l'état de base : 0 TAB, 0 CR, 0 C0 hors LF, 0 DEL, 0 C1, LF final,
  aucune ligne au-delà de 160 dans les quatre fichiers du lot et dans ce journal ; barres inverses : module 14, `.d.mts` 0, test unitaire 53,
  e2e 9, journal 0 (référence des ajouts, justifiés un à un à la fin).
- Fermeture future de l'éditeur (`closure-probe.mjs` `59fb0aaf…8b65`, log `89adf70a…345c`) : regex et liste interdite de T-8 lues dans le
  test, les deux imports neufs ajoutés à la racine : 9 fichiers (les 7 du gel, `apps/dojo/scripts/dojo-verify.mjs`,
  `apps/dojo/src/dojo-methods.ts`), 0 jeton interdit ; `dojo-methods.ts` : 0 spécificateur, le mot `import` absent (`grep -c import` = 0) ;
  `dojo-verify-cli.mjs` hors de la fermeture, il porte le jeton `fetch(` de la liste.
- Test l.323 (`Opt`) : 156 caractères ; l.331 : 153 ; l.334 : 146 : l'option `offset` de T-1 exige des replis.
- `F:/Monark/node_modules` : 220 entrées, 11 liens `@monark` (référence de l'état « intact » de fin).

### Compte ascendant (tâche 1, AVANT tout code) : 249 corrigé à 253

Unité de `r25()` (insertions + suppressions ; une ligne modifiée compte 2), recompté sur la conception ci-dessous, fichier par fichier :

- `apps/dojo/scripts/dojo-publish.mjs` : **51** = en-tête l.1 (2) ; deux imports (2) ; `price_version_pending` en fin de l.26, 157 caractères
  (2) ; D-C2 (1) ; garde `price_version_pending` de `--anchor` (1) ; doc de `publishDay` (4) ; `async` (2) ; appel de la complétion (2) ;
  VAE du jour, version calculée avant l'engagement (4) ; `checked()` (8) ; `complete()` (8) ; `pending()` (9) ; `runCli` asynchrone (6).
- `apps/dojo/scripts/dojo-publish.d.mts` : **8** = doc et variante `completed` de `DayResult` (4) ; `Promise<DayResult>` (2) ;
  `Promise<number>` (2).
- `apps/dojo/test/dojo-publish.test.ts` : **189** = en-tête (2) ; `okA`, `refusesA` (4) ; T-7 (5) ; T-8 (11) ; aides de la partie 1b : `Opt`
  replié, `off`, `readInstants`, `read_rule`, `publish`, `versionOf` (14) ; asynchrone des corps existants, 24 lignes hors T-4 (48) ;
  T-4 (9) ; T-5 (4) ; T-6 (1) ; tueurs renumérotés, 12 lignes (24) ; T-1 (14) ; T-2 (38) ; T-3 (15).
- `test/dojo-publish-e2e.test.ts` : **5** = `okA` (1) ; `await okA` (2) ; tueur renuméroté (2).
- **Total 253** (premier G1 : 249 ; +4 : en-tête du test 2, doc des aides 1, `.d.mts` 1 ; les autres composants égaux). Estimation, jamais
  mesure : `r25()` tranche au gel. **Aucune coupe** (Q-G1-2) : 253 ≤ 547 (borne ascendante du G0) ; projection × 2,31 = 584,4 sous 1 150 ;
  arrêt seulement si `r25()` mesuré au gel dépasse 1 150 ou si le solde 1 150 − `r25()` passe sous 10.

### M-E20 : forme constructible (Q-G1-1 ; C-V-1 (a))

- Le cas « ancre neuve à `price_window_days` plus court » n'est pas constructible (`dojo-chain.mjs:58` exige 7 ; l'éditeur marche chaque
  ligne avant son engagement). Forme retenue : une ligne d'ancre signée par la clé de l'état, ajoutée à la main (hors `--anchor`, qui la
  refuserait `price_version_pending`) au-dessus d'une version due (arrêt synthétique entre le `snapshot` du jour 7 et sa `price_version`).
- **Avec la garde de segment** (rien n'est dû quand une ancre suit le dernier `snapshot`) : `--inbox` ne tente aucune complétion et rend
  `nothing_to_publish` (jour 9 : l'ancre à la main est datée du jour 8), rien d'écrit ; l'arbre servi est refusé par le vérificateur à la
  seq de l'ancre (`version_not_in_force`, « a segment closed with a price_version due », `dojo-verify.mjs:237`, N3 fail-closed).
- **Sans elle (M-E20)** : la complétion est tentée (fenêtre A+1..A+7 sous l'ancre à la main) et la VAE la refuse à sa propre seq
  (`price_version_mismatch`, fenêtre sur des jours au plus égaux au jour d'ancre, `dojo-verify.mjs:200-201`) : `line_refused` là où T-2
  attend un résultat ; le mutant rougit T-2 par assertion.

### Conception retenue (avant code)

- `pending(st, t, key)` : aucun `snapshot` ⇒ `null`, avant toute lecture d'ancre (M-E19 : sans ce cas, la première ancre lève faute
  d'ancre et le premier `--inbox` lève la `RangeError` nommée par PC-3) ; une ancre après le dernier `snapshot` ⇒ `null` (garde de
  segment, M-E20) ; sinon `versionAfter` sous la dernière ancre (`null` quand la version est présente).
- `checked(stateDir, st, cand, files)` (VAE, D-C1) : le vrai `verifyDojoServed` du cœur, sans trousseau fourni (`self_consistent_only`),
  sur `dirSource(public/)` plus une source en mémoire : `timeline.jsonl` = chronologie engagée puis candidates, `dojo/pubkey.json` dérivé,
  immuables candidats ; refus `line_refused`, détail `seq <n>: <raison> (<sous-contrôle>)`, rien d'écrit.
- `publishDay` : après `openState` et `history_missing`, complétion si une version est due (seule action du lancement, résultat
  `completed`, `dojo/publish: completed_price_version` sur stderr, M-E15, M-E16) ; sinon le jour : `snapshot` et `price_version`
  candidats vérifiés ENSEMBLE avant le premier ajout (M-E13, M-E14) ; engagement inchangé (`commitLine`, marcheur compris).
- `publishAnchor` : `read_rule` égal à `READ_RULE` en JSON canonique, sinon `anchor_malformed` détail `read_rule` (D-C2, avant
  `commitLine`, M-E18) ; `price_version_pending` tant qu'une version est due, après le rejeu idempotent (M-E17). `runCli` asynchrone ;
  modes de clé inchangés ; renvois `BOUNDS` et `ANCHOR_KEYS` (l.34-36) non touchés.

### Prédictions (écrites avant toute course)

- **red-proof** : 13 tests jugés ; admis (F2P) : T-1, T-2, T-7 (`dojo_publish_anchor_carries_the_read_rule`), T-8
  (`dojo_publish_imports_no_network_module`) ; épingles « vert à la base » par construction (9) : T-3, T-4, T-5, T-6, T-9 (e2e) et les
  quatre tests changés pour la seule attente (`..._snapshot_carries_beacon_and_reads`, `..._refuses_a_malformed_bundle`,
  `..._reads_the_bundle_with_its_check`, `..._same_bundle_twice_publishes_nothing`) ; 5 inchangés ; `ok` faux, sortie 1 par construction
  (précédent : pli G7 de PR-1b-5a) ; tirage de 3 tueurs parmi les 4 admis, chacun tué.
- **Mutants** : 37 rangs de `table-g2.json` réancrés (36 par numéro de ligne ; P-CLI-INBOX ré-exprimé, sa ligne gagnant `await`) ; 8 neufs
  M-E13 à M-E20, chacun avec son champ `test` ; 18 tueurs (les 15 existants, dont 13 renumérotés et 2 inchangés, `dojo-publish.mjs:15` et
  `layout.ts:94` ; 3 neufs : T-1 forme M-E13, T-2 forme M-E15, T-3 forme G2-M1) ; 63 mutants, 63 tués attendus ; les six survivants du G2
  tués par T-3 (G2-M1, G2-M2, G2-M4), T-4 (G2-M3), T-5 (G2-M10), T-6 (G2-M12).

## Fin de la reprise (tâches 2 à 7) : section close AVANT le lancement de l'oracle

### Code et tests (tâches 2 et 3) : décision → fichier → test → mutant

Gel du G1 = arbre de travail du worktree : `apps/dojo/scripts/dojo-publish.mjs` (380 l., `2350af49…4030`), `dojo-publish.d.mts` (35 l.,
`67181623…29fa`), `apps/dojo/test/dojo-publish.test.ts` (569 l., `d3f46e61…68d3`), `test/dojo-publish-e2e.test.ts` (130 l., `7da14280…5d77`).
Tests : T-1 `dojo_publish_never_commits_a_line_the_verifier_refuses`, T-2 `dojo_publish_completes_a_pending_price_version`, T-3
`dojo_publish_follows_the_last_anchor_after_a_re_anchor` (neufs, en fin de fichier) ; T-4 `…_price_version_needs_seven_valid_days`
(18 jours), T-5 `…_writes_immutables_before_the_line`, T-6 `…_refuses_a_seed_outside_the_anchor_chain`, T-7 `…_anchor_carries_the_read_rule`,
T-8 `…_imports_no_network_module` (étendus) ; T-9 `dojo_publish_to_verify_end_to_end` (asynchrone, inchangé sinon).

| Décision | `dojo-publish.mjs` | Test | Mutants |
|---|---|---|---|
| D-C1 : VAE du jour, `snapshot` et `price_version` vérifiés ensemble | l.237-238 ; `checked()` l.270-278 | T-1 | M-E13, M-E14 |
| D-C2 : `read_rule` = `READ_RULE`, `anchor_malformed` détail `read_rule` | l.23, l.166 | T-7 | M-E18 |
| D-C3 : reprise qui complète, seule action du lancement | l.196-197 ; `complete()` l.279-287 | T-2 | M-E15, M-E16 |
| garde `price_version_pending` de `--anchor` | l.28 (liste fermée), l.170 | T-2 | M-E17 |
| C-V-1 (a) : garde de segment (ancre à la main, Q-G1-1) | `pending()` l.267 | T-2 (copie f2) | M-E20 |
| piège PC-3 : aucun `snapshot` avant toute ancre lue | `pending()` l.266 | T-2, toute première ancre | M-E19 |
| C-V-1 (b) : forge interne au segment, complétion refusée | `complete()` l.283 | T-2 (copie f1) | M-E16 |
| C-G2-2 : le jour suivant un ré-ancrage | l.198-200 (inchangées) | T-3 | G2-M1, G2-M2, G2-M4 |
| C-G2-3 : seconde fenêtre à exactement la première + 7 | l.254 (inchangée) | T-4 | G2-M3 |
| C-G2-4 : immuable de `staging/` altéré avant la réparation | l.127 (inchangée) | T-5 | G2-M10 |
| C-G2-4 : ancre neuve au dernier jour d'historique | l.171 (inchangée) | T-6 | G2-M12 |
| T-8 : fermeture de 9 fichiers, `dojo-verify-cli.mjs` dehors | imports l.18, l.23 | T-8 | tueur l.15 (`node:dns`) |
| T-9 : TU-1c sous `publishDay` et `runCli` asynchrones | l.345, l.368, l.380 | e2e | tueur l.228 |

- Renvois `BOUNDS` et `ANCHOR_KEYS` (l.34-36 de la base, l.36-38 au gel : décalés par les deux imports, texte inchangé) non touchés ; modes de clé
  (`--rotate`, `--revoke`) inchangés ; `DOJO-VERIFY-CORE-NO-NET-1` (ADR l.362) : marque de fermeture laissée à l'orchestrateur (mission).
- Tueurs : 18 (15 existants : 13 renumérotés par `reanchor.mjs` `8b7b5234…4649`, par le texte complet de la ligne de base, unicité exigée ;
  `dojo-publish.mjs:15` et `layout.ts:94` inchangés ; 3 neufs) ; contrôle statique `killers-check.mjs` (règles de `killerProblem`) : 18 / 18.

### Courses, portes statiques, F2P (tâches 3 et 4)

- Clone `gel` : `git clone --no-local` du worktree (HEAD `3e341ac9`) sous `F:/tmp/dojo/pr3a1c/gel`, les cinq fichiers modifiés ou non
  suivis copiés (sha256 égaux), `node_modules` par `mk-nm.ps1` (220 entrées, 11 `@monark` vers le clone) ; chaque course gardée par le
  code de sortie de `precheck.mjs` (verrou libre, file vide, C-V-4 ; relevés `pre-*.json` sous `reprise/`), TEMP `F:/tmp/dojo/pr3a1c/tmp`.
- Course ciblée (19:58:18Z → 19:58:33Z) : les deux fichiers du lot, 18 / 18 verts (`reprise/run1.tap` `3ad19420…11c7`), T-1 à T-3 compris.
- Portes statiques sur le clone (19:58:46Z → 19:59:44Z) : `tsc --noEmit` 0 et ESLint des deux tests 0 (journaux vides) ; cliquet de lint
  69 / 69 (`bf35ba72…cfd8`) ; `lang-gate` OK (`b7247d5b…270f`) ; vocabulaire OK, 327 fichiers (`be797332…023a`) ; export OK (`08affca0…9f3f`).
- **F2P (tâche 4)** : `node F:/Monark/scripts/red-proof.mjs --base ea70a43b --gel F:/Monark-wt-dojo-pr3a1c --repo F:/tmp/dojo/pr3a1c/base`
  `--out F:/tmp/dojo/pr3a1c/f2p --draw 3 --seed 2026` (clone de base `--no-local`, détaché à `ea70a43b`, `node_modules` par `mk-nm.ps1`),
  20:00:18Z → 20:01:09Z, sortie 1. **`F:/tmp/dojo/pr3a1c/f2p/RED-PROOF.json`, sha256**
  **`a8fc9027dc724ff2b79cd6f3ba404cc91971775980faea63e6c2701b4ac5c1b1`** (digest du gel `ae360489…4c4e`) : 13 jugés, 5 inchangés ;
  **4 F2P** (rouges à la base par `ERR_ASSERTION`, verts au gel) : T-7, T-8, T-1, T-2 ; 9 refusés « vert à la base » : T-3, T-4, T-5,
  T-6, T-9 et les quatre tests changés pour la seule attente ; tirage (graine 2026, population 4) : 3 tueurs, tous **tués** par
  assertion, fichier restauré (sha256 avant = après) : `dojo-publish.mjs:15` (T-8), `:163` (T-7), `:197` (T-2). Conforme à la prédiction
  écrite avant la course ; la sortie 1 est l'effet des neuf épingles (précédent : pli G7 de PR-1b-5a).
- Causes à la base (`f2p/base.tap` `65bb4e9c…7914`) : T-7 « anchor_malformed » (sans D-C2, le cas `read_offset_s` 901 rend
  `line_refused`) ; T-8 fermeture sans `dojo-verify.mjs` ; T-1 « Missing expected rejection. » ; T-2 « Missing expected exception:
  price_version_pending ».

### Mutants (tâche 5)

- Commande (outil du tronc `2606e7da…3b19`) : `node F:/Monark/scripts/mutants/run.mjs --repo F:/tmp/dojo/pr3a1c/gel --base ea70a43b`
  `--out F:/tmp/dojo/pr3a1c/mutants --table F:/tmp/dojo/pr3a1c/mutants-table.mjs --killers --file apps/dojo/scripts/dojo-publish.mjs`
  `--targets apps/dojo/test/dojo-publish.test.ts,test/dojo-publish-e2e.test.ts --lock-root F:/tmp --min-free-mb 4096` ; `node_modules`
  du dossier de sortie par `mk-out-nm.mjs` (`497ae0ad…8492` ; 218 jonctions, 1 fichier, 11 `@monark` vers `<out>/clone`, jamais vers
  `F:/Monark`) ; au lancement (20:04:14Z) : `held(F:/tmp)` nul, file vide, 11 124 Mo physiques et 27 124 Mo virtuels libres, 10 `node.exe` ;
  aucune autre course ni aucun oracle pendant la campagne. Clone de l'outil : gel `3e341ac9`, `sha0` du module `2350af49…4030` (= worktree).
- Table : `F:/tmp/dojo/pr3a1c/mutants-table.mjs` (`7497b89e…58b6`), enveloppe de `table-g2.json` (sha256 `bb9f4272…7b51` vérifié à
  l'import, jamais recopié) : 37 rangs du G2 réancrés par le texte complet de leur ligne de base (unicité exigée ; P-CLI-INBOX ré-exprimé
  `mode === "--inbox" ? await publishDay(` vers `false ? await publishDay(`), puis M-E13 à M-E20, chacun avec son champ `test` ;
  `--killers` ajoute les 18 lignes `// killer:` (K1 à K18).
- **`F:/tmp/dojo/pr3a1c/mutants/RESULTS.json`, sha256 `7371388d16617265481aa02fd4784aa12bc0a00439c1381e06cb090414d462bc`** (`RESULTS.txt`
  `132d0f1c…640a`), 20:04:53Z → 20:16:22Z : outil `2606e7da…3b19` (arbre d'outil `66ff2415`, propre) ; ligne de base verte (6 fichiers,
  58 tests, 66 s) ; **63 mutants, 63 tués**, 0 survivant, 0 non conclu, 0 ancre perdue, sortie 0 ; 44 morts strictes (un seul échec,
  `ERR_ASSERTION`) ; les 19 autres rougissent plusieurs tests, chaque échec par `ERR_ASSERTION` (codes relus dans `tap/`), sauf un :
  P-SERVEMOVE, 6 échecs par assertion et 1 `ENOENT` (`…_snapshot_carries_beacon_and_reads` lit un immuable que le mutant ne sert plus).
- Les six survivants du G2 de 3a-1b sont tués : G2-M2 (T-3), G2-M3 (T-4), G2-M10 (T-5), G2-M12 (T-6), morts strictes ; G2-M1 et G2-M4
  par T-3 et T-2 (deux rouges). Neufs : M-E13 et M-E14 par T-1 ; M-E15 à M-E17, M-E19 et M-E20 par T-2 ; M-E18 par T-7 ; morts strictes
  (leur « 1 vert » est l'entrée de niveau fichier de l'e2e, dont aucun test ne passe le filtre de nom : `tap/M-E13.tap`). Tueurs K1 à K18 :
  18 tués, stricts.
- **R-25 (tâche 6)** : `r25()` exporté de `F:/Monark/scripts/oracle/r25.mjs` (`4d0544df…7cf0`), par `reprise/r25-measure.mjs`
  (`1d2a4594…cd59`), sur `F:/tmp/dojo/pr3a1c/r25clone` (clone `--no-local` du worktree, cinq fichiers copiés à sha256 égal, commit de gel
  local `16d29c75`, parent `3e341ac9`) : **188 insertions, 66 suppressions, 254** (porte CI 1 205 ; borne de coupe 1 150, solde 896 ≥ 10) ;
  contenu 0 ; `GREEN` (`reprise/r25.log` `3e83cb65…81a8`). Contre le compte ascendant de 253 : module 53 (51), `.d.mts` 9 (8), test
  unitaire 187 (189), e2e 5 (5). Aucune coupe.
- **Tronc** : `F:/Monark` est passé de `fdfd74bc` à `22d1b9c8` pendant la reprise (registres et fusion de PR-4c-1b) : aucun fichier du lot
  ni de ses imports touché (`diff --name-only ea70a43b 22d1b9c8`) ; seuls les deux tests du lot importent l'éditeur (`git grep` au
  `22d1b9c8`) ; outils de la mission inchangés (sha256 égaux à 20:13Z).
- Renvoi numéroté (Q-G1-6, DOJO-VERIFY-MERE-REFS-1) : `dojo-verify.test.ts:691` cite « dojo-publish.test.ts:189-205 » ; T-8 est au gel
  l.194-213.

### MAST (risque résiduel) et `error_origin` (proposés, assignés au G7)

- FM-1.1 (spécification non suivie) : chaque décision de PC-0 et de C-V-1 a sa ligne, son test et son mutant (table ci-dessus) ; seul
  écart de forme : P-CLI-INBOX ré-exprimé (sa ligne gagne `await`), déclaré. FM-1.4 : les 217 lignes du premier G1 intactes (`cmp`).
- FM-2.2 (valeur par défaut) : `offset` 1800 est une entrée de test SYNTHÉTIQUE (T-1), jamais une valeur du protocole.
- FM-3.2 (vérification absente) : F2P, 63 mutants par l'outil du tronc, oracle G1 après la clôture de ce journal.
- FM-3.3 (vérification incorrecte) : la VAE hérite de tout défaut du vérificateur qu'elle appelle (TB-14) : parade inchangée, item
  DOJO-VERIFY-INDEPENDENT-1 (PC-7). TB-15 (coût de la VAE, lecture complète de l'arbre à chaque lancement) : mesure bornée ici (18 tests
  du lot en 15 s), DOJO-PUBLISH-SCALE-1 inchangé.
- `error_origin` : É-G1-1 à É-G1-5 : ceux du premier G1 (ci-dessus) ; compte 249 contre 253 : ce worker (recompte d'une conception) ;
  J-1 à J-5 ci-dessous : ce worker.

### Questions à l'orchestrateur (fermées, recommandation jointe)

- **Q-G1-7** (consommateurs du statut neuf `completed`) : la minuterie de publication de PR-3b-2 et le RUNBOOK-dojo lisent-ils `completed`
  (sortie 0, une ligne JSON) comme un lancement réussi, le jour suivant partant au créneau suivant (PC-3, « un jour par lancement ») ?
  **Recommandation : oui**, à écrire dans l'item RUNBOOK-dojo de PC-7 (G1 de PR-3b-2) à côté des STOP `line_refused` et
  `price_version_pending`.
- **Q-G1-8** (épingles du F2P) : les neuf refus « vert à la base » de `red-proof.mjs` (sortie 1) sont-ils admis comme épingles par
  construction, la preuve de T-3 à T-6 étant la mort des six survivants du G2 (campagne ci-dessus) ? **Recommandation : oui** (précédent :
  pli G7 de PR-1b-5a).

### Conduite

- Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `git write-tree` ni `merge-tree --write-tree` ; dans le worktree et dans `F:/Monark`,
  git en lecture seule sous `--no-optional-locks` et `GIT_OPTIONAL_LOCKS=0` (`rev-parse`, `status`, `diff`, `log`, `show`,
  `merge-base --is-ancestor`) ; git écrivant seulement dans mes clones `--no-local` `gel`, `base`, `r25clone` (clone, extraction détachée ;
  commit de gel local dans `r25clone` seul) et dans ceux des outils. Aucun commit du lot, aucun workflow (R-20) ; aucun réseau, aucun outil
  de recherche distant ; rien sur C: ; `F:/Monark` et son `node_modules` jamais modifiés.
- Écritures dans le worktree : les quatre fichiers du lot (outil d'édition ; `reanchor.mjs` pour les chiffres des tueurs) et ce
  journal (ajouts par `cat >>` de morceaux contrôlés par la garde d'octets). Barres inverses ajoutées : module 3, test unitaire 2,
  toutes des échappements de saut de ligne dans des chaînes ou des gabarits ; aucune ailleurs ; fichiers créés : 0 (garde sur chacun).
- **J-1** : `reanchor.mjs` v1 portait une ligne de 170 caractères (garde d'octets) ; exécuté une fois à blanc (`reanchor-dry.log`
  `285c1727…183e`, aucune écriture), replié avant l'exécution `--write` (v2 `8b7b5234…4649`) ; le repli passait par une commande `node -e`
  dont la chaîne entre apostrophes portait des guillemets échappés par barre inverse (hors heredoc) : fichier résultant à 0 barre inverse ;
  de même, deux commandes PowerShell passées par Bash échappaient `$` par une barre inverse (hors heredoc, sans chemin).
- **J-2** : `gen-table.mjs` v1 portait 2 barres inverses (guillemets échappés dans le heredoc) et une ligne de 170, vues par la garde
  AVANT exécution, retirées par un correctif sans barre inverse ; la v1 corrigée, exécutée une fois, a écrit une table à 3 lignes au-delà
  de 160 (jamais passée à l'outil) ; régénérée par `gen-table-v2.mjs` (`22a87d48…5d3d`), dont l'en-tête, mangé par un `sed`, fut réparé
  avant exécution ; table finale `F:/tmp/dojo/pr3a1c/mutants-table.mjs` `7497b89e…58b6` (0 barre inverse, aucune ligne au-delà de 160).
- **J-3** : le premier morceau de la section « Reprise » portait une heure écrite d'avance (19:52Z) contre l'horloge lue (19:49:06Z) ;
  corrigé avant son ajout au journal.
- **J-4** : un brouillon de ce § portait 2 barres inverses (une séquence d'échappement citée en toutes lettres, dans un heredoc), puis une
  ligne de 170 : corrigés hors dépôt avant l'ajout, par un script qui construit le motif sans barre inverse.
- **J-5** : `closure-probe.mjs` (cité dans « Reprise », `59fb0aaf…8b65`) porte 3 lignes au-delà de 160 (169, 178, 231) : exécuté vers
  19:45Z sans passer par la garde, vu à 20:09Z ; gardé tel quel (empreinte citée) ; `closure-probe-v2.mjs` (`1de82040…87da`, replié, même
  logique) rejoué à 20:17Z, en mode base et en mode courant (deux journaux égaux, `308f6ee5…0f4f`) : même sortie que la v1, sauf
  `dojo-publish.mjs specs=9` devenu `specs=11` (les deux imports, réels depuis le code).

### Jonctions, advisor, oracle (tâche 6), clôture

- **Jonctions** : retirées à 20:17:55Z par `rm-nm.ps1` (`node_modules` des clones `gel` et `base` et du dossier des mutants) ;
  `F:/Monark/node_modules` : 220 entrées et 11 liens `@monark` avant (19:43Z) et après (20:17:55Z) ; `F:/tmp/dojo/pr3a1c/mutants/clone`
  gardé (cité par `RESULTS.json`).
- **Advisor intégré** : consultation 1 après l'orientation, avant toute écriture : plan confirmé ; contrôles suivis (copies du premier G1,
  prédictions écrites avant les courses, mesures recalculées, D-C2 avant `commitLine`, `dojo/pubkey.json` en mémoire gardé pour M-E14,
  M-E19 tué par la première ancre, verdict du vérificateur asserté sur la forge f1, ESLint et cliquet avant les courses coûteuses,
  réancrage par texte complet et contrôle statique des tueurs, champ `test` des rangs neufs, oracle en arrière-plan sous
  `GIT_OPTIONAL_LOCKS=0`, précontrôle avant chaque course, garde d'octets, ordre final). Consultation 2 : après la clôture de ce journal,
  avant l'oracle ; son avis est rendu dans `REPONSE.md`. Conseil, jamais verdict ; chaque point vérifié sur pièce.
- **Oracle (tâche 6)** : `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-dojo-pr3a1c --base ea70a43b --key PR-3a-1c`
  (outil du tronc `f22b9045…a41b`), lancé APRÈS la clôture de ce journal, en arrière-plan, sous `GIT_OPTIONAL_LOCKS=0`, jamais interrompu,
  verrou libre et file vide au lancement ; l'enregistrement (chemin, sha256, `exit`, portes, suite, R-25 de `r25()`, `tree.object`) et le
  sha256 de ce journal au lancement sont cités dans `F:/tmp/dojo/pr3a1c-deliver/REPONSE.md`, avec le verdict du lot, qui en dépend.
- **Journal clos à 20:19:01Z** : aucune écriture dans le worktree après cette ligne ; l'arbre gelé est celui de l'enregistrement d'oracle.

## Corrections post-G2 (correcteur, 2026-09-30) : section ajoutée après la clôture du G1 (l.477), les lignes au-dessus restent intactes

- **Rédacteur** : correcteur `claude-opus-5-5` (R-1), effort max, instance et contexte frais (ni le générateur G1, ni le relecteur G2) ;
  ne committe pas, ne lance aucun workflow (R-20).
- **Mission** : `F:/tmp/dojo/mission-corr-pr3a1c.md` (68 l.), sha256 `92991e1b37a6b981ab065265550802074090d0cdef3100cc9557242ff2a0866e`,
  recalculé AVANT lecture (`date -u` suivant : 21:41:55Z), égal au reçu `F:/tmp/dojo/mission-corr-pr3a1c.recu.json` (verdict `vert`, douze
  codes à 0, base `ea70a43b`, head `1720a95a`) ; lue en entier, règles `docs/methode/REGLES-MISSION.md` (`12d5f2df…0335`) verbatim.
- **Entrées lues en entier, dans l'ordre de la mission** (sha256 recalculés entre 21:43Z et 21:49Z) : rapport G2
  `F:/tmp/dojo/g2-pr3a1c/G2-report.md` (402 l., `f3b53de9…5208` ; §3.8, §5.2, §7 compris) ; sondes
  `F:/tmp/dojo/g2-pr3a1c/proto/apps/dojo/test/g2-probes.test.ts` (`08853fe0…41fb` ; P-B l.155-170, P-H l.225-248) ; table
  `F:/tmp/dojo/g2-pr3a1c/mutants-g2-table.mjs` (`910a6643…3e6c`, 17 rangs) ; ce journal (477 l., `265b90ed…97f0`) ; la dernière ligne datée
  de `docs/adr/ADR-DOJO-PR-3.md` (21:4x UTC, l.412-419 ; fichier `26867874…99b7`) ; `apps/dojo/test/dojo-publish.test.ts` (569 l.,
  `d3f46e61…68d3`) ; `apps/dojo/scripts/dojo-publish.mjs` (380 l., `2350af49…4030`) ; `F:/Monark/scripts/red-proof.mjs` (`6579b550…ab36`,
  `parseKiller` l.46-49). Hors liste, lus pour agir sur pièce : les outils du tronc `mutants/run.mjs` (`2606e7da…3b19`), `oracle/run.mjs`
  (`f22b9045…a41b`), `oracle/r25.mjs` (`4d0544df…7cf0`), `oracle/lock.mjs` (`501a76b5…33bb`), en entier ; `mk-nm.ps1`, `rm-nm.ps1` ;
  `apps/dojo/scripts/dojo-publish.d.mts` ; la section 16 de `docs/G1-lot-dojo-pr4c1b.md` du tronc et les outils de son correcteur (calques).
- **Worktree à l'ouverture** (21:42Z) : HEAD `1720a95a` (gel 1 `ca929381` plus la ligne datée de 21:4x UTC), branche `lot/dojo-pr3a1c`,
  `status --porcelain` vide ; les sept chemins base..HEAD aux sha256 de la mission. Tronc `F:/Monark` : HEAD `19227ec0` = `e0d9a723` (celui
  du générateur de la mission) plus un commit de registres (`docs/CHANTIERS.md`, `docs/FILE-ATTENTE-2026-09-28.md`, `docs/PASSATION.md`) ;
  aucun fichier du lot ni de ses imports changé depuis `ea70a43b` ; outils de la mission aux sha256 de la mission.
- **Hôte** (21:49:23Z) : verrou `F:/tmp/oracle-lock` absent, file vide ; 8 `node.exe`, 14 911 Mo physiques et 31 382 Mo virtuels libres.

### Compte prévu (écrit à 21:59Z, AVANT toute édition du worktree)

Unité R-25 (insertions + suppressions de `r25()` ; une ligne modifiée compte 2). Un seul fichier compté : `apps/dojo/test/dojo-publish.test.ts`
(ce journal est hors pathspec, `ci.yml:82`). Module inchangé (décision) : aucune ligne de `apps/dojo/scripts/**` ni de `apps/dojo/src/**`.
Éditions écrites en spécifications `F:/tmp/dojo/pr3a1c-corr/tools/edits/e1.txt` à `e4.txt`, appliquées par `tools/apply.mjs` (ancre
exigée une seule fois) ; essai à blanc sur le worktree (rien écrit) puis prototype sur le clone `verts` (hors worktree) : 19/19 verts,
21:57:52Z → 21:58:04Z (`logs/proto-run1.tap` `80a4ea8c…c864`).

| Constat | Édition (lignes du gel) | + / − | Compte |
|---|---|---|---|
| C-G2-2 | T-7 l.111 : requête de la CLI en JSON canonique, `canonical(req)` (importé l.17) | +1 / −1 | 2 |
| C-G2-4 | T-7, après l.108 : un refus D-C2 lu avec son détail `read_rule` | +2 | 2 |
| C-G2-4 | T-2 l.530-532 : espion de stderr autour de la reprise ; `published_at` et stderr dans l'assertion | +8 / −3 | 11 |
| C-G2-3 | test neuf après T-3 : ligne vide, tueur `:265`, déclaration, 15 lignes de corps, fermeture | +19 | 19 |

- **Total prévu : 30 insertions, 4 suppressions = 34** ; fichier 569 → 595 lignes (essai à blanc) ; R-25 attendu 254 + 34 = 288 ≤ 1 150,
  solde attendu 862 ≥ 10.
- Barres inverses : +1 au test (55 → 56), l'échappement du saut de ligne dans l'attendu stderr de T-2 (même nature que les deux du G1).

### Prédictions (écrites avant toute course officielle)

- **Tests** : 19 sur les deux fichiers du lot (18 du gel 1 plus le test neuf), tous verts.
- **F2P** (`red-proof`, `--draw 3 --seed 2026`) : 14 jugés (les 13 du G1 plus le test neuf), 5 inchangés ; 5 F2P (T-7, T-8, T-1, T-2 et le
  test neuf : la base rend `nothing_to_publish` à la reprise) ; les neuf épingles de Q-G1-8 refusées « vert à la base » ; sortie 1.
- **Mutants, table du G2 `--only` les cinq** : G2C-RRJSON et G2C-RRDETAIL tués par T-7, G2C-PUBAT et G2C-STDERR par T-2, morts strictes.
  **G2C-FIRSTSNAP : « survit » au premier passage**, car son rang nomme T-2 (`test: T2`) et l'outil ne lance d'abord que ce test (motif de
  nom), que ce mutant ne distingue pas (aucun ré-ancrage avant la version due de T-2) ; le rejeu des deux fichiers entiers le tue par le
  test neuf ; statut du rang « survit », sortie 1. Le tueur `:265` du test neuf porte la même mutation (ligne 265 mutée identique à l'octet) :
  la campagne `--killers` le tue par le test neuf ; une campagne complémentaire sur une table dérivée (seul le champ `test` de ce rang
  remplacé, table du G2 importée, jamais recopiée) en donne la mort stricte. Question formée : Q-C-1 (fin de section).

### Corrections faites (21:59:32Z), puis correction → ligne → test → mutant

- Chemins courts : `tools/…`, `logs/…`, `f2p/…`, `mutants/…` sont relatifs à `F:/tmp/dojo/pr3a1c-corr/`.
- `tools/apply.mjs` (`f19d3756…bcd2`) `--write` avec `tools/edits/e1.txt` à `e4.txt` (`5defbbeb…3789`, `15bbfeb5…1372`, `67d4042e…245d`,
  `58a0f5c1…37ce`) : `apps/dojo/test/dojo-publish.test.ts` `d3f46e61…68d3` → `2ba9d543f4e1877ff7469e012510f8f8d287eb718db0853243be87f94bfd8007`
  (569 → 595 lignes), égal à l'octet au prototype de `verts` ; `git diff --numstat HEAD` (`--no-optional-locks`) : test `30 4` (= compte
  prévu), ce journal ajout pur (ses 477 premières lignes gardent `265b90ed…97f0`) ; module `2350af49…4030` inchangé. Garde d'octets du test :
  0 TAB, 0 CR, 0 contrôle, aucune ligne au-delà de 160, fin LF ; barres inverses 55 → 56 (celle prévue).
- T-C3 = `dojo_publish_completes_a_price_version_due_after_a_re_anchor` (étiquette de ce journal ; « T-10 » désigne déjà un test de la mère).

| Constat | Lignes (fichier corrigé) | Test | Mutants tués (campagnes A, B, C ci-dessous) |
|---|---|---|---|
| C-G2-2 | l.113 `writeFileSync(q, canonical(req));` | T-7 (l.88) | G2C-RRJSON (A, C) |
| C-G2-4 | l.109-110 : un refus D-C2 lu avec son détail `read_rule` | T-7 | G2C-RRDETAIL (A, C) |
| C-G2-4 | l.532-539 : espion de stderr ; `published_at` et stderr dans l'assertion | T-2 (l.520) | G2C-PUBAT, G2C-STDERR (A, C) |
| C-G2-3 | l.577-595 : test neuf, tueur l.578 (`dojo-publish.mjs:265`) | T-C3 (l.579) | G2C-FIRSTSNAP (rejeu de A ; C) ; K18 (B) |

- **C-G2-2** : la requête que lit la CLI est écrite en JSON canonique (toutes les clés triées, celles de `read_rule` comprises), la forme des
  outils du dépôt ; `canonical` vient de l'import l.17 (`apps/bell/scripts/bell-chain.mjs`), jamais une copie. Au gel, l'assertion `yes`
  (l.118-119 : sortie 0, `anchored`) reste verte ; sous G2C-RRJSON elle voit `[1, undefined, undefined]`. La clé est chargée avant la
  lecture de la requête (`key: load(KEY)` précède `readRequest` dans le littéral, module l.369) : `no` et `near` ne changent pas.
- **C-G2-4, T-7** : un refus D-C2 (`read_offset_s` 901) lu avec son code ET son détail (`x.detail === "read_rule"`), placé avant le constat
  « rien d'écrit » (`readdirSync(e)`), qui le couvre ; sous G2C-RRDETAIL, l'assertion l.109 rougit (message `C-G2-4: D-C2 names read_rule`).
- **C-G2-4, T-2** : idiome du dépôt (`apps/bell/test/bell-keys.test.ts:196-198` : `process.stderr.write.bind(process.stderr)`, affectation
  typée) ; restauration par `.finally` de la promesse, donc aussi sur rejet ; l'assertion de la reprise porte en plus `pv?.published_at`
  (= `new Date(slot(A + 7)()).toISOString()`) et la liste des écritures sur stderr : une seule, `dojo/publish: completed_price_version` suivie
  d'un saut de ligne. Sous G2C-PUBAT : `2026-09-20T00:30:00.000Z` au lieu de `2026-09-19T00:30:00.000Z` ; sous G2C-STDERR : `[]`.
- **C-G2-3, T-C3** : P-H rejouée dans l'idiome du fichier : premier `snapshot` (A+1), ré-ancrage à A+2 sur une graine neuve
  (`{ ...request(), ...second }`, comme T-3), sept jours valides A+3 à A+9 sur la seconde chaîne, arrêt synthétique au second ajout de A+9
  (sa `price_version`), reprise `completed` seq 12, fenêtre A+3 (2026-09-14), effet A+10 (2026-09-21), arbre vert sous trousseau fourni ;
  puis A+10 publié, son `snapshot` nomme la version 1, arbre vert. Sous la mutation de la l.265 (`L.findLastIndex(` → `L.findIndex(`) :
  reprise `nothing_to_publish`, dernière ligne `snapshot` (même effet que P-H sous G2C-FIRSTSNAP au G2).

### Mesures (tâches 3 à 6)

Clone `verts` (`git clone --no-local` du worktree, détaché à `1720a95a`, arbre `5f0f5a1b`) portant le test corrigé et ce journal à son état
de 21:59:31Z (`729ac919…df2b1`), copiés à sha256 égal ; `node_modules` par `mk-nm.ps1` (220 entrées, 11 `@monark` vers le clone). Garde
d'hôte `tools/gate.mjs` (`8ff737f7…c868` ; testée : racine libre 0, racine tenue 3) et C-V-4 `tools/cv4.ps1` (`4c2a8afa…5ccf`,
`Get-CimInstance`) relus libres et verts avant CHAQUE lancement ci-dessous ; TEMP, TMP, TMPDIR = `F:/tmp/dojo/pr3a1c-corr/tmp`.

- **Tests** : les deux fichiers du lot, seuls consommateurs de l'éditeur (liste du rapport G2, §3.7, recontrôlée par `git grep` dans `verts` :
  `dojo-verify.test.ts:691` ne le cite qu'en commentaire) : **19/19 verts**, 22:00:08Z (`tools/run-tests.mjs` `4b53d662…1765` ;
  `logs/verts-lot.tap` `85687dcf…5fb8`). T-8 est désormais l.196-215 (l.194-213 au gel 1 ; renvoi de DOJO-VERIFY-MERE-REFS-1).
- **Portes statiques** (`tools/static-gates.mjs` `0d72cda9…e385`, commandes node des scripts, jamais `npm`), 22:00:36Z → 22:01:23Z :
  `typecheck` 0 et `lint` (`eslint .`) 0, journaux vides ; `lint:ratchet` 69/69 (`bf35ba72…cfd8`) ; `lang:gate` OK (`b7247d5b…270f`) ;
  `export:check` OK (`08affca0…9f3f`) : 5/5 à 0 ; ces trois journaux ont les sha256 complets de ceux du G1 (recalculés à 22:16:25Z :
  `F:/tmp/dojo/pr3a1c/reprise/gate-ratchet.log`, `gate-lang.log`, `gate-export.log` ; `logs/static-vs-g1.txt`).
- **F2P** : `node F:/Monark/scripts/red-proof.mjs --base ea70a43b --gel F:/Monark-wt-dojo-pr3a1c --repo F:/tmp/dojo/pr3a1c-corr/base`
  `--out F:/tmp/dojo/pr3a1c-corr/f2p --draw 3 --seed 2026` (clone `base` `--no-local` détaché à `ea70a43b`, jonctions par `mk-nm.ps1`),
  22:01:49Z → 22:02:32Z, sortie 1 (prédite). **`f2p/RED-PROOF.json` sha256 `bf89ed42d4100932ee3b3c25dfda5dcd26ffe98974b8075e893b46bdde278c8d`**
  (condensé du gel `05dd1e94…b861`) : 14 jugés, 5 inchangés ; **5 F2P**, rouges à la base par `ERR_ASSERTION`, verts au gel : T-7, T-8, T-1,
  T-2 et **T-C3** (à la base, l'assertion de la reprise, l.591, voit `nothing_to_publish` et une dernière ligne `snapshot` : l'arrêt au second
  ajout a eu lieu, la base ne complète pas) ; les neuf épingles de Q-G1-8 refusées « vert à la base » ; T-2 et T-7 gardent leur cause du G1
  (« Missing expected exception: price_version_pending » ; `anchor_malformed`) ; tirage graine 2026, population 5 : `:238` (T-1), `:163`
  (T-7), `:197` (T-2) tués, fichier restauré ; `:265` non tiré (tué par la campagne B).
- **Mutants** : outil du tronc `F:/Monark/scripts/mutants/run.mjs` (`2606e7da…3b19`, arbre d'outil `19227ec0`, `tool_dirty` nul), `--repo` =
  `verts` (gel `1720a95a`, `dirty` `110aab2a…3fcb`), `--base ea70a43b`, `--file apps/dojo/scripts/dojo-publish.mjs`, `--targets` les deux
  fichiers du lot, `--lock-root F:/tmp`, `--min-free-mb 4096` ; `<out>/node_modules` par `tools/mk-out-nm.mjs` (`261b5233…39b3`, calque de
  celui du G2 : 218 jonctions, 1 fichier, 11 `@monark` vers `<out>/clone`, jamais vers `F:/Monark`) ; au moins 31 197 Mo virtuels libres à
  chaque lancement ; aucune autre course ni oracle pendant ; chaque `RESULTS.txt` relu avant la campagne suivante ; dans chaque
  `<out>/clone`, test corrigé (`2ba9d543…`) et module (`2350af49…`) relus après la campagne.
  - **A, littérale (commande de la mission)** : `--table F:/tmp/dojo/g2-pr3a1c/mutants-g2-table.mjs` (`910a6643…3e6c`) `--only G2C-RRJSON,`
    `G2C-FIRSTSNAP,G2C-PUBAT,G2C-STDERR,G2C-RRDETAIL`, `--out mutants/g2-five`, 22:03:37Z → 22:04:18Z, ligne de base verte (19 tests).
    **`mutants/g2-five/RESULTS.json` sha256 `25439316584877ecf78f310266ee29997aea55be87ea780bb186e208d67e62d4`** : **4 tués sur 5**, morts
    strictes (G2C-PUBAT, G2C-STDERR par T-2 ; G2C-RRJSON, G2C-RRDETAIL par T-7) ; **G2C-FIRSTSNAP « survit » au premier passage** (T-2 seul,
    que son rang nomme) ; **rejeu des deux fichiers entiers : tué par T-C3 seul** (1 rouge, 18 verts) ; sortie 1, comme prédit (Q-C-1).
  - **B, `--killers`**, `--out mutants/killers`, 22:04:38Z → 22:05:49Z, ligne de base verte (59 tests, 6 fichiers : ceux du lot et les
    importeurs de `layout.ts`). **`mutants/killers/RESULTS.json` sha256 `84ad5570cb54541869601bad958bf3a77dee37aa8823a9399ba89928e9fc91a6`** :
    **19/19 tués, 19 morts strictes**, sortie 0 (K1 à K18 : les tueurs du test unitaire dans l'ordre du fichier ; K19 : celui de l'e2e) ;
    **K18 = `:265`, tué par T-C3** ; sa ligne 265 mutée est identique à l'octet à celle de G2C-FIRSTSNAP (`s = L.findLastIndex(` devient
    `s = L.findIndex(` dans les deux cas ; comparaison faite par programme).
  - **C, complément (jamais substitut de A)** : table dérivée `F:/tmp/dojo/pr3a1c-corr/mutants-derived-table.mjs` (`578dc6fa…095e`), qui
    IMPORTE la table du G2 et ne remplace que le champ `test` de G2C-FIRSTSNAP par T-C3 (mesuré : 17 rangs contre 17, un seul champ
    différent) ; même `--only`, `--out mutants/g2-five-derived`, 22:06:19Z → 22:06:46Z. **`mutants/g2-five-derived/RESULTS.json` sha256
    `dcca7b2c9f6eac6239a2aced54d4e1d61ed19badc064a32ca4c8f644b333825b`** : **5/5 tués, morts strictes**, sortie 0.
- **R-25 (mesure préalable)** : `r25()` du tronc (`tools/r25-run.mjs` `90431b1f…9724`) sur `r25clone` (clone `--no-local`, test et journal
  copiés à sha256 égal, commit de gel local `07ad1962`, parent `1720a95a`), 22:07:16Z : **215 insertions, 67 suppressions = 282**, `GREEN`
  (porte CI 1 205 ; borne de coupe 1 150, **solde 868** ≥ 10) ; test unitaire 162/53. Écart au compte prévu (288) : les 3 lignes de T-2 que
  e3 remplace étaient des insertions du G1 (T-2 est neuf dans le lot) ; contre la base, elles annulent 3 insertions au lieu de compter
  3 suppressions : 34 − 6 = **28** (254 → 282). Compte officiel du tour : la porte `r25` de l'oracle, citée dans `REPONSE.md`.

### Question à l'orchestrateur (fermée, recommandation jointe)

- **Q-C-1 (critère « cinq tués » de la tâche 5)** : le rang G2C-FIRSTSNAP de la table du G2 nomme T-2 (`test: T2`) ; l'outil lance d'abord le
  seul test nommé et ne rejoue les fichiers entiers qu'à titre d'information (le statut du rang est celui du premier passage) ; T-2 n'a aucun
  ré-ancrage avant sa version due et ne distingue pas ce mutant. Avec l'option principale de la décision (test neuf portant le tueur `:265`,
  sortie F2P exigée), « cinq tués » est donc inatteignable à la lettre avec cette table. Options : (a) admettre la preuve de B (K18, même
  ligne mutée, mort stricte par T-C3) et de C (5/5 stricts) avec le rejeu de A ; (b) amender la table du G2 (champ `test` du rang : T-C3),
  la G7 rejouant la table amendée ; (c) l'option « extension de T-2 » (le tueur `:265` ne se place plus sans empiler deux lignes
  `// killer:` au-dessus de T-2, forme inédite relevée à Q-C-1 de PR-4c-1b). **Recommandation : (a) ; au rejeu de la G7, la table dérivée C
  (sha256 cité) à côté de celle du G2.** `error_origin` proposé : relecteur G2 (critère du §7 écrit sans le champ `test` du rang) et
  orchestrateur (critère recopié dans la mission).

### MAST, `error_origin` (proposés, assignés au G7)

- FM-3.2 (vérification absente) : fermée pour C-G2-2 à C-G2-4 (campagnes A à C, F2P) ; FM-3.3 (vérification incorrecte) : Q-C-1.
- `error_origin` : Q-C-1 ci-dessus ; E-1 à E-3 et J-1 ci-dessous : ce correcteur.

### Conduite, écarts, jonctions

- Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `write-tree` ni `merge-tree --write-tree` ; aucun commit, add ni stash dans le worktree ni
  dans `F:/Monark`, aucun workflow (R-20). Git dans le worktree en lecture seule (`--no-optional-locks`, `GIT_OPTIONAL_LOCKS=0` : `rev-parse`,
  `status`, `diff`, `log`) ; l'index du worktree garde la date 21:40:26Z (l'instant du commit `1720a95a`) et le sha256 `d08e395a…b34a`
  relevés à 22:09:28Z. Git écrivant seulement dans mes clones `--no-local` (`verts`, `base`, `r25clone` : clone, extraction détachée ;
  commit de gel local dans `r25clone` seul) et dans ceux des outils. Aucun réseau, aucun outil de recherche distant ; rien sur C: ;
  `F:/Monark` jamais écrit.
- Écritures dans le worktree : le test (par `tools/apply.mjs`) et ce journal (ajouts par `cat >>` de morceaux passés à la garde d'octets).
  Fichiers créés (outils, spécifications, table dérivée, morceaux de journal) : 0 barre inverse, 0 ligne au-delà de 160 à leur état final.
- **E-1** : `tools/gate.mjs` (l.19, 163 caractères) et `tools/cv4.ps1` (l.9, 177) ont été exécutés une fois dans la commande même où la
  garde les signalait (21:55:08Z) ; repliés au même chemin, garde propre, re-testés (racine libre : 0 ; racine tenue : 3).
- **E-2** : ce repli (21:55Z), puis l'élargissement du motif de `tools/hash-audit.mjs` (entre 22:09:28Z et 22:16:19Z), sont passés par
  des commandes `node -e` portant des guillemets ou des `$` échappés par barre inverse (hors heredoc, aucun chemin ; les fichiers résultants en ont 0).
- **J-1** : deux empreintes abrégées de mes brouillons étaient fausses (celles de `logs/static-export-check.log` et de
  `tools/mk-out-nm.mjs` ; les fichiers désignés étaient les bons), vues par `tools/hash-audit.mjs` AVANT tout ajout au journal, corrigées ;
  audit final : chaque abrégé et chaque empreinte complète de cette section égale à une seule empreinte recalculée.
- **E-3** : `logs/nm-after.txt` est tronqué (9 lignes sur 12) par mon tube `tee | head -1`, qui a coupé `tee` ; relevé refait sans tube
  (`logs/nm-after-2.txt`), égal à `logs/nm-before.txt` ; la trace tronquée est gardée.
- **Jonctions** : retirées de 22:09:09Z à 22:09:11Z par `tools/rm-nm-junctions.ps1` (`e4ec3790…b748`) : chaque jonction par
  `[System.IO.Directory]::Delete`, jamais récursif (outil testé d'abord sur une fixture : cibles intactes) ; 5 × 229 jonctions (`verts`,
  `base`, trois dossiers de mutants) ; balayage de `F:/tmp/dojo/pr3a1c-corr` : 1 145 liens avant, **0 après** (`tools/reparse-scan.mjs`) ;
  `F:/Monark/node_modules` : 220 entrées et 11 liens `@monark` identiques avant (21:57:39Z) et après (22:09:20Z).
- **Sorties hors de la liste « À créer »** (MISSION-LINT-OUTPUTS-1), toutes sous `F:/tmp/dojo/pr3a1c-corr/` : `tools/` (mes outils et les
  spécifications `tools/edits/`), `logs/` (TAP, journaux des portes, relevés), `journal/` (morceaux de ce journal avant ajout), `gatetest/`
  et `rmtest/` (fixtures des essais de la garde d'hôte et du retrait des jonctions), `mutants-derived-table.mjs` (table de la campagne C) ;
  sous `mutants/`, les dossiers `g2-five`, `killers`, `g2-five-derived` ; clones `verts`, `base`, `r25clone` et, après cette clôture,
  `treeclone` (prédiction de l'objet d'arbre de l'oracle). Hors du dossier : l'enregistrement et les journaux de l'oracle sous
  `F:/tmp/oracle-results/` (outil du tronc).
- **Advisor intégré** : consultation 1 (entre 21:49:23Z et 21:54:23Z, après l'orientation, avant toute écriture) : option « test neuf »
  confirmée ; campagne A rendue telle quelle, campagnes B et C, Q-C-1 ; compte prévu avant l'édition ; idiome de l'espion ; barre inverse
  déclarée et jamais portée par un heredoc ; jonctions par `[System.IO.Directory]::Delete` ; oracle sous `GIT_OPTIONAL_LOCKS=0`.
  Consultation 2 (brouillons écrits, avant 22:16:19Z) : rien ne bloque la clôture ; précisions suivies : égalité des journaux de portes
  avec ceux du G1 mesurée par empreintes complètes, puce des sorties hors liste, garde d'octets et audit d'empreintes sur le journal
  entier, `gate:vocab` et `lint-model-pinning` rejoués sur le journal final, objet d'arbre prédit avant l'oracle. Conseil, jamais
  verdict ; chaque point vérifié sur pièce. La consultation de fin est rapportée dans `REPONSE.md`.
- **Erratum (correcteur, même section)** : deux heures du début de cette section sont des estimations, non lues à l'horloge :
  « Worktree à l'ouverture (21:42Z) » et « sha256 recalculés entre 21:43Z et 21:49Z » ; les deux `date -u` qui encadrent ces relevés
  donnent 21:41:55Z et 21:49:08Z. Les lignes ne sont pas réécrites ; celle-ci fait foi.
- **Journal CLOS ici**, avant le lancement de l'oracle (`node F:/Monark/scripts/oracle/run.mjs --role corr --tree F:/Monark-wt-dojo-pr3a1c`
  `--base ea70a43b --key PR-3a-1c`, sous `GIT_OPTIONAL_LOCKS=0`) ; il n'est plus touché ensuite. Enregistrement, R-25 officiel (porte `r25`),
  objet d'arbre et empreintes des livrables : `F:/tmp/dojo/pr3a1c-corr-deliver/REPONSE.md` et `DELIVERED.sha256`.
