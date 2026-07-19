/*
 * Bulle de dialogue de Thibault, l'agent olfactif digital :
 * un monogramme doré et une phrase d'accompagnement.
 */

import { AGENT } from "../data/agent";

interface AgentBubbleProps {
  message: string;
  /** Variante compacte utilisée dans le questionnaire. */
  compact?: boolean;
}

export default function AgentBubble({ message, compact }: AgentBubbleProps) {
  return (
    <div className={`flex items-start gap-3 ${compact ? "" : "justify-center"}`}>
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold bg-paper font-serif text-lg text-gold-dark shadow-sm"
      >
        {AGENT.name[0]}
      </span>
      <p
        className={`rounded-2xl rounded-tl-sm border border-line bg-paper px-4 py-2.5 text-left text-sm leading-relaxed text-ink-soft shadow-sm ${
          compact ? "" : "max-w-md"
        }`}
      >
        <span className="font-medium text-gold-dark">{AGENT.name}</span> — {message}
      </p>
    </div>
  );
}
