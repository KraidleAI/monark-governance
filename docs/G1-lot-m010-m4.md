# G1 — Génération tracée, Lot M010-m4 (barre honnêteté vitrine pour `checkReleaseText`)

- **Générateur** : orchestrateur (siège committeur `claude-opus-4-8` exception Opus-seat), sous garde-fou de
  réduction (tâche simple, vérifiable, oracle déterministe — mono-agent + G2 fraîche séparée, pas de fan-out).
  Branche `lot-m010`. 2026-09-16.
- **Spec / décision** : ADR-M010 §4 m-4, **décision investisseur 2026-09-16** (« barre vitrine » : les notes
  de release publiques passent la même barre honnêteté que le site). Rattachement : cette décision + §5.

## Changement
`scripts/release-public.mjs` `checkReleaseText(text)` : applique désormais, en plus du langage (French) et des
bans vocab GLOBAUX, les bans **scoped `site` ET `skills`** (`vocab-banned.json` `scan.site.banned` /
`scan.skills.banned`) — 3 appels `scanVocab` distincts. Les `exemptPhrases` des deux scopes sont **UNIONnés**
et masqués avant chaque scan scoped (« no confidence field » exempt côté site ne doit pas rougir sous le scan
skills qui bannit aussi « confidence » ; réciproquement « $/token spend cap »). **Fail-closed (F3)** : si
`scan.site.banned` ou `scan.skills.banned` est absent/vide, `checkReleaseText` refuse TOUT texte (jamais un
repli silencieux GLOBAL-only sur du texte public). Lecture seule de 2 configs committées ; sans écriture, sans
réseau, sans `process.exit` — importable/pure inchangée. `test/release-public.test.ts` : bloc « storefront
honesty bar (m-4) » — mutant-catchers uniques par scope (`Aave` site-only, `yield` skills-only), terme partagé
(`autonomous`), exemption union (`no confidence field` passe), régression sur-exemption (`autonomous` + phrase
exempte rougit toujours). ADR §4 (m-4 landed) + §5 (barre vitrine) mis à jour.

## Couverture (vérifiée par le G2 frais)
`scan.harness.banned ⊆ (scan.site.banned ∪ scan.skills.banned)` — `guarantee`/`probative` (les seuls absents
du site) sont dans `skills` (regex byte-identiques) ⇒ ne pas appliquer `harness` ne laisse **aucun trou**.
`scan.monark.banned` (naked `Hermes`) = garde de collision de nom bornée à `packages/monark/**`, pas un ban
d'honnêteté vitrine ⇒ exclusion correcte.

## Oracle (arbre livrable)
`npm run ci` **185/185** (184 + 1 bloc m-4) ; `gate:vocab` OK (111 fichiers) ; `lang:gate` 0 hit (10 scopes) ;
`export:check` 0 forbidden / 0 French ; `node --check` OK ; import inerte. `release-public.mjs` + test root non
exportés (surface publique inchangée). Aucun push.

## Résidu nommé (F2, non-bloquant — heads-up notes v0.1.0)
La barre vitrine rougit des mots fréquents en notes de release : `live`, `stakeholders`/`stake`/`staking`
(`\bstak` non ancré en fin), `proven`, `gamma`/`Gamma` (greek, insensible à la casse — limite documentée),
plus `yield`/`APY`/`confidence`/`autonomous`/`predicts`/`accuracy`/`hedge fund`/`guarantee(d)`(non-« no »)/
`probative`(non-nié)/marques tierces/`Kraidle`. **Fail-closed, jamais un slip** : le rédacteur des premières
notes `v0.1.0` doit les éviter ou `--tag` est refusé. À porter au moment de la rédaction des notes.
