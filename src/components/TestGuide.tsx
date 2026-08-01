/*
 * Guide d'essai olfactif : les trois bons gestes, avec un minuteur de
 * deux minutes pour laisser le parfum se révéler avant de resentir.
 * Évite au client de saturer son nez sur trois parfums d'affilée.
 */

import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { AGENT } from "../data/agent";
import { CONFIG } from "../data/config";

interface TestGuideProps {
  onClose: () => void;
}

/** Formate un nombre de secondes en « m:ss ». */
const format = (total: number): string =>
  `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;

export default function TestGuide({ onClose }: TestGuideProps) {
  const { t } = useI18n();
  // null = minuteur non lancé, 0 = terminé.
  const [remaining, setRemaining] = useState<number | null>(null);

  // Décompte du minuteur.
  useEffect(() => {
    if (remaining === null || remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((r) => (r === null ? null : r - 1)), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  // Fermeture à la touche Échap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="animate-backdrop fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-5 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="animate-scale-in w-full max-w-sm rounded-3xl border border-line bg-paper p-6 shadow-[var(--shadow-modal)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold bg-paper font-serif text-lg text-gold-dark"
          >
            {AGENT.name[0]}
          </span>
          <h3 className="font-serif text-2xl leading-tight text-ink">{t.ui.testGuideTitle}</h3>
        </div>

        {/* Les trois gestes */}
        <ol className="mt-5 space-y-3">
          {t.ui.testGuideSteps.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink font-serif text-sm text-gold-light">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-ink">{step}</p>
            </li>
          ))}
        </ol>

        {/* Minuteur */}
        <div className="mt-6">
          {remaining === null ? (
            <button
              onClick={() => setRemaining(CONFIG.testGuideSeconds)}
              className="w-full rounded-full bg-gold px-6 py-3.5 text-sm font-medium text-white transition hover:bg-gold-dark active:scale-[0.98]"
            >
              {t.ui.testGuideStart}
            </button>
          ) : remaining > 0 ? (
            <div className="rounded-2xl border border-line bg-cream px-5 py-4 text-center">
              <p className="font-serif text-4xl text-gold-dark">{format(remaining)}</p>
              <p className="mt-1 text-sm text-ink-soft">{t.ui.testGuideRunning(format(remaining))}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-gold bg-gold-light px-5 py-4 text-center">
              <p className="font-serif text-xl text-gold-dark">{t.ui.testGuideDone}</p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-full border border-ink px-6 py-3 text-sm font-medium text-ink transition hover:border-gold hover:text-gold-dark"
        >
          {t.ui.close}
        </button>
      </div>
    </div>
  );
}
