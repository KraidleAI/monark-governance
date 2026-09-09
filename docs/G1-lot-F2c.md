# G1 — Journal de génération, lot F-2c (vitrine MONARK : roadmap flotte + 8 teasers + câblage segment→produit)

> **Exclu R-25** (docs/G1-lot-*.md) et **exclu de l'export public** (ADR-M004 D7, liste noire `docs/G1-*`).
> Doc de gouvernance FR — non scanné par le gate de langue (`lang-gate` SKIP_DIRS = docs) ni par le gate
> vocab (scopes : packages src / atelier / monark / apps-site — **jamais docs/**). Il peut donc citer
> verbatim les noms de plateformes/segments retirés de la copy.

## 0. Générateur, Gate 0, contexte

- **Générateur (worker d'implémentation)** : `claude-opus-4-8` (préfixe résolu **`claude-opus-4-8[1m]`**, contexte 1M), effort `max`. **Gate 0 (R-1) déclaré et conforme** en tête de session ; pas `claude-opus-5` (banni).
- **Date** : 2026-09-09. **Worktree** : `F:\Monark-wt-f2c`, branche `lot-f2c`, **base `main = bee7ad7`** (F-2b mergé, PR #17). **Mono-agent (C10)**.
- **Rattachement** : `docs/PLAN-F2c-lot.md` v2 (checkpoint-1 ACCEPTÉ-AVEC-CORRECTIONS C-1..C-11) + `docs/adr/ADR-M004-infrastructure-plateforme.md` **addendum D14**.
- **Réviseur ≠ générateur** : la revue G2 (`docs/G2-lot-F2c.md`) est due à une instance séparée à contexte frais (non écrite par ce worker). **R-20** : ce worker **ne committe pas** ; l'orchestrateur committe.
- **`error_origin` du worker précédent (C-11)** : le worker d'implémentation antérieur est **mort sur limite de session** (usage quotidien Opus, mesure ADR-M004 §1.2) ; sa partielle (pré-C-2) a été **jetée** par l'orchestrateur (PLAN en-tête, Statut : « partielle pré-C-2, non vérifiée »). `error_origin = outillage / limite de session` (pas une erreur de générateur ni de spec). Trace matérielle : des artefacts périmés `apps/site/.next/server/app/roadmap/*` (gitignorés) subsistaient du run mort ; **supprimés** (`rm -rf apps/site/.next`) avant le build final — sans effet git (gitignoré).

## 1. Fichiers créés / modifiés

| Fichier | Nature | +/- (numstat vs main) |
|---|---|---|
| `apps/site/lib/fleet.ts` | **créé** — registre de flotte (joyau C-2) : 11 agents (3 built + 8 upcoming) + 5 produits (tous upcoming), chacun `status` | +169 / 0 |
| `apps/site/app/roadmap/page.tsx` | **créé** — route `/roadmap` (server component) : phrase deux-étages, 3 built en renvoi `/#fleet`, 8 teasers | +94 / 0 |
| `apps/site/components/upcoming-panel.tsx` | **créé** — placeholder produit `upcoming` (client) : schéma câblage SVG, un seul badge | +102 / 0 |
| `apps/site/app/page.tsx` | **modifié** — Home : 5 segments → `UpcomingPanel`, révision `act`/commentaire/phrase, ancre `id="fleet"`, lien → `/roadmap`, retrait import `StatusBadge` devenu inutilisé | +25 / -28 |
| `test/ci-gates.test.ts` | **modifié** — +2 tests racine (C-2 `fleet_register_built_set_is_frozen`, C-4 `vocab_site_scope_bans_third_party_platforms`) + imports | +108 / -1 |
| `vocab-banned.json` | **modifié** — scope `site` étendu de 9 patterns plateformes tierces + commentaire | +11 / -1 |
| `docs/PLAN-F2c-lot.md` | **artefact G0** (présent, non committé — voir §7) | +68 / 0 |
| `docs/adr/ADR-M004-…D14` | **artefact G0** (addendum D14, présent, non committé — voir §7) | +3 / 0 |
| `docs/G1-lot-F2c.md` | ce fichier (exclu R-25) | — |

**Non touchés** : `schemas/`, `packages/` (`git diff main -- schemas/ packages/` = **vide**, vérifié §6).

## 2. Les 8 phrases finales (verbatim rendu) + « retiré de la source » par agent

Wording **byte-identique** au PLAN §2 (vérifié §3). Rendu sur `/roadmap` via `{agent.line}` (accès de propriété → jamais un littéral scanné par test 44 ; le trou numérique est fermé par un scan dédié, §5). « Retiré de la source » = transformation **deck → phrase** (archive `f2c-agents-descriptions.md` §3, [lu]).

1. **Mokugeki** — *Mokugeki attests the facts it extracts from a document or an event, without adding sentiment or interpretation.*
   - Retiré : exemples de type de document (« 8-K », « unlock », « injury ») → génériques ; rien de commercial/chiffré/daté.
2. **Narabi** — *Narabi watches for the signals that a redemption run has begun, such as a burn spike, a lengthening redeem queue, or a witness going silent.*
   - Retiré : le **code d'erreur « 404 »** (chiffre) → reformulé « a witness going silent » ; le segment Exhibit 02 « Stablecoin curator / wrapped treasury » (non repris, règle « jamais pour qui »).
3. **Kaihi** — *Kaihi exits a liquidity range — minting or burning it — ahead of toxic order flow.*
   - Retiré : segment/plateformes « Vaults LP — **Arrakis**, **Gamma**, curators » ; le modèle de rémunération « payé sur le LVR évité » ; le « signal z » (détail de mécanisme, omis pour tenir en une phrase).
4. **Kessai** — *Kessai routes a swap to a venue and issues a settlement receipt for the execution.*
   - Retiré : segment « DAO / agents — **Safe**, **Hermes** » ; le chiffre « **20-30 % des bps** » ; superlatif « best venue » adouci en « a venue » ; « pas un solver » non intégré (une seule clause).
5. **Kamae** — *Kamae quotes both sides of a market from inventory, and stays silent when told to abstain.*
   - Retiré : plateformes « **Polymarket** / **Kalshi** » ; le modèle « Avellaneda-Stoikov ».
6. **Kyokusen** — *Kyokusen fits a yield curve across maturities and gates rollovers and looped positions against it.*
   - Retiré : segment « Trésorerie taux — **Pendle** » ; jargon « PT/YT » → « maturities » ; « Nelson-Siegel » ; « module pas flagship ».
7. **Koyomi** — *Koyomi flattens leveraged exposure ahead of a recurring weekend trading-window closure.*
   - Retiré : le chiffre « **53h** » (durée exacte) → « a recurring weekend trading-window closure » ; « **HIP-3** » (protocole tiers, lié au client « trade.xyz »).
8. **Genkan** — *Genkan is the point every transfer, swap, or signature passes through first, returning a commit, defer, or abstain decision along with the remaining budget.*
   - Retiré : distributeur « **OpenClaw** », « **MCP** » ; variable interne « B_t » → « the remaining budget » ; harnais « claw-agent »/**Hermes** ; formulations commerciales « MONARK's storefront without explaining MONARK », « sold as a tool ».

## 2bis. Provenance de la copy PRODUIT (5 `fn` + câblages + `connects`) — ROADMAP §9.2 [lu]

Les 5 `fn`, les 15 libellés `wiring` et les 5 `connects` sont une **composition générique dérivée par soustraction** de `F:\Clawpumptech\ROADMAP-MONARK.md` **§9.2 (l.187-199), lue directement par ce worker ce jour → [lu]** (hors-git / confidentiel, même statut que le deck §4 ; C-3 « sourcé ROADMAP §9.2 »). Table §9.2 (Produit | Fonction | Câblage capteur→gate→acte | Profil | Statut moteur) :

| Produit | ROADMAP §9.2 « Fonction » / « Câblage » [lu] | Rendu (généricisé) | Généricisé / retiré |
|---|---|---|---|
| Softlanding | « survivre à une liquidation sur prêt (Aave V4, enchère hollandaise) » ; « α Ukemi-V4 : capteur santé-position → gate → réduire/sortir » | fn « …ease the exposure down before it clears. » ; sensor « Ukemi reads the position », act « ease the exposure down » | « Aave V4 »/« enchère hollandaise » → « a lending venue » |
| Firebreak | « ne pas être happé par une cascade d'auto-désendettement (ADL) sur perp DEX » ; « γ Ukemi-ADL : capteur file ADL / fonds d'assurance → gate → dé-risquer » | fn « Ride out an auto-deleveraging cascade on a perp venue rather than be caught in it. » ; sensor « Ukemi reads the deleveraging queue », act « de-risk before it hits » | « perp DEX » → « a perp venue » ; « fonds d'assurance » omis |
| Verdict | « trancher l'événement a-t-il eu lieu (commit/defer/abstain) » ; « β event/UMA : capteur preuves de résolution → gate → verdict » | fn « Turn a raw event call into a coverage-controlled, settled decision. » ; sensor « an attested event », act « settle the call » | **« UMA » retiré (C-1)** ; aucun agent-moteur nommé |
| Warden | « porte à moindre privilège sur une trésorerie Safe » ; « δ Genkan-Safe : capteur tx proposée → gate (moindre privilège) → admettre/defer/abstain » | fn « Put a least-privilege gate on a treasury a DAO or another agent controls. » ; sensor « a spend or a signature », act « commit, defer, or abstain » | **« Safe » → « a multisig treasury »** (mot ambigu, non banni, §9.4) |
| Ballast | « trésorerie stable quand la courbe de taux bouge » ; « capteur exposition surface de taux → gate → couvrir/rééquilibrer » | fn « Hold a rate treasury steady as the yield curve moves. » ; sensor « the rate surface », act « hedge or rebalance » | rien de propriétaire à retirer |

**Correction post-lecture (doc 03, sources AVANT travail)** : une première rédaction de `fleet.ts` avait Firebreak = « redemption run on pooled collateral » et Ballast act = « gate rollovers and loops » — **non conformes à §9.2** (Firebreak = ADL/perp ; Ballast = couvrir/rééquilibrer). Après lecture directe de §9.2, réconciliés (Firebreak fn+wiring+connects ; Ballast act ; Warden fn resserré sur « moindre privilège »). Softlanding/Verdict déjà fidèles, inchangés. Le nœud *gate* nomme « Hikae and the MONARK budget » (backbone partagé, colonne distincte de l'agent-moteur en §9.2) — **jamais** l'agent-moteur (C-1 pour Verdict). Les `fn`/`act` rendus sont **soumis au checkpoint-2** (C-3).

## 3. Les « 2 écarts vs archive » (C-5) — FINDING, vérifié (pas un [2nd])

C-5/PLAN §2 annonce « le G1 signalera les 2 écarts vs archive : Narabi « such as », Genkan « along with » ». **Vérification reproductible** (`scratchpad/cmp-phrases.mjs`, comparaison caractère-par-caractère des 8 phrases entre PLAN §2, archive §8 table, archive §3 « Phrase proposée », et `fleet.ts`) :

```
ALL EQUAL (PLAN==table==prose==fleet for all 8): true
Narabi 'such as'    -> PLAN: true  table: true  prose: true
Genkan 'along with' -> PLAN: true  table: true  prose: true
```

- **PLAN ↔ archive = 0 écart** : les 8 phrases sont **byte-identiques**. En particulier « such as » (Narabi) et « along with » (Genkan) figurent **des deux côtés** (PLAN **et** archive §3 **et** §8). Ce ne sont donc **pas** des écarts PLAN↔archive.
- Les **vrais écarts** sont **archive ↔ deck** : les transformations « retiré de la source » du §2 (ex. « 404 » → « a witness going silent » ; « B_t » → « the remaining budget »).
- **Conséquence** : la formulation C-5 « 2 écarts vs archive » ne correspond pas à l'état actuel de l'archive. **`error_origin` à assigner par l'orchestrateur au G7** : soit le PLAN a mal désigné la cible (l'archive au lieu du deck), soit l'archive a été révisée après que le PLAN l'a référencée. Signalé tel quel, non comblé par un « dû » nu.

## 4. Provenance de la copy (deck hors-git + memstack) — comme JOURNAL l.182

- **Deck** : `F:\Clawpumptech\deck-flotte-MONARK.html` (daté 2026-09-06 ; **hors-git** — `F:\Clawpumptech` n'a pas de `.git`, vérifié par le chercheur ; pied de page « CONFIDENTIAL · LOCAL-ONLY · do not publish »). Cité comme source malgré le statut hors-git — **précédent établi** : `docs/JOURNAL-PROVENANCE.md` l.182 cite déjà le deck pour la nomenclature.
- **memstack** (mémoires de décision, citées par des documents committés) : `uid=cef095716051481ca1dbabf2e6e8bbbe` (nomenclature gelée) ; `uid=6e0ea08dbef44ea1a12c3e0fbf172783` (onze noms budō, balayage de collisions) ; `uid=e34bc66a76924cf394daae0c1e481a9f` (deck réécrit avec la nomenclature) ; `uid=9864041b` (décision investisseur C-2, câblage segment→produit ; cité par ADR-M004 D14).
- **Traçabilité committée** : 5/8 agents (Mokugeki, Kaihi, Kessai, Kamae, Koyomi) n'ont **de fonction que dans le deck + memstack** (nom seul dans `F:\Monark\docs`). Narabi/Kyokusen ont un tag fonctionnel dans `G1-lot-F2b.md` ; Genkan la trace committée la plus substantielle (ADR-M004 l.159 + R-P3). **Aucune demande de procurement** (source identifiée et lue pour les 8). Point d'attention reporté du chercheur (traçabilité committée 5/8) — non bloquant.
- **Mapping β/Verdict (C-1)** : aucune source lue ne nomme un agent-moteur pour le câblage β (event/UMA) du produit Verdict ; le placeholder Verdict est donc **générique** (capteur « an attested event », acte « settle the call », aucun agent-moteur nommé). Pendant investisseur formé (hors ce lot).

## 5. Gardes ajoutées (au-delà de l'invariant C-2)

- **Fermeture du trou numérique** (conseil advisor) : les chaînes du registre rendent via `{accès.propriété}`, que le test 44 ne scanne jamais. Le test C-2 itère **toutes** les chaînes rendues du registre (`name`, `line`, `segment`, `fn`, `connects`, `wiring.{sensor,gate,act}`) avec le **détecteur de honnêteté** (`scanText` de `honesty-lint.ts`, importé aliasé `scanNumericText`) et asserte `[]`. Un « 53h » glissé dans une ligne rougirait ici.
- **Consommation non-inerte** (conseil advisor) : le test C-2 asserte que `roadmap/page.tsx` et `upcoming-panel.tsx` **ne codent aucun** attribut `status="built"`/`status="upcoming"` (regex sur le texte brut via `siteSurfaces()`) — le badge **doit** provenir du registre (`status={…}`). Prouve que le registre est réellement consommé.
- **Équivalence de type** : `FleetStatus` (local à `fleet.ts`, pour portabilité inter-programmes — voir §9) est prouvé **identique** à `AgentStatus` par deux coercions identité typées dans le test C-2 (compile ssi aucun membre n'est ajouté/retiré — un « live » rougirait `npm run typecheck`), et l'assignabilité est **imposée** à chaque `<StatusBadge status={…} />` par `next build`.

## 6. Mutants nommés (rouge → restauré byte-exact) + oracle

**Baseline sha256 (arbre livré, post-réconciliation §2bis)** : `fleet.ts` = `b8e20cfe099bc6c086df8b767a753eff72a3f699f08cce271b419c8c85230dbb` ; `vocab-banned.json` = `567df929a5352505347bd9c14bcce5a86dff28c49170f9efeecfe2a35858ad99`. (Un premier passage du mutant C-2 avait été fait sur la version pré-§2bis `36584a04…` ; re-joué ci-dessous sur l'arbre livré.)

- **Mutant C-2** (basculer un des 13 à `built`) : `Mokugeki` `upcoming`→`built` sur l'arbre livré (sha256 muté `0dcbe046…`). `node --test test/ci-gates.test.ts` → **✖ `fleet_register_built_set_is_frozen` : « built agents must be exactly {Shōgen, Hikae, Ukemi} »**, **exit 1**. Restauré depuis backup → sha256 == baseline `b8e20cfe…` (byte-exact), test **✔ exit 0**. `git status` propre.
- **Mutant C-4** (insérer « Aave » en position rendue) : fichier temporaire `apps/site/components/_mutant-c4.tsx` = `<p>Aave</p>`. `node scripts/grep-forbidden.mjs` → **`FORBIDDEN VOCAB: …_mutant-c4.tsx:2 "Aave" … (F-2c C-4)` ; gate:vocab FAILED — 1 forbidden claim(s)**, **exit 1**. Fichier supprimé → grep-forbidden **OK, exit 0** ; `git status` propre (aucun `_mutant`).

**Oracle final (arbre livré, restauré ; exit codes réels, pas de pipe masquant)** :

| Commande | Résultat | Exit |
|---|---|---|
| `npm ci` | 276 packages, 0 vuln | 0 |
| `npm run ci` (vocab+tsc+test) | **100 pass / 0 fail** (dont C-2, C-4, test 44, `frozen_contract_fields_stay_dynamic`, gardes F-2b) | 0 |
| `npm run lint` | eslint . | 0 |
| `npm run lint:ratchet` | **92/92** (plafond inchangé ; +0 dette) | 0 |
| `(cd apps/site && npx next build)` | Compiled OK ; routes `/`, `/_not-found`, **`/roadmap`** (static) | 0 |
| `node scripts/lang-gate.mjs --scope site` | 0 hit non-exempt | 0 |
| `node scripts/grep-forbidden.mjs` | OK, 60 fichiers | 0 |
| `git diff main -- schemas/ packages/` | **vide** | 0 |

**CA manuelle non couverte par l'oracle** (PLAN §5, déclarée) : l'**hydratation `next dev`** — ouverture des 5 placeholders `UpcomingPanel` depuis les cartes segment de la Home + rendu interactif de `/roadmap` — **n'est PAS testée** ; `next build` prouve la frontière RSC **compilée**, pas l'hydratation runtime. CA manuelle due à l'orchestrateur/validateur au checkpoint-2.

## 7. R-25 (mesuré, C-11)

`git add -A; git diff --cached --shortstat main -- . ':(exclude)docs/G1-lot-*.md' ':(exclude)docs/G2-lot-*.md' ':(exclude)package-lock.json'; git reset` :

- **RAW (commande de mission)** : **8 fichiers, 580 insertions, 30 suppressions = 610 lignes** — **< 1205** ⇒ **pas de scission**.
- **HORS-G0** (aussi `:(exclude)docs/PLAN-F2c-lot.md` `:(exclude)docs/adr/ADR-M004-…`) : **6 fichiers, 509 + 30 = 539 lignes**.
- **Écart G0 signalé (R-20, non résolu par le worker)** : le PLAN §8 stipule que **PLAN v2 + addendum ADR D14 sont commis AVANT le premier worker (G0)**. Or `git status` les montre **non committés** dans le worktree (PLAN untracked, ADR modifié). Ils comptent donc dans le RAW (71 lignes). **À trancher par l'orchestrateur** : soit committer PLAN+D14 en commit G0 séparé (l'implémentation reste la tranche hors-G0 = 539), soit les inclure dans la PR F-2c (610, toujours < 1205). Aucune des deux options ne dépasse le plafond ; aucun contournement.

## 8. Vérification d'honnêteté (rendu)

- **Statuts** : seulement `built`/`upcoming` ; **jamais `live`** (`FleetStatus`/`AgentStatus` = union fermée, un `live` ne compile pas). Aucun `p_correct`/confidence/score/chiffre rendu.
- **`built` == exactement {Shōgen, Hikae, Ukemi}** ; les 8 autres agents + les 5 produits `upcoming` (verrou test C-2 + mutant). Aucun produit « built ».
- **0 chiffre en position rendue** sur tout `apps/site` (test 44 vert, couvre les 3 nouveaux fichiers ; + fermeture du trou numérique du registre §5).
- **0 plateforme tierce** rendue (gate C-4 : Aave/Polymarket/Kalshi/Pendle/Hyperliquid/HIP-3/Arrakis + `\bUMA\b`/`\bGamma\b` ; 0 faux positif sur l'arbre — `grep-forbidden` vert).
- **Phrase deux-étages présente et rendue** (`/roadmap` : « A product is a wiring of fleet agents; the agent is the engine. » ; reprise en tête de chaque placeholder). Les **5 produits absents de `/roadmap`** ; compte « three built, eight on the roadmap » vrai.
- **Verdict sans agent-moteur** (C-1) : fonction et câblage génériques ; seul le nœud *gate* nomme « Hikae and the MONARK budget » (voir §9).
- **Anglais** (lang-gate site 0).

## 9. Choix douteux (pour la revue G2 / checkpoint-2)

1. **Nœud gate « Hikae and the MONARK budget » sur le câblage Verdict (C-1)** : le tableau PLAN §1 sépare la colonne *gate* (Hikae, bâti, backbone partagé) de la colonne *agent-moteur* (le capteur, non tranché pour Verdict). Nommer Hikae comme **gate partagé** (identique sur les 5 produits **et** déjà rendu sur la carte Betting desk de `main`) n'est **pas** nommer un agent-moteur de Verdict. Rendre la gate générique pour le seul Verdict créerait une incohérence visible. **Décision : uniformité, Hikae nommé partout comme gate ; aucun capteur/acte nommé pour Verdict.** À confirmer en G2.
2. **`FleetStatus` local vs `status: AgentStatus` littéral** : la mission C-2 dit « chacun avec `status: AgentStatus` ». `fleet.ts` est compilé par **deux** programmes à résolutions incompatibles (app `bundler` sans `allowImportingTsExtensions` ; racine `nodenext` exigeant l'extension `.ts`) — **aucun** spécificateur d'import ne compile sous les deux. J'ai retenu `FleetStatus` **local** (module auto-suffisant, portable, **zéro toucher de config**) + **équivalence prouvée** au test + assignabilité imposée par `next build`. **Alternative à une ligne** (non retenue, notée) : ajouter `"allowImportingTsExtensions": true` à `apps/site/tsconfig.json` (légal, `noEmit` vrai) et `import type { AgentStatus } from "./status.ts"` (import type effacé au runtime) — donnerait la lettre « status: AgentStatus » au prix d'un toucher de config partagée. Les deux sont défendables.
3. **Nœuds SVG nommant Ukemi (Softlanding/Firebreak)** (C-10) : autorisé (« les nœuds peuvent nommer Ukemi/Hikae »), **sans pilule « Built »** ; un seul badge de statut par placeholder (au niveau produit). Vérifié : aucune pilule sur les nœuds.
4. **Limite déclarée du gate C-4** : le gate compile en `i` (insensible à la casse), donc le mot autonome « gamma » (grecque d'options) en prose rougirait aussi (la frontière `\b…\b` ne bloque que les sous-chaînes : human/summary/Pendleton/gammaglobulin restent verts — assertions dans le test C-4). Acceptable aujourd'hui (aucune prose « gamma » sur l'arbre). **« Safe »** : **délibérément non listé** (mot anglais courant **et** marque multisig) — **contrôle manuel déclaré**, à revoir mot-à-mot au checkpoint-2 (comme prévu par C-4). Un futur besoin « gamma »/« Safe » passerait par un addendum daté (type D13).
5. **Duplication bénigne du descripteur built** : le renvoi `/roadmap` rend le one-liner des 3 agents bâtis depuis le registre ; le même descripteur existe dans les panneaux Home (source de vérité déclarée des bâtis). Ce n'est pas un panneau dupliqué (item 1) ; le **statut** a une source unique (le registre, verrou C-2).
6. **Nom du produit sur la carte Home** : le bouton-trigger porte « See MONARK Firebreak » — le nom du produit apparaît sur la **carte segment de la Home**, pas seulement dans le panneau. ADR-M004 D14 : un produit non bâti « peut apparaître en tant que `upcoming` **derrière** son segment ». Défendable (badgé `upcoming`, ouvre un placeholder, jamais présenté comme bâti) mais **item mot-à-mot pour le checkpoint-2** — signalé plutôt que laissé à trouver.

## 10. Traçage corrections checkpoint-1 couvertes par ce lot

C-1 (Verdict générique §8/§9.1), C-2 (registre + test racine + mutant §6, invariant §8), C-3 (retouches Home §1), C-4 (gate plateformes + mutant §6, limite §9.4), C-5 (archive durable §2 + finding « 2 écarts » §3), C-9 (phrase deux-étages + 5 produits absents §8), C-10 (un seul badge, nœuds sans pilule §9.3), C-11 (`error_origin` worker mort §0 ; R-25 mesuré §7). C-6/C-7/C-8 = artefacts G0/PLAN (hors code de ce lot).
