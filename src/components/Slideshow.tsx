/*
 * Diaporama de veille.
 *
 * Prend la main après une longue inactivité sur le totem : quatre vues
 * défilent lentement — la maison, les fragrances, l'offre duo mise en
 * avant, le diagnostic offert — sous un appel au toucher qui rebondit
 * doucement pour accrocher le regard des passants.
 *
 * Le moindre contact rend la main à l'accueil.
 *
 * Pour utiliser de vraies photographies plutôt que les illustrations
 * vectorielles : déposez vos fichiers dans public/slideshow/ et
 * renseignez PHOTOS ci-dessous. Les vues garderont leur habillage
 * (titre, offre, appel au toucher).
 */

import { useEffect, useState } from "react";
import BottleArt from "./BottleArt";
import { useI18n } from "../i18n";
import { DUO_DISCOUNT, DUO_MIN_ML, money } from "../data/shop";

interface SlideshowProps {
  onDismiss: () => void;
}

/**
 * Photographies de fond, une par vue (chemins depuis public/).
 * Laisser vide pour conserver les illustrations vectorielles.
 * Exemple : ["/slideshow/p1.jpg", "/slideshow/p2.jpg", "", ""]
 */
const PHOTOS: string[] = [];

/** Durée d'affichage d'une vue, en millisecondes. */
const SLIDE_MS = 9000;

export default function Slideshow({ onDismiss }: SlideshowProps) {
  const { lang, t } = useI18n();
  const [index, setIndex] = useState(0);

  const slides = [
    // 1. La maison
    {
      kicker: "Vaison-la-Romaine · parfumarium.fr",
      title: "Parfumarium",
      subtitle: t.ui.tagline,
      highlight: false,
    },
    // 2. Les fragrances
    {
      kicker: "Parfumarium",
      title: "50",
      subtitle: t.ui.slideDiscover,
      highlight: false,
    },
    // 3. L'offre duo, mise en avant
    {
      kicker: t.ui.duoTitle,
      title: t.ui.slideDuoHeadline(money(DUO_DISCOUNT, lang)),
      subtitle: t.ui.slideDuoDetail(DUO_MIN_ML),
      highlight: true,
    },
    // 4. Le diagnostic
    {
      kicker: "Parfumarium",
      title: t.ui.slideDiagnosis,
      subtitle: t.agent.greeting,
      highlight: false,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index];
  const photo = PHOTOS[index];

  return (
    <div
      onPointerDown={onDismiss}
      role="button"
      tabIndex={0}
      aria-label={t.ui.touchToStart}
      className={`animate-backdrop fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden px-10 text-center ${
        slide.highlight ? "bg-ink" : "bg-cream"
      }`}
    >
      {/* Fond : photographie si fournie, sinon illustration vectorielle */}
      <div key={`bg-${index}`} className="animate-slide absolute inset-0">
        {photo ? (
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BottleArt
              variant={index % 3}
              className={`h-[62%] w-auto ${slide.highlight ? "opacity-60" : "opacity-95"}`}
            />
          </div>
        )}
        {/* Voile pour garantir la lisibilité du texte par-dessus :
            assez dense derrière le texte, plus léger sur les bords pour
            que le flacon reste perceptible. */}
        <div
          className={`absolute inset-0 ${
            slide.highlight
              ? "bg-gradient-to-b from-ink/70 via-ink/85 to-ink/75"
              : "bg-gradient-to-b from-cream/60 via-cream/85 to-cream/70"
          }`}
        />
      </div>

      {/* Texte de la vue */}
      <div key={`text-${index}`} className="animate-fade-up relative z-10 flex flex-col items-center">
        <p
          className={`text-sm font-semibold tracking-[0.4em] uppercase ${
            slide.highlight ? "text-gold-light" : "text-gold-dark"
          }`}
        >
          {slide.kicker}
        </p>

        <h1
          className={`mt-6 max-w-4xl font-serif leading-[0.95] tracking-tight text-balance ${
            slide.highlight ? "text-cream" : "text-ink"
          } ${slide.title.length <= 3 ? "text-[10rem]" : "text-7xl"}`}
        >
          {slide.title}
        </h1>

        <div
          className={`mt-7 h-px w-32 ${slide.highlight ? "bg-gold-light/70" : "rule-gold"}`}
        />

        <p
          className={`mt-7 max-w-2xl font-serif text-3xl leading-snug text-balance ${
            slide.highlight ? "text-gold-light" : "text-ink-soft"
          }`}
        >
          {slide.subtitle}
        </p>
      </div>

      {/* Appel au toucher : il rebondit doucement, en continu */}
      <p
        className={`animate-nudge absolute bottom-[14%] z-10 rounded-full px-12 py-6 text-2xl font-medium shadow-[var(--shadow-lift)] ${
          slide.highlight
            ? "bg-gold text-white"
            : "border border-gold bg-paper text-gold-dark"
        }`}
      >
        👆 {t.ui.touchMe}
      </p>

      {/* Repères de progression */}
      <div aria-hidden className="absolute bottom-[7%] z-10 flex gap-2.5">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === index
                ? `w-10 ${slide.highlight ? "bg-gold-light" : "bg-gold"}`
                : `w-2 ${slide.highlight ? "bg-gold-light/40" : "bg-gold/30"}`
            }`}
          />
        ))}
      </div>
    </div>
  );
}
