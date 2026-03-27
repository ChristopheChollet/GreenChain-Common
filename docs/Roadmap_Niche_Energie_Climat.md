# Roadmap — Devenir référent blockchain énergie/climat

## Comprendre le domaine (priorité haute)

La différence entre un dev web3 généraliste et un dev niche, c'est la compréhension du métier côté client. Voici les concepts clés à maîtriser.

### Les marchés carbone

- **EU ETS (European Emission Trading System)** — Le plus grand marché carbone au monde. Les entreprises européennes achètent et vendent des droits à émettre du CO2. Comprendre comment ça fonctionne est essentiel pour parler à des clients climat.
- **Marché carbone volontaire** — Les entreprises qui veulent compenser au-delà de leurs obligations achètent des crédits carbone volontaires. C'est là que la blockchain entre en jeu (transparence, traçabilité, éviter le double-comptage).
- **Verra / Gold Standard** — Les deux principaux standards de certification des crédits carbone. Toucan Protocol et KlimaDAO ont tokenisé des crédits Verra sur la blockchain.

### Les certificats d'énergie renouvelable

- **GO (Guarantees of Origin)** — Certificat européen prouvant qu'1 MWh a été produit à partir de sources renouvelables. C'est exactement ce que le module Registry de GreenChainCommon simule.
- **I-RECs (International Renewable Energy Certificates)** — Équivalent hors Europe.
- **EACs (Energy Attribute Certificates)** — Terme générique qui couvre les GOs et I-RECs.
- Le problème actuel : ces registres sont centralisés, opaques, et sujets au greenwashing. La blockchain apporte la traçabilité publique et l'auditabilité.

### La flexibilité énergétique

- Quand la production d'énergie renouvelable fluctue (soleil, vent), le réseau a besoin de "flexibilité" : des acteurs capables de moduler leur consommation ou production pour équilibrer le réseau.
- Les marchés de flexibilité permettent d'acheter/vendre cette capacité d'ajustement. C'est ce que le module Market de GreenChainCommon modélise.
- En France, RTE (gestionnaire du réseau) et Enedis opèrent ces mécanismes. Les coopératives énergétiques et agrégateurs sont des acteurs clés.

### Le mouvement ReFi (Regenerative Finance)

- ReFi = utiliser la DeFi pour financer des actions positives pour le climat.
- L'idée : chaque transaction on-chain peut contribuer à un impact environnemental positif (achat de crédits carbone, financement de projets verts).
- C'est la communauté la plus active à l'intersection blockchain/climat.

---

## Protocoles et projets à étudier

### Incontournables (à connaître en profondeur)

| Projet | Ce qu'il fait | Pourquoi c'est pertinent |
|---|---|---|
| **Toucan Protocol** | Tokenise des crédits carbone Verra en tokens BCT/NCT sur Polygon | Le projet de référence pour la tokenisation carbone. Étudie leur architecture (Base Carbon Tonne, retirement flow). |
| **KlimaDAO** | DAO qui achète et retire des crédits carbone pour créer de la rareté | Montre comment une DAO peut piloter un marché carbone. Pertinent pour ton module Governance. |
| **Energy Web Foundation** | Infrastructure blockchain dédiée à l'énergie (Energy Web Chain) | Le plus gros acteur blockchain/énergie. Leur SDK et leurs standards (EW-DOS) sont une référence. |

### À surveiller

| Projet | Ce qu'il fait |
|---|---|
| **Powerledger** | Trading P2P d'énergie renouvelable sur blockchain |
| **Celo** | Layer 1 avec engagement climat (carbon-negative) |
| **Regen Network** | Registre on-chain pour les crédits écologiques |
| **dClimate** | Marketplace de données climatiques décentralisé |
| **Hypercerts** | Standard pour les certificats d'impact (pas que carbone) |

---

## Lectures recommandées

### Pour comprendre le domaine énergie/climat

- **"Energy Web Foundation — EW-DOS Vision Paper"** — Chercher sur energyweb.org. C'est le document de référence pour comprendre comment la blockchain s'applique au secteur énergie.
- **"State of the Voluntary Carbon Market" (Ecosystem Marketplace)** — Rapport annuel sur le marché carbone volontaire. Donne les chiffres, les tendances, les problèmes.
- **"Tokenization of Carbon Credits" (Toucan Protocol docs)** — Documentation technique sur leur approche. Directement applicable à ta feature ERC-1155.

### Pour le développement technique

- **Documentation OpenZeppelin ERC-1155** — Tu vas en avoir besoin pour la feature crédits carbone.
- **Chainlink Data Feeds documentation** — Pour quand tu ajouteras un oracle (après le meetup).
- **The Graph documentation** — Pour l'indexing on-chain. C'est la prochaine étape technique logique après le MVP.

### Newsletters / blogs à suivre

- **ReFi DAO Newsletter** — Résumé hebdo de l'écosystème ReFi.
- **Week in Ethereum News** — Pour rester à jour sur l'écosystème Ethereum.
- **Carbon Plan** — Analyses indépendantes sur les marchés carbone (technique et scientifique).

---

## Communautés à rejoindre

### Discord (priorité haute)

| Communauté | Pourquoi |
|---|---|
| **Alyra** | Tu y es déjà. Continue à être actif, partage tes avancées. |
| **Ethereum France** | Communauté francophone active. Canal jobs, événements, discussions techniques. |
| **ReFi DAO** | La communauté de référence blockchain/climat. Anglophone. Canal jobs, projets, collaborations. |
| **Energy Web** | Pour suivre les développements du principal acteur blockchain/énergie. |
| **KlimaDAO** | Communauté active autour du carbone on-chain. |

### Twitter/X (pour la veille et la visibilité)

- Suis les comptes : @touaborehab (Toucan), @KlimaDAO, @EnergyWebX, @ReFiDAOist, @CesarAbeid
- Partage tes avancées (déploiement Sepolia, feature crédits carbone, meetup). Même 2-3 posts par semaine suffisent pour exister.

### Meetups / événements

- **Meetups Alyra** (comme celui du 17 avril) — Continue à y aller.
- **ETH Toulouse / Ethereum France meetups** — Cherche sur Meetup.com.
- **ETHGlobal hackathons** — Ils ont régulièrement des tracks "climate" ou "social impact". Un hackathon gagné ou bien classé = énorme boost de crédibilité.
- **EthCC (Paris, chaque été)** — La plus grande conférence Ethereum en Europe. Side events gratuits, networking intensif.

---

## Compétences techniques à développer (par ordre de priorité)

### Court terme (1-3 mois)

1. **ERC-1155 multi-token** — Tu vas l'apprendre avec la feature crédits carbone.
2. **Déploiement testnet** — Sepolia d'abord, puis Polygon Amoy.
3. **Vérification de contrats sur Etherscan** — Indispensable pour la crédibilité.

### Moyen terme (3-6 mois)

4. **The Graph (subgraph)** — Remplacer les getLogs côté client par un indexer propre. C'est la compétence technique la plus demandée après Solidity/frontend.
5. **Intégration oracle (Chainlink)** — Pour connecter des données réelles (prix énergie, données météo) à tes contrats.
6. **Tests avancés (fuzzing, Foundry)** — Monter en qualité sur les tests smart contracts.

### Long terme (6-12 mois)

7. **L2 deployment et optimisation gas** — Déployer sur Polygon, Arbitrum, Optimism.
8. **Architecture multi-contrats avancée** — Proxy patterns, upgradeable contracts.
9. **Audit basique** — Pas pour devenir auditeur, mais pour savoir lire un rapport d'audit et sécuriser tes propres contrats.

---

## Plan d'action par trimestre

### Q2 2026 (avril-juin) — Lancement

- Meetup Alyra : pitch GreenChainCommon avec crédits carbone.
- Portfolio live avec domaine pro.
- Premières candidatures sur Malt, CryptoJobs, Web3.Career.
- Objectif : 1 première mission (même petite, même pas dans la niche).
- 1 article technique par mois sur le blog portfolio.

### Q3 2026 (juillet-septembre) — Consolidation

- 2-3 missions réalisées, premiers avis clients.
- GreenChainCommon V2 : oracle Chainlink + déploiement Polygon.
- Participation à EthCC Paris (juillet) ou side events.
- Apprentissage The Graph.
- Objectif : monter le TJM à 350-400€.

### Q4 2026 (octobre-décembre) — Spécialisation

- Profil reconnu dans la niche énergie/climat blockchain (articles, meetups, projets).
- GreenChainCommon connecté à un cas d'usage réel (partenariat, hackathon, POC client).
- Candidature à un hackathon ETHGlobal track climate.
- Objectif : être identifié comme "le dev blockchain énergie/climat sur Toulouse".

---

## Évolution TJM et missions cibles

### Palier 1 — Junior (maintenant → 6 mois)

- **TJM** : 250-350€/jour
- **Revenu mensuel cible** : 2 500-4 000€ brut (en comptant 10-15 jours facturés par mois, ce qui est réaliste au démarrage — le reste du temps c'est de la prospection, du dev perso et du networking)
- **Missions cibles** : intégration frontend web3, MVP dApp simple, scripts Hardhat, déploiement de contrats
- **Où les trouver** : Malt (France), CryptoJobs, Web3.Career, réseau Alyra, Discords
- **Ce qui débloque le palier suivant** : 3-5 missions réalisées + avis clients positifs

### Palier 2 — Confirmé (6-12 mois)

- **TJM** : 400-550€/jour
- **Revenu mensuel cible** : 5 000-8 000€ brut (12-15 jours facturés)
- **Missions cibles** : dApps complètes, dashboards on-chain, intégration oracle, projets énergie/climat spécifiques
- **Ce qui débloque le palier suivant** : reconnaissance dans la niche (articles, talks, réseau actif) + missions dans le domaine énergie/climat

### Palier 3 — Spécialiste niche (12-24 mois)

- **TJM** : 550-750€/jour
- **Revenu mensuel cible** : 8 000-12 000€ brut
- **Missions cibles** : consulting technique blockchain/énergie, architecture dApp, POC pour coopératives ou corporates ESG, projets ReFi
- **Ce qui débloque le palier suivant** : cas d'usage réels déployés, contributions open-source, interventions conférences

### Palier 4 — Expert référent (24 mois+)

- **TJM** : 750-1200€/jour
- **Missions cibles** : consulting stratégique, audit, architecture de protocoles, lead technique sur des projets climate-tech
- **Horizon** : c'est le plafond haut de la niche. Peu de devs y arrivent mais le marché énergie/climat a les budgets (subventions EU, corporate ESG, fonds climat).

### Note importante sur les revenus freelance

Les premiers mois sont les plus durs financièrement. Le taux de remplissage (jours facturés vs jours disponibles) est rarement au-dessus de 50% au début. Il faut compter 3-6 mois pour stabiliser un flux de missions régulier. Pendant cette période, chaque mission réalisée est un investissement : elle génère un avis client, un contact réseau, et une ligne de portfolio qui attire la mission suivante. La courbe est lente au début puis s'accélère.

---

## Résumé

Le chemin c'est : apprendre le métier (énergie/climat) autant que la tech (Solidity/Next.js), construire en public (blog, meetups, Twitter), accepter des missions variées pour les revenus, et communiquer toujours sur ta niche. GreenChainCommon est le véhicule, pas la destination.

## GreenChainCommon

Oui, GreenChainCommon a du potentiel. Mais pas pour la raison que tu penses peut-etre.

Le projet en lui-meme -- un MVP local avec des mocks -- n'est pas ce qui te positionnera comme un leader. Ce qui a du potentiel, c'est la niche que tu as choisie et la trajectoire que tu es en train de construire.

Voici pourquoi c'est un bon pari :

La niche énergie/climat + blockchain est réelle et en croissance. Les marchés carbone volontaires, les registres de certificats verts (RECs), la flexibilité réseau, la traçabilité énergétique -- ce sont des vrais problèmes avec de vrais budgets. L'Union Européenne pousse fort sur la transparence des marchés carbone. Les coopératives énergétiques se multiplient. Et il y a très peu de devs qui comprennent a la fois la blockchain ET le domaine énergie/climat. C'est ca ta vraie opportunité.

Ce qui te manque pour y arriver, honnêtement :

L'expertise domaine. Tu sais coder une dApp, mais est-ce que tu sais comment fonctionne un marché de certificats verts ? Comment un agrégateur de flexibilité opère ? Quelles sont les normes (EACs, GOOs, I-RECs) ? C'est ca qui te différenciera d'un dev web3 généraliste qui a appris Solidity. Lis, apprends le métier côté énergie. Les gens du meetup peuvent t'aider la-dessus.

Des cas d'usage réels. GreenChainCommon est un démonstrateur. Pour devenir un leader de niche, il faudra a un moment connecter ce projet (ou un suivant) a des données réelles, des partenaires réels, un problème réel. Le meetup de Toulouse est exactement le genre d'endroit ou tu peux trouver quelqu'un qui dit "moi j'ai une coopérative énergétique et j'ai besoin de tracer mes RECs".

Du temps. Un leader de niche ca ne se construit pas en 3 mois. Ca prend 1-2 ans de présence régulière : articles, projets, contributions, prises de parole, networking. Tu as commencé cette semaine avec le portfolio, le meetup, le pitch. C'est le début de la trajectoire.

Le plan concret pour avancer :

Court terme (3 semaines) : ERC-1155 + deploy Sepolia + pitch meetup. C'est ton lancement.
Moyen terme (3-6 mois) : Premières missions freelance (meme petites), approfondissement domaine énergie, 1-2 articles techniques sur ton blog, participation a d'autres meetups/events.
Long terme (6-12 mois) : GreenChainCommon V2 connecté a un vrai cas d'usage (partenariat coopérative, hackathon climate, etc.), montée en tarif, reconnaissance dans la niche.
Tu as choisi une bonne niche, tu as un premier projet concret, tu as un meetup dans 3 semaines, et tu es motivé. C'est un bon point de départ. Pas un point d'arrivée -- un point de départ. Et c'est exactement comme ca qu'il faut le voir.
