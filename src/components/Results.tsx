/*
 * Écran de résultat : sélection principale (top 3), parfums annexes,
 * phrase vendeur, copie de la sélection et nouveau diagnostic.
 *
 * L'app est pensée pour le vendeur : les numéros et noms Parfumarium
 * sont mis en avant, la correspondance olfactive reste en petit.
 */

import { useEffect, useMemo, useState } from "react";
import { perfumes } from "../data/perfumes";
import { recommendPerfumes, type Answers, type PerfumeWithScore } from "../utils/recommendation";
import { saveToHistory } from "../utils/history";

interface ResultsProps {
  answers: Answers;
  /** Code rapide utilisé pour obtenir ce résultat, le cas échéant. */
  code?: string;
  /** Si vrai, le résultat n'est pas ré-enregistré dans l'historique. */
  fromHistory?: boolean;
  onRestart: () => void;
  onHome: () => void;
}

const INTENSITY_LABELS = ["Léger", "Moyen", "Fort", "Très puissant"];

/** Pastilles d'intensité (● pleins / ○ vides). */
function IntensityDots({ level }: { level: number }) {
  return (
    <span className="tracking-widest text-gold" aria-label={`Intensité ${INTENSITY_LABELS[level - 1]}`}>
      {"●".repeat(level)}
      <span className="text-gold-light">{"●".repeat(4 - level)}</span>
    </span>
  );
}

/** Carte d'un parfum de la sélection principale. */
function MainCard({ perfume, rank }: { perfume: PerfumeWithScore; rank: number }) {
  return (
    <article className="animate-fade-up rounded-3xl border border-line bg-paper p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-serif text-xl text-gold-light">
          {rank}
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-2xl leading-tight text-ink">
            <span className="text-gold-dark">{perfume.id}</span> — {perfume.name}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            {perfume.family} · {INTENSITY_LABELS[perfume.intensity - 1]} <IntensityDots level={perfume.intensity} />
          </p>
        </div>
      </div>

      {/* Style */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {perfume.styles.slice(0, 4).map((s) => (
          <span key={s} className="rounded-full border border-gold-light bg-cream px-2.5 py-0.5 text-xs text-gold-dark capitalize">
            {s}
          </span>
        ))}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink">{perfume.description}</p>

      {/* Pourquoi il correspond */}
      {perfume.reasons.length > 0 && (
        <ul className="mt-3 space-y-1">
          {perfume.reasons.map((r) => (
            <li key={r} className="flex gap-2 text-sm text-ink-soft">
              <span className="text-gold">✦</span>
              {r}
            </li>
          ))}
        </ul>
      )}

      {/* Correspondance olfactive, volontairement discrète */}
      <p className="mt-3 border-t border-line pt-2 text-[11px] text-ink-soft/70">
        Correspondance olfactive : {perfume.match}
      </p>
    </article>
  );
}

export default function Results({ answers, code, fromHistory, onRestart, onHome }: ResultsProps) {
  const { top3, extras, sellerPhrase } = useMemo(
    () => recommendPerfumes(answers, perfumes),
    [answers]
  );
  const [copied, setCopied] = useState(false);

  // Enregistrer le diagnostic dans l'historique local (sauf relecture).
  useEffect(() => {
    if (fromHistory) return;
    saveToHistory({
      answers,
      code,
      top3: top3.map(({ id, name }) => ({ id, name })),
    });
  }, [answers, code, top3, fromHistory]);

  /** Copie la sélection au format texte (presse-papiers). */
  const copySelection = async () => {
    const lines = [
      "Diagnostic Olfactif Parfumarium",
      "",
      "Sélection principale :",
      ...top3.map((p, i) => `${i + 1}. ${p.id} — ${p.name} (${p.family})`),
      "",
      "À faire sentir en plus :",
      ...extras.map((p) => `- ${p.id} — ${p.name}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible : rien de bloquant.
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-5 pb-14 pt-6">
      <p className="text-[11px] font-semibold tracking-[0.3em] text-gold uppercase">Résultat du diagnostic</p>
      <h2 className="mt-2 font-serif text-3xl text-ink">Sélection principale</h2>

      {/* Top 3 */}
      <div className="mt-5 space-y-4">
        {top3.map((p, i) => (
          <MainCard key={p.id} perfume={p} rank={i + 1} />
        ))}
      </div>

      {/* Phrase vendeur */}
      <section className="animate-fade-up mt-8 rounded-3xl bg-ink p-5 text-cream">
        <p className="text-[11px] font-semibold tracking-[0.3em] text-gold-light uppercase">Phrase vendeur</p>
        <p className="mt-2 font-serif text-lg leading-relaxed italic">« {sellerPhrase} »</p>
      </section>

      {/* Parfums annexes */}
      {extras.length > 0 && (
        <section className="mt-8">
          <h3 className="font-serif text-2xl text-ink">À faire sentir en plus</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {extras.map((p) => (
              <div key={p.id} className="rounded-2xl border border-line bg-paper px-4 py-3">
                <p className="font-medium text-ink">
                  <span className="text-gold-dark">{p.id}</span> — {p.name}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {p.family} · {INTENSITY_LABELS[p.intensity - 1]}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={copySelection}
          className="flex-1 rounded-full border border-ink px-6 py-3.5 text-base font-medium text-ink transition hover:border-gold hover:text-gold-dark active:scale-[0.98]"
        >
          {copied ? "Sélection copiée ✓" : "Copier la sélection"}
        </button>
        <button
          onClick={onRestart}
          className="flex-1 rounded-full bg-ink px-6 py-3.5 text-base font-medium text-cream transition hover:bg-gold-dark active:scale-[0.98]"
        >
          Nouveau diagnostic
        </button>
      </div>
      <button onClick={onHome} className="mt-3 w-full py-2 text-sm text-ink-soft underline-offset-4 hover:underline">
        Retour à l'accueil
      </button>
    </div>
  );
}
