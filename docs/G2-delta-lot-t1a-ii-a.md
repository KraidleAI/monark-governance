# G2 — Delta `83d016c→a52f67c` (pli post-G2 lot T-1a-ii-a, MONARK Bell)

- **Relecteur** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, R-1), effort max, instance séparée, contexte frais. NON générateur, NON premier relecteur. Aucun commit / aucun `git` d'écriture / aucun workflow (R-20). Vérification par rejeu ; toutes écritures sous `F:\tmp\g2d-t1aiia\`.
- **Méthode** : `git -C F:\Monark-wt-bell2a archive a52f67c` → `F:\tmp\g2d-t1aiia\tree\` ; `npm ci --cache F:/tmp/npm-cache` (TMP/TEMP=F:/tmp, exit 0, 0 vuln) ; oracle + mutants rejoués dans l'arbre frais. R-25 recomputée dans le worktree `F:\Monark-wt-bell2a` (`git diff`, index réel jamais touché).
- **Delta relu** : `83d016c` (gel G1 committé) → `a52f67c` (pli). Base de lot = `88c3324` (= merge-base(lot/etude-suite, a52f67c), vérifié).

## VERDICT : NON CONFORME — un (1) finding : **C-1 (R-25)**. Tout le reste (O-1/O-2/O-3/O-7 pliés, O-4/O-5/O-6 consignés, oracle 337/337, mutants, gates, bell_sha, fleet.ts) est **CONFORME et prouvé**.

C-1 n'est PAS un défaut du code plié (le code est correct et n'a besoin d'AUCUNE re-plie). C'est une **inexactitude de comptage R-25 + un conflit d'intégration prouvé** : sous le pathspec **courant** de `lot/etude-suite` (la ligne `STAT=` est en `ci.yml:55` sur lot/etude-suite HEAD `187ed86` — la mission dit « :52 », qui est la position côté lot `a52f67c` ; D9 septies l'a glissée en :55), la taille du lot est **1236 > 1205** (budget), PAS **1139**. Le 1139 du worker est le nombre **UNION post-fusion** (D9 septies + excludes série Bell), qui n'existe dans **aucune** des deux branches actuelles et exige la **résolution d'un conflit de merge sur `ci.yml`** (prouvé §9 constat 3 par `git merge-tree`).

**Actions C-1 (aucune ne retombe sur le code du pli)** : (a) à la fusion, l'**orchestrateur** résout le conflit `ci.yml` en UNION (ligne `STAT=` fournie copiable-collable §9) ⇒ gate = 1139 < 1205 ; (b) corriger le libellé PLI §5 (« ci.yml courant = 1236 > 1205 ; 1139 seulement post-UNION »). Item FORMÉ (déclencheur : gate R-25 à la fusion), jamais un dû nu — mais un G7/fusion ne peut clore tant qu'il n'est pas résolu.

**Crédit (pas de dissimulation)** : le worker a consigné en G1 §8 (ligne 12) une observation « pour l'orchestrateur » notant que le bloc commentaire `ci.yml:46-51` n'énumère pas encore la racine série Bell et qu'un lot touchant `ci.yml` est attendu à la fusion. La divergence est donc **tracée** ; C-1 ne l'accuse pas de l'avoir cachée. Ce que cette obs **ne dit pas** et que C-1 ajoute : (i) le nombre sous le pathspec courant est **1236 > 1205** (l'obs parle du commentaire, pas du nombre) ; (ii) c'est la ligne `STAT=` elle-même (pas seulement le commentaire) qui **entre en conflit** de merge (prouvé) ; (iii) la ligne UNION de résolution n'est pas nommée.

---

## §1 — Périmètre du delta (critère 1) : CONFORME

`git diff --name-status 83d016c a52f67c` = **exactement** les 6 fichiers attendus :

```
M  apps/bell/src/collect.ts
M  apps/bell/src/rpc.ts
M  apps/bell/test/bell.test.ts
M  apps/bell/test/collect.test.ts
M  docs/G1-lot-t1a-ii-a.md
A  docs/PLI-G2-lot-t1a-ii-a.md
```
Aucun fichier en trop ; aucune fixture touchée ; `apps/site/lib/fleet.ts` **hors delta**.

## §2 — O-1 (C-1a) publicnode retiré : CONFORME

- `rpc.ts:17-19` : `PUBLIC_SOLANA` = `["https://api.mainnet-beta.solana.com"]` **seul** (publicnode retiré) ; commentaire réécrit (« mainnet-beta is the SOLE default … no_quorum, fail-closed »).
- `collect.test.ts` (`bell_no_quorum_on_single_provider`) épingle le **DÉFAUT** :
  - `const def = solanaEndpoints({}); assert.deepEqual([...def], ["https://api.mainnet-beta.solana.com"]);`
  - `assert.equal(providerOf(def[0]!), "solana.com");`
  - `assert.equal(new Set(def.map(providerOf)).size, 1, ...);`
  - `await assert.rejects(quorum2("default", def, ok, fetchOne, keyOf), NoQuorumError, ...)` ⇒ défaut = 1 fournisseur ⇒ `NoQuorumError`.
- **Mutant O-1 (publicnode ré-ajouté)** → `bell_no_quorum_on_single_provider` **RED** (AssertionError deep-equal : `solanaEndpoints({})` renvoie 2 entrées). Restauration byte-exacte : rpc.ts LF-sha `3e372df0955e` avant = après (= PLI §2).

## §3 — O-2 (CA-11a) `assertOutsideRepo` : CONFORME

- `collect.ts:307` : fonction **pure exportée** `assertOutsideRepo(out, repoRoot)` (`resolve`+`toLowerCase`+`relative`+`isAbsolute` ; casse-drive robuste, fail-closed sur collision posix casse-sensible — direction sûre pour une garde CA-11).
- `collect.ts:319` (`main()`) l'**appelle** : `assertOutsideRepo(out, repoRoot);` (remplace l'ancien `startsWith` troué).
- Import `relative, isAbsolute` ajouté (collect.ts:14).
- `collect.test.ts` (`bell_out_guard_is_outside_the_repo`, nouveau) : sous-racine casse égale/haute/séparateurs mixtes + racine ⇒ throw ; frère hors-arbre ⇒ ok ; **preuve de câblage** `assert.match(collect.ts, /assertOutsideRepo\(out, repoRoot\)/)`.
- **Mutant 9a** (garde → `if (false)`) → **RED** (`throws /CA-11/` échoue). **Mutant 9b** (appel retiré de `main()`) → **RED** (`match /assertOutsideRepo\(out, repoRoot\)/` échoue). Restauration byte-exacte : collect.ts LF-sha `cfec4363d596` avant = après les 2 mutants (= PLI §2).
- **Cas win32 mesuré rejoué (je suis sur win32)** — probe direct de la fonction :
  - `assertOutsideRepo("f:/…/test/out-hole", "F:/…/test")` (drive minuscule) ⇒ **THROWS** ✓ (le trou mesuré est fermé).
  - `assertOutsideRepo("F:/tmp/bell-out", "F:/…/test")` (chemin de la mission) ⇒ **no throw** ✓.
  - `assertOutsideRepo(ROOT.toUpperCase()+"/out-hole", ROOT)` ⇒ **THROWS** ✓.
  Le test `bell_out_guard_is_outside_the_repo` passe en baseline sur win32 (branche `process.platform === "win32"` exécutée).

## §4 — O-3 (C-10a) `ethereum.ts` dans `bell_no_secret_in_repo` : CONFORME

`bell.test.ts:153` : la liste `bell_no_secret_in_repo` inclut désormais `"ethereum.ts"` (13 entrées, 6 nouveaux src). Oracle vert. G1 §1 corrigé « 5 → 6 src ».

## §5 — O-7 (R-3) `providerOf` importé : CONFORME

- `collect.ts:27` : `import { providerOf } from "../../sentinel/src/rpc.ts";`
- `collect.ts:333` : `const providerDomains = [...new Set(solProviders.map(providerOf))];` (utilise l'import).
- `grep 'new URL(u).hostname | hostname.split' collect.ts` = **0** (aucune réimplémentation inline résiduelle).

## §6 — O-4/O-5/O-6 consignés en G1 §8 avec déclencheur (critère 6) : CONFORME

Diff `docs/G1-lot-t1a-ii-a.md` §8 ajoute :
- **O-5** (différés `-b`, nommés pour traçabilité) : C-4 (multiplicateur constant jul-oct 2025, lu « 1 », **non vérifié**), C-11 (bornes par pool), C-12 (census/MWCB/Ondo). *Déclencheur* : run fondateur `-b` après G7 de `-a`.
- **O-6** (C-1b, AVANT `-b`, non implémenté ici) : divergence corps-niveau visible + extraire la boucle sampling en fonction pure testable. *Déclencheur* : avant `-b`.
- **O-4** : ancre « racine série Bell non vide » dans `series_pinned`. *Déclencheur* : prochain lot touchant `test/ci-gates.test.ts`.

Tous portent un déclencheur — items formés, pas de dûs nus.

## §7 — bell_sha + fleet.ts (critère 7) : CONFORME

- `PINNED_BELL_SHA = "4375042c518253e2232f0390dfcd792db4d65ca55e9832900bc19862fab6fa46"` — **identique** à 83d016c (ligne 49) et a52f67c (ligne 50, décalée +1 par les imports ajoutés). Aucune fixture dans le delta ⇒ bell_sha inchangé ; `bell_collector_replays_fixture_bit_identical` **vert** (l'assert `a.bellSha === PINNED_BELL_SHA` tient).
- `apps/site/lib/fleet.ts` blob **identique** aux 3 refs : `f770e191ba9378aa3ac6be31a026579300c4c230` (88c3324 = 83d016c = a52f67c) ⇒ Bell reste `upcoming`.

## §8 — Oracle + gates (critère 8) : CONFORME

Rejeu dans l'arbre frais `archive a52f67c` + `npm ci` :

| Gate | Résultat mesuré |
|---|---|
| `npm run ci` (gate:vocab + tsc + test) | **tests 337 / pass 337 / fail 0**, 38 627 ms ✓ |
| `npm run lint` (eslint .) | propre (0 sortie) ✓ |
| `npm run lint:ratchet` | **69/69** ✓ |
| `node scripts/lang-gate.mjs --scope root,contracts,schemas,site` | **0 hit** (site GATED) ✓ |
| `npm run export:check` | OK, 0 chemin interdit ✓ |
| `no_secret_in_repo` (walk racine) | vert (221 ms) ✓ |
| Tests Bell ciblés (win32) | `bell_no_secret_in_repo`, `bell_collector_replays_fixture_bit_identical`, `bell_no_quorum_on_single_provider`, `bell_eth_v3_swap_decode_and_vwap`, `bell_out_guard_is_outside_the_repo` = 5/5 pass ✓ |

## §9 — R-25 (critère 9) : **C-1 — NON CONFORME**

Formule ci.yml (mesurée) : `CHANGED = insertions + deletions` (awk). Budget `VIBEGATES_PR_LIMIT = 1205` (ADR-M003 D9). Recompte sur `88c3324...a52f67c` (`git diff`, index réel intact) :

| # | Pathspec | Fichiers | ins | del | CHANGED | Verdict |
|---|---|---|---|---|---|---|
| **(A)** | **`lot/etude-suite` ci.yml:52 courant (D9 septies, SANS excludes Bell) — PRESCRIT** | 16 | 1219 | 17 | **1236** | **> 1205 ⇒ ÉCHOUE** |
| (B) | ci.yml propre du lot `a52f67c` (excludes Bell, SANS D9 septies) | 15 | 1173 | 17 | 1190 | ≤ 1205 |
| (C) | UNION post-fusion (D9 septies + excludes Bell) = **nombre du worker** | 14 | 1122 | 17 | **1139** | ≤ 1205 |

Écart (A)−(C) = **97** = fixtures série Bell (`tslax-mint-token2022.json` 89 + `tslax-weekend-fills.jsonl` 8) : **NON exclues** par le pathspec `lot/etude-suite` (dont les excludes fixtures sont `fixtures/**` racine et `apps/sentinel/test/fixtures/**` — ni l'un ni l'autre ne matche `apps/bell/test/fixtures/series/`). Vérifié : le `--stat` (A) liste ces 2 fichiers ; le `--stat` (C) ne les liste pas.

**Constats :**
1. Le worker annonce « R-25 (ci.yml:52, séries exclues) = **1139** ≤ 1205 ✓ ». Ce 1139 est le pathspec **UNION** — il **ne reproduit PAS** sous le `ci.yml:52` courant de `lot/etude-suite` (qui donne **1236 > 1205**). Recompte indépendant, `git diff` faisant foi.
2. **Attribution au pli** : gel G1 (`88c3324...83d016c`) sous pathspec `lot/etude-suite` = 1177+14 = **1191** (≤ 1205). Le pli ajoute +45 (code) ⇒ **1236** (> 1205). Sous ce pathspec, c'est le PLI qui franchit le budget — parce que les 97 lignes de données série Bell y restent comptées.
3. **Conflit de merge PROUVÉ (read-only)** : `git -C F:\Monark-wt-bell2a merge-tree 88c3324 187ed86 a52f67c` (forme legacy 3-args, git 2.55.0 ; écrit RIEN — pas de `--write-tree`) produit un conflit sur `ci.yml` avec marqueurs explicites :
```
<<<<<<< .our            (187ed86 = lot/etude-suite)
   # Exclusions (... D9 septies — ... docs/**/*.md ...)
   STAT=$(git diff ... ':(exclude,glob)docs/**/*.md' ... [PAS d'excludes série Bell]) || {
=======
   # Exclusions (... D9 sexies ...)   [PAS de D9 septies]
   STAT=$(git diff ... ':(exclude,glob)apps/bell/test/fixtures/series/**/*.{json,jsonl,csv}' [3 pathspecs Bell, PAS docs/**/*.md]) || {
>>>>>>> .their          (a52f67c = lot)
```
   ⇒ la ligne `STAT=` elle-même entre en conflit (les deux côtés éditent la même ligne d'origine `88c3324`). Fusionner le lot **exige** une résolution manuelle. (Correctif de ma propre preuve : la comparaison « ligne 52 » initiale était invalide — sur lot/etude-suite la ligne 52 est un commentaire, le `STAT=` a glissé en :55 après D9 septies ; `merge-tree` fait foi, pas le n° de ligne.)
4. Vérifié que le commit externe de l'orchestrateur pendant ma revue (`7fbce25→187ed86`, lots e-honnetete/Nexus/CRA) **n'a PAS touché `ci.yml`** ⇒ mon pathspec (A) est bien celui de HEAD courant (187ed86).
5. **Citation croisée du worker vérifiée NON fantôme** : PLI §5 renvoie à « G1 §8 obs. ci.yml » ; cette observation existe bien (`docs/G1-lot-t1a-ii-a.md` §8 ligne 12, à a52f67c) — elle note la divergence du bloc commentaire et la fusion attendue. Pas de citation fantôme (contraste avec le §8 fantôme du 1er G2, commit 23551ca). Elle ne couvre toutefois ni le 1236>1205, ni le conflit de la ligne `STAT=`, ni la ligne UNION (cf. bloc verdict).

**Nature (Dettes/P5)** : item FORMÉ. *Déclencheur* : gate R-25 à la fusion. *Résolution copiable-collable* — résoudre le conflit `ci.yml` en gardant la ligne `STAT=` UNION suivante (D9 septies + excludes série Bell ; c'est exactement le pathspec du scénario (C) mesuré à **1139**) :
```
STAT=$(git diff --shortstat "origin/${{ github.base_ref }}...HEAD" -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)docs/G1-lot-*.md' ':(exclude)docs/G2-lot-*.md' ':(exclude,glob)docs/**/*.md' ':(exclude)package-lock.json' ':(exclude,glob)fixtures/**/*.json' ':(exclude,glob)fixtures/**/*.jsonl' ':(exclude,glob)fixtures/**/*.csv' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.json' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.jsonl' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.csv' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.json' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.jsonl' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.csv') || {
```
(garder aussi le commentaire `.our` = celui qui mentionne D9 septies.) Corriger aussi le libellé PLI §5 : « ci.yml courant = 1236 (>1205) ; 1139 seulement post-UNION ». Substantivement, la taille de **code revusable** (données sha-épinglées exclues) = 1139 < 1205 : l'exclusion des séries est légitime (C-14, approuvée au 1er G2), mais elle n'est pas encore dans le gate de fusion.

## §10 — Preuve « aucune écriture dans F:\Monark* » (R-20)

- `F:\Monark-wt-bell2a` : `git status --short` **vide**, HEAD `a52f67c` (inchangé). Delta du lot intact.
- `F:\Monark` : `git status --short` **vide** ; HEAD a avancé `7fbce25 → 187ed86` — **commit EXTERNE de l'orchestrateur** (G7-lot-e-honnetete, merges Nexus/CRA ; R-20 licite, seul l'orchestrateur committe). **Non imputable au relecteur** : aucun `git` d'écriture émis, aucune écriture fichier vers `F:\Monark*` ; toutes mes écritures sous `F:\tmp\g2d-t1aiia\` (`a52f67c.tar`, `tree/`, `*.bak`, ce rapport). `ci.yml` non touché par ce commit.
- Toutes restaurations de mutants vérifiées byte-exactes (LF-sha rpc.ts `3e372df0955e`, collect.ts `cfec4363d596` = PLI §2, avant = après).
- **Table sha PLI §2 recomputée indépendamment (méthode `tr -d '\r' | sha256sum | cut -c1-12`) — les 4 concordent** : `rpc.ts` `3e372df0955e` ✓ ; `collect.ts` `cfec4363d596` ✓ ; `bell.test.ts` `ebd61c7905e5` ✓ ; `collect.test.ts` `93a4df59bfe8` ✓.
