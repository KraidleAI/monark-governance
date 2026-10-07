# FAITS lus sur place — facturation GitHub Actions et runners auto-hébergés (2026-09-25, navigateur interne, orchestrateur `claude-fable-5-1`)

Niveau [lu] première main ; citations ≤ 25 mots ; heures à l'horloge `date -u` de la session (14:1x UTC).

## 1. `https://docs.github.com/en/billing/concepts/product-billing/github-actions` (14:12 UTC)
- « GitHub Actions usage is free for self-hosted runners and for public repositories that use standard GitHub-hosted runners. »
- Quotas mensuels de minutes sur dépôts privés (tableau « Free use of GitHub Actions ») : GitHub Free 2 000 ; GitHub Pro 3 000 ; Free for organizations 2 000 ; Team 3 000 ; Enterprise Cloud 50 000.
- « If your account does not have a valid payment method on file, usage is blocked once you use up your quota. »
- Tarif de base : Linux 2 cœurs x64 0,006 $ la minute (« actions_linux »).
- Mesuré chez nous le même jour (PR 92, run 36123905546) : annotation « The job was not started because recent account payments have failed or your spending limit needs to be increased ».

## 2. `https://docs.github.com/en/actions/concepts/runners/self-hosted-runners` (14:14 UTC)
- Les runners auto-hébergés « Are free to use with GitHub Actions, but you are responsible for the cost of maintaining your runner machines. »
- « Don't need to have a clean instance for every job execution. »
- Niveaux : dépôt, organisation, entreprise ; « Organization owners can choose which repositories are allowed to create repository-level self-hosted runners. »

## 3. `https://docs.github.com/en/actions/reference/security/secure-use#hardening-for-self-hosted-runners` (14:15 UTC)
- « Self-hosted runners for GitHub do not have guarantees around running in ephemeral clean virtual machines, and can be persistently compromised by untrusted code in a workflow. »
- « self-hosted runners should almost never be used for public repositories on GitHub, because any user can open pull requests against the repository and compromise the environment. »
- Sur dépôt privé : quiconque peut forker et ouvrir une PR (accès en lecture) « are able to compromise the self-hosted runner environment, including gaining access to secrets and the GITHUB_TOKEN ».
- Questions à se poser : « What sensitive information resides on the machine configured as a self-hosted runner? For example, private SSH keys, API access tokens » ; « Does the machine have network access to sensitive services? »

## Conséquences pour MONARK (lecture de l'orchestrateur, pas un fait GitHub)
- Le VPS `monarkgate.tech` sert le site et l'hôte Bell (`bell.monarkgate.tech`), dont la clé de signature Ed25519 vit sur cet hôte. Un runner sur cette machine expose cette clé à tout code de workflow ; une fenêtre publique avec un runner enregistré l'exposerait à n'importe quelle PR.
- Conditions minimales si l'option « runner sur VPS » est retenue : (a) machine ou conteneur séparé de l'hôte Bell et du site (un second petit VPS, ou un conteneur éphémère sans volume ni réseau vers les services sensibles) ; (b) runner enregistré au niveau du dépôt seul, retiré ou arrêté avant toute fenêtre publique ; (c) « Require approval for all outside collaborators » et forks interdits ; (d) aucune clé ni jeton sur la machine du runner ; (e) `runs-on: self-hosted` seulement pour les jobs qui n'ont besoin d'aucun secret.
