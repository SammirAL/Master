#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Agency AI OS — Détection des dépendances circulaires entre packages (CI)
//
// Rôle : lire pnpm-workspace.yaml, construire le graphe des dépendances
// INTERNES (packages @agency-os/*) et vérifier qu'aucun cycle n'existe.
//
// Usage :
//   node infra/ci/check-circular-deps.mjs
//
// Sortie : code 0 si le graphe est acyclique, code ≠ 0 si un cycle est détecté.
// ─────────────────────────────────────────────────────────────────────────────

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");

const INTERNAL_SCOPE = "@agency-os/";

/**
 * Étend un motif de pnpm-workspace.yaml en une liste de dossiers de packages.
 * Prend en charge les chemins littéraux (« shared ») et le glob simple de fin
 * de segment (« packages/* »). Ignore les motifs d'exclusion (« !... »).
 */
function expandPattern(pattern) {
  if (pattern.startsWith("!")) return []; // exclusion : hors périmètre ici

  // Glob simple : « base/* » -> sous-dossiers directs de « base ».
  if (pattern.endsWith("/*")) {
    const base = join(REPO_ROOT, pattern.slice(0, -2));
    if (!existsSync(base)) return [];
    try {
      return readdirSync(base, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => join(base, entry.name));
    } catch {
      return [];
    }
  }

  // Chemin littéral.
  const dir = join(REPO_ROOT, pattern);
  return existsSync(dir) && statSync(dir).isDirectory() ? [dir] : [];
}

/** Lit le nom et les dépendances internes d'un package (robuste). */
function readPackage(dir) {
  const manifestPath = join(dir, "package.json");
  if (!existsSync(manifestPath)) return null;

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Avertissement : package.json illisible dans ${dir} (${message}).`);
    return null;
  }

  if (!manifest.name) return null;

  // Fusion des trois champs de dépendances, filtré au scope interne.
  const allDeps = {
    ...(manifest.dependencies ?? {}),
    ...(manifest.devDependencies ?? {}),
    ...(manifest.peerDependencies ?? {}),
  };
  const internalDeps = Object.keys(allDeps).filter((name) =>
    name.startsWith(INTERNAL_SCOPE),
  );

  return { name: manifest.name, deps: internalDeps };
}

/** Construit le graphe { nomPackage -> [dépendances internes présentes] }. */
function buildGraph() {
  const workspacePath = join(REPO_ROOT, "pnpm-workspace.yaml");
  if (!existsSync(workspacePath)) {
    console.error("Erreur : pnpm-workspace.yaml introuvable.");
    process.exit(2);
  }

  let workspace;
  try {
    workspace = YAML.parse(readFileSync(workspacePath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Erreur : pnpm-workspace.yaml invalide (${message}).`);
    process.exit(2);
  }

  const patterns = Array.isArray(workspace?.packages) ? workspace.packages : [];

  // Résolution des packages présents sur disque.
  const packages = new Map(); // name -> deps[]
  for (const pattern of patterns) {
    for (const dir of expandPattern(pattern)) {
      const pkg = readPackage(dir);
      if (pkg) packages.set(pkg.name, pkg.deps);
    }
  }

  // On ne garde que les arêtes pointant vers un package réellement présent.
  const graph = new Map();
  for (const [name, deps] of packages) {
    graph.set(
      name,
      deps.filter((dep) => packages.has(dep)),
    );
  }
  return graph;
}

/**
 * Détecte un cycle par DFS avec pile de visite. Renvoie la chaîne du premier
 * cycle trouvé (ex. ["a", "b", "a"]) ou null.
 */
function findCycle(graph) {
  const WHITE = 0, // non visité
    GRAY = 1, // en cours d'exploration (dans la pile)
    BLACK = 2; // terminé
  const color = new Map();
  for (const name of graph.keys()) color.set(name, WHITE);

  const stack = [];

  function visit(node) {
    color.set(node, GRAY);
    stack.push(node);

    for (const next of graph.get(node) ?? []) {
      if (color.get(next) === GRAY) {
        // Cycle : on reconstruit la chaîne depuis la 1re occurrence de `next`.
        const start = stack.indexOf(next);
        return [...stack.slice(start), next];
      }
      if (color.get(next) === WHITE) {
        const found = visit(next);
        if (found) return found;
      }
    }

    stack.pop();
    color.set(node, BLACK);
    return null;
  }

  for (const name of graph.keys()) {
    if (color.get(name) === WHITE) {
      const cycle = visit(name);
      if (cycle) return cycle;
    }
  }
  return null;
}

function main() {
  const graph = buildGraph();

  if (graph.size === 0) {
    console.log("Aucun package interne détecté (rien à vérifier).");
    process.exit(0);
  }

  const cycle = findCycle(graph);
  if (cycle) {
    console.error("Dépendance circulaire détectée entre packages :");
    console.error(`  ${cycle.join(" -> ")}`);
    process.exit(1);
  }

  console.log(
    `Aucune dépendance circulaire entre packages (${graph.size} package(s) analysé(s)).`,
  );
  process.exit(0);
}

main();
