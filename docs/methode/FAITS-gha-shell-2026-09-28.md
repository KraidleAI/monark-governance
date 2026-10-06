# FAITS — shell par défaut des étapes `run:` de GitHub Actions (lecture sur place, orchestrateur) — 2026-09-28

- **Source** [lu] : https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idstepsshell — lue le 2026-09-28 à 08:33:45 UTC (navigateur interne, horloge de la page `new Date()`).
- **Fait 1** (table « Supported platform / shell parameter / Command run internally », ligne Linux/macOS, `unspecified`) : « The default shell on non-Windows platforms. Note that this runs a different command to when bash is specified explicitly. » — commande interne : **`bash -e {0}`**.
- **Fait 2** (ligne All, `bash`) : commande interne **`bash --noprofile --norc -eo pipefail {0}`** (seulement quand `shell: bash` est écrit).
- **Fait 3** (ligne Linux/macOS, `sh`) : repli si bash absent : `sh -e {0}`.
- **Application à `.github/workflows/ci.yml`** : aucune clé `shell:` ni `defaults:` (grep du 2026-09-28 08:3x UTC) ⇒ les blocs `run:` de la CI tournent sous **`bash -e {0}`, sans `pipefail`** ; l'oracle M-3 (`scripts/oracle/run.mjs`, C-G2-6) doit reproduire exactement `bash -e`, pas `-eo pipefail` (une erreur dans un tuyau non terminal passerait en CI et rougirait localement, ou l'inverse). Réponse à Q-C3-4 (corrections M-3, tour 1).
