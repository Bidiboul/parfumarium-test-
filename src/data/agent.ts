/*
 * Thibault — l'agent olfactif digital de Parfumarium.
 * Toute la personnalité de l'agent (nom, phrases d'accompagnement)
 * est centralisée ici pour être modifiable facilement.
 */

export const AGENT = {
  name: "Thibault",
  role: "votre agent olfactif digital",
  greeting: "Bonjour, je suis Thibault, votre agent olfactif digital.",
  intro:
    "Je vous accompagne pas à pas pour trouver votre parfum signature. Répondez à quelques questions, je m'occupe du reste.",
  resultIntro: "Voici les fragrances que j'ai sélectionnées pour vous.",
};

/** Petite phrase d'accompagnement de Thibault pour chaque étape du questionnaire. */
export const AGENT_TIPS: Record<string, string> = {
  genderTarget: "Ravi de vous rencontrer ! Dites-moi d'abord pour qui nous cherchons ce parfum.",
  mainFamily:
    "Choisissez l'univers qui vous fait envie, sans trop réfléchir : la première impression est souvent la bonne.",
  subPreference: "Affinons un peu — c'est ici que votre signature commence à se dessiner.",
  usage: "Un parfum se choisit aussi selon les moments où vous le porterez.",
  intensity: "Plutôt un sillage discret… ou une vraie présence qui marque ?",
  style: "Le parfum est un vêtement invisible : quel style vous ressemble le plus ?",
  avoid: "Dernière étape : y a-t-il des notes que vous préférez écarter ?",
};
