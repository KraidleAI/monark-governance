# MESURES — U-4b-1b prereg (brouillon) — worker `claude-opus-4-8[1m]`, 2026-09-21

Toutes les commandes en lecture seule sur `F:\Monark` (aucune écriture dépôt, aucun réseau, aucun commit). Régime B : sha depuis **blobs HEAD** (`git show HEAD:<path>`), jamais `git status` (AM-1).

**Mouvement de HEAD pendant le tour (régime B en action)** : la 1ʳᵉ passe de mesure a lu HEAD `430e99d3f36da246c52b693d9f5e5154a41f8a25` ; la 2ᵉ passe (consolidée ci-dessous) a lu HEAD `4ee3285e869bedf580fd29acaf00f134f884f37c`. Le commit intercalé est `4ee3285` (« G0 LANG-GATE-CI »), qui ne touche que `docs/G0-lot-lang-gate-ci.md`. **Les 7 sha gelés sont byte-identiques aux deux HEAD.**

---

## 0. Commit concurrent (preuve que les fichiers gelés ne sont pas touchés)

```
$ git -C F:/Monark log -1 --format='%h %s' 4ee3285
4ee3285 G0 LANG-GATE-CI (small-lot regime, decision 116): lang:gate step in job r25 before export:check, test ci_runs_lang_gate mirroring ci_runs_export_check post-C-1; must merge before GARDE-HELIUS-2b-ii (shared ci.yml)

$ git -C F:/Monark diff --name-only 430e99d 4ee3285
docs/G0-lot-lang-gate-ci.md

$ git -C F:/Monark diff --name-only 430e99d 4ee3285 | grep -E "u4b-scores\.mjs|u4b-reduce\.mjs|record-u4b-calib\.mjs|ukemi/wadray\.ts|ukemi/abi\.ts|hikae/src/l1-split\.ts|sentinel/src/rpc\.ts"
(vide — aucun fichier gele touche)
```

---

## 1. Environnement (2ᵉ passe consolidée)

```
branch: lot/etude-suite
HEAD:   4ee3285e869bedf580fd29acaf00f134f884f37c
lot/etude-suite: 4ee3285e869bedf580fd29acaf00f134f884f37c
```

## 2. sha256 LF depuis blobs HEAD

Commande (par fichier) : `git -C F:/Monark show "HEAD:$f" | tr -d '\r' | sha256sum | cut -d' ' -f1`

```
9ad20666af878c630073d998c6d3bc0bca38017e73b406853bcc31c3f83feacf  scripts/census/u4b/u4b-scores.mjs
a5e66cd387279f4696f09853633a553840dadc53979f78b94aa6f9af57a6fac0  scripts/census/u4b/u4b-reduce.mjs
5733daeb7c8ee40ab0a657882bbe1a9bd03a00d4ddab99e01cfa052a1fbc31a3  scripts/record-u4b-calib.mjs
7bee76fc96a9bc23bb5869ba89167ef58c0f1e8481ed0467ed445c0ee4de2322  apps/sentinel/src/ukemi/wadray.ts
3376eb084f522cb25d708369efb9bc9d11f7b4598abdf4f36708bfd2c1ab2d66  apps/sentinel/src/ukemi/abi.ts
9206df9189d3eba6af61ba3f4a0981b08d80b63f99d171ad3e5a01958164ffa3  packages/hikae/src/l1-split.ts
0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0  apps/sentinel/src/rpc.ts
```

**Comparaison à l'ADR-U4b D4 / C-V-2** :
- `9ad20666…`, `a5e66cd3…`, `5733daeb…` == valeurs COMPLÈTES de D4 ⇒ CONCORDANCE.
- `7bee76fc…`, `3376eb08…`, `9206df91…` == PRÉFIXES de C-V-2 ⇒ CONCORDANCE (préfixe).
- `apps/sentinel/src/rpc.ts` = `0e232519…` ⇒ **aucune valeur ADR** (ajout addendum GARDE-HELIUS-2 C-3 ; ADR-U4b D4 ne l'énumère pas) ⇒ valeur À FIGER.
- **Aucun ÉCART. Pas de STOP.**

(1ʳᵉ passe à HEAD `430e99d` : mêmes 7 valeurs — non re-collée, byte-identique.)

## 3. Imports depuis blobs HEAD — closure transitive

Commande : `git -C F:/Monark show "HEAD:$f" | grep -nE "^import|from ['\"]"`

```
--- scripts/census/u4b/u4b-scores.mjs
31:import { readFileSync } from "node:fs";
32:import { createHash } from "node:crypto";
33:import { fileURLToPath } from "node:url";
34:import { resolve } from "node:path";
35:import { percentMul } from "../../../apps/sentinel/src/ukemi/wadray.ts";
36:import { decodeEModeCategoryData } from "../../../apps/sentinel/src/ukemi/abi.ts";
--- scripts/census/u4b/u4b-reduce.mjs
16:import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
17:import { fileURLToPath } from "node:url";
18:import { dirname, join, resolve, relative, isAbsolute } from "node:path";
19:import { decodeEModeCategoryData } from "../../../apps/sentinel/src/ukemi/abi.ts";
20:import { computeScoresU4b } from "./u4b-scores.mjs";
--- scripts/record-u4b-calib.mjs
10:import { readFileSync } from "node:fs";
11:import { fileURLToPath } from "node:url";
12:import { resolve } from "node:path";
13:import { calibDigest } from "@monark/contracts";
14:import { splitQuantile } from "@monark/hikae";
--- apps/sentinel/src/ukemi/abi.ts
7:import { TRANSFER_TOPIC } from "../rpc.ts";
--- apps/sentinel/src/ukemi/wadray.ts
(aucune ligne import)
--- packages/hikae/src/l1-split.ts
(aucune ligne import)
--- apps/sentinel/src/rpc.ts
12:import { createHash } from "node:crypto";
```

**Closure** : sur `apps/**/src` + `packages/**/src`, hors builtins `node:*` et `@monark/contracts` (= `packages/contracts/src/calib-digest.ts`, déjà `contracts_frozen`), les seuls fichiers atteints sont {wadray, abi, rpc, l1-split}, tous dans le jeu gelé. `abi.ts → ../rpc.ts` (= `apps/sentinel/src/rpc.ts`, résolu depuis `.../ukemi/`). `wadray.ts`, `l1-split.ts`, `rpc.ts` sont des feuilles (aucun import `src`). **Jeu gelé FERMÉ.** (`@monark/hikae`.splitQuantile = `l1-split.ts`, gelé.)

## 4. Pins invariants (blobs HEAD)

```
apps/sentinel/test/ukemi.test.ts:29:  book_digest: "034fbff9eb2ef08079ed478960fcfa86e0e4db6d1c3946156e9170358976b921",
apps/sentinel/test/ukemi-u4-scores.test.ts:20:const PINNED_DIGEST = "267cd9918abde0ee6de23f71c1dc0852d545e00824107c3dfb51f84bb943ea4b"; // C-V-2: re-pinned after Y completed (was 668ab214…)
```

## 5. Ordre des fournisseurs épinglé (rpc2.ts, blob HEAD)

```
268:export const ETH_CALL_PROVIDERS: readonly string[] = ["https://eth.drpc.org", "https://rpc.mevblocker.io", "https://eth-pokt.nodies.app", "https://eth.api.pocket.network"];
269:export const GET_LOGS_PROVIDERS: readonly string[] = ["https://eth.drpc.org", "https://rpc.mevblocker.io", "https://mainnet.gateway.tenderly.co", "https://eth.api.pocket.network"];
```
(URL keyless publiques, aucun secret ; sous GARDE-HELIUS-2a A-3 elles deviennent des labels d'ordre identique. `rpc2.ts` n'est PAS dans le jeu gelé U-4b — l'ordre est un invariant référencé, pas un fichier gelé par sha.)

**Ordre des fournisseurs dans `scripts/` (mission : `apps/sentinel` ET `scripts`)** — `git -C F:/Monark grep -nE "ETH_CALL_PROVIDERS|GET_LOGS_PROVIDERS|drpc.org|mevblocker|nodies|pocket.network|tenderly" -- 'scripts/*'` :
- **Scripts de course U-4** : `scripts/census/u4-oracle-path.mjs:21` et `scripts/census/u4-probe.mjs:29` **importent `ETH_CALL_PROVIDERS`/`GET_LOGS_PROVIDERS` de `rpc2.ts`** (source UNIQUE, pas de copie d'ordre) ; `u4-oracle-path.mjs:56-57,127` **exclut déjà `["mevblocker.io"]`** (corrobore la D-5 « mevblocker exclu de la course » et le `--exclude-operators mevblocker` du prereg §5a). `u4-probe.mjs:68` idem sans exclusion.
- **Autres campagnes (hors périmètre U-4b)** : `scripts/census/aave-liquidations.mjs:95-97` (tenderly/mevblocker/drpc, census liquidations U-3) et `scripts/census/burns-by-burner.mjs:87-89` (scouting burns FDUSD) portent leurs **propres** listes d'ordre — pas la course U-4b.
⇒ aucune copie divergente de l'ordre U-4b dans `scripts/` ; les scripts de course dérivent de `rpc2.ts`.

## 6. `TRANSFER_TOPIC` dans rpc.ts (constante littérale, blob HEAD)

```
15:export const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
```
(Standard ERC-20 Transfer topic ; seule entité de `rpc.ts` consommée par le code de score, via `abi.ts:7`. Le gel de `rpc.ts` entier la couvre.)

## 6bis. Convention de conversion de Y — `toBase = floorDiv` (u3-realized.mjs, blob HEAD)

`git -C F:/Monark show HEAD:scripts/census/u3-realized.mjs | sed -n '101,104p'` :
```
const floorDiv = (a, b) => a / b; // BigInt division floors toward zero for non-negative operands (all are).
/** amount_native (BigInt) × price (base-8dec BigInt) / 10^decimals ⇒ value in base currency (8 dec), floored. */
export function toBase(amountNative, price, decimals) {
  return floorDiv(BigInt(amountNative) * BigInt(price), 10n ** BigInt(decimals));
}
```
Usages : `:181` `repayBase += toBase(...)`, `:182` `seizedBase += toBase(...)`, `:202` `deficitBase += toBase(...)`. ⇒ Y (et ses composantes en devise de base) est converti par **floor** — mesuré première main (confirme l'affirmation advisor-defi §2). **Load-bearing** pour la symétrie Y/ŷ (ruling CA (a)) et l'entrée C-V-7 « score en devise de base ». `u3-realized.mjs` est **modifié en -1b** (labeling paramétré, G0 1b-3) ⇒ non gelable entier ⇒ trou anti-sélection côté Y (DRAFT Q11).

---

## 7. Localisation du « kit de passation §9.5 »

`Glob **/*passation*` → aucun fichier. `grep "passation"` dans `docs/` → seules occurrences hors sujet (`PLAN-m008-f2b-usde.md:149`, `RAPPORT-passe-m014-edetector.md:65`). Recherche récursive sur `F:/tmp` : abandonnée (timeout, non porteuse). ⇒ le « kit de passation » est un artefact de handoff de l'orchestrateur **hors dépôt en lecture seule**. Source in-repo autoritaire pour figer `rpc.ts` = **addendum GARDE-HELIUS-2 C-3** (`docs/G0-ADDENDUM-lot-garde-helius-2.md:46` : « ajouté aux invariants … et ajouté à la liste de gel du prereg U-4b-1b (complète ADR-U4b D4 / C-V-2) »). Voir QUESTION Q2/Q3.

## 8. Sources documentaires lues (lecture seule)

`docs/adr/ADR-U4b-calibration-episode-frais.md` (D1-D5, tuyaux, MAST), `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md` (D1-D6, amendement 2a A-1..A-6, A-4 protocole agrégat), `docs/G0-lot-u4b.md` (§0-§14, P-EPI §2, H-n §4, sonde §6, table plis §13, notes orchestrateur §358-362), `docs/G2-lot-u4b-1a.md`, `docs/G7-lot-u4b-1a.md`, `docs/CHECKPOINT2-lot-u4b-1a.md` (C-V-1..9, §C-V-7), `docs/G0-ADDENDUM-lot-garde-helius-2.md` (D1-D5, pli C-1..C-7), `docs/CHANTIERS.md:559-562` (décision 119), `F:\PRODUITS\etude-2026-09-21\ukemi-u4b-prerequis\PR-U4-3-ter-FAITS-arrondi-CA-2026-09-21.md` + `…-RAPPORT-lecteur-percentagemath-…` + `AVIS-advisor-defi-agregat-et-arrondi-CA-…`.
