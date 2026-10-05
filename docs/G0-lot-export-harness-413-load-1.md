# G0 du lot EXPORT-HARNESS-413-LOAD-1 : le test 413 du harnais jugé sur ce que le serveur a envoyé, et le test 42 qui nomme l assertion

- **Demande** : MONARK, `2026-10-04-MONARK-vers-RECHERCHES-v0-8-0-alea-413.md` §3 (et `…-v0-8-0-sha.md` : « un vert après un rouge ne ferme pas l aléa »). Item d ETAT `6e0f0b21` (recherches#129).
- **Base** : `6e0f0b21` (`origin/lot/etude-suite`), branche `recherches/export-harness-413-load-1`. Auteur : RECHERCHES.
- **Zone** : `apps/harness/test/server.test.ts` (le test `oversized_body_413_and_normal_tools_call_unaffected`), `test/export-public.test.ts` (test 42), une aide nouvelle `test/helpers/inner-failures.ts` et son test `test/inner-failures.test.ts` ; ce G0 et le G7. Aucun code de production : `apps/harness/src/server.ts` est inchangé.

red-proof: test-only

## Constat

Première passe de `release-public.mjs` pour v0.8.0, sur l hôte de MONARK (Windows) : le test 42 rougit, et dans la CI exportée un seul test est rouge, `oversized_body_413_and_normal_tools_call_unaffected` (`server.test.ts:102`), en 65 ms ; il est vert dans la suite externe de la même passe (148 ms). Le test 42 ne recueille que les lignes `✖` : l assertion en cause n est pas nommée.

## Mesures avant correctif (base `6e0f0b21`, Linux, Node 24.21.0, 4 cœurs)

1. **Le mécanisme existe, à chaque requête.** Compteur `OutRsts` de `/proc/net/snmp` autour de 100 requêtes de chaque sorte (sonde hors dépôt) : (a2), mauvaise origine et corps de 512 Kio + 1, donne 100 réponses 403 et **100 RST envoyés** ; (a), origine absente et même corps, donne 100 réponses 413 et **0 RST**. En (a2) le serveur répond sur l en-tête et ferme un socket qui tient encore des octets de corps non lus : le noyau répond par RST. En (a) le lecteur borné a consommé tout le corps (l octet en trop tombe dans le dernier morceau) : fermeture propre.
2. **Linux ne perd jamais le 403.** Le RST arrive après les octets du 403 ; Linux garde dans la file de réception les octets reçus et non lus (`tcp_reset` ne vide que la file d émission) : le client lit le 403 puis voit la fin. Mesuré : 3 000 couples (a)+(a2) dans 6 processus sous 8 boucles CPU, 0 écart ; 100 exécutions du test seul (P=4, K=8), 0 échec ; 624 exécutions de `server.test.ts` pendant une suite complète (`npm test`, test 42 et sa CI imbriquée compris), 0 échec.
3. **Windows perd le 403 si le RST arrive avant la lecture** (comportement connu de Winsock, non mesuré ici : l hôte de ce lot est Linux). Sur Windows, un RST abandonne la connexion et jette les octets reçus et non encore lus ; `recv` rend `WSAECONNRESET` (Node : `ECONNRESET`). Sous la charge de la CI imbriquée, le client du test est préempté entre l arrivée du 403 et sa lecture : il voit `error` puis `finish(0)`, et l assertion `bad-Origin + oversized body ⇒ 403 …` rougit avec `0 !== 403`, tôt dans le test (65 ms contre 148 ms vert). C est l hypothèse (a2) de MONARK, avec sa cause : la sémantique du RST de win32.

## Cause racine

L assertion (a2) du test exige que le client **lise** le 403. Or le comportement correct du serveur (refuser sur l en-tête, ne jamais lire le corps d une origine refusée, fermer) produit par construction un RST ; et sur win32 un RST peut effacer un 403 déjà reçu. Le test demande donc au client une chose que le système d exploitation ne garantit pas. Le défaut est dans le test, pas dans le serveur. (a) avec `fetch` n est pas en cause : 0 RST mesuré, le corps est lu en entier avant la réponse.

## Pourquoi le rouge est une reproduction de charge et non un test rouge déterministe

Le rouge exige la sémantique win32 du RST ; l hôte de ce lot est Linux, où le 403 survit au RST (mesures 1 et 2). Aucun test rouge déterministe n est donc commis. Le rouge est démontré par une injection hors dépôt : un relais TCP placé devant le serveur pour la seule requête (a2), qui retient la réponse et, quand le serveur ferme, réinitialise le client sans la livrer (le comportement de win32 quand le RST précède la lecture). Avec ce relais, le test de la base rougit de façon déterministe sur l assertion (a2), et le test du gel est vert. Les chiffres sont au G7.

## Règle

1. **Le verdict de (a2) porte sur ce que le serveur a envoyé**, observé dans le test sur l événement `request` du serveur (un second écouteur, posé avant la requête, retiré à la première requête d origine `evil`) : à l événement `finish` de la réponse, `{ status: 403, complete: false }`. `complete` est `req.complete` : faux tant que le corps n a pas été reçu en entier ; le 403 part donc avant la lecture du corps. C est le sens de (a2), et il gagne des dents : un serveur qui lirait tout le corps puis refuserait l origine (403, `complete` vrai) rougit aussi.
2. **Le client doit voir ce 403, ou un reset** (`ECONNRESET`, `EPIPE`, `ECONNABORTED`) : le seul cas où le 403 envoyé peut ne pas être lu. Tout autre statut, et toute autre erreur, rougit. L assertion n accepte donc jamais « n importe quelle issue » : le reset n est admis que si le serveur a réellement envoyé le 403 avant de lire le corps (assertion 1, toujours exigée).
3. **Le test 42 porte le texte de l assertion** (prolongement de EXPORT-TEST42-INNER-NAMES-1) : `test/helpers/inner-failures.ts` garde, pour chaque test rouge de la CI exportée, la ligne `✖` (ou `not ok`) suivie d au plus 6 lignes de détail (message, valeurs, sans pile), une entrée par test (la plus longue des deux impressions du rapporteur spec), au plus 10 entrées.
4. Les parties (a), (b), (c1), (c2) du test ne changent pas. Le serveur ne change pas.

## Tueurs (listés pour `--test-only`)

- `apps/harness/src/server.ts:188 CONST "(port, host)" -> "(0, host)"` : tueur existant de `oversized_body_413_and_normal_tools_call_unaffected`, gardé tel quel (adresse inchangée : `server.ts` n est pas touché).
- `test/helpers/inner-failures.ts:9 CONST "DETAIL = 6" -> "DETAIL = 0"` : tueur du test nouveau `inner_failures_carry_the_failing_assertion_text`.
- Mutants appliqués à la main au G7 sur `server.ts` (sha256 avant et après restauration), le sens de (a2) : (M1) la garde d origine déplacée sous `readBodyBounded` (413 attendu, rouge) ; (M2) `rejected !== undefined` remplacé par `false` (garde éteinte, rouge) ; (M3) le corps lu en entier avant la garde (403 avec `complete` vrai, rouge : dent nouvelle).
- Le test 42 est hors du red-proof (« (test 42) » : verrou de l hôte) ; sa partie nouvelle est tenue par `inner_failures_carry_the_failing_assertion_text`.

## Preuve

- `node scripts/red-proof.mjs --base 6e0f0b21 --gel <gel> --repo <worktree> --test-only` : seuls des tests et des docs changent ; les deux tueurs ci-dessus tirés au gel.
- Oracle de charge avant et après (montage du lot SENTINEL-SIGTERM-LOAD-1) ; injection win32 hors dépôt, base et gel.
- `npm test` complet (test 42 compris), `tsc --noEmit`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`.

## Taille

Environ 150 lignes de code de test changées. Borne R-25 : 547.
