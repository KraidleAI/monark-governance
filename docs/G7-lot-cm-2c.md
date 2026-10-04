# G7 du lot CM-2c : BYO-ASCII-LOOKALIKE-1 (B-10)

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md`, amendement daté « plan de CM-2 », ligne B-10 (go du fondateur « oui aux 1, 2 et 3 »). Plan : `docs/G0-lot-cm-2c.md`.
- **Base** : `2abe801` (branche `recherches/cm-2c`, posée sur `recherches/cm-2b`, elle-même sur `recherches/cm-2a` ; aucune fusionnée).
- **Statut** : G2 par une instance neuve faite (APPROUVE-AVEC-CORRECTIONS), pliée ci-dessous.

## Oracle

- `node scripts/red-proof.mjs --base 2abe801 --gel 73802b8 --repo /home/user/monark-governance --draw 6 --seed 5` : **OK**, 3 tests jugés F2P, 3 tueurs tirés, 3 tués.
- `npx tsc --noEmit`, eslint sur les fichiers changés, `gate:vocab`, `lint:ratchet` 69/69, `lang-gate` (harnais) : verts. Harnais 129/129.
- `npm test` : 1 957 tests ; échecs : `bell-served.test.ts:153` (clone superficiel), les 10 rouges attendus jusqu'à BTC-DIR-RETIRE-SURFACES-1 (CM-2b), et le test 42 d'export, qui n'échoue que sous la charge de la suite complète : seul, il passe à `36c1feb` (vérifié par RECHERCHES).
- R-25 : 194 lignes comptées contre `2abe801` au gel `73802b8` (12 fichiers, +166/−28), sous la borne locale de 547 ; 195 à `839cb6a` ; 206 au gel `52d2d18` (voir plus bas).

## Autocontrôle

- E1 à E17 de la sonde de MONARK refusés en `byo_lookalike_confusable` ; dix noms honnêtes réalistes et des clés proches décident ; les codes et messages de B-1 restent identiques (B-1 passe d'abord).
- `lang-gate` lisait « il » dans `[il1]` ; corrigé en `[l1i]`.

## G2 (instance neuve) : APPROUVE-AVEC-CORRECTIONS, pliée

- ~~381 noms honnêtes : 10 refus ; 0 collision sur 200 000 adresses aléatoires.~~ Retiré le 2026-10-04 (C-5 de MONARK) : corpus non commis, non reproductible. En tiennent lieu les mesures de la G2 de MONARK : 1 000 paires générées (graine 20261004) et 49 lignes honnêtes proches, 0 refus ; 201 001 adresses, 0 collision.
- M15 (classe non réduite dans le couple commis) désormais tué par C-3 ; M13 équivalent.
- Après la G2 : `red-proof --base 2abe801 --gel f29f153 --repo /home/user/monark-governance --draw 6 --seed 13` OK (3 jugés F2P, 3 tueurs tués) ; harnais 129/129 ; R-25 195 lignes comptées (+167/−28).
- Précisions de B-10 et résidu déclaré actés par l'amendement « (nuit, 4) » de l'ADR-CM.

## Changement servi (liste fermée)

- **B-10** : un nom BYO dont la réduction des confusables ASCII égale une classe verrouillée, un nom kata, un couple commis, ou une clé réduite commençant par `kata:`, rend 400 `byo_lookalike_confusable` (rendait 200). Description et `openapi.json` inchangés.
- **Précisions de B-10, actées par l'amendement « (nuit, 4) »** : `.` lu `-`, suites de `-` réduites et `-` de bord retirés (E8, E9) ; `4` lu `a` pour le seul préfixe `kata:` (E14). E16 (clé USDe avec `O` pour `0`) est refusée, alors que le rapport de MONARK la disait passante par conception (A6).

## Contrôle par diff de MONARK (2026-10-04) : APPROUVE-AVEC-CORRECTIONS, plié

- **Rapport** : `recherches:coordination/pieces/2026-10-04-controles-107-112/cm2c-RAPPORT.md` (sha256 `e1215864…52fa`) ; détail du pli au G0, § Contrôle par diff de MONARK.
- **Commits** : `63002e5` (tests : C-1, C-3, épingle de C-4) ; `52d2d18` (code, commentaire seulement : nom de l'item du résidu ; nombre de lignes de `gate.ts` inchangé, aucune ancre ne bouge). **Gel neuf : `52d2d18`.**
- **Tueurs (C-1, C-3)** : chaque mutation est appliquée seule, puis le test est lancé seul ; octets rétablis, sha256 contrôlé. Au gel neuf : les 5 tueurs de `gate-byo-lookalike.test.ts` et les 3 de `gate-byo-confusable.test.ts` tuent ; K14 tué aussi par C-3 ; G13, G19, G24 et C05 tués, tous par `ERR_ASSERTION`. Avec les tests de `839cb6a`, les mêmes mutations K10, K13, K14, G13, G19, G24 et C05 survivent (9 lignes sur 14 « survit », comme le mesurait MONARK).
- **red-proof** (Node v22.22.2, conteneur de RECHERCHES), première tentative, sans troncature de TAP :
  - `node scripts/red-proof.mjs --base 2abe801335e5 --gel 52d2d18f2adc --repo /home/user/monark-governance-c2c --draw 3 --seed 37` : **OK**, 3 jugés F2P (C-1, C-2, C-3), 71 inchangés, 3 tueurs tirés (`gate.ts:775`, `:754`, `:752`), 3 tués ; `RED-PROOF.json` sha256 `074be746…`.
  - Contre la base de la PR, `--base 98e3779a3a4d` (CM-2a ; le diff porte aussi CM-2b) : **OK**, 21 jugés F2P, 59 inchangés, 3 tueurs tirés (`gate.ts:822`, `:927`, `:752`), 3 tués ; sha256 `d20c2afb…`.
  - Les tests changés de `gate-byo-lookalike.test.ts` ne sont pas jugés : seul l'assistant `refused()`, hors des corps de test, change. Leur preuve est la mesure de tueurs ci-dessus.
- **R-25**, motif exact du job `r25-taille-de-lot`, à `52d2d18` : lot seul `2abe801...52d2d18` = 12 fichiers, +176/−30 = **206 ≤ 547** ; contre la base de la PR `98e3779a...52d2d18` = 16 fichiers, +620/−236 = **856 ≤ 1 205** (CM-2b empilée) ; contenu 0. Delta depuis `839cb6a` : 3 fichiers, 23 lignes.
- **Oracle local** : `tsc --noEmit`, eslint des fichiers changés, `gate:vocab` (333 fichiers), `lang-gate`, `export-public --check`, `lint:ratchet` 69/69 : verts. Harnais : 129/129. `npm test` complet (02:45Z à 03:02Z) : 1 859 tests, 46 échecs. Ils viennent de Node v22 dans ce conteneur (le dépôt vise Node 24 : `RegExp.escape is not a function`), du réseau du conteneur et des dix rouges des surfaces de MONARK de CM-2b ; aucun dans `apps/harness`. Le delta du gel ne touche que deux fichiers de test du harnais et une ligne de commentaire. La CI (Node 24) reste l'oracle de la tête.
- **Rejeu octet pour octet (ADR §6 R-1, C-6 (d))** : celui de la G2 de MONARK, 226 lignes sur HTTP, MCP et en appel direct, 0 hors classe (`cm2c-RAPPORT.md` §(1)). Le gel neuf ne change aucun octet servi : seul un commentaire change dans `src/`.

## Items

- BYO-ASCII-LOOKALIKE-1 est fermé par ce lot, pour la réduction fermée de B-10.
- **BYO-LOOKALIKE-RESIDUAL-1** (neuf, C-2) : la classe résiduelle de B-10, c'est-à-dire toute imitation ASCII hors de la réduction fermée. Exemples mesurés par MONARK : `!` pour l, 1 ou I ; 27 séparateurs autres que `+` et `~` ; `-` supprimé ; vv/w, rr/m, 3/e, 9 ou q/g, 6/b, `$`/s, v/u ; `kata` suivi d'une autre ponctuation ; `lcata:x` ; et les formes de l'amendement (nuit, 4). S'y ajoute le faux refus i/l (C-4). Propriétaire : RECHERCHES. Déclencheur : plan de CM-4. B-14 y rougit l'épingle `doge-dir-1h` et étend le faux refus i/l à tout `<actif>-dlr-<h>` : c'est attendu, pas une régression. Plus tôt : une imitation observée dans un appel BYO réel, ou rapportée par un tiers. Le rejeu de MONARK (U1 à U20, U30 à U35) mesure déjà ces formes : déclencheur non tiré, par décision motivée à l'ADR. Prix en trois remèdes : (1) squelette UTS #39 de cible ASCII, plus une table fermée des chiffres-lettres ; (2) règle de séparateurs (non-alphanumériques retirés), qui couvre aussi le `-` supprimé ; (3) préfixe `kata` plus ponctuation, qui retourne l'épingle `kata-model`. Environ 45 lignes de code et 150 de tests ; table hors R-25 en `fixtures/` ; une ligne B neuve au §5 avec go du fondateur. Inscrit à l'ADR-CM, amendement daté 2026-10-04 (2) (items ajoutés au §10).
- **BYO-HOMOGLYPH-1** (préexistant, sans ligne jusqu'ici) : homoglyphes non ASCII, refusés au servi par le schéma `^[ -~]+$` ; seul l'appel direct à `runGate` les atteint. Propriétaire : RECHERCHES. Déclencheur : tout élargissement de ce motif, ou tout consommateur de `runGate` hors des points d'entrée HTTP et MCP. Prix : squelette UTS #39 complet, avec une table de 6 712 correspondances (763 128 octets), commise en `fixtures/**/*.json` déclarée et hachée, donc hors R-25 ; environ 60 lignes de code et 80 de tests ; une ligne B neuve. Même inscription.
- **README des codes de B-1 et B-10** (C-7, critique K-9) : ce paragraphe n'est pas dans ce lot. Il va dans #110, qui réécrit `apps/harness/README.md`, ou dans la PR fusionnée en second avec #107. Propriétaire : RECHERCHES ; déclencheur : la fusion en séquence de la pile CM-2.
- **Q-1 close** (2026-10-04, 03:3x UTC) : le fondateur donne un go explicite aux précisions (1) à (4) de B-10, verbatim « Go explicite aux quatre (Recommandé) ». Ligne datée à l'ADR-CM, fin de l'amendement daté 2026-10-04 (2), posée au commit de suite de l'étape 6 de la fusion en séquence.
- **Fusion en séquence** (critique K-2, K-3) : il reste le conflit de fin d'ADR-CM avec #110 et le doublon de libellé « (nuit, 4) » avec #109. **Titre en double, résolu** (G2 du pli, B-1). L'amendement de ce pli s'intitulait « Amendement daté 2026-10-04 : … », comme celui de #110 (« 2026-10-04 : OPENAPI-ERROR-CODE-1 »). C'était une quatrième bifurcation du registre. Il est retitré « 2026-10-04 (2) … (source : recherches/cm-2c 136e029c) », selon les règles 2 et 3 du registre unique de r2 (`recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r2/AMENDEMENT-ADR-CM-r2.md` §1) : l'ordre par heure de commit (#110 à 00:12:53Z, `136e029c` à 03:03:17Z), puis la source. Le registre de r2 gagne cette ligne en 8 ; r2 passe en « 2026-10-04 (3) ». La fusion de #110 retitre le sien « 2026-10-04 (1) » ; celle de #109 retitre le sien « (nuit, 5) ». S'y ajoutent `gate-liq.test.ts` l.351-355 (tueur à 213) et les ancres de #111 (`gate.ts:883` → 927, `:211` → 212). Tout cela va à la PR fusionnée en second, et non à ce lot.

## Suite de fusion, étape 6 (2026-10-04, après la fusion de #109, `66990718`)

- **Fusion** de `base/chantier-moteur-2026-10-03` dans `recherches/cm-2c` (commit de fusion `8a14c6c2`, sans rebase). Deux conflits, ceux du plan : `gate-liq.test.ts` (les deux commentaires gardés, tueur ancré à `gate.ts:213`) ; queue de l'ADR-CM, blocs placés par heure de commit, titres et corps des parents (registre unique r3 : (nuit, 4) CM-2c, (nuit, 5) cm-3b, 2026-10-04 (1) #110, 2026-10-04 (2) CM-2c ; la (3) reste à r3).
- **Ré-ancrages** (`2aeff627`) : `error-code-sites.test.ts:34` `gate.ts:321` → `:322` ; `h5-e2e-probe.test.ts:113` et `:200` `gate.ts:883` → `:927` ; `site-build-fleet.test.ts:627` `gate.ts:211` → `:212`. `verifie-ancres.mjs` (refs base, cm-2b, cm-2a-suite, cm-2b-surfaces, cm-2c `29d059e0`, cm-3a, cm-3b) : tueurs 570, ANCRE 561, DERIVE 0, PERDU 9 (les 9 préexistants de la base).
- **Mineurs m-1 à m-4 de la G2 de la suite de #111**, pliés : m-1 `skills/monark/SKILL.md` (« served by this endpoint » ne lie plus que `stable-run-velocity-24h` ; liq nomme sa strate commise s0) ; m-2 et m-3 `docs/G7-lot-cm-2b-surfaces.md` (refs de `verifie-ancres`, unités du R-25) ; m-4 `fixtures/PROVENANCE-h5-e2e-trace.md` (l'entrée du re-pin de #110 sur sa propre ligne).
- **Q-1** : ligne datée à l'ADR-CM (fin de l'amendement 2026-10-04 (2)).
- **Oracle** : `tsc --noEmit`, `gate:vocab`, `lint:ratchet` 69/69, `lang:gate`, `eslint` (fichiers touchés et `gate.ts`) : verts. Fichiers touchés et voisins, puis `apps/harness/test/*.test.ts` avec `narabi-live` et `site-ukemi` : seuls rouges, les deux du temps (ii), `harness_served_data_matches_in_process_harness` et `narabi_gate_facts_read_from_committed_sources`. `red-proof --base 66990718 --gel 2aeff627 --draw 6 --seed 41` : OK, 3 jugés F2P, 3 tueurs tirés, 3 tués.
- **R-25** par `r25()` contre `66990718` : **220 lignes comptées** (+183/−37 ; borne 547) ; 206 à `29d059e0` contre `2abe801`, et 14 pour la suite (quatre tueurs, m-1, m-4).

## Sortie

APPROUVÉ pour fusion dans `base/chantier-moteur-2026-10-03` après CM-2a et CM-2b et le contrôle par diff de MONARK. Déploiement par MONARK, avec CM-2a et CM-2b, sous le go de l'investisseur.
