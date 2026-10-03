# G7 du lot CM-2c : BYO-ASCII-LOOKALIKE-1 (B-10)

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md`, amendement daté « plan de CM-2 », ligne B-10 (go du fondateur « oui aux 1, 2 et 3 »). Plan : `docs/G0-lot-cm-2c.md`.
- **Base** : `2abe801` (branche `recherches/cm-2c`, posée sur `recherches/cm-2b`, elle-même sur `recherches/cm-2a` ; aucune fusionnée).
- **Statut** : G2 par une instance neuve faite (APPROUVE-AVEC-CORRECTIONS), pliée ci-dessous.

## Oracle

- `node scripts/red-proof.mjs --base 2abe801 --gel 73802b8 --repo /home/user/monark-governance --draw 6 --seed 5` : **OK**, 3 tests jugés F2P, 3 tueurs tirés, 3 tués.
- `npx tsc --noEmit`, eslint sur les fichiers changés, `gate:vocab`, `lint:ratchet` 69/69, `lang-gate` (harnais) : verts. Harnais 129/129.
- `npm test` : 1 957 tests ; échecs : `bell-served.test.ts:153` (clone superficiel), les 10 rouges attendus jusqu'à BTC-DIR-RETIRE-SURFACES-1 (CM-2b), et le test 42 d'export, qui n'échoue que sous la charge de la suite complète : seul, il passe à `36c1feb` (vérifié par RECHERCHES).
- R-25 : 194 lignes comptées contre `2abe801` (12 fichiers, +166/−28), sous la borne locale de 547.

## Autocontrôle

- E1 à E17 de la sonde de MONARK refusés en `byo_lookalike_confusable` ; dix noms honnêtes réalistes et des clés proches décident ; les codes et messages de B-1 restent identiques (B-1 passe d'abord).
- `lang-gate` lisait « il » dans `[il1]` ; corrigé en `[l1i]`.

## G2 (instance neuve) : APPROUVE-AVEC-CORRECTIONS, pliée

- 381 noms honnêtes : 10 refus, tous impliqués par la règle ; 0 collision sur 200 000 adresses aléatoires.
- M15 (classe non réduite dans le couple commis) désormais tué par C-3 ; M13 équivalent.
- Après la G2 : `red-proof --base 2abe801 --gel f29f153 --repo /home/user/monark-governance --draw 6 --seed 13` OK (3 jugés F2P, 3 tueurs tués) ; harnais 129/129 ; R-25 195 lignes comptées (+167/−28).
- Précisions de B-10 et résidu déclaré actés par l'amendement « (nuit, 4) » de l'ADR-CM.

## Changement servi (liste fermée)

- **B-10** : un nom BYO dont la réduction des confusables ASCII égale une classe verrouillée, un nom kata, un couple commis, ou une clé réduite commençant par `kata:`, rend 400 `byo_lookalike_confusable` (rendait 200). Description et `openapi.json` inchangés.
- **Précisions de B-10, actées par l'amendement « (nuit, 4) »** : `.` lu `-`, suites de `-` réduites et `-` de bord retirés (E8, E9) ; `4` lu `a` pour le seul préfixe `kata:` (E14). E16 (clé USDe avec `O` pour `0`) est refusée, alors que le rapport de MONARK la disait passante par conception (A6).

## Items

- Aucun item neuf. BYO-ASCII-LOOKALIKE-1 est fermé par ce lot.

## Sortie

APPROUVÉ pour fusion dans `base/chantier-moteur-2026-10-03` après CM-2a et CM-2b et le contrôle par diff de MONARK. Déploiement par MONARK, avec CM-2a et CM-2b, sous le go de l'investisseur.
