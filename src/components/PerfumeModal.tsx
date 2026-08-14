/*
 * Fiche parfum détaillée : notes olfactives, intensité, moments
 * conseillés, style, prix et lien boutique. S'ouvre au clic sur un
 * parfum, depuis le résultat du diagnostic ou la recherche d'équivalence.
 */

import { useEffect } from "react";
import { useI18n, getDescription } from "../i18n";
import { FORMATS, DUO_DISCOUNT, duoPrice, entryFormat, money, productUrl } from "../data/shop";
import type { Perfume } from "../data/perfumes";

interface PerfumeModalProps {
  perfume: Perfume;
  onClose: () => void;
}

export default function PerfumeModal({ perfume, onClose }: PerfumeModalProps) {
  const { lang, t } = useI18n();
  const intensityLabel = t.ui.intensityLabels[perfume.intensity - 1];

  // Fermeture à la touche Échap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="animate-backdrop fixed inset-0 z-50 flex items-end justify-center bg-ink/55 backdrop-blur-md sm:items-center sm:px-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="animate-fade-up max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-line bg-paper p-6 shadow-[var(--shadow-modal)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-3xl leading-tight text-ink">
              <span className="text-gold-dark">{perfume.id}</span>
              <br />
              {perfume.name}
            </h3>
            <p className="mt-1 text-sm text-ink-soft">{perfume.family}</p>
          </div>
          <span className="shrink-0 rounded-full border border-line bg-cream px-3 py-1.5 text-right">
            <span className="block text-[0.625rem] leading-none text-ink-soft">{t.ui.priceFrom}</span>
            <span className="block font-serif text-xl leading-tight text-ink">
              {money(entryFormat().price, lang)}
            </span>
          </span>
        </div>

        {perfume.inStock === false && (
          <p className="mt-3 inline-block rounded-full bg-gold-light px-3 py-1 text-xs font-medium text-gold-dark">
            {t.ui.outOfStock}
          </p>
        )}

        <p className="mt-4 text-sm leading-relaxed text-ink">{getDescription(perfume, lang)}</p>

        {/* Intensité */}
        <div className="mt-5">
          <p className="text-[0.6875rem] font-semibold tracking-[0.2em] text-gold-dark uppercase">
            {t.ui.intensityLabels[0]} → {t.ui.intensityLabels[3]}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gold-light">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${(perfume.intensity / 4) * 100}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-medium text-ink">{intensityLabel}</span>
          </div>
        </div>

        {/* Notes olfactives */}
        <section className="mt-5">
          <h4 className="text-[0.6875rem] font-semibold tracking-[0.2em] text-gold-dark uppercase">
            {t.ui.notesTitle}
          </h4>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {perfume.notes.map((note) => (
              <span
                key={note}
                className="rounded-full border border-line bg-cream px-3 py-1 text-sm text-ink capitalize"
              >
                {note}
              </span>
            ))}
          </div>
        </section>

        {/* Moments conseillés */}
        <section className="mt-5">
          <h4 className="text-[0.6875rem] font-semibold tracking-[0.2em] text-gold-dark uppercase">
            {t.ui.occasionsTitle}
          </h4>
          <p className="mt-1.5 text-sm text-ink capitalize">{perfume.occasions.join(" · ")}</p>
        </section>

        {/* Style */}
        <section className="mt-5">
          <h4 className="text-[0.6875rem] font-semibold tracking-[0.2em] text-gold-dark uppercase">
            {t.ui.stylesTitle}
          </h4>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {perfume.styles.map((s) => (
              <span
                key={s}
                className="rounded-full border border-gold-light bg-cream px-2.5 py-0.5 text-xs text-gold-dark capitalize"
              >
                {t.styleChips[s] ?? s}
              </span>
            ))}
          </div>
        </section>

        {/* Formats, tarifs et offre duo */}
        <section className="mt-6 rounded-2xl border border-line bg-cream/60 p-4">
          <h4 className="text-[0.6875rem] font-semibold tracking-[0.2em] text-gold-dark uppercase">
            {t.ui.formatsTitle}
          </h4>
          <ul className="mt-2.5 divide-y divide-line/70">
            {FORMATS.map((format) => (
              <li key={format.ml} className="flex items-baseline justify-between gap-3 py-2">
                <span className="text-sm font-medium text-ink">{format.ml} ml</span>
                <span className="text-right">
                  <span className="font-serif text-lg text-ink">{money(format.price, lang)}</span>
                  <span className="ml-2 text-[0.6875rem] text-ink-soft">
                    {t.ui.duoPer(money(duoPrice(format), lang))}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-ink-soft">
            <span className="font-medium text-gold-dark">{t.ui.duoTitle}</span>{" "}
            {t.ui.duoDetail(money(DUO_DISCOUNT, lang))}
          </p>
        </section>

        {/* Correspondance olfactive */}
        <p className="mt-5 border-t border-line pt-3 text-[0.6875rem] text-ink-soft/70">
          {t.ui.correspondence} {perfume.match}
        </p>

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2">
          <a
            href={productUrl(perfume)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-ink px-6 py-3 text-center text-sm font-medium text-ink transition hover:border-gold hover:text-gold-dark"
          >
            {t.ui.viewOnShop} →
          </a>
          <button
            onClick={onClose}
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-gold-dark active:scale-[0.98]"
          >
            {t.ui.close}
          </button>
        </div>
      </div>
    </div>
  );
}
