# G7 du lot EXPORT-HARNESS-413-LOAD-1 : le cas (a2) du test 413 jugé sur ce que le serveur a envoyé ; le test 42 nomme l assertion

- **Plan** : `docs/G0-lot-export-harness-413-load-1.md` (commit `5689eb84`).
- **Base** : `6e0f0b21` (`origin/lot/etude-suite`). **Gel** : `1a00e530` (branche `recherches/export-harness-413-load-1`). Commits de code : `61c35636` (test 42 et son aide), `1a00e530` (test du harnais). Aucun code de production changé : `apps/harness/src/server.ts` a le même sha256 (`a52a4fa1…`) à la base et au gel.
- **Node** : 24.21.0 (version de la CI), installé hors dépôt. Hôte Linux, 4 cœurs.

## Cause racine

Le cas (a2) (mauvaise origine, corps de 512 Kio + 1) exigeait que le client **lise** le 403. Le serveur, correct, répond sur l en-tête et ferme un socket qui tient encore des octets de corps non lus : le noyau répond par RST, **à chaque requête** (mesuré : `OutRsts` + 100 pour 100 requêtes (a2) ; + 0 pour 100 requêtes (a), dont le corps est lu en entier). Linux garde le 403 reçu devant le RST ; Windows jette les octets reçus et non lus quand le RST arrive avant la lecture. Sous la charge de la CI imbriquée, sur l hôte Windows de MONARK, le client a vu `ECONNRESET`, donc `finish(0)`, et l assertion `bad-Origin + oversized body ⇒ 403 …` a rougi (`0 !== 403`), tôt (65 ms).

L assertion exacte n a pas été observée sur l hôte de MONARK (le test 42 n en gardait que le nom) ; elle est établie par le mécanisme mesuré, par la durée (65 ms contre 148 ms) et par l injection ci-dessous, qui reproduit ce message et ces valeurs. Le test 42 du gel les imprimerait.

## Oracle

| Montage | Base `6e0f0b21` | Gel `1a00e530` |
|---|---|---|
| Test seul, K=8 boucles CPU, P=4, N=100 | 0/100 | 0/100 |
| `server.test.ts` en boucle (2 en parallèle) pendant `npm test` complet | 0/624 | non rejoué |
| Sonde : 3 000 couples (a)+(a2), 6 processus, K=8 | 0 écart | sans objet |
| Injection win32 (relais qui jette le 403 et réinitialise le client), 5 passes | **5/5 rouges**, `0 !== 403` sur l assertion (a2) | **5/5 vertes** |

Linux ne reproduit pas le rouge sous charge (la sémantique du RST y garde le 403) : le rouge déterministe est celui de l injection, hors dépôt. Le relais est placé pour la seule requête (a2) d une copie temporaire du fichier de test (supprimée), il transmet le corps au serveur, ne livre rien en retour, et réinitialise le client quand le serveur ferme.

## Mutants à la main (`server.ts`, sha256 `a52a4fa1…` avant et après restauration)

| Mutant | Base | Gel | Gel sous injection win32 |
|---|---|---|---|
| M1 : garde d origine déplacée sous `readBodyBounded` | rouge (`413 !== 403`) | rouge (serveur : 413) | rouge |
| M2 : `if (rejected !== undefined)` devient `if (false)` | rouge | rouge | rouge |
| M3 : corps lu en entier avant la garde, si une origine est présente | **vert (survivant)** | rouge (serveur : 403, `complete` vrai) | rouge |
| Tueur `server.ts:188 CONST "(port, host)" -> "(0, host)"` | rouge | rouge | rouge |

Le reset admis côté client ne masque aucun mutant : l observation du serveur est exigée dans tous les cas. M3 est une dent nouvelle.

## Red-proof

`node scripts/red-proof.mjs --base 6e0f0b21 --gel 1a00e530 --repo /home/user/monark-governance-413 --test-only` : **REFUSED** (exit 1), 3 jugés, 8 inchangés ; `RED-PROOF.json` sha256 `f2e26db9…`.

- `oversized_body_413_and_normal_tools_call_unaffected` : **pinned** ; tueur `apps/harness/src/server.ts:188 CONST` tiré au gel : killed.
- `inner_failures_carry_the_failing_assertion_text` : **pinned** ; tueur `test/helpers/inner-failures.ts:9 CONST` tiré au gel : killed.
- `export_public_no_governance_no_french — clean public export (test 42)` : refused, « runs under the host lock only (test 42) ». C est le seul refus, par construction de l outil (précédent : `docs/G1-lot-t42-bound.md` §4) ; la partie changée du test 42 est tenue par le second test ci-dessus.

## Suite complète et portes

- `npm test` (gel, au repos) : 2 124 tests, 2 102 verts, 22 sautés, **0 échec**, exit 0 ; test 42 vert (CI exportée comprise, 78 s), le test du lot vert (72 ms).
- `tsc --noEmit`, `lint`, `lint:ratchet` (69/69), `gate:vocab`, `lang:gate` : verts.

## R-25

`r25()` (`scripts/oracle/r25.mjs`) sur `6e0f0b21...HEAD` : STAT 145 insertions, 8 suppressions, **153** (borne du G0 : 547 ; porte CI : 1 205) ; CONTENT 0.

## Écarts

- Pas de test rouge déterministe commis : la cause exige la sémantique win32 du RST ; le rouge est montré par l injection hors dépôt (G0).
- Red-proof REFUSED par le seul test 42 (verrou de l hôte), comme prévu par l outil.
- Une aide nouvelle sous `test/` (`test/helpers/inner-failures.ts`), qu aucun fichier de production ne nomme ; non exportée (le `test/` racine ne l est pas).

## Constat hors lot (question)

Pendant la mesure de base (`npm test` complet, plus deux boucles de `server.test.ts`), le test 42 a rougi autrement : la CI exportée a fini avec le statut 0 mais sa sortie s arrêtait sur des lignes `✔`, sans résumé (« exported CI ran an implausibly small suite »). Lecture probable : `--test-force-exit` appelle `process.exit` alors que stdout (un tube, non bloquant sous POSIX) a encore des octets en file ; c est le défaut que `scripts/red-proof.mjs` contourne déjà (préchargement `setBlocking`). Linux seulement (les tubes de Windows bloquent), sous charge ajoutée ; non rejoué. C est une occurrence de l item existant EXPORT-TEST42-SUMMARY-1 (voir « Pli de la G2 », m-5) ; aucun item nouveau.

## Pli de la G2 (2026-10-04)

Revue : `coordination/pieces/2026-10-04-G2-recherches/G2-export-harness-413.md` (APPROUVE-AVEC-CORRECTIONS). Nouveau gel : `990aa442` (commit de test seul) ; `server.ts` inchangé (sha256 `a52a4fa1…`).

- **C-1 (plié)** : `sent` ne pend plus si le serveur lâche le socket sans finir de réponse. La réponse écoute aussi `close` (verdict rapide), et l attente de `sent` est bornée à 10 s une fois que le client a son issue ; les deux voies finissent sur une assertion nommée (« the server closed the response without finishing it » ou « finished no response within 10 s »). Mutants de la G2 sur une copie temporaire de `server.ts` (supprimée ; sha256 du worktree inchangé), `--test-timeout=60000` :

| Mutant | Gel `1a00e530` (G2) | Gel `990aa442` |
|---|---|---|
| M0 aucun | vert | vert (0 s) |
| M6 `req.socket.destroy()`, aucune réponse | rouge par timeout du runner | **rouge en 1 s**, « closed the response without finishing it » |
| M7 `req.socket.end()`, aucune réponse | rouge par timeout du runner | **rouge en 10 s**, « finished no response within 10 s » (le socket serveur, en contre-pression, ne voit pas la fermeture du pair) |
| M10 en-têtes 403 envoyés puis `destroy()` | rouge par timeout du runner | **rouge en 1 s**, « closed the response without finishing it » |
| 413 à la place du 403 (contrôle de lisibilité) | rouge | rouge en 1 s, diff `+ status: 413 / - status: 403` |

  Une variante de M8 (403 complet, puis `resetAndDestroy()` dans `finish`) donne le test vert mais un processus qui ne sort pas, **identiquement** avec le test de `1a00e530` : effet de cette forme de mutant sur la fermeture du serveur, pas du pli.
- **m-1 (plié)** : `failureType:` et `error: |-` rejoignent `NOISE` dans `test/helpers/inner-failures.ts`. La fixture TAP de `test/inner-failures.test.ts` porte désormais un diff de six lignes, qui ne tient entier que si ces deux clés sont écartées (contrôlé : sans elles dans `NOISE`, l assertion « the TAP diff is kept whole within DETAIL » rougit) ; une assertion vérifie qu elles ne figurent pas dans l entrée.
- **m-4 (plié)** : le commentaire de (a2) dit ce que prouve `complete: false` : le corps n a pas été lu en entier (la garde a répondu avant que tout le corps soit consommé). Pas de changement de comportement ; M11 (un morceau lu, puis 403) reste vert, comme à la base.
- **m-5 (plié)** : pas d item EXPORT-TEST42-STDOUT-TRUNC-1. Le symptôme du « Constat hors lot » est celui de **EXPORT-TEST42-SUMMARY-1** (CI exportée au statut 0, ligne de résumé non capturée, « exported CI ran an implausibly small suite » ; `coordination/pieces/2026-10-04-controles-107-112/cm2b-surfaces-RAPPORT.md:52`, propriétaire MONARK). À verser à SUMMARY-1 : une occurrence (mesure de base de ce lot, Linux, `npm test` complet plus deux boucles de `server.test.ts`) et l hypothèse de mécanisme : `--test-force-exit` appelle `process.exit` alors que stdout, un tube non bloquant sous POSIX, a encore des octets en file ; `scripts/red-proof.mjs` contourne déjà ce défaut par un préchargement `setBlocking`. Ce lot touche `test/export-public.test.ts`, qui est le déclencheur même de SUMMARY-1 ; sa portée n a **pas** été reprise ici (le lot ne change que la collecte des lignes `✖`), elle reste à MONARK.
- **m-6** : le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` (100644 vers 100755, laissé par `npm ci`) reste hors de tout commit.
- **Notés, non pliés** : m-2 (`STOP` coupe le détail sur une ligne `ok…` ou `# `, et `at ` en tête de message est pris pour une pile : heuristique acceptée, jamais d échec masqué) ; m-3 (fixtures synthétiques ; la G2 a vérifié l aide sur une sortie réelle de Node 24, spec et TAP) ; m-7 (le sha256 de `RED-PROOF.json` dépend de la passe : chemins et durées ; celui de ce pli est `1141d5e2…`, mêmes lignes d issue) ; m-8 (le nombre de tests de `npm test` varie d une passe à l autre : 2 124 au G7, 2 177 à la G2, 2 119 ici ; non investigué, issue identique, 0 échec).

Passes du pli (Node 24.21.0, variables de proxy retirées) :

- `tsc --noEmit`, `lint`, `lint:ratchet` (69/69), `gate:vocab`, `lang:gate` : verts.
- `node --test apps/harness/test/server.test.ts` : 10/10 verts au repos ; 40/40 verts sous charge (8 boucles CPU sur 4 cœurs, 4 passes parallèles × 10 tours).
- `node --test test/inner-failures.test.ts` : vert.
- `npm test` : 2 119 tests, 2 097 verts, 22 sautés, **0 échec**, exit 0 ; test 42 vert (77,9 s, CI exportée comprise), le test du lot vert (60 ms), `inner_failures_carry_the_failing_assertion_text` vert.
- `node scripts/red-proof.mjs --base 6e0f0b21 --gel 990aa442 --repo /home/user/monark-governance-413 --test-only` : **REFUSED** (exit 1), 3 jugés, 8 inchangés ; les deux tests du lot **pinned**, les deux tueurs (`apps/harness/src/server.ts:188 CONST`, `test/helpers/inner-failures.ts:9 CONST`) **killed** au gel ; seul refus : le test 42 (verrou de l hôte), comme avant. Les lignes des tueurs ne bougent pas ; la liste du G0 reste juste.
- R-25 : `r25()` sur `6e0f0b21...HEAD` : STAT 160 insertions, 8 suppressions, **168** (borne du G0 : 547 ; porte CI : 1 205) ; CONTENT 0. Vert.

## Sortie

LIVRÉ pour contrôle par MONARK. Rien poussé.
