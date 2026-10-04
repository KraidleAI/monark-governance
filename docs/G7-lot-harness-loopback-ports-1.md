# G7 du lot HARNESS-LOOPBACK-PORTS-1 : les tests du harnais sur l aide de port, garde stricte, course du port fermé

- **Plan** : `docs/G0-lot-harness-loopback-ports-1.md`. **Base** : `5803d966` (`origin/lot/etude-suite`). Branche
  `recherches/harness-loopback-ports-1`. Commits : `c1e31b21` (G0), `e8978b3e` (tests rouges), `6c0c7a44` (harnais, **gel**), puis ce G7.
- Items : HARNESS-LOOPBACK-PORTS-1, LOOPBACK-PORT0-HELPER-ONLY-1 (Q-CORR-3), LOOPBACK-CLOSEDPORT-RACE-1 (Q-CORR-7).
- Hôte : Linux, 4 cœurs, Node v24.21.0 (hors dépôt). Aucun réseau dans les tests.

## Test 6 : mesure de fréquence (faite avant tout changement, reprise du G0)

`loopback_closed_port_refuses_a_connection` (`test/loopback.test.ts` l.68). Plage éphémère de l hôte : 32768-60999.

| Montage | Essais | Échecs | Nature |
|---|---|---|---|
| corps du test rejoué en boucle dans un processus, sans charge | 1 002 000 | 16 (1,6 × 10⁻⁵) | tous `connected` avec `localPort === port`, port dans la plage éphémère |
| même boucle sous 4 boucles de brassage (port 0 + 20 `connect`) | 300 000 | 0 | — |
| le test réel, `node --test --test-name-pattern`, 4 en parallèle | 400 | 0 | — |

Cause mesurée : **auto-connexion TCP** (ouverture simultanée), le noyau prend le port fermé visé comme port source ; aucun autre
processus n a pris le port. Attendu 0,5 × 1/28 232 ≈ 1,8 × 10⁻⁵. L hôte de MONARK (Windows) n est pas mesuré. **Test 6 inchangé
dans ce lot** (Q-HL-1).

## Contenu (gel `6c0c7a44`)

| Pièce | Fichier | Changement |
|---|---|---|
| HARNESS-LOOPBACK-PORTS-1 | `apps/harness/test/server.test.ts` (5 sites), `apps/harness/test/http.test.ts` (1 site) | `startServer(0)` puis `once(server, "listening")` → `await startLoopback((port) => startServer(port))` ; hôte par défaut gardé ; import `once` retiré |
| | `apps/harness/test/helpers/loopback.ts` (neuf) | copie octet pour octet de `test/helpers/loopback.ts` (sha256 `f4e6e121…`) : `apps/harness/test/**` est exporté et tourne dans la CI exportée, `test/**` ne l est pas |
| LOOPBACK-PORT0-HELPER-ONLY-1 | `test/loopback-guard.test.ts` | `ZONE` retirée (rien d autre à recenser : `apps/sentinel`, `packages/hikae`, `packages/contracts` ne lient aucun port) ; `strays` : une liaison (`.listen(`, `startServer(`, un `--port` en chaîne) n est admise que si elle lie le paramètre d un rappel `startLoopback((p) => …(p…))` (motif à indices `d`) ; l aide et sa copie exemptes ; la copie doit être identique |
| LOOPBACK-CLOSEDPORT-RACE-1, D-2 | `test/loopback.test.ts` | la fabrique lie `port + 1` (inlinée dans `startLoopback`, plus de port fermé) ; message lu par motif, écart de 1, aucun serveur laissé ouvert (lu avant la fermeture de nettoyage) |

`apps/harness/src/**` et `test/helpers/loopback.ts` inchangés : aucun changement servi, aide au même sha.

## Tests et tueurs

### Rouges à la base par assertion (à la main ; voir « Red-proof » pour l outil)

Le fichier de garde du gel, posé sur l arbre de la base (`5803d966`, clone `--no-local`) :

| Arbre | Assertion rouge (`ERR_ASSERTION`) |
|---|---|
| base | port 0 : `apps/harness/test/http.test.ts:145`, `server.test.ts:62, 102, 175, 218, 249` |
| base + harnais du gel, `test/loopback.test.ts` de la base, sans copie | stricte : `test/loopback.test.ts:83` (le site à inliner) |
| base + harnais et `test/loopback.test.ts` du gel, sans copie | `apps/harness/test/helpers/loopback.ts is a byte copy of test/helpers/loopback.ts` |

Au commit des tests `e8978b3e`, `loopback_guard_every_bind_of_a_test_file_goes_through_the_helper` est rouge (les 6 sites du harnais),
les 9 autres de ces deux fichiers verts.

### Tueurs appliqués à la main au gel (clone du gel ; sha256 vérifié avant et après restauration)

| # | Mutation | Test(s) | Résultat |
|---|---|---|---|
| K1 | `apps/harness/src/server.ts:188 CONST "(port, host)" -> "(0, host)"` (ligne `// killer:` des 6 tests) | les 6 tests du harnais | **6/6 tués** (`ERR_ASSERTION`, refus de la postcondition) ; **à la base, 10/10 verts** : le tueur sépare base et gel |
| K2 | `http.test.ts:146` `startLoopback((port) => startServer(port))` → `startServer(0)` | parcours de la garde | tué (assertion port 0) |
| K3 | même site → `startServer(Number(process.env.P ?? 0))` (port 0 dans une expression, hors garde lexicale) | parcours de la garde | tué (assertion stricte seule) |
| K4 | copie `apps/harness/test/helpers/loopback.ts:15` `TRIES = 50` → `TRIES = 51` | parcours de la garde | tué (identité) |
| K5 | `test/loopback-guard.test.ts:41` `.filter((m) => !ok.has(m.index))` → `.filter(() => true)` | échantillons de la garde | tué |
| K6 | **M18 (reconstruit)** : `test/helpers/loopback.ts:37 CONST "bound === port" -> "true"` (postcondition retirée) | D-2 | tué |
| K7 | **M21 (reconstruit)** : `test/helpers/loopback.ts:38 SDL "server.close();"` (serveur refusé laissé ouvert) | D-2 | tué |

M18 et M21 sont nommés par l ETAT, mais leur texte est dans la G2 de LOOPBACK-PORTS-1 (`F:/tmp/rech/ports/…`), hors de ce dépôt et
de cet hôte. Je les reconstruis à partir de ce que D-2 déclare attraper (« a server returned that listens on another port … or that
server left open ») ; Q-HL-3.

D-2 au gel, 400 passages (4 en parallèle) : 400 verts.

## Red-proof

`node scripts/red-proof.mjs --base 5803d966 --gel 6c0c7a44 --repo /home/user/monark-governance-hl --draw 6 --seed 37` : **REFUSED**,
exit 1 ; 9 jugés, 11 inchangés, 0 tueur tiré ; aucune troncature de TAP (pas de reprise) ; `RED-PROOF.json` sha256 `64603d7b…`.

- Les 6 tests du harnais : « green at base: a self-confirming test » (attendu : changement de robustesse ; leur tueur K1 est valide
  pour l outil, mais l outil refuse avant tout tirage ; appliqué à la main, ci-dessus).
- Les 2 tests de la garde et D-2 : « no killer declared » (attendu : leur sujet est du code de test, qu aucun tueur de la convention
  ne peut viser ; la ligne au-dessus suit la convention du fichier, `// reddened by:`). De plus, l outil copie dans le clone de la base
  tous les fichiers du diff sous un dossier `test/` : le harnais migré y est donc présent, et la garde y est verte. Le rouge à la base
  est montré à la main (tableau ci-dessus).

## Oracle

`node scripts/oracle/run.mjs --role G1 --tree <clone propre du gel> --base 5803d966 --key harness-loopback-ports-1` (`ORACLE_ROOT` dans
le bloc-notes ; `tree.head` `6c0c7a44`, `dirty=none`) : enregistrement sha256 `6693ec97…`, **exit 1**. Portes : lint-model-pinning,
r25, lang:gate, export:check, gate:vocab, typecheck, lint, lint:ratchet vertes ; `test` : 2 023 tests, 2 001 verts, 20 sautés,
**2 échecs, tous deux hors du lot et propres à cet hôte** :

- `test/bell-served.test.ts:153` `bell_served_collector_revision_is_a_collector_commit` : objet `3bda2cad` absent du clone
  (`git cat-file`), déjà toléré au G7 de SENTINEL-SIGTERM-LOAD-1.
- `test/mutants-run.test.ts:420` `mutants_a_live_waiter_ahead_passes_first_then_the_run_goes_on` : `[143, false]` après 600 s. **Rouge
  aussi à la base** `5803d966`, seul (exit 2 sous `--test-timeout=120000`) ; seul au gel, 600 s sans fin. Lecture : le test lance le
  « waiter » par `spawn` puis bloque dans `spawnSync` ; sous Linux l enfant mort reste zombie (jamais récolté), et `alive()` de
  `scripts/oracle/lock.mjs:13` (`process.kill(pid, 0)`) le lit vivant : l outil attend sans fin. Sans objet sous Windows. Item proposé
  (Q-HL-4), aucun fichier du lot n y touche.

Les tests du lot y sont verts, dont `export_public_no_governance_no_french — clean public export (test 42)` (219 s : `npm ci && npm run ci`
dans l export, où `apps/harness/test/server.test.ts` et `http.test.ts` tournent avec la copie de l aide), les deux tests de garde et
les 10 tests du harnais touchés. Compte de tests non comparable à celui du tronc chez MONARK (2 095, autre hôte).

## R-25

`r25()` (`scripts/oracle/r25.mjs`) sur `5803d966...6c0c7a44` : STAT 106 insertions, 34 suppressions, **140** (borne du G0 : 547 ; porte
CI : 1 205) ; CONTENT 0. G0 et G7 hors compte. Dont 57 lignes de la copie de l aide.

## Écarts au plan

- Zone : `test/loopback.test.ts` touché (D-2 et le site à inliner y sont, ETAT l.396-399) ; `apps/harness/test/helpers/loopback.ts` créé.
- Ligne `// killer:` du harnais : le G0 citait `"server.listen(port, host)" -> "server.listen(0, host)"` ; la garde lexicale lit aussi les
  commentaires, ce texte la mordait (6 faux sites). Réécrite `"(port, host)" -> "(0, host)"`, même mutation, une occurrence sur la ligne.
- Test du parcours de la garde renommé (`…_no_test_file_outside_the_zone_binds_port_0` → `…_every_bind_of_a_test_file_goes_through_the_helper`) :
  la zone n existe plus.
- Garde : environ 10 lignes au lieu de 6 (l identité de la copie en plus).
- Les tueurs des tests de garde et de D-2 sont écrits en forme fermée dans la ligne `// reddened by:` du fichier, non en `// killer:` :
  l outil refuserait toute adresse sous `test/` (« test code ») ; MUTANTS-TEST-SUPPORT-1 pourra admettre ceux qui visent l aide (K6, K7).

## Questions pour MONARK

- **Q-HL-1** (test 6) : lire `connected` avec `socket.localPort === port` comme « rien n écoute » (une auto-connexion est impossible
  quand un auditeur tient le port ; 1 ligne, garde le tueur « port laissé ouvert »), ou laisser en l état (1,6 × 10⁻⁵ par passage ici) ?
- **Q-HL-2** : la copie de l aide sous le harnais, identité gardée par la garde, vous va-t-elle ? Alternatives : exporter
  `test/helpers/loopback.ts` (ligne d ADR, `scripts/export-public.mjs`) ; ou déplacer l aide sous le harnais et réexporter depuis
  `test/helpers/` (chemin cité et adresses de la table de 13 mutants changés).
- **Q-HL-3** : M18 et M21 de la G2 de LOOPBACK-PORTS-1 sont-ils bien la postcondition retirée et le `server.close()` retiré ? Sinon,
  leur texte, et je les rejoue.

- **Q-HL-4** : `mutants_a_live_waiter_ahead_passes_first_then_the_run_goes_on` pend sous Linux, base comprise (zombie lu vivant par
  `alive()`). Item à former (outil, zone MONARK) : récolter l enfant (lancer `run` en asynchrone) ou lire l état `Z` ; déclencheur :
  le prochain oracle sous Linux.

## Sortie

LIVRÉ pour contrôle par MONARK, sous réserve de Q-HL-1 à Q-HL-3. LOOPBACK-PORT0-HELPER-ONLY-1 clos au gel ; LOOPBACK-CLOSEDPORT-RACE-1
clos pour D-2, ouvert pour le test 6 (Q-HL-1). Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` laissé par `npm ci`
n est pas commis ; rien n est poussé.
