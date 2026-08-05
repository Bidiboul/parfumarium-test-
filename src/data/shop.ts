/*
 * Configuration boutique Parfumarium.
 *
 * Centralise tout ce qui relie l'application à la boutique :
 * adresse du site, formats de flacons, tarifs, offre duo et
 * construction des liens vers les fiches produit.
 *
 * Les tarifs sont communs à toutes les fragrances du catalogue.
 */

import type { Perfume } from "./perfumes";
import type { Lang } from "../i18n/types";

export const SHOP = {
  /** Adresse de la boutique en ligne (sans slash final). */
  baseUrl: "https://parfumarium.fr",
  /** Devise (code ISO, pour le formatage des montants). */
  currency: "EUR",
};

/** Un format de flacon proposé en boutique. */
export interface Format {
  /** Contenance en millilitres. */
  ml: number;
  /** Prix unitaire en euros. */
  price: number;
}

/** Formats et tarifs, communs à toutes les fragrances. */
export const FORMATS: Format[] = [
  { ml: 30, price: 39.9 },
  { ml: 50, price: 69.9 },
  { ml: 100, price: 89.9 },
];

/**
 * Offre duo : réduction accordée pour deux flacons d'un même format
 * (les deux parfums peuvent être différents).
 */
export const DUO_DISCOUNT = 10;

/** Format le moins cher — sert de prix d'appel « à partir de ». */
export const entryFormat = (): Format =>
  FORMATS.reduce((cheapest, f) => (f.price < cheapest.price ? f : cheapest), FORMATS[0]);

/** Prix d'un duo pour un format donné, réduction déduite. */
export const duoPrice = (format: Format): number => format.price * 2 - DUO_DISCOUNT;

/**
 * Montant formaté selon la langue affichée : « 39,90 € », mais « 10 € »
 * pour un montant rond — les centimes inutiles alourdissent la lecture.
 */
export const money = (amount: number, lang: Lang = "fr"): string => {
  const decimals = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat(lang, {
    style: "currency",
    currency: SHOP.currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

/**
 * Lien vers la fiche produit sur la boutique en ligne.
 * Par défaut : recherche par numéro + nom (compatible WooCommerce `?s=`).
 * À remplacer par l'URL réelle de la fiche si la structure est connue.
 */
export const productUrl = (perfume: Perfume): string =>
  `${SHOP.baseUrl}/?s=${encodeURIComponent(`${perfume.id} ${perfume.name}`)}&post_type=product`;
