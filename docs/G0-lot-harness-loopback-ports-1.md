# G0 du lot HARNESS-LOOPBACK-PORTS-1 : les tests du harnais sur l aide de port, garde stricte, course du port fermé

- **Rattachement** : item HARNESS-LOOPBACK-PORTS-1 (colonne RECHERCHES ; `coordination/messages/2026-10-03-RECHERCHES-vers-MONARK-sentinelle-recu.md`
  point 2 : `apps/harness/test/server.test.ts` (5 sites) et `apps/harness/test/http.test.ts` passent par l aide, sans changement servi),
  avec les deux items PAROXYSME que MONARK y plie (`coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-aide-loopback-et-111.md` §2 ;
  ETAT du tronc l.394-399) : **LOOPBACK-PORT0-HELPER-ONLY-1** (Q-CORR-3) et **LOOPBACK-CLOSEDPORT-RACE-1** (Q-CORR-7).
- **Base** : `5803d966` (`origin/lot/etude-suite`, fusion de LOOPBACK-PORTS-1). Branche `recherches/harness-loopback-ports-1`,
  worktree `/home/user/monark-governance-hl`. Aide : `test/helpers/loopback.ts`, sha256 `f4e6e121…`. Garde : `test/loopback-guard.test.ts`.
  Hôte : Linux, 4 cœurs, Node v24.21.0 (hors dépôt). Aucun réseau.

## Recensement (base `5803d966`)

- Liaisons des fichiers de test, toutes formes (`.listen(`, `startServer(`, `--port`), hors la garde : 6 sites à port 0, tous dans la
  zone RECHERCHES que la garde saute (`ZONE`) : `apps/harness/test/server.test.ts` l.62, 102, 175, 218, 249 et
  `apps/harness/test/http.test.ts` l.145, chacun `startServer(0)` puis `once(server, "listening")`. `apps/sentinel/test`,
  `packages/hikae/test` et `packages/contracts/test` : aucune liaison. Hors zone : 8 sites déjà sous `startLoopback((port) => …(port))`,
  l aide elle-même (l.47) et **un site hors de l aide** : `test/loopback.test.ts` l.83 (`ignoring`, le cas D-2, qui lie un port fermé
  hors de tout `startLoopback`). C est le « 1 site à inliner » de l ETAT.
- Contrainte trouvée : `apps/harness/test/**` est exporté et tourne dans la CI exportée (`scripts/export-public.mjs` l.39-45) ; `test/**`
  ne l est pas. Un import `../../../test/helpers/loopback.ts` casserait le `tsc` et le `node --test` exportés (l en-tête de
  `server.test.ts` le dit : « no import outside the harness workspace »).

## Mesure du test 6 (avant tout changement)

Le test 6 du G1 est `loopback_closed_port_refuses_a_connection` (`test/loopback.test.ts` l.68). Plage éphémère de cet hôte :
32768-60999 (`/proc/sys/net/ipv4/ip_local_port_range`) ; un port tiré y tombe environ une fois sur deux.

| Montage | Essais | Échecs | Nature |
|---|---|---|---|
| corps du test rejoué en boucle dans un processus, sans charge | 1 002 000 | 16 (1,6 sur 100 000) | tous `connect` réussi avec `localPort === port`, port dans la plage éphémère |
| même boucle sous 4 boucles de brassage (liaison port 0 + 20 `connect` en boucle) | 300 000 | 0 | — |
| le test réel (`node --test --test-name-pattern`), 4 en parallèle | 400 | 0 | — |

Cause mesurée : une **auto-connexion TCP** (ouverture simultanée) : le noyau choisit comme port source le port fermé visé, la socket se
joint à elle-même. Aucun autre processus n a pris le port. Une auto-connexion prouve que rien n écoute (un auditeur sur `127.0.0.1:P`
interdit `P` comme port source et reçoit la connexion). Taux attendu : 0,5 × 1/28 232 ≈ 1,8 × 10⁻⁵ par passage, mesuré 1,6 × 10⁻⁵.
L hôte de MONARK (Windows) n est pas mesuré ici.

**Décision du G0 pour le test 6 : aucun changement dans ce lot.** Construction proposée à MONARK (Q-HL-1) : lire `connected` avec
`socket.localPort === port` comme « rien n écoute » (environ 1 ligne), ce qui garde le tueur « port laissé ouvert ».

## Contenu

Zone : `apps/harness/test/server.test.ts`, `apps/harness/test/http.test.ts`, **`apps/harness/test/helpers/loopback.ts` (neuf)**,
`test/loopback-guard.test.ts`, **`test/loopback.test.ts`** (le cas D-2 et le site à inliner y sont : hors de la liste de la commande,
nommé par l ETAT), ce G0 et le G7. `test/helpers/loopback.ts` et `apps/harness/src/**` inchangés : aucun changement servi.

1. **HARNESS-LOOPBACK-PORTS-1.** Les 6 sites deviennent `const server = await startLoopback((port) => startServer(port));` (hôte par
   défaut gardé : c est la propriété de `harness_binds_localhost_only`) ; `once(server, "listening")` tombe (l aide rend un serveur qui
   écoute). L aide vient d une **copie octet pour octet** `apps/harness/test/helpers/loopback.ts` (même sha256 `f4e6e121…`), exportée
   avec le paquet ; la garde exige l identité. Alternatives écartées : ajouter `test/helpers/loopback.ts` à l export (fichier hors zone,
   ligne d ADR) ; déplacer l aide sous le harnais et réexporter depuis `test/helpers/` (change le chemin cité et les adresses de la
   table de 13 mutants à rejouer à MUTANTS-TEST-SUPPORT-1). Question Q-HL-2.
2. **LOOPBACK-PORT0-HELPER-ONLY-1.** Dans la garde : `ZONE` retirée (le recensement de la zone est fait) ; une liaison (`.listen(`,
   `startServer(`, un `--port` en chaîne) n est admise que comme liaison du port qu un rappel `startLoopback((p) => …(p…))` reçoit ;
   les deux copies de l aide sont exemptes ; toute autre est un écart nommé `fichier:ligne`. Environ 6 lignes et 1 ligne d échantillons.
3. **LOOPBACK-CLOSEDPORT-RACE-1, cas D-2.** `loopback_start_refuses_a_server_off_the_drawn_port` : la fabrique lie `port + 1` (inlinée
   dans `startLoopback`), au lieu d un port fermé qu un autre processus peut prendre ; le message attendu se lit par motif (ports tirés),
   l écart vaut 1, le serveur refusé est fermé.

## Tests (rouges à la base par assertion), tueurs

- `loopback_guard_every_bind_of_a_test_file_goes_through_the_helper` (le test de parcours, renommé : la zone n existe plus) : rouge à
  la base par les 6 sites du harnais (`startServer(0)`), le site l.83 et la copie absente. Tueur (code de test, appliqué à la main) :
  `apps/harness/test/http.test.ts`, `startLoopback((port) => startServer(port))` → `startServer(0)`.
- `loopback_guard_forms_bite_port_0_and_spare_a_drawn_port` : une ligne d échantillons de la garde stricte ; vert à la base attendu
  (refus « self-confirming » de l outil attendu, tueur à la main : l exemption `startLoopback` retirée).
- `loopback_start_refuses_a_server_off_the_drawn_port` : vert à la base attendu (le cas est réécrit, non rendu rouge) ; tueurs à la
  main : M18 et M21 rejoués (voir le G7 : leur texte n est pas dans ce dépôt, ils sont reconstruits et nommés comme tels).
- Les 6 tests du harnais : verts à la base ; tueur réel sur le code servi, ligne `// killer:` au-dessus de chacun :
  `apps/harness/src/server.ts:188 CONST "server.listen(port, host)" -> "server.listen(0, host)"` (un serveur qui ignore son port :
  la postcondition de `startLoopback` le refuse). Ce tueur ne tue pas la base (port 0 partout) : il sépare base et gel.

## Taille

Attendu : copie 57 lignes, harnais ≈ 20, garde ≈ 10, test D-2 ≈ 5. Sous 547.

## Questions pour MONARK (aussi au G7)

- **Q-HL-1** : test 6, la lecture de l auto-connexion comme « rien n écoute » (1 ligne), ou laisser en l état (1,6 × 10⁻⁵ ici) ?
- **Q-HL-2** : copie de l aide sous le harnais, identité gardée par la garde, ou l une des deux alternatives ?
