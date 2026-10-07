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

Sans `-` en tête : le dossier existe sur l'hôte. Dans `deploy/`, seules les lignes `InaccessiblePaths=` changent (consigne de MONARK,
pour une fusion triviale avec le lot `recherches/host-address-gate`, qui touche d'autres fichiers de ce dossier). Les commentaires des
unités ne sont donc pas repris : celui de la l.49 du collecteur ne nomme encore que le dossier de l'éditeur. Le motif est ici et dans
l'en-tête du test.

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
4. Sans `-`, un dossier absent fait échouer le démarrage (226), jamais une course sans masque.
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

## 6. Tueurs

Au-dessus du test neuf : `// killer: deploy/monark-probe.service:40 SDL "InaccessiblePaths=/etc/monark/bell" -> ""`. Sur ses lignes
clés : le chemin ôté du collecteur, un `-` en tête chez l'éditeur, une affectation vide après le chemin (la ligne `UMask=` du
collecteur), le fichier d'environnement de la sonde du Dōjō placé sous le dossier, `DEFAULT_SMTP_PASS_FILE` placé sous le dossier.
Au-dessus de `dojo_collect_unit_never_loads_the_signing_key` : le chemin ôté du collecteur. Les deux autres tests jugés gardent leur
tueur, toujours ancré (les lignes visées ne bougent pas). Ancres : `verifie-ancres` et `every_killer_line_is_readable`.

## 7. Preuve prévue

`node scripts/red-proof.mjs --base 885554e5 --gel <tête> --draw 4 --seed 20261007` : quatre tests jugés, chacun F2P, quatre tueurs
tirés et tués. Puis `verifie-ancres`, `test:main`, `tsc --noEmit`, eslint des fichiers touchés, `gate:vocab`, `lang:gate`,
`lint:ratchet`, `export:check`, winlint, la construction du site et `scripts/assert-fleet-html.mjs`. R-25 sous la forme de la CI :
de l'ordre de 110 lignes, pour une borne de 1 205.

## 8. Volet (a) : l'hôte « dédié » borné

Le sens : l'hôte est un hôte de MONARK qui fait aussi tourner le Dōjō et une sonde Narabi.

- `/bell/method` (l.423), rubrique « generated » : « on the dedicated host from which the records are published, operated by MONARK »
  devient « on the host from which the records are published, a MONARK host that also runs the Dōjō and a Narabi probe ».
- `/bell` (l.616), clé publique : « generated on the dedicated host » devient « generated on the host that publishes the records, a
  MONARK host that also runs the Dōjō and a Narabi probe ».
- `fleet.ts` l.352 (`wiring.act`) : « on its own host » devient « on a MONARK host that also runs the Dōjō and a Narabi probe » ;
  l.361 (`served.note`, rendu sur `/bell`, `/docs/bell`, l'accueil et `/applications`) : « served on its own host » devient « served
  from a MONARK host that also runs the Dōjō and a Narabi probe ».

Anglais public, sans code interne, sans chiffre (porte d'honnêteté, chaînes du registre), sans nom de fournisseur. Portes :
`gate:vocab`, `lang:gate`, `bell-method`, `bell-served`, `bell-anchors`, `ci-gates`, `site-build-fleet`, `public-surfaces-honesty`,
`public-text-deny`, `site-honesty`, la construction du site.

## 9. Après la fusion (MONARK)

MONARK redéploie les quatre unités sous Q-20 (fichiers installés depuis le G7 de la fusion, `daemon-reload`), puis verse le relevé
`systemctl show -p InaccessiblePaths` de chacune ; attendu : `/etc/monark/bell` dans les quatre. Le premier démarrage de chaque unité
en est la preuve empirique (sans `-`, un dossier absent l'aurait fait échouer). Le contrôle `c09` de `scripts/verify-dojo.mjs`
compare les unités installées aux blobs du G7 qu'on lui donne : il se joue désormais avec le G7 de ce redéploiement.

## 10. Volet (c) et hors périmètre

- **(c) La séparation d'hôte est une dépense** : MONARK la porte au fondateur, avec la note de recherche qui la chiffre. Elle ôtera la
  ligne de ces unités (sans `-`, une unité posée sur un hôte sans ce dossier ne démarre pas) et la liste du test.
- Les autres tâches transitoires des RUNBOOK (A-8 §16, `--unlock` §19, départ simulé et (4b) de la §25) ne portent pas le masque ;
  elles tournent à la main, sous le go de l'opérateur. Non changées.
- « its own host » reste ailleurs sur le site, hors de l'item : `apps/site/app/bell/anchors/page.tsx` l.39 (« signed and chained on its
  own host », le plus proche du même excès), `apps/site/app/bell/page.tsx` l.36, `apps/site/app/docs/bell/page.tsx` l.60 (où l'hôte
  est le nom servi), `apps/site/lib/fleet-presentation.ts` l.130. À juger par MONARK.

## 11. DOJO-PROBE-UID-BOUNDARY-1 : chiffrée ici, non construite

Le vérificateur, enfant de la sonde du Dōjō, tourne sous l'uid `probe`, qui lit le mot de passe du courriel (le fichier `0600` de la
sonde, et l'environnement de `monark-probe` quand elle tourne). Construction chiffrée : une unité de vérification
`monark-dojo-verify.service` en `DynamicUser=yes`, tirée par la sonde avant elle.

- **Unité neuve** (~35 lignes) : `Type=oneshot`, `DynamicUser=yes` (systemd.exec(5) v259.5, xml l.694 : uid pris dans 61184…65519,
  `ProtectSystem=strict`, `ProtectHome=read-only` et `NoNewPrivileges=` impliqués) ; l'arbre de la sonde en lecture ; le réseau
  ouvert (le vérificateur lit l'hôte du Dōjō) ; `ExecStart=` la commande que la sonde lance aujourd'hui en enfant
  (`scripts/probe-dojo-live.mjs` l.183) ; le rapport dans un `RuntimeDirectory=` en `RuntimeDirectoryPreserve=yes` (sinon « always
  removed when the service stops », xml l.1727), lisible par `probe` ; l'enveloppe du vérificateur (512M, tas de 448 MiB) passe à
  cette unité.
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
  (DOJO-PROBE-MIRROR-1) reprend les mêmes unités.

Non triviale (deux unités, un passage de rapport, dix tests) : elle n'entre pas dans ce lot, dont l'échéance passe d'abord. Elle
garde son déclencheur, « avant DOJO-PROBE-MIRROR-1 ».
