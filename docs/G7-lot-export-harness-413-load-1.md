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

Pendant la mesure de base (`npm test` complet, plus deux boucles de `server.test.ts`), le test 42 a rougi autrement : la CI exportée a fini avec le statut 0 mais sa sortie s arrêtait sur des lignes `✔`, sans résumé (« exported CI ran an implausibly small suite »). Lecture probable : `--test-force-exit` appelle `process.exit` alors que stdout (un tube, non bloquant sous POSIX) a encore des octets en file ; c est le défaut que `scripts/red-proof.mjs` contourne déjà (préchargement `setBlocking`). Linux seulement (les tubes de Windows bloquent), sous charge ajoutée ; non rejoué. Item proposé : EXPORT-TEST42-STDOUT-TRUNC-1.

## Sortie

LIVRÉ pour contrôle par MONARK. Rien poussé.
