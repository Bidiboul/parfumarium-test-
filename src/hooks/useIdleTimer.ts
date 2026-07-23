/*
 * Mode kiosque : réinitialise la borne après une période d'inactivité.
 *
 * Sur une tablette en libre-service, si un client s'éloigne sans
 * terminer, l'app doit revenir seule à l'écran d'accueil pour le
 * client suivant. Toute interaction (toucher, clic, clavier) relance
 * le compte à rebours.
 */

import { useEffect, useRef } from "react";

/** Délai d'inactivité avant retour automatique à l'accueil (ms). */
export const KIOSK_TIMEOUT_MS = 90_000;

/**
 * Appelle `onIdle` après `timeout` ms sans interaction.
 * `active` permet de désactiver le minuteur (ex. sur l'écran d'accueil).
 */
export function useIdleTimer(onIdle: () => void, active: boolean, timeout = KIOSK_TIMEOUT_MS) {
  // Référence stable vers le callback pour ne pas relancer l'effet à chaque rendu.
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!active) return;

    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => onIdleRef.current(), timeout);
    };

    const events = ["pointerdown", "keydown", "touchstart", "mousemove", "wheel"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [active, timeout]);
}
