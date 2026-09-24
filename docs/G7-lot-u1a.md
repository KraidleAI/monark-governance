# G7 — lot U-1a (recorder book Aave v3, ADR-U1 / ADR-M020) — verdict de l'orchestrateur
Orchestrateur `claude-fable-5-1`, 2026-09-19. Gel du lot : **`736179c`** (base `58fe309`, branche `lot/u-1a`, worktree `F:\Monark-wt-p1b1`). Fusionné sur `lot/etude-suite` en **`5d9a6a0`** (puis T-1a en `7f93e6a`).

## Verdict : **CLOS — ACCEPTÉ**
Chaîne de vérification indépendante (instances séparées, contexte frais) :
1. Livraison worker `claude-opus-4-8` `1e7bb7e` → G2 fraîche Opus 4.8 sur `9f3af85` (APPROUVÉ-AVEC-CORRECTIONS C1/C2/C3, `docs/G2-lot-u1a.md`) → pliage orchestrateur `dedfcd5`.
2. **Checkpoint-2 validateur `claude-fable-5-1` sur `dedfcd5`** : ACCEPTE-AVEC-CORRECTIONS (`docs/CHECKPOINT2-lot-u1a.md`) — **V-1 bloquante** : le pliage C2 rendait le `description()` reverté unanime (fait GHO) inatteignable via `makeUkemiPool` ⇒ abstention du book ; test vert-à-vide ; **`error_origin = orchestrateur`** (pliage écrit et vérifié par la même instance). V-2 G1 périmé ; V-3 items §E.
3. Correctif V-1/V-2 par worker `claude-opus-4-8` (`docs/CORRECTIF-V1-lot-u1a.md`) : `RpcError` typé dès `defaultCall`, issues `ok`/`revert` dans `quorum2`, `ConcordantRevertError` tolérée `""` pour `description()` seule, forme canonique inchangée (PIN `034fbff9…`), oracle via `makeUkemiPool` (4 fournisseurs, cas a-d), amendement daté ADR-U1 D1/D3, G1 re-sha (`ukemi_sha c94bd79b…`). Vérifié par l'orchestrateur (16/16 rejoués, mutant C2 rouge, restauration bit-exacte) → gel **`736179c`**.
4. **G2 fraîche sur le delta `9f3af85→736179c`** par une autre instance Opus 4.8 (`docs/G2-delta-lot-u1a.md`, CA-9) : **APPROUVÉ** — 305/305, R-25 **1 098** (D9 sexies) / 1 141 (gate courante) < 1 205, tables de quorum (10 cas) et `isRpcRevert` (9 cas, archive-miss `-32000` = transport) mesurées, digest re-dérivé par canonicaliseur indépendant = PIN, M1-M3 rouges, 11/11 sha G1 exacts, CA-11 registres intacts (recorder `upcoming`).
5. Fusion : `lot/u-1a` → `lot/etude-suite` (`5d9a6a0`, conflit ADR-U1 hunks adjacents : ligne Q3 « D9 sexies » + amendement, les deux gardés) ; puis `lot/t-1a` (`7f93e6a`, `vocab-banned.json` additif : scope `sentinel` étendu + scope `bell`, +14 lignes, format préservé). **Oracle sur l'arbre fusionné : 326/326, tsc 0, lint 0, ratchet 69/69, gate:vocab 156 fichiers OK, lang-gate 0, export:check 0 (10 scopes).**

## Provenance / `error_origin`
- C1/C2/C3 (G2 sur `9f3af85`) : générateur.
- **V-1 : orchestrateur** (pliage C2 sans relecture séparée — 4ᵉ occurrence de la classe « générateur = relecteur » ; règle gravée CHANTIERS §F : tout pliage post-G2 touchant du code passe par un worker puis une G2 fraîche sur le delta).
- V-2 : orchestrateur (G1 non re-sha au pliage). V-3 : orchestrateur (items hors §E).
- Incident de fusion 2026-09-19 : le premier commit de fusion T-1a a été créé avec `vocab-banned.json` **en conflit** (script de résolution en échec silencieux) — détecté par contrôle des marqueurs, corrigé par amendement local avant tout oracle (`021c517` → `30d3a06` → `7f93e6a`, JSON validé, diff = bloc `bell` seul). `error_origin = orchestrateur` ; règle : **après toute résolution scriptée, compter les marqueurs `<<<<<<<` avant de committer**.

## Items formés (déclencheur), zéro dette nue
- **O1-O3 (G2 delta)** : trois mutants survivants sur le code V-1 neuf — M6 clause message de `isRpcRevert` non testée (`error_origin` générateur), M4 « un revert ne benche pas » non gardé, M5 clé `data` de `revertKey` non couverte ; tueurs prouvés par la G2 → à plier dans le lot **durcissement `record.ts`** (propriétaire orchestrateur, avant go U-6), avec G2 fraîche.
- O4 clé de revert par message (fragile, sens sûr) ; O5 résidu « 957/914 » dans la section G2 pliée du G1 (historiquement exact, à annoter au même lot) ; O6 nom `G2-delta-lot-u1a.md` hors glob R-25 (sur etude-suite, option b, sans effet) ; O7 piège `TEMP` backslash sous Node (forward slashes).
- Items décision 19 (CHANTIERS §E) : durcissement `record.ts` + wrapper live committé ; run sUSDe/USDe ; book plein deploy→B ; U-1c e-mode ; PR-U1-1 Perez paginé ; retrait exemption `cascade` (U-2) ; test O7 « deux URL même providerOf » (U-6) ; vérification live du critère `isRpcRevert` sur les 4 fournisseurs (durcissement `record.ts`).

## Branchement (ADR-M018, CA-11)
Le recorder est **`upcoming`** : consommateurs sur l'arbre = `ukemi.test.ts` et `record.ts` (CLI hors outil) ; aucun registre (`fleet.ts`, README, site, skills, deploy) touché ; le chemin servi arrive en U-6 (sentinelle-2) — l'ADR-U1 le déclare (tuyaux).
