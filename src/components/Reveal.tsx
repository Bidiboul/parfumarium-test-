/*
 * Apparition au défilement.
 *
 * L'élément reste discret tant qu'il n'est pas entré dans l'écran, puis
 * se révèle une seule fois. Sur une page de résultats longue, le
 * contenu « prend vie » au fur et à mesure du défilement plutôt que de
 * jouer toutes ses animations hors de vue.
 *
 * Deux mécanismes se complètent, car l'IntersectionObserver seul laisse
 * des éléments cachés lors d'un saut de défilement rapide (un élément
 * qui passe de « hors écran » à « hors écran » ne déclenche aucun
 * rappel) : un contrôle de position sur défilement sert de garde-fou.
 * Aucun contenu ne peut donc rester invisible.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Rang dans une série : décale légèrement l'apparition. */
  index?: number;
  className?: string;
  /** Balise à rendre (article, section…). */
  as?: "div" | "section" | "article";
}

export default function Reveal({ children, index = 0, className = "", as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let done = false;
    let frame = 0;

    const reveal = () => {
      if (done) return;
      done = true;
      setVisible(true);
      cleanup();
    };

    /** Révèle dès que l'élément atteint le bas de l'écran, ou l'a dépassé. */
    const check = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) reveal();
    };

    const onScroll = () => {
      if (frame) return; // une seule mesure par image
      frame = requestAnimationFrame(check);
    };

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => entry.isIntersecting && reveal(), {
            threshold: 0.08,
            rootMargin: "0px 0px -8% 0px",
          })
        : null;

    function cleanup() {
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    }

    observer?.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    check(); // état initial (élément déjà visible au chargement)

    return cleanup;
  }, []);

  const Tag = as;
  return (
    <Tag
      ref={ref as React.Ref<never>}
      style={{ "--i": index } as React.CSSProperties}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
