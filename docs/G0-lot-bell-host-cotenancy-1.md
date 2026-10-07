# G0 du lot BELL-HOST-COTENANCY-1, volets (a) et (b) : le dossier de la clé de Bell masqué aux quatre unités qui partagent son hôte, et l'hôte « dédié » borné

- **Item** : BELL-HOST-COTENANCY-1, volets (a) et (b), décidés par MONARK (messagerie RECHERCHES, message
  `2026-10-07-MONARK-vers-RECHERCHES-lot-bell-cotenance`, commit `0c3f24c`), sur le constat de PAROXYSME (inventaire de Bell, limite
  N-01, son message `34e59ab`). Deux ajouts de MONARK (message `2026-10-07-MONARK-vers-RECHERCHES-cotenance-ajouts-d7e`, commit
  `178d510`) : `apps/site/lib/fleet.ts` l.352 et l.361 entrent au volet (a) ; DOJO-PROBE-UID-BOUNDARY-1 est chiffrée au §11.
  Déclencheur : avant la publication seq 3 de Bell, au plus tard le 2026-10-09 à 23:59 UTC. Priorité haute.
- **Base** : tronc `lot/etude-suite` à `885554e5` (#234 ; la branche est partie de `eb1beb01` et a été avancée sans commit propre,
  aucun fichier du lot n'ayant changé entre les deux). **Branche** : `recherches/bell-key-isolation`. PR brouillon vers le tronc.
- **Statut** : G0 court, écrit avant le test rouge. Auteur : RECHERCHES, `claude-opus-5-5`, effort max ; heure lue (`date -u`)
  2026-10-07T19:29:38Z. La G2 est faite par une instance neuve, distincte de l'auteur.
- **Pli de la G2** (pièce recherches `coordination/pieces/2026-10-07-g2-recherches/G2-244-bell-key.json`, tête lue `c09637fb`,
  verdict CORRECTIONS : deux M, quatre m) et de la décision de MONARK `1887f64` §2 : les six constats sont pris, au §13 ; mesures
  au §14. Même auteur, `claude-opus-5-5`, effort max ; heure lue (`date -u`) 2026-10-07T21:29:03Z, écrit avant le test rouge du pli.

## 1. Constat

L'hôte de Bell porte aussi le Dōjō (collecteur, éditeur, sonde) et la sonde Narabi. Aucune de ces quatre unités ne masque
`/etc/monark/bell`, le dossier d'où `deploy/monark-bell-publish.service` charge sa clé (`LoadCredential=`, l.27). Les deux sondes
n'ont aucune ligne `InaccessiblePaths=` ; le collecteur (l.50) et l'éditeur (l.49) en ont une, vers leurs propres chemins.
Les modes protègent déjà la clé (dossier `700 root:root`, `docs/RUNBOOK-bell.md` l.118 et l.121 ; clé `600 root:root`), et les quatre
unités tournent sous des utilisateurs non root. Le masque est un second verrou, au niveau de l'espace de noms : il tient même si un
mode est élargi, ou si un fichier plus ouvert arrive dans le dossier (la clé neuve d'une rotation, même RUNBOOK l.555).

## 2. Périmètre fermé

| Fichier | Changement |
|---|---|
| `deploy/monark-dojo-collect.service` l.50, `deploy/monark-dojo-publish.service` l.49 | ` /etc/monark/bell` ajouté à la ligne `InaccessiblePaths=` existante |
| `deploy/monark-dojo-probe.service`, `deploy/monark-probe.service` | une ligne `InaccessiblePaths=/etc/monark/bell` après `ReadWritePaths=` (l.38, l.40) |
| `test/bell-key-isolation.test.ts` | neuf : le test rouge (§5) |
| `test/dojo-collect-deploy.test.ts`, `test/dojo-publish-deploy.test.ts`, `test/probe-dojo-live.test.ts` | leurs ensembles fermés de directives prennent le chemin (§5) |
| `docs/RUNBOOK-dojo.md` §18 (iv), l.1001 et l.1013 | la tâche transitoire passe le même chemin dans `"$I"`, et la phrase le dit : `dojo_runbook_jobs_carry_the_unit_properties` veut chaque propriété de la tâche égale à celle de l'unité |
| `apps/site/app/bell/method/page.tsx` l.423, `apps/site/app/bell/page.tsx` l.616, `apps/site/lib/fleet.ts` l.352 et l.361 | volet (a), §8 |
| **Pli** : `apps/site/lib/fleet-presentation.ts` l.130, `apps/site/app/bell/page.tsx` l.36, `apps/site/app/bell/anchors/page.tsx` l.39-41, `apps/site/app/docs/bell/page.tsx` l.60 | volet (a), les quatre « own host » restants (MONARK, `1887f64` §2.1 ; M-2), §8 |
| **Pli** : `docs/RUNBOOK-dojo.md` §25, actes (4) et (4b), l.1487-1489, l.1493, l.1501-1503, l.1514 | le départ simulé et la preuve du courriel passent `-p InaccessiblePaths=/etc/monark/bell`, et (4) dit l'arrêt sur un hôte sans ce dossier (m-1, M-1) |
| **Pli** : `test/probe-dojo-live.test.ts`, `dojo_probe_tree_is_the_import_closure` | chacun des deux départs simulés porte les propriétés épinglées de l'unité, le masque compris : rouge d'abord (m-1, §5) |
| **Pli** : `deploy/monark-dojo-collect.service` l.49, `deploy/monark-dojo-publish.service` l.44-47, `deploy/monark-dojo-probe.service` l.38, `deploy/monark-probe.service` l.32 | les commentaires disent ce que chaque masque couvre et pourquoi il n'a pas de `-` (m-3) |
| **Pli** : `test/bell-key-isolation.test.ts`, en-tête | « committed unit » ; une unité que le dépôt ne porte pas (Caddy) est hors de sa vue (m-2) |

Sans `-` en tête : le dossier existe sur l'hôte (`docs/RUNBOOK-bell.md`, étape 3) ; ce que cela coûte sur tout autre hôte : §10.
La première version de ce G0 ne changeait dans `deploy/` que les lignes `InaccessiblePaths=`, et en donnait pour raison une consigne
de MONARK, pour une fusion triviale avec `recherches/host-address-gate`. Cette consigne n'existe pas (G2, m-3) : `0c3f24c` (b) dit
seulement que, pour les deux premières unités, le chemin s'ajoute à la ligne existante ; et `recherches/host-address-gate`
(`20653902`) ne touche, dans `deploy/`, que `Caddyfile.monark-harness` et `monark-bell-publish.service`, aucune des quatre unités.
Le pli réécrit donc les commentaires pour qu'ils décrivent les lignes : en place, au même nombre de lignes, là où une ligne ajoutée
déplacerait une ancre de tueur (collecteur l.50, l.52 et l.54 ; éditeur l.48, l.49 et l.52 ; sonde Narabi l.40, le masque même,
dont le commentaire devient un membre de la phrase l.32) ; une ligne neuve au-dessus du masque de la sonde du Dōjō, dont les ancres
(l.20, l.29) sont plus haut : le masque y passe à la l.39.

## 3. systemd.exec(5) à la version de l'hôte

Version de l'hôte : `systemd 259 (259.5-0ubuntu3.4)` (`docs/RUNBOOK-bell.md` l.77 ; `docs/dojo/FAITS-systemd-timer-2026-09-27.md`
l.14). Lu le 2026-10-07 : `man/systemd.exec.xml` de systemd au tag `v259.5`, l'amont du paquet (sha256 `c7a2858d…`), et la page
Ubuntu `manpages.ubuntu.com/manpages/resolute/man5/systemd.exec.5.html`, « Provided by: systemd (Version: 259.5-0ubuntu3.4) »
(sha256 `e3e3bed1…`), qui porte les mêmes phrases. Au tag `v259`, ces entrées sont identiques, sauf une note ajoutée sous
`ProtectHome=` (dossiers personnels hors des emplacements standard), sans effet ici. Section **SANDBOXING** :

- entrée `ReadWritePaths=, ReadOnlyPaths=, InaccessiblePaths=, ExecPaths=, NoExecPaths=` (xml l.1755-1800) : « Paths listed in
  InaccessiblePaths= will be made inaccessible for processes inside the namespace along with everything below them in the file system
  hierarchy » ; « it is not possible to nest ReadWritePaths=, ReadOnlyPaths=, BindPaths=, or BindReadOnlyPaths= inside it » ; « These
  options may be specified more than once, in which case all paths listed will have limited access » ; « If the empty string is
  assigned to this option, the specific list is reset » ; le préfixe `-` : « ignored when they do not exist » ; « the effect of these
  settings may be undone by privileged processes » ;
- `ProtectSystem=` (xml l.1452) : « If set to "strict" the entire file system hierarchy is mounted read-only » ; « In general it has
  the same limitations as ReadOnlyPaths= » ;
- `ProtectHome=` (xml l.1481) : « Setting this to "yes" is mostly equivalent to setting the three directories in InaccessiblePaths= » ;
- codes de sortie : 226, `EXIT_NAMESPACE`, « Failed to set up mount, UTS, or IPC namespacing ».

Pour les quatre unités :

1. Sous `ProtectSystem=strict`, le masque se pose dans le même espace de noms que la hiérarchie en lecture seule. La page interdit un
   chemin `ReadWritePaths=`, `ReadOnlyPaths=` ou `Bind*` sous un chemin masqué ; aucune des quatre n'en déclare sous `/etc/monark/bell`
   (écriture : `/var/lib/…` ; lecture seule de l'éditeur : `/var/lib/monark-dojo-collect/bundles`). Cette forme tourne déjà sur l'hôte :
   le collecteur et l'éditeur masquent des chemins sous `ProtectSystem=strict` et `ProtectHome=true`.
2. `ProtectHome=true` masque `/home/`, `/root` et `/run/user` : rien de commun avec `/etc/monark/bell`.
3. Ajouter le chemin à la ligne existante ou écrire une seconde ligne donne la même liste. Une affectation vide la viderait : le test
   lit les lignes dans l'ordre et applique cette remise à zéro.
4. Sans `-`, un dossier absent fait échouer le démarrage (226), jamais une course sans masque. La contrepartie : les quatre unités,
   telles que committées, ne démarrent que sur un hôte qui porte ce dossier (§10, M-1).
5. La réserve sur les processus privilégiés ne joue pas : les quatre unités tournent sous `dojo-collect`, `dojo` et `probe`, non root,
   avec `NoNewPrivileges=true`. `CapabilityBoundingSet=~CAP_SYS_ADMIN` et `SystemCallFilter=~@mount`, que la page recommande, restent
   hors du lot.

## 4. Aucune des quatre unités ne lit ce dossier

Lu dans chaque unité et dans le code que lance son `ExecStart=` (l'arbre que livre le RUNBOOK, par sa constante) :

| Unité | Programme et arbre | Chemins lus hors de l'arbre |
|---|---|---|
| collecteur | `apps/dojo/src/collect.ts`, `DOJO_COLLECT_TREE_PATHS` (26 fichiers) | argv `--state`, `--mint-file` ; graine et ancre sous `$CREDENTIALS_DIRECTORY` (sources sous `/etc/monark/dojo-collect/`) ; `/etc/monark/dojo-collect.env`, clés fermées `DOJO_COLLECT_ENV_KEYS` (une liste d'URL, une clé, deux valeurs de cycle : aucun chemin) |
| éditeur | `apps/dojo/scripts/dojo-publish.mjs`, `DOJO_PUBLISH_TREE_PATHS` (10) | argv `--inbox`, `--state` ; sa clé sous `$CREDENTIALS_DIRECTORY` (source sous `/etc/monark/dojo/`) ; aucune autre variable |
| sonde du Dōjō | `scripts/probe-dojo-live.mjs`, `DOJO_PROBE_TREE_PATHS` (8) | `DEFAULT_OUT` (sous `/var/lib/monark-probe/`), `DEFAULT_SMTP_PASS_FILE` (`/etc/monark/dojo-probe-smtp-pass`), trousseau et vérificateur dans l'arbre ; `/etc/monark/probe.env`, clés du courriel |
| sonde Narabi | `scripts/probe-narabi.mjs`, seul | `PROBE_OUT` (posé par l'unité, sous `/var/lib/monark-probe/`) ; https, ou http de boucle locale (`urlTransportAllowed` : jamais `file:`) ; `--file` et `--state-file` par l'argv seul, que l'unité ne donne pas ; `probe.env` porte les clés du courriel et `PROBE_URL` (`docs/RUNBOOK-sentinel.md` l.611-613) |

Aucun fichier de ces quatre arbres ne nomme `/etc/monark/bell`, `bell-signing-key` ni un `signing-key*.pem` ; le seul littéral
`/etc/` est `DEFAULT_SMTP_PASS_FILE`. Les autres « bell » sont des commentaires, le module pur `apps/bell/scripts/bell-chain.mjs`
(il n'importe que `node:crypto`), la table des méthodes du garde et le nom de la variable `BELL_SOLANA_RPC` (des URL). Aucune
directive des quatre unités ne nomme un chemin sous `/etc/monark/bell`. Le test garde ces deux constats (§5, points 4 et 5).

## 5. Tests

- **Neuf, rouge d'abord** : `test/bell-key-isolation.test.ts`, `bell_key_directory_is_inaccessible_to_every_unit_sharing_its_host`.
  (1) Le dossier est celui de la source de l'unique `LoadCredential=` de l'unité de Bell, épinglé `/etc/monark/bell`. (2) Les
  `deploy/*.service` sont l'unité de Bell, les quatre de son hôte et les deux de l'hôte du site (harnais, sentinelle) : une unité
  neuve doit être classée. (3) Pour chacune des quatre, les lignes `InaccessiblePaths=` de `[Service]`, lues dans l'ordre (une
  affectation vide remet la liste à zéro) et coupées aux blancs, portent le dossier une fois, sans `-` (ni `+`). (4) Aucune autre
  directive de ces unités ne nomme un chemin sous lui. (5) Aucun fichier de code des quatre arbres ne le nomme. Rouge sur l'arbre du
  tronc par assertion, au point 3, dès la première unité.
- **Adaptés** (ils épinglent des ensembles fermés) : `dojo_collect_unit_never_loads_the_signing_key` (l.91, un tueur neuf au-dessus) et
  le `SERVICE` du collecteur ; `dojo_two_units_share_no_writable_path` (l.183 et l.188) et le `SERVICE()` de l'éditeur ; le `want` de
  `dojo_probe_units_are_hardened`. Les trois tests jugés sont rouges sur l'arbre du tronc.
- **Adapté au pli, rouge d'abord** (m-1) : `dojo_probe_tree_is_the_import_closure` lisait les propriétés du départ simulé dans toute
  la §25, si bien qu'un seul des deux départs pouvait les porter. Il lit désormais chaque départ simulé, (4) puis (4b), qui doit
  porter chacune des propriétés épinglées de l'unité ; la paire `InaccessiblePaths=/etc/monark/bell` entre dans la liste. Rouge sur
  la tête `c09637fb` par assertion, sur cette paire ; vert avec le RUNBOOK plié.

## 6. Tueurs

Au-dessus du test neuf : `// killer: deploy/monark-probe.service:40 SDL "InaccessiblePaths=/etc/monark/bell" -> ""`. Sur ses lignes
clés : le chemin ôté du collecteur, un `-` en tête chez l'éditeur, une affectation vide après le chemin (la ligne `UMask=` du
collecteur), le fichier d'environnement de la sonde du Dōjō placé sous le dossier, `DEFAULT_SMTP_PASS_FILE` placé sous le dossier.
Au-dessus de `dojo_collect_unit_never_loads_the_signing_key` : le chemin ôté du collecteur. Les deux autres tests jugés gardent leur
tueur, toujours ancré (les lignes visées ne bougent pas). Ancres : `verifie-ancres` et `every_killer_line_is_readable`.

Au pli, deux tueurs dans le corps de `dojo_probe_tree_is_the_import_closure` :
`// killer: docs/RUNBOOK-dojo.md:1493 CONST " -p InaccessiblePaths=/etc/monark/bell" -> ""` et le même à la l.1514. Chacun ôte le
masque d'un seul des deux départs simulés : la lecture par départ le voit, la lecture de toute la section ne l'aurait pas vu. Les
commentaires réécrits des unités ne déplacent aucune ancre (§2).

## 7. Preuve prévue

`node scripts/red-proof.mjs --base 885554e5 --gel <tête> --draw 4 --seed 20261007` : quatre tests jugés, chacun F2P, quatre tueurs
tirés et tués. Puis `verifie-ancres`, `test:main`, `tsc --noEmit`, eslint des fichiers touchés, `gate:vocab`, `lang:gate`,
`lint:ratchet`, `export:check`, winlint, la construction du site et `scripts/assert-fleet-html.mjs`. R-25 sous la forme de la CI :
de l'ordre de 110 lignes, pour une borne de 1 205.

Au pli : `red-proof --base 885554e5 --gel <commit du RUNBOOK plié> --draw 4 --seed 20261007`, cinq tests jugés attendus (les quatre
du lot, puis `dojo_probe_tree_is_the_import_closure`) ; `scripts/mutants/run.mjs --killers` sur tous les tueurs des quatre fichiers
de test changés (47) ; puis les mêmes contrôles et portes, la construction du site et `assert-fleet-html`. R-25 : environ 135.

## 8. Volet (a) : l'hôte « dédié » borné

Le sens : l'hôte est un hôte de MONARK qui fait aussi tourner le Dōjō et une sonde Narabi.

- `/bell/method` (l.423), rubrique « generated » : « on the dedicated host from which the records are published, operated by MONARK »
  devient « on the host from which the records are published, a MONARK host that also runs the Dōjō and a Narabi probe ».
- `/bell` (l.616), clé publique : « generated on the dedicated host » devient « generated on the host that publishes the records, a
  MONARK host that also runs the Dōjō and a Narabi probe ».
- `fleet.ts` l.352 (`wiring.act`) : « on its own host » devient « on a MONARK host that also runs the Dōjō and a Narabi probe » ;
  l.361 (`served.note`, rendu sur `/bell`, `/docs/bell`, l'accueil et `/applications`) : « served on its own host » devient « served
  from a MONARK host that also runs the Dōjō and a Narabi probe ».

Au pli, les quatre « own host » restants (G2, M-2 ; MONARK, `1887f64` §2.1 : « La phrase doit être bornée partout dans le même lot,
sinon le site se contredit ») :

- `fleet-presentation.ts` l.130, le « What's inside » de Bell, rendu sur la même carte de `/applications` que l'act et la served note :
  « A public timeline served on its own host, … » devient « A public timeline served from a MONARK host that also runs the Dōjō and a
  Narabi probe, … ».
- `/bell`, description des métadonnées (l.36) : « …, served on its own host. » devient « …, served from a MONARK host that also runs
  the Dōjō and a Narabi probe. ».
- `/bell/anchors` (l.39-41) : « a published Bell record is signed and chained on its own host » devient « … signed and chained on the
  host that publishes it, a MONARK host that also runs the Dōjō and a Narabi probe », avant le lien vers `/bell#served`.
- `/docs/bell` (l.60) : « it publishes from its own host, <a>…</a> » devient « it publishes at its own web address, <a>…</a> ». Le
  nom servi (`https://bell.monarkgate.tech`) est bien propre à Bell, et le mot « host » n'y prend plus un autre sens qu'à la phrase
  suivante, qui rend la served note. La G2 proposait « its own address » : « web address » écarte la lecture d'une adresse de
  réseau, que Bell partage avec le Dōjō.

Aucun test n'épingle ces phrases par leur texte ; `test/site-build-fleet.test.ts` n'est pas touché (la question de MONARK,
`1887f64` §2.2 : le noyau de PXC-02 y change ensuite l.1092-1093).

Anglais public, sans code interne, sans chiffre (porte d'honnêteté, chaînes du registre), sans nom de fournisseur. Portes :
`gate:vocab`, `lang:gate`, `bell-method`, `bell-served`, `bell-anchors`, `ci-gates`, `site-build-fleet`, `public-surfaces-honesty`,
`public-text-deny`, `site-honesty`, la construction du site.

## 9. Après la fusion (MONARK)

MONARK redéploie les quatre unités sous Q-20 (fichiers installés depuis le G7 de la fusion, `daemon-reload`), puis verse le relevé
`systemctl show -p InaccessiblePaths` de chacune ; attendu : `/etc/monark/bell` dans les quatre. Le premier démarrage de chaque unité
en est la preuve empirique (sans `-`, un dossier absent l'aurait fait échouer). Le contrôle `c09` de `scripts/verify-dojo.mjs`
compare les unités installées aux blobs du G7 qu'on lui donne : il se joue désormais avec le G7 de ce redéploiement.

## 10. Volet (c), le lien du masque à l'hôte, et hors périmètre

- **Le masque lie les quatre unités à un hôte qui porte `/etc/monark/bell`** (G2, M-1). Sans `-`, une unité posée sur un hôte sans
  ce dossier ne démarre pas : `src/core/namespace.c` de systemd v259.5 l.1853-1867 (`lstat()` en `ENOENT` sans `m->ignore` rend une
  erreur), code 226 `EXIT_NAMESPACE` (systemd.exec(5) l.4886-4888), avant que le programme ne tourne, donc sans relevé ni courriel.
  `docs/RUNBOOK-bell.md` ne crée ce dossier qu'à son étape 3, sur l'hôte de Bell. Or DOJO-PROBE-MIRROR-1 (item ouvert de MONARK ;
  `docs/G1-lot-dojo-live-health-1.md` §6) pose la sonde miroir sur le serveur du site avec « le même arbre et les mêmes unités », par
  les actes (1) à (5) de la §25, pour « aucune ligne de code ». Telle quelle, `monark-dojo-probe.service` y échouerait à chaque départ
  du minuteur. Depuis le pli, les actes (4) et (4b) portent le même masque (m-1) : sur un tel hôte, l'acte (4) s'arrête
  (`sim_exit=226`, aucun relevé), avant le minuteur de l'acte (5). La sonde miroir prend donc sa propre unité committée, sans ce
  masque (le test neuf la force à être classée, avec l'hôte du site), ou un retrait du masque par un autre fichier committé ; jamais
  un drop-in posé sur l'hôte : l'acte (3) attend `DropInPaths=` vide (`docs/RUNBOOK-dojo.md` l.1482) et proscrit `systemctl edit`.
  Le choix revient au G0 de DOJO-PROBE-MIRROR-1. Porteur : MONARK ; déclencheur : avant DOJO-PROBE-MIRROR-1. Son prix change : la
  ligne datée proposée pour ETAT est au §13.
- **(c) La séparation d'hôte est une dépense** : MONARK la porte au fondateur, avec la note de recherche qui la chiffre. Elle ôtera la
  ligne de ces unités, qui sinon ne démarreraient pas sur un hôte sans ce dossier (ci-dessus), et la liste du test.
- **Tâches transitoires** : A-8 (§16) et `--unlock` (§19) ne portent aucun masque, déjà avant ce lot ; elles tournent à la main, sous
  le go de l'opérateur : non changées. Le départ simulé (4) et la preuve du courriel (4b) de la §25 portent le masque depuis le pli
  (m-1) : l'acte (4) est la preuve du départ de l'unité avant le minuteur.
- **Deux résidus de la co-location, hors de la lettre de l'item** (G2, m-2), chacun porté par MONARK :
  - **Caddy** tourne sur l'hôte de Bell, exposé à Internet (il sert `bell.monarkgate.tech` et `dojo.monarkgate.tech` :
    `deploy/Caddyfile.monark-bell` l.1-4, `deploy/Caddyfile.monark-dojo` l.1-3), par l'unité de son paquet, que le dépôt ne porte
    pas (`docs/RUNBOOK-bell.md` l.73-80). Rien ne lui donne `InaccessiblePaths=/etc/monark/bell`, et le test, qui ne classe que les
    unités committées, ne peut pas la voir (son en-tête le dit). Les modes protègent (dossier `700 root:root`) tant que Caddy tourne
    sous l'utilisateur `caddy`, comme le disent les unités de publication (`deploy/monark-bell-publish.service` l.44) ; l'unité
    réelle du paquet n'est relevée nulle part (non vérifié par la G2). Constructions : un drop-in committé de `caddy.service`, posé
    par un acte d'hôte sous Q-20, après le relevé `systemctl cat caddy` ; ou rien jusqu'à (c). Déclencheur proposé : avec le
    redéploiement des quatre unités (§9).
  - **Le sens inverse** : l'unité de Bell ne masque aucun secret des autres unités (`/etc/monark/dojo`, `/etc/monark/dojo-collect`,
    `/etc/monark/dojo-collect.env`, `/etc/monark/probe.env`, `/etc/monark/dojo-probe-smtp-pass`), alors que le collecteur et
    l'éditeur se masquent l'un l'autre (D-5). Les modes protègent (`bell` n'est pas root). Le faire change l'ensemble fermé de
    l'unité de Bell (`test/bell-deploy-config.test.ts` l.59 : une ligne ajoutée y rougit
    `bell_deploy_config_publish_unit_least_privilege_offline`, H18 de la G2), ce test et les contrôles qui relèvent cette unité
    (contrôle 11 de `scripts/verify-bell.mjs`, `c10` de `scripts/verify-dojo.mjs`). Déclencheur proposé : le prochain lot qui
    touche l'unité de Bell, ou (c).
- « its own host » ne reste plus nulle part sur le site après le pli (M-2, §8 ; relevé au §14).

## 11. DOJO-PROBE-UID-BOUNDARY-1 : chiffrée ici, non construite

Le vérificateur, enfant de la sonde du Dōjō, tourne sous l'uid `probe`, qui lit le mot de passe du courriel (le fichier `0600` de la
sonde, et l'environnement de `monark-probe` quand elle tourne). Construction chiffrée : une unité de vérification
`monark-dojo-verify.service` en `DynamicUser=yes`, tirée par la sonde avant elle.

- **Unité neuve** (~35 lignes) : `Type=oneshot`, `DynamicUser=yes` (systemd.exec(5) v259.5, xml l.694 : uid pris dans 61184…65519,
  `ProtectSystem=strict`, `ProtectHome=read-only` et `NoNewPrivileges=` impliqués) ; l'arbre de la sonde en lecture ; le réseau
  ouvert (le vérificateur lit l'hôte du Dōjō) ; `ExecStart=` la commande que la sonde lance aujourd'hui en enfant
  (`scripts/probe-dojo-live.mjs` l.183) ; le rapport dans un `RuntimeDirectory=` en `RuntimeDirectoryPreserve=yes` (sinon « always
  removed when the service stops », xml l.1727), lisible par `probe` ; l'enveloppe du vérificateur (512M, tas de 448 MiB) passe à
  cette unité. Sur l'hôte de Bell, elle porte aussi `InaccessiblePaths=/etc/monark/bell` : le test neuf la force à être classée,
  puis à porter le masque (pli, M-1).
- **La sonde** : `Wants=` et `After=` vers elle, jamais `Requires=` (systemd.unit(5) v259.5 : l'unité requise en échec, avec `After=`,
  « this unit will not be started » ; un refus du vérificateur couperait alors le courriel). L'étape 4 (`runVerifier`, l.178-200,
  appelée l.221) lit le rapport, borné et récent, au lieu de lancer l'enfant ; `VERIFIER_ENV` et `VERIFIER_TIMEOUT_MS` passent à
  l'unité. Code ~60 lignes.
- **Tests et RUNBOOK** : les neuf tests de l'enfant (`test/probe-dojo-live.test.ts` l.161-260) et celui du mot de passe lu après lui
  (l.420) passent au rapport ; les ensembles fermés des deux unités ; la §25 (copie de l'unité, `daemon-reload`, départ simulé des
  deux). En tout ~300 lignes comptées par R-25.
- **Risques** : (r1) un rapport d'une course antérieure lu comme courant (l'unité l'efface en partant, la sonde vérifie sa date) ;
  (r2) une publication entre la vérification et les lectures de la sonde : la dernière tranche de publication est 06:30 UTC, la sonde
  part à 07:30, 09:30 et 13:30, donc aucune hors d'un départ à la main ou d'un rattrapage au démarrage de l'hôte (le minuteur de
  publication est en `Persistent=true`) ; (r3) l'uid recyclé (la page le dit) : rien ne reste hors de
  `/run` ; (r4) le secret reste sous l'uid `probe`, seul le vérificateur, qui lit des données distantes, en sort : c'est la limite que
  l'item demande ; (r5) une unité neuve entre dans l'autorisation unique du fondateur (Q-20), et la sonde miroir
  (DOJO-PROBE-MIRROR-1) ne reprend pas ces unités telles quelles : le masque de Bell les lie à l'hôte de Bell (§10, M-1).

Non triviale (deux unités, un passage de rapport, dix tests) : elle n'entre pas dans ce lot, dont l'échéance passe d'abord. Elle
garde son déclencheur, « avant DOJO-PROBE-MIRROR-1 ».

## 12. Mesures avant le pli (code à `05b38ce6`, base `885554e5` ; celles du pli : §14)

- **Rouge d'abord** : le test neuf seul (commit `10f13ac1`), sur les unités du tronc, échoue par assertion au point 3, sur le
  collecteur ; les points 1 et 2 passent déjà.
- **red-proof** `--base 885554e5 --gel 05b38ce6 --draw 4 --seed 20261007` : OK, 4 tests jugés (42 inchangés), chacun F2P ; 4 tueurs
  tirés, 4 tués (`RED-PROOF.json`, sha256 `d49bd0313fbeaf29…`).
- **Tueurs des lignes clés** (`scripts/mutants/run.mjs --killers --only K1,…,K7` : les six du test neuf, puis celui du collecteur) :
  7 tués sur 7 (`RESULTS.json`, sha256 `19f85fd389798fe5…`). L'affectation vide (K2) n'est tuée que parce que le test applique la
  remise à zéro de systemd.
- **Ancres** : `verifie-ancres --touched 885554e5 05b38ce6 --ref 885554e5` : 45 tueurs, 45 ANCRE, aucune dérive ; arbre entier :
  1 650 ANCRE ; `every_killer_line_is_readable` vert.
- **Suite** : `test:main`, 2 926 tests, 2 904 passés, 0 échec, 22 sautés (sauts conditionnels déjà là : win32, corpus d'hôte ou
  artefacts absents), 316 s. `tsc --noEmit` : 0. eslint du dépôt : 0. `lint:ratchet` : 69/69. `gate:vocab` (349 fichiers),
  `lang:gate`, `export:check`, `lint-model-pinning` : propres. winlint `--base 885554e5` : 13 fichiers, aucun danger.
- **Site** : `npm run build -w @monark/site`, puis `node scripts/assert-fleet-html.mjs` : OK. Les pages construites portent la phrase
  neuve (`/bell/method`, `/bell`, `/docs/bell`, l'accueil, `/applications`) et plus « dedicated host » ; « on its own host » ne reste
  qu'aux endroits du §10 (métadonnées de `/bell` l.36, `fleet-presentation.ts` l.130).
- **R-25** (forme de la CI, `docs/**/*.md` exclus) : 105 + 17 = 122 lignes, pour une borne de 1 205 ; contenu : 0.
- **Non vérifié ici** : l'hôte (le démarrage après le redéploiement et le relevé `systemctl show`, actes de MONARK, §9). Aucun chemin
  propre à Windows : des fichiers d'unité et des tests qui les lisent.

## 13. Pli de la G2 (CORRECTIONS, tête lue `c09637fb`)

| Constat | Pli |
|---|---|
| **M-1** : sans `-`, la sonde du Dōjō ne démarre que sur un hôte qui porte `/etc/monark/bell` ; DOJO-PROBE-MIRROR-1 pose la même unité sur le serveur du site | §10 (ligne neuve, avec porteur et déclencheur), §3 point 4, §11 (unité neuve, r5) ; la §25 (4) dit l'arrêt sur un hôte sans le dossier ; ligne datée proposée ci-dessous |
| **M-2** : quatre « own host » restent, le site se contredit | les quatre lieux, avec les formules de la G2 (§8 ; `/docs/bell` : « web address ») ; site construit, `assert-fleet-html`, relevé des pages au §14 ; `test/site-build-fleet.test.ts` non touché |
| **m-1** : les actes (4) et (4b) se disent faits avec le bac à sable de l'unité, sans son masque | `-p InaccessiblePaths=/etc/monark/bell` aux deux `$S` (l.1493, l.1514) ; `dojo_probe_tree_is_the_import_closure` lit chaque départ simulé et porte la paire, rouge d'abord (§5) ; deux tueurs (§6) |
| **m-2** : Caddy et le sens inverse ne sont pas nommés | §10, deux résidus, chacun avec son porteur (MONARK) et un déclencheur proposé ; l'en-tête du test dit « committed unit » et nomme l'unité de Caddy hors de sa vue |
| **m-3** : les commentaires décrivent mal les lignes ; le §2 cite une consigne de MONARK qui n'existe pas | commentaires réécrits (collecteur l.49, éditeur l.44-47, sonde du Dōjō l.38, sonde Narabi l.32), au même nombre de lignes là où une ancre bougerait ; §2 corrigé |
| **m-4** : le corps de la PR tait les quatre phrases et porte deux puces périmées | Summary et « Public wording » nomment les huit lieux ; « Not verified here » dit la CI lue et la revue faite, ses constats pris ; une puce dit qu'un hôte sans le dossier ne fait pas tourner ces unités telles quelles ; `prbody.mjs` jusqu'à propre |

**Ligne datée proposée pour DOJO-PROBE-MIRROR-1** (à verser à `docs/ETAT.md`, fichier de MONARK : RECHERCHES ne l'écrit pas ;
forme de l'item, sans apostrophes) :

> Ligne datée (RECHERCHES, 2026-10-07 21:3x UTC ; G2 de #244, M-1, pièce recherches
> `coordination/pieces/2026-10-07-g2-recherches/G2-244-bell-key.json` ; pli de #244, `docs/G0-lot-bell-host-cotenancy-1.md` §10) :
> BELL-HOST-COTENANCY-1 (b) donne à `deploy/monark-dojo-probe.service` la ligne `InaccessiblePaths=/etc/monark/bell`, sans `-`, et
> le même masque aux actes (4) et (4b) de la section 25. Sur le serveur du site, où ce dossier n existe pas (`docs/RUNBOOK-bell.md`
> ne le crée qu à son étape 3, sur l hôte de Bell), l unité telle quelle ne démarre pas (226, `EXIT_NAMESPACE`) : chaque départ du
> minuteur y échouerait avant la sonde, sans relevé ni courriel ; l acte (4) s y arrête avant le minuteur (`sim_exit=226`). La sonde
> miroir ne reprend donc pas les mêmes unités, et son prix n est plus « aucune ligne de code » : une unité propre et committée, sans
> ce masque, avec son minuteur (le test `bell_key_directory_is_inaccessible_to_every_unit_sharing_its_host` la force à être classée,
> avec l hôte du site), ou un retrait committé du masque ; jamais un drop-in posé sur l hôte (l acte (3) attend `DropInPaths=`
> vide). Le choix revient à son G0. Porteur, déclencheur et état inchangés.
