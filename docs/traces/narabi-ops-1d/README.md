# Traces d'execution Linux — NARABI-OPS-1d (C-V-1 du checkpoint-2, C-RV-1 du re-checkpoint-2)

Objet : le test `sentinel_run_releases_chainstack_lock_on_sigterm` (apps/sentinel/test/sentinel-chainstack-guard.test.ts) est SKIP sur win32 ; sa preuve d'execution est Linux. `run.ts` (sha `45557d6e...`) et le test SIGTERM sont byte-identiques entre `e12f59f` (lot) et `7daf8e5` (pli test-only).

| Fichier | Arbre | Producteur | Contenu |
|---|---|---|---|
| `docker-e12f59f-guard-trace.log` | `e12f59f` (extrait) | orchestrateur, docker `node:24`, 2026-09-22 18:0x UTC | fichier guard 10/10, 0 skip, SIGTERM ok |
| `docker-e12f59f-mutant-V6.log` | `e12f59f` (extrait) | orchestrateur, docker `node:24` | mutant V6 (`process.on("SIGTERM")` retire) : `not ok 10`, 9/1 |
| `ci-run-35763895313-e12f59f.extract.log` | `e12f59f` | GitHub Actions run 35763895313 (PR #88, ubuntu-latest) | SIGTERM ✔, 931/930/0/1 |
| `docker-linux-7daf8e5.extract.log`, `docker-linux2-7daf8e5.extract.log` | `7daf8e5` | validateur-humain (re-checkpoint-2), docker `node:24`, clone frais, TMPDIR hors arbre | fichier guard 12/12, 0 skip, SIGTERM `ok 12` |
| `docker-v6-linux-7daf8e5.extract.log` | `7daf8e5` | validateur-humain | mutant V6 ROUGE par le test nomme, 11/1 |
| `ci-7daf8e5-g3.extract.log` | `7daf8e5` (merge `0f2c2d9`, arbre `4c946086...` == `7daf8e5^{tree}`) | GitHub Actions run 35769452047, job 106887215941 | SIGTERM ✔ 18:47:33Z, 933/932/0/1 |

Extraits = lignes TAP/summary filtrees (`ok|not ok|# tests…`), sha longs masques ; les logs complets vivent hors depot (`F:\tmp\nops1d\`, `F:\tmp\cp2-nops1d\logs\`).
