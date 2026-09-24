# MESURES — PLAN-u4b-prereg FINAL (worker `claude-opus-4-8[1m]`, effort max, 2026-09-22)

Base LECTURE SEULE : `F:\Monark` `lot/etude-suite` HEAD `0534551b7c61542cc6e028d920d0aa620f8ad067` (`git rev-parse HEAD`, ce tour). Aucune écriture dans `F:\Monark` (R-20). Toutes les commandes sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY` (A-7 ; aucune variable d'environnement affichée). Régime B : preuve = blobs HEAD (`git show HEAD:<f>`), jamais `git status`.

## 1. Les 8 sha gelés + labeler — recompute régime B, concordance ligne à ligne avec l'ADR

Commande (rejouée telle quelle) :
```
for f in \
  scripts/census/u4b/u4b-scores.mjs scripts/census/u4b/u4b-reduce.mjs scripts/record-u4b-calib.mjs \
  apps/sentinel/src/ukemi/wadray.ts apps/sentinel/src/ukemi/abi.ts packages/hikae/src/l1-split.ts \
  apps/sentinel/src/rpc.ts packages/contracts/src/calib-digest.ts scripts/census/u3-realized.mjs ; do
  printf "%s  %s\n" "$(git show "HEAD:$f" | tr -d '\r' | sha256sum | cut -d' ' -f1)" "$f"
done
```
Sortie MESURÉE (HEAD `0534551`) et comparaison à la table AVANT/APRÈS de l'ADR-U4b **amendement daté 2026-09-22 §3** (`docs/adr/ADR-U4b-calibration-episode-frais.md:197-214`) :

| # | Fichier | sha256 LF recomputé (HEAD `0534551`) | Réf. ADR §3 « APRÈS » | Verdict |
|---|---|---|---|---|
| 1 | `scripts/census/u4b/u4b-scores.mjs` | `2f9a31f614df05278dbf87353b07d405a016da8c3330968854731519f51445c0` | `2f9a31f6…f51445c0` (RE-GELÉ) | **CONCORDE** (préfixe+suffixe) |
| 2 | `scripts/census/u4b/u4b-reduce.mjs` | `a5e66cd387279f4696f09853633a553840dadc53979f78b94aa6f9af57a6fac0` | `a5e66cd3…57a6fac0` idem | **CONCORDE** |
| 3 | `scripts/record-u4b-calib.mjs` | `5733daeb7c8ee40ab0a657882bbe1a9bd03a00d4ddab99e01cfa052a1fbc31a3` | `5733daeb…2a1fbc31a3` idem | **CONCORDE** |
| 4 | `apps/sentinel/src/ukemi/wadray.ts` | `7bee76fc96a9bc23bb5869ba89167ef58c0f1e8481ed0467ed445c0ee4de2322` | `7bee76fc…e4de2322` idem | **CONCORDE** |
| 5 | `apps/sentinel/src/ukemi/abi.ts` | `3376eb084f522cb25d708369efb9bc9d11f7b4598abdf4f36708bfd2c1ab2d66` | `3376eb08…c1ab2d66` idem | **CONCORDE** |
| 6 | `packages/hikae/src/l1-split.ts` | `9206df9189d3eba6af61ba3f4a0981b08d80b63f99d171ad3e5a01958164ffa3` | `9206df91…8164ffa3` idem | **CONCORDE** |
| 7 | `apps/sentinel/src/rpc.ts` | `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0` | `0e232519…c1c65ca0` idem (amend. 2026-09-21 §1) | **CONCORDE** |
| 8 | `packages/contracts/src/calib-digest.ts` | `3603265d0a1f1a4e3e1a1d57b4b568fcadf4f6861351c2ca49b38dc794c42380` | `3603265d…94c42380` idem (`contracts_frozen`) | **CONCORDE** |
| — | `scripts/census/u3-realized.mjs` (labeler) | `755b3a38f0253edb464624f8cdaa52385d4f9e2f1227a7bd303653b618db2de4` | `755b3a38…618db2de4` idem (gel déféré) | **CONCORDE** |

**Bilan : 9/9 concordent (8 gelés + labeler), ligne à ligne, avec la table ADR §3. AUCUN ÉCART. PAS DE STOP.** Le sha #1 est la valeur **APRÈS** re-gel (décision 126). Ces valeurs sont **recomputées au commit réel du prereg** (régime B) ; toute divergence = ÉCART = STOP.

## 2. Sha auxiliaires (cibles des gardes `--prereg-sha` d'autres surfaces, §5a/§5c)

| Fichier (blob HEAD `0534551`) | sha256 LF | Usage |
|---|---|---|
| `docs/PLAN-u4-prereg.md` | `9209cdabe26d56f0be8603e214b29e8b10b2efb55f9d6c9e6fad68ae189849fb` | `--prereg-sha` du recorder (`record.ts:239-241`, garde U-4 du LIVRE — **PAS** ce prereg) |
| `docs/PLAN-u3-prereg.md` | `835805ccc9941a101e760f4ca570f8bdb5ab30d5280e1897c473df7c788877d3` | `--prereg-sha` du labeler (`u3-realized.mjs:405-408`, garde U-3) |

`docs/PLAN-u4b-prereg.md` : **ABSENT** au HEAD (`git cat-file -e HEAD:docs/PLAN-u4b-prereg.md` → « does not exist ») — attendu ; le sha LF de CE prereg naît **au commit** (§8b), recomputé APRÈS commit par l'orchestrateur — pas de valeur circulaire (mission 8).

## 3. Faits d'état vérifiés (mesurés ce tour)

- **HEAD = `0534551`** (`git rev-parse HEAD`), branche `lot/etude-suite`, `git status` propre.
- **GARDE-HELIUS-2b-ii FUSIONNÉ** (`5394dfe`, `docs/G7-lot-garde-helius-2b-ii.md`) ET **2b-iii FUSIONNÉ** (`985fed9`, G7 `3c6afde`) — les deux préconditions §5a satisfaites. Le recorder est final.
- **`u4-probe.mjs` supprimé** (`d311809` : « u4-probe.mjs deleted ») ; **`u4-oracle-path.mjs` migré sous garde** (2b-iii, via `u4-guard.mjs`) ; `scripts/census/u4b/` = `u4b-reduce.mjs`, `u4b-scores.mjs` seuls (**`u4b-discover.mjs` ABSENT** → Q-D).
- **Recorder `record.ts`** : `--operators` liste d'inclusion explicite (`:244-248`), `--exclude-operator` supprimé ; 6 args requis sans condition (`:224-235`) ; **aucun flag `--labeler-sha`** (`parseUkemiArgs:130-174`) ; `--prereg-sha` OPTIONNEL comparant `docs/PLAN-u4-prereg.md` (`:239-241`) ; ne lit aucune clé (`:221-222`).
- **Keyless labels** (`packages/rpc-guard/src/transport.ts:34-35`) : ETH_CALL = {drpc.org, mevblocker.io, nodies.app, pocket.network} ; GET_LOGS = {drpc.org, mevblocker.io, tenderly.co, pocket.network} ; union = 5. `operatorOf` (`rpc2.ts:28-31`) : nodies+pocket → « pocket » (1 opérateur). eth_call = 3 opérateurs keyless distincts, getLogs = 4 (≥ 2 même chainstack benchée).
- **mevblocker** est un opérateur eth_call/getLogs VALIDE du recorder (`rpc2.ts:4-5`) ; l'exclusion D-5 est SPÉCIFIQUE au prober `u4-oracle-path.mjs:63-65` (`excluded:["mevblocker.io"]`), pas au recorder.
- **Score** : `u4b-scores.mjs:245` = `const score = Y > yhat ? Y - yhat : 0n;` (unilatéral, décision 126).
- **Décisions** : 121 (CHANTIERS:602-603), 122 item 3 = go U-6 conditionnel (CHANTIERS:607-610), 123 (CHANTIERS:622-627), 126 (CHANTIERS:646-652).
- **`reconcile`** (`packages/rpc-guard/src/cli.ts:4,22-34`) : `runCli(argv, deps)` — `argv` = `--before --after --cycle --op <label> [--mode aggregate-calibration]` ; `deps={ledgerDir,floor,readSnapshot}` INJECTÉS (`:10-14`). **AUCUN `main`/`bin` shell** (pas de run-guard `import.meta.url` dans `cli.ts` ; `package.json` sans `bin`) ; seul appelant non-test de `runCli` = `record.ts:431` (`unlock`) → Q-E.
- **`--filter-only` (temps 1)** : la branche `record.ts:345` est APRÈS les throws d'args requis `:224-247` ⇒ le temps 1 exige aussi `--ledger-dir/--cycle/--floor/--max-ru/--method-caps/--max-calls/--operators`.
- **§8d numéros re-mesurés** : `book_digest 034fbff9` = `apps/sentinel/test/ukemi.test.ts:33` (candidat :29) ; `PINNED_DIGEST 267cd991` = `apps/sentinel/test/ukemi-u4-scores.test.ts:24` (candidat :20) ; `U3-realized.jsonl b4d93590` = `PROVENANCE-u3.md:10` (correct) ; `docs/G7-lot-garde-helius-2b-iii.md` PRÉSENT ; C-15 = `docs/G0-lot-u4b.md:358` (confirmé) ; digests cellule re-gel A `2feb4ab0…`/B `07bb8e3b…` = `ADR-U4b:221-222`.
- **Marqueurs temporels** : `record.ts:400` écrit le brut ; sa provenance (`:393`) et le `--resume` meta (`:331-333`) portent seulement le `prereg_sha` U-4 ⇒ les marqueurs U-4b vont dans la sonde + un sidecar daté, jamais le brut.
- **Numéros de ligne corrigés vs candidat** (chacun re-mesuré ce tour) : LIQ_TOPIC `u3-realized.mjs:52` (candidat disait :54 = UPGRADED_TOPIC) ; throw non-USDT `u4b-scores.mjs:113` (candidat :112) ; ordre des fournisseurs `transport.ts:34-35` / `rpc2.ts:248-249` (candidat `rpc2.ts:268-269`) ; `u4-oracle-path.mjs` `B0=23545087, BLAST=23552238, PROXY=0x5424384b…` en dur (`:33,:36`).

## 4. Vérification `gate:vocab` / `lang:gate` du fichier de sortie

- **`gate:vocab`** : le fichier prereg vit sous `docs/`, **HORS de la portée par défaut** du scanner (`scripts/grep-forbidden.mjs` scanne `packages/*/src`, `apps/site`, `apps/harness/src`, `skills/`, `apps/sentinel/{src,test}` + listes de fichiers, `apps/bell/src` — pas `docs/`). En CI, ce fichier n'est donc pas scanné. Par hygiène, j'ai exécuté les patterns GLOBAUX en CLI sur MA sortie :
  ```
  node scripts/grep-forbidden.mjs /f/tmp/prereg/PLAN-u4b-prereg.md
  → gate:vocab OK — scanned 207 file(s), no forbidden claim.
  ```
  RÉSULTAT : **OK, 0 interdit**. Contrôle ciblé (probability/guarantee/hallucination/« X % correct ») = **aucune occurrence**. Le texte dit « en couverture, jamais en probabilité » et « couverture ≥ 1−α sous échangeabilité » (conformes à la discipline 09 ; `packages/hikae`/serveur restent la seule surface publique gatée en -2).
- **`lang:gate`** : **NON APPLICABLE**. Le gate (`scripts/lang-gate.mjs`) impose l'ANGLAIS sur les fichiers EXPORTÉS (whitelist d'export : scopes root/contracts/schemas/hikae/ukemi/atelier/monark). Le prereg est un **document interne FRANÇAIS** (comme l'ADR, CHANTIERS, le candidat) hors whitelist d'export ⇒ non gaté. (Le prereg n'est jamais exporté vers la vitrine publique anglaise.)
