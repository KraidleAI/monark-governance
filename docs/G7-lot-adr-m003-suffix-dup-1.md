# G7 du lot ADR-M003-SUFFIX-DUP-1 : le doublon « D9 octies » tenu par une note de registre et par un test, sans renommage

- **Base** : `a43b0126`. **PR** : #207, branche `monark/adr-m003-suffix-dup-1`, tête `4f305305`. **Fusion au tronc** : `76a8c3ca`
  (tronc avant fusion `d63743e9`, qui porte D9 septdecies).
- **Demande** : item ouvert par l erratum du journal du 2026-10-06 07:4x UTC (`docs/JOURNAL-PROVENANCE.md` l.448) ; avis de RECHERCHES
  (`369306d`, section 0) : ne pas renommer un addendum déjà cité. **G0** : `docs/G0-lot-adr-m003-suffix-dup-1.md`. **Runtime** : Node
  24.21.0 (win32).
- **Construction** : worker `claude-opus-5-5` (effort max) du workflow de MONARK ; diff relu par MONARK avant le commit. Le script du
  workflow ne donnait pas de vérificateur dédié à ce lot (`verify: false`) ; le message de demande de G2 a d abord dit le contraire, puis
  a été corrigé (erratum `37150fa`).

## G2 (RECHERCHES)

- Première G2 sur `49a3067a` (`c8bd946`) : **B-1** (mineure, requise). `OPENS = /^\*\*Addendum D9\b/` laissait sortir du contrôle, sans
  rien dire, un titre collé (`**Addendum D9bis`, pas de frontière de mot entre `9` et `b`) ou décalé par une mise en forme
  (`### Addendum D9`, `- **Addendum D9`).
- Pli (`4f305305`) : `OPENS = /^\W*Addendum D9/u`. Mesuré sur ADR-M003 à `a43b0126`, `6792411d` et la branche : il prend exactement les
  17 (18) titres et aucune citation. Test neuf `adr_m003_d9_headings_never_escape_the_check`.
- Contrôle du diff `49a3067a..4f305305` et accord (`4b0a929`).

## Mesures

- **red-proof** sur `4f305305` : 2 tests jugés (module neuf), 2 tueurs tirés et tués. **Mutants à la main** : 14 au G0, puis 3 au pli
  (`/^\*\*Addendum D9/`, `/^\W*Addendum D9\b/u`, `/^.*Addendum D9/u`), tous tués.
- **Sur la fusion** : `test/adr-m003-suffixes.test.ts` 2/2 ; l ADR du tronc porte 18 titres D9, septdecies l.211, aucun refus.
- **Oracles** : G1 sur `49a3067a` (`93f62b3a…`) et sur `4f305305` (`1868601d…`), sortie 0 ; G7 sur la fusion `76a8c3ca` : sortie 0 (record `595f3702…`).
- **CI** : 10/10 sur `4f305305`. **R-25** : 109 lignes comptées au G0, plus 17 au pli (14 insertions, 3 suppressions).

## `error_origin`

- **Générateur (MONARK)** : B-1, pliée.
- **Orchestrateur (MONARK)** : le message de demande de G2 disait les deux petits lots relus par un vérificateur neuf ; faux, corrigé par
  erratum le jour même.

## Items formés (ETAT)

- ADR-M003-SUFFIX-LIST-1 (procurement) et HARNESS-UNICODE-ESCAPE-1, accord de RECHERCHES (`c8bd946`). Le déclencheur du premier est
  corrigé ici : `LATIN_ORDINALS` compte 18 termes (aucun suffixe, puis bis à octodecies) ; l ADR en porte 17 distincts (jusqu à
  septdecies). Le prochain addendum, octodecies, passe ; le suivant (20ᵉ titre en comptant la paire octies) est refusé. Le G0 disait
  « avant un 19ᵉ titre » : décalé d un.
- ADR-M003-SUFFIX-DUP-1 : clos.
