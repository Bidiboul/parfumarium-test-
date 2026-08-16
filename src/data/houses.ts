/*
 * Maisons de référence.
 *
 * L'index externe recense plus de 2 500 marques, sans hiérarchie. Une
 * même dénomination y existe donc plusieurs fois : « Eros » chez Versace
 * mais aussi chez trois marques confidentielles, « Chance » chez Chanel
 * comme chez Geoffrey Beene. Sans repère, la recherche remontait
 * l'inconnue et proposait une équivalence sans rapport avec ce que le
 * client avait en tête.
 *
 * Cette liste sert uniquement à ordonner les résultats : elle ne retire
 * aucune référence et n'invente aucune donnée olfactive. Les maisons
 * dont la boutique propose déjà des équivalences passent d'office avant
 * celles-ci (voir HOUSES dans utils/equivalence).
 *
 * Écriture sans accent ni ponctuation : la comparaison est faite sur des
 * noms normalisés.
 */
export const NOTABLE_HOUSES: string[] = [
  // Grande parfumerie sélective
  "acqua di parma",
  "annick goutal",
  "atelier cologne",
  "azzaro",
  "balenciaga",
  "boucheron",
  "bottega veneta",
  "burberry",
  "bvlgari",
  "bulgari",
  "cacharel",
  "calvin klein",
  "carolina herrera",
  "cartier",
  "chloe",
  "clinique",
  "diesel",
  "davidoff",
  "elie saab",
  "estee lauder",
  "gucci",
  "guess",
  "hermes",
  "hugo boss",
  "issey miyake",
  "jean paul gaultier",
  "jimmy choo",
  "kenzo",
  "lacoste",
  "lancome",
  "lanvin",
  "loewe",
  "marc jacobs",
  "moschino",
  "mugler",
  "narciso rodriguez",
  "nina ricci",
  "paco rabanne",
  "rabanne",
  "ralph lauren",
  "roberto cavalli",
  "salvatore ferragamo",
  "shiseido",
  "sisley",
  "trussardi",
  "valentino",
  "van cleef arpels",
  "versace",
  "zadig voltaire",

  // Parfumerie de niche
  "amouage",
  "bdk parfums",
  "by kilian",
  "kilian",
  "clive christian",
  "creed",
  "diptyque",
  "escentric molecules",
  "ex nihilo",
  "etat libre d orange",
  "histoires de parfums",
  "initio",
  "jo malone",
  "juliette has a gun",
  "maison crivelli",
  "maison francis kurkdjian",
  "maison margiela",
  "mancera",
  "marc antoine barrois",
  "matiere premiere",
  "memo paris",
  "nasomatto",
  "nishane",
  "orto parisi",
  "parfum d empire",
  "parfums de marly",
  "penhaligon",
  "profumum roma",
  "roja",
  "serge lutens",
  "tiziana terenzi",
  "l artisan parfumeur",
  "the different company",
];
