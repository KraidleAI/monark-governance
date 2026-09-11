# Consultation advisor-marché — ADR-M006 (distribution skills MONARK)

> **Nature** : archive de provenance d'une **consultation formée** routée par l'orchestrateur vers l'agent `advisor-marché` (`claude-fable-5-1`) le **2026-09-11**. L'avis de l'advisor est un **conseil, jamais un verdict** (R-20) : il ne produit ni ne committe ; l'orchestrateur le consigne ici et le G7/l'acceptation restent chez l'orchestrateur/validateur. Les **chiffres de marché** sont dans `docs/R-P4-skills-recon.md` ([lu], sources datées) ; ce document porte le **raisonnement de valeur** (analyse), pas des faits chiffrés nouveaux.

## Problème posé (une phrase)
La couche de distribution « skills » de MONARK répond-elle à un besoin de marché réel et sourcé, comble-t-elle un vrai gap à haute valeur côté DEMANDE, et sous quel framing honnête la publier ?

## Verdict de l'advisor-marché (conseil)

1. **`gate` gate une PRÉDICTION, pas un ACTE.** `gate(input): GateDecision` prend une `Prediction` et **n'appelle jamais** `input.tool` (D0). La douleur **démontrée** de l'écosystème agent est une douleur d'**AUTORISATION/spend** (caps $/token, seuils, skills malveillants — cf. incidents supply-chain, `R-P4` §2.5), **pas** une douleur de sur-confiance d'un prédicteur. ⇒ un opérateur qui installe un « gate » **attend un spend guard** : c'est un **risque d'honnêteté à la publication** (collision de vocabulaire), pas un atout.

2. **Gap techno réel, mais demande NON démontrée.** Le whitespace « couverture calibrée + abstention de première classe » est réel (aucun acteur nommé du paysage `$`-cap ne fait de couverture conforme). **Mais** aucun acheteur n'a payé ni réclamé une garantie de couverture : la **demande de l'objet publié n'est pas démontrée**. Discipline adversariale tenue : « whitespace » ne glisse **jamais** vers « demande », ni « demande » vers « haute valeur ». La demande démontrée (autorisation/sécurité) **ne se transfère pas** à l'objet MONARK.

3. **Framing honnête recommandé** : « **implémentation de référence** d'un gate à couverture contrôlée avec abstention de première classe + `calibrate` **BYO** — adoptez le contrat ». Jamais un spend guard ; jamais une performance ou un usage prouvé. **B_t décrit par son mécanisme** (nombre porté par l'appelant, jamais mesuré/conservé par MONARK), `allow` = verdict de couverture et non permission d'exécuter. Lignes négatives obligatoires (ADR-M006 D2).

4. **Audience** : l'amont **générique** Hermes/OpenClaw (chiffres [lu] `R-P4` §3 : OpenClaw 389 422★, Hermes 244 433★, ClawHub 9 411★), **pas** le crowd `claw-agent`/ClawPump-hébergé (`claw-agent` 9★).

5. **Stratégie** : **distribution/apprentissage d'abord, falsifiable** (ADR-M006 D8 : seuil + date). Si le signal d'adoption ne vient pas, la suite honnête est de le **dire** (jamais une revendication d'usage), pas de surclamer.

## Suite (orchestrateur)
Avis **intégré** à ADR-M006 (§1.1-1.2, D2, D8, D9). Décisions de valeur **escaladées et tranchées par l'investisseur** (2026-09-11) : E-1 (ClawHub-first), E-2 (framing référence + BYO), skill générique (pas de trading nommé), négatives SKILL-only. L'advisor n'a rien tranché : il a conseillé (R-20).
