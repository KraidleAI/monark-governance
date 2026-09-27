# FAITS — lecture sur place, lot PUBLIC-CADENCE-1 (FAITS-PUBLIC-CADENCE-REREAD-1), 2026-09-26 22:0x UTC

Orchestrateur `claude-fable-5-1`, navigateur interne, [lu] première main. Complète (ne remplace pas) les 16 GET `curl` du worker G0 (journal §6, niveau [lu-worker]).

## 1. `docs.github.com/en/actions/concepts/security/github_token` (lu 22:0x UTC)
- « At the start of each workflow job, GitHub automatically creates a unique GITHUB_TOKEN secret » ; « The GITHUB_TOKEN secret is a GitHub App installation access token » ; « The token's permissions are limited to the repository that contains your workflow ».
- Durée : « expires when the job finishes » ; hébergé GitHub : 6 h au plus.
- Récursion : « if a workflow run pushes code using the repository's GITHUB_TOKEN, a new workflow will not run » (sauf `workflow_dispatch`/`repository_dispatch`, et `pull_request` en attente d'approbation).
- Conséquence pour Q-7 (A) : un workflow dans `monark-record` ne peut écrire que dans `monark-record` (borne structurelle de A-7), sans secret stocké, sans boucle de déclenchement.

## 2. `docs.github.com/en/actions/tutorials/authenticate-with-github_token` (lu 22:0x UTC)
- « you should always make sure that actions only have the minimum access they require by limiting the permissions granted to the GITHUB_TOKEN » ; clé `permissions` au niveau du workflow ou du job (exemples : `contents: read`, `issues: write`).
- Pour un pouvoir hors `GITHUB_TOKEN` : GitHub App ou PAT en secret (= repli (B), à éviter).
- Conséquence : le workflow `monark-record` déclare `permissions: contents: write` et rien d'autre ; lecture du miroir public sans jeton.

## 3. `docs.github.com/en/code-security/concepts/secret-security/secret-scanning` (lu 22:0x UTC)
- « Public repositories: Secret scanning runs automatically for free. » ; « Organization-owned private and internal repositories: Available with GitHub Secret Protection enabled on GitHub Team or GitHub Enterprise Cloud. »
- Balayage : tout l'historique git, toutes branches, plus issues, PR, Discussions, wikis.
- Conséquence : A-1 sur le miroir et sur `monark-record` = gratuit et automatique ; sur la gouvernance privée = produit payant (Team/Enterprise), décision investisseur ; prix non lu ici.

## 4. Non relu sur place (reste [lu-worker], GET du G0)
Releases (`gh release`), `git-tag` « On Re-tagging », facturation Actions (FAITS du 25/09 fait foi), catégories de Discussions.
