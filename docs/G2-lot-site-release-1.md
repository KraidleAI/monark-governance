# G2 SITE-RELEASE-1 A+B (relecteur Opus 4.8, contexte frais) — PASS

La revue G2 est complète et vérifiée sur le clone de l'arbre fusionné. Rendu intégral ci-dessous (identique au fichier `F:\tmp\g2-site\G2-lot-site-release-1.md`).

Modèle résolu : claude-opus-4-8[1m]

# G2 — lot SITE-RELEASE-1 (sous-lots A /narabi + B /ukemi + index), sur l'ARBRE FUSIONNÉ

> Relecteur G2 (Opus 4.8, effort max), contexte frais, instance séparée. Données brutes pour l'orchestrateur (R-21) : chaque affirmation porte sa preuve rejouable. Aucun commit (R-20). Aucune variable d'environnement affichée (A-7) ; tout oracle sous `env -u` des 8 clés payantes. Aucune écriture dans `F:\Monark`, `F:\Monark-wt-*`, ni `F:\tmp\site-merge\tree`.

## 0. VERDICT
- **Sous-lot A (Narabi + favicon narabi) : PASS**
- **Sous-lot B (page /ukemi + favicon ukemi + assertion body) : PASS**
- **GLOBAL (arbre fusionné) : PASS**

Aucune correction bloquante ni non-bloquante : aucune modification du livrable n'est requise. Cinq **observations non-bloquantes** (transparence R-21, aucune action) au §11, et les items formés à déclencheur (nav /ukemi, design-set U-4b-2b, Caddy déploiement) au §10 — tous nommés, aucun dû nu.

## 1. Provenance et méthode
- **Modèle** : `claude-opus-4-8`, résolu tel quel `claude-opus-4-8[1m]` (R-1, préfixe conforme, effort max).
- **Date** : 2026-09-22.
- **Objet** : arbre fusionné `F:\tmp\site-merge\tree` @ **`60ecf64`** (= `de9ac07` lot/etude-suite + A + B, fusion sans conflit).
- **Clone** : `git clone --no-hardlinks F:\tmp\site-merge\tree F:\tmp\g2-site\tree` ; `git rev-parse HEAD` = `60ecf64049eae0f6c5ff29865278f478eeff8cc3` (identique à la source).
- **node_modules** : `mk-nm.ps1` — `entries: 220  monark: 10  fail: 0` ; `require.resolve('@monark/rpc-guard')` = `F:\tmp\g2-site\tree\packages\rpc-guard\src\index.ts` (le clone, pas `F:\Monark`).
- **Build (ruling D-1)** : `npm run build -w @monark/site -- --webpack` = **exit 0** (14 routes prérendues, dont `/narabi`, `/ukemi`, `/icon.svg`), rejoué **deux fois** (build initial + rebuild propre après le mutant CM3), les deux exit 0. **Déviation de méthode DÉCLARÉE (non-dette)** : avant le build j'ai copié `apps/site/.next/cache` (95 M) depuis la source lue-seule `F:\tmp\site-merge\tree` vers le clone, pour que `next/font/google` réutilise le cache chaud sans réseau (le clone n'a pas de cache ; sans lui `next/font` tenterait un fetch — c'est le mécanisme que le G1-B a mesuré). Contrôle : le log de build ne porte **aucune** ligne `download|fetch|googleapis|gstatic|ENOTFOUND|network`. Le `cache/` est un accélérateur (police + webpack), il ne change pas la sortie ; l'artefact `.next/server/app/*.html` est régénéré frais.
- **Tree pristine à la clôture** : `git status --porcelain` = 0 ligne avant ET après tous les mutants (A, B, CM1-CM5).
- **Rendu** : ce fichier `F:\tmp\g2-site\G2-lot-site-release-1.md` et la réponse de l'agent sont **identiques** (rendu intégral demandé aux deux endroits).

## 2. Item 1 — Oracle complet + invariants gelés (REFAITS sur le clone)
### 2.1 Oracle (tout sous `env -u` des 8 clés ; exit capté directement)
| Oracle | Commande | Exit | Résultat mesuré | Attendu orchestrateur |
|---|---|---:|---|---|
| CI | `npm run ci` | **0** | **tests 830 · pass 829 · fail 0 · cancelled 0 · skipped 1** | 830/829/0/1 ✅ |
| lint | `npm run lint` | **0** | `eslint .` 0 | 0 ✅ |
| lint:ratchet | `npm run lint:ratchet` | **0** | **69/69** (plafond inchangé) | 69/69 ✅ |
| lang:gate | `npm run lang:gate` | **0** | 0 hit non-exempt, scope inclut `site` | 0 ✅ |
| export:check | `npm run export:check` | **0** | 0 forbidden path, 0 French hit | 0 ✅ |
| build (webpack) | `npm run build -w @monark/site -- --webpack` | **0** | 14 routes ; artefact frais | 0 ✅ |
| assert-fleet-html | `node scripts/assert-fleet-html.mjs` | **0** | `/fleet` header + **4** notes servies (33324 chars) ; `/ukemi` `<main>` **digit-free (0 token)**, état+clause présents, **0** interval/cascade/Bell/Aave (4433 corpus chars) | 0, /fleet 4 notes, /ukemi 0 token ✅ |

- **Le 1 skip** = `fetch_only_inside_client` (log l.890, `﹣ … # until 1b: apps/bell/src paid fetch …`) — **pré-existant**, hors périmètre site (migration `apps/bell` → `@monark/rpc-guard`). Aucun skip introduit par le lot.
- `gate:vocab` (inclus dans `ci`) vert (les tests `skill_vocab_is_non_vacuous`, etc. passent).

### 2.2 Périmètre EXACT — `git diff --name-status de9ac07 HEAD` = 13 fichiers, rien d'autre
```
M apps/site/app/narabi/page.tsx           A apps/site/app/ukemi/page.tsx
M apps/site/components/narabi/narabi-live.tsx  A apps/site/components/ukemi/ukemi-page.tsx
M apps/site/lib/narabi-copy.ts            A apps/site/lib/ukemi-copy.ts
M apps/site/lib/narabi-live.ts            A apps/site/public/icons/ukemi.svg
A apps/site/public/icons/narabi.svg       M scripts/assert-fleet-html.d.mts
M test/narabi-live.test.ts                M scripts/assert-fleet-html.mjs
                                          A test/site-ukemi.test.ts
```
A = 6 fichiers, B = 7 fichiers. **Tous** sous `apps/site/**`, `scripts/assert-fleet-html.*`, ou `test/*.test.ts`. Aucun autre chemin. Concorde avec G0 §19 (disjointness A∩B=∅, fusion sans conflit).
- *Précision (imprécision de la mission, sans impact)* : le glob « `test/site-*.test.ts` » de la mission omet `test/narabi-live.test.ts` (également touché en A, déclaré G0 §19). Le `--name-status` fait foi ; les deux fichiers `test/` sont dans le répertoire DORMANT exclu de l'export (M-16).

### 2.3 Invariants gelés byte-identiques à `de9ac07`
- **Zones gelées** : `git diff --quiet de9ac07 HEAD -- apps/sentinel packages apps/harness/src/tools/gate.ts scripts/census scripts/record-u4b-calib.mjs` = **exit 0** (byte-identique ; `--stat` re-confirmé vide). Cela couvre `gate.ts` + **tout** `apps/sentinel/**` + **tout** `packages/**` ET l'intégralité du jeu gelé U-4b (qui vit dans ces zones) — preuve plus forte qu'un compte de fichiers.
- **Digests D4 recomputés** (convention D4/AM-1 `git show HEAD:<f> | tr -d '\r' | sha256sum`), 7 fichiers du gel, tous concordants :

| Fichier gelé | Digest recomputé (12) | Réf. ADR-U4b |
|---|---|---|
| `scripts/census/u4b/u4b-scores.mjs` | `2f9a31f614df` | **APRÈS re-gel décision 126** (`2f9a31f6…`, D4 ligne montre l'AVANT `9ad20666…` superseded) |
| `scripts/census/u4b/u4b-reduce.mjs` | `a5e66cd38727` | `a5e66cd3…` ✅ |
| `scripts/record-u4b-calib.mjs` | `5733daeb7c8e` | `5733daeb…` ✅ |
| `apps/sentinel/src/ukemi/wadray.ts` | `7bee76fc96a9` | `7bee76fc…` ✅ |
| `apps/sentinel/src/ukemi/abi.ts` | `3376eb084f52` | `3376eb08…` ✅ |
| `packages/hikae/src/l1-split.ts` | `9206df9189d3` | `9206df91…` ✅ |
| `apps/sentinel/src/rpc.ts` | `0e232519a18a` | `0e232519…` ✅ |

- *Note sur « 9 sha »* : la mission cite « 9 sha gelés U-4b ». Le **prereg -1b n'est PAS committé** (`docs/PLAN-u4b-prereg.md` absent, CANDIDAT seul) — la liste figée des 9 n'existe pas encore comme artefact. Le jeu D4 de l'ADR = 3 cœur + 4 transitifs (C-V-2) = **7 avec digests épinglés**, tous vérifiés ; les éventuels `contracts_frozen` additionnels (ex. `packages/contracts/src/types.ts`, digest `604fa139…`) vivent dans les zones diffées vides. Le lot **ne touche aucun** d'eux.

### 2.4 Fidélité de la fusion (les octets livrés ont bien migré)
- `sha256sum -c` du `DELIVERED.sha256` de B (7 fichiers) = **7× OK** ; du `DELIVERED.sha256` du pli A (3 fichiers) = **3× OK**.
- Les 3 fichiers cœur A (hors manifest du pli) : préfixes byte-identiques au RENDU-PLI §10 — `narabi-live.ts 8e126194`, `narabi-live.tsx eadd8080`, `narabi-copy.ts 8effd627`.

## 3. Item 2 — Registre public / phrases servies (CA-11, Branchement)
- **Narabi** : statut du registre gelé `FLEET_AGENTS[Narabi].status = "built"` (lu, non codé). Pilule évaluée sur le VRAI snapshot committé + le VRAI registre :
  - t=1 : `"built · step 1 of 7 before first reading"` — N=`tracker.t`=1 (lu), « 7 »=`SERIES_MIN_STEPS` ✅ (C-3/C-5).
  - t=6 : `"built · step 6 of 7 before first reading"` ✅.
  - t=7 : `"built · 2 windows published"` (bascule à `SERIES_MIN_STEPS`, N=`lines.length`=2) ✅ (Q-4).
  - Jamais « shipped », jamais « day N » (Q-8b, M-15). Client component ⇒ la pilule est **absente du HTML bâti** (`narabi.html` = coquille) : résiduel **C-7 NOMMÉ**, plancher = fonction pure testée sur octets réels (§5) + porteur `{firstReadingLabel(` présent (count 1) + parcours visuel investisseur.
- **Ukemi** : la pilule rend `{status}` = **`"built"`** lu du registre (`ukemi-page.tsx:51,60`) — **PAS** « step N of 7 » (voir §11 OBS-4 : la mission conflate la pilule Ukemi avec celle de Narabi).
- **Phrases RÉELLEMENT servies (lecture des `.html` bâtis, pas des sources)** :
  - `/ukemi <main>` (corpus 4561 chars) : **0 jeton numérique** (scan indépendant, exclusions ISO+ID) — confirme `assertUkemiBody`. **interval 0, cascade 0, Bell 0, Aave 0, verified 0, shipped 0.** `LIQ_EMPTY_REGISTRY_SENTENCE` présente byte-identique, clause « which the gate does not check » présente, pilule « built » présente.
  - `/narabi <body>` (corpus 10058 chars) : **0** mot interdit (interval/cascade/Bell/Aave/verified/probability/shipped). Les 311 tokens numériques sont la charge d'hydratation RSC (données réelles du snapshot), pas de la prose rendue ; `/narabi` n'est pas tenu digit-free (seul `/ukemi <main>` l'est).
  - **Scanner canonique** (pas seulement mon regex) : `node scripts/grep-forbidden.mjs apps/site/.next/server/app/{ukemi,narabi}.html` = `gate:vocab OK — scanned 217 file(s), no forbidden claim`, **exit 0** (le CLI ajoute les cibles au walk par défaut, d'où 217).
- **Constantes `LIQ_*`** : les **4** de `ukemi-copy.ts` **byte-identiques** à `gate.ts` (import dynamique des deux modules : longueurs 169/149/160/110 égales ; `ALL 4 BYTE-IDENTICAL: true`). `LIQ_REQUIREMENTS_SENTENCE` (chiffres) **non exportée** par `ukemi-copy.ts`, présente dans `gate.ts` — jeu fermé de 4 (C-2) respecté.
- **C-6** : `ukemi-page.tsx` lit **`ukemiAgent.status` seul** (l.51), **jette** si Ukemi absent (l.46-50, message explicite, aucun fallback silencieux) ; **aucun** accès `.line`/`.wiring` (grep = 0).

## 4. Item 3 — Icônes (ruling D-2)
- `metadata.icons` → `/icons/narabi.svg` (`narabi/page.tsx:16`) et `/icons/ukemi.svg` (`ukemi/page.tsx:17`) — chemins publics statiques, jamais sous `/route/`.
- Octets byte-identiques aux SVG v4 : `public/icons/narabi.svg` = `aa2f3006…` = `v4/assets/favicon-narabi.svg` ; `public/icons/ukemi.svg` = `90eea553…` = `v4/assets/favicon-ukemi.svg` (**MATCH** les deux).
- Head bâti : `/narabi` et `/ukemi` → exactement `<link rel="icon" href="/icons/<x>.svg" type="image/svg+xml"/>` (**rel=icon ×1, href=/icons/<x>.svg ×1**) ; `href="/<x>/icon…"` = **×0** (aucun shadow Caddy `handle_path`).
- Icônes de route supprimés : `app/narabi/icon.svg` et `app/ukemi/icon.svg` **absents** (D-2 appliqué).

## 5. Item 4 — Mutants (rejeu A 7/7 + B 14/14 + 5 cross-sous-lot à moi, ≥4 exigés)
- **Harnais A** (`node F:/tmp/siteA/mutants.mjs F:/tmp/g2-site/tree`) : **7/7 ROUGES**, restauration byte-exacte, sweep global sha == baseline, **exit 0**. (M1 N tapé, M2 « of 7 » à T=7, M3 doublon SERIES_MIN_STEPS, M4 « shipped », M5 favicon distant, M6 glossaire chiffré, M7 favicon sous /narabi/.)
- **Harnais B** (copié au scratchpad, `ROOT` repointé sur le clone) : baseline 5 tests GREEN ; **14/14 ROUGES** (exit≠0 ET fail≥1), restauration byte-exacte, **exit 0**. (M1..M11 incl. M4a-d interval sur CHAQUE constante servie, M5 accès line/wiring, M9 scan neutralisé, M11 icône sous /ukemi/.)
- **5 mutants à moi (≥4 exigés), CROSS-SOUS-LOT / niveau artefact servi** (chacun mute un fichier HORS du sous-lot testé, ou éprouve le tuyau g3-site sur l'artefact RÉEL ; restauration byte-exacte vérifiée par sha ; tree clean après) :
  1. **CM1** — `interval` injecté dans `gate.ts` `LIQ_CONDITIONAL_SENTENCE` (source de vérité) → `site_ukemi_copy_equals_served_liq_text` **ROUGE** (exit 1, fail 1). Prouve que l'égalité côté SITE lie le VRAI `gate.ts` (une dérive de la source de vérité rougit la copie).
  2. **CM2** — `fleet.ts` Ukemi `status: "built"` → `"upcoming"` (registre gelé partagé, alimente les DEUX pilules) → `fleet_register_built_set_is_frozen` **ROUGE**. Prouve que le gel du registre attrape un statut Ukemi trafiqué (les pilules ne suivent pas un registre flippé en silence).
  3. **CM4** — `honesty-lint.ts` `scanText` neutralisé (`return out;` avant la boucle) → `site_ukemi_body_scan_and_carrier` **ROUGE**. Prouve que le test corps de B lie le VRAI scanner honesty-lint (un scanner aveugle rougit la parité / le « carries a digit »).
  4. **CM3** (preuve d'exécution) — `fleet.ts` renomme `name: "Ukemi"` → `"Ukemi_X"` puis **rebuild** → build **échoue (exit 1)**. Attribution : `Error: fleet-presentation: no INSIDE block for 'ukemi_x'` au prérendu de `/fleet` — le registre gelé partagé est **porteur pour le build servi**, `/fleet` prérendu AVANT `/ukemi` ombre le throw C-6 propre à `/ukemi`. Le throw C-6 de `/ukemi` (« 'Ukemi' is absent from FLEET_AGENTS ») reste prouvé par la source (l.46-50) + le mutant B M5 ; l'isolation en full-build est empêchée par l'ordre de prérendu. `fleet.ts` restauré byte-exact, tree clean.
  5. **CM5** (tuyau g3-site sur l'artefact RÉEL, direction ÉCHEC — comble le point « oracle jamais rougi = déclaratif ») — `ukemi-copy.ts` `REGION_NOTE` (prose RENDUE, ancre `not a calibrated bound. How` → `… bound 185 of 189. How`) → **rebuild** `--webpack` (exit 0, le build ne scanne pas les chiffres) → `node scripts/assert-fleet-html.mjs` **ROUGE (exit 1)** : `assert-ukemi: 2 numeric token(s) rendered in the /ukemi <main> (expected 0, digit-free): ["185","189"]`. C'est la composition CA-11 (build → assertion) exercée dans la direction d'échec sur l'artefact SERVI, pas seulement sur la fixture `greenMain()`. Restauré (`git checkout`, sha == baseline) → rebuild propre exit 0 → assert **VERT** de nouveau. Les phrases attendues de `main()` (LIQ_EMPTY/conditionnelle) sont inchangées (REGION_NOTE n'en fait pas partie), donc le rouge est bien le scan numérique du corps rendu.
- *Item exemple « lien /narabi → /ukemi croisé si présent »* : **aucun lien** `href=/ukemi` dans `apps/site/**` (count 0) ⇒ pas de mutant croisé applicable ; c'est l'item formé du §10.

## 6. Item 5 — A-8 : le VRAI registre alimente le composant, pas un stub
- **Narabi** : `narabi_first_reading_label_reads_committed_t` alimente `firstReadingLabel` avec le **VRAI** `NARABI_SNAPSHOT` (octets `stateJson`/`timelineJsonl`, sha vérifiés contre le fichier publié `86c33c42…`/`4b17d0b8…`, `tracker.t=1`, 2 fenêtres) **et** le **VRAI** `FLEET_AGENTS[Narabi].status`. Aucun stub. `narabi_live_parses_real_state_shape` asserte la forme publiée réelle.
- **Ukemi** : le registre réel `FLEET_AGENTS` est consommé au **build** (l'artefact `ukemi.html` rend la pilule « built » réelle — confirmé par mon scan) ; `assertUkemiBody` asserte cet artefact RÉEL (tuyau non-LLM g3-site, D-3) ; le test unitaire compose `greenMain()` à partir des **vrais** exports `ukemi-copy.ts`. La lecture `status`-seul + throw est prouvée sur la source (C-6). Aucun stub de registre.

## 7. Item 6 — R-25 par sous-lot (pathspec VERBATIM `ci.yml:65`, base `7c34bef`)
- Base : `7c34bef` **est ancêtre** de `de9ac07` ET les 13 fichiers du lot sont **identiques** entre `7c34bef` et `de9ac07` (`git diff --quiet` vide) ⇒ le choix de base est indifférent.
- **Sous-lot A** : `6 files changed, 170 insertions(+), 1 deletion(-)` ⇒ **R-25(A) = 171** ≪ 1 150.
- **Sous-lot B** : `7 files changed, 820 insertions(+), 3 deletions(-)` ⇒ **R-25(B) = 823** < 1 150 (concorde exactement avec le G1-B).
- **Total site-lot (13 fichiers)** : `13 files changed, 990 insertions(+), 4 deletions(-)` ⇒ **994** (= 171 + 823).
- *Note* : la mission annonçait « A ≈ 6xx+42 » — coquille probable ; le mesuré **171** est cohérent avec le G1-A (135 cœur + pli). B « 823 » concorde. (Le `git diff … -- .` donnerait 1718/25 fichiers car il inclut les AUTRES lots fusionnés dans lot/etude-suite entre `7c34bef` et `de9ac07` — hors périmètre site ; le total site pertinent est 994 sur les 13 fichiers.)

## 8. Item 7 — Maquette v4 ↔ rendu (concordance de structure)
Structure concordante avec `NOTE-maquettes-v4.md` :
- **Narabi** : pilule (forme « … of 7 before first reading »), glossaire `under_calib` (le site l'AJOUTE au glossaire, C-11 ; générique, digit-free, testé), favicon adaptatif par page.
- **Ukemi** : hero + « what it is / is not » + « what is served » (**barre borne-haute schématique** `aria-hidden` sans graduation numérique, tick ŷ, « open floor » ; état honnête `LIQ_EMPTY_REGISTRY_SENTENCE`) + **clause conditionnelle** « which the gate does not check » RENDUE + méthode (4 étapes) + limites (3 cartes). La barre `[0, borne]` de la maquette (item 3) est rendue **sans les chiffres** de la maquette (Q-5a — le site est PLUS conservateur).
- **Écarts DÉCLARÉS (information investisseur, G0 §16.1 — pas des dettes)** : « shipped » → « built » (Q-8b) ; « day N » → « step N of 7 » (C-3) ; ordinaux/régions rendus **digit-free** (Q-5a/C-10). La clause conditionnelle, que la maquette v4 §3 laissait en question ouverte, est **portée** par le site (amélioration, byte-identique à `gate.ts`). Aucune divergence non déclarée.

## 9. Consigne standard G1 — points vérifiés sur pièces
A-1 modèle résolu ✔ ; A-2 node_modules mk-nm, rpc-guard résolu au clone ✔ ; A-3 exits captés directement, oracle complet ✔ ; A-6 invariants byte-identiques (gel U-4b, gate.ts, sentinel, packages) ✔ ; A-7 tout sous `env -u`, aucune variable affichée ✔ ; A-8 tuyau alimenté par le vrai registre/snapshot (§6) ✔ ; A-9 « interval » rejoué sur CHAQUE constante servie (B M4a-d) + CM1 sur la source ✔ ; D-1 chaque test imposé a son mutant nommé rouge (A 7, B 14) ✔ ; D-3 test d'intégration non-LLM par tuyau (g3-site sur artefact réel) ✔.

## 10. Items formés à déclencheur (P5 — zéro dette nue) — CONFIRMÉS nommés
- **Lien de navigation vers `/ukemi`** : absent (0 lien dans `apps/site/**`) ; route servie par URL, branchée par g3-site. Déclencheur : lot site de suivi (nav) ou U-4b-2b. (G1-B §8.)
- **Figures design-set + borne haute chiffrée** (`LIQ_UPPER_BOUND_SENTENCE`/`LIQ_H3_SENTENCE`, régions SAMPLE, α/nMin) : non rendues au temps 1 (digit-free). Déclencheur : **U-4b-2b** (record frais committé+manifesté).
- **Caddy à déployer sur g3-site** : le favicon est hors `/route/*` (chemin `/icons/`), donc aucune règle Caddy requise SI le catch-all `reverse_proxy localhost:3000` est le seul autre handler du site block ; réserve **[non lu]** du RENDU-PLI §7 sur le site block hors snippet. Étape de release, **hors lot** (le lot BUILDE et GATE, ne DÉPLOIE pas) ; vérification = curl orchestrateur / parcours investisseur avant mise en ligne.

## 11. Observations non-bloquantes (transparence R-21, aucune action)
- **OBS-1** — « probability » apparaît **4×** dans le `<main>` servi de `/ukemi`, TOUTES en **négation honnête** (« Never a probability of being right », « Never a probability », « Not a probability of liquidation… », « not a probability that a bound is right »). Ce n'est pas une revendication probatoire ; c'est le cadrage de la doctrine (identique à `gate.ts` « No probability » et à la maquette v4). **Preuve empirique (pas une lecture de liste)** : `gate:vocab` (dans `ci`, exit 0) et `grep-forbidden` (217 fichiers, 0 claim, exit 0) ont scanné `ukemi-copy.ts` / le `<main>` bâti QUI portent « probability » 4× et sont restés verts ⇒ le mot n'est démontrablement pas gaté, et `assertUkemiBody` ne le porte pas. Conforme.
- **OBS-2** — Résiduel **C-7** (pilule Narabi client-rendue, absente du HTML bâti) : plancher accepté (fonction pure vérifiée sur le snapshot réel + porteur présent + déclencheur parcours visuel). Nommé, pas une dette.
- **OBS-3** — Mon mutant CM3 rougit le build à `/fleet` (registre partagé porteur), pas au throw C-6 de `/ukemi` (ombré par l'ordre de prérendu). Le throw C-6 est prouvé par source + B M5. Sans impact.
- **OBS-4** — Imprécisions du texte de mission (aucun impact sur le livrable) : (a) item 1 glob `test/site-*.test.ts` omet `test/narabi-live.test.ts` (le `--name-status` fait foi) ; (b) item 2 « Ukemi affiché « built · step N of 7 » » — c'est la pilule **Narabi** (C-3) ; la pilule Ukemi dit « built » (status seul) ; « ruling Q-3 » cité concerne les favicons ; (c) item 6 « A ≈ 6xx » vs mesuré **171**.
- **OBS-5** — Réserve **[non lu]** Caddy (RENDU-PLI §7) : item formé déploiement (§10), pas une dette de code.

## 12. Reproductibilité (commandes clés, toutes sous `env -u` des 8 clés payantes)
```
git clone --no-hardlinks F:/tmp/site-merge/tree F:/tmp/g2-site/tree
powershell -NoProfile -File F:/tmp/g2-garde2bi/mk-nm.ps1 -Tree F:/tmp/g2-site/tree
cp -r F:/tmp/site-merge/tree/apps/site/.next/cache F:/tmp/g2-site/tree/apps/site/.next/cache   # accélérateur déclaré
env -u … npm run build -w @monark/site -- --webpack        # exit 0
env -u … node scripts/assert-fleet-html.mjs                 # exit 0
env -u … npm run ci                                         # 830/829/0/1, exit 0
env -u … npm run lint ; …lint:ratchet ; …lang:gate ; …export:check   # 0 / 69-69 / 0 / 0
git diff --name-status de9ac07 HEAD                         # 13 fichiers
git diff --quiet de9ac07 HEAD -- apps/sentinel packages apps/harness/src/tools/gate.ts scripts/census scripts/record-u4b-calib.mjs  # exit 0
node F:/tmp/siteA/mutants.mjs F:/tmp/g2-site/tree           # 7/7 RED, exit 0
node <scratchpad>/mutants-B.mjs                             # 14/14 RED, exit 0
node <scratchpad>/cross-mutants.mjs                         # CM1/CM2/CM4 RED, exit 0
# CM5 (g3-site oracle red on real artifact): inject 185/189 into REGION_NOTE -> rebuild -> assert exit 1 -> restore -> rebuild -> assert exit 0
env -u … node scripts/grep-forbidden.mjs apps/site/.next/server/app/{ukemi,narabi}.html   # 217 files, 0 claim, exit 0
git diff --shortstat 7c34bef HEAD -- <A files> <pathspec ci.yml:65>   # 171
git diff --shortstat 7c34bef HEAD -- <B files> <pathspec ci.yml:65>   # 823
```
Logs : `F:\tmp\g2-site\{build-webpack,build-clean2,assert-fleet,oracle-ci,oracle-lint,oracle-ratchet,oracle-lang,oracle-export,mutants-A,mutants-B,cm3-build,cm5-build,cm5-assert,cm5-rebuild,cm5-assert2}.log`. Harnais scratchpad : `mutants-B.mjs`, `cross-mutants.mjs`, `liq-eq.mjs`, `pill-and-scan.mjs`.

---
**Verdict G2 : sous-lot A PASS · sous-lot B PASS · GLOBAL PASS.** Sortie soumise à la vérification adversariale de l'orchestrateur (R-21) ; aucun commit ni workflow déclenché (R-20).

Fichiers pertinents (chemins absolus) : rapport `F:\tmp\g2-site\G2-lot-site-release-1.md` ; clone vérifié `F:\tmp\g2-site\tree` (@ `60ecf64`) ; logs sous `F:\tmp\g2-site\` ; harnais/scans sous `F:\tmp\claude\F--Monark\7a32969b-9ec3-45d5-8e36-f5466c58bb38\scratchpad\` (`mutants-B.mjs`, `cross-mutants.mjs`, `liq-eq.mjs`, `pill-and-scan.mjs`).
