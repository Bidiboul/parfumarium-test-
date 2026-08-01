# Diagnostic Olfactif Parfumarium

Application web pour **Parfumarium** (parfumerie à Vaison-la-Romaine 84110 — [parfumarium.fr](https://parfumarium.fr)) :
une borne tablette en boutique où le client répond lui-même au questionnaire, accompagné par
**Thibault, l'agent olfactif digital**, pour découvrir les meilleurs parfums à faire sentir.
Le nom et les phrases de l'agent sont modifiables dans `src/data/agent.ts`.

À la fin du diagnostic, l'application affiche :

1. **Les 3 meilleurs parfums** à présenter, dans l'ordre
2. **Des parfums annexes** si le client veut sentir plus de choix
3. **Une phrase vendeur** pour introduire la sélection

Pensée mobile-first : utilisable sur téléphone, tablette et ordinateur, sans compte ni backend.

## Démarrage

```bash
npm install
npm run dev        # serveur de développement
npm run build      # build de production (dossier dist/)
npm run preview    # prévisualisation du build
```

## Stack

- React 19 + Vite 7 + TypeScript
- Tailwind CSS v4
- Aucun backend — tout est local (localStorage pour l'historique)

## Design

Direction premium, sobre et élégante : blanc cassé / noir / doré léger.

- **Typographie** : Cormorant Garamond (titres) et Inter (textes), **auto-hébergées**
  dans `public/fonts` et précachées par le service worker — le rendu reste identique hors-ligne,
  sans aucun appel à un CDN.
- **Profondeur** : dégradé de fond fixe, grain très léger, ombres en couches (`--shadow-card`,
  `--shadow-lift`, `--shadow-modal`, `--shadow-gold`).
- **Mouvement** : apparitions en cascade plafonnées à 0,4 s, courbes douces (`--ease-out-soft`,
  `--ease-spring`), soulèvement au survol et enfoncement au toucher (classe `.lift`),
  reflet animé sur la barre de progression, modales en fondu + léger rebond.
- **Accessibilité** : `prefers-reduced-motion` désactive toutes les animations ;
  cibles tactiles généreuses ; aucun défilement horizontal.

Tous les réglages visuels (couleurs, ombres, courbes, animations) sont centralisés
dans [`src/index.css`](src/index.css).

## Fonctionnalités

- **Recherche par équivalence** : le client indique un parfum de marque qu'il connaît (« Black Opium », « Sauvage »…) et obtient immédiatement la référence Parfumarium correspondante, avec des alternatives dans le même esprit. Recherche tolérante aux accents, par nom, maison ou numéro (`src/utils/equivalence.ts`).
- **Profil olfactif nommé** : chaque diagnostic donne un profil (« Gourmand Sensuel », « Boisé Magnétique »…) affiché en tête du résultat, traduit dans les 5 langues (`src/utils/profile.ts`).
- **Fiche parfum détaillée** : au clic sur un parfum, notes olfactives, jauge d'intensité, moments conseillés, style, prix et lien boutique (`src/components/PerfumeModal.tsx`).
- **Guide d'essai olfactif** : les trois bons gestes et un minuteur de 2 minutes pour laisser le parfum se révéler (`src/components/TestGuide.tsx`).
- **Espace vendeur protégé** : code à 4 chiffres (défini dans `src/data/config.ts`) devant le code rapide, la recherche, l'historique et les statistiques ; re-verrouillé à chaque retour kiosque.
- **Disponibilité** : champ `inStock` optionnel — un parfum « sur commande » reste proposé mais passe derrière les références disponibles.
- **Avis client & points d'abandon** : avis rapide en trois émojis et suivi de l'étape où les clients quittent le questionnaire, visibles dans les statistiques.
- **5 langues** : français (par défaut), anglais, allemand, espagnol, italien. Le sélecteur est sur l'écran d'accueil ; tout le parcours client est traduit (questions, phrases de Thibault, raisons, descriptions des parfums). Les écrans vendeur restent en français. Traductions dans `src/i18n/`.
- **Diagnostic guidé** : 6 questions (+ 1 sous-question selon l'univers choisi), une question par écran, barre de progression, bouton retour.
- **Code rapide** : le vendeur entre un code à 5 chiffres (ex. `14134`) pour afficher directement la sélection — cible / famille / occasion / puissance / style.
- **Recherche par numéro** de parfum, avec filtre femme / homme / unisexe.
- **Copier la sélection** dans le presse-papiers.
- **Historique local** des 10 derniers diagnostics (localStorage) + bouton reset.
- **Emporter sa sélection (QR code)** : le client scanne un QR code qui rouvre sa sélection exacte sur son téléphone (langue comprise) et peut commander sur parfumarium.fr. Tout est encodé dans le lien, sans serveur (`src/utils/share.ts`, `src/components/ShareModal.tsx`).
- **Prix et lien boutique** : chaque parfum affiche son prix et un lien vers sa fiche sur parfumarium.fr. Configuration dans `src/data/shop.ts` (URL, devise, prix par défaut, prix par parfum optionnel).
- **Mode kiosque** : sur une borne en libre-service, retour automatique à l'accueil après inactivité (90 s) avec remise en français par défaut (`src/hooks/useIdleTimer.ts`).
- **PWA installable & hors-ligne** : l'app s'installe en plein écran sur la tablette et fonctionne sans réseau (via `vite-plugin-pwa`).
- **Statistiques vendeur** (`src/components/Stats.tsx`) : synthèse locale et anonyme (univers demandés, parfums les plus recommandés, cibles, langues) pour aider au réassort.

## Architecture

```
src/
├── data/
│   ├── perfumes.ts        # Catalogue des parfums (modifiable facilement)
│   ├── agent.ts           # Thibault : nom et phrases d'accompagnement
│   ├── config.ts          # Code vendeur, durée du minuteur d'essai
│   ├── shop.ts            # Config boutique : URL, devise, prix, liens produits
│   └── questions.ts       # Questions, options et correspondances de tags
├── i18n/
│   ├── index.tsx          # Contexte de langue (localStorage + <html lang>)
│   ├── types.ts           # Interface Translation + liste des langues
│   ├── fr.ts / en.ts / de.ts / es.ts / it.ts   # Traductions du parcours client
│   └── descriptions.ts    # Descriptions des parfums traduites
├── utils/
│   ├── recommendation.ts  # Algorithme de scoring et de recommandation
│   ├── quickCode.ts       # Décodage du code rapide à 5 chiffres
│   ├── share.ts           # Encodage / décodage du lien de partage (QR code)
│   ├── equivalence.ts     # Recherche « quel parfum portez-vous ? »
│   ├── profile.ts         # Profil olfactif nommé
│   ├── stats.ts           # Compteurs agrégés anonymes (réassort)
│   └── history.ts         # Historique localStorage
├── hooks/
│   └── useIdleTimer.ts    # Mode kiosque (retour auto à l'accueil)
├── components/
│   ├── Home.tsx           # Écran d'accueil + sélecteur de langue
│   ├── Questionnaire.tsx  # Une question par écran + branchement
│   ├── Results.tsx        # Profil, top 3, prix, QR, mot de Thibault
│   ├── Equivalence.tsx    # « Quel parfum portez-vous ? »
│   ├── PerfumeModal.tsx   # Fiche parfum détaillée
│   ├── TestGuide.tsx      # Guide d'essai olfactif + minuteur
│   ├── ShareModal.tsx     # QR code « emporter ma sélection »
│   ├── SellerGate.tsx     # Code d'accès à l'espace vendeur
│   ├── QuickCode.tsx      # Saisie du code rapide + légende
│   ├── Search.tsx         # Recherche par numéro / nom
│   ├── History.tsx        # 10 derniers diagnostics
│   └── Stats.tsx          # Statistiques vendeur
├── App.tsx                # Navigation + kiosque + lecture des liens partagés
└── index.css              # Thème (blanc cassé / noir / doré)
```

## Avant la mise en boutique

Personnalisez [`src/data/config.ts`](src/data/config.ts) (**code d'accès vendeur**, par défaut `1234`)
et [`src/data/shop.ts`](src/data/shop.ts) (prix et structure des liens vers parfumarium.fr).

## Modifier le catalogue

Tout le catalogue vit dans [`src/data/perfumes.ts`](src/data/perfumes.ts) : ajouter, retirer ou
modifier un parfum ne demande que l'édition de ce tableau (id, nom, genre, famille, intensité 1-4,
tags, occasions, styles, notes, description, correspondance olfactive).

## Algorithme de recommandation

Le score de chaque parfum est calculé de façon transparente dans
[`src/utils/recommendation.ts`](src/utils/recommendation.ts) : bonus pour le genre (+30/+20),
la famille (+35), la sous-question (+25), l'occasion (+20), l'intensité (+20/-15), le style (+20),
les notes pertinentes (+8), et malus pour les éléments à éviter (-50), les parfums trop puissants
pour un usage discret (-30) ou trop sucrés (-40). Les parfums fortement pénalisés ne sont proposés
que s'il n'y a pas assez d'options, les sélections trop similaires sont diversifiées, et à score
proche le parfum le plus facile à vendre passe devant. Chaque résultat inclut ses raisons (`reasons`).
