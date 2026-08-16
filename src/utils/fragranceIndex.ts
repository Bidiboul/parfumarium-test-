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
import { NOTABLE_HOUSES } from "../data/houses";
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
        prepare(data);
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
 * Notoriété de chaque marque de l'index, calculée au chargement :
 * 2 = maison dont la boutique propose des équivalences, 1 = maison de
 * référence, 0 = les autres.
 */
let houseRank: number[] | null = null;

/** Points de notoriété ajoutés au score de recherche, par rang. */
const HOUSE_BONUS = [0, 20, 30];

/**
 * Recherche une référence par nom de parfum ou par marque.
 *
 * Trois critères, par ordre d'importance : la qualité de la
 * correspondance (nom exact, début de nom, contenu), la notoriété de la
 * maison, puis la richesse de la fiche. Le second est décisif : une
 * dizaine de marques peuvent porter le même nom de parfum, et le client
 * qui tape « Eros » ou « Chance » pense à Versace et à Chanel, pas à une
 * marque confidentielle. La notoriété peut donc faire passer un début de
 * nom d'une grande maison devant un nom exact d'une marque inconnue,
 * mais jamais franchir plus d'un échelon.
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

    score += HOUSE_BONUS[houseRank?.[brandId] ?? 0];
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
    const counts = new Array<number>(data.brands.length).fill(0);
    for (const [brandId] of data.items) counts[brandId] += 1;

    const rank = (id: number) => houseRank?.[id] ?? 0;
    housesCache = data.brands
      .map((name, id) => ({
        id,
        name,
        count: counts[id],
        featured: rank(id) === 2,
      }))
      .filter((h) => h.count > 0)
      .sort(
        (a, b) =>
          rank(b.id) - rank(a.id) || b.count - a.count || a.name.localeCompare(b.name)
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

/* ------------------------------------------------------------------ */
/* Préparation : pondération des jetons et profils boutique enrichis    */
/* ------------------------------------------------------------------ */

/**
 * Poids informatif de chaque jeton (IDF).
 *
 * « boisé » ou « floral » figurent dans la moitié du catalogue mondial
 * et ne distinguent presque rien ; « pistache », « oud » ou « cerise »
 * sont au contraire décisifs. Sans cette pondération, deux parfums se
 * ressemblent dès qu'ils partagent des banalités.
 */
let tokenWeight: Map<string, number> | null = null;

/** Profils des parfums boutique, enrichis des notes de leur original. */
let shopProfiles: Array<{ perfume: Perfume; profile: Map<string, number> }> = [];

/** Index nom normalisé → positions dans l'index, pour retrouver un original. */
let byName: Map<string, number[]> | null = null;

/**
 * Attribue à chaque marque de l'index son rang de notoriété.
 *
 * La comparaison tolère les variantes de dénomination (« Dior » /
 * « Christian Dior », « Mugler » / « Thierry Mugler ») en acceptant
 * qu'un nom soit contenu dans l'autre.
 */
function rankHouses(data: RawIndex): number[] {
  const clean = (list: string[]) => list.map((h) => normalize(h)).filter(Boolean);
  const featured = clean(SHOP_HOUSES);
  const notable = clean(NOTABLE_HOUSES);
  const matches = (key: string, list: string[]) =>
    list.some((h) => key === h || key.includes(h) || h.includes(key));

  return data.brands.map((name) => {
    const key = normalize(name);
    if (!key) return 0;
    if (matches(key, featured)) return 2;
    if (matches(key, notable)) return 1;
    return 0;
  });
}

/**
 * Retrouve dans l'index la référence désignée par le champ `match`
 * d'un parfum boutique (« Black Opium - Yves Saint Laurent »).
 */
function findOriginal(data: RawIndex, match: string): number | null {
  if (!byName) {
    byName = new Map();
    data.items.forEach(([, name], id) => {
      const key = normalize(name);
      const list = byName!.get(key);
      if (list) list.push(id);
      else byName!.set(key, [id]);
    });
  }

  const [rawName, ...rest] = match.split(" - ");
  const candidates = byName.get(normalize(rawName));
  if (!candidates || candidates.length === 0) return null;

  // Une même dénomination existe chez plusieurs maisons : privilégier
  // celle que notre catalogue déclare.
  const house = normalize(rest.join(" - "));
  if (house) {
    const exact = candidates.find((id) => {
      const brand = normalize(data.brands[data.items[id][0]]);
      return brand === house || brand.includes(house) || house.includes(brand);
    });
    if (exact !== undefined) return exact;
  }
  // À défaut, la référence la mieux documentée.
  return candidates.reduce((best, id) =>
    data.items[id][3].length > data.items[best][3].length ? id : best
  );
}

/**
 * Prépare les données dérivées, une fois l'index chargé.
 *
 * Le profil de chaque parfum boutique est complété par celui de
 * l'original dont il est l'équivalence : nos fiches décrivent le parfum
 * en quelques mots français, l'index en donne la composition réelle.
 * Les deux côtés de la comparaison parlent alors la même langue.
 */
function prepare(data: RawIndex): void {
  houseRank = rankHouses(data);
  tokenLean = learnGenderLean(data);

  // Fréquence documentaire de chaque jeton canonique.
  const df = new Array<number>(data.canon.length).fill(0);
  for (const [, , , noteIds, accordIds] of data.items) {
    const seen = new Set<number>();
    noteIds.forEach((i) => seen.add(data.noteCanon[i]));
    accordIds.forEach((i) => seen.add(data.accordCanon[i]));
    seen.forEach((c) => {
      if (c >= 0) df[c] += 1;
    });
  }

  const total = data.items.length;
  tokenWeight = new Map();
  data.canon.forEach((token, i) => {
    // +1 au dénominateur : un jeton absent ne doit pas diviser par zéro.
    tokenWeight!.set(token, Math.log(total / (df[i] + 1)) + 1);
  });

  shopProfiles = perfumes.map((perfume) => {
    const french = shopProfile(perfume);
    const originalId = findOriginal(data, perfume.match);

    // Sans original identifié, la description française fait foi.
    if (originalId === null) return { perfume, profile: french };

    /*
     * Le profil de l'original prime : il est de même nature que celui
     * des requêtes (mêmes accords, même vocabulaire, même niveau de
     * détail), ce qui rend la comparaison juste. La description
     * française vient seulement compléter les nuances absentes, à poids
     * réduit — sinon nos fiches, bien plus bavardes que certaines
     * entrées de l'index, gonflent le profil et faussent la mesure.
     */
    const profile = rawProfile(data, originalId);
    for (const [token, weight] of french) {
      if (!profile.has(token)) profile.set(token, weight * 0.5);
    }
    return { perfume, profile };
  });
}

/**
 * Profil canonique pondéré d'une référence externe.
 * Les accords principaux décrivent le caractère dominant : ils pèsent
 * plus lourd que les notes prises isolément.
 */
function rawProfile(data: RawIndex, id: number): Map<string, number> {
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

/** Applique la pondération informative (IDF) à un profil. */
function weighted(profile: Map<string, number>): Map<string, number> {
  if (!tokenWeight) return profile;
  const out = new Map<string, number>();
  for (const [token, weight] of profile) {
    out.set(token, weight * (tokenWeight.get(token) ?? 1));
  }
  return out;
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

/*
 * L'index ne renseigne pas le genre. Beaucoup de parfums l'annoncent
 * pourtant dans leur nom : quand c'est le cas, autant ne pas proposer
 * une fragrance ouvertement féminine à qui cite « Le Mâle ». Les
 * références unisexes restent toujours proposables, et un nom muet ne
 * déclenche aucun filtrage.
 */
// Les motifs sont comparés au nom normalisé : sans accent ni ponctuation.
const MASCULINE = /\b(homme|hommes|men|man|male|uomo|hombre|herren|him|monsieur)\b/;
const FEMININE = /\b(femme|femmes|women|woman|her|she|lady|ladies|donna|mujer|damen|girl|mademoiselle|madame)\b/;

function genderHint(name: string): "homme" | "femme" | null {
  const n = normalize(name);
  const masculine = MASCULINE.test(n);
  const feminine = FEMININE.test(n);
  // Un nom qui évoque les deux (« pour homme et femme ») n'aide pas.
  if (masculine === feminine) return null;
  return masculine ? "homme" : "femme";
}

/**
 * Orientation masculine (+1) ou féminine (-1) de chaque jeton.
 *
 * Déduite des 3 500 références dont le nom annonce le genre : la lavande
 * et le tabac y sont massivement masculins, la rose et le caramel
 * massivement féminins. Le reste de l'index en hérite.
 */
let tokenLean: Map<string, number> | null = null;

function learnGenderLean(data: RawIndex): Map<string, number> {
  const male = new Map<number, number>();
  const female = new Map<number, number>();
  let males = 0;
  let females = 0;

  for (const [, name, , noteIds, accordIds] of data.items) {
    const hint = genderHint(name);
    if (!hint) continue;
    const bag = hint === "homme" ? male : female;
    if (hint === "homme") males++;
    else females++;

    const seen = new Set<number>();
    noteIds.forEach((i) => seen.add(data.noteCanon[i]));
    accordIds.forEach((i) => seen.add(data.accordCanon[i]));
    seen.forEach((c) => {
      if (c >= 0) bag.set(c, (bag.get(c) ?? 0) + 1);
    });
  }

  const lean = new Map<string, number>();
  if (males < 100 || females < 100) return lean;

  data.canon.forEach((token, i) => {
    const m = male.get(i) ?? 0;
    const f = female.get(i) ?? 0;
    // Sous 40 occurrences, la proportion n'est pas fiable.
    if (m + f < 40) return;
    const rm = m / males;
    const rf = f / females;
    lean.set(token, (rm - rf) / (rm + rf));
  });
  return lean;
}

/**
 * Orientation d'une référence, de -1 (féminine) à +1 (masculine).
 * Renvoie 0 quand rien ne tranche.
 */
function profileLean(profile: Map<string, number>): number {
  if (!tokenLean) return 0;
  let sum = 0;
  let total = 0;
  for (const [token, weight] of profile) {
    const lean = tokenLean.get(token);
    if (lean === undefined) continue;
    sum += weight * lean;
    total += weight;
  }
  return total ? sum / total : 0;
}

/** Degré de confiance affiché au client. */
export type Confidence = "forte" | "bonne" | "piste";

/**
 * Traduit un score en degré de confiance.
 *
 * Nos 46 parfums ne peuvent pas couvrir 36 000 références : certaines
 * demandes n'ont tout simplement pas d'équivalent en boutique. Mieux
 * vaut alors l'annoncer que présenter le moins mauvais résultat comme
 * une correspondance. Les seuils viennent de la distribution réelle des
 * scores sur l'index : au-delà de 0,75 on est dans les 8 % les plus
 * proches, en dessous de 0,60 dans la moitié la plus lointaine.
 */
export function confidenceOf(score: number): Confidence {
  if (score >= 0.75) return "forte";
  if (score >= 0.6) return "bonne";
  return "piste";
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

  const raw = rawProfile(data, reference.id);
  const profile = weighted(raw);

  /*
   * Genre. Le nom fait foi quand il l'annonce (« Le Mâle », « for
   * Women ») : le genre opposé est alors écarté. Sinon on se rabat sur
   * l'orientation moyenne des jetons — une simple tendance, appliquée
   * en proportion de sa netteté, jamais en tout ou rien. Les parfums
   * unisexes ne sont jamais pénalisés : ils restent la réponse la plus
   * sûre quand la composition ne tranche pas.
   *
   * Mesuré sur les 3 591 références dont le nom annonce le genre, en
   * masquant cette mention : le genre proposé passe de 24 % de
   * contresens à 14 %.
   */
  const named = genderHint(reference.name);
  const eligible = named
    ? shopProfiles.filter(({ perfume }) => perfume.gender === named || perfume.gender === "unisexe")
    : shopProfiles;

  const lean = named ? 0 : profileLean(raw);

  const ranked = (eligible.length > 0 ? eligible : shopProfiles)
    .map(({ perfume, profile: shop }) => {
      const against =
        perfume.gender === "femme" ? Math.max(0, lean)
        : perfume.gender === "homme" ? Math.max(0, -lean)
        : 0;
      return { perfume, score: similarity(profile, weighted(shop)) * (1 - against) };
    })
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
