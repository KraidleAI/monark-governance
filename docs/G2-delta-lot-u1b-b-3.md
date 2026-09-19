# G2 delta bornée — lot U-1b-b (pli U-1b-b-3), delta `a049cd3→cba115f`

**Relecteur G2** : `claude-opus-4-8[1m]` (modèle résolu tel quel, préfixe `claude-opus-4-8` vérifié — R-1), instance séparée, contexte frais, effort max. 2026-09-19.
**Rejeu** : `git archive cba115f` → `F:\tmp\g2d-u1bb3\repo` (mutants isolés ; `node_modules/@monark/*`→jonctions vers la copie, offline). `git clone --no-hardlinks F:\Monark-wt-u1bb` → `F:\tmp\g2d-u1bb3\clone` (CI complet — `.git` requis : `scripts/release-public.mjs` l.176-177 `git rev-parse`/`git status --porcelain`, joué par `test/release-public.test.ts`) ; son `node_modules` = **jonction vers le worktree** (liens `@monark/*`→worktree), valide car arbre byte-identique à cba115f (HEAD, porcelain 0, sha adapter) et **aucune mutation en phase CI**. `TEMP=TMP=TMPDIR=F:/tmp`, Node v24.15.0, un seul oracle à la fois, rien sur C:. R-20 : worktree jamais modifié.

## VERDICT : CONFORME
**Corrections exigées (liste fermée) : néant.** Les deux observations worker (6) sont laissées au G7, formées avec `error_origin`.

## Vérifications (mesurées, reproductibles)
1. **Delta = 2 fichiers** — `git diff --numstat a049cd3 cba115f` = `1 0 packages/monark/test/adapter-book.test.ts` + `29 1 docs/PLI-lot-u1b-b.md` (rien d'autre). La modif PLI porte **C-V2** (§7 l.103 : « accepter 587 (590 au candidat a049cd3, 591 après C-V1) », ex-« 589 ») + l'annexe 3. `adapter-book.ts` sha256(LF) = `b9816d33…855c`, IDENTIQUE à a049cd3 et cba115f. Zone gelée : `git diff --stat lot/etude-suite cba115f -- schemas/ packages/contracts/src/` = **vide** ; schéma signé `8ba71122…5c32b` et manifest `d50f5c51…d99066` intacts. ✓
2. **Ligne ajoutée** — insérée après `const book = toAttestedBook(result, bookCtx())` et **AVANT** `const out = expectBook(…)` : `assert.equal(serializeAttestedBook(book), FIXTURE.trim(), "C-V1: …locks every copied field")`. `FIXTURE = readFileSync(join(HERE,"fixtures","attested-book-weth.json"),"utf8")` (l.35) = **lue sur disque**, pas une constante recopiée ; `serializeAttestedBook` importé de `@monark/contracts`. ✓
3. **Mutants** (copie archive, `@monark`→copie, reporter TAP, test isolé ; baseline saine 8/8) — chacun : `ok=7`, `# fail 1`, unique `not ok = attested_book_composition`, échec porté par l'assertion **C-V1**, restauration byte-exact `b9816d33…855c` :
   - MV3 `n_positions +1` (l.252) → mut `c69febe98743` ; MV4 `cluster.toUpperCase()` (l.246) → `5c89fc46e26c` ; MV5 `debt_base "1"` (l.253) → `b41c13e247ee`.
   - **Mutant de mon cru** MX : `oracle_sources[].source + "z"` (champ copié imbriqué, longueur array inchangée=3) → mut `105338e87e0b`, rouge (C-V1). **Mesuré** : MX contre le test a049cd3 (sans C-V1) = **8/8 vert** ⇒ tué **uniquement** par C-V1 (aucun assert pré-C-V1 ne couvre le contenu d'`oracle_sources`).
   - **Portance** : MV3 rejoué contre le test `a049cd3` (sans C-V1) = **8/8 vert (survit)** ⇒ la ligne +1 est portante. ✓
4. **Oracles** (clone) — `npm run ci` : `gate:vocab OK` (167), `tsc` OK, **tests 389 / pass 389 / fail 0** ; `lint` 0 ; `lint:ratchet` **69/69** ; `lang:gate` 0 hit ; `export:check` 0 chemin interdit / 0 FR. Tous exit 0. ✓
5. **R-25** — `git diff --shortstat "lot/etude-suite...cba115f" -- <pathspec `STAT=` verbatim>` = **580 ins + 11 del = 591** (base de fusion 8c8eac8) ; PLI exclu (`docs/**/*.md`), fixture comptée. < 1 205 ⇒ gate passe. ✓

## Observations worker (6) — laissées au G7 (formées, non-dettes)
Règle appliquée : texte **snapshot/historique** dont la valeur autoritative figure ailleurs dans le doc, **hors oracle et hors R-25** → observation formée ; seuls les chiffres **décisionnels** sont corrigés en delta (précédent C-V2/C-G2-2). Ni l'un ni l'autre n'est touché par ce delta.
- **(c)** PLI §1 l.27 sha test `772db433…` = snapshot de livraison **04d45d4** (**vérifié** : `git show 04d45d4:…adapter-book.test.ts` sha(LF) = `772db4336646`) ; valeur courante `e117edbb…` déjà en annexe 3 l.183. `error_origin` : **worker pli 1** (table §1 sans qualificatif « au gel 04d45d4 »).
- **(b)** PLI §7 l.104 formule deux-points : exacte à l'écriture, **périmée par la divergence** de `lot/etude-suite`. **Mesuré par moi** : `git diff --shortstat lot/etude-suite cba115f -- <STAT=>` = 608 ins + 119 del = **727** (compte les changements inverses depuis le tip 809630a), pas 591 ; annexe 3 l.181 donne la mesure trois-points CI-fidèle (591). `error_origin` : **dérive d'intégration** (etude-suite avancé après la base ; pas une faute worker à l'écriture).
Le G7/orchestrateur peut néanmoins les exiger — mon avis n'est pas un verdict (R-26).

## Innocuité (AM-1, R-20)
`git -C F:/Monark-wt-u1bb status --porcelain` = vide ; HEAD = `cba115f` ; adapter sha(LF) = `b9816d33…855c`. `F:/Monark` propre, HEAD `lot/etude-suite`. Rejeux confinés à `F:\tmp\` ; jonctions retirées par `fs.rmdirSync` (jamais `rm -rf` d'un dossier à jonctions) — worktree `node_modules`/`packages` vérifiés intacts après. Aucun commit, aucun workflow (R-20). Zéro dette : aucun « dû » nu, aucun contournement.
