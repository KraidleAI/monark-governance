# Checkpoint 1 — ADR-M004 (infrastructure et plateforme) : avis du validateur-humain et traitement

- **Date** : 2026-09-06. **Artefact soumis** : `docs/adr/ADR-M004-infrastructure-plateforme.md` (md5 `06eca138` à la soumission, commit `099cdc4`).
- **Validateur** : `validateur-humain`, modèle résolu déclaré `claude-fable-5-1`, instance séparée, contexte frais, advisor intégré non appelé.
- **Verdict** : **ACCEPTE-AVEC-CORRECTIONS** (17 items, liste fermée) + **ESCALADE-INVESTISSEUR** (3 questions : Q1 ordre de coupe, Q2 Vercel Pro vs auto-hébergé, Q3 tokenomics).
- **Persistance** : avis intégral verbatim (§1), traitement (§2).

## 1. Avis intégral (verbatim)

(Le texte ci-dessous est celui rendu par le validateur, sans modification.)

**Limites déclarées** : ni Bash ni Write — je n'ai pas recalculé de md5 ; les deux copies de l'ADR ont été lues intégralement et sont identiques à la lecture (110 lignes, texte ligne à ligne égal). Les comptes de lignes ci-dessous viennent de `Grep` en mode compte (lignes non vides), pas de `wc`.

### Artefacts lus
`ADR-M004` (F:\Monark et F:\Clawpumptech, intégral) ; `ADR-M003` (intégral, addenda compris) ; `CHECKPOINT1-phase2.md` ; `R-P1-clawpump-hermes.md` ; `JOURNAL-PROVENANCE.md` l.150-172 ; `ROADMAP-MONARK.md` §7 ; `P-K1-1-qin2021.md` ; `package.json` l.7-9 ; `schemas/attested-price.schema.json` l.12-17, 36, 61-62 ; `.github/workflows/ci.yml` l.37-56 ; `packages/hikae/docs/S2-RAPPORT-fixtures-synth.md` l.1-15 ; arborescences `packages/**`, `apps/**` (inexistant) ; memstack `e7a680ae…`, `dff88346…` ; en ligne [lu, 2026-09-06] `https://vercel.com/docs/limits/fair-use-guidelines` (`last_updated: 2026-07-29`).

### Checklist
**CA-1** — correction. X, F, B, E se reformulent ; X et F mal posés : (a) D7 gate de langue « 0 chaîne française » rouge par construction (`octets_recalcules`, `verifier_revision` = contrat gelé ; clés Shōgen des fixtures ; `packages/hikae/docs/S2-RAPPORT-fixtures-synth.md` en français, exporté, régénéré sous test byte-exact) ; « faux positifs listés » n'est pas une liste ; (b) F : test 44 sans oracle nommé ; F-live (attestations `s3-binance`, verdicts HIKAE) = sortie du Lot I alors que F précède I ; « sans changement de structure » faux (`workspaces: ["packages/*"]`) ; (c) « atelier 59 lignes » omet `src/*.ts` (≈235) et `test/` (131).
**CA-2** — correction + escalade. (a) §1.2 promet un compte et une décision investisseur ; D10 marque 9 lots « oui » (13 après scission) pour 14 jours à 1-2 j/lot : compte ni écrit ni tranché ; (b) « tokenomics » sans source ; (c) Vercel Hobby = non commercial [lu] ; le site est commercial par décision investisseur ⇒ plan payant = coût investisseur.
**CA-3** — correction. D12 « aucune publication avant checkpoint 2 » contredit « site en ligne au 21 » : écrire « checkpoint 2 du lot » ; R-8 absent pour Next.js/Postgres/Caddy/Uptime Kuma/GHCR.
**CA-4** — correction. « E-root ∥ E-contracts », « F ∥ S » sans justification (récidive M003 item 10).
**CA-5** — correction. Manquent : décrochage de dépendance externe (paramètres investisseur sans date — récidive M003 item 14) ; chiffre juste mal qualifié (1,07 Md = « up to », MakerDAO seul, état 30/04/2021).
**CA-6** — n/a ; D11 ne reconduit pas « chaque test tué par ≥ 1 mutant ».
**CA-7** — correction. (i) services `shogen` et `claw-agent` dans aucun lot ni pendant ; image `shogen` construite depuis F:\Shogen, hors job D6 ; `claw-agent` exige une clé d'inférence ; (ii) provisionnement VPS sans runbook ni vérification ; (iii) **citation fausse** : aucun ADR ne dit « pas de base de données » ; M003 §5 écartait « Site vitrine dédié » (revu par D2) ; D4 tranche la persistance pour la première fois ⇒ §5 doit porter les alternatives (JSONL append-only + chaîne de hash ; SQLite) ; pendant M003 (i) « hébergement » résolu ici, l'écrire.
**CA-8** — conforme avec correction (citation fausse = `error_origin` orchestrateur).
**CA-9** — conforme.
**CA-10** — correction. F et B hors borne 1205 par construction (à scinder) ; D8 « sous la borne » non mesuré (hikae ≈1 574 src + 601 test ; ×2 par ligne traduite) ; deux pivots (21 sept. vs listing).

### Décision : ACCEPTE-AVEC-CORRECTIONS (17) + ESCALADE (3)
1. §1.2/D10 — écrire le compte (lots, jours, calendrier) + ordre de coupe proposé (Q1).
2. D7 — liste fermée commise d'exemptions (identifiants gelés, clés Shōgen, `harness_version`) ; décision unique pour `S2-*` (exclu de l'export + rendu depuis le TSV, ou générateur en anglais dans E-hikae avec nouveau sha).
3. D7 — liste noire complétée (`G7-*`, `AUDIT-ENTREE.md`, `CHECKPOINT2*`), « défense en profondeur » ; liste blanche tolère l'absence de `apps/site`.
4. D2 — retirer « sans changement de structure » ; assigner `workspaces` à E-root ou F-public.
5. D2/§4 — Vercel Hobby non commercial [lu] ⇒ « Vercel Pro (payant) ou autre hébergeur » ; §5 réévalue Astro/statique sur VPS si refus (Q2).
6. D1/§4 — tokenomics = pendant investisseur daté ; « to be announced » sinon (Q3).
7. D1/D10 — F-live dépend du Lot I ; repli S2a/S2b + clearing seulement, déclaré.
8. D11 test 44 — oracle : `loadCommitted()` + manifeste sha256 ; 0 littéral numérique dans `apps/site/app/**` hors fichier de chiffres sourcés.
9. D10 F — scinder F-public, F-live, F-console ; CA-F porte la borne.
10. D10 B — scinder B-api, B-mcp, B-infra ; B-journal après listing.
11. D8 — mesurer les lignes à traduire par package (commande collée) ; règle de scission ; E-contracts ne touche jamais aux identifiants gelés.
12. D1 — `fixtures/figures-sourced.json` (valeur, unité, source, page, date d'état, qualificatif) rendu tel quel.
13. §1.3/D4 — corriger la citation ; D4 = première décision ; §5 alternatives ; Postgres motivé post-listing ; image épinglée par digest (R-8) ; `error_origin` orchestrateur.
14. D3/D10/§4 — `shogen` et `claw-agent` : lot nommé ou Phase 3 explicite, `shogen.<domaine>` retiré du pivot.
15. D3/D6 — `docs/RUNBOOK-VPS.md` (investisseur : utilisateur non-root, SSH clé, pare-feu, fail2ban, Docker, snapshots) + vérification au premier `deploy` ; `known_hosts` commis ; jamais `StrictHostKeyChecking=no`.
16. §4 — dater les paramètres investisseur (≤ 2026-09-09) ; replis : sans domaine → sous-domaine Vercel ; sans VPS → API/MCP non publiés, surface = F ; ajouter à D12.
17. D12/D11/l.28-77 — « checkpoint 2 du lot » ; un seul pivot ; justification des fan-outs ; mutants reconduits ; phrase R-8.

**Ce qui bloque quoi** : 2, 3, 11 avant X ; 4, 6, 7, 8, 9, 12 avant F ; 10, 13, 14, 15 avant B ; 1, 5, 16, 17 avant le prochain commit de l'ADR. **E-root et E-contracts peuvent démarrer maintenant.**

**Escalades** : Q1 ordre de coupe (proposition : garder X → E-root/contracts → F-public → F-console → B-api ; couper d'abord B-mcp, P, S2b réel, I, E-ukemi/monark/atelier) ; Q2 Vercel Pro payant ou site auto-hébergé sur le VPS ; Q3 tokenomics fourni avant le pivot ou « to be announced ».

**Ligne AM-1** — attrapé : gate de langue vs identifiants gelés ; citation « pas de base de données » inexistante ; `workspaces` ; services sans lot ; F-live ← I ; F et B hors borne ; compte non écrit ; paramètres sans date ; Vercel Hobby ; tokenomics ; fan-outs. Modèle résolu : `claude-fable-5-1`.

## 2. Traitement par l'orchestrateur (2026-09-06)
Voir la version corrigée de l'ADR (réécrite intégralement, les 17 items intégrés ; mesures collées) et le journal. Escalades Q1-Q3 transmises à l'investisseur telles quelles.
