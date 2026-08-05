/*
 * Construction de l'index des références externes.
 *
 * Transforme un classeur de références de parfums (marque, nom, notes,
 * accords, année) en un fichier compact chargé par l'application :
 * public/fragrance-index.json
 *
 * Usage :
 *   node scripts/build-fragrance-index.mjs <fichier.xlsx>
 *
 * Le classeur doit contenir les colonnes :
 *   brand | perfume | launch_year | main_accords | notes
 * où `main_accords` et `notes` sont des tableaux JSON de chaînes.
 *
 * ⚠️ Provenance des données : ce script ne fournit aucune donnée. La
 * base utilisée doit être une source dont la boutique détient les
 * droits d'usage (voir la section « Base de références » du README).
 *
 * Format de sortie (indexé pour rester compact) :
 *   canon   : jetons canoniques partagés avec le catalogue boutique
 *   notes   : libellés français des notes ; noteCanon donne le jeton
 *   accords : libellés français des accords ; accordCanon idem
 *   brands  : marques
 *   items   : [marqueId, nom, année, [notesId], [accordsId]]
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";
import { NOTES, ACCORDS, canonOf, frenchLabel } from "./fragrance-vocabulary.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(here, "../public/fragrance-index.json");

const source = process.argv[2];
if (!source) {
  console.error("Usage : node scripts/build-fragrance-index.mjs <fichier.xlsx>");
  process.exit(1);
}

/** Parse une cellule contenant un tableau JSON ; tolère les valeurs vides. */
const parseList = (value) => {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

/* ------------------------------------------------------------------ */
/* Lecture                                                             */
/* ------------------------------------------------------------------ */
const workbook = XLSX.readFile(source);
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
console.log(`Lignes lues : ${rows.length}`);

/* ------------------------------------------------------------------ */
/* Tables d'index                                                      */
/* ------------------------------------------------------------------ */
const canonList = [];
const canonIndex = new Map();
const canonId = (token) => {
  if (token == null) return -1;
  if (!canonIndex.has(token)) {
    canonIndex.set(token, canonList.length);
    canonList.push(token);
  }
  return canonIndex.get(token);
};

/** Fabrique un indexeur de termes (notes ou accords). */
const makeTermIndex = (table) => {
  const labels = [];
  const canons = [];
  const index = new Map();
  return {
    labels,
    canons,
    id(term) {
      const key = clean(term).toLowerCase();
      if (!key) return -1;
      if (!index.has(key)) {
        index.set(key, labels.length);
        labels.push(frenchLabel(key, table));
        canons.push(canonId(canonOf(key, table)));
      }
      return index.get(key);
    },
  };
};

const noteIndex = makeTermIndex(NOTES);
const accordIndex = makeTermIndex(ACCORDS);

const brands = [];
const brandIndex = new Map();
const brandId = (name) => {
  if (!brandIndex.has(name)) {
    brandIndex.set(name, brands.length);
    brands.push(name);
  }
  return brandIndex.get(name);
};

/* ------------------------------------------------------------------ */
/* Construction des entrées                                            */
/* ------------------------------------------------------------------ */
const items = [];
const seen = new Set();
let skippedEmpty = 0;
let skippedDuplicate = 0;

for (const row of rows) {
  const brand = clean(row.brand);
  const name = clean(row.perfume);
  if (!brand || !name) {
    skippedEmpty += 1;
    continue;
  }

  const key = `${brand}|${name}`.toLowerCase();
  if (seen.has(key)) {
    skippedDuplicate += 1;
    continue;
  }

  const noteIds = [...new Set(parseList(row.notes).map((n) => noteIndex.id(n)))].filter((i) => i >= 0);
  const accordIds = [...new Set(parseList(row.main_accords).map((a) => accordIndex.id(a)))].filter(
    (i) => i >= 0
  );

  // Sans le moindre descripteur olfactif, la référence ne permet aucun
  // rapprochement : elle n'a pas sa place dans l'index.
  if (noteIds.length === 0 && accordIds.length === 0) {
    skippedEmpty += 1;
    continue;
  }

  seen.add(key);
  const year = Number.parseInt(row.launch_year, 10);
  items.push([brandId(brand), name, Number.isFinite(year) ? year : 0, noteIds, accordIds]);
}

/* ------------------------------------------------------------------ */
/* Écriture                                                            */
/* ------------------------------------------------------------------ */
const payload = {
  version: 1,
  generated: new Date().toISOString().slice(0, 10),
  canon: canonList,
  notes: noteIndex.labels,
  noteCanon: noteIndex.canons,
  accords: accordIndex.labels,
  accordCanon: accordIndex.canons,
  brands,
  items,
};

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(payload));

const withNotes = items.filter((i) => i[3].length > 0).length;
const unmappedNotes = noteIndex.canons.filter((c) => c < 0).length;

console.log(`Références retenues : ${items.length}`);
console.log(`  dont notes détaillées : ${withNotes}`);
console.log(`Marques : ${brands.length}`);
console.log(`Notes distinctes : ${noteIndex.labels.length} (sans jeton : ${unmappedNotes})`);
console.log(`Accords distincts : ${accordIndex.labels.length}`);
console.log(`Jetons canoniques : ${canonList.length}`);
console.log(`Ignorées — vides : ${skippedEmpty}, doublons : ${skippedDuplicate}`);
console.log(`Écrit : ${OUTPUT} (${(readFileSync(OUTPUT).length / 1024 / 1024).toFixed(2)} Mo)`);
