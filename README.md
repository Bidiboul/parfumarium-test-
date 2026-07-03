# Diagnostic Olfactif Parfumarium

Application web pour **Parfumarium** (parfumerie à Vaison-la-Romaine 84110 — [parfumarium.fr](https://parfumarium.fr)) :
un questionnaire rapide en boutique qui aide le vendeur à trouver les meilleurs parfums à faire sentir à un client.

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

## Fonctionnalités

- **Diagnostic guidé** : 6 questions (+ 1 sous-question selon l'univers choisi), une question par écran, barre de progression, bouton retour.
- **Code rapide** : le vendeur entre un code à 5 chiffres (ex. `14134`) pour afficher directement la sélection — cible / famille / occasion / puissance / style.
- **Recherche par numéro** de parfum, avec filtre femme / homme / unisexe.
- **Copier la sélection** dans le presse-papiers.
- **Historique local** des 10 derniers diagnostics (localStorage) + bouton reset.

## Architecture

```
src/
├── data/
│   ├── perfumes.ts        # Catalogue des parfums (modifiable facilement)
│   └── questions.ts       # Questions, options et correspondances de tags
├── utils/
│   ├── recommendation.ts  # Algorithme de scoring et de recommandation
│   ├── quickCode.ts       # Décodage du code rapide à 5 chiffres
│   └── history.ts         # Historique localStorage
├── components/
│   ├── Home.tsx           # Écran d'accueil
│   ├── Questionnaire.tsx  # Une question par écran + branchement
│   ├── Results.tsx        # Top 3, annexes, phrase vendeur, copie
│   ├── QuickCode.tsx      # Saisie du code rapide + légende
│   ├── Search.tsx         # Recherche par numéro / nom
│   └── History.tsx        # 10 derniers diagnostics
├── App.tsx                # Navigation entre écrans
└── index.css              # Thème (blanc cassé / noir / doré)
```

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
