# G7 du lot BINANCE-PRE35-1 : l'enregistreur Binance avant la course des 35

- **Plan** : `docs/G0-lot-binance-pre35-1.md`. **Base** : `0c8f8177` (`origin/lot/etude-suite`). Branche `recherches/binance-pre35-1`,
  worktree `/home/user/monark-governance-bn`. Commits : `be84b3f` (G0), `e460110` (tests rouges), `eb4de63` (code, **gel**), puis ce G7.
  Rien poussé.
- **Zone** : `scripts/record-binance-klines.mjs` (+44/−43), `scripts/record-binance-klines.d.mts` (+6/−1),
  `test/record-binance-klines.test.ts` (+139/−173), et les deux documents du lot. Rien d'autre ; le changement de mode que `npm ci` fait
  sur `packages/rpc-guard/bin/rpc-guard.mjs` n'est pas commis.

## Items, un par un

| Item | Fait au gel | Test, tueur (vérifié tué) |
|---|---|---|
| SERIES-TLS-RESUME-1 (L-1) | `https.request` et un `https.Agent` propre, `maxCachedSessions: 0`, `keepAlive: false` (l.98) ; certificats lus sur le socket de la réponse (l.102-106) ; abonnés de diagnostic, table des tickets et lignée `resumed: true` retirés ; une session reprise donne `tls: null` | `binance_klines_never_resumes_a_tls_session` (TLS 1.2 et 1.3, quatre pages) ; `:98` `maxCachedSessions: 0` → `100` : le serveur voit la page 2 reprise, `tls_unattested` |
| m-2 (relecture) | fermé par construction : aucune session offerte, en 1.2 comme en 1.3 | même test, cas TLS 1.2 |
| SERIES-ENV-VALUES-1 (L-2) | l.150-155 : `SYSTEMROOT` = `WINDIR`, `HOMEPATH`, `SYSTEMROOT`, `TEMP`, `USERPROFILE`, `WINDIR` absolus, `PATH` de chemins absolus (entrée vide refusée) ; `env_refused`, détail `{ variables, why }`, aucune valeur | `binance_klines_refuses_an_admitted_name_with_an_unformed_value` (quatre cas refusés, ligne imprimée comparée en entier, et un cas propre qui enregistre) ; `:154` SDL |
| SERIES-TLS-ISSUER-BY-NAME-1 (O-1) | aucune ligne de production (mesure propre, ci-dessous) | `binance_klines_logs_the_true_issuer_of_two_cas_of_one_name` ; `:105` `sha256(issuer)` → `sha256(c.raw)` |
| BINANCE-BIND-SUBSCRIBER-TRY-1 | fermé par retrait : l'abonné `bind` n'existe plus (écart E-1) | — |
| m-1 (relecture) | `process.env.NODE_NO_WARNINGS = "1"` au niveau du fichier de test (écart E-2) | `binance_klines_runs_its_command_line_through_a_junction` vert sous Node 22 (rouge à la base sous Node 22 : `UNDICI-EHPA`) |
| L-3 de BINANCE-PRE153-1 | fermé par construction : plus aucune liaison par chemin, la réponse porte son socket | (test de liaison retiré) |

## Mesure O-1

- Sonde hors dépôt avant le G0 et test du lot, Node 22.22.2 et 24.21.0. Confiées une à la fois, tour à tour dans un même processus :
  chaque ligne nomme la vraie AC, agent partagé ou neuf.
- Confiées ensemble, sans identifiant de clé : le magasin cherche l'émetteur par son nom et prend le premier dans son propre ordre, qui
  dépend des clés tirées au hasard. Mesuré : tantôt la poignée de main tient et la ligne nomme la vraie AC, tantôt elle échoue
  (`CERT_SIGNATURE_FAILURE`, `network_error` avant toute ligne). Jamais un émetteur faux. Le G0 disait « la vérification échoue » d'après
  la sonde seule : c'est corrigé ici, et le test affirme cette alternative pour les deux ordres. Avec identifiants de clé : la vraie AC
  dans les deux ordres (sonde).
- Lecture : l'émetteur faux de CORR O-1 venait de la lignée d'une session reprise, c'est-à-dire du ticket d'une autre connexion, et ce
  lot la retire. Le cas d'une chaîne réelle (feuille plus intermédiaire envoyés) n'est pas mesuré : aucun réseau.

## Oracle

- `node scripts/red-proof.mjs --base 0c8f8177d9d54005b71a01a4b0e4a9fecd0ca72c --gel eb4de63 --repo /home/user/monark-governance-bn
  --draw 6 --seed 37` : **OK**, 6 tests jugés, tous F2P (rouges à la base par assertion), 30 inchangés ; 6 tueurs tirés (toute la
  population), 6 tués. Trois passes sous Node 22.22.2 (`RED-PROOF.json` de la première : sha256 `41b0fca4c1c5da61…`) et une sous Node
  24.21.0 : OK à chaque fois.
- Les 36 lignes `// killer:` du fichier, jugées ou non, appliquées une à une au gel : 36 tuées.
- Suite du fichier : 36/36 sous Node 22.22.2 et sous Node 24.21.0, trois passes chacune. `npm run typecheck`, eslint sur le test,
  `gate:vocab`, `lint:ratchet` (69/69) verts.
- R-25 (`r25()`, base `0c8f817`) : +189/−217, soit **406 lignes comptées**, sous 547.

## Écarts

- **E-1** : BINANCE-BIND-SUBSCRIBER-TRY-1 prévoyait « une ligne, un cas ». Le choix de L-1 retire l'abonné, donc il n'y a ni `try` ni
  cas. Retirés avec ce qu'ils épinglaient : `binance_klines_logs_the_certificates_of_the_connection_that_served_each_page`,
  `binance_klines_binds_its_own_request_under_a_concurrent_one`, `binance_klines_ignores_a_publication_without_a_socket`.
- **E-2** : m-1 est corrigé au niveau du fichier, pas dans le corps du test de jonction. Un corps changé rend le test jugé, et sous
  Node 24 il est vert à la base, donc refusé comme auto-confirmant.
- **E-3** : la couture garde le nom `io.fetch` mais prend la forme de `https.request` (Q-PRE35-1).
- **E-4** : une première preuve rouge sur un gel antérieur (`29e3b0c`, non gardé) a vu une fois la passe de la base s'arrêter après
  34 tests. Les deux derniers manquaient, donc le dernier jugé était refusé (« missing »). Non reproduit en 10 passes directes. Cause
  la plus probable : à la base, l'enregistreur ne termine jamais la `ClientRequest` de la couture, et une erreur de socket sans écouteur
  survient à la fermeture du serveur. Correction dans l'aide `via` (hors corps de test) : un écouteur d'erreur vide, celui de
  l'enregistreur restant actif. Les deux commits du lot ont été réécrits avant tout push (tests `e460110`, code `eb4de63`). Depuis,
  4 preuves sur 4 sont OK.
- **E-5** : en mesurant O-1 dans le test, le G0 s'est révélé inexact sur le cas « confiées ensemble » (voir la mesure O-1). Le G0 reste
  tel que commis.

## Questions pour MONARK

- **Q-PRE35-1** : faut-il renommer la couture `io.fetch` en `io.request` dans un lot d'outil ? Chaque test touché deviendrait jugé.
- **Q-PRE35-2** : une entrée vide de `PATH` arrête la course (`env_refused`). Ce choix est fermé par défaut. Sous Windows, un `Path`
  finit souvent par `;` : à vérifier sur l'hôte de la course avant les 35. `SYSTEMROOT` et `WINDIR` sont comparés à l'octet près :
  `C:\WINDOWS` contre `C:\Windows` arrêterait aussi la course.
- **Q-PRE35-3** : le schéma de `requests.jsonl` garde `resumed`, qui vaut toujours `false` quand `tls` n'est pas `null`. Faut-il le
  retirer dans un lot de schéma, ou le garder pour que les lignes restent comparables aux 118 ?

## Pli de la G2 (APPROUVE-AVEC-CORRECTIONS, 2026-10-04)

Rapport : `G2-binance-pre35-1.md` (sondes `pre35-probe/`, mutants `pre35-mut.mjs`, bac à sable de la session). Commits ajoutés après
`54e0515`, sans réécriture : `8253ac5` (tests), `f0347c7` et `5230695` (en-tête du `.d.mts`, **nouveau gel `5230695`**), puis ce pli
des documents. Aucune ligne de production changée : `scripts/record-binance-klines.mjs` est identique à `eb4de63`.

| Correction | Test | Tueur (vérifié tué au gel `5230695`) |
|---|---|---|
| C-1 : le transport par défaut est exécuté | neuf `binance_klines_requests_through_its_own_agent_by_default` : `https.request` remplacé par un espion qui lève, `syncBuiltinESMExports()`, refusé si la liaison ESM ne montre pas l'espion ; l'URL, `maxCachedSessions: 0`, `keepAlive: false`, ce signal ; `network_error` ; restauré après | ligne du test : `:370` `request(url, options)` → `request(url)` (T8) ; à la main : `:98` `keepAlive: false` → `true` (T1) |
| n-3 : délai de 30 s | même test : `AbortSignal.timeout` espionné, appelé avec 30 000, et son signal est celui de la requête ; restauré après (descripteur d'origine) | à la main : `:227` `AbortSignal.timeout(TIMEOUT_MS)` → `new AbortController().signal` (T5) |
| C-2 : L-2 épingle les cinq noms à chemin | `binance_klines_refuses_an_admitted_name_with_an_unformed_value`, deux cas : `{ USERPROFILE: "u" }`, `{ SystemRoot: "W", windir: "W" }` | ligne du test inchangée (`:154` SDL) ; à la main : L1 (`USERPROFILE` hors de `PATH_VALUED`, `:78`) et L2 (`SYSTEMROOT` et `WINDIR` hors de `PATH_VALUED`, `:78`) |
| n-5 : en-tête du `.d.mts` | — | — |

- **Rouge à `eb4de63`** : impossible pour ces corrections, qui épinglent un comportement déjà présent à ce gel (corrections de test
  seulement). Mesuré : `red-proof --base eb4de63 --gel 5230695` refuse les 2 tests touchés comme « green at base ». Leur rouge est
  montré par les mutants du relecteur, appliqués un à un au gel et tous tués : T1, T5 et T8 par le test de C-1, L1 et L2 par le test de L-2.
  Contre la base du lot `0c8f817`, les 7 tests jugés sont rouges par assertion (ci-dessous).
- **Oracle** : `node scripts/red-proof.mjs --base 0c8f8177d9d54005b71a01a4b0e4a9fecd0ca72c --gel 5230695 --repo
  /home/user/monark-governance-bn --draw 7 --seed 37` : **OK** sous Node 24.21.0 (`RED-PROOF.json` `f0a4cf41369bbd70…`) et sous Node
  22.22.2 (`9e59d875f95fac24…`) : 7 jugés F2P, 30 inchangés, 7 tueurs tirés (toute la population), 7 tués.
- Les 37 lignes `// killer:` du fichier, appliquées une à une au gel : 37 tuées. Aucune adresse n'a bougé, puisque le code est inchangé.
- Suite du fichier : 37/37 sous Node 22.22.2 et 24.21.0 ; `tsc --noEmit` et eslint (test) verts.
- R-25 (`r25()`, base `0c8f817`, gel `5230695`) : +224/−219, soit **443 lignes comptées**, sous 547.

### Notes (G2, mineurs)

- **n-1** : l'enregistreur n'envoie plus ni `user-agent` ni `accept-encoding` ; il n'envoie que `Host` et `Connection: close`. Les 118
  étaient tirés avec `user-agent: node`. Si le frontal de Binance refuse une requête sans agent, la première page des 35 le montre par un
  arrêt nommé (`http_status`, corps gardé sous `raw/errors/`). Un corps compressé malgré l'absence d'`accept-encoding` donnerait
  `body_not_json`. Jamais une acceptation muette : la première page des 35 en est la mesure.
- **n-2** : T7 (`res.destroy()` retiré, l.237) survit. Il ne touche que la vivacité : un 200 non attesté et retenu garderait la
  connexion ouverte jusqu'à ce que le pair la ferme. Rien n'est lu ni écrit. Non épinglé dans ce pli.
- **n-4** : T3 (`isSessionReused() === false` retiré, l.104) et T11 (`c?.raw` → `c`) survivent. Ils sont inatteignables sous
  `maxCachedSessions: 0` : c'est une défense en profondeur.

### Réponses du relecteur aux questions

- **Q-PRE35-1** : oui, renommer en `io.request`, dans un lot d'outil ultérieur. C'est un nom seulement : le type garde déjà les appelants
  TS, et C-1 épingle le transport par défaut, quel que soit le nom de la couture.
- **Q-PRE35-2** : garder les deux contrôles fermés par défaut, comparaison à l'octet comprise, sans branche win32 insensible à la casse
  qu'aucun test n'exécuterait. `windir` est normalement `%SystemRoot%` développé, donc égal à l'octet près. Une entrée vide de `PATH`
  n'est que de l'hygiène : l'enregistreur ne lance rien. Si le contrôle ci-dessous nomme `PATH` ou la paire `SYSTEMROOT`/`WINDIR`,
  corriger la ligne `env -i` ou ouvrir un lot (entrées vides filtrées, comparaison insensible à la casse sous win32).
  **Contrôle hors réseau sur l'hôte de la course, avant les 35** : la ligne `env -i` exacte de la course, un argv valide et `--out` dans
  un arbre git. `guardEnv` passe avant `guardOut`, qui passe avant toute requête ; rien n'est écrit. Attendu : `out_in_git_tree`.
  `env_refused` nommerait les variables, jamais leurs valeurs. Exemple mesuré ici (Linux, Node 22.22.2) :
  - `env -i PATH=/usr/bin:/bin node scripts/record-binance-klines.mjs --symbol BTCUSDT --interval 15m --start 2025-01-01T00:00Z --end
    2025-01-01T01:00Z --out /home/user/monark-governance-bn/pre35-envcheck` donne `out_in_git_tree`, exit 1, rien de créé ;
  - même ligne avec `PATH=/usr/bin:/bin:` (une entrée vide) : `{"stop":"env_refused","detail":{"variables":["PATH"],"why":"values outside
    their closed form"}}`, exit 1.
- **Q-PRE35-3** : garder `resumed`, toujours `false`. Le rejeu ne lit jamais `tls`. Lecture : « une poignée de main complète a attesté
  cette ligne » ; une session reprise donne `tls: null`.

## Pli du contrôle de MONARK sur #115 (APPROUVE-AVEC-CORRECTIONS, 2026-10-04)

Message `2026-10-04-MONARK-vers-RECHERCHES-r2-et-115-controles.md` §2 ; rapport
`pieces/2026-10-04-r2-pr115-controle/pr115-RAPPORT.md` (sondes `pr115-probe/`). Commits ajoutés après `c35378b`, sans réécriture :
`cadfc084` (tests), `484b0796` (code, **nouveau gel**), puis ce pli des documents.

### Note datée du 2026-10-04 (F-1) : retrait de quatre phrases

Les quatre phrases suivantes du G0 et de ce G7 sont **retirées**. Le G0 reste tel que commis, comme pour son E-5.
1. « La mesure est propre : aucune ligne de production » (G0 §O-1 ; ce G7, table des items, ligne O-1).
2. « chaque ligne nomme la vraie AC » (ce G7, Mesure O-1, premier point).
3. « Jamais un émetteur faux » (ce G7, Mesure O-1, deuxième point).
4. « l'émetteur faux de CORR O-1 venait de la lignée d'une session reprise » (G0 §O-1 ; ce G7, Mesure O-1, troisième point).

Mesure qui les remplace : une poignée de main **complète**, connexion autorisée, sans aucune reprise, peut journaliser un
`issuer_sha256` faux. Il suffit qu'un serveur TLS du processus ait été créé **avant** que `tls.setDefaultCACertificates` change la
confiance : node nomme alors l'AC de même nom de la confiance précédente, et la feuille ne se vérifie pas sous sa clé.
- Mesures de MONARK (win32, Node 24.15.0 et 22.23.2) : S1 faux 3/3 ; P4 faux 59/60 ; P5 : la feuille ne se vérifie pas sous
  l'émetteur journalisé.
- Mesure ici (**Linux**, Node 22.22.2 et 24.21.0). Sonde `s1linux.mjs` du bac à sable de la session : les séquences S1 à S4 de
  `p5b-trigger.mjs`, avec des AC de même nom, sans identifiant de clé, bâties en DER comme dans le fichier de test. Trois processus par
  séquence et par version :
  - S1 (serveur, puis confiance), S3 (confiance posée deux fois) et S4 (un `tls.createServer()` de plus) : émetteur faux 3/3, et
    `verify` du faux émetteur `false` 3/3 ;
  - S2 (confiance, puis serveur) : émetteur juste 3/3, `verify` `true`.
  - Le défaut n'est donc pas propre à win32.
- Pourquoi le test du lot passait : `endpoint()` posait la confiance avant de créer le serveur, c'est-à-dire l'ordre S2. Ma sonde du G0
  créait aussi les serveurs une fois la confiance posée.
- Effet sur la course des 35 : aucun. Le processus de la ligne de commande ne crée aucun serveur et n'appelle jamais
  `setDefaultCACertificates`.

**Clos par construction** (SERIES-TLS-ISSUER-BY-NAME-1, PAROXYSME) : `certificates()` (l.106-108) journalise l'émetteur seulement si
`new X509Certificate(feuille).verify(new X509Certificate(émetteur).publicKey)` est vrai, sinon `issuer_sha256: null`. Tout échec de
lecture compte comme faux. J'ai retenu `verify` plutôt que `checkIssued`, qui compare les noms et les identifiants : c'est la confusion
de nom elle-même. Mesuré : `verify` est `false` exactement dans les cas faux.

| Correction | Test | Tueur (vérifié tué au gel `484b0796`) |
|---|---|---|
| F-1 | `binance_klines_logs_the_true_issuer_of_two_cas_of_one_name`. Cas 4, qui rejoue S1 : `endpoint()` prend `trustLate`, le serveur est créé sous la confiance précédente, puis la confiance change. La ligne ne porte aucun émetteur, ou la vraie AC, jamais l'autre. Le commentaire du test dit l'ordre sur lequel repose chaque cas. Rouge à `c35378b` (émetteur faux) | `:108` `signs ? sha256(issuer)` → `issuer ? sha256(issuer)` |
| F-3 | piège `https.request` au niveau du fichier, synchronisé dans les liaisons ESM (celle de l'enregistreur comprise) et restauré après le fichier. `via` envoie par l'original capturé. Le test de C-1 pose son espion puis remet le piège. Le mécanisme est celui que C-1 prouve atteint (liaison synchronisée) | (sécurité de test : aucun test jugé) |

- **Oracle** : `node scripts/red-proof.mjs --base 0c8f8177d9d54005b71a01a4b0e4a9fecd0ca72c --gel 484b0796 --repo
  /home/user/monark-governance-bn --draw 7 --seed 37` : **OK** sous Node 24.21.0 (`RED-PROOF.json` `becdd197215437d8…`) et sous Node
  22.22.2 (`d899923a30218ce2…`) : 7 jugés F2P, 30 inchangés, 7 tueurs tirés (toute la population), 7 tués.
- Les 37 lignes `// killer:` recalées sur le gel, appliquées une à une : 37 tuées.
- Suite du fichier : 37/37 sous Node 22.22.2 et 24.21.0, trois passes chacune. `typecheck`, eslint (test), `gate:vocab` et
  `lint:ratchet` (69/69) verts.
- R-25 (`r25()`, base `0c8f817`, gel `484b0796`) : +240/−220, soit **460 lignes comptées**, sous 547.

### Notes (F-6, F-8)

- **F-6** : changement d'empreinte de requête et de journal par rapport aux 118, à lire avec n-1.
  - Les seuls en-têtes envoyés sont `host` et `connection`.
  - Un en-tête `retry-after` (ou `location`) dupliqué est journalisé par sa **première** valeur : `"30"`, là où la base journalisait
    `"30, 60"`. `date` et `x-mbx-used-weight-1m` restent joints.
  - Informatif : Binance ne duplique pas ces en-têtes, et l'arrêt reste nommé.
- **F-8** : M-2 du journal G1 de BINANCE-PRE153-1 (la chaîne disparaissait de la socket undici dès le ticket traité, d'où la lecture
  à la connexion) **ne se reproduit pas** avec `node:https`. Mesure de MONARK (P1, deux Node, win32) : tickets traités avant la
  réponse, en TLS 1.3 comme en 1.2 ; feuille et AC visibles à la réponse et encore après le corps, même socket en keep-alive comprise.
  L'enregistreur lit à l'arrivée de la réponse (l.235).

### Item formé (F-5, PAROXYSME)

- **SERIES-ENV-PROVENANCE-1** (recherche) : la forme fermée de SERIES-ENV-VALUES-1 contrôle la **forme** des valeurs, pas leur
  **provenance**. `SYSTEMROOT` = `WINDIR` = n'importe quel dossier absolu passe, alors que des chemins de fournisseurs Winsock se
  déduisent de `SystemRoot`. Construction à chercher : lier `SYSTEMROOT` et `WINDIR` au dossier Windows que rapporte le système, sans
  code natif ; la source reste à mesurer.
  - **Propriétaire** : RECHERCHES (recherche et mesure sur l'hôte win32 de la course), puis MONARK (report à l'ETAT du tronc à la fusion,
    selon son message).
  - **Déclencheur** : le prochain lot qui touche la garde d'environnement d'un enregistreur, ou la première course sur un autre hôte que
    celui des 35, au premier des deux.
  - **Prix** : une sonde hors réseau sur win32 (lecture de la source candidate, deux Node), environ une demi-session. Si une source
    sans code natif tient : environ 4 lignes et 1 cas. Sinon : la limite reste déclarée, sans code.

F-2 (la ligne `env -i` exacte de la course, rejouée hors réseau dans le shell de la course) : pour MONARK. F-4 et F-7 : consignés,
rien à faire.

## Sortie

Prêt pour le contrôle par diff de MONARK.
