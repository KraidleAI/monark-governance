# FAITS — systemd.exec(5), systemd-system.conf(5), systemctl(1) « latest » (lecture sur place, orchestrateur, `curl`, 2026-09-30 08:29:11Z, HTTP 200/200/200) — item FAITS-SYSTEMD-PUBLISH-1 (avant le G1 de PR-3b-2a)

Hôte visé : Bell/Dōjō en systemd 259 (FAITS-systemd-timer-2026-09-27.md) ; les pages « latest » sont lues, la concordance avec `man systemd.exec` de l hôte est à confirmer à A-5p (même réserve que FAITS-SYSTEMD-CRED-1). Citations ≤ 25 mots, [lu] première main.

## F-1 Groupes supplémentaires [lu, systemd.exec, `SupplementaryGroups=`]
- « this option does not override, but extends the list of supplementary groups configured in the system group database for the user ».
- Conséquence 2a : `User=dojo` + appartenance de `dojo` à `dojo-handoff` dans `/etc/group` suffit ; `SupplementaryGroups=dojo-handoff` est redondant mais rend le contrat lisible dans l unité et est relevable par `c09` (forme retenue : les deux, l unité déclare, A-2p pose l appartenance ; `id dojo` relu).

## F-2 Sources de l environnement d un processus lancé [lu, systemd.exec, « Environment Variables in Spawned Processes »]
- « Processes started by the system service manager generally do not inherit environment variables set for the service manager itself (but this may be altered via PassEnvironment=) ».
- Ordre des sources, la dernière gagne : `DefaultEnvironment=` (systemd-system.conf), `systemd.setenv=` (ligne de commande du noyau), `systemctl set-environment` ; variables du gestionnaire lui-même ; bloc du gestionnaire sous `PassEnvironment=` ; `Environment=` ; `EnvironmentFile=` ; PAM.
- « as the final step all variables listed in UnsetEnvironment= are removed from the compiled environment variable list ».
- « Hint: systemd-run -P env » « print the effective system and user service environment blocks ».
- Conséquence 2a/2b (TB-25, `c09`) : `DefaultEnvironment=` et `set-environment` ATTEIGNENT le processus de l unité de publication même sans `Environment=` ; donc `NODE_OPTIONS`, `NODE_TLS_REJECT_UNAUTHORIZED`, `SSL_CERT_*`, `*_PROXY` posés au gestionnaire toucheraient l éditeur et la sonde. Garde retenue : l unité de publication porte `UnsetEnvironment=NODE_OPTIONS NODE_TLS_REJECT_UNAUTHORIZED NODE_EXTRA_CA_CERTS SSL_CERT_FILE SSL_CERT_DIR HTTP_PROXY HTTPS_PROXY ALL_PROXY NO_PROXY http_proxy https_proxy all_proxy no_proxy` (dernier mot par construction) ; `c09` capture le bloc effectif par `systemctl show-environment` (bloc du gestionnaire) ET par `systemd-run -P --property=... env` OU par lecture de `/proc/<pid>/environ` de l unité en cours ; le test T-A6 épingle `UnsetEnvironment=` en plus de l absence de `Environment=`/`EnvironmentFile=`/`PassEnvironment=` (M-H17 étendu).

## F-3 `PassEnvironment=` [lu, systemd.exec]
- « Variables specified that are not set for the system manager will not be passed and will be silently ignored » ; « system services by default do not automatically inherit any environment variables set for the service manager itself ».
- `DefaultEnvironment=` [lu, systemd-system.conf] : « This environment block is internal, and changes are not reflected in the manager's /proc/PID/environ » ⇒ la capture par `/proc/1/environ` NE VOIT PAS ce bloc ; seule `systemctl show-environment` le montre (« Dump the systemd manager environment block. This is the environment block that is passed to all processes the manager spawns »).
- `set-environment` [lu, systemctl] : « this combined environment block will be further combined with per-unit environment variables, which are not visible in this command » ⇒ `show-environment` ne suffit pas à lui seul : `c09` combine `show-environment` (gestionnaire) et le bloc effectif d une invocation (`systemd-run -P env` avec les mêmes propriétés que l unité, ou `/proc/<pid>/environ` du service actif).

## F-4 `EnvironmentFile=` [lu, systemd.exec]
- Fichier UTF-8, BOM U+FEFF interdit ; « Similar to Environment=, but reads the environment variables from a text file » ; préfixe `-` tolère l absence. Aucune unité Dōjō n en porte (M-H17).

## F-5 Chemins imbriqués et fichiers [lu, systemd.exec, `ReadWritePaths=, ReadOnlyPaths=, InaccessiblePaths=`]
- « Nest ReadWritePaths= inside of ReadOnlyPaths= in order to provide writable subdirectories within read-only directories » ; « Use ReadWritePaths= in order to allow-list specific paths for write access if ProtectSystem=strict is used ».
- `InaccessiblePaths=` : « it is not possible to nest ReadWritePaths=, ReadOnlyPaths=, BindPaths=, or BindReadOnlyPaths= inside it ».
- « Non-directory paths may be specified as well » ; préfixe `-` ignore un chemin absent ; `+` = relatif à `RootDirectory=`.
- Conséquence 2a : `ProtectSystem=strict` + `ReadWritePaths=/var/lib/monark-dojo` (état, dont `public/`) + `ReadOnlyPaths=/opt/monark-dojo /var/lib/monark-dojo-collect/bundles` (imbrication valide : lecture seule sous strict) ; la clé n est PAS un `ReadOnlyPaths=` mais un `LoadCredential=` (FAITS-SYSTEMD-CRED-1) ; `InaccessiblePaths=/etc/monark/dojo` est admissible (rien à imbriquer dessous, la clé arrive par `$CREDENTIALS_DIRECTORY`) et relevé par `c09`.

## Non lu / réserves
- La page man de l hôte (systemd 259) n est pas relue ici : concordance à A-5p (`man systemd.exec` sur l hôte, sections F-1..F-5), écart = STOP.
- `SetLoginEnvironment=` (v255) vu au passage : `$HOME/$LOGNAME/$SHELL` posés dès que `User=` est posé ; sans effet sur les familles gardées.
- Copies texte : scratchpad de session (`systemd-exec.txt` 386 539 o html source, `systemd-system-conf.txt`, `systemctl.txt`), non versionnées.
