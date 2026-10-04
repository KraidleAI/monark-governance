# G7 du lot SENTINEL-SIGTERM-STARTUP-WINDOW-1 : le gestionnaire SIGTERM de la sentinelle posé avant la prise du verrou

- **Plan** : `docs/G0-lot-sentinel-sigterm-startup-window-1.md` (commit `f15a3478`).
- **Base** : `f57ef792` (`origin/lot/etude-suite`, fusion de #134). **Tests rouges** : `f5fb2018`. **Gel** : `0dc87996` (branche `recherches/sentinel-sigterm-startup-window-1`). Rien poussé.
- **Fichiers de code** : `apps/sentinel/src/run.ts` (`main`), `apps/sentinel/test/sentinel-chainstack-guard.test.ts`. Rien sous `packages/`.
- **Node** : 24.21.0, Linux, 4 cœurs, variables de proxy retirées, `TMPDIR` privé.

## Construction (gel)

- `run.ts:340-344` : `let leg: ChainstackLeg | undefined` ; `onSigterm = () => { leg?.release(); process.exit(1); }` (`:341`) ; `process.on("SIGTERM", onSigterm)` (`:342`) **avant** `leg = openChainstackLeg(dir)`, désormais la première ligne du `try` (`:344`).
- Le gestionnaire est posé pour **tout** passage ; le `finally` fait `leg?.release()` puis retire l écouteur sans condition.
- La prise du verrou est synchrone : un SIGTERM reçu pendant l acquisition est mis en file par libuv, et le gestionnaire s exécute après, `leg` affecté, et libère par le déverrouillage servi (ligne `unlocked` chaînée, `.lock` supprimé). Sans jambe (`release` vide), il ne fait que `process.exit(1)`.
- L écouteur n est pas retiré quand la jambe ne s ouvre pas : retirer le dernier écouteur peut perdre un signal déjà capté (G0, Construction 4).
- `process.on` reste à la ligne 342 : le tueur existant `// killer: apps/sentinel/src/run.ts:342 SDL "process.on(" -> ""` garde sa cible sans changement (le G0 prévoyait de le recaler ; c était inutile).

## Tests

Point d accroche : un module `--import` dans l enfant (le `run.ts` réel) enveloppe `DURABLE_FS.openSync` / `closeSync` (`packages/rpc-guard/src/ledger.ts:51`, importé par chemin de fichier, même module par le chemin réel) et envoie SIGTERM à son propre processus à un point fixé du code. Il écrit d abord une marque sur le fd 1 et bouche chaque `fetch`. Aucune durée ne décide ; `untilEvent` reste la seule borne de sécurité.

| Test | Point du signal | Base `f57ef792` | Gel |
|---|---|---|---|
| `sentinel_sigterm_after_lock_acquired_before_handler_releases_lock` | après la fermeture du descripteur de `chainstack.lock` | rouge : `signal=SIGTERM`, code nul | vert : code 1, plus de `.lock`, ligne `unlocked`, `verifyCycleLedger` |
| `sentinel_sigterm_while_lock_acquiring_releases_lock` | juste avant `openSync(..., "wx")` du verrou | rouge : `signal=SIGTERM` | vert : idem |
| `sentinel_sigterm_without_leg_exits_1_and_creates_no_ledger` | premier `fetch`, sans jambe (`unconfigured`), par `child.kill` | rouge : `signal=SIGTERM` | vert : code 1, aucun journal de cycle |

Sauts déclarés sous win32 (`process.kill` y est un arrêt dur), même motif que `sentinel_run_releases_chainstack_lock_on_sigterm`, inchangé.

Tueurs (lignes du gel) :
- `// killer: apps/sentinel/src/run.ts:341 CONST "leg?.release(); " -> ""` (verrou acquis)
- `// killer: apps/sentinel/src/run.ts:342 SDL "process.on(" -> ""` (acquisition en cours)
- `// killer: apps/sentinel/src/run.ts:341 CONST "process.exit(1)" -> "process.exit(0)"` (sans jambe)

## Red-proof

`node scripts/red-proof.mjs --base f57ef792 --gel 0dc87996 --repo /home/user/monark-governance-ssw --draw 3 --seed 37` : **OK** (exit 0). 3 jugés, tous F2P (rouges à la base par assertion, verts au gel) ; 12 inchangés ; 3 tueurs tirés, 3 tués. `RED-PROOF.json` sha256 `34698d2c2b69ab0a23d51607aae7a369ec416a1cfe2835949a09c8a087112084`.

## Ancres

`verifie-ancres.mjs . --touched f57ef792 HEAD` : tueurs 4 ; ANCRE 4 ; DERIVE 0 ; PERDU 0.

## Charge

Les 4 tests SIGTERM du fichier (`--test-name-pattern=sigterm`), 20 exécutions du fichier, 2 à la fois, sous 8 boucles `node -e 'for(;;){}'` sur 4 cœurs : **80 / 80 verts**.

## Suite complète

- `npm test` (gel) : 2 201 tests rapportés, 2 179 verts, 21 sautés, 1 rouge : le test 42 (`export_public_no_governance_no_french`). Son `npm run ci` exporté est sorti 0, mais sa sortie n avait pas de résumé (« implausibly small suite » : `nTests` nul, la sortie s arrête au milieu des tests). C est la forme de TEST-FORCE-EXIT-REPORT-LOSS-1 (ETAT, ouvert) : des rapports perdus alors que l enfant sort 0. Ce n est pas un échec de test.
- Test 42 relancé seul au gel : **vert** (2/2, CI exportée comprise, 205 s).
- Le fichier du lot, seul : 15/15 verts.
- `tsc --noEmit` 0, `lint` 0, `lint:ratchet` 69/69, `gate:vocab` OK, `lang:gate` OK.

## R-25

`r25()` (`scripts/oracle/r25.mjs`) sur `f57ef792...HEAD` : STAT 87 insertions, 10 suppressions, **97** (borne du G0 : 547 ; porte CI : 1 205) ; CONTENT 0. Les documents `docs/**/*.md` sont hors du compte.

## Écarts et questions pour MONARK

- **Changement de comportement déclaré** (G0, Construction 5) : un passage sans jambe ouverte qui reçoit SIGTERM sort désormais par `exit 1` au lieu de mourir par le signal. Les deux sont un échec du oneshot pour systemd. Si MONARK préfère la mort par signal hors jambe, il faut un renvoi du signal dans le gestionnaire ; c est un choix de MONARK.
- `apps/dojo/src/collect.ts` cite `apps/sentinel/src/run.ts:341` et `:299-306` comme calques ; c est hors zone et non touché. `:341` reste la ligne du gestionnaire.
- Le RUNBOOK et les amendements de l ADR (`docs/ADR-AMENDEMENTS-narabi-ops-1d-G7-source.md`, « handler SIGTERM installé si la jambe est ouverte ») décrivent l ancien ordre ; ils étaient hors zone ; l ADR et le RUNBOOK sont pliés depuis (Q-2, ci-dessous), les amendements restent figés.

## G2

G2 neuve : APPROUVÉ SOUS RÉSERVE, aucun bloquant dans le code (`recherches:coordination/pieces/2026-10-04-G2-recherches/G2-sentinel-sigterm-startup-window-1.md`).
- **B-1 (hors zone, à MONARK)** : `docs/adr/ADR-NARABI-OPS-1.md:200` et `:225` décrivent encore « handler SIGTERM installé si la jambe est ouverte (`run.ts:320-321`) », `finally` en `:367-370`. À corriger en : posé à chaque passage, avant la prise du verrou (`run.ts:341-342`), `finally` en `:391-394`, et les 3 tests ajoutés au tableau D-lock. `docs/ADR-AMENDEMENTS-narabi-ops-1d-G7-source.md:47`, `:72` : à laisser s il est la source figée de l amendement. **Plié** (Q-2, ci-dessous).
- **m-1** : le commentaire du test (`:200-203`, qui cite `run.ts:340-342`) n est pas recalé : il reste vrai (le gestionnaire est toujours posé à `:342`, son corps à `:341`).
- **m-2** plié : « au premier `await` réellement pendant ».
- **m-3** : le mutant qui vide `removeListener` survit ; non tenu, équivalent en pratique pour un CLI qui sort juste après.
- **m-4** (hors zone, à MONARK) : `docs/RUNBOOK-sentinel.md:405` et `ADR-AMENDEMENTS…:287` citent `run.ts:319`, devenu `:344` ; aucune procédure ne change. **Plié** pour le RUNBOOK (Q-2, ci-dessous) ; les amendements restent figés.
- **m-5** plié : le test sans jambe s appelle `sentinel_sigterm_without_leg_exits_1_and_creates_no_ledger`.
- Hors lot, **H-1** (antérieur, sans signal) : si l écriture ou le fsync du verrou échoue après un `openSync "wx"` réussi, le fichier reste (pas encore dans `acquired`, `guarded.ts:43-46` ne le retire pas) : `lock_held` jusqu à l acte du RUNBOOK. Item proposé, lot `packages/rpc-guard`.
- Question 1 : la G2 recommande de garder `exit 1` (systemd `oneshot` compte les deux comme échec) ; `143` possible dans un autre lot si MONARK veut distinguer de l arrêt L-1. **Décidé** : sortie 1 gardée (Q-1, ci-dessous).

## Décisions MONARK (message `9fd1ae1`, `recherches:coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-137-Q1-Q2-H1.md`)

- **Q-1 : sortie 1 gardée.** Un passage sans jambe qui reçoit SIGTERM sort par `exit 1` ; pas de renvoi du signal.
- **Item « code 143 plus tard »** : sortir par 143 (128 + SIGTERM) au lieu de 1 sur un SIGTERM, pour qu un arrêt par signal se distingue de l arrêt L-1 (`exit 1` quand un jour dû n a pas pu être rattrapé). **Déclencheur** : le jour où l on veut distinguer l arrêt L-1 de l arrêt par signal (alerte, sonde ou lecture du journal). Lot séparé ; rien ici.
- **Q-2 : zone ouverte dans #137 même.** B-1 et m-4 sont pliés ici (fusion de `origin/lot/etude-suite` au préalable) :
  - B-1 : `docs/adr/ADR-NARABI-OPS-1.md:200` (D-lock) : handler posé à chaque passage, avant la prise du verrou (`run.ts:341-342`), `finally` en `:391-394`, phrase datée « 2026-10-04, SENTINEL-SIGTERM-STARTUP-WINDOW-1 » en fin de D-lock ; `:225` (ligne D-lock du tableau) : mêmes lignes, et les 3 tests ajoutés.
  - m-4 : `docs/RUNBOOK-sentinel.md:405` : `run.ts:319` devient `run.ts:344` (`leg = openChainstackLeg(dir)`).
  - `docs/ADR-AMENDEMENTS-narabi-ops-1d-G7-source.md` (`:47`, `:72`, `:287`) : laissé tel quel, source figée de l amendement.

## Sortie

LIVRÉ pour contrôle par MONARK. Rien poussé, aucune PR.
