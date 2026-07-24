import type { McpServer } from '@agency-os/shared';
import type { ConnectorCallContext, McpConnector, McpMethodSpec } from '../ports.js';

/**
 * Connecteur « stub » : déclare les méthodes et leurs capacités (pour que
 * l'enforcement de la passerelle soit complet dès la phase 2) mais n'exécute
 * pas d'appel réel — il retourne une réponse simulée. Chaque connecteur réel
 * (Firecrawl, filesystem…) remplacera son stub au fil des phases.
 */
export function defineStubConnector(
  server: McpServer,
  methods: Record<string, McpMethodSpec>,
): McpConnector {
  return {
    server,
    methods,
    async call(method: string, args: Record<string, unknown>, _ctx: ConnectorCallContext) {
      return { stub: true, server, method, echo: args };
    },
  };
}
