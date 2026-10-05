# G7 du lot L2-P1-c2 (rejeu du carnet, minutes et parité), par RECHERCHES

Base `173ea0fd` (`lot/etude-suite`, c1 #143 et #144 fusionnés) ; branche `recherches/l2-p1-c2` ; commits `bff0ffc3` (G0), `1fee9d2e`
(tests rouges, `derive.d.mts`, type du crochet dans `day.d.mts`), `6a263a27` (gel), puis ce commit (G7). Aucun push, aucune PR.
Node v24.21.0. Aucun réseau : segments écrits par l'écrivain de a2 sous le dossier temporaire du système, ancres et instantanés écrits à
la main, horloges injectées ; données synthétiques, aucune série brute au dépôt. `packages/rpc-guard/bin/rpc-guard.mjs` non touché.
Tronc relu au G7 : `origin/lot/etude-suite` toujours en `173ea0fd`.

## Périmètre livré

- `scripts/l2/derive.mjs` (116 lignes), `scripts/l2/derive.d.mts` (30), `test/l2-derive.test.ts` (5 tests) ; `scripts/l2/day.mjs` :
  onze lignes changées en place, aucune ajoutée (les onze tueurs de c1 gardent leur ligne) ; `scripts/l2/day.d.mts` : `derive`,
  `DeriveContext`, `Derived`.
- Crochet `derive` de `sealDay` (m-9 de c1) : appelé après l'index, avant la création du dossier ; ses fichiers (noms de `DAY_FILES`,
  sinon `stray_file`) écrits et synchronisés avant `SHA256SUMS` ; clés ajoutées au manifeste et à `missing.json` ; `refs` listés au
  `SHA256SUMS`, sans doublon ; `scripts/l2/derive.mjs` dans `script_sha256`. Sans crochet, sortie de c1 identique (11 tests verts).
- Rejeu depuis le brut seul : ancre d'ouverture, instantanés `depth` gardés par b1 dans [début − 1 h ; fin) (après l'ancre s'il y en
  a une), différences des segments spot de la fenêtre de c1 ; règle de chaîne de b2 transcrite en synchrone (S4 en lecture de chaîne,
  S5 large, A1 à A3) ; amorce rejouée en place, ses segments référencés.
- Prix en entiers `BigInt` à l'échelle du jour ; `off_scale` et `bad_scale` ajoutés aux `STOPS` de `day.mjs` ; rien d'écrit sur arrêt.
- `minutes.jsonl` : 1 440 lignes (00:00 à 23:59), niveaux à ±100 pb tels que reçus, nombre, `dist_bp` arrondie vers le bas ; absentes
  nommées `chain_open`, `side_empty`, `no_later_event`.
- `missing.json` : `chain_holes` en heure de place (m-5 de c1). Manifeste : `replay` (`scale`, `start`, `syncs`, compte des minutes)
  et `parity` (`u`, `since`, écarts par côté, ou absente nommée).
- Écart au G0 : aucun sur le fond. Le G0 nommait le rejeu « départ à l'ancre » ; un carnet n'est posé qu'au premier événement qui
  enchaîne (S5) : sans amorce avant minuit, les minutes jusqu'à cet événement sont absentes et le trou est nommé (lecture prudente,
  Q-C2-4).

## Preuves

- `node scripts/red-proof.mjs --base 173ea0fd --gel 6a263a27 --repo /home/user/monark-governance-c2 --draw 5 --seed 37` : sortie 0,
  « red-proof OK: 5 judged, 0 unchanged, 5 killer(s) drawn » ; `RED-PROOF.json` sha256 `783aa5e5e7386536…`. Cinq tests F2P (rouges
  par assertion à la base : l'import dynamique de `derive.mjs` est affirmé) ; tueurs tirés, tous tués : `:57` ROR (fenêtre ±100 pb),
  `:75` ROR (minute stricte), `:80` ROR (comparaison de parité), `:94` ROR (borne de S4), `:76` CONST (coupe du trou à minuit).
- Ancres : `verifie-ancres.mjs . --touched 173ea0fd HEAD` : 5 tueurs, 5 ANCRE, 0 DERIVE, 0 PERDU ; avec ceux de c1
  (`--files test/l2-day.test.ts,test/l2-derive.test.ts`, `day.mjs` étant touché) : 16 tueurs, 16 ANCRE.
- Mutants à la main (copie de travail, un à la fois, fichier restauré et comparé), tous tués : arrondi vers le haut de `dist_bp` ;
  S5 `>=` → `>` ; rupture à `U` > id + 2 ; port de parité `U` ≤ L + 1 → ≤ L ; plage de l'ancre retirée ; `norm` retiré de chaque côté ;
  `since` = id ; candidats avant l'ancre admis ; borne basse de la fenêtre des instantanés retirée, puis fenêtre réduite au jour ;
  retrait à zéro (A2) retiré ; `off_scale` retiré ; échelle 19 admise ; `refs` des segments retirés ; `no_later_event` → `chain_open` ;
  garde `to >= start` et garde `from < end` retirées ; trou ouvert à l'heure de l'événement au lieu du dernier appliqué ; minutes au-delà
  de 23:59 ; ordre des niveaux ; plancher des côtés inversé ; `start` réécrit à chaque reprise ; diff illisible non rompu. Crochet de
  `day.mjs` : `refs`, dédoublonnage, `missing`, `manifest`, `modules`, écriture des fichiers, garde `stray_file` : chacun tué.
  Équivalent déclaré : A1 `ev.u < id` → `<=` (un événement de `u` = id réappliqué ne change rien, quantités absolues ; même règle dans
  b2).
- Garde croisée Q-C2-1 : `l2_day_replay_from_anchor_and_amorce` compare le carnet rejoué à `createBook` de b2 nourri des mêmes trames.
- `test:main` 2 272 tests, 2 250 réussis, 0 échec, 22 ignorés (sortie 0) ; `test:export` 1 sur 1 (sortie 0). `tsc` 0 ; `lint` 0
  erreur ; `lint:ratchet` 69/69 ; `gate:vocab` OK (335 fichiers) ; `lang:gate` OK.
- R-25 (`r25()` de `scripts/oracle/r25.mjs`, base `173ea0fd`) : `STAT` 357 (345 insertions, 12 suppressions), borne du lot 547, marge
  190 ; `CONTENT_STAT` 0 ; GREEN. Plan : 288 à 376.

## Questions pour la cellule (défauts appliqués, aucune bloquante ; texte au G0)

Q-C2-1 (transcription synchrone de la règle de b2, garde croisée), Q-C2-2 (crochet `derive`), Q-C2-3 (candidats de reprise, fenêtre
d'une heure), Q-C2-4 (minute présente seulement si un événement enchaîné la suit), Q-C2-5 (`chain_holes` au `missing.json`, heure de
place), Q-C2-6 (parité portée par l'événement à cheval, `since`), Q-C2-7 (`minutes.jsonl` en mémoire, item proposé L2-MINUTES-SIZE-1),
Q-C2-8 (échelle passée par l'appelant), Q-C2-9 (chevauchement connexion par connexion).

## Notes pour la suite

- c3 : ses deux empreintes par le même crochet (`files`, `manifest`) ; c5 compose c2 et c3 dans une seule fonction `derive`, passe
  l'échelle de la veille, écrit `anchor-open.json` et `anchor-close.json` avant le scellé (mêmes octets que le corps gardé par b1).
- c6 : `--from-raw` rappelle `sealDay` avec le même `derive` ; il copie les instantanés et segments listés au `SHA256SUMS`, dont
  `rest/<SYMBOLE>/…` et les segments de l'amorce.
- MAST FM-3.2 : bornes de TL-3 et TL-5 ici ; l'oracle réel reste M-4 en M-1 (parité contre l'ancre de la place).
