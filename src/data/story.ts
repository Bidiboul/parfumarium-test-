/*
 * L'histoire de Parfumarium, présentée au client sur la borne.
 *
 * ⚠️ Texte à relire et personnaliser par la boutique.
 * Il a été rédigé à partir des seuls éléments connus — parfumerie à
 * Vaison-la-Romaine, boutique et site parfumarium.fr, fragrances
 * d'équivalence numérotées, diagnostic offert. Aucune date, aucun nom
 * de fondateur ni aucun chiffre d'activité n'a été inventé : ajoutez-les
 * vous-même ici si vous souhaitez les mettre en avant.
 */

import type { Lang } from "../i18n/types";

export interface Story {
  /** Accroche affichée sur l'accueil. */
  teaser: string;
  /** Titre de l'écran complet. */
  title: string;
  /** Corps du texte, un élément par paragraphe. */
  paragraphs: string[];
  /** Trois repères mis en avant (valeur + libellé). */
  highlights: Array<{ value: string; label: string }>;
  /** Invitation finale. */
  closing: string;
}

export const STORY: Record<Lang, Story> = {
  fr: {
    teaser: "Une parfumerie de Vaison-la-Romaine qui rend la haute parfumerie accessible.",
    title: "L'histoire de Parfumarium",
    paragraphs: [
      "Parfumarium est née d'une conviction simple : un beau parfum ne devrait pas être un luxe réservé à quelques-uns. Au cœur de Vaison-la-Romaine, notre boutique propose des fragrances d'équivalence — les mêmes familles olfactives, les mêmes matières, la même exigence, à un prix qui laisse le plaisir intact.",
      "Chaque fragrance porte un numéro. Derrière ce numéro se cache un travail de composition : des concentrations généreuses, des matières premières sélectionnées, et une tenue pensée pour durer la journée. Nos équivalences ne copient pas, elles traduisent un accord olfactif que vous aimez.",
      "En boutique, rien ne remplace le nez. C'est pourquoi nous prenons le temps : on sent, on attend, on resent. Le diagnostic olfactif est offert, sans obligation d'achat — repartir avec le bon parfum compte plus que repartir avec un parfum.",
    ],
    highlights: [
      { value: "50", label: "fragrances à découvrir" },
      { value: "84110", label: "Vaison-la-Romaine" },
      { value: "0 €", label: "diagnostic olfactif" },
    ],
    closing: "Poussez la porte, prenez le temps de sentir. Nous sommes là pour vous guider.",
  },

  en: {
    teaser: "A perfumery in Vaison-la-Romaine making fine fragrance accessible.",
    title: "The Parfumarium story",
    paragraphs: [
      "Parfumarium was born from a simple conviction: a beautiful perfume shouldn't be a luxury reserved for a few. In the heart of Vaison-la-Romaine, our shop offers equivalence fragrances — the same olfactory families, the same materials, the same standards, at a price that leaves the pleasure intact.",
      "Every fragrance carries a number. Behind that number lies real composition work: generous concentrations, carefully selected raw materials, and lasting power built to carry through the day. Our equivalences don't copy — they translate an olfactory accord you already love.",
      "In store, nothing replaces the nose. That's why we take our time: you spray, you wait, you smell again. The olfactory diagnosis is free, with no obligation to buy — leaving with the right perfume matters more than leaving with a perfume.",
    ],
    highlights: [
      { value: "50", label: "fragrances to discover" },
      { value: "84110", label: "Vaison-la-Romaine" },
      { value: "Free", label: "olfactory diagnosis" },
    ],
    closing: "Come in and take the time to smell. We're here to guide you.",
  },

  de: {
    teaser: "Eine Parfümerie in Vaison-la-Romaine, die feine Düfte zugänglich macht.",
    title: "Die Geschichte von Parfumarium",
    paragraphs: [
      "Parfumarium entstand aus einer einfachen Überzeugung: Ein schönes Parfum sollte kein Luxus für wenige sein. Im Herzen von Vaison-la-Romaine bietet unser Geschäft Duft-Entsprechungen an — dieselben Duftfamilien, dieselben Materialien, derselbe Anspruch, zu einem Preis, der die Freude unberührt lässt.",
      "Jeder Duft trägt eine Nummer. Hinter dieser Nummer steckt echte Kompositionsarbeit: großzügige Konzentrationen, sorgfältig ausgewählte Rohstoffe und eine Haltbarkeit, die durch den Tag trägt. Unsere Entsprechungen kopieren nicht — sie übersetzen einen Duftakkord, den Sie lieben.",
      "Im Geschäft ersetzt nichts die Nase. Deshalb nehmen wir uns Zeit: aufsprühen, warten, erneut riechen. Die Duft-Diagnose ist kostenlos und unverbindlich — mit dem richtigen Parfum zu gehen zählt mehr, als mit irgendeinem zu gehen.",
    ],
    highlights: [
      { value: "50", label: "Düfte zu entdecken" },
      { value: "84110", label: "Vaison-la-Romaine" },
      { value: "Gratis", label: "Duft-Diagnose" },
    ],
    closing: "Treten Sie ein und nehmen Sie sich Zeit zum Riechen. Wir begleiten Sie gern.",
  },

  es: {
    teaser: "Una perfumería de Vaison-la-Romaine que hace accesible la alta perfumería.",
    title: "La historia de Parfumarium",
    paragraphs: [
      "Parfumarium nació de una convicción sencilla: un buen perfume no debería ser un lujo reservado a unos pocos. En el corazón de Vaison-la-Romaine, nuestra tienda ofrece fragancias de equivalencia — las mismas familias olfativas, las mismas materias, la misma exigencia, a un precio que deja intacto el placer.",
      "Cada fragancia lleva un número. Detrás de ese número hay un verdadero trabajo de composición: concentraciones generosas, materias primas seleccionadas y una duración pensada para acompañar todo el día. Nuestras equivalencias no copian: traducen un acorde olfativo que a usted le gusta.",
      "En la tienda, nada sustituye a la nariz. Por eso nos tomamos el tiempo: se vaporiza, se espera, se vuelve a oler. El diagnóstico olfativo es gratuito y sin compromiso — irse con el perfume adecuado importa más que irse con un perfume.",
    ],
    highlights: [
      { value: "50", label: "fragancias por descubrir" },
      { value: "84110", label: "Vaison-la-Romaine" },
      { value: "Gratis", label: "diagnóstico olfativo" },
    ],
    closing: "Entre y tómese el tiempo de oler. Estamos aquí para guiarle.",
  },

  it: {
    teaser: "Una profumeria di Vaison-la-Romaine che rende accessibile l'alta profumeria.",
    title: "La storia di Parfumarium",
    paragraphs: [
      "Parfumarium nasce da una convinzione semplice: un bel profumo non dovrebbe essere un lusso riservato a pochi. Nel cuore di Vaison-la-Romaine, la nostra boutique propone fragranze di equivalenza — le stesse famiglie olfattive, le stesse materie, la stessa esigenza, a un prezzo che lascia intatto il piacere.",
      "Ogni fragranza porta un numero. Dietro quel numero c'è un vero lavoro di composizione: concentrazioni generose, materie prime selezionate e una tenuta pensata per accompagnare tutta la giornata. Le nostre equivalenze non copiano: traducono un accordo olfattivo che amate.",
      "In boutique, nulla sostituisce il naso. Per questo ci prendiamo il tempo: si vaporizza, si attende, si riannusa. La diagnosi olfattiva è offerta, senza obbligo d'acquisto — uscire con il profumo giusto conta più che uscire con un profumo.",
    ],
    highlights: [
      { value: "50", label: "fragranze da scoprire" },
      { value: "84110", label: "Vaison-la-Romaine" },
      { value: "Gratis", label: "diagnosi olfattiva" },
    ],
    closing: "Entrate e prendetevi il tempo di annusare. Siamo qui per guidarvi.",
  },
};
