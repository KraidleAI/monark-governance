# G2-DELTA — GARDE-HELIUS-2a — plis `c6a112d` (checkpoint-2 C-V-1..6 + ruling h) + `4585b20` (C-R-1)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé).
**Verdict : PASS.** Le pli résout **tous** mes C-G2-1..6 (dd9148f) et les C-V-1..6 + ruling h du checkpoint-2 et le C-R-1, chacun **épinglé** par un test/mutant (34/34 mutants worker ROUGES). Oracle vert. **Trois items FORMÉS non bloquants** (C-GD-1..3) sur des résidus de `redact` (défense en profondeur) — **inatteignables avec les deux opérateurs actuels** (Chainstack = segment de chemin, Helius = valeur de requête), chacun à déclencheur.

Cible pinnée **`4585b20`** (base `5d177db`), worktree GELÉ (vérifié `git status` propre). Isolation : `git archive 4585b20` → `F:\tmp\g2-garde2a\tree2\`, jonction `node_modules`, `TEMP/TMP` sur F:. **10/10 `src` == blobs `4585b20`** (sha256, après tous les rejeux). Aucune écriture au dépôt, aucun `git checkout/stash`, aucun `npm ci/install`, aucun réseau (`fetch` bouchonné, hôtes `.invalid`, clés **factices**). R-20 : aucun commit.

---

## 1. C-G2-1..6 re-vérifiés un par un contre `dd9148f..4585b20` (première main)

| Mon finding (dd9148f) | État sur `4585b20` | Preuve reproduite |
|---|---|---|
| **C-G2-1** transport fail-open (JSON-RPC 200 ⇒ `undefined` ; 429 nu) | **CORRIGÉ** (`errors.ts` `TransportError`, `transport.ts:114-138` 4 chemins typés) | sonde `g2probe` : 200+`{error}` ⇒ **throw `RpcError` `.code:-32000`** (plus `undefined`) ; 429 ⇒ **`HttpError` `.code:429`**, corps gardé. **Hook OBSERVÉ sur 429 (sonde `g2sharp`, [lu]) = `[["chainstack","HttpError",429]]`** (op + name + code, jamais l'URL). Épinglé par mutants **V5** (`transport_error_path_json_rpc_error_never_resolves_undefined`) + **V6** (`transport_error_path_http_non_ok_keeps_body`), tous deux ROUGES. |
| **C-G2-2** floor non épinglé là où il agit (`guarded.ts:50`) | **CORRIGÉ** (nouveau test via `openGuardedClient`) | **mon mutant `cycleFloor[label]→["helius"]` REND MAINTENANT ROUGE** `two_paid_operators_keep_separate_priors_and_units` (45 pass / 1 fail ; sur `dd9148f` il **survivait** 35/0). Restauré byte-exact. |
| **C-G2-3** pas de chemin code pour l'étalonnage | **CORRIGÉ** (`reconcile.ts:23,52-67` mode `aggregate-calibration` : borne dure BLOQUE, sur-compte souple CONSIGNÉ exit 0, champ `softDeviation`) | mutant **V4** `calibration-ignores-hard-bound` ROUGE (`reconcile_aggregate_calibration_enforces_hard_bound_and_consigns_soft`), test vert. |
| **C-G2-4** 2 comportements corrects non épinglés | **CORRIGÉ** (2 nouveaux tests) | mutants **V1** `run-caps-summed` (`run_caps_are_per_operator_at_the_meter`) et **V2** `tariff-version-constant` (`ledger_stamps_tariff_version_per_operator`) **maintenant ROUGES** (survivaient sur dd9148f). |
| **C-G2-5** raisons de refus trompeuses | **CORRIGÉ** (`reconcile.ts:60` `negative_delta` ; `cli.ts:27-28` `AGGREGATE_ONLY_OPERATORS` exige un mode agrégat pour `chainstack`, fail-closed avant tout verrou) | test `aggregate_negative_delta_is_named` vert. |
| **C-G2-6** ADR contradictoire | **CORRIGÉ** | `docs/adr/…:102` « …**est applicable** par appel (l'ancienne clause « non-applicable-cette-course » est [superseded]) » ; plus aucune occurrence de `credits\|requests\|keyless`. |
| ruling h — keyless verrouillé quand demandé | **épinglé** | mutant **V3** `keyless-not-locked` ROUGE (`keyless_operator_is_locked_when_requested`). |

**34/34 mutants worker ROUGES** (rejoués `replay2.mjs` contre `tree2`, chacun tue son test nommé, **tous restaurés byte-exact**), dont les 16+7 de 1a/2a (R*/G2M*/A*), V1..V6 (les pins ci-dessus) et X1..X5 (C-R-1).

## 2. C-R-1 — revue ADVERSAIRE de `redact` (`transport.ts:92-106`)

**Le modèle de menace CONCRET (les deux opérateurs actuels) est ENTIÈREMENT couvert** — sonde `g2redact` (401 dont le corps ré-émet la clé), toutes CLEAN :
- clé = **segment de chemin** Chainstack (`https://host/KEY`) : raw, `encodeURIComponent`, MAJUSCULE (insensible à la casse), forme JSON-échappée, forme sans-schéma `host/KEY` ⇒ `<redacted>`.
- clé = **valeur de requête** Helius (`?api-key=KEY`) ⇒ `<redacted>`.
- **host** ⇒ `<redacted>`. **url inparsable ⇒ corps DÉPOSÉ** (fail-closed, mutant **X3** ROUGE `transport_error_drops_body_when_operator_url_unparseable`).
- métacaractères **échappés** (`/[.*+?^${}()|[\]\\]/g`) ⇒ **pas de ReDoS** (alternation de littéraux, linéaire). En-têtes **jamais** repris (seul `res.text()`).
- `transport_error_path_http_non_ok_keeps_body` **VERT** (l'indice de découpe de plage `getLogsVia` est conservé, redacté).
- **Mon mutant de cru** « redact only `escaped[0]` (le plus long) » ⇒ **CAUGHT** par `transport_error_never_echoes_operator_key` (l'alternation complète est load-bearing). Restauré.

**Trois résidus de fuite DÉMONTRÉS (première main) — inatteignables avec Chainstack(chemin)/Helius(requête)** :
| Résidu | forme d'URL / corps | `redact` | verdict sonde |
|---|---|---|---|
| **C-GD-1 userinfo** | `https://user:KEY@host/rpc`, corps `invalid credentials: KEY` | `u.username`/`u.password` **jamais ciblés** | **LEAK** `…: SECRETPATHKEY123456` |
| **C-GD-2 base64/hex** | corps `token base64(KEY) bad` | seules raw / `encodeURIComponent` / JSON-échappé | **LEAK** `…: U0VDUkVU…` |
| **C-GD-3 coupure AVANT redact** | (a) collapse `\s+→' '` ; (b) **`.slice(0,160)`** — tous deux AVANT `redact` (`transport.ts:128`) | cible contiguë ne matche ni `SEC RET` ni un préfixe tronqué | **LEAK** : (a) `…: SECRETPAT HKEY…` ; (b) sonde `g2sharp`, clé au-delà de l'octet 160 ⇒ **préfixe `SECRETPATH` fuit** (sans transformation serveur) |

## 3. Items FORMÉS (non bloquants, à déclencheur) — défense en profondeur de `redact`
- **C-GD-1 (À PLIER au prochain commit — une ligne)** : cibler `u.username` et `u.password`. *Correctif* : `for (const p of [u.username, u.password]) if (p.length > 0) { targets.add(p); targets.add(encodeURIComponent(p)); }`. *Test requis* : redaction d'une url userinfo. *Réserve d'atteignabilité (déclarée, non un fait lu)* : le placement « Chainstack=chemin / Helius=requête » vient des **commentaires du worker** (`transport.ts:84-85`, `rpc.ts:redactEndpoint`), PAS des FAITS — la **forme réelle de `CHAINSTACK_ETH_URL` n'est pas lue** (les FAITS pt 1-11 couvrent la tarification/console, jamais la forme de l'URL). L'orchestrateur peut la confirmer (NOM de variable seul, jamais la valeur). userinfo est un emplacement de secret STANDARD ⇒ à fermer proactivement. *error_origin* : worker.
- **C-GD-3 (À PLIER — même classe que le C-R-1 bloquant, restreinte)** : `redact` s'exécute APRÈS deux réductions du corps (`transport.ts:128`) — le collapse `\s+→' '` ET le **`.slice(0,160)`**. Une clé ré-émise **au-delà de l'octet 160**, SANS préfixe `http://` (sinon `scrubUrls` la prend), est tronquée en un préfixe que la cible-segment ne matche pas ⇒ **le préfixe de la clé fuit** (mesuré : `SECRETPATH`), **sans transformation serveur**. C'est la MÊME classe que le C-R-1 que le checkpoint-2 a bloqué (« clé qui fuit par un corps ré-émis sans préfixe http »), restreinte aux clés au-delà de l'octet 160. *Correctif* : **redacter AVANT le collapse et le slice** (un seul réordonnancement ferme (a) et (b)). *error_origin* : worker.
- **C-GD-2 (à déclencheur)** : formes encodées (base64/hex) non couvertes. *Déclencheur* : un endpoint qui ré-émet la clé encodée. *Alternative structurelle (recommandée si un doute persiste sur C-GD-1/3)* : **ne jamais reprendre le corps pour un opérateur PAYANT** (l'indice de découpe de plage `getLogsVia` ne sert qu'à ETH/keyless ; le dériver sans le corps, ou ne le garder que pour les keyless). *error_origin* : worker.

*Pourquoi le verdict reste PASS* : la fuite LARGE que le checkpoint-2 a bloquée (tout corps court ré-émettant la clé, sans préfixe http) est **fermée** (sonde `g2redact` : toutes les formes contiguës aux emplacements des opérateurs sont redactées ; fail-closed sur url inparsable, X3 ROUGE). Les résidus sont **étroits** : userinfo (placement qu'aucun opérateur n'emploie, à confirmer), base64 (transformation serveur), et la clé au-delà de l'octet 160 (corps long ré-émettant un secret — déjà un comportement serveur inhabituel). Le paquet reste `upcoming` (non consommé avant 2b). **Ce sont des items formés à déclencheur** (règle Dettes), pas une dette nue — mais **C-GD-1 et C-GD-3 sont de la même classe que le C-R-1 bloquant et se ferment par un seul réordonnancement (`redact` avant collapse/slice + userinfo) : recommandé de les plier avant que 2b ne consomme le transport.**

## 4. Oracle (arbre isolé pristine `4585b20`)
| Contrôle | Résultat |
|---|---|
| `npm run ci` | **exit 0** — gate:vocab OK (**202** fichiers), **711 tests, 710 pass, 0 fail, 1 skip** (skip = `fetch_only_inside_client # SKIP until 1b`). |
| **Transient off-by-one du worker** | **NON REVU** — **4 exécutions** du suite complet ⇒ **711/710/0 fail à chaque fois**. Probable course de `--test-force-exit` (un test tardif non enregistré), non reproduite ici. |
| `eslint packages/rpc-guard` | **0 problème (exit 0)**. |
| R-25 (`ci.yml:65` pathspec, base `5d177db`) | **910** (788 ins + 122 del) — = valeur annoncée. |
| Périmètre | **tout le CODE dans `packages/rpc-guard/**`** (8 src + 8 test) ; hors-code = ADR + 2 docs de revue (CHECKPOINT2, G2). Aucun code hors périmètre. |
| Gel U-4b + apps | **byte-identiques `5d177db..4585b20`** : `apps/sentinel/src/{rpc.ts, ukemi/record.ts, ukemi/rpc2.ts, ukemi/abi.ts, ukemi/wadray.ts, ukemi/l1-split.ts}`, `scripts/record-u4b-calib.mjs`, `scripts/census/u4b/**`. |
| `git merge-tree lot/etude-suite 4585b20` | **propre (exit 0)**. |
| Export closure | `public_export_set_is_closed` vert ; `TransportError` ajouté au jeu FERMÉ (typé, `.op`/`.code`, message scrubé) — consommé par le quorum aval pour distinguer un fault benché d'un stop budget. |

## 5. Synthèse
Le pli **fait ce qu'il annonce** : mes C-G2-1..6 et les C-V-1..6 + ruling h du checkpoint-2 sont **résolus ET épinglés** (34 mutants ROUGES, sondes de première main), et C-R-1 **ferme la fuite LARGE atteignable** (toute forme contiguë de la clé aux emplacements des opérateurs actuels est redactée ; fail-closed sur url inparsable ; hook 429 observé). Restent **trois résidus étroits** (`redact`), **formés à déclencheur** — dont **C-GD-1 (userinfo) et C-GD-3 (clé au-delà de l'octet 160) sont de la MÊME classe que le C-R-1 bloquant** et se ferment par un réordonnancement d'une ligne (`redact` avant collapse/slice + userinfo). **error_origin** (pli) : worker (exécution) — plan sain. **Verdict : PASS** — la fuite large est fermée, les résidus sont étroits et le paquet est `upcoming` ; **recommandation forte : plier C-GD-1 + C-GD-3 avant que 2b consomme le transport** (l'orchestrateur tranche le classement bloquant/non-bloquant en confirmant la forme réelle de `CHAINSTACK_ETH_URL`, non lue ici).

**R-20 : je ne committe pas, je ne déclenche aucun workflow.** Rejeu (arbre isolé `tree2\` UNIQUEMENT, jamais le dépôt) : `F:\tmp\g2-garde2a\{replay2.mjs, mtable2.json, floor-mutant2.mjs, mymut.mjs, extract2.mjs}` ; sondes de relecture `g2probe.test.ts` (transport), `g2redact.test.ts` (10 formes de clé), `g2sharp.test.ts` (slice-160 + hook 429) — jamais proposées au dépôt (périmètre `5d177db..4585b20` = 8 src + 8 test + 3 docs).
