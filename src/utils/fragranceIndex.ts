/*
 * Index des références externes.
 *
 * Charge à la demande le fichier public/fragrance-index.json (généré
 * par scripts/build-fragrance-index.mjs), permet d'y rechercher un
 * parfum par nom ou par marque, et rapproche la référence trouvée du
 * parfum Parfumarium le plus proche.
 *
 * Le rapprochement compare des « profils » : chaque parfum, externe ou
 * boutique, est réduit à un ensemble pondéré de jetons olfactifs
 * (vanilla, oud, citrus…). La proximité est mesurée par un coefficient
 * de Dice, qui récompense les descripteurs communs sans pénaliser les
 * parfums très détaillés.
 */

import { perfumes, type Perfume } from "../data/perfumes";
import { shopProfile } from "../data/canonical";
import { HOUSES as SHOP_HOUSES } from "./equivalence";

/** Fichier brut tel que produit par le script de construction. */
interface RawIndex {
  version: number;
  generated: string;
  canon: string[];
  notes: string[];
  noteCanon: number[];
  accords: string[];
  accordCanon: number[];
  brands: string[];
  items: Array<[number, string, number, number[], number[]]>;
}

/** Une référence externe, telle qu'exploitée par l'application. */
export interface Reference {
  /** Position dans l'index (identifiant stable pour cette version). */
  id: number;
  name: string;
  brand: string;
  /** Année de lancement, 0 si inconnue. */
  year: number;
  /** Notes olfactives, en français. */
  notes: string[];
  /** Accords principaux, en français. */
  accords: string[];
}

/** Résultat du rapprochement avec le catalogue boutique. */
export interface ReferenceMatch {
  reference: Reference;
  /** Parfum Parfumarium le plus proche. */
  best: Perfume;
  /** Proximité du meilleur résultat, de 0 à 1. */
  score: number;
  /** Deux à trois autres pistes intéressantes. */
  alternatives: Perfume[];
}

let index: RawIndex | null = null;
let loading: Promise<RawIndex> | null = null;

/** Charge l'index une seule fois ; les appels suivants réutilisent le résultat. */
export function loadIndex(): Promise<RawIndex> {
  if (index) return Promise.resolve(index);
  if (!loading) {
    loading = fetch(`${import.meta.env.BASE_URL}fragrance-index.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Index indisponible (${response.status})`);
        return response.json() as Promise<RawIndex>;
      })
      .then((data) => {
        index = data;
        return data;
      })
      .catch((error) => {
        loading = null; // permet une nouvelle tentative
        throw error;
      });
  }
  return loading;
}

/** Vrai si l'index est déjà en mémoire. */
export const isIndexReady = (): boolean => index !== null;

/** Nombre de références disponibles. */
export const referenceCount = (): number => index?.items.length ?? 0;

/* ------------------------------------------------------------------ */
/* Recherche                                                           */
/* ------------------------------------------------------------------ */

/** Minuscules sans accents ni ponctuation, pour une recherche tolérante. */
const normalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’`]/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toReference = (data: RawIndex, id: number): Reference => {
  const [brandId, name, year, noteIds, accordIds] = data.items[id];
  return {
    id,
    name,
    brand: data.brands[brandId],
    year,
    notes: noteIds.map((i) => data.notes[i]),
    accords: accordIds.map((i) => data.accords[i]),
  };
};

/**
 * Recherche une référence par nom de parfum ou par marque.
 * Les correspondances en début de nom remontent en premier, puis les
 * parfums les mieux documentés (avec notes détaillées).
 */
export function searchReferences(query: string, limit = 12): Reference[] {
  const data = index;
  if (!data) return [];

  const q = normalize(query);
  if (q.length < 2) return [];

  const scored: Array<{ id: number; score: number }> = [];

  for (let id = 0; id < data.items.length; id++) {
    const [brandId, name, , noteIds] = data.items[id];
    const nameNorm = normalize(name);
    const brandNorm = normalize(data.brands[brandId]);
    const full = `${brandNorm} ${nameNorm}`;

    let score = 0;
    if (nameNorm === q) score = 100;
    else if (nameNorm.startsWith(q)) score = 80;
    else if (full.includes(q)) score = nameNorm.includes(q) ? 60 : 40;
    else continue;

    // À pertinence égale, préférer les références documentées.
    if (noteIds.length > 0) score += 6;
    scored.push({ id, score });

    // Sécurité : au-delà, le tri suffit à départager.
    if (scored.length > 4000) break;
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => toReference(data, s.id));
}

/* ------------------------------------------------------------------ */
/* Parcours par maison                                                 */
/* ------------------------------------------------------------------ */

export interface House {
  /** Identifiant interne (position dans la table des marques). */
  id: number;
  name: string;
  /** Nombre de références au catalogue. */
  count: number;
  /** Vrai si la boutique propose des équivalences de cette maison. */
  featured: boolean;
}

/** Table maison → références, construite à la première demande. */
let housesCache: House[] | null = null;

/**
 * Liste des maisons.
 *
 * Les maisons dont la boutique propose des équivalences apparaissent en
 * premier : ce sont celles que les clients citent réellement. Sans ce
 * classement, la liste s'ouvrirait sur les marques les plus prolifiques
 * de l'index (catalogues de vente directe, marques régionales…), qui ne
 * correspondent pas aux demandes en boutique.
 */
export function listHouses(query = "", limit = 60): House[] {
  const data = index;
  if (!data) return [];

  if (!housesCache) {
    const featured = new Set(SHOP_HOUSES.map((h) => normalize(h)).filter(Boolean));
    const counts = new Array<number>(data.brands.length).fill(0);
    for (const [brandId] of data.items) counts[brandId] += 1;

    housesCache = data.brands
      .map((name, id) => {
        const key = normalize(name);
        return {
          id,
          name,
          count: counts[id],
          // Tolère les variantes de dénomination (« Christian Dior » / « Dior »).
          featured: [...featured].some((f) => key === f || key.includes(f) || f.includes(key)),
        };
      })
      .filter((h) => h.count > 0)
      .sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          b.count - a.count ||
          a.name.localeCompare(b.name)
      );
  }

  const q = normalize(query);
  const source = q.length > 0 ? housesCache.filter((h) => normalize(h.name).includes(q)) : housesCache;
  return source.slice(0, limit);
}

/** Références d'une maison, par ordre alphabétique. */
export function referencesOfHouse(houseId: number, limit = 300): Reference[] {
  const data = index;
  if (!data) return [];

  const found: Reference[] = [];
  for (let id = 0; id < data.items.length && found.length < limit; id++) {
    if (data.items[id][0] === houseId) found.push(toReference(data, id));
  }
  return found.sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

/* ------------------------------------------------------------------ */
/* Rapprochement avec le catalogue boutique                            */
/* ------------------------------------------------------------------ */

/** Profils canoniques des parfums boutique, calculés une seule fois. */
const shopProfiles = perfumes.map((perfume) => ({ perfume, profile: shopProfile(perfume) }));

/**
 * Profil canonique pondéré d'une référence externe.
 * Les accords principaux décrivent le caractère dominant : ils pèsent
 * plus lourd que les notes prises isolément.
 */
function referenceProfile(data: RawIndex, id: number): Map<string, number> {
  const [, , , noteIds, accordIds] = data.items[id];
  const profile = new Map<string, number>();
  const add = (canonId: number, weight: number) => {
    if (canonId < 0) return;
    const token = data.canon[canonId];
    profile.set(token, Math.max(profile.get(token) ?? 0, weight));
  };

  noteIds.forEach((i) => add(data.noteCanon[i], 1));
  accordIds.forEach((i) => add(data.accordCanon[i], 2));
  return profile;
}

/**
 * Similarité cosinus entre deux profils (0 à 1).
 *
 * Choisie après comparaison avec d'autres mesures (Dice, couverture)
 * sur les correspondances officielles du catalogue : c'est celle qui
 * classait le mieux. Contrairement à Dice, elle ne favorise pas les
 * parfums peu documentés, dont le profil réduit gonflait le score.
 */
function similarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  for (const [token, weight] of a) {
    const other = b.get(token);
    if (other) dot += weight * other;
  }
  if (dot === 0) return 0;

  const normA = Math.sqrt([...a.values()].reduce((s, w) => s + w * w, 0));
  const normB = Math.sqrt([...b.values()].reduce((s, w) => s + w * w, 0));
  return normA && normB ? dot / (normA * normB) : 0;
}

/** Deux parfums boutique partageant au moins trois tags se ressemblent trop. */
const tooSimilar = (a: Perfume, b: Perfume): boolean => {
  const tags = new Set(a.tags.map((t) => t.toLowerCase()));
  return b.tags.filter((t) => tags.has(t.toLowerCase())).length >= 3;
};

/**
 * Rapproche une référence externe du catalogue : le parfum le plus
 * proche, puis deux à trois pistes complémentaires — volontairement
 * différentes entre elles, pour élargir le choix du client plutôt que
 * de proposer trois fois le même profil.
 */
export function matchReference(reference: Reference): ReferenceMatch | null {
  const data = index;
  if (!data) return null;

  const profile = referenceProfile(data, reference.id);

  const ranked = shopProfiles
    .map(({ perfume, profile: shop }) => ({ perfume, score: similarity(profile, shop) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best || best.score === 0) return null;

  const alternatives: Perfume[] = [];
  for (const { perfume } of ranked.slice(1)) {
    if (alternatives.length >= 3) break;
    // Éviter les doublons de caractère avec le premier choix et entre eux.
    if (tooSimilar(perfume, best.perfume)) continue;
    if (alternatives.some((a) => tooSimilar(a, perfume))) continue;
    alternatives.push(perfume);
  }

  // Si la diversité a trop restreint le choix, compléter par le classement.
  for (const { perfume } of ranked.slice(1)) {
    if (alternatives.length >= 3) break;
    if (!alternatives.includes(perfume)) alternatives.push(perfume);
  }

  return { reference, best: best.perfume, score: best.score, alternatives };
}
