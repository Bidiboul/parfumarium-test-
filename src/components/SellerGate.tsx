/*
 * Verrou de l'espace vendeur (en français).
 *
 * Sur une borne en libre-service, empêche un client d'ouvrir le code
 * rapide, la recherche, l'historique ou les statistiques. Le code est
 * défini dans src/data/config.ts et redemandé après chaque retour
 * automatique à l'accueil (mode kiosque).
 */

import { useState } from "react";
import { CONFIG } from "../data/config";

interface SellerGateProps {
  onUnlock: () => void;
  onBack: () => void;
}

export default function SellerGate({ onUnlock, onBack }: SellerGateProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const submit = (value: string) => {
    if (value === CONFIG.sellerPin) return onUnlock();
    setError(true);
    setPin("");
  };

  /** Saisie d'un chiffre au pavé ; validation automatique à 4 chiffres. */
  const press = (digit: string) => {
    setError(false);
    const next = (pin + digit).slice(0, 4);
    setPin(next);
    if (next.length === 4) submit(next);
  };

  return (
    <div className="animate-fade-up mx-auto flex w-full max-w-xs flex-col items-center px-5 pb-14 pt-10 text-center">
      <span
        aria-hidden
        className="flex h-14 w-14 items-center justify-center rounded-full border border-gold bg-paper text-gold-dark"
      >
        {/* Cadenas */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </svg>
      </span>
      <h2 className="mt-4 font-serif text-2xl text-ink">Espace vendeur</h2>
      <p className="mt-1 text-sm text-ink-soft">Entrez le code à 4 chiffres.</p>

      {/* Témoins de saisie */}
      <div className="mt-6 flex gap-3" aria-label={`${pin.length} chiffres saisis`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border transition ${
              i < pin.length ? "border-gold bg-gold" : "border-line bg-paper"
            }`}
          />
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-700">Code incorrect.</p>}

      {/* Pavé numérique */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            onClick={() => press(d)}
            className="h-16 w-16 rounded-full border border-line bg-paper font-serif text-2xl text-ink transition hover:border-gold active:scale-[0.95]"
          >
            {d}
          </button>
        ))}
        <button
          onClick={onBack}
          className="h-16 w-16 rounded-full text-sm text-ink-soft transition hover:text-gold-dark"
        >
          Retour
        </button>
        <button
          onClick={() => press("0")}
          className="h-16 w-16 rounded-full border border-line bg-paper font-serif text-2xl text-ink transition hover:border-gold active:scale-[0.95]"
        >
          0
        </button>
        <button
          onClick={() => {
            setPin((p) => p.slice(0, -1));
            setError(false);
          }}
          aria-label="Effacer"
          className="h-16 w-16 rounded-full text-xl text-ink-soft transition hover:text-gold-dark"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
