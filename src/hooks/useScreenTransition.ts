/*
 * Transitions d'écran fluides.
 *
 * Utilise l'API View Transitions du navigateur : le changement d'écran
 * est alors un fondu croisé accéléré par le GPU, sans à-coup. Sur les
 * navigateurs qui ne la proposent pas, le changement se fait
 * normalement (l'animation CSS d'entrée prend le relais).
 */

import { useCallback } from "react";
import { flushSync } from "react-dom";

type StartViewTransition = (callback: () => void) => { finished: Promise<void> };

/**
 * Retourne une fonction qui exécute `update` dans une transition de vue
 * quand c'est possible.
 */
export function useScreenTransition() {
  return useCallback((update: () => void) => {
    const start = (document as Document & { startViewTransition?: StartViewTransition })
      .startViewTransition;

    // Repli : mise à jour directe.
    if (typeof start !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      update();
      return;
    }

    // flushSync garantit que le DOM est à jour dans la fenêtre de capture
    // de la transition (React applique sinon la mise à jour trop tard).
    start.call(document, () => flushSync(update));
  }, []);
}
