# G0 du lot DOJO-PROBE-FOLLOWUP-1, partie 2 : un test par garde de champ de `reportOk`, et la borne de la sortie du vérificateur (note N-2 de la G2 de #220)

RECHERCHES, 2026-10-07. Base : la tête `6ecf76d1` de `recherches/dojo-probe-followup-1` (partie 1 pliée de la G2 de MONARK, N-1,
N-3 et N-4 ; `docs/G0-lot-dojo-probe-followup-1.md`), elle-même sur `1cddd2e5`. Empilée sur elle pour que les numéros de ligne des
tueurs soient ceux de la sonde après la partie 1. Après la fusion de #229, ce lot est reciblé sur le tronc ; red-proof `--test-only`
est alors rejoué contre la nouvelle base, et cette ligne et le digest ci-dessous sont mis à jour.

red-proof: test-only

## Provenance

- Rédaction : `claude-opus-5-5`, effort non consigné. Heure lue (`date -u`) : 2026-10-07T09:19:21Z.
- Pli de la G2 de MONARK (message `2026-10-07-MONARK-vers-RECHERCHES-g2-229-230`, deux M et un m, et les six précisions du second m) :
  `claude-opus-5-5`, effort low (réglage de la session de pli). La tête pliée de #229 est fusionnée dans cette branche (commit de
  fusion, sans réécriture) ; les trois tests neufs sont le texte exact de la pièce `g2-230-extra-tests.ts` de MONARK.
- Worktree existant, branche `recherches/dojo-probe-followup-1-guards` ; `/home/user/monark-governance` n'est pas modifié.

## Constat (G2 de #220, N-2 ; G2 de #230)

`reportOk` (`scripts/probe-dojo-live.mjs` l.190-191) exige un objet (non nul, pas un tableau), exactement les clés fermées
`DOJO_VERIFY_REPORT_KEYS`, `ok === true`, `status` `consistent_with_supplied_keyring`, `trust_root` `supplied_keyring` et `detail`
nul. À la base de la partie 2 (`e6318730`, 15 tests), retirer seule la garde de `status`, ou seule celle de `trust_root`, laissait
les 15 tests verts : elles n'étaient tuées qu'ensemble (par `dojo_live_probe_reads_the_verifier_report`). Retirer la garde
`detail === null` laissait aussi tout vert. La G2 de #230 a montré qu'à `531695d7` deux autres gardes de champ survivaient seules :
`r.ok === true` (l.191) et l'égalité des clés fermées (l.190).

Aucun faux « sain » n'est possible avec le vrai vérificateur. `status` et `trust_root` sont écrits ensemble
(`apps/dojo/scripts/dojo-verify.mjs` l.345). `detail` vient de `source.note` (`apps/dojo/scripts/dojo-verify-cli.mjs` l.28 et l.85),
qui nomme les variables TLS présentes ; il est nul dans la sonde parce que `VERIFIER_ENV` exclut `NODE_EXTRA_CA_CERTS`,
`NODE_USE_SYSTEM_CA` et `NODE_USE_ENV_PROXY`. Un refus réel a 5 clés et `ok: false`. Il manquait un test par garde de champ.

## Changement (tests seuls)

Un bouchon `reportStub(fields)` imprime un rapport de succès sous le trousseau fourni pour l'arbre NEW, `fields` écrits par-dessus.
Cinq tests, une garde de champ chacun, les autres tenues vraies : `status` `self_consistent_only`, `trust_root` `served_keyring`,
`detail` non nul, `ok: false`, une clé de plus (`extra`). Chacun exige `verifier_refused`, sortie 0 de l'enfant, aucune raison nommée,
sortie 1 de la sonde. Le premier vérifie aussi que le bouchon intact donne `healthy`.

Un sixième test tient la borne de la sortie du vérificateur : un bouchon imprime un rapport de succès valide suivi de
`MAX_LINE_BYTES` espaces et d'une fin de ligne ; attendu `verifier_refused`, aucune sortie d'enfant lue, sortie 1.

## Tueurs

- `dojo_live_probe_refuses_a_report_off_the_supplied_status` : scripts/probe-dojo-live.mjs:191 CONST "r.status === \"consistent_with_supplied_keyring\" && " -> ""
- `dojo_live_probe_refuses_a_report_off_the_supplied_trust_root` : scripts/probe-dojo-live.mjs:191 CONST "r.trust_root === \"supplied_keyring\" && " -> ""
- `dojo_live_probe_refuses_a_report_with_a_detail` : scripts/probe-dojo-live.mjs:191 CONST " && r.detail === null" -> ""
- `dojo_live_probe_refuses_a_report_not_ok` : scripts/probe-dojo-live.mjs:191 CONST "r.ok === true && " -> ""
- `dojo_live_probe_refuses_a_report_off_its_closed_keys` : scripts/probe-dojo-live.mjs:190 CONST "Object.keys(r).sort().join() === [...DOJO_VERIFY_REPORT_KEYS].sort().join()" -> "true"
- `dojo_live_probe_bounds_the_verifier_stdout` : scripts/probe-dojo-live.mjs:184 CONST "maxBuffer: VERIFY_BOUNDS.MAX_LINE_BYTES" -> "maxBuffer: 4 * VERIFY_BOUNDS.MAX_LINE_BYTES"

Tirés à la main (fichier restauré, sha256 vérifié) : chacun ne rougit que son propre test, par assertion. Les 21 tueurs du fichier,
tirés chacun seul, rougissent chacun leur test ; `verifie-ancres` : 0 PERDU sur tout le dépôt.

## Gardes non tenues seules (déclarées)

Les trois gardes de type de `reportOk` (`r !== null`, `typeof r === "object"`, `!Array.isArray(r)`) survivent chacune retirée seule
(21 sur 21 verts). Aucune ne peut rendre un faux « sain » : un nombre, une chaîne ou un tableau n'ont pas les clés fermées, et
`Object.keys(null)` lève, ce qui donne `probe_error`. Seule la raison changerait pour `null` ; aucun test ne le tient. Le titre dit donc
« chaque garde de champ », pas « chaque garde ».

## Mutant équivalent

`maxBuffer: VERIFY_BOUNDS.MAX_LINE_BYTES` retiré de `runVerifier` : survit (21 sur 21). Le défaut de Node pour `execFile` est
`1024 * 1024` [lu par MONARK : https://nodejs.org/docs/latest-v24.x/api/child_process.html, en-tête « Node.js v24.21.0 », pièce
`g2-229-230.json`, G2 de #230, constat m] ; MONARK l'a aussi mesuré sur v24.21.0 (1 048 576 octets passent, 1 048 577 donnent
`ERR_CHILD_PROCESS_STDIO_MAXBUFFER`). `MAX_LINE_BYTES` vaut `1024 * 1024` (`apps/dojo/scripts/dojo-verify.mjs` l.44). Le retrait est
donc équivalent tant que la borne vaut 1 Mio ; la borne elle-même est maintenant tenue par `dojo_live_probe_bounds_the_verifier_stdout`
(multipliée par 4, elle rougit ce test).

## Preuves (Node v24.21.0, Linux)

- `node scripts/red-proof.mjs --base 6ecf76d1 --gel <arbre plié> --test-only` : `red-proof OK`, 6 tests jugés, chacun épinglé par son
  tueur (vert à la base et au gel, rouge par assertion au gel muté), 15 inchangés ; `refusals` vide. Le sha256 de RED-PROOF.json et le
  digest du gel dépendent de ce fichier même : ils sont donnés au corps de la PR, pour la tête poussée.
- `node --test test/probe-dojo-live.test.ts` : 22 sur 22 (21 tests et le sous-test POSIX). `tsc --noEmit` : 0. eslint, `lang:gate`,
  `gate:vocab`, `lint:ratchet` (69/69), `export:check` : propres.
- Windows : la G2 de MONARK a rejoué la partie 2 sous Windows (18 sur 18 à `531695d7`, puis les trois tests neufs) ; le rejeu de cet
  arbre plié sous Windows reste à MONARK.
