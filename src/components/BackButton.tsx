/*
 * Bouton retour, commun à tous les écrans.
 *
 * Centralisé pour que la cible tactile, l'ombre et le comportement au
 * survol restent identiques partout — c'est le seul élément présent sur
 * presque chaque écran, donc celui dont l'incohérence se voit le plus.
 */

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export default function BackButton({ onClick, label = "Retour" }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="lift flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-lg text-ink shadow-[var(--shadow-card)] hover:border-gold hover:text-gold-dark"
    >
      ←
    </button>
  );
}
