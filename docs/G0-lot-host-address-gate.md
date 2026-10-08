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
- **Lecture** : la liste des fichiers vient de l'index (`git ls-files -z`), leurs octets de l'arbre de travail, lus par `lstat` (un
  fichier suivi que l'arbre de travail n'a plus est sauté). Chaque fichier suivi sans octet NUL est lu comme texte, quelle que soit son
  extension (`deploy/*.service` et les Caddyfile en sont). Un lien symbolique est jugé par son texte (`readlink`, comme une ligne 1),
  jamais suivi : un lien pendant est lu, un fichier hors de l'arbre qu'un lien nomme ne l'est pas ; sous Windows avec
  `core.symlinks=false`, git extrait le lien comme un texte de sa cible, lu de même. Un gitlink (le dossier d'un sous-module extrait),
  ou tout chemin qui n'est ni un fichier ni un lien, n'est jugé que par son chemin, sans lever. Un fichier qui porte un octet NUL n'est
  pas lu, et doit être un binaire que `.gitattributes` déclare (`git check-attr binary`, sans fichier d'attributs global) : sinon le
  verdict le nomme (`undeclared`, chemin masqué) et le test de l'arbre rougit. Le chemin de chaque fichier suivi est jugé aussi
  (ligne 0). Chaque chemin imprimé (celui d'une occurrence, celui d'un binaire non déclaré) est masqué une fois, après la lecture de
  tous les fichiers, contre tous les littéraux que la porte a lus, dans tout fichier et toute ligne, admis ou non, ceux du chemin
  compris : depuis chaque index, chaque caractère écrit ou échappé (`%XX`, un niveau, l'une ou l'autre casse), toute suite qui se lit
  comme l'une de ces adresses est masquée (chaque suite hex qu'elle touche devient `x`, échappements compris), qu'elle soit collée à
  un mot, qu'elle en chevauche une autre ou qu'elle soit écrite sous une autre forme de texte : une `BlockList` compare les valeurs
  (zéros, `::` et casse d'une IPv6 ; une forme IPv4-mapped et son IPv4, dans les deux sens), et des octets complétés de zéros (quatre
  chiffres au plus) sont lus aussi. Le texte lu depuis un index s'arrête là où aucune adresse ne continue (45 caractères, un groupe
  de cinq, un quatrième point, un neuvième deux-points, un second `::`), et une adresse n'y est analysée que là où le texte en a la
  forme : le coût est linéaire dans le chemin et ne croît pas avec le nombre de littéraux lus (mesures en §10).
- **Littéral** : chaque ligne, et chaque chemin, est lue telle qu'écrite puis dans une copie où chaque `%XX`, en majuscules ou en
  minuscules, est décodé par un simple remplacement (`decodeURIComponent` lève sur un `%` isolé) ; un littéral que seule la copie
  montre est rapporté à sa colonne dans la ligne écrite. Le même littéral à la même colonne n'est jamais rapporté deux fois. Mais quand
  les chiffres hex d'un échappement, ou le caractère qu'il décode, se collent à un littéral, chaque passe lit le sien et les deux se
  chevauchent : une adresse écrite peut alors donner deux occurrences, chacune masquée (suivie de `%35` : l'adresse, et l'adresse au
  dernier octet allongé d'un chiffre, en même colonne). Il y en a deux quand la lecture la plus longue reste une adresse (pour une
  IPv4, l'octet allongé au plus 255 et sans zéro de tête : un dernier octet 0 suivi d'un chiffre échappé n'en donne qu'une, sa
  lecture allongée ayant un zéro de tête, que `net.isIPv4` refuse) et qu'aucune des deux n'est exemptée ; sinon une seule, ou aucune
  si ce qui reste est exempté.
  Les deux sont gardées : n'en garder qu'une ferait passer une ligne dont une lecture est exemptée et l'autre non.
  - IPv4 : quatre octets décimaux (`net.isIPv4`), bornés (avant : ni lettre, ni chiffre, ni `_`, ni `.` ; après : ni lettre, ni
    chiffre, ni `_`, ni `.chiffre`) ;
  - IPv6 : suite maximale de chiffres hexadécimaux, de `:` et de `.` qui porte au moins deux `:` ; un mot collé à un `::` n'en est pas
    une (`Type::new`, les commandes de workflow) ; devant un `:` seul, l'étiquette ou le mot est ôté (`addr:`, `inet6:`) ; pas de
    lettre, de chiffre ni de `_` après ; points finaux ôtés par une boucle, puis un `:` final seul ; `net.isIPv6`.
  - Temps : chaque ligne est lue en temps linéaire. Les points finaux ôtés par `/\.+$/` ne l'étaient pas (quadratique sur une suite
    de points qui ne la termine pas : 1,3 s pour 40 000 points) ; une boucle les ôte. Mesuré sur neuf formes pathologiques à 40 000
    et 80 000 caractères (points dans ou en fin de suite, deux-points, hex et deux-points, chiffres hex, chiffres pointés,
    échappements, deux-points échappés, étiquettes) : le temps double quand la taille double, 4 ms au plus à 40 000.
- **Portée** : la porte lit les littéraux écrits sous leur forme décimale pointée ou hexadécimale (IPv6 compressée ou pleine, l'une
  ou l'autre casse, zéros de tête dans un groupe compris), bornés comme dit, un niveau d'échappement `%XX`, et le texte d'un lien.
  Elle ne lit pas : un octet à zéro de tête (`net.isIPv4` le refuse) ; un littéral collé à une lettre, un chiffre ou un `_` d'un côté
  ou de l'autre, ou précédé d'un point (l'italique `_…_` du Markdown compris) ; une IPv6 pleine (huit groupes) derrière une étiquette
  en lettres hex (`cafe:`), ou suivie d'une lettre (`.txt` compris) ; un littéral coupé par un saut de ligne ; les autres encodages
  (pourcent double, entités HTML, base64 et URL `data:`, échappements JSON `\u`, entier, hex, octal, noms tirés de l'adresse comme
  `ip-a-b-c-d`, caractères de largeur nulle ou pleine chasse) ; la cible d'un lien ; les fichiers d'un sous-module, ceux d'un autre
  dépôt. Sonde de 28 formes construites à l'exécution dans la plage de banc d'essai, au premier pli : toutes comme dit ici. Les zéros
  de tête restent hors de la porte : les vecteurs SSRF octaux du bouclage de l'arbre demanderaient des entrées, sans gain pour nos
  hôtes. Le masque d'un chemin imprimé (« Lecture ») lit ces formes, plus les octets complétés de zéros ; pas les autres encodages.
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

## 8. Pli du G2 delta (verdict CORRECTIONS, cinq constats m)

Pièce : `recherches:coordination/pieces/2026-10-07-g2-recherches/G2-243-delta.json` (tête lue `fb9bad40`). Worker
`claude-opus-5-5`, effort max, worktree neuf détaché du scratchpad ; `git add` par chemins ; poussé sans force. Le tronc n'a pas
bougé (`5437cd0d`, base de fusion de la tête) : pas de fusion. Les tests rouges seuls (`e19f2e6d`), la correction (`ddc28160`),
le runbook (`f69e6aa3`) et cette note.

- **m-6, masque des chemins** : `hide()` marque, pour chaque littéral d'un chemin, l'empan où il est écrit et chaque récurrence de
  son texte, chaque caractère écrit ou échappé (`%XX`, un niveau, l'une ou l'autre casse) ; la passe des suites hex masque ces
  empans. Une récurrence échappée et collée à un mot, qu'aucune passe ne lit comme littéral, n'imprime plus les chiffres de
  l'adresse, que le littéral soit lu dans la copie décodée ou tel qu'écrit. Les chemins de `undeclared` passent par le même
  `hide()`.
- **m-7, double rapport** : §3 « Littéral » dit le vrai comportement (jamais deux fois le même littéral à la même colonne ; deux
  lectures qui se chevauchent, deux occurrences masquées). Épinglé : une adresse suivie de `%35` donne deux occurrences en
  colonne 1 ; le mutant qui écarte une lecture de la copie chevauchant une lecture brute meurt. Rien n'est dédoublonné, à dessein.
- **m-8, échappements en minuscules** : `h%5b` devant une IPv6, et des points `%2e` dans un chemin ; `ESCAPE` réduit aux hex
  majuscules meurt.
- **m-9, RUNBOOK-vitrine** l.42 (acte 1 de T0), en place, en texte simple hors des spans de code : avant cette commande par le nom,
  la clé d'hôte de `monarkgate.tech` copiée sous ce nom une fois, RUNBOOK-harness §0 (l.23, qui renvoie à RUNBOOK-dojo §15 (0)).
  `srf_runbook_vitrine_t0_order` ne lit que les spans, inchangés.
- **m-10, liens et gitlinks**, plié ici, la taille le permettant (496 lignes, ci-dessous) : `scan()` lit chaque chemin par
  `lstat` ; un lien est jugé par son texte, jamais suivi ; un gitlink, ou tout chemin qui n'est ni un fichier ni un lien, n'est jugé
  que par son chemin, sans lever. §3 « Lecture » et « Portée » le disent. Le test bâtit un lien pendant dont le texte porte une
  adresse, un lien vers un fichier hors de l'arbre qui en porte une, un lien interne et un gitlink à dossier ; sous win32, la fixture
  écrit un texte de la cible, comme git avec `core.symlinks=false`.
- **Rouge d'abord** : au commit `e19f2e6d`, le script de `fb9bad40`, 2 tests rouges, tous deux par `ERR_ASSERTION` :
  `address_literals_mask_a_path_wherever_its_address_recurs_escaped` (les chemins imprimés avec les chiffres de l'adresse) et
  `address_literals_judge_a_link_by_its_text_never_followed_and_a_gitlink_by_its_path` (le fichier hors de l'arbre lu, le lien
  pendant sauté) ; les 10 autres verts. `every_killer_line_is_readable` y rougit aussi : les tueurs neufs visent les lignes de la
  correction. À `ddc28160` : 12/12.
- **Tueurs** : un au-dessus de chaque test, et trois dans les corps neufs, chacun au-dessus de son cas : 15, tous ANCRE
  (`verifie-ancres` : 15 sur le fichier touché, 100 depuis la base `eb1beb01`, 1 659 dans l'arbre ; 0 DERIVE, 0 PERDU). Neufs :
  `:125 CONST` (l'alternative échappée ôtée de la récurrence) et `:150 CONST` (le lien suivi) ; dans les corps, `:74 CONST`
  (`ESCAPE` aux hex majuscules), `:106 CONST` (une lecture de la copie qui chevauche une lecture brute, écartée) et `:149 SDL` (le
  gitlink lu comme un fichier). Renumérotés : `:134 CONST` (ex-`:131`), `:152 CONST` (ex-`:145`), `:167 ROR` (ex-`:160`).
  Chacun tiré seul, fichier rendu et sha256 vérifié : 15 tués par assertion, chacun au cas qu'il précède.
- **Mutants à la main** : 15 sur les lignes neuves, chacun seul, fichier rendu et sha256 vérifié. 12 tués : 11 par assertion, 1 par
  l'`EINVAL` d'un `readlink` sur un fichier (branches du lien et du fichier inversées). 3 survivent : sans le marquage de l'empan
  lui-même, la récurrence le marque aussi (équivalent sur tous les vecteurs ; gardé comme garde) ; un point non échappé dans la regex
  de récurrence (masque seulement plus large) ; ne sauter que les dossiers (équivalent hors d'un FIFO ou d'une socket à un chemin
  suivi, qu'une extraction ne crée jamais ; non testable de façon portable). Un vecteur du test neuf (deux littéraux dans un chemin)
  tue le mutant qui ne masquait que le premier.
- **red-proof** `--base fb9bad40 --gel ddc28160 --draw 2 --seed 1` : 2 jugés, 2 F2P, 10 inchangés, aucun refus ; 2 tueurs tirés
  (`:125`, `:150`), 2 tués ; `RED-PROOF.json` sha256 `43d2c939…`, digest du gel `b650cd8c…`.
- **Mesures** (gel `ddc28160`, Node v24.21.0, Linux) : `tsc --noEmit` 0 ; eslint du test touché : 0 erreur ; `gate:vocab`,
  `lang:gate`, `lint:ratchet` (69/69) et `export:check` verts ; winlint : 49 fichiers contre le tronc, 3 contre `fb9bad40`, aucun
  risque Windows ; tests lecteurs de RUNBOOK-vitrine (`surfaces-1-1-0`, `site-send-guard`) : 17/17. `npm run test:main` (à
  `f69e6aa3`) : 2 937 tests, 2 915 verts, 22 sautés (préexistants), 0 rouge, 550 s ; test 42 (l'export public et son
  `npm ci && npm run ci` imbriqué) : vert, 275 s. Porte sur l'arbre : 0 occurrence, 0 entrée périmée, 0 non déclaré, 2 408
  fichiers lus, 62 paires dans 27 fichiers, toutes trouvées.
- **Taille, forme de la CI** : 12 fichiers comptés, +448 −48, soit **496 lignes**, sous 547 (borne du lot) et sous 1 205 (borne de
  la CI) ; contenu : 0.
- **Non vérifié ici** : Windows (MONARK rejoue à la fusion) : la branche win32 de la fixture des liens, `lstat` et `readlink` d'un
  lien sous Windows, et les points de §7.

## 9. Pli du G2 delta 2 (verdict CORRECTIONS, deux constats m)

Pièce : `recherches:coordination/pieces/2026-10-07-g2-recherches/G2-243-delta2.json` (tête lue `c0d93d9b`). Worker
`claude-opus-5-5`, effort max, worktree détaché du scratchpad ; `git add` par chemins ; poussé sans force. Une première course de ce
pli, coupée par un redémarrage du conteneur, n'avait rien poussé : son test rouge (`257b376f`) est gardé après vérification
(message, rouge rejoué, tueur), sa correction non commise refaite à l'identique (sha256 égal). Le tronc n'a pas bougé (`5437cd0d`,
base de fusion de la tête) : pas de fusion. Le test rouge seul (`257b376f`), la correction (`cc6e7432`), le runbook (`4f74a0aa`) et
cette note.

- **m-11, chemin d'une occurrence du contenu** : `hide(rel, also)` marque aussi chaque récurrence du texte de chaque littéral de
  `also`, chaque caractère écrit ou en `%XX` (un niveau, l'une ou l'autre casse), comme pour les littéraux du chemin ; `judge` lui
  passe le littéral de l'occurrence (`hide(rel, [lit])`). Le chemin d'un fichier dont le contenu porte une adresse, et qui la porte
  aussi sous une forme que la passe du chemin ne lit pas (collée à une lettre ou à un `_`, ou ses points en `%2E` collés à un mot),
  n'imprime plus ses chiffres. Trois lignes et le commentaire de `hide()`, en place ; les chemins de `undeclared`, sans occurrence
  de contenu, restent masqués comme avant. Le test des chemins porte `logs/host<adresse>.txt` et le même nom aux points `%2E`,
  chacun avec l'adresse pour contenu, attendus masqués. Sonde, un dépôt jetable par vecteur, adresses du banc d'essai construites à
  l'exécution : un `known_hosts` nommé d'après son hôte, l'adresse collée à un mot, ses points en `%2E` et en `%2e`, tous ses
  caractères échappés, une IPv6 collée, en minuscules et en majuscules, une occurrence lue dans la copie décodée du contenu, et le
  témoin `logs/<adresse>.txt` : à `c0d93d9b`, 8 chemins sur 9 impriment des chiffres de l'adresse (le témoin non) ; à `cc6e7432`,
  aucun, une occurrence chacun.
- **m-12, RUNBOOK-dojo §15 (0)**, en place, six lignes, aucune ajoutée ni ôtée : `"$N"` dans la reprise (l.562), le contrôle
  `BatchMode` (l.568) et le retour arrière (l.572), `$N` dans l'attendu de la copie (l.560) ; l'enregistrement A du nom,
  RUNBOOK-bell étape 7 ou RUNBOOK-harness §0 (l.564) ; l'attendu du contrôle, le nom propre de l'hôte (`bell` pour Bell) (l.571).
  L'étape vaut ainsi pour `monarkgate.tech`, comme le dit la clause des l.546-547. N vide ferme l'étape, mesuré avec le client
  OpenSSH 9.6p1 du paquet Ubuntu (HOME isolé, clés jetables, noms en `.test`) : la reprise ne lit rien (sortie 1), `ssh` sort en
  255 (`STOP`), le retour arrière n'ôte rien et n'écrit pas de `known_hosts.old`. Aucun test ne lit ces lignes ; les 6 tueurs
  ancrés dans RUNBOOK-dojo, tous dans `test/dojo-publish-deploy.test.ts` (qui en porte 14), restent ANCRE.
- **m-7, mot** : §3 « Littéral » dit quand une adresse écrite donne deux occurrences : si la lecture la plus longue reste une
  adresse et qu'aucune des deux n'est exemptée ; sinon une seule, ou aucune.
- **Rouge d'abord** : au commit `257b376f`, le script de `c0d93d9b`,
  `address_literals_mask_a_path_wherever_its_address_recurs_escaped` rouge par `ERR_ASSERTION` à l'assertion neuve (les deux
  chemins imprimés en clair) ; les 11 autres verts. `every_killer_line_is_readable` y rougit aussi : le tueur neuf vise la ligne de
  la correction. À `cc6e7432` : 12/12.
- **Tueurs** : 16, tous ANCRE (`verifie-ancres` : 16 sur le fichier touché, 101 depuis la base `eb1beb01`, 1 660 dans l'arbre ;
  0 DERIVE, 0 PERDU). Neuf, dans le corps du test des chemins, au-dessus de son cas : `:136 CONST` (`hide(rel)` sans le littéral
  de l'occurrence). Aucun renuméroté : le script garde ses lignes. Chacun tiré seul, fichier rendu et sha256 vérifié : 16 tués par
  `ERR_ASSERTION`, chacun au cas qu'il précède.
- **Mutants à la main** : 5 sur les lignes neuves (121, 123, 136), chacun seul, fichier rendu et sha256 vérifié, tous tués : 4 par
  assertion (l'empan de `also` étendu au début du chemin, d'un caractère ou de la longueur du littéral ; les littéraux du chemin
  ôtés de la boucle ; le littéral masqué passé à `hide`), 1 par le `TypeError` de `hide()` sans défaut pour `also`, qu'appelle
  `undeclared`. Aucun survivant.
- **red-proof** `--base c0d93d9b --gel cc6e7432 --draw 1 --seed 1` : 1 jugé, F2P (assert-fail à la base, pass au gel), 11
  inchangés, aucun refus ; population 1, 1 tueur tiré (`:125`), tué ; `RED-PROOF.json` sha256 `20d217bf…`, digest du gel
  `107b1224…`.
- **Mesures** (à `4f74a0aa`, Node v24.21.0, Linux) : `tsc --noEmit` 0 ; eslint des deux fichiers de code touchés : 0 erreur
  (1 avertissement, le script hors du champ d'eslint) ; `gate:vocab` (349 fichiers), `lang:gate` (0), `lint:ratchet` (69/69) et
  `export:check` verts ; winlint : 49 fichiers contre le tronc, 4 contre `c0d93d9b` (cette note comprise), aucun risque Windows.
  Tests lecteurs : les 28 fichiers de test qui nomment un runbook, avec `killer-lines`, `byte-guard`, `record-binance-klines`,
  `public-surfaces-honesty` et le test de la porte : 479/480, 1 sauté (propre à win32), le test 42 écarté (motif de `test:main`).
  `npm run test:main` : 2 937 tests, 2 915 verts, 22 sautés (préexistants), 0 rouge, 384 s ; test 42 (l'export public et son
  `npm ci && npm run ci` imbriqué) : vert, 121 s. Porte sur l'arbre : 0 occurrence, 0 entrée périmée, 0 non déclaré, 2 408
  fichiers lus sur 2 453 suivis, 62 paires dans 27 fichiers, toutes trouvées.
- **Taille, forme de la CI** : 12 fichiers comptés, +453 −48, soit **501 lignes**, sous 547 (borne du lot) et sous 1 205 (borne de
  la CI) ; contenu : 0.
- **Non vérifié ici** : Windows (MONARK rejoue à la fusion) ; les hôtes eux-mêmes : le `known_hosts` de l'opérateur, et le nom que
  répond à `hostname` le VPS de `monarkgate.tech`, que l'étape ne présume plus.

## 10. Pli du G2 delta 3 (verdict CORRECTIONS, un constat m et trois notes)

Pièce : `recherches:coordination/pieces/2026-10-07-g2-recherches/G2-243-delta3.json` (tête lue `a55985af`). Worker
`claude-opus-5-5`, effort max, worktree neuf détaché du scratchpad ; `git add` par chemins ; poussé sans force. Le tronc d'abord :
`7c50ee96` « Merge the trunk » (`e13cfff7`, la fusion de #244, sans conflit ; seul fichier commun, `docs/RUNBOOK-dojo.md`, où le
tronc n'ajoute que des lignes après la l.1000) ; puis le test rouge seul (`333665c1`), la correction (`7c0ee061`), le runbook
(`ce5e1062`) et cette note.

- **m-13, chaque adresse lue masquée dans chaque chemin imprimé** : `judge` met chaque littéral qu'il lit, de tout fichier et de
  toute ligne, admis ou non, dans une `BlockList` (`seen`) ; à la fin de `scan()`, chaque chemin imprimé (celui d'une occurrence, et
  celui d'un binaire non déclaré, que `undeclared` rend désormais en clair à `scan()`) passe une fois par `hide(chemin, seen)`,
  mémorisé par chemin. `hide()` lit le chemin depuis chaque index et masque toute suite qui se lit comme une adresse de `seen`
  (§3 « Lecture ») ; les littéraux du chemin y sont (ligne 0), si bien que `hide()` ne relit plus `spans()`. Aucune regex par
  littéral, donc ni cache ni préfiltre par littéral : une seule lecture par chemin, bornée (le texte s'arrête où aucune adresse ne
  continue ; une IPv4 n'est lue qu'à sa forme, une IPv6 qu'avec un `::`, sept deux-points, ou six et une queue pointée). La phrase
  du corps (« so a CI log never shows an address that the check reads ») tient ainsi pour toute forme que la porte lit, et pour les
  octets complétés de zéros ; le commentaire de `hide()` le dit. 13 lignes nettes dans le script.
- **Vecteurs** (test des chemins, un second arbre, une adresse par cas, construites à l'exécution dans les plages de banc d'essai et
  d'espace partagé) : deux littéraux de chemin, dont une adresse de documentation admise, à côté d'une adresse du contenu ; l'IPv4
  d'une ligne IPv4-mapped ; une IPv6 sous chacune de ses formes longues (pleine ; pleine à queue pointée, 45 caractères ; à `::`
  final, huit deux-points) ou en majuscules ; les deux lectures d'une adresse suivie d'un chiffre échappé ; une IPv4-mapped écrite
  en hex ; l'occurrence d'un fichier lu plus tard ; des octets complétés de zéros ; une autre occurrence du même fichier ; une
  récurrence qui se chevauche elle-même (forme a.b.a.b) ; un binaire non déclaré. Le cas de m-11 (`logs/host<adresse>.txt`) prend
  une adresse lue seulement dans son fichier, pour épingler l'adresse d'une occurrence du contenu.
- **Rouge d'abord** : au commit `333665c1`, le script de la fusion, `address_literals_mask_a_path_wherever_its_address_recurs_escaped`
  rouge par `ERR_ASSERTION` à l'assertion neuve : chacun des douze cas imprime des chiffres d'une adresse lue (18 occurrences des
  deux côtés) ; les 11 autres tests verts ; `every_killer_line_is_readable` y rougit aussi (11 lignes de tueur visent des lignes de
  la correction). À `7c0ee061` : 12/12 et la garde verte.
- **Sonde du relecteur**, rejouée telle quelle (ses dix vecteurs et ses deux témoins de masque trop large, un dépôt jetable par
  vecteur) : à `a55985af`, 7 vecteurs sur 10 impriment des chiffres d'une adresse lue (V2 à V7, V9) ; à `7c0ee061`, aucun ; les
  témoins V11 et V12 inchangés. Le littéral qui se chevauche lui-même : 2 suites de chiffres restaient, aucune.
- **Coût** (Node 24, Linux, `scan()` entier d'un dépôt jetable, sondes du relecteur) : 1 000 occurrences distinctes dans 1 000
  fichiers, 62 ms (349 ms à `a55985af`) ; 3 000, 163 ms (752 ms) ; le chemin pathologique (598 caractères, 50 littéraux, 1 050
  occurrences), 21 ms (620 ms). Pire cas construit, 200 chemins de 3 517 caractères faits seulement de chiffres et de points, ou de
  chiffres hex et de deux-points : 0,9 s et 2,7 s, soit 5 et 13 ms par chemin (0,1 s à `a55985af`, qui n'y lisait que les littéraux
  du chemin). Porte sur l'arbre : 941 littéraux lus mis dans `seen`, 3 s comme avant.
- **RUNBOOK-dojo §15 (0)** (note 1), en place, quatre lignes, aucune ajoutée ni ôtée (1 603 lignes avant et après) : la phrase
  d'avant le contrôle (l.565) dit qu'il tourne dans le même shell et lit `N` ; le contrôle `BatchMode` (l.568) imprime d'abord
  `N=$N` ; son attendu (l.571) nomme ce `N=`, et tout autre nom est un `STOP` (une valeur laissée dans le shell par la course de
  l'autre hôte) ; le retour arrière (l.572) n'ôte que les entrées du nom imprimé. Le bloc de copie pose `N` lui-même et imprime
  déjà le nom (son attendu `$N ED25519 …`). Aucun test ne lit ces lignes ; les 14 tueurs ancrés dans RUNBOOK-dojo à cette tête
  (6 de `test/dojo-publish-deploy.test.ts`, 8 de `test/probe-dojo-live.test.ts`, venus du tronc) restent ANCRE.
- **Notes 2 et 3** : §3 « Littéral », la parenthèse couvre le dernier octet 0 ; §9, les tueurs ancrés dans RUNBOOK-dojo y étaient
  6, et 14 le compte de son fichier de test.
- **Tueurs** : 20, tous ANCRE (`verifie-ancres` : 20 sur le fichier touché et depuis la fusion, 158 depuis la base `eb1beb01`,
  1 679 dans l'arbre ; 0 DERIVE, 0 PERDU). Au-dessus du test des chemins, `:128 CONST` (aucun échappement décodé par la lecture d'un
  chemin) remplace `:125`. Neufs, dans son corps : `:143 CONST` (seuls les littéraux de la ligne 0 gardés ; à la place de `:136`,
  au-dessus du cas de m-11), `:143 CONST` (le littéral d'une IPv6 non gardé : le H1 du relecteur), `:133 CONST` (les octets lus
  tels quels), `:168 SDL` (les chemins des occurrences non masqués) et `:169 CONST` (ceux des binaires non déclarés). Renumérotés :
  `:145` (ex-`:134`), `:163` (ex-`:152`), `:180` (ex-`:167`), `:161` (ex-`:150`), `:160` (ex-`:149`). `scripts/mutants/run.mjs
  --killers`, chacun seul, fichier rendu et sha256 vérifié : 20 tués par `ERR_ASSERTION` sur 20, aucun survivant ni non conclu ; le
  H1 rougit aussi le test des échappements (l'IPv6 d'un chemin aux deux-points encodés) ; `RESULTS.json` sha256 `2cb028e2…`.
- **Mutants à la main** : 20 sur les lignes neuves, par `--table`, chacun seul, fichier rendu et sha256 vérifié (`RESULTS.json`
  `1d2feb2c…`). 16 tués par assertion : la lecture d'un index sur deux, la borne de 45 réduite d'un caractère, un échappement en
  minuscules non décodé, les chiffres d'un échappement relus, un deux-points qui ne clôt pas un groupe, chaque deux-points compté
  comme un `::`, les bornes d'un groupe, des points, des deux-points et des `::` resserrées d'un cran, chacune des trois formes
  d'IPv6 non analysée, une IPv4 vérifiée comme une IPv6, le seul premier caractère d'une suite marqué, un littéral admis non
  gardé. 4 survivent, équivalents par construction (bornes et filtres de coût, ou mémoire) : lire au-delà d'un caractère qu'aucune
  adresse ne porte, ne pas tester la forme IPv4 avant de lire les octets, ne pas analyser l'IPv6 avant la `BlockList` (qui rend
  faux sur un texte qu'elle ne lit pas), ôter la mémoire par chemin ; aucun ne change une sortie des vecteurs.
- **red-proof** `--base 7c50ee96 --gel 7c0ee061 --draw 1 --seed 1` : 1 jugé, F2P (assert-fail à la base, pass au gel), 11
  inchangés, aucun refus ; population 1, 1 tueur tiré (`:128`), tué ; `RED-PROOF.json` sha256 `1a8ceda6…`, digest du gel
  `a5604f83…`.
- **Mesures** (à `ce5e1062`, Node 24.21.0, Linux) : `tsc --noEmit` 0 ; eslint des deux fichiers de code : 0 erreur (1
  avertissement, le script hors du champ d'eslint) ; `npm run lint` 0 ; `gate:vocab` (349 fichiers), `lang:gate` (0),
  `lint:ratchet` (69/69) et `export:check` verts ; winlint : 49 fichiers contre le tronc, 18 contre `a55985af` (le tronc fusionné
  compris), aucun risque Windows. `npm run test:main` : 2 938 tests, 2 916 verts, 22 sautés (préexistants), 0 rouge, 255 s ; test 42 (l'export public et son `npm ci && npm run ci` imbriqué) :
  vert, 80 s. Porte sur l'arbre : 0 occurrence, 0 entrée périmée, 0 non déclaré, 2 410 fichiers lus, 62 paires dans 27 fichiers, toutes
  trouvées.
- **Taille, forme de la CI** : 12 fichiers comptés, +485 −48, soit **533 lignes**, sous 547 (borne du lot) et sous 1 205 (borne de
  la CI) ; contenu : 0.
- **Non vérifié ici** : Windows (MONARK rejoue à la fusion) : la `BlockList` et ses formes IPv4-mapped, les noms de fixture à `%`
  et la borne de 250 ms sous Windows, et les points de §7 à §9.

## Points pour MONARK

- **Q-1** : les entrées-bornes de `test/retire-instants.test.ts` sont des adresses hors des plages, non des numéros. Elles sont listées
  avec leur raison. Autre voie : les sortir du test, au prix de ses bornes.
- **Q-2** : `::` est admise avec 0.0.0.0, et les numéros de section ou de clause avec les numéros de version, comme lus de la décision.
