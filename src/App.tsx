/*
 * Diagnostic Olfactif Parfumarium — navigation entre les écrans.
 * Pas de routeur : un simple état « screen » suffit pour cette app boutique.
 *
 * Trois comportements transversaux sont gérés ici :
 *  - lecture d'un lien partagé (QR code) au démarrage → sélection directe
 *  - mode kiosque : retour automatique à l'accueil après inactivité
 *  - accès à l'espace vendeur (code, recherche, historique, statistiques)
 */

import { useEffect, useState } from "react";
import { I18nProvider, useI18n } from "./i18n";
import Home from "./components/Home";
import Questionnaire from "./components/Questionnaire";
import Results from "./components/Results";
import QuickCode from "./components/QuickCode";
import Search from "./components/Search";
import History from "./components/History";
import Stats from "./components/Stats";
import { useIdleTimer } from "./hooks/useIdleTimer";
import { readSharedDiagnostic, clearShareParam } from "./utils/share";
import type { Answers } from "./utils/recommendation";
import type { HistoryEntry } from "./utils/history";

type Screen = "home" | "quiz" | "results" | "code" | "search" | "history" | "stats";

interface ResultState {
  answers: Answers;
  code?: string;
  fromHistory?: boolean;
}

/** Langue par défaut rétablie à la réinitialisation kiosque. */
const DEFAULT_LANG = "fr" as const;

function AppContent() {
  const { setLang } = useI18n();
  const [screen, setScreen] = useState<Screen>("home");
  const [result, setResult] = useState<ResultState | null>(null);

  const showResults = (state: ResultState) => {
    setResult(state);
    setScreen("results");
  };

  const openHistoryEntry = (entry: HistoryEntry) =>
    showResults({ answers: entry.answers, code: entry.code, fromHistory: true });

  // Au démarrage : si l'URL contient une sélection partagée (QR code),
  // l'ouvrir directement dans la bonne langue, puis nettoyer l'URL.
  useEffect(() => {
    const shared = readSharedDiagnostic();
    if (shared) {
      if (shared.lang) setLang(shared.lang);
      setResult({ answers: shared.answers, code: shared.code, fromHistory: true });
      setScreen("results");
      clearShareParam();
    }
  }, [setLang]);

  // Mode kiosque : hors de l'accueil, revenir seul à l'accueil après
  // inactivité et rétablir la langue par défaut pour le client suivant.
  const returnToHome = () => {
    setScreen("home");
    setResult(null);
    setLang(DEFAULT_LANG);
  };
  useIdleTimer(returnToHome, screen !== "home");

  return (
    <div className="min-h-dvh bg-cream">
      {/* En-tête discret sur tous les écrans sauf l'accueil */}
      {screen !== "home" && (
        <header className="mx-auto flex w-full max-w-xl items-center justify-center px-5 pt-5">
          <button
            onClick={returnToHome}
            className="font-serif text-lg tracking-[0.2em] text-ink uppercase transition hover:text-gold-dark"
          >
            Parfumarium
          </button>
        </header>
      )}

      {screen === "home" && (
        <Home
          onStart={() => setScreen("quiz")}
          onQuickCode={() => setScreen("code")}
          onSearch={() => setScreen("search")}
          onHistory={() => setScreen("history")}
          onStats={() => setScreen("stats")}
        />
      )}

      {screen === "quiz" && (
        <Questionnaire
          onFinish={(answers) => showResults({ answers })}
          onQuit={() => setScreen("home")}
        />
      )}

      {screen === "results" && result && (
        <Results
          answers={result.answers}
          code={result.code}
          fromHistory={result.fromHistory}
          onRestart={() => setScreen("quiz")}
          onHome={() => setScreen("home")}
        />
      )}

      {screen === "code" && (
        <QuickCode
          onSubmit={(answers, code) => showResults({ answers, code })}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "search" && <Search onBack={() => setScreen("home")} />}

      {screen === "history" && (
        <History onOpen={openHistoryEntry} onBack={() => setScreen("home")} />
      )}

      {screen === "stats" && <Stats onBack={() => setScreen("home")} />}
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
