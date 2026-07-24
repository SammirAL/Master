/**
 * @agency-os/backend — composition root : câblage DI, orchestrateur, workers.
 */
export { loadConfig, type BackendConfig, type WiringMode } from './config.js';
export {
  createWiring,
  createMemoryWiring,
  createPostgresWiring,
  type Wiring,
} from './container.js';
export { bootstrap } from './main.js';
