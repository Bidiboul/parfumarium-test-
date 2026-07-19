/*
 * Diagnostic Olfactif Parfumarium — navigation entre les écrans.
 * Pas de routeur : un simple état « screen » suffit pour cette app boutique.
 */

import { useState } from "react";
import { I18nProvider } from "./i18n";
import Home from "./components/Home";
import Questionnaire from "./components/Questionnaire";
import Results from "./components/Results";
import QuickCode from "./components/QuickCode";
import Search from "./components/Search";
import History from "./components/History";
import type { Answers } from "./utils/recommendation";
import type { HistoryEntry } from "./utils/history";

type Screen = "home" | "quiz" | "results" | "code" | "search" | "history";

interface ResultState {
  answers: Answers;
  code?: string;
  fromHistory?: boolean;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [result, setResult] = useState<ResultState | null>(null);

  const showResults = (state: ResultState) => {
    setResult(state);
    setScreen("results");
  };

  const openHistoryEntry = (entry: HistoryEntry) =>
    showResults({ answers: entry.answers, code: entry.code, fromHistory: true });

  return (
    <I18nProvider>
    <div className="min-h-dvh bg-cream">
      {/* En-tête discret sur tous les écrans sauf l'accueil */}
      {screen !== "home" && (
        <header className="mx-auto flex w-full max-w-xl items-center justify-center px-5 pt-5">
          <button
            onClick={() => setScreen("home")}
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
    </div>
    </I18nProvider>
  );
}
