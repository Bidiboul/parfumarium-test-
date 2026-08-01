/*
 * Profil olfactif nommé.
 *
 * À partir des réponses, on donne un nom au profil du client
 * (ex. « Gourmand Sensuel », « Boisé Magnétique ») affiché en tête du
 * résultat. Cela transforme la liste de parfums en véritable
 * diagnostic personnalisé — et rend le partage plus désirable.
 */

import type { Answers } from "./recommendation";
import type { Translation } from "../i18n/types";

export interface OlfactoryProfile {
  /** Nom du profil, ex. « Gourmand Sensuel ». */
  name: string;
  /** Phrase de caractérisation affichée sous le nom. */
  sentence: string;
}

export function buildProfile(answers: Answers, t: Translation): OlfactoryProfile {
  const noun = t.profile.nouns[answers.mainFamily] ?? t.profile.fallbackNoun;
  let adjective = t.profile.adjectives[answers.style] ?? t.profile.fallbackAdjective;

  // Éviter les répétitions du type « Singulier Singulier ».
  if (adjective.toLowerCase() === noun.toLowerCase()) adjective = t.profile.fallbackAdjective;

  return {
    name: `${noun} ${adjective}`,
    sentence: t.profile.sentence(
      t.options[answers.mainFamily] ?? "",
      t.options[answers.intensity] ?? "",
      t.options[answers.style] ?? ""
    ),
  };
}
