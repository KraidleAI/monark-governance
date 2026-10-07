# G0 du lot DOJO-PROBE-FOLLOWUP-1, partie 2 : un test par garde de champ de `reportOk`, et la borne de la sortie du vérificateur (note N-2 de la G2 de #220)

RECHERCHES, 2026-10-07. Base : la tête de `recherches/dojo-probe-followup-1` (partie 1, N-1, N-3 et N-4, pliée de la G2 de MONARK
puis de sa G2 ciblée ; `docs/G0-lot-dojo-probe-followup-1.md`), `a9f61225` à ce pli (`6ecf76d1` au premier pli), elle-même sur
`1cddd2e5`. Empilée sur elle pour que les numéros de ligne des
tueurs soient ceux de la sonde après la partie 1. Après la fusion de #229, ce lot est reciblé sur le tronc ; red-proof `--test-only`
est alors rejoué contre la nouvelle base, et cette ligne et le digest ci-dessous sont mis à jour.

red-proof: test-only

## Provenance

- Rédaction : `claude-opus-5-5`, effort non consigné. Heure lue (`date -u`) : 2026-10-07T09:19:21Z.
- Pli de la G2 de MONARK (message `2026-10-07-MONARK-vers-RECHERCHES-g2-229-230`, deux M et un m, et les six précisions du second m) :
  `claude-opus-5-5`, effort low (réglage de la session de pli). La tête pliée de #229 est fusionnée dans cette branche (commit de
  fusion `f83e3c30`, sans réécriture) ; les trois tests neufs sont le texte exact de la pièce `g2-230-extra-tests.ts` de MONARK.
- Fusion de la tête relibellée de #229 (`5dad61fa`, décision de MONARK, (1c) → (4b)) : commit de fusion `7912c5df`, sans changement
  propre à ce lot ; `claude-opus-5-5`, effort low (défaut de l'agent, non consigné alors ; erratum 23 de l'atelier RECHERCHES). Ces
  plis à effort low sont hors du réglage des corrections (effort max) ; MONARK le consigne au JOURNAL.
- Pli de la G2 ciblée de MONARK (message `2026-10-07-MONARK-vers-RECHERCHES-g2f-229-230`, commit `f46b464` de RECHERCHES) :
  `claude-opus-5-5`, **effort max**, heure lue au départ (`date -u`) 2026-10-07T11:55:38Z. La tête pliée de #229 (`a9f61225`) est
  fusionnée ici (commit de fusion `eb5c73e6`, sans réécriture), puis un commit ordinaire ajoute le test neuf, texte exact de la pièce
  `proposed-null-test.ts` de MONARK (sha256 `325ea7ba…`).
- Worktree existant de la branche aux plis précédents, worktree détaché neuf à ce pli ; `/home/user/monark-governance` n'est pas
  modifié.

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

Un septième test (pli de la G2 ciblée, constat F3) tient la garde `r !== null` : un vérificateur qui sort 0 en imprimant le JSON
`null` reste `verifier_refused`, sortie 0 de l'enfant, aucune raison nommée, sortie 1 de la sonde ; sans la garde, `Object.keys(null)`
lève et la course finit en `probe_error`.

## Tueurs

- `dojo_live_probe_refuses_a_report_off_the_supplied_status` : scripts/probe-dojo-live.mjs:191 CONST "r.status === \"consistent_with_supplied_keyring\" && " -> ""
- `dojo_live_probe_refuses_a_report_off_the_supplied_trust_root` : scripts/probe-dojo-live.mjs:191 CONST "r.trust_root === \"supplied_keyring\" && " -> ""
- `dojo_live_probe_refuses_a_report_with_a_detail` : scripts/probe-dojo-live.mjs:191 CONST " && r.detail === null" -> ""
- `dojo_live_probe_refuses_a_report_not_ok` : scripts/probe-dojo-live.mjs:191 CONST "r.ok === true && " -> ""
- `dojo_live_probe_refuses_a_report_off_its_closed_keys` : scripts/probe-dojo-live.mjs:190 CONST "Object.keys(r).sort().join() === [...DOJO_VERIFY_REPORT_KEYS].sort().join()" -> "true"
- `dojo_live_probe_bounds_the_verifier_stdout` : scripts/probe-dojo-live.mjs:184 CONST "maxBuffer: VERIFY_BOUNDS.MAX_LINE_BYTES" -> "maxBuffer: 4 * VERIFY_BOUNDS.MAX_LINE_BYTES"
- `dojo_live_probe_refuses_a_null_report` : scripts/probe-dojo-live.mjs:190 CONST "r !== null && " -> ""

Tirés à la main (fichier restauré, sha256 vérifié) : chacun ne rougit que son propre test, par assertion ; le tueur `:190` de
`r !== null` rend `probe_error` au lieu de `verifier_refused`. Les 22 tueurs du fichier, tirés chacun seul, rougissent chacun leur
test ; `verifie-ancres` : 0 PERDU sur tout le dépôt. La ligne 190 porte `r !== null && ` une seule fois à la tête (lue après la
fusion de `a9f61225`, qui ne touche pas la sonde).

## Gardes de type : une tenue, deux équivalentes

`r !== null` est tenue par `dojo_live_probe_refuses_a_null_report` (ci-dessus) ; retirée, elle ne rendait jamais un faux « sain »,
seule la raison changeait (`probe_error`). `typeof r === "object"` et `!Array.isArray(r)` sont des mutants équivalents, non des gardes
« non tenues » (reclassement du constat F3 de la G2 ciblée) : sur tout ce que `JSON.parse` peut rendre, `Object.keys` d'un nombre, d'un
booléen, d'une chaîne ou d'un tableau n'est jamais l'ensemble des clés fermées (une chaîne et un tableau n'ont que des indices), donc
`reportOk` rend `false` avec ou sans elles. Seul un tableau portant des propriétés nommées, que `JSON.parse` ne rend jamais,
distinguerait `isArray` (rejeu de MONARK sur 13 valeurs ; rejoué ici sur 16 valeurs JSON, dont les clés fermées en tableau et
jointes en chaîne : aucune différence). Retirées chacune seule, elles laissent les 22 tests verts. Le titre dit toujours « chaque
garde de champ ».

## Mutant équivalent

`maxBuffer: VERIFY_BOUNDS.MAX_LINE_BYTES` retiré de `runVerifier` : survit (22 sur 22). Le défaut de Node pour `execFile` est
`1024 * 1024` [lu : nodejs/node, tag v24.21.0 (objet `f37d7da8`, commit `955266bf`), `doc/api/child_process.md`, blob `77db426c`,
l.365-368 (« **Default:** `1024 * 1024` »), dans la section `child_process.execFile` (l.332)] ; MONARK l'a aussi mesuré sur v24.21.0
(1 048 576 octets passent, 1 048 577 donnent
`ERR_CHILD_PROCESS_STDIO_MAXBUFFER`). `MAX_LINE_BYTES` vaut `1024 * 1024` (`apps/dojo/scripts/dojo-verify.mjs` l.44). Le retrait est
donc équivalent tant que la borne vaut 1 Mio ; la borne elle-même est maintenant tenue par `dojo_live_probe_bounds_the_verifier_stdout`
(multipliée par 4, elle rougit ce test).

## Preuves (Node v24.21.0, Linux)

- `node scripts/red-proof.mjs --base 6ecf76d1 --gel <arbre plié> --test-only` (premier pli) : `red-proof OK`, 6 tests jugés, chacun
  épinglé par son tueur (vert à la base et au gel, rouge par assertion au gel muté), 15 inchangés ; `refusals` vide.
- Pli de la G2 ciblée : `node scripts/red-proof.mjs --base a9f61225 --gel <arbre plié> --test-only` : `red-proof OK`, 7 tests jugés,
  7 épinglés (dont `dojo_live_probe_refuses_a_null_report` par `:190`), 15 inchangés ; `refusals` et `production` vides. Un premier
  passage, avant que ce fichier liste le tueur `:190`, refusait le test neuf (« its killer is not listed in the G0 ») : la règle
  tient. Digest du gel `516bef9b3f6474af…` (les `docs/**/*.md` sont hors du digest, qui ne dépend donc pas de ce fichier) ; le sha256
  de RED-PROOF.json, horodaté, change à chaque rejeu.
- `node --test test/probe-dojo-live.test.ts` : 24 sur 24 (22 tests, le sous-test POSIX et le sous-test procfs de la partie 1) ; avec
  les voisins de la partie 1 : 158 sur 158. `tsc --noEmit` : 0. eslint, `lang:gate`, `gate:vocab` (348 fichiers), `lint:ratchet`
  (69/69), `export:check` : propres. winlint : `--base a9f61225` 2 fichiers, `--base 1cddd2e5` 9 fichiers, aucun danger.
  `verifie-ancres` : « tueurs 1530 ; ANCRE 1530 ; DERIVE 0 ; PERDU 0 » (fichier : 22 sur 22).
- R-25 (forme de la CI) : +60 lignes contre `a9f61225` (53 avant ce pli) ; la pile contre `1cddd2e5` : 250 + 55 = 305.
- Windows : MONARK a rejoué `a9f24c0d` et `7912c5df` sous Windows (G2 ciblée, pièce `g2f-229-230.json`) : 21 tests réussis et le
  sous-test POSIX sauté avec sa raison ; red-proof `--test-only` OK contre `6ecf76d1`, puis contre `5dad61fa`. L'arbre de ce pli n'y a
  pas tourné ; le test neuf ne dépend d'aucune plateforme.
