/*
 * Français — langue de référence.
 * Les libellés d'options sont dérivés directement de src/data/questions.ts
 * pour éviter toute divergence.
 */

import type { Translation } from "./types";
import { AGENT, AGENT_TIPS } from "../data/agent";
import {
  GENDER_OPTIONS,
  FAMILY_OPTIONS,
  SUB_QUESTIONS,
  USAGE_OPTIONS,
  INTENSITY_OPTIONS,
  STYLE_OPTIONS,
  AVOID_OPTIONS,
} from "../data/questions";

/* Construit la carte plate { cléOption: libellé } depuis les données. */
const options: Record<string, string> = {};
for (const group of [GENDER_OPTIONS, FAMILY_OPTIONS, USAGE_OPTIONS, INTENSITY_OPTIONS, STYLE_OPTIONS, AVOID_OPTIONS]) {
  for (const [key, value] of Object.entries(group)) options[key] = value.label;
}
for (const branch of Object.values(SUB_QUESTIONS)) {
  for (const [key, value] of Object.entries(branch.options)) options[key] = value.label;
}

export const fr: Translation = {
  ui: {
    tagline: "Trouvez le parfum idéal en quelques questions",
    start: "Commencer le diagnostic",
    subtext: "Diagnostic olfactif offert — 50 fragrances à découvrir",
    sellerSpace: "Espace vendeur",
    question: "Question",
    multi: "Plusieurs choix possibles.",
    seeSelection: "Voir la sélection",
    resultKicker: "Résultat du diagnostic",
    resultTitle: "Votre sélection signature",
    agentWord: (name) => `Le mot de ${name}`,
    extrasTitle: "À faire sentir en plus",
    copy: "Copier la sélection",
    copied: "Sélection copiée ✓",
    newDiagnostic: "Nouveau diagnostic",
    backHome: "Retour à l'accueil",
    correspondence: "Correspondance olfactive :",
    intensityLabels: ["Léger", "Moyen", "Fort", "Très puissant"],
    copyMain: "Sélection principale :",
    copyExtras: "À faire sentir en plus :",
    shareButton: "Recevoir ma sélection",
    shareTitle: "Emportez votre sélection",
    shareHint: "Scannez ce QR code pour retrouver vos parfums sur votre téléphone et les commander sur parfumarium.fr.",
    shareCopyLink: "Copier le lien",
    close: "Fermer",
    viewOnShop: "Voir sur parfumarium.fr",
    priceFrom: "À partir de",
  },
  agent: {
    greeting: AGENT.greeting,
    intro: AGENT.intro,
    resultIntro: AGENT.resultIntro,
    tips: AGENT_TIPS,
  },
  questions: {
    genderTarget: "Pour qui cherchez-vous un parfum ?",
    mainFamily: "Quel univers vous attire le plus ?",
    usage: "Pour quelle utilisation ?",
    intensity: "Quelle puissance souhaitez-vous ?",
    style: "Quel style vous correspond le mieux ?",
    avoid: "Souhaitez-vous éviter quelque chose ?",
    "sub-gourmand": SUB_QUESTIONS.gourmand.title,
    "sub-frais": SUB_QUESTIONS.frais.title,
    "sub-bois": SUB_QUESTIONS.bois.title,
    "sub-floral": SUB_QUESTIONS.floral.title,
  },
  options,
  /* En français les styles du catalogue sont affichés tels quels. */
  styleChips: {},
  reasons: {
    family: (x) => `Correspond à l'univers ${x.toLowerCase()}`,
    sub: (x) => `Profil « ${x.toLowerCase()} » bien marqué`,
    usage: (x) => `Adapté à l'usage « ${x.toLowerCase()} »`,
    intensity: (x) => `Intensité ${x.toLowerCase()} comme demandé`,
    style: (x) => `Style ${x.toLowerCase()}`,
    rassurant: "Très facile à porter au quotidien",
    original: "Vraie personnalité niche / originale",
  },
  seller: {
    phrase: (family, w2, w3) =>
      `Je vous ai sélectionné trois parfums dans votre univers ${family.toLowerCase()} : ` +
      `un premier très facile à aimer, un deuxième plus ${w2}, et un troisième plus ${w3}.`,
    short: (family) =>
      `Je vous ai sélectionné quelques parfums dans votre univers ${family.toLowerCase()}, choisis spécialement selon vos goûts.`,
    styleWords: {
      tendance: "tendance",
      sensuel: "sensuel",
      original: "original",
      confidentiel: "confidentiel",
      premium: "premium",
      affirme: "affirmé",
      elegant: "élégant",
      signature: "signature",
    },
  },
};
