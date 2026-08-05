/*
 * Écran d'accueil : sélection de la langue, présentation de Thibault
 * (l'agent olfactif digital) et lancement du diagnostic.
 * Les outils vendeur restent accessibles mais discrets en bas d'écran.
 */

import { AGENT } from "../data/agent";
import { STORY } from "../data/story";
import { useI18n, LANGUAGES } from "../i18n";

interface HomeProps {
  onStart: () => void;
  onEquivalence: () => void;
  onStory: () => void;
  onQuickCode: () => void;
  onSearch: () => void;
  onHistory: () => void;
  onStats: () => void;
}

export default function Home({
  onStart,
  onEquivalence,
  onStory,
  onQuickCode,
  onSearch,
  onHistory,
  onStats,
}: HomeProps) {
  const { lang, setLang, t } = useI18n();
  const story = STORY[lang];

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
          className="animate-fade-up stagger text-[10px] font-semibold tracking-[0.42em] text-gold uppercase sm:text-[11px]"
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
          <span className="relative flex h-24 w-24 items-center justify-center">
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
          <span className="block text-[10px] font-semibold tracking-[0.3em] text-gold uppercase">
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

      {/* Espace vendeur, volontairement discret */}
      <div
        style={{ "--i": 8 } as React.CSSProperties}
        className="animate-fade-up stagger w-full max-w-md border-t border-line/70 pt-4"
      >
        <p className="text-[10px] font-semibold tracking-[0.3em] text-ink-soft/50 uppercase">
          {t.ui.sellerSpace}
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-ink-soft/80">
          <button onClick={onQuickCode} className="underline-offset-4 transition hover:text-gold-dark hover:underline">
            Code rapide
          </button>
          <button onClick={onSearch} className="underline-offset-4 transition hover:text-gold-dark hover:underline">
            Recherche n°
          </button>
          <button onClick={onHistory} className="underline-offset-4 transition hover:text-gold-dark hover:underline">
            Historique
          </button>
          <button onClick={onStats} className="underline-offset-4 transition hover:text-gold-dark hover:underline">
            Statistiques
          </button>
        </div>
      </div>
    </div>
  );
}
