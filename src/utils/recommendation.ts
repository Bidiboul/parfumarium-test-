/*
 * Algorithme de recommandation Parfumarium.
 *
 * À partir des réponses du questionnaire (ou d'un code rapide),
 * chaque parfum du catalogue reçoit un score transparent :
 *
 *   +30  genre exactement celui demandé
 *   +20  parfum unisexe qui convient à la cible
 *   +35  famille olfactive correspondante
 *   +25  tag de la sous-question correspondant
 *   +20  occasion correspondante
 *   +20  intensité exacte / +10 proche (écart de 1) / -15 trop éloignée
 *   +20  style correspondant
 *    +8  par note ou tag pertinent supplémentaire (plafonné à 5)
 *   -50  par élément « à éviter » présent dans le parfum
 *   +20  parfum facile à porter quand le client veut du rassurant
 *   +25  parfum niche/original quand le client veut de l'original
 *   -30  parfum fort/très puissant quand le client veut du discret
 *   -40  parfum gourmand quand le client veut éviter le trop sucré
 *
 * Résultat : top 3 (sélection principale), 4 suivants (à faire sentir
 * en plus) et une phrase vendeur générée selon l'univers choisi.
 */

import type { Perfume } from "../data/perfumes";
import type { Translation } from "../i18n/types";
import { fr } from "../i18n/fr";
import {
  FAMILY_OPTIONS,
  SUB_QUESTIONS,
  USAGE_OPTIONS,
  INTENSITY_OPTIONS,
  STYLE_OPTIONS,
  AVOID_OPTIONS,
} from "../data/questions";

export type Answers = {
  genderTarget: string;
  mainFamily: string;
  usage: string;
  intensity: string;
  style: string;
  subPreference?: string;
  avoid?: string[];
};

export type PerfumeWithScore = Perfume & {
  score: number;
  /** Explications lisibles du score, affichées au vendeur. */
  reasons: string[];
  /** Vrai si une note « à éviter » a fortement pénalisé le parfum. */
  penalized: boolean;
};

export type Recommendation = {
  top3: PerfumeWithScore[];
  extras: PerfumeWithScore[];
  sellerPhrase: string;
};

/* ------------------------------------------------------------------ */
/* Utilitaires de comparaison de chaînes                               */
/* ------------------------------------------------------------------ */

/** Normalise une chaîne : minuscules + apostrophes typographiques unifiées. */
const norm = (s: string): string => s.toLowerCase().replace(/’/g, "'").trim();

/** Vrai si l'un des éléments de `haystack` contient `needle` (normalisé). */
const listHas = (haystack: string[], needle: string): boolean => {
  const n = norm(needle);
  return haystack.some((h) => norm(h).includes(n));
};

/** Vrai si au moins un des `needles` est trouvé dans `haystack`. */
const listHasAny = (haystack: string[], needles: string[]): boolean =>
  needles.some((n) => listHas(haystack, n));

/* ------------------------------------------------------------------ */
/* Cible / genre                                                       */
/* ------------------------------------------------------------------ */

/** Genres de parfums acceptables pour une cible donnée. */
const acceptedGenders = (target: string): string[] => {
  switch (target) {
    case "femme":
    case "cadeau-femme":
      // Cadeau femme : accepter femme + unisexe.
      return ["femme", "unisexe"];
    case "homme":
    case "cadeau-homme":
      return ["homme", "unisexe"];
    default:
      // Mixte / cadeau mixte : tout est possible.
      return ["femme", "homme", "unisexe"];
  }
};

/* ------------------------------------------------------------------ */
/* Score d'un parfum                                                   */
/* ------------------------------------------------------------------ */

const scorePerfume = (p: Perfume, answers: Answers, t: Translation): PerfumeWithScore | null => {
  // Exclusion dure : ne jamais proposer un parfum du genre opposé.
  if (!acceptedGenders(answers.genderTarget).includes(p.gender)) return null;

  let score = 0;
  const reasons: string[] = [];
  let penalized = false;

  /* --- Genre : +30 exact, +20 unisexe qui convient --- */
  const targetIsMixte = answers.genderTarget === "mixte" || answers.genderTarget === "cadeau-mixte";
  if (targetIsMixte) {
    score += p.gender === "unisexe" ? 30 : 15;
  } else if (p.gender === "unisexe") {
    score += 20;
  } else {
    score += 30;
  }

  /* --- Famille : +35 si les tags de la famille choisie se retrouvent
         dans les tags ou la famille du parfum --- */
  const family = FAMILY_OPTIONS[answers.mainFamily];
  const likedTags: string[] = [];
  if (family) {
    likedTags.push(...family.matchTags);
    if (listHasAny([...p.tags, p.family], family.matchTags)) {
      score += 35;
      reasons.push(t.reasons.family(t.options[answers.mainFamily] ?? family.label));
    }
  }

  /* --- Sous-question : +25 si le tag précis est présent (tags ou notes) --- */
  if (answers.subPreference && family?.branch) {
    const sub = SUB_QUESTIONS[family.branch].options[answers.subPreference];
    if (sub) {
      likedTags.push(...sub.matchTags);
      if (listHasAny([...p.tags, ...p.notes], sub.matchTags)) {
        score += 25;
        reasons.push(t.reasons.sub(t.options[answers.subPreference] ?? sub.label));
      }
    }
  }

  /* --- Occasion : +20 --- */
  const usage = USAGE_OPTIONS[answers.usage];
  if (usage && listHasAny(p.occasions, usage.occasions)) {
    score += 20;
    reasons.push(t.reasons.usage(t.options[answers.usage] ?? usage.label));
  }

  /* --- Intensité : +20 exacte, +10 proche, -15 trop éloignée --- */
  const wanted = INTENSITY_OPTIONS[answers.intensity]?.value;
  if (wanted) {
    const diff = Math.abs(p.intensity - wanted);
    if (diff === 0) {
      score += 20;
      reasons.push(t.reasons.intensity(t.options[answers.intensity] ?? INTENSITY_OPTIONS[answers.intensity].label));
    } else if (diff === 1) {
      score += 10;
    } else {
      score -= 15;
    }
  }

  /* --- Style : +20 --- */
  const style = STYLE_OPTIONS[answers.style];
  if (style && listHasAny(p.styles, style.styles)) {
    score += 20;
    reasons.push(t.reasons.style(t.options[answers.style] ?? style.label));
  }

  /* --- Notes / tags pertinents supplémentaires : +8 chacun (max 5) --- */
  const uniqueLiked = [...new Set(likedTags.map(norm))];
  let bonusCount = 0;
  for (const tag of uniqueLiked) {
    if (bonusCount >= 5) break;
    if (listHas([...p.notes, ...p.tags], tag)) bonusCount += 1;
  }
  score += bonusCount * 8;

  /* --- Éléments à éviter : -50 par correspondance dans avoidTags --- */
  for (const key of answers.avoid ?? []) {
    const avoid = AVOID_OPTIONS[key];
    if (!avoid?.tag) continue;
    if (listHas(p.avoidTags, avoid.tag)) {
      score -= 50;
      penalized = true;
    }
    // Règle renforcée : gourmand/sucré alors que le client fuit le trop sucré.
    if (avoid.tag === "trop sucré" && listHasAny(p.tags, ["gourmand", "sucré"])) {
      score -= 40;
      penalized = true;
    }
  }

  /* --- Bonus / malus contextuels --- */
  if (style?.wantsRassurant && listHasAny(p.styles, ["facile", "rassurant"])) {
    score += 20;
    reasons.push(t.reasons.rassurant);
  }
  if (style?.wantsOriginal && (listHasAny(p.styles, ["original", "niche"]) || listHas(p.tags, "niche"))) {
    score += 25;
    reasons.push(t.reasons.original);
  }
  if (usage?.discret && p.intensity >= 3) {
    score -= 30; // trop présent pour un usage discret
  }

  return { ...p, score, reasons, penalized };
};

/* ------------------------------------------------------------------ */
/* Tri, diversité et facilité de vente                                 */
/* ------------------------------------------------------------------ */

/** Parfum considéré « facile à vendre » en boutique. */
const isEasySell = (p: Perfume): boolean =>
  listHasAny(p.styles, ["facile", "rassurant", "tendance"]);

/** Deux parfums sont « trop similaires » s'ils partagent au moins 3 tags. */
const tooSimilar = (a: Perfume, b: Perfume): boolean => {
  const setA = new Set(a.tags.map(norm));
  const common = b.tags.map(norm).filter((t) => setA.has(t));
  return common.length >= 3;
};

/* ------------------------------------------------------------------ */
/* Phrase vendeur                                                      */
/* ------------------------------------------------------------------ */

/**
 * Mot de caractérisation d'un parfum pour la phrase vendeur.
 * Retourne une clé traduite ensuite via t.seller.styleWords.
 */
const styleWordKey = (p: Perfume, exclude: string[]): string => {
  const candidates: Array<[string, string]> = [
    ["tendance", "tendance"],
    ["sexy", "sensuel"],
    ["original", "original"],
    ["niche", "confidentiel"],
    ["premium", "premium"],
    ["charismatique", "affirme"],
    ["élégant", "elegant"],
  ];
  for (const [styleKey, wordKey] of candidates) {
    if (listHas(p.styles, styleKey) && !exclude.includes(wordKey)) return wordKey;
  }
  return exclude.includes("signature") ? "affirme" : "signature";
};

const buildSellerPhrase = (answers: Answers, top3: PerfumeWithScore[], t: Translation): string => {
  const familyLabel =
    t.options[answers.mainFamily] ?? FAMILY_OPTIONS[answers.mainFamily]?.label ?? "";
  if (top3.length < 3) return t.seller.short(familyLabel);
  const key2 = styleWordKey(top3[1], []);
  const key3 = styleWordKey(top3[2], [key2]);
  return t.seller.phrase(familyLabel, t.seller.styleWords[key2], t.seller.styleWords[key3]);
};

/* ------------------------------------------------------------------ */
/* Fonction principale                                                 */
/* ------------------------------------------------------------------ */

export function recommendPerfumes(
  answers: Answers,
  catalogue: Perfume[],
  t: Translation = fr
): Recommendation {
  // 1. Scorer tous les parfums compatibles avec la cible.
  const scored = catalogue
    .map((p) => scorePerfume(p, answers, t))
    .filter((p): p is PerfumeWithScore => p !== null);

  // 2. Écarter les parfums fortement pénalisés par les notes à éviter,
  //    sauf s'il ne reste pas assez d'options (7 = top 3 + 4 annexes).
  const clean = scored.filter((p) => !p.penalized);
  const pool = clean.length >= 7 ? clean : scored;

  // 3. Trier par score décroissant ; à score égal, privilégier le parfum
  //    le plus facile à vendre en boutique.
  pool.sort((a, b) => b.score - a.score || Number(isEasySell(b)) - Number(isEasySell(a)));

  // 4. Si deux parfums sont proches (écart < 8 points), faire passer
  //    devant celui qui est le plus facile à vendre.
  for (let i = 0; i < Math.min(pool.length - 1, 6); i++) {
    const current = pool[i];
    const next = pool[i + 1];
    if (current.score - next.score < 8 && !isEasySell(current) && isEasySell(next)) {
      pool[i] = next;
      pool[i + 1] = current;
    }
  }

  // 5. Diversité : éviter 3 parfums trop similaires dans le top 3, sauf si
  //    le client a demandé une famille précise (sous-question renseignée).
  if (!answers.subPreference && pool.length > 3) {
    const [a, b, c] = pool;
    if (tooSimilar(a, b) && tooSimilar(a, c) && tooSimilar(b, c)) {
      const replacementIndex = pool.findIndex(
        (p, i) => i > 2 && !tooSimilar(p, a) && !tooSimilar(p, b)
      );
      if (replacementIndex !== -1) {
        const [replacement] = pool.splice(replacementIndex, 1);
        pool.splice(2, 0, replacement);
      }
    }
  }

  const top3 = pool.slice(0, 3);
  const extras = pool.slice(3, 7);

  return { top3, extras, sellerPhrase: buildSellerPhrase(answers, top3, t) };
}
