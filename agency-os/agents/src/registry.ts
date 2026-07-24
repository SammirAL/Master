import { parse as parseYaml } from 'yaml';
import { agentDefinition, NotFoundError, type AgentDefinition } from '@agency-os/shared';

/**
 * Registre des définitions d'agents. Ajouter un agent = enregistrer une
 * définition validée (config, pas de code). cf. docs/01-architecture.md §6.1.
 */
export class AgentRegistry {
  private readonly defs = new Map<string, AgentDefinition>();

  /** Enregistre (et valide) une définition d'agent. */
  register(def: unknown): AgentDefinition {
    const parsed = agentDefinition.parse(def);
    this.defs.set(parsed.slug, parsed);
    return parsed;
  }

  get(slug: string): AgentDefinition {
    const def = this.defs.get(slug);
    if (!def) throw new NotFoundError(`Définition d'agent introuvable : ${slug}`, { slug });
    return def;
  }

  has(slug: string): boolean {
    return this.defs.has(slug);
  }

  all(): AgentDefinition[] {
    return [...this.defs.values()];
  }

  /** Construit un registre à partir d'un ensemble de définitions. */
  static fromDefinitions(defs: unknown[]): AgentRegistry {
    const registry = new AgentRegistry();
    for (const def of defs) registry.register(def);
    return registry;
  }
}

/** Parse et valide une définition d'agent au format YAML (contenu du fichier). */
export function parseAgentDefinition(yamlContent: string): AgentDefinition {
  return agentDefinition.parse(parseYaml(yamlContent));
}
