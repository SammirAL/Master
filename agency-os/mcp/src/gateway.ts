import {
  nowIso,
  McpAllowlistViolationError,
  PermissionDeniedError,
  NotFoundError,
  DomainError,
  type McpServer,
} from '@agency-os/shared';
import { grantedCapabilities } from './permission-matrix.js';
import { runScopeGuards } from './scopes.js';
import { redactArgs } from './audit-log.js';
import type {
  McpConnector,
  McpCallContext,
  McpAuditSink,
  CredentialsBroker,
  QuotaGuard,
} from './ports.js';

export interface McpGatewayDeps {
  audit: McpAuditSink;
  credentials: CredentialsBroker;
  quota: QuotaGuard;
  now?: () => string;
}

/**
 * Passerelle MCP : point de passage UNIQUE et obligatoire entre un agent et le
 * monde extérieur. Applique, dans l'ordre : matrice de permissions (P3) →
 * validation L3 → portées fines → quotas → injection des secrets → exécution →
 * audit (P5). Toute violation est journalisée puis levée.
 * cf. docs/01-architecture.md §9.
 */
export class McpGateway {
  private readonly connectors = new Map<McpServer, McpConnector>();
  private readonly now: () => string;

  constructor(private readonly deps: McpGatewayDeps) {
    this.now = deps.now ?? nowIso;
  }

  register(connector: McpConnector): this {
    this.connectors.set(connector.server, connector);
    return this;
  }

  has(server: McpServer): boolean {
    return this.connectors.has(server);
  }

  /** Appelle une méthode d'un serveur MCP au nom d'un agent, sous contrôle complet. */
  async call(
    agent: string,
    server: McpServer,
    method: string,
    args: Record<string, unknown>,
    ctx: McpCallContext = {},
  ): Promise<unknown> {
    const connector = this.connectors.get(server);
    if (!connector) {
      throw new NotFoundError(`Aucun connecteur enregistré pour le serveur MCP « ${server} ».`, { server });
    }
    const spec = connector.methods[method];
    if (!spec) {
      throw new NotFoundError(`Méthode inconnue « ${method} » sur le serveur « ${server} ».`, { server, method });
    }

    // 1. Matrice de permissions (P3).
    const caps = grantedCapabilities(agent, server);
    if (!caps || !caps.has(spec.capability)) {
      await this.violation(agent, server, method, args, ctx, 'allowlist', {
        required: spec.capability,
        granted: caps ? [...caps] : null,
      });
      throw new McpAllowlistViolationError(
        `Accès refusé : l'agent « ${agent} » n'a pas la capacité « ${spec.capability} » sur « ${server} ».`,
        { agent, server, method, required: spec.capability },
      );
    }

    // 2. Action de production (L3) : exige une Decision d'approbation.
    if (spec.capability === 'produce' && !ctx.validated) {
      await this.violation(agent, server, method, args, ctx, 'l3_not_validated', {});
      throw new PermissionDeniedError(
        `Action L3 « ${server}.${method} » refusée : aucune validation CEO (Decision) attachée.`,
        { agent, server, method },
      );
    }

    // 3. Portées fines.
    try {
      runScopeGuards(spec.scopeGuards, { agent, server, method, args, ctx });
    } catch (err) {
      await this.violation(agent, server, method, args, ctx, 'scope', {
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }

    // 4. Quotas.
    try {
      this.deps.quota.check(agent, ctx.siteId ?? null, ctx.taskId ?? null);
    } catch (err) {
      await this.violation(agent, server, method, args, ctx, 'quota', {
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }

    // 5. Injection des secrets (jamais audités ni exposés).
    const secrets = await this.deps.credentials.get(server, ctx);

    // 6. Exécution + audit du succès.
    const startedAt = Date.now();
    try {
      const result = await connector.call(method, args, { ...ctx, secrets });
      await this.deps.audit.record({
        at: this.now(),
        kind: 'mcp_call',
        actor: agent,
        taskId: ctx.taskId ?? null,
        server,
        method,
        argsSummary: redactArgs(args),
        result: summarize(result),
        durationMs: Date.now() - startedAt,
      });
      return result;
    } catch (err) {
      await this.deps.audit.record({
        at: this.now(),
        kind: 'mcp_call',
        actor: agent,
        taskId: ctx.taskId ?? null,
        server,
        method,
        argsSummary: redactArgs(args),
        result: `error: ${err instanceof Error ? err.message : String(err)}`.slice(0, 300),
        durationMs: Date.now() - startedAt,
        detail: { failed: true, code: err instanceof DomainError ? err.code : undefined },
      });
      throw err;
    }
  }

  /** Renvoie un appelant lié à un agent et un contexte (pour le runtime). */
  forAgent(agent: string, ctx: McpCallContext = {}) {
    return {
      call: (server: McpServer, method: string, args: Record<string, unknown> = {}): Promise<unknown> =>
        this.call(agent, server, method, args, ctx),
    };
  }

  async close(): Promise<void> {
    for (const connector of this.connectors.values()) {
      await connector.close?.();
    }
  }

  private async violation(
    agent: string,
    server: McpServer,
    method: string,
    args: Record<string, unknown>,
    ctx: McpCallContext,
    reason: string,
    detail: Record<string, unknown>,
  ): Promise<void> {
    await this.deps.audit.record({
      at: this.now(),
      kind: 'violation',
      actor: agent,
      taskId: ctx.taskId ?? null,
      server,
      method,
      argsSummary: redactArgs(args),
      result: null,
      durationMs: null,
      detail: { reason, ...detail },
    });
  }
}

function summarize(result: unknown): string {
  try {
    const s = typeof result === 'string' ? result : JSON.stringify(result);
    return s.length > 300 ? `${s.slice(0, 297)}…` : s;
  } catch {
    return '«unserializable»';
  }
}
