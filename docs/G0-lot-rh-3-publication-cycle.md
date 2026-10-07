# G0 du lot RH-3 : le cycle `publication` de `retire-latency.mjs` (RETIRE-REAL-CYCLE-SCOPE-1), et le pli de sa G2

RECHERCHES, 2026-10-07. Base `b9d327a4` (merge-base avec lot/etude-suite `acbaeb52`). Tête relue : `df0ecf0e`. Plan :
`docs/G0-lot-retire-latency-rehearsal-1.md` §5 (RH-3) et §11 (Q-RL-2). Relecture pliée : pièce
`pieces/2026-10-07-g2-218-219-format-w2/g2-218-219-w2.json` de RECHERCHES, clé `reviews[1]`.

## Provenance

- Modèle : `claude-opus-5-5`. Heure lue au départ (`date -u`) : 2026-10-07T05:16:25Z.
- Actes git :
  - `git fetch` des branches `recherches/rh-3-publication-cycle` et `lot/etude-suite` ; puis, en lecture, `recherches/rh-1-runbook-notes`,
    `recherches/rh-1-probe-instants`, `recherches/rh-2-test-per-dir`, `recherches/killer-ops-1` et `recherches/vocab-venue-fields-1`.
    Ces lectures n'ont écrit que `FETCH_HEAD`.
  - `git worktree add` refusé : le chemin existait déjà. C'était un worktree propre à `df0ecf0e`, et la branche locale `rh3-fold` était à
    `df0ecf0e`. J'ai fait `git switch rh3-fold` dans ce worktree.
  - `git archive df0ecf0e` vers une copie jetable, pour rejouer les mutants de la relecture.
  - Un commit neuf, aux chemins nommés, puis `git push origin rh3-fold:recherches/rh-3-publication-cycle`, sans amend ni force.
- Le dépôt `/home/user/monark-governance` n'a pas été touché.
- Node v22.22.2 : aucun Node 24 sur la machine, alors que `package.json` demande `>=24`. La CI tourne sous 24.

## Constats de la G2, vérifiés à la source

Je les ai vérifiés à `df0ecf0e`, dans une copie `git archive`. Chaque mutant a été tiré seul, et le fichier a été restauré
(sha256 `31f095f0…` avant et après). Les sept mutants MU-1, MU-2, MU-3, MU-4, MU-6, MU-7 et MU-8 survivent tous, 13 sur 13 verts.
Les effets de la relecture se retrouvent par sonde :

- une publication avec mention est rapportée, `"mention":"JOURNAL line 12"` ;
- une publication du vendredi 10:00 au mardi 10:00 donne `met: true`, sur 172 800 000 ms ;
- une publication avec `T_a: null` est refusée par `instant_out_of_cycle`, car le contrôle passe par `hasOwn`.

La citation l.9-10 de `docs/RUNBOOK-harness.md` l.396 est décalée : l'ouverture de l'entrée est en l.8. Le brouillon du G0 de
retrait (`G0-ENGINE-ROW-RETIRE-PATH-1-brouillon.md`, sha256 `14033044…`) pose bien, en l.150, l'objectif de 3 jours ouvrés à côté du
plafond T_g − T_a.

## Changement

Le script garde ses 76 lignes. Toutes les lignes que cite le RUNBOOK gardent leur place :

- l.4 et l.7-8 ;
- l.10-12, l.15-23, l.16, l.25 ;
- l.41-44, l.47, l.51-52, l.57 ;
- l.62, l.66-68 et l.70-72.

1. **M-2 (Q-RL-2), décision (a) : refuser.** Une `mention` non nulle sur un cycle `publication` est refusée, sous le code
   `mention_out_of_cycle` (l.44), sur le modèle de `instant_out_of_cycle`. Aucun plafond ne s'y applique, donc aucun dépassement n'est à
   écrire. Le plafond d'une publication écrit `mention: null` (l.56, et le type `.d.mts`). L'en-tête (l.10-12) nomme le code.
2. **M-1.** Un test frère, `retire_latency_rehearsal_reports_as_real_and_publication_as_its_tail`, rejoue T :
   - sous `cycle: "rehearsal"`, il exige instants, `steps_ms`, `total_ms`, `ceiling` et `objective` identiques au cas `real` ;
   - en publication, il exige la queue T_c..T_g des mêmes instants ;
   - il épingle la ligne OK exacte du cycle `real` : `retire-latency OK: real cycle, T_g - T_a 475200000 ms, ceiling held, objective not
     met (reported only)`.

   `ceiling_unmentioned T_g` est exigé pour `late` en `rehearsal` comme en `real`, dans le test du plafond.
3. **m, objectif d'une publication.** `r.objective` est épinglé dans le test du plafond : `{ business_days: 3, business_ms: 350 * H,
   met: false }`. Un cas atteint s'y ajoute : du lundi 10:00 au mercredi midi, 50 h, `met: true`.
4. **m, gardes non exercées.** `{ T_a: null, ...P }` donne `instant_out_of_cycle T_a`. `report(null)` donne `format_invalid`, jamais
   une `TypeError`.
5. **m, portée du RUNBOOK.** Elle est écrite dans la portée de RH-1 : `docs/G0-lot-retire-latency-rehearsal-1.md` §5 et
   `docs/ETAT.md`. Ce sont le §8 du RUNBOOK pour le cycle `publication`, la citation l.8-10 et la forme publication de
   RETIRE-INSTANTS-1. `test/runbook-retire.test.ts` doit lire `CYCLES` et les codes de refus dans le script.

   Le RUNBOOK et ce test ne sont pas touchés ici, parce que #223 et #224 (RH-1) les modifient déjà.
6. **m, corps public de la PR : non plié ici.** Le corps de la PR relève de l'orchestrateur.

## Tueurs

- test/spec-retire-path.test.ts, `retire_latency_publication_cycle_holds_T_c_to_T_g_only` (inchangé) : scripts/retire-latency.mjs:44 CONST "if (pub) for" -> "if (false) for"
- `retire_latency_publication_cycle_skips_the_ceiling_and_says_why` : scripts/retire-latency.mjs:51 CONST "!pub && total" -> "input.cycle === \"real\" && total"
  (MU-7). Il remplace "!pub && " -> "", que ce test tue encore.
- `retire_latency_publication_cycle_refuses_a_mention` : scripts/retire-latency.mjs:44 CONST "pub && input.mention !== null" -> "false"
- `retire_latency_rehearsal_reports_as_real_and_publication_as_its_tail` : scripts/retire-latency.mjs:45 CONST "pub ? INSTANTS.slice(2) : INSTANTS" -> "input.cycle === \"real\" ? INSTANTS : INSTANTS.slice(2)" (MU-8)
- `retire_latency_rehearsal_carries_a_mention_as_real` (pli de la G2 courte, m-1) : scripts/retire-latency.mjs:44 CONST "pub && input.mention !== null" -> "input.cycle !== \"real\" && input.mention !== null"
  (MINE-A de la relecture). Une répétition `late` avec mention doit donner le même `ceiling` que le cycle `real` :
  `{ days: 14, exceeded: true, mention: "JOURNAL line 12" }`. La queue T_c..T_g des mêmes instants, en publication, donne
  `mention_out_of_cycle` : le refus ne vaut que pour une publication. Ce troisième terme rend le test F2P à la base, où `publication`
  n'existe pas ; sans lui, red-proof le refuse (« green at base: a self-confirming test »).

Ces tueurs sont placés en l.44 et non en l.56 ou l.41-42. Sous (a), la mention d'une publication est toujours nulle à l.56 : un mutant
y mourrait-né. Le refus se tient donc à côté de `instant_out_of_cycle`.

## Décision Q-RH3-1 (RECHERCHES, 2026-10-07)

- **Q-RH3-1, décidée** : le comportement reste inchangé. L'objectif de 3 jours ouvrés d'une publication se calcule sur T_c..T_g,
  et la ligne OK le dit déjà : « publication cycle, T_g - T_c ». Le plafond garde `applies: false`, avec sa raison.
- La lecture de l'objectif pour D6 en deux segments est écrite au §11 du G0 de la répétition : l'objectif se lit seulement au
  premier retrait réel (RETIRE-LATENCY-FIRST-REAL-1). Le mode « somme » de la relecture (un mode qui lit les deux enregistrements et
  imprime leur somme) est refusé, avec sa raison au même endroit.

## Preuves

- Mutants à la tête du pli : MU-1, MU-3, MU-4, MU-6, MU-7 et MU-8 sont tués par assertion. MU-2 n'a plus de sens, l.56 écrit
  `null`. Les tueurs des lignes 44 (deux), 45, 50 et 51, ancien et neuf, sont tués. Le fichier est restauré, sha256 `03fba287…`.
- `node scripts/red-proof.mjs --base b9d327a4 --gel <worktree> --draw 4 --seed 20261007` donne `red-proof OK` :
  - 4 tests jugés F2P, 8 inchangés ;
  - 4 tueurs tirés, 4 tués ;
  - RED-PROOF.json, sha256 `8014c4366737f88e…`.
- `node --test test/spec-retire-path.test.ts test/runbook-retire.test.ts` : 15 sur 15.
- Pli de la G2 courte (m-1), sous Node v24.21.0 :
  - MINE-A tiré à la main sur l.44 : avec le fichier de test d'avant le pli, 15 sur 15 restent verts ; avec le test frère, celui-ci
    rougit en `ERR_ASSERTION` (la répétition donne `mention_out_of_cycle`). Fichier restauré, sha256 `03fba287…` avant et après ;
  - après le pli : `node --test test/spec-retire-path.test.ts test/runbook-retire.test.ts`, 16 sur 16 ;
  - la même commande red-proof donne `red-proof OK` : 5 tests jugés F2P, 8 inchangés ; 4 tueurs tirés, 4 tués, dont MINE-A.

## Effet sur #223 (RH-1, non touchée)

Sa phrase « AFTER #218 » doit aussi nommer `mention_out_of_cycle` et dire que `mention` est `null` dans une publication. Son test
`runbook_retire_shows_the_closed_latency_input` lit chaque `no("<code>"` du script. Il exige que chaque code soit cité entre
accents graves dans la section. Une fois #218 fusionnée, il rougira tant que la section ne cite pas `mention_out_of_cycle`.
