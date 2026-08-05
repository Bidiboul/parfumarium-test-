/*
 * Vocabulaire canonique du catalogue Parfumarium.
 *
 * Traduit le vocabulaire français de nos parfums (notes, tags,
 * familles) vers les mêmes « jetons » que l'index des références
 * externes — c'est ce qui permet de rapprocher un parfum de marque
 * d'une de nos références boutique.
 *
 * Le pendant anglais se trouve dans scripts/fragrance-vocabulary.mjs.
 */

import type { Perfume } from "./perfumes";

/** Terme français du catalogue → jeton canonique partagé. */
const SHOP_CANON: Record<string, string> = {
  // Gourmand
  vanille: "vanilla", vanillé: "vanilla", "sucre brun": "sweet", cassonade: "sweet",
  sucre: "sweet", sucré: "sweet", gourmand: "sweet", guimauve: "sweet", rhum: "sweet",
  tonka: "tonka", coumarine: "tonka", caramel: "caramel", praline: "caramel",
  miel: "honey", cacao: "cacao", chocolat: "cacao", café: "coffee",
  amande: "almond", pistache: "pistachio", noisette: "nutty",
  lacté: "milky", crémeux: "milky", "crème glacée": "milky",
  cerise: "cherry", "cerise noire": "cherry", "pop-corn": "sweet",
  // Fruits
  fruité: "fruity", fruits: "fruity", poire: "pear", pêche: "fruity", prune: "fruity",
  pomme: "fruity", litchi: "fruity", "fruits secs": "fruity", figue: "fig",
  framboise: "berry", cassis: "berry", fraise: "berry", "fruits rouges": "berry",
  ananas: "tropical", "fruit de la passion": "tropical", exotique: "tropical",
  // Agrumes
  agrumes: "citrus", bergamote: "citrus", citron: "citrus", "citron vert": "citrus",
  orange: "citrus", mandarine: "citrus", pamplemousse: "citrus", cédrat: "citrus",
  // Floral
  floral: "floral", fleurs: "floral", rose: "rose", jasmin: "jasmine",
  "fleurs blanches": "whitefloral", tubéreuse: "whitefloral", "jasmin orchidée": "jasmine",
  "fleur d’oranger": "orangeblossom", "fleur d'oranger": "orangeblossom",
  néroli: "orangeblossom", freesia: "floral", orchidée: "floral", violette: "violet",
  iris: "iris", osmanthus: "floral", muguet: "floral",
  poudré: "powdery", "notes poudrées": "powdery",
  // Bois
  boisé: "woody", bois: "woody", "bois ambrés": "woody", "bois d’ambre": "amber",
  "bois d'ambre": "amber", cèdre: "cedar", santal: "sandalwood", vétiver: "vetiver",
  patchouli: "patchouli", cashmeran: "woody", oud: "oud", cuir: "leather",
  // Ambre, musc, résines
  ambre: "amber", ambré: "amber", "ambre gris": "amber", ambroxan: "amber",
  musc: "musk", "musc blanc": "musk", musqué: "musk", peau: "musk",
  encens: "incense", benjoin: "balsamic", résines: "balsamic", résine: "balsamic",
  // Épices
  épicé: "spicy", épices: "spicy", poivre: "pepper", "poivre rose": "pepper",
  cannelle: "cinnamon", cardamome: "spicy", gingembre: "spicy", safran: "saffron",
  "clou de girofle": "spicy", réglisse: "anise",
  // Frais et aromatique
  frais: "fresh", propre: "fresh", vert: "green", aromatique: "aromatic",
  basilic: "aromatic", romarin: "aromatic", lavande: "lavender", menthe: "mint",
  genièvre: "aromatic", cyprès: "woody", géranium: "floral", laurier: "aromatic",
  foin: "aromatic", thé: "tea", "thé noir": "tea", "thé vert": "tea",
  marin: "marine", aquatique: "aquatic", "notes marines": "marine", sel: "marine",
  solaire: "fresh", tabac: "tobacco", fumé: "smoky",
};

/** Normalise un terme : minuscules, apostrophes unifiées, espaces réduits. */
const norm = (s: string): string =>
  s.toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, " ").trim();

/** Jeton canonique d'un terme français, ou null s'il n'est pas connu. */
function canonOf(term: string): string | null {
  const key = norm(term);
  if (SHOP_CANON[key]) return SHOP_CANON[key];
  // Repli : certains termes du catalogue sont composés
  // (« vanillé oriental », « agrumes aromatique »…).
  for (const word of key.split(/[\s/]+/)) {
    if (SHOP_CANON[word]) return SHOP_CANON[word];
  }
  return null;
}

/**
 * Profil canonique pondéré d'un parfum de la boutique.
 * Les notes décrivent la matière, les tags et la famille donnent le
 * caractère : ces derniers pèsent donc un peu plus lourd.
 */
export function shopProfile(perfume: Perfume): Map<string, number> {
  const profile = new Map<string, number>();
  const add = (term: string, weight: number) => {
    const token = canonOf(term);
    if (!token) return;
    profile.set(token, Math.max(profile.get(token) ?? 0, weight));
  };

  perfume.notes.forEach((n) => add(n, 1));
  perfume.tags.forEach((t) => add(t, 1.5));
  perfume.family.split(/[\s/]+/).forEach((f) => add(f, 2));

  return profile;
}
