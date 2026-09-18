# PR-stables-kaiko — PR-3 (scouting admissibilité USDS/PSM · PYUSD · LUSD/BOLD) + PR-10 (Kaiko Best Execution)

## STATUT (ligne d'état, mise à jour à chaque écriture)
- **2026-09-18T00 (init)** : squelette créé, orientation faite (plan, avis, script census, docs internes déjà
  existants lus). Recherche en cours. Chercheur = Sonnet 5 (`claude-sonnet-5`), effort max, doc 03. Aucun
  commit, aucune écriture hors ce fichier et le scratchpad de session.

---

## 0. Identification / cadrage

- **Mission** : PLAN-STRATEGIE.md §5 (`F:\Monark\docs\etude-suite-2026-09-18\PLAN-STRATEGIE.md`, lu intégralement
  2026-09-18) — ligne PR-3 (« Scouting PSM Sky/Maker, PYUSD, LUSD/BOLD [nommés par l'advisor-defi] — clôture du
  critère d'admissibilité — bloque P3 ») et ligne PR-10 (« Kaiko Best Execution : grille et périmètre CASP —
  seul précédent de pricing réglementaire [Kessai] — bloque hors 12 mois »).
- **Critère d'admissibilité à appliquer** (source : `AVIS-advisor-defi-2e-cle-c-prime.md` §4, verbatim, 27 mots) :
  > « population admissible pour un `AttestedFlow` mono-chaîne seulement si son mécanisme inter-chaînes ne
  > brûle pas sur mainnet (lock-and-mint, USDe OFT) ou brûle depuis un `from` distinct et séparable (USDC :
  > CCTP `TokenMinter` ≠ Circle) ; burn-and-mint natif par le même AP (FDUSD, PYUSD probable) : non. »
  Ce critère porte spécifiquement sur le **mécanisme inter-chaînes** (bridge) — distinct du critère « une seule
  loi de burn on-chain » déjà utilisé ailleurs dans la base MONARK (voir point de vigilance ci-dessous).
- **Point de vigilance déclaré avant recherche** : `docs/biblio/next-piece-2026-09-18/INVENTAIRE-stables.md`
  (lu 2026-09-18, passe antérieure, chercheur non identifié dans le fichier) contient déjà des verdicts
  provisoires **« Refuser »** pour LUSD (V1), BOLD (V2) et USDS, mais sous un **critère différent** : « une
  seule loi de mint/burn » (structure CDP/multi-branches), PAS le critère inter-chaînes de l'AVIS §4 sur lequel
  porte cette mission. La mission qualifie ces trois populations de « non scoutées » — ce qui est vrai **pour
  le critère inter-chaînes spécifique** (aucune des deux passes précédentes ne traite bridge/`trim()`/PYUSD) mais
  **faux pour le critère « une loi »** sur USDS/LUSD/BOLD. Cette divergence de portée est signalée ici comme
  fait, pas tranchée par moi (l'extraction reste la mienne, le verdict reste à l'orchestrateur). Les deux
  verdicts (ancien critère vs critère AVIS §4 d'aujourd'hui) sont rapportés séparément plus bas, sans être
  fusionnés.
- **Script de référence cité par la mission** : `F:\Monark\scripts\census\burns-by-burner.mjs` (lu intégralement
  2026-09-18) — census RPC lecture seule, quorum sur 2 providers distincts, décompose `Transfer→0x0` par `from`,
  paramétré par token dans un objet `TOKENS`. **Ce fichier appartient au dépôt de code F:\Monark et n'est PAS
  modifié par ce chercheur** (restriction de rôle : écriture strictement confinée à ce fichier d'archive) — la
  mission autorise explicitly « un appel équivalent » comme alternative, retenue ici : un script autonome
  équivalent est écrit et exécuté depuis le scratchpad de session (hors dépôt), réutilisant la même logique
  RPC lecture-seule sans clé (voir §3.2).
- Aucun appel à l'advisor intégré pendant cette extraction (consigne de mission + CLAUDE.md « filtre de
  régurgitation »). Blocages éventuels consignés en fin de fichier comme demande de consultation formée.

---

## PR-3 — Scouting d'admissibilité (critère AVIS §4)

*(section en cours de rédaction — recherche en cours)*

---

## PR-10 — Kaiko Best Execution (MiCA art. 78)

*(section en cours de rédaction — recherche en cours)*

---

## Contradictions relevées

*(à compléter)*

---

## NON TROUVÉ

*(à compléter)*

---

## Procurements formés (nouveaux, le cas échéant)

*(à compléter)*

---

## Journal des URL (succès et échecs, avec date)

*(à compléter au fil de l'eau)*
