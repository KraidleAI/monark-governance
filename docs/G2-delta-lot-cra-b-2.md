# G2 delta — Lot CRA-B, pli CRA-B-2 (revue bornée, contexte frais)

Relecteur G2 delta : **Opus 4.8**, modèle résolu `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme ; effort max ; Opus 5 banni non utilisé — R-1).
Worktree `F:\Monark-wt-crab`, branche `lot/cra-b`, HEAD `ef24c38` (pli CRA-B-2 sur `849e2c9`). Périmètre **BORNÉ** : `git diff 849e2c9..ef24c38` (4 fichiers). Re-exécution intégrale sur le worktree ; scratch `F:/tmp/g2-crab-2/`, `TMP=TEMP=TMPDIR=F:/tmp`, **rien sur C:**. R-20 : aucun commit, aucun workflow. R-21 : vérification adversariale, `error_origin` et verdict final = orchestrateur (G7).

Contexte : revue précédente `docs/G2-lot-cra-b.md` (récupérée du commit `2486ae3`, absente de la base `849e2c9`) ; cadre `docs/G0-lot-cra-b.md` (C-7 : jamais « ne stocke », logs mesurés ; C-2 : aucun lien SECURITY.md → docs/**).

## VERDICT : CONFORME

Les trois corrections fermées (C-G2-1..3) sont pliées et vérifiées par re-exécution. Aucun écart bloquant. Le mandat premier de C-G2-1 (« Vercel » retiré, hébergement réel rétabli) est **fait** : l'orchestrateur lit ce pli comme un pli borné réussi, pas une correction échouée. Deux **items formés non bloquants** (branchement / reproductibilité de surface publique) sont signalés ci-dessous — jamais un dû nu.

---

## C-G2-1 — hébergement/log tracés à un fichier réel (adjudication au niveau de la clause)

Falsité d'origine : « The storefront site is hosted on Vercel » (SECURITY.md) + « on Vercel » (PRODUCT-BOUNDARY.md). Correction retenue : option (a') du G2 précédent — hébergement réel rétabli **et** journal d'accès de la vitrine caractérisé.

| # | clause (fichier:ligne) | source réelle (ce que le fichier dit) | verdict |
|---|---|---|---|
| a | SECURITY.md:48 « served on the same VPS behind Caddy » ; PRODUCT-BOUNDARY.md:8 « on the VPS behind Caddy » | `docs/BASCULEMENT-COMPTE.md:34` (« site sur VPS, **pas Vercel** ») ; `deploy/Caddyfile.monark-harness:2-3` (bloc vitrine `monarkgate.tech`+www → localhost:3000 **déjà live**), `:11` (« on the SAME VPS as the vitrine ») | CONFORME |
| b | SECURITY.md:44-46 journal harnais : « commented block documenting the 2026-09-18 deployment … JSON … rotated (10 MiB x 5) … kept at most 720 h … nothing retained beyond that window » | `deploy/Caddyfile.monark-harness:26` (« deployed 2026-09-18 21:11 UTC »), bloc commenté `:29-36` (`format json` :35, `roll_size 10MiB` :31, `roll_keep 5` :32, `roll_keep_for 720h` :33), `:28` (« no IP kept beyond rotation ») | CONFORME (posture inchangée, acceptée G2 précédent pt 6) |
| c | SECURITY.md:47 « JSON format is not field-restricted, so the log includes the client address; no request body is logged » | `format json` (≠ `format filter`) émet l'IP client par défaut (divulgation honnête, anti-omission) ; `deploy/Caddyfile.monark-harness:27` (« no request body, no query string ») | CONFORME (C-7 : dit que l'IP EST journalisée) |
| d | SECURITY.md:49-50 vitrine : « its site block carries the same JSON access log format and rotation (10 MiB x 5, kept at most 720 h) » | **config** : `deploy/Caddyfile.monark-narabi.snippet:20-27` (bloc `log` **non commenté** : `roll_size 10MiB` :22, `roll_keep 5` :23, `roll_keep_for 720h` :24, `format json` :26). **DÉPLOIEMENT (preuve du présent « carries »)** : `docs/adr/ADR-M012-narabi-live-sentinel.md:200-203` — item (o) CLOS, « Caddyfile … **rechargé 09:33 UTC** (premier reload refusé : **fichier de log créé root** par `caddy validate` ; corrigé par `chown caddy` ; config précédente restée servie, 200 sans interruption) ». La cause du refus de reload est **spécifique à la directive log** ⇒ enregistrement mesuré du déploiement du bloc log vitrine | CONFORME |
| e | SECURITY.md:50 « with nothing shipped anywhere » | `deploy/Caddyfile.monark-narabi.snippet:21` (`output file …` = puits **local**, aucun `output net`) + commentaire `:19` (« nothing is shipped anywhere ») — adossé à la directive `output file`, classe « défendable » comme « no request body is logged » (G2 précédent) | CONFORME |
| f | « Vercel » absent des deux fichiers | `grep -niE 'vercel' SECURITY.md docs/PRODUCT-BOUNDARY.md` = 0 hit | CONFORME (supersède la falsité) |
| g | Aucun « ne stocke » / « does not store » (C-7) | `grep -niwE 'store\|stored'` = seul « storefront » (nom composé du site) ; « nothing retained beyond that window » adossé à `roll_keep_for 720h` (directive, pas négation nue) | CONFORME |
| h | Aucune formule probatoire (secure/verified/compliant/certified/proven/in scope/CE mark) | `grep -nwiE 'proven\|verified\|certified\|secure\|compliant' SECURITY.md` = 0 **mot entier**. Le « proven » de « **proven**ance » (SECURITY.md:24, renvoi à JOURNAL-PROVENANCE) n'est **pas** un mot entier ; la regex réelle du test `\bproven\b` (test:41) ne le capture pas — vérifié | CONFORME |
| i | Aucun lien SECURITY.md → docs/** (C-2) | `grep -niE 'docs/\|\]\(' SECURITY.md` = 0 (seule URL = advisories GitHub, :13 ; les réfs `deploy/**` sont en inline-code, pas des hyperliens) | CONFORME |

**Symétrie harnais/vitrine** : le bloc harnais est **commenté** (template) + auto-atteste « deployed 21:11 UTC » (accepté au G2 précédent) ; le bloc vitrine est **non commenté** (directive live) + enregistrement de reload explicite 09:33 UTC (ADR-M012:200-203). Le présent « carries » de la vitrine est donc adossé à une preuve **au moins aussi forte** que celle du harnais déjà acceptée — le temps présent est **exact** (bloc live, déployé), pas à affaiblir.

**Défensibilité R-21 (quel reload ?)** — deux événements distincts : (1) J0 Narabi 2026-09-17, `handle_path /narabi/*` servi (commit `b77b5f0`, « /narabi/ served by the vitrine block ») ; (2) bloc `log` (o) 2026-09-18 (commit `b505b38`, « Caddy access log snippet (o) »), **reload 09:33 UTC** dans le bullet item (o) de `ADR-M012:200-203`. La cause du refus du premier reload — « fichier de log créé root par `caddy validate` » — est **diagnostique de la directive `log`** (`handle_path`/`file_server` ne créent aucun fichier). Le reload 09:33 est donc bien celui du bloc log. **Réversion assumée de la réserve du PLI** : l'annexe PLI hedge « its insertion on the live VPS is not measured here » était **trop conservatrice** — l'enregistrement de déploiement existe (`ADR-M012:200-203`) et le worker ne l'a pas cité ; c'est pourquoi ce delta est CONFORME là où l'auteur du PLI a hésité.

---

## C-G2-2 — assertion d'appartenance surfaces() (mutant MG2 rejoué)

| attendu | mesuré | verdict |
|---|---|---|
| +1 assertion d'appartenance dans `public_surfaces_make_no_probative_claim` ; MG2 (`surfaces()` → `[README.md]` seul) rougit **exactement** sa cible ; sibling vert ; restauration sha-exacte | Assertion présente `test/public-surfaces-honesty.test.ts:114-115` : `assert.ok(files.includes(join(ROOT, "SECURITY.md")), "SECURITY.md must be a scanned public surface (surfaces(); MG2)")`. `surfaces():83` contient bien `join(ROOT, "SECURITY.md")`. Rejeu MG2 ci-dessous | CONFORME |

### Rejeu MG2 (sur le fichier réel, backup durable `F:/tmp/g2-crab-2/`, restauration byte-exacte)
- Backup : `git hash-object` = `f628be6f3af681ccec544443a36839c1afd9a4bd` (= blob committé) ; LF-sha256 = `0d10f192…`.
- Mutation : ligne 83 → `const files: string[] = [join(ROOT, "README.md")];` (SECURITY.md retiré). Diff confirmé.
- Résultat : test **ROUGE** — `✖ public_surfaces_make_no_probative_claim` ; `AssertionError [ERR_ASSERTION]: SECURITY.md must be a scanned public surface (surfaces(); MG2)` ; `tests 2 / pass 1 / fail 1` ; **exit 1**. Le sibling « scrub is load-bearing (synthetic mutants) » reste **VERT** (pass 1).
- Restauration (cp depuis backup) : `git hash-object` = `f628be6f…` (= blob committé, byte-exact) ; LF-sha256 = `0d10f1927514b7bc9b0ee39ff2b4cee30860c1018094f0ca1ac71ba0912ede78` (= PLI annexe « après ») ; `git status --porcelain` = vide.
- Contraste : avant C-G2-2, MG2 **SURVIVAIT** (table G2 précédent) ; il rougit désormais exactement sa cible.

---

## C-G2-3 — chemin Caddyfile exact

| attendu | mesuré | verdict |
|---|---|---|
| SECURITY.md:44 `deploy/Caddyfile` → `deploy/Caddyfile.monark-harness` ; le fichier existe ; `:26-36` = bloc JSON commenté du 2026-09-18 | SECURITY.md:44 cite `deploy/Caddyfile.monark-harness`. Fichier **EXISTE** (`ls deploy/`). `:26` « deployed 2026-09-18 21:11 UTC » ; `:29-36` = bloc `log` commenté (`format json`, rotation) | CONFORME |

---

## sha256 (LF-normalisé : `tr -d '\r' < f | sha256sum`) — égal à l'octet au PLI annexe « après »

| fichier | blob git (après) | LF-sha256 |
|---|---|---|
| `SECURITY.md` | `8b1a024` | `429ac43ffb6f954d10da504515a767634ca46ff24a2f7e41124a763fbd88b596` |
| `docs/PRODUCT-BOUNDARY.md` | `d61e7bb` | `f87976ba3d8e957c449609361fb2a547b60b2a2e244c109dd8c2875e77f21148` |
| `test/public-surfaces-honesty.test.ts` | `f628be6` | `0d10f1927514b7bc9b0ee39ff2b4cee30860c1018094f0ca1ac71ba0912ede78` |
| `docs/PLI-lot-cra-b.md` (docs/**, hors R-25) | `810ec76` | — |

---

## Oracles (re-exécutés ; `npm run ci` complet NON lancé — un autre oracle tourne, §F ; contrainte respectée)

| oracle | résultat | exit |
|---|---|---|
| `npx tsx --test test/cra-b.test.ts test/public-surfaces-honesty.test.ts` | **8/8** (cra-b 6 + honesty 2) | 0 |
| `npm run typecheck` | propre | 0 |
| `npm run lint` | 0 | 0 |
| `npm run lint:ratchet` | **69/69** | 0 |
| `npm run lang:gate` | **0** hit / 12 scopes gatés | 0 |
| `npm run export:check` | **0** forbidden / **0** French | 0 |

---

## R-25 (pathspec `STAT=` de `.github/workflows/ci.yml:65`, verbatim)

`git merge-base lot/etude-suite ef24c38` = `627113c3…` (**vérifié**) ⇒ le deux-points `627113c..ef24c38` **égale** le diff CI trois-points `origin/${base_ref}...HEAD`. Le nombre calculé est donc la valeur réelle de la gate.

- `git diff --shortstat 627113c..ef24c38 -- <pathspec>` = **« 11 files changed, 296 insertions(+), 1 deletion(-) »**.
- `CHANGED = ins + del = 296 + 1 = **297**` ≤ 400 (borne ADR). CONFORME.
- `--numstat` (même pathspec) : fichiers **code du delta** = `SECURITY.md` 50/0 et `test/public-surfaces-honesty.test.ts` 6/1. `docs/PRODUCT-BOUNDARY.md` et `docs/PLI-lot-cra-b.md` **ABSENTS** (exclus par `:(exclude,glob)docs/**/*.md`). Cohérent PLI : baseline G2 293 + 4 = 297.

---

## Périmètre (rien hors des 4 fichiers déclarés)

`git diff --name-status 849e2c9..ef24c38` = **exactement** 4 fichiers :
`M SECURITY.md` · `M docs/PLI-lot-cra-b.md` · `M docs/PRODUCT-BOUNDARY.md` · `M test/public-surfaces-honesty.test.ts`.
Aucun fichier hors périmètre. `git status --porcelain` = vide (après rejeu MG2, restauration byte-exacte prouvée ci-dessus).

---

## Items formés (non bloquants pour ce pli ; signalés à l'orchestrateur — jamais un dû nu)

1. **Branchement / reproductibilité de surface publique** — `SECURITY.md` est **exporté** (`WHITELIST_FILES`, `scripts/export-public.mjs:58`) et cite `deploy/Caddyfile.monark-harness` (:44) et `deploy/Caddyfile.monark-narabi.snippet` (:49). Mesuré : `collectFiles(ROOT).kept` filtré sur `deploy/` = **[]** (0 entrée ; **aucun** Caddyfile exporté ; `deploy` absent de `WHITELIST_DIRS`). La preuve de déploiement de la directive log vitrine vit dans `ADR-M012` (`docs/**`, non exporté). ⇒ un lecteur du miroir public **ne peut ouvrir** ni les Caddyfiles cités ni la preuve de déploiement. **C-2 (lettre)** vise les **liens** docs/** : aucun lien de ce type (réfs en inline-code, 0 hyperlien docs/**). Hérité de `849e2c9` (réf harnais acceptée au G2 précédent, seul le nom corrigé C-G2-3) **+** étendu par la réf narabi de ce pli. Demande à l'orchestrateur : soit exporter un pointeur vérifiable / une note « config de déploiement conservée hors miroir », soit acter l'écart de reproductibilité **avant première publication** (déclencheur : cartographie pré-release).
2. **Pointeur de preuve non joignable depuis le miroir (sous-point de l'item 1)** — le présent « carries » (SECURITY.md:49) est **exact** (bloc live) ; sa preuve de déploiement est `ADR-M012:200-203` (`docs/**`, non exporté), tandis que la citation en texte pointe la config (`deploy/Caddyfile.monark-narabi.snippet`, non exporté non plus). Aucune reformulation de la clause n'est requise (« carries » est vrai) : le seul gain serait un **pointeur joignable depuis le miroir public** vers l'enregistrement de déploiement — exactement le problème de l'item 1. Traité sous l'item 1 ; non bloquant.

`error_origin` (appréciation ; assignation = orchestrateur/G7) : C-G2-1..3 = **worker** (portées du G2 précédent). Items formés 1-2 = branchement/reproductibilité, contributifs G0 (C-2 borné à docs/** en lien) — non imputables à ce pli seul.

---

## Provenance

G2 delta bornée, Opus 4.8 `claude-opus-4-8[1m]`, effort max, 2026-09-20. Rejeu isolé sur le worktree `F:\Monark-wt-crab` ; scratch `F:/tmp/g2-crab-2/` (hors C:). R-20 : aucune écriture hors ce fichier de revue ; aucun commit ; aucun workflow. Vérification adversariale finale + `error_origin` + verdict = orchestrateur (G7).
