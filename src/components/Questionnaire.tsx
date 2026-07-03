/*
 * Questionnaire : une question par écran, gros boutons, barre de
 * progression et bouton retour. La sous-question (branchement) est
 * insérée dynamiquement après le choix de la famille olfactive.
 */

import { useMemo, useState } from "react";
import type { Answers } from "../utils/recommendation";
import {
  GENDER_OPTIONS,
  FAMILY_OPTIONS,
  SUB_QUESTIONS,
  USAGE_OPTIONS,
  INTENSITY_OPTIONS,
  STYLE_OPTIONS,
  AVOID_OPTIONS,
} from "../data/questions";

interface QuestionnaireProps {
  onFinish: (answers: Answers) => void;
  onQuit: () => void;
}

/** Une étape du questionnaire. */
interface Step {
  key: keyof Answers;
  title: string;
  options: Array<{ value: string; label: string }>;
  multi?: boolean;
}

/** Réponses en cours de saisie. */
type Draft = Partial<Omit<Answers, "avoid">> & { avoid: string[] };

const toOptions = (record: Record<string, { label: string }>) =>
  Object.entries(record).map(([value, { label }]) => ({ value, label }));

/** Construit la liste des étapes selon la famille choisie (branchement). */
const buildSteps = (draft: Draft): Step[] => {
  const steps: Step[] = [
    { key: "genderTarget", title: "Pour qui est le parfum ?", options: toOptions(GENDER_OPTIONS) },
    {
      key: "mainFamily",
      title: "Quel univers attire le plus le client ?",
      // La famille « musqué / peau propre » est réservée au code rapide.
      options: toOptions(FAMILY_OPTIONS).filter((o) => o.value !== "musque-peau"),
    },
  ];

  // Sous-question éventuelle selon la famille choisie.
  const branch = draft.mainFamily ? FAMILY_OPTIONS[draft.mainFamily]?.branch : undefined;
  if (branch) {
    const sub = SUB_QUESTIONS[branch];
    steps.push({ key: "subPreference", title: sub.title, options: toOptions(sub.options) });
  }

  steps.push(
    { key: "usage", title: "Pour quelle utilisation ?", options: toOptions(USAGE_OPTIONS) },
    { key: "intensity", title: "Quelle puissance ?", options: toOptions(INTENSITY_OPTIONS) },
    { key: "style", title: "Quel style correspond le mieux ?", options: toOptions(STYLE_OPTIONS) },
    { key: "avoid", title: "Le client veut éviter quelque chose ?", options: toOptions(AVOID_OPTIONS), multi: true },
  );
  return steps;
};

export default function Questionnaire({ onFinish, onQuit }: QuestionnaireProps) {
  const [draft, setDraft] = useState<Draft>({ avoid: [] });
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => buildSteps(draft), [draft]);
  const step = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;
  const isLast = stepIndex === steps.length - 1;

  /** Sélection d'une réponse simple : enregistre puis passe à la suite. */
  const selectSingle = (value: string) => {
    setDraft((d) => {
      const next = { ...d, [step.key]: value };
      // Changer de famille invalide la sous-préférence précédente.
      if (step.key === "mainFamily") delete next.subPreference;
      return next;
    });
    setStepIndex((i) => i + 1);
  };

  /** Sélection multiple (question « à éviter »). */
  const toggleAvoid = (value: string) => {
    setDraft((d) => {
      if (value === "rien") return { ...d, avoid: d.avoid.includes("rien") ? [] : ["rien"] };
      const without = d.avoid.filter((v) => v !== "rien");
      return {
        ...d,
        avoid: without.includes(value) ? without.filter((v) => v !== value) : [...without, value],
      };
    });
  };

  const goBack = () => {
    if (stepIndex === 0) return onQuit();
    setStepIndex((i) => i - 1);
  };

  const finish = () => {
    // Toutes les étapes simples ont été remplies pour arriver ici.
    onFinish({
      genderTarget: draft.genderTarget!,
      mainFamily: draft.mainFamily!,
      usage: draft.usage!,
      intensity: draft.intensity!,
      style: draft.style!,
      subPreference: draft.subPreference,
      avoid: draft.avoid.filter((v) => v !== "rien"),
    });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pb-10 pt-6">
      {/* Barre de progression */}
      <div className="flex items-center gap-4">
        <button
          onClick={goBack}
          aria-label="Retour"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-lg text-ink transition hover:border-gold"
        >
          ←
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gold-light">
          <div className="progress-fill h-full rounded-full bg-gold" style={{ width: `${progress}%` }} />
        </div>
        <span className="w-10 text-right text-xs font-medium text-ink-soft">
          {stepIndex + 1}/{steps.length}
        </span>
      </div>

      {/* Question */}
      <div key={step.key} className="animate-fade-up mt-8 flex-1">
        <p className="text-[11px] font-semibold tracking-[0.3em] text-gold uppercase">
          Question {stepIndex + 1}
        </p>
        <h2 className="mt-2 font-serif text-3xl leading-tight text-ink">{step.title}</h2>
        {step.multi && (
          <p className="mt-2 text-sm text-ink-soft">Plusieurs choix possibles.</p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {step.options.map(({ value, label }) => {
            const selected = step.multi && draft.avoid.includes(value);
            return (
              <button
                key={value}
                onClick={() => (step.multi ? toggleAvoid(value) : selectSingle(value))}
                className={`rounded-2xl border px-5 py-4 text-left text-base font-medium transition active:scale-[0.98] ${
                  selected
                    ? "border-gold bg-gold text-white shadow-md"
                    : "border-line bg-paper text-ink hover:border-gold hover:shadow-sm"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Validation finale */}
        {isLast && (
          <button
            onClick={finish}
            className="mt-8 w-full rounded-full bg-ink px-8 py-4 text-base font-medium tracking-wide text-cream shadow-lg transition hover:bg-gold-dark active:scale-[0.98]"
          >
            Voir la sélection
          </button>
        )}
      </div>
    </div>
  );
}
