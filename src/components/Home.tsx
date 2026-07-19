/*
 * Écran d'accueil : Thibault, l'agent olfactif digital, accueille le
 * client sur la tablette et l'invite à démarrer le diagnostic.
 * Les outils vendeur (code rapide, recherche, historique) restent
 * accessibles mais discrets en bas d'écran.
 */

import { AGENT } from "../data/agent";

interface HomeProps {
  onStart: () => void;
  onQuickCode: () => void;
  onSearch: () => void;
  onHistory: () => void;
}

export default function Home({ onStart, onQuickCode, onSearch, onHistory }: HomeProps) {
  return (
    <div className="animate-fade-up flex min-h-dvh flex-col items-center px-6 pb-6 text-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        {/* Logo texte */}
        <p className="text-[11px] font-semibold tracking-[0.45em] text-gold uppercase">
          Vaison-la-Romaine · parfumarium.fr
        </p>
        <h1 className="mt-3 font-serif text-5xl font-medium tracking-wide text-ink sm:text-6xl">
          Parfumarium
        </h1>
        <div className="mx-auto mt-4 h-px w-16 bg-gold" />

        {/* Thibault se présente */}
        <div className="mt-10 flex flex-col items-center">
          <span
            aria-hidden
            className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-paper font-serif text-4xl text-gold-dark shadow-md"
          >
            {AGENT.name[0]}
          </span>
          <h2 className="mt-5 max-w-lg font-serif text-2xl leading-snug text-ink sm:text-3xl">
            {AGENT.greeting}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
            {AGENT.intro}
          </p>
        </div>

        <h3 className="mt-8 max-w-md font-serif text-xl leading-snug text-ink-soft">
          Trouvez le parfum idéal en quelques questions
        </h3>

        <button
          onClick={onStart}
          className="mt-6 w-full max-w-sm rounded-full bg-ink px-8 py-4 text-base font-medium tracking-wide text-cream shadow-lg transition hover:bg-gold-dark active:scale-[0.98]"
        >
          Commencer le diagnostic
        </button>

        <p className="mt-4 text-sm text-ink-soft">
          Diagnostic olfactif offert — 50 fragrances à découvrir
        </p>
      </div>

      {/* Espace vendeur, volontairement discret */}
      <div className="mt-10 border-t border-line pt-4">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-ink-soft/60 uppercase">
          Espace vendeur
        </p>
        <div className="mt-2 flex justify-center gap-5 text-sm text-ink-soft">
          <button onClick={onQuickCode} className="underline-offset-4 transition hover:text-gold-dark hover:underline">
            Code rapide
          </button>
          <button onClick={onSearch} className="underline-offset-4 transition hover:text-gold-dark hover:underline">
            Recherche n°
          </button>
          <button onClick={onHistory} className="underline-offset-4 transition hover:text-gold-dark hover:underline">
            Historique
          </button>
        </div>
      </div>
    </div>
  );
}
