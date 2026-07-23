/*
 * Partage d'une sélection via un lien profond.
 *
 * Les réponses du diagnostic (et la langue) sont encodées dans l'URL,
 * de sorte qu'un client qui scanne le QR code rouvre exactement sa
 * sélection sur son téléphone, puis peut commander sur parfumarium.fr.
 *
 * Aucun serveur : tout est contenu dans le lien lui-même.
 */

import type { Answers } from "./recommendation";
import type { Lang } from "../i18n/types";

/** Encode une chaîne UTF-8 en base64url (compatible URL). */
const toBase64Url = (input: string): string =>
  btoa(unescape(encodeURIComponent(input)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

/** Décode une chaîne base64url en UTF-8. */
const fromBase64Url = (input: string): string => {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(padded)));
};

export interface SharedDiagnostic {
  answers: Answers;
  lang?: Lang;
  code?: string;
}

/** Construit l'URL profonde qui rouvre la sélection (QR code, partage…). */
export function buildShareUrl(data: SharedDiagnostic): string {
  const payload = toBase64Url(JSON.stringify(data));
  const { origin, pathname } = window.location;
  return `${origin}${pathname}?d=${payload}`;
}

/**
 * Lit un éventuel diagnostic partagé dans l'URL courante.
 * Retourne null si l'URL ne contient pas de sélection valide.
 */
export function readSharedDiagnostic(): SharedDiagnostic | null {
  try {
    const payload = new URLSearchParams(window.location.search).get("d");
    if (!payload) return null;
    const data = JSON.parse(fromBase64Url(payload)) as SharedDiagnostic;
    // Validation minimale : les champs obligatoires des réponses.
    if (!data?.answers?.genderTarget || !data.answers.mainFamily) return null;
    return data;
  } catch {
    return null;
  }
}

/** Nettoie l'URL (retire le paramètre de partage) sans recharger la page. */
export function clearShareParam(): void {
  try {
    const { origin, pathname } = window.location;
    window.history.replaceState(null, "", `${origin}${pathname}`);
  } catch {
    // Ignoré (environnement sans history).
  }
}
