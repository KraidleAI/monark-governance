# G7 — lot CRA-B : items « sans regret » du règlement UE 2024/2847 (voie B, décisions 42-43) — VERDICT : ACCEPTÉ, FUSIONNÉ
Orchestrateur `claude-fable-5-1`, 2026-09-20. Livraison `849e2c9`, pli 2 `ef24c38`, revue delta `fe4c03d`, checkpoint-2 + plis C-V-1/C-V-4 `c6552eb` sur `lot/cra-b` (base `627113c`). Fusion `--no-ff` `9abf532` sur `lot/etude-suite` (conflit trivial fin de `JOURNAL-PROVENANCE.md`, deux lignes conservées).

## Chaîne de preuve
| Maillon | Artefact | Résultat |
|---|---|---|
| Checkpoint-1 | `docs/G0-lot-cra-b.md` + C-1..C-10 | approuvé-avec-corrections + escalade C-1 → décisions 42-43 |
| G1 worker Opus 4.8 max | `docs/PLI-lot-cra-b.md` | 383/383, 5 mutants + MG2, R-25 293 |
| G2 fraîche Opus 4.8 | `docs/G2-lot-cra-b.md` | APPROUVÉ-AVEC-CORRECTIONS (C-G2-1 Vercel faux, C-G2-2 `surfaces()` non gardé, C-G2-3 chemin Caddyfile) → pli 2 |
| G2 delta bornée | `docs/G2-delta-lot-cra-b-2.md` | CONFORME, MG2 rouge, R-25 297 ; item « miroir public ne peut ouvrir `deploy/` » |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-cra-b.md` | ACCEPTE-AVEC-CORRECTIONS C-V-1..C-V-6 (rejeu à froid 33/33, SBOM CycloneDX 1.5 / 183 composants, upload-artifact SHA recoupé `git ls-remote`, mutants M6/MG2/V1 rouges ; V3 « within scope » vert → C-V-5) |
| Plis orchestrateur | `c6552eb` | C-V-1 templates corpus conditionnels + ligne JOURNAL ; C-V-4 propriétaire + déclencheur filtre Caddy |
| G7 | ce fichier | oracle sur l'arbre fusionné : **396/396** (390 + 6), lint 0, ratchet 69/69, lang-gate 0, export:check 0 (`F:/tmp/g7-crab-ci.log`) |

## Ce que le lot livre
`SECURITY.md` (canal GitHub Security Advisories seul, 72 h / 90 j, versions = dernier tag, §Data : aucune donnée personnelle requise, journal d'accès Caddy JSON mesuré, hébergement VPS) ; `docs/PROCEDURE-notification-CRA.md` (horloges art. 14 conditionnelles, CSIRT indéterminé pour un fabricant USA sans représentant) ; SBOM CycloneDX déterministe (`--package-lock-only`) en CI + `scripts/sbom.mjs` ; `docs/PRODUCT-BOUNDARY.md` ; déclaration « no personal data required » README ; `docs/adr/ADR-CRA-B.md` (PVR `enabled:true` mesuré, origine SBOM privé vs public) ; 6 tests (`test/cra-b.test.ts`) + `SECURITY.md` dans `surfaces()`.

## Branchement (CA-11)
Aucun composant nouveau, `fleet.ts` inchangé. `SECURITY.md` ∈ `WHITELIST_FILES` → miroir public → onglet Security GitHub (servi) ; SBOM → artefact CI par run → release (déclencheur). Tuyaux déclarés ADR-CRA-B.

## R-25
297 sous la pathspec UNION (≤ 400 cible G0).

## error_origin
C-G2-1..3 : worker. C-V-1 (L-6 non fait) : orchestrateur. C-V-5 (« within scope » hors liste C-6) : validateur (checkpoint-1). C-V-2 (délais publiés sans ratification explicite) : orchestrateur (a lu le silence comme accord).

## Gate de publication et items formés
- **C-V-2 (ESCALADE-INVESTISSEUR, gate)** : ratification verbatim des 72 h / 90 j avant tout `export-public` d'un arbre contenant `SECURITY.md`. Ratifiée le 2026-09-20, décision 48 (verbatim « 72 h / 90 j ok ») — gate levée.
- **C-V-5** : `cra_surfaces_stay_conditional` n'attrape pas « within scope » ; déclencheur : prochain lot touchant `test/cra-b.test.ts` ou cartographie pré-release ; ancrer sur le sujet (éviter le faux positif PROCEDURE:14-15).
- **C-V-6** : le miroir public cite `deploy/Caddyfile.monark-*` et la preuve ADR-M012, non exportés ; déclencheur : première exportation / cartographie pré-release ; lié à C-V-2 (une seule gate de publication).
- **C-V-4** : filtre Caddy `format filter` — propriétaire orchestrateur, lecture J+30 (2026-10-18).
- ISO/IEC 29147:2018 : demande de procurement formée (non lu ; cité comme alignement, pas comme source).
