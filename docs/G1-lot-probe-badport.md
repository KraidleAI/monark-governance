claude-opus-5-5

# G1 PROBE-BADPORT-REASON-1 -- journal (worker G1, modele resolu `claude-opus-5-5`, effort max, 2026-10-03)

Mission `F:/tmp/rech/badport/mission.md` sha256 `80965193a3e059d2d2c0f998a6667152f2482abdc8b53a828864fecebbc18815` (relue a
22:07:05 UTC, egale au lancement ; recu `mission.recu.json` verdict vert, 2026-10-03T22:06:42Z). Regles inserees :
`F:/Monark/docs/methode/REGLES-MISSION.md` `d86bb19d1a384890cff2cd5d478b90eaa5fc11fe32a632eaf09bfde07001a5d6` (egal a la mission) ;
generateur `F:/Monark/scripts/mission/gen.mjs` `9eecb371...` (egal). Worktree `F:/Monark-wt-badport`, branche `lot/probe-badport`,
HEAD = base `8700329f60ac894ba25b544106611e97c2fda487` (relu a 22:07 UTC, arbre propre). Heures : `date -u`. Journal ASCII seul.
Chemins relatifs a `F:/tmp/methode/badport/` sauf mention. Mission recue avec la demande relayee de l investisseur "as tu des
questions a me poser?" : les questions sont en section 9 (Q-1 a Q-7), aucune tranchee seul.

## 1. Lecture (tache 1)

Lu en entier, dans l ordre de la mission (sha256 de la base, relus juste apres 22:07:05 UTC) :
- `scripts/probe-narabi.mjs` (793 lignes) `4e4338c026ad650882ebde28b2af2c2fa7a457ca2077788a30382251483883b8` : `urlTransportAllowed`
  l.221-237 refuse `insecure_url` avant tout appel (https partout, http sur boucle locale stricte) ; `fetchTimeline` l.263-302 se
  garde lui-meme (l.266-267) puis appelle `fetch` jusqu a `retries+1` fois, TOUTE exception devenant `unreachable` (l.295-296) ;
  `probe()` l.399-407 lit `--url`, puis `PROBE_URL`, puis `DEFAULT_URL`, et refuse avant `fetchTimeline` ; GET2 l.427-431
  (`PROBE_STATE_URL` ou URL derivee) : tout echec -> `{ ok: false }` -> `state_unreachable` ; `evaluate` l.351 : surface non lue ->
  `reason = fetchReason`, `unhealthy` ; exit 1 si `unhealthy` (l.477).
- `test/probe-narabi.test.ts` (1211 lignes) `39db2c3e825316417713b6294a2a2785753b5fe8fde6dc51891a9b9d98be49aa` ;
  `test/probe-narabi-state.test.ts` (444 lignes) `cbf5e97d623df60e9cb4d9b3cc98ff8d569c4f0dbf173289bcd0caf6c1818918`.
- `docs/G1-lot-probe-narabi-load.md` (348 lignes) `0f18c5849b5e23cca5b110dc9e9393e43e5647482245ec3180ac0f7cb9cbd9ca` : l.40-47 (liste des
  ports de `fetch` lue dans la source embarquee de node v24.15.0, undici 7.24.4, module sha256 `d6332aa1...`, 82 ports, chemin
  `requestBadPort` -> `makeNetworkError("bad port")`) ; l.278-284 (Q-2 : la construction de ce lot, "comme insecure_url dans
  urlTransportAllowed").
- `docs/RUNBOOK-sentinel.md` (679 lignes) `1a1093fd9ff38a65f5e46ed76601292ee984720261abf77972bf6cd521537fe` : l.601-679 (sonde sur Bell ;
  `PROBE_URL` possible dans `/etc/monark/probe.env` l.612 ; ensemble ferme `alert_error` l.641-642 ; deploiement par SHA G7 nomme
  l.605-606 ; sonde deployee `4e4338c0...` l.676). Le RUNBOOK ne liste pas les valeurs de `reason`.
- Lus en appui : `scripts/probe-narabi.d.mts` (types `ProbeReason`, `TransportDecision`, `FetchResult`) ; outils du tronc
  `scripts/red-proof.mjs` (l.4-24, 95-103, 122-127, 164-175, 248), `scripts/oracle/run.mjs`, `scripts/oracle/lock.mjs`
  `501a76b58e15f45ae8317b1d8a8385f13ff2a9b4740a3fa03f224472822e33bb`, `scripts/oracle/r25.mjs` (run, r25, red-proof, lint, launch :
  sha256 egaux a la mission, relus avant 22:14:17 UTC) ; `eslint.config.mjs`, `lint-ratchet.json` (plafond 69), `scripts/lang-gate.mjs`
  (`FR_WORDS`), `vocab-banned.json` (portee `sentinel` : la sonde et ses deux tests), `.github/workflows/ci.yml` l.40-99 (R-25) ;
  `docs/ETAT.md` l.325-327 (item PROBE-BADPORT-REASON-1), l.328-330 (PROBE-UNREACHABLE-WATCH-1), l.205-212 (PS-C-WRITE-1) ;
  `docs/adr/ADR-NARABI-OPS-1.md` l.84, l.94-97 (ensemble ferme de `reason` et precedence).

## 2. Faits du runtime (lus sur place AVANT le code)

Outil `tools/expose.mjs` `3ced3d45c4fd5c435362d719667154d681604c2087e92a059a1305222a896f40` (lecture seule ; son seul appel reseau :
`fetch` vers 127.0.0.1 sur les ports LISTES, tous refuses avant connexion), lance a 22:14:17 UTC deux fois : sans option
(`evidence/expose-default.json` `81cc27d242fa080db9939c4878f36ccb637ee033d0d05460cdd09350ac892a81`, stderr vide
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`) et sous `--pending-deprecation` (`evidence/expose-pending.json`
`c0704f02e35070ad42d79395831b001d30cb32e0cda12dca269007abad8c4023`, `evidence/expose-pending.stderr`
`f1b6c6797bc96624588b10f5460982a1e7634e27a89922b943412a06341a8ac9`).
- [lu] F-1 : `node` v24.15.0 ; `process.versions.undici` 7.24.4.
- [lu] F-2 : `builtinModules` ne contient aucun module undici ni fetch : aucune API publique ne rend la liste.
- [lu] F-3 : `process.binding("natives")` rend la source, mais `process.binding` est deprecie : sous `--pending-deprecation`, stderr
  porte `[DEP0111] DeprecationWarning: process.binding() is deprecated. Please use public APIs instead.` ; `@types/node` 24.13.3
  ne le declare pas (grep vide dans `F:/Monark/node_modules/@types/node`, avant 22:14:17 UTC).
- [lu] F-4 : module `internal/deps/undici/undici`, 763 217 octets UTF-8, sha256
  `d6332aa1ca04f71ffdba505a7e2cb61d15d3e0799bdcc06352a89d6a58ebe475` (egal au lot precedent) ; UNE `var badPorts = ( /** @type {const} */
  [ "1", ..., "10080" ] )`, 82 chaines ; `var badPortsSet = new Set(badPorts)` ; `requestBadPort` :
  `if (urlIsHttpHttpsScheme(url) && badPortsSet.has(url.port)) { return "blocked"; }`.
- [lu] F-5 : pour les 82 ports listes, `fetch("http://127.0.0.1:<p>/x")` rejette avec la cause `bad port` (82 / 82) ; 0 evenement
  `undici:client:beforeConnect`.
- [lu] F-6 : parseur WHATWG de ce node (entre 22:14:17 et 22:28:09 UTC) : `http://127.0.0.1:80/x` -> port `""` ; `https://a.tech:443/` -> `""` ; `:0` ->
  `"0"` ; `https://monarkgate.tech:0587/x` -> `"587"` ; `http://[::1]:1/x` -> `"1"`. `assert.deepEqual` tient un tableau gele pour
  egal a un tableau simple ; `deepEqual(undefined, [...])` leve `ERR_ASSERTION`.
- [2nd] F-7 : Bell, hote servi de la sonde, execute node v24.21.0 `/usr/bin/node` : `docs/JOURNAL-PROVENANCE.md` l.367 (valeurs lues
  par l orchestrateur le 2026-09-23) et `docs/RUNBOOK-bell.md` l.74-76. Non mesure par ce lot (aucun acces a Bell) : demande formee
  en Q-2.
- [lu] F-8 : le CI du tronc fixe `node-version: "24"` (majeure flottante, `runs-on: ubuntu-latest`) a chaque `actions/setup-node`
  de `.github/workflows/ci.yml` (l.113, 137, 151, 164, 199 ; job de tests l.135-142), lu a 22:48:49 UTC. T3 y compare donc la copie a
  la liste du node 24.x que le runner resout, pas a v24.15.0 : un rouge de T3 en CI signifie une derive de la liste sur ce runner
  (copie a refaire, comme pour Bell en Q-2), pas un defaut de ce lot ; un vert en CI verifie la liste sur un second node.

## 3. Decisions (chacune avec sa source ; les points ouverts sont en section 9)

- DEC-1 (D-1, branche) : Node n EXPOSE PAS la liste (F-2 ; le seul lecteur en processus, F-3, est deprecie et Node renvoie lui-meme
  aux API publiques) -> branche "recopiee avec sa provenance (version de Node, fichier, sha256) et un test qui la compare a la source
  embarquee". Recopie des 82 chaines de F-4, dans le meme ordre ; provenance dans le commentaire de `FETCH_BAD_PORTS` (node v24.15.0,
  module, undici 7.24.4, sha256, date de lecture). Ecarte : lecture a l execution par `process.binding` (API depreciee ; analyse du
  texte d un module interne DANS le code servi : une defaillance changerait le comportement servi ; une copie de repli resterait
  necessaire). A confirmer : Q-1.
- DEC-2 (point d insertion, D-1 et D-2) : le controle vit dans `urlTransportAllowed`, APRES l admission du transport : les deux
  `return { ok: true }` de la base (l.228 et l.235) deviennent `return portAllowed(u)` ; le `return insecure_url` final est intact.
  Source : Q-2 du lot precedent (`docs/G1-lot-probe-narabi-load.md` l.278-284). Effets : une URL non sure garde `insecure_url` quel
  que soit son port ; les deux appelants (`probe()` l.423, auto-garde de `fetchTimeline` l.289) propagent la raison neuve sans
  changement de leur code.
- DEC-3 (semantique) : `FETCH_BAD_PORT_SET.has(u.port)` : `u.port` est la chaine WHATWG (`""` pour le port du schema), le Set tient
  des CHAINES : meme expression que `badPortsSet.has(url.port)` d undici (F-4, F-6). La condition de schema d undici (http ou https)
  est impliquee : la sonde n admet que ces deux schemas.
- DEC-4 (`scripts/probe-narabi.d.mts`) : mis a jour (`ProbeReason`, `TransportDecision`, `FetchResult` gagnent `bad_port` ;
  `FETCH_BAD_PORTS` declare). Sans lui l ensemble ferme declare serait faux et l import dynamique de T3 non type. Ce fichier n est pas
  celui que la mission nomme ("Code : scripts/probe-narabi.mjs") : Q-3.
- DEC-5 (forme des tests, imposee par `red-proof`) : (a) aucune ligne d un test existant ne change : un test modifie vert a la base
  est refuse ("green at base: a self-confirming test", `red-proof.mjs` l.173) et `ok` exige que TOUT test juge soit F2P (l.248) ;
  (b) aucun import statique de l export neuf : a la base le fichier entier echouerait au chargement ("does not provide an export
  named", l.100) et serait refuse ("import red on ..., which exists at base", l.172) : `await import(...)` dans le corps de T3 ;
  (c) chaque test neuf porte sa ligne `// killer:` (l.17-24) ; (d) les trois tests sont ajoutes apres la l.1211 (fin du fichier).
- DEC-6 (aucun serveur joint par `fetch`) : aucun test neuf ne lie de serveur que `fetch` joindrait ; le choix de l investisseur
  "Aide partagee dans les tests" porte sur l aide `listen()` (Q-1 du lot precedent, l.267-277) dont ces tests n ont pas besoin. Le
  faux SMTP (`startFakeSmtp`, `node:net`, port 0) n est pas soumis a la liste de `fetch`. Voir Q-6.
- DEC-7 (GET2, D-2) : une `PROBE_STATE_URL` sur un port refuse reste `state_unreachable` (l.431 : tout echec du GET2 -> `{ ok: false }`),
  comme a la base (ou `fetch` rejetait 2 fois) ; seule difference : 0 appel de `fetch`. Aucune raison neuve pour le GET2 : Q-4.
- DEC-8 (vocabulaire du courriel `bad_port`) : verifie dans T2 sur le courriel REELLEMENT capture (motifs globaux et `sentinel` de
  `vocab-banned.json`, liste du courriel du fait 12), pas par ajout a la liste du test existant l.1153 (DEC-5 a) : Q-5.

## 4. Code (tache 2) : `scripts/probe-narabi.mjs` (et `scripts/probe-narabi.d.mts`, DEC-4)

- l.222-235 : `FETCH_BAD_PORTS` (`Object.freeze`, les 82 chaines de F-4 dans l ordre) et sa provenance ; l.236 `FETCH_BAD_PORT_SET` ;
  l.237-243 `portAllowed(u)` : `{ ok: false, reason: "bad_port" }` si `FETCH_BAD_PORT_SET.has(u.port)`, sinon `{ ok: true }`.
- l.251 et l.258 : `return portAllowed(u)` a la place des deux `return { ok: true }` de la base (l.228, l.235).
- Commentaires : l.193 (politique de transport), l.362 (`evaluate` : `bad_port` parmi les echecs de transport).
- `.d.mts` : l.24-25 (`FETCH_BAD_PORTS`), l.35-38 (`ProbeReason`), l.82 (`TransportDecision`), l.86 (`FetchResult`).
- Diff (`git --no-optional-locks diff --numstat 8700329f`, relu avant 22:28:09 UTC, puis egal dans le record de l oracle) : `.d.mts` +7 -4, `.mjs` +26 -3, test +90 -0 ;
  `status --porcelain=v1 --untracked-files=all` : ces 3 chemins seuls (` M`). sha256 livres : `.mjs`
  `15da93f22204afd63154edd2c30a7dc972af07dc437bdd7cdb7b4d0df20219c2`, `.d.mts` `374714c19682b3b97cc3bd8aa916f24cbcbf5b476b5ab99040ad65e1e8f8f2bc`,
  test `a4ae5f682a65f5f0461702a94318b32cb2089b29cb9c3d07dd2c6acc001468e4`.
- Garde d octets (`tools/byteguard.mjs` `0a6f61238b14480645095c430a744657bca7173f75b76f129c84e0f0a87ae09b`, avant 22:28:09 UTC) : 0 TAB, 0 CR, 0
  octet de controle, 0 DEL, 0 point de code C1 dans les 3 fichiers ; lignes ajoutees : ASCII seul, 0 chemin de lecteur (porte
  d export D7 septies).
- Controle manuel (avant 22:28:09 UTC, `node --check` puis import du module) : 5 adresses sur ports listes -> `bad_port` ; `:25` en http
  distant et `127.1:6000` -> `insecure_url` ; `:80`, `:443` implicite, `:0`, `:10081` -> `{ ok: true }` ; `fetchTimeline` direct ->
  `bad_port` ; 82 entrees, tableau gele.

## 5. Tests (tache 3) et preuve rouge

Trois tests neufs en fin de `test/probe-narabi.test.ts` (bloc ajoute l.1212-1301, apres la l.1211 de la base) :
- T1 l.1217 `probe_refuses_fetch_bad_port_before_any_dial` (tueur l.1216 : `scripts/probe-narabi.mjs:241 CONST "bad_port" ->
  "insecure_url"`) : 5 adresses sur ports listes (http boucle locale v4, localhost, v6 ; https distant ; zeros de tete) -> `bad_port` ;
  `fetchTimeline` appele directement -> `bad_port` ; precedence : 5 adresses non sures (dont 3 sur port liste) -> `insecure_url` ;
  7 adresses admises (`:80` et `:443` explicites, `:0`, `:5999`, `:6001`, `:10081`, `:8443`) -> `{ ok: true }`.
- T2 l.1248 `probe_bad_port_url_is_named_end_to_end` (tueur l.1247 : `scripts/probe-narabi.mjs:241 SDL "FETCH_BAD_PORT_SET.has"`) :
  la VRAIE sonde en sous-processus, `fetch` remplace par un espion charge par `NODE_OPTIONS=--import` (il ecrit chaque appel sur stderr
  et ne compose jamais) : (1) `PROBE_URL` `http://127.0.0.1:6665/...` et faux SMTP de boucle locale -> `reason` `bad_port`, `reachable`
  false, `unhealthy`, exit 1, 0 appel de `fetch`, un courriel livre qui porte `reason: bad_port` et aucun motif interdit ; (2) `--url`
  `https://monarkgate.tech:587/...` sans SMTP -> `bad_port`, exit 1, 0 appel, `smtp_unconfigured` ; (3) temoin : `--url` admis `:6001`,
  `PROBE_RETRIES=0` -> exactement 1 appel de `fetch` (l espion est vivant : les zeros ne sont pas vides) et `unreachable` comme a la
  base (D-2).
- T3 l.1280 `probe_fetch_bad_ports_equal_the_embedded_fetch_list` (tueur l.1279 : `scripts/probe-narabi.mjs:234 CONST "10080" ->
  "10081"`) : lit la source embarquee du node qui execute la suite, extrait `var badPorts`, `deepEqual` avec `FETCH_BAD_PORTS` (import
  dynamique) ; sur les ports 0..65535 la garde refuse EXACTEMENT la liste embarquee ; pour chaque port de la copie, `fetch` rejette
  avec la cause `bad port`.
- Mise au point hors verrou, mes 3 tests seuls (copies `git archive 8700329f` : `dev-base/` = base + test du gel, `dev-gel/` = gel ;
  `node_modules` en jonctions par `tools/nm.mjs` `4efa1704ca3a1e0d181663eb30cb3365875b09d07f89dde0a5f29565201cb175`, calque de
  `oracle/run.mjs` l.105-115, sans PowerShell : ecart E-2) : 22:30:14 UTC base `evidence/dev-base-1.tap`
  `323e1fdd55ce6227a988a8cc7d228fefd7a4df890860ec51808cb932bfa69dd5` : 3 / 3 rouges, `ERR_ASSERTION` chacun (T2 : attendu `bad_port`,
  recu `unreachable`) ; 22:30:23 UTC gel `evidence/dev-gel-1.tap` `105a61117eb773b540ca8e9ce476386f6638dce5c5166b3c087a4467619f4cc7` :
  3 / 3 verts (3 ms, 308 ms, 165 ms).
- **Preuve rouge du tronc** : `tools/locked.mjs` `76899fdb930538c81e6995a7861ec3449dcbc0277b22ee579ff6df8d44fe165e` (verrou d hote
  `acquire("F:/tmp")` du tronc, FIFO, jamais force ; C-V-4 lu apres la prise, comme `oracle/run.mjs` l.153-157 : 15 543 Mo libres,
  21 node.exe ; pris 22:31:13.613Z, rendu 22:31:58.553Z, attente 1 ms). Commande : `node F:/Monark/scripts/red-proof.mjs --base
  8700329f --gel F:/Monark-wt-badport --repo F:/Monark --out F:/tmp/methode/badport/red-proof-1 --draw 3 --seed 20261003` (`--repo`
  pour lier les `node_modules` de `F:/Monark` dans les clones de l outil ; l outil clone `--no-local`, aucune ecriture dans
  `F:/Monark`). Sortie : `red-proof OK: 3 judged, 47 unchanged, 3 killer(s) drawn`, exit 0 (`red-proof-1.log`
  `89806ec700d30f45a922310a159314a3f169f72b42803db3f4ba636b0f484a9a`).
- `red-proof-1/RED-PROOF.json` `d138fbf0d3d17c48bb8ee956377bd2f1909c34785763b840c4ba01b4af20dba5` (node v24.15.0, digest du gel
  `6e52c3c8e869722fd409bb8f3f1c8187c9948de92030e7b89ec5cbf403b1c2c8`, `ok: true`) : T1, T2, T3 `base: assert-fail`, `gel: pass`,
  verdict F2P ; tirage (graine 20261003, population 3) : 3 tueurs `killed` (statut `assert-fail`), fichier de production restaure
  (sha256 avant = apres = `15da93f2...`). `base.tap` `03c02394944a45d91f6990744e6b97650fa10df9ee6fa4b3b271dd1fbf38b1f7` : 50 tests, 47
  verts, 3 rouges (les neufs) ; `gel.tap` `dc3f896a107a15effeae6b776fb34ef962bd2e9fef5d627974551e3fceac8a07` : 50 / 50 verts ;
  `killer-1.tap` `b34ffbe16972ebd1fbc3b0ace76713541fb685bb119603c95300a1181783de08`, `killer-2.tap`
  `50a7e852f79b4e56722cc3ee827bca8ef23390a6cd04bd593760c61413791c21`, `killer-3.tap`
  `e4282480457e681e8ffdd2c037498693d9389499d5dc6be12d97503a5856cc2d`.

## 6. D-2 : sorties et codes de retour inchanges pour toute adresse admise

- Par le code : toute adresse refusee a la base (`insecure_url`) suit le meme chemin de refus, intact et place AVANT le controle de
  port. Toute adresse admise a la base recoit le MEME `{ ok: true }` sauf si `u.port` est dans la liste ; l aval (`fetchTimeline`, GET2,
  `evaluate`, alerte, ecriture, code de sortie) est alors le meme code, inchange. Seules changent les adresses admises a la base dont le
  port est dans la liste, c est-a-dire celles que `fetch` refusait a chaque essai (F-4, F-5) : `unreachable` (exit 1) devient
  `bad_port` (exit 1, meme code de sortie), sans appel de `fetch`.
- Par les tests : T1 (voisins et ports du schema admis), T2 (3) (adresse admise : `fetch` atteint, `unreachable` comme a la base), T3
  (balayage 0..65535 = la liste exacte ; chaque port de la copie refuse par `fetch` lui-meme, donc aucune adresse que `fetch`
  accepterait n est refusee par la sonde) ; les 47 autres tests du fichier verts au gel (`gel.tap`) ; la suite complete (section 8).

## 7. D-3 : ce que le changement fait au service

- Adresse servie par defaut (`DEFAULT_URL` `https://monarkgate.tech/narabi/timeline.jsonl`, port du schema, `u.port` `""`) : aucun
  changement.
- Une `PROBE_URL` (dans `/etc/monark/probe.env`, RUNBOOK-sentinel l.612) ou un `--url` pose sur un port que `fetch` refuse ne donne
  plus `unreachable` a chaque tir, indiscernable d une surface tombee : la sonde ecrit `reason: "bad_port"` (`reachable: false`,
  `unhealthy`, exit 1) des le premier tir, sans aucun appel de `fetch` (avant : `retries+1` essais refuses aussitot), et le courriel
  d alerte porte `reason: bad_port`. Machine anti-tempete inchangee : apres une alerte `unreachable` le meme jour UTC, le passage a
  `bad_port` n envoie pas de nouveau courriel (C-3) ; le rappel du jour UTC suivant porte `bad_port`.
- `narabi.json` : le champ `reason` gagne une valeur ; schema inchange (2), aucun champ neuf.
- Deploiement sur Bell : acte de l orchestrateur sous le go de l investisseur (RUNBOOK-sentinel l.601-606, par SHA G7 nomme,
  decision 72), PAS de ce lot. Precondition proposee : Q-2.

## 8. Oracle du tronc (role G1) et R-25 (tache 4)

- Retour rapide d abord : `--static-only` (22:28:09 -> 22:29:39 UTC ; portes statiques hors verrou, par construction de l outil) :
  8 portes vertes ; record `F:/tmp/oracle-results/8700329f60ac894ba25b544106611e97c2fda487-0c97addc1cc8d73d-G1-20261003T222810Z-83232.json`
  `3a65826ef02a5237d272b339c3cdb791f4c84d0b9d70703d9fc429b4016a68f2` (`static-1.log` `bf4f8208351cff565a5c52b4c0411474cf2a49b47c8b98948364af1343febeb1`).
  Cliquet 69 / 69, egal au G7 de la base `8700329f` (`8700329f...-G7-20261003T215845Z-375152`, 69 / 69) : 0 violation ajoutee.
- Avant la suite : `held("F:/tmp")` a 22:33:00 UTC = `null` (libre), aucune entree en file. Commande (22:33 UTC, arriere-plan,
  TEMP/TMP/TMPDIR sous le lot, `GIT_TERMINAL_PROMPT=0`, `GIT_OPTIONAL_LOCKS=0`, noms de la liste DENY retires, `< /dev/null`) :
  `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-badport --base 8700329f`. Pendant sa suite sous verrou (prise
  22:34:45Z) : aucune course ni aucun harnais de ma part (lectures seules : `git status`, `sha256sum`, `grep` ; ecriture du journal).
- Sortie (`oracle-1.log` `8b6825156d223d025122e7cb12340d081aeb826dca3fadc599cc6a8cca09e138`) : `oracle-result {"exit":0,"record":<le
  record ci-dessous, chemin Windows>,"sha256":"6a686f8aa0522d666a70457b4e306ce803b1420a79fc5222672b1ee6b605d641"}`, exit 0 (22:42:48 UTC).
- Record `F:/tmp/oracle-results/8700329f60ac894ba25b544106611e97c2fda487-0c97addc1cc8d73d-G1-20261003T223306Z-376432.json`, sha256
  `6a686f8aa0522d666a70457b4e306ce803b1420a79fc5222672b1ee6b605d641` (recalcule a 22:43 UTC, egal a la sortie) ; `tree.dirty`
  `0c97addc1cc8d73dbd647b9d3fdafd32599f409d1d43f0f2d6ec18771f8c2173` (egal au run statique : arbre inchange), `tree.object`
  `121c20fec8cde5fe7b5894967e59f80ecda3d4fc`, `served_from: null` (rejoue), debut 22:33:06Z, fin 22:42:42Z, attente du verrou 15 s ;
  C-V-4 du record : 16 001 Mo libres, 18 node.exe.
- Portes : 8 statiques vertes ; `test` verte (477 295 ms) : 2 037 tests, 2 033 verts, 0 rouge, 0 annule, 4 sautes (G1 du lot precedent :
  2 034 / 2 030 / 4 ; +3 = les trois tests neufs). `09-test.log` du record
  `07e90dce376e1ffc782ea1400ca884aa0a5f979195230eb3160897680d3ecd6c` : T1, T2, T3 verts l.2494-2496 (1,3 ms ; 560,0 ms ; 274,7 ms) ; le
  test 42 execute une fois, dans la suite (l.2137 ; l.2138 est le test distinct 42(f')).
- **R-25** : record, porte `r25` : STAT 123 insertions, 7 suppressions, 130 lignes (borne CI `VIBEGATES_PR_LIMIT` 1205) ; CONTENT_STAT
  0 / 8000. Borne de la mission (D-Z) : 547 ; 130, marge 417 (au-dessus de 10 : aucune scission, REGLES ligne datee 13:0x).

## 8 bis. Commande de Q-2 rejouee ici (copie du gel, node v24.15.0)

- 22:43:26 UTC, import de `dev-gel/scripts/probe-narabi.mjs` (`15da93f2...`, le `.mjs` livre) : `v24.15.0 7.24.4 SAME 82/82`
  (`evidence/bell-check-local.txt` `0912e0e5ef0a85b8315ea499b19f6a7f2743c6cf1d6e090ccdb706692d3f590b`).
- Temoin negatif, 22:43:42 UTC : copie `negctl/probe-narabi.mjs` (`6d6f63c380fcc1abcd750a37ba25d776e2c24a5cd49eec08817a5487e91ba1ba`) ou
  `"10080"` devient `"6000"` (un port lui aussi refuse : aucune connexion possible) : `v24.15.0 7.24.4 DIFF 82/82`
  (`evidence/bell-check-negctl.txt` `569b3c945d21393b47ca88bd8ef00741e9c7ad141a3ee849d6c977da2a46e59c`). La commande detecte une copie
  qui differe de la liste du node qui l execute. Contre la sonde de la base (`dev-base/scripts/probe-narabi.mjs` `4e4338c0...`, sans
  `FETCH_BAD_PORTS`), mesure a 22:45:10 UTC : `TypeError: m.FETCH_BAD_PORTS is not iterable`, exit 1, avant tout `fetch`
  (`evidence/bell-check-base.txt` `d6fcecf0c7c22ad26eeb8770b68b06ad9e8502c3a194de6004e37fc3c2439713`) : elle ne se joue qu apres
  l expedition du fichier livre.

## 9. Questions (aucune tranchee seul) et items

- **Q-1 (D-1, branche)** : Node n expose pas la liste par une API publique (F-2, F-3) ; la recopie + provenance + test est retenue
  (DEC-1). A confirmer. Si l orchestrateur juge que `process.binding("natives")` vaut exposition : lecture a l execution avec repli sur
  la copie, environ 15 lignes de plus dans la sonde servie et un chemin d echec de plus a tester.
- **Q-2 (Bell, demande formee : F-7 est [2nd])** : la copie vient de node v24.15.0 ; Bell execute v24.21.0 selon le JOURNAL ; T3
  compare a la source du node qui EXECUTE LA SUITE, pas a celle de Bell. Commande proposee, a jouer sur Bell par l orchestrateur apres
  l expedition du fichier et avant d accepter le deploiement (lecture seule ; ne lance pas la sonde : la garde d execution de
  `main()` l.813-815 ne s arme pas sous `node -e` ; ses seuls `fetch` vont vers 127.0.0.1 sur les ports listes) :
  `node --input-type=module -e 'const m = await import("/opt/monark-probe/probe-narabi.mjs"); const s = process.binding("natives")["internal/deps/undici/undici"]; const a = s.indexOf("var badPorts ="), o = s.indexOf("[", a); const live = s.slice(o + 1, s.indexOf("]", o)).split(",").map((x) => x.trim().replace(/"/g, "")).filter(Boolean); let bad = 0; for (const p of m.FETCH_BAD_PORTS) await fetch("http://127.0.0.1:" + p + "/").catch((e) => { if (e.cause?.message === "bad port") bad++; }); console.log(process.version, process.versions.undici, JSON.stringify(live) === JSON.stringify(m.FETCH_BAD_PORTS) ? "SAME" : "DIFF", bad + "/" + m.FETCH_BAD_PORTS.length);'`
  Attendu : `v24.21.0 <undici> SAME 82/82`. `DIFF` ou moins de 82 : STOP, copie a refaire pour ce node (lot neuf). Rejouee ici sur la
  copie du gel : section 8 bis. Meme lecture pour le CI (F-8) : un rouge de T3 sur le runner (`node-version: "24"` flottant) est une
  derive de la liste, a traiter comme un `DIFF` de Bell.
- **Q-3 (perimetre)** : `scripts/probe-narabi.d.mts` modifie (DEC-4), fichier non nomme par la mission. A accepter, ou a scinder.
- **Q-4 (GET2)** : `PROBE_STATE_URL` sur un port refuse reste `state_unreachable` (DEC-7, D-2). Faut-il une raison nommee pour le
  GET2 ? Elle changerait l ensemble ferme `state_*` (ADR-NARABI-OPS-1 l.94-97) : decision de l orchestrateur.
- **Q-5 (vocabulaire)** : la liste du test existant l.1153 (`probe_alert_mail_has_no_forbidden_vocab`) ne nomme pas `bad_port` ; T2
  couvre le courriel reel (DEC-8). L aligner coute un refus de `red-proof` (test modifie vert a la base) : a faire dans un lot qui
  accepte nommement ce refus, ou a laisser tel quel.
- **Q-6 (aide partagee)** : ce lot n ajoute aucun `listen` ; les `listen(0)` que `fetch` joint dans `test/probe-narabi.test.ts`
  (l.346, 371, 481, 484, 737 ; les autres sont des serveurs SMTP `node:net`) restent au lot de l aide partagee (choix de l investisseur
  du 2026-10-03). Conflit de fusion attendu : nul, ce lot n ajoute des lignes qu apres la l.1211.
- **Q-7 (docs, a ecrire par l orchestrateur ; ce lot ne touche aucun fichier sous `docs/`)** : `docs/adr/ADR-NARABI-OPS-1.md`
  l.94-97 (ensemble ferme de `reason` et precedence : `bad_port` est une raison "cannot-evaluate" comme `insecure_url`) ;
  `docs/RUNBOOK-sentinel.md`, section "Deploiement de la sonde (Bell)" (precondition Q-2) ; `docs/ETAT.md` l.325-327 (item a clore a
  la fusion).
- Item NODE-NATIVES-READ-1 (recherche) : T3 lit la source par `process.binding("natives")` (DEP0111). Si un node futur le retire, T3
  rougit ("not readable") : jamais un faux vert. Construction : lire la liste dans les octets de node.exe (sources embarquees) ou par
  un balayage comportemental 1..65535 avec un `dispatcher` qui ne compose jamais ; prix estime : environ 20 lignes de test.
  Declencheur : premier rouge "not readable" de T3, ou montee majeure de node.
- Item VERIFY-BADPORT-1 (meme classe, hors lot) : `apps/bell/scripts/bell-verify.mjs` l.55 et `apps/dojo/scripts/dojo-verify.mjs`
  appellent `fetch` sur une adresse fournie ; un port de la liste y donne `unreachable` (ensembles fermes `VERIFY_REFUSALS` l.16,
  `DOJO_VERIFY_REFUSALS` l.20). Meme construction possible (refus nomme avant tout appel), qui change leur contrat public.
  Declencheur : prochain lot qui touche leur transport, ou decision de l orchestrateur.
- PROBE-UNREACHABLE-WATCH-1 (ETAT l.328-330) : inchange par ce lot.
- `error_origin` propose (assigne au G7) : conception (G1 -1b-i : toute exception de `fetch` devient `unreachable`, l.295-296 de la
  base) ; mis au jour par le lot PROBE-NARABI-LOAD-1 (sa Q-2) ; aucun defaut propre a ce lot.

## 10. Ecarts consignes

- **E-1** : premiere lecture du worktree (22:07 UTC) par `git status --porcelain=v1` SANS `--no-optional-locks` : peut rafraichir le
  cache stat de l index (aucun contenu change ; meme ecart que E-1 du lot precedent). Toutes les commandes git suivantes portent
  `GIT_OPTIONAL_LOCKS=0` et `--no-optional-locks`.
- **E-2** : jonctions `node_modules` de mes copies de mise au point par `tools/nm.mjs` (node, `fs.symlinkSync` "junction") et non par
  `mk-nm.ps1`, que les REGLES nomment : tout `powershell.exe` reecrit un fichier sous C: (PS-C-WRITE-1, ETAT l.205-209, dont la piste
  est precisement les jonctions en node) ; "rien sur C:" prime. Meme raison pour C-V-4, lu par `os.freemem()` et `tasklist` (comme
  `oracle/run.mjs` l.153-157) et non par `Get-CimInstance`.
- **E-3** : hors verrou, des actions legeres seulement : `tools/expose.mjs` (22:14 UTC, 164 appels `fetch` vers 127.0.0.1 sur ports listes,
  tous refuses avant connexion) et mes 3 tests seuls sur `dev-base/` et `dev-gel/` (22:30 UTC : 4 sondes enfants, 1 a la base ou T2
  s arrete a sa premiere assertion et 3 au gel ; un faux SMTP de boucle locale et une connexion par copie) ; apres la suite de mon oracle, la commande de Q-2, son temoin et son essai contre la base
  (22:43-22:45 UTC : 164 appels `fetch` vers 127.0.0.1 sur ports listes, tous refuses avant connexion ; 0 pour la base). Aucune
  pendant une suite de mon oracle.

## 11. Cloture

- **Livre** (worktree `F:/Monark-wt-badport`, branche `lot/probe-badport`, base `8700329f`, NON commis : R-20) :
  `scripts/probe-narabi.mjs` `15da93f22204afd63154edd2c30a7dc972af07dc437bdd7cdb7b4d0df20219c2` (816 lignes),
  `scripts/probe-narabi.d.mts` `374714c19682b3b97cc3bd8aa916f24cbcbf5b476b5ab99040ad65e1e8f8f2bc` (155 lignes),
  `test/probe-narabi.test.ts` `a4ae5f682a65f5f0461702a94318b32cb2089b29cb9c3d07dd2c6acc001468e4` (1 301 lignes) ;
  `git --no-optional-locks status --porcelain=v1 --untracked-files=all` a 22:45:40 UTC : ces 3 chemins ` M`, rien d autre ; HEAD
  `8700329f`.
- **Journaux** : `F:/tmp/rech/badport/G1.md` (celui-ci), `F:/tmp/rech/badport/REPONSE.md`, `F:/tmp/rech/badport/DELIVERED.sha256`
  (empreintes mesurees en fin de redaction).
- **Outils et preuves** sous `F:/tmp/methode/badport/` : `tools/` (`expose.mjs`, `byteguard.mjs`, `nm.mjs`, `locked.mjs`),
  `evidence/`, `red-proof-1/`, journaux `static-1.log`, `red-proof-1.log`, `oracle-1.log` et leurs `.start`, copies `dev-base/` et
  `dev-gel/` (jonctions RETIREES a 22:43:47 UTC, 230 entrees chacune ; `F:/Monark/node_modules` : 220 entrees avant et apres),
  `negctl/` ; `tmp/` vide.
- **Verrou** : `red-proof` (par `tools/locked.mjs`) et la suite de l oracle (par l outil), chacun par `acquire` du tronc, jamais
  force ; aucune entree de file restante a moi (22:45:40 UTC : verrou tenu par un autre lot, LOOPBACK-PORTS-1, file vide).
- **Isolation git** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` ; aucun git ecrivant dans le worktree ni dans
  `F:/Monark` (lectures : `rev-parse`, `status`, `diff`, `log`, `archive` ; ecart E-1) ; les clones `--no-local` de `red-proof` et de
  l oracle sont faits par les outils du tronc sous `F:/tmp`.
- **Reseau** : aucun hors boucle locale ; `fetch` vers 127.0.0.1 sur les seuls ports listes (refuses avant connexion) et faux SMTP de
  boucle locale des tests ; aucun outil web appele.
- **Disque** : rien sur C: (TEMP/TMP/TMPDIR sous `F:/tmp/methode/badport/tmp` ; aucun PowerShell).
- **Docs** : aucun fichier sous `docs/` modifie. **Zone de RECHERCHES** (`apps/harness`, `apps/sentinel`, `packages/hikae`,
  `packages/contracts`) : jamais modifiee (lue par les imports du test seulement). **Valeurs** : aucune valeur de marche.
- **Questions** : Q-1 a Q-7 (section 9), aucune tranchee seul.
