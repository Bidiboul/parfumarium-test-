/*
 * Configuration boutique Parfumarium.
 *
 * Centralise tout ce qui relie l'application à la boutique en ligne :
 * adresse du site, devise, prix par défaut et construction des liens
 * vers les fiches produit. À adapter selon la structure réelle de
 * parfumarium.fr.
 */

import type { Perfume } from "./perfumes";

export const SHOP = {
  /** Adresse de la boutique en ligne (sans slash final). */
  baseUrl: "https://parfumarium.fr",
  /** Devise affichée. */
  currency: "€",
  /**
   * Prix par défaut d'un flacon, en euros.
   * ⚠️ Valeur d'exemple à ajuster : la plupart des fragrances Parfumarium
   * sont vendues au même tarif ; un prix spécifique peut être défini
   * parfum par parfum via le champ `price` dans src/data/perfumes.ts.
   */
  defaultPrice: 39,
};

/** Prix d'un parfum (spécifique s'il existe, sinon prix par défaut). */
export const priceOf = (perfume: Perfume): number => perfume.price ?? SHOP.defaultPrice;

/** Prix formaté, ex. « 39 € ». */
export const formatPrice = (perfume: Perfume): string => `${priceOf(perfume)} ${SHOP.currency}`;

/**
 * Lien vers la fiche produit sur la boutique en ligne.
 * Par défaut : recherche par numéro + nom (compatible WooCommerce `?s=`).
 * À remplacer par l'URL réelle de la fiche si la structure est connue.
 */
export const productUrl = (perfume: Perfume): string =>
  `${SHOP.baseUrl}/?s=${encodeURIComponent(`${perfume.id} ${perfume.name}`)}&post_type=product`;
