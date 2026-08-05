/*
 * L'histoire de Parfumarium.
 *
 * Écran de lecture, présenté au client depuis l'accueil. Le texte
 * lui-même vit dans src/data/story.ts, où la boutique peut le
 * personnaliser sans toucher au code.
 */

import Reveal from "./Reveal";
import { useI18n } from "../i18n";
import { STORY } from "../data/story";
import { FORMATS, DUO_DISCOUNT, money } from "../data/shop";

interface StoryProps {
  onBack: () => void;
}

export default function Story({ onBack }: StoryProps) {
  const { lang, t } = useI18n();
  const story = STORY[lang];

  return (
    <div className="animate-fade-up mx-auto w-full max-w-xl px-5 pb-16 pt-6">
      <button
        onClick={onBack}
        aria-label={t.ui.backHome}
        className="lift flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper text-lg hover:border-gold"
      >
        ←
      </button>

      <p className="mt-6 text-[11px] font-semibold tracking-[0.3em] text-gold uppercase">
        Parfumarium
      </p>
      <h2 className="mt-2 font-serif text-4xl leading-[1.05] text-balance text-ink">
        {story.title}
      </h2>
      <div className="rule-gold mt-5 h-px w-24" />

      {/* Repères */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {story.highlights.map((h, i) => (
          <Reveal key={h.label} index={i}>
            <div className="rounded-2xl border border-line bg-paper px-3 py-4 text-center shadow-[var(--shadow-card)]">
              <p className="font-serif text-2xl leading-none text-gold-dark">{h.value}</p>
              <p className="mt-1.5 text-[11px] leading-snug text-ink-soft">{h.label}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Récit */}
      <div className="mt-8 space-y-5">
        {story.paragraphs.map((paragraph, i) => (
          <Reveal key={i} index={i}>
            <p className="text-[15px] leading-relaxed text-pretty text-ink">{paragraph}</p>
          </Reveal>
        ))}
      </div>

      {/* Formats et tarifs : l'information la plus attendue après le récit */}
      <Reveal
        as="section"
        className="mt-10 overflow-hidden rounded-3xl border border-line bg-paper shadow-[var(--shadow-card)]"
      >
        <div aria-hidden className="h-1 w-full bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
        <div className="p-5">
          <h3 className="font-serif text-2xl text-ink">{t.ui.formatsTitle}</h3>
          <ul className="mt-4 divide-y divide-line">
            {FORMATS.map((format) => (
              <li key={format.ml} className="flex items-baseline justify-between py-2.5">
                <span className="font-medium text-ink">{format.ml} ml</span>
                <span className="font-serif text-xl text-ink">{money(format.price, lang)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-2xl bg-cream px-4 py-3 text-sm leading-relaxed text-ink-soft">
            <span className="font-medium text-gold-dark">{t.ui.duoTitle}</span>{" "}
            {t.ui.duoDetail(money(DUO_DISCOUNT, lang))}
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="mt-8 rounded-3xl bg-ink p-6 text-center text-cream">
        <p className="font-serif text-xl leading-relaxed text-pretty italic">{story.closing}</p>
      </Reveal>

      <button
        onClick={onBack}
        className="lift mt-8 w-full rounded-full bg-ink px-6 py-3.5 text-base font-medium text-cream hover:bg-gold-dark"
      >
        {t.ui.backHome}
      </button>
    </div>
  );
}
