/*
 * Statistiques vendeur (en français) : synthèse locale et anonyme des
 * diagnostics réalisés sur la borne. Utile pour le réassort et pour
 * comprendre la clientèle. Aucune donnée personnelle n'est stockée.
 */

import { useState } from "react";
import { loadStats, clearStats, topEntries } from "../utils/stats";
import { perfumes } from "../data/perfumes";
import { FAMILY_OPTIONS, GENDER_OPTIONS } from "../data/questions";
import { LANGUAGES } from "../i18n";

interface StatsProps {
  onBack: () => void;
}

const perfumeName = (id: string): string => {
  const p = perfumes.find((x) => x.id === id);
  return p ? `${p.id} — ${p.name}` : id;
};

/** Barre de proportion dorée pour un item du classement. */
function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink">{label}</span>
        <span className="shrink-0 font-medium text-ink-soft">{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gold-light">
        <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Stats({ onBack }: StatsProps) {
  const [stats, setStats] = useState(loadStats);

  const reset = () => {
    clearStats();
    setStats(loadStats());
  };

  const families = topEntries(stats.families, 6);
  const genders = topEntries(stats.genders, 6);
  const topPerfumes = topEntries(stats.perfumes, 8);
  const langs = topEntries(stats.langs, 5);
  const maxFamily = families[0]?.[1] ?? 0;
  const maxGender = genders[0]?.[1] ?? 0;
  const maxPerfume = topPerfumes[0]?.[1] ?? 0;

  return (
    <div className="animate-fade-up mx-auto w-full max-w-xl px-5 pb-14 pt-6">
      <button
        onClick={onBack}
        aria-label="Retour"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-lg transition hover:border-gold"
      >
        ←
      </button>

      <h2 className="mt-6 font-serif text-3xl text-ink">Statistiques</h2>
      <p className="mt-1 text-sm text-ink-soft">Synthèse locale et anonyme, sur cet appareil.</p>

      {stats.total === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-ink-soft">
          Aucun diagnostic enregistré pour le moment.
        </p>
      ) : (
        <>
          {/* Total */}
          <div className="mt-6 rounded-3xl border border-line bg-paper p-5 text-center">
            <p className="font-serif text-5xl text-gold-dark">{stats.total}</p>
            <p className="mt-1 text-sm text-ink-soft">
              diagnostic{stats.total > 1 ? "s" : ""} réalisé{stats.total > 1 ? "s" : ""}
            </p>
          </div>

          {/* Familles les plus demandées */}
          <section className="mt-6 rounded-3xl border border-line bg-paper p-5">
            <h3 className="font-serif text-xl text-ink">Univers les plus demandés</h3>
            <div className="mt-4 space-y-3">
              {families.map(([key, value]) => (
                <Bar key={key} label={FAMILY_OPTIONS[key]?.label ?? key} value={value} max={maxFamily} />
              ))}
            </div>
          </section>

          {/* Parfums les plus recommandés */}
          <section className="mt-6 rounded-3xl border border-line bg-paper p-5">
            <h3 className="font-serif text-xl text-ink">Parfums les plus recommandés</h3>
            <p className="mt-0.5 text-xs text-ink-soft">Apparitions dans une sélection principale.</p>
            <div className="mt-4 space-y-3">
              {topPerfumes.map(([id, value]) => (
                <Bar key={id} label={perfumeName(id)} value={value} max={maxPerfume} />
              ))}
            </div>
          </section>

          {/* Cibles + langues */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <section className="rounded-3xl border border-line bg-paper p-5">
              <h3 className="font-serif text-xl text-ink">Cibles</h3>
              <div className="mt-4 space-y-3">
                {genders.map(([key, value]) => (
                  <Bar key={key} label={GENDER_OPTIONS[key]?.label ?? key} value={value} max={maxGender} />
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-line bg-paper p-5">
              <h3 className="font-serif text-xl text-ink">Langues</h3>
              <div className="mt-4 space-y-2">
                {langs.map(([code, value]) => {
                  const lang = LANGUAGES.find((l) => l.code === code);
                  return (
                    <div key={code} className="flex items-center justify-between text-sm">
                      <span className="text-ink">
                        <span aria-hidden>{lang?.flag ?? "🏳️"}</span> {lang?.name ?? code}
                      </span>
                      <span className="font-medium text-ink-soft">{value}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <button
            onClick={reset}
            className="mt-8 w-full rounded-full border border-line px-6 py-3 text-sm font-medium text-ink-soft transition hover:border-red-300 hover:text-red-700"
          >
            Réinitialiser les statistiques
          </button>
        </>
      )}
    </div>
  );
}
