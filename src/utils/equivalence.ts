/*
 * Recherche par équivalence.
 *
 * Le client indique le parfum de marque qu'il porte déjà
 * (ex. « Black Opium », « Sauvage ») et l'application retrouve la
 * référence Parfumarium correspondante, plus des alternatives proches.
 *
 * La donnée vient du champ `match` du catalogue, de la forme
 * « Black Opium - Yves Saint Laurent ».
 */

import { perfumes, type Perfume } from "../data/perfumes";

export interface Equivalence {
  perfume: Perfume;
  /** Nom du parfum de marque, ex. « Black Opium ». */
  brandName: string;
  /** Maison, ex. « Yves Saint Laurent » (vide si absente du catalogue). */
  house: string;
}

/** Minuscules sans accents ni ponctuation, pour une recherche tolérante. */
const normalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les accents
    .replace(/['’`]/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Découpe « Nom - Maison » en ses deux parties. */
const splitMatch = (match: string): { brandName: string; house: string } => {
  const [name, ...rest] = match.split(" - ");
  return { brandName: name.trim(), house: rest.join(" - ").trim() };
};

/** Catalogue des équivalences, construit une fois au chargement. */
export const EQUIVALENCES: Equivalence[] = perfumes.map((perfume) => ({
  perfume,
  ...splitMatch(perfume.match),
}));

/** Toutes les maisons présentes au catalogue, triées. */
export const HOUSES: string[] = [
  ...new Set(EQUIVALENCES.map((e) => e.house).filter(Boolean)),
].sort((a, b) => a.localeCompare(b, "fr"));

/**
 * Recherche une équivalence à partir de ce que tape le client.
 * Cherche dans le nom de marque, la maison, ainsi que le nom et le
 * numéro Parfumarium. Les correspondances en début de nom remontent.
 */
export function searchEquivalences(query: string, limit = 8): Equivalence[] {
  const q = normalize(query);
  if (q.length < 2) return [];

  const scored = EQUIVALENCES.map((entry) => {
    const brand = normalize(entry.brandName);
    const house = normalize(entry.house);
    const name = normalize(entry.perfume.name);

    let score = 0;
    if (brand === q) score = 100;
    else if (brand.startsWith(q)) score = 80;
    else if (brand.includes(q)) score = 60;
    else if (name.startsWith(q)) score = 50;
    else if (name.includes(q)) score = 40;
    else if (house.includes(q)) score = 30;
    else if (entry.perfume.id.startsWith(q)) score = 70;

    return { entry, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.brandName.localeCompare(b.entry.brandName));

  return scored.slice(0, limit).map((x) => x.entry);
}

/**
 * Alternatives proches d'une équivalence trouvée : même famille ou
 * univers voisin, hors du parfum lui-même.
 */
export function findAlternatives(target: Perfume, limit = 3): Perfume[] {
  const targetTags = new Set(target.tags.map(normalize));

  return perfumes
    .filter((p) => p.id !== target.id)
    .map((p) => {
      let score = 0;
      // Même famille olfactive : le signal le plus fort.
      if (normalize(p.family) === normalize(target.family)) score += 10;
      // Tags partagés.
      score += p.tags.filter((tag) => targetTags.has(normalize(tag))).length * 3;
      // Genre compatible.
      if (p.gender === target.gender || p.gender === "unisexe") score += 2;
      // Intensité voisine.
      if (Math.abs(p.intensity - target.intensity) <= 1) score += 2;
      return { p, score };
    })
    .filter((x) => x.score >= 6)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}
