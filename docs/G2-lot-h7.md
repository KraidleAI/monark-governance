# G2 — Lot H7 (fix du self-DoS cascade + durcissement systemd)

> **Lot** : H7, correctif de l'ESCALADE checkpoint-2 (validateur) — le harnais pouvait se DoS lui-même (cascade payait une itération Picard 100k inutile). Décision investisseur 2026-09-11 : **H7 avant déploiement** (endpoint robuste d'emblée).
> **Réviseur ≠ générateur** : instance fraîche `claude-opus-4-8[1m]`, ≠ le worker H7. **R-20** : lecture seule, mutants `cp`-backup sha-vérifiés.

## Périmètre
`apps/harness/src/tools/cascade.ts` (clearing()→`fictitiousDefault`, ≤ n rondes ; commentaires corrigés), `apps/harness/test/cascade.test.ts` (test op-count + comment), `deploy/monark-harness.service` (`--max-old-space-size=448` + `StartLimitIntervalSec=0`), `test/harness-deploy-config.test.ts`. + corrections doc orchestrateur (validateur Rang 2) : RUNBOOK §4 (nproc + StartLimit + cmdline V8) / §6 (2 sondes live) / §1 (wording `test/`), PROVENANCE re-pin line, ADR-M005:162 + PLAN:64 (datation pendant K-5), cascade.ts:5 comment (OBS-C).

## Verdict G2 : **PASS-WITH-RESERVES (0 bloquante)**
Le self-DoS est **corrigé** (`fictitiousDefault` borné ≤ n rondes), **prouvé testé** (oracle op-count déterministe qui rougit sur l'ancien chemin exact), et **préserve le comportement bit-à-bit** (yhat inchangé, pin trace H5 tient sans re-pin). Surface gelée + contrats + UKEMI intacts ; durcissement systemd sain et bien sectionné ; corrections doc exactes et sans fuite.

### Probes (toutes PASS)
1. **Parité comportement (CRUX)** : `clearing().pPlus` provient de `fictitiousDefault` (`clearing.ts:186`) ; le `clearingFromBelow` (l.187) ne nourrissait que le flag `unique` que cascade ne lit pas. `fictitiousDefault(sys).p === clearing(sys).pPlus` **bit-à-bit** (Object.is) sur le démo 3-nœuds, le cycle pathologique n=64, et 4 systèmes 8-nœuds aléatoires. `cascade_wires_clearing_to_yhat` (shock-0.57) + `probe_harness_records_real_decision` verts ; **pin trace `8213c631…` tient, NO re-pin**.
2. **Discriminateur op-count réel** : mutant (restore `clearing(sys)`) ⇒ RED `got 12800320` (~1.28e7, 6,6 s) ; nouveau chemin < 2560 ; correctness (shock 0 ⇒ yhat 0 ; shock 0.5 ⇒ yhat 6400) ; `cascade.ts` restauré sha `7fbb39f1…`.
3. **Gelé + UKEMI 0 octet** : `git diff main -- schemas/ packages/contracts/ packages/ukemi/` = 0.
4. **systemd OBS-2** : `--max-old-space-size=448` (MiB) < `MemoryMax=512M` (512 MiB base-1024) ⇒ V8 GC avant OOM cgroup ; `StartLimitIntervalSec=0` correctement en `[Unit]` ; 3 mutants rouges.
5. **Corrections doc** : sonde n=65 = vrai système 65×65 ; `head -c 300000` > 262144 ; miroir HTTP mappe l'oversize en 400 (« 4xx » correct) ; §1 « ROOT test/ » exact ; re-pin PROVENANCE vérifié (`2a81509a`→`8213c631` en commit `1abc1e2`) ; `fixtures/` whitelisté ET scanné (test 42 vert, pas de fuite).
6. **Oracle R-21** : ci **152/152**, lint 0, ratchet 92/92, lang 0 (9 scopes), grep 0 (107 fichiers), gelé+ukemi 0. **R-25 = 169 ins / 8 fichiers** (un seul concern).
7. **Diff 100 %** : aucune assertion affaiblie, aucune dépendance neuve, `CASCADE_TOOL_DESCRIPTION` inchangée (pas de churn tools/list).

### Réserves non bloquantes (G7)
- **OBS-A** : le discriminateur op-count deviendrait vacueux si un futur lot UKEMI mettait en cache pbar/Pi dans `phi` (les deux chemins tomberaient à ~5N ; le backstop `elapsedMs<2000` ne rattraperait pas de façon fiable ~4e8 ops en cache). **Flag pour tout futur lot UKEMI** (commenté dans le test). UKEMI gelé ce lot.
- **OBS-B** : « graceful V8-OOM devient le chemin commun » est une **prédiction non mesurée** (448/512 = 87,5 %, ~64 MiB pour non-old-space) ; `MemoryMax` reste le backstop dur et `Restart=always` récupère. **Portée au DÉPLOIEMENT** : une lecture `systemctl show -p MemoryCurrent` post-déploiement sous charge fermerait le point.
- **OBS-C** (cosmétique) : référence `clearing` périmée dans l'en-tête `cascade.ts:5` → **CORRIGÉE** par l'orchestrateur (« Eisenberg-Noe clearing (`fictitiousDefault`… L* en ≤n rondes) »).

## error_origin
Self-DoS = générateur H6 (claim `<3e5 ops`) + G2 H6 (octets vérifiés, pas les ops) ; corrigé ici. Les corrections doc = validateur Rang 2 (spec/doc). Aucune n'a touché la logique produit (yhat préservé) ni UKEMI/contrats gelés.

**Verdict : PASS-WITH-RESERVES (0 bloquante) — merge autorisé après R-21 orchestrateur (fait : 152/152) + G7. OBS-B portée au déploiement, OBS-A aux futurs lots UKEMI.**
