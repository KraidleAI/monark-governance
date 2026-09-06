claude-opus-4-8[1m]

# G1 — Journal de provenance — Lot E-root (ADR-M004 D8, English only)

## GATE-0 (R-1) — contrôle de résolution
- **Modèle résolu (worker) :** `claude-opus-4-8[1m]` — préfixe attendu `claude-opus-4-8` vérifié.
- **Effort :** `max` (roster mainteneur 2026-08-14). **Opus 5 banni** : non utilisé.
- **Date :** 2026-09-06. **Worktree :** `F:\Monark-wt-eroot` (branche `lot-e-root`, HEAD = `main` = `b929464`).
- **Réviseur :** vérification adversariale par l'orchestrateur (R-21). **Aucun commit / push** (R-20).
- `npm ci` exécuté d'abord (exit 0, 0 vulnérabilités).

## 1. Périmètre et méthode
Traduction FR->EN de tout le texte humain de la **racine**. Références conservées à
l'identique (ADR-M00x Dn, R-xx, `§2`/`§3`, sha256 `357ef25`, globs, motifs regex, identifiants,
noms de jobs/scripts, `VIBEGATES_PR_LIMIT`, pathspecs). Noms de tests : préfixe `snake_case`
**byte-identique**, prose après le tiret cadratin traduite.

Méthode : édition **par span** (outil Edit) pour les fichiers portant des regex/backslashes
(`lint-ratchet.mjs`, `eslint.config.mjs`, `vocab-banned.json`) ; **reconstruction vérifiée**
(outil Write, lignes de code recopiées verbatim) pour les 3 fichiers de test denses, suivie
d'une preuve d'intégrité des littéraux de code (voir §5). Aucun `eslint-disable`, aucun
changement de sémantique. EOL = LF conservé partout (`git ls-files --eol` : `i/lf w/lf`
avant et après).

## 2. Fichiers modifiés (7, exactement — `git status --porcelain`)
```
 M README.md
 M eslint.config.mjs
 M scripts/lint-ratchet.mjs
 M test/ci-gates.test.ts
 M test/contracts-frozen.test.ts
 M test/fixtures-root.test.ts
 M vocab-banned.json
```
- `vocab-banned.json` : seuls `$comment` et la description `why` du scope `monark` traduits ;
  les **11 motifs `re` et toutes les clés sont byte-identiques** (extraits avant/après identiques, §5).
- `lint-ratchet.json` : **inchangé** (pas de prose ; `ceiling` 92 / `rules` 6 / `measured_on` intacts).

**Verify-only (déjà anglais / sans prose — inspectés, non modifiés) :**
`scripts/grep-forbidden.mjs` (0 accent, commentaires déjà EN), `enforcement/lint-model-pinning.sh`
(EN), `.github/workflows/ci.yml` (EN, D0.5), `tsconfig.json` (aucun commentaire). Zones interdites
(`packages/**`, `schemas/**`, `fixtures/**`, `docs/**` hors ce rapport, `package.json`) : `git status`
propre.

## 3. Oracles (rejouables)
| Oracle | Commande | Résultat |
|---|---|---|
| Tests | `npm run ci` | **83/83 pass**, 0 fail |
| Lint | `npm run lint` | **exit 0** (0 problème) |
| Gate vocab | `npm run gate:vocab` | OK — 37 fichiers scannés, 0 claim interdit |
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | **exit 0** |
| Cliquet | `npm run lint:ratchet` | **107/92 (RED)** — voir §4 (pré-existant, delta 0) |
| Accents | `LC_ALL=C.UTF-8 grep -rnE '[éèàùçêâîôû]' test scripts eslint.config.mjs vocab-banned.json README.md` | **1** ligne (résidu justifié, §6) |

## 4. FINDING — `lint:ratchet` 107/92 RED, **pré-existant**, hors Lot E-root (delta 0)
Sur HEAD **propre** (avant toute édition), `npm run lint:ratchet` mesure déjà **107/92 (exit 1)**.
Ce n'est **pas** un effet de ce lot :
- **Environnement conforme** : eslint 10.10.0, typescript-eslint 8.69.0, typescript 6.0.3, Node v24.15.0
  (versions épinglées) ; worktree propre ; compte **stable** (107 sur runs répétés).
- **Cause documentée dans le dépôt** : commit `b935b2b` — « Journal — Lot V clos et mergé ;
  **cliquet rouge 107/92 (tests Lot K) à corriger** ». `docs/G1-lot-V.md` l.329 et `docs/G2-lot-V.md`
  l.78 attestent `92/92 exit 0` au Lot V ; le passage à 107 vient des tests **Lot K** ajoutés ensuite
  (`git diff af1f95a..HEAD` sur les tests = uniquement `packages/hikae/**` + `packages/ukemi/**`).
- **Ventilation du compte** (6 règles réactivées sur les tests) : 107 = 25 (racine :
  `test/fixtures-root.test.ts` 16 + `test/ci-gates.test.ts` 9) + 82 (`packages/**`). L'excès 107-92=15
  est en `packages/**` (zone **interdite** à ce lot).
- **Inertie prouvée** : la traduction ne touche que commentaires/chaînes ; les règles `no-unsafe-*` /
  `no-explicit-any` portent sur des expressions de code. Mesure **après** traduction = **107** (delta 0).

**Traitement zéro-dette (P5, jamais un « dû » nu ni un contournement) :** le plafond `lint-ratchet.json`
**n'est pas** modifié (hors périmètre ; « clés inchangées »). Conséquence à escalader à
l'orchestrateur : **g4 est rouge pour cette PR indépendamment de ce lot** (bloquant au merge, pas au
lot). Deux voies de résolution documentées (décision orchestrateur/investisseur) :
  1. lot dédié typant les fixtures Lot K (`packages/hikae`, `packages/ukemi`) pour ramener le compte
     <= 92 (« Pendant formé » déjà inscrit dans `lint-ratchet.mjs` et l'ADR-M003 D9 ter §3) ; ou
  2. addendum ADR daté re-calibrant `ceiling` sur le compte mesuré (107), « toute baisse abaisse le
     plafond » conservé. Citation : `b935b2b`.

## 5. Intégrité (preuves)
- **Regex `vocab-banned.json`** : les 11 sources `re` et l'ordre/clés (`packages_src`, `atelier`,
  `monark` ; `monark.package="monark"`, `extensions=[.ts,.js,.mjs,.json,.md]` ; `banned` len 10)
  **identiques** avant/après (extraction `node -e` du tableau `re`).
- **Littéraux de code `ci-gates.test.ts`** présents exactement 1x après réécriture :
  `/^\s*continue-on-error\s*:/`, `/^\s*-?\s*uses:\s*(\S+)/`, `/^[0-9a-f]{40}$/`,
  `/VIBEGATES_PR_LIMIT\s*:\s*["']?([^"'\s#]+)["']?/g`, `:(exclude)packages/*/docs/S2-*`,
  `:(exclude)docs/G1-lot-*.md`, `:(exclude)docs/G2-lot-*.md`, `/^  g4-architecture\s*:/`,
  `/^\s*run:\s*npm run lint && npm run lint:ratchet\s*$/`, `new RegExp(entry.re, "i")`.
- **`git diff --stat`** : 135 insertions / 135 suppressions (1 ligne FR -> 1 ligne EN ; pas de dérive
  de comptage, pas de CRLF).

## 6. Résidus FR justifiés et inventaire non-ASCII
- **Unique résidu accentué** (oracle UTF-8 = 1) : `README.md:82` — nom propre cité du corpus
  **« Compliance et ingénierie logicielle et architecturale »** (titre d'un référentiel de gouvernance,
  aucun nom anglais officiel ; chemin réel `C:\Users\KACIMI\compiliance et ingénierie...`). Un titre
  cité ne se paraphrase pas. README = **1 seule ligne** changée par ailleurs (`vitrine` -> `storefront`,
  terme déjà employé par le README lui-même « the storefront for a fleet »).
- **Caveat de locale (mesuré) :** `LANG`/`LC_ALL` vides ici -> `grep` en mode **octet**. En mode octet,
  le jeu `[éèàùçêâîôû]` faux-positive sur les octets partagés : `§` (C2 **A7**, partage l'octet de `ç`)
  et `»` (déjà éliminé). **La mesure correcte est en locale UTF-8** (codepoint). Commande d'audit
  codepoint fournie ci-dessous ; l'orchestrateur peut la rejouer.
- **Inventaire non-ASCII restant (audit codepoint `node`)** — tous légitimes :
  `§` (U+00A7) x13 = références de section ADR (`D9 ter §3`, `§2`) conservées à l'identique ;
  `—` (U+2014) x48 = séparateurs de style maison (titres de test, commentaires) ; `·` (U+00B7) x2 =
  séparateurs de liste de versions (`eslint.config.mjs:22`) ; README (pré-existant, doc EN) : `ō`
  (Shōgen), `ŷ` (notation y-chapeau), `–` (G0–G7), `…`, `→`, `≥`. **Aucune** lettre accentuée FR hors
  le résidu README:82.
- Note console : `lint-ratchet.mjs` garde la forme ASCII **`D9 ter S3`** dans ses messages CI (choix
  d'origine de l'auteur pour la sortie console), tandis que les **commentaires** gardent `§3` — convention
  existante préservée.

```
# audit codepoint (rejouable)
node -e 'const fs=require("fs");for(const f of ["test/ci-gates.test.ts","test/contracts-frozen.test.ts","test/fixtures-root.test.ts","scripts/grep-forbidden.mjs","scripts/lint-ratchet.mjs","eslint.config.mjs","vocab-banned.json","README.md","tsconfig.json"]){fs.readFileSync(f,"utf8").split(/\n/).forEach((l,i)=>{for(const ch of l){const cp=ch.codePointAt(0);if(cp>127)console.log(`U+${cp.toString(16).toUpperCase().padStart(4,"0")} ${f}:${i+1}`)}})}'
```

## 7. R-25 (taille de lot)
Commande mission (`git add -N . && git diff --shortstat HEAD -- . ':(exclude)package-lock.json' && git reset`),
mesurée **sur la traduction** (avant ce rapport) :

| Mesure | Résultat | Borne |
|---|---|---|
| Mission (exclut `package-lock.json`) | **270** (7 fichiers, 135+ / 135-) | 1205 |
| Variante CI (exclut aussi `docs/G1-lot-*.md`, `docs/G2-lot-*.md`) | **270** | 1205 |

**270 <= 1205** : pas de scission requise. Le présent rapport `docs/G1-lot-E-root.md` est **exempté**
du décompte R-25 par le gate CI (`ci.yml` : `:(exclude)docs/G1-lot-*.md`, ADR-M003 D9 quater).

## 8. Mutants — test 38 (`ci_gates_blocking_no_continue_on_error`) reste discriminant
Mutation de `.github/workflows/ci.yml` (fichier **verify-only**, non modifié au final), test rejoué
en isolation (`node --test test/ci-gates.test.ts`), **restauration par copie de fichier** (jamais
`git checkout`). Backup hors worktree.

- **sha256 AVANT** = `4ff88b638a3cf2e96e143b081a7f6d3c0bd0dd82e98df968b18d3da0d279f2b6`
- **Mutant 1** — `&&` -> `||` dans le `run` de g4 : le test **rougit** sur l'assertion (7) traduite —
  `AssertionError: job g4 must literally contain \`run: npm run lint && npm run lint:ratchet\` (ADR-M003 D9 quater)` (1 pass / 1 fail). Restauré par copie.
- **Mutant 2** — retrait du pathspec `':(exclude)docs/G1-lot-*.md'` : le test **rougit** sur l'assertion
  (4bis) traduite — `AssertionError: pathspec :(exclude)docs/G1-lot-*.md missing from the R-25 count (ADR-M003 D9 quater)` (1 pass / 1 fail). Restauré par copie.
- **sha256 APRÈS** = `4ff88b638a3cf2e96e143b081a7f6d3c0bd0dd82e98df968b18d3da0d279f2b6` (**identique**) ;
  `git diff --quiet -- .github/workflows/ci.yml` = CLEAN (byte-identique à HEAD).

La sémantique des assertions est inchangée (seuls les messages humains sont traduits) : le test
conserve son pouvoir de détection.

## 9. Clôture
Zéro dette de ce lot : traduction complète, oracles verts (hors le cliquet **pré-existant** documenté
en §4 comme finding à escalader avec 2 voies de résolution — jamais un contournement). Verdict G7 et
consommation : orchestrateur (R-21).
