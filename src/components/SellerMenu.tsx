/*
 * Menu de l'espace vendeur (en français).
 *
 * Accessible uniquement par appui maintenu sur le monogramme de
 * Thibault, sur l'accueil, puis
 * saisie du code : sur un totem en libre accès, afficher ces outils
 * inviterait les passants à s'en servir.
 */

import BackButton from "./BackButton";

interface SellerMenuProps {
  onQuickCode: () => void;
  onSearch: () => void;
  onHistory: () => void;
  onStats: () => void;
  onBack: () => void;
}

const ENTRIES: Array<{ key: string; label: string; detail: string }> = [
  { key: "code", label: "Code rapide", detail: "Sélection directe par code à 5 chiffres" },
  { key: "search", label: "Recherche n°", detail: "Retrouver une référence du catalogue" },
  { key: "history", label: "Historique", detail: "Les 10 derniers diagnostics" },
  { key: "stats", label: "Statistiques", detail: "Univers demandés, réassort, langues" },
];

export default function SellerMenu({
  onQuickCode,
  onSearch,
  onHistory,
  onStats,
  onBack,
}: SellerMenuProps) {
  const actions: Record<string, () => void> = {
    code: onQuickCode,
    search: onSearch,
    history: onHistory,
    stats: onStats,
  };

  return (
    <div className="animate-fade-up mx-auto w-full max-w-xl px-5 pb-14 pt-6">
      <BackButton onClick={onBack} />

      <p className="mt-6 text-[0.6875rem] font-semibold tracking-[0.3em] text-gold-dark uppercase">
        Espace vendeur
      </p>
      <h2 className="mt-2 font-serif text-3xl text-ink">Outils</h2>

      <div className="mt-6 space-y-2.5">
        {ENTRIES.map(({ key, label, detail }) => (
          <button
            key={key}
            onClick={actions[key]}
            className="lift flex w-full items-center justify-between gap-4 rounded-2xl border border-line bg-paper px-5 py-4 text-left shadow-[var(--shadow-card)] hover:border-gold"
          >
            <span className="min-w-0">
              <span className="block text-base font-medium text-ink">{label}</span>
              <span className="mt-0.5 block text-sm text-ink-soft">{detail}</span>
            </span>
            <span aria-hidden className="shrink-0 text-lg text-gold">
              →
            </span>
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-ink-soft/70">
        Le code est redemandé à chaque retour à l'accueil.
      </p>
    </div>
  );
}
