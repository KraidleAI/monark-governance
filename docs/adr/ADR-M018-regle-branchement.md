# ADR-M018 — Règle de branchement : une pièce n'est « built » que si elle est branchée et testée de bout en bout

- **Statut** : accepté par décision investisseur 2026-09-19 (verbatim : « grave une note importante, plus de dettes comme ça, plus d'oubli, on a
  créé des pièces sans les brancher ») · s'applique immédiatement à tout lot en cours (P1) et à toute pièce future.
- **Rattachement** : ADR-M004 D14 (registre `fleet.ts` = source de vérité built/upcoming), ADR-M005 (harnais pur, K-8), ADR-M015 (phase
  « moteur réel et mesuré », cartographie du 2026-09-18), ADR-M017 (P1) ; règle globale Dettes ; CA-11 du validateur-humain (amendement daté).

## Contexte (mesuré)
`docs/etude-suite-2026-09-18/CARTOGRAPHIE-code.md` : quatre pièces « built » mais deux tuyaux réels ; `crossAgentGate` (le triangle
Shōgen → Hikae → Ukemi) appelé uniquement par son test ; `attest` terminal ; `gate` sans prise d'attestation ; `B_t` sans état ; token affiché
sans fil ; site lisant des fichiers, n'important aucun moteur. Ces défauts n'étaient consignés nulle part comme dettes : des pièces ont été
déclarées construites sur la foi de leur code, pas de leur branchement.

## Décision
**D1 — Définition.** Une pièce (agent ou produit du registre) est **built** si et seulement si (a) son code existe et passe l'oracle, (b) **sa
sortie est consommée par au moins un chemin servi** (outil MCP/HTTP exposé, fichier publié lu par une surface, ou pièce aval réelle),
(c) **un test d'intégration non-LLM rejoue la composition de bout en bout** (entrée réelle ou fixture épinglée → sortie consommée), et (d) l'ADR
de la pièce déclare ses tuyaux. Un composant dont le seul consommateur est un test unitaire, une fixture ou une démo est **upcoming**.
**D2 — Registre.** `apps/site/lib/fleet.ts` porte, pour chaque `built`, la référence du chemin servi et du test d'intégration (champ `wiring:
{ served_by, integration_test }`) ; le test `fleet_register_built_set_is_frozen` est étendu : tout `built` sans `wiring` rougit. Application au
registre actuel : Shōgen (`attest` servi ; consommé par `gate` via `attested` **à partir de P1-b2**, test (3)) ; Hikae (`gate`, `calibrate` servis) ;
Ukemi (`cascade` servi sur graphe fixture ; sa sortie n'est consommée par aucun chemin servi ⇒ **à requalifier au G2 de P1-b3** : `built` avec
`wiring` déclaré fixture, ou `upcoming` — décision consignée dans l'ADR de b3, jamais implicite) ; Narabi (fichiers publiés lus par `/narabi`,
classe servie par `gate`).
**D3 — ADR de lot.** Toute ADR de pièce ou de lot porte une section « Tuyaux » : entrée (qui produit), sortie (qui consomme), état (où il vit),
test qui prouve la composition. Un tuyau annoncé et absent = item formé avec déclencheur, jamais un oubli ; un G7 ne clôt pas un lot dont un
tuyau annoncé manque.
**D4 — Cartographie à chaque clôture de phase**, par un worker en contexte frais : graphe réel des composants (imports mesurés, flux à
l'exécution, « câblé / fixture / absent » par paire), comparé au registre public ; tout écart = dette au sens de la règle absolue, corrigée avant
toute nouvelle pièce.
**D5 — Validateur.** CA-11 (amendement daté dans `~/.claude/agents/validateur-humain.md`) : à chaque checkpoint-2 et clôture de phase, le
registre « built » ⇔ chemin servi + test d'intégration, vérifié sur pièces ; sinon refus.

## Conséquences
- P1-b2 porte le premier test de bout en bout attest → gate sur le chemin servi (test (3) ADR-M017) ; P1-b3 tranche le statut d'Ukemi.
- Item formé : ajout du champ `wiring` et extension du test de gel du registre (lot **W-1**, `apps/site/lib/fleet.ts` + test, R-25 < 400,
  après P1-b3 pour refléter le vrai état) ; jusque-là aucune surface publique ne change.
- Journal : entrée dédiée ; règle globale et CA-11 écrites le 2026-09-19.

## Amendement D2 — 2026-09-19, ratifié par l'investisseur (décision 23)
**Ratification.** L'investisseur (décision 23, 2026-09-19) ratifie l'amendement de **D2** proposé par ADR-M019 D3.
L'énoncé original de D2 (l.22) — « Ukemi (`cascade` servi sur graphe fixture ; **sa sortie n'est consommée par aucun chemin servi** ⇒ **à requalifier au G2 de P1-b3**) » — est **périmé** (prémisse « Ukemi non consommé » **fausse**). Il **n'est pas réécrit** (traçabilité) ; il est ici **cité comme périmé** et remplacé, pour la qualification d'Ukemi, par le texte exact proposé par ADR-M019 D3.
**Mesure (corrige la prémisse).** Le tuyau `cascade → gate` est **mesuré et branché depuis P1** : cartographie P1 (`docs/CARTOGRAPHIE-P1-2026-09-19.md`) §2 l.62 (`cascade → gate` **CÂBLÉ (servi), vacue**, probe `probe_harness_records_real_decision` + `docs/cartographie-p1/vacuity-replay.mjs`) et §3 l.86 (ligne registre **Ukemi** : `cascade → gate`, servi, vacue). Mesure [lu] : `fixtures/h5-e2e-trace.json` étape 4 `cascade-gate`.
**Texte ratifié (verbatim ADR-M019 D3).**
> Ukemi (`cascade` servi sur graphe fixture) : sa prédiction **est** consommée par le `gate` servi sur le fil réel (trace h5 étape 4 `cascade-gate`, probe) mais le gate **abstient `under_calib` par construction** (aucune calibration cascade committée) et le **contenu** de la prédiction n'influence pas la décision (vacuité mesurée) ⇒ statut `built`/`upcoming` tranché par l'investisseur en P1-b3 (ADR-M019 D4), jamais implicite.

**Effet.** Statut de registre d'Ukemi = **`built`** (tranché par l'investisseur, ADR-M019 D4) ; le champ `wiring` (lot W-1) dit honnêtement « abstains under_calib by construction ». Les autres énoncés de D2 (Shōgen, Hikae, Narabi, extension du gel `fleet_register_built_set_is_frozen`) sont **inchangés**. Provenance : rédigé par le worker `claude-opus-4-8` (lot E-honnêteté), sous orchestration `claude-fable-5-1`, sur ratification investisseur décision 23 du 2026-09-19. **error_origin** (prémisse d'origine « Ukemi non consommé », l.22) : **planificateur** — énoncé écrit AVANT la mesure P1 du tuyau `cascade → gate` (cartographie P1).
