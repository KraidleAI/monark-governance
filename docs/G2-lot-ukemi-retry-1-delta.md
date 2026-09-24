# G2-delta UKEMI-RETRY-1 (pli ecac47e) — PASS

All G2-DELTA items independently re-verified against the folded commit `ecac47e`; verdict recorded durably in `F:\tmp\g2-ukemiretry1\G2.md`.

---

Modèle résolu : claude-opus-4-8[1m]

# G2-DELTA — `lot/ukemi-retry-1` @ `ecac47e` (parent 93cc83f ; test + ADR ; `record.ts` inchangé `afa20f8c`) — **PASS**

Re-vérifié sur le même clone (checkout ff `ecac47e`), env -u des 8 clés, golden `record.ts afa20f8c` inchangé. Delta mesuré : test +45/−6, ADR +14/−13.

1. **C-1** — CONFORME. Oracle vert ⇒ A-8 (ok 380) asserte `calls_by_operator.chainstack >= 2` ; épuisement (ok 382) asserte `calls_total === 4` et `by_operator.chainstack === 3`. **V4 du validateur** (`tally.total += 1` → `if(attempt===0)` ⇒ calls_total 2≠4) **ROUGE** sur l'épuisement (mesuré indépendamment).
2. **C-2** — CONFORME. `ukemi_record_nonjsonbody_course_topology_correlated_blip_avoids_paid_draw` (ok 383) : 5 keyless + chainstack, blip HTML@200 corrélé drpc+mevblocker ⇒ exit 0, PIN `034fbff9…`, **cs === 0**, `errors_by_operator` deepEqual `{drpc.org:1, mevblocker.io:1}`. Mutant clause retirée **mesuré à la main** : `expected 0 / actual 28` ⇒ **cs = 28** (breakdown `{drpc:1,mevblocker:1,nodies:28,chainstack:28,tenderly:706,pocket:706}` — le blip corrélé FORCE le tirage payant que le retry évite). Exactement l'attendu.
3. **ADR** — CONFORME. R-U-1 **CLOS** (cite fold Bell `4db059e`, `docs/G7-lot-bell-retry-1.md`, ADR-GARDE-HELIUS:320 doctrine-générale couvrant le recorder) ; R-U-2 = `u4-guard.mjs:136` **seul** (dérive :120→:136 notée), déclencheur « après clôture/frontière ancrée OU ajout de `--with-chainstack` — jamais 1re occurrence », `universe.ts` déféré à **R-BR3** (Bell). Mes CG-1..CG-5 (dont CG-4, commentaire A-8 corrigé) toutes foldées.
4. **Mutants/oracle/R-25/fusion** — CONFORME. 9/9 worker ROUGES (M1-M7 + V4 tally + Mtopo topologie), restaurés byte-exact, golden intact ; mes 4 conformes (V1-V3 kill ; mon V4 = survivant R-U-3 déclaré, distinct du V4 validateur — homonymie de scripts). Oracle env -u **871/870/0/1**, 0 not ok, skip nommé pré-existant. R-25 = **170** (`2 files, 157+/13−`, ADR exclu par `docs/**/*.md`). Fusion à blanc vs etude-suite HEAD `d099a9d` : **une seule collision — l'append ADR-U4b** (union chronologique : U-4b-1b-2 puis UKEMI-RETRY-1) ; `record.ts`/test/9-gelés **intacts** sur etude-suite ; aucune autre collision.

**Verdict G2-DELTA : PASS.** Code inchangé (test+ADR seuls) ; toutes les corrections G2 foldées ; assertions C-1/C-2 mesurées indépendamment ; cs=28 reproduit ; aucun défaut résiduel. Aucun commit/workflow (R-20). Divergence G7 ⇒ ESCALADE-INVESTISSEUR ; aucune question investisseur nouvelle.

Fichiers : `F:\tmp\g2-ukemiretry1\G2.md` (rendu intégral + appendice G2-DELTA, durable) ; preuves `F:\tmp\claude\F--Monark\7a32969b-9ec3-45d5-8e36-f5466c58bb38\scratchpad\{g2delta-oracle.log, g2delta-mutants.mjs, g2-mymutants.mjs}`.

Modèle résolu : claude-opus-4-8[1m]
