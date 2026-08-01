/*
 * Recherche par équivalence (parcours client, traduit).
 *
 * Le client indique le parfum de marque qu'il porte déjà et obtient
 * immédiatement la référence Parfumarium correspondante, avec des
 * alternatives dans le même esprit.
 */

import { useMemo, useState } from "react";
import AgentBubble from "./AgentBubble";
import PerfumeModal from "./PerfumeModal";
import { useI18n, getDescription } from "../i18n";
import { formatPrice } from "../data/shop";
import { searchEquivalences, findAlternatives, type Equivalence as Match } from "../utils/equivalence";
import type { Perfume } from "../data/perfumes";

interface EquivalenceProps {
  onBack: () => void;
}

/** Quelques parfums connus proposés comme point de départ. */
const EXAMPLES = ["Sauvage", "Black Opium", "Baccarat", "Santal 33", "Coco Mademoiselle"];

export default function Equivalence({ onBack }: EquivalenceProps) {
  const { lang, t } = useI18n();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Match | null>(null);
  const [details, setDetails] = useState<Perfume | null>(null);

  const results = useMemo(() => searchEquivalences(query), [query]);
  const alternatives = useMemo(
    () => (selected ? findAlternatives(selected.perfume) : []),
    [selected]
  );

  /** Nouvelle recherche : réinitialise la sélection affichée. */
  const updateQuery = (value: string) => {
    setQuery(value);
    setSelected(null);
  };

  return (
    <div className="animate-fade-up mx-auto w-full max-w-xl px-5 pb-14 pt-6">
      <button
        onClick={onBack}
        aria-label={t.ui.backHome}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-lg transition hover:border-gold"
      >
        ←
      </button>

      <p className="mt-6 text-[11px] font-semibold tracking-[0.3em] text-gold uppercase">
        {t.ui.equivalenceKicker}
      </p>
      <h2 className="mt-2 font-serif text-3xl leading-tight text-ink">{t.ui.equivalenceTitle}</h2>
      <div className="mt-4">
        <AgentBubble message={t.ui.equivalenceHint} compact />
      </div>

      {/* Saisie */}
      <input
        value={query}
        onChange={(e) => updateQuery(e.target.value)}
        placeholder={t.ui.equivalencePlaceholder}
        aria-label={t.ui.equivalenceTitle}
        autoFocus
        className="mt-5 w-full rounded-2xl border border-line bg-paper px-5 py-4 text-lg text-ink outline-none transition focus:border-gold"
      />

      {/* Suggestions de départ */}
      {query.trim().length < 2 && (
        <div className="mt-4">
          <p className="text-xs text-ink-soft">{t.ui.equivalenceExamples}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => updateQuery(example)}
                className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink transition hover:border-gold hover:text-gold-dark"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Liste des correspondances */}
      {!selected && query.trim().length >= 2 && (
        <div className="mt-5 space-y-2">
          {results.map((match, i) => (
            <button
              key={match.perfume.id}
              onClick={() => setSelected(match)}
              style={{ "--i": i } as React.CSSProperties}
              className="lift stagger animate-fade-up flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3.5 text-left shadow-[var(--shadow-card)] hover:border-gold"
            >
              <span className="min-w-0">
                <span className="block font-medium text-ink">{match.brandName}</span>
                {match.house && (
                  <span className="block text-xs text-ink-soft">{match.house}</span>
                )}
              </span>
              <span className="shrink-0 font-serif text-xl text-gold-dark">
                n° {match.perfume.id}
              </span>
            </button>
          ))}
          {results.length === 0 && (
            <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-soft">
              {t.ui.equivalenceEmpty}
            </p>
          )}
        </div>
      )}

      {/* Équivalence retenue */}
      {selected && (
        <>
          <section className="animate-fade-up mt-6 rounded-3xl border border-gold/50 bg-gradient-to-b from-paper to-cream p-6 shadow-[var(--shadow-card)]">
            <p className="text-[11px] font-semibold tracking-[0.3em] text-gold uppercase">
              {t.ui.equivalenceResult}
            </p>

            <p className="mt-3 text-sm text-ink-soft">
              {selected.brandName}
              {selected.house && ` — ${selected.house}`}
            </p>
            <p aria-hidden className="my-1 text-center text-2xl text-gold">
              ↓
            </p>

            <div className="flex items-start justify-between gap-3">
              <h3 className="font-serif text-3xl leading-tight text-ink">
                <span className="text-gold-dark">{selected.perfume.id}</span> — {selected.perfume.name}
              </h3>
              <span className="shrink-0 rounded-full bg-cream px-3 py-1 font-serif text-lg text-ink">
                {formatPrice(selected.perfume)}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {selected.perfume.family} · {t.ui.intensityLabels[selected.perfume.intensity - 1]}
            </p>

            {selected.perfume.inStock === false && (
              <p className="mt-2 inline-block rounded-full bg-gold-light px-3 py-1 text-xs font-medium text-gold-dark">
                {t.ui.outOfStock}
              </p>
            )}

            <p className="mt-3 text-sm leading-relaxed text-ink">
              {getDescription(selected.perfume, lang)}
            </p>

            <button
              onClick={() => setDetails(selected.perfume)}
              className="lift mt-5 w-full rounded-full border border-ink/80 px-6 py-3 text-sm font-medium text-ink hover:border-gold hover:text-gold-dark"
            >
              {t.ui.detailsButton}
            </button>
          </section>

          {/* Alternatives proches */}
          {alternatives.length > 0 && (
            <section className="mt-8">
              <h3 className="font-serif text-2xl text-ink">{t.ui.equivalenceAlternatives}</h3>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {alternatives.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setDetails(p)}
                    style={{ "--i": i } as React.CSSProperties}
                    className="lift stagger animate-fade-up rounded-2xl border border-line bg-paper px-4 py-3.5 text-left shadow-[var(--shadow-card)] hover:border-gold"
                  >
                    <p className="font-medium text-ink">
                      <span className="text-gold-dark">{p.id}</span> — {p.name}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {p.family} · {t.ui.intensityLabels[p.intensity - 1]}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {details && <PerfumeModal perfume={details} onClose={() => setDetails(null)} />}
    </div>
  );
}
