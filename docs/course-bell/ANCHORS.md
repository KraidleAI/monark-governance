# ANCHORS — Bell course counter-verification (C-F-4, décision 124 = option B)

> **TEMPLATE proposé** (worker `claude-opus-4-8[1m]`, 2026-09-22T00:53:46Z). Emplacement cible : `docs/course-bell/ANCHORS.md`.
> **Rempli et committé + POUSSÉ par l'ORCHESTRATEUR** (R-20 : jamais le worker). Une frontière = **une ligne** du tableau + le
> `manifest.txt` de la frontière + sa preuve OTS, **dans le même commit**. Pré-enregistré au pli du G0 de course
> (`G0-lot-t1a-ii-b3d-course.PLIE.md` §5) ; **format freezable** au commit de ce pli.
>
> **Préalables (décision 124), AVANT le premier `ots stamp`** : (1) lecture SUR PLACE des conditions d'usage OpenTimestamps par
> l'orchestrateur (règle « lecture sur place » 2026-09-20) ; (2) **go investisseur EXPLICITE** pour le premier appel externe.
> Un refus d'outil / certificat invalide / CAPTCHA n'est **jamais contourné** (consigner « non contourné » + procurement formé).
>
> **Limite (ADR D1-octies, décision 124(3), verbatim)** : « L'ancrage prouve l'**antériorité de la tête de chaîne à la date de
> l'ancre**, PAS la provenance des pages ni l'exécution du scan. »

## Format d'UNE ancre

**Manifeste de tête `<boundary>[-<mint>]-manifest.txt`** (objet horodaté par OTS) — texte déterministe, rejouable byte-pour-byte :
```
# une ligne "<relpath> <sha256hex>" par artefact pertinent de la frontière,
# TRIÉ par <relpath> en ordre d'octets ; fins de ligne LF ; aucun espace de fin ; un LF final ;
# sha256 en minuscules 64-hex ; <relpath> relatif à la racine de l'état --out publié.
```
Artefacts par frontière :
- `probe_end` : `budget.json`, toute `ledger-<MINT>.jsonl` page-1 du point (a), `sonde-report.json` (relpaths a la racine `--out`, sans prefixe — ruling GO1-B).
- `mint_start` (mint M) : `bell-b3d-run/budget.json`, ledgers déjà présents (M pas encore écrit).
- `mint_resume` (mint M) : `bell-b3d-run/budget.json`, `bell-b3d-run/ledger-<M>.jsonl` (partiel).
- `mint_end` (mint M) : `bell-b3d-run/ledger-<M>.jsonl` (complet), `bell-b3d-run/crosscheck-<M>.json`.
- `final` : les 4 `bell-b3d-run/crosscheck-<MINT>.json`, `bell-b3d-run/crosscheck-report.json`, `bell-b3d-run/budget.json`.

**Encodages freezables** : `date_u` = `date -u +%Y-%m-%dT%H:%M:%SZ` (ISO-8601 Z, mesuré) ; `boundary` ∈ énum FERMÉE
`{probe_end, mint_start, mint_resume, mint_end, final}` ; `mint` ∈ `{TSLAx, AAPLx, NVDAx, SPYx, n/a}` ; tous les sha en minuscules 64-hex.

## Tableau des ancres (à remplir par l'orchestrateur)

| date_u | boundary | mint | manifest_sha256 | entry_sha256 | ledger_sha256 | commit | ots_ref |
|---|---|---|---|---|---|---|---|
| 2026-09-22T14:07:18Z | probe_end | n/a | `ea83d5460a41abca8ab2385c306602cb38a09edaf6b8c507cff48f1423e05803` | n/a | n/a | `c05e37c` | `probe_end-manifest.txt.ots` |
| 2026-09-22T14:11:33Z | mint_start | TSLAx | `58b83d36c0ba613900df879a3b4bd1ddb2ed300450ddb801d024810fc86e6c7d` | n/a | n/a | `e12ee3a` | `mint_start-TSLAx-manifest.txt.ots` |
| 2026-10-1XTHH:MM:SSZ | mint_end | TSLAx | `<…>` | `<entry_sha256 dernière ligne ledger-TSLAx>` | `<ledger_sha256 crosscheck-TSLAx.json>` | `<…>` | `mint_end-TSLAx-manifest.txt.ots` |
| … | … | … | … | … | … | … | … |
| 2026-10-1XTHH:MM:SSZ | final | n/a | `<sha256 du manifest.txt final>` | n/a | n/a | `<…>` | `final-manifest.txt.ots` |
| 2026-09-22T14:22:42Z | mint_resume | TSLAx | `fd7564f5dda3db3059ef3efdc5f359143b29b32517c212df331b1b0a81624f25` | n/a | n/a | `f7b7bc5` | `mint_resume-TSLAx-manifest.txt.ots` |
| 2026-09-22T14:45:45Z | mint_resume | TSLAx | `70f577a906e56801419880b88f31c38af3ca4f201014e9dfeaf6b48bdc4445e3` | n/a | n/a | `34ba979` | non horodatee (collision de nom `.ots` du 1er mint_resume ; remplacee par la ligne suivante, ANCHOR_SEQ=2) |
| 2026-09-22T14:46:26Z | mint_resume | TSLAx | `70f577a906e56801419880b88f31c38af3ca4f201014e9dfeaf6b48bdc4445e3` | n/a | n/a | `ca05c1c` | `mint_resume-TSLAx-2-manifest.txt.ots` |
| 2026-09-22T16:51:20Z | mint_resume | TSLAx | `178f879ffbaf7d4329b332f7492ca8e58b92891bf2c0c0f1ddf3a1a49950f748` | n/a | n/a | `88cb5f9` | `mint_resume-TSLAx-3-manifest.txt.ots` |

- `entry_sha256` = `entry_sha256` de la dernière ligne de `ledger-<mint>.jsonl` **là où elle existe**, sinon `n/a`.
- `ledger_sha256` = champ `ledger_sha256` de `crosscheck-<mint>.json` (à `mint_end`), sinon `n/a`.
- `commit` = SHA git du commit ajoutant cette ligne + `manifest.txt` + la preuve OTS (committé ET poussé).
- `ots_ref` = chemin relatif de la preuve OTS du manifeste (pendante d'abord, mise à niveau Bitcoin ensuite).

## Procédure OTS (abstraite — invocation exacte À LIRE SUR PLACE, décision 124 préalable (1))
1. Construire `<boundary>[-<mint>]-manifest.txt` (règles ci-dessus) ; relever `manifest_sha256`, `entry_sha256`/`ledger_sha256` où ils existent.
2. **stamp** du manifeste ⇒ preuve **pendante** (calendrier). Committer + POUSSER `manifest.txt` + preuve pendante + la ligne du tableau.
3. Plus tard : **upgrade** de la preuve ⇒ preuve **attestée Bitcoin**. Committer + POUSSER la preuve mise à niveau.
4. **Aucun délai de confirmation n'est chiffré** (page primaire n'en donne aucun ; à observer sur place). B1 = le push (témoin faible,
   date serveur, même opérateur) ; **B2 = OTS (témoin indépendant, Bitcoin)** = le seul qui ferme C-F-4.

## Vérification par un tiers
1. Récupérer `manifest.txt` + `ots_ref` au `commit` de l'historique poussé.
2. Recomputer `sha256(manifest.txt)` ⇒ doit `== manifest_sha256`.
3. **Vérifier la preuve OTS** (`ots verify …`, client ouvert) ⇒ instant Bitcoin **avant** lequel le manifeste existait.
4. Si le ledger est publié (item formé décision 124(b)) : recomputer les sha des artefacts listés et re-tirer une page au hasard (~10 cr) pour comparer.
5. Le commit git est un **second témoin, plus faible** (date serveur).
6. Borne : antériorité de la tête à la date de l'ancre — **pas** la provenance des pages ni l'exécution du scan (ADR D1-octies).
