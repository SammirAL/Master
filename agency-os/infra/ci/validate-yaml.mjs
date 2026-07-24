#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Agency AI OS — Validation des fichiers YAML (contrôle CI)
//
// Rôle : parcourir le monorepo et vérifier que tous les fichiers YAML de
// définitions (agents, workflows, councils, registre MCP) ainsi que le
// docker-compose sont syntaxiquement valides.
//
// Usage :
//   node infra/ci/validate-yaml.mjs             # emplacements par défaut
//   node infra/ci/validate-yaml.mjs --path <d>  # restreint la recherche à <d>
//
// L'option --path sert notamment à pointer un fixture volontairement invalide
// pour vérifier que la CI échoue bien (critère de sortie Phase 0).
//
// Sortie : code 0 si tout est valide, code ≠ 0 dès qu'un fichier est invalide.
// ─────────────────────────────────────────────────────────────────────────────

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, resolve, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

// Racine du repo = deux niveaux au-dessus de ce script (infra/ci/ -> racine).
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");

// Dossiers à ignorer lors du parcours récursif.
const IGNORED_DIRS = new Set(["node_modules", "dist", ".turbo", ".git", "coverage"]);

// Emplacements par défaut scannés en Phase 0 (et au-delà).
// - dossiers de définitions parcourus récursivement s'ils existent ;
// - fichiers isolés explicitement validés.
const DEFAULT_DIRS = [
  "agents/definitions",
  "workflows/definitions",
  "councils/definitions",
  "mcp/registry",
];
const DEFAULT_FILES = ["infra/docker-compose.yml"];

const YAML_EXTENSIONS = [".yaml", ".yml"];

/** Vrai si le chemin se termine par une extension YAML. */
function isYamlFile(path) {
  return YAML_EXTENSIONS.some((ext) => path.toLowerCase().endsWith(ext));
}

/**
 * Parcourt récursivement un dossier et renvoie la liste des fichiers YAML.
 * Robuste : ignore silencieusement les entrées illisibles.
 */
function collectYamlFiles(dir, acc) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    // Dossier inexistant ou inaccessible : on ignore (0 fichier = OK).
    return acc;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      collectYamlFiles(join(dir, entry.name), acc);
    } else if (entry.isFile() && isYamlFile(entry.name)) {
      acc.push(join(dir, entry.name));
    }
  }
  return acc;
}

/** Construit la liste des fichiers à valider selon les arguments CLI. */
function resolveTargets() {
  const args = process.argv.slice(2);
  const pathIndex = args.indexOf("--path");

  // Mode --path : on ne scanne que le dossier (ou fichier) fourni.
  if (pathIndex !== -1) {
    const target = args[pathIndex + 1];
    if (!target) {
      console.error("Erreur : l'option --path attend un chemin.");
      process.exit(2);
    }
    const absolute = resolve(process.cwd(), target);
    if (!existsSync(absolute)) {
      console.error(`Erreur : chemin introuvable : ${absolute}`);
      process.exit(2);
    }
    const stat = statSync(absolute);
    if (stat.isDirectory()) {
      return collectYamlFiles(absolute, []);
    }
    return isYamlFile(absolute) ? [absolute] : [];
  }

  // Mode par défaut : dossiers de définitions + fichiers isolés.
  const files = [];
  for (const dir of DEFAULT_DIRS) {
    collectYamlFiles(join(REPO_ROOT, dir), files);
  }
  for (const file of DEFAULT_FILES) {
    const absolute = join(REPO_ROOT, file);
    if (existsSync(absolute) && isYamlFile(absolute)) {
      files.push(absolute);
    }
  }
  return files;
}

function main() {
  const files = resolveTargets();

  if (files.length === 0) {
    // En Phase 0, aucun fichier de définition n'existe encore : ce n'est pas
    // une erreur.
    console.log("Aucun fichier YAML à valider (0 fichier).");
    process.exit(0);
  }

  let invalid = 0;
  for (const file of files) {
    const label = relative(REPO_ROOT, file) || file;
    try {
      const content = readFileSync(file, "utf8");
      YAML.parse(content); // lève une exception si le YAML est invalide
      console.log(`  ✓ ${label}`);
    } catch (error) {
      invalid += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ ${label}`);
      console.error(`      ${message}`);
    }
  }

  if (invalid > 0) {
    console.error(`\n${invalid} fichier(s) YAML invalide(s) sur ${files.length}.`);
    process.exit(1);
  }

  console.log(`\n${files.length} fichiers YAML valides.`);
  process.exit(0);
}

main();
