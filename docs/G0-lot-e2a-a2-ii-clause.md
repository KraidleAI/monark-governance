# G0 du lot E-2a a2-ii : la clause d'état engagé de la description de la porte, qui suit les épingles

RECHERCHES, 2026-10-07. Base : la tête de a2-i, `d2285ee2fd36ffa252efdb508d312544864e229d` (branche `recherches/e2a-a2-i-seam`,
PR #237, elle-même sur #236 et #233). Plan : G0 court d'E-2a v6.2 (`recherches:coordination/pieces/2026-10-07-e2a-g0-v4/G0-lot-e2a-loader-wave1.md`,
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
  expression dans le G0 de a2-ii » : §1).
- **Provenance** : worker `claude-opus-5-5`, horloge lue (`date -u`) à 12:12 UTC pour ce G0. Worktree neuf du scratchpad, branche
  `recherches/e2a-a2-ii` ; `node_modules` lié en dur, retiré à la fin. Node 24.21.0, Linux.
- **Zone** : `apps/harness/src/tools/gate.ts` (l.220-240 et l.1072-1073, sur place, à nombre de lignes constant),
  `apps/harness/test/gate-kata-served.test.ts`, `test/spec-1-1-0-release.test.ts` (un import ajouté l.19, l.131),
  `docs/RUNBOOK-harness.md` (l.273-275, sur place).
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
  « ; the committed state is written for pinned and held classes that partition the kata classes, at least 2 of each ». La clause
  s'écrit au chargement (`GATE_TOOL_DESCRIPTION`, l.269) : hors domaine, `gate.ts` ne charge pas. Tout autre état demande une nouvelle
  ligne Z-3 (premier déclencheur connu : DIR-4H-DIGEST-COMMIT-1, `n = 0`).
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

## 2. Tests rouges et tueurs

| Test | Ce qu'il tient | Rouge à la base (a2-i) | Tueur |
|---|---|---|---|
| T-12 `describe_gate_kata_clause` (l.180) | épingles vides explicites (l.183) : `CLAUSE`, `[723, "022756c3…"]` ; épingles de la release des bandes (les 8 classes dir retenues, les 24 autres épinglées) : `[1465, "db773535…"]` ; la clause aux épingles servies, `kataClause()` (l.189), est dans la description, après la clause liq et avant la phrase BYO ; aucune forme `For '…'` kata | assertion : l'état engagé n'existe pas | inchangé : `apps/harness/src/tools/gate.ts:237 CONST "PRODUCED_AT_FUTURE_TOLERANCE_MS / 1000" -> "PRODUCED_AT_FUTURE_TOLERANCE_MS / 100"` |
| T-2a `kata_clause_follows_the_committed_pins` (l.387) | trois partitions (2 retenues ; les 8 des listes réelles ; 2 épinglées) : les deux côtés comptés, exactement les retenues nommées, dans l'ordre des entrées, aucune `For '…'` ; listes lues comme des ensembles (ordre et répétitions) ; sur 8 entrées, l'état engagé les compte et les nomme ; hors domaine, une levée par cas, chacune par son message : ni épinglée ni retenue, les deux à la fois, nom hors des entrées (dans chacune des deux listes), `n = 1`, `n = 0`, `m = 1` ; le produit d'abord ; la l.222 à l'octet près de ses défauts | assertion : la clause n'a qu'un état | `apps/harness/src/tools/gate.ts:239 CONST "committed.length === 0" -> "true"` |
| `kata_clause_reads_its_names_and_tau_cap` (l.361) | `render(some, 0.5, [])` (l.364), `render(undefined, undefined, [])` (l.368), type `Render` à quatre paramètres (l.173, l.362) ; l.367 (`render(some.slice(1))`, « not the product ») inchangée | vert à la base (déclaré) | inchangé : `gate.ts:232`, ligne réécrite sur le même site |
| `published_tables_are_the_served_tables_byte_for_byte` (`spec-1-1-0-release.test.ts` l.124) | le cinquième élément (§1) | vert à la base (déclaré) | inchangé : `gate.ts:217` |

## 3. Preuves

- **red-proof** : `node scripts/red-proof.mjs --base d2285ee2fd36ffa252efdb508d312544864e229d --gel HEAD --repo <worktree> --out <dossier>
  --draw 2 --seed 1007`, Node 24.21.0, Linux : « 4 judged, 36 unchanged, 2 killer(s) drawn ». Deux F2P (T-12, T-2a), rouges à la base
  par assertion ; deux tueurs tirés (`gate.ts:239`, `gate.ts:237`), deux tués. **Sortie 1, attendue et déclarée** : les deux tests dont
  le plan change le corps sans changer le comportement sont refusés, « green at base: a self-confirming test »
  (`kata_clause_reads_its_names_and_tau_cap`, `published_tables_are_the_served_tables_byte_for_byte`). Leurs tueurs, rejoués à la main au
  gel, rougissent chacun par assertion, comme ceux de T-12, de T-2a et de `kata_clause_refuses_duplicate_classes` (`gate.ts:230`).
  `RED-PROOF.json` : sha256 `ec0ed209…` (gel `bcb2cd12`, digest `667af919…`).
- **Mutants faits à la main** sur les lignes neuves (l.222, l.231 à l.234, l.239), rejoués sur `gate-kata-served`, `spec-1-1-0-release`
  et `gate-liq` : 18, tous tués. Les deux mutants des défauts de la l.222 (`committed` vide ; `held` réduit à la liste du plancher) ne
  changent aucun octet servi tant que les épingles sont vides : ils ne sont tués ici que par l'épingle de la l.222 dans T-2a, comme ceux
  de la l.1042 par T-3 (a2-i). Leur preuve de comportement est au lot a3 (T-2b, processus fils, épingles de synthèse non vides).
- **Octets** : les trois rendus de `kataClause` à ce gel, mesurés (`Buffer.from`, `createHash("sha256")`) : 723 `022756c39c3f…`,
  1 465 `db7735357a89…`, 1 409 `5c80d9187fd2…`, égaux aux trois états de la pièce Z-3 v2 et à la ligne de MONARK, en ASCII
  imprimable ; mêmes octets avec `held` inversé. L'état 2 est mesuré ici, épinglé par T-12 au lot c′ (plan, pièce §8.3). La
  description servie est inchangée (3 971 octets, `dd7287793b22…`) ; la clause remplacée par les états 1 et 2 donne 4 713 octets
  `cf2dde644db8…` et 4 657 octets `d769c86b7bcd…`, les valeurs de la pièce pour les lots c et c′, qui ne sont pas épinglées ici.
- **Suite** : harnais et surfaces servies (`harness-served`, `spec-1-1-0-release`, `surfaces-1-1-0`, `export-public` avec le test 42,
  `public-surfaces-honesty`, `spec-retire-path`, `harness-export`, `cra-b`, `runbook-retire`, `short-digest-floor`) : 388 tests, 388 verts.
- `tsc --noEmit` 0 ; `eslint .` 0 ; `gate:vocab` 0 ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint `--base d2285ee2` :
  4 fichiers, aucun risque Windows. `verifie-ancres` : fichiers touchés, 40 tueurs, 40 ancrés ; arbre entier avec `--ref d2285ee2`, 1 528
  tueurs, 1 527 ancrés, 1 dérivé (`gate.ts:232`, la ligne réécrite sur son site, voulu), 0 perdu.

## 4. Taille

- R-25, forme de la CI, contre la base de la demande (a2-i) : 3 fichiers, 61 insertions, 23 suppressions, **84** (plan : ~146 à ×2,
  190 à +30 %).

## 5. Ce qui n'est pas fait

- **Lot c′** : T-12 au troisième état (`[1409, "5c80d918…"]`). **Lots c et c′** : `gate-liq.test.ts` l.376-380, sha256 de la
  description entière (`cf2dde64…` puis `d769c86b…`, pièce §8.4) ; GATE-DESC-CLIENT-CUT-1 et KATA-CA-PUBLISHED-TABLES-1 (avant T_f(c)).
- **Lot a3** : T-2b (processus fils, épingles de synthèse non vides, deux ordres de chargement) et T-4b.
- Les quatre assertions de a2-i qui rougiront au lot c (`COMMITTED_TABLES` égal à `{}` deux fois, « every served kata table is empty »,
  `[32, 0]` ; G2 de MONARK `6fb4653`) relèvent de a2-i et du lot c : ce lot ne les touche pas. Les épingles restent vides jusqu'au lot c.
