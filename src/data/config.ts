/*
 * Réglages de la borne Parfumarium.
 * Tout ce qui peut être ajusté par la boutique sans toucher au code métier.
 */

export const CONFIG = {
  /**
   * Code d'accès à l'espace vendeur (code rapide, recherche, historique,
   * statistiques). Empêche un client curieux d'ouvrir ces écrans sur la
   * borne en libre-service.
   * ⚠️ À personnaliser avant la mise en boutique.
   */
  sellerPin: "1234",

  /** Durée conseillée entre deux essais olfactifs, en secondes. */
  testGuideSeconds: 120,
};
