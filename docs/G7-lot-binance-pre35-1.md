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

## Sortie

Prêt pour le contrôle par diff de MONARK et une G2 neuve.
