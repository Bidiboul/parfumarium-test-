/*
 * Mode « Code rapide » : le vendeur entre un code à 5 chiffres
 * (ex. 14134) et obtient directement la sélection, sans questionnaire.
 *
 *   1er chiffre — cible      : 1 Femme, 2 Homme, 3 Unisexe, 4 Cadeau femme, 5 Cadeau homme
 *   2e  chiffre — famille    : 1 Frais/propre, 2 Fruité, 3 Floral, 4 Vanillé/gourmand,
 *                              5 Boisé, 6 Ambré/oriental, 7 Musqué/peau propre
 *   3e  chiffre — occasion   : 1 Tous les jours, 2 Travail/discret, 3 Été/chaleur,
 *                              4 Soirée, 5 Séduction/rendez-vous, 6 Cadeau
 *   4e  chiffre — puissance  : 1 Léger, 2 Moyen, 3 Fort, 4 Très puissant
 *   5e  chiffre — style      : 1 Élégant/premium, 2 Jeune/tendance, 3 Original/niche,
 *                              4 Sexy/sensuel, 5 Facile/rassurant
 */

import type { Answers } from "./recommendation";

const GENDER_BY_DIGIT: Record<string, string> = {
  "1": "femme",
  "2": "homme",
  "3": "mixte",
  "4": "cadeau-femme",
  "5": "cadeau-homme",
};

const FAMILY_BY_DIGIT: Record<string, string> = {
  "1": "frais-propre",
  "2": "fruite",
  "3": "floral-elegant",
  "4": "vanille-gourmand",
  "5": "boise",
  "6": "ambre-musque",
  "7": "musque-peau",
};

const USAGE_BY_DIGIT: Record<string, string> = {
  "1": "tous-les-jours",
  "2": "travail",
  "3": "ete",
  "4": "soiree",
  "5": "seduction",
  "6": "cadeau",
};

const INTENSITY_BY_DIGIT: Record<string, string> = {
  "1": "leger",
  "2": "moyen",
  "3": "fort",
  "4": "tres-puissant",
};

const STYLE_BY_DIGIT: Record<string, string> = {
  "1": "elegant-premium",
  "2": "jeune-tendance",
  "3": "original-niche",
  "4": "sexy-sensuel",
  "5": "facile-rassurant",
};

/** Légende affichée sous le champ de saisie du code. */
export const CODE_LEGEND = [
  { position: "1er chiffre — Cible", values: "1 Femme · 2 Homme · 3 Unisexe · 4 Cadeau femme · 5 Cadeau homme" },
  { position: "2e chiffre — Famille", values: "1 Frais · 2 Fruité · 3 Floral · 4 Gourmand · 5 Boisé · 6 Ambré · 7 Musqué" },
  { position: "3e chiffre — Occasion", values: "1 Quotidien · 2 Travail · 3 Été · 4 Soirée · 5 Séduction · 6 Cadeau" },
  { position: "4e chiffre — Puissance", values: "1 Léger · 2 Moyen · 3 Fort · 4 Très puissant" },
  { position: "5e chiffre — Style", values: "1 Élégant · 2 Tendance · 3 Original · 4 Sexy · 5 Facile" },
];

/**
 * Convertit un code à 5 chiffres en réponses de questionnaire.
 * Retourne null si le code est invalide (message d'erreur à afficher).
 */
export function parseQuickCode(code: string): Answers | null {
  const trimmed = code.trim();
  if (!/^\d{5}$/.test(trimmed)) return null;

  const [d1, d2, d3, d4, d5] = trimmed;
  const genderTarget = GENDER_BY_DIGIT[d1];
  const mainFamily = FAMILY_BY_DIGIT[d2];
  const usage = USAGE_BY_DIGIT[d3];
  const intensity = INTENSITY_BY_DIGIT[d4];
  const style = STYLE_BY_DIGIT[d5];

  if (!genderTarget || !mainFamily || !usage || !intensity || !style) return null;

  return { genderTarget, mainFamily, usage, intensity, style, avoid: [] };
}
