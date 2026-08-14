/*
 * Fenêtre de partage : affiche un QR code que le client scanne pour
 * emporter sa sélection sur son téléphone et commander sur parfumarium.fr.
 */

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useI18n } from "../i18n";
import { buildShareUrl, type SharedDiagnostic } from "../utils/share";

interface ShareModalProps {
  data: SharedDiagnostic;
  onClose: () => void;
}

export default function ShareModal({ data, onClose }: ShareModalProps) {
  const { t } = useI18n();
  const [qr, setQr] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const url = buildShareUrl(data);

  // Générer le QR code (image data-URL) aux couleurs Parfumarium.
  useEffect(() => {
    QRCode.toDataURL(url, {
      margin: 1,
      width: 320,
      color: { dark: "#1c1913", light: "#fffdf8" },
    })
      .then(setQr)
      .catch(() => setQr(""));
  }, [url]);

  // Fermeture à la touche Échap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignoré.
    }
  };

  return (
    <div
      className="animate-backdrop fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-5 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="animate-scale-in w-full max-w-sm rounded-3xl border border-line bg-paper p-6 text-center shadow-[var(--shadow-modal)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[0.6875rem] font-semibold tracking-[0.3em] text-gold-dark uppercase">Parfumarium</p>
        <h3 className="mt-2 font-serif text-2xl text-ink">{t.ui.shareTitle}</h3>

        <div className="mx-auto mt-5 flex h-[240px] w-[240px] items-center justify-center rounded-2xl border border-line bg-white p-3">
          {qr ? (
            <img src={qr} alt="QR code" className="h-full w-full" />
          ) : (
            <span className="text-sm text-ink-soft">…</span>
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{t.ui.shareHint}</p>

        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={copyLink}
            className="rounded-full border border-ink px-6 py-3 text-sm font-medium text-ink transition hover:border-gold hover:text-gold-dark active:scale-[0.98]"
          >
            {copied ? t.ui.copied : t.ui.shareCopyLink}
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-gold-dark active:scale-[0.98]"
          >
            {t.ui.close}
          </button>
        </div>
      </div>
    </div>
  );
}
