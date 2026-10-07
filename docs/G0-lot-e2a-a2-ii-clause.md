# G0 du lot E-2a a2-ii : la clause d'état engagé de la description de la porte, qui suit les épingles

RECHERCHES, 2026-10-07. Base : la tête de a2-i, `f09336044b711f534632cbcba0b0313d06a159b9` (branche `recherches/e2a-a2-i-seam`,
PR #237, elle-même sur #236 et #233), fusionnée dans cette branche par « Merge the a2-i changes » (`7becd5f6`, sans conflit) ; le lot a
été construit sur la tête précédente, `d2285ee2`, et ses preuves sont rejouées sur la nouvelle (§3, §4). Plan : G0 court d'E-2a v6.2 (`recherches:coordination/pieces/2026-10-07-e2a-g0-v4/G0-lot-e2a-loader-wave1.md`,
`88dbcb3`), accepté par MONARK. Texte : pièce Z-3 v2 (`recherches:coordination/pieces/2026-10-07-z3-committed-clause/Z3-COMMITTED-CLAUSE.md`,
`88dbcb3`), figé par la ligne Z-3 de MONARK (`recherches` `267e11d`, message `…-z3-ligne.md`).

- **Demande** : second morceau du repli de a2 (plan §5.1) : « a2-ii (la clause) : `kataClause` à deux états (~7), T-2 en processus
  (~40), T-12 (~20), `kata_clause_reads_its_names_and_tau_cap` (~2), `spec-1-1-0-release.test.ts` l.130 (cinquième élément seul,
  ~4) » ; rouge à la base du morceau : « la clause n'a qu'un état ». Plus les plis que la pièce Z-3 v2 met en a2-ii (§6, §8.4), lignes
  à `d2285ee2` : `gate-kata-served.test.ts` l.182 contre `kataClause()`, l.362 en `render(undefined, undefined, [])`, l.356 à quatre
  paramètres ; `gate.ts` l.1072-1073 réécrites sur place. Et la note `docs/RUNBOOK-harness.md` vers l.273 (message de RECHERCHES
  `…-e2a-a2-i-237.md` l.57-58, `1f8f9fc` ; « noté pour a2-ii » par MONARK, `…-cm5-v6-2-237.md` l.12, `648f88d`) : le plan ne la nomme pas.
- **Décisions de MONARK suivies** : contrôle `612ab96` (choix 1 à 5 retenus ; le domaine est une partition des ensembles, contrôlé après
  le produit, l.230 ; T-2a gagne quatre cas, chacun avec sa levée nommée) ; ligne Z-3 `267e11d` (le gabarit et ses trois rendus figés :
  723 `022756c3…`, 1 465 `db773535…`, 1 409 `5c80d918…` ; « a2-ii peut partir maintenant sur ces octets ») ; lecture du cinquième
  élément (pièce `z3-check.json` de `612ab96`, `replayed[10]` : « compte servi si la classe est épinglée, 0 sinon », « à écrire en
  expression dans le G0 de a2-ii » : §1) ; G2 second tour de MONARK, `dd734ea` (message `…-g2-chaine-r2.md`, sections « a2-i (#237)
  et a2-ii (#238) : le plan d a3 est re-décidé » et « Les m de #238 » ; pièce `pieces/2026-10-07-g2-chaine-r2/g2-238.json` : un M, quatre
  m), pliée le 2026-10-07 (§1, §2, §3, §5).
- **Provenance** : worker `claude-opus-5-5`, horloge lue (`date -u`) à 12:12 UTC pour ce G0, puis à 12:46 UTC après la fusion des plis
  de #237 (G2 de MONARK `6fb4653` : épingle des l.1074-1075 dans T-3, l.279-280 de T-3 réécrites). Worktree neuf du scratchpad, branche
  `recherches/e2a-a2-ii` ; `node_modules` lié en dur, retiré à la fin. Node 24.21.0, Linux.
- **Provenance du pli de la G2 second tour** : worker `claude-opus-5-5`, effort: max ; horloge lue (`date -u`) à 14:07 UTC au début,
  à 14:22 UTC pour ce G0. #237 n'a pas bougé (`git ls-remote` : `f0933604`), aucune fusion. Worktree détaché du scratchpad, repris
  propre à `10f97f8c` ; `node_modules` lié en dur, retiré à la fin ; mesures des cas d'a3 dans une archive de `c7d56e66`, jamais dans un
  worktree. Node 24.21.0, Linux.
- **Zone** : `apps/harness/src/tools/gate.ts` (l.220-240 et l.1072-1073, sur place, à nombre de lignes constant),
  `apps/harness/test/gate-kata-served.test.ts`, `test/spec-1-1-0-release.test.ts` (un import ajouté l.19, l.131),
  `docs/RUNBOOK-harness.md` (l.270 et l.273-275, sur place).
- **Ordre de fusion** : après a2-i. Demande en brouillon, base `recherches/e2a-a2-i-seam`.

## 1. Construction

- **`kataClause(entries, tauCap, committed = Object.keys(COMMITTED_TABLES), held = [...FLOOR_HELD_CLASSES, ...ORDER_HELD_CLASSES])`**
  (l.222-240 : 19 lignes, comme à la base ; aucune ligne de `gate.ts` ne bouge après l.240). Sans classe épinglée, l'état d'aujourd'hui,
  à l'octet (l.239). Sinon le gabarit Z-3 : la tête commune (l.232), « Of the {N}, {n} hold no committed calibration row ({retenues}) … »
  (l.239), la phrase des classes épinglées (l.234), puis la queue commune « A kata call carries … » (l.235-238 : mêmes expressions, l.236
  et l.237 inchangées). Les retenues sont nommées dans l'ordre des entrées (`h`, l.231) ; les deux listes sont lues comme des ensembles.
- **Domaine** (l.231 et l.233), contrôlé **après** le produit (l.230), et seulement si une classe est épinglée : les classes épinglées
  et retenues partitionnent les classes des entrées, au moins 2 de chaque. Hors domaine, `kataClause` lève, une levée nommée par cas, dans
  cet ordre : `not a kata class: <noms>` (un nom de l'une des deux listes hors des entrées), `both pinned and held: <classes>`,
  `neither pinned nor held: <classes>`, `fewer than 2 held classes: <n>`, `fewer than 2 pinned classes: <m>` ; chaque message finit par
  « ; the committed state is written for pinned and held classes that partition the kata classes, at least 2 of each ». L'ordre et le
  suffixe sont tenus par le cas « deux conditions » de T-2a (l.410 ; pli de la G2 second tour). La clause s'écrit au chargement
  (`GATE_TOOL_DESCRIPTION`, l.269, par l'appel de la l.254, épinglé à l'octet par T-2a, l.414) : hors domaine, `gate.ts` ne charge pas,
  avant le lecteur et le fil-piège de la l.1042. Tout autre état demande une nouvelle ligne Z-3 (premier déclencheur connu :
  DIR-4H-DIGEST-COMMIT-1, `n = 0`).
- **Les défauts** lisent les épingles servies (`COMMITTED_TABLES`, vide) et les deux listes retenues, déjà importées en fin de fichier
  par a2-i (l.1074-1075 : liaisons importées, aucune ligne ajoutée, aucun cycle neuf). La description servie ne change pas (3 971
  octets, `dd728779…`) ; `kata_path_and_server_load_cold` reste vert dans les deux ordres de chargement.
- **l.1072-1073** réécrites sur place : les épingles sont lues à la l.1042, « the pins also by the defaults of kataClause (line 222) ».
  Le commentaire l.220-221 est réécrit sur place.
- **Cinquième élément** (`spec-1-1-0-release.test.ts` l.131, l.130 à la base) : `Array<number>(32).fill(0)` devient
  `SERVED_POLICY_TABLES.filter((t) => t.table.class.cell_key_rule === "kata-bucket").map((t) => (Object.hasOwn(COMMITTED_TABLES,
  t.task_class) ? t.table.rows.length : 0))` ; les cinq autres éléments ne bougent pas. Il vaut `fill(0)` à épingles vides et reste vrai
  au lot c sans retouche ; il ne tient rien de plus que `kataTablesMatchPins` (`612ab96`). L'import de `COMMITTED_TABLES` (l.19) descend
  d'une ligne la suite du fichier ; aucune ancre de tueur ne vise ce fichier.
- **`RUNBOOK-harness.md` l.273-275**, sur place : « behind a tripwire that fails the load on any kata row outside the pins, hence on the
  first one while no table is pinned ». Les ancres des tueurs de ce fichier (l.186, l.214, l.300, l.366, l.399) ne bougent pas.
  **Pli de la G2 second tour** : l'en-tête du bloc (l.270) disait l'état à `07b7fc20` et `c318aa54`, où la l.1042 appelait encore
  `kataTablesHoldNoRow` ; il est redaté sur place, « State at `10f97f8c`, the tripwire on the pins since `f0933604` ». Chaque puce du
  bloc est relue à `10f97f8c` : `kata-path.ts` l.115-120 et l.122-129, `gate.ts` l.1042 et l.873-875, `spec-publish.mjs` l.288-297,
  `spec-policy-tables.mjs` l.173 ; aucun module servi n'importe `policy-guard.ts`.

## 2. Tests rouges et tueurs

| Test | Ce qu'il tient | Rouge à la base (a2-i) | Tueur |
|---|---|---|---|
| T-12 `describe_gate_kata_clause` (l.180) | épingles vides explicites (l.183) : `CLAUSE`, `[723, "022756c3…"]` ; épingles de la release des bandes (les 8 classes dir retenues, les 24 autres épinglées) : `[1465, "db773535…"]` ; la clause aux épingles servies, `kataClause()` (l.189), est dans la description, après la clause liq et avant la phrase BYO ; aucune forme `For '…'` kata | assertion : l'état engagé n'existe pas | inchangé : `apps/harness/src/tools/gate.ts:237 CONST "PRODUCED_AT_FUTURE_TOLERANCE_MS / 1000" -> "PRODUCED_AT_FUTURE_TOLERANCE_MS / 100"` |
| T-2a `kata_clause_follows_the_committed_pins` (l.389) | trois partitions (2 retenues ; les 8 des listes réelles ; 2 épinglées) : les deux côtés comptés, exactement les retenues nommées, dans l'ordre des entrées, aucune `For '…'` ; listes lues comme des ensembles (ordre et répétitions) ; sur 8 entrées, l'état engagé les compte et les nomme ; hors domaine, une levée par cas, chacune par son message : ni épinglée ni retenue, les deux à la fois, nom hors des entrées (dans chacune des deux listes), `n = 1`, `n = 0`, `m = 1` ; **deux conditions violées à la fois (un nom hors des entrées et une classe épinglée et retenue) : la première dans l'ordre lève, message entier jusqu'au suffixe (l.410)** ; le produit d'abord ; la l.222 à l'octet près de ses défauts ; **la l.254, l'appel de la clause par la description, à l'octet, indentation comprise (l.414)** | assertion : la clause n'a qu'un état | `apps/harness/src/tools/gate.ts:239 CONST "committed.length === 0" -> "true"` |
| `kata_clause_reads_its_names_and_tau_cap` (l.361) | `render(some, 0.5, [])` (l.364), `render(undefined, undefined, [])` (l.368), type `Render` à quatre paramètres (l.173, l.362) ; l.367 (`render(some.slice(1))`, « not the product ») inchangée | vert à la base (déclaré) | inchangé : `gate.ts:232`, ligne réécrite sur le même site |
| `published_tables_are_the_served_tables_byte_for_byte` (`spec-1-1-0-release.test.ts` l.124) | le cinquième élément (§1) | vert à la base (déclaré) | inchangé : `gate.ts:217` |

## 3. Preuves

- **red-proof** : `node scripts/red-proof.mjs --base f09336044b711f534632cbcba0b0313d06a159b9 --gel HEAD --repo <worktree> --out <dossier>
  --draw 2 --seed 1007`, Node 24.21.0, Linux : « 4 judged, 36 unchanged, 2 killer(s) drawn ». Deux F2P (T-12, T-2a), rouges à la base
  par assertion ; deux tueurs tirés (`gate.ts:239`, `gate.ts:237`), deux tués. **Sortie 1, attendue et déclarée** : les deux tests dont
  le plan change le corps sans changer le comportement sont refusés, « green at base: a self-confirming test »
  (`kata_clause_reads_its_names_and_tau_cap`, `published_tables_are_the_served_tables_byte_for_byte`). Leurs tueurs, rejoués à la main au
  gel, rougissent chacun par assertion, comme ceux de T-12, de T-2a et de `kata_clause_refuses_duplicate_classes` (`gate.ts:230`).
  `RED-PROOF.json` : sha256 `eef1fea9…` (gel `7becd5f6`, digest `86ba00ff…`). Même verdict à la base précédente, `d2285ee2`
  (gel `bcb2cd12`, `RED-PROOF.json` `ec0ed209…`). **Rejoué au pli de la G2 second tour**, `--gel c7d56e66c0f10b036a7e98f02c2396363fd0c606`
  (le commit du test ; les docs sont hors du digest) : même verdict, mêmes F2P, mêmes refus déclarés, `gate.ts:239` et `gate.ts:237`
  tirés et tués ; digest de gel `46cab374…`, `RED-PROOF.json` `9dd9142d…`.
- **Mutants faits à la main** sur les lignes neuves (l.222, l.231 à l.234, l.239), rejoués sur `gate-kata-served`, `spec-1-1-0-release`
  et `gate-liq` : 18, tous tués. **Pli de la G2 second tour** : trois mutants de MONARK survivaient à `10f97f8c` (rejoués ici sur
  `gate-kata-served`, `spec-1-1-0-release`, `gate-liq`, `gate`, `gate-cm2b` et `harness-served` : 117 tests, 117 verts sous chacun) :
  M9 de la G2 second tour (l.233), qui échange les entrées `out` et `both`, M10 (« the committed state is written for » → « the state is written for ») et
  M17 (l.254, `${kataClause()} ` → `${kataClause(undefined, undefined, [])} `). À `c7d56e66`, chacun rougit T-2a, 116 verts sur 117, par
  l'assertion neuve qui le vise : le cas « deux conditions » (l.410) pour ces M9 et M10, l'épingle de la l.254 (l.414) pour M17. Les mutants
  des défauts de la l.222 (M15 : `committed` vide ; M16 : `held` réduit à la liste du plancher) et M17 ne changent aucun octet servi
  tant que les épingles sont vides : ils ne sont tués ici que par les épingles à l'octet des l.222 et l.254 dans T-2a, comme ceux de la
  l.1042 par T-3 (a2-i). **Leur preuve de comportement est au lot a3, sous une partition complète des 32** (décision de MONARK, §5) :
  depuis que la clause lève au chargement hors de son domaine, des épingles partielles ne chargent plus. Mesuré dans une archive de
  `c7d56e66`, épingles et listes retenues écrites par cas, 24 tables de bande de synthèse (graine 53), trois ordres de chargement : la
  tête sert `cf2dde64…` ; sous M15 et M17, l'état 0 (3 971 octets, `dd728779…`) ; M16 lève à la clause (« neither pinned nor held:
  btc-dir-1h, eth-dir-1h, bnb-dir-1h, sol-dir-1h ») ; à l'état 2 (28 épinglées), M16 charge avec les octets de la tête.
- **Octets** : les trois rendus de `kataClause` à ce gel, mesurés (`Buffer.from`, `createHash("sha256")`) : 723 `022756c39c3f…`,
  1 465 `db7735357a89…`, 1 409 `5c80d9187fd2…`, égaux aux trois états de la pièce Z-3 v2 et à la ligne de MONARK, en ASCII
  imprimable ; mêmes octets avec `held` inversé. L'état 2 est mesuré ici, épinglé par T-12 au lot c′ (plan, pièce §8.3). La
  description servie est inchangée (3 971 octets, `dd7287793b22…`) ; la clause remplacée par les états 1 et 2 donne 4 713 octets
  `cf2dde644db8…` et 4 657 octets `d769c86b7bcd…`, les valeurs de la pièce pour les lots c et c′, qui ne sont pas épinglées ici.
- **Suite** : harnais et surfaces servies (`harness-served`, `spec-1-1-0-release`, `surfaces-1-1-0`, `export-public` avec le test 42,
  `public-surfaces-honesty`, `spec-retire-path`, `harness-export`, `cra-b`, `runbook-retire`, `short-digest-floor`) : 388 tests, 388 verts ;
  rejouée au pli de la G2 second tour (le test de `c7d56e66` et l'en-tête redaté du RUNBOOK) : 388 sur 388.
- `tsc --noEmit` 0 ; `eslint .` 0 ; `gate:vocab` 0 ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint `--base f0933604` :
  5 fichiers, aucun risque Windows. `verifie-ancres` : fichiers touchés, 40 tueurs, 40 ancrés ; arbre entier avec `--ref f0933604`, 1 528
  tueurs, 1 527 ancrés, 1 dérivé (`gate.ts:232`, la ligne réécrite sur son site, voulu), 0 perdu. Les mêmes valeurs à `d2285ee2`, et
  à `c7d56e66` (pli de la G2 second tour ; sans `--ref`, 1 528 sur 1 528 ; winlint, 5 fichiers, aucun risque).

## 4. Taille

- R-25, forme de la CI, contre la base de la demande (a2-i, `f0933604`) : 3 fichiers, 61 insertions, 23 suppressions, **84** (plan :
  ~146 à ×2, 190 à +30 %) ; la CI de #238 compte 84 à `d2285ee2`. **Au pli de la G2 second tour** (`c7d56e66`) : 3 fichiers,
  65 insertions, 23 suppressions, **88**.

## 5. Ce qui n'est pas fait

- **Lot c′** : T-12 au troisième état (`[1409, "5c80d918…"]`). **Lots c et c′** : `gate-liq.test.ts` l.376-380, sha256 de la
  description entière (`cf2dde64…` puis `d769c86b…`, pièce §8.4) ; GATE-DESC-CLIENT-CUT-1 et KATA-CA-PUBLISHED-TABLES-1 (avant T_f(c)).
- **Lot a3** : T-2b (processus fils, épingles de synthèse non vides ; depuis la G2 second tour, une partition complète des 32 et trois
  ordres de chargement, ligne datée ci-dessous) et T-4b.
- Les quatre assertions de a2-i qui rougiraient au lot c (G2 de MONARK `6fb4653`) ne sont pas touchées ici : les deux de T-3 sont pliées
  par #237 (`41ba62fd`, fusionné ici) ; les deux du test de l'invariant (`COMMITTED_TABLES` égal à `{}`, `[32, 0]`, l.313 et l.316)
  restent, réécrites au lot c. Les épingles restent vides jusqu'au lot c.
- **Ligne datée 2026-10-07 (G2 second tour de MONARK, `dd734ea`, constat M ; décision de MONARK pour le plan E-2a l.299 et l.301, posée
  au plan par `recherches` `f93dd857`)** : depuis que la clause lève au chargement (l.233, par `describeGate` l.254 depuis
  `GATE_TOOL_DESCRIPTION` l.269, avant le lecteur et le fil-piège de la l.1042), les cas enfants d'a3 tels que planifiés ne chargent plus :
  T-4b « classe retenue épinglée » meurt sur « kata clause: both pinned and held: btc-dir-1h », et des épingles partielles sur « kata
  clause: neither pinned nor held: … ». Le code de #238 n'est pas en cause (décision Z-3). Décision : (1) tout cas enfant d'a3 épingle une
  partition complète des 32, 24 tables de bande de synthèse projetées de `syntheticRegistry` avec les 8 retenues (état 1) ou 28 avec 4
  (état 2) ; ils chargent dans les trois ordres et servent `cf2dde64…` ; M7 y est tué par le fil-piège ; (2) le module d'épingles de
  synthèse du fils porte ses propres listes retenues, écrites par le test, jamais lues dans `policy-committed-pins.ts` ; (3) le cas
  « classe retenue épinglée » attend la levée de la clause, « kata clause: both pinned and held: btc-dir-1h », qui tue X1 ; (4) pour tuer
  M8 par comportement, un cas enfant à épingles vides, avec un nom non kata dans une liste retenue, que le lecteur refuse en l.56 ; (5) §3
  et le « Not verified » de la demande en tirent la conséquence. Rejoué ici dans une archive de `c7d56e66` (neuf cas, dont l'état
  d'aujourd'hui ; la tête, M7, M8, M9 d'a2-i (l.1042, G0 a2-i l.94), X1 et le miroir, puis M15, M16 et M17 sur trois cas ; trois ordres de chargement, chaque fois
  égaux) : (1) la tête sert 4 713 octets `cf2dde64…` (état 1) et 4 657 octets `d769c86b…` (état 2) ; M7 lève au fil-piège
  (`kata-path.ts` l.127) ; (3) la tête lève « kata clause: both pinned and held: btc-dir-1h; the committed state is written for … » à la
  l.233, comme M7, M8, M9 d'a2-i (l.1042, G0 a2-i l.94) et le miroir des l.1074-1075 ; X1 lève « neither pinned nor held: eth-dir-1h, bnb-dir-1h, sol-dir-1h » ;
  (4) épingles vides et `btc-dir-15m` dans une liste retenue : la tête lève au lecteur (« MONARK committed tables: btc-dir-15m: a held
  class that is not a kata class. »), M7 et M8 chargent (`dd728779…`). En option (G2 de #237, `g2f2-237.json`), au plan seulement : un
  second cas sur `eth-dir-4h`, retenue par le plancher, qui tue le miroir.
- **Ligne datée 2026-10-07 (même G2, constat m : ce qui bouge aux lots c et c′ ; posée au plan l.138 et l.141, `f93dd857`)** : outre
  `gate-liq.test.ts` l.376-380, bougent aux lots c et c′ : la trace H5, à réenregistrer avec ses épingles (`test/h5-e2e-probe.test.ts`
  l.85, `test/harness-served.test.ts` l.60, `fixtures/PROVENANCE-h5-e2e-trace.md` l.80, et `apps/site/data/manifest.sha256.json` l.15
  comme au précédent `672bdd7c`), sans quoi `probe_harness_records_real_decision` rougit ; l'empreinte de `/openapi.json`, aujourd'hui
  29 643 octets `61c9df97…`, **30 385 octets `5c51d187…` au lot c** et **30 329 octets `aa91aea9…` au lot c′** (mesurées ici par
  `GET /openapi.json` sous les épingles de synthèse, égales à la pièce de MONARK), à reporter dans la note de version ; les quatre tests de
  `harness-served` (`harness_served_data_matches_in_process_harness`, `harness_pending_sync_writes_in_process_shapes`,
  `pending_bodies_are_pinned_byte_for_byte`) et de `narabi-live` (`narabi_gate_facts_read_from_committed_sources`, l.586), couverts par
  `harness-pending.json` et les actes de c-ii, puis de c′-ii. Ces valeurs supposent `describeGate` inchangée : GATE-DESC-CLIENT-CUT-1 les
  déplacera.
- **Ligne datée 2026-10-07 (même G2, constat m : RUNBOOK)** : l'en-tête du bloc d'état de `docs/RUNBOOK-harness.md` (l.270) est redaté
  sur place (§1) ; le paragraphe l.273-275 (« The 32 kata tables are served with no row ») devient faux à la première table épinglée : il
  est nommé au contenu du lot c (plan l.138, `f93dd857`).
