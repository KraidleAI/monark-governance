# G7 du lot CM-2b : retrait de btc-dir, table F-7 pour USDe, demi-ulp écrit (S-12, S-1, E-7)

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md`, amendement daté « plan de CM-2 » (go du fondateur « oui aux 1, 2 et 3 ») : B-5, B-2 (resserré), B-7 ; amendement « nuit, 3 » (décision du fondateur sur la chaîne attest → gate). Plan : `docs/G0-lot-cm-2b.md`.
- **Base** : `f3b330c` (branche `recherches/cm-2b`, posée sur `recherches/cm-2a`, PR #105 non encore fusionnée).

## Oracle

- `node scripts/red-proof.mjs --base f3b330c --gel bb94c88 --repo /home/user/monark-governance --draw 10 --seed 3` : **OK**, 18 tests jugés F2P, 10 tueurs tirés, 10 tués.
- `npx tsc --noEmit`, eslint sur les fichiers changés, `gate:vocab`, `lint:ratchet` 69/69 : verts. Harnais 126/126. `npm test` : 1 954 tests, 11 échecs : `bell-served.test.ts:153` (clone superficiel) et les 10 rouges attendus jusqu'à BTC-DIR-RETIRE-SURFACES-1 (ci-dessous).
- R-25 : 702 lignes comptées (14 fichiers, +470/−232), sous 1 150.

## G2 (instance neuve) : APPROUVE-AVEC-CORRECTIONS, pliée

- Corrections pliées : (1) commentaire du code `task_class_retired` ; (2) couture du résidu dite dormante au servi ; (3) R-4 tue M14 (le registre transmet `env.attested`) ; (4) `policyFor` retiré jusqu'à CM-4 ; (5) ordre α puis nMin verrouillé pour liq et USDe (tue M9).
- Perte acceptée : M13 (copie du résidu) survit, faute de chemin servi ; chaîne dormante par décision du fondateur.

## Changements servis (liste fermée)

- **B-5** : `btc-dir-15m` sans BYO rend 400 `task_class_retired` ; la garde BYO exacte garde son message octet pour octet ; `known:` sans btc-dir. À la base, btc-dir sans BYO ne rendait pas seulement `commit` ou `defer` : aussi `abstain`/`under_calib` (α 0,0066 ; nMin 100 000), `abstain`/`non_evaluable` (yhat « flat ») et 400 `yhat_type_mismatch` (yhat nombre) ; tout devient 400 `task_class_retired` (un 400 reste un 400 ; le code et le message changent). Ajout du 2026-10-04, C-3 du contrôle par diff de MONARK.
- **B-2** : la clé USDe commise exige α = 0,1 et nMin = 50 (400 `policy_alpha_mismatch` / `policy_nmin_mismatch`, α vérifié d'abord) ; messages liq inchangés ; autres clés USDe, tau, `tauInterval`, cascade et BYO inchangés. Lignes F-7 dans `apps/harness/src/class-policy.ts`.
- **B-7** : le texte USDe dit que chaque bord est l'arrondi au double le plus proche de yhat ∓ q̂, à au plus un demi-ulp du bord exact ; bande inchangée (rejeu octet pour octet de 12 décisions).
- **Description et openapi** : sha256 de la description `55744504…` → `cb4029d2…` ; `JSON.stringify(buildOpenApi())` `9e3176ea…` → `fc746a60…`.
- **README** : `apps/harness/README.md` dit btc-dir retirée et les exigences USDe.
- **Chaîne attest → gate** : dormante au servi depuis le retrait de btc-dir ; acceptée par le fondateur (amendement « nuit, 3 ») ; **statut public de Shōgen inchangé** (`built`).

## Items

- **ATTEST-KATA-SUBJECT-1** : sujet attesté pour les futures classes kata Binance ; RECHERCHES ; après CM-4 ; aucun travail maintenant.
- **BTC-DIR-RETIRE-SURFACES-1** : MONARK, livré avec CM-2b (liste fichier:ligne dans le G0). Jusque-là, 10 tests de `test/` sont rouges par construction : `probe_harness_records_real_decision`, `h5_carries_attested`, `harness_served_data_matches_in_process_harness`, `harness_served_sync_liq_row_follows_the_served_state`, `narabi_gate_facts_read_from_committed_sources`, `registry_notes_track_served_descriptions`, `site_ukemi_course_served_stratum_status_bound_to_served_verdict`, `fleet_register_built_set_is_frozen`, `verify_harness_ca_passes_on_the_in_process_harness`, `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces`.

## Sortie

APPROUVÉ pour fusion dans `base/chantier-moteur-2026-10-03` après CM-2a et le contrôle par diff de MONARK. Déploiement par MONARK, avec CM-2a et BTC-DIR-RETIRE-SURFACES-1, sous le go de l'investisseur.
