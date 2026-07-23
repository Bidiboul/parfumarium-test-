/*
 * Historique local des diagnostics (localStorage, 10 entrées maximum).
 * Aucun compte, aucune donnée envoyée : tout reste sur l'appareil.
 */

import type { Answers } from "./recommendation";
import type { Lang } from "../i18n/types";

const STORAGE_KEY = "parfumarium-history";
const MAX_ENTRIES = 10;

export interface HistoryEntry {
  /** Identifiant unique de l'entrée. */
  id: string;
  /** Date ISO du diagnostic. */
  date: string;
  /** Réponses du questionnaire (permet de recalculer la sélection). */
  answers: Answers;
  /** Top 3 mémorisé pour affichage rapide dans la liste. */
  top3: Array<{ id: string; name: string }>;
  /** Code rapide utilisé, le cas échéant. */
  code?: string;
  /** Langue utilisée pour ce diagnostic. */
  lang?: Lang;
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(entry: Omit<HistoryEntry, "id" | "date">): void {
  try {
    const entries = loadHistory();
    // Éviter les doublons immédiats (ex. re-rendu du même résultat).
    const last = entries[0];
    if (last && JSON.stringify(last.answers) === JSON.stringify(entry.answers)) return;

    entries.unshift({
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // localStorage indisponible (mode privé…) : on ignore silencieusement.
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignoré.
  }
}
