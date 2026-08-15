/*
 * Recherche par équivalence (parcours client, traduit).
 *
 * Le client indique le parfum qu'il porte déjà ; l'application affiche
 * la référence Parfumarium correspondante, ses notes olfactives et des
 * pistes complémentaires.
 *
 * Deux niveaux, volontairement distingués à l'écran :
 *  1. les correspondances officielles du catalogue (champ `match`),
 *     qui font foi ;
 *  2. à défaut, la référence la plus proche calculée à partir de
 *     l'index des dizaines de milliers de parfums de marque.
 */

import { useEffect, useMemo, useState } from "react";
import AgentBubble from "./AgentBubble";
import PerfumeModal from "./PerfumeModal";
import Reveal from "./Reveal";
import { useI18n, getDescription } from "../i18n";
import { entryFormat, money } from "../data/shop";
import {
  searchEquivalences,
  findAlternatives,
  type Equivalence as OfficialMatch,
} from "../utils/equivalence";
import {
  loadIndex,
  searchReferences,
  matchReference,
  referenceCount,
  listHouses,
  referencesOfHouse,
  type Reference,
  type ReferenceMatch,
  type House,
} from "../utils/fragranceIndex";
import type { Perfume } from "../data/perfumes";
import BackButton from "./BackButton";

interface EquivalenceProps {
  onBack: () => void;
}

/** Quelques parfums connus proposés comme point de départ. */
const EXAMPLES = ["Sauvage", "Black Opium", "Baccarat", "Santal 33", "La Vie est Belle"];

/** Résultat de recherche unifié : officiel ou issu de l'index. */
type Hit =
  | { kind: "official"; official: OfficialMatch }
  | { kind: "indexed"; reference: Reference };

/** Vignette d'un parfum boutique, cliquable pour ouvrir sa fiche. */
function ShopChip({ perfume, onOpen }: { perfume: Perfume; onOpen: () => void }) {
  const { t } = useI18n();
  return (
    <button
      onClick={onOpen}
      className="lift w-full rounded-2xl border border-line bg-paper px-4 py-3.5 text-left shadow-[var(--shadow-card)] hover:border-gold"
    >
      <p className="font-medium text-ink">
        <span className="text-gold-dark">{perfume.id}</span> — {perfume.name}
      </p>
      <p className="mt-0.5 text-xs text-ink-soft">
        {perfume.family} · {t.ui.intensityLabels[perfume.intensity - 1]}
      </p>
    </button>
  );
}

export default function Equivalence({ onBack }: EquivalenceProps) {
  const { lang, t } = useI18n();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Hit | null>(null);
  const [details, setDetails] = useState<Perfume | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  /** Parcours par maison : null = navigation par recherche. */
  const [houseQuery, setHouseQuery] = useState<string | null>(null);
  const [house, setHouse] = useState<House | null>(null);

  // L'index complet est volumineux : il n'est chargé qu'en arrivant sur
  // cet écran, une seule fois, et reste ensuite disponible hors-ligne.
  useEffect(() => {
    let active = true;
    loadIndex()
      .then(() => active && setReady(true))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, []);

  /** Correspondances officielles d'abord, puis le reste de l'index. */
  const hits = useMemo<Hit[]>(() => {
    if (query.trim().length < 2) return [];

    const official = searchEquivalences(query, 6);
    const officialNames = new Set(official.map((o) => o.brandName.toLowerCase()));

    const indexed = ready
      ? searchReferences(query, 14)
          .filter((r) => !officialNames.has(r.name.toLowerCase()))
          .slice(0, 10)
      : [];

    return [
      ...official.map((o): Hit => ({ kind: "official", official: o })),
      ...indexed.map((r): Hit => ({ kind: "indexed", reference: r })),
    ];
  }, [query, ready]);

  /** Rapprochement calculé, uniquement pour les références de l'index. */
  const match = useMemo<ReferenceMatch | null>(
    () => (selected?.kind === "indexed" ? matchReference(selected.reference) : null),
    [selected]
  );

  const updateQuery = (value: string) => {
    setQuery(value);
    setSelected(null);
  };

  /** Maisons affichées et parfums de la maison ouverte. */
  const houses = useMemo(
    () => (houseQuery !== null && ready ? listHouses(houseQuery) : []),
    [houseQuery, ready]
  );
  const houseReferences = useMemo(
    () => (house ? referencesOfHouse(house.id) : []),
    [house]
  );

  /** Quitte le parcours par maison et revient à la recherche libre. */
  const closeHouses = () => {
    setHouseQuery(null);
    setHouse(null);
    setSelected(null);
  };

  /* -------------------------------------------------------------- */
  /* Bloc de résultat                                                */
  /* -------------------------------------------------------------- */
  const renderSelection = () => {
    if (!selected) return null;

    // Cas 1 : correspondance officielle du catalogue.
    if (selected.kind === "official") {
      const { perfume, brandName, house } = selected.official;
      return (
        <>
          <Reveal
            as="section"
            className="mt-6 rounded-3xl border border-gold/50 bg-gradient-to-b from-paper to-cream p-6 shadow-[var(--shadow-card)]"
          >
            <p className="text-[0.6875rem] font-semibold tracking-[0.3em] text-gold-dark uppercase">
              {t.ui.equivalenceResult}
            </p>
            <p className="mt-3 text-sm text-ink-soft">
              {brandName}
              {house && ` — ${house}`}
            </p>
            <p aria-hidden className="my-1 text-center text-2xl text-gold">
              ↓
            </p>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-serif text-3xl leading-tight text-ink">
                <span className="text-gold-dark">{perfume.id}</span> — {perfume.name}
              </h3>
              <span className="shrink-0 rounded-full border border-line bg-cream px-3 py-1 text-right">
                <span className="block text-[0.5625rem] leading-none text-ink-soft">{t.ui.priceFrom}</span>
                <span className="block font-serif text-lg leading-tight text-ink">
                  {money(entryFormat().price, lang)}
                </span>
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {perfume.family} · {t.ui.intensityLabels[perfume.intensity - 1]}
            </p>
            {perfume.inStock === false && (
              <p className="mt-2 inline-block rounded-full bg-gold-light px-3 py-1 text-xs font-medium text-gold-dark">
                {t.ui.outOfStock}
              </p>
            )}
            <p className="mt-3 text-sm leading-relaxed text-ink">
              {getDescription(perfume, lang)}
            </p>
            <button
              onClick={() => setDetails(perfume)}
              className="lift mt-5 w-full rounded-full border border-ink/80 px-6 py-3 text-sm font-medium text-ink hover:border-gold hover:text-gold-dark"
            >
              {t.ui.detailsButton}
            </button>
          </Reveal>
          {renderAlternatives(findAlternatives(perfume, 3))}
        </>
      );
    }

    // Cas 2 : référence de l'index, rapprochement calculé.
    const reference = selected.reference;
    return (
      <>
        {/* Fiche de la référence : ses notes olfactives */}
        <Reveal as="section" className="mt-6 rounded-3xl border border-line bg-paper p-5 shadow-[var(--shadow-card)]">
          <p className="text-[0.6875rem] font-semibold tracking-[0.3em] text-ink-soft/70 uppercase">
            {t.ui.referenceKicker}
          </p>
          <h3 className="mt-2 font-serif text-2xl leading-tight text-ink">{reference.name}</h3>
          <p className="mt-0.5 text-sm text-ink-soft">
            {reference.brand}
            {reference.year > 0 && ` · ${reference.year}`}
          </p>

          {reference.accords.length > 0 && (
            <div className="mt-4">
              <p className="text-[0.6875rem] font-semibold tracking-[0.2em] text-gold-dark uppercase">
                {t.ui.accordsTitle}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {reference.accords.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-gold-light bg-cream px-2.5 py-0.5 text-xs text-gold-dark capitalize"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {reference.notes.length > 0 && (
            <div className="mt-4">
              <p className="text-[0.6875rem] font-semibold tracking-[0.2em] text-gold-dark uppercase">
                {t.ui.notesTitle}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {reference.notes.map((n) => (
                  <span
                    key={n}
                    className="rounded-full border border-line bg-cream px-3 py-1 text-sm text-ink capitalize"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Reveal>

        {/* Le parfum boutique le plus proche */}
        {match ? (
          <>
            <Reveal
              as="section"
              className="mt-4 rounded-3xl border border-gold/50 bg-gradient-to-b from-paper to-cream p-6 shadow-[var(--shadow-card)]"
            >
              <p className="text-[0.6875rem] font-semibold tracking-[0.3em] text-gold-dark uppercase">
                {t.ui.closestMatch}
              </p>
              <div className="mt-3 flex items-start justify-between gap-3">
                <h3 className="font-serif text-3xl leading-tight text-ink">
                  <span className="text-gold-dark">{match.best.id}</span> — {match.best.name}
                </h3>
                <span className="shrink-0 rounded-full border border-line bg-cream px-3 py-1 text-right">
                  <span className="block text-[0.5625rem] leading-none text-ink-soft">{t.ui.priceFrom}</span>
                  <span className="block font-serif text-lg leading-tight text-ink">
                    {money(entryFormat().price, lang)}
                  </span>
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                {match.best.family} · {t.ui.intensityLabels[match.best.intensity - 1]}
              </p>
              {match.best.inStock === false && (
                <p className="mt-2 inline-block rounded-full bg-gold-light px-3 py-1 text-xs font-medium text-gold-dark">
                  {t.ui.outOfStock}
                </p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-ink">
                {getDescription(match.best, lang)}
              </p>
              <button
                onClick={() => setDetails(match.best)}
                className="lift mt-5 w-full rounded-full border border-ink/80 px-6 py-3 text-sm font-medium text-ink hover:border-gold hover:text-gold-dark"
              >
                {t.ui.detailsButton}
              </button>
            </Reveal>
            {renderAlternatives(match.alternatives)}
          </>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-soft">
            {t.ui.noMatch}
          </p>
        )}
      </>
    );
  };

  const renderAlternatives = (list: Perfume[]) =>
    list.length > 0 ? (
      <section className="mt-8">
        <h3 className="font-serif text-2xl text-ink">{t.ui.equivalenceAlternatives}</h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {list.map((p, i) => (
            <Reveal key={p.id} index={i}>
              <ShopChip perfume={p} onOpen={() => setDetails(p)} />
            </Reveal>
          ))}
        </div>
      </section>
    ) : null;

  /* -------------------------------------------------------------- */
  /* Parcours par maison                                             */
  /* -------------------------------------------------------------- */
  if (houseQuery !== null && !selected) {
    return (
      <div className="animate-fade-up mx-auto w-full max-w-xl px-5 pb-14 pt-6">
        <BackButton onClick={house ? () => setHouse(null) : closeHouses} />

        <p className="mt-6 text-[0.6875rem] font-semibold tracking-[0.3em] text-gold-dark uppercase">
          {t.ui.equivalenceKicker}
        </p>
        <h2 className="mt-2 font-serif text-3xl leading-tight text-ink">
          {house ? house.name : t.ui.housesTitle}
        </h2>

        {/* Choix de la maison */}
        {!house && (
          <>
            <input
              value={houseQuery}
              onChange={(e) => setHouseQuery(e.target.value)}
              placeholder={t.ui.housesSearch}
              aria-label={t.ui.housesSearch}
              autoFocus
              className="mt-5 w-full rounded-2xl border border-line bg-paper px-5 py-4 text-lg text-ink shadow-[var(--shadow-card)] outline-none transition focus:border-gold"
            />
            <div className="mt-4 space-y-2">
              {houses.map((h, i) => (
                <Reveal key={h.id} index={Math.min(i, 5)}>
                  <button
                    onClick={() => setHouse(h)}
                    className="lift flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3.5 text-left shadow-[var(--shadow-card)] hover:border-gold"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {/* Point doré : maison dont nous avons des équivalences */}
                      {h.featured && (
                        <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      )}
                      <span className="truncate font-medium text-ink">{h.name}</span>
                    </span>
                    <span className="shrink-0 text-xs text-ink-soft">
                      {t.ui.housesCount(h.count)}
                    </span>
                  </button>
                </Reveal>
              ))}
              {houses.length === 0 && (
                <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-soft">
                  {ready ? t.ui.equivalenceEmpty : t.ui.indexLoading}
                </p>
              )}
            </div>
          </>
        )}

        {/* Parfums de la maison choisie */}
        {house && (
          <div className="mt-5 space-y-2">
            <p className="text-xs text-ink-soft">{t.ui.housesCount(house.count)}</p>
            {houseReferences.map((reference, i) => (
              <Reveal key={reference.id} index={Math.min(i, 5)}>
                <button
                  onClick={() => setSelected({ kind: "indexed", reference })}
                  className="lift flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3.5 text-left shadow-[var(--shadow-card)] hover:border-gold"
                >
                  <span className="min-w-0">
                    <span className="block font-medium text-ink">{reference.name}</span>
                    {reference.year > 0 && (
                      <span className="block text-xs text-ink-soft">{reference.year}</span>
                    )}
                  </span>
                  <span aria-hidden className="shrink-0 text-lg text-ink-soft/60">
                    →
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* -------------------------------------------------------------- */
  return (
    <div className="animate-fade-up mx-auto w-full max-w-xl px-5 pb-14 pt-6">
      <BackButton onClick={houseQuery !== null ? closeHouses : onBack} />

      <p className="mt-6 text-[0.6875rem] font-semibold tracking-[0.3em] text-gold-dark uppercase">
        {t.ui.equivalenceKicker}
      </p>
      <h2 className="mt-2 font-serif text-3xl leading-tight text-balance text-ink">
        {t.ui.equivalenceTitle}
      </h2>
      <div className="mt-4">
        <AgentBubble message={t.ui.equivalenceHint} compact />
      </div>

      <input
        value={query}
        onChange={(e) => updateQuery(e.target.value)}
        placeholder={t.ui.equivalencePlaceholder}
        aria-label={t.ui.equivalenceTitle}
        autoFocus
        className="mt-5 w-full rounded-2xl border border-line bg-paper px-5 py-4 text-lg text-ink shadow-[var(--shadow-card)] outline-none transition focus:border-gold"
      />

      {/* État du chargement de l'index */}
      {query.trim().length < 2 && (
        <p className="mt-3 text-xs text-ink-soft/80">
          {failed
            ? t.ui.indexUnavailable
            : ready
              ? t.ui.indexReady(referenceCount().toLocaleString("fr-FR"))
              : t.ui.indexLoading}
        </p>
      )}

      {/* Le client se souvient de la marque mais pas du nom */}
      {query.trim().length < 2 && ready && (
        <button
          onClick={() => setHouseQuery("")}
          className="lift mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-5 py-3.5 text-left shadow-[var(--shadow-card)] hover:border-gold"
        >
          <span className="font-medium text-ink">{t.ui.housesButton}</span>
          <span aria-hidden className="text-lg text-gold">
            →
          </span>
        </button>
      )}

      {/* Suggestions de départ */}
      {query.trim().length < 2 && (
        <div className="mt-4">
          <p className="text-xs text-ink-soft">{t.ui.equivalenceExamples}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => updateQuery(example)}
                className="lift rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink hover:border-gold hover:text-gold-dark"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Liste des correspondances */}
      {!selected && query.trim().length >= 2 && (
        <div className="mt-5 space-y-2">
          {hits.map((hit, i) => {
            const isOfficial = hit.kind === "official";
            const title = isOfficial ? hit.official.brandName : hit.reference.name;
            const subtitle = isOfficial ? hit.official.house : hit.reference.brand;
            return (
              <Reveal key={`${hit.kind}-${i}`} index={Math.min(i, 5)}>
                <button
                  onClick={() => setSelected(hit)}
                  className="lift flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3.5 text-left shadow-[var(--shadow-card)] hover:border-gold"
                >
                  <span className="min-w-0">
                    <span className="block font-medium text-ink">{title}</span>
                    {subtitle && <span className="block text-xs text-ink-soft">{subtitle}</span>}
                  </span>
                  {isOfficial ? (
                    <span className="shrink-0 font-serif text-xl text-gold-dark">
                      n° {hit.official.perfume.id}
                    </span>
                  ) : (
                    <span aria-hidden className="shrink-0 text-lg text-ink-soft/60">
                      →
                    </span>
                  )}
                </button>
              </Reveal>
            );
          })}

          {hits.length === 0 && (
            <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-ink-soft">
              {ready ? t.ui.equivalenceEmpty : t.ui.indexLoading}
            </p>
          )}
        </div>
      )}

      {renderSelection()}

      {details && <PerfumeModal perfume={details} onClose={() => setDetails(null)} />}
    </div>
  );
}
