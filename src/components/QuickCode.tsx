/*
 * Mode « Code rapide » : le vendeur entre un code à 5 chiffres
 * (ex. 14134) et obtient la sélection sans passer par le questionnaire.
 */

import { useState } from "react";
import { parseQuickCode, CODE_LEGEND } from "../utils/quickCode";
import type { Answers } from "../utils/recommendation";

interface QuickCodeProps {
  onSubmit: (answers: Answers, code: string) => void;
  onBack: () => void;
}

export default function QuickCode({ onSubmit, onBack }: QuickCodeProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const answers = parseQuickCode(code);
    if (!answers) {
      setError("Code invalide — 5 chiffres attendus (ex. 14134), voir la légende ci-dessous.");
      return;
    }
    onSubmit(answers, code.trim());
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

      <p className="mt-6 text-[0.6875rem] font-semibold tracking-[0.3em] text-gold-dark uppercase">Mode vendeur</p>
      <h2 className="mt-2 font-serif text-3xl text-ink">Code rapide</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Entrez un code à 5 chiffres pour afficher directement la sélection.
      </p>

      <div className="mt-6 flex gap-2">
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, "").slice(0, 5));
            setError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          inputMode="numeric"
          placeholder="14134"
          aria-label="Code à 5 chiffres"
          className="w-full flex-1 rounded-2xl border border-line bg-paper px-5 py-4 text-center font-serif text-3xl tracking-[0.4em] text-ink outline-none transition focus:border-gold"
        />
        <button
          onClick={submit}
          disabled={code.length !== 5}
          className="rounded-2xl bg-ink px-6 text-base font-medium text-cream transition hover:bg-gold-dark disabled:opacity-40"
        >
          Voir
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      {/* Légende du code */}
      <div className="mt-8 space-y-3 rounded-3xl border border-line bg-paper p-5">
        {CODE_LEGEND.map(({ position, values }) => (
          <div key={position}>
            <p className="text-xs font-semibold text-gold-dark uppercase tracking-wider">{position}</p>
            <p className="mt-0.5 text-sm text-ink-soft">{values}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
