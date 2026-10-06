# FAITS — DEM-1 de l audit P3 : le code servi par le harnais est `af9b889` (lu sur l hôte, 2026-10-02 03:08:01 UTC)

- Acte : orchestrateur, lecture seule par `ssh` (clé `~/.ssh/monark_vps`, cible du serveur du site lue dans `docs/RUNBOOK-harness.md`,
  jamais affichée), `sha256sum` de quatre fichiers sous `/opt/monark-harness`. Horloge de l hôte : 2026-10-02T03:08:01Z.
- Résultats, égaux aux empreintes attendues de `F:/tmp/audit-p3/STATUT-AUDIT-P3.md` §8 (DEM-1) :
  - `apps/harness/src/tools/gate.ts` `4cc340e29c3f9224917efa2a75fd63cec684e49c1a3acf7f5b7d07cf42fffb9a` ;
  - `packages/hikae/src/l3-gate.ts` `c23a4030bf5f8ce5dde6799dc360c32cfa954329d4c01bd6d1b7f61ca49d18ff` ;
  - `apps/harness/src/calibration.ts` `6aef88d2b20d65c85452732164c9c7e54235a50bc9ceab5ea7dc6ca2abc7e490` ;
  - `apps/sentinel/src/run.ts` `45557d6e12739449fdf679226b606aecb57d1abb1515ca7be672f0ee741df5db`.
- Conséquence : le statut de l audit passe de « trace du dépôt » à « lu sur l hôte » pour le commit servi ; S-11 (sosies acceptés en BYO)
  est atteint sur le serveur public aujourd hui ; lot BYO-NEAR-NAME-1 premier après la publication de la page (HANDOFF §13).
- Observé au même instant : unité `monark-harness` `active` ; unité `monark-sentinel` `inactive`, vérifié aussitôt : `Type=oneshot`,
  minuterie `monark-sentinel.timer` `enabled` et `active`, dernier passage `Result=success`, `ExecMainStatus=0` (fin 2026-10-02 00:51:39 UTC) :
  état normal d une unité oneshot entre deux passages.
