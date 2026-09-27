claude-opus-5-5[1m]

# G0 — journal du lot Dōjō PR-4 (piste C, site : PR-4a-1, PR-4b, PR-4a-2, PR-4c-1, PR-4c-2), sans code

- **Modèle résolu (R-1)** : `claude-opus-5-5[1m]`, préfixe `claude-opus-5-5` (décision 133), effort high (mission), contexte frais. Worker planificateur ; ne committe pas (R-20), ne lance aucun workflow.
- **Mission** : `F:/tmp/dojo/mission-g0-pr4.md` (18 l.), sha256 `d8f8d9982eb0e22d15498973bec8cc848dd055a161b37cbeb1743890c9bd8976` ; horodatage de mission 2026-09-27T07:10Z.
- **Livrable** : `docs/adr/ADR-DOJO-PR-4.md` (222 l., première ligne = modèle résolu, 0 CR, LF final), **sha256 `55fedd5b1e425a788e46ae500eb125dac3346c1dbdecd4a9e43dece573e11999`**, calculé à 07:22:10Z (`date -u`) ; non committé ; aucune édition après ce hachage. Un premier hachage (`e911597402db7f5836aa671b52b234a3c8608f1f307823d3c3c5727fb5360395`, 07:19:36Z) précède les corrections de la seconde consultation advisor ; il ne désigne plus le livrable.
- **Base** : worktree `F:/Monark-wt-dojo-c`, branche `lot/dojo-site`, HEAD `02884eb2f9f84bbbee567dc3c0b7692f6c2327ae` ; `git status` à l'ouverture : arbre propre. À la remise : `?? docs/adr/ADR-DOJO-PR-4.md`, `?? docs/G0-lot-dojo-pr4.md`.
- **Heures** (`date -u`) : 07:06:28Z (lecture de la mission), 07:11:11Z (sha256 des entrées), 07:15:28Z (début de l'écriture), 07:19:36Z (premier hachage de l'ADR), 07:22:10Z (hachage final).

## Lu (sha256 recalculés à 07:11:11Z)

| Entrée | sha256 | Lecture |
|---|---|---|
| plan `F:/Monark-wt-dojo/docs/PLAN-DOJO-PAGE-1.md` (232 l., **non committé**) | `7a333905e5686393b2da7a267648577f4c74ab242af73b7e476ebc78ea0eb28b` | en entier |
| rapport cp-1 `F:/tmp/dojo/cp1-page/CP1-report.md` (52 l.) | `769d7328e4b3f77ee00e2ccdc6a323078e583831b3f74d8d66d822b160a4a063` | en entier |
| mère, onzième pli, `F:/Monark-wt-dojo/docs/adr/ADR-DOJO-SNAPSHOT-1.md` (1 171 l., **non committée**) | `e3ec03afc592748e17c2134a38ac5dce1adc512c51644d3925b25110c8667f36` | l.3, l.373-374, l.505-510, l.1100-1171 |
| mère, dixième pli, ce worktree (1 103 l., `9cca56b` = `02884eb`) | `fc93f66c6da322c6016d6c2e0643a635543520e18026081372deb89149d35078` | §0, D-3, D-7 à D-11, D-15 à D-18, §5, §6 PR-3a à PR-4b, §7, §8, §9, §10.1 (P-10, P-11, P-26), §11 par recherche |
| `docs/adr/ADR-DOJO-PR-2.md` | `397e6d4c9e0a93033220d857187140d934e35c8ee0d19015d1a6c9199a6267a1` | en-tête, §0 (patron des sections) ; `docs/G0-lot-dojo-pr2.md` (patron du journal) |
| `F:/Monark/docs/CHANTIERS.md` (tronc, 1 795 l.) | `5c125e572a9100688fdca7f65f129743a31db35b4b40f6a1499f6d7e443ee449` | l.1760 (déc. 252), l.1762 (déc. 253), l.1783-1795 |
| `test/ci-gates.test.ts` | `f29cdf42779b6bae3a3f35ca7ef95ad2b31fdc2588861acf12ad84a7a3a1407c` | l.900-960, recherches `WIRING_TEST_ROOTS` |
| `scripts/assert-fleet-html.mjs` | `f7a1d23955b1a38740eeb1733803741977d6af30cefdc987cbb362232b67d7a4` | l.1-40, l.378-627 |
| `apps/dojo/test/helpers/dojo-fixture.ts` | `f4a26d3bffd14c01467f2ec2af5213c42d06c8c7a4fddbad78fe6b316e8d55f6` | l.1-105, exports |
| `apps/dojo/scripts/dojo-core.mjs` | `34075c6f28cad10cd10a58178cf34871fe74ca49e9c5f5b8c4f0094c305632f5` | exports, l.325-428 |
| `apps/dojo/scripts/dojo-verify.mjs` | `5867b4dff1731e149afc7a1a3b4bc4db549356a72b39ff82c7bce2341137bf9d` | recherches (bornes, `--address`) |
| `apps/site/lib/narabi-live.ts` | `e794a94736367b159a1c0548d84575f3eabe03f575a88b272ec310adceef6cfd` | l.1-80, recherches |
| `apps/site/lib/fleet.ts` | `35b28de798adcfef8d919f0a25eca3e06ce097c1c1677a47ef59ba8bf3e7850c` | l.1-60 |
| autres | — | `apps/site/app/narabi/page.tsx`, `apps/site/lib/{load-committed,load-contract,narabi-served-load}.ts`, `apps/site/components/narabi/narabi-live.tsx` (recherches), `deploy/Caddyfile.monark-narabi.snippet`, `apps/site/next.config.mjs`, `apps/bell/scripts/bell-chain.mjs` l.8-80, `.github/workflows/ci.yml` l.40-95, `test/bell-served.test.ts` l.1-40, `test/site-build-fleet.test.ts` (recherches), `F:/Monark/docs/adr/ADR-PUBLIC-CADENCE-1.md` l.269-278 |

## Décisions (une ligne, détail dans l'ADR)

- D-1 : états E0, E1, E2, EA ; TXT-4N (C-V-3), TXT-5 « sixty », TXT-3A, TXT-13 à TXT-16b candidates ; tête relue ancrée sur `keyring` et `head.line_hash` committés ; F3 mandataire de même origine recommandée contre F2 CORS et F1 synchro seule ; recherche locale, adresse jamais envoyée ; jour de validation en condition.
- D-2 : PR-4a-1 315 → PR-4b 540 (coupe de repli de la mère) → PR-4a-2 260 → PR-4c-1 430 → PR-4c-2 340 ; dates du plan §8 inchangées.
- D-3 : C-V-2 tranchée sous `test/` (`test/dojo-served.test.ts`), `WIRING_TEST_ROOTS` inchangé ; `dojo_register_is_frozen` dans `test/ci-gates.test.ts` ; aucun fichier synthétique committé ; branche E0.
- D-4 : `assertDojoBody` par état, dérivé du fichier committé ; mutants M-P16 à M-P19.
- D-5 : tests et mutants par PR ; TY-1 à TY-8 ; C-V-4, C-V-5.

## Questions

- QF-1 (F3 ou F2), QF-2 (REGISTRY-DOJO-UPCOMING-1 contre mère D-11), QF-3 (QI-1 révisée rappelée).

## Conduite

- Aucun appel réseau ; aucun navigateur ; `git` en lecture seule (`status`, `log`, `rev-parse`, `show --stat`, `worktree list`) ; aucun `GIT_DIR`, `GIT_WORK_TREE`, `--write-tree` ; rien sur C: ; écritures : l'ADR et ce journal (outil d'écriture ; retouches par script Python à remplacement exact et compté, sans heredoc portant une barre oblique inverse, HARNESS-BASH-BACKSLASH-1).
- Vérifications : numéros de la mère recontrôlés par `grep -n` (règle Branchement l.374, coupe de repli l.498, T-11 l.432, T-12 l.436, condition de G7 l.507) et corrigés avant hachage ; textes candidats passés par script au lexique interdit de la mère §8 et aux marques (0 coup ; le seul signal, le repère `{score}`, renommé `{hold_score}`) et aux chiffres (0 hors SHA-256, Ed25519).
- Advisor intégré : (1) après l'orientation, avant l'écriture : deux états de la mère à citer, plan et onzième pli non committés (C-V-6), C-V-2 à trancher avec l'emplacement de `dojo_register_is_frozen`, deux jambes du test d'égalité sans saut, aucun fichier synthétique, branche E0 de `main()`, `notFound()` non établi, prix honnête des trois formes (le « même origine » de Narabi est un `file_server` local, celui du Dōjō un mandataire), ancrage de la relecture sur `keyring` et `line_hash`, primitives recodées avec équivalence et `VERIFY_BOUNDS` par identité, textes candidats relus, R-25 recompté, question REGISTRY-DOJO-UPCOMING-1. Retenus, vérifiés sur pièce. (2) Avant la remise, sur l'ADR haché `e9115974…0395` : (a) TXT-14 (phrase de relecture) n'entre dans la liste fermée qu'au G1 de PR-4c-1 (la page de PR-4b ne promet pas une relecture qu'elle ne fait pas), mutant M-L11 ; (b) mutant M-L10 (feuille calculée sur la ligne re-sérialisée au lieu des octets servis) et ligne non canonique dans le test d'équivalence ; (c) `timeline` de `dojo-served.json` porte la ligne `anchor` entière, source committée de `validation_days`, `tier_units`, `tier_windows`, `k_reads` ; (d) préalables du G1 de PR-4a-1 nommés (C-V-6, cp-1 bref de ce G0, G7 de PR-1b-3). Faits, puis re-haché. Conseil, jamais verdict.
- Divergences avec la mission, déclarées : PR-4c-2 recomptée à 340 (mission ≈ 350, plan ≈ 200) et PR-4c-1 à 430 (plan ≈ 150), É-1 ; « mêmes sections que PR-2 » : §0 à §10 reprises (pas de sonde ni de FAITS propres à ce lot) ; le plan et le onzième pli sont cités par sha d'arbre de travail, faute de commit (C-V-6 pendante).

## Pli cp-1

- **Pli cp-1 (2026-09-27, en-tête)** : checkpoint-1 bref de ce G0 (= premier cp-1 bref de PR-4b), validateur `claude-fable-5-1`, rapport `F:/tmp/dojo/cp1-pr4/CP1-report.md` (42 l., sha256 `fdda34fa9848a8e8a93105a18d2e678bbff6af3e3b3faa82fb3358ac59161d16`, recalculé), décision ACCEPTE-AVEC-CORRECTIONS (C-V-1 à C-V-5). Pli par worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, R-1), tâche de workflow de l'orchestrateur, horodatage 2026-09-27T07:55Z ; `date -u` : 07:50:06Z (lecture), 07:54:08Z (début du script de pli), 07:54:08Z (premier hachage de l'ADR, `643e6c11…0b80`, retiré), 07:54:41Z (deuxième hachage, `ee86035e…e891`, après retrait du marqueur « + » de `git branch` dans deux noms de branche, retiré), 07:56:03Z (hachage final de l'ADR, après séparation de la citation du plan l.100 en deux fragments sans marque de gras).
- **Pli cp-1 (2026-09-27, ADR)** : `docs/adr/ADR-DOJO-PR-4.md` sha256 avant `55fedd5b1e425a788e46ae500eb125dac3346c1dbdecd4a9e43dece573e11999` (222 l.), après **`fcf1cde6c902dc10405f787512e77b20a66209e625964c7164fc8609f28ab42b`** (229 l.) ; 7 lignes insérées, aucune supprimée, 0 CR, LF final ; en-tête « Statut » non touché (orchestrateur). Lignes : C-V-1 après « Rattachement » ; textes après « Qui approuve quoi » ; C-V-2 après PR-4b du D-2 ; C-V-4 après `dojo_register_is_frozen` du D-3 et après PR-4b du §4 (M-P21) ; C-V-3 après la table MAST du §6 ; C-V-5 après la table du §7.
- **Pli cp-1 (2026-09-27, C-V-1)** : les entrées « plan » (l.15) et « mère, onzième pli » (l.17) de la table « Lu » et la divergence déclarée (l.47) se lisent désormais par commit `b876747b924bdde4b7f246815926d76034d0e640` : plan 251 l., sha256 `87db0cd99170d4240c4ab16a4b6d1c906a8c3d3c7a1affb5628eb4b5494c8154` ; mère 1 179 l., sha256 `6e1f916a28b58c570e1957784a4ca8b9922057871e77a76878659f21143d2bfe` ; rapport l.30 : « le delta avec 7a333905/e3ec03af = les lignes de pli cp-1, lues via mon rapport : aucune relecture due ». Le commit est contenu dans `lot/dojo-snapshot-1`, `lot/etude-suite`, pas dans `lot/dojo-site` (HEAD `02884eb`) : question à l'orchestrateur.
- **Pli cp-1 (2026-09-27, écarts déclarés)** : (1) le renvoi « (mère l.541 ; plan l.1177) » du rapport désigne la mère l.1177 (le plan a 251 l.) ; (2) la coupe de repli citée « 11ᵉ l.501 » à l'ADR §1.1 est à la l.500 de l'état committé ; (3) la mission de pli écrit « hôte Dōjō servi (A-1, A-6) », le rapport « hôte Dōjō servi (A-1, A-6 de l'ADR PR-3) » : forme du rapport retenue.
- **Pli cp-1 (2026-09-27, conduite)** : `git` en lecture seule (`rev-parse`, `status`, `show`, `diff`, `branch --contains`) ; deux extraits `git show b876747:<chemin>` écrits au scratchpad sur F: et comparés octet pour octet au blob ; verbatims tirés par script (Python, fichier, remplacement exact et compté, présence de chaque citation assertée dans sa source) ; aucun réseau, rien sur C:, aucun octet dans un dépôt hors ces deux fichiers non suivis. Décisions déléguées du rapport (§4) autres que DOJO-TXT-60-1 et DOJO-TXT-BEACON-1 (DOJO-PAGE-LIVE-1, DOJO-PAGE-LOOKUP-1, DOJO-PAGE-PROOF-1, DOJO-PAGE-TXT-1, DOJO-SITE-BUILD-BEFORE-DATA-1, DOJO-PR4A-CUT-1, DOJO-WIRING-ROOT-1, DOJO-TXT4-NO-VERSION-1 résolus ; QF-1 = F3 concordant) : non pliées à l'ADR, statuts de l'orchestrateur.
