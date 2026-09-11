# G2 — Lot H4 (miroir HTTP/JSON + OpenAPI + export Q-A + config de déploiement)

> **Lot** : H4 du harnais MCP (ADR-M005 D7/D10, révisé par **Addendum D12** — l'agent déploie).
> **Réviseur ≠ générateur** : deux instances fraîches `claude-opus-4-8[1m]`, distinctes du générateur H4 **et** entre elles.
> **R-20** : le réviseur ne commit ni n'édite ; corrections appliquées par un worker de fix-pass séparé + l'orchestrateur.

## Périmètre livré
- `apps/harness/src/http.ts` — miroir HTTP/JSON (`POST /gate·/cascade·/attest`, `GET /openapi.json·/health`), piloté par `HARNESS_TOOLS`, même standard-schema que MCP, enveloppe `{structuredContent, content}` (miroir exact du `CallToolResult`).
- `apps/harness/src/openapi.ts` — OpenAPI 3.1 **dérivé des schémas gelés projetés** (jamais réécrit à la main).
- `apps/harness/src/server.ts` — routage par Host (`isJsonMirrorHost`, `api.` → miroir, sinon MCP), origin-guard **avant** la branche de surface (les deux surfaces gardées).
- `deploy/monark-harness.service`, `deploy/Caddyfile.monark-harness` — config systemd + Caddy (motif vitrine).
- `docs/RUNBOOK-harness.md`, `scripts/verify-harness.mjs` — runbook (orchestrateur-déployé, D12) + script de CA de déploiement.
- Export Q-A : `apps/harness` en liste blanche (`export-public.mjs`, style package) ; test 42 couvre le harnais.
- Tests neufs : `http.test.ts` (42/43 + parité K-1), `openapi.test.ts` (test 43), `harness-export.test.ts`, `harness-deploy-config.test.ts`, `no-secret-in-repo.test.ts`.

## Tour-1 (G2 fraîche) — ACCEPT-WITH-CORRECTIONS
Implémentation fonctionnellement saine (serveur + miroir OK ; schémas dérivés et drift-gardés ; secrets scannés ; origin-guard sur les deux surfaces ; **SDK Host-validation OFF confirmé à la source** `@modelcontextprotocol/server@2.0.0/dist/index.mjs:333,390`). Aucun défaut REJECT. Corrections (rang) :
1. **Reframe RUNBOOK** (changement de spec Q2 révisé, PAS un défaut worker) — investisseur → orchestrateur, SSH `-i ~/.ssh/monark_vps`, rsync (pas git-clone du dépôt privé), cite Addendum D12/D17, supprime « never ssh/scps ».
2. **`README.md:96`** — « investor (… Q2) » **public et périmé** → phrase de déploiement neutre, sans fuite.
3. **`verify-harness.mjs`** — défaut réel : la CA ne pouvait pas tourner pré-prod ((a) TLS dial:443 inconditionnel même en http ; (b) checks miroir mal routés localement car `fetch` ne pose pas `Host`).
4. **`http.test.ts`** — durcissement : parité du texte d'honnêteté `content` (K-1) miroir↔MCP non testée.
5. **Précision docstring** (server.ts) — Host-validation opt-in via `enableDnsRebindingProtection` (défaut false).
6. **Commentaires de config** — « INVESTOR-DEPLOYED (Q2) » → « orchestrator-deployed (D12) ».

## Fix-pass (worker séparé) — 6/6 corrigées, preuves
- **C-3 prouvé empiriquement** : `verify-harness.mjs --api http://127.0.0.1:3001 --api-host api.monarkgate.tech --mcp …` → 8 checks verts, TLS sauté pour http, exit 0. Nouveau flag `--api-host` (défaut = hostname api → prod inchangée) ; checks miroir via `node:http` avec `Host` explicite (idiome `wiredPost`), mcp via `fetch`.
- **C-4 mutant** : `http.ts:85` text→"" ⇒ **RED** (`gate mirror content == MCP honesty text`), restauré byte-exact `cp` (sha `05cb5e0d…`), **GREEN**.
- C-1/C-2/C-5/C-6 : appliqués ; `grep` fuite README **vide** ; C-2 déviation (pointeur `deploy/` retiré car `deploy/` hors whitelist export → éviterait un lien pendant public) — jugée **hygiène correcte**.

## Tour-2 (G2 fraîche ≠ tour-1 ≠ fix-worker) — PASS-WITH-RESERVES (0 bloquante)
Les 6 corrections **ferment** les constats tour-1, **aucune régression**. `verify-harness.mjs` est **sain pour l'attestation** : **aucun chemin false-green** (exit 0 ⟺ tous les checks passés, et pour https `tls.authorized===true`), défaut Host prod correct, TLS gaté sur `https:`, **mécanisme Host prouvé load-bearing** (omettre `--api-host` ⇒ 5 checks échouent correctement). Diff-review 100 % : origin-guard short-circuit `rejected ??` préservé, aucune assertion affaiblie, aucune dépendance neuve (R-8).
**Oracle R-21 corroboré (réviseur)** : `npm run ci` 146/146, lint 0, ratchet 92/92, lang-gate harness 0, grep-forbidden 0, `git diff main -- schemas/ packages/contracts/` **0 octet**.

### Réserves non bloquantes portées
- **Déploiement (1a)** : gater la décision verte sur `exit==0` **ET** `VERIFY OK` (un rouge peut sortir en 127 sous Windows — course libuv au teardown ; jamais un false-green ; JSON+CA émis avant).
- **Déploiement (1b)** : la branche https-wired de `verify-harness.mjs` s'exécute pour la **première fois** au déploiement réel — confirmer le exit wall-clock + `tls.authorized===true` dans la CA.
- Corrections doc orchestrateur (post-tour-2, additives/commentaire) : fallback **tar-over-ssh** dans RUNBOOK §1 (rsync absent du Git Bash Windows), clarif création `/opt/monark-harness-redeploy.sh` au déploiement, cross-ref `service:20` (§2 pas §4).
- CA enregistre le cert `api.` seulement ; `mcp.` TLS implicite par `fetch` (`rejectUnauthorized` défaut).

## error_origin
- Corrections 1/2/6 (framing) = **spec (Q2 révisé)**, pas défaut worker. Correction 3 = **générateur H4** (TLS/routage non exercés — la CA n'avait jamais tourné). Correction 4 = **générateur (test)**. Correction 5 = **prose/[2nd]**. Incident troncation `openapi.ts` pendant l'adjudication (git checkout sur fichier non commis) = **procédure orchestrateur**, récupéré byte-exact depuis le transcript worker (sha `daaf52b4…`).

**Verdict G2 : PASS-WITH-RESERVES (0 bloquante) — merge autorisé après R-21 orchestrateur + R-25.**
