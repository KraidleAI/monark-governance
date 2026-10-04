# G0 du lot SENTINEL-SIGTERM-STARTUP-WINDOW-1 : le gestionnaire SIGTERM de la sentinelle posé avant la prise du verrou

- **Demande** : item de production formé par la G2 de RECHERCHES sur SENTINEL-SIGTERM-LOAD-1 (C-2, `docs/G7-lot-sentinel-sigterm-load-1.md`), repris au rapport SENTINEL-SIGTERM-LINUX-1 ; zone ouverte par MONARK : `apps/sentinel/src/run.ts` et son test.
- **Base** : `f57ef792` (`origin/lot/etude-suite`, fusion de #134), branche `recherches/sentinel-sigterm-startup-window-1`. Auteur : RECHERCHES.
- **Zone** : `apps/sentinel/src/run.ts` (`main`, lignes 334 à 393 à la base), `apps/sentinel/test/sentinel-chainstack-guard.test.ts` ; ce G0 et le G7. Rien sous `packages/` : le point d accroche du test (`DURABLE_FS`, `packages/rpc-guard/src/ledger.ts:51`) existe déjà et reste inchangé.

## Constat

- À la base, `main` ouvre la jambe payée (`run.ts:340`, `openChainstackLeg` → `openGuardedClient` → `acquireLock`, `guarded.ts:46`, `lock.ts:20`), ouvre le journal du cycle sous le verrou, et ne pose son gestionnaire qu ensuite (`run.ts:342`, et seulement si `leg.status === "ok"`).
- Tant qu aucun écouteur `SIGTERM` n est posé, Node laisse au noyau l action par défaut : un SIGTERM tue le processus sur le champ, sans `finally`. Un SIGTERM réel (`systemctl stop`, arrêt ou redémarrage de l hôte, `TimeoutStartSec`) tombé entre `lock.ts:20` et `run.ts:342` laisse `chainstack.lock`. Les passages suivants lisent `lock_held` (`classifyGuardOpenError`) et tournent sans la jambe payée jusqu au déverrouillage du RUNBOOK (§6-bis). Dégradé, jamais FATAL ; gravité basse.
- La fenêtre est **synchrone** : de `acquireLock` à `process.on`, aucun `await`. Un gestionnaire JavaScript ne s exécute qu au tour suivant de la boucle d événements ; posé avant, il ne peut donc jamais s exécuter au milieu de l acquisition. Un signal reçu pendant la fenêtre est capté par libuv et mis en file ; le gestionnaire s exécute après la fin de la section synchrone de `main`, au premier `await` réellement pendant (`rpc.finalized()`), quand `leg` est déjà affecté.

## Construction

1. Dans `main`, `let leg: ChainstackLeg | undefined` ; le gestionnaire `onSigterm = () => { leg?.release(); process.exit(1); }` est posé par `process.on("SIGTERM", onSigterm)` **avant** `openChainstackLeg`, puis `leg = openChainstackLeg(dir)` passe dans le `try`.
2. Le `finally` fait `leg?.release()` puis retire l écouteur (sans condition).
3. Le gestionnaire est posé pour **tout** passage, jambe ouverte ou non. `release` vaut `() => {}` pour une jambe non ouverte, et l est déjà de façon idempotente pour une jambe ouverte (`released`). Un SIGTERM avant la prise, pendant la prise (mis en file, voir plus haut) ou sans jambe ne fait donc rien d autre que `process.exit(1)`.
4. **Pourquoi ne pas retirer l écouteur quand la jambe ne s ouvre pas** : retirer le dernier écouteur ferme la poignée de signal ; un SIGTERM déjà capté par libuv mais pas encore remis au JavaScript serait alors perdu, et le processus continuerait (systemd attendrait `TimeoutStopSec` puis SIGKILL). Garder l écouteur évite ce cas.
5. **Sortie documentée** : celle de la base pour une jambe ouverte, `process.exit(1)` après le déverrouillage servi (ligne `unlocked` chaînée, plus de `.lock`). Changement de comportement, déclaré : un passage **sans** jambe ouverte (`unconfigured`, `ledger_error`, `config_error`, `lock_held`) qui reçoit SIGTERM sortait par le signal (code nul, 143 vu de systemd) ; il sort désormais par `exit 1`. Les deux sont un échec du oneshot pour systemd ; la publication n en dépend pas.

## Windows et Linux (rapport SENTINEL-SIGTERM-LINUX-1)

- Sous win32, `process.kill` est un arrêt dur : aucun gestionnaire ne s exécute, que le signal vienne du parent ou du processus lui-même. Les nouveaux tests sont des sauts déclarés sous win32, comme `sentinel_run_releases_chainstack_lock_on_sigterm`, avec le même motif ; leur juge est la CI Linux et Linux local. Un SIGKILL reste couvert par le RUNBOOK (C-7).
- `process.on("SIGTERM", ...)` est sans effet nuisible sous win32 (aucun signal réel n y arrive par `process.kill`) ; la construction ne change rien au chemin Windows.
- Sous Linux, un signal envoyé à soi-même par `kill(getpid(), SIGTERM)` est remis avant le retour de l appel quand il n est pas bloqué : sans écouteur, l action par défaut tue tout le groupe de fils avant que le JavaScript ne reprenne. C est ce qui rend le test déterministe à la base.

## Tests (rouges d abord)

Point d accroche, comme les tests existants : un module `--import` dans l enfant (le `run.ts` réel), qui enveloppe `DURABLE_FS.openSync` et `DURABLE_FS.closeSync` (le point d accroche mutable de `ledger.ts`, prévu pour les tests, importé par chemin de fichier : même module que celui que charge `@monark/rpc-guard`, par le chemin réel). Le module envoie `SIGTERM` à son propre processus à un point fixé du code, jamais après une durée, écrit d abord une marque sur stdout (preuve que le point a été atteint), et bouche chaque `fetch` comme `HANG_SRC`.

1. `sentinel_sigterm_after_lock_acquired_before_handler_releases_lock` : signal juste après la fermeture du descripteur de `chainstack.lock` (verrou tenu, fenêtre de la base). Attendu : marque vue, sortie par `exit` avec code 1 (pas de signal), plus de `.lock`, une ligne `unlocked` chaînée, `verifyCycleLedger` vert. À la base : mort par signal, code nul, `.lock` restant.
2. `sentinel_sigterm_while_lock_acquiring_releases_lock` : signal juste avant l `openSync(..., "wx")` du verrou (acquisition en cours). Attendu : idem 1 (le gestionnaire, en file, s exécute après la prise et libère). À la base : mort par signal avant la création du verrou, code nul.
3. `sentinel_sigterm_without_leg_exits_1_and_creates_no_ledger` : passage sans jambe (`CHAINSTACK_CYCLE_ID` absent, `unconfigured`), SIGTERM envoyé par le test à la marque du premier `fetch`. Attendu : code 1, aucun `.lock`, aucun journal créé. À la base : mort par signal, code nul.

Chaque test borne ses attentes par `untilEvent` (sécurité seulement). Le test existant `sentinel_run_releases_chainstack_lock_on_sigterm` reste inchangé, sauf sa ligne `// killer:` recalée sur la nouvelle ligne de `process.on`, et son commentaire sur l ordre gestionnaire / premier `fetch`.

## Tueurs

- test 1 : `CONST "leg?.release(); " -> ""` sur la ligne du gestionnaire (le verrou reste).
- test 2 : `SDL "process.on(" -> ""` sur la ligne de pose (mort par signal).
- test 3 : `CONST "process.exit(1)" -> "process.exit(0)"` sur la ligne du gestionnaire (code 0).
- Les numéros de ligne sont ceux du gel, posés au commit du gel.

## Vérification du lot

- Les tests rouges à la base (commit séparé), verts au gel.
- `node scripts/red-proof.mjs --base f57ef792 --gel <gel> --repo <worktree> --draw n --seed 37`.
- `verifie-ancres.mjs` sur les fichiers touchés.
- `npm test` complet (Node 24.21.0, Linux), `tsc --noEmit`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`, R-25.

## Hors lot

- `apps/dojo/src/collect.ts` cite `apps/sentinel/src/run.ts:341` et `:299-306` comme calques ; ces renvois ne sont pas dans la zone et ne sont pas touchés.
- La reprise automatique d un verrou périmé au démarrage reste non retenue (ruling Q3, item A.8-4) ; un SIGKILL garde l acte manuel du RUNBOOK.

## Taille

Environ 10 lignes de production, 3 tests et un module d accroche d environ 80 lignes. Borne R-25 : 547.
