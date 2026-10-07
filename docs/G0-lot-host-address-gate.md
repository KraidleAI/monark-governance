# G0 du lot HOST-ADDRESS-GATE-1 : les deux adresses d'hôte hors de l'arbre courant, et une porte qui refuse tout littéral d'adresse IP

RECHERCHES, 2026-10-07. Base `eb1beb01` (lot/etude-suite, fusion de #235). Demande : décision du fondateur, verbatim « Retirer + garde CI
(Recommandé) », relayée par MONARK (`recherches:coordination/messages/2026-10-07-MONARK-vers-RECHERCHES-decisions-fondateur-241-235.md`
§2) ; liste des fichiers, en noms seuls : pièce `recherches:coordination/pieces/2026-10-07-adresses-hote/ip-files.txt`.

- **Provenance** : worker `claude-opus-5-5`, effort max, horloge lue (`date -u`) à 18:33 UTC. Worktree neuf du scratchpad, branche
  `recherches/host-address-gate` ; `git add` par chemins ; poussé sans force. Node v24.21.0, Linux.
- **Confidentialité** : aucune adresse réelle n'est écrite ici, ni dans les messages de commit, le corps de la PR, les sorties gardées
  ou les pièces. On dit « adresse A » (le VPS du site) et « adresse B » (l'hôte Bell), ou on renvoie à `fichier:ligne`.
- **Historique** : il n'est pas réécrit (décision du fondateur). Les commits passés gardent les adresses ; seul l'arbre courant change.

## 1. Retrait : les 35 fichiers de la pièce

`deploy/Caddyfile.monark-harness`, `deploy/monark-bell-publish.service`, `docs/ADR-AMENDEMENTS-narabi-ops-1d-G7-source.md`,
`docs/BASCULEMENT-COMPTE.md`, `docs/CARTOGRAPHIE-BRANCHEMENT-2026-09-24.md`, `docs/CHECKPOINT1-lot-dojo-pr2-2-tick.md`,
`docs/CHECKPOINT1-lot-narabi-ops-1.md`, `docs/CHECKPOINT1-lot-t1b-backend.md`, `docs/ETAT-REPRISE.md`,
`docs/G0-ADDENDUM-lot-narabi-ops-1b-ii.md`, `docs/G0-lot-narabi-ops-1.md`, `docs/G0-lot-narabi-ops-1b.md`, `docs/G0-lot-t1b-backend.md`,
`docs/JOURNAL-PROVENANCE.md`, `docs/PASSATION-2026-09-24.md`, `docs/RUNBOOK-bell.md`, `docs/RUNBOOK-dojo.md`, `docs/RUNBOOK-harness.md`,
`docs/RUNBOOK-sentinel.md`, `docs/RUNBOOK-vitrine.md`, `docs/SPRINT-BACKLOG-lot-t1b-backend.md`, `docs/adr/ADR-DOJO-PR-2.md`,
`docs/adr/ADR-DOJO-PR-3.md`, `docs/adr/ADR-DOJO-SNAPSHOT-1.md`, `docs/adr/ADR-K1-attesteur-narabi.md`,
`docs/adr/ADR-M005-harnais-mcp-appelable.md`, `docs/adr/ADR-M007-calibrate-byo.md`, `docs/adr/ADR-T1b-backend.md`,
`docs/carto/flows-2026-09-24.json`, `docs/carto/graph-2026-09-24.json`, `docs/course-bell/FAITS-hostinger-backups-vps-bell-2026-09-23.md`,
`docs/course-bell/FAITS-vps-bell-precheck-2026-09-23.md`, `docs/dojo/FAITS-systemd-timer-2026-09-27.md`,
`docs/roster/FAITS-github-actions-billing-runners-2026-09-25.md`, `test/surfaces-1-1-0.test.ts`.

Mesuré à la base : 252 occurrences (A et B) dans ces 35 fichiers et nulle part ailleurs ; 134 sont des `root@<adresse>` de commandes SSH.

**Règle de remplacement** :

- A devient `monarkgate.tech` : le VPS du site (vitrine, harnais `mcp.` et `api.`, sentinelle), un seul Caddy
  (`deploy/Caddyfile.monark-harness` l.2-3 et l.11). B devient `bell.monarkgate.tech` : l'hôte Bell, nommé par son enregistrement A
  (RUNBOOK-bell étape 7).
- C'est la convention déjà posée par `docs/RUNBOOK-dojo.md` l.543-544 : l'hôte est nommé par son enregistrement A, jamais par son
  adresse, et sa clé d'hôte SSH est copiée sous ce nom une fois, à l'étape (0) l.546-572.
- Là où le texte a besoin de l'adresse elle-même (un enregistrement DNS « nom → adresse », un attendu « Address: … »), il prend une forme
  neutre : « l'adresse de l'hôte Bell », « l'adresse du VPS du site », ou `<address>` comme `docs/RUNBOOK-dojo.md` l.549-550. Un contrôle
  reste une comparaison entre deux lectures.
- Le résolveur public des commandes `nslookup` (quatre de ces fichiers) prend son nom, `one.one.one.one`.
- Remplacement en place : aucune ligne n'est ajoutée ni ôtée. Les renvois par numéro de ligne et les tueurs ancrés dans ces fichiers
  restent justes.

**Vérifié : rien ne lit l'adresse à l'exécution.**

- Les deux occurrences de `deploy/` sont des commentaires (l.6 et l.2), que Caddy et systemd ignorent.
- `scripts/verify-bell.mjs` (l.200) compare l'unité installée au blob du G7 qu'on lui donne, jamais à l'arbre courant.
  `scripts/verify-harness.mjs` ne lit pas le Caddyfile.
- L'occurrence de `test/surfaces-1-1-0.test.ts` (l.240) est l'empan attendu de l'acte 1 de `docs/RUNBOOK-vitrine.md` (l.42) : les deux
  changent ensemble.
- Lecteurs des fichiers touchés, rejoués au gel : `harness-deploy-config`, `bell-deploy-config`, `verify-bell`, `verify-dojo`,
  `bell-ops`, `bell-anchor-timeline`, `bell-method`, `dojo-collect-deploy`, `dojo-publish-deploy`, `probe-dojo-live`, `runbook-retire`,
  `retire-probe`, `retire-instants`, `verify-harness-liq`, `surfaces-1-1-0`, `export-public` (hors test 42), `probe-narabi-state`,
  `spec-retire-path`, `adr-m003-suffixes`, `dojo-served`, `dojo-chain`, `dojo-verify`, `keep-cause`.

**Épingles, contrôlées avant d'éditer** :

- Aucun des 35 fichiers n'est sous `tools/kata-recalc/**` ni dans `test/contracts-frozen.manifest.json`.
- Aucune ligne de `KraidleAI/monark-precommitments` (clone en lecture, `43472d7`) ne cite l'un d'eux, ni par chemin ni par sha256.
- Les sha256 cités ailleurs (onze fichiers, par exemple l'unité Bell dans le journal l.368) sont des relevés datés de ce qui a été lu
  ou déployé à un commit. L'historique les garde vérifiables : aucun n'est une épingle de l'arbre courant.
- Aucun fichier n'est donc refusé.

## 2. Les autres littéraux hors de la liste close

La porte refuse toute adresse hors de la liste. Hors des 35, l'arbre en porte encore, qui ne désignent aucun hôte à nous :

- **Réécrits en mots, en place** :
  - `docs/G1-lot-codeql-alerts-1.md` : l'adresse du registre et une adresse locale de poste ;
  - `docs/G2-DELTA-lot-narabi-ops-1b-i.md` : l'adresse de métadonnées en nuage et une IPv6 de lien local ;
  - `docs/G2-DELTA-lot-t1a-iii-a1.md` : une IPv6 d'essai ;
  - `docs/course-bell/FAITS-massive-host-2026-09-23.md` : les adresses d'un fournisseur tiers ;
  - `docs/G7-lot-l2-p1-b2.md` et `docs/G7-lot-spec-publish-pipeline-1.md` : les entrées privées des tests ci-dessous.
- **Tests, entrées d'adresse privée (RFC 1918) passées en adresses de documentation (RFC 5737)** : `test/l2-book.test.ts`,
  `test/public-text-deny.test.ts` et `test/spec-publish.test.ts`. Les règles visées refusent tout quadruplet pointé
  (`PRIVATE_FORMS`, `scripts/public-text-deny.mjs:118`), ou tout point et tout deux-points (`PLAIN`, `scripts/l2/book.mjs:27`) : le
  comportement est le même. Le test de `public-text-deny` n'avait pas de tueur : sa ligne vide l.18 porte désormais celui de la forme
  IPv4 de `PRIVATE_FORMS` (aucune ligne ne bouge).

## 3. La porte

- `scripts/address-literals.mjs` et ses types `scripts/address-literals.d.mts` portent la règle. Elle vit dans un script, et non dans le
  test, pour que red-proof juge les tests (module neuf à la base) et tire leurs tueurs.
- `test/no-host-address.test.ts`, test racine : il tourne en CI dans `g3-verification` (`npm run test:main`, glob `test/*.test.ts`).
- Ni le script ni le test ne sont exportés (`WHITELIST_FILES` de `scripts/export-public.mjs` ; le `test/` racine n'est jamais exporté).
- **Lecture** : la liste des fichiers vient de l'index (`git ls-files -z`), leurs octets de l'arbre de travail (un fichier suivi que
  l'arbre de travail n'a plus est sauté). Chaque fichier suivi sans octet NUL est lu comme texte, quelle que soit son extension
  (`deploy/*.service` et les Caddyfile en sont). Un fichier qui porte un octet NUL n'est pas lu, et doit être un binaire que
  `.gitattributes` déclare (`git check-attr binary`, sans fichier d'attributs global) : sinon le verdict le nomme (`undeclared`, chemin
  masqué) et le test de l'arbre rougit. Le chemin de chaque fichier suivi est jugé aussi (ligne 0), et un littéral d'un chemin est
  masqué dans la sortie, chaque suite hex qu'il touche comprise.
- **Littéral** : chaque ligne, et chaque chemin, est lue telle qu'écrite puis dans une copie où chaque `%XX` est décodé par un simple
  remplacement (`decodeURIComponent` lève sur un `%` isolé) ; un littéral que seule la copie montre est rapporté à sa colonne dans la
  ligne écrite, jamais deux fois.
  - IPv4 : quatre octets décimaux (`net.isIPv4`), bornés (avant : ni lettre, ni chiffre, ni `_`, ni `.` ; après : ni lettre, ni
    chiffre, ni `_`, ni `.chiffre`) ;
  - IPv6 : suite maximale de chiffres hexadécimaux, de `:` et de `.` qui porte au moins deux `:` ; un mot collé à un `::` n'en est pas
    une (`Type::new`, les commandes de workflow) ; devant un `:` seul, l'étiquette ou le mot est ôté (`addr:`, `inet6:`) ; pas de
    lettre, de chiffre ni de `_` après ; points finaux ôtés par une boucle, puis un `:` final seul ; `net.isIPv6`.
  - Temps : chaque ligne est lue en temps linéaire. Les points finaux ôtés par `/\.+$/` ne l'étaient pas (quadratique sur une suite
    de points qui ne la termine pas : 1,3 s pour 40 000 points) ; une boucle les ôte. Mesuré sur neuf formes pathologiques à 40 000
    et 80 000 caractères (points dans ou en fin de suite, deux-points, hex et deux-points, chiffres hex, chiffres pointés,
    échappements, deux-points échappés, étiquettes) : le temps double quand la taille double, 4 ms au plus à 40 000.
- **Portée** : la porte lit les littéraux écrits sous leur forme décimale pointée ou hex canonique, bornés comme dit, et un niveau
  d'échappement `%XX`. Elle ne lit pas : un octet à zéro de tête (`net.isIPv4` le refuse) ; un littéral collé à une lettre, un chiffre
  ou un `_` d'un côté ou de l'autre, ou précédé d'un point (l'italique `_…_` du Markdown compris) ; une IPv6 pleine (huit groupes)
  derrière une étiquette en lettres hex (`cafe:`), ou suivie d'une lettre (`.txt` compris) ; un littéral coupé par un saut de ligne ;
  les autres encodages (pourcent double, entités HTML, base64 et URL `data:`, échappements JSON `\u`, entier, hex, octal, noms tirés
  de l'adresse comme `ip-a-b-c-d`, caractères de largeur nulle ou pleine chasse). Sonde de 28 formes construites à l'exécution dans la
  plage de banc d'essai : toutes comme dit ici. Les zéros de tête restent hors de la porte : les vecteurs SSRF octaux du bouclage de
  l'arbre demanderaient des entrées, sans gain pour nos hôtes.
- **Liste close d'exceptions, chacune avec sa raison** :
  - (a) **plages**, par `BlockList` de Node, qui couvre toute graphie (IPv4-mapped, forme longue, mesuré sous Node 24) :
    - bouclage : 127.0.0.0/8 et `::1` ;
    - adresse non spécifiée : 0.0.0.0 et `::`, sa jumelle IPv6 (`::` est aussi le séparateur ` :: ` des textes et le `::` des regex) ;
    - documentation : 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (RFC 5737) et 2001:db8::/32 (RFC 3849).
  - (b) **littéraux listés un par un**, chacun avec son fichier, sa valeur et sa raison :
    - numéros qui ont la forme d'une adresse : des paragraphes de RFC 9162, de WHATWG HTML, d'ECMA-262 et des Baseline Requirements du
      CA/B Forum, deux clauses d'un texte de couverture, une version de V8 ;
    - formes de code : deux tranches Python de `tools/kata-recalc/report.py` (outil épinglé, non touché), la commande de workflow
      `add-mask` de GitHub Actions, la queue du bouclage écrit en pourcent-encodage ;
    - entrées-bornes du test de bouclage `test/retire-instants.test.ts` : les voisines immédiates des plages qu'il épingle (au-dessus et
      au-dessous de 127/8, au-dessus de 0/8 et de `::1`, une forme IPv4-mapped) et le haut de 0/8. Les remplacer affaiblirait ses bornes.
- Une entrée listée qui ne trouve plus son littéral dans son fichier rougit (garde non inerte, comme `byte-guard`).
- Le fichier de la porte ne porte que les littéraux de sa propre liste. Le test construit ses adresses à l'exécution : il n'a besoin
  d'aucune exemption.
- **Sortie rouge** : `chemin:ligne:colonne IPv4 x.x.x.x` (ou `IPv6 x:x::x`). Chaque groupe de chiffres devient `x` : aucun chiffre de
  l'adresse n'est imprimé. Le journal de CI d'un dépôt public est public ; la forme `a.b.x.x` de la demande y imprimerait un /16.

## 4. Rouge d'abord, tueurs, preuve rouge

- **Rouge d'abord** : worktree neuf détaché à `eb1beb01`, le script et le test de `a8e66dde` copiés, Node 24.
  - `address_literals_tracked_tree_is_clean` rougit par `ERR_ASSERTION` ; les six autres tests passent.
  - La sortie compte **273 occurrences dans 44 fichiers**, toutes masquées (`x.x.x.x`) : 257 dans les 35 fichiers (les 252 adresses
    A et B, et les cinq du résolveur public), 16 dans les neuf fichiers de la section 2.
  - Aucune adresse d'hôte dans la sortie (`grep -F` des deux littéraux : 0).
  - Au gel : 0 occurrence, 0 entrée périmée ; 2 395 fichiers texte lus ; la liste tient 62 paires dans 27 fichiers, toutes trouvées.
- **Tueurs**, un au-dessus de chaque test. `verifie-ancres` : 7 ANCRE dans le test neuf, 18 dans `public-text-deny`.
  - `scripts/address-literals.mjs:18 SDL "EXEMPT.addSubnet(\"127.0.0.0\", 8, \"ipv4\");" -> ""` : `address_literals_tracked_tree_is_clean` ;
  - `:81 CONST`, l'étiquette réduite à un `:` de tête : `address_literals_refuse_an_address_in_each_writing_met` ;
  - `:22 CONST`, 192.0.2.0/24 élargie à /23 : `address_literals_admit_the_closed_ranges_in_any_writing_and_refuse_their_neighbours` ;
  - `:82 SDL`, un mot collé à un `::` lu comme adresse : `address_literals_read_no_address_in_code_or_numbers_that_only_look_like_one` ;
  - `:102 CONST`, un littéral listé admis dans tout fichier : `address_literals_admit_a_listed_literal_in_its_own_file_only` ;
  - `:92 CONST`, un masque qui garde les chiffres : `address_literals_report_names_each_hit_without_a_digit_of_it` ;
  - `:116 CONST "buf.includes(0)" -> "false"`, un binaire lu : `address_literals_read_every_tracked_text_file_and_skip_binaries` ;
  - `scripts/public-text-deny.mjs:118 CONST`, la forme IPv4 ôtée de `PRIVATE_FORMS` : `public_text_gate_refuses_one_vector_per_rule`.
- **Mutants à la main** : 21, chacun seul, fichier rendu à l'octet et sha256 vérifié (pilote hors dépôt). 20 sont tués par assertion,
  1 rougit par une erreur levée (le `ENOENT` d'un fichier supprimé rendu fatal). Ils couvrent chaque plage ôtée ou élargie, la règle du
  fichier de la porte, les deux bornes de l'IPv4, `isIPv4`, le compte des deux-points, la borne après l'IPv6, les points finaux, le
  chemin jugé et masqué, la famille passée à `BlockList`, l'admission par fichier, `-z` et l'entrée périmée.
- **red-proof** `--base eb1beb01 --gel 9dd82811 --draw 8 --seed 1` : 11 tests jugés.
  - 7 `new-module` (le test neuf) et 1 F2P (`srf_runbook_vitrine_t0_order`) ;
  - 3 refus « green at base », déclarés : `l2_book_guards_named`, `public_text_gate_refuses_one_vector_per_rule` et
    `vocabulary_gate_is_the_public_free_text_gate_with_closed_exceptions` ;
  - 8 tueurs tirés, 8 tués ; `RED-PROOF.json` sha256 `d9ec7fc1…`, digest du gel `783c3313…`.
  - Les tueurs des trois adaptations, tirés à la main au gel, les tuent par assertion. La forme IPv4 ôtée de `PRIVATE_FORMS` rougit
    aussi le test de `spec-publish` : les adresses de documentation y exercent la même règle.

## 5. Effets opératoires (déclarés)

- **SSH par nom** : la première commande par nom vers `monarkgate.tech` demande la clé d'hôte sous ce nom. On la copie comme à l'étape
  (0) de RUNBOOK-dojo (empreinte égale à celle connue pour l'adresse), jamais par `accept-new`. MONARK vérifie de son côté, sur les
  hôtes, que SSH n'accepte que les clés.
- **`deploy/monark-bell-publish.service`** change d'une ligne de commentaire. Un contrôle Bell à un G7 postérieur à cette fusion attend
  l'unité réinstallée (RUNBOOK-bell étape 6). À un G7 antérieur, rien ne change.
- **`docs/carto/*.json`** : les adresses lues par curl y deviennent « site VPS » et « Bell host ». Le bloc `live` embarqué ne rend
  plus le sha256 de sa source, ni `graph-2026-09-24.json` celui de `docs/CARTOGRAPHIE-BRANCHEMENT-2026-09-24.md` l.29 et l.422. Ce sont
  des relevés datés, sans lecteur dans le code ; l'historique garde les octets d'origine.

## 6. Mesures (gel `9dd82811`, Node v24.21.0, Linux)

- `tsc --noEmit` : 0. eslint des fichiers touchés : 0 (le script est hors du champ d'eslint, comme les autres scripts).
- `gate:vocab`, `lang:gate`, `lint:ratchet` (69/69) et `export:check` sont verts ; winlint : 48 fichiers, aucun risque Windows.
- Tests lecteurs des fichiers touchés, avec le test neuf, `killer-lines` et `byte-guard` : 325/325.
- `npm run test:main` : 2 914 tests, 2 892 verts, 22 sautés (préexistants), 0 rouge.
- Test 42 (l'export public et son `npm ci && npm run ci` imbriqué) : vert, 96 s.
- **Taille, forme de la CI** (`origin/lot/etude-suite...HEAD`, pathspecs du job `r25-taille-de-lot`) : 11 fichiers comptés, +314 −48,
  soit **362 lignes**. C'est sous 547 (borne du lot) et sous 1 205 (borne de la CI) ; contenu : 0. Les fichiers `docs/**/*.md` ne
  comptent pas ; `docs/carto/*.json` compte (78 lignes).
- Non vérifié ici : Windows (MONARK rejoue à la fusion), dont la `BlockList` de Node pour les formes IPv4-mapped.

## 7. Pli du G2 (verdict CORRECTIONS, cinq constats m)

Pièce : `recherches:coordination/pieces/2026-10-07-g2-recherches/G2-243-host-address.json` (tête lue `20653902`). Worker
`claude-opus-5-5`, effort max, worktree neuf détaché du scratchpad ; `git add` par chemins ; poussé sans force. Le tronc d'abord :
`ec64c0cd` « Merge the trunk » (`5437cd0d`, sans conflit) ; puis les tests rouges seuls (`1b5ff52e`), la correction (`a73923d3`),
les runbooks (`c8168d03`) et cette note.

- **m-1, runbooks** (en place, aucune ligne ajoutée ni ôtée) : l'étape (0) de RUNBOOK-dojo §15 précède la première commande par le
  nom de tout runbook (dès la section 1 ici, et RUNBOOK-bell ; pour `monarkgate.tech`, la même étape avec `N=monarkgate.tech` avant
  RUNBOOK-harness, -sentinel et -vitrine) ; la clé connue est celle de l'adresse de l'hôte, non plus « de la section 1 », qui n'en
  porte plus ; `<address>` est l'adresse sous laquelle le `known_hosts` de l'opérateur tient la clé (ses relevés ou le panneau du
  fournisseur, jamais cet arbre ; fausse ou laissée telle, aucune entrée : `STOP`). RUNBOOK-dojo l.19 et RUNBOOK-sentinel l.9 y
  renvoient, comme RUNBOOK-bell l.14 et RUNBOOK-harness l.23 ; RUNBOOK-bell l.183 dit d'où vient son `<address>`.
- **m-2, échappements** : la copie décodée de §3. Test `address_literals_read_an_address_behind_a_percent_escape` : les trois
  vecteurs du G2, `%40`, une adresse toute encodée, des deux-points encodés, une adresse déjà lue suivie d'un `%20` (une occurrence,
  pas deux), un `%` isolé, une IPv6 devant un `:` final, et quatre chemins (après `%40`, tout encodé, une IPv6 aux deux-points
  encodés, une récurrence collée) imprimés masqués.
- **m-3, portée** : §3 « Lecture » (l'index pour la liste, l'arbre de travail pour les octets) et « Portée ».
- **m-4, temps** : la boucle de §3. Test `address_literals_read_forty_thousand_dots_in_bounded_time` : le meilleur de trois lectures
  d'une ligne de 40 000 points sous 250 ms ; 1 288 ms par la regex au rouge, moins de 1 ms par la boucle.
- **m-5, binaires** : le verdict nomme tout fichier sauté qui n'est pas un binaire déclaré, et le test de l'arbre l'exige vide.
  `*.jpg binary` est ajouté : `out/banner.jpg` était le seul binaire non déclaré (45 fichiers sautés sur 2 453 suivis :
  37 .ots, 5 .ttf, 1 .png, 1 .jpg, 1 .cbor ; 2 408 lus). Test
  `address_literals_name_each_skipped_file_that_gitattributes_does_not_declare_binary` : un binaire déclaré, un `-text` seul,
  un sans attribut au chemin masqué, et un fichier d'attributs global qui déclare tout, ignoré.
- **Rouge d'abord** : au commit `1b5ff52e`, la correction mise de côté, 4 tests rouges, tous par `ERR_ASSERTION` (le test de l'arbre,
  dont le verdict n'a pas encore `undeclared`, et les trois neufs) ; les 6 autres verts. À `a73923d3` : 10/10.
- **Tueurs** : un au-dessus de chaque test, 10 ANCRE (`verifie-ancres`). À ce gel : `:18 SDL`, `:82 CONST` (ex-`:81`), `:22 CONST`,
  `:83 SDL` (ex-`:82`), `:131 CONST` (ex-`:102`), `:115 CONST` (ex-`:92`), `:145 CONST` (ex-`:116`), et les neufs `:96 CONST` (pas de
  copie décodée), `:86 CONST` (la boucle remplacée par la regex) et `:160 ROR` (l'attribut lu à l'envers) ; les numéros de §4 sont
  ceux du gel `9dd82811`. Chacun tiré seul, fichier rendu et sha256 vérifié : 10 tués par assertion.
- **Mutants à la main** : 19 sur les lignes neuves, chacun seul, fichier rendu et sha256 vérifié. 17 sont tués par assertion. 2 sont
  équivalents par construction : sans la sentinelle de fin, `fill` court jusqu'au bout de la ligne, le même empan ; sans le raccourci
  de liste vide, `git check-attr` ne rend rien. Le deux-points final gardé survivait d'abord (aucun test ne portait une IPv6 devant un
  `:` final, manque antérieur au pli) : un vecteur du test des échappements le tue.
- **red-proof** `--base ec64c0cd --gel a73923d3 --draw 4 --seed 1` : 4 jugés, 4 F2P, 6 inchangés, aucun refus ; 4 tueurs tirés,
  4 tués ; `RED-PROOF.json` sha256 `bc99f06e…`, digest du gel `bedd213a…`.
- **Mesures** (gel `c8168d03`, Node v24.21.0, Linux) : `tsc --noEmit` 0 ; eslint des fichiers touchés : 0 erreur ; `gate:vocab`,
  `lang:gate`, `lint:ratchet` (69/69) et `export:check` verts ; winlint : 49 fichiers, aucun risque Windows. Tests lecteurs des
  runbooks touchés, avec le test de la porte : 159/159. `npm run test:main` : 2 935 tests, 2 913 verts, 22 sautés (préexistants),
  0 rouge, 269 s ; test 42 (l'export public et son `npm ci && npm run ci` imbriqué) : vert, 91 s. Porte sur l'arbre :
  0 occurrence, 0 entrée périmée, 62 paires dans 27 fichiers, toutes trouvées.
- **Taille, forme de la CI** : 12 fichiers comptés, +402 −48, soit **450 lignes**, sous 547 (borne du lot) et sous 1 205 (borne de la
  CI) ; contenu : 0.
- **Non vérifié ici** : Windows (MONARK rejoue à la fusion) : `core.attributesFile=/dev/null` sous Git for Windows, les noms de
  fichiers à `%` des fixtures, la borne de 250 ms.

## Points pour MONARK

- **Q-1** : les entrées-bornes de `test/retire-instants.test.ts` sont des adresses hors des plages, non des numéros. Elles sont listées
  avec leur raison. Autre voie : les sortir du test, au prix de ses bornes.
- **Q-2** : `::` est admise avec 0.0.0.0, et les numéros de section ou de clause avec les numéros de version, comme lus de la décision.
