/*
 * Statistiques locales anonymes (localStorage).
 *
 * À chaque diagnostic, on incrémente des compteurs agrégés : familles
 * demandées, parfums recommandés, langues, cibles. Aucune donnée
 * personnelle, aucun envoi : de quoi aider le vendeur au réassort et à
 * comprendre la clientèle. Persiste au-delà des 10 derniers diagnostics.
 */

import type { Answers } from "./recommendation";
import type { Lang } from "../i18n/types";

const STORAGE_KEY = "parfumarium-stats";

/** Avis rapide du client sur la sélection proposée. */
export type Feedback = "good" | "ok" | "bad";

export interface Stats {
  /** Nombre total de diagnostics réalisés. */
  total: number;
  /** Compte par famille olfactive (clé d'option). */
  families: Record<string, number>;
  /** Compte par cible (femme, homme, cadeau…). */
  genders: Record<string, number>;
  /** Compte par langue. */
  langs: Record<string, number>;
  /** Nombre de fois où un parfum est apparu dans un top 3 (clé = id). */
  perfumes: Record<string, number>;
  /** Questionnaires abandonnés, par étape où le client s'est arrêté. */
  abandons: Record<string, number>;
  /** Avis rapides sur les sélections. */
  feedback: Record<string, number>;
}

const empty = (): Stats => ({
  total: 0,
  families: {},
  genders: {},
  langs: {},
  perfumes: {},
  abandons: {},
  feedback: {},
});

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...empty(), ...(JSON.parse(raw) as Stats) } : empty();
  } catch {
    return empty();
  }
}

const bump = (map: Record<string, number>, key: string) => {
  map[key] = (map[key] ?? 0) + 1;
};

/** Enregistre un diagnostic dans les compteurs agrégés. */
export function recordStat(answers: Answers, top3Ids: string[], lang: Lang): void {
  try {
    const stats = loadStats();
    stats.total += 1;
    bump(stats.families, answers.mainFamily);
    bump(stats.genders, answers.genderTarget);
    bump(stats.langs, lang);
    top3Ids.forEach((id) => bump(stats.perfumes, id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // localStorage indisponible : on ignore.
  }
}

/**
 * Enregistre l'abandon d'un questionnaire, avec la question atteinte.
 * Permet de repérer l'étape qui fait décrocher les clients.
 */
export function recordAbandon(stepKey: string): void {
  try {
    const stats = loadStats();
    bump(stats.abandons, stepKey);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignoré.
  }
}

/** Enregistre l'avis rapide du client sur sa sélection. */
export function recordFeedback(value: Feedback): void {
  try {
    const stats = loadStats();
    bump(stats.feedback, value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignoré.
  }
}

export function clearStats(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignoré.
  }
}

/** Transforme une map en top N trié (décroissant). */
export function topEntries(map: Record<string, number>, n: number): Array<[string, number]> {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}
