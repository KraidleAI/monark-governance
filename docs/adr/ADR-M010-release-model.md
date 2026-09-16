# ADR-M010 — Modèle de release du miroir public (tags + GitHub Releases)

> **Statut** : **PROPOSÉ** (2026-09-16) — G0, en attente du checkpoint-1 validateur AVANT tout code.
> **Numéro** : M010 (M009 est **réservé à ACI**, cf. ADR-M008 D8). **Rattachement** : plan post-audit
> `docs/PLAN-post-audit-narabi-repo.md` lot 4 + rulings investisseur 2026-09-16 (modèle repo = Option 1).
> Siège committeur `claude-opus-4-8` (exception Opus-seat). Aucune ligne de code écrite à l'ouverture.

## 1. Contexte
Le repo public `KraidleAI/monark` est un **miroir push-only** de la gouvernance privée (Option 1
ratifiée) : `scripts/release-public.mjs` régénère l'export et pousse des commits « Public sync <ISO> »
— **jamais de tag, jamais de Release** (gh api 2026-09-16 : 0 tag, 0 release). Conséquence : un tweet ou
un lien communautaire ne peut citer aujourd'hui qu'un commit de sync machine ou `/commits/main` (mobile),
l'anti-pattern que la constitution GitHub-Pro proscrit (« un permalien qui résout encore dans 3 ans »).
Le blocage d'export FR (fixtures Shōgen) qui empêchait tout sync est **déjà levé** (commit 6d50158,
`export:check` vert tous scopes). L'audit a **réfuté** un `CHANGELOG.md` racine et un `SECURITY.md`
(GH-01/GH-02) : les notes de release vivront sur l'**objet GitHub Release**, pas dans un fichier racine.

## 2. Décision
1. **Tags + Releases sur le miroir** : étendre `release-public.mjs` pour, après le push de sync,
   (a) créer un **tag annoté** semver `v0.MAJOR.MINOR` sur le commit de sync ; (b) `gh release create`
   depuis le tag avec des **notes de release** ; (c) taguer le **SHA gouvernance** de la même version
   (traçabilité privé↔public).
2. **Notes = argument ANGLAIS requis** (remplace le message libre), stockées sur l'objet Release —
   **pas** un `CHANGELOG.md` racine (GH-01 réfuté).
3. **Cadence** : un tag **par lot qui change la surface publique** (schéma, description d'outil, skill,
   site), **jamais par sync**. `v0.1.0` = état public **actuel** ; `v0.2.0` = F1+F2 (5ᵉ contrat additif
   = bump **mineur**). `1.0.0` = décision **humaine**, jamais un agent (les schémas ne dégèlent pas).
4. **Source de vérité de version = le tag git**. `package.json` reste `0.0.0` / `private:true` (non
   publié npm) ; `CONTRIBUTING.md` §Releases l'énonce.
5. **PR template** : sur le repo **gouvernance** uniquement (le miroir ne prend pas de PR — un PR mergé
   sur le miroir est reverté au prochain sync) ; non whitelisté, jamais exporté. Champs : ADR de
   rattachement ; schéma gelé touché (o/n, défaut non) ; surface outil touchée (o/n) ; relecteur G2 ;
   compte de tests avant/après. **Sans** les champs tweet/hop de Grok.
6. **README** : badge Release + lien vers la dernière Release (les badges CI + Apache sont déjà posés,
   lot 3). Jamais de faux « coverage % ».

## 3. Garde-fous (fail-closed)
- **Notes passées par `lang-gate.mjs` (`scanFile`) AVANT `gh release create`** : refus fail-closed sur
  un hit non exempt ou un texte vide. C'est le SEUL texte libre atteignant le public — il passe la
  même barrière anglaise que le reste (B-8 du checkpoint-1).
- **`--dry-run` étendu** (oracle, N-7) : affiche le tag + la Release + les notes, **refuse** sans notes,
  **refuse** un tag non-semver — sans jamais toucher au remote. Un `--check`/`--dry-run` vert alors que
  le sync réel échouerait serait un fail-open (classe R2(a)).
- **Garde de branche du sync** (déjà exigée par le checkpoint-1 B-3, à porter ici) : `release-public.mjs`
  refuse si la source n'est pas `HEAD == main` propre (ou exporte depuis un worktree d'`origin/main`),
  pour qu'un sync sur `lot-m008-f1` ne publie pas F1 avant F2 (ADR-M008 §3).

## 4. Ce que ça ne fait pas
Ne bascule PAS le miroir en repo de travail (Option 1 tenue). N'ajoute PAS de `CHANGELOG.md`/`SECURITY.md`
racine (réfutés). Ne touche PAS aux 4+1 contrats gelés, ni aux 4 outils MCP, ni au gate math. Ne pousse
rien : **tout sync tagué (dont le premier, `v0.1.0`) est une action SORTANTE sous go investisseur
per-action** ; le `gh repo edit` des métadonnées (topics/Website, lot 2) est un go distinct.

## 5. Alternatives écartées
`CHANGELOG.md` racine (GH-01 réfuté : notes sur la Release) ; miroir → repo de travail (Option 2/3
écartées, firewall anglais) ; tag par sync (bruit, un permalien par commit machine) ; `package.json`
comme source de version (non publié npm ⇒ la version porteuse est le set de contrats gelés, ADR-versionné).

## 6. Séquence AgileGates
G0 (cet ADR) → **checkpoint-1 validateur** → implémentation (`release-public.mjs` tag+Release+notes+garde
de branche ; `CONTRIBUTING.md` §Releases ; README badge Release ; PR template gouvernance) → **G2 fraîche**
(≠ générateur) → **checkpoint-2** → **G7** → commit local. Puis, **sous go investisseur**, le premier
**sync tagué `v0.1.0`** (action sortante). Reste hors périmètre : lot 2 (métadonnées, go distinct), F2.
