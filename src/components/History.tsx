/*
 * Historique local : les 10 derniers diagnostics (localStorage).
 * Chaque entrée peut être rouverte pour revoir la sélection.
 */

import { useState } from "react";
import { loadHistory, clearHistory, type HistoryEntry } from "../utils/history";
import { FAMILY_OPTIONS, GENDER_OPTIONS } from "../data/questions";

interface HistoryProps {
  onOpen: (entry: HistoryEntry) => void;
  onBack: () => void;
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function History({ onOpen, onBack }: HistoryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory);

  const reset = () => {
    clearHistory();
    setEntries([]);
  };

  return (
    <div className="animate-fade-up mx-auto w-full max-w-xl px-5 pb-14 pt-6">
      <button
        onClick={onBack}
        aria-label="Retour"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-lg transition hover:border-gold"
      >
        ←
      </button>

      <h2 className="mt-6 font-serif text-3xl text-ink">Derniers diagnostics</h2>
      <p className="mt-1 text-sm text-ink-soft">Conservés sur cet appareil uniquement.</p>

      <div className="mt-5 space-y-2">
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onOpen(entry)}
            className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-left transition hover:border-gold"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium text-ink">
                {GENDER_OPTIONS[entry.answers.genderTarget]?.label ?? entry.answers.genderTarget}
                {" · "}
                {FAMILY_OPTIONS[entry.answers.mainFamily]?.label ?? entry.answers.mainFamily}
                {entry.code && <span className="text-gold-dark"> · code {entry.code}</span>}
              </p>
              <span className="shrink-0 text-xs text-ink-soft">{formatDate(entry.date)}</span>
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {entry.top3.map((p) => `${p.id} ${p.name}`).join(" · ")}
            </p>
          </button>
        ))}
        {entries.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-soft">
            Aucun diagnostic enregistré pour le moment.
          </p>
        )}
      </div>

      {entries.length > 0 && (
        <button
          onClick={reset}
          className="mt-6 w-full rounded-full border border-line px-6 py-3 text-sm font-medium text-ink-soft transition hover:border-red-300 hover:text-red-700"
        >
          Effacer l'historique (Reset)
        </button>
      )}
    </div>
  );
}
