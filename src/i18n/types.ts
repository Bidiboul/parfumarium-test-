/*
 * Types du système de traduction.
 * Le parcours client existe en 5 langues ; les écrans vendeur
 * (code rapide, recherche, historique) restent en français.
 */

export type Lang = "fr" | "en" | "de" | "es" | "it";

export const LANGUAGES: Array<{ code: Lang; flag: string; name: string }> = [
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "de", flag: "🇩🇪", name: "Deutsch" },
  { code: "es", flag: "🇪🇸", name: "Español" },
  { code: "it", flag: "🇮🇹", name: "Italiano" },
];

export interface Translation {
  /** Textes d'interface génériques. */
  ui: {
    tagline: string;
    start: string;
    subtext: string;
    sellerSpace: string;
    question: string;
    multi: string;
    seeSelection: string;
    resultKicker: string;
    resultTitle: string;
    agentWord: (name: string) => string;
    extrasTitle: string;
    copy: string;
    copied: string;
    newDiagnostic: string;
    backHome: string;
    correspondence: string;
    intensityLabels: [string, string, string, string];
    copyMain: string;
    copyExtras: string;
    /* Partage / QR code */
    shareButton: string;
    shareTitle: string;
    shareHint: string;
    shareCopyLink: string;
    close: string;
    /* Boutique */
    viewOnShop: string;
    priceFrom: string;
    outOfStock: string;
    /* Formats et offre duo */
    formatsTitle: string;
    duoTitle: string;
    duoDetail: (discount: string, minMl: number) => string;
    duoPer: (price: string) => string;
    /* Parcours par maison */
    housesButton: string;
    housesTitle: string;
    housesSearch: string;
    housesCount: (n: number) => string;
    housesBack: string;
    /* Histoire de la maison */
    storyLink: string;
    storyMore: string;
    /* Écran d'attente du totem */
    touchToStart: string;
    touchMe: string;
    slideDiscover: string;
    slideDuoHeadline: (discount: string) => string;
    slideDuoDetail: (minMl: number) => string;
    slideDiagnosis: string;
    /* Recherche par équivalence */
    equivalenceButton: string;
    equivalenceKicker: string;
    equivalenceTitle: string;
    equivalenceHint: string;
    equivalencePlaceholder: string;
    equivalenceResult: string;
    equivalenceAlternatives: string;
    equivalenceEmpty: string;
    equivalenceExamples: string;
    /* Référence issue de la grande base */
    referenceKicker: string;
    accordsTitle: string;
    closestMatch: string;
    noMatch: string;
    indexLoading: string;
    indexReady: (count: string) => string;
    indexUnavailable: string;
    /* Fiche parfum détaillée */
    detailsButton: string;
    notesTitle: string;
    occasionsTitle: string;
    stylesTitle: string;
    /* Guide d'essai olfactif */
    testGuideButton: string;
    testGuideTitle: string;
    testGuideSteps: [string, string, string];
    testGuideStart: string;
    testGuideRunning: (s: string) => string;
    testGuideDone: string;
    /* Avis rapide */
    feedbackQuestion: string;
    feedbackThanks: string;
    /* Profil olfactif */
    profileKicker: string;
    /* Instant de composition, entre la dernière question et le résultat */
    composing: string;
  };
  /** Profil olfactif nommé (ex. « Gourmand Sensuel »). */
  profile: {
    /** Nom du profil par famille olfactive. */
    nouns: Record<string, string>;
    /** Qualificatif du profil par style. */
    adjectives: Record<string, string>;
    fallbackNoun: string;
    fallbackAdjective: string;
    sentence: (family: string, intensity: string, style: string) => string;
  };
  /** Phrases de Thibault. */
  agent: {
    greeting: string;
    intro: string;
    resultIntro: string;
    /** Une phrase d'accompagnement par étape du questionnaire. */
    tips: Record<string, string>;
  };
  /** Titres des questions (clés : genderTarget, mainFamily, usage,
   *  intensity, style, avoid, sub-gourmand, sub-frais, sub-bois, sub-floral). */
  questions: Record<string, string>;
  /** Libellés des options de réponse, indexés par clé d'option. */
  options: Record<string, string>;
  /** Traduction des styles affichés en pastilles (élégant, premium…). */
  styleChips: Record<string, string>;
  /** Modèles des raisons affichées sous chaque parfum. */
  reasons: {
    family: (x: string) => string;
    sub: (x: string) => string;
    usage: (x: string) => string;
    intensity: (x: string) => string;
    style: (x: string) => string;
    rassurant: string;
    original: string;
  };
  /** Phrase vendeur / mot de Thibault. */
  seller: {
    phrase: (family: string, w2: string, w3: string) => string;
    short: (family: string) => string;
    /** Mots de caractérisation (clés : tendance, sensuel, original,
     *  confidentiel, premium, affirme, elegant, signature). */
    styleWords: Record<string, string>;
  };
}
