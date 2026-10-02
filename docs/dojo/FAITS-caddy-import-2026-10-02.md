# FAITS — Caddy : `import`, `caddy validate`, `caddy reload` (FAITS-CADDY-IMPORT-1), lu sur place le 2026-10-02 07:14-07:15 UTC

Lecture sur place par l orchestrateur (règle du 2026-09-20), navigateur interne, avant le go de la migration de Bell (REPLACE vers IMPORT)
et de l acte A-6 ; demandé par Q-8 du lot BELL-CA-DOJO-1 et N-7 de la G2 de la partie 3. Version servie sur l hôte Bell, lue à 07:15 UTC :
`caddy version` = v2.11.4 ; fichier principal `/etc/caddy/Caddyfile` sans ligne `import`, empreinte `a74f5028…` égale au blob de
`deploy/Caddyfile.monark-bell` (mode REPLACE en place).

## `import` — https://caddyserver.com/docs/caddyfile/directives/import [lu]
- « Includes a snippet or file, replacing this directive with the contents of the snippet or file. »
- Évaluée « before the structure is parsed » ; le contenu remplace la ligne « as if that file's contents appeared here to begin with ».
- « It is an error if a specific file cannot be found » ; un fichier vide donne un avertissement ; un chemin relatif l est au fichier qui importe.
- Conséquence pour la migration : chaque candidat ne doit importer que des fichiers déjà présents (la forme retenue par BELL-CA-DOJO-1 :
  une ligne pour Bell, puis deux à A-6) ; un import vers un fichier absent est une erreur, pas une configuration vide.

## `caddy validate` — https://caddyserver.com/docs/command-line [lu]
- « deserializes the config, then loads and provisions all of its modules as if to start the config, but the config is not actually started ».
- La page note qu un module à ressource exclusive peut échouer sous une instance en marche (exemple : `acme_server`) et renvoie alors à
  `caddy reload` ; aucune de nos deux configurations n emploie `acme_server` (lu dans les deux fichiers du dépôt).

## `caddy reload` — même page [lu]
- « Gives the running Caddy instance a new configuration. This has the same effect as POSTing a document to the /load endpoint ».
- Via la page de `validate` : « If provisioning fails, the active config keeps running; if it succeeds, the new config is applied. »
- L API d administration ne doit pas être désactivée (aucune option `admin off` dans nos fichiers, lu).

## Ce qui reste à mesurer à l acte (non lu ici)
- Que `caddy validate` lise bien les fichiers importés du candidat sur l hôte (attendu par la forme `import` ci-dessus) : premier `validate`
  du candidat à une ligne, sortie gardée au JOURNAL.
- L émission du certificat de `dojo.monarkgate.tech` à A-6 : un refus n est jamais contourné (acte de l investisseur).
