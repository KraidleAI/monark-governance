# FAITS : l'arrêt libuv `UV_HANDLE_CLOSING` à la sortie d'un processus Node sous Windows (2026-10-06)

Lu sur place par l'orchestrateur MONARK (navigateur interne), le 2026-10-06 entre 18:12 et 18:14 UTC. Pages publiques, sans session.
Citations de 25 mots au plus.

## Sources primaires [lu]

- **nodejs/node#56645**, « libuv assertion on Windows with Node.js 23.x » (`https://github.com/nodejs/node/issues/56645`) :
  - reproduction de l'auteur : un `fetch`, puis `process.exit()` ; « It does not reproduce on Linux nor macOS. » ;
  - bisection de l'auteur vers la mise à jour de V8 12.8 (nodejs/node#54077) ;
  - un mainteneur : « node calls uv_async_send() after uv_close() » ;
  - contournement relevé dans le fil : un délai de 50 à 100 ms avant `process.exit`.
- **nodejs/node#61999**, « src: fix libuv assertion on windows » (`https://github.com/nodejs/node/pull/61999`) : fusionnée dans
  `main`, « Fixes: #56645 » (le pointeur du handle est remis à `nullptr` après `uv_close`).
- **nodejs/node#65461**, « 2026-08-26, Version 24.20.0 'Krypton' (LTS) » (`https://github.com/nodejs/node/pull/65461`) : sa liste des
  changements porte « fix libuv assertion on windows (liuxingbaoyu) ».

## Mesures locales (sonde `F:/tmp/dojo/coinbase-flake/exitprobe/probe.mjs`, hors dépôt ; Node 24.15.0, undici 7.24.4, libuv 1.51.0)

- Trois serveurs de boucle locale, chacun servi par un `fetch` puis fermé, puis `process.exit` : 8 arrêts sur 8 ; deux serveurs : 0 sur 8.
- Sortie naturelle : 0 sur 6 ; `process.exit` différé de 300 ms : 0 sur 6.
- `--no-wasm-dynamic-tiering`, `--liftoff-only`, `--no-liftoff`, `--single-threaded` : 0 sur 6 chacun ; `--v8-pool-size=0` : 6 sur 6.
- Lecture : une tâche de fond de V8 (ici la montée de niveau du parseur WebAssembly d'undici) poste vers la boucle après la fermeture de
  son handle ; c'est le mécanisme décrit au fil de #56645.

## Conséquences

- Toute version de Node 24 antérieure à 24.20.0 porte l'arrêt sous Windows. L'hôte de travail MONARK tourne en 24.15.0.
- Les serveurs tournent sous Linux, non touché ; la vitrine est en 24.21.0 (`docs/RUNBOOK-vitrine.md` l.4). La CI prend `node-version: "24"`
  sous Linux (`.github/workflows/ci.yml` l.152, l.178, l.198).
- Construction de l'item FORCE-EXIT-WASM-TIERUP-1 : Node 24.20.0 ou plus sur l'hôte de travail Windows (acte de l'investisseur :
  installation sur sa machine), puis la sonde rejouée (attendu : 0 sur 8 à trois serveurs). En attendant : aucun test ne finit sur une
  rafale de `fetch` (lot COINBASE-LOOPBACK-FLAKE-1).
