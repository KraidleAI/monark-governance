# G2 — lot Bell T-1a-ii-b3d-f (condition de GO (f) : engagement chaîné du payload du ledger de contre-vérification)

**RELECTEUR G2, instance séparée, contexte frais, revue 3 étapes.**
**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme ; effort max). R-20 : aucun commit, aucun workflow.

## Verdict : **PASS-AVEC-CORRECTIONS**
La condition (f) **tient dans le CODE** : `entry_sha256` commet le payload (`payload_sha256` 10ᵉ champ), `prev_entry_sha256` le commet transitivement, et une reprise sur payload édité (events OU handoffs) est refusée fail-closed AVANT toute écriture d'artefact/budget. Prouvé par contraste base↔HEAD (§2) et par la reproduction des 5 mutants du RENDU (§3). **Mais** la forme sérialisée engagée ET l'injectivité par valeur ne sont épinglées par **AUCUN vecteur fixe** dans les tests (§3, mutants MINE-1/MINE-2 verts 58/58) — le vecteur monnaie (édition de valeur à cardinalité constante = divergence→equal) est **non testé** alors que le code, lui, le refuse. Correction **C-G2-1 bloquante au pli** (doit atterrir avant G7). Une correction non bloquante (C-G2-2, ordre `mkdirSync`). FAIL écarté : le code satisfait (f) ; ce sont les tests du livrable qui le sous-spécifient.

## Cadre de vérification (R-21, re-exécution indépendante, CA-9)
- Arbres ISOLÉS sur F: — `git archive HEAD` → `F:\tmp\g2-b3df\head\`, `git archive f459cc2` → `F:\tmp\g2-b3df\base\` ; jonction `node_modules` → `F:\Monark\node_modules` (jamais `npm ci`/`install`) ; `TEMP`/`TMP` forcés sur F: (rien sur C:) ; jamais `git checkout`/`stash`. Aucun réseau (stubs).
- **Provenance byte-exacte confirmée** : sha256 de l'arbre HEAD extrait = RENDU-G1 déclaré, **à l'identique** : `apps/bell/src/rebase-crosscheck.ts` = `2c852f0c98f9c6b90b869826ea9a04cbe78fce612b35f5a8f2bf68e8ae69fdb2`, `apps/bell/test/rebase-crosscheck.test.ts` = `299d3146a15acd2a6743f2aefdf22774e8c5c42b1eac6a0c155d9b3090f808b9`. Après tous les mutants : `sha256 -c` = OK (restauration byte-exacte, zéro mutation résiduelle) ; les deux arbres HEAD/base sont laissés SANS fichier `zz-*.test.ts` (aucune pollution d'un `npm run ci` de reproduction).
- **Artefacts de reproduction** (pour rejeu par l'orchestrateur) : `F:\tmp\g2-b3df\head-ci.log` (CI complète), `head-lint.log`, `mutants-summary.txt` (les 7 mutants + noms `not ok`), `run-mutants.sh` + `mutate.mjs` (byte-exact, base64), `pristine\head.sha256`, et `repro\zz-g2-base-blind.test.ts` / `repro\zz-itemA-e2e.test.ts` (contraste base : à copier dans `base/apps/bell/test/` pour rejeu, jamais laissés dans l'arbre).

## Résultats par item de mission

**(1) CI / lint / ratchet — [lu, exécuté]** `npm run ci` exit 0 : `gate:vocab OK (202 fichiers)`, `typecheck` 0, **699 tests / 698 pass / 0 fail / 1 skipped / 0 todo**. Le skip = `fetch_only_inside_client` (`{ skip: "until 1b…" }` inconditionnel, report FORMÉ pré-existant vers -1b, sans rapport avec -f). `ledger_format_locked_to_rebase_crosscheck` = **PASS** (52,7 ms, ne skippe pas). `npm run lint` (eslint) = **0**. `npm run lint:ratchet` = **69/69**. Conforme au RENDU.

**(2) ITEM-A : (f) ferme le vecteur (pas seulement « des tests passent ») — [exécuté, contraste base↔HEAD]**
| Plan | BASE (f459cc2) | HEAD (291d389) |
|---|---|---|
| `verifyLedgerChain` niveau fonction sur un record à `page_events` édité (entry_sha256 gardé) | **ok:true** (aveugle, « payload is NEVER hashed ») | **ok:false** (recalcule `payload_sha256` du payload relu) |
| idem `page_handoffs` injecté (bascule L-5) | **ok:true** (aveugle) | **ok:false** |
| bout-en-bout via `runMain` (setup (a) : run-1 stop budget page 1, drop Initialize, reprise) | **AUCUN refus** ; verdict bascule `equal`→`inconclusive` | **refus** `chain does not re-derive` (test 33 vert ; M-f-1/M-f-2 rouges prouvent que le test mord) |

Conclusion : sur base le payload édité est **consommé** et fait basculer le verdict sans fail-closed ; sur HEAD il est **refusé**. Le refus HEAD est **verdict-agnostique** (il refuse TOUT désaccord de payload), donc les deux directions (equal→divergence ET divergence→equal) et le vecteur L-5 (`page_handoffs`) sont fermés symétriquement.

**(3) Mutants — [exécuté, scope `apps/bell/test/rebase-crosscheck.test.ts` = 58 tests, reporter tap]**

RENDU (5) rejoués, ROUGE mesuré, **exactement conformes** :
| Mutant | source (1 occ.) | résultat mesuré |
|---|---|---|
| M-f-1 vérif. lit le champ stocké | `payload_sha256: payloadSha(r.…)` → `payload_sha256: r.payload_sha256` | **2 fail** : t31 `…committing_page_payload`, t33 `…resume_refuses_edited_payload` |
| M-f-2 helper hache events seuls | `{ page_events, page_handoffs }` → `{ page_events }` | **1 fail** : t33 (sous-cas (b) handoff) |
| M-f-3 vérif. strippe payload (core 9) | `payload_sha256: payloadSha(…)` → `payload_sha256: undefined` | **13 fail** (dont t33 au sous-cas (c) honnête + reprises honnêtes) |
| M-f-4 garde absente tolérée | `typeof r.payload_sha256 !== "string"` → `false` | **1 fail** : t32 `…refuses_missing_payload_sha` |
| refuse-always (contrôle) | `return { ok: true, … }` → `return { ok: false, … }` | **13 fail** |

Mutants de mon cru (≥4) — **le vecteur central** :
| Mutant / vecteur | mutation ou construction | résultat mesuré | signification |
|---|---|---|---|
| **MINE-1 non-injectif (cardinalité)** | helper → `{ page_events: pageEvents.length, page_handoffs }` (les DEUX côtés) | **58/58 VERT** | une édition de VALEUR à cardinalité constante n'est **pas testée** — c'est le vecteur monnaie divergence→equal |
| **MINE-2 dérive de forme (permut. de clés)** | helper → `{ page_handoffs, page_events }` (les DEUX côtés) | **58/58 VERT** | la **forme sérialisée** n'est épinglée par aucun vecteur fixe (tri/canonicalisation/renommage passeraient en silence) |
| réordonnancement de 2 records | 2 records chaînés, swap | verify **ok:false** (fil `prev` cassé) | vecteur fermé |
| `payload_sha256` FAUX + `entry_sha256` recalculé sur ce faux, `page_events` intacts | core reconstruit, `payload_sha256="0"*64`, `entry_sha256=sha(core faux)` | verify **ok:false** | fermé : le vérificateur recalcule depuis le payload (item 3) |
| **reforge complète 1 record** (payload_sha256 ET entry_sha256 rebâtis cohérents) | `chainedLedgerEntry(…, editedPE, …)` | verify **ok:true** (headSha nouveau) | = **résidu C-F-4 déclaré**, profondeur **UN record** (voir §Observation R-1) |
| idempotence `stringify∘parse∘stringify` | payload avec `null`, entier `2^53+1`, unicode, `\u2028`, surrogate isolé `\uD800`, emoji | verify **ok:true** après round-trip disque | forme idempotente confirmée |

Preuve que MINE-1/MINE-2 sont un trou de TEST et **non de code** : sur HEAD, une édition de valeur à cardinalité constante (changer `multiplier` d'un event, garder `entry_sha256`) rend `verifyLedgerChain(...).ok === false` (mesuré) — le code refuse, seul le test manque. ⇒ **PASS-AVEC-CORRECTIONS**, pas FAIL.

Valeur attendue littérale calculée pour la correction (reproductible, `sha = sha256 hex utf8`) :
`chainedLedgerEntry("0"*64, 1, [{sig:"a",slot:10},{sig:"b",slot:20}], [evB, evA] /*NON trié*/, [ho1]).payload_sha256 = f2243f755fa55d8c564017c55b92debda4a5307cc6e5e6d1b5b5607a581ab1ff` (la variante triée `[evA,evB]` donne `194133c8effde02b9e9d73febe00b76d3c4948c57851631ff7362a3ed078fd5b` — différente ⇒ un littéral épingle bien l'ordre d'ingestion).

**(4) C-F-3 : le refus précède-t-il TOUTE écriture ? — [exécuté]** Les TROIS assertions substantielles TIENNENT (mesuré après le refus (a)) : `budget.json` **byte-identique** = true ; `crosscheck-SPYx.json` **absent** ; `crosscheck-SPYx-attempt.json` **absent**. **MAIS** `candidates/SPYx/` **existe (vide, entries=[])** après le refus : `mkdirSync(candidateDir)` (`src:656`) précède `resumeFromLedger` (`src:657`) dont le refus lève à `src:583`. Rien n'est empoisonné (le refus précède tout `writeBudget`/artefact) — mais « refusée AVANT toute écriture » est littéralement faux (une création de répertoire EST une écriture). Le `mkdirSync recursive` n'est un no-op QUE si `candidates/<MINT>/` pré-existe (run-1 a écrit un candidat ET la reprise l'a copié) ; dans les sous-cas (a)/(b) du test — où seuls `ledger`+`budget` sont copiés — il CRÉE bien le dossier vide (mesuré : `exists_after_refusal = true`, `entries = []`). ⇒ **C-G2-2 non bloquante**.

**(5) Le contrôle couplé (c) + reprises honnêtes tuent « refuse toujours » — [mesuré]** refuse-always rougit **13** tests = les **9** reprises honnêtes nommées au RENDU (`runmain_resumes_budget_and_ledger`, `torn_queue_dropped_and_chain_verified`, `resume_after_decode_fault_is_not_equal`, `terminal_inconclusive_never_promotes`, `artifact_write_is_monotone`, `resume_after_exhaustion_is_equal`, `full_boundary_page_deduped_does_not_false_stop`, `short_nonfinal_page_is_not_committed`, `short_page_transient_token_heals_on_resume`) + les **4** tests -f (`from_disk` t30, `committing` t31, `refuses_missing` t32, `resume_refuses` t33). **`resume_onto_broken_chain_is_refused` (t46) reste VERT** sous refuse-always ⇒ ce n'est PAS un contrôle valable — le RENDU le déclare correctement.

**(6) Non-régression — [lu, CI]** b1b : 8 tests verts (`bell_density_*` ×6, `bell_h6_*` ×2). b1a (famille reprise/ledger/budget) : ≥15 tests verts. **Aucun** test bell rouge/`not ok` dans la CI.

**(7) Verrou de format `packages/rpc-guard/test/ledger-format-lock.test.ts:16-17` — [exécuté] : PROBANT mais ÉTROIT, non vacant.** Appelé en **3-arg périmé** (RefMod), HEAD `chainedLedgerEntry` reçoit `pageEvents/pageHandoffs = undefined` ⇒ `payload_sha256 = sha(JSON.stringify({}))` = **`44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a`** (= `sha256("{}")`, mesuré ; mode payload-vide dégénéré, jamais utilisé par le vrai writer). L'assertion (2) `sha256Hex(JSON.stringify(core)) === entry_sha256` est **auto-cohérente par construction** de bell (`{...core, entry_sha256: sha(stringify(core))}`) : elle ne peut rougir QUE sur (a) une dérive de `sha256Hex` de `@monark/rpc-guard` vs le `sha` de bell, ou (b) une dérive de la discipline « entry_sha256 = sha(stringify(rest)) ». Elle **n'épingle NI** le nombre de champs NI l'arité (elle strippe `entry_sha256` génériquement). ⇒ verrou du **primitif de chaînage**, pas du format §6. L'item formé du RENDU (#2 : synchroniser `RefMod` en 5-arg, déclencheur = prochain lot touchant `@monark/rpc-guard`, ex. GARDE-HELIUS -1d) est la **bonne disposition** — AFFIRMÉ.

**(8) Aucun autre épinglage du core à 9 champs — [grep, confirmé]** Seuls porteurs des noms de champ hors bell : `packages/rpc-guard/src/ledger.ts` (ledger de CYCLE, format DISTINCT : `CycleCore = Omit<…, "prev_entry_sha256" | "entry_sha256">`, **sans** `payload_sha256`) et le format-lock générique. Aucun test/fixture n'épingle le core bell à un nombre de champs ni un `entry_sha256`/`ledger_sha256` littéral.

**(9) R-25 — [exécuté, pathspec verbatim ci.yml:65, base f459cc2, three-dot]** `2 files changed, 144 insertions(+), 48 deletions(-)` ⇒ **CHANGED = 192** (≤ plafond 1 205). Conforme au RENDU.

**(10) Vocabulaire interdit / fixtures — [grep + gate]** Aucun mot interdit (partner/autonomous/guarantee/verified/accuracy/confidence/score) dans les lignes ajoutées ; `gate:vocab` OK (202 fichiers). Fixtures 100 % synthétiques (octets `0xaa`/`0xbb`, sigs `a`/`initSig`/`updA`, slots 10/20/30/40 ; aucune constante on-chain réelle).

## Corrections formées (liste FERMÉE)

### C-G2-1 (BLOQUANTE au pli — avant G7) — l'engagement du payload n'est épinglé par aucun vecteur fixe
- **Où** : `apps/bell/test/rebase-crosscheck.test.ts` (tests ; aucune modif de `src` — le code est correct).
- **Preuve rouge** : MINE-1 (helper → `page_events: pageEvents.length`) **58/58 vert** ; MINE-2 (helper → clés permutées) **58/58 vert**. Le vecteur monnaie (édition de valeur à cardinalité constante) est non couvert ; la forme sérialisée n'est pinnée nulle part.
- **Correctif (2 volets, chacun tue un mutant distinct)** :
  1. **Test de valeur attendue** (tue MINE-2 + MINE-1) : assertion littérale `chainedLedgerEntry(...).payload_sha256 === <sha littéral figé>` sur un payload synthétique à ≥2 events NON triés + 1 handoff (`payloadSha` est privé ⇒ épingler via le writer exporté `chainedLedgerEntry(...).payload_sha256`). Épingle la forme écrite/ordre d'ingestion ; toute canonicalisation/tri/renommage/permutation futur ⇒ littéral ≠ ⇒ rouge. **Deux façons acceptables de figer le littéral** (au choix du worker) : (A) reprendre les objets EXACTS que j'ai hachés — `evA = {kind:"initialize", multiplier:"1", multiplierBitsHex:"aa", effectiveTimestampSec:0, blockTimeSec:1000, slot:10, instructionIndex:0, signature:"a"}`, `evB = {kind:"update", multiplier:"1.5", multiplierBitsHex:"bb", effectiveTimestampSec:1500, blockTimeSec:2000, slot:20, instructionIndex:0, signature:"b"}`, `ho1 = {mint:"M", newAuthorityHex:"cc", currentAuthority:"A", slot:20, instructionIndex:1, signature:"b"}`, `txs=[{sig:"a",slot:10},{sig:"b",slot:20}]`, ordre `[evB, evA]`,`[ho1]` ⇒ littéral **`f2243f755fa55d8c564017c55b92debda4a5307cc6e5e6d1b5b5607a581ab1ff`** (mesuré ; le PIÈGE : ce hex n'est valide QUE pour CES objets — si le worker utilise le helper de fichier `ev()`/`hexOf(B_BYTES)`, les valeurs diffèrent et le hex change) ; OU (B) construire le payload à partir d'un fixture EN FICHIER, figer le littéral qui en sort **sous règle écrite** (« littéral gelé d'un fixture in-file ») — le **relecteur G2-delta re-dérive** ce littéral et refuse un hex non reproductible. Ne PAS laisser un hex nu sans son fixture.
  2. **Sous-cas (a′) valeur, via `runMain` réel** (tue MINE-1 bout-en-bout, CA-11 durci) dans `bell_crosscheck_resume_refuses_edited_payload` : éditer une VALEUR de champ dans `page_events[0]` (même cardinalité — ex. `multiplier`/`slot`/`effectiveTimestampSec`), garder `entry_sha256`, asserter `assert.rejects(runMain, /chain does not re-derive/)` + budget byte-identique + aucun artefact. Message d'assertion attendu (style du fichier) : `"(a') an edited page_events VALUE at the same cardinality is fail-closed (MINE-1 hashes cardinality only => a same-count value edit is not caught => no refusal => reds)"`.
- **error_origin** : plan G0 (n'a spécifié que des éditions STRUCTURELLES : L-f-1 « Initialize retiré » = drop de cardinalité) + checkpoint-1 (a durci (b) en bascule de handoff mais jamais (a) en édition de valeur à cardinalité constante) + worker G1 (tous les M-f-* sont drop/omit/strip, aucun n'est une édition de valeur ; pas de test de forme à valeur attendue).

### C-G2-2 (NON bloquante) — `mkdirSync(candidateDir)` précède le refus
- **Où** : `apps/bell/src/rebase-crosscheck.ts:655-657`.
- **Preuve** : `candidates/SPYx/` existe (vide) après le refus (mesuré). Les 3 assertions substantielles C-F-3 tiennent ; rien n'est empoisonné.
- **Correctif** : intervertir `src:656` (`mkdirSync(candidateDir)`) et `src:657` (`const resume = resumeFromLedger(...)`) — `candidateDir` n'est utilisé qu'en `onCandidate` (`src:676`) et `deriveCandidateShas` (`src:686`), donc le déplacer APRÈS le refus est sûr et coûte une ligne ; rend « AVANT toute écriture » littéralement vrai. Optionnel : 4ᵉ assertion aux sous-cas (a)/(b) : `assert.equal(existsSync(join(od, "candidates", "SPYx")), false)`.
- **Test/mutant** : la 4ᵉ assertion ci-dessus rougirait sur l'ordre actuel.
- **error_origin** : worker G1 (a sur-lu le périmètre fermé — « resumeFromLedger inchangé » contraint la FONCTION, pas l'ordre du site d'appel, qui est dans le même fichier -f ; disposé en simple observation au lieu d'être corrigé).

## Observations affirmées (jamais un défaut — traçabilité)
- **Résidu C-F-4 (reforge complète), frontière mesurée** : `verifyLedgerChain` accepte un record **entièrement** reforgé (payload édité, `payload_sha256` ET `entry_sha256` recalculés cohérents) car `resumeFromLedger` n'ancre `headSha` à **AUCUNE** valeur externe. Le résidu **mord dès le 1ᵉʳ record** (mesuré : un ledger à UN record, setup (a), est déjà reforgeable) **ET à toute profondeur** — une chaîne plus longue coûte à l'attaquant plus de recalcul (re-threader chaque record en aval) mais **aucune défense supplémentaire**. Donc le vecteur n'est PAS conditionné à « re-hacher toute une chaîne multi-jours avant publication » : il existe dès la première page. La question investisseur au G0-course (C-F-4, ESCALADE-INVESTISSEUR) doit être posée à cette taille réelle ; l'ancrage `headSha` vs artefact publié (un check absent de `resumeFromLedger`) est un candidat chiffrable de C-F-4. OBSERVATION, pas correction, pas défaut du lot (hors périmètre déclaré, G0 `:38`, checkpoint-1 C-F-4).
- **Item RENDU #2 (arité 3-arg du format-lock)** : correctement formé, déclencheur correct — AFFIRMÉ (§7).
- **Item RENDU #1 (mkdirSync)** : sous-disposé en simple observation ⇒ relevé en C-G2-2 non bloquante.

## Table livrable → test → mutant (rouge prouvé, sortie citée)
| Livrable | fichier:ligne | Test | Mutant tueur (résultat mesuré) |
|---|---|---|---|
| `payload_sha256` 10ᵉ champ core | `src:136`,`166` | `…committing_page_payload` (t31) | M-f-1 (t31+t33 fail) |
| helper `payloadSha` (forme écrite) | `src:151-153` | `…resume_refuses` (b) (t33) | M-f-2 (t33 fail) ; **MINE-1/MINE-2 VERTS ⇒ trou** |
| `verifyLedgerChain` recalcule + garde C-F-1 | `src:192,195,198` | `…refuses_missing_payload_sha` (t32) | M-f-4 (t32) ; M-f-3 (13 fail) |
| refus (f) à la reprise | `src:583` (throw), `resumeFromLedger` | `…resume_refuses_edited_payload` (t33) | M-f-1/2/3 ; refuse-always (13 fail) |
| audit §5 / `ledger_sha256` re-dérivé | `src:170-171` | `…rederives_from_disk` (t30) | M-f-3, refuse-always |
| **édition de valeur à cardinalité constante** | — | **ABSENT** | MINE-1 vert 58/58 ⇒ **C-G2-1** |
| **forme sérialisée (ordre/clés)** | — | **ABSENT** | MINE-2 vert 58/58 ⇒ **C-G2-1** |
| refus AVANT toute écriture | `src:656-657` | `…resume_refuses` (a)/(b) 3 assertions | C-G2-2 (4ᵉ assertion `!existsSync(candidates)`) |

## error_origin (proposé au G7)
- **C-G2-1** (forme/valeur non épinglées) : **plan G0 + checkpoint-1 + worker G1** (spéc d'éditions structurelles uniquement ; mutants tous drop/omit ; pas de test de valeur attendue). Sévérité : test-only (code correct).
- **C-G2-2** (ordre mkdirSync) : **worker G1** (sur-lecture du périmètre).
- Résidu C-F-4 : **plan -b3d / orchestrateur** (décision de valeur, correctement escaladée).

**Modèle résolu (R-1) : `claude-opus-4-8[1m]`.** R-20 : je ne committe pas ; l'orchestrateur plie/relance/G7.
