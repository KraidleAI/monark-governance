# FAITS : `header_up -X-Forwarded-For` retire aussi l en-tête que Caddy pose lui-même (Caddy v2.11.4)

Item FAITS-CADDY-HEADER-UP-DELETE-1 (I-1 du G1 de SITE-SEND-PREP, `9e016897`, bloquant avant l acte DOJO-SITE-PROXY-1).
Lecture sur place par l orchestrateur, navigateur interne, le 2026-10-02 entre 01:48 et 01:55 UTC (`date -u`). Niveau [lu] partout.

## Version installée

- Serveur du site (vitrine), lu par `caddy version` le 2026-10-02 vers 01:50 UTC : `v2.11.4`. Service `caddy` `active`.

## Documentation (page primaire)

- `https://caddyserver.com/docs/caddyfile/directives/reverse_proxy`, section « Headers » : « To delete a request header, preventing it
  from reaching the backend: header_up -Some-Header ».
- Même page, section « Defaults » : Caddy « sets or augments the X-Forwarded-For header field » ; il pose aussi `X-Forwarded-Proto`
  et `X-Forwarded-Host`. La page ne dit pas dans quel ordre la suppression et la pose s appliquent : lu dans la source ci-dessous.
- Même page : `proxy_protocol` « prepending the real client IP data » ; « By default, this is disabled ». L extrait ne l active pas.

## Source à la version installée

`https://raw.githubusercontent.com/caddyserver/caddy/v2.11.4/modules/caddyhttp/reverseproxy/reverseproxy.go` (1 877 lignes) :
- l.489 : `ServeHTTP` appelle `prepareRequest` ; l.868, dans `prepareRequest` : `addForwardedHeaders` pose `X-Forwarded-For`
  (l.941-952 : ajout de l adresse du client à la valeur reçue, ou pose).
- l.521-522 : `reqHost` et `reqHeader` sont pris APRÈS `prepareRequest`, donc avec l `X-Forwarded-For` posé par Caddy.
- l.573 : chaque essai appelle `proxyLoopIteration` avec `reqHeader` ; l.689-697 : les en-têtes de l essai sont recopiés de
  `reqHeader`, puis les opérations du transport, puis celles de l utilisateur (`header_up`) s appliquent ; commentaire l.681-682 :
  « transport first, then user, so user's config wins ».
- Aucune autre occurrence de `X-Forwarded-For` dans le fichier hors de `addForwardedHeaders` et d un commentaire (l.153) ; aucune de
  `X-Real-IP` ni de `Forwarded` posée par Caddy.

`https://raw.githubusercontent.com/caddyserver/caddy/v2.11.4/modules/caddyhttp/reverseproxy/httptransport.go` (884 lignes) : aucun
en-tête `Forwarded`, `X-Forwarded-*` ni `X-Real-IP` posé ; l adresse du client n y passe que par `proxy_protocol` (l.298-337), éteint.

## Chemins (item DOJO-SITE-PROXY-PATH-NORMALIZE-1, I-3 du même G1)

`https://caddyserver.com/docs/caddyfile/matchers`, matcher `path`, lu le 2026-10-02 vers 01:57 UTC :
- « Path matches are exact but case-insensitive. »
- « Request paths are cleaned to resolve directory traversal dots before matching. »
- le chemin est « normalized (URL-decoded, unescaped) » sauf aux positions où le motif porte lui-même une séquence d échappement.

Conséquence pour l extrait : un `..`, encodé ou non, est résolu avant la comparaison à la liste fermée ; un chemin qui sort de la
liste reçoit le 404 du site ; un chemin qui retombe dans la liste (ou une casse changée d un nom de la liste) est relayé, et la réponse
est alors bornée par la racine publique de l hôte du Dōjō, servie de toute façon à tous sous son propre nom (A-6). Rien de plus n est
atteignable par le mandataire que par l hôte lui-même.

## Conclusion

À la version installée, `header_up -X-Forwarded-For` s applique après la pose par Caddy et la retire : l hôte du Dōjō ne reçoit pas
l adresse du lecteur par cet en-tête. `X-Real-IP` et `Forwarded` ne sont jamais posés par Caddy ; reçus d un client, ils sont retirés
par leurs `header_up -`. La connexion TCP vers l hôte du Dōjō part du serveur du site : l hôte voit l adresse de ce serveur, jamais
celle du lecteur. Limite : lecture de la source, pas mesure ; la mesure à l acte (Q-2 du G1) reste un choix de l orchestrateur.
Révision : à tout changement de version de Caddy sur le serveur du site.
