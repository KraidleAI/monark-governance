# G2 — Revue du lot F-site-9a-i (modèle / machine / audit du diagramme vivant)

- **Relecteur** : instance FRAÎCHE **`claude-opus-4-8[1m]`** (R-1), ≠ générateur (worker `claude-opus-4-8[1m]` du G1, instance distincte), 2026-09-18 ; zéro
  écriture dans le dépôt, mutants par apply-and-revert avec preuve sha256 identique, aucune commande git. Base pinnée HEAD `2e5b4bf` ; HEAD a avancé à
  `ba71cae` (ADR-M013, orchestrateur) pendant la revue sans toucher les 8 fichiers du lot (sha identiques avant/après).

## Verdict : **APPROUVÉ-AVEC-CORRECTIONS** (4, toutes documentaires, aucune bloquante) — appliquées par l'orchestrateur

- Provenance 8/8 exacte (sas-model 8354a8a5, sas-machine a10a710a, sas-audit 3203b910, use-sas-state 6b5c6b25, tests 46ce68bb/fe1b0dd8/878f9e44, ADR 275c23f8).
- Oracle rejoué : `ci` 263/263, typecheck nodenext 0, `tsc -p apps/site` 0, lint 0, ratchet 69/69, lang 0, export 0, vocab 133, `diff --check` 0.
- `frozen_contract_fields_stay_dynamic` recalculé (26 champs, carve-out `action`) sur `components/sas/**` : 0 hit ; troisième action jamais émise.
- Sémantique vs modèle : 11 pièces = FLEET_AGENTS sans recopie ; Hikae = {calibrate, gate} ; MONARK conteneur ; 8 profils, `path = engineKeys` ; VISAGE ⇒
  spine seule ; 12 codes ≠ covered → exactement une chambre ; indices audit corrects vs schémas ; S0-S4 fermés + I1-I5.
- Mutants rejoués : M2 (`MONARK must not be a piece`), M4 (`upstream_timeout … coverage hole`), M10, M10-bis (`SPINE must be defined exactly once`),
  M6 (I2), M7 (I3) — tous rouges, restaurés octet-identique ; contrôles négatifs X-A/X-B verts (angle mort documenté, C-4).
- Portabilité : `import type … .ts` seulement dans les 3 modules purs ; hook client = exception assumée.
- ADR D18 : (b) zéro dépendance ✔ ; (c) phrases présentes mais pré-rectification → C-1 ; (d) sourcé BRIEF 6/6 bis ✔.

### Corrections (error_origin)
- **C-1** ADR:217 phrases de cadrage périmées (« no partnership », « on every chain ») → rectifiées (« No endorsement. » / « … Examples, no endorsement. ») ;
  bande blockchains annotée superseded par BRIEF 6 quater. *error_origin* : **orchestrateur** (rectification C-2 du plan 9a-ii postérieure à la transmission au worker).
- **C-2** ADR:214 « act » ≠ id `agir` → « agir (id `agir`, libellé rendu « act » en 9a-ii) ». *error_origin* : générateur.
- **C-3** G1 l.23 « aucune valeur de `lib` » trop large (le hook importe `PICKER_PROFILES`) → restreint aux 3 modules purs. *error_origin* : générateur.
- **C-4** `sas-model.ts:110-111` commentaire « nor outrun » non étayé (clé surnuméraire hors enum non détectée) → resserré. *error_origin* : générateur.

### Observations (backlog 9a-ii « animation d'états », non bloquantes)
(a) `budgetLow` depuis S2 met `brume:null` sans re-déposer la brume (§8 S3) ; (b) seule `calm` rouvre la vanne (§8 : « la vanne rouvre » quand des labels
arrivent) ; (c) `clockClose` sans brume ré-étiquette en S2 depuis n'importe quel état. Voir PLAN 9a-ii §8 C-5 (checkpoint-2 C-4).
