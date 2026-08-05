/*
 * Instant de composition.
 *
 * Court temps d'attente mis en scène entre la dernière question et le
 * résultat : Thibault « compose » la sélection. Il donne au diagnostic
 * le poids d'un vrai conseil plutôt que d'un simple calcul instantané,
 * et rend la révélation des trois parfums bien plus désirable.
 *
 * Volontairement bref (moins de deux secondes) et interruptible :
 * un appui passe directement au résultat.
 */

import { useEffect } from "react";
import { AGENT } from "../data/agent";
import { useI18n } from "../i18n";

interface ComposingProps {
  onDone: () => void;
}

/** Durée de la mise en scène, en millisecondes. */
const DURATION = 1750;

export default function Composing({ onDone }: ComposingProps) {
  const { t } = useI18n();

  useEffect(() => {
    const timer = setTimeout(onDone, DURATION);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <button
      onClick={onDone}
      aria-live="polite"
      className="flex min-h-dvh w-full cursor-default flex-col items-center justify-center px-6 text-center"
    >
      {/* Monogramme cerclé d'un anneau doré qui tourne */}
      <span className="relative flex h-28 w-28 items-center justify-center">
        <span
          aria-hidden
          className="animate-spin-slow absolute inset-0 rounded-full border-2 border-gold/25 border-t-gold"
        />
        <span
          aria-hidden
          className="animate-breathe absolute inset-2 rounded-full bg-gold-light"
        />
        <span
          aria-hidden
          className="relative flex h-20 w-20 items-center justify-center rounded-full border border-gold/50 bg-paper font-serif text-4xl text-gold-dark shadow-[var(--shadow-card)]"
        >
          {AGENT.name[0]}
        </span>
      </span>

      <p className="animate-fade-up mt-9 max-w-sm font-serif text-2xl leading-snug text-balance text-ink sm:text-3xl">
        {t.ui.composing}
      </p>

      {/* Trois points qui respirent à tour de rôle */}
      <span aria-hidden className="mt-6 flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="dot-pulse h-1.5 w-1.5 rounded-full bg-gold"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </span>
    </button>
  );
}
