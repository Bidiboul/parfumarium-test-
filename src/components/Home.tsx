/*
 * Écran d'accueil : logo, accroche et accès aux différents modes
 * (diagnostic guidé, code rapide, recherche par numéro, historique).
 */

interface HomeProps {
  onStart: () => void;
  onQuickCode: () => void;
  onSearch: () => void;
  onHistory: () => void;
}

export default function Home({ onStart, onQuickCode, onSearch, onHistory }: HomeProps) {
  return (
    <div className="animate-fade-up flex min-h-[80dvh] flex-col items-center justify-center px-6 text-center">
      {/* Logo texte */}
      <p className="text-[11px] font-semibold tracking-[0.45em] text-gold uppercase">
        Vaison-la-Romaine · parfumarium.fr
      </p>
      <h1 className="mt-3 font-serif text-5xl font-medium tracking-wide text-ink sm:text-6xl">
        Parfumarium
      </h1>
      <div className="mx-auto mt-4 h-px w-16 bg-gold" />

      <h2 className="mt-8 max-w-md font-serif text-2xl leading-snug text-ink-soft sm:text-3xl">
        Trouvez le parfum idéal en quelques questions
      </h2>

      <button
        onClick={onStart}
        className="mt-10 w-full max-w-sm rounded-full bg-ink px-8 py-4 text-base font-medium tracking-wide text-cream shadow-lg transition hover:bg-gold-dark active:scale-[0.98]"
      >
        Commencer le diagnostic
      </button>

      <p className="mt-4 text-sm text-ink-soft">
        Diagnostic olfactif offert — 50 fragrances à découvrir
      </p>

      {/* Accès rapides vendeur */}
      <div className="mt-12 flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          onClick={onQuickCode}
          className="flex-1 rounded-full border border-line bg-paper px-5 py-3 text-sm font-medium text-ink transition hover:border-gold hover:text-gold-dark"
        >
          Code rapide
        </button>
        <button
          onClick={onSearch}
          className="flex-1 rounded-full border border-line bg-paper px-5 py-3 text-sm font-medium text-ink transition hover:border-gold hover:text-gold-dark"
        >
          Recherche n°
        </button>
        <button
          onClick={onHistory}
          className="flex-1 rounded-full border border-line bg-paper px-5 py-3 text-sm font-medium text-ink transition hover:border-gold hover:text-gold-dark"
        >
          Historique
        </button>
      </div>
    </div>
  );
}
