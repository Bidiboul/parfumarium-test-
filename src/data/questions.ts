/*
 * Définition du questionnaire et des correspondances entre les réponses
 * du client et les données parfums (tags, occasions, styles…).
 *
 * Toutes les questions sont configurées ici : modifier une option ou
 * ses tags de correspondance ne demande aucune modification de code.
 */

/** Branches de sous-questions déclenchées par certaines familles. */
export type Branch = "gourmand" | "frais" | "bois" | "floral";

export interface FamilyOption {
  label: string;
  /** Tags / mots recherchés dans les tags + famille du parfum (bonus +35). */
  matchTags: string[];
  /** Sous-question à poser si cette famille est choisie. */
  branch?: Branch;
}

/* ------------------------------------------------------------------ */
/* Question 1 — Pour qui est le parfum ?                               */
/* ------------------------------------------------------------------ */
export const GENDER_OPTIONS: Record<string, { label: string }> = {
  femme: { label: "Pour moi — femme" },
  homme: { label: "Pour moi — homme" },
  mixte: { label: "Mixte / unisexe" },
  "cadeau-femme": { label: "Un cadeau pour une femme" },
  "cadeau-homme": { label: "Un cadeau pour un homme" },
  "cadeau-mixte": { label: "Un cadeau mixte" },
};

/* ------------------------------------------------------------------ */
/* Question 2 — Quel univers attire le plus le client ?                */
/* ------------------------------------------------------------------ */
export const FAMILY_OPTIONS: Record<string, FamilyOption> = {
  "frais-propre": { label: "Frais / propre", matchTags: ["frais", "propre"], branch: "frais" },
  "agrumes-ete": { label: "Agrumes / été", matchTags: ["agrumes", "été", "solaire"], branch: "frais" },
  "aquatique-marin": { label: "Aquatique / marin", matchTags: ["aquatique", "marin"], branch: "frais" },
  fruite: { label: "Fruité", matchTags: ["fruité"] },
  "floral-elegant": { label: "Floral élégant", matchTags: ["floral", "fleurs"], branch: "floral" },
  "fleurs-blanches": { label: "Fleurs blanches", matchTags: ["fleurs blanches", "tubéreuse", "jasmin", "fleur d'oranger"], branch: "floral" },
  "rose-poudre": { label: "Rose / poudré", matchTags: ["rose", "poudré"], branch: "floral" },
  "vanille-gourmand": { label: "Vanillé / gourmand", matchTags: ["vanille", "gourmand"], branch: "gourmand" },
  "caramel-sucre": { label: "Caramel / sucré", matchTags: ["caramel", "sucré"] },
  "cafe-chocolat": { label: "Café / chocolat", matchTags: ["café", "cacao", "chocolat"] },
  "pistache-cremeux": { label: "Pistache / crémeux", matchTags: ["pistache", "crémeux", "lacté"] },
  boise: { label: "Boisé", matchTags: ["boisé"], branch: "bois" },
  "santal-cuir": { label: "Santal / cuir", matchTags: ["santal", "cuir"], branch: "bois" },
  "oud-oriental": { label: "Oud / oriental intense", matchTags: ["oud", "oriental"], branch: "bois" },
  "ambre-musque": { label: "Ambré / musqué", matchTags: ["ambre", "ambré", "musc", "musqué", "oriental"] },
  "original-niche": { label: "Original / niche", matchTags: ["niche", "original"] },
  /* Famille supplémentaire utilisée uniquement par le mode « Code rapide » (7). */
  "musque-peau": { label: "Musqué / peau propre", matchTags: ["musc", "propre", "peau", "minimaliste"] },
};

/* ------------------------------------------------------------------ */
/* Sous-questions (branchement selon la famille choisie)               */
/* ------------------------------------------------------------------ */
export interface SubOption {
  label: string;
  /** Tags recherchés dans les tags + notes du parfum (bonus +25). */
  matchTags: string[];
}

export const SUB_QUESTIONS: Record<Branch, { title: string; options: Record<string, SubOption> }> = {
  gourmand: {
    title: "Quel gourmand vous attire le plus ?",
    options: {
      "vanille-douce": { label: "Vanille douce", matchTags: ["vanille", "poire", "guimauve"] },
      "vanille-sexy": { label: "Vanille sexy", matchTags: ["sexy", "séduction", "sensuel", "hypnotique", "cassonade"] },
      caramel: { label: "Caramel", matchTags: ["caramel"] },
      pistache: { label: "Pistache", matchTags: ["pistache", "noisette"] },
      cafe: { label: "Café", matchTags: ["café"] },
      cerise: { label: "Cerise", matchTags: ["cerise"] },
      lacte: { label: "Lacté / crémeux", matchTags: ["lacté", "crémeux", "miel", "crème glacée"] },
    },
  },
  frais: {
    title: "Quel type de fraîcheur préférez-vous ?",
    options: {
      "propre-musque": { label: "Propre et musqué", matchTags: ["propre", "musc"] },
      citronne: { label: "Citronné / agrumes", matchTags: ["agrumes", "citron", "bergamote", "néroli"] },
      marin: { label: "Marin / aquatique", matchTags: ["marin", "aquatique", "notes marines", "sel"] },
      vert: { label: "Vert / aromatique", matchTags: ["vert", "aromatique", "basilic", "romarin", "menthe"] },
      the: { label: "Thé / sophistiqué", matchTags: ["thé"] },
    },
  },
  bois: {
    title: "Quel type de bois préférez-vous ?",
    options: {
      "santal-doux": { label: "Santal doux", matchTags: ["santal"] },
      cuir: { label: "Cuir", matchTags: ["cuir"] },
      "oud-puissant": { label: "Oud puissant", matchTags: ["oud"] },
      "boise-frais": { label: "Boisé frais", matchTags: ["frais", "vétiver", "cèdre"] },
      "boise-ambre": { label: "Boisé ambré", matchTags: ["ambre", "ambré", "bois ambrés"] },
      "tabac-the": { label: "Tabac / thé noir", matchTags: ["tabac", "thé noir"] },
    },
  },
  floral: {
    title: "Quel floral vous ressemble ?",
    options: {
      "rose-elegante": { label: "Rose élégante", matchTags: ["rose"] },
      "fleurs-blanches": { label: "Fleurs blanches", matchTags: ["fleurs blanches", "tubéreuse", "jasmin", "fleur d'oranger"] },
      "floral-fruite": { label: "Floral fruité", matchTags: ["fruité"] },
      "floral-sexy": { label: "Floral sexy", matchTags: ["sexy", "séducteur", "sensuel"] },
      "floral-propre": { label: "Floral propre / musqué", matchTags: ["propre", "musc", "poudré"] },
    },
  },
};

/* ------------------------------------------------------------------ */
/* Question 3 — Pour quelle utilisation ?                              */
/* ------------------------------------------------------------------ */
export const USAGE_OPTIONS: Record<string, { label: string; occasions: string[]; discret?: boolean }> = {
  "tous-les-jours": { label: "Tous les jours", occasions: ["tous les jours"] },
  travail: { label: "Travail / discret", occasions: ["travail"], discret: true },
  ete: { label: "Été / chaleur", occasions: ["été"] },
  soiree: { label: "Soirée", occasions: ["soirée"] },
  seduction: { label: "Séduction / rendez-vous", occasions: ["séduction", "rendez-vous"] },
  signature: { label: "Parfum signature", occasions: ["signature", "parfum signature"] },
  cadeau: { label: "Cadeau", occasions: ["cadeau"] },
};

/* ------------------------------------------------------------------ */
/* Question 4 — Quelle puissance ?                                     */
/* ------------------------------------------------------------------ */
export const INTENSITY_OPTIONS: Record<string, { label: string; value: 1 | 2 | 3 | 4 }> = {
  leger: { label: "Léger", value: 1 },
  moyen: { label: "Moyen", value: 2 },
  fort: { label: "Fort", value: 3 },
  "tres-puissant": { label: "Très puissant", value: 4 },
};

/* ------------------------------------------------------------------ */
/* Question 5 — Quel style correspond le mieux ?                       */
/* ------------------------------------------------------------------ */
export const STYLE_OPTIONS: Record<
  string,
  { label: string; styles: string[]; wantsOriginal?: boolean; wantsRassurant?: boolean }
> = {
  "elegant-premium": { label: "Élégant / premium", styles: ["élégant", "premium"] },
  "jeune-tendance": { label: "Jeune / tendance", styles: ["jeune", "tendance"] },
  "original-niche": { label: "Original / niche", styles: ["original", "niche"], wantsOriginal: true },
  "sexy-sensuel": { label: "Sexy / sensuel", styles: ["sexy", "séducteur", "romantique"] },
  "facile-rassurant": { label: "Facile à porter / rassurant", styles: ["facile", "rassurant"], wantsRassurant: true },
  "propre-minimaliste": { label: "Propre / minimaliste", styles: ["propre", "minimaliste"] },
  charismatique: { label: "Charismatique / imposant", styles: ["charismatique", "imposant"] },
};

/* ------------------------------------------------------------------ */
/* Question 6 — Le client veut éviter quelque chose ? (choix multiple) */
/* ------------------------------------------------------------------ */
export const AVOID_OPTIONS: Record<string, { label: string; tag: string | null }> = {
  "trop-sucre": { label: "Trop sucré", tag: "trop sucré" },
  "trop-fort": { label: "Trop fort", tag: "trop fort" },
  "trop-frais": { label: "Trop frais", tag: "trop frais" },
  "trop-floral": { label: "Trop floral", tag: "floral" },
  "trop-vanille": { label: "Trop vanillé", tag: "vanille" },
  oud: { label: "Oud", tag: "oud" },
  cuir: { label: "Cuir", tag: "cuir" },
  rose: { label: "Rose", tag: "rose" },
  patchouli: { label: "Patchouli", tag: "patchouli" },
  musc: { label: "Musc", tag: "musc" },
  agrumes: { label: "Agrumes", tag: "agrumes" },
  rien: { label: "Rien à éviter", tag: null },
};
