# PR-hip3-koyomi — PR-8 (spec HIP-3 proxy reduce-only) + PR-9 (post-mortem trade.xyz/SK Hynix) + PR-13 (archive HIP-3 / census Koyomi)

## Gate 0 — modèle résolu
Modèle sous lequel tourne cet agent : **Sonnet 5**, identifiant exact **`claude-sonnet-5`** (déclaré par le
system-reminder d'environnement : « You are powered by the model named Sonnet 5. The exact model ID is
claude-sonnet-5. »). Préfixe conforme à l'attendu `claude-sonnet-5` — pas d'arrêt requis, poursuite de la mission.

## STATUT (ligne d'état, mise à jour à chaque écriture)
- **2026-09-18T00 (init)** : squelette créé. Orientation faite : lu `PLAN-STRATEGIE.md` intégral, `ADR-M015-phase-portefeuille.md`
  (D5 intégral + contexte), `FICHES-pieces.md` (fiche Koyomi #10), `ACTU-defi-par-piece.md` (§10 Koyomi intégral,
  contient les chiffres [abs] à requalifier), `produit-G-hours-gap-hip3.md` (source primaire interne MONARK,
  MONARK SUITE racine, lu intégral). Point de départ identifié : SKHX = SK Hynix (marché HIP-3 nommé dans
  produit-G §1.1 univers v1). 2026-07-27 calculé = **lundi** (pas un jour de week-end) — élément clé de la
  requalification à instruire. Recherche externe en cours. Chercheur = Sonnet 5 (`claude-sonnet-5`), effort max,
  doc 03. Aucun commit, aucune écriture hors ce fichier et le scratchpad de session. RPC/API en lecture seule,
  aucune clé.

---

## 0. Identification / cadrage

- **Mission** : `F:\Monark\docs\etude-suite-2026-09-18\PLAN-STRATEGIE.md` §5 (lu intégralement 2026-09-18),
  lignes PR-8, PR-9, PR-13 ; `F:\Monark\docs\adr\ADR-M015-phase-portefeuille.md` D5 (lu intégralement) : « Koyomi
  = seule nouvelle pièce instruite (T2), par census avant tout G0. Variable : gap log-return entre la marque
  HIP-3 clampée et le premier print de l'oracle du déployeur à la réouverture ; Mondrian par marché (jamais
  poolé) ; seuils pré-enregistrés avant pull ; held-out 2026-07-27 **recomputé** (les chiffres −19 %/57 M$/17 M$
  sont [abs]/[lu presse]) et requalifié (pré-marché de semaine, pas week-end : le cadrage de `produit-G` est trop
  étroit pour son propre meilleur cas) ; profondeur d'archive HIP-3 mesurée. G0 seulement si non dégénéré **et**
  acheteur nommé ; sinon clôture négative. »
- **État interne déjà connu avant recherche externe** (pour ne pas re-découvrir ce qui est déjà écrit, et pour
  cibler la vérification primaire) :
  - `ACTU-defi-par-piece.md` §10.1 « Incident nommé n°2, 27 juillet 2026 » : source **WebSearch [abs]**
    (finance.yahoo.com, cryptopotato.com, thecurrencyanalytics.com), **non ouvertes en détail** — exactement le
    trou que PR-9 doit combler avec du primaire.
  - Chiffres internes déjà circulants (à vérifier, jamais recopiés sans re-source) : « ~57 M$ de liquidations,
    ~17,3 M$ de pertes réalisées », mouvement action SK Hynix « -29,96 % sous son cours de clôture précédent sur
    le pré-marché NextTrade (Corée du Sud) », trade.xyz aurait « annoncé qu'il couvrirait les pertes de
    liquidation ».
  - `produit-G-hours-gap-hip3.md` §1.1 : fenêtre visée par le produit = **53 h, vendredi 21:00 UTC → dimanche
    21:59 UTC** (« DST-aware »), univers v1 nommé = 5 marchés dont **« NVDA ou SKHX »**. Le 27 juillet 2026 est un
    **lundi** (calculé cette session, `date -d "2026-07-27"` → Monday) : un incident un lundi ne peut pas être
    dans la fenêtre 53 h vendredi-dimanche telle que définie — première confirmation interne de la piste
    « requalification » avant toute source externe.
  - `ADR-M015` §Contexte point 3 : « held-out 2026-07-27 à recomputer » cité comme fait établi par l'inventaire.
- **Portée des trois PR** :
  - PR-8 : spec primaire Hyperliquid des « proxy actions reduce-only » + allowlist on-chain — qui peut émettre
    une action reduce-only pour un tiers, sous quelles conditions, statut mainnet à septembre 2026. Usage :
    faisabilité d'un « flatten » tiers (Koyomi) indépendant de la demande (le compte cible doit pouvoir déléguer
    à Koyomi le droit de réduire sa position sans lui donner un droit d'ouverture/retrait).
  - PR-9 : post-mortem trade.xyz/SK Hynix 2026-07-27 23:01 UTC, sources primaires seulement (blog, X, forum
    trade.xyz) ; presse = [2nd] explicitement.
  - PR-13 : API publique Hyperliquid (`info` endpoint) — récupération par marché HIP-3 de la marque clampée
    avant fermeture et du premier print de l'oracle du déployeur à la réouverture ; profondeur d'historique ;
    limites de débit ; sans clé ; test réel avec résultat brut copié ; liste des 144 marchés si possible (nom,
    déployeur, heures d'ouverture).
- Aucun appel à l'advisor intégré pendant cette extraction (consigne de mission + CLAUDE.md « filtre de
  régurgitation »). Blocages éventuels consignés en fin de fichier comme demande de consultation formée.

---

## PR-8 — Spec primaire HIP-3 : proxy actions reduce-only + allowlist on-chain

*(section en cours de rédaction — recherche en cours)*

---

## PR-9 — Post-mortem trade.xyz / SK Hynix (2026-07-27, 23:01 UTC)

*(section en cours de rédaction — recherche en cours)*

---

## PR-13 — Archive HIP-3 (API `info`, census Koyomi K-0)

*(section en cours de rédaction — recherche en cours)*

---

## Contradictions relevées

*(à compléter)*

---

## NON TROUVÉ

*(à compléter)*

---

## Demandes de consultation formées

*(à compléter si blocage)*

---

## Journal des URL (fetches réussis et échoués)

*(à compléter au fil de l'eau, format : `[date] URL — méthode — HTTP/statut — résultat bref`)*
