/*
 * Écran d'accueil : sélection de la langue, présentation de Thibault
 * (l'agent olfactif digital) et lancement du diagnostic.
 *
 * L'espace vendeur n'est pas affiché : sur un totem en libre accès, il
 * s'ouvre par un appui maintenu sur le logo, suivi du code.
 */

import { useEffect, useRef } from "react";
import { AGENT } from "../data/agent";
import { STORY } from "../data/story";
import { useI18n, LANGUAGES } from "../i18n";

interface HomeProps {
  onStart: () => void;
  onEquivalence: () => void;
  onStory: () => void;
  /** Ouvre l'espace vendeur (appui long sur le logo). */
  onSellerAccess: () => void;
}

/** Durée de l'appui long ouvrant l'espace vendeur, en millisecondes. */
const LONG_PRESS_MS = 900;

export default function Home({ onStart, onEquivalence, onStory, onSellerAccess }: HomeProps) {
  const { lang, setLang, t } = useI18n();
  const story = STORY[lang];

  /*
   * Accès vendeur discret : un appui maintenu sur le logo ouvre la
   * saisie du code. Rien ne le signale à l'écran, pour ne pas inviter
   * les passants à explorer les outils de la boutique.
   */
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPress = () => {
    pressTimer.current = setTimeout(onSellerAccess, LONG_PRESS_MS);
  };
  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };
  useEffect(() => cancelPress, []);

  return (
    <div className="flex min-h-dvh flex-col items-center px-6 pb-6 text-center">
      {/* Sélecteur de langue */}
      <div className="animate-fade-up flex flex-wrap justify-center gap-1.5 pt-5">
        {LANGUAGES.map(({ code, flag, name }, i) => (
          <button
            key={code}
            onClick={() => setLang(code)}
            aria-label={name}
            aria-pressed={lang === code}
            style={{ "--i": i } as React.CSSProperties}
            className={`lift stagger animate-fade-up flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium tracking-wide ${
              lang === code
                ? "border-gold bg-gold text-white shadow-[var(--shadow-gold)]"
                : "border-line/80 bg-paper/70 text-ink-soft backdrop-blur hover:border-gold hover:text-gold-dark"
            }`}
          >
            <span aria-hidden className="text-sm leading-none">
              {flag}
            </span>
            <span className="uppercase">{code}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center py-10">
        {/* Logo texte */}
        <p
          style={{ "--i": 1 } as React.CSSProperties}
          className="animate-fade-up stagger text-[0.625rem] font-semibold tracking-[0.42em] text-gold-dark uppercase sm:text-[0.6875rem]"
        >
          Vaison-la-Romaine · parfumarium.fr
        </p>
        <h1
          style={{ "--i": 2 } as React.CSSProperties}
          className="animate-fade-up stagger mt-3 font-serif text-6xl leading-[0.95] font-medium tracking-tight text-ink sm:text-7xl"
        >
          Parfumarium
        </h1>
        <div
          style={{ "--i": 3 } as React.CSSProperties}
          className="rule-gold animate-fade-up stagger mx-auto mt-5 h-px w-24"
        />

        {/* Thibault se présente */}
        <div
          style={{ "--i": 4 } as React.CSSProperties}
          className="animate-fade-up stagger mt-12 flex flex-col items-center"
        >
          {/*
            Le monogramme de Thibault cache l'accès vendeur : un appui
            maintenu l'ouvre. Rien ne le signale à l'écran, et un appui
            bref reste sans effet pour qu'un client curieux ne tombe
            jamais dessus par hasard.
          */}
          <span
            onPointerDown={startPress}
            onPointerUp={cancelPress}
            onPointerLeave={cancelPress}
            onPointerCancel={cancelPress}
            onContextMenu={(e) => e.preventDefault()}
            className="relative flex h-24 w-24 cursor-default items-center justify-center select-none"
          >
            {/* Halo respirant */}
            <span
              aria-hidden
              className="animate-breathe absolute inset-0 rounded-full bg-gold-light"
            />
            <span
              aria-hidden
              className="relative flex h-24 w-24 items-center justify-center rounded-full border border-gold/60 bg-paper font-serif text-5xl text-gold-dark shadow-[var(--shadow-card)]"
            >
              {AGENT.name[0]}
            </span>
          </span>

          <h2 className="mt-7 max-w-lg font-serif text-[1.7rem] leading-[1.15] text-balance text-ink sm:text-4xl">
            {t.agent.greeting}
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-pretty text-ink-soft sm:text-base">
            {t.agent.intro}
          </p>
        </div>

        <p
          style={{ "--i": 5 } as React.CSSProperties}
          className="animate-fade-up stagger mt-9 max-w-xs font-serif text-xl leading-snug text-balance text-ink-soft"
        >
          {t.ui.tagline}
        </p>

        {/* Actions principales */}
        <div
          style={{ "--i": 6 } as React.CSSProperties}
          className="animate-fade-up stagger mt-7 flex w-full max-w-sm flex-col gap-2.5"
        >
          <button
            onClick={onStart}
            className="lift w-full rounded-full bg-ink px-8 py-4 text-base font-medium tracking-wide text-cream shadow-[var(--shadow-lift)] hover:bg-gold-dark"
          >
            {t.ui.start}
          </button>

          {/* Raccourci : le client connaît déjà un parfum */}
          <button
            onClick={onEquivalence}
            className="lift w-full rounded-full border border-gold/70 bg-paper/80 px-8 py-4 text-base font-medium text-gold-dark backdrop-blur hover:border-gold hover:bg-gold hover:text-white"
          >
            {t.ui.equivalenceButton}
          </button>
        </div>

        <p
          style={{ "--i": 7 } as React.CSSProperties}
          className="animate-fade-up stagger mt-5 text-sm text-ink-soft"
        >
          {t.ui.subtext}
        </p>

        {/* L'histoire de la maison — invitation discrète à en savoir plus */}
        <button
          onClick={onStory}
          style={{ "--i": 8 } as React.CSSProperties}
          className="lift animate-fade-up stagger mt-9 w-full max-w-sm rounded-3xl border border-line bg-paper/70 px-6 py-5 text-center backdrop-blur hover:border-gold"
        >
          <span className="block text-[0.625rem] font-semibold tracking-[0.3em] text-gold-dark uppercase">
            {t.ui.storyLink}
          </span>
          <span className="mt-2 block font-serif text-lg leading-snug text-balance text-ink">
            {story.teaser}
          </span>
          <span className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-gold-dark">
            {t.ui.storyMore}
            <span aria-hidden>→</span>
          </span>
        </button>
      </div>

    </div>
  );
}
