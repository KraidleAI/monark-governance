# G7 — GARDE-HELIUS-1a (`@monark/rpc-guard` : client budgété unique, ledger de cycle par opérateur, caps, rapprochement) — ACCEPTED (paquet `upcoming`)
Orchestrateur `claude-fable-5-1`, 2026-09-21 ~14:10 UTC. Fusion `--no-ff` sur `lot/etude-suite` (branche `lot/garde-helius-1a`, base `514ee1a`, HEAD de lot après G2-delta persistée).

## Vérifications de l'orchestrateur (exécutées, pas lues)
- **Oracle complet sur l'arbre FUSIONNÉ** : `npm run ci` = `gate:vocab` OK (202 fichiers), typecheck 0, **689 tests : 688 pass, 0 fail, 1 skip** (déclaré : moitié full-scope de `rpc-guard-fetch-only-inside-client`, déclencheur 1b, allowlist jamais élargie), exit 0 ; `npm run lint` = la seule erreur **pré-existante** b1a (`rebase-crosscheck.test.ts:600`, résorbée dans le lot b1b en cours, `error_origin` G7 b1a) ; ratchet 69/69 sur le lot (validateur et G2-delta). Journal `scratchpad/ci-garde1a.log`.
- R-25 : `lot/etude-suite...lot/garde-helius-1a` pathspec `ci.yml:65` = **1 096 ≤ 1 205** (21 fichiers, insertions seules ; pas de seam — deux relecteurs concordants).
- `package-lock.json` édité à la main : `npm ci --offline` rejoué par le validateur (exit 0, lien workspace créé).
- Aucun appel réseau, aucune URL à clé ; le seul fichier portant `env.<clé>` est `packages/rpc-guard/src/transport.ts` (allowlist CI).

## Chaîne
G0 (`docs/G0-lot-garde-helius.md`, checkpoint-1 `514ee1a` reconstruit) → G1 (`9201c74`) → **G2 séparée FAIL ‖ checkpoint-2 ACCEPTE-AVEC-CORRECTIONS (régime B, convergents)** → rulings de plan (`bb88e74`) → pli par reprise (`b13850c`, C-V-1..9 + C-G2-1..6) → **G2-delta PASS-AVEC-CORRECTIONS ‖ second checkpoint-2 ACCEPTE** → G7. Deux relectures indépendantes : chacune a attrapé ce que l'autre a manqué (G2 : `--max-credits` non testé ; cp-2 : transport exporté sans compteur, clé dans l'erreur `fetch`).

## error_origin (assigné)
C-V-1/C-G2-1 (cap de cycle absorbé par le floor) **worker G1** (formule G0 §3.4-3 explicite) + contributif plan (« à l'ouverture » non écrit) ; C-V-2 (transport payant exporté) partagé worker / planificateur / validateur cp-1 ; C-V-3 (clé dans l'erreur) worker ; C-V-4/C-G2-4 (verrou non branché) worker ; C-V-5/C-G2-3 (`--method-caps` vacant) worker + sémantique planificateur ; C-V-6 worker ; C-V-7/C-G2-6 (fenêtre, bande) planificateur/validateur ; C-V-8 (troncature) planificateur/validateur ; C-G2-2 (cap run non testé) worker ; C-G2-5 worker ; C-V-9 worker ; checkpoint-1 non persisté : outillage.

## Items formés (déclencheur, propriétaire)
- Prior figé AVANT le verrou (`guarded.ts:13` → `client.ts:72-75`, fenêtre microseconde) — **1b**, worker.
- Séquence `unlock` → `reconcile` à ajouter au protocole pré-enregistré G0 §4 — avant la 1ʳᵉ course, orchestrateur.
- Atomicité multi-verrou / rollback (C-G2D-1) et prior par opérateur — **lot 2** (Chainstack), worker.
- Append + tête non atomiques (C-G2D-2, fail-closed) — runbook de reprise ou append atomique, 1b.
- Test full-scope `fetch_only_inside_client` : SKIP → actif à 1b (14 hits `apps/bell/src` à migrer ; `undici` en commentaire `universe-cli.ts:208`).
- `bin` exécutable câblé à 1b ; multi-opérateur (Chainstack RU 16 M à étalonner, décision 115) à son déclencheur.

## Registre
Paquet **`upcoming`** (aucun consommateur servi ; `PRODUCT-BOUNDARY.md` = liste d'export, pas un registre « built »). Débloqués : **GARDE-HELIUS-1b** (Bell : `universe-cli`, `collect`, `rebase-crosscheck` consomment `openGuardedClient` ; test full-scope actif) et **GARDE-HELIUS-2** (Ukemi, POOL-RPC-1a fusionnée). Course Bell toujours SUSPENDUE jusqu'à 1b.
