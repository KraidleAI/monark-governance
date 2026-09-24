# PLI post-G2 — lot T-1a-ii-a (MONARK Bell : collecteur faits iii-iv + jambe Ethereum)

- **Worker** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, R-1), effort max, contexte frais. Aucun `git` d'écriture, aucun commit, aucun workflow (R-20) ; vérification adversariale = orchestrateur (R-21). Scratch hors dépôt sous `F:\tmp\t1aiia-fold\`. `claude-opus-5` banni, non utilisé.
- **Provenance** : 2026-09-19, worktree `F:\Monark-wt-bell2a`, branche `lot/t-1a-ii-a` (HEAD gel G1 `83d016c`, base merge-base `88c3324`). Plie la liste **FERMÉE** G2 §8 (verdict APPROUVÉ-AVEC-CORRECTIONS). `bell_sha` fixture **inchangé** `4375042c…fab6fa46` ; `fleet.ts` intact (Bell reste `upcoming`) ; oracle **337/337**.

## §1 — Items pliés (fichier/lignes · test · mutant)

| Item (G2 §8) | Fichier · lignes | Test (preuve) | Mutant |
|---|---|---|---|
| **O-1** (C-1a) publicnode retiré : défaut = 1 fournisseur ⇒ lecture sans Helius = `no_quorum` fail-closed | `rpc.ts` L16-20 (comment 2 l. + `PUBLIC_SOLANA` = 1 entrée) | `bell_no_quorum_on_single_provider` étendu : `solanaEndpoints({})`=`[mainnet-beta]`, `providerOf`=`solana.com`, 1 fournisseur distinct, `quorum2(défaut)`⇒`NoQuorumError` ; re-ajouter publicnode ⇒ rougit `deepEqual`+`Set.size`+`rejects` (mutant O-1) | **7** `quorum.ts:91` `\|\|`→`&&` ⇒ RED |
| **O-2** (CA-11a) garde `--out` = fonction pure casse/sépar.-robuste ET câblée | `collect.ts` : import `relative,isAbsolute` (L14) ; `assertOutsideRepo(out,root)` L307 (nouv., `resolve`+`relative`+`isAbsolute`+lowercase) ; `main()` L319 l'appelle | `bell_out_guard_is_outside_the_repo` (nouv.) : sous-dépôt casse égale/haute/sépar. mixtes + racine ⇒ throw ; frère hors-arbre ⇒ ok ; **win32-only** : trou mesuré `f:`≠`F:` ⇒ throw, `F:/tmp` ⇒ ok ; **câblage** `assert.match(collect.ts, /assertOutsideRepo\(out, repoRoot\)/)` | **9a** garde→`if(false)` ⇒ RED ; **9b** appel retiré de `main()` ⇒ RED |
| **O-3** (C-10a) `ethereum.ts` ajouté au scan secret Bell (⇒ 6 nouveaux src) | `bell.test.ts` L153 (+1 entrée liste, 0 ligne nouvelle) | `bell_no_secret_in_repo` vert avec `ethereum.ts` (regex Bell ne matche pas `?api-key can leak`, vérifié empiriquement) | couvert par le walk racine `no_secret_in_repo` ; UUID-en-contexte = G2 mutant 4 |
| **O-7** (R-3) `providerOf` importé au lieu de la réimpl. inline | `collect.ts` L333 `solProviders.map(providerOf)` | typecheck strict + oracle 337 ; `providerOf` (sentinel) lowercase le host (améliore la casse) | dé-duplication, comportement couvert par l'oracle |
| **O-4 / O-5 / O-6** (doc seul, NON implémentés, R-25) | `docs/G1-lot-t1a-ii-a.md` §8 | items formés + déclencheurs nommés (C-4/C-11/C-12 différés `-b` ; C-1b avant `-b` ; ancre série au lot ci-gates) | — |

## §2 — Shas LF 12-hex post-pli (méthode `tr -d '\r' \| sha256sum \| cut -c1-12`, validée : `quorum.ts`=`a90633c57b3a`)

| Fichier | gel G1 | post-pli |
|---|---|---|
| `apps/bell/src/rpc.ts` | inchangé 88c3324→gel (hors table G1) | `3e372df0955e` |
| `apps/bell/src/collect.ts` | `3f0126d8c339` | `cfec4363d596` |
| `apps/bell/test/bell.test.ts` | `fec9c8b5877e` | `ebd61c7905e5` |
| `apps/bell/test/collect.test.ts` | `085a1ced13b9` | `93a4df59bfe8` |
| `quorum.ts` / `ethereum.ts` / supply / volume / residuals / digest | inchangés | inchangés (`a90633c57b3a` / `6795a3ca99da`) |

## §3 — Gates (rejeu, TMP=F:/tmp, cache F:/tmp/npm-cache)

- `npm run ci` (gate:vocab + tsc + test) : **tests 337 / pass 337 / fail 0**, 30 884 ms. `npm run typecheck` (tsc --noEmit strict) : 0 erreur.
- `npm run lint` (eslint) : propre. `npm run lint:ratchet` : **69/69**. `lang-gate --scope root,contracts,schemas,site` : **0 hit** (OK). `npm run export:check` : OK, 0 chemin interdit.
- `no_secret_in_repo` (walk racine) : vert (209 ms). Oracle Bell : **29/29** dont `bell_out_guard_is_outside_the_repo`, `bell_no_quorum_on_single_provider` (défaut épinglé), `bell_collector_replays_fixture_bit_identical` (`bell_sha`=`4375042c…fab6fa46`).

## §4 — Mutants (rejoués ; restauration byte-exacte vérifiée par LF-sha)

| # | Cible · mutation | Test | Résultat | Restauration |
|---|---|---|---|---|
| 7 | `quorum.ts:91` `\|\|`→`&&` (no_quorum non détecté sur 1 fournisseur) | `bell_no_quorum_on_single_provider` | **RED** ✓ | `a90633c57b3a` ✓ |
| 8 | `ethereum.ts:31` `return v;` (int256 sans extension de signe) | `bell_eth_v3_swap_decode_and_vwap` | **RED** ✓ | `6795a3ca99da` ✓ |
| 9a | `collect.ts` garde `assertOutsideRepo` → `if(false)` | `bell_out_guard_is_outside_the_repo` | **RED** ✓ | `cfec4363d596` ✓ |
| 9b | `collect.ts` appel de la garde retiré de `main()` (dé-câblage) | `bell_out_guard_is_outside_the_repo` (preuve de câblage) | **RED** ✓ | `cfec4363d596` ✓ |

Le trou G2 « garde dans `main()` = hors CI » (mutant 9 vert en G2) est CLOS des deux côtés : fonction prouvée (9a) ET câblage prouvé (9b).

## §5 — Diff stat + R-25 (pathspec de la ligne `STAT=` de `ci.yml` (ligne 52 au gel `a52f67c` ; numéro non stable), base `88c3324`, working tree ; index réel intact = R-20)

- Diff vs `88c3324` (séries exclues) : `rpc.ts` (entre dans le delta au pli), `collect.ts`, `collect.test.ts`, `bell.test.ts` ; `fleet.ts` = **0** (intact).
- **R-25 (ci.yml:52, séries exclues)** : **14 fichiers, 1 122 +/17− = 1 139** ≤ 1 205 ✓ ; **+45** sur le gel 1 094 (≤ +60 ✓). `docs/G1-lot-*.md`/`docs/G2-lot-*.md` exclus (G1 gratuit).
- **Ce rapport** (`docs/PLI-*.md`) n'est PAS matché par les exclusions locales `ci.yml:52` (seules `G1-lot-*`/`G2-lot-*`), mais l'est par `docs/**/*.md` (ADR-M003 **D9 septies**) déjà présent sur `lot/etude-suite` (`3f2f19c`), branche d'intégration de fusion. Trois chiffres **mesurés** : **strict-local (PLI 51 l. compté)** = **1 190** (15 fich., 1 173 +/17−) ≤ 1 205 ✓ ; **strict-local sans PLI** = **1 139** ; **D9-septies (gate à la fusion, tous docs exclus)** = **1 139**. Le worktree précède D9 septies (item orchestrateur déjà noté, G1 §8 obs. ci.yml) ⇒ nombre liant à la fusion = **1 139**. Aucune scission de code requise (code = +45).

## §6 — Reste

**Vide.** Aucune dette. O-4/O-5/O-6 = items formés à déclencheur nommé (G1 §8), pas des dûs nus. Aucun commit/`git`/workflow (R-20) ; écritures hors dépôt sous `F:\tmp\t1aiia-fold\` sauf les 4 fichiers code/test + 2 docs du pli. Commit et verdict G7 = orchestrateur (R-20/R-21).
