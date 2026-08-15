/*
 * Recherche rapide : par numéro (ou nom) de parfum,
 * avec filtre homme / femme / unisexe.
 */

import { useMemo, useState } from "react";
import { perfumes, type Gender } from "../data/perfumes";
import BackButton from "./BackButton";

interface SearchProps {
  onBack: () => void;
}

const INTENSITY_LABELS = ["Léger", "Moyen", "Fort", "Très puissant"];

const GENDER_FILTERS: Array<{ value: Gender | "tous"; label: string }> = [
  { value: "tous", label: "Tous" },
  { value: "femme", label: "Femme" },
  { value: "homme", label: "Homme" },
  { value: "unisexe", label: "Unisexe" },
];

export default function Search({ onBack }: SearchProps) {
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState<Gender | "tous">("tous");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return perfumes.filter((p) => {
      if (gender !== "tous" && p.gender !== gender) return false;
      if (!q) return true;
      return p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
    });
  }, [query, gender]);

  return (
    <div className="animate-fade-up mx-auto w-full max-w-xl px-5 pb-14 pt-6">
      <BackButton onClick={onBack} />

      <h2 className="mt-6 font-serif text-3xl text-ink">Recherche par numéro</h2>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        inputMode="search"
        placeholder="Numéro ou nom… (ex. 1038)"
        aria-label="Recherche par numéro ou nom"
        className="mt-4 w-full rounded-2xl border border-line bg-paper px-5 py-4 text-lg text-ink shadow-[var(--shadow-card)] outline-none transition focus:border-gold"
      />

      {/* Filtre par genre */}
      <div className="mt-3 flex gap-2">
        {GENDER_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setGender(value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              gender === value
                ? "border-gold bg-gold text-white"
                : "border-line bg-paper text-ink hover:border-gold"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Résultats */}
      <p className="mt-5 text-xs text-ink-soft">
        {results.length} parfum{results.length > 1 ? "s" : ""}
      </p>
      <div className="mt-2 space-y-2">
        {results.map((p) => (
          <div key={p.id} className="rounded-2xl border border-line bg-paper px-4 py-3.5 shadow-[var(--shadow-card)]">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-serif text-xl text-ink">
                <span className="text-gold-dark">{p.id}</span> — {p.name}
              </p>
              <span className="shrink-0 text-xs text-ink-soft capitalize">{p.gender}</span>
            </div>
            <p className="mt-0.5 text-sm text-ink-soft">
              {p.family} · {INTENSITY_LABELS[p.intensity - 1]}
            </p>
            <p className="mt-1 text-sm text-ink">{p.description}</p>
            <p className="mt-1 text-[0.6875rem] text-ink-soft/70">Correspondance : {p.match}</p>
          </div>
        ))}
        {results.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-soft">
            Aucun parfum trouvé.
          </p>
        )}
      </div>
    </div>
  );
}
