/*
 * Illustrations de flacons, en tracé vectoriel.
 *
 * Dessinées plutôt que photographiées : elles restent parfaitement
 * nettes sur la dalle 1080 × 1920, ne pèsent rien, fonctionnent
 * hors-ligne et respectent exactement la palette de la maison.
 *
 * Pour utiliser de vraies photographies à la place, voir la constante
 * PHOTOS dans src/components/Slideshow.tsx.
 */

interface BottleArtProps {
  /** Variante de flacon (0 à 2). */
  variant?: number;
  className?: string;
}

export default function BottleArt({ variant = 0, className = "" }: BottleArtProps) {
  const stroke = "var(--color-gold)";
  const glass = "var(--color-paper)";

  return (
    <svg
      viewBox="0 0 200 300"
      fill="none"
      aria-hidden
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Reflet vertical sur le verre */}
        <linearGradient id={`glass-${variant}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-gold-light)" stopOpacity="0.45" />
          <stop offset="38%" stopColor={glass} stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--color-gold-light)" stopOpacity="0.55" />
        </linearGradient>
        {/* Liquide ambré au fond du flacon */}
        <linearGradient id={`juice-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-gold-light)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {/* Ombre portée douce */}
      <ellipse cx="100" cy="286" rx="58" ry="7" fill="var(--color-ink)" opacity="0.07" />

      {variant === 0 && (
        <>
          {/* Flacon rectangulaire, épaules droites */}
          <rect x="48" y="96" width="104" height="184" rx="14" fill={`url(#glass-${variant})`} stroke={stroke} strokeWidth="2.5" />
          <path d="M48 214h104v52a14 14 0 0 1-14 14H62a14 14 0 0 1-14-14z" fill={`url(#juice-${variant})`} />
          <rect x="86" y="70" width="28" height="30" rx="4" fill={glass} stroke={stroke} strokeWidth="2.5" />
          <rect x="76" y="34" width="48" height="38" rx="9" fill="var(--color-gold-light)" stroke={stroke} strokeWidth="2.5" />
          <line x1="70" y1="122" x2="70" y2="196" stroke={stroke} strokeWidth="2" opacity="0.35" strokeLinecap="round" />
        </>
      )}

      {variant === 1 && (
        <>
          {/* Flacon aux épaules arrondies */}
          <path
            d="M56 138c0-22 14-30 14-42v-8h60v8c0 12 14 20 14 42v114a26 26 0 0 1-26 26H82a26 26 0 0 1-26-26z"
            fill={`url(#glass-${variant})`}
            stroke={stroke}
            strokeWidth="2.5"
          />
          <path d="M56 206h88v46a26 26 0 0 1-26 26H82a26 26 0 0 1-26-26z" fill={`url(#juice-${variant})`} />
          <rect x="80" y="52" width="40" height="36" rx="8" fill="var(--color-gold-light)" stroke={stroke} strokeWidth="2.5" />
          <circle cx="100" cy="70" r="6" fill={stroke} opacity="0.5" />
        </>
      )}

      {variant === 2 && (
        <>
          {/* Flacon cylindrique élancé */}
          <rect x="62" y="110" width="76" height="170" rx="38" fill={`url(#glass-${variant})`} stroke={stroke} strokeWidth="2.5" />
          <path d="M62 216h76v26a38 38 0 0 1-38 38 38 38 0 0 1-38-38z" fill={`url(#juice-${variant})`} />
          <rect x="88" y="84" width="24" height="28" rx="3" fill={glass} stroke={stroke} strokeWidth="2.5" />
          <path d="M74 60h52l-8 26H82z" fill="var(--color-gold-light)" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
          <line x1="84" y1="140" x2="84" y2="196" stroke={stroke} strokeWidth="2" opacity="0.3" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
