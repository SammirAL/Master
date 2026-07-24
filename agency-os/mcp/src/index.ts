/**
 * @agency-os/mcp — passerelle MCP : point de passage unique et obligatoire
 * entre les agents et le monde extérieur (permissions, portées, quotas, audit,
 * secrets). cf. docs/01-architecture.md §9.
 */
export * from './capabilities.js';
export * from './ports.js';
export {
  PERMISSION_MATRIX,
  grantedCapabilities,
  cellCode,
} from './permission-matrix.js';
export { SCOPE_GUARDS, runScopeGuards } from './scopes.js';
export { InMemoryQuotaGuard, type QuotaConfig } from './quotas.js';
export {
  InMemoryAuditSink,
  DrizzleAuditSink,
  redactArgs,
} from './audit-log.js';
export {
  EnvCredentialsBroker,
  StaticCredentialsBroker,
} from './credentials-broker.js';
export { McpGateway, type McpGatewayDeps } from './gateway.js';
export {
  createDefaultConnectors,
  FirecrawlConnector,
  FilesystemConnector,
  createGithubConnector,
  defineStubConnector,
} from './connectors/index.js';
