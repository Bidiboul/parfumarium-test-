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
- **Rythme du parcours** : chaque choix est acquitté par une brève confirmation dorée
  (190 ms) avant de passer à la suite, avec retour haptique quand l'appareil le permet ;
  un **instant de composition** (`src/components/Composing.tsx`) précède le résultat pour
  faire de la révélation des trois parfums un vrai moment.
- **Transitions d'écran** : API View Transitions (`src/hooks/useScreenTransition.ts`) pour un
  fondu croisé accéléré par le GPU, avec repli automatique sur les navigateurs sans support.
- **Apparition au défilement** : `src/components/Reveal.tsx` révèle le contenu à mesure qu'il
  entre dans l'écran ; un contrôle de position double l'IntersectionObserver pour qu'aucun
  élément ne puisse rester invisible après un défilement rapide.
- **Accessibilité** : `prefers-reduced-motion` désactive animations, transitions d'écran et
  apparitions au défilement (le contenu reste alors toujours visible) ; cibles tactiles
  généreuses ; aucun défilement horizontal.

Tous les réglages visuels (couleurs, ombres, courbes, animations) sont centralisés
dans [`src/index.css`](src/index.css).

## Fonctionnalités

- **Recherche par équivalence, sur 36 000 références** : le client tape le parfum qu'il connaît et obtient la référence Parfumarium correspondante, ses notes olfactives et deux à trois pistes complémentaires. Deux niveaux clairement distingués à l'écran :
  1. les **correspondances officielles** du catalogue (champ `match` de `src/data/perfumes.ts`), qui font foi ;
  2. à défaut, **la référence la plus proche calculée** à partir de l'index (`src/utils/fragranceIndex.ts`).
  Voir la section « Base de références » plus bas.
- **Parcourir par maison** : pour le client qui se souvient de la marque mais pas du nom. Les maisons dont la boutique propose des équivalences (Guerlain, Dior, Chanel…) apparaissent en premier, signalées d'un point doré ; les autres suivent, avec un champ de recherche.
- **Formats, tarifs et offre duo** : 30 ml à 39,90 €, 50 ml à 69,90 €, 100 ml à 89,90 €, et **10 € de réduction pour deux flacons du même format, à partir du 50 ml** (les deux parfums peuvent être différents). Le détail par format et le prix du duo figurent sur chaque fiche parfum ; les cartes affichent le prix d'appel. Tout est modifiable dans [`src/data/shop.ts`](src/data/shop.ts) — y compris la contenance minimale ouvrant droit à l'offre (`DUO_MIN_ML`).
- **L'histoire de la maison** : une carte sur l'accueil ouvre un écran de présentation (récit, repères, formats et tarifs), traduit dans les 5 langues. Texte modifiable dans [`src/data/story.ts`](src/data/story.ts).
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
│   ├── shop.ts            # Formats, tarifs, offre duo, liens produits
│   ├── story.ts           # L'histoire de la boutique, dans les 5 langues
│   ├── canonical.ts       # Vocabulaire olfactif du catalogue (rapprochements)
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
│   ├── useIdleTimer.ts    # Mode kiosque (retour auto à l'accueil)
│   └── useScreenTransition.ts  # Transitions d'écran (View Transitions API)
├── components/
│   ├── Home.tsx           # Écran d'accueil + sélecteur de langue
│   ├── Questionnaire.tsx  # Une question par écran + branchement
│   ├── Composing.tsx      # Instant de composition avant le résultat
│   ├── Reveal.tsx         # Apparition au défilement
│   ├── Results.tsx        # Profil, top 3, prix, QR, mot de Thibault
│   ├── Equivalence.tsx    # « Quel parfum portez-vous ? » + parcours par maison
│   ├── Story.tsx          # L'histoire de la boutique
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

## Base de références (36 474 parfums)

L'écran d'équivalence s'appuie sur `public/fragrance-index.json` : 36 474 parfums de
2 536 marques, avec leurs accords dominants et — pour 12 321 d'entre eux — le détail des
notes olfactives. Le fichier est chargé à la demande (1,9 Mo) puis précaché pour rester
disponible hors-ligne.

> ⚠️ **Droits d'usage à vérifier avant exploitation commerciale.** Les données de
> l'index actuel proviennent d'un jeu public issu d'un moissonnage de Fragrantica,
> sans licence explicite. Les noms de parfums et leurs notes sont des informations
> factuelles, mais la compilation peut être protégée (droit *sui generis* des bases de
> données en Europe) et les conditions d'utilisation du site source interdisent le
> moissonnage. Avant une mise en production, remplacez cet index par une source dont
> la boutique détient les droits — un export fournisseur ou une base sous licence.

### Régénérer l'index

L'index n'est pas figé : il se reconstruit à partir de n'importe quel classeur
comportant les colonnes `brand`, `perfume`, `launch_year`, `main_accords`, `notes`
(les deux dernières au format tableau JSON) :

```bash
node scripts/build-fragrance-index.mjs mon-fichier.xlsx
```

Le script traduit les notes et accords en français, les rattache à un vocabulaire
canonique partagé avec le catalogue boutique, puis écrit `public/fragrance-index.json`.

### Comment la correspondance est calculée

Chaque parfum — externe ou boutique — est réduit à un profil pondéré de jetons olfactifs
(`vanilla`, `oud`, `citrus`…) : voir `scripts/fragrance-vocabulary.mjs` pour le vocabulaire
anglais et [`src/data/canonical.ts`](src/data/canonical.ts) pour le français. La proximité
est mesurée par similarité cosinus, retenue après comparaison avec d'autres mesures (Dice,
couverture) sur les correspondances officielles du catalogue.

Quatre mécanismes, ajoutés après avoir constaté des rapprochements manifestement faux :

1. **Profils boutique enrichis.** Nos fiches décrivent un parfum en quelques mots français ;
   l'index donne la composition réelle. Chaque parfum boutique est donc profilé à partir de
   l'original qu'il déclare dans son champ `match`, la description française ne comblant que
   les manques, à poids réduit. Les deux côtés de la comparaison parlent alors la même langue.
2. **Pondération informative (IDF).** « boisé » ou « floral » figurent dans la moitié du
   catalogue mondial et ne distinguent rien ; « pistache », « oud » ou « cerise » sont
   décisifs. Sans cette pondération, deux parfums se ressemblent dès qu'ils partagent des
   banalités.
3. **Notoriété des maisons** ([`src/data/houses.ts`](src/data/houses.ts)). Une même
   dénomination existe chez plusieurs marques : « Eros » chez Versace mais aussi chez trois
   marques confidentielles, « Chance » chez Chanel comme chez Geoffrey Beene. La recherche
   remontait l'inconnue. La liste ne retire aucune référence et n'invente aucune donnée
   olfactive : elle ne fait qu'ordonner les résultats.
4. **Garde-fou sur le genre.** Quand le nom l'annonce (« Le Mâle », « for Women »), le genre
   opposé est écarté. Sinon, l'orientation moyenne des jetons — apprise sur les 3 591
   références dont le nom déclare le genre — module le score en proportion de sa netteté,
   jamais en tout ou rien ; les parfums unisexes ne sont jamais pénalisés.

**Mesures.** Vérité terrain : chacun de nos 46 parfums déclare l'original dont il est
l'équivalence, donc chercher cet original doit ramener ce parfum-là. Sur les 26 originaux
présents dans l'index, la bonne référence sort **en première position dans 100 % des cas**
(46 % avant ces correctifs). Ce test étant en partie circulaire, deux autres mesures le
complètent : sur 2 130 références hors catalogue, le parfum proposé partage l'accord dominant
de la demande dans **61 %** des cas (contre 57 %) ; et sur les 3 591 références dont le nom
annonce le genre — mention masquée avant l'appel — le genre proposé est contredit dans
**14 %** des cas, contre 24 % sans garde-fou.

Ces chiffres ont une limite de principe : 46 parfums ne peuvent pas couvrir 36 474
références. Certaines demandes n'ont tout simplement pas d'équivalent en boutique. L'écran
l'annonce plutôt que de présenter le moins mauvais résultat comme une correspondance : un
indicateur à trois niveaux (*correspondance forte* / *belle proximité* / *piste à explorer*)
accompagne chaque rapprochement calculé. Les correspondances officielles du catalogue, elles,
restent prioritaires et signalées comme telles ; le calcul ne sert que pour les références
qui n'en ont pas.

## Totem tactile

L'application est calée pour un **totem 43 pouces en portrait (1080 × 1920, Android)**.

- **Mise à l'échelle** : toutes les tailles sont en `rem`, et la taille de police racine passe
  à 24 px sur les grands écrans verticaux (`src/index.css`). Le texte courant atteint alors
  12 mm et les boutons 4 cm de haut — lisible et cliquable à 1,50 m. Un seul réglage suffit
  à adapter l'interface à une autre dalle.
- **Espace vendeur masqué** : aucun lien visible. Il s'ouvre depuis le **monogramme « T » de
  Thibault**, sur l'accueil, par l'un ou l'autre de ces deux gestes :
  - un **appui maintenu** (0,65 s) — un anneau doré se déploie pendant l'appui pour montrer
    que le geste est pris en compte ;
  - un **double appui rapide**.

  Un appui bref isolé reste sans effet et n'affiche rien, pour qu'un client curieux ne tombe
  jamais dessus. **Le code est ensuite redemandé à chaque accès** : rien n'est mémorisé d'une
  visite à l'autre.
- **Diaporama de veille** : après 5 min sans contact sur l'accueil, quatre vues défilent
  (la maison, les 50 fragrances, **l'offre duo mise en avant**, le diagnostic offert), sous
  un « Touchez-moi » qui rebondit doucement (`src/components/Slideshow.tsx`). Évite aussi
  le marquage de la dalle.
  Les visuels sont des illustrations vectorielles (`src/components/BottleArt.tsx`) : nettes
  à toute résolution, sans poids et disponibles hors-ligne. Pour utiliser de vraies
  photographies, déposez vos fichiers dans `public/slideshow/` et renseignez la constante
  `PHOTOS` en tête de `Slideshow.tsx` — l'habillage (titre, offre, appel au toucher) est
  conservé.
- **Retour automatique** : 60 s d'inactivité renvoient à l'accueil, en français.
- **Durcissement tactile** : sélection de texte, menu contextuel, zoom par double-tape et
  rebond de défilement désactivés.
- **Zone d'atteinte** : les actions principales se situent entre 65 et 95 cm du sol,
  dans la plage recommandée pour l'accessibilité (38–122 cm).

> ⚠️ **Luminosité.** La dalle annoncée est à 350 nits avec finition brillante : c'est une
> valeur d'intérieur. Sous un auvent, en vitrine ou à l'ombre, l'affichage sera net ; en
> plein soleil direct, aucun réglage logiciel ne compensera — il faudrait une dalle haute
> luminosité (1 500 nits et plus) et un traitement antireflet.

## Avant la mise en boutique

- [`src/data/config.ts`](src/data/config.ts) — **code d'accès vendeur** (`1234` par défaut).
- [`src/data/shop.ts`](src/data/shop.ts) — formats, tarifs, montant de l'offre duo, structure
  des liens vers parfumarium.fr.
- [`src/data/story.ts`](src/data/story.ts) — **le texte de présentation est à relire**. Il a été
  rédigé à partir des seuls éléments connus (parfumerie à Vaison-la-Romaine, fragrances
  d'équivalence numérotées, diagnostic offert) : aucune date, aucun nom de fondateur ni
  chiffre d'activité n'a été inventé. Ajoutez-les vous-même si vous souhaitez les mettre en avant.

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
