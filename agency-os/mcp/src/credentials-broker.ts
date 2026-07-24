import type { McpServer } from '@agency-os/shared';
import type { CredentialsBroker, McpCallContext } from './ports.js';

/**
 * Broker de secrets basé sur les variables d'environnement (dev). Les serveurs
 * à clé globale (Firecrawl, Exa, Brave) lisent une variable unique ; les
 * serveurs par site/client (Google, WordPress, Shopify, Stripe) seront servis
 * par le coffre (Vault) aux phases ultérieures.
 *
 * INVARIANT : les secrets ne sont JAMAIS renvoyés à l'agent/LLM ni journalisés.
 * Ils ne quittent le broker que vers le connecteur, via `ConnectorCallContext.secrets`.
 */
const ENV_KEYS: Partial<Record<McpServer, Record<string, string>>> = {
  firecrawl: { apiKey: 'FIRECRAWL_API_KEY' },
  exa: { apiKey: 'EXA_API_KEY' },
  'brave-search': { apiKey: 'BRAVE_SEARCH_API_KEY' },
};

export class EnvCredentialsBroker implements CredentialsBroker {
  constructor(private readonly env: NodeJS.ProcessEnv = process.env) {}

  async get(server: McpServer, _ctx: McpCallContext): Promise<Record<string, string>> {
    const mapping = ENV_KEYS[server];
    if (!mapping) return {}; // serveur sans secret global (ou géré par le coffre)
    const secrets: Record<string, string> = {};
    for (const [name, envVar] of Object.entries(mapping)) {
      const value = this.env[envVar];
      if (value) secrets[name] = value;
    }
    return secrets;
  }
}

/** Broker à secrets explicites (tests) — aucune lecture d'environnement. */
export class StaticCredentialsBroker implements CredentialsBroker {
  constructor(private readonly bySecret: Partial<Record<McpServer, Record<string, string>>> = {}) {}
  async get(server: McpServer): Promise<Record<string, string>> {
    return { ...(this.bySecret[server] ?? {}) };
  }
}
