/*
 * Écran de résultat : sélection principale (top 3), parfums annexes,
 * mot de Thibault, copie de la sélection et nouveau diagnostic.
 * Tous les textes suivent la langue choisie par le client.
 *
 * Les numéros et noms Parfumarium sont mis en avant, la
 * correspondance olfactive reste en petit.
 */

import { useEffect, useMemo, useState } from "react";
import AgentBubble from "./AgentBubble";
import Reveal from "./Reveal";
import ShareModal from "./ShareModal";
import PerfumeModal from "./PerfumeModal";
import TestGuide from "./TestGuide";
import { AGENT } from "../data/agent";
import { useI18n, getDescription } from "../i18n";
import { perfumes, type Perfume } from "../data/perfumes";
import { entryFormat, money, productUrl } from "../data/shop";
import { recommendPerfumes, type Answers, type PerfumeWithScore } from "../utils/recommendation";
import { buildProfile } from "../utils/profile";
import { saveToHistory } from "../utils/history";
import { recordStat, recordFeedback, type Feedback } from "../utils/stats";

interface ResultsProps {
  answers: Answers;
  /** Code rapide utilisé pour obtenir ce résultat, le cas échéant. */
  code?: string;
  /** Si vrai, le résultat n'est pas ré-enregistré dans l'historique. */
  fromHistory?: boolean;
  onRestart: () => void;
  onHome: () => void;
}

/** Pastilles d'intensité (● pleins / ○ vides). */
function IntensityDots({ level, label }: { level: number; label: string }) {
  return (
    <span className="tracking-widest text-gold" aria-label={label}>
      {"●".repeat(level)}
      <span className="text-gold-light">{"●".repeat(4 - level)}</span>
    </span>
  );
}

/** Carte d'un parfum de la sélection principale. */
function MainCard({
  perfume,
  rank,
  onDetails,
}: {
  perfume: PerfumeWithScore;
  rank: number;
  onDetails: () => void;
}) {
  const { lang, t } = useI18n();
  const intensityLabel = t.ui.intensityLabels[perfume.intensity - 1];

  return (
    <Reveal
      as="article"
      index={rank}
      className="overflow-hidden rounded-3xl border border-line bg-paper shadow-[var(--shadow-card)]"
    >
      {/* Liseré doré : plus marqué pour le premier choix */}
      <div
        aria-hidden
        className={`h-1 w-full ${
          rank === 1 ? "bg-gradient-to-r from-gold-dark via-gold to-gold-light" : "bg-gold-light/70"
        }`}
      />
      <div className="p-5">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink font-serif text-xl text-gold-light shadow-[var(--shadow-card)]">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-[1.65rem] leading-[1.1] text-balance text-ink">
            <span className="text-gold-dark">{perfume.id}</span> — {perfume.name}
          </h3>
          <p className="mt-1.5 text-sm text-ink-soft">
            {perfume.family} · {intensityLabel}{" "}
            <IntensityDots level={perfume.intensity} label={intensityLabel} />
          </p>
        </div>
        {/* Prix d'appel : le détail des formats est dans la fiche */}
        <span className="shrink-0 rounded-full border border-line bg-cream px-3 py-1 text-right">
          <span className="block text-[0.5625rem] leading-none text-ink-soft">{t.ui.priceFrom}</span>
          <span className="block font-serif text-lg leading-tight text-ink">
            {money(entryFormat().price, lang)}
          </span>
        </span>
      </div>

      {/* Style + disponibilité */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {perfume.inStock === false && (
          <span className="rounded-full bg-gold-light px-2.5 py-0.5 text-xs font-medium text-gold-dark">
            {t.ui.outOfStock}
          </span>
        )}
        {perfume.styles.slice(0, 4).map((s) => (
          <span key={s} className="rounded-full border border-gold-light bg-cream px-2.5 py-0.5 text-xs text-gold-dark capitalize">
            {t.styleChips[s] ?? s}
          </span>
        ))}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink">{getDescription(perfume, lang)}</p>

      {/* Pourquoi il correspond */}
      {perfume.reasons.length > 0 && (
        <ul className="mt-3 space-y-1">
          {perfume.reasons.map((r) => (
            <li key={r} className="flex gap-2 text-sm text-ink-soft">
              <span className="text-gold">✦</span>
              {r}
            </li>
          ))}
        </ul>
      )}

      {/* Fiche détaillée */}
      <button
        onClick={onDetails}
        className="lift mt-4 w-full rounded-full border border-line bg-cream/50 px-5 py-2.5 text-sm font-medium text-ink hover:border-gold hover:text-gold-dark"
      >
        {t.ui.detailsButton}
      </button>

      {/* Correspondance olfactive + lien boutique */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-2.5">
        <p className="text-[0.6875rem] leading-snug text-ink-soft/70">
          {t.ui.correspondence} {perfume.match}
        </p>
        <a
          href={productUrl(perfume)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[0.6875rem] font-medium text-gold-dark underline-offset-2 transition hover:underline"
        >
          {t.ui.viewOnShop} →
        </a>
      </div>
      </div>
    </Reveal>
  );
}

export default function Results({ answers, code, fromHistory, onRestart, onHome }: ResultsProps) {
  const { lang, t } = useI18n();
  const { top3, extras, sellerPhrase } = useMemo(
    () => recommendPerfumes(answers, perfumes, t),
    [answers, t]
  );
  const profile = useMemo(() => buildProfile(answers, t), [answers, t]);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [details, setDetails] = useState<Perfume | null>(null);
  const [guiding, setGuiding] = useState(false);
  const [rated, setRated] = useState(false);

  /** Avis rapide du client sur la sélection. */
  const rate = (value: Feedback) => {
    recordFeedback(value);
    setRated(true);
  };

  // Enregistrer le diagnostic dans l'historique + les statistiques
  // locales (sauf lors de la relecture d'une entrée d'historique).
  useEffect(() => {
    if (fromHistory) return;
    saveToHistory({
      answers,
      code,
      lang,
      top3: top3.map(({ id, name }) => ({ id, name })),
    });
    recordStat(answers, top3.map((p) => p.id), lang);
  }, [answers, code, lang, top3, fromHistory]);

  /** Copie la sélection au format texte (presse-papiers). */
  const copySelection = async () => {
    const lines = [
      "Diagnostic Olfactif Parfumarium",
      "",
      t.ui.copyMain,
      ...top3.map((p, i) => `${i + 1}. ${p.id} — ${p.name} (${p.family})`),
      "",
      t.ui.copyExtras,
      ...extras.map((p) => `- ${p.id} — ${p.name}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers indisponible : rien de bloquant.
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl px-5 pb-14 pt-6">
      <p className="text-[0.6875rem] font-semibold tracking-[0.3em] text-gold-dark uppercase">{t.ui.resultKicker}</p>
      <h2 className="mt-2 font-serif text-3xl text-ink">{t.ui.resultTitle}</h2>
      <div className="mt-4">
        <AgentBubble message={t.agent.resultIntro} compact />
      </div>

      {/* Profil olfactif nommé */}
      <section className="animate-fade-up mt-6 overflow-hidden rounded-3xl border border-gold/50 bg-gradient-to-b from-paper to-cream p-6 text-center shadow-[var(--shadow-card)]">
        <p className="text-[0.6875rem] font-semibold tracking-[0.3em] text-gold-dark uppercase">
          {t.ui.profileKicker}
        </p>
        <p className="text-shimmer mt-3 font-serif text-[2.4rem] leading-[1.05] text-balance">
          {profile.name}
        </p>
        <div className="rule-gold mx-auto mt-4 h-px w-20" />
        <p className="mt-4 text-sm leading-relaxed text-pretty text-ink-soft">{profile.sentence}</p>
      </section>

      {/* Top 3 */}
      <div className="mt-5 space-y-4">
        {top3.map((p, i) => (
          <MainCard key={p.id} perfume={p} rank={i + 1} onDetails={() => setDetails(p)} />
        ))}
      </div>

      {/* Conseil d'essai olfactif */}
      <button
        onClick={() => setGuiding(true)}
        className="lift mt-4 w-full rounded-2xl border border-dashed border-gold/50 bg-paper/60 px-5 py-3.5 text-sm font-medium text-gold-dark hover:border-gold hover:bg-paper"
      >
        ✻ {t.ui.testGuideButton}
      </button>

      {/* Le mot de Thibault (phrase vendeur) */}
      <Reveal as="section" className="relative mt-8 overflow-hidden rounded-3xl bg-ink p-6 text-cream shadow-[var(--shadow-lift)]">
        {/* Halo doré discret en fond */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl"
        />
        <p className="relative text-[0.6875rem] font-semibold tracking-[0.3em] text-gold-light uppercase">
          {t.ui.agentWord(AGENT.name)}
        </p>
        <p className="relative mt-3 font-serif text-xl leading-relaxed text-pretty italic">
          « {sellerPhrase} »
        </p>
      </Reveal>

      {/* Parfums annexes */}
      {extras.length > 0 && (
        <section className="mt-8">
          <h3 className="font-serif text-2xl text-ink">{t.ui.extrasTitle}</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {extras.map((p, i) => (
              <Reveal key={p.id} index={i}>
                <button
                  onClick={() => setDetails(p)}
                  className="lift w-full rounded-2xl border border-line bg-paper px-4 py-3.5 text-left shadow-[var(--shadow-card)] hover:border-gold"
                >
                  <p className="font-medium text-ink">
                    <span className="text-gold-dark">{p.id}</span> — {p.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {p.family} · {t.ui.intensityLabels[p.intensity - 1]}
                  </p>
                </button>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Emporter sa sélection (QR code) — action mise en avant */}
      <button
        onClick={() => setSharing(true)}
        className="lift mt-8 flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-gold to-gold-dark px-6 py-4 text-base font-medium text-white shadow-[var(--shadow-gold)]"
      >
        <span aria-hidden>▣</span> {t.ui.shareButton}
      </button>

      {/* Actions */}
      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
        <button
          onClick={copySelection}
          className="lift flex-1 rounded-full border border-ink/80 px-6 py-3.5 text-base font-medium text-ink hover:border-gold hover:text-gold-dark"
        >
          {copied ? t.ui.copied : t.ui.copy}
        </button>
        <button
          onClick={onRestart}
          className="lift flex-1 rounded-full bg-ink px-6 py-3.5 text-base font-medium text-cream hover:bg-gold-dark"
        >
          {t.ui.newDiagnostic}
        </button>
      </div>
      <button onClick={onHome} className="mt-3 w-full py-2 text-sm text-ink-soft underline-offset-4 hover:underline">
        {t.ui.backHome}
      </button>

      {/* Avis rapide sur la sélection */}
      <div className="mt-8 border-t border-line pt-5 text-center">
        {rated ? (
          <p className="text-sm text-gold-dark">{t.ui.feedbackThanks}</p>
        ) : (
          <>
            <p className="text-sm text-ink-soft">{t.ui.feedbackQuestion}</p>
            <div className="mt-3 flex justify-center gap-3">
              {([
                ["good", "😍"],
                ["ok", "🙂"],
                ["bad", "😕"],
              ] as Array<[Feedback, string]>).map(([value, emoji]) => (
                <button
                  key={value}
                  onClick={() => rate(value)}
                  aria-label={value}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-paper text-xl transition hover:border-gold active:scale-[0.95]"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {sharing && (
        <ShareModal data={{ answers, lang, code }} onClose={() => setSharing(false)} />
      )}
      {details && <PerfumeModal perfume={details} onClose={() => setDetails(null)} />}
      {guiding && <TestGuide onClose={() => setGuiding(false)} />}
    </div>
  );
}
