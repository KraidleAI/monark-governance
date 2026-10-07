# G0 du lot DOJO-PROBE-FOLLOWUP-1, partie 2 : un test par garde de `reportOk` (note N-2 de la G2 de #220)

RECHERCHES, 2026-10-07. Base : la tête `e6318730` de `recherches/dojo-probe-followup-1` (partie 1, N-1, N-3 et N-4 ;
`docs/G0-lot-dojo-probe-followup-1.md`), elle-même sur `1cddd2e5`. Empilée sur elle pour que les numéros de ligne des tueurs soient
ceux de la sonde après la partie 1.

red-proof: test-only

## Provenance

- Modèle : `claude-opus-5-5`, effort standard. Heure lue (`date -u`) : 2026-10-07T09:19:21Z.
- Worktree détaché neuf, branche `recherches/dojo-probe-followup-1-guards` ; `/home/user/monark-governance` n'est pas modifié.

## Constat (G2 de #220, N-2)

`reportOk` (`scripts/probe-dojo-live.mjs` l.190-191) garde un rapport de succès par `status`, `trust_root` et `detail`. Retirer
seule la garde de `status`, ou seule celle de `trust_root`, laissait les 11 tests verts : ils n'étaient tués qu'ensemble. Retirer la
garde `detail === null` laissait aussi tout vert. Aucun faux « sain » n'est possible avec le vrai vérificateur, qui écrit les trois
ensemble ; il manquait un test par garde.

## Changement (test seul)

Un bouchon `reportStub(fields)` imprime un rapport de succès sous le trousseau fourni pour l'arbre NEW, `fields` écrits par-dessus.
Trois tests, une garde chacun, l'autre garde tenue vraie : `status` `self_consistent_only` (racine de confiance fournie),
`trust_root` `served_keyring` (statut fourni), `detail` non nul. Chacun exige `verifier_refused`, sortie 0 de l'enfant, aucune raison
nommée, sortie 1 de la sonde. Le premier vérifie aussi que le bouchon intact donne `healthy`.

## Tueurs

- `dojo_live_probe_refuses_a_report_off_the_supplied_status` : scripts/probe-dojo-live.mjs:191 CONST "r.status === \"consistent_with_supplied_keyring\" && " -> ""
- `dojo_live_probe_refuses_a_report_off_the_supplied_trust_root` : scripts/probe-dojo-live.mjs:191 CONST "r.trust_root === \"supplied_keyring\" && " -> ""
- `dojo_live_probe_refuses_a_report_with_a_detail` : scripts/probe-dojo-live.mjs:191 CONST " && r.detail === null" -> ""

## Mutant équivalent

`maxBuffer: VERIFY_BOUNDS.MAX_LINE_BYTES` retiré de `runVerifier` : le défaut de Node pour `execFile` est 1 Mio, égal à
`MAX_LINE_BYTES` (1 024 × 1 024). Aucun test ne peut le distinguer tant que la borne vaut 1 Mio ; la ligne garde la borne écrite, pour
qu'un changement de `VERIFY_BOUNDS` la suive.

## Preuves (Node v24.21.0)

- `node scripts/red-proof.mjs --base e6318730 --gel <worktree> --test-only` : `red-proof OK`, 3 tests jugés, chacun épinglé par son
  tueur (rouge par assertion au gel muté), 15 inchangés. RED-PROOF.json, sha256 `892ceca3696399c4…`.
- `node --test test/probe-dojo-live.test.ts` : 18 sur 18. `tsc --noEmit` : 0. eslint, `lang:gate`, `gate:vocab`, `lint:ratchet`
  (69/69) : propres. R-25 : +31 −0 hors docs.
