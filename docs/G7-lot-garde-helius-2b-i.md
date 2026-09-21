# G7 — GARDE-HELIUS-2b-i (moitié PAQUET du lot 2b) — ACCEPTED, fusionné `8ba2cbc`

Orchestrateur Fable 5.1 (`claude-fable-5-1`), 2026-09-21 ~19:5x UTC (`date -u`). Branche `lot/garde-helius-2b` (tip `f4ecf14` code + docs `280f9c8`, G2-delta persistée) fusionnée `--no-ff` dans `lot/etude-suite`.

## 1. Oracle complet sur l'arbre FUSIONNÉ (règle ADR-C01 complément : `ci && lint && lint:ratchet`)
- `npm run ci` → exit 0 : `gate:vocab` OK (204 fichiers), typecheck 0, tests **759 / 758 pass / 0 fail / 1 skip** (`fetch_only_inside_client`, déclaré « until 1b »).
- `npm run lint` → exit 0 ; `npm run lint:ratchet` → exit 0 (69/69).
- Codes de retour capturés directement (logs `F:\tmp\garde2b-pli\g7-*.log`).
- R-25 (pathspec `ci.yml:65` verbatim, base `1a4fd55`) : **439** (404 ins + 35 del, 7 fichiers) ≤ 1 205.

## 2. Lignée du lot
| Étape | SHA / rapport | Résultat |
|---|---|---|
| Plan | `docs/G0-ADDENDUM-lot-garde-helius-2.md`, `docs/G0-COMPLEMENT-lot-garde-helius-2b.md` (D6), `docs/CHECKPOINT1-DELTA-lot-garde-helius-2b.md` (C-1..C-7 pliées `1a4fd55`) | APPROUVE-AVEC-CORRECTIONS |
| Découpe | ruling orchestrateur 17:40 UTC (CHANTIERS) : 2b-i paquet / 2b-ii migration, couture pré-déclarée | — |
| G1 | `798b4e9`, rendu persisté `docs/G1-lot-garde-helius-2b-i.md` | vérifs orchestrateur sha 9/9, lint 0, tsc 0, vocab 0 |
| G2 | `docs/G2-lot-garde-helius-2b-i.md` (worker `claude-opus-4-8`, arbre isolé) | PASS-AVEC-CORRECTIONS (C-G-1..5) |
| Checkpoint-2 | `docs/CHECKPOINT2-lot-garde-helius-2b-i.md` (validateur `claude-fable-5-1`, arbre isolé distinct) | ACCEPTE-AVEC-CORRECTIONS (C-R-1/C-R-2 bloquants, C-R-3/C-R-4) |
| Pli | `f4ecf14` (test-only + ADR ; `transport.ts`/`classify.ts` byte-identiques) | 8 corrections, 8 mutants cibles rouges |
| Clôture mécanique (prescrite par le validateur, rejouée par l'orchestrateur) | `FULL=1 node F:/tmp/cp2-garde2bi/probes/mutants.mjs V1_paid_is_chainstack_only` sur l'arbre isolé du validateur + pli ⇒ `RED=true`, `failing=[paid_helius_http_error_reprises_only_the_closed_hint]`, sources golden ; ADR : `grep -c garde2b`=0, ligne de tuyau 2b-i présente, `"0x"` ×4, `base64` ×4, `operatorOf` présent | C-R-1, C-R-2 CLOS sans nouvelle passe |
| G2-delta | `docs/G2-DELTA-lot-garde-helius-2b-i.md` (reprise du même relecteur, décision 116) | PASS |

## 3. Ce que le lot livre (paquet `@monark/rpc-guard`)
Vocabulaire d'erreur à source unique (`classify.ts` : `ERROR_HINT_TOKENS`, `isResultLimit`/`isPlanLimited`/`isRpcRevert`, `closedHint`) ; `RpcError` canonique `extends TransportError`, `.data` validée (hex, bornée 4096, abandonnée si elle contient l'hex d'une forme secrète de l'URL — C-1(c-bis)) ; **D6** : opérateur payant ⇒ indice d'erreur à vocabulaire FERMÉ, jamais de texte libre du corps (ferme C-GD-2 de 2a structurellement, prouvé pour chainstack ET helius) ; aucun indice sur `NonJsonBody` ; keyless : expurger PUIS tronquer, épinglé.

## 4. Branchement (règle investisseur 2026-09-19)
Le paquet reste **`upcoming`** : son consommateur servi (`record.ts`) est le sous-lot **2b-ii** (item formé, G0 `docs/G0-lot-garde-helius-2b-ii.md`, checkpoint-1 en cours). Tuyau déclaré dans l'ADR (ligne 2b-i de la table). `apps/**` n'importe pas encore `@monark/rpc-guard` (mesuré par le G2).

## 5. Items formés (propriétaire orchestrateur, déclencheur nommé)
- Résidus `.data` : hex d'une clé PARTIELLE, hex(base64(clé)), hex fractionné — passent la validation (classe C-GD-2 relocalisée ; borne 4096, jamais publié, journal local) ; déclarés à l'ADR ; déclencheur : première publication d'un journal `rpc_errors` (U-7).
- `data === "0x"` : ruling R-A du G0 2b-ii (jambe payante benchée) — porté par 2b-ii.
- C-G-1 / C-G-3 / C-R-3 : pliées ici ⇒ exigences d'entrée de 2b-ii SATISFAITES.
- V10 (mutant équivalent) déclaré par les deux relecteurs.
- Skip `fetch_only_inside_client` → GARDE-HELIUS-1b (inchangé).

## 6. `error_origin` (journal de provenance)
- C-R-1 (D6 prouvé pour un seul payant) : worker G1. C-R-2 (pointeur hors dépôt, tuyau sans ligne) : worker (a)(c)(d), orchestrateur (b). C-G-1/2/3 (couverture non épinglée) : worker. C-R-4 : partagé worker/validateur (supersession DEV-5 acceptée sans nommer la perte de pinning).
- Outillage (orchestrateur) : un `node_modules` jonctionné vers `F:\Monark` fait résoudre `@monark/*` vers l'arbre principal — corrigé par `mk-nm.ps1`/`rm-nm.ps1` (règle §9.8 du kit), sans effet sur ce lot (aucun consommateur dans `apps/`, mesuré).

## 7. Contrôle MAST résiduel
FM-3.2 (couverture incomplète) : soldé par le pli. FM-3.3 (vérification incorrecte) : mesure du G1 sur `node_modules` jonctionné — correcte par chance, remplacée par deux mesures isolées indépendantes. Autres modes : n/a.

Worktree `F:\Monark-wt-garde2b` : à retirer (`rm-nm.ps1` puis `git worktree remove`) — 2b-ii ouvre un worktree neuf depuis `lot/etude-suite`.
