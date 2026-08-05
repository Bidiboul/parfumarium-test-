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
import Composing from "./components/Composing";
import Results from "./components/Results";
import Equivalence from "./components/Equivalence";
import QuickCode from "./components/QuickCode";
import Search from "./components/Search";
import History from "./components/History";
import Stats from "./components/Stats";
import SellerGate from "./components/SellerGate";
import { useIdleTimer } from "./hooks/useIdleTimer";
import { useScreenTransition } from "./hooks/useScreenTransition";
import { readSharedDiagnostic, clearShareParam } from "./utils/share";
import type { Answers } from "./utils/recommendation";
import type { HistoryEntry } from "./utils/history";

type Screen =
  | "home"
  | "quiz"
  | "composing"
  | "results"
  | "equivalence"
  | "code"
  | "search"
  | "history"
  | "stats";

interface ResultState {
  answers: Answers;
  code?: string;
  fromHistory?: boolean;
}

/** Langue par défaut rétablie à la réinitialisation kiosque. */
const DEFAULT_LANG = "fr" as const;

function AppContent() {
  const { setLang } = useI18n();
  const [screen, setScreenState] = useState<Screen>("home");
  const [result, setResult] = useState<ResultState | null>(null);
  /** Espace vendeur déverrouillé (jusqu'au prochain retour kiosque). */
  const [sellerUnlocked, setSellerUnlocked] = useState(false);
  /** Écran vendeur demandé, en attente de saisie du code. */
  const [pendingScreen, setPendingScreen] = useState<Screen | null>(null);

  // Chaque changement d'écran passe par une transition de vue : le
  // navigateur assure un fondu croisé fluide entre les deux états.
  const withTransition = useScreenTransition();
  const setScreen = (target: Screen) => withTransition(() => setScreenState(target));

  /** Ouvre un écran vendeur, en demandant le code si nécessaire. */
  const openSellerScreen = (target: Screen) => {
    if (sellerUnlocked) return setScreen(target);
    withTransition(() => setPendingScreen(target));
  };

  const showResults = (state: ResultState) => {
    withTransition(() => {
      setResult(state);
      setScreenState("results");
    });
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
    setPendingScreen(null);
    // Re-verrouiller l'espace vendeur : la borne redevient publique.
    setSellerUnlocked(false);
    setLang(DEFAULT_LANG);
  };
  useIdleTimer(returnToHome, screen !== "home" || pendingScreen !== null);

  // Saisie du code vendeur avant d'ouvrir un écran réservé.
  if (pendingScreen) {
    return (
      <div className="min-h-dvh bg-cream">
        <SellerGate
          onUnlock={() =>
            withTransition(() => {
              setSellerUnlocked(true);
              setScreenState(pendingScreen);
              setPendingScreen(null);
            })
          }
          onBack={() => withTransition(() => setPendingScreen(null))}
        />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-cream">
      {/* En-tête discret : masqué sur l'accueil et pendant la composition,
          pour ne pas casser la mise en scène. */}
      {screen !== "home" && screen !== "composing" && (
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
          onEquivalence={() => setScreen("equivalence")}
          onQuickCode={() => openSellerScreen("code")}
          onSearch={() => openSellerScreen("search")}
          onHistory={() => openSellerScreen("history")}
          onStats={() => openSellerScreen("stats")}
        />
      )}

      {screen === "equivalence" && <Equivalence onBack={() => setScreen("home")} />}

      {screen === "quiz" && (
        <Questionnaire
          // Le diagnostic passe par l'instant de composition : la
          // révélation des trois parfums n'en est que plus attendue.
          onFinish={(answers) =>
            withTransition(() => {
              setResult({ answers });
              setScreenState("composing");
            })
          }
          onQuit={() => setScreen("home")}
        />
      )}

      {screen === "composing" && <Composing onDone={() => setScreen("results")} />}

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
