# G2 — Lot H6 (deploy-hardening / caps de ressources)

> **Lot** : H6, correctif du BLOQUEUR checkpoint-2 (validateur, M004 D15) — l'endpoint deviendra un service de calcul public/gratuit/non-authentifié sur le MÊME VPS que la vitrine live ; il lui manquait des plafonds de ressources.
> **Réviseur ≠ générateur** : instance fraîche `claude-opus-4-8[1m]`, ≠ le worker H6. **R-20** : lecture seule, aucun commit ; mutants par `cp`-backup + sha vérifié.

## Périmètre livré
`deploy/Caddyfile.monark-harness` (request_body max_size 256KB), `deploy/monark-harness.service` (CPUQuota=50%/MemoryMax=512M/TasksMax=128 + commentaire d'isolation rendu exact), `apps/harness/src/tools/cascade.ts` (`CASCADE_MAX_NODES=64` + garde fail-closed), `apps/harness/src/schema-projection.ts` (`maxItems` sur L/e), `apps/harness/src/server.ts` (lecteur de corps borné 512KB→413, origin-guard header-first préservé), tests `cascade`/`server`/`harness-deploy-config` + RUNBOOK §1 (least-privilege) §6 (réserves 1a/1b). + corrections doc orchestrateur : re-pin trace H5 (couplage security→schema), PROVENANCE:14/51, ADR-M005:3 statut.

## Verdict G2 : **CORRECTION-REQUIRED** (unique, test-only, non bloquant pour la correction de déploiement) → **CORRIGÉ + vérifié**
Le **code H6 est prouvé correct** (chemin de requête OK bout-en-bout sur les 2 surfaces ; chaque cap mord ; oracle 150/150). Le seul point : **un défaut R-21** — l'invariant de sécurité « origin guard FIRST, avant lecture du corps » (`server.ts:140-142`) n'avait **aucun oracle tueur** : un mutant de réordonnancement (guard sous le lecteur borné) fait passer une requête mauvais-origin+surdimensionnée de 403→413, et pourtant la suite restait verte.

### Disposition (orchestrateur, avant merge)
Ajout d'une assertion câblée dans `apps/harness/test/server.test.ts` (cas a2) : requête `Origin: evil.example.com` + corps > `MAX_REQUEST_BODY_BYTES` ⇒ **403 (pas 413)**. **Vérifiée tueuse** : sous le mutant de réordonnancement (swap lecteur/guard dans `handleNodeRequest`), le test rougit exactement sur `bad-Origin + oversized body ⇒ 403 … NOT 413` (pendant que `origin_invalid_returns_403` reste vert) ; `server.ts` restauré byte-exact (`cp`, sha `5b307a11…`) ; re-run 4/4 vert. Aucune logique produit/contrat touchée.

## Probes vérifiées (PASS)
- **Crux (lecteur de corps)** : driver in-process du réviseur — mauvais-origin+600KB ⇒ **403 conn=close** (corps jamais lu, guard header-first) ; cap+1 ⇒ **413** ; exactement-au-cap ⇒ **400 keep-alive** ; 2,5 Mo en 40 chunks ⇒ **413 propre, socket survit** (mémoire O(cap)) ; miroir + MCP SSE `tools/call` ⇒ **200 yhat=100**. `destroyOnReturn:false` + `Connection: close` corrects.
- **Caps mordent** : 8 mutants (Caddy max_size, systemd Memory/CPU/Tasks, server cap + `>`/`>=`, cascade garde + schema maxItems) rougissent chacun leur assertion, restaurés sha-vérifiés.
- **Valeurs saines** : cascade max-légit 64×64 = ~79 Ko ≪ Caddy 256 000 o ≪ harness 524 288 o (marge ~3,2×, aucun clip d'un `attest`/`gate`/`cascade` réel) ; couches ordonnées (Caddy rejette en premier) ; `CPUQuota=50%` = 50 % d'UN cœur.
- **Contrats gelés 0 octet** ; `CASCADE_MAX_NODES` = constante pure (K-8), pas de cycle d'import ; **least-privilege §1 complet** (seuls `schemas/` + `fixtures/` lus au runtime ; `docs/`/gouvernance exclus) ; §6 réserves présentes ; verify-harness sans false-green.
- **Re-pin couplage** : exactement 1 ligne changée (`tools/list` response_sha256) ; probe vert ; PROVENANCE/ADR corrects.
- **Oracle R-21** : ci **150/150**, lint 0, ratchet 92/92, lang 0 (tous scopes), grep 0, gelé 0 octet. **R-25** ≈ +404 / −25 < 1205.

## Réserves non bloquantes (résidus nommés)
- **OBS-1** : le commentaire « NOT half the box » (`service:42`) ne tient que si le VPS a > 1 vCPU — RUNBOOK §4 devrait logguer `nproc` à côté de `systemctl show`. Owner : orchestrateur, au déploiement (vérif live).
- **OBS-2** : `MemoryMax=512M` sans `--max-old-space-size` → V8 peut OOM avant pression GC ; `Restart=always` absorbe. Owner : post-déploiement si observé.
- **OBS-3** : formulation RUNBOOK « excludes test/ » imprécise (les `test/` de workspace embarquent avec `apps/`/`packages/`, code non gouvernance). Owner : orchestrateur (retouche doc).
- **OBS-4** : `fixtures/` embarque ~15 fichiers dont 3 lus au runtime (le reste = trace/PROVENANCE démonstratifs, pas des secrets). Non bloquant.

**Verdict : CORRECTION-REQUIRED → corrigée + vérifiée ; PASS effectif. Merge autorisé après R-21 orchestrateur (fait) + re-confirmation validateur.**
