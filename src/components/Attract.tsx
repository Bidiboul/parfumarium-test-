/*
 * Écran d'attente.
 *
 * Sur un totem en vitrine, l'écran reste inutilisé la plupart du temps.
 * Cette veille animée attire le regard des passants, invite au toucher,
 * et évite qu'une image fixe ne marque la dalle sur la durée.
 *
 * Le moindre contact la referme.
 */

import { useEffect, useState } from "react";
import { AGENT } from "../data/agent";
import { STORY } from "../data/story";
import { useI18n } from "../i18n";

interface AttractProps {
  onDismiss: () => void;
}

/** Durée d'affichage de chaque message, en millisecondes. */
const ROTATE_MS = 4200;

export default function Attract({ onDismiss }: AttractProps) {
  const { lang, t } = useI18n();
  const [step, setStep] = useState(0);

  // Les messages alternent lentement : l'œil a le temps de lire.
  const messages = [t.agent.greeting, t.ui.tagline, STORY[lang].teaser];

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => (s + 1) % messages.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div
      onPointerDown={onDismiss}
      role="button"
      tabIndex={0}
      aria-label={t.ui.touchToStart}
      className="animate-backdrop fixed inset-0 z-40 flex flex-col items-center justify-center bg-cream px-10 text-center"
    >
      {/* Monogramme */}
      <span className="relative flex h-40 w-40 items-center justify-center">
        <span aria-hidden className="animate-breathe absolute inset-0 rounded-full bg-gold-light" />
        <span
          aria-hidden
          className="relative flex h-32 w-32 items-center justify-center rounded-full border border-gold/50 bg-paper font-serif text-6xl text-gold-dark shadow-[var(--shadow-card)]"
        >
          {AGENT.name[0]}
        </span>
      </span>

      <p className="mt-10 text-sm font-semibold tracking-[0.4em] text-gold-dark uppercase">
        Vaison-la-Romaine · parfumarium.fr
      </p>
      <h1 className="mt-4 font-serif text-6xl leading-[0.95] tracking-tight text-ink">
        Parfumarium
      </h1>
      <div className="rule-gold mt-6 h-px w-32" />

      {/* Message tournant */}
      <p
        key={step}
        className="animate-fade-up mt-10 min-h-[6rem] max-w-2xl font-serif text-3xl leading-snug text-balance text-ink-soft"
      >
        {messages[step]}
      </p>

      {/* Invitation au toucher */}
      <p className="dot-pulse mt-14 rounded-full border border-gold bg-paper px-10 py-5 text-xl font-medium text-gold-dark shadow-[var(--shadow-card)]">
        {t.ui.touchToStart}
      </p>
    </div>
  );
}
