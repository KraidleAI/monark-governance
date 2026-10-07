# G0 du lot E-2a a1-ii : les règles d'ensemble du lecteur des tables engagées, la ligne réservée, et le commentaire de `registry.ts`

RECHERCHES, 2026-10-07. Base : la tête de a1-i, `15fafa202a60d2fc06a80ab426bec23f5bb2722c` (branche
`recherches/e2a-a1-i-committed-pins`, sur `lot/etude-suite` = `1cddd2e5`). Plan : G0 court d'E-2a v6.1
(`recherches:coordination/pieces/2026-10-07-e2a-g0-v4/G0-lot-e2a-loader-wave1.md`), accepté par MONARK (`recherches` `51fe3ee`).

- **Demande** : second morceau du repli de a1 (plan §5.1) : « règles d'ensemble du lecteur (classe épinglée et retenue refusée, union
  = les 32 classes, ligne réservée refusée par `kataKeyReserved`) (~20) ; leurs cas de T-1 (~60) ; `registry.ts` l.15-16 (~4) » ;
  rouge à la base du morceau : « les lignes forgées sont admises par a1-i ».
- **Provenance** : worker `claude-opus-5-5`, horloge lue (`date -u`) à 09:47 UTC pour ce G0. Worktree détaché neuf du scratchpad,
  branche `recherches/e2a-a1-ii-set-checks` ; `node_modules` lié en dur, retiré à la fin. Node 24.21.0, Linux.
- **Zone** : `apps/harness/src/policy-committed.ts`, `apps/harness/src/policy-classes.ts` (fin de fichier),
  `apps/harness/src/tools/registry.ts` (l.15-16, sur place), `apps/harness/test/policy-committed.test.ts`.
- **Ordre de fusion** : après a1-i (et donc après 1f et 2a). Demande en brouillon, base `recherches/e2a-a1-i-committed-pins`.

## 1. Construction

- **`kataKeyReserved` dans le graphe servi** (plan §3.1 : « Si #225 fusionnait sans ce pli, a1 le ferait ») : #225 n'est pas au
  tronc (ouverte, tête `473023d3`). Ce lot ajoute donc en fin de `policy-classes.ts` (l.48-58) **les onze lignes de #225 à l'octet
  près** (`KATA_RESERVED_IDS`, `kataKeyReserved` ; `git diff 1cddd2e5 <tête> -- apps/harness/src/policy-classes.ts` est égal au même
  diff de #225 à `473023d3`). Les deux côtés font le même ajout au même endroit : la fusion de l'autre reste propre, tant que #225 ne
  change pas ces lignes. Si elle les change avant de fusionner, le second des deux à fusionner se rebase sur le premier.
- **`policy-committed.ts`** : import de `kataKeyReserved` seul depuis `./policy-classes.ts` (l.11) ; trois règles d'ensemble avant
  la boucle : une entrée de classe kata répétée (l.55), une classe retenue qui n'est pas une classe kata (l.56), une classe à la fois
  épinglée et retenue (l.57). Ainsi épinglées, retenues et autres classes sont exactement les classes kata (les épinglées hors des
  entrées sont déjà refusées, l.65). Dans la boucle, après `assertPolicyTableFile` : une ligne dont `kata_id` ou `venue` est réservé
  est refusée (l.68), la moitié chargeur de la réservation de `ca-probe`.
- **`tools/registry.ts` l.15-16**, réécrites sur place, sans ligne ajoutée : `schema-projection.ts` « owns a `node:fs` read at load,
  as `../policy-committed.ts` does for the committed tables » (plan §3.1, constat 17).
- **Aucun octet servi ne bouge** : le lecteur n'est toujours importé par aucun module servi ; `policy-classes.ts` est servi, mais
  ses ajouts ne sont appelés par rien de servi.

## 2. Tests rouges et tueurs

| Test | Ce qu'il tient | Rouge à la base (a1-i) | Tueur |
|---|---|---|---|
| `committed_tables_reader_refuses_pinned_held_classes` (l.90) | classe épinglée et retenue (les deux listes réelles) ; classe retenue hors des classes kata ; entrée répétée : refus nommés ; une classe de bande épinglée avec les listes réelles est admise ; les 32 classes contiennent les retenues et l'épinglée | assertion : admis | `apps/harness/src/policy-committed.ts:57 SDL "if (Object.hasOwn(pins.tables, cls))" -> ""` |
| `committed_tables_reader_refuses_reserved_rows` (l.102) | une ligne sous `kata_id` `ca-probe`, une sous `venue` `ca-probe` : refus nommés avec la clé de case ; depuis `policy-classes.ts`, le lecteur n'importe que `kataKeyReserved` ou `KATA_RESERVED_IDS` | assertion : admis | `apps/harness/src/policy-committed.ts:68 CONST "kataKeyReserved(r.kata_id, r.venue)" -> "false"` |

- Les trois tueurs du lecteur posés par a1-i sont réancrés (l.36 → l.37, l.50 → l.53, l.54 → l.61) ; rejoués à la main : tués.
- **Mutants équivalents** : balayage des lignes neuves (l.55, l.56, l.57, l.68 entière, puis chacun de ses deux arguments mis à
  `null`) : tous tués, aucun équivalent.

## 3. Preuves

- **red-proof** : `node scripts/red-proof.mjs --base 15fafa202a60d2fc06a80ab426bec23f5bb2722c --gel <tête du code> --repo <worktree>
  --out <dossier> --draw 2 --seed 1007`, Node 24.21.0, Linux : sortie 0, « 2 judged, 4 unchanged, 2 killer(s) drawn », deux F2P
  (rouges à la base par assertion), deux tueurs tués.
- **Octets servis inchangés** : suite du harnais et tests des surfaces servies (comme a1-i) : 354 tests, 354 verts.
- `tsc --noEmit` 0 ; `eslint .` 0 ; `gate:vocab` 0 ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `export:check` 0 ; winlint `--base
  15fafa20` : 4 fichiers, aucun risque Windows.

## 4. Taille

- R-25, forme de la CI, contre la base de la demande (a1-i) : 4 fichiers, 49 insertions, 6 suppressions, **55** (plan : ~168). a1
  entier (a1-i + a1-ii) contre le tronc : 236.

## 5. Ce qui n'est pas fait

- La couture et la clause d'état engagé : lots a2 et a3. Les épingles restent vides jusqu'au lot c.
